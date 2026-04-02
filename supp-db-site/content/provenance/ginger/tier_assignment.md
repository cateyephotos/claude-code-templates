# Tier Assignment: Ginger (ID: 47)
## Pipeline Run: 2026-03-06 | Mode: Mode 2+ (Structural Repair + Standard Evidence Update)

---

## Tier Definition Framework

| Tier | Definition | Score Range | Typical Anchors |
|------|-----------|-------------|-----------------|
| Tier 1 | Cochrane review OR large-N (≥200) RCT with GRADE HIGH evidence | 70–100 | Cochrane Gold Standard, AREDS2-class trials |
| Tier 2 | Meta-analyses, systematic reviews with pooled analysis, or GRADE MODERATE evidence base | 55–75 | Pooled meta-analysis N≥500, landmark single RCTs N≥200 |
| Tier 3 | Single RCTs (N<200) or observational studies with no systematic pooling; GRADE LOW/VERY LOW | 40–65 | Multiple small RCTs with consistent direction |
| Tier 4 | Preclinical only — no human clinical evidence | 10–40 | Animal studies, in vitro only |

---

## Tier 2 Assignment: Ginger

**Assigned Tier: 2**
**Ground truth source: `supplements.js` line 3665: `"evidenceTier": 2`**

---

## Tier 2 Qualifying Criteria Check

### Required for Tier 2 (must meet AT LEAST ONE):
- [x] **Meta-analysis with pooled statistics N≥500** — Viljoen 2014 (NVP, N=1,278 pooled from 12 RCTs) qualifies as primary Tier 2 anchor
- [x] **Second qualifying meta-analysis** — Bartels 2015 (OA, N=593 pooled from 5 RCTs) provides independent secondary Tier 2 confirmation
- [x] **Third meta-analysis (additional support)** — Zhu 2018 (metabolic, N=454 pooled from 10 RCTs) — borderline qualifying (N<500 but approaches threshold; provides corroborating evidence)

### Disqualifying Criteria for Tier 1 (must meet NONE to be Tier 1):
- [x] **No Cochrane review** — No dedicated Cochrane review for ginger supplementation as primary intervention as of 2026-03-06 (Matthews 2015 Cochrane NVP review includes ginger as one of multiple interventions but is not a dedicated ginger Cochrane review)
- [x] **No single RCT with N≥200** — Largest individual RCT in evidence set is N=120 (Nanthakomon 2006); the evidence base reaches N≥500 only via meta-analytic pooling
- [x] **No GRADE HIGH evidence** — All meta-analyses rated GRADE MODERATE or GRADE LOW-MODERATE due to risk of bias across included small RCTs; no GRADE HIGH single domain assessment

**Tier 1 disqualification: CONFIRMED — 3 disqualifying criteria met**

### Disqualifying Criteria for Tier 3 (must meet NONE to be Tier 2):
- [x] **Multiple qualifying meta-analyses present** — Viljoen 2014 (N=1,278) and Bartels 2015 (N=593) both independently meet Tier 2 pooled N threshold
- [x] **Evidence base is not limited to single small RCTs** — Two meta-analyses aggregate multiple RCTs meeting the systematic review with pooled analysis standard
- [x] **Evidence is not purely observational** — Meta-analytic evidence is from pooled RCT populations

**Tier 3 disqualification: CONFIRMED — Ginger has adequate meta-analytic evidence for Tier 2**

---

## Tier Consistency with ResearchQualityScore

**Assigned Score: 65**
**Tier 2 Range: 55–75**
**Score position within Tier 2: Upper-middle (65/75 = 87th percentile of Tier 2)**

The score of 65 is consistent with the upper-middle Tier 2 position because:
1. **Two Tier 2-qualifying meta-analyses** — Viljoen 2014 (NVP) and Bartels 2015 (OA) provide independent pooled-N anchor evidence across different indication domains, which is stronger than a single meta-analysis
2. **Dual mechanism well-established** — COX/LOX dual inhibition is documented across multiple specialized reviews; the 5-HT3 antagonism mechanism maps to pharmaceutical antiemetic pharmacology (unusually well-characterized)
3. **Pregnancy-specific safety evidence** — Safety data is specifically collected in the primary indication population (NVP/pregnant women), which is more relevant than generic population safety data
4. **Regulatory dose standard** — Commission E provides validated dosage framework across multiple indications
5. **Recency gap moderate** — Most recent citation 2018 (8-year gap to 2026-03-06) is better than supplements with pre-2010 evidence bases but limits further score elevation
6. **Modest effect sizes** — SMD ~0.28–0.29 in primary meta-analyses indicates real but not large clinical benefit, consistent with Tier 2 but not Tier 1

---

## Comparison to Tier 1 Threshold

The score of 65 does not reach the Tier 1 threshold (~70+). The gap reflects:

| Tier 1 Requirement | Ginger Status | Gap |
|-------------------|---------------|-----|
| Cochrane review | Absent | Critical |
| N≥200 single RCT | Max N=120 (Nanthakomon 2006) | Significant |
| GRADE HIGH evidence | GRADE MODERATE at best | Significant |
| Landmark single trial | None identified | Moderate |
| N≥1,000 single RCT | Not available | Moderate |

Ginger would qualify for Tier 1 if a comprehensive Cochrane review were published or a single large-N (≥500) RCT with a hard clinical endpoint were completed. Given the existing meta-analytic base, a Cochrane review is the most plausible near-term pathway to Tier 1.

---

## Comparison Within Pipeline Peer Group (IDs 41–47)

| ID | Supplement | Score | Tier | Tier 2 Anchors |
|----|-----------|-------|------|----------------|
| 41 | Inositol | 68 | 2 | Meta-analyses for PCOS, N>500 pooled |
| 42 | Selenium | 67 | 2 | SELECT trial (N=35,533) + meta-analyses |
| 43 | Choline | 66 | 2 | Adequate single RCT + guideline support |
| 44 | Alpha-Lipoic Acid | 68 | 2 | ALADIN/SYDNEY trials + meta-analyses |
| 45 | Lutein | 70 | 2 | AREDS2 (N=4,203, Cochrane-equivalent) |
| 46 | Astaxanthin | 55 | 3 | No meta-analysis; max N=49 |
| **47** | **Ginger** | **65** | **2** | **NVP meta-analysis N=1,278; OA meta-analysis N=593** |

Ginger (score 65) appropriately scores higher than astaxanthin (55, Tier 3) due to the two qualifying meta-analyses, and appropriately below Lutein (70, Tier 2) due to the absence of a Cochrane review and presence of only modest individual RCT sizes. The score of 65 is justified relative to the Tier 2 cohort: Ginger's multi-indication meta-analytic base (NVP + OA + metabolic) provides broader evidence coverage than a typical single-indication Tier 2 supplement, but the absence of a Cochrane review and the modest effect sizes prevent reaching the 68–72 range of the stronger Tier 2 entries.

---

## Prior Version Tier Inconsistency (Mode 2+ Trigger)

**47_enhanced.js (2025-08-21):** `researchQualityScore: 83`
**47_ginger_enhanced.js (2025-01-25):** `researchQualityScore: 81`

Both prior values are severely inflated:
- Score 83 is in the Tier 1 range (80+), appropriate for AREDS2-equivalent evidence or Cochrane Gold Standard
- Score 81 is similarly in the Tier 1 range
- Ginger at Tier 2 with no Cochrane review and largest individual RCT N=120 should score 60–67 range
- The inflated scores also used inappropriate Tier 1+ language in evidenceStrength labels
- Corrected: Score 65 + Tier 2 standard labels

**Prior score correction summary:**
- 47_enhanced.js: 83 → 65 (−18 points)
- 47_ginger_enhanced.js: 81 → 65 (−16 points)
- Both: Tier 2 assignment is correct per supplements.js ground truth; score correction only

---

## Future Reclassification Triggers

The following evidence developments would prompt Tier 1 reclassification in a future pipeline run:
1. Publication of a dedicated Cochrane review of ginger supplementation for NVP (most likely pathway — sufficient RCT base exists)
2. A well-powered RCT (N≥500) with a hard clinical endpoint (verified birth outcomes, MRI-confirmed OA structural benefit, cardiovascular event reduction)
3. GRADE HIGH systematic review from a recognized evidence synthesis body (NIH ODS, USPSTF, Cochrane)
4. Any large-N (≥1,000) pragmatic RCT for NVP or OA

The Cochrane NVP pathway is highly plausible given the existing RCT base — a Cochrane NVP review that includes ginger as a primary intervention could provide the Tier 1 evidence anchor within 3–5 years of the pipeline date.

---

## Tier Assignment Summary

| Field | Value |
|-------|-------|
| **Assigned Tier** | **2** |
| **Score** | **65** |
| **Score Range for Tier** | 55–75 |
| **Score Position in Tier** | Upper-middle |
| **Ground Truth Source** | supplements.js `evidenceTier: 2` |
| **Primary Tier 2 Anchor** | Viljoen 2014 NVP meta-analysis N=1,278 (PMID 24674712) |
| **Secondary Tier 2 Anchor** | Bartels 2015 OA meta-analysis N=593 (PMID 25749012) |
| **Key Limiting Factor** | No Cochrane review; no single RCT N≥200; modest effect sizes (SMD ~0.28) |
| **Tier 1 Distance** | 5–10 points; requires Cochrane review or N≥500 single RCT |
| **Prior Score** | 83 (47_enhanced.js) / 81 (47_ginger_enhanced.js) — both severely inflated (Tier 1 range) |
| **Prior Score Correction** | −18 points (83 → 65); −16 points (81 → 65) |
| **Processing Mode** | Mode 2+ (score inflation + nested format + cross-domain PMID duplicates + two conflicting canonical files) |

---

*Tier assignment completed: 2026-03-06 | Pipeline Mode: Mode 2+ (Structural Repair + Standard Evidence Update)*
