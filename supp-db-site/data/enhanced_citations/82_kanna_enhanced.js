// Enhanced Citations for Kanna (ID: 82)
// Research focus: Serotonin reuptake inhibition, PDE4 inhibition, mood enhancement, cognitive function
// Evidence Profile: Tier 3 - Limited but promising evidence from small human RCTs
// Sources: PubMed verified citations with DOIs

const kannaEnhanced = {
    id: 82,
    name: "Kanna",
    scientificName: "Sceletium tortuosum",
    category: "Mood & Cognitive Support",
    lastUpdated: "2025-07-15",

    evidenceProfile: {
        tier: 3,
        totalCitations: 11,
        researchQualityScore: 38,
        overallEvidence: "Limited but promising evidence from small human RCTs in healthy volunteers. Dual 5-HT reuptake and PDE4 inhibition well-characterized. No studies in clinical populations with diagnosed depression or anxiety disorders. Good 3-month safety data at 25mg.",
        strengthOfEvidence: {
            mechanisms: "Moderate",
            clinicalBenefits: "Limited",
            safety: "Moderate",
            dosage: "Moderate"
        }
    },

    citations: {
        mechanisms: [
            {
                healthDomain: "Neurotransmitter Modulation",
                specificClaim: "Dual 5-HT reuptake and PDE4 inhibition in human brain demonstrated by fMRI",
                claim: "Zembrin (standardized S. tortuosum extract) acts as dual 5-HT reuptake and PDE4 inhibitor, attenuating amygdala reactivity to threat stimuli and reducing amygdala-hypothalamus coupling",
                strength: "Moderate",
                evidenceQuality: "RCT with neuroimaging",
                replicationStatus: "Single study, consistent with pharmacological profile",
                tissueTarget: "Amygdala, hypothalamus, threat neurocircuitry",
                target: "5-HT transporter, PDE4",
                evidence: [
                    {
                        title: "Acute effects of Sceletium tortuosum (Zembrin), a dual 5-HT reuptake and PDE4 inhibitor, in the human amygdala and its connection to the hypothalamus",
                        authors: "Terburg D, Syal S, Rosenberger LA, Heany S, Phillips N, Gericke N, Stein DJ, van Honk J",
                        journal: "Neuropsychopharmacology",
                        year: 2013,
                        pmid: "23903032",
                        doi: "10.1038/npp.2013.183",
                        studyType: "Randomized Controlled Trial (pharmaco-fMRI)",
                        sampleSize: 16,
                        duration: "Single dose (25mg)",
                        keyFindings: [
                            "Single 25mg Zembrin dose attenuated amygdala reactivity to fearful faces under low perceptual load conditions",
                            "Reduced amygdala-hypothalamus coupling during emotion-matching task",
                            "Double-blind, placebo-controlled, cross-over design in healthy participants",
                            "First demonstration of S. tortuosum attenuating threat circuitry in human brain"
                        ],
                        effectSize: "Significant attenuation of amygdala reactivity (p < 0.05)",
                        pValue: "< 0.05",
                        confidenceInterval: "Not reported"
                    }
                ]
            },
            {
                healthDomain: "Alkaloid Pharmacology",
                specificClaim: "Mesembrine is the primary anxiolytic alkaloid; antidepressant effects require alkaloid synergy",
                claim: "Of all S. tortuosum alkaloids tested, only mesembrine contributed significantly to anxiolytic effects. No single alkaloid reproduced the antidepressant-like activity of the whole extract, suggesting synergistic mechanisms",
                strength: "Moderate",
                evidenceQuality: "Zebrafish model with dose-response and alkaloid fractionation",
                replicationStatus: "Single comprehensive study",
                tissueTarget: "Central nervous system",
                target: "Serotonin transporter, PDE4, multiple neurotransmitter systems",
                evidence: [
                    {
                        title: "Sceletium tortuosum-derived mesembrine significantly contributes to the anxiolytic effect of Zembrin, but its anti-depressant effect may require synergy of multiple plant constituents",
                        authors: "Gericke J, Harvey BH, Pretorius L, Ollewagen T, Benecke RM, Smith C",
                        journal: "Journal of Ethnopharmacology",
                        year: 2023,
                        pmid: "37660956",
                        doi: "10.1016/j.jep.2023.117113",
                        studyType: "Preclinical (zebrafish light-dark transition test)",
                        sampleSize: "n=12 per treatment group",
                        duration: "1h and 24h exposure",
                        keyFindings: [
                            "Zembrin 12.5 mcg/mL was optimal anxiolytic concentration, significantly decreasing locomotor activity (P=0.05)",
                            "Only mesembrine at equivalent concentrations showed significant anxiolytic effects (P<0.05)",
                            "Zembrin 25 mcg/mL reversed reserpine-induced depression-like behavior (P<0.05)",
                            "No individual alkaloid alone reproduced the antidepressant effect - synergy required",
                            "500 mcg/mL was toxic threshold (24h exposure)"
                        ],
                        effectSize: "Significant anxiolytic effect at 12.5 mcg/mL",
                        pValue: "0.05 (anxiolytic); <0.05 (antidepressant)",
                        confidenceInterval: "Not reported"
                    }
                ]
            },
            {
                healthDomain: "Neuroprotection",
                specificClaim: "Network pharmacology identifies multi-target neuroprotective mechanisms relevant to neurodegenerative disorders",
                claim: "S. tortuosum extracts inhibit AChE, MAO-B, and NMDAR, with mesembrine alkaloids showing binding affinity for targets relevant to Alzheimer's and Parkinson's disease",
                strength: "Preliminary",
                evidenceQuality: "In vitro assays with computational network pharmacology",
                replicationStatus: "Single study",
                tissueTarget: "Central nervous system, cholinergic and dopaminergic pathways",
                target: "AChE, MAO-B, NMDAR, adenosine A2A receptor",
                evidence: [
                    {
                        title: "A network pharmacology-based approach to explore the therapeutic potential of Sceletium tortuosum in the treatment of neurodegenerative disorders",
                        authors: "Luo Y, Shan L, Xu L, Patnala S, Kanfer I, Li J, Yu P, Jun X",
                        journal: "PLoS One",
                        year: 2022,
                        pmid: "36006974",
                        doi: "10.1371/journal.pone.0273583",
                        studyType: "In vitro + computational (network pharmacology)",
                        sampleSize: "In vitro enzyme assays",
                        duration: "N/A",
                        keyFindings: [
                            "SCT sub-fractions scavenged DPPH radicals and inhibited AChE and MAO-B",
                            "Key targets identified: AChE, MAO-B, NMDAR GluN2B, adenosine A2A receptor, CB2",
                            "N-trans-feruloyl-3-methyldopamine, dihydrojoubertiamine, and mesembrine alkaloids as key active constituents",
                            "Multiple mechanisms support therapeutic potential for Alzheimer's and Parkinson's disease"
                        ],
                        effectSize: "Significant enzyme inhibition (in vitro)",
                        pValue: "Not reported (in vitro/computational study)",
                        confidenceInterval: "N/A"
                    }
                ]
            }
        ],

        benefits: [
            {
                healthDomain: "Anxiety",
                specificClaim: "Single dose anxiolytic effect in experimentally induced anxiety",
                claim: "Single 25mg dose of Zembrin (S. tortuosum extract) ameliorates laboratory stress/anxiety responding in healthy young volunteers",
                strength: "Limited",
                evidenceQuality: "Small double-blind RCT",
                replicationStatus: "Consistent across two sub-studies; replicated by Terburg 2013 fMRI findings",
                tissueTarget: "Central nervous system, autonomic nervous system",
                target: "5-HT transporter, PDE4, heart rate",
                evidence: [
                    {
                        title: "Sceletium tortuosum (Zembrin) ameliorates experimentally induced anxiety in healthy volunteers",
                        authors: "Reay J, Wetherell MA, Morton E, Lillis J, Badmaev V",
                        journal: "Human Psychopharmacology",
                        year: 2020,
                        pmid: "32761980",
                        doi: "10.1002/hup.2753",
                        studyType: "Randomized Controlled Trial",
                        sampleSize: 20,
                        duration: "Single dose (25mg)",
                        keyFindings: [
                            "Subjective anxiety levels significantly lower in Zembrin group at pre-stress induction point (study 2)",
                            "Significant interaction between treatment and time on heart rate",
                            "Simulated public speaking task used as anxiety provocation in study 2",
                            "Multitasking framework used in study 1 (no significant treatment effect)",
                            "First tentative behavioral evidence supporting anxiolytic properties"
                        ],
                        effectSize: "Significant reduction in subjective anxiety and heart rate reactivity",
                        pValue: "< 0.05 for anxiety and HR interaction",
                        confidenceInterval: "Not reported"
                    }
                ]
            },
            {
                healthDomain: "Cognitive Function",
                specificClaim: "Improved cognitive flexibility and executive function in cognitively healthy subjects",
                claim: "25mg daily Zembrin for 3 weeks significantly improved cognitive set flexibility and executive function in cognitively healthy adults, with implications for early Alzheimer's prevention via PDE4-cAMP-CREB cascade",
                strength: "Limited",
                evidenceQuality: "Small proof-of-concept crossover RCT",
                replicationStatus: "Single study; partially supported by Hoffman 2020 reactive cognition findings",
                tissueTarget: "Prefrontal cortex, executive function networks",
                target: "PDE4-cAMP-CREB cascade",
                evidence: [
                    {
                        title: "Proof-of-Concept Randomized Controlled Study of Cognition Effects of the Proprietary Extract Sceletium tortuosum (Zembrin) Targeting Phosphodiesterase-4 in Cognitively Healthy Subjects: Implications for Alzheimer's Dementia",
                        authors: "Chiu S, Gericke N, Farina-Woodbury M, Badmaev V, Raheb H, Terpstra K, Antongiorgi J, Bureau Y, Cernovsky Z, Hou J, Sanchez V, Williams M, Copen J, Husni M, Goble L",
                        journal: "Evidence-Based Complementary and Alternative Medicine",
                        year: 2014,
                        pmid: "25389443",
                        doi: "10.1155/2014/682014",
                        studyType: "Randomized Controlled Trial (crossover)",
                        sampleSize: 21,
                        duration: "3 weeks per treatment period",
                        keyFindings: [
                            "25mg Zembrin significantly improved cognitive set flexibility (P < 0.032)",
                            "Significantly improved executive function (P < 0.022)",
                            "Mean age 54.6 years - relevant to age-related cognitive decline prevention",
                            "Positive changes in mood and sleep also observed",
                            "Well-tolerated with no significant adverse events",
                            "Registered clinical trial (NCT01805518)"
                        ],
                        effectSize: "Significant improvement in cognitive flexibility and executive function",
                        pValue: "0.032 (cognitive flexibility), 0.022 (executive function)",
                        confidenceInterval: "Not reported"
                    },
                    {
                        title: "Ergogenic Effects of 8 Days of Sceletium Tortuosum Supplementation on Mood, Visual Tracking, and Reaction in Recreationally Trained Men and Women",
                        authors: "Hoffman JR, Markus I, Dubnov-Raz G, Gepner Y",
                        journal: "Journal of Strength and Conditioning Research",
                        year: 2020,
                        pmid: "32740286",
                        doi: "10.1519/JSC.0000000000003693",
                        studyType: "Randomized Controlled Trial",
                        sampleSize: 60,
                        duration: "8 days (25mg daily)",
                        keyFindings: [
                            "Significant improvements in complex reactive performance requiring cognitive load vs placebo",
                            "60 recreationally trained adults aged 20-35 (48 men, 12 women)",
                            "No significant changes in mood (VAS or POMS) in this young healthy population",
                            "No differences in simple reaction assessments",
                            "Ergogenic benefit specific to cognitively demanding reactive tasks"
                        ],
                        effectSize: "Significant improvement in complex reactive performance (p < 0.05)",
                        pValue: "< 0.05",
                        confidenceInterval: "Not reported"
                    }
                ]
            }
        ],

        safety: [
            {
                healthDomain: "Tolerability",
                specificClaim: "Well-tolerated at 8mg and 25mg daily for 3 months in healthy adults",
                claim: "Both 8mg and 25mg daily doses of standardized S. tortuosum extract (Zembrin) were well-tolerated over 3 months with no clinically significant changes in vital signs, ECG, or laboratory parameters",
                strength: "Moderate",
                evidenceQuality: "3-month randomized double-blind placebo-controlled safety trial",
                replicationStatus: "Consistent safety across multiple smaller studies",
                evidence: [
                    {
                        title: "A randomized, double-blind, parallel-group, placebo-controlled trial of Extract Sceletium tortuosum (Zembrin) in healthy adults",
                        authors: "Nell H, Siebert M, Chellan P, Gericke N",
                        journal: "Journal of Alternative and Complementary Medicine",
                        year: 2013,
                        pmid: "23441963",
                        doi: "10.1089/acm.2012.0185",
                        studyType: "Randomized Controlled Trial (safety)",
                        sampleSize: 37,
                        duration: "3 months",
                        keyFindings: [
                            "No apparent differences between treatment and placebo in vital signs, 12-lead ECG, body weight",
                            "No significant changes in hematology or biochemistry parameters",
                            "Most common AE was headache, more frequent in placebo group",
                            "Abdominal pain and upper respiratory infections also more common in placebo",
                            "Some participants noted improved coping with stress and sleep in diaries",
                            "Both 8mg and 25mg doses well-tolerated"
                        ],
                        effectSize: "No clinically significant safety signals at either dose",
                        pValue: "Not applicable (safety study)",
                        confidenceInterval: "N/A"
                    }
                ]
            },
            {
                healthDomain: "Drug Interactions & Toxicology",
                specificClaim: "Theoretical serotonergic interaction risk and moderate acute toxicity profile from computational modeling",
                claim: "Due to serotonin reuptake inhibition, concurrent use with SSRIs or other serotonergic drugs is a theoretical safety concern. In silico toxicological assessment predicts moderate acute toxicity (LD50 340-370 mg/kg in rats) and non-mutagenic status, with potential respiratory and renal concerns at elevated doses",
                strength: "Theoretical/Computational",
                evidenceQuality: "In silico prediction plus pharmacological inference",
                replicationStatus: "Multi-platform computational consensus",
                evidence: [
                    {
                        title: "First toxicity profile prediction for mesembrine - archetypal psychoactive Sceletium alkaloid: prediction of key toxicological endpoints important to clinical and forensic toxicology using a multi-faceted in silico approach",
                        authors: "Niznik L, Jurowski K",
                        journal: "Chemico-Biological Interactions",
                        year: 2025,
                        pmid: "40651754",
                        doi: "10.1016/j.cbi.2025.111648",
                        studyType: "In silico toxicological assessment",
                        sampleSize: "Computational (8 prediction platforms)",
                        duration: "N/A",
                        keyFindings: [
                            "Estimated oral LD50 in rats: 340-370 mg/kg (GHS Category 4 - moderate toxicity)",
                            "Consistently predicted as non-mutagenic (Ames test)",
                            "High probability of adverse respiratory and renal effects at elevated concentrations",
                            "Low-to-moderate probability of hERG channel inhibition (potential cardiotoxicity)",
                            "Conflicting predictions for hepatotoxicity across platforms",
                            "Clinical doses (25mg) are far below toxic thresholds"
                        ],
                        effectSize: "LD50 340-370 mg/kg (moderate acute toxicity)",
                        pValue: "N/A (computational study)",
                        confidenceInterval: "N/A"
                    },
                    {
                        title: "Sceletium tortuosum: A review on its phytochemistry, pharmacokinetics, biological and clinical activities",
                        authors: "Olatunji TL, Siebert F, Adetunji AE, Harvey BH, Gericke J, Hamman JH, Van der Kooy F",
                        journal: "Journal of Ethnopharmacology",
                        year: 2021,
                        pmid: "34333104",
                        doi: "10.1016/j.jep.2021.114476",
                        studyType: "Comprehensive Review",
                        sampleSize: "Review of all published studies",
                        duration: "N/A",
                        keyFindings: [
                            "25 alkaloids identified in 4 structural classes (mesembrine class predominant)",
                            "Wide spectrum of biological activities including antimalarial, antioxidant, neuroprotective",
                            "Has not yet been studied in a clinical population with diagnosed conditions",
                            "Supports traditional use as mood-elevator and anxiolytic",
                            "Caution advised with concurrent serotonergic medications"
                        ],
                        effectSize: "N/A (review)",
                        pValue: "N/A",
                        confidenceInterval: "N/A"
                    }
                ]
            }
        ],

        dosage: [
            {
                healthDomain: "Standardized Extract Dosing",
                specificClaim: "25mg Zembrin daily is the most-studied effective dose for anxiolytic and cognitive benefits",
                claim: "25mg daily of standardized S. tortuosum extract (Zembrin) is the dose used in most clinical trials showing cognitive and anxiolytic benefits, with 3-month safety established at both 8mg and 25mg",
                strength: "Moderate",
                evidenceQuality: "Multiple RCTs at 25mg dose",
                replicationStatus: "Consistent effective dose across 4 independent clinical studies",
                evidence: [
                    {
                        title: "Proof-of-Concept Randomized Controlled Study of Cognition Effects of the Proprietary Extract Sceletium tortuosum (Zembrin) Targeting Phosphodiesterase-4 in Cognitively Healthy Subjects: Implications for Alzheimer's Dementia",
                        authors: "Chiu S, Gericke N, Farina-Woodbury M, Badmaev V, Raheb H, Terpstra K, Antongiorgi J, Bureau Y, Cernovsky Z, Hou J, Sanchez V, Williams M, Copen J, Husni M, Goble L",
                        journal: "Evidence-Based Complementary and Alternative Medicine",
                        year: 2014,
                        pmid: "25389443",
                        doi: "10.1155/2014/682014",
                        studyType: "Randomized Controlled Trial (crossover)",
                        sampleSize: 21,
                        duration: "3 weeks at 25mg daily",
                        keyFindings: [
                            "25mg Zembrin once daily for 3 weeks: improved cognitive flexibility (P<0.032) and executive function (P<0.022)",
                            "Positive mood and sleep changes noted at this dose",
                            "Well-tolerated throughout study period"
                        ],
                        effectSize: "Cognitive benefits at 25mg/day",
                        pValue: "0.032 (cognitive flexibility), 0.022 (executive function)",
                        confidenceInterval: "Not reported"
                    },
                    {
                        title: "A randomized, double-blind, parallel-group, placebo-controlled trial of Extract Sceletium tortuosum (Zembrin) in healthy adults",
                        authors: "Nell H, Siebert M, Chellan P, Gericke N",
                        journal: "Journal of Alternative and Complementary Medicine",
                        year: 2013,
                        pmid: "23441963",
                        doi: "10.1089/acm.2012.0185",
                        studyType: "Randomized Controlled Trial (safety)",
                        sampleSize: 37,
                        duration: "3 months at 8mg or 25mg daily",
                        keyFindings: [
                            "Both 8mg and 25mg daily doses well-tolerated over 3 months",
                            "No clinically significant changes in any safety parameter at either dose",
                            "25mg is the most commonly used clinical dose based on efficacy data",
                            "Unsolicited positive effects on stress coping and sleep at therapeutic doses"
                        ],
                        effectSize: "Safe at 8-25mg/day for 3 months",
                        pValue: "N/A (safety endpoints)",
                        confidenceInterval: "N/A"
                    }
                ]
            }
        ]
    }
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[82] = kannaEnhanced;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = kannaEnhanced;
}
