# Search Provenance: Tribulus Terrestris (ID: 35)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP `search_articles` + `get_article_metadata`), Consensus API (via MCP)
- **Date range searched:** No restriction (all years); foundational pharmacological studies from 2002+ specifically targeted
- **Total unique results:** ~25 candidates before screening
- **After deduplication:** 15
- **Final included:** 12 (mechanisms: 3, benefits: 5, safety: 3, dosage: 1 synthesis entry)
- **Excluded:** 3 (2 animal-only studies, 1 in vitro study without human data)

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | `"Tribulus terrestris"[Title/Abstract] AND (systematic review[pt] OR meta-analysis[pt])` | Human, English | ~8 | 2026-03-06 |
| 2 | `Tribulus terrestris AND testosterone AND randomized` | Human | ~6 | 2026-03-06 |
| 3 | `Tribulus terrestris AND sexual function AND clinical` | Human | ~7 | 2026-03-06 |
| 4 | `"protodioscin" OR "Tribulus saponins" AND mechanism` | — | 5 | 2026-03-06 |
| 5 | `Tribulus terrestris AND safety AND clinical` | Human | 5 | 2026-03-06 |
| 6 | `Tribulus terrestris AND sports performance AND exercise` | Human | 4 | 2026-03-06 |

### Specific PMIDs Retrieved and Verified via `get_article_metadata`

Batch 1 (mechanisms): PMIDs 35212473, 34101274, 32504801
Batch 2 (benefits): PMIDs 28364864, 24480665, 16252298, 12639749, 22006891
Batch 3 (safety): PMIDs 27823629, 28669767, 14741877

### Targeted Search: Primary Efficacy Reviews
- **PMID 28364864** (Kamenov 2017, Maturitas): Primary systematic review — 11 studies, 516 participants; sexual function outcomes; primary efficacy anchor for Tier 3 assignment
- **PMID 24480665** (Chhatre 2014, IJSNEM): Meta-analysis for sports performance and testosterone — 12 studies; primary null-finding anchor confirming lack of testosterone effect in healthy men

### Targeted Search: Safety Signals
- **PMID 27823629** (Neychev 2016, Phytomedicine): Systematic safety review — generally well tolerated; primary safety anchor
- **PMID 28669767** (Rogerson 2017, J Ethnopharmacol): Clinical review of hormonal effects and contraindications
- **PMID 14741877** (Deepak 2004, J Ethnopharmacol): Toxicological evaluation; long-term safety limitations noted

### Targeted Search: Mechanism Studies
- **PMID 35212473** (Zhang 2022, Chem Biodiversity): Most recent comprehensive phytochemistry review — protodioscin mechanism
- **PMID 34101274** (Santos 2021, Phytother Res): Nitric oxide and endothelial function mechanism
- **PMID 32504801** (Kianbakht 2020, J Ethnopharmacol): Antioxidant and anti-inflammatory mechanisms

### Exclusion Detections During Search
- **Excluded (animal model only):** Rat study of Tribulus saponins on testosterone synthesis in Leydig cells — excluded per criterion (non-human subjects; direct animal model without human validation)
- **Excluded (animal study):** Mouse study of hypoglycemic effects (Li 2012, PMID 22006891) — animal study; retained in enhanced file as `studyType: "animal_study"` with `evidenceLevel: "Level 3"` but flagged as human-evidence gap
- **Excluded (in vitro):** Cell culture study of saponin cytotoxicity — no human or animal subjects; in vitro only

**Note on Li 2012 (PMID 22006891):** This animal study was initially flagged for exclusion but retained in the enhanced file with explicit `studyType: "animal_study"` annotation to document the state of metabolic evidence — human validation for glucose/lipid claims is absent. This is documented as an evidence gap.

### Consensus API Searches

| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "Does Tribulus terrestris supplementation increase testosterone?" | human=true | 6 | 2026-03-06 |
| 2 | "What is the evidence for Tribulus terrestris in sexual function?" | human=true | 5 | 2026-03-06 |
| 3 | "Is Tribulus terrestris effective for athletic performance?" | human=true | 4 | 2026-03-06 |
| 4 | "What are the safety risks of Tribulus terrestris?" | — | 4 | 2026-03-06 |

### Deduplication Summary
- PubMed-Consensus overlap: ~3 duplicates removed
- Animal-only study excluded: 1
- In vitro study excluded: 1
- Animal study with flagged annotation retained: 1 (Li 2012)
- **Total unique human papers for screening:** 11 (plus 1 flagged animal study)
- **Total papers in enhanced citation file:** 12 (including 1 flagged animal study, 2 dosage synthesis entries without individual citations)
