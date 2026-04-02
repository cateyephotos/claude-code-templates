# Evidence Evaluation: Green Tea Extract / EGCG (ID 24)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update

### Evaluation Framework
- **Primary:** GRADE (Grading of Recommendations Assessment, Development and Evaluation)
- **Bias assessment:** Cochrane Risk of Bias 2.0 (for RCTs); AMSTAR-2 (for systematic reviews/meta-analyses)
- **Evidence level mapping:**
  - Level 1: Systematic review/meta-analysis of high-quality RCTs
  - Level 2: Well-designed RCT or high-quality systematic review of lower-quality RCTs
  - Level 3: Cohort/pharmacokinetic modeling with human data
  - Level 4: Non-randomized controlled study or case series
  - Level 5: Expert opinion, mechanistic review, in vitro/animal

---

### Per-Study GRADE Evaluation

---

#### Study 1: mokra_2022_cellular_mechanisms
**Paper:** Mokra D et al. 2022, Int J Mol Sci, PMID 36613784, DOI 10.3390/ijms24010340
**Type:** Narrative review — EGCG cellular signaling mechanisms
**Assigned Evidence Level:** Level 2 (high-quality mechanistic review with synthesis of multiple experimental sources)

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Low concern | Review of established molecular biology; no experimental data generated; primary risk is selection bias in paper choice |
| Inconsistency | Not serious | Mechanistic pathways (NF-κB, MAPK, PI3K/Akt) are well-established across cited studies |
| Indirectness | Serious | Primarily in vitro and animal mechanistic data; limited direct human cellular evidence |
| Imprecision | Not serious | Mechanistic reviews do not require precision estimates |
| Publication bias | Suspected | Positive mechanistic findings more likely published; narrative review inherits this bias |

**Overall GRADE Certainty:** Moderate (for mechanism description purpose)
**Assigned Section:** mechanisms
**Notes:** Acceptable for mechanism section despite indirect evidence; explicitly labeled as mechanistic review.

---

#### Study 2: yang_2016_egcg_interactions
**Paper:** Yang CS et al. 2016, Mol Nutr Food Res, PMID 26577614, DOI 10.1002/mnfr.201500428
**Type:** Review article — EGCG macromolecular interactions and targets
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Low concern | High-quality review from established EGCG research group; well-cited foundational reference |
| Inconsistency | Not serious | DYRK1A inhibition and metabolic targets are independently replicated in literature |
| Indirectness | Serious | Mechanistic targets described mostly from in vitro binding studies |
| Imprecision | Not serious | Mechanistic categorization, not effect size estimation |
| Publication bias | Suspected | Review may preferentially select confirmatory mechanisms |

**Overall GRADE Certainty:** Moderate
**Assigned Section:** mechanisms
**Notes:** Foundational for DYRK1A inhibition mechanism and EGCG metabolic target identification.

---

#### Study 3: rondanelli_2021_weight_metabolic
**Paper:** Rondanelli M et al. 2021, Nutrients, PMID 33671139, DOI 10.3390/nu13020644
**Type:** Systematic review + meta-analysis (15 RCTs, n=499)
**Assigned Evidence Level:** Level 1

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Some concerns | Heterogeneous RCTs pooled; not all included trials low risk; trial durations varied (4–24 weeks) |
| Inconsistency | Serious | I² values for body weight ~60%; high heterogeneity; subgroup analyses reduce heterogeneity but introduce multiplicity |
| Indirectness | Not serious | Directly relevant populations (overweight/obese adults) with direct outcomes (body weight, fat mass) |
| Imprecision | Not serious | n=499 pooled; confidence intervals are narrow for body weight endpoint |
| Publication bias | Suspected | Funnel plot asymmetry not shown; small trial bias possible |

**Overall GRADE Certainty:** Moderate (downgraded once for inconsistency; body weight endpoint)
**Assigned Section:** benefits (Metabolic Health), dosage
**Notes:** Best available pooled evidence for GTE metabolic effects. Dosage subgroup (200–400 mg EGCG/day) directly informs dosage section.

---

#### Study 4: asbaghi_2020_t2dm_meta
**Paper:** Asbaghi O et al. 2020, Complement Med Res, PMID 33207344, DOI 10.1159/000511665
**Type:** Meta-analysis (11 RCTs, T2DM population)
**Assigned Evidence Level:** Level 1

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Some concerns | T2DM RCTs have variable blinding and allocation concealment quality |
| Inconsistency | Serious | Heterogeneity for HbA1c endpoint; some trials show null results |
| Indirectness | Not serious | Direct T2DM population; glucose and HbA1c primary endpoints |
| Imprecision | Not serious | 11 RCTs provide adequate power for pooled estimate |
| Publication bias | Suspected | Positive result reporting in supplement literature common |

**Overall GRADE Certainty:** Moderate
**Assigned Section:** benefits (Metabolic Health)
**Notes:** T2DM-specific meta-analysis provides independent confirmation of glucose lowering effect, distinct from Rondanelli 2021 which focuses on body composition.

---

#### Study 5: haghighatdoost_2018_leptin_meta
**Paper:** Haghighatdoost F et al. 2018, Nutrition, PMID 29129232, DOI 10.1016/j.nut.2017.06.022
**Type:** Meta-analysis (11 RCTs, hormonal endpoints)
**Assigned Evidence Level:** Level 1

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Some concerns | Variable trial quality; leptin/ghrelin measurement variability |
| Inconsistency | Serious | Null result with heterogeneous point estimates across trials |
| Indirectness | Not serious | Direct measurement of hormonal endpoints in humans |
| Imprecision | Not serious | Adequately powered with 11 RCTs |
| Publication bias | Undetected | Null result is less susceptible to publication bias; this paper itself is informative negative evidence |

**Overall GRADE Certainty:** Moderate (for null result)
**Assigned Section:** benefits (Metabolic Health)
**Notes:** Null result for leptin/ghrelin is important negative evidence — GTE metabolic effects appear mediated by non-hormonal pathways. Correctly included despite negative finding.

---

#### Study 6: bagheri_2020_antiinflam_rct
**Paper:** Bagheri R et al. 2020, Br J Clin Pharmacol, PMID 31747468, DOI 10.1111/bcp.14176
**Type:** RCT (n=30, IL-6, TNF-α, CRP endpoints)
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Some concerns | Small sample size (n=30); British Journal of Clinical Pharmacology indicates peer review quality, but limited blinding detail in abstract |
| Inconsistency | Not serious | Single trial — inconsistency not assessable at individual study level |
| Indirectness | Not serious | Human trial with direct inflammatory biomarker endpoints |
| Imprecision | Serious | n=30 is underpowered for definitive conclusions; wide CIs expected |
| Publication bias | Not applicable | Single study assessment |

**Overall GRADE Certainty:** Low (downgraded for risk of bias + imprecision)
**Assigned Section:** benefits (Anti-inflammatory)
**Notes:** Supporting evidence for anti-inflammatory benefit; only available human anti-inflammatory RCT with IL-6/TNF-α/CRP endpoints. Strength appropriately labeled "Moderate" reflecting this limited evidence base.

---

#### Study 7: roberts_2021_metabolic_rct
**Paper:** Roberts JD et al. 2021, Nutrients, PMID 33652910, DOI 10.3390/nu13030764
**Type:** RCT (n=27, fat oxidation via indirect calorimetry)
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Some concerns | Small sample; overweight women only (restricted generalizability); Nutrients is open-access with variable peer review |
| Inconsistency | Not applicable | Single trial |
| Indirectness | Moderate | n=27 overweight women — limited generalizability to broader populations |
| Imprecision | Serious | Small sample; indirect calorimetry outcome is surrogate for clinical weight loss |
| Publication bias | Not applicable | Single study |

**Overall GRADE Certainty:** Low
**Assigned Section:** benefits (Metabolic Health)
**Notes:** Mechanistically informative for fat oxidation pathway. Effect (+16% fat oxidation) is objectively measured but clinical translation requires larger confirmatory trials.

---

#### Study 8: delatorre_2016_cognitive_ds
**Paper:** de la Torre R et al. 2016, Lancet Neurology, PMID 27302362, DOI 10.1016/S1474-4422(16)30034-5
**Type:** Phase 2 RCT (n=84, Down syndrome, cognitive endpoints)
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Low | Lancet Neurology Phase 2 RCT; high methodological quality; randomized, placebo-controlled, double-blind |
| Inconsistency | Not applicable | Single trial |
| Indirectness | Serious | Down syndrome population — benefits may not generalize to neurotypical adults |
| Imprecision | Some concerns | n=84 is small for Phase 2; 12-month duration; confidence in effect size limited |
| Publication bias | Low | Lancet Neurology publication standard; negative findings less likely suppressed at this journal |

**Overall GRADE Certainty:** Moderate (within Down syndrome population; downgraded for imprecision)
**Assigned Section:** benefits (Cognitive Function)
**Notes:** Best single cognitive RCT. DYRK1A mechanism is mechanistically confirmed (plasma DYRK1A activity measured). Direct extrapolation to general cognitive enhancement in healthy adults is not supported.

---

#### Study 9: delatorre_2019_cognitive_fragilex
**Paper:** de la Torre R et al. 2019, Clin Nutr, PMID 30962103, DOI 10.1016/j.clnu.2019.02.028
**Type:** Phase 1 RCT (n=27, Fragile X Syndrome)
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Low | Phase 1 RCT design; same research group as delatorre_2016 (consistent methodology) |
| Inconsistency | Not applicable | Single trial |
| Indirectness | Serious | Fragile X Syndrome — genetic neurodevelopmental disorder with atypical neurochemistry |
| Imprecision | Serious | Phase 1 trial, n=27; powered for safety, not efficacy |
| Publication bias | Moderate | Small cognitive Phase 1 trials may not be replicated if null |

**Overall GRADE Certainty:** Low
**Assigned Section:** benefits (Cognitive Function)
**Notes:** Extends GTE cognitive evidence to a second neurodevelopmental condition (FMRP deficiency, not trisomy 21). Safety data collected alongside cognition endpoints.

---

#### Study 10: dietz_2017_attention_rct
**Paper:** Dietz C et al. 2017, Food Res Int, PMID 28784536, DOI 10.1016/j.foodres.2017.05.002
**Type:** RCT (n=23, healthy adults, attention and working memory)
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Some concerns | Combined EGCG + L-theanine + caffeine intervention; cannot isolate EGCG contribution |
| Inconsistency | Not applicable | Single trial |
| Indirectness | Serious | Combination product confounds single-ingredient attribution |
| Imprecision | Serious | n=23 is small; cognitive endpoints via neuroimaging (fMRI) and working memory tests |
| Publication bias | Suspected | Small positive cognitive trials in supplement literature commonly published |

**Overall GRADE Certainty:** Very Low
**Assigned Section:** benefits (Cognitive Function)
**Notes:** The combination product design substantially limits ability to attribute effects to EGCG specifically. Included as supporting evidence with appropriate caveats.

---

#### Study 11: cieuta_walti_2022_safety_ds
**Paper:** Cieuta-Walti C et al. 2022, Genet Med, PMID 35951014, DOI 10.1016/j.gim.2022.06.011
**Type:** Phase 1/2 safety trial (n=73, 24-month duration, Down syndrome)
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Low | Prospective, structured safety monitoring; LFTs, CBC, metabolic panel collected at regular intervals |
| Inconsistency | Not applicable | Single cohort study |
| Indirectness | Moderate | Down syndrome population; dosing may differ from general supplement use, but safety mechanisms (hepatotoxicity) are not population-specific |
| Imprecision | Moderate | n=73 for 24 months is adequate for common adverse events but may miss rare events |
| Publication bias | Low | Safety trials with negative/null safety findings are published; Genet Med is reputable |

**Overall GRADE Certainty:** Moderate (for safety outcomes)
**Assigned Section:** safety (Hepatotoxicity risk)
**Notes:** 24-month monitoring is the longest GTE safety follow-up in any human trial. No serious hepatotoxic events at 450 mg/day EGCG in this cohort is informative. Standard LFT monitoring protocol can be extracted for clinical guidance.

---

#### Study 12: yan_2025_hepatotoxicity_review
**Paper:** Yan Z & Cao J 2025, Biomedicines, PMID 39857788, DOI 10.3390/biomedicines13010206
**Type:** Review article — EGCG hepatotoxicity mechanisms
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Low concern | 2025 review; covers dose-response, fasting state amplification, and genetic risk factors |
| Inconsistency | Not serious | Hepatotoxicity mechanisms (mitochondrial dysfunction, oxidative stress) are consistent across reviewed studies |
| Indirectness | Moderate | Mechanism review synthesizes in vitro, animal, and case report data; limited human RCT safety data |
| Imprecision | Not serious | Safety reviews describe qualitative dose-response relationships |
| Publication bias | Suspected | Hepatotoxicity case reports may be under-reported in supplement literature |

**Overall GRADE Certainty:** Moderate (for safety characterization)
**Assigned Section:** safety (Hepatotoxicity risk)
**Notes:** Most current (2025) hepatotoxicity review. Critical for risk stratification: fasted state use substantially increases hepatotoxicity risk; dose-response threshold identified (~800 mg EGCG/day fasted).

---

#### Study 13: winiarska_2024_dili_review
**Paper:** Winiarska-Mieczan A et al. 2024, Nutrients, PMID 39275155, DOI 10.3390/nu16172837
**Type:** Review article — DILI (Drug-Induced Liver Injury) from GTE
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Low concern | Nutrients 2024; covers paradoxical hepatoprotective/hepatotoxic duality |
| Inconsistency | Not serious | Dual role (hepatoprotective at low doses, hepatotoxic at high doses) is mechanistically coherent |
| Indirectness | Moderate | Primarily case-report and animal data for hepatotoxicity portion; hepatoprotective human data at standard doses |
| Imprecision | Not serious | Qualitative safety characterization |
| Publication bias | Suspected | Hepatotoxicity cases may be under-attributed to GTE in practice |

**Overall GRADE Certainty:** Moderate
**Assigned Section:** safety (Hepatotoxicity risk)
**Notes:** Provides important risk stratification framework: dietary GTE consumption (green tea as beverage) is hepatoprotective; concentrated EGCG supplements at high doses pose DILI risk. Clinically actionable distinction.

---

#### Study 14: abe_2018_drug_interaction
**Paper:** Abe O et al. 2018, Eur J Clin Pharmacol, PMID 29480324, DOI 10.1007/s00228-018-2436-2
**Type:** Pharmacokinetic RCT crossover study (n=13, healthy volunteers)
**Assigned Evidence Level:** Level 2

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Low | Prospective crossover PK study; well-controlled in healthy volunteers; Eur J Clin Pharmacol peer review standard |
| Inconsistency | Not applicable | Single trial |
| Indirectness | Moderate | n=13 healthy volunteers; nadolol as model OATP1A2 substrate; extrapolation to other substrates requires additional evidence |
| Imprecision | Moderate | Small sample, but PK studies require fewer participants when outcome is plasma concentration |
| Publication bias | Low | Critical safety finding with clear clinical significance; unlikely suppressed |

**Overall GRADE Certainty:** Moderate
**Assigned Section:** safety (Drug interaction)
**Notes:** Only human clinical trial confirming EGCG-OATP1A2 drug interaction. 85% AUC reduction for nadolol is large, clinically significant, and represents critical safety information for concurrent beta-blocker users. OATP1A2 substrate class includes other cardiac and statin drugs.

---

#### Study 15: hodges_2023_pharmacokinetics
**Paper:** Hodges JK et al. 2023, Nutrients, PMID 37764804, DOI 10.3390/nu15184021
**Type:** Population pharmacokinetic compartmental model from human data
**Assigned Evidence Level:** Level 3

| GRADE Domain | Rating | Justification |
|--------------|--------|---------------|
| Risk of bias | Low | Retrospective PK modeling from controlled human bioavailability studies |
| Inconsistency | Low | PK parameters (Tmax, t½, bioavailability) are consistent with earlier human PK studies |
| Indirectness | Not serious | Human PK data directly applicable to dosing guidance |
| Imprecision | Moderate | Modeling study n=19; population parameters may not capture individual variability |
| Publication bias | Low | PK modeling studies are technically niche; not subject to typical supplement publication bias |

**Overall GRADE Certainty:** Moderate (for dosing guidance purpose)
**Assigned Section:** dosage
**Notes:** Provides the most up-to-date compartmental PK model for EGCG in humans. Bioavailability (~30–50% depending on food state), Tmax (~1.5 hours), and t½ (~2.5 hours) are directly relevant to dosing interval design. Food effect (food reduces AUC but also reduces hepatotoxicity) is clinically important trade-off.

---

### Aggregate Quality Metrics

| Metric | Value |
|--------|-------|
| Total papers evaluated | 14 |
| Average GRADE certainty | Moderate |
| Papers with High certainty | 0 |
| Papers with Moderate certainty | 9 |
| Papers with Low certainty | 4 |
| Papers with Very Low certainty | 1 (dietz_2017 — combination product) |
| Evidence level distribution | Level 1: 3 (meta-analyses) · Level 2: 10 (RCTs, reviews) · Level 3: 1 (PK model) |
| Total RCTs | 6 primary RCTs (bagheri, roberts, delatorre_2016, delatorre_2019, dietz, abe) + 3 meta-analyses pooling additional RCTs |
| Total pooled subjects | ~650+ (individual RCTs) + ~499 meta-analyzed (Rondanelli) + ~11 RCTs (Asbaghi) |
| Largest single study | delatorre_2016: n=84 (Phase 2 RCT, Down syndrome) |
| Most recent study | yan_2025 (2025 hepatotoxicity review) |
| Oldest included study | haghighatdoost_2018 (2018) — no papers before 2016 |
| Independent research groups | 5+ (Rondanelli team Italy; Asbaghi team Iran; de la Torre team Spain; Roberts team UK; Hodges team USA) |
| Industry funding disclosed | Not reported in abstracts; potential bias acknowledged |
| Geographic diversity | Italy, Iran, Spain, UK, USA, Germany, Japan, China represented |

### Publication Bias Assessment
Formal funnel plot not possible from narrative review process. Qualitative assessment:
- **Metabolic/weight outcomes**: Positive findings dominate published literature; true effect may be smaller due to publication bias
- **Cognitive outcomes**: Special population focus (Down syndrome) limits publication bias — these trials are disease-specific, not supplement-marketing-driven
- **Hepatotoxicity**: Under-reporting likely (case report-based); true hepatotoxicity incidence uncertain
- **Drug interactions**: Single well-designed PK trial; less susceptible to bias

### Funding Source Analysis
- Academic/institutional funding predominant for included studies
- No obvious industry funding conflicts identified in the included 14 papers
- Industry-sponsored GTE trials were present in the candidate pool but not included due to quality thresholds or being superseded by higher-quality evidence

---

### Summary Quality Assessment

**Strengths of the evidence base:**
- Three independent meta-analyses across different metabolic outcomes (body composition, glycemic, hormonal) provide convergent evidence
- Largest available GTE safety dataset (24-month) included
- Only human OATP1A2 drug interaction trial included — critical safety finding
- 2025 hepatotoxicity review represents the most current safety evidence
- Evidence spans multiple independent research groups across 5+ countries

**Limitations of the evidence base:**
- No single general-population RCT with n>200 exists for GTE
- Cognitive benefits exclusively demonstrated in neurodevelopmental special populations
- Combination product confounder in the only healthy-adult cognitive trial (Dietz 2017)
- Heterogeneity in metabolic meta-analyses (I²~60%) limits precision of pooled estimates
- Optimal dosing remains empirically uncertain; most effective form (GTE standardization, free vs. encapsulated EGCG) not fully resolved

**Evidence Confidence for Database Claims:**
- Metabolic health (weight, glucose): Moderate confidence
- Anti-inflammatory: Low-to-moderate confidence (single small RCT)
- Cognitive function (general population): Very low confidence
- Cognitive function (Down syndrome): Moderate confidence (within population)
- Hepatotoxicity dose-response: Moderate confidence
- Drug interaction (nadolol/OATP1A2): Moderate confidence (single PK trial, large effect size)
- Dosing guidance (200–400 mg/day with food): Moderate confidence
