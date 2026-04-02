# Search Provenance: Green Tea Extract / EGCG (ID 24)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP), Consensus API, bioRxiv
- **Date range searched:** 2015–2026
- **Total unique results reviewed:** ~55 candidate papers
- **After deduplication and screening:** 14 included
- **Special condition:** Prior 24_enhanced.js had only 4 citations with multiple schema violations; full citation expansion required for all domains.

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | "green tea extract"[Title/Abstract] AND ("metabolic syndrome" OR "obesity" OR "body weight")[Title/Abstract] AND ("meta-analysis"[pt] OR "systematic review"[pt]) | Human, English | 22 | 2026-03-06 |
| 2 | "EGCG"[Title/Abstract] OR "epigallocatechin gallate"[Title/Abstract] AND ("cognitive function" OR "attention" OR "memory")[Title/Abstract] AND randomized controlled trial[pt] | Human, English | 14 | 2026-03-06 |
| 3 | "green tea extract"[Title/Abstract] AND "hepatotoxicity"[Title/Abstract] OR "liver injury"[Title/Abstract] AND review[pt] | Human, English | 9 | 2026-03-06 |
| 4 | "EGCG"[Title/Abstract] AND "pharmacokinetics"[Title/Abstract] OR "bioavailability"[Title/Abstract] AND human | Human, English | 8 | 2026-03-06 |
| 5 | "green tea catechins"[Title/Abstract] AND "inflammation"[Title/Abstract] AND ("interleukin" OR "TNF" OR "CRP")[Title/Abstract] AND randomized controlled trial[pt] | Human, English | 11 | 2026-03-06 |
| 6 | "green tea extract" AND body weight fat mass meta-analysis systematic review randomized controlled trial | Human, English | 3 | 2026-03-06 |
| 7 | "EGCG epigallocatechin gallate hepatotoxicity liver safety review" | Human, English | 2 | 2026-03-06 |
| 8 | "green tea catechins antioxidant oxidative stress biomarkers clinical trial human" | Human, English | 8 | 2026-03-06 |
| 9 | "epigallocatechin gallate EGCG pharmacokinetics bioavailability dose human" | Human, English | 6 | 2026-03-06 |

### Consensus API Searches

| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "What are the effects of green tea extract on metabolic health and weight loss?" | human=true, sjr_max=2 | 8 | 2026-03-06 |
| 2 | "Does EGCG supplementation improve cognitive function in healthy adults?" | human=true | 5 | 2026-03-06 |
| 3 | "What is the safety profile of high-dose green tea extract supplementation?" | human=true | 4 | 2026-03-06 |

### bioRxiv Searches

| # | Category | Date Range | Results | Date Executed |
|---|----------|-----------|---------|---------------|
| 1 | pharmacology | 2023–2026 | 3 preprints; none met inclusion criteria | 2026-03-06 |
| 2 | biochemistry | 2024–2026 | 2 preprints; in vitro only, excluded | 2026-03-06 |

### Deduplication Summary
- PubMed-Consensus overlap: ~12 duplicates removed
- Total unique papers meeting title/abstract screening: ~30
- Papers proceeding to full abstract review: 22
- Final included: 14
- Papers excluded at abstract review: 8 (see screening_decisions.md)

---

### Key Papers Identified by Domain

#### Mechanisms
- PMID 36613784 — Mokra et al 2022 Int J Mol Sci (EGCG cellular signaling review)
- PMID 26577614 — Yang et al 2016 Mol Nutr Food Res (EGCG macromolecular interactions)

#### Metabolic Health (Benefits)
- PMID 33671139 — Rondanelli et al 2021 Nutrients (systematic review + meta-analysis, 15 RCTs, n=499)
- PMID 33207344 — Asbaghi et al 2020 Complement Med Res (meta-analysis 11 RCTs, T2DM)
- PMID 29129232 — Haghighatdoost et al 2018 Nutrition (meta-analysis 11 RCTs, leptin/ghrelin)
- PMID 33652910 — Roberts et al 2021 Nutrients (RCT n=27, fat oxidation)

#### Anti-inflammatory (Benefits)
- PMID 31747468 — Bagheri et al 2020 Br J Clin Pharmacol (RCT n=30)

#### Cognitive Function (Benefits)
- PMID 27302362 — de la Torre et al 2016 Lancet Neurol (Phase 2 RCT n=84, Down syndrome)
- PMID 30962103 — de la Torre et al 2019 Clin Nutr (Phase 1 RCT n=27, Fragile X)
- PMID 28784536 — Dietz et al 2017 Food Res Int (RCT n=23, healthy adults)

#### Safety
- PMID 35951014 — Cieuta-Walti et al 2022 Genet Med (Phase 1/2 safety trial n=73)
- PMID 39857788 — Yan & Cao 2025 Biomedicines (hepatotoxicity review)
- PMID 39275155 — Winiarska-Mieczan et al 2024 Nutrients (DILI review)
- PMID 29480324 — Abe et al 2018 Eur J Clin Pharmacol (RCT n=13, drug interaction)

#### Dosage (Pharmacokinetics)
- PMID 37764804 — Hodges et al 2023 Nutrients (PK compartmental model n=19)
- PMID 33671139 — Rondanelli et al 2021 Nutrients (dosage subgroup analysis — same paper also in benefits)
