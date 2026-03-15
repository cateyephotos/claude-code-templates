#!/usr/bin/env node
/**
 * fix-duplicate-dois.js
 * Clears DOIs from evidence items where the DOI was incorrectly assigned
 * (title doesn't match CrossRef-verified title for that DOI).
 *
 * CrossRef verification done 2026-03-15.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');

// Each entry: { file, doi, titleFragment } — clear DOI where evidence title contains fragment
const fixes = [
  { file: '23_folate_enhanced.js', doi: '10.3109/00498254.2013.845705', titleFragment: 'Vitamin B12' },
  { file: '31_whey_protein_enhanced.js', doi: '10.1007/s40279-014-0242-2', titleFragment: 'whey protein supplementation on muscle' },
  { file: '31_whey_protein_enhanced.js', doi: '10.1007/s40279-014-0242-2', titleFragment: 'Safety and efficacy of whey' },
  { file: '31_whey_protein_enhanced.js', doi: '10.1186/1550-2783-4-6', titleFragment: 'protein and exercise' },
  { file: '49_echinacea_enhanced.js', doi: '10.1111/j.1365-2710.2003.00542.x', titleFragment: 'proprietary extract of Echinacea' },
  { file: '52_cordyceps_enhanced.js', doi: '10.3390/nu16010102', titleFragment: 'Caterpillar Fungus' },
  { file: '54_chlorella_enhanced.js', doi: '10.1186/1475-2891-11-53', titleFragment: 'Chlorella supplement health benefits' },
  { file: '64_gymnema_sylvestre_enhanced.js', doi: '10.1002/ptr.3125', titleFragment: 'OSA' },
  { file: '64_gymnema_sylvestre_enhanced.js', doi: '10.3109/19390211.2010.505901', titleFragment: 'GS4' },
  { file: '67_holy_basil_enhanced.js', doi: '10.3389/fnut.2022.965130', titleFragment: 'Dose-response relationship' },
  { file: '76_sulbutiamine_enhanced.js', doi: '10.3390/nu12051401', titleFragment: 'sulbutiamine' },
  { file: '78_centella_asiatica_enhanced.js', doi: '10.1016/j.jep.2007.11.038', titleFragment: 'Centella asiatica' },
];

let totalFixed = 0;
const fixedFiles = new Set();

for (const fix of fixes) {
  const filePath = path.join(ENH_DIR, fix.file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Strategy: find evidence items that have BOTH the wrong DOI and the title fragment,
  // then replace the DOI with empty string.
  // We use a regex that matches doi: "THE_DOI" when it appears near the title fragment.

  // Since these are JS object literals, we need a targeted approach.
  // Find all occurrences of the DOI string and check surrounding context for the title.
  // Handle both JSON-style ("doi": "value") and JS-style (doi: "value")
  const doiPatterns = [
    `"doi": "${fix.doi}"`,
    `"doi": '${fix.doi}'`,
    `doi: "${fix.doi}"`,
    `doi: '${fix.doi}'`,
  ];

  let modified = false;
  for (const pattern of doiPatterns) {
    let idx = 0;
    while (true) {
      let pos = content.indexOf(pattern, idx);
      if (pos === -1) break;

      // Look at surrounding ~500 chars for the title fragment
      const contextStart = Math.max(0, pos - 300);
      const contextEnd = Math.min(content.length, pos + 300);
      const context = content.substring(contextStart, contextEnd);

      if (context.includes(fix.titleFragment)) {
        // Replace this DOI with empty string, preserving quote style
        const quoteChar = pattern.includes('"' + fix.doi + '"') ? '"' : "'";
        const keyQuote = pattern.startsWith('"') ? '"doi": ' : 'doi: ';
        const oldStr = `${keyQuote}${quoteChar}${fix.doi}${quoteChar}`;
        const newStr = `${keyQuote}${quoteChar}${quoteChar}`;
        content = content.substring(0, pos) + newStr + content.substring(pos + oldStr.length);
        totalFixed++;
        modified = true;
        idx = pos + newStr.length;
      } else {
        idx = pos + pattern.length;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedFiles.add(fix.file);
    console.log(`Fixed: ${fix.file} — cleared DOI ${fix.doi} (title: "${fix.titleFragment}...")`);
  }
}

console.log(`\nDone: ${totalFixed} DOIs cleared across ${fixedFiles.size} files`);
