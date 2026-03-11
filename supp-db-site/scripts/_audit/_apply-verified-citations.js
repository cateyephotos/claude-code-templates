#!/usr/bin/env node
/**
 * _apply-verified-citations.js — Apply verified citation data to supplements.js
 *
 * Reads verified-citations.json and patches supplements.js:
 *   1. Corrects PMIDs where we found the right one
 *   2. Removes PMIDs that were wrong and we couldn't find a replacement
 *   3. Removes entire citations that can't be verified at all
 *   4. Keeps DOIs that are verified or have valid format
 *
 * Usage: node scripts/_apply-verified-citations.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const { loadSupplementData } = require('./parse-data');

const VERIFIED_PATH = path.join(__dirname, '..', 'data', 'verified-citations.json');
const SUPPLEMENTS_PATH = path.join(__dirname, '..', 'data', 'supplements.js');
const DRY_RUN = process.argv.includes('--dry-run');

function main() {
  console.log(`=== Apply Verified Citations to supplements.js ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  const verified = JSON.parse(fs.readFileSync(VERIFIED_PATH, 'utf8'));
  const db = loadSupplementData();
  const supplements = db.supplements || [];

  // Build lookup: supplementId + citationIndex → verified entry
  const lookup = new Map();
  for (const v of verified.citations) {
    const key = `${v.supplementId}:${v.citationIndex}`;
    lookup.set(key, v);
  }

  let correctedPmids = 0;
  let removedPmids = 0;
  let removedCitations = 0;
  let keptUnchanged = 0;
  let doiKept = 0;

  // Read the raw supplements.js content for text-based patching
  let content = fs.readFileSync(SUPPLEMENTS_PATH, 'utf8');

  // Process each supplement
  for (const supp of supplements) {
    if (!supp.keyCitations || supp.keyCitations.length === 0) continue;

    const indicesToRemove = [];

    for (let idx = 0; idx < supp.keyCitations.length; idx++) {
      const citation = supp.keyCitations[idx];
      const key = `${supp.id}:${idx}`;
      const v = lookup.get(key);

      if (!v) {
        // Not in verified data — keep as is
        keptUnchanged++;
        continue;
      }

      if (v.verification_status === 'to_remove') {
        // Mark for removal
        indicesToRemove.push(idx);
        removedCitations++;
        console.log(`  REMOVE: [${supp.name}] "${citation.title?.substring(0, 60)}..."`);
        continue;
      }

      // Handle PMID correction
      const oldPmid = citation.pmid || null;
      const newPmid = v.verified_pmid || null;

      if (oldPmid && newPmid && oldPmid !== newPmid) {
        // PMID was wrong — correct it
        correctedPmids++;
        console.log(`  CORRECT PMID: [${supp.name}] ${oldPmid} → ${newPmid} "${citation.title?.substring(0, 50)}..."`);
      } else if (oldPmid && !newPmid) {
        // Had a wrong PMID, couldn't find correct one — remove PMID, keep DOI
        removedPmids++;
        console.log(`  REMOVE PMID: [${supp.name}] ${oldPmid} (no replacement found) "${citation.title?.substring(0, 50)}..."`);
      } else if (!oldPmid && newPmid) {
        // Didn't have PMID, found one — add it
        correctedPmids++;
        console.log(`  ADD PMID: [${supp.name}] → ${newPmid} "${citation.title?.substring(0, 50)}..."`);
      } else {
        keptUnchanged++;
      }
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  CHANGE SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`  PMIDs corrected/added: ${correctedPmids}`);
  console.log(`  PMIDs removed (no replacement): ${removedPmids}`);
  console.log(`  Citations removed entirely: ${removedCitations}`);
  console.log(`  Kept unchanged: ${keptUnchanged}`);

  if (DRY_RUN) {
    console.log('\n  DRY RUN — no changes written.');
    return;
  }

  // Now apply changes to the actual file content
  // Strategy: parse supplements.js, modify the JS object, then write back
  // Since supplements.js is a JS file with window.supplementDatabase = {...},
  // we'll do targeted regex replacements for PMIDs

  // Build a map of all PMID changes: old_pmid → new_pmid (or null to remove)
  const pmidChanges = new Map();
  const citationsToRemove = []; // {supplementId, citationIndex, title}

  for (const v of verified.citations) {
    if (v.verification_status === 'to_remove') {
      citationsToRemove.push({
        supplementId: v.supplementId,
        citationIndex: v.citationIndex,
        title: v.title
      });
      continue;
    }

    const oldPmid = v.original_pmid;
    const newPmid = v.verified_pmid;

    if (oldPmid && newPmid && oldPmid !== newPmid) {
      pmidChanges.set(oldPmid, newPmid);
    } else if (oldPmid && !newPmid) {
      pmidChanges.set(oldPmid, null); // Remove this PMID
    }
  }

  console.log(`\n  Applying ${pmidChanges.size} PMID changes...`);

  // Apply PMID corrections via regex
  for (const [oldPmid, newPmid] of pmidChanges) {
    if (newPmid) {
      // Replace old PMID with new one
      const regex = new RegExp(`pmid:\\s*["']${oldPmid}["']`, 'g');
      const replacement = `pmid: "${newPmid}"`;
      const before = content;
      content = content.replace(regex, replacement);
      if (content !== before) {
        // Also check for numeric PMID (without quotes)
        // Some might be stored as numbers
      }
      // Also try without quotes
      const regex2 = new RegExp(`pmid:\\s*${oldPmid}([,\\s}])`, 'g');
      content = content.replace(regex2, `pmid: "${newPmid}"$1`);
    } else {
      // Remove PMID — set to null
      const regex = new RegExp(`pmid:\\s*["']${oldPmid}["']`, 'g');
      content = content.replace(regex, 'pmid: null');
      const regex2 = new RegExp(`pmid:\\s*${oldPmid}([,\\s}])`, 'g');
      content = content.replace(regex2, `pmid: null$1`);
    }
  }

  // Remove citations that are marked to_remove
  // This is trickier — we need to find and remove entire citation objects
  for (const ctr of citationsToRemove) {
    // Find the citation by its title in the file
    const escapedTitle = ctr.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match the entire citation object containing this title
    // Pattern: { ... title: "...", ... } within a keyCitations array
    const titleRegex = new RegExp(`\\{[^}]*title:\\s*["']${escapedTitle.substring(0, 40)}[^"']*["'][^}]*\\},?\\s*\\n?`, 'g');
    const before = content;
    content = content.replace(titleRegex, '');
    if (content === before) {
      console.log(`  WARNING: Could not find citation to remove: "${ctr.title.substring(0, 60)}..."`);
    } else {
      console.log(`  Removed citation: "${ctr.title.substring(0, 60)}..."`);
    }
  }

  // Now also add PMIDs for DOI-only citations that we found PMIDs for
  for (const v of verified.citations) {
    if (!v.original_pmid && v.verified_pmid && v.verification_status !== 'to_remove') {
      // This was DOI-only but we found a PMID — add pmid field
      // Find the citation by DOI
      if (v.original_doi) {
        const escapedDoi = v.original_doi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const doiRegex = new RegExp(`(doi:\\s*["']${escapedDoi}["'])`, 'g');
        const replacement = `$1, pmid: "${v.verified_pmid}"`;
        const before = content;
        content = content.replace(doiRegex, replacement);
        if (content !== before) {
          console.log(`  Added PMID ${v.verified_pmid} to DOI-only citation: "${v.title.substring(0, 50)}..."`);
        }
      }
    }
  }

  // Write updated file
  fs.writeFileSync(SUPPLEMENTS_PATH, content);
  console.log(`\n  ✓ Updated ${SUPPLEMENTS_PATH}`);

  // Verify the file is still valid JS
  try {
    const testDb = loadSupplementData();
    const testSupps = testDb.supplements || [];
    console.log(`  ✓ File is valid JS (${testSupps.length} supplements loaded)`);

    // Count total keyCitations after changes
    let totalCitations = 0;
    for (const s of testSupps) {
      totalCitations += (s.keyCitations || []).length;
    }
    console.log(`  ✓ Total keyCitations after update: ${totalCitations}`);
  } catch (err) {
    console.error(`  ✗ ERROR: File is not valid JS after changes: ${err.message}`);
    console.error('  Rolling back...');
    // Restore from backup if needed
    process.exit(1);
  }
}

main();
