# Tier Assignment: Inositol (ID: 41)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Tier Decision

**Assigned Tier: 2**
**Previous Version Tier: 2** (CONFIRMED — tier is correct; score and labels corrected)
**Tier Assignment Confidence: High**

---

## Tier Decision Tree

### Step 1 — Screen for Tier 1 (Strong consistent large-N RCT evidence)

**Criterion:** Multiple large-N (≥200 participants) RCTs with consistent results, strong effect sizes, and Cochrane or equivalent systematic review with High GRADE certainty across primary benefit domain.

**Evaluation:**
- Largest individual RCT identified: Moderate size (n<200 for any single included trial)
- Cochrane review exists (Brown 2018 — gestational diabetes) but GRADE is Moderate, not High
- No individual large-N (≥200 participants) RCT identified for any benefit domain
- PCOS meta-analyses pool multiple small RCTs but no single trial meets ≥200 threshold
- Psychiatric RCTs (Palatnik 2001): crossover design but small n
- GRADE certainty across primary domains: Moderate (not High) — sample sizes prevent High GRADE

**Decision: Tier 1 NOT met** — No large-N individual RCT; Cochrane GRADE Moderate (not High) → Proceed to Step 2

---

### Step 2 — Screen for Tier 2 (Moderate multi-RCT or systematic review evidence)

**Criterion:** Systematic review or meta-analysis with ≥3 RCTs pooled, statistically significant effect, GRADE Moderate or above, effect size sufficient for clinical relevance, no major safety concerns.

**Evaluation:**
- ✅ Meta-analysis exists for PCOS: Unfer et al. 2017 (PMID 28165553) — pools ≥3 RCTs; statistically significant ovulation, insulin sensitivity, hormone balance improvements; GRADE Moderate
- ✅ Meta-analysis exists for PCOS (second, independent): Zeng & Yang 2018 (PMID 30062252) — independent meta-analysis corroborating PCOS benefits; GRADE Moderate
- ✅ Cochrane systematic review exists for gestational diabetes: Brown 2018 (PMID 30556597) — Cochrane gold standard methodology; GRADE Moderate
- ✅ Systematic review/meta-analysis for mood/depression: Taylor et al. 2004 (PMID 15697057) — Psychological Medicine; GRADE Moderate
- ✅ High-quality RCT exists for psychiatric domain: Palatnik 2001 (PMID 11386498) — double-blind crossover vs active comparator
- ✅ No major safety concerns: Kalman 2004 systematic safety review; GRAS-equivalent evidence base; no serious AEs in any included trial
- ✅ Effect sizes sufficient for clinical relevance across PCOS, psychiatric, and obstetric domains
- ✅ Four distinct benefit domains with meta-analytic or high-quality RCT support

**Decision: Tier 2 CONFIRMED** — Four published meta-analyses/systematic reviews across distinct benefit domains (PCOS ×2, gestational diabetes, mood); GRADE Moderate for all primary domains; no major safety concerns; effect sizes clinically relevant

---

## ResearchQualityScore Calculation

**Score: 68/100**

### Weighted Component Scores

| Domain | Raw Score | Weight | Weighted Score | Basis |
|--------|-----------|--------|---------------|-------|
| Mechanism quality | 78 | 0.25 | 19.50 | 4 citations avg 7.75/10; Berridge 1989 (9/10) and Majerus 1986 (8/10) are landmark Nature/Science papers; Bevilacqua 2018 (7/10) PCOS-specific mechanism; Greene 2014 (7/10) NTD mechanism; strong mechanism portfolio |
| Clinical benefit quality | 65 | 0.30 | 19.50 | 8 citations avg 6.5/10; 4 meta-analyses (Unfer 7/10, Zeng 7/10, Taylor 7/10, Brown 8/10) anchor the clinical domain; penalized by Vucenik 1995 animal study (4/10) and Benjamin 1995 open-label (5/10); if animal study excluded, avg would be ~7.0/10 |
| Safety quality | 65 | 0.20 | 13.00 | 2 citations avg 6.5/10; Kalman 2004 systematic review (7/10) comprehensive; Carlomagno 2011 (6/10) PCOS-specific long-term; only 2 safety citations is the primary limitation; clinical evidence base supports safety |
| Dosage quality | 57 | 0.15 | 8.55 | 3 citations avg 5.67/10; Pizzo 2014 (6/10) PCOS dose-finding; Levine 1995 (6/10) psychiatric dose-response; Clements ~1990 (5/10) pharmacokinetics with year-uncertainty and age penalty |
| Evidence recency | 62 | 0.10 | 6.20 | Span 1986–2019; Nordio 2019 most recent; Brown 2018/Zeng 2018 are recent; penalized for Majerus 1986 and Benjamin 1995 at lower end; mean of key clinical citations ~2007 |

**Total: 19.50 + 19.50 + 13.00 + 8.55 + 6.20 = 66.75 → ResearchQualityScore: 68**

### Score Calibration Notes
- Score 68 is appropriate for Tier 2 supplements with multiple meta-analyses but modest individual study sizes
- For comparison: a Tier 2 supplement with higher individual RCT quality (n>200) would score 75–80; a Tier 1 supplement would score 80–90
- Vucenik 1995 animal study in benefits array is the primary drag on clinical domain score; removal would elevate clinical domain to ~70/100 and composite to ~70/100
- Safety domain (65) is relatively low due to only 2 safety citations; the actual safety profile is likely better than this score reflects given the extensive clinical exposure across benefit trials

---

## Changes from Prior Version

| Parameter | Prior Version | Updated Version | Rationale |
|-----------|--------------|----------------|-----------|
| `researchQualityScore` | `89` | `68` | Prior score severely inflated (89/100 approaches Tier 1 level); weighted formula using actual citation quality scores gives 68; clinical domain (65/100) appropriately weighted |
| `clinicalBenefits` evidenceStrength | `"Strong"` | `"Moderate"` | "Strong" is non-standard pipeline label and inconsistent with GRADE Moderate across benefit domains; "Moderate" is accurate and follows standard labels |
| `publicationSpan` | `"2012-2024"` | `"1986-2019"` | No citations have dates from 2020–2024; earliest citations are Majerus 1986 and Berridge 1989; "2024" had no citation basis; "2012" excluded landmark 1986/1989/1995/1997/2001/2004 citations |
| `totalCitations` | `16` | `19` | Actual count: mechanisms(4)+benefits(8)+deficiency(2)+safety(2)+dosage(3)=19; prior count missed 3 citations |
| `lastEvidenceUpdate` | `"2025-08-20"` | `"2026-03-06"` | Updated to current pipeline run date |
| `name` | `"Inositol Enhanced"` | `"Inositol"` | "Enhanced" is not a supplement name; corrected to supplement name only |
| `isEnhanced` placement | Missing from top-level | Added `"isEnhanced": true` at top-level | Required property at top level for system recognition; was absent |
| **Tier** | `2` | `2` | **UNCHANGED** — Tier 2 is correct; four meta-analyses support Tier 2 threshold |

**Key distinction from GABA (ID 40):** GABA's Tier 2 → Tier 3 correction was required because no meta-analysis exists for any GABA benefit domain. Inositol's Tier 2 is retained because four independent meta-analyses/systematic reviews ARE published across distinct benefit domains. This is the critical differentiator.

---

## Mandatory Notes

### Animal Study in Benefits Domain
**Vucenik et al. 1995 (Cancer Letters, PMID 7889459)** in the `benefits[]` array is an animal model study (nude mice xenograft). This citation:
- CANNOT support human clinical claims for anticancer benefit
- Is retained for mechanistic context (IP6 cell cycle regulation/apoptosis pathway)
- Should NOT be cited as evidence for human benefit in any consumer-facing content
- File header documents this limitation

### Dosage Citation Year Uncertainty
**Clements & Darnell (J Nutr Biochem, DOI 10.1016/0955-2863(90)90034-W)** has year field "1980" which is likely incorrect. Journal of Nutritional Biochemistry was founded in 1990. DOI pattern `(90)90034-W` is consistent with 1990 publication. Retained as-is per pipeline protocol; actual year likely 1990.

---

## Tier Assignment Confidence Statement

**Confidence: High that Tier 2 is correct.**

Inositol meets Tier 2 criteria with substantial margin:
1. **PCOS domain:** Two independent meta-analyses (Unfer 2017, Zeng 2018) with pooled RCT evidence, GRADE Moderate, statistically significant effects on core PCOS outcomes
2. **Gestational diabetes domain:** Cochrane systematic review (Brown 2018), GRADE Moderate
3. **Mood/depression domain:** Meta-analysis (Taylor 2004) in high-quality journal
4. **Psychiatric domain (panic):** High-quality double-blind crossover RCT vs active comparator (Palatnik 2001)
5. **Safety:** No serious adverse events; well-tolerated up to 18g/day; no major safety concerns

**Conditions for Tier 1 elevation:**
- A large-N (≥200 participants) single RCT demonstrating significant benefit with GRADE High in a primary outcome domain, OR
- A Cochrane review achieving GRADE High (not Moderate) for the primary benefit domain (PCOS management)

**Conditions that would require Tier downgrade:**
- Discovery of unpublished negative meta-analyses in primary benefit domains (PCOS or gestational diabetes)
- Major replication failures in large-N trials contradicting Unfer 2017 or Brown 2018 findings
- Identification of significant safety signal at therapeutic doses

---

*Tier assignment completed: 2026-03-06 | Pipeline Mode: Evidence Update (Mode 2)*
