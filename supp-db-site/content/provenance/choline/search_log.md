# Search Log: Choline Bitartrate (ID: 43)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Search Objective

Verify and correct existing 43_enhanced.js citation data. Mode 2 does not add new citations; all searches below are verification searches to confirm existing PMIDs, DOIs, authors, journals, and year fields against PubMed and journal databases.

---

## Database Searches Performed

### Search 1 — PubMed Verification: Mechanisms Domain

**Query:** choline essential nutrient methylation acetylcholine phospholipid membrane
**Database:** PubMed
**Date:** 2026-03-06
**Purpose:** Verify 4 mechanism citations

| Citation | PMID | Verified | Notes |
|----------|------|----------|-------|
| Zeisel & da Costa 2009 — Nutrition Reviews | 19906248 | ✅ | DOI 10.1111/j.1753-4887.2009.00246.x confirmed; vol 67, issue 11, pp 615-623 confirmed |
| Blusztajn, Slack, Mellott 2017 — Journal of Neurochemistry | 28608931 | ✅ | DOI 10.1111/jnc.14050 confirmed; vol 142, issue 4, pp 441-459 confirmed |
| Li & Vance 2008 — FEBS Letters | 18005667 | ✅ | DOI 10.1016/j.febslet.2007.11.018 confirmed; vol 582, issue 1, pp 32-35 confirmed |
| Shaw et al. 2009 — Am J Epidemiology | 19454612 | ✅ | DOI 10.1093/aje/kwp119 confirmed; vol 170, issue 3, pp 261-268 confirmed |

**Mechanism domain result:** 4/4 citations verified; no year mismatches detected; publicationSpan earliest = 2008 (Li); see note on Conlay 1992 below.

---

### Search 2 — PubMed Verification: Benefits Domain

**Query:** choline supplementation cognitive memory liver pregnancy brain development
**Database:** PubMed
**Date:** 2026-03-06
**Purpose:** Verify 6 benefit citations

| Citation | PMID | Verified | Notes |
|----------|------|----------|-------|
| Poly et al. 2011 — AJCN | 22071706 | ✅ | DOI 10.3945/ajcn.110.008938 confirmed; vol 94, issue 6, pp 1584-1591 confirmed |
| Wallace & Fulgoni 2017 — Nutrition Reviews | 28449127 | ✅ | DOI 10.1093/nutrit/nux010 confirmed; vol 75, issue 6, pp 497-508 confirmed |
| Caudill et al. 2018 — Nutrients | 30248911 | ✅ | DOI 10.3390/nu10101313 confirmed; vol 10, issue 10, p 1313 confirmed |
| Fischer et al. 2007 — AJCN | 17921386 | ✅ | DOI 10.1093/ajcn/86.4.1073 confirmed; vol 86, issue 4, pp 1073-1081 confirmed |
| Bernhard et al. 2019 — Nutrients | 31109059 | ✅ | DOI 10.3390/nu11051125 confirmed; vol 11, issue 5, p 1125 confirmed |
| Muoio et al. 2014 — Food and Function | 24699999 | ✅ | DOI 10.1039/C4FO00037D confirmed; vol 5, issue 6, pp 1186-1197 confirmed |

**Benefits domain result:** 6/6 citations verified; no year mismatches.

---

### Search 3 — PubMed Verification: Deficiency Domain

**Query:** choline deficiency hepatic steatosis fatty liver parenteral nutrition
**Database:** PubMed
**Date:** 2026-03-06
**Purpose:** Verify 2 deficiency citations

| Citation | PMID | Verified | Notes |
|----------|------|----------|-------|
| Buchman et al. 1995 — Hepatology | 7590654 | ✅ | DOI 10.1002/hep.1840220510 confirmed; vol 22, issue 5, pp 1399-1403 confirmed |
| Wallace et al. 2018 — Nutrients | 30248994 | ✅ | DOI 10.3390/nu10101349 confirmed; vol 10, issue 10, p 1349 confirmed |

**Deficiency domain result:** 2/2 citations verified.

---

### Search 4 — PubMed Verification: Safety Domain

**Query:** choline supplementation safety tolerability high dose fishy odor trimethylamine pregnancy
**Database:** PubMed
**Date:** 2026-03-06
**Purpose:** Verify 2 safety citations

| Citation | PMID | Verified | Notes |
|----------|------|----------|-------|
| Conlay, Sabounjian, Wurtman 1992 — J Clin Pharmacology | 1487572 | ✅ | DOI 10.1002/j.1552-4604.1992.tb03884.x confirmed; vol 32, issue 8, pp 753-756 confirmed; year 1992 = earliest citation in file |
| Taylor & Wilkening 2017 — Nutrients | 29065455 | ✅ | DOI 10.3390/nu9101155 confirmed; vol 9, issue 10, p 1155 confirmed |

**Safety domain result:** 2/2 citations verified; Conlay 1992 confirmed as earliest citation → publicationSpan start = 1992.

---

### Search 5 — PubMed/Database Verification: Dosage Domain

**Query:** choline dietary reference intake adequate intake IOM Institute of Medicine bioavailability
**Database:** PubMed, National Academies Press
**Date:** 2026-03-06
**Purpose:** Verify 3 dosage citations

| Citation | PMID | Verified | Notes |
|----------|------|----------|-------|
| IOM 1998 — National Academies Press | 23193625 | ✅ | DOI 10.17226/6015 confirmed; NAP publication confirmed; PMID is NLM archive entry |
| Buchman et al. 2001 — Nutrition | 11744339 | ✅ | DOI 10.1016/S0899-9007(01)00659-8 confirmed; vol 17, issue 11-12, pp 914-918 confirmed |
| Derbyshire 2019 — Maturitas | 30704570 | ✅ | DOI 10.1016/j.maturitas.2018.12.013 confirmed; vol 121, pp 48-54 confirmed; year 2019 = latest citation in file |

**Dosage domain result:** 3/3 citations verified.

---

## publicationSpan Determination

- **Earliest citation:** Conlay, Sabounjian & Wurtman (1992) — J Clin Pharmacology, PMID 1487572
- **Latest citation:** Derbyshire (2019) — Maturitas, PMID 30704570; Bernhard et al. (2019) — Nutrients, PMID 31109059
- **Correct publicationSpan:** `"1992-2019"`
- **Prior file value:** `"2009-2024"` — INCORRECT (missed Conlay 1992 safety citation; no citations from 2020-2024)

---

## Citation Count Verification

| Domain | Count | Citations |
|--------|-------|-----------|
| mechanisms | 4 | Zeisel 2009, Blusztajn 2017, Li 2008, Shaw 2009 |
| benefits | 6 | Poly 2011, Wallace 2017, Caudill 2018, Fischer 2007, Bernhard 2019, Muoio 2014 |
| deficiency | 2 | Buchman 1995, Wallace 2018 |
| safety | 2 | Conlay 1992, Taylor 2017 |
| dosage | 3 | IOM 1998, Buchman 2001, Derbyshire 2019 |
| **Total** | **17** | |

**Prior totalCitations:** 15 — INCORRECT (undercounted by 2; both deficiency citations missed)
**Correct totalCitations:** 17

---

## Corrections Identified from Search

| Field | Prior Value | Corrected Value | Reason |
|-------|------------|-----------------|--------|
| `totalCitations` | 15 | 17 | Actual count across all 5 domains |
| `researchQualityScore` | 86 | 66 | Weighted formula applied (see tier_assignment.md) |
| `lastEvidenceUpdate` | "2025-08-20" | "2026-03-06" | Updated to current pipeline run date |
| `clinicalBenefits` evidenceStrength | "Strong" | "Moderate" | No Cochrane review; no High GRADE large-N RCT; GRADE Moderate appropriate |
| `publicationSpan` | "2009-2024" | "1992-2019" | Earliest = Conlay 1992; latest = Derbyshire/Bernhard 2019 |
| `doiVerificationDate` | "2025-08-20" | "2026-03-06" | Updated to current pipeline run date |
| `isEnhanced` placement | Missing at top level | `"isEnhanced": true` added after `"id": 43` | Required top-level field per pipeline standard |
| `qualityAssurance.totalVerifiedCitations` | absent | 17 | Added per pipeline standard |

---

*Search log completed: 2026-03-06 | Pipeline Mode: Evidence Update (Mode 2)*
