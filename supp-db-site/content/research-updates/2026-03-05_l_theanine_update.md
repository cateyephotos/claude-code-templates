# Evidence Update: L-Theanine (γ-Glutamylethylamide)
## Date: 2026-03-05
## Previous Tier: 2 → Current Tier: 2 (NO CHANGE)

### Summary
L-Theanine evidence updated with 4 new papers (2 meta-analyses, 2 systematic reviews) from 2024-2025. Research quality score increased from 84 to 87. Tier maintained at 2 — while multiple meta-analyses now exist across domains, pure L-theanine effect sizes remain modest and cognitive effects are domain-specific rather than global. Sleep domain substantially strengthened with definitive MA (Bulman 2025, 19 articles, N=897). Largest comprehensive MA to date (Payne 2025, 50 RCTs) confirms synergistic theanine+caffeine effects exceed solo supplementation. New psychiatric domain added (Moshfeghinia 2024). Duplicate enhanced citation file archived.

### New Papers Added (4)

1. **Bulman CL et al. (2025)** — "Impact of L-theanine on sleep quality: a systematic review and meta-analysis"
   - *Sleep Medicine Reviews*
   - DOI: 10.1016/j.smrv.2025.102070 | PMID: 40056718
   - **Study type:** Systematic review & meta-analysis (19 articles, N=897)
   - **Key finding:** Sleep quality SMD=0.43, daytime dysfunction SMD=0.33, sleep onset latency SMD=0.15. No next-day drowsiness or sedation. Definitive sleep evidence for L-theanine.

2. **Payne JK et al. (2025)** — "A systematic review and meta-analysis of tea, L-theanine, and caffeine on cognition, sleep quality, and mood"
   - *Nutrition Reviews*
   - DOI: 10.1093/nutrit/nuaf002 | PMID: 40314930
   - **Study type:** Systematic review & meta-analysis (50 RCTs)
   - **Key finding:** Largest L-theanine MA to date. Theanine+caffeine: choice RT h1 SMD=-0.48, digit vigilance h2 SMD=0.20, attention switching h2 SMD=0.33, mood h2 SMD=0.26. Theanine alone: choice RT h1 SMD=-0.35. Confirms combination superiority.

3. **Mátyus I et al. (2025)** — "The Effect of L-Theanine Supplementation on Cognitive Performance: A Meta-Analysis of Randomized Controlled Trials"
   - *Journal of Clinical Medicine*
   - DOI: 10.3390/jcm14134769 | PMID: 41227106
   - **Study type:** Meta-analysis (5 RCTs, 148 adults)
   - **Key finding:** Recognition visual reaction time MD=-15.20ms (significant). Simple reaction time and Stroop test non-significant. Dose-dependent effects observed. Indicates domain-specific rather than global cognitive enhancement.

4. **Moshfeghinia R et al. (2024)** — "The effects of L-theanine supplementation on the outcomes of patients with mental disorders: a systematic review"
   - *BMC Psychiatry*
   - DOI: 10.1186/s12888-024-06285-y | PMID: 39633316 | PMC: PMC11616108
   - **Study type:** Systematic review (11 RCTs, 6 countries)
   - **Key finding:** L-theanine reduced psychiatric symptoms more effectively than control in schizophrenia, anxiety disorders, and ADHD as adjunctive therapy. 200-400mg/day alongside standard pharmacotherapy. New psychiatric clinical domain.

### Evidence Changes

**Tier maintained: 2 (no upgrade)**
- While multiple meta-analyses now exist, pure L-theanine (without caffeine) effect sizes remain small to moderate
- Cognitive MA (Mátyus 2025) found mixed results — significant for visual RT but not Stroop or simple RT
- Strongest evidence remains for theanine+caffeine combination, not L-theanine alone
- Psychiatric SR (Moshfeghinia 2024) lacks quantitative meta-analytic pooling
- Decision tree: Human data (YES) → Multiple RCTs (YES) → Meta-analyses (YES) → Consistent strong findings across domains (PARTIAL) → Tier 2 maintained

**Effect sizes quantified:**
- Sleep quality: SMD=0.43 (Bulman 2025 MA, 19 articles)
- Daytime dysfunction: SMD=0.33 (Bulman 2025 MA)
- Sleep onset latency: SMD=0.15 (Bulman 2025 MA)
- Stress reduction: 12.92-17.98% (Hidese 2024 MA, existing)
- Choice reaction time: SMD=-0.48 with caffeine, SMD=-0.35 alone (Payne 2025)
- Attention switching: SMD=0.33 with caffeine (Payne 2025)
- Visual reaction time: MD=-15.20ms (Mátyus 2025)

**New domain added:**
- Psychiatric adjunctive therapy (schizophrenia, ADHD, anxiety disorders) — based on Moshfeghinia 2024

**Research quality score: 84 → 87**
- Points gained: +3 from definitive sleep MA (top journal), largest comprehensive MA (50 RCTs), new psychiatric domain
- No points gained for cognitive MA (small sample, mixed results)

### Recommendation Impact

**No dosage changes needed:**
- Optimal: 100-400mg daily (unchanged)
- Sleep: 200-400mg at bedtime (strengthened by Bulman 2025)
- With caffeine: 100mg L-theanine per 50-100mg caffeine (confirmed by Payne 2025)

**Target populations expanded:**
- Added: Psychiatric patients (adjunctive, 200-400mg/day with standard pharmacotherapy)
- Added: Individuals with sleep difficulties (definitive MA evidence)
- Reinforced: Caffeine users remain strongest beneficiary population for cognitive effects

**Structural fixes in supplements.js:**
- Fixed duplicate isEnhanced key (moved outside primaryBenefits to top level)
- Replaced generic keyCitation ("Multiple studies", "Various" DOIs) with 3 specific citations with real DOIs/PMIDs
- Added 6 quantitative effectSizes (sleepQuality, daytimeDysfunction, stressReduction, choiceReactionTime, attentionSwitching, visualReactionTime)
- Added fileId to enhancedCitations block
- Fixed evidenceProfile field name: "lastUpdated" → "lastEvidenceUpdate"
- Added new mechanism: serotonergic pathway modulation
- Added new populations: psychiatric patients, sleep difficulty sufferers

### Files Modified
- `data/enhanced_citations/9_enhanced.js` — 4 new citations (3 benefit + 1 new benefit domain), evidenceProfile updated (quality 87, 22 citations), researchSummary added, qualityAssurance date updated
- `data/enhanced_citations/9_l_theanine_enhanced.js` — ARCHIVED to `_archive/9_l_theanine_enhanced.js.bak` (duplicate file with runtime conflict)
- `data/supplements.js` — ID 9 entry fully updated (benefits, dosage, populations, mechanisms, effectSizes, keyCitations, enhancedCitations)

### Provenance Trail
- `content/provenance/l_theanine/search_log.md`
- `content/provenance/l_theanine/screening_decisions.md`
- `content/provenance/l_theanine/evidence_evaluation.md`
- `content/provenance/l_theanine/tier_assignment.md`
- `content/provenance/l_theanine/synthesis_notes.md`
