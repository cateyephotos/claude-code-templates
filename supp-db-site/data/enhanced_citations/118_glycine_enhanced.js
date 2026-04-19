// Enhanced Citations for Glycine — ID 118
// Research focus: Sleep quality (3 g pre-bed, Bannai program), NMDA glycine-site
//                 modulation (cognition, schizophrenia adjunct), glutathione
//                 synthesis substrate (with caveat that GlyNAC trials use the
//                 fixed glycine + N-acetylcysteine combination, not pure glycine),
//                 collagen synthesis substrate.
// Evidence Profile: Tier 3 — small completed glycine-specific RCTs (sleep, cognition)
//                            + supportive mechanistic inference from GlyNAC trials in
//                            older adults (Sekhar/Kumar program at Baylor)
// All 12 PMIDs PubMed-verified and DOIs retained from PubMed esummary on 2026-04-19.

const glycineEnhanced = {
    id: 118,
    name: "Glycine",
    scientificName: "Aminoacetic acid (C2H5NO2)",
    category: "Amino Acids",
    commonNames: ["L-Glycine", "Aminoacetic Acid", "Glycocoll"],
    lastUpdated: "2026-04-19",

    evidenceProfile: {
        overallQuality: "Tier 3",
        totalCitations: 12,
        researchQualityScore: 52,
        lastEvidenceUpdate: "2026-04-19",
        evidenceStrength: {
            mechanisms: "Strong",
            clinicalBenefits: "Moderate",
            safety: "Well-established",
            dosage: "Partially established"
        },
        researchMaturity: "Developing",
        publicationSpan: "1999-2023"
    },

    citations: {
        mechanisms: [
            {
                mechanism: "Glutathione synthesis substrate (rate-limiting)",
                strength: "Strong",
                mechanismType: "Amino acid precursor / antioxidant biosynthesis",
                tissueTarget: "All tissues (especially red blood cells, liver, brain)",
                target: "All tissues (especially red blood cells, liver, brain)",
                evidence: [
                    {
                        citationId: "sekhar_2021_glynac_review",
                        title: "GlyNAC Supplementation Improves Glutathione Deficiency, Oxidative Stress, Mitochondrial Dysfunction, Inflammation, Aging Hallmarks, Metabolic Defects, Muscle Strength, Cognitive Decline, and Body Composition: Implications for Healthy Aging.",
                        authors: ["Sekhar RV"],
                        year: 2021,
                        journal: "Journal of Nutrition",
                        doi: "10.1093/jn/nxab309",
                        pmid: "34587244",
                        studyType: "Authoritative narrative review",
                        evidenceLevel: "Level 5",
                        findings: "Glycine and cysteine are precursor amino acids for the antioxidant tripeptide glutathione (GSH). Older humans show deficiencies of cellular glycine, cysteine and GSH; supplementation with glycine and N-acetylcysteine (GlyNAC) corrects these deficiencies and improves oxidative stress, mitochondrial function and inflammation. The contribution of glycine specifically is its role as a rate-limiting substrate for de novo GSH synthesis in older adults.",
                        methodology: "Narrative synthesis of rodent and human GlyNAC trials.",
                        clinicalRelevance: "Establishes glycine\u2014alongside cysteine\u2014as a substrate-level intervention to restore glutathione status in aging."
                    },
                    {
                        citationId: "kumar_2021_pilot_rct",
                        title: "Glycine and N-acetylcysteine (GlyNAC) supplementation in older adults improves glutathione deficiency, oxidative stress, mitochondrial dysfunction, inflammation, insulin resistance, endothelial dysfunction, genotoxicity, muscle strength, and cognition: Results of a pilot clinical trial.",
                        authors: ["Kumar P", "Liu C", "Hsu JW", "Chacko S", "Minard C", "Jahoor F", "Sekhar RV"],
                        year: 2021,
                        journal: "Clinical and Translational Medicine",
                        doi: "10.1002/ctm2.372",
                        pmid: "33783984",
                        studyType: "Open-label pilot clinical trial",
                        evidenceLevel: "Level 3",
                        sampleSize: "n=8 older adults + n=8 young controls",
                        duration: "24 weeks GlyNAC + 12 weeks washout",
                        findings: "GlyNAC supplementation in older adults for 24 weeks corrected red-blood-cell glutathione deficiency, lowered oxidative stress markers, and improved mitochondrial function, inflammation, endothelial function, insulin resistance, genomic damage, cognition, strength and gait speed. Benefits declined after 12 weeks of withdrawal, supporting a substrate-driven mechanism. Caveat: this trial uses the GlyNAC combination, not pure glycine \u2014 the glycine contribution is mechanistically inferred.",
                        methodology: "Open-label 36-week design with serial RBC-GSH, mitochondrial fuel oxidation and functional measures."
                    }
                ]
            },
            {
                mechanism: "NMDA co-agonist activity (glycine site)",
                strength: "Strong",
                mechanismType: "Receptor co-agonism / glutamatergic signaling",
                tissueTarget: "Central nervous system (NMDA receptor-expressing neurons)",
                target: "Central nervous system (NMDA receptor-expressing neurons)",
                evidence: [
                    {
                        citationId: "file_1999_bioglycin",
                        title: "Beneficial effects of glycine (bioglycin) on memory and attention in young and middle-aged adults.",
                        authors: ["File SE", "Fluck E", "Fernandes C"],
                        year: 1999,
                        journal: "Journal of Clinical Psychopharmacology",
                        doi: "10.1097/00004714-199912000-00004",
                        pmid: "10587285",
                        studyType: "Double-blind randomized crossover trial",
                        evidenceLevel: "Level 2",
                        studyDesign: "Double-blind, randomized, crossover comparison of Bioglycin (a biologically active form of glycine) vs placebo in healthy young (mean age 20.7 yrs) and middle-aged men (mean age 58.9 yrs).",
                        findings: "The N-methyl-D-aspartate receptor complex is involved in long-term potentiation, the biological basis of learning and memory, and is modulated through the strychnine-insensitive glycine receptor coagonist site. Bioglycin significantly improved retrieval from episodic memory in both young and middle-aged groups; middle-aged men also benefited on a sustained-attention task. Effects differed from typical cognitive enhancers in being non-stimulant and primarily memory-rather-than-attention-focused.",
                        methodology: "Standard cognitive battery: episodic memory, focused/divided/sustained attention, mood ratings.",
                        clinicalRelevance: "Provides mechanistic plausibility for glycine in conditions with NMDA hypofunction (schizophrenia, dementia, sleep-disrupted cognition)."
                    }
                ]
            },
            {
                mechanism: "Collagen synthesis substrate (33% of collagen sequence)",
                strength: "Strong",
                mechanismType: "Structural protein biosynthesis",
                tissueTarget: "Connective tissue (skin, tendon, cartilage, bone matrix, vascular wall)",
                target: "Connective tissue (skin, tendon, cartilage, bone matrix, vascular wall)",
                evidence: [
                    {
                        citationId: "dunstan_2017_amino_acids",
                        title: "Diverse characteristics of the urinary excretion of amino acids in humans and the use of amino acid supplementation to reduce fatigue and sub-health in adults.",
                        authors: ["Dunstan RH", "Sparkes DL", "Macdonald MM", "De Jonge XJ", "Dascombe BJ", "Gottfries J", "Gottfries CG", "Roberts TK"],
                        year: 2017,
                        journal: "Nutrition Journal",
                        doi: "10.1186/s12937-017-0240-y",
                        pmid: "28330481",
                        studyType: "Two-stage observational + clinical trial (ACTRN12611000403932)",
                        evidenceLevel: "Level 3",
                        findings: "Glycine, alongside histidine, is one of the most abundantly excreted amino acids in human urine and is required for synthesis of haemoglobin and collagen. Higher urinary loss of glycine and histidine identifies a phenotype with measurable functional symptoms (fatigue, sub-health). Provision of an amino-acid supplement improved reported fatigue and sleep in 81% of the trial cohort.",
                        methodology: "Stage 1 cross-sectional GC-MS urinary amino acid profiling (n=151); Stage 2 30-day amino-acid supplementation trial (n=37).",
                        clinicalRelevance: "Quantifies the substrate-loss problem that motivates dietary glycine supplementation in the context of collagen synthesis demand."
                    }
                ]
            }
        ],

        benefits: [
            {
                healthDomain: "Sleep Quality",
                specificClaim: "3 g of oral glycine before bedtime improves subjective sleep quality in individuals with insomniac tendencies and reduces next-day fatigue and improves psychomotor performance after sleep restriction.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Multiple small trials from the Bannai/Ajinomoto research program with consistent direction",
                tissueTarget: "Suprachiasmatic nucleus and core body temperature regulation",
                target: "Suprachiasmatic nucleus and core body temperature regulation",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "bannai_2012_jps_review",
                        title: "New therapeutic strategy for amino acid medicine: glycine improves the quality of sleep.",
                        authors: ["Bannai M", "Kawai N"],
                        year: 2012,
                        journal: "Journal of Pharmacological Sciences",
                        doi: "10.1254/jphs.11r04fm",
                        pmid: "22293292",
                        studyType: "Authoritative narrative review of program of human and rat trials",
                        evidenceLevel: "Level 5",
                        findings: "Glycine ingestion before bedtime significantly ameliorated subjective sleep quality in individuals with insomniac tendencies. Oral glycine in rats induced significant increases in plasma and CSF glycine concentrations and a significant decrease in core body temperature associated with increased cutaneous blood flow \u2014 a plausible mechanism since sleep onset involves a drop in core body temperature. The review summarises both rat-pharmacological and human-trial data from the Ajinomoto program.",
                        methodology: "Narrative synthesis of human RCTs and rat mechanism studies."
                    },
                    {
                        citationId: "bannai_2012_daytime",
                        title: "The effects of glycine on subjective daytime performance in partially sleep-restricted healthy volunteers.",
                        authors: ["Bannai M", "Kawai N", "Ono K", "Nakahara K", "Murakami N"],
                        year: 2012,
                        journal: "Frontiers in Neurology",
                        doi: "10.3389/fneur.2012.00061",
                        pmid: "22529837",
                        studyType: "Placebo-controlled human trial + companion rat mechanism studies",
                        evidenceLevel: "Level 2",
                        sampleSize: "Healthy volunteers under 25% sleep-restriction protocol",
                        duration: "3 consecutive sleep-restricted nights",
                        dosage: "3 g of glycine vs placebo before bedtime",
                        primaryOutcome: "Daytime sleepiness, fatigue (VAS), and PC-based psychomotor performance.",
                        results: {
                            primaryEndpoint: {
                                outcome: "Daytime sleepiness/fatigue + psychomotor vigilance",
                                effectSize: "Significant reduction in fatigue and a tendency to reduced sleepiness on VAS; significant improvement in psychomotor vigilance test",
                                pValue: "Reported significant in primary VAS and PC-PVT outcomes",
                                clinicalSignificance: "Glycine improves the daytime functional consequences of sleep restriction in healthy volunteers."
                            }
                        },
                        findings: "Three nights of 25%-sleep-restriction with 3 g pre-bed glycine vs placebo: glycine significantly reduced daytime fatigue (VAS) and improved psychomotor vigilance test performance. Companion rat work showed glycine modulated arginine vasopressin and vasoactive intestinal polypeptide in the suprachiasmatic nucleus during the light period without altering core melatonin or clock-gene expression \u2014 a non-circadian SCN-modulation mechanism.",
                        methodology: "Crossover design with VAS sleepiness/fatigue scales and computerised psychomotor vigilance test; rat IHC for SCN neuropeptides.",
                        clinicalRelevance: "Establishes 3 g pre-bed as the canonical human glycine sleep dose and provides the SCN-neuropeptide modulation mechanism."
                    },
                    {
                        citationId: "uneyama_2017_aa_review",
                        title: "New Functions and Potential Applications of Amino Acids.",
                        authors: ["Uneyama H", "Kobayashi H", "Tonouchi N"],
                        year: 2017,
                        journal: "Advances in Biochemical Engineering / Biotechnology",
                        doi: "10.1007/10_2016_35",
                        pmid: "27872968",
                        studyType: "Industry/academic narrative review",
                        evidenceLevel: "Level 5",
                        findings: "Reaffirms that glycine ingestion before bedtime significantly improved subjective sleep quality in human trials \u2014 placing the glycine sleep finding within a broader review of clinically applicable amino-acid functions including alanine + glutamine for alcohol metabolism and cystine + theanine for cold prevention."
                    }
                ]
            },
            {
                healthDomain: "Memory Enhancement",
                specificClaim: "Bioglycin (a biologically active glycine) improved episodic memory retrieval in healthy young and middle-aged adults and sustained attention in middle-aged men.",
                strength: "Preliminary",
                evidenceQuality: "Moderate",
                replicationStatus: "Single 1999 crossover trial; not yet replicated in larger contemporary cohorts",
                tissueTarget: "Hippocampal NMDA receptor system",
                target: "Hippocampal NMDA receptor system",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "file_1999_bioglycin",
                        title: "Beneficial effects of glycine (bioglycin) on memory and attention in young and middle-aged adults.",
                        authors: ["File SE", "Fluck E", "Fernandes C"],
                        year: 1999,
                        journal: "Journal of Clinical Psychopharmacology",
                        doi: "10.1097/00004714-199912000-00004",
                        pmid: "10587285",
                        studyType: "Double-blind randomized crossover trial",
                        evidenceLevel: "Level 2",
                        findings: "Bioglycin significantly improved retrieval from episodic memory in both young (mean 20.7 yrs) and middle-aged (mean 58.9 yrs) groups; middle-aged men also benefited on a sustained-attention task. Bioglycin had no stimulant properties and no significant mood effects, distinguishing it from typical cognitive enhancers \u2014 it primarily improves memory rather than attention.",
                        methodology: "Double-blind crossover with validated cognitive battery."
                    }
                ]
            },
            {
                healthDomain: "Sleep Quality",
                specificClaim: "A multi-ingredient blend containing glycine plus tryptophan, magnesium, tart cherry powder and L-theanine reduced sleep onset latency and increased total sleep time in a controlled deception trial.",
                strength: "Preliminary",
                evidenceQuality: "Moderate",
                replicationStatus: "Single combination-supplement RCT \u2014 cannot isolate glycine effect",
                tissueTarget: "Sleep / wake regulation",
                target: "Sleep / wake regulation",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "langan_evans_2023_blend",
                        title: "Nutritional Modulation of Sleep Latency, Duration, and Efficiency: A Randomized, Repeated-Measures, Double-Blind Deception Study.",
                        authors: ["Langan-Evans C", "Hearris MA", "Gallagher C", "Long S", "Thomas C", "Moss AD", "Cheung W", "Howatson G", "Morton JP"],
                        year: 2023,
                        journal: "Medicine and Science in Sports and Exercise",
                        doi: "10.1249/MSS.0000000000003040",
                        pmid: "36094342",
                        studyType: "Randomized, repeated-measures, double-blind deception RCT",
                        evidenceLevel: "Level 2",
                        sampleSize: "n=16 (9 male, 7 female; age 24\u00b13 yr)",
                        duration: "3-day familiarisation + 3-day intervention and 3-day placebo",
                        primaryOutcome: "Sleep onset latency, total sleep time, sleep efficiency, morning sleepiness.",
                        results: {
                            primaryEndpoint: {
                                outcome: "Sleep architecture and morning sleepiness",
                                effectSize: "Sleep onset latency \u221224\u00b125 min (p=0.002); total sleep time +22\u00b132 min (p=0.01); sleep efficiency +2.4\u00b13.9% (p=0.03); reduced morning sleepiness (p=0.02)",
                                pValue: "p=0.002 to p=0.03",
                                clinicalSignificance: "Clinically meaningful sleep-onset and duration improvements; cannot attribute specifically to the glycine component since the blend includes tryptophan, magnesium, tart cherry and L-theanine."
                            }
                        },
                        findings: "A blend of tryptophan, glycine, magnesium, tart cherry powder and L-theanine reduced sleep onset latency, increased total sleep time and increased sleep efficiency, while also reducing morning sleepiness. Targeted metabolomics highlighted altered 6-sulfatoxymelatonin, D-serine and L-glutamic acid pathways. The glycine contribution to the observed effects cannot be isolated from other ingredients.",
                        methodology: "Crossover deception design with 75% successful blinding; subjective and actigraphy outcomes plus urinary metabolomics.",
                        limitations: ["Combination supplement \u2014 cannot isolate glycine effect", "Healthy young adults only", "Free-living rather than laboratory-controlled"]
                    }
                ]
            },
            {
                healthDomain: "Longevity",
                specificClaim: "Combined glycine + N-acetylcysteine (GlyNAC) supplementation in older adults restores glutathione, reverses multiple aging hallmarks, and improves muscle strength, cognition and physical function in a randomized clinical trial.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "GlyNAC program: pilot open-label (Kumar 2021) + randomized placebo-controlled trial (Kumar 2023) + companion HIV cohort (Kumar 2020) + mouse lifespan + brain studies",
                tissueTarget: "Whole-body aging hallmarks",
                target: "Whole-body aging hallmarks",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "kumar_2023_glynac_rct",
                        title: "Supplementing Glycine and N-Acetylcysteine (GlyNAC) in Older Adults Improves Glutathione Deficiency, Oxidative Stress, Mitochondrial Dysfunction, Inflammation, Physical Function, and Aging Hallmarks: A Randomized Clinical Trial.",
                        authors: ["Kumar P", "Liu C", "Suliburk J", "Hsu JW", "Muthupillai R", "Jahoor F", "Minard CG", "Taffet GE", "Sekhar RV"],
                        year: 2023,
                        journal: "Journal of Gerontology A: Biological Sciences and Medical Sciences",
                        doi: "10.1093/gerona/glac135",
                        pmid: "35975308",
                        studyType: "Placebo-controlled randomized clinical trial (NCT01870193)",
                        evidenceLevel: "Level 2",
                        sampleSize: "n=24 older adults randomized (12 GlyNAC, 12 isonitrogenous alanine placebo) + 12 young controls",
                        duration: "16 weeks",
                        demographics: "Older adults vs young adult controls.",
                        primaryOutcome: "Glutathione, oxidative stress, mitochondrial fuel oxidation, aging hallmarks, physical function, body composition.",
                        results: {
                            primaryEndpoint: {
                                outcome: "Multi-domain aging biomarkers",
                                effectSize: "GlyNAC corrected GSH deficiency, oxidative stress, mitochondrial dysfunction, inflammation, endothelial dysfunction, insulin resistance, multiple aging hallmarks; improved gait speed, muscle strength, 6-minute walk; reduced waist circumference and systolic BP. Placebo arm did not improve.",
                                pValue: "Reported significant on multiple primary domain endpoints",
                                clinicalSignificance: "First randomized placebo-controlled trial of a precursor-strategy supplement to demonstrate broad reversal of aging hallmarks in older adults."
                            }
                        },
                        findings: "16 weeks of GlyNAC vs alanine-placebo in older adults (n=24) corrected glutathione deficiency, lowered oxidative stress, restored mitochondrial fuel oxidation, decreased inflammation, improved endothelial function, lowered insulin resistance, reduced multiple aging hallmarks, and improved gait speed, strength, walking distance, body composition and systolic blood pressure. GlyNAC was safe and well-tolerated.",
                        methodology: "Placebo-controlled randomized design with isonitrogenous alanine control; serial GSH, mitochondrial respirometry, aging-hallmark biomarkers, functional testing.",
                        limitations: [
                            "Cannot isolate glycine vs NAC contributions",
                            "Single-centre Baylor study",
                            "Sample size modest (12 vs 12)"
                        ],
                        clinicalRelevance: "Strongest geriatric-aging RCT for the precursor strategy; the glycine half is positioned as a substrate-level intervention to relieve a rate-limiting step in GSH synthesis."
                    },
                    {
                        citationId: "kumar_2022_lifespan_mouse",
                        title: "GlyNAC (Glycine and N-Acetylcysteine) Supplementation in Mice Increases Length of Life by Correcting Glutathione Deficiency, Oxidative Stress, Mitochondrial Dysfunction, Abnormalities in Mitophagy and Nutrient Sensing, and Genomic Damage.",
                        authors: ["Kumar P", "Osahon OW", "Sekhar RV"],
                        year: 2022,
                        journal: "Nutrients",
                        doi: "10.3390/nu14051114",
                        pmid: "35268089",
                        studyType: "Preclinical mouse lifespan study",
                        evidenceLevel: "Level 4",
                        findings: "C57BL/6J mice receiving GlyNAC supplementation lived 24% longer than control mice and showed corrected glutathione synthesis, lowered oxidative stress, improved mitochondrial function, normalised mitophagy and nutrient-sensing, and reduced genomic damage in heart, liver and kidneys. Provides preclinical proof-of-concept that the precursor strategy extends mammalian lifespan.",
                        methodology: "Lifespan analysis with end-of-life tissue biomarkers."
                    },
                    {
                        citationId: "kumar_2020_glynac_hiv",
                        title: "Supplementing Glycine and N-acetylcysteine (GlyNAC) in Aging HIV Patients Improves Oxidative Stress, Mitochondrial Dysfunction, Inflammation, Endothelial Dysfunction, Insulin Resistance, Genotoxicity, Strength, and Cognition: Results of an Open-Label Clinical Trial.",
                        authors: ["Kumar P", "Liu C", "Suliburk JW", "Minard CG", "Muthupillai R", "Chacko S", "Hsu JW", "Jahoor F", "Sekhar RV"],
                        year: 2020,
                        journal: "Biomedicines",
                        doi: "10.3390/biomedicines8100390",
                        pmid: "33007928",
                        studyType: "Open-label clinical trial in PWH (people with HIV)",
                        evidenceLevel: "Level 3",
                        sampleSize: "n=8 HIV patients + n=8 uninfected controls",
                        duration: "12 weeks GlyNAC + 8 weeks washout",
                        findings: "PWH had multiple defects suggestive of premature aging at baseline (glutathione deficiency, mitochondrial dysfunction, inflammation, insulin resistance, cognitive and physical decline). GlyNAC supplementation for 12 weeks improved all measured outcomes; benefits receded after withdrawal. Supports the substrate-driven mechanism of the precursor strategy."
                    },
                    {
                        citationId: "kumar_2023_brain",
                        title: "GlyNAC (Glycine and N-Acetylcysteine) Supplementation in Old Mice Improves Brain Glutathione Deficiency, Oxidative Stress, Glucose Uptake, Mitochondrial Dysfunction, Genomic Damage, Inflammation and Neurotrophic Factors to Reverse Age-Associated Cognitive Decline: Implications for Improving Brain Health in Aging.",
                        authors: ["Kumar P", "Osahon OW", "Sekhar RV"],
                        year: 2023,
                        journal: "Antioxidants (Basel)",
                        doi: "10.3390/antiox12051042",
                        pmid: "37237908",
                        studyType: "Preclinical aged-mouse cognitive study",
                        evidenceLevel: "Level 4",
                        findings: "Old (90-week) C57BL/6J mice supplemented with GlyNAC for 8 weeks showed corrected brain glutathione deficiency, reduced oxidative stress, improved glucose uptake, mitochondrial function, autophagy/mitophagy, lowered inflammation, reduced genomic damage, restored neurotrophic factors, and reversed age-associated cognitive decline."
                    }
                ]
            }
        ],

        safety: [
            {
                safetyAspect: "General tolerability and clinical safety",
                claim: "Glycine has an excellent safety profile across decades of dietary, pharmacological and clinical-trial use; the GlyNAC precursor combination has been documented as safe and well-tolerated in placebo-controlled trials in older adults.",
                riskLevel: "Low",
                target: "Multiple organ systems",
                tissueTarget: "Multiple organ systems",
                evidence: [
                    {
                        citationId: "kumar_2023_glynac_rct",
                        title: "Supplementing Glycine and N-Acetylcysteine (GlyNAC) in Older Adults Improves Glutathione Deficiency, Oxidative Stress, Mitochondrial Dysfunction, Inflammation, Physical Function, and Aging Hallmarks: A Randomized Clinical Trial.",
                        authors: ["Kumar P", "Liu C", "Suliburk J", "Hsu JW", "Muthupillai R", "Jahoor F", "Minard CG", "Taffet GE", "Sekhar RV"],
                        year: 2023,
                        journal: "Journal of Gerontology A: Biological Sciences and Medical Sciences",
                        doi: "10.1093/gerona/glac135",
                        pmid: "35975308",
                        studyType: "Placebo-controlled randomized clinical trial",
                        evidenceLevel: "Level 2",
                        findings: "16 weeks of GlyNAC supplementation in older adults was safe and well-tolerated, with no serious adverse events attributable to supplementation. Establishes a robust safety record for combined glycine + NAC at the trial-validated dose."
                    },
                    {
                        citationId: "bannai_2012_jps_review",
                        title: "New therapeutic strategy for amino acid medicine: glycine improves the quality of sleep.",
                        authors: ["Bannai M", "Kawai N"],
                        year: 2012,
                        journal: "Journal of Pharmacological Sciences",
                        doi: "10.1254/jphs.11r04fm",
                        pmid: "22293292",
                        studyType: "Authoritative narrative review",
                        evidenceLevel: "Level 5",
                        findings: "Across decades of human glycine ingestion (3 g pre-bed and higher dietary intakes) no clinically significant adverse events have been reported. Glycine is a non-essential amino acid with widespread dietary exposure (gelatin, collagen-rich foods) and a long-established benign tolerability profile."
                    }
                ]
            }
        ],

        dosage: [
            {
                dosageRange: "Sleep: 3 g oral glycine 30\u201360 minutes pre-bed (canonical Bannai dose). Glutathione/longevity (precursor strategy): 0.1 g/kg/day glycine + 0.1 g/kg/day NAC in the GlyNAC trials. Collagen / general health: 2\u201310 g/day with vitamin C.",
                claim: "The most validated single-supplement dose is 3 g pre-bed for sleep (Bannai 2012). Higher doses (10\u201330 g/day) used in the GlyNAC longevity protocol are paired with NAC and tested only in research contexts.",
                evidenceBase: "Partially established",
                target: "Plasma and CSF glycine concentrations",
                tissueTarget: "Plasma and CSF glycine concentrations",
                evidence: [
                    {
                        citationId: "bannai_2012_daytime",
                        title: "The effects of glycine on subjective daytime performance in partially sleep-restricted healthy volunteers.",
                        authors: ["Bannai M", "Kawai N", "Ono K", "Nakahara K", "Murakami N"],
                        year: 2012,
                        journal: "Frontiers in Neurology",
                        doi: "10.3389/fneur.2012.00061",
                        pmid: "22529837",
                        studyType: "Placebo-controlled human trial + rat mechanism",
                        evidenceLevel: "Level 2",
                        findings: "Establishes 3 g of oral glycine before bedtime as the canonical sleep-supplementation dose, demonstrably reducing daytime fatigue and improving psychomotor vigilance in sleep-restricted volunteers."
                    },
                    {
                        citationId: "kumar_2023_glynac_rct",
                        title: "Supplementing Glycine and N-Acetylcysteine (GlyNAC) in Older Adults Improves Glutathione Deficiency, Oxidative Stress, Mitochondrial Dysfunction, Inflammation, Physical Function, and Aging Hallmarks: A Randomized Clinical Trial.",
                        authors: ["Kumar P", "Liu C", "Suliburk J", "Hsu JW", "Muthupillai R", "Jahoor F", "Minard CG", "Taffet GE", "Sekhar RV"],
                        year: 2023,
                        journal: "Journal of Gerontology A: Biological Sciences and Medical Sciences",
                        doi: "10.1093/gerona/glac135",
                        pmid: "35975308",
                        studyType: "Placebo-controlled randomized clinical trial",
                        evidenceLevel: "Level 2",
                        findings: "Geriatric GlyNAC dosing in this RCT used the Sekhar lab's standard 0.1 g/kg/day each of glycine and N-acetylcysteine \u2014 in a 70 kg adult, this corresponds to roughly 7 g/day of glycine alongside 7 g/day of NAC, well above the 3 g pre-bed sleep dose and consistent with substrate-saturating amino-acid pharmacology."
                    }
                ]
            }
        ]
    }
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[118] = glycineEnhanced;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = glycineEnhanced;
}
