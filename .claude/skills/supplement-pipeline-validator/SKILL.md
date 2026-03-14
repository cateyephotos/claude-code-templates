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

This skill performs a comprehensive health check of the entire supplement data pipeline, tracing data from raw structured sources through to HTML generation readiness. It operates in three passes:

1. **Layer 1 Audit** — `supplements.js` field completeness for all 93 supplements
2. **Layer 2 Audit** — `enhanced_citations/` file existence and schema correctness
3. **Layer 3 Check** — `seed.js` dry-run to confirm HTML generation readiness

The output is a prioritised action list grouped by supplement, with specific fix instructions for each gap.

## When to Use

- After adding or updating entries in `supplements.js`
- After creating or updating enhanced citation files
- Before running `seed.js` to generate/regenerate pages
- As a periodic health check to catch data drift
- When a supplement page looks incomplete (missing sections)

## Trigger Commands

- `/validate-pipeline` — Full validation of all 93 supplements
- `/validate-pipeline --id {id}` — Validate one supplement by ID
- `/validate-pipeline --slug {slug}` — Validate one supplement by slug
- `/validate-pipeline --layer {1|2|3}` — Run only one pass

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

For each supplement in `supplementDatabase.supplements[]`, check:

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

## Output Format

### Summary Report

```
╔══════════════════════════════════════════════════════════════════╗
║          SUPPLEMENT PIPELINE VALIDATION REPORT                   ║
║  Date: {YYYY-MM-DD}  |  Supplements: 93  |  Seed.js: v1.x       ║
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

LAYER 3 (HTML generation):
  ✓ Ready:               {n} supplements
  ⚠ Ready with warnings: {n} supplements
  ✗ Blocked:             {n} supplements
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

```bash
# Full pipeline health check
node supp-db-site/seed.js --dry-run

# Check how many supplements have 0 enhanced citation warnings
node supp-db-site/seed.js --dry-run 2>&1 | grep "✓.*\[" | grep -v "⚠" | wc -l

# List all supplements with errors (blocks HTML generation)
node supp-db-site/seed.js --dry-run 2>&1 | grep "✗"

# List all supplements with "file not found" (no enhanced citations)
node supp-db-site/seed.js --dry-run 2>&1 | grep "file not found"

# Check total HTML pages generated
node -e "const fs=require('fs'); console.log(fs.readdirSync('supp-db-site/supplements').filter(f=>f.endsWith('.html')).length + ' HTML pages');"

# Count incomplete pages (missing key sections)
node -e "
const fs=require('fs'),path=require('path');
const dir='supp-db-site/supplements';
const pages=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
let ok=0,warn=0;
pages.forEach(f=>{
  const h=fs.readFileSync(path.join(dir,f),'utf8');
  if(h.includes('citation-group'))ok++;else warn++;
});
console.log('With evidence section:',ok,'| Without:',warn);
"
```

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
| Before Mode 7 (generate pages) | Confirm 0 errors | `node seed.js --dry-run` |
| After Mode 7 (pages generated) | Verify HTML completeness | See Pass 3 Step 3B |
| Periodic health check | Catch data drift | `/validate-pipeline` monthly |
