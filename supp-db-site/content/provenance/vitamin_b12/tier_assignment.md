# Tier Assignment: Vitamin B12 (ID 21)
## Pipeline Run: 2026-03-06
## Previous Tier: 1 (confirmed and retained) → Assigned Tier: 1

### Decision Tree Walkthrough

1. **Does the supplement have human clinical data?** → YES
   - Multiple RCTs, Cochrane reviews, prospective cohort studies with human subjects
2. **How many RCTs?** → Many
   - Cochrane meta-analysis (Vidal-Alaball 2005) pooled multiple oral vs IM RCTs
   - Cochrane meta-analysis (Martí-Carvajal 2017) pooled many homocysteine-lowering RCTs
   - Meta-analysis (Sohouli 2024) synthesized B vitamin supplementation RCTs
   - Direct RCT: Volkov 2009 (aphthous stomatitis)
   - Prospective cohorts: Clarke 2007 (n=large elderly cohort); Penninx 2000 (n=700)
3. **Any RCT with n>100?** → YES
   - Cochrane reviews pool hundreds to thousands of participants across included RCTs
   - Penninx 2000 cohort: n=700
4. **Systematic review or meta-analysis exists?** → YES
   - 2 Cochrane reviews (Vidal-Alaball 2005, Martí-Carvajal 2017) — highest methodological standard
   - 1 meta-analysis (Sohouli 2024) — most recent quantitative synthesis
   - 1 comprehensive review by field leaders (Smith/Refsum 2018) — JAD
5. **Are findings consistent across reviews?** → YES (for core outcomes)
   - Homocysteine reduction: consistent across Sohouli 2024 and Martí-Carvajal 2017
   - Deficiency correction via oral supplementation: consistent (Vidal-Alaball 2005)
   - Cognitive protection in elderly: consistent direction (Clarke 2007, Smith/Refsum 2018)
   - Note: CVD event reduction is inconsistent despite homocysteine lowering (Martí-Carvajal 2017 caveat)

**Decision: Tier 1** — Two Cochrane systematic reviews (gold standard evidence) plus a 2024 meta-analysis provide consistent evidence for the core claims (deficiency correction via oral supplementation; homocysteine reduction). Evidence is well-replicated across independent research groups and geographies. The NEJM Clinical Practice review (Stabler 2013) provides authoritative clinical synthesis. The only inconsistency is that homocysteine lowering does not consistently translate to reduced cardiovascular events — this is documented as a nuance in the evidence, not a disqualifying inconsistency.

Tier 1 classification is consistent with `evidenceTier: 1` in supplements.js and is justified by the two Cochrane reviews alone, each of which independently qualifies vitamin B12 for the highest evidence tier.

---

### Research Quality Score Breakdown (0–100)

| Component | Max Points | Awarded | Justification |
|-----------|-----------|---------|---------------|
| Number and quality of RCTs | 30 | 25 | 2 Cochrane reviews pool many RCTs; individual RCT quality variable (Volkov 2009 modest sample); observational studies (Penninx 2000, Clarke 2007) supplement RCT data. Deduction: lack of large placebo-controlled RCT specifically for cognitive outcomes in non-deficient adults |
| Presence of meta-analyses | 20 | 18 | 2 Cochrane reviews + 1 Nutrition Reviews meta-analysis. Deduction: no umbrella meta-analysis; Cochrane reviews focus on CVD/homocysteine and oral vs IM, not cognitive outcomes specifically |
| Sample sizes | 15 | 12 | Cochrane pooled analyses represent hundreds+ participants; Penninx 2000 n=700; Clarke 2007 large elderly cohort. Deduction: Volkov 2009 RCT relatively small; no single massive RCT (n>1000) specifically for B12 |
| Replication across groups | 15 | 13 | Homocysteine reduction replicated across multiple countries and research groups; oral dosing equivalence replicated; cognitive associations replicated in multiple cohorts. Deduction: aphthous stomatitis single RCT |
| Consistency of findings | 10 | 9 | Strong consistency for homocysteine, deficiency correction, neurological protection. Mild inconsistency: CVD events not reduced despite homocysteine lowering (expected from surrogate endpoint research) |
| Recency of evidence | 10 | 8 | Most recent meta-analysis: Sohouli 2024 (2 years old); most recent systematic review: Alruwaili 2023. Cochrane reviews from 2017 and 2005. Deduction: Cochrane dosage review (Vidal-Alaball) not updated since 2005; cognitive outcome RCTs would benefit from post-2020 Cochrane update |
| **TOTAL** | **100** | **85** | |

**Previous entry score: 90** — corrected downward to 85 because:
- Removal of 10 wrong PMIDs means the prior 90/100 was based on invalid citations
- The actual evidence base, while strong, does not achieve the 90/100 threshold that would require more direct RCT evidence for cognitive benefits specifically (current evidence is observational for cognition)
- Two Cochrane reviews + Sohouli 2024 = excellent base; the score reduction reflects honest accounting of what the 12 verified papers actually demonstrate

---

### Evidence Strength Assignments

| Domain | Rating | Justification |
|--------|--------|---------------|
| Mechanisms | Strong | Methionine cycle biochemistry established for decades (Finkelstein 1990); myelin synthesis role documented in neurological literature (Stabler 2013, Alruwaili 2023); direct enzymatic evidence for methylcobalamin as methionine synthase cofactor and adenosylcobalamin as methylmalonyl-CoA mutase cofactor |
| Clinical Benefits | Moderate | Cochrane-level evidence for deficiency correction and homocysteine reduction; observational evidence for cognitive protection; single RCT for aphthous stomatitis; CVD event reduction not consistently demonstrated despite surrogate endpoint improvement; no large RCT for cognitive benefits in non-deficient adults |
| Safety | Well-established | No established upper tolerable intake limit (no known toxicity at any dose in humans); Allen 2008 AJCN comprehensive etiology review; Stabler 2013 NEJM safety data; cobalt allergy rare; injectable preparations have injection site reactions; drug interactions with metformin, PPIs well-characterized |
| Dosage | Evidence-based | Cochrane review (Vidal-Alaball 2005) establishes oral vs IM equivalence at 1000–2000 mcg/day for deficiency; RDA 2.4 mcg/day for maintenance; therapeutic dosing well-supported; bioavailability differences between forms (cyanocobalamin vs methylcobalamin) not yet fully characterized in head-to-head RCTs |

---

### Research Maturity: Mature
**Justification:** Vitamin B12 biochemistry has been established since the 1950s (Nobel Prize for discovery of liver treatment for pernicious anemia, 1934; B12 structure determined 1956). Human clinical research has been ongoing for 70+ years. Cochrane reviews provide the highest level of synthesis. The evidence is mature for deficiency diagnosis and treatment; developing for optimal supplementation in non-deficient populations; and still emerging for cognitive benefits (RCTs specifically designed for cognitive outcomes in elderly with adequate B12 would be valuable additions). Designation: Mature (well-established for core claims; some gaps in optimization research).

---

### Evidence Gaps Identified
1. **Cognitive outcome RCTs in non-deficient elderly**: Most evidence is observational (Clarke 2007) or from deficient populations; a large RCT testing B12 supplementation for cognitive outcomes specifically in elderly adults with normal-low B12 status would fill a critical gap
2. **Methylcobalamin vs cyanocobalamin RCTs**: Clinical difference between forms is debated; head-to-head RCTs comparing neurological outcomes by form are lacking
3. **Long-term supplementation safety data (>5 years)**: While no toxicity is known, systematic long-term prospective data on continuous high-dose supplementation is limited
4. **CVD event reduction**: Despite Cochrane-confirmed homocysteine lowering, cardiovascular event reduction is inconsistent — the surrogate endpoint paradox requires further investigation (possible that lowering homocysteine alone is insufficient; combinatorial approaches may be needed)
5. **Aphthous stomatitis RCT replication**: Volkov 2009 is the only RCT; independent replication would elevate evidence from Level 2 to Level 1 for this indication
6. **Dose-response in vegan/vegetarian populations**: Optimal prophylactic dose for plant-based diet individuals remains understudied; dietary B12 bioavailability from fortified foods vs supplements needs more RCT data
