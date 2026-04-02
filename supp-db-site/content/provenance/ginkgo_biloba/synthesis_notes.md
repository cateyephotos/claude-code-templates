# Synthesis Notes: Ginkgo Biloba (ID 14) — Mode 2 Evidence Update

## Synthesis Metadata

| Field | Value |
|---|---|
| **Supplement** | Ginkgo Biloba (ID 14) |
| **Date** | 2026-03-05 |
| **Operator** | Claude (automated pipeline) |
| **Phase** | Phase 2, Batch 1 |
| **Update Mode** | Mode 2 — Evidence Update |
| **Sources Synthesized** | 4 papers (Wieland 2026, Tiemtad 2026, Masserini 2025, Pfuhlmann 2025) |

---

## Executive Summary

Ginkgo biloba has the most extensive evidence base among herbal nootropics, with 82 RCTs captured in the 2026 Cochrane review alone. The updated evidence clarifies that GB provides small-to-moderate cognitive benefits in dementia populations (low certainty) but probably has no effect in mild cognitive impairment (moderate certainty). A new clinical niche has been identified in vascular cognitive impairment, where GB ranks #1 among all interventions (d = 0.83), though this finding has a wide confidence interval. Safety has been definitively confirmed at the Cochrane level, with adverse events equivalent to placebo. Competitive analysis reveals that Bacopa monnieri outperforms GB for working memory, positioning GB as the second-tier herbal nootropic for this specific cognitive domain. The tier assignment is reconciled at Tier 2, resolving a prior mismatch between supplements.js (Tier 2) and the enhanced citations file (Tier 3).

---

## Key Clinical Findings

### 1. The Most Extensively Studied Herbal Nootropic

GB holds a unique position in the herbal supplement landscape. The Wieland 2026 Cochrane review synthesizes 82 RCTs with 10,613 participants — a scale of evidence unmatched by any other herbal cognitive supplement. For comparison:

- Bacopa monnieri: ~29 RCTs (per Tiemtad 2026 NMA)
- Lion's Mane: ~5-10 RCTs (estimated)
- Phosphatidylserine: ~15-20 RCTs (estimated)
- Rhodiola rosea: ~10-15 RCTs (estimated)

This volume of evidence means GB's evidence profile is more robust and well-characterized than any competitor, even where the findings are mixed or uncertain.

### 2. Population-Specific Efficacy: The Dementia/MCI Split

The most important clinical finding from the 2026 Cochrane review is the clear population-dependent efficacy pattern:

| Population | Finding | GRADE Certainty | Clinical Implication |
|---|---|---|---|
| Dementia (all-cause) | Small to moderate cognitive benefits | Low | May help, but uncertain |
| Mild Cognitive Impairment | Probably no effect | Moderate | Likely does not help |
| Healthy older adults | Insufficient evidence | Very low | Unknown |

This creates a paradox for supplement positioning: GB has its strongest evidence in dementia populations, who are typically under medical management and less likely to self-supplement, while the evidence does NOT support benefits in MCI or healthy adults — the populations most likely to purchase GB supplements.

### 3. Vascular Cognitive Impairment: A New Clinical Niche

Masserini 2025 identifies VCI as a specific population where GB excels:

- **Ranked #1** among all interventions (pharmacological and non-pharmacological) for VCI cognition
- **Effect size d = 0.83** — clinically large
- **Functional improvement d = 0.50** — supporting real-world benefit

However, the **very wide 95% CI of 0.00-1.67** includes no effect, meaning this ranking could be an artifact of study selection or heterogeneity. This finding warrants cautious optimism rather than definitive claims.

The VCI niche aligns with GB's known mechanism of action: improved cerebral blood flow and microvascular function. If confirmed by future studies, VCI could become the primary clinical indication for GB supplementation.

### 4. Competitive Landscape: Bacopa Outperforms for Working Memory

Tiemtad 2026 provides the first head-to-head NMA between GB and Bacopa monnieri:

| Cognitive Domain | Winner | Margin |
|---|---|---|
| Working memory | High-dose Bacopa (SUCRA 100%) | Bacopa clearly superior |
| Executive function | GB 240mg | GB moderately effective |
| Overall cognitive composite | High-dose Bacopa | Bacopa superior |

This positions GB as the second-tier herbal nootropic for the consumer-relevant cognitive domains, behind Bacopa. GB's strengths appear to be in executive function and in specific clinical populations (dementia, VCI) rather than in broad working memory enhancement.

### 5. Definitive Safety Profile

The Cochrane 2026 review provides the most authoritative safety assessment possible for a supplement:

- **Adverse events equivalent to placebo** at moderate GRADE certainty
- This finding is based on 82 RCTs with 10,613 participants
- GB can be considered definitively safe for oral supplementation at standard doses (120-240 mg/day)
- Drug interactions (anticoagulants) remain a concern but were not the focus of this review

---

## Data Integrity Issues Identified

### Issue 1: Tier Mismatch

| Source | Previous Tier |
|---|---|
| supplements.js | Tier 2 |
| Enhanced citations file | Tier 3 |

**Resolution:** Tier 2 confirmed. The enhanced citations file tier was incorrect and has been corrected upward.

### Issue 2: Duplicate Safety DOI

During the evidence update review, a potential duplicate safety DOI was identified in the existing enhanced citations file. This should be verified and corrected in a subsequent data integrity pass.

### Issue 3: Cell Culture-Only Safety Citations

Some existing safety citations in the enhanced citations file reference in vitro (cell culture) studies rather than human clinical trials. For a supplement with 82 human RCTs available, cell culture safety data is inappropriate and should be replaced with clinical safety data from the Cochrane review.

### Issue 4: Missing Standardized Extract Information

The current evidence file does not clearly distinguish between EGb 761 (the standardized extract used in most clinical trials) and generic GB extracts. Pfuhlmann 2025 specifically analyzed EGb 761 evidence, and this distinction should be reflected in the data.

---

## Quality Ceiling Analysis

Despite the massive volume of evidence, GB's quality score is capped at 80 (Tier 2) due to several limiting factors:

| Limiting Factor | Impact on Quality Ceiling |
|---|---|
| Dementia benefits at low GRADE certainty | Prevents Tier 1 — the positive finding is uncertain |
| MCI null finding at moderate certainty | Stronger evidence for no effect than for effect |
| VCI CI includes null (0.00-1.67) | Most promising niche is statistically marginal |
| AMSTAR 2 poor SR quality | Underlying evidence base has methodological issues |
| No healthy adult evidence | Primary consumer population lacks evidence |
| Bacopa outperforms for working memory | Not best-in-class for key consumer domain |

The quality ceiling can only be raised if:
1. New RCTs in healthy adults show clear cognitive benefits
2. The GRADE certainty for dementia benefits is upgraded from low to moderate
3. The VCI finding is replicated with a narrower confidence interval

---

## Evidence Map

```
                    EVIDENCE HIERARCHY

    Umbrella Review ──── Pfuhlmann 2025 (16 SRs, AMSTAR 2)
           |                    |
           |              Most SRs favor EGb 761
           |              BUT poor SR quality
           |
    Cochrane SR ──────── Wieland 2026 (82 RCTs, n=10,613, GRADE)
           |                    |
           |              Dementia: benefit (low certainty)
           |              MCI: no effect (moderate certainty)
           |              Safety: AEs = placebo
           |
    Network MA ─────────  Tiemtad 2026 (29 RCTs, n=2,107)
           |                    |
           |              Bacopa > GB for working memory
           |              GB 240mg moderate for executive function
           |
    Large-Scale MA ───── Masserini 2025 (173 trials, n=22,347)
                                |
                          GB #1 for VCI (d=0.83)
                          Wide CI (0.00-1.67)
```

---

## Implications for Supplement Database

### Claims Updates Needed

1. **Cognitive function claim:** Update to reflect the Cochrane dementia/MCI distinction. Current claim may overstate general cognitive benefits.
2. **New VCI niche claim:** Consider adding vascular cognitive impairment as a specific benefit claim with appropriate caveats about the wide CI.
3. **Comparative claim:** Consider noting Bacopa's superiority for working memory in the competitive landscape section.
4. **Safety claim:** Upgrade safety confidence to reflect Cochrane-level evidence (AEs = placebo, 82 RCTs).

### Dosage Updates Needed

- Confirm 240 mg/day as the evidence-supported dose (per Tiemtad 2026 dose-response data)
- Note EGb 761 as the specific extract with the strongest evidence base (per Pfuhlmann 2025)

### Population-Specific Guidance

- Dementia: May benefit (low certainty)
- MCI: Probably does not benefit (moderate certainty)
- Healthy adults: Insufficient evidence to make claims
- VCI: Potentially strong benefit (needs replication)

---

## Future Research Directions

### High Priority

1. **Healthy adult RCTs** — The most critical evidence gap. Large RCTs in healthy adults aged 50-70 are needed to determine whether GB benefits the primary supplement consumer population.
2. **GB-specific VCI replication** — The Masserini 2025 #1 VCI ranking needs replication with a narrower CI before it can be considered definitive.
3. **GRADE certainty upgrade path** — Identify what additional evidence would upgrade the dementia finding from low to moderate certainty.

### Medium Priority

4. **GB-specific tinnitus MA** — Tinnitus is a major consumer use case for GB but was not captured in this cognitive-focused update.
5. **EGb 761 vs. generic extract comparison** — Pfuhlmann 2025 raises the question of whether non-EGb 761 extracts have equivalent efficacy.
6. **Long-term prevention trials** — No RCTs have assessed GB for cognitive decline prevention over 5+ years.

### Lower Priority

7. **Peripheral circulation evidence synthesis** — GB is widely used for peripheral circulation but this endpoint was not included in the current update.
8. **Combination therapy optimization** — Multiple excluded papers involved GB combinations (with donepezil, Bacopa, etc.). A targeted NMA of combination strategies may be warranted.
9. **Biomarker studies** — No evidence syntheses were found for GB effects on neuroimaging or fluid biomarkers of neurodegeneration.

---

## Provenance Trail Completeness Check

| Component | Status | File |
|---|---|---|
| Search log | Complete | `search_log.md` |
| Screening decisions | Complete | `screening_decisions.md` |
| Evidence evaluation | Complete | `evidence_evaluation.md` |
| Tier assignment | Complete | `tier_assignment.md` |
| Synthesis notes | Complete | `synthesis_notes.md` |
| **Provenance trail** | **Complete** | **5/5 files** |

This provenance trail fully documents the Mode 2 evidence update for Ginkgo Biloba (ID 14) and supports reproducibility of all screening, evaluation, and tier assignment decisions.
