# SupplementDB Content Style Guide

> The definitive voice, tone, and formatting reference for all SupplementDB content.
> Last Updated: March 9, 2026

---

## 1. Voice & Identity

SupplementDB speaks as a **clinical research database** — not a wellness blog, not a supplement retailer, not a lifestyle brand.

**Core voice attributes:**
- **Evidence-first:** Every claim links to peer-reviewed research
- **Precise but accessible:** Scientific accuracy without unnecessary jargon
- **Neutral:** No advocacy for or against any supplement
- **Authoritative:** Confident in methodology, transparent about limitations

**We are:** A curated, evidence-based research database
**We are not:** A medical provider, supplement retailer, or wellness influencer

---

## 2. Tone Rules

### Always
- Use measured, clinical language: *"Studies suggest,"* *"Evidence indicates,"* *"Research demonstrates"*
- Qualify findings by study quality: *"A well-powered RCT (n=240) found..."*
- Acknowledge uncertainty: *"Further research is needed to confirm..."*
- Include safety qualifiers: *"Consult a healthcare provider before use"*

### Never
- Use marketing language: ~~"amazing results"~~, ~~"miracle supplement"~~, ~~"life-changing"~~
- Make absolute claims: ~~"proven to cure"~~, ~~"guaranteed to work"~~
- Use urgency/scarcity: ~~"act now"~~, ~~"limited time"~~, ~~"don't miss out"~~
- Provide dosage prescriptions without sourcing: always cite the study that established the dose
- Use informal abbreviations: ~~"supps"~~, ~~"noots"~~ — use full terms

---

## 3. Terminology Standards

### Supplement Names
- **Primary format:** Scientific name first, common names in parentheses
  - Example: *Bacopa monnieri (Brahmi, Water Hyssop)*
- **Subsequent references:** Scientific name only, or abbreviated common name if previously introduced
- **Never:** Brand names or proprietary blend names

### Evidence Tiers
Use these exact labels consistently:
| Tier | Label | Definition |
|------|-------|-----------|
| 1 | Strong Evidence | Multiple large RCTs, systematic reviews, or meta-analyses with consistent findings |
| 2 | Moderate Evidence | Multiple RCTs with moderate sample sizes, or fewer large studies |
| 3 | Preliminary Evidence | Limited RCTs, mostly observational studies or small trials |
| 4 | Emerging Evidence | Primarily preclinical, mechanistic, or very early-phase human studies |

### Dosage Language
- Always include standardization: *"300mg daily (standardized to 55% bacosides)"*
- Always include study population: *"Studied in healthy adults aged 18–65"*
- Always include duration: *"Benefits observed after 12–16 weeks of continuous use"*
- Always include the qualifier: *"Dosage based on research findings; consult a healthcare provider for personalized recommendations"*

### Safety Language
- **Good:** *"Generally well-tolerated in studied populations"*
- **Moderate:** *"Some adverse effects reported; monitoring recommended"*
- **Caution:** *"Significant interactions or contraindications documented"*
- Always list known contraindications and drug interactions

---

## 4. Citation Format

### Inline Citations
Use author-year format with DOI link:
> Roodenrys et al. (2002) found significant improvements in verbal learning ([DOI](https://doi.org/10.1016/S0893-133X(01)00419-5))

### Full Citation Entry
```
Author(s). "Title." Journal Name, vol. X, no. Y, Year, pp. Z–ZZ.
DOI: https://doi.org/XXXXX
PMID: XXXXXXXX
```

### Citation Quality Indicators
Always note when referencing a citation:
- **Study type:** RCT, systematic review, meta-analysis, cohort study, case report
- **Sample size:** Include n value
- **Evidence level:** Map to our tier system
- **Key findings:** One-sentence summary of the primary result
- **Effect size:** Include when available (Cohen's d, SMD, OR, RR)

---

## 5. Formatting Rules

### Page Structure
- Use clear section headers (H2) for major topics
- Use subsection headers (H3) for supporting detail
- Keep paragraphs to 3–5 sentences maximum
- Use bullet points for lists of 3+ items
- Use tables for comparative data

### Evidence Tier Badges
Display format for supplement cards:
- Tier 1: Green badge — "Strong Evidence"
- Tier 2: Blue badge — "Moderate Evidence"
- Tier 3: Yellow badge — "Preliminary Evidence"
- Tier 4: Gray badge — "Emerging Evidence"

### Numbers & Units
- Spell out numbers one through nine; use numerals for 10+
- Exception: Always use numerals for dosages, study sizes, and statistics
- Use metric units for dosages (mg, g, mcg, IU)
- Use ranges with en-dash: *300–600mg*, *12–16 weeks*

### Health Domains
Use these exact labels (match the database):
Memory Enhancement, Focus & Attention, Sleep Quality, Anxiety Reduction, Stress Resilience, Neuroprotection, Mood Stabilization, Cardiovascular Health, Immune Function, Anti-inflammatory, Joint Health, Metabolic Health, Gut Health, Energy & Vitality, Longevity, Skin Health, Eye Health, Hormone Balance, Athletic Performance, Antioxidant Defense

---

## 6. Category Naming Conventions

Use these exact category names (match the database):
1. Nootropics
2. Adaptogens
3. Anti-inflammatory
4. Essential Nutrients
5. Sleep Support
6. Performance Enhancers
7. Herbal Extracts
8. Metabolic Support
9. Polyphenols
10. Antioxidants
11. Joint Support
12. Amino Acids
13. Specialized (with sub-type: Choline Compound, Essential Fatty Acid, Flavonoid, Phospholipid, Plant Alkaloid)

---

## 7. Content Types & Templates

### Supplement Card (database entry)
Required fields: Name, Scientific Name, Category, Evidence Tier, Primary Benefits, Dosage Range, Safety Profile, Key Citations

### Evidence Guide (long-form)
Structure: Overview → Mechanism of Action → Clinical Evidence → Dosage & Administration → Safety → Key Citations → Disclaimer

### Research Update (news)
Structure: Headline → Study Summary → Key Findings → Implications → Full Citation

### Audience Summary
- **Lay version:** No jargon, analogies encouraged, 8th-grade reading level
- **Scientific version:** Full technical detail, assumes graduate-level knowledge

---

## 8. Disclaimer Requirements

Every content page must include:
- Link to the full medical disclaimer (`legal/disclaimer.html`)
- The standard footer disclaimer text: *"This information is for educational purposes only and should not replace professional medical advice."*
- Individual supplement entries do not need per-entry disclaimers (covered by site-wide disclaimer)

---

## 9. Design Tokens (for content authors creating HTML)

```css
--accent: #2d5a3d          /* Primary green */
--accent-light: #3a7d5c    /* Hover green */
--text-primary: #1a1a2e    /* Headings */
--text-secondary: #4a4a6a  /* Body text */
--bg-page: #fafaf8         /* Page background */
--font-serif: 'Source Serif 4'  /* Headings */
--font-sans: 'DM Sans'         /* Body text */
```

---

## 10. Quality Checklist

Before publishing any content, verify:
- [ ] All claims are backed by cited peer-reviewed research
- [ ] Evidence tiers are correctly assigned and labeled
- [ ] Dosage information includes standardization, population, and duration
- [ ] Safety profile includes contraindications and drug interactions
- [ ] No marketing or promotional language is used
- [ ] Medical disclaimer is referenced or linked
- [ ] DOIs and PMIDs are verified and resolve correctly
- [ ] Content is reviewed for accessibility (alt text, semantic HTML, color contrast)
- [ ] Consistent terminology per this style guide
