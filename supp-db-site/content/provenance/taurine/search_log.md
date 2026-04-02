# Search Log: Taurine (ID: 39)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Search Strategy Overview

**Primary Objective:** Identify, evaluate, and verify peer-reviewed evidence for taurine supplementation across mechanisms, clinical benefits, safety, and dosing.

**Search Databases:** PubMed / MEDLINE, CrossRef API, Google Scholar (verification)

**Date Range Searched:** 1980 – 2026-03-06

**Search Terms Used:**
- `taurine supplementation exercise performance humans`
- `taurine meta-analysis endurance`
- `taurine cardiovascular health blood pressure clinical trial`
- `taurine safety GRAS amino acid`
- `taurine GABA receptor neuroprotection`
- `taurine osmolyte membrane stability physiology`
- `taurine aging longevity`
- `taurine neurological disorders review`
- `taurine dosing pharmacokinetics humans`
- `taurine cardiac function heart failure`

---

## Search Results by Domain

### Mechanisms Domain

| Query | Database | Hits Retrieved | Screened | Included |
|-------|----------|---------------|---------|---------|
| taurine calcium regulation muscle contraction | PubMed | 68 | 12 | 2 |
| taurine osmolyte membrane stability physiological review | PubMed | 44 | 8 | 1 |
| taurine GABA receptor CNS neuromodulation | PubMed | 92 | 15 | 1 |

**Total mechanism citations included:** 4
- Schaffer 2010 (PMID 20804594) — calcium regulation, Journal of Biomedical Science
- Ripps 2012 (PMID 23170060) — osmolyte function, Molecular Vision
- Huxtable 1992 (PMID 1731369) — foundational physiology review, Physiological Reviews
- Wu 2010 (PMID 20804583) — CNS role, Journal of Biomedical Science

### Benefits Domain

| Query | Database | Hits Retrieved | Screened | Included |
|-------|----------|---------------|---------|---------|
| taurine exercise performance meta-analysis | PubMed | 31 | 8 | 2 |
| taurine cardiovascular blood pressure clinical | PubMed | 87 | 18 | 2 |
| taurine neurological cognitive review | PubMed | 54 | 11 | 1 |

**Total benefit citations included:** 5
- Waldron 2018 (PMID 29546641) — endurance meta-analysis, Sports Medicine
- Carvalho 2021 (PMID 34421639) — dose-response systematic review, Frontiers in Physiology
- Militante 2002 (PMID 12436202) — cardiovascular review, Amino Acids
- Zhang 2004 (PMID 15464106) — aging/cardiovascular, European Journal of Pharmacology
- Kim 2023 (PMID 37536133) — neurological review, Biomedicine & Pharmacotherapy

### Safety Domain

| Query | Database | Hits Retrieved | Screened | Included |
|-------|----------|---------------|---------|---------|
| taurine safety risk assessment GRAS | PubMed | 22 | 7 | 1 |

**Total safety citations included:** 1
- Shao & Hathcock 2008 (PMID 17766049) — risk assessment, Regulatory Toxicology and Pharmacology

### Dosage Domain

| Query | Database | Hits Retrieved | Screened | Included |
|-------|----------|---------------|---------|---------|
| taurine dosing clinical trial heart failure exercise | PubMed | 39 | 9 | 1 |

**Total dosage citations included:** 1
- Beyranvand 2011 (PMID 21334819) — clinical dosing, Journal of Cardiology

---

## Prior Version Citation Audit

**Prior version file:** `39_taurine_enhanced.js` (pre-2026-03-06 pipeline run)
**Prior researchQualityScore:** 83 (inflated — see tier_assignment.md)
**Issues identified in prior version:**
- Non-standard `evidenceStrength` labels: "Strong", "Excellent", "Moderate-Strong"
- `researchQualityScore: 83` inconsistent with Tier 3 weighted calculation
- `lastEvidenceUpdate: 2025-08-20` — stale date
- `shao_2008_safety` citation had completely wrong DOI (`10.4062/biomolther.2017.251`) and PMID (`29631391`) pointing to a 2018 Korean paper rather than the Shao & Hathcock 2008 paper (PMID 17766049)
- Duplicate JavaScript object keys (`tissueTarget`, `target`) in neurological benefit and dosage entries
- `publicationSpan: "2010-2024"` incorrect — Huxtable 1992 (PMID 1731369) is the earliest citation

**All issues corrected in this pipeline run.**

---

## Citation ID Naming Note

Two citation IDs contain year labels that do not match the actual publication year:
- `militante_2013_cardiovascular` — actual year is **2002** (PMID 12436202 confirmed); ID label is incorrect
- `zhang_2016_aging` — actual year is **2004** (PMID 15464106 confirmed); ID label is incorrect

The DOI and PMID data for both entries are correct. These are naming inconsistencies only; no data correction was required for the actual citation metadata.

---

## Total Citations in Final Dataset: 11
