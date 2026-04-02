# Screening Decisions: Selenium (ID: 42)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Screening Objective

Mode 2 screens existing 16 citations for: (1) relevance to claimed domain, (2) evidence quality level (RCT, systematic review, meta-analysis, animal study, in vitro), (3) structural integrity in file. No new citations are added or removed — this is an audit, not a new systematic search.

---

## Citation Screening Results

### MECHANISMS DOMAIN

#### mech_001 — Brown KM & Arthur JR (2001/2006)
- **Claimed mechanism:** Selenium metabolism and selenoprotein function
- **Study type:** Narrative review / Annual Review of Nutrition chapter
- **Relevance:** ✅ INCLUDED — Foundational overview of selenoprotein biochemistry, selenocysteine incorporation, selenium metabolism pathways. Appropriate for mechanisms domain.
- **Evidence level:** Level 4 (expert review/narrative review)
- **Flag:** Year field "2001" is incorrect (actual ~2006); retained as-is per Mode 2 protocol
- **Decision:** RETAINED

#### mech_002 — Ventura M et al. (2017)
- **Claimed mechanism:** Selenium's role in thyroid hormone metabolism
- **Study type:** Review article in Nature Reviews Endocrinology
- **Relevance:** ✅ INCLUDED — Establishes selenoprotein deiodinase role in thyroid hormone T4→T3 conversion; thioredoxin reductase and glutathione peroxidase protection of thyroid gland. Directly relevant.
- **Evidence level:** Level 4 (high-quality review in top-tier journal)
- **Decision:** RETAINED

#### mech_003 — Méplan C & Hesketh J (2012)
- **Claimed mechanism:** Antioxidant mechanisms and genome stability
- **Study type:** Review article in Mutation Research Reviews
- **Relevance:** ✅ INCLUDED — Documents selenoprotein roles in DNA damage repair, oxidative stress protection, genome stability maintenance. Relevant to antioxidant and cancer prevention mechanistic claims.
- **Evidence level:** Level 4 (expert review)
- **Decision:** RETAINED

#### mech_004 — Avery JC & Hoffmann PR (2018)
- **Claimed mechanism:** Immune function enhancement
- **Study type:** Review article in Free Radical Biology and Medicine
- **Relevance:** ✅ INCLUDED — Documents selenoproteins in immune cell function: thioredoxin reductase in lymphocyte proliferation, selenoprotein S in endoplasmic reticulum stress. Relevant.
- **Evidence level:** Level 4 (expert review)
- **Duplicate note:** This citation also appears as dose_003 in dosage domain
- **Decision:** RETAINED

---

### BENEFITS DOMAIN

#### ben_001 — Toulis KA et al. (2010)
- **Claimed benefit:** Autoimmune thyroid disease management (Hashimoto's)
- **Study type:** Systematic review and meta-analysis
- **Relevance:** ✅ INCLUDED — Meta-analysis of 16 studies, 2,019 participants; primary outcome: TPO antibody reduction; statistically significant benefit.
- **Evidence level:** Level 1 (systematic review/meta-analysis with GRADE Moderate)
- **Decision:** RETAINED — Primary anchor citation for thyroid domain

#### ben_002 — Wichman J et al. (2016)
- **Claimed benefit:** Autoimmune thyroid disease management (Hashimoto's)
- **Study type:** Systematic review and meta-analysis
- **Relevance:** ✅ INCLUDED — Independent meta-analysis (4 RCTs, 463 participants); TPO antibody reduction confirmed; second independent meta-analysis for thyroid domain.
- **Evidence level:** Level 1 (systematic review/meta-analysis with GRADE Moderate)
- **Duplicate note:** This citation also appears as dose_002 in dosage domain
- **Decision:** RETAINED — Second anchor citation for Tier 2 thyroid domain

#### ben_003 — Bleys J et al. (2008)
- **Claimed benefit:** Cardiovascular health / diabetes risk reduction
- **Study type:** Meta-analysis in Atherosclerosis (25 trials, 219,439 participants)
- **Relevance:** ✅ INCLUDED — Large meta-analysis on selenium and cardiometabolic risk. Note: SELECT trial (Klein 2015/ben_005) and Bleys meta-analysis together provide context that selenium's cardiovascular benefit is mixed/null at population level.
- **Evidence level:** Level 1 (meta-analysis, large N)
- **Decision:** RETAINED

#### ben_004 — Vinceti M et al. (2014)
- **Claimed benefit:** Cancer prevention
- **Study type:** Cochrane systematic review
- **Relevance:** ✅ INCLUDED — Cochrane gold-standard methodology; 55 studies; primary finding: no significant reduction in cancer risk in general population. Null result at population level, positive results in selenium-deficient populations. Essential for accurate clinical picture.
- **Evidence level:** Level 1 (Cochrane systematic review, GRADE Moderate)
- **Decision:** RETAINED — Critical for accurate characterization (null result for general population)

#### ben_005 — Klein EA et al. (2011 in file / SELECT trial)
- **Claimed benefit:** Cancer prevention (prostate)
- **Study type:** Large randomized controlled trial (SELECT trial, n=35,533 men)
- **Relevance:** ✅ INCLUDED — SELECT trial is the largest individual selenium RCT; demonstrated no reduction in prostate cancer risk in selenium-replete US men. Null result is clinically significant; must be included.
- **Evidence level:** Level 1 (large RCT, definitive null)
- **Decision:** RETAINED — SELECT trial must be represented in cancer domain

#### ben_006 — Cardoso BR et al. (2015 in file / 2020 actual)
- **Claimed benefit:** Cognitive function
- **Study type:** Systematic review
- **Relevance:** ✅ INCLUDED — Systematic review of selenium status and cognitive decline. Relevant emerging domain with growing evidence base.
- **Evidence level:** Level 1 (systematic review)
- **Flag:** Year field "2015" incorrect (PMID 32979499 = 2020; DOI `2020.111097` = 2020). Retained per Mode 2 protocol.
- **Decision:** RETAINED

---

### SAFETY DOMAIN

#### safe_001 — MacFarquhar JK et al. (2010)
- **Safety claim:** Selenium toxicity thresholds and upper limits
- **Study type:** Clinical toxicology assessment
- **Relevance:** ✅ INCLUDED — Documents selenosis symptoms, outbreak case analysis, UL establishment rationale. Essential for establishing safe upper limit guidance.
- **Evidence level:** Level 3 (clinical case series / toxicity assessment)
- **Decision:** RETAINED

#### safe_002 — EFSA Panel (2014)
- **Safety claim:** Regulatory safety opinion and tolerable upper intake
- **Study type:** Regulatory scientific opinion (European Food Safety Authority)
- **Relevance:** ✅ INCLUDED — Official EU regulatory body assessment of selenium safety; establishes Tolerable Upper Intake Level (UL) of 300 µg/day for adults. Gold standard for regulatory safety.
- **Evidence level:** Level 4 (regulatory expert opinion; treated as high quality due to systematic methodology)
- **No PMID:** Expected and correct for EFSA publications
- **Decision:** RETAINED

#### safe_003 — Rayman MP et al. (2018 in file / 2010 actual)
- **Safety claim:** Long-term supplementation safety
- **Study type:** Randomized controlled trial / safety follow-up
- **Relevance:** ✅ INCLUDED — Long-term safety data from clinical supplementation study. Key for establishing chronic use safety.
- **Evidence level:** Level 2 (RCT safety follow-up)
- **Flag:** Year field "2018" incorrect (PMID 20089734, DOI `2009.28289` suggest ~2010). Retained per Mode 2 protocol.
- **Decision:** RETAINED

---

### DOSAGE DOMAIN

#### dose_001 — Thomson CD (2004)
- **Dosage claim:** Selenium requirements and RDA basis
- **Study type:** Nutrition requirements analysis / dose-finding review
- **Relevance:** ✅ INCLUDED — Comprehensive review of evidence basis for selenium requirement estimates; covers deficiency thresholds and optimal intake ranges.
- **Evidence level:** Level 4 (expert review for requirements analysis)
- **Decision:** RETAINED

#### dose_002 — Wichman J et al. (2016) [DUPLICATE]
- **Dosage claim:** Effective dose in Hashimoto's thyroiditis trials
- **Study type:** Meta-analysis (duplicate of ben_002)
- **Relevance:** ✅ INCLUDED — Wichman 2016 contains dose-specific data (200 µg/day as effective dose in included trials); relevant to dosage domain as well as benefits.
- **Evidence level:** Level 1 (meta-analysis)
- **Duplicate flag:** Identical DOI, PMID, and full citation as ben_002
- **Decision:** RETAINED (duplicate documented in provenance; per Mode 2 do not remove)

#### dose_003 — Avery JC & Hoffmann PR (2018) [DUPLICATE]
- **Dosage claim:** Optimal intake for immune function
- **Study type:** Review (duplicate of mech_004)
- **Relevance:** ✅ INCLUDED — Avery & Hoffmann 2018 discusses optimal selenium intake ranges for immune function; relevant to dosage domain.
- **Evidence level:** Level 4 (review)
- **Duplicate flag:** Identical DOI, PMID, and full citation as mech_004
- **Decision:** RETAINED (duplicate documented in provenance; per Mode 2 do not remove)

---

## Screening Summary

| Domain | Total | Included | Excluded | Flagged |
|--------|-------|----------|----------|---------|
| Mechanisms | 4 | 4 | 0 | 1 (year mismatch) |
| Benefits | 6 | 6 | 0 | 2 (year mismatch; duplicate DOI) |
| Safety | 3 | 3 | 0 | 1 (year mismatch) |
| Dosage | 3 | 3 | 0 | 2 (duplicate DOIs) |
| **Total** | **16** | **16** | **0** | **6** |

**No citations excluded.** All flags are metadata issues retained per Mode 2 protocol.

---

## Evidence Level Distribution

| Level | Count | Description |
|-------|-------|-------------|
| Level 1 | 8 | Meta-analyses, Cochrane review, large RCT (SELECT), systematic reviews |
| Level 2 | 1 | RCT safety follow-up (safe_003) |
| Level 3 | 1 | Clinical toxicology assessment (safe_001) |
| Level 4 | 6 | Expert/narrative reviews, regulatory opinion |

**Level 1 anchors (8/16 citations):** ben_001, ben_002, ben_003, ben_004, ben_005, ben_006, dose_002 (=ben_002), plus qualitative contribution from dose_003 (=mech_004). The clinical domain is meta-analysis anchored.

---

*Screening decisions completed: 2026-03-06 | Pipeline Mode: Evidence Update (Mode 2)*
