#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');

const fixes = [
  { file: '31_whey_protein_enhanced.js', doi: '10.1007/s40279-014-0242-2', titleFragment: 'whey protein supplementation' },
  { file: '31_whey_protein_enhanced.js', doi: '10.1007/s40279-014-0242-2', titleFragment: 'Safety and efficacy of whey' },
  { file: '31_whey_protein_enhanced.js', doi: '10.1186/1550-2783-4-6', titleFragment: 'protein and exercise' },
  { file: '49_echinacea_enhanced.js', doi: '10.1111/j.1365-2710.2003.00542.x', titleFragment: 'proprietary extract of Echinacea' },
  { file: '67_holy_basil_enhanced.js', doi: '10.3389/fnut.2022.965130', titleFragment: 'Dose-response relationship' },
  { file: '76_sulbutiamine_enhanced.js', doi: '10.3390/nu12051401', titleFragment: 'sulbutiamine' },
  { file: '78_centella_asiatica_enhanced.js', doi: '10.1016/j.jep.2007.11.038', titleFragment: 'Centella asiatica' },
];

let totalFixed = 0;
const fixedFiles = new Set();

for (const fix of fixes) {
  const filePath = path.join(ENH_DIR, fix.file);
  let content = fs.readFileSync(filePath, 'utf8');

  let idx = 0;
  while (true) {
    const pos = content.indexOf(fix.doi, idx);
    if (pos === -1) break;

    // Check surrounding context for the title fragment
    const contextStart = Math.max(0, pos - 500);
    const contextEnd = Math.min(content.length, pos + 200);
    const context = content.substring(contextStart, contextEnd);

    if (context.includes(fix.titleFragment)) {
      // Find the quote character before the DOI value
      let quotePos = pos - 1;
      while (quotePos > 0 && content[quotePos] !== '"' && content[quotePos] !== "'") {
        quotePos--;
      }

      // Replace the DOI value with empty string (keep the quotes)
      const before = content.substring(0, quotePos + 1);
      const after = content.substring(pos + fix.doi.length);
      content = before + after;
      totalFixed++;
      fixedFiles.add(fix.file);
      console.log(`Fixed: ${fix.file} — cleared DOI ${fix.doi} near "${fix.titleFragment}"`);
      idx = quotePos + 2;
    } else {
      idx = pos + fix.doi.length;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log(`\nTotal fixed: ${totalFixed} across ${fixedFiles.size} files`);
