# Evidence Update: Ashwagandha (Withania somnifera)
## Date: 2026-03-05
## Previous Tier: 2 → Current Tier: 1 (UPGRADED)

### Summary
Ashwagandha evidence tier upgraded from Tier 2 to Tier 1 based on three landmark meta-analyses published 2025-2026. Research quality score increased from 89 to 92. Three new high-impact papers added: the largest dose-response meta-analysis to date (Alsanie 2026, 22 RCTs) establishing dose-dependent mental health benefits, a comprehensive hormonal modulation meta-analysis (Fornalik 2026, 23 trials, n=1706), and a clinical populations meta-analysis demonstrating efficacy in diagnosed mental disorders (Marchi 2025, 14 studies). Enhanced citations file already reflected Tier 1 from prior assessment; supplements.js now aligned.

### New Papers Added (3)

1. **Alsanie SA et al. (2026)** — "Effects of ashwagandha (Withania somnifera) on mental health in adults: A systematic review and dose-response meta-analysis of randomized controlled trials"
   - *Complementary Therapies in Medicine*
   - DOI: 10.1016/j.ctim.2026.103325 | PMID: 41644067
   - **Study type:** Dose-response meta-analysis (22 RCTs)
   - **Key finding:** Largest ashwagandha mental health MA to date. Stress SMD = -5.88, Anxiety SMD = -6.87, Depression SMD = -5.68. Significant linear and non-linear dose-response relationship for stress. Establishes dose-dependent efficacy curve.

2. **Marchi M et al. (2025)** — "The effect of Withania somnifera (Ashwagandha) on mental health symptoms in individuals with mental disorders: systematic review and meta-analysis"
   - *BJPsych Open*
   - DOI: 10.1192/bjo.2025.10885 | PMID: 41140145 | PMC: PMC12569615
   - **Study type:** Meta-analysis (14 studies, n=713)
   - **Key finding:** In diagnosed mental disorder populations: Anxiety SMD = -1.13, Depression SMD = -1.28, Stress SMD = -0.95, Sleep quality SMD = -1.35. Supports adjunctive psychiatric use at median 600 mg/day.

3. **Fornalik M et al. (2026)** — "Hormonal Modulation with Withania somnifera: Systematic Review and Meta-Analysis of Randomized-controlled Trials"
   - *Planta Medica*
   - DOI: 10.1055/a-2802-8363 | PMID: 41740946
   - **Study type:** Meta-analysis (23 trials, n=1706)
   - **Key finding:** Cortisol SMD = -1.18, Serotonin MD = 31.75 ng/ml (p<0.01), Testosterone in men MD = 57.43 ng/dl (significant), no testosterone effect in women. T4 modestly increased (MD = 0.61 µg/dL). No effect on TSH, T3, or estradiol. Sex-specific hormonal modulation profile established.

### Evidence Changes

**Tier upgrade: 2 → 1**
- Previous Tier 2 in supplements.js (enhanced file already at Tier 1 from prior cycle)
- Current evidence: 3 meta-analyses (22-RCT dose-response, 23-trial hormonal, 14-study psychiatric) across 6+ domains
- Decision tree: Human data (YES) → Hundreds of RCTs → Multiple meta-analyses (YES) → Consistent findings (YES) → Tier 1

**Effect sizes expanded:**
- Stress: SMD = -5.88 (dose-response MA) and SMD = -0.95 (diagnosed populations)
- Anxiety: SMD = -6.87 (dose-response MA) and SMD = -1.13 (diagnosed populations)
- Depression: SMD = -5.68 (dose-response MA) and SMD = -1.28 (diagnosed populations)
- Sleep: SMD = -1.35 (diagnosed populations)
- Cortisol: SMD = -1.18 (23 trials, n=1706)
- Testosterone (men): MD = 57.43 ng/dl
- Serotonin: MD = 31.75 ng/ml

**New mechanisms confirmed:**
- Serotonergic modulation (MD = 31.75 ng/ml increase)
- Sex-specific testosterone biosynthesis (men only)
- Thyroid hormone modulation (T4, not TSH/T3)

**Research quality score: 89 → 92**
- Points gained: +3 from dose-response meta-analysis (establishes optimal dosing), comprehensive hormonal panel across 1706 participants, clinical population evidence (diagnosed mental disorders)

### Recommendation Impact

**Dosage guidance refined:**
- Optimal: 600 mg/day based on dose-response meta-analysis
- Range: 300-600 mg/day standardized root extract

**Target populations expanded:**
- Added: Diagnosed mental disorder patients (adjunctive), men seeking testosterone support, individuals with subclinical hypothyroidism
- Reinforced: Stressed adults remain primary beneficiaries

**Structural fixes in supplements.js:**
- Fixed tier: 2 → 1
- Fixed duplicate isEnhanced key (was inside primaryBenefits at wrong indentation)
- Replaced generic keyCitation ("Various" DOIs) with 3 specific citations with real DOIs/PMIDs
- Added 7 quantitative effectSizes (stress, anxiety, depression, sleep, cortisol, testosterone, serotonin)
- Added 3 new mechanismsOfAction with quantitative effect sizes
- Added fileId to enhancedCitations block
- Fixed evidenceProfile field name: "lastUpdated" → "lastEvidenceUpdate"

### Files Modified
- `data/enhanced_citations/3_enhanced.js` — 3 new citations, evidenceProfile updated (quality 92, 21 citations), researchSummary added, qualityAssurance date updated
- `data/enhanced_citations/3_ashwagandha_enhanced.js` — ARCHIVED to `_archive/3_ashwagandha_enhanced.js.bak` (duplicate file)
- `data/supplements.js` — ID 3 entry fully updated (tier, rationale, benefits, dosage, populations, mechanisms, effectSizes, keyCitations, enhancedCitations)

### Provenance Trail
- `content/provenance/ashwagandha/search_log.md`
- `content/provenance/ashwagandha/screening_decisions.md`
- `content/provenance/ashwagandha/evidence_evaluation.md`
- `content/provenance/ashwagandha/tier_assignment.md`
- `content/provenance/ashwagandha/synthesis_notes.md`
