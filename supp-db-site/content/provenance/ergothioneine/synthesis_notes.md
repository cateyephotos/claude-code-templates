# Research Synthesis: Ergothioneine
## Pipeline Run: 2026-04-19

### Synthesis Methodology
- **Approach:** Narrative synthesis with quantitative effect-size extraction where reported (cohort hazard ratios) and qualitative integration for mechanistic findings
- **Effect-size metric used in `effectSizes`:** Hazard ratios from Smith 2020 (per 1 SD increase in plasma ergothioneine); pilot RCT efficacy is reported descriptively because the n=19 pilot was not powered for definitive effect-size estimation
- **Confidence assessment:** GRADE-aligned per per-study evaluation in `evidence_evaluation.md`

### Mechanism Synthesis

#### Mechanism: OCTN1/SLC22A4-mediated tissue accumulation
- **Sources:** Gründemann 2022 (PMID 34958679) primary; Borodina 2020 (PMID 32051057) supporting
- **Convergent evidence:** ETT/OCTN1 is universally accepted as the only well-defined ergothioneine transporter; without it the plasma membrane is essentially impermeable to ET
- **Tissue target determination:** Erythrocytes, neutrophils, monocytes/macrophages, eyes and skin (Gründemann 2022) — the cells with strongest SLC22A4 expression
- **Strength assignment:** Strong — multiple converging methodologies, no contradiction

#### Mechanism: Direct antioxidant — hydroxyl radical scavenging + singlet oxygen quenching + metal chelation
- **Sources:** Liu 2023 (PMID 36838636); Borodina 2020 (PMID 32051057)
- **Convergent evidence:** In vitro radical scavenging consistently demonstrated; the 2-mercaptohistidine trimethylbetaine structure has well-characterised radical chemistry
- **Caveat (Halliwell 2023):** In vivo evidence that antioxidant activity is the *principal* mechanism is weaker than in vitro evidence — separate mechanism cards (MPST, Nrf2) reflect this nuance
- **Strength assignment:** Strong (in vitro), supported by tissue retention story

#### Mechanism: Direct activation of mitochondrial 3-mercaptopyruvate sulfurtransferase (MPST)
- **Sources:** Sprenger 2025 (PMID 39965563) — primary, high-impact 2025 Cell Metab paper; Fong 2024 (PMID 38909533) supporting (mitochondrial uptake confirmation)
- **Convergent evidence:** Proteome-wide thermal stability identified MPST as the direct EGT target; biochemical activity assays + mouse exercise model corroborate
- **Strength assignment:** Strong — first physiologically relevant direct target identified

#### Mechanism: Nrf2 pathway modulation
- **Sources:** Tian 2023 (PMID 38018890)
- **Convergent evidence:** Predicted in horizons review; SLC22A4 knockout phenotype consistent with loss of Nrf2-dependent cytoprotection
- **Strength assignment:** Moderate (predicted, mechanistically plausible, less directly demonstrated than MPST)

### Benefit Synthesis

#### Benefit: Cardiovascular Health — reduced cardiovascular and all-cause mortality
- **Sources:** Smith 2020 (PMID 31672783) primary; Tian 2023 review (PMID 38018890) corroborating
- **Effect sizes reported:** HR=0.85 coronary disease (p=0.01); HR=0.79 cardiovascular mortality (p=0.002); HR=0.86 overall mortality (p=4e-5) per 1 SD increase in plasma ergothioneine
- **Pooled estimate:** N/A (single cohort)
- **Replication status:** Not yet independently replicated in a different cohort with the same exposure metric
- **Clinical significance threshold:** Hazard ratios ~0.79–0.86 over 21.4 years are substantial but observational; would translate to a clinically meaningful absolute risk reduction if causal
- **Confidence in claim:** Moderate (large well-conducted cohort with hard endpoints; observational design limits causality)

#### Benefit: Memory Enhancement — delayed cognitive decline in MCI
- **Sources:** Yau 2024 (PMID 39544014) — only completed RCT
- **Effect sizes reported:** Improved Rey Auditory Verbal Learning Test performance + stabilization of plasma neurofilament light chain (NfL); placebo arm showed significant NfL increase
- **Pooled estimate:** N/A (single small pilot)
- **Replication status:** None yet
- **Clinical significance threshold:** Stabilization of plasma NfL (a validated marker of neuro-axonal injury) is mechanistically meaningful even if the cognitive improvement requires confirmation
- **Confidence in claim:** Low for efficacy magnitude (n=19); Moderate for the qualitative direction

#### Benefit: Longevity — "longevity vitamin" classification + plausible healthspan support
- **Sources:** Ames 2018 (PMID 30322941) — conceptual framework; Tian 2023 (PMID 38018890) — confirms the framework with cohort data
- **Strength assignment:** Moderate — conceptual classification by a high-prestige author, endorsed in subsequent reviews

#### Benefit: Neuroprotection — frailty/cognition association + mouse lifespan extension
- **Sources:** Kondoh 2022 (PMID 35090053) human observational; Katsube 2024 (PMID 38446314) preclinical mouse
- **Convergent evidence:** Both human cross-sectional decline and mouse oral supplementation extending lifespan converge on neuroprotective profile
- **Confidence in claim:** Moderate (cross-species convergence, but no definitive human longevity-endpoint RCT)

#### Benefit: Cardiovascular Health — preclinical doxorubicin cardioprotection
- **Sources:** Cheah 2023 (PMID 36829879)
- **Strength assignment:** Preliminary — preclinical only; included to flag oncology supportive-care opportunity

### Safety Synthesis

#### Safety: Long-term human supplementation safety
- **Sources:** Yau 2024 (PMID 39544014) — 12-month placebo-controlled monitoring; Borodina 2020 (PMID 32051057) — regulatory + tox synthesis
- **Adverse-event aggregation:** No serious adverse events attributed to ergothioneine across the published human supplementation record
- **Risk-level determination:** Low — supported by GRAS / EFSA novel food approvals + 12-month RCT monitoring

### Dosage Synthesis

- **Optimal dosage determination:** 5–30 mg/day per published human-trial protocols (Yau 2024 used 25 mg three times per week intermittent dosing; Tian 2021 ErgMS protocol uses 5 or 30 mg/day continuous for 12 weeks)
- **Duration evidence:** Tissue retention via OCTN1 means weekly intermittent dosing can maintain plasma levels; longer durations (12 months) shown safe
- **No RDA or UL established** — flagged in the database `dosageRange` field

### Cross-Study Patterns
- **Consistent findings across all studies:** Plasma ergothioneine declines with age, frailty, and disease (consistent across Smith, Kondoh, Tian, Borodina, Halliwell). Higher levels track better outcomes.
- **Contradictory findings:** Halliwell 2023 (PMID 36623925, Annu Rev Food Sci) explicitly cautions that in vivo antioxidant activity has not been definitively demonstrated as the principal mechanism — discordant with simpler in vitro narrative. The MPST mechanism (Sprenger 2025) partly resolves this by identifying a non-antioxidant direct target.
- **Dose-response relationship:** Not yet characterised in humans; ErgMS will be the first dose-response study.
- **Population-specific effects:** Stronger signal in older adults, frail elderly, and those with low baseline plasma ergothioneine.

### Limitations of This Synthesis
1. The completed RCT base is a single n=19 pilot — efficacy magnitudes are tentative
2. The mortality cohort is a single Swedish population; external generalisability and residual dietary confounding remain open questions
3. No head-to-head trials against other antioxidants
4. The MPST mechanism is established preclinically (mouse exercise) — human translation pending

### Date of Last Search
All evidence current as of: **2026-04-19**
Next scheduled review: **2027-04-19** (or sooner if an adequately powered RCT is published)
