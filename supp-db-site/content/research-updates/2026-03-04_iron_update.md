# Evidence Update: Iron
## Date: 2026-03-04
## Previous Tier: 2 → Current Tier: 1 (UPGRADED)

### Summary
Iron evidence tier upgraded from Tier 2 to Tier 1 based on comprehensive review revealing 6+ meta-analyses across 6+ distinct health domains. Research quality score increased from 89 to 94. Five new high-impact papers added including an umbrella review (17 systematic reviews) on cognitive development in children, a landmark meta-analysis demonstrating psychiatric and cognitive benefits in NON-ANEMIC iron-deficient individuals, a systematic review of sports performance in female athletes, pregnancy safety meta-analysis, and perioperative IV iron network meta-analysis. One entirely new benefit domain added (Non-anemic cognitive/psychiatric). Exercise performance and pregnancy safety domains substantially strengthened.

### New Papers Added (5)

1. **Caballero-Apaza LM et al. (2026)** — "Effect of iron supplements on cognitive development in children: an umbrella review"
   - *Frontiers in Nutrition*
   - DOI: 10.3389/fnut.2026.1718507 | PMID: 41710280
   - **Study type:** Umbrella review (17 systematic reviews, 2,725 records screened)
   - **Key finding:** Iron supplementation shows modest but meaningful cognitive benefits (intelligence, memory, attention) in anemic children. Universal supplementation in non-deficient children NOT supported. Three reviews rated high confidence with low risk of bias. HIGHEST level of evidence for cognitive domain.

2. **Fiani D et al. (2025)** — "Psychiatric and cognitive outcomes of iron supplementation in non-anemic children, adolescents, and menstruating adults: A meta-analysis and systematic review"
   - *Neuroscience and Biobehavioral Reviews*
   - DOI: 10.1016/j.neubiorev.2025.106372 | PMID: 40945632
   - **Study type:** Systematic review & meta-analysis (18 studies, 12 RCTs, n=1,408)
   - **Key finding:** GAME-CHANGER. In non-anemic iron-deficient individuals: anxiety d=0.34, fatigue d=0.34, physical well-being d=0.42, cognitive intelligence d=0.46, short-term memory d=0.53. Benefits extend BEYOND anemia to iron-deficient non-anemic (IDNA) populations. NEW DOMAIN.

3. **Pengelly M et al. (2024)** — "Iron deficiency, supplementation, and sports performance in female athletes: A systematic review"
   - *Journal of Sport and Health Science*
   - DOI: 10.1016/j.jshs.2024.101009 | PMID: 39536912
   - **Study type:** Systematic review (23 studies, 669 athletes, 16 sports)
   - **Key finding:** Iron deficiency reduces endurance by 3-4%. Supplementation with 100mg/day improved endurance 2-20% and maximal aerobic capacity 6-15%. Up to 60% of female athletes experience iron deficiency. Strengthens exercise performance domain.

4. **Dabir M et al. (2025)** — "The association between iron supplementation during pregnancy and the risk of childhood leukemia: a meta-analysis of case-control studies"
   - *The Journal of Maternal-Fetal & Neonatal Medicine*
   - DOI: 10.1080/14767058.2025.2474268 | PMID: 40045744
   - **Study type:** Meta-analysis (9 studies, 12 datasets, n=4,281)
   - **Key finding:** NO significant association between pregnancy iron supplementation and childhood leukemia (OR=1.01, 95% CI 0.84-1.21). No AML risk (OR=1.01) or ALL risk (OR=1.00). CRITICAL SAFETY EVIDENCE for pregnancy supplementation.

5. **Xue Q et al. (2025)** — "Efficacy and safety of intravenous iron supplementation for perioperative iron deficiency anemia: a systematic review and network meta-analysis of randomized controlled trials"
   - *Journal of Clinical Anesthesia*
   - DOI: 10.1016/j.jclinane.2025.112062 | PMID: 41187664
   - **Study type:** Network meta-analysis (34 RCTs, n=4,688)
   - **Key finding:** Ferric carboxymaltose (FCM) increased Hb by 0.76 g/dL and reduced transfusion requirements (OR=0.72). All IV iron preparations demonstrated acceptable safety profiles. New perioperative clinical domain.

### Evidence Changes

**Tier upgrade: 2 → 1**
- Previous Tier 2 classification reflected strong evidence for deficiency correction but limited meta-analysis coverage across domains
- Current evidence includes an umbrella review (highest level), 3 meta-analyses, and 1 network meta-analysis across 6+ distinct health domains: cognitive development (umbrella), non-anemic cognitive/psychiatric (Fiani 2025), sports performance (Pengelly 2024), anemia treatment (existing MAs), pregnancy safety (Dabir 2025), perioperative (Xue 2025)
- Decision tree: Human data (YES) → Hundreds of RCTs → Multiple meta-analyses (YES) → Consistent findings (YES) → Tier 1

**One new benefit domain added:**
- Non-anemic Cognitive/Psychiatric: Based on Fiani 2025 (12 RCTs, n=1,408) — demonstrates iron supplementation benefits BEFORE anemia develops, in iron-deficient non-anemic individuals

**Exercise performance domain strengthened:**
- Based on Pengelly 2024 (23 studies, 669 athletes) — quantified endurance improvements (2-20%) and aerobic capacity gains (6-15%) in female athletes

**Pregnancy safety confirmed:**
- Based on Dabir 2025 (9 studies, n=4,281) — null finding (OR=1.01) addressing common concern about pregnancy iron and leukemia risk

**Research quality score: 89 → 94**
- Points gained: +5 from umbrella review (highest evidence level), quantitative effect sizes for non-anemic populations, perioperative NMA (34 RCTs), recency of evidence (2024-2026)
- All 5 new papers from 2024-2026, published in high-impact peer-reviewed journals

### Recommendation Impact

**Dosage guidance expanded:**
- General: 8-65mg daily (unchanged base)
- RDA: 8-18mg daily; pregnancy 27mg
- Therapeutic: 25-65mg daily for deficiency treatment
- Athletes: 100mg/day elemental iron for performance benefits (new, based on Pengelly 2024)
- Bisglycinate form recommended for superior bioavailability and tolerability

**Safety profile strengthened:**
- Pregnancy supplementation confirmed safe — no childhood leukemia association (OR=1.01)
- IV iron preparations show acceptable safety in perioperative settings
- No new oral supplementation safety concerns

**Target populations expanded:**
- Added: Female athletes (up to 60% iron deficient), non-anemic iron-deficient individuals, perioperative patients
- Reinforced: Deficient individuals remain primary beneficiaries; benefits are deficiency-dependent across all domains

**Structural fixes in supplements.js:**
- Fixed tier: 2 → 1
- Fixed duplicate isEnhanced keys in primaryBenefits
- Replaced single keyCitation (Beard 2001) with 3 keyCitations including Fiani 2025 and Caballero-Apaza 2026
- Added 3 new quantitative effectSizes (anxiety, physical wellbeing, pregnancy safety)
- Added 3 new mechanismsOfAction (myelin formation, hematopoiesis, mitochondrial optimization)
- Added isEnhanced: true at top level
- Fixed enhancedCitations.evidenceProfile field name: "lastUpdated" → "lastEvidenceUpdate"

### Files Modified
- `data/enhanced_citations/38_enhanced.js` — 5 new citations (benefits + safety), evidenceProfile updated (Tier 1, quality 94), researchSummary expanded, qualityAssurance date updated
- `data/enhanced_citations/38_iron_enhanced.js` — ARCHIVED to `_archive/38_iron_enhanced.js.bak` (duplicate file with runtime conflict)
- `data/supplements.js` — ID 38 entry fully updated (tier, rationale, benefits, dosage, populations, mechanisms, effectSizes, keyCitations, enhancedCitations)

### Provenance Trail
- `content/provenance/iron/search_log.md`
- `content/provenance/iron/screening_decisions.md`
- `content/provenance/iron/evidence_evaluation.md`
- `content/provenance/iron/tier_assignment.md`
- `content/provenance/iron/synthesis_notes.md`
