# SupplementDB Content Strategy

> Internal strategy document — not rendered on site
> Last Updated: March 9, 2026

---

## 1. Content Pillars

SupplementDB's content architecture rests on five pillars, each serving a distinct role in establishing topical authority and serving user intent across the research funnel.

### Pillar 1: Health Domain Guides (Awareness + Consideration)
**Purpose:** Comprehensive, evidence-based guides organized by health concern. These are the primary landing pages for "best supplements for X" queries and serve as the top-of-funnel entry points.

**Current pages:**
- Sleep Quality Guide (`/guides/sleep.html`) — LIVE
- Anxiety & Stress Relief Guide (`/guides/anxiety-stress.html`) — Phase 2
- Cognitive Performance Guide (`/guides/cognitive-performance.html`) — Phase 2
- Cardiovascular Health Guide (`/guides/cardiovascular.html`) — Phase 2

**Future guides (Phase 3+):**
- Immune Function Guide
- Joint Health & Mobility Guide
- Metabolic Health & Weight Management Guide
- Energy & Vitality Guide
- Longevity & Aging Guide
- Athletic Performance Guide

**Internal linking role:** Each guide links down to individual supplement entries and across to relevant category pages and comparison articles.

### Pillar 2: Category Pillar Pages (Awareness)
**Purpose:** Comprehensive overviews of supplement categories, serving "what are nootropics" and "types of adaptogens" queries. These establish taxonomic authority.

**Phase 2 pages (6):**
- Herbal Extracts (`/categories/herbal-extracts.html`) — 22 supplements
- Essential Nutrients (`/categories/essential-nutrients.html`) — 18 supplements
- Antioxidants (`/categories/antioxidants.html`) — 11 supplements
- Nootropics (`/categories/nootropics.html`) — 10 supplements
- Amino Acids (`/categories/amino-acids.html`) — 7 supplements
- Performance Enhancers (`/categories/performance-enhancers.html`) — 8 supplements

**Future categories (Phase 3+):**
- Adaptogens (5 supplements)
- Sleep Support (1+ supplements)
- Anti-inflammatory (2 supplements)
- Metabolic Support (2 supplements)
- Joint Support (3 supplements)
- Polyphenols (2 supplements)
- Specialized Compounds (4 supplements)

**Internal linking role:** Category pages link down to supplement entries, across to health domain guides, and to comparison articles featuring supplements in that category.

### Pillar 3: Comparison Articles (Consideration + Decision)
**Purpose:** Head-to-head, evidence-based comparisons between commonly compared supplements. These target high-intent "X vs Y" search queries and aid decision-making.

**Phase 2 pages (4):**
- Ashwagandha vs Rhodiola Rosea (`/compare/ashwagandha-vs-rhodiola.html`)
- Magnesium vs Melatonin (`/compare/magnesium-vs-melatonin.html`)
- Omega-3 vs CoQ10 (`/compare/omega-3-vs-coq10.html`)
- Bacopa vs Ginkgo Biloba (`/compare/bacopa-vs-ginkgo.html`)

**Future comparisons (Phase 3+):**
- Lion's Mane vs Bacopa
- Creatine vs Beta-Alanine
- Vitamin D vs Magnesium
- Turmeric vs Boswellia
- L-Theanine vs 5-HTP
- CoQ10 vs PQQ

**Internal linking role:** Each comparison links to both supplement entries, relevant category pages, and health domain guides.

### Pillar 4: Supplement Monographs (Decision — Future)
**Purpose:** Deep-dive, single-supplement reference pages with full evidence profiles, citation tables, mechanism diagrams, and dosage calculators. These are the core "money pages" for decision-stage queries.

**Status:** Planned for Phase 3. Each of the 93 supplements will get a dedicated monograph page auto-generated from the database.

### Pillar 5: Research Updates (Retention)
**Purpose:** Timely coverage of new published studies, meta-analyses, and regulatory developments. These drive repeat visits and establish SupplementDB as a current authority.

**Status:** Template defined in style guide. Publishing cadence TBD (recommend bi-weekly initially).

---

## 2. Content Cluster Architecture

Each health domain forms a content cluster with the guide as the hub:

```
[Health Domain Guide] (hub)
    ├── [Category Page A] — supplements in this domain
    ├── [Category Page B] — overlapping category
    ├── [Comparison: Supp X vs Y] — key decision point
    ├── [Comparison: Supp Z vs W] — secondary comparison
    ├── [Supplement Entry: X] — via main database
    ├── [Supplement Entry: Y] — via main database
    └── [Research Update] — latest study (future)
```

### Anxiety & Stress Cluster
- **Hub:** `/guides/anxiety-stress.html`
- **Categories:** Adaptogens, Herbal Extracts, Amino Acids
- **Comparisons:** Ashwagandha vs Rhodiola, L-Theanine vs 5-HTP (future)
- **Key supplements:** Ashwagandha, L-Theanine, Magnesium, Rhodiola, Passionflower, 5-HTP, Holy Basil, Kanna

### Cognitive Performance Cluster
- **Hub:** `/guides/cognitive-performance.html`
- **Categories:** Nootropics, Amino Acids, Essential Nutrients
- **Comparisons:** Bacopa vs Ginkgo, Lion's Mane vs Bacopa (future)
- **Key supplements:** Bacopa, Lion's Mane, Alpha-GPC, Ginkgo, Citicoline, Phosphatidylserine, Creatine, Huperzine A

### Cardiovascular Health Cluster
- **Hub:** `/guides/cardiovascular.html`
- **Categories:** Essential Nutrients, Antioxidants, Herbal Extracts
- **Comparisons:** Omega-3 vs CoQ10, Berberine vs Red Yeast Rice (future)
- **Key supplements:** Omega-3, CoQ10, Magnesium, Berberine, Garlic, Red Yeast Rice, Hawthorn Berry, Grape Seed Extract

### Sleep Quality Cluster (existing)
- **Hub:** `/guides/sleep.html` (LIVE)
- **Categories:** Sleep Support, Amino Acids, Herbal Extracts
- **Comparisons:** Magnesium vs Melatonin
- **Key supplements:** Melatonin, Magnesium, L-Theanine, Valerian Root (future), Passionflower

---

## 3. Internal Linking Strategy

### Link Hierarchy
1. **Index → Guides** — Primary navigation, Evidence Guides section
2. **Index → Categories** — Footer and/or nav dropdown
3. **Guides → Supplements** — Inline mentions and tables link to main database entries
4. **Guides → Comparisons** — "Compare" CTAs for key supplement pairs
5. **Guides → Categories** — "Browse all [category] supplements" links
6. **Categories → Guides** — "Learn more about [health domain]" links
7. **Categories → Comparisons** — Popular comparisons within category
8. **Comparisons → Guides** — "Which is better for [use case]?" links back
9. **Comparisons → Categories** — Category context links

### Link Density Targets
- Each guide should contain 15–25 internal links
- Each category page should contain 10–20 internal links
- Each comparison should contain 8–15 internal links
- Anchor text should use descriptive phrases (not "click here")

### Breadcrumb Pattern
All content pages use breadcrumbs:
```
Home > [Section] > [Page Title]
```
Examples:
- Home > Evidence Guides > Anxiety & Stress Relief
- Home > Categories > Nootropics
- Home > Compare > Ashwagandha vs Rhodiola

---

## 4. 90-Day Publishing Calendar

### Month 1 (Phase 2 Launch)
- **Week 1:** content-shared.css, strategy docs, category page generator
- **Week 2:** 6 category pillar pages (auto-generated)
- **Week 3:** 3 health domain guides (anxiety, cognitive, cardiovascular)
- **Week 4:** 4 comparison articles, sitemap/nav updates, QA verification

### Month 2 (Phase 2 Expansion)
- **Week 5–6:** 4 additional comparison articles (Lion's Mane vs Bacopa, Creatine vs Beta-Alanine, Vitamin D vs Magnesium, Turmeric vs Boswellia)
- **Week 7–8:** 2 additional health domain guides (Immune Function, Joint Health)
- **Ongoing:** Remaining category pages for smaller categories

### Month 3 (Transition to Phase 3)
- **Week 9–10:** Individual supplement monograph template and generator
- **Week 11–12:** First batch of 20 monographs (Tier 1 and high-traffic Tier 2 supplements)
- **Ongoing:** Research update pipeline setup, newsletter strategy

---

## 5. Content Quality Standards

All content pages must meet these criteria before publishing:

### SEO Requirements
- [ ] Unique `<title>` tag (50–60 characters)
- [ ] Unique meta description (150–160 characters)
- [ ] Canonical URL set correctly
- [ ] Open Graph and Twitter Card meta tags
- [ ] JSON-LD structured data (Article, ItemList, or FAQPage)
- [ ] At least one featured snippet container per page
- [ ] H1 tag matches primary keyword intent
- [ ] H2/H3 hierarchy follows logical outline

### Content Requirements
- [ ] All claims backed by cited peer-reviewed research
- [ ] Evidence tier badges displayed correctly
- [ ] Dosage information includes standardization, population, duration
- [ ] Safety profile with contraindications and interactions
- [ ] No marketing or promotional language (per style guide)
- [ ] Medical disclaimer present on every page
- [ ] 15+ internal links per guide, 10+ per category, 8+ per comparison

### Technical Requirements
- [ ] content-shared.css and legal-shared.css loaded
- [ ] PostHog analytics snippet present
- [ ] Mobile responsive (tables reflow, cards stack)
- [ ] Print styles hide nav/footer
- [ ] Favicon set
- [ ] All images have alt text
- [ ] Page loads in < 3 seconds on 3G
