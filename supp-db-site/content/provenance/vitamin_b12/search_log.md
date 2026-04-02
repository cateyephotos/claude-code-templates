# Search Provenance: Vitamin B12 (ID 21)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP), PubMed convert_article_ids (DOI→PMID), PubMed get_article_metadata (PMID batch)
- **Date range searched:** No restriction (all time)
- **Total unique results retrieved for verification:** 16 (existing citations from original 21_vitamin_b12_enhanced.js)
- **After verification and replacement:** 12 citations included

---

### PubMed Searches — Citation Verification

All searches conducted via `get_article_metadata` tool (PubMed MCP) by PMID batch, then supplemented with targeted searches for replacement papers.

#### Batch 1: Mechanism Citations (Original File)
| PMID | Queried As | Resolved Paper | Match? |
|------|-----------|----------------|--------|
| 15539209 | finkelstein_1990_methionine | Finkelstein JD 1990 — "Methionine metabolism in mammals" J Nutr Biochem | YES (minor DOI suffix correction: -6 → -2) |
| 23301732 | stabler_2013_clinical | Stabler SP 2013 — "Vitamin B12 deficiency" NEJM | YES |
| 37046885 | alruwaili_2023_neurological | Alruwaili A et al. 2023 — "The Association between Vitamin B12 Deficiency and Neurological..." Healthcare | YES |

#### Batch 2: Benefit Citations (Original File — Wrong PMIDs Detected)
| PMID | Queried As in Original | Resolved Paper | Match? |
|------|----------------------|----------------|--------|
| 27431365 | smith_refsum_2016_dementia | Skeletal muscle fiber-type-specific proteome analysis — UNRELATED | NO — excluded |
| 19344370 | dali_youcef_2009_neurological | Delta-opioid receptor gene deletion paper — UNRELATED | NO — excluded |
| 33809682 | hankey_eikelboom_stroke | Fungal phylogenomics paper — UNRELATED | NO — excluded |
| 17959875 | clarke_2007_cognitive | Schizophrenia/cognition paper — UNRELATED | NO — excluded |
| 28663834 | thakkar_2015 | Dermoscopy/OCT paper — UNRELATED | NO — excluded |
| 1669841 | healton_1991 | NEJM editorial on gun control — UNRELATED | NO — excluded |
| 29262078 | (unlabeled) | NOT FOUND in PubMed | NO — excluded |
| 28615249 | green_2017 | Kidney/SIRT1 aging paper — UNRELATED | NO — excluded |
| 1995981 | lederle_1991 | JAMA editorial on healthcare variation — UNRELATED | NO — excluded |
| 29635493 | stabler_2018 | Avocado/cardiovascular meta-analysis — UNRELATED | NO — excluded |

#### Batch 3: Replacement Papers Found via Targeted PubMed Searches
| PMID | Search Query | Resolved Paper |
|------|-------------|----------------|
| 17991650 | "vitamin B12" cognitive "adjusted hazard ratio" elderly 2007 | Clarke R et al. 2007 — "Folate and vitamin B12 status in relation to cognitive impairment and dementia" AJCN |
| 29480200 | Smith Refsum "vitamin B12" dementia 2016 2017 2018 homocysteine | Smith AD, Refsum H 2016/published 2018 — "Homocysteine, B Vitamins, and Cognitive Impairment" JAD |
| 37495210 | "B vitamin supplementation" homocysteine meta-analysis 2023 2024 | Sohouli MH et al. 2024 — "The effect of B vitamin supplementation on homocysteine" Nutrition Reviews |
| 28816346 | "vitamin B12" cardiovascular Cochrane 2017 | Martí-Carvajal AJ et al. 2017 — "Homocysteine-lowering interventions for preventing CVD" Cochrane |
| 10784463 | "vitamin B12" depression elderly Penninx | Penninx BW et al. 2000 — "Vitamin B12 deficiency and depression in physically disabled older women" AJP |
| 19124628 | "vitamin B12" aphthous stomatitis RCT Volkov | Volkov I et al. 2009 — "Effectiveness of vitamin B12 in treating recurrent aphthous stomatitis" JABFM |
| 19116323 | Allen 2008 "vitamin B12" deficiency review AJCN | Allen LH 2008 — "Causes of vitamin B12 and folate deficiency" AJCN |
| 24803097 | Watanabe 2014 "vitamin B12" plant-based vegan | Watanabe F et al. 2014 — "Vitamin B12-Containing Plant Food Sources for Vegetarians" Nutrients |
| 16034940 | "oral vitamin B12" "intramuscular" Cochrane Vidal-Alaball | Vidal-Alaball J et al. 2005 — "Oral versus intramuscular vitamin B12 for vitamin B12 deficiency" Cochrane |

---

### DOI Resolution via convert_article_ids

| DOI | Resolved PMID | Notes |
|-----|--------------|-------|
| 10.1016/0955-2863(90)90070-2 | 15539209 | Corrected from -6 suffix in original file |

---

### Excluded Citations (from original 21_vitamin_b12_enhanced.js)

| Original PMID | Claimed Paper | Actual Paper at That PMID | Reason for Exclusion |
|--------------|--------------|--------------------------|---------------------|
| 27431365 | Smith/Refsum 2016 dementia/B12 | Skeletal muscle fiber-type proteome analysis | Wrong PMID — completely unrelated paper |
| 19344370 | Dali-Youcef neurological | Delta-opioid receptor gene deletion | Wrong PMID — completely unrelated paper |
| 33809682 | Hankey/Eikelboom stroke homocysteine | Fungal phylogenomics | Wrong PMID — completely unrelated paper |
| 17959875 | Clarke 2007 cognitive | Schizophrenia/cognition | Wrong PMID — Clarke 2007 is PMID 17991650 |
| 28663834 | Thakkar 2015 | Dermoscopy/OCT paper | Wrong PMID — completely unrelated paper |
| 1669841 | Healton 1991 | NEJM editorial on gun control | Wrong PMID — completely unrelated paper |
| 29262078 | (unidentified) | NOT FOUND | PMID does not exist in PubMed |
| 28615249 | Green 2017 | Kidney/SIRT1 aging | Wrong PMID — completely unrelated paper |
| 1995981 | Lederle 1991 | JAMA editorial on healthcare variation | Wrong PMID — completely unrelated paper |
| 29635493 | Stabler 2018 | Avocado/cardiovascular meta-analysis | Wrong PMID — completely unrelated paper |

---

### Search Updates vs Previous Entry

The previous entry (original `21_vitamin_b12_enhanced.js`) contained 16 citations. After verification:
- **6 citations verified correct** (with minor DOI corrections for 3)
- **10 citations excluded** (PMID resolves to completely unrelated papers, or PMID not found)
- **6 new citations found** via targeted PubMed searches to replace excluded papers
- **Final included citations: 12**

### Date of Search
All searches conducted: 2026-03-06
Next scheduled search: 2027-03-06
