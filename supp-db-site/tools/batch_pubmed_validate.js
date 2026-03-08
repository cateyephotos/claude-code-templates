/**
 * Batch validate ALL PMIDs against PubMed E-utilities API
 * Uses esummary endpoint for efficient batch lookups (200 at a time)
 *
 * Usage: node supp-db-site/tools/batch_pubmed_validate.js
 *
 * Output: supp-db-site/tools/pubmed_cache.json (all PubMed metadata)
 *         supp-db-site/tools/full_validation_report.json (comparison results)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const AUDIT_FILE = path.join(__dirname, 'citation_audit.json');
const CACHE_FILE = path.join(__dirname, 'pubmed_cache.json');
const REPORT_FILE = path.join(__dirname, 'full_validation_report.json');

const BATCH_SIZE = 200;
const DELAY_BETWEEN_BATCHES = 400; // ms - NCBI rate limit: 3 requests/sec without API key

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch PubMed metadata for a batch of PMIDs using esummary API
 */
function fetchPubMedBatch(pmids) {
    return new Promise((resolve, reject) => {
        const idList = pmids.join(',');
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList}&retmode=json`;

        https.get(url, { timeout: 30000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(new Error(`JSON parse error: ${e.message}`));
                }
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Parse PubMed esummary response into a clean metadata object
 */
function parsePubMedResult(result) {
    if (!result || result.error) {
        return null;
    }

    const authors = (result.authors || []).map(a => a.name);
    const firstAuthor = authors.length > 0 ? authors[0] : null;

    // Extract DOI from article IDs
    let doi = null;
    if (result.articleids) {
        const doiEntry = result.articleids.find(id => id.idtype === 'doi');
        if (doiEntry) doi = doiEntry.value;
    }

    // Extract year from pubdate or sortpubdate
    let year = null;
    if (result.pubdate) {
        const yearMatch = result.pubdate.match(/(\d{4})/);
        if (yearMatch) year = parseInt(yearMatch[1]);
    }
    if (!year && result.sortpubdate) {
        const yearMatch = result.sortpubdate.match(/(\d{4})/);
        if (yearMatch) year = parseInt(yearMatch[1]);
    }

    return {
        pmid: result.uid,
        title: result.title || null,
        authors: authors,
        firstAuthor: firstAuthor,
        journal: result.fulljournalname || result.source || null,
        journalAbbrev: result.source || null,
        year: year,
        doi: doi,
        pubdate: result.pubdate || null,
        volume: result.volume || null,
        issue: result.issue || null,
        pages: result.pages || null
    };
}

/**
 * Compute string similarity (Dice coefficient)
 */
function similarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    if (s1 === s2) return 1.0;
    if (s1.length < 2 || s2.length < 2) return 0;

    const bigrams1 = new Set();
    for (let i = 0; i < s1.length - 1; i++) bigrams1.add(s1.substring(i, i + 2));

    let matches = 0;
    for (let i = 0; i < s2.length - 1; i++) {
        if (bigrams1.has(s2.substring(i, i + 2))) matches++;
    }

    return (2.0 * matches) / (s1.length - 1 + s2.length - 1);
}

/**
 * Compare a citation against PubMed metadata
 */
function compareCitation(citation, pubmed) {
    const issues = [];
    let isMatch = true;

    // Title/Claim comparison
    if (citation.title && pubmed.title) {
        // Clean both titles for comparison
        const cleanExpected = citation.title
            .replace(/\\u[\dA-Fa-f]{4}/g, '') // remove unicode escapes
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();

        const cleanActual = pubmed.title
            .replace(/<\/?[^>]+>/g, '') // remove HTML tags
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim();

        const titleSim = similarity(cleanExpected, cleanActual);
        if (titleSim < 0.75) {
            issues.push({
                type: 'title_mismatch',
                severity: titleSim < 0.5 ? 'high' : 'medium',
                expected: citation.title.substring(0, 100),
                actual: pubmed.title.substring(0, 100),
                similarity: Math.round(titleSim * 100) / 100
            });
            isMatch = false;
        }
    }

    // DOI comparison (if both have it)
    if (citation.doi && pubmed.doi) {
        const expectedDoi = citation.doi.toLowerCase().trim();
        const actualDoi = pubmed.doi.toLowerCase().trim();
        if (expectedDoi !== actualDoi) {
            issues.push({
                type: 'doi_mismatch',
                severity: 'high',
                expected: citation.doi,
                actual: pubmed.doi
            });
            isMatch = false;
        }
    }

    // Year comparison
    if (citation.year && pubmed.year) {
        if (Math.abs(citation.year - pubmed.year) > 1) {
            issues.push({
                type: 'year_mismatch',
                severity: 'medium',
                expected: citation.year,
                actual: pubmed.year
            });
            isMatch = false;
        }
    }

    // Journal comparison (if both have it)
    if (citation.journal && pubmed.journal) {
        const journalSim = Math.max(
            similarity(citation.journal, pubmed.journal),
            similarity(citation.journal, pubmed.journalAbbrev || '')
        );
        if (journalSim < 0.4) {
            issues.push({
                type: 'journal_mismatch',
                severity: 'low',
                expected: citation.journal,
                actual: pubmed.journal,
                similarity: Math.round(journalSim * 100) / 100
            });
        }
    }

    // Missing DOI check (PubMed has it but file doesn't)
    if (!citation.doi && pubmed.doi) {
        issues.push({
            type: 'missing_doi',
            severity: 'info',
            pubmedDoi: pubmed.doi
        });
    }

    return {
        isMatch,
        issues
    };
}

async function main() {
    console.log('Loading citation audit data...');
    const auditData = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));

    // Collect all unique PMIDs
    const allPmids = new Set();
    for (const supp of auditData.supplements) {
        for (const c of supp.citations) {
            if (c.pmid) allPmids.add(c.pmid);
        }
    }

    const pmidArray = [...allPmids].sort((a, b) => parseInt(a) - parseInt(b));
    console.log(`Total unique PMIDs to validate: ${pmidArray.length}`);

    // Check for existing cache
    let pubmedCache = {};
    if (fs.existsSync(CACHE_FILE)) {
        try {
            pubmedCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
            const cachedCount = Object.keys(pubmedCache).length;
            console.log(`Found existing cache with ${cachedCount} PMIDs`);
        } catch (e) {
            console.log('Cache file corrupt, starting fresh');
            pubmedCache = {};
        }
    }

    // Determine which PMIDs still need fetching
    const needFetch = pmidArray.filter(p => !pubmedCache[p]);
    console.log(`PMIDs already cached: ${pmidArray.length - needFetch.length}`);
    console.log(`PMIDs to fetch: ${needFetch.length}`);

    if (needFetch.length > 0) {
        // Batch fetch from PubMed
        const batches = [];
        for (let i = 0; i < needFetch.length; i += BATCH_SIZE) {
            batches.push(needFetch.slice(i, i + BATCH_SIZE));
        }

        console.log(`Fetching in ${batches.length} batches of up to ${BATCH_SIZE}...`);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`  Batch ${i + 1}/${batches.length}: ${batch.length} PMIDs...`);

            try {
                const response = await fetchPubMedBatch(batch);

                if (response.result) {
                    const uids = response.result.uids || [];
                    for (const uid of uids) {
                        const parsed = parsePubMedResult(response.result[uid]);
                        if (parsed) {
                            pubmedCache[uid] = parsed;
                        }
                    }
                    console.log(`    Fetched ${uids.length} results`);
                } else {
                    console.log(`    WARNING: No results in response`);
                }
            } catch (e) {
                console.error(`    ERROR on batch ${i + 1}: ${e.message}`);
                // Retry once after longer delay
                await sleep(2000);
                try {
                    const response = await fetchPubMedBatch(batch);
                    if (response.result) {
                        const uids = response.result.uids || [];
                        for (const uid of uids) {
                            const parsed = parsePubMedResult(response.result[uid]);
                            if (parsed) {
                                pubmedCache[uid] = parsed;
                            }
                        }
                        console.log(`    Retry successful: ${uids.length} results`);
                    }
                } catch (e2) {
                    console.error(`    RETRY FAILED: ${e2.message}`);
                }
            }

            // Rate limiting
            if (i < batches.length - 1) {
                await sleep(DELAY_BETWEEN_BATCHES);
            }
        }

        // Save updated cache
        fs.writeFileSync(CACHE_FILE, JSON.stringify(pubmedCache, null, 2));
        console.log(`Cache saved: ${Object.keys(pubmedCache).length} total PMIDs`);
    }

    // === VALIDATION PHASE ===
    console.log('\n=== RUNNING VALIDATION ===');

    const report = {
        validationDate: new Date().toISOString(),
        summary: {
            totalSupplements: auditData.supplements.length,
            totalCitations: 0,
            validatedAgainstPubMed: 0,
            notFoundInPubMed: 0,
            perfectMatches: 0,
            issuesFound: 0,
            highSeverityIssues: 0,
            mediumSeverityIssues: 0,
            missingDois: 0,
            byIssueType: {}
        },
        supplements: [],
        allIssues: []
    };

    for (const supp of auditData.supplements) {
        const suppResult = {
            file: supp.file,
            supplementName: supp.supplementName,
            supplementId: supp.supplementId,
            totalCitations: supp.totalCitations,
            validated: 0,
            notFound: 0,
            perfect: 0,
            issues: []
        };

        for (const citation of supp.citations) {
            report.summary.totalCitations++;

            if (!citation.pmid) continue;

            const pubmed = pubmedCache[citation.pmid];
            if (!pubmed) {
                suppResult.notFound++;
                report.summary.notFoundInPubMed++;
                continue;
            }

            suppResult.validated++;
            report.summary.validatedAgainstPubMed++;

            const comparison = compareCitation(citation, pubmed);

            if (comparison.isMatch && comparison.issues.filter(i => i.severity !== 'info').length === 0) {
                suppResult.perfect++;
                report.summary.perfectMatches++;
            }

            for (const issue of comparison.issues) {
                const issueRecord = {
                    supplement: supp.supplementName,
                    file: supp.file,
                    pmid: citation.pmid,
                    ...issue
                };

                if (issue.severity === 'high') report.summary.highSeverityIssues++;
                if (issue.severity === 'medium') report.summary.mediumSeverityIssues++;
                if (issue.type === 'missing_doi') report.summary.missingDois++;

                report.summary.byIssueType[issue.type] = (report.summary.byIssueType[issue.type] || 0) + 1;

                suppResult.issues.push(issueRecord);
                if (issue.severity !== 'info') {
                    report.allIssues.push(issueRecord);
                }
            }
        }

        report.supplements.push(suppResult);
    }

    report.summary.issuesFound = report.allIssues.length;

    // Save report
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n=== FULL VALIDATION REPORT ===');
    console.log(`Total supplements: ${report.summary.totalSupplements}`);
    console.log(`Total citations: ${report.summary.totalCitations}`);
    console.log(`Validated against PubMed: ${report.summary.validatedAgainstPubMed}`);
    console.log(`Not found in PubMed: ${report.summary.notFoundInPubMed}`);
    console.log(`Perfect matches: ${report.summary.perfectMatches}`);
    console.log(`Issues found: ${report.summary.issuesFound}`);
    console.log(`  High severity: ${report.summary.highSeverityIssues}`);
    console.log(`  Medium severity: ${report.summary.mediumSeverityIssues}`);
    console.log(`  Missing DOIs (info): ${report.summary.missingDois}`);
    console.log();

    if (report.summary.byIssueType) {
        console.log('Issues by type:');
        for (const [type, count] of Object.entries(report.summary.byIssueType)) {
            console.log(`  ${type}: ${count}`);
        }
    }

    // Print supplements with issues
    console.log('\n=== SUPPLEMENTS WITH ISSUES ===');
    for (const supp of report.supplements) {
        const realIssues = supp.issues.filter(i => i.severity !== 'info');
        if (realIssues.length > 0) {
            console.log(`\n${supp.supplementName} (${supp.file}): ${realIssues.length} issues`);
            for (const issue of realIssues) {
                console.log(`  [${issue.severity}] PMID ${issue.pmid}: ${issue.type}`);
                if (issue.expected) console.log(`    Expected: ${issue.expected}`);
                if (issue.actual) console.log(`    Actual:   ${issue.actual}`);
                if (issue.similarity !== undefined) console.log(`    Similarity: ${issue.similarity}`);
            }
        }
    }

    console.log('\nDone! Full report saved to:', REPORT_FILE);
}

main().catch(console.error);
