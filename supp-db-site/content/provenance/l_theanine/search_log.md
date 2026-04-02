# Search Provenance: L-Theanine (gamma-Glutamylethylamide)
## Pipeline Run: 2026-03-05 | Mode 2: Evidence Update

### Search Strategy Summary
- **Supplement ID:** 9
- **Databases queried:** PubMed, Consensus API
- **Date range searched:** 2024-06-01 to 2026-03-05
- **Previous evidence state:** Tier 2 in supplements.js, quality score 84
- **Total results retrieved:** ~15 unique papers across all searches
- **Total unique after deduplication:** ~15
- **Papers included:** 4 (all new)

### PubMed Searches
| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | L-theanine systematic review meta-analysis | date_from: 2024/06, sort: pub_date | 4 | 2026-03-05 |
| 2 | L-theanine randomized controlled trial cognitive anxiety stress | date_from: 2024/06, sort: pub_date | 6 | 2026-03-05 |
| 3 | theanine blood pressure cardiovascular meta-analysis | date_from: 2024/06, sort: pub_date | 2 | 2026-03-05 |
| 4 | L-theanine mental disorders schizophrenia ADHD systematic review | date_from: 2024/06, sort: pub_date | 3 | 2026-03-05 |

### Consensus API Searches
| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | L-theanine supplementation effects meta-analysis systematic review | year_min=2024 | ~8 (4 detailed, overlap with PubMed) | 2026-03-05 |

### Deduplication Summary
- PubMed searches yielded ~15 results across 4 queries; many overlapping across queries
- Consensus API yielded ~8 results; substantial overlap with PubMed results
- PubMed-Consensus overlap: Several duplicates removed (papers appearing in both databases)
- PubMed inter-query overlap: Queries 1 and 2 shared several results (systematic reviews also tagged as RCTs)
- Total unique papers for screening after deduplication: ~15
- Screening applied to all 15 unique papers

### Search Rationale
Four complementary PubMed queries were used to capture the full breadth of L-theanine evidence:

1. **Query 1** (systematic review/meta-analysis terms) targeted the highest-level evidence syntheses -- meta-analyses and systematic reviews that pool data from multiple individual studies. This was the primary search to identify new quantitative evidence summaries.

2. **Query 2** (RCT + cognitive/anxiety/stress terms) targeted individual randomized controlled trials in L-theanine's core benefit domains. While individual RCTs are lower in the evidence hierarchy than meta-analyses, this query ensures that important recent trials not yet captured in meta-analyses are identified.

3. **Query 3** (cardiovascular/blood pressure terms) probed a secondary evidence domain. L-theanine has been investigated for blood pressure reduction and cardiovascular effects. This dedicated search ensures emerging cardiovascular evidence is not missed by the broader queries.

4. **Query 4** (mental disorders/schizophrenia/ADHD terms) targeted the clinical psychiatric population literature. This is a growth area for L-theanine research, where it is being studied as an adjunctive intervention in diagnosed mental health conditions.

The Consensus API query was designed to capture the broadest possible set of L-theanine meta-analyses and systematic reviews published since 2024, with quality filtering to surface papers from reputable journals.

The date range was set to June 2024 to capture all evidence published since the previous update cycle.

### Search Limitations
- PubMed search used four targeted queries but may have missed studies indexed under alternative nomenclature (e.g., gamma-glutamylethylamide, N-ethyl-L-glutamine, Suntheanine)
- Consensus API limited to top detailed results; remaining assessed at summary level only
- No manual citation chaining performed (forward/backward reference tracking)
- Grey literature (conference proceedings, preprints, dissertations) not searched
- Non-English language publications may have been missed depending on database indexing
- Cardiovascular search (Query 3) yielded few results, possibly indicating limited new evidence in this domain rather than a search limitation
- No search was conducted for L-theanine in combination with other supplements (beyond caffeine, which was captured in the broader meta-analyses)
