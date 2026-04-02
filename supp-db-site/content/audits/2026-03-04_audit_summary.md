# Evidence Database Audit Report
## Date: 2026-03-04 | Mode 5 — Full Database Evidence Audit

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Supplements Audited** | 89 |
| **Total Issues Found** | 353 |
| **Critical Issues** | 84 |
| **Warnings** | 180 |
| **Informational** | 89 |
| **Overall Health Score** | **0 / 100** |
| **Database Version** | 2.0 |
| **Database Last Updated** | 2025-08-17 |

**Verdict:** The database has a solid foundation — all 89 supplements have safety profiles, dosage ranges, and effect sizes populated. However, the database is **critically lacking** in evidence freshness tracking (only 5/89 have `lastEvidenceUpdate`), quality scoring (only 17/89 have `researchQualityScore`), and provenance documentation (0/89 have provenance trails). The enhanced citation files exist but many use legacy or non-canonical schemas.

---

## Tier Distribution

| Tier | Count | Description |
|------|-------|-------------|
| **Tier 1** (Gold Standard) | 8 | Turmeric, Omega-3, Creatine, Magnesium, Vitamin D3, Vitamin C, Zinc, Iron |
| **Tier 2** (Strong Evidence) | 60 | Bacopa, Ashwagandha, L-Theanine, Lion's Mane, CoQ10, etc. |
| **Tier 3** (Moderate) | 21 | PQQ, Tribulus, PEA, Vanadium, Bitter Melon, etc. |
| **Tier 4** (Emerging) | 0 | None |

---

## Issue Breakdown by Type

### Critical Issues (84)

| Issue Type | Count | Impact |
|------------|-------|--------|
| **Stale Evidence — No Update Date** | 84 | 84 of 89 supplements have NO `lastEvidenceUpdate` recorded. Evidence freshness is completely untracked for 94% of the database. |
| (Only 5 have dates: Bacopa 2025-08-17, Turmeric/Creatine/Omega-3/Magnesium 2025-08-18) | | |

### Warnings (180)

| Issue Type | Count | Impact |
|------------|-------|--------|
| **Stale Evidence — >6 months** | 5 | The 5 supplements WITH dates are now all >6 months old |
| **Incomplete Enhanced Citations** | 88 | Enhanced citation markers exist but inline mechanisms/benefits/safety arrays are empty (data lives in external files only) |
| **Missing Quality Score** | 72 | 72 of 89 supplements lack `researchQualityScore` — evidence quality is unquantified |
| **Missing Canonical Named File** | 11 | 11 supplements have only `{id}_enhanced.js`, not `{id}_{name}_enhanced.js` |
| **Tier Mismatch** | 4 | 4 supplements may have incorrect tier assignments |

### Informational (89)

| Issue Type | Count | Impact |
|------------|-------|--------|
| **Missing Provenance Trail** | 89 | 0 of 89 supplements have provenance documents — full transparency gap |

---

## What's Working Well

These areas are **100% complete** across all 89 supplements:

- **Safety profiles**: All 89 have safety ratings, side effects, contraindications
- **Effect sizes**: All 89 have quantitative effect size data documented
- **Dosage ranges**: All 89 have dosage information
- **Key citations**: All have at least 1 key citation with DOI
- **Enhanced citation files**: All 89 have at least one enhanced citation file (either named or generic)

---

## Enhanced Citation File Schema Analysis

### File Inventory
| Category | Count |
|----------|-------|
| Total enhanced citation files | 172 |
| Named files (`{id}_{name}_enhanced.js`) | 116 |
| Generic files (`{id}_enhanced.js`) | 48 |
| Legacy files (no ID prefix) | 8 |

### Schema Format Distribution
| Format | Count | % | Status |
|--------|-------|---|--------|
| **Full Canonical** (with citationMetrics, researchEvolution) | 14 | 8% | Gold standard |
| **Standard** (with citations block, proper sections) | 97 | 56% | Acceptable, needs enrichment |
| **Unknown/Legacy** (non-standard structure) | 60 | 35% | Needs migration |
| **Compact** (flat keyFindings, no nested evidence) | 1 | 1% | Needs migration |

### Common Schema Issues in Enhanced Files
| Issue | Files Affected | Severity |
|-------|---------------|----------|
| Missing `citationId` fields | 154 / 172 | High — renderer uses for dedup |
| Missing DOI fields | 104 / 172 | High — unverifiable citations |
| Missing `const` declaration | 89 / 172 | Medium — loader compatibility |
| Missing `evidenceProfile` | 88 / 172 | Medium — no quality metadata |
| Missing `mechanisms` section | 58 / 172 | High — incomplete data |
| Missing `benefits` section | 61 / 172 | High — incomplete data |
| Missing `safety` section | 57 / 172 | High — incomplete data |
| Missing `window.enhancedCitations` export | 7 / 172 | Critical — won't load in browser |

---

## 11 Supplements Missing Canonical Named Files

These only have generic `{id}_enhanced.js` and need properly named files:

| ID | Supplement | Needed File |
|----|-----------|-------------|
| 4 | Omega-3 Fatty Acids | `4_omega_3_fatty_acids_enhanced.js` |
| 12 | Phosphatidylserine | `12_phosphatidylserine_enhanced.js` |
| 14 | Ginkgo Biloba | `14_ginkgo_biloba_enhanced.js` |
| 16 | Alpha-GPC | `16_alpha_gpc_enhanced.js` |
| 17 | Berberine | `17_berberine_enhanced.js` |
| 19 | B-Complex Vitamins | `19_b_complex_vitamins_enhanced.js` |
| 20 | Quercetin | `20_quercetin_enhanced.js` |
| 24 | Green Tea Extract | `24_green_tea_extract_enhanced.js` |
| 29 | MSM | `29_msm_enhanced.js` |
| 34 | 5-HTP | `34_5_htp_enhanced.js` |
| 45 | Lutein | `45_lutein_enhanced.js` |

---

## Top 20 Supplements with Most Issues

| Rank | ID | Supplement | Issues | Primary Problems |
|------|-----|-----------|--------|-----------------|
| 1 | 19 | B-Complex Vitamins | 6 | No update date, no quality score, no canonical file, incomplete enhanced, no provenance |
| 2 | 8 | Melatonin | 5 | No update date, no quality score, no canonical file, incomplete enhanced, no provenance |
| 3 | 12 | Phosphatidylserine | 5 | Same as above + missing canonical file |
| 4 | 14 | Ginkgo Biloba | 5 | Same pattern |
| 5 | 16 | Alpha-GPC | 5 | Same pattern |
| 6 | 17 | Berberine | 5 | Same pattern |
| 7 | 20 | Quercetin | 5 | Same pattern |
| 8 | 23 | Folate | 5 | No update date, no quality score, incomplete, no provenance, tier mismatch |
| 9 | 24 | Green Tea Extract | 5 | Same as #3 pattern |
| 10 | 29 | MSM | 5 | Same pattern |
| 11 | 50 | Caffeine | 5 | No update date, no quality score, incomplete, no provenance, tier mismatch |

---

## Tier Mismatch Alerts

| ID | Supplement | Current Tier | Issue |
|----|-----------|-------------|-------|
| 4 | Omega-3 Fatty Acids | Tier 1 | Only records unknown total citations — verify gold standard criteria |
| 6 | Magnesium | Tier 1 | Only records unknown total citations — verify gold standard criteria |
| 7 | Vitamin D3 | Tier 1 | Only records unknown total citations — verify gold standard criteria |
| 50 | Caffeine | Tier 1 | Only records unknown total citations — verify gold standard criteria |

> **Note:** These may be correctly tiered — the issue is that `totalCitations` is not populated in the evidenceProfile, making automated tier verification impossible.

---

## Recommended Action Plan

### Immediate (This Week)
1. **Run Mode 2 on the 5 supplements with dates** — they're now >6 months stale (IDs: 1, 2, 4, 5, 6)
2. **Set `lastEvidenceUpdate: "2025-08-17"` for remaining 84 supplements** — at minimum, record the database creation date as the baseline

### Phase 1: Critical (Next 2 Weeks)
3. **Run Mode 2 updates on all Tier 1 supplements** (IDs: 2, 4, 5, 6, 7, 36, 37, 38) — these are the gold standard entries and must be the most accurate
4. **Populate `researchQualityScore` for all 72 missing entries** — can be batch-calculated from existing citation data
5. **Create 11 canonical named enhanced citation files** from existing generic files

### Phase 2: Core (Next Month)
6. **Run Mode 2 updates on all Tier 2 supplements** (60 entries) in batches of 3-4 per session
7. **Migrate enhanced citation files to canonical schema** — 60 files in unknown/legacy format need restructuring
8. **Generate provenance trails** for each supplement as updates are processed

### Phase 3: Completeness (Ongoing)
9. **Run Mode 2 on Tier 3 supplements** (21 entries)
10. **Generate newsletters** (Mode 4) for updated supplements
11. **Re-run this audit** monthly to track progress

---

## Methodology

This audit was generated by:
1. Parsing `supplements.js` and extracting 30+ fields per supplement
2. Scanning all 172 files in `enhanced_citations/` for schema compliance
3. Cross-referencing supplement IDs against file naming conventions
4. Checking provenance trail directory for existing documents
5. Applying 11 automated checks per supplement (stale evidence, DOIs, tier logic, schema compliance, safety data, effect sizes, provenance)

### Audit Scripts
- `tools/audit_extract.js` — Extracts structured audit data from supplements.js
- `tools/audit_enhanced_files.js` — Scans enhanced citation files for schema compliance
- `tools/generate_audit_report.js` — Generates the comprehensive JSON report

---

*Generated by supplement-research-pipeline Mode 5 | 2026-03-04*
*Next audit scheduled: 2026-04-04*
