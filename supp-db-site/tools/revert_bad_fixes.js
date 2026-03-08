/**
 * Revert 57 bad PMID fixes from second pass where old-format DOIs
 * resolved to wrong PubMed entries.
 *
 * Usage: node supp-db-site/tools/revert_bad_fixes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const CITATIONS_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');
const REVERT_FILE = path.join(__dirname, 'revert_list.json');
const isDryRun = process.argv.includes('--dry-run');

function main() {
    const reverts = JSON.parse(fs.readFileSync(REVERT_FILE, 'utf8'));
    console.log(`Reverting ${reverts.length} bad PMID fixes...`);
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLY'}\n`);

    let reverted = 0;
    let skipped = 0;
    const fileChanges = {};

    for (const r of reverts) {
        const filePath = path.join(CITATIONS_DIR, r.file);
        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (e) {
            console.log(`  SKIP: Cannot read ${r.file}`);
            skipped++;
            continue;
        }

        const pmidPos = content.indexOf(r.badPmid);
        if (pmidPos === -1) {
            console.log(`  SKIP: Bad PMID ${r.badPmid} not found in ${r.file}`);
            skipped++;
            continue;
        }

        // Targeted replacement near the PMID position
        const searchStart = Math.max(0, pmidPos - 30);
        const searchEnd = Math.min(content.length, pmidPos + r.badPmid.length + 5);
        const searchBlock = content.substring(searchStart, searchEnd);

        const pmidFieldRegex = new RegExp(`("?pmid"?\\s*:\\s*"?)${r.badPmid}("?)`, 'g');
        const match = searchBlock.match(pmidFieldRegex);

        if (match) {
            const newSearchBlock = searchBlock.replace(pmidFieldRegex, `$1${r.originalPmid}$2`);
            const newContent = content.substring(0, searchStart) + newSearchBlock + content.substring(searchEnd);

            if (newContent !== content) {
                if (!isDryRun) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                }
                console.log(`  ✓ ${r.file}: ${r.badPmid} → ${r.originalPmid} (reverted)`);
                reverted++;
                fileChanges[r.file] = (fileChanges[r.file] || 0) + 1;
            }
        } else {
            console.log(`  SKIP: PMID field not matched for ${r.badPmid} in ${r.file}`);
            skipped++;
        }
    }

    console.log(`\n=== REVERT SUMMARY ===`);
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLIED'}`);
    console.log(`Reverted: ${reverted}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Files modified: ${Object.keys(fileChanges).length}`);

    // Save revert log
    const logPath = path.join(__dirname, 'revert_log.json');
    fs.writeFileSync(logPath, JSON.stringify({
        date: new Date().toISOString(),
        mode: isDryRun ? 'dry-run' : 'applied',
        reverted,
        skipped,
        fileChanges
    }, null, 2));
    console.log(`Log: ${logPath}`);
}

main();
