# Search Provenance: MSM (Methylsulfonylmethane, ID: 29)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

### Search Strategy Summary

- **Databases queried:** PubMed (primary), Consensus API, bioRxiv
- **Date range searched:** No lower bound — all human clinical evidence for MSM
- **Total unique results identified:** ~22 candidates
- **After deduplication and screening:** 8 papers included
- **Retracted/veterinary/no-human-data excluded prior to full screening:** 3

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | "methylsulfonylmethane"[Title/Abstract] AND (randomized controlled trial[pt] OR meta-analysis[pt] OR systematic review[pt]) | Human, English | 18 | 2026-03-06 |
| 2 | "MSM"[Title/Abstract] AND "osteoarthritis"[MeSH] AND (randomized controlled trial[pt] OR systematic review[pt]) | Human, English | 9 | 2026-03-06 |
| 3 | "methylsulfonylmethane"[Title/Abstract] AND "exercise"[Title/Abstract] | Human, English | 7 | 2026-03-06 |
| 4 | "methylsulfonylmethane" AND "NF-kB"[Title/Abstract] | No filter | 4 | 2026-03-06 |

**Specific PMID lookups (targeted verification):**
- PMID 21708034 → Debbi 2011 (confirmed)
- PMID 28300758 → Butawan 2017 (confirmed)
- PMID 30986309 → Crawford 2019 (confirmed)
- PMID 32027398 → Toguchi 2023 (confirmed as 32027398 for this author pool)
- PMID 23836598 → Kim 2013 — CONFIRMED: This is Kim LS et al. 2006 published online, indexed 2013 (PMID 23836598)
- PMID 14527436 → Usha / Naidu 2004 (confirmed)
- PMID 32182567 → Withee 2017 (confirmed)
- PMID 39789006 → Chen 2025 NMA (confirmed)

**PMID specifically excluded (fabricated citation from prior file):**
- Prior file referenced "Kim 2006" with PMID 21708034 — this PMID belongs to Debbi 2011. No PubMed record exists for a "Kim 2006" OA RCT on MSM under that PMID. PMID 23836598 corresponds to the correct Kim LS et al. paper (originally published 2006, PMID assigned 2013 via journal indexing). The corrected citation is kim_2006_oa_pilot in the enhanced file using PMID 23836598.

---

### Consensus API Searches

| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "What are the effects of methylsulfonylmethane on joint pain and osteoarthritis?" | human=true, sjr_max=2 | 8 | 2026-03-06 |
| 2 | "Is MSM effective for musculoskeletal pain?" | human=true | 6 | 2026-03-06 |

Consensus results largely overlapped with PubMed results; no unique papers identified.

---

### bioRxiv Searches

| # | Category | Search Term | Date Range | Results | Date Executed |
|---|----------|-------------|-----------|---------|---------------|
| 1 | pharmacology | methylsulfonylmethane | last 365 days | 0 | 2026-03-06 |
| 2 | biochemistry | MSM joint | last 365 days | 1 | 2026-03-06 |

bioRxiv result: 1 preprint identified (MSM mechanisms in chondrocytes) — excluded from final set as preprint with no peer review.

---

### Deduplication Summary

- PubMed-Consensus overlap: 6 duplicates removed
- PubMed-PubMed cross-query overlap: 4 duplicates removed
- bioRxiv preprint excluded (not peer-reviewed): 1
- Veterinary/animal studies excluded: 2
- **Total unique papers for full-text screening: 11**
- **Papers meeting inclusion criteria: 8**
- **Papers excluded at full-text review: 3** (see screening_decisions.md)
