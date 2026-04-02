# Search Provenance: Glucosamine (ID: 28)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP `search_articles` + `get_article_metadata`), Consensus API (via MCP)
- **Date range searched:** No restriction (all years); recency filter noted per query
- **Total unique results:** ~22 candidates before screening
- **After deduplication:** 18
- **Final included:** 16 (14 human clinical + 2 mechanistic in vitro retained from prior entry)
- **Excluded:** 2 (1 retracted, 1 veterinary)

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | `"glucosamine"[Title/Abstract] AND (randomized controlled trial[pt] OR meta-analysis[pt] OR systematic review[pt])` | Human, English, 2017-2025 | ~18 | 2026-03-06 |
| 2 | `glucosamine AND osteoarthritis AND meta-analysis` | Human | ~15 | 2026-03-06 |
| 3 | `glucosamine AND "network meta-analysis"` | — | 5 | 2026-03-06 |
| 4 | `glucosamine AND "individual patient data"` | — | 3 | 2026-03-06 |
| 5 | `glucosamine AND "joint space"` | — | 8 | 2026-03-06 |

### Specific PMIDs Retrieved and Verified via `get_article_metadata`

Batch 1: PMIDs 16495392, 29018060, 35024906, 29947998
Batch 2: PMIDs 30575881, 39685902, 38581640, 40123938
Batch 3: PMIDs 29713967, 37997783, 35654458, 24462672
Batch 4: PMIDs 30566740, 28754801
Additionally verified: PMIDs 24792208, 14749079 (mechanistic in vitro)

### Exclusion Detections During Search
- **PMID 35924114** (Wang 2022): `get_article_metadata` returned `article_types` containing "Retracted Publication" → immediately excluded
- **PMID 36142319** (Barbeau-Grégoire 2022): Title contained "cats and dogs"; abstract confirmed veterinary study → excluded

### Consensus API Searches

| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "What are the effects of glucosamine on osteoarthritis pain?" | human=true, sjr_max=2 | 10 | 2026-03-06 |
| 2 | "Is glucosamine effective for joint space narrowing?" | human=true | 8 | 2026-03-06 |
| 3 | "Does funding source affect glucosamine trial results?" | — | 4 | 2026-03-06 |

### Deduplication Summary
- PubMed-Consensus overlap: ~5 duplicates removed
- Retracted paper removed: 1
- Veterinary study removed: 1
- **Total unique human papers for screening:** 14
- **Mechanistic in vitro papers retained from prior entry:** 2
- **Total papers in enhanced citation file:** 16
