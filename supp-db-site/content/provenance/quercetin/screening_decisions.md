# Screening Decisions: Quercetin (ID 20)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update

### Inclusion Criteria
1. Human subjects (for clinical/epidemiological evidence; in vitro acceptable for mechanistic sections with labeling)
2. Published in peer-reviewed journal with verifiable DOI and PMID
3. Directly relevant to quercetin or quercetin-containing flavonoid interventions
4. Original research article, systematic review, or meta-analysis (not editorials, letters, or case reports)
5. Findings accurately extractable from abstract (full text not required for inclusion)
6. PMID resolves to the claimed paper (verified via PubMed MCP)

### Exclusion Criteria
1. PMID resolves to a completely different paper (wrong PMID — excluded immediately)
2. DOI unresolvable in PubMed or CrossRef with no alternative identification path
3. Conference abstracts without full journal publication
4. Non-English without English abstract
5. Retracted papers
6. Animal or in vitro studies in benefit/safety sections (acceptable in mechanisms with explicit labeling)
7. Duplicate datasets (e.g., subgroup reports from an already-included trial)
8. Fabricated or overstated findings not found in the actual abstract

---

### Included Papers (10 total)

| # | Citation ID | PMID | DOI | Study Type | Section | Inclusion Reason |
|---|------------|------|-----|-----------|---------|--------------------|
| 1 | frent_2024_systematic | 39596162 | 10.3390/ijms252212091 | Systematic review | mechanisms | Comprehensive review of quercetin pharmacology; multiple mechanisms documented; IJMS IF ~4.9 |
| 2 | aghababaei_2023_mechanisms | 37513932 | 10.3390/pharmaceutics15082226 | Review article | mechanisms | Covers antioxidant, anti-inflammatory, cardiovascular, anticancer, antidiabetic mechanisms with preclinical support |
| 3 | salehi_2020_therapeutic | 32478277 | 10.1021/acsomega.0c01818 | Review article | mechanisms | Wide-scope therapeutic potential review; covers molecular targets; ACS Omega peer-reviewed |
| 4 | zhang_2023_cardiovascular | 38054093 | 10.1007/s10557-023-07524-w | Review article | mechanisms | Cardiovascular-specific mechanistic review; covers foam cell, plaque, endothelial mechanisms |
| 5 | rojano_ortega_2023_exercise | 37398956 | 10.1007/s00394-023-03197-3 | Meta-analysis (13 RCTs) | benefits | Only meta-analysis specifically on quercetin and exercise recovery; large pooled effect sizes |
| 6 | tabrizi_2019_inflammation | 31017459 | 10.1093/advances/nmy071 | Meta-analysis (16 RCTs) | benefits | Only large meta-analysis of quercetin and inflammatory markers in MetS patients; verified PMIDs and findings |
| 7 | ou_2019_crp | 31213101 | 10.1080/09637486.2019.1634028 | Meta-analysis | benefits | Included for accurate null-overall result representation; prevents overstatement of anti-inflammatory effect |
| 8 | serban_2016_blood_pressure | 27405810 | 10.1097/HJH.0000000000001041 | Meta-analysis (7 RCTs) | benefits | Largest meta-analysis on quercetin and blood pressure; Journal of Hypertension, IF ~4.0 |
| 9 | hickson_2019_senolytic | 31542391 | 10.1016/j.ebiom.2019.08.069 | Phase 1 RCT (pilot) | benefits | First human clinical trial of senolytic effect; EBioMedicine; foundational for senolytic claim |
| 10 | andres_2018_safety | 29127724 | 10.1002/mnfr.201700447 | Systematic review | safety | Comprehensive safety review; established UL guidance; drug interaction documentation |

---

### Excluded Papers (from original 20_enhanced.js — 2 removed)

| # | Original Citation ID | PMID in File | Reason for Exclusion |
|---|---------------------|-------------|---------------------|
| 1 | ben_002 (Mohammadi-Sartang, attributed to BJN) | Listed as resolving via DOI 10.1017/S0007114519003380 | DOI unresolvable in PubMed/CrossRef; the listed PMID 31213101 actually resolves to Ou 2019 (IJFSN) — a completely different paper with opposite findings. The Mohammadi-Sartang paper cannot be independently verified. Replacement: Tabrizi 2019 (PMID 31017459) added |
| 2 | mech_004 original (attributed to Derosa 2021) | 33553890 | PMID 33553890 resolves to Samacoits A et al. 2021 "Machine Learning-Driven...SARS-CoV-2 CRISPR" — entirely unrelated COVID research paper. Correct PMID for claimed Salehi ACS Omega paper resolved via DOI to 32478277 |

---

### PRISMA Flow Summary
- Citations in original enhanced file: 12
- PMIDs verified via PubMed MCP: 12
- PMIDs resolving to correct papers: 10
- PMIDs resolving to wrong papers: 2 (33553890, DOI for Mohammadi-Sartang)
- Papers with corrected metadata (same paper, wrong title/year/authors): 2 (frent_2024, mech_004→salehi_2020)
- Papers with corrected or replaced findings: 3 (ben_002 replaced, ou_2019 findings corrected, mech_001 year/title corrected)
- New citations added to replace excluded: 1 (tabrizi_2019)
- Final included citations: 10
- Citations removed: 2

### Schema Corrections Applied (non-exclusion)
- `id` field renamed to `citationId` throughout (original used non-schema field name)
- `keyFindings[]` array renamed to `findings` string throughout
- `methodology` field added to every evidence item (was missing in original)
- Safety section rebuilt from plain citation string to CitationEvidence object with `adverseEvents[]`
- Dosage section rebuilt from custom top-level fields to standard citation group
- `evidenceProfile.overallQuality` corrected from "Tier 3" to "Tier 2" (consistent with supplements.js `evidenceTier: 2`)
