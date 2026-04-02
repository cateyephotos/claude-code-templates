# Search Log: GABA (ID: 40)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Search Strategy

### Primary Search Terms
- "GABA supplementation"
- "gamma-aminobutyric acid oral supplementation"
- "GABA blood-brain barrier"
- "exogenous GABA clinical trial"
- "GABA anxiety stress randomized"
- "GABA sleep quality clinical"
- "GABA safety food ingredient"
- "GABA bioavailability humans"

### Secondary Search Terms (Domain-Specific)
- **Mechanisms**: "GABA receptor pharmacology review", "GABAergic neurotransmission", "GABA-A GABA-B receptor mechanisms"
- **Benefits**: "GABA relaxation EEG alpha waves", "GABA cortisol stress", "GABA sleep promotion", "GABA anxiolytic human"
- **Safety**: "GABA GRAS determination", "gamma-aminobutyric acid safety assessment", "GABA adverse effects dietary supplement"
- **Dosage**: "GABA dose response stress", "GABA dosing protocol anxiety sleep"

### Databases Searched
- PubMed (primary)
- Google Scholar (supplementary)
- CrossRef API (DOI verification)

---

## Search Results Summary

### Total Records Retrieved
- Initial hits: ~380 records across all search terms
- After title/abstract screening: 42 potentially relevant
- After full-text review and inclusion/exclusion criteria: 18 included

### Key Discovery Notes

1. **BBB penetration literature**: The critical scientific question for GABA supplementation is whether exogenous oral GABA crosses the blood-brain barrier. Boonstra et al. 2015 (Frontiers in Psychology, PMID 26483711) provides the most recent comprehensive review of this question; their conclusion is that current evidence is insufficient to confirm direct central effects, though peripheral mechanisms via gut-brain axis and vagus nerve are plausible.

2. **Abdou 2006 (Amino Acids, PMID 16554972)**: Historically cited as the primary BBB-crossing evidence; however, this is a small trial (n=13) and the methodology for inferring CNS effects from EEG data has been questioned in subsequent literature.

3. **Safety literature**: Oketch-Rabah 2021 is the most current and authoritative safety review, superseding earlier GRAS determination literature.

4. **Duplicate Yoto 2012 citations**: Two distinct Yoto et al. 2012 papers exist (one in Pharma Nutrition, doi 10.1016/j.phanu.2012.05.001; one in J Nutr Sci Vitaminol, doi 10.3177/jnsv.58.287). Both are included for different purposes (clinical evidence and dosage, respectively).

5. **Prior version citation errors**: The prior enhanced file contained a PMID collision (both Nuss 2015 and a Yoto 2012 paper assigned PMID 25824938). PMID 25824938 belongs exclusively to Nuss 2015. The Yoto Pharma Nutrition 2012 PMID could not be verified in this pipeline run; the DOI is included for CrossRef resolution.

6. **Owens & Kriegstein 2002**: Prior version keyCitations included this as the only citation (doi 10.1038/nrn919). This is a foundational review of GABA's role in brain development but is not the most relevant for supplementation evidence; superseded by Bowery & Smart 2006 and Abdou 2006 for supplementation purposes.

---

## Citations Retrieved by Domain

| Domain | n | Notes |
|--------|---|-------|
| Mechanisms | 8 | Bowery 2006, Sigel 2012, Abdou 2006 (AJCN), Kanehira 2011, Ben-Ari 2002, Nuss 2015, Gottesmann 2002, Yoto 2012 (Pharma Nutrition) |
| Benefits | 6 | Nakamura 2009, Bhat 2010, Takada 2016, Lydiard 2003, Yamatsu 2016, Abdou 2006 (Amino Acids) |
| Safety | 4 | Oketch-Rabah 2021, Medina-Kauwe 1999, Bauza 2016, Sigel 1999 (excluded after review) |
| Dosage | 3 | Yoto 2012 (JNSV), Boonstra 2015, Kanehira 2011 (overlaps benefits) |
| **Final included** | **18** | After deduplication and exclusion criteria |

---

## Prior Version Audit Notes

The two prior GABA enhanced files were:
- `40_gaba_enhanced.js`: 6 citations, wrong `module.exports` ID (`[25]` instead of `[40]`), non-standard labels, fabricated safety placeholder
- `40_enhanced.js`: 15–19 entries across sections, correct `module.exports`, but `"overallQuality": "Tier 2"` and `researchQualityScore: 88` (both inflated), duplicate tissueTarget/target keys

**Pipeline decision**: `40_enhanced.js` selected as canonical (richer citation base, correct module.exports). All corrections applied in this pipeline run. `40_gaba_enhanced.js` deprecated.

---

*Search log completed: 2026-03-06 | Pipeline Mode: Evidence Update (Mode 2)*
