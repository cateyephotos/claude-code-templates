# Mechanism Glossary — Design Spec

> **For agentic workers:** Use superpowers:writing-plans to create the implementation plan from this spec.

**Goal:** Create an accessible, navigable glossary of biological mechanisms referenced across SupplementDB evidence guides, with bidirectional linking between guide mechanism references and glossary entries.

**Architecture:** A JSON data file (`data/mechanisms.js`) serves as the single source of truth for ~170 canonical mechanism definitions with alias mappings. A static HTML glossary page (`guides/mechanisms.html`) is rendered from this data. The guide generator (`generate-guide-pages.js`) uses the alias map to wrap mechanism references in links.

**Tech Stack:** Static HTML/CSS/JS (same dark journal theme as evidence guides), Node.js build scripts, JSON data file.

---

## 1. Data Architecture

### `data/mechanisms.js`

Single source of truth. Structure:

```js
const mechanismDatabase = {
  version: "1.0",
  lastUpdated: "2026-03-19",
  categories: [
    "Neurotransmitter Systems",
    "Antioxidant & Cellular Protection",
    "Anti-inflammatory Pathways",
    "Hormonal & Endocrine",
    "Metabolic & Energy",
    "Cardiovascular & Circulatory",
    "Immune Modulation",
    "Structural & Repair",
    "Gut-Brain Axis"
  ],
  mechanisms: [
    {
      id: "acetylcholinesterase-inhibition",        // URL-safe slug, used as anchor
      canonicalName: "Acetylcholinesterase Inhibition",
      aliases: ["AChE inhibition"],                  // other strings that map here
      category: "Neurotransmitter Systems",
      summary: "2-3 sentences, college-level language",
      relevance: "1 sentence: why this matters for supplements",
      relatedMechanisms: ["acetylcholine-synthesis-enhancement"],
      supplements: ["Bacopa monnieri", "Huperzine A"]  // which supplements use this
    }
  ],
  aliasMap: {
    // Every raw mechanism string from supplements.js → canonical id
    // Auto-generated from mechanisms[].aliases + canonicalName
    "Acetylcholinesterase inhibition": "acetylcholinesterase-inhibition",
    "AChE inhibition": "acetylcholinesterase-inhibition"
  }
};
```

### Consolidation rules

The ~330 raw mechanism strings from `supplements.js` consolidate into ~170 canonical entries by:
- Merging synonyms (e.g., "Acetylcholine synthesis enhancement" / "support" / "increase" / "precursor")
- Preserving all original strings as aliases so the mapping is exhaustive
- Categorizing each into one of the 9 biological system categories

### Build pipeline for data file

1. Extract all unique `mechanismsOfAction` from `supplements.js`
2. Cluster near-duplicates by shared keywords
3. AI-generate `summary` + `relevance` for each canonical entry
4. Human review/edit of the JSON before rendering
5. Auto-generate `aliasMap` from `canonicalName` + `aliases` arrays
6. Auto-populate `supplements` array by reverse-lookup from `supplements.js`

---

## 2. Glossary Page

### `guides/mechanisms.html`

Static HTML page using the same dark journal theme (`generateGuideCSS()` pattern).

**Hero section:**
- Title: "Mechanism Glossary"
- Subtitle: "Plain-language explanations of 170+ biological mechanisms referenced across our evidence guides"
- No content gate — freely accessible (aids SEO and serves as a public educational resource)

**Search bar:**
- Client-side JS text filter
- Filters mechanism entries by name/alias as user types
- Positioned below hero, above category nav

**Category navigation:**
- Horizontal pill buttons for each of the 9 categories
- Clicking scrolls to that category section
- Styled same as citation tabs (`.cite-tab` pattern reused)

**Mechanism entries (grouped by category, alphabetical within):**

```html
<div class="mech-entry" id="acetylcholinesterase-inhibition">
  <h3>Acetylcholinesterase Inhibition</h3>
  <p class="mech-aliases">Also: AChE inhibition</p>
  <p class="mech-summary">Blocks the enzyme that breaks down acetylcholine...</p>
  <p class="mech-relevance"><strong>Why it matters:</strong> Supplements targeting this mechanism may support memory formation...</p>
  <div class="mech-supplements">Used by: <a href="...">Bacopa monnieri</a>, <a href="...">Huperzine A</a></div>
</div>
```

**Footer:** Same as other guides — links to database, methodology, disclaimer.

### Page includes

- `<meta name="clerk-key">` and `<meta name="convex-url">` (for consistent auth state in nav)
- Tab/search JS inline
- Same Font Awesome, Google Fonts, dark theme CSS as guides

---

## 3. Guide Integration

### Quick Evidence Summary section

Key mechanism text currently renders as plain text. After:

```html
<!-- Before -->
<span>Acetylcholinesterase inhibition</span>

<!-- After -->
<a href="../guides/mechanisms.html#acetylcholinesterase-inhibition"
   style="color: inherit; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 3px;">
  Acetylcholinesterase inhibition
</a>
```

Dotted underline signals "this is a link to more info" without disrupting the visual flow.

### Mechanism pills

Currently `<span class="mech-pill">`. After:

```html
<a href="../guides/mechanisms.html#acetylcholinesterase-inhibition" class="mech-pill" style="text-decoration:none; color:inherit;">
  <i class="fas fa-circle" ...></i> Acetylcholinesterase inhibition
</a>
```

No visual change to the pill. Hover adds subtle opacity shift via CSS. Cursor becomes pointer.

### Generator changes (`generate-guide-pages.js`)

1. Load `data/mechanisms.js` at the top
2. Create a lookup function: `getMechanismLink(mechanismString)` → returns the anchor URL or null
3. In the Quick Evidence Summary template, wrap key mechanism text with `<a>` if a mapping exists
4. In the mechanism pill template, wrap `<span>` with `<a>` if a mapping exists
5. Graceful fallback: if no mapping exists, render as current (no link, no broken behavior)

### CSS additions to `generateGuideCSS()`

```css
a.mech-pill {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}
a.mech-pill:hover {
  opacity: 0.8;
}
```

---

## 4. Build Scripts

### `scripts/build-mechanism-glossary.js`

1. Reads `data/mechanisms.js`
2. Renders `guides/mechanisms.html` as a self-contained static page
3. Uses the same theme/styling patterns as `generate-guide-pages.js`
4. Includes search JS and category nav inline

### `scripts/canvas-mechanisms.js` (one-time use)

1. Extracts all `mechanismsOfAction` from `supplements.js`
2. Clusters near-duplicates
3. AI-generates descriptions via Claude API
4. Outputs draft `data/mechanisms.js`
5. Run once, then review/edit the output manually

---

## 5. Constraints

- No new npm dependencies
- No backend — everything is static HTML
- Glossary page must work offline (self-contained)
- Must not break existing guide rendering if `mechanisms.js` is missing (graceful fallback)
- Mechanism descriptions must be accessible to someone with a college degree — no jargon without explanation
- All existing guide CSS/JS patterns reused, no new design system
