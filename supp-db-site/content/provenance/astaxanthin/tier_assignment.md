# Tier Assignment: Astaxanthin (ID: 46)
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

## Tier 3 Assignment: Astaxanthin

**Assigned Tier: 3**
**Ground truth source: `supplements.js` line 3577: `"evidenceTier": 3`**

---

## Tier 3 Qualifying Criteria Check

### Required for Tier 3 (must meet AT LEAST ONE):
- [x] **Human clinical trials exist** — Multiple RCTs identified (Park 2010, Earnest 2011, Tominaga 2012, Spiller 2003, Karppi 2007)
- [x] **Directional signal across multiple endpoints** — Antioxidant biomarkers, exercise performance, skin parameters, cardiovascular biomarkers all show consistent benefit direction

### Disqualifying Criteria for Tier 2 (must meet NONE to be Tier 2):
- [x] **No meta-analysis or systematic review with pooled statistics** — Fassett & Coombes 2011 is a narrative systematic review without meta-analysis pooling; no dedicated meta-analysis identified for astaxanthin as primary intervention
- [x] **No RCT with N≥100** — Largest individual RCT: Tominaga 2012, N=49; all other RCTs are N≤42
- [x] **No GRADE MODERATE or higher evidence** — All clinical evidence is GRADE LOW (small RCTs with high risk of bias) or GRADE VERY LOW (open-label studies with subjective outcomes)
- [x] **No Cochrane review** — Cochrane Library search confirmed no dedicated astaxanthin supplementation review as of 2026-03-06

**Tier 2 disqualification: CONFIRMED — 4 disqualifying criteria met**

### Disqualifying Criteria for Tier 4 (must meet NONE to be Tier 3):
- [x] **Human clinical evidence exists** — Multiple human RCTs and observational studies
- [x] **Evidence is not purely preclinical** — No reliance on animal or in vitro models in the final citation set

**Tier 4 disqualification: CONFIRMED — Astaxanthin has adequate human evidence for Tier 3**

---

## Tier Consistency with ResearchQualityScore

**Assigned Score: 55**
**Tier 3 Range: 45–65**
**Score position within Tier 3: Upper-middle (55/65 = 85th percentile of Tier 3)**

The score of 55 is consistent with the upper-middle Tier 3 position because:
1. **Mechanistic understanding is unusually well-developed** (score 6.0/10 average) — transmembrane antioxidant mechanism clearly characterized, Nrf2/NF-κB pathways documented, human biomarker RCT available
2. **Multi-domain benefit pattern** — 5 benefit citations covering 5 distinct outcome areas provides breadth compensating for depth
3. **Two-RCT safety foundation** — stronger safety evidence than a typical single observational safety study
4. **Sound formulation PK data** — 3.7× bioavailability finding has direct clinical applicability
5. **Recency penalty** — 14-year publication gap (2012–2026) caps the score; a supplement with comparable clinical evidence but post-2018 citations would score 60–65

---

## Comparison to Tier 2 Threshold

The score of 55 approaches but does not reach the Tier 2 entry point (~65–70). The gap reflects:

| Tier 2 Requirement | Astaxanthin Status | Gap |
|-------------------|-------------------|-----|
| Meta-analysis with pooled estimate | No meta-analysis | Critical |
| N≥100 anchor RCT | Max N=49 (Tominaga 2012) | Critical |
| Cochrane review | Absent | Significant |
| GRADE MODERATE evidence | All GRADE LOW | Significant |
| Single landmark trial | None identified | Significant |

Astaxanthin would qualify for Tier 2 if a properly powered RCT (N≥150) with a hard clinical endpoint were published and included in the evidence base. The field has produced enough small RCTs to support a meta-analysis; if a comprehensive meta-analysis with pooled statistics were performed, that alone could support Tier 2 reclassification.

---

## Comparison Within Pipeline Peer Group (IDs 41–46)

| ID | Supplement | Score | Tier | Tier 2 Anchors |
|----|-----------|-------|------|----------------|
| 41 | Inositol | 68 | 2 | Meta-analyses for PCOS, N>500 pooled |
| 42 | Selenium | 67 | 2 | SELECT trial (N=35,533) + meta-analyses |
| 43 | Choline | 66 | 2 | Adequate single RCT + guideline support |
| 44 | Alpha-Lipoic Acid | 68 | 2 | ALADIN/SYDNEY trials + meta-analyses |
| 45 | Lutein | 70 | 2 | AREDS2 (N=4,203, Cochrane-equivalent) |
| **46** | **Astaxanthin** | **55** | **3** | **No meta-analysis; max N=49** |

Astaxanthin is correctly the only Tier 3 supplement in the ID 41–46 cohort, consistent with its position as a newer supplement under active investigation but lacking the trial infrastructure that elevated the others to Tier 2.

---

## Prior Version Tier Inconsistency (Mode 2+ Trigger)

The prior `46_enhanced.js` had `researchQualityScore: 81` while `supplements.js` has `evidenceTier: 3`. This inconsistency was a Mode 2+ trigger:

- Score 81 is in the Tier 1 elite range (80+), appropriate for AREDS2-equivalent evidence or Cochrane Gold Standard
- Astaxanthin at Tier 3 with max N=49, no Cochrane review, and no meta-analysis cannot support score 81
- The inflated score also used Tier 2 language in `evidenceStrength` labels (e.g., "Well-established", "Strong")
- Corrected: Score 55 + Tier 3 standard labels (`mechanisticBasis: 'Established'`, `clinicalBenefits: 'Emerging'`, `safetyRecord: 'Favorable'`, `doseOptimization: 'Preliminary'`)

---

## Future Reclassification Triggers

The following evidence developments would prompt Tier 2 reclassification in a future pipeline run:
1. Publication of a meta-analysis of astaxanthin RCTs with pooled effect sizes (N≥500 pooled)
2. A well-powered RCT (N≥150) with a hard clinical endpoint (cardiovascular events, validated cognitive scale, objective exercise metric)
3. A Cochrane review of astaxanthin supplementation
4. Any GRADE MODERATE or higher systematic review from a recognized evidence synthesis body (EFSA, NIH ODS, USPSTF)

The field trend (9 RCTs published 2009–2012, ongoing research through 2026) suggests these milestones are reachable within 5–10 years of the pipeline date.

---

## Tier Assignment Summary

| Field | Value |
|-------|-------|
| **Assigned Tier** | **3** |
| **Score** | **55** |
| **Score Range for Tier** | 45–65 |
| **Score Position in Tier** | Upper-middle |
| **Ground Truth Source** | supplements.js `evidenceTier: 3` |
| **Key Qualifying Evidence** | Multiple small RCTs across 5 benefit domains |
| **Primary Limiting Factor** | No meta-analysis, no RCT N≥100, no Cochrane review |
| **Tier 2 Distance** | 10–15 points; requires meta-analysis or N≥150 RCT |
| **Prior Score** | 81 (severely inflated, Tier 1 range) |
| **Prior Score Correction** | −26 points (81 → 55) |
| **Processing Mode** | Mode 2+ (score inflation + fabrication indicators) |

---

*Tier assignment completed: 2026-03-06 | Pipeline Mode: Mode 2+ (Structural Repair + Standard Evidence Update)*
