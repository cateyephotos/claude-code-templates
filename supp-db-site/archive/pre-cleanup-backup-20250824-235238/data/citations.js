// Master Citation Database for Evidence-Based Supplement Database
// This file tracks all primary research sources used for supplement profiles

const masterCitations = {
  "metadata": {
    "version": "1.1",
    "lastUpdated": "2025-08-17",
    "totalCitations": 52,
    "verifiedDOIs": 10,
    "sourceFiles": [
      "comprehensive_supplement_database.md",
      "supplement_reference_guide.md", 
      "comprehensive_supplement_database_extended.md"
    ]
  },

  // Core Research Papers - Referenced by [number] in analysis documents
  "primarySources": {
    "1": {
      "id": "gutierrez_2021",
      "title": "Effects of nutrition on cognitive function in adults with or without cognitive impairment: A systematic review of randomized controlled clinical trials",
      "authors": "Gutierrez, L., Folch, A., Rojas, M., Cantero, J. L., Atienza, M., Folch, J., ... & Bulló, M.",
      "year": 2021,
      "journal": "Nutrients",
      "volume": "13",
      "issue": "11",
      "pages": "3728",
      "doi": "10.3390/nu13113728",
      "pmid": "34836084",
      "studyType": "Systematic Review",
      "evidenceLevel": "Level 1",
      "relevantSupplements": ["General Nutrition", "Polyphenols", "B-Vitamins", "Omega-3"],
      "keyFindings": "Strong evidence for polyphenols and nutrient combinations; low evidence for PUFAs, vitamin D, specific proteins, and amino acids"
    },

    "2": {
      "id": "de_vries_2022", 
      "title": "The effect of polyphenols on working and episodic memory in non-pathological and pathological aging: A systematic review and meta-analysis",
      "authors": "de Vries, K. D., Medawar, E., Korosi, A., & Witte, A. V.",
      "year": 2022,
      "journal": "Frontiers in Nutrition",
      "volume": "8",
      "pages": "720756",
      "doi": "10.3389/fnut.2021.720756",
      "pmid": "35155563",
      "studyType": "Meta-analysis",
      "evidenceLevel": "Level 1",
      "relevantSupplements": ["Polyphenols", "Flavonoids", "Anthocyanins", "Resveratrol"],
      "keyFindings": "Small positive effect on working memory and episodic memory (b ~ 0.24, p < 0.001). 66 RCTs with ≥20 participants per group, aged 40+ years",
      "sampleSize": "66 RCTs",
      "effectSize": "Small (b=0.24)"
    },

    "3": {
      "id": "young_2022",
      "title": "Investigating the effects of a multinutrient supplement on cognition, mood and biochemical markers in middle-aged adults with 'optimal' and 'sub-optimal' diets: A randomized double blind placebo controlled trial",
      "authors": "Young, L. M., Gauci, S. M., Arnoldy, L., Martin, L., Perry, N., White, D. J., ... & Pipingas, A.",
      "year": 2022,
      "journal": "Nutrients",
      "volume": "14",
      "issue": "23", 
      "pages": "5079",
      "doi": "10.3390/nu14235079",
      "pmid": "36501127",
      "studyType": "RCT",
      "evidenceLevel": "Level 2",
      "sampleSize": "141 middle-aged adults (M = 52.84 years)",
      "duration": "12 weeks",
      "relevantSupplements": ["B-Vitamins", "Bacopa monnieri", "Ginkgo biloba"],
      "keyFindings": "Significant beneficial effect on attentional performance in individuals with optimal diet (F(1,57.25) = 4.94, p = 0.030)"
    },

    "4": {
      "id": "moran_2018",
      "title": "Effects of a six-month multi-ingredient nutrition supplement intervention of omega-3 polyunsaturated fatty acids, vitamin D, resveratrol, and whey protein on cognitive function in older adults: A randomised, double-blind, controlled trial",
      "authors": "Moran, C., Scotto di Palumbo, A., Bramham, J., Moran, A., Rooney, B., De Vito, G., & Egan, B.",
      "year": 2018,
      "journal": "The Journal of Prevention of Alzheimer's Disease",
      "volume": "5",
      "issue": "3",
      "pages": "175-183",
      "doi": "10.14283/jpad.2018.14",
      "pmid": "29717768",
      "studyType": "RCT",
      "evidenceLevel": "Level 2",
      "sampleSize": "37 older adults (68-83 years)",
      "duration": "6 months",
      "relevantSupplements": ["Omega-3 Fatty Acids", "Vitamin D3", "Resveratrol"],
      "keyFindings": "Limited beneficial impact; only significant interaction for Stroop Color-Word Time (p < 0.05)"
    },

    "5": {
      "id": "macpherson_2012",
      "title": "The effects of chronic multivitamin supplementation on neurocognition in the elderly",
      "authors": "Macpherson, H. N.",
      "year": 2012,
      "journal": "Doctoral dissertation",
      "studyType": "Doctoral Research",
      "evidenceLevel": "Level 2",
      "sampleSize": "56 elderly women with subjective memory complaints",
      "duration": "16 weeks",
      "relevantSupplements": ["Multivitamins", "B-Vitamins", "Vitamin E"],
      "keyFindings": "Improved speed of response on composite memory measures and spatial working memory"
    },

    // Bacopa monnieri Research
    "11": {
      "id": "bokelmann_2022",
      "title": "Bacopa (Bacopa monnieri)",
      "authors": "Bokelmann, J. M.",
      "year": 2022,
      "journal": "Herbal Medicine",
      "pages": "28-3",
      "publisher": "Academic Press",
      "studyType": "Review",
      "evidenceLevel": "Level 3",
      "relevantSupplements": ["Bacopa monnieri"],
      "keyFindings": "Comprehensive review of neuroprotective effects and clinical applications"
    },

    "12": {
      "id": "fukuda_2023",
      "title": "Plantainoside B in Bacopa monniera binds to Aβ aggregates attenuating neuronal damage and memory deficits induced by Aβ",
      "authors": "Fukuda, A., Nakashima, S., Oda, Y., Nishimura, K., Kawashima, H., Kimura, H. S., ... & Takata, K.",
      "year": 2023,
      "journal": "Biological and Pharmaceutical Bulletin",
      "volume": "46",
      "issue": "2",
      "pages": "b22-00797",
      "doi": "10.1248/bpb.b22-00797",
      "pmid": "36737273",
      "studyType": "Preclinical",
      "evidenceLevel": "Level 4",
      "relevantSupplements": ["Bacopa monnieri"],
      "keyFindings": "Plantainoside B binds to Aβ aggregates, providing neuroprotective effects"
    },

    "25": {
      "id": "gautam_2017",
      "title": "Role of antioxidants in generalised anxiety disorder",
      "authors": "Gautam, M.",
      "year": 2017,
      "journal": "International Journal of Pure & Applied Bioscience",
      "volume": "5",
      "issue": "5",
      "pages": "10-14",
      "studyType": "Clinical Trial",
      "evidenceLevel": "Level 2",
      "sampleSize": "60 subjects aged 20-60 years with GAD",
      "duration": "6 weeks",
      "relevantSupplements": ["Vitamin A", "Vitamin C", "Vitamin E"],
      "keyFindings": "Significant reduction in anxiety scores and increase in blood antioxidant levels"
    },

    "27": {
      "id": "talaei_2023",
      "title": "The effect of adding curcumin to sertraline in the treatment of severe major depressive disorder: A randomized, double-blind clinical trial",
      "authors": "Talaei, A., Noori, R. H., Ardani, A. R., Mohammadpour, A., & Afzaljavan, F.",
      "year": 2023,
      "journal": "Clinical Neuropharmacology",
      "doi": "10.1097/WNF.0000000000000553",
      "studyType": "RCT",
      "evidenceLevel": "Level 2",
      "sampleSize": "45 severe MDD patients",
      "duration": "8 weeks",
      "relevantSupplements": ["Curcumin"],
      "keyFindings": "No significant difference between groups for depression; lower anxiety scores in intervention group"
    },

    "39": {
      "id": "liaqat_2023",
      "title": "Therapeutic effect of magnesium supplementation in improving quality of life among elderly insomniac participants",
      "authors": "Liaqat, A., Rizwan, B., Amjad, A., & Rasool, Z.",
      "year": 2023,
      "journal": "Pakistan Journal of Health Sciences",
      "volume": "4",
      "issue": "9",
      "pages": "995",
      "studyType": "RCT",
      "evidenceLevel": "Level 2",
      "sampleSize": "80 elderly participants (40 per group)",
      "duration": "8 weeks",
      "relevantSupplements": ["Magnesium"],
      "keyFindings": "Highly significant improvements in sleep quality, serum melatonin, cortisol, and renin levels"
    }
  },

  // Supplement Reference Guide Citations (Supplement_reference_guide.md)
  "supplementGuideReferences": {
    "stough_2015": {
      "id": "stough_2015",
      "title": "Erratum: Examining the nootropic effects of a special extract of Bacopa monniera on human cognitive functioning: 90-day double-blind placebo-controlled randomized trial",
      "authors": "Stough, C., et al.",
      "year": 2015,
      "journal": "Phytotherapy Research",
      "volume": "29",
      "issue": "10",
      "doi": "10.1002/ptr.5441",
      "pmid": "26223802",
      "studyType": "RCT",
      "evidenceLevel": "Level 2",
      "relevantSupplements": ["Bacopa monnieri"],
      "keyFindings": "90-day trial showing cognitive benefits of standardized Bacopa extract"
    },

    "birks_2009": {
      "id": "birks_2009", 
      "title": "Ginkgo biloba for cognitive improvement and dementia",
      "authors": "Birks, J., & Grimley Evans, J.",
      "year": 2009,
      "journal": "Cochrane Database of Systematic Reviews",
      "doi": "10.1002/14651858.CD003120.pub3",
      "pmid": "19160216",
      "studyType": "Cochrane Review",
      "evidenceLevel": "Level 1",
      "relevantSupplements": ["Ginkgo Biloba"],
      "keyFindings": "Extensive research with mixed but generally positive results for cognitive improvement"
    },

    "hudson_2003": {
      "id": "hudson_2003",
      "title": "Acetyl-L-carnitine for dementia and cognitive impairment",
      "authors": "Hudson, S., & Tabet, N.",
      "year": 2003,
      "journal": "Cochrane Database of Systematic Reviews",
      "doi": "10.1002/14651858.CD003158",
      "pmid": "12917945",
      "studyType": "Cochrane Review", 
      "evidenceLevel": "Level 1",
      "relevantSupplements": ["Acetyl-L-Carnitine"],
      "keyFindings": "Multiple RCTs showing benefits for cognitive decline and depression"
    },

    "geng_2010": {
      "id": "geng_2010",
      "title": "Panax ginseng for cognitive function and quality of life",
      "authors": "Geng, J., et al.",
      "year": 2010,
      "journal": "Cochrane Database of Systematic Reviews",
      "doi": "10.1002/14651858.CD007769.pub2",
      "pmid": "21154383",
      "studyType": "Cochrane Review",
      "evidenceLevel": "Level 1", 
      "relevantSupplements": ["Panax Ginseng"],
      "keyFindings": "Multiple RCTs showing cognitive and energy benefits"
    },

    "parnetti_2007": {
      "id": "parnetti_2007",
      "title": "Alpha-glycerylphosphorylcholine and cognitive function",
      "authors": "Parnetti, L., et al.",
      "year": 2007,
      "journal": "Clinical Therapeutics",
      "doi": "10.2165/00023210-200721080-00005",
      "studyType": "Clinical Review",
      "evidenceLevel": "Level 2",
      "relevantSupplements": ["Alpha-GPC"],
      "keyFindings": "Limited human studies, promising for cognitive enhancement"
    }
  },

  // Validation Status Tracking
  "validationStatus": {
    "cochraneMeta": [
      "birks_2009", 
      "hudson_2003", 
      "geng_2010"
    ],
    "systematicReviews": [
      "gutierrez_2021",
      "de_vries_2022"
    ],
    "rcts": [
      "young_2022",
      "moran_2018", 
      "talaei_2023",
      "liaqat_2023",
      "stough_2015"
    ],
    "needDOIVerification": [
      "macpherson_2012",
      "bokelmann_2022", 
      "gautam_2017"
    ]
  },

  // Quality Indicators by Evidence Tier
  "evidenceTiers": {
    "tier1": {
      "description": "Meta-analyses and systematic reviews",
      "citations": ["gutierrez_2021", "de_vries_2022", "birks_2009", "hudson_2003", "geng_2010"],
      "qualityMarkers": ["Cochrane Database", "Multiple RCTs", "Large sample sizes", "Publication bias assessment"]
    },
    "tier2": {
      "description": "Large RCTs and well-designed studies", 
      "citations": ["young_2022", "moran_2018", "talaei_2023", "liaqat_2023", "stough_2015", "gautam_2017"],
      "qualityMarkers": ["Randomized controlled", "Double-blind", ">30 participants", "Standardized outcomes"]
    },
    "tier3": {
      "description": "Smaller studies and clinical reviews",
      "citations": ["macpherson_2012", "parnetti_2007", "bokelmann_2022"],
      "qualityMarkers": ["Peer-reviewed", "Clinical populations", "Standardized extracts"]
    },
    "tier4": {
      "description": "Preclinical and preliminary studies",
      "citations": ["fukuda_2023"],
      "qualityMarkers": ["Mechanistic studies", "Animal models", "In vitro research"]
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = masterCitations;
}