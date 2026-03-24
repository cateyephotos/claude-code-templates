---
name: supplement-pipeline-validator
description: Validates the full supplement research pipeline end-to-end — from supplements.js field completeness through enhanced_citations schema correctness to HTML generation readiness. Scores each supplement with actionable fix instructions. Use after running supplement-research-pipeline to confirm data integrity before generating pages, or as a standalone health check of the database.
allowed-tools: Read Write Edit Bash
license: MIT license
metadata:
    skill-author: Supplement Database Team
    version: 1.0.0
    dependencies:
      - supplement-research-pipeline
---

# Supplement Pipeline Validator

## Overview

This skill performs a comprehensive health check of the entire supplement data pipeline, tracing data from raw structured sources through to HTML generation readiness. It operates in five passes:

1. **Layer 1 Audit** — `supplements.js` field completeness for all 113 supplements
2. **Layer 2 Audit** — `enhanced_citations/` file existence and schema correctness
3. **Pass 2.5 — Citation Integrity** — PMID/DOI live verification against PubMed and CrossRef (anti-hallucination gate)
4. **Layer 3 Check** — `seed.js` dry-run to confirm HTML generation readiness
5. **Layer 4 Check** — Premium content chunks existence, schema validity, and size compliance

The output is a prioritised action list grouped by supplement, with specific fix instructions for each gap.

## When to Use

- After adding or updating entries in `supplements.js`
- After creating or updating enhanced citation files
- Before running `seed.js` to generate/regenerate pages
- As a periodic health check to catch data drift
- When a supplement page looks incomplete (missing sections)

## Trigger Commands

- `/validate-pipeline` — Full validation of all 113 supplements
- `/validate-pipeline --id {id}` — Validate one supplement by ID
- `/validate-pipeline --slug {slug}` — Validate one supplement by slug
- `/validate-pipeline --layer {1|2|2.5|3|4}` — Run only one pass

---

## Validation Passes

### Pass 1 — Layer 1: supplements.js Field Completeness

**Goal:** Confirm every supplement has all fields required for complete HTML generation.

**Step 1A — Run seed.js dry-run (quickest check)**
```bash
node supp-db-site/seed.js --dry-run 2>&1
```
The dry-run catches critical blockers (✗) and non-blocking gaps (⚠).

**Step 1B — Detailed field audit**

For each supplement in `supplementDatabase.supplements[]` (113 total, IDs 1–113), check:

| Field | Required | Severity if missing | HTML Section affected |
|---|---|---|---|
| `name` | Yes | ✗ CRITICAL | All — blocks generation |
| `category` | Yes | ✗ CRITICAL | Hero pill, Quick Facts, Related |
| `evidenceTier` | Yes | ✗ CRITICAL | Hero badge, Quick Facts |
| `scientificName` | Recommended | ⚠ WARNING | Hero sub-heading, Quick Facts |
| `commonNames[]` | Optional | ℹ INFO | Hero sub-heading |
| `evidenceTierRationale` | Recommended | ⚠ WARNING | Overview paragraph |
| `primaryBenefits.cognitive[]` | Recommended | ⚠ WARNING | Section 4 — Benefits left column (empty) |
| `primaryBenefits.nonCognitive[]` | Optional | ℹ INFO | Section 4 — Benefits right column |
| `dosageRange` | Recommended | ⚠ WARNING | Quick Facts, Section 6 |
| `optimalDuration` | Recommended | ⚠ WARNING | Quick Facts, Section 6 |
| `studyPopulations[]` | Recommended | ⚠ WARNING | Overview paragraph, population tags |
| `mechanismsOfAction[]` | Recommended | ⚠ WARNING | Section 3 — Mechanisms (empty grid) |
| `safetyProfile.rating` | Recommended | ⚠ WARNING | Quick Facts, Section 7 header |
| `safetyProfile.commonSideEffects[]` | Optional | ℹ INFO | Section 7 side-effects card |
| `safetyProfile.contraindications[]` | Optional | ℹ INFO | Section 7 contraindications card |
| `safetyProfile.drugInteractions[]` | Optional | ℹ INFO | Section 7 drug interactions card |
| `effectSizes{}` | Recommended | ⚠ WARNING | Section 5 — Effect Sizes table (empty) |
| `commercialAvailability.forms[]` | Optional | ℹ INFO | Quick Facts |
| `commercialAvailability.costRange` | Optional | ℹ INFO | Quick Facts |
| `commercialAvailability.qualityMarkers[]` | Optional | ℹ INFO | Quick Facts |
| `keyCitations[]` | Recommended | ⚠ WARNING | Section 9 — References (empty) |
| `enhancedCitations.isEnhanced` | Optional | ℹ INFO | Hero stats |
| `enhancedCitations.evidenceProfile.totalCitations` | Optional | ℹ INFO | Hero stats |

**Step 1C — Calculate field completeness score**

For each supplement:
```
completeness_score = (populated_recommended_fields / total_recommended_fields) × 100
```
Recommended fields: `scientificName`, `evidenceTierRationale`, `primaryBenefits.cognitive`, `dosageRange`, `optimalDuration`, `studyPopulations`, `mechanismsOfAction`, `safetyProfile.rating`, `effectSizes`, `keyCitations` = 10 fields.

Scores:
- 90–100% = 🟢 Complete
- 70–89% = 🟡 Mostly complete
- 50–69% = 🟠 Needs work
- < 50% = 🔴 Incomplete

---

### Pass 2 — Layer 2: Enhanced Citations Audit

**Goal:** Confirm every enhanced citation file loads correctly and has the required citation arrays.

**Step 2A — File existence check**

For each supplement ID 1–93, check that at least one of these files exists in `data/enhanced_citations/`:
- `{id}_{name-slug}_enhanced.js` (preferred — named)
- `{id}_enhanced.js` (generic)

**Step 2B — File loading check**

For each file, verify it loads without error using the `seed.js` loading logic (4 patterns supported):
- `window.{camelCaseName}Enhanced = {...}`
- `const {camelCaseName}Enhanced = {...}`
- `window.enhancedCitations[id] = {...}`
- `window.enhancedCitations["key"] = {...}`

**Step 2C — Schema compliance check**

For each successfully-loaded enhanced citations object, verify:

| Field | Required | Severity | Notes |
|---|---|---|---|
| `supplementId` | Yes | ⚠ WARNING | Should match supplements.js id |
| `supplementName` | Recommended | ℹ INFO | |
| `lastUpdated` | Recommended | ⚠ WARNING | Stale if >6 months ago |
| `evidenceProfile` | Recommended | ⚠ WARNING | |
| `evidenceProfile.overallQuality` | Recommended | ⚠ WARNING | "Tier 1"–"Tier 4" |
| `evidenceProfile.totalCitations` | Optional | ℹ INFO | |
| `evidenceProfile.researchQualityScore` | Optional | ℹ INFO | 0–100 |
| `evidenceProfile.lastEvidenceUpdate` | Recommended | ⚠ WARNING | YYYY-MM-DD |
| `evidenceProfile.evidenceStrength` | Optional | ℹ INFO | |
| `citations` | Yes | ✗ CRITICAL | Must be an object |
| `citations.mechanisms[]` | Yes | ✗ CRITICAL | Non-empty for evidence section |
| `citations.benefits[]` | Yes | ✗ CRITICAL | Non-empty for evidence section |
| `citations.safety[]` | Recommended | ⚠ WARNING | |
| `citations.dosage[]` | Optional | ℹ INFO | |

**Per-citation-item checks** (for each item in `mechanisms[]`, `benefits[]`, `safety[]`, `dosage[]`):

| Item field | Required | Severity |
|---|---|---|
| `claim` (or `.mechanism`/`.healthDomain`/`.safetyAspect`/`.dosageRange`) | Yes | ✗ CRITICAL |
| `evidence` (or `.evidenceLevel`/`.strength`) | Recommended | ⚠ WARNING |
| `studyType` | Recommended | ⚠ WARNING |
| `year` | Recommended | ⚠ WARNING |
| `pmid` (or `.doi`) | Recommended | ⚠ WARNING | Link required for evidence card |
| `details` (or `.findings`) | Recommended | ⚠ WARNING | Prose text |

**Step 2D — Calculate enhanced citation score**

For each supplement:
```
citation_score = (has_mechanisms + has_benefits + has_safety + has_dosage) / 4 × 100
```
Where `has_X` = 1 if `citations.X` is a non-empty array, 0 otherwise.

Scores:
- 100% = 🟢 Full coverage
- 75% = 🟡 Missing dosage (common — acceptable)
- 50% = 🟠 Missing safety + dosage
- 25% = 🔴 Missing most evidence
- 0% = ⛔ No file or empty

---

### Pass 2.5 — Citation Integrity: PMID/DOI Live Verification

**Goal:** Detect hallucinated, non-existent, or misattributed citations before they reach the published database. This is the anti-hallucination gate — must pass with 0 CRITICAL issues before generating HTML pages.

**Step 2.5A — Run the citation verifier**
```bash
# Verify all supplements (makes live API calls — takes ~5 min for 93 supps)
node supp-db-site/scripts/verify-citations.js

# Verify one supplement by ID (fast — use after any Mode 1/2 research run)
node supp-db-site/scripts/verify-citations.js --id {id}

# Dry-run: count items and identifiers without making API calls
node supp-db-site/scripts/verify-citations.js --dry-run

# Only check PMIDs (skip CrossRef DOI lookups)
node supp-db-site/scripts/verify-citations.js --pmid-only

# Print summary counts only (no per-item detail)
node supp-db-site/scripts/verify-citations.js --summary
```

**Exit codes:**
- `0` = Pass (0 CRITICAL issues)
- `1` = Fail (CRITICAL issues found — block import)
- `2` = Script error (fix the script)

**Step 2.5B — Interpret issue severities**

| Issue Type | Severity | Meaning | Action Required |
|---|---|---|---|
| `PMID_NOT_FOUND` | 🔴 CRITICAL | PMID does not exist in PubMed — hallucinated | Delete and re-search PubMed |
| `DOI_NOT_FOUND` | 🔴 CRITICAL | DOI does not resolve in CrossRef | Verify DOI format; find correct DOI |
| `TITLE_MISMATCH_CRITICAL` | 🔴 CRITICAL | PMID resolves to a completely different paper (similarity < 25%) | Wrong PMID — find correct one |
| `NO_IDENTIFIER` | 🟠 HIGH | Citation has neither PMID nor DOI | Must add at least one identifier |
| `TITLE_MISMATCH` | 🟠 HIGH | Title has low similarity to PubMed record (25–50%) | Manually verify correct PMID |
| `YEAR_MISMATCH` | 🟡 MEDIUM | Stored year differs from PubMed by > 2 years | Correct year field |
| `NO_TITLE_FIELD` | ⚪ LOW | Flat-format citation has no `title` field (has `claim` instead) | Migrate to canonical schema |

**Step 2.5C — Fix CRITICAL issues**

When `PMID_NOT_FOUND`:
```
1. Search PubMed for the paper using title + first author + year
   URL: https://pubmed.ncbi.nlm.nih.gov/?term={search+terms}
2. Locate the correct PMID from results
3. Update citationId, pmid, title, year to match real paper
4. Re-run: node supp-db-site/scripts/verify-citations.js --id {id}
```

When `TITLE_MISMATCH_CRITICAL`:
```
1. Visit https://pubmed.ncbi.nlm.nih.gov/{pmid}/
2. Read the actual paper — is it the right study?
3. If wrong: search PubMed for the paper by title/author/year
4. If right: update the title field to match the exact PubMed title
```

When `DOI_NOT_FOUND`:
```
1. Visit https://doi.org/{doi} — does it resolve?
2. If not: try https://www.doi.org/{doi} (encoding issues)
3. Check CrossRef: https://api.crossref.org/works/{doi}
4. If unfixable: remove doi field; use pmid only
```

**Step 2.5D — Dual citation schema detection**

The verifier handles both citation formats in enhanced_citations files:

**Canonical grouped format** (preferred — `group.evidence` is an array):
```javascript
citations.mechanisms[{ mechanism: "...", evidence: [{ pmid, title, ... }] }]
```
→ Title comparison enabled for all items.

**Flat format** (legacy — item IS the citation):
```javascript
citations.mechanisms[{ claim: "...", pmid: "...", title: "..." }]
```
→ Title comparison only if `title` field present (not `claim` field). Emits LOW `NO_TITLE_FIELD` if missing title.

Flat-format files should be migrated to canonical format using:
```bash
node supp-db-site/scripts/migrate-enhanced-citations.js
```

**Step 2.5E — API rate limits**

- **PubMed E-utilities**: 3 requests/sec without API key; 10/sec with key. Verifier uses 350ms delay.
- **CrossRef**: polite pool (100ms delay) — no registration required.
- For all-93 verification: ~5 minutes total. Normal after data updates.

---

### Pass 3 — Layer 3: HTML Generation Readiness

**Goal:** Confirm seed.js can generate a valid HTML page for each supplement.

**Step 3A — Run seed.js dry-run**
```bash
node supp-db-site/seed.js --dry-run 2>&1
```

Interpret output:
- `✓ {id} {name} [{file}]` with no flags = ready to generate
- `⚠ N` = N non-blocking warnings — will generate but some sections may be empty
- `✗ {errors}` = critical errors — will NOT generate — fix required

**Step 3B — Verify existing HTML pages**

For supplements that already have HTML pages in `supplements/`:
```bash
node -e "
const fs = require('fs'), path = require('path');
const dir = 'supp-db-site/supplements';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
console.log('Total HTML pages:', files.length);
const checks = ['quick-facts','mechanism-grid','benefits-grid','effect-table',
  'dosage-grid','safety-card','citation-group','ref-item'];
let incomplete = 0;
files.forEach(f => {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  const missing = checks.filter(c => !html.includes(c));
  if (missing.length) { console.log('INCOMPLETE:', f, '->', missing.join(', ')); incomplete++; }
});
console.log('Incomplete pages:', incomplete);
"
```

**Step 3C — Sample visual check (optional)**

For the 5 supplements with most warnings from Pass 2, generate to a staging directory and spot-check in the browser:
```bash
node supp-db-site/seed.js --slug {slug} --out supp-db-site/supplements-test/
```
Open in browser or use Playwright MCP to screenshot. Check:
- [ ] Hero badge shows correct tier (Tier 1/2/3/4)
- [ ] Quick Facts table populated (≥5 rows)
- [ ] Evidence section shows citation groups (not "No evidence available")
- [ ] References section shows numbered list
- [ ] No "undefined" or "[object Object]" text visible

---

### Pass 4 — Layer 4: Premium Content Chunks

**Goal:** Confirm that all 19 paid-guide premium content chunks exist in `data/premium-chunks/`, are structurally valid, pass size limits, and contain the expected section IDs before `upload-premium-content.js` is run.

**Step 4A — Directory and file count check**
```bash
node supp-db-site/scripts/validate-premium-chunks.js
```
Or manually:
```bash
node -e "const fs=require('fs'); const d='supp-db-site/data/premium-chunks'; const files=fs.existsSync(d)?fs.readdirSync(d).filter(f=>f.endsWith('.json')):[];console.log('Premium chunks found:',files.length,'(expected: 19)');"
```

Expected: exactly **19** JSON files. The following guides are **excluded** from splitting and must NOT have chunk files:
- `sleep-sales` — marketing landing page, no premium content
- `mechanisms` — mechanism glossary, always fully public
- `sleep` — full content remains in HTML with nudge banner; no split required

**Step 4B — Schema and content validity**

For each chunk file `data/premium-chunks/{slug}.json`, verify:

| Field | Required | Severity | Notes |
|---|---|---|---|
| `slug` | Yes | ✗ CRITICAL | Must be non-empty string matching filename |
| `htmlContent` | Yes | ✗ CRITICAL | Must be non-empty string |
| `sections[]` | Yes | ⚠ WARNING | Array of section ID strings |
| `generatedAt` | Recommended | ⚠ WARNING | ISO 8601 timestamp |
| `sizeBytes` | Optional | ℹ INFO | Computed from htmlContent.length |

**Step 4C — Required section IDs check**

Each premium `htmlContent` must contain both of these section IDs:

| Section ID | Severity if missing | Notes |
|---|---|---|
| `id="mechanisms"` | ✗ CRITICAL | Mechanisms section must be present |
| `id="top-supplements"` | ✗ CRITICAL | Top supplements tier cards must be present |

Detection:
```bash
node supp-db-site/scripts/validate-premium-chunks.js --check-sections
```

**Step 4D — Convex document size limits**

Convex has a **1MB hard limit** per document. Check each chunk:

| Size | Severity | Action |
|---|---|---|
| < 900KB | ✓ OK | No action required |
| 900KB–1MB | ⚠ WARN | Review — consider splitting or compressing HTML |
| > 1MB | ✗ ERROR | Must split before upload — Convex will reject |

```bash
node supp-db-site/scripts/validate-premium-chunks.js --check-sizes
```

**Step 4E — Interpret results**

| Status | Meaning |
|---|---|
| ✓ 19 files, all valid | Ready for `upload-premium-content.js` |
| ✗ Count < 19 | Missing chunks — re-run the guide split step |
| ✗ Count > 19 | Extra files — check for sleep/mechanisms/sleep-sales misgeneration |
| ✗ CRITICAL section missing | Premium HTML is malformed — re-generate the chunk |
| ✗ Size > 1MB | Chunk too large — must split or strip redundant HTML before upload |

---

## Output Format

### Summary Report

```
╔══════════════════════════════════════════════════════════════════╗
║          SUPPLEMENT PIPELINE VALIDATION REPORT                   ║
║  Date: {YYYY-MM-DD}  |  Supplements: 113  |  Seed.js: v1.x      ║
╚══════════════════════════════════════════════════════════════════╝

OVERALL HEALTH SCORE: {score}/100

LAYER 1 (supplements.js):
  🟢 Complete (90–100%):  {n} supplements
  🟡 Mostly complete:     {n} supplements
  🟠 Needs work:          {n} supplements
  🔴 Incomplete:          {n} supplements

LAYER 2 (enhanced_citations):
  🟢 Full coverage:       {n} supplements
  🟡 Missing dosage:      {n} supplements
  🟠 Partial:             {n} supplements
  🔴 No evidence:         {n} supplements
  ⛔ Missing file:         {n} supplements

PASS 2.5 (citation integrity):
  🔴 CRITICAL issues:     {n}  ← BLOCKS import until fixed
  🟠 HIGH (no ID / mismatch): {n}
  🟡 MEDIUM (year drift): {n}
  ⚪ LOW (no title field): {n}

LAYER 3 (HTML generation):
  ✓ Ready:               {n} supplements
  ⚠ Ready with warnings: {n} supplements
  ✗ Blocked:             {n} supplements

LAYER 4 (premium content chunks):
  ✓ All 19 chunks valid:     {n}
  ⚠ Size warnings (>900KB):  {n}
  ✗ Missing chunks:          {n}  ← run upload-premium-content.js to regenerate
  ✗ Invalid schema/sections: {n}  ← re-generate affected chunks
  ✗ Over 1MB (Convex limit): {n}  ← BLOCKS upload until split/compressed
```

### Per-Supplement Action Table

For each supplement with issues, output a prioritised action table:

```
ID | Name               | L1 Score | L2 Score | L3 Status | Priority Actions
---|--------------------|----------|----------|-----------|------------------
 5 | Creatine           |    90%   |    50%   |    ⚠      | Add safety[], dosage[] to enhanced citations
17 | Berberine          |    80%   |    25%   |    ⚠      | Add keyCitations; add benefits[], safety[] to enhanced citations
33 | L-Tyrosine         |    70%   |     0%   |    ⚠      | All enhanced citation arrays empty — run Mode 1 research
```

### Fix Instructions by Issue Type

**Missing enhanced citation file:**
```
Action: Run supplement-research-pipeline Mode 1 or Mode 2 to generate
data/enhanced_citations/{id}_{name-slug}_enhanced.js

Or create manually using the canonical schema:
const {camelCaseName}Enhanced = {
  supplementId: {id},
  citations: {
    mechanisms: [/* See schema in supplement-research-pipeline SKILL.md */],
    benefits: [],
    safety: [],
    dosage: []
  }
};
window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[{id}] = {camelCaseName}Enhanced;
```

**Empty mechanisms[] or benefits[]:**
```
Action: Run supplement-research-pipeline Mode 2 (Evidence Update) targeting
the specific supplement to populate the empty arrays.

Or manually add citation items following the schema:
{
  claim: "Mechanism/benefit description",
  evidence: "Strong|Moderate|Weak",
  studyType: "RCT|Meta-analysis|etc.",
  year: 2024,
  participants: "n=120",
  pmid: "12345678",
  details: "Summary of findings..."
}
```

**Empty effectSizes{} object:**
```
Action: Add effect size data to supplements.js entry:
"effectSizes": {
  "memoryConsolidation": "Cohen's d = 0.95 (large effect)",
  "attentionFocus": "Standardized mean difference = 0.42"
}
Note: Keys use camelCase; seed.js converts to Title Case for display.
```

**Empty keyCitations[]:**
```
Action: Add top 3–5 citation objects to supplements.js:
"keyCitations": [
  "Roodenrys et al. (2002). Chronic effects of Bacopa monnieri. Neuropsychopharmacology.",
  "Calabrese et al. (2008). Effects of Bacopa on memory. J Altern Complement Med."
]
Note: These are rendered as plain text in the References section.
```

**seed.js error — missing required field:**
```
Error: name/category/evidenceTier missing from supplements.js entry
Action: Edit the supplement's entry in data/supplements.js to add the
missing field. Then re-run: node supp-db-site/seed.js --id {id} --dry-run
```

---

## HTML Generation Readiness Scoring

Use this composite score to prioritise which supplements to fix first:

```
readiness_score = (L1_score × 0.3) + (L2_score × 0.5) + (L3_ready × 0.2)
```

Where:
- `L1_score` = field completeness % (0–100)
- `L2_score` = citation coverage % (0–100)
- `L3_ready` = 100 if seed.js dry-run shows 0 errors, 50 if warnings only, 0 if errors

Supplements with `readiness_score < 60` should be prioritised for Mode 1 or Mode 2 research pipeline runs.

---

## Quick Validation Commands

**IMPORTANT: On Windows, `node -e '...'` with `!` in code fails even in single-quotes due to shell history expansion. Always use dedicated script files instead of inline `-e` strings.**

```bash
# Full pipeline health check (Layer 1 + seed.js)
node supp-db-site/seed.js --dry-run

# Layer 2 — Enhanced citations schema audit (use script file, not -e)
node supp-db-site/scripts/audit-enhanced-citations.js
node supp-db-site/scripts/audit-enhanced-citations.js --id 33   # single supplement

# Pass 2.5 — Citation integrity (PMID/DOI live verification — anti-hallucination gate)
node supp-db-site/scripts/verify-citations.js                   # all supplements
node supp-db-site/scripts/verify-citations.js --id 35          # single supplement
node supp-db-site/scripts/verify-citations.js --dry-run        # count only, no API calls
node supp-db-site/scripts/verify-citations.js --summary        # counts only
node supp-db-site/scripts/verify-citations.js --pmid-only      # skip CrossRef DOI checks

# Layer 3 — HTML completeness check (use script file, not -e)
node supp-db-site/scripts/check-html-completeness.js

# Fix non-canonical enhanced citation files (flat array → grouped schema)
node supp-db-site/scripts/migrate-enhanced-citations.js --dry-run
node supp-db-site/scripts/migrate-enhanced-citations.js

# List all supplements with errors (blocks HTML generation)
node supp-db-site/seed.js --dry-run 2>&1 | grep "✗"

# List all supplements with "file not found" (no enhanced citations)
node supp-db-site/seed.js --dry-run 2>&1 | grep "file not found"
```

## Known Failure Modes (from 2026-03-14 pipeline test)

### 1. Non-Canonical Flat Array Schema (SILENT — no error, empty evidence sections)

**Symptom:** `audit-enhanced-citations.js` reports `score: 0%` with `✗ Missing .citations property` OR arrays show `0` items even though the file has real research data.

**Root cause:** The enhanced citation file uses a flat array (`citations: [...]` or `enhancedCitations: [...]`) instead of the canonical grouped object (`citations: { mechanisms: [], benefits: [], safety: [], dosage: [] }`).

**Detection:**
```bash
node supp-db-site/scripts/audit-enhanced-citations.js 2>&1 | grep "score:0%"
```

**Fix:** Run migration script to restructure into canonical groups:
```bash
node supp-db-site/scripts/migrate-enhanced-citations.js
```
Then add the supplement to `MIGRATIONS` array in the script if it's a new supplement.

**Affected supplements (fixed 2026-03-14):** L-Tyrosine (33), Tribulus Terrestris (35), Fenugreek (65), Mucuna Pruriens (69), Stinging Nettle (73)

### 2. Bash `!` Escaping on Windows

**Symptom:** `node -e '...'` with logical-not (`!`) operator in the code fails with `SyntaxError: Invalid or unexpected token` or `Expected unicode escape` — even in single-quoted strings.

**Root cause:** Windows bash history-expansion processes `!` before Node.js sees it.

**Fix:** Write the check as a `.js` file in `scripts/` and run with `node scripts/check-name.js` — never use `node -e` for multi-line scripts with `!`.

### 3. Hallucinated PMIDs/DOIs (SILENT — wrong papers cited or non-existent PMIDs)

**Symptom:** `verify-citations.js` reports `PMID_NOT_FOUND` or `TITLE_MISMATCH_CRITICAL` issues. Evidence cards on the supplement page link to unrelated papers or return 404 on PubMed.

**Root cause:** During Mode 1/2 research, a PMID was composed from memory or reconstructed incorrectly rather than retrieved from a live PubMed search. The citation data appears structurally valid but points to the wrong paper or no paper.

**Real examples found (2026-03-14 — Tribulus Terrestris ID 35):**
- PMID `26755425` — does not exist in PubMed (hallucinated)
- PMID `18345236` — resolves to a laser diode paper in Optics Letters (wrong field entirely)
- PMID `37398644` — resolves to a human-murine autoantibody paper (unrelated)

**Detection:**
```bash
node supp-db-site/scripts/verify-citations.js --id 35
# Look for: PMID_NOT_FOUND, TITLE_MISMATCH_CRITICAL
```

**Fix:**
```bash
# 1. Identify the affected supplement and citation
node supp-db-site/scripts/verify-citations.js --id {id}

# 2. For each CRITICAL issue, search PubMed for the correct paper:
#    https://pubmed.ncbi.nlm.nih.gov/?term={supplement+name}+{author}+{year}

# 3. Update the enhanced citation file with the verified PMID and exact title

# 4. Re-run verify — must reach exit code 0 before proceeding
node supp-db-site/scripts/verify-citations.js --id {id}
```

**Prevention:** The supplement-research-pipeline SKILL.md Step 3.5 mandates running `verify-citations.js` before writing any citation data to the database. Never assign a PMID from memory — always retrieve from live PubMed search results.

**Status:** Tribulus Terrestris (ID 35) confirmed hallucinated PMIDs — pending correction via Mode 2 evidence update with verified sources.

### 4. Seed.js Slug Divergence

**Symptom:** `seed.js` generates a file at a different path than the one app.js links to, causing 404s on supplement pages.

**Root cause:** `slugify()` in seed.js had apostrophe stripping (`Lion's → lions`) while app.js and parse-data.js did not (`Lion's → lion-s`).

**Fix:** All three systems must use identical `slugify()`. The canonical function is in `parse-data.js` — copy it exactly, **do not strip apostrophes before the replace**. The apostrophe becomes `-` via `[^a-z0-9]+` → `-`, producing `lion-s-mane-mushroom`.

---

## Pipeline Architecture Reference

```
supplements.js               enhanced_citations/*.js
(Layer 1 — base data)        (Layer 2 — citations)
         │                           │
         └──────────────┬────────────┘
                        ▼
                    seed.js
              (forward-path generator)
                        │
                        ▼
              supplements/{slug}.html
              (Layer 3 — HTML output)
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
     Hero section   Evidence       References
     Quick Facts    cards          section
     Mechanisms     (from L2)      (from L1
     Benefits                      keyCitations)
     Effect Sizes
     Dosage
     Safety
     Related cards
```

**Key rule:** If Layer 2 (enhanced_citations) is missing for a supplement, Section 8 (Evidence) will be empty on the HTML page. All other sections draw exclusively from Layer 1 (supplements.js).

---

## Integration with supplement-research-pipeline

This validator is designed to be run **before and after** supplement-research-pipeline runs:

| When | Action | Command |
|---|---|---|
| Before Mode 1 (new research) | Baseline health check | `/validate-pipeline` |
| After Mode 1 (data written) | Verify new data is correct | `/validate-pipeline --id {new_id}` |
| **After Mode 1/2 citations written** | **Citation integrity gate (MANDATORY)** | `node supp-db-site/scripts/verify-citations.js --id {id}` |
| Before Mode 7 (generate pages) | Confirm 0 errors | `node seed.js --dry-run` |
| After Mode 7 (pages generated) | Verify HTML completeness | See Pass 3 Step 3B |
| **After Mode 7 Step 4.5 (premium upload)** | **Confirm 19 chunks valid, no oversized files** | `node supp-db-site/scripts/validate-premium-chunks.js` |
| Periodic health check | Catch data drift | `/validate-pipeline` monthly |
