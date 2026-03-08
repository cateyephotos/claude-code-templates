/**
 * Apply automated fixes for DOI, title, and year mismatches
 * Reads from refined_issues.json and pubmed_cache.json
 * Modifies enhanced citation files in-place
 *
 * Usage: node supp-db-site/tools/apply_auto_fixes.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const CITATIONS_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');
const ISSUES_FILE = path.join(__dirname, 'refined_issues.json');
const CACHE_FILE = path.join(__dirname, 'pubmed_cache.json');

const isDryRun = process.argv.includes('--dry-run');

function main() {
    const issues = JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf8'));
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));

    const fixLog = [];
    const fileChanges = {}; // Track changes per file

    // === 1. DOI-ONLY FIXES (title matches, DOI wrong) ===
    console.log('=== DOI-ONLY FIXES ===');
    for (const fix of issues.titleFormat_doiFix) {
        const filePath = path.join(CITATIONS_DIR, fix.file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Find the line with the wrong DOI near the PMID
        const pmidPattern = new RegExp(`(["']?pmid["']?\\s*:\\s*["']?${fix.pmid}["']?)`, 'g');
        const pmidMatch = pmidPattern.exec(content);

        if (!pmidMatch) {
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

    // === 2. TITLE FIXES (DOI matches, title needs updating) ===
    console.log('\n=== TITLE FIXES ===');
    for (const fix of issues.titleFormat_titleFix) {
        const filePath = path.join(CITATIONS_DIR, fix.file);
        let content = fs.readFileSync(filePath, 'utf8');
        const pubmed = cache[fix.pmid];

        if (!pubmed || !pubmed.title) {
            console.log(`  SKIP: No PubMed data for PMID ${fix.pmid}`);
            continue;
        }

        // Clean PubMed title (remove HTML tags)
        const correctTitle = pubmed.title
            .replace(/<\/?[^>]+>/g, '')
            .replace(/\.$/, '') // Remove trailing period
            .replace(/"/g, '\\"'); // Escape quotes for JS strings

        // Find the current title near the PMID
        // Strategy: find the PMID position, then find the nearest title field
        const pmidPos = content.indexOf(fix.pmid);
        if (pmidPos === -1) {
            console.log(`  SKIP: PMID ${fix.pmid} not found in ${fix.file}`);
            continue;
        }

        // Search for title field within ±500 chars of the PMID
        const searchStart = Math.max(0, pmidPos - 500);
        const searchEnd = Math.min(content.length, pmidPos + 500);
        const searchBlock = content.substring(searchStart, searchEnd);

        // Match the title field
        const titleRegex = /("?title"?\s*:\s*")([^"]+)(")/;
        const titleMatch = searchBlock.match(titleRegex);

        if (titleMatch) {
            const oldTitle = titleMatch[2];

            // Only fix if the old title is what we expected
            if (oldTitle.substring(0, 30) === fix.expected.substring(0, 30)) {
                const newSearchBlock = searchBlock.replace(
                    titleMatch[0],
                    titleMatch[1] + correctTitle + titleMatch[3]
                );

                const newContent = content.substring(0, searchStart) + newSearchBlock + content.substring(searchEnd);

                if (newContent !== content) {
                    if (!isDryRun) {
                        fs.writeFileSync(filePath, newContent, 'utf8');
                    }
                    console.log(`  ✓ ${fix.supplement} | PMID ${fix.pmid}: title updated`);
                    console.log(`    Old: ${oldTitle.substring(0, 60)}...`);
                    console.log(`    New: ${correctTitle.substring(0, 60)}...`);
                    fixLog.push({ type: 'title_fix', file: fix.file, pmid: fix.pmid, old: oldTitle.substring(0, 80), new: correctTitle.substring(0, 80) });
                    fileChanges[fix.file] = (fileChanges[fix.file] || 0) + 1;

                    // Re-read the file for subsequent fixes in same file
                    content = newContent;
                }
            } else {
                console.log(`  SKIP: Title mismatch for PMID ${fix.pmid} - expected prefix doesn't match`);
            }
        } else {
            console.log(`  SKIP: Title field not found near PMID ${fix.pmid} in ${fix.file}`);
        }
    }

    // === 3. YEAR FIXES ===
    console.log('\n=== YEAR FIXES ===');
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

    // === SUMMARY ===
    console.log('\n=== FIX SUMMARY ===');
    console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'APPLIED'}`);
    console.log(`Total fixes: ${fixLog.length}`);
    console.log(`  DOI fixes: ${fixLog.filter(f => f.type === 'doi_fix').length}`);
    console.log(`  Title fixes: ${fixLog.filter(f => f.type === 'title_fix').length}`);
    console.log(`  Year fixes: ${fixLog.filter(f => f.type === 'year_fix').length}`);
    console.log(`Files modified: ${Object.keys(fileChanges).length}`);

    for (const [file, count] of Object.entries(fileChanges)) {
        console.log(`  ${file}: ${count} changes`);
    }

    // Save fix log
    fs.writeFileSync(path.join(__dirname, 'auto_fix_log.json'), JSON.stringify({
        date: new Date().toISOString(),
        mode: isDryRun ? 'dry-run' : 'applied',
        totalFixes: fixLog.length,
        fileChanges,
        fixes: fixLog
    }, null, 2));
}

main();
