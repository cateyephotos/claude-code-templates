# Search Provenance: Sulforaphane
## Pipeline Run: 2026-04-19 | Mode: 1 (New Supplement Research)

### Search Strategy Summary
- **Databases queried:** PubMed (E-utilities API)
- **Total unique results identified:** 96 (PubMed primary)
- **Final included citations:** 12 papers
- **All identifiers verified live** via PubMed esummary on 2026-04-19; `verify-citations.js --id 117` exit 0, **0 CRITICAL** issues, all 12 unique PMIDs and 12 unique DOIs (16 evidence-card slot uses) resolved correctly.

### PubMed Searches (E-utilities)

| # | Endpoint | Query / IDs | Filters | Results | Date |
|---|----------|-------------|---------|---------|------|
| 1 | esearch  | `sulforaphane AND (randomized controlled trial[pt] OR meta-analysis[pt] OR systematic review[pt]) AND humans[mh]` | retmax=40, sort=relevance | 96 total / 40 retrieved | 2026-04-19 |
| 2 | esearch  | `sulforaphane autism spectrum Singh` | retmax=10 | 7 | 2026-04-19 |
| 3 | esearch  | `sulforaphane Nrf2 mechanism` | retmax=15 | 494 / 15 retrieved | 2026-04-19 |
| 4 | esearch  | `sulforaphane autism Hopkins Singh Zimmerman` | retmax=5 | 5 | 2026-04-19 |
| 5 | esearch  | `Kensler sulforaphane Nrf2 broccoli` | retmax=5 | 5 | 2026-04-19 |
| 6 | esummary | Issue starter PMIDs 24913818, 28968660, 30322724, 23346067, 34927143 | verification | 5 | 2026-04-19 |
| 7 | esummary | Top 23 candidates from search 1 | full metadata | 23 | 2026-04-19 |
| 8 | esummary | 13 final candidates | full metadata | 13 | 2026-04-19 |
| 9 | efetch   | 12 final PMIDs (25313065, 24913818, 34034808, 36771424, 40041932, 39045769, 37023957, 29266773, 16965241, 30735751, 33515348, 21910945) | rettype=abstract | 12 abstracts | 2026-04-19 |

### Verification of Linear-issue Starter PMIDs

| Starter PMID | What the issue said it was | What PubMed actually returned | Action |
|--------------|----------------------------|-------------------------------|--------|
| 24913818 | "Singh K et al. PNAS 2014 ASD trial" | **CORRECT but mislabeled**: this is actually the Egner Qidong broccoli-sprout RCT (Cancer Prev Res 2014) | **Re-attributed**: included as Egner et al 2014 |
| 28968660 | "Houghton CA Oxid Med Cell Longev 2019" | "Innate Immune Response and Outcome of Clostridium difficile Infection" (J Infect Dis 2018) | **Discarded** (wrong paper) |
| 30322724 | "Zhang Y, Gilmour MI NRF2 broccoli-sprout" | "Early clindamycin for bacterial vaginosis in pregnancy" (Lancet 2018) | **Discarded** (wrong paper) |
| 23346067 | "Egner PA Qidong RCT" | "Temporal structure and complexity affect audio-visual correspondence" (Front Psychol 2012) | **Discarded** (Qidong RCT is actually PMID 24913818, sourced via search 1) |
| 34927143 | "2022 sulforaphane blood-pressure meta-analysis" | "Exaggerated Immune Reaction to Trichophyton Fungus" (Arch Intern Med Res 2020) | **Discarded** (wrong paper) |

The actual Singh ASD trial was located via search 4 and has PMID **25313065** (PNAS 2014).

### Final Reference Set (12 papers)

| PMID | Year | Journal | First Author | Role |
|------|------|---------|--------------|------|
| 25313065 | 2014 | PNAS | Singh K | Benefits — pivotal ASD RCT |
| 24913818 | 2014 | Cancer Prev Res | Egner PA | Mechanisms (Nrf2, Phase II); Benefits (detoxification cohort RCT) |
| 34034808 | 2021 | Mol Autism | Zimmerman AW | Benefits — ASD pediatric follow-up RCT |
| 36771424 | 2023 | Nutrients | Magner M | Benefits — null ASD RCT in young children |
| 40041932 | 2025 | Cancer Prev Res | Yuan JM | Benefits — Phase II lung-cancer chemoprevention |
| 39045769 | 2024 | Food Funct | Tian S | Benefits — NAFLD insulin-resistance RCT |
| 37023957 | 2023 | Life Sci | Monteiro EB | Benefits — preclinical renoprotection meta-analysis |
| 29266773 | 2018 | Mol Nutr Food Res | Sivapalan T | Mechanisms / Dosage — bioavailability RCT |
| 16965241 | 2006 | Nutr Cancer | Shapiro TA | Safety — Phase I |
| 30735751 | 2019 | Food Chem Toxicol | Chartoumpekis DV | Safety — 12-week thyroid RCT |
| 33515348 | 2021 | Mol Biol Rep | Clifford T | Mechanisms — Nrf2 systematic review |
| 21910945 | 2012 | Br J Nutr | Cramer JM | Mechanisms / Dosage — myrosinase synergy bioavailability |
