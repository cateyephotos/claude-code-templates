# Screening Decisions: Vitamin B12 (ID 21)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update

### Inclusion Criteria
1. Human subjects (for clinical/epidemiological evidence; in vitro/mechanistic acceptable for mechanisms section with explicit labeling)
2. Published in peer-reviewed journal with verifiable DOI and PMID
3. Directly relevant to vitamin B12 (cobalamin) supplementation, deficiency, or metabolism
4. Original research article, systematic review, or meta-analysis (not editorials, letters, or case reports)
5. Findings accurately extractable from abstract (full text not required for inclusion)
6. PMID resolves to the claimed paper (verified via PubMed MCP)

### Exclusion Criteria
1. PMID resolves to a completely different paper (wrong PMID — excluded immediately)
2. PMID not found in PubMed database
3. Conference abstracts without full journal publication
4. Non-English without English abstract
5. Retracted papers
6. Animal or in vitro studies in benefit/safety sections (acceptable in mechanisms with explicit labeling)
7. Duplicate datasets (subgroup reports from an already-included trial)
8. Fabricated or overstated findings not found in the actual abstract

---

### Included Papers (12 total)

| # | Citation ID | PMID | DOI | Study Type | Section | Inclusion Reason |
|---|------------|------|-----|-----------|---------|------------------|
| 1 | finkelstein_1990_methionine | 15539209 | 10.1016/0955-2863(90)90070-2 | Review article | mechanisms | Foundational biochemistry of methionine cycle and B12's role as methylcobalamin cofactor; J Nutr Biochem |
| 2 | stabler_2013_clinical | 23301732 | 10.1056/NEJMcp1113996 | Clinical practice review | mechanisms, safety | NEJM comprehensive review; covers neurological manifestations, myelin role, clinical diagnosis; IF ~100+ |
| 3 | alruwaili_2023_neurological | 37046885 | 10.3390/healthcare11070958 | Review article | mechanisms | Documents neurological manifestations and myelin integrity role of B12; Healthcare 2023 |
| 4 | clarke_2007_cognitive | 17991650 | 10.1093/ajcn/86.5.1384 | Prospective cohort study | benefits | Large elderly cohort; significant association between low B12, elevated homocysteine, and cognitive decline; AJCN |
| 5 | smith_2018_dementia | 29480200 | 10.3233/JAD-171042 | Review/meta-analysis | benefits | Smith AD & Refsum H; comprehensive synthesis of homocysteine, B vitamins, and cognitive impairment; JAD 2018 |
| 6 | sohouli_2024_homocysteine | 37495210 | 10.1093/nutrit/nuad091 | Meta-analysis | benefits | 2024 meta-analysis; most recent quantitative synthesis for B vitamin supplementation → homocysteine reduction; Nutrition Reviews |
| 7 | marti_carvajal_2017_cvd | 28816346 | 10.1002/14651858.CD006612.pub5 | Cochrane meta-analysis | benefits | Cochrane review; homocysteine-lowering B vitamins for primary CVD prevention; highest methodological standard |
| 8 | penninx_2000_depression | 10784463 | 10.1176/appi.ajp.157.5.715 | Prospective cohort (n=700) | benefits | Large elderly cohort; B12 deficiency significantly associated with depression onset; American Journal of Psychiatry |
| 9 | volkov_2009_stomatitis | 19124628 | 10.3122/jabfm.2009.01.080113 | RCT | benefits | RCT demonstrating B12 supplementation vs placebo for recurrent aphthous stomatitis; JABFM |
| 10 | allen_2008_deficiency | 19116323 | 10.3945/ajcn.2008.26947A | Review article | safety | Comprehensive review of B12 deficiency etiology; AJCN supplement 2008; WHO Consultation contributor |
| 11 | watanabe_2014_plant | 24803097 | 10.3390/nu6051861 | Review article | safety, dosage | Documents B12 content in plant foods; deficiency risk for vegetarians/vegans; Nutrients 2014 |
| 12 | vidal_alaball_2005_oral | 16034940 | 10.1002/14651858.CD004655.pub2 | Cochrane meta-analysis | dosage | Cochrane review establishing equivalence of high-dose oral vs IM B12; foundational for oral supplementation guidance |

---

### Excluded Papers (from original 21_vitamin_b12_enhanced.js — 10 removed)

| # | Original Citation ID | PMID in File | Actual Paper at PMID | Reason for Exclusion |
|---|---------------------|-------------|---------------------|---------------------|
| 1 | smith_refsum_2016 | 27431365 | Skeletal muscle fiber-type proteome paper | PMID resolves to completely unrelated paper; replacement: smith_2018_dementia (PMID 29480200) |
| 2 | dali_youcef_2009 | 19344370 | Delta-opioid receptor gene deletion | PMID resolves to completely unrelated paper; no suitable replacement found |
| 3 | hankey_eikelboom | 33809682 | Fungal phylogenomics | PMID resolves to completely unrelated paper; Cochrane review (Martí-Carvajal 2017) used as replacement for CVD claim |
| 4 | clarke_2007_original | 17959875 | Schizophrenia/cognition paper | Wrong PMID; correct Clarke 2007 AJCN paper is PMID 17991650; replaced with corrected PMID |
| 5 | thakkar_2015 | 28663834 | Dermoscopy/OCT paper | PMID resolves to completely unrelated paper; no suitable replacement found |
| 6 | healton_1991 | 1669841 | NEJM editorial on gun control | PMID resolves to completely unrelated paper; no suitable replacement found |
| 7 | (unlabeled) | 29262078 | NOT FOUND IN PUBMED | PMID does not exist; excluded without replacement |
| 8 | green_2017 | 28615249 | Kidney/SIRT1 aging | PMID resolves to completely unrelated paper; no suitable replacement found |
| 9 | lederle_1991 | 1995981 | JAMA editorial on healthcare variation | PMID resolves to completely unrelated paper; Vidal-Alaball 2005 Cochrane (PMID 16034940) retained from originals for dosage |
| 10 | stabler_2018 | 29635493 | Avocado/cardiovascular meta-analysis | PMID resolves to completely unrelated paper; Stabler 2013 NEJM (PMID 23301732) retained as authoritative B12 clinical review |

---

### PRISMA Flow Summary
- Citations in original enhanced file: 16
- PMIDs verified via PubMed MCP: 16
- PMIDs resolving to correct papers: 6
- PMIDs resolving to wrong papers: 9
- PMIDs not found in PubMed: 1
- New citations found to replace excluded papers: 6
- Papers with minor metadata corrections (DOI suffix, year): 3
- Final included citations: 12
- Net citations removed: 4

### Schema Corrections Applied (non-exclusion)
- `const vitaminB12Enhanced = { ... }` named const added (original used direct assignment without named const)
- Evidence items moved into proper `evidence[]` arrays inside each group (were placed at group level in original)
- `significance` field replaced with `findings` (schema-required field name)
- `methodology` field added to every evidence item (was missing throughout)
- `keyFindings[]` array renamed to `findings` string per schema
- Non-schema sections removed: `deficiency`, `researchSummary`, `nutritionalContext`
- `overallQuality` corrected from `"Tier 2"` to `"Tier 1"` (matches `evidenceTier: 1` in supplements.js)
- Export block updated to `window.enhancedCitations[21] = vitaminB12Enhanced` plus CommonJS module export
