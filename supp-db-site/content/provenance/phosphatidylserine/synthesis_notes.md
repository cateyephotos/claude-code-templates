# Synthesis Notes — Phosphatidylserine (ID: 12) Mode 2 Evidence Update

**Date:** 2026-03-05
**Pipeline:** Mode 2 — Evidence Update
**Operator:** Claude (automated pipeline)
**Supplement:** Phosphatidylserine (ID: 12)

---

## Clinical Interpretation

### Overview of PS Evidence Across Domains

Phosphatidylserine occupies a distinctive position in the supplement evidence landscape: it has multiple RCTs across diverse populations with consistent positive cognitive and stress-modulation findings, yet lacks the meta-analytic rigor (PS-specific pooled estimates) that would elevate it to the highest evidence tier. The evidence base spans five clinical domains:

**Cognitive Enhancement (MCI/Elderly):** The strongest clinical evidence comes from Duan 2025 (RCT, n=190, 12 months) showing memory improvement in mild cognitive impairment patients, and Kato-Kataoka 2010 (RCT, n=78) demonstrating dose-dependent verbal recall improvement in elderly subjects. These represent the largest and most methodologically rigorous PS-specific trials. The 12-month duration of Duan 2025 is notably longer than most supplement RCTs and provides valuable long-term safety and efficacy data.

**Cognitive Enhancement (Healthy Adults):** Doma 2023 (RCT, n=138) provides evidence for working memory improvement in healthy adults, extending the cognitive benefit findings beyond clinical populations. This is important for establishing PS as a cognitive enhancer rather than solely a therapeutic agent.

**ADHD:** Previously supported by a single small RCT (Hirayama 2014, n=36), the ADHD domain is now strengthened by Zhou et al. 2024's network meta-analysis. The NMA's ranking of PS as #1 among 12 antioxidant drugs for ADHD-RS Parent attention score (SUCRA 0.39) and total score (SUCRA 0.34) provides the first systematic comparative efficacy data for PS in ADHD.

**Stress/Cortisol Modulation:** Baumeister 2008 and Hellhammer 2014 (n=75) provide evidence for PS effects on cortisol and stress responses. This domain connects PS's cognitive benefits to its stress-modulation properties, supporting a mechanistic pathway from cortisol reduction to cognitive performance improvement under stress.

**Neuroprotection (Mechanistic):** Multiple review papers (Kim 2014, Ma 2022, Glade 2015) establish strong mechanistic evidence for PS's role in membrane function, neurotransmitter support, and anti-inflammatory neuroprotection. These mechanisms are consistent with the observed clinical effects across domains.

---

### NMA Ranking Significance

The Zhou 2024 NMA result — PS ranked #1 for ADHD attention (SUCRA 0.39) — requires careful interpretation:

**What the SUCRA ranking means:** A SUCRA of 0.39 indicates PS has a 39% cumulative probability of being the best treatment among 12 antioxidant drugs for parent-rated attention symptoms. This is a relative ranking, not an absolute effect size.

**What it does NOT mean:** The ranking does not indicate:
- A 39% improvement in attention scores
- Statistical superiority over all other interventions in pairwise comparisons
- Equivalence to stimulant ADHD medications (which were not in the comparison set)
- Generalizability beyond the pediatric ADHD population studied

**Clinical relevance:** The NMA's value lies in positioning PS within a comparative framework. Being ranked #1 among antioxidant ADHD interventions, while not equivalent to being compared against first-line ADHD pharmacotherapy, provides evidence that among non-stimulant antioxidant approaches, PS has the most favorable efficacy profile for attention symptoms.

**Limitations of NMA evidence for PS:** The number of PS-specific RCTs contributing to the network is likely small (potentially only Hirayama 2014 and one or two others), meaning the ranking is derived from limited PS-specific data amplified by the network structure.

---

## Data Integrity Fixes

### 1. Misassigned 12_enhanced.js (Lion's Mane Data at PS ID 12 Slot)

**Issue discovered:** The file `12_enhanced.js` contained Lion's Mane (Hericium erinaceus) data incorrectly assigned to Phosphatidylserine's ID 12 slot.

| Field | Expected (PS) | Actual (Found) |
|-------|---------------|-----------------|
| Variable name | phosphatidylserineEnhanced | lionsManeLHericiumErinaceusEnhanced |
| Supplement name | Phosphatidylserine | Lion's Mane |
| Window assignment | window.enhancedCitations[12] | window.enhancedCitations[12] |
| Quality score | 85 | 85 |
| Tier | 2 or 3 | 1 |

**Impact:** At runtime, `window.enhancedCitations[12]` would have been overwritten with Lion's Mane data, meaning any user viewing Phosphatidylserine's enhanced citations would see Lion's Mane research instead. This is a silent data corruption issue that would not produce console errors but would display incorrect scientific information.

**Resolution:** File archived to `_archive/12_enhanced.js.ARCHIVED`. The correct PS enhanced data is in `phosphatidylserine_enhanced.js`.

**Systemic concern:** This is the third instance of Lion's Mane data appearing at wrong ID slots in the codebase (after `11_enhanced.js` canonical and `11_lions_mane_enhanced.js` previously archived). This pattern suggests a systematic issue in the original data generation pipeline where Lion's Mane files were created at incorrect ID positions.

### 2. Wrong Dosage Citation (Huperzine A Paper)

**Issue discovered:** Citation key `ps_dosage_1` references:
- Wang BS et al. 2009
- "Efficacy and safety of natural acetylcholinesterase inhibitor huperzine A in the treatment of Alzheimer's disease: an updated meta-analysis"

This is a huperzine A meta-analysis, not a phosphatidylserine study. The dosage guidance in the enhanced file (100-300mg/day) is actually derived from PS-specific clinical RCTs (Kato-Kataoka 2010, Vakhapova 2011), not from this citation.

**Resolution:** Flagged with `_INTEGRITY_FLAG` annotation in the enhanced citations file. Replacement with a verified PS dosage citation is recommended as a follow-up action.

**Correct PS dosage references:**
- Kato-Kataoka 2010 (PMID: 20523044): 100mg/day and 300mg/day doses tested, dose-dependent response
- Vakhapova 2011 (PMID: 21299727): 100mg/day PS-DHA for 15 weeks, well-tolerated
- Duan 2025: PS supplementation dosage in MCI patients over 12 months

### 3. Duplicate isEnhanced Keys in supplements.js

**Issue discovered:** Two `"isEnhanced": true` entries were incorrectly placed inside the `primaryBenefits` object in supplements.js (lines 976-977), with a third inside the `enhancedCitations` block.

**Resolution:** Removed all three misplaced entries. Single `isEnhanced: true` placed at top level of the supplement entry, before `primaryBenefits`.

### 4. Tier Inconsistency Between Files

**Issue discovered:** Enhanced citations file had Tier 3; supplements.js had Tier 2.

**Resolution:** Both reconciled to Tier 2, supported by evidence evaluation (see tier_assignment.md).

### 5. Generic Citations and Effect Sizes Replaced

**Issue discovered:** supplements.js contained placeholder data:
- `"authors": "Multiple studies"`, `"year": "2010-2020"`, `"doi": "Various"`
- `"Small to moderate (d=0.3-0.5)"` and `"Moderate reduction"` as effect sizes

**Resolution:** Replaced with properly cited Zhou 2024 and Duan 2025 references, and four quantitative effect size entries with specific study references.

---

## Evidence Gaps and Future Research Needs

### Critical Gaps (Would Enable Tier 1 Upgrade)

| Gap | Priority | What Would Fill It |
|-----|----------|-------------------|
| No PS-specific meta-analysis with pooled cognitive estimates | **Critical** | SR/MA pooling PS RCTs for cognitive outcomes with forest plots, heterogeneity analysis |
| No Cochrane review | **High** | Cochrane systematic review for any PS indication (cognitive, ADHD, stress) |
| No large multi-center RCT (n>500) | **High** | Multi-center, placebo-controlled RCT with cognitive primary endpoint, 6+ months |

### Important Gaps (Would Strengthen Tier 2)

| Gap | Priority | What Would Fill It |
|-----|----------|-------------------|
| ADHD evidence limited (single small RCT) | **High** | Dedicated PS-ADHD RCT, n>=100, 6+ months, standard ADHD outcome measures |
| No formal dose-response meta-analysis | **Medium** | Meta-regression or dose-response MA across PS RCTs |
| Soy vs. sunflower PS not compared | **Medium** | Head-to-head RCT or systematic comparison of PS sources |
| Limited long-term data (>1 year) | **Medium** | Extension studies or new long-term RCTs (2+ years) |
| Wrong dosage citation needs replacement | **Low** | Replace huperzine A citation with verified PS dosage study |

### Emerging Research Questions

1. **PS + omega-3 combination effects:** Zhou 2024 NMA shows PS+omega-3 combination ranked top for hyperactivity. Dedicated combination RCTs could establish synergistic effects.
2. **PS bioavailability by source:** Soy-derived vs. sunflower-derived vs. marine-derived PS may have different bioavailability profiles affecting clinical outcomes.
3. **PS in specific neurodegenerative conditions:** Beyond MCI, PS effects in early Alzheimer's disease, Parkinson's disease-related cognitive decline, or age-related cognitive decline warrant investigation.
4. **PS and cortisol across stress types:** Extending stress research beyond acute stress (Hellhammer 2014) to chronic stress, occupational stress, and academic stress populations.

---

## Summary of Changes Made

| Action | Detail |
|--------|--------|
| New citation added | Zhou 2024 (PMID 38547138) as ps_benefit_5 |
| Tier changed | 3 --> 2 (enhanced file reconciled with supplements.js) |
| Quality score changed | 85 --> 86 |
| Citations count changed | 12 --> 13 |
| File archived | 12_enhanced.js (Lion's Mane data) --> _archive/12_enhanced.js.ARCHIVED |
| Integrity flag added | ps_dosage_1 (wrong citation: huperzine A paper) |
| supplements.js structural fixes | Duplicate isEnhanced keys, generic citations, generic effect sizes, missing evidenceProfile |
| ADHD domain strengthened | From single small RCT to NMA-supported positioning |

---

## Provenance Trail Completeness Check

| Provenance File | Status | Content |
|----------------|--------|---------|
| search_log.md | Complete | 4 searches, 2 databases, 11 papers screened |
| screening_decisions.md | Complete | 1 included, 10 excluded with reasons mapped to criteria |
| evidence_evaluation.md | Complete | Zhou 2024 evaluated: Level 1, quality 7/10 |
| tier_assignment.md | Complete | Tier 3 --> 2 upgrade with 6-point rationale |
| synthesis_notes.md | Complete | Clinical interpretation, NMA significance, data integrity fixes, evidence gaps |

All five provenance trail files created on 2026-03-05 for Phosphatidylserine (ID: 12) Mode 2 Evidence Update.
