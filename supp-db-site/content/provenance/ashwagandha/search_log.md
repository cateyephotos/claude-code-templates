# Search Provenance: Ashwagandha (Withania somnifera)
## Pipeline Run: 2026-03-05 | Mode 2: Evidence Update

### Search Strategy Summary
- **Supplement ID:** 3
- **Databases queried:** PubMed, Consensus API
- **Date range searched:** 2024-01-01 to 2026-03-05
- **Previous evidence state:** Tier 2 in supplements.js, Tier 1 already assigned in enhanced citation file from prior update, quality score 89
- **Total results retrieved:** ~29 (9 PubMed + 20 Consensus)
- **Total unique after deduplication:** ~25
- **Papers included:** 5 (3 new, 2 already in database)

### PubMed Searches
| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | ashwagandha withania somnifera systematic review meta-analysis | date_from: 2024/01, sort: pub_date | 9 | 2026-03-05 |

### Consensus API Searches
| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | ashwagandha withania somnifera clinical trials efficacy safety | year_min=2024, sjr_max=2 | 20 (3 shown in detail) | 2026-03-05 |

### Deduplication Summary
- PubMed search yielded 9 results; all 9 reviewed in detail
- Consensus API yielded 20 results; 3 shown as representative detailed results
- PubMed-Consensus overlap: Several duplicates removed (papers appearing in both databases)
- Total unique papers for screening after deduplication: ~25
- Screening applied to all 25 unique papers

### Search Rationale
A single PubMed query was used combining the common name "ashwagandha" with its botanical name "Withania somnifera" alongside systematic review and meta-analysis terms to capture the highest-level evidence syntheses. The date filter was set to 2024/01 to capture all evidence published since the previous update cycle. The Consensus API query was designed to capture broader clinical trial evidence and safety data using quality filters (SJR max 2) to surface papers from reputable journals. Three representative Consensus results were returned in detail, with the remainder assessed at the title/abstract level. The search yielded a focused set of 9 PubMed results, reflecting the maturity and specificity of the ashwagandha evidence base in the systematic review/meta-analysis literature.

### Search Limitations
- PubMed search focused on systematic reviews/meta-analyses only; individual RCTs not independently searched
- Consensus API limited to top 3 detailed results; remaining 17 assessed at summary level only
- No manual citation chaining performed (forward/backward reference tracking)
- Grey literature (conference proceedings, preprints, dissertations) not searched
- Non-English language publications may have been missed depending on database indexing
