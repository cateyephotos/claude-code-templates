'use strict';

const fs = require('fs');
const path = require('path');
const { loadEnhancedFile } = require('../utils/schema');
const { lookupPmidBatch, simpleSimilarity } = require('../fixers/batch-api-client');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
const QUALITY_DIR = path.join(ENH_DIR, '_quality');

const MATCH_THRESHOLD = 0.6;
const MISMATCH_THRESHOLD = 0.4;

/**
 * Flag evidence quality for a single enhanced citation file.
 * Cross-checks each evidence item's PMID against PubMed titles
 * using Dice coefficient similarity scoring.
 *
 * @param {string} filename - e.g. '8_melatonin_enhanced.js'
 * @returns {object|null} Quality report with per-item statuses
 */
async function flagSingleFile(filename) {
  const filePath = path.join(ENH_DIR, filename);
  const data = loadEnhancedFile(filePath);
  if (!data || !data.citations) return null;

  const items = [];
  const pmidsToLookup = new Set();

  // Collect all evidence items across citation sections
  for (const [section, arr] of Object.entries(data.citations)) {
    if (!Array.isArray(arr)) continue;
    for (let ci = 0; ci < arr.length; ci++) {
      const citation = arr[ci];
      if (!citation.evidence || !Array.isArray(citation.evidence)) continue;
      for (let ei = 0; ei < citation.evidence.length; ei++) {
        const ev = citation.evidence[ei];
        const item = {
          section, citationIdx: ci, evidenceIdx: ei,
          pmid: ev.pmid || '', doi: ev.doi || '',
          title: ev.title || '', year: ev.year || null,
          status: 'pending', similarity: null, pubmedTitle: null
        };
        items.push(item);
        if (item.pmid && item.pmid !== '' && item.pmid !== 'N/A') {
          pmidsToLookup.add(item.pmid);
        }
      }
    }
  }

  // Batch lookup all unique PMIDs via PubMed esummary
  const pubmedData = pmidsToLookup.size > 0
    ? await lookupPmidBatch([...pmidsToLookup])
    : {};

  // Classify each evidence item
  let verified = 0, mismatched = 0, questionable = 0, unverifiable = 0, noPmid = 0;

  for (const item of items) {
    if (!item.pmid || item.pmid === '' || item.pmid === 'N/A') {
      item.status = 'no_pmid';
      noPmid++;
      continue;
    }

    const pm = pubmedData[item.pmid];
    if (!pm) {
      item.status = 'pmid_not_found';
      unverifiable++;
      continue;
    }

    item.pubmedTitle = pm.title || '';
    item.pubmedDoi = pm.doi || '';

    if (!item.title || item.title.trim() === '') {
      item.status = 'unverifiable';
      unverifiable++;
      continue;
    }

    const sim = simpleSimilarity(item.title, pm.title);
    item.similarity = parseFloat(sim.toFixed(3));

    if (sim >= MATCH_THRESHOLD) {
      item.status = 'verified';
      verified++;
    } else if (sim >= MISMATCH_THRESHOLD) {
      item.status = 'questionable';
      questionable++;
    } else {
      item.status = 'mismatched';
      mismatched++;
    }
  }

  const result = {
    file: filename,
    supplementId: data.supplementId || data.id,
    supplementName: data.supplementName || data.name,
    timestamp: new Date().toISOString(),
    totalEvidence: items.length,
    verified, mismatched, questionable, unverifiable, noPmid,
    reliabilityScore: items.length > 0
      ? parseFloat((verified / items.length * 100).toFixed(1))
      : 0,
    items
  };

  return result;
}

/**
 * Flag evidence quality for all enhanced citation files.
 * Writes per-file quality sidecar JSON to _quality/ directory.
 *
 * @param {object} options - { dryRun: bool, quiet: bool }
 * @returns {object} Summary with sorted results by worst reliability
 */
async function flagAllFiles(options = {}) {
  if (!fs.existsSync(QUALITY_DIR)) fs.mkdirSync(QUALITY_DIR, { recursive: true });

  const files = fs.readdirSync(ENH_DIR)
    .filter(f => f.endsWith('_enhanced.js') && !f.endsWith('.bak'));

  const summary = { total: files.length, processed: 0, results: [] };

  for (const file of files) {
    const result = await flagSingleFile(file);
    if (!result) continue;

    // Write sidecar quality file
    const qualityFile = file.replace('_enhanced.js', '_quality.json');
    if (!options.dryRun) {
      fs.writeFileSync(
        path.join(QUALITY_DIR, qualityFile),
        JSON.stringify(result, null, 2),
        'utf8'
      );
    }

    summary.processed++;
    summary.results.push({
      file, reliability: result.reliabilityScore,
      verified: result.verified, mismatched: result.mismatched,
      unverifiable: result.unverifiable, total: result.totalEvidence
    });

    if (!options.quiet) {
      console.log(`${file}: ${result.reliabilityScore}% reliable (${result.verified}/${result.totalEvidence} verified, ${result.mismatched} mismatched)`);
    }
  }

  // Sort by worst reliability first
  summary.results.sort((a, b) => a.reliability - b.reliability);

  if (!options.quiet) {
    console.log(`\nProcessed ${summary.processed}/${summary.total} files`);
    console.log('\n--- Worst reliability (need re-research) ---');
    summary.results.slice(0, 20).forEach(r => {
      console.log(`  ${r.reliability}% - ${r.file} (${r.mismatched} mismatched, ${r.unverifiable} unverifiable)`);
    });
  }

  return summary;
}

// CLI entry point
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  const singleFile = process.argv.find(a => a.endsWith('_enhanced.js'));

  if (singleFile) {
    flagSingleFile(path.basename(singleFile))
      .then(r => console.log(JSON.stringify(r, null, 2)))
      .catch(console.error);
  } else {
    flagAllFiles({ dryRun })
      .then(() => {
        if (dryRun) console.log('\n(dry run - no quality files written)');
      })
      .catch(console.error);
  }
}

module.exports = { flagSingleFile, flagAllFiles };
