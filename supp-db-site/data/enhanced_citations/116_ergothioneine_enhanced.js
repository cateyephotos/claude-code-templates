// Enhanced Citations for Ergothioneine (EGT/ERGO/ET) — ID 116
// Research focus: Longevity ("longevity vitamin"), antioxidant tissue accumulation
//                 via OCTN1/SLC22A4, mitochondrial protection (MPST activation),
//                 cardiovascular mortality reduction, age-related cognitive decline.
// Evidence Profile: Tier 3 — 1 small pilot RCT (n=19) + large prospective cohort
//                            (n=3236, 21yr) + extensive mechanistic + animal longevity data
// All 12 PMIDs PubMed-verified and DOIs retained from PubMed esummary on 2026-04-19.

const ergothioneineEnhanced = {
    id: 116,
    name: "Ergothioneine",
    scientificName: "2-mercaptohistidine trimethylbetaine (L-Ergothioneine)",
    category: "Antioxidants",
    commonNames: ["EGT", "ERGO", "ET", "L-Ergothioneine", "Thiolhistidine betaine", "MitoPrime (branded)"],
    lastUpdated: "2026-04-19",

    evidenceProfile: {
        overallQuality: "Tier 3",
        totalCitations: 12,
        researchQualityScore: 55,
        lastEvidenceUpdate: "2026-04-19",
        evidenceStrength: {
            mechanisms: "Strong",
            clinicalBenefits: "Preliminary",
            safety: "Good",
            dosage: "Partially established"
        },
        researchMaturity: "Emerging",
        publicationSpan: "2018-2025"
    },

    citations: {
        mechanisms: [
            {
                mechanism: "OCTN1/SLC22A4-mediated tissue accumulation",
                strength: "Strong",
                mechanismType: "Active transport / cellular uptake",
                tissueTarget: "Erythrocytes, neutrophils, monocytes/macrophages, and other SLC22A4-expressing tissues",
                target: "Erythrocytes, neutrophils, monocytes/macrophages, and other SLC22A4-expressing tissues",
                evidence: [
                    {
                        citationId: "grundemann_2022_ett",
                        title: "The ergothioneine transporter (ETT): substrates and locations, an inventory.",
                        authors: ["Gr\u00fcndemann D", "Hartmann L", "Fl\u00f6gel S"],
                        year: 2022,
                        journal: "FEBS Letters",
                        doi: "10.1002/1873-3468.14269",
                        pmid: "34958679",
                        studyType: "Authoritative review",
                        evidenceLevel: "Level 5",
                        studyDesign: "Comprehensive narrative review of ETT (OCTN1/SLC22A4) substrate specificity, tissue localization and species comparison.",
                        findings: "ETT is a powerful and highly specific ergothioneine transporter that is the only well-defined biomarker for intracellular ET activity. Without ETT, the plasma membrane is essentially impermeable to ET. ETT is prominently expressed in neutrophils, monocytes/macrophages and developing erythrocytes; in humans the ability to take up, distribute and retain ET depends principally on this transporter.",
                        methodology: "Synthesis of substrate-specificity studies, localization data and cross-species comparisons.",
                        clinicalRelevance: "Explains tissue-selective accumulation of dietary ergothioneine and the mechanism by which oral intake leads to weeks-to-months tissue retention."
                    },
                    {
                        citationId: "borodina_2020_biology",
                        title: "The biology of ergothioneine, an antioxidant nutraceutical.",
                        authors: ["Borodina I", "Kenny LC", "McCarthy CM"],
                        year: 2020,
                        journal: "Nutrition Research Reviews",
                        doi: "10.1017/S0954422419000301",
                        pmid: "32051057",
                        studyType: "Authoritative narrative review",
                        evidenceLevel: "Level 5",
                        findings: "Animals have evolved a highly selective transporter (SLC22A4) for ergothioneine, signifying its importance, and ERG may have the status of a vitamin. ERG accumulates differentially in tissues according to their SLC22A4 expression, favoring those (e.g. erythrocytes) subject to oxidative stress.",
                        methodology: "Comprehensive review synthesizing biosynthesis, transport, and antioxidant function across organisms."
                    }
                ]
            },
            {
                mechanism: "Direct radical scavenging and metal chelation",
                strength: "Strong",
                mechanismType: "Antioxidant biochemistry / metal chelation",
                tissueTarget: "Mitochondria and nucleus (especially in dermal and oxidatively-stressed tissues)",
                target: "Mitochondria and nucleus (especially in dermal and oxidatively-stressed tissues)",
                evidence: [
                    {
                        citationId: "liu_2023_skin",
                        title: "Safe and Effective Antioxidant: The Biological Mechanism and Potential Pathways of Ergothioneine in the Skin.",
                        authors: ["Liu HM", "Tang W", "Wang XY", "Jiang JJ", "Zhang W", "Wang W"],
                        year: 2023,
                        journal: "Molecules",
                        doi: "10.3390/molecules28041648",
                        pmid: "36838636",
                        studyType: "Mechanistic review",
                        evidenceLevel: "Level 5",
                        findings: "In the human body, ergothioneine is transported and accumulated specifically through OCTN-1, especially in the mitochondria and nucleus, suggesting that it can target damaged cells and tissues as an antioxidant. It shows excellent antioxidant, anti-inflammatory and anti-aging properties, inhibits melanin production, and may participate in the antioxidant network system and promote the reduced glutathione regeneration cycle.",
                        methodology: "Systematic review of in vitro free-radical scavenging studies and dermatological mechanistic data.",
                        clinicalRelevance: "Provides the mechanistic basis for cosmetic and dermatological use of ergothioneine and supports its broader role as a network antioxidant."
                    },
                    {
                        citationId: "borodina_2020_biology",
                        title: "The biology of ergothioneine, an antioxidant nutraceutical.",
                        authors: ["Borodina I", "Kenny LC", "McCarthy CM"],
                        year: 2020,
                        journal: "Nutrition Research Reviews",
                        doi: "10.1017/S0954422419000301",
                        pmid: "32051057",
                        studyType: "Authoritative narrative review",
                        evidenceLevel: "Level 5",
                        findings: "Ergothioneine is an unusual thio-histidine betaine amino acid with potent antioxidant activities. It scavenges multiple reactive oxygen and nitrogen species and chelates divalent metal cations. Mushroom or ERG consumption provides significant prevention against oxidative stress in a large variety of systems.",
                        methodology: "Synthesis of biochemical and in vitro radical-scavenging data."
                    }
                ]
            },
            {
                mechanism: "Direct activation of mitochondrial 3-mercaptopyruvate sulfurtransferase (MPST)",
                strength: "Strong",
                mechanismType: "Direct enzyme activator / mitochondrial respiration",
                tissueTarget: "Skeletal muscle mitochondria",
                target: "Skeletal muscle mitochondria",
                evidence: [
                    {
                        citationId: "sprenger_2025_mpst",
                        title: "Ergothioneine controls mitochondrial function and exercise performance via direct activation of MPST.",
                        authors: ["Sprenger HG", "Mittenb\u00fchler MJ", "Sun Y", "Van Vranken JG", "Khetarpal SA", "Mills EL", "Chouchani ET", "Sabatini DM", "Spiegelman BM"],
                        year: 2025,
                        journal: "Cell Metabolism",
                        doi: "10.1016/j.cmet.2025.01.024",
                        pmid: "39965563",
                        studyType: "Mechanistic (proteome-wide thermal stability + in vivo mouse exercise)",
                        evidenceLevel: "Level 4",
                        studyDesign: "Proteome-wide thermal stability profiling identified MPST as the direct molecular target of EGT; effects validated in mitochondrial respiration assays and in vivo mouse exercise training studies.",
                        findings: "EGT accumulates in muscle mitochondria upon exercise training. Proteome-wide thermal stability identified MPST as a direct molecular target of EGT; EGT binds to and activates MPST, thereby boosting mitochondrial respiration and exercise training performance in mice. This is the first physiologically relevant EGT target identified.",
                        methodology: "Proteome-wide thermal stability shift assays, biochemical MPST activity assays, mitochondrial respirometry, in vivo mouse treadmill exercise training.",
                        clinicalRelevance: "Establishes the EGT-MPST axis as a molecular mechanism for ergothioneine's effects on mitochondrial function and provides a tractable target for therapeutic development."
                    },
                    {
                        citationId: "fong_2024_mitochondria",
                        title: "Ergothioneine and mitochondria: An important protective mechanism?",
                        authors: ["Fong ZW", "Tang RMY", "Cheah IK", "Leow DMK", "Chen L", "Halliwell B"],
                        year: 2024,
                        journal: "Biochemical and Biophysical Research Communications",
                        doi: "10.1016/j.bbrc.2024.150269",
                        pmid: "38909533",
                        studyType: "Preclinical mechanistic (isolated mitochondria + ex vivo)",
                        evidenceLevel: "Level 4",
                        findings: "Mass spectrometry demonstrates direct ergothioneine uptake into isolated mitochondria, and ET is detectable in mitochondria from ET-treated cells and animals. Mitochondria from OCTN1-knockout mouse tissues show impaired but still detectable ET uptake, suggesting alternative mitochondrial transporters may exist.",
                        methodology: "Isolated-mitochondria mass-spectrometry uptake assays, OCTN1 knockout mouse tissue experiments."
                    }
                ]
            },
            {
                mechanism: "Nrf2 pathway modulation and cytoprotection",
                strength: "Moderate",
                mechanismType: "Transcription factor signaling",
                tissueTarget: "Multiple tissues (with strongest evidence in oxidatively-stressed cells)",
                target: "Multiple tissues (with strongest evidence in oxidatively-stressed cells)",
                evidence: [
                    {
                        citationId: "tian_2023_micronutrient",
                        title: "Ergothioneine: an underrecognised dietary micronutrient required for healthy ageing?",
                        authors: ["Tian X", "Thorne JL", "Moore JB"],
                        year: 2023,
                        journal: "British Journal of Nutrition",
                        doi: "10.1017/S0007114522003592",
                        pmid: "38018890",
                        studyType: "Horizons review",
                        evidenceLevel: "Level 5",
                        findings: "Ergothioneine is capable of scavenging a diverse range of reactive oxygen and nitrogen species, has metal chelation properties, and is predicted to directly regulate nuclear factor erythroid 2-related factor 2 (Nrf2) activity. Genetic knockout of SLC22A4 increases susceptibility to oxidative stress, damage and inflammation in agreement with its role as a cellular antioxidant and cytoprotectant.",
                        methodology: "Authoritative narrative review with focus on dietary, transport and ageing biology."
                    }
                ]
            }
        ],

        benefits: [
            {
                healthDomain: "Cardiovascular Health",
                specificClaim: "Higher plasma ergothioneine is independently associated with reduced cardiovascular and all-cause mortality in a large prospective cohort with long-term follow-up.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Single large prospective cohort (Mal\u00f6 Diet and Cancer); awaiting RCT confirmation",
                tissueTarget: "Cardiovascular system",
                target: "Cardiovascular system",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "smith_2020_mortality",
                        title: "Ergothioneine is associated with reduced mortality and decreased risk of cardiovascular disease.",
                        authors: ["Smith E", "Ottosson F", "Hellstrand S", "Ericson U", "Orho-Melander M", "Fernandez C", "Melander O"],
                        year: 2020,
                        journal: "Heart",
                        doi: "10.1136/heartjnl-2019-315485",
                        pmid: "31672783",
                        studyType: "Prospective population-based cohort with long-term follow-up",
                        evidenceLevel: "Level 3",
                        studyDesign: "Plasma metabolomic profiling (LC-MS, 112 metabolites) in baseline-CVD/diabetes-free participants from the Malm\u00f6 Diet and Cancer study with multivariable Cox proportional hazards modeling.",
                        sampleSize: "n=3236",
                        duration: "Median follow-up 21.4 years",
                        demographics: "Population-based adults free of CVD and diabetes at baseline, Malm\u00f6, Sweden.",
                        primaryOutcome: "Incident coronary disease, cardiovascular mortality, all-cause mortality.",
                        results: {
                            primaryEndpoint: {
                                outcome: "Hazard ratios per 1 SD increment of plasma ergothioneine",
                                effectSize: "HR=0.85 coronary disease (p=0.01); HR=0.79 cardiovascular mortality (p=0.002); HR=0.86 overall mortality (p=4e-5)",
                                pValue: "<0.05 to 4e-5",
                                clinicalSignificance: "Higher ergothioneine remained an independent marker of lower cardiometabolic and mortality risk after multivariable adjustment."
                            }
                        },
                        findings: "During median follow-up of 21.4 years, 603 participants developed CVD, 362 developed diabetes, and 843 died. Ergothioneine was the metabolite most strongly connected to a health-conscious food pattern and was associated with reduced risk of coronary disease, cardiovascular mortality and overall mortality, independently of established risk factors.",
                        methodology: "LC-MS metabolomics; multivariable Cox regression with Bonferroni correction; long-term registry follow-up.",
                        limitations: [
                            "Observational design \u2014 cannot establish causality",
                            "Single Swedish cohort \u2014 generalizability to other populations needs replication",
                            "Plasma ergothioneine is also a biomarker of diet pattern, residual dietary confounding possible"
                        ],
                        clinicalRelevance: "The strongest human signal that body ergothioneine status tracks long-term cardiovascular and mortality risk; the foundational human cohort cited by virtually every subsequent ET review."
                    }
                ]
            },
            {
                healthDomain: "Memory Enhancement",
                specificClaim: "Long-term ergothioneine supplementation in older adults with mild cognitive impairment improved learning performance and stabilized neurofilament light chain (a biomarker of neuronal damage) versus placebo in a small pilot RCT.",
                strength: "Preliminary",
                evidenceQuality: "Low",
                replicationStatus: "Single small placebo-controlled pilot RCT (n=19) \u2014 confirmatory trials needed",
                tissueTarget: "Central nervous system",
                target: "Central nervous system",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "yau_2024_mci_pilot",
                        title: "Investigating the efficacy of ergothioneine to delay cognitive decline in mild cognitively impaired subjects: A pilot study.",
                        authors: ["Yau YF", "Cheah IK", "Mahendran R", "Tang RM", "Chua RY", "Goh RE", "Feng L", "Li J", "Kua EH", "Chen C", "Halliwell B"],
                        year: 2024,
                        journal: "Journal of Alzheimer's Disease",
                        doi: "10.1177/13872877241291253",
                        pmid: "39544014",
                        studyType: "Randomized, double-blind, placebo-controlled pilot RCT",
                        evidenceLevel: "Level 2",
                        studyDesign: "Double-blind, placebo-controlled pilot RCT (ClinicalTrials.gov NCT03641404)",
                        sampleSize: "n=19",
                        duration: "12 months",
                        dosage: "25 mg ergothioneine per capsule, 3 times per week",
                        demographics: "Subjects aged 60+ with mild cognitive impairment.",
                        primaryOutcome: "Neurocognitive performance, plasma neurofilament light chain (NfL), clinical safety markers.",
                        results: {
                            primaryEndpoint: {
                                outcome: "Cognitive testing and neurodegeneration biomarker change",
                                effectSize: "Improved Rey Auditory Verbal Learning Test performance and stabilized plasma NfL in ergothioneine arm versus significant NfL increase in placebo arm",
                                pValue: "Reported as significant (pilot, not powered for definitive efficacy)",
                                clinicalSignificance: "Suggests possible deceleration of neuronal damage with prolonged ET supplementation; requires confirmation in adequately powered trials."
                            }
                        },
                        findings: "Ergothioneine intake did not alter clinical safety markers (blood counts, kidney and liver function) throughout the 12-month study, validating its safety. Subjects receiving ergothioneine demonstrated improved Rey Auditory Verbal Learning Test performance and stabilized plasma neurofilament light chain levels, while placebo subjects showed no cognitive improvement and a significant NfL increase.",
                        methodology: "Double-blind randomization, placebo capsules matched to active, monthly safety labs, neuropsychological battery, plasma NfL ELISA, plasma ergothioneine and metabolite quantification.",
                        limitations: [
                            "Very small sample size (n=19) \u2014 underpowered for definitive efficacy",
                            "Single-center design",
                            "Intermittent dosing schedule (3x/week) limits direct dose-response inference"
                        ],
                        clinicalRelevance: "First completed randomized human trial of ergothioneine in cognitive decline; provides safety confirmation and a hypothesis-generating efficacy signal that motivates larger trials."
                    }
                ]
            },
            {
                healthDomain: "Longevity",
                specificClaim: "Ergothioneine has been formally proposed as a 'longevity vitamin' \u2014 a class of nutrients essential for long-term health but not for immediate survival.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Single influential conceptual classification (Ames PNAS 2018); independently endorsed in subsequent reviews",
                tissueTarget: "Whole-organism healthspan",
                target: "Whole-organism healthspan",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "ames_2018_longevity_vitamin",
                        title: "Prolonging healthy aging: Longevity vitamins and proteins.",
                        authors: ["Ames BN"],
                        year: 2018,
                        journal: "Proceedings of the National Academy of Sciences USA",
                        doi: "10.1073/pnas.1809045115",
                        pmid: "30322941",
                        studyType: "Conceptual / framework review",
                        evidenceLevel: "Level 5",
                        findings: "Ames proposes the 'longevity vitamin' class \u2014 nutrients required for the function of longevity proteins, whose modest deficiency triggers triage toward survival proteins at the expense of long-term-health proteins. The fungal antioxidant ergothioneine is named as one of 11 putative longevity vitamins (alongside taurine, PQQ, queuine, lutein, zeaxanthin, lycopene, alpha- and beta-carotene, beta-cryptoxanthin and astaxanthin).",
                        methodology: "Conceptual synthesis of triage theory, micronutrient biology and longevity-protein function.",
                        clinicalRelevance: "Provides the conceptual scaffolding under which ergothioneine is positioned as an aging-relevant micronutrient and motivates supplementation research in healthy older adults."
                    },
                    {
                        citationId: "tian_2023_micronutrient",
                        title: "Ergothioneine: an underrecognised dietary micronutrient required for healthy ageing?",
                        authors: ["Tian X", "Thorne JL", "Moore JB"],
                        year: 2023,
                        journal: "British Journal of Nutrition",
                        doi: "10.1017/S0007114522003592",
                        pmid: "38018890",
                        studyType: "Horizons review",
                        evidenceLevel: "Level 5",
                        findings: "In humans, blood levels of ergothioneine decline after age 60, and lower levels are associated with more rapid cognitive decline. Conversely, higher plasma ergothioneine is associated with significantly reduced cardiovascular and overall mortality. The authors argue ergothioneine should be considered a conditionally essential micronutrient for healthy ageing.",
                        methodology: "Authoritative narrative review of the cardiometabolic and ageing literature."
                    }
                ]
            },
            {
                healthDomain: "Neuroprotection",
                specificClaim: "Plasma ergothioneine declines in frailty and is inversely correlated with cognitive impairment and dementia in observational human studies.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Observational human data (Kondoh 2022) consistent with declining levels in mouse aging models",
                tissueTarget: "Hippocampus and broader CNS",
                target: "Hippocampus and broader CNS",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "kondoh_2022_frailty",
                        title: "Decline of ergothioneine in frailty and cognition impairment.",
                        authors: ["Kondoh H", "Teruya T", "Kameda M", "Yanagida M"],
                        year: 2022,
                        journal: "FEBS Letters",
                        doi: "10.1002/1873-3468.14299",
                        pmid: "35090053",
                        studyType: "Human metabolomic observational study",
                        evidenceLevel: "Level 3",
                        findings: "In frail elderly people there is a correlation between ergothioneine levels and cognitive (but not skeletal-muscle) decline. In dementia patients (including Alzheimer's disease with hippocampal atrophy) deteriorating cognition correlates with declining ergothioneine. S-methyl-ergothioneine, trimethyl-histidine and other trimethyl-ammonium compounds also decrease sharply in dementia, while indoxyl-sulfate and quinolinic acid increase.",
                        methodology: "Targeted metabolomics in frail and dementia patient cohorts.",
                        clinicalRelevance: "Supports ergothioneine as a candidate biomarker and intervention target for cognitive aging."
                    },
                    {
                        citationId: "katsube_2024_mouse_lifespan",
                        title: "Ergothioneine promotes longevity and healthy aging in male mice.",
                        authors: ["Katsube M", "Ishimoto T", "Fukushima Y", "Kagami A", "Shuto T", "Kato Y"],
                        year: 2024,
                        journal: "GeroScience",
                        doi: "10.1007/s11357-024-01111-5",
                        pmid: "38446314",
                        studyType: "Preclinical lifespan study (male mice + C. elegans)",
                        evidenceLevel: "Level 4",
                        findings: "Ingestion of 4-5 mg/kg/day ERGO from 7 weeks of age remarkably extended the lifespan of male mice; effects were corroborated by extended life and non-frailty span in C. elegans. ERGO-fed mice showed significantly lower age-related declines in weight, fat mass and movement velocity, suppression of age-related plasma biomarkers (creatinine, kynurenine, asymmetric dimethylarginine), rescue of learning and memory, suppression of TDP-43 aggregation and promotion of microglial M2 polarization.",
                        methodology: "Daily oral supplementation in drinking water from young adulthood through end-of-life; longitudinal frailty, body composition, behavioral and biomarker phenotyping.",
                        clinicalRelevance: "First mammalian lifespan study of ergothioneine \u2014 provides preclinical mechanistic foundation for human longevity trials."
                    }
                ]
            },
            {
                healthDomain: "Cardiovascular Health",
                specificClaim: "Ergothioneine pre-treatment protects against doxorubicin-induced cardiotoxicity in preclinical models without interfering with chemotherapeutic efficacy.",
                strength: "Preliminary",
                evidenceQuality: "Low",
                replicationStatus: "Single preclinical study; awaiting human translation",
                tissueTarget: "Cardiac tissue",
                target: "Cardiac tissue",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "cheah_2023_doxorubicin",
                        title: "Protection against Doxorubicin-Induced Cardiotoxicity by Ergothioneine.",
                        authors: ["Cheah IK", "Tang RMY", "Wang X", "Sachaphibulkij K", "Chong SY", "Lim LHK", "Wang JW", "Halliwell B"],
                        year: 2023,
                        journal: "Antioxidants (Basel)",
                        doi: "10.3390/antiox12020320",
                        pmid: "36829879",
                        studyType: "Preclinical in vivo (mouse doxorubicin cardiotoxicity model + tumor model)",
                        evidenceLevel: "Level 4",
                        findings: "Ergothioneine supplementation significantly protected against cardiac dysfunction in mouse doxorubicin-induced cardiotoxicity models. Importantly, ET administration in a separate breast cancer model did not exacerbate tumor growth or interfere with the chemotherapeutic efficacy of doxorubicin, suggesting potential as a co-therapy to alleviate anthracycline cardiotoxicity.",
                        methodology: "In vivo doxorubicin cardiotoxicity model with cardiac function readouts; orthogonal tumor model to confirm no chemotherapy interference.",
                        clinicalRelevance: "Identifies an oncology supportive-care indication that could be translated to human anthracycline-treated cancer patients."
                    }
                ]
            }
        ],

        safety: [
            {
                safetyAspect: "Long-term human supplementation safety",
                claim: "Twelve months of ergothioneine supplementation in older adults did not alter blood counts, renal function or liver function and was passed as safe by regulatory agencies (GRAS / EFSA novel food).",
                riskLevel: "Low",
                target: "Multiple organ systems (hematologic, renal, hepatic)",
                tissueTarget: "Multiple organ systems (hematologic, renal, hepatic)",
                evidence: [
                    {
                        citationId: "yau_2024_mci_pilot",
                        title: "Investigating the efficacy of ergothioneine to delay cognitive decline in mild cognitively impaired subjects: A pilot study.",
                        authors: ["Yau YF", "Cheah IK", "Mahendran R", "Tang RM", "Chua RY", "Goh RE", "Feng L", "Li J", "Kua EH", "Chen C", "Halliwell B"],
                        year: 2024,
                        journal: "Journal of Alzheimer's Disease",
                        doi: "10.1177/13872877241291253",
                        pmid: "39544014",
                        studyType: "Randomized, double-blind, placebo-controlled pilot RCT",
                        evidenceLevel: "Level 2",
                        findings: "Across 12 months of supplementation in MCI subjects aged 60+, ergothioneine intake did not alter clinical safety markers (whole blood counts, kidney function, liver function), further validating its safety for human consumption. No adverse events attributable to ergothioneine were reported.",
                        methodology: "Monthly safety laboratory monitoring during a placebo-controlled pilot RCT."
                    },
                    {
                        citationId: "borodina_2020_biology",
                        title: "The biology of ergothioneine, an antioxidant nutraceutical.",
                        authors: ["Borodina I", "Kenny LC", "McCarthy CM"],
                        year: 2020,
                        journal: "Nutrition Research Reviews",
                        doi: "10.1017/S0954422419000301",
                        pmid: "32051057",
                        studyType: "Authoritative narrative review",
                        evidenceLevel: "Level 5",
                        findings: "Ergothioneine has been passed as safe by regulatory agencies and may have value as a nutraceutical and antioxidant. Across the available preclinical and human-exposure data the compound shows a favorable tolerability profile with no signals of clinically meaningful toxicity at supplemental doses.",
                        methodology: "Synthesis of regulatory and toxicology literature."
                    }
                ]
            }
        ],

        dosage: [
            {
                dosageRange: "5\u201330 mg/day oral ergothioneine (5\u201330 mg/day continuous in the ErgMS protocol; 25 mg three times per week in the Yau cognitive pilot)",
                claim: "Published human supplementation studies have used 5 to 30 mg/day of stabilized oral ergothioneine. No formal upper intake level (UL) or RDA has been established.",
                evidenceBase: "Partially established",
                target: "Whole-body ergothioneine status (plasma + tissue accumulation)",
                tissueTarget: "Whole-body ergothioneine status (plasma + tissue accumulation)",
                evidence: [
                    {
                        citationId: "yau_2024_mci_pilot",
                        title: "Investigating the efficacy of ergothioneine to delay cognitive decline in mild cognitively impaired subjects: A pilot study.",
                        authors: ["Yau YF", "Cheah IK", "Mahendran R", "Tang RM", "Chua RY", "Goh RE", "Feng L", "Li J", "Kua EH", "Chen C", "Halliwell B"],
                        year: 2024,
                        journal: "Journal of Alzheimer's Disease",
                        doi: "10.1177/13872877241291253",
                        pmid: "39544014",
                        studyType: "Randomized, double-blind, placebo-controlled pilot RCT",
                        evidenceLevel: "Level 2",
                        findings: "Subjects received 25 mg ergothioneine per capsule, three times per week, for 12 months. This intermittent low-dose regimen was sufficient to raise and maintain plasma ergothioneine levels and was associated with cognitive and biomarker effects without safety concerns.",
                        methodology: "Twelve-month placebo-controlled pilot with serial plasma ergothioneine and metabolite quantification."
                    },
                    {
                        citationId: "tian_2021_ergms_protocol",
                        title: "Ergothioneine supplementation in people with metabolic syndrome (ErgMS): protocol for a randomised, double-blind, placebo-controlled pilot study.",
                        authors: ["Tian X", "Cioccoloni G", "Sier JH", "Naseem KM", "Thorne JL", "Moore JB"],
                        year: 2021,
                        journal: "Pilot and Feasibility Studies",
                        doi: "10.1186/s40814-021-00929-6",
                        pmid: "34715934",
                        studyType: "Trial protocol (pilot RCT)",
                        evidenceLevel: "Level 2",
                        findings: "ErgMS is designed as a single-centre, randomised, double-blind, placebo-controlled, 3-arm parallel pilot intervention to supplement adults with metabolic syndrome with placebo, 5 mg/day or 30 mg/day ergothioneine for 12 weeks. Outcomes include metabolic syndrome risk factors, oxidative stress markers, inflammation, platelet function and liver function.",
                        methodology: "Three-arm parallel pilot RCT design with two ergothioneine doses (5 and 30 mg/day) and placebo.",
                        clinicalRelevance: "Establishes the contemporary low- and high-dose human-trial dosing framework for ergothioneine supplementation."
                    }
                ]
            }
        ]
    }
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[116] = ergothioneineEnhanced;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ergothioneineEnhanced;
}
