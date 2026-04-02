# Search Provenance: Rhodiola rosea
## Pipeline Run: 2026-03-05 | Mode 2: Evidence Update

### Search Strategy Summary
- **Supplement ID:** 10
- **Databases queried:** PubMed, Consensus API
- **Date range searched:** 2024-01-01 to 2026-03-05
- **Previous evidence state:** Tier 2 in supplements.js, quality score 87
- **Total results retrieved:** ~10 (7 PubMed + 3 Consensus)
- **Total unique after deduplication:** ~10
- **Papers included:** 3 (all new)

### PubMed Searches
| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | Rhodiola rosea systematic review meta-analysis | date_from: 2024/01, date_to: 2026/03, sort: pub_date | 5 | 2026-03-05 |
| 2 | Rhodiola rosea fatigue stress randomized controlled trial | date_from: 2024/01, date_to: 2026/03, sort: pub_date | 2 | 2026-03-05 |
| 3 | Rhodiola rosea depression anxiety cognitive | date_from: 2024/01, date_to: 2026/03, sort: pub_date | 0 | 2026-03-05 |

### Consensus API Searches
| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | Rhodiola rosea adaptogen stress fatigue cognitive performance clinical trials | year_min=2024 | 3 (none included) | 2026-03-05 |

### Deduplication Summary
- PubMed search #1 yielded 5 results; all 5 reviewed in detail
- PubMed search #2 yielded 2 results; all 2 reviewed in detail (no overlap with search #1)
- PubMed search #3 yielded 0 results
- Consensus API yielded 3 results; all 3 reviewed in detail (narrative reviews and small RCTs excluded)
- PubMed-Consensus overlap: None identified (different result sets)
- Total unique papers for screening after deduplication: ~10
- Screening applied to all 10 unique papers

### Search Rationale
Three PubMed queries were used to comprehensively capture the Rhodiola rosea evidence landscape. The first query targeted the highest-level evidence (systematic reviews and meta-analyses) by combining the species name with review methodology terms. The second query broadened to randomized controlled trials focusing on Rhodiola's primary evidence domains (fatigue and stress). The third query probed for depression, anxiety, and cognitive domains, returning zero results -- indicating that no dedicated Rhodiola rosea reviews or RCTs in these domains were published in the 2024-2026 window. The Consensus API query was designed to capture broader clinical trial evidence using adaptogen and performance terminology. The three Consensus results were assessed at full detail but excluded as narrative reviews or small RCTs that did not meet inclusion criteria. The search yielded a focused set of ~10 results, reflecting the relatively smaller evidence base for Rhodiola rosea compared to more heavily researched adaptogens such as ashwagandha.

### Search Limitations
- PubMed search #3 returned zero results for depression/anxiety/cognitive domains, limiting evidence assessment for these use cases
- Consensus API results were all excluded (narrative reviews, small RCTs without novel meta-analytic data)
- No manual citation chaining performed (forward/backward reference tracking)
- Grey literature (conference proceedings, preprints, dissertations) not searched
- Non-English language publications may have been missed depending on database indexing
- Species-specific filtering required careful attention: Rhodiola crenulata and other Rhodiola species are distinct from R. rosea and were excluded when identified
