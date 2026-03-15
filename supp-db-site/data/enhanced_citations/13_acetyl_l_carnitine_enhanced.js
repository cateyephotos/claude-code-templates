// Enhanced Citations for Acetyl-L-Carnitine (ID: 13)
// Nootropic and Metabolic Enhancer
// Phase 2B Nootropics Expansion

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[13] = {
    supplementId:  13,
    supplementName:  "Acetyl-L-Carnitine",
    isEnhanced:  true,
    version:  "2.0",
    lastUpdated:  "2025-08-25",
    evidenceProfile:  {
        overallQuality:  "Tier 2",
        totalCitations:  16,
        researchQualityScore:  79,
        lastEvidenceUpdate:  "2026-03-05",
        evidenceStrength:  {
            mechanisms:  "Strong",
            clinicalBenefits:  "Moderate",
            safety:  "Good",
            dosage:  "Evidence-based"
        },
        researchMaturity:  "Mature",
        publicationSpan:  "1990-2025",
        keyFindings:  "Well-characterized amino acid with strong mechanistic understanding and moderate evidence for cognitive and metabolic benefits. New NMA evidence supports ALC for erectile dysfunction (SUCRA 97% in combination) and male fertility (sperm quality improvement)."
    },
    keyFindings:  [
        "Cochrane review (Hudson 2003) found benefits for cognitive function in dementia/MCI",
        "Barbonetti 2024 NMA (15 RCTs, n=1000): PLC+ALC+Sildenafil ranked highest for ED (SUCRA 97%)",
        "Niu 2025 NMA (16 RCTs): L-carnitine+ALC significantly improved sperm quality parameters",
        "Multiple RCTs support fatigue reduction in elderly (Malaguarnera 2007)",
        "Strong mechanistic evidence: BBB transport, mitochondrial function, acetylcholine synthesis"
    ],
    evidenceGaps:  [
        "No ALCAR-specific meta-analysis with pooled cognitive effect estimates exists",
        "Depression evidence limited to adjunctive use in elderly — no standalone ALCAR depression MA",
        "Neuropathy evidence mixed — harmful for CIPN (Frediani 2023) but positive for DPN",
        "No head-to-head comparison of ALCAR vs L-carnitine for any indication",
        "Dose-response not formally characterized in meta-analytic framework",
        "Long-term cognitive outcomes (>1 year) not established",
        "Two safety citations in enhanced file are fabricated (flagged with _INTEGRITY_FLAG)"
    ],
    mode2UpdateLog:  {
        date:  "2026-03-05",
        operator:  "Claude (automated pipeline)",
        phase:  "Phase 2, Batch 1",
        papersSearched:  20,
        papersIncluded:  2,
        qualityScoreChange:  "79 (unchanged — base 78 from supplements.js + 1 already applied; no further increment justified by L-carnitine-general NMAs)",
        tierChange:  "No change — Tier 2 maintained",
        newCitations:  [
            "Barbonetti 2024 (PMID 39279185)",
            "Niu 2025 (PMID 40813743)"
        ],
        integrityIssues:  [
            "2 fake safety citations flagged (_INTEGRITY_FLAG)",
            "Citation count mismatch (evidenceProfile=16, actual studies=11, supplements.js=14)"
        ]
    },
    citations:  {
        mechanisms:  [
            {
                claim:  "Crosses blood-brain barrier more effectively than L-carnitine to support brain metabolism",
                mechanismType:  "Blood-brain barrier transport",
                strength:  "Strong",
                tissueTarget:  "Brain tissue",
                evidence:  [
                    {
                        title:  "Acetyl-L-carnitine: metabolism and applications in clinical practice",
                        authors:  [
                            "Pettegrew, J.W.",
                            "Levine, J.",
                            "McClure, R.J."
                        ],
                        year:  2000,
                        journal:  "Neurochemical Research",
                        pmid:  "11028937",
                        doi:  "10.1023/a:1007659928358",
                        findings:  "ALCAR crosses the blood-brain barrier more efficiently than L-carnitine and supports neuronal energy metabolism"
                    }
                ]
            },
            {
                claim:  "Enhances mitochondrial fatty acid oxidation and ATP production",
                mechanismType:  "Mitochondrial function",
                strength:  "Strong",
                tissueTarget:  "Mitochondria",
                evidence:  [
                    {
                        title:  "The role of carnitine in mitochondrial fatty acid oxidation",
                        authors:  [
                            "Houten, S.M.",
                            "Wanders, R.J."
                        ],
                        year:  2010,
                        journal:  "Biochimica et Biophysica Acta",
                        pmid:  "20036321",
                        doi:  "10.1016/j.bbalip.2010.01.015",
                        findings:  "Carnitine is essential for mitochondrial fatty acid oxidation and energy production"
                    }
                ]
            },
            {
                claim:  "Modulates acetylcholine synthesis and cholinergic neurotransmission",
                mechanismType:  "Neurotransmitter modulation",
                strength:  "Moderate",
                tissueTarget:  "Cholinergic neurons",
                evidence:  [
                    {
                        title:  "Acetyl-L-carnitine and Alzheimer's disease: pharmacological considerations beyond the cholinergic sphere",
                        authors:  [
                            "Parnetti, L.",
                            "Mignini, F.",
                            "Tomassoni, D.",
                            "Traini, E.",
                            "Amenta, F."
                        ],
                        year:  2007,
                        journal:  "Annals of the New York Academy of Sciences",
                        pmid:  "17872076",
                        doi:  "10.1196/annals.1403.008",
                        findings:  "ALCAR provides acetyl groups for acetylcholine synthesis and supports cholinergic function"
                    }
                ]
            }
        ],
        benefits:  [
            {
                claim:  "May improve cognitive function and memory in aging adults",
                healthDomain:  "Cognitive Enhancement",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    {
                        title:  "Acetyl-L-carnitine for dementia",
                        authors:  [
                            "Hudson, S.",
                            "Tabet, N."
                        ],
                        year:  2003,
                        journal:  "Cochrane Database of Systematic Reviews",
                        pmid:  "12804452",
                        doi:  "10.1002/14651858.CD003158",
                        findings:  "ALCAR showed benefits for cognitive function in some studies of dementia and mild cognitive impairment"
                    }
                ]
            },
            {
                claim:  "May reduce mental fatigue and improve energy levels",
                healthDomain:  "Energy & Vitality",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Limited studies",
                evidence:  [
                    {
                        title:  "Effects of acetyl-L-carnitine on physical and mental fatigue",
                        authors:  [
                            "Malaguarnera, M.",
                            "Cammalleri, L.",
                            "Gargante, M.P.",
                            "Vacante, M.",
                            "Colonna, V.",
                            "Motta, M."
                        ],
                        year:  2007,
                        journal:  "Aging Clinical and Experimental Research",
                        pmid:  "17607085",
                        doi:  "10.1007/BF03324688",
                        findings:  "ALCAR supplementation reduced physical and mental fatigue in elderly subjects"
                    }
                ]
            },
            {
                claim:  "May support exercise performance and recovery",
                healthDomain:  "Athletic Performance",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    {
                        title:  "The bright and the dark sides of L-carnitine supplementation: a systematic review",
                        authors:  [
                            "Ribas, G.S.",
                            "Vargas, C.R.",
                            "Wajner, M."
                        ],
                        year:  2020,
                        journal:  "Journal of the International Society of Sports Nutrition",
                        pmid:  "32958033",
                        doi:  "10.1186/s12970-020-00377-2",
                        findings:  "L-carnitine supplementation enhanced fat oxidation and reduced muscle glycogen utilization during exercise"
                    }
                ]
            },
            {
                claim:  "May support mood and reduce symptoms of depression",
                healthDomain:  "Mood Support",
                strength:  "Weak to Moderate",
                evidenceQuality:  "Limited",
                replicationStatus:  "Preliminary studies",
                evidence:  [
                    {
                        title:  "Acetyl-L-carnitine augmentation of sertraline treatment of geriatric depression",
                        authors:  [
                            "Zanardi, R.",
                            "Smeraldi, E."
                        ],
                        year:  2006,
                        journal:  "American Journal of Geriatric Psychiatry",
                        pmid:  "16473973",
                        doi:  "10.1097/01.JGP.0000196627.12010.d1",
                        findings:  "ALCAR augmentation improved antidepressant response in elderly patients with depression"
                    }
                ]
            },
            {
                claim:  "May support peripheral nerve function and neuropathy symptoms",
                healthDomain:  "Neurological Health",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    {
                        title:  "Acetyl-L-carnitine for peripheral neuropathy",
                        authors:  [
                            "Bianchi, G.",
                            "Vitali, G.",
                            "Caraceni, A.",
                            "Ravaglia, S.",
                            "Capri, G.",
                            "Cundari, S.",
                            "Zanna, C.",
                            "Gianni, L."
                        ],
                        year:  2005,
                        journal:  "Tumori",
                        pmid:  "16001973",
                        doi:  "",
                        findings:  "ALCAR showed benefits for chemotherapy-induced peripheral neuropathy"
                    }
                ]
            },
            {
                id:  "alcar_benefit_6",
                claim:  "Propionyl-L-carnitine + ALC combination with sildenafil ranked highest for erectile dysfunction treatment in network meta-analysis",
                healthDomain:  "Sexual Health / Erectile Dysfunction",
                strength:  "Moderate",
                evidenceQuality:  "High (NMA)",
                replicationStatus:  "Network meta-analysis of 15 RCTs",
                _mode2Added:  "2026-03-05",
                evidence:  [
                    {
                        title:  "Efficacy of Nutraceuticals for the Treatment of Erectile Dysfunction: A Systematic Review and Network Meta-analysis of Randomized Clinical Trials",
                        authors:  [
                            "Barbonetti, A.",
                            "D'Andrea, S.",
                            "Martorella, A.",
                            "Felice, F.",
                            "Francavilla, S."
                        ],
                        year:  2024,
                        journal:  "The Journal of Sexual Medicine",
                        pmid:  "39279185",
                        doi:  "10.1093/jsxmed/qdae123",
                        findings:  "NMA of 15 RCTs (n≈1000): PLC+ALC+Sildenafil ranked highest with SUCRA 97% for IIEF-EF score improvement. ALC is part of the most effective nutraceutical combination for ED treatment."
                    }
                ]
            },
            {
                id:  "alcar_benefit_7",
                claim:  "L-carnitine and ALC supplementation significantly improves sperm quality parameters including motility",
                healthDomain:  "Male Fertility",
                strength:  "Moderate",
                evidenceQuality:  "High (NMA)",
                replicationStatus:  "Network meta-analysis of 16 RCTs",
                _mode2Added:  "2026-03-05",
                evidence:  [
                    {
                        title:  "The comparative efficacy of carnitine and CoQ10 supplementation on sperm quality: a systematic review and network meta-analysis",
                        authors:  [
                            "Niu, Z.H.",
                            "Zou, M.B.",
                            "Yang, J.",
                            "Li, S.S.",
                            "Chen, Z.P.",
                            "Shao, P."
                        ],
                        year:  2025,
                        journal:  "European Journal of Clinical Pharmacology",
                        pmid:  "40813743",
                        doi:  "10.1007/s43032-025-01958-9",
                        findings:  "NMA of 16 RCTs: L-carnitine ranked best for progressive motility (SMD 4.19, 95% CI 0.51-7.87). ALC+L-carnitine combination significantly improved overall sperm quality parameters."
                    }
                ]
            }
        ],
        safety:  [
            {
                claim:  "Generally well-tolerated with minimal side effects at recommended doses",
                safetyAspect:  "General Safety",
                riskLevel:  "Low",
                evidence:  [
                    {
                        title:  "Safety and tolerability of acetyl-L-carnitine supplementation",
                        authors:  [
                            "Malaguarnera, M."
                        ],
                        year:  2012,
                        journal:  "Drugs in R&D",
                        pmid:  "22934754",
                        doi:  "10.2165/11635200-000000000-00000",
                        findings:  "ALCAR supplementation showed good safety profile with minimal adverse effects"
                    }
                ]
            },
            {
                claim:  "May cause mild gastrointestinal upset or fishy body odor in some individuals",
                safetyAspect:  "Dose-dependent effects",
                riskLevel:  "Low",
                _INTEGRITY_FLAG:  "FABRICATED CITATION — 'Research team' is not a real author; no PMID/DOI. Side effect claim is clinically valid but citation is fake. Needs replacement with actual safety study.",
                evidence:  [
                    {
                        title:  "Adverse effects of L-carnitine supplementation",
                        authors:  [
                            "Research team"
                        ],
                        year:  2023,
                        journal:  "Clinical review",
                        pmid:  "",
                        doi:  "",
                        findings:  "High doses may cause nausea, vomiting, or fishy body odor in sensitive individuals"
                    }
                ]
            },
            {
                claim:  "May interact with anticoagulant medications",
                safetyAspect:  "Drug Interactions",
                riskLevel:  "Moderate",
                _INTEGRITY_FLAG:  "FABRICATED CITATION — 'Research team' is not a real author; no PMID/DOI. Drug interaction claim is clinically valid but citation is fake. Needs replacement with actual pharmacokinetic study.",
                evidence:  [
                    {
                        title:  "L-carnitine and anticoagulant interactions",
                        authors:  [
                            "Research team"
                        ],
                        year:  2023,
                        journal:  "Clinical review",
                        pmid:  "",
                        doi:  "",
                        findings:  "Potential for enhanced anticoagulant effects; monitor INR if taking warfarin"
                    }
                ]
            }
        ]
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.enhancedCitations[13];
}
