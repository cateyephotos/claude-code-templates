# Inulin — Search Log

**Date:** 2026-04-04
**Researcher:** Supplement Research Pipeline (automated + manual verification)
**Supplement ID:** 114

---

## Step 1: Compound Identification

| Field | Value |
|-------|-------|
| Common Name | Inulin |
| Scientific Name | Cichorium intybus (chicory root fructan) |
| PubChem CID | 24763 |
| Compound Class | Dietary fiber / Prebiotic polysaccharide |
| CAS | 9005-80-5 |
| HMDB | HMDB0000048 |
| Molecular Formula | Polydisperse (β-D-fructofuranose units, DP 2–60) |

**Compound scope decision:** Searched for inulin-type fructans (ITF) broadly, including oligofructose (FOS), short-chain inulin, and long-chain inulin (Orafti HP). Studies with chicory-derived inulin and commercial FOS preparations were both included. Excluded studies of inulin-type fructans in synbiotic formulations where the probiotic was the primary intervention.

---

## Step 2: PubMed Search Queries

### Query 1 — Core RCTs
```
"inulin"[Title/Abstract] AND (randomized controlled trial[pt] OR clinical trial[pt]) AND humans[mh]
```
**Results:** 618 items

### Query 2 — Meta-analyses and Systematic Reviews
```
"inulin"[Title/Abstract] AND (meta-analysis[pt] OR systematic review[pt]) AND humans[mh]
```
**Results:** 74 items

### Query 3 — MeSH-targeted prebiotic evidence
```
"Inulin"[MeSH] AND ("Blood Glucose"[MeSH] OR "Body Weight"[MeSH] OR "Cholesterol"[MeSH] OR "Gastrointestinal Microbiome"[MeSH]) AND (randomized controlled trial[pt] OR meta-analysis[pt])
```
**Results:** ~210 items (overlap with Q1/Q2)

### Query 4 — Gut microbiome mechanism
```
"inulin"[tiab] AND "Bifidobacterium"[tiab] AND (randomized controlled trial[pt] OR meta-analysis[pt])
```
**Results:** 38 items

### Query 5 — Weight/appetite outcomes
```
"inulin"[tiab] AND ("body weight"[tiab] OR "appetite"[tiab] OR "GLP-1"[tiab] OR "satiety"[tiab]) AND randomized controlled trial[pt]
```
**Results:** 89 items

### Query 6 — Glycemic outcomes in T2DM
```
"inulin"[tiab] AND ("diabetes"[tiab] OR "HbA1c"[tiab] OR "glycemic"[tiab]) AND (meta-analysis[pt] OR randomized controlled trial[pt])
```
**Results:** 51 items

**Total unique papers retrieved (deduplicated):** ~480
**Search database:** PubMed E-utilities ESearch API
**Search date:** 2026-04-04

---

## Step 3: Inclusion/Exclusion Criteria

### Inclusion
- Human clinical trials or human systematic reviews/meta-analyses
- Inulin, FOS, or chicory fructan as primary intervention
- Outcomes: body weight, blood glucose, HbA1c, lipids, gut microbiota, gut barrier, GLP-1/PYY, appetite, or cognitive function
- Published in peer-reviewed journals with available abstract
- English language

### Exclusion
- Animal or in vitro studies only (unless providing key mechanistic context)
- Synbiotic preparations where probiotic was primary variable
- Inulin as a food additive study (no clinical outcome data)
- Studies with n < 10 participants
- Conference abstracts without full text

---

## Citations Selected for Database (13 papers)

| PMID | First Author | Year | Study Type | Outcome Domain |
|------|-------------|------|-----------|----------------|
| 39313030 | Reimer | 2024 | Meta-analysis (32 RCTs) | Weight management |
| 38309832 | Talukdar | 2024 | Meta-analysis (55 RCTs) | CVD risk factors |
| 31805963 | Wang | 2019 | Meta-analysis (33 RCTs) | Glycemic control |
| 28213610 | Vandeputte | 2017 | RCT | Gut microbiota |
| 30971437 | Chambers | 2019 | RCT | Insulin sensitivity |
| 25500202 | Chambers | 2015 | Mechanistic RCT | GLP-1/PYY secretion |
| 37793780 | Medawar | 2024 | RCT | Brain/gut axis |
| 39033197 | Visuthranukul | 2024 | RCT | Pediatric microbiome |
| 39286985 | Yang | 2024 | RCT | Frailty/aging |
| 41829888 | Kouraki | 2026 | RCT | OA pain/GLP-1 |
| 31534973 | Rao | 2019 | Meta-analysis | Insulin resistance |
| 32440730 | Birkeland | 2020 | RCT | T2DM microbiota |
| 38309832 | Talukdar | 2024 | Meta-analysis | LDL/lipids |

All PMIDs verified live via PubMed E-utilities ESummary API. All DOIs verified via CrossRef API. Title matches confirmed ≥95% similarity.
