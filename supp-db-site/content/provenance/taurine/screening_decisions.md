# Screening Decisions: Taurine (ID: 39)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Inclusion Criteria

Studies were included if they met ALL of the following:
1. Peer-reviewed publication in indexed journal
2. Subject of investigation is taurine supplementation or taurine physiology in humans or relevant animal models
3. DOI resolves to the correct publication (verified via CrossRef API)
4. PMID confirmed against PubMed database
5. Study type is mechanistic review, clinical trial, systematic review, or meta-analysis

---

## Exclusion Criteria

Studies were excluded if ANY of the following applied:
1. Conference abstracts, preprints, or non-peer-reviewed publications
2. Combination supplement studies where taurine effects cannot be isolated
3. Studies using only animal models for clinical benefit claims (animal models retained for mechanism documentation only)
4. DOI or PMID unverifiable
5. Duplicate publication of the same dataset

---

## Per-Citation Screening Decisions

### INCLUDED CITATIONS

#### Schaffer 2010 — PMID 20804594
**Decision: INCLUDE**
**Rationale:** Peer-reviewed comprehensive review in Journal of Biomedical Science; directly characterizes calcium regulation and muscle physiology mechanisms; high citation count in taurine literature; DOI verified.

#### Ripps & Shen 2012 — PMID 23170060
**Decision: INCLUDE**
**Rationale:** Peer-reviewed comprehensive review in Molecular Vision; establishes taurine's role as osmolyte and membrane stabilizer; widely cited foundational review; PMID confirmed.

#### Huxtable 1992 — PMID 1731369
**Decision: INCLUDE**
**Rationale:** Seminal foundational review in Physiological Reviews (highest-impact physiology journal); 1992 publication establishes correct publicationSpan start date; over 2,500 citations; comprehensive characterization of all taurine physiological actions; DOI verified.

#### Wu & Prentice 2010 — PMID 20804583
**Decision: INCLUDE**
**Rationale:** Peer-reviewed comprehensive review in Journal of Biomedical Science; directly characterizes CNS role including GABA receptor modulation; co-published with Schaffer 2010 in dedicated taurine supplement issue; DOI verified.

#### Waldron et al. 2018 — PMID 29546641
**Decision: INCLUDE — Primary clinical evidence anchor**
**Rationale:** Systematic review and meta-analysis in Sports Medicine (IF ~11); 10 included studies; Hedges' g=0.40 (p=0.004) for endurance performance; highest-quality clinical evidence in the portfolio; directly establishes the primary clinical claim with quantified effect size; DOI verified.

#### Carvalho et al. 2021 — PMID 34421639
**Decision: INCLUDE**
**Rationale:** Systematic review in Frontiers in Physiology; establishes dose-response relationships for aerobic and strength exercise; recent (2021) publication; provides complementary evidence to Waldron 2018 with additional dose specificity; DOI verified.

#### Militante & Lombardini 2002 — PMID 12436202
**Decision: INCLUDE (with note)**
**Rationale:** Peer-reviewed comprehensive review in Amino Acids journal; relevant cardiovascular and diabetic complication evidence; PMID confirmed. NOTE: The citationId `militante_2013_cardiovascular` contains incorrect year label (2013); actual publication year is 2002. Data fields (year, doi, pmid) are correct.

#### Zhang et al. 2004 — PMID 15464106
**Decision: INCLUDE (with note)**
**Rationale:** Peer-reviewed review in European Journal of Pharmacology; characterizes cardiovascular effects and aging relationship; PMID confirmed. NOTE: The citationId `zhang_2016_aging` contains incorrect year label (2016); actual publication year is 2004. Data fields (year, doi, pmid) are correct.

#### Kim et al. 2023 — PMID 37536133
**Decision: INCLUDE**
**Rationale:** Peer-reviewed comprehensive review in Biomedicine & Pharmacotherapy (2023); most recent evidence for neurological therapeutic applications; provides up-to-date summary of neuroprotective mechanisms; DOI verified.

#### Shao & Hathcock 2008 — PMID 17766049
**Decision: INCLUDE (corrected from prior version)**
**Rationale:** Safety risk assessment in Regulatory Toxicology and Pharmacology; authoritative GRAS-basis paper; PMID confirmed. NOTE: Prior version had completely wrong citation data pointing to a 2018 Korean paper (doi `10.4062/biomolther.2017.251`, pmid `29631391`). Corrected to actual Shao & Hathcock 2008 paper (PMID 17766049, doi `10.1016/j.yrtph.2007.07.003`).

#### Beyranvand et al. 2011 — PMID 21334819
**Decision: INCLUDE**
**Rationale:** Clinical dosing study in Journal of Cardiology; provides specific dosage protocols for cardiovascular populations; RCT-based dosing evidence; DOI verified.

---

### EXCLUDED CITATIONS (Examples from Screening)

| Study | Reason for Exclusion |
|-------|---------------------|
| Animal taurine depletion studies (multiple) | Mechanism only; no human supplementation data |
| Energy drink combination studies | Taurine effects cannot be isolated from caffeine/other components |
| Taurine in infant formula studies | Pediatric formula context not applicable to supplementation |
| Zhang 2016 (Science: "Taurine deficiency as a driver of aging") | Published 2023 as Zhang et al.; different from zhang_2016_aging (2004 paper); would require separate citationId — excluded to avoid confusion pending clarification |

---

## Final Dataset

| Domain | Citations | PMIDs |
|--------|-----------|-------|
| Mechanisms | 4 | 20804594, 23170060, 1731369, 20804583 |
| Benefits | 5 | 29546641, 34421639, 12436202, 15464106, 37536133 |
| Safety | 1 | 17766049 |
| Dosage | 1 | 21334819 |
| **Total** | **11** | — |
