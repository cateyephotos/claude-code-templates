# Search Provenance: B-Complex Vitamins (ID 19)
## Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update (update-existing)

### Search Strategy Summary
- **Databases queried:** PubMed (via MCP), Consensus (via MCP), bioRxiv (via MCP)
- **Date range searched:** 2013–2026 (existing entry had lastUpdated: 2025-08-19; searched broadly to verify and correct all citations)
- **Total unique results examined:** 28
- **After deduplication and screening:** 10 included

### Purpose
This Mode 2 run was triggered because the existing enhanced citations file (`19_enhanced.js`) was found to contain:
1. Two citations with entirely wrong PMIDs resolving to unrelated papers
2. Two citations with fabricated (hallucinated) findings not supported by actual abstracts
3. One citation with overstated statistical significance
4. Duplicate JavaScript object keys throughout
5. A structural syntax bug in supplements.js (duplicate `isEnhanced` keys)

All searches were performed using PubMed MCP tools to verify or find correct citations.

---

### PubMed Searches

| # | Query String | Filters | Results | Date Executed | Purpose |
|---|-------------|---------|---------|---------------|---------|
| 1 | Long SJ Benton D vitamin mineral supplementation stress Psychosomatic Medicine 2013 | Author + Journal | 5 | 2026-03-06 | Correct PMID for long_2013 citation |
| 2 | PMID 23362497 metadata | Direct ID lookup | 1 | 2026-03-06 | Verify Long & Benton 2013 abstract |
| 3 | Reynolds vitamin B12 folic acid nervous system Lancet Neurology 2006 | Author + Journal | 3 | 2026-03-06 | Correct PMID for reynolds_2006 citation |
| 4 | PMID 17052662 metadata | Direct ID lookup | 1 | 2026-03-06 | Verify Reynolds 2006 abstract |
| 5 | Clarke homocysteine lowering B vitamins stroke cardiovascular Lancet 2010 | Author + Journal | 8 | 2026-03-06 | Verify clarke_2010 findings |
| 6 | PMID 20937919 metadata | Direct ID lookup | 1 | 2026-03-06 | Confirm Clarke 2010 actual RR for stroke |
| 7 | Young multinutrient supplement psychological well-being stress 2019 | Author + Year | 4 | 2026-03-06 | Verify young_2019 findings |
| 8 | PMID 31527485 metadata | Direct ID lookup | 1 | 2026-03-06 | Confirm Young 2019 SMD values |
| 9 | Markun vitamin B12 supplementation cognitive function systematic review 2021 | Author + Year | 4 | 2026-03-06 | Verify markun_2021 findings |
| 10 | PMID 33809274 metadata | Direct ID lookup | 1 | 2026-03-06 | Confirm Markun 2021 actual outcomes |

### Key Citation Verification Outcomes

| Original citationId | Original PMID | Resolved to | Correct PMID | Action |
|--------------------|--------------|-------------|-------------|--------|
| long_2013_energy | 23362501 | Shankar 2013 "Social isolation and loneliness" (social psychology) | 23362497 | PMID corrected, DOI corrected, citationId renamed to long_2013_stress |
| reynolds_2006_vitamin_b6 | 16402117 | Barnes 2006 "Drugs for asthma" (pulmonology) | 17052662 | PMID corrected, journal corrected, citationId renamed to reynolds_2006_neurology |
| clarke_2010_homocysteine | 20937919 | Clarke 2010 "Homocysteine-lowering trials" (correct paper) | 20937919 | PMID correct; findings were fabricated — corrected to actual null results |
| markun_2021_b12_systematic | 33809274 | Markun 2021 "Supplementation with vitamin B12" (correct paper) | 33809274 | PMID correct; findings fabricated and study count/participants wrong — corrected |
| young_2019_psychological | 31527485 | Young 2019 "Effects of a multinutrient supplement" (correct paper) | 31527485 | PMID correct; anxiety and depression significance fabricated — corrected to actual results |

### Deduplication Summary
- Total citations in original file: 16
- Citations removed (duplicate or low-quality): 6
- Total unique verified citations in updated file: 10
- All 10 citations have verified PMIDs and DOIs confirmed via PubMed MCP
