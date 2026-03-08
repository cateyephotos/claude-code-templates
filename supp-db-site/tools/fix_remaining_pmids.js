/**
 * Second pass: Fix remaining wrong PMIDs identified by DOI mismatch
 * Uses multiple strategies to find correct PMIDs
 *
 * Usage: node supp-db-site/tools/fix_remaining_pmids.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CITATIONS_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');
const REPORT_FILE = path.join(__dirname, 'full_validation_report.json');
const AUDIT_FILE = path.join(__dirname, 'citation_audit.json');
const CACHE_FILE = path.join(__dirname, 'pubmed_cache.json');
const OUTPUT_FILE = path.join(__dirname, 'remaining_pmid_fixes.json');

const isDryRun = process.argv.includes('--dry-run');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

function httpGet(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { timeout: 15000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function searchByDoi(doi) {
    // Strategy 1: Standard DOI search
    const query1 = encodeURIComponent(`${doi}[doi]`);
    const url1 = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query1}&retmode=json`;
    try {
        const data = await httpGet(url1);
        const json = JSON.parse(data);
        const ids = json.esearchresult?.idlist || [];
        if (ids.length > 0) return ids[0];
    } catch (e) {}

    // Strategy 2: Try with cleaned DOI
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '').trim();
    if (cleanDoi !== doi) {
        await sleep(350);
        const query2 = encodeURIComponent(`${cleanDoi}[doi]`);
        const url2 = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query2}&retmode=json`;
        try {
            const data = await httpGet(url2);
            const json = JSON.parse(data);
            const ids = json.esearchresult?.idlist || [];
            if (ids.length > 0) return ids[0];
        } catch (e) {}
    }

    // Strategy 3: Try searching by DOI prefix+suffix (some older DOIs have encoding issues)
    if (doi.includes('/')) {
        await sleep(350);
        const parts = doi.split('/');
        const suffix = parts.slice(1).join('/');
        const query3 = encodeURIComponent(`${suffix}`);
        const url3 = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query3}&retmode=json&retmax=5`;
        try {
            const data = await httpGet(url3);
            const json = JSON.parse(data);
            const ids = json.esearchresult?.idlist || [];
            if (ids.length > 0) return ids[0];
        } catch (e) {}
    }

    return null;
}

async function searchByTitle(title) {
    const cleanTitle = title
        .replace(/<\/?[^>]+>/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 120);

    if (cleanTitle.length < 15) return [];

    const query = encodeURIComponent(`${cleanTitle}[title]`);
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json&retmax=5`;
    try {
        const data = await httpGet(url);
        const json = JSON.parse(data);
        return json.esearchresult?.idlist || [];
    } catch (e) {
        return [];
    }
}

async function fetchPubMed(pmid) {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
    try {
        const data = await httpGet(url);
        const json = JSON.parse(data);
        if (json.result && json.result[pmid]) {
            const r = json.result[pmid];
            return {
                pmid: r.uid,
                title: r.title,
                doi: (r.articleids || []).find(id => id.idtype === 'doi')?.value || null
            };
        }
    } catch (e) {}
    return null;
}

function extractFieldNearPmid(content, pmid, fieldName) {
    const pmidPos = content.indexOf(pmid);
    if (pmidPos === -1) return null;
    const searchStart = Math.max(0, pmidPos - 500);
    const searchEnd = Math.min(content.length, pmidPos + 500);
    const block = content.substring(searchStart, searchEnd);
    const regex = new RegExp(`"?${fieldName}"?\\s*:\\s*"([^"]+)"`);
    const match = block.match(regex);
    return match ? match[1] : null;
}

async function main() {
    const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
    const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

    // Get format type for each PMID
    const pmidFormat = {};
    for (const supp of audit.supplements) {
        for (const cit of supp.citations) {
            pmidFormat[cit.pmid] = cit.format;
        }
    }

    // Find DOI mismatch issues for title-format citations
    const doiMismatches = report.allIssues.filter(i =>
        i.type === 'doi_mismatch' && pmidFormat[i.pmid] !== 'claim-format'
    );

    // Group by PMID to avoid duplicate processing
    const uniquePmids = new Map();
    for (const issue of doiMismatches) {
        if (!uniquePmids.has(issue.pmid)) {
            uniquePmids.set(issue.pmid, issue);
        }
    }

    console.log(`Processing ${uniquePmids.size} remaining wrong PMIDs (${doiMismatches.length} issues)...\n`);

    const results = { fixed: [], notFound: [] };
    const doiCache = {};
    let processed = 0;

    for (const [pmid, issue] of uniquePmids) {
        processed++;
        const filePath = path.join(CITATIONS_DIR, issue.file);
        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (e) {
            results.notFound.push({ pmid, file: issue.file, reason: 'file_error' });
            continue;
        }

        const fileDoi = extractFieldNearPmid(content, pmid, 'doi');
        const fileTitle = extractFieldNearPmid(content, pmid, 'title') || '';

        console.log(`[${processed}/${uniquePmids.size}] ${issue.supplement || issue.file} | PMID ${pmid}`);
        console.log(`  DOI: ${fileDoi || 'none'} | Title: ${fileTitle.substring(0, 60)}...`);

        let correctPmid = null;

        // Strategy 1: DOI lookup with multiple approaches
        if (fileDoi) {
            if (doiCache[fileDoi]) {
                correctPmid = doiCache[fileDoi];
                console.log(`  → Cache: ${correctPmid}`);
            } else {
                await sleep(350);
                correctPmid = await searchByDoi(fileDoi);
                if (correctPmid) {
                    doiCache[fileDoi] = correctPmid;
                    console.log(`  → DOI found: ${correctPmid}`);
                }
            }
        }

        // Strategy 2: Title search
        if (!correctPmid && fileTitle.length > 20) {
            await sleep(350);
            const candidates = await searchByTitle(fileTitle);
            for (const cand of candidates.slice(0, 3)) {
                if (cand === pmid) continue;
                await sleep(350);
                const candData = await fetchPubMed(cand);
                if (candData) {
                    const sim = similarity(fileTitle, candData.title || '');
                    if (sim > 0.6) {
                        correctPmid = cand;
                        console.log(`  → Title match: ${correctPmid} (sim: ${sim.toFixed(2)})`);
                        break;
                    }
                    // Also check DOI match
                    if (fileDoi && candData.doi && fileDoi.toLowerCase() === candData.doi.toLowerCase()) {
                        correctPmid = cand;
                        console.log(`  → DOI confirmed via title search: ${correctPmid}`);
                        break;
                    }
                }
            }
        }

        if (correctPmid && correctPmid !== pmid) {
            console.log(`  ✓ FIXED: ${pmid} → ${correctPmid}`);
            results.fixed.push({ pmid, file: issue.file, supplement: issue.supplement, fileDoi, correctPmid });
        } else {
            console.log(`  ✗ No correction found`);
            results.notFound.push({ pmid, file: issue.file, supplement: issue.supplement, fileDoi, fileTitle: fileTitle.substring(0, 120) });
        }
        console.log('');
    }

    // === SUMMARY ===
    console.log('\n=== SECOND PASS SUMMARY ===');
    console.log(`Fixed: ${results.fixed.length}`);
    console.log(`Not found: ${results.notFound.length}`);
    console.log(`Total: ${results.fixed.length + results.notFound.length}`);

    // Save lookup results
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${OUTPUT_FILE}`);

    // === APPLY FIXES ===
    if (results.fixed.length > 0) {
        console.log(`\n=== APPLYING ${results.fixed.length} PMID CORRECTIONS ===`);
        const fixLog = [];
        const fileChanges = {};

        for (const fix of results.fixed) {
            const filePath = path.join(CITATIONS_DIR, fix.file);
            let content = fs.readFileSync(filePath, 'utf8');

            const pmidPos = content.indexOf(fix.pmid);
            if (pmidPos === -1) {
                console.log(`  SKIP: PMID ${fix.pmid} not found in ${fix.file}`);
                continue;
            }

            const searchStart = Math.max(0, pmidPos - 30);
            const searchEnd = Math.min(content.length, pmidPos + fix.pmid.length + 5);
            const searchBlock = content.substring(searchStart, searchEnd);

            const pmidFieldRegex = new RegExp(`("?pmid"?\\s*:\\s*"?)${fix.pmid}("?)`, 'g');
            const pmidFieldMatch = searchBlock.match(pmidFieldRegex);

            if (pmidFieldMatch) {
                const newSearchBlock = searchBlock.replace(pmidFieldRegex, `$1${fix.correctPmid}$2`);
                const newContent = content.substring(0, searchStart) + newSearchBlock + content.substring(searchEnd);

                if (newContent !== content) {
                    if (!isDryRun) {
                        fs.writeFileSync(filePath, newContent, 'utf8');
                    }
                    console.log(`  ✓ ${fix.supplement || fix.file} | PMID ${fix.pmid} → ${fix.correctPmid}`);
                    fixLog.push({ file: fix.file, oldPmid: fix.pmid, newPmid: fix.correctPmid, doi: fix.fileDoi });
                    fileChanges[fix.file] = (fileChanges[fix.file] || 0) + 1;
                }
            }
        }

        console.log(`\nMode: ${isDryRun ? 'DRY RUN' : 'APPLIED'}`);
        console.log(`Applied: ${fixLog.length}`);
        console.log(`Files: ${Object.keys(fileChanges).length}`);

        const logPath = path.join(__dirname, 'remaining_pmid_fix_log.json');
        fs.writeFileSync(logPath, JSON.stringify({
            date: new Date().toISOString(),
            mode: isDryRun ? 'dry-run' : 'applied',
            totalFixes: fixLog.length,
            fileChanges,
            fixes: fixLog
        }, null, 2));
        console.log(`Log: ${logPath}`);
    }
}

main().catch(console.error);
