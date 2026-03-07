// Enhanced Citations for Astaxanthin (ID: 46)
// Powerful carotenoid antioxidant — ketocarotenoid from Haematococcus pluvialis with research on cardiovascular, skin, eye, and exercise domains
// ALL citations verified against PubMed — Last updated: 2026-03-07

const astaxanthinEnhanced = {
  "id": 46,
  "name": "Astaxanthin",
  "scientificName": "3,3'-dihydroxy-beta,beta'-carotene-4,4'-dione (from Haematococcus pluvialis)",
  "category": "Antioxidants",
  "evidenceProfile": {
    "overallQuality": "Tier 2",
    "totalCitations": 8,
    "researchQualityScore": 65,
    "lastEvidenceUpdate": "2026-03-07",
    "evidenceStrength": {
      "mechanisms": "Strong",
      "clinicalBenefits": "Moderate",
      "safety": "Good",
      "dosage": "Partially established"
    },
    "researchMaturity": "Developing",
    "publicationSpan": "2012-2025",
    "keyFindings": "Potent lipid-soluble ketocarotenoid with strong antioxidant capacity; systematic reviews support skin health benefits (moisture, elasticity) at 3-6mg/day; emerging RCT evidence for cardiovascular oxidative stress reduction and eye strain relief; exercise performance data equivocal in humans despite positive animal studies"
  },
  "citations": {
    "benefits": [
      {
        "healthDomain": "Skin Health & Anti-Aging",
        "specificClaim": "Oral astaxanthin supplementation improves skin moisture content and elasticity in photoaged skin",
        "claim": "Oral astaxanthin supplementation improves skin moisture content and elasticity in photoaged skin",
        "strength": "Moderate",
        "evidenceQuality": "Moderate",
        "replicationStatus": "Meta-analysis of 9 RCTs confirms moisture and elasticity improvements",
        "tissueTarget": "Skin (dermis and epidermis)",
        "target": "Skin (dermis and epidermis)",
        "evidence": [
          {
            "title": "Systematic Review and Meta-Analysis on the Effects of Astaxanthin on Human Skin Ageing",
            "authors": "Zhou X, Cao Q, Orfila C, Zhao J, Zhang L",
            "journal": "Nutrients",
            "year": 2021,
            "doi": "10.3390/nu13092917",
            "pmid": "34578794",
            "studyType": "Systematic Review and Meta-Analysis",
            "sampleSize": "9 RCTs + 2 open-label studies (11 total)",
            "duration": "Variable (4-16 weeks across studies)",
            "keyFindings": [
              "Oral ASX significantly restored moisture content (SMD=0.53; 95% CI 0.05-1.01; p=0.03)",
              "Significantly improved elasticity (SMD=0.77; 95% CI 0.19-1.35; p=0.009)",
              "Did not significantly decrease wrinkle depth (SMD=-0.26; 95% CI -0.58 to 0.06; p=0.11)",
              "Topical and oral-topical applications also showed protective effects on skin ageing"
            ],
            "effectSize": "Small to Moderate (SMD 0.53-0.77)",
            "pValue": "0.03 (moisture), 0.009 (elasticity)",
            "confidenceInterval": "95%"
          },
          {
            "title": "Effects of Astaxanthin Supplementation on Skin Health: A Systematic Review of Clinical Studies",
            "authors": "Ng QX, De Deyn MLZQ, Loke W, Foo NX, Chan HW, Yeo WS",
            "journal": "Journal of Dietary Supplements",
            "year": 2020,
            "doi": "10.1080/19390211.2020.1739187",
            "pmid": "32202443",
            "studyType": "Systematic Review",
            "sampleSize": "11 clinical studies reviewed",
            "duration": "Variable across studies",
            "keyFindings": [
              "6 randomized placebo-controlled double-blind trials plus 5 open-label studies reviewed",
              "AST supplementation improved skin texture, appearance (wrinkles), and moisture content",
              "AST appeared to protect against UV-induced skin damage",
              "Benefits observed at 3-6 mg/day dosage range",
              "No serious adverse events in any study; most studies in healthy Japanese females"
            ],
            "effectSize": "Moderate",
            "pValue": "Variable across studies",
            "confidenceInterval": "95%"
          }
        ]
      },
      {
        "healthDomain": "Cardiovascular Health",
        "specificClaim": "Improves oxidative stress biomarkers and reduces lipid levels in cardiovascular disease patients",
        "claim": "Improves oxidative stress biomarkers and reduces lipid levels in cardiovascular disease patients",
        "strength": "Moderate",
        "evidenceQuality": "Moderate",
        "replicationStatus": "Two independent RCTs in cardiac patients (CAD and heart failure)",
        "tissueTarget": "Cardiovascular system",
        "target": "Cardiovascular system",
        "evidence": [
          {
            "title": "Impact of astaxanthin on oxidative markers, uric acid, and clinical symptoms in heart failure: a randomized clinical trial",
            "authors": "Mohammadi SG, Shafie D, Feizi A, Bagherniya M, Ahmadi AR, Kafeshani M",
            "journal": "BMC Cardiovascular Disorders",
            "year": 2025,
            "doi": "10.1186/s12872-025-05260-z",
            "pmid": "41162864",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "80 heart failure patients",
            "duration": "8 weeks",
            "keyFindings": [
              "Significant increase in total antioxidant capacity (TAC) vs placebo (0.12 vs -0.04 mmol/L, p=0.002)",
              "Significant increase in SOD levels (156.92 vs 36.14 U/mL, p<0.001)",
              "Significant reduction in MDA (-2.19 vs -0.68 nmol/L, p<0.001)",
              "Significant reduction in serum uric acid (-1.82 vs -0.63 mg/dl, p=0.003)",
              "Significant improvements in dyspnea and fatigue symptoms (p<0.001)"
            ],
            "effectSize": "Moderate to Large",
            "pValue": "<0.001 (SOD, MDA), 0.002 (TAC), 0.003 (UA)",
            "confidenceInterval": "95%"
          },
          {
            "title": "The effects of astaxanthin supplementation on lipid profile in patients with coronary artery disease",
            "authors": "Heidari M et al.",
            "journal": "Frontiers in Nutrition",
            "year": 2023,
            "doi": "10.3389/fnut.2023.1104169",
            "pmid": "37051124",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "50 patients with coronary artery disease",
            "duration": "8 weeks",
            "keyFindings": [
              "Significantly reduced total cholesterol in astaxanthin group vs placebo",
              "Significantly reduced LDL-cholesterol levels",
              "12 mg/day astaxanthin supplementation was the effective dose",
              "Improvements in lipid profile support cardiovascular protective effects"
            ],
            "effectSize": "Moderate",
            "pValue": "<0.05",
            "confidenceInterval": "95%"
          }
        ]
      },
      {
        "healthDomain": "Eye Health / Digital Eye Strain",
        "specificClaim": "Reduces chronic and acute digital eye strain symptoms and improves visual performance",
        "claim": "Reduces chronic and acute digital eye strain symptoms and improves visual performance",
        "strength": "Moderate",
        "evidenceQuality": "Moderate",
        "replicationStatus": "Single well-designed RCT in children; adult data limited",
        "tissueTarget": "Retina and ciliary muscle",
        "target": "Retina and ciliary muscle",
        "evidence": [
          {
            "title": "Astaxanthin (AstaReal) Improved Acute and Chronic Digital Eye Strain in Children: A Randomized Double-Blind Placebo-Controlled Trial",
            "authors": "Hecht KA, Marwah M, Wood V, Nishida Y, Bach AE, Gerson J, Hom MM, Schnackenberg J, Raote S, Srivastava S, Negi P, Caston E",
            "journal": "Advances in Therapy",
            "year": 2025,
            "doi": "10.1007/s12325-025-03125-7",
            "pmid": "40014233",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "64 children aged 10-14 years with ≥4h daily screen time",
            "duration": "84 days",
            "keyFindings": [
              "CVS-Q scores improved significantly after 84 days (-4.00 vs -1.72, p<0.0001 vs p<0.05), 20% between-group difference",
              "Visual fatigue Likert scale 27% better in astaxanthin group (11.55 vs 15.78, p=0.01)",
              "Stereopsis improved significantly after acute visual load at days 28 and 84 (p<0.05, p<0.0001)",
              "Pupillary light reflex improved after 84 days (p<0.05 vs placebo)",
              "Tear production increased at days 14, 56, and 84 (p<0.05 to p<0.001 vs baseline)",
              "4 mg/day dose was effective and well-tolerated"
            ],
            "effectSize": "Moderate (20-27% improvement)",
            "pValue": "<0.0001 (CVS-Q), 0.01 (VFLS)",
            "confidenceInterval": "95%"
          }
        ]
      },
      {
        "healthDomain": "Exercise-Induced Oxidative Stress",
        "specificClaim": "May attenuate exercise-induced inflammation and occupation-related oxidative stress in active populations",
        "claim": "May attenuate exercise-induced inflammation and occupation-related oxidative stress in active populations",
        "strength": "Weak",
        "evidenceQuality": "Low-Moderate",
        "replicationStatus": "Two RCTs with mixed results; human evidence equivocal per review",
        "tissueTarget": "Skeletal muscle and systemic inflammation",
        "target": "Skeletal muscle and systemic inflammation",
        "evidence": [
          {
            "title": "Impact of astaxanthin supplementation on markers of cardiometabolic health and tactical performance among firefighters",
            "authors": "Gonzalez DE, Dickerson BL, Johnson SE, Woodruff KE, Leonard M, Yoo C, Ko J, Xing D, Martinez V, Kendra J, Estes L, Sowinski RJ, Rasmussen CJ, Martin SE, Kreider RB",
            "journal": "Journal of the International Society of Sports Nutrition",
            "year": 2024,
            "doi": "10.1080/15502783.2024.2427751",
            "pmid": "39568140",
            "studyType": "Randomized Controlled Trial (Crossover)",
            "sampleSize": "15 male career firefighters",
            "duration": "4 weeks per arm",
            "keyFindings": [
              "AX supplementation lessened inflammatory response to maximal exercise test",
              "Attenuated increases in IL-1β, cortisol, and uric acid after fire suppressive activities vs placebo",
              "Most effects were within-groups rather than between-groups",
              "Evidence of increased ventilatory anaerobic threshold",
              "No significant effect on fasting oxidative stress markers, blood lipids, or fire ground test performance"
            ],
            "effectSize": "Small",
            "pValue": "Mixed (within-group significant, between-group largely non-significant)",
            "confidenceInterval": "95%"
          },
          {
            "title": "Effect of astaxanthin supplementation on muscle damage and oxidative stress markers in elite young soccer players",
            "authors": "Djordjevic B, Baralic I, Kotur-Stevuljevic J, Stefanovic A, Ivanisevic J, Radivojevic N, Andjelkovic M, Dikic N",
            "journal": "Journal of Sports Medicine and Physical Fitness",
            "year": 2012,
            "doi": "",
            "pmid": "22828460",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "32 male elite soccer players",
            "duration": "90 days supplementation + acute exercise bout",
            "keyFindings": [
              "Post-exercise CK and AST levels significantly lower in astaxanthin group vs placebo (p<0.05)",
              "Superoxide anion increase after exercise reached significance only in placebo group (exercise × supplementation, p<0.05)",
              "TAS levels decreased post-exercise only in placebo group (p<0.01)",
              "TBARS and AOPP levels did not change throughout the study",
              "Suggests astaxanthin could prevent exercise-induced free radical production"
            ],
            "effectSize": "Moderate (for CK/AST markers)",
            "pValue": "<0.05 (CK, AST between groups)",
            "confidenceInterval": "95%"
          }
        ]
      }
    ],
    "safety": [
      {
        "safetyAspect": "General Tolerability",
        "riskLevel": "Low",
        "claim": "Well tolerated across multiple RCTs at doses of 4-20 mg/day with no serious adverse events",
        "tissueTarget": "Multiple systems",
        "target": "Multiple systems",
        "evidence": [
          {
            "title": "Effects of Astaxanthin Supplementation on Skin Health: A Systematic Review of Clinical Studies",
            "authors": "Ng QX, De Deyn MLZQ, Loke W, Foo NX, Chan HW, Yeo WS",
            "journal": "Journal of Dietary Supplements",
            "year": 2020,
            "doi": "10.1080/19390211.2020.1739187",
            "pmid": "32202443",
            "studyType": "Systematic Review",
            "sampleSize": "11 clinical studies",
            "duration": "Variable",
            "keyFindings": [
              "No serious adverse events reported in any of the 11 clinical studies reviewed",
              "Well tolerated at 3-6 mg/day for skin health applications",
              "No clinically significant changes in laboratory safety parameters"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          },
          {
            "title": "Impact of astaxanthin on oxidative markers, uric acid, and clinical symptoms in heart failure: a randomized clinical trial",
            "authors": "Mohammadi SG, Shafie D, Feizi A, Bagherniya M, Ahmadi AR, Kafeshani M",
            "journal": "BMC Cardiovascular Disorders",
            "year": 2025,
            "doi": "10.1186/s12872-025-05260-z",
            "pmid": "41162864",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "80 heart failure patients",
            "duration": "8 weeks",
            "keyFindings": [
              "20 mg/day well tolerated in heart failure patients over 8 weeks",
              "No serious adverse events reported at this higher dose",
              "Safe even in a medically vulnerable population (heart failure)"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      },
      {
        "safetyAspect": "Carotenoid Interaction and Accumulation",
        "riskLevel": "Low",
        "claim": "As a lipid-soluble carotenoid, astaxanthin may compete with other carotenoids for absorption; no pro-oxidant activity observed unlike beta-carotene",
        "tissueTarget": "Gastrointestinal and hepatic system",
        "target": "Gastrointestinal and hepatic system",
        "evidence": [
          {
            "title": "Astaxanthin in Exercise Metabolism, Performance and Recovery: A Review",
            "authors": "Brown DR, Gough LA, Deb SK, Sparks SA, McNaughton LR",
            "journal": "Frontiers in Nutrition",
            "year": 2018,
            "doi": "10.3389/fnut.2017.00076",
            "pmid": "29404334",
            "studyType": "Review",
            "sampleSize": "N/A",
            "duration": "N/A",
            "keyFindings": [
              "Astaxanthin is a lipid-soluble ketocarotenoid from Haematococcus pluvialis",
              "Unlike beta-carotene, astaxanthin does not exhibit pro-oxidant activity at high concentrations",
              "Unique molecular structure spans the cell membrane bilayer, providing superior antioxidant protection",
              "Generally recognized as safe (GRAS) status supports favorable safety profile"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      }
    ],
    "mechanisms": [
      {
        "mechanism": "Potent lipid-peroxyl radical scavenging and membrane-spanning antioxidant activity",
        "claim": "Potent lipid-peroxyl radical scavenging and membrane-spanning antioxidant activity",
        "mechanismType": "Antioxidant defense",
        "strength": "Strong",
        "tissueTarget": "Cell membranes (all tissues)",
        "target": "Cell membranes (all tissues)",
        "evidence": [
          {
            "title": "Astaxanthin in Exercise Metabolism, Performance and Recovery: A Review",
            "authors": "Brown DR, Gough LA, Deb SK, Sparks SA, McNaughton LR",
            "journal": "Frontiers in Nutrition",
            "year": 2018,
            "doi": "10.3389/fnut.2017.00076",
            "pmid": "29404334",
            "studyType": "Review",
            "sampleSize": "N/A",
            "duration": "N/A",
            "keyFindings": [
              "Astaxanthin is approximately 10x more potent than other carotenoids (beta-carotene, zeaxanthin) as singlet oxygen quencher",
              "Unique polar-nonpolar-polar structure allows it to span the entire lipid bilayer membrane",
              "Scavenges reactive oxygen and nitrogen species (RONS) at both membrane surfaces simultaneously",
              "Does not become a pro-oxidant at high concentrations unlike other carotenoids",
              "Improves indices of exercise metabolism and recovery in animal models via antioxidant mechanisms"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      },
      {
        "mechanism": "Anti-inflammatory effects via NF-kB modulation and cytokine regulation",
        "claim": "Anti-inflammatory effects via NF-kB modulation and cytokine regulation",
        "mechanismType": "Anti-inflammatory pathway",
        "strength": "Moderate",
        "tissueTarget": "Immune system and vascular endothelium",
        "target": "Immune system and vascular endothelium",
        "evidence": [
          {
            "title": "Impact of astaxanthin supplementation on markers of cardiometabolic health and tactical performance among firefighters",
            "authors": "Gonzalez DE, Dickerson BL, Johnson SE, Woodruff KE, Leonard M, Yoo C, Ko J, Xing D, Martinez V, Kendra J, Estes L, Sowinski RJ, Rasmussen CJ, Martin SE, Kreider RB",
            "journal": "Journal of the International Society of Sports Nutrition",
            "year": 2024,
            "doi": "10.1080/15502783.2024.2427751",
            "pmid": "39568140",
            "studyType": "Randomized Controlled Trial (Crossover)",
            "sampleSize": "15 male firefighters",
            "duration": "4 weeks per arm",
            "keyFindings": [
              "Attenuated increases in IL-1β after high-intensity exercise compared to placebo",
              "Reduced cortisol response to fire suppressive activities",
              "Anti-inflammatory effects observed both post-exercise and post-occupation activity",
              "Supports NF-kB pathway modulation as mechanism for anti-inflammatory benefits"
            ],
            "effectSize": "Small",
            "pValue": "<0.05 (within-group)",
            "confidenceInterval": "95%"
          },
          {
            "title": "Effect of astaxanthin supplementation on muscle damage and oxidative stress markers in elite young soccer players",
            "authors": "Djordjevic B, Baralic I, Kotur-Stevuljevic J, Stefanovic A, Ivanisevic J, Radivojevic N, Andjelkovic M, Dikic N",
            "journal": "Journal of Sports Medicine and Physical Fitness",
            "year": 2012,
            "doi": "",
            "pmid": "22828460",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "32 elite soccer players",
            "duration": "90 days",
            "keyFindings": [
              "Prevented exercise-induced depletion of total antioxidant status (TAS)",
              "Reduced superoxide anion production after exercise in astaxanthin group",
              "Lower post-exercise CK and AST levels suggest reduced inflammation-mediated muscle damage",
              "Increased sulphydryl (SH) group content indicating preserved antioxidant defense"
            ],
            "effectSize": "Moderate",
            "pValue": "<0.05",
            "confidenceInterval": "95%"
          }
        ]
      },
      {
        "mechanism": "Collagen and extracellular matrix protection via MMP inhibition and procollagen upregulation",
        "claim": "Collagen and extracellular matrix protection via MMP inhibition and procollagen upregulation",
        "mechanismType": "Dermatological process",
        "strength": "Moderate",
        "tissueTarget": "Skin dermis (fibroblasts)",
        "target": "Skin dermis (fibroblasts)",
        "evidence": [
          {
            "title": "Systematic Review and Meta-Analysis on the Effects of Astaxanthin on Human Skin Ageing",
            "authors": "Zhou X, Cao Q, Orfila C, Zhao J, Zhang L",
            "journal": "Nutrients",
            "year": 2021,
            "doi": "10.3390/nu13092917",
            "pmid": "34578794",
            "studyType": "Systematic Review and Meta-Analysis",
            "sampleSize": "11 studies",
            "duration": "Variable",
            "keyFindings": [
              "Astaxanthin mitigates skin photoaging through antioxidant and anti-inflammatory effects",
              "Oral supplementation significantly improved moisture content and elasticity in pooled analysis",
              "Protective effects against UV-induced skin damage via reduction of matrix metalloproteinases",
              "Both oral and topical formulations showed anti-aging properties"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      }
    ],
    "dosage": [
      {
        "dosageRange": "4-12 mg/day for general health; up to 20 mg/day in clinical populations",
        "claim": "Clinical trials have used 4-20 mg/day astaxanthin with benefits observed across this range for different outcomes; 3-6 mg/day for skin, 12 mg/day for cardiovascular, 4 mg/day for eye health",
        "evidenceBase": "Moderate",
        "target": "Systemic",
        "tissueTarget": "Systemic",
        "evidence": [
          {
            "title": "Effects of Astaxanthin Supplementation on Skin Health: A Systematic Review of Clinical Studies",
            "authors": "Ng QX, De Deyn MLZQ, Loke W, Foo NX, Chan HW, Yeo WS",
            "journal": "Journal of Dietary Supplements",
            "year": 2020,
            "doi": "10.1080/19390211.2020.1739187",
            "pmid": "32202443",
            "studyType": "Systematic Review",
            "sampleSize": "11 clinical studies",
            "duration": "Variable",
            "keyFindings": [
              "3-6 mg/day identified as effective range for skin health benefits",
              "Duration of 4-16 weeks across studies showed measurable improvements",
              "Lipid-soluble compound — should be taken with a fat-containing meal for absorption"
            ],
            "effectSize": "Moderate",
            "pValue": "Variable",
            "confidenceInterval": "95%"
          },
          {
            "title": "Impact of astaxanthin on oxidative markers, uric acid, and clinical symptoms in heart failure: a randomized clinical trial",
            "authors": "Mohammadi SG, Shafie D, Feizi A, Bagherniya M, Ahmadi AR, Kafeshani M",
            "journal": "BMC Cardiovascular Disorders",
            "year": 2025,
            "doi": "10.1186/s12872-025-05260-z",
            "pmid": "41162864",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "80 heart failure patients",
            "duration": "8 weeks",
            "keyFindings": [
              "20 mg/day astaxanthin showed significant antioxidant and clinical benefits in heart failure",
              "8-week duration was sufficient for measurable improvements in oxidative markers",
              "Higher doses (12-20 mg/day) used in cardiovascular studies vs 3-6 mg/day for skin"
            ],
            "effectSize": "Moderate to Large",
            "pValue": "<0.001",
            "confidenceInterval": "95%"
          }
        ]
      }
    ]
  }
};

// Global assignment for browser
if (typeof window !== 'undefined') {
  window.enhancedCitations = window.enhancedCitations || {};
  window.enhancedCitations[46] = astaxanthinEnhanced;
  window.astaxanthinEnhanced = astaxanthinEnhanced;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = astaxanthinEnhanced;
}
