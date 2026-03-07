// Enhanced Citations for Berberine (ID: 17)
// Research focus: Blood sugar control, metabolic health, cardiovascular support
// Evidence Profile: Tier 1 - Extensive evidence
// Last pipeline run: 2026-03-05 (supplement-research-pipeline Mode 1)
// All PMIDs verified via PubMed API

window.enhancedCitations = window.enhancedCitations || {};

window.berberineEnhanced = {
    supplementId: 17,
    supplementName: "Berberine",
    lastUpdated: "2026-03-05",
    version: "2.0",

    evidenceProfile: {
        overallQuality: "Tier 1",
        totalCitations: 12,
        researchQualityScore: 93,
        lastEvidenceUpdate: "2026-03-05",
        evidenceStrength: {
            mechanisms: "Strong",
            clinicalBenefits: "Strong",
            safety: "Good",
            dosage: "Evidence-based"
        },
        researchMaturity: "Highly Mature",
        publicationSpan: "2017-2025",
        keyFindings: "Extensively researched plant alkaloid with strong meta-analytic evidence for glucose metabolism (50 RCTs), lipid profiles, obesity indices, NAFLD, and metabolic syndrome management. Favorable safety profile with mild GI effects."
    },

    citations: {
        mechanisms: [
            {
                claim: "AMPK activation, adipocyte differentiation inhibition, and hepatic gluconeogenesis suppression",
                evidence: "Strong",
                studyType: "Systematic Review",
                participants: "Preclinical + human studies",
                doi: "10.1016/j.biopha.2020.110137",
                pmid: "32353823",
                year: 2020,
                authors: "Ilyas et al.",
                journal: "Biomed Pharmacother",
                replication: "Extensive evidence across models",
                details: "Berberine inhibits adipocyte differentiation via decreased LXRs, PPARs, SREBPs expression. Suppresses hepatic gluconeogenesis through PEPCK, G6Pase, and AMPK pathways. Effective at 100-200 mg/kg/day in animals, 300-1000 mg/day in humans."
            },
            {
                claim: "Gut microbiota modulation as key pharmacological mechanism",
                evidence: "Strong",
                studyType: "Review",
                participants: "Preclinical + clinical studies",
                doi: "10.1016/j.phrs.2020.104722",
                pmid: "32105754",
                year: 2020,
                authors: "Habtemariam S",
                journal: "Pharmacol Res",
                replication: "Multiple independent studies",
                details: "Despite poor oral bioavailability, berberine exerts systemic effects through gut microbiota modulation. Reverses pathological changes in microbiota composition in obesity, hyperlipidemia, diabetes, and inflammatory conditions."
            },
            {
                claim: "Gastrointestinal microbiota regulation and metabolic benefits",
                evidence: "Strong",
                studyType: "Systematic Review",
                participants: "Animal + human studies",
                doi: "10.3389/fcimb.2020.588517",
                pmid: "33680978",
                year: 2021,
                authors: "Zhang et al.",
                journal: "Front Cell Infect Microbiol",
                replication: "Confirmed across multiple models",
                details: "Berberine modulates gut microbiota composition, increases beneficial bacteria, reduces Firmicutes-to-Bacteroidetes ratio, and enhances short-chain fatty acid production, contributing to metabolic improvements."
            },
            {
                claim: "PCSK9 inhibition and LDL receptor upregulation for cholesterol lowering",
                evidence: "Strong",
                studyType: "Review",
                participants: "In vitro + in vivo studies",
                doi: "10.1016/j.phrs.2017.03.023",
                pmid: "28363723",
                year: 2017,
                authors: "Momtazi et al.",
                journal: "Pharmacol Res",
                replication: "Multiple studies",
                details: "Berberine inhibits PCSK9 through SREBP-independent pathway, enhances LDL receptor expression on hepatocyte surface, providing a cost-effective nutraceutical approach to LDL-C lowering."
            }
        ],

        benefits: [
            {
                claim: "Type 2 diabetes management: significant reductions in FPG, 2hPBG, HbA1c, and lipid profiles",
                evidence: "Strong Evidence",
                studyType: "Systematic Review & Meta-Analysis",
                participants: "50 RCTs, 4,150 participants",
                duration: "1-3 months typical treatment cycles",
                doi: "10.3389/fphar.2024.1455534",
                pmid: "39640489",
                year: 2024,
                authors: "Wang et al.",
                journal: "Front Pharmacol",
                replication: "Largest berberine T2DM meta-analysis to date",
                details: "BBR alone: FPG MD=-0.59 mmol/L, 2hPBG MD=-1.57 mmol/L, LDL-C MD=-0.30 mmol/L, TC MD=-0.30 mmol/L, TG MD=-0.35 mmol/L. Combined with hypoglycemics: FPG MD=-0.99, HbA1c MD=-0.69%, with improvements in HOMA-IR and inflammatory markers. Optimal dose 0.9-1.5 g/day.",
                effectSize: "FPG: MD=-0.59 mmol/L (alone), MD=-0.99 mmol/L (combined); HbA1c: MD=-0.69% (combined)"
            },
            {
                claim: "NAFLD improvement: liver enzymes, lipid profile, insulin sensitivity, and BMI reduction",
                evidence: "Strong Evidence",
                studyType: "Systematic Review & Meta-Analysis",
                participants: "10 RCTs, 811 patients",
                duration: "Variable",
                doi: "10.1186/s12967-024-05011-2",
                pmid: "38429794",
                year: 2024,
                authors: "Nie et al.",
                journal: "J Transl Med",
                registration: "PROSPERO CRD42023462338",
                replication: "Consistent across trials",
                details: "Significant reductions: ALT SMD=-0.72, AST SMD=-0.79, GGT SMD=-0.62, TG SMD=-0.59, TC SMD=-0.74, LDL-C SMD=-0.53, HOMA-IR SMD=-1.56, BMI SMD=-0.58. Only mild GI adverse events reported.",
                effectSize: "ALT: SMD=-0.72; AST: SMD=-0.79; HOMA-IR: SMD=-1.56; BMI: SMD=-0.58"
            },
            {
                claim: "Obesity: significant reductions in body weight, BMI, and waist circumference",
                evidence: "Strong Evidence",
                studyType: "Systematic Review & Meta-Analysis",
                participants: "23 RCTs",
                duration: "Variable",
                doi: "10.1038/s41366-025-01943-x",
                pmid: "41310257",
                year: 2025,
                authors: "Elahi Vahed et al.",
                journal: "Int J Obes",
                replication: "Large number of RCTs",
                details: "Body weight MD=-0.88 kg (95% CI: -1.36 to -0.39, p=0.0003), BMI MD=-0.48 kg/m2 (95% CI: -0.89 to -0.07, p=0.0216), WC MD=-1.32 cm (95% CI: -2.24 to -0.41, p=0.0046). WHR not significantly reduced. No age-related moderation.",
                effectSize: "Weight: MD=-0.88 kg; BMI: MD=-0.48 kg/m2; WC: MD=-1.32 cm"
            },
            {
                claim: "Metabolic syndrome components: TG, FPG, and waist circumference significantly improved",
                evidence: "Strong Evidence",
                studyType: "Systematic Review & Meta-Analysis",
                participants: "Placebo-controlled RCTs",
                duration: "Short-term (<=90 days) more effective for lipids",
                doi: "10.3389/fphar.2025.1572197",
                pmid: "40740996",
                year: 2025,
                authors: "Liu et al.",
                journal: "Front Pharmacol",
                registration: "PROSPERO CRD42024588614",
                replication: "Comprehensive evaluation",
                details: "TG WMD=-0.367 mmol/L (p<0.001), FPG WMD=-0.515 mmol/L (p=0.002), WC WMD=-3.270 cm (p<0.001). Also improved LDL-C (-0.495), TC (-0.451), BMI (-0.435), 2hOGTT (-1.606). No significant effect on HDL-C, SBP, or DBP. Short-term treatment more effective for HDL-C and LDL-C.",
                effectSize: "TG: WMD=-0.367 mmol/L; FPG: WMD=-0.515 mmol/L; WC: WMD=-3.270 cm; LDL-C: WMD=-0.495 mmol/L"
            },
            {
                claim: "Glycemic control and inflammatory biomarker reduction across metabolic disorders",
                evidence: "Strong Evidence",
                studyType: "Umbrella Meta-Analysis",
                participants: "Multiple meta-analyses of RCTs",
                duration: "Variable",
                doi: "10.1016/j.clinthera.2023.10.019",
                pmid: "38016844",
                year: 2023,
                authors: "Nazari et al.",
                journal: "Clin Ther",
                replication: "Umbrella review of multiple MAs",
                details: "FBG ES=-0.77 to -0.65, HbA1c ES=-0.57, HOMA-IR ES=-1.04 to -0.71, insulin ES=-1.00 to -0.63. Anti-inflammatory: IL-6 ES=-1.23, TNF-alpha ES=-1.04, CRP ES=-0.62 to -1.70. Confirms berberine's dual glycemic and anti-inflammatory benefits.",
                effectSize: "FBG: ES=-0.77; HbA1c: ES=-0.57; HOMA-IR: ES=-1.04; CRP: ES=-0.62 to -1.70"
            }
        ],

        safety: [
            {
                claim: "Favorable safety profile with no significant difference from placebo in adverse events",
                evidence: "Good Safety Profile",
                studyType: "Systematic Review & Meta-Analysis",
                participants: "Placebo-controlled RCTs (MetS patients)",
                doi: "10.3389/fphar.2025.1572197",
                pmid: "40740996",
                year: 2025,
                authors: "Liu et al.",
                journal: "Front Pharmacol",
                details: "No significant difference in adverse events between berberine and placebo groups. Mild gastrointestinal effects (diarrhea, constipation, nausea) are the most commonly reported side effects, typically dose-dependent and self-limiting."
            },
            {
                claim: "Well-tolerated in NAFLD patients; only mild GI adverse events",
                evidence: "Good Safety Profile",
                studyType: "Systematic Review & Meta-Analysis",
                participants: "811 NAFLD patients across 10 RCTs",
                doi: "10.1186/s12967-024-05011-2",
                pmid: "38429794",
                year: 2024,
                authors: "Nie et al.",
                journal: "J Transl Med",
                details: "Berberine exhibited a favorable safety profile across all included NAFLD trials. Only mild gastrointestinal adverse events reported. No serious adverse events attributed to berberine."
            },
            {
                claim: "Potential drug interactions with antidiabetic and cardiovascular medications",
                evidence: "Caution Advised",
                studyType: "Systematic Review",
                participants: "T2DM patients on combined therapy",
                doi: "10.3389/fphar.2024.1455534",
                pmid: "39640489",
                year: 2024,
                authors: "Wang et al.",
                journal: "Front Pharmacol",
                details: "Berberine enhances hypoglycemic effects when combined with diabetes medications. Optimal dose 0.9-1.5 g/day with 1-3 month treatment cycles. Monitor blood glucose when used alongside metformin, insulin, or other antidiabetic drugs. Additive lipid-lowering effects may require monitoring with statins."
            }
        ]
    }
};

// Set in global enhanced citations
window.enhancedCitations[17] = window.berberineEnhanced;
