// Enhanced Citation System — MSM (Methylsulfonylmethane), ID 29
// Pipeline Run: 2026-03-06 | Mode 2 — Evidence Update
// Provenance: supp-db-site/content/provenance/msm/

const msmEnhanced = {
  "id": 29,
  "name": "MSM",
  "scientificName": "Methylsulfonylmethane",
  "category": "Joint Support",
  "commonNames": ["Dimethyl sulfone", "Organic sulfur", "DMSO2"],

  "evidenceProfile": {
    "overallQuality": "Tier 3",
    "totalCitations": 8,
    "researchQualityScore": 45,
    "lastEvidenceUpdate": "2026-03-06",
    "evidenceStrength": {
      "mechanisms": "Moderate",
      "clinicalBenefits": "Preliminary",
      "safety": "Good",
      "dosage": "Partially established"
    },
    "researchMaturity": "Emerging",
    "publicationSpan": "2011-2025"
  },

  "citations": {

    "mechanisms": [
      {
        "mechanism": "Anti-inflammatory activity via NF-κB inhibition and cytokine modulation",
        "strength": "Moderate",
        "mechanismType": "NF-κB pathway inhibition",
        "tissueTarget": "Synovial tissue and immune cells",
        "target": "Synovial tissue and immune cells",
        "evidence": [
          {
            "citationId": "butawan_2017_applications",
            "title": "Methylsulfonylmethane: Applications and Safety of a Novel Dietary Supplement",
            "authors": ["Butawan M", "Benjamin RL", "Bloomer RJ"],
            "year": 2017,
            "journal": "Nutrients",
            "doi": "10.3390/nu9030290",
            "pmid": "28300758",
            "studyType": "Narrative review",
            "evidenceLevel": "Level 5",
            "findings": "Comprehensive review documenting in vitro and preclinical evidence for MSM inhibiting NF-κB activation and reducing pro-inflammatory cytokine production (IL-1β, TNF-α). Mechanism-to-clinical translation is not established by direct human mechanistic studies at oral dosing concentrations.",
            "methodology": "Narrative review synthesizing in vitro, animal, and human clinical evidence on MSM mechanisms, applications, and safety. No systematic literature search reported."
          }
        ]
      },
      {
        "mechanism": "Sulfur donation for connective tissue biosynthesis (collagen, keratin, glutathione)",
        "strength": "Weak",
        "mechanismType": "Substrate provision for extracellular matrix synthesis",
        "tissueTarget": "Connective tissue; articular cartilage matrix",
        "target": "Connective tissue; articular cartilage matrix",
        "evidence": [
          {
            "citationId": "butawan_2017_sulfur",
            "title": "Methylsulfonylmethane: Applications and Safety of a Novel Dietary Supplement",
            "authors": ["Butawan M", "Benjamin RL", "Bloomer RJ"],
            "year": 2017,
            "journal": "Nutrients",
            "doi": "10.3390/nu9030290",
            "pmid": "28300758",
            "studyType": "Narrative review",
            "evidenceLevel": "Level 5",
            "findings": "MSM proposed as bioavailable organic sulfur source supporting disulfide bond formation in collagen and keratin, and contributing to glutathione synthesis. Bioavailability of sulfur from oral MSM at standard doses is based on preclinical data; direct human pharmacokinetic evidence is limited.",
            "methodology": "Narrative review; sulfur bioavailability discussion based on preclinical and biochemical data."
          }
        ]
      }
    ],

    "benefits": [
      {
        "healthDomain": "Osteoarthritis — Joint Pain and Function",
        "specificClaim": "Modest improvement in knee OA pain scores with 12-week supplementation at 2–3.375g/day; contested by independent US military systematic review recommending against use",
        "strength": "Weak",
        "evidenceQuality": "Low",
        "replicationStatus": "Inconsistent — 2 small positive RCTs (n=49, n=88); offset by independent military SR recommending against MSM for musculoskeletal pain (Crawford 2019, GRADE methodology)",
        "tissueTarget": "Knee joint (articular cartilage, synovium)",
        "target": "Knee joint (articular cartilage, synovium)",
        "evidence": [
          {
            "citationId": "debbi_2011_oa_rct",
            "title": "Efficacy of methylsulfonylmethane supplementation on osteoarthritis of the knee: a randomized controlled study",
            "authors": ["Debbi EM", "Agar G", "Fichman G", "Ziv YB", "Kardosh R", "Halperin N", "Elbaz A", "Beer Y", "Debi R"],
            "year": 2011,
            "journal": "BMC Complementary and Alternative Medicine",
            "doi": "10.1186/1472-6882-11-50",
            "pmid": "21708034",
            "studyType": "Randomized controlled trial",
            "evidenceLevel": "Level 2",
            "sampleSize": "n=49",
            "duration": "12 weeks",
            "dosage": "3.375g MSM daily (divided doses)",
            "demographics": "Adults with knee OA",
            "findings": "Statistically significant improvement in WOMAC pain subscale and physical function subscale vs. placebo. Effect size not reported. Small sample (n=49) limits statistical power and generalizability. Funding source not fully characterized.",
            "methodology": "Randomized, double-blind, placebo-controlled trial. Primary outcome: WOMAC pain subscale. 12-week supplementation, 3.375g MSM/day in divided doses."
          },
          {
            "citationId": "toguchi_2023_knee_rct",
            "title": "Effects of Methylsulfonylmethane Supplementation on Knee Pain in Mild Knee Pain Subjects: A Randomized, Double-Blind, Placebo-Controlled Trial",
            "authors": ["Toguchi A", "et al."],
            "year": 2023,
            "journal": "Nutrients",
            "doi": "10.3390/nu15153250",
            "pmid": "37447322",
            "studyType": "Randomized controlled trial",
            "evidenceLevel": "Level 2",
            "sampleSize": "n=88",
            "duration": "12 weeks",
            "dosage": "2000mg MSM daily",
            "demographics": "Adults with mild knee pain (not formal severe OA); Japan",
            "findings": "Significant improvement in VAS pain scores vs. placebo at 12 weeks (n=88). The study population had mild knee pain, not confirmed advanced OA, limiting generalizability to established OA. Larger than Debbi 2011 but still modest sample.",
            "methodology": "Randomized, double-blind, placebo-controlled trial. Primary outcome: VAS knee pain score. 12-week treatment period, 2g/day MSM as single daily dose."
          },
          {
            "citationId": "crawford_2019_against_msm",
            "title": "The Use of Dietary Supplements for Musculoskeletal Pain in the Military Community: What Evidence-Based Reviews Are Telling Us",
            "authors": ["Crawford C", "Berry K", "Costello RB", "Deuster PA"],
            "year": 2019,
            "journal": "Pain Medicine",
            "doi": "10.1093/pm/pnz095",
            "pmid": "30986309",
            "studyType": "Systematic review / consensus statement",
            "evidenceLevel": "Level 1",
            "findings": "⚠ PRIMARY NULL EVIDENCE: Using GRADE methodology, the US military/government-commissioned consensus panel found insufficient evidence to recommend MSM for musculoskeletal pain and issued a recommendation AGAINST its use for this indication. This is the most rigorous independent evidence source for MSM efficacy and directly contradicts the positive signal from the two small positive OA RCTs.",
            "methodology": "Systematic review of dietary supplements for musculoskeletal pain commissioned by the US Department of Defense. GRADE evidence quality framework applied. Multiple supplements including MSM evaluated. Independent of supplement industry."
          },
          {
            "citationId": "chen_2025_oa_nma",
            "title": "Comparative effectiveness of dietary supplements for osteoarthritis pain: a network meta-analysis",
            "authors": ["Chen B", "et al."],
            "year": 2025,
            "journal": "Journal of Integrative Medicine",
            "doi": "10.1016/j.joim.2025.01.003",
            "pmid": "40425393",
            "studyType": "Network meta-analysis",
            "evidenceLevel": "Level 1",
            "findings": "MSM ranked low in SUCRA analysis among 23 dietary supplements for OA pain. GRADE certainty of evidence for MSM: Low. Glucosamine sulfate, chondroitin, and boswellia consistently ranked above MSM in this network analysis, suggesting MSM is not among the more evidence-supported options for OA symptom management.",
            "methodology": "Network meta-analysis of 23 dietary supplements for osteoarthritis pain outcomes. GRADE certainty assigned per comparison. SUCRA (surface under the cumulative ranking curve) used to rank supplements."
          }
        ]
      },
      {
        "healthDomain": "Exercise Recovery",
        "specificClaim": "May attenuate post-exercise oxidative stress and modulate inflammatory gene expression; evidence is preliminary and underpowered",
        "strength": "Weak",
        "evidenceQuality": "Very Low",
        "replicationStatus": "Preliminary — 2 small underpowered studies; no adequately powered confirmatory RCT",
        "tissueTarget": "Skeletal muscle",
        "target": "Skeletal muscle",
        "evidence": [
          {
            "citationId": "kalman_2012_exercise_pilot",
            "title": "Influence of methylsulfonylmethane on markers of exercise recovery and performance in healthy men: a pilot study",
            "authors": ["Kalman DS", "Feldman S", "Scheinberg AR", "Krieger DR", "Bloomer RJ"],
            "year": 2012,
            "journal": "Journal of the International Society of Sports Nutrition",
            "doi": "10.1186/1550-2783-9-46",
            "pmid": "23013531",
            "studyType": "Randomized pilot trial",
            "evidenceLevel": "Level 2",
            "sampleSize": "n=8",
            "dosage": "50mg/kg body weight MSM",
            "demographics": "Healthy trained men",
            "findings": "Non-significant trend toward reduced homocysteine (p=0.080). Underpowered pilot study. Does not provide clinically meaningful evidence for exercise recovery benefit. Authors explicitly note the need for larger confirmatory trials.",
            "methodology": "Randomized crossover pilot in 8 healthy men. MSM administered before acute exercise. Measured homocysteine and antioxidant markers."
          },
          {
            "citationId": "mcfarlin_2025_mrna",
            "title": "MSM supplementation modulates exercise-induced gene expression in peripheral blood mononuclear cells",
            "authors": ["McFarlin BK", "et al."],
            "year": 2025,
            "journal": "Nutrients",
            "doi": "10.3390/nu17010034",
            "pmid": "40507030",
            "studyType": "Mechanistic observational study",
            "evidenceLevel": "Level 3",
            "sampleSize": "n=10",
            "findings": "MSM supplementation modulated exercise-induced mRNA expression of inflammatory markers in PBMCs (n=10). Mechanistic signal observed but study is not designed to assess clinical exercise recovery outcomes. No placebo control.",
            "methodology": "Pre-post design in 10 participants receiving MSM before exercise challenge. mRNA expression in peripheral blood mononuclear cells (PBMCs) measured via gene expression assays."
          }
        ]
      }
    ],

    "safety": [
      {
        "safetyAspect": "General tolerability at standard therapeutic doses",
        "claim": "Well tolerated at 2–3.375g/day across clinical trials; adverse event profile comparable to placebo",
        "riskLevel": "Low",
        "target": "Gastrointestinal system; systemic",
        "tissueTarget": "Gastrointestinal system; systemic",
        "evidence": [
          {
            "citationId": "butawan_2017_safety",
            "title": "Methylsulfonylmethane: Applications and Safety of a Novel Dietary Supplement",
            "authors": ["Butawan M", "Benjamin RL", "Bloomer RJ"],
            "year": 2017,
            "journal": "Nutrients",
            "doi": "10.3390/nu9030290",
            "pmid": "28300758",
            "studyType": "Narrative review",
            "evidenceLevel": "Level 5",
            "adverseEvents": [
              {"event": "Mild gastrointestinal discomfort", "frequency": "Occasional", "severity": "Mild"},
              {"event": "Headache", "frequency": "Rare", "severity": "Mild"},
              {"event": "Fatigue", "frequency": "Rare", "severity": "Mild"}
            ],
            "findings": "No serious adverse events identified in reviewed clinical trials. Most commonly reported side effects are mild and transient GI symptoms. No hepatotoxicity, nephrotoxicity, or organ-specific adverse events at standard doses (2–6g/day). Well-tolerated across multiple populations.",
            "methodology": "Narrative review of safety data from human trials and preclinical studies. Adverse event aggregation from reviewed clinical trials."
          },
          {
            "citationId": "debbi_2011_safety",
            "title": "Efficacy of methylsulfonylmethane supplementation on osteoarthritis of the knee: a randomized controlled study",
            "authors": ["Debbi EM", "Agar G", "Fichman G", "Ziv YB", "Kardosh R", "Halperin N", "Elbaz A", "Beer Y", "Debi R"],
            "year": 2011,
            "journal": "BMC Complementary and Alternative Medicine",
            "doi": "10.1186/1472-6882-11-50",
            "pmid": "21708034",
            "studyType": "Randomized controlled trial",
            "evidenceLevel": "Level 2",
            "adverseEvents": [
              {"event": "Mild GI symptoms", "frequency": "Occasional", "severity": "Mild"},
              {"event": "Serious adverse events", "frequency": "None reported", "severity": "None"}
            ],
            "findings": "No serious adverse events reported over 12 weeks at 3.375g/day. Mild GI events occurred at low frequency and were comparable between MSM and placebo groups.",
            "methodology": "Adverse event monitoring within 12-week RCT. Spontaneous and investigator-prompted safety reporting over the full trial duration."
          }
        ]
      },
      {
        "safetyAspect": "Drug interaction potential via CYP450 inhibition",
        "claim": "MSM does not significantly inhibit major CYP450 drug-metabolizing enzymes at physiologically relevant concentrations; pharmacokinetic drug interaction risk is low",
        "riskLevel": "Low",
        "target": "Hepatic CYP450 enzymes",
        "tissueTarget": "Hepatic CYP450 enzymes",
        "evidence": [
          {
            "citationId": "kim_2023_cyp450",
            "title": "Inhibitory Effects of Methylsulfonylmethane on Human Cytochrome P450 Enzymes",
            "authors": ["Kim D", "et al."],
            "year": 2023,
            "journal": "Molecules",
            "doi": "10.3390/molecules28093985",
            "pmid": "38138558",
            "studyType": "In vitro pharmacokinetic study",
            "evidenceLevel": "Level 5",
            "findings": "MSM showed no significant inhibition of CYP1A2, CYP2C9, CYP2C19, CYP2D6, or CYP3A4 at concentrations up to 1000 μM in vitro. IC50 not reached for any major CYP isoform. Suggests low pharmacokinetic drug interaction potential.",
            "methodology": "In vitro fluorescence-based CYP450 inhibition assay using recombinant human cytochrome P450 enzymes. Concentrations tested: 10–1000 μM MSM."
          }
        ]
      }
    ],

    "dosage": [
      {
        "dosageRange": "2000–3375mg daily",
        "claim": "Dose range used in positive OA RCTs; no dedicated dose-optimization study exists; 2g/day and 3.375g/day both showed positive signals in separate 12-week trials",
        "evidenceBase": "Weak",
        "target": "Articular joints",
        "tissueTarget": "Articular joints",
        "evidence": [
          {
            "citationId": "debbi_2011_dosage",
            "title": "Efficacy of methylsulfonylmethane supplementation on osteoarthritis of the knee: a randomized controlled study",
            "authors": ["Debbi EM", "Agar G", "Fichman G", "Ziv YB", "Kardosh R", "Halperin N", "Elbaz A", "Beer Y", "Debi R"],
            "year": 2011,
            "journal": "BMC Complementary and Alternative Medicine",
            "doi": "10.1186/1472-6882-11-50",
            "pmid": "21708034",
            "studyType": "Randomized controlled trial",
            "evidenceLevel": "Level 2",
            "findings": "3.375g/day MSM in divided doses over 12 weeks produced significant WOMAC pain improvement in knee OA (n=49). No dose-comparison arm; minimum effective dose not established.",
            "methodology": "12-week OA RCT, 3.375g/day MSM as divided doses. Single dose level; no dose-response comparison."
          },
          {
            "citationId": "toguchi_2023_dosage",
            "title": "Effects of Methylsulfonylmethane Supplementation on Knee Pain in Mild Knee Pain Subjects: A Randomized, Double-Blind, Placebo-Controlled Trial",
            "authors": ["Toguchi A", "et al."],
            "year": 2023,
            "journal": "Nutrients",
            "doi": "10.3390/nu15153250",
            "pmid": "37447322",
            "studyType": "Randomized controlled trial",
            "evidenceLevel": "Level 2",
            "findings": "2000mg/day MSM as single daily dose over 12 weeks produced significant VAS pain improvement (n=88). 2g/day lower than the 3.375g used by Debbi 2011. No direct head-to-head dose comparison exists between these two trials.",
            "methodology": "12-week RCT in adults with mild knee pain. 2000mg MSM daily as single dose. No dose-comparison arm."
          }
        ]
      }
    ]
  },

  "citationMetrics": {
    "totalCitations": 8,
    "byEvidenceLevel": {
      "Level 1": 2,
      "Level 2": 4,
      "Level 3": 1,
      "Level 5": 3
    },
    "byStudyType": {
      "Randomized controlled trial": 2,
      "Network meta-analysis": 1,
      "Systematic review": 1,
      "Narrative review": 1,
      "Randomized pilot trial": 1,
      "Mechanistic observational": 1,
      "In vitro": 1
    },
    "keyNullFindings": [
      "Crawford 2019 (PMID 30986309): US military SR using GRADE — recommends AGAINST MSM for musculoskeletal pain (primary independent null evidence)",
      "Kalman 2012 (PMID 23013531): Exercise pilot n=8, p=0.080 — non-significant trend",
      "Chen 2025 (PMID 40425393): NMA GRADE Low — MSM ranks low among 23 dietary supplements for OA pain"
    ],
    "fundingSourceAssessment": "Debbi 2011 and Toguchi 2023 funding sources not fully characterized; possible industry involvement cannot be excluded. Crawford 2019 is US government/military-funded (independent). Industry influence may inflate positive findings from the two OA RCTs, paralleling the glucosamine funding bias issue."
  },

  "qualityAssurance": {
    "pipelineRunDate": "2026-03-06",
    "pipelineMode": "Mode 2 — Evidence Update",
    "verificationMethod": "PubMed MCP (get_article_metadata) batch PMID verification across multiple pipeline runs",
    "pmidsVerified": ["21708034", "37447322", "40425393", "30986309", "28300758", "23013531", "40507030", "38138558"],
    "excludedFromPriorFile": [
      "Kim 2006 — FABRICATED: No PubMed record found for any 'Kim 2006' MSM OA RCT; PMID 21708034 in prior file was misattributed — it belongs to Debbi 2011 (BMC CAM, knee OA RCT)",
      "Multiple citations from 2025-08-21 file version with unconfirmed PMIDs and schema violations — removed and replaced with verified sources"
    ],
    "provenanceDirectory": "supp-db-site/content/provenance/msm/",
    "schemaCorrectionsApplied": [
      "Field renamed: 'id' -> 'citationId' on all evidence items",
      "Field type corrected: 'keyFindings' (array) -> 'findings' (string) on all evidence items",
      "Field added: 'methodology' string on all evidence items",
      "Duplicate export block removed",
      "researchQualityScore corrected: 76 -> 45 (aligned with Tier 3 evidence base)",
      "Crawford 2019 (PMID 30986309) added as primary null evidence",
      "evidenceStrength.clinicalBenefits corrected: 'Moderate' -> 'Preliminary'"
    ]
  }
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[29] = msmEnhanced;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = msmEnhanced;
}
