# Guide Page Redesign Plan: Clinical Journal Dark Theme Migration

## Executive Summary

Migrate all 19 generated guide pages from the current light clinical theme to match the hand-crafted `sleep.html` dark journal aesthetic. Each guide gets a unique domain-specific color palette and hero icon while sharing the same structural wireframe.

---

## 1. Wireframe Comparison: Current vs Target

### CURRENT Generated Guide Structure (Light Theme)
```
+------------------------------------------------------------------+
| LEGAL-NAV (dark bar, pills icon, "Sleep Guide" link, "Database") |
+------------------------------------------------------------------+
| CONTENT-HERO (light cream/white background)                      |
|   Breadcrumb: Home > Evidence Guides > {Domain}                  |
|   H1: {Title}  (Source Serif 4 font)                             |
|   Subtitle text                                                  |
|   [Flask icon] 24 Supplements  [Doc] 471+ Citations  [Cal] Date |
|   [Tier 1: 4]  [Tier 2: 8]  [Tier 3: 12]                       |
+------------------------------------------------------------------+
| SHARE BAR (light theme)                                          |
| TRUST BAR (light theme)                                          |
+------------------------------------------------------------------+
| MAIN CONTENT (white bg)          | SIDEBAR TOC (right, sticky)   |
|                                  |   Contents                    |
| [!] Medical Disclaimer           |   - Introduction              |
|                                  |   - Top Supplements           |
| Featured Snippet (definition)    |   - Evidence Comparison       |
|                                  |   - Mechanisms                |
| ## Introduction                  |   - Dosage Guidelines         |
|   Paragraph text...              |   - Safety                    |
|                                  |   - Research Gaps             |
| ## Top Supplements               |   - References                |
|   Ordered list with tier badges  |                               |
|                                  |                               |
|   +-------------+  +----------+ |                               |
|   | CARD         |  | CARD     | |                               |
|   | Name + Tier  |  | Name     | |                               |
|   | Benefits ul  |  | Benefits | |                               |
|   | Effect sizes |  | Effects  | |                               |
|   | Mechanisms   |  | Mechs    | |                               |
|   | Dosage       |  | Dosage   | |                               |
|   +-------------+  +----------+ |                               |
|                                  |                               |
| ## Evidence Comparison           |                               |
|   Standard HTML table            |                               |
|                                  |                               |
| ## Mechanisms of Action          |                               |
|   H3 + paragraph per mechanism   |                               |
|                                  |                               |
| ## Dosage Guidelines             |                               |
|   Standard HTML table            |                               |
|                                  |                               |
| ## Safety & Interactions         |                               |
|   Bullet list + table            |                               |
|                                  |                               |
| ## Research Gaps                 |                               |
|   Bullet list                    |                               |
|                                  |                               |
| ## Additional Supplements        |                               |
|   Table of lower-tier supps      |                               |
|                                  |                               |
| ## References                    |                               |
|   Ordered citation list          |                               |
|                                  |                               |
| [Newsletter CTA]                 |                               |
| [Related Content Grid]           |                               |
+----------------------------------+-------------------------------+
| FOOTER                                                           |
+------------------------------------------------------------------+
```

### TARGET Structure (Dark Journal Theme — matches sleep.html)
```
+------------------------------------------------------------------+
| GUIDE-NAV (glassmorphic sticky, backdrop-blur, section anchors)  |
|   [< Back]    [pills SupplementDB]    [Summary|T1|T2|T3|Safety] |
+------------------------------------------------------------------+
| HERO-SECTION (dark gradient bg + noise texture + radial glows)   |
|                                                                  |
|               [Domain SVG Icon with glow]                        |
|                                                                  |
|        [ clock ] Last reviewed: March 2026                       |
|                                                                  |
|         Evidence-Based Supplements                               |
|              for {Domain}                                        |
|      (DM Serif Display, centered, large)                         |
|                                                                  |
|    A systematic review of N supplements across                   |
|    M research citations, ranked by evidence.                     |
|                                                                  |
|  [i] This guide summarizes research. Not medical advice.         |
|                                                                  |
+------------------------------------------------------------------+
| SHARE BAR (dark-theme glass: rgba bg, white/muted text)          |
| TRUST BAR (dark-theme: N+ Citations | FDA | No Funding | Method) |
+------------------------------------------------------------------+
|                                                                  |
| MAIN CONTENT (dark bg, full-width sections, max-w-5xl)          |
|                                                                  |
| ── Evidence Summary ──────────────────────────────── (reveal)    |
|   +----------------------------------------------------------+  |
|   | EVIDENCE CARD (glassmorphic, backdrop-blur)               |  |
|   |   SUMMARY TABLE (dark themed)                            |  |
|   |   Supplement | Tier | Key Mechanism | Finding | Dosage   |  |
|   |   ─────────────────────────────────────────────────────   |  |
|   |   Melatonin  |[T1]| MT1/MT2...    | -23.5min (PMID)  |  |  |
|   |   Magnesium  |[T1]| GABA mod...   | -17.36min(PMID)  |  |  |
|   |   L-Theanine |[T2]| Alpha wave... | 897 pts  (PMID)  |  |  |
|   +----------------------------------------------------------+  |
|                                                                  |
| ── [T1 Badge] Strong Evidence ────────── (tier-divider, reveal)  |
|   Description paragraph                                         |
|                                                                  |
|   +----------------------------------------------------------+  |
|   | EVIDENCE CARD (glassmorphic)                              |  |
|   |  H3: Supplement Name  [Tier Badge]                       |  |
|   |  Scientific name (italic)           DOSAGE: 0.5-3mg     |  |
|   |                                                          |  |
|   |  [mech-pill] [mech-pill] [mech-pill]                     |  |
|   |                                                          |  |
|   |  ┃ FINDING HIGHLIGHT                                     |  |
|   |  ┃ Sleep Onset                                           |  |
|   |  ┃ Reduces latency by 23.5 minutes...                    |  |
|   |  ┃ Author et al. Journal, Year. PMID: XXXXX             |  |
|   |                                                          |  |
|   |  ┃ FINDING HIGHLIGHT                                     |  |
|   |  ┃ Sleep Quality                                         |  |
|   |  ┃ PSQI improvement WMD -1.24...                         |  |
|   |  ┃ Author et al. Journal, Year. PMID: XXXXX             |  |
|   |                                                          |  |
|   |  [check] Safety: Very Low Risk                           |  |
|   |  Adverse events 12.2% vs 10.8% placebo...               |  |
|   +----------------------------------------------------------+  |
|                                                                  |
| ── [T2 Badge] Moderate Evidence ──────── (tier-divider, reveal)  |
|   (Same card pattern for each supplement)                        |
|                                                                  |
| ── [T3 Badge] Preliminary Evidence ───── (tier-divider, reveal)  |
|   (Same card pattern for each supplement)                        |
|                                                                  |
| ── Understanding Evidence Tiers ─────────────────────────────    |
|   3-column grid: Tier 1 | Tier 2 | Tier 3 definitions           |
|                                                                  |
| ── Safety Considerations ────────────────────────────────────    |
|   Warning callout                                                |
|   Interaction table (dark themed)                                |
|   Pregnancy/Nursing + Quality Assurance cards                    |
|                                                                  |
| ── Newsletter CTA (gradient bg with radial glows) ───────────    |
|   H2 + form + privacy                                           |
|                                                                  |
| ── Citation Index ───────────────────────────────────────────    |
|   Numbered citations with PMID/DOI links                         |
|                                                                  |
| ── Related Guides ───────────────────────────────────────────    |
|   Icon link grid                                                 |
|                                                                  |
+------------------------------------------------------------------+
| CONTENT GATE OVERLAY (gradient fade + CTA for free users)        |
+------------------------------------------------------------------+
| FOOTER                                                           |
+------------------------------------------------------------------+
```

---

## 2. Key Structural Differences

| Feature | Current (Generated) | Target (sleep.html) |
|---------|-------------------|-------------------|
| **Theme** | Light (white/cream bg) | Dark (navy #0d1117) |
| **Heading Font** | Source Serif 4 | DM Serif Display |
| **Body Font** | DM Sans | DM Sans (same) |
| **Nav** | `legal-nav` (basic dark bar) | `guide-nav` (glassmorphic, section anchors, mobile menu) |
| **Hero** | Breadcrumb + H1 + stats pills | Centered, domain icon, gradient bg + noise, review badge |
| **Hero Icon** | None | Domain-specific SVG with glow effect |
| **Layout** | 2-col grid (content + sidebar TOC) | Full-width sections, NO sidebar TOC |
| **Section Nav** | Sidebar TOC (right) | Sticky top nav with section anchors |
| **Cards** | `supplement-card` (light, 2-col grid) | `evidence-card` (glassmorphic, full-width, stacked) |
| **Card Content** | Benefits list + effect box + mechanisms text + dosage | Mechanism pills + finding highlights with PMIDs + safety box |
| **Tables** | `content-table` (light theme) | `summary-table` / `interaction-table` (dark, rounded corners) |
| **Tier Organization** | Flat list, all cards in one grid | Grouped by tier with tier-divider headers |
| **Citations** | Inline DOI links | PMID links to PubMed, numbered citation index |
| **Animations** | None | `.reveal` scroll animations (translateY + opacity) |
| **Share/Trust Bars** | Light theme defaults | `dark-theme` class overrides |
| **CSS Architecture** | External `content-shared.css` | Inline `<style>` block (~350 lines) |

---

## 3. Domain Color Theme System

Each of the 19 guides gets a unique color palette. The theme variables follow sleep.html's pattern but swap the accent hue.

| Guide | Primary Accent | Glow Color | Hero Icon |
|-------|---------------|-----------|----------|
| `sleep` | Indigo #4f46e5 | Blue #93c5fd | Moon + Stars |
| `anxiety-stress` | Violet #7c3aed | Lavender #c4b5fd | Calm Wave |
| `cognitive-performance` | Cyan #0891b2 | Teal #67e8f9 | Brain/Neuron |
| `cardiovascular` | Rose #e11d48 | Pink #fda4af | Heart Pulse |
| `immune-function` | Emerald #059669 | Mint #6ee7b7 | Shield |
| `joint-health` | Amber #d97706 | Gold #fcd34d | Joint/Bone |
| `metabolic-health` | Orange #ea580c | Peach #fdba74 | Flame/Metabolism |
| `mood-support` | Sky #0284c7 | Light Blue #7dd3fc | Sun |
| `energy-vitality` | Yellow #ca8a04 | Warm Yellow #fde047 | Lightning Bolt |
| `longevity` | Teal #0d9488 | Aqua #5eead4 | Hourglass |
| `gut-brain` | Lime #65a30d | Spring Green #bef264 | Gut-Brain Axis |
| `memory-aging` | Slate #475569 | Cool Gray #cbd5e1 | Memory Chip |
| `brain-fog` | Fuchsia #c026d3 | Orchid #f0abfc | Cloud Clearing |
| `nootropic-stacks` | Blue #2563eb | Royal Blue #93c5fd | Stack/Layers |
| `stress-resilience` | Stone #78716c | Warm Gray #d6d3d1 | Mountain |
| `muscle-strength` | Red #dc2626 | Coral #fca5a5 | Dumbbell |
| `recovery` | Green #16a34a | Fresh Green #86efac | Recovery Arrows |
| `mens-health` | Steel #2563eb | Ice Blue #bfdbfe | Mars Symbol |
| `womens-health` | Magenta #db2777 | Rose #f9a8d4 | Venus Symbol |
| `safety-interactions` | Warning Amber #f59e0b | Amber #fde68a | Warning Triangle |

### CSS Variable Pattern (per domain)
```css
:root {
    --navy-deep: #0d1117;      /* shared */
    --navy: #161b22;            /* shared */
    --navy-light: #1c2333;      /* shared */
    --accent: {domain-primary};          /* domain-specific */
    --accent-light: {domain-lighter};    /* domain-specific */
    --accent-glow: rgba({r},{g},{b}, 0.15);  /* domain-specific */
    --accent-soft: {domain-glow};        /* domain-specific */
    --accent-muted: {domain-muted};      /* domain-specific */
    --slate: #8b949e;           /* shared */
    --text-primary: #c9d1d9;    /* shared */
    --text-bright: #f0f6fc;     /* shared */
    --text-muted: #8b949e;      /* shared */
    --border: rgba({r},{g},{b}, 0.12);   /* domain-specific */
    --card-bg: rgba(22, 27, 34, 0.7);   /* shared */
    --tier1-from: #4ade80;      /* shared */
    --tier1-to: #22c55e;        /* shared */
    --tier2-from: #fbbf24;      /* shared */
    --tier2-to: #f59e0b;        /* shared */
    --tier3-from: #fb7185;      /* shared */
    --tier3-to: #e11d48;        /* shared */
}
```

---

## 4. Component Inventory (What Gets Templated)

### Components from sleep.html to replicate:

1. **`guide-nav`** — Glassmorphic sticky nav with backdrop-blur, section anchors (Summary, Tier 1/2/3, Safety, Citations), mobile hamburger menu with dropdown
2. **`hero-section`** — Dark gradient background with noise texture SVG overlay, domain-specific icon with glow, "Last reviewed" badge, centered DM Serif Display heading, subtitle, disclaimer
3. **Share bar + Trust bar** — With `dark-theme` class and inline style overrides for dark background
4. **`evidence-card`** — Glassmorphic card (backdrop-filter blur, semi-transparent bg, accent border on hover)
5. **`summary-table`** — Dark-themed table inside evidence-card, with tier badge + PMID link columns
6. **`tier-divider`** — Section header with tier badge + gradient line divider
7. **`mech-pill`** — Rounded pill tags for mechanisms with icon + label
8. **`finding-highlight`** — Left-bordered highlight box with category label, finding text, and citation with PMID link
9. **Safety box** — Green/amber/red tinted box with safety rating + description + citation
10. **`interaction-table`** — Dark-themed table with risk-level color coding
11. **Evidence tier cards** — 3-column explanation of Tier 1/2/3 criteria
12. **`capture-section`** — Newsletter CTA with gradient background and radial glows
13. **Citation index** — Numbered citation entries with cite-num badges and PMID/DOI links
14. **Related guides** — Icon link grid
15. **`.reveal` animations** — Scroll-triggered fade-up animation with IntersectionObserver
16. **Print styles** — Hide nav/capture, white bg, solid borders
17. **Focus styles** — Accent-colored outline for accessibility

---

## 5. Data Mapping Strategy

The generated guides currently pull data from `supplements.js` via filter functions. The redesigned template needs to map this data to sleep.html's richer component structure:

### Supplement Card Data Mapping:
```
CURRENT:                          TARGET:
─────────────────────            ─────────────────────
s.name                    →      H3 heading
s.evidenceTier            →      Tier badge (gradient)
s.scientificName          →      Italic subtitle
s.dosageRange             →      DOSAGE section (top-right)
getDomainBenefits()       →      (removed — replaced by finding-highlights)
getMechanismsList()       →      mech-pill tags
getAnxietyEffects()       →      finding-highlight boxes (repurpose effect data)
s.safetyProfile.rating    →      Safety box (color-coded)
s.keyCitations[]          →      PMID links in finding-highlights
```

### Finding Highlights (NEW):
Currently the generator shows a plain "effect sizes" box. The redesign converts each effect size entry into a `finding-highlight` component:

```javascript
// From effectSizes object:
{ anxiety: { description: "SMD = -6.87 across 22 RCTs", ... } }

// Becomes:
<div class="finding-highlight">
    <div class="text-xs font-semibold uppercase">Anxiety</div>
    <p>SMD = -6.87 across 22 RCTs</p>
    <p class="citation">Author et al. Journal. <a class="pmid-link">PMID: XXX</a></p>
</div>
```

### Tier Grouping (NEW):
Currently all supplement cards are in one flat grid. The redesign groups them by evidence tier with `tier-divider` headers:

```
Tier 1 — Strong Evidence
  [Supplement A card]
  [Supplement B card]

Tier 2 — Moderate Evidence
  [Supplement C card]
  [Supplement D card]
  ...

Tier 3 — Preliminary Evidence
  [Supplement E card]
  ...
```

---

## 6. CSS Architecture Decision

### Approach: Generate inline `<style>` blocks per page

**Rationale:** Sleep.html uses ~350 lines of inline CSS. This is the cleanest approach because:
1. Each guide has domain-specific CSS variables (colors)
2. The dark theme components (evidence-card, summary-table, etc.) are specific to guide pages
3. No risk of CSS conflicts with existing `content-shared.css`
4. Generated pages are self-contained (no external CSS dependency issues)

**Implementation:** The generator will have a `generateGuideCSS(theme)` function that outputs the full `<style>` block with domain-specific variables injected.

The existing `content-shared.css` and `legal-shared.css` imports will be **removed** from generated guides. All styling is self-contained in the inline block + Tailwind utilities.

---

## 7. Font Unification

| Current | Target |
|---------|--------|
| `Source Serif 4` (headings) | `DM Serif Display` (headings) |
| `DM Sans` (body) | `DM Sans` (body) — no change |

Google Fonts URL change:
```html
<!-- BEFORE -->
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- AFTER -->
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet">
```

---

## 8. Implementation Plan

### Phase 1: CSS Template Engine (~200 lines)
- Create `generateGuideCSS(theme)` function
- Define 19 domain theme objects with colors
- Output complete inline `<style>` block

### Phase 2: Domain Icons (~100 lines)
- Create 19 inline SVG hero icons
- Each icon uses `${theme.accentSoft}` for fill colors
- Wrapped in `.moon-glow` equivalent class (renamed to `.domain-icon-glow`)

### Phase 3: HTML Template Rewrite (~800 lines)
- Replace `legal-nav` with `guide-nav` (glassmorphic + section anchors + mobile menu)
- Replace `content-hero` with `hero-section` (gradient bg + noise + icon + badge)
- Add `dark-theme` to share bar and trust bar
- Remove sidebar TOC layout, use full-width sections
- Group supplement cards by tier with `tier-divider` headers
- Replace `supplement-card` grid with stacked `evidence-card` components
- Convert effect sizes to `finding-highlight` boxes
- Convert mechanisms to `mech-pill` tags
- Add per-card safety boxes with color coding
- Replace `content-table` with `summary-table` / `interaction-table`
- Add evidence tier explanation section
- Redesign newsletter CTA with `capture-section` gradient
- Add numbered citation index with `cite-num` badges
- Add `.reveal` class to sections + scroll observer script
- Add mobile nav toggle script
- Remove `content-shared.css` and `legal-shared.css` imports

### Phase 4: Tests Update (~50 lines)
- Update existing guide tests for new selectors (.guide-nav, .hero-section, .evidence-card)
- Add dark theme verification tests
- Verify scroll animations don't cause JS errors

### Phase 5: Regenerate + Verify
- Run `node scripts/generate-guide-pages.js`
- Visual verification of all 19 guides in browser
- Run full test suite

---

## 9. File Changes Summary

| File | Action | Est. Lines Changed |
|------|--------|--------------------|
| `scripts/generate-guide-pages.js` | MAJOR REWRITE (template section) | ~1200 lines (lines 1782-2317 replaced + new functions) |
| `tests/guide-pages.spec.js` | MODIFY selectors | ~50 lines |
| Generated `guides/*.html` (19 files) | REGENERATED | All 19 files |

**Files NOT changed:**
- `guides/sleep.html` — remains as-is (the reference)
- `css/content-shared.css` — remains for other page types
- `data/supplements.js` — no data changes needed
- Guide definitions (lines 21-1780) — content stays, only template changes

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Content gate CSS conflicts with dark theme | Gate overlay might not render correctly | Test content gate on dark bg, adjust `content-gate.css` if needed |
| Auth buttons styling on dark nav | Sign In/Start Free buttons might be invisible | Use explicit light text colors in auth-ui override |
| Generated finding-highlights less rich than hand-coded sleep.html | Sleep has curated PMID-linked findings; others have generic effect descriptions | Accept that generated pages will use `effectSizes` data — still formatted as finding-highlights but with whatever text is available |
| 19 different SVG icons | Design time | Use simple, recognizable geometric icons (not complex illustrations) |
| Print stylesheet | Dark bg prints poorly | Include print media query forcing white bg (already in sleep.html pattern) |
| Inline CSS bloat | Each page ~350 lines of CSS | Acceptable — pages are already 50-100KB; CSS adds ~8KB gzipped |

---

## 11. Visual Preview: Anxiety & Stress Guide (Mockup)

After redesign, the Anxiety & Stress guide hero would look like:

```
+------------------------------------------------------------------+
| [< Back]    [pills SupplementDB]    [Summary|T1|T2|T3|Safety]    |
+------------------------------------------------------------------+
|                                                                   |
|   (dark navy bg with violet radial gradient glows + noise)        |
|                                                                   |
|                    ~~ Calm Wave SVG ~~                             |
|                  (violet glow filter)                              |
|                                                                   |
|            [ clock ] Last reviewed: March 2026                    |
|                                                                   |
|            Evidence-Based Supplements                             |
|               for Anxiety & Stress                                |
|          (DM Serif Display, large, centered)                      |
|                                                                   |
|       A systematic review of 24 supplements across                |
|       471+ research citations, ranked by evidence.                |
|                                                                   |
|   [i] This guide summarizes research. Not medical advice.         |
|                                                                   |
+------------------------------------------------------------------+
|  Share: [Twitter] [LinkedIn] [Facebook] [Copy]  (dark glass)      |
+------------------------------------------------------------------+
|  [check] 471+ Citations | [shield] FDA | [ban] No Funding | ...  |
+------------------------------------------------------------------+
|                                                                   |
| ── Evidence Summary ─────────────────────────────────────────     |
|  +-------------------------------------------------------------+ |
|  | Supplement  | Tier   | Key Mechanism      | Finding    |Dose| |
|  |-------------|--------|-------------------|------------|----| |
|  | Ashwagandha | [T1]   | HPA axis mod.     | SMD=-6.87  |300 | |
|  | Magnesium   | [T1]   | GABA modulation   | Sleep+mood |200 | |
|  | L-Theanine  | [T1]   | Alpha waves       | Stress-13% |200 | |
|  +-------------------------------------------------------------+ |
|                                                                   |
| ── [T1 STRONG] Strong Evidence ──────────────────────────────     |
|                                                                   |
|  +-------------------------------------------------------------+ |
|  | Ashwagandha                        [Tier 1]                  | |
|  | Withania somnifera              DOSAGE: 300-600mg            | |
|  |                                                             | |
|  | [HPA axis] [Cortisol reduction] [GABAergic]                 | |
|  |                                                             | |
|  | ┃ ANXIETY REDUCTION                                         | |
|  | ┃ SMD = -6.87 across 22 RCTs with 1,582 participants       | |
|  | ┃ Author et al. Journal, 2024. PMID: XXXXX                 | |
|  |                                                             | |
|  | ┃ CORTISOL                                                  | |
|  | ┃ MD = -2.58 (95% CI -4.99 to -0.16) across 8 RCTs        | |
|  | ┃ Author et al. Explore, 2024. PMID: 39348746              | |
|  |                                                             | |
|  | [check] Safety: Low Risk                                    | |
|  | Well-tolerated. Monitor thyroid function...                  | |
|  +-------------------------------------------------------------+ |
|                                                                   |
```

---

## 12. What Stays the Same

These elements from the current generator are PRESERVED in the redesign:
- All 19 guide definition objects (slugs, titles, filter functions, introductions, mechanisms, safety notes, research gaps, related links)
- The data pipeline (loadSupplementData, filter, sort by tier)
- Core/supporting supplement split logic
- JSON-LD structured data
- Newsletter form integration pattern
- Auth script loading (Clerk + Convex)
- Content gate script loading
- PostHog analytics
- SEO meta tags and Open Graph
- Sitemap entries

---

## 13. Success Criteria

1. All 19 generated guides visually match sleep.html's aesthetic quality
2. Each guide has a unique domain-specific color palette and hero icon
3. All existing information is preserved (no data loss)
4. Content gate still works on dark theme
5. All existing Playwright tests pass (with updated selectors)
6. Print stylesheet produces readable output
7. Mobile responsive (hamburger nav, stacked cards)
8. Accessibility: focus styles, semantic HTML, screen reader friendly
9. Zero console errors across all 19 guides
10. DM Serif Display renders correctly on all guides
