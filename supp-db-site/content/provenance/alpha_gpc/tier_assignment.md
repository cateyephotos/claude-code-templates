# Tier Assignment: Alpha-GPC (ID 16) — Mode 2 Evidence Update

## Assignment Metadata

| Field | Value |
|---|---|
| **Supplement** | Alpha-GPC (L-alpha-glycerylphosphorylcholine) (ID 16) |
| **Date** | 2026-03-05 |
| **Operator** | Claude (automated pipeline) |
| **Previous Tier** | Tier 3 |
| **Decision** | **UPGRADE to Tier 2** |
| **Previous Quality Score** | 78 |
| **New Quality Score** | 81 |

---

## Pre-Update Status

### Existing Evidence Profile

| Aspect | Status |
|---|---|
| Primary claim | Cholinergic cognitive enhancement, acetylcholine precursor |
| Evidence base | Multiple individual RCTs, no meta-analyses, predominantly Italian pharmaceutical trials (1990s) |
| Key citations | 12 citations total (mix of benefit, mechanism, and safety citations) |
| Known issues | 5x duplicate target keys in supplements.js, 3x duplicate isEnhanced keys, generic effectSizes lacking specific quantitative data |
| Tier in supplements.js | Tier 3 |
| Quality in supplements.js | 78 |

---

## Data Integrity Issues Identified During Update

### Issue 1: Duplicate Target Keys in supplements.js

Five instances of duplicate `target` key declarations were found in the supplements.js entry for Alpha-GPC (ID 16). Per JavaScript object specification, when an object literal contains duplicate keys, the last value silently overwrites all previous values. This means earlier target data was being lost without any error message.

**Impact on tier assessment:** These duplicates inflated the apparent data completeness of the evidence profile. However, the underlying evidence (citations, study data) was not affected — only the structural representation in supplements.js was compromised. The tier decision is based on evidence quality, not data structure integrity.

### Issue 2: Duplicate isEnhanced Keys

Three instances of duplicate `isEnhanced` key declarations were found in the supplements.js entry. Same silent overwrite behavior as Issue 1.

### Issue 3: Generic effectSizes

The existing effectSizes in the enhanced citations file used generic placeholder text rather than specific quantitative data from the cited studies. This reduced the clinical utility of the evidence profile without affecting the tier assessment directly.

**All three structural issues have been corrected as part of this update cycle.**

---

## Quality Score Update

| Component | Previous | Update | New Score |
|---|---|---|---|
| Base quality score | 78 | — | — |
| Jeon 2024 multicenter RCT (ADAS-cog, MCI, n=100) | — | +2 | — |
| Sagaro 2025 SR+MA (PROSPERO, comparative, 3 RCTs) | — | +1 | — |
| **Total** | **78** | **+3** | **81** |

### Quality Score Breakdown

- **+2 for Jeon 2024 RCT:** This is the highest-quality single study in the Alpha-GPC evidence base. The multicenter, double-blind, placebo-controlled design with ADAS-cog primary endpoint represents a substantial upgrade to the evidence quality. The +2 increment (rather than +3) reflects: (a) it remains a single study requiring replication, (b) the sample size is moderate (n = 100), (c) 12-week duration limits long-term conclusions, and (d) Korean population only limits generalizability.

- **+1 for Sagaro 2025 SR+MA:** This paper provides the first meta-analytic framework for Alpha-GPC evidence. The +1 increment (rather than +2) reflects: (a) only 3 RCTs included — an extremely small meta-analytic base, (b) no placebo comparison — comparative design only (vs citicoline), (c) the included RCTs are dated (1990s Italian trials), and (d) the SCAG outcome measure is older and less interpretable than modern cognitive scales (MMSE, ADAS-cog, MoCA).

### Quality Score Ceiling Analysis

The quality score is constrained at 81 rather than higher because:

| Constraining Factor | Impact |
|---|---|
| Only 1 meta-analysis exists, with only 3 RCTs | Prevents the higher increments seen in supplements with multiple large MAs |
| No large dedicated Alpha-GPC vs placebo MA | The Sagaro 2025 MA is comparative (vs citicoline), not absolute |
| Short-term evidence only (12 weeks max) | No long-term cognitive preservation data |
| No GRADE certainty assessment | Evidence quality has not been formally rated by any systematic review |
| Limited healthy adult evidence | Primary RCTs are in cognitively impaired populations |
| Single geographic source for placebo data | Jeon 2024 is the only recent placebo-controlled RCT (Korean population only) |
| No Cochrane review | No gold-standard evidence synthesis exists for Alpha-GPC |

---

## Tier Decision: UPGRADE from Tier 3 to Tier 2

### Decision Rationale

Alpha-GPC is upgraded from **Tier 3 to Tier 2** based on the following assessment:

#### Arguments FOR Tier 2 Upgrade

1. **First meta-analysis now exists** — Sagaro 2025 (PROSPERO CRD42024626782) provides the first meta-analytic synthesis of Alpha-GPC evidence. While small (3 RCTs, 358 participants), the existence of a registered meta-analysis transitions Alpha-GPC from "individual trial evidence only" (characteristic of Tier 3) to "meta-analytic evidence available" (characteristic of Tier 2). This is a qualitative evidence hierarchy transition, not merely a quantitative increment.

2. **Multicenter RCT validates MCI benefit** — Jeon 2024 provides the strongest single-study evidence for Alpha-GPC's cognitive benefit. The multicenter, double-blind, placebo-controlled design with gold-standard ADAS-cog endpoint meets the quality threshold for Tier 2. The -2.34 ADAS-cog improvement in MCI patients is clinically meaningful and compares favorably to pharmaceutical benchmarks.

3. **7+ RCTs total in evidence base** — Combining the 3 RCTs in Sagaro 2025 with the existing citation base (12 citations including older Italian RCTs) and the new Jeon 2024 RCT, Alpha-GPC has a total evidence base of at least 7 RCTs spanning multiple decades and countries. This exceeds the typical Tier 3 threshold of "limited to small RCTs or observational studies."

4. **Multiple cognitive domains and scales** — Evidence now spans SCAG (geriatric assessment), ADAS-cog (Alzheimer's disease standard), and earlier Italian trial endpoints. The breadth of cognitive assessment tools used across studies increases confidence in the general cognitive benefit signal.

5. **Consistent direction of effect** — Across both the Sagaro 2025 meta-analysis and the Jeon 2024 RCT, the direction of effect consistently favors Alpha-GPC for cognitive outcomes. No included study has found Alpha-GPC to be inferior to placebo or comparator.

6. **Geographic expansion** — The addition of Jeon 2024 (South Korea) to the existing evidence base (predominantly Italy, with studies from the USA, Japan, and Germany) provides geographic and ethnic diversity that strengthens the generalizability assessment. The consistent benefit signal across Italian (1990s trials) and Korean (2024 trial) populations reduces the concern of population-specific effects.

#### Arguments AGAINST Tier 1 Upgrade

1. **Only 1 meta-analysis exists, with only 3 RCTs** — Tier 1 requires multiple large, high-quality evidence syntheses. A single meta-analysis with 3 RCTs is insufficient for Tier 1 classification, regardless of the meta-analysis's methodological quality.

2. **No large dedicated cognitive meta-analysis** — The Sagaro 2025 MA is a comparative effectiveness analysis (Alpha-GPC vs citicoline), not an absolute efficacy analysis (Alpha-GPC vs placebo). No meta-analysis pools Alpha-GPC vs placebo RCTs. This is a critical gap for Tier 1.

3. **Comparative design, not absolute** — The WMD of -3.92 on the SCAG compares Alpha-GPC to citicoline, not to no treatment. It is theoretically possible (though unlikely given Jeon 2024 placebo data) that neither compound is effective and the WMD merely reflects a differential placebo response.

4. **Short-term studies only** — All included evidence is from studies of 12 weeks or less. No long-term (> 6 months) cognitive preservation data exists. Tier 1 for cognitive supplements typically requires evidence of sustained benefit over clinically meaningful time periods.

5. **No Cochrane review** — Tier 1 classification for cognitive supplements is typically supported by a current Cochrane systematic review. No Cochrane review exists for Alpha-GPC.

6. **No GRADE certainty assessment** — None of the included evidence has been rated using the GRADE (Grading of Recommendations, Assessment, Development and Evaluations) framework. Tier 1 typically requires GRADE moderate or high certainty for at least one primary outcome.

7. **Limited healthy adult evidence** — The primary evidence base comes from cognitively impaired populations (MCI, dementia). Healthy adults seeking cognitive enhancement — the primary supplement consumer population — are poorly represented in the evidence.

#### Arguments AGAINST Remaining at Tier 3

1. **Meta-analytic evidence now exists** — The defining characteristic of Tier 3 is "limited to small RCTs or observational studies" without evidence synthesis. The existence of Sagaro 2025 (registered MA) directly contradicts Tier 3 classification.

2. **Multicenter RCT meets Tier 2 quality threshold** — Jeon 2024 is a multicenter, double-blind, placebo-controlled RCT with n = 100 and ADAS-cog primary endpoint. This design quality exceeds the "small RCTs" that characterize Tier 3.

3. **Consistent effect direction** — Tier 3 supplements typically show "inconsistent or preliminary findings." Alpha-GPC's consistently positive cognitive effects across multiple studies and decades argue against Tier 3 classification.

4. **Long research history** — Alpha-GPC (choline alfoscerate) has been studied in human clinical trials since the late 1980s/early 1990s. The accumulated evidence base far exceeds the Tier 3 threshold, even if the most recent high-quality syntheses are limited.

---

## Tier Criteria Alignment

### Tier 1 Criteria Check

| Criterion | Met? | Notes |
|---|---|---|
| Multiple large, high-quality MAs | No | Only 1 MA (3 RCTs) — far below threshold |
| Consistent effect direction across endpoints | Partially | Cognitive endpoints consistent, but limited to memory/cognition only |
| GRADE moderate or high certainty | No | No GRADE assessment in any included paper |
| Clinically meaningful effect sizes | Partially | ADAS-cog -2.34 is meaningful, SCAG WMD -3.92 is interpretable |
| Evidence in primary consumer population | No | Limited healthy adult data |
| Cochrane or equivalent definitive SR | No | No Cochrane review exists |
| **Overall Tier 1** | **NO** | Multiple unmet criteria |

### Tier 2 Criteria Check

| Criterion | Met? | Notes |
|---|---|---|
| At least one evidence synthesis exists | Yes | Sagaro 2025 SR+MA (PROSPERO registered) |
| At least one positive finding with significance | Yes | ADAS-cog -2.34, SCAG WMD -3.92 |
| Evidence from multiple study designs | Yes | MA + multicenter RCT + older Italian RCTs |
| Established safety profile | Yes | Jeon 2024 no serious AEs; decades of pharmaceutical use in Italy/Korea |
| Evidence scope beyond single study | Yes | 7+ RCTs across multiple decades and countries |
| **Overall Tier 2** | **YES** | Criteria substantially met |

### Tier 3 Criteria Check

| Criterion | Met? | Notes |
|---|---|---|
| Limited to small RCTs or observational | No | Multicenter RCT (n=100) + MA (3 RCTs, n=358) |
| Inconsistent or preliminary findings | No | Consistent positive cognitive direction |
| No high-level evidence synthesis | No | PROSPERO-registered MA exists |
| **Overall Tier 3** | **NO** | Evidence exceeds Tier 3 threshold |

---

## Final Assignment

| Field | Value |
|---|---|
| **Tier** | **2** |
| **Quality Score** | **81** |
| **Previous Tier** | 3 (UPGRADED) |
| **Previous Quality Score** | 78 |
| **Change** | Quality +3, Tier upgraded (3 -> 2) |
| **Upgrade/Downgrade** | **UPGRADED** |
| **Next Review Trigger** | Cochrane SR for Alpha-GPC, large Alpha-GPC vs placebo MA, or large healthy-adult RCT (n > 200) |
| **Data Integrity Actions Required** | Resolved: 5x duplicate target keys, 3x duplicate isEnhanced keys, generic effectSizes replaced with specific quantitative data |
