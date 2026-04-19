# Screening Decisions: Sulforaphane
## Pipeline Run: 2026-04-19

### Inclusion Criteria
1. Indexed in PubMed; PMID + DOI both verify live
2. Sulforaphane (SFN) is the subject of the study (not a peripheral mention)
3. Either a completed human RCT, a systematic review/meta-analysis, an authoritative mechanism paper, or a Phase I safety study
4. Translational relevance to oral or food-based supplementation

### Exclusion Criteria
1. PMID does not resolve to the claimed paper
2. Cancer-cell-line in vitro studies without translational dose data
3. Engineering / agricultural breeding-only papers
4. Sulforaphane mentioned only in passing in a multi-compound review

### Included (12) — Brief Rationale

| PMID | Section | Why Included |
|------|---------|--------------|
| 25313065 | benefits (ASD) | Pivotal Singh PNAS 2014 RCT, n=44, 18 weeks, 34% ABC improvement, large effect |
| 24913818 | mechanisms + benefits | Egner Qidong RCT n=291, 12 weeks, +61% benzene mercapturic acid — strongest detoxification evidence |
| 34034808 | benefits (ASD) | Zimmerman 2021 Mol Autism RCT n=57 children — replication attempt with biomarker depth |
| 36771424 | benefits (ASD) | Magner 2023 negative RCT in younger children (3–7y) — required for balanced reporting |
| 40041932 | benefits (lung) | Yuan 2025 Phase II RCT, 12 months, Ki-67 reduction — recent and high-impact |
| 39045769 | benefits (metabolic) | Tian 2024 NAFLD RCT n=36, 42 mg/day, GLP-1 axis — most recent metabolic data |
| 37023957 | benefits (renal) | Monteiro 2023 systematic review + meta-analysis of 25 preclinical kidney studies |
| 29266773 | mechanisms / dosage | Sivapalan 2018 bioavailability crossover (Myb28 genotypes) — informs product selection |
| 16965241 | safety | Shapiro 2006 Phase I — formal safety/PK design |
| 30735751 | safety | Chartoumpekis 2019 12-week thyroid safety RCT — addresses goitrogenic concern explicitly |
| 33515348 | mechanisms | Clifford 2021 PROSPERO-registered SR of human Nrf2 trials — places SFN among top studied compounds |
| 21910945 | mechanisms / dosage | Cramer 2012 myrosinase synergy bioavailability RCT — defines product-selection criterion |

### Notably Excluded
- **PMID 36915952, 27071786, 25313065 (duplicate), 32242086** — duplicate or older ASD reports superseded by Singh 2014 + Zimmerman 2021 + Magner 2023
- **PMID 33996874** (Front Nutr 2021) — review-of-trials paper, redundant with the SFN-specific subset
- **PMID 38612798** (Brassica/thyroid SR) — broader brassica focus; Chartoumpekis 2019 RCT preferred for SFN-specific thyroid safety
- **PMID 26329135, 39556025, 32972351, 27829351, 26898239, 33515348 (used)** — most ranked-relevance papers were older or peripheral; pruned per inclusion criteria

### Anti-Hallucination Verification
- All 12 PMIDs verified live via PubMed esummary (search 8)
- All 12 abstracts retrieved via efetch (search 9) and findings extracted directly from abstract text
- Singh 2014 ASD trial PMID was discovered via search 4 (the Linear-issue claim of "PMID 24913818" for Singh was wrong — that PMID is actually Egner 2014 Qidong)
- `verify-citations.js --id 117` exit code 0, 0 CRITICAL issues
