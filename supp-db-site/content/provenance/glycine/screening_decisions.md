# Screening Decisions: Glycine
## Pipeline Run: 2026-04-19

### Inclusion Criteria
1. Indexed in PubMed; PMID + DOI both verify live
2. Glycine (or GlyNAC for explicit precursor-strategy inference) is a substantive subject of the study
3. Either a completed glycine-specific human trial, an authoritative mechanism paper, or a randomized GlyNAC trial cited only for substrate-level glutathione inference

### Exclusion Criteria
1. PMID does not resolve to the claimed paper (anti-hallucination gate)
2. Glycine mentioned only as a routine amino-acid component in a broader paper
3. Schizophrenia adjunct trials (out of scope for this database; mechanism captured via File 1999 cognition trial)

### Included (12) — Brief Rationale

| PMID | Section | Why Included |
|------|---------|--------------|
| 22293292 | benefits (sleep) + safety | Bannai 2012 J Pharmacol Sci review of the sleep program; mechanism (core temperature drop) |
| 22529837 | benefits (sleep) + dosage | Bannai 2012 Front Neurol RCT, 3 g pre-bed in sleep-restricted volunteers — defines canonical dose |
| 10587285 | mechanisms (NMDA) + benefits (memory) | File 1999 Bioglycin double-blind crossover — only glycine-specific cognition RCT |
| 36094342 | benefits (sleep, blend) | Langan-Evans 2023 MSSE combination-supplement sleep RCT — included with caveat |
| 28330481 | mechanisms (collagen substrate) | Dunstan 2017 quantifies urinary glycine loss + AA supplement trial |
| 27872968 | benefits (sleep narrative) | Uneyama 2017 amino acid functions review — corroborative |
| 34587244 | mechanisms (GSH precursor review) | Sekhar 2021 J Nutr authoritative GlyNAC review |
| 33783984 | mechanisms (GSH precursor pilot) | Kumar 2021 Clin Transl Med pilot GlyNAC trial in OA |
| 35975308 | benefits (GlyNAC RCT) + safety + dosage | Kumar 2023 J Gerontol A — pivotal placebo-controlled GlyNAC RCT |
| 35268089 | benefits (GlyNAC mouse lifespan) | Kumar 2022 Nutrients +24% mouse lifespan |
| 33007928 | benefits (GlyNAC HIV premature aging) | Kumar 2020 Biomedicines open-label HIV trial |
| 37237908 | benefits (GlyNAC mouse brain) | Kumar 2023 Antioxidants — brain-specific GlyNAC mouse study |

### Notably Excluded
- Multiple schizophrenia adjunct papers — out of scope; NMDA mechanism captured via File 1999
- Higher-rank esearch results from search 1 turned out to be peripheral (e.g., 29661775 Waldenström's macroglobulinemia is not glycine-related; 16957676 menopause + soy isoflavones; 28460831 Japanese cedar pollinosis — all excluded after esummary screening)
- Many older glycine pharmacology papers (1970s–1990s) excluded in favour of contemporary evidence

### Anti-Hallucination Verification
- All 12 PMIDs verified via PubMed esummary (search 8); abstracts retrieved via efetch (search 9)
- The Linear-issue starter PMIDs were 5/6 wrong; only PMID 22293292 (Bannai 2012 J Pharmacol Sci) was correct
- The actual Sekhar lab GlyNAC trials were located via search 2 (PMIDs 33783984, 34587244, 35975308, 35268089, 33007928, 37237908)
- `verify-citations.js --id 118` exit code 0, 0 CRITICAL issues
