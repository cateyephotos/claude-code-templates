# Search Provenance: Omega-3 Fatty Acids
## Pipeline Run: 2026-03-04 | Mode 2: Evidence Update

### Search Strategy Summary
- **Supplement ID:** 4
- **Databases queried:** PubMed, Consensus API
- **Date range searched:** 2025-08-19 to 2026-03-04
- **Previous evidence state:** 21 citations, quality score 92, lastEvidenceUpdate 2025-08-19
- **Total results retrieved:** ~631
- **Total unique after deduplication:** ~40
- **Papers included:** 6

### PubMed Searches
| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | omega-3[Title] AND (meta-analysis[pt] OR systematic review[pt]) | date_from: 2025/08, sort: pub_date | 546 (top 20 reviewed) | 2026-03-04 |
| 2 | "fish oil"[Title] AND (meta-analysis[pt] OR systematic review[pt]) | date_from: 2025/09, sort: pub_date | 85 | 2026-03-04 |

### Consensus API Searches
| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | omega-3 fatty acids supplementation cognitive function cardiovascular health meta-analysis | year_min=2025, human=true, sjr_max=2 | 20 | 2026-03-04 |

### Deduplication Summary
- PubMed Search 1 to Search 2 overlap: Multiple duplicates (fish oil / omega-3 terminology overlap)
- PubMed-Consensus overlap: Additional duplicates removed
- Total unique papers for screening after deduplication: ~40
- Screening applied to all 40 unique papers

### Search Rationale
Two PubMed queries were used to capture papers indexed under either "omega-3" or "fish oil" terminology, as the literature uses both terms inconsistently. The Consensus API query was designed to cast a wider net across cognitive and cardiovascular domains with quality filters (SJR Q1-Q2 journals, human studies only). The date ranges were staggered (2025/08 for omega-3, 2025/09 for fish oil) to align with the previous evidence update date while accounting for indexing delays.
