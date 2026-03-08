const fs = require('fs');
const path = require('path');

const log = JSON.parse(fs.readFileSync(path.join(__dirname, 'remaining_pmid_fix_log.json'), 'utf8'));
const fixes = JSON.parse(fs.readFileSync(path.join(__dirname, 'remaining_pmid_fixes.json'), 'utf8'));

// Build map from correctPmid -> original fix data
const fixDataMap = {};
for (const f of fixes.fixed) {
    fixDataMap[f.correctPmid] = f;
}

// Identify fixes that resulted in DOI mismatches - these PMIDs are wrong
const badNewPmids = new Set([
    '40592838','18580589','29021708','41297722','37273100','41795418','41795402',
    '41781077','25063205','41241004','36156542','41707763','41791601','41058342',
    '41795433','41795469','39059059','9521632','41751190','24152889','41795434',
    '41795435','41614655','41795076','35976089','41790109','11467343','23565271',
    '20599660','41795410','39173346','22895963','41619931','11588329','41570428',
    '11238540','41795405','41795432','35215476','25083823'
]);

// Check which of these were from this pass
let byDoi = 0, byTitle = 0;
const revertNeeded = [];

for (const fix of log.fixes) {
    if (badNewPmids.has(fix.newPmid)) {
        const origData = fixDataMap[fix.newPmid];
        const hasDoi = origData && origData.fileDoi;
        if (hasDoi) {
            byDoi++;
        } else {
            byTitle++;
        }
        revertNeeded.push({
            file: fix.file,
            badPmid: fix.newPmid,
            originalPmid: fix.oldPmid,
            hadDoi: !!hasDoi,
            doi: origData ? origData.fileDoi : null
        });
    }
}

console.log('=== BAD FIXES FROM SECOND PASS ===');
console.log('Total bad fixes to revert:', revertNeeded.length);
console.log('  Found via DOI (should be correct):', byDoi);
console.log('  Found via title match only:', byTitle);

console.log('\nFixes to revert:');
for (const r of revertNeeded) {
    console.log(`  ${r.file}: ${r.badPmid} → revert to ${r.originalPmid} | DOI: ${r.doi || 'none'} | method: ${r.hadDoi ? 'DOI' : 'TITLE'}`);
}

// Count unique PMID 417* pattern
const recentPattern = revertNeeded.filter(r => r.badPmid.startsWith('41'));
console.log('\nRecent PMIDs (41xxxx):', recentPattern.length);

// Save revert list
fs.writeFileSync(path.join(__dirname, 'revert_list.json'), JSON.stringify(revertNeeded, null, 2));
console.log('\nRevert list saved to revert_list.json');
