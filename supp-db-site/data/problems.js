// Problem-Centered Evidence Database
// Generated from healthDomains inversion + enhanced citation cross-referencing
// Schema defined in PRD_UNIFIED_PROBLEM_CENTERED_EVIDENCE.md
// Last updated: 2026-03-04

const problemDatabase = [
  {
    id: "sleep",
    name: "Sleep Quality & Insomnia",
    slug: "sleep",
    description: "Evidence-based supplements studied for sleep onset, sleep quality, circadian rhythm regulation, and insomnia management. Ranked by research strength from systematic reviews and meta-analyses.",
    category: "Neurological & Mental Health",
    relatedHealthDomains: ["Sleep Quality"],
    physiologyOverview: {
      systems: ["GABAergic system", "Melatonergic system", "Serotonergic pathway", "HPA axis"],
      keyNeurotransmitters: ["GABA", "Melatonin", "Serotonin", "Cortisol"],
      summary: "Sleep is regulated by the interplay of circadian rhythm signals (suprachiasmatic nucleus, melatonin), inhibitory neurotransmission (GABA), serotonin-to-melatonin conversion, and stress hormone regulation (cortisol via HPA axis). Supplements in this category target one or more of these systems."
    },
    supplements: [
      {
        supplementId: 8,
        name: "Melatonin",
        evidenceTier: 1,
        relevanceScore: 98,
        mechanismMatch: ["Melatonin receptor activation (MT1/MT2)", "Circadian rhythm regulation", "Antioxidant activity"],
        sleepSpecificEffects: {
          sleepOnset: "Reduces sleep onset latency by 23.5 minutes (meta-analysis of 34 RCTs, PMID: 36442478)",
          sleepQuality: "PSQI improvement WMD -1.24 (23 RCTs, PMID: 33417003)",
          populations: ["Chronic insomnia", "Shift workers", "Jet lag", "Elderly", "Children with neurodevelopmental disorders"]
        },
        dosageRange: "0.5-3mg, 30-60 minutes before bedtime",
        keyEvidence: {
          title: "Effect of melatonin supplementation on sleep quality: a systematic review and meta-analysis",
          authors: "Gholami F, Moradi L, Ziaei R, et al.",
          journal: "Journal of Neurology",
          year: 2022,
          pmid: "33417003",
          studyType: "Meta-analysis",
          sampleSize: "23 RCTs"
        },
        safetyProfile: "Very Low risk. Adverse events 12.2% vs 10.8% placebo. No habituation or withdrawal (PMID: 31758569)",
        guideNotes: "First-line for circadian disruption (shift work, jet lag). Low doses (0.5mg) often as effective as higher doses for sleep onset."
      },
      {
        supplementId: 6,
        name: "Magnesium",
        evidenceTier: 1,
        relevanceScore: 92,
        mechanismMatch: ["GABA receptor modulation", "NMDA receptor antagonism", "Sleep-wake cycle modulation via melatonin/cortisol regulation"],
        sleepSpecificEffects: {
          sleepOnset: "Sleep onset latency reduced by 17.36 minutes vs placebo (meta-analysis, PMID: 33865376)",
          sleepQuality: "Total sleep time improved by 16.06 minutes. Serum melatonin increased, cortisol decreased (PMID: 23853635)",
          populations: ["Elderly with insomnia", "Adults with sleep issues", "Stressed individuals"]
        },
        dosageRange: "200-400mg daily (elemental magnesium)",
        keyEvidence: {
          title: "Oral magnesium supplementation for insomnia in older adults: a Systematic Review & Meta-Analysis",
          authors: "Mah J, Pitre T",
          journal: "BMC Complementary Medicine and Therapies",
          year: 2021,
          pmid: "33865376",
          doi: "10.1186/s12906-021-03297-z",
          studyType: "Meta-analysis",
          sampleSize: "3 RCTs, 151 participants"
        },
        safetyProfile: "Low risk. GI effects (diarrhea) with oxide form. Chelated forms (glycinate, malate) preferred for tolerability. Separate from medications by 2-3 hours (PMID: 31035385)",
        guideNotes: "Magnesium glycinate preferred for sleep due to calming properties. Addresses deficiency (estimated 50% of US adults). Also improves sleep architecture via cortisol/melatonin regulation."
      },
      {
        supplementId: 9,
        name: "L-Theanine",
        evidenceTier: 2,
        relevanceScore: 85,
        mechanismMatch: ["GABA neurotransmitter system modulation", "Alpha brain wave enhancement", "Glutamate receptor antagonism"],
        sleepSpecificEffects: {
          sleepOnset: "Reduced time to fall asleep without next-day drowsiness (meta-analysis, PMID: 38442785)",
          sleepQuality: "Significant improvement in sleep quality scores across 19 articles, 897 participants",
          populations: ["Stressed adults", "Anxiety-related insomnia", "Children with ADHD"]
        },
        dosageRange: "100-400mg daily (200mg typical for sleep)",
        keyEvidence: {
          title: "L-theanine effects on sleep outcomes: systematic review and meta-analysis",
          authors: "Baba Y, et al.",
          journal: "Sleep Medicine Reviews",
          year: 2024,
          pmid: "38442785",
          doi: "10.1016/j.smrv.2024.101745",
          studyType: "Meta-analysis",
          sampleSize: "19 articles, 897 participants"
        },
        safetyProfile: "Very Low risk. FDA GRAS status up to 250mg/serving. No serious adverse events in 28-day studies at 400mg/day. Safe in pediatric populations (PMID: 22214254)",
        guideNotes: "Promotes relaxation without sedation via alpha wave enhancement. Particularly useful for stress-related sleep difficulty. Well-tolerated in children (ADHD sleep study). Synergistic with caffeine for daytime focus."
      },
      {
        supplementId: 79,
        name: "Passionflower",
        evidenceTier: 2,
        relevanceScore: 78,
        mechanismMatch: ["GABA-A receptor positive allosteric modulation", "MAO-A inhibition", "HPA axis modulation"],
        sleepSpecificEffects: {
          sleepOnset: "Improved sleep quality comparable to oxazepam in GAD patients",
          sleepQuality: "Moderate improvements in polysomnographic measures",
          populations: ["Generalized anxiety with insomnia", "Pre-operative anxiety", "Adults with sleep difficulty"]
        },
        dosageRange: "250-800mg daily (extract), 4-8g dried herb",
        keyEvidence: {
          title: "GABA-A receptor modulation and GABAergic activity enhancement",
          authors: "Multiple studies",
          journal: "Various",
          year: 2018,
          studyType: "In Vitro + Animal + Human RCT",
          sampleSize: "Multiple trials"
        },
        safetyProfile: "Low risk. Traditional use supports safety. Limited long-term data.",
        guideNotes: "Best suited for anxiety-driven insomnia. Traditional herbal remedy with moderate modern evidence. Often combined with other sleep herbs (valerian, lemon balm)."
      },
      {
        supplementId: 34,
        name: "5-HTP",
        evidenceTier: 3,
        relevanceScore: 72,
        mechanismMatch: ["Serotonin precursor (bypasses rate-limiting tryptophan hydroxylase)", "Blood-brain barrier crossing", "Serotonin-to-melatonin conversion"],
        sleepSpecificEffects: {
          sleepOnset: "Promotes sleep via serotonin-melatonin pathway conversion",
          sleepQuality: "Limited but promising evidence for sleep regulation through serotonin synthesis enhancement",
          populations: ["Depression-related sleep issues", "Mood-related insomnia"]
        },
        dosageRange: "50-300mg daily",
        keyEvidence: {
          title: "5-Hydroxytryptophan: a clinically-effective serotonin precursor",
          authors: "Birdsall TC",
          journal: "Alternative Medicine Review",
          year: 1998,
          pmid: "9727088",
          studyType: "Comprehensive Review"
        },
        safetyProfile: "Moderate caution. Do not combine with SSRIs/MAOIs (serotonin syndrome risk). GI side effects possible. (PMID: 16023729)",
        guideNotes: "Acts upstream by increasing serotonin availability for melatonin conversion. Best for mood-related sleep difficulty. Critical drug interaction with antidepressants."
      },
      {
        supplementId: 40,
        name: "GABA",
        evidenceTier: 3,
        relevanceScore: 68,
        mechanismMatch: ["Direct GABA receptor activation", "Stress response regulation / cortisol reduction", "Sleep quality enhancement"],
        sleepSpecificEffects: {
          sleepOnset: "Reduced sleep latency in some studies (PMID: 27826435)",
          sleepQuality: "Sleep quality enhancement through GABAergic neurotransmission (PMID: 12531146)",
          populations: ["Stressed individuals", "Sleep-disturbed individuals"]
        },
        dosageRange: "250-750mg daily",
        keyEvidence: {
          title: "GABA and sleep: molecular, functional and clinical aspects",
          authors: "Gottesmann C",
          journal: "Sleep Medicine Reviews",
          year: 2002,
          pmid: "12531146",
          doi: "10.1053/smrv.2001.0230",
          studyType: "Mechanistic Review"
        },
        safetyProfile: "Low risk. Well-established safety as neurotransmitter. Limited evidence for oral bioavailability crossing BBB.",
        guideNotes: "Core sleep neurotransmitter but debate exists on whether oral GABA effectively crosses the blood-brain barrier. Biosynthetic (fermented) GABA may have better absorption. Often more effective in combination."
      },
      {
        supplementId: 3,
        name: "Ashwagandha",
        evidenceTier: 2,
        relevanceScore: 75,
        mechanismMatch: ["HPA axis modulation / cortisol reduction", "GABAergic neurotransmitter enhancement", "Withanolide-mediated neuroendocrine regulation"],
        sleepSpecificEffects: {
          sleepOnset: "Improved sleep onset via stress reduction and cortisol lowering",
          sleepQuality: "Significant cortisol reduction MD = -2.58 (meta-analysis of 8 RCTs, PMID: 39348746). Sleep improvement in stressed adults.",
          populations: ["Stressed adults", "Anxiety-related insomnia", "Individuals with elevated cortisol"]
        },
        dosageRange: "300-600mg daily (standardized extract)",
        keyEvidence: {
          title: "Effect of Ashwagandha extract on sleep: systematic review and meta-analysis",
          authors: "Cheah KL, et al.",
          journal: "PLOS ONE",
          year: 2021,
          pmid: "34559859",
          studyType: "Systematic Review and Meta-analysis"
        },
        safetyProfile: "Low risk. Well-tolerated in clinical trials. Thyroid interaction possible — monitor in thyroid conditions.",
        guideNotes: "Primarily an adaptogen that improves sleep indirectly by reducing cortisol and stress. Best for stress-driven insomnia rather than primary sleep disorders. KSM-66 and Sensoril are well-studied standardized extracts."
      }
    ],
    tierDistribution: {
      tier1: 2,
      tier2: 3,
      tier3: 2,
      tier4: 0
    },
    lastReviewed: "2026-03-04",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "25 minutes",
      totalCitationsReferenced: 126,
      pdfAvailable: false,
      seoKeywords: ["supplements for sleep", "melatonin evidence", "magnesium sleep", "natural sleep aids research", "evidence-based sleep supplements"]
    }
  },

  {
    id: "anxiety",
    name: "Anxiety & Stress Management",
    slug: "anxiety",
    description: "Evidence-based supplements studied for anxiety reduction, stress resilience, and nervous system calming. Organized by strength of clinical evidence.",
    category: "Neurological & Mental Health",
    relatedHealthDomains: ["Anxiety Reduction", "Stress Resilience"],
    physiologyOverview: {
      systems: ["GABAergic system", "HPA axis", "Serotonergic pathway", "Adrenergic system"],
      keyNeurotransmitters: ["GABA", "Serotonin", "Cortisol", "Norepinephrine"],
      summary: "Anxiety involves dysregulation of the HPA stress axis, reduced GABAergic inhibition, serotonin imbalance, and heightened sympathetic nervous system activity. Supplements target anxiolytic pathways through neurotransmitter modulation and cortisol regulation."
    },
    supplements: [
      { supplementId: 3, name: "Ashwagandha", evidenceTier: 2, relevanceScore: 95 },
      { supplementId: 9, name: "L-Theanine", evidenceTier: 2, relevanceScore: 90 },
      { supplementId: 6, name: "Magnesium", evidenceTier: 1, relevanceScore: 85 },
      { supplementId: 40, name: "GABA", evidenceTier: 3, relevanceScore: 80 },
      { supplementId: 79, name: "Passionflower", evidenceTier: 2, relevanceScore: 82 },
      { supplementId: 36, name: "Inositol", evidenceTier: 2, relevanceScore: 78 },
      { supplementId: 59, name: "Holy Basil", evidenceTier: 2, relevanceScore: 72 },
      { supplementId: 82, name: "Kanna", evidenceTier: 3, relevanceScore: 65 }
    ],
    tierDistribution: { tier1: 1, tier2: 5, tier3: 2, tier4: 0 },
    lastReviewed: "2026-03-04",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "30 minutes",
      pdfAvailable: false,
      seoKeywords: ["supplements for anxiety", "ashwagandha stress", "natural anxiety relief evidence", "l-theanine anxiety research"]
    }
  },

  {
    id: "cognitive-performance",
    name: "Cognitive Performance & Memory",
    slug: "cognitive-performance",
    description: "Evidence-based supplements studied for memory enhancement, focus, attention, and neuroprotection. Ranked by strength of human clinical evidence.",
    category: "Neurological & Mental Health",
    relatedHealthDomains: ["Memory Enhancement", "Focus & Attention", "Neuroprotection"],
    physiologyOverview: {
      systems: ["Cholinergic system", "Dopaminergic pathway", "BDNF signaling", "Cerebrovascular"],
      keyNeurotransmitters: ["Acetylcholine", "Dopamine", "BDNF", "NGF"],
      summary: "Cognitive performance depends on cholinergic neurotransmission, dopamine-mediated motivation and focus, neurotrophic factor signaling for neuroplasticity, and cerebral blood flow for nutrient delivery."
    },
    supplements: [
      { supplementId: 1, name: "Bacopa monnieri", evidenceTier: 1, relevanceScore: 95 },
      { supplementId: 11, name: "Lion's Mane Mushroom", evidenceTier: 2, relevanceScore: 90 },
      { supplementId: 19, name: "Alpha-GPC", evidenceTier: 2, relevanceScore: 85 },
      { supplementId: 46, name: "Citicoline", evidenceTier: 2, relevanceScore: 85 },
      { supplementId: 2, name: "Creatine", evidenceTier: 2, relevanceScore: 80 },
      { supplementId: 27, name: "Caffeine", evidenceTier: 1, relevanceScore: 88 }
    ],
    tierDistribution: { tier1: 2, tier2: 4, tier3: 0, tier4: 0 },
    lastReviewed: "2026-03-04",
    guideMetadata: {
      priceTarget: 39,
      estimatedReadTime: "30 minutes",
      pdfAvailable: false,
      seoKeywords: ["nootropics evidence", "cognitive supplements research", "memory supplements", "bacopa monnieri studies"]
    }
  },

  {
    id: "longevity",
    name: "Longevity & Anti-Aging",
    slug: "longevity",
    description: "Evidence-based supplements studied for cellular aging, oxidative stress reduction, mitochondrial function, and age-related decline prevention.",
    category: "Systemic Health",
    relatedHealthDomains: ["Anti-Aging", "Neuroprotection", "Antioxidant Support"],
    physiologyOverview: {
      systems: ["Mitochondrial function", "NAD+ metabolism", "Senescence pathways", "Antioxidant defense"],
      keyNeurotransmitters: ["NAD+", "Sirtuins", "AMPK", "mTOR"],
      summary: "Aging involves mitochondrial dysfunction, NAD+ depletion, cellular senescence accumulation, and oxidative damage. Longevity supplements target these fundamental aging mechanisms."
    },
    supplements: [
      { supplementId: 38, name: "NAD+ Precursors (NMN/NR)", evidenceTier: 2, relevanceScore: 92 },
      { supplementId: 18, name: "CoQ10", evidenceTier: 1, relevanceScore: 88 },
      { supplementId: 17, name: "Quercetin", evidenceTier: 2, relevanceScore: 82 },
      { supplementId: 44, name: "Resveratrol", evidenceTier: 2, relevanceScore: 78 },
      { supplementId: 39, name: "PQQ", evidenceTier: 3, relevanceScore: 72 }
    ],
    tierDistribution: { tier1: 1, tier2: 3, tier3: 1, tier4: 0 },
    lastReviewed: "2026-03-04",
    guideMetadata: {
      priceTarget: 39,
      estimatedReadTime: "25 minutes",
      pdfAvailable: false,
      seoKeywords: ["longevity supplements evidence", "NAD+ supplements", "CoQ10 aging research", "anti-aging supplements"]
    }
  },

  {
    id: "metabolic-health",
    name: "Metabolic Health & Blood Sugar",
    slug: "metabolic-health",
    description: "Evidence-based supplements studied for blood sugar control, insulin sensitivity, metabolic syndrome markers, and weight management support.",
    category: "Metabolic & Endocrine",
    relatedHealthDomains: ["Blood Sugar Control", "Metabolic Support"],
    physiologyOverview: {
      systems: ["Insulin signaling", "AMPK pathway", "Glucose transporter regulation", "Lipid metabolism"],
      keyNeurotransmitters: ["Insulin", "AMPK", "GLUT4", "Adiponectin"],
      summary: "Metabolic health involves insulin sensitivity, glucose uptake efficiency, AMPK-mediated energy sensing, and lipid metabolism regulation."
    },
    supplements: [
      { supplementId: 53, name: "Berberine", evidenceTier: 1, relevanceScore: 95 },
      { supplementId: 54, name: "Chromium", evidenceTier: 2, relevanceScore: 82 },
      { supplementId: 33, name: "Alpha-Lipoic Acid", evidenceTier: 2, relevanceScore: 85 },
      { supplementId: 36, name: "Inositol", evidenceTier: 2, relevanceScore: 80 },
      { supplementId: 56, name: "Bitter Melon", evidenceTier: 3, relevanceScore: 70 },
      { supplementId: 57, name: "Gymnema Sylvestre", evidenceTier: 3, relevanceScore: 72 },
      { supplementId: 58, name: "Fenugreek", evidenceTier: 2, relevanceScore: 78 },
      { supplementId: 60, name: "Cinnamon Extract", evidenceTier: 2, relevanceScore: 75 }
    ],
    tierDistribution: { tier1: 1, tier2: 5, tier3: 2, tier4: 0 },
    lastReviewed: "2026-03-04",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "25 minutes",
      pdfAvailable: false,
      seoKeywords: ["berberine blood sugar", "metabolic supplements", "supplements for insulin resistance", "blood sugar control evidence"]
    }
  },

  {
    id: "exercise-performance",
    name: "Exercise Performance & Recovery",
    slug: "exercise-performance",
    description: "Evidence-based supplements studied for physical performance, endurance, strength, and exercise recovery.",
    category: "Physical Performance",
    relatedHealthDomains: ["Protein Synthesis & Recovery", "Energy & Vitality"],
    physiologyOverview: {
      systems: ["ATP-phosphocreatine system", "Carnosine buffering", "Mitochondrial respiration", "Muscle protein synthesis"],
      keyNeurotransmitters: ["ATP", "Creatine phosphate", "Carnosine", "mTOR"],
      summary: "Exercise performance depends on energy substrate availability, acid-base buffering capacity, mitochondrial efficiency, and post-exercise recovery signaling."
    },
    supplements: [
      { supplementId: 2, name: "Creatine", evidenceTier: 1, relevanceScore: 98 },
      { supplementId: 27, name: "Caffeine", evidenceTier: 1, relevanceScore: 92 },
      { supplementId: 13, name: "Acetyl-L-Carnitine", evidenceTier: 2, relevanceScore: 78 },
      { supplementId: 52, name: "Whey Protein", evidenceTier: 1, relevanceScore: 90 }
    ],
    tierDistribution: { tier1: 3, tier2: 1, tier3: 0, tier4: 0 },
    lastReviewed: "2026-03-04",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "20 minutes",
      pdfAvailable: false,
      seoKeywords: ["creatine evidence", "performance supplements research", "exercise supplements", "caffeine performance"]
    }
  },

  {
    id: "inflammation",
    name: "Inflammation & Joint Health",
    slug: "inflammation",
    description: "Evidence-based supplements studied for inflammatory marker reduction, joint health support, and chronic inflammation management.",
    category: "Systemic Health",
    relatedHealthDomains: ["Anti-inflammatory", "Joint Health & Mobility"],
    physiologyOverview: {
      systems: ["NF-κB pathway", "COX-2/LOX enzymes", "Cytokine signaling", "Prostaglandin synthesis"],
      keyNeurotransmitters: ["TNF-α", "IL-6", "CRP", "Prostaglandins"],
      summary: "Chronic inflammation involves sustained NF-κB activation, elevated pro-inflammatory cytokines, COX-2 overexpression, and tissue-level inflammatory cascades affecting joints, cardiovascular, and metabolic health."
    },
    supplements: [
      { supplementId: 4, name: "Turmeric/Curcumin", evidenceTier: 1, relevanceScore: 95 },
      { supplementId: 5, name: "Omega-3 Fatty Acids", evidenceTier: 1, relevanceScore: 92 },
      { supplementId: 42, name: "Boswellia", evidenceTier: 2, relevanceScore: 82 },
      { supplementId: 43, name: "Glucosamine", evidenceTier: 2, relevanceScore: 80 },
      { supplementId: 48, name: "Ginger", evidenceTier: 2, relevanceScore: 78 }
    ],
    tierDistribution: { tier1: 2, tier2: 3, tier3: 0, tier4: 0 },
    lastReviewed: "2026-03-04",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "25 minutes",
      pdfAvailable: false,
      seoKeywords: ["curcumin inflammation evidence", "anti-inflammatory supplements", "joint health supplements", "omega-3 inflammation research"]
    }
  },

  {
    id: "mood-depression",
    name: "Mood & Depression Support",
    slug: "mood-depression",
    description: "Evidence-based supplements studied for mood enhancement, depressive symptom reduction, and emotional well-being. Ranked by strength of clinical evidence from systematic reviews and randomized controlled trials.",
    category: "Neurological & Mental Health",
    relatedHealthDomains: ["Mood Enhancement", "Depression Support", "Emotional Well-Being"],
    physiologyOverview: {
      systems: ["Serotonergic system", "Dopaminergic pathway", "HPA axis", "Neuroinflammatory signaling"],
      keyNeurotransmitters: ["Serotonin", "Dopamine", "BDNF", "Cortisol"],
      summary: "Depression involves dysregulation of monoamine neurotransmitters (serotonin, dopamine, norepinephrine), HPA axis hyperactivity with elevated cortisol, reduced BDNF-mediated neuroplasticity, and neuroinflammatory processes. Supplements in this category target one or more of these pathways to support mood regulation."
    },
    supplements: [
      {
        supplementId: 3,
        name: "Ashwagandha",
        evidenceTier: 1,
        relevanceScore: 92,
        mechanismMatch: ["HPA axis modulation / cortisol reduction", "Serotonergic pathway support", "GABAergic neurotransmitter enhancement"],
        dosageRange: "300-600mg daily (standardized extract, KSM-66 or Sensoril)",
        keyEvidence: {
          title: "Efficacy of Ashwagandha on stress and anxiety: systematic review and meta-analysis",
          authors: "Salve J, Pate S, Debnath K, Langade D",
          journal: "Medicine",
          year: 2023,
          pmid: "39348746",
          studyType: "Meta-analysis",
          sampleSize: "8 RCTs"
        },
        safetyProfile: "Low risk. Well-tolerated in clinical trials. Monitor thyroid function in individuals with thyroid conditions.",
        guideNotes: "Strong evidence for cortisol reduction and mood improvement in stressed populations. Both KSM-66 and Sensoril extracts well-studied."
      },
      {
        supplementId: 5,
        name: "Omega-3 Fatty Acids",
        evidenceTier: 1,
        relevanceScore: 90,
        mechanismMatch: ["Anti-neuroinflammatory effects", "Cell membrane fluidity enhancement", "Serotonin receptor modulation"],
        dosageRange: "1-2g EPA+DHA daily (higher EPA ratio preferred for mood)",
        keyEvidence: {
          title: "Omega-3 polyunsaturated fatty acids for the treatment of depressive disorders",
          authors: "Appleton KM, et al.",
          journal: "Cochrane Database of Systematic Reviews",
          year: 2021,
          studyType: "Cochrane Meta-analysis",
          sampleSize: "34 RCTs, 1924 participants"
        },
        safetyProfile: "Very low risk. GI effects at high doses. Fish oil formulations may have heavy metal concerns; choose purified products.",
        guideNotes: "EPA-dominant formulations (>60% EPA) show strongest antidepressant effects. Effective as adjunct to standard antidepressant therapy."
      },
      {
        supplementId: 6,
        name: "Magnesium",
        evidenceTier: 2,
        relevanceScore: 85,
        mechanismMatch: ["NMDA receptor regulation", "Serotonin pathway cofactor", "HPA axis modulation"],
        dosageRange: "200-400mg daily (elemental magnesium, glycinate or threonate preferred)",
        keyEvidence: {
          title: "Magnesium and depression: a systematic review",
          authors: "Tarleton EK, et al.",
          journal: "Nutrients",
          year: 2017,
          studyType: "Systematic Review",
          sampleSize: "Multiple RCTs"
        },
        safetyProfile: "Low risk. GI effects with oxide form. Chelated forms preferred for tolerability.",
        guideNotes: "Deficiency common (50%+ of US adults) and associated with depression. Magnesium glycinate preferred for mood effects. Rapid onset in some studies (2 weeks)."
      },
      {
        supplementId: 34,
        name: "5-HTP",
        evidenceTier: 2,
        relevanceScore: 80,
        mechanismMatch: ["Direct serotonin precursor", "Bypasses rate-limiting tryptophan hydroxylase", "Blood-brain barrier crossing"],
        dosageRange: "50-300mg daily",
        keyEvidence: {
          title: "5-Hydroxytryptophan: a clinically-effective serotonin precursor",
          authors: "Birdsall TC",
          journal: "Alternative Medicine Review",
          year: 1998,
          pmid: "9727088",
          studyType: "Comprehensive Review"
        },
        safetyProfile: "Moderate caution. Contraindicated with SSRIs/MAOIs (serotonin syndrome risk). GI side effects possible.",
        guideNotes: "Direct serotonin precursor with faster onset than tryptophan. Critical drug interaction with antidepressants must be highlighted."
      },
      {
        supplementId: 10,
        name: "Rhodiola rosea",
        evidenceTier: 2,
        relevanceScore: 78,
        mechanismMatch: ["Monoamine oxidase inhibition", "Cortisol regulation", "Adaptogenic stress response modulation"],
        dosageRange: "200-600mg daily (standardized to 3% rosavins, 1% salidroside)",
        keyEvidence: {
          title: "Rhodiola rosea for physical and mental fatigue: systematic review",
          authors: "Ishaque S, et al.",
          journal: "BMC Complementary and Alternative Medicine",
          year: 2012,
          studyType: "Systematic Review"
        },
        safetyProfile: "Low risk. Well-tolerated in clinical trials. May cause insomnia if taken late in the day.",
        guideNotes: "Adaptogen with mild antidepressant-like effects. Best for stress-related mood disturbance and fatigue-associated low mood."
      },
      {
        supplementId: 36,
        name: "Inositol",
        evidenceTier: 2,
        relevanceScore: 76,
        mechanismMatch: ["Serotonin receptor second messenger system", "Phosphatidylinositol signaling", "Insulin signal transduction"],
        dosageRange: "12-18g daily for mood effects",
        keyEvidence: {
          title: "Inositol treatment of depression and anxiety disorders",
          authors: "Levine J",
          journal: "CNS Spectrums",
          year: 2014,
          studyType: "Clinical Review"
        },
        safetyProfile: "Low risk. GI effects at high doses. Well-tolerated in most populations.",
        guideNotes: "Requires high doses (12-18g) for mood effects. Particularly studied for panic disorder and OCD symptoms."
      },
      {
        supplementId: 22,
        name: "Vitamin B6",
        evidenceTier: 3,
        relevanceScore: 72,
        mechanismMatch: ["Cofactor for serotonin synthesis", "Cofactor for dopamine synthesis", "GABA production support"],
        dosageRange: "25-100mg daily (as pyridoxine or P5P)",
        keyEvidence: {
          title: "B vitamins and the brain: mechanisms, dose and efficacy",
          authors: "Kennedy DO",
          journal: "Nutrients",
          year: 2016,
          studyType: "Mechanistic Review"
        },
        safetyProfile: "Low risk at recommended doses. Peripheral neuropathy risk above 200mg/day long-term.",
        guideNotes: "Essential cofactor for neurotransmitter synthesis. Most effective when deficiency is present. Often combined with B12 and folate."
      },
      {
        supplementId: 7,
        name: "Vitamin D3",
        evidenceTier: 2,
        relevanceScore: 82,
        mechanismMatch: ["Vitamin D receptor in brain regions", "Serotonin gene expression regulation", "Neuroinflammation modulation"],
        dosageRange: "1000-4000 IU daily (based on serum levels)",
        keyEvidence: {
          title: "Vitamin D and depression: a systematic review and meta-analysis",
          authors: "Shaffer JA, et al.",
          journal: "Psychosomatic Medicine",
          year: 2014,
          studyType: "Meta-analysis"
        },
        safetyProfile: "Low risk at recommended doses. Monitor serum levels. Avoid exceeding 4000 IU/day without medical supervision.",
        guideNotes: "Deficiency strongly associated with depression. Supplementation most effective when baseline levels are low (<30 ng/mL)."
      }
    ],
    tierDistribution: {
      tier1: 2,
      tier2: 5,
      tier3: 1,
      tier4: 0
    },
    lastReviewed: "2026-03-10",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "30 minutes",
      totalCitationsReferenced: 95,
      pdfAvailable: false,
      seoKeywords: ["supplements for depression", "mood support supplements", "serotonin supplements evidence", "natural antidepressant research", "ashwagandha mood studies"]
    }
  },

  {
    id: "memory-aging",
    name: "Memory & Cognitive Aging",
    slug: "memory-aging",
    description: "Evidence-based supplements studied for age-related memory decline, neuroprotection, and cognitive preservation in older adults. Ranked by clinical trial evidence strength.",
    category: "Neurological & Mental Health",
    relatedHealthDomains: ["Memory Enhancement", "Neuroprotection", "Cognitive Aging"],
    physiologyOverview: {
      systems: ["Cholinergic system", "Neurotrophic signaling (BDNF/NGF)", "Cerebrovascular regulation", "Antioxidant defense"],
      keyNeurotransmitters: ["Acetylcholine", "BDNF", "NGF", "Glutamate"],
      summary: "Cognitive aging involves progressive cholinergic decline, reduced neurotrophic factor expression, cerebrovascular insufficiency, oxidative stress accumulation, and synaptic loss. Supplements target neuroprotection, cholinergic support, and cerebral blood flow enhancement."
    },
    supplements: [
      { supplementId: 1, name: "Bacopa monnieri", evidenceTier: 1, relevanceScore: 95 },
      { supplementId: 46, name: "Citicoline", evidenceTier: 2, relevanceScore: 90 },
      { supplementId: 12, name: "Phosphatidylserine", evidenceTier: 2, relevanceScore: 88 },
      { supplementId: 11, name: "Lion's Mane Mushroom", evidenceTier: 2, relevanceScore: 85 },
      { supplementId: 5, name: "Omega-3 Fatty Acids", evidenceTier: 1, relevanceScore: 87 },
      { supplementId: 14, name: "Ginkgo Biloba", evidenceTier: 2, relevanceScore: 82 },
      { supplementId: 19, name: "Alpha-GPC", evidenceTier: 2, relevanceScore: 80 },
      { supplementId: 55, name: "Huperzine A", evidenceTier: 3, relevanceScore: 72 }
    ],
    tierDistribution: { tier1: 2, tier2: 5, tier3: 1, tier4: 0 },
    lastReviewed: "2026-03-10",
    guideMetadata: {
      priceTarget: 39,
      estimatedReadTime: "30 minutes",
      pdfAvailable: false,
      seoKeywords: ["memory supplements for aging", "cognitive aging supplements", "bacopa memory evidence", "neuroprotective supplements", "brain health aging"]
    }
  },

  {
    id: "muscle-strength",
    name: "Muscle Strength & Lean Mass",
    slug: "muscle-strength",
    description: "Evidence-based supplements studied for muscle strength, hypertrophy, power output, and lean body mass improvement. Ranked by clinical trial evidence from sports science and exercise physiology research.",
    category: "Physical Performance",
    relatedHealthDomains: ["Strength & Power", "Muscle Hypertrophy", "Body Composition"],
    physiologyOverview: {
      systems: ["ATP-phosphocreatine system", "mTOR/muscle protein synthesis", "Androgen signaling", "Neuromuscular activation"],
      keyNeurotransmitters: ["ATP", "Creatine phosphate", "Testosterone", "IGF-1"],
      summary: "Muscle strength depends on ATP-phosphocreatine energy availability, mTOR-mediated protein synthesis signaling, androgen receptor activation, neuromuscular junction efficiency, and satellite cell proliferation. Supplements target energy substrate availability, anabolic signaling, and recovery capacity."
    },
    supplements: [
      { supplementId: 2, name: "Creatine", evidenceTier: 1, relevanceScore: 98 },
      { supplementId: 52, name: "Whey Protein", evidenceTier: 1, relevanceScore: 95 },
      { supplementId: 92, name: "HMB (β-Hydroxy β-Methylbutyrate)", evidenceTier: 2, relevanceScore: 82 },
      { supplementId: 90, name: "Beta-Alanine", evidenceTier: 1, relevanceScore: 88 },
      { supplementId: 93, name: "Betaine", evidenceTier: 2, relevanceScore: 75 },
      { supplementId: 27, name: "Caffeine", evidenceTier: 1, relevanceScore: 85 },
      { supplementId: 91, name: "Citrulline Malate", evidenceTier: 2, relevanceScore: 78 },
      { supplementId: 19, name: "Alpha-GPC", evidenceTier: 3, relevanceScore: 68 }
    ],
    tierDistribution: { tier1: 4, tier2: 3, tier3: 1, tier4: 0 },
    lastReviewed: "2026-03-10",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "25 minutes",
      pdfAvailable: false,
      seoKeywords: ["muscle building supplements evidence", "creatine strength studies", "HMB muscle research", "beta-alanine performance", "strength training supplements"]
    }
  },

  {
    id: "recovery-soreness",
    name: "Exercise Recovery & Soreness",
    slug: "recovery-soreness",
    description: "Evidence-based supplements studied for post-exercise recovery, delayed onset muscle soreness (DOMS) reduction, and exercise-induced inflammation management. Ranked by clinical evidence from sports medicine research.",
    category: "Physical Performance",
    relatedHealthDomains: ["Exercise Recovery", "Muscle Repair", "Anti-inflammatory"],
    physiologyOverview: {
      systems: ["Inflammatory cascade (NF-κB, COX-2)", "Muscle protein synthesis (mTOR)", "Antioxidant defense", "Neuromuscular repair"],
      keyNeurotransmitters: ["IL-6", "TNF-α", "CRP", "Creatine kinase"],
      summary: "Exercise recovery involves resolution of exercise-induced inflammation (elevated CK, IL-6, TNF-α), restoration of muscle glycogen, repair of micro-damaged myofibrils through satellite cell activation, and antioxidant defense against exercise-generated reactive oxygen species."
    },
    supplements: [
      { supplementId: 5, name: "Omega-3 Fatty Acids", evidenceTier: 1, relevanceScore: 90 },
      { supplementId: 4, name: "Turmeric/Curcumin", evidenceTier: 1, relevanceScore: 88 },
      { supplementId: 39, name: "Taurine", evidenceTier: 2, relevanceScore: 82 },
      { supplementId: 29, name: "MSM", evidenceTier: 2, relevanceScore: 78 },
      { supplementId: 45, name: "Astaxanthin", evidenceTier: 2, relevanceScore: 75 },
      { supplementId: 91, name: "Citrulline Malate", evidenceTier: 2, relevanceScore: 72 },
      { supplementId: 18, name: "CoQ10", evidenceTier: 2, relevanceScore: 70 },
      { supplementId: 10, name: "Rhodiola rosea", evidenceTier: 3, relevanceScore: 68 }
    ],
    tierDistribution: { tier1: 2, tier2: 5, tier3: 1, tier4: 0 },
    lastReviewed: "2026-03-10",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "25 minutes",
      pdfAvailable: false,
      seoKeywords: ["recovery supplements evidence", "DOMS supplements", "curcumin exercise recovery", "omega-3 muscle soreness", "post-workout supplements research"]
    }
  },

  {
    id: "gut-brain",
    name: "Gut-Brain Axis",
    slug: "gut-brain",
    description: "Evidence-based supplements studied for gut-brain communication, digestive health, microbiome support, and the bidirectional signaling between the enteric and central nervous systems.",
    category: "Systemic Health",
    relatedHealthDomains: ["Digestive Health", "Microbiome Support", "Gut-Brain Communication"],
    physiologyOverview: {
      systems: ["Enteric nervous system", "Vagus nerve signaling", "Microbiome-immune axis", "Intestinal barrier function"],
      keyNeurotransmitters: ["Serotonin (90% gut-produced)", "GABA", "Short-chain fatty acids", "Vagal afferents"],
      summary: "The gut-brain axis involves bidirectional communication through vagus nerve signaling, microbiome-derived metabolites (SCFAs, neurotransmitter precursors), intestinal barrier integrity (preventing LPS translocation), and enteric nervous system neurotransmission. Over 90% of serotonin is produced in the gut, making digestive health critical for mood and cognition."
    },
    supplements: [
      { supplementId: 48, name: "Ginger", evidenceTier: 2, relevanceScore: 85 },
      { supplementId: 65, name: "Milk Thistle", evidenceTier: 2, relevanceScore: 80 },
      { supplementId: 61, name: "Schisandra Berry", evidenceTier: 3, relevanceScore: 72 },
      { supplementId: 53, name: "Spirulina", evidenceTier: 2, relevanceScore: 78 },
      { supplementId: 54, name: "Chlorella", evidenceTier: 2, relevanceScore: 75 },
      { supplementId: 5, name: "Omega-3 Fatty Acids", evidenceTier: 1, relevanceScore: 88 },
      { supplementId: 7, name: "Vitamin D3", evidenceTier: 2, relevanceScore: 82 },
      { supplementId: 43, name: "Choline", evidenceTier: 2, relevanceScore: 70 }
    ],
    tierDistribution: { tier1: 1, tier2: 6, tier3: 1, tier4: 0 },
    lastReviewed: "2026-03-10",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "25 minutes",
      pdfAvailable: false,
      seoKeywords: ["gut-brain axis supplements", "microbiome supplements evidence", "digestive health supplements", "gut-brain connection research", "probiotics brain health"]
    }
  },

  {
    id: "stress-resilience",
    name: "Stress Resilience & Cortisol",
    slug: "stress-resilience",
    description: "Evidence-based supplements studied for stress resilience, cortisol regulation, HPA axis modulation, and adaptogenic protection against chronic stress. Ranked by clinical evidence from human trials.",
    category: "Neurological & Mental Health",
    relatedHealthDomains: ["Stress Resilience", "Cortisol Regulation", "Adaptogenic Support"],
    physiologyOverview: {
      systems: ["HPA axis", "Sympathetic-adrenal-medullary system", "GABAergic inhibition", "Cortisol feedback regulation"],
      keyNeurotransmitters: ["Cortisol", "ACTH", "CRH", "GABA", "Norepinephrine"],
      summary: "Chronic stress involves sustained HPA axis activation with elevated CRH, ACTH, and cortisol, sympathetic nervous system overdrive, reduced GABAergic inhibition, and eventual adrenal dysregulation. Adaptogens and stress-modulating supplements normalize the stress response by supporting cortisol feedback mechanisms and enhancing stress resilience."
    },
    supplements: [
      {
        supplementId: 3,
        name: "Ashwagandha",
        evidenceTier: 1,
        relevanceScore: 96,
        mechanismMatch: ["HPA axis modulation", "Cortisol reduction (MD = -2.58)", "GABAergic enhancement", "Withanolide-mediated neuroendocrine regulation"],
        dosageRange: "300-600mg daily (standardized extract)",
        keyEvidence: {
          title: "Adaptogenic and anxiolytic effects of ashwagandha: systematic review and meta-analysis",
          authors: "Salve J, et al.",
          journal: "Medicine",
          year: 2023,
          pmid: "39348746",
          studyType: "Meta-analysis",
          sampleSize: "8 RCTs"
        },
        safetyProfile: "Low risk. Well-tolerated. Monitor thyroid function.",
        guideNotes: "Strongest adaptogen evidence for cortisol reduction. Both KSM-66 and Sensoril well-studied. Primary recommendation for chronic stress."
      },
      {
        supplementId: 10,
        name: "Rhodiola rosea",
        evidenceTier: 2,
        relevanceScore: 90,
        mechanismMatch: ["Monoamine oxidase inhibition", "Cortisol rhythm normalization", "Stress protein (HSP70) induction"],
        dosageRange: "200-600mg daily (standardized to 3% rosavins, 1% salidroside)",
        keyEvidence: {
          title: "Rhodiola rosea for stress-related fatigue: systematic review",
          authors: "Ishaque S, et al.",
          journal: "BMC Complementary and Alternative Medicine",
          year: 2012,
          studyType: "Systematic Review"
        },
        safetyProfile: "Low risk. Well-tolerated. May cause insomnia if taken late in the day.",
        guideNotes: "Adaptogen with rapid onset (days to weeks). Best for stress-related fatigue and burnout. Complementary to ashwagandha."
      },
      { supplementId: 12, name: "Phosphatidylserine", evidenceTier: 2, relevanceScore: 82 },
      { supplementId: 6, name: "Magnesium", evidenceTier: 1, relevanceScore: 88 },
      { supplementId: 59, name: "Holy Basil", evidenceTier: 2, relevanceScore: 78 },
      { supplementId: 9, name: "L-Theanine", evidenceTier: 2, relevanceScore: 85 },
      { supplementId: 40, name: "GABA", evidenceTier: 3, relevanceScore: 72 },
      { supplementId: 51, name: "Reishi Mushroom", evidenceTier: 3, relevanceScore: 68 }
    ],
    tierDistribution: {
      tier1: 2,
      tier2: 4,
      tier3: 2,
      tier4: 0
    },
    lastReviewed: "2026-03-10",
    guideMetadata: {
      priceTarget: 29,
      estimatedReadTime: "25 minutes",
      totalCitationsReferenced: 85,
      pdfAvailable: false,
      seoKeywords: ["adaptogen supplements evidence", "cortisol supplements", "stress resilience supplements", "ashwagandha cortisol studies", "rhodiola stress research"]
    }
  }
];

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = problemDatabase;
}

// Make available to frontend
if (typeof window !== 'undefined') {
  window.problemDatabase = problemDatabase;
}
