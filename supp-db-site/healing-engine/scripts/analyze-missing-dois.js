#!/usr/bin/env node
'use strict';

const { collectAllCitations } = require('../healers/citation-healer');
const all = collectAllCitations();
const noDoi = all.filter(c => !c.doi || c.doi === '');
console.log('Total citations with no DOI:', noDoi.length);

// Categorize by what info is available for lookup
const withPmid = noDoi.filter(c => c.pmid && c.pmid !== '' && c.pmid !== 'N/A');
const withTitleNopmid = noDoi.filter(c => c.title && c.title.trim() !== '' && (!c.pmid || c.pmid === '' || c.pmid === 'N/A'));
const withTitleAndYear = withTitleNopmid.filter(c => c.year);
const noInfo = noDoi.filter(c => (!c.title || c.title.trim() === '') && (!c.pmid || c.pmid === '' || c.pmid === 'N/A'));

console.log('  Have PMID (can lookup DOI via PubMed):', withPmid.length);
console.log('  Have title+year, no PMID (search CrossRef):', withTitleAndYear.length);
console.log('  Have title only, no year/PMID:', withTitleNopmid.length - withTitleAndYear.length);
console.log('  No title AND no PMID (hard to fix):', noInfo.length);

// Show files with most missing DOIs
const byFile = {};
for (const c of noDoi) {
  const file = c.sourceFile || 'unknown';
  if (!byFile[file]) byFile[file] = 0;
  byFile[file]++;
}
const sorted = Object.entries(byFile).sort((a, b) => b[1] - a[1]);
console.log('\n--- Top files with missing DOIs ---');
sorted.slice(0, 10).forEach(([file, count]) => console.log(`  ${count} missing in ${file}`));

// Show examples
console.log('\n--- Examples with PMID (easiest to fix) ---');
withPmid.slice(0, 5).forEach(c => console.log(`  PMID: ${c.pmid} | Title: ${(c.title || '').substring(0, 70)}`));

console.log('\n--- Examples with title+year ---');
withTitleAndYear.slice(0, 5).forEach(c => console.log(`  ${c.year} | ${(c.title || '').substring(0, 70)}`));
