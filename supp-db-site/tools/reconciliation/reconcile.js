#!/usr/bin/env node
/**
 * Supplement Database Reconciliation Engine
 * ==========================================
 * Performs a comprehensive integrity check across all layers of the supplement
 * database architecture:
 *
 *   Layer 1: supplements.js master registry
 *   Layer 2: EnhancedCitationLoader.js file→ID mapping
 *   Layer 3: data/enhanced_citations/*.js data files on disk
 *   Layer 4: Category arrays in supplements.js
 *   Layer 5: Citation structural integrity (PMID/DOI presence)
 *   Layer 6: Cross-reference consistency (names, IDs, flags)
 *
 * Exit codes:
 *   0 = all checks pass
 *   1 = reconciliation errors found (details in output)
 *   2 = fatal parse/IO error
 *
 * Usage:
 *   node tools/reconciliation/reconcile.js [--fix] [--json] [--verbose]
 *
 *   --fix      Attempt auto-fix for recoverable issues (dry-run by default)
 *   --json     Output results as JSON (for CI pipelines)
 *   --verbose  Show per-supplement detail even when passing
 */

const fs = require('fs');
const path = require('path');

// ── Configuration ────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SUPPLEMENTS_JS = path.join(PROJECT_ROOT, 'data/supplements.js');
const ENHANCED_DIR = path.join(PROJECT_ROOT, 'data/enhanced_citations');
const LOADER_JS = path.join(PROJECT_ROOT, 'js/EnhancedCitationLoader.js');

const args = process.argv.slice(2);
const FLAG_FIX = args.includes('--fix');
const FLAG_JSON = args.includes('--json');
const FLAG_VERBOSE = args.includes('--verbose');

// ── Result Collection ────────────────────────────────────────────────────────

const results = {
  timestamp: new Date().toISOString(),
  layers: {},
  summary: { total_checks: 0, passed: 0, warnings: 0, errors: 0 },
  fixable: [],
  fatal: null
};

function check(layer, id, label, passed, detail = '', severity = 'error') {
  results.summary.total_checks++;
  if (!results.layers[layer]) results.layers[layer] = [];

  const entry = { id, label, passed, detail };
  results.layers[layer].push(entry);

  if (passed) {
    results.summary.passed++;
    if (FLAG_VERBOSE && !FLAG_JSON) console.log(`  ✅ [${layer}] ID ${id}: ${label}`);
  } else if (severity === 'warning') {
    results.summary.warnings++;
    if (!FLAG_JSON) console.log(`  ⚠️  [${layer}] ID ${id}: ${label} — ${detail}`);
  } else {
    results.summary.errors++;
    if (!FLAG_JSON) console.log(`  ❌ [${layer}] ID ${id}: ${label} — ${detail}`);
  }
}

// ── Layer 1: Parse supplements.js ────────────────────────────────────────────

function parseSupplementsDB() {
  if (!FLAG_JSON) console.log('\n━━━ Layer 1: Master Registry (supplements.js) ━━━');

  const content = fs.readFileSync(SUPPLEMENTS_JS, 'utf-8');
  const match = content.match(/const supplementDatabase = (\{[\s\S]*\});/);
  if (!match) {
    results.fatal = 'Could not extract supplementDatabase from supplements.js';
    return null;
  }

  try {
    const db = new Function('return ' + match[1])();
    const supplements = db.supplements || [];
    const categories = db.categories || [];

    if (!FLAG_JSON) console.log(`  Total supplements: ${supplements.length}`);
    if (!FLAG_JSON) console.log(`  Total categories: ${categories.length}`);

    // Check for duplicate IDs
    const idMap = {};
    for (const s of supplements) {
      if (idMap[s.id]) {
        check('registry', s.id, 'Unique ID', false, `Duplicate ID ${s.id}: "${s.name}" and "${idMap[s.id]}"`);
      } else {
        idMap[s.id] = s.name;
        check('registry', s.id, 'Unique ID', true);
      }
    }

    // Check sequential IDs
    const ids = supplements.map(s => s.id).sort((a, b) => a - b);
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] !== i + 1) {
        check('registry', ids[i], 'Sequential ID', false,
          `Gap or misnumbering at position ${i + 1}: found ID ${ids[i]}`, 'warning');
      }
    }

    return { supplements, categories, idMap, content };
  } catch (e) {
    results.fatal = `Parse error in supplements.js: ${e.message}`;
    return null;
  }
}

// ── Layer 2: Parse EnhancedCitationLoader.js ─────────────────────────────────

function parseLoaderRegistry() {
  if (!FLAG_JSON) console.log('\n━━━ Layer 2: Citation Loader Registry ━━━');

  const content = fs.readFileSync(LOADER_JS, 'utf-8');

  // Extract the enhancedFiles array entries
  const loaderEntries = [];
  const regex = /\{\s*id:\s*(\d+),\s*file:\s*'([^']+)',\s*globalVar:\s*'([^']+)'\s*\}/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    loaderEntries.push({
      id: parseInt(m[1]),
      file: m[2],
      globalVar: m[3]
    });
  }

  if (!FLAG_JSON) console.log(`  Loader entries: ${loaderEntries.length}`);

  // Check for duplicate loader IDs
  const loaderIds = {};
  for (const entry of loaderEntries) {
    if (loaderIds[entry.id]) {
      check('loader', entry.id, 'Unique loader entry', false,
        `Duplicate loader entry for ID ${entry.id}: "${entry.file}" and "${loaderIds[entry.id]}"`);
    } else {
      loaderIds[entry.id] = entry.file;
    }
  }

  return loaderEntries;
}

// ── Layer 3: Scan data files on disk ─────────────────────────────────────────

function scanDataFiles() {
  if (!FLAG_JSON) console.log('\n━━━ Layer 3: Enhanced Citation Data Files ━━━');

  const allFiles = fs.readdirSync(ENHANCED_DIR)
    .filter(f => f.endsWith('.js') && !f.startsWith('.'));

  // Parse ID from filename pattern: {id}_{name}_enhanced.js or {id}_enhanced.js
  const fileMap = {};
  for (const file of allFiles) {
    const idMatch = file.match(/^(\d+)_/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      if (fileMap[id]) {
        check('files', id, 'Single file per ID', false,
          `Multiple files for ID ${id}: "${file}" and "${fileMap[id]}"`);
      } else {
        fileMap[id] = file;
      }
    }
  }

  if (!FLAG_JSON) console.log(`  Data files on disk: ${Object.keys(fileMap).length}`);
  return fileMap;
}

// ── Layer 4: Cross-reference supplements ↔ loader ↔ files ────────────────────

function crossReferenceAll(supplements, loaderEntries, fileMap) {
  if (!FLAG_JSON) console.log('\n━━━ Layer 4: Cross-Reference (Registry ↔ Loader ↔ Files) ━━━');

  const supplementIds = new Set(supplements.map(s => s.id));
  const loaderIds = new Set(loaderEntries.map(e => e.id));
  const fileIds = new Set(Object.keys(fileMap).map(Number));

  // All three sets should be identical — check each direction:

  // 4a: Supplements missing from loader
  for (const id of supplementIds) {
    const inLoader = loaderIds.has(id);
    check('xref', id, 'Registered in loader', inLoader,
      inLoader ? '' : `ID ${id} (${supplements.find(s => s.id === id)?.name}) exists in supplements.js but NOT in EnhancedCitationLoader.js`);

    if (!inLoader) {
      results.fixable.push({ type: 'missing_loader_entry', id, name: supplements.find(s => s.id === id)?.name });
    }
  }

  // 4b: Supplements missing from data files
  for (const id of supplementIds) {
    const hasFile = fileIds.has(id);
    check('xref', id, 'Has data file on disk', hasFile,
      hasFile ? '' : `ID ${id} (${supplements.find(s => s.id === id)?.name}) has no enhanced citation file in data/enhanced_citations/`);

    if (!hasFile) {
      results.fixable.push({ type: 'missing_data_file', id, name: supplements.find(s => s.id === id)?.name });
    }
  }

  // 4c: Loader entries without supplement registration (orphan loader entries)
  for (const entry of loaderEntries) {
    const inSupplements = supplementIds.has(entry.id);
    check('xref', entry.id, 'Loader→Registry match', inSupplements,
      inSupplements ? '' : `Loader entry ID ${entry.id} (${entry.file}) has NO matching supplement in supplements.js — ORPHAN`);

    if (!inSupplements) {
      results.fixable.push({ type: 'orphan_loader_entry', id: entry.id, file: entry.file });
    }
  }

  // 4d: Data files without supplement registration (orphan data files)
  for (const [idStr, file] of Object.entries(fileMap)) {
    const id = parseInt(idStr);
    const inSupplements = supplementIds.has(id);
    check('xref', id, 'File→Registry match', inSupplements,
      inSupplements ? '' : `Data file "${file}" has NO matching supplement in supplements.js — ORPHAN`);

    if (!inSupplements) {
      results.fixable.push({ type: 'orphan_data_file', id, file });
    }
  }

  // 4e: Loader entry filenames match actual files on disk
  for (const entry of loaderEntries) {
    const actualFile = fileMap[entry.id];
    if (actualFile && actualFile !== entry.file) {
      check('xref', entry.id, 'Loader filename matches disk', false,
        `Loader says "${entry.file}" but disk has "${actualFile}"`);
      results.fixable.push({ type: 'filename_mismatch', id: entry.id, loader: entry.file, disk: actualFile });
    } else if (actualFile) {
      check('xref', entry.id, 'Loader filename matches disk', true);
    }
  }
}

// ── Layer 5: Category Consistency ────────────────────────────────────────────

function checkCategories(supplements, categories) {
  if (!FLAG_JSON) console.log('\n━━━ Layer 5: Category Consistency ━━━');

  // Build a map of category → registered supplements
  const catMap = {};
  for (const cat of categories) {
    catMap[cat.name] = new Set(cat.supplements || []);
  }

  // Build a flat set of ALL supplement names listed in ANY category
  const allCategorizedNames = new Set();
  for (const cat of categories) {
    for (const name of (cat.supplements || [])) {
      allCategorizedNames.add(name);
    }
  }

  // The supplement entry `category` field often uses a singular/specific name
  // (e.g., "Nootropic", "Adaptogen") while the categories array uses plural/broader
  // names (e.g., "Nootropics", "Adaptogens"). Build a fuzzy alias map.
  const categoryAliases = {
    'Nootropic': 'Nootropics',
    'Adaptogen': 'Adaptogens',
    'Antioxidant': 'Antioxidants',
    'Performance Enhancer': 'Performance Enhancers',
    'Amino Acid': 'Amino Acids',
    'Essential Mineral': 'Essential Nutrients',
    'Vitamin': 'Essential Nutrients',
    'Essential Fatty Acid': 'Essential Nutrients',
    'Phospholipid': 'Nootropics',
    'Choline Compound': 'Nootropics',
    'Herbal Extract': 'Herbal Extracts',
    'Plant Alkaloid': 'Metabolic Support',
    'Flavonoid': 'Antioxidants',
    'Joint Support': 'Anti-inflammatory',
    'Sleep Aid': 'Sleep Support',
    'Polyphenol': 'Polyphenols',
    'Protein': 'Performance Enhancers',
  };

  // 5a: Check that every supplement is listed in at least one category array
  for (const s of supplements) {
    const inAnyCat = allCategorizedNames.has(s.name);
    if (!inAnyCat) {
      check('categories', s.id, 'Listed in a category array', false,
        `"${s.name}" is NOT listed in any category's supplements array`);
      results.fixable.push({ type: 'missing_from_category', id: s.id, name: s.name, category: s.category });
    } else {
      check('categories', s.id, 'Listed in a category array', true);
    }
  }

  // 5b: Check that the supplement's category field resolves to a real category
  for (const s of supplements) {
    const cat = s.category;
    const resolvedCat = catMap[cat] ? cat : categoryAliases[cat];
    if (!resolvedCat || !catMap[resolvedCat]) {
      check('categories', s.id, 'Category field resolvable', false,
        `"${s.name}" has category="${cat}" which doesn't match or alias to any category in the array`,
        'warning');
    } else {
      check('categories', s.id, 'Category field resolvable', true);
    }
  }

  // 5c: Reverse check — category lists supplements that don't exist in the DB
  const supplementNames = new Set(supplements.map(s => s.name));
  for (const cat of categories) {
    for (const suppName of (cat.supplements || [])) {
      if (!supplementNames.has(suppName)) {
        check('categories', 0, 'Category entry exists in DB', false,
          `Category "${cat.name}" lists "${suppName}" but no supplement with that name exists`, 'warning');
      }
    }
  }

  if (!FLAG_JSON) {
    const missingFromCats = supplements.filter(s => !allCategorizedNames.has(s.name));
    if (missingFromCats.length > 0) {
      console.log(`  ⚠️  ${missingFromCats.length} supplements not listed in any category`);
    } else {
      console.log(`  ✅ All ${supplements.length} supplements are listed in at least one category`);
    }
  }
}

// ── Layer 6: Citation Structural Integrity ──────────────────────────────────

function checkCitationStructure(fileMap) {
  if (!FLAG_JSON) console.log('\n━━━ Layer 6: Citation Structural Integrity ━━━');

  let totalCitations = 0;
  let totalPMIDs = 0;
  let totalDOIs = 0;
  let missingPMIDs = 0;
  let missingDOIs = 0;
  const pmidIssues = [];
  const doiIssues = [];

  for (const [idStr, file] of Object.entries(fileMap)) {
    const id = parseInt(idStr);
    const filePath = path.join(ENHANCED_DIR, file);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract all citations by looking for pmid/doi fields
      const pmidMatches = content.match(/pmid:\s*['"]?(\d+)['"]?/g) || [];
      const doiMatches = content.match(/doi:\s*['"]([^'"]+)['"]/g) || [];

      // Count study objects (rough heuristic: lines with 'title:' inside citations)
      const studyCount = (content.match(/title:\s*['"]/g) || []).length;

      totalCitations += studyCount;
      totalPMIDs += pmidMatches.length;
      totalDOIs += doiMatches.length;

      // Validate PMID format
      for (const pm of pmidMatches) {
        const pmidVal = pm.match(/(\d+)/)[1];
        if (pmidVal.length < 5 || pmidVal.length > 10) {
          check('citations', id, 'Valid PMID format', false,
            `Suspicious PMID length in ${file}: ${pmidVal}`, 'warning');
          missingPMIDs++;
        }
      }

      // Validate DOI format (should start with 10.)
      for (const dm of doiMatches) {
        const doiVal = dm.match(/doi:\s*['"]([^'"]+)['"]/)[1];
        if (!doiVal.startsWith('10.')) {
          check('citations', id, 'Valid DOI format', false,
            `Invalid DOI in ${file}: "${doiVal}" does not start with "10."`, 'warning');
          missingDOIs++;
        }
      }

      // Check for studies without PMIDs
      if (studyCount > 0 && pmidMatches.length === 0) {
        check('citations', id, 'Has PMIDs', false,
          `${file} has ${studyCount} studies but NO PMIDs`, 'warning');
        pmidIssues.push({ id, file, studies: studyCount });
      } else {
        check('citations', id, 'Has PMIDs', true);
      }

      // Check for studies without DOIs
      if (studyCount > 0 && doiMatches.length === 0) {
        check('citations', id, 'Has DOIs', false,
          `${file} has ${studyCount} studies but NO DOIs`, 'warning');
        doiIssues.push({ id, file, studies: studyCount });
      } else {
        check('citations', id, 'Has DOIs', true);
      }

      // Check for [object Object] rendering bug pattern
      const objectObjectMatch = content.match(/\[object Object\]/g);
      if (objectObjectMatch) {
        check('citations', id, 'No [object Object] literals', false,
          `${file} contains ${objectObjectMatch.length} "[object Object]" literal(s) — rendering bug`);
      }

      // Check globalVar assignment pattern
      const hasWindowAssign = content.includes('window.') || content.includes('const ');
      if (!hasWindowAssign) {
        check('citations', id, 'Has proper export pattern', false,
          `${file} has no window.xxx or const assignment — may not load correctly`, 'warning');
      }

    } catch (e) {
      check('citations', id, 'File readable', false, `Cannot read ${file}: ${e.message}`);
    }
  }

  if (!FLAG_JSON) {
    console.log(`\n  📊 Citation Totals:`);
    console.log(`     Studies: ~${totalCitations}`);
    console.log(`     PMIDs:   ${totalPMIDs}`);
    console.log(`     DOIs:    ${totalDOIs}`);
    if (pmidIssues.length) console.log(`     ⚠️  Files missing PMIDs: ${pmidIssues.length}`);
    if (doiIssues.length) console.log(`     ⚠️  Files missing DOIs: ${doiIssues.length}`);
  }
}

// ── Layer 7: Enhanced Flag Consistency ───────────────────────────────────────

function checkEnhancedFlags(supplements, fileMap) {
  if (!FLAG_JSON) console.log('\n━━━ Layer 7: Enhanced Flag Consistency ━━━');

  for (const s of supplements) {
    const hasFile = fileMap[s.id] !== undefined;
    const hasEnhancedFlag = s.enhancedCitations && s.enhancedCitations.isEnhanced === true;

    if (hasFile && !hasEnhancedFlag) {
      // The EnhancedCitationAttacher sets isEnhanced at runtime, so a missing
      // static flag is a cosmetic issue, not a functional break. Report as warning.
      check('flags', s.id, 'Static isEnhanced flag set', false,
        `"${s.name}" has data file but no static enhancedCitations.isEnhanced in supplements.js (runtime attacher will set it)`,
        'warning');
      results.fixable.push({ type: 'missing_enhanced_flag', id: s.id, name: s.name });
    } else if (!hasFile && hasEnhancedFlag) {
      check('flags', s.id, 'isEnhanced matches reality', false,
        `"${s.name}" has isEnhanced=true but NO data file exists — phantom enhanced badge`);
    } else {
      check('flags', s.id, 'isEnhanced flag consistent', true);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!FLAG_JSON) {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║       Supplement Database Reconciliation Engine v1.0        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
  }

  // Layer 1
  const db = parseSupplementsDB();
  if (!db) {
    if (FLAG_JSON) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.error(`\n💀 FATAL: ${results.fatal}`);
    }
    process.exit(2);
  }

  // Layer 2
  const loaderEntries = parseLoaderRegistry();

  // Layer 3
  const fileMap = scanDataFiles();

  // Layer 4: Cross-reference
  crossReferenceAll(db.supplements, loaderEntries, fileMap);

  // Layer 5: Categories
  checkCategories(db.supplements, db.categories);

  // Layer 6: Citation structure
  checkCitationStructure(fileMap);

  // Layer 7: Enhanced flags
  checkEnhancedFlags(db.supplements, fileMap);

  // ── Summary ──────────────────────────────────────────────────────────────

  if (!FLAG_JSON) {
    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('  RECONCILIATION SUMMARY');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`  Total checks: ${results.summary.total_checks}`);
    console.log(`  ✅ Passed:    ${results.summary.passed}`);
    console.log(`  ⚠️  Warnings:  ${results.summary.warnings}`);
    console.log(`  ❌ Errors:    ${results.summary.errors}`);

    if (results.fixable.length > 0) {
      console.log(`\n  🔧 Fixable issues: ${results.fixable.length}`);
      const grouped = {};
      for (const fix of results.fixable) {
        grouped[fix.type] = (grouped[fix.type] || 0) + 1;
      }
      for (const [type, count] of Object.entries(grouped)) {
        console.log(`     - ${type}: ${count}`);
      }
    }

    if (results.summary.errors === 0 && results.summary.warnings === 0) {
      console.log('\n  🎉 ALL LAYERS RECONCILED — DATABASE IS CONSISTENT');
    } else if (results.summary.errors === 0) {
      console.log('\n  ✅ No errors found (warnings are informational)');
    } else {
      console.log('\n  ⛔ RECONCILIATION FAILED — errors require attention');
    }

    console.log('══════════════════════════════════════════════════════════════\n');
  }

  if (FLAG_JSON) {
    console.log(JSON.stringify(results, null, 2));
  }

  process.exit(results.summary.errors > 0 ? 1 : 0);
}

main();
