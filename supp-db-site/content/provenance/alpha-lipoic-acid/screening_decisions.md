# Screening Decisions: Alpha-Lipoic Acid (ID: 44)
## Pipeline Run: 2026-03-06 | Mode: Structural Repair + Evidence Update (Mode 2+)

---

## Inclusion Criteria

1. **PMID or DOI present** — citations without either identifier are categorically excluded as unverifiable
2. **Published in peer-reviewed journal** — not conference abstracts, editorials without data, or non-peer-reviewed commentary
3. **Directly relevant to ALA oral supplementation** — topical or IV-only studies without oral dose data are excluded from the oral supplementation database
4. **Unique citation** — cross-domain duplicates (same PMID appearing in multiple domains) are not permitted
5. **Citation resolves to claimed content** — title, authors, journal, volume, pages, and year all match the primary source record

---

## Exclusion Decisions

### Excluded: Beitner 2003 (Cosmetic Dermatology)
**Reason:** No PMID; no DOI. The original file listed "Beitner 2003, Cosmetic Dermatology" with an empty PMID field.
**Attempted verification:** PubMed search for Beitner 2003 AND lipoic acid AND Cosmetic Dermatology yielded no matching result. Cosmetic Dermatology was a Wiley journal; searched via DOI prefix 10.1111 and found no matching Beitner 2003 article.
**Domain assignment in legacy file:** benefits (skin elasticity claim)
**Decision:** EXCLUDED — unverifiable citation without PMID or DOI. Skin health via topical ALA is not a primary oral supplementation benefit domain.

### Excluded: "Research team" 2023 — clinical review #1 (safety)
**Reason:** Fabricated placeholder. No PMID, no DOI, no journal name, no volume/issue/page, author listed as generic "Research team" with no institution or individual names.
**Domain assignment in legacy file:** safety
**Decision:** EXCLUDED — fabricated citation with no identifiers. Replaced with Packer 1995 (PMID 7649494) which is a genuine peer-reviewed foundational safety reference.

### Excluded: "Research team" 2023 — clinical review #2 (drug interactions)
**Reason:** Fabricated placeholder. Same non-citation as above. Claimed to document drug interaction information for ALA with diabetes medications.
**Domain assignment in legacy file:** safety
**Decision:** EXCLUDED — drug interaction claim without verifiable source is not acceptable in a peer-reviewed database. The SYDNEY 2 trial (PMID 16644601) documents adverse event monitoring including hypoglycemic risk; Packer 1995 (PMID 7649494) provides general safety context.

### Excluded: "Research team" 2023 — clinical review #3 (administration guidelines)
**Reason:** Fabricated placeholder. Same non-citation format. Claimed to establish administration timing guidelines.
**Domain assignment in legacy file:** not explicitly placed in legacy file structure
**Decision:** EXCLUDED — administration guidelines require a verifiable source. Shay 2009 (PMID 19664869) provides the pharmacokinetics data (empty stomach administration, ~30% oral bioavailability) with a real peer-reviewed citation.

---

## Inclusion Decisions

### Retained: Holmquist 2007 (PMID 17292493)
**Domain:** mechanisms
**Rationale:** Comprehensive review establishing ALA as a "universal antioxidant" active in both aqueous and lipid phases. Pharmacology & Therapeutics is a high-impact review journal. Title, authors, journal, volume, pages, DOI all verified against PubMed record. Retained.

### Retained: Evans & Goldfine 2000 (PMID 11469271)
**Domain:** mechanisms
**Rationale:** Foundational mechanistic review of antioxidant recycling pathways. Diabetes Technology & Therapeutics is peer-reviewed. All citation fields verified. Retained.

### Retained: Jacob 1999 (PMID 10381194)
**Domain:** mechanisms
**Rationale:** Primary mechanistic paper demonstrating ALA-mediated enhancement of glucose uptake through GLUT transporter activation. Free Radical Biology and Medicine is a top-tier specialty journal. All fields verified. Retained.

### Retained: Moini 2002 (PMID 12897426)
**Domain:** mechanisms
**Rationale:** Characterizes dual antioxidant/prooxidant redox chemistry of ALA and DHLA; establishes mitochondrial protection. Toxicology and Applied Pharmacology peer-reviewed. PMID verified (note: source file had PMID 12897426, not 12097040; confirmed 12897426 is correct). Retained.

### Retained: Reljanovic 1999 / ALADIN II (PMID 10490251)
**Domain:** benefits
**Rationale:** Multicenter 2-year double-blind RCT demonstrating ALA (600–1200 mg/day) reduces diabetic neuropathy symptoms. Free Radical Research peer-reviewed. All citation fields verified. Primary clinical evidence for neuropathy benefit. Retained.

### Retained: Haritoglou 2011 (PMID 21088437)
**Domain:** benefits
**Rationale:** Randomized clinical trial for diabetic macular edema. Ophthalmologica peer-reviewed. All fields verified. Retained.

### Retained: Namazi 2018 (PMID 29031735)
**Domain:** benefits
**Rationale:** Meta-analysis of RCTs demonstrating ALA reduces body weight and BMI. Clinical Nutrition is a high-impact nutrition journal. Meta-analysis design is the strongest evidence tier below Cochrane. Retained.

### Retained: Akbari 2018 (PMID 29408453)
**Domain:** benefits
**Rationale:** Meta-analysis of RCTs demonstrating ALA improves fasting glucose, insulin sensitivity, and HbA1c in T2DM. Metabolism is a high-impact metabolism journal. Retained.

### Retained: Rochette 2015 (PMID 26016853)
**Domain:** benefits
**Rationale:** Comprehensive review of ALA cardiovascular effects (endothelial function, oxidative stress markers). Nutrition Research Reviews is peer-reviewed. All fields verified. Retained.

### Retained: Derosa 2016 (PMID 27338359)
**Domain:** benefits
**Rationale:** Meta-analysis of RCTs demonstrating ALA reduces CRP, IL-6, and TNF-α. International Journal of Molecular Sciences peer-reviewed (MDPI open access with rigorous peer review). Retained.

### Retained: Ziegler 2006 / SYDNEY 2 (PMID 16644601)
**Domain:** safety
**Rationale:** Large RCT (N=181) confirming ALA 600 mg/day safety profile; adverse events documented. Diabetes Care is the top diabetes clinical journal. Primary safety trial for ALA. Retained.

### New: Packer 1995 (PMID 7649494)
**Domain:** safety
**Rationale:** Foundational review establishing ALA's safety as a biological antioxidant; characterizes therapeutic dose range and absence of toxicity. Free Radical Biology and Medicine top-tier. Added to give safety domain a second citation after excluding 2 fabricated safety citations.

### New: Ziegler 1995 / ALADIN I (PMID 8582546)
**Domain:** dosage
**Rationale:** Landmark dose-finding RCT that established 600 mg/day as the primary clinical effective dose. Diabetologia is the flagship European diabetes journal. The dosage domain was entirely absent in the legacy file; this is the foundational dosage citation for ALA.

### New: Shay 2009 (PMID 19664869)
**Domain:** dosage
**Rationale:** Comprehensive dosage review synthesizing pharmacokinetics (oral bioavailability ~30%), optimal administration timing (empty stomach), R-ALA vs racemic considerations. Biochimica et Biophysica Acta peer-reviewed. Essential for complete dosage domain coverage.

---

## Summary Counts

| Decision | Count |
|----------|-------|
| Excluded (fabricated/no PMID) | 4 |
| Retained from legacy file | 11 |
| New citations added | 3 |
| **Final total** | **14** |

---

*Screening decisions completed: 2026-03-06 | Pipeline Mode: Structural Repair + Evidence Update (Mode 2+)*
