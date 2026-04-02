# Lion's Mane Mushroom (ID: 11) — Mode 2 Evidence Update
**Date:** 2026-03-05
**Pipeline:** Mode 2 — Evidence Update
**Phase:** Phase 2, Batch 1
**Operator:** Claude (automated pipeline)

---

## Executive Summary

Lion's Mane Mushroom evidence base updated from 15 to 16 citations. Quality score reconciled from 92 (inflated) to 88 (base 87 from supplements.js + 1 from new PRISMA SR). **Tier downgraded from 1 to 2** — the Tier 1 designation was unsupported given no meta-analysis with pooled estimates exists and all human RCTs have small sample sizes (n≤41). Major finding: Menon et al. 2025 PRISMA SR (PROSPERO registered, CRD42024571250) compiles 5 RCTs + 3 pilot clinical trials with combined MMSE weighted mean increase of +1.17. Evidence remains consistent and positive across cognitive enhancement, neuroprotection, mood, and gut health domains but lacks the meta-analytic rigor required for Tier 1.

**Critical data integrity fix:** Duplicate enhanced file `11_lions_mane_enhanced.js` archived — contained 11 fabricated PMIDs (sequential numbers: 28456789–38456789) and caused runtime collision with primary file `11_enhanced.js` at `window.enhancedCitations[11]`.

## Search Strategy

### Databases Searched
| Database | Query | Date Range | Results |
|----------|-------|------------|---------|
| PubMed | "Hericium erinaceus lion's mane systematic review meta-analysis" | 2024-2026 | 0 |
| PubMed | "Hericium erinaceus systematic review" | 2024-2026 | 5 |
| PubMed | "lion's mane mushroom clinical trial randomized controlled" | 2024-2026 | 1 |
| Consensus | "lion's mane mushroom Hericium erinaceus cognitive function neuroprotection clinical trials evidence" | 2024+ | 3 |
| **Total screened** | | | **9** |

### Screening Results

**INCLUDED (1 paper):**

1. **Menon et al. 2025** (PMID: 40959699)
   - *Benefits, side effects, and uses of Hericium erinaceus as a supplement: a systematic review*
   - Frontiers in Nutrition, 12, 1641246
   - DOI: [10.3389/fnut.2025.1641246](https://doi.org/10.3389/fnut.2025.1641246)
   - **Type:** PRISMA-compliant Systematic Review, PROSPERO registered (CRD42024571250)
   - **Scale:** 5 RCTs, 3 pilot clinical trials, 15 laboratory studies, 1 cohort study, 1 case report
   - **Quality assessment:** ROBIS tool applied for bias evaluation
   - **Key findings:** Combined weighted mean MMSE increase of +1.17 in intervention group; erinacine A inhibited cancer cell invasiveness; increased gut microbiota diversity and SCFA-producing bacteria; enhanced pro-BDNF and BDNF production; improved depression, anxiety, binge eating, and sleep symptoms
   - **Impact:** Most comprehensive Lion's Mane SR to date; PROSPERO registered adds methodological credibility

**EXCLUDED (8 papers):**

| PMID/Source | Reason |
|-------------|--------|
| 40626304 | Spangenberg 2025 — SR of erinacines in preclinical models only, no human data |
| 40289452 | Gong 2025 — SR of multiple edible fungi as antidepressants, Lion's Mane one of several |
| 38539908 | Mohd Hisam & Wong 2024 — SCA3 TCM herbal remedies review, Lion's Mane minor component |
| 41562932 | Taib et al. 2026 — Mushrooms for peripheral nerve injury, preclinical only, LM 2 of 11 studies |
| 37561965 | Nieman et al. 2023 — Scoping review of 16 dietary ingredients, LM minor component |
| Consensus #1 | Komoń 2024 — Small narrative review of 4 studies, limited scope |
| Consensus #2 | Surendran 2025 — Acute RCT n=18, mostly null results, underpowered |
| Consensus #3 | Menon 2025 — Same as PMID 40959699 (duplicate from PubMed search) |

## Evidence Evaluation

### Menon et al. 2025 — PRISMA Systematic Review
- **GRADE Assessment:** Not formally performed in paper; evidence certainty is LOW to MODERATE based on included study quality
- **Evidence Level:** Level 1 (PRISMA SR with PROSPERO registration)
- **Risk of Bias:** Moderate — ROBIS tool used; included studies have variable quality
- **Precision:** Limited — RCTs are small (n=31-41); no pooled meta-analytic estimates
- **Consistency:** Good — all human studies show positive direction for cognition
- **Directness:** High — directly studies H. erinaceus supplementation in humans
- **Limitations:** Combined weighted mean from only 1 RCT + 1 PCT for MMSE; no proper meta-analysis with heterogeneity assessment
- **Quality Score:** 7/10

## Tier Assessment

### Decision: DOWNGRADE Tier 1 → Tier 2
**Rationale:**
1. **No meta-analysis exists** — Tier 1 requires multiple meta-analyses or Cochrane reviews with consistent strong findings; Lion's Mane has zero meta-analyses
2. **Small RCTs** — All human RCTs have n≤41 (Mori 2009 n=31, Saitsu 2019 n=elderly, Li 2020 n=41, Docherty 2023 n=41)
3. **No Cochrane review** — Unlike Tier 1 supplements (e.g., Omega-3, Melatonin) which have Cochrane reviews
4. **Tier 2 criteria met** — Multiple RCTs (4+) with consistent positive findings, 1 PRISMA SR, strong mechanistic evidence
5. **Previous Tier 1 designation inflated** — The enhanced file's Tier 1 claim was not supported by the evidence quality; supplements.js correctly had Tier 3 (now upgraded to 2)
6. The consistent positive direction across cognitive, mood, and gut health domains plus PRISMA SR registration supports upgrade from Tier 3 to Tier 2

### Quality Score Change: 92 → 88 (reconciled)
- supplements.js had 87 (more conservative and appropriate)
- 11_enhanced.js had 92 (inflated — no meta-analysis to justify)
- Base: 87 (supplements.js value)
- +1 from Menon 2025 (PRISMA SR with PROSPERO registration, most comprehensive LM SR to date)
- Final: 88

## Files Modified

| File | Changes |
|------|---------|
| `data/enhanced_citations/11_enhanced.js` | Added Menon 2025 as benefit citation (lions_mane_ben_007); quality 92→88; Tier 1→Tier 2; citations 14→16 (count corrected); publicationSpan "2013-2023"→"2013-2025"; clinicalBenefits "Strong"→"Moderate"; researchMaturity "Advanced"→"Developing"; added keyFindings, evidenceGaps, mode2UpdateLog |
| `data/enhanced_citations/11_lions_mane_enhanced.js` | **ARCHIVED** to `_archive/11_lions_mane_enhanced.js.ARCHIVED` — contained 11 fabricated PMIDs (sequential: 28456789–38456789), legacy claim/details schema, runtime collision at window.enhancedCitations[11] |
| `data/supplements.js` (ID 11) | Fixed duplicate isEnhanced keys (2x inside primaryBenefits → 1x at top level); evidenceTier 3→2; replaced generic effectSizes with 4 quantitative entries; replaced generic keyCitation with Menon 2025 + Docherty 2023; lastUpdated→lastEvidenceUpdate; quality 87→88; citations 15→16; added cognitive/nonCognitive benefit entries |
| `content/research-updates/2026-03-05_lions_mane_update.md` | This change report |

## Structural Fixes Applied

1. **Duplicate isEnhanced keys** (supplements.js lines 911-912): Two `"isEnhanced": true` entries incorrectly inside `primaryBenefits`. Removed both, placed single `isEnhanced: true` at top level before primaryBenefits.
2. **Tier inflation corrected**: Enhanced file claimed Tier 1 without meta-analytic support. Corrected to Tier 2. supplements.js Tier 3 upgraded to Tier 2 (justified by 4 RCTs + 1 PRISMA SR).
3. **Quality score reconciled**: 92 (enhanced) vs 87 (supplements.js). Reconciled to 88 (base 87 + 1 from new SR evidence).
4. **Citation count corrected**: Enhanced file claimed 14 but actually contained 15 (4+6+3+2). Updated to 16 after adding Menon 2025.
5. **Generic effectSizes replaced**: "Small (preliminary human data)" → quantitative values with specific study references and effect estimates.
6. **Duplicate enhanced file archived**: `11_lions_mane_enhanced.js` with fabricated PMIDs moved to `_archive/` — this file was using legacy claim/details schema, had all sequential fake PMIDs, and caused runtime collision with the primary canonical file.
7. **Field name corrected**: `lastUpdated` → `lastEvidenceUpdate` for schema consistency.

## Domain Evidence Summary (Post-Update)

| Domain | Previous Strength | Updated Strength | Key Evidence |
|--------|------------------|------------------|--------------|
| Cognitive Enhancement (healthy) | Moderate | Moderate (unchanged) | Docherty 2023 RCT (n=41): acute Stroop improvement |
| Cognitive Enhancement (MCI) | Moderate | Moderate (unchanged) | Saitsu 2019 RCT: MMSE improvement |
| Alzheimer's Prevention | Moderate | Moderate (unchanged) | Li 2020 RCT (n=41, 49 weeks): MMSE + CASI improvement |
| NGF Stimulation | Strong (preclinical) | Strong (unchanged) | Phan 2013, Szućko-Kociuba 2023 |
| BBB Penetration | Strong (preclinical) | Strong (unchanged) | Hu 2019, Tsai 2021: erinacine A bioavailability 24.39% |
| Neuroprotection (PD model) | Moderate (preclinical) | Moderate (unchanged) | Kuo 2016: MPTP model protection |
| Mood / Depression | Moderate (animal) | Moderate (unchanged) | Ryu 2018: hippocampal neurogenesis |
| Comprehensive SR | Not available | **Moderate (new)** | **Menon 2025 PRISMA SR: MMSE +1.17, gut + mood + cognition** |
| Safety | Well-established | Well-established | NOAEL >2000mg/kg, 49-week safety data |

## Evidence Gaps Remaining

1. No meta-analysis with pooled effect estimates exists — critical gap for Tier 1 upgrade
2. All RCTs small (n≤41) — multi-center trials with n≥100 needed
3. No Cochrane review for any Lion's Mane indication
4. Long-term cognitive outcomes (>1 year) not established
5. Fruiting body vs mycelia extract not systematically compared in humans
6. Dose-response not characterized (current range 350-3000mg daily)
7. Disease-specific efficacy (healthy vs MCI vs AD) not compared head-to-head

## Clinical Implications

The Menon 2025 PRISMA SR provides the most comprehensive systematic evaluation of Lion's Mane evidence to date, confirming consistent positive effects across cognitive, mood, gut health, and neuroprotection domains. However, the evidence remains limited by small sample sizes — the combined MMSE weighted mean increase of +1.17 comes from just 1 RCT + 1 pilot clinical trial, and no proper meta-analytic pooling with heterogeneity assessment has been performed.

The tier downgrade from 1 to 2 reflects appropriate evidence calibration: Lion's Mane has compelling mechanistic evidence (NGF stimulation, BBB penetration, erinacine bioavailability) and consistent positive clinical signals, but the human evidence base is not yet at the standard of supplements with multiple large meta-analyses (e.g., Omega-3, Melatonin, Creatine). A well-powered meta-analysis pooling the 5+ existing RCTs would be the single most impactful next step for the Lion's Mane evidence base.

The archival of the duplicate file with fabricated PMIDs (11_lions_mane_enhanced.js) eliminates a significant data integrity issue — sequential PMIDs (28456789 through 38456789) are clearly fabricated and the runtime collision at `window.enhancedCitations[11]` meant the duplicate would overwrite the verified primary file depending on load order.
