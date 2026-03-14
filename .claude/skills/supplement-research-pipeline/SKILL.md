---
name: supplement-research-pipeline
description: End-to-end orchestration skill for researching, evaluating, publishing, and importing supplement evidence. Searches PubMed, bioRxiv, Consensus, and clinical trial registries. Grades evidence using GRADE framework. Outputs directly into the supplement database schema (supplements.js, enhanced_citations/), generates newsletter digests for lay and scientific audiences, and produces research update reports. Mode 6 (/import-supplement) provides a full import pipeline: appends new entries to supplements.js, creates enhanced citation JS files, updates the EnhancedCitationLoader.js registry, generates static per-supplement HTML pages, and generates static comparison HTML pages — enabling complete end-to-end import of newly researched supplements into the live site. Activates literature-review, scientific-writing, citation-management, scientific-critical-thinking, pubmed-database, chembl-database, clinicaltrials-database, and statistical-analysis skills as needed.
allowed-tools: Read Write Edit Bash
license: MIT license
metadata:
    skill-author: Supplement Database Team
    version: 1.0.0
    dependencies:
      - literature-review
      - scientific-writing
      - citation-management
      - scientific-critical-thinking
      - pubmed-database
      - clinicaltrials-database
      - chembl-database
      - pubchem-database
      - hmdb-database
      - statistical-analysis
      - infographics
      - markdown-mermaid-writing
---

# Supplement Research Pipeline

## Overview

This is the master orchestration skill for the Evidence-Based Supplement Database. It provides a complete research-to-publication pipeline that:

1. **Searches** multiple academic databases for supplement evidence
2. **Evaluates** evidence quality using structured frameworks (GRADE, Cochrane Risk of Bias)
3. **Populates** the supplement database in the exact schema used by `supplements.js` and `enhanced_citations/`
4. **Publishes** content as newsletter digests, research summaries, and evidence updates

This skill coordinates other installed scientific skills rather than duplicating their logic. Think of it as the **conductor** that directs the orchestra.

## When to Use This Skill

Use this skill when:
- Adding a NEW supplement to the database
- Updating evidence for an EXISTING supplement (new papers published, evidence tier change)
- Generating a newsletter digest about a supplement or health topic
- Performing a comparative analysis across supplements for a condition
- Creating a "research update" report on what changed in the evidence landscape
- Auditing the current evidence quality of database entries
- Producing lay-audience or scientific-audience summaries from raw research

## Project File Locations

```
supp-db-site/
├── data/
│   ├── supplements.js              # Main database (93 supplements, next ID: 94)
│   ├── citations.js                # Master citation registry
│   └── enhanced_citations/         # Per-supplement deep citation files
│       └── {id}_{name}_enhanced.js
├── content/                        # NEW: Generated content output
│   ├── newsletters/                # Newsletter digests (markdown + HTML)
│   ├── research-updates/           # Evidence update reports
│   ├── comparisons/                # Cross-supplement comparisons
│   └── audience-summaries/         # Lay & scientific audience summaries
├── supplements/                    # Static per-supplement HTML pages
│   └── {slug}.html
├── compare/                        # Static supplement comparison pages
│   └── {slug-a}-vs-{slug-b}.html
└── index.html                      # Main site UI
```

---

## Pipeline Modes

### Mode 1: New Supplement Research (`/research-new`)

Full pipeline for adding a brand-new supplement to the database.

**Input:** Supplement name (common or scientific)
**Output:** Complete database entry + enhanced citations file + newsletter draft

#### Workflow Steps

**Step 1 — Identification & Scoping**
```
Goal: Establish what this compound IS before searching for evidence.
Skills activated: chembl-database, pubchem-database, hmdb-database
```
- Query ChEMBL for bioactivity data (IC50, Ki, EC50)
- Query PubChem for chemical structure, properties, known bioassays
- Query HMDB for metabolomic context (endogenous metabolite? dietary compound?)
- Determine compound class (alkaloid, polyphenol, amino acid, vitamin, mineral, etc.)
- Identify known molecular targets and pathways
- Record: CAS number, molecular formula, SMILES, InChI key

**Step 2 — Systematic Literature Search**
```
Goal: Find ALL relevant human clinical evidence.
Skills activated: literature-review, pubmed-database
MCP tools: PubMed search, Consensus search, bioRxiv search
```

Search strategy (execute ALL in parallel):
1. **PubMed** — `"{supplement name}"[Title/Abstract] AND (randomized controlled trial[pt] OR meta-analysis[pt] OR systematic review[pt])` filtered to human studies
2. **PubMed MeSH** — Use MeSH terms for the compound + "dietary supplements"[MeSH] + condition-specific MeSH
3. **Consensus API** — `"What are the effects of {supplement} on {primary claimed benefit}?"` with `human=true`, `sjr_max=2`
4. **bioRxiv** — Search for recent preprints in relevant categories (biochemistry, pharmacology, neuroscience)
5. **ClinicalTrials.gov** — Search for active/completed trials via clinicaltrials-database

Collect ALL results. Deduplicate by DOI/PMID.

**Step 3 — Evidence Screening & Extraction**
```
Goal: Screen papers and extract structured data.
Skills activated: scientific-critical-thinking, citation-management
```

For each paper, extract into the CitationEvidence schema (see `references/database_schema_reference.md` for full field definitions):
```javascript
{
  // REQUIRED by renderer (renderStudyCard)
  "citationId": "{firstauthor}_{year}_{topic}",  // e.g., "roodenrys_2002_memory"
  "title": "",                                    // Rendered as card heading
  "authors": [],                                  // Rendered joined with ", "
  "year": 0,                                      // Rendered after authors
  "journal": "",                                  // Rendered after year
  "doi": "",                                      // Rendered as clickable DOI link
  "pmid": "",                                     // Rendered as clickable PubMed link
  "studyType": "",           // "Randomized controlled trial", "Meta-analysis", etc.
  "evidenceLevel": "",       // "Level 1" through "Level 5" — rendered as badge
  "findings": "",            // Rendered as "Findings: {text}"
  "methodology": "",         // Rendered as "Methodology: {text}"

  // RECOMMENDED for Tier 1-2 (rich detail fields)
  "studyDesign": "",         // "Double-blind, placebo-controlled, parallel group"
  "sampleSize": "",          // "n=76"
  "duration": "",            // "12 weeks"
  "dosage": "",              // "300mg daily (standardized to 55% bacosides)"
  "demographics": "",        // "Healthy adults aged 18-65"
  "primaryOutcome": "",
  "results": {
    "primaryEndpoint": {
      "outcome": "",
      "effectSize": "",      // "Cohen's d = 0.95 (large effect)"
      "pValue": "",
      "clinicalSignificance": ""
    }
  },
  "limitations": [],
  "clinicalRelevance": "",
  "clinicalTranslation": ""
}
```

Validate ALL DOIs using citation-management skill (CrossRef verification).

**Step 4 — Evidence Grading**
```
Goal: Assign evidence tier and quality scores.
Skills activated: scientific-critical-thinking
```

Apply the database's 4-tier evidence classification:

| Tier | Criteria | Required Evidence |
|------|----------|-------------------|
| **Tier 1** | Gold Standard | Multiple systematic reviews/meta-analyses, large RCTs (n>200), consistent replication |
| **Tier 2** | Strong Evidence | Multiple RCTs with moderate samples, at least 1 systematic review |
| **Tier 3** | Moderate Evidence | Small RCTs or limited number, preliminary human data |
| **Tier 4** | Emerging/Theoretical | Animal studies, in vitro, case reports, traditional use only |

Calculate `researchQualityScore` (0-100):
- Number and quality of RCTs: 0-30 points
- Presence of meta-analyses: 0-20 points
- Sample sizes: 0-15 points
- Replication across independent groups: 0-15 points
- Consistency of findings: 0-10 points
- Recency of evidence: 0-10 points

Determine `evidenceStrength` for each domain:
- `mechanisms`: Strong/Moderate/Weak/Theoretical
- `clinicalBenefits`: Strong/Moderate/Weak/Preliminary
- `safety`: Well-established/Good/Limited/Insufficient
- `dosage`: Evidence-based/Partially established/Unclear/No consensus

Determine `researchMaturity`: Mature/Developing/Emerging/Theoretical

**Step 5 — Database Entry Generation**
```
Goal: Produce the exact JavaScript objects for supplements.js and enhanced_citations.
Skills activated: (none — direct schema population)
```

Generate TWO files:

**A) supplements.js entry** (append to supplements array):
```javascript
{
  "id": NEXT_ID,
  "name": "",
  "scientificName": "",
  "category": "",              // Nootropic, Adaptogen, Anti-inflammatory, Vitamin, Mineral, Amino Acid, Herb, Other
  "commonNames": [],
  "evidenceTier": 1-4,
  "evidenceTierRationale": "",
  "primaryBenefits": {
    "cognitive": [],
    "nonCognitive": [],
    "isEnhanced": true
  },
  "isEnhanced": true,
  "dosageRange": "",
  "optimalDuration": "",
  "studyPopulations": [],
  "mechanismsOfAction": [],
  "safetyProfile": {
    "rating": "",              // Excellent, Good, Moderate, Caution
    "commonSideEffects": [],
    "contraindications": [],
    "drugInteractions": []
  },
  "effectSizes": {},           // keyed by outcome domain
  "commercialAvailability": {
    "forms": [],
    "costRange": "",
    "qualityMarkers": []
  },
  "keyCitations": [],          // Top 3-5 most important papers
  "enhancedCitations": {
    "isEnhanced": true,
    "evidenceProfile": { ... }
  }
}
```

**B) Enhanced citation file** (`data/enhanced_citations/{id}_enhanced.js`):

> **CRITICAL**: See `references/database_schema_reference.md` for the full canonical schema audited against the live codebase. The enhanced citation file MUST:
> - Define a `const {camelCaseName}Enhanced = { ... }` variable
> - Have a `.citations` property with `mechanisms`, `benefits`, `safety` arrays (EnhancedCitationLoader validates `window[globalVar].citations`)
> - Export via `window.enhancedCitations[ID] = {camelCaseName}Enhanced`
> - Include `if (typeof module !== 'undefined' && module.exports)` block

```javascript
const {camelCaseName}Enhanced = {
  "id": ID,
  "name": "Display Name",
  "scientificName": "Binomial name",
  "category": "Category",
  "commonNames": ["Alt name 1", "Alt name 2"],

  "evidenceProfile": {
    "overallQuality": "Tier N",
    "totalCitations": Number,
    "researchQualityScore": Number,   // 0-100
    "lastEvidenceUpdate": "YYYY-MM-DD",
    "evidenceStrength": {
      "mechanisms": "Strong|Moderate|Weak|Theoretical",
      "clinicalBenefits": "Strong|Moderate|Weak|Preliminary",
      "safety": "Well-established|Good|Limited|Insufficient",
      "dosage": "Evidence-based|Partially established|Unclear"
    },
    "researchMaturity": "Mature|Developing|Emerging|Theoretical",
    "publicationSpan": "YYYY-YYYY"
  },

  "citations": {
    "mechanisms": [{
      "mechanism": "Mechanism name",        // Rendered as card title
      "strength": "Strong",                 // Color-coded badge
      "mechanismType": "Enzymatic inhibition", // Secondary badge
      "tissueTarget": "Brain cholinergic neurons",
      "target": "Brain cholinergic neurons", // Set both tissueTarget and target
      "evidence": [{                         // Array of CitationEvidence objects
        "citationId": "author_year_topic",
        "title": "Full study title",
        "authors": ["Author A", "Author B"],
        "year": 2002,
        "journal": "Journal Name",
        "doi": "10.xxxx/xxxxx",             // REQUIRED — rendered as link
        "pmid": "12345678",                 // REQUIRED — rendered as link
        "studyType": "Randomized controlled trial",
        "evidenceLevel": "Level 2",         // Rendered as badge
        "findings": "Brief findings summary", // Rendered in card
        "methodology": "Study methodology"    // Rendered in card
        // See database_schema_reference.md for full field list
      }]
    }],
    "benefits": [{
      "healthDomain": "Memory Enhancement",
      "specificClaim": "Improves episodic memory in healthy adults",
      "strength": "Strong",
      "evidenceQuality": "High",            // Rendered as purple badge
      "replicationStatus": "Well-replicated (6+ studies)",
      "tissueTarget": "Hippocampus",
      "target": "Hippocampus",
      "evidence": [/* CitationEvidence objects */],
      "metaAnalysisSupport": null           // Or MetaAnalysisObject
    }],
    "safety": [{
      "safetyAspect": "General tolerability",
      "claim": "Well-tolerated with mild side effects",
      "riskLevel": "Low",                   // Low=green, Moderate=yellow, High=red
      "target": "Multiple organ systems",
      "tissueTarget": "Multiple organ systems",
      "evidence": [/* SafetyEvidence objects with adverseEvents[] */]
    }],
    "dosage": [{
      "dosageRange": "300mg daily standardized extract",
      "claim": "Optimal dosage claim",
      "evidenceBase": "Strong",
      "target": "Central nervous system",
      "tissueTarget": "Central nervous system",
      "evidence": [/* CitationEvidence objects */]
    }]
  },

  // OPTIONAL: recommended for Tier 1-2 supplements
  "citationMetrics": { /* See schema reference */ },
  "researchEvolution": { /* See schema reference */ },
  "qualityAssurance": { /* See schema reference */ }
};

// === REQUIRED EXPORT BLOCK ===
window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[ID] = {camelCaseName}Enhanced;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {camelCaseName}Enhanced;
}
```

**Step 6 — Content Generation**
```
Goal: Produce human-readable outputs.
Skills activated: scientific-writing, markdown-mermaid-writing
```

Generate into `content/` directory:
- **Newsletter digest** (lay audience) — see Mode 4
- **Scientific summary** — structured abstract with full citations
- **Research update log** — what this adds to the database

---

### Mode 2: Evidence Update (`/research-update`)

Update an existing supplement with new evidence.

**Input:** Supplement name or ID + optional focus area (e.g., "new safety data for Ashwagandha")
**Output:** Updated database entries + change report

#### Workflow Steps

1. **Read current entry** from `supplements.js` and `enhanced_citations/{id}_*.js`
2. **Search for new papers** published AFTER `lastEvidenceUpdate` date
3. **Screen new papers** — only papers that add NEW information (different populations, outcomes, or contradicting existing evidence)
4. **Re-evaluate evidence tier** — does new evidence change the tier? Update `researchQualityScore`.
5. **Merge new citations** into existing enhanced_citations file (do NOT overwrite existing citations)
6. **Generate change report**:

```markdown
# Evidence Update: {Supplement Name}
## Date: {today}
## Previous Tier: {old} → Current Tier: {new}

### New Papers Added ({count})
- {citation summary for each}

### Evidence Changes
- {what changed and why}

### Recommendation Impact
- {did dosage guidance change? safety profile? etc.}
```

---

### Mode 3: Comparative Analysis (`/research-compare`)

Compare supplements targeting the same condition or benefit.

**Input:** Condition/benefit (e.g., "memory enhancement") + optional supplement list
**Output:** Comparison report + data for comparison UI

#### Workflow Steps

1. **Identify candidates** — find all supplements in database with matching `primaryBenefits` entries
2. **Extract effect sizes** — gather all `effectSizes` and `results.effectSize` from enhanced citations
3. **Normalize comparison metrics**:
   - Effect size (Cohen's d or standardized mean difference)
   - Evidence tier
   - Number of RCTs
   - Total sample size across studies
   - Safety rating
   - Cost-effectiveness (effect per dollar/month)
4. **Generate comparison table** (output as both markdown and JSON for the comparison UI)
5. **Write comparative analysis** using scientific-writing skill

Output data model for comparison:
```javascript
{
  "comparisonId": "compare_{condition}_{date}",
  "condition": "",
  "dateGenerated": "",
  "supplements": [
    {
      "id": 0,
      "name": "",
      "evidenceTier": 0,
      "overallEffectSize": "",
      "numberOfRCTs": 0,
      "totalSampleSize": 0,
      "safetyRating": "",
      "monthlyCost": "",
      "onsetTime": "",
      "strengthOfRecommendation": ""   // Strong, Moderate, Conditional, Against
    }
  ],
  "headToHeadStudies": [],              // Any direct comparison trials
  "analysisNarrative": "",
  "keyTakeaways": []
}
```

---

### Mode 4: Newsletter Digest (`/research-newsletter`)

Generate email-ready content for different audiences.

**Input:** Topic (supplement name, condition, or "monthly roundup") + audience (lay | scientific | both)
**Output:** Newsletter markdown + HTML in `content/newsletters/`

#### Lay Audience Format

```markdown
# {Engaging Title — Question or Insight Format}
*{Date} | Evidence-Based Supplement Database*

## The Bottom Line
{1-2 sentence takeaway a non-scientist can act on}

## What the Research Shows
{3-4 paragraphs in conversational tone explaining the evidence}
{Use analogies and everyday language}
{Include "strength of evidence" in plain language: "backed by strong/moderate/limited research"}

## Who Might Benefit
{Target populations in plain language}

## How to Use It
- **Form:** {recommended form}
- **Amount:** {dosage in plain language}
- **Duration:** {how long to try it}
- **Cost:** {monthly cost range}

## Safety Notes
{Side effects and interactions in plain language}
{When to talk to your doctor}

## The Science Corner (Optional Deep Dive)
{For curious readers — effect sizes explained simply, key study details}

## Sources
{Numbered list of key papers with DOI links}

---
*This newsletter is for informational purposes only and does not constitute medical advice.*
*Unsubscribe | View in Browser | Share*
```

#### Scientific Audience Format

```markdown
# Evidence Update: {Supplement Name}
*{Date} | Evidence-Based Supplement Database — Research Digest*

## Abstract
{Structured abstract: Background, Methods, Results, Conclusions}

## Evidence Classification
**Tier:** {1-4} | **Quality Score:** {0-100} | **Maturity:** {Mature/Developing/Emerging}

## Key Findings
### Efficacy
{Effect sizes with confidence intervals, p-values, NNT where available}

### Mechanisms
{Pathway-level summary with citations}

### Safety Profile
{Adverse event rates, contraindications, drug interactions with citation support}

## Methodology
{Search strategy, databases queried, inclusion/exclusion criteria}
{PRISMA-style reporting of study selection}

## Clinical Implications
{What this means for practitioners and researchers}

## Research Gaps
{What we still don't know, suggested future studies}

## Full Reference List
{Complete APA-formatted bibliography}
```

---

### Mode 5: Evidence Audit (`/research-audit`)

Audit the current state of the database for quality issues.

**Input:** Optional — specific supplement, category, or "all"
**Output:** Audit report with action items

Checks performed:
1. **Stale evidence** — supplements not updated in >12 months
2. **Missing DOIs** — citations without valid DOI
3. **Tier misclassification** — evidence tier doesn't match actual citation quality
4. **Incomplete enhanced citations** — supplements with `isEnhanced: false` or empty citation arrays
5. **Missing safety data** — supplements without adequate safety evidence
6. **Effect size gaps** — claims without quantitative effect sizes
7. **Sample size adequacy** — are the cited studies adequately powered?

Output format:
```javascript
{
  "auditDate": "",
  "supplementsAudited": 0,
  "issues": [
    {
      "supplementId": 0,
      "supplementName": "",
      "issueType": "stale_evidence | missing_doi | tier_mismatch | incomplete_enhanced | missing_safety | no_effect_sizes | underpowered",
      "severity": "critical | warning | info",
      "description": "",
      "suggestedAction": ""
    }
  ],
  "summary": {
    "critical": 0,
    "warnings": 0,
    "info": 0,
    "overallHealthScore": 0  // 0-100
  }
}
```

---

### Mode 6: Import Pipeline (`/import-supplement`)

Take fully-researched supplement data (from Mode 1 output or a completed research session) and write all required files to the live site, making the supplement immediately accessible in the database, browse pages, and comparison pages.

**Input:** Supplement ID (next available), name, all research data objects (supplements.js entry + enhanced citations)
**Output:** 5 updated/created files — supplements.js entry, enhanced citations JS, EnhancedCitationLoader.js registry update, static supplement HTML page, static comparison HTML page(s)

---

#### Sub-task A — Append to `data/supplements.js`

Read the current `supplements.js` to confirm the next available ID (count entries; current count is 93, so next ID = 94 unless already incremented). Append the new supplement object to the `supplements` array. Ensure the entry includes **all fields** required by the homepage card renderer:

| Field | Source |
|-------|--------|
| `id` | Next available integer |
| `name` | Common name (title case) |
| `scientificName` | Binomial or IUPAC name |
| `category` | One of: Nootropic, Adaptogen, Anti-inflammatory, Vitamin, Mineral, Amino Acid, Herb, Other |
| `commonNames` | Array of alternative names |
| `evidenceTier` | 1–4 (from Mode 1 Step 4) |
| `evidenceTierRationale` | One-sentence justification |
| `primaryBenefits.cognitive` | Array — first 2 shown on homepage card |
| `primaryBenefits.nonCognitive` | Array — first 2 shown on homepage card |
| `primaryBenefits.isEnhanced` | `true` |
| `isEnhanced` | `true` |
| `dosageRange` | e.g., `"300–600 mg/day"` |
| `optimalDuration` | e.g., `"8–12 weeks"` |
| `studyPopulations` | Array of strings |
| `mechanismsOfAction` | Array of strings |
| `safetyProfile.rating` | Excellent / Good / Moderate / Caution |
| `safetyProfile.commonSideEffects` | Array |
| `safetyProfile.contraindications` | Array |
| `safetyProfile.drugInteractions` | Array |
| `effectSizes` | Object keyed by outcome domain |
| `commercialAvailability.forms` | Array |
| `commercialAvailability.costRange` | String |
| `commercialAvailability.qualityMarkers` | Array |
| `keyCitations` | Top 3–5 citation IDs |
| `enhancedCitations.isEnhanced` | `true` |
| `enhancedCitations.evidenceProfile` | Evidence profile object |

The URL slug used by the site is generated as:
```javascript
supplements/${supplement.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.html
```
Confirm the resulting slug matches what you will write in Sub-task D.

---

#### Sub-task B — Create `data/enhanced_citations/{id}_{slug}_enhanced.js`

Write the enhanced citation JS file using the canonical schema (see SKILL.md Step 5 — Database Entry Generation). The filename format is `{id}_{name-slug}_enhanced.js` where `name-slug` is the supplement name lowercased with hyphens (e.g., `94_lion-s-mane_enhanced.js`).

**Required structure:**

```javascript
const {camelCaseName}Enhanced = {
  "id": ID,
  "name": "Display Name",
  "scientificName": "...",
  "category": "...",
  "commonNames": [...],
  "evidenceProfile": {
    "overallQuality": "Tier N",
    "totalCitations": N,
    "researchQualityScore": N,
    "lastEvidenceUpdate": "YYYY-MM-DD",
    "evidenceStrength": { ... },
    "researchMaturity": "...",
    "publicationSpan": "YYYY-YYYY"
  },
  "citations": {
    "mechanisms": [{ "mechanism": "", "strength": "", "mechanismType": "", "tissueTarget": "", "target": "", "evidence": [...] }],
    "benefits":   [{ "healthDomain": "", "specificClaim": "", "strength": "", "evidenceQuality": "", "replicationStatus": "", "tissueTarget": "", "target": "", "evidence": [...], "metaAnalysisSupport": null }],
    "safety":     [{ "safetyAspect": "", "claim": "", "riskLevel": "", "target": "", "tissueTarget": "", "evidence": [...] }],
    "dosage":     [{ "dosageRange": "", "claim": "", "evidenceBase": "", "target": "", "tissueTarget": "", "evidence": [...] }]
  }
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[ID] = {camelCaseName}Enhanced;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {camelCaseName}Enhanced;
}
```

Every evidence item MUST include: `citationId`, `title`, `authors`, `year`, `journal`, `doi`, `pmid`, `studyType`, `evidenceLevel`, `findings`, `methodology`.

---

#### Sub-task C — Update `EnhancedCitationLoader.js`

Read `EnhancedCitationLoader.js` and locate the `enhancedFiles` array. Append a new entry in the same format as existing entries:

```javascript
{ id: ID, file: 'data/enhanced_citations/{id}_{name-slug}_enhanced.js' }
```

This is the critical registry step — without it the enhanced citation panel will silently fail to load even though the JS file exists.

Verify the entry is appended in ascending ID order to keep the array sorted.

---

#### Sub-task D — Generate Static Supplement HTML Page

Write `supplements/{slug}.html` following the exact structure of the existing supplement pages. Read an existing supplement page (e.g., `supplements/bacopa-monnieri.html`) to obtain the full HTML shell, then substitute all supplement-specific content.

Required page sections (in order):
1. `<head>` — title, meta description, canonical URL, Open Graph tags, JSON-LD (Article + BreadcrumbList schemas)
2. Hero section — supplement name, scientific name, evidence tier badge (inline style: `style="background:#2563eb;color:#fff;padding:0.15rem 0.6rem;border-radius:4px;font-size:0.8rem;"`), category pill
3. Quick Summary card — evidence tier, dosage range, safety rating, primary benefits
4. Evidence Overview — researchQualityScore bar, evidence strength table by domain
5. Mechanisms section — mechanism cards with strength badges
6. Benefits section — benefit cards with evidence quality badges
7. Safety Profile — side effects, contraindications, drug interactions
8. Dosage & Timing — dosage table with evidence base
9. Key Citations — rendered study cards with DOI + PubMed links
10. Related Supplements — links to supplements sharing the same category or benefits

Set canonical URL to `https://supplementdb.co/supplements/{slug}.html`.

---

#### Sub-task E — Generate Static Comparison HTML Page(s)

For each existing supplement in the same category (or sharing 2+ benefits), generate a comparison page at `compare/{new-slug}-vs-{existing-slug}.html`.

**IMPORTANT: All comparison pages MUST use the Mockup B Revolutionary layout.** This is the canonical design for all compare pages. **Never use the old sidebar-toc layout.** The authoritative template is `compare/mockup-b-revolutionary.html`. All pages are generated by running:

```bash
node supp-db-site/scripts/generate-compare-pages.js
```

When adding a new comparison, add an entry to the `COMPARISONS` array in `generate-compare-pages.js` and re-run the script — do NOT hand-author HTML.

---

### Visual Design Standards — Mockup B (Canonical Layout)

All comparison pages follow the **Mockup B Revolutionary Layout** established in `compare/mockup-b-revolutionary.html`. The CSS is fully embedded in each generated page (no external layout dependencies) and the following structural rules are non-negotiable:

#### Page Structure (top to bottom)
1. `<nav class="nav">` — dark sticky navbar (`background: #1a1a2e`, height 58px)
2. `<header class="hero">` — full-width dark gradient hero with VS split treatment
3. `<div class="progress-track">` — sticky numbered progress bar (replaces sidebar TOC)
4. `<div class="page-content">` — centered single column, `max-width: 720px`
5. Floating TOC button (`#toc-toggle`) + panel (`#toc-panel`) at bottom-right

#### Hero — VS Split Treatment
```html
<header class="hero">
  <div class="hero-inner">
    <nav class="hero-breadcrumb">…</nav>
    <div class="hero-vs-row">           <!-- grid: 1fr auto 1fr -->
      <div class="hero-supp hero-supp-a">
        <div class="hero-supp-emoji">{emojiA}</div>
        <div class="hero-supp-label">Supplement A</div>
        <div class="hero-supp-name">{name}</div>
        <div class="hero-supp-sci">{scientificName}</div>
      </div>
      <div class="hero-vs-divider">…VS…</div>
      <div class="hero-supp hero-supp-b">…</div>
    </div>
    <h1 class="hero-title">…</h1>
    <p class="hero-sub">…</p>
    <div class="hero-meta-row">…</div>
  </div>
</header>
```
- Supplement A panel: `background: rgba(45,90,61,0.3)` (green-tinted)
- Supplement B panel: `background: rgba(37,99,235,0.2)` (blue-tinted)

#### Sticky Progress Tracker (replaces sidebar)
```html
<div class="progress-track" id="progress-track">
  <div class="progress-track-inner">
    <!-- 10 steps: Verdict, At a Glance, Evidence, Benefits,
         Mechanisms, Dosage, Safety, Who?, Stacking, References -->
  </div>
</div>
```
`position: sticky; top: 58px; z-index: 90` — scrolls with the page, highlights active section

#### Section Headers (numbered)
```html
<section class="section" id="{id}">
  <div class="section-header">
    <div class="section-num">
      <div class="section-num-circle">{n}</div>
      <div class="section-num-line"></div>
    </div>
    <div class="section-heading-group">
      <div class="section-label">{sublabel}</div>
      <h2>{heading}</h2>
    </div>
  </div>
  …content…
</section>
```

#### Split Comparison Panels
Used for Evidence, Benefits, Mechanisms sections:
```html
<div class="split-compare">
  <div class="split-side split-side-a">  <!-- green-tinted background -->
    <div class="split-side-header">
      <div class="split-dot split-dot-a"></div>
      <div class="split-name"><a href="…">{nameA}</a></div>
    </div>
    <ul class="split-list">…</ul>
  </div>
  <div class="split-side split-side-b">  <!-- blue-tinted background -->
    …
  </div>
</div>
```

#### Color-Coded Tables
```html
<table class="compare-table">
  <thead><tr>
    <th>Attribute</th>
    <th class="col-a">{emojiA} {nameA}</th>   <!-- green header -->
    <th class="col-b">{emojiB} {nameB}</th>    <!-- blue header -->
  </tr></thead>
  <tbody><tr>
    <td>…</td>
    <td class="col-a-data">…</td>
    <td class="col-b-data">…</td>
  </tr></tbody>
</table>
```

#### Decision Cards (Section 8)
```html
<div class="decision-cards">
  <div class="decision-card">  <!-- grid: auto 1fr 1fr -->
    <div class="decision-goal">{scenario}</div>
    <div class="decision-winner">
      <div class="decision-badge badge-a|badge-b|badge-both">
        <i class="fas fa-arrow-left|fa-arrow-right|fa-equals"></i>
        {recommendation}
      </div>
    </div>
    <div class="decision-reason-col">
      <div class="decision-reason">{reason}</div>
    </div>
  </div>
</div>
```
- `badge-a` (green) = Supplement A wins
- `badge-b` (blue) = Supplement B wins
- `badge-both` (purple) = both/neither

#### Stacking Box (Section 9)
```html
<div class="stack-box">
  <div class="stack-verdict-label"><i class="fas fa-layer-group"></i> Stacking Verdict</div>
  <p>{canStack text}</p>
</div>
```

#### Supplement Emoji System
Every supplement gets a unique visual identifier from `getSupplementEmoji(name, category)` in `generate-compare-pages.js`. This is **fully scriptural** — no manual work needed. The function uses name-specific mappings first, then category fallback:

| Supplement | Emoji | | Supplement | Emoji |
|---|---|---|---|---|
| Lion's Mane Mushroom | 🍄 | | Bacopa monnieri | 🌿 |
| Ashwagandha | 🌙 | | Rhodiola rosea | 🏔️ |
| Melatonin | 🌛 | | Magnesium | 🪨 |
| Omega-3 Fatty Acids | 🐟 | | CoQ10 | ⚡ |
| Ginkgo Biloba | 🍃 | | Creatine | 💪 |
| Beta-Alanine | 🔥 | | Vitamin D3 | ☀️ |
| Turmeric/Curcumin | 🟡 | | Boswellia | 🌲 |
| L-Theanine | 🍵 | | 5-HTP | 😌 |

Category fallbacks: Nootropic→🧠, Adaptogen→🌿, Anti-inflammatory→🛡️, Essential Nutrients→💊, Antioxidant→⚡, Performance Enhancers→💪, Amino Acids→🧬, Herbal Extracts→🌿, Mineral→⚗️, Vitamins→☀️, Probiotic→🦠, Sleep Support→🌙, Cardiovascular→❤️, default→🔬

**To add emojis for new supplements**, add an entry to the `SUPPLEMENT_EMOJIS` object in `generate-compare-pages.js` before running the generator.

#### CSS Design Tokens
```css
--accent: #2d5a3d;        /* Primary green */
--accent-light: #3a7a52;
--accent-bg: #f0f7f2;
--accent-dark: #1e3e2b;
--blue: #2563eb;          /* Secondary blue */
--blue-bg: #eff6ff;
--bg-nav: #1a1a2e;        /* Dark navy nav/hero */
--bg-page: #fafaf8;
--col-width: 720px;       /* Reading column width */
--serif: 'Source Serif 4', Georgia, serif;
--sans: 'DM Sans', system-ui, sans-serif;
```

#### Scripts (inline, before `</body>`)
Replace the old `sidebar-toc-active` script with this progress tracker + TOC pattern:
```js
// Progress tracker active state
const steps = document.querySelectorAll('.progress-step a');
const sectionIds = ['verdict','at-a-glance','evidence','benefits',
    'mechanisms','dosage','safety','who-should-choose','stacking','references'];
// ... scroll listener updates .active class on progress steps

// Floating TOC toggle
const tocToggle = document.getElementById('toc-toggle');
tocToggle.addEventListener('click', () =>
    document.getElementById('toc-panel').classList.toggle('open'));

// Share buttons (data-share="twitter|linkedin|copy")
```

**Do NOT use `sidebar-toc.js`, `share-bar.js`, or Tailwind CSS** on comparison pages — the layout is fully self-contained.

---

**Comparison page content structure** (10 required sections):

1. **Quick Verdict** — A 2–3 sentence narrative paragraph summarising which supplement wins for which use case and why.

2. **At a Glance** — Color-coded 3-column table (Attribute | 🅰️ Supplement A | 🅱️ Supplement B) with emoji in column headers. Rows: Evidence Tier, Category, Scientific Name, Clinical Dosage, Key Studies, Primary Benefits, Side Effects, Drug Interactions.

3. **Evidence Comparison** — Split panels. Each side: supplement name link, category + citation count, "Studied Effects" label, unordered list of effect-size bullets (e.g., `Memory: Cohen's d = 0.95`). Followed by shared-domain color-coded table if applicable.

4. **Benefits Comparison** — Shared benefits color-coded table + split panels for unique benefits (one per supplement).

5. **Mechanisms of Action** — Split panels with `<ol>` per supplement.

6. **Dosage & Timing** — Color-coded 3-column table.

7. **Safety Profiles** — Color-coded 3-column table: Side Effects, Drug Interactions, Contraindications.

8. **Who Should Choose Which** — Decision cards (3-col grid: goal | winner badge | reason). Badge colors: green (A), blue (B), purple (both/neither).

9. **Can You Stack Them?** — `stack-box` div with `stack-verdict-label` badge + paragraph.

10. **References** — `ref-group` per supplement with `ref-list` and numbered `ref-num` circles.

Generate comparison pages only for supplements where a meaningful head-to-head comparison adds genuine value (same category, overlapping benefits, or commonly confused). Do not generate comparison pages for supplements with no meaningful relationship. Aim for 1–3 new comparison pages per imported supplement.

---

#### Import Checklist

Before marking Mode 6 complete, verify:
- [ ] `supplements.js` — new entry appended, all required fields populated, no syntax errors
- [ ] `{id}_{slug}_enhanced.js` — file exists, exports `window.enhancedCitations[ID]`, all citation arrays non-empty
- [ ] `EnhancedCitationLoader.js` — new `{ id, file }` entry present in `enhancedFiles` array
- [ ] `supplements/{slug}.html` — page loads, JSON-LD present, no broken asset references
- [ ] Add new comparison entry to `COMPARISONS` array in `scripts/generate-compare-pages.js`, then run `node scripts/generate-compare-pages.js` to regenerate all 10 compare pages
- [ ] `compare/{slug-a}-vs-{slug-b}.html` — Mockup B layout present (progress-track, hero-vs-row, split-compare, decision-cards, stack-box), all 10 sections, references populated
- [ ] Add emoji to `SUPPLEMENT_EMOJIS` in `generate-compare-pages.js` if the new supplement is not already mapped
- [ ] Run `node -e "require('./data/supplements.js')"` (or equivalent syntax check) to verify JS validity
- [ ] Check browser console for errors on the supplement page and comparison page(s)

---

## Evidence Tier Decision Tree

When assigning or updating evidence tiers, follow this decision tree:

```
START: Does the supplement have human clinical data?
├── NO → Tier 4 (Emerging/Theoretical)
│   └── Exception: Strong mechanistic plausibility + active clinical trials → Tier 3
├── YES → How many RCTs?
│   ├── 0 RCTs (only observational/case studies) → Tier 4
│   ├── 1-2 RCTs (small, n<50 each) → Tier 3
│   ├── 3+ RCTs OR 1+ with n>100 → Is there a systematic review/meta-analysis?
│   │   ├── NO → Tier 2
│   │   └── YES → Are findings consistent across reviews?
│   │       ├── YES → Tier 1
│   │       └── NO (conflicting) → Tier 2
│   └── SPECIAL: Multiple meta-analyses with consistent large effects → Tier 1
```

---

## Citation ID Convention

All citation IDs in the database follow this format:
```
{first_author_last_name}_{year}_{topic_keyword}
```

Examples:
- `roodenrys_2002_memory`
- `calabrese_2008_safety`
- `pase_2012_systematic`
- `das_2002_ache`

Rules:
- Lowercase only
- Underscores as separators
- Topic keyword should be unique within that supplement's citations
- For meta-analyses/systematic reviews, use `systematic` or `meta` as keyword

---

## Quality Control Checklist

Before finalizing ANY output from this pipeline:

### Data Integrity
- [ ] All DOIs validated via CrossRef (use citation-management skill)
- [ ] All PMIDs verified (cross-reference with PubMed)
- [ ] No placeholder text (every field is real data or explicitly marked as "Data not available")
- [ ] All files are valid JavaScript (no syntax errors)

### Schema Compliance
- [ ] Enhanced citations file defines `const {camelCaseName}Enhanced = { ... }`
- [ ] File has `.citations` property with `mechanisms`, `benefits`, `safety` arrays
- [ ] Export uses `window.enhancedCitations[ID] = {camelCaseName}Enhanced`
- [ ] Every mechanism group has: `mechanism`, `strength`, `mechanismType`, `tissueTarget`, `target`, `evidence[]`
- [ ] Every benefit group has: `healthDomain`, `specificClaim`, `strength`, `evidenceQuality`, `replicationStatus`, `evidence[]`
- [ ] Every safety group has: `safetyAspect`, `claim`, `riskLevel`, `evidence[]`
- [ ] Every evidence item has: `citationId`, `title`, `authors`, `year`, `journal`, `doi`, `pmid`, `evidenceLevel`, `findings`

### Evidence Quality
- [ ] Evidence tier matches decision tree logic
- [ ] `researchQualityScore` calculation is documented in provenance
- [ ] Evidence strength assignments are justified per domain

### Content Quality
- [ ] Newsletter content does NOT make medical claims or recommendations
- [ ] Safety warnings are included for any supplement with known interactions
- [ ] Lay audience content is jargon-free (Flesch-Kincaid Grade Level ≤ 10)
- [ ] Scientific audience content includes full statistical details

### Provenance Trail
- [ ] All required provenance documents generated (see mode requirements table)
- [ ] `search_log.md` records every database query with exact query strings and dates
- [ ] `screening_decisions.md` documents every include/exclude decision with reasons
- [ ] `evidence_evaluation.md` has per-study GRADE assessment
- [ ] `tier_assignment.md` walks through the decision tree with explicit justifications
- [ ] `synthesis_notes.md` explains how individual studies were aggregated into claims
- [ ] Provenance documents are self-contained (readable without running the pipeline again)

---

## Skill Activation Reference

This skill activates other skills in specific combinations depending on the mode:

| Pipeline Step | Skills Activated | Purpose |
|---------------|-----------------|---------|
| Compound identification | `chembl-database`, `pubchem-database`, `hmdb-database` | Chemical/pharmacological identity |
| Literature search | `literature-review`, `pubmed-database` | Systematic evidence gathering |
| Evidence search (MCP) | PubMed MCP, Consensus MCP, bioRxiv MCP | Real-time database queries |
| Evidence screening | `scientific-critical-thinking` | GRADE framework, risk of bias |
| Citation management | `citation-management` | DOI validation, BibTeX, formatting |
| Statistical review | `statistical-analysis` | Effect size interpretation, power analysis |
| Content writing | `scientific-writing` | Structured prose, IMRAD format |
| Visual content | `infographics`, `markdown-mermaid-writing` | Diagrams, pathway charts |
| Trial monitoring | `clinicaltrials-database` | Active/upcoming trial tracking |

---

## Output Directory Structure

All generated content goes into `supp-db-site/content/` (created on first use):

```
content/
├── newsletters/
│   ├── lay/
│   │   └── {date}_{supplement_name}_lay.md
│   └── scientific/
│       └── {date}_{supplement_name}_scientific.md
├── research-updates/
│   └── {date}_{supplement_name}_update.md
├── comparisons/
│   └── {date}_{condition}_comparison.json
├── audience-summaries/
│   ├── lay/
│   │   └── {supplement_name}_summary_lay.md
│   └── scientific/
│       └── {supplement_name}_summary_scientific.md
├── audits/
│   └── {date}_audit_report.json
└── provenance/                          # NEW: Research provenance trail
    └── {supplement_snake_name}/
        ├── search_log.md                # What was searched, when, where
        ├── screening_decisions.md       # Include/exclude decisions per paper
        ├── evidence_evaluation.md       # GRADE assessment, quality scoring
        ├── tier_assignment.md           # How the evidence tier was determined
        └── synthesis_notes.md           # Aggregation methodology and conclusions
```

Mode 6 import artifacts write directly to the live site (outside `content/`):

```
supp-db-site/
├── supplements/                        # Per-supplement HTML pages (Mode 6 Sub-task D)
│   └── {slug}.html
└── compare/                            # Static comparison HTML pages (Mode 6 Sub-task E)
    └── {slug-a}-vs-{slug-b}.html
```

---

## Provenance Trail System

Every pipeline execution MUST produce a provenance trail — a set of local markdown documents that transparently document the entire research-to-data journey. These documents serve three purposes:

1. **Transparency** — Any reviewer can trace exactly how a database entry was constructed
2. **Reproducibility** — The search strategies and evaluation criteria enable independent verification
3. **Local resynthesis** — Aggregated research can be re-evaluated locally without re-running searches

### Provenance Directory

Provenance documents live in `supp-db-site/content/provenance/{supplement_snake_name}/`. One directory per supplement.

### Required Provenance Documents

Every pipeline run (Mode 1-5) MUST generate the applicable provenance documents. Use the templates in `templates/provenance/`.

#### 1. Search Log (`search_log.md`)

**Generated by:** Mode 1, Mode 2, Mode 3
**Template:** `templates/provenance/search_log_template.md`

Records every database query executed during the research phase:

```markdown
# Search Provenance: {Supplement Name}
## Pipeline Run: {date} | Mode: {mode_name}

### Search Strategy Summary
- **Databases queried:** PubMed, Consensus, bioRxiv, ClinicalTrials.gov
- **Date range searched:** {earliest}-{latest}
- **Total unique results:** {N}
- **After deduplication:** {N}

### PubMed Searches
| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | "{supplement}"[Title/Abstract] AND randomized controlled trial[pt] | Human, English | 42 | 2026-03-04 |
| 2 | "{supplement}"[MeSH] AND "dietary supplements"[MeSH] | Human | 28 | 2026-03-04 |

### Consensus API Searches
| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "What are the effects of {supplement} on {benefit}?" | human=true, sjr_max=2 | 15 | 2026-03-04 |

### bioRxiv Searches
| # | Category | Date Range | Results | Date Executed |
|---|----------|-----------|---------|---------------|
| 1 | pharmacology | last 365 days | 3 | 2026-03-04 |

### ClinicalTrials.gov Searches
| # | Condition | Intervention | Status Filter | Results | Date Executed |
|---|-----------|-------------|---------------|---------|---------------|
| 1 | {condition} | {supplement} | completed | 5 | 2026-03-04 |

### Deduplication Summary
- PubMed-Consensus overlap: {N} duplicates removed
- Total unique papers for screening: {N}
```

#### 2. Screening Decisions (`screening_decisions.md`)

**Generated by:** Mode 1, Mode 2
**Template:** `templates/provenance/screening_decisions_template.md`

Documents every include/exclude decision for transparency:

```markdown
# Screening Decisions: {Supplement Name}
## Pipeline Run: {date}

### Inclusion Criteria
1. Human subjects (for clinical evidence)
2. Published in peer-reviewed journal
3. Available DOI
4. Relevant to supplement's claimed benefits, mechanisms, or safety
5. {Additional criteria specific to this search}

### Exclusion Criteria
1. Non-English without English abstract
2. Retracted papers
3. Conference abstracts only (no full publication)
4. Duplicate publications of same dataset
5. {Additional criteria}

### Screening Results

#### Included Papers ({N} total)
| # | Citation ID | DOI | Study Type | Reason for Inclusion | Assigned Section |
|---|------------|-----|-----------|---------------------|-----------------|
| 1 | roodenrys_2002_memory | 10.1007/s002130100... | RCT | Large RCT on primary outcome | benefits |
| 2 | das_2002_ache | 10.1016/s0091-3057... | In vitro/animal | Key mechanism elucidation | mechanisms |

#### Excluded Papers ({N} total)
| # | Title | DOI | Reason for Exclusion |
|---|-------|-----|---------------------|
| 1 | "Traditional uses of..." | 10.xxxx/... | Review article, no original data |
| 2 | "Preliminary effects..." | 10.xxxx/... | Conference abstract only |

### PRISMA Flow Summary
- Records identified through database searching: {N}
- Records after duplicates removed: {N}
- Records screened (title/abstract): {N}
- Records excluded at screening: {N}
- Full-text articles assessed for eligibility: {N}
- Full-text articles excluded: {N}
- Studies included in final evidence synthesis: {N}
```

#### 3. Evidence Evaluation (`evidence_evaluation.md`)

**Generated by:** Mode 1, Mode 2, Mode 5
**Template:** `templates/provenance/evidence_evaluation_template.md`

Documents how each included study was evaluated:

```markdown
# Evidence Evaluation: {Supplement Name}
## Pipeline Run: {date}

### Evaluation Framework
- **Primary:** GRADE (Grading of Recommendations Assessment, Development and Evaluation)
- **Bias assessment:** Cochrane Risk of Bias 2.0 (for RCTs)
- **Quality scoring:** Modified Jadad scale + custom composite

### Per-Study Evaluation

#### Study: {citationId} — {brief title}
- **Study type:** {type}
- **GRADE domains:**
  - Risk of bias: {Low/Some concerns/High} — {justification}
  - Inconsistency: {Not serious/Serious/Very serious} — {justification}
  - Indirectness: {Not serious/Serious} — {justification}
  - Imprecision: {Not serious/Serious} — {justification}
  - Publication bias: {Undetected/Suspected/Likely} — {justification}
- **Overall GRADE certainty:** {High/Moderate/Low/Very Low}
- **Assigned evidence level:** Level {1-5}
- **Quality score contribution:** {points}/10

{Repeat for each study}

### Aggregate Quality Metrics
- **Average study quality:** {N}/10
- **Evidence level distribution:** Level 1: {N}, Level 2: {N}, Level 3: {N}, Level 4: {N}
- **Replication assessment:** {description of replication across labs/populations}
- **Publication bias assessment:** {funnel plot assessment or note on limited data}
- **Funding source analysis:** {N} independent, {N} industry-sponsored, {N} government
- **Geographic diversity:** {countries represented}
```

#### 4. Tier Assignment (`tier_assignment.md`)

**Generated by:** Mode 1, Mode 2
**Template:** `templates/provenance/tier_assignment_template.md`

Documents exactly how the evidence tier and quality score were calculated:

```markdown
# Tier Assignment: {Supplement Name}
## Pipeline Run: {date}
## Previous Tier: {N/A or previous} → Assigned Tier: {N}

### Decision Tree Walkthrough
1. Does the supplement have human clinical data? → {YES/NO}
2. How many RCTs? → {N}
3. Any RCT with n>100? → {YES/NO}
4. Systematic review or meta-analysis exists? → {YES/NO}
5. Are findings consistent across reviews? → {YES/NO/N/A}

**Decision:** Tier {N} because {specific reason tracing through the tree}

### Research Quality Score Breakdown (0-100)
| Component | Max Points | Awarded | Justification |
|-----------|-----------|---------|---------------|
| Number and quality of RCTs | 30 | {N} | {N} RCTs, avg quality {N}/10 |
| Presence of meta-analyses | 20 | {N} | {N} meta-analyses found |
| Sample sizes | 15 | {N} | Total N={N}, largest single RCT n={N} |
| Replication across groups | 15 | {N} | {N} independent research groups |
| Consistency of findings | 10 | {N} | {description} |
| Recency of evidence | 10 | {N} | Most recent study: {year} |
| **TOTAL** | **100** | **{N}** | |

### Evidence Strength Assignments
| Domain | Rating | Justification |
|--------|--------|---------------|
| Mechanisms | {rating} | {justification} |
| Clinical Benefits | {rating} | {justification} |
| Safety | {rating} | {justification} |
| Dosage | {rating} | {justification} |

### Research Maturity: {rating}
**Justification:** {why this maturity level}

### Evidence Gaps Identified
1. {gap 1}
2. {gap 2}
```

#### 5. Synthesis Notes (`synthesis_notes.md`)

**Generated by:** Mode 1, Mode 2, Mode 3
**Template:** `templates/provenance/synthesis_notes_template.md`

Documents how individual study findings were aggregated into database claims:

```markdown
# Research Synthesis: {Supplement Name}
## Pipeline Run: {date}

### Synthesis Methodology
- **Approach:** Narrative synthesis with quantitative effect size extraction
- **Effect size metric:** Cohen's d (standardized mean difference)
- **Confidence assessment:** GRADE certainty of evidence

### Mechanism Synthesis
For each mechanism group in the enhanced citation file, document how it was derived:

#### Mechanism: {mechanism name}
- **Sources:** {citationId_1}, {citationId_2}, {citationId_3}
- **Convergent evidence:** {what the studies agree on}
- **Divergent evidence:** {any contradictions or caveats}
- **Strength assignment rationale:** {why "Strong"/"Moderate"/"Weak"}
- **Tissue target determination:** {how target was identified}

### Benefit Synthesis
For each benefit claim:

#### Benefit: {healthDomain} — {specificClaim}
- **Sources:** {citationId_1}, {citationId_2}
- **Effect sizes reported:** {list of effect sizes from studies}
- **Pooled estimate:** {if meta-analysis available, or narrative summary}
- **Replication status:** {how was this determined}
- **Clinical significance threshold:** {what constitutes clinically meaningful}
- **Confidence in claim:** {High/Moderate/Low with justification}

### Safety Synthesis
#### Safety Aspect: {aspect}
- **Sources:** {citationId_1}, {citationId_2}
- **Adverse event aggregation:** {how frequencies were combined/reported}
- **Risk level determination:** {justification}

### Dosage Synthesis
- **Optimal dosage determination:** {how range was derived}
- **Duration evidence:** {onset time and recommended duration}

### Cross-Study Patterns
- **Consistent findings across all studies:** {list}
- **Contradictory findings:** {list with citations}
- **Dose-response relationship:** {observed/not observed}
- **Population-specific effects:** {if any subgroups respond differently}

### Limitations of This Synthesis
1. {limitation 1}
2. {limitation 2}

### Date of Last Search
All evidence current as of: {date}
Next scheduled review: {date + 12 months}
```

### Provenance Requirements by Pipeline Mode

| Pipeline Mode | search_log | screening_decisions | evidence_evaluation | tier_assignment | synthesis_notes |
|---------------|-----------|-------------------|--------------------|-----------------|-----------------|
| Mode 1: New Supplement | REQUIRED | REQUIRED | REQUIRED | REQUIRED | REQUIRED |
| Mode 2: Evidence Update | REQUIRED | REQUIRED | REQUIRED | REQUIRED (if tier changed) | REQUIRED |
| Mode 3: Comparative | REQUIRED | Optional | Optional | N/A | REQUIRED |
| Mode 4: Newsletter | N/A | N/A | N/A | N/A | Optional (brief) |
| Mode 5: Evidence Audit | N/A | N/A | REQUIRED | REQUIRED (per flagged item) | N/A |
| Mode 6: Import Pipeline | N/A | N/A | N/A | N/A | N/A |

### Provenance Update Protocol

When running Mode 2 (Evidence Update):
1. **DO NOT overwrite** existing provenance documents
2. **Append** new search logs with clear date headers
3. **Add** new screening decisions below existing ones
4. **Update** tier_assignment.md only if the tier or score changed — preserve the previous assessment with a `### Previous Assessment ({date})` section
5. **Extend** synthesis_notes.md with new evidence integration notes

---

## Important Notes

- This skill NEVER fabricates citations. Every DOI, PMID, and finding MUST come from a real search result.
- When search results are insufficient, explicitly state "Insufficient evidence found" rather than padding with low-quality sources.
- The database schema in `references/database_schema_reference.md` is the canonical reference, audited against the live codebase's `CitationRenderer.js` and `EnhancedCitationLoader.js`. Never introduce fields that don't exist in the schema without first documenting the addition.
- Newsletter content must include the disclaimer: "This newsletter is for informational purposes only and does not constitute medical advice."
- Always preserve backward compatibility with existing UI code. New data fields should be additive, never breaking.
- **Provenance is mandatory.** Every pipeline run MUST produce the applicable provenance trail documents in `content/provenance/{supplement_name}/`. These documents are the transparent audit trail that enables independent verification and local resynthesis of aggregated research.
- Provenance documents should be **self-contained** — a reader should be able to understand every decision that was made without having to re-run the pipeline or access external systems.
- When updating existing supplements (Mode 2), **append** to provenance documents rather than overwriting them, preserving the complete history of evidence assessment.
