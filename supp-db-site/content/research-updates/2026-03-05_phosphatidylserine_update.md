# Phosphatidylserine (ID: 12) — Mode 2 Evidence Update
**Date:** 2026-03-05
**Pipeline:** Mode 2 — Evidence Update
**Phase:** Phase 2, Batch 1
**Operator:** Claude (automated pipeline)

---

## Executive Summary

Phosphatidylserine evidence base updated from 12 to 13 citations. Quality score adjusted from 85 to 86 (base 85 + 1 from new NMA evidence). **Tier upgraded from 3 to 2** — multiple RCTs (Duan n=190, Doma n=138, Kato-Kataoka n=78, Hirayama n=36) with consistent positive cognitive findings justify Tier 2, and Tier 3 designation was too conservative. Major finding: Zhou et al. 2024 PROSPERO-registered Network Meta-analysis (48 RCTs, n=3650) ranks PS #1 among 12 antioxidant drugs for ADHD-RS Parent attention score (SUCRA 0.39) and total score (SUCRA 0.34).

**Critical data integrity fixes:** (1) Duplicate enhanced file `12_enhanced.js` archived — contained **Lion's Mane data incorrectly assigned to Phosphatidylserine's ID 12 slot** (third LM file in codebase), causing runtime collision at `window.enhancedCitations[12]`. (2) Wrong dosage citation flagged — `ps_dosage_1` references a huperzine A meta-analysis (Wang BS 2009), not a phosphatidylserine study.

## Search Strategy

### Databases Searched
| Database | Query | Date Range | Results |
|----------|-------|------------|---------|
| PubMed | "phosphatidylserine systematic review meta-analysis cognitive function" | 2024-2026 | 0 |
| PubMed | "phosphatidylserine systematic review" | 2024-2026 | 8 |
| PubMed | "phosphatidylserine supplementation cognitive RCT meta-analysis" | 2024-2026 | 0 |
| Consensus | "phosphatidylserine supplementation cognitive function clinical trials evidence" | 2024+ | 3 |
| **Total screened** | | | **11** |

### Screening Results

**INCLUDED (1 paper):**

1. **Zhou et al. 2024** (PMID: 38547138)
   - *Safety and efficacy of antioxidant therapy in children and adolescents with attention deficit hyperactivity disorder: A systematic review and network meta-analysis*
   - PLoS One, 19(3), e0296926
   - DOI: [10.1371/journal.pone.0296926](https://doi.org/10.1371/journal.pone.0296926)
   - **Type:** PRISMA-compliant SR + Network Meta-analysis, PROSPERO registered (CRD42023382824)
   - **Scale:** 48 RCTs, 3650 patients, 12 antioxidant drugs
   - **Key findings:** PS ranked #1 for ADHD-RS Parent attention score (SUCRA 0.39) and total score (SUCRA 0.34); PS+omega-3 most effective for CTRS hyperactivity (SUCRA 0.26)
   - **Impact:** First NMA ranking PS against other antioxidant ADHD interventions; strengthens ADHD evidence domain

**EXCLUDED (10 papers):**

| PMID/Source | Reason |
|-------------|--------|
| 39501272 | Wanders 2024 — PHARC syndrome genetics, not PS supplementation |
| 38796445 | Yun 2024 — Cancer lipid profiling, PS as biomarker not supplement |
| 40005694 | Tavares-Junior 2025 — Post-COVID SFN, PS minor treatment component |
| 41517557 | Gwala 2025 — β-Thalassemia RBC biomarkers, PS exposure not supplementation |
| 40154506 | Gu 2025 — RBC thrombosis PS exposure mechanism, not supplementation |
| 41350450 | Orso 2025 — Galactagogues, silymarin+PS combination, PS minor component |
| 40988951 | Guo 2025 — Liver disease phospholipids, PS as biomarker |
| Consensus #1 | Duan 2024 — already in enhanced citations file as ps_benefit_1 |
| Consensus #2 | Pucci 2025 — multicomponent formula, observational n=30, underpowered |
| Consensus #3 | Gualtieri 2025 — review of reviews, PS one of many supplements |

## Evidence Evaluation

### Zhou et al. 2024 — ADHD Antioxidant NMA
- **GRADE Assessment:** Not formally performed; confidence per SUCRA rankings
- **Evidence Level:** Level 1 (SR+NMA with PROSPERO registration)
- **Risk of Bias:** Moderate — Cochrane RoB-2 applied; variable included study quality
- **Precision:** Excellent — 48 RCTs, n=3650 (though PS-specific subset smaller)
- **Consistency:** Good — PS consistently ranked top across multiple ADHD outcome measures
- **Directness:** Moderate — PS is one of 12 antioxidant drugs compared; not PS-specific NMA
- **Limitations:** PS ranking based on limited PS-specific RCTs within larger NMA; ADHD focus only
- **Quality Score:** 7/10

## Tier Assessment

### Decision: UPGRADE Tier 3 → Tier 2
**Rationale:**
1. **Multiple RCTs with consistent positive findings** — Duan 2025 (n=190, 12 months), Doma 2023 (n=138), Kato-Kataoka 2010 (n=78), Hirayama 2014 (n=36), Baumeister 2008
2. **NMA evidence** — Zhou 2024 ranks PS #1 for ADHD attention among 12 drugs in 48-RCT NMA
3. **Strong mechanistic evidence** — Multiple reviews confirm membrane function, neurotransmitter support, anti-inflammatory neuroprotection
4. **Well-established safety** — Vakhapova 2011 (n=157) and Hellhammer 2014 (n=75) confirm excellent safety
5. **Previous Tier 3 designation too conservative** — Evidence base exceeds Tier 3 criteria (limited human studies); multiple RCTs across populations (elderly MCI, healthy adults, children with ADHD, stressed adults) justify Tier 2
6. **supplements.js already had Tier 2** — enhanced file's Tier 3 was inconsistent with supplements.js Tier 2

### Quality Score Change: 85 → 86
- Base: 85 (enhanced file value, appropriate for current evidence)
- +1 from Zhou 2024 (48-RCT NMA with PROSPERO registration, ranks PS #1 for ADHD attention)
- Final: 86
- Note: No PS-specific meta-analysis with pooled cognitive estimates exists, which limits quality ceiling

## Files Modified

| File | Changes |
|------|---------|
| `data/enhanced_citations/phosphatidylserine_enhanced.js` | Added Zhou 2024 NMA as ps_benefit_5; Tier 3→2; quality 85→86; citations 12→13; added keyFindings, evidenceGaps, mode2UpdateLog; flagged wrong dosage citation (huperzine A paper); updated qualityAssurance metrics |
| `data/enhanced_citations/12_enhanced.js` | **ARCHIVED** to `_archive/12_enhanced.js.ARCHIVED` — contained Lion's Mane data incorrectly at PS ID 12 slot (variable: lionsManeLHericiumErinaceusEnhanced, name: "Lion's Mane"), causing runtime collision at window.enhancedCitations[12]. Third Lion's Mane enhanced file found in codebase. |
| `data/supplements.js` (ID 12) | Fixed duplicate isEnhanced keys (2x inside primaryBenefits → 1x at top level); replaced generic keyCitations with Zhou 2024 + Duan 2025; replaced generic effectSizes with 4 quantitative entries; added evidenceProfile block; added ADHD to cognitive benefits and studyPopulations; expanded evidenceTierRationale |
| `content/research-updates/2026-03-05_phosphatidylserine_update.md` | This change report |

## Structural Fixes Applied

1. **Duplicate isEnhanced keys** (supplements.js lines 976-977): Two `"isEnhanced": true` entries incorrectly inside `primaryBenefits`. Removed both plus third instance inside `enhancedCitations` block. Placed single `isEnhanced: true` at top level before `primaryBenefits`.
2. **Misassigned enhanced file archived**: `12_enhanced.js` contained Lion's Mane data (variable `lionsManeLHericiumErinaceusEnhanced`, name "Lion's Mane", quality 85, Tier 1) at Phosphatidylserine's ID 12 slot. Archived to `_archive/12_enhanced.js.ARCHIVED`. This is the third Lion's Mane enhanced file found in the codebase (after `11_enhanced.js` canonical and `11_lions_mane_enhanced.js` previously archived).
3. **Wrong dosage citation flagged**: `ps_dosage_1` references Wang BS et al. 2009 "Efficacy and safety of natural acetylcholinesterase inhibitor huperzine A" — a huperzine A meta-analysis, not phosphatidylserine. Flagged with `_INTEGRITY_FLAG` annotation. Actual PS dosage guidance derived from clinical RCTs (100-300mg/day per Kato-Kataoka 2010, Vakhapova 2011).
4. **Tier reconciliation**: Enhanced file had Tier 3, supplements.js had Tier 2. Resolved to Tier 2 (justified by evidence evaluation).
5. **Generic keyCitations replaced**: `"authors": "Multiple studies"`, `"year": "2010-2020"`, `"doi": "Various"` replaced with properly cited Zhou 2024 and Duan 2025.
6. **Generic effectSizes replaced**: `"Small to moderate (d=0.3-0.5)"` and `"Moderate reduction"` replaced with 4 quantitative entries with specific study references.
7. **Missing evidenceProfile added**: supplements.js had no evidenceProfile block. Created with quality 86, citations 13, Tier 2, lastEvidenceUpdate 2026-03-05.

## Domain Evidence Summary (Post-Update)

| Domain | Previous Strength | Updated Strength | Key Evidence |
|--------|------------------|------------------|--------------|
| Cognitive Enhancement (MCI) | Moderate | Moderate (unchanged) | Duan 2025 RCT (n=190): memory improvement over 12 months |
| Cognitive Enhancement (healthy) | Moderate | Moderate (unchanged) | Doma 2023 RCT (n=138): working memory improvement |
| Memory (elderly) | Moderate | Moderate (unchanged) | Kato-Kataoka 2010 RCT (n=78): dose-dependent verbal recall |
| ADHD | Moderate (single RCT) | **Moderate-Strong (strengthened)** | **Zhou 2024 NMA: PS #1 for attention (SUCRA 0.39) + Hirayama 2014 RCT (n=36)** |
| Stress/Cortisol | Moderate | Moderate (unchanged) | Baumeister 2008, Hellhammer 2014 RCTs |
| Neuroprotection (mechanistic) | Strong | Strong (unchanged) | Kim 2014, Ma 2022, Glade 2015 reviews |
| Safety | Well-established | Well-established (unchanged) | Vakhapova 2011 (n=157), Hellhammer 2014 (n=75) |

## Evidence Gaps Remaining

1. No PS-specific meta-analysis with pooled cognitive effect estimates exists — critical gap
2. All PS-only RCTs have moderate sample sizes (n≤190); multi-center large-scale trials needed
3. No Cochrane review for any PS indication
4. Soy-derived vs sunflower-derived PS not systematically compared in humans
5. Long-term cognitive outcomes (>1 year) limited to single study (Duan 2025)
6. ADHD evidence relies on single small RCT (n=36) + NMA ranking; dedicated PS-ADHD trials needed
7. Wrong dosage citation in enhanced file needs replacement with actual PS dosage study
8. Dose-response relationship not formally characterized in meta-analytic framework

## Clinical Implications

The Zhou 2024 NMA provides the first systematic ranking of PS against other antioxidant interventions for ADHD, positioning PS as the top-ranked intervention for parent-rated attention symptoms. While PS was only one of 12 antioxidant drugs compared (and the NMA was not PS-specific), the SUCRA ranking of 0.39 for attention and 0.34 for total symptoms across 48 RCTs provides stronger evidence than the single Hirayama 2014 RCT (n=36) alone.

The tier upgrade from 3 to 2 reflects appropriate evidence calibration: PS has multiple RCTs across diverse populations (elderly MCI, healthy adults with memory concerns, children with ADHD, stressed adults) with consistent positive cognitive and stress-modulation findings, plus strong mechanistic evidence from multiple review papers. The evidence base exceeds Tier 3 criteria but lacks the meta-analytic rigor (no PS-specific pooled estimates) required for Tier 1.

The archival of `12_enhanced.js` (containing Lion's Mane data at PS's ID 12 slot) eliminates the third instance of misassigned Lion's Mane data in the codebase — a systematic data integrity issue where Lion's Mane files were created at wrong ID positions. The flagging of the wrong dosage citation (huperzine A paper) highlights the need for citation verification in the original data generation process.
