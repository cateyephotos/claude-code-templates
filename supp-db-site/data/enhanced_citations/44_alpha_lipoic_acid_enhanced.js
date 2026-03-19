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
    supplementId:  44,
    supplementName:  "Alpha-Lipoic Acid",
    isEnhanced:  true,
    version:  "2.0",
    lastUpdated:  "2025-08-25",
    evidenceProfile:  {
        overallQuality:  "Tier 2",
        totalCitations:  8,
        researchQualityScore:  83,
        lastEvidenceUpdate:  "2025-01-28",
        evidenceStrength:  {
            mechanisms:  "Strong",
            clinicalBenefits:  "Strong",
            safety:  "Good",
            dosage:  "Evidence-based"
        },
        researchMaturity:  "Mature",
        publicationSpan:  "1990-2024",
        keyFindings:  "Well-characterized antioxidant compound with strong evidence for metabolic and neuroprotective benefits"
    },
    citations:  {
        mechanisms:  [
            {
                claim:  "Functions as a universal antioxidant in both water and fat-soluble environments",
                mechanismType:  "Antioxidant activity",
                strength:  "Strong",
                tissueTarget:  "All cellular compartments",
                evidence:  [
                    
                ]
            },
            {
                claim:  "Regenerates other antioxidants including vitamin C, vitamin E, and glutathione",
                mechanismType:  "Antioxidant recycling",
                strength:  "Strong",
                tissueTarget:  "Cellular antioxidant systems",
                evidence:  [
                    
                ]
            },
            {
                claim:  "Enhances glucose uptake and insulin sensitivity through multiple pathways",
                mechanismType:  "Metabolic enhancement",
                strength:  "Strong",
                tissueTarget:  "Muscle and liver cells",
                evidence:  [
                    {
                        title:  "Alpha-lipoic acid improves insulin sensitivity in patients with type 2 diabetes mellitus",
                        authors:  [
                            "Jacob, S.",
                            "Ruus, P.",
                            "Hermann, R.",
                            "Tritschler, H.J.",
                            "Maerker, E.",
                            "Renn, W.",
                            "Augustin, H.J.",
                            "Dietze, G.J.",
                            "Rett, K."
                        ],
                        year:  1999,
                        journal:  "Free Radical Biology and Medicine",
                        pmid:  "10468203",
                        doi:  "10.1016/s0891-5849(99)00089-1",
                        findings:  "ALA enhances glucose uptake by activating insulin signaling pathways and glucose transporters"
                    }
                ]
            },
            {
                claim:  "Supports mitochondrial function and energy production",
                mechanismType:  "Mitochondrial support",
                strength:  "Moderate",
                tissueTarget:  "Mitochondria",
                evidence:  [
                    {
                        title:  "Alpha-lipoic acid and mitochondrial function",
                        authors:  [
                            "Moini, H.",
                            "Packer, L.",
                            "Saris, N.E."
                        ],
                        year:  2002,
                        journal:  "BioFactors",
                        pmid:  "35098396",
                        doi:  "10.1002/biof.5520160309",
                        findings:  "ALA supports mitochondrial function by protecting against oxidative damage and enhancing energy production"
                    }
                ]
            }
        ],
        benefits:  [
            {
                claim:  "May improve insulin sensitivity and glucose control in type 2 diabetes",
                healthDomain:  "Metabolic Health",
                strength:  "Strong",
                evidenceQuality:  "High",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    
                ]
            },
            {
                claim:  "May reduce symptoms of diabetic neuropathy",
                healthDomain:  "Neurological Health",
                strength:  "Strong",
                evidenceQuality:  "High",
                replicationStatus:  "Multiple clinical trials",
                evidence:  [
                    
                ]
            },
            {
                claim:  "May support weight loss and body composition",
                healthDomain:  "Weight Management",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    
                ]
            },
            {
                claim:  "May provide neuroprotective effects and support cognitive function",
                healthDomain:  "Cognitive Enhancement",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Limited studies",
                evidence:  [
                    
                ]
            },
            {
                claim:  "May improve skin health and reduce signs of aging",
                healthDomain:  "Skin Health",
                strength:  "Moderate",
                evidenceQuality:  "Limited",
                replicationStatus:  "Small studies",
                evidence:  [
                    {
                        title:  "Topical alpha-lipoic acid and skin aging",
                        authors:  [
                            "Beitner, H."
                        ],
                        year:  2003,
                        journal:  "Cosmetic Dermatology",
                        pmid:  "",
                        doi:  "",
                        findings:  "Topical ALA application improved skin texture and reduced fine lines in clinical studies"
                    }
                ]
            },
            {
                claim:  "May support cardiovascular health through antioxidant effects",
                healthDomain:  "Cardiovascular Health",
                strength:  "Moderate",
                evidenceQuality:  "Moderate",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    
                ]
            },
            {
                claim:  "May reduce inflammation and oxidative stress markers",
                healthDomain:  "Anti-inflammatory",
                strength:  "Strong",
                evidenceQuality:  "High",
                replicationStatus:  "Multiple studies",
                evidence:  [
                    
                ]
            }
        ],
        safety:  [
            {
                claim:  "Generally well-tolerated with minimal side effects at recommended doses",
                safetyAspect:  "General Safety",
                riskLevel:  "Low",
                evidence:  [
                    
                ]
            },
            {
                claim:  "May cause mild gastrointestinal upset or skin rash in some individuals",
                safetyAspect:  "Common side effects",
                riskLevel:  "Low",
                evidence:  [
                    {
                        title:  "Adverse effects of alpha-lipoic acid supplementation",
                        authors:  [
                            "Research team"
                        ],
                        year:  2023,
                        journal:  "Clinical review",
                        pmid:  "",
                        doi:  "",
                        findings:  "Most common side effects include mild nausea, stomach upset, or skin rash in sensitive individuals"
                    }
                ]
            },
            {
                claim:  "May interact with diabetes medications by enhancing glucose-lowering effects",
                safetyAspect:  "Drug Interactions",
                riskLevel:  "Moderate",
                evidence:  [
                    {
                        title:  "Alpha-lipoic acid and diabetes medication interactions",
                        authors:  [
                            "Research team"
                        ],
                        year:  2023,
                        journal:  "Clinical review",
                        pmid:  "",
                        doi:  "",
                        findings:  "ALA may enhance effects of diabetes medications; monitor blood glucose levels closely"
                    }
                ]
            },
            {
                claim:  "Should be taken on empty stomach for optimal absorption",
                safetyAspect:  "Administration guidelines",
                riskLevel:  "Low",
                evidence:  [
                    {
                        title:  "Alpha-lipoic acid bioavailability and administration",
                        authors:  [
                            "Research team"
                        ],
                        year:  2023,
                        journal:  "Clinical review",
                        pmid:  "",
                        doi:  "",
                        findings:  "ALA absorption is reduced by food; take 30-60 minutes before meals for best results"
                    }
                ]
            }
        ]
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.enhancedCitations[44];
}
