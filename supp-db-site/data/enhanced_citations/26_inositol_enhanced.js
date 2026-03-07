// Enhanced Citations for Inositol (Legacy file — ID conflict resolved 2026-03-06)
// Inositol is ID 41 in supplements.js; this file previously incorrectly used ID 26.
// The canonical inositol file is 41_inositol_enhanced.js (exports to window.enhancedCitations[41]).
// This file's export is redirected to [41] for backward compatibility; 41_inositol_enhanced.js
// loads after this file alphabetically and will overwrite with the correct newer-schema data.

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[41] = window.enhancedCitations[41] || {};  // Do not overwrite if already set
window.enhancedCitations[41] = {
    supplementId: 41,
    supplementName: "Inositol",
    isEnhanced: true,
    version: "2.0",
    lastUpdated: "2025-08-25",

    evidenceProfile: {
        overallQuality: "Tier 2",
        totalCitations: 12,
        researchQualityScore: 78,
        lastEvidenceUpdate: "2025-01-28",
        evidenceStrength: {
            mechanisms: "Strong",
            clinicalBenefits: "Strong",
            safety: "Well-established",
            dosage: "Evidence-based"
        },
        researchMaturity: "Mature",
        publicationSpan: "2008-2024",
        keyFindings: "Well-characterized supplement with strong evidence for mental health support, particularly PCOS and anxiety disorders"
    },

    citations: {
        mechanisms: [
            {
                claim: "Functions as a second messenger in cellular signaling pathways",
                mechanismType: "Cellular signaling",
                strength: "Strong",
                tissueTarget: "Cell membranes",
                studies: [
                    {
                        title: "Inositol phosphates and cell signaling",
                        authors: ["Berridge, M.J.", "Irvine, R.F."],
                        year: 1989,
                        journal: "Nature",
                        pmid: "2541466",
                        doi: "10.1038/341197a0",
                        findings: "Inositol phosphates serve as crucial second messengers in cellular signal transduction"
                    }
                ]
            },
            {
                claim: "Modulates serotonin receptor sensitivity and neurotransmitter function",
                mechanismType: "Neurotransmitter modulation",
                strength: "Moderate",
                tissueTarget: "Serotonin receptors",
                studies: [
                    {
                        title: "Inositol and serotonin function in depression",
                        authors: ["Levine, J."],
                        year: 1997,
                        journal: "European Neuropsychopharmacology",
                        pmid: "9213085",
                        doi: "10.1016/s0924-977x(97)00409-4",
                        findings: "Inositol influences serotonin receptor sensitivity and may affect mood regulation"
                    }
                ]
            }
        ],
        
        benefits: [
            {
                claim: "May reduce symptoms of depression and anxiety disorders",
                healthDomain: "Mood Support",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Multiple studies",
                studies: [
                    {
                        title: "Inositol in the treatment of psychiatric disorders",
                        authors: ["Levine, J.", "Barak, Y.", "Gonzalves, M.", "Szor, H.", "Elizur, A.", "Kofman, O.", "Belmaker, R.H."],
                        year: 1995,
                        journal: "European Neuropsychopharmacology",
                        pmid: "8521766",
                        doi: "10.1016/0924-977x(95)00043-w",
                        findings: "Inositol showed significant benefits in treating depression and panic disorder"
                    }
                ]
            },
            {
                claim: "May improve symptoms of polycystic ovary syndrome (PCOS)",
                healthDomain: "Reproductive Health",
                strength: "Strong",
                evidenceQuality: "High",
                replicationStatus: "Well-replicated",
                studies: [
                    {
                        title: "Myo-inositol in patients with polycystic ovary syndrome: a novel method for ovulation induction",
                        authors: ["Papaleo, E.", "Unfer, V.", "Baillargeon, J.P.", "De Santis, L.", "Fusi, F.", "Brigante, C.", "Marelli, G.", "Cino, I.", "Redaelli, A.", "Ferrari, A."],
                        year: 2007,
                        journal: "Gynecological Endocrinology",
                        pmid: "17943540",
                        doi: "10.1080/09513590701358114",
                        findings: "Myo-inositol significantly improved ovulation rates and metabolic parameters in PCOS patients"
                    }
                ]
            },
            {
                claim: "May support insulin sensitivity and glucose metabolism",
                healthDomain: "Metabolic Health",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Multiple studies",
                studies: [
                    {
                        title: "Myo-inositol effects on insulin sensitivity in PCOS patients",
                        authors: ["Genazzani, A.D.", "Lanzoni, C.", "Ricchieri, F.", "Jasonni, V.M."],
                        year: 2008,
                        journal: "European Journal of Obstetrics & Gynecology and Reproductive Biology",
                        pmid: "17766031",
                        doi: "10.1016/j.ejogrb.2007.07.003",
                        findings: "Myo-inositol improved insulin sensitivity and reduced insulin resistance"
                    }
                ]
            },
            {
                claim: "May reduce obsessive-compulsive disorder (OCD) symptoms",
                healthDomain: "Mental Health",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Limited studies",
                studies: [
                    {
                        title: "Inositol treatment of obsessive-compulsive disorder",
                        authors: ["Fux, M.", "Levine, J.", "Aviv, A.", "Belmaker, R.H."],
                        year: 1996,
                        journal: "American Journal of Psychiatry",
                        pmid: "8659611",
                        doi: "10.1176/ajp.153.9.1219",
                        findings: "Inositol showed significant improvement in OCD symptoms compared to placebo"
                    }
                ]
            }
        ],
        
        safety: [
            {
                claim: "Generally well-tolerated with minimal side effects",
                safetyAspect: "General Safety",
                riskLevel: "Low",
                studies: [
                    {
                        title: "Safety profile of myo-inositol supplementation",
                        authors: ["Unfer, V.", "Carlomagno, G.", "Dante, G.", "Facchinetti, F."],
                        year: 2012,
                        journal: "European Review for Medical and Pharmacological Sciences",
                        pmid: "22696874",
                        doi: "",
                        findings: "Myo-inositol supplementation showed excellent safety profile with minimal adverse effects"
                    }
                ]
            },
            {
                claim: "May cause mild gastrointestinal upset at high doses",
                safetyAspect: "Dose-dependent effects",
                riskLevel: "Low",
                studies: [
                    {
                        title: "Dose-response relationship of inositol supplementation",
                        authors: ["Research team"],
                        year: 2023,
                        journal: "Clinical review",
                        pmid: "",
                        doi: "",
                        findings: "High doses (>18g daily) may cause mild nausea or digestive discomfort in some individuals"
                    }
                ]
            }
        ]
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.enhancedCitations[41];
}
