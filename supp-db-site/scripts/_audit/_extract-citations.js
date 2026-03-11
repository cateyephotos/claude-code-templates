#!/usr/bin/env node
/**
 * _extract-citations.js — One-shot script to extract all keyCitations
 * from supplements.js and write to data/citations-to-verify.json.
 * Delete after use.
 */
const { loadSupplementData } = require('./parse-data');
const fs = require('fs');
const path = require('path');

const db = loadSupplementData();
const supps = db.supplements || [];
let total = 0;
let withPmid = 0;
let withDoi = 0;
const allCitations = [];

supps.forEach(s => {
  (s.keyCitations || []).forEach((c, idx) => {
    total++;
    if (c.pmid) withPmid++;
    if (c.doi) withDoi++;
    allCitations.push({
      supplement: s.name,
      supplementId: s.id,
      citationIndex: idx,
      title: c.title || '',
      authors: c.authors || '',
      year: c.year || null,
      doi: c.doi || null,
      pmid: c.pmid || null,
      journal: c.journal || null
    });
  });
});

// Deduplicate by PMID or DOI (track which supplements share a citation)
const keyMap = new Map();
allCitations.forEach(c => {
  const key = c.pmid || c.doi || c.title;
  if (!keyMap.has(key)) {
    keyMap.set(key, { ...c, supplements: [c.supplement] });
  } else {
    keyMap.get(key).supplements.push(c.supplement);
  }
});

const unique = Array.from(keyMap.values());

console.log(`Total keyCitations entries: ${total}`);
console.log(`With PMID: ${withPmid}`);
console.log(`With DOI: ${withDoi}`);
console.log(`Unique citations: ${unique.length}`);
console.log(`Unique with PMID: ${unique.filter(c => c.pmid).length}`);
console.log(`Unique with DOI only (no PMID): ${unique.filter(c => !c.pmid && c.doi).length}`);
console.log(`Unique with neither: ${unique.filter(c => !c.pmid && !c.doi).length}`);

// Group by what we need to verify
const withPmidList = unique.filter(c => c.pmid);
const doiOnlyList = unique.filter(c => !c.pmid && c.doi);
const neitherList = unique.filter(c => !c.pmid && !c.doi);

const outPath = path.join(__dirname, '..', 'data', 'citations-to-verify.json');
fs.writeFileSync(outPath, JSON.stringify({
  meta: {
    totalEntries: total,
    uniqueCitations: unique.length,
    withPmid: withPmidList.length,
    doiOnly: doiOnlyList.length,
    neither: neitherList.length,
    extractedAt: new Date().toISOString()
  },
  withPmid: withPmidList,
  doiOnly: doiOnlyList,
  neither: neitherList
}, null, 2));

console.log(`\nWrote ${unique.length} citations to ${outPath}`);

// Also print the PMIDs as a comma-separated list for batch PubMed lookup
const pmids = withPmidList.map(c => c.pmid);
console.log(`\nPMIDs to verify (${pmids.length}):`);
// Print in batches of 20 for readability
for (let i = 0; i < pmids.length; i += 20) {
  console.log(pmids.slice(i, i + 20).join(','));
}
