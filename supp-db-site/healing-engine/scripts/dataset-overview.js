#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { loadEnhancedFile } = require('../utils/schema');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');

const files = fs.readdirSync(ENH_DIR)
  .filter(f => f.endsWith('_enhanced.js') && !f.endsWith('.bak'));

const byFile = {};
for (const file of files) {
  const data = loadEnhancedFile(path.join(ENH_DIR, file));
  if (!data || !data.citations) continue;

  byFile[file] = { total: 0, withPmid: 0, withDoi: 0, withTitle: 0, withBoth: 0 };

  for (const [section, arr] of Object.entries(data.citations)) {
    if (!Array.isArray(arr)) continue;
    for (const cit of arr) {
      if (!cit.evidence || !Array.isArray(cit.evidence)) continue;
      for (const ev of cit.evidence) {
        byFile[file].total++;
        if (ev.pmid && ev.pmid !== '') byFile[file].withPmid++;
        if (ev.doi && ev.doi !== '') byFile[file].withDoi++;
        if (ev.title && ev.title.trim() !== '') byFile[file].withTitle++;
        if (ev.doi && ev.doi !== '' && ev.pmid && ev.pmid !== '') byFile[file].withBoth++;
      }
    }
  }
}

let totalEvidence = 0, totalWithPmid = 0, totalWithDoi = 0, totalWithTitle = 0, totalWithBoth = 0;
for (const stats of Object.values(byFile)) {
  totalEvidence += stats.total;
  totalWithPmid += stats.withPmid;
  totalWithDoi += stats.withDoi;
  totalWithTitle += stats.withTitle;
  totalWithBoth += stats.withBoth;
}

const withTitles = Object.entries(byFile).filter(([,s]) => s.withTitle > 0);
const noTitles = Object.entries(byFile).filter(([,s]) => s.withTitle === 0 && s.total > 0);

console.log('=== DATASET OVERVIEW ===');
console.log('Total enhanced files:', files.length);
console.log('Total evidence items:', totalEvidence);
console.log('  With PMID:', totalWithPmid, '(' + (100*totalWithPmid/totalEvidence).toFixed(1) + '%)');
console.log('  With DOI:', totalWithDoi, '(' + (100*totalWithDoi/totalEvidence).toFixed(1) + '%)');
console.log('  With title:', totalWithTitle, '(' + (100*totalWithTitle/totalEvidence).toFixed(1) + '%)');
console.log('  With both PMID+DOI:', totalWithBoth, '(' + (100*totalWithBoth/totalEvidence).toFixed(1) + '%)');

console.log('\n=== FILE FORMAT SPLIT ===');
console.log('Files WITH evidence titles:', withTitles.length);
console.log('Files WITHOUT evidence titles:', noTitles.length);

console.log('\nFiles without titles:');
noTitles.forEach(([f, s]) => {
  console.log('  ' + f + ' — ' + s.total + ' items, ' + s.withPmid + ' PMID, ' + s.withDoi + ' DOI');
});

console.log('\nWorst quality files (most evidence items, fewest identifiers):');
const quality = Object.entries(byFile)
  .map(([file, s]) => ({
    file,
    total: s.total,
    identifierRate: s.total > 0 ? ((s.withDoi + s.withPmid) / (2 * s.total) * 100).toFixed(0) : 100,
    titleRate: s.total > 0 ? (s.withTitle / s.total * 100).toFixed(0) : 100
  }))
  .sort((a, b) => a.identifierRate - b.identifierRate);

quality.slice(0, 15).forEach(q => {
  console.log(`  ${q.file} — ${q.total} items, ${q.identifierRate}% identifier coverage, ${q.titleRate}% title coverage`);
});
