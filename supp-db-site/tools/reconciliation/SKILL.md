---
name: supplement-db-reconciliation
description: >-
  End-to-end reconciliation and integrity verification of the Supplement Database.
  Validates consistency across all 7 architectural layers: master registry (supplements.js),
  citation loader mappings, data files on disk, category arrays, citation structure (PMID/DOI),
  enhanced flags, and browser-level rendering. Use after adding/modifying supplements, citation
  files, or loader entries. Triggers on: "reconcile", "verify database", "check consistency",
  "audit supplements", "integrity check".
---

# Supplement Database Reconciliation Skill

Performs a comprehensive 7-layer integrity check ensuring every supplement, citation file,
loader entry, and category reference is properly cross-linked and renders correctly in the browser.

## Why This Skill Exists

The supplement database has a multi-layer architecture where data must be consistent across:

```
supplements.js (master registry)
    ↕ cross-reference
EnhancedCitationLoader.js (file→ID mapping)
    ↕ cross-reference
data/enhanced_citations/*.js (data files on disk)
    ↕ cross-reference
Category arrays in supplements.js
    ↕ cross-reference
Citation content (PMID/DOI integrity)
    ↕ cross-reference
Enhanced flags (isEnhanced consistency)
    ↕ cross-reference
Browser rendering (Playwright visual verification)
```

Any break in this chain creates orphan data, missing citations, or rendering failures.
This skill was born from a multi-session audit that found:

- **Orphan data files** (IDs 90-93 had citation files but no registry entry)
- **333 incorrect PMIDs/DOIs** across 63 files
- **[object Object] rendering bugs** from malformed methodology fields
- **Category arrays** not updated when new supplements were added
- **Loader entries** pointing to non-existent files or wrong filenames

## The 7 Reconciliation Layers

### Layer 1: Master Registry Parse
**What:** Parse `data/supplements.js` and extract the `supplementDatabase` object.
**Checks:** File parses without error, no duplicate IDs, IDs are sequential.
**Why critical:** If this fails, nothing else works. The supplements.js file is the source of truth.

### Layer 2: Citation Loader Registry
**What:** Parse `js/EnhancedCitationLoader.js` and extract all `{ id, file, globalVar }` entries.
**Checks:** No duplicate loader entries, all entries have valid file/globalVar fields.
**Why critical:** The loader is the bridge between the app and the citation data files. Missing entries = invisible citations.

### Layer 3: Data Files on Disk
**What:** Scan `data/enhanced_citations/` directory for all `.js` files.
**Checks:** Each file maps to exactly one ID, no duplicate files per ID.
**Why critical:** Without the actual file, the loader throws 404s silently and the supplement appears to have no enhanced data.

### Layer 4: Cross-Reference (the most crucial layer)
**What:** Compare all three ID sets: supplements.js IDs, loader IDs, and file IDs.
**Checks:**
  - Every supplement ID appears in the loader (**prevents invisible citations**)
  - Every supplement ID has a data file (**prevents 404 loads**)
  - Every loader entry has a matching supplement (**prevents orphan loader entries**)
  - Every data file has a matching supplement (**prevents orphan data files** — the exact bug found with IDs 90-93)
  - Loader filenames match actual filenames on disk (**prevents wrong-file loads**)
**Why critical:** This is where Phase 3B failures were caught. The most common failure mode is adding citation data without updating the master registry.

### Layer 5: Category Consistency
**What:** Cross-reference each supplement's `category` field against the categories array.
**Checks:**
  - Every supplement's category exists in the categories array
  - Every supplement name is listed in its category's `supplements` array
  - No category lists a supplement that doesn't exist
**Why critical:** The UI groups supplements by category. A supplement not listed in its category's array won't appear in category filters.

### Layer 6: Citation Structural Integrity
**What:** Parse each enhanced citation file and validate its internal structure.
**Checks:**
  - Has PMID fields (validates format: 5-10 digits)
  - Has DOI fields (validates format: starts with "10.")
  - No `[object Object]` literals in file content
  - Has proper window/const export pattern
**Why critical:** Malformed PMIDs link to wrong PubMed articles. Missing DOIs mean no CrossRef links. [object Object] means the renderer is stringifying an object instead of accessing a property.

### Layer 7: Enhanced Flag Consistency
**What:** Verify the `enhancedCitations.isEnhanced` flag matches reality.
**Checks:**
  - Supplements with data files have `isEnhanced: true`
  - Supplements without data files don't have `isEnhanced: true`
**Why critical:** The UI uses this flag to show/hide the enhanced citation badge. A false positive shows a badge for empty data; a false negative hides real citation data.

## Workflow

### Phase 1: Automated Node.js Reconciliation (Primary)

```bash
# From supp-db-site/ directory:
node tools/reconciliation/reconcile.js

# With verbose per-supplement output:
node tools/reconciliation/reconcile.js --verbose

# Machine-readable for CI:
node tools/reconciliation/reconcile.js --json
```

**Interpret results:**
- Exit code 0 = all layers consistent
- Exit code 1 = errors found (details in output)
- Exit code 2 = fatal parse error (supplements.js broken)

### Phase 2: Browser-Level Verification (Secondary)

Use Playwright MCP to:

1. Navigate to `http://localhost:8080` (with cache clearing)
2. Wait for database load console message: `"Database loaded: N supplements"`
3. Check console for enhanced citation load success: `"✅ Loaded enhanced citations"`
4. Check for any `⚠️` warnings in console about failed loads
5. Optionally run `tools/reconciliation/browser-verify.js` in browser console
6. Spot-check 3-5 supplement modals for PMID/DOI link rendering

### Phase 3: Fix Identified Issues

Based on reconciliation output, the most common fixes are:

| Issue Type | Fix |
|---|---|
| `orphan_data_file` | Add supplement entry to `supplements.js` + update category array |
| `orphan_loader_entry` | Either add supplement entry OR remove loader entry |
| `missing_loader_entry` | Add `{ id, file, globalVar }` to `EnhancedCitationLoader.js` |
| `missing_data_file` | Create enhanced citation file using `/supplement-research-pipeline` |
| `missing_from_category` | Add supplement name to its category's `supplements` array |
| `missing_enhanced_flag` | Set `enhancedCitations: { "isEnhanced": true }` in supplement entry |

### Phase 4: Re-run to Confirm

After fixes, re-run `node tools/reconciliation/reconcile.js` to confirm zero errors.

## When to Run This Skill

- **After adding new supplements** to any layer
- **After modifying citation files** (PMID/DOI corrections)
- **After the supplement-research-pipeline** creates new enhanced citation files
- **Before committing to dev** as a final consistency check
- **After merging branches** that touched supplement data
- **Periodically** as a health check

## Key Files

| File | Role |
|---|---|
| `data/supplements.js` | Master registry — source of truth for all supplement entries |
| `js/EnhancedCitationLoader.js` | Maps supplement IDs → citation data files → global variable names |
| `js/EnhancedCitationAttacher.js` | Attaches loaded citation data to supplement objects at runtime |
| `js/CitationRenderer.js` | Renders citation data into HTML modals |
| `data/enhanced_citations/*.js` | Individual citation data files (one per enhanced supplement) |
| `tools/reconciliation/reconcile.js` | The Node.js reconciliation engine |
| `tools/reconciliation/browser-verify.js` | Browser console verification script |

## Architecture Diagram

```
┌─────────────────────┐     ┌──────────────────────────┐
│  supplements.js     │◄───►│  EnhancedCitationLoader  │
│  (93 entries)       │     │  (93 id→file mappings)   │
│  Layer 1            │     │  Layer 2                 │
└────────┬────────────┘     └────────────┬─────────────┘
         │                               │
         │ category field                │ file field
         ▼                               ▼
┌─────────────────────┐     ┌──────────────────────────┐
│  Categories Array   │     │  enhanced_citations/*.js  │
│  (13 categories)    │     │  (93 data files)         │
│  Layer 5            │     │  Layer 3                 │
└─────────────────────┘     └────────────┬─────────────┘
                                         │
         ┌───────────────────────────────┘
         │ runtime: load + attach
         ▼
┌─────────────────────────────────────────┐
│  EnhancedCitationAttacher               │
│  (attaches data to supplement objects)  │
└────────────┬────────────────────────────┘
             │ modal open
             ▼
┌─────────────────────────────────────────┐
│  CitationRenderer                       │
│  (renders PMID/DOI links in HTML)       │
│  Layer 6: citation structure            │
│  Layer 7: browser rendering             │
└─────────────────────────────────────────┘
```
