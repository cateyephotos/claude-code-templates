# Search Provenance: Resveratrol (ID: 27)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 (Evidence Update)

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP), bioRxiv (checked), ClinicalTrials.gov (contextual)
- **Date range searched:** No fixed cutoff — all available publications; most recent: 2025
- **Total unique papers retrieved:** ~25+ candidates
- **After screening and deduplication:** 19 included

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | resveratrol AND (systematic review[pt] OR meta-analysis[pt]) AND (inflammatory OR inflammation OR CRP) | Human, English | ~15 | 2026-03-05 |
| 2 | resveratrol AND (randomized controlled trial[pt]) AND (cognitive OR cognition OR brain OR cerebral blood flow) | Human, English | ~12 | 2026-03-05 |
| 3 | resveratrol AND (meta-analysis[pt]) AND (body weight OR BMI OR obesity) | Human, English | ~8 | 2026-03-05 |
| 4 | resveratrol AND (SIRT1 OR sirtuin) AND (randomized OR clinical trial) | Human, English | ~6 | 2026-03-05 |
| 5 | resveratrol AND (PCOS OR polycystic ovary) | Human, English | ~5 | 2026-03-05 |
| 6 | resveratrol AND (bone mineral density OR BMD OR osteoporosis) AND meta-analysis | Human, English | ~4 | 2026-03-05 |
| 7 | resveratrol AND (liver OR hepatic OR ALT OR AST) AND meta-analysis | Human, English | ~5 | 2026-03-05 |
| 8 | resveratrol AND (endothelial OR FMD OR flow-mediated) | Human, English | ~6 | 2026-03-05 |

### Papers Retrieved by PMID (PubMed get_article_metadata)

Batch 1 (Initial retrieval):
- 38374352 — Molani-Gol 2024 (umbrella meta-analysis)
- 32900519 — Thaung Zaw 2021 (24-month cognitive RCT) [corrected from initial incorrect PMID 32008871]
- 20357044 — Kennedy 2010 (acute CBF RCT)
- 23743811 — Wong 2013 (FMD RCT)

Batch 2 (Meta-analysis sweep):
- 34472150 — Gorabi 2021 (CRP 35 RCTs)
- 35905799 — Teimouri 2022 (CVD inflammatory markers)
- 32147058 — Hosseini 2020 (T2D CRP)
- 35833325 — Mohammadipoor 2022 (endothelial function)
- 30515938 — Mousavi 2018 (obesity body composition)
- 40842160 — Lahouti 2025 (T2D anthropometrics)
- 28089943 — Mohammadi-Sartang 2017 (adipokines)

Batch 3 (Mechanism and null findings):
- 40158656 — Mansouri 2025 (SIRT1 null result, 11 RCTs)
- 34420523 — Li 2021 (bone null result, 10 trials)
- 36642444 — Soltani 2023 (liver, 37 trials)
- 39799097 — Rodrigues Uggioni 2024 (postmenopausal lipids null)
- 35155509 — de Vries 2022 (polyphenol cognition SR)
- 37333786 — Fadlalmola 2023 (PCOS, 4 RCTs)
- 37568063 — Larik 2023 (PCOS, 3 RCTs)
- 26344014 — Wightman 2015 (CBF chronic RCT)

### PMID Verification Notes
- PMID 32008871 was initially returned for Thaung Zaw 2020 via `lookup_article_by_citation` — this was **incorrect** (it resolved to ESPEN pancreatitis guideline). Correct PMID confirmed via targeted `search_articles` query → PMID **32900519**.
- PMID 40771814 retrieved for Wu 2025 postmenopausal meta-analysis — resolved to unrelated COPD paper. Wu 2025 **excluded** (cannot confirm PMID/DOI).
- Brown 2024 cognitive meta-analysis: AMBIGUOUS lookup (24 results, no DOI), **excluded**.
- Evans 2016 (PMID 27005658): Retrieved as cognitive RCT but confirmed to be a study **protocol/design paper** (not outcome data) — excluded from benefits evidence.

### Deduplication Summary
- Umbrella meta-analysis (Molani-Gol 2024) subsumes 19 prior meta-analyses; included separately as highest-level synthesis
- Some primary RCTs from meta-analyses cited directly (Kennedy 2010, Wong 2013, Thaung Zaw 2021) for mechanistic specificity
- Total unique papers for screening: 22
- After exclusion of 3 papers (Wu 2025 unconfirmed, Brown 2024 ambiguous, Evans 2016 protocol only): **19 included**
