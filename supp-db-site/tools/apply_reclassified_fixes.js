/**
 * Apply fixes from the reclassified issues:
 * 1. Real title fixes (38): update file titles to match PubMed
 * 2. Wrong PMIDs with corrections (23): replace wrong PMID with correct one
 *
 * Usage: node supp-db-site/tools/apply_reclassified_fixes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const CITATIONS_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');
const RECLASSIFIED_FILE = path.join(__dirname, 'reclassified_issues.json');
const CACHE_FILE = path.join(__dirname, 'pubmed_cache.json');

const isDryRun = process.argv.includes('--dry-run');

function main() {
    const reclassified = JSON.parse(fs.readFileSync(RECLASSIFIED_FILE, 'utf8'));
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

    const fixLog = [];
    const fileChanges = {};

    // === 1. REAL TITLE FIXES ===
    console.log('=== REAL TITLE FIXES ===');
    for (const fix of reclassified.realTitleFixes) {
        const filePath = path.join(CITATIONS_DIR, fix.file);
        let content = fs.readFileSync(filePath, 'utf8');
        const pubmed = cache[fix.pmid];

        if (!pubmed || !pubmed.title) {
            console.log(`  SKIP: No PubMed data for PMID ${fix.pmid}`);
            continue;
        }

        // Clean PubMed title
        const correctTitle = pubmed.title
            .replace(/<\/?[^>]+>/g, '')
            .replace(/\.$/, '')
            .replace(/"/g, '\\"');

        const pmidPos = content.indexOf(fix.pmid);
        if (pmidPos === -1) {
            console.log(`  SKIP: PMID ${fix.pmid} not found in ${fix.file}`);
            continue;
        }

        // Search for title field within ±500 chars of the PMID
        const searchStart = Math.max(0, pmidPos - 500);
        const searchEnd = Math.min(content.length, pmidPos + 500);
        const searchBlock = content.substring(searchStart, searchEnd);

        // Match the title field (handles both quoted and unquoted keys)
        const titleRegex = /("?title"?\s*:\s*")([^"]+)(")/;
        const titleMatch = searchBlock.match(titleRegex);

        if (titleMatch) {
            const oldTitle = titleMatch[2];
            const expectedPrefix = (fix.expected || '').substring(0, 25);

            if (expectedPrefix && oldTitle.substring(0, 25) === expectedPrefix) {
                const newSearchBlock = searchBlock.replace(
                    titleMatch[0],
                    titleMatch[1] + correctTitle + titleMatch[3]
                );
                const newContent = content.substring(0, searchStart) + newSearchBlock + content.substring(searchEnd);

                if (newContent !== content) {
                    if (!isDryRun) {
                        fs.writeFileSync(filePath, newContent, 'utf8');
                    }
                    console.log(`  ✓ ${fix.supplement} | PMID ${fix.pmid}: title updated (sim: ${fix.similarity})`);
                    console.log(`    Old: ${oldTitle.substring(0, 70)}...`);
                    console.log(`    New: ${correctTitle.substring(0, 70)}...`);
                    fixLog.push({ type: 'title_fix', file: fix.file, pmid: fix.pmid, old: oldTitle.substring(0, 80), new: correctTitle.substring(0, 80) });
                    fileChanges[fix.file] = (fileChanges[fix.file] || 0) + 1;
                }
            } else {
                console.log(`  SKIP: Title prefix mismatch for PMID ${fix.pmid} in ${fix.file}`);
            }
        } else {
            console.log(`  SKIP: Title field not found near PMID ${fix.pmid} in ${fix.file}`);
        }
    }

    // === 2. WRONG PMID CORRECTIONS ===
    console.log('\n=== WRONG PMID CORRECTIONS ===');
    for (const fix of reclassified.wrongPmidsWithCorrection) {
        const filePath = path.join(CITATIONS_DIR, fix.file);
        let content = fs.readFileSync(filePath, 'utf8');

        if (!fix.correctPmid || fix.correctPmid === fix.pmid) {
            console.log(`  SKIP: No valid correction for PMID ${fix.pmid}`);
            continue;
        }

        // Find the wrong PMID in the file and replace it
        // We need to be careful to only replace the specific PMID occurrence
        const pmidPos = content.indexOf(fix.pmid);
        if (pmidPos === -1) {
            console.log(`  SKIP: PMID ${fix.pmid} not found in ${fix.file}`);
            continue;
        }

        // Build a targeted replacement - find the pmid field context
        const searchStart = Math.max(0, pmidPos - 30);
        const searchEnd = Math.min(content.length, pmidPos + fix.pmid.length + 5);
        const searchBlock = content.substring(searchStart, searchEnd);

        // Match: "pmid": "12345" or pmid: "12345" or "pmid": 12345
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
                console.log(`    File title: ${(fix.expected || '').substring(0, 70)}...`);
                fixLog.push({ type: 'pmid_fix', file: fix.file, oldPmid: fix.pmid, newPmid: fix.correctPmid });
                fileChanges[fix.file] = (fileChanges[fix.file] || 0) + 1;
            }
        } else {
            console.log(`  SKIP: PMID field not found in context for ${fix.pmid} in ${fix.file}`);
        }
    }

    // === SUMMARY ===
    console.log('\n=== FIX SUMMARY ===');
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLIED'}`);
    console.log(`Total fixes: ${fixLog.length}`);
    console.log(`  Title fixes: ${fixLog.filter(f => f.type === 'title_fix').length}`);
    console.log(`  PMID corrections: ${fixLog.filter(f => f.type === 'pmid_fix').length}`);
    console.log(`Files modified: ${Object.keys(fileChanges).length}`);

    for (const [file, count] of Object.entries(fileChanges)) {
        console.log(`  ${file}: ${count} changes`);
    }

    // Remaining issues
    console.log(`\n=== REMAINING ISSUES ===`);
    console.log(`Wrong PMIDs (no correction found): ${reclassified.wrongPmids.length}`);
    console.log(`Uncertain (needs manual review): ${reclassified.uncertain.length}`);

    // Save fix log
    const logPath = path.join(__dirname, 'reclassified_fix_log.json');
    fs.writeFileSync(logPath, JSON.stringify({
        date: new Date().toISOString(),
        mode: isDryRun ? 'dry-run' : 'applied',
        totalFixes: fixLog.length,
        fileChanges,
        fixes: fixLog,
        remaining: {
            wrongPmidsNoCorrection: reclassified.wrongPmids.length,
            uncertain: reclassified.uncertain.length
        }
    }, null, 2));
    console.log(`\nLog saved to: ${logPath}`);
}

main();
