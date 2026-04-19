# Screening Decisions: Ergothioneine
## Pipeline Run: 2026-04-19

### Inclusion Criteria
1. Published in a peer-reviewed journal indexed in PubMed
2. Live PubMed and CrossRef verification (PMID + DOI both resolve to the cited paper)
3. Direct relevance to ergothioneine — supplement appears in title, MeSH terms, or constitutes a substantive subject of the abstract
4. One of: (a) human clinical or epidemiological evidence, (b) authoritative mechanistic/biochemical paper, (c) high-impact preclinical study cited as foundational by independent groups

### Exclusion Criteria
1. PMID does not resolve to the claimed paper on PubMed (anti-hallucination gate)
2. Peripheral mention only (ergothioneine is not the subject of the study)
3. Conference abstract / poster / commentary without original data or synthesis
4. Engineering / biosynthesis-only papers without translational relevance to supplementation
5. Duplicate publication of the same dataset

### Screening Results

#### Included Papers (12)

| # | PMID | Citation ID | Reason for Inclusion | Section |
|---|------|-------------|----------------------|---------|
| 1 | 31672783 | smith_2020_mortality | n=3236 prospective Malmö cohort, 21.4yr follow-up. Strongest long-term human signal. | benefits (cardiovascular) |
| 2 | 39544014 | yau_2024_mci_pilot | First completed placebo-controlled RCT of ergothioneine in humans (n=19, 12 months). | benefits (cognition); safety; dosage |
| 3 | 35090053 | kondoh_2022_frailty | Human metabolomic association study tying ergothioneine decline to frailty and dementia. | benefits (neuroprotection) |
| 4 | 32051057 | borodina_2020_biology | Authoritative biology / antioxidant nutraceutical review. | mechanisms (transport + antioxidant); safety |
| 5 | 38018890 | tian_2023_micronutrient | Br J Nutr horizons review on ergothioneine as a healthy-aging micronutrient. | mechanisms (Nrf2); benefits (longevity) |
| 6 | 30322941 | ames_2018_longevity_vitamin | Bruce Ames PNAS paper formally classifying ergothioneine as a "longevity vitamin". | benefits (longevity framework) |
| 7 | 39965563 | sprenger_2025_mpst | 2025 Cell Metabolism identification of MPST as the first physiologically relevant direct ergothioneine target. | mechanisms (MPST) |
| 8 | 34958679 | grundemann_2022_ett | Authoritative inventory of OCTN1/SLC22A4 (ETT) substrate specificity and tissue localisation. | mechanisms (transporter) |
| 9 | 36838636 | liu_2023_skin | Mechanistic review of ergothioneine antioxidant biochemistry, OCTN1 mitochondrial/nuclear localisation, glutathione cycle support. | mechanisms (antioxidant) |
| 10 | 38446314 | katsube_2024_mouse_lifespan | First mammalian (mouse) lifespan extension study with ergothioneine; provides preclinical longevity foundation. | benefits (neuroprotection / longevity) |
| 11 | 34715934 | tian_2021_ergms_protocol | ErgMS pilot RCT protocol — establishes the contemporary 5 mg/day and 30 mg/day human dosing framework. | dosage |
| 12 | 36829879 | cheah_2023_doxorubicin | Preclinical mouse model of doxorubicin cardiotoxicity protection by ergothioneine; cardiovascular co-therapy candidate. | benefits (cardiovascular preclinical) |

Note: PMID 38909533 (Fong 2024 BBRC mitochondrial uptake) is included as supporting evidence for the MPST mechanism card (alongside 39965563), bringing the verifier's unique-PMID count to 13 across 12 evidence-card slots.

#### Excluded Papers (notable rejections)

| Title (truncated) | PMID | Reason for Exclusion |
|-------------------|------|----------------------|
| Detection of Atrial fibrillation from non-episodic ECG data | 22255459 | Not about ergothioneine — issue starter PMID was wrong |
| Comparative Study of Dorsal and Volar Plating | 32000606 | Not about ergothioneine — issue starter PMID was wrong |
| Functional Analysis of Coronavirus Cross-Reactive Antibodies | 35069571 | Not about ergothioneine — issue starter PMID was wrong |
| Genetic backgrounds and hidden trait complexity | 28915487 | Not about ergothioneine — issue starter PMID was wrong |
| Urolithin A respiratory syncytial virus paper | 39051083 | Wrong supplement (Urolithin A, not ergothioneine) — issue starter PMID was wrong |
| Trimethylamine N-oxide (TMAO) review | 33746664 | Peripheral; ergothioneine mentioned in passing only |
| Engineering Yarrowia lipolytica for ergothioneine | 34817066 | Biosynthesis-only; no translational supplementation relevance |
| Histidine in Health and Disease | 32235743 | Histidine review; ergothioneine peripheral |
| Ergothioneine in microbial physiology | 28791878 | Microbial physiology focus; not human supplementation |

### PRISMA Flow Summary (informal — not a systematic review)

- Records identified via PubMed search arms 1–4: ~134 (40 + 15 + 15 + 15 + dedup)
- Unique records after deduplication: ~70
- Records screened by title/abstract: 35 (top results across arms)
- Full abstracts retrieved and assessed: 14
- Papers verified live (PMID + DOI both resolve correctly): 13
- Papers included in final evidence synthesis: 12 (one paper — Fong 2024 — supports the MPST card alongside Sprenger 2025 but is shared)

### Anti-Hallucination Verification Summary

- **PMIDs sourced from**: live PubMed esearch + esummary + efetch responses on 2026-04-19. No PMID was composed from memory.
- **DOIs sourced from**: PubMed esummary records (which include the publisher-assigned DOI). No DOI was reconstructed from journal/author/year.
- **Title fields**: Copied verbatim from PubMed efetch abstract responses. Not paraphrased.
- **Findings fields**: Each grounded in the corresponding paper's PubMed-served abstract text (read in full from the efetched abstract bundle).
- **Verification gate**: `node scripts/verify-citations.js --id 116` — exit code 0, 0 CRITICAL issues, 18/18 items have both PMID and DOI, all 13 unique PMIDs and 13 unique DOIs resolved correctly via PubMed and CrossRef.
