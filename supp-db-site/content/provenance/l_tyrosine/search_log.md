# Search Provenance: L-Tyrosine (ID: 33)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP `search_articles` + `get_article_metadata`), Consensus API (via MCP)
- **Date range searched:** No restriction (all years); seminal environmental stress studies (1989, 1999) specifically targeted as foundational anchors
- **Total unique results:** ~22 candidates before screening
- **After deduplication:** 14
- **Final included:** 11 (10 human clinical/review + 1 mechanistic review retained for mechanism section)
- **Excluded:** 3 (1 animal study, 1 non-English, 1 off-target population)

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | `"L-tyrosine"[Title/Abstract] AND (randomized controlled trial[pt] OR meta-analysis[pt] OR systematic review[pt])` | Human, English | ~14 | 2026-03-06 |
| 2 | `tyrosine AND cognitive AND stress AND meta-analysis` | Human | ~8 | 2026-03-06 |
| 3 | `tyrosine AND "catecholamine" AND (cold OR altitude OR stress)` | — | 7 | 2026-03-06 |
| 4 | `tyrosine AND "working memory" AND stress` | — | 6 | 2026-03-06 |
| 5 | `"L-tyrosine" AND endurance AND meta-analysis` | — | 4 | 2026-03-06 |
| 6 | `tyrosine AND "cognitive performance" AND "randomized"` | — | 9 | 2026-03-06 |
| 7 | `tyrosine AND military AND stress AND cognitive` | — | 5 | 2026-03-06 |
| 8 | `tyrosine AND "dopamine precursor" AND brain` | — | 4 | 2026-03-06 |

### Specific PMIDs Retrieved and Verified via `get_article_metadata`

Batch 1: PMIDs 38345351, 26424423, 25213144, 17585971
Batch 2: PMIDs 32266720, 39010361, 29616221, 2736402
Batch 3: PMIDs 10230711, 25797188, 26126146

### Targeted Search: Key Counter-Evidence (Null Findings)
- **PMID 38345351** (Fernandez-Sanchez 2024, J Sports Sci): specifically retrieved as KEY COUNTER-EVIDENCE for endurance claims
- Search rationale: Prior database version (33_l_tyrosine_enhanced.js dated 2025-08-20) lacked adequate weighting of GRADE-rated null evidence for physical performance
- The Fernandez 2024 meta-analysis (8 RCTs, n=187, GRADE very-low) is the most methodologically rigorous pooling of endurance data and establishes null for physical performance claims

### Targeted Search: Foundational Stress-Cognitive Evidence
- **PMID 2736402** (Banderet & Lieberman 1989, Brain Res Bull): seminal military stress study — first human evidence; retrieved specifically as historical anchor
- **PMID 10230711** (Deijen 1999, Brain Res Bull): first chronic-exposure study (1-week cadets); retrieved for sustained-stress evidence
- **PMID 26424423** (Nobre 2015, J Psychiatr Res): most comprehensive review of cognitive-stress evidence; primary synthesis anchor

### Exclusion Detections During Search
- **Excluded (animal):** One rodent catecholamine depletion study — excluded per criterion (non-human subjects)
- **Excluded (non-English):** One German-language tyrosine stress trial — excluded per criterion 4 (no English abstract available)
- **Excluded (off-target):** One tyrosine metabolism study in phenylketonuria patients — excluded per criterion 3 (clinical metabolic disease population, not cognitive/stress supplementation)

### Consensus API Searches

| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "Does L-tyrosine improve cognitive performance under stress?" | human=true, sjr_max=2 | 8 | 2026-03-06 |
| 2 | "What is the evidence for tyrosine supplementation in cognitive enhancement?" | human=true | 6 | 2026-03-06 |
| 3 | "Does tyrosine improve physical performance or endurance?" | human=true | 5 | 2026-03-06 |
| 4 | "What are the safety risks of L-tyrosine supplementation?" | — | 4 | 2026-03-06 |

### Deduplication Summary
- PubMed-Consensus overlap: ~3 duplicates removed
- Animal study excluded: 1
- Non-English without abstract excluded: 1
- Off-target population (PKU metabolic): 1
- **Total unique human papers for screening:** 11
- **Total papers in enhanced citation file:** 11
