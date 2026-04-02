# Evidence Update: Turmeric/Curcumin
## Date: 2026-03-04
## Previous Tier: 1 → Current Tier: 1 (Confirmed)
## Quality Score: 89 → 92 (+3)

---

## Summary

Mode 2 evidence update for Turmeric/Curcumin (ID 2). Searched PubMed and Consensus for new research published after August 2025. Found 24 candidate papers, screened to 6 high-quality inclusions (3 meta-analyses, 1 umbrella review, 1 network meta-analysis, 1 systematic review). Evidence strongly reinforces Tier 1 classification with expanded benefit domains.

---

## New Papers Added (6)

### 1. Wang et al. 2025 — Cognitive Function Meta-Analysis
- **PMID:** 40308636
- **DOI:** 10.1016/j.phymed.2025.156742
- **Type:** Meta-analysis of 9 RCTs
- **Key Finding:** SMD = 0.82 (95% CI: 0.39-1.25, p<0.001) for global cognitive function
- **Assigned to:** Benefits → "Global Cognitive Function"

### 2. Yu et al. 2025 — Cognitive Aging Meta-Analysis
- **PMID:** 40579315
- **DOI:** 10.1002/fsn3.70172
- **Type:** Meta-analysis of 10 RCTs
- **Key Finding:** Working memory SMD = 1.01 in older adults; general cognition SMD = 0.48
- **Assigned to:** Benefits → "Cognitive Aging"

### 3. Xu et al. 2025 — Comprehensive Umbrella Review
- **PMID:** 40538540
- **DOI:** 10.3389/fphar.2025.1584866
- **Type:** Umbrella review (25 meta-analyses)
- **Key Finding:** Significant benefits confirmed for inflammation (CRP, TNF-α, IL-6), metabolic markers, and cognitive outcomes
- **Assigned to:** Mechanisms → "Anti-inflammatory effects" (additional evidence)

### 4. Fan et al. 2026 — Rheumatoid Arthritis Meta-Analysis
- **PMID:** 41601662
- **DOI:** 10.1016/j.jff.2025.106812
- **Type:** Meta-analysis of 6 RCTs
- **Key Finding:** Significant reduction in DAS28 score, CRP, and ESR in RA patients
- **Assigned to:** Benefits → "Rheumatoid Arthritis" (NEW domain)

### 5. Feng et al. 2026 — Network Meta-Analysis
- **PMID:** 41640686
- **DOI:** 10.3389/fnut.2025.1571755
- **Type:** Network meta-analysis (24 RCTs, 1,387 participants)
- **Key Finding:** Curcumin ranked highest for cognitive improvement (SUCRA 89.3%) among plant-based interventions
- **Assigned to:** Benefits → "Working memory improvement" (additional evidence)

### 6. Bahari et al. 2026 — Lipid Profile Meta-Analysis
- **PMID:** 41656101
- **DOI:** 10.1080/10408398.2025.2466128
- **Type:** Systematic review and meta-analysis (27 RCTs)
- **Key Finding:** Significant reductions in TC, LDL-C, and TG in Type 2 diabetes patients
- **Assigned to:** Benefits → "Metabolic Health" (NEW domain)

---

## Evidence Changes

### Strengthened Areas
1. **Cognitive function** — Now supported by 2 new meta-analyses (Wang 2025: SMD=0.82; Yu 2025: SMD=1.01 for working memory). Effect sizes are larger than previously documented.
2. **Anti-inflammatory mechanisms** — Umbrella review (Xu 2025) synthesizes 25 meta-analyses confirming CRP, TNF-α, IL-6 reductions.
3. **Working memory** — Network meta-analysis ranks curcumin highest (SUCRA 89.3%) among 7 plant-based interventions for cognitive improvement.

### New Domains Added
4. **Rheumatoid arthritis** — First meta-analysis-level evidence for RA-specific benefits (Fan 2026, 6 RCTs).
5. **Metabolic health (lipid profile)** — Large meta-analysis (27 RCTs) showing significant lipid improvements in diabetic populations (Bahari 2026).

### Unchanged Areas
- Safety profile: No new safety concerns identified
- Dosage guidance: Remains 500-1000mg daily with piperine
- Mechanisms of action: Confirmed, not substantially changed

---

## Quality Score Breakdown

| Component | Previous | Current | Change |
|-----------|----------|---------|--------|
| Number and quality of RCTs | 26/30 | 28/30 | +2 (more RCTs in new meta-analyses) |
| Presence of meta-analyses | 18/20 | 20/20 | +2 (umbrella review + network meta) |
| Sample sizes | 13/15 | 13/15 | 0 |
| Replication across groups | 13/15 | 13/15 | 0 |
| Consistency of findings | 9/10 | 9/10 | 0 |
| Recency of evidence | 10/10 | 9/10 | -1 (score maintained, span widened) |
| **TOTAL** | **89/100** | **92/100** | **+3** |

---

## Recommendation Impact

- **Tier unchanged:** Tier 1 (Gold Standard) — strongly confirmed
- **Effect sizes updated:** Cognition now SMD=0.82 (moderate-to-large), working memory SMD=1.01 (large)
- **New benefit domains:** Rheumatoid arthritis and metabolic health (lipid profile) added to database
- **No changes to safety profile or dosage guidance**

---

## Data Integrity Fix

During this update, discovered and archived `2_omega_3_fish_oil_enhanced.js` — a legacy file that incorrectly used `supplementId: 2` and `window.enhancedCitations[2]` for Omega-3 data (which is actually ID 4). This file would have overwritten Turmeric's enhanced citations at runtime. The correct Omega-3 data exists in `4_enhanced.js`. Problematic file archived to `data/enhanced_citations/_archive/`.

---

## Files Modified

| File | Action |
|------|--------|
| `data/enhanced_citations/2_enhanced.js` | Added 6 new citations, updated evidenceProfile |
| `data/supplements.js` | Updated ID 2 inline entry (totalCitations, qualityScore, lastEvidenceUpdate, effectSizes, keyCitations) |
| `content/provenance/turmeric_curcumin/search_log.md` | Created |
| `content/provenance/turmeric_curcumin/screening_decisions.md` | Created |
| `content/provenance/turmeric_curcumin/evidence_evaluation.md` | Created |
| `content/provenance/turmeric_curcumin/tier_assignment.md` | Created |
| `content/provenance/turmeric_curcumin/synthesis_notes.md` | Created |
| `data/enhanced_citations/_archive/2_omega_3_fish_oil_enhanced.js.bak` | Archived legacy file |

---

*Generated by supplement-research-pipeline Mode 2 | 2026-03-04*
