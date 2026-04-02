# Search Log: Alpha-GPC (ID 16) — Mode 2 Evidence Update

## Search Metadata

| Field | Value |
|---|---|
| **Supplement** | Alpha-GPC (L-alpha-glycerylphosphorylcholine) (ID 16) |
| **Update Mode** | Mode 2 — Evidence Update |
| **Phase** | Phase 2, Batch 1 |
| **Date Conducted** | 2026-03-05 |
| **Operator** | Claude (automated pipeline) |
| **Total Papers Screened** | 10 |
| **Papers Included** | 2 |
| **Papers Excluded** | 8 |

---

## Search Strategy

### Search 1: PubMed — Systematic Reviews and Meta-Analyses

- **Database:** PubMed (via MCP PubMed server)
- **Query:** `Alpha-GPC choline alfoscerate systematic review meta-analysis`
- **Date Filter:** 2024-01-01 to 2026-03-05 (publication date)
- **Sort:** Relevance
- **Results Returned:** 0
- **Date Executed:** 2026-03-05
- **Rationale:** Target the highest-level evidence syntheses (SRs, MAs) for Alpha-GPC using its primary generic name and INN (choline alfoscerate). Zero results indicate that dedicated Alpha-GPC meta-analyses remain scarce despite increasing primary research activity.

### Search 2: PubMed — Cognitive Function Broadened

- **Database:** PubMed (via MCP PubMed server)
- **Query:** `alpha-GPC choline alfoscerate cognitive`
- **Date Filter:** 2024-01-01 to 2026-03-05 (publication date)
- **Sort:** Relevance
- **Results Returned:** 4
- **PMIDs Returned:** 40556032, 39410120, 40126282, 38391922
- **Date Executed:** 2026-03-05
- **Rationale:** Broadened the search from SR/MA-only to include all study designs mentioning cognitive outcomes. This captures RCTs, narrative reviews, and mechanistic studies that may contain relevant human evidence or contextual information for evidence evaluation.

### Search 3: PubMed — Choline Supplement Systematic Reviews

- **Database:** PubMed (via MCP PubMed server)
- **Query:** `choline supplement systematic review meta-analysis cognitive`
- **Date Filter:** 2024-01-01 to 2026-03-05 (publication date)
- **Sort:** Relevance
- **Results Returned:** 2
- **PMIDs Returned:** 41426989, 40251090
- **Date Executed:** 2026-03-05
- **Rationale:** Alpha-GPC is a choline donor compound. Broader choline supplementation meta-analyses may include Alpha-GPC as a subgroup or comparator arm alongside citicoline (CDP-choline) and other choline sources. This search captures cross-compound evidence syntheses.

### Search 4: PubMed — Alpha-GPC Reviews (General)

- **Database:** PubMed (via MCP PubMed server)
- **Query:** `alpha-GPC choline alfoscerate review`
- **Date Filter:** 2024-01-01 to 2026-03-05 (publication date)
- **Sort:** Relevance
- **Results Returned:** 3 (2 duplicates from previous searches + 1 new: 39898924)
- **Date Executed:** 2026-03-05
- **Rationale:** Final sweep to capture any Alpha-GPC publications missed by the more targeted queries above. Includes general reviews, clinical commentaries, and industry overviews. Two of the three results had already been captured in Searches 2-3, leaving one new unique result (PMID 39898924).

### Search 5: PubMed — Targeted Jeon 2024 RCT

- **Database:** PubMed (via MCP PubMed server)
- **Query:** `Jeon choline alphoscerate mild cognitive impairment`
- **Date Filter:** 2024-01-01 to 2026-03-05 (publication date)
- **Sort:** Relevance
- **Results Returned:** 1
- **PMID Returned:** 39300341
- **Date Executed:** 2026-03-05
- **Rationale:** Targeted retrieval of a specific multicenter RCT identified through cross-references in the Sagaro 2025 meta-analysis. This study was not captured by the broader searches above because its title uses the alternate spelling "alphoscerate" rather than "alfoscerate," and it is indexed under MCI (mild cognitive impairment) rather than general cognitive terms.

### Search 6: Consensus Academic Search — Alpha-GPC Clinical Trials

- **Database:** Consensus (Semantic Scholar, PubMed, ArXiv aggregation)
- **Query:** `Alpha-GPC choline alfoscerate supplementation cognitive function clinical trials evidence`
- **Date Filter:** 2024+ (year_min = 2024)
- **Results Returned:** 3
- **Date Executed:** 2026-03-05
- **Rationale:** Cross-reference against PubMed results using semantic search to capture any papers missed by keyword-based PubMed queries. Specifically targets clinical trial evidence and cognitive function outcomes, representing the primary consumer use case for Alpha-GPC supplementation.

---

## Results Summary

| Search | Database | Query Focus | Results | New Unique |
|---|---|---|---|---|
| Search 1 | PubMed | SRs and MAs (Alpha-GPC specific) | 0 | 0 |
| Search 2 | PubMed | Alpha-GPC cognitive (broadened) | 4 | 4 |
| Search 3 | PubMed | Choline supplement SRs cognitive | 2 | 2 |
| Search 4 | PubMed | Alpha-GPC reviews (general) | 3 | 1 |
| Search 5 | PubMed | Jeon 2024 targeted retrieval | 1 | 1 |
| Search 6 | Consensus | Clinical trials evidence | 3 | ~2 |
| **Total** | | | **13** | **~10** |

---

## Deduplication Notes

- Searches 2 and 4 produced 2 overlapping PMIDs. These duplicates were removed during manual deduplication.
- The Consensus search (Search 6) returned 3 results, of which approximately 1 overlapped with PubMed results from Searches 2-4. After deduplication, approximately 2 unique Consensus results were retained for screening.
- Search 5 retrieved a single targeted result (PMID 39300341) not captured by any other search, confirming the value of targeted retrieval for studies with alternate compound name spellings.
- Final unique papers screened: **~10**

---

## Search Limitations

1. **Nomenclature variability:** Alpha-GPC is referred to by multiple names in the literature: alpha-GPC, Alpha-GPC, choline alfoscerate, choline alphoscerate (alternate spelling), L-alpha-glycerylphosphorylcholine, and glycerophosphocholine. No single PubMed query captures all variants, necessitating multiple searches with different naming conventions. The alternate spelling "alphoscerate" in particular caused the Jeon 2024 RCT to be missed by standard searches and required a targeted retrieval (Search 5).
2. **Small evidence base:** The zero-result Search 1 (SRs and MAs) reflects the limited number of Alpha-GPC-specific systematic reviews in the literature. Most evidence syntheses address choline compounds as a class rather than Alpha-GPC individually, making it difficult to isolate Alpha-GPC-specific evidence.
3. **Overlap with citicoline literature:** Alpha-GPC and citicoline (CDP-choline) are both choline donors with overlapping mechanisms and clinical applications. Some meta-analyses pool these compounds together, while others compare them directly. This creates challenges in attributing evidence specifically to Alpha-GPC versus the broader choline donor class.
4. **Geographic bias:** A significant proportion of Alpha-GPC clinical trials have been conducted in Italy (where choline alfoscerate is marketed as the pharmaceutical Gliatilin/Delecit) and South Korea. English-language PubMed searches may underrepresent literature published in Italian, Korean, and Japanese journals.
5. **Language bias:** Searches were conducted in English only. Clinical trial reports published in Italian (particularly early Gliatilin trials from the 1990s) and Korean journals may not be fully indexed in PubMed with English abstracts.
6. **Database coverage:** bioRxiv/medRxiv were not searched. Preprint activity for Alpha-GPC clinical evidence is minimal. Grey literature including manufacturer-sponsored reports (Italfarmaco, Chemi SpA) was not systematically searched.
7. **Publication bias risk:** Alpha-GPC's status as a pharmaceutical product in some countries (Italy, South Korea) and a dietary supplement in others (USA) creates a fragmented regulatory landscape that may influence which trials are published and indexed.
