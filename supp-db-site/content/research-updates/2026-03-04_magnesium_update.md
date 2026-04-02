# Evidence Update: Magnesium
## Date: 2026-03-04
## Previous Tier: 2 → Current Tier: 1 (UPGRADED)
## Quality Score: 78 → 90 (+12)

---

## Summary

Mode 2 evidence update for Magnesium (ID 6). Searched PubMed and Consensus for new research published after August 2025. Found ~98 candidate papers from PubMed, screened 20, selected 5 high-quality inclusions (4 meta-analyses, 1 systematic review & meta-analysis). Evidence strongly supports upgrade to Tier 1 with new large meta-analyses for blood pressure (38 RCTs) and glycemic control (23 RCTs), plus new metabolic health and anti-inflammatory domains.

Additionally, a stub file `6_magnesium_enhanced.js` was discovered with empty citation arrays that would overwrite real data at runtime. It was archived to `_archive/`.

---

## New Papers Added (5)

### 1. Argeros et al. 2025 — Blood Pressure Meta-Analysis
- **PMID:** 41000008
- **DOI:** 10.1161/HYPERTENSIONAHA.125.25129
- **Type:** Meta-analysis of 38 RCTs (2,709 participants)
- **Key Finding:** SBP -2.81 mmHg (95% CI: -4.32 to -1.29), DBP -2.05 mmHg. Hypertensive on medication: SBP -7.68 mmHg. Hypomagnesemia: SBP -5.97 mmHg.
- **Assigned to:** Benefits → "Blood Pressure" (UPDATES existing evidence)

### 2. Maqrashi et al. 2025 — T2DM Glycemic Control Meta-Analysis
- **PMID:** 40641714
- **DOI:** 10.18295/2075-0528.2848
- **Type:** Meta-analysis of 23 RCTs (1,345 participants)
- **Key Finding:** FBG WMD=-0.58, serum Mg WMD=0.69. HbA1c reduction minimal (WMD=-0.16). Greater HbA1c effect in ≥65 years and longer supplementation.
- **Assigned to:** Benefits → "Glycemic Control in T2DM" (NEW domain)

### 3. Basit et al. 2026 — Prediabetes Glycemic Meta-Analysis
- **PMID:** 41641401
- **DOI:** 10.1007/s40200-025-01853-9
- **Type:** Systematic review & meta-analysis of 5 RCTs (384 participants)
- **Key Finding:** 2-hour OGTT glucose MD -0.99 mmol/L (p<0.00001), HOMA-IR MD -1.10 (p=0.03), TG -14.57 mg/dL, HDL-C +3.87 mg/dL.
- **Assigned to:** Benefits → "Prediabetes Glycemic Control" (NEW domain)

### 4. Cepeda et al. 2025 — Oxidative Stress and Inflammation SR/MA
- **PMID:** 40563371
- **DOI:** 10.3390/antiox14060740
- **Type:** Systematic review & meta-analysis of 28 studies
- **Key Finding:** Significant CRP reduction (anti-inflammatory). No conclusive impact on direct oxidative stress biomarkers (NO, TAC, MDA, GSH).
- **Assigned to:** Mechanisms → "Anti-inflammatory activity" (NEW mechanism)

### 5. Wang et al. 2025 — Metabolic Syndrome Inflammation Meta-Analysis
- **PMID:** 41245414
- **DOI:** 10.3389/fnut.2025.1692937
- **Type:** Systematic review & meta-analysis of 8 RCTs (444 participants)
- **Key Finding:** CRP SMD=-0.327 (95% CI: -0.602 to -0.053, p=0.048). Better in women, at 12-16 weeks, tablet/capsule form.
- **Assigned to:** Benefits → "Metabolic Syndrome Inflammation" (NEW domain)

---

## Evidence Changes

### Tier Upgrade: Tier 2 → Tier 1
The previous Tier 2 classification was conservative. With this update, Magnesium now has:
- 38-RCT meta-analysis for blood pressure (Argeros 2025, published in Hypertension)
- 23-RCT meta-analysis for T2DM glycemic control (Maqrashi 2025)
- Multiple meta-analyses across cardiovascular, metabolic, and inflammatory domains
- Consistent replication across independent international groups
- Well-established safety profile spanning decades of research

### Strengthened Areas
1. **Blood pressure** — Now supported by a definitive 38-RCT meta-analysis (n=2709) showing SBP -2.81 mmHg overall, with clinically significant reductions in hypertensive patients (-7.68 mmHg) and hypomagnesemic patients (-5.97 mmHg).

### New Domains Added
2. **Glycemic control (T2DM)** — First large meta-analysis (23 RCTs, n=1345) showing FBG reduction; greater HbA1c improvement in elderly patients.
3. **Glycemic control (prediabetes)** — Meta-analysis showing significant HOMA-IR and OGTT improvements, plus lipid benefits (TG reduction, HDL increase).
4. **Anti-inflammatory mechanism** — Systematic review (28 studies) confirming CRP reduction as anti-inflammatory mechanism, bridging cardiovascular and metabolic benefits.
5. **Metabolic syndrome inflammation** — Meta-analysis of 8 RCTs specifically in metabolic syndrome, showing CRP reduction with sex-specific and duration-dependent effects.

### Unchanged Areas
- Sleep quality evidence: Remains as previously documented (no new meta-analyses found after 2025)
- Anxiety/stress evidence: Unchanged
- Depression evidence: Unchanged
- Safety profile: No new safety concerns identified
- Dosage guidance: Remains 200-400mg daily elemental magnesium

---

## Quality Score Breakdown

| Component | Previous | Current | Change |
|-----------|----------|---------|--------|
| Number and quality of RCTs | 22/30 | 26/30 | +4 (38-RCT BP MA, 23-RCT T2DM MA) |
| Presence of meta-analyses | 16/20 | 20/20 | +4 (5 new MAs across domains) |
| Sample sizes | 11/15 | 13/15 | +2 (2709 for BP, 1345 for T2DM) |
| Replication across groups | 12/15 | 13/15 | +1 (new international groups) |
| Consistency of findings | 8/10 | 9/10 | +1 (consistent for BP, glycemic) |
| Recency of evidence | 9/10 | 9/10 | 0 (maintained) |
| **TOTAL** | **78/100** | **90/100** | **+12** |

---

## Recommendation Impact

- **Tier UPGRADED:** Tier 2 → Tier 1 (Gold Standard)
- **Effect sizes updated:** Blood pressure SBP -2.81 mmHg (38 RCTs); glycemic control FBG WMD=-0.58 (23 RCTs); inflammation CRP SMD=-0.327
- **New benefit domains:** Glycemic control (T2DM), glycemic control (prediabetes), metabolic syndrome inflammation
- **New mechanism:** Anti-inflammatory activity (CRP reduction) confirmed via systematic review
- **No changes to safety profile or dosage guidance**

---

## Data Integrity Fix

During this update, discovered and archived `6_magnesium_enhanced.js` — a stub file with empty `citations.mechanisms`, `citations.benefits`, and `citations.safety` arrays that claimed Tier 1/quality 90. This file used a direct `window.enhancedCitations[6] = {...}` assignment that would overwrite the real data from `6_enhanced.js` at runtime. Archived to `data/enhanced_citations/_archive/6_magnesium_enhanced.js.bak`.

---

## Files Modified

| File | Action |
|------|--------|
| `data/enhanced_citations/6_enhanced.js` | Updated evidenceProfile (Tier 1, quality 90), added 5 new citations (1 mechanism, 3 benefits, 1 benefit update) |
| `data/supplements.js` | Updated ID 6 inline entry (tier 2→1, totalCitations 16→21, qualityScore 78→90, lastEvidenceUpdate, effectSizes, keyCitations, primaryBenefits, studyPopulations, mechanismsOfAction) |
| `data/enhanced_citations/_archive/6_magnesium_enhanced.js.bak` | Archived dangerous stub file |
| `content/provenance/magnesium/search_log.md` | Created |
| `content/provenance/magnesium/screening_decisions.md` | Created |
| `content/provenance/magnesium/evidence_evaluation.md` | Created |
| `content/provenance/magnesium/tier_assignment.md` | Created |
| `content/provenance/magnesium/synthesis_notes.md` | Created |

---

*Generated by supplement-research-pipeline Mode 2 | 2026-03-04*
