# Search Provenance: Calcium Alpha-Ketoglutarate (Ca-AKG)
## Pipeline Run: 2026-04-19 | Mode: 1 (New Supplement Research)

### Search Strategy Summary
- **Databases queried:** PubMed (E-utilities), CrossRef (DOI verification), PubChem (compound identity)
- **Date range searched:** 2014-01-01 to 2026-04-19 (no lower bound; filtered to high-impact human and mechanism papers)
- **Final included papers:** 7

### Compound Identification
| Source | Result |
|---|---|
| PubChem CID | 51 (alpha-ketoglutaric acid) |
| Molecular formula | C5H6O5 |
| Molecular weight | 146.10 g/mol |
| IUPAC name | 2-oxopentanedioic acid |
| SMILES | C(CC(=O)O)C(=O)C(=O)O |
| InChIKey | KPGXRSRHYNQIFN-UHFFFAOYSA-N |

Ca-AKG is the calcium-salt form used in human supplementation (distinct from ornithine α-ketoglutarate / OKG and arginine α-ketoglutarate / AAKG used in clinical nutrition and sports respectively).

### PubMed Searches
| # | Query String | Results | Date |
|---|---|---|---|
| 1 | `(alpha-ketoglutarate OR alpha ketoglutaric acid) AND (human OR clinical) AND (aging OR longevity OR biological age OR frailty)` | 432 | 2026-04-19 |
| 2 | `Demidenko alpha-ketoglutarate biological age` | 1 (PMID 34847066) | 2026-04-19 |
| 3 | `(Rejuvant OR "calcium alpha-ketoglutarate") AND (clinical trial OR randomized)` | 5 | 2026-04-19 |
| 4 | `alpha-ketoglutarate AND (randomized controlled trial[pt] OR clinical trial[pt]) AND human` | 20 (date-sorted) | 2026-04-19 |

### DOI / Identifier Verification
All 7 unique DOIs resolved with HTTP 200 via the CrossRef works API; all 7 unique PMIDs resolved against PubMed ESummary. Run: `node scripts/verify-citations.js --id 115` — exit code 0, 0 CRITICAL issues.

### Deduplication Summary
- Raw hits across queries: ~450
- After manual relevance screening: 7 primary citations retained
- All 7 have both PMID and DOI; none have a missing identifier.
