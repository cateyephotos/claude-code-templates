/**
 * Apply ONLY safe automated fixes: DOI corrections and year corrections.
 * EXCLUDES title fixes which were found to be dangerous (many are actually wrong PMIDs).
 *
 * Reads from refined_issues.json and pubmed_cache.json
 * Modifies enhanced citation files in-place
 *
 * Usage: node supp-db-site/tools/apply_safe_fixes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const CITATIONS_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');
const ISSUES_FILE = path.join(__dirname, 'refined_issues.json');

const isDryRun = process.argv.includes('--dry-run');

function main() {
    const issues = JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf8'));

    const fixLog = [];
    const fileChanges = {};

    // === 1. DOI-ONLY FIXES (title matches PubMed, only DOI is wrong) ===
    console.log('=== DOI-ONLY FIXES (SAFE) ===');
    for (const fix of issues.titleFormat_doiFix) {
        const filePath = path.join(CITATIONS_DIR, fix.file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Verify PMID exists in file
        if (content.indexOf(fix.pmid) === -1) {
            console.log(`  SKIP: PMID ${fix.pmid} not found in ${fix.file}`);
            continue;
        }

        // Replace the wrong DOI with the correct one
        if (fix.wrongDoi && fix.correctDoi) {
            const oldDoi = fix.wrongDoi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const doiRegex = new RegExp(oldDoi, 'g');
            const newContent = content.replace(doiRegex, fix.correctDoi);

            if (newContent !== content) {
                if (!isDryRun) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                }
                console.log(`  ✓ ${fix.supplement} | PMID ${fix.pmid}: ${fix.wrongDoi} → ${fix.correctDoi}`);
                fixLog.push({ type: 'doi_fix', file: fix.file, pmid: fix.pmid, old: fix.wrongDoi, new: fix.correctDoi });
                fileChanges[fix.file] = (fileChanges[fix.file] || 0) + 1;
            } else {
                console.log(`  SKIP: DOI string not found in ${fix.file} for PMID ${fix.pmid}`);
            }
        }
    }

    // === 2. YEAR FIXES ===
    console.log('\n=== YEAR FIXES (SAFE) ===');
    for (const fix of issues.yearFixes) {
        const filePath = path.join(CITATIONS_DIR, fix.file);
        let content = fs.readFileSync(filePath, 'utf8');

        const pmidPos = content.indexOf(fix.pmid);
        if (pmidPos === -1) {
            console.log(`  SKIP: PMID ${fix.pmid} not found in ${fix.file}`);
            continue;
        }

        // Find year field near the PMID
        const searchStart = Math.max(0, pmidPos - 300);
        const searchEnd = Math.min(content.length, pmidPos + 300);
        const searchBlock = content.substring(searchStart, searchEnd);

        const yearRegex = new RegExp(`("?year"?\\s*:\\s*)${fix.expected}(\\b)`);
        const yearMatch = searchBlock.match(yearRegex);

        if (yearMatch) {
            const newSearchBlock = searchBlock.replace(yearMatch[0], yearMatch[1] + fix.actual + yearMatch[2]);
            const newContent = content.substring(0, searchStart) + newSearchBlock + content.substring(searchEnd);

            if (newContent !== content) {
                if (!isDryRun) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                }
                console.log(`  ✓ ${fix.supplement} | PMID ${fix.pmid}: year ${fix.expected} → ${fix.actual}`);
                fixLog.push({ type: 'year_fix', file: fix.file, pmid: fix.pmid, old: fix.expected, new: fix.actual });
                fileChanges[fix.file] = (fileChanges[fix.file] || 0) + 1;
            }
        } else {
            console.log(`  SKIP: Year ${fix.expected} not found near PMID ${fix.pmid}`);
        }
    }

    // === 3. SKIP TITLE FIXES ===
    console.log('\n=== TITLE FIXES: SKIPPED (UNSAFE) ===');
    console.log(`  ${issues.titleFormat_titleFix.length} title fixes skipped - many are actually wrong PMIDs`);
    console.log(`  Use reclassify_title_issues.js to properly categorize these`);

    // === SUMMARY ===
    console.log('\n=== SAFE FIX SUMMARY ===');
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLIED'}`);
    console.log(`Total safe fixes: ${fixLog.length}`);
    console.log(`  DOI fixes: ${fixLog.filter(f => f.type === 'doi_fix').length}`);
    console.log(`  Year fixes: ${fixLog.filter(f => f.type === 'year_fix').length}`);
    console.log(`  Title fixes: 0 (skipped for safety)`);
    console.log(`Files modified: ${Object.keys(fileChanges).length}`);

    for (const [file, count] of Object.entries(fileChanges)) {
        console.log(`  ${file}: ${count} changes`);
    }

    // Save fix log
    const logPath = path.join(__dirname, 'safe_fix_log.json');
    fs.writeFileSync(logPath, JSON.stringify({
        date: new Date().toISOString(),
        mode: isDryRun ? 'dry-run' : 'applied',
        totalFixes: fixLog.length,
        skippedTitleFixes: issues.titleFormat_titleFix.length,
        fileChanges,
        fixes: fixLog
    }, null, 2));
    console.log(`\nLog saved to: ${logPath}`);
}

main();
