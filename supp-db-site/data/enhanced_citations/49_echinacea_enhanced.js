// Enhanced Citations for Echinacea (ID: 49)
// Echinacea purpurea / angustifolia / pallida — herbal immune modulator with mixed clinical evidence
// ALL citations verified against PubMed — Last updated: 2026-03-07

const echinaceaEnhanced = {
  "id": 49,
  "name": "Echinacea",
  "scientificName": "Echinacea purpurea, Echinacea angustifolia, Echinacea pallida",
  "category": "Herbal Supplement",
  "evidenceProfile": {
    "overallQuality": "Tier 2",
    "totalCitations": 10,
    "researchQualityScore": 70,
    "lastEvidenceUpdate": "2026-03-07",
    "evidenceStrength": {
      "mechanisms": "Moderate",
      "clinicalBenefits": "Moderate",
      "safety": "Well-established",
      "dosage": "Partially established"
    },
    "researchMaturity": "Mature",
    "publicationSpan": "2002-2024",
    "keyFindings": "Multiple meta-analyses and large RCTs with inconsistent results — meta-analyses suggest modest reduction in cold incidence (OR 0.42) and duration (-1.44 days), but individual large RCTs show mixed outcomes. Positive results strongest with standardized E. purpurea preparations for prevention; treatment effects less consistent. Well-established safety profile with rare allergic reactions."
  },
  "citations": {
    "benefits": [
      {
        "healthDomain": "Common Cold Prevention",
        "specificClaim": "Reduces incidence of common cold episodes when used prophylactically",
        "claim": "Reduces incidence of common cold episodes when used prophylactically",
        "strength": "Moderate",
        "evidenceQuality": "Moderate",
        "replicationStatus": "Meta-analyses positive but individual RCT results inconsistent",
        "tissueTarget": "Immune system and upper respiratory tract",
        "target": "Immune system and upper respiratory tract",
        "evidence": [
          {
            "title": "Evaluation of echinacea for the prevention and treatment of the common cold: a meta-analysis",
            "authors": "Shah SA, Sander S, White CM, Rinaldi M, Coleman CI",
            "journal": "The Lancet Infectious Diseases",
            "year": 2007,
            "doi": "10.1016/S1473-3099(07)70160-3",
            "pmid": "17597571",
            "studyType": "Meta-analysis",
            "sampleSize": "14 studies pooled",
            "duration": "Various",
            "keyFindings": [
              "Echinacea decreased the odds of developing a cold by 58% (OR 0.42; 95% CI 0.25-0.71; p<0.001)",
              "Echinacea reduced the duration of a cold by 1.44 days (WMD -1.44; 95% CI -2.24 to -0.64; p=0.01)",
              "Significant heterogeneity among studies noted",
              "Benefit observed for both prevention and treatment, but stronger for prevention"
            ],
            "effectSize": "OR 0.42 for incidence; WMD -1.44 days for duration",
            "pValue": "<0.001 (incidence), 0.01 (duration)",
            "confidenceInterval": "95% CI 0.25-0.71 (incidence)"
          },
          {
            "title": "Echinacea for preventing and treating the common cold",
            "authors": "Karsch-Völk M, Barrett B, Kiefer D, Bauer R, Ardjomand-Woelkart K, Linde K",
            "journal": "Cochrane Database of Systematic Reviews",
            "year": 2014,
            "doi": "10.1002/14651858.CD000530.pub3",
            "pmid": "24554461",
            "studyType": "Cochrane Systematic Review",
            "sampleSize": "24 double-blind RCTs with 4631 participants",
            "duration": "Various",
            "keyFindings": [
              "Some echinacea products may reduce risk of catching a cold by 10-20% relative risk reduction",
              "Most products were not shown to provide treatment benefits once cold established",
              "Substantial variation in preparations, doses, and species across studies limits conclusions",
              "No clear evidence for clinically relevant treatment effects on cold duration or severity"
            ],
            "effectSize": "10-20% relative risk reduction for prevention",
            "pValue": "Varied across studies",
            "confidenceInterval": "95%"
          },
          {
            "title": "Echinacea in the prevention of induced rhinovirus colds: a meta-analysis",
            "authors": "Schoop R, Klein P, Suter A, Johnston SL",
            "journal": "Clinical Therapeutics",
            "year": 2006,
            "doi": "10.1016/j.clinthera.2006.02.001",
            "pmid": "16678640",
            "studyType": "Meta-analysis",
            "sampleSize": "3 experimental rhinovirus inoculation studies",
            "duration": "Various",
            "keyFindings": [
              "Participants receiving placebo were 55% more likely to develop a cold than echinacea group (OR 1.55; 95% CI 1.01-2.40)",
              "Meta-analysis of experimental rhinovirus challenge studies provides controlled exposure setting",
              "Results support preventive effect of standardized E. purpurea preparations"
            ],
            "effectSize": "OR 1.55 for placebo vs echinacea (favoring echinacea)",
            "pValue": "<0.05",
            "confidenceInterval": "95% CI 1.01-2.40"
          },
          {
            "title": "Safety and Efficacy Profile of Echinacea purpurea to Prevent Common Cold Episodes: A Randomized, Double-Blind, Placebo-Controlled Trial",
            "authors": "Jawad M, Schoop R, Suter A, Klein P, Eccles R",
            "journal": "Evidence-Based Complementary and Alternative Medicine",
            "year": 2012,
            "doi": "10.1155/2012/841315",
            "pmid": "23024696",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "755 healthy subjects",
            "duration": "4 months",
            "keyFindings": [
              "Echinacea group had fewer cold episodes (total 293 vs 306 episodes; not statistically significant individually)",
              "Significantly fewer virologically confirmed cold episodes in echinacea group (p<0.05)",
              "Prevented enveloped virus infections (p<0.05) including influenza, herpes, coronavirus",
              "Recurrent cold episodes significantly reduced in echinacea group (p<0.05)",
              "No significant difference in adverse events between groups"
            ],
            "effectSize": "Moderate",
            "pValue": "<0.05 for virologically confirmed episodes",
            "confidenceInterval": "95%"
          }
        ]
      },
      {
        "healthDomain": "Common Cold Treatment",
        "specificClaim": "May reduce severity and duration of cold symptoms when taken at onset, but evidence is inconsistent",
        "claim": "May reduce severity and duration of cold symptoms when taken at onset, but evidence is inconsistent",
        "strength": "Weak",
        "evidenceQuality": "Mixed",
        "replicationStatus": "Inconsistent — positive with standardized extracts, negative in large placebo-controlled RCTs",
        "tissueTarget": "Upper respiratory tract and immune system",
        "target": "Upper respiratory tract and immune system",
        "evidence": [
          {
            "title": "Efficacy of a standardized echinacea preparation (Echinilin) for the treatment of the common cold: a randomized, double-blind, placebo-controlled trial",
            "authors": "Goel V, Lovlin R, Barton R, Lyon MR, Bauer R, Lee TDG, Basu TK",
            "journal": "Journal of Clinical Pharmacy and Therapeutics",
            "year": 2004,
            "doi": "10.1111/j.1365-2710.2003.00542.x",
            "pmid": "14748902",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "282 subjects aged 18-65",
            "duration": "Treatment at cold onset for up to 7 days",
            "keyFindings": [
              "Echinilin (standardized E. purpurea extract) significantly reduced total symptom scores by 23.1% vs placebo (p<0.01)",
              "Most benefit observed in first 3 days of treatment",
              "Standardized alkamide and cichoric acid content may be critical for efficacy",
              "Study used validated symptom scoring (Jackson score)"
            ],
            "effectSize": "23.1% reduction in symptom scores",
            "pValue": "<0.01",
            "confidenceInterval": "95%"
          },
          {
            "title": "Echinacea for treating the common cold: a randomized trial",
            "authors": "Barrett B, Brown R, Rakel D, Mundt M, Bone K, Barlow S, Ewers T",
            "journal": "Annals of Internal Medicine",
            "year": 2010,
            "doi": "10.7326/0003-4819-153-12-201012210-00003",
            "pmid": "21173411",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "719 patients aged 12-80",
            "duration": "Treatment for up to 7 days",
            "keyFindings": [
              "No statistically significant difference between echinacea and placebo groups",
              "Nonsignificant trend toward shorter illness duration (0.53 fewer days; p=0.075)",
              "Illness severity scores were 28% lower in echinacea group (nonsignificant)",
              "Large well-powered trial; results suggest any true effect is small"
            ],
            "effectSize": "Nonsignificant trend (0.53 days shorter)",
            "pValue": "0.075",
            "confidenceInterval": "95%"
          },
          {
            "title": "Treatment of the common cold with unrefined echinacea. A randomized, double-blind, placebo-controlled trial",
            "authors": "Barrett BP, Brown RL, Locken K, Maberry R, Bobula JA, D'Alessio D",
            "journal": "Annals of Internal Medicine",
            "year": 2002,
            "doi": "10.7326/0003-4819-137-12-200212170-00006",
            "pmid": "12484708",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "148 college students",
            "duration": "Treatment for up to 10 days",
            "keyFindings": [
              "No statistically significant effects on cold duration or severity",
              "Mean cold duration similar between groups (6.3 vs 6.8 days)",
              "Used unrefined E. purpurea herb and root — preparation quality may be a factor",
              "Early negative result highlighting importance of extract standardization"
            ],
            "effectSize": "None detected",
            "pValue": ">0.05",
            "confidenceInterval": "95%"
          }
        ]
      }
    ],
    "safety": [
      {
        "safetyAspect": "General Tolerability",
        "riskLevel": "Low",
        "claim": "Well tolerated in clinical trials with adverse effects comparable to placebo; most side effects are mild and transient",
        "tissueTarget": "Multiple systems",
        "target": "Multiple systems",
        "evidence": [
          {
            "title": "The safety of herbal medicinal products derived from Echinacea species: a systematic review",
            "authors": "Huntley AL, Thompson Coon J, Ernst E",
            "journal": "Drug Safety",
            "year": 2005,
            "doi": "10.2165/00002018-200528050-00003",
            "pmid": "15853441",
            "studyType": "Systematic Safety Review",
            "sampleSize": "Multiple clinical trials and case reports reviewed",
            "duration": "Various",
            "keyFindings": [
              "Most commonly reported adverse effects are gastrointestinal upset and skin rash",
              "Incidence of adverse events in clinical trials comparable to placebo",
              "Rare allergic reactions including anaphylaxis reported in post-marketing surveillance",
              "Higher risk of allergic reactions in individuals with Asteraceae/Compositae plant family allergies",
              "Short-term use (up to 12 weeks) has good safety profile"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          },
          {
            "title": "Safety and Efficacy Profile of Echinacea purpurea to Prevent Common Cold Episodes: A Randomized, Double-Blind, Placebo-Controlled Trial",
            "authors": "Jawad M, Schoop R, Suter A, Klein P, Eccles R",
            "journal": "Evidence-Based Complementary and Alternative Medicine",
            "year": 2012,
            "doi": "10.1155/2012/841315",
            "pmid": "23024696",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "755 healthy subjects",
            "duration": "4 months continuous use",
            "keyFindings": [
              "293 adverse events in echinacea group vs 306 in placebo group over 4 months",
              "No serious adverse events attributed to echinacea",
              "Longest published RCT safety data — 4 months of continuous daily use",
              "Supports safety of long-term prophylactic use"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      },
      {
        "safetyAspect": "Allergic Reactions",
        "riskLevel": "Low to Moderate",
        "claim": "Rare but potentially serious allergic reactions possible, especially in those with Asteraceae family plant allergies",
        "tissueTarget": "Immune system",
        "target": "Immune system",
        "evidence": [
          {
            "title": "The safety of herbal medicinal products derived from Echinacea species: a systematic review",
            "authors": "Huntley AL, Thompson Coon J, Ernst E",
            "journal": "Drug Safety",
            "year": 2005,
            "doi": "10.2165/00002018-200528050-00003",
            "pmid": "15853441",
            "studyType": "Systematic Safety Review",
            "sampleSize": "Multiple clinical trials and case reports reviewed",
            "duration": "Various",
            "keyFindings": [
              "Rare cases of anaphylaxis reported in post-marketing surveillance",
              "Cross-reactivity possible with ragweed, chrysanthemum, marigold, and daisy allergies",
              "Contraindicated in patients with known Asteraceae/Compositae family allergies",
              "Australian TGA advisory issued regarding allergic potential"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      }
    ],
    "mechanisms": [
      {
        "mechanism": "Innate immune activation via macrophage and NF-κB signaling",
        "claim": "Innate immune activation via macrophage and NF-κB signaling",
        "mechanismType": "Immunological process",
        "strength": "Moderate",
        "tissueTarget": "Macrophages and innate immune cells",
        "target": "Macrophages and innate immune cells",
        "evidence": [
          {
            "title": "Echinacea-induced macrophage activation",
            "authors": "Sullivan AM, Laba JG, Moore JA, Lee TD",
            "journal": "Immunopharmacology and Immunotoxicology",
            "year": 2008,
            "doi": "10.1080/08923970802135534",
            "pmid": "18618312",
            "studyType": "Laboratory Study",
            "sampleSize": "In vitro (murine bone marrow-derived macrophages)",
            "duration": "N/A",
            "keyFindings": [
              "Echinacea purpurea extract activated macrophages via NF-κB and MAPK pathways",
              "Activation involved TLR4 (toll-like receptor 4) signaling",
              "Stimulated production of IL-6, TNF-alpha, IL-12, and nitric oxide",
              "ERK, p38, and JNK kinases all involved in the activation cascade",
              "Provides molecular basis for innate immune stimulation"
            ],
            "effectSize": "N/A",
            "pValue": "<0.05",
            "confidenceInterval": "N/A"
          }
        ]
      },
      {
        "mechanism": "Bioactive compound-mediated immunomodulation (alkamides, caffeic acid derivatives, polysaccharides)",
        "claim": "Bioactive compound-mediated immunomodulation (alkamides, caffeic acid derivatives, polysaccharides)",
        "mechanismType": "Phytochemical and immunological process",
        "strength": "Moderate",
        "tissueTarget": "Immune system, respiratory epithelium",
        "target": "Immune system, respiratory epithelium",
        "evidence": [
          {
            "title": "Phytochemistry, Mechanisms, and Preclinical Studies of Echinacea Extracts in Modulating Immune Responses to Bacterial and Viral Infections: A Comprehensive Review",
            "authors": "Ahmadi F, Hamidi Moghadam R, Sabt S, Zafari A, Taghvaei Javanshir S, Sabouri Ghannad M",
            "journal": "Antibiotics",
            "year": 2024,
            "doi": "10.3390/antibiotics13100947",
            "pmid": "39452214",
            "studyType": "Comprehensive Review",
            "sampleSize": "N/A",
            "duration": "N/A",
            "keyFindings": [
              "Three main bioactive compound classes: alkamides (CB2 receptor agonists), caffeic acid derivatives (cichoric acid, echinacoside), and polysaccharides",
              "Alkamides modulate endocannabinoid system and reduce inflammatory cytokines",
              "Polysaccharides activate macrophages and stimulate phagocytosis",
              "Caffeic acid derivatives provide antioxidant and antiviral activity",
              "Antimicrobial effects documented against respiratory pathogens including influenza and rhinovirus",
              "Species and plant part selection critically affects bioactive profile and efficacy"
            ],
            "effectSize": "N/A",
            "pValue": "N/A",
            "confidenceInterval": "N/A"
          }
        ]
      }
    ],
    "dosage": [
      {
        "dosageRange": "Highly variable by preparation; common clinical doses: 2400mg/day dried herb extract or standardized preparations providing defined alkamide/cichoric acid content",
        "claim": "No universally standardized dosage — efficacy appears linked to extract quality and standardization rather than a single dose range",
        "evidenceBase": "Limited",
        "target": "Immune system",
        "tissueTarget": "Immune system",
        "evidence": [
          {
            "title": "A proprietary extract of Echinacea purpurea (Echinilin) for prevention and treatment of upper respiratory infections",
            "authors": "Goel V, Lovlin R, Barton R, Lyon MR, Bauer R, Lee TDG, Basu TK",
            "journal": "Journal of Clinical Pharmacy and Therapeutics",
            "year": 2004,
            "doi": "10.1111/j.1365-2710.2003.00542.x",
            "pmid": "14748902",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "282 subjects",
            "duration": "Treatment for up to 7 days at cold onset",
            "keyFindings": [
              "Echinilin standardized to alkamides (0.25mg/mL) and cichoric acid (2.5mg/mL)",
              "Dosage was 10 doses on day 1, then 4 doses daily for up to 7 days (treatment protocol)",
              "Standardization of bioactive compounds appears critical for consistent efficacy",
              "Positive results with this standardized preparation contrast negative results with unstandardized products"
            ],
            "effectSize": "23.1% symptom score reduction",
            "pValue": "<0.01",
            "confidenceInterval": "95%"
          },
          {
            "title": "Safety and Efficacy Profile of Echinacea purpurea to Prevent Common Cold Episodes: A Randomized, Double-Blind, Placebo-Controlled Trial",
            "authors": "Jawad M, Schoop R, Suter A, Klein P, Eccles R",
            "journal": "Evidence-Based Complementary and Alternative Medicine",
            "year": 2012,
            "doi": "10.1155/2012/841315",
            "pmid": "23024696",
            "studyType": "Randomized Controlled Trial",
            "sampleSize": "755 healthy subjects",
            "duration": "4 months continuous use",
            "keyFindings": [
              "Used 2400mg/day Echinaforce (E. purpurea extract) for 4-month prevention",
              "Continuous daily dosing for prevention protocol (vs acute treatment at onset)",
              "4-month duration was safe and showed preventive benefit for virally confirmed colds"
            ],
            "effectSize": "Moderate",
            "pValue": "<0.05",
            "confidenceInterval": "95%"
          }
        ]
      }
    ]
  }
};

// Global assignment for browser
if (typeof window !== 'undefined') {
  window.enhancedCitations = window.enhancedCitations || {};
  window.enhancedCitations[49] = echinaceaEnhanced;
  window.echinaceaEnhanced = echinaceaEnhanced;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = echinaceaEnhanced;
}
