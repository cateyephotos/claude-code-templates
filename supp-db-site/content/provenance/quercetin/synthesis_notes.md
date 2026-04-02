# Research Synthesis: Quercetin (ID 20)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update

### Synthesis Methodology
- **Approach:** Narrative synthesis with quantitative effect size extraction from included meta-analyses
- **Effect size metric:** Standardized Mean Difference (SMD/Cohen's d) where available; Weighted Mean Difference (WMD) for BP outcomes
- **Confidence assessment:** GRADE certainty of evidence per domain

---

### Critical Context: Corrections Made During This Run

This synthesis reflects CORRECTED findings. The previous database entry (20_enhanced.js, pre-2026-03-06) contained multiple citation errors and schema violations. All synthesis below is based on verified abstracts retrieved via PubMed MCP.

**Corrections applied:**
1. **mech_001 (Frenț):** Title was fabricated generic summary; corrected to actual PubMed title; year corrected 2023→2024; full author list added
2. **mech_004 (Salehi):** PMID 33553890 resolved to unrelated COVID CRISPR paper; replaced with correct PMID 32478277 (Salehi 2020, ACS Omega) found via DOI crosswalk
3. **ben_002 (Mohammadi-Sartang):** DOI unresolvable; claimed PMID 31213101 actually belongs to different paper (Ou 2019) with null findings; replaced with Tabrizi 2019 (PMID 31017459, 16 RCTs MetS) as primary inflammation meta-analysis; Ou 2019 retained but with corrected null-overall findings
4. **Safety section:** Rebuilt from plain citation string to schema-compliant CitationEvidence object with `adverseEvents[]` array
5. **Dosage section:** Rebuilt from custom non-standard fields to standard CitationEvidence citation group

---

### Mechanism Synthesis

#### Mechanism: Antioxidant and Anti-inflammatory Mechanisms
- **Sources:** frent_2024_systematic, aghababaei_2023_mechanisms, salehi_2020_therapeutic
- **Convergent evidence:** Three independent review papers (2020, 2023, 2024) consistently document quercetin's catechol B-ring structure as the basis for free radical scavenging. NF-κB inhibition and Nrf2 activation are reported across all three reviews as the primary anti-inflammatory molecular targets. Pro-inflammatory cytokines (IL-1β, IL-6, TNF-α) reduced in preclinical models in all three sources
- **Divergent evidence:** None at mechanistic level — consensus across reviews
- **Strength assignment rationale:** "Strong" — mechanistic consensus documented across 3 independent reviews spanning 4 years; backed by extensive in vitro and animal model data; clinical translation confirmed by Tabrizi 2019 meta-analysis
- **Tissue target determination:** Multiple organ systems (systemic); primary sites in immune cells (macrophages, T-cells) and vascular endothelium

#### Mechanism: Cardiovascular Protective Mechanisms
- **Sources:** zhang_2023_cardiovascular, salehi_2020_therapeutic
- **Convergent evidence:** Both reviews identify foam cell inhibition (reducing macrophage ox-LDL uptake), endothelial function improvement (eNOS upregulation, NO production), and anti-platelet effects as primary cardiovascular mechanisms. Atherosclerotic plaque stabilization via vascular smooth muscle cell inhibition noted in Zhang 2023
- **Divergent evidence:** Minor — Zhang 2023 is more specific to atherosclerosis; Salehi 2020 is broader; no contradictions
- **Strength assignment rationale:** "Moderate" — two converging reviews; mechanistic evidence strong; but clinical cardiovascular outcome data (from RCTs) shows only modest BP effects (Serban 2016 WMD ~3 mmHg)
- **Tissue target determination:** Vascular endothelium, coronary arteries, cardiac muscle

---

### Benefit Synthesis

#### Benefit: Exercise Recovery (Muscle Soreness, Oxidative Stress, CK)
- **Sources:** rojano_ortega_2023_exercise
- **Effect sizes reported:**
  - Muscle soreness: SMD = -1.33 (large effect, favoring quercetin)
  - Creatine kinase (CK): SMD = -1.15 (large effect)
  - Oxidative stress: SMD = -0.92 (large-to-moderate effect)
- **Pooled estimate:** Consistent large effects across 13 RCTs
- **Replication status:** "Well-replicated (13 RCTs in meta-analysis)" — multiple independent groups; European Journal of Nutrition peer review
- **Clinical significance threshold:** SMD ≥ 0.5 considered moderate clinical significance in sports medicine; all three outcomes exceed this threshold
- **Confidence in claim:** Moderate-High — 13 RCTs with consistent direction; concern about heterogeneity in protocols and small study effects
- **Note:** This is the strongest and most consistent clinical benefit in the quercetin evidence base

#### Benefit: Inflammation Reduction (MetS-Specific)
- **Sources:** tabrizi_2019_inflammation, ou_2019_crp
- **Effect sizes reported:**
  - Tabrizi 2019 (MetS, 16 RCTs): CRP SMD = -0.64 (p=0.001); IL-6 SMD = -0.74 (p<0.001); TNF-α SMD = -0.48 (p=0.007)
  - Ou 2019 (general population): No significant overall effects on CRP, IL-6, or TNF-α
- **Pooled estimate:** Population-dependent — significant positive effect specifically in MetS/metabolic disease patients; null in healthy general population
- **Replication status:** "Partially replicated — MetS-specific effects consistent within Tabrizi 2019; null result replicated in Ou 2019 for general population"
- **Note on corrected data:** The original database claimed Mohammadi-Sartang showed "significant CRP reduction" in a general population; this citation was unverifiable. The actual evidence picture is more nuanced: positive effects are MetS-specific (Tabrizi 2019 PMID 31017459), not general.
- **Confidence in claim:** Moderate for MetS populations specifically; Low for healthy general adults

#### Benefit: Blood Pressure Reduction
- **Sources:** serban_2016_blood_pressure
- **Effect sizes reported:**
  - SBP WMD = -3.04 mmHg (95% CI: -5.26 to -0.83, p = 0.007)
  - DBP WMD = -2.63 mmHg (95% CI: -4.38 to -0.88, p = 0.003)
- **Pooled estimate:** Small but statistically significant reduction in both SBP and DBP across 7 RCTs (n=587)
- **Replication status:** "Replicated across 7 independent RCTs" — consistent direction of effect
- **Clinical significance threshold:** 3 mmHg SBP reduction is at the lower boundary of clinical significance for individual patients but is meaningful at population level (~5% CVD event reduction per epidemiological models)
- **Confidence in claim:** Moderate — meta-analysis of 7 RCTs with consistent results; study age (2016) limits assessment of more recent evidence

#### Benefit: Senolytic Activity (Senescent Cell Clearance)
- **Sources:** hickson_2019_senolytic
- **Effect sizes reported:**
  - Adipose senescent cells: significant reduction (quantitative percentage not specified in abstract)
  - SASP markers: IL-1α, IL-6, MMP-9, MMP-12 all significantly reduced
  - Physical function: 6MWT improved post-treatment
- **Pooled estimate:** N/A — single pilot study (n=9)
- **Replication status:** "Not replicated — single Phase 1 pilot without placebo control"
- **Caveats:**
  1. Quercetin was administered as Dasatinib + Quercetin combination (D+Q); isolated quercetin effect cannot be determined
  2. IPF patients (systemic senescent cell burden) — results may not generalize to normal aging
  3. No placebo control — open-label design introduces performance/expectation bias
- **Confidence in claim:** Low — highly preliminary; landmark for proof-of-concept but insufficient for evidence-based recommendation

---

### Safety Synthesis

#### Safety Aspect: General Tolerability and Drug Interactions
- **Sources:** andres_2018_safety
- **Adverse event aggregation:** Andres 2018 systematic review pooled adverse event data across clinical trials ≤1000 mg/day:
  - Headache: mild, dose-related
  - GI upset: common at >500 mg/day without food
  - Tingling sensations: reported in several trials
  - Nephrotoxicity: observed at high doses in patients with pre-existing renal impairment
- **Drug interaction mechanism:** Quercetin inhibits CYP3A4 (reduces hepatic metabolism of co-administered drugs) and P-glycoprotein (increases gut absorption of some drugs). Clinically relevant for: quinolone antibiotics (reduced absorption), warfarin/blood thinners (increased plasma levels), ciclosporin (increased exposure)
- **Risk level determination:** "Low" at standard doses (≤1000 mg/day in healthy individuals); "Moderate" for patients with renal impairment or on CYP3A4-sensitive drugs

---

### Dosage Synthesis
- **Optimal dosage determination:**
  - Anti-inflammatory/BP effects: 500–1000 mg/day continuous (based on Tabrizi 2019 and Serban 2016 protocols)
  - Senolytic: 1250 mg/day quercetin + 100 mg dasatinib, intermittent "burst" protocol (3 days on, 4 days off, 3 weeks) per Hickson 2019
  - Exercise recovery: Variable across 13 RCTs in Rojano-Ortega 2023; most used 500–1000 mg/day for 2–12 weeks
- **Duration evidence:** Rojano-Ortega 2023 RCTs: 2–12 weeks for exercise outcomes; Serban 2016: 8 weeks average; Hickson 2019: 3-week senolytic protocol
- **Recommendation:** 500–1000 mg/day continuous for inflammation/BP/exercise; senolytic protocol requires medical supervision (dasatinib is prescription-only)

---

### Cross-Study Patterns
- **Consistent findings across all studies:** Quercetin reliably reduces biomarkers of oxidative stress and inflammation in metabolically compromised populations; BP-lowering effect is consistently positive
- **Contradictory findings:** Anti-inflammatory effect: positive in MetS (Tabrizi) vs null in general population (Ou) — represents population-dependent effect, not true contradiction
- **Dose-response relationship:** Not established — Serban 2016 showed no dose-response trend in available data; Andres 2018 notes safety profile changes at >1000 mg/day
- **Population-specific effects:** Effects consistently stronger in metabolically compromised, high-oxidative-stress, and exercising populations vs healthy, non-stressed adults

---

### Limitations of This Synthesis
1. **Combination therapy confound (senolytic):** Hickson 2019 used D+Q — quercetin's isolated contribution to senolytic effect is unknown
2. **Bioavailability heterogeneity:** Meta-analyses pool studies using different quercetin forms (powder, dihydrate, phytosome); bioavailability varies 5–10× between forms; this inflates within-meta-analysis heterogeneity
3. **Population specificity:** Most strong effects observed in disease populations (MetS, IPF, exercise-stressed athletes); generalization to healthy adults is limited
4. **2 unverifiable citations removed:** Mohammadi-Sartang (unresolvable DOI) and Derosa 2021 (wrong PMID) required exclusion; the original file's 12-citation evidence base is reduced to 10
5. **No Cochrane review available:** The absence of a Cochrane systematic review for quercetin supplementation represents a gap in independent high-quality meta-analytic synthesis

### Date of Last Search
All evidence current as of: 2026-03-06
Next scheduled review: 2027-03-06
