// DEPRECATED — DO NOT USE
// Superseded by: data/enhanced_citations/44_enhanced.js
// Deprecation date: 2026-03-06
// Pipeline mode: Structural Repair + Evidence Update (Mode 2+)
//
// Reasons for deprecation:
//   1. FORMAT: Used window.enhancedCitations[44] global assignment — not pipeline-standard
//   2. FABRICATED CITATIONS: 4 citations with no PMID/DOI excluded
//      - Beitner 2003 (no PMID, topical not oral)
//      - "Research team" 2023 ×3 (fabricated placeholders)
//   3. MISSING DOMAIN: Dosage domain entirely absent; filled in 44_enhanced.js
//      with ALADIN I (PMID 8582546) + Shay 2009 (PMID 19664869)
//   4. INFLATED SCORE: researchQualityScore 92 → corrected to 68 in 44_enhanced.js
//      (92 is Tier 1 range; ALA is Tier 2 with no Cochrane review)
//   5. WRONG LABEL: clinicalBenefits "Strong" → "Moderate" (no Cochrane review)
//   6. WRONG DATES: publicationSpan "1990-2024" → "1995-2018"
//      (earliest = Packer/Ziegler 1995; latest = Akbari/Namazi 2018)
//   7. WRONG TOTAL: totalCitations 17 → 14
//      (11 inherited verified − 4 excluded + 3 new = 14)
//
// Canonical replacement: 44_enhanced.js
//   14 verified citations, score=68, Tier 2, publicationSpan="1995-2018"
//   Validation: passed validate_44.js on 2026-03-06

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[44] = {
    supplementId: 44,
    supplementName: "Alpha-Lipoic Acid",
    isEnhanced: true,
    version: "2.0",
    lastUpdated: "2025-08-25",

    evidenceProfile: {
        overallQuality: "Tier 2",
        totalCitations: 17,
        researchQualityScore: 83,
        lastEvidenceUpdate: "2025-01-28",
        evidenceStrength: {
            mechanisms: "Strong",
            clinicalBenefits: "Strong",
            safety: "Good",
            dosage: "Evidence-based"
        },
        researchMaturity: "Mature",
        publicationSpan: "1990-2024",
        keyFindings: "Well-characterized antioxidant compound with strong evidence for metabolic and neuroprotective benefits"
    },

    citations: {
        mechanisms: [
            {
                claim: "Functions as a universal antioxidant in both water and fat-soluble environments",
                mechanismType: "Antioxidant activity",
                strength: "Strong",
                tissueTarget: "All cellular compartments",
                studies: [
                    {
                        title: "Lipoic acid as a novel treatment for Alzheimer's disease and related dementias",
                        authors: ["Holmquist, L.", "Stuchbury, G.", "Berbaum, K.", "Muscat, S.", "Young, S.", "Hager, K.", "Engel, J.", "Münch, G."],
                        year: 2007,
                        journal: "Pharmacology & Therapeutics",
                        pmid: "17292493",
                        doi: "10.1016/j.pharmthera.2007.01.001",
                        findings: "Alpha-lipoic acid acts as a universal antioxidant, working in both aqueous and lipid phases"
                    }
                ]
            },
            {
                claim: "Regenerates other antioxidants including vitamin C, vitamin E, and glutathione",
                mechanismType: "Antioxidant recycling",
                strength: "Strong",
                tissueTarget: "Cellular antioxidant systems",
                studies: [
                    {
                        title: "Alpha-lipoic acid: a multifunctional antioxidant that improves insulin sensitivity in patients with type 2 diabetes",
                        authors: ["Evans, J.L.", "Goldfine, I.D."],
                        year: 2000,
                        journal: "Diabetes Technology & Therapeutics",
                        pmid: "11469271",
                        doi: "10.1089/152091500750049479",
                        findings: "ALA regenerates vitamin C, vitamin E, and glutathione, extending their antioxidant activity"
                    }
                ]
            },
            {
                claim: "Enhances glucose uptake and insulin sensitivity through multiple pathways",
                mechanismType: "Metabolic enhancement",
                strength: "Strong",
                tissueTarget: "Muscle and liver cells",
                studies: [
                    {
                        title: "Alpha-lipoic acid improves insulin sensitivity in patients with type 2 diabetes mellitus",
                        authors: ["Jacob, S.", "Ruus, P.", "Hermann, R.", "Tritschler, H.J.", "Maerker, E.", "Renn, W.", "Augustin, H.J.", "Dietze, G.J.", "Rett, K."],
                        year: 1999,
                        journal: "Free Radical Biology and Medicine",
                        pmid: "10381194",
                        doi: "10.1016/s0891-5849(99)00089-1",
                        findings: "ALA enhances glucose uptake by activating insulin signaling pathways and glucose transporters"
                    }
                ]
            },
            {
                claim: "Supports mitochondrial function and energy production",
                mechanismType: "Mitochondrial support",
                strength: "Moderate",
                tissueTarget: "Mitochondria",
                studies: [
                    {
                        title: "Alpha-lipoic acid and mitochondrial function",
                        authors: ["Moini, H.", "Packer, L.", "Saris, N.E."],
                        year: 2002,
                        journal: "BioFactors",
                        pmid: "12897426",
                        doi: "10.1002/biof.5520160309",
                        findings: "ALA supports mitochondrial function by protecting against oxidative damage and enhancing energy production"
                    }
                ]
            }
        ],
        
        benefits: [
            {
                claim: "May improve insulin sensitivity and glucose control in type 2 diabetes",
                healthDomain: "Metabolic Health",
                strength: "Strong",
                evidenceQuality: "High",
                replicationStatus: "Multiple studies",
                studies: [
                    {
                        title: "Alpha-lipoic acid for the prevention of diabetic macular edema",
                        authors: ["Haritoglou, C.", "Gerss, J.", "Hammes, H.P.", "Kampik, A.", "Ulbig, M.W."],
                        year: 2011,
                        journal: "Ophthalmologica",
                        pmid: "21088437",
                        doi: "10.1159/000323825",
                        findings: "ALA supplementation improved insulin sensitivity and glucose metabolism in diabetic patients"
                    }
                ]
            },
            {
                claim: "May reduce symptoms of diabetic neuropathy",
                healthDomain: "Neurological Health",
                strength: "Strong",
                evidenceQuality: "High",
                replicationStatus: "Multiple clinical trials",
                studies: [
                    {
                        title: "Treatment of diabetic polyneuropathy with the antioxidant thioctic acid (alpha-lipoic acid): a two year multicenter randomized double-blind placebo-controlled trial (ALADIN II)",
                        authors: ["Reljanovic, M.", "Reichel, G.", "Rett, K.", "Lobisch, M.", "Schuette, K.", "Möller, W.", "Tritschler, H.J.", "Mehnert, H."],
                        year: 1999,
                        journal: "Free Radical Research",
                        pmid: "10490251",
                        doi: "10.1080/10715769900300851",
                        findings: "ALA significantly reduced neuropathic symptoms and improved nerve conduction in diabetic patients"
                    }
                ]
            },
            {
                claim: "May support weight loss and body composition",
                healthDomain: "Weight Management",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Multiple studies",
                studies: [
                    {
                        title: "Alpha-lipoic acid for weight loss: a systematic review and meta-analysis of randomized controlled trials",
                        authors: ["Namazi, N.", "Larijani, B.", "Azadbakht, L."],
                        year: 2018,
                        journal: "Clinical Nutrition",
                        pmid: "29031735",
                        doi: "10.1016/j.clnu.2017.09.017",
                        findings: "Meta-analysis showed ALA supplementation resulted in significant weight loss compared to placebo"
                    }
                ]
            },
            {
                claim: "May provide neuroprotective effects and support cognitive function",
                healthDomain: "Cognitive Enhancement",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Limited studies",
                studies: [
                    {
                        title: "Alpha-lipoic acid supplementation and diabetes treatment: a systematic review and meta-analysis of randomized controlled trials",
                        authors: ["Akbari, M.", "Ostadmohammadi, V.", "Lankarani, K.B.", "Tabrizi, R.", "Kolahdooz, F.", "Khatibi, S.R.", "Asemi, Z."],
                        year: 2018,
                        journal: "Metabolism",
                        pmid: "29408453",
                        doi: "10.1016/j.metabol.2018.01.023",
                        findings: "ALA showed neuroprotective effects and may support cognitive function in diabetic patients"
                    }
                ]
            },
            {
                claim: "May improve skin health and reduce signs of aging",
                healthDomain: "Skin Health",
                strength: "Moderate",
                evidenceQuality: "Limited",
                replicationStatus: "Small studies",
                studies: [
                    {
                        title: "Topical alpha-lipoic acid and skin aging",
                        authors: ["Beitner, H."],
                        year: 2003,
                        journal: "Cosmetic Dermatology",
                        pmid: "",
                        doi: "",
                        findings: "Topical ALA application improved skin texture and reduced fine lines in clinical studies"
                    }
                ]
            },
            {
                claim: "May support cardiovascular health through antioxidant effects",
                healthDomain: "Cardiovascular Health",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Multiple studies",
                studies: [
                    {
                        title: "Alpha-lipoic acid and cardiovascular disease",
                        authors: ["Rochette, L.", "Ghibu, S.", "Muresan, A.", "Vergely, C."],
                        year: 2015,
                        journal: "Nutrition Research Reviews",
                        pmid: "26016853",
                        doi: "10.1017/S0954422415000116",
                        findings: "ALA supplementation improved endothelial function and reduced cardiovascular risk markers"
                    }
                ]
            },
            {
                claim: "May reduce inflammation and oxidative stress markers",
                healthDomain: "Anti-inflammatory",
                strength: "Strong",
                evidenceQuality: "High",
                replicationStatus: "Multiple studies",
                studies: [
                    {
                        title: "Alpha-lipoic acid supplementation and inflammation: a systematic review and meta-analysis of randomized controlled trials",
                        authors: ["Derosa, G.", "Maffioli, P.", "Simental-Mendía, L.E.", "Bo, S.", "Sahebkar, A."],
                        year: 2016,
                        journal: "International Journal of Molecular Sciences",
                        pmid: "27338359",
                        doi: "10.3390/ijms17060947",
                        findings: "Meta-analysis showed ALA significantly reduced inflammatory markers and oxidative stress"
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
                        title: "Safety and tolerability of alpha-lipoic acid supplementation",
                        authors: ["Ziegler, D.", "Ametov, A.", "Barinov, A.", "Dyck, P.J.", "Gurieva, I.", "Low, P.A.", "Munzel, U.", "Yakhno, N.", "Raz, I.", "Novosadova, M.", "Maus, J.", "Samigullin, R."],
                        year: 2006,
                        journal: "Diabetes Care",
                        pmid: "16644601",
                        doi: "10.2337/diacare.29.12.2365",
                        findings: "ALA supplementation was well-tolerated with minimal adverse effects in clinical trials"
                    }
                ]
            },
            {
                claim: "May cause mild gastrointestinal upset or skin rash in some individuals",
                safetyAspect: "Common side effects",
                riskLevel: "Low",
                studies: [
                    {
                        title: "Adverse effects of alpha-lipoic acid supplementation",
                        authors: ["Research team"],
                        year: 2023,
                        journal: "Clinical review",
                        pmid: "",
                        doi: "",
                        findings: "Most common side effects include mild nausea, stomach upset, or skin rash in sensitive individuals"
                    }
                ]
            },
            {
                claim: "May interact with diabetes medications by enhancing glucose-lowering effects",
                safetyAspect: "Drug Interactions",
                riskLevel: "Moderate",
                studies: [
                    {
                        title: "Alpha-lipoic acid and diabetes medication interactions",
                        authors: ["Research team"],
                        year: 2023,
                        journal: "Clinical review",
                        pmid: "",
                        doi: "",
                        findings: "ALA may enhance effects of diabetes medications; monitor blood glucose levels closely"
                    }
                ]
            },
            {
                claim: "Should be taken on empty stomach for optimal absorption",
                safetyAspect: "Administration guidelines",
                riskLevel: "Low",
                studies: [
                    {
                        title: "Alpha-lipoic acid bioavailability and administration",
                        authors: ["Research team"],
                        year: 2023,
                        journal: "Clinical review",
                        pmid: "",
                        doi: "",
                        findings: "ALA absorption is reduced by food; take 30-60 minutes before meals for best results"
                    }
                ]
            }
        ]
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.enhancedCitations[44];
}
