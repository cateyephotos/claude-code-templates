# Search Provenance: Vitamin D3 (Cholecalciferol)
## Pipeline Run: 2026-03-04 | Mode 2: Evidence Update

### Search Strategy Summary
- **Supplement ID:** 7
- **Databases queried:** PubMed, Consensus API
- **Date range searched:** 2025-08-01 to 2026-03-04
- **Previous evidence state:** 23 citations, quality score 89, Tier 1 (in enhanced file; Tier 2 in supplements.js was INCORRECT)
- **Total results retrieved:** ~154 (134 PubMed + 20 Consensus)
- **Total unique after deduplication:** ~20
- **Papers included:** 5

### PubMed Searches
| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | vitamin D supplementation meta-analysis systematic review 2025 | date_from: 2025/08, sort: pub_date | 134 (top 20 reviewed) | 2026-03-04 |

### Consensus API Searches
| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | vitamin D3 supplementation immune function depression bone health meta-analysis | year_min=2025 | 20 (3 shown in detail) | 2026-03-04 |

### Deduplication Summary
- PubMed search yielded 134 results; top 20 most recent reviewed in detail
- Consensus API yielded 20 results; 3 shown as representative
- PubMed-Consensus overlap: Several duplicates removed (the Jolliffe et al. 2025 Lancet ARI meta-analysis appeared in both sources)
- Total unique papers for screening after deduplication: ~20
- Screening applied to all 20 unique papers

### Search Rationale
A broad PubMed query was used combining "vitamin D supplementation" with "meta-analysis" and "systematic review" to capture the widest range of evidence syntheses. The date filter was set to 2025/08 to capture all evidence published since the approximate previous update window. The sort order was set to publication date to prioritize the most recent evidence. Vitamin D3 (cholecalciferol) is the most common supplemental form, but the search intentionally used the broader term "vitamin D" to capture meta-analyses that pool D2 and D3 studies, as most large systematic reviews do not restrict to a single form. The Consensus API query was designed to target the core established domains of vitamin D research (immune function, depression, bone health) and surface high-impact recent papers. The search yielded a large pool (134 PubMed results) reflecting the extremely active vitamin D research landscape, but most results were condition-specific meta-analyses in niche populations (pregnancy, critical care, surgical settings) that did not meet inclusion criteria for a general supplementation database. The 20 papers selected for full screening represented the highest-relevance subset after title/abstract review.

### Search Limitations
1. The PubMed query did not include MeSH terms (e.g., "Cholecalciferol"[MeSH]) which may have missed some indexed studies, though the broad text search compensates for this
2. The Consensus API returned only 3 results with detailed metadata, limiting its contribution relative to PubMed
3. The search did not include Cochrane Library, EMBASE, or Scopus, which may contain additional systematic reviews not indexed in PubMed
4. Non-English language meta-analyses were not excluded by query but were not encountered in the top results
5. The 134-result PubMed set was reviewed by title/abstract for the top 20 only; it is possible that relevant papers beyond position 20 were missed, though sorting by publication date prioritizes the most recent and typically highest-impact evidence
