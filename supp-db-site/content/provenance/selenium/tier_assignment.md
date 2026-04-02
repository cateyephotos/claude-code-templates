# Tier Assignment: Selenium (ID: 42)
## Pipeline Run: 2026-03-06 | Mode: Evidence Update (Mode 2)

---

## Tier Decision

**Assigned Tier: 2**
**Previous Version Tier: 2** (CONFIRMED — tier is correct; score and labels corrected)
**Tier Assignment Confidence: High**

---

## Tier Decision Tree

### Step 1 — Screen for Tier 1 (Strong consistent large-N RCT evidence)

**Criterion:** Multiple large-N (≥200 participants) RCTs with consistent results, strong effect sizes, and Cochrane or equivalent systematic review with High GRADE certainty across primary benefit domain.

**Evaluation:**
- Largest individual RCT identified: SELECT trial (Klein et al., n=35,533 men) — but SELECT is a DEFINITIVE NULL; it does not support Tier 1 positive benefit
- Thyroid meta-analyses (Toulis 2010, Wichman 2016) pool multiple small RCTs; no single included thyroid RCT meets ≥200 participants threshold
- Cochrane review exists (Vinceti 2014 — cancer prevention) but GRADE is Moderate, AND primary finding is NULL
- No Cochrane or equivalent systematic review with HIGH GRADE certainty for a positive benefit domain
- GRADE certainty across positive benefit domains: Moderate (not High) — sample sizes of individual thyroid RCTs prevent High GRADE

**Decision: Tier 1 NOT met** — No large-N (≥200) individual RCT showing positive benefit; no High GRADE Cochrane or equivalent for positive benefit domain; SELECT trial (only large-N RCT) is a null result → Proceed to Step 2

---

### Step 2 — Screen for Tier 2 (Moderate multi-RCT or systematic review evidence)

**Criterion:** Systematic review or meta-analysis with ≥3 RCTs pooled, statistically significant effect, GRADE Moderate or above, effect size sufficient for clinical relevance, no major safety concerns.

**Evaluation:**
- ✅ Meta-analysis exists for thyroid domain: Toulis KA et al. 2010 (PMID 25324270) — 16 studies, 2,019 participants; statistically significant TPO antibody reduction (primary outcome); GRADE Moderate; EJE top-tier endocrinology journal
- ✅ Second independent meta-analysis for thyroid domain: Wichman J et al. 2016 (PMID 26067143) — 4 RCTs, 463 participants; independent confirmation of TPO and TgAb reduction; GRADE Moderate; published in Thyroid (specialty journal)
- ✅ Cochrane systematic review exists: Vinceti M et al. 2014 (PMID 24683040) — gold standard Cochrane methodology; 55 studies; GRADE Moderate (null result for cancer in replete populations — but Cochrane-level evidence base present)
- ✅ Large meta-analysis: Bleys J et al. 2008 (PMID 16530769) — 25 trials, 219,439 participants; cardiovascular domain (mixed result)
- ✅ Effect sizes clinically relevant in thyroid domain (statistically significant TPO antibody reduction across two independent meta-analyses)
- ✅ No major safety concerns: MacFarquhar 2010, EFSA 2014, Rayman ~2010 confirm safe profile at 200 µg/day; well-established therapeutic window
- ✅ Clear mechanistic basis: selenoprotein deiodinase and GPx functions well-established (Ventura 2017 Nat Rev Endocrinol)

**Decision: Tier 2 CONFIRMED** — Two independent meta-analyses in thyroid domain (Toulis 2010, Wichman 2016) with statistically significant positive benefit, GRADE Moderate, clinically relevant effect size; Cochrane review (Vinceti 2014) with gold-standard methodology; no major safety concerns; clear mechanistic basis in selenoproteins

---

## ResearchQualityScore Calculation

**Score: 67/100**

### Weighted Component Scores

| Domain | Raw Score | Weight | Weighted Score | Basis |
|--------|-----------|--------|---------------|-------|
| Mechanism quality | 75 | 0.25 | 18.75 | 4 citations avg 7.5/10; Ventura 2017 (9/10) in Nat Rev Endocrinol is standout; other 3 reviews solid 7/10; excellent mechanistic portfolio covering deiodinases, GPx, TrxR, selenoprotein P |
| Clinical benefit quality | 67 | 0.30 | 20.10 | 6 citations avg 6.67/10; Vinceti Cochrane (8/10) and SELECT trial (7/10) are methodologically strong but null; Toulis (7) and Wichman (7) provide the positive Tier 2 anchor; Bleys 2008 mixed result (6); Cardoso year mismatch penalty (5) |
| Safety quality | 67 | 0.20 | 13.40 | 3 citations avg 6.67/10; MacFarquhar (7), EFSA (7), Rayman year-mismatch penalty (6); 3 citations is adequate; safety profile actually better than score reflects |
| Dosage quality | 53 | 0.15 | 7.95 | 3 citations avg 5.33/10; primary limitation is 2 of 3 dosage citations are cross-domain duplicates (Wichman 5, Avery 4); only Thomson 2004 (7/10) is a unique dosage citation; this is the weakest domain |
| Evidence recency | 65 | 0.10 | 6.50 | Span 2001–2018 (file fields); recent anchors mech_002 (2017), mech_004/dose_003 (2018), ben_002/dose_002 (2016); older anchors ben_003 (2008), dose_001 (2004); mean clinical citation ~2012 |

**Total: 18.75 + 20.10 + 13.40 + 7.95 + 6.50 = 66.70 → ResearchQualityScore: 67**

### Score Calibration Notes
- Score 67 is appropriate for Tier 2 supplements with the following profile: multiple meta-analyses in primary domain, but small individual RCT sizes; Cochrane review present but null result; weak dosage domain; moderate recency
- Primary drag on composite: dosage domain (53/100) due to 2 duplicate citations; removal of duplicates would increase dosage to ~7/10 and composite to ~70
- Secondary drag: Cardoso ben_006 year mismatch (5/10) in clinical domain; correct year (2020) would be a stronger citation
- Safety domain (67) reflects adequate but limited 3-citation safety evidence base; actual safety profile is well-characterized across clinical trials

---

## Changes from Prior Version

| Parameter | Prior Version | Updated Version | Rationale |
|-----------|--------------|----------------|-----------|
| `researchQualityScore` | `86` | `67` | Prior score severely inflated (86/100 is within Tier 1 range); weighted formula using actual citation quality scores gives 66.70 → 67; dosage domain duplicate citations appropriately penalized |
| `totalCitations` | `15` | `16` | Actual count: mechanisms(4)+benefits(6)+safety(3)+dosage(3)=16; prior count of 15 missed 1 citation (Avery & Hoffmann mech_004/dose_003 counted as duplicate but still contributes to total) |
| `clinicalBenefits` evidenceStrength | `"Strong"` | `"Moderate"` | "Strong" is non-standard and inconsistent with GRADE Moderate across benefit domains; primary positive domain (thyroid) has GRADE Moderate; null domains (cancer, cardiovascular) further support Moderate label |
| `publicationSpan` | `"2000-2024"` | `"2001-2018"` | No citations have dates from 2000 (earliest is 2001 per file year fields); no citations have dates from 2019–2024 per file year fields (ben_006 file year = 2015, safe_003 file year = 2018); span updated to match actual file data |
| `lastEvidenceUpdate` | `"2025-08-21"` | `"2026-03-06"` | Updated to current pipeline run date |
| `isEnhanced` placement | Inside `primaryBenefits` (×2) | Top-level (×1) | `isEnhanced` is a top-level file property; was incorrectly placed inside `primaryBenefits` block and duplicated; moved to correct top-level position after `"id": 42` |
| Duplicate `"target":` keys (14) | All domain entries had both `"tissueTarget":` and `"target":` | Only `"tissueTarget":` retained | All 14 lowercase `"target":` keys removed via sed; `"tissueTarget":` (capital T) retained as correct field name |
| `totalVerifiedCitations` in qualityAssurance | `15` | `16` | Aligned with corrected totalCitations count |
| **Tier** | `2` | `2` | **UNCHANGED** — Tier 2 is correct; two independent meta-analyses in thyroid domain justify Tier 2 threshold |

**Key distinction from GABA (ID 40):** GABA's Tier 2 → Tier 3 correction was required because no published meta-analysis exists for any GABA benefit domain when properly investigated. Selenium's Tier 2 is retained because two independent meta-analyses (Toulis 2010, Wichman 2016) ARE published for the thyroid benefit domain. This is the critical differentiator.

**Key similarity with Inositol (ID 41):** Both Inositol (Tier 2, score 68) and Selenium (Tier 2, score 67) have inflated prior scores corrected; both retain Tier 2 on meta-analytic evidence; both have similar composite scores in the 67–68 range reflecting multi-domain meta-analytic support with modest individual study sizes.

---

## Mandatory Notes

### Null Results in Benefits Domain
**Vinceti et al. 2014 Cochrane (ben_004) and Klein et al. SELECT trial (ben_005)** represent major null findings for cancer prevention in selenium-replete populations:
- These citations CANNOT support cancer prevention claims for general population
- They are retained for accurate clinical characterization of the evidence landscape
- File's `healthDomain: "Cancer Prevention"` entry accurately represents the evidence as null
- Consumer-facing content MUST NOT imply selenium prevents cancer based on this evidence

### Duplicate Citations in Dosage Domain
**dose_002 = ben_002 (Wichman 2016)** and **dose_003 = mech_004 (Avery 2018)** are exact duplicate citations (same DOI, PMID, authors, journal, year):
- Retained per Mode 2 protocol (no removal of existing citations)
- Documented in provenance
- Penalized in dosage domain quality score (domain score 53/100)
- In a future Mode 3 (file rebuilding), dosage domain should be rebuilt with unique dosage-specific citations

### Year/PMID Mismatches (3 citations)
Three citations have year field values inconsistent with their actual publication dates:
1. **mech_001 Brown**: File year "2001"; DOI encodes volume 26 (= 2006); PMID 16848710 resolves to ~2006
2. **ben_006 Cardoso**: File year "2015"; PMID 32979499 and DOI `2020.111097` resolve to 2020
3. **safe_003 Rayman**: File year "2018"; PMID 20089734 and DOI `2009.28289` suggest ~2010

Per Mode 2 protocol, these are documented but NOT corrected in citation data. A future Mode 3 pipeline run should correct all three year fields.

---

## Tier Assignment Confidence Statement

**Confidence: High that Tier 2 is correct.**

Selenium meets Tier 2 criteria with substantial margin for the thyroid benefit domain:
1. **Thyroid domain — first meta-analysis:** Toulis KA et al. 2010 (EJE) — 16 studies, 2,019 participants, significant TPO antibody reduction, GRADE Moderate
2. **Thyroid domain — independent second meta-analysis:** Wichman J et al. 2016 (Thyroid) — 4 RCTs, 463 participants, corroborating TPO and TgAb reduction, GRADE Moderate
3. **Cochrane methodology present:** Vinceti M et al. 2014 — gold-standard review methodology (null result for cancer, but demonstrates highest-level evidence scrutiny has been applied to selenium)
4. **Mechanistic coherence:** Ventura 2017 Nat Rev Endocrinol provides direct deiodinase/GPx mechanistic basis for thyroid effects
5. **Safety:** Well-characterized at therapeutic doses; no serious AEs; EFSA and US ULs established

**Conditions for Tier 1 elevation:**
- A large-N (≥200 participants) RCT demonstrating significant positive benefit in thyroid domain (clinical endpoints beyond antibody reduction: improved thyroid function, quality of life) with GRADE High, OR
- A Cochrane or equivalent review achieving GRADE High for positive thyroid outcomes in Hashimoto's patients

**Conditions that would require Tier downgrade:**
- Discovery that Toulis 2010 and Wichman 2016 are not genuinely independent (significant overlap in included RCTs reducing effective meta-analytic weight)
- Large-N replication trial showing null result for TPO antibody reduction in Hashimoto's patients
- Identification that thyroid antibody reduction does not translate to any clinically meaningful outcome
- Major safety signal at 200 µg/day therapeutic dose

---

*Tier assignment completed: 2026-03-06 | Pipeline Mode: Evidence Update (Mode 2)*
