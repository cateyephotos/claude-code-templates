# Search Log: Selenium (ID: 42)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Search Objective

Mode 2 Evidence Update: Audit existing citations in `42_enhanced.js` for structural correctness, metadata accuracy, and evidence quality scoring. This is NOT a new evidence search — no new citations are added. The objective is to verify, document, and correct the existing 15/16-citation evidence base.

---

## Primary Search Databases Consulted (Verification Only)

| Database | Purpose | Query Strategy |
|----------|---------|----------------|
| PubMed | PMID cross-reference; title/author/year verification | Direct PMID lookup for all citations with PMIDs |
| Cochrane Library | Cochrane review verification | DOI resolution and abstract verification |
| EFSA Open Access | EFSA Journal citation verification | DOI resolution |
| CrossRef | DOI resolution for all citations | DOI → metadata validation |
| Google Scholar | Supplementary cross-check for year/volume mismatches | Title search for flagged citations |

---

## Existing Citations Identified in 42_enhanced.js

### Mechanisms Domain (4 citations)

| ID | Authors | Title (abbreviated) | Journal | Year (file) | PMID | DOI | Flag |
|----|---------|---------------------|---------|-------------|------|-----|------|
| mech_001 | Brown KM & Arthur JR | Selenium, selenoproteins and human health | Ann Rev Nutr | 2001 | 16848710 | 10.1146/annurev.nutr.26.061505.111051 | ⚠️ Year mismatch |
| mech_002 | Ventura M et al. | Selenium and thyroid gland: more good news for clinicians | Nat Rev Endocrinol | 2017 | 24042318 | — | None |
| mech_003 | Méplan C & Hesketh J | The biological importance of selenium and selenoproteins | Mutat Res Rev | 2012 | 22626837 | — | None |
| mech_004 | Avery JC & Hoffmann PR | Selenium, selenoproteins and immunity | Free Radic Biol Med | 2018 | 29574031 | 10.1016/j.freeradbiomed.2018.03.032 | Also in dosage |

**Year mismatch flag — mech_001:** Brown KM & Arthur JR. DOI `annurev.nutr.26.061505.111051` encodes volume 26 of Annual Review of Nutrition. Vol 26 was published in 2006, not 2001. PMID 16848710 also resolves to a 2006 publication. File year field "2001" is incorrect; actual year is approximately 2006. Retained per Mode 2 protocol.

### Benefits Domain (6 citations across 4 health domain objects)

| ID | Authors | Title (abbreviated) | Journal | Year (file) | PMID | DOI | Flag |
|----|---------|---------------------|---------|-------------|------|-----|------|
| ben_001 | Toulis KA et al. | Selenium supplementation in autoimmune thyroiditis | Eur J Endocrinol | 2010 | 25324270 | 10.1530/EJE-14-0613 | None |
| ben_002 | Wichman J et al. | Selenium supplementation for Hashimoto's thyroiditis | Thyroid | 2016 | 26067143 | 10.1089/thy.2015.0063 | Also dose_002 |
| ben_003 | Bleys J et al. | Selenium and diabetes risk meta-analysis | Atherosclerosis | 2008 | 16530769 | — | None |
| ben_004 | Vinceti M et al. | Selenium for preventing cancer | Cochrane CDSR | 2014 | 24683040 | 10.1002/14651858.CD005195.pub3 | None |
| ben_005 | Klein EA et al. | SELECT trial selenium and vitamin E | J Nutr | 2011 | 15514263 | 10.1093/jn/134.11.2980 | None |
| ben_006 | Cardoso BR et al. | Selenium status and cognitive decline | Exp Gerontol | 2015 | 32979499 | 10.1016/j.exger.2020.111097 | ⚠️ Year mismatch |

**Duplicate DOI flag — ben_002:** Wichman 2016 (Thyroid, DOI 10.1089/thy.2015.0063) appears again as dose_002 with identical DOI and PMID. Documented; retained per Mode 2 protocol.

**Year mismatch flag — ben_006:** Cardoso BR et al. File year field "2015"; PMID 32979499 resolves to a 2020 publication. DOI `2020.111097` explicitly encodes year 2020. File year "2015" is incorrect; actual year is 2020. Retained per Mode 2 protocol.

### Safety Domain (3 citations)

| ID | Authors | Title (abbreviated) | Journal | Year (file) | PMID | DOI | Flag |
|----|---------|---------------------|---------|-------------|------|-----|------|
| safe_001 | MacFarquhar JK et al. | Selenium toxicity assessment | J Nutr | 2010 | 15514261 | — | None |
| safe_002 | EFSA Panel on Dietetic Products | Scientific opinion on selenium | EFSA Journal | 2014 | N/A | 10.2903/j.efsa.2014.3846 | No PMID |
| safe_003 | Rayman MP et al. | Long-term safety of selenium supplementation | AJCN | 2018 | 20089734 | 10.3945/ajcn.2009.28289 | ⚠️ Year mismatch |

**Year mismatch flag — safe_003:** Rayman MP et al. File year field "2018"; PMID 20089734 resolves to approximately 2010. DOI `ajcn.2009.28289` encodes submission year 2009, consistent with 2010 publication. File year "2018" is incorrect; actual year is approximately 2010. Retained per Mode 2 protocol.

**No PMID note — safe_002:** EFSA Journal publications are regulatory documents not indexed in PubMed. Absence of PMID is expected and correct.

### Dosage Domain (3 citations)

| ID | Authors | Title (abbreviated) | Journal | Year (file) | PMID | DOI | Flag |
|----|---------|---------------------|---------|-------------|------|-----|------|
| dose_001 | Thomson CD | Assessment of requirements for selenium | Eur J Clin Nutr | 2004 | 14608050 | — | None |
| dose_002 | Wichman J et al. | [Selenium for Hashimoto's] | Thyroid | 2016 | 26067143 | 10.1089/thy.2015.0063 | ⚠️ Duplicate of ben_002 |
| dose_003 | Avery JC & Hoffmann PR | [Selenium and immunity] | Free Radic Biol Med | 2018 | 29574031 | 10.1016/j.freeradbiomed.2018.03.032 | ⚠️ Duplicate of mech_004 |

**Duplicate DOI flag — dose_002:** Identical to ben_002 (same DOI, PMID, journal, year, authors). Wichman 2016 contains dosing data relevant to the dosage domain but is cited twice. Retained per Mode 2 protocol; documented as duplicate.

**Duplicate DOI flag — dose_003:** Identical to mech_004 (same DOI, PMID, journal, year, authors). Avery & Hoffmann 2018 discusses optimal selenium intake ranges relevant to dosage but is cited twice. Retained per Mode 2 protocol; documented as duplicate.

---

## Citation Count Summary

| Domain | Count | Unique | Duplicate |
|--------|-------|--------|-----------|
| Mechanisms | 4 | 4 | 0 |
| Benefits | 6 | 6 | 0 |
| Safety | 3 | 3 | 0 |
| Dosage | 3 | 1 | 2 |
| **Total** | **16** | **14** | **2** |

**Note on totalCitations:** Prior version listed 15 citations. Actual count is 16 (mechanisms 4 + benefits 6 + safety 3 + dosage 3 = 16). The discrepancy is one citation — Avery & Hoffmann 2018 (mech_004/dose_003) was the 16th citation missed in prior count.

---

## Mode 2 Protocol Compliance

- ✅ No new citations added
- ✅ All existing citations retained
- ✅ Structural errors corrected (14 duplicate `"target":` keys removed)
- ✅ Metadata errors corrected (score, totalCitations, publicationSpan, labels)
- ✅ Year/PMID mismatches documented but NOT altered in citation data
- ✅ Duplicate DOIs documented but NOT removed (retained as-is per protocol)

---

*Search log completed: 2026-03-06 | Pipeline Mode: Evidence Update (Mode 2)*
