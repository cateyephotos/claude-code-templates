#!/usr/bin/env node
// Wave 2 Enhanced Citation Updater
// Adds citationIds to existing evidence + injects new agent papers + updates keyCitations

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');
const ENHANCED_DIR = path.join(BASE, 'data', 'enhanced_citations');
const SUPPS_FILE = path.join(BASE, 'data', 'supplements.js');

// ============================================================
// NEW PAPERS FROM AGENTS (not already in enhanced files)
// ============================================================

const newPapers = {
  49: [ // Echinacea - 2 new
    {
      citationId: "david_2019_urti_systematic_review",
      title: "Echinacea for the prevention and treatment of upper respiratory tract infections: A systematic review and meta-analysis",
      authors: "David S, Cunningham R",
      journal: "Complementary Therapies in Medicine",
      year: 2019,
      doi: "10.1016/j.ctim.2019.03.011",
      pmid: "31126553",
      studyType: "Systematic review and meta-analysis",
      sampleSize: "Multiple RCTs pooled",
      duration: "Various",
      keyFindings: [
        "Echinacea may have a preventative effect on URTI incidence (RR 0.78; 95% CI 0.68-0.88)",
        "No meaningful impact on URTI symptom duration (MD -0.45 days)",
        "No apparent safety risk in the short term"
      ],
      section: "benefits",
      healthDomain: "Upper Respiratory Tract Infection Prevention"
    },
    {
      citationId: "schapowal_2015_recurrent_rti",
      title: "Echinacea reduces the risk of recurrent respiratory tract infections and complications: a meta-analysis of randomized controlled trials",
      authors: "Schapowal A, Klein P, Johnston SL",
      journal: "Advances in Therapy",
      year: 2015,
      doi: "10.1007/s12325-015-0194-4",
      pmid: "25784510",
      studyType: "Meta-analysis",
      sampleSize: "2458 participants across 6 RCTs",
      duration: "Various",
      keyFindings: [
        "Echinacea reduced risk of recurrent respiratory infections (RR 0.649; P<0.0001)",
        "In vulnerable subgroups, echinacea halved recurrent infection risk (RR 0.501)",
        "Reduced complications including pneumonia, otitis media, and tonsillitis"
      ],
      section: "benefits",
      healthDomain: "Recurrent Respiratory Infection Prevention"
    }
  ],
  54: [ // Chlorella - 2 new
    {
      citationId: "chiu_2021_antioxidant",
      title: "Beneficial effect of Chlorella pyrenoidosa drink on healthy subjects: A randomized, placebo-controlled, double-blind, cross-over clinical trial",
      authors: "Chiu HF, Lee HJ, Han YC, Venkatakrishnan K, Golovinskaia O, Wang CK",
      journal: "Journal of Food Biochemistry",
      year: 2021,
      doi: "10.1111/jfbc.13665",
      pmid: "33755227",
      studyType: "RCT (cross-over, double-blind)",
      sampleSize: "n=44",
      duration: "90 days per phase",
      keyFindings: [
        "Significantly improved antioxidant markers: TEAC, SOD, CAT, and DHEAs",
        "Reduced oxidative stress markers TBARS and 8-OHdG",
        "Hepatoprotective effects: lowered GOT and GPT liver enzymes"
      ],
      section: "benefits",
      healthDomain: "Antioxidant and Hepatoprotective Effects"
    },
    {
      citationId: "okada_2018_oxidativestress",
      title: "Effect of Chlorella Ingestion on Oxidative Stress and Fatigue Symptoms in Healthy Men",
      authors: "Okada H, Yoshida N, Kakuma T, Toyomasu K",
      journal: "Kurume Medical Journal",
      year: 2018,
      doi: "10.2739/kurumemedj.MS644001",
      pmid: "29780062",
      studyType: "RCT (double-blind, parallel)",
      sampleSize: "n=27",
      duration: "4 weeks",
      keyFindings: [
        "Chlorella 6 g/day significantly increased antioxidant capacity at rest",
        "Malondialdehyde levels decreased compared to placebo",
        "Benefits primarily observed at baseline, not during exercise-induced fatigue"
      ],
      section: "benefits",
      healthDomain: "Oxidative Stress Reduction"
    }
  ],
  63: [ // Bitter Melon - 2 new
    {
      citationId: "zhang_2024_glycemic_lipid",
      title: "Effects of Momordica charantia L. supplementation on glycemic control and lipid profile in type 2 diabetes mellitus patients: A systematic review and meta-analysis of randomized controlled trials",
      authors: "Zhang X, Zhao Y, Song Y, Miao M",
      journal: "Heliyon",
      year: 2024,
      doi: "10.1016/j.heliyon.2024.e31126",
      pmid: "38784554",
      studyType: "Systematic Review and Meta-Analysis",
      sampleSize: "423 across 8 RCTs",
      duration: "Various",
      keyFindings: [
        "Significant reductions in fasting blood glucose in T2DM patients",
        "Significant reductions in total cholesterol and triglycerides",
        "No significant effect on LDL-cholesterol"
      ],
      section: "benefits",
      healthDomain: "Glycemic and Lipid Control in T2DM"
    },
    {
      citationId: "laczkozold_2024_metabolic",
      title: "The metabolic effect of Momordica charantia cannot be determined based on the available clinical evidence: a systematic review and meta-analysis of randomized clinical trials",
      authors: "Laczko-Zold E, Csupor-Loffler B, Kolcsar EB, Ferenci T, Nan M, Toth B, Csupor D",
      journal: "Frontiers in Nutrition",
      year: 2024,
      doi: "10.3389/fnut.2023.1200801",
      pmid: "38274207",
      studyType: "Systematic Review and Meta-Analysis",
      sampleSize: "414 across 9 RCTs",
      duration: "4-16 weeks",
      keyFindings: [
        "No significant effect on fasting blood glucose when change scores analyzed",
        "No significant effect on HbA1c: MD -0.12%",
        "Highlighted major methodological limitations in existing RCTs"
      ],
      section: "benefits",
      healthDomain: "Metabolic Effects (Critical Assessment)"
    }
  ],
  66: [ // Cinnamon Extract - 3 new
    {
      citationId: "moridpour_2024_glycemic_dose_response",
      title: "The effect of cinnamon supplementation on glycemic control in patients with type 2 diabetes mellitus: An updated systematic review and dose-response meta-analysis of randomized controlled trials",
      authors: "Moridpour AH, Kavyani Z, Khosravi S, Farmani E, Daneshvar M, Musazadeh V, Faghfouri AH",
      journal: "Phytotherapy Research",
      year: 2024,
      doi: "10.1002/ptr.8026",
      pmid: "37818728",
      studyType: "Systematic Review and Dose-Response Meta-Analysis",
      sampleSize: "24 RCTs",
      duration: "Various",
      keyFindings: [
        "Significant reduction in fasting blood sugar (SMD: -1.32; p<0.001)",
        "Significant reduction in HbA1c (SMD: -0.67; p=0.011)",
        "Significant reduction in HOMA-IR"
      ],
      section: "benefits",
      healthDomain: "Glycemic Control Dose-Response"
    },
    {
      citationId: "zhou_2022_glycolipid",
      title: "Efficacy of cinnamon supplementation on glycolipid metabolism in T2DM diabetes: A meta-analysis and systematic review",
      authors: "Zhou Q, Lei X, Fu S, Li Z, Chen Y, Long C, Li S, Chen Q",
      journal: "Frontiers in Physiology",
      year: 2022,
      doi: "10.3389/fphys.2022.960580",
      pmid: "36505061",
      studyType: "Systematic Review and Meta-Analysis",
      sampleSize: "1020 across 16 RCTs",
      duration: "40 days to 4 months",
      keyFindings: [
        "Significant improvements in fasting plasma glucose and HbA1c",
        "Stronger effects in patients with baseline HbA1c >= 8%",
        "Only one adverse effect reported across all 16 included studies"
      ],
      section: "benefits",
      healthDomain: "Glycolipid Metabolism"
    },
    {
      citationId: "akilen_2012_glycaemic",
      title: "Cinnamon in glycaemic control: Systematic review and meta analysis",
      authors: "Akilen R, Tsiami A, Devendra D, Robinson N",
      journal: "Clinical Nutrition",
      year: 2012,
      doi: "10.1016/j.clnu.2012.04.003",
      pmid: "22579946",
      studyType: "Systematic Review and Meta-Analysis",
      sampleSize: "435 across 6 RCTs",
      duration: "40 days to 4 months",
      keyFindings: [
        "Significant decrease in mean HbA1c (-0.09%)",
        "Significant decrease in mean fasting plasma glucose (-0.84 mmol/L)",
        "One of the earliest meta-analyses establishing cinnamon glycemic benefit"
      ],
      section: "benefits",
      healthDomain: "Glycemic Control (Early Meta-Analysis)"
    }
  ],
  68: [ // Schisandra Berry - 2 new
    {
      citationId: "aslanyan_2010_cognitive",
      title: "Double-blind, placebo-controlled, randomised study of single dose effects of ADAPT-232 on cognitive functions",
      authors: "Aslanyan G, Amroyan E, Gabrielyan E, Nylander M, Wikman G, Panossian A",
      journal: "Phytomedicine",
      year: 2010,
      doi: "10.1016/j.phymed.2010.02.005",
      pmid: "20374974",
      studyType: "RCT (double-blind, placebo-controlled, Phase IIa)",
      sampleSize: "n=40",
      duration: "Single dose (acute study)",
      keyFindings: [
        "ADAPT-232 (containing Schisandra) showed significant improvement in attention, speed, and accuracy vs placebo",
        "Cognitive improvements appeared within 2 hours of a single 270 mg dose",
        "Note: combination product - effects cannot be attributed to Schisandra alone"
      ],
      section: "benefits",
      healthDomain: "Cognitive Function (Adaptogen Combination)"
    },
    {
      citationId: "song_2015_gut_microbiota",
      title: "Schisandra chinensis fruit modulates the gut microbiota composition in association with metabolic markers in obese women: a randomized, double-blind placebo-controlled study",
      authors: "Song MY, Wang JH, Eom T, Kim H",
      journal: "Nutrition Research",
      year: 2015,
      doi: "10.1016/j.nutres.2015.05.001",
      pmid: "26048342",
      studyType: "RCT (double-blind, placebo-controlled)",
      sampleSize: "n=28",
      duration: "12 weeks",
      keyFindings: [
        "Schisandra modulated gut microbiota composition in obese women",
        "Trends toward improvements in waist circumference, fat mass, fasting blood glucose",
        "Bacteroides showed negative correlation with fat mass and liver markers"
      ],
      section: "benefits",
      healthDomain: "Gut Microbiota and Metabolic Health"
    }
  ],
  70: [ // Forskolin - 2 new
    {
      citationId: "majeed_2015_glaucoma",
      title: "Efficacy and safety of 1% forskolin eye drops in open angle glaucoma - An open label study",
      authors: "Majeed M, Nagabhushanam K, Natarajan S, Vaidyanathan P, Karri SK, Jose JA",
      journal: "Saudi Journal of Ophthalmology",
      year: 2015,
      doi: "10.1016/j.sjopt.2015.02.003",
      pmid: "26155078",
      studyType: "Open-label clinical trial",
      sampleSize: "n=90",
      duration: "4 weeks",
      keyFindings: [
        "Mean IOP reduced by 4.5-5.4 mmHg from baseline through week 4 (p<0.05)",
        "Forskolin 1% eye drops demonstrated safe and effective IOP-lowering profile",
        "Potential safe alternative to beta blockers for glaucoma patients with asthma"
      ],
      section: "benefits",
      healthDomain: "Intraocular Pressure / Glaucoma"
    },
    {
      citationId: "gonzalez_sanchez_2006_asthma",
      title: "Forskolin versus sodium cromoglycate for prevention of asthma attacks: a single-blinded clinical trial",
      authors: "Gonzalez-Sanchez R, Trujillo X, Trujillo-Hernandez B, Vasquez C, Huerta M, Elizalde A",
      journal: "Journal of International Medical Research",
      year: 2006,
      doi: "10.1177/147323000603400210",
      pmid: "16749416",
      studyType: "Randomized, single-blind clinical trial",
      sampleSize: "n=40",
      duration: "6 months",
      keyFindings: [
        "Only 40% in forskolin group had asthma attacks vs 85% in cromoglycate group",
        "Forskolin 10 mg/day was significantly more effective for preventing asthma attacks",
        "FEV1 measurements remained similar between groups"
      ],
      section: "benefits",
      healthDomain: "Asthma Prevention"
    }
  ],
  71: [ // Boswellia - 1 new
    {
      citationId: "holtmeier_2011_crohns",
      title: "Randomized, placebo-controlled, double-blind trial of Boswellia serrata in maintaining remission of Crohn's disease: good safety profile but lack of efficacy",
      authors: "Holtmeier W, Zeuzem S, Preiss J, Kruis W, Bohm S, Maaser C, Raedler A, Schmidt C, Schnitker J, Schwarz J, Zeitz M, Caspary W",
      journal: "Inflammatory Bowel Diseases",
      year: 2011,
      doi: "10.1002/ibd.21345",
      pmid: "20848527",
      studyType: "Multicenter RCT (double-blind, placebo-controlled)",
      sampleSize: "n=82",
      duration: "52 weeks",
      keyFindings: [
        "No superiority of Boswelan over placebo for maintaining Crohn's remission (59.1% vs 57.1% relapse)",
        "Good long-term safety and tolerability confirmed over 52 weeks",
        "Important negative result tempering IBD application enthusiasm"
      ],
      section: "safety",
      healthDomain: "IBD Safety and Efficacy Assessment"
    }
  ],
  72: [ // Milk Thistle - 4 new
    {
      citationId: "zhong_2017_nafld_meta",
      title: "The therapeutic effect of silymarin in the treatment of nonalcoholic fatty disease: A meta-analysis (PRISMA) of randomized control trials",
      authors: "Zhong S, Fan Y, Yan Q, Fan X, Wu B, Han Y, Zhang Y, Chen Y, Zhang H, Niu J",
      journal: "Medicine (Baltimore)",
      year: 2017,
      doi: "10.1097/MD.0000000000009061",
      pmid: "29245314",
      studyType: "Meta-Analysis",
      sampleSize: "8 RCTs",
      duration: "Various",
      keyFindings: [
        "Silymarin led to significantly greater reduction in ALT and AST vs controls",
        "Effective in reducing liver enzyme levels in NAFLD patients",
        "Well-tolerated with favorable safety profile"
      ],
      section: "benefits",
      healthDomain: "NAFLD Liver Enzyme Reduction"
    },
    {
      citationId: "tao_2019_dili_meta",
      title: "Prophylactic Therapy of Silymarin (Milk Thistle) on Antituberculosis Drug-Induced Liver Injury: A Meta-Analysis of Randomized Controlled Trials",
      authors: "Tao L, Qu X, Zhang Y, Song Y, Zhang SX",
      journal: "Canadian Journal of Gastroenterology and Hepatology",
      year: 2019,
      doi: "10.1155/2019/3192351",
      pmid: "30733935",
      studyType: "Meta-Analysis",
      sampleSize: "1198 patients across 5 RCTs",
      duration: "Various",
      keyFindings: [
        "Silymarin reduced anti-TB drug-induced liver injury by 67% at week 4 (RR: 0.33)",
        "Protective effects on ALT, AST, and ALP all statistically significant",
        "Adverse events comparable between silymarin and placebo groups"
      ],
      section: "benefits",
      healthDomain: "Drug-Induced Liver Injury Prevention"
    },
    {
      citationId: "xiao_2020_metabolic_meta",
      title: "The therapeutic effects of silymarin for patients with glucose/lipid metabolic dysfunction: A meta-analysis",
      authors: "Xiao F, Gao F, Zhou S, Wang L",
      journal: "Medicine (Baltimore)",
      year: 2020,
      doi: "10.1097/MD.0000000000022249",
      pmid: "33019400",
      studyType: "Meta-Analysis",
      sampleSize: "1358 across 16 RCTs",
      duration: "Various (2006-2019)",
      keyFindings: [
        "Significantly reduced fasting blood glucose (SMD: -1.27, P<.001)",
        "Significantly reduced HbA1c (SMD: -1.88, P<.001)",
        "Improved lipid profiles: reduced TC, LDL-C, TG; increased HDL-C"
      ],
      section: "benefits",
      healthDomain: "Glucose and Lipid Metabolic Dysfunction"
    },
    {
      citationId: "kheong_2017_nash_rct",
      title: "A Randomized Trial of Silymarin for the Treatment of Nonalcoholic Steatohepatitis",
      authors: "Kheong CW, Nik Mustapha NR, Mahadeva S",
      journal: "Clinical Gastroenterology and Hepatology",
      year: 2017,
      doi: "10.1016/j.cgh.2017.04.016",
      pmid: "28419855",
      studyType: "RCT (double-blind, placebo-controlled)",
      sampleSize: "n=99",
      duration: "48 weeks",
      keyFindings: [
        "Primary NAS score endpoint did not reach significance vs placebo",
        "Significantly higher fibrosis reduction: 22.4% vs 6.0% (P=.023)",
        "Silymarin 700 mg TID well-tolerated for 48 weeks with no serious adverse events"
      ],
      section: "benefits",
      healthDomain: "NASH Fibrosis Reduction"
    }
  ],
  74: [ // Elderberry - 2 new
    {
      citationId: "wieland_2021_systematic_review",
      title: "Elderberry for prevention and treatment of viral respiratory illnesses: a systematic review",
      authors: "Wieland LS, Piechotta V, Feinberg T, Ludeman E, Hutton B, Kanji S, Seely D, Garritty C",
      journal: "BMC Complementary Medicine and Therapies",
      year: 2021,
      doi: "10.1186/s12906-021-03283-5",
      pmid: "33827515",
      studyType: "Systematic Review",
      sampleSize: "Multiple studies",
      duration: "Various",
      keyFindings: [
        "Elderberry may reduce duration and severity of colds (very low to low certainty)",
        "May not reduce risk of developing the common cold",
        "No serious adverse events reported in any included study"
      ],
      section: "benefits",
      healthDomain: "Viral Respiratory Illness (Comprehensive Review)"
    },
    {
      citationId: "macknin_2020_er_influenza",
      title: "Elderberry Extract Outpatient Influenza Treatment for Emergency Room Patients Ages 5 and Above: a Randomized, Double-Blind, Placebo-Controlled Trial",
      authors: "Macknin M, Wolski K, Negrey J, Mace S",
      journal: "Journal of General Internal Medicine",
      year: 2020,
      doi: "10.1007/s11606-020-06170-w",
      pmid: "32929634",
      studyType: "RCT (double-blind, placebo-controlled)",
      sampleSize: "n=87",
      duration: "5 days treatment",
      keyFindings: [
        "No significant difference in days to symptom alleviation: elderberry 5.3 vs placebo 4.9 days",
        "Most rigorous single trial (PCR-confirmed influenza, ER setting)",
        "Important negative result contradicting smaller positive trials"
      ],
      section: "safety",
      healthDomain: "Influenza Treatment Efficacy Assessment"
    }
  ]
};

// ============================================================
// keyCitations for supplements.js (top 5 per supplement)
// ============================================================

const keyCitations = {
  49: [
    { authors: "Shah SA et al.", year: 2007, title: "Evaluation of echinacea for the prevention and treatment of the common cold: a meta-analysis", journal: "The Lancet Infectious Diseases", doi: "10.1016/S1473-3099(07)70160-3", pmid: "17597571" },
    { authors: "David S, Cunningham R", year: 2019, title: "Echinacea for the prevention and treatment of upper respiratory tract infections: A systematic review and meta-analysis", journal: "Complementary Therapies in Medicine", doi: "10.1016/j.ctim.2019.03.011", pmid: "31126553" },
    { authors: "Schapowal A et al.", year: 2015, title: "Echinacea reduces the risk of recurrent respiratory tract infections and complications: a meta-analysis of randomized controlled trials", journal: "Advances in Therapy", doi: "10.1007/s12325-015-0194-4", pmid: "25784510" },
    { authors: "Jawad M et al.", year: 2012, title: "Safety and Efficacy Profile of Echinacea purpurea to Prevent Common Cold Episodes: A Randomized, Double-Blind, Placebo-Controlled Trial", journal: "Evidence-Based Complementary and Alternative Medicine", doi: "10.1155/2012/841315", pmid: "23024696" },
    { authors: "Barrett B et al.", year: 2010, title: "Echinacea for treating the common cold: a randomized trial", journal: "Annals of Internal Medicine", doi: "10.7326/0003-4819-153-12-201012210-00003", pmid: "21173411" }
  ],
  54: [
    { authors: "Fallah AA et al.", year: 2018, title: "Effect of Chlorella supplementation on cardiovascular risk factors: A meta-analysis of randomized controlled trials", journal: "Clinical Nutrition", doi: "10.1016/j.clnu.2017.09.019", pmid: "29037431" },
    { authors: "Sherafati N et al.", year: 2022, title: "Effect of supplementation with Chlorella vulgaris on lipid profile in adults: A systematic review and dose-response meta-analysis", journal: "Complementary Therapies in Medicine", doi: "10.1016/j.ctim.2022.102822", pmid: "35331862" },
    { authors: "Kwak JH et al.", year: 2012, title: "Beneficial immunostimulatory effect of short-term Chlorella supplementation: enhancement of natural killer cell activity", journal: "Nutrition Journal", doi: "10.1186/1475-2891-11-53", pmid: "22849818" },
    { authors: "Chiu HF et al.", year: 2021, title: "Beneficial effect of Chlorella pyrenoidosa drink on healthy subjects: A randomized, placebo-controlled, double-blind, cross-over clinical trial", journal: "Journal of Food Biochemistry", doi: "10.1111/jfbc.13665", pmid: "33755227" },
    { authors: "Okada H et al.", year: 2018, title: "Effect of Chlorella Ingestion on Oxidative Stress and Fatigue Symptoms in Healthy Men", journal: "Kurume Medical Journal", doi: "10.2739/kurumemedj.MS644001", pmid: "29780062" }
  ],
  63: [
    { authors: "Peter EL et al.", year: 2019, title: "Momordica charantia L. lowers elevated glycaemia in type 2 diabetes mellitus patients: Systematic review and meta-analysis", journal: "Journal of Ethnopharmacology", doi: "10.1016/j.jep.2018.10.033", pmid: "30385422" },
    { authors: "Zhang X et al.", year: 2024, title: "Effects of Momordica charantia L. supplementation on glycemic control and lipid profile in type 2 diabetes mellitus patients", journal: "Heliyon", doi: "10.1016/j.heliyon.2024.e31126", pmid: "38784554" },
    { authors: "Laczko-Zold E et al.", year: 2024, title: "The metabolic effect of Momordica charantia cannot be determined based on the available clinical evidence", journal: "Frontiers in Nutrition", doi: "10.3389/fnut.2023.1200801", pmid: "38274207" },
    { authors: "Amini MR et al.", year: 2024, title: "The Effects of Bitter Melon on Lipid Profile: A Systematic Review and Meta-Analysis of Randomized Controlled Trials", journal: "Phytotherapy Research", doi: "10.1002/ptr.8357", pmid: "39444254" },
    { authors: "Kim SK et al.", year: 2020, title: "Hypoglycemic efficacy and safety of Momordica charantia in patients with type 2 diabetes mellitus", journal: "Complementary Therapies in Medicine", doi: "10.1016/j.ctim.2020.102524", pmid: "32951763" }
  ],
  66: [
    { authors: "de Moura SL et al.", year: 2025, title: "Effects of cinnamon supplementation on metabolic biomarkers in individuals with type 2 diabetes", journal: "Nutrition Reviews", doi: "10.1093/nutrit/nuae058", pmid: "38917435" },
    { authors: "Moridpour AH et al.", year: 2024, title: "The effect of cinnamon supplementation on glycemic control in patients with type 2 diabetes mellitus", journal: "Phytotherapy Research", doi: "10.1002/ptr.8026", pmid: "37818728" },
    { authors: "Zhou Q et al.", year: 2022, title: "Efficacy of cinnamon supplementation on glycolipid metabolism in T2DM diabetes", journal: "Frontiers in Physiology", doi: "10.3389/fphys.2022.960580", pmid: "36505061" },
    { authors: "Allen RW et al.", year: 2013, title: "Cinnamon use in type 2 diabetes: an updated systematic review and meta-analysis", journal: "Annals of Family Medicine", doi: "10.1370/afm.1517", pmid: "24019277" },
    { authors: "Akilen R et al.", year: 2012, title: "Cinnamon in glycaemic control: Systematic review and meta analysis", journal: "Clinical Nutrition", doi: "10.1016/j.clnu.2012.04.003", pmid: "22579946" }
  ],
  68: [
    { authors: "Park JY, Kim KH", year: 2016, title: "A randomized, double-blind, placebo-controlled trial of Schisandra chinensis for menopausal symptoms", journal: "Climacteric", doi: "10.1080/13697137.2016.1238453", pmid: "27763802" },
    { authors: "Park J et al.", year: 2020, title: "Effect of Schisandra Chinensis Extract Supplementation on Quadriceps Muscle Strength and Fatigue in Adult Women", journal: "Int J Environ Res Public Health", doi: "10.3390/ijerph17072475", pmid: "32260466" },
    { authors: "Cho YH et al.", year: 2021, title: "Effect of Schisandra chinensis Baillon extracts and regular low-intensity exercise on muscle strength and mass in older adults", journal: "American Journal of Clinical Nutrition", doi: "10.1093/ajcn/nqaa447", pmid: "33710261" },
    { authors: "Aslanyan G et al.", year: 2010, title: "Double-blind, placebo-controlled, randomised study of single dose effects of ADAPT-232 on cognitive functions", journal: "Phytomedicine", doi: "10.1016/j.phymed.2010.02.005", pmid: "20374974" },
    { authors: "Song MY et al.", year: 2015, title: "Schisandra chinensis fruit modulates the gut microbiota composition in association with metabolic markers in obese women", journal: "Nutrition Research", doi: "10.1016/j.nutres.2015.05.001", pmid: "26048342" }
  ],
  70: [
    { authors: "Godard MP et al.", year: 2005, title: "Body composition and hormonal adaptations associated with forskolin consumption in overweight and obese men", journal: "Obesity Research", doi: "10.1038/oby.2005.162", pmid: "16129715" },
    { authors: "Loftus HL et al.", year: 2015, title: "Coleus forskohlii Extract Supplementation in Conjunction with a Hypocaloric Diet Reduces the Risk Factors of Metabolic Syndrome", journal: "Nutrients", doi: "10.3390/nu7115483", pmid: "26593941" },
    { authors: "Henderson S et al.", year: 2005, title: "Effects of coleus forskohlii supplementation on body composition and hematological profiles in mildly overweight women", journal: "J Int Soc Sports Nutr", doi: "10.1186/1550-2783-2-2-54", pmid: "18500958" },
    { authors: "Majeed M et al.", year: 2015, title: "Efficacy and safety of 1% forskolin eye drops in open angle glaucoma - An open label study", journal: "Saudi Journal of Ophthalmology", doi: "10.1016/j.sjopt.2015.02.003", pmid: "26155078" },
    { authors: "Gonzalez-Sanchez R et al.", year: 2006, title: "Forskolin versus sodium cromoglycate for prevention of asthma attacks: a single-blinded clinical trial", journal: "J Int Med Res", doi: "10.1177/147323000603400210", pmid: "16749416" }
  ],
  71: [
    { authors: "Yu G et al.", year: 2020, title: "Effectiveness of Boswellia and Boswellia extract for osteoarthritis patients: a systematic review and meta-analysis", journal: "BMC Complement Med Ther", doi: "10.1186/s12906-020-02985-6", pmid: "32680575" },
    { authors: "Dubey V et al.", year: 2024, title: "Efficacy evaluation of standardized Boswellia serrata extract (Aflapin) in osteoarthritis", journal: "Explore", doi: "10.1016/j.explore.2024.02.001", pmid: "38365549" },
    { authors: "Holtmeier W et al.", year: 2011, title: "Randomized, placebo-controlled, double-blind trial of Boswellia serrata in maintaining remission of Crohn's disease", journal: "Inflammatory Bowel Diseases", doi: "10.1002/ibd.21345", pmid: "20848527" },
    { authors: "Kirste S et al.", year: 2011, title: "Boswellia serrata acts on cerebral edema in patients irradiated for brain tumors", journal: "Cancer", doi: "10.1002/cncr.25945", pmid: "21287538" },
    { authors: "Gupta I et al.", year: 1998, title: "Effects of Boswellia serrata gum resin in patients with bronchial asthma", journal: "Eur J Med Res", doi: "", pmid: "9810030" }
  ],
  72: [
    { authors: "Li S et al.", year: 2024, title: "Administration of silymarin in NAFLD/NASH: A systematic review and meta-analysis", journal: "Annals of Hepatology", doi: "10.1016/j.aohep.2023.101174", pmid: "38579127" },
    { authors: "Zhong S et al.", year: 2017, title: "The therapeutic effect of silymarin in the treatment of nonalcoholic fatty disease: A meta-analysis (PRISMA)", journal: "Medicine (Baltimore)", doi: "10.1097/MD.0000000000009061", pmid: "29245314" },
    { authors: "Tao L et al.", year: 2019, title: "Prophylactic Therapy of Silymarin on Antituberculosis Drug-Induced Liver Injury: A Meta-Analysis", journal: "Can J Gastroenterol Hepatol", doi: "10.1155/2019/3192351", pmid: "30733935" },
    { authors: "Xiao F et al.", year: 2020, title: "The therapeutic effects of silymarin for patients with glucose/lipid metabolic dysfunction: A meta-analysis", journal: "Medicine (Baltimore)", doi: "10.1097/MD.0000000000022249", pmid: "33019400" },
    { authors: "Kheong CW et al.", year: 2017, title: "A Randomized Trial of Silymarin for the Treatment of Nonalcoholic Steatohepatitis", journal: "Clin Gastroenterol Hepatol", doi: "10.1016/j.cgh.2017.04.016", pmid: "28419855" }
  ],
  74: [
    { authors: "Hawkins J et al.", year: 2019, title: "Black elderberry (Sambucus nigra) supplementation effectively treats upper respiratory symptoms: A meta-analysis", journal: "Complement Ther Med", doi: "10.1016/j.ctim.2018.12.004", pmid: "30670267" },
    { authors: "Wieland LS et al.", year: 2021, title: "Elderberry for prevention and treatment of viral respiratory illnesses: a systematic review", journal: "BMC Complement Med Ther", doi: "10.1186/s12906-021-03283-5", pmid: "33827515" },
    { authors: "Tiralongo E et al.", year: 2016, title: "Elderberry Supplementation Reduces Cold Duration and Symptoms in Air-Travellers", journal: "Nutrients", doi: "10.3390/nu8040182", pmid: "27023596" },
    { authors: "Zakay-Rones Z et al.", year: 2004, title: "Randomized study of the efficacy and safety of oral elderberry extract in the treatment of influenza A and B virus infections", journal: "J Int Med Res", doi: "10.1177/147323000403200205", pmid: "15080016" },
    { authors: "Macknin M et al.", year: 2020, title: "Elderberry Extract Outpatient Influenza Treatment for Emergency Room Patients Ages 5 and Above", journal: "J Gen Intern Med", doi: "10.1007/s11606-020-06170-w", pmid: "32929634" }
  ]
};

// ============================================================
// STEP 1: Add citationIds to existing evidence items
// ============================================================

function addCitationIds(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  // Find evidence blocks with pmid but no citationId
  // Use a simpler approach: find each "pmid" and check if nearby there's a citationId
  const lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('"pmid"') && line.includes(':')) {
      // Check previous 15 lines for citationId
      let hasCitId = false;
      let objStart = -1;
      for (let j = Math.max(0, i - 15); j < i; j++) {
        if (lines[j].includes('"citationId"')) hasCitId = true;
        if (lines[j].trim() === '{') objStart = j;
      }

      if (!hasCitId && objStart >= 0) {
        // Extract author and year from nearby lines
        let authorLine = '', yearLine = '', titleLine = '';
        for (let j = objStart; j <= Math.min(lines.length - 1, i + 5); j++) {
          if (lines[j].includes('"authors"')) authorLine = lines[j];
          if (lines[j].includes('"year"')) yearLine = lines[j];
          if (lines[j].includes('"title"')) titleLine = lines[j];
        }

        const authorMatch = authorLine.match(/"authors":\s*"([^"]+)"/);
        const yearMatch = yearLine.match(/"year":\s*(\d{4})/);
        const titleMatch = titleLine.match(/"title":\s*"([^"]+)"/);

        if (authorMatch && yearMatch) {
          const firstAuthor = authorMatch[1].split(/[\s,]/)[0].toLowerCase().replace(/[^a-z]/g, '');
          const year = yearMatch[1];
          let topic = 'study';
          if (titleMatch) {
            topic = titleMatch[1].toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
              .filter(w => w.length > 3 && !['with','from','that','this','were','been','have','does','will','their','based','using','study','review','analysis','randomized','controlled','double','blind','placebo','clinical','trial','effects','effect','systematic'].includes(w))
              .slice(0, 2).join('_') || 'study';
          }
          const citId = firstAuthor + '_' + year + '_' + topic;

          // Insert citationId line after the opening {
          lines.splice(objStart + 1, 0, lines[objStart].replace('{', '') + '            "citationId": "' + citId + '",');
          i++; // Adjust index since we inserted a line
          modified = true;
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('  Added citationIds to ' + fileName);
  }
  return modified;
}

// ============================================================
// STEP 2: Inject new papers into enhanced files
// ============================================================

function injectNewPapers(id, papers) {
  const files = fs.readdirSync(ENHANCED_DIR).filter(f => f.startsWith(id + '_'));
  if (!files.length) { console.log('  No file for ID ' + id); return; }

  const filePath = path.join(ENHANCED_DIR, files[0]);
  let content = fs.readFileSync(filePath, 'utf8');

  for (const paper of papers) {
    if (content.includes('"' + paper.pmid + '"')) {
      console.log('  PMID ' + paper.pmid + ' already in ' + files[0] + ', skipping');
      continue;
    }

    const evidenceBlock = '\n          {\n' +
      '            "citationId": "' + paper.citationId + '",\n' +
      '            "title": ' + JSON.stringify(paper.title) + ',\n' +
      '            "authors": "' + paper.authors + '",\n' +
      '            "journal": "' + paper.journal + '",\n' +
      '            "year": ' + paper.year + ',\n' +
      '            "doi": "' + paper.doi + '",\n' +
      '            "pmid": "' + paper.pmid + '",\n' +
      '            "studyType": "' + paper.studyType + '",\n' +
      '            "sampleSize": "' + paper.sampleSize + '",\n' +
      '            "duration": "' + paper.duration + '",\n' +
      '            "keyFindings": ' + JSON.stringify(paper.keyFindings, null, 14).replace(/\n/g, '\n            ') + '\n' +
      '          }';

    const section = paper.section || 'benefits';
    const sectionPattern = '"' + section + '": [';
    const sectionIdx = content.indexOf(sectionPattern);

    if (sectionIdx >= 0) {
      // Find the last evidence array in this section
      let depth = 0;
      let sectionEnd = -1;
      const startSearch = sectionIdx + sectionPattern.length;
      for (let i = startSearch - 1; i < content.length; i++) {
        if (content[i] === '[') depth++;
        if (content[i] === ']') {
          depth--;
          if (depth === 0) { sectionEnd = i; break; }
        }
      }

      if (sectionEnd > 0) {
        // Find the last "evidence" array within section bounds
        const sectionSlice = content.substring(sectionIdx, sectionEnd);
        let lastEvidenceIdx = -1;
        let searchFrom = 0;
        while (true) {
          const idx = sectionSlice.indexOf('"evidence":', searchFrom);
          if (idx < 0) break;
          lastEvidenceIdx = idx;
          searchFrom = idx + 1;
        }

        if (lastEvidenceIdx >= 0) {
          const absEvidenceStart = sectionIdx + lastEvidenceIdx;
          const bracketStart = content.indexOf('[', absEvidenceStart);

          if (bracketStart > 0) {
            let edepth = 0;
            let evidenceEnd = -1;
            for (let i = bracketStart; i < content.length; i++) {
              if (content[i] === '[') edepth++;
              if (content[i] === ']') {
                edepth--;
                if (edepth === 0) { evidenceEnd = i; break; }
              }
            }

            if (evidenceEnd > 0) {
              content = content.substring(0, evidenceEnd) + ',' + evidenceBlock + '\n        ' + content.substring(evidenceEnd);
              console.log('  Injected PMID ' + paper.pmid + ' (' + paper.citationId + ') into ' + section);
            }
          }
        }
      }
    } else {
      console.log('  WARNING: Could not find "' + section + '" section in ' + files[0]);
    }
  }

  // Update totalCitations
  const pmidCount = (content.match(/"pmid":\s*"\d+"/g) || []).length;
  content = content.replace(/"totalCitations":\s*\d+/, '"totalCitations": ' + pmidCount);
  content = content.replace(/"lastEvidenceUpdate":\s*"[^"]*"/, '"lastEvidenceUpdate": "2026-03-22"');

  fs.writeFileSync(filePath, content, 'utf8');
}

// ============================================================
// STEP 3: Update keyCitations in supplements.js
// ============================================================

function updateKeyCitations() {
  let content = fs.readFileSync(SUPPS_FILE, 'utf8');

  for (const idStr of Object.keys(keyCitations)) {
    const id = parseInt(idStr);
    const citations = keyCitations[idStr];

    const idPattern = new RegExp('"id":\\s*' + id + '\\b');
    const idMatch = idPattern.exec(content);
    if (!idMatch) { console.log('  Could not find supplement ID ' + id); continue; }

    const searchStart = idMatch.index;
    const keyCitIdx = content.indexOf('"keyCitations"', searchStart);
    if (keyCitIdx < 0 || keyCitIdx > searchStart + 5000) {
      console.log('  Could not find keyCitations for ID ' + id);
      continue;
    }

    const arrayStart = content.indexOf('[', keyCitIdx);
    if (arrayStart < 0) continue;

    let depth = 0;
    let arrayEnd = -1;
    for (let i = arrayStart; i < content.length; i++) {
      if (content[i] === '[') depth++;
      if (content[i] === ']') {
        depth--;
        if (depth === 0) { arrayEnd = i + 1; break; }
      }
    }

    if (arrayEnd < 0) continue;

    const citStrings = citations.map(function(c) {
      return '{ authors: "' + c.authors + '", year: ' + c.year + ', title: "' + c.title + '", journal: "' + c.journal + '", doi: "' + c.doi + '", pmid: "' + c.pmid + '" }';
    });

    const newArray = '[\n          ' + citStrings.join(',\n          ') + '\n        ]';

    content = content.substring(0, arrayStart) + newArray + content.substring(arrayEnd);
    console.log('  Updated keyCitations for ID ' + id + ' (' + citations.length + ' citations)');
  }

  fs.writeFileSync(SUPPS_FILE, content, 'utf8');
}

// ============================================================
// MAIN
// ============================================================

console.log('=== Wave 2 Enhanced Citation Update ===\n');

console.log('Step 1: Adding citationIds to existing evidence...');
const enhancedFiles = fs.readdirSync(ENHANCED_DIR).filter(function(f) { return f.endsWith('_enhanced.js'); });
const targetIds = [49, 54, 63, 66, 68, 70, 71, 72, 74];
for (const file of enhancedFiles) {
  const fileId = parseInt(file.split('_')[0]);
  if (targetIds.includes(fileId)) {
    addCitationIds(path.join(ENHANCED_DIR, file));
  }
}

console.log('\nStep 2: Injecting new agent papers...');
for (const idStr of Object.keys(newPapers)) {
  const id = parseInt(idStr);
  console.log('\n  Processing ID ' + id + '...');
  injectNewPapers(id, newPapers[idStr]);
}

console.log('\nStep 3: Updating keyCitations in supplements.js...');
updateKeyCitations();

console.log('\n=== Wave 2 Update Complete ===');
console.log('Next: Run verify-citations.js on each supplement');
