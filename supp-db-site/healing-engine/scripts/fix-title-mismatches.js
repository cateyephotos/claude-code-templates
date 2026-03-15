#!/usr/bin/env node
/**
 * fix-title-mismatches.js
 * Fixes minor title inconsistencies for citations sharing the same DOI,
 * and clears wrong DOI for DMAE/piracetam conflict.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');

// Title normalization fixes (same paper, slightly different titles)
const titleFixes = [
  {
    file: '23_folate_enhanced.js',
    oldTitle: 'MTHFR isoform carriers. 5-MTHF (5-methyl tetrahydrofolate) vs folic acid: a key to pregnancy outcome: a case series.',
    newTitle: 'MTHFR isoform carriers. 5-MTHF (5-methyl tetrahydrofolate) vs folic acid: a key to pregnancy outcome: a case series'
  },
  {
    file: '70_forskolin_enhanced.js',
    oldTitle: 'Coleus forskohlii Extract Supplementation in Conjunction with a Hypocaloric Diet Reduces the Risk Factors of Metabolic Syndrome',
    newTitle: 'Coleus forskohlii Extract Supplementation in Conjunction with a Hypocaloric Diet Reduces the Risk Factors of Metabolic Syndrome in Overweight and Obese Subjects: A Randomized Controlled Trial'
  },
  {
    file: '85_pine_bark_extract_enhanced.js',
    oldTitle: 'The effects of pycnogenol on cardiometabolic biomarkers: A systematic review and meta-analysis of randomized controlled trials (dosage analysis)',
    newTitle: 'The effects of pycnogenol on cardiometabolic biomarkers: A systematic review and meta-analysis of randomized controlled trials'
  },
];

// DOI that needs to be cleared (wrong paper)
// CrossRef couldn't resolve 10.3389/fphar.2022.884087 — but "Nootropics as cognitive enhancers"
// is a different paper than "Deanol as a putative acetylcholine precursor"
// The DMAE file (77) should keep the DOI for "Deanol..." (matches supplement topic)
// The "Nootropics..." citation has the wrong DOI
const doiClears = [
  {
    file: '77_dmae_enhanced.js',
    doi: '10.3389/fphar.2022.884087',
    wrongTitleFragment: 'Nootropics as cognitive enhancers'
  },
  {
    file: '81_piracetam_enhanced.js',
    doi: '10.3389/fphar.2022.884087',
    wrongTitleFragment: 'Nootropics as cognitive enhancers'
  },
];

let totalFixed = 0;

// Apply title fixes
for (const fix of titleFixes) {
  const filePath = path.join(ENH_DIR, fix.file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(fix.oldTitle)) {
    content = content.replace(fix.oldTitle, fix.newTitle);
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    console.log(`Title normalized: ${fix.file}`);
    console.log(`  "${fix.oldTitle.substring(0, 60)}..." → "${fix.newTitle.substring(0, 60)}..."`);
  } else {
    console.log(`NOT FOUND in ${fix.file}: "${fix.oldTitle.substring(0, 60)}..."`);
  }
}

// Apply DOI clears
for (const fix of doiClears) {
  const filePath = path.join(ENH_DIR, fix.file);
  let content = fs.readFileSync(filePath, 'utf8');

  let idx = 0;
  while (true) {
    const pos = content.indexOf(fix.doi, idx);
    if (pos === -1) break;

    const contextStart = Math.max(0, pos - 500);
    const contextEnd = Math.min(content.length, pos + 200);
    const context = content.substring(contextStart, contextEnd);

    if (context.includes(fix.wrongTitleFragment)) {
      let quotePos = pos - 1;
      while (quotePos > 0 && content[quotePos] !== '"' && content[quotePos] !== "'") quotePos--;
      content = content.substring(0, quotePos + 1) + content.substring(pos + fix.doi.length);
      totalFixed++;
      console.log(`DOI cleared: ${fix.file} — ${fix.doi} near "${fix.wrongTitleFragment}"`);
      idx = quotePos + 2;
    } else {
      idx = pos + fix.doi.length;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log(`\nTotal fixes applied: ${totalFixed}`);
