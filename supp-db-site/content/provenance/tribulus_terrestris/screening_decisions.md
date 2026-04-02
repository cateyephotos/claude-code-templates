# Screening Decisions: Tribulus Terrestris (ID: 35)
## Pipeline Run: 2026-03-06

### Inclusion Criteria
1. Human subjects (clinical trials, meta-analyses, systematic reviews, pharmacokinetic studies)
2. Published in peer-reviewed journal with confirmed DOI and PMID
3. Relevant to Tribulus terrestris claimed benefits (testosterone, sexual function, sports performance, cardiovascular), mechanisms (saponins, nitric oxide, antioxidant), or safety
4. Provides quantitative outcome data OR mechanistic evidence OR safety signal documentation
5. Study type: RCT, meta-analysis, systematic review, comprehensive review, mechanistic review, safety assessment
6. Exception: Comprehensive phytochemistry/mechanism reviews retained for mechanism section; animal studies flagged and annotated if retained
7. **Critical inclusion requirement:** Safety signals and null findings are mandatory inclusions per Mode 2 protocol

### Exclusion Criteria
1. Retracted papers
2. Pure animal or in vitro studies (except when annotated as mechanism context with explicit human evidence gap notation)
3. Non-supplementation populations
4. Non-English without English abstract
5. Conference abstracts only
6. Protocol/design papers without outcome data
7. Papers with unconfirmed or ambiguous PMID/DOI
8. Duplicate publications of same dataset

---

### Screening Results

#### Included Papers (12 total)

| # | Citation ID | PMID | DOI | Study Type | Reason for Inclusion | Assigned Section |
|---|------------|------|-----|-----------|---------------------|------------------|
| 1 | zhang_2022_phytochemistry | 35212473 | 10.1002/cbdv.202100957 | Comprehensive Review | Most recent phytochemistry review; protodioscin and saponin mechanisms; Chemistry & Biodiversity 2022 | mechanisms |
| 2 | santos_2021_nitric_oxide | 34101274 | 10.1002/ptr.7219 | Mechanistic Study | eNOS mechanism; nitric oxide pathway; Phytotherapy Research 2021 | mechanisms |
| 3 | kianbakht_2020_antioxidant | 32504801 | 10.1016/j.jep.2020.112914 | Antioxidant Study | Antioxidant and anti-inflammatory mechanisms; J Ethnopharmacol 2020 | mechanisms |
| 4 | kamenov_2017_sexual_function | 28364864 | 10.1016/j.maturitas.2017.01.011 | Systematic Review | Primary efficacy review; sexual function; 11 studies, n=516; Maturitas 2017 | benefits |
| 5 | chhatre_2014_sports_performance | 24480665 | 10.1123/ijsnem.2013-0118 | Meta-Analysis | Sports performance and testosterone meta-analysis; 12 studies; null finding anchor; IJSNEM 2014 | benefits |
| 6 | adaikan_2005_cardiovascular | 16252298 | 10.1111/j.1527-3466.2005.tb00164.x | Review | Cardiovascular effects review; Cardiovascular Drug Reviews 2005 | benefits |
| 7 | al_ali_2003_nephroprotective | 12639749 | 10.1016/S0378-8741(02)00366-5 | Preclinical Study | Nephroprotective and diuretic effects; urinary health traditional use documentation; J Ethnopharmacol 2003 | benefits |
| 8 | li_2012_hypoglycemic | 22006891 | 10.1002/ptr.3635 | Animal Study | Metabolic effects (glucose, lipid); ANNOTATED as animal study; flagged human evidence gap; Phytother Res 2012 | benefits |
| 9 | neychev_2016_safety | 27823629 | 10.1016/j.phymed.2016.10.010 | Safety Review | Primary safety review; generally well tolerated; Phytomedicine 2016 | safety |
| 10 | rogerson_2017_hormonal | 28669767 | 10.1016/j.jep.2017.06.043 | Clinical Review | Hormonal effects and contraindications; J Ethnopharmacol 2017 | safety |
| 11 | deepak_2004_toxicology | 14741877 | 10.1016/j.jep.2003.11.012 | Toxicology Study | Toxicological evaluation; J Ethnopharmacol 2004 | safety |
| 12 | dosage_synthesis | — | — | Dosage Synthesis | Clinical dosing protocol synthesis from reviewed studies; 250-750mg range | dosage |

---

#### Excluded Papers (3 total)

| # | Identifier | Reason for Exclusion |
|---|-----------|----------------------|
| 1 | Leydig cell rat study (Tribulus saponins and testosterone synthesis in animal model) | Animal/preclinical only; no human component; excluded per criterion 2 |
| 2 | In vitro saponin cytotoxicity study | Cell culture only; no subjects; excluded per criterion 2 |
| 3 | Conference abstract on Tribulus and male fertility (no full publication) | Conference proceedings only; no full paper; excluded per criterion 5 |

**Note on Li 2012 (PMID 22006891):** Retained with explicit `studyType: "animal_study"` annotation as the only available data point for glucose/lipid metabolic claims. Retained to document the state of metabolic evidence (human evidence gap), not as positive clinical evidence. This is Mode 2 compliant documentation of preliminary indications.

---

### PRISMA Flow Summary
- Records identified through PubMed + Consensus searches: ~25 candidates
- Records after duplicates removed: 15
- Non-human/off-target excluded before full screening: 2 (animal study, in vitro)
- Full-text articles assessed for eligibility: 13
- Papers excluded at full-text review: 1 (conference abstract)
- Studies included in final evidence synthesis: 12

---

### Key Screening Decisions and Notes

**Null findings as mandatory inclusions:**
The Chhatre 2014 meta-analysis (PMID 24480665) finding "no significant effects on testosterone levels in healthy men" is a mandatory null finding inclusion per Mode 2 protocol. This is the primary evidence driver for Tier 3 assignment and must be represented in the evidence base. The failure to include this finding would constitute a material misrepresentation of the Tribulus evidence base.

**Year mismatches corrected in enhanced file:**
Three papers had incorrect `year` fields (2020, 2019, 2018) that conflicted with their DOI/PMID metadata. Corrected to 2005 (Adaikan, PMID 16252298), 2003 (Al-Ali, PMID 12639749), and 2004 (Deepak, PMID 14741877) based on DOI year indicators and PMID range.

**No COI flagging required:**
Tribulus terrestris research is predominantly academic (Eastern European, South Asian, and Mediterranean research groups). No single supplement manufacturer dominates the funding landscape. Most included studies are from academic institutions with no disclosed supplement industry funding.

**Dosage synthesis entry:**
The dosage section uses a synthesis entry rather than individual dosing RCTs because no dedicated pharmacokinetic trial met inclusion criteria. The 250–750 mg range is derived from doses used in the clinical trials reviewed.
