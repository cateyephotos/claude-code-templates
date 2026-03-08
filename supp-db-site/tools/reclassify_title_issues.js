/**
 * Reclassify the 92 "title fix" entries from refined_issues.json
 *
 * Problem: Many entries classified as "title needs fixing" are actually WRONG PMIDs.
 * When a file has the correct title but wrong PMID, and no DOI to cross-check,
 * the validator sees "title doesn't match PubMed for this PMID" and wrongly
 * classifies it as a title fix instead of a PMID fix.
 *
 * Classification logic:
 * 1. If the PubMed title is about a completely different topic/field -> WRONG PMID
 * 2. If the PubMed title is similar but has formatting differences -> REAL TITLE FIX
 * 3. If there's a DOI in the file that matches PubMed -> REAL TITLE FIX (safe)
 * 4. If titles have very low similarity (<0.3) -> WRONG PMID
 *
 * Also searches PubMed by DOI (if available) to find the correct PMID.
 *
 * Usage: node supp-db-site/tools/reclassify_title_issues.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ISSUES_FILE = path.join(__dirname, 'refined_issues.json');
const CACHE_FILE = path.join(__dirname, 'pubmed_cache.json');
const OUTPUT_FILE = path.join(__dirname, 'reclassified_issues.json');
const CITATIONS_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Compute Dice coefficient string similarity
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
 * Extract DOI from a file near a specific PMID
 */
function extractDoiNearPmid(content, pmid) {
    const pmidPos = content.indexOf(pmid);
    if (pmidPos === -1) return null;

    const searchStart = Math.max(0, pmidPos - 500);
    const searchEnd = Math.min(content.length, pmidPos + 500);
    const block = content.substring(searchStart, searchEnd);

    const doiMatch = block.match(/"?doi"?\s*:\s*"([^"]+)"/);
    return doiMatch ? doiMatch[1] : null;
}

/**
 * Search PubMed by DOI to find the correct PMID
 */
function searchPubMedByDoi(doi) {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(`${doi}[doi]`);
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json`;

        https.get(url, { timeout: 15000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const ids = json.esearchresult?.idlist || [];
                    resolve(ids.length > 0 ? ids[0] : null);
                } catch (e) {
                    reject(e);
                }
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Search PubMed by title to find the correct PMID
 */
function searchPubMedByTitle(title) {
    return new Promise((resolve, reject) => {
        // Use first 100 chars of title for search
        const cleanTitle = title
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 100);
        const query = encodeURIComponent(`${cleanTitle}[title]`);
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json&retmax=5`;

        https.get(url, { timeout: 15000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const ids = json.esearchresult?.idlist || [];
                    resolve(ids);
                } catch (e) {
                    reject(e);
                }
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Fetch PubMed metadata for a single PMID
 */
function fetchPubMedSingle(pmid) {
    return new Promise((resolve, reject) => {
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;

        https.get(url, { timeout: 15000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.result && json.result[pmid]) {
                        const r = json.result[pmid];
                        resolve({
                            pmid: r.uid,
                            title: r.title,
                            doi: (r.articleids || []).find(id => id.idtype === 'doi')?.value || null
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    const issues = JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf8'));
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

    const titleFixes = issues.titleFormat_titleFix;
    console.log(`Reclassifying ${titleFixes.length} title-fix entries...\n`);

    const results = {
        realTitleFixes: [],      // PubMed title is close, just needs updating
        wrongPmids: [],          // PMID points to a completely different paper
        wrongPmidsWithCorrection: [], // Found the correct PMID
        uncertain: []            // Need manual review
    };

    for (let i = 0; i < titleFixes.length; i++) {
        const fix = titleFixes[i];
        const pubmed = cache[fix.pmid];

        if (!pubmed) {
            results.uncertain.push({ ...fix, reason: 'No PubMed data' });
            continue;
        }

        // Clean titles for comparison
        const fileTitle = (fix.expected || '').replace(/<\/?[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        const pubmedTitle = (pubmed.title || '').replace(/<\/?[^>]+>/g, '').replace(/\s+/g, ' ').trim();

        const sim = similarity(fileTitle, pubmedTitle);

        // Check if there's a DOI in the file
        let fileDoi = null;
        try {
            const content = fs.readFileSync(path.join(CITATIONS_DIR, fix.file), 'utf8');
            fileDoi = extractDoiNearPmid(content, fix.pmid);
        } catch (e) {}

        console.log(`[${i + 1}/${titleFixes.length}] PMID ${fix.pmid} (${fix.supplement})`);
        console.log(`  File:   ${fileTitle.substring(0, 70)}...`);
        console.log(`  PubMed: ${pubmedTitle.substring(0, 70)}...`);
        console.log(`  Sim: ${sim.toFixed(3)} | DOI in file: ${fileDoi || 'none'}`);

        if (sim >= 0.6) {
            // Titles are reasonably similar - this IS a real title fix
            // The file has a slightly different version of the same paper's title
            console.log(`  → REAL TITLE FIX (similarity ${sim.toFixed(2)})`);
            results.realTitleFixes.push({
                ...fix,
                similarity: Math.round(sim * 100) / 100,
                fileDoi,
                pubmedTitle: pubmedTitle.substring(0, 120),
                classification: 'real_title_fix'
            });
        } else if (sim < 0.3) {
            // Titles are very different - this is definitely a WRONG PMID
            console.log(`  → WRONG PMID (similarity ${sim.toFixed(2)} - completely different paper)`);

            // Try to find correct PMID by DOI if available
            let correctPmid = null;
            if (fileDoi) {
                try {
                    await sleep(350);
                    correctPmid = await searchPubMedByDoi(fileDoi);
                    if (correctPmid) {
                        console.log(`  → Found correct PMID via DOI: ${correctPmid}`);
                    }
                } catch (e) {
                    console.log(`  → DOI lookup failed: ${e.message}`);
                }
            }

            // If no DOI, try title search
            if (!correctPmid && fileTitle.length > 20) {
                try {
                    await sleep(350);
                    const candidates = await searchPubMedByTitle(fileTitle);
                    if (candidates.length > 0) {
                        // Verify the first candidate matches
                        await sleep(350);
                        const candidateData = await fetchPubMedSingle(candidates[0]);
                        if (candidateData) {
                            const candidateSim = similarity(fileTitle, candidateData.title || '');
                            if (candidateSim > 0.7) {
                                correctPmid = candidates[0];
                                console.log(`  → Found correct PMID via title search: ${correctPmid} (sim: ${candidateSim.toFixed(2)})`);
                            }
                        }
                    }
                } catch (e) {
                    console.log(`  → Title search failed: ${e.message}`);
                }
            }

            if (correctPmid && correctPmid !== fix.pmid) {
                results.wrongPmidsWithCorrection.push({
                    ...fix,
                    similarity: Math.round(sim * 100) / 100,
                    fileDoi,
                    correctPmid,
                    pubmedTitleForWrongPmid: pubmedTitle.substring(0, 120),
                    classification: 'wrong_pmid_correctable'
                });
            } else {
                results.wrongPmids.push({
                    ...fix,
                    similarity: Math.round(sim * 100) / 100,
                    fileDoi,
                    pubmedTitleForWrongPmid: pubmedTitle.substring(0, 120),
                    classification: 'wrong_pmid'
                });
            }
        } else {
            // Mid-range similarity (0.3 - 0.6) - could be either
            // Check if DOI matches PubMed DOI to determine
            let isRealTitleFix = false;

            if (fileDoi && pubmed.doi) {
                if (fileDoi.toLowerCase() === pubmed.doi.toLowerCase()) {
                    // DOI matches - definitely same paper, title just needs updating
                    isRealTitleFix = true;
                    console.log(`  → REAL TITLE FIX (DOI matches, mid-range similarity ${sim.toFixed(2)})`);
                } else {
                    // DOI doesn't match - wrong PMID
                    console.log(`  → WRONG PMID (DOI mismatch, mid-range similarity ${sim.toFixed(2)})`);
                }
            }

            if (isRealTitleFix) {
                results.realTitleFixes.push({
                    ...fix,
                    similarity: Math.round(sim * 100) / 100,
                    fileDoi,
                    pubmedTitle: pubmedTitle.substring(0, 120),
                    classification: 'real_title_fix_doi_confirmed'
                });
            } else {
                // Try to find correct PMID
                let correctPmid = null;
                if (fileDoi) {
                    try {
                        await sleep(350);
                        correctPmid = await searchPubMedByDoi(fileDoi);
                        if (correctPmid && correctPmid !== fix.pmid) {
                            console.log(`  → Found correct PMID via DOI: ${correctPmid}`);
                        }
                    } catch (e) {}
                }

                if (!correctPmid && fileTitle.length > 20) {
                    try {
                        await sleep(350);
                        const candidates = await searchPubMedByTitle(fileTitle);
                        if (candidates.length > 0) {
                            await sleep(350);
                            const candidateData = await fetchPubMedSingle(candidates[0]);
                            if (candidateData) {
                                const candidateSim = similarity(fileTitle, candidateData.title || '');
                                if (candidateSim > 0.6) {
                                    correctPmid = candidates[0];
                                    console.log(`  → Found correct PMID via title: ${correctPmid} (sim: ${candidateSim.toFixed(2)})`);
                                }
                            }
                        }
                    } catch (e) {}
                }

                if (correctPmid && correctPmid !== fix.pmid) {
                    results.wrongPmidsWithCorrection.push({
                        ...fix,
                        similarity: Math.round(sim * 100) / 100,
                        fileDoi,
                        correctPmid,
                        pubmedTitleForWrongPmid: pubmedTitle.substring(0, 120),
                        classification: 'wrong_pmid_correctable'
                    });
                } else {
                    results.uncertain.push({
                        ...fix,
                        similarity: Math.round(sim * 100) / 100,
                        fileDoi,
                        pubmedTitleForWrongPmid: pubmedTitle.substring(0, 120),
                        classification: 'uncertain'
                    });
                }
            }
        }

        console.log('');
    }

    // === SUMMARY ===
    console.log('\n=== RECLASSIFICATION SUMMARY ===');
    console.log(`Real title fixes (safe to apply): ${results.realTitleFixes.length}`);
    console.log(`Wrong PMIDs (with correction found): ${results.wrongPmidsWithCorrection.length}`);
    console.log(`Wrong PMIDs (no correction found): ${results.wrongPmids.length}`);
    console.log(`Uncertain (needs manual review): ${results.uncertain.length}`);
    console.log(`Total: ${results.realTitleFixes.length + results.wrongPmidsWithCorrection.length + results.wrongPmids.length + results.uncertain.length}`);

    // Save results
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${OUTPUT_FILE}`);
}

main().catch(console.error);
