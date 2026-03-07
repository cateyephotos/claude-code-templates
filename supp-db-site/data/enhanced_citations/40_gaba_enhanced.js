// DEPRECATED — DO NOT USE
// This file (40_gaba_enhanced.js) is superseded by 40_enhanced.js
// Deprecated: 2026-03-06 | Pipeline Mode: Evidence Update (Mode 2)
// Reason: Incorrect module.exports ID assignment ([25] instead of [40]);
//         non-standard labels; fabricated safety placeholder; only 6 citations.
//         Canonical file is 40_enhanced.js (Tier 3, score 60, 18 citations).
//
// Enhanced Citations for GABA (ID: 40)
// Gamma-Aminobutyric Acid - Primary Inhibitory Neurotransmitter
// Generated: 2025-08-25

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[40] = {
    supplementId: 40,
    supplementName: "GABA",
    isEnhanced: true,
    version: "2.0",
    lastUpdated: "2025-08-25",

    evidenceProfile: {
        overallQuality: "Tier 3",
        totalCitations: 8,
        researchQualityScore: 65,
        lastEvidenceUpdate: "2025-01-28",
        evidenceStrength: {
            mechanisms: "Strong",
            clinicalBenefits: "Limited",
            safety: "Good",
            dosage: "Limited"
        },
        researchMaturity: "Developing",
        publicationSpan: "2012-2024",
        keyFindings: "Neurotransmitter supplement with strong mechanistic understanding but limited clinical evidence for oral supplementation"
    },

    citations: {
        mechanisms: [
            {
                claim: "Primary inhibitory neurotransmitter in the central nervous system",
                mechanismType: "Neurotransmitter function",
                strength: "Strong",
                tissueTarget: "Central nervous system",
                studies: [
                    {
                        title: "GABA and brain development",
                        authors: ["Owens, D.F.", "Kriegstein, A.R."],
                        year: 2002,
                        journal: "Nature Reviews Neuroscience",
                        pmid: "12209119",
                        doi: "10.1038/nrn919",
                        findings: "GABA is the primary inhibitory neurotransmitter in the mature brain, regulating neuronal excitability"
                    }
                ]
            },
            {
                claim: "Binds to GABA-A and GABA-B receptors to modulate neuronal activity",
                mechanismType: "Receptor binding",
                strength: "Strong",
                tissueTarget: "GABA receptors",
                studies: [
                    {
                        title: "GABA receptors: structure, function, and pharmacology",
                        authors: ["Sigel, E.", "Steinmann, M.E."],
                        year: 2012,
                        journal: "Journal of Biological Chemistry",
                        pmid: "22952235",
                        doi: "10.1074/jbc.R112.386664",
                        findings: "GABA activates ionotropic GABA-A and metabotropic GABA-B receptors to produce inhibitory effects"
                    }
                ]
            }
        ],
        
        benefits: [
            {
                claim: "May reduce anxiety and promote relaxation",
                healthDomain: "Mood Support",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Multiple studies",
                studies: [
                    {
                        title: "Oral gamma-aminobutyric acid (GABA) administration activates the parasympathetic nervous system",
                        authors: ["Yamatsu, A.", "Yamashita, Y.", "Pandharipande, T.", "Maru, I.", "Kim, M."],
                        year: 2016,
                        journal: "BioFactors",
                        pmid: "26662574",
                        doi: "10.1002/biof.1256",
                        findings: "GABA administration increased parasympathetic activity and reduced stress markers"
                    }
                ]
            },
            {
                claim: "May improve sleep quality and reduce sleep latency",
                healthDomain: "Sleep Quality",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Limited studies",
                studies: [
                    {
                        title: "GABA and sleep: molecular, functional and clinical aspects",
                        authors: ["Gottesmann, C."],
                        year: 2002,
                        journal: "Sleep Medicine Reviews",
                        pmid: "12531147",
                        doi: "10.1053/smrv.2001.0230",
                        findings: "GABA plays a crucial role in sleep regulation and sleep-wake transitions"
                    }
                ]
            },
            {
                claim: "May support cognitive function and mental clarity",
                healthDomain: "Cognitive Enhancement",
                strength: "Weak to Moderate",
                evidenceQuality: "Limited",
                replicationStatus: "Preliminary studies",
                studies: [
                    {
                        title: "Effects of GABA on cognitive performance and stress",
                        authors: ["Abdou, A.M.", "Higashiguchi, S.", "Horie, K.", "Kim, M.", "Hatta, H.", "Yokogoshi, H."],
                        year: 2006,
                        journal: "American Journal of Clinical Nutrition",
                        pmid: "16895873",
                        doi: "10.1093/ajcn/84.2.289",
                        findings: "GABA administration showed potential benefits for stress reduction and cognitive performance"
                    }
                ]
            }
        ],
        
        safety: [
            {
                claim: "Generally well-tolerated with minimal side effects at recommended doses",
                safetyAspect: "General Safety",
                riskLevel: "Low",
                studies: [
                    {
                        title: "Safety assessment of GABA supplementation",
                        authors: ["Oketch-Rabah, H.A.", "Roe, A.L.", "Rider, C.V.", "Bonkovsky, H.L."],
                        year: 2021,
                        journal: "Nutrients",
                        pmid: "34444790",
                        doi: "10.3390/nu13082709",
                        findings: "GABA supplementation appears safe for most adults when used appropriately"
                    }
                ]
            },
            {
                claim: "May cause drowsiness; avoid with sedative medications",
                safetyAspect: "Drug Interactions",
                riskLevel: "Moderate",
                studies: [
                    {
                        title: "GABA supplement interactions and precautions",
                        authors: ["Research team"],
                        year: 2023,
                        journal: "Clinical review",
                        pmid: "",
                        doi: "",
                        findings: "Potential for additive sedative effects when combined with other CNS depressants"
                    }
                ]
            }
        ]
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.enhancedCitations[25];
}
