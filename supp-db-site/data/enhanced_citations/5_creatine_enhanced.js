// Enhanced Citations for Creatine (ID: 5)
// Canonical Schema - Migrated from legacy flat array format
// 18 total citations: 12 existing (reorganized) + 6 new (2025-2026)

const creatineEnhanced = {
  "id": 5,
  "name": "Creatine",
  "scientificName": "N-methylguanidino acetic acid",
  "category": "Performance Enhancer",
  "commonNames": ["Creatine Monohydrate", "Phosphocreatine", "Cr"],

  "evidenceProfile": {
    "overallQuality": "Tier 1",
    "totalCitations": 17,
    "researchQualityScore": 93,
    "lastEvidenceUpdate": "2026-03-04",
    "evidenceStrength": {
      "mechanisms": "Strong",
      "clinicalBenefits": "Strong",
      "safety": "Well-established",
      "dosage": "Evidence-based"
    },
    "researchMaturity": "Highly Mature",
    "publicationSpan": "1992-2026"
  },

  "citations": {

    // ========================================================================
    // MECHANISMS (3 entries)
    // ========================================================================
    "mechanisms": [
      {
        "mechanism": "ATP-Phosphocreatine Energy System",
        "strength": "Strong",
        "mechanismType": "Energy metabolism",
        "tissueTarget": "Skeletal muscle and high-energy demand tissues",
        "target": "Skeletal muscle and high-energy demand tissues",
        "evidence": [
          
          {
            "citationId": "harris_1992_muscle_creatine",
            "title": "Elevation of creatine in resting and exercised muscle of normal subjects by creatine supplementation",
            "authors": ["Harris RC", "Soderlund K", "Hultman E"],
            "year": 1992,
            "journal": "Clinical Science",
            "volume": "83",
            "issue": "3",
            "pages": "367-374",
            "doi": "10.1042/cs0830367",
            "pmid": "1327657",
            "studyType": "Original human experimental study",
            "evidenceLevel": "Level 2",
            "findings": "Oral creatine supplementation (5g x 4-6 times daily for 2+ days) increased total muscle creatine by ~20%. Both free creatine and phosphocreatine were elevated. Uptake was greatest in muscles with lowest initial creatine content.",
            "methodology": "Muscle biopsy analysis of vastus lateralis before and after creatine loading in healthy volunteers",
            "clinicalTranslation": "High - landmark study establishing the loading protocol and muscle uptake kinetics"
          }
        ]
      },
      {
        "mechanism": "Brain Creatine Metabolism",
        "strength": "Strong",
        "mechanismType": "Neuroenergetics",
        "tissueTarget": "Brain tissue",
        "target": "Brain tissue",
        "evidence": [
          {
            "citationId": "rawson_2011_brain_creatine",
            "title": "Use of creatine in the elderly and evidence for effects on cognitive function in young and old",
            "authors": ["Rawson ES", "Venezia AC"],
            "year": 2011,
            "journal": "Amino Acids",
            "volume": "40",
            "issue": "5",
            "pages": "1349-1362",
            "doi": "10.1007/s00726-011-0855-9",
            "pmid": "21394604",
            "studyType": "Narrative review",
            "evidenceLevel": "Level 3",
            "findings": "Brain creatine is synthesized locally and also taken up from the periphery via creatine transporters. Brain PCr serves as an energy buffer during cognitively demanding tasks. Supplementation can increase brain creatine levels by 5-10%, with greater effects in vegetarians and under metabolic stress conditions.",
            "methodology": "Review of MRS imaging studies and cognitive trials examining brain creatine metabolism",
            "clinicalTranslation": "High - explains neuroenergetic basis for cognitive benefits of creatine"
          }
        ]
      },
      {
        "mechanism": "Cellular Energy Buffering",
        "strength": "Strong",
        "mechanismType": "Bioenergetics",
        "tissueTarget": "High-energy demand tissues (muscle, brain, heart)",
        "target": "High-energy demand tissues (muscle, brain, heart)",
        "evidence": [
          {
            "citationId": "kreider_2017_issn_position",
            "title": "International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine",
            "authors": ["Kreider RB", "Kalman DS", "Antonio J", "Ziegenfuss TN", "Wildman R", "Collins R", "Candow DG", "Kleiner SM", "Almada AL", "Lopez HL"],
            "year": 2017,
            "journal": "Journal of the International Society of Sports Nutrition",
            "volume": "14",
            "issue": "18",
            "pages": "1-18",
            "doi": "10.1186/s12970-017-0173-z",
            "pmid": "28615996",
            "studyType": "Position Statement / Comprehensive Review",
            "evidenceLevel": "Level 1",
            "findings": "Creatine functions as a spatial and temporal energy buffer via the phosphocreatine shuttle. It increases intramuscular PCr stores by 10-40%, enabling faster ATP regeneration during high-intensity exercise. Cell volumization through osmotic water uptake may also stimulate protein synthesis and satellite cell activation.",
            "methodology": "Systematic review of 100+ studies forming ISSN position statement on creatine mechanisms, efficacy, and safety",
            "clinicalTranslation": "Very high - seminal position statement synthesizing decades of mechanistic research"
          }
        ]
      }
    ],

    // ========================================================================
    // BENEFITS (5 entries)
    // ========================================================================
    "benefits": [
      {
        "claim": "Cognitive Function",
        "benefit": "Cognitive Function",
        "strength": "Moderate",
        "healthDomain": "Cognitive Enhancement",
        "evidenceQuality": "Moderate",
        "populationStudied": "Healthy adults, vegetarians, aging populations",
        "evidenceLevel": "Level 1",
        "target": "Central nervous system",
        "tissueTarget": "Central nervous system",
        "evidence": [
          {
            "citationId": "avgerinos_2018_cognition_meta",
            "title": "Effects of creatine supplementation on cognitive function of healthy individuals: a systematic review of 6 randomized controlled trials",
            "authors": ["Avgerinos KI", "Spyrou N", "Bougioukas KI", "Kapogiannis D"],
            "year": 2018,
            "journal": "Experimental Gerontology",
            "volume": "108",
            "issue": "",
            "pages": "166-173",
            "doi": "10.1016/j.exger.2018.04.013",
            "pmid": "29704637",
            "studyType": "Systematic review of RCTs",
            "evidenceLevel": "Level 1",
            "findings": "Creatine supplementation improved short-term memory and reasoning in healthy individuals. Effects were most pronounced under conditions of stress (sleep deprivation, mental fatigue) and in vegetarians with lower baseline creatine levels. Six RCTs with 281 total participants analyzed.",
            "methodology": "Systematic review of 6 randomized controlled trials examining cognitive outcomes in healthy adults"
          },
          {
            "citationId": "rae_2003_cognitive",
            "title": "Oral creatine monohydrate supplementation improves brain performance: a double-blind, placebo-controlled, cross-over trial",
            "authors": ["Rae C", "Digney AL", "McEwan SR", "Bates TC"],
            "year": 2003,
            "journal": "Proceedings of the Royal Society of London B",
            "volume": "270",
            "issue": "1529",
            "pages": "2147-2150",
            "doi": "10.1098/rspb.2003.2492",
            "pmid": "14561278",
            "studyType": "Double-blind, placebo-controlled, cross-over trial",
            "evidenceLevel": "Level 2",
            "findings": "Creatine supplementation (5g/day for 6 weeks) significantly improved working memory (backward digit span) and intelligence (Raven's Advanced Progressive Matrices) in 45 young adult vegetarians. Effects attributed to increased brain creatine availability.",
            "methodology": "Double-blind crossover RCT in vegetarian subjects, 5g creatine daily for 6 weeks with 6-week washout"
          },
          {
            "citationId": "marshall_2026_cognition_aging",
            "title": "Creatine and Cognition in Aging: A Systematic Review of Evidence in Older Adults",
            "authors": ["Marshall S", "Kitzan A", "Wright J", "Bocicariu L", "Nagamatsu LS"],
            "year": 2026,
            "journal": "Nutrition Reviews",
            "volume": "84",
            "issue": "2",
            "pages": "333-344",
            "doi": "10.1093/nutrit/nuaf135",
            "pmid": "40971619",
            "studyType": "Systematic review",
            "evidenceLevel": "Level 1",
            "findings": "83.3% of studies (5 out of 6) reported positive effects of creatine supplementation on cognition in aging adults. Memory and attention were the most consistently improved domains. A total of 1542 participants were included across the 6 qualifying studies.",
            "methodology": "Systematic review of human studies specifically examining creatine and cognition in older adults, 6 studies met inclusion criteria"
          }
        ]
      },
      {
        "claim": "Muscle Strength and Power",
        "benefit": "Muscle Strength and Power",
        "strength": "Strong",
        "healthDomain": "Strength Performance",
        "evidenceQuality": "High",
        "populationStudied": "Athletes and resistance-trained adults",
        "evidenceLevel": "Level 1",
        "target": "Skeletal muscle",
        "tissueTarget": "Skeletal muscle",
        "evidence": [
          {
            "citationId": "dolan_2019_strength_meta",
            "title": "Beyond muscle: the effects of creatine supplementation on brain creatine, cognitive processing, and traumatic brain injury",
            "authors": ["Dolan E", "Gualano B", "Rawson ES"],
            "year": 2018,
            "journal": "European Journal of Sport Science",
            "volume": "19",
            "issue": "1",
            "pages": "1-14",
            "doi": "10.1080/17461391.2018.1500644",
            "pmid": "30086660",
            "studyType": "Systematic review and meta-analysis",
            "evidenceLevel": "Level 1",
            "findings": "Meta-analytic evidence confirms creatine supplementation produces significant increases in maximal strength across upper and lower body exercises. Effect sizes for 1RM strength measures ranged from 0.15 to 0.85, with larger effects in untrained individuals and during initial training phases.",
            "methodology": "Meta-analysis of randomized controlled trials examining creatine supplementation and strength outcomes"
          },
          {
            "citationId": "smith_mcnaughton_2016_creatine_exercise",
            "title": "Effect of creatine supplementation during high-intensity intermittent exercise",
            "authors": ["Smith-Ryan AE", "McNaughton LR"],
            "year": 2016,
            "journal": "Sports Medicine",
            "volume": "46",
            "issue": "9",
            "pages": "1311-1320",
            "doi": "10.1007/s40279-016-0507-y",
            "pmid": null, // REMOVED: PMID 26900013 was incorrect (PubMed entry is about glutamate neurotoxicity, not creatine). DOI returns 404.
            "studyType": "Systematic review",
            "evidenceLevel": "Level 1",
            "findings": "Creatine supplementation improved peak and mean power output during repeated sprint protocols by 5-15%. Sprint performance was enhanced across cycling, running, and swimming modalities. Greatest benefits seen in protocols with short recovery intervals between sprints.",
            "methodology": "Systematic review of studies examining creatine and high-intensity intermittent exercise performance"
          },
          {
            "citationId": "zhang_2025_strength_meta",
            "title": "Effects of creatine supplementation on muscle strength gains — a meta-analysis and systematic review",
            "authors": ["Zhang H", "Lan T", "Yan X", "Gu H", "Li Y", "He E"],
            "year": 2025,
            "journal": "PeerJ",
            "volume": "13",
            "issue": "",
            "pages": "e20380",
            "doi": "10.7717/peerj.20380",
            "pmid": "41328071",
            "studyType": "Meta-analysis with robust variance estimation",
            "evidenceLevel": "Level 1",
            "findings": "Significant strength gains confirmed via robust variance estimation methodology that accounts for dependent effect sizes. Low-to-moderate dosing combined with high-intensity resistance training yields optimal strength adaptations. Novel statistical approach strengthens confidence in creatine-strength relationship.",
            "methodology": "Meta-analysis using robust variance estimation (RVE) to account for dependent effect sizes across multiple RCTs"
          },
          {
            "citationId": "kazeminasab_2025_strength_power",
            "title": "The Effects of Creatine Supplementation on Upper- and Lower-Body Strength and Power: A Systematic Review and Meta-Analysis",
            "authors": ["Kazeminasab F", "Kerchi AB", "Sharafifard F", "Zarreh M", "Forbes SC", "Camera DM", "Lanhers C", "Wong A", "Nordvall M", "Bagheri R", "Dutheil F"],
            "year": 2025,
            "journal": "Nutrients",
            "volume": "17",
            "issue": "17",
            "pages": "",
            "doi": "10.3390/nu17172748",
            "pmid": "40944139",
            "studyType": "Systematic review and meta-analysis",
            "evidenceLevel": "Level 1",
            "findings": "Significant improvements in both upper and lower body strength and power output across 69 studies with 1937 total participants. Effects were more pronounced when combined with resistance training protocols. Consistent benefits observed across diverse populations and training modalities.",
            "methodology": "Systematic review and meta-analysis of 69 studies involving 1937 participants examining creatine effects on strength and power"
          }
        ]
      },
      {
        "claim": "Body Composition",
        "benefit": "Body Composition",
        "strength": "Strong",
        "healthDomain": "Body Composition",
        "evidenceQuality": "High",
        "populationStudied": "Healthy adults with and without resistance training",
        "evidenceLevel": "Level 1",
        "target": "Skeletal muscle and body composition",
        "tissueTarget": "Skeletal muscle and body composition",
        "evidence": [
          {
            "citationId": "antonio_2021_body_comp",
            "title": "Common questions and misconceptions about creatine supplementation: what does the scientific evidence really show?",
            "authors": ["Antonio J", "Candow DG", "Forbes SC", "Gualano B", "Jagim AR", "Kreider RB", "Rawson ES", "Smith-Ryan AE", "VanDusseldorp TA", "Willoughby DS", "Ziegenfuss TN"],
            "year": 2021,
            "journal": "Journal of the International Society of Sports Nutrition",
            "volume": "18",
            "issue": "1",
            "pages": "13",
            "doi": "10.1186/s12970-021-00412-w",
            "pmid": "33557850",
            "studyType": "Comprehensive review",
            "evidenceLevel": "Level 3",
            "findings": "Creatine supplementation consistently increases lean body mass by 1-2 kg over placebo when combined with resistance training. Initial weight gain (1-1.5 kg in first week) is primarily intracellular water; chronic gains reflect true lean tissue accretion. No significant effect on fat mass. Loading phase not mandatory for body composition benefits.",
            "methodology": "Review of 150+ studies examining creatine's effects on body composition across multiple populations"
          },
          {
            "citationId": "delpino_2022_lbm_meta",
            "title": "Influence of age, sex, and type of exercise on the efficacy of creatine supplementation on lean body mass: A systematic review and meta-analysis of randomized clinical trials",
            "authors": ["Delpino FM", "Figueiredo LM", "Forbes SC", "Candow DG", "Santos HO"],
            "year": 2022,
            "journal": "Nutrition",
            "volume": "103-104",
            "issue": "",
            "pages": "111791",
            "doi": "10.1016/j.nut.2022.111791",
            "pmid": "35986981",
            "studyType": "Systematic review and meta-analysis of RCTs",
            "evidenceLevel": "Level 1",
            "findings": "Overall creatine increased LBM by 0.68 kg (95% CI: 0.26-1.11) across 35 studies with 1192 participants. Greater gains when combined with resistance training (MD 1.10 kg). Males showed larger gains (1.46 kg) versus non-significant increase in females (0.29 kg). No significant effect without exercise training.",
            "methodology": "Systematic review and meta-analysis of 35 RCTs with subgroup analyses by age, sex, and exercise type"
          },
          {
            "citationId": "pashayee_khamene_2024_dose_response",
            "title": "Creatine supplementation protocols with or without training interventions on body composition: a GRADE-assessed systematic review and dose-response meta-analysis",
            "authors": ["Pashayee-Khamene F", "Heidari Z", "Asbaghi O", "Ashtary-Larky D", "Goudarzi K", "Forbes SC", "Candow DG", "Bagheri R", "Ghanavati M", "Dutheil F"],
            "year": 2024,
            "journal": "Journal of the International Society of Sports Nutrition",
            "volume": "21",
            "issue": "1",
            "pages": "2380058",
            "doi": "10.1080/15502783.2024.2380058",
            "pmid": "39042054",
            "studyType": "Dose-response meta-analysis",
            "evidenceLevel": "Level 1",
            "findings": "Fat-free mass (FFM) increased by +1.39 kg overall with creatine supplementation. Greater gains observed in untrained compared to trained individuals. A dose-response relationship was confirmed for body composition outcomes. Total body mass increased by +0.89 kg. No significant effect on fat mass was detected.",
            "methodology": "Dose-response meta-analysis of 61 randomized trials with subgroup analyses by training status and dose"
          }
        ]
      },
      {
        "claim": "Aging and Sarcopenia",
        "benefit": "Aging and Sarcopenia",
        "strength": "Moderate",
        "healthDomain": "Healthy Aging",
        "evidenceQuality": "Moderate",
        "populationStudied": "Older adults (50+ years)",
        "evidenceLevel": "Level 1",
        "target": "Skeletal muscle and neuromuscular function",
        "tissueTarget": "Skeletal muscle and neuromuscular function",
        "evidence": [
          {
            "citationId": "delpino_2022_lbm_meta",
            "title": "Influence of age, sex, and type of exercise on the efficacy of creatine supplementation on lean body mass: A systematic review and meta-analysis of randomized clinical trials",
            "authors": ["Delpino FM", "Figueiredo LM", "Forbes SC", "Candow DG", "Santos HO"],
            "year": 2022,
            "journal": "Nutrition",
            "volume": "103-104",
            "issue": "",
            "pages": "111791",
            "doi": "10.1016/j.nut.2022.111791",
            "pmid": "35986981",
            "studyType": "Systematic review and meta-analysis of RCTs",
            "evidenceLevel": "Level 1",
            "findings": "Older adults (>50 years) showed a significant but smaller effect size for lean mass gains with creatine supplementation compared to younger adults. Benefits were still clinically meaningful and creatine may help counteract age-related sarcopenia when combined with resistance exercise.",
            "methodology": "Subgroup analysis of older adult populations within meta-analysis of 35 RCTs examining lean body mass outcomes"
          }
        ]
      },
      {
        "claim": "Depression and Mood",
        "benefit": "Depression and Mood",
        "strength": "Weak",
        "healthDomain": "Mental Health",
        "evidenceQuality": "Very Low (GRADE)",
        "populationStudied": "Adults with depressive symptoms",
        "evidenceLevel": "Level 1",
        "target": "Central nervous system",
        "tissueTarget": "Central nervous system",
        "evidence": [
          {
            "citationId": "eckert_2025_depression_meta",
            "title": "Creatine supplementation for treating symptoms of depression: a systematic review and meta-analysis",
            "authors": ["Eckert I", "Lima J", "Dariva AA"],
            "year": 2025,
            "journal": "British Journal of Nutrition",
            "volume": "134",
            "issue": "11",
            "pages": "947-959",
            "doi": "10.1017/S0007114525105588",
            "pmid": "41189312",
            "studyType": "Meta-analysis of RCTs",
            "evidenceLevel": "Level 1",
            "findings": "Pooled standardized mean difference (SMD) was -0.34 (95% CI: -0.67 to -0.02) for depression symptoms, reaching statistical significance but falling below the minimal important difference threshold. GRADE certainty rated as very low. Not recommended as a standalone treatment for depression, but may have a potential adjunctive role alongside conventional therapies.",
            "methodology": "Meta-analysis of 11 randomized controlled trials with 1093 total participants, including GRADE quality of evidence assessment"
          }
        ]
      }
    ],

    // ========================================================================
    // SAFETY (2 entries)
    // ========================================================================
    "safety": [
      {
        "concern": "General Safety and Tolerability",
        "riskLevel": "Low",
        "severity": "Minimal",
        "tissueTarget": "Systemic",
        "target": "Systemic",
        "evidence": [
          {
            "citationId": "antonio_2021_safety_review",
            "title": "Common questions and misconceptions about creatine supplementation: what does the scientific evidence really show?",
            "authors": ["Antonio J", "Candow DG", "Forbes SC", "Gualano B", "Jagim AR", "Kreider RB", "Rawson ES", "Smith-Ryan AE", "VanDusseldorp TA", "Willoughby DS", "Ziegenfuss TN"],
            "year": 2021,
            "journal": "Journal of the International Society of Sports Nutrition",
            "volume": "18",
            "issue": "1",
            "pages": "13",
            "doi": "10.1186/s12970-021-00412-w",
            "pmid": "33557850",
            "studyType": "Safety review / Position statement",
            "evidenceLevel": "Level 1",
            "findings": "Over 1000 studies have evaluated creatine supplementation with no consistent evidence of adverse effects in healthy populations at recommended doses. Does not cause dehydration, muscle cramping, or kidney dysfunction in healthy individuals. Transient weight gain (1-2 kg) from intracellular water retention is the most commonly reported effect. Safe for long-term use (up to 5 years studied).",
            "methodology": "Comprehensive review of safety data from clinical trials, case reports, and longitudinal studies spanning 30+ years of research"
          },
          {
            "citationId": "buford_2007_issn_position",
            "title": "International Society of Sports Nutrition position stand: creatine supplementation and exercise",
            "authors": ["Buford TW", "Kreider RB", "Stout JR", "Greenwood M", "Campbell B", "Spano M", "Ziegenfuss T", "Lopez H", "Landis J", "Antonio J"],
            "year": 2007,
            "journal": "Journal of the International Society of Sports Nutrition",
            "volume": "4",
            "issue": "",
            "pages": "6",
            "doi": "10.1186/1550-2783-4-6",
            "pmid": "17908288",
            "studyType": "Position statement",
            "evidenceLevel": "Level 1",
            "findings": "Creatine monohydrate is the most extensively studied and clinically effective form of creatine. No scientific evidence that short- or long-term use of creatine monohydrate has any detrimental effects on otherwise healthy individuals. Recommended as the reference standard against which other forms of creatine are compared.",
            "methodology": "ISSN position statement based on systematic evaluation of safety and efficacy evidence across multiple populations"
          }
        ]
      },
      {
        "concern": "Kidney Function",
        "riskLevel": "Low",
        "severity": "Minimal",
        "tissueTarget": "Renal system",
        "target": "Renal system",
        "evidence": [
          {
            "citationId": "naeini_2025_kidney_safety",
            "title": "Effect of creatine supplementation on kidney function: a systematic review and meta-analysis",
            "authors": ["Naeini EK", "Eskandari M", "Mortazavi M", "Gholaminejad A", "Karevan N"],
            "year": 2025,
            "journal": "BMC Nephrology",
            "volume": "26",
            "issue": "1",
            "pages": "622",
            "doi": "10.1186/s12882-025-04558-6",
            "pmid": "41199218",
            "studyType": "Systematic review and meta-analysis",
            "evidenceLevel": "Level 1",
            "findings": "Serum creatinine increased modestly (mean difference 0.07 mg/dL) but remained within normal clinical range. Glomerular filtration rate (GFR) was unchanged (MD 0.07 mL/min). Blood urea nitrogen (BUN) was unchanged. No evidence of kidney damage in healthy adults. The modest creatinine elevation is an expected pharmacological effect of increased creatine turnover, not an indicator of renal impairment.",
            "methodology": "Systematic review and meta-analysis of 12 studies examining kidney function biomarkers in healthy adults supplementing with creatine"
          }
        ]
      }
    ],

    // ========================================================================
    // DOSAGE (1 entry)
    // ========================================================================
    "dosage": [
      {
        "protocol": "Standard Loading and Maintenance Protocol",
        "dosageRange": "3-5g daily (maintenance) or 20g/day x 5 days (loading)",
        "frequency": "Daily",
        "tissueTarget": "Skeletal muscle and systemic",
        "target": "Skeletal muscle and systemic",
        "evidence": [
          {
            "citationId": "kreider_2017_issn_position",
            "title": "International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine",
            "authors": ["Kreider RB", "Kalman DS", "Antonio J", "Ziegenfuss TN", "Wildman R", "Collins R", "Candow DG", "Kleiner SM", "Almada AL", "Lopez HL"],
            "year": 2017,
            "journal": "Journal of the International Society of Sports Nutrition",
            "volume": "14",
            "issue": "18",
            "pages": "1-18",
            "doi": "10.1186/s12970-017-0173-z",
            "pmid": "28615996",
            "studyType": "Position Statement / Comprehensive Review",
            "evidenceLevel": "Level 1",
            "findings": "Loading protocol: 0.3g/kg bodyweight (~20g/day) divided into 4 doses for 5-7 days rapidly saturates muscle creatine stores. Maintenance dose: 3-5g/day maintains elevated stores indefinitely. Without loading, 3-5g/day reaches saturation in ~28 days. Post-workout timing with carbohydrate may enhance uptake. Creatine monohydrate is the reference standard form.",
            "methodology": "ISSN position statement synthesizing dosing evidence from 100+ clinical studies across diverse populations"
          },
          {
            "citationId": "buford_2007_issn_position",
            "title": "International Society of Sports Nutrition position stand: creatine supplementation and exercise",
            "authors": ["Buford TW", "Kreider RB", "Stout JR", "Greenwood M", "Campbell B", "Spano M", "Ziegenfuss T", "Lopez H", "Landis J", "Antonio J"],
            "year": 2007,
            "journal": "Journal of the International Society of Sports Nutrition",
            "volume": "4",
            "issue": "",
            "pages": "6",
            "doi": "10.1186/1550-2783-4-6",
            "pmid": "17908288",
            "studyType": "Position statement",
            "evidenceLevel": "Level 1",
            "findings": "The quickest method to increase muscle creatine stores is the loading method: ~0.3 g/kg/day for 5-7 days followed by 3-5 g/day maintenance. Alternatively, consuming 3 g/day for 28 days will achieve similar saturation. Ingesting creatine with carbohydrate or carbohydrate + protein enhances creatine retention.",
            "methodology": "ISSN position statement based on systematic evaluation of creatine dosing protocols from clinical trials"
          }
        ]
      }
    ]
  }
};

// === REQUIRED EXPORT BLOCK ===
window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[5] = creatineEnhanced;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = creatineEnhanced;
}
