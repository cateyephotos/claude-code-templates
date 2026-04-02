# Search Log: Ginkgo Biloba (ID 14) — Mode 2 Evidence Update

## Search Metadata

| Field | Value |
|---|---|
| **Supplement** | Ginkgo Biloba (ID 14) |
| **Update Mode** | Mode 2 — Evidence Update |
| **Phase** | Phase 2, Batch 1 |
| **Date Conducted** | 2026-03-05 |
| **Operator** | Claude (automated pipeline) |
| **Total Papers Screened** | 23 |
| **Papers Included** | 4 |
| **Papers Excluded** | 19 |

---

## Search Strategy

### Search 1: PubMed — Systematic Reviews and Meta-Analyses

- **Database:** PubMed (via MCP PubMed server)
- **Query:** `Ginkgo biloba systematic review meta-analysis`
- **Date Filter:** 2024-01-01 to 2026-03-05 (publication date)
- **Sort:** Relevance
- **Results Returned:** 20
- **Date Executed:** 2026-03-05
- **Rationale:** Capture the highest-level evidence syntheses (SRs, MAs, NMAs, umbrella reviews) published since the last evidence update window.

### Search 2: PubMed — Cognitive RCTs

- **Database:** PubMed (via MCP PubMed server)
- **Query:** `Ginkgo biloba supplementation cognitive RCT`
- **Date Filter:** 2024-01-01 to 2026-03-05 (publication date)
- **Sort:** Relevance
- **Results Returned:** 0
- **Date Executed:** 2026-03-05
- **Rationale:** Identify any large standalone RCTs not yet captured by the systematic review searches. No new standalone RCTs were found in this window, which is expected given the maturity of the GB evidence base.

### Search 3: Consensus Academic Search — EGb 761 Clinical Trials

- **Database:** Consensus (Semantic Scholar, PubMed, ArXiv aggregation)
- **Query:** `Ginkgo biloba EGb 761 supplementation cognitive function clinical trials evidence systematic review`
- **Date Filter:** 2024+ (year_min = 2024)
- **Results Returned:** 3
- **Date Executed:** 2026-03-05
- **Rationale:** Cross-reference against PubMed results using semantic search to capture any papers missed by keyword-based PubMed queries. Also specifically targets EGb 761 (the standardized extract used in most clinical trials).

---

## Results Summary

| Search | Database | Query Focus | Results |
|---|---|---|---|
| Search 1 | PubMed | SRs and MAs | 20 |
| Search 2 | PubMed | Cognitive RCTs | 0 |
| Search 3 | Consensus | EGb 761 clinical evidence | 3 |
| **Total** | | | **23** |

---

## Deduplication Notes

- No duplicates were found between PubMed Search 1 and Search 2 (Search 2 returned 0 results).
- Consensus Search 3 returned 3 results. Two of these overlapped with existing file citations (Santos 2024 already present as `ginkgo_ben_002`; Canter & Ernst 2007 predates the evidence window). One new result was evaluated but excluded.
- Final unique papers screened: **23**

---

## Search Limitations

1. **Language bias:** Searches were conducted in English only. Several excluded papers were Chinese-language publications with English abstracts, which were screened on abstract content.
2. **Database coverage:** bioRxiv/medRxiv were not searched as Ginkgo biloba is a mature clinical evidence area with minimal preprint activity.
3. **Grey literature:** Conference abstracts, regulatory submissions, and manufacturer-sponsored reports were not systematically searched.
4. **Combination therapies:** Multiple results involved GB as a minor component in traditional Chinese medicine combinations, which were excluded from this single-ingredient evidence update.
