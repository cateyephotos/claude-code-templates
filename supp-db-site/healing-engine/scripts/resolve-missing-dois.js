#!/usr/bin/env node
/**
 * resolve-missing-dois.js
 * Looks up DOIs for citations that have PMIDs but no DOI,
 * using the PubMed esummary API (batch of 200, 3 req/sec).
 * Then searches CrossRef for citations with title+year but no PMID.
 *
 * Usage:
 *   node resolve-missing-dois.js              # Full run
 *   node resolve-missing-dois.js --dry-run    # Show what would change
 *   node resolve-missing-dois.js --pmid-only  # Only PubMed lookups
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { loadEnhancedFile } = require('../utils/schema');
const { lookupPmidBatch } = require('../fixers/batch-api-client');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
const DRY_RUN = process.argv.includes('--dry-run');
const PMID_ONLY = process.argv.includes('--pmid-only');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGet(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
        }
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Collect all evidence items with PMID but no DOI, tracking file location
function collectMissingDois() {
  const files = fs.readdirSync(ENH_DIR)
    .filter(f => f.endsWith('_enhanced.js') && !f.endsWith('.bak'));

  const pmidLookups = []; // { file, pmid, path-to-evidence }
  const titleLookups = []; // { file, title, year, authors }

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
          if (ev.doi && ev.doi !== '') continue; // already has DOI

          if (ev.pmid && ev.pmid !== '' && ev.pmid !== 'N/A') {
            pmidLookups.push({
              file, pmid: ev.pmid,
              section: sectionName, citationIdx: ci, evidenceIdx: ei,
              title: ev.title || ''
            });
          } else if (ev.title && ev.title.trim() !== '') {
            titleLookups.push({
              file, title: ev.title, year: ev.year,
              authors: ev.authors || '',
              section: sectionName, citationIdx: ci, evidenceIdx: ei
            });
          }
        }
      }
    }
  }

  return { pmidLookups, titleLookups };
}

// Search CrossRef by title
async function searchCrossrefByTitle(title, year) {
  const query = encodeURIComponent(title.substring(0, 200));
  const url = `https://api.crossref.org/works?query.bibliographic=${query}&rows=3&select=DOI,title,published-print,published-online`;

  try {
    const resp = await httpGet(url);
    if (resp.status === 200 && resp.data && resp.data.message && resp.data.message.items) {
      for (const item of resp.data.message.items) {
        const itemTitle = Array.isArray(item.title) ? item.title[0] : (item.title || '');
        const similarity = simpleSimilarity(title, itemTitle);
        if (similarity >= 0.7) {
          return { doi: item.DOI, title: itemTitle, similarity };
        }
      }
    }
  } catch (e) {
    // Silently skip failed lookups
  }
  return null;
}

function simpleSimilarity(a, b) {
  if (!a || !b) return 0;
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1.0;
  const wordsA = new Set(na.split(/\s+/));
  const wordsB = new Set(nb.split(/\s+/));
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  return (2 * intersection.length) / (wordsA.size + wordsB.size);
}

// Apply DOI to a specific evidence item in a file
function applyDoiToFile(file, section, citationIdx, evidenceIdx, newDoi) {
  const filePath = path.join(ENH_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Parse the data to find the exact evidence item
  const data = loadEnhancedFile(filePath);
  if (!data || !data.citations) return false;

  const sectionArr = data.citations[section];
  if (!sectionArr || !sectionArr[citationIdx]) return false;
  const evidence = sectionArr[citationIdx].evidence;
  if (!evidence || !evidence[evidenceIdx]) return false;
  const ev = evidence[evidenceIdx];

  // Build a unique search context: find the evidence item by its PMID or title
  // Then replace its empty DOI with the new one
  const pmid = ev.pmid || '';
  const title = ev.title || '';

  // Strategy: find the evidence block by PMID/title, then find its doi field
  let searchAnchor = '';
  if (pmid) {
    searchAnchor = pmid;
  } else if (title) {
    searchAnchor = title.substring(0, 50);
  } else {
    return false;
  }

  // Find the anchor in the content
  let pos = 0;
  let found = false;
  while (true) {
    pos = content.indexOf(searchAnchor, pos);
    if (pos === -1) break;

    // Look for an empty doi near this position (within ~500 chars before and after)
    const searchStart = Math.max(0, pos - 300);
    const searchEnd = Math.min(content.length, pos + 500);
    const region = content.substring(searchStart, searchEnd);

    // Match empty doi patterns
    const emptyDoiPatterns = [
      { pattern: '"doi": ""', replacement: `"doi": "${newDoi}"` },
      { pattern: '"doi": \'\'', replacement: `"doi": "${newDoi}"` },
      { pattern: 'doi:  ""', replacement: `doi:  "${newDoi}"` },
      { pattern: 'doi: ""', replacement: `doi: "${newDoi}"` },
      { pattern: "doi:  ''", replacement: `doi:  "${newDoi}"` },
      { pattern: "doi: ''", replacement: `doi: "${newDoi}"` },
    ];

    for (const { pattern, replacement } of emptyDoiPatterns) {
      const doiPos = region.indexOf(pattern);
      if (doiPos !== -1) {
        const absoluteDoiPos = searchStart + doiPos;
        content = content.substring(0, absoluteDoiPos) + replacement +
          content.substring(absoluteDoiPos + pattern.length);
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
      }
    }

    pos += searchAnchor.length;
  }

  return false;
}

async function main() {
  console.log(`resolve-missing-dois.js${DRY_RUN ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(50));

  const { pmidLookups, titleLookups } = collectMissingDois();
  console.log(`\nFound ${pmidLookups.length} citations with PMID but no DOI`);
  console.log(`Found ${titleLookups.length} citations with title but no DOI/PMID`);

  // Phase 1: PubMed batch lookup
  console.log('\n--- Phase 1: PubMed PMID → DOI lookup ---');
  const uniquePmids = [...new Set(pmidLookups.map(l => l.pmid))];
  console.log(`Unique PMIDs to look up: ${uniquePmids.length}`);

  const pubmedResults = await lookupPmidBatch(uniquePmids);
  const pmidsWithDoi = Object.entries(pubmedResults).filter(([, v]) => v.doi && v.doi !== '');
  console.log(`PubMed returned DOIs for ${pmidsWithDoi.length} of ${uniquePmids.length} PMIDs`);

  // Apply PMID-based DOI fixes
  let pmidFixed = 0;
  let pmidNotFound = 0;
  const pmidDoiMap = {};
  for (const [pmid, data] of pmidsWithDoi) {
    pmidDoiMap[pmid] = data.doi;
  }

  for (const lookup of pmidLookups) {
    const doi = pmidDoiMap[lookup.pmid];
    if (!doi) {
      pmidNotFound++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  Would fix: ${lookup.file} [${lookup.section}][${lookup.citationIdx}].evidence[${lookup.evidenceIdx}] PMID ${lookup.pmid} → DOI ${doi}`);
      pmidFixed++;
    } else {
      const success = applyDoiToFile(lookup.file, lookup.section, lookup.citationIdx, lookup.evidenceIdx, doi);
      if (success) {
        pmidFixed++;
      } else {
        console.log(`  WARN: Could not apply DOI ${doi} to ${lookup.file} (PMID ${lookup.pmid})`);
      }
    }
  }

  console.log(`\nPMID phase: ${pmidFixed} DOIs ${DRY_RUN ? 'would be' : ''} resolved, ${pmidNotFound} PMIDs had no DOI in PubMed`);

  // Phase 2: CrossRef title search (if not --pmid-only)
  if (!PMID_ONLY && titleLookups.length > 0) {
    console.log('\n--- Phase 2: CrossRef title search ---');
    let crossrefFixed = 0;
    let crossrefNotFound = 0;

    for (const lookup of titleLookups) {
      const result = await searchCrossrefByTitle(lookup.title, lookup.year);
      if (result) {
        if (DRY_RUN) {
          console.log(`  Would fix: ${lookup.file} "${lookup.title.substring(0, 50)}..." → DOI ${result.doi} (similarity: ${result.similarity.toFixed(2)})`);
          crossrefFixed++;
        } else {
          const success = applyDoiToFile(lookup.file, lookup.section, lookup.citationIdx, lookup.evidenceIdx, result.doi);
          if (success) {
            crossrefFixed++;
          } else {
            console.log(`  WARN: Could not apply DOI ${result.doi} to ${lookup.file}`);
          }
        }
      } else {
        crossrefNotFound++;
      }
      await sleep(500); // Rate limit CrossRef
    }

    console.log(`\nCrossRef phase: ${crossrefFixed} DOIs ${DRY_RUN ? 'would be' : ''} resolved, ${crossrefNotFound} titles not found`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
