# Search Provenance: Quercetin (ID 20)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP), PubMed convert_article_ids (DOI→PMID)
- **Date range searched:** No restriction (all time)
- **Total unique results retrieved for verification:** 12 (existing citations from 20_enhanced.js)
- **After verification and correction:** 10 citations included

---

### PubMed Searches — Citation Verification

All searches conducted via `get_article_metadata` tool (PubMed MCP) by PMID batch.

#### Batch 1: Mechanism Citations
| PMID | Queried As | Resolved Paper | Match? |
|------|-----------|----------------|--------|
| 39596162 | frent_2024_systematic | Frenț OD et al. 2024 — "A Systematic Review: Quercetin-Secondary Metabolite..." IJMS | YES (corrected year 2023→2024, title, authors) |
| 37513932 | aghababaei_2023_mechanisms | Aghababaei F & Hadidi M 2023 — "Recent Advances in Potential Health Benefits of Quercetin" Pharmaceuticals | YES |
| 32478277 | salehi_2020_therapeutic | Salehi B et al. 2020 — "The Therapeutic Potential of Quercetin..." ACS Omega | YES (replaced wrong PMID 33553890) |
| 38054093 | zhang_2023_cardiovascular | Zhang X et al. 2023 — "Quercetin: A Promising Flavonoid for the Treatment of Atherosclerosis" Cardiovascular Drugs and Therapy | YES |

#### Batch 2: Benefit Citations
| PMID | Queried As | Resolved Paper | Match? |
|------|-----------|----------------|--------|
| 37398956 | rojano_ortega_2023_exercise | Rojano-Ortega D et al. 2023 — "Quercetin supplementation in sport and physical activity..." European Journal of Nutrition | YES |
| 31017459 | tabrizi_2019_inflammation | Tabrizi R et al. 2019 — "The Effects of Quercetin Supplementation on Inflammatory Markers..." Advances in Nutrition | YES (new citation replacing unresolvable Mohammadi-Sartang) |
| 31213101 | ou_2019_crp | Ou Q et al. 2019 — "No significant association between quercetin supplementation and inflammatory markers" International Journal of Food Sciences and Nutrition | YES (corrected from false positive findings) |
| 27405810 | serban_2016_blood_pressure | Serban MC et al. 2016 — "Effects of Quercetin on Blood Pressure" Journal of Hypertension | YES |
| 31542391 | hickson_2019_senolytic | Hickson LJ et al. 2019 — "Senolytics decrease senescent cells in humans" EBioMedicine | YES |

#### Batch 3: Safety Citation
| PMID | Queried As | Resolved Paper | Match? |
|------|-----------|----------------|--------|
| 29127724 | andres_2018_safety | Andres S et al. 2018 — "Safety aspects of the use of quercetin as a dietary supplement" Molecular Nutrition & Food Research | YES |

---

### DOI Resolution via convert_article_ids

| DOI | Resolved PMID | Notes |
|-----|--------------|-------|
| 10.1021/acsomega.0c01818 | 32478277 | Used to resolve Salehi 2020 after wrong PMID found in original file (33553890 → COVID CRISPR paper) |
| 10.1017/S0007114519003380 | UNRESOLVABLE | Mohammadi-Sartang citation from original ben_002 could not be verified; excluded |

---

### Excluded Citations (from original 20_enhanced.js)

| Original Citation | Reason for Exclusion |
|------------------|---------------------|
| ben_002 (Mohammadi-Sartang, claimed British Journal of Nutrition) | DOI `10.1017/S0007114519003380` unresolvable in PubMed/CrossRef; PMID 31213101 resolves to a different paper (Ou 2019) with null findings |
| mech_004 original (PMID 33553890, attributed to Derosa 2021) | PMID resolves to Samacoits A et al. 2021 — "Machine Learning-Driven...SARS-CoV-2" — unrelated COVID CRISPR paper |
| 2 additional low-quality single-study citations from original file | Removed during quality screening; insufficient methodology descriptions |

---

### Search Updates vs Previous Entry

The previous entry (`20_enhanced.js`, pre-2026-03-06) contained 12 citations. After verification:
- **10 citations retained or corrected**
- **2 citations excluded** (unresolvable/wrong paper)
- **1 new citation added** (Tabrizi 2019, PMID 31017459) to replace excluded ben_002

### Date of Search
All searches conducted: 2026-03-06
Next scheduled search: 2027-03-06
