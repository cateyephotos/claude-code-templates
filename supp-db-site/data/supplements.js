// Evidence-Based Supplement Database
const supplementDatabase = {
  "metadata": {
    "version": "2.0",
    "lastUpdated": "2025-08-17",
    "totalSupplements": 89,
    "completedSupplements": 89,
    "targetSupplements": 89,
    "evidenceBasedOn": "501+ research papers from systematic searches",
    "expansionStatus": "Phase 1 COMPLETE - All 89 target supplements successfully added with comprehensive evidence tracking"
  },
  
  "supplements": [
    {
      "id": 1,
      "name": "Bacopa monnieri",
      "scientificName": "Bacopa monnieri",
      "category": "Nootropic",
      "commonNames": ["Brahmi", "Water Hyssop", "Herb of Grace"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple RCTs with moderate sample sizes",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Attention improvement", "Learning facilitation"],
        "nonCognitive": ["Anxiety reduction", "Stress management", "Neuroprotection"]
      },
      "isEnhanced": true,
      "dosageRange": "300mg daily (standardized to 55% bacosides)",
      "optimalDuration": "12-16 weeks",
      "studyPopulations": ["Healthy adults 18-65", "Elderly with cognitive complaints"],
      "mechanismsOfAction": [
        "Acetylcholinesterase inhibition",
        "Antioxidant neuroprotection", 
        "Enhanced synaptic transmission",
        "BDNF and neuroplasticity enhancement"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild GI upset", "Nausea", "Headache"],
        "contraindications": ["Pregnancy", "Breastfeeding"],
        "drugInteractions": ["May enhance effects of cholinesterase inhibitors"]
      },
      "effectSizes": {
        "memory": "Large effect (d=0.95) for word recall",
        "attention": "Medium effect (d=0.52) for working memory",
        "workingMemoryHighDose": "Very large effect (SMD=2.03) for working memory at ≥600mg/day (Tiemtad 2026 NMA, 29 RCTs, n=2107)",
        "executiveFunction": "Bacopa ranked #1 for executive function (SUCRA 91.3%) in elderly (Feng 2026 NMA, 25 studies)",
        "stressReactivity": "Significant reduction in stress reactivity (p=0.03) at 300mg/day (Lopresti 2025 RCT, n=101)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Liquid extract"],
        "costRange": "$15-40/month",
        "qualityMarkers": ["Standardized to bacosides", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Bacopa monnieri versus Ginkgo biloba for enhancing cognitive function: a network meta-analysis of randomized controlled trials",
          "authors": "Tiemtad S, et al.",
          "year": "2026",
          "doi": "10.1016/j.phymed.2026.157915",
          "pmid": "41678913"
        },
        {
          "title": "Chronic effects of Brahmi (Bacopa monnieri) on human memory",
          "authors": "Roodenrys S, Booth D, Bulzomi S, et al.",
          "year": "2002",
          "doi": "10.1016/S0893-133X(01)00419-5",
          "pmid": "12093601"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 18,
          "researchQualityScore": 85,
          "lastEvidenceUpdate": "2026-03-05",
          "evidenceStrength": {
            "mechanisms": "Strong",
            "clinicalBenefits": "Strong",
            "safety": "Well-established",
            "dosage": "Evidence-based (dose-response emerging)"
          },
          "researchMaturity": "Mature",
          "publicationSpan": "1997-2026"
        },
        "mechanisms": [
          {
            "mechanism": "Acetylcholinesterase inhibition",
            "strength": "Strong",
            "mechanismType": "Enzymatic inhibition",
            "tissueTarget": "Brain cholinergic neurons",
            "evidence": [
              {
                "citationId": "das_2002_ache",
                "title": "A comparative study in rodents of standardized extracts of Bacopa monniera and Ginkgo biloba",
                "authors": ["Das A", "Shanker G", "Nath C", "Pal R", "Singh S", "Singh HK"],
                "year": 2002,
                "journal": "Pharmacology Biochemistry and Behavior",
                "doi": "10.1016/s0091-3057(02)00940-1",
                "pmid": "12213536",
                "studyType": "In vitro and animal study",
                "evidenceLevel": "Level 4",
                "findings": "Bacopa extract inhibited acetylcholinesterase activity dose-dependently with IC50 = 2.3 mg/ml",
                "methodology": "Electric eel AChE assay with dose-response curve",
                "clinicalTranslation": "Moderate - in vitro findings confirmed in animal models"
              }
            ]
          },
          {
            "mechanism": "Antioxidant neuroprotection",
            "strength": "Strong",
            "mechanismType": "Free radical scavenging and enzyme upregulation",
            "tissueTarget": "Brain tissue (multiple regions)",
            "evidence": [
              {
                "citationId": "bhattacharya_2000_antioxidant",
                "title": "Antioxidant activity of Bacopa monniera in rat frontal cortex, striatum and hippocampus",
                "authors": ["Bhattacharya SK", "Bhattacharya A", "Kumar A", "Ghosal S"],
                "year": 2000,
                "journal": "Phytotherapy Research",
                "doi": "10.1002/(SICI)1099-1573(200005)14:3<174::AID-PTR624>3.0.CO;2-O",
                "pmid": "10815010",
                "studyType": "Animal study",
                "evidenceLevel": "Level 4",
                "findings": "Significant increase in SOD (40%), catalase (35%), and GPx (30%) activity",
                "clinicalTranslation": "High - antioxidant effects well-documented across species"
              }
            ]
          }
        ],
        "benefits": [
          {
            "healthDomain": "Memory Enhancement",
            "specificClaim": "Improves episodic memory and word recall in healthy adults",
            "strength": "Strong",
            "evidenceQuality": "High",
            "replicationStatus": "Well-replicated (6+ independent studies)",
            "evidence": [
              {
                "citationId": "roodenrys_2002_memory",
                "title": "Chronic effects of Brahmi (Bacopa monnieri) on human memory",
                "authors": ["Roodenrys S", "Booth D", "Bulzomi S", "Phipps A", "Micallef C", "Smoker J"],
                "year": 2002,
                "journal": "Neuropsychopharmacology",
                "doi": "10.1016/S0893-133X(02)00280-1",
                "pmid": "12093601",
                "studyType": "Randomized controlled trial",
                "evidenceLevel": "Level 2",
                "studyDesign": "Double-blind, placebo-controlled, parallel group",
                "sampleSize": "n=76",
                "duration": "12 weeks",
                "dosage": "300mg daily (standardized to 55% bacosides)",
                "primaryOutcome": "Auditory Verbal Learning Test (AVLT)",
                "results": {
                  "effectSize": "Cohen's d = 0.95 (large effect)",
                  "pValue": "p = 0.003",
                  "clinicalSignificance": "23% improvement in delayed word recall"
                },
                "limitations": ["Single-center study", "Relatively young population"],
                "clinicalRelevance": "Demonstrates practical memory enhancement in healthy adults"
              }
            ],
            "metaAnalysisSupport": {
              "citationId": "pase_2012_systematic",
              "title": "The cognitive-enhancing effects of Bacopa monnieri: a systematic review",
              "authors": ["Pase MP", "Kean J", "Sarris J", "Neale C", "Scholey AB", "Stough C"],
              "year": 2012,
              "journal": "Journal of Alternative and Complementary Medicine",
              "doi": "10.1089/acm.2011.0367",
              "pmid": "22747190",
              "studyType": "Systematic review and meta-analysis",
              "evidenceLevel": "Level 1",
              "studiesIncluded": 6,
              "totalParticipants": 300,
              "pooledResults": {
                "overallCognition": "Small to moderate effect (SMD = 0.42, 95% CI: 0.18-0.66)",
                "memory": "Moderate effect (SMD = 0.51, 95% CI: 0.25-0.77)"
              },
              "conclusion": "Consistent evidence for memory enhancement across multiple studies"
            }
          }
        ],
        "safety": [
          {
            "safetyAspect": "General tolerability in healthy adults",
            "claim": "Well tolerated with minimal side effects in clinical populations",
            "riskLevel": "Low",
            "evidence": [
              {
                "citationId": "calabrese_2008_safety",
                "title": "Effects of a standardized Bacopa monnieri extract on cognitive performance in the elderly",
                "authors": ["Calabrese C", "Gregory WL", "Leo M", "Kraemer D", "Bone K", "Oken B"],
                "year": 2008,
                "journal": "Journal of Alternative and Complementary Medicine",
                "doi": "10.1089/acm.2008.0018",
                "pmid": "18611150",
                "safetyPopulation": "Elderly adults (65+)",
                "duration": "12 weeks",
                "sampleSize": "n=54",
                "adverseEvents": [
                  {"event": "Mild GI upset", "frequency": "7.4%", "severity": "Mild"},
                  {"event": "Transient nausea", "frequency": "3.7%", "severity": "Mild"}
                ],
                "seriousAdverseEvents": "None reported",
                "conclusion": "Well tolerated in elderly population with excellent safety profile"
              }
            ]
          }
        ]
      }
    },
    
    {
      "id": 2,
      "name": "Turmeric/Curcumin",
      "scientificName": "Curcuma longa",
      "category": "Anti-inflammatory",
      "commonNames": ["Turmeric", "Golden Spice", "Indian Saffron"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple systematic reviews and meta-analyses",
      "primaryBenefits": {
        "cognitive": ["Working memory improvement", "Executive function", "Sustained attention"],
        "nonCognitive": ["Anti-inflammatory", "Joint health", "Cardiovascular protection", "Mood support"]
      },
      "isEnhanced": true,
      "dosageRange": "500-1000mg daily (with piperine for absorption)",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Adults with cognitive complaints", "Patients with depression", "Individuals with inflammation"],
      "mechanismsOfAction": [
        "NF-κB pathway inhibition",
        "Amyloid-β formation inhibition",
        "Cerebrovascular function enhancement",
        "Neuroinflammation reduction"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["GI upset", "Diarrhea", "Nausea"],
        "contraindications": ["Gallstones", "Bleeding disorders", "Surgery within 2 weeks"],
        "drugInteractions": ["Blood thinners", "Diabetes medications"]
      },
      "effectSizes": {
        "cognition": "Moderate to large (SMD=0.82, 95% CI: 0.39-1.25)",
        "workingMemory": "Large (SMD=1.01 for cognitive aging populations)",
        "inflammation": "Moderate to large (d=0.5-0.8)",
        "lipidProfile": "Small to moderate (significant TC, LDL, TG reduction)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Liquid extract"],
        "costRange": "$10-30/month",
        "qualityMarkers": ["95% curcuminoids", "Contains piperine", "Liposomal formulations"]
      },
      "keyCitations": [
        {
          "title": "Curcumin supplementation and cognitive function: A meta-analysis of randomized controlled trials",
          "authors": "Wang et al.",
          "year": 2025,
          "doi": "10.1016/j.phymed.2025.156742"
        },
        {
          "title": "Effects of curcumin supplementation on cognitive aging: A meta-analysis of 10 RCTs",
          "authors": "Yu et al.",
          "year": 2025,
          "doi": "10.1002/fsn3.70172"
        },
        {
          "title": "A comprehensive umbrella review of curcumin effects based on 25 meta-analyses",
          "authors": "Xu et al.",
          "year": 2025,
          "doi": "10.3389/fphar.2025.1584866"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 26,
          "researchQualityScore": 92,
          "lastEvidenceUpdate": "2026-03-04",
          "evidenceStrength": {
            "mechanisms": "Strong",
            "clinicalBenefits": "Strong",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature",
          "publicationSpan": "2003-2026"
        }
      }
    },
    
    {
      "id": 3,
      "name": "Ashwagandha",
      "scientificName": "Withania somnifera",
      "category": "Adaptogen",
      "commonNames": ["Indian Winter Cherry", "Withania", "Indian Ginseng"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple meta-analyses (22-RCT dose-response MA, 23-trial hormonal MA, 14-study psychiatric MA) with consistent findings across 6+ domains including stress, anxiety, depression, sleep, hormonal modulation, and muscle strength. Decision tree: Human data (YES) → Hundreds of RCTs → Multiple meta-analyses (YES) → Consistent findings (YES) → Tier 1",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Stress-related cognitive improvement", "Attention under stress"],
        "nonCognitive": ["Stress reduction", "Anxiety management", "Sleep quality", "Testosterone support (men)", "Muscle strength", "Hormonal modulation", "Depression symptom reduction"],
        "isEnhanced": true
      },
      "dosageRange": "300-600mg daily (standardized extract; 600mg/day optimal for stress/anxiety per dose-response MA)",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Stressed adults", "Athletes", "Individuals with anxiety", "Individuals with diagnosed mental disorders", "Men seeking testosterone support", "Individuals with subclinical hypothyroidism"],
      "mechanismsOfAction": [
        "HPA axis modulation",
        "Cortisol reduction (SMD = -1.18, 23 RCTs)",
        "GABA signaling enhancement",
        "Neuroprotective effects",
        "Serotonergic modulation (MD = 31.75 ng/ml increase)",
        "Testosterone biosynthesis in men (MD = 57.43 ng/dl)",
        "Thyroid hormone modulation (T4 MD = 0.61 µg/dL)"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Drowsiness", "GI upset", "Headache"],
        "contraindications": ["Autoimmune conditions", "Pregnancy", "Thyroid disorders"],
        "drugInteractions": ["Sedatives", "Immunosuppressants", "Thyroid medications"]
      },
      "effectSizes": {
        "stress": "Very large (SMD = -5.88, 22 RCTs dose-response MA; SMD = -0.95 in diagnosed disorders)",
        "anxiety": "Very large (SMD = -6.87, 22 RCTs dose-response MA; SMD = -1.13 in diagnosed disorders)",
        "depression": "Very large (SMD = -5.68, 22 RCTs dose-response MA; SMD = -1.28 in diagnosed disorders)",
        "sleep": "Large (SMD = -1.35 in diagnosed disorders)",
        "cortisol": "Large (SMD = -1.18, 23 trials, n=1706)",
        "testosteroneMen": "Moderate (MD = 57.43 ng/dl, significant in men only)",
        "serotonin": "Large (MD = 31.75 ng/ml, p < 0.01)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Liquid extract"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["KSM-66 extract", "Standardized withanolides", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Effects of ashwagandha on mental health in adults: A systematic review and dose-response meta-analysis of randomized controlled trials",
          "authors": "Alsanie SA et al.",
          "year": 2026,
          "doi": "10.1016/j.ctim.2026.103325",
          "pmid": "41644067"
        },
        {
          "title": "Hormonal Modulation with Withania somnifera: Systematic Review and Meta-Analysis of Randomized-controlled Trials",
          "authors": "Fornalik M et al.",
          "year": 2026,
          "doi": "10.1055/a-2802-8363",
          "pmid": "41740946"
        },
        {
          "title": "The effect of Withania somnifera on mental health symptoms in individuals with mental disorders: systematic review and meta-analysis",
          "authors": "Marchi M et al.",
          "year": 2025,
          "doi": "10.1192/bjo.2025.10885",
          "pmid": "41140145"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "fileId": "3_enhanced"
      },
      "evidenceProfile": {
        "researchQualityScore": 92,
        "totalCitations": 21,
        "lastEvidenceUpdate": "2026-03-05"
      }
    },
    
    {
      "id": 4,
      "name": "Omega-3 Fatty Acids",
      "scientificName": "EPA/DHA",
      "category": "Essential Fatty Acid",
      "commonNames": ["Fish Oil", "Marine Omega-3", "EPA/DHA"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Extensive meta-analyses and systematic reviews",
      "primaryBenefits": {
        "cognitive": ["Memory support", "Cognitive aging protection", "Brain development"],
        "nonCognitive": ["Cardiovascular health", "Triglyceride reduction", "Anti-inflammatory", "Eye health", "Metabolic syndrome", "Liver health (MASLD)", "Exercise synergy", "Pregnancy cardiovascular support"],
        "isEnhanced": true
      },
      "dosageRange": "1000-2000mg daily (combined EPA/DHA)",
      "optimalDuration": "8+ weeks for cognitive benefits",
      "studyPopulations": ["General adults", "Elderly", "Cardiovascular patients", "Pregnant women"],
      "mechanismsOfAction": [
        "Cell membrane fluidity",
        "Neuroinflammation reduction",
        "Neurotransmitter synthesis",
        "Vascular health improvement"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Fishy aftertaste", "GI upset", "Burping"],
        "contraindications": ["Fish allergies", "Bleeding disorders"],
        "drugInteractions": ["Blood thinners", "Blood pressure medications"]
      },
      "effectSizes": {
        "triglycerides": "Large (high-dose >2000mg: -56.78 mg/dL; standard: 33% reduction)",
        "cognition": "Small to moderate (SMD = 0.24, p = 0.02)",
        "depression": "Small to moderate (Cohen's d = -0.36, EPA ≥60% formulations)",
        "preeclampsia": "Large (RR 0.63 total, RR 0.45 severe preeclampsia)",
        "metabolicSyndrome": "Large for TG at high doses (>2000mg/day)"
      },
      "commercialAvailability": {
        "forms": ["Softgels", "Liquid", "Gummies", "Powder"],
        "costRange": "$15-50/month",
        "qualityMarkers": ["Third-party tested for purity", "Molecular distillation", "IFOS certified"]
      },
      "keyCitations": [
        {
          "title": "Omega-3 fatty acids for the primary and secondary prevention of cardiovascular disease",
          "authors": "Abdelhamid AS, Brown TJ, Brainard JS, et al.",
          "year": 2020,
          "doi": "10.1002/14651858.CD003177.pub5"
        },
        {
          "title": "Marine-Based Omega-3 Fatty Acids and Metabolic Syndrome: A Systematic Review and Meta-Analysis of RCTs",
          "authors": "Basirat A, Merino-Torres JF",
          "year": 2025,
          "doi": "10.3390/nu17203279"
        },
        {
          "title": "The effect of omega-3 supplementation and fish oil on preeclampsia: A meta-analysis",
          "authors": "Rajati M, et al.",
          "year": 2025,
          "doi": "10.1016/j.clnesp.2024.10.146"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 27,
          "researchQualityScore": 94,
          "lastEvidenceUpdate": "2026-03-04",
          "evidenceStrength": {
            "mechanisms": "Strong",
            "clinicalBenefits": "Strong",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature",
          "publicationSpan": "2004-2025"
        }
      }
    },
    
    {
      "id": 5,
      "name": "Creatine",
      "scientificName": "N-methylguanidino acetic acid",
      "category": "Performance Enhancer",
      "commonNames": ["Creatine Monohydrate", "Phosphocreatine"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple large meta-analyses (69+ studies for strength, 61 trials dose-response), ISSN position stand, consistent replication across domains",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Processing speed", "Mental fatigue reduction", "Cognitive aging protection"],
        "nonCognitive": ["Muscle strength", "Power output", "Exercise recovery", "Muscle mass", "Body composition", "Strength and power"],
        "isEnhanced": true
      },
      "dosageRange": "3-5g daily (maintenance) or 20g daily for 5 days (loading)",
      "optimalDuration": "4+ weeks",
      "studyPopulations": ["Athletes", "Healthy adults", "Vegetarians", "Elderly", "Trained and untrained individuals"],
      "mechanismsOfAction": [
        "ATP regeneration",
        "Brain energy metabolism",
        "Neuroprotection",
        "Cellular energy buffering"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Water retention", "Weight gain", "GI upset if loading"],
        "contraindications": ["Kidney disease"],
        "drugInteractions": ["Minimal known interactions"]
      },
      "effectSizes": {
        "memory": "Small to moderate (83.3% of studies positive in aging; particularly strong in vegetarians)",
        "strength": "Moderate to large (significant via 69-study meta-analysis; RVE-confirmed)",
        "bodyComposition": "Moderate (FFM +1.39 kg, body mass +0.89 kg; dose-response from 61 trials)",
        "depression": "Small (SMD = -0.34, below minimal important difference; GRADE very low)",
        "kidneyFunction": "No adverse effect (creatinine MD 0.07 mg/dL within normal; GFR unchanged)"
      },
      "commercialAvailability": {
        "forms": ["Powder", "Capsules", "Tablets"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Creapure brand", "Third-party tested", "Unflavored powder"]
      },
      "keyCitations": [
        {
          "title": "The effects of creatine supplementation on upper and lower body strength and power: a systematic review and meta-analysis",
          "authors": "Kazeminasab et al.",
          "year": "2025",
          "doi": "10.1080/02640414.2025.2468753"
        },
        {
          "title": "Dose-response effects of creatine supplementation on body composition: a meta-analysis",
          "authors": "Ashtary-Larky et al.",
          "year": "2025",
          "doi": "10.1016/j.clnu.2025.07.012"
        },
        {
          "title": "The Effects of Creatine Supplementation on Kidney Function: A Systematic Review and Meta-Analysis",
          "authors": "Naeini et al.",
          "year": "2025",
          "doi": "10.1016/j.clnu.2025.06.030"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 24,
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
        }
      }
    },
    
    {
      "id": 6,
      "name": "Magnesium",
      "scientificName": "Magnesium (various forms)",
      "category": "Essential Mineral",
      "commonNames": ["Magnesium Glycinate", "Magnesium Oxide", "Magnesium Citrate"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple large meta-analyses (38 RCTs for blood pressure, 23 RCTs for T2DM glycemic control), consistent replication across cardiovascular, metabolic, and neurological domains",
      "primaryBenefits": {
        "cognitive": ["Stress-related cognitive support", "Sleep quality improvement"],
        "nonCognitive": ["Sleep enhancement", "Muscle relaxation", "Blood pressure support", "Bone health", "Glycemic control", "Anti-inflammatory effects"],
        "isEnhanced": true
      },
      "dosageRange": "200-400mg daily (elemental magnesium)",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Adults with sleep issues", "Stressed individuals", "Athletes", "Elderly", "Hypertensive adults", "Type 2 diabetes patients", "Prediabetic adults", "Metabolic syndrome patients"],
      "mechanismsOfAction": [
        "GABA receptor modulation",
        "NMDA receptor antagonism",
        "Muscle relaxation",
        "Neurotransmitter regulation",
        "Anti-inflammatory activity (CRP reduction)"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Diarrhea", "GI upset", "Nausea"],
        "contraindications": ["Kidney disease", "Heart block"],
        "drugInteractions": ["Antibiotics", "Diuretics", "Bisphosphonates"]
      },
      "effectSizes": {
        "sleep": "Moderate (significant improvement in elderly)",
        "stress": "Small to moderate",
        "bloodPressure": "Small-moderate (SBP -2.81 mmHg, DBP -2.05 mmHg overall; up to -7.68 mmHg in hypertensives on medication; 38 RCTs)",
        "glycemicControl": "Moderate (FBG WMD=-0.58 in T2DM, 23 RCTs; HOMA-IR MD=-1.10 in prediabetes)",
        "inflammation": "Small-moderate (CRP SMD=-0.327 in metabolic syndrome, 8 RCTs)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Liquid"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Chelated forms preferred", "Third-party tested", "Avoid oxide for absorption"]
      },
      "keyCitations": [
        {
          "title": "Magnesium Supplementation and Blood Pressure: A Systematic Review and Meta-Analysis of Randomized Controlled Trials",
          "authors": "Argeros et al.",
          "year": "2025",
          "doi": "10.1161/HYPERTENSIONAHA.125.25129"
        },
        {
          "title": "Effect of Magnesium Supplements on Improving Glucose Control, Blood Pressure and Lipid Profile in Patients With Type 2 Diabetes Mellitus",
          "authors": "Maqrashi et al.",
          "year": "2025",
          "doi": "10.18295/2075-0528.2848"
        },
        {
          "title": "Unlocking the Power of Magnesium: A Systematic Review and Meta-Analysis Regarding Its Role in Oxidative Stress and Inflammation",
          "authors": "Cepeda et al.",
          "year": "2025",
          "doi": "10.3390/antiox14060740"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 21,
          "researchQualityScore": 90,
          "lastEvidenceUpdate": "2026-03-04",
          "evidenceStrength": {
            "mechanisms": "Strong",
            "clinicalBenefits": "Strong",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Highly Mature",
          "publicationSpan": "2001-2026"
        }
      }
    },
    
    {
      "id": 7,
      "name": "Vitamin D3",
      "scientificName": "Cholecalciferol",
      "category": "Vitamin",
      "commonNames": ["Vitamin D", "Cholecalciferol", "Sunshine Vitamin"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple large meta-analyses (20+) across bone, immune, metabolic, liver, and autoimmune domains with consistent findings; largest IPD MA encompasses 46 RCTs with 64,573 participants (Jolliffe 2025)",
      "primaryBenefits": {
        "cognitive": ["Cognitive aging protection", "Mood support", "Executive function"],
        "nonCognitive": ["Bone health", "Immune function (deficiency-dependent)", "Muscle strength", "Mood regulation", "Liver health", "Glycemic control", "Autoimmune disease modulation"],
        "isEnhanced": true
      },
      "isEnhanced": true,
      "dosageRange": "1000-4000 IU daily (based on blood levels; 2000-4000 IU optimal for metabolic benefit)",
      "optimalDuration": "Long-term supplementation (benefits apparent by 12 weeks for metabolic outcomes)",
      "studyPopulations": ["Deficient individuals", "Elderly", "Limited sun exposure", "General adults", "Type 2 diabetes patients", "SLE patients", "Chronic liver disease patients"],
      "mechanismsOfAction": [
        "Vitamin D receptor activation",
        "Calcium homeostasis",
        "Gene expression regulation",
        "Immune modulation (innate and adaptive)",
        "Anti-inflammatory NF-kB pathway regulation",
        "Hepatoprotective effects",
        "Insulin sensitivity modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Hypercalcemia (high doses)", "Kidney stones (rare)"],
        "contraindications": ["Hypercalcemia", "Sarcoidosis"],
        "drugInteractions": ["Thiazide diuretics", "Calcium channel blockers"]
      },
      "effectSizes": {
        "mood": "Small to moderate (in deficient individuals)",
        "bone": "Moderate (fracture prevention)",
        "immune": "Moderate in deficient populations (OR 0.58 at <25 nmol/L; Jolliffe 2025, 46 RCTs, n=64,573)",
        "liver": "Moderate (significant AST/ALT/albumin improvement; Martinekova 2025, 46 RCTs, n=4,084)",
        "glycemic": "Moderate (significant FBG/HbA1c/HOMA-IR improvement; Bruna-Mejias 2025, 20 RCTs)",
        "autoimmune": "Moderate (improved SLEDAI scores in SLE; El Kababi 2025, 21 studies, n=3,177)"
      },
      "commercialAvailability": {
        "forms": ["Softgels", "Tablets", "Drops", "Gummies"],
        "costRange": "$8-20/month",
        "qualityMarkers": ["D3 form preferred", "Third-party tested", "With K2 for synergy"]
      },
      "keyCitations": [
        {
          "title": "Effect of vitamin D supplementation on acute respiratory infections: updated individual participant data meta-analysis",
          "authors": "Jolliffe DA et al.",
          "year": 2025,
          "doi": "10.1016/S2213-8587(24)00327-5"
        },
        {
          "title": "The Effect of Vitamin D Supplementation on Disease Activity and Inflammatory Markers in SLE Patients: A Systematic Review and Meta-Analysis",
          "authors": "El Kababi KA et al.",
          "year": 2025,
          "doi": "10.3390/nu17111917"
        },
        {
          "title": "The effects of vitamin D supplementation on liver function in chronic liver disease: A systematic review and meta-analysis",
          "authors": "Martinekova K et al.",
          "year": 2025,
          "doi": "10.1093/nutrit/nuaf024"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "researchQualityScore": 93,
          "totalCitations": 28,
          "lastEvidenceUpdate": "2026-03-04",
          "evidenceStrength": {
            "mechanisms": "Strong",
            "clinicalBenefits": "Strong",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature",
          "publicationSpan": "1990-2025"
        }
      }
    },
    
    {
      "id": 8,
      "name": "Melatonin",
      "scientificName": "N-acetyl-5-methoxytryptamine",
      "category": "Sleep Aid",
      "commonNames": ["Sleep Hormone", "Pineal Hormone"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Extensive meta-analyses for sleep disorders",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Sleep-related cognitive improvement", "Circadian rhythm regulation", "Cognitive decline protection (MCI/mild AD)"],
        "nonCognitive": ["Sleep onset", "Sleep quality", "Jet lag support", "Antioxidant effects", "ICU sleep support", "Parkinson's disease sleep support"]
      },
      "dosageRange": "0.5-3mg, 30-60 minutes before bedtime",
      "optimalDuration": "As needed or 4+ weeks for chronic issues",
      "studyPopulations": ["Insomnia patients", "Shift workers", "Elderly", "Jet lag sufferers"],
      "mechanismsOfAction": [
        "Melatonin receptor activation",
        "Circadian rhythm regulation",
        "Antioxidant effects",
        "Sleep-wake cycle modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Daytime drowsiness", "Headache", "Dizziness"],
        "contraindications": ["Autoimmune conditions", "Depression", "Pregnancy"],
        "drugInteractions": ["Sedatives", "Blood thinners", "Diabetes medications"]
      },
      "effectSizes": {
        "sleepOnsetLatency": "SOL SMD=-0.37 (Choi 2022 MA, 11 RCTs); dose-response peaks at 4mg/day (Cruz-Sanabria 2024)",
        "sleepQuality": "PSQI WMD=-1.24 (Gholami 2022 MA, 23 RCTs, p<0.001)",
        "icuDelirium": "RR=0.72 (Tang 2025 MA, 32 RCTs, n=3895, 95% CI: 0.58-0.89)",
        "parkinsonsSleep": "PSQI MD=-1.75 (Yousef 2025 MA, 8 studies, p=0.004); TST SMD=0.84 (p<0.00001)"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules", "Gummies", "Sublingual", "Extended-release"],
        "costRange": "$8-20/month",
        "qualityMarkers": ["Third-party tested", "Proper dosing", "Extended-release for maintenance"]
      },
      "keyCitations": [
        {
          "title": "Melatonin Use in the ICU: A Systematic Review and Meta-Analysis",
          "authors": "Tang et al.",
          "year": "2025",
          "doi": "10.1097/CCM.0000000000006767"
        },
        {
          "title": "Optimizing the Time and Dose of Melatonin as a Sleep-Promoting Drug: A SR and Dose-Response Meta-Analysis",
          "authors": "Cruz-Sanabria et al.",
          "year": "2024",
          "doi": "10.1111/jpi.12985"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "evidenceProfile": {
        "researchQualityScore": 90,
        "totalCitations": 25,
        "overallQuality": "Tier 1",
        "publicationSpan": "1980-2025",
        "lastEvidenceUpdate": "2026-03-05"
      }
    },
    
    {
      "id": 9,
      "name": "L-Theanine",
      "scientificName": "N-ethyl-L-glutamine",
      "category": "Amino Acid",
      "commonNames": ["Theanine", "Tea Amino Acid"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple small to moderate RCTs",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Calm alertness", "Attention without jitters", "Stress-related cognitive support"],
        "nonCognitive": ["Anxiety reduction", "Stress management", "Sleep quality", "Blood pressure support", "Psychiatric symptom reduction (adjunctive)"]
      },
      "dosageRange": "100-200mg daily (often with caffeine)",
      "optimalDuration": "Acute effects within 30-60 minutes",
      "studyPopulations": ["Stressed adults", "Students", "Anxiety sufferers", "Caffeine users", "Psychiatric patients (adjunctive)", "Individuals with sleep difficulties"],
      "mechanismsOfAction": [
        "GABA receptor modulation",
        "Alpha brain wave promotion",
        "Dopamine and serotonin modulation",
        "Glutamate antagonism",
        "Serotonergic pathway modulation (psychiatric symptom reduction)"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Rare: headache", "Dizziness"],
        "contraindications": ["None known"],
        "drugInteractions": ["May enhance sedative effects"]
      },
      "effectSizes": {
        "sleepQuality": { "value": "SMD=0.43", "source": "Bulman 2025 MA, 19 articles, N=897" },
        "daytimeDysfunction": { "value": "SMD=0.33", "source": "Bulman 2025 MA" },
        "stressReduction": { "value": "12.92-17.98% reduction", "source": "Hidese 2024 MA, 11 studies, N=897" },
        "choiceReactionTime": { "value": "SMD=-0.48 (with caffeine), SMD=-0.35 (alone)", "source": "Payne 2025 MA, 50 RCTs" },
        "attentionSwitching": { "value": "SMD=0.33 (with caffeine)", "source": "Payne 2025 MA" },
        "visualReactionTime": { "value": "MD=-15.20ms", "source": "Mátyus 2025 MA, 5 RCTs" }
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Combined with caffeine"],
        "costRange": "$15-30/month",
        "qualityMarkers": ["Suntheanine brand", "Third-party tested", "Pharmaceutical grade"]
      },
      "keyCitations": [
        {
          "title": "Impact of L-theanine on sleep quality: a systematic review and meta-analysis",
          "authors": "Bulman CL et al.",
          "year": 2025,
          "doi": "10.1016/j.smrv.2025.102070",
          "pmid": "40056718"
        },
        {
          "title": "A systematic review and meta-analysis of tea, L-theanine, and caffeine on cognition, sleep quality, and mood",
          "authors": "Payne JK et al.",
          "year": 2025,
          "doi": "10.1093/nutrit/nuaf002",
          "pmid": "40314930"
        },
        {
          "title": "The effects of L-theanine supplementation on the outcomes of patients with mental disorders: a systematic review",
          "authors": "Moshfeghinia R et al.",
          "year": 2024,
          "doi": "10.1186/s12888-024-06285-y",
          "pmid": "39633316"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "fileId": "9_enhanced"
      },
      "evidenceProfile": {
        "researchQualityScore": 87,
        "totalCitations": 22,
        "lastEvidenceUpdate": "2026-03-05"
      }
    },
    
    {
      "id": 10,
      "name": "Rhodiola rosea",
      "scientificName": "Rhodiola rosea",
      "category": "Adaptogen",
      "commonNames": ["Golden Root", "Arctic Root", "Rose Root"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple RCTs with varying quality",
      "primaryBenefits": {
        "cognitive": ["Mental fatigue reduction", "Stress-related cognitive improvement", "Working memory under stress"],
        "nonCognitive": ["Physical fatigue reduction", "Stress adaptation", "Mood support", "Exercise performance"]
      },
      "isEnhanced": true,
      "dosageRange": "200-400mg daily (standardized extract)",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Fatigued adults", "Stressed individuals", "Students", "Athletes"],
      "mechanismsOfAction": [
        "HPA axis modulation",
        "Monoamine oxidase inhibition",
        "Stress protein expression",
        "Neurotransmitter balance"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Dizziness", "Dry mouth", "Sleep disturbances"],
        "contraindications": ["Bipolar disorder", "Pregnancy"],
        "drugInteractions": ["MAO inhibitors", "Diabetes medications"]
      },
      "effectSizes": {
        "fatigue": "Small to moderate (d~0.38 TTE)",
        "stress": "Small to moderate",
        "endurance_VO2": "Small (ES=0.32, p<0.01)",
        "antioxidant_SOD": "Large (ES=1.16)",
        "muscle_damage_CK": "Large (ES=-0.84)",
        "depression": "Significant vs placebo"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Liquid extract"],
        "costRange": "$20-40/month",
        "qualityMarkers": ["3% rosavins, 1% salidroside", "Third-party tested", "Standardized extract"]
      },
      "keyCitations": [
        {
          "title": "Effect of Rhodiola rosea supplementation on endurance performance: a systematic review and meta-analysis",
          "authors": "Wang X et al.",
          "year": 2025,
          "doi": "10.3389/fnut.2025.1556291",
          "pmid": "41080184"
        },
        {
          "title": "The Effectiveness of Rhodiola rosea L. Preparations in Alleviating Various Aspects of Life-Stress Symptoms",
          "authors": "Ivanova Stojcheva E, Quintela JC",
          "year": 2022,
          "doi": "10.3390/molecules27123902",
          "pmid": "35744937"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "evidenceProfile": {
        "researchQualityScore": 89,
        "totalCitations": 20,
        "lastEvidenceUpdate": "2026-03-05"
      }
    },
    
    {
      "id": 11,
      "name": "Lion's Mane Mushroom",
      "scientificName": "Hericium erinaceus",
      "category": "Nootropic",
      "commonNames": ["Bearded Tooth", "Pom Pom Mushroom", "Yamabushitake"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple small RCTs (n=31-41) with consistent positive findings plus 1 PRISMA SR (Menon 2025); no meta-analysis with pooled estimates yet",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Nerve growth factor stimulation", "Neuroprotection", "Memory support", "Cognitive enhancement in MCI"],
        "nonCognitive": ["Digestive health", "Immune support", "Nerve regeneration", "Gut microbiota diversity", "Mood and anxiety improvement"]
      },
      "dosageRange": "500-1000mg daily (standardized extract)",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["Adults with mild cognitive concerns", "Elderly", "Digestive health seekers"],
      "mechanismsOfAction": [
        "NGF (Nerve Growth Factor) stimulation",
        "Neurogenesis promotion",
        "Myelin regeneration",
        "Neuroprotective compounds (hericenones, erinacines)"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild skin rash (rare)", "GI upset", "Contact dermatitis"],
        "contraindications": ["Mushroom allergies"],
        "drugInteractions": ["None known"]
      },
      "effectSizes": {
        "cognition_mmse": "MMSE weighted mean increase +1.17 (Menon 2025 PRISMA SR, 5 RCTs + 3 PCTs)",
        "alzheimers_prevention": "Significant MMSE and CASI improvement vs placebo (Li 2020 RCT, n=41, 49 weeks)",
        "acute_cognition": "Improved Stroop task performance within 60 min of single dose (Docherty 2023 RCT, n=41)",
        "nerve_regeneration": "Strong preclinical — NOAEL >2000mg/kg, BBB penetration confirmed (erinacine A bioavailability 24.39%)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder", "Liquid extract", "Whole mushroom"],
        "costRange": "$25-50/month",
        "qualityMarkers": ["Standardized beta-glucans", "Organic certification", "Dual extraction"]
      },
      "keyCitations": [
        {
          "title": "Benefits, side effects, and uses of Hericium erinaceus as a supplement: a systematic review",
          "authors": "Menon et al.",
          "year": "2025",
          "doi": "10.3389/fnut.2025.1641246",
          "pmid": "40959699",
          "studyType": "PRISMA SR (5 RCTs, 3 PCTs, PROSPERO registered)"
        },
        {
          "title": "The Acute and Chronic Effects of Lion's Mane Mushroom Supplementation on Cognitive Function, Stress and Mood in Young Adults",
          "authors": "Docherty et al.",
          "year": "2023",
          "doi": "10.3390/nu15224842",
          "pmid": "38004235",
          "studyType": "RCT (n=41)"
        }
      ],
      "enhancedCitations": {},
      "evidenceProfile": {
        "researchQualityScore": 88,
        "totalCitations": 16,
        "lastEvidenceUpdate": "2026-03-05"
      }
    },
    
    {
      "id": 12,
      "name": "Phosphatidylserine",
      "scientificName": "L-α-phosphatidylserine",
      "category": "Phospholipid",
      "commonNames": ["PS", "Lecithin phospholipid"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple RCTs (Duan n=190, Doma n=138, Kato-Kataoka n=78, Hirayama n=36) with consistent positive cognitive findings; NMA ranking PS #1 for ADHD attention (Zhou 2024); no PS-specific meta-analysis with pooled estimates",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Memory improvement", "Attention enhancement", "Cognitive aging protection", "ADHD symptom reduction"],
        "nonCognitive": ["Stress hormone reduction", "Exercise recovery", "Mood support"]
      },
      "dosageRange": "100-300mg daily",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Elderly with cognitive decline", "Athletes", "Stressed adults", "Children with ADHD"],
      "mechanismsOfAction": [
        "Cell membrane fluidity optimization",
        "Neurotransmitter function support",
        "Cortisol response modulation",
        "Neuroplasticity enhancement"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Rare: insomnia", "GI upset"],
        "contraindications": ["None known"],
        "drugInteractions": ["Blood thinners (theoretical)"]
      },
      "effectSizes": {
        "memory_mci": "Medium to large effect — Duan 2025 RCT (n=190): significant short-term memory improvement in MCI over 12 months",
        "memory_elderly": "Medium to large effect — Kato-Kataoka 2010 RCT (n=78): verbal recall improvement at 100-300mg/day",
        "adhd_attention": "SUCRA ranking 0.39 (best of 12 drugs) — Zhou 2024 NMA (48 RCTs, n=3650)",
        "cortisol": "HPA axis normalization — Hellhammer 2014 RCT (n=75): cortisol stress response reduction at 400mg PAS"
      },
      "commercialAvailability": {
        "forms": ["Softgels", "Capsules", "Powder"],
        "costRange": "$30-60/month",
        "qualityMarkers": ["Soy-derived preferred", "Third-party tested", "Enteric coating"]
      },
      "keyCitations": [
        {
          "title": "Safety and efficacy of antioxidant therapy in children and adolescents with ADHD: A systematic review and network meta-analysis",
          "authors": "Zhou RY, Wang JJ, You Y, et al.",
          "year": 2024,
          "doi": "10.1371/journal.pone.0296926"
        },
        {
          "title": "Effects of a food supplement containing phosphatidylserine on cognitive function in Chinese older adults with MCI",
          "authors": "Duan H, Xu N, Yang T, et al.",
          "year": 2025,
          "doi": "10.1016/j.jad.2024.09.131"
        }
      ],
      "evidenceProfile": {
        "quality": 86,
        "citations": 13,
        "tier": 2,
        "publicationSpan": "2008-2025",
        "lastEvidenceUpdate": "2026-03-05"
      }
    },
    
    {
      "id": 13,
      "name": "Acetyl-L-Carnitine",
      "scientificName": "N-acetyl-L-carnitine",
      "category": "Amino Acid",
      "commonNames": ["ALCAR", "ALC"],
      "evidenceTier": 2,
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Mental fatigue reduction", "Neuroprotection"],
        "nonCognitive": ["Depression support", "Nerve health", "Energy metabolism", "Male fertility support", "Erectile dysfunction support"]
      },
      "dosageRange": "500-2000mg daily",
      "optimalDuration": "8-24 weeks",
      "studyPopulations": ["Elderly with cognitive decline", "Depression patients", "Athletes", "Men with erectile dysfunction", "Infertile males"],
      "mechanismsOfAction": [
        "Mitochondrial energy production",
        "Acetylcholine synthesis support",
        "Neurotrophin factor enhancement",
        "Oxidative stress reduction"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Nausea", "Restlessness", "Fishy body odor"],
        "contraindications": ["Seizure disorders", "Thyroid disease"],
        "drugInteractions": ["Thyroid medications", "Anticoagulants"]
      },
      "effectSizes": {
        "cognition": "Small to moderate — Cochrane review: benefits in some dementia/MCI studies (Hudson 2003)",
        "depression": "Moderate (adjunct) — improved antidepressant response in elderly (Zanardi 2006)",
        "erectileFunction": "PLC+ALC+Sildenafil SUCRA 97% for IIEF-EF improvement (Barbonetti 2024 NMA, 15 RCTs)",
        "maleFertility": "L-carnitine+ALC: SMD 4.19 for progressive motility (Niu 2025 NMA, 16 RCTs)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$20-45/month",
        "qualityMarkers": ["Pharmaceutical grade", "Third-party tested", "Enteric coating"]
      },
      "keyCitations": [
        {
          "title": "Efficacy of Nutraceuticals for the Treatment of Erectile Dysfunction: A Systematic Review and Network Meta-analysis",
          "authors": "Barbonetti, D'Andrea, Martorella et al.",
          "year": "2024",
          "doi": "10.1093/jsxmed/qdae137"
        },
        {
          "title": "The comparative efficacy of carnitine and CoQ10 supplementation on sperm quality: a systematic review and NMA",
          "authors": "Niu, Zou, Yang et al.",
          "year": "2025",
          "doi": "10.1007/s00228-025-03853-x"
        },
        {
          "title": "Acetyl-L-carnitine for dementia (Cochrane Review)",
          "authors": "Hudson & Tabet",
          "year": "2003",
          "doi": "10.1002/14651858.CD003158"
        }
      ],
      "enhancedCitations": {},
      "evidenceProfile": {
        "researchQualityScore": 79,
        "totalCitations": 16,
        "lastEvidenceUpdate": "2026-03-05"
      },
      "evidenceTierRationale": "Cochrane review (Hudson 2003) + multiple RCTs for cognitive decline, depression, fatigue. New NMA evidence for ED (Barbonetti 2024, 15 RCTs) and male fertility (Niu 2025, 16 RCTs). Tier 2: multiple RCTs with moderate evidence across domains, Cochrane review exists but is dated (2003)."
    },
    
    {
      "id": 14,
      "name": "Ginkgo Biloba",
      "scientificName": "Ginkgo biloba",
      "category": "Herbal Extract",
      "commonNames": ["Maidenhair Tree", "EGb 761"],
      "isEnhanced": true,
      "evidenceTier": 2,
      "evidenceTierRationale": "Cochrane review 2026 (82 RCTs, n=10613, GRADE) — most extensive herbal nootropic evidence base. Shows small-moderate benefits in dementia (low certainty) but probably no effect in MCI (moderate certainty). GB extracts ranked #1 for VCI cognition (d=0.83) in 173-trial MA (Masserini 2025). High-dose Bacopa outperformed GB for working memory in 29-RCT NMA (Tiemtad 2026). Overview of 16 SRs confirms favorable findings but poor SR quality. Tier 2: extensive RCT evidence but mixed certainty across populations.",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Attention improvement", "Cognitive decline stabilization", "Vascular cognitive impairment"],
        "nonCognitive": ["Peripheral circulation", "Tinnitus support", "Antioxidant effects", "Neuropsychiatric symptom reduction"]
      },
      "dosageRange": "120-240mg daily (standardized extract EGb 761)",
      "optimalDuration": "12-24 weeks",
      "studyPopulations": ["Elderly with cognitive complaints", "Dementia patients", "MCI patients", "Vascular cognitive impairment", "Circulation issues", "Neuropsychiatric symptoms"],
      "mechanismsOfAction": [
        "Cerebral blood flow enhancement",
        "Platelet aggregation inhibition",
        "Antioxidant neuroprotection",
        "Neurotransmitter modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Headache", "Dizziness", "GI upset"],
        "contraindications": ["Bleeding disorders", "Surgery within 2 weeks"],
        "drugInteractions": ["Blood thinners", "Seizure medications", "Diabetes drugs"],
        "cochraneSafety": "Wieland 2026 Cochrane (82 RCTs): little to no difference in adverse events vs placebo"
      },
      "effectSizes": {
        "dementiaCognition": "Small to moderate improvement at 6 months (Wieland 2026 Cochrane, 82 RCTs, low certainty)",
        "mciCognition": "Probably no effect (Wieland 2026 Cochrane, moderate certainty)",
        "vciCognition": "Large effect d=0.83 (95% CI 0.00-1.67) for GB extracts, ranked #1 (Masserini 2025, 173 trials)",
        "vciFunction": "Moderate effect d=0.50 for functional improvement (Masserini 2025)",
        "workingMemory": "Outperformed by high-dose Bacopa (SUCRA 100% vs GB; Tiemtad 2026, 29 RCTs)"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules", "Liquid extract"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["EGb 761 extract", "24% flavonoids", "6% terpenoids"]
      },
      "keyCitations": [
        {
          "title": "Ginkgo biloba for cognitive impairment and dementia",
          "authors": "Wieland, Mossenta, Engdahl, Picard, D'Adamo",
          "year": "2026",
          "doi": "10.1002/14651858.CD013661.pub2",
          "pmid": "41641880",
          "type": "Cochrane SR (82 RCTs, n=10613)"
        },
        {
          "title": "Therapeutic strategies for vascular cognitive impairment: a meta-analysis",
          "authors": "Masserini, Ciccone, Persichetti, Cavallini, Annoni, Santangelo",
          "year": "2025",
          "doi": "10.1002/alz.70840",
          "pmid": "41198594",
          "type": "MA (173 trials, n=22347)"
        },
        {
          "title": "Bacopa monnieri versus Ginkgo biloba for cognitive enhancement: NMA",
          "authors": "Tiemtad, Teeranachaideekul, Chantasart, Junyaprasert",
          "year": "2026",
          "doi": "10.1016/j.phymed.2026.157915",
          "pmid": "41678913",
          "type": "NMA (29 RCTs, n=2107)"
        }
      ],
      "enhancedCitations": {
        "hasEnhancedFile": true,
        "enhancedFileId": "14_enhanced.js"
      },
      "evidenceProfile": {
        "researchQualityScore": 80,
        "totalCitations": 19,
        "lastEvidenceUpdate": "2026-03-05",
        "overallQuality": "Tier 2",
        "evidenceStrength": {
          "mechanisms": "Moderate",
          "clinicalBenefits": "Strong",
          "safety": "Well-established",
          "dosage": "Evidence-based"
        }
      }
    },
    
    {
      "id": 15,
      "name": "Panax Ginseng",
      "scientificName": "Panax ginseng",
      "category": "Adaptogen",
      "commonNames": ["Korean Ginseng", "Asian Ginseng", "Red Ginseng", "Korean Red Ginseng"],
      "isEnhanced": true,
      "evidenceTier": 2,
      "evidenceTierRationale": "Two new cognitive MAs (Zeng 2024: 15 RCTs, memory SMD=0.19; Kim 2025: 8 RCTs, MMSE/ADAS-Cog significant) plus comprehensive CVD dose-response MA (Jafari 2025: 70 RCTs, anti-inflammatory confirmed). Cochrane review exists (Geng 2010, dated). Mixed cognitive domain results (memory positive, attention/executive null) prevent Tier 1. Evidence extensive but spread across many domains without single-domain depth for Tier 1.",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Mental fatigue reduction", "Working memory", "Cognitive function in dementia (MMSE/ADAS-Cog)"],
        "nonCognitive": ["Physical performance", "Stress adaptation", "Immune support", "Anti-inflammatory activity", "Antioxidant effects"]
      },
      "dosageRange": "200-400mg daily (standardized extract)",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Healthy adults", "Fatigued individuals", "Cognitive impairment patients", "Alzheimer's disease patients", "Diabetics", "Athletes", "CVD risk populations"],
      "mechanismsOfAction": [
        "HPA axis modulation",
        "Neurotransmitter enhancement (dopamine, acetylcholine)",
        "Anti-inflammatory activity (hs-CRP, IL-6 reduction)",
        "Antioxidant effects (ROS reduction, SOD enhancement)",
        "Nitric oxide production enhancement"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Insomnia", "Headache", "GI upset", "Nervousness"],
        "contraindications": ["Hypertension (note: Jafari 2025 MA found no BP effect)", "Diabetes (monitor glucose)", "Hormone-sensitive conditions"],
        "drugInteractions": ["Blood thinners", "Diabetes medications", "Stimulants"],
        "fabricatedCitationsNote": "3 fabricated safety citations in enhanced file (safety[1], safety[3], safety[4]) flagged with _INTEGRITY_FLAG"
      },
      "effectSizes": {
        "memoryOverall": "Small effect SMD=0.19 (95% CI 0.02-0.36, Zeng 2024, 15 RCTs)",
        "memoryHighDose": "Small-moderate effect SMD=0.33 (95% CI 0.04-0.61, Zeng 2024, high dose)",
        "mmse": "MD=0.68 (95% CI 0.03-1.32, Kim 2025, 8 RCTs)",
        "adasCog": "MD=-1.10 (95% CI -1.82 to -0.38, Kim 2025, I²=0%)",
        "attentionExecutive": "No significant effect (Zeng 2024, SMD=0.06 and -0.03)",
        "antiInflammatory": "hs-CRP SMD=-0.23, ROS SMD=-0.94, SOD SMD=0.48 (Jafari 2025, 70 RCTs)",
        "lipidsAndBP": "No significant effect (Jafari 2025, 70 RCTs)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Liquid extract", "Tea"],
        "costRange": "$20-50/month",
        "qualityMarkers": ["Standardized ginsenosides", "Korean red ginseng", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Effects of Ginseng on Cognitive Function: A Systematic Review and Meta-Analysis",
          "authors": "Zeng et al.",
          "year": "2024",
          "doi": "10.1002/ptr.8359",
          "pmid": "39474788"
        },
        {
          "title": "Cognitive Benefits of Ginseng: A Systematic Review and Meta-Analysis of Changes in MMSE and ADAS-Cog Scores",
          "authors": "Kim et al.",
          "year": "2025",
          "doi": "10.1159/000547543",
          "pmid": "40774237"
        },
        {
          "title": "The effect of ginseng supplementation on CVD risk factors: a comprehensive systematic review and dose-response meta-analysis",
          "authors": "Jafari et al.",
          "year": "2025",
          "doi": "10.1017/S0007114525103607",
          "pmid": "40923100"
        }
      ],
      "enhancedCitations": {
        "hasEnhancedFile": true,
        "enhancedFileId": "15_panax_ginseng_enhanced.js"
      },
      "evidenceProfile": {
        "quality": 83,
        "citations": 22,
        "lastEvidenceUpdate": "2026-03-05",
        "overallQuality": "Tier 2 — Strong adaptogenic evidence with new cognitive MAs and comprehensive CVD dose-response MA",
        "evidenceStrength": {
          "mechanisms": "Strong (HPA axis, neurotransmitters, NO, antioxidant)",
          "clinicalBenefits": "Moderate-Strong (memory positive, attention/executive null, anti-inflammatory confirmed)",
          "safety": "Good (well-tolerated; 3 fabricated citations flagged)",
          "dosage": "Moderate (200-400mg standardized extract)"
        }
      }
    },
    
    {
      "id": 16,
      "name": "Alpha-GPC",
      "scientificName": "L-α-glycerylphosphorylcholine",
      "category": "Choline Compound",
      "commonNames": ["α-GPC", "Choline alfoscerate"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multicenter RCT (Jeon 2024, n=100) demonstrates ADAS-cog improvement in MCI; first PROSPERO-registered comparative MA (Sagaro 2025) shows superiority over citicoline; 7+ RCTs across cognitive and athletic domains",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Learning improvement", "Focus enhancement", "Cognitive function in MCI (ADAS-cog)"],
        "nonCognitive": ["Growth hormone support", "Athletic performance", "Neuroprotection"]
      },
      "isEnhanced": true,
      "dosageRange": "300-600mg daily",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Cognitive decline patients", "Athletes", "Students", "Mild cognitive impairment (MCI)", "Dementia patients"],
      "mechanismsOfAction": [
        "Acetylcholine synthesis enhancement",
        "Cell membrane phospholipid support",
        "Growth hormone release",
        "Dopamine and GABA modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Headache", "Dizziness", "Insomnia", "GI upset"],
        "contraindications": ["None known"],
        "drugInteractions": ["Cholinesterase inhibitors"],
        "notes": "Jeon 2024 multicenter RCT (n=100, 12 weeks): no serious AEs, no discontinuations due to AEs"
      },
      "effectSizes": {
        "adas_cog_mci": { "value": "MD = -2.34 points vs placebo", "study": "Jeon 2024", "n": 100, "duration": "12 weeks", "population": "MCI" },
        "scag_vs_citicoline": { "value": "WMD = -3.92 (95% CI: -7.41 to -0.42)", "study": "Sagaro & Amenta 2025 MA", "k": 3, "n": 358 },
        "motivation": { "value": "d = 0.72", "study": "Tamura 2021", "n": 24, "population": "healthy adults" },
        "stroop_executive": { "value": "p < 0.05 both LD and HD", "study": "Kawamura 2024", "n": 20 },
        "isometric_strength": { "value": "Large effect d > 0.8", "study": "Bellar 2015", "n": 13, "duration": "6 days" },
        "jump_performance": { "value": "3% improvement at 500mg (p = 0.04)", "study": "Marcus 2017", "n": 54 },
        "growth_hormone": { "value": "290% greater peak GH vs placebo", "study": "Kawamura 2012", "n": 12 }
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder", "Liquid"],
        "costRange": "$25-55/month",
        "qualityMarkers": ["Pharmaceutical grade", "Third-party tested", "High bioavailability"]
      },
      "keyCitations": [
        {
          "title": "Efficacy and safety of choline alphoscerate for amnestic mild cognitive impairment",
          "authors": "Jeon et al.",
          "year": "2024",
          "doi": "10.1186/s12877-024-05366-7",
          "pmid": "39300341"
        },
        {
          "title": "Comparison of effects of choline alphoscerate and citicoline in dementia: SR and MA",
          "authors": "Sagaro & Amenta",
          "year": "2025",
          "pmid": "41426989"
        },
        {
          "title": "Alpha-Glycerylphosphorylcholine Increases Motivation in Healthy Volunteers",
          "authors": "Tamura et al.",
          "year": "2021",
          "doi": "10.3390/nu13062091",
          "pmid": "34207484"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "evidenceProfile": {
        "researchQualityScore": 81,
        "totalCitations": 14,
        "lastUpdated": "2026-03-05",
        "lastEvidenceUpdate": "2026-03-05",
        "overallQuality": "Moderate",
        "evidenceStrength": "Moderate — first MA + well-designed multicenter RCT in MCI"
      }
    },
    
    {
      "id": 17,
      "name": "Berberine",
      "scientificName": "Berberine hydrochloride",
      "category": "Plant Alkaloid",
      "commonNames": ["Berberine HCl"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for metabolic health, emerging for cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Cognitive health support"],
        "nonCognitive": ["Blood sugar regulation", "Cardiovascular health", "Weight management", "Antimicrobial effects"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "500-1500mg daily (divided doses)",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Diabetics", "Metabolic syndrome", "Cardiovascular patients"],
      "mechanismsOfAction": [
        "AMPK pathway activation",
        "Glucose metabolism enhancement",
        "Inflammation reduction",
        "Gut microbiome modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["GI upset", "Diarrhea", "Constipation", "Nausea"],
        "contraindications": ["Pregnancy", "Breastfeeding", "Low blood pressure"],
        "drugInteractions": ["Diabetes medications", "Blood thinners", "Antibiotics"]
      },
      "effectSizes": {
        "glucose": "Large (HbA1c reduction ~0.7%)",
        "cholesterol": "Moderate reduction"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$20-40/month",
        "qualityMarkers": ["Standardized to 97%+ berberine", "Third-party tested", "Enteric coating"]
      },
      "keyCitations": [
        {
          "title": "Berberine in cardiovascular and metabolic health",
          "authors": "Sutherland",
          "year": "2023",
          "doi": "Various studies"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "evidenceProfile": {
        "researchQualityScore": 93,
        "totalCitations": 12,
        "lastUpdated": "2026-03-05"
      }
    },

    {
      "id": 18,
      "name": "CoQ10",
      "scientificName": "Coenzyme Q10",
      "category": "Antioxidant",
      "commonNames": ["Ubiquinone", "Ubiquinol"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for heart health, emerging for cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Energy metabolism", "Oxidative stress reduction"],
        "nonCognitive": ["Heart health", "Energy production", "Anti-aging", "Muscle health", "Endothelial function", "Metabolic support"]
      },
      "isEnhanced": true,
      "dosageRange": "100-300mg daily",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Heart disease patients", "Statin users", "Elderly", "Athletes"],
      "mechanismsOfAction": [
        "Mitochondrial energy production",
        "Antioxidant protection",
        "Cell membrane stabilization",
        "Endothelial function improvement"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Rare: GI upset", "Insomnia (if taken late)"],
        "contraindications": ["None known"],
        "drugInteractions": ["Blood thinners", "Chemotherapy drugs"]
      },
      "effectSizes": {
        "heart_function": "Moderate improvement — mortality RR=0.64 (36% reduction), hospitalization RR=0.50 (Xu 2024 MA, 33 RCTs)",
        "energy": "Small to moderate (in deficient individuals)",
        "exerciseMuscleProtection": "Dose-dependent reduction in CK (WMD=-50.64 IU/L), LDH (WMD=-52.10 IU/L) per 100mg/day (Talebi 2024 MA, 28 RCTs, n=830, GRADE moderate-high)",
        "endothelialFunction": "FMD improvement WMD=1.45%, dose-dependent (meta-regression p=0.006) (Daei 2024 MA, 12 studies, n=489)",
        "metabolicGlycemic": "FBG reduction MD -5.2 to -11.21 mg/dL, HbA1c -0.12 to -1.83% (Patiño-Cardona 2024 umbrella review)"
      },
      "commercialAvailability": {
        "forms": ["Softgels", "Capsules", "Liquid", "Powder"],
        "costRange": "$25-60/month",
        "qualityMarkers": ["Ubiquinol form preferred", "Third-party tested", "Lipid-based formula"]
      },
      "keyCitations": [
        {
          "title": "Efficacy and safety of coenzyme Q10 in heart failure: a meta-analysis of randomized controlled trials",
          "authors": "Xu J, Xiang L, Yin X, et al.",
          "year": "2024",
          "doi": "10.1186/s12872-024-04232-z",
          "pmid": "39462324"
        },
        {
          "title": "Effect of Coenzyme Q10 Supplementation on Lipid and Glycaemic Profiles: An Umbrella Review",
          "authors": "Patiño-Cardona S, Garrido-Miguel M, et al.",
          "year": "2024",
          "doi": "10.3390/jcdd11120377",
          "pmid": "39728267"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "evidenceProfile": {
        "overallQuality": "Tier 2",
        "researchQualityScore": 88,
        "totalCitations": 17,
        "lastEvidenceUpdate": "2026-03-05",
        "evidenceStrength": {
          "mechanisms": "Strong",
          "clinicalBenefits": "Strong",
          "safety": "Well-established",
          "dosage": "Evidence-based (dose-response confirmed across domains)"
        },
        "researchMaturity": "Mature",
        "publicationSpan": "1994-2024"
      }
    },
    
    {
      "id": 19,
      "name": "B-Complex Vitamins",
      "scientificName": "B-vitamin complex",
      "category": "Essential Nutrients",
      "commonNames": ["B-Complex", "B-Vitamins", "Vitamin B"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple systematic reviews and strong RCT evidence",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Attention improvement", "Homocysteine reduction"],
        "nonCognitive": ["Energy metabolism", "Nervous system support", "Mood regulation", "Cardiovascular health"],
        "isEnhanced": true
      },
      "isEnhanced": true,
      "dosageRange": "RDA levels to therapeutic doses (varies by B vitamin)",
      "optimalDuration": "8-16 weeks for cognitive benefits",
      "studyPopulations": ["Elderly with memory complaints", "B-vitamin deficient individuals", "Middle-aged adults"],
      "mechanismsOfAction": [
        "Neurotransmitter synthesis support",
        "Homocysteine metabolism",
        "Myelin sheath maintenance",
        "DNA synthesis and repair"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Rare: nausea", "Urine discoloration (B2)"],
        "contraindications": ["None at RDA levels"],
        "drugInteractions": ["Phenytoin (folate)", "Metformin (B12)"]
      },
      "effectSizes": {
        "stress": "Moderate (SMD=0.35, Long & Benton 2013)",
        "memory": "Small to moderate (particularly in deficient)",
        "homocysteine": "Large reduction"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Sublingual", "Liquid"],
        "costRange": "$8-25/month",
        "qualityMarkers": ["Methylated forms preferred", "Third-party tested", "Complete spectrum"]
      },
      "keyCitations": [
        {
          "title": "Effects of Vitamin and Mineral Supplementation on Stress, Mild Psychiatric Symptoms, and Mood in Nonclinical Samples",
          "authors": "Long & Benton",
          "year": "2013",
          "doi": "10.1097/PSY.0b013e31827d5fbd",
          "pmid": "23362497"
        },
        {
          "title": "Effects of homocysteine lowering with B vitamins on cognitive aging: meta-analysis of 11 trials",
          "authors": "Clarke et al.",
          "year": "2014",
          "doi": "10.1093/ajcn/nqt356",
          "pmid": "24368573"
        },
        {
          "title": "Supplementation with vitamin B12 does not affect cognitive function: a systematic review",
          "authors": "Markun et al.",
          "year": "2021",
          "doi": "10.3389/fnut.2021.618766",
          "pmid": "33809274"
        },
        {
          "title": "Investigating the effects of a multinutrient supplement on cognition",
          "authors": "Young et al.",
          "year": "2019",
          "doi": "10.1017/S1368980019002258",
          "pmid": "31527485"
        },
        {
          "title": "B vitamins and the brain: mechanisms, dose and efficacy",
          "authors": "Kennedy",
          "year": "2016",
          "doi": "10.3390/nu8020068",
          "pmid": "26828517"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "fileRef": "19_enhanced.js",
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 10,
          "researchQualityScore": 82
        }
      },
      "evidenceProfile": {
        "researchQualityScore": 82,
        "totalCitations": 10,
        "lastUpdated": "2026-03-06"
      }
    },
    
    {
      "id": 20,
      "name": "Quercetin",
      "scientificName": "3,3',4',5,7-pentahydroxyflavone",
      "category": "Flavonoid",
      "commonNames": ["Quercetin dihydrate", "Sophoretin"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for senolytic effects and inflammation",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Anti-inflammatory effects"],
        "nonCognitive": ["Senolytic activity", "Antioxidant effects", "Cardiovascular protection", "Immune support"],
        "isEnhanced": true
      },
      "dosageRange": "500-1000mg daily",
      "optimalDuration": "Intermittent or continuous protocols",
      "studyPopulations": ["Elderly", "Individuals with inflammation", "Anti-aging protocols"],
      "mechanismsOfAction": [
        "Senescent cell clearance",
        "Anti-inflammatory pathways",
        "Antioxidant activity",
        "Flavonoid receptor modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Headache", "GI upset", "Tingling sensations"],
        "contraindications": ["Kidney disease (high doses)"],
        "drugInteractions": ["Antibiotics", "Blood thinners"]
      },
      "effectSizes": {
        "inflammation": "Moderate reduction",
        "senescent_cells": "Significant reduction (with dasatinib)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder", "Liquid"],
        "costRange": "$15-40/month",
        "qualityMarkers": ["95%+ purity", "Third-party tested", "Quercetin dihydrate form"]
      },
      "keyCitations": [
        {
          "title": "Senolytics decrease senescent cells in humans: A pilot clinical trial",
          "authors": "Hickson LJ et al.",
          "year": "2019",
          "doi": "10.1016/j.ebiom.2019.08.069"
        },
        {
          "title": "Quercetin supplementation in sport and physical activity: a systematic review and meta-analysis",
          "authors": "Rojano-Ortega D et al.",
          "year": "2023",
          "doi": "10.1007/s00394-023-03197-3"
        },
        {
          "title": "The Effects of Quercetin Supplementation on Inflammatory Markers Among Patients with Metabolic Syndrome",
          "authors": "Tabrizi R et al.",
          "year": "2019",
          "doi": "10.1093/advances/nmy071"
        },
        {
          "title": "Effect of quercetin on blood pressure: A systematic review and meta-analysis of randomized controlled trials",
          "authors": "Serban MC et al.",
          "year": "2016",
          "doi": "10.1097/HJH.0000000000001041"
        },
        {
          "title": "Safety of quercetin: a systematic review and meta-analysis",
          "authors": "Andres S et al.",
          "year": "2018",
          "doi": "10.1002/mnfr.201700447"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "evidenceProfile": {
        "researchQualityScore": 74,
        "totalCitations": 10,
        "lastUpdated": "2026-03-06"
      }
    },
    
    {
      "id": 21,
      "name": "Vitamin B12",
      "scientificName": "Cyanocobalamin/Methylcobalamin",
      "category": "Essential Nutrients",
      "commonNames": ["Cobalamin", "B12"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple Cochrane meta-analyses and systematic reviews confirm efficacy for deficiency correction, cognitive protection, and homocysteine reduction; consistent findings across large RCTs and pooled analyses",
      "primaryBenefits": {
        "cognitive": ["Memory support", "Cognitive aging protection", "Mood regulation"],
        "nonCognitive": ["Red blood cell formation", "DNA synthesis", "Nervous system health", "Energy metabolism"]
      },
      "isEnhanced": true,
      "dosageRange": "2.4μg RDA to 1000μg therapeutic",
      "optimalDuration": "3-6 months for deficiency correction",
      "studyPopulations": ["Elderly", "Vegetarians/vegans", "B12 deficient individuals", "Cognitive decline patients"],
      "mechanismsOfAction": [
        "Myelin sheath maintenance",
        "Homocysteine metabolism",
        "DNA methylation",
        "Neurotransmitter synthesis"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Rare: injection site reactions"],
        "contraindications": ["Cobalt allergy"],
        "drugInteractions": ["Metformin", "PPIs", "H2 blockers"]
      },
      "effectSizes": {
        "memory": "Large (in deficient individuals)",
        "mood": "Moderate (in deficient)"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Sublingual", "Injections", "Nasal spray"],
        "costRange": "$5-20/month",
        "qualityMarkers": ["Methylcobalamin preferred", "Third-party tested", "High bioavailability"]
      },
      "keyCitations": [
        {
          "title": "Oral vitamin B12 versus intramuscular vitamin B12 for vitamin B12 deficiency",
          "authors": "Vidal-Alaball J, Butler CC, Cannings-John R, et al.",
          "year": 2005,
          "doi": "10.1002/14651858.CD004655.pub2",
          "pmid": "16034940"
        },
        {
          "title": "Vitamin B12 deficiency",
          "authors": "Stabler SP",
          "year": 2013,
          "doi": "10.1056/NEJMcp1113996",
          "pmid": "23301732"
        },
        {
          "title": "The effect of B vitamin supplementation on homocysteine concentration and related cardiovascular risk: a meta-analysis",
          "authors": "Sohouli MH, Fatahi S, Lari A, et al.",
          "year": 2024,
          "doi": "10.1093/nutrit/nuad091",
          "pmid": "37495210"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 12,
          "researchQualityScore": 85,
          "lastEvidenceUpdate": "2026-03-06"
        }
      }
    },
    
    {
      "id": 22,
      "name": "Vitamin B6",
      "scientificName": "Pyridoxine/Pyridoxal-5-phosphate",
      "category": "Essential Nutrients",
      "commonNames": ["Pyridoxine", "P5P", "B6"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for neurotransmitter synthesis and mood",
      "primaryBenefits": {
        "cognitive": ["Neurotransmitter support", "Memory function", "Mood regulation"],
        "nonCognitive": ["Protein metabolism", "Immune function", "Hormone regulation", "PMS support"],
        "isEnhanced": true
      },
      "dosageRange": "1.3-1.7mg RDA to 50-100mg therapeutic",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Women with PMS", "Elderly", "Depression patients", "General adults"],
      "mechanismsOfAction": [
        "Neurotransmitter synthesis (serotonin, dopamine, GABA)",
        "Homocysteine metabolism",
        "Amino acid metabolism",
        "Gene expression regulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Neuropathy (high doses >100mg)", "Photosensitivity"],
        "contraindications": ["None at RDA levels"],
        "drugInteractions": ["Levodopa", "Phenytoin"]
      },
      "effectSizes": {
        "mood": "Moderate (PMS, depression)",
        "neurotransmitters": "Large increase"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules", "Liquid"],
        "costRange": "$5-15/month",
        "qualityMarkers": ["P5P form preferred", "Third-party tested", "Enteric coating"]
      },
      "keyCitations": [
        {
          "title": "Vitamin B6 supplementation for premenstrual syndrome: systematic review and meta-analysis of randomized trials",
          "authors": "Wyatt KM, Dimmock PW, Jones PW, Shaughn O'Brien PM",
          "year": 1999,
          "doi": "10.1136/bmj.318.7195.1375",
          "pmid": "10334745"
        },
        {
          "title": "Vitamin B6 for nausea and vomiting of pregnancy",
          "authors": "Matthews A, Haas DM, O'Mathuna DP, Dowswell T",
          "year": 2015,
          "doi": "10.1002/14651858.CD007575.pub4",
          "pmid": "26348534"
        },
        {
          "title": "Sensory neuropathy from pyridoxine abuse: a new megavitamin syndrome",
          "authors": "Schaumburg H, Kaplan J, Windebank A, Vick N, Rasmus S, Pleasure D, Brown MJ",
          "year": 1983,
          "doi": "10.1056/NEJM198308253090801",
          "pmid": "6308447"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 10,
          "researchQualityScore": 75,
          "lastEvidenceUpdate": "2026-03-06"
        }
      }
    },

    {
      "id": 23,
      "name": "Folate",
      "scientificName": "Pteroylglutamic acid/5-MTHF",
      "category": "Essential Nutrients",
      "commonNames": ["Folic Acid", "5-MTHF", "Methylfolate", "Vitamin B9", "L-methylfolate"],
      "evidenceTier": 1,
      "evidenceTierRationale": "USPSTF Grade A recommendation for NTD prevention; multiple Cochrane reviews and meta-analyses for cognitive, cardiovascular, and pregnancy outcomes; decades of population-wide fortification evidence",
      "primaryBenefits": {
        "cognitive": ["Cognitive aging protection", "Mood support (adjunctive)", "Homocysteine metabolism support"],
        "nonCognitive": ["Neural tube development support", "Homocysteine reduction", "Cardiovascular health", "Female fertility support", "Pregnancy health support"],
        "isEnhanced": true
      },
      "isEnhanced": true,
      "dosageRange": "400–800 mcg/day standard; 800 mcg–5 mg/day for special populations (MTHFR carriers, therapeutic depression, cerebral folate deficiency)",
      "optimalDuration": "Lifelong for pregnancy health support; 8–16 weeks for cognitive/homocysteine benefits",
      "studyPopulations": ["Women of childbearing age", "Elderly (cognitive decline)", "Depression patients (SSRI non-responders)", "MTHFR polymorphism carriers", "ASD children with FRAA positivity", "Recurrent miscarriage patients"],
      "mechanismsOfAction": [
        "One-carbon metabolism via MTHFR/DHFR enzymatic pathway",
        "Homocysteine remethylation to methionine via methionine synthase",
        "DNA synthesis and repair via thymidylate synthesis",
        "Folate receptor alpha (FRα) mediated brain transport"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Rare: mild GI upset at high doses"],
        "contraindications": ["Undiagnosed B12 deficiency (high folic acid doses can mask neurological progression)"],
        "drugInteractions": ["Methotrexate (antagonist)", "Phenytoin", "Sulfasalazine", "Trimethoprim"]
      },
      "effectSizes": {
        "ntd_prevention": "~70% risk reduction (population data)",
        "homocysteine": "Large reduction (combined B-vitamin trials)",
        "cognitive_aging": "Moderate (Lancet 2007 RCT: 3.5-year cognitive benefit in older adults)",
        "depression_adjunct": "Small to moderate (meta-analytic SMD ~0.47)"
      },
      "commercialAvailability": {
        "forms": ["Tablets (folic acid)", "Capsules (5-MTHF/L-methylfolate)", "Sublingual"],
        "costRange": "$5–25/month",
        "qualityMarkers": ["5-MTHF preferred over folic acid (no DHFR conversion required)", "Quatrefolic or Magnafolate brand 5-MTHF", "Third-party tested", "Verified MTHFR-safe formulation"]
      },
      "keyCitations": [
        {
          "title": "Folic Acid Supplementation to Prevent Neural Tube Defects: US Preventive Services Task Force Reaffirmation Recommendation Statement",
          "authors": "US Preventive Services Task Force et al.",
          "year": 2023,
          "doi": "10.1001/jama.2023.12876",
          "pmid": "37526713"
        },
        {
          "title": "Effect of 3-year folic acid supplementation on cognitive function in older adults in the FACIT trial",
          "authors": "Durga J et al.",
          "year": 2007,
          "doi": "10.1016/S0140-6736(07)60109-3",
          "pmid": "17240287"
        },
        {
          "title": "Folate and folic acid in the management of depression: a systematic review and meta-analysis",
          "authors": "Maruf AA et al.",
          "year": 2021,
          "doi": "10.1055/a-1684-3843",
          "pmid": "34794190"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 15,
          "researchQualityScore": 90,
          "lastEvidenceUpdate": "2026-03-06"
        }
      }
    },
    
    {
      "id": 24,
      "name": "Green Tea Extract",
      "scientificName": "Camellia sinensis",
      "category": "Polyphenol",
      "isEnhanced": true,
      "commonNames": ["EGCG", "Green Tea Catechins", "Epigallocatechin Gallate", "EGC"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Three meta-analyses (Rondanelli 2021 n=499, Asbaghi 2020 11 RCTs, Haghighatdoost 2018 11 RCTs) with consistent modest metabolic effects; 8 clinical trials across metabolic, cognitive, and safety domains; Tier 2 because no single large RCT (n>200) in general adults and cognitive benefits primarily in special populations (Down syndrome, Fragile X)",
      "primaryBenefits": {
        "cognitive": ["Attention enhancement", "Neuroprotection", "Memory support (special populations)"],
        "nonCognitive": ["Weight management", "Blood glucose reduction", "Anti-inflammatory effects", "Cardiovascular health"],
        "isEnhanced": true
      },
      "dosageRange": "200-400mg EGCG daily (take with food)",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Healthy adults", "Overweight individuals", "Type 2 diabetes", "Down syndrome", "Fragile X Syndrome"],
      "mechanismsOfAction": [
        "EGCG multi-target cellular signaling (NF-κB, MAPK, PI3K/Akt inhibition)",
        "DYRK1A kinase inhibition (neuroprotective)",
        "AMPK pathway activation (thermogenesis/fat oxidation)",
        "OATP1A2 transporter inhibition (drug interaction mechanism)"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["GI upset at high doses", "Iron absorption reduction", "Caffeine sensitivity (from non-decaffeinated products)"],
        "contraindications": ["Iron deficiency anemia", "Liver disease", "Concurrent hepatotoxic medications"],
        "drugInteractions": ["Beta-blockers (nadolol — OATP1A2 inhibition reduces bioavailability 85%)", "Iron supplements", "Statins (OATP substrate)"]
      },
      "effectSizes": {
        "bodyWeight": "−1.31 kg (95% CI: −1.98 to −0.65; Rondanelli 2021 meta-analysis)",
        "fastingGlucoseT2DM": "−7.48 mg/dL WMD (Asbaghi 2020 meta-analysis)",
        "fatOxidation": "+16% at rest (Roberts 2021 RCT)",
        "attention": "Small to moderate (Dietz 2017 RCT)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$10-30/month",
        "qualityMarkers": ["Standardized EGCG content", "Decaffeinated options", "Third-party tested", "USP or NSF certified"]
      },
      "keyCitations": [
        {
          "citationId": "rondanelli_2021_weight_metabolic",
          "title": "Meta-Analysis of the Effects of Green Tea Extract on Body Composition and Metabolic Parameters",
          "authors": ["Rondanelli M", "Giacosa A", "Morazzoni P", "Guido D", "Faliva MA", "Perna S"],
          "year": 2021,
          "journal": "Nutrients",
          "doi": "10.3390/nu13020644",
          "pmid": "33671139",
          "studyType": "Systematic review and meta-analysis"
        },
        {
          "citationId": "delatorre_2016_cognitive_ds",
          "title": "Epigallocatechin-3-gallate, a DYRK1A Inhibitor, Rescues Cognitive Deficits in Down Syndrome Mouse Models and in Humans",
          "authors": ["de la Torre R", "de Sola S", "Pons M", "Duchon A", "de Lagran MM", "Farre M"],
          "year": 2016,
          "journal": "Lancet Neurology",
          "doi": "10.1016/S1474-4422(16)30034-5",
          "pmid": "27302362",
          "studyType": "Phase 2 randomized controlled trial"
        },
        {
          "citationId": "asbaghi_2020_t2dm_meta",
          "title": "Effect of Green Tea on Anthropometric Indices and Glycemic Parameters in T2DM: A Systematic Review and Meta-Analysis",
          "authors": ["Asbaghi O", "Fouladvand F", "Gonzalez MJ", "Aghamohammadi V", "Choghakhori R", "Abbasnezhad A"],
          "year": 2020,
          "journal": "Complementary Medicine Research",
          "doi": "10.1159/000511665",
          "pmid": "33207344",
          "studyType": "Systematic review and meta-analysis"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 14,
          "researchQualityScore": 74,
          "lastEvidenceUpdate": "2026-03-06",
          "researchMaturity": "Developing",
          "publicationSpan": "2016-2025"
        }
      }
    },
    
    {
      "id": 25,
      "name": "NAD+ Precursors",
      "scientificName": "Nicotinamide riboside/Nicotinamide mononucleotide",
      "category": "Metabolic Support",
      "commonNames": ["NR", "NMN", "Nicotinamide Riboside", "Nicotinamide Mononucleotide", "NIAGEN"],
      "isEnhanced": true,
      "evidenceTier": 2,
      "evidenceTierRationale": "Two published meta-analyses (Prokopidis 2025 JCSM; Chen 2024 Nutr Metab Cardiovasc Dis) plus 10+ independent RCTs including a Science landmark trial (Yoshino 2021) and Nat Commun cardiovascular RCT (Martens 2018); no single general-population RCT with n>200 prevents Tier 1",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Cellular energy", "Anti-aging"],
        "nonCognitive": ["Mitochondrial function", "DNA repair", "Cardiovascular health", "Muscle function", "Insulin sensitivity"]
      },
      "dosageRange": "250-500mg NR or NMN daily",
      "optimalDuration": "12+ weeks",
      "studyPopulations": ["Elderly adults", "Prediabetic adults", "Athletes", "Postmenopausal women"],
      "mechanismsOfAction": [
        "NAD+ biosynthesis via Preiss-Handler pathway (gut microbiota conversion)",
        "Sirtuin activation (SIRT1-7)",
        "Mitochondrial biogenesis and function",
        "PARP1/CD38 competition for NAD+",
        "DNA repair pathway support"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild nausea", "Mild flushing at high doses", "Transient headache"],
        "contraindications": ["None established at standard doses"],
        "drugInteractions": ["None established; potential interaction with PARP inhibitors (theoretical)"]
      },
      "effectSizes": {
        "nad_blood_levels": "150-300% increase (dose-dependent; Trammell 2016, Conze 2019)",
        "muscle_grip_strength": "SMD +0.31 (p=0.04; Prokopidis 2025 meta-analysis; n=236)",
        "systolic_blood_pressure": "-5.8 mmHg in hypertensive subgroup (Martens 2018; p<0.05)",
        "insulin_sensitivity": "Significant improvement in prediabetic women (Yoshino 2021 Science; p=0.04)",
        "glucose_hba1c": "Null effect in non-diabetic populations (Chen 2024 meta-analysis)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder", "Sublingual"],
        "costRange": "$30-80/month",
        "qualityMarkers": ["Third-party tested", "Pharmaceutical grade NR (NIAGEN)", "Stability-tested formulations"]
      },
      "keyCitations": [
        {
          "title": "Effect of nicotinamide mononucleotide on insulin sensitivity in prediabetic women",
          "authors": "Yoshino M, Yoshino J, Kayser BD, et al.",
          "year": 2021,
          "journal": "Science",
          "doi": "10.1126/science.abe9985",
          "pmid": "33888596"
        },
        {
          "title": "Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults",
          "authors": "Martens CR, Denman BA, Mazzo MR, et al.",
          "year": 2018,
          "journal": "Nature Communications",
          "doi": "10.1038/s41467-018-03421-7",
          "pmid": "29599478"
        },
        {
          "title": "Effects of nicotinamide riboside and nicotinamide mononucleotide on muscle mass and function: a systematic review and meta-analysis",
          "authors": "Prokopidis K, Giannos P, Ispoglou T, et al.",
          "year": 2025,
          "journal": "Journal of Cachexia, Sarcopenia and Muscle",
          "doi": "10.1002/jcsm.13769",
          "pmid": "40275690"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "researchQualityScore": 72,
          "totalCitations": 17,
          "lastEvidenceUpdate": "2026-03-06",
          "researchMaturity": "Developing",
          "publicationSpan": "2016-2026"
        }
      }
    },
    
    {
      "id": 26,
      "name": "PQQ",
      "scientificName": "Pyrroloquinoline quinone",
      "category": "Antioxidant",
      "commonNames": ["Methoxatin", "Pyrroloquinoline quinone", "BioPQQ"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Five small RCTs (n=20–58) consistently show cognitive and mitochondrial benefits at 20mg/day BioPQQ™; no meta-analyses exist; all studies small and primarily Mitsubishi Gas Chemical-funded; Tier 3 correct — insufficient for Tier 2 without meta-analytic synthesis",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Memory support", "Cognitive function", "Executive function", "Mental clarity"],
        "nonCognitive": ["Mitochondrial biogenesis (PGC-1α upregulation)", "Antioxidant activity", "Cerebral blood flow", "Cardiovascular support (preliminary)"]
      },
      "dosageRange": "20mg daily",
      "optimalDuration": "12 weeks",
      "studyPopulations": ["Adults aged 20–80", "Elderly (age 50–70)", "Adults with elevated LDL"],
      "mechanismsOfAction": [
        "Mitochondrial biogenesis via PGC-1α upregulation",
        "Redox cofactor / antioxidant activity",
        "Cerebral blood flow enhancement (prefrontal cortex)",
        "NGF upregulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["No adverse events observed in any published RCT"],
        "contraindications": ["None established"],
        "drugInteractions": ["None established"]
      },
      "effectSizes": {
        "composite_memory": "Significant improvement on Cognitrax battery (Shiojima 2021; Tamakoshi 2023)",
        "executive_function": "Stroop interference ratio significantly reduced (Itoh 2016)",
        "pgc1a_expression": "Significant upregulation in skeletal muscle (Hwang 2020)",
        "cerebral_blood_flow": "Significant increase in PFC oxygenated hemoglobin by tNIRS (Nakano 2016)",
        "ldl_cholesterol": "Marginal reduction overall; significant in high-LDL subgroup only (Nakano 2015)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder"],
        "costRange": "$20-40/month",
        "qualityMarkers": ["BioPQQ™ brand (Mitsubishi Gas Chemical)", "Third-party tested", "20mg standardized dose"]
      },
      "keyCitations": [
        {
          "title": "Effect of Pyrroloquinoline Quinone Disodium Salt (BioPQQ) on Cognitive Function and Cerebral Blood Flow",
          "authors": "Shiojima Y, Takahashi M, Takahashi R, et al.",
          "year": 2021,
          "doi": "10.1080/07315724.2021.1962770",
          "pmid": "34415830"
        },
        {
          "title": "Effect of pyrroloquinoline quinone disodium salt supplementation on cognitive function in healthy adults",
          "authors": "Tamakoshi M, Suzuki T, Nishihara E, et al.",
          "year": 2023,
          "doi": "10.1039/d2fo01515c",
          "pmid": "36807425"
        },
        {
          "title": "Pyrroloquinoline Quinone (PQQ) Supplementation and the PGC-1α Pathway",
          "authors": "Hwang PS, Machek SB, Cardaci TD, et al.",
          "year": 2020,
          "doi": "10.1080/07315724.2019.1705203",
          "pmid": "31860387"
        }
      ],
      "healthDomains": ["Memory Enhancement", "Neuroprotection", "Energy & Vitality", "Mitochondrial Health"],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 3",
          "totalCitations": 7,
          "researchQualityScore": 42,
          "lastUpdated": "2026-03-06"
        }
      }
    },
    
    {
      "id": 27,
      "name": "Resveratrol",
      "scientificName": "3,5,4'-trihydroxystilbene",
      "category": "Polyphenol",
      "commonNames": ["Trans-resveratrol", "Red wine extract"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple meta-analyses (including 1 umbrella meta-analysis of 19 MAs, 81 RCTs, n=4088) confirm anti-inflammatory, body composition, and endothelial benefits. Consistent replication across independent research groups. Evidence tier upgraded from 3; SIRT1 mechanism reclassified to Theoretical after Mansouri 2025 null meta-analysis (11 RCTs).",
      "primaryBenefits": {
        "cognitive": ["Cerebral blood flow enhancement", "Memory support", "Neuroprotection"],
        "nonCognitive": ["Anti-inflammatory (CRP/TNF-α reduction)", "Body composition improvement", "Endothelial function", "Adipokine modulation (adiponectin)", "PCOS hormonal support"],
        "isEnhanced": true
      },
      "dosageRange": "150-500mg daily (75mg twice daily for cognitive outcomes)",
      "optimalDuration": "12-24 weeks",
      "studyPopulations": ["Cardiovascular patients", "Obese adults", "Type 2 diabetes", "Postmenopausal women", "PCOS patients"],
      "mechanismsOfAction": [
        "NF-κB pathway inhibition (anti-inflammatory)",
        "eNOS activation and nitric oxide production (endothelial)",
        "SIRT1 activation (theoretical — null in human RCTs)",
        "Antioxidant/ROS scavenging (indirect clinical evidence)"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["GI upset", "Nausea", "Headache"],
        "contraindications": ["Blood clotting disorders", "High-dose use (>1000mg/day) — elevated alkaline phosphatase risk"],
        "drugInteractions": ["Blood thinners (anticoagulants)", "NSAIDs", "CYP2C9 substrates"]
      },
      "effectSizes": {
        "antiInflammatory_CRP": "WMD −0.31 to −0.63 mg/L (meta-analytic)",
        "bodyWeight": "WMD −0.44 to −0.51 kg (meta-analytic)",
        "FMD_endothelial": "+1.43% (meta-analytic)",
        "cognition_CBFV": "Cohen's d = 0.275 (24-month RCT)",
        "adiponectin": "+1.10 μg/mL (meta-analytic)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Liquid"],
        "costRange": "$15-40/month",
        "qualityMarkers": ["Trans-resveratrol form (not cis)", "Third-party tested", "Micronized for bioavailability"]
      },
      "keyCitations": [
        {
          "title": "Resveratrol supplementation and metabolic risk factors: an umbrella review of meta-analyses",
          "authors": "Molani-Gol R, Pourghassem Gargari B",
          "year": "2024",
          "doi": "10.1007/s00394-024-03335-9",
          "pmid": "38374352"
        },
        {
          "title": "Effects of resveratrol on C-reactive protein: a meta-analysis of 35 RCTs",
          "authors": "Gorabi AM et al.",
          "year": "2021",
          "doi": "10.1002/ptr.7262",
          "pmid": "34472150"
        },
        {
          "title": "Long-term effects of resveratrol on cognition and cerebrovascular function in postmenopausal women",
          "authors": "Thaung Zaw JJ, Howe PRC, Wong RHX",
          "year": "2021",
          "doi": "10.1016/j.clnu.2020.08.025",
          "pmid": "32900519"
        },
        {
          "title": "Effects of resveratrol supplementation on SIRT1 expression: null result across 11 RCTs",
          "authors": "Mansouri S et al.",
          "year": "2025",
          "doi": "10.1016/j.jand.2025.03.011",
          "pmid": "40158656"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 19,
          "researchQualityScore": 72,
          "lastEvidenceUpdate": "2026-03-06",
          "researchMaturity": "Developing"
        }
      }
    },
    
    {
      "id": 28,
      "name": "Glucosamine",
      "scientificName": "Glucosamine sulfate",
      "category": "Joint Support",
      "commonNames": ["Glucosamine sulfate", "Glucosamine HCl", "GS", "GH"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Tier 2: Large research base (30+ RCTs in meta-analyses, umbrella NMA n=5265) supporting modest joint space narrowing and symptom effects. Efficacy is contested by funding source — independent IPD meta-analysis (Runhaar 2017, n=1625, 5 trials) found null result vs placebo; industry-funded studies show SMD ~-0.47 vs independent SMD ~-0.19. OARSI 2014 classified as 'uncertain appropriateness'. Best evidence is for crystalline glucosamine sulfate 1500mg/day for structural outcomes (JSN reduction). Cannot reach Tier 1 due to fundamental inconsistency between independent and industry-funded evidence.",
      "primaryBenefits": {
        "cognitive": [],
        "nonCognitive": ["Joint pain reduction (contested)", "Joint space narrowing reduction", "Osteoarthritis symptom relief", "Cartilage matrix support"],
        "isEnhanced": true
      },
      "isEnhanced": true,
      "dosageRange": "1500mg glucosamine sulfate daily (sulfate form preferred over HCl)",
      "optimalDuration": "6+ months for structural effects; 12+ weeks for symptom assessment",
      "studyPopulations": ["Knee osteoarthritis patients", "Hip osteoarthritis patients", "Adults with joint pain"],
      "mechanismsOfAction": [
        "Cartilage matrix GAG and proteoglycan synthesis (in vitro evidence)",
        "NF-κB pathway inhibition — anti-inflammatory (in vitro; not confirmed in human RCTs at clinical significance)",
        "Joint space narrowing reduction (clinical evidence: modest but present for GS)"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild GI upset", "Nausea", "Heartburn", "Diarrhea (uncommon, <5%)"],
        "contraindications": ["Shellfish allergies (most GS derived from shellfish)"],
        "drugInteractions": ["Warfarin (monitor INR)", "Diabetes medications (monitor blood glucose)"]
      },
      "effectSizes": {
        "joint_pain": "Sub-threshold: VAS WMD -5.7 to -7.4mm (MCID=15mm; does not meet clinical significance in most independent meta-analyses)",
        "joint_space_narrowing": "Small but significant: SMD -0.42 (Gregori 2018, industry-conflicted); GS alone significant in Rabade 2024",
        "function": "WOMAC not significantly improved in independent meta-analyses"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["Crystalline glucosamine sulfate preferred (Dona/Viartril formulation most studied)", "Sulfate salt superior to HCl", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Subgroup analyses of the effectiveness of oral glucosamine for knee and hip osteoarthritis: a systematic review and IPD meta-analysis from the OA trial bank",
          "authors": "Runhaar J et al.",
          "year": 2017,
          "doi": "10.1136/annrheumdis-2017-211149",
          "pmid": "28754801"
        },
        {
          "title": "Glucosamine, chondroitin sulfate, and the two in combination for painful knee osteoarthritis (GAIT trial)",
          "authors": "Clegg DO et al.",
          "year": 2006,
          "doi": "10.1056/NEJMoa052771",
          "pmid": "16495392"
        },
        {
          "title": "Glucosamine and chondroitin sulfate supplements: examination of efficacy and safety (industry vs independent funding analysis)",
          "authors": "Knapik JJ et al.",
          "year": 2018,
          "doi": "10.55460/AUC0-QM7H",
          "pmid": "30566740"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "file": "28_enhanced.js",
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 16,
          "researchQualityScore": 65,
          "lastEvidenceUpdate": "2026-03-06"
        }
      }
    },
    
    {
      "id": 29,
      "name": "MSM",
      "scientificName": "Methylsulfonylmethane",
      "category": "Joint Support",
      "commonNames": ["Dimethyl sulfone", "DMSO2", "Organic sulfur"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Two small RCTs (n=49, n=88) show statistically significant OA pain reduction but fall below MCID thresholds. An independent GRADE-based systematic review (Crawford 2019, US military) recommends AGAINST MSM for musculoskeletal pain. A 2025 NMA (Chen et al.) assigns GRADE Low certainty to MSM. Insufficient evidence for Tier 2.",
      "primaryBenefits": {
        "cognitive": [],
        "nonCognitive": ["Osteoarthritis joint pain reduction (contested)", "Exercise recovery", "Anti-inflammatory"],
        "isEnhanced": true
      },
      "isEnhanced": true,
      "dosageRange": "2000-3375mg daily",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Osteoarthritis patients", "Military/active duty populations", "Athletes", "Healthy adults"],
      "mechanismsOfAction": [
        "NF-κB pathway inhibition reducing pro-inflammatory cytokine production",
        "Biological sulfur donor supporting collagen and connective tissue synthesis",
        "Antioxidant activity via free radical scavenging"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild GI upset (nausea, diarrhea)", "Headache", "Fatigue"],
        "contraindications": ["Pregnancy/lactation (insufficient data)"],
        "drugInteractions": ["Potential CYP450 inhibition — warfarin and narrow-TI drug caution advised"]
      },
      "effectSizes": {
        "joint_pain": "SMD 0.39–0.50 (statistically significant; below MCID in independent analysis)",
        "exercise_recovery": "Modest DOMS reduction (underpowered studies)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder", "Tablets"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["OptiMSM brand (Bergstrom Nutrition)", "Third-party tested", "Distillation-purified"]
      },
      "keyCitations": [
        {
          "title": "Efficacy of methylsulfonylmethane supplementation on osteoarthritis of the knee: a randomized controlled study",
          "authors": ["Debbi EM", "Agar G", "Fichman G", "Ziv YB", "Kardosh R", "Halperin N", "Elbaz A", "Beer Y", "Debi R"],
          "year": 2011,
          "doi": "10.1186/1472-6882-11-50",
          "pmid": "21708034"
        },
        {
          "title": "Methylsulfonylmethane: Applications and Safety of a Novel Dietary Supplement",
          "authors": ["Butawan M", "Benjamin RL", "Bloomer RJ"],
          "year": 2017,
          "doi": "10.3390/nu9030290",
          "pmid": "28300758"
        },
        {
          "title": "Evidence for glucosamine and chondroitin-sulfate for musculoskeletal injury: A Systematic Review",
          "authors": ["Crawford C", "Boyd C", "Avula B", "Wang YH", "Khan IA", "Deuster PA"],
          "year": 2019,
          "doi": "10.1186/s12891-019-2559-4",
          "pmid": "30986309"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
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
          "researchMaturity": "Emerging"
        }
      }
    },
    
    {
      "id": 30,
      "name": "Vitamin E",
      "scientificName": "α-tocopherol (primary active form); also tocotrienols",
      "category": "Essential Nutrients",
      "commonNames": ["Alpha-tocopherol", "Mixed tocopherols", "Tocotrienols", "dl-alpha-tocopherol", "d-alpha-tocopherol"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple large RCTs (HOPE n=9,541; HOPE-TOO; PHS II n=14,641) and a meta-analysis (n=135,967) establish null CVD benefit and harm at ≥400 IU/day. Positive evidence exists for immune enhancement (Meydani 1997 RCT) and Alzheimer's functional preservation (Dysken 2014 RCT n=613). Tier 2 reflects mature, large-trial evidence base with complex clinical picture.",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Alzheimer's disease functional preservation"],
        "nonCognitive": ["Immune function enhancement (elderly)", "Lipid peroxidation inhibition"],
        "isEnhanced": true
      },
      "isEnhanced": true,
      "dosageRange": "15mg/day RDA; 200 IU/day for immune benefit; 2000 IU/day for AD under specialist supervision; CAUTION: ≥400 IU/day increases all-cause mortality",
      "optimalDuration": "12–24 weeks for immune endpoints; long-term only under specialist supervision for AD",
      "studyPopulations": ["Elderly (immune function)", "Mild-to-moderate Alzheimer's patients", "Cardiovascular risk populations"],
      "mechanismsOfAction": [
        "Lipid peroxidation inhibition (chain-breaking antioxidant in cell membranes and LDL)",
        "T-cell and antibody response enhancement (immunomodulation)",
        "Antioxidant neuroprotection — mitochondrial oxidative stress reduction in neurons"
      ],
      "safetyProfile": {
        "rating": "Caution",
        "commonSideEffects": ["GI upset at high doses", "Increased bleeding time"],
        "contraindications": ["Blood clotting disorders", "Pre-surgery (discontinue ≥2 weeks prior)"],
        "drugInteractions": ["Anticoagulants (warfarin — potentiates effect)", "Antiplatelet agents", "Chemotherapy (may reduce efficacy)"]
      },
      "effectSizes": {
        "immuneFunction": "Large (65% DTH increase at 200 IU/day; Meydani 1997)",
        "alzheimersFunctional": "Moderate (3.15-unit ADCS-ADL improvement; Dysken 2014)",
        "cardiovascularMortality": "Null to harmful (RR 1.13 heart failure; HR 1.74 hemorrhagic stroke at ≥400 IU/day)"
      },
      "commercialAvailability": {
        "forms": ["Softgels (alpha-tocopherol)", "Capsules (mixed tocopherols)", "Liquid"],
        "costRange": "$5-20/month",
        "qualityMarkers": ["Natural d-alpha-tocopherol (not dl-)", "Mixed tocopherols preferred", "Third-party tested", "Dose ≤200 IU for general use"]
      },
      "keyCitations": [
        {
          "title": "Vitamin E supplementation and cardiovascular events in high-risk patients — HOPE trial",
          "authors": "Lonn E, Bosch J, Yusuf S, et al.",
          "year": 2000,
          "doi": "10.1056/NEJM200001203420302",
          "pmid": "10639540"
        },
        {
          "title": "Meta-analysis: high-dosage vitamin E supplementation may increase all-cause mortality",
          "authors": "Miller ER, Pastor-Barriuso R, Dalal D, et al.",
          "year": 2005,
          "doi": "10.7326/0003-4819-142-1-200501040-00110",
          "pmid": "15537682"
        },
        {
          "title": "Effect of vitamin E and memantine on functional decline in Alzheimer disease — TEAM-AD VA trial",
          "authors": "Dysken MW, Sano M, Asthana S, et al.",
          "year": 2014,
          "doi": "10.1001/jama.2013.282834",
          "pmid": "24381967"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 8,
          "researchQualityScore": 68,
          "lastEvidenceUpdate": "2026-03-06",
          "evidenceStrength": {
            "mechanisms": "Strong",
            "clinicalBenefits": "Moderate",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature"
        }
      }
    },
    
    {
      "id": 31,
      "name": "Whey Protein",
      "scientificName": "Bovine milk serum protein (alpha-lactalbumin, beta-lactoglobulin, immunoglobulins)",
      "category": "Protein",
      "commonNames": ["Whey Isolate", "WPI", "Whey Concentrate", "WPC", "Whey Hydrolysate"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple RCTs and meta-analyses confirm muscle protein synthesis and sarcopenia benefits in elderly+RET; body composition effects are moderate and population-specific; Tier 2 appropriate given null findings in healthy elderly without resistance training",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Neurotransmitter precursor support via tryptophan and tyrosine"],
        "nonCognitive": ["Muscle protein synthesis", "Muscle maintenance support in elderly", "Exercise recovery", "Body composition improvement", "Immune support via glutathione precursors"]
      },
      "dosageRange": "20-40g post-exercise; 40g/day for muscle maintenance in elderly",
      "optimalDuration": "12+ weeks for body composition; ongoing for elderly muscle maintenance",
      "studyPopulations": ["Elderly (≥65 years) with resistance exercise training", "Athletes", "Sarcopenic older adults", "Healthy adults with resistance training"],
      "mechanismsOfAction": [
        "mTOR/p70S6K1 pathway activation via leucine",
        "Muscle protein synthesis stimulation (fast-digesting leucine-rich profile)",
        "Glutathione precursor provision (cysteine, glutamate)",
        "IGF-1 pathway modulation"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["GI discomfort at high doses", "Bloating in lactose-sensitive individuals"],
        "contraindications": ["Milk protein allergy", "Phenylketonuria (phenylalanine content)"],
        "drugInteractions": ["Levodopa (leucine competition)", "Tetracycline antibiotics (calcium in dairy base)"]
      },
      "effectSizes": {
        "muscle_protein_synthesis": "Large (post-exercise vs. carbohydrate)",
        "lean_mass_elderly_RET": "Moderate (SMD ~0.3-0.5 vs. placebo+RET)",
        "body_composition_healthy_adults": "Small-Moderate (context-dependent)"
      },
      "commercialAvailability": {
        "forms": ["Powder (concentrate, isolate, hydrolysate)", "Ready-to-drink", "Bars"],
        "costRange": "$25-70/month",
        "qualityMarkers": ["Third-party tested (NSF, Informed Sport)", "No artificial sweeteners", "Grass-fed source", "≥20g protein per serving"]
      },
      "keyCitations": [
        {
          "title": "Leucine-enriched essential amino acid and carbohydrate ingestion following resistance exercise enhances mTOR signaling and protein synthesis in human muscle",
          "authors": "Tang JE et al.",
          "year": 2009,
          "doi": "10.1152/ajpendo.00582.2008",
          "pmid": "19589961"
        },
        {
          "title": "Evidence-Based Recommendations for Optimal Dietary Protein Intake in Older People: A Position Paper From the PROT-AGE Study Group",
          "authors": "Bauer J et al.",
          "year": 2015,
          "doi": "10.1016/j.jamda.2015.05.021",
          "pmid": "26170041"
        },
        {
          "title": "The effect of whey protein supplementation with and without creatine monohydrate combined with resistance training on lean tissue mass and muscle strength",
          "authors": "Li Z et al.",
          "year": 2024,
          "doi": "10.1016/j.clnu.2024.01.001",
          "pmid": "38350303"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 18,
          "researchQualityScore": 76,
          "lastEvidenceUpdate": "2026-03-06",
          "evidenceStrength": {
            "mechanisms": "Strong",
            "clinicalBenefits": "Strong",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature"
        }
      }
    },
    
    {
      "id": 32,
      "name": "Chondroitin Sulfate",
      "scientificName": "Chondroitin sulfate sodium",
      "category": "Joint Support",
      "commonNames": ["Chondroitin", "CS", "Chondroitin 4-sulfate", "Chondroitin 6-sulfate"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple large RCTs (GAIT n=1,583; CONCEPT n=604; MOVES n=606) and 4 meta-analyses (n>1,500 each). Tier 1 prevented by: null GAIT RCT (n=1,583, KEY counter-evidence for nutraceutical-grade CS), GRADE very-low certainty for nutraceutical preparations (Rojas-Briones 2017), pharmaceutical vs. nutraceutical form-dependence limiting universality, moderate effect sizes (SMD 0.18-0.35)",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": [],
        "nonCognitive": ["Joint health support", "Cartilage matrix structural support", "Osteoarthritis symptom relief", "Anti-inflammatory via NF-κB/MMP suppression", "Joint space narrowing reduction (pharmaceutical-grade CS)"]
      },
      "dosageRange": "800-1200mg daily (pharmaceutical-grade CS only)",
      "optimalDuration": "12+ weeks",
      "studyPopulations": ["Osteoarthritis patients", "Joint health seekers", "Athletes", "Elderly adults with knee OA"],
      "mechanismsOfAction": [
        "Cartilage matrix MMP/ADAMTS suppression",
        "Anti-inflammatory NF-κB pathway inhibition",
        "Synovial fluid enhancement",
        "Proteoglycan and aggrecan synthesis support"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["GI upset", "Nausea", "Heartburn"],
        "contraindications": ["Blood clotting disorders"],
        "drugInteractions": ["Warfarin/blood thinners (INR monitoring recommended)"]
      },
      "effectSizes": {
        "joint_pain": "Small to moderate (SMD 0.18-0.35; pharmaceutical-grade only)",
        "structural_jsn": "Significant JSN reduction (6 RCTs, Hochberg 2008 meta-analysis)",
        "mobility": "Small improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$20-45/month",
        "qualityMarkers": ["Pharmaceutical grade (Condrosulf or equivalent)", "Combined with glucosamine (MOVES trial)", "Third-party tested", "Not nutraceutical-grade"]
      },
      "keyCitations": [
        {
          "title": "Pharmaceutical-grade chondroitin sulfate is as effective as celecoxib and superior to placebo (CONCEPT trial)",
          "authors": "Reginster JY et al.",
          "year": 2017,
          "doi": "10.1136/annrheumdis-2016-210860",
          "pmid": "28533290"
        },
        {
          "title": "Glucosamine, chondroitin sulfate, and the two in combination for painful knee osteoarthritis (GAIT trial)",
          "authors": "Clegg DO et al.",
          "year": 2006,
          "doi": "10.1056/NEJMoa052771",
          "pmid": "16495392"
        },
        {
          "title": "Association of pharmacological treatments with long-term pain control in knee osteoarthritis (JAMA NMA, n=22,037)",
          "authors": "Gregori G et al.",
          "year": 2018,
          "doi": "10.1001/jama.2018.19319",
          "pmid": "30535141"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 15,
          "researchQualityScore": 76,
          "lastEvidenceUpdate": "2026-03-06",
          "evidenceStrength": {
            "mechanisms": "Moderate",
            "clinicalBenefits": "Moderate",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature"
        }
      }
    },
    
    {
      "id": 33,
      "name": "L-Tyrosine",
      "scientificName": "L-tyrosine",
      "category": "Amino Acid",
      "commonNames": ["Tyrosine", "L-Tyr", "N-Acetyl Tyrosine", "NALT"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Multiple small RCTs and reviews support stress-specific cognitive benefits; 2024 meta-analysis (8 RCTs, n=187) shows null effect for endurance with GRADE 'very low' certainty; individual RCTs are small (n=8–40); Tier 2 not reached due to small N, predominantly acute protocols, and absence of large pre-registered trials",
      "primaryBenefits": {
        "cognitive": ["Stress-related cognitive support", "Working memory under acute stress", "Focus under pressure"],
        "nonCognitive": ["Catecholamine synthesis", "Stress adaptation", "Thyroid hormone precursor", "Mood regulation"]
      },
      "isEnhanced": true,
      "dosageRange": "100–150 mg/kg bodyweight (acute) or 2g twice daily (chronic)",
      "optimalDuration": "Acute (single dose 1–2h pre-stressor) or 1–4 weeks chronic",
      "studyPopulations": ["Military personnel/cadets", "Adults under environmental stress (cold, altitude)", "Healthy adults — cognitive laboratory tasks"],
      "mechanismsOfAction": [
        "Dopamine synthesis precursor (rate-limiting substrate)",
        "Norepinephrine synthesis precursor",
        "Reversal of stress-induced catecholamine depletion",
        "Thyroid hormone (T3/T4) synthesis precursor"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Nausea", "Headache at high doses"],
        "contraindications": ["Hyperthyroidism", "Melanoma"],
        "drugInteractions": ["MAO inhibitors (contraindicated)", "Thyroid medications (monitor)"]
      },
      "effectSizes": {
        "cognitive_under_stress": "Small to moderate (d = 0.3–0.7 in stress paradigms)",
        "endurance_performance": "Null (ES = -0.05; Fernandez 2024 meta-analysis)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Free-form L-tyrosine preferred over N-acetyl tyrosine (bioavailability)", "Third-party tested", "Pharmaceutical grade"]
      },
      "keyCitations": [
        {
          "title": "The effect of tyrosine supplementation on whole-body endurance performance: a systematic review and meta-analysis including GRADE qualification",
          "authors": "Fernandez-Sanchez M et al.",
          "year": "2024",
          "doi": "10.1080/02640414.2024.2309434",
          "pmid": "38345351",
          "note": "KEY NULL FINDING — GRADE very-low for endurance outcomes; n=187 pooled"
        },
        {
          "title": "Effect of tyrosine supplementation on clinical and healthy populations under stress or cognitive demands — a review",
          "authors": "Nobre AC, Rao A, Owen GN",
          "year": "2015",
          "doi": "10.1016/j.jpsychires.2015.08.014",
          "pmid": "26424423"
        },
        {
          "title": "Tyrosine improves cognitive performance and reduces blood pressure in cadets after one week of a combat training course",
          "authors": "Deijen JB et al.",
          "year": "1999",
          "doi": "10.1016/s0361-9230(98)00163-4",
          "pmid": "10230711"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 3",
          "totalCitations": 11,
          "researchQualityScore": 68,
          "lastEvidenceUpdate": "2026-03-06",
          "evidenceStrength": {
            "mechanisms": "Moderate",
            "clinicalBenefits": "Moderate",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Developing"
        }
      }
    },
    
    {
      "id": 34,
      "name": "5-HTP",
      "scientificName": "5-hydroxytryptophan",
      "category": "Amino Acid",
      "commonNames": ["5-Hydroxytryptophan", "Oxitriptan", "L-5-HTP"],
      "evidenceTier": 2,
      "evidenceTierRationale": "50+ years of research across depression, sleep, migraine, and fibromyalgia; highly established serotonin precursor mechanism with proven BBB penetration; multiple RCTs and systematic reviews across independent research groups; Cochrane review (2002) found insufficient evidence for depression alone but broader multi-indication evidence base and consistent mechanistic logic support Tier 2; no large modern pre-registered RCT (n>100); GRADE certainty Low–Moderate; serotonin syndrome drug interaction risk requires clinical supervision",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Mood support", "Sleep quality", "Anxiety reduction"],
        "nonCognitive": ["Serotonin synthesis", "Depression support", "Appetite control", "Sleep regulation"]
      },
      "dosageRange": "50-300mg daily",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Depression patients", "Sleep disorders", "Weight management", "Migraine patients", "Fibromyalgia"],
      "mechanismsOfAction": [
        "Serotonin synthesis precursor — bypasses rate-limiting tryptophan hydroxylase step",
        "Crosses blood-brain barrier without active transport competition",
        "Converts to serotonin via aromatic L-amino acid decarboxylase",
        "Sleep-wake cycle regulation via melatonin precursor pathway"
      ],
      "safetyProfile": {
        "rating": "Moderate — serotonin syndrome risk with concurrent serotonergic medications requires supervision",
        "commonSideEffects": ["Nausea", "Diarrhea", "Drowsiness"],
        "contraindications": ["Concurrent SSRIs/SNRIs/MAOIs without medical supervision", "Surgery within 2 weeks"],
        "drugInteractions": ["SSRIs", "SNRIs", "MAO inhibitors", "Tramadol", "St. John's Wort"]
      },
      "effectSizes": {
        "mood": "Small to moderate",
        "sleep": "Moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Enteric-coated capsules"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["Pharmaceutical grade", "Third-party tested", "Enteric coating for GI tolerability"]
      },
      "keyCitations": [
        {
          "title": "The role of 5-hydroxytryptophan in central serotonin synthesis",
          "authors": "Turner EH et al.",
          "year": "2006",
          "doi": "10.1016/j.pharmthera.2005.06.004",
          "pmid": "16023729",
          "note": "Mechanistic review: BBB penetration and rate-limiting enzyme bypass establishing serotonin precursor mechanism"
        },
        {
          "title": "Safety of 5-hydroxytryptophan",
          "authors": "Das YT et al.",
          "year": "2004",
          "doi": "10.1016/j.toxlet.2003.12.070",
          "pmid": "15068828",
          "note": "Comprehensive safety assessment; identifies serotonin syndrome risk and manufacturing quality control requirements"
        },
        {
          "title": "The therapeutic potential of 5-hydroxytryptophan for neuropsychiatric disorders",
          "authors": "Hinz M et al.",
          "year": "2012",
          "doi": "10.2147/NDT.S33259",
          "pmid": "22888252",
          "note": "Clinical review across depression, sleep, migraine, fibromyalgia indications with dosing guidance"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 16,
          "researchQualityScore": 75,
          "lastEvidenceUpdate": "2026-03-06",
          "evidenceStrength": {
            "mechanisms": "Well-established",
            "clinicalBenefits": "Moderate",
            "safety": "Moderate",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature"
        }
      }
    },
    
    {
      "id": 35,
      "name": "Tribulus Terrestris",
      "scientificName": "Tribulus terrestris L.",
      "category": "Herbal Supplement",
      "commonNames": ["Puncture Vine", "Gokshura", "Goat's Head", "Devil's Weed"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Multiple systematic reviews and meta-analyses exist (Kamenov 2017: sexual function; Chhatre 2014: sports performance); primary marketed claim (testosterone enhancement in healthy men) is not supported by meta-analyses; modest sexual function benefits in women in one systematic review; mechanism is moderate with saponin activity documented; no large pre-registered RCTs; safety profile is well-characterized; Tier 3 reflects limited clinical benefit evidence for primary claims",
      "isEnhanced": true,
      "primaryBenefits": {
        "cognitive": ["Potential stress reduction", "Energy support"],
        "nonCognitive": ["Libido support (modest, especially women)", "Cardiovascular health support", "Antioxidant activity"]
      },
      "dosageRange": "250-750mg daily (standardized to 40-45% saponins)",
      "optimalDuration": "4-8 weeks with cycling",
      "studyPopulations": ["Adults with sexual dysfunction", "Athletes", "Middle-aged adults", "Menopausal women"],
      "mechanismsOfAction": [
        "Steroidal saponin (protodioscin) activity — potential LH and testosterone modulation",
        "Nitric oxide synthase (eNOS) enhancement — vascular and erectile function",
        "Antioxidant and free radical scavenging activity",
        "Anti-inflammatory cytokine modulation"
      ],
      "safetyProfile": {
        "rating": "Generally well tolerated; hormonal caution in sensitive populations",
        "commonSideEffects": ["Stomach upset (high doses)", "Sleep disturbances (occasional)"],
        "contraindications": ["Pregnancy", "Breastfeeding", "Hormone-sensitive conditions", "Prostate conditions"],
        "drugInteractions": ["Diabetes medications (blood glucose lowering)", "Blood pressure medications", "Hormone therapies"]
      },
      "effectSizes": {
        "testosterone": "Not significant in healthy men (Chhatre 2014 meta-analysis, 12 studies)",
        "sexual_function": "Modest improvement in sexual desire and arousal (Kamenov 2017, 11 studies, n=516; more pronounced in women)",
        "sports_performance": "No significant effects on body composition or strength (Chhatre 2014)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder", "Standardized extracts"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["Standardized saponin content (40-45%)", "Third-party testing", "Protodioscin content verified"]
      },
      "keyCitations": [
        {
          "title": "Effects of Tribulus terrestris on sexual function: A systematic review and meta-analysis",
          "authors": "Kamenov Z et al.", "year": "2017",
          "doi": "10.1016/j.maturitas.2017.01.011", "pmid": "28364864",
          "note": "Primary efficacy review: modest sexual function benefits (n=516, 11 studies); more pronounced in women; limited testosterone evidence"
        },
        {
          "title": "Effects of Tribulus terrestris supplementation on body composition and exercise performance",
          "authors": "Chhatre S et al.", "year": "2014",
          "doi": "10.1123/ijsnem.2013-0118", "pmid": "24480665",
          "note": "Meta-analysis (12 studies): no significant testosterone effects in healthy men; inconsistent performance results"
        },
        {
          "title": "Safety evaluation of Tribulus terrestris supplementation: A systematic review",
          "authors": "Neychev VK et al.", "year": "2016",
          "doi": "10.1016/j.phymed.2016.10.010", "pmid": "27823629",
          "note": "Safety review: generally well tolerated; rare GI and sleep disturbances; hormonal caution warranted"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 3",
          "totalCitations": 12,
          "researchQualityScore": 65,
          "lastEvidenceUpdate": "2026-03-06",
          "evidenceStrength": {
            "mechanisms": "Moderate",
            "clinicalBenefits": "Limited",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Established"
        }
      }
    },

    {
      "id": 36,
      "name": "Vitamin C",
      "scientificName": "Ascorbic acid",
      "category": "Essential Nutrients",
      "commonNames": ["Ascorbic Acid", "L-Ascorbate"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple meta-analyses across 5+ health domains (immune function, cardiovascular, cancer prevention, glycemic control, antioxidant), with umbrella review of 14 meta-analyses (Chai 2025) and large meta-analyses including Arshadi 2024 (69 studies) and Aragón-Vela 2026 (52 RCTs)",
      "primaryBenefits": {
        "cognitive": ["Antioxidant neuroprotection", "Stress resilience", "Mental fatigue reduction"],
        "nonCognitive": ["Immune system support", "Collagen synthesis", "Iron absorption", "Wound healing", "Cardiovascular protection", "Cellular health support", "Glycemic control"],
        "isEnhanced": true
      },
      "isEnhanced": true,
      "dosageRange": "500mg-2g daily; optimal antioxidant and immune benefit at 500-1000mg",
      "optimalDuration": "Ongoing supplementation",
      "studyPopulations": ["General population", "High-stress individuals", "Athletes", "Elderly", "Type 2 diabetes patients", "Cancer prevention populations", "COVID-19 patients"],
      "mechanismsOfAction": [
        "Powerful antioxidant activity (MDA reduction, TAC increase, GPx enhancement)",
        "Collagen synthesis cofactor",
        "Immune system modulation",
        "Neurotransmitter synthesis support",
        "Anti-inflammatory pathway regulation",
        "Iron absorption enhancement (ferric to ferrous reduction)"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["GI upset (high doses)", "Kidney stones (very high doses)"],
        "contraindications": ["History of kidney stones", "Hemochromatosis"],
        "drugInteractions": ["Iron supplements (enhances absorption)", "Some chemotherapy drugs"]
      },
      "effectSizes": {
        "antioxidant_status": "MDA significantly reduced, TAC and GPx significantly improved (Moabedi 2025, 17 RCTs, n=965)",
        "immune_function": "Cold duration reduced 8% adults, 14% children (Hemilä 2013); COVID-19 mortality OR=0.64 (Qin 2024, 22 studies)",
        "cancer_prevention": "Colorectal cancer RR=0.55, breast cancer RR=0.72, prostate cancer RR=0.88 (Arshadi 2024, 69 studies)",
        "cardiovascular": "Significant SBP reduction in T2DM (Aragón-Vela 2026, 52 RCTs, n=1,425)",
        "glycemic_control": "Significant FBG and HbA1c improvement — confirmed across 14 meta-analyses (Chai 2025 umbrella review)"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules", "Powder", "Liposomal", "Time-release"],
        "costRange": "$5-20/month",
        "qualityMarkers": ["USP verified", "Non-GMO", "Buffered forms for sensitive stomachs"]
      },
      "keyCitations": [
        {
          "title": "Vitamin C and immune function",
          "authors": "Carr & Maggini",
          "year": "2017",
          "doi": "10.3390/nu9111211"
        },
        {
          "title": "The association between vitamin C and breast cancer, prostate cancer and colorectal cancer: a dose-response meta-analysis",
          "authors": "Arshadi et al.",
          "year": "2024",
          "doi": "10.1016/j.clnesp.2024.12.001"
        },
        {
          "title": "Effects of Vitamin C and/or E Supplementation on Glycemic Control and Cardiovascular Risk Factors in Type 2 Diabetes",
          "authors": "Aragón-Vela et al.",
          "year": "2026",
          "doi": "10.1093/nutrit/nuaf133"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 23,
          "researchQualityScore": 94,
          "lastEvidenceUpdate": "2026-03-04",
          "evidenceStrength": {
            "mechanisms": "Strong",
            "clinicalBenefits": "Strong",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature",
          "publicationSpan": "2000-2026"
        }
      }
    },

    {
      "id": 37,
      "name": "Zinc",
      "scientificName": "Zinc (elemental)",
      "category": "Essential Nutrients",
      "commonNames": ["Zinc Sulfate", "Zinc Gluconate", "Zinc Picolinate", "Zinc Bisglycinate", "Zinc Citrate"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple meta-analyses across 6+ health domains (immune function, depression, ADHD, PMS, pregnancy outcomes, alopecia areata, neonatal health), with 77-RCT umbrella review (Diao 2025) and independently replicated PMS meta-analyses (Kim 2025, Haider 2025)",
      "primaryBenefits": {
        "cognitive": ["Memory support", "Attention enhancement", "Mood regulation", "Neurotransmitter function", "ADHD symptom reduction"],
        "nonCognitive": ["Immune system support", "Wound healing", "Protein synthesis", "Taste and smell", "PMS symptom relief", "Maternal and fetal health", "Neonatal health", "Hair health"],
        "isEnhanced": true
      },
      "isEnhanced": true,
      "dosageRange": "8-40mg daily; therapeutic range 15-30mg; bisglycinate preferred for absorption",
      "optimalDuration": "Ongoing supplementation (with monitoring); benefits for PMS within 1-3 cycles",
      "studyPopulations": ["Zinc-deficient individuals", "Elderly", "Vegetarians", "Athletes", "Women with PMS", "Pregnant women", "Neonates", "ADHD patients", "Alopecia areata patients"],
      "mechanismsOfAction": [
        "Enzyme cofactor (300+ enzymes and 2000+ proteins)",
        "Protein structure stabilization (zinc finger motifs)",
        "Gene expression regulation",
        "Neurotransmitter metabolism (dopamine, serotonin, GABA)",
        "NMDA receptor modulation",
        "Immune cell development and function (T-cells, NK cells)",
        "Antioxidant defense (SOD cofactor)"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Nausea (empty stomach)", "Metallic taste", "Copper deficiency (high doses)"],
        "contraindications": ["Wilson's disease"],
        "drugInteractions": ["Antibiotics (tetracyclines, quinolones)", "Diuretics", "Copper supplements", "Iron (competitive absorption)"]
      },
      "effectSizes": {
        "immune_function": "Moderate improvement (deficient individuals)",
        "cognitive_function": "Small to moderate (in deficiency)",
        "wound_healing": "Moderate improvement",
        "pms_total": "Hedges's g = -0.384 (Kim 2025, 5 RCTs)",
        "pms_physical": "Hedges's g = -0.512 (Kim 2025, 5 RCTs)",
        "fetal_growth_retardation": "RR = 0.23 (Diao 2025, 77 RCTs)",
        "alopecia_areata_association": "SMD = -0.69 (Wu 2025, 34 studies, n=4,931)"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules", "Lozenges", "Liquid"],
        "costRange": "$5-15/month",
        "qualityMarkers": ["Chelated forms preferred (bisglycinate 43% higher bioavailability)", "Third-party tested", "Proper dosing"]
      },
      "keyCitations": [
        {
          "title": "Zinc in human health: effect of zinc on immune cells",
          "authors": "Prasad",
          "year": "2008",
          "doi": "10.1007/s12026-008-8059-4"
        },
        {
          "title": "The effects of zinc supplementation on premenstrual syndrome: A systematic review and meta-analysis",
          "authors": "Kim & Lee",
          "year": "2025",
          "doi": "10.1080/03630242.2025.2539815"
        },
        {
          "title": "The effect of zinc supplementation on pregnancy outcomes: an umbrella review and updated meta-analysis",
          "authors": "Diao et al.",
          "year": "2025",
          "doi": "10.1111/jebm.70061"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 21,
          "researchQualityScore": 93,
          "lastEvidenceUpdate": "2026-03-04",
          "evidenceStrength": {
            "mechanisms": "Well-established",
            "clinicalBenefits": "Strong",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature",
          "publicationSpan": "1998-2025"
        }
      }
    },

    {
      "id": 38,
      "name": "Iron",
      "scientificName": "Iron (Fe)",
      "category": "Essential Nutrients",
      "commonNames": ["Ferrous Sulfate", "Ferrous Gluconate", "Iron Bisglycinate", "Ferrous Fumarate", "Heme Iron", "Ferric Carboxymaltose"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Umbrella review (17 SRs, Caballero-Apaza 2026) confirms cognitive benefits in children; meta-analysis of non-anemic cognitive/psychiatric outcomes (Fiani 2025, 12 RCTs, n=1408); network meta-analysis of perioperative IV iron (Xue 2025, 34 RCTs, n=4688); 6+ meta-analyses across cognitive, psychiatric, sports performance, anemia, pregnancy safety, and perioperative domains",
      "primaryBenefits": {
        "cognitive": ["Attention improvement", "Memory enhancement", "Mental fatigue reduction", "Processing speed", "Cognitive intelligence (non-anemic ID)", "Short-term memory (non-anemic ID)"],
        "nonCognitive": ["Oxygen transport", "Energy production", "Red blood cell formation", "Exercise performance", "Anxiety reduction (non-anemic ID)", "Physical well-being", "Endurance performance in athletes"],
        "isEnhanced": true
      },
      "isEnhanced": true,
      "dosageRange": "8-65mg daily; RDA 8-18mg; therapeutic 25-65mg; athletes 100mg/day; bisglycinate preferred",
      "optimalDuration": "Until iron stores normalized (3-6 months); athletic performance benefits within 8 weeks",
      "studyPopulations": ["Iron-deficient individuals", "Women of reproductive age", "Vegetarians", "Athletes", "Female athletes (up to 60% iron deficient)", "Non-anemic iron-deficient individuals", "Children with iron deficiency", "Pregnant women", "Perioperative patients"],
      "mechanismsOfAction": [
        "Oxygen transport via hemoglobin",
        "Cellular energy production (electron transport chain)",
        "Neurotransmitter synthesis (dopamine, serotonin)",
        "DNA synthesis support",
        "Myelin formation and maintenance",
        "Hematopoiesis and erythropoiesis",
        "Mitochondrial function optimization"
      ],
      "safetyProfile": {
        "rating": "Fair",
        "commonSideEffects": ["Constipation", "Stomach upset", "Nausea", "Dark stools"],
        "contraindications": ["Hemochromatosis", "Hemosiderosis", "Active peptic ulcer"],
        "drugInteractions": ["Antibiotics", "Proton pump inhibitors", "Calcium supplements"]
      },
      "effectSizes": {
        "cognitive_function": "Moderate to large in iron deficiency (d=0.46 intelligence, d=0.53 short-term memory; Fiani 2025)",
        "energy_levels": "Large improvement in deficiency (fatigue d=0.34 RCT, d=1.01 pre-post; Fiani 2025)",
        "exercise_performance": "2-20% endurance improvement, 6-15% VO2max improvement (Pengelly 2024, 23 studies)",
        "anxiety_reduction": "d = 0.34 in non-anemic iron-deficient individuals (Fiani 2025, 12 RCTs)",
        "physical_wellbeing": "d = 0.42 in non-anemic iron-deficient individuals (Fiani 2025, 12 RCTs)",
        "pregnancy_leukemia_risk": "OR = 1.01 — NO association (Dabir 2025, 9 studies, n=4,281)"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules", "Liquid", "Chewable"],
        "costRange": "$5-20/month",
        "qualityMarkers": ["Chelated forms", "Gentle formulations", "Vitamin C included"]
      },
      "keyCitations": [
        {
          "title": "Iron deficiency and cognitive function",
          "authors": "Beard",
          "year": "2001",
          "doi": "10.1093/jn/131.2.568S"
        },
        {
          "title": "Psychiatric and cognitive outcomes of iron supplementation in non-anemic individuals",
          "authors": "Fiani et al.",
          "year": "2025",
          "doi": "10.1016/j.neubiorev.2025.106372"
        },
        {
          "title": "Effect of iron supplements on cognitive development in children: an umbrella review",
          "authors": "Caballero-Apaza et al.",
          "year": "2026",
          "doi": "10.3389/fnut.2026.1718507"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 1",
          "totalCitations": 22,
          "researchQualityScore": 94,
          "lastEvidenceUpdate": "2026-03-04",
          "evidenceStrength": {
            "mechanisms": "Well-established",
            "clinicalBenefits": "Strong",
            "safety": "Well-established",
            "dosage": "Evidence-based"
          },
          "researchMaturity": "Mature",
          "publicationSpan": "1985-2026"
        }
      }
    },

    {
      "id": 39,
      "name": "Taurine",
      "scientificName": "2-Aminoethanesulfonic acid",
      "category": "Amino Acid",
      "commonNames": ["L-Taurine"],
      "evidenceTier": 3,
      "isEnhanced": true,
      "evidenceTierRationale": "Tier 3 assigned based on moderate meta-analytic evidence for endurance performance (Waldron 2018, Hedges' g=0.40, 10 studies) insufficient for Tier 2 due to moderate effect size and performance-only indication. Cardiovascular evidence derives from mechanistic and observational studies without consistent large-N RCT support. Well-established pharmacological role as the most abundant free amino acid in mammalian heart and muscle provides mechanism plausibility. GRAS-designated safety profile is strong. Further large-scale RCTs required for Tier 2 elevation.",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Stress resilience", "Mental clarity", "Exercise performance"],
        "nonCognitive": ["Cardiovascular health", "Eye health", "Bile acid conjugation", "Osmoregulation"]
      },
      "dosageRange": "1-6g daily (endurance performance); 0.5-1.5g daily (cardiovascular/general health)",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Athletes", "Cardiovascular patients", "Diabetics", "General wellness"],
      "mechanismsOfAction": [
        "Calcium regulation in cells",
        "Antioxidant properties",
        "Bile acid conjugation",
        "Neurotransmitter modulation"
      ],
      "safetyProfile": {
        "rating": "GRAS-designated amino acid; generally well tolerated up to 6g/day; very rare mild GI upset; no significant drug interactions documented in short-term clinical studies",
        "commonSideEffects": ["Very rare: mild GI upset"],
        "contraindications": ["None known"],
        "drugInteractions": ["None significant"]
      },
      "effectSizes": {
        "exercise_performance": "Hedges' g=0.40 (moderate, p=0.004) — Waldron 2018 meta-analysis, 10 studies",
        "cardiovascular_markers": "Modest improvements in blood pressure and endothelial function; effect sizes not meta-analyzed",
        "antioxidant_status": "Moderate reduction in oxidative stress markers; human data limited"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder", "Tablets"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Pure taurine", "Third-party tested", "Non-GMO"]
      },
      "keyCitations": [
        {
          "title": "The Effects of an Oral Taurine Dose and Supplementation Period on Endurance Exercise Performance in Humans: A Meta-Analysis",
          "authors": ["Waldron M", "Patterson SD", "Tallent J", "Jeffries O"],
          "year": 2018,
          "journal": "Sports Medicine",
          "doi": "10.1007/s40279-018-0896-2",
          "pmid": "29546641"
        },
        {
          "title": "Risk assessment for the amino acids taurine, L-glutamine and L-arginine",
          "authors": ["Shao A", "Hathcock JN"],
          "year": 2008,
          "journal": "Regulatory Toxicology and Pharmacology",
          "doi": "10.1016/j.yrtph.2007.07.003",
          "pmid": "17766049"
        },
        {
          "title": "Physiological actions of taurine",
          "authors": ["Huxtable RJ"],
          "year": 1992,
          "journal": "Physiological Reviews",
          "doi": "10.1152/physrev.1992.72.1.101",
          "pmid": "1731369"
        }
      ],
      "enhancedCitations": {
        "evidenceProfile": {
          "researchQualityScore": 73,
          "overallQuality": "Tier 3",
          "mechanisms": "Well-established",
          "clinicalBenefits": "Moderate",
          "safety": "Well-established",
          "dosage": "Well-established"
        }
      }
    },

    {
      "id": 40,
      "name": "GABA",
      "isEnhanced": true,
      "scientificName": "Gamma-aminobutyric acid",
      "category": "Amino Acid",
      "commonNames": ["Gamma-Aminobutyric Acid", "γ-Aminobutyric acid", "4-aminobutanoic acid"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Tier 3 assigned: oral GABA has uncertain blood-brain barrier penetration, limiting confidence in all clinical claims. Multiple small RCTs (n=13–30) demonstrate stress and relaxation benefits, likely mediated via peripheral GABA receptors and gut-brain axis mechanisms (Abdou 2006, Kanehira 2011). Safety well-established (GRAS; Oketch-Rabah 2021). Mechanistic foundation strong; large-N RCTs required to confirm CNS-mediated benefits and achieve Tier 2 elevation.",
      "primaryBenefits": {
        "cognitive": ["Relaxation promotion", "Stress reduction", "Sleep quality", "Anxiety reduction"],
        "nonCognitive": ["Muscle relaxation", "Blood pressure support", "Growth hormone release"]
      },
      "dosageRange": "100-750mg daily (stress/anxiety); 500-750mg pre-bedtime (sleep)",
      "optimalDuration": "4-8 weeks",
      "studyPopulations": ["Stressed individuals", "Athletes", "Sleep-disturbed individuals", "Anxiety-prone adults"],
      "mechanismsOfAction": [
        "Primary inhibitory neurotransmitter (GABA-A and GABA-B receptor agonism)",
        "Peripheral nervous system calming via enteric GABA receptors",
        "Gut-brain axis modulation",
        "Sleep-wake cycle regulation via GABAergic interneurons",
        "Stress response modulation through sympathetic nervous system inhibition"
      ],
      "safetyProfile": {
        "rating": "GRAS-designated (Oketch-Rabah 2021); well-characterized safety up to 750mg/day in human studies. No significant drug interactions documented in short-term clinical trials.",
        "commonSideEffects": ["Drowsiness at higher doses", "Mild tingling sensation"],
        "contraindications": ["Pregnancy and breastfeeding (insufficient safety data)", "Severe hepatic or renal impairment"],
        "drugInteractions": ["Sedative medications (additive GABAergic effects)", "Benzodiazepines (potential enhancement)", "Anticonvulsants (potential interaction — consult physician)"]
      },
      "effectSizes": {
        "relaxation": "Small to moderate effect (Abdou 2006, Kanehira 2011: n=13–30)",
        "sleep_quality": "Small improvement (Yamatsu 2016: n=40)",
        "stress_markers": "Small improvement in salivary chromogranin A and cortisol proxy measures"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$10-30/month",
        "qualityMarkers": ["Pure GABA (not GABA precursor)", "Third-party tested", "Pharmaceutical grade"]
      },
      "keyCitations": [
        {
          "title": "Safety assessment of GABA as a food ingredient",
          "authors": "Oketch-Rabah et al.",
          "year": "2021",
          "pmid": "33242518",
          "doi": "10.1016/j.fct.2020.111930"
        },
        {
          "title": "Oral administration of gamma-aminobutyric acid affects mood and CNS activities during stress",
          "authors": "Abdou et al.",
          "year": "2006",
          "pmid": "16554972",
          "doi": "10.1007/s00726-005-0287-1"
        },
        {
          "title": "GABA and glycine as neurotransmitters: a brief history",
          "authors": "Bowery & Smart",
          "year": "2006",
          "pmid": "16402094",
          "doi": "10.1038/sj.bjp.0706443"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 3",
          "totalCitations": 18,
          "researchQualityScore": 60,
          "lastUpdated": "2026-03-06"
        }
      }
    },

    {
      "id": 41,
      "name": "Inositol",
      "scientificName": "Myo-inositol",
      "category": "B-Vitamin Related",
      "commonNames": ["Myo-Inositol", "Vitamin B8"],
      "evidenceTier": 2,
      "isEnhanced": true,
      "evidenceTierRationale": "Multiple published meta-analyses across primary benefit domains meet Tier 2 threshold: Unfer 2017 (PMID 28165553) and Zeng & Yang 2018 (PMID 30062252) pooled PCOS/metabolic RCTs; Brown 2018 Cochrane (PMID 30556597) for gestational diabetes prevention; Taylor 2004 (PMID 15697057) meta-analysis for mood/depression. PCOS evidence base is the strongest domain. Tier 1 not met: individual RCTs generally moderate-N; GRADE at Moderate not High across domains.",
      "primaryBenefits": {
        "cognitive": ["Anxiety reduction", "Mood stabilization", "Stress resilience", "Mental clarity"],
        "nonCognitive": ["PCOS management", "Fertility support", "Lipid metabolism", "Insulin sensitivity"]
      },
      "dosageRange": "2-18g daily",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Anxiety disorders", "PCOS patients", "Depression", "Panic disorder"],
      "mechanismsOfAction": [
        "Second messenger system component",
        "Neurotransmitter regulation",
        "Insulin signal transduction",
        "Phospholipid membrane component"
      ],
      "safetyProfile": {
        "rating": "Well-tolerated at doses up to 18g/day in clinical trials; mild GI upset at high doses. Kalman 2004 systematic review and Carlomagno 2011 PCOS safety data confirm no serious adverse events at therapeutic doses.",
        "commonSideEffects": ["Mild GI upset (high doses)", "Nausea"],
        "contraindications": ["None known"],
        "drugInteractions": ["None significant"]
      },
      "effectSizes": {
        "anxiety_reduction": "Moderate to large effect",
        "mood_improvement": "Moderate effect",
        "pcos_symptoms": "Large improvement"
      },
      "commercialAvailability": {
        "forms": ["Powder", "Capsules", "Tablets"],
        "costRange": "$15-40/month",
        "qualityMarkers": ["Myo-inositol form", "Pure powder", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Effects of myo-inositol in women with PCOS: a systematic review and meta-analysis",
          "authors": "Unfer et al.",
          "year": "2017",
          "pmid": "28165553",
          "doi": "10.26355/eurrev_201701_17854"
        },
        {
          "title": "Inositol supplements during pregnancy for preventing gestational diabetes",
          "authors": "Brown et al.",
          "year": "2018",
          "pmid": "30556597",
          "doi": "10.1002/14651858.CD013594"
        },
        {
          "title": "Double-blind, controlled, crossover trial of inositol versus fluvoxamine for the treatment of panic disorder",
          "authors": "Palatnik et al.",
          "year": "2001",
          "pmid": "11386498",
          "doi": "10.1097/00004714-200106000-00014"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 19,
          "researchQualityScore": 68,
          "lastUpdated": "2026-03-06"
        }
      }
    },

    {
      "id": 42,
      "isEnhanced": true,
      "name": "Selenium",
      "scientificName": "Selenium (elemental)",
      "category": "Essential Nutrients",
      "commonNames": ["Selenomethionine", "Sodium Selenite"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for antioxidant function and thyroid health; moderate evidence for cognitive protection",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Cognitive aging support", "Mood regulation", "Stress resilience"],
        "nonCognitive": ["Thyroid function", "Immune system support", "Antioxidant protection", "Cellular health support"]
      },
      "dosageRange": "55-200mcg daily",
      "optimalDuration": "Ongoing supplementation",
      "studyPopulations": ["Selenium-deficient regions", "Thyroid patients", "Elderly", "Cancer risk individuals"],
      "mechanismsOfAction": [
        "Glutathione peroxidase cofactor",
        "Thyroid hormone metabolism",
        "Antioxidant enzyme systems",
        "Immune function modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Garlic breath odor (high doses)", "Hair loss (toxicity)", "Nail changes"],
        "contraindications": ["Selenium toxicity history"],
        "drugInteractions": ["None significant at normal doses"]
      },
      "effectSizes": {
        "antioxidant_status": "Moderate improvement",
        "thyroid_function": "Large improvement (in deficiency)",
        "cognitive_protection": "Small to moderate effect"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules", "Liquid"],
        "costRange": "$5-15/month",
        "qualityMarkers": ["Selenomethionine form preferred", "Third-party tested", "Proper dosing"]
      },
      "keyCitations": [
        {
          "title": "Selenium supplementation in patients with autoimmune thyroiditis decreases thyroid peroxidase antibodies concentrations",
          "authors": "Toulis KA et al.",
          "year": "2010",
          "pmid": "25324270",
          "doi": "10.1530/EJE-14-0613",
          "journal": "European Journal of Endocrinology",
          "studyType": "systematic_review"
        },
        {
          "title": "Selenium supplementation for Hashimoto's thyroiditis: systematic review and meta-analysis",
          "authors": "Wichman J et al.",
          "year": "2016",
          "pmid": "26067143",
          "doi": "10.1089/thy.2015.0063",
          "journal": "Thyroid",
          "studyType": "meta_analysis"
        },
        {
          "title": "Selenium for preventing cancer",
          "authors": "Vinceti M et al.",
          "year": "2014",
          "pmid": "24683040",
          "doi": "10.1002/14651858.CD005195.pub3",
          "journal": "Cochrane Database of Systematic Reviews",
          "studyType": "cochrane_review"
        }
      ],
      "enhancedCitations": {
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 16,
          "researchQualityScore": 67,
          "lastUpdated": "2026-03-06"
        }
      }
    },

    {
      "id": 43,
      "isEnhanced": true,
      "name": "Choline",
      "scientificName": "Choline bitartrate/CDP-Choline",
      "category": "Essential Nutrients",
      "commonNames": ["Choline Bitartrate", "CDP-Choline", "Citicoline"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for brain development and function; essential nutrient with good clinical support",
      "primaryBenefits": {
        "cognitive": ["Memory formation", "Focus enhancement", "Brain development", "Neurotransmitter synthesis"],
        "nonCognitive": ["Liver health", "Fat metabolism", "Cell membrane integrity", "Pregnancy support"]
      },
      "dosageRange": "250mg-2g daily",
      "optimalDuration": "Ongoing supplementation",
      "studyPopulations": ["Pregnant women", "Cognitive decline", "Liver disease", "General population"],
      "mechanismsOfAction": [
        "Acetylcholine synthesis precursor",
        "Phospholipid membrane synthesis",
        "Methylation pathway support",
        "Neurotransmitter production"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Fishy body odor (high doses)", "GI upset"],
        "contraindications": ["Trimethylaminuria"],
        "drugInteractions": ["None significant"]
      },
      "effectSizes": {
        "cognitive_function": "Moderate improvement (deficient individuals)",
        "memory": "Small to moderate effect",
        "liver_function": "Moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Liquid"],
        "costRange": "$10-30/month",
        "qualityMarkers": ["CDP-Choline form preferred", "Third-party tested", "Pure source"]
      },
      "keyCitations": [
        {
          "title": "Effects of choline on health across the lifespan: a systematic review",
          "authors": ["Wallace, T.C.", "Fulgoni, V.L."],
          "year": 2017,
          "journal": "Nutrition Reviews",
          "doi": "10.1093/nutrit/nux010",
          "pmid": "28449127"
        },
        {
          "title": "Choline supplementation during pregnancy: effects on mother and child",
          "authors": ["Caudill, M.A.", "Strupp, B.J.", "Muscalu, L.", "Nevins, J.E.H.", "Canfield, R.L."],
          "year": 2018,
          "journal": "Nutrients",
          "doi": "10.3390/nu10101313",
          "pmid": "30248911"
        },
        {
          "title": "Choline: an essential nutrient for public health",
          "authors": ["Zeisel, S.H.", "da Costa, K.A."],
          "year": 2009,
          "journal": "Nutrition Reviews",
          "doi": "10.1111/j.1753-4887.2009.00246.x",
          "pmid": "19906248"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 17,
          "researchQualityScore": 66,
          "lastUpdated": "2026-03-06"
        }
      }
    },

    {
      "id": 44,
      "isEnhanced": true,
      "name": "Alpha-Lipoic Acid",
      "scientificName": "α-Lipoic acid",
      "category": "Antioxidants",
      "commonNames": ["ALA", "Thioctic Acid"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for antioxidant effects and diabetic neuropathy; moderate evidence for cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Memory support", "Brain energy metabolism", "Cognitive aging"],
        "nonCognitive": ["Blood sugar control", "Diabetic neuropathy", "Antioxidant protection", "Liver health"]
      },
      "dosageRange": "100-600mg daily",
      "optimalDuration": "12-24 weeks",
      "studyPopulations": ["Diabetic patients", "Neuropathy", "Cognitive decline", "Metabolic disorders"],
      "mechanismsOfAction": [
        "Universal antioxidant (water & fat soluble)",
        "Mitochondrial energy production",
        "Glucose metabolism enhancement",
        "Heavy metal chelation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Nausea", "Stomach upset", "Rash (rare)"],
        "contraindications": ["Thiamine deficiency"],
        "drugInteractions": ["Diabetes medications", "Thyroid hormones"]
      },
      "effectSizes": {
        "neuropathy_symptoms": "Moderate to large improvement",
        "blood_sugar": "Small to moderate improvement",
        "antioxidant_status": "Moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "IV formulation"],
        "costRange": "$15-40/month",
        "qualityMarkers": ["R-form preferred", "Stabilized formulation", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Treatment of symptomatic diabetic peripheral neuropathy with the anti-oxidant alpha-lipoic acid (ALADIN Study)",
          "authors": ["Ziegler, D.", "Hanefeld, M.", "Ruhnau, K.J.", "Meissner, H.P.", "Lobisch, M.", "Schütte, K.", "Gries, F.A."],
          "year": 1995,
          "pmid": "8582546",
          "doi": "10.1007/BF00400603"
        },
        {
          "title": "Alpha-lipoic acid supplementation and diabetes treatment: a systematic review and meta-analysis of randomized controlled trials",
          "authors": ["Akbari, M.", "Ostadmohammadi, V.", "Lankarani, K.B.", "Tabrizi, R.", "Kolahdooz, F.", "Khatibi, S.R.", "Asemi, Z."],
          "year": 2018,
          "pmid": "29408453",
          "doi": "10.1016/j.metabol.2018.01.023"
        },
        {
          "title": "Treatment of diabetic polyneuropathy with the antioxidant thioctic acid (alpha-lipoic acid): a two year multicenter randomized double-blind placebo-controlled trial (ALADIN II)",
          "authors": ["Reljanovic, M.", "Reichel, G.", "Rett, K.", "Lobisch, M.", "Schuette, K.", "Möller, W.", "Tritschler, H.J.", "Mehnert, H."],
          "year": 1999,
          "pmid": "10490251",
          "doi": "10.1080/10715769900300851"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 14,
          "researchQualityScore": 68,
          "lastUpdated": "2026-03-06"
        }
      }
    },

    {
      "id": 45,
      "isEnhanced": true,
      "name": "Lutein",
      "scientificName": "Lutein",
      "category": "Antioxidants",
      "commonNames": ["Lutein", "Eye Vitamin"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for eye health; emerging evidence for cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Visual processing", "Memory support", "Brain health", "Cognitive speed"],
        "nonCognitive": ["Macular health support", "Eye health", "Skin protection", "Antioxidant protection"]
      },
      "dosageRange": "6-20mg daily",
      "optimalDuration": "Ongoing supplementation",
      "studyPopulations": ["Age-related macular degeneration", "Elderly", "Computer users", "General eye health"],
      "mechanismsOfAction": [
        "Macular pigment accumulation",
        "Blue light filtration",
        "Antioxidant protection",
        "Brain tissue accumulation"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Yellow skin tint (very high doses)"],
        "contraindications": ["None known"],
        "drugInteractions": ["None significant"]
      },
      "effectSizes": {
        "macular_density": "Moderate to large improvement",
        "visual_function": "Small to moderate improvement",
        "cognitive_speed": "Small improvement"
      },
      "commercialAvailability": {
        "forms": ["Softgels", "Capsules", "Tablets"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["FloraGLO® lutein", "Paired with zeaxanthin", "Oil-based formula"]
      },
      "keyCitations": [
        {
          "title": "Lutein + zeaxanthin and omega-3 fatty acids for age-related macular degeneration: the AREDS2 randomized clinical trial",
          "authors": ["Age-Related Eye Disease Study 2 Research Group"],
          "year": 2013,
          "journal": "JAMA",
          "pmid": "23644932",
          "doi": "10.1001/jama.2013.4997"
        },
        {
          "title": "Dose-response relationship between lutein supplementation and macular pigment optical density",
          "authors": ["Trieschmann, M.", "Beatty, S.", "Nolan, J.M.", "Hense, H.W.", "Heimes, B.", "Austermann, U.", "Fobker, M.", "Pauleikhoff, D."],
          "year": 2007,
          "journal": "Investigative Ophthalmology & Visual Science",
          "pmid": "17525179",
          "doi": "10.1167/iovs.06-1119"
        },
        {
          "title": "A systematic review on the role of lutein for eye health in the elderly population",
          "authors": ["Buscemi, S.", "Corleo, D.", "Di Pace, F.", "Petroni, M.L.", "Satriano, A.", "Marchesini, G."],
          "year": 2018,
          "journal": "Nutrients",
          "pmid": "29933554",
          "doi": "10.3390/nu10070750"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 2",
          "totalCitations": 17,
          "researchQualityScore": 70,
          "lastUpdated": "2026-03-06"
        }
      }
    },

    {
      "id": 46,
      "isEnhanced": true,
      "name": "Astaxanthin",
      "scientificName": "Astaxanthin",
      "category": "Antioxidants",
      "commonNames": ["Natural Astaxanthin", "Red Algae Extract"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Moderate evidence for antioxidant benefits; limited but promising cognitive research",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Memory support", "Mental fatigue reduction", "Brain blood flow"],
        "nonCognitive": ["Skin health", "Eye health", "Exercise recovery", "Immune support"]
      },
      "dosageRange": "4-12mg daily",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Athletes", "Aging adults", "Computer users", "Skin health"],
      "mechanismsOfAction": [
        "Potent antioxidant activity",
        "Membrane stabilization",
        "Anti-inflammatory effects",
        "Mitochondrial protection"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Slight skin coloration (high doses)"],
        "contraindications": ["None known"],
        "drugInteractions": ["None significant"]
      },
      "effectSizes": {
        "antioxidant_status": "Large improvement",
        "exercise_recovery": "Moderate improvement",
        "skin_health": "Moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Softgels", "Capsules"],
        "costRange": "$20-50/month",
        "qualityMarkers": ["Natural source (Haematococcus pluvialis)", "Third-party tested", "Oil-based"]
      },
      "keyCitations": [
        {
          "pmid": "20553730",
          "title": "Astaxanthin decreased oxidative stress and inflammation and enhanced immune response in humans",
          "authors": "Park JS, Chyun JH, Kim YK, Line LL, Chew BP",
          "year": 2010,
          "journal": "Journal of Clinical Biochemistry and Nutrition",
          "doi": "10.3164/jcbn.09-91"
        },
        {
          "pmid": "22428137",
          "title": "Cosmetic benefits of astaxanthin on humans subjects",
          "authors": "Tominaga K, Hongo N, Karato M, Yamashita E",
          "year": 2012,
          "journal": "Acta Biochimica Polonica",
          "doi": "10.18388/abp.2012_2088"
        },
        {
          "pmid": "21800280",
          "title": "Effect of astaxanthin on cycling time trial performance",
          "authors": "Earnest CP, Lupo M, White KM, Church TS",
          "year": 2011,
          "journal": "International Journal of Sports Medicine",
          "doi": "10.1055/s-0030-1264780"
        }
      ],
      "enhancedCitations": {
        "researchQualityScore": 55,
        "totalCitations": 15,
        "overallQuality": "Tier 3",
        "lastUpdated": "2026-03-06",
        "publicationSpan": "2000-2012",
        "evidenceStrength": {
          "mechanisticBasis": "Established",
          "clinicalBenefits": "Emerging",
          "safetyRecord": "Favorable",
          "doseOptimization": "Preliminary"
        },
        "citationFile": "data/enhanced_citations/46_enhanced.js",
        "processingMode": "Mode 2+",
        "isEnhanced": true
      }
    },

    {
      "id": 47,
      "name": "Ginger",
      "scientificName": "Zingiber officinale",
      "category": "Herbal Supplement",
      "commonNames": ["Ginger Root", "Zingiber"],
      "isEnhanced": true,
      "evidenceTier": 2,
      "evidenceTierRationale": "Tier 2: Two meta-analyses establish pooled evidence anchors (NVP meta-analysis N=1,278 Viljoen 2014; OA meta-analysis N=593 Bartels 2015). Dual COX/LOX inhibition mechanism well-established. Third metabolic meta-analysis N=454 (Zhu 2018). Tier 1 not reached: no Cochrane review, no single landmark RCT N≥500, GRADE MODERATE evidence level.",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Memory enhancement", "Anti-inflammatory effects", "Mood support"],
        "nonCognitive": ["Nausea reduction", "Digestive health", "Anti-inflammatory", "Pain relief"]
      },
      "dosageRange": "500mg-2g daily",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Nausea sufferers", "Inflammation", "Digestive issues", "General wellness"],
      "mechanismsOfAction": [
        "COX and LOX inhibition",
        "5-HT3 receptor antagonism",
        "Antioxidant activity",
        "Prostaglandin modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Heartburn", "Stomach upset", "Diarrhea"],
        "contraindications": ["Bleeding disorders", "Gallstones"],
        "drugInteractions": ["Blood thinners", "Diabetes medications"]
      },
      "effectSizes": {
        "nausea_reduction": "Large improvement",
        "inflammation_markers": "Moderate improvement",
        "digestive_symptoms": "Moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Tea", "Fresh root", "Powder"],
        "costRange": "$8-20/month",
        "qualityMarkers": ["Standardized gingerol content", "Organic", "Third-party tested"]
      },
      "keyCitations": [
        {
          "pmid": "24674712",
          "title": "A systematic review and meta-analysis of the effect and safety of ginger in the treatment of pregnancy-associated nausea and vomiting",
          "authors": "Viljoen E, Visser J, Koen N, Musekiwa A",
          "year": 2014,
          "journal": "Nutrition Journal"
        },
        {
          "pmid": "25749012",
          "title": "Efficacy and safety of ginger in osteoarthritis patients: A meta-analysis of randomized placebo-controlled trials",
          "authors": "Bartels EM et al.",
          "year": 2015,
          "journal": "Osteoarthritis and Cartilage"
        },
        {
          "pmid": "17605155",
          "title": "Ginger—An herbal medicinal product with broad anti-inflammatory actions",
          "authors": "Grzanna R, Lindmark L, Frondoza CG",
          "year": 2007,
          "journal": "Journal of Medicinal Food"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true,
        "researchQualityScore": 65,
        "totalCitations": 15,
        "overallQuality": "Tier 2",
        "lastUpdated": "2026-03-06",
        "dataFile": "47_enhanced.js"
      }
    },

    {
      "id": 48,
      "name": "Garlic",
      "scientificName": "Allium sativum",
      "category": "Herbal Supplement",
      "commonNames": ["Aged Garlic Extract", "Allicin", "Garlic Extract"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for cardiovascular health; moderate evidence for immune and cognitive support",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Cognitive aging support", "Brain circulation", "Memory support"],
        "nonCognitive": ["Cardiovascular health", "Immune support", "Cholesterol metabolism support", "Blood pressure support"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "600mg-2g daily",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Cardiovascular disease", "High cholesterol", "Hypertension", "Immune support"],
      "mechanismsOfAction": [
        "Allicin and sulfur compounds",
        "Antioxidant activity",
        "Nitric oxide production",
        "Cholesterol synthesis inhibition"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Garlic odor", "GI upset", "Heartburn"],
        "contraindications": ["Bleeding disorders", "Surgery within 2 weeks"],
        "drugInteractions": ["Blood thinners", "HIV medications"]
      },
      "effectSizes": {
        "cholesterol_reduction": "Small to moderate improvement",
        "blood_pressure": "Small improvement",
        "immune_function": "Small to moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Aged extract", "Fresh cloves"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Aged garlic extract", "Standardized allicin", "Enteric coated"]
      },
      "keyCitations": [
        {
          "title": "Garlic for cardiovascular disease prevention",
          "authors": "Ried et al.",
          "year": "2016",
          "doi": "10.1016/j.jnutbio.2015.10.015"
        }
      ]
    },

    {
      "id": 49,
      "name": "Echinacea",
      "scientificName": "Echinacea purpurea",
      "category": "Herbal Supplement",
      "commonNames": ["Purple Coneflower", "Echinacea Extract"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Moderate evidence for immune support; traditional use with some clinical validation",
      "primaryBenefits": {
        "cognitive": ["Stress resilience", "Mental fatigue reduction"],
        "nonCognitive": ["Immune system support", "Cold season immune support", "Upper respiratory health", "Anti-inflammatory"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "300mg-1g daily",
      "optimalDuration": "7-10 days (acute use) or 8-12 weeks (preventive)",
      "studyPopulations": ["Cold season immune support", "Upper respiratory infections", "Immune compromised", "Athletes"],
      "mechanismsOfAction": [
        "Immune system modulation",
        "Cytokine regulation",
        "Antioxidant activity",
        "Anti-inflammatory effects"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Allergic reactions", "GI upset", "Dizziness"],
        "contraindications": ["Autoimmune diseases", "Pregnancy", "Allergies to Asteraceae family"],
        "drugInteractions": ["Immunosuppressive drugs", "Caffeine"]
      },
      "effectSizes": {
        "cold_prevention": "Small improvement",
        "cold_duration": "Small reduction",
        "immune_markers": "Small to moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Tincture", "Tea"],
        "costRange": "$8-20/month",
        "qualityMarkers": ["Standardized extract", "E. purpurea species", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Echinacea for preventing and treating the common cold",
          "authors": "Karsch-Völk et al.",
          "year": "2014",
          "doi": "10.1002/14651858.CD000530.pub3"
        }
      ]
    },

    {
      "id": 50,
      "name": "Caffeine",
      "scientificName": "1,3,7-Trimethylxanthine",
      "category": "Performance Enhancers",
      "commonNames": ["Caffeine Anhydrous", "Natural Caffeine"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Extensive research showing strong evidence for cognitive enhancement and alertness",
      "primaryBenefits": {
        "cognitive": ["Alertness enhancement", "Focus improvement", "Reaction time", "Memory consolidation"],
        "nonCognitive": ["Exercise performance", "Fat burning", "Metabolic boost", "Mood enhancement"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "50-400mg daily",
      "optimalDuration": "Acute use (avoid daily tolerance)",
      "studyPopulations": ["Healthy adults", "Athletes", "Shift workers", "Sleep-deprived individuals"],
      "mechanismsOfAction": [
        "Adenosine receptor antagonism",
        "Dopamine enhancement",
        "Adrenaline stimulation",
        "Calcium release in muscles"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Jitters", "Anxiety", "Insomnia", "Dependence"],
        "contraindications": ["Pregnancy", "Anxiety disorders", "Heart conditions"],
        "drugInteractions": ["Stimulant medications", "Blood thinners", "Some antibiotics"]
      },
      "effectSizes": {
        "alertness": "Large improvement",
        "reaction_time": "Moderate improvement",
        "exercise_performance": "Moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules", "Powder", "Beverages"],
        "costRange": "$5-15/month",
        "qualityMarkers": ["USP verified", "Natural source", "Precise dosing"]
      },
      "keyCitations": [
        {
          "title": "Caffeine and cognitive performance",
          "authors": "Nehlig",
          "year": "2010",
          "doi": "10.1111/j.1469-8986.2010.00992.x"
        }
      ]
    },
    
    {
      "id": 51,
      "name": "Reishi Mushroom",
      "scientificName": "Ganoderma lucidum",
      "category": "Herbal Supplement",
      "commonNames": ["Lingzhi", "Ganoderma", "Red Reishi"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for immune and stress support; moderate evidence for cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Stress resilience", "Mental clarity", "Sleep quality", "Mood stabilization"],
        "nonCognitive": ["Immune system support", "Liver health", "Cardiovascular support", "Anti-inflammatory"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "1-3g daily (extract) or 6-12g dried",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Chronic fatigue", "Stress-related disorders", "Immune compromised", "Sleep disorders"],
      "mechanismsOfAction": [
        "Beta-glucan immune modulation",
        "Triterpene liver protection",
        "Adaptogenic stress response",
        "Neurotransmitter regulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild digestive upset", "Dizziness (rare)", "Skin rash (allergic)"],
        "contraindications": ["Autoimmune diseases", "Blood thinning medications"],
        "drugInteractions": ["Anticoagulants", "Immunosuppressive drugs"]
      },
      "effectSizes": {
        "stress_reduction": "Moderate improvement",
        "immune_markers": "Moderate to large improvement",
        "sleep_quality": "Small to moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Powder", "Capsules", "Tincture", "Tea"],
        "costRange": "$20-60/month",
        "qualityMarkers": ["Standardized beta-glucan content", "Organic certification", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Ganoderma lucidum for immune and stress support",
          "authors": "Chang & Wasser",
          "year": "2012",
          "doi": "10.1080/19476337.2012.686059"
        }
      ]
    },

    {
      "id": 52,
      "name": "Cordyceps",
      "scientificName": "Cordyceps sinensis/militaris",
      "category": "Herbal Supplement",
      "commonNames": ["Cordyceps Mushroom", "Caterpillar Fungus"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for exercise performance and energy; moderate evidence for cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Mental energy", "Focus enhancement", "Stress resilience", "Cognitive endurance"],
        "nonCognitive": ["Exercise performance", "Energy production", "Respiratory health", "Kidney health"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "1-3g daily",
      "optimalDuration": "4-8 weeks",
      "studyPopulations": ["Athletes", "Chronic fatigue", "Elderly", "Respiratory conditions"],
      "mechanismsOfAction": [
        "ATP and oxygen utilization enhancement",
        "Mitochondrial function improvement",
        "Adaptogenic stress response",
        "Adenosine receptor modulation"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Very rare: mild nausea"],
        "contraindications": ["None known"],
        "drugInteractions": ["None significant"]
      },
      "effectSizes": {
        "exercise_performance": "Moderate improvement",
        "energy_levels": "Moderate improvement",
        "oxygen_utilization": "Small to moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder", "Tincture"],
        "costRange": "$25-70/month",
        "qualityMarkers": ["CS-4 strain", "Standardized cordycepin", "Organic cultivation"]
      },
      "keyCitations": [
        {
          "title": "Cordyceps sinensis for exercise performance",
          "authors": "Hirsch et al.",
          "year": "2017",
          "doi": "10.1080/19390211.2016.1203386"
        }
      ]
    },

    {
      "id": 53,
      "name": "Spirulina",
      "scientificName": "Arthrospira platensis",
      "category": "Antioxidants",
      "commonNames": ["Blue-Green Algae", "Arthrospira"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for nutritional benefits and antioxidant effects; moderate evidence for cognitive support",
      "primaryBenefits": {
        "cognitive": ["Neuroprotection", "Mental clarity", "Focus support", "Brain energy"],
        "nonCognitive": ["Immune support", "Antioxidant protection", "Protein source", "Cardiovascular health"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "1-8g daily",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Malnutrition", "Athletes", "Cardiovascular disease", "Immune support"],
      "mechanismsOfAction": [
        "High protein and micronutrient content",
        "Phycocyanin antioxidant activity",
        "Immune system modulation",
        "Nitric oxide production"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Green-colored stool", "Mild nausea (high doses)"],
        "contraindications": ["Phenylketonuria", "Autoimmune diseases"],
        "drugInteractions": ["Immunosuppressive drugs"]
      },
      "effectSizes": {
        "antioxidant_status": "Moderate to large improvement",
        "immune_function": "Moderate improvement",
        "nutritional_status": "Large improvement"
      },
      "commercialAvailability": {
        "forms": ["Powder", "Tablets", "Capsules"],
        "costRange": "$15-40/month",
        "qualityMarkers": ["Organic certification", "Heavy metal testing", "Third-party verified"]
      },
      "keyCitations": [
        {
          "title": "Spirulina for nutrition and health benefits",
          "authors": "Wu et al.",
          "year": "2016",
          "doi": "10.1155/2016/3649162"
        }
      ]
    },

    {
      "id": 54,
      "name": "Chlorella",
      "scientificName": "Chlorella vulgaris",
      "category": "Antioxidants",
      "commonNames": ["Green Algae", "Chlorella Supplement"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Moderate evidence for detoxification and nutritional benefits; limited evidence for cognitive effects",
      "primaryBenefits": {
        "cognitive": ["Mental clarity", "Detox support", "Brain energy", "Neuroprotection"],
        "nonCognitive": ["Heavy metal detox", "Immune support", "Digestive health", "Nutritional support"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "3-10g daily",
      "optimalDuration": "4-8 weeks",
      "studyPopulations": ["Heavy metal exposure", "Digestive issues", "Immune support", "Nutritional deficiency"],
      "mechanismsOfAction": [
        "Chlorophyll detoxification support",
        "Heavy metal binding",
        "Immune system enhancement",
        "Antioxidant protection"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Green stool", "Nausea", "Gas", "Stomach cramping"],
        "contraindications": ["Iodine sensitivity", "Autoimmune diseases"],
        "drugInteractions": ["Blood thinners", "Immunosuppressive drugs"]
      },
      "effectSizes": {
        "detoxification": "Moderate improvement",
        "immune_markers": "Small to moderate improvement",
        "nutritional_status": "Moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Powder", "Capsules"],
        "costRange": "$20-50/month",
        "qualityMarkers": ["Cracked cell wall", "Organic certification", "Heavy metal tested"]
      },
      "keyCitations": [
        {
          "title": "Chlorella vulgaris for health and detoxification",
          "authors": "Panahi et al.",
          "year": "2016",
          "doi": "10.1007/s10238-016-0424-9"
        }
      ]
    },

    {
      "id": 55,
      "name": "Huperzine A",
      "scientificName": "Huperzia serrata extract",
      "category": "Nootropics",
      "commonNames": ["Chinese Club Moss Extract", "HupA"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for acetylcholinesterase inhibition; moderate evidence for memory enhancement",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Learning improvement", "Focus enhancement", "Neuroprotection"],
        "nonCognitive": ["Alzheimer's disease support", "Age-related cognitive decline"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "50-200mcg daily",
      "optimalDuration": "8-12 weeks (with breaks)",
      "studyPopulations": ["Alzheimer's disease", "Age-related cognitive decline", "Memory impairment", "Students"],
      "mechanismsOfAction": [
        "Acetylcholinesterase inhibition",
        "NMDA receptor antagonism",
        "Nerve growth factor protection",
        "Beta-amyloid neuroprotection"
      ],
      "safetyProfile": {
        "rating": "Fair",
        "commonSideEffects": ["Nausea", "Vomiting", "Diarrhea", "Sweating"],
        "contraindications": ["Heart conditions", "Epilepsy", "Urinary obstruction"],
        "drugInteractions": ["Cholinesterase inhibitors", "Anticholinergic drugs"]
      },
      "effectSizes": {
        "memory_enhancement": "Moderate improvement",
        "learning_capacity": "Small to moderate improvement",
        "cognitive_decline": "Small improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["Standardized 1% huperzine A", "Third-party tested", "Precise dosing"]
      },
      "keyCitations": [
        {
          "title": "Huperzine A for Alzheimer's disease",
          "authors": "Yang et al.",
          "year": "2013",
          "doi": "10.1002/14651858.CD008975.pub2"
        }
      ]
    },

    {
      "id": 56,
      "name": "Vinpocetine",
      "scientificName": "Ethyl apovincaminate",
      "category": "Nootropics",
      "commonNames": ["Periwinkle Extract", "Cavinton"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Moderate evidence for cerebral circulation; limited evidence for cognitive enhancement in healthy individuals",
      "primaryBenefits": {
        "cognitive": ["Cerebral circulation", "Memory support", "Focus enhancement", "Mental clarity"],
        "nonCognitive": ["Stroke recovery", "Hearing protection", "Eye health", "Vascular health"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "5-20mg daily",
      "optimalDuration": "4-8 weeks",
      "studyPopulations": ["Stroke patients", "Cognitive decline", "Hearing loss", "Vascular dementia"],
      "mechanismsOfAction": [
        "Cerebral vasodilation",
        "Improved glucose utilization",
        "Sodium channel modulation",
        "Phosphodiesterase inhibition"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Nausea", "Sleep disturbances", "Dry mouth"],
        "contraindications": ["Pregnancy", "Bleeding disorders"],
        "drugInteractions": ["Blood thinners", "Anti-seizure medications"]
      },
      "effectSizes": {
        "cerebral_circulation": "Moderate improvement",
        "cognitive_function": "Small improvement",
        "memory": "Small improvement"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Pharmaceutical grade", "Standardized extract", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Vinpocetine for cognitive impairment and dementia",
          "authors": "Szatmári & Whitehouse",
          "year": "2003",
          "doi": "10.1002/14651858.CD003119"
        }
      ]
    },

    {
      "id": 57,
      "name": "PEA (Phenylethylamine)",
      "scientificName": "2-Phenylethylamine",
      "category": "Amino Acid",
      "commonNames": ["Phenethylamine", "β-Phenylethylamine"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Limited human studies; traditional use and theoretical mechanisms for mood and focus",
      "primaryBenefits": {
        "cognitive": ["Mood enhancement", "Focus improvement", "Mental energy", "Alertness"],
        "nonCognitive": ["Weight management", "Exercise performance", "Emotional well-being"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "100-500mg daily",
      "optimalDuration": "2-4 weeks (cycling recommended)",
      "studyPopulations": ["Depression", "ADHD", "Weight management", "Athletic performance"],
      "mechanismsOfAction": [
        "Dopamine and norepinephrine release",
        "Monoamine reuptake inhibition",
        "Trace amine receptor activation",
        "Endogenous amphetamine-like effects"
      ],
      "safetyProfile": {
        "rating": "Fair",
        "commonSideEffects": ["Jitters", "Anxiety", "Insomnia", "Heart palpitations"],
        "contraindications": ["MAO inhibitor use", "Heart conditions", "Anxiety disorders"],
        "drugInteractions": ["MAO inhibitors", "Stimulant medications", "Antidepressants"]
      },
      "effectSizes": {
        "mood_enhancement": "Small to moderate (short-term)",
        "focus": "Small improvement",
        "energy": "Moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder"],
        "costRange": "$15-30/month",
        "qualityMarkers": ["Pure source", "Third-party tested", "Proper storage"]
      },
      "keyCitations": [
        {
          "title": "Phenylethylamine and mood disorders",
          "authors": "Sabelli & Javaid",
          "year": "1995",
          "doi": "10.1007/BF02245820"
        }
      ]
    },

    {
      "id": 58,
      "name": "MCT Oil",
      "scientificName": "Medium-chain triglycerides",
      "category": "Performance Enhancers",
      "commonNames": ["Medium Chain Triglycerides", "Caprylic Triglycerides"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Strong evidence for ketone production and brain energy; moderate evidence for cognitive enhancement",
      "primaryBenefits": {
        "cognitive": ["Brain energy", "Mental clarity", "Focus enhancement", "Cognitive endurance"],
        "nonCognitive": ["Weight management", "Energy production", "Athletic performance", "Digestive health"],
    "isEnhanced": true
      },
      "dosageRange": "5-30ml daily",
      "optimalDuration": "Ongoing use (start low, build up)",
      "studyPopulations": ["Ketogenic dieters", "Athletes", "Cognitive decline", "Weight management"],
      "mechanismsOfAction": [
        "Rapid ketone body production",
        "Alternative brain fuel source",
        "Bypass glucose metabolism",
        "Mitochondrial energy enhancement"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Digestive upset (high doses)", "Diarrhea", "Nausea"],
        "contraindications": ["Liver disease", "Gallbladder problems"],
        "drugInteractions": ["None significant"]
      },
      "effectSizes": {
        "ketone_production": "Large improvement",
        "cognitive_energy": "Moderate improvement",
        "mental_clarity": "Small to moderate improvement"
      },
      "commercialAvailability": {
        "forms": ["Liquid oil", "Powder", "Capsules"],
        "costRange": "$20-40/month",
        "qualityMarkers": ["C8/C10 ratio", "Organic coconut source", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Medium-chain triglycerides and cognitive function",
          "authors": "Croteau et al.",
          "year": "2018",
          "doi": "10.1080/1028415X.2017.1387721"
        }
      ]
    },
    {
      "id": 59,
      "name": "Hawthorn Berry",
      "scientificName": "Crataegus monogyna",
      "category": "Herbal Supplement",
      "commonNames": ["Hawthorn", "May Berry", "Whitethorn"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple RCTs demonstrating cardiovascular benefits",
      "primaryBenefits": {
        "cognitive": ["Improved circulation to brain", "Mild cognitive support via cardiovascular health"],
        "nonCognitive": ["Heart health support", "Blood pressure regulation", "Cardiovascular endurance"],
    "isEnhanced": true
      },
      "dosageRange": "160-1800mg daily (standardized extract)",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["Adults with mild heart conditions", "Healthy adults 40+"],
      "mechanismsOfAction": [
        "ACE inhibition",
        "Antioxidant cardiovascular protection",
        "Improved coronary blood flow",
        "Cardiac muscle strengthening"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild dizziness", "Nausea", "Heart palpitations (rare)"],
        "contraindications": ["Pregnancy", "Breastfeeding", "Heart medications without supervision"],
        "drugInteractions": ["May enhance cardiac medications", "Blood pressure medications"]
      },
      "effectSizes": {
        "cardiovascular": "Moderate (standardized mean difference 0.4-0.6)",
        "bloodPressure": "Small to moderate (5-10 mmHg reduction)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Liquid extract", "Tea"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Standardized to oligomeric procyanidins", "Organic certification"]
      },
      "keyCitations": [
        {
          "title": "Hawthorn extract for treating chronic heart failure",
          "authors": "Pittler MH, et al.",
          "journal": "Cochrane Database Syst Rev",
          "year": 2008,
          "doi": "10.1002/14651858.CD005312.pub2"
        }
      ],
      "healthDomains": ["Cardiovascular Health", "Neuroprotection", "Energy & Vitality"]
    },
    {
      "id": 60,
      "name": "Red Yeast Rice",
      "scientificName": "Monascus purpureus",
      "category": "Metabolic Support",
      "commonNames": ["Hongqu", "Red Rice", "Angkak"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Well-established cholesterol-lowering effects in multiple RCTs",
      "primaryBenefits": {
        "cognitive": ["Improved brain circulation via cholesterol management", "Reduced vascular cognitive impairment risk"],
        "nonCognitive": ["Cholesterol metabolism support", "Cardiovascular protection", "Lipid profile support"],
    "isEnhanced": true
      },
      "dosageRange": "1200-2400mg daily (standardized extract)",
      "optimalDuration": "8-12 weeks minimum",
      "studyPopulations": ["Adults with elevated cholesterol", "Cardiovascular risk populations"],
      "mechanismsOfAction": [
        "HMG-CoA reductase inhibition",
        "Natural statin activity",
        "Cholesterol synthesis reduction",
        "Antioxidant cardiovascular effects"
      ],
      "safetyProfile": {
        "rating": "Moderate",
        "commonSideEffects": ["Muscle pain", "Digestive upset", "Headache"],
        "contraindications": ["Pregnancy", "Liver disease", "Statin medication users"],
        "drugInteractions": ["Statins", "Anticoagulants", "Cyclosporine"]
      },
      "effectSizes": {
        "cholesterolReduction": "Large (20-30mg/dL LDL reduction)",
        "cardiovascular": "Moderate for lipid management"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["Standardized monacolin K content", "Citrinin-free"]
      },
      "keyCitations": [
        {
          "title": "Red yeast rice for the treatment of dyslipidemia",
          "authors": "Gerards MC, et al.",
          "journal": "Ann Intern Med",
          "year": 2015,
          "doi": "10.7326/M14-2894"
        }
      ],
      "healthDomains": ["Cardiovascular Health", "Metabolic Support", "Neuroprotection"]
    },
    {
      "id": 61,
      "name": "Chromium",
      "scientificName": "Chromium picolinate",
      "category": "Essential Nutrients",
      "commonNames": ["Chromium Picolinate", "Trivalent Chromium"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Consistent evidence for glucose metabolism and insulin sensitivity",
      "primaryBenefits": {
        "cognitive": ["Blood sugar stability supporting cognitive function", "Reduced brain fog from glucose fluctuations"],
        "nonCognitive": ["Improved insulin sensitivity", "Blood sugar regulation", "Metabolic enhancement"],
    "isEnhanced": true
      },
      "dosageRange": "200-400mcg daily",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["Adults with insulin resistance", "Type 2 diabetics", "Metabolic syndrome"],
      "mechanismsOfAction": [
        "Enhanced insulin receptor binding",
        "Glucose transporter activation",
        "Improved glucose uptake",
        "Insulin sensitivity enhancement"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Rare: skin irritation", "GI upset (high doses)"],
        "contraindications": ["Pregnancy (high doses)", "Kidney disease"],
        "drugInteractions": ["Diabetes medications", "Antacids may reduce absorption"]
      },
      "effectSizes": {
        "glucoseControl": "Small to moderate (HbA1c reduction 0.5-1%)",
        "insulinSensitivity": "Moderate in insulin-resistant populations"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets"],
        "costRange": "$8-20/month",
        "qualityMarkers": ["Chromium picolinate form", "USP verified"]
      },
      "keyCitations": [
        {
          "title": "Chromium supplementation in overweight and obesity",
          "authors": "Tian H, et al.",
          "journal": "Obesity Reviews",
          "year": 2013,
          "doi": "10.1111/obr.12026"
        }
      ],
      "healthDomains": ["Blood Sugar Control", "Metabolic Support", "Energy & Vitality"]
    },
    {
      "id": 62,
      "name": "Vanadium",
      "scientificName": "Vanadyl sulfate",
      "category": "Essential Nutrients",
      "commonNames": ["Vanadyl Sulfate", "BMOV"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Limited but promising human studies for glucose metabolism",
      "primaryBenefits": {
        "cognitive": ["Stable blood glucose supporting cognitive performance", "Reduced hypoglycemic episodes"],
        "nonCognitive": ["Insulin mimetic effects", "Enhanced glucose uptake", "Metabolic support"],
    "isEnhanced": true
      },
      "dosageRange": "10-100mg daily (vanadyl sulfate)",
      "optimalDuration": "4-8 weeks",
      "studyPopulations": ["Type 2 diabetics", "Insulin-resistant individuals"],
      "mechanismsOfAction": [
        "Protein tyrosine phosphatase inhibition",
        "Insulin receptor tyrosine kinase activation",
        "Glucose transporter enhancement",
        "Insulin-mimetic activity"
      ],
      "safetyProfile": {
        "rating": "Moderate",
        "commonSideEffects": ["GI upset", "Green tongue discoloration", "Diarrhea"],
        "contraindications": ["Pregnancy", "Kidney disease", "Bipolar disorder"],
        "drugInteractions": ["Diabetes medications", "May affect lithium levels"]
      },
      "effectSizes": {
        "glucoseControl": "Small to moderate in diabetic populations",
        "insulinSensitivity": "Moderate short-term effects"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets"],
        "costRange": "$12-30/month",
        "qualityMarkers": ["Pharmaceutical grade", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Effects of vanadium on glucose metabolism",
          "authors": "Goldfine AB, et al.",
          "journal": "Diabetes",
          "year": 2000,
          "doi": "10.2337/diabetes.49.12.2099"
        }
      ],
      "healthDomains": ["Blood Sugar Control", "Metabolic Support"]
    },
    {
      "id": 63,
      "name": "Bitter Melon",
      "scientificName": "Momordica charantia",
      "category": "Herbal Supplement",
      "commonNames": ["Bitter Gourd", "Balsam Pear", "Karela"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple studies showing glucose-lowering effects",
      "primaryBenefits": {
        "cognitive": ["Blood sugar stability supporting cognitive function", "Neuroprotective compounds"],
        "nonCognitive": ["Blood glucose reduction", "Insulin sensitivity improvement", "Antioxidant effects"],
    "isEnhanced": true
      },
      "dosageRange": "500-2000mg daily (extract), 50-100ml fresh juice",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Type 2 diabetics", "Prediabetic individuals", "Metabolic syndrome"],
      "mechanismsOfAction": [
        "Alpha-glucosidase inhibition",
        "Glucose transporter enhancement",
        "Insulin secretion stimulation",
        "Antioxidant pancreatic protection"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["GI upset", "Diarrhea", "Abdominal pain"],
        "contraindications": ["Pregnancy", "Hypoglycemia", "G6PD deficiency"],
        "drugInteractions": ["Diabetes medications", "May enhance hypoglycemic effects"]
      },
      "effectSizes": {
        "glucoseReduction": "Moderate (20-30mg/dL fasting glucose reduction)",
        "HbA1c": "Small to moderate (0.3-0.8% reduction)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Fresh juice"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Standardized extract", "Organic certification"]
      },
      "keyCitations": [
        {
          "title": "Bitter melon (Momordica charantia) in patients with type 2 diabetes mellitus",
          "authors": "Peter EL, et al.",
          "journal": "Food Funct",
          "year": 2019,
          "doi": "10.1039/c8fo02206g"
        }
      ],
      "healthDomains": ["Blood Sugar Control", "Metabolic Support", "Antioxidant Support"]
    },
    {
      "id": 64,
      "name": "Gymnema Sylvestre",
      "scientificName": "Gymnema sylvestre",
      "category": "Herbal Supplement",
      "commonNames": ["Sugar Destroyer", "Gurmar", "Madhunashini"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Established traditional use with growing clinical evidence",
      "primaryBenefits": {
        "cognitive": ["Stable blood sugar supporting cognitive performance", "Reduced sugar cravings"],
        "nonCognitive": ["Blood sugar regulation", "Insulin production support", "Sugar absorption reduction"],
    "isEnhanced": true
      },
      "dosageRange": "200-800mg daily (standardized extract)",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["Type 2 diabetics", "Prediabetic individuals", "Sugar craving management"],
      "mechanismsOfAction": [
        "Gymnemic acid sugar blocking",
        "Pancreatic beta cell regeneration",
        "Glucose absorption inhibition",
        "Insulin secretion enhancement"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild hypoglycemia", "GI upset", "Headache"],
        "contraindications": ["Pregnancy", "Hypoglycemia", "Type 1 diabetes without supervision"],
        "drugInteractions": ["Diabetes medications", "May enhance insulin effects"]
      },
      "effectSizes": {
        "glucoseControl": "Moderate (fasting glucose reduction 20-40mg/dL)",
        "sugarCravings": "Large subjective reduction"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$12-28/month",
        "qualityMarkers": ["Standardized gymnemic acids", "Organic sourcing"]
      },
      "keyCitations": [
        {
          "title": "Use of Gymnema sylvestre leaf extract in the control of blood glucose",
          "authors": "Baskaran K, et al.",
          "journal": "J Ethnopharmacol",
          "year": 1990,
          "doi": "10.1016/0378-8741(90)90036-C"
        }
      ],
      "healthDomains": ["Blood Sugar Control", "Metabolic Support", "Appetite Control"]
    },
    {
      "id": 65,
      "name": "Fenugreek",
      "scientificName": "Trigonella foenum-graecum",
      "category": "Herbal Supplement",
      "commonNames": ["Greek Hay", "Methi", "Bird's Foot"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple RCTs showing metabolic and hormonal benefits",
      "primaryBenefits": {
        "cognitive": ["Blood sugar stability supporting cognitive function", "Hormonal balance cognitive effects"],
        "nonCognitive": ["Blood glucose regulation", "Testosterone support", "Digestive health", "Lactation support"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "500-1000mg daily (seed extract)",
      "optimalDuration": "6-12 weeks",
      "studyPopulations": ["Type 2 diabetics", "Men with low testosterone", "Lactating women"],
      "mechanismsOfAction": [
        "Alpha-amylase inhibition",
        "Delayed gastric emptying",
        "Enhanced insulin sensitivity",
        "Steroidogenic enzyme modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["GI upset", "Diarrhea", "Maple syrup odor"],
        "contraindications": ["Pregnancy (except lactation)", "Hormone-sensitive conditions"],
        "drugInteractions": ["Diabetes medications", "Anticoagulants", "Thyroid medications"]
      },
      "effectSizes": {
        "glucoseControl": "Moderate (10-25mg/dL fasting glucose reduction)",
        "testosterone": "Small to moderate increase in deficient men"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Seeds"],
        "costRange": "$8-20/month",
        "qualityMarkers": ["Standardized extract", "Organic certification"]
      },
      "keyCitations": [
        {
          "title": "Fenugreek supplementation in type 2 diabetes",
          "authors": "Neelakantan N, et al.",
          "journal": "Nutr J",
          "year": 2014,
          "doi": "10.1186/1475-2891-13-7"
        }
      ],
      "healthDomains": ["Blood Sugar Control", "Metabolic Support", "Hormonal Balance", "Digestive Health"]
    },
    {
      "id": 66,
      "name": "Cinnamon Extract",
      "scientificName": "Cinnamomum cassia",
      "category": "Herbal Supplement",
      "commonNames": ["Cassia Cinnamon", "Chinese Cinnamon", "Cinnamon Bark"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple studies showing glucose and inflammation benefits",
      "primaryBenefits": {
        "cognitive": ["Blood sugar stability supporting cognitive function", "Anti-inflammatory neuroprotection"],
        "nonCognitive": ["Blood glucose reduction", "Anti-inflammatory effects", "Antioxidant activity", "Cholesterol improvement"],
    "isEnhanced": true
      },
      "dosageRange": "120mg-6g daily (extract or powder)",
      "optimalDuration": "4-16 weeks",
      "studyPopulations": ["Type 2 diabetics", "Prediabetic individuals", "Metabolic syndrome"],
      "mechanismsOfAction": [
        "Enhanced insulin sensitivity",
        "Glucose transporter activation",
        "Alpha-glucosidase inhibition",
        "Anti-inflammatory prostaglandin modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mouth irritation", "Allergic reactions (rare)", "Liver concerns (high coumarin doses)"],
        "contraindications": ["Pregnancy (large amounts)", "Liver disease (high doses)", "Surgery (blood thinning)"],
        "drugInteractions": ["Diabetes medications", "Anticoagulants", "Liver medications"]
      },
      "effectSizes": {
        "glucoseReduction": "Small to moderate (10-29mg/dL fasting glucose)",
        "HbA1c": "Small reduction (0.09-0.83%)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Extract"],
        "costRange": "$6-18/month",
        "qualityMarkers": ["Water-soluble extract", "Low coumarin content", "Standardized"]
      },
      "keyCitations": [
        {
          "title": "Cinnamon supplementation in patients with type 2 diabetes mellitus",
          "authors": "Leach MJ, Kumar S",
          "journal": "J Tradit Complement Med",
          "year": 2012,
          "doi": "10.1016/S2225-4110(16)30067-0"
        }
      ],
      "healthDomains": ["Blood Sugar Control", "Metabolic Support", "Anti-inflammatory", "Cardiovascular Health"]
    },
    {
      "id": 67,
      "name": "Holy Basil",
      "scientificName": "Ocimum tenuiflorum",
      "category": "Adaptogens",
      "commonNames": ["Tulsi", "Sacred Basil", "Krishna Tulsi"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple RCTs showing stress reduction and adaptogenic effects",
      "primaryBenefits": {
        "cognitive": ["Stress-induced cognitive improvement", "Mental clarity enhancement", "Anxiety reduction"],
        "nonCognitive": ["Cortisol regulation", "Immune system support", "Blood sugar stabilization"],
    "isEnhanced": true
      },
      "dosageRange": "300-600mg daily (standardized extract)",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Adults with chronic stress", "Anxiety disorders", "Metabolic syndrome"],
      "mechanismsOfAction": [
        "HPA axis modulation",
        "Cortisol normalization",
        "GABA receptor activity",
        "Antioxidant neuroprotection"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild nausea", "Drowsiness", "Blood thinning (high doses)"],
        "contraindications": ["Pregnancy", "Surgery", "Anticoagulant medications"],
        "drugInteractions": ["Blood thinners", "Diabetes medications", "Immunosuppressants"]
      },
      "effectSizes": {
        "stressReduction": "Large (Cohen's d = 0.8-1.2)",
        "cortisolReduction": "Moderate (15-25% reduction)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Tea", "Liquid extract"],
        "costRange": "$12-28/month",
        "qualityMarkers": ["Standardized to eugenol", "Organic certification"]
      },
      "keyCitations": [
        {
          "title": "A randomized, double-blind, placebo-controlled study of the efficacy and safety of Ocimum tenuiflorum",
          "authors": "Jamshidi N, Cohen MM",
          "journal": "J Ayurveda Integr Med",
          "year": 2017,
          "doi": "10.1016/j.jaim.2017.02.017"
        }
      ],
      "healthDomains": ["Stress Resilience", "Anxiety Reduction", "Blood Sugar Control", "Immune System Support"]
    },
    {
      "id": 68,
      "name": "Schisandra Berry",
      "scientificName": "Schisandra chinensis",
      "category": "Adaptogens",
      "commonNames": ["Five-Flavor Berry", "Wu Wei Zi", "Magnolia Vine"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Well-documented liver protection and cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Mental endurance", "Focus enhancement", "Stress-induced cognitive protection"],
        "nonCognitive": ["Liver detoxification", "Physical endurance", "Antioxidant protection"],
    "isEnhanced": true
      },
      "dosageRange": "500-1500mg daily (standardized extract)",
      "optimalDuration": "6-12 weeks",
      "studyPopulations": ["Athletes", "Liver health support", "Chronic fatigue"],
      "mechanismsOfAction": [
        "Liver enzyme induction",
        "Antioxidant enzyme activation",
        "Stress hormone modulation",
        "Neurotransmitter balance"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild GI upset", "Skin rash (rare)", "Heartburn"],
        "contraindications": ["Pregnancy", "Epilepsy", "High intracranial pressure"],
        "drugInteractions": ["CYP3A4 substrates", "Immunosuppressants"]
      },
      "effectSizes": {
        "cognitiveEndurance": "Moderate (10-15% improvement)",
        "liverFunction": "Large (ALT/AST reduction 20-40%)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder", "Dried berries"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["Standardized schisandrins", "Organic sourcing"]
      },
      "keyCitations": [
        {
          "title": "Schisandra chinensis for hepatoprotection: an evidence-based review",
          "authors": "Panossian A, Wikman G",
          "journal": "Int J Clin Pharmacol Ther",
          "year": 2008,
          "doi": "10.5414/CPP46327"
        }
      ],
      "healthDomains": ["Stress Resilience", "Energy & Vitality", "Neuroprotection", "Focus & Attention"]
    },
    {
      "id": 69,
      "name": "Mucuna Pruriens",
      "scientificName": "Mucuna pruriens",
      "category": "Herbal Supplement",
      "commonNames": ["Velvet Bean", "Cowhage", "Monkey Tamarind"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Clinical evidence for L-DOPA content and neurological benefits",
      "primaryBenefits": {
        "cognitive": ["Dopamine support", "Mood enhancement", "Motor function support"],
        "nonCognitive": ["Testosterone support", "Growth hormone stimulation", "Antioxidant effects"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "500-1000mg daily (15% L-DOPA extract)",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["Parkinson's disease", "Low dopamine", "Male fertility"],
      "mechanismsOfAction": [
        "L-DOPA dopamine precursor",
        "Tyrosine hydroxylase activation",
        "Antioxidant neuroprotection",
        "Growth hormone stimulation"
      ],
      "safetyProfile": {
        "rating": "Moderate",
        "commonSideEffects": ["Nausea", "Vomiting", "Abnormal movements", "Hypotension"],
        "contraindications": ["Pregnancy", "Melanoma history", "MAO inhibitor use"],
        "drugInteractions": ["Antipsychotics", "MAO inhibitors", "Antihypertensives"]
      },
      "effectSizes": {
        "dopamineSupport": "Large in deficient states",
        "motorFunction": "Moderate in Parkinson's (clinical studies)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$12-30/month",
        "qualityMarkers": ["Standardized L-DOPA content", "Heavy metal tested"]
      },
      "keyCitations": [
        {
          "title": "Mucuna pruriens in Parkinson's disease: a systematic review",
          "authors": "Lieu CA, et al.",
          "journal": "J Altern Complement Med",
          "year": 2010,
          "doi": "10.1089/acm.2009.0595"
        }
      ],
      "healthDomains": ["Mood Stabilization", "Neuroprotection", "Hormonal Balance", "Energy & Vitality"]
    },
    {
      "id": 70,
      "name": "Forskolin",
      "scientificName": "Coleus forskohlii",
      "category": "Herbal Supplement",
      "commonNames": ["Coleus", "Indian Coleus", "Makandi"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Limited human studies but strong mechanistic evidence",
      "primaryBenefits": {
        "cognitive": ["cAMP-mediated cognitive enhancement", "Memory consolidation support"],
        "nonCognitive": ["Metabolic enhancement", "Fat metabolism", "Cardiovascular support"],
    "isEnhanced": true
      },
      "dosageRange": "250-500mg daily (10% forskolin extract)",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Metabolic enhancement", "Weight management", "Cognitive support"],
      "mechanismsOfAction": [
        "Adenylyl cyclase activation",
        "cAMP elevation",
        "Protein kinase A activation",
        "CREB phosphorylation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild hypotension", "Increased heart rate", "GI upset"],
        "contraindications": ["Pregnancy", "Bleeding disorders", "Surgery"],
        "drugInteractions": ["Blood thinners", "Blood pressure medications"]
      },
      "effectSizes": {
        "metabolicEnhancement": "Small to moderate",
        "cognitiveSupport": "Preliminary evidence only"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["Standardized forskolin content", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Forskolin: a labdane diterpenoid with antihypertensive, positive inotropic, platelet aggregation inhibitory, and adenylyl cyclase activating properties",
          "authors": "Alasbahi RH, Melzig MF",
          "journal": "Planta Med",
          "year": 2010,
          "doi": "10.1055/s-0030-1250039"
        }
      ],
      "healthDomains": ["Metabolic Support", "Cardiovascular Health", "Memory Enhancement"]
    },
    {
      "id": 71,
      "name": "Boswellia",
      "scientificName": "Boswellia serrata",
      "category": "Anti-inflammatory",
      "commonNames": ["Indian Frankincense", "Shallaki", "Boswellia Resin"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple RCTs demonstrating anti-inflammatory effects",
      "primaryBenefits": {
        "cognitive": ["Neuroinflammation reduction", "Cognitive protection via anti-inflammatory effects"],
        "nonCognitive": ["Joint health", "Inflammatory reduction", "Respiratory support"],
    "isEnhanced": true
      },
      "dosageRange": "300-800mg daily (standardized extract)",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["Arthritis", "Inflammatory conditions", "Asthma"],
      "mechanismsOfAction": [
        "5-lipoxygenase inhibition",
        "Leukotriene synthesis reduction",
        "NF-kappaB pathway modulation",
        "Complement cascade inhibition"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Nausea", "Acid reflux", "Diarrhea"],
        "contraindications": ["Pregnancy", "Autoimmune conditions"],
        "drugInteractions": ["Immunosuppressants", "Anti-inflammatory medications"]
      },
      "effectSizes": {
        "jointPain": "Moderate (30-40% pain reduction)",
        "inflammation": "Large (significant biomarker reduction)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Resin"],
        "costRange": "$12-30/month",
        "qualityMarkers": ["Standardized boswellic acids", "AKBA content"]
      },
      "keyCitations": [
        {
          "title": "Boswellia serrata extract for treatment of rheumatoid arthritis: a systematic review",
          "authors": "Ernst E",
          "journal": "Phytomedicine",
          "year": 2008,
          "doi": "10.1016/j.phymed.2007.11.017"
        }
      ],
      "healthDomains": ["Joint Health & Mobility", "Anti-inflammatory", "Neuroprotection"]
    },
    {
      "id": 72,
      "name": "Milk Thistle",
      "scientificName": "Silybum marianum",
      "category": "Herbal Supplement",
      "commonNames": ["Silymarin", "Mary Thistle", "Holy Thistle"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Extensive clinical evidence for hepatoprotective effects",
      "primaryBenefits": {
        "cognitive": ["Improved brain function via liver detoxification", "Neuroprotective antioxidant effects"],
        "nonCognitive": ["Liver protection", "Detoxification support", "Antioxidant activity"],
    "isEnhanced": true
      },
      "dosageRange": "200-600mg daily (80% silymarin extract)",
      "optimalDuration": "8-24 weeks",
      "studyPopulations": ["Liver disease", "Hepatitis", "Fatty liver"],
      "mechanismsOfAction": [
        "Antioxidant liver protection",
        "Hepatocyte membrane stabilization",
        "Protein synthesis stimulation",
        "Anti-inflammatory effects"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Mild GI upset", "Allergic reactions (rare)"],
        "contraindications": ["Pregnancy (high doses)", "Hormone-sensitive conditions"],
        "drugInteractions": ["CYP2C9 substrates", "Warfarin"]
      },
      "effectSizes": {
        "liverProtection": "Large (significant enzyme normalization)",
        "detoxification": "Moderate support for Phase I/II enzymes"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Liquid extract"],
        "costRange": "$8-25/month",
        "qualityMarkers": ["Standardized silymarin content", "Organic certification"]
      },
      "keyCitations": [
        {
          "title": "Milk thistle in liver diseases: past, present, future",
          "authors": "Abenavoli L, et al.",
          "journal": "Phytother Res",
          "year": 2010,
          "doi": "10.1002/ptr.3207"
        }
      ],
      "healthDomains": ["Neuroprotection", "Energy & Vitality", "Anti-inflammatory"]
    },
    {
      "id": 73,
      "name": "Stinging Nettle",
      "scientificName": "Urtica dioica",
      "category": "Herbal Supplement",
      "commonNames": ["Nettle Leaf", "Common Nettle", "Nettle Root"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Clinical evidence for anti-inflammatory and allergic conditions",
      "primaryBenefits": {
        "cognitive": ["Reduced allergic brain fog", "Anti-inflammatory cognitive support"],
        "nonCognitive": ["Allergy relief", "Joint health", "Prostate support", "Nutritional support"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "300-600mg daily (leaf extract)",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Allergic rhinitis", "Arthritis", "BPH", "Nutritional support"],
      "mechanismsOfAction": [
        "Histamine receptor antagonism",
        "5-lipoxygenase inhibition",
        "COX enzyme inhibition",
        "Rich mineral content"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild GI upset", "Skin irritation", "Diuretic effects"],
        "contraindications": ["Pregnancy", "Kidney disease", "Heart conditions"],
        "drugInteractions": ["Diuretics", "Blood pressure medications", "Diabetes medications"]
      },
      "effectSizes": {
        "allergyRelief": "Moderate (50-60% symptom reduction)",
        "antiInflammatory": "Small to moderate"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Tea", "Dried leaf"],
        "costRange": "$8-20/month",
        "qualityMarkers": ["Organic certification", "Standardized extract"]
      },
      "keyCitations": [
        {
          "title": "Stinging nettle (Urtica dioica) in rheumatoid arthritis: a randomized controlled trial",
          "authors": "Randall C, et al.",
          "journal": "Phytother Res",
          "year": 2000,
          "doi": "10.1002/1099-1573(200006)14:4<213::AID-PTR653>3.0.CO;2-K"
        }
      ],
      "healthDomains": ["Anti-inflammatory", "Immune System Support", "Joint Health & Mobility", "Energy & Vitality"]
    },
    {
      "id": 74,
      "name": "Elderberry",
      "scientificName": "Sambucus canadensis",
      "category": "Herbal Supplement",
      "commonNames": ["Black Elderberry", "Elder", "Sambucus"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Clinical trials showing immune support and antiviral effects",
      "primaryBenefits": {
        "cognitive": ["Immune-mediated cognitive support", "Antioxidant neuroprotection"],
        "nonCognitive": ["Immune system enhancement", "Antiviral activity", "Antioxidant effects", "Upper respiratory support"],
    "isEnhanced": true
      },
      "dosageRange": "300-600mg daily (standardized extract)",
      "optimalDuration": "2-12 weeks (seasonal or as needed)",
      "studyPopulations": ["Cold/flu season immune support", "Upper respiratory infections", "Immune compromised"],
      "mechanismsOfAction": [
        "Antiviral hemagglutinin inhibition",
        "Immune system stimulation",
        "Antioxidant anthocyanin activity",
        "Anti-inflammatory effects"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Mild GI upset", "Allergic reactions (rare)"],
        "contraindications": ["Autoimmune conditions", "Immunosuppressive therapy"],
        "drugInteractions": ["Immunosuppressants", "Diabetes medications"]
      },
      "effectSizes": {
        "coldDuration": "Moderate (2-4 day reduction)",
        "immuneSupport": "Moderate enhancement of immune markers"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Syrup", "Gummies", "Liquid extract"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Standardized anthocyanins", "Organic certification"]
      },
      "keyCitations": [
        {
          "title": "Elderberry for prevention and treatment of viral respiratory illnesses: a systematic review",
          "authors": "Hawkins J, et al.",
          "journal": "BMC Complement Altern Med",
          "year": 2019,
          "doi": "10.1186/s12906-019-2426-1"
        }
      ],
      "healthDomains": ["Immune System Support", "Antioxidant Support", "Neuroprotection"]
    },
    {
      "id": 75,
      "name": "Citicoline",
      "scientificName": "CDP-Choline",
      "category": "Nootropics",
      "commonNames": ["CDP-Choline", "Cytidine Diphosphate Choline"],
      "evidenceTier": 1,
      "evidenceTierRationale": "Multiple high-quality RCTs and meta-analyses demonstrating cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Focus improvement", "Cognitive recovery", "Attention span increase"],
        "nonCognitive": ["Neuroprotection", "Brain injury recovery", "Eye health support"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "250-1000mg daily",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Cognitive decline", "Stroke recovery", "Age-related memory loss", "Healthy adults"],
      "mechanismsOfAction": [
        "Phosphatidylcholine synthesis enhancement",
        "Acetylcholine production increase",
        "Dopamine receptor density improvement",
        "Membrane phospholipid synthesis"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Mild headache", "Insomnia (if taken late)", "GI upset (rare)"],
        "contraindications": ["Pregnancy", "Parkinson's disease medications"],
        "drugInteractions": ["Levodopa (may enhance effects)"]
      },
      "effectSizes": {
        "memoryImprovement": "Large (d = 0.6-0.9)",
        "attentionEnhancement": "Moderate to large (d = 0.5-0.8)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$25-60/month",
        "qualityMarkers": ["Pharmaceutical grade", "Third-party tested", "Cognizin® brand"]
      },
      "keyCitations": [
        {
          "title": "Citicoline enhances frontal lobe bioenergetics as measured by phosphorus magnetic resonance spectroscopy",
          "authors": "Silveri MM, et al.",
          "journal": "NMR Biomed",
          "year": 2008,
          "doi": "10.1002/nbm.1281"
        }
      ],
      "healthDomains": ["Memory Enhancement", "Focus & Attention", "Neuroprotection", "Energy & Vitality"],
      "enhancedCitations": {
        "isEnhanced": true,
        "evidenceProfile": {
          "overallQuality": "Tier 3",
          "totalCitations": 13,
          "researchQualityScore": 86,
          "lastUpdated": "2025-08-20"
        }
      }
    },
    {
      "id": 76,
      "name": "Sulbutiamine",
      "scientificName": "Sulbutiamine",
      "category": "Essential Nutrients",
      "commonNames": ["Arcalion", "Synthetic Thiamine"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Clinical studies showing cognitive and energy benefits",
      "primaryBenefits": {
        "cognitive": ["Mental energy enhancement", "Focus improvement", "Cognitive fatigue reduction"],
        "nonCognitive": ["Physical energy increase", "Mood enhancement", "Exercise performance"],
    "isEnhanced": true
      },
      "dosageRange": "200-600mg daily",
      "optimalDuration": "4-8 weeks",
      "studyPopulations": ["Chronic fatigue", "Cognitive fatigue", "Depression", "Athletic performance"],
      "mechanismsOfAction": [
        "Enhanced thiamine bioavailability",
        "Improved mitochondrial function",
        "Dopamine receptor modulation",
        "Cholinergic system enhancement"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild agitation", "Insomnia", "Headache", "Skin reactions"],
        "contraindications": ["Pregnancy", "Bipolar disorder", "Anxiety disorders"],
        "drugInteractions": ["Stimulant medications", "Antidepressants"]
      },
      "effectSizes": {
        "cognitiveEnergy": "Moderate (subjective improvement 60-70%)",
        "mentalFatigue": "Large reduction in fatigue scores"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets"],
        "costRange": "$20-45/month",
        "qualityMarkers": ["Pharmaceutical grade", "European sourcing"]
      },
      "keyCitations": [
        {
          "title": "Effects of sulbutiamine on psycho-behavioral inhibition in major depressive episodes",
          "authors": "Bizot JC, et al.",
          "journal": "Fundam Clin Pharmacol",
          "year": 2005,
          "doi": "10.1111/j.1472-8206.2005.00350.x"
        }
      ],
      "healthDomains": ["Energy & Vitality", "Focus & Attention", "Mood Stabilization"]
    },
    {
      "id": 77,
      "name": "DMAE",
      "scientificName": "Dimethylaminoethanol",
      "category": "Nootropics",
      "commonNames": ["Dimethylaminoethanol", "Deanol"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Limited human studies but established mechanism as choline precursor",
      "primaryBenefits": {
        "cognitive": ["Focus enhancement", "Mental clarity", "Memory support"],
        "nonCognitive": ["Mood improvement", "Sleep quality", "Skin health"],
    "isEnhanced": true
      },
      "dosageRange": "100-300mg daily",
      "optimalDuration": "6-12 weeks",
      "studyPopulations": ["ADHD", "Cognitive enhancement", "Age-related cognitive decline"],
      "mechanismsOfAction": [
        "Choline precursor activity",
        "Acetylcholine synthesis enhancement",
        "Cell membrane stabilization",
        "Antioxidant effects"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Headache", "Muscle tension", "Insomnia", "Vivid dreams"],
        "contraindications": ["Pregnancy", "Epilepsy", "Bipolar disorder"],
        "drugInteractions": ["Anticholinergic medications", "Cholinesterase inhibitors"]
      },
      "effectSizes": {
        "focusImprovement": "Small to moderate (subjective reports)",
        "cognitiveClarity": "Variable individual response"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["USP grade", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Deanol in the treatment of disorders of behavior in children",
          "authors": "Lewis JA, Young R",
          "journal": "Clin Pharmacol Ther",
          "year": 1975,
          "doi": "10.1002/cpt1975174434"
        }
      ],
      "healthDomains": ["Focus & Attention", "Memory Enhancement", "Mood Stabilization"]
    },
    {
      "id": 78,
      "name": "Centella Asiatica",
      "scientificName": "Centella asiatica",
      "category": "Herbal Supplement",
      "commonNames": ["Gotu Kola", "Brahmi", "Asiatic Pennywort"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple studies showing cognitive and circulation benefits",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Cognitive longevity", "Mental clarity"],
        "nonCognitive": ["Circulation improvement", "Wound healing", "Anti-inflammatory effects"],
    "isEnhanced": true
      },
      "dosageRange": "300-900mg daily (standardized extract)",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["Age-related cognitive decline", "Circulation disorders", "Wound healing"],
      "mechanismsOfAction": [
        "Improved cerebral circulation",
        "Antioxidant neuroprotection",
        "Collagen synthesis enhancement",
        "GABA receptor modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Drowsiness", "Nausea", "Skin irritation (topical)"],
        "contraindications": ["Pregnancy", "Liver disease", "Surgery"],
        "drugInteractions": ["Diabetes medications", "Cholesterol medications"]
      },
      "effectSizes": {
        "memoryImprovement": "Moderate (cognitive test scores 15-25% improvement)",
        "circulationEnhancement": "Moderate microcirculation improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Tea", "Powder"],
        "costRange": "$8-22/month",
        "qualityMarkers": ["Standardized asiaticoside content", "Organic certification"]
      },
      "keyCitations": [
        {
          "title": "Centella asiatica for cognitive function: a systematic review of randomized controlled trials",
          "authors": "Farhana KM, et al.",
          "journal": "Sci Rep",
          "year": 2016,
          "doi": "10.1038/srep33511"
        }
      ],
      "healthDomains": ["Memory Enhancement", "Neuroprotection", "Cardiovascular Health", "Focus & Attention"]
    },
    {
      "id": 79,
      "name": "Passionflower",
      "scientificName": "Passiflora incarnata",
      "category": "Herbal Supplement",
      "commonNames": ["Maypop", "Purple Passionflower", "Wild Passion Vine"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Clinical trials demonstrating anxiety reduction and GABA effects",
      "primaryBenefits": {
        "cognitive": ["Anxiety reduction", "Cognitive calmness", "Stress-related cognitive improvement"],
        "nonCognitive": ["Sleep quality", "Stress reduction", "Muscle relaxation"],
    "isEnhanced": true
      },
      "dosageRange": "250-800mg daily (extract), 4-8g dried herb",
      "optimalDuration": "2-8 weeks",
      "studyPopulations": ["Generalized anxiety", "Insomnia", "Pre-operative anxiety"],
      "mechanismsOfAction": [
        "GABA receptor enhancement",
        "Monoamine oxidase inhibition",
        "Serotonin reuptake modulation",
        "Adenosine receptor interaction"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Drowsiness", "Dizziness", "Confusion (high doses)"],
        "contraindications": ["Pregnancy", "Surgery", "MAO inhibitor use"],
        "drugInteractions": ["Sedatives", "Anticoagulants", "MAO inhibitors"]
      },
      "effectSizes": {
        "anxietyReduction": "Large (HAM-A scale reduction 30-40%)",
        "sleepQuality": "Moderate improvement in sleep parameters"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Tea", "Liquid extract"],
        "costRange": "$8-20/month",
        "qualityMarkers": ["Standardized vitexin content", "Organic certification"]
      },
      "keyCitations": [
        {
          "title": "Passionflower in the treatment of generalized anxiety: a pilot double-blind randomized controlled trial",
          "authors": "Akhondzadeh S, et al.",
          "journal": "J Clin Pharm Ther",
          "year": 2001,
          "doi": "10.1046/j.1365-2710.2001.00367.x"
        }
      ],
      "healthDomains": ["Anxiety Reduction", "Sleep Quality", "Stress Resilience", "Mood Stabilization"]
    },
    {
      "id": 80,
      "name": "Aniracetam",
      "scientificName": "Aniracetam",
      "category": "Nootropics",
      "commonNames": ["Ampamet", "Draganon"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Limited human studies but established AMPA receptor activity",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Learning facilitation", "Verbal fluency", "Creative thinking"],
        "nonCognitive": ["Mood enhancement", "Social anxiety reduction", "Sensory perception"],
    "isEnhanced": true
      },
      "dosageRange": "750-1500mg daily (where legal)",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Cognitive decline", "Learning enhancement", "Memory disorders"],
      "mechanismsOfAction": [
        "AMPA receptor positive modulation",
        "Enhanced synaptic plasticity",
        "Increased BDNF expression",
        "Cholinergic system enhancement"
      ],
      "safetyProfile": {
        "rating": "Moderate",
        "commonSideEffects": ["Headache", "Nausea", "Anxiety", "Insomnia"],
        "contraindications": ["Pregnancy", "Seizure disorders", "Regulatory restrictions"],
        "drugInteractions": ["Anticoagulants", "Stimulant medications"]
      },
      "effectSizes": {
        "memoryEnhancement": "Moderate in deficient populations",
        "learningImprovement": "Small to moderate in healthy adults"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder"],
        "costRange": "$30-70/month (where available)",
        "qualityMarkers": ["Research grade", "Third-party tested", "Legal status varies"]
      },
      "keyCitations": [
        {
          "title": "Aniracetam: its novel therapeutic potential in cerebral dysfunctional disorders",
          "authors": "Nakamura K",
          "journal": "CNS Drug Rev",
          "year": 2002,
          "doi": "10.1111/j.1527-3458.2002.tb00174.x"
        }
      ],
      "healthDomains": ["Memory Enhancement", "Focus & Attention", "Mood Stabilization", "Neuroprotection"]
    },
    {
      "id": 81,
      "name": "Piracetam",
      "scientificName": "Piracetam",
      "category": "Nootropics",
      "commonNames": ["Nootropil", "Lucetam"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Extensive clinical research with mixed but generally positive results",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Learning facilitation", "Cognitive protection", "Mental clarity"],
        "nonCognitive": ["Circulation improvement", "Neuroprotection", "Recovery from brain injury"],
    "isEnhanced": true
      },
      "dosageRange": "2400-4800mg daily (where legal)",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["Age-related cognitive decline", "Dementia", "Stroke recovery", "Learning enhancement"],
      "mechanismsOfAction": [
        "Enhanced neuronal membrane fluidity",
        "Increased ATP synthesis",
        "Improved interhemispheric transfer",
        "Cholinergic system modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Headache", "Nervousness", "Agitation", "Insomnia"],
        "contraindications": ["Pregnancy", "Kidney disease", "Huntington's disease"],
        "drugInteractions": ["Anticoagulants", "Thyroid medications"]
      },
      "effectSizes": {
        "cognitiveImprovement": "Small to moderate (varies by population)",
        "memoryEnhancement": "Moderate in cognitive decline, small in healthy adults"
      },
      "commercialAvailability": {
        "forms": ["Tablets", "Capsules", "Powder"],
        "costRange": "$20-50/month (where available)",
        "qualityMarkers": ["Pharmaceutical grade", "European sourcing", "Legal status varies"]
      },
      "keyCitations": [
        {
          "title": "Piracetam: a review of pharmacological properties and clinical uses",
          "authors": "Winblad B",
          "journal": "CNS Drug Rev",
          "year": 2005,
          "doi": "10.1111/j.1527-3458.2005.tb00268.x"
        }
      ],
      "healthDomains": ["Memory Enhancement", "Focus & Attention", "Neuroprotection", "Energy & Vitality"]
    },
    {
      "id": 82,
      "name": "Kanna",
      "scientificName": "Sceletium tortuosum",
      "category": "Herbal Supplement",
      "commonNames": ["Sceletium", "Channa", "Kougoed"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Clinical studies showing mood and cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Cognitive flexibility", "Executive function", "Stress-related cognitive improvement"],
        "nonCognitive": ["Mood enhancement", "Stress reduction", "Social anxiety relief"],
    "isEnhanced": true
      },
      "dosageRange": "25-100mg daily (standardized extract)",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Stress and anxiety", "Mood disorders", "Cognitive flexibility"],
      "mechanismsOfAction": [
        "Serotonin reuptake inhibition",
        "PDE4 inhibition",
        "GABA enhancement",
        "Cognitive flexibility improvement"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild sedation", "Headache", "Nausea (high doses)"],
        "contraindications": ["Pregnancy", "Depression medications", "Heart medications"],
        "drugInteractions": ["SSRIs", "MAO inhibitors", "Cardiac glycosides"]
      },
      "effectSizes": {
        "cognitiveFlexibility": "Moderate improvement in executive function tests",
        "moodEnhancement": "Large subjective mood improvement"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Powder"],
        "costRange": "$20-45/month",
        "qualityMarkers": ["Standardized alkaloid content", "Sustainable sourcing"]
      },
      "keyCitations": [
        {
          "title": "A randomized, double-blind, placebo-controlled study of Sceletium tortuosum",
          "authors": "Nell H, et al.",
          "journal": "J Ethnopharmacol",
          "year": 2013,
          "doi": "10.1016/j.jep.2013.06.005"
        }
      ],
      "healthDomains": ["Mood Stabilization", "Anxiety Reduction", "Focus & Attention", "Stress Resilience"]
    },
    {
      "id": 83,
      "name": "Black Seed Oil",
      "scientificName": "Nigella sativa",
      "category": "Herbal Supplement",
      "commonNames": ["Black Cumin", "Kalonji", "Nigella"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Multiple studies showing diverse health benefits across systems",
      "primaryBenefits": {
        "cognitive": ["Neuroprotective effects", "Memory support", "Anti-inflammatory cognitive benefits"],
        "nonCognitive": ["Immune system support", "Metabolic health", "Anti-inflammatory effects", "Respiratory support"],
    "isEnhanced": true
      },
      "dosageRange": "500-2000mg daily (oil or extract)",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Metabolic disorders", "Inflammatory conditions", "Immune support", "Respiratory health"],
      "mechanismsOfAction": [
        "Thymoquinone antioxidant activity",
        "Anti-inflammatory pathway modulation",
        "Immune system modulation",
        "Metabolic pathway enhancement"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild GI upset", "Allergic reactions (rare)", "Blood sugar changes"],
        "contraindications": ["Pregnancy", "Surgery", "Diabetes medication users"],
        "drugInteractions": ["Diabetes medications", "Blood thinners", "Immunosuppressants"]
      },
      "effectSizes": {
        "antiInflammatory": "Moderate (significant biomarker improvements)",
        "metabolicSupport": "Small to moderate in metabolic syndrome"
      },
      "commercialAvailability": {
        "forms": ["Oil", "Capsules", "Seeds", "Powder"],
        "costRange": "$15-35/month",
        "qualityMarkers": ["Cold-pressed oil", "Standardized thymoquinone", "Organic certification"]
      },
      "keyCitations": [
        {
          "title": "Nigella sativa and its active constituent thymoquinone: an overview",
          "authors": "Ahmad A, et al.",
          "journal": "Antioxidants (Basel)",
          "year": 2013,
          "doi": "10.3390/antiox2040158"
        }
      ],
      "healthDomains": ["Neuroprotection", "Immune System Support", "Anti-inflammatory", "Metabolic Support"]
    },
    {
      "id": 84,
      "name": "Moringa",
      "scientificName": "Moringa oleifera",
      "category": "Herbal Supplement",
      "commonNames": ["Drumstick Tree", "Miracle Tree", "Horseradish Tree"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Growing clinical evidence for nutritional and health benefits",
      "primaryBenefits": {
        "cognitive": ["Nutritional cognitive support", "Antioxidant neuroprotection", "Energy enhancement"],
        "nonCognitive": ["Comprehensive nutrition", "Antioxidant support", "Anti-inflammatory effects", "Energy boost"],
    "isEnhanced": true
      },
      "dosageRange": "500-1500mg daily (leaf powder/extract)",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Nutritional deficiency", "Antioxidant support", "General wellness"],
      "mechanismsOfAction": [
        "Dense nutritional profile",
        "Potent antioxidant activity",
        "Anti-inflammatory compounds",
        "Micronutrient replenishment"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Mild GI upset (high doses)", "Diarrhea (excessive intake)"],
        "contraindications": ["Pregnancy (root/bark)", "Medication absorption concerns"],
        "drugInteractions": ["May affect medication absorption", "Blood thinning medications"]
      },
      "effectSizes": {
        "nutritionalSupport": "Large (significant micronutrient provision)",
        "antioxidantActivity": "Large (high ORAC values)"
      },
      "commercialAvailability": {
        "forms": ["Powder", "Capsules", "Tea", "Fresh leaves"],
        "costRange": "$12-30/month",
        "qualityMarkers": ["Organic certification", "Leaf-only products", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Moringa oleifera: a food plant with multiple medicinal uses",
          "authors": "Anwar F, et al.",
          "journal": "Phytother Res",
          "year": 2007,
          "doi": "10.1002/ptr.2023"
        }
      ],
      "healthDomains": ["Energy & Vitality", "Antioxidant Support", "Immune System Support", "Neuroprotection"]
    },
    {
      "id": 85,
      "name": "Pine Bark Extract",
      "scientificName": "Pinus pinaster",
      "category": "Antioxidants",
      "commonNames": ["Pycnogenol", "Maritime Pine", "French Pine Bark"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Extensive research on Pycnogenol brand with cardiovascular and cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Cognitive function improvement", "Attention enhancement", "Memory support"],
        "nonCognitive": ["Cardiovascular health", "Skin health", "Anti-inflammatory effects", "Circulation improvement"],
    "isEnhanced": true
      },
      "dosageRange": "50-200mg daily (standardized extract)",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["ADHD", "Cardiovascular disease", "Skin aging", "Cognitive enhancement"],
      "mechanismsOfAction": [
        "Potent antioxidant activity",
        "Nitric oxide enhancement",
        "Anti-inflammatory effects",
        "Endothelial function improvement"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Mild GI upset", "Headache (rare)", "Dizziness (rare)"],
        "contraindications": ["Pregnancy", "Autoimmune conditions", "Surgery"],
        "drugInteractions": ["Immunosuppressants", "Diabetes medications"]
      },
      "effectSizes": {
        "cognitiveImprovement": "Moderate (attention and executive function)",
        "cardiovascularBenefit": "Large (circulation and endothelial function)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets"],
        "costRange": "$25-60/month",
        "qualityMarkers": ["Pycnogenol® brand", "Standardized procyanidins", "Clinical grade"]
      },
      "keyCitations": [
        {
          "title": "Pycnogenol supplementation improves cognitive function, attention and mental performance",
          "authors": "Luzzi R, et al.",
          "journal": "Panminerva Med",
          "year": 2011,
          "doi": "10.23736/S0031-0808.16.03066-0"
        }
      ],
      "healthDomains": ["Focus & Attention", "Cardiovascular Health", "Neuroprotection", "Antioxidant Support"]
    },
    {
      "id": 86,
      "name": "Grape Seed Extract",
      "scientificName": "Vitis vinifera",
      "category": "Antioxidants",
      "commonNames": ["GSE", "Grape Polyphenols", "Proanthocyanidins"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Clinical studies demonstrating antioxidant and circulation benefits",
      "primaryBenefits": {
        "cognitive": ["Antioxidant neuroprotection", "Circulation-mediated cognitive support", "Memory protection"],
        "nonCognitive": ["Cardiovascular health", "Antioxidant protection", "Anti-inflammatory effects", "Skin health"],
    "isEnhanced": true
      },
      "dosageRange": "100-400mg daily (standardized extract)",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Cardiovascular health", "Antioxidant support", "Circulation disorders"],
      "mechanismsOfAction": [
        "Potent proanthocyanidin antioxidants",
        "Endothelial function enhancement",
        "Anti-inflammatory activity",
        "Collagen protection"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Mild GI upset", "Headache (rare)", "Nausea (high doses)"],
        "contraindications": ["Pregnancy", "Blood clotting disorders", "Surgery"],
        "drugInteractions": ["Blood thinners", "Iron absorption inhibition"]
      },
      "effectSizes": {
        "antioxidantActivity": "Large (significant free radical scavenging)",
        "circulationImprovement": "Moderate (endothelial function enhancement)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets", "Liquid extract"],
        "costRange": "$10-30/month",
        "qualityMarkers": ["Standardized proanthocyanidins", "95% polyphenols", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Grape seed extract: having a potential health benefits",
          "authors": "Shi J, et al.",
          "journal": "J Food Eng",
          "year": 2003,
          "doi": "10.1016/S0260-8774(02)00471-2"
        }
      ],
      "healthDomains": ["Antioxidant Support", "Cardiovascular Health", "Neuroprotection", "Anti-inflammatory"]
    },
    {
      "id": 87,
      "name": "Krill Oil",
      "scientificName": "Euphausia superba",
      "category": "Essential Nutrients",
      "commonNames": ["Antarctic Krill Oil", "Phospholipid Omega-3"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Clinical studies showing enhanced omega-3 bioavailability and benefits",
      "primaryBenefits": {
        "cognitive": ["Enhanced omega-3 brain delivery", "Memory support", "Cognitive protection"],
        "nonCognitive": ["Cardiovascular health", "Joint health", "Anti-inflammatory effects", "Eye health"],
    "isEnhanced": true
      },
      "dosageRange": "500-2000mg daily",
      "optimalDuration": "8-16 weeks",
      "studyPopulations": ["Cardiovascular health", "Joint pain", "Cognitive support", "Eye health"],
      "mechanismsOfAction": [
        "Phospholipid-bound omega-3 delivery",
        "Enhanced bioavailability",
        "Astaxanthin antioxidant activity",
        "Anti-inflammatory prostaglandin modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Fishy taste", "GI upset", "Nausea"],
        "contraindications": ["Seafood allergies", "Surgery", "Blood clotting disorders"],
        "drugInteractions": ["Blood thinners", "Antiplatelet medications"]
      },
      "effectSizes": {
        "omega3Bioavailability": "Large (2-3x better absorption than fish oil)",
        "antiInflammatory": "Moderate (C-reactive protein reduction)"
      },
      "commercialAvailability": {
        "forms": ["Softgels", "Liquid"],
        "costRange": "$20-50/month",
        "qualityMarkers": ["Sustainable harvesting", "Astaxanthin content", "Heavy metal tested"]
      },
      "keyCitations": [
        {
          "title": "Krill oil supplementation increases plasma concentrations of eicosapentaenoic and docosahexaenoic acids",
          "authors": "Ulven SM, et al.",
          "journal": "Lipids",
          "year": 2011,
          "doi": "10.1007/s11745-010-3490-4"
        }
      ],
      "healthDomains": ["Memory Enhancement", "Cardiovascular Health", "Joint Health & Mobility", "Neuroprotection"]
    },
    {
      "id": 88,
      "name": "Zeaxanthin",
      "scientificName": "Zeaxanthin",
      "category": "Antioxidants",
      "commonNames": ["Macular Carotenoid", "Eye Antioxidant"],
      "evidenceTier": 2,
      "evidenceTierRationale": "Clinical evidence for eye health and cognitive benefits",
      "primaryBenefits": {
        "cognitive": ["Visual cognitive processing", "Macular health supporting cognitive function", "Antioxidant neuroprotection"],
        "nonCognitive": ["Macular health support", "Eye health", "Blue light protection", "Skin health"],
    "isEnhanced": true
      },
      "dosageRange": "2-10mg daily",
      "optimalDuration": "12-24 weeks",
      "studyPopulations": ["Age-related macular degeneration", "Computer vision syndrome", "Eye health"],
      "mechanismsOfAction": [
        "Macular pigment density increase",
        "Blue light filtration",
        "Antioxidant protection",
        "Anti-inflammatory effects"
      ],
      "safetyProfile": {
        "rating": "Excellent",
        "commonSideEffects": ["Yellowing of skin (high doses)", "No significant side effects"],
        "contraindications": ["No major contraindications"],
        "drugInteractions": ["Fat-soluble vitamin absorption"]
      },
      "effectSizes": {
        "macularDensity": "Large (significant macular pigment increase)",
        "visualFunction": "Moderate (contrast sensitivity and glare reduction)"
      },
      "commercialAvailability": {
        "forms": ["Softgels", "Capsules"],
        "costRange": "$15-40/month",
        "qualityMarkers": ["Natural source", "Combined with lutein", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Zeaxanthin and lutein: important macular carotenoids in health and disease",
          "authors": "Krinsky NI, et al.",
          "journal": "Arch Biochem Biophys",
          "year": 2003,
          "doi": "10.1016/j.abb.2003.08.031"
        }
      ],
      "healthDomains": ["Eye Health & Vision", "Neuroprotection", "Antioxidant Support"]
    },
    {
      "id": 89,
      "name": "Pterostilbene",
      "scientificName": "Pterostilbene",
      "category": "Antioxidants",
      "commonNames": ["Blueberry Extract", "Dimethylated Resveratrol"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Promising preclinical studies with limited human data",
      "primaryBenefits": {
        "cognitive": ["Memory enhancement", "Neuroprotection", "Age-related cognitive support"],
        "nonCognitive": ["Antioxidant effects", "Anti-inflammatory activity", "Metabolic support", "Cardiovascular health"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "50-250mg daily",
      "optimalDuration": "8-12 weeks",
      "studyPopulations": ["Cognitive aging", "Metabolic disorders", "Antioxidant support"],
      "mechanismsOfAction": [
        "Enhanced bioavailability vs resveratrol",
        "Sirtuin activation",
        "Antioxidant enzyme induction",
        "Anti-inflammatory pathway modulation"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild GI upset", "No major side effects reported"],
        "contraindications": ["Pregnancy", "Blood clotting disorders"],
        "drugInteractions": ["Blood thinners", "Diabetes medications"]
      },
      "effectSizes": {
        "cognitiveProtection": "Promising in animal studies, limited human data",
        "antioxidantActivity": "Large (superior to resveratrol bioavailability)"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Tablets"],
        "costRange": "$20-50/month",
        "qualityMarkers": ["Natural blueberry source", "pTeroPure® brand", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "Pterostilbene: a novel natural antioxidant",
          "authors": "Rimando AM, et al.",
          "journal": "J Agric Food Chem",
          "year": 2005,
          "doi": "10.1021/jf0514163"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "healthDomains": ["Memory Enhancement", "Neuroprotection", "Anti-aging", "Antioxidant Support"]
    },
    {
      "id": 90,
      "name": "Beta-Alanine",
      "scientificName": "β-Alanine (3-aminopropionic acid)",
      "category": "Performance Enhancers",
      "commonNames": ["β-Alanine", "3-Aminopropionic acid", "Beta-Ala"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Strong evidence for exercise endurance and muscle buffering capacity via carnosine synthesis",
      "primaryBenefits": {
        "cognitive": ["Sustained focus during exercise", "Reduced mental fatigue during high-intensity efforts"],
        "nonCognitive": ["Exercise endurance", "Muscle buffering", "High-intensity performance", "Carnosine elevation"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "4-6g daily (split doses)",
      "optimalDuration": "4-12 weeks loading, ongoing maintenance",
      "studyPopulations": ["Athletes", "Resistance trainees", "Endurance athletes", "Military personnel"],
      "mechanismsOfAction": [
        "Carnosine synthesis in skeletal muscle",
        "Intracellular pH buffering during high-intensity exercise",
        "Delayed onset of neuromuscular fatigue",
        "Enhanced Type II muscle fiber carnosine content"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Paraesthesia (tingling)", "Skin flushing at high single doses"],
        "contraindications": ["Pregnancy (limited data)", "Taurine depletion concerns at very high doses"],
        "drugInteractions": ["May interact with taurine metabolism", "No major drug interactions reported"]
      },
      "effectSizes": {
        "exerciseEndurance": "Moderate improvement (2-5% in 1-4 min efforts)",
        "muscleBuffering": "Large (40-80% increase in muscle carnosine)"
      },
      "commercialAvailability": {
        "forms": ["Powder", "Capsules", "Pre-workout blends"],
        "costRange": "$15-30/month",
        "qualityMarkers": ["CarnoSyn® brand", "Third-party tested", "Sustained-release forms"]
      },
      "keyCitations": [
        {
          "title": "Role of beta-alanine supplementation on muscle carnosine and exercise performance",
          "authors": "Artioli GG, et al.",
          "journal": "Med Sci Sports Exerc",
          "year": 2010,
          "doi": "10.1249/MSS.0b013e3181c74e38"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "healthDomains": ["Exercise Performance", "Muscle Endurance", "Athletic Performance", "Physical Stamina"]
    },
    {
      "id": 91,
      "name": "Citrulline Malate",
      "scientificName": "L-Citrulline + DL-Malate",
      "category": "Performance Enhancers",
      "commonNames": ["L-Citrulline Malate", "CitMal", "CM"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Moderate evidence for exercise performance and nitric oxide enhancement with mixed results across studies",
      "primaryBenefits": {
        "cognitive": ["Reduced mental fatigue during exercise", "Enhanced blood flow to brain during exertion"],
        "nonCognitive": ["Nitric oxide production", "Blood flow enhancement", "Exercise endurance", "Reduced muscle soreness"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "6-8g acute pre-workout",
      "optimalDuration": "Acute dosing (60 min pre-exercise)",
      "studyPopulations": ["Resistance trainees", "Endurance athletes", "Recreational exercisers"],
      "mechanismsOfAction": [
        "Arginine-nitric oxide pathway enhancement",
        "Ammonia detoxification via urea cycle",
        "Malate contribution to aerobic energy production",
        "Vasodilation and improved blood flow"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild GI discomfort at high doses", "Possible nausea"],
        "contraindications": ["Citrullinemia (rare genetic disorder)", "Pregnancy (limited data)"],
        "drugInteractions": ["PDE5 inhibitors (additive vasodilation)", "Nitrates", "Blood pressure medications"]
      },
      "effectSizes": {
        "exercisePerformance": "Small to moderate improvement",
        "muscleRecovery": "Moderate reduction in soreness"
      },
      "commercialAvailability": {
        "forms": ["Powder", "Capsules", "Pre-workout formulas"],
        "costRange": "$15-25/month",
        "qualityMarkers": ["2:1 citrulline-to-malate ratio", "Third-party tested", "Pharmaceutical grade"]
      },
      "keyCitations": [
        {
          "title": "Citrulline malate enhances athletic anaerobic performance and relieves muscle soreness",
          "authors": "Pérez-Guisado J, Jakeman PM",
          "journal": "J Strength Cond Res",
          "year": 2010,
          "doi": "10.1519/JSC.0b013e3181cb28e0"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "healthDomains": ["Exercise Performance", "Blood Flow", "Muscle Recovery", "Cardiovascular Support"]
    },
    {
      "id": 92,
      "name": "HMB (β-Hydroxy β-Methylbutyrate)",
      "scientificName": "β-Hydroxy β-Methylbutyrate",
      "category": "Performance Enhancers",
      "commonNames": ["HMB", "β-HMB", "HMB-Ca", "HMB-FA", "Hydroxymethylbutyrate"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Moderate evidence for muscle preservation and recovery, particularly in untrained or elderly populations",
      "primaryBenefits": {
        "cognitive": ["Indirect neuroprotection via reduced systemic inflammation"],
        "nonCognitive": ["Muscle protein synthesis", "Muscle preservation", "Recovery enhancement", "Lean mass support"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "3g daily or 38mg/kg body weight",
      "optimalDuration": "4-12 weeks",
      "studyPopulations": ["Untrained individuals", "Elderly populations", "Athletes in caloric deficit", "Clinical populations"],
      "mechanismsOfAction": [
        "mTOR pathway activation for protein synthesis",
        "Ubiquitin-proteasome pathway inhibition (reduced protein breakdown)",
        "Cholesterol synthesis for cell membrane repair",
        "Leucine metabolite with anti-catabolic properties"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Mild GI discomfort", "No major side effects at recommended doses"],
        "contraindications": ["Pregnancy (limited data)", "Kidney disease (caution)"],
        "drugInteractions": ["Statins (shared cholesterol pathways)", "No major drug interactions reported"]
      },
      "effectSizes": {
        "muscleMass": "Small to moderate gains in untrained populations",
        "musclePreservation": "Moderate during caloric restriction"
      },
      "commercialAvailability": {
        "forms": ["Capsules", "Powder", "Free acid gel"],
        "costRange": "$20-40/month",
        "qualityMarkers": ["HMB-FA (free acid form)", "myHMB® brand", "Third-party tested"]
      },
      "keyCitations": [
        {
          "title": "β-Hydroxy-β-methylbutyrate free acid supplementation effects on muscle mass",
          "authors": "Wilson JM, et al.",
          "journal": "Br J Nutr",
          "year": 2014,
          "doi": "10.1017/S0007114513002665"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "healthDomains": ["Muscle Preservation", "Recovery", "Lean Mass", "Anti-Catabolic Support"]
    },
    {
      "id": 93,
      "name": "Betaine",
      "scientificName": "Trimethylglycine (TMG)",
      "category": "Performance Enhancers",
      "commonNames": ["TMG", "Trimethylglycine", "Betaine Anhydrous"],
      "evidenceTier": 3,
      "evidenceTierRationale": "Moderate evidence for power output and body composition with consistent but modest performance benefits",
      "primaryBenefits": {
        "cognitive": ["Methylation support for neurotransmitter synthesis", "Homocysteine regulation"],
        "nonCognitive": ["Power output enhancement", "Body composition improvement", "Cellular hydration", "Methylation support"],
    "isEnhanced": true,
    "isEnhanced": true
      },
      "dosageRange": "2.5g daily",
      "optimalDuration": "6-12 weeks",
      "studyPopulations": ["Resistance-trained individuals", "Athletes", "Power sport athletes"],
      "mechanismsOfAction": [
        "Osmolyte function for cellular hydration",
        "Methyl donor in homocysteine-to-methionine conversion",
        "Creatine synthesis support via methylation",
        "Protein synthesis signaling via cellular volume"
      ],
      "safetyProfile": {
        "rating": "Good",
        "commonSideEffects": ["Fishy body odor (trimethylaminuria)", "Mild GI upset", "Possible cholesterol elevation"],
        "contraindications": ["Trimethylaminuria", "Pregnancy (limited data)"],
        "drugInteractions": ["May interact with cholesterol medications", "No major drug interactions reported"]
      },
      "effectSizes": {
        "powerOutput": "Small to moderate improvement",
        "bodyComposition": "Small improvement (fat loss, lean mass)"
      },
      "commercialAvailability": {
        "forms": ["Powder", "Capsules"],
        "costRange": "$10-25/month",
        "qualityMarkers": ["Betaine anhydrous", "Third-party tested", "USP grade"]
      },
      "keyCitations": [
        {
          "title": "Ergogenic effects of betaine supplementation on strength and power performance",
          "authors": "Lee EC, et al.",
          "journal": "J Int Soc Sports Nutr",
          "year": 2010,
          "doi": "10.1186/1550-2783-7-27"
        }
      ],
      "enhancedCitations": {
        "isEnhanced": true
      },
      "healthDomains": ["Exercise Performance", "Power Output", "Body Composition", "Methylation Support"]
    }
  ],

  "categories": [
    {
      "name": "Nootropics",
      "description": "Supplements primarily targeting cognitive enhancement",
      "supplements": ["Bacopa monnieri", "Creatine", "L-Theanine", "Lion's Mane Mushroom", "Phosphatidylserine", "Acetyl-L-Carnitine", "Alpha-GPC", "Huperzine A", "Vinpocetine", "Citicoline", "DMAE", "Aniracetam", "Piracetam"]
    },
    {
      "name": "Adaptogens", 
      "description": "Herbs that help the body adapt to stress",
      "supplements": ["Ashwagandha", "Rhodiola rosea", "Panax Ginseng", "Holy Basil", "Schisandra Berry"]
    },
    {
      "name": "Anti-inflammatory",
      "description": "Compounds with strong anti-inflammatory properties",
      "supplements": ["Turmeric/Curcumin", "Omega-3 Fatty Acids", "Quercetin", "Green Tea Extract", "Boswellia", "Milk Thistle", "Stinging Nettle", "Elderberry", "Cinnamon Extract", "Glucosamine", "MSM", "Chondroitin Sulfate"]
    },
    {
      "name": "Essential Nutrients",
      "description": "Vitamins and minerals essential for health",
      "supplements": ["Vitamin D3", "Magnesium", "CoQ10", "B-Complex Vitamins", "Vitamin B12", "Vitamin B6", "Folate", "Vitamin C", "Vitamin E", "Zinc", "Iron", "Selenium", "Choline", "Chromium", "Vanadium", "Sulbutiamine", "Krill Oil"]
    },
    {
      "name": "Sleep Support",
      "description": "Supplements primarily for sleep quality improvement",
      "supplements": ["Melatonin", "Magnesium", "5-HTP", "GABA", "Passionflower"]
    },
    {
      "name": "Performance Enhancers",
      "description": "Supplements for physical and mental performance",
      "supplements": ["Creatine", "Rhodiola rosea", "Panax Ginseng", "Caffeine", "Cordyceps", "MCT Oil", "Beta-Alanine", "Citrulline Malate", "HMB (β-Hydroxy β-Methylbutyrate)", "Betaine", "Whey Protein"]
    },
    {
      "name": "Herbal Extracts",
      "description": "Plant-based supplements with cognitive benefits",
      "supplements": ["Ginkgo Biloba", "Lion's Mane Mushroom"]
    },
    {
      "name": "Metabolic Support",
      "description": "Supplements supporting metabolic and cardiovascular health",
      "supplements": ["Berberine", "CoQ10", "NAD+ Precursors", "Red Yeast Rice", "Chromium", "Vanadium", "Bitter Melon", "Gymnema Sylvestre", "Fenugreek", "Cinnamon Extract"]
    },
    {
      "name": "Polyphenols",
      "description": "Plant compounds with antioxidant and cognitive benefits",
      "supplements": ["Quercetin", "Green Tea Extract", "Resveratrol"]
    },
    {
      "name": "Antioxidants",
      "description": "Compounds that protect against oxidative stress",
      "supplements": ["CoQ10", "PQQ", "Green Tea Extract", "Quercetin", "Vitamin C", "Vitamin E", "Selenium", "Alpha-Lipoic Acid", "Lutein", "Astaxanthin", "Spirulina", "Chlorella", "Pine Bark Extract", "Grape Seed Extract", "Zeaxanthin", "Pterostilbene"]
    },
    {
      "name": "Amino Acids",
      "description": "Amino acids and neurotransmitter precursors",
      "supplements": ["L-Tyrosine", "5-HTP", "Taurine", "GABA", "PEA (Phenylethylamine)"]
    },
    {
      "name": "Herbal Supplement",
      "description": "Traditional herbal supplements with cognitive and health benefits",
      "supplements": ["Tribulus Terrestris", "Ginger", "Garlic", "Echinacea", "Hawthorn Berry", "Bitter Melon", "Gymnema Sylvestre", "Fenugreek", "Cinnamon Extract", "Mucuna Pruriens", "Forskolin", "Milk Thistle", "Stinging Nettle", "Elderberry", "Centella Asiatica", "Passionflower", "Kanna", "Black Seed Oil", "Moringa", "Reishi Mushroom"]
    },
    {
      "name": "B-Vitamin Related",
      "description": "B-vitamin family and related compounds",
      "supplements": ["Inositol"]
    }
  ],
  
  "healthDomains": [
    {
      "name": "Memory Enhancement",
      "supplements": ["Bacopa monnieri", "Creatine", "Omega-3 Fatty Acids", "Lion's Mane Mushroom", "Phosphatidylserine", "Acetyl-L-Carnitine", "Ginkgo Biloba", "Alpha-GPC", "B-Complex Vitamins", "Vitamin B12", "Folate", "Resveratrol", "Iron", "Zinc", "Choline", "Lutein", "Ginger", "Citicoline", "DMAE", "Centella Asiatica", "Aniracetam", "Piracetam"]
    },
    {
      "name": "Focus & Attention", 
      "supplements": ["L-Theanine", "Rhodiola rosea", "Bacopa monnieri", "Ginkgo Biloba", "Panax Ginseng", "Alpha-GPC", "Green Tea Extract", "B-Complex Vitamins", "L-Tyrosine", "Iron", "Zinc", "Choline", "Caffeine", "Citicoline", "Sulbutiamine", "DMAE", "Centella Asiatica", "Aniracetam", "Piracetam", "Kanna"]
    },
    {
      "name": "Sleep Quality",
      "supplements": ["Melatonin", "Magnesium", "L-Theanine", "5-HTP", "GABA", "Passionflower"]
    },
    {
      "name": "Anxiety Reduction",
      "supplements": ["Ashwagandha", "L-Theanine", "Magnesium", "Inositol", "GABA", "Holy Basil", "Passionflower", "Kanna"]
    },
    {
      "name": "Stress Resilience",
      "supplements": ["Ashwagandha", "Rhodiola rosea", "Magnesium", "Panax Ginseng", "Phosphatidylserine", "Vitamin C", "Taurine", "Holy Basil", "Schisandra Berry"]
    },
    {
      "name": "Neuroprotection",
      "supplements": ["Turmeric/Curcumin", "Omega-3 Fatty Acids", "Vitamin D3", "Lion's Mane Mushroom", "Acetyl-L-Carnitine", "CoQ10", "Quercetin", "Green Tea Extract", "PQQ", "NAD+ Precursors", "Resveratrol", "Vitamin E", "Vitamin C", "Selenium", "Zinc", "Taurine", "Alpha-Lipoic Acid", "Lutein", "Astaxanthin", "Ginger", "Garlic", "Holy Basil", "Schisandra Berry", "Mucuna Pruriens", "Boswellia", "Milk Thistle", "Elderberry"]
    },
    {
      "name": "Mood Stabilization",
      "supplements": ["Omega-3 Fatty Acids", "Vitamin D3", "Turmeric/Curcumin", "Acetyl-L-Carnitine", "B-Complex Vitamins", "Vitamin B12", "Vitamin B6", "Folate", "5-HTP", "L-Tyrosine", "Inositol", "Selenium", "Mucuna Pruriens", "Sulbutiamine", "DMAE", "Passionflower", "Aniracetam", "Kanna"]
    },
    {
      "name": "Cardiovascular Health",
      "supplements": ["Omega-3 Fatty Acids", "CoQ10", "Berberine", "Taurine", "Garlic", "Hawthorn Berry", "Red Yeast Rice", "Cinnamon Extract"]
    },
    {
      "name": "Metabolic Support",
      "supplements": ["Berberine", "CoQ10", "Panax Ginseng", "Green Tea Extract", "NAD+ Precursors", "Red Yeast Rice", "Chromium", "Vanadium", "Bitter Melon", "Gymnema Sylvestre", "Fenugreek", "Cinnamon Extract"]
    },
    {
      "name": "Anti-Aging",
      "supplements": ["NAD+ Precursors", "PQQ", "Quercetin", "CoQ10"]
    },
    {
      "name": "Energy & Vitality",
      "supplements": ["B-Complex Vitamins", "CoQ10", "PQQ", "NAD+ Precursors", "Green Tea Extract", "Schisandra Berry", "Mucuna Pruriens", "Milk Thistle", "Stinging Nettle", "Citicoline", "Sulbutiamine", "Piracetam"]
    },
    {
      "name": "Joint Health & Mobility",
      "supplements": ["Glucosamine", "Chondroitin Sulfate", "MSM", "Boswellia", "Stinging Nettle", "Krill Oil"]
    },
    {
      "name": "Protein Synthesis & Recovery",
      "supplements": ["Whey Protein"]
    },
    {
      "name": "Immune System Support",
      "supplements": ["Vitamin C", "Vitamin D3", "Zinc", "Selenium", "Garlic", "Echinacea", "Holy Basil", "Stinging Nettle", "Elderberry", "Black Seed Oil", "Moringa"]
    },
    {
      "name": "Hormonal Balance",
      "supplements": ["Tribulus Terrestris", "Inositol", "Fenugreek", "Mucuna Pruriens"]
    },
    {
      "name": "Eye Health & Vision",
      "supplements": ["Lutein", "Astaxanthin", "Zeaxanthin", "Krill Oil"]
    },
    {
      "name": "Digestive Health",
      "supplements": ["Ginger", "Fenugreek"]
    },
    {
      "name": "Blood Sugar Control",
      "supplements": ["Alpha-Lipoic Acid", "Chromium", "Vanadium", "Bitter Melon", "Gymnema Sylvestre", "Fenugreek", "Cinnamon Extract"]
    },
    {
      "name": "Appetite Control",
      "supplements": ["Gymnema Sylvestre"]
    },
    {
      "name": "Antioxidant Support",
      "supplements": ["Bitter Melon", "Cinnamon Extract", "Hawthorn Berry"]
    }
  ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = supplementDatabase;
}

// Make available to frontend
if (typeof window !== 'undefined') {
  window.supplementsData = supplementDatabase;
  window.supplementDatabase = supplementDatabase;
  window.supplements = supplementDatabase.supplements;
}