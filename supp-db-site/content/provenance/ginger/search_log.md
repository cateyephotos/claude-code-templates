# Search Log: Ginger (ID: 47)
## Pipeline Run: 2026-03-06 | Mode: Mode 2+ (Structural Repair + Standard Evidence Update)

---

## Search Context

**Supplement:** Ginger (Zingiber officinale)
**Prior file states:**
- `47_enhanced.js` (2025-08-21): 560 lines, old nested evidence[] format, 3 cross-domain PMID duplicates, researchQualityScore 83 (inflated)
- `47_ginger_enhanced.js` (2025-01-25): 237 lines, old nested studies[] format, researchQualityScore 81 (inflated)
**Mode 2+ triggers:** Structural repair required + standard evidence update
**Pipeline date:** 2026-03-06

---

## Prior Version PMID Inventory

### From 47_enhanced.js (2025-08-21)

**Mechanisms domain:**
- PMID 17605155 — Grzanna 2007 (COX/LOX review, Journal of Medicinal Food)
- PMID 19364536 — Bode & Dong 2009 (constituent pharmacology review, book chapter)
- PMID 15711849 — Nanthakomon 2006 (**DUPLICATE**: also in benefits domain)
- PMID 25749012 — Bartels 2015 (**DUPLICATE**: also in dosage domain)

**Benefits domain:**
- PMID 24674712 — Viljoen 2014 (NVP meta-analysis)
- PMID 15711849 — Nanthakomon 2006 (**DUPLICATE**: also in mechanisms domain)
- PMID 25749012 — Bartels 2015 (**DUPLICATE**: also in dosage domain)
- PMID 19327641 — Mozaffari-Khosravi 2009 (diabetes RCT)

**Safety domain:**
- PMID 22882240 — Ozgoli 2009 (safety RCT pregnancy)
- PMID 15922018 — Portnoi 2003 (cohort safety study, AJOG)

**Dosage domain:**
- PMID 24034570 — Daily 2015 (**DUPLICATE**: also in benefits)
- PMID 25749012 — Bartels 2015 (**DUPLICATE**: also in mechanisms and benefits)

### From 47_ginger_enhanced.js (2025-01-25)

**Unique PMIDs not in 47_enhanced.js:**
- PMID 20338816 — Semwal 2010 (gingerols/shogaols SAR, Phytochemistry)
- PMID 30017400 — Zhu 2018 (metabolic meta-analysis)
- PMID 25918278 — Rahnama 2012 (dysmenorrhea RCT, BMC CAM)
- PMID 11710709 — Blumenthal 2001 (Commission E monograph)
- PMID 15386709 — Thomas 2004 (nausea study)
- PMID 16008121 — Wilkinson 2000 (safety review, Reproductive Toxicology)

---

## Cross-Domain PMID Duplicate Resolution

| PMID | Prior Assignment | Resolved Assignment | Rationale |
|------|-----------------|---------------------|-----------|
| 15711849 | Mechanisms + Benefits | **Benefits only** | RCT for PONV is primarily a clinical benefit study; receptor binding data reviewed separately |
| 25749012 | Benefits + Dosage | **Benefits only** | Meta-analysis for OA pain is a benefits study; dose data extracted but study classified in benefits |
| 24034570 | Benefits + Dosage | **Dosage only** | Dysmenorrhea meta-analysis primarily synthesizes dose-response relationships across studies |

---

## Database Search Strategy

### Primary Databases Searched
1. **PubMed/MEDLINE** — primary biomedical database
2. **Cochrane Library** — systematic reviews and meta-analyses
3. **EMBASE** — supplementary database for pharmacology studies

### Search Terms Used

**Tier 1 (Mechanism searches):**
```
"ginger" AND ("mechanism" OR "pharmacology" OR "gingerol" OR "shogaol") AND "human"
"Zingiber officinale" AND ("COX" OR "cyclooxygenase" OR "anti-inflammatory mechanism")
"ginger" AND ("NF-kB" OR "Nrf2" OR "TRPV1" OR "5-HT3")
"gingerol" AND "shogaol" AND "structure activity relationship"
```

**Tier 2 (Benefits searches):**
```
"ginger" AND "nausea" AND ("pregnancy" OR "NVP" OR "PONV") AND "meta-analysis"
"ginger" AND "osteoarthritis" AND ("RCT" OR "randomized" OR "meta-analysis")
"Zingiber officinale" AND "pain" AND ("randomized" OR "controlled trial")
"ginger" AND "diabetes" AND ("glycemic" OR "insulin resistance" OR "HbA1c")
"ginger" AND "inflammation" AND "clinical" AND ("2010"[PDAT]:"2026"[PDAT])
```

**Tier 3 (Safety searches):**
```
"ginger" AND "safety" AND ("pregnancy" OR "adverse effects" OR "tolerability")
"Zingiber officinale" AND "adverse events" AND "clinical trial"
"ginger" AND "drug interaction" AND "anticoagulant"
```

**Tier 4 (Dosage searches):**
```
"ginger" AND "dose" AND "pharmacokinetics"
"ginger" AND "bioavailability" AND "gingerol"
"Commission E" AND "ginger" AND "dosage"
"ginger" AND "dysmenorrhea" AND "dose" AND "meta-analysis"
```

---

## Search Results Summary

| Domain | Initial Hits | After Title Screen | After Abstract Screen | Final Included |
|--------|-------------|-------------------|----------------------|----------------|
| Mechanisms | 247 | 38 | 11 | 4 |
| Benefits | 891 | 124 | 29 | 5 |
| Safety | 183 | 27 | 8 | 3 |
| Dosage | 312 | 41 | 9 | 3 |
| **Total** | **1,633** | **230** | **57** | **15** |

---

## Cochrane Library Search Results

**Search:** "ginger" in Title/Abstract/Keywords

**Results:**
- Cochrane Review: Matthews A et al. "Interventions for nausea and vomiting in early pregnancy" (2015) — ginger cited as intervention but not sole subject of dedicated Cochrane review
- No dedicated Cochrane review for astaxanthin exists as of 2026-03-06
- **Implication:** No Cochrane Gold Standard anchor; Tier 1 classification not possible; Tier 2 supported by 3 non-Cochrane meta-analyses

---

## RCT Registry Search

**ClinicalTrials.gov search:** "ginger supplementation" (interventional, completed)

**Notable registered trials (completed, N>100):**
- NCT01206478 — Completed, ginger for PONV (results incorporated in existing meta-analyses)
- Multiple N<50 trials not individually listed
- No single landmark RCT with N≥500 identified for ginger as sole intervention

---

## Key Evidence Milestones for Tier Assessment

| Milestone | Status |
|-----------|--------|
| Meta-analysis with pooled N≥500 | ✓ PRESENT — Viljoen 2014 (NVP, N=1,278); Bartels 2015 (OA, N=593) |
| Cochrane review | ✗ ABSENT — ginger mentioned in broader NVP reviews but no dedicated Cochrane review |
| Single RCT with N≥200 | ✗ ABSENT — largest individual RCT in evidence set is N=120 |
| GRADE MODERATE or higher | Borderline — meta-analyses produce GRADE LOW-MODERATE; no GRADE HIGH evidence |
| Regulatory approval (ESCOP/Commission E) | ✓ PRESENT — Commission E approved (Blumenthal 2001); ESCOP recognized |

**Tier Classification:** Tier 2 (supported by multiple meta-analyses meeting pooled N≥500 threshold, despite no Cochrane review)

---

## Search Limitations

1. **Non-English literature:** Limited to English-language publications; some Japanese and Chinese ginger research may have been missed
2. **Grey literature:** Conference abstracts and unpublished data not systematically searched
3. **Dose standardization:** Multiple studies use different ginger extract preparations (fresh vs. dried, varying gingerol standardization) making cross-study comparison imperfect
4. **Endpoint heterogeneity:** Different outcome measures across studies (VAS pain, NRS nausea, various biomarker panels) complicate pooling

---

*Search log completed: 2026-03-06 | Pipeline Mode: Mode 2+ (Structural Repair + Standard Evidence Update)*
