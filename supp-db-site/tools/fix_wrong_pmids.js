/**
 * Fix 247 wrong PMID entries by looking up correct PMIDs via DOI
 *
 * Strategy:
 * 1. Extract DOI from the citation file near the wrong PMID
 * 2. Search PubMed by DOI to find the correct PMID
 * 3. If DOI lookup fails, try title search
 * 4. Replace wrong PMID with correct one
 *
 * Usage: node supp-db-site/tools/fix_wrong_pmids.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CITATIONS_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');
const ISSUES_FILE = path.join(__dirname, 'refined_issues.json');
const CACHE_FILE = path.join(__dirname, 'pubmed_cache.json');
const OUTPUT_FILE = path.join(__dirname, 'wrong_pmid_fixes.json');

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

function extractDoiNearPmid(content, pmid) {
    const pmidPos = content.indexOf(pmid);
    if (pmidPos === -1) return null;

    const searchStart = Math.max(0, pmidPos - 500);
    const searchEnd = Math.min(content.length, pmidPos + 500);
    const block = content.substring(searchStart, searchEnd);

    const doiMatch = block.match(/"?doi"?\s*:\s*"([^"]+)"/);
    return doiMatch ? doiMatch[1] : null;
}

function extractTitleNearPmid(content, pmid) {
    const pmidPos = content.indexOf(pmid);
    if (pmidPos === -1) return null;

    const searchStart = Math.max(0, pmidPos - 500);
    const searchEnd = Math.min(content.length, pmidPos + 500);
    const block = content.substring(searchStart, searchEnd);

    const titleMatch = block.match(/"?title"?\s*:\s*"([^"]+)"/);
    return titleMatch ? titleMatch[1] : null;
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { timeout: 15000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function searchPubMedByDoi(doi) {
    const query = encodeURIComponent(`${doi}[doi]`);
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json`;
    const data = await httpGet(url);
    const json = JSON.parse(data);
    const ids = json.esearchresult?.idlist || [];
    return ids.length > 0 ? ids[0] : null;
}

async function searchPubMedByTitle(title) {
    const cleanTitle = title
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100);
    const query = encodeURIComponent(`${cleanTitle}[title]`);
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json&retmax=5`;
    const data = await httpGet(url);
    const json = JSON.parse(data);
    return json.esearchresult?.idlist || [];
}

async function fetchPubMedSingle(pmid) {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;
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
    return null;
}

async function main() {
    const issues = JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf8'));
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const wrongPmids = issues.titleFormat_wrongPmid;

    console.log(`Processing ${wrongPmids.length} wrong PMID entries...\n`);

    const results = {
        fixed: [],         // Found correct PMID
        notFound: [],      // Could not find correct PMID
        alreadyCorrect: [] // PMID was actually correct (edge case)
    };

    // Track DOI lookups to avoid duplicates
    const doiLookupCache = {};

    for (let i = 0; i < wrongPmids.length; i++) {
        const entry = wrongPmids[i];
        const filePath = path.join(CITATIONS_DIR, entry.file);
        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (e) {
            console.log(`[${i + 1}/${wrongPmids.length}] SKIP: Cannot read ${entry.file}`);
            results.notFound.push({ ...entry, reason: 'file_not_found' });
            continue;
        }

        // Extract DOI from file
        const fileDoi = extractDoiNearPmid(content, entry.pmid);
        const fileTitle = extractTitleNearPmid(content, entry.pmid) || entry.expected || '';

        console.log(`[${i + 1}/${wrongPmids.length}] ${entry.supplement} | PMID ${entry.pmid}`);
        console.log(`  File title: ${fileTitle.substring(0, 70)}...`);
        console.log(`  File DOI: ${fileDoi || 'none'}`);

        let correctPmid = null;

        // Strategy 1: Look up by DOI (most reliable)
        if (fileDoi) {
            if (doiLookupCache[fileDoi]) {
                correctPmid = doiLookupCache[fileDoi];
                console.log(`  → DOI cache hit: ${correctPmid}`);
            } else {
                try {
                    await sleep(350);
                    correctPmid = await searchPubMedByDoi(fileDoi);
                    if (correctPmid) {
                        doiLookupCache[fileDoi] = correctPmid;
                        console.log(`  → DOI lookup found: ${correctPmid}`);
                    }
                } catch (e) {
                    console.log(`  → DOI lookup failed: ${e.message}`);
                }
            }
        }

        // Strategy 2: Search by title if DOI lookup failed
        if (!correctPmid && fileTitle.length > 20) {
            try {
                await sleep(350);
                const candidates = await searchPubMedByTitle(fileTitle);
                if (candidates.length > 0) {
                    // Verify the first candidate title matches
                    await sleep(350);
                    const candidateData = await fetchPubMedSingle(candidates[0]);
                    if (candidateData) {
                        const titleSim = similarity(fileTitle, candidateData.title || '');
                        if (titleSim > 0.6) {
                            correctPmid = candidates[0];
                            console.log(`  → Title search found: ${correctPmid} (sim: ${titleSim.toFixed(2)})`);
                        } else {
                            // Try other candidates
                            for (let c = 1; c < Math.min(candidates.length, 3); c++) {
                                await sleep(350);
                                const altData = await fetchPubMedSingle(candidates[c]);
                                if (altData) {
                                    const altSim = similarity(fileTitle, altData.title || '');
                                    if (altSim > 0.6) {
                                        correctPmid = candidates[c];
                                        console.log(`  → Title search alt found: ${correctPmid} (sim: ${altSim.toFixed(2)})`);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(`  → Title search failed: ${e.message}`);
            }
        }

        if (correctPmid && correctPmid !== entry.pmid) {
            console.log(`  ✓ FIXED: ${entry.pmid} → ${correctPmid}`);
            results.fixed.push({
                ...entry,
                fileDoi,
                fileTitle: fileTitle.substring(0, 120),
                correctPmid
            });
        } else if (correctPmid === entry.pmid) {
            console.log(`  ○ Already correct (DOI/title confirms)`);
            results.alreadyCorrect.push({ ...entry, fileDoi });
        } else {
            console.log(`  ✗ No correction found`);
            results.notFound.push({
                ...entry,
                fileDoi,
                fileTitle: fileTitle.substring(0, 120),
                reason: 'no_match'
            });
        }
        console.log('');
    }

    // === SUMMARY ===
    console.log('\n=== WRONG PMID FIX SUMMARY ===');
    console.log(`Fixed (correct PMID found): ${results.fixed.length}`);
    console.log(`Already correct: ${results.alreadyCorrect.length}`);
    console.log(`Not found: ${results.notFound.length}`);
    console.log(`Total: ${results.fixed.length + results.alreadyCorrect.length + results.notFound.length}`);

    // Save results
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
                console.log(`  SKIP: PMID ${fix.pmid} no longer found in ${fix.file}`);
                continue;
            }

            // Targeted replacement
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
                    console.log(`  ✓ ${fix.supplement} | PMID ${fix.pmid} → ${fix.correctPmid}`);
                    fixLog.push({ type: 'pmid_fix', file: fix.file, oldPmid: fix.pmid, newPmid: fix.correctPmid, doi: fix.fileDoi });
                    fileChanges[fix.file] = (fileChanges[fix.file] || 0) + 1;
                }
            } else {
                console.log(`  SKIP: PMID field not in context for ${fix.pmid} in ${fix.file}`);
            }
        }

        console.log(`\n=== APPLICATION SUMMARY ===`);
        console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLIED'}`);
        console.log(`Total PMID corrections: ${fixLog.length}`);
        console.log(`Files modified: ${Object.keys(fileChanges).length}`);

        for (const [file, count] of Object.entries(fileChanges).sort((a, b) => b[1] - a[1])) {
            console.log(`  ${file}: ${count} changes`);
        }

        // Save application log
        const logPath = path.join(__dirname, 'wrong_pmid_fix_log.json');
        fs.writeFileSync(logPath, JSON.stringify({
            date: new Date().toISOString(),
            mode: isDryRun ? 'dry-run' : 'applied',
            totalFixes: fixLog.length,
            fileChanges,
            fixes: fixLog,
            notFound: results.notFound.length,
            alreadyCorrect: results.alreadyCorrect.length
        }, null, 2));
        console.log(`\nLog saved to: ${logPath}`);
    }
}

main().catch(console.error);
