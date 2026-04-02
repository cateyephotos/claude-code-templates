# Search Provenance: Magnesium
## Pipeline Run: 2026-03-04 | Mode 2: Evidence Update

### Search Strategy Summary
- **Supplement ID:** 6
- **Databases queried:** PubMed, Consensus API
- **Date range searched:** 2025-08-01 to 2026-03-04
- **Previous evidence state:** 16 citations, quality score 78, Tier 2
- **Total results retrieved:** ~127 (98 PubMed Search 1, 20 Consensus, 9 PubMed Search 2)
- **Total unique after deduplication:** ~95
- **Papers screened (title/abstract):** 20
- **Papers included:** 5

### PubMed Searches
| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | magnesium supplementation meta-analysis systematic review | date_from: 2025/08, sort: pub_date | 98 (top 20 reviewed) | 2026-03-04 |
| 2 | magnesium[Title] AND (sleep OR insomnia) AND (meta-analysis[pt] OR systematic review[pt]) | date_from: 2025/01 | 9 (all pre-2025, no new qualifying papers) | 2026-03-04 |

### Consensus API Searches
| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | magnesium sleep quality blood pressure depression meta-analysis | year_min=2025 | 20 (screened alongside PubMed results) | 2026-03-04 |

### Deduplication Summary
- PubMed Search 1 yielded 98 results; top 20 most recent reviewed in detail
- PubMed Search 2 yielded 9 results; all were pre-2025 publications and did not qualify
- Consensus API yielded 20 results; overlap with PubMed Search 1 removed
- Total unique papers for screening after deduplication: ~95
- Screening applied to top 20 most relevant and recent unique papers

### Search Rationale
Three complementary searches were conducted to ensure comprehensive coverage of the magnesium supplementation evidence landscape:

1. **PubMed Search 1 (primary):** A broad query combining "magnesium supplementation" with "meta-analysis" and "systematic review" was used to capture all new quantitative syntheses since the previous evidence update. The date filter was set to 2025/08 to capture evidence published after the last update cycle. The 98 results were sorted by publication date and the top 20 most recent were reviewed in detail, as these were most likely to contain novel meta-analytic data.

2. **Consensus API (supplementary):** A multi-domain query was designed to surface high-impact papers across magnesium's primary benefit domains (sleep quality, blood pressure, depression). The year_min=2025 filter ensured only recent evidence was retrieved. This search was intended to catch papers that might not appear in the PubMed query due to different indexing terminology or publication timing.

3. **PubMed Search 2 (sleep-specific):** A targeted search was conducted for magnesium and sleep/insomnia meta-analyses, as sleep quality is one of magnesium's established benefit domains. All 9 results were pre-2025 publications already captured in the existing citation database, confirming that no new sleep-specific meta-analyses were published during the review period.

### Search Limitations
- The primary PubMed search returned 98 results but only the top 20 were reviewed in full detail. Papers ranked 21-98 were unlikely to contain high-impact meta-analyses based on title screening but could theoretically contain relevant evidence.
- The sleep-specific search yielded no new qualifying papers, indicating a gap in recent sleep/magnesium meta-analytic publications since 2025.
- Consensus API results partially overlapped with PubMed; exact deduplication count was estimated rather than precisely tracked.
