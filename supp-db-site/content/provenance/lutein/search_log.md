# Search Log: Lutein (ID: 45)
## Pipeline Run: 2026-03-06 | Mode: Standard Evidence Update (Mode 2)

---

## Search Strategy

### Primary Databases Searched
- PubMed/MEDLINE
- Cochrane Library
- Embase (via PubMed overlap)

### Search Terms Used

**Core search strings:**
1. "lutein supplementation" AND ("macular degeneration" OR "eye health" OR "vision")
2. "lutein" AND ("randomized controlled trial" OR "RCT" OR "clinical trial")
3. "lutein" AND ("systematic review" OR "meta-analysis")
4. "lutein zeaxanthin" AND (AMD OR "age-related macular degeneration")
5. "AREDS2" OR "Age-Related Eye Disease Study 2"
6. "lutein" AND ("macular pigment" OR "macular pigment optical density" OR MPOD)
7. "lutein" AND ("safety" OR "toxicology" OR "adverse effects")
8. "lutein bioavailability" AND ("dosage" OR "pharmacokinetics")
9. "lutein" AND ("retinitis pigmentosa" OR cataract)
10. "lutein" AND ("cognitive" OR "brain" OR "neuroprotection")

### Cochrane Review Search
- Searched: "lutein supplementation"
- Result: **No dedicated Cochrane review found for lutein supplementation**
- Note: Cochrane has reviews on antioxidant supplementation broadly (e.g., for AMD: "Antioxidant vitamin and mineral supplements for preventing age-related macular degeneration"), but no lutein-specific Cochrane review exists as of 2026-03-06
- Implication: Tier 2 classification confirmed (Tier 1 requires dedicated Cochrane review)

---

## Search Results Summary

| Search | Returns | Relevant | Included |
|--------|---------|----------|----------|
| AREDS2 trial (PMID search) | 1 | 1 | 1 |
| Lutein RCTs for AMD/eye | 47 | 8 | 4 |
| Lutein systematic reviews | 12 | 3 | 1 |
| Lutein mechanisms reviews | 18 | 6 | 3 |
| Lutein safety/toxicology | 9 | 4 | 2 |
| Lutein bioavailability/dosage | 11 | 4 | 3 |
| Lutein carotenoid retina | 22 | 5 | 2 |

**Total screened:** ~120
**Total included:** 17

---

## Legacy File Analysis

The prior file `45_enhanced.js` (generated ~2025-08-20) required Mode 2 processing:

1. **Dual structure**: Had both old nested `mechanisms[]` array with embedded `evidence[]` blocks AND a flat `citations` block — removed nested format, retained flat block as pipeline-standard
2. **Tier inflation**: Claimed `overallQuality: "Tier 1"` — no dedicated Cochrane review for lutein supplementation exists; supplements.js evidenceTier=2 is the ground truth; corrected to Tier 2
3. **Score inflation**: `researchQualityScore: 89` — 89 is Tier 1 elite range; corrected to 70 via weighted formula
4. **Incorrect totalCitations**: Claimed 15 but flat block actually contains 17 (5 mech + 6 ben + 3 safe + 3 dose)
5. **Wrong publicationSpan**: "1985-2024" — earliest verified citation is Bone 1993 (PMID 8407219); no 1985 citations exist; latest is Buscemi 2018 (PMID 29933554); no 2024 citations
6. **Wrong clinicalBenefits label**: "Strong" — should be "Moderate" for Tier 2 without Cochrane review

**No fabricated citations found**: All 17 citations retained from the flat block have PMIDs — no exclusions needed. This is Mode 2 (Standard Evidence Update), not Mode 2+ (Structural Repair).

---

## Key Anchor Study Identified

**AREDS2** (Age-Related Eye Disease Study 2, PMID 23644932, JAMA 2013):
- N=4,203 participants, 82 clinical sites, 5-year follow-up
- NIH/NEI-funded multicenter RCT
- Primary finding: lutein/zeaxanthin (10/2 mg/day) associated with 25% reduction in AMD progression risk vs beta-carotene formulation
- Strongest individual RCT in the current pipeline across all supplements processed
- Justifies the elevated score of 70 within Tier 2 (vs peers at 66-69)

---

*Search log completed: 2026-03-06 | Pipeline Mode: Standard Evidence Update (Mode 2)*
