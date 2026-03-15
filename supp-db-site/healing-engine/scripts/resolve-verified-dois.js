#!/usr/bin/env node
/**
 * resolve-verified-dois.js
 * Resolves missing DOIs ONLY when PubMed's title matches the citation title.
 * Also clears wrong PMIDs where PubMed title has <0.4 similarity.
 *
 * Three-tier approach:
 * 1. PMID verified (sim ≥ 0.6): Apply DOI from PubMed ✅
 * 2. Questionable (sim 0.4-0.6): Skip, flag for manual review ⚠️
 * 3. Mismatch (sim < 0.4): Clear the wrong PMID (and DOI if present) ❌
 *
 * Usage:
 *   node resolve-verified-dois.js              # Full run
 *   node resolve-verified-dois.js --dry-run    # Show what would change
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { loadEnhancedFile } = require('../utils/schema');
const { lookupPmidBatch, simpleSimilarity } = require('../fixers/batch-api-client');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
const DRY_RUN = process.argv.includes('--dry-run');

const MATCH_THRESHOLD = 0.6;
const MISMATCH_THRESHOLD = 0.4;

function collectCitationsNeedingDoi() {
  const files = fs.readdirSync(ENH_DIR)
    .filter(f => f.endsWith('_enhanced.js') && !f.endsWith('.bak'));

  const results = [];

  for (const file of files) {
    const filePath = path.join(ENH_DIR, file);
    const data = loadEnhancedFile(filePath);
    if (!data || !data.citations) continue;

    for (const [sectionName, sectionArr] of Object.entries(data.citations)) {
      if (!Array.isArray(sectionArr)) continue;
      for (let ci = 0; ci < sectionArr.length; ci++) {
        const citation = sectionArr[ci];
        if (!citation.evidence || !Array.isArray(citation.evidence)) continue;
        for (let ei = 0; ei < citation.evidence.length; ei++) {
          const ev = citation.evidence[ei];
          if (ev.pmid && ev.pmid !== '' && ev.pmid !== 'N/A' && (!ev.doi || ev.doi === '')) {
            results.push({
              file, section: sectionName, citationIdx: ci, evidenceIdx: ei,
              pmid: ev.pmid, title: ev.title || '', year: ev.year
            });
          }
        }
      }
    }
  }

  return results;
}

function applyDoiToFile(file, pmid, newDoi) {
  const filePath = path.join(ENH_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find evidence items with this PMID and an empty DOI nearby
  let modified = false;
  let pos = 0;

  while (true) {
    pos = content.indexOf(pmid, pos);
    if (pos === -1) break;

    // Look in surrounding context for empty DOI
    const regionStart = Math.max(0, pos - 400);
    const regionEnd = Math.min(content.length, pos + 400);
    const region = content.substring(regionStart, regionEnd);

    // Match empty doi patterns
    const emptyDoiPatterns = [
      { pattern: '"doi": ""', replacement: `"doi": "${newDoi}"` },
      { pattern: 'doi:  ""', replacement: `doi:  "${newDoi}"` },
      { pattern: 'doi: ""', replacement: `doi: "${newDoi}"` },
    ];

    let foundEmpty = false;
    for (const { pattern, replacement } of emptyDoiPatterns) {
      const doiPos = region.indexOf(pattern);
      if (doiPos !== -1) {
        const absoluteDoiPos = regionStart + doiPos;
        content = content.substring(0, absoluteDoiPos) + replacement +
          content.substring(absoluteDoiPos + pattern.length);
        modified = true;
        foundEmpty = true;
        break;
      }
    }

    if (foundEmpty) {
      // Only fix the first match per PMID occurrence, then move past
      pos += pmid.length + newDoi.length;
    } else {
      pos += pmid.length;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  return modified;
}

function clearPmidInFile(file, wrongPmid, citationTitle) {
  const filePath = path.join(ENH_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let pos = 0;
  let modified = false;
  const titleSnippet = citationTitle ? citationTitle.substring(0, 40) : null;

  while (true) {
    pos = content.indexOf(wrongPmid, pos);
    if (pos === -1) break;

    // Check context for title to ensure we're clearing the right one
    const regionStart = Math.max(0, pos - 400);
    const regionEnd = Math.min(content.length, pos + 200);
    const region = content.substring(regionStart, regionEnd);

    if (!titleSnippet || region.includes(titleSnippet)) {
      // Find the quote before the PMID value
      let quotePos = pos - 1;
      while (quotePos > 0 && content[quotePos] !== '"' && content[quotePos] !== "'") quotePos--;
      content = content.substring(0, quotePos + 1) + content.substring(pos + wrongPmid.length);
      modified = true;
      pos = quotePos + 2;
    } else {
      pos += wrongPmid.length;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  return modified;
}

async function main() {
  console.log(`resolve-verified-dois.js${DRY_RUN ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(60));

  const needsDoi = collectCitationsNeedingDoi();
  console.log(`Citations with PMID but no DOI: ${needsDoi.length}`);

  // Get unique PMIDs
  const uniquePmids = [...new Set(needsDoi.map(c => c.pmid))];
  console.log(`Unique PMIDs to look up: ${uniquePmids.length}`);

  // Batch lookup
  console.log('\nQuerying PubMed...');
  const pubmedResults = await lookupPmidBatch(uniquePmids);
  console.log(`PubMed returned data for ${Object.keys(pubmedResults).length} PMIDs\n`);

  let doisApplied = 0;
  let pmidsCleared = 0;
  let skippedQuestionable = 0;
  let skippedNoTitle = 0;
  let skippedNoPubmed = 0;
  const filesModified = new Set();

  for (const cit of needsDoi) {
    const pm = pubmedResults[cit.pmid];
    if (!pm) {
      skippedNoPubmed++;
      continue;
    }

    // No title in citation — can't verify
    if (!cit.title || cit.title.trim() === '') {
      skippedNoTitle++;
      continue;
    }

    const similarity = simpleSimilarity(cit.title, pm.title);

    if (similarity >= MATCH_THRESHOLD) {
      // VERIFIED — apply DOI
      if (pm.doi && pm.doi !== '') {
        if (DRY_RUN) {
          console.log(`  ✅ APPLY: ${cit.file} PMID ${cit.pmid} → DOI ${pm.doi} (sim=${similarity.toFixed(2)})`);
        } else {
          const success = applyDoiToFile(cit.file, cit.pmid, pm.doi);
          if (success) filesModified.add(cit.file);
        }
        doisApplied++;
      }
    } else if (similarity >= MISMATCH_THRESHOLD) {
      // QUESTIONABLE — skip
      if (DRY_RUN) {
        console.log(`  ⚠️ SKIP: ${cit.file} PMID ${cit.pmid} sim=${similarity.toFixed(2)} | "${cit.title.substring(0, 40)}..." vs "${pm.title.substring(0, 40)}..."`);
      }
      skippedQuestionable++;
    } else {
      // MISMATCH — clear the wrong PMID
      if (DRY_RUN) {
        console.log(`  ❌ CLEAR PMID: ${cit.file} PMID ${cit.pmid} sim=${similarity.toFixed(2)} | "${cit.title.substring(0, 40)}..." vs "${pm.title.substring(0, 40)}..."`);
      } else {
        const success = clearPmidInFile(cit.file, cit.pmid, cit.title);
        if (success) filesModified.add(cit.file);
      }
      pmidsCleared++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  DOIs ${DRY_RUN ? 'to' : ''} applied (verified ≥${MATCH_THRESHOLD}): ${doisApplied}`);
  console.log(`  Wrong PMIDs ${DRY_RUN ? 'to' : ''} cleared (<${MISMATCH_THRESHOLD}): ${pmidsCleared}`);
  console.log(`  Questionable — skipped: ${skippedQuestionable}`);
  console.log(`  No title to compare — skipped: ${skippedNoTitle}`);
  console.log(`  PMID not in PubMed — skipped: ${skippedNoPubmed}`);
  if (!DRY_RUN) console.log(`  Files modified: ${filesModified.size}`);
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
