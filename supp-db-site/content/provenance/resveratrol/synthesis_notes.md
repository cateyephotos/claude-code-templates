# Research Synthesis: Resveratrol (ID: 27)
## Pipeline Run: 2026-03-06

---

### Synthesis Methodology

- **Approach:** Narrative synthesis with quantitative effect size extraction from meta-analyses
- **Effect size metric:** Standardized mean difference (SMD/WMD) where available; Cohen's d for RCTs
- **Confidence assessment:** GRADE certainty of evidence
- **Priority hierarchy:** Umbrella meta-analysis > individual meta-analyses > individual RCTs > systematic reviews
- **Null finding policy:** NULL results are explicitly documented as unsupported claims; they are NOT omitted

---

### Mechanism Synthesis

#### Mechanism 1: NF-κB Anti-Inflammatory Pathway
- **Sources:** molani_gol_2024_umbrella, gorabi_2021_crp, teimouri_2022_cvd, hosseini_2020_crp_t2d
- **Convergent evidence:** All four synthesis papers demonstrate CRP/hs-CRP reductions in humans; Molani-Gol 2024 umbrella confirms across 81 RCTs; WMD for CRP approximately -0.5 to -1.2 mg/L depending on subpopulation and dose; Gorabi 2021 (35 RCTs) most definitive
- **Divergent evidence:** Effect sizes vary substantially by population (T2D shows stronger effects); dose-response relationship not linear; anti-inflammatory effects may be secondary to metabolic effects rather than direct NF-κB inhibition
- **Strength assignment rationale:** "Moderate" — strong indirect clinical evidence but direct NF-κB pathway measurement in humans limited to a small number of RCTs measuring downstream biomarkers only; mechanism inferred from population-level CRP changes and pre-clinical mechanistic data
- **Tissue target determination:** Systemic (vascular endothelium, adipose tissue, liver); NF-κB is ubiquitously expressed; primary clinical readout is circulating CRP

#### Mechanism 2: eNOS/Nitric Oxide Endothelial Activation
- **Sources:** mohammadipoor_2022_endothelial, kennedy_2010_cbf, wong_2013_fmd, wightman_2015_cbf_cognitive
- **Convergent evidence:** FMD improvement in obese adults (Wong 2013); acute CBF increase with dose-response (Kennedy 2010); chronic CBF improvement over 28 days (Wightman 2015); endothelial function meta-analysis (17 studies, Mohammadipoor 2022)
- **Divergent evidence:** Kennedy 2010 (acute, n=22) vs Thaung Zaw 2021 (chronic 24-month) — acute CBF effects may not predict long-term vascular outcomes; FMD magnitude modest
- **Strength assignment rationale:** "Moderate" — mechanistically coherent and supported by multiple RCTs with direct vascular measurements; eNOS activation plausible from pre-clinical data; effect sizes modest (FMD WMD ~1-2%)
- **Tissue target determination:** Vascular endothelium; cerebral vasculature for CBF; peripheral vasculature for FMD

#### Mechanism 3: SIRT1 Pathway Activation (RECLASSIFIED TO THEORETICAL)
- **Sources:** mansouri_2025_sirt1 (primary), molani_gol_2024_umbrella (contextual)
- **Convergent evidence:** Mansouri 2025 meta-analysis (11 RCTs) finds NULL effect on SIRT1 gene expression, SIRT1 protein, and serum SIRT1 in humans — this is the most rigorous test of the SIRT1 hypothesis in humans to date
- **Divergent evidence:** Pre-clinical (in vitro, animal) evidence for SIRT1 activation is robust; the discordance between pre-clinical and clinical findings is the key issue; Mansouri 2025 does not preclude that resveratrol has indirect effects via other sirtuins (SIRT3, SIRT5) or that SIRT1 effects are tissue-specific and not reflected in blood biomarkers
- **Strength assignment rationale:** "Theoretical" — Despite being resveratrol's most historically prominent proposed mechanism, human RCT evidence does not support direct SIRT1 activation. Retained as "Theoretical" (not "Disproven") because: (1) the null finding could reflect biomarker limitations rather than absence of effect, (2) tissue-specific SIRT1 changes in muscle or adipose are not captured by serum measures, (3) other sirtuin isoforms may be active
- **Critical note for database:** Previous database entry (27_enhanced.js prior version) classified SIRT1 as "Strong" mechanism — this is directly contradicted by Mansouri 2025 and corrected in this pipeline run

#### Mechanism 4: Antioxidant/ROS Scavenging
- **Sources:** gorabi_2021_crp (indirect via oxidative stress marker reduction), molani_gol_2024_umbrella (umbrella context)
- **Convergent evidence:** Antioxidant capacity mechanistically attributed in many studies; indirect evidence from reduced inflammatory biomarkers; no dedicated meta-analysis on antioxidant capacity endpoints specifically
- **Divergent evidence:** Direct antioxidant effects in vivo are modest and may not persist at physiological doses; most antioxidant data from in vitro or animal studies
- **Strength assignment rationale:** "Weak" — antioxidant activity is chemically real (polyphenol structure) but clinical relevance of dietary dose antioxidant effects is questioned; no dedicated human meta-analysis on oxidative stress primary endpoints

---

### Benefit Synthesis

#### Benefit 1: Anti-Inflammatory Effects (CRP/hs-CRP)
- **Sources:** molani_gol_2024_umbrella, gorabi_2021_crp, teimouri_2022_cvd, hosseini_2020_crp_t2d
- **Effect sizes reported:**
  - Gorabi 2021 (35 RCTs): WMD for CRP = approximately -0.87 mg/L (significant)
  - Hosseini 2020 (T2D, 6 RCTs): SMD ~-0.52 for CRP (significant in T2D)
  - Teimouri 2022 (CVD, 6 RCTs): significant reduction in CRP and IL-6
  - Molani-Gol 2024 (umbrella): confirms anti-inflammatory as most robustly supported domain
- **Pooled estimate:** Moderate reduction in CRP (~0.5-0.9 mg/L WMD); effect strongest in metabolic disease populations (T2D, obesity, CVD)
- **Replication status:** Well-replicated (multiple independent meta-analyses from different research groups across different populations)
- **Clinical significance threshold:** CRP reduction of 0.5-1.0 mg/L may be clinically meaningful in high-baseline populations (CVD, T2D); less clear in healthy populations with normal baseline CRP
- **Confidence in claim:** Moderate-High; anti-inflammatory is resveratrol's most evidence-supported clinical effect

#### Benefit 2: Body Composition (Weight, BMI, Waist Circumference)
- **Sources:** mousavi_2018_obesity, lahouti_2025_t2d_anthropometrics, molani_gol_2024_umbrella
- **Effect sizes reported:**
  - Mousavi 2018 (28 trials, obesity): significant reductions in weight and BMI; WMD for weight ~-0.5 to -1.5 kg (small-moderate)
  - Lahouti 2025 (11 trials, T2D, n=614): significant reductions in body weight, BMI, waist circumference
  - Molani-Gol 2024: confirms body composition as supported domain
- **Pooled estimate:** Small but significant reductions in weight (-0.5 to -1.5 kg) and BMI in overweight/obese and T2D populations; not a weight loss agent per se
- **Replication status:** Replicated (2 independent meta-analyses in 2 different populations — obesity and T2D)
- **Clinical significance threshold:** 0.5-1.5 kg weight reduction alone is not clinically meaningful; potential for additive benefit with lifestyle intervention
- **Confidence in claim:** Moderate; effect is real but small and of uncertain clinical significance

#### Benefit 3: Endothelial Function / Vascular Health
- **Sources:** mohammadipoor_2022_endothelial, wong_2013_fmd
- **Effect sizes reported:**
  - Mohammadipoor 2022 (17 studies): significant improvements in FMD, NO bioavailability, ICAM-1; meta-analytic pooled effect for FMD WMD ~1-2%
  - Wong 2013 (n=28, 6 weeks): FMD improvement in obese adults; specific WMD ~2% FMD improvement
- **Pooled estimate:** FMD improvement ~1-2% in populations with endothelial dysfunction; consistent with eNOS activation hypothesis
- **Replication status:** Replicated in meta-analytic context (17 studies) and confirmed by independent RCTs
- **Confidence in claim:** Moderate; clinically meaningful FMD improvements require >2% threshold which is borderline

#### Benefit 4: Cognitive Function / Cerebral Blood Flow
- **Sources:** thaung_zaw_2020_cognitive, kennedy_2010_cbf, wightman_2015_cbf_cognitive, de_vries_2022_memory
- **Effect sizes reported:**
  - Thaung Zaw 2021 (n=125, 24 months): significant improvements in spatial working memory and cognitive composite at 75mg twice daily; specific SMD not reported but statistically significant
  - Kennedy 2010 (n=22, acute): dose-dependent CBF increase; 500mg produced greater increase than 250mg or placebo
  - Wightman 2015 (n=41-53, 28 days): improved CBF and cognitive outcomes in some measures
- **Pooled estimate:** No dedicated resveratrol cognitive meta-analysis; de Vries 2022 (polyphenol class) shows mixed results; cognitive effects are promising but require dedicated meta-analysis to establish pooled effect size
- **Replication status:** Replicated across 3 independent RCTs (Kennedy, Wightman, Thaung Zaw) — all show CBF/cognitive improvements but varying endpoints and populations
- **Confidence in claim:** Moderate; cognitive benefit is best supported in postmenopausal women (Thaung Zaw) and via CBF mechanism (Kennedy, Wightman); generalizability uncertain

#### Benefit 5: Adipokine Modulation
- **Sources:** mohammadi_sartang_2017_adipokines
- **Effect sizes reported:** Significant adiponectin increase; leptin reduction in overweight populations; specific SMD from meta-analytic pooling available in paper
- **Replication status:** Single meta-analysis (9 RCTs); not independently replicated as dedicated outcome
- **Confidence in claim:** Low-Moderate; adipokine modulation supported but single meta-analysis; 2017 data — may benefit from update

#### Benefit 6: PCOS Hormonal Outcomes
- **Sources:** fadlalmola_2023_pcos, larik_2023_pcos
- **Effect sizes reported:**
  - Fadlalmola 2023 (4 RCTs, n=218): reductions in testosterone, LH, FAI; improvements in insulin sensitivity in PCOS
  - Larik 2023 (3 RCTs, n=169): similar hormonal improvements; overlapping constituent trials
- **Pooled estimate:** Small but positive hormonal effects in PCOS; both meta-analyses reach significance for testosterone reduction
- **Replication status:** Two meta-analyses (partially overlapping constituent RCTs); minimal independent replication
- **Confidence in claim:** Low-Moderate (Preliminary); PCOS effects biologically plausible, small evidence base

#### Benefit 7: Liver Health (Subgroup Benefit)
- **Sources:** soltani_2023_liver
- **Effect sizes reported:** In NAFLD/metabolic liver disease subgroups, significant ALT/AST reductions; overall (37 trials) shows ALT reduction and ALP safety concern at >1000mg/day
- **Replication status:** Single large meta-analysis; NAFLD subgroup not independently confirmed
- **Confidence in claim:** Preliminary; liver benefit likely in metabolic liver disease subgroup; high-dose safety concern documented

#### Null Findings (Explicitly Documented)
- **Bone Density:** Li 2021 (10 trials, n=698) — no significant BMD improvement; bone health claim unsupported
- **SIRT1 Activation:** Mansouri 2025 (11 RCTs) — null for SIRT1 gene/protein/serum; SIRT1 mechanism not supported in humans
- **Postmenopausal Lipids:** Rodrigues Uggioni 2024 (2 trials) — null for lipid profiles in postmenopausal women; insufficient evidence for lipid claim in this population

---

### Safety Synthesis

#### Safety Aspect: General Tolerability
- **Sources:** soltani_2023_liver (primary for safety), thaung_zaw_2020_cognitive (24-month safety monitoring)
- **Adverse event aggregation:**
  - Standard doses (≤500mg/day): Well-tolerated; most common adverse events are mild GI symptoms (nausea, diarrhea, abdominal discomfort) — transient and not requiring discontinuation
  - High doses (>1000mg/day): ALP elevation signal in Soltani 2023 — clinically relevant liver enzyme change; mechanism unclear (possible interference with hepatic enzymes)
  - 24-month safety (Thaung Zaw 2021): No serious adverse events at 75mg twice daily in postmenopausal women over 2 years
- **Risk level determination:** Low at standard doses (≤500mg/day); caution warranted at >1000mg/day based on ALP signal

---

### Dosage Synthesis

- **Optimal dosage determination:** Meta-analytic dose range: 150-500mg/day covers the majority of trials; most significant effects observed at 250-500mg/day; Kennedy 2010 shows acute dose-response (500mg > 250mg for CBF); Thaung Zaw 2021 used 75mg twice daily (150mg/day total) for cognitive outcomes — lower end effective for CBF
- **Duration evidence:** Anti-inflammatory effects observed from 8-12 weeks in most meta-analyses; cognitive effects required 24 months for full benefit (Thaung Zaw); onset for vascular effects: 4-6 weeks (Wong 2013)
- **Formulation note:** Standard trans-resveratrol; bioavailability is low with single daily doses; twice-daily dosing (75mg x2) appears effective for cognitive outcomes

---

### Cross-Study Patterns

**Consistent findings across all studies:**
1. Anti-inflammatory (CRP/hs-CRP) reduction — strongest and most replicated finding
2. Body composition improvement in metabolic disease populations
3. Endothelial function improvement (FMD/CBF) at moderate doses
4. SIRT1 null result — consistent absence of SIRT1 activation in humans (Mansouri 2025)
5. Bone density — consistently null

**Contradictory findings:**
1. **Cognitive effects:** Thaung Zaw 2021 (positive, 24 months) vs. de Vries 2022 (mixed in polyphenol SR) — not truly contradictory but effect magnitude uncertain
2. **Lipid effects:** Some meta-analyses find modest LDL reduction in general populations; Rodrigues Uggioni 2024 finds null in postmenopausal — population-specific contradictions
3. **Effect persistence:** Acute CBF effects (Kennedy 2010) do not necessarily predict long-term cognitive benefit

**Dose-response relationship:**
Observed for CBF (Kennedy 2010: 500mg > 250mg acute); dose-response less clear for chronic anti-inflammatory effects; Soltani 2023 suggests safety threshold at ~1000mg/day (ALP elevation)

**Population-specific effects:**
- T2D population: Strongest anti-inflammatory and body composition effects
- Postmenopausal women: Cognitive effects well-studied (Thaung Zaw); no lipid benefit in this population
- Obesity: Body composition effects present; FMD improvement (Wong 2013)
- PCOS: Preliminary hormonal benefits

---

### Limitations of This Synthesis

1. **Publication bias:** Positive results likely overrepresented in supplement meta-analyses; null results may be underrepresented historically (though Mansouri 2025 and Li 2021 null results are high quality)
2. **Bioavailability heterogeneity:** Different formulations (standard, micronized, with piperine) have different bioavailability profiles; meta-analyses pool studies regardless of formulation
3. **Short study durations:** Most meta-analytic constituent RCTs are 8-12 weeks; insufficient to assess long-term efficacy or safety for chronic disease outcomes
4. **Population heterogeneity:** Meta-analyses pool healthy adults with metabolic disease patients; effects may differ substantially
5. **Mechanistic gap post-SIRT1:** The falsification of the SIRT1 hypothesis in humans (Mansouri 2025) leaves the primary mechanism unclear; NF-κB/eNOS evidence is indirect
6. **Cognitive evidence limitation:** No dedicated resveratrol cognitive meta-analysis exists; Thaung Zaw 2021 is the anchor study but requires independent replication
7. **PCOS evidence fragility:** Both PCOS meta-analyses (Fadlalmola 2023, Larik 2023) overlap in constituent RCTs; independent replication is limited

---

### Date of Last Search
All evidence current as of: **2026-03-06**
Next scheduled review: **2027-03-06**

### Summary Conclusion for Database Entry
Resveratrol is correctly classified at **Tier 2** with the following supported benefits: anti-inflammatory (Strong), body composition in metabolic disease (Moderate), endothelial/vascular function (Moderate), cognitive/CBF (Moderate, postmenopausal). The SIRT1 mechanism is reclassified to Theoretical based on 11-RCT null meta-analysis. Bone density benefit is explicitly unsupported. High-dose safety concern (ALP elevation at >1000mg/day) documented. This synthesis reflects a more accurate and nuanced picture than the prior database entry (Tier 3, 1 citation, SIRT1 Strong).
