# Tier Assignment: Vitamin B6 (ID 22)
## Pipeline Run: 2026-03-06
## Previous Tier: 2 (confirmed and retained) → Assigned Tier: 2

### Decision Tree Walkthrough

1. **Does the supplement have human clinical data?** → YES
   - Multiple RCTs pooled in meta-analyses, Cochrane reviews, prospective case series with human subjects
2. **How many RCTs?** → Several (pooled in systematic reviews)
   - Wyatt 1999 BMJ meta-analysis pooled 9 RCTs for PMS indication
   - Matthews 2015 Cochrane review includes multiple RCTs for NVP indication
   - Malouf 2003 Cochrane identifies only 2 RCTs for cognitive indication (inconclusive)
3. **Any RCT with n>100?** → YES
   - Wyatt 1999 meta-analysis pooled hundreds of participants across 9 RCTs
   - Matthews 2015 Cochrane review pooled multiple pregnancy trials
4. **Systematic review or meta-analysis exists?** → YES
   - Wyatt 1999 BMJ — meta-analysis of 9 PMS RCTs
   - Matthews 2015 Cochrane — systematic review of NVP interventions
   - Malouf 2003 Cochrane — systematic review of cognitive effects
5. **Are findings consistent across reviews?** → PARTIALLY
   - PMS benefit: consistent across Wyatt 1999 (9 RCTs)
   - NVP benefit: consistent across Matthews 2015 (Cochrane)
   - Cognitive benefit: INCONCLUSIVE (Malouf 2003 Cochrane — insufficient evidence)
   - CVD/homocysteine: B6 contribution unclear (combined B-vitamin studies; Clarke 2007)

**Decision: Tier 2** — Two Cochrane reviews and one BMJ meta-analysis are present, qualifying for Tier 2. Tier 1 is not assigned because:
- Cognitive outcome evidence is explicitly inconclusive (Malouf 2003 Cochrane)
- CVD endpoint evidence is mixed and B6-specific contribution unclear
- No single large placebo-controlled RCT (n>500) specifically for B6 with a primary cognitive or cardiovascular endpoint
- The evidence base, while including Cochrane reviews, is less comprehensive than Tier 1 supplements (e.g., Vitamin B12 with 2 Cochrane reviews and consistent positive findings across all domains)

Tier 2 classification is consistent with `evidenceTier: 2` in supplements.js. The two Cochrane reviews confirm a minimum Tier 2 classification; the inconsistency across indications (strong for PMS and NVP; inconclusive for cognition) prevents Tier 1 assignment.

---

### Research Quality Score Breakdown (0–100)

| Component | Max Points | Awarded | Justification |
|-----------|-----------|---------|---------------|
| Number and quality of RCTs | 30 | 20 | 2 Cochrane reviews pool multiple RCTs; Wyatt 1999 BMJ meta-analysis pools 9 RCTs; individual RCT quality variable (older trials from 1970s–90s for PMS). Deduction: no large recent (post-2000) individual RCT specifically for B6 primary endpoint |
| Presence of meta-analyses | 20 | 16 | 2 Cochrane reviews (Matthews 2015, Malouf 2003) + 1 BMJ meta-analysis (Wyatt 1999). Deduction: Malouf 2003 Cochrane found only 2 RCTs for cognitive outcomes (inconclusive) |
| Sample sizes | 15 | 11 | Cochrane/meta-analysis pooled analyses represent hundreds of participants; Schaumburg 1983 case series (n=7 but landmark). Deduction: small sample sizes in individual RCTs; no mega-trial (n>1000) |
| Replication across groups | 15 | 11 | PMS benefit replicated across 9 RCTs in Wyatt meta-analysis; NVP benefit replicated in Cochrane; safety (neuropathy) replicated in subsequent reports. Deduction: cognitive benefit NOT replicated; cardiovascular B6-specific contribution unclear |
| Consistency of findings | 10 | 7 | Strong consistency for PMS and NVP; explicit inconsistency for cognitive outcomes (Cochrane inconclusive); partial inconsistency for cardiovascular (B6 contribution unclear in combined B-vitamin trials) |
| Recency of evidence | 10 | 10 | Most recent review: Matthews 2015; Wilson 2019 (mechanistic review); Cochrane cognitive review from 2003 needs updating but no more recent synthesis exists. Score maintained at full given 2019 mechanistic review and 2015 Cochrane |
| **TOTAL** | **100** | **75** | |

**Previous entry score: 88** — corrected downward to 75 because:
- The prior 88/100 was based on 10 wrong PMIDs; the actual evidence base, while including Cochrane reviews, does not achieve 88/100
- Cognitive outcome Cochrane explicitly inconclusive (reduces claim strength)
- No large independent RCT for B6 specifically in any domain post-2000
- CVD evidence is combined B-vitamin evidence (B6 contribution not independently established)
- 75/100 appropriately reflects: 2 Cochrane reviews + 1 BMJ meta-analysis + strong mechanistic evidence, balanced against inconsistent clinical evidence across indications

---

### Evidence Strength Assignments

| Domain | Rating | Justification |
|--------|--------|---------------|
| Mechanisms | Strong | PLP as enzyme cofactor is textbook biochemistry established for decades (Mooney 2009); Nature Medicine landmark paper (Mills 2006) confirms genetic basis of B6 dependency; antiquitin/PNPO pathways molecularly confirmed; neurotransmitter biosynthesis via AADC is direct enzymatic evidence |
| Clinical Benefits | Moderate | Cochrane-level evidence for NVP (Matthews 2015) and BMJ meta-analysis for PMS (Wyatt 1999); Cochrane for cognitive explicitly inconclusive (Malouf 2003); cardiovascular benefit mediated via homocysteine but B6-specific contribution unclear in multi-B-vitamin trials |
| Safety | Well-established | Schaumburg 1983 NEJM established peripheral neuropathy at >2g/day; tolerable upper intake level set at 100 mg/day by US Food and Nutrition Board; extensive clinical history; no known toxicity at RDA doses |
| Dosage | Evidence-based | RDA 1.3–2.0 mg/day for maintenance well-established; therapeutic 50–100 mg/day for PMS supported by Wyatt 1999; 10–25 mg/8h for NVP supported by Matthews 2015; UL 100 mg/day for chronic use from Schaumburg 1983; oral bioavailability of both pyridoxine and P5P well-characterized |

---

### Research Maturity: Mature
**Justification:** Vitamin B6 biochemistry has been established since the 1930s (discovered 1934; structure determined 1938; Nobel Prize relevance via B-vitamin family). Human clinical research has been ongoing for 70+ years. The fundamental enzymatic biochemistry is not in dispute. For the primary clinical indications (PMS, NVP), meta-analytic evidence is available. The field is mature for mechanism and safety; developing for cognitive optimization (Cochrane inconclusive); emerging for precision supplementation (PLP vs pyridoxine form differences). Designation: Mature (for core mechanisms and primary indications); Developing (for cognitive applications and combined B-vitamin cardiovascular prevention).

---

### Evidence Gaps Identified
1. **Post-2000 RCTs for PMS specifically**: Wyatt 1999 meta-analysis pools RCTs from 1970s–90s; a modern large RCT (n>300) with standardized outcomes and blinding would substantially strengthen the PMS claim
2. **Cognitive outcome RCTs**: Malouf 2003 Cochrane found only 2 eligible RCTs; 20+ years later, a Cochrane update with more trials would clarify whether B6 alone has cognitive benefits in healthy aging populations
3. **B6-specific cardiovascular evidence**: Most homocysteine-lowering trials use B6+B9+B12 combinations; isolating B6's contribution requires B6-alone vs. placebo RCTs with cardiovascular endpoints
4. **Pyridoxine vs. PLP (P5P) clinical equivalence**: P5P is the active form; some practitioners prefer it for supplementation, but head-to-head clinical equivalence RCTs are limited
5. **Long-term supplementation safety at 50–100 mg/day**: The UL is based largely on Schaumburg 1983 (>2g/day); systematic safety data for chronic supplementation at 50–100 mg/day is limited but risk appears low based on clinical use
6. **Immune function RCTs**: Rall 1993 establishes the mechanistic link but RCT evidence for immune outcomes with B6 supplementation in healthy adults is lacking
