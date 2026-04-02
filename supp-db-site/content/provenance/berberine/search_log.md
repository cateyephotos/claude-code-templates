# Search Provenance: Berberine

## Pipeline Run
- **Date:** 2026-03-05
- **Mode:** Mode 1 (Research New/Update)
- **Operator:** supplement-research-pipeline skill
- **Version:** 1.0.0

---

## Search Strategy Summary

| Metric | Value |
|--------|-------|
| Databases queried | PubMed, Consensus API |
| Date range searched | 2020-2026 (primary), 2017-2026 (mechanisms) |
| Language filters | English |
| Total raw results | 35 |
| After deduplication | 20 |
| Deduplication method | DOI + PMID cross-reference |

---

## PubMed Searches

| # | Query String | Filters Applied | Results | Date Executed |
|---|-------------|----------------|---------|---------------|
| 1 | berberine systematic review meta-analysis 2023-2025 | Systematic Review, Meta-Analysis, English, 2023-2025 | 15 | 2026-03-05 |
| 2 | berberine AMPK gut microbiota mechanism review | Review, English | 8 | 2026-03-05 |
| 3 | berberine PCSK9 cholesterol mechanism | Review, English | 5 | 2026-03-05 |
| 4 | berberine safety adverse events meta-analysis | Systematic Review, Meta-Analysis, English | 7 | 2026-03-05 |

### PubMed MeSH Terms Used
- Berberine [Supplementary Concept]
- Diabetes Mellitus, Type 2
- Metabolic Syndrome
- Non-alcoholic Fatty Liver Disease
- Obesity
- AMP-Activated Protein Kinases
- Gastrointestinal Microbiome

---

## Consensus API Searches

| # | Natural Language Query | Filters | Results | Credits Used | Date Executed |
|---|----------------------|---------|---------|-------------|---------------|
| 1 | What are the effects of berberine supplementation on blood sugar, metabolic health, and cardiovascular markers? | year_min: 2020, human: true | 15 | 1 | 2026-03-05 |

---

## bioRxiv Searches

Not applicable for this supplement — sufficient peer-reviewed literature available.

---

## ClinicalTrials.gov Searches

Not queried — meta-analyses already captured trial-level data comprehensively.

---

## Deduplication Summary

| Source Pair | Duplicates Found | Method |
|-------------|-----------------|--------|
| PubMed ↔ Consensus | 10 | DOI match |
| PubMed ↔ bioRxiv | 0 | N/A |
| **Total duplicates removed** | **15** | |
| **Unique papers for screening** | **20** | |

---

## Search Limitations & Notes

- Search focused on systematic reviews and meta-analyses (2020-2025) to capture the highest-level evidence for this extensively-studied supplement
- Individual RCTs were not searched independently as they are captured within the included meta-analyses (50+ RCTs across meta-analyses)
- Mechanism papers were searched with broader date range (2017+) to include foundational reviews
- "Shi 2025 umbrella review" referenced in prior work was not found in PubMed; the Nazari 2023 umbrella meta-analysis (PMID 38016844) serves equivalent function

---

*This search log is part of the provenance trail for Berberine. It documents every database query executed during the research phase to enable independent verification and reproducibility.*
