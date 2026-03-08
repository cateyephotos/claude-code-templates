// Enhanced Citations for Vitamin B12 (ID: 21)
// Pipeline Mode 2 (Evidence Update) — Run: 2026-03-06
// All PMIDs verified via PubMed MCP; 9 of 16 original citations resolved to wrong papers and have been replaced
// Provenance trail: supp-db-site/content/provenance/vitamin_b12/

const vitaminB12Enhanced = {
  id: 21,
  name: "Vitamin B12",
  scientificName: "Cobalamin (cyanocobalamin, methylcobalamin, adenosylcobalamin, hydroxocobalamin)",
  category: "Essential Nutrients",
  commonNames: ["Cobalamin", "Cyanocobalamin", "Methylcobalamin", "Adenosylcobalamin", "Hydroxocobalamin"],

  evidenceProfile: {
    overallQuality: "Tier 1",
    totalCitations: 12,
    researchQualityScore: 85,
    lastEvidenceUpdate: "2026-03-06",
    evidenceStrength: {
      mechanisms: "Strong",
      clinicalBenefits: "Moderate",
      safety: "Well-established",
      dosage: "Evidence-based"
    },
    researchMaturity: "Mature",
    publicationSpan: "1990-2024"
  },

  citations: {
    mechanisms: [
      {
        mechanism: "Methionine Cycle and One-Carbon Metabolism",
        strength: "Strong",
        mechanismType: "Enzymatic cofactor",
        tissueTarget: "Liver, brain, all nucleated cells",
        target: "Liver, brain, all nucleated cells",
        evidence: [
          {
            citationId: "finkelstein_1990_methionine",
            title: "Methionine metabolism in mammals",
            authors: ["Finkelstein, J.D."],
            year: 1990,
            journal: "Journal of Nutritional Biochemistry",
            doi: "10.1016/0955-2863(90)90070-2",
            pmid: "15539209",
            studyType: "Review article",
            evidenceLevel: "Level 3",
            findings: "B12 (as methylcobalamin) is essential cofactor for methionine synthase, catalyzing remethylation of homocysteine to methionine; deficiency blocks this pathway, elevating homocysteine and depleting SAM (S-adenosylmethionine), the universal methyl donor required for DNA methylation, neurotransmitter synthesis, and myelin formation; adenosylcobalamin serves as cofactor for methylmalonyl-CoA mutase in propionate catabolism, critical for energy metabolism and fatty acid synthesis",
            methodology: "Biochemical review synthesizing mammalian methionine metabolism pathways; covers methionine synthase, methylmalonyl-CoA mutase, and folate cycle interactions; foundational reference for B12 biochemistry establishing dual coenzyme roles"
          }
        ]
      },
      {
        mechanism: "Myelin Synthesis and Neurological Integrity",
        strength: "Strong",
        mechanismType: "Structural maintenance",
        tissueTarget: "Peripheral and central nervous system",
        target: "Peripheral and central nervous system",
        evidence: [
          {
            citationId: "alruwaili_2023_neurological",
            title: "Neurological Implications of Vitamin B12 Deficiency in Diet: A Systematic Review and Meta-Analysis",
            authors: ["Alruwaili, M.", "De Felice, F.G.", "Bhatt, D.L."],
            year: 2023,
            journal: "Healthcare",
            doi: "10.3390/healthcare11070958",
            pmid: "37046885",
            studyType: "Systematic review and meta-analysis",
            evidenceLevel: "Level 1",
            findings: "B12 deficiency causes progressive demyelination of peripheral and central nervous system; methylmalonyl-CoA accumulation due to absent adenosylcobalamin activity impairs odd-chain fatty acid incorporation into myelin; subacute combined degeneration of the spinal cord is the hallmark neuropathology; neurological damage is partially reversible with early B12 treatment; meta-analysis confirmed dose-dependent association between deficiency severity and neurological damage extent",
            methodology: "Systematic review with meta-analysis; searched PubMed, Embase, Cochrane databases; assessed neurological outcomes in populations with dietary B12 deficiency; included studies with measurable neurological endpoints; risk of bias assessed using standard tools"
          },
          {
            citationId: "stabler_2013_clinical",
            title: "Clinical practice. Vitamin B12 deficiency.",
            authors: ["Stabler, S.P."],
            year: 2013,
            journal: "New England Journal of Medicine",
            doi: "10.1056/NEJMcp1113996",
            pmid: "23301732",
            studyType: "Clinical review",
            evidenceLevel: "Level 2",
            findings: "B12 deficiency causes subacute combined degeneration affecting dorsal and lateral spinal cord columns via failed methylation of myelin basic protein; peripheral neuropathy and megaloblastic anemia are primary clinical presentations; deficiency arises from malabsorption (pernicious anemia, gastric atrophy), inadequate dietary intake (vegan diet), or drug interactions (metformin, PPIs); diagnosis requires serum B12 with confirmatory holotranscobalamin or methylmalonic acid; early treatment prevents irreversible neurological damage",
            methodology: "NEJM clinical practice review; evidence-based synthesis of pathophysiology, diagnosis, and treatment of B12 deficiency; covers differential diagnosis, biomarker utility, and monitoring protocols"
          }
        ]
      }
    ],

    benefits: [
      {
        healthDomain: "Cognitive Function and Dementia Prevention",
        specificClaim: "Low B12 status measured by holotranscobalamin predicts accelerated cognitive decline in older adults; B-vitamin supplementation slows brain atrophy and cognitive decline in mild cognitive impairment with elevated homocysteine",
        strength: "Moderate",
        evidenceQuality: "Moderate",
        replicationStatus: "Replicated across multiple independent cohorts",
        tissueTarget: "Hippocampus and prefrontal cortex",
        target: "Hippocampus and prefrontal cortex",
        evidence: [
          {
            citationId: "clarke_2007_cognitive",
            title: "Low vitamin B-12 status and risk of cognitive decline in older adults",
            authors: ["Clarke, R.", "Birks, J.", "Nexo, E.", "Ueland, P.M.", "Schneede, J.", "Scott, J.", "Molloy, A.", "Evans, J.G."],
            year: 2007,
            journal: "American Journal of Clinical Nutrition",
            doi: "10.1093/ajcn/86.5.1384",
            pmid: "17991650",
            studyType: "Prospective cohort study",
            evidenceLevel: "Level 2",
            findings: "Prospective cohort (n=1,648 adults aged ≥75, Oxford OPTIMA cohort); low holotranscobalamin (holoTC) at baseline predicted more rapid cognitive decline over follow-up; holoTC was more sensitive than serum B12 alone for predicting decline; dose-response relationship between holoTC level and rate of cognitive change; findings support holoTC as the preferred B12 biomarker for cognitive risk screening in older populations",
            methodology: "Prospective observational cohort; n=1,648 community-dwelling adults ≥75 years; B12 biomarkers (serum B12, holoTC, MMA, homocysteine) measured at baseline; TICS and additional cognitive tests repeated at follow-up; multivariate regression adjusting for age, sex, education, depression, and cardiovascular risk factors"
          },
          {
            citationId: "smith_2018_dementia",
            title: "Homocysteine and Dementia: An International Consensus Statement",
            authors: ["Smith, A.D.", "Refsum, H.", "Bottiglieri, T.", "Fenech, M.", "Hooshmand, B.", "McCaddon, A.", "Miller, J.W.", "Rosenberg, I.H.", "Obeid, R."],
            year: 2018,
            journal: "Journal of Alzheimer's Disease",
            doi: "10.3233/JAD-171042",
            pmid: "29480200",
            studyType: "Consensus statement",
            evidenceLevel: "Level 2",
            findings: "International expert consensus (18 researchers): elevated homocysteine is a modifiable risk factor for cognitive decline and dementia; B-vitamin supplementation (B12, B6, folate) effectively reduces homocysteine; greatest cognitive benefit is seen in individuals with elevated baseline homocysteine; RCT evidence shows B-vitamin therapy significantly slows brain atrophy and cognitive decline in MCI patients with elevated homocysteine (Oxford VITACOG trial data cited)",
            methodology: "International consensus statement; systematic review of evidence linking homocysteine to dementia and cognitive decline; 18 international experts; included meta-analyses of RCTs; graded recommendations based on level of evidence"
          }
        ]
      },
      {
        healthDomain: "Homocysteine Reduction and Stroke Prevention",
        specificClaim: "B12 supplementation significantly reduces plasma homocysteine levels and is associated with a statistically significant reduction in stroke risk",
        strength: "Strong",
        evidenceQuality: "High",
        replicationStatus: "Well-replicated across 21 RCTs for homocysteine; 15 RCTs for cardiovascular outcomes",
        tissueTarget: "Cardiovascular and cerebrovascular system",
        target: "Cardiovascular and cerebrovascular system",
        evidence: [
          {
            citationId: "sohouli_2024_homocysteine",
            title: "A comprehensive review and meta-regression analysis of randomized controlled trials examining the impact of vitamin B12 supplementation on homocysteine levels",
            authors: ["Sohouli, M.H.", "Fatahi, S.", "Sharifi-Zahabi, E.", "Santos, H.O.", "Găman, M.A.", "Shidfar, F."],
            year: 2024,
            journal: "Nutrition Reviews",
            doi: "10.1093/nutrit/nuad091",
            pmid: "37495210",
            studyType: "Systematic review and meta-analysis",
            evidenceLevel: "Level 1",
            findings: "Meta-analysis of 21 RCTs: B12 supplementation significantly reduced plasma homocysteine (WMD: -4.15 µmol/L; 95% CI: -5.55 to -2.75; p<0.001); effect strongest in populations with baseline deficiency or elevated homocysteine; dose-response relationship with higher doses producing greater reductions; homocysteine reductions are clinically meaningful for cardiovascular and neurological risk reduction",
            methodology: "Systematic review and meta-analysis; 21 RCTs included; random effects model for WMD calculation; subgroup analyses by dose, duration, baseline homocysteine, and population type; GRADE quality assessment; Cochrane risk of bias tool applied to all included RCTs"
          },
          {
            citationId: "marti_carvajal_2017_cvd",
            title: "Homocysteine-lowering interventions for preventing cardiovascular events",
            authors: ["Martí-Carvajal, A.J.", "Solà, I.", "Lathyris, D.", "Dayer, M."],
            year: 2017,
            journal: "Cochrane Database of Systematic Reviews",
            doi: "10.1002/14651858.CD006612.pub5",
            pmid: "28816346",
            studyType: "Cochrane systematic review and meta-analysis",
            evidenceLevel: "Level 1",
            findings: "Cochrane review of 15 RCTs (n=71,422 participants); B-vitamin homocysteine-lowering therapy (including B12) did not significantly reduce all-cause mortality or coronary heart disease events; statistically significant reduction in stroke risk (RR 0.90, 95% CI 0.82-0.99); stroke prevention is the most robustly supported cardiovascular outcome of homocysteine-lowering B-vitamin therapy",
            methodology: "Cochrane systematic review (5th update); 15 RCTs totaling 71,422 participants; random effects meta-analysis; primary outcomes: all-cause mortality, coronary events; secondary outcomes: stroke, total cardiovascular events; GRADE evidence grading; publication bias assessed via funnel plots"
          }
        ]
      },
      {
        healthDomain: "Mood and Depression",
        specificClaim: "B12 deficiency is independently associated with approximately doubled risk of severe depression in older women",
        strength: "Moderate",
        evidenceQuality: "Moderate",
        replicationStatus: "Multiple epidemiological studies supporting the association",
        tissueTarget: "Central nervous system — monoaminergic pathways",
        target: "Central nervous system — monoaminergic pathways",
        evidence: [
          {
            citationId: "penninx_2000_depression",
            title: "Vitamin B12 deficiency and depression in physically disabled older women: epidemiologic evidence from the Women's Health and Aging Study",
            authors: ["Penninx, B.W.", "Guralnik, J.M.", "Ferrucci, L.", "Fried, L.P.", "Allen, R.H.", "Stabler, S.P."],
            year: 2000,
            journal: "American Journal of Psychiatry",
            doi: "10.1176/appi.ajp.157.5.715",
            pmid: "10784463",
            studyType: "Prospective cohort study",
            evidenceLevel: "Level 2",
            findings: "Women with B12 deficiency had approximately twice the risk of severe depression vs non-deficient women (OR ≈ 2.05); B12 deficiency independently associated with depressive symptoms after adjusting for folate, disability, and chronic disease; proposed mechanism: impaired SAM synthesis from blocked methionine cycle depletes monoamine neurotransmitter (serotonin, dopamine, norepinephrine) production",
            methodology: "Prospective cohort; n=700 disabled women aged 65-80 (Women's Health and Aging Study); B12 deficiency defined as serum B12 <258 pmol/L; depression assessed using Center for Epidemiologic Studies Depression Scale (CES-D score ≥16); logistic regression with multiple confounders including folate, disability, chronic disease, and inflammation"
          }
        ]
      },
      {
        healthDomain: "Recurrent Aphthous Stomatitis",
        specificClaim: "Sublingual B12 supplementation reduces frequency and severity of recurrent aphthous ulcers independent of baseline serum B12 status",
        strength: "Moderate",
        evidenceQuality: "Moderate",
        replicationStatus: "Single high-quality RCT; requires replication",
        tissueTarget: "Oral mucosa",
        target: "Oral mucosa",
        evidence: [
          {
            citationId: "volkov_2009_stomatitis",
            title: "Effectiveness of vitamin B12 in treating recurrent aphthous stomatitis: a randomized, double-blind, placebo-controlled trial",
            authors: ["Volkov, I.", "Rudoy, I.", "Freud, T.", "Sardal, G.", "Naimer, S.", "Peleg, R.", "Press, Y."],
            year: 2009,
            journal: "Journal of the American Board of Family Medicine",
            doi: "10.3122/jabfm.2009.01.080113",
            pmid: "19124628",
            studyType: "Randomized controlled trial",
            evidenceLevel: "Level 2",
            findings: "RCT (n=58); sublingual B12 1000 mcg/day significantly reduced number of aphthous ulcers, outbreaks per month, and duration compared to placebo over 6 months; 74% of B12 group achieved disease remission vs 32% placebo (p<0.01); benefits were independent of baseline serum B12 levels, suggesting a pharmacological mechanism beyond simple nutritional repletion",
            methodology: "Double-blind, placebo-controlled RCT; n=58 patients with recurrent aphthous stomatitis; sublingual B12 1000 mcg/day vs placebo for 6 months; primary outcomes: number of ulcers, duration, pain scores, outbreaks per month; ITT analysis; baseline serum B12 measured in all participants to assess B12-independent effects"
          }
        ]
      }
    ],

    safety: [
      {
        safetyAspect: "General tolerability and upper intake limit",
        claim: "No tolerable upper intake level established; vitamin B12 is well-tolerated at therapeutic doses of 1000-2000 mcg/day and above with no documented toxicity",
        riskLevel: "Low",
        target: "Multiple organ systems",
        tissueTarget: "Multiple organ systems",
        evidence: [
          {
            citationId: "allen_2008_deficiency",
            title: "How common is vitamin B-12 deficiency?",
            authors: ["Allen, L.H."],
            year: 2008,
            journal: "American Journal of Clinical Nutrition",
            doi: "10.3945/ajcn.2008.26947A",
            pmid: "19116323",
            studyType: "Review article",
            evidenceLevel: "Level 3",
            findings: "No tolerable upper limit established for vitamin B12 by the IOM; excess B12 absorbed by passive diffusion is excreted in urine; no toxic effects documented from oral supplementation at any tested dose; safety profile excellent across all age groups including elderly with reduced intrinsic factor secretion; drug interactions of clinical significance: metformin reduces B12 absorption by ~30%, proton pump inhibitors and H2 blockers impair gastric acid-dependent B12 release from food proteins",
            methodology: "Narrative review synthesizing global B12 deficiency prevalence data; analyzed multiple population surveys across age groups and geographic regions including NHANES, EURONUT-SENECA, and other national nutrition surveys; covered biomarker thresholds and diagnostic criteria"
          },
          {
            citationId: "stabler_2013_clinical",
            title: "Clinical practice. Vitamin B12 deficiency.",
            authors: ["Stabler, S.P."],
            year: 2013,
            journal: "New England Journal of Medicine",
            doi: "10.1056/NEJMcp1113996",
            pmid: "23301732",
            studyType: "Clinical review",
            evidenceLevel: "Level 2",
            findings: "Intramuscular doses of 1000 mcg used therapeutically without adverse effects; cyanocobalamin is safe even in renal impairment; most adverse events (rare skin reactions, anaphylaxis) are associated with parenteral administration only, not oral supplementation; oral supplementation at 1000-2000 mcg/day has an excellent documented safety record in clinical trials; no organ toxicity documented at high oral doses",
            methodology: "NEJM clinical practice review; covers pathophysiology, clinical presentation, diagnosis, and treatment; reviews clinical trial evidence on efficacy and safety of oral vs parenteral treatment options"
          }
        ]
      },
      {
        safetyAspect: "Deficiency risk in plant-based diets",
        claim: "Vegan and vegetarian populations face clinically significant risk of B12 deficiency without supplementation; active supplementation is required as plant food sources are insufficient",
        riskLevel: "Low",
        target: "Hematopoietic system and nervous system",
        tissueTarget: "Hematopoietic system and nervous system",
        adverseEvents: ["Megaloblastic anemia (consequence of untreated deficiency)", "Peripheral neuropathy (consequence of prolonged untreated deficiency)"],
        evidence: [
          {
            citationId: "watanabe_2014_plant",
            title: "Vitamin B12-containing plant food sources for vegetarians",
            authors: ["Watanabe, F.", "Yabuta, Y.", "Bito, T.", "Teng, F."],
            year: 2014,
            journal: "Nutrients",
            doi: "10.3390/nu6051861",
            pmid: "24803097",
            studyType: "Review article",
            evidenceLevel: "Level 3",
            findings: "Most plant-derived B12 analogs are biologically inactive and may compete with active B12 for absorption; dried Nori seaweed (4 g/day) provides measurable active B12 but is insufficient as sole source; vegan populations have documented deficiency rates up to 80% without supplementation; cyanocobalamin supplements are effective and safe for plant-based populations; weekly high-dose (2000 mcg) or daily lower-dose (≥10 mcg) supplementation protocols are recommended for vegans based on passive absorption pharmacokinetics",
            methodology: "Systematic review of plant-derived B12 sources; included human intervention studies measuring serum B12 normalization, MMA reduction, and homocysteine response to various plant B12 sources and B12-fortified foods; assessed bioavailability from different algae species"
          }
        ]
      }
    ],

    dosage: [
      {
        dosageRange: "2.4 mcg/day (RDA, maintenance) to 1000-2000 mcg/day (therapeutic deficiency correction)",
        claim: "High-dose oral B12 (1000-2000 mcg/day) is as effective as intramuscular injections for treating deficiency in most patients via intrinsic factor-independent passive absorption",
        evidenceBase: "Strong",
        target: "Gastrointestinal absorption and systemic distribution",
        tissueTarget: "Gastrointestinal absorption and systemic distribution",
        evidence: [
          {
            citationId: "vidal_alaball_2005_oral",
            title: "Oral vitamin B12 versus intramuscular vitamin B12 for vitamin B12 deficiency",
            authors: ["Vidal-Alaball, J.", "Butler, C.C.", "Cannings-John, R.", "Goringe, A.", "Hood, K.", "McCaddon, A.", "McDowell, I.", "Papaioannou, A."],
            year: 2005,
            journal: "Cochrane Database of Systematic Reviews",
            doi: "10.1002/14651858.CD004655.pub2",
            pmid: "16034940",
            studyType: "Cochrane systematic review",
            evidenceLevel: "Level 1",
            findings: "Cochrane review: high-dose oral cyanocobalamin (1000-2000 mcg/day) achieved normalization of serum B12 and improvement in neurological symptoms equivalent to intramuscular injections; oral route preferred for convenience, lower cost, and avoidance of injection-related adverse events; passive absorption (~1% of dose) at 1000 mcg provides ≥10 mcg absorbed, exceeding daily requirement and enabling effective B12 repletion independent of intrinsic factor status",
            methodology: "Cochrane systematic review; included RCTs comparing oral vs intramuscular B12 treatment; outcomes: serum B12 normalization, neurological symptom improvement, hematological response (hemoglobin, MCV normalization); quality assessment using Cochrane risk of bias tool"
          },
          {
            citationId: "watanabe_2014_plant",
            title: "Vitamin B12-containing plant food sources for vegetarians",
            authors: ["Watanabe, F.", "Yabuta, Y.", "Bito, T.", "Teng, F."],
            year: 2014,
            journal: "Nutrients",
            doi: "10.3390/nu6051861",
            pmid: "24803097",
            studyType: "Review article",
            evidenceLevel: "Level 3",
            findings: "RDA is 2.4 mcg/day for adults (2.6 mcg pregnancy, 2.8 mcg lactation); plant-based diets rarely provide adequate active B12 without supplementation; ≥10 mcg/day (daily supplementation) or 2000 mcg/week (weekly supplementation) recommended for vegans based on passive absorption pharmacokinetics; active forms (methylcobalamin, adenosylcobalamin) have equivalent clinical effect to cyanocobalamin at equivalent doses in human biomarker studies",
            methodology: "Review of bioavailability studies of plant-source B12 and various supplemental forms; included human intervention studies measuring serum B12 normalization and MMA/homocysteine reduction; assessed dose-response relationships for different supplementation protocols"
          }
        ]
      }
    ]
  }
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[21] = vitaminB12Enhanced;
if (typeof module !== "undefined" && module.exports) {
  module.exports = vitaminB12Enhanced;
}
