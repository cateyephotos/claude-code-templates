# Search Provenance: NAD+ Precursors (NR / NMN) (ID 25)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP), Consensus API, bioRxiv
- **Date range searched:** 2015–2026
- **Total unique results reviewed:** ~65 candidate papers
- **After deduplication and screening:** 17 included
- **Special condition:** Prior 25_enhanced.js did not exist; full citation construction from scratch required. Prior supplements.js entry had evidence tier 3 with placeholder citations and structural schema violations.

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | "nicotinamide riboside"[Title/Abstract] AND (meta-analysis[pt] OR systematic review[pt]) | Human, English | 8 | 2026-03-06 |
| 2 | "nicotinamide mononucleotide"[Title/Abstract] AND (meta-analysis[pt] OR systematic review[pt]) | Human, English | 6 | 2026-03-06 |
| 3 | "NR" OR "NMN" AND "NAD+" AND randomized controlled trial[pt] | Human, English | 22 | 2026-03-06 |
| 4 | "nicotinamide riboside"[Title/Abstract] AND "cardiovascular" AND randomized controlled trial[pt] | Human, English | 5 | 2026-03-06 |
| 5 | "nicotinamide mononucleotide"[Title/Abstract] AND "insulin sensitivity" AND human | Human, English | 4 | 2026-03-06 |
| 6 | "nicotinamide riboside"[Title/Abstract] AND "muscle" OR "physical performance" AND human | Human, English | 9 | 2026-03-06 |
| 7 | "NAD+ precursors" AND safety toxicology humans | Human, English | 7 | 2026-03-06 |
| 8 | "nicotinamide riboside" pharmacokinetics bioavailability dose human | Human, English | 8 | 2026-03-06 |
| 9 | "NMN" "nicotinamide mononucleotide" gut microbiota metabolism NAD conversion | Any | 6 | 2026-03-06 |

### Consensus API Searches

| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "What are the effects of nicotinamide riboside or NMN on metabolism and aging?" | human=true, sjr_max=2 | 9 | 2026-03-06 |
| 2 | "Does NR or NMN supplementation improve physical performance or muscle function?" | human=true | 6 | 2026-03-06 |
| 3 | "What is the safety profile of high-dose NMN or nicotinamide riboside supplementation?" | human=true | 4 | 2026-03-06 |

### bioRxiv Searches

| # | Category | Date Range | Results | Date Executed |
|---|----------|-----------|---------|---------------|
| 1 | pharmacology | 2024–2026 | 4 preprints; none met inclusion criteria | 2026-03-06 |
| 2 | biochemistry | 2025–2026 | 2 preprints; in vitro only, excluded | 2026-03-06 |

### Deduplication Summary
- PubMed-Consensus overlap: ~14 duplicates removed
- Total unique papers meeting title/abstract screening: ~35
- Papers proceeding to full abstract review: 24
- Final included: 17
- Papers excluded at abstract review: 7 (see screening_decisions.md)

---

### Key Papers Identified by Domain

#### Mechanisms
- PMID 31917996 — Braidy et al 2020 Antioxid Redox Signal (NAD+ biology review; aging-related decline)
- PMID 27721479 — Trammell et al 2016 Nat Commun (NR pharmacokinetics; Preiss-Handler pathway)
- PMID 41540253 — Christen et al 2026 Nature Metabolism (microbiota conversion; NR→nicotinic acid)
- PMID 36515353 — Vreones et al 2022 Nutrients (mitochondrial markers; NMN crossover RCT n=30)

#### Physical Performance (Benefits)
- PMID 40275690 — Prokopidis et al 2025 JCSM (meta-analysis; grip strength SMD +0.31)
- PMID 36482258 — Yi et al 2022 Nutrients (RCT n=48; aerobic capacity and muscle endurance)
- PMID 38789831 — Morifuji et al 2024 Nutrients (RCT n=41; muscle strength and fatigue elderly)

#### Cardiovascular (Benefits)
- PMID 29599478 — Martens et al 2018 Nat Commun (RCT n=30; SBP −5.8 mmHg hypertensive subgroup)
- PMID 36797393 — Katayoshi et al 2023 npj Aging (NMN RCT n=40; arterial stiffness, peripheral NAD+)
- PMID 36740954 — Pencina et al 2023 JCEM (dose-response RCT; NAD+ elevation pharmacokinetics)

#### Metabolic / Insulin Sensitivity (Benefits)
- PMID 33888596 — Yoshino et al 2021 Science (landmark RCT n=25; insulin sensitivity prediabetic women)
- PMID 39531138 — Chen et al 2024 Nutr Metab Cardiovasc Dis (meta-analysis; null for glucose/HbA1c)
- PMID 35182418 — Pencina et al 2023 J Gerontol (RCT n=30; dose-response NAD+ elevation and metabolic)

#### Cognitive / Neuroprotection (Benefits)
- PMID 37994989 — Orr et al 2023 Aging (NR RCT n=22; cognitive function older adults)
- PMID 39422945 — Alghamdi et al 2024 Nutrients (NMN RCT n=28; cognitive biomarkers elderly)

#### Safety
- PMID 36002548 — Fukamizu et al 2022 Nutrients (NMN RCT n=31; safety up to 1250 mg/day)
- PMID 31278280 — Conze et al 2019 Sci Rep (NR safety; NOAEL 300 mg/kg/day; clinical doses safe)
- PMID 36482258 — Yi et al 2022 Nutrients (AE data from exercise RCT)

#### Dosage (Pharmacokinetics)
- PMID 27721479 — Trammell et al 2016 Nat Commun (PK; Tmax ~2h; dose-dependent NAD+ elevation)
- PMID 35182418 — Pencina et al 2023 J Gerontol (dose-response; 600 mg vs 1000 mg vs 2000 mg NMN)
- PMID 31278280 — Conze et al 2019 Sci Rep (safety and dose tolerability data)
