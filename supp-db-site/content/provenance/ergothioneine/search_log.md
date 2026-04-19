# Search Provenance: Ergothioneine
## Pipeline Run: 2026-04-19 | Mode: 1 (New Supplement Research)

### Search Strategy Summary
- **Databases queried:** PubMed (E-utilities API)
- **Date range searched:** No date restriction (covered 2007–2025; final reference set spans 2018–2025)
- **Total unique results identified:** 89 (PubMed, primary search)
- **Final included citations:** 12 (after screening per Mode 1 inclusion criteria)
- **All identifiers verified live** via PubMed esummary on 2026-04-19; all 13 unique PMIDs and 13 unique DOIs passed `verify-citations.js` with 0 CRITICAL issues.

### PubMed Searches (E-utilities)

| # | Endpoint | Query String | Filters | Results | Date |
|---|----------|--------------|---------|---------|------|
| 1 | esearch  | `ergothioneine AND (randomized controlled trial[pt] OR meta-analysis[pt] OR systematic review[pt] OR review[pt]) AND humans[mh]` | retmax=40, sort=relevance | 89 total / 40 retrieved | 2026-04-19 |
| 2 | esearch  | `ergothioneine AND (cardiovascular OR mortality OR Smith Ottosson OR Malmo)` | retmax=15 | 15 | 2026-04-19 |
| 3 | esearch  | `ergothioneine supplementation human` | retmax=15 | 15 | 2026-04-19 |
| 4 | esearch  | `ergothioneine AND (cognition OR neuroprotection OR dementia OR frailty)` | retmax=15 | 15 | 2026-04-19 |
| 5 | esummary | PMIDs 22255459, 32000606, 35069571, 28915487, 39051083 | (verification of issue starter PMIDs) | 5 | 2026-04-19 |
| 6 | esummary | Top-20 from search 1 | full metadata | 20 | 2026-04-19 |
| 7 | esummary | 15 candidates from searches 2–4 | full metadata | 15 | 2026-04-19 |
| 8 | efetch   | PMIDs 31672783, 39544014, 35090053, 32051057, 38018890, 30322941, 39965563, 34958679, 36838636, 36623925, 38446314, 34715934, 36829879, 38909533 | rettype=abstract | 14 abstracts | 2026-04-19 |

### Verification of Linear-issue Starter PMIDs

The Linear issue (SUPP-272) supplied 5 starter PMIDs as anchors. All 5 were verified against live PubMed and found to be **incorrect / hallucinated** — none point to ergothioneine papers:

| Starter PMID | What the issue said it was | What PubMed actually returned |
|--------------|----------------------------|-------------------------------|
| 22255459 | Halliwell 2018 FEBS Letters review | "Detection of Atrial fibrillation from non-episodic ECG data" (Annu Int Conf IEEE EMB Soc 2011) |
| 32000606 | Cheah & Halliwell 2021 BBA | "Comparative Study of Dorsal and Volar Plating for Ulnar Shortening Osteotomy" (J Hand Surg Asian Pac Vol 2020) |
| 35069571 | Smith/Ottosson Heart 2020 cardiovascular | "Functional Analysis of Human and Feline Coronavirus Cross-Reactive Antibodies" (Front Immunol 2021) |
| 28915487 | Halliwell 2017 Free Radic Biol Med | "Genetic backgrounds and hidden trait complexity in natural populations" (Curr Opin Genet Dev 2017) |
| 39051083 | 2024 ergothioneine RCT | Urolithin A (not ergothioneine) RSV mouse study (Nan Fang Yi Ke Da Xue Xue Bao 2024) |

Per the SKILL.md anti-hallucination rules and the issue's own instruction ("each PMID below must still be re-verified"), all 5 were discarded and the final reference set was built **only from PMIDs returned by live PubMed search results**. Notably, the actual Smith/Ottosson Heart 2020 cardiovascular paper was located via search 2 and has PMID **31672783** — this was substituted for the incorrect 35069571 in the database.

### Final Reference Set (12 papers)

| PMID | Year | Journal | First Author | Role |
|------|------|---------|--------------|------|
| 31672783 | 2020 | Heart | Smith E | Benefits — cardiovascular & all-cause mortality cohort |
| 39544014 | 2024 | J Alzheimer's Dis | Yau YF | Benefits — pilot RCT cognition; Safety; Dosage |
| 35090053 | 2022 | FEBS Letters | Kondoh H | Benefits — frailty & cognition observational |
| 32051057 | 2020 | Nutr Res Rev | Borodina I | Mechanisms (transport, antioxidant); Safety review |
| 38018890 | 2023 | Br J Nutr | Tian X | Mechanisms (Nrf2); Benefits (longevity) |
| 30322941 | 2018 | PNAS | Ames BN | Benefits — "longevity vitamin" framework |
| 39965563 | 2025 | Cell Metab | Sprenger HG | Mechanisms — MPST direct activation |
| 34958679 | 2022 | FEBS Letters | Gründemann D | Mechanisms — OCTN1/SLC22A4 transporter |
| 36838636 | 2023 | Molecules | Liu HM | Mechanisms — antioxidant biochemistry (skin) |
| 38446314 | 2024 | GeroScience | Katsube M | Benefits — mouse lifespan extension |
| 34715934 | 2021 | Pilot Feasibility Stud | Tian X | Dosage — ErgMS pilot RCT protocol |
| 36829879 | 2023 | Antioxidants (Basel) | Cheah IK | Benefits — doxorubicin cardioprotection (preclinical) |

### Deduplication Summary
- All four search arms returned overlapping PMIDs (especially the longevity/cognition arms). Final 12 papers were de-duplicated by PMID across search arms.
- 38909533 (Fong 2024 BBRC mitochondrial uptake) appears in the enhanced citations file as supporting evidence to MPST mechanism but is included via the 14-PMID abstract fetch (search 8). Counted within the 12 unique papers used in evidence cards (counts 13 unique PMIDs/DOIs because the verifier sees both 38909533 and 39965563 in the MPST mechanism card).
