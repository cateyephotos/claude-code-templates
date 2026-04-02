# Tier Assignment: Panax Ginseng (ID 15) — Mode 2 Evidence Update

## Assignment Metadata

| Field | Value |
|---|---|
| **Supplement** | Panax Ginseng (ID 15) |
| **Date** | 2026-03-05 |
| **Operator** | Claude (automated pipeline) |
| **Previous Tier** | Tier 2 |
| **Decision** | **Maintain Tier 2** |
| **Previous Quality Score** | 81 |
| **New Quality Score** | 83 |

---

## Pre-Update Status

### Existing Evidence Profile

| Aspect | Status |
|---|---|
| Primary claim | Adaptogenic, cognitive enhancement, energy/fatigue |
| Evidence base | Multiple RCTs, some SRs, one dated Cochrane review |
| Key citations | Several benefit citations including Reay 2005, Kennedy 2001, Vuksan 2000 |
| Known issues | Species confusion (P. ginseng vs. P. quinquefolius), fabricated safety citations, missing PMIDs |
| Tier in supplements.js | Tier 2 |
| Quality in supplements.js | 81 |

---

## Data Integrity Issues Identified During Update

### Issue 1: Fabricated Safety Citations

Three safety citations in the existing enhanced citations file contain hallmarks of AI fabrication:

| Citation | Authors | Year | Journal | Issue |
|---|---|---|---|---|
| safety[1] | "Research team" | 2023 | "Clinical review" | **Fabricated.** "Research team" is not a valid author attribution. "Clinical review" is not a real journal title. No PMID or DOI verifiable. |
| safety[3] | "Research team" | 2023 | "Clinical review" | **Fabricated.** Same hallmarks as safety[1]. Duplicate fabrication pattern. |
| safety[4] | "Research team" | 2023 | "Clinical review" | **Fabricated.** Same hallmarks as safety[1] and safety[3]. Triple fabrication from the same generation session. |

**Impact on tier assessment:** These fabricated citations inflate the apparent safety evidence. However, ginseng's safety profile is well-established through other legitimate sources (including the Jafari 2025 MA with 70 RCTs reporting no significant adverse events). The fabricated citations should be removed and replaced, but their removal does not alter the tier decision.

### Issue 2: Species Mismatch — Vuksan 2000

| Field | Detail |
|---|---|
| **Citation** | benefit[4] — Vuksan 2000 |
| **Issue** | Vuksan 2000 studied **Panax quinquefolius** (American ginseng), not **Panax ginseng** (Asian/Korean ginseng) |
| **Impact** | This citation does not provide evidence for P. ginseng. It should be reassigned to a P. quinquefolius entry or removed from the P. ginseng evidence file. |
| **Severity** | Moderate — misattributes evidence from a different species |

### Issue 3: Missing PMID and DOI — Ellis 2002

| Field | Detail |
|---|---|
| **Citation** | benefit[3] — Ellis 2002 |
| **Issue** | Missing both PMID and DOI identifiers |
| **Impact** | Cannot verify the citation's existence, content, or relevance. Reduces evidence traceability. |
| **Severity** | Low-moderate — citation may be valid but unverifiable |

### Issue 4: Duplicate isEnhanced Keys

Three instances of duplicate `isEnhanced` key declarations were found in the supplements.js entry for Panax Ginseng (ID 15). This is a JavaScript syntax issue that causes the later declaration to overwrite the earlier one, potentially masking data.

---

## Quality Score Update

| Component | Previous | Update | New Score |
|---|---|---|---|
| Base quality score | 81 | — | — |
| Cognitive MAs (Zeng 2024 + Kim 2025) | — | +1 | — |
| CVD dose-response MA (Jafari 2025) | — | +1 | — |
| **Total** | **81** | **+2** | **83** |

### Quality Score Breakdown

- **+1 for cognitive MAs:** Zeng 2024 and Kim 2025 together provide the first domain-specific and validated-scale cognitive effect estimates for ginseng. However, the incremental value is limited because: (a) sample sizes are small (671 and ~400-600), (b) the memory effect is small (SMD = 0.19), (c) the MMSE finding is borderline (lower CI = 0.03), and (d) neither captures healthy adult populations. The two papers together merit +1, not +2, because they partially overlap in included RCTs.
- **+1 for CVD dose-response MA:** Jafari 2025 is the largest ginseng CVD meta-analysis (70 RCTs, n = 4,506) and provides novel dose-response data. However, the quality increment is moderated because: (a) all findings are biomarker-level, not clinical endpoints, (b) the anti-inflammatory effect is small (SMD = -0.23 for hs-CRP), (c) null findings for lipids and blood pressure actually constrain rather than expand the evidence profile, and (d) no PROSPERO registration.

### Quality Score Ceiling Analysis

The quality score is constrained at 83 rather than higher because:

| Constraining Factor | Impact |
|---|---|
| No Cochrane review for P. ginseng cognition | Prevents the +3 increment seen in Ginkgo biloba (Wieland 2026) |
| Small sample sizes in cognitive MAs (n = 671, ~500) | Limits confidence in cognitive effect estimates |
| Memory-only cognitive benefit (attention/exec null) | Evidence breadth exceeds evidence depth |
| Fabricated safety citations (3 citations) | Integrity issues reduce overall quality confidence |
| Species mismatch (Vuksan 2000) | Wrong-species evidence artificially inflated the pre-existing profile |
| Biomarker-only CVD evidence | No hard clinical endpoint evidence |
| No evidence for fatigue/energy claims | Major consumer use case unsupported by current evidence update |

---

## Tier Decision: Maintain Tier 2

### Decision Rationale

Panax ginseng is maintained at **Tier 2** based on the following assessment:

#### Arguments FOR Maintaining Tier 2

1. **Substantial RCT volume in CVD meta-analysis** — Jafari 2025 synthesizes 70 RCTs with 4,506 participants. This volume of controlled trial data, even for biomarker endpoints, supports Tier 2 classification.

2. **Statistically significant cognitive effects** — Both cognitive MAs (Zeng 2024, Kim 2025) report significant positive effects. The ADAS-Cog finding (I-squared = 0%) is particularly robust. While the effects are small, they are consistently positive for memory and global cognition scales.

3. **Dose-response relationships established** — Both cognitive (Zeng 2024 high-dose subgroup) and cardiovascular (Jafari 2025 dose-response curves) evidence demonstrates dose-dependency, which is a hallmark of genuine pharmacological activity and distinguishes supplement effects from placebo responses.

4. **Multiple evidence synthesis types** — The evidence base includes domain-specific cognitive MA, validated-scale cognitive MA, and a large-scale CVD dose-response MA. This multi-method evidence structure is characteristic of Tier 2.

5. **Clear mechanistic pathway** — The anti-inflammatory/antioxidant profile (hs-CRP, ROS, SOD) provides a coherent mechanistic explanation for the observed cardiovascular biomarker effects, strengthening the biological plausibility of the evidence.

6. **Wide evidence scope** — Evidence spans cognitive function (memory, global cognition), inflammation, oxidative stress, and glucose metabolism. While individual effect sizes are modest, the breadth of documented activity supports Tier 2 classification.

#### Arguments AGAINST Tier 1 Upgrade

1. **Mixed cognitive results** — Memory is the only cognitive domain with positive effects. Attention (p = 0.54) and executive function (p = 0.79) are clearly null. Overall cognition is null (p = 0.86). This domain selectivity limits the strength of cognitive enhancement claims.

2. **Evidence breadth exceeds evidence depth** — Ginseng shows small effects across many endpoints, but no single endpoint has the depth of evidence required for Tier 1 (i.e., Cochrane review, large effect size, high GRADE certainty, replicated across populations).

3. **Small cognitive effect sizes** — Memory SMD = 0.19 is a small effect. Even the high-dose subgroup (SMD = 0.33) is small-to-moderate. These effects may not be clinically perceptible to individual supplement users.

4. **No Cochrane review** — Unlike Ginkgo biloba (Wieland 2026, 82 RCTs), Panax ginseng lacks a current Cochrane systematic review for cognitive effects. The absence of this gold-standard evidence synthesis limits confidence.

5. **Dated Cochrane** — The existing Cochrane review for ginseng is outdated and does not reflect the current evidence landscape. A new Cochrane review would be needed to support Tier 1.

6. **Species confusion in existing evidence file** — The Vuksan 2000 species mismatch and fabricated safety citations indicate data integrity issues that must be resolved before any tier upgrade can be considered.

7. **MMSE finding is borderline** — The MMSE mean difference (0.68, lower CI = 0.03) barely excludes zero. This is a statistically fragile finding vulnerable to the addition of a single negative study.

8. **Biomarker-only CVD evidence** — All CVD findings are intermediate biomarkers. No evidence for hard clinical endpoints (MI, stroke, mortality). Tier 1 for CVD claims would require clinical endpoint data.

9. **No healthy adult evidence** — The cognitive MAs predominantly include impaired populations. The primary supplement consumer population (healthy adults) has limited representation.

#### Arguments AGAINST Tier 3 Downgrade

1. **70-RCT CVD meta-analysis** — The Jafari 2025 MA alone contains more controlled trial data than most Tier 3 supplements' entire evidence bases.

2. **Multiple positive findings with statistical significance** — Memory, MMSE, ADAS-Cog, hs-CRP, ROS, SOD all show significant effects. Tier 3 supplements typically have inconsistent or preliminary findings.

3. **Dose-response evidence** — Dose-dependency demonstrated across multiple endpoints argues against a Tier 3 classification, which is reserved for supplements with limited or inconclusive evidence.

4. **Long history of clinical investigation** — Ginseng has been studied in human clinical trials for decades. The evidence base, while imperfect, far exceeds the Tier 3 threshold.

---

## Tier Criteria Alignment

### Tier 1 Criteria Check

| Criterion | Met? | Notes |
|---|---|---|
| Multiple large, high-quality RCTs | Partially | 70 RCTs for CVD, but cognitive RCTs are small (n = 671 total) |
| Consistent effect direction | No | Memory positive, attention/executive null, overall cognition null |
| GRADE moderate or high certainty | No | No GRADE assessment in any included paper |
| Clinically meaningful effect sizes | No | Memory SMD = 0.19 is small; hs-CRP SMD = -0.23 is small |
| Evidence in primary consumer population | No | Limited healthy adult data |
| Cochrane or equivalent definitive SR | No | No current Cochrane review |
| **Overall Tier 1** | **NO** | Multiple unmet criteria |

### Tier 2 Criteria Check

| Criterion | Met? | Notes |
|---|---|---|
| Multiple evidence syntheses exist | Yes | 3 new MAs + existing citations |
| At least one positive finding with significance | Yes | Memory, ADAS-Cog, hs-CRP, ROS, SOD |
| Dose-response evidence | Yes | Both cognitive and CVD dose-response data |
| Established safety profile | Yes | 70-RCT MA reports no significant AEs; well-established safety history |
| Broader evidence scope beyond one outcome | Yes | Cognitive + CVD + anti-inflammatory + antioxidant |
| **Overall Tier 2** | **YES** | Criteria substantially met |

### Tier 3 Criteria Check

| Criterion | Met? | Notes |
|---|---|---|
| Limited to small RCTs or observational | No | 70-RCT MA and 15-RCT cognitive MA |
| Inconsistent or preliminary findings | Partially | Mixed cognitive domains, but overall pattern is coherent |
| No high-level evidence synthesis | No | Multiple MAs exist |
| **Overall Tier 3** | **NO** | Evidence exceeds Tier 3 threshold |

---

## Final Assignment

| Field | Value |
|---|---|
| **Tier** | **2** |
| **Quality Score** | **83** |
| **Previous Tier** | 2 (maintained) |
| **Previous Quality Score** | 81 |
| **Change** | Quality +2, Tier unchanged |
| **Upgrade/Downgrade** | Maintained |
| **Next Review Trigger** | New Cochrane SR, large healthy-adult RCT, or GRADE certainty assessment publication |
| **Data Integrity Actions Required** | Remove 3 fabricated safety citations, correct Vuksan 2000 species mismatch, resolve Ellis 2002 missing identifiers, fix 3x duplicate isEnhanced keys |
