# Search Log: Astaxanthin (ID: 46)
## Pipeline Run: 2026-03-06 | Mode: Mode 2+ (Structural Repair + Standard Evidence Update)

---

## Search Strategy

### Primary Databases Searched
- PubMed/MEDLINE
- Cochrane Library
- Embase (via PubMed overlap)

### Search Terms Used

**Core search strings:**
1. "astaxanthin supplementation" AND ("randomized controlled trial" OR "RCT" OR "clinical trial")
2. "astaxanthin" AND ("systematic review" OR "meta-analysis")
3. "astaxanthin" AND ("oxidative stress" OR "antioxidant" OR "inflammation")
4. "astaxanthin" AND ("cognitive" OR "neuroprotection" OR "brain" OR "mental fatigue")
5. "astaxanthin" AND ("exercise" OR "athletic performance" OR "muscle damage")
6. "astaxanthin" AND ("skin" OR "dermatology" OR "photoprotection")
7. "astaxanthin" AND ("safety" OR "toxicology" OR "adverse effects")
8. "astaxanthin bioavailability" AND ("pharmacokinetics" OR "absorption" OR "formulation")
9. "astaxanthin" AND ("cardiovascular" OR "lipid" OR "LDL")
10. "Haematococcus pluvialis" AND ("astaxanthin" OR "clinical")
11. AREDS[MeSH] AND astaxanthin (Cochrane screen)

### Cochrane Review Search
- Searched: "astaxanthin supplementation", "astaxanthin AND RCT", "astaxanthin carotenoid"
- Result: **No dedicated Cochrane review found for astaxanthin supplementation**
- Cochrane does not have any review examining astaxanthin as a primary intervention as of 2026-03-06
- Implication: Tier 3 classification confirmed; absence of Cochrane review and limited large-N RCT evidence supports Tier 3

---

## Search Results Summary

| Search | Returns | Relevant | Included |
|--------|---------|----------|----------|
| Astaxanthin human RCTs | 34 | 9 | 3 |
| Astaxanthin systematic reviews | 8 | 2 | 1 |
| Astaxanthin mechanisms (human) | 26 | 7 | 4 |
| Astaxanthin safety/toxicology | 11 | 4 | 3 |
| Astaxanthin bioavailability/PK | 14 | 5 | 3 |
| Astaxanthin cardiovascular | 18 | 5 | 1 |

**Total screened:** ~111
**Total included:** 15

---

## Legacy File Analysis (Mode 2+ Triggers)

The prior file `46_enhanced.js` (generated ~2025-08-21) required Mode 2+ processing due to multiple critical errors:

### Trigger 1: Nested Format (Structural)
Prior file used old nested `{ mechanism: "...", evidence: [{ ... }] }` objects inside domain arrays instead of pipeline-standard flat arrays. All domain arrays have been replaced with flat citation objects.

### Trigger 2: Same-Domain PMID Duplication with Different Titles (Fabrication Indicator)
**PMID 12804020** appeared in BOTH `safe_001` AND `safe_002` with different titles:
- `safe_001`: "Safety of an astaxanthin-rich Haematococcus pluvialis algal extract" (title A)
- `safe_002`: "Comprehensive safety review of natural astaxanthin" (title B)
The same PMID cannot correspond to two different papers. Both entries excluded. Replaced with:
- PMID 12935322 (Spiller & Dewell 2003, J Med Food) — verified safety RCT
- PMID 18225615 (Karppi 2007, Nutrition Research) — verified safety-monitored RCT

### Trigger 3: Cross-Domain PMID Duplication
**PMID 32660833** (Brown et al. 2021) appeared in both the benefits domain AND dosage domain. This cross-domain duplication violates pipeline integrity; excluded from both domains.

### Trigger 4: Wrong Compound Citation
**PMID 28371906**: "Lipid-modifying effects of krill oil in humans — a systematic review" — this is a krill oil meta-analysis, not an astaxanthin study. While astaxanthin is present in krill oil, this citation was placed in the astaxanthin benefits domain to support cardiovascular claims — methodologically invalid. Excluded.

### Trigger 5: Non-Human Study in Mechanisms Domain
**PMID 36650315** (Liu 2023, Free Radical Research): An animal/HIIT model study. Excluded from mechanisms domain; pipeline requires human-focused evidence for mechanisms.

### Trigger 6: Score Inflation
`researchQualityScore: 81` — 81 is in the Tier 1 elite range (80+). Astaxanthin has `evidenceTier: 3` in supplements.js (ground truth). Tier 3 appropriate score range is 45–65. Corrected to 55.

### Trigger 7: Tier Label Inflation
Prior file did not explicitly claim Tier 1 but `researchQualityScore: 81` is inconsistent with Tier 3, and evidenceStrength labels used Tier 2 language ("Moderate", "Strong", "Well-established"). Corrected to Tier 3 standard: "Emerging", "Established", "Favorable".

---

## Key Evidence Assessment

**No single landmark trial equivalent to AREDS2 (ID 45) exists for astaxanthin.** The strongest human evidence is:
- **Park et al. 2010** (PMID 20553730, JCBN, RCT, N=42): Antioxidant and immune mechanism endpoints
- **Earnest et al. 2011** (PMID 21800280, Int J Sports Med, RCT, N=21): Exercise performance
- **Fassett & Coombes 2011** (PMID 21673955, Marine Drugs): Cardiovascular systematic review
- **Spiller & Dewell 2003** (PMID 12935322, J Med Food, RCT, N=35): Safety-specific RCT

The largest N in any astaxanthin RCT identified is ~49 (Tominaga 2012 skin study). No astaxanthin RCT with N≥100 was identified in this search. This is the primary evidence gap supporting Tier 3 classification.

---

*Search log completed: 2026-03-06 | Pipeline Mode: Mode 2+ (Structural Repair + Standard Evidence Update)*
