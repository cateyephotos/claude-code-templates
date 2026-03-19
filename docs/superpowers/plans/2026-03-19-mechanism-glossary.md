# Mechanism Glossary Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a navigable mechanism glossary page with ~170 canonical mechanism entries, linked from all evidence guide mechanism pills and quick summary tables.

**Architecture:** One-time canvas script extracts and consolidates 330 raw mechanisms into ~170 canonical entries with AI-generated descriptions. A build script renders the glossary HTML. The guide generator wraps mechanism text in links using an alias map.

**Tech Stack:** Node.js scripts, static HTML/CSS/JS, Claude API for description generation.

---

## File Structure

```
supp-db-site/
  data/
    mechanisms.js              # NEW — canonical mechanism database with alias map
  scripts/
    canvas-mechanisms.js       # NEW — one-time: extract, consolidate, generate descriptions
    build-mechanism-glossary.js # NEW — renders guides/mechanisms.html from data/mechanisms.js
    generate-guide-pages.js    # MODIFY — add mechanism linking (lines ~2150-2152, ~2386-2391)
  guides/
    mechanisms.html            # NEW — generated glossary page
```

---

## Chunk 1: Data Extraction & Consolidation

### Task 1: Canvas script — extract and consolidate mechanisms

**Files:**
- Create: `supp-db-site/scripts/canvas-mechanisms.js`
- Read: `supp-db-site/data/supplements.js`

- [ ] **Step 1: Create the canvas script**

The script does 4 things:
1. Extract all unique `mechanismsOfAction` strings from `supplements.js`
2. Build a reverse map: mechanism string → list of supplement names
3. Cluster near-duplicates by shared root words (e.g., "Acetylcholine synthesis enhancement/support/increase" → one canonical entry)
4. Assign each cluster to one of 9 biological categories
5. Output a draft `data/mechanisms.js` with empty `summary` and `relevance` fields

```js
// supp-db-site/scripts/canvas-mechanisms.js
const fs = require('fs');
const path = require('path');

const db = require('../data/supplements.js');

// ── Step 1: Extract all unique mechanisms with supplement attribution ──
const mechToSupps = {};
for (const s of db.supplements) {
  for (const m of (s.mechanismsOfAction || [])) {
    const mStr = typeof m === 'string' ? m : (m.mechanism || String(m));
    if (!mechToSupps[mStr]) mechToSupps[mStr] = [];
    if (!mechToSupps[mStr].includes(s.name)) mechToSupps[mStr].push(s.name);
  }
}

const allMechs = Object.keys(mechToSupps).sort();
console.log(`Extracted ${allMechs.length} unique mechanisms from ${db.supplements.length} supplements`);

// ── Step 2: Cluster near-duplicates ──
// Normalize: lowercase, strip trailing variations like "enhancement/support/increase"
function normalize(str) {
  return str.toLowerCase()
    .replace(/\s*(enhancement|support|increase|promotion|stimulation|improvement|modulation|activation|inhibition|production|regulation|synthesis|precursor)\s*$/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

const clusters = {}; // normalized key → { canonical, aliases, supplements }
const assigned = new Set();

for (const m of allMechs) {
  if (assigned.has(m)) continue;

  const norm = normalize(m);

  // Find all mechanisms that share this normalized root
  const group = allMechs.filter(other => {
    if (assigned.has(other)) return false;
    return normalize(other) === norm;
  });

  if (group.length === 0) group.push(m);

  // Pick the shortest as canonical (usually the cleanest phrasing)
  const canonical = group.sort((a, b) => a.length - b.length)[0];
  const aliases = group.filter(g => g !== canonical);
  const supplements = new Set();
  for (const g of group) {
    for (const s of (mechToSupps[g] || [])) supplements.add(s);
  }

  const id = canonical.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

  clusters[id] = {
    id,
    canonicalName: canonical,
    aliases,
    category: '', // filled by categorization step
    summary: '',  // filled by AI generation step
    relevance: '',
    relatedMechanisms: [],
    supplements: [...supplements].sort(),
  };

  group.forEach(g => assigned.add(g));
}

console.log(`Consolidated into ${Object.keys(clusters).length} canonical mechanisms`);

// ── Step 3: Auto-categorize ──
const CATEGORY_KEYWORDS = {
  'Neurotransmitter Systems': ['acetylcholine', 'dopamine', 'serotonin', 'gaba', 'glutamate', 'norepinephrine', 'neurotransmitter', 'cholinergic', 'adrenergic', 'receptor', 'synaptic', 'brain wave', 'alpha wave', 'nmda', 'ampa', 'adenosine'],
  'Antioxidant & Cellular Protection': ['antioxidant', 'oxidative', 'free radical', 'nrf2', 'glutathione', 'superoxide', 'ros', 'lipid peroxidation', 'mitochondri', 'nad+', 'atp', 'cellular energy', 'electron transport', 'coenzyme q10', 'dna repair', 'telomer', 'sirtu'],
  'Anti-inflammatory Pathways': ['anti-inflammatory', 'inflammation', 'nf-kb', 'cox-2', 'prostaglandin', 'cytokine', 'tnf', 'interleukin', 'leukotriene', 'lipoxygenase', 'mast cell'],
  'Hormonal & Endocrine': ['hormone', 'cortisol', 'testosterone', 'estrogen', 'thyroid', 'insulin', 'igf', 'hpa axis', 'adaptogen', 'endocrine', 'dhea', 'growth hormone', 'androgen', 'aromatase'],
  'Metabolic & Energy': ['metaboli', 'glycol', 'glucos', 'ampk', 'lipid', 'fat oxidation', 'thermogen', 'ketone', 'creatine', 'phosphocreatine', 'glycogen', 'blood sugar', 'insulin sensitiv', 'energy substrate', 'carnitine', 'beta-oxidation'],
  'Cardiovascular & Circulatory': ['cardiovascular', 'blood pressure', 'vasodilat', 'nitric oxide', 'endothelial', 'blood flow', 'cholesterol', 'ldl', 'hdl', 'triglyceride', 'platelet', 'ace inhibit', 'angiotensin', 'cerebral blood'],
  'Immune Modulation': ['immune', 'immunomodulat', 'nk cell', 't-cell', 'lymphocyte', 'macrophage', 'interferon', 'antimicrobial', 'antibacterial', 'antiviral', 'pathogen'],
  'Structural & Repair': ['collagen', 'cartilage', 'bone', 'joint', 'connective tissue', 'myelin', 'nerve growth', 'ngf', 'bdnf', 'neurogenesis', 'synaptogenesis', 'proteoglycan', 'glycosaminoglycan', 'muscle protein', 'mtor'],
  'Gut-Brain Axis': ['gut', 'microbiome', 'prebiotic', 'probiotic', 'intestinal', 'digestive', 'bile', 'gut-brain', 'enteric'],
};

for (const cluster of Object.values(clusters)) {
  const searchStr = (cluster.canonicalName + ' ' + cluster.aliases.join(' ')).toLowerCase();
  let bestCat = 'Metabolic & Energy'; // default
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => searchStr.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }

  cluster.category = bestCat;
}

// ── Step 4: Build aliasMap ──
const aliasMap = {};
for (const cluster of Object.values(clusters)) {
  aliasMap[cluster.canonicalName] = cluster.id;
  for (const alias of cluster.aliases) {
    aliasMap[alias] = cluster.id;
  }
}

// ── Step 5: Build output ──
const categories = [...new Set(Object.values(clusters).map(c => c.category))].sort();
const mechanisms = Object.values(clusters).sort((a, b) =>
  a.category.localeCompare(b.category) || a.canonicalName.localeCompare(b.canonicalName)
);

const output = {
  version: '1.0',
  lastUpdated: new Date().toISOString().split('T')[0],
  categories,
  mechanisms,
  aliasMap,
};

const outPath = path.join(__dirname, '..', 'data', 'mechanisms.js');
const js = `// Mechanism Glossary Database — Auto-generated by canvas-mechanisms.js
// ${mechanisms.length} canonical mechanisms consolidated from ${allMechs.length} raw strings
// Last generated: ${output.lastUpdated}
//
// REVIEW: summary and relevance fields need human review after AI generation

const mechanismDatabase = ${JSON.stringify(output, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = mechanismDatabase;
}
if (typeof window !== 'undefined') {
  window.mechanismDatabase = mechanismDatabase;
}
`;

fs.writeFileSync(outPath, js, 'utf8');
console.log(`\nWrote ${outPath}`);
console.log(`  ${mechanisms.length} canonical mechanisms`);
console.log(`  ${Object.keys(aliasMap).length} alias mappings`);
console.log(`  ${categories.length} categories`);

// Print category distribution
const catCounts = {};
for (const m of mechanisms) catCounts[m.category] = (catCounts[m.category] || 0) + 1;
for (const [cat, count] of Object.entries(catCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`    ${cat}: ${count}`);
}
```

- [ ] **Step 2: Run the canvas script**

```bash
cd supp-db-site && node scripts/canvas-mechanisms.js
```

Expected: Creates `data/mechanisms.js` with ~170 entries, all having empty `summary` and `relevance` fields.

- [ ] **Step 3: Commit the canvas output**

```bash
git add supp-db-site/scripts/canvas-mechanisms.js supp-db-site/data/mechanisms.js
git commit -m "feat: canvas 330 mechanisms into ~170 canonical entries with alias map"
```

---

### Task 2: AI-generate mechanism descriptions

**Files:**
- Modify: `supp-db-site/data/mechanisms.js`
- Create: `supp-db-site/scripts/generate-mechanism-descriptions.js`

- [ ] **Step 1: Create the description generator script**

This script reads `data/mechanisms.js`, finds entries with empty `summary`/`relevance`, and generates descriptions using Claude API. It writes results back to the same file.

```js
// supp-db-site/scripts/generate-mechanism-descriptions.js
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();
const mechPath = path.join(__dirname, '..', 'data', 'mechanisms.js');

// Load current mechanisms database
let src = fs.readFileSync(mechPath, 'utf8');
const match = src.match(/const mechanismDatabase = ({[\s\S]+});/);
if (!match) { console.error('Cannot parse mechanisms.js'); process.exit(1); }
const db = JSON.parse(match[1]);

const needsGeneration = db.mechanisms.filter(m => !m.summary || m.summary.length < 10);
console.log(`${needsGeneration.length} mechanisms need descriptions (${db.mechanisms.length} total)`);

async function generateBatch(mechs) {
  const prompt = mechs.map((m, i) =>
    `${i+1}. "${m.canonicalName}" (Category: ${m.category}, Used by: ${m.supplements.slice(0,3).join(', ')})`
  ).join('\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are writing a mechanism glossary for a supplement database. For each mechanism below, provide:
- "summary": 2-3 sentences explaining what this mechanism is and how it works. Write for someone with a college degree but no biology background. Avoid jargon — if you use a technical term, explain it in the same sentence.
- "relevance": 1 sentence explaining why this mechanism matters for people taking dietary supplements.

Return ONLY a JSON array with objects like: {"index": 1, "summary": "...", "relevance": "..."}

Mechanisms:
${prompt}`
    }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array in response');
  return JSON.parse(jsonMatch[0]);
}

async function run() {
  // Process in batches of 15
  for (let i = 0; i < needsGeneration.length; i += 15) {
    const batch = needsGeneration.slice(i, i + 15);
    console.log(`Generating batch ${Math.floor(i/15)+1}/${Math.ceil(needsGeneration.length/15)} (${batch.length} mechanisms)...`);

    try {
      const results = await generateBatch(batch);
      for (const r of results) {
        const mech = batch[r.index - 1];
        if (mech && r.summary) {
          mech.summary = r.summary;
          mech.relevance = r.relevance || '';
        }
      }
    } catch(e) {
      console.error(`Batch error: ${e.message}`);
    }

    // Rate limit
    if (i + 15 < needsGeneration.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Write back
  const js = `// Mechanism Glossary Database — Auto-generated by canvas-mechanisms.js
// ${db.mechanisms.length} canonical mechanisms with AI-generated descriptions
// Last generated: ${new Date().toISOString().split('T')[0]}
// Descriptions generated by Claude Haiku — REVIEW BEFORE PUBLISHING

const mechanismDatabase = ${JSON.stringify(db, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = mechanismDatabase;
}
if (typeof window !== 'undefined') {
  window.mechanismDatabase = mechanismDatabase;
}
`;
  fs.writeFileSync(mechPath, js, 'utf8');

  const filled = db.mechanisms.filter(m => m.summary && m.summary.length > 10).length;
  console.log(`\nDone. ${filled}/${db.mechanisms.length} mechanisms have descriptions.`);
}

run().catch(console.error);
```

- [ ] **Step 2: Run the description generator**

```bash
cd supp-db-site && node scripts/generate-mechanism-descriptions.js
```

Expected: `data/mechanisms.js` now has `summary` and `relevance` filled for all ~170 entries.

- [ ] **Step 3: Spot-check 5 random entries for quality**

Read `data/mechanisms.js` and verify descriptions are:
- College-level accessible (no unexplained jargon)
- Factually accurate
- 2-3 sentences for summary, 1 sentence for relevance

- [ ] **Step 4: Commit**

```bash
git add supp-db-site/scripts/generate-mechanism-descriptions.js supp-db-site/data/mechanisms.js
git commit -m "feat: AI-generate plain-language descriptions for ~170 mechanisms"
```

---

## Chunk 2: Glossary Page & Guide Integration

### Task 3: Build the glossary page renderer

**Files:**
- Create: `supp-db-site/scripts/build-mechanism-glossary.js`
- Output: `supp-db-site/guides/mechanisms.html`

- [ ] **Step 1: Create the glossary build script**

This script reads `data/mechanisms.js` and renders a self-contained HTML page matching the dark journal theme.

The script must:
1. Load `data/mechanisms.js`
2. Group mechanisms by category
3. Sort alphabetically within each category
4. Render HTML with:
   - Hero section (title, subtitle, mechanism count)
   - Search bar (client-side JS filter)
   - Category pill navigation (same `.cite-tab` pattern)
   - Mechanism entries with id anchors, summary, relevance, supplement links
   - Footer matching other guides
5. Include `<meta name="clerk-key">` and `<meta name="convex-url">`
6. Write to `guides/mechanisms.html`

Key HTML structure for each entry:
```html
<div class="mech-entry" id="acetylcholinesterase-inhibition">
  <h3 class="mech-entry-name">Acetylcholinesterase Inhibition</h3>
  <p class="mech-aliases">Also known as: AChE inhibition</p>
  <p class="mech-summary">...</p>
  <p class="mech-relevance"><strong>Why it matters:</strong> ...</p>
  <div class="mech-supplements">
    Found in: <a href="../supplements/bacopa-monnieri.html">Bacopa monnieri</a>, ...
  </div>
</div>
```

CSS should reuse the existing guide theme variables (`--bg-base`, `--text-bright`, `--accent-light`, etc.) and `.cite-tab` patterns for category navigation.

Search JS filters `.mech-entry` elements by checking if the entry's text content includes the search query.

- [ ] **Step 2: Run the glossary builder**

```bash
cd supp-db-site && node scripts/build-mechanism-glossary.js
```

Expected: `guides/mechanisms.html` exists, opens in browser, shows categorized mechanism entries with working search and category tabs.

- [ ] **Step 3: Verify in browser**

Open `http://localhost:8080/guides/mechanisms.html` and check:
- Hero renders with correct count
- Category tabs filter correctly
- Search filters as you type
- Anchor links work (e.g., `mechanisms.html#acetylcholinesterase-inhibition` scrolls to entry)
- Supplement links point to correct supplement pages

- [ ] **Step 4: Commit**

```bash
git add supp-db-site/scripts/build-mechanism-glossary.js supp-db-site/guides/mechanisms.html
git commit -m "feat: build mechanism glossary page with search and category navigation"
```

---

### Task 4: Integrate mechanism links into guide generator

**Files:**
- Modify: `supp-db-site/scripts/generate-guide-pages.js` (lines ~2150-2152 for pills, ~2386-2391 for quick summary)

- [ ] **Step 1: Add mechanism database loading**

At the top of `generate-guide-pages.js`, after other `require()` calls, add:

```js
// Load mechanism glossary alias map (graceful fallback if missing)
let mechanismAliasMap = {};
try {
  const mechDb = require('../data/mechanisms.js');
  mechanismAliasMap = mechDb.aliasMap || {};
  console.log(`Loaded ${Object.keys(mechanismAliasMap).length} mechanism alias mappings`);
} catch(e) {
  console.warn('mechanisms.js not found — mechanism links will be disabled');
}

function getMechanismLink(mechString) {
  const id = mechanismAliasMap[mechString];
  if (!id) return null;
  return `../guides/mechanisms.html#${id}`;
}
```

- [ ] **Step 2: Wrap mechanism pills in links**

At line ~2152, change the pill rendering from:

```js
card += `
    <span class="mech-pill"><i class="fas fa-circle" style="font-size:4px; color: var(--accent-light);"></i> ${esc(m)}</span>`;
```

To:

```js
const mechLink = getMechanismLink(m);
if (mechLink) {
  card += `
    <a href="${mechLink}" class="mech-pill" style="text-decoration:none; color:inherit;"><i class="fas fa-circle" style="font-size:4px; color: var(--accent-light);"></i> ${esc(m)}</a>`;
} else {
  card += `
    <span class="mech-pill"><i class="fas fa-circle" style="font-size:4px; color: var(--accent-light);"></i> ${esc(m)}</span>`;
}
```

- [ ] **Step 3: Wrap Quick Evidence Summary mechanism text in links**

At line ~2391, change the mechanism table cell from:

```js
<td style="font-size:0.82rem; color: var(--text-muted);">${esc(topMech)}</td>
```

To:

```js
const mechSummaryLink = getMechanismLink(topMech);
const mechTd = mechSummaryLink
  ? `<td style="font-size:0.82rem; color: var(--text-muted);"><a href="${mechSummaryLink}" style="color: inherit; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 3px;">${esc(topMech)}</a></td>`
  : `<td style="font-size:0.82rem; color: var(--text-muted);">${esc(topMech)}</td>`;
html += mechTd;
```

Note: This replaces the existing `<td>` for `topMech` in the summary table row template.

- [ ] **Step 4: Add hover CSS for linked mechanism pills**

In `generateGuideCSS()`, after the existing `.mech-pill` styles, add:

```css
a.mech-pill { text-decoration: none; color: inherit; cursor: pointer; }
a.mech-pill:hover { opacity: 0.8; }
```

- [ ] **Step 5: Regenerate all guides**

```bash
cd supp-db-site && node scripts/generate-guide-pages.js
```

Expected: All 19 guides regenerated with mechanism pills wrapped in links. Verify one guide has clickable pills that navigate to `mechanisms.html#<id>`.

- [ ] **Step 6: Re-inject clerk-key meta, citation tabs JS, and citation sections**

After regeneration, the guides will need the citation tab JS and updated citation sections re-applied. Run the citation update pipeline (from C:/tmp/update_guides.js) and verify clerk-key meta tags are present (they should be since we added them to the generator template).

- [ ] **Step 7: Verify end-to-end**

1. Open a guide in the browser
2. Click a mechanism pill → should navigate to `mechanisms.html#<id>` and scroll to that entry
3. In the Quick Evidence Summary table, hover a mechanism → should show dotted underline
4. Click → should navigate to glossary
5. On the glossary page, click a supplement link → should navigate back to the supplement page

- [ ] **Step 8: Commit**

```bash
git add supp-db-site/scripts/generate-guide-pages.js supp-db-site/guides/
git commit -m "feat: link mechanism pills and summary text to glossary across all guides"
```

---

### Task 5: Add glossary to site navigation

**Files:**
- Modify: `supp-db-site/scripts/generate-guide-pages.js` (Related Guides section template)

- [ ] **Step 1: Add mechanism glossary to Related Guides**

In the Related Guides section at the bottom of each evidence guide, add a link to the mechanism glossary:

```html
<a href="../guides/mechanisms.html" style="...">
  <i class="fas fa-book-medical"></i> Mechanism Glossary
</a>
```

This goes in the template that generates the Related Guides grid at the bottom of each guide page.

- [ ] **Step 2: Commit**

```bash
git add supp-db-site/scripts/generate-guide-pages.js
git commit -m "feat: add mechanism glossary link to guide Related Guides section"
```
