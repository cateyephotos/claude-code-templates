# Tier Assignment: GABA (ID: 40)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Tier Decision

**Assigned Tier: 3**
**Previous Version Tier: 2** (CORRECTED — prior version was inflated)
**Tier Assignment Confidence: High**

---

## Tier Decision Tree

### Step 1 — Screen for Tier 1 (Strong consistent large-N RCT evidence)

**Criterion:** Multiple large-N (≥200 participants) RCTs with consistent results, strong effect sizes, and Cochrane or equivalent systematic review with High GRADE certainty across primary benefit domain.

**Evaluation:**
- Largest clinical evidence base: Abdou 2006 Amino Acids (n=13), Kanehira 2011 (n=30), Yamatsu 2016 (n=40 approx.)
- No individual large-N RCT (≥200 participants) identified for any GABA benefit
- No systematic review or meta-analysis identified for any GABA benefit domain
- GRADE certainty across clinical domains: Low (not High)
- No Cochrane review for GABA oral supplementation identified

**Decision: Tier 1 NOT met** → Proceed to Step 2

---

### Step 2 — Screen for Tier 2 (Moderate multi-RCT or systematic review evidence)

**Criterion:** Systematic review or meta-analysis with ≥3 RCTs, statistically significant effect, GRADE Moderate or above, effect size sufficient for clinical relevance, no major safety concerns.

**Evaluation:**
- No systematic review or meta-analysis exists for any GABA benefit domain
- Multiple RCTs do exist (Kanehira 2011, Yamatsu 2016, Yoto 2012 papers) but are not pooled in any published meta-analysis
- No pooled effect size (Hedges' g or Cohen's d) calculable from current evidence
- Even if individual RCT results are positive, they are underpowered (n<50 each) and cannot be pooled without a formal meta-analysis
- Critical additional factor: Blood-brain barrier uncertainty fundamentally limits GRADE certainty ratings below Moderate for all clinical claims — even if individual study quality were higher, the unresolved mechanism would prevent High GRADE
- Boonstra 2015 explicitly documents insufficient evidence to confirm central mechanism; peripheral mechanism alternative cannot be distinguished from central mechanism based on current clinical outcomes

**Decision: Tier 2 NOT met** — No meta-analysis exists; individual RCTs all have n<50; BBB uncertainty caps GRADE below Moderate for clinical claims; no statistically significant pooled effect size is available → Proceed to Step 3

---

### Step 3 — Assign Tier 3 (Limited/preliminary evidence with plausible mechanism)

**Criterion:** Peer-reviewed evidence supporting mechanisms with some clinical corroboration; benefits plausible but requiring further large RCT confirmation; no major safety concerns.

**Evaluation:**
- ✅ Mechanisms: 8 mechanism citations; endogenous inhibitory neurotransmitter with well-characterized GABA-A/GABA-B receptor pharmacology; peripheral mechanism via enteric nervous system plausible; Bowery 2006, Sigel 2012, Nuss 2015, Gottesmann 2002
- ✅ Clinical corroboration: Multiple small RCTs (Kanehira 2011, Yamatsu 2016, Abdou 2006, Yoto 2012) provide directionally consistent evidence for stress, relaxation, and sleep benefits at doses 100–750mg
- ✅ Safety: Oketch-Rabah 2021 and Bauza 2016 provide GRAS-basis; well-characterized safety up to 750mg/day; no serious adverse events documented
- ✅ No serious safety concerns; no black box warnings; no significant drug interactions documented at supplementation doses
- ⚠️ BBB penetration unconfirmed — central mechanism uncertain; peripheral mechanism plausible alternative
- ⚠️ All clinical studies n<50; no meta-analysis; all benefit domains Tier 3 level evidence
- ⚠️ Requires large-N RCTs and/or pharmacokinetic confirmation for Tier 2 elevation

**Decision: Tier 3 CONFIRMED**

---

## ResearchQualityScore Calculation

**Score: 60/100**

### Weighted Component Scores

| Domain | Raw Score | Weight | Weighted Score | Basis |
|--------|-----------|--------|---------------|-------|
| Mechanism quality | 65 | 0.25 | 16.25 | 8 citations avg 6.3/10; mechanisms well-established for endogenous GABA but oral supplement CNS pathway unconfirmed; Bowery/Sigel/Nuss/Gottesmann strong pharmacology reviews; BBB uncertainty caps mechanism certainty |
| Clinical benefit quality | 45 | 0.30 | 13.50 | 6 benefit citations avg 5.7/10; n<50 for all direct GABA RCTs; no meta-analysis; Very Low GRADE for BBB claim (n=13); peripheral effects plausible but not pooled; absence of meta-analysis is a significant quality gap |
| Safety quality | 72 | 0.20 | 14.40 | 3 safety citations avg 6.7/10; Oketch-Rabah 2021 (8/10) and Bauza 2016 (7/10) provide strong GRAS basis; GABA is endogenous with excellent tolerability; no serious AEs; somewhat lower than taurine (82/100 safety) due to smaller human safety evidence base |
| Dosage quality | 62 | 0.15 | 9.30 | 2 dosage citations avg 6.5/10; Yoto 2012 JNSV (6/10) provides dose-response (100–750mg); Boonstra 2015 (7/10) addresses bioavailability uncertainty; dose protocols exist but based on small single studies |
| Evidence recency | 65 | 0.10 | 6.50 | Span 2002–2021; Oketch-Rabah 2021 is most recent; Boonstra 2015 provides recent BBB review; majority of clinical evidence is 2006–2016; no recent large trials; no 2022–2026 clinical evidence |

**Total: 59.95 → ResearchQualityScore: 60**

### Score Calibration Notes

- Mechanism score (65): Penalized relative to taurine (80) because GABA's mechanism certainty is complicated by the BBB uncertainty — the endogenous receptor mechanisms are excellent, but the oral supplement pathway is mechanistically unresolved in a way that taurine's mechanisms are not
- Clinical score (45): The lowest domain score; reflects the genuine absence of meta-analytic evidence, universal n<50 constraint across all RCTs, and the BBB uncertainty that limits GRADE for all clinical claims; this is one of the weakest clinical evidence bases among Tier 3 supplements
- Safety score (72): Solid GRAS-basis from two regulatory assessments; penalized relative to taurine (82) because the GABA safety literature is smaller and the most authoritative paper (Oketch-Rabah 2021) is more recent and has less follow-up evidence; safety ceiling at 750mg/day (taurine established up to 10g/day)
- Dosage score (62): Adequate dose-response data from Yoto 2012 JNSV; Boonstra 2015 adds bioavailability context; penalized because dosing protocols are based on small single studies and individual variation may be high
- Recency score (65): PublicationSpan 2002–2021 with most clinical evidence 2006–2016; penalized for absence of recent large-N trials; the research field shows limited momentum for large confirmatory studies

---

## Changes from Prior Version

| Parameter | Prior Version | Updated Version | Rationale |
|-----------|--------------|----------------|-----------|
| `overallQuality` | `"Tier 2"` | `"Tier 3"` | Prior tier was inflated; no meta-analysis exists for any benefit domain; all clinical evidence n<50; BBB uncertainty limits GRADE below Tier 2 threshold |
| `researchQualityScore` | `88` | `60` | Prior score was severely inflated (88/100 is Tier 1–2 level); 60 calculated from weighted formula using actual citation quality scores; clinical domain (45/100) drags composite score appropriately |
| `clinicalBenefits` evidenceStrength | `"Strong"` | `"Limited"` | "Strong" is non-standard and inconsistent with the evidence (no meta-analysis, n<50 all RCTs); "Limited" is the appropriate standard pipeline label |
| `researchMaturity` | `"Mature"` | `"Emerging"` | GABA supplementation clinical research is emerging (small studies, no meta-analysis, unresolved BBB question); "Mature" was inaccurate |
| `publicationSpan` | `"1976-2024"` | `"2002-2021"` | No citations in the file are from 1976; earliest confirmed citations are Ben-Ari 2002 and Gottesmann 2002 (PMID 12093589, 12531146); latest is Oketch-Rabah 2021 (PMID 33242518) |
| `totalCitations` | `15` | `18` (file has 19) | Prior count of 15 was incomplete; 18 used as official count per pipeline run; file actually contains 19 unique citation entries (see screening_decisions.md for detail) |
| `isEnhanced` placement | Inside `primaryBenefits` (×2) | Top-level property | Structural JS bug; duplicate keys inside nested object cause silent data loss; corrected to top-level placement |
| `tissueTarget`/`target` duplicates | Present in mechanisms[0–3] | Deduplicated | JS object literal with duplicate keys causes silent data loss (second key overwrites first); all four mechanisms[] entries corrected |
| PMID collision in mechanisms[1] | PMID 25824938 assigned to Yoto Pharma Nutrition | Removed from Yoto entry | PMID 25824938 belongs exclusively to Nuss 2015; Yoto Pharma Nutrition PMID is unverifiable; DOI retained for CrossRef resolution |
| `lastEvidenceUpdate` | `"2025-08-20"` | `"2026-03-06"` | Updated to current pipeline run date |
| `keyCitations` (supplements.js) | 1 entry, no PMID | 3 entries with full PMIDs | Corrected to include Oketch-Rabah 2021, Abdou 2006 Amino Acids, Bowery & Smart 2006 with verified PMIDs |
| `evidenceTierRationale` (supplements.js) | Generic placeholder text | Evidence-based specific text | Replaced with text citing specific papers (Abdou 2006, Kanehira 2011, Oketch-Rabah 2021) and explicitly noting BBB uncertainty |
| `safetyProfile.rating` (supplements.js) | `"Excellent"` | Descriptive GRAS statement | Non-standard rating replaced with evidence-based descriptive text citing Oketch-Rabah 2021 |

---

## Mandatory Safety Disclosures

*Per pipeline protocol, the following disclosures are required for all Tier 3 supplements:*

1. **BBB penetration disclosure:** Current scientific evidence is insufficient to confirm that oral GABA supplementation crosses the blood-brain barrier in meaningful quantities. Clinical effects observed in trials may be mediated by peripheral mechanisms (vagus nerve, enteric nervous system, gut-brain axis) rather than direct CNS enhancement.

2. **Evidence limitation disclosure:** GABA supplementation clinical evidence is based on small trials (n=13–30). No systematic review or meta-analysis exists for any claimed benefit domain. Results from individual small studies may not replicate in larger confirmatory trials.

3. **Population extrapolation warning:** Anxiety-related evidence is primarily from mechanistic reviews of GABAergic drug pharmacology, not oral GABA supplementation specifically. Extrapolation from benzodiazepine/barbiturate mechanisms to GABA supplementation is not supported by equivalent clinical evidence.

4. **Drug interaction note:** GABA supplementation may have additive pharmacodynamic effects with benzodiazepines, alcohol, and anticonvulsant medications that modulate GABAergic neurotransmission. Individuals taking these medications should consult a healthcare provider before supplementation.

5. **Pregnancy and lactation:** Insufficient safety data exists for GABA supplementation during pregnancy or breastfeeding. Use is not recommended in these populations.

---

## Tier Assignment Confidence Statement

**Confidence: High that Tier 3 is correct; High that Tier 2 was incorrect.**

The Tier 2 assignment in the prior version was not supported by the evidence:
- No meta-analysis or systematic review exists for any GABA benefit domain (the minimum Tier 2 clinical evidence requirement)
- All direct clinical studies are n<50 (Tier 1 and 2 require larger-N evidence)
- BBB penetration — the central mechanistic claim — is explicitly described as unconfirmed in the most current review (Boonstra 2015)
- A researchQualityScore of 88/100 is inconsistent with a Tier 3 supplement with no meta-analysis and uncertain primary mechanism

Tier 3 accurately reflects:
- Well-established endogenous mechanism (GABA is the primary inhibitory neurotransmitter)
- Plausible but mechanistically uncertain supplementation pathway (BBB question unresolved)
- Multiple small consistent clinical trials (directional evidence without statistical pooling)
- Well-characterized safety profile (GRAS, endogenous molecule)
- Need for large-N confirmatory trials and/or pharmacokinetic BBB confirmation

**Conditions for Tier 2 elevation:**
- A published systematic review and meta-analysis pooling ≥3 RCTs in any GABA benefit domain with statistically significant pooled effect size (p<0.05), OR
- A large-N RCT (≥100 participants) demonstrating significant benefit in a primary outcome domain with GRADE Moderate or above, OR
- A direct pharmacokinetic demonstration of CNS-relevant GABA concentration after oral supplementation (resolving the BBB question would strengthen all clinical evidence GRADE ratings)

---

*Tier assignment completed: 2026-03-06 | Pipeline Mode: Evidence Update (Mode 2)*
