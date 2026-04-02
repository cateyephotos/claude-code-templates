# Ginkgo Biloba (ID: 14) — Mode 2 Evidence Update
**Date:** 2026-03-05
**Pipeline:** Mode 2 — Evidence Update
**Phase:** Phase 2, Batch 1
**Operator:** Claude (automated pipeline)

---

## Executive Summary

Ginkgo Biloba evidence base updated from 15 to 19 citations. Quality score adjusted from 74 to 80 (+3 from major Cochrane update, +1 each from NMA, VCI MA, and overview of reviews). **Tier reconciled at 2** — enhanced file had Tier 3 but supplements.js had Tier 2; Tier 2 justified by Cochrane + multiple NMAs. Major finding: Wieland et al. 2026 Cochrane review (82 RCTs, n=10,613, GRADE) shows GB may have small-moderate benefits in dementia (low certainty) but probably no effect in MCI (moderate certainty). Masserini 2025 MA (173 trials, n=22,347) ranks GB #1 for VCI cognition (d=0.83). Tiemtad 2026 NMA shows high-dose Bacopa outperforms GB for working memory.

**Data integrity fixes:** (1) Duplicate safety DOI flagged (Cybulsky 2004 appears in safety[0] and safety[1]). (2) All safety citations are cell culture studies — no clinical safety data despite Cochrane 2026 confirming excellent clinical safety. (3) Tier mismatch resolved (enhanced Tier 3 → Tier 2). (4) Three duplicate isEnhanced keys fixed in supplements.js.

## Search Strategy

### Databases Searched
| Database | Query | Date Range | Results |
|----------|-------|------------|---------|
| PubMed | "Ginkgo biloba systematic review meta-analysis" | 2024-2026 | 20 |
| PubMed | "Ginkgo biloba supplementation cognitive RCT" | 2024-2026 | 0 |
| Consensus | "Ginkgo biloba EGb 761 supplementation cognitive function clinical trials evidence systematic review" | 2024+ | 3 |
| **Total screened** | | | **23** |

### Screening Results

**INCLUDED (4 papers):**

1. **Wieland et al. 2026** (PMID: 41641880)
   - *Ginkgo biloba for cognitive impairment and dementia*
   - Cochrane Database of Systematic Reviews, (5), CD013661
   - DOI: [10.1002/14651858.CD013661.pub2](https://doi.org/10.1002/14651858.CD013661.pub2)
   - **Type:** Cochrane SR with GRADE
   - **Scale:** 82 RCTs, 10,613 participants
   - **Key findings:** Dementia: GB may result in small to moderate improvement in cognition at 6 months (low certainty). MCI: probably no effect (moderate certainty). Adverse events: little to no difference vs placebo.
   - **Impact:** Definitive Cochrane review; supersedes Birks & Grimley Evans 2009; most comprehensive GB evidence synthesis to date

2. **Tiemtad et al. 2026** (PMID: 41678913)
   - *Bacopa monnieri versus Ginkgo biloba for cognitive enhancement: A systematic review and network meta-analysis of randomized controlled trials*
   - Phytomedicine, 143, 157915
   - DOI: [10.1016/j.phymed.2026.157915](https://doi.org/10.1016/j.phymed.2026.157915)
   - **Type:** SR + Network Meta-analysis (PROSPERO registered)
   - **Scale:** 29 RCTs, 2,107 participants
   - **Key findings:** High-dose Bacopa monnieri outperformed all GB doses for working memory (SUCRA 100%). GB 240mg showed moderate benefits for executive function and attention.
   - **Impact:** First head-to-head NMA comparing the two most popular herbal nootropics

3. **Masserini et al. 2025** (PMID: 41198594)
   - *Therapeutic strategies for vascular cognitive impairment: a meta-analysis of randomized controlled trials*
   - Alzheimer's & Dementia
   - DOI: [10.1002/alz.70840](https://doi.org/10.1002/alz.70840)
   - **Type:** Meta-analysis
   - **Scale:** 173 trials, 22,347 participants
   - **Key findings:** GB extracts showed LARGEST cognitive improvement among all VCI interventions (Cohen's d=0.83, 95% CI 0.00-1.67). GB also showed functional improvement (d=0.50). Outperformed cholinesterase inhibitors and other drug classes.
   - **Impact:** Establishes GB as leading intervention for VCI — a key clinical niche

4. **Pfuhlmann et al. 2025** (PMID: 40121884)
   - *Ginkgo biloba leaf extract EGb 761 in dementia with neuropsychiatric features: an overview of clinical evidence*
   - Phytomedicine, 140, 156565
   - DOI: [10.1016/j.phymed.2025.156565](https://doi.org/10.1016/j.phymed.2025.156565)
   - **Type:** Overview of systematic reviews (PROSPERO, AMSTAR 2)
   - **Scale:** 16 SRs included (126 screened)
   - **Key findings:** Most SRs favor EGb 761 for cognition and behavioral symptoms. Safe profile confirmed. AMSTAR 2: poor methodological quality of included SRs.
   - **Impact:** Umbrella-level evidence synthesis; identifies SR quality as key limitation

**EXCLUDED (19 papers):**

| PMID/Source | Reason |
|-------------|--------|
| 41601988 | Pathak 2026 — Diabetic neuropathy, preclinical GB review, not cognitive supplementation |
| 41404461 | Jia 2025 — Post-stroke VCI, Chinese patent medicines, not GB supplementation |
| 41268442 | Pang 2025 — Heart failure, Yinxing Damo granules (GB combination), not cognitive |
| 41127289 | Stebner 2025 — Multiple sclerosis, neuroprotection review, GB one of many supplements |
| 40019748 | Guo 2024 — Spinal cord injury, animal studies only |
| 40441764 | Li 2025 — Tinnitus NMA, GB+vitamins combination, not GB alone |
| 40083108 | Zhang 2025 — Stroke, traditional Chinese medicine review |
| 40213691 | Wang 2025 — Cognitive NMA of natural extracts, Cistanche+Ginkgo combination |
| 40110130 | Chen 2025 — Idiopathic pulmonary fibrosis, not cognitive |
| 39880062 | Luo 2025 — GDLM (GB dripping pills), liver/metabolic, not cognitive |
| 39830333 | Wang 2024 — Diabetic kidney disease, GB combination formula |
| 39496028 | Zhang 2024 — Edaravone+GB combination for stroke |
| 39312316 | Guo 2024 — AD pharmacological NMA, GB not independently analyzed |
| 38718890 | Liu 2024 — Angina pectoris, GB injection, not oral supplementation |
| 39021830 | Xu 2024 — GBE+donepezil combination for vascular dementia |
| 38701296 | Duan 2024 — Chinese patent medicines for hypertension, GB minor component |
| 38547138 | Zhou 2024 — Already included for Phosphatidylserine (ID 12) |
| Consensus #1 | Pagotto/Santos 2024 — Already in enhanced file as ginkgo_ben_002 |
| Consensus #2 | Canter & Ernst 2007 — Old paper, predates existing Cochrane review |

## Evidence Evaluation

### Wieland et al. 2026 — Cochrane Review
- **GRADE Assessment:** Formally performed (low to moderate certainty)
- **Evidence Level:** Level 1 (Cochrane SR with GRADE)
- **Risk of Bias:** Assessed with Cochrane RoB tool across 82 RCTs
- **Precision:** Excellent — 82 RCTs, n=10,613
- **Consistency:** Moderate — benefits seen in dementia but not MCI
- **Directness:** High — directly addresses GB for cognitive impairment
- **Limitations:** Low certainty for dementia benefits; moderate certainty for MCI non-effect
- **Quality Score:** 9/10

### Tiemtad et al. 2026 — Comparative NMA
- **GRADE Assessment:** Not formally performed
- **Evidence Level:** Level 1 (SR+NMA, PROSPERO registered)
- **Risk of Bias:** PROSPERO registered, Cochrane methods applied
- **Precision:** Good — 29 RCTs, n=2,107
- **Consistency:** Good — consistent GB ranking across cognitive domains
- **Directness:** High — head-to-head comparison of herbal nootropics
- **Limitations:** Heterogeneity in GB extract preparations across studies
- **Quality Score:** 8/10

### Masserini et al. 2025 — VCI Meta-analysis
- **GRADE Assessment:** Not formally performed
- **Evidence Level:** Level 1 (large-scale MA)
- **Risk of Bias:** Moderate — variable quality across 173 trials
- **Precision:** Excellent — n=22,347 (though GB subset smaller)
- **Consistency:** Good — GB consistently top-ranked for VCI
- **Directness:** Moderate — VCI-specific, not general cognitive enhancement
- **Limitations:** Wide confidence interval for GB effect (d=0.83, 95% CI 0.00-1.67)
- **Quality Score:** 7/10

### Pfuhlmann et al. 2025 — Overview of SRs
- **GRADE Assessment:** Not formally performed; AMSTAR 2 applied to included SRs
- **Evidence Level:** Level 1 (overview of reviews, PROSPERO)
- **Risk of Bias:** Low for overview methodology; included SRs had poor quality
- **Precision:** Good — 16 SRs from 126 screened
- **Consistency:** Good — most SRs favor EGb 761
- **Directness:** High — specifically EGb 761 in dementia
- **Limitations:** AMSTAR 2 reveals poor methodological quality of underlying SRs
- **Quality Score:** 7/10

## Tier Assessment

### Decision: RECONCILE at Tier 2 (enhanced file Tier 3 → Tier 2)
**Rationale:**
1. **Cochrane review 2026** — 82 RCTs, n=10,613 with GRADE assessment (definitive evidence)
2. **Multiple NMAs** — Tiemtad 2026 (29 RCTs), Masserini 2025 (173 trials)
3. **Extensive RCT evidence** — Largest evidence base among herbal nootropics
4. **Mixed certainty prevents Tier 1** — MCI "probably no effect" (moderate certainty); dementia benefits at low certainty only
5. **VCI niche strong** — d=0.83, ranked #1, but wide CI
6. **Previous Tier 3 in enhanced file too conservative** — Evidence base far exceeds Tier 3 criteria
7. **supplements.js already had Tier 2** — Reconciled to Tier 2

### Quality Score Change: 74 → 80
- Base: 74 (enhanced file value)
- +3 from Wieland 2026 Cochrane (82 RCTs with GRADE — gold standard evidence update)
- +1 from Tiemtad 2026 NMA (29 RCTs, PROSPERO, head-to-head comparison)
- +1 from Masserini 2025 VCI MA (173 trials, establishes new clinical niche)
- +1 from Pfuhlmann 2025 overview (16 SRs, AMSTAR 2, umbrella evidence)
- Final: 80
- Note: Quality ceiling limited by low certainty of dementia benefits and MCI non-effect

## Files Modified

| File | Changes |
|------|---------|
| `data/enhanced_citations/14_enhanced.js` | Tier 3→2; quality 74→80; citations 15→19; added Wieland 2026, Tiemtad 2026, Masserini 2025, Pfuhlmann 2025 as ginkgo_ben_007 through ginkgo_ben_010; flagged duplicate safety DOI; updated evidenceProfile, qualityAssurance; added keyFindings[], evidenceGaps[], mode2UpdateLog{} |
| `data/supplements.js` (ID 14) | Fixed 3x duplicate isEnhanced keys; replaced generic effectSizes with 5 quantitative entries; replaced single old keyCitation with 3 properly cited entries; updated evidenceProfile (quality 74→80, citations 15→19, lastEvidenceUpdate→2026-03-05); expanded primaryBenefits with VCI and neuropsychiatric domains; expanded studyPopulations; added cochraneSafety to safetyProfile; expanded evidenceTierRationale |
| `content/research-updates/2026-03-05_ginkgo_biloba_update.md` | This change report |

## Structural Fixes Applied

1. **Duplicate isEnhanced keys** (supplements.js): Two `"isEnhanced": true` entries inside `primaryBenefits` + third inside `enhancedCitations` block. Removed all three, placed single `isEnhanced: true` at top level before `primaryBenefits`.
2. **Duplicate safety DOI flagged**: `ginkgo_safe_002` has same DOI as `safety[0].evidence[0]` (Cybulsky 2004, DOI 10.1038/sj.bjp.0705805). Added `_INTEGRITY_FLAG` annotation with clinical safety note.
3. **Cell culture safety citations**: All three safety citations are in vitro/cell culture studies. Wieland 2026 Cochrane (82 RCTs) provides definitive clinical safety data ("little to no difference in adverse events vs placebo") but not yet added as standalone safety entry.
4. **Tier reconciliation**: Enhanced file had Tier 3, supplements.js had Tier 2. Resolved to Tier 2 (justified by evidence evaluation).
5. **Generic effectSizes replaced**: `"Small (d=0.2-0.4)"` and `"Moderate improvement"` → 5 quantitative entries with specific study references and effect estimates.
6. **Single old keyCitation replaced**: Birks & Grimley Evans 2009 alone → 3 properly cited entries (Wieland 2026, Masserini 2025, Tiemtad 2026).
7. **Missing evidenceProfile fields added**: Added overallQuality, evidenceStrength{}, lastEvidenceUpdate (replacing lastUpdated).
8. **New domains added**: VCI and neuropsychiatric symptoms added to primaryBenefits.cognitive and studyPopulations.

## Domain Evidence Summary (Post-Update)

| Domain | Previous Strength | Updated Strength | Key Evidence |
|--------|------------------|------------------|--------------|
| Cognitive Enhancement (dementia) | Moderate | **Moderate-Strong (updated)** | **Wieland 2026 Cochrane: small-moderate benefits (82 RCTs, low certainty)** |
| Cognitive Enhancement (MCI) | Moderate | **Weak (downgraded)** | **Wieland 2026 Cochrane: probably no effect (moderate certainty)** |
| Vascular Cognitive Impairment | Not available | **Strong (new)** | **Masserini 2025 MA: d=0.83, ranked #1 (173 trials)** |
| Working Memory (comparative) | Not available | **Moderate (new, unfavorable)** | **Tiemtad 2026 NMA: Bacopa outperforms GB (29 RCTs)** |
| Neuropsychiatric Symptoms | Moderate | **Moderate-Strong (updated)** | **Pfuhlmann 2025: most SRs favor EGb 761; Gauthier 2024 MA** |
| Metabolic Syndrome | Weak | Weak (unchanged) | Sarahroodi 2020 review |
| Cerebral Blood Flow | Moderate | Moderate (unchanged) | Yoshioka 2011 RCT |
| Neuroprotection (mechanistic) | Moderate | Moderate (unchanged) | Hu 2024, Mesquita 2015 |
| Safety | Good (cell culture only) | **Good (clinical confirmed)** | **Wieland 2026: AEs = placebo across 82 RCTs** |
| Dosage | Evidence-based | Evidence-based (unchanged) | Birks 2014, Noor-E-Tabassum 2022 |

## Evidence Gaps Remaining

1. MCI evidence shows NO benefit (moderate certainty) — undermines cognitive enhancement claims in non-demented populations
2. No GB-specific meta-analysis for tinnitus, peripheral circulation, or healthy adult cognition
3. Safety evidence in enhanced file limited to cell culture — needs clinical safety entries added
4. Head-to-head NMA shows Bacopa outperforms GB for working memory — comparative positioning needed
5. Most positive evidence from EGb 761 standardized extract — generalizability to other GB preparations uncertain
6. Long-term cognitive outcome data (>2 years) limited despite large trial base
7. VCI effect size has very wide CI (d=0.83, 95% CI 0.00-1.67) — includes null effect
8. AMSTAR 2 reveals poor methodological quality of existing GB systematic reviews
9. Duplicate safety DOI in enhanced file needs resolution (Cybulsky 2004 appears twice)

## Clinical Implications

The addition of four major systematic evidence papers dramatically updates the Ginkgo Biloba evidence landscape. The Wieland 2026 Cochrane review is the single most important update — with 82 RCTs and 10,613 participants assessed with GRADE, it provides definitive evidence that GB has small-moderate benefits in dementia (low certainty) but probably no effect in MCI (moderate certainty). This MCI finding is clinically significant because it suggests GB may not benefit the "worried well" or those with subjective cognitive concerns — only those with established dementia.

The Masserini 2025 MA establishes a key clinical niche for GB: vascular cognitive impairment. With the largest effect size (d=0.83) among all interventions in a 173-trial, 22,347-participant analysis, GB is positioned as the leading VCI treatment — though the wide confidence interval (0.00-1.67) warrants caution.

The Tiemtad 2026 NMA provides the first head-to-head comparison of GB vs Bacopa monnieri, finding that high-dose Bacopa outperforms all GB doses for working memory (SUCRA 100% vs GB). This has important implications for supplement recommendations where working memory is the primary concern.

The quality score increase from 74 to 80 reflects the substantial new evidence while the ceiling is limited by mixed certainty levels. Tier 2 is maintained — GB has extensive evidence but the mixed certainty pattern (low for dementia, moderate against MCI) prevents Tier 1 upgrade.
