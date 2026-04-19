// Enhanced Citations for Calcium Alpha-Ketoglutarate (Ca-AKG) — ID 115
// Research focus: Longevity, biological-age reduction, TCA-cycle metabolism,
//                 epigenetic regulation via alpha-KG-dependent dioxygenases
// Evidence Profile: Tier 3 — Emerging human evidence + strong preclinical base
// All 7 PMIDs PubMed-verified and DOIs CrossRef-verified on 2026-04-19.

const calciumAlphaKetoglutarateEnhanced = {
    id: 115,
    name: "Calcium Alpha-Ketoglutarate",
    scientificName: "Calcium 2-oxopentanedioate (Ca-AKG)",
    category: "Metabolic Support",
    commonNames: ["Ca-AKG", "Calcium \u03b1-Ketoglutarate", "Alpha-Ketoglutarate", "AKG", "2-Oxoglutarate"],
    lastUpdated: "2026-04-19",

    evidenceProfile: {
        overallQuality: "Tier 3",
        totalCitations: 7,
        researchQualityScore: 58,
        lastEvidenceUpdate: "2026-04-19",
        evidenceStrength: {
            mechanisms: "Strong",
            clinicalBenefits: "Preliminary",
            safety: "Limited",
            dosage: "Unclear"
        },
        researchMaturity: "Emerging",
        publicationSpan: "2014-2025"
    },

    citations: {
        mechanisms: [
            {
                mechanism: "ATP synthase inhibition and TOR pathway downregulation",
                strength: "Strong",
                mechanismType: "Energy metabolism / nutrient sensing",
                tissueTarget: "Mitochondria and whole-organism metabolism",
                target: "Mitochondria and whole-organism metabolism",
                evidence: [
                    {
                        citationId: "chin_2014_tor",
                        title: "The metabolite \u03b1-ketoglutarate extends lifespan by inhibiting ATP synthase and TOR.",
                        authors: ["Chin RM", "Fu X", "Pai MY"],
                        year: 2014,
                        journal: "Nature",
                        doi: "10.1038/nature13264",
                        pmid: "24828042",
                        studyType: "Mechanistic (C. elegans + mammalian cells)",
                        evidenceLevel: "Level 4",
                        studyDesign: "Genetic and biochemical screening in C. elegans complemented by mammalian-cell biochemistry",
                        findings: "Alpha-ketoglutarate directly binds and inhibits ATP synthase subunit beta (ATP5B), decreasing ATP production and TOR signaling downstream. In C. elegans this extended median lifespan; the mechanism was conserved in mammalian cells.",
                        methodology: "Affinity-pulldown identification of ATP5B as the KG target, followed by ATP synthase activity assays, TOR pathway phospho-readouts, and lifespan assays in C. elegans.",
                        clinicalRelevance: "Provides a molecular explanation linking AKG to canonical longevity pathways (TOR, AMPK-adjacent) previously established in caloric-restriction and rapamycin studies."
                    }
                ]
            },
            {
                mechanism: "Histone demethylation regulation via \u03b1-KG-dependent dioxygenases",
                strength: "Strong",
                mechanismType: "Epigenetic / enzymatic cofactor",
                tissueTarget: "Bone marrow mesenchymal stromal cells (and by extension other \u03b1-KG-dependent demethylase-expressing tissues)",
                target: "Bone marrow mesenchymal stromal cells (and by extension other \u03b1-KG-dependent demethylase-expressing tissues)",
                evidence: [
                    {
                        citationId: "wang_2020_histone",
                        title: "Alpha-ketoglutarate ameliorates age-related osteoporosis via regulating histone methylations.",
                        authors: ["Wang Y", "Deng P", "Liu Y"],
                        year: 2020,
                        journal: "Nature Communications",
                        doi: "10.1038/s41467-020-19360-1",
                        pmid: "33154378",
                        studyType: "Preclinical (aged mice + MSC biology)",
                        evidenceLevel: "Level 4",
                        studyDesign: "Aged-mouse intervention with AKG administration + in vitro MSC differentiation assays",
                        findings: "AKG supplementation increased bone mass and attenuated osteoporotic phenotype in aged mice. Mechanistically, AKG acted as a cofactor for Jumonji-family histone demethylases (KDM4A/4B and KDM6A/6B), lowering H3K9me3 and H3K27me3 at osteogenic loci and restoring MSC differentiation capacity.",
                        methodology: "\u03bcCT bone imaging, ex vivo MSC isolation and osteogenic differentiation assays, ChIP-seq for H3K9me3/H3K27me3, RNA-seq for osteogenic gene expression.",
                        clinicalRelevance: "Extends the AKG-longevity story from TOR to direct epigenetic regulation and provides plausible mechanism for age-related BMD loss."
                    }
                ]
            },
            {
                mechanism: "Mitophagy activation and oxidative-stress regulation",
                strength: "Moderate",
                mechanismType: "Redox / mitochondrial quality control",
                tissueTarget: "Articular cartilage and chondrocytes",
                target: "Articular cartilage and chondrocytes",
                evidence: [
                    {
                        citationId: "liu_2023_mitophagy",
                        title: "The physiological metabolite \u03b1-ketoglutarate ameliorates osteoarthritis by regulating mitophagy and oxidative stress.",
                        authors: ["Liu L", "Zhang W", "Liu T"],
                        year: 2023,
                        journal: "Redox Biology",
                        doi: "10.1016/j.redox.2023.102663",
                        pmid: "36924682",
                        studyType: "Translational (human cartilage tissue + in vivo mouse OA model)",
                        evidenceLevel: "Level 4",
                        studyDesign: "Cross-sectional human cartilage AKG measurement + in vivo intra-articular AKG treatment in DMM-induced mouse OA model",
                        findings: "AKG levels in human OA cartilage were reduced versus healthy controls. Intra-articular AKG administration in mice attenuated cartilage degradation, reduced mitochondrial ROS, and promoted PINK1/Parkin-mediated mitophagy in chondrocytes.",
                        methodology: "Mass-spec quantification of cartilage AKG, histological OARSI scoring, mitochondrial membrane-potential probes, Western blot for mitophagy markers.",
                        clinicalRelevance: "Identifies AKG as a candidate disease-modifying intervention for osteoarthritis \u2014 an age-related inflammatory joint disease."
                    }
                ]
            }
        ],

        benefits: [
            {
                healthDomain: "Biological age reduction",
                specificClaim: "Retrospective DNA-methylation analysis reports reduced biological age after ~7 months of Rejuvant (Ca-AKG + cofactor vitamins).",
                strength: "Preliminary",
                evidenceQuality: "Low",
                replicationStatus: "Single retrospective analysis (not yet replicated in an RCT)",
                tissueTarget: "Whole-body epigenome (peripheral blood DNA methylation)",
                target: "Whole-body epigenome (peripheral blood DNA methylation)",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "demidenko_2021_truage",
                        title: "Rejuvant\u00ae, a potential life-extending compound formulation with alpha-ketoglutarate and vitamins, conferred an average 8 year reduction in biological aging, after an average of 7 months of use, in the TruAge DNA methylation test.",
                        authors: ["Demidenko O", "Barardo D", "Budovskii V"],
                        year: 2021,
                        journal: "Aging (Albany NY)",
                        doi: "10.18632/aging.203736",
                        pmid: "34847066",
                        studyType: "Retrospective observational analysis",
                        evidenceLevel: "Level 3",
                        studyDesign: "Retrospective analysis of customer-submitted TruAge (Horvath-family) DNA methylation tests before and after Rejuvant use",
                        sampleSize: "n=42 adults",
                        duration: "~7 months average on-supplement duration",
                        dosage: "1000 mg/day Ca-AKG within the Rejuvant formulation (co-formulated with vitamins A and D)",
                        demographics: "Adults aged ~40\u201380 taking Rejuvant voluntarily; retrospective cohort",
                        primaryOutcome: "Change in DNA methylation-based biological age (TruAge)",
                        results: {
                            primaryEndpoint: {
                                outcome: "Mean biological-age reduction",
                                effectSize: "-8.00 years (mean) vs baseline",
                                pValue: "Statistically significant per paper (retrospective, uncontrolled)",
                                clinicalSignificance: "Hypothesis-generating: effect size is large but design is retrospective and uncontrolled."
                            }
                        },
                        findings: "Among 42 Rejuvant users, paired pre/post TruAge tests showed an average 8-year reduction in DNA methylation biological age after ~7 months of use.",
                        methodology: "Paired-sample analysis of TruAge DNA methylation ages; no placebo control; customers self-selected.",
                        limitations: [
                            "Retrospective, not randomized or placebo-controlled",
                            "Self-selected users (regression to the mean and adherence bias)",
                            "Single DNA-methylation clock type (TruAge/Horvath-family) used for the primary readout",
                            "Co-administered vitamins A and D confound attribution solely to Ca-AKG"
                        ],
                        clinicalRelevance: "First human signal that Ca-AKG supplementation may favorably modulate a well-validated aging biomarker \u2014 but the signal requires RCT confirmation.",
                        clinicalTranslation: "Directly motivated the ongoing ABLE randomized trial (Lim 2025) which will test this hypothesis prospectively."
                    }
                ]
            },
            {
                healthDomain: "Healthspan and mammalian lifespan extension",
                specificClaim: "Calcium AKG supplementation extends healthspan and lifespan and compresses morbidity in aged female mice.",
                strength: "Strong",
                evidenceQuality: "High",
                replicationStatus: "Replicated across invertebrate (C. elegans) and mammalian (mouse) models by independent groups",
                tissueTarget: "Multiple organ systems (whole-organism)",
                target: "Multiple organ systems (whole-organism)",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "shahmirzadi_2020_lifespan",
                        title: "Alpha-Ketoglutarate, an Endogenous Metabolite, Extends Lifespan and Compresses Morbidity in Aging Mice.",
                        authors: ["Asadi Shahmirzadi A", "Edgar D", "Liao CY"],
                        year: 2020,
                        journal: "Cell Metabolism",
                        doi: "10.1016/j.cmet.2020.08.004",
                        pmid: "32877690",
                        studyType: "Preclinical in vivo (C57BL/6 mice)",
                        evidenceLevel: "Level 4",
                        studyDesign: "Longitudinal lifespan and healthspan study of aged mice fed Ca-AKG vs. control chow",
                        findings: "Ca-AKG supplementation in aged C57BL/6 mice extended median lifespan, reduced frailty index, lowered circulating inflammatory cytokines, and compressed morbidity at the end of life. Effects were more pronounced in females.",
                        methodology: "Frailty-index longitudinal scoring, cytokine panels, histology, survival analysis.",
                        clinicalRelevance: "The foundational mammalian study motivating translation to humans; provides the mechanistic and dose rationale currently used in human investigations."
                    }
                ]
            },
            {
                healthDomain: "Human clinical evidence base (scoping review)",
                specificClaim: "Narrative review of human AKG data across muscle, wound healing, and immunity suggests potential healthspan benefits but notes the absence of modern RCTs.",
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Single authoritative expert review summarizing historical human data",
                tissueTarget: "Multiple organ systems",
                target: "Multiple organ systems",
                metaAnalysisSupport: null,
                evidence: [
                    {
                        citationId: "gyanwali_2022_human_review",
                        title: "Alpha-Ketoglutarate dietary supplementation to improve health in humans.",
                        authors: ["Gyanwali B", "Lim ZX", "Soh J"],
                        year: 2022,
                        journal: "Trends in Endocrinology and Metabolism",
                        doi: "10.1016/j.tem.2021.11.003",
                        pmid: "34952764",
                        studyType: "Narrative review",
                        evidenceLevel: "Level 5",
                        studyDesign: "Structured narrative review of AKG mechanisms, preclinical longevity data, and historical (1980s\u20131990s) human studies on OKG in muscle growth, wound healing, and immunity.",
                        findings: "Concluded that AKG has plausible multi-system mechanisms (antioxidant, epigenetic, nitrogen balance) and that historic human data is supportive but inadequate; modern placebo-controlled RCTs in aging-focused cohorts are needed.",
                        methodology: "Literature synthesis; no pooled statistics.",
                        clinicalRelevance: "Defines the state of evidence and explicitly calls for human RCTs, which the ABLE trial (Lim 2025) is beginning to address."
                    }
                ]
            }
        ],

        safety: [
            {
                safetyAspect: "General tolerability in adult supplementation",
                claim: "Ca-AKG appears well tolerated at 1000 mg/day in observational use; no serious adverse events have been reported in the published human record to date.",
                riskLevel: "Low",
                target: "Multiple organ systems (GI, renal, cardiovascular)",
                tissueTarget: "Multiple organ systems (GI, renal, cardiovascular)",
                evidence: [
                    {
                        citationId: "demidenko_2021_truage",
                        title: "Rejuvant\u00ae, a potential life-extending compound formulation with alpha-ketoglutarate and vitamins, conferred an average 8 year reduction in biological aging, after an average of 7 months of use, in the TruAge DNA methylation test.",
                        authors: ["Demidenko O", "Barardo D", "Budovskii V"],
                        year: 2021,
                        journal: "Aging (Albany NY)",
                        doi: "10.18632/aging.203736",
                        pmid: "34847066",
                        studyType: "Retrospective observational analysis",
                        evidenceLevel: "Level 3",
                        findings: "No serious adverse events reported in the customer cohort at 1000 mg/day over ~7 months. Safety reporting is limited by the retrospective, customer-survey nature of the data.",
                        methodology: "Retrospective chart review; safety reporting limited to voluntarily submitted customer feedback."
                    },
                    {
                        citationId: "gyanwali_2022_human_review",
                        title: "Alpha-Ketoglutarate dietary supplementation to improve health in humans.",
                        authors: ["Gyanwali B", "Lim ZX", "Soh J"],
                        year: 2022,
                        journal: "Trends in Endocrinology and Metabolism",
                        doi: "10.1016/j.tem.2021.11.003",
                        pmid: "34952764",
                        studyType: "Narrative review",
                        evidenceLevel: "Level 5",
                        findings: "Historical human OKG studies reported a favorable tolerability profile at supplemental doses; no signals of clinically meaningful toxicity were identified across the cited literature.",
                        methodology: "Narrative synthesis of prior safety reporting."
                    }
                ]
            }
        ],

        dosage: [
            {
                dosageRange: "1000 mg/day Ca-AKG (as used in the Rejuvant retrospective analysis and the active ABLE RCT)",
                claim: "The only human-derived dose used in published AKG-longevity research is 1000 mg/day Ca-AKG. Optimal dosing, timing, and duration remain under active investigation.",
                evidenceBase: "Emerging",
                target: "Whole-body metabolism",
                tissueTarget: "Whole-body metabolism",
                evidence: [
                    {
                        citationId: "demidenko_2021_truage",
                        title: "Rejuvant\u00ae, a potential life-extending compound formulation with alpha-ketoglutarate and vitamins, conferred an average 8 year reduction in biological aging, after an average of 7 months of use, in the TruAge DNA methylation test.",
                        authors: ["Demidenko O", "Barardo D", "Budovskii V"],
                        year: 2021,
                        journal: "Aging (Albany NY)",
                        doi: "10.18632/aging.203736",
                        pmid: "34847066",
                        studyType: "Retrospective observational analysis",
                        evidenceLevel: "Level 3",
                        findings: "1000 mg/day Ca-AKG (within the Rejuvant formulation) used for ~7 months was associated with an 8-year reduction in TruAge biological age.",
                        methodology: "Retrospective paired-sample analysis without dose-response range."
                    },
                    {
                        citationId: "lim_2025_able_trial",
                        title: "Recruitment evaluation of a gerotherapeutic randomized controlled trial testing alpha-ketoglutarate in biologically older, middle-aged adults (ABLE).",
                        authors: ["Lim ZM", "Chew YE", "Guan L"],
                        year: 2025,
                        journal: "Experimental Gerontology",
                        doi: "10.1016/j.exger.2025.112867",
                        pmid: "40819772",
                        studyType: "RCT recruitment feasibility report",
                        evidenceLevel: "Level 2",
                        findings: "Describes feasibility of recruiting biologically older middle-aged adults into a prospective RCT of AKG supplementation. Efficacy results pending; defines the modern dosing and population framework for AKG-longevity research.",
                        methodology: "Recruitment feasibility analysis for the ABLE trial."
                    }
                ]
            }
        ]
    }
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[115] = calciumAlphaKetoglutarateEnhanced;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = calciumAlphaKetoglutarateEnhanced;
}
