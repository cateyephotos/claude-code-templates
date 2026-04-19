// Enhanced Citations for Sulforaphane (SFN) — ID 117
// Research focus: Nrf2/Keap1 cytoprotective pathway activation, Phase II detoxification,
//                 autism spectrum disorder (Singh/Zimmerman program), chemoprevention
//                 (Qidong detoxification + lung-cancer surrogate), renoprotection,
//                 insulin resistance / NAFLD
// Evidence Profile: Tier 2 — multiple placebo-controlled RCTs (ASD, detoxification,
//                            lung-cancer biomarkers, insulin resistance) + preclinical
//                            renoprotection meta-analysis
// All 12 PMIDs PubMed-verified and DOIs retained from PubMed esummary on 2026-04-19.

const sulforaphaneEnhanced = {
    id: 117,
    name: "Sulforaphane",
    scientificName: "1-isothiocyanato-4-(methylsulfinyl)butane (SFN)",
    category: "Antioxidants",
    commonNames: ["SFN", "4-methylsulfinylbutyl isothiocyanate", "Glucoraphanin-derived isothiocyanate", "Prostaphane (branded)", "Avmacol (branded)", "TrueBroc (branded glucoraphanin)"],
    lastUpdated: "2026-04-19",

    evidenceProfile: {
        overallQuality: "Tier 2",
        totalCitations: 12,
        researchQualityScore: 70,
        lastEvidenceUpdate: "2026-04-19",
        evidenceStrength: {
            mechanisms: "Strong",
            clinicalBenefits: "Moderate",
            safety: "Well-established",
            dosage: "Partially established"
        },
        researchMaturity: "Developing",
        publicationSpan: "2006-2025"
    },

    citations: {
        mechanisms: [
            {
                mechanism: "Nrf2/Keap1 pathway activation",
                strength: "Strong",
                mechanismType: "Transcription factor signalling",
                tissueTarget: "All tissues (particularly liver, lung, intestinal epithelium, brain)",
                target: "All tissues (particularly liver, lung, intestinal epithelium, brain)",
                evidence: [
                    {
                        citationId: "clifford_2021_nrf2_sr",
                        title: "The effect of dietary phytochemicals on nuclear factor erythroid 2-related factor 2 (Nrf2) activation: a systematic review of human intervention trials.",
                        authors: ["Clifford T", "Acton JP", "Cocksedge SP", "Davies KAB", "Bailey SJ"],
                        year: 2021,
                        journal: "Molecular Biology Reports",
                        doi: "10.1007/s11033-020-06041-x",
                        pmid: "33515348",
                        studyType: "Systematic review (PRISMA, PROSPERO CRD42020176121)",
                        evidenceLevel: "Level 1",
                        studyDesign: "Systematic review of human intervention trials measuring Nrf2 gene or protein expression following phytochemical ingestion; 18 trials included, 12 compounds tested; risk of bias via Cochrane tool.",
                        findings: "Sulforaphane was one of three compounds (alongside curcumin and resveratrol) with three included trials each \u2014 the most studied phytochemicals in human Nrf2 trials. Approximately half of the included studies across all phytochemicals reported increases in Nrf2 activation; quality of evidence was mixed but sulforaphane was among the most consistently active.",
                        methodology: "PRISMA-compliant search of Medline, Embase, CAB abstracts; pre-registered protocol."
                    },
                    {
                        citationId: "egner_2014_qidong",
                        title: "Rapid and sustainable detoxication of airborne pollutants by broccoli sprout beverage: results of a randomized clinical trial in China.",
                        authors: ["Egner PA", "Chen JG", "Zarth AT", "Ng DK", "Wang JB", "Kensler KH", "Jacobson LP", "Mu\u00f1oz A", "Johnson JL", "Groopman JD", "Fahey JW", "Talalay P", "Kensler TW"],
                        year: 2014,
                        journal: "Cancer Prevention Research",
                        doi: "10.1158/1940-6207.CAPR-14-0103",
                        pmid: "24913818",
                        studyType: "Randomized placebo-controlled trial (n=291)",
                        evidenceLevel: "Level 2",
                        findings: "Broccoli-sprout beverage delivering 600 \u03bcmol glucoraphanin + 40 \u03bcmol sulforaphane daily induced rapid and sustained increases in urinary excretion of glutathione-derived mercapturic acids of airborne pollutants (benzene +61%, acrolein +23%, p\u22640.01), demonstrating induction of glutathione S-transferases and other Phase II cytoprotective enzymes \u2014 the signature Nrf2 pathway output.",
                        methodology: "12-week randomized trial in Qidong, China; urinary mercapturic acid LC-MS/MS quantification."
                    }
                ]
            },
            {
                mechanism: "Phase II detoxification enzyme induction (GST, NQO1, HO-1)",
                strength: "Strong",
                mechanismType: "Enzyme induction / xenobiotic metabolism",
                tissueTarget: "Liver, intestine, lung airway epithelium",
                target: "Liver, intestine, lung airway epithelium",
                evidence: [
                    {
                        citationId: "egner_2014_qidong",
                        title: "Rapid and sustainable detoxication of airborne pollutants by broccoli sprout beverage: results of a randomized clinical trial in China.",
                        authors: ["Egner PA", "Chen JG", "Zarth AT", "Ng DK", "Wang JB", "Kensler KH", "Jacobson LP", "Mu\u00f1oz A", "Johnson JL", "Groopman JD", "Fahey JW", "Talalay P", "Kensler TW"],
                        year: 2014,
                        journal: "Cancer Prevention Research",
                        doi: "10.1158/1940-6207.CAPR-14-0103",
                        pmid: "24913818",
                        studyType: "Randomized placebo-controlled trial (n=291)",
                        evidenceLevel: "Level 2",
                        findings: "The +61% increase in benzene-derived mercapturic acid excretion was higher in GSTT1-positive participants than in the null genotype, confirming that sulforaphane's detoxification effect operates through glutathione S-transferase (Phase II) enzyme induction. Sulforaphane bioavailability did not decline over the 12-week daily dosing period \u2014 no tachyphylaxis.",
                        methodology: "Stratified urinary biomarker analysis by GSTT1 genotype."
                    }
                ]
            },
            {
                mechanism: "Isothiocyanate metabolism and glucoraphanin-myrosinase activation",
                strength: "Strong",
                mechanismType: "Dietary precursor hydrolysis / bioavailability",
                tissueTarget: "Small intestinal lumen (where myrosinase converts glucoraphanin to sulforaphane)",
                target: "Small intestinal lumen (where myrosinase converts glucoraphanin to sulforaphane)",
                evidence: [
                    {
                        citationId: "cramer_2012_myrosinase",
                        title: "Enhancing sulforaphane absorption and excretion in healthy men through the combined consumption of fresh broccoli sprouts and a glucoraphanin-rich powder.",
                        authors: ["Cramer JM", "Teran-Garcia M", "Jeffery EH"],
                        year: 2012,
                        journal: "British Journal of Nutrition",
                        doi: "10.1017/S0007114511004429",
                        pmid: "21910945",
                        studyType: "Randomized crossover bioavailability study",
                        evidenceLevel: "Level 3",
                        findings: "24-hour urinary sulforaphane-N-acetylcysteine recovery from the glucoraphanin-only (myrosinase-lacking) powder was only 24% of dose; combining the powder with fresh broccoli sprouts (containing active plant myrosinase) raised recovery to 65% \u2014 a synergistic enhancement of SFN absorption. Broccoli-sprout powders without active myrosinase deliver substantially less SFN to the systemic circulation.",
                        methodology: "4-arm crossover meal challenge in n=4 participants; plasma and 24-h urinary SFN-NAC quantification.",
                        clinicalRelevance: "Directly informs product selection: stabilized SFN supplements or myrosinase-paired glucoraphanin products (e.g., Avmacol) outperform myrosinase-inactive products."
                    },
                    {
                        citationId: "sivapalan_2018_bioavailability",
                        title: "Bioavailability of Glucoraphanin and Sulforaphane from High-Glucoraphanin Broccoli.",
                        authors: ["Sivapalan T", "Melchini A", "Saha S", "Needs PW", "Traka MH", "Tapp H", "Dainty JR", "Mithen RF"],
                        year: 2018,
                        journal: "Molecular Nutrition and Food Research",
                        doi: "10.1002/mnfr.201700911",
                        pmid: "29266773",
                        studyType: "Randomized, double-blind, 3-phase crossover trial (NCT02300324)",
                        evidenceLevel: "Level 2",
                        findings: "In a crossover of three broccoli Myb28 genotypes (B/B, B/V, V/V), circulating sulforaphane levels were 3- to 5-fold higher after consumption of high-glucoraphanin (V/V) broccoli than standard broccoli. Percentage of SFN excreted in urine relative to glucoraphanin intake varied 2\u201315% across volunteers but was independent of broccoli genotype, pointing to gut microbiota conversion as a key modifier of bioavailability.",
                        methodology: "Three 300 g broccoli-soup crossover intervention; plant myrosinase intentionally denatured; plasma + urinary metabolite quantification."
                    }
                ]
            }
        ],

        benefits: [
            {
                healthDomain: "Neuroprotection",
                specificClaim: "Sulforaphane (50\u2013150 \u03bcmol/day for 18 weeks) produced significant behavioural improvements versus placebo in young men with moderate-to-severe autism spectrum disorder.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Pivotal 2014 trial + 2021 follow-up RCT in children (mixed results in younger children)",
                tissueTarget: "Central nervous system (multiple ASD-relevant pathways)",
                target: "Central nervous system (multiple ASD-relevant pathways)",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "singh_2014_asd",
                        title: "Sulforaphane treatment of autism spectrum disorder (ASD).",
                        authors: ["Singh K", "Connors SL", "Macklin EA", "Smith KD", "Fahey JW", "Talalay P", "Zimmerman AW"],
                        year: 2014,
                        journal: "Proceedings of the National Academy of Sciences USA",
                        doi: "10.1073/pnas.1416940111",
                        pmid: "25313065",
                        studyType: "Double-blind placebo-controlled randomized trial",
                        evidenceLevel: "Level 2",
                        studyDesign: "44 young men (aged 13\u201327) with moderate-to-severe ASD randomized 2:1 to sulforaphane (n=29) or placebo (n=15).",
                        sampleSize: "n=44",
                        duration: "18 weeks of daily dosing followed by 4 weeks without treatment",
                        dosage: "Daily oral sulforaphane 50\u2013150 \u03bcmol from broccoli-sprout extract",
                        demographics: "Young men aged 13\u201327 with moderate-to-severe ASD",
                        primaryOutcome: "Aberrant Behavior Checklist (ABC), Social Responsiveness Scale (SRS), and Clinical Global Impression Improvement Scale (CGI-I) scored by parents/caregivers and physicians.",
                        results: {
                            primaryEndpoint: {
                                outcome: "Behavioural improvement at 18 weeks",
                                effectSize: "34% improvement on ABC (p<0.001), 17% improvement on SRS (p=0.017); CGI-I significant improvements in social interaction, abnormal behavior and verbal communication (p=0.015\u20130.007); placebo arm changed <3.3%",
                                pValue: "p<0.001 (ABC), p=0.017 (SRS)",
                                clinicalSignificance: "Large, clinically meaningful behavioural improvement that reverted toward baseline after 4-week washout \u2014 supporting a direct treatment effect rather than disease modification."
                            }
                        },
                        findings: "After 18 weeks, sulforaphane recipients showed 34% improvement in ABC scores (p<0.001) and 17% improvement in SRS scores (p=0.017), with significant CGI-I gains in social interaction, abnormal behavior and verbal communication. Placebo arm scores changed <3.3%. Upon discontinuation, total scores rose toward pretreatment levels, consistent with a reversible mechanistic effect.",
                        methodology: "Randomized double-blind trial with validated caregiver- and physician-rated behavioural outcome measures.",
                        limitations: [
                            "Single-centre, all-male, narrow age range (13\u201327)",
                            "Modest sample size",
                            "Broccoli-sprout extract preparation was not a commercial product"
                        ],
                        clinicalRelevance: "First RCT demonstrating large behavioural effect-size of an isothiocyanate in ASD; spurred the multi-trial Johns Hopkins sulforaphane-ASD research program."
                    },
                    {
                        citationId: "zimmerman_2021_asd_rct",
                        title: "Randomized controlled trial of sulforaphane and metabolite discovery in children with Autism Spectrum Disorder.",
                        authors: ["Zimmerman AW", "Singh K", "Connors SL", "Liu H", "Panjwani AA", "Lee LC", "Diggins E", "Foley A", "Melnyk S", "Singh IN", "James SJ", "Frye RE", "Fahey JW"],
                        year: 2021,
                        journal: "Molecular Autism",
                        doi: "10.1186/s13229-021-00447-5",
                        pmid: "34034808",
                        studyType: "Randomized double-blind placebo-controlled trial (NCT02561481)",
                        evidenceLevel: "Level 2",
                        studyDesign: "15-week randomized double-blind placebo-controlled phase followed by 15-week open-label and 6-week no-treatment extensions (36 weeks total) in children 3\u201312 years with ASD.",
                        sampleSize: "n=57 randomized (22 SF, 23 placebo analyzed)",
                        duration: "15 weeks blinded + 15 weeks open-label + 6 weeks follow-up (36 weeks total)",
                        dosage: "Daily oral sulforaphane (dose adjusted by weight following pediatric adaptation of the Singh 2014 adult regimen)",
                        demographics: "Children 3\u201312 years with ASD.",
                        primaryOutcome: "Ohio Autism Clinical Impressions Scale (OACIS) general level of autism.",
                        results: {
                            primaryEndpoint: {
                                outcome: "OACIS change at 7 and 15 weeks",
                                effectSize: "Cohen's d 0.21 (95% CI -0.46 to 0.88) at 7 weeks, Cohen's d 0.10 (-0.52 to 0.72) at 15 weeks \u2014 non-significant",
                                pValue: ">0.05 on primary endpoint",
                                clinicalSignificance: "Primary OACIS endpoint non-significant; secondary ABC improved significantly (Cohen's d -0.96, 95% CI -1.73 to -0.15); SRS-2 not significant."
                            }
                        },
                        findings: "The primary OACIS endpoint did not reach significance. Secondary caregiver-rated Aberrant Behavior Checklist improved significantly at 15 weeks (Cohen's d -0.96, 95% CI -1.73 to -0.15) but the SRS-2 did not. Significant changes in glutathione redox status, mitochondrial respiration, inflammatory markers, and heat-shock proteins were observed in the SFN group. SFN was very well tolerated.",
                        methodology: "Randomized double-blind design with extensive biomarker panel (glutathione redox, mitochondrial, inflammatory, heat-shock).",
                        limitations: [
                            "Sample size limited to 45 analyzable",
                            "Primary endpoint (OACIS) did not reach significance",
                            "Missing data were not imputed"
                        ],
                        clinicalRelevance: "Clinical effects in children were less pronounced than in young men (Singh 2014), suggesting age-related modifiers; biomarker changes support the proposed redox/mitochondrial mechanism."
                    },
                    {
                        citationId: "magner_2023_asd_young",
                        title: "Sulforaphane Treatment in Children with Autism: A Prospective Randomized Double-Blind Study.",
                        authors: ["Magner M", "Thorov\u00e1 K", "\u017dupov\u00e1 V", "Hou\u0161ka M", "\u0160vandov\u00e1 I", "Novotn\u00e1 P", "T\u0159\u00edska J", "Vrchotov\u00e1 N", "Soural I", "J\u00edlek L"],
                        year: 2023,
                        journal: "Nutrients",
                        doi: "10.3390/nu15030718",
                        pmid: "36771424",
                        studyType: "Randomized double-blind placebo-controlled trial",
                        evidenceLevel: "Level 2",
                        sampleSize: "n=40 randomized (n=28 completed)",
                        duration: "36 weeks",
                        demographics: "Children aged 3\u20137 years with ASD",
                        findings: "In children aged 3\u20137, sulforaphane did not produce statistically significant improvements on ADOS-2, SRS-2 or ABC at any of the three study visits (baseline, 18 weeks, 36 weeks). The authors concluded no significant clinical benefit in this younger-age ASD cohort.",
                        methodology: "Three-visit 36-week design; validated ASD outcome measures.",
                        limitations: ["Smaller sample, higher drop-out rate", "Younger age range than prior positive trials"],
                        clinicalRelevance: "Tempers the ASD enthusiasm from Singh 2014; age appears to be an important modifier of response."
                    }
                ]
            },
            {
                healthDomain: "Immune System Support",
                specificClaim: "Oral sulforaphane improves Phase II detoxification of airborne environmental pollutants in humans.",
                strength: "Strong",
                evidenceQuality: "High",
                replicationStatus: "Well-replicated from the Kensler Johns Hopkins program across multiple Qidong cohorts over 20+ years",
                tissueTarget: "Liver and airway epithelium",
                target: "Liver and airway epithelium",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "egner_2014_qidong",
                        title: "Rapid and sustainable detoxication of airborne pollutants by broccoli sprout beverage: results of a randomized clinical trial in China.",
                        authors: ["Egner PA", "Chen JG", "Zarth AT", "Ng DK", "Wang JB", "Kensler KH", "Jacobson LP", "Mu\u00f1oz A", "Johnson JL", "Groopman JD", "Fahey JW", "Talalay P", "Kensler TW"],
                        year: 2014,
                        journal: "Cancer Prevention Research",
                        doi: "10.1158/1940-6207.CAPR-14-0103",
                        pmid: "24913818",
                        studyType: "Randomized placebo-controlled trial",
                        evidenceLevel: "Level 2",
                        sampleSize: "n=291",
                        duration: "12 weeks",
                        dosage: "Broccoli-sprout beverage providing 600 \u03bcmol glucoraphanin + 40 \u03bcmol sulforaphane daily",
                        primaryOutcome: "Urinary excretion of mercapturic acids of benzene, acrolein, and crotonaldehyde.",
                        results: {
                            primaryEndpoint: {
                                outcome: "Urinary glutathione-conjugate excretion",
                                effectSize: "+61% benzene mercapturic acid (p\u22640.01); +23% acrolein mercapturic acid (p\u22640.01); crotonaldehyde non-significant",
                                pValue: "p\u22640.01",
                                clinicalSignificance: "Rapid, sustained and statistically significant enhancement of Phase II detoxification of two of three tested airborne pollutants over 12 weeks."
                            }
                        },
                        findings: "In 291 participants in the heavily polluted Yangtze delta region, daily broccoli-sprout beverage significantly increased urinary excretion of glutathione-derived conjugates of benzene (+61%) and acrolein (+23%) but not crotonaldehyde. Effect was greater in GSTT1-positive participants. Sulforaphane bioavailability did not decline over the 12-week dosing period.",
                        methodology: "LC-MS/MS urinary metabolomics; GSTT1 genotyping."
                    }
                ]
            },
            {
                healthDomain: "Antioxidant Support",
                specificClaim: "Oral sulforaphane (95 \u03bcmol/day for 12 months) significantly reduced the bronchial Ki-67 proliferation index in former smokers at high lung-cancer risk.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Single Phase II RCT in lung-cancer chemoprevention context",
                tissueTarget: "Bronchial epithelium",
                target: "Bronchial epithelium",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "yuan_2025_lung_phase2",
                        title: "Randomized Phase II Clinical Trial of Sulforaphane in Former Smokers at High Risk for Lung Cancer.",
                        authors: ["Yuan JM", "Kensler TW", "Dacic S", "Hartman DJ", "Wang R", "Balogh PA", "Sufka P", "Turner MA", "Fuhrer K", "Seigh L", "Pham YT", "Adams-Haduch J", "Valacchi G", "Singh SV", "Herman JG", "Wilson DO"],
                        year: 2025,
                        journal: "Cancer Prevention Research",
                        doi: "10.1158/1940-6207.CAPR-24-0386",
                        pmid: "40041932",
                        studyType: "Randomized Phase II clinical trial (NCT03232138)",
                        evidenceLevel: "Level 2",
                        sampleSize: "n=43 randomized (n=37 completed: 17 sulforaphane, 20 placebo)",
                        duration: "12 months",
                        dosage: "95 \u03bcmol sulforaphane daily",
                        demographics: "Former smokers at high risk for lung cancer.",
                        primaryOutcome: "Changes in bronchial biopsy histopathology scores and Ki-67, caspase-3, TUNEL indices.",
                        results: {
                            primaryEndpoint: {
                                outcome: "Bronchial proliferation and apoptosis indices",
                                effectSize: "Ki-67 index: -20% in SFN group vs +65% in placebo (p=0.014); high-density (3+) Ki-67: -44% vs +71% (p=0.004). Dose-dependent correlation between SFN bioavailability and Ki-67 reduction (p-trend=0.019). No effect on caspase-3 or TUNEL.",
                                pValue: "p=0.014 (Ki-67); p=0.004 (3+ Ki-67)",
                                clinicalSignificance: "Significant reduction of a well-established bronchial proliferation marker; supports sulforaphane as a candidate chemopreventive agent against lung-cancer development."
                            }
                        },
                        findings: "Over 12 months of 95 \u03bcmol/day oral sulforaphane, the bronchial Ki-67 proliferation index decreased by 20% in the sulforaphane arm and increased by 65% in the placebo arm (p=0.014); the effect was even larger in the high-density Ki-67 subset. Bioavailability of sulforaphane correlated with Ki-67 reduction. No significant effect on apoptosis markers (caspase-3, TUNEL) or overall bronchial histopathology scores. No severe adverse events.",
                        methodology: "Pre- and post-treatment bronchial biopsy immunohistochemistry; plasma SFN bioavailability quantification."
                    }
                ]
            },
            {
                healthDomain: "Metabolic Support",
                specificClaim: "Sulforaphane supplementation (42 mg/day from broccoli-seed tablets for 12 weeks) improved HOMA-IR and increased GLP-1 in NAFLD patients with abnormal glucose.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Single RCT (human arm) with supporting rodent mechanism",
                tissueTarget: "Liver, intestinal microbiota, pancreatic \u03b2-cells",
                target: "Liver, intestinal microbiota, pancreatic \u03b2-cells",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "tian_2024_insulin",
                        title: "Improving insulin resistance by sulforaphane via activating the Bacteroides and Lactobacillus SCFAs-GPR-GLP1 signal axis.",
                        authors: ["Tian S", "Lei Y", "Zhao F", "Che J", "Wu Y", "Lei P", "Kang YE", "Shan Y"],
                        year: 2024,
                        journal: "Food and Function",
                        doi: "10.1039/d4fo01059k",
                        pmid: "39045769",
                        studyType: "Preclinical rat study + human RCT arm",
                        evidenceLevel: "Level 2",
                        sampleSize: "n=36 NAFLD patients with abnormal glucose in the RCT arm",
                        duration: "12 weeks",
                        dosage: "42 mg/day sulforaphane from broccoli-seed tablets",
                        findings: "In NAFLD patients with abnormal glucose, 12 weeks of sulforaphane-rich broccoli-seed tablets (42 mg/day) increased plasma GLP-1, which correlated positively with reductions in blood glucose and HOMA-IR. Paired rat studies showed reshaping of gut microbiota (\u2191 Bacteroides, Lactobacillus, Bifidobacterium), increased SCFA production, and activation of the GPR41/43-GLP-1 axis as the mechanistic route.",
                        methodology: "Preclinical HFD rat model with microbiota 16S rRNA and SCFA gas chromatography; human RCT arm with metabolic panels."
                    }
                ]
            },
            {
                healthDomain: "Antioxidant Support",
                specificClaim: "Preclinical meta-analysis shows sulforaphane significantly improves renal function biomarkers and reduces histological kidney injury.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "25 preclinical studies meta-analyzed",
                tissueTarget: "Kidney",
                target: "Kidney",
                metaAnalysisSupport: {
                    studiesPooled: 25,
                    pooledEffectSize: "SMD creatinine clearance +1.88 (95% CI 1.09\u20132.68); SMD plasma creatinine -1.24; SMD urea -3.22; SMD proteinuria -2.20; SMD fibrosis -3.08; all p<0.0001",
                    heterogeneity: "I\u00b2 ranged 0\u201373.7% across outcomes"
                },
                evidence: [
                    {
                        citationId: "monteiro_2023_renal_ma",
                        title: "Sulforaphane exhibits potent renoprotective effects in preclinical models of kidney diseases: A systematic review and meta-analysis.",
                        authors: ["Monteiro EB", "Ajackson M", "Stockler-Pinto MB", "Guebre-Egziabher F", "Daleprane JB", "Soulage CO"],
                        year: 2023,
                        journal: "Life Sciences",
                        doi: "10.1016/j.lfs.2023.121664",
                        pmid: "37023957",
                        studyType: "Systematic review and meta-analysis (preclinical)",
                        evidenceLevel: "Level 4",
                        findings: "Across 25 preclinical kidney-disease studies, sulforaphane (median dose 2.5 mg/kg, median duration 3 weeks) significantly increased creatinine clearance (SMD +1.88, p<0.0001) and decreased plasma creatinine (SMD -1.24), urea (SMD -3.22) and proteinuria (SMD -2.20). Histological renal fibrosis and glomerulosclerosis indices improved with large effect sizes.",
                        methodology: "PRISMA-compliant meta-analysis of preclinical rodent and in vitro models; random-effects standardized mean differences.",
                        clinicalRelevance: "Strong preclinical signal motivating human trials in CKD and diabetic nephropathy."
                    }
                ]
            }
        ],

        safety: [
            {
                safetyAspect: "General tolerability and clinical safety",
                claim: "Sulforaphane demonstrates excellent tolerability across Phase I, pediatric, and 12-month Phase II RCTs, with no serious adverse events attributable to sulforaphane in the published record.",
                riskLevel: "Low",
                target: "Multiple organ systems (hematologic, hepatic, thyroid, gastrointestinal)",
                tissueTarget: "Multiple organ systems (hematologic, hepatic, thyroid, gastrointestinal)",
                evidence: [
                    {
                        citationId: "shapiro_2006_phase1",
                        title: "Safety, tolerance, and metabolism of broccoli sprout glucosinolates and isothiocyanates: a clinical phase I study.",
                        authors: ["Shapiro TA", "Fahey JW", "Dinkova-Kostova AT", "Holtzclaw WD", "Stephenson KK", "Wade KL", "Ye L", "Talalay P"],
                        year: 2006,
                        journal: "Nutrition and Cancer",
                        doi: "10.1207/s15327914nc5501_7",
                        pmid: "16965241",
                        studyType: "Phase I placebo-controlled clinical trial",
                        evidenceLevel: "Level 2",
                        findings: "Placebo-controlled double-blind Phase I study in healthy volunteers receiving 25\u2013100 \u03bcmol doses of glucosinolates or 25 \u03bcmol isothiocyanates every 8 hours for 7 days. Detailed monitoring of 32 hematology/chemistry tests, liver enzymes, and thyroid function (TSH, T3, T4) identified no significant or consistent adverse events. Cumulative dithiocarbamate excretion was 70.6% of dose for isothiocyanates \u2014 demonstrating rapid absorption and excretion.",
                        methodology: "Formal Phase I safety and pharmacokinetics design; inpatient monitoring."
                    },
                    {
                        citationId: "chartoumpekis_2019_thyroid",
                        title: "Broccoli sprout beverage is safe for thyroid hormonal and autoimmune status: Results of a 12-week randomized trial.",
                        authors: ["Chartoumpekis DV", "Ziros PG", "Chen JG", "Groopman JD", "Kensler TW", "Sykiotis GP"],
                        year: 2019,
                        journal: "Food and Chemical Toxicology",
                        doi: "10.1016/j.fct.2019.02.004",
                        pmid: "30735751",
                        studyType: "Randomized placebo-controlled trial",
                        evidenceLevel: "Level 2",
                        sampleSize: "n=45 female participants",
                        duration: "12 weeks (84 days)",
                        findings: "In 45 female participants randomized to sulforaphane-and-glucoraphanin-enriched broccoli-sprout beverage vs placebo for 84 days, serum TSH, free T4, thyroglobulin and thyroid autoantibodies were unchanged from baseline. The authors concluded the beverage is safe for thyroid hormonal and autoimmune status \u2014 addressing the theoretical goitrogenic concern with cruciferous isothiocyanates.",
                        methodology: "Randomized 12-week trial with pre/post thyroid panel including autoimmune markers."
                    }
                ]
            }
        ],

        dosage: [
            {
                dosageRange: "15\u2013100 mg/day oral sulforaphane (or equivalent broccoli-sprout / glucoraphanin-myrosinase product); 40\u2013150 \u03bcmol/day in documented human RCTs",
                claim: "Published RCT doses span 40 \u03bcmol/day (Egner Qidong) to 95 \u03bcmol/day (Yuan Phase II lung) to 50\u2013150 \u03bcmol/day (Singh ASD) to 42 mg/day broccoli-seed tablets (Tian insulin resistance). Bioavailability depends strongly on myrosinase co-presence.",
                evidenceBase: "Partially established",
                target: "Whole-body tissue distribution (Nrf2-expressing tissues)",
                tissueTarget: "Whole-body tissue distribution (Nrf2-expressing tissues)",
                evidence: [
                    {
                        citationId: "cramer_2012_myrosinase",
                        title: "Enhancing sulforaphane absorption and excretion in healthy men through the combined consumption of fresh broccoli sprouts and a glucoraphanin-rich powder.",
                        authors: ["Cramer JM", "Teran-Garcia M", "Jeffery EH"],
                        year: 2012,
                        journal: "British Journal of Nutrition",
                        doi: "10.1017/S0007114511004429",
                        pmid: "21910945",
                        studyType: "Randomized crossover bioavailability study",
                        evidenceLevel: "Level 3",
                        findings: "Myrosinase-active formulations (broccoli-sprout + glucoraphanin-powder combination) delivered 65% of dose as urinary SFN metabolites versus only 24% from the myrosinase-lacking powder alone \u2014 nearly 3-fold difference. Myrosinase-active products or stabilized synthetic SFN should be preferred over glucoraphanin-only supplements without myrosinase."
                    },
                    {
                        citationId: "sivapalan_2018_bioavailability",
                        title: "Bioavailability of Glucoraphanin and Sulforaphane from High-Glucoraphanin Broccoli.",
                        authors: ["Sivapalan T", "Melchini A", "Saha S", "Needs PW", "Traka MH", "Tapp H", "Dainty JR", "Mithen RF"],
                        year: 2018,
                        journal: "Molecular Nutrition and Food Research",
                        doi: "10.1002/mnfr.201700911",
                        pmid: "29266773",
                        studyType: "Randomized crossover bioavailability trial",
                        evidenceLevel: "Level 2",
                        findings: "Inter-individual variation of 2\u201315% in dose recovered as urinary SFN metabolites points to gut microbiota as a major determinant of individual response; high-glucoraphanin broccoli genotypes (Myb28V/V) produced 5-fold higher plasma SFN than standard broccoli \u2014 relevant for food-based strategies."
                    }
                ]
            }
        ]
    }
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[117] = sulforaphaneEnhanced;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = sulforaphaneEnhanced;
}
