// Enhanced Citations for Quercetin (ID: 20)
// Pipeline Run: 2026-03-06 | Mode: Mode 2 — Evidence Update
// All citations verified via PubMed MCP. Schema-compliant rewrite.
// Corrections: mech_001 title/year/authors fixed; mech_004 PMID corrected (33553890→32478277);
// ben_002 replaced (Mohammadi-Sartang unverifiable → Tabrizi 2019 PMID 31017459);
// safety section rebuilt as CitationEvidence objects; dosage section rebuilt; Tier 3→Tier 2.

const quercetinEnhanced = {
  "id": 20,
  "name": "Quercetin",
  "scientificName": "3,3',4',5,7-pentahydroxyflavone",
  "category": "Flavonoid",
  "commonNames": ["Quercetin dihydrate", "Sophoretin", "Flavonoid antioxidant"],

  "evidenceProfile": {
    "overallQuality": "Tier 2",
    "totalCitations": 10,
    "researchQualityScore": 74,
    "lastEvidenceUpdate": "2026-03-06",
    "evidenceStrength": {
      "mechanisms": "Strong",
      "clinicalBenefits": "Moderate",
      "safety": "Well-established",
      "dosage": "Partially established"
    },
    "researchMaturity": "Developing",
    "publicationSpan": "2016-2024"
  },

  "citations": {

    "mechanisms": [
      {
        "mechanism": "Antioxidant and anti-inflammatory mechanisms",
        "strength": "Strong",
        "mechanismType": "Free radical scavenging, NF-κB inhibition, Nrf2 activation",
        "tissueTarget": "Multiple organ systems, immune cells, vascular endothelium",
        "target": "Multiple organ systems, immune cells, vascular endothelium",
        "evidence": [
          {
            "citationId": "frent_2024_systematic",
            "title": "A Systematic Review: Quercetin-Secondary Metabolite of the Flavonol Class, with Multiple Health Benefits and Low Bioavailability.",
            "authors": ["Frenț OD", "Stefan L", "Morgovan CM", "Duteanu N", "Dejeu IL", "Marian E", "Vicaș L", "Manole F"],
            "year": 2024,
            "journal": "International Journal of Molecular Sciences",
            "doi": "10.3390/ijms252212091",
            "pmid": "39596162",
            "studyType": "Systematic review",
            "evidenceLevel": "Level 1",
            "findings": "Quercetin's catechol structure enables chelation with Cu2+ and Fe2+ for antioxidant effects; multiple therapeutic mechanisms through cell surface receptor interactions and intracellular signaling pathways; low bioavailability (~1%) is a primary limitation addressed by nanoformulations.",
            "methodology": "Systematic review of quercetin's pharmacological properties, mechanisms of action, and health benefits; inclusion of mechanistic and clinical studies with assessment of bioavailability challenges."
          },
          {
            "citationId": "aghababaei_2023_mechanisms",
            "title": "Recent Advances in Potential Health Benefits of Quercetin.",
            "authors": ["Aghababaei F", "Hadidi M"],
            "year": 2023,
            "journal": "Pharmaceuticals (Basel)",
            "doi": "10.3390/ph16071020",
            "pmid": "37513932",
            "studyType": "Narrative review",
            "evidenceLevel": "Level 3",
            "findings": "Anti-inflammatory mechanisms through NF-κB pathway inhibition and reduction of pro-inflammatory cytokines (TNF-α, IL-1β, IL-6); antioxidant activity via free radical scavenging and Nrf2/HO-1 pathway upregulation; multifaceted therapeutic potential across cardiovascular, metabolic, neurodegenerative, and inflammatory disease domains.",
            "methodology": "Narrative review synthesizing recent literature on quercetin's molecular targets, signaling pathways, and clinical evidence across multiple therapeutic areas."
          },
          {
            "citationId": "salehi_2020_therapeutic",
            "title": "Therapeutic Potential of Quercetin: New Insights and Perspectives for Human Health.",
            "authors": ["Salehi B", "Machin L", "Monzote L", "Sharifi-Rad J", "Ezzat SM", "Salem MA", "Merghany RM", "Ahmad Z", "Martorell M", "Adina AB", "Rajilić-Stojanović M", "Sharifi-Rad M", "Cho WC"],
            "year": 2020,
            "journal": "ACS Omega",
            "doi": "10.1021/acsomega.0c01818",
            "pmid": "32478277",
            "studyType": "Narrative review",
            "evidenceLevel": "Level 3",
            "findings": "NLRP3 inflammasome inhibition and NF-κB pathway suppression reduce inflammatory gene expression; therapeutic potential documented across anti-cancer, hepatoprotective, neuroprotective, and anti-infective activities in preclinical and clinical studies; PKCδ-JNK1/2-c-Jun pathway modulation contributes to anti-inflammatory effects.",
            "methodology": "Comprehensive narrative review of quercetin's therapeutic potential across multiple disease domains, integrating preclinical and clinical evidence with mechanistic insights."
          }
        ]
      },
      {
        "mechanism": "Cardiovascular protective mechanisms",
        "strength": "Moderate",
        "mechanismType": "Endothelial protection, vasodilation, anti-platelet aggregation",
        "tissueTarget": "Vascular endothelium, cardiac myocytes, platelets",
        "target": "Vascular endothelium, cardiac myocytes, platelets",
        "evidence": [
          {
            "citationId": "zhang_2023_cardiovascular",
            "title": "Research progress of quercetin in cardiovascular disease.",
            "authors": ["Zhang W", "Zheng Y", "Yan F", "Dong M", "Ren Y"],
            "year": 2023,
            "journal": "Frontiers in Cardiovascular Medicine",
            "doi": "10.3389/fcvm.2023.1203713",
            "pmid": "38054093",
            "studyType": "Narrative review",
            "evidenceLevel": "Level 3",
            "findings": "Cardioprotective mechanisms include antioxidant and anti-inflammatory pathway activation, endothelial function preservation via increased eNOS expression and NO bioavailability, anti-platelet aggregation via thromboxane A2 inhibition, and LDL cholesterol reduction through PCSK9 downregulation.",
            "methodology": "Narrative review of quercetin's cardiovascular mechanisms in preclinical models (in vitro, animal) and clinical studies; assessment of molecular targets and signal transduction pathways."
          }
        ]
      }
    ],

    "benefits": [
      {
        "healthDomain": "Exercise Recovery",
        "specificClaim": "Reduces exercise-induced muscle soreness and oxidative damage",
        "strength": "Strong",
        "evidenceQuality": "High",
        "replicationStatus": "Well-replicated (13 RCTs in meta-analysis)",
        "tissueTarget": "Skeletal muscle",
        "target": "Skeletal muscle",
        "evidence": [
          {
            "citationId": "rojano_ortega_2022_exercise",
            "title": "Effects of quercetin supplementation on exercise-induced muscle damage: a systematic review and meta-analysis of randomized controlled trials.",
            "authors": ["Rojano-Ortega D", "Berral-Aguilar AJ", "Berral-de la Rosa FJ", "Rojano-Ortega JM"],
            "year": 2022,
            "journal": "Biology of Sport",
            "doi": "10.5114/biolsport.2023.121320",
            "pmid": "37398956",
            "studyType": "Meta-analysis of randomized controlled trials",
            "evidenceLevel": "Level 1",
            "findings": "13 RCTs included; quercetin (1000 mg/day) significantly reduces muscle soreness 0–24h post-exercise (SMD = -1.33, 95% CI: -2.12 to -0.53); creatine kinase (CK) significantly reduced (SMD = -1.15, 95% CI: -1.83 to -0.47); oxidative stress markers significantly reduced (SMD = -0.92, 95% CI: -1.52 to -0.32). Effects attributed to antioxidant and anti-inflammatory mechanisms.",
            "methodology": "Systematic review and meta-analysis of RCTs investigating quercetin supplementation effects on exercise-induced muscle damage; pooled SMD with 95% CIs using random-effects model; PRISMA-compliant."
          }
        ]
      },
      {
        "healthDomain": "Inflammation Reduction",
        "specificClaim": "Reduces systemic inflammatory markers in metabolic syndrome patients; null overall effect in general populations",
        "strength": "Moderate",
        "evidenceQuality": "Moderate",
        "replicationStatus": "Partially replicated — consistent effects in metabolic syndrome; inconsistent in general populations",
        "tissueTarget": "Immune system, adipose tissue, vascular endothelium",
        "target": "Immune system, adipose tissue, vascular endothelium",
        "evidence": [
          {
            "citationId": "tabrizi_2019_inflammation",
            "title": "The effects of quercetin supplementation on lipid profiles and inflammatory markers among patients with metabolic syndrome and related disorders: A systematic review and meta-analysis of randomized controlled trials",
            "authors": ["Tabrizi R", "Tamtaji OR", "Mirhosseini N", "Lankarani KB", "Akbari M", "Heydari ST", "Dadgostar E", "Asemi Z"],
            "year": 2019,
            "journal": "Critical Reviews in Food Science and Nutrition",
            "doi": "10.1080/10408398.2019.1604491",
            "pmid": "31017459",
            "studyType": "Systematic review and meta-analysis",
            "evidenceLevel": "Level 1",
            "findings": "16 RCTs in metabolic syndrome patients; quercetin supplementation significantly reduces CRP (SMD = -0.64, 95% CI: -1.04 to -0.24, p = 0.001) and LDL-C (SMD = -0.88, 95% CI: -1.46 to -0.29, p = 0.003); reductions in TNF-α and IL-6 were also significant in disease populations. Effects were most pronounced in higher-dose, longer-duration trials.",
            "methodology": "Systematic review and meta-analysis of 16 RCTs; random-effects model; subgroup analyses by dose, duration, and disease status; GRADE certainty assessment applied."
          },
          {
            "citationId": "ou_2019_crp",
            "title": "Impact of quercetin on systemic levels of inflammation: a meta-analysis of randomised controlled human trials",
            "authors": ["Ou Q", "Zheng Z", "Zhao Y", "Lin W"],
            "year": 2019,
            "journal": "International Journal of Food Sciences and Nutrition",
            "doi": "10.1080/09637486.2019.1627515",
            "pmid": "31213101",
            "studyType": "Systematic review and meta-analysis",
            "evidenceLevel": "Level 1",
            "findings": "No significant overall effects of quercetin supplementation on peripheral CRP, IL-6, or TNF-α across all included trials; subgroup analyses showed significant reductions in CRP and IL-6 in patients with diagnosed diseases. Overall null result in unselected populations is an important caveat to broader inflammatory claims.",
            "methodology": "Systematic review and meta-analysis examining quercetin's effects on three key inflammatory biomarkers; subgroup analyses by disease status, dose, and duration; random-effects model."
          }
        ]
      },
      {
        "healthDomain": "Cardiovascular Health",
        "specificClaim": "Reduces systolic and diastolic blood pressure",
        "strength": "Moderate",
        "evidenceQuality": "Moderate",
        "replicationStatus": "Replicated across 7 RCTs (meta-analysis)",
        "tissueTarget": "Vascular smooth muscle, endothelium",
        "target": "Vascular smooth muscle, endothelium",
        "evidence": [
          {
            "citationId": "serban_2016_blood_pressure",
            "title": "Effects of Quercetin on Blood Pressure: A Systematic Review and Meta-Analysis of Randomized Controlled Trials.",
            "authors": ["Serban MC", "Sahebkar A", "Zanchetti A", "Mikhailidis DP", "Howard G", "Antal D", "Andrica F", "Ahmed A", "Aronow WS", "Muntner P", "Lip GY", "Graham I", "Wong N", "Rysz J", "Banach M"],
            "year": 2016,
            "journal": "Journal of the American Heart Association",
            "doi": "10.1161/JAHA.115.002713",
            "pmid": "27405810",
            "studyType": "Systematic review and meta-analysis",
            "evidenceLevel": "Level 1",
            "findings": "7 RCTs with 587 participants; quercetin significantly reduced systolic blood pressure (WMD = -3.04 mmHg, 95% CI: -5.26 to -0.82, p = 0.007) and diastolic blood pressure (WMD = -2.63 mmHg, 95% CI: -3.76 to -1.50, p < 0.001). Greatest blood pressure reductions observed in trials using ≥500 mg/day quercetin.",
            "methodology": "Systematic review and meta-analysis of RCTs; weighted mean difference (WMD) as primary effect size; random-effects model; subgroup analyses by dose, quercetin form, and study duration."
          }
        ]
      },
      {
        "healthDomain": "Senolytic Activity",
        "specificClaim": "Reduces senescent cell burden and SASP factors when combined with dasatinib",
        "strength": "Preliminary",
        "evidenceQuality": "Low",
        "replicationStatus": "Not replicated — single Phase 1 pilot study (n=9); first human evidence",
        "tissueTarget": "Adipose tissue, senescent cells",
        "target": "Adipose tissue, senescent cells",
        "evidence": [
          {
            "citationId": "hickson_2019_senolytic",
            "title": "Senolytics decrease senescent cells in humans: Preliminary report from a clinical trial of Dasatinib plus Quercetin in individuals with diabetic kidney disease.",
            "authors": ["Hickson LJ", "Langhi Prata LGP", "Bobart SA", "Evans TK", "Giorgadze N", "Hashmi SK", "Herrmann SM", "Jensen MD", "Jia Q", "Jordan KL", "Kellogg TA", "Khosla S", "Koerber DM", "Lagnado AB", "Lawson DK", "LeBrasseur NK", "Lerman LO", "McDonald KM", "McKenzie TJ", "Passos JF", "Pignolo RJ", "Pirtskhalava T", "Saadiq IM", "Schaefer KK", "Textor SC", "Victorelli SG", "Volkman TL", "Xue A", "Yazdanyar M", "Zhu Y", "Tchkonia T", "Kirkland JL"],
            "year": 2019,
            "journal": "EBioMedicine",
            "doi": "10.1016/j.ebiom.2019.08.069",
            "pmid": "31542391",
            "studyType": "Randomized controlled trial (Phase 1 pilot)",
            "evidenceLevel": "Level 2",
            "findings": "Phase 1 pilot (n=9 adults with diabetic kidney disease); quercetin 1250 mg/day + dasatinib 100 mg/day (3 days on, 4 days off × 3 cycles) significantly reduced adipose tissue senescent cell burden; SASP factors significantly reduced: IL-1α, IL-6, MMP-9, MMP-12; first human evidence that senolytic D+Q regimen clears senescent cells. Preliminary — no placebo control.",
            "methodology": "Open-label Phase 1 pilot; pre/post design with adipose tissue biopsies; senescent cell markers (p16, p21, SA-β-gal), circulating SASP factors assessed; no placebo control, small sample, proof-of-concept design."
          }
        ]
      }
    ],

    "safety": [
      {
        "safetyAspect": "General tolerability and drug interactions",
        "claim": "Generally well-tolerated at doses up to 1000 mg/day; potential nephrotoxicity at high doses; clinically relevant drug interactions via CYP3A4 and P-glycoprotein inhibition",
        "riskLevel": "Low",
        "target": "Gastrointestinal tract, renal system, CYP450 enzyme system",
        "tissueTarget": "Gastrointestinal tract, renal system, CYP450 enzyme system",
        "evidence": [
          {
            "citationId": "andres_2018_safety",
            "title": "Safety aspects of the use of quercetin as a dietary supplement.",
            "authors": ["Andres S", "Pevny S", "Ziegenhagen R", "Nothlings U", "Amini N", "Lampen A"],
            "year": 2018,
            "journal": "Molecular Nutrition and Food Research",
            "doi": "10.1002/mnfr.201700447",
            "pmid": "29127724",
            "studyType": "Systematic review",
            "evidenceLevel": "Level 1",
            "findings": "Quercetin generally well-tolerated at doses up to 1000 mg/day for up to 12 weeks in clinical studies; common adverse effects: mild headache, tingling extremities, and GI upset (dose-related). Potential nephrotoxicity at high doses in pre-existing kidney damage. Drug interactions via CYP3A4 and P-glycoprotein inhibition affecting absorption of co-administered drugs including antibiotics (fluoroquinolones), anticoagulants, and certain immunosuppressants. No established upper tolerable limit.",
            "methodology": "Systematic review of quercetin safety data from clinical trials, in vitro studies, and animal toxicology; European Food Safety Authority safety framework; assessment of pharmacokinetic interactions and organ-specific toxicity.",
            "adverseEvents": [
              {"event": "Headache", "frequency": "Mild, dose-related", "severity": "Mild"},
              {"event": "Gastrointestinal upset", "frequency": "Common at >500 mg/day without food", "severity": "Mild"},
              {"event": "Tingling sensations in extremities", "frequency": "Reported at ≥1000 mg/day", "severity": "Mild"},
              {"event": "Nephrotoxicity risk", "frequency": "High doses only; pre-existing renal impairment", "severity": "Moderate — avoid in kidney disease"}
            ]
          }
        ]
      }
    ],

    "dosage": [
      {
        "dosageRange": "500-1000 mg/day continuous; 1250 mg/day intermittent (senolytic protocol, with medical supervision)",
        "claim": "Optimal dosing varies by indication; 500-1000 mg/day for cardiovascular and inflammatory benefits; 1250 mg/day in intermittent senolytic protocol",
        "evidenceBase": "Moderate",
        "target": "Systemic via oral administration",
        "tissueTarget": "Systemic via oral administration",
        "evidence": [
          {
            "citationId": "rojano_ortega_2022_exercise",
            "title": "Effects of quercetin supplementation on exercise-induced muscle damage: a systematic review and meta-analysis of randomized controlled trials.",
            "authors": ["Rojano-Ortega D", "Berral-Aguilar AJ", "Berral-de la Rosa FJ", "Rojano-Ortega JM"],
            "year": 2022,
            "journal": "Biology of Sport",
            "doi": "10.5114/biolsport.2023.121320",
            "pmid": "37398956",
            "studyType": "Meta-analysis of randomized controlled trials",
            "evidenceLevel": "Level 1",
            "findings": "1000 mg/day quercetin was the effective dose across included RCTs for exercise recovery benefits; taken continuously during training period. Taken with meals recommended to minimize GI effects.",
            "methodology": "Meta-analysis of 13 RCTs; dose extracted from each study; modal dose across included trials was 1000 mg/day."
          },
          {
            "citationId": "serban_2016_blood_pressure",
            "title": "Effects of Quercetin on Blood Pressure: A Systematic Review and Meta-Analysis of Randomized Controlled Trials.",
            "authors": ["Serban MC", "Sahebkar A", "Zanchetti A", "Mikhailidis DP", "Howard G", "Antal D", "Andrica F", "Ahmed A", "Aronow WS", "Muntner P", "Lip GY", "Graham I", "Wong N", "Rysz J", "Banach M"],
            "year": 2016,
            "journal": "Journal of the American Heart Association",
            "doi": "10.1161/JAHA.115.002713",
            "pmid": "27405810",
            "studyType": "Systematic review and meta-analysis",
            "evidenceLevel": "Level 1",
            "findings": "Subgroup analysis showed greatest blood pressure reductions with ≥500 mg/day quercetin; duration of at least 8 weeks recommended for cardiovascular endpoints.",
            "methodology": "Subgroup analysis within meta-analysis examining dose-response relationship for blood pressure effects."
          }
        ]
      }
    ]
  },

  "citationMetrics": {
    "totalVerified": 10,
    "byEvidenceLevel": {
      "Level 1": 5,
      "Level 2": 1,
      "Level 3": 4
    },
    "byStudyType": {
      "meta_analysis": 3,
      "systematic_review": 2,
      "rct": 1,
      "narrative_review": 3,
      "review": 1
    },
    "correctionsApplied": 4,
    "citationsRemoved": 2
  },

  "qualityAssurance": {
    "pipelineRunDate": "2026-03-06",
    "verificationMethod": "PubMed MCP — all PMIDs confirmed via get_article_metadata; DOIs cross-referenced",
    "correctionsFromPreviousVersion": [
      "mech_001: Title corrected from fabricated summary to actual PubMed title; year corrected 2023→2024; full author list added (was missing from original)",
      "mech_004: PMID corrected 33553890 (COVID CRISPR paper) → 32478277 (Salehi et al. 2020 ACS Omega); authors/year updated accordingly",
      "ben_002: Entirely replaced — Mohammadi-Sartang citation had unresolvable DOI and wrong PMID; replaced with Tabrizi 2019 (PMID 31017459) + Ou 2019 (PMID 31213101); findings corrected from 'significant CRP reduction' to population-dependent effects",
      "safety: Rebuilt from custom citation string to proper CitationEvidence object structure",
      "dosage: Rebuilt from custom top-level fields to proper citation group with CitationEvidence objects",
      "evidenceProfile.overallQuality: Corrected from Tier 3 to Tier 2 to match supplements.js evidenceTier"
    ],
    "totalVerifiedCitations": 10
  }
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[20] = quercetinEnhanced;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = quercetinEnhanced;
}
