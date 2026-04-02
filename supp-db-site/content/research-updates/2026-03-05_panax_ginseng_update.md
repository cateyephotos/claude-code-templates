# Panax Ginseng (ID: 15) — Mode 2 Evidence Update
**Date:** 2026-03-05
**Pipeline:** Mode 2 — Evidence Update
**Phase:** Phase 2, Batch 1
**Operator:** Claude (automated pipeline)

---

## Executive Summary

Panax Ginseng evidence base updated from 19 to 22 citations. Quality score adjusted from 81 to 83 (+1 from two new cognitive MAs, +1 from comprehensive CVD dose-response MA). **Tier maintained at 2** — mixed cognitive domain results (memory positive, attention/executive null) prevent Tier 1 upgrade. Major findings: Zeng 2024 MA (15 RCTs, n=671, PROSPERO) shows ginseng significantly improves memory (SMD=0.19) especially at high doses (SMD=0.33) but has no effect on overall cognition, attention, or executive function. Kim 2025 MA (8 RCTs) confirms benefit on validated dementia scales (MMSE MD=0.68, ADAS-Cog MD=-1.10). Jafari 2025 dose-response MA (70 RCTs, n=4,506) establishes anti-inflammatory/antioxidant as primary CVD mechanism (hs-CRP, ROS, SOD significant) but shows no effect on lipids, BP, glycemia, or anthropometrics.

**Data integrity fixes:** (1) Three fabricated safety citations flagged — authors "Research team", year 2023, journal "Clinical review", no PMID/DOI (safety[1], safety[3], safety[4]). (2) Species mismatch flagged — Vuksan 2000 (benefit[4]) references Panax quinquefolius (American ginseng), not Panax ginseng. (3) Ellis 2002 (benefit[3]) has empty PMID and DOI. (4) Three duplicate isEnhanced keys fixed in supplements.js.

## Search Strategy

### Databases Searched
| Database | Query | Date Range | Results |
|----------|-------|------------|---------|
| PubMed | "Panax ginseng systematic review meta-analysis" | 2024-2026 | 18 |
| Consensus | "Panax ginseng ginsenosides supplementation cognitive function clinical trials evidence" | 2024+ | 3 |
| **Total screened** | | | **21** |

### Screening Results

**INCLUDED (3 papers):**

1. **Zeng et al. 2024** (PMID: 39474788)
   - *Effects of Ginseng on Cognitive Function: A Systematic Review and Meta-Analysis*
   - Phytotherapy Research, DOI: [10.1002/ptr.8359](https://doi.org/10.1002/ptr.8359)
   - **Type:** SR + Meta-analysis (PROSPERO CRD42024514231)
   - **Scale:** 15 RCTs, 671 participants
   - **Key findings:** Memory improvement SMD=0.19 (95% CI: 0.02-0.36, p<0.05); high-dose memory SMD=0.33 (95% CI: 0.04-0.61, p<0.05). No effect on overall cognition (p=0.86), attention (p=0.54), or executive function (p=0.79).
   - **Impact:** First ginseng-specific cognitive MA with domain-specific effect sizes; establishes memory as primary cognitive benefit

2. **Kim et al. 2025** (PMID: 40774237)
   - *Cognitive Benefits of Ginseng: A Systematic Review and Meta-Analysis of Changes in Mini-Mental State Examination and Alzheimer's Disease Assessment Scale-Cognitive Subscale Scores*
   - Dementia and Geriatric Cognitive Disorders, DOI: [10.1159/000547543](https://doi.org/10.1159/000547543)
   - **Type:** SR + Meta-analysis
   - **Scale:** 8 RCTs
   - **Key findings:** MMSE improvement MD=0.68 (95% CI: 0.03-1.32, p=0.04, I²=66%). ADAS-Cog reduction MD=-1.10 (95% CI: -1.82 to -0.38, p=0.003, I²=0%). Low-dose ADAS-Cog: MD=-1.09 (95% CI: -1.96 to -0.22, p=0.01).
   - **Impact:** First MA using validated dementia scales for ginseng; ADAS-Cog results highly consistent (I²=0%)

3. **Jafari et al. 2025** (PMID: 40923100)
   - *The effect of ginseng supplementation on CVD risk factors: a comprehensive systematic review and dose-response meta-analysis*
   - British Journal of Nutrition, DOI: [10.1017/S0007114525103607](https://doi.org/10.1017/S0007114525103607)
   - **Type:** Comprehensive SR + dose-response meta-analysis
   - **Scale:** 70 RCTs, 4,506 participants
   - **Key findings:** Significant anti-inflammatory effects (hs-CRP SMD=-0.23, p=0.002), antioxidant effects (ROS SMD=-0.94, p<0.001; SOD SMD=0.48, p=0.014). Dose-response relationships for FBG (p<0.001), hs-CRP (p=0.043), IL-6 (p=0.041), DBP (p=0.022), fasting insulin (p=0.012). No effects on lipids, BP, glycemia, anthropometrics.
   - **Impact:** Largest ginseng supplementation MA (70 RCTs); establishes anti-inflammatory/antioxidant as primary CVD mechanism; refutes lipid/BP claims

**EXCLUDED (18 papers):**

| PMID/Source | Reason |
|-------------|--------|
| 41745077 | CRF phytotherapy SR — ginseng one of many phytotherapies, not ginseng-specific |
| 39788451 | Postoperative ileus SR — surgical complication, not ginseng supplementation |
| 40083108 | Plant extracts stroke cognitive NMA — ginseng one of many, already excluded for Ginkgo |
| 38877862 | Lipid profile GRADE MA — null finding already captured in Jafari 2025 |
| 39387709 | CVH biomarkers MA — superseded by more comprehensive Jafari 2025 |
| 40093323 | P. quinquefolius saponin for heart failure — wrong species (American ginseng) |
| 38898926 | P. notoginseng saponin injection for stroke — wrong species, injection route |
| 38576488 | P. notoginseng saponin injection for AMI — wrong species, injection route |
| 38969369 | Ginseng CVD risk factors protocol — protocol only, no results |
| 40769440 | P. notoginseng saponins for stroke — wrong species |
| 38425647 | Chinese herbal medicine for MCI — ginseng not independently analyzed |
| 39039242 | Ginsenoside Rg1 rodent depression MA — animal studies only |
| 38216446 | P. notoginseng saponins for COPD — wrong species |
| 40820043 | Daikenchuto for postoperative dysfunction — ginseng combination herbal formula |
| 39263082 | TCM monomers intimal hyperproliferation NMA — animal models |
| Consensus-1 | Budiasih 2025 — narrative review (not SR/MA), anti-aging focus |
| Consensus-2 | Dormal 2025 — single RCT; pipeline prioritizes SRs/MAs |
| Consensus-3 | Gao 2025 — gut microbiota SR; mechanistic, not clinical supplementation outcomes |

## Evidence Evaluation

### Zeng et al. 2024 — Cognitive SR+MA
- **GRADE Assessment:** Not formally performed
- **Evidence Level:** Level 1 (SR+MA, PROSPERO registered)
- **Risk of Bias:** Cochrane RoB2.0 + Jadad scale applied
- **Precision:** Good — 15 RCTs, n=671
- **Consistency:** Mixed — memory positive, other cognitive domains null
- **Directness:** High — directly ginseng preparations for cognitive function
- **Limitations:** Mixed results across cognitive domains; relatively small total N
- **Quality Score:** 7/10

### Kim et al. 2025 — MMSE/ADAS-Cog MA
- **GRADE Assessment:** Not formally performed
- **Evidence Level:** Level 1 (SR+MA)
- **Risk of Bias:** Two independent researchers assessed quality
- **Precision:** Moderate — 8 RCTs
- **Consistency:** Good — both MMSE and ADAS-Cog positive; ADAS-Cog I²=0%
- **Directness:** High — validated dementia scales in cognitive impairment populations
- **Limitations:** MMSE heterogeneity (I²=66%); smaller sample than Zeng 2024
- **Quality Score:** 7/10

### Jafari et al. 2025 — CVD Dose-response MA
- **GRADE Assessment:** Not formally performed
- **Evidence Level:** Level 1 (comprehensive SR + dose-response MA)
- **Risk of Bias:** Random effects model with meta-regression and non-linear modelling
- **Precision:** Excellent — 70 RCTs, n=4,506
- **Consistency:** Good — anti-inflammatory/antioxidant consistently positive; traditional CVD markers null
- **Directness:** Moderate — CVD risk factors, not cognitive supplementation
- **Limitations:** No effect on primary CVD endpoints (lipids, BP)
- **Quality Score:** 8/10

## Tier Assessment

### Decision: MAINTAIN Tier 2
**Rationale:**
1. **Cochrane review exists** (Geng 2010) — establishes systematic evidence base, though dated
2. **Two new cognitive MAs** — Zeng 2024 (15 RCTs) + Kim 2025 (8 RCTs) provide quantitative cognitive evidence
3. **Mixed cognitive domain results** — memory positive but attention/executive null; prevents Tier 1
4. **Comprehensive CVD evidence** — Jafari 2025 (70 RCTs) is impressive but shows null primary CVD endpoints
5. **Evidence breadth over depth** — spans 7+ domains (cognitive, fatigue, immune, CVD, blood sugar, stress, physical performance) without Tier 1 depth in any single domain
6. **Species confusion** — some evidence in enhanced file from P. quinquefolius, not P. ginseng

### Quality Score Change: 81 → 83
- Base: 81 (enhanced file value)
- +1 from Zeng 2024 + Kim 2025 cognitive MAs (domain-specific SMDs, validated scales, PROSPERO)
- +1 from Jafari 2025 CVD dose-response MA (70 RCTs, n=4,506, dose-response relationships)
- Final: 83
- Note: Ceiling limited by mixed cognitive domain results and null traditional CVD endpoints

## Files Modified

| File | Changes |
|------|---------|
| `data/enhanced_citations/15_panax_ginseng_enhanced.js` | Quality 81→83; citations 19→22; added Zeng 2024, Kim 2025, Jafari 2025 as ginseng_ben_008-010; flagged 3 fabricated safety citations; flagged species mismatch (Vuksan 2000); flagged missing PMID (Ellis 2002); updated evidenceProfile with keyFindings[], evidenceGaps[], mode2UpdateLog{} |
| `data/supplements.js` (ID 15) | Fixed 3x duplicate isEnhanced keys; replaced generic effectSizes with 7 quantitative entries; replaced single old keyCitation with 3 properly cited entries; added evidenceProfile (quality 83, citations 22, lastEvidenceUpdate 2026-03-05); expanded evidenceTierRationale; added anti-inflammatory/antioxidant to nonCognitive benefits; added CVD risk populations to studyPopulations; updated safetyProfile with BP note from Jafari 2025 |
| `content/research-updates/2026-03-05_panax_ginseng_update.md` | This change report |

## Structural Fixes Applied

1. **Duplicate isEnhanced keys** (supplements.js): Two `"isEnhanced": true` entries inside `primaryBenefits` + third inside `enhancedCitations` block. Removed all three, placed single `isEnhanced: true` at top level.
2. **Fabricated safety citations flagged**: safety[1], safety[3], safety[4] in enhanced file have `authors: ["Research team"]`, `year: 2023`, `journal: "Clinical review"`, empty PMID and DOI — clearly fabricated. Added `_INTEGRITY_FLAG` annotations.
3. **Species mismatch flagged**: Vuksan 2000 (benefit[4]) studies Panax quinquefolius (American ginseng), not Panax ginseng. Added `_INTEGRITY_FLAG` with note about species differences and Jafari 2025 glycemic null finding.
4. **Missing identifiers flagged**: Ellis 2002 (benefit[3]) has empty PMID and DOI. Added `_INTEGRITY_FLAG`.
5. **Generic effectSizes replaced**: "Moderate (d=0.4-0.6)" and "Small to moderate" → 7 quantitative entries with study references and CIs.
6. **Single old keyCitation replaced**: Geng 2010 Cochrane alone → 3 properly cited entries (Zeng 2024, Kim 2025, Jafari 2025).
7. **Missing evidenceProfile added**: supplements.js had no evidenceProfile block. Added full block with quality 83, citations 22, lastEvidenceUpdate, overallQuality, evidenceStrength.
8. **Benefits domains expanded**: Added "Cognitive function in dementia (MMSE/ADAS-Cog)" to cognitive; added "Anti-inflammatory activity", "Antioxidant effects" to nonCognitive.

## Domain Evidence Summary (Post-Update)

| Domain | Previous Strength | Updated Strength | Key Evidence |
|--------|------------------|------------------|--------------|
| Memory Enhancement | Moderate | **Moderate (quantified)** | **Zeng 2024 MA: SMD=0.19 overall, SMD=0.33 high dose (15 RCTs)** |
| Overall Cognition/Attention/Executive | Moderate | **Weak (downgraded)** | **Zeng 2024 MA: no significant effect (p=0.54-0.86)** |
| Cognitive Function (dementia scales) | Not available | **Moderate (new)** | **Kim 2025 MA: MMSE MD=0.68, ADAS-Cog MD=-1.10 (8 RCTs)** |
| Anti-inflammatory/Antioxidant | Not specifically assessed | **Strong (new)** | **Jafari 2025 MA: hs-CRP, ROS, SOD all significant (70 RCTs)** |
| CVD Risk Factors (lipids/BP) | Moderate | **Weak (downgraded)** | **Jafari 2025 MA: no significant effects (70 RCTs)** |
| Mental Fatigue/Energy | Moderate | Moderate (unchanged) | Kim 2013 RCT |
| Immune Support | Moderate | Moderate (unchanged) | Kenarova 1990 (animal study) |
| Physical Performance | Weak-Moderate | Weak-Moderate (unchanged) | Ellis 2002 (missing PMID) |
| Blood Sugar Regulation | Moderate | **Weak (note: Vuksan 2000 is wrong species)** | Species mismatch flagged |
| Stress Adaptation | Moderate | Moderate (unchanged) | Reay 2010 |
| Safety | Good | Good (3 fabricated citations flagged) | Coon 2002; Izzo 2001 |

## Evidence Gaps Remaining

1. Cochrane review (Geng 2010) is >15 years old — needs updating
2. No ginseng-specific GRADE assessment for cognitive outcomes
3. Cognitive benefits domain-specific: memory yes, attention/executive no
4. No head-to-head comparison of Korean Red Ginseng vs P. quinquefolius vs P. notoginseng
5. Species mismatch in benefit[4] needs resolution (P. quinquefolius cited for P. ginseng)
6. Three fabricated safety citations need replacement with real pharmacovigilance studies
7. Ellis 2002 (benefit[3]) cannot be verified — missing PMID and DOI
8. Immune evidence limited to animal study (Kenarova 1990)
9. CVD MA shows null primary endpoints — anti-inflammatory mechanism without clinical CVD endpoint benefit
10. Long-term cognitive outcome data limited (most studies <12 weeks)

## Clinical Implications

The addition of three systematic evidence papers provides the first quantitative cognitive effect estimates for Panax ginseng. The Zeng 2024 MA is particularly important — it establishes that ginseng's cognitive benefits are domain-specific: memory improves (SMD=0.19, especially at high doses SMD=0.33) but attention and executive function do not. This has direct implications for supplement recommendations: ginseng should be positioned as a memory-supporting supplement rather than a broad cognitive enhancer.

The Kim 2025 MA adds complementary evidence using validated clinical scales (MMSE and ADAS-Cog), confirming benefits specifically in populations with cognitive impairment. The ADAS-Cog result (MD=-1.10, I²=0%) is notable for its consistency across studies.

The Jafari 2025 CVD dose-response MA (70 RCTs, n=4,506) is the largest ginseng supplementation MA to date. It establishes anti-inflammatory and antioxidant mechanisms as the primary CVD pathways (hs-CRP, ROS, SOD significant with dose-response) while definitively showing no effect on traditional CVD risk factors (lipids, BP, glycemia). This refutes some common marketing claims and clarifies ginseng's cardiovascular mechanism of action.

The quality score increase from 81 to 83 reflects substantial new evidence. The tier is maintained at 2 because while evidence is extensive, the mixed cognitive domain results and null CVD primary endpoints prevent Tier 1 upgrade. The species mismatch issues and fabricated safety citations remain important data integrity concerns for future curation.
