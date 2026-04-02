# Screening Decisions: Vitamin E (ID: 30)
## Pipeline Run: 2026-03-06

---

### Inclusion Criteria

1. Human subjects (clinical trials, meta-analyses, systematic reviews, guidelines)
2. Published in peer-reviewed journal with confirmed DOI and PMID
3. Relevant to Vitamin E's primary claimed benefits (cardiovascular, immune function, neurological/AD), mechanisms, or safety
4. Provides quantitative outcome data (effect sizes, RR, HR, WOMAC, ADCS-ADL, DTH responses) OR is a systematic review/meta-analysis documenting evidence synthesis
5. Study type: RCT, meta-analysis, NMA, systematic review, prospective cohort (for mechanism plausibility), or review with safety data
6. Exception: Up to 2 large prospective cohort studies retained for mechanisms section to document the observational vs. RCT disconnect

### Exclusion Criteria

1. Retracted papers
2. Animal or in vitro studies (unless no human data available for a specific mechanism — not applicable here)
3. Non-English without English abstract
4. Conference abstracts only (no full publication)
5. Protocol/design papers without outcome data
6. Papers with unconfirmed or non-existent PMID/DOI
7. Preprints without peer review
8. Duplicate publications of the same dataset
9. Papers where "vitamin E" was secondary/adjunctive intervention (e.g., combination antioxidant trials not primarily testing vitamin E)

---

### Screening Results

#### Included Papers (8 total)

| # | Citation ID | PMID | DOI | Study Type | Reason for Inclusion | Assigned Section |
|---|------------|------|-----|-----------|---------------------|------------------|
| 1 | stampfer_1993_cohort | 8479463 | 10.1056/NEJM199305203282003 | Prospective cohort (n=87,245) | Seminal observational study establishing CVD hypothesis; documents the observational/RCT disconnect | mechanisms, benefits |
| 2 | rimm_1993_cohort | 8479464 | 10.1056/NEJM199305203282004 | Prospective cohort (n=39,910) | Parallel male cohort corroborating Stampfer 1993; same-issue NEJM publication | mechanisms, benefits |
| 3 | meydani_1997_immune | 9134944 | 10.1001/jama.1997.03540410058031 | RCT (n=88, elderly) | Primary immune function RCT; gold-standard 200 IU/day dose-optimization data | mechanisms, benefits |
| 4 | hope_2000_cvd | 10639540 | 10.1056/NEJM200001203420302 | RCT (n=9,541) | HOPE trial — foundational null CVD RCT; directly tested observational hypothesis | benefits |
| 5 | miller_2005_mortality | 15537682 | 10.7326/0003-4819-142-1-200501040-00110 | Meta-analysis (n=135,967, 19 trials) | **KEY HARM FINDING**: ≥400 IU/day increases all-cause mortality; largest quantitative synthesis | benefits, safety, dosage |
| 6 | lonn_2005_hopetoo | 15769967 | 10.1001/jama.293.11.1338 | RCT extension (HOPE-TOO, n=7,030) | Extended follow-up; null CVD + increased heart failure signal (RR 1.13) | benefits, safety |
| 7 | sesso_2008_phsii | 18997197 | 10.1001/jama.2008.600 | RCT (PHS II, n=14,641, median 8yr) | Largest single vitamin E CVD RCT; null CVD + increased hemorrhagic stroke (HR 1.74) | benefits, safety |
| 8 | dysken_2014_alzheimers | 24381967 | 10.1001/jama.2013.282834 | RCT (TEAM-AD, n=613, 2.27yr) | **POSITIVE**: High-dose vitamin E (2000 IU/day) slows functional decline in AD; methodologically strong | mechanisms, benefits |

---

#### Excluded Papers (selected examples, 16 total)

| # | Identifier / Description | Reason for Exclusion |
|---|------------------------|---------------------|
| 1 | PMID 9134943 (prior file) | **FABRICATED PMID**: PubMed record 9134943 is not the Meydani immune RCT; correct PMID is 9134944. Excluded entirely from pipeline; correct paper included. |
| 2 | PMID 15630109 (prior file) | **FABRICATED PMID**: No valid PubMed record matching Miller 2005 mortality meta-analysis under this ID; correct PMID is 15537682. |
| 3 | PMID 24939261 (prior file) | **FABRICATED PMID**: No Dysken TEAM-AD trial under this ID; correct PMID is 24381967. |
| 4 | PMIDs 7495247, 7495249, 14656731, 16948484 (prior file) | **UNVERIFIED/FABRICATED**: No valid PubMed records found for these IDs as described in the prior `30_enhanced.js`. Excluded. |
| 5 | ATBC Cancer Prevention Study (PMID 8248235) | Excluded — primary intervention was beta-carotene; vitamin E was secondary. Population: Finnish male smokers. |
| 6 | GISSI-Prevenzione RCT (combined vitamin E + omega-3) | Excluded — combination intervention; cannot isolate vitamin E effect independently |
| 7 | Multiple in vitro LDL oxidation studies | Excluded per exclusion criterion 2 (animal/in vitro) — human RCT data is sufficient to evaluate the clinical hypothesis |
| 8 | WHS (Women's Health Study) — limited E component | Excluded — vitamin E was co-intervention alongside aspirin; not primary monotherapy design |
| 9 | Stampfer 1993 systematic review update (2003 era) | Excluded — duplicate dataset; original 1993 cohort paper retained instead |
| 10 | SU.VI.MAX trial (combined antioxidants) | Excluded — combination antioxidant supplement; vitamin E effect cannot be isolated |

---

### PRISMA Flow Summary

- Records identified through database searching: ~38 unique papers
- Records after removing duplicates: 22
- Full-text articles assessed for eligibility: 14
- Full-text articles excluded: 6 (combination interventions n=2; duplicate datasets n=2; animal/in vitro n=2)
- Prior fabricated citations removed: 7
- **Studies included in final evidence synthesis: 8** (5 RCTs + 2 cohort studies + 1 meta-analysis)

---

### Conflict of Interest Flagging

**Industry funding landscape:** Vitamin E supplements are a large market. The early observational studies (Stampfer 1993, Rimm 1993) were NIH-funded and independent. The key large RCTs (HOPE, HOPE-TOO, PHS II) were government or public health funded. Miller 2005 meta-analysis was independently conducted. Dysken 2014 (TEAM-AD) was VA/NIH funded.

**Overall COI assessment:** The null CVD finding is well-established by independent, government-funded trials with no industry co-author involvement. The positive immune (Meydani 1997) and AD (Dysken 2014) findings are from NIH/VA-funded sources. The evidence base for vitamin E is unusual in that the most impactful findings (large null/harm trials) are fully independent.

**Prior file quality:** The version of `30_enhanced.js` that was replaced had inflated `researchQualityScore: 87`, labeled CVD evidence as "Strong"/"High" (incorrect — large RCTs are null/against), and contained 7 fabricated or unverified PMIDs. The rewritten file corrects all of these issues.
