# Tier Assignment: Taurine (ID: 39)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Tier Decision

**Assigned Tier: 3**
**Previous Version Tier: 3** (unchanged)
**Tier Assignment Confidence: High**

---

## Tier Decision Tree

### Step 1 — Screen for Tier 1 (Strong consistent large-N RCT evidence)

**Criterion:** Multiple large-N (≥200 participants) RCTs with consistent results, strong effect sizes, and Cochrane or equivalent systematic review with High GRADE certainty across primary benefit domain.

**Evaluation:**
- Largest clinical evidence base: Waldron 2018 meta-analysis, 10 studies pooled, moderate-N
- No individual large-N RCT (≥200 participants) identified for any taurine benefit
- GRADE certainty across domains: Moderate (not High)
- No Cochrane review for taurine supplementation identified

**Decision: Tier 1 NOT met** → Proceed to Step 2

---

### Step 2 — Screen for Tier 2 (Moderate multi-RCT or systematic review evidence)

**Criterion:** Systematic review or meta-analysis with ≥3 RCTs, statistically significant effect, GRADE Moderate or above, effect size sufficient for clinical relevance, no major safety concerns.

**Evaluation:**
- Waldron 2018 meta-analysis: ✅ 10 studies, ✅ statistically significant (p=0.004), ✅ GRADE Moderate, ✅ no safety concerns
- Effect size: Hedges' g = 0.40 (95% CI: 0.12–0.67)
  - g = 0.40 is considered small-to-moderate (Cohen's conventions: 0.2 small, 0.5 medium)
  - 95% CI lower bound = 0.12 — effect does not convincingly exceed small effect threshold at CI boundary
  - Moderate heterogeneity noted
- Benefit domain scope: exercise endurance performance only; cardiovascular and neurological claims not supported by equivalent RCT-level evidence
- Publication bias risk: Moderate (supplement meta-analysis context)

**Decision: Tier 2 NOT met** — effect size is real and statistically significant but the Hedges' g = 0.40 with CI lower bound of 0.12 and moderate heterogeneity does not meet the threshold for confident Tier 2 elevation. Cardiovascular and neurological benefit claims lack equivalent RCT-level meta-analytic support. → Proceed to Step 3

---

### Step 3 — Assign Tier 3 (Limited/preliminary evidence with plausible mechanism)

**Criterion:** Peer-reviewed evidence supporting mechanisms with some clinical corroboration; benefits plausible but requiring further large RCT confirmation; no major safety concerns.

**Evaluation:**
- ✅ Mechanisms: 4 high-quality mechanism reviews (avg 7.0/10, GRADE Moderate); osmolyte, calcium regulation, GABA modulation well-characterized
- ✅ Clinical corroboration: Waldron 2018 provides real if moderate clinical signal; Carvalho 2021 supports dose-response patterns
- ✅ Safety: Shao & Hathcock 2008 — GRAS-designated; well-characterized safety up to 10g/day
- ✅ No serious safety concerns; no black box warnings; no significant drug interactions
- ⚠️ Requires further large RCT confirmation for Tier 2 elevation (cardiovascular, neurological, general population exercise)

**Decision: Tier 3 CONFIRMED**

---

## ResearchQualityScore Calculation

**Score: 73/100**

### Weighted Component Scores

| Domain | Raw Score | Weight | Weighted Score | Basis |
|--------|-----------|--------|---------------|-------|
| Mechanism quality | 80 | 0.25 | 20.00 | 4 citations avg 7.0/10; Huxtable 1992 seminal; GRADE Moderate across domains; osmolyte/calcium regulation independently established |
| Clinical benefit quality | 65 | 0.30 | 19.50 | Waldron 2018 (g=0.40) is real evidence; moderate effect; cardiovascular evidence older/lower quality; neurological evidence emerging/preclinical |
| Safety quality | 82 | 0.20 | 16.40 | Shao & Hathcock 2008 authoritative GRAS paper (8/10); NOAEL established; no serious AEs; endogenous amino acid with excellent tolerability |
| Dosage quality | 68 | 0.15 | 10.20 | Beyranvand 2011 RCT protocol (7/10); Carvalho 2021 dose-response synthesis; dosing exists but primarily from exercise or clinical populations |
| Evidence recency | 72 | 0.10 | 7.20 | Span 1992–2023; Kim 2023 most recent; Waldron 2018 meta-analysis relatively recent; cardiovascular evidence dated (2002, 2004) |

**Total: 73.30 → ResearchQualityScore: 73**

### Score Calibration Notes

- Mechanism score (80): High relative to other Tier 3 supplements due to foundational Huxtable 1992 seminal review and 4 independent mechanism characterizations; calcium regulation and osmolyte functions are exceptionally well-documented
- Clinical score (65): Penalized for moderate effect size (g=0.40 vs. ≥0.5 threshold), moderate heterogeneity, and absence of RCT-level evidence for cardiovascular/neurological claims; would elevate to ~75 with a large-N confirmatory exercise RCT
- Safety score (82): Among highest safety scores in Tier 3; GRAS status and authoritative risk assessment provide robust safety baseline
- Dosage score (68): Adequate clinical dosing protocols exist for exercise context; less well-defined for general health applications
- Recency score (72): Publication span 1992–2023 is good; penalized for 2002/2004 cardiovascular reviews that are difficult to update given limited new RCT activity

---

## Changes from Prior Version

| Parameter | Prior Version | Updated Version | Rationale |
|-----------|--------------|----------------|-----------|
| `researchQualityScore` | 83 | 73 | Prior score was inflated; 73 calculated from weighted formula using actual citation quality scores; mechanisms+safety are strong but clinical limitations (moderate g=0.40, no cardiovascular RCTs) cap the score |
| `evidenceStrength` labels | "Strong", "Excellent", "Moderate-Strong" | "Well-established", "Moderate", "Emerging" | Non-standard labels replaced with pipeline-standard vocabulary |
| `isEnhanced` placement | Inside `primaryBenefits` (duplicate key) | Top-level property | Structural bug; duplicate JS object keys cause silent data loss |
| `safetyProfile.rating` | "Excellent" | Descriptive GRAS statement | Non-standard rating replaced with evidence-based descriptive text |
| `keyCitations` | Single entry, no PMID | 3 entries with full PMID/DOI | Corrected to include verified PMIDs for Waldron 2018, Shao 2008, Huxtable 1992 |
| `shao_2008_safety` citation | doi `10.4062/biomolther.2017.251`, pmid `29631391` (2018 Korean paper) | doi `10.1016/j.yrtph.2007.07.003`, pmid `17766049` | Completely wrong citation data; corrected to actual Shao & Hathcock 2008 |
| `publicationSpan` | "2010-2024" | "1992-2023" | Huxtable 1992 (PMID 1731369) is earliest citation; Kim 2023 is most recent |
| `dosageRange` | "500mg-2g daily" | "1-6g daily (endurance); 0.5-1.5g daily (cardiovascular/general)" | Context-specific dosing based on clinical evidence |
| `lastEvidenceUpdate` | 2025-08-20 | 2026-03-06 | Updated to current pipeline run date |
| `tissueTarget`/`target` duplicate keys | Both present in neurological and dosage entries | Deduplicated | Duplicate JS keys cause silent data loss |

---

## Mandatory Safety Disclosures

*Per pipeline protocol, the following disclosures are required for all Tier 3 supplements:*

1. **Evidence limitation disclosure:** Taurine exercise performance evidence is based on a meta-analysis with moderate heterogeneity and moderate effect size. Individual results may vary.

2. **Population extrapolation warning:** Cardiovascular benefit evidence is primarily from diabetic and heart failure patient populations. Generalization to healthy general population supplementation has not been confirmed by large-N RCTs.

3. **Neurological benefit caution:** Neuroprotective claims are based on mechanistic and preclinical evidence with emerging early clinical signals. No large human RCTs have confirmed cognitive or neurological benefits.

4. **Interaction note:** Taurine is GRAS-designated and no significant drug interactions are documented in short-term clinical evidence; however, individuals on cardiovascular medications should consult a healthcare provider before supplementation.

5. **Not applicable to:** Combination supplements (energy drinks); taurine effects cannot be isolated from caffeine and other components in combination formulas.

---

## Tier Assignment Confidence Statement

**Confidence: High that Tier 3 is correct.**

The evidence base supports Tier 3 with high confidence:
- Mechanisms are well-established (consistent with Tier 3 minimum)
- Clinical benefit evidence exists but does not meet Tier 2 threshold (moderate g=0.40 with CI 0.12–0.67; no large-N cardiovascular or neurological RCTs)
- Safety profile is strong (consistent with any tier assignment)
- Dosing protocols are adequate for primary use cases

**Conditions for Tier 2 elevation:**
- A confirmatory large-N RCT (≥150 participants) for endurance performance with effect size ≥0.5, OR
- A well-powered meta-analysis specifically for cardiovascular outcomes in non-diabetic populations showing statistically significant improvements in primary cardiovascular endpoints

---

*Tier assignment completed: 2026-03-06 | Pipeline Mode: Evidence Update (Mode 2)*
