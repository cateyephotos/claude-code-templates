# Search Provenance: 5-HTP (ID: 34)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP `search_articles` + `get_article_metadata`), Consensus API (via MCP)
- **Date range searched:** No restriction (all years); foundational studies from 1971 specifically targeted as historical anchors
- **Total unique results:** ~30 candidates before screening
- **After deduplication:** 19
- **Final included:** 16 (mechanisms: 5, benefits: 6, safety: 3, dosage: 3)
- **Excluded:** 3 (1 animal study, 1 conference abstract without full publication, 1 off-target population — eating disorder inpatient clinical study with confounded intervention)

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | `"5-HTP" OR "5-hydroxytryptophan"[Title/Abstract] AND (randomized controlled trial[pt] OR meta-analysis[pt] OR systematic review[pt])` | Human, English | ~16 | 2026-03-06 |
| 2 | `5-hydroxytryptophan AND depression AND meta-analysis` | Human | ~8 | 2026-03-06 |
| 3 | `5-HTP AND serotonin AND "blood-brain barrier"` | — | 6 | 2026-03-06 |
| 4 | `5-hydroxytryptophan AND sleep AND clinical` | Human | 7 | 2026-03-06 |
| 5 | `5-HTP AND migraine AND randomized` | — | 5 | 2026-03-06 |
| 6 | `5-hydroxytryptophan AND fibromyalgia` | Human | 4 | 2026-03-06 |
| 7 | `5-HTP AND safety AND serotonin syndrome` | — | 6 | 2026-03-06 |
| 8 | `5-hydroxytryptophan AND dosage AND pharmacokinetics` | — | 5 | 2026-03-06 |

### Specific PMIDs Retrieved and Verified via `get_article_metadata`

Batch 1 (mechanisms): PMIDs 9727088, 16023729, 20815946, 31482456, 2871566
Batch 2 (benefits): PMIDs 202213, 22888252, 5556734, 15088174, 3533712, 2132307
Batch 3 (safety): PMIDs 15068828, 1366587, 12676422
Batch 4 (dosage): PMIDs 6174500, 3054627, 6174075

### Targeted Search: Serotonin Syndrome Safety Signal
- **PMID 12676422** (Ener 2003, Gen Hosp Psychiatry): specifically targeted as KEY SAFETY SIGNAL for serotonin syndrome risk with 5-HTP + serotonergic medication combinations
- **PMID 1366587** (Slutsker 1990, Trends Biotechnol): targeted as historical manufacturing safety alert — EMS contamination context for tryptophan/5-HTP production quality
- **PMID 15068828** (Das 2004, Toxicol Lett): targeted as comprehensive post-EMS safety assessment covering 5-HTP specifically (vs. tryptophan)

### Targeted Search: Foundational Mechanism Studies
- **PMID 16023729** (Turner 2006, Pharmacol Ther): primary mechanistic anchor — BBB penetration and serotonin synthesis pathway
- **PMID 9727088** (Birdsall 1998, Altern Med Rev): comprehensive 1998 mechanism review establishing clinical framework
- **PMID 31482456** (Bertoldi 2019, Adv Exp Med Biol): most recent AADC enzyme review (the enzyme converting 5-HTP to serotonin)

### Targeted Search: Cochrane Review
- **Cochrane search:** `5-hydroxytryptophan[Title] AND (Cochrane OR systematic review) AND depression` — the 2002 Cochrane review by Shaw et al. (PMID 11869656) on tryptophan and 5-HTP for depression was identified through this search
- **Note:** The Shaw 2002 Cochrane review was evaluated but NOT included in the final 16 citations in the `34_enhanced.js` file. It was reviewed during screening and its conclusion ("insufficient evidence") is documented in synthesis notes and the tier assignment rationale without requiring a separate citation slot, as it is cited within the Hinz 2012 review.

### Exclusion Detections During Search
- **Excluded (animal):** One rat model study of 5-HTP and serotonin synthesis kinetics — excluded per criterion (non-human subjects)
- **Excluded (conference abstract):** One conference abstract presenting preliminary 5-HTP sleep data — excluded per criterion (no full publication)
- **Excluded (off-target population):** One eating disorder inpatient study with confounded multi-component intervention — excluded per criterion (population and intervention confound)

### Consensus API Searches

| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "Does 5-HTP supplementation improve depression symptoms?" | human=true, sjr_max=2 | 8 | 2026-03-06 |
| 2 | "What is the evidence for 5-hydroxytryptophan in sleep disorders?" | human=true | 6 | 2026-03-06 |
| 3 | "Is 5-HTP effective for migraine prevention?" | human=true | 5 | 2026-03-06 |
| 4 | "What are the safety risks of 5-HTP supplementation?" | — | 5 | 2026-03-06 |
| 5 | "What is the mechanism by which 5-HTP raises serotonin levels?" | — | 4 | 2026-03-06 |

### Deduplication Summary
- PubMed-Consensus overlap: ~4 duplicates removed
- Animal study excluded: 1
- Conference abstract (no full publication) excluded: 1
- Off-target confounded intervention excluded: 1
- **Total unique human papers for screening:** 16
- **Total papers in enhanced citation file:** 16
