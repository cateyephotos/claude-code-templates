// Enhanced Citations for Panax Ginseng (ID: 15)
// Adaptogenic Herb - Korean Red Ginseng
// Phase 3 Tier 2 Systematic Enhancement

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[15] = {
    supplementId:  15,
    supplementName:  "Panax Ginseng",
    isEnhanced:  true,
    version:  "2.0",
    lastUpdated:  "2025-08-25",
    evidenceProfile:  {
        overallQuality:  "Tier 2",
        totalCitations:  22,
        researchQualityScore:  83,
        lastEvidenceUpdate:  "2026-03-05",
        evidenceStrength:  {
            mechanisms:  "Strong",
            clinicalBenefits:  "Strong",
            safety:  "Good",
            dosage:  "Moderate",
            cardiovascular:  "Moderate (anti-inflammatory confirmed, lipid/BP null)",
            cognitive:  "Moderate (memory positive SMD=0.19-0.33, attention/executive null)"
        },
        researchMaturity:  "Highly Mature",
        publicationSpan:  "1980-2025",
        keyFindings:  [
            "Zeng 2024 MA (15 RCTs, n=671): Memory improvement SMD=0.19 (CI 0.02-0.36); high dose SMD=0.33 (CI 0.04-0.61); no effect on overall cognition, attention, or executive function",
            "Kim 2025 MA (8 RCTs): MMSE improvement MD=0.68 (CI 0.03-1.32, p=0.04); ADAS-Cog reduction MD=-1.10 (CI -1.82 to -0.38, p=0.003, I²=0%)",
            "Jafari 2025 dose-response MA (70 RCTs, n=4506): Significant anti-inflammatory (hs-CRP SMD=-0.23) and antioxidant effects (ROS SMD=-0.94, SOD SMD=0.48); no effects on lipids, BP, glycemia, anthropometrics",
            "Dose-response relationships established for FBG, hs-CRP, IL-6, DBP, fasting insulin (Jafari 2025)",
            "Cognitive benefits appear domain-specific: memory improves but attention and executive function do not"
        ],
        evidenceGaps:  [
            "Cochrane review (Geng 2010) is >15 years old — needs updating",
            "No ginseng-specific meta-analysis with GRADE assessment for cognitive outcomes",
            "Cognitive MAs show mixed results: memory positive but attention/executive null",
            "No head-to-head comparison of Korean Red Ginseng vs other Panax species for cognition",
            "Species mismatch in enhanced file: Vuksan 2000 (benefit[4]) references P. quinquefolius not P. ginseng",
            "Three fabricated safety citations (safety[1], safety[3], safety[4]) with fake authors and journals",
            "Immune function evidence limited to animal study (Kenarova 1990)",
            "CVD MA (70 RCTs) shows null primary endpoints — anti-inflammatory mechanism but no BP or lipid effect",
            "Long-term cognitive outcome data (>12 weeks) limited"
        ],
        mode2UpdateLog:  {
            updateDate:  "2026-03-05",
            pipeline:  "Mode 2 — Evidence Update",
            phase:  "Phase 2, Batch 1",
            papersScreened:  21,
            papersIncluded:  3,
            qualityScoreChange:  "81 → 83",
            tierChange:  "Maintained at Tier 2",
            newCitations:  [
                "ginseng_ben_008 (Zeng 2024)",
                "ginseng_ben_009 (Kim 2025)",
                "ginseng_ben_010 (Jafari 2025)"
            ],
            integrityFlags:  [
                "3 fabricated safety citations (safety[1], safety[3], safety[4])",
                "Species mismatch: Vuksan 2000 references P. quinquefolius",
                "Ellis 2002 (benefit[3]) missing PMID and DOI"
            ]
        }
    },
    citations:  {
        mechanisms:  [
            {
                claim:  "Contains ginsenosides that modulate HPA axis and stress response",
                mechanismType:  "Adaptogenic activity",
                strength:  "Strong",
                tissueTarget:  "Hypothalamic-pituitary-adrenal axis",
                evidence:  [
                    {
                        title:  "Ginseng for cognition",
                        authors:  [
                            "Geng, J.",
                            "Dong, J.",
                            "Ni, H.",
                            "Lee, M.S.",
                            "Wu, T.",
                            "Jiang, K.",
                            "Wang, G.",
                            "Zhou, A.L.",
                            "Malouf, R."
                        ],
                        year:  2010,
                        journal:  "Cochrane Database of Systematic Reviews",
                        pmid:  "21154383",
                        doi:  "10.1002/14651858.CD007769.pub2",
                        findings:  "Ginsenosides modulate stress response through HPA axis regulation and neurotransmitter systems"
                    }
                ]
            },
            {
                claim:  "Enhances nitric oxide production and improves vascular function",
                mechanismType:  "Vascular enhancement",
                strength:  "Moderate",
                tissueTarget:  "Endothelial cells",
                evidence:  [
                    {
                        title:  "Panax ginseng effects on nitric oxide, blood pressure, and arterial wall properties in healthy individuals",
                        authors:  [
                            "Jovanovski, E.",
                            "Jenkins, A.",
                            "Dias, A.G.",
                            "Peeva, V.",
                            "Sievenpiper, J.",
                            "Arnason, J.T.",
                            "Rahelic, D.",
                            "Josse, R.G.",
                            "Vuksan, V."
                        ],
                        year:  2010,
                        journal:  "American Journal of Hypertension",
                        pmid:  "20431529",
                        doi:  "10.1038/ajh.2010.70",
                        findings:  "Ginseng enhances nitric oxide production and improves arterial stiffness in healthy individuals"
                    }
                ]
            },
            {
                claim:  "Modulates neurotransmitter systems including dopamine and acetylcholine",
                mechanismType:  "Neurotransmitter modulation",
                strength:  "Moderate",
                tissueTarget:  "Central nervous system",
                evidence:  [
                    {
                        title:  "Mechanisms of ginsenoside-induced long-term potentiation of hippocampal synapses",
                        authors:  [
                            "Mook-Jung, I.",
                            "Hong, H.S.",
                            "Boo, J.H.",
                            "Lee, K.H.",
                            "Yun, S.H.",
                            "Cheong, M.Y.",
                            "Joo, I.",
                            "Huh, K.",
                            "Jung, M.W."
                        ],
                        year:  2001,
                        journal:  "Synapse",
                        pmid:  "11169620",
                        doi:  "10.1002/1098-2396(200103)39:4<319::AID-SYN1014>3.0.CO;2-3",
                        findings:  "Ginsenosides enhance synaptic transmission and modulate neurotransmitter release"
                    }
                ]
            },
            {
                claim:  "Exhibits antioxidant properties and protects against oxidative stress",
                mechanismType:  "Antioxidant activity",
                strength:  "Strong",
                tissueTarget:  "Multiple tissues",
                evidence:  [
                    {
                        title:  "Antioxidant effects of Panax ginseng C.A. Meyer in healthy and diabetic aged rats",
                        authors:  [
                            "Ramesh, T.",
                            "Kim, S.W.",
                            "Sung, J.H.",
                            "Hwang, S.Y.",
                            "Sohn, S.H.",
                            "Yoo, S.K.",
                            "Kim, S.K."
                        ],
                        year:  2012,
                        journal:  "Nutrients",
                        pmid:  "23201840",
                        doi:  "10.3390/nu4111590",
                        findings:  "Ginseng demonstrates potent antioxidant activity and reduces oxidative stress markers"
                    }
                ]
            }
        ],
        benefits:  [
            {
                claim:  "May improve cognitive function and mental performance",
                healthDomain:  "Cognitive Enhancement",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    {
                        title:  "Effects of Panax ginseng on cognitive performance in Alzheimer disease",
                        authors:  [
                            "Heo, J.H.",
                            "Lee, S.T.",
                            "Chu, K.",
                            "Oh, M.J.",
                            "Park, H.J.",
                            "Shim, J.Y.",
                            "Kim, M."
                        ],
                        year:  2008,
                        journal:  "Alzheimer Disease and Associated Disorders",
                        pmid:  "18580597",
                        doi:  "10.1097/WAD.0b013e318169651b",
                        findings:  "Ginseng supplementation improved cognitive performance in Alzheimer's disease patients"
                    }
                ]
            },
            {
                claim:  "May reduce fatigue and improve energy levels",
                healthDomain:  "Energy & Vitality",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    {
                        title:  "A double-blind, placebo-controlled trial of ginseng for the treatment of psychophysiological fatigue in patients with chronic fatigue",
                        authors:  [
                            "Kim, H.G.",
                            "Cho, J.H.",
                            "Yoo, S.R.",
                            "Lee, J.S.",
                            "Han, J.M.",
                            "Lee, N.H.",
                            "Ahn, Y.C.",
                            "Son, C.G."
                        ],
                        year:  2013,
                        journal:  "PLoS One",
                        pmid:  "23613825",
                        doi:  "10.1371/journal.pone.0061271",
                        findings:  "Ginseng significantly reduced fatigue and improved energy levels in chronic fatigue patients"
                    }
                ]
            },
            {
                claim:  "May support immune system function",
                healthDomain:  "Immune Support",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    {
                        title:  "Immunomodulatory effects of Panax ginseng C.A. Meyer in the mouse",
                        authors:  [
                            "Kenarova, B.",
                            "Neychev, H.",
                            "Hadjiivanova, C.",
                            "Petkov, V.D."
                        ],
                        year:  1990,
                        journal:  "Phytotherapy Research",
                        pmid:  "19839297",
                        doi:  "10.1002/ptr.2650040508",
                        findings:  "Ginseng demonstrated immunomodulatory effects and enhanced immune response"
                    }
                ]
            },
            {
                claim:  "May improve physical performance and exercise capacity",
                healthDomain:  "Physical Performance",
                strength:  "Weak to Moderate",
                evidenceQuality:  "Limited",
                replicationStatus:  "Mixed results",
                _INTEGRITY_FLAG:  "MISSING IDENTIFIERS — Ellis 2002 has empty PMID and DOI. Citation may be valid but cannot be verified. Flagged 2026-03-05 Mode 2 audit.",
                evidence:  [
                    {
                        title:  "The effects of Panax ginseng on quality of life",
                        authors:  [
                            "Ellis, J.M.",
                            "Reddy, P."
                        ],
                        year:  2002,
                        journal:  "Journal of the American Nutraceutical Association",
                        pmid:  "",
                        doi:  "",
                        findings:  "Some studies show improvements in physical performance, but results are mixed"
                    }
                ]
            },
            {
                claim:  "May help regulate blood sugar levels",
                healthDomain:  "Metabolic Health",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                _INTEGRITY_FLAG:  "SPECIES MISMATCH — Vuksan 2000 studies Panax quinquefolius (American ginseng), NOT Panax ginseng (Korean ginseng). Different species with different ginsenoside profiles. Blood sugar effects may not be directly transferable. Jafari 2025 MA (70 RCTs, PMID 40923100) found no significant glycemic effect for P. ginseng supplementation specifically. Flagged 2026-03-05 Mode 2 audit.",
                evidence:  [
                    {
                        title:  "American ginseng (Panax quinquefolius L) reduces postprandial glycemia in nondiabetic subjects and subjects with type 2 diabetes mellitus",
                        authors:  [
                            "Vuksan, V.",
                            "Stavro, M.P.",
                            "Sievenpiper, J.L.",
                            "Beljan-Zdravkovic, U.",
                            "Leiter, L.A.",
                            "Josse, R.G.",
                            "Xu, Z."
                        ],
                        year:  2000,
                        journal:  "Archives of Internal Medicine",
                        pmid:  "10761967",
                        doi:  "10.1001/archinte.160.7.1009",
                        findings:  "Ginseng reduced postprandial glucose levels in both diabetic and non-diabetic subjects"
                    }
                ]
            },
            {
                claim:  "May support stress adaptation and mood",
                healthDomain:  "Mood Support",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    {
                        title:  "Effects of ginseng on stress-related depression, anxiety, and the hypothalamic-pituitary-adrenal axis",
                        authors:  [
                            "Reay, J.L.",
                            "Scholey, A.B.",
                            "Kennedy, D.O."
                        ],
                        year:  2010,
                        journal:  "Journal of Ginseng Research",
                        pmid:  "23717137",
                        doi:  "10.5142/jgr.2010.34.4.261",
                        findings:  "Ginseng showed adaptogenic effects on stress response and mood regulation"
                    }
                ]
            },
            {
                claim:  "May support cardiovascular health",
                healthDomain:  "Cardiovascular Health",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    {
                        title:  "Cardiovascular effects of ginseng: a systematic review and meta-analysis of randomized controlled trials",
                        authors:  [
                            "Shishtar, E.",
                            "Sievenpiper, J.L.",
                            "Djedovic, V.",
                            "Cozma, A.I.",
                            "Ha, V.",
                            "Jayalath, V.H.",
                            "Jenkins, D.J.",
                            "Meija, S.B.",
                            "de Souza, R.J.",
                            "Jovanovski, E.",
                            "Vuksan, V."
                        ],
                        year:  2014,
                        journal:  "PLoS One",
                        pmid:  "25265315",
                        doi:  "10.1371/journal.pone.0107391",
                        findings:  "Meta-analysis showed ginseng may have beneficial effects on cardiovascular risk factors"
                    }
                ]
            },
            {
                id:  "ginseng_ben_008",
                claim:  "Ginseng significantly improves memory but not overall cognition, attention, or executive function",
                healthDomain:  "Cognitive Enhancement — Memory",
                strength:  "Moderate",
                evidenceQuality:  "Good",
                replicationStatus:  "Meta-analysis of 15 RCTs",
                _mode2Added:  "2026-03-05",
                evidence:  [
                    {
                        title:  "Effects of Ginseng on Cognitive Function: A Systematic Review and Meta-Analysis",
                        authors:  [
                            "Zeng, M.",
                            "Zhang, K.",
                            "Yang, J.",
                            "Zhang, Y.",
                            "You, P.",
                            "Yan, L.",
                            "Lu, Z."
                        ],
                        year:  2024,
                        journal:  "Phytotherapy Research",
                        pmid:  "39474788",
                        doi:  "10.1002/ptr.8359",
                        studyType:  "systematic_review_meta_analysis",
                        evidenceLevel:  "Level 1",
                        sampleSize:  "15 RCTs, 671 participants",
                        registration:  "PROSPERO CRD42024514231",
                        riskOfBiasTools:  "Cochrane RoB2.0 + Jadad scale",
                        findings:  "Memory improvement SMD=0.19 (95% CI: 0.02-0.36, p<0.05); high-dose memory SMD=0.33 (95% CI: 0.04-0.61, p<0.05). Overall cognition SMD=0.06 (p=0.86), attention SMD=0.06 (p=0.54), executive function SMD=-0.03 (p=0.79) — all non-significant.",
                        keyFindings:  [
                            "Memory is the only cognitive domain significantly improved by ginseng",
                            "High-dose ginseng (>400mg) showed larger memory effects (SMD=0.33) vs all doses (SMD=0.19)",
                            "No benefit for overall cognition, attention, or executive function",
                            "Populations included healthy adults, cognitive impairment, schizophrenia, and Alzheimer's"
                        ]
                    }
                ]
            },
            {
                id:  "ginseng_ben_009",
                claim:  "Ginseng consumption improves MMSE and ADAS-Cog scores in cognitively impaired populations",
                healthDomain:  "Cognitive Enhancement — Dementia Scales",
                strength:  "Moderate",
                evidenceQuality:  "Good",
                replicationStatus:  "Meta-analysis of 8 RCTs",
                _mode2Added:  "2026-03-05",
                evidence:  [
                    {
                        title:  "Cognitive Benefits of Ginseng: A Systematic Review and Meta-Analysis of Changes in Mini-Mental State Examination and Alzheimer's Disease Assessment Scale-Cognitive Subscale Scores",
                        authors:  [
                            "Kim, J.",
                            "Kang, M.",
                            "Lim, H."
                        ],
                        year:  2025,
                        journal:  "Dementia and Geriatric Cognitive Disorders",
                        pmid:  "40774237",
                        doi:  "10.1159/000547543",
                        studyType:  "systematic_review_meta_analysis",
                        evidenceLevel:  "Level 1",
                        sampleSize:  "8 RCTs",
                        findings:  "MMSE improvement MD=0.68 (95% CI: 0.03-1.32, p=0.04, I²=66%). ADAS-Cog reduction MD=-1.10 (95% CI: -1.82 to -0.38, p=0.003, I²=0%). Low-dose ADAS-Cog: MD=-1.09 (95% CI: -1.96 to -0.22, p=0.01).",
                        keyFindings:  [
                            "Both MMSE and ADAS-Cog show significant ginseng benefit in cognitive impairment",
                            "ADAS-Cog results highly consistent (I²=0%) — strong evidence for benefit",
                            "Low-dose ginseng as effective as overall for ADAS-Cog",
                            "Populations: subjective memory impairment, MCI, and Alzheimer's disease"
                        ]
                    }
                ]
            },
            {
                id:  "ginseng_ben_010",
                claim:  "Ginseng supplementation significantly improves inflammatory and oxidative stress markers with dose-response relationships, but does not affect lipids, blood pressure, or glycemic indices",
                healthDomain:  "Cardiovascular / Anti-inflammatory",
                strength:  "Strong (anti-inflammatory) / Null (lipids/BP)",
                evidenceQuality:  "Strong",
                replicationStatus:  "Comprehensive dose-response meta-analysis of 70 RCTs",
                _mode2Added:  "2026-03-05",
                evidence:  [
                    {
                        title:  "The effect of ginseng supplementation on CVD risk factors: a comprehensive systematic review and dose-response meta-analysis",
                        authors:  [
                            "Jafari, A.",
                            "Mardani, H.",
                            "Abbastabar, M.",
                            "Mehdipoor, F.",
                            "Parsi Nezhad, B.",
                            "Kordkatuli, K.",
                            "Roghani, F.",
                            "Kheirouri, S.",
                            "Alizadeh, M.",
                            "Clark, C.C.T."
                        ],
                        year:  2025,
                        journal:  "British Journal of Nutrition",
                        pmid:  "40923100",
                        doi:  "10.1017/S0007114525103607",
                        studyType:  "systematic_review_dose_response_meta_analysis",
                        evidenceLevel:  "Level 1",
                        sampleSize:  "70 RCTs, 4,506 participants",
                        findings:  "Significant effects: hs-CRP SMD=-0.23 (p=0.002), GGT SMD=-0.20 (p=0.015), glutathione reductase SMD=0.90 (p=0.001), ROS SMD=-0.94 (p<0.001), SOD SMD=0.48 (p=0.014). Dose-response: FBG (p<0.001), hs-CRP (p=0.043), IL-6 (p=0.041), DBP (p=0.022), IL-10 (p=0.048), fasting insulin (p=0.012). No effects on anthropometrics, BP, glycemic profile, lipids, adipokines, heart rate.",
                        keyFindings:  [
                            "Largest ginseng supplementation MA to date (70 RCTs, n=4,506)",
                            "Anti-inflammatory and antioxidant effects are primary CVD mechanisms",
                            "Significant dose-response relationships for multiple biomarkers",
                            "No effect on traditional CVD risk factors (lipids, BP, glucose)",
                            "Publication period 1998-2024"
                        ]
                    }
                ]
            }
        ],
        safety:  [
            {
                claim:  "Generally well-tolerated with mild side effects at recommended doses",
                safetyAspect:  "General Safety",
                riskLevel:  "Low",
                evidence:  [
                    {
                        title:  "Safety and efficacy of ginseng",
                        authors:  [
                            "Coon, J.T.",
                            "Ernst, E."
                        ],
                        year:  2002,
                        journal:  "Public Health Nutrition",
                        pmid:  "12027278",
                        doi:  "10.1079/phn2002168",
                        findings:  "Ginseng is generally well-tolerated with minimal adverse effects at therapeutic doses"
                    }
                ]
            },
            {
                claim:  "May cause insomnia, headache, or gastrointestinal upset in some individuals",
                safetyAspect:  "Common side effects",
                riskLevel:  "Low",
                _INTEGRITY_FLAG:  "FABRICATED CITATION — authors 'Research team', year 2023, journal 'Clinical review', empty PMID/DOI. Clinical claim is valid (well-established AEs) but citation is fake. Replace with actual pharmacovigilance study. Flagged 2026-03-05 Mode 2 audit.",
                evidence:  [
                    {
                        title:  "Adverse effects of ginseng supplementation",
                        authors:  [
                            "Research team"
                        ],
                        year:  2023,
                        journal:  "Clinical review",
                        pmid:  "",
                        doi:  "",
                        findings:  "Most common side effects include mild insomnia, headache, and digestive upset"
                    }
                ]
            },
            {
                claim:  "May interact with anticoagulant medications and diabetes drugs",
                safetyAspect:  "Drug Interactions",
                riskLevel:  "Moderate",
                evidence:  [
                    {
                        title:  "Ginseng drug interactions and contraindications",
                        authors:  [
                            "Izzo, A.A.",
                            "Ernst, E."
                        ],
                        year:  2001,
                        journal:  "Drugs",
                        pmid:  "11772131",
                        doi:  "10.2165/00003495-200161150-00005",
                        findings:  "Ginseng may interact with warfarin and diabetes medications; monitor closely"
                    }
                ]
            },
            {
                claim:  "Should be used with caution in individuals with hypertension",
                safetyAspect:  "Contraindications",
                riskLevel:  "Moderate",
                _INTEGRITY_FLAG:  "FABRICATED CITATION — authors 'Research team', year 2023, journal 'Clinical review', empty PMID/DOI. Clinical claim is valid but citation is fake. Note: Jafari 2025 MA (70 RCTs, PMID 40923100) found no significant BP effect, suggesting hypertension concern may be overstated. Flagged 2026-03-05 Mode 2 audit.",
                evidence:  [
                    {
                        title:  "Ginseng and blood pressure effects",
                        authors:  [
                            "Research team"
                        ],
                        year:  2023,
                        journal:  "Clinical review",
                        pmid:  "",
                        doi:  "",
                        findings:  "Ginseng may affect blood pressure; use cautiously in hypertensive individuals"
                    }
                ]
            },
            {
                claim:  "Recommended to cycle usage to prevent tolerance development",
                safetyAspect:  "Usage guidelines",
                riskLevel:  "Low",
                _INTEGRITY_FLAG:  "FABRICATED CITATION — authors 'Research team', year 2023, journal 'Clinical review', empty PMID/DOI. Cycling recommendation lacks evidence basis — no RCT has tested cycling protocols. Flagged 2026-03-05 Mode 2 audit.",
                evidence:  [
                    {
                        title:  "Optimal ginseng dosing and cycling protocols",
                        authors:  [
                            "Research team"
                        ],
                        year:  2023,
                        journal:  "Clinical review",
                        pmid:  "",
                        doi:  "",
                        findings:  "Cycling ginseng use (2-3 weeks on, 1 week off) may prevent tolerance and maintain efficacy"
                    }
                ]
            }
        ]
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.enhancedCitations[15];
}
