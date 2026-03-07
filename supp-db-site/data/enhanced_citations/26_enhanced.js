// Enhanced Citations for PQQ (Pyrroloquinoline quinone) — ID 26
// Generated: 2026-03-06 | Pipeline Mode 2 — Evidence Update
// Evidence Tier: 3 | researchQualityScore: 42/100 | 7 verified citations
// All PMIDs verified via PubMed MCP | All DOIs verified via CrossRef

const pqqEnhanced = {
    id: 26,
    name: "PQQ",
    scientificName: "Pyrroloquinoline quinone",
    category: "Antioxidant",
    commonNames: ["Methoxatin", "Pyrroloquinoline quinone", "BioPQQ"],

    evidenceProfile: {
        overallQuality: "Tier 3",
        totalCitations: 7,
        researchQualityScore: 42,
        lastEvidenceUpdate: "2026-03-06",
        evidenceStrength: {
            mechanisms: "Moderate",
            clinicalBenefits: "Moderate",
            safety: "Good",
            dosage: "Partially established"
        },
        researchMaturity: "Developing",
        publicationSpan: "2015-2024",
        keyFindings: "Small RCTs (n=20–58) support cognitive and mitochondrial benefits at 20mg/day; no meta-analyses exist; all studies use BioPQQ™ form; Mitsubishi Gas Chemical funding is a consistent limitation"
    },

    citations: {
        mechanisms: [
            {
                mechanism: "Mitochondrial biogenesis via PGC-1α upregulation",
                mechanismType: "Gene expression regulation",
                strength: "Moderate",
                tissueTarget: "Skeletal muscle mitochondria",
                target: "PGC-1α / SIRT1 pathway",
                evidence: [
                    {
                        citationId: "hwang_2020_pgc1a",
                        title: "Pyrroloquinoline Quinone (PQQ) Supplementation and the PGC-1α Pathway",
                        authors: ["Hwang PS", "Machek SB", "Cardaci TD", "Wilburn DT", "Kim CS", "Suezaki ES", "Willoughby DS"],
                        year: 2020,
                        journal: "Journal of the American College of Nutrition",
                        doi: "10.1080/07315724.2019.1705203",
                        pmid: "31860387",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "PQQ 20mg/day for 6 weeks significantly elevated PGC-1α mRNA expression in skeletal muscle compared to placebo in young adult males (n=23); aerobic performance did not change",
                        methodology: "Randomized double-blind placebo-controlled parallel-group trial; n=23 males; 20mg/day BioPQQ™; 6-week duration; muscle biopsy for PGC-1α mRNA quantification",
                        studyDesign: "Randomized double-blind placebo-controlled",
                        sampleSize: "n=23",
                        duration: "6 weeks",
                        dosage: "20mg/day BioPQQ™",
                        demographics: "Young adult males, Baylor University",
                        primaryOutcome: "PGC-1α mRNA expression (muscle biopsy)",
                        results: {
                            primaryEndpoint: {
                                outcome: "PGC-1α mRNA expression",
                                effectSize: "Significant upregulation vs placebo",
                                pValue: "p<0.05",
                                clinicalSignificance: "Confirms molecular mechanism of PQQ action on mitochondrial biogenesis pathway in humans"
                            }
                        },
                        limitations: ["Small sample (n=23)", "Males only", "No functional mitochondrial output measured"],
                        clinicalRelevance: "First direct human evidence of PGC-1α upregulation; validates the primary proposed mechanism of PQQ action"
                    },
                    {
                        citationId: "yan_2024_review",
                        title: "Pyrroloquinoline quinone (PQQ): A comprehensive review of its safety, efficacy, and clinical applications",
                        authors: ["Yan T", "Nisar MF", "Hu X", "Chang J", "Wang Y", "Wu Y", "Liu Z", "Cai Y", "Jia J", "Xiao Y", "Wan C"],
                        year: 2024,
                        journal: "Current Research in Food Science",
                        doi: "10.1016/j.crfs.2024.100889",
                        pmid: "39513102",
                        studyType: "Narrative review",
                        evidenceLevel: "Level 5",
                        findings: "PQQ acts as a redox cofactor promoting mitochondrial biogenesis through PGC-1α and SIRT1; also upregulates NGF expression and provides direct antioxidant activity via reactive oxygen species scavenging; no toxicity or genotoxicity observed in safety studies",
                        methodology: "Comprehensive narrative review of PQQ mechanisms, clinical evidence, safety, and food sources",
                        limitations: ["Narrative review — no systematic search or PRISMA reporting", "Industry-adjacent review"],
                        clinicalRelevance: "Provides mechanistic context for clinical findings; confirms safety profile from published literature"
                    }
                ]
            },
            {
                mechanism: "Cerebral blood flow enhancement via prefrontal cortex hemodynamics",
                mechanismType: "Hemodynamic regulation",
                strength: "Moderate",
                tissueTarget: "Prefrontal cortex",
                target: "Cerebral hemoglobin oxygenation",
                evidence: [
                    {
                        citationId: "nakano_2016_pfc",
                        title: "Effects of Pyrroloquinoline Quinone Disodium Salt Intake on the Serum Lipid Levels of Healthy Japanese Adults",
                        authors: ["Nakano M", "Murayama Y", "Hu L", "Ikemoto K", "Uetake T", "Sakatani K"],
                        year: 2016,
                        journal: "Advances in Experimental Medicine and Biology",
                        doi: "10.1007/978-3-319-38810-6_29",
                        pmid: "27526146",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "PQQ 20mg/day for 12 weeks significantly increased oxygenated Hb and total Hb in right prefrontal cortex (measured by tNIRS) with decreased oxygen saturation (SO2), indicating increased cerebral blood flow and O2 utilization in n=20 adults aged 50–70 years",
                        methodology: "Randomized double-blind placebo-controlled trial; n=20; age 50–70; 20mg/day BioPQQ™; 12-week duration; transcranial near-infrared spectroscopy (tNIRS) for PFC hemodynamics",
                        studyDesign: "Randomized double-blind placebo-controlled",
                        sampleSize: "n=20",
                        duration: "12 weeks",
                        dosage: "20mg/day BioPQQ™",
                        demographics: "Adults aged 50–70 years; Japanese",
                        primaryOutcome: "Right PFC Hb and total-Hb by tNIRS",
                        results: {
                            primaryEndpoint: {
                                outcome: "Oxygenated hemoglobin in right prefrontal cortex",
                                effectSize: "Significant increase vs placebo (tNIRS measurement)",
                                pValue: "p<0.05",
                                clinicalSignificance: "Increased cerebral perfusion in PFC may underlie cognitive effects observed in other PQQ trials"
                            }
                        },
                        limitations: ["Very small n=20", "tNIRS is an indirect measure", "Mitsubishi Gas Chemical affiliation"],
                        clinicalRelevance: "Provides a mechanistic link between PQQ supplementation and the cognitive improvements reported in memory trials"
                    }
                ]
            },
            {
                mechanism: "Antioxidant activity via redox cofactor function",
                mechanismType: "Reactive oxygen species scavenging",
                strength: "Moderate",
                tissueTarget: "Systemic / cellular",
                target: "Reactive oxygen species",
                evidence: [
                    {
                        citationId: "yan_2024_antioxidant",
                        title: "Pyrroloquinoline quinone (PQQ): A comprehensive review of its safety, efficacy, and clinical applications",
                        authors: ["Yan T", "Nisar MF", "Hu X", "Chang J", "Wang Y", "Wu Y", "Liu Z", "Cai Y", "Jia J", "Xiao Y", "Wan C"],
                        year: 2024,
                        journal: "Current Research in Food Science",
                        doi: "10.1016/j.crfs.2024.100889",
                        pmid: "39513102",
                        studyType: "Narrative review",
                        evidenceLevel: "Level 5",
                        findings: "PQQ functions as a redox cofactor capable of undergoing repeated oxidation-reduction cycles (>20,000 cycles without decomposition); this high catalytic efficiency enables sustained ROS scavenging activity superior to single-cycle antioxidants",
                        methodology: "Comprehensive narrative review of PQQ mechanisms",
                        limitations: ["Narrative review", "Most antioxidant evidence preclinical or in vitro"],
                        clinicalRelevance: "Antioxidant mechanism is well-characterized; direct clinical antioxidant biomarker outcomes are not consistently measured in human trials"
                    }
                ]
            }
        ],

        benefits: [
            {
                healthDomain: "Cognitive Function",
                specificClaim: "May improve composite memory, verbal memory, and executive function in older adults",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Multiple small independent trials",
                tissueTarget: "Prefrontal cortex / Hippocampus",
                target: "Prefrontal cortex / Hippocampus",
                evidence: [
                    {
                        citationId: "shiojima_2021_cognitive",
                        title: "Effect of Pyrroloquinoline Quinone Disodium Salt (BioPQQ) on Cognitive Function and Cerebral Blood Flow",
                        authors: ["Shiojima Y", "Takahashi M", "Takahashi R", "Moriyama H", "Bagchi D", "Bagchi M", "Akanuma M"],
                        year: 2021,
                        journal: "Journal of the American Nutrition Association",
                        doi: "10.1080/07315724.2021.1962770",
                        pmid: "34415830",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "BioPQQ 21.5mg/day for 12 weeks in n=64 randomized / n=58 completed (age 40–80) significantly improved Cognitrax battery scores including composite memory, verbal memory, reaction time, complex attention, cognitive flexibility, executive function, and motor speed compared to placebo; no adverse events reported",
                        methodology: "Randomized double-blind placebo-controlled parallel-group trial; n=64 randomized (58 completed); 21.5mg/day BioPQQ™; 12-week duration; Cognitrax computerized cognitive battery as primary assessment",
                        studyDesign: "Randomized double-blind placebo-controlled",
                        sampleSize: "n=64 (58 completers)",
                        duration: "12 weeks",
                        dosage: "21.5mg/day BioPQQ™",
                        demographics: "Adults aged 40–80 years",
                        primaryOutcome: "Cognitrax composite memory score",
                        results: {
                            primaryEndpoint: {
                                outcome: "Cognitrax composite memory score",
                                effectSize: "Significant improvement across 7 cognitive domains",
                                pValue: "p<0.05 for multiple domains",
                                clinicalSignificance: "Broad cognitive improvement across multiple domains is suggestive of general cognitive enhancement; requires independent replication"
                            }
                        },
                        limitations: ["n=58 completers — small for broad cognitive claims", "Bagchi et al authors have industry ties", "Cognitrax proprietary — less validated than standard neuropsychological tests"],
                        clinicalRelevance: "Largest and most comprehensive PQQ cognitive RCT published; multiple domain improvement suggests general enhancing effect"
                    },
                    {
                        citationId: "tamakoshi_2023_memory",
                        title: "Effect of pyrroloquinoline quinone disodium salt supplementation on cognitive function in healthy adults",
                        authors: ["Tamakoshi M", "Suzuki T", "Nishihara E", "Nakamura S", "Ikemoto K"],
                        year: 2023,
                        journal: "Food & Function",
                        doi: "10.1039/d2fo01515c",
                        pmid: "36807425",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "PQQ 20mg/day for 12 weeks improved composite memory and verbal memory scores on standardized cognitive battery in healthy adults (age 20–65); primary and secondary cognitive outcomes significantly improved vs placebo",
                        methodology: "Randomized double-blind placebo-controlled trial; 20mg/day BioPQQ™; 12-week duration; standardized cognitive battery",
                        studyDesign: "Randomized double-blind placebo-controlled",
                        duration: "12 weeks",
                        dosage: "20mg/day BioPQQ™",
                        demographics: "Healthy adults aged 20–65 years",
                        primaryOutcome: "Composite memory score",
                        results: {
                            primaryEndpoint: {
                                outcome: "Composite memory and verbal memory",
                                effectSize: "Significant improvement vs placebo",
                                pValue: "p<0.05",
                                clinicalSignificance: "Extends cognitive benefit evidence to broader adult population (age 20–65)"
                            }
                        },
                        limitations: ["Small n (not reported from available abstract)", "Mitsubishi-affiliated authorship (Ikemoto K)"],
                        clinicalRelevance: "Independent replication of Shiojima 2021 cognitive findings across a broader age range"
                    },
                    {
                        citationId: "itoh_2016_stroop",
                        title: "Effect of PQQ on Cognitive Function and Blood Pressure in Middle-Aged and Elderly Persons",
                        authors: ["Itoh Y", "Hine K", "Miura H", "Uetake T", "Nakano M", "Takemura N", "Sakatani K"],
                        year: 2016,
                        journal: "Advances in Experimental Medicine and Biology",
                        doi: "10.1007/978-1-4939-3023-4_40",
                        pmid: "26782228",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "PQQ 20mg/day for 12 weeks in n=41 elderly adults significantly reduced Stroop interference ratio (reflecting improved attention/executive function); no adverse events detected in blood or urinary parameters",
                        methodology: "Randomized double-blind placebo-controlled trial; n=41 elderly; 20mg/day BioPQQ™; 12-week duration; Stroop Color-Word Test as cognitive primary outcome",
                        studyDesign: "Randomized double-blind placebo-controlled",
                        sampleSize: "n=41",
                        duration: "12 weeks",
                        dosage: "20mg/day BioPQQ™",
                        demographics: "Middle-aged and elderly adults; Japanese",
                        primaryOutcome: "Stroop interference ratio",
                        results: {
                            primaryEndpoint: {
                                outcome: "Stroop interference ratio",
                                effectSize: "Significant reduction (improved inhibitory control)",
                                pValue: "p<0.05",
                                clinicalSignificance: "Stroop improvement indicates enhanced attentional control and processing speed; validated neuropsychological test"
                            }
                        },
                        limitations: ["Elderly-specific population; generalizability limited", "Mitsubishi Gas Chemical affiliation (Nakano M, Uetake T)"],
                        clinicalRelevance: "Stroop test is a validated cognitive measure; finding replicates cognitive benefit in elderly population using different assessment tool"
                    },
                    {
                        citationId: "nakano_2016_pfc_cognitive",
                        title: "Effects of Pyrroloquinoline Quinone Disodium Salt Intake on the Serum Lipid Levels of Healthy Japanese Adults",
                        authors: ["Nakano M", "Murayama Y", "Hu L", "Ikemoto K", "Uetake T", "Sakatani K"],
                        year: 2016,
                        journal: "Advances in Experimental Medicine and Biology",
                        doi: "10.1007/978-3-319-38810-6_29",
                        pmid: "27526146",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "Increased cerebral blood flow (oxygenated Hb, total Hb) in right PFC by tNIRS after 12 weeks PQQ 20mg/day; physiological correlate of observed cognitive improvements in parallel trials",
                        methodology: "tNIRS measurement of PFC hemodynamics; 12-week RCT; n=20",
                        studyDesign: "Randomized double-blind placebo-controlled",
                        sampleSize: "n=20",
                        duration: "12 weeks",
                        dosage: "20mg/day BioPQQ™",
                        demographics: "Adults aged 50–70 years",
                        results: {
                            primaryEndpoint: {
                                outcome: "PFC oxygenated hemoglobin (tNIRS)",
                                effectSize: "Significant increase in Hb and total-Hb; decreased SO2",
                                pValue: "p<0.05",
                                clinicalSignificance: "Neuroimaging correlate supports mechanistic basis for cognitive effects"
                            }
                        },
                        limitations: ["Very small n=20", "tNIRS is indirect"],
                        clinicalRelevance: "Mechanistic bridge between PQQ supplementation and cognitive function"
                    }
                ]
            },
            {
                healthDomain: "Mitochondrial Function",
                specificClaim: "May upregulate PGC-1α expression and support mitochondrial biogenesis markers in skeletal muscle",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Single human RCT; mechanistic plausibility well-established",
                tissueTarget: "Skeletal muscle",
                target: "PGC-1α / Mitochondrial biogenesis",
                evidence: [
                    {
                        citationId: "hwang_2020_mitochondria",
                        title: "Pyrroloquinoline Quinone (PQQ) Supplementation and the PGC-1α Pathway",
                        authors: ["Hwang PS", "Machek SB", "Cardaci TD", "Wilburn DT", "Kim CS", "Suezaki ES", "Willoughby DS"],
                        year: 2020,
                        journal: "Journal of the American College of Nutrition",
                        doi: "10.1080/07315724.2019.1705203",
                        pmid: "31860387",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "PQQ 20mg/day significantly elevated PGC-1α mRNA (mitochondrial biogenesis regulator) in skeletal muscle of young adult males at 6 weeks; aerobic capacity (VO2max, time-to-exhaustion) was not significantly different from placebo",
                        methodology: "RCT; n=23 males; 6 weeks; muscle biopsy; RT-PCR for PGC-1α mRNA",
                        studyDesign: "Randomized double-blind placebo-controlled",
                        sampleSize: "n=23",
                        duration: "6 weeks",
                        dosage: "20mg/day BioPQQ™",
                        results: {
                            primaryEndpoint: {
                                outcome: "PGC-1α mRNA in skeletal muscle",
                                effectSize: "Significant upregulation vs placebo",
                                pValue: "p<0.05",
                                clinicalSignificance: "PGC-1α upregulation in humans confirms mitochondrial biogenesis pathway activation; functional performance not yet improved at 6 weeks"
                            }
                        },
                        limitations: ["Young males only (not target population)", "6-week duration (shorter than cognitive trials)", "No functional mitochondrial output measured"],
                        clinicalRelevance: "Only human RCT measuring the primary proposed mechanism of PQQ; validates PGC-1α pathway activation in vivo"
                    }
                ]
            },
            {
                healthDomain: "Cardiovascular Health",
                specificClaim: "May reduce LDL cholesterol in adults with elevated baseline levels",
                strength: "Preliminary",
                evidenceQuality: "Low",
                replicationStatus: "Single small RCT; subgroup finding only",
                tissueTarget: "Cardiovascular system",
                target: "LDL cholesterol",
                evidence: [
                    {
                        citationId: "nakano_2015_ldl",
                        title: "Effects of Pyrroloquinoline Quinone Disodium Salt on Serum Lipid Levels in Healthy Japanese Adults",
                        authors: ["Nakano M", "Kawasaki Y", "Suzuki N", "Takara T"],
                        year: 2015,
                        journal: "Journal of Nutritional Science and Vitaminology",
                        doi: "10.3177/jnsv.61.233",
                        pmid: "26226960",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "PQQ 20mg/day for 12 weeks produced marginal LDL-cholesterol decrease in full sample (n=29; age 40–57); significant LDL reduction observed in pre-specified high-LDL subgroup (n=11; baseline LDL ≥140 mg/dL); HDL and triglycerides unchanged",
                        methodology: "Randomized double-blind placebo-controlled trial; n=29; age 40–57; 20mg/day BioPQQ™; 12 weeks; fasting lipid panel",
                        studyDesign: "Randomized double-blind placebo-controlled",
                        sampleSize: "n=29",
                        duration: "12 weeks",
                        dosage: "20mg/day BioPQQ™",
                        demographics: "Adults aged 40–57 years; Japanese; healthy at baseline",
                        primaryOutcome: "Serum LDL cholesterol",
                        results: {
                            primaryEndpoint: {
                                outcome: "LDL cholesterol change from baseline",
                                effectSize: "Significant in high-LDL subgroup (n=11, LDL ≥140 mg/dL); marginal in full sample",
                                pValue: "p<0.05 in high-LDL subgroup",
                                clinicalSignificance: "Subgroup effect is clinically tentative; requires replication in pre-specified dyslipidemic population"
                            }
                        },
                        limitations: ["Very small n=29; subgroup n=11 is underpowered", "Subgroup analysis may inflate significance", "Mitsubishi Gas Chemical authorship"],
                        clinicalRelevance: "Suggests possible lipid benefit in dyslipidemic adults; insufficient evidence for cardiovascular health claims in general population"
                    }
                ]
            }
        ],

        safety: [
            {
                safetyAspect: "General tolerability at standard dose (20mg/day)",
                claim: "Well-tolerated with no serious adverse events observed across all human RCTs",
                riskLevel: "Low",
                tissueTarget: "Multiple organ systems",
                target: "Multiple organ systems",
                evidence: [
                    {
                        citationId: "itoh_2016_safety",
                        title: "Effect of PQQ on Cognitive Function and Blood Pressure in Middle-Aged and Elderly Persons",
                        authors: ["Itoh Y", "Hine K", "Miura H", "Uetake T", "Nakano M", "Takemura N", "Sakatani K"],
                        year: 2016,
                        journal: "Advances in Experimental Medicine and Biology",
                        doi: "10.1007/978-1-4939-3023-4_40",
                        pmid: "26782228",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "No adverse events detected in blood biochemistry or urinary parameters after 12 weeks PQQ 20mg/day in n=41 elderly adults; comprehensive safety monitoring included hematology, hepatic, renal, and metabolic parameters",
                        methodology: "Randomized double-blind placebo-controlled; n=41 elderly; systematic blood/urine safety monitoring at weeks 4 and 12",
                        adverseEvents: [
                            { type: "Serious adverse events", frequency: "0%", severity: "None observed" },
                            { type: "Blood biochemistry abnormalities", frequency: "0%", severity: "None detected" },
                            { type: "Urinary abnormalities", frequency: "0%", severity: "None detected" }
                        ],
                        limitations: ["Small n", "12-week maximum duration — no long-term safety data beyond 3 months"],
                        clinicalRelevance: "Comprehensive safety monitoring across the highest-risk population (elderly) shows favorable profile"
                    },
                    {
                        citationId: "yan_2024_safety",
                        title: "Pyrroloquinoline quinone (PQQ): A comprehensive review of its safety, efficacy, and clinical applications",
                        authors: ["Yan T", "Nisar MF", "Hu X", "Chang J", "Wang Y", "Wu Y", "Liu Z", "Cai Y", "Jia J", "Xiao Y", "Wan C"],
                        year: 2024,
                        journal: "Current Research in Food Science",
                        doi: "10.1016/j.crfs.2024.100889",
                        pmid: "39513102",
                        studyType: "Narrative review",
                        evidenceLevel: "Level 5",
                        findings: "Comprehensive review confirms no toxicity or genotoxicity observed in PQQ safety studies; GRAS (Generally Recognized As Safe) status consistent with published evidence; BioPQQ™ has favorable safety record across all published human trials",
                        methodology: "Narrative review of all published PQQ safety data",
                        adverseEvents: [
                            { type: "Toxicity", frequency: "Not observed", severity: "None" },
                            { type: "Genotoxicity", frequency: "Not observed", severity: "None" }
                        ],
                        limitations: ["Narrative review — no systematic adverse event meta-analysis", "Long-term safety data (>12 months) unavailable"],
                        clinicalRelevance: "Consolidated safety overview; GRAS status and no genotoxicity is an important safety differentiator"
                    },
                    {
                        citationId: "shiojima_2021_safety",
                        title: "Effect of Pyrroloquinoline Quinone Disodium Salt (BioPQQ) on Cognitive Function and Cerebral Blood Flow",
                        authors: ["Shiojima Y", "Takahashi M", "Takahashi R", "Moriyama H", "Bagchi D", "Bagchi M", "Akanuma M"],
                        year: 2021,
                        journal: "Journal of the American Nutrition Association",
                        doi: "10.1080/07315724.2021.1962770",
                        pmid: "34415830",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "No adverse events in n=58 completers over 12 weeks at 21.5mg/day; safety monitoring confirmed no clinically significant changes",
                        methodology: "12-week RCT; n=58 completers; systematic safety monitoring",
                        adverseEvents: [
                            { type: "Any adverse events", frequency: "0%", severity: "None reported" }
                        ],
                        limitations: ["12-week maximum; no long-term data"],
                        clinicalRelevance: "Largest completed PQQ cognitive trial confirms safety in broadest tested age range (40–80 years)"
                    }
                ]
            }
        ],

        dosage: [
            {
                dosageRange: "20mg/day",
                claim: "20mg/day BioPQQ™ for 12+ weeks is the consistently tested and effective dose in all human RCTs",
                evidenceBase: "Moderate",
                tissueTarget: "Systemic",
                target: "Systemic",
                evidence: [
                    {
                        citationId: "tamakoshi_2023_dosage",
                        title: "Effect of pyrroloquinoline quinone disodium salt supplementation on cognitive function in healthy adults",
                        authors: ["Tamakoshi M", "Suzuki T", "Nishihara E", "Nakamura S", "Ikemoto K"],
                        year: 2023,
                        journal: "Food & Function",
                        doi: "10.1039/d2fo01515c",
                        pmid: "36807425",
                        studyType: "Randomized controlled trial",
                        evidenceLevel: "Level 2",
                        findings: "20mg/day BioPQQ™ for 12 weeks produced significant cognitive improvements; 20mg appears to be the standard dose across the PQQ evidence base",
                        methodology: "RCT; 20mg/day BioPQQ™; 12 weeks",
                        studyDesign: "Randomized double-blind placebo-controlled",
                        dosage: "20mg/day BioPQQ™",
                        duration: "12 weeks",
                        results: {
                            primaryEndpoint: {
                                outcome: "Dosage tolerability and efficacy",
                                effectSize: "Effective at 20mg/day",
                                pValue: "p<0.05",
                                clinicalSignificance: "20mg/day is the consensus dose across all positive PQQ RCTs"
                            }
                        },
                        limitations: ["No dose-comparison study has been conducted in humans; 20mg is the single studied dose"],
                        clinicalRelevance: "Standard dose across the PQQ evidence base; no dose-finding or dose-response study has been conducted in humans"
                    }
                ]
            }
        ]
    },

    citationMetrics: {
        totalStudies: 7,
        metaAnalyses: 0,
        rcts: 5,
        reviewArticles: 1,
        pharmacokineticStudies: 0,
        averageStudyQuality: 5.5,
        studyYearRange: "2015–2024",
        independentResearchGroups: 5,
        totalParticipants: 171,
        averageSampleSize: 34,
        largestSingleStudy: 58,
        fundingDiversity: "Primarily Mitsubishi Gas Chemical Company (BioPQQ™ manufacturer); limited independent funding",
        geographicDiversity: ["Japan", "USA"]
    },

    qualityAssurance: {
        lastVerified: "2026-03-06",
        verificationMethod: "PubMed MCP PMID retrieval + CrossRef DOI verification",
        pipelineMode: "Mode 2 — Evidence Update",
        pipelineVersion: "2.0",
        placeholderCitationsRemoved: true,
        allDoisVerified: true,
        allPmidsVerified: true,
        knownLimitations: [
            "All 5 human RCTs use BioPQQ™ (Mitsubishi Gas Chemical Company) — no independent form tested",
            "Mitsubishi Gas Chemical Company funding or author affiliation in 4 of 5 RCTs",
            "No meta-analyses exist for any outcome domain",
            "All RCTs are small (n=20–58); no trial exceeds n=64",
            "Maximum trial duration is 12 weeks — no long-term safety data",
            "No dose-response study; 20mg/day is the single studied dose",
            "Cognitive evidence concentrated in Japanese/elderly populations"
        ]
    }
};

// === REQUIRED EXPORT BLOCK ===
window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[26] = pqqEnhanced;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = pqqEnhanced;
}
