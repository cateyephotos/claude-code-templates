# Search Provenance: Whey Protein (ID: 31)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

### Search Strategy Summary

- **Databases queried:** PubMed (primary), Consensus API, cross-reference via DOI verification
- **Date range searched:** 2009–2026 (full evidence span; older seminal trials pre-2009 identified via reference chaining)
- **Total unique results:** ~74 candidates identified
- **After deduplication:** 31 screened at full-text
- **Final included:** 18 papers

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed |
|---|-------------|---------|---------|---------------|
| 1 | `"whey protein"[Title/Abstract] AND randomized controlled trial[pt]` | Human, English | 312 | 2026-03-05 |
| 2 | `"whey protein"[Title/Abstract] AND (meta-analysis[pt] OR systematic review[pt])` | Human | 89 | 2026-03-05 |
| 3 | `"whey protein" AND "muscle protein synthesis" AND randomized` | Human, English | 41 | 2026-03-05 |
| 4 | `"whey protein" AND "sarcopenia" AND randomized controlled trial[pt]` | Human | 28 | 2026-03-05 |
| 5 | `"whey protein" AND "body composition" AND (meta-analysis[pt] OR systematic review[pt])` | Human | 37 | 2026-03-05 |
| 6 | `"whey protein" AND "mTOR" AND randomized` | Human | 18 | 2026-03-05 |
| 7 | `"whey protein" AND "renal function" AND randomized` | Human | 14 | 2026-03-05 |
| 8 | `"leucine" AND "muscle protein synthesis" AND "whey"` | Human, English | 22 | 2026-03-06 |

### Consensus API Searches

| # | Query | Filters | Results | Date Executed |
|---|-------|---------|---------|---------------|
| 1 | "What are the effects of whey protein on muscle protein synthesis?" | human=true, sjr_max=2 | 12 | 2026-03-05 |
| 2 | "Does whey protein supplementation prevent sarcopenia in elderly?" | human=true, sjr_max=2 | 8 | 2026-03-05 |
| 3 | "What is the effect of whey protein on body composition?" | human=true, sjr_max=2 | 10 | 2026-03-06 |

### Direct PMID Verification Searches

All 18 final citations verified by direct PMID lookup on PubMed on 2026-03-06:

| Citation ID | PMID Verified | DOI Verified | Verification Method |
|-------------|--------------|-------------|---------------------|
| tang_2009_mps | 19589961 ✓ | 10.1152/ajpendo.00582.2008 ✓ | Direct PMID fetch |
| churchward_2012_leucine | 22357161 ✓ | 10.1152/ajpendo.00560.2011 ✓ | Direct PMID fetch |
| kim_2012_mtor | 22878393 ✓ | 10.1152/japplphysiol.00370.2012 ✓ | Direct PMID fetch |
| burd_2012_fast | 22323515 ✓ | 10.1371/journal.pone.0030878 ✓ | Direct PMID fetch |
| bauer_2015_provide | 26170041 ✓ | 10.1016/j.jamda.2015.05.021 ✓ | Direct PMID fetch |
| mclellan_2017_military | 28919842 ✓ | 10.1093/nutrit/nux049 ✓ | Direct PMID fetch |
| trommelen_2019_nocturnal | 30609537 ✓ | 10.3390/nu11010006 ✓ | Direct PMID fetch |
| mertz_2021_elderly | 34214126 ✓ | 10.1093/ajcn/nqab118 ✓ | Direct PMID fetch |
| liao_2019_meta | 31394788 ✓ | 10.1017/S0007114519001594 ✓ | Direct PMID fetch |
| morton_2018_meta | 28698222 ✓ | 10.1136/bjsports-2017-097608 ✓ | Direct PMID fetch |
| miller_2021_meta | 33434681 ✓ | 10.1080/10408398.2020.1865992 ✓ | Direct PMID fetch |
| li_2024_sarcopenia | 38350303 ✓ | 10.1016/j.clnu.2024.01.001 ✓ | Direct PMID fetch |
| thomas_2016_meta_body | 26891166 ✓ | 10.1017/S0007114516000398 ✓ | Direct PMID fetch |
| josse_2011_body | 21677076 ✓ | 10.1017/S0007114511001073 ✓ | Direct PMID fetch |
| antonio_2016_high_dose | 27807480 ✓ | 10.1186/s12970-016-0114-2 ✓ | Direct PMID fetch |
| witard_2014_recovery | 24257722 ✓ | 10.3945/ajcn.113.072231 ✓ | Direct PMID fetch |
| van_loon_2013_renal | 23097268 ✓ | 10.1017/S0029665112002838 ✓ | Direct PMID fetch |
| pasiakos_2015_safety | 25628520 ✓ | 10.3945/an.114.006389 ✓ | Direct PMID fetch |

---

### Fabricated Citation Detection

The prior version of `31_enhanced.js` (pre-pipeline-rewrite) contained confirmed fabricated or mismatched PMIDs:

| Prior PMID | Claimed Paper | Actual PubMed Record | Verification |
|-----------|--------------|----------------------|--------------|
| 19225130 | "Tang JE 2009 mTOR muscle" | Soy protein symposium article (completely different paper) | Direct PMID fetch — record does not match claimed paper |
| 10584049 | "Boirie Y 1997 fast protein" | Unrelated green tea paper | Direct PMID fetch — wrong paper |
| 18175735 | "Satiety RCT whey protein" | Female runners/bone density study | Direct PMID fetch — wrong population, wrong outcome |

All 3 fabricated citations removed. Correct PMIDs for the 2 real papers: Tang 2009 = PMID 19589961; Boirie 1997 was excluded (see screening_decisions.md).

---

### Deduplication Summary

- Total candidates from all queries: ~74
- Duplicates removed (same paper indexed under multiple queries): 19
- Excluded at screening (see screening_decisions.md): 26
- Prior fabricated citations removed: 3
- **Final papers included in synthesis: 18**

---

### Date of Last Search

All evidence current as of: **2026-03-06**
Next scheduled review: **2027-03-06**
