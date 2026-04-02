# Rhodiola rosea (ID: 10) — Mode 2 Evidence Update
**Date:** 2026-03-05
**Pipeline:** Mode 2 — Evidence Update
**Phase:** Phase 2, Batch 1
**Operator:** Claude (automated pipeline)

---

## Executive Summary

Rhodiola rosea evidence base updated from 17 to 20 citations. Quality score upgraded from 87 to 89. Physical Performance domain upgraded from Moderate to Strong based on a landmark 26-RCT meta-analysis (Wang et al. 2025). Tier 2 maintained — R. rosea remains a well-evidenced adaptogen but lacks the definitive cross-domain meta-analytic consistency required for Tier 1.

## Search Strategy

### Databases Searched
| Database | Query | Date Range | Results |
|----------|-------|------------|---------|
| PubMed | "Rhodiola rosea systematic review meta-analysis" | 2024-2026 | 5 |
| PubMed | "Rhodiola rosea fatigue stress randomized controlled trial" | 2024-2026 | 2 |
| PubMed | "Rhodiola rosea depression anxiety cognitive" | 2024-2026 | 0 |
| Consensus | "Rhodiola rosea adaptogen stress fatigue cognitive performance clinical trials" | 2024+ | 3 |
| **Total unique** | | | **10** |

### Screening Results

**INCLUDED (3 papers):**

1. **Wang et al. 2025** (PMID: 41080184)
   - *Effect of Rhodiola rosea supplementation on endurance performance: a systematic review and meta-analysis*
   - Frontiers in Nutrition, 12, 1556291
   - DOI: [10.3389/fnut.2025.1556291](https://doi.org/10.3389/fnut.2025.1556291)
   - **Type:** Systematic review + Meta-analysis
   - **Scale:** 26 RCTs, 668 participants
   - **Key findings:** VO2 ES=0.32 (p<0.01), TTE ES=0.38 (p<0.05), TTP ES=-0.40 (p<0.05), TAC ES=0.59, SOD ES=1.16, CK ES=-0.84, Lactate ES=-0.87. Dose-response: >600mg/day greater VO2 improvement.
   - **Impact:** Upgrades Physical Performance domain from Moderate to Strong

2. **Urata et al. 2025** (PMID: 40014460)
   - *Efficacy of Pharmacological Interventions in Milder Depression: A Systematic Review and Network Meta-Analysis*
   - Neuropsychopharmacology Reports, 45(2), e70006
   - DOI: [10.1002/npr2.70006](https://doi.org/10.1002/npr2.70006)
   - **Type:** Systematic review + Network meta-analysis
   - **Scale:** 8 RCTs, 1049 participants
   - **Key findings:** R. rosea demonstrated significant improvements in depressive symptoms vs placebo in network comparison of pharmacological interventions for mild depression
   - **Impact:** Strengthens Mental Health domain evidence base

3. **Schwarz et al. 2024** (PMID: 39601362)
   - *Salidroside and exercise performance in healthy active young adults*
   - Journal of the International Society of Sports Nutrition, 21(1), 2433744
   - DOI: [10.1080/15502783.2024.2433744](https://doi.org/10.1080/15502783.2024.2433744)
   - **Type:** Randomized controlled trial (double-blind, placebo-controlled)
   - **Scale:** 50 participants
   - **Key findings:** Pure biosynthetic salidroside (60mg/day, 16 days) enhanced O2 utilization during HIIT (p<0.01), reduced exercise-induced muscle damage, maintained mood vs placebo decline
   - **Impact:** Supports salidroside as primary ergogenic bioactive; adds mechanistic clarity

**EXCLUDED (4 papers):**

| PMID | Reason |
|------|--------|
| 41535755 | About ginsenosides (ginseng), NOT Rhodiola rosea |
| 40584626 | Rhodiola crenulata (different species), not R. rosea |
| 40098619 | Injectable Rhodiola preparation, not oral supplement |
| 38995860 | Traditional Chinese medicine product (Longgui yangxinwan), not R. rosea |

**Consensus results:** 3 papers found — all narrative reviews or small RCTs not meeting inclusion criteria.

## Evidence Evaluation

### Wang et al. 2025 — Endurance Performance MA
- **GRADE Assessment:** HIGH quality
- **Evidence Level:** Level 1 (SR+MA of RCTs)
- **Risk of Bias:** Low — comprehensive search, quantitative pooling, dose-response subgroup analysis
- **Precision:** Good — 26 RCTs, 668 participants, significant p-values for primary outcomes
- **Consistency:** High — consistent direction across VO2, TTE, TTP, antioxidant, and muscle damage outcomes
- **Directness:** High — directly studies R. rosea supplementation and exercise performance
- **Quality Score:** 9/10

### Urata et al. 2025 — Mild Depression NMA
- **GRADE Assessment:** MODERATE-HIGH quality
- **Evidence Level:** Level 1 (SR+NMA)
- **Risk of Bias:** Low overall, moderate for R. rosea-specific evidence (multi-supplement comparison)
- **Precision:** Good — 8 RCTs, 1049 participants
- **Consistency:** Good — confirms earlier single-supplement depression RCTs
- **Directness:** Moderate — R. rosea is one of several supplements analyzed
- **Quality Score:** 7/10

### Schwarz et al. 2024 — Salidroside RCT
- **GRADE Assessment:** MODERATE quality
- **Evidence Level:** Level 2 (RCT)
- **Risk of Bias:** Low — double-blind, placebo-controlled, randomized
- **Precision:** Moderate — n=50, adequate for exploratory RCT
- **Consistency:** Good — aligns with R. rosea extract performance MA findings
- **Directness:** Moderate — pure salidroside ≠ whole R. rosea extract; dose (60mg) is 10-30x higher than typical R. rosea extract salidroside content
- **Quality Score:** 7/10

## Tier Assessment

### Decision: MAINTAIN Tier 2
**Rationale:**
1. The Wang 2025 MA substantially strengthens Physical Performance evidence (26 RCTs, quantitative effect sizes, dose-response) — upgrades domain to Strong
2. The Urata 2025 NMA provides additional meta-analytic support for depression benefits, but R. rosea is one of several supplements compared (not a dedicated R. rosea depression MA)
3. No dedicated large-scale MA exists for R. rosea's primary use case (stress/anxiety/adaptogenic effects) — this remains the key gap preventing Tier 1
4. Salidroside RCT confirms mechanistic pathway but uses isolated compound at supraphysiological doses relative to whole extract

### Quality Score Change: 87 → 89
- +2 from Wang 2025 (landmark 26-RCT endurance MA with comprehensive dose-response data)
- No additional points from Urata 2025 (multi-supplement NMA, R. rosea not primary focus)
- No additional points from Schwarz 2024 (isolated compound, mechanistic support only)

## Files Modified

| File | Changes |
|------|---------|
| `data/enhanced_citations/10_enhanced.js` | Added 3 new citations (mech_003b, ben_004b, ben_005b); updated quality 87→89, citations 17→20, publicationSpan 2003→2025; Physical Performance upgraded Moderate→Strong |
| `data/supplements.js` (ID 10) | Fixed duplicate isEnhanced keys; replaced generic keyCitations with real DOIs/PMIDs; fixed lastUpdated→lastEvidenceUpdate; updated quality 85→89, citations 15→20; added 6 quantitative effectSizes |
| `data/enhanced_citations/10_rhodiola_rosea_enhanced.js` | DELETED (archived to _archive/). Was duplicate with conflicting Tier 1 claim and runtime window.enhancedCitations[10] collision |
| `content/research-updates/2026-03-05_rhodiola_rosea_update.md` | This change report |

## Structural Fixes Applied

1. **Duplicate isEnhanced keys** (supplements.js lines 824-825): Two `"isEnhanced": true` keys incorrectly placed inside `primaryBenefits` object at wrong indentation. Removed and repositioned as top-level property.
2. **Generic keyCitations** replaced: `"authors": "Multiple systematic reviews", "doi": "Various"` replaced with real Wang 2025 (PMID 41080184) and Ivanova Stojcheva 2022 (PMID 35744937).
3. **Field name fix**: `"lastUpdated"` → `"lastEvidenceUpdate"` (schema compliance).
4. **Quality score sync**: supplements.js had 85, enhanced file had 87. Both now synced to 89.
5. **Citation count sync**: supplements.js had 15, enhanced file had 17. Both now synced to 20.
6. **Duplicate file archived**: `10_rhodiola_rosea_enhanced.js` (claimed Tier 1, quality 86, 15 citations) — conflicted with primary file's Tier 2, quality 87, 17 citations. Archived to `_archive/10_rhodiola_rosea_enhanced.js.bak`.

## Domain Evidence Summary (Post-Update)

| Domain | Previous Strength | Updated Strength | Key Evidence |
|--------|------------------|------------------|--------------|
| Fatigue & Energy | Strong | Strong (unchanged) | RCTs: Olsson 2009, Lekomtseva 2017 |
| Stress Management | Strong | Strong (unchanged) | Edwards 2012, Ivanova Stojcheva 2022 SR |
| Cognitive Performance | Moderate | Moderate (unchanged) | Lu 2022 SR (15 studies) |
| Mental Health/Depression | Strong | Strong (strengthened) | Darbinyan 2007 RCT + **Urata 2025 NMA** |
| Physical Performance | Moderate | **Strong (upgraded)** | Tinsley 2024 SR + **Wang 2025 MA (26 RCTs)** |
| Chronic Fatigue | Strong | Strong (unchanged) | Lekomtseva 2017 (n=100) |

## Evidence Gaps Remaining

1. No dedicated R. rosea stress/anxiety meta-analysis with quantitative pooling
2. No long-term safety MA (>12 weeks)
3. Limited bioavailability pharmacokinetic data for rosavins
4. No head-to-head comparison MA with other adaptogens (ashwagandha, etc.)
5. Salidroside dose-response relationship in whole extract vs isolated compound unclear
