# Search Provenance: Glycine
## Pipeline Run: 2026-04-19 | Mode: 1 (New Supplement Research)

### Search Strategy Summary
- **Databases queried:** PubMed (E-utilities API)
- **Final included citations:** 12 unique papers (17 evidence-card slot uses)
- **Verification gate:** `verify-citations.js --id 118` exit 0, **0 CRITICAL issues**, all PMIDs and DOIs resolved correctly via PubMed and CrossRef

### PubMed Searches

| # | Endpoint | Query | Results | Date |
|---|----------|-------|---------|------|
| 1 | esearch | `glycine AND (sleep OR insomnia) AND (randomized controlled trial[pt] OR clinical trial[pt]) AND humans[mh]` retmax=20 | 27 | 2026-04-19 |
| 2 | esearch | `GlyNAC (glycine N-acetylcysteine) aging Sekhar` retmax=10 | 6 | 2026-04-19 |
| 3 | esearch | `glycine AND (glutathione OR collagen) AND humans[mh]` retmax=15 | 2134 / 15 retrieved | 2026-04-19 |
| 4 | esearch | `Yamadera glycine sleep` retmax=5 | 0 | 2026-04-19 |
| 5 | esearch | `glycine ingestion improves subjective sleep quality` retmax=5 | 3 | 2026-04-19 |
| 6 | esearch | `glycine sleep polysomnography Inagawa Bannai` retmax=10 | 0 | 2026-04-19 |
| 7 | esummary | Issue starter PMIDs (17563476, 22293292, 34647538, 32459725, 26389579, 21921459) | verification | 6 | 2026-04-19 |
| 8 | esummary | 17 final candidates | full metadata | 17 | 2026-04-19 |
| 9 | efetch | 12 final PMIDs | rettype=abstract | 12 | 2026-04-19 |

### Verification of Linear-issue Starter PMIDs

| Starter PMID | What the issue said it was | What PubMed actually returned | Action |
|--------------|----------------------------|-------------------------------|--------|
| 17563476 | "Yamadera 2007 Sleep Biol Rhythms glycine sleep RCT" | "Bibliography. Current world literature. Genes and nutrition." (Curr Opin Clin Nutr Metab Care 2007) | **Discarded** |
| 22293292 | "Bannai & Kawai 2012 Front Neurol review" | **CORRECT** title and journal: J Pharmacol Sci 2012 review | **Included as Bannai 2012 (PMID 22293292)** |
| 34647538 | "Kumar 2021 Clin Transl Med GlyNAC older adults" | "Chronic ACE/beta-blocker use in Italy" (Recenti Prog Med 2021) | **Discarded** (real Kumar 2021 GlyNAC trial is PMID 33783984, sourced via search 2) |
| 32459725 | "Sekhar 2020 Aging GlyNAC older adults" | "Chronic benzodiazepine use in depression neuropharmacology" (Int Clin Psychopharmacol 2020) | **Discarded** (real Sekhar GlyNAC review is PMID 34587244, sourced via search 2) |
| 26389579 | "Heresco-Levy schizophrenia glycine NMDA adjunct" | "Comment on bacterium nickel tolerance" (Can J Microbiol 2015) | **Discarded** (NMDA schizophrenia evidence integrated via File 1999 mechanism citation instead) |
| 21921459 | "Meléndez-Hevia glycine deficient amino acid" | "Disease-modifying therapies in PD" (Rinsho Shinkeigaku 2010) | **Discarded** (the deficient-AA argument captured via Dunstan 2017 PMID 28330481) |

### Final Reference Set (12 papers)

| PMID | Year | Journal | First Author | Role |
|------|------|---------|--------------|------|
| 22293292 | 2012 | J Pharmacol Sci | Bannai M | Benefits (sleep); Safety review |
| 22529837 | 2012 | Front Neurol | Bannai M | Benefits (sleep, daytime performance); Dosage |
| 10587285 | 1999 | J Clin Psychopharmacol | File SE | Mechanisms (NMDA); Benefits (memory) |
| 36094342 | 2023 | Med Sci Sports Exerc | Langan-Evans C | Benefits (combination supplement sleep RCT) |
| 28330481 | 2017 | Nutr J | Dunstan RH | Mechanisms (collagen substrate; urinary AA loss) |
| 27872968 | 2017 | Adv Biochem Eng Biotechnol | Uneyama H | Benefits (sleep narrative review) |
| 34587244 | 2021 | J Nutr | Sekhar RV | Mechanisms (GSH precursor narrative review) |
| 33783984 | 2021 | Clin Transl Med | Kumar P | Mechanisms (GSH precursor pilot trial) |
| 35975308 | 2023 | J Gerontol A | Kumar P | Benefits (GlyNAC RCT); Safety; Dosage |
| 35268089 | 2022 | Nutrients | Kumar P | Benefits (GlyNAC mouse lifespan) |
| 33007928 | 2020 | Biomedicines | Kumar P | Benefits (GlyNAC HIV) |
| 37237908 | 2023 | Antioxidants (Basel) | Kumar P | Benefits (GlyNAC mouse brain) |

**Critical positioning note (per SUPP-274):** GlyNAC papers are cited only for **glycine-specific mechanistic inference** (substrate-level GSH restoration) and as supportive aging-hallmark evidence \u2014 not as primary glycine-only efficacy evidence. The pure-glycine RCT base remains the Bannai (sleep) and File (cognition) trials.
