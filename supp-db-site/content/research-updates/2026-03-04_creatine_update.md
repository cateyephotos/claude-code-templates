# Evidence Update: Creatine
## Date: 2026-03-04
## Previous Tier: 2 → Current Tier: 1 (UPGRADED)
## Quality Score: 86 → 93 (+7)

---

## Summary

Mode 2 evidence update for Creatine (ID 5). Searched PubMed and Consensus for new research published after August 2025. Found ~60 candidate papers, screened to 6 high-quality inclusions (4 meta-analyses, 1 systematic review, 1 dose-response meta-analysis). Evidence strongly supports upgrade to Tier 1 with extensive meta-analytic support across strength, body composition, cognitive function, and kidney safety.

Additionally, the enhanced citation file was migrated from legacy schema (`enhancedCitations: [array]`) to canonical schema (`citations: { mechanisms, benefits, safety, dosage }`) during this update.

---

## New Papers Added (6)

### 1. Marshall et al. 2026 — Cognitive Function in Aging Systematic Review
- **PMID:** 40971619
- **DOI:** 10.1080/1028415X.2025.2510879
- **Type:** Systematic review of 6 studies (1,542 participants)
- **Key Finding:** 83.3% of studies reported positive effects on cognition in aging adults; memory and attention most consistently improved
- **Assigned to:** Benefits → "Cognitive Function"

### 2. Eckert et al. 2025 — Depression Meta-Analysis
- **PMID:** 41189312
- **DOI:** 10.1016/j.jad.2025.06.085
- **Type:** Meta-analysis of 11 RCTs (1,093 participants)
- **Key Finding:** SMD = -0.34 (95% CI: -0.67 to -0.02) — effect below minimal important difference; GRADE certainty very low
- **Assigned to:** Benefits → "Depression and Mood" (WEAK evidence)

### 3. Zhang et al. 2025 — Muscle Strength Meta-Analysis with RVE
- **PMID:** 41328071
- **DOI:** 10.1080/02640414.2025.2462483
- **Type:** Meta-analysis with robust variance estimation
- **Key Finding:** Significant strength gains confirmed; low-to-moderate dosing + high-intensity training yields optimal adaptations
- **Assigned to:** Benefits → "Muscle Strength and Power"

### 4. Naeini et al. 2025 — Kidney Function Safety Meta-Analysis
- **PMID:** 41199218
- **DOI:** 10.1016/j.clnu.2025.06.030
- **Type:** Meta-analysis of 12 studies
- **Key Finding:** Creatinine MD = 0.07 mg/dL (within normal range); GFR unchanged; BUN unchanged; no evidence of kidney damage in healthy adults
- **Assigned to:** Safety → "Kidney Function" (CRITICAL safety evidence)

### 5. Ashtary-Larky et al. 2025 — Dose-Response Body Composition Meta-Analysis
- **PMID:** 41433021
- **DOI:** 10.1016/j.clnu.2025.07.012
- **Type:** Dose-response meta-analysis of 61 trials
- **Key Finding:** FFM +1.39 kg overall; body mass +0.89 kg; no significant effect on fat mass; greater gains in untrained individuals
- **Assigned to:** Benefits → "Body Composition"

### 6. Kazeminasab et al. 2025 — Upper/Lower Body Strength and Power Meta-Analysis
- **PMID:** 40944139
- **DOI:** 10.1080/02640414.2025.2468753
- **Type:** Meta-analysis of 69 studies (1,937 participants)
- **Key Finding:** Significant improvements in both upper and lower body strength and power; effects more pronounced in resistance training protocols
- **Assigned to:** Benefits → "Muscle Strength and Power"

---

## Evidence Changes

### Tier Upgrade: Tier 2 → Tier 1
The previous Tier 2 classification was conservative. Creatine is one of the most researched supplements globally with:
- ISSN position stand (Kreider et al. 2017)
- 5+ new meta-analyses added in this update alone
- 69-study meta-analysis for strength (Kazeminasab 2025)
- 61-trial dose-response meta-analysis for body composition (Ashtary-Larky 2025)
- Consistent replication across hundreds of RCTs
- Definitive kidney safety meta-analysis (Naeini 2025)

### Strengthened Areas
1. **Muscle strength** — Now supported by 3 independent meta-analyses including a 69-study comprehensive analysis and RVE-based analysis accounting for dependent effect sizes
2. **Body composition** — First dose-response meta-analysis (61 trials) confirming FFM gains and characterizing dose-response relationship
3. **Safety (kidney function)** — Definitive meta-analysis showing no kidney damage risk. Creatinine elevation (+0.07 mg/dL) is expected pharmacological effect, not pathology
4. **Cognitive function in aging** — Systematic review of 6 studies (n=1542) showing 83.3% positive results for memory/attention in older adults

### New Domains Added
5. **Depression/mood** — First meta-analysis (11 RCTs, n=1093). Effect is small (SMD=-0.34) and below minimal important difference. Evidence classified as WEAK (GRADE very low). Not recommended as standalone treatment.

### Schema Migration
6. Enhanced citation file migrated from legacy flat array format to canonical categorized schema (`citations.mechanisms`, `citations.benefits`, `citations.safety`, `citations.dosage`)

### Unchanged Areas
- Dosage guidance: Remains 3-5g daily maintenance or 20g/day loading
- Mechanisms of action: Confirmed, not substantially changed
- General safety profile: Excellent rating maintained

---

## Quality Score Breakdown

| Component | Previous | Current | Change |
|-----------|----------|---------|--------|
| Number and quality of RCTs | 24/30 | 28/30 | +4 (hundreds of RCTs, 5+ new meta-analyses) |
| Presence of meta-analyses | 18/20 | 20/20 | +2 (dose-response + RVE meta-analyses) |
| Sample sizes | 12/15 | 14/15 | +2 (69-study and 61-trial meta-analyses) |
| Replication across groups | 13/15 | 14/15 | +1 (additional independent groups) |
| Consistency of findings | 9/10 | 9/10 | 0 (highly consistent for strength/body comp) |
| Recency of evidence | 10/10 | 8/10 | -2 (still recent but score accounts for broader span) |
| **TOTAL** | **86/100** | **93/100** | **+7** |

---

## Recommendation Impact

- **Tier UPGRADED:** Tier 2 → Tier 1 (Gold Standard)
- **Effect sizes updated:** Strength confirmed via 69-study meta-analysis; body composition FFM +1.39 kg (61 trials); kidney safety definitively confirmed
- **New benefit domain:** Depression/mood added (WEAK evidence, not recommended standalone)
- **Safety strengthened:** Kidney function meta-analysis definitively shows no harm in healthy adults
- **No changes to dosage guidance or general safety profile**

---

## Files Modified

| File | Action |
|------|--------|
| `data/enhanced_citations/5_creatine_enhanced.js` | REWRITTEN: migrated from legacy to canonical schema, added 6 new citations |
| `data/supplements.js` | Updated ID 5 inline entry (tier 2→1, totalCitations, qualityScore, lastEvidenceUpdate, effectSizes, keyCitations, primaryBenefits) |
| `content/provenance/creatine/search_log.md` | Created |
| `content/provenance/creatine/screening_decisions.md` | Created |
| `content/provenance/creatine/evidence_evaluation.md` | Created |
| `content/provenance/creatine/tier_assignment.md` | Created |
| `content/provenance/creatine/synthesis_notes.md` | Created |

---

*Generated by supplement-research-pipeline Mode 2 | 2026-03-04*
