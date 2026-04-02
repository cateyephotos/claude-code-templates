# Citation Data Remediation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-research and replace unreliable citation data across 93 enhanced citation files, flag data quality, verify via PubMed/CrossRef, and regenerate all HTML pages.

**Architecture:** A 4-phase pipeline: (1) flag every evidence item with a reliability status, (2) re-research affected supplements via PubMed esearch API using claim text, (3) verify all replacements via title-similarity cross-check with a human review gate, (4) regenerate all page types and visual-diff with Playwright. Each phase produces a machine-readable report consumed by the next phase.

**Tech Stack:** Node.js, PubMed E-utilities API (esearch + esummary + efetch), CrossRef works API, Playwright (browser verification), existing healing-engine infrastructure.

---

## File Structure

```
healing-engine/
├── scripts/
│   ├── flag-evidence-quality.js       # Phase 1: tag each evidence item
│   ├── re-research-supplement.js      # Phase 2: PubMed-driven re-research per supplement
│   ├── verify-replacements.js         # Phase 3: cross-validate replacements
│   └── regenerate-and-diff.js         # Phase 4: regenerate pages + visual diff
├── fixers/
│   └── batch-api-client.js            # Modify: add esearch + efetch
├── utils/
│   └── schema.js                      # Modify: add writeEnhancedFile
└── config.js                          # Modify: add esearch API config

data/enhanced_citations/
├── _quality/                          # NEW: quality metadata sidecar files
│   ├── 1_bacopa_monnieri_quality.json
│   └── ...
└── _archive/                          # EXISTING: backup before replacements

tests/healing-engine/
├── flag-evidence.spec.js
├── re-research.spec.js
├── verify-replacements.spec.js
└── regenerate-diff.spec.js

healing-reports/
└── remediation/                       # NEW: per-supplement remediation reports
    ├── bacopa-monnieri-remediation.json
    └── ...
```

---

## Chunk 1: Foundation — API Client + Quality Flagging

### Task 1: Add PubMed esearch to batch-api-client.js

PubMed `esearch` lets us search by title/keywords and get back PMIDs. This is the core of re-research: we search for the claim text and find the real papers.

**Files:**
- Modify: `healing-engine/fixers/batch-api-client.js`
- Modify: `healing-engine/config.js`
- Test: `tests/healing-engine/re-research.spec.js`

- [ ] **Step 1: Write the failing test for esearch**

```javascript
// tests/healing-engine/re-research.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

test.describe('PubMed esearch', () => {
  test('searchPubMed returns PMIDs for a known query', async () => {
    const { searchPubMed } = require(path.join(__dirname, '..', '..', 'healing-engine', 'fixers', 'batch-api-client'));
    const results = await searchPubMed('curcumin anti-inflammatory randomized controlled trial', { maxResults: 5 });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatch(/^\d+$/); // PMIDs are numeric strings
  });

  test('searchPubMed returns empty array for nonsense query', async () => {
    const { searchPubMed } = require(path.join(__dirname, '..', '..', 'healing-engine', 'fixers', 'batch-api-client'));
    const results = await searchPubMed('xyzzy9999notarealquery', { maxResults: 5 });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/healing-engine/re-research.spec.js --grep "searchPubMed" -x`
Expected: FAIL — `searchPubMed is not a function`

- [ ] **Step 3: Add esearch config to config.js**

Add to `apis.pubmed` in `healing-engine/config.js`:
```javascript
// Inside apis.pubmed, add:
esearchUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
efetchUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi',
```

- [ ] **Step 4: Implement searchPubMed in batch-api-client.js**

Add to `healing-engine/fixers/batch-api-client.js`:
```javascript
async function searchPubMed(query, options = {}) {
  const maxResults = options.maxResults || 10;
  const params = new URLSearchParams({
    db: 'pubmed',
    term: query,
    retmax: String(maxResults),
    retmode: 'json',
    sort: 'relevance'
  });
  const url = `${config.apis.pubmed.esearchUrl || config.apis.pubmed.baseUrl + 'esearch.fcgi'}?${params}`;

  try {
    const resp = await httpGet(url);
    if (resp.data && resp.data.esearchresult && resp.data.esearchresult.idlist) {
      return resp.data.esearchresult.idlist;
    }
    return [];
  } catch (e) {
    logger.warn(`PubMed esearch failed: ${e.message}`);
    return [];
  }
}
```

Add `searchPubMed` to the `module.exports`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx playwright test tests/healing-engine/re-research.spec.js --grep "searchPubMed"`
Expected: 2 tests PASS

- [ ] **Step 6: Commit**

```bash
git add healing-engine/fixers/batch-api-client.js healing-engine/config.js tests/healing-engine/re-research.spec.js
git commit -m "feat(healing): add PubMed esearch API for claim-based citation lookup"
```

---

### Task 2: Add writeEnhancedFile to schema utils

We need a way to write back modified enhanced citation data while preserving the file's module format (some use `window.xxx = {}`, some use `const xxx = {}`).

**Files:**
- Modify: `healing-engine/utils/schema.js`
- Test: `tests/healing-engine/utils.spec.js`

- [ ] **Step 1: Write the failing test**

Add to `tests/healing-engine/utils.spec.js`:
```javascript
test('writeEnhancedFile preserves file format and round-trips', () => {
  const { loadEnhancedFile, writeEnhancedFile } = require(path.join(__dirname, '..', '..', 'healing-engine', 'utils', 'schema'));
  const fs = require('fs');
  const testFile = path.join(__dirname, '..', '..', 'data', 'enhanced_citations', '8_melatonin_enhanced.js');
  const original = fs.readFileSync(testFile, 'utf8');
  const data = loadEnhancedFile(testFile);
  expect(data).toBeTruthy();

  // Write to a temp file and read back
  const tmpFile = path.join(__dirname, '_test_write_enhanced.js');
  writeEnhancedFile(tmpFile, data, { sourceFile: testFile });
  const roundTripped = loadEnhancedFile(tmpFile);
  expect(roundTripped.id || roundTripped.supplementId).toBe(data.id || data.supplementId);
  expect(roundTripped.citations).toBeTruthy();
  expect(Object.keys(roundTripped.citations).length).toBeGreaterThan(0);

  // Cleanup
  fs.unlinkSync(tmpFile);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/healing-engine/utils.spec.js --grep "writeEnhancedFile"`
Expected: FAIL — `writeEnhancedFile is not a function`

- [ ] **Step 3: Implement writeEnhancedFile**

Add to `healing-engine/utils/schema.js`:
```javascript
function writeEnhancedFile(filePath, data, options = {}) {
  const fs = require('fs');
  let header = '';
  let format = 'const'; // default

  // If sourceFile provided, detect format from it
  if (options.sourceFile && fs.existsSync(options.sourceFile)) {
    const source = fs.readFileSync(options.sourceFile, 'utf8');
    // Preserve comment header
    const headerLines = [];
    for (const line of source.split('\n')) {
      if (line.startsWith('//')) headerLines.push(line);
      else break;
    }
    header = headerLines.join('\n') + (headerLines.length ? '\n\n' : '');

    if (source.includes('window.enhancedCitations')) format = 'window';
    else if (source.includes('module.exports')) format = 'module';
    else format = 'const';
  }

  const json = JSON.stringify(data, null, 2);

  let content;
  if (format === 'window') {
    const varName = data.supplementName
      ? data.supplementName.replace(/[^a-zA-Z0-9]/g, '') + 'Enhanced'
      : 'enhancedData';
    content = `${header}window.enhancedCitations = window.enhancedCitations || {};\n\nwindow.${varName.charAt(0).toLowerCase() + varName.slice(1)} = ${json};\n`;
  } else if (format === 'module') {
    content = `${header}module.exports = ${json};\n`;
  } else {
    const varName = data.name
      ? data.name.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toLowerCase() + data.name.replace(/[^a-zA-Z0-9]/g, '').slice(1) + 'Enhanced'
      : 'enhancedData';
    content = `${header}const ${varName} = ${json};\n\nif (typeof module !== 'undefined') module.exports = ${varName};\nif (typeof window !== 'undefined') window.enhancedCitations = Object.assign(window.enhancedCitations || {}, { ${varName} });\n`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
}
```

Add `writeEnhancedFile` to `module.exports`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/healing-engine/utils.spec.js --grep "writeEnhancedFile"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add healing-engine/utils/schema.js tests/healing-engine/utils.spec.js
git commit -m "feat(healing): add writeEnhancedFile for round-trip enhanced citation editing"
```

---

### Task 3: Phase 1 — Flag evidence quality per file

Reads each enhanced file, cross-checks PMIDs against PubMed titles, and writes a sidecar `_quality/*.json` with per-evidence-item status tags.

**Files:**
- Create: `healing-engine/scripts/flag-evidence-quality.js`
- Create: `data/enhanced_citations/_quality/` (directory)
- Test: `tests/healing-engine/flag-evidence.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/flag-evidence.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Flag Evidence Quality', () => {
  test('flagSingleFile produces quality sidecar with expected structure', async () => {
    const { flagSingleFile } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 'flag-evidence-quality'));

    // Use melatonin (has titles, can verify)
    const result = await flagSingleFile('8_melatonin_enhanced.js');
    expect(result).toBeTruthy();
    expect(result.file).toBe('8_melatonin_enhanced.js');
    expect(result.totalEvidence).toBeGreaterThan(0);
    expect(typeof result.verified).toBe('number');
    expect(typeof result.mismatched).toBe('number');
    expect(typeof result.unverifiable).toBe('number');
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items[0]).toHaveProperty('status');
    expect(['verified', 'mismatched', 'questionable', 'unverifiable', 'no_pmid']).toContain(result.items[0].status);
  }, 60000);

  test('flagSingleFile handles title-less files correctly', async () => {
    const { flagSingleFile } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 'flag-evidence-quality'));

    // Rhodiola has no titles — all should be 'unverifiable'
    const result = await flagSingleFile('10_rhodiola_rosea_enhanced.js');
    expect(result).toBeTruthy();
    expect(result.unverifiable).toBe(result.totalEvidence);
  }, 60000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/healing-engine/flag-evidence.spec.js -x`
Expected: FAIL — `flagSingleFile is not a function`

- [ ] **Step 3: Create _quality directory**

```bash
mkdir -p data/enhanced_citations/_quality
```

- [ ] **Step 4: Implement flag-evidence-quality.js**

```javascript
// healing-engine/scripts/flag-evidence-quality.js
'use strict';

const fs = require('fs');
const path = require('path');
const { loadEnhancedFile } = require('../utils/schema');
const { lookupPmidBatch, simpleSimilarity } = require('../fixers/batch-api-client');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
const QUALITY_DIR = path.join(ENH_DIR, '_quality');

const MATCH_THRESHOLD = 0.6;
const MISMATCH_THRESHOLD = 0.4;

async function flagSingleFile(filename) {
  const filePath = path.join(ENH_DIR, filename);
  const data = loadEnhancedFile(filePath);
  if (!data || !data.citations) return null;

  const items = [];
  const pmidsToLookup = new Set();

  // Collect all evidence items
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
        if (item.pmid && item.pmid !== '') pmidsToLookup.add(item.pmid);
      }
    }
  }

  // Batch lookup PMIDs
  const pubmedData = pmidsToLookup.size > 0
    ? await lookupPmidBatch([...pmidsToLookup])
    : {};

  // Classify each item
  let verified = 0, mismatched = 0, questionable = 0, unverifiable = 0, noPmid = 0;

  for (const item of items) {
    if (!item.pmid) {
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
      const emoji = result.reliabilityScore >= 80 ? '✅' :
                     result.reliabilityScore >= 50 ? '⚠️' : '❌';
      console.log(`${emoji} ${file}: ${result.reliabilityScore}% reliable (${result.verified}/${result.totalEvidence} verified, ${result.mismatched} mismatched)`);
    }
  }

  // Sort by worst reliability
  summary.results.sort((a, b) => a.reliability - b.reliability);

  if (!options.quiet) {
    console.log(`\nProcessed ${summary.processed}/${summary.total} files`);
    console.log('\n--- Worst reliability (need re-research) ---');
    summary.results.slice(0, 20).forEach(r => {
      console.log(`  ${r.reliability}% — ${r.file} (${r.mismatched} mismatched, ${r.unverifiable} unverifiable)`);
    });
  }

  return summary;
}

// CLI
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  const singleFile = process.argv.find(a => a.endsWith('_enhanced.js'));

  if (singleFile) {
    flagSingleFile(path.basename(singleFile))
      .then(r => console.log(JSON.stringify(r, null, 2)))
      .catch(console.error);
  } else {
    flagAllFiles({ dryRun })
      .then(s => {
        if (dryRun) console.log('\n(dry run — no quality files written)');
      })
      .catch(console.error);
  }
}

module.exports = { flagSingleFile, flagAllFiles };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx playwright test tests/healing-engine/flag-evidence.spec.js`
Expected: 2 tests PASS

- [ ] **Step 6: Run flagAllFiles to generate quality metadata for all 93 files**

```bash
cd supp-db-site && HEALING_QUIET=true node healing-engine/scripts/flag-evidence-quality.js
```

Expected: 93 quality JSON sidecars written to `data/enhanced_citations/_quality/`. Console shows reliability scores per file.

- [ ] **Step 7: Commit**

```bash
git add healing-engine/scripts/flag-evidence-quality.js tests/healing-engine/flag-evidence.spec.js data/enhanced_citations/_quality/
git commit -m "feat(healing): Phase 1 — flag evidence quality with PubMed cross-validation"
```

---

## Chunk 2: Re-Research Pipeline

### Task 4: Build the re-research engine

For each supplement with low reliability, this script:
1. Reads the existing claims (mechanism text, benefit claims, safety aspects, dosage ranges)
2. Searches PubMed for each claim using esearch
3. Fetches metadata for top results via esummary
4. Scores matches by relevance (title similarity + year proximity + study type)
5. Produces a candidate replacement set with confidence scores

**Files:**
- Create: `healing-engine/scripts/re-research-supplement.js`
- Test: `tests/healing-engine/re-research.spec.js` (add to existing)

- [ ] **Step 1: Write the failing test**

Add to `tests/healing-engine/re-research.spec.js`:
```javascript
test.describe('Re-research Engine', () => {
  test('reResearchClaim finds relevant PubMed papers for a specific claim', async () => {
    const { reResearchClaim } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 're-research-supplement'));

    const candidates = await reResearchClaim({
      claimText: 'Curcumin inhibits NF-κB inflammatory pathway',
      supplementName: 'Curcumin',
      section: 'mechanisms',
      maxCandidates: 5
    });

    expect(Array.isArray(candidates)).toBe(true);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]).toHaveProperty('pmid');
    expect(candidates[0]).toHaveProperty('title');
    expect(candidates[0]).toHaveProperty('doi');
    expect(candidates[0]).toHaveProperty('relevanceScore');
    expect(candidates[0].relevanceScore).toBeGreaterThan(0);
  }, 30000);

  test('reResearchSupplement processes all claims for a supplement', async () => {
    const { reResearchSupplement } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 're-research-supplement'));

    // Use a small file for testing
    const result = await reResearchSupplement('12_phosphatidylserine_enhanced.js', {
      maxCandidatesPerClaim: 3,
      onlyMismatched: true
    });

    expect(result).toBeTruthy();
    expect(result.file).toBe('12_phosphatidylserine_enhanced.js');
    expect(Array.isArray(result.claims)).toBe(true);
    expect(result.claims.length).toBeGreaterThan(0);
  }, 120000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/healing-engine/re-research.spec.js --grep "Re-research" -x`
Expected: FAIL — `reResearchClaim is not a function`

- [ ] **Step 3: Implement re-research-supplement.js**

```javascript
// healing-engine/scripts/re-research-supplement.js
'use strict';

const fs = require('fs');
const path = require('path');
const { loadEnhancedFile } = require('../utils/schema');
const { searchPubMed, lookupPmidBatch, simpleSimilarity } = require('../fixers/batch-api-client');
const config = require('../config');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
const QUALITY_DIR = path.join(ENH_DIR, '_quality');
const REPORT_DIR = path.join(__dirname, '..', '..', '..', 'healing-reports', 'remediation');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Search PubMed for a specific scientific claim and return ranked candidates.
 */
async function reResearchClaim(options) {
  const { claimText, supplementName, section, maxCandidates = 5 } = options;

  // Build search query: supplement name + key terms from claim
  const query = `${supplementName} ${claimText}`.substring(0, 300);
  const pmids = await searchPubMed(query, { maxResults: maxCandidates * 2 });

  if (pmids.length === 0) return [];

  await sleep(350); // PubMed rate limit
  const metadata = await lookupPmidBatch(pmids);

  // Score and rank candidates
  const candidates = [];
  for (const pmid of pmids) {
    const pm = metadata[pmid];
    if (!pm || !pm.title) continue;

    const titleSim = simpleSimilarity(claimText, pm.title);
    const supplementMention = pm.title.toLowerCase().includes(supplementName.toLowerCase()) ? 0.2 : 0;
    const relevanceScore = parseFloat((titleSim * 0.7 + supplementMention + 0.1).toFixed(3));

    candidates.push({
      pmid,
      title: pm.title,
      authors: pm.authors || [],
      year: pm.year,
      journal: pm.journal || '',
      doi: pm.doi || '',
      relevanceScore,
      titleSimilarity: parseFloat(titleSim.toFixed(3))
    });
  }

  // Sort by relevance, take top N
  candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return candidates.slice(0, maxCandidates);
}

/**
 * Re-research all claims for a single supplement file.
 * Reads quality sidecar to know which items need re-research.
 */
async function reResearchSupplement(filename, options = {}) {
  const { maxCandidatesPerClaim = 5, onlyMismatched = false } = options;

  const filePath = path.join(ENH_DIR, filename);
  const data = loadEnhancedFile(filePath);
  if (!data || !data.citations) return null;

  const supplementName = data.supplementName || data.name || '';

  // Load quality sidecar if available
  const qualityFile = path.join(QUALITY_DIR, filename.replace('_enhanced.js', '_quality.json'));
  let qualityData = null;
  if (fs.existsSync(qualityFile)) {
    qualityData = JSON.parse(fs.readFileSync(qualityFile, 'utf8'));
  }

  const claims = [];
  const sectionKeys = config.schema.citationSections;
  const groupKeys = config.schema.groupKeyFields;

  for (const section of sectionKeys) {
    const sectionArr = data.citations[section];
    if (!Array.isArray(sectionArr)) continue;

    for (let ci = 0; ci < sectionArr.length; ci++) {
      const citation = sectionArr[ci];
      const groupKey = groupKeys[section];
      const claimText = citation[groupKey] || citation.claim || citation.specificClaim || '';

      if (!claimText) continue;

      // Check if this claim has mismatched evidence
      let needsReresearch = !onlyMismatched; // if not filtering, research all
      if (onlyMismatched && qualityData) {
        const claimItems = qualityData.items.filter(
          i => i.section === section && i.citationIdx === ci
        );
        needsReresearch = claimItems.some(
          i => i.status === 'mismatched' || i.status === 'unverifiable'
        );
      }

      if (!needsReresearch) continue;

      const candidates = await reResearchClaim({
        claimText, supplementName, section,
        maxCandidates: maxCandidatesPerClaim
      });

      claims.push({
        section, citationIdx: ci,
        claimText: claimText.substring(0, 200),
        currentEvidence: (citation.evidence || []).map(ev => ({
          pmid: ev.pmid || '', doi: ev.doi || '', title: (ev.title || '').substring(0, 100)
        })),
        candidates,
        topCandidateScore: candidates.length > 0 ? candidates[0].relevanceScore : 0
      });

      await sleep(400); // Rate limit between claims
    }
  }

  const result = {
    file: filename,
    supplementName,
    timestamp: new Date().toISOString(),
    totalClaims: claims.length,
    claimsWithCandidates: claims.filter(c => c.candidates.length > 0).length,
    avgTopScore: claims.length > 0
      ? parseFloat((claims.reduce((s, c) => s + c.topCandidateScore, 0) / claims.length).toFixed(3))
      : 0,
    claims
  };

  return result;
}

// CLI
if (require.main === module) {
  const targetFile = process.argv.find(a => a.endsWith('_enhanced.js'));
  const dryRun = process.argv.includes('--dry-run');

  if (!targetFile) {
    console.error('Usage: node re-research-supplement.js <filename_enhanced.js> [--dry-run]');
    process.exit(1);
  }

  reResearchSupplement(path.basename(targetFile), { onlyMismatched: true })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));

      if (!dryRun && result) {
        if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
        const reportName = path.basename(targetFile).replace('_enhanced.js', '-remediation.json');
        fs.writeFileSync(path.join(REPORT_DIR, reportName), JSON.stringify(result, null, 2));
        console.log(`\nReport saved to healing-reports/remediation/${reportName}`);
      }
    })
    .catch(console.error);
}

module.exports = { reResearchClaim, reResearchSupplement };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/healing-engine/re-research.spec.js`
Expected: 4 tests PASS (2 esearch + 2 re-research)

- [ ] **Step 5: Commit**

```bash
git add healing-engine/scripts/re-research-supplement.js tests/healing-engine/re-research.spec.js
git commit -m "feat(healing): Phase 2 — PubMed-driven re-research engine for claim-based citation lookup"
```

---

### Task 5: Build the replacement verifier and applier

Takes re-research results, applies the best candidate per claim (only if relevance score > threshold), and writes updated enhanced files. Archives originals first.

**Files:**
- Create: `healing-engine/scripts/verify-replacements.js`
- Test: `tests/healing-engine/verify-replacements.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/verify-replacements.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

test.describe('Verify Replacements', () => {
  test('buildReplacementPlan filters by relevance threshold', () => {
    const { buildReplacementPlan } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 'verify-replacements'));

    const reResearchResult = {
      file: 'test_enhanced.js',
      supplementName: 'Test',
      claims: [
        {
          section: 'mechanisms', citationIdx: 0,
          claimText: 'Test mechanism',
          currentEvidence: [{ pmid: '111', doi: '', title: '' }],
          candidates: [
            { pmid: '999', title: 'Matching paper', doi: '10.1234/test', relevanceScore: 0.85, authors: ['Smith'], year: 2023, journal: 'Nature' },
            { pmid: '888', title: 'Weak match', doi: '10.1234/weak', relevanceScore: 0.3, authors: ['Jones'], year: 2020, journal: 'Other' }
          ]
        },
        {
          section: 'benefits', citationIdx: 0,
          claimText: 'Test benefit',
          currentEvidence: [{ pmid: '222', doi: '10.existing/doi', title: 'Already good' }],
          candidates: [
            { pmid: '777', title: 'Low relevance', doi: '10.1234/low', relevanceScore: 0.2, authors: ['Doe'], year: 2019, journal: 'J' }
          ]
        }
      ]
    };

    const plan = buildReplacementPlan(reResearchResult, { minRelevance: 0.5 });

    // Only the first claim should have a replacement (0.85 > 0.5)
    expect(plan.replacements.length).toBe(1);
    expect(plan.replacements[0].newPmid).toBe('999');
    expect(plan.skipped.length).toBe(1); // second claim skipped (0.2 < 0.5)
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/healing-engine/verify-replacements.spec.js -x`
Expected: FAIL — `buildReplacementPlan is not a function`

- [ ] **Step 3: Implement verify-replacements.js**

```javascript
// healing-engine/scripts/verify-replacements.js
'use strict';

const fs = require('fs');
const path = require('path');
const { loadEnhancedFile, writeEnhancedFile } = require('../utils/schema');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
const ARCHIVE_DIR = path.join(ENH_DIR, '_archive');

/**
 * Given re-research results, build a replacement plan filtering by relevance.
 */
function buildReplacementPlan(reResearchResult, options = {}) {
  const { minRelevance = 0.5 } = options;

  const replacements = [];
  const skipped = [];

  for (const claim of reResearchResult.claims) {
    const bestCandidate = claim.candidates[0];
    if (!bestCandidate || bestCandidate.relevanceScore < minRelevance) {
      skipped.push({
        section: claim.section, citationIdx: claim.citationIdx,
        claimText: claim.claimText,
        reason: bestCandidate
          ? `Best candidate score ${bestCandidate.relevanceScore} < threshold ${minRelevance}`
          : 'No candidates found'
      });
      continue;
    }

    replacements.push({
      section: claim.section,
      citationIdx: claim.citationIdx,
      claimText: claim.claimText,
      oldEvidence: claim.currentEvidence,
      newPmid: bestCandidate.pmid,
      newDoi: bestCandidate.doi,
      newTitle: bestCandidate.title,
      newAuthors: bestCandidate.authors,
      newYear: bestCandidate.year,
      newJournal: bestCandidate.journal,
      relevanceScore: bestCandidate.relevanceScore,
      allCandidates: claim.candidates
    });
  }

  return {
    file: reResearchResult.file,
    supplementName: reResearchResult.supplementName,
    replacements,
    skipped,
    summary: {
      totalClaims: reResearchResult.claims.length,
      replacing: replacements.length,
      skipping: skipped.length
    }
  };
}

/**
 * Apply a replacement plan to the enhanced citation file.
 * Archives the original file first.
 */
function applyReplacementPlan(plan, options = {}) {
  const { dryRun = false } = options;
  const filePath = path.join(ENH_DIR, plan.file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Archive original
  if (!dryRun) {
    if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    const archiveName = plan.file.replace('.js', `.pre-remediation-${Date.now()}.js`);
    fs.copyFileSync(filePath, path.join(ARCHIVE_DIR, archiveName));
  }

  const data = loadEnhancedFile(filePath);
  if (!data || !data.citations) {
    throw new Error(`Could not load enhanced data from ${plan.file}`);
  }

  let applied = 0;
  for (const repl of plan.replacements) {
    const sectionArr = data.citations[repl.section];
    if (!sectionArr || !sectionArr[repl.citationIdx]) continue;

    const citation = sectionArr[repl.citationIdx];
    if (!citation.evidence || !Array.isArray(citation.evidence)) {
      citation.evidence = [];
    }

    // Replace the first evidence item (or add one if empty)
    const newEvidence = {
      citationId: `${repl.newAuthors[0] ? repl.newAuthors[0].split(' ').pop().toLowerCase() : 'unknown'}_${repl.newYear || 'nd'}`,
      title: repl.newTitle,
      authors: repl.newAuthors,
      year: repl.newYear,
      journal: repl.newJournal,
      doi: repl.newDoi,
      pmid: repl.newPmid,
      studyType: '',
      evidenceLevel: '',
      findings: citation.evidence[0] ? (citation.evidence[0].findings || '') : '',
      methodology: ''
    };

    if (citation.evidence.length > 0) {
      // Preserve fields that the new data doesn't have
      const old = citation.evidence[0];
      newEvidence.studyType = old.studyType || '';
      newEvidence.evidenceLevel = old.evidenceLevel || '';
      newEvidence.findings = old.findings || '';
      newEvidence.methodology = old.methodology || '';
      if (old.sampleSize) newEvidence.sampleSize = old.sampleSize;
      if (old.duration) newEvidence.duration = old.duration;
      if (old.keyFindings) newEvidence.keyFindings = old.keyFindings;
      if (old.effectSize) newEvidence.effectSize = old.effectSize;
      if (old.pValue) newEvidence.pValue = old.pValue;
      if (old.confidenceInterval) newEvidence.confidenceInterval = old.confidenceInterval;

      citation.evidence[0] = newEvidence;
    } else {
      citation.evidence.push(newEvidence);
    }

    applied++;
  }

  if (!dryRun && applied > 0) {
    writeEnhancedFile(filePath, data, { sourceFile: filePath });
  }

  return { file: plan.file, applied, total: plan.replacements.length, dryRun };
}

// CLI
if (require.main === module) {
  const reportFile = process.argv.find(a => a.endsWith('.json'));
  const dryRun = process.argv.includes('--dry-run');

  if (!reportFile) {
    console.error('Usage: node verify-replacements.js <remediation-report.json> [--dry-run]');
    process.exit(1);
  }

  const reResearchResult = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  const plan = buildReplacementPlan(reResearchResult, { minRelevance: 0.5 });

  console.log(`Replacement plan for ${plan.file}:`);
  console.log(`  Replacing: ${plan.summary.replacing} citations`);
  console.log(`  Skipping: ${plan.summary.skipping} (below relevance threshold)`);

  if (plan.replacements.length > 0) {
    console.log('\n--- Replacements ---');
    for (const r of plan.replacements) {
      console.log(`  [${r.section}] "${r.claimText.substring(0, 60)}..."`);
      console.log(`    → ${r.newTitle.substring(0, 70)} (PMID ${r.newPmid}, score ${r.relevanceScore})`);
    }
  }

  if (!dryRun && plan.replacements.length > 0) {
    const result = applyReplacementPlan(plan, { dryRun });
    console.log(`\nApplied ${result.applied} replacements to ${result.file}`);
  } else if (dryRun) {
    console.log('\n(dry run — no changes applied)');
  }
}

module.exports = { buildReplacementPlan, applyReplacementPlan };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/healing-engine/verify-replacements.spec.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add healing-engine/scripts/verify-replacements.js tests/healing-engine/verify-replacements.spec.js
git commit -m "feat(healing): Phase 3 — replacement verifier with relevance threshold and archival"
```

---

## Chunk 3: Regeneration Pipeline + Integration

### Task 6: Build the page regeneration and visual diff tool

After citations are replaced, regenerate all page types and take Playwright screenshots for visual comparison.

**Files:**
- Create: `healing-engine/scripts/regenerate-and-diff.js`
- Test: `tests/healing-engine/regenerate-diff.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/regenerate-diff.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

test.describe('Regenerate and Diff', () => {
  test('regenerateAllPages calls all generators without error', async () => {
    const { regenerateAllPages } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 'regenerate-and-diff'));

    const result = await regenerateAllPages({ dryRun: true });
    expect(result).toBeTruthy();
    expect(result.generators).toBeGreaterThan(0);
    expect(result.errors).toEqual([]);
  }, 30000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/healing-engine/regenerate-diff.spec.js -x`
Expected: FAIL — `regenerateAllPages is not a function`

- [ ] **Step 3: Implement regenerate-and-diff.js**

```javascript
// healing-engine/scripts/regenerate-and-diff.js
'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const GENERATORS = [
  { name: 'supplement-pages', script: 'scripts/generate-supplement-pages.js' },
  { name: 'guide-pages', script: 'scripts/generate-guide-pages.js' },
  { name: 'compare-pages', script: 'scripts/generate-compare-pages.js' },
  { name: 'evidence-pages', script: 'scripts/generate-evidence-pages.js' },
  { name: 'category-pages', script: 'scripts/generate-category-pages.js' },
];

async function regenerateAllPages(options = {}) {
  const { dryRun = false } = options;
  const results = { generators: 0, errors: [], outputs: [] };

  for (const gen of GENERATORS) {
    const scriptPath = path.join(ROOT, gen.script);
    if (!fs.existsSync(scriptPath)) {
      results.outputs.push({ name: gen.name, status: 'skipped', reason: 'script not found' });
      continue;
    }

    if (dryRun) {
      results.outputs.push({ name: gen.name, status: 'would-run' });
      results.generators++;
      continue;
    }

    try {
      execSync(`node ${gen.script}`, {
        cwd: ROOT,
        stdio: 'pipe',
        maxBuffer: 50 * 1024 * 1024,
        timeout: 120000
      });
      results.outputs.push({ name: gen.name, status: 'success' });
      results.generators++;
    } catch (e) {
      results.errors.push({ name: gen.name, error: e.message.substring(0, 200) });
      results.outputs.push({ name: gen.name, status: 'error', error: e.message.substring(0, 200) });
    }
  }

  return results;
}

/**
 * Take screenshots of specific supplement pages for visual diff.
 * Requires Docker (nginx) to be running on port 8080.
 */
async function screenshotPages(supplementSlugs, options = {}) {
  const { outputDir = path.join(ROOT, '..', 'healing-reports', 'screenshots') } = options;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  let browser;
  try {
    const { chromium } = require('playwright');
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });

    const results = [];
    for (const slug of supplementSlugs) {
      const url = `http://localhost:8080/supplements/${slug}.html`;
      try {
        await page.goto(url, { timeout: 15000, waitUntil: 'networkidle' });
        const screenshotPath = path.join(outputDir, `${slug}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        results.push({ slug, status: 'captured', path: screenshotPath });
      } catch (e) {
        results.push({ slug, status: 'error', error: e.message.substring(0, 100) });
      }
    }

    return results;
  } finally {
    if (browser) await browser.close();
  }
}

// CLI
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  const screenshotOnly = process.argv.includes('--screenshots');

  if (screenshotOnly) {
    const slugs = process.argv.filter(a => !a.startsWith('-') && !a.includes('/') && !a.includes('.'));
    if (slugs.length === 0) {
      console.error('Provide supplement slugs: node regenerate-and-diff.js --screenshots bacopa-monnieri curcumin');
      process.exit(1);
    }
    screenshotPages(slugs).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error);
  } else {
    regenerateAllPages({ dryRun }).then(r => {
      console.log(JSON.stringify(r, null, 2));
      if (dryRun) console.log('\n(dry run — no pages regenerated)');
    }).catch(console.error);
  }
}

module.exports = { regenerateAllPages, screenshotPages };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/healing-engine/regenerate-diff.spec.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add healing-engine/scripts/regenerate-and-diff.js tests/healing-engine/regenerate-diff.spec.js
git commit -m "feat(healing): Phase 4 — page regeneration orchestrator with visual diff"
```

---

### Task 7: End-to-end orchestrator — npm run heal:remediate

Wire all 4 phases together into a single CLI entry point with step-by-step verification gates.

**Files:**
- Create: `healing-engine/scripts/remediate-supplement.js`
- Modify: `package.json` (add npm scripts)

- [ ] **Step 1: Implement remediate-supplement.js**

```javascript
// healing-engine/scripts/remediate-supplement.js
'use strict';

const fs = require('fs');
const path = require('path');
const { flagSingleFile } = require('./flag-evidence-quality');
const { reResearchSupplement } = require('./re-research-supplement');
const { buildReplacementPlan, applyReplacementPlan } = require('./verify-replacements');
const { regenerateAllPages } = require('./regenerate-and-diff');

const REPORT_DIR = path.join(__dirname, '..', '..', '..', 'healing-reports', 'remediation');

async function remediateSupplement(filename, options = {}) {
  const { dryRun = false, minRelevance = 0.5, skipRegenerate = false } = options;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`REMEDIATION: ${filename}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(60));

  // Phase 1: Flag
  console.log('\n--- Phase 1: Flagging evidence quality ---');
  const quality = await flagSingleFile(filename);
  if (!quality) { console.error('Failed to load file'); return null; }

  console.log(`  Total evidence: ${quality.totalEvidence}`);
  console.log(`  Verified: ${quality.verified} | Mismatched: ${quality.mismatched} | Unverifiable: ${quality.unverifiable}`);
  console.log(`  Reliability: ${quality.reliabilityScore}%`);

  if (quality.mismatched === 0 && quality.unverifiable === 0) {
    console.log('\n✅ All evidence verified — no remediation needed');
    return { file: filename, status: 'clean', quality };
  }

  // Phase 2: Re-research
  console.log('\n--- Phase 2: Re-researching claims via PubMed ---');
  const reResearch = await reResearchSupplement(filename, {
    onlyMismatched: true,
    maxCandidatesPerClaim: 5
  });
  console.log(`  Claims researched: ${reResearch.totalClaims}`);
  console.log(`  Claims with candidates: ${reResearch.claimsWithCandidates}`);
  console.log(`  Average top score: ${reResearch.avgTopScore}`);

  // Phase 3: Build and review replacement plan
  console.log('\n--- Phase 3: Building replacement plan ---');
  const plan = buildReplacementPlan(reResearch, { minRelevance });
  console.log(`  Replacements planned: ${plan.summary.replacing}`);
  console.log(`  Skipped (low relevance): ${plan.summary.skipping}`);

  if (plan.replacements.length > 0) {
    console.log('\n  Proposed replacements:');
    for (const r of plan.replacements) {
      console.log(`    [${r.section}] "${r.claimText.substring(0, 50)}..."`);
      console.log(`      Old: PMID ${r.oldEvidence[0]?.pmid || 'none'} | "${(r.oldEvidence[0]?.title || 'no title').substring(0, 50)}"`);
      console.log(`      New: PMID ${r.newPmid} | "${r.newTitle.substring(0, 50)}..." (score: ${r.relevanceScore})`);
    }
  }

  // Apply
  if (!dryRun && plan.replacements.length > 0) {
    console.log('\n--- Applying replacements ---');
    const applied = applyReplacementPlan(plan);
    console.log(`  Applied ${applied.applied} of ${applied.total} replacements`);

    // Re-flag to verify improvement
    console.log('\n--- Re-flagging after remediation ---');
    const postQuality = await flagSingleFile(filename);
    console.log(`  Reliability: ${quality.reliabilityScore}% → ${postQuality.reliabilityScore}%`);

    // Phase 4: Regenerate
    if (!skipRegenerate) {
      console.log('\n--- Phase 4: Regenerating pages ---');
      const regen = await regenerateAllPages();
      console.log(`  Generators run: ${regen.generators}, errors: ${regen.errors.length}`);
    }
  }

  // Save report
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  const report = { quality, reResearch, plan, timestamp: new Date().toISOString(), dryRun };
  const reportName = filename.replace('_enhanced.js', '-remediation.json');
  fs.writeFileSync(path.join(REPORT_DIR, reportName), JSON.stringify(report, null, 2));
  console.log(`\nReport: healing-reports/remediation/${reportName}`);

  return report;
}

// CLI
if (require.main === module) {
  const targetFile = process.argv.find(a => a.endsWith('_enhanced.js'));
  const dryRun = process.argv.includes('--dry-run');
  const skipRegen = process.argv.includes('--skip-regenerate');

  if (!targetFile) {
    console.error('Usage: node remediate-supplement.js <filename_enhanced.js> [--dry-run] [--skip-regenerate]');
    process.exit(1);
  }

  remediateSupplement(path.basename(targetFile), { dryRun, skipRegenerate: skipRegen })
    .catch(console.error);
}

module.exports = { remediateSupplement };
```

- [ ] **Step 2: Add npm scripts to package.json**

Add to `scripts` section:
```json
"heal:flag": "node healing-engine/scripts/flag-evidence-quality.js",
"heal:remediate": "node healing-engine/scripts/remediate-supplement.js",
"heal:regenerate": "node healing-engine/scripts/regenerate-and-diff.js"
```

- [ ] **Step 3: Run all existing healing tests to ensure no regressions**

Run: `npx playwright test tests/healing-engine/`
Expected: All tests pass (45+ existing + new tests)

- [ ] **Step 4: Commit**

```bash
git add healing-engine/scripts/remediate-supplement.js package.json
git commit -m "feat(healing): end-to-end remediation orchestrator with 4-phase pipeline"
```

---

### Task 8: Execute Phase 1 — Flag all 93 files

Run the quality flagger across the entire dataset to produce the reliability report.

- [ ] **Step 1: Run flag-evidence-quality.js for all files**

```bash
cd supp-db-site && HEALING_QUIET=true node healing-engine/scripts/flag-evidence-quality.js
```

Expected output: 93 quality JSON files in `data/enhanced_citations/_quality/`, console shows reliability ranking with worst files first.

- [ ] **Step 2: Review the output — identify supplements that need remediation**

The Claude orchestrator should read the output and present a prioritized list:
- Supplements with 0% reliability (all unverifiable — the 16 Pattern A files)
- Supplements with <50% reliability (many mismatched PMIDs)
- Supplements with ≥80% reliability (mostly clean)

- [ ] **Step 3: Commit the quality metadata**

```bash
git add data/enhanced_citations/_quality/
git commit -m "data(healing): Phase 1 quality flags — reliability scores for all 93 supplements"
```

---

### Task 9: Execute Phase 2-3 — Dry-run remediation on first supplement

Start with one supplement to validate the pipeline end-to-end before batch processing.

- [ ] **Step 1: Dry-run remediation on a Pattern A file (e.g., Bacopa Monnieri)**

```bash
cd supp-db-site && node healing-engine/scripts/remediate-supplement.js 1_bacopa_monnieri_enhanced.js --dry-run --skip-regenerate
```

- [ ] **Step 2: Review the remediation report**

The Claude orchestrator should:
1. Read `healing-reports/remediation/1_bacopa_monnieri-remediation.json`
2. Check that replacement candidates are topically relevant (curcumin papers shouldn't appear for bacopa claims)
3. Verify relevance scores are reasonable
4. Flag any candidates that seem wrong

- [ ] **Step 3: If satisfied, run the real remediation**

```bash
cd supp-db-site && node healing-engine/scripts/remediate-supplement.js 1_bacopa_monnieri_enhanced.js --skip-regenerate
```

- [ ] **Step 4: Verify the updated file**

```bash
cd supp-db-site && HEALING_QUIET=true node healing-engine/scripts/flag-evidence-quality.js 1_bacopa_monnieri_enhanced.js
```

Expected: Reliability score should improve (from 0% → some positive number)

- [ ] **Step 5: Commit if improvement confirmed**

```bash
git add data/enhanced_citations/1_bacopa_monnieri_enhanced.js data/enhanced_citations/_quality/ healing-reports/
git commit -m "fix(data): remediate Bacopa Monnieri citations via PubMed re-research"
```

---

### Task 10: Batch remediation for remaining affected supplements

Process remaining supplements in priority order, with the Claude orchestrator reviewing each batch.

- [ ] **Step 1: Run remediation on all 16 Pattern A files (no titles)**

These are the highest priority — currently 0% verifiable:
```
1_bacopa_monnieri, 2_curcumin, 3_ashwagandha, 4_omega_3_fish_oil,
6_magnesium, 9_l_theanine, 10_rhodiola_rosea, 11_lions_mane,
18_coq10, 24_l_theanine, 27_resveratrol, 58_mct_oil,
59_hawthorn_berry, 60_red_yeast_rice, 61_chromium, 79_passionflower
```

For each file:
1. Run `remediate-supplement.js <file> --dry-run --skip-regenerate`
2. Claude reviews the remediation report
3. If replacements look correct, run without `--dry-run`
4. Re-flag to confirm improvement

- [ ] **Step 2: Run remediation on Pattern B files with >5 mismatches**

From the Phase 1 quality ranking, process files with the most mismatched PMIDs:
```
73_stinging_nettle, 69_mucuna_pruriens, 45_enhanced,
43_choline_bitartrate, 65_fenugreek, 44_alpha_lipoic_acid,
32_chondroitin_sulfate, 28_glucosamine, 51_reishi_mushroom,
50_caffeine, 38_iron, 35_tribulus_terrestris, 30_vitamin_e
```

Same process: dry-run → review → apply → verify.

- [ ] **Step 3: Commit batch results**

```bash
git add data/enhanced_citations/ data/enhanced_citations/_quality/ healing-reports/
git commit -m "fix(data): batch remediation — re-researched citations for N supplements"
```

---

### Task 11: Regenerate all pages and visual verification

After all citation data is remediated, regenerate every page type and verify rendering.

- [ ] **Step 1: Regenerate all page types**

```bash
cd supp-db-site && node scripts/generate-supplement-pages.js
cd supp-db-site && node scripts/generate-guide-pages.js
cd supp-db-site && node scripts/generate-compare-pages.js
cd supp-db-site && node scripts/generate-evidence-pages.js
cd supp-db-site && node scripts/generate-category-pages.js
```

- [ ] **Step 2: Run the healing engine site-check**

```bash
cd supp-db-site && HEALING_QUIET=true node -e "
const { runSiteCheck } = require('./healing-engine/healers/site-checker');
const r = runSiteCheck();
console.log(JSON.stringify(r.summary));
"
```

Expected: 0 errors, 0 warnings

- [ ] **Step 3: Spot-check remediated pages in the browser**

Use Playwright to take screenshots of 5 remediated supplement pages and verify citations render correctly:
```bash
cd supp-db-site && node healing-engine/scripts/regenerate-and-diff.js --screenshots bacopa-monnieri curcumin ashwagandha rhodiola-rosea melatonin
```

- [ ] **Step 4: Run full healing engine dry-run to confirm overall improvement**

```bash
cd supp-db-site && npm run heal:dry-run
```

Compare issue count vs the original 2,732. Should be significantly lower.

- [ ] **Step 5: Commit all regenerated pages**

```bash
git add supplements/ guides/ compare/ evidence/ categories/
git commit -m "chore: regenerate all pages with remediated citation data"
```

- [ ] **Step 6: Final commit and push**

```bash
git push origin dev
```
