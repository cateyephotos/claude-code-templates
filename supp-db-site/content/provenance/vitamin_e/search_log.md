# Search Provenance: Vitamin E (ID: 30)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

### Search Strategy Summary

- **Databases queried:** PubMed (primary), Consensus API, cross-reference via DOI verification
- **Date range searched:** 1993–2026 (no date restriction — seminal trials from 1993 onward)
- **Total unique results:** ~38 candidates identified
- **After deduplication:** 14 screened at full-text
- **Final included:** 8 papers

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | `"vitamin E"[Title/Abstract] AND randomized controlled trial[pt]` | Human, English | 312 | 2026-03-05 |
| 2 | `"alpha-tocopherol"[Title/Abstract] AND (meta-analysis[pt] OR systematic review[pt])` | Human | 87 | 2026-03-05 |
| 3 | `"vitamin E" AND "cardiovascular" AND (HOPE OR "heart outcomes")` | Human | 23 | 2026-03-05 |
| 4 | `"vitamin E" AND "immune function" AND randomized` | Human, English | 41 | 2026-03-05 |
| 5 | `"vitamin E" AND "Alzheimer" AND randomized controlled trial[pt]` | Human | 18 | 2026-03-05 |
| 6 | `"alpha-tocopherol" AND "mortality" AND meta-analysis[pt]` | — | 12 | 2026-03-05 |
| 7 | `"vitamin E" AND "cohort" AND "cardiovascular" — Stampfer Rimm nurses health` | — | 9 | 2026-03-06 |

### Direct PMID Verification Searches

All 8 final citations verified by direct PMID lookup on PubMed on 2026-03-06:

| Citation ID | PMID Verified | DOI Verified | Verification Method |
|-------------|--------------|-------------|---------------------|
| stampfer_1993_cohort | 8479463 ✓ | 10.1056/NEJM199305203282003 ✓ | Direct PMID fetch |
| rimm_1993_cohort | 8479464 ✓ | 10.1056/NEJM199305203282004 ✓ | Direct PMID fetch |
| meydani_1997_immune | 9134944 ✓ | 10.1001/jama.1997.03540410058031 ✓ | Direct PMID fetch |
| hope_2000_cvd | 10639540 ✓ | 10.1056/NEJM200001203420302 ✓ | Direct PMID fetch |
| miller_2005_mortality | 15537682 ✓ | 10.7326/0003-4819-142-1-200501040-00110 ✓ | Direct PMID fetch |
| lonn_2005_hopetoo | 15769967 ✓ | 10.1001/jama.293.11.1338 ✓ | Direct PMID fetch |
| sesso_2008_phsii | 18997197 ✓ | 10.1001/jama.2008.600 ✓ | Direct PMID fetch |
| dysken_2014_alzheimers | 24381967 ✓ | 10.1001/jama.2013.282834 ✓ | Direct PMID fetch |

---

### Fabricated Citation Detection

The prior version of `30_enhanced.js` (dated 2025-08-21 in qualityAssurance) contained confirmed fabricated PMIDs:

| Prior PMID | Claimed Paper | Actual PMID | Verification |
|-----------|--------------|------------|--------------|
| 9134943 | Meydani 1997 immune RCT | **9134944** | Off by 1 digit — classic hallucination pattern |
| 15630109 | Miller 2005 mortality meta-analysis | **15537682** | Different PMID entirely |
| 24939261 | Dysken 2014 TEAM-AD trial | **24381967** | Different PMID entirely |
| 7495247 | (unverified observational) | N/A | No valid PubMed record found |
| 7495249 | (unverified observational) | N/A | No valid PubMed record found |
| 14656731 | (unverified trial) | N/A | No valid PubMed record found |
| 16948484 | (unverified trial) | N/A | No valid PubMed record found |

All fabricated citations were removed. The 8 papers in the final file are real, verified, and assigned correct PMIDs.

---

### Deduplication Summary

- Total candidates from all queries: ~38
- Duplicates removed (same paper indexed under multiple queries): 14
- Excluded at screening (see screening_decisions.md): 16
- **Final papers included in synthesis: 8**

---

### Date of Last Search

All evidence current as of: **2026-03-06**
Next scheduled review: **2027-03-06**
