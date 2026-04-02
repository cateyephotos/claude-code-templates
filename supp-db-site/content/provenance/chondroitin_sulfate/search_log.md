# Search Provenance: Chondroitin Sulfate (ID: 32)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP `search_articles` + `get_article_metadata`), Consensus API (via MCP)
- **Date range searched:** No restriction (all years); recency filter noted per query; GAIT trial (2006) and Hochberg JSN meta-analysis (2008) specifically targeted as foundational anchors
- **Total unique results:** ~22 candidates before screening
- **After deduplication:** 17
- **Final included:** 15 (13 human clinical/regulatory + 2 mechanistic in vitro retained for mechanism section)
- **Excluded:** 2 (1 animal study, 1 non-OA population)

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | `"chondroitin sulfate"[Title/Abstract] AND (randomized controlled trial[pt] OR meta-analysis[pt] OR systematic review[pt])` | Human, English, 2003-2025 | ~18 | 2026-03-06 |
| 2 | `chondroitin sulfate AND osteoarthritis AND meta-analysis` | Human | ~14 | 2026-03-06 |
| 3 | `chondroitin sulfate AND "network meta-analysis"` | — | 6 | 2026-03-06 |
| 4 | `chondroitin sulfate AND "joint space"` | — | 8 | 2026-03-06 |
| 5 | `"chondroitin sulfate" AND "CONCEPT trial"` | — | 4 | 2026-03-06 |
| 6 | `"chondroitin sulfate" AND "pharmaceutical grade"` | — | 5 | 2026-03-06 |
| 7 | `"MOVES trial" AND chondroitin` | — | 3 | 2026-03-06 |
| 8 | `chondroitin sulfate AND safety AND "systematic review"` | — | 5 | 2026-03-06 |

### Specific PMIDs Retrieved and Verified via `get_article_metadata`

Batch 1: PMIDs 12860572, 33074440, 31073924, 29947998
Batch 2: PMIDs 18668553, 19715677, 28533290, 30535141
Batch 3: PMIDs 16495392, 27558164, 32900519, 33207344
Batch 4: PMIDs 23301732, 39462324, 22843782
Additionally verified: PMIDs 15806182, 19595890 (mechanistic in vitro)

### Targeted Search: GAIT Trial Counter-Evidence
- **PMID 16495392** (Clegg 2006, NEJM): specifically retrieved as KEY COUNTER-EVIDENCE
- Search rationale: Prior version of this entry (32_chondroitin_sulfate_enhanced.js dated 2025-01-25) omitted the GAIT trial entirely despite it being the largest single RCT for the G+C combination and the defining null finding for nutraceutical-grade CS
- GAIT retrieval was mandatory per pipeline Mode 2 null-evidence inclusion requirement

### Targeted Search: Pharmaceutical vs. Nutraceutical Grade Distinction
- **PMID 28533290** (Reginster 2017, CONCEPT): specifically retrieved as the defining pharmaceutical-grade CS trial
- **PMID 30535141** (Gregori 2018, JAMA NMA): retrieved for large-N network meta-analysis with pCS vs nCS stratification
- **PMID 31073924** (Rojas-Briones 2017, GRADE review): retrieved to document formal GRADE downgrading of nutraceutical-grade CS

### Exclusion Detections During Search
- **PMID 38150843** (Chen 2024): Abstract confirmed equine (horse) chondroitin sulfate pharmacokinetics → excluded (non-human/veterinary)
- **PMID 35187456** (Li 2022): Abstract confirmed non-OA population (inflammatory bowel disease, colon mucosa CS); off-target application → excluded

### Consensus API Searches

| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "What is the clinical evidence for chondroitin sulfate in osteoarthritis?" | human=true, sjr_max=2 | 10 | 2026-03-06 |
| 2 | "Is pharmaceutical-grade chondroitin sulfate more effective than nutraceutical grade?" | human=true | 6 | 2026-03-06 |
| 3 | "Does chondroitin sulfate reduce joint space narrowing?" | human=true | 7 | 2026-03-06 |
| 4 | "What are the safety risks of chondroitin sulfate supplementation?" | — | 5 | 2026-03-06 |

### Deduplication Summary
- PubMed-Consensus overlap: ~4 duplicates removed
- Non-human/veterinary study removed: 1
- Off-target population removed: 1
- **Total unique human papers for screening:** 13
- **Mechanistic in vitro papers retained:** 2 (per pipeline exception rule)
- **Total papers in enhanced citation file:** 15
