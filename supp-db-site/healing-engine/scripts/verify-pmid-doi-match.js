#!/usr/bin/env node
/**
 * verify-pmid-doi-match.js
 * Cross-validates that each citation's PMID and DOI resolve to the same article.
 * Compares PubMed's title (from PMID) against the citation's title using similarity scoring.
 * Flags mismatches where the PMID doesn't belong to the citation it's attached to.
 *
 * Usage:
 *   node verify-pmid-doi-match.js              # Full verification
 *   node verify-pmid-doi-match.js --fix        # Also clear DOIs on mismatched PMIDs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { loadEnhancedFile } = require('../utils/schema');
const { lookupPmidBatch, simpleSimilarity } = require('../fixers/batch-api-client');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
const FIX_MODE = process.argv.includes('--fix');
const SIMILARITY_THRESHOLD = 0.4; // Below this = definite mismatch
const WARNING_THRESHOLD = 0.6;    // Below this but above SIMILARITY = questionable

function collectAllPmidCitations() {
  const files = fs.readdirSync(ENH_DIR)
    .filter(f => f.endsWith('_enhanced.js') && !f.endsWith('.bak'));

  const citations = [];

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
          if (ev.pmid && ev.pmid !== '' && ev.pmid !== 'N/A') {
            citations.push({
              file, section: sectionName, citationIdx: ci, evidenceIdx: ei,
              pmid: ev.pmid, doi: ev.doi || '',
              title: ev.title || '', year: ev.year,
              authors: ev.authors || ''
            });
          }
        }
      }
    }
  }

  return citations;
}

async function main() {
  console.log(`verify-pmid-doi-match.js${FIX_MODE ? ' (FIX MODE)' : ' (VERIFY ONLY)'}`);
  console.log('='.repeat(60));

  const citations = collectAllPmidCitations();
  const uniquePmids = [...new Set(citations.map(c => c.pmid))];
  console.log(`Total citations with PMIDs: ${citations.length}`);
  console.log(`Unique PMIDs to verify: ${uniquePmids.length}`);

  // Batch lookup all PMIDs
  console.log('\nLooking up PMIDs via PubMed...');
  const pubmedResults = await lookupPmidBatch(uniquePmids);
  const lookedUp = Object.keys(pubmedResults).length;
  console.log(`PubMed returned data for ${lookedUp} of ${uniquePmids.length} PMIDs`);

  // Cross-validate
  const mismatches = [];
  const warnings = [];
  const good = [];
  const notFound = [];
  const noTitle = []; // citations with no title to compare

  for (const cit of citations) {
    const pm = pubmedResults[cit.pmid];
    if (!pm) {
      notFound.push(cit);
      continue;
    }

    if (!cit.title || cit.title.trim() === '') {
      noTitle.push({ ...cit, pubmedTitle: pm.title });
      continue;
    }

    const similarity = simpleSimilarity(cit.title, pm.title);

    if (similarity < SIMILARITY_THRESHOLD) {
      mismatches.push({
        ...cit,
        pubmedTitle: pm.title,
        pubmedDoi: pm.doi || '',
        similarity: similarity.toFixed(3)
      });
    } else if (similarity < WARNING_THRESHOLD) {
      warnings.push({
        ...cit,
        pubmedTitle: pm.title,
        pubmedDoi: pm.doi || '',
        similarity: similarity.toFixed(3)
      });
    } else {
      good.push(cit);
    }
  }

  // Report
  console.log('\n--- Results ---');
  console.log(`  Verified matches (>=${WARNING_THRESHOLD}): ${good.length}`);
  console.log(`  Questionable (${SIMILARITY_THRESHOLD}-${WARNING_THRESHOLD}): ${warnings.length}`);
  console.log(`  MISMATCHES (<${SIMILARITY_THRESHOLD}): ${mismatches.length}`);
  console.log(`  No title to compare: ${noTitle.length}`);
  console.log(`  PMID not found in PubMed: ${notFound.length}`);

  if (mismatches.length > 0) {
    console.log('\n--- MISMATCHES (PMID does not match citation) ---');
    for (const m of mismatches) {
      console.log(`\n  File: ${m.file} [${m.section}]`);
      console.log(`  PMID: ${m.pmid} | DOI: ${m.doi}`);
      console.log(`  Citation title: "${m.title.substring(0, 80)}"`);
      console.log(`  PubMed title:   "${m.pubmedTitle.substring(0, 80)}"`);
      console.log(`  Similarity: ${m.similarity}`);
    }
  }

  if (warnings.length > 0) {
    console.log('\n--- QUESTIONABLE (may need review) ---');
    for (const w of warnings) {
      console.log(`  ${w.file} PMID ${w.pmid} sim=${w.similarity} | "${w.title.substring(0, 50)}..." vs "${w.pubmedTitle.substring(0, 50)}..."`);
    }
  }

  if (noTitle.length > 0) {
    console.log(`\n--- NO TITLE (${noTitle.length} citations have PMID but no title) ---`);
    noTitle.slice(0, 5).forEach(c => {
      console.log(`  ${c.file} PMID ${c.pmid} → PubMed: "${c.pubmedTitle.substring(0, 60)}"`);
    });
    if (noTitle.length > 5) console.log(`  ... and ${noTitle.length - 5} more`);
  }

  if (FIX_MODE && mismatches.length > 0) {
    console.log('\n--- Clearing DOIs on mismatched citations ---');
    let fixed = 0;
    for (const m of mismatches) {
      const filePath = path.join(ENH_DIR, m.file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Find the PMID in context, then clear the nearby DOI
      let pos = 0;
      while (true) {
        pos = content.indexOf(m.pmid, pos);
        if (pos === -1) break;

        const contextStart = Math.max(0, pos - 300);
        const contextEnd = Math.min(content.length, pos + 300);
        const context = content.substring(contextStart, contextEnd);

        // Check this is the right evidence item by checking title presence
        if (m.title && context.includes(m.title.substring(0, 30))) {
          // Clear both PMID and DOI for this mismatched citation
          if (m.doi && m.doi !== '') {
            const doiIdx = context.indexOf(m.doi);
            if (doiIdx !== -1) {
              const absDoiPos = contextStart + doiIdx;
              let quotePos = absDoiPos - 1;
              while (quotePos > 0 && content[quotePos] !== '"' && content[quotePos] !== "'") quotePos--;
              content = content.substring(0, quotePos + 1) + content.substring(absDoiPos + m.doi.length);
              fixed++;
              console.log(`  Cleared DOI ${m.doi} from ${m.file} (mismatched PMID ${m.pmid})`);
            }
          }
          break;
        }
        pos += m.pmid.length;
      }

      fs.writeFileSync(filePath, content, 'utf8');
    }
    console.log(`\nCleared ${fixed} mismatched DOIs`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Verification complete.');
}

main().catch(e => { console.error(e); process.exit(1); });
