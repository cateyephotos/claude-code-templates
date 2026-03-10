#!/usr/bin/env node
/**
 * SupplementDB — Health Domain Guide Generator
 * Generates evidence-based guide pages from supplements.js data.
 * Uses the light clinical journal theme (about.html pattern).
 *
 * Usage:  node scripts/generate-guide-pages.js
 */

const fs = require('fs');
const path = require('path');
const {
    loadSupplementData,
    normalizeCategory,
    slugify,
    getTierLabel,
    getTierColor,
} = require('./parse-data');

// ─── Guide Definitions ──────────────────────────────────────────────────────
const GUIDES = [
    {
        slug: 'anxiety-stress',
        title: 'Evidence-Based Supplements for Anxiety & Stress Relief',
        shortTitle: 'Anxiety & Stress Relief',
        metaTitle: 'Best Supplements for Anxiety & Stress (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to the best supplements for anxiety and stress relief. Ranked by evidence tier from 471+ peer-reviewed studies. Includes dosages, mechanisms, and safety profiles.',
        breadcrumb: 'Anxiety & Stress Relief',
        heroSubtitle: 'A systematic review of supplements studied for anxiety reduction, stress resilience, and cortisol management — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            // Match by effectSize KEYS (not stringified values) for precision
            const anxietyKeys = ['anxiety','anxietyReduction','anxiety_reduction',
                'stress','stressReduction','stressReactivity','stress_reduction','stress_markers',
                'cortisol','cortisolReduction','relaxation','serotonin',
                'mood','moodEnhancement','mood_enhancement','mood_improvement',
                'sleepQuality','sleep_quality','sleep','sleepOnsetLatency',
                'pms_total','pms_physical'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => anxietyKeys.includes(k));
        },
        // Core supplements to feature prominently (in evidence order)
        coreSuppNames: [
            'Ashwagandha', 'Magnesium', 'L-Theanine', 'Passionflower',
            'Rhodiola rosea', '5-HTP', 'Holy Basil', 'Inositol', 'Kanna', 'GABA'
        ],
        snippetDefinition: 'Evidence-based anxiety supplements are dietary compounds studied in peer-reviewed clinical trials for their effects on anxiety symptoms, stress biomarkers such as cortisol, and related mood outcomes. The strongest evidence exists for ashwagandha (SMD = −6.87 across 22 RCTs), magnesium, and L-theanine, with multiple randomized controlled trials supporting their anxiolytic properties.',
        snippetListTitle: 'Top 10 Evidence-Based Supplements for Anxiety & Stress',
        introduction: `Anxiety disorders affect approximately 301 million people worldwide, making them the most prevalent mental health condition globally (WHO, 2023). While pharmaceutical interventions remain the clinical standard of care, a growing body of peer-reviewed research has investigated the anxiolytic potential of dietary supplements and natural compounds.

This guide systematically reviews the supplements with the strongest clinical evidence for anxiety reduction and stress management. Each recommendation is grounded in published randomized controlled trials (RCTs), systematic reviews, and meta-analyses — not anecdotal reports or marketing claims.

<strong>Important:</strong> This guide is for informational purposes only. Supplements are not a replacement for evidence-based psychological or pharmacological treatments. Always consult a qualified healthcare professional before starting any supplement regimen, particularly if you are taking medications or have a diagnosed anxiety disorder.`,
        mechanismsIntro: `The supplements reviewed in this guide work through several distinct neurobiological pathways. Understanding these mechanisms helps explain why certain supplements may be more appropriate for specific types of anxiety or stress responses.`,
        mechanisms: [
            {
                name: 'HPA Axis Modulation',
                description: 'The hypothalamic-pituitary-adrenal (HPA) axis is the body\'s central stress response system. Several supplements — most notably ashwagandha, rhodiola, and holy basil — have been shown to normalize HPA axis activity and reduce circulating cortisol levels. Ashwagandha demonstrates particularly large effects on cortisol (SMD = −1.18 across 23 trials, n = 1,706).',
                supplements: ['Ashwagandha', 'Rhodiola rosea', 'Holy Basil', 'Phosphatidylserine']
            },
            {
                name: 'GABAergic Enhancement',
                description: 'Gamma-aminobutyric acid (GABA) is the brain\'s primary inhibitory neurotransmitter and plays a central role in anxiety regulation. Multiple supplements in this guide enhance GABAergic signaling — either by directly activating GABA receptors, increasing GABA synthesis, or modulating GABA receptor sensitivity.',
                supplements: ['L-Theanine', 'Passionflower', 'Magnesium', 'Ashwagandha', 'GABA', 'Kanna']
            },
            {
                name: 'Serotonergic Modulation',
                description: 'Serotonin (5-HT) pathways are intimately involved in mood regulation and anxiety. Several supplements influence serotonin synthesis, reuptake, or receptor activity. 5-HTP is a direct precursor that bypasses the rate-limiting tryptophan hydroxylase step, while kanna acts as a natural serotonin reuptake inhibitor.',
                supplements: ['5-HTP', 'Kanna', 'Inositol', 'L-Theanine']
            },
            {
                name: 'Neurotransmitter Balance',
                description: 'Some supplements support anxiety relief through broader neurotransmitter modulation — influencing dopamine, norepinephrine, and glutamate systems alongside GABA and serotonin. This multi-target approach may explain why certain adaptogens show effects across multiple anxiety subtypes.',
                supplements: ['Rhodiola rosea', 'Magnesium', 'Holy Basil']
            }
        ],
        safetyIntro: `While the supplements in this guide have generally favorable safety profiles in published clinical trials, several important considerations apply to anxiety-related supplementation specifically.`,
        safetyNotes: [
            '<strong>Serotonin syndrome risk:</strong> 5-HTP, kanna, and other serotonergic supplements must not be combined with SSRIs, SNRIs, or MAO inhibitors without medical supervision. Serotonin syndrome is a potentially life-threatening condition.',
            '<strong>Sedation interactions:</strong> L-theanine, passionflower, GABA, and magnesium may enhance the effects of sedative medications, benzodiazepines, and alcohol. Dosage adjustments may be necessary.',
            '<strong>Thyroid interactions:</strong> Ashwagandha may affect thyroid hormone levels and should be used with caution in individuals with thyroid disorders or those taking thyroid medications.',
            '<strong>Pregnancy and lactation:</strong> Most supplements in this guide lack sufficient safety data for use during pregnancy or breastfeeding. Consult a healthcare provider before use.',
            '<strong>Medication timing:</strong> Magnesium can interfere with the absorption of certain antibiotics, bisphosphonates, and other medications. Separate dosing by at least 2 hours.',
            '<strong>Withdrawal considerations:</strong> Individuals currently taking prescription anxiolytics should not discontinue medication in favor of supplements without medical guidance.'
        ],
        researchGaps: [
            'Long-term safety data (>12 months) for most anxiety-related supplements remains limited',
            'Head-to-head comparisons between supplements are rare — most trials compare against placebo only',
            'Dose-response relationships are poorly characterized for many compounds',
            'Effects in clinically diagnosed anxiety disorders (GAD, social anxiety, panic disorder) vs. subclinical stress are often not differentiated',
            'Combination/stack protocols lack controlled trial evidence despite widespread consumer use',
            'Bioavailability differences between supplement forms (e.g., magnesium glycinate vs. oxide) need systematic comparison'
        ],
        relatedLinks: [
            { href: '../guides/sleep.html', icon: 'fa-moon', text: 'Sleep Quality Guide' },
            { href: '../guides/cognitive-performance.html', icon: 'fa-brain', text: 'Cognitive Performance Guide' },
            { href: '../categories/adaptogens.html', icon: 'fa-leaf', text: 'Browse Adaptogens' },
            { href: '../categories/amino-acids.html', icon: 'fa-atom', text: 'Browse Amino Acids' },
            { href: '../categories/herbal-extracts.html', icon: 'fa-seedling', text: 'Browse Herbal Extracts' },
            { href: '../compare/ashwagandha-vs-rhodiola.html', icon: 'fa-scale-balanced', text: 'Ashwagandha vs Rhodiola' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'cognitive-performance',
        title: 'Evidence-Based Supplements for Cognitive Performance',
        shortTitle: 'Cognitive Performance',
        metaTitle: 'Best Nootropics & Brain Supplements (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to the best supplements for memory, focus, and cognitive performance. Ranked by evidence from 471+ peer-reviewed studies with dosages and safety data.',
        breadcrumb: 'Cognitive Performance',
        heroSubtitle: 'A systematic review of nootropics and cognitive enhancers studied for memory, focus, and brain health — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            // Match by Nootropics category OR cognitive-specific effectSize KEYS
            const cogKeys = ['memory','memoryEnhancement','memoryImprovement','memoryHighDose','memoryOverall',
                'memory_elderly','memory_enhancement','memory_mci','composite_memory',
                'cognition','cognitive_function','cognitive_speed','cognitive_protection','cognitive_aging',
                'cognitive_decline','cognitive_energy','cognitive_under_stress',
                'cognitiveClarity','cognitiveEndurance','cognitiveEnergy','cognitiveFlexibility',
                'cognitiveImprovement','cognitiveProtection','cognitiveSupport',
                'attention','attentionEnhancement','attentionExecutive','attentionSwitching','adhd_attention',
                'executive_function','executiveFunction','stroop_executive',
                'focus','focusImprovement',
                'workingMemory','workingMemoryHighDose',
                'learningImprovement','learning_capacity',
                'mentalFatigue','mental_clarity',
                'cerebral_blood_flow','cerebral_circulation',
                'acute_cognition','adasCog','adas_cog_mci','dementiaCognition','mciCognition','vciCognition',
                'reaction_time','choiceReactionTime','visualReactionTime',
                'nerve_regeneration','neurotransmitters','dopamineSupport',
                'scag_vs_citicoline','mmse','alzheimersFunctional','motorFunction'];
            const cat = normalizeCategory(s.category);
            const eKeys = Object.keys(s.effectSizes || {});
            return cat === 'Nootropics' || eKeys.some(k => cogKeys.includes(k));
        },
        coreSuppNames: [
            'Bacopa monnieri', "Lion's Mane Mushroom", 'Alpha-GPC', 'Ginkgo Biloba',
            'Creatine', 'Citicoline', 'Phosphatidylserine', 'Acetyl-L-Carnitine',
            'Huperzine A', 'Caffeine'
        ],
        snippetDefinition: 'Nootropic supplements are compounds studied in clinical trials for their effects on cognitive function, including memory, attention, processing speed, and executive function. The strongest evidence exists for bacopa monnieri (ranked #1 for executive function, SUCRA 91%), creatine, and citicoline, with multiple randomized controlled trials demonstrating measurable cognitive benefits.',
        snippetListTitle: 'Top 10 Evidence-Based Supplements for Cognitive Performance',
        introduction: `Cognitive decline affects millions worldwide, and interest in evidence-based cognitive enhancement has grown substantially. Nootropic supplements — compounds studied for their effects on memory, focus, and brain health — represent one of the fastest-growing supplement categories.

This guide systematically reviews the supplements with the strongest clinical evidence for cognitive performance enhancement. Each recommendation is grounded in published randomized controlled trials (RCTs), systematic reviews, and meta-analyses.

<strong>Important:</strong> This guide is for informational purposes only. Cognitive supplements are not replacements for healthy lifestyle factors including sleep, exercise, and nutrition. Always consult a healthcare professional before starting any supplement regimen.`,
        mechanismsIntro: `Cognitive-enhancing supplements work through several distinct neurobiological pathways. Understanding these mechanisms helps match supplements to specific cognitive goals.`,
        mechanisms: [
            {
                name: 'Cholinergic Enhancement',
                description: 'Acetylcholine is the primary neurotransmitter involved in memory formation and learning. Several nootropics enhance cholinergic signaling by providing choline precursors, inhibiting acetylcholinesterase, or modulating receptor sensitivity.',
                supplements: ['Alpha-GPC', 'Citicoline', 'Huperzine A', 'Bacopa monnieri']
            },
            {
                name: 'Neurotrophic Factor Support',
                description: 'Brain-derived neurotrophic factor (BDNF) and nerve growth factor (NGF) are critical for neuroplasticity, neurogenesis, and synaptic maintenance. Some supplements stimulate the production of these growth factors.',
                supplements: ["Lion's Mane Mushroom", 'Bacopa monnieri', 'Phosphatidylserine']
            },
            {
                name: 'Cellular Energy Metabolism',
                description: 'Neurons have extremely high energy demands. Supplements that support mitochondrial function and ATP production can enhance cognitive performance, particularly under demanding conditions.',
                supplements: ['Creatine', 'Acetyl-L-Carnitine', 'CoQ10']
            },
            {
                name: 'Cerebrovascular Support',
                description: 'Adequate cerebral blood flow is essential for cognitive function. Some supplements improve blood flow to the brain through vasodilation or improved microcirculation.',
                supplements: ['Ginkgo Biloba', 'Bacopa monnieri', 'Caffeine']
            }
        ],
        safetyIntro: `Cognitive supplements generally have favorable safety profiles, but several important interactions and considerations apply.`,
        safetyNotes: [
            '<strong>Cholinergic overload:</strong> Combining multiple cholinergic supplements (Alpha-GPC + Huperzine A + Citicoline) may cause headaches, nausea, or GI distress. Start with one and titrate carefully.',
            '<strong>Stimulant interactions:</strong> Caffeine and other stimulating nootropics may potentiate prescription stimulants (e.g., methylphenidate, amphetamines). Medical supervision is required.',
            '<strong>Blood-thinning effects:</strong> Ginkgo biloba has antiplatelet properties and should not be combined with anticoagulants (warfarin, aspirin) without medical supervision.',
            '<strong>Thyroid sensitivity:</strong> Some nootropics may affect thyroid function. Monitor thyroid parameters if taking thyroid medication.',
            '<strong>Sleep disruption:</strong> Stimulating nootropics (caffeine, Alpha-GPC, creatine at high doses) should be taken earlier in the day to avoid sleep interference.',
            '<strong>Pregnancy and lactation:</strong> Most nootropics lack safety data for pregnant or breastfeeding individuals. Consult a healthcare provider.'
        ],
        researchGaps: [
            'Long-term cognitive effects (>12 months) of most nootropics remain understudied',
            'Optimal dosing for different cognitive domains (memory vs. attention vs. executive function) is poorly characterized',
            'Nootropic stack synergies and interactions lack controlled trial evidence',
            'Effects in healthy young adults vs. older adults with cognitive decline often differ significantly',
            'Bioavailability and blood-brain barrier penetration vary substantially between supplement forms',
            'Individual genetic variation in response to nootropics (pharmacogenomics) is an emerging but underdeveloped field'
        ],
        relatedLinks: [
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../guides/sleep.html', icon: 'fa-moon', text: 'Sleep Quality Guide' },
            { href: '../categories/nootropics.html', icon: 'fa-brain', text: 'Browse Nootropics' },
            { href: '../categories/amino-acids.html', icon: 'fa-atom', text: 'Browse Amino Acids' },
            { href: '../compare/bacopa-vs-ginkgo.html', icon: 'fa-scale-balanced', text: 'Bacopa vs Ginkgo' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'cardiovascular',
        title: 'Evidence-Based Supplements for Cardiovascular Health',
        shortTitle: 'Cardiovascular Health',
        metaTitle: 'Best Supplements for Heart Health (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to the best supplements for heart health, blood pressure, and cholesterol. Ranked by evidence from 471+ studies with dosages and safety profiles.',
        breadcrumb: 'Cardiovascular Health',
        heroSubtitle: 'A systematic review of supplements studied for heart health, blood pressure management, lipid profiles, and vascular function — ranked by clinical evidence.',
        filterFn: (s) => {
            // Match by cardiovascular-specific effectSize KEYS
            const cvKeys = ['cardiovascular','cardiovascularBenefit','cardiovascularMortality','cardiovascular_markers',
                'bloodPressure','blood_pressure','systolic_blood_pressure',
                'cholesterol','cholesterolReduction','cholesterol_reduction','ldl_cholesterol',
                'triglycerides','lipidProfile','lipidsAndBP',
                'endothelialFunction','FMD_endothelial',
                'heart_function','homocysteine',
                'circulationEnhancement','circulationImprovement'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => cvKeys.includes(k));
        },
        coreSuppNames: [
            'Omega-3 Fatty Acids', 'CoQ10', 'Magnesium', 'Berberine',
            'Garlic', 'Red Yeast Rice', 'Grape Seed Extract', 'Hawthorn Berry'
        ],
        snippetDefinition: 'Cardiovascular supplements are dietary compounds studied in clinical trials for their effects on heart health, blood pressure, cholesterol levels, and vascular function. The strongest evidence exists for omega-3 fatty acids, CoQ10, and magnesium, with large-scale randomized controlled trials and meta-analyses supporting their cardioprotective properties.',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Heart Health',
        introduction: `Cardiovascular disease remains the leading cause of death worldwide, responsible for approximately 17.9 million deaths annually (WHO). While lifestyle modifications and pharmaceutical interventions form the cornerstone of prevention and treatment, a substantial body of peer-reviewed research has investigated the cardioprotective potential of dietary supplements.

This guide systematically reviews the supplements with the strongest clinical evidence for cardiovascular health outcomes including blood pressure, lipid profiles, arterial function, and overall heart health.

<strong>Important:</strong> This guide is for informational purposes only. Cardiovascular supplements are not replacements for prescribed medications such as statins, antihypertensives, or anticoagulants. Always consult a cardiologist or qualified healthcare professional before starting any supplement, particularly if you have existing cardiovascular disease.`,
        mechanismsIntro: `Cardiovascular supplements work through several distinct pathways to support heart health. Understanding these mechanisms helps explain their clinical applications.`,
        mechanisms: [
            {
                name: 'Lipid Metabolism Modulation',
                description: 'Several supplements influence cholesterol synthesis, LDL oxidation, or triglyceride metabolism. Berberine activates AMPK to reduce hepatic cholesterol synthesis (similar to statin mechanisms), while omega-3 fatty acids reduce triglycerides by decreasing hepatic VLDL production.',
                supplements: ['Berberine', 'Omega-3 Fatty Acids', 'Red Yeast Rice', 'Garlic Extract']
            },
            {
                name: 'Endothelial Function & Vasodilation',
                description: 'Healthy endothelial function is critical for blood pressure regulation and vascular health. Several supplements improve nitric oxide bioavailability or reduce endothelial dysfunction through antioxidant mechanisms.',
                supplements: ['Grape Seed Extract', 'CoQ10', 'Magnesium', 'Garlic Extract']
            },
            {
                name: 'Mitochondrial & Antioxidant Support',
                description: 'The heart has the highest mitochondrial density of any organ. CoQ10 is an essential component of the mitochondrial electron transport chain and also serves as a potent lipid-soluble antioxidant, protecting LDL from oxidation.',
                supplements: ['CoQ10', 'Omega-3 Fatty Acids', 'Grape Seed Extract']
            },
            {
                name: 'Blood Pressure Regulation',
                description: 'Multiple pathways contribute to blood pressure regulation. Magnesium supports vasodilation and electrolyte balance, garlic promotes hydrogen sulfide and nitric oxide production, and hawthorn berry contains flavonoids that support cardiac contractility.',
                supplements: ['Magnesium', 'Garlic Extract', 'Hawthorn Berry', 'CoQ10']
            }
        ],
        safetyIntro: `Cardiovascular supplements require particular caution due to potential interactions with commonly prescribed heart medications.`,
        safetyNotes: [
            '<strong>Anticoagulant interactions:</strong> Omega-3 fatty acids, garlic extract, and hawthorn berry may enhance the effects of blood thinners (warfarin, aspirin, clopidogrel). INR monitoring is essential.',
            '<strong>Statin interactions:</strong> Red yeast rice contains monacolin K (identical to lovastatin) and must not be combined with prescription statins due to additive myopathy and rhabdomyolysis risk.',
            '<strong>Blood pressure medications:</strong> Magnesium, garlic, and hawthorn may potentiate antihypertensive medications, increasing hypotension risk. Blood pressure monitoring is required.',
            '<strong>Diabetes medications:</strong> Berberine has significant glucose-lowering effects and may cause hypoglycemia when combined with metformin, insulin, or sulfonylureas.',
            '<strong>CoQ10 and chemotherapy:</strong> CoQ10 may reduce the efficacy of certain chemotherapy drugs. Consult an oncologist if undergoing cancer treatment.',
            '<strong>Surgical risk:</strong> Discontinue omega-3, garlic, and other blood-thinning supplements at least 2 weeks before planned surgery.'
        ],
        researchGaps: [
            'Long-term cardiovascular outcome trials (MACE endpoints) for most individual supplements are limited',
            'Optimal dosing for primary vs. secondary prevention is poorly established',
            'Interactions between cardiovascular supplements and standard-of-care medications need more systematic study',
            'Genetic variation in response to cardiovascular supplements (e.g., APOE genotype and omega-3 response) is underexplored',
            'Combination supplement protocols lack head-to-head trial evidence',
            'Quality and standardization issues in supplement manufacturing remain a significant concern for cardiovascular applications'
        ],
        relatedLinks: [
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../guides/sleep.html', icon: 'fa-moon', text: 'Sleep Quality Guide' },
            { href: '../categories/essential-nutrients.html', icon: 'fa-capsules', text: 'Browse Essential Nutrients' },
            { href: '../categories/antioxidants.html', icon: 'fa-shield-halved', text: 'Browse Antioxidants' },
            { href: '../compare/omega-3-vs-coq10.html', icon: 'fa-scale-balanced', text: 'Omega-3 vs CoQ10' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },

    // ── Phase 3 Guides ──────────────────────────────────────────────────────

    {
        slug: 'immune-function',
        title: 'Evidence-Based Supplements for Immune Function',
        shortTitle: 'Immune Function',
        metaTitle: 'Best Supplements for Immune Support (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to the best supplements for immune function, cold prevention, and immune resilience. Ranked by evidence from peer-reviewed studies with dosages and safety data.',
        breadcrumb: 'Immune Function',
        heroSubtitle: 'A systematic review of supplements studied for immune defense, infection prevention, and immune modulation — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const immuneKeys = ['immune_function','immune_markers','immuneSupport','immuneModulation',
                'cold_prevention','cold_duration','allergyRelief','allergy_markers',
                'antioxidant_status','antioxidantActivity','antioxidant_protection',
                'inflammation','antiInflammatory','anti_inflammatory',
                'nk_cell_activity','white_blood_cells','cytokine_modulation',
                'infection_risk','viral_load','respiratory_infections'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => immuneKeys.includes(k));
        },
        coreSuppNames: [
            'Vitamin C', 'Zinc', 'Elderberry', 'Echinacea',
            'Selenium', 'Spirulina', 'Reishi Mushroom', 'Garlic'
        ],
        snippetDefinition: 'Immune-supporting supplements are compounds studied in clinical trials for their effects on immune cell function, infection risk, cold duration, and inflammatory biomarkers. The strongest evidence exists for Vitamin C, Zinc, and Elderberry, with multiple randomized controlled trials demonstrating measurable effects on cold duration, immune cell activity, and upper respiratory infection outcomes.',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Immune Support',
        introduction: `The human immune system is a complex network of cells, tissues, and signaling molecules that defend against pathogens and maintain tissue homeostasis. While no supplement can replace a healthy lifestyle — adequate sleep, regular exercise, balanced nutrition, and stress management form the foundation of immune health — a growing body of peer-reviewed research has identified specific nutrients and botanical compounds that may support optimal immune function.

This guide systematically reviews the supplements with the strongest clinical evidence for immune support, cold prevention, and immune modulation. Each recommendation is grounded in published randomized controlled trials (RCTs), systematic reviews, and meta-analyses.

<strong>Important:</strong> This guide is for informational purposes only. Supplements are not substitutes for vaccines, prescribed antimicrobials, or professional medical care for immune disorders. Always consult a qualified healthcare professional before starting any supplement regimen, particularly if you have an autoimmune condition, are immunocompromised, or take immunosuppressive medications.`,
        mechanismsIntro: `Immune-supporting supplements work through several distinct immunological pathways. Understanding these mechanisms helps explain why certain supplements may be more appropriate for specific aspects of immune health.`,
        mechanisms: [
            {
                name: 'Innate Immune Enhancement',
                description: 'The innate immune system provides the first line of defense against pathogens through natural killer (NK) cells, macrophages, and neutrophils. Several supplements enhance innate immune cell activity, phagocytosis, and cytokine production, supporting rapid immune responses to novel threats.',
                supplements: ['Vitamin C', 'Zinc', 'Elderberry', 'Reishi Mushroom']
            },
            {
                name: 'Adaptive Immune Modulation',
                description: 'The adaptive immune system generates targeted responses through T-cells and B-cells, providing long-term immunity. Certain supplements support lymphocyte proliferation, antibody production, and immune memory formation without causing excessive immune activation.',
                supplements: ['Zinc', 'Selenium', 'Echinacea', 'Vitamin C']
            },
            {
                name: 'Antioxidant Defense',
                description: 'Immune activation generates reactive oxygen species (ROS) that can damage immune cells and surrounding tissues if not properly neutralized. Antioxidant supplements help protect immune cells from oxidative damage during active immune responses, maintaining immune cell viability and function.',
                supplements: ['Vitamin C', 'Selenium', 'Spirulina', 'Garlic']
            },
            {
                name: 'Mucosal Barrier Support',
                description: 'Mucosal surfaces in the respiratory and gastrointestinal tracts serve as critical barriers against pathogen entry. Some supplements support mucosal immunity by enhancing secretory IgA production, maintaining epithelial integrity, and modulating local immune responses at mucosal surfaces.',
                supplements: ['Zinc', 'Vitamin C', 'Elderberry', 'Echinacea']
            }
        ],
        safetyIntro: `While immune-supporting supplements generally have favorable safety profiles, several critical considerations apply — particularly regarding autoimmune conditions and medication interactions.`,
        safetyNotes: [
            '<strong>Autoimmune conditions:</strong> Immune-stimulating supplements (echinacea, reishi, elderberry) may exacerbate autoimmune diseases (lupus, rheumatoid arthritis, multiple sclerosis) by further activating an already overactive immune system. Avoid without medical supervision.',
            '<strong>Immunosuppressant interactions:</strong> Supplements that enhance immune function may counteract immunosuppressive drugs used after organ transplants or for autoimmune conditions (cyclosporine, tacrolimus, corticosteroids). Medical supervision is essential.',
            '<strong>Zinc toxicity at high doses:</strong> Zinc supplementation above 40mg/day long-term can cause copper deficiency, leading to anemia and neurological problems. Intranasal zinc is associated with permanent loss of smell and should be avoided.',
            '<strong>Selenium narrow therapeutic window:</strong> Selenium toxicity (selenosis) can occur at doses above 400mcg/day, causing hair loss, nail brittleness, GI distress, and neurological symptoms. Do not exceed recommended doses.',
            '<strong>Pregnancy and lactation:</strong> While Vitamin C and Zinc are generally safe at recommended doses during pregnancy, many herbal immune supplements (echinacea, elderberry, reishi) lack adequate safety data for pregnant or breastfeeding individuals.',
            '<strong>Diabetes medication interactions:</strong> Garlic extract may enhance the effects of blood sugar-lowering medications. Blood glucose monitoring is advised when combining these supplements with diabetes management protocols.'
        ],
        researchGaps: [
            'Long-term immune supplementation effects (>12 months) on overall infection rates and immune aging remain understudied',
            'Optimal dosing during acute infection vs. maintenance prevention is poorly characterized for most supplements',
            'Effects on specific immune cell populations (NK cells, T-cells, B-cells) need more systematic characterization',
            'Interactions between multiple immune supplements taken concurrently lack controlled trial evidence',
            'Age-specific responses (children, elderly, immunocompromised) are underrepresented in existing trials',
            'Vaccine response modulation by immune supplements is an emerging but underdeveloped research area'
        ],
        relatedLinks: [
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../guides/cardiovascular.html', icon: 'fa-heartbeat', text: 'Cardiovascular Health Guide' },
            { href: '../categories/herbal-extracts.html', icon: 'fa-seedling', text: 'Browse Herbal Extracts' },
            { href: '../categories/essential-nutrients.html', icon: 'fa-capsules', text: 'Browse Essential Nutrients' },
            { href: '../categories/antioxidants.html', icon: 'fa-shield-halved', text: 'Browse Antioxidants' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'joint-health',
        title: 'Evidence-Based Supplements for Joint Health & Mobility',
        shortTitle: 'Joint Health',
        metaTitle: 'Best Supplements for Joint Health & Mobility (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to the best supplements for joint pain, cartilage support, and mobility. Ranked by evidence from peer-reviewed studies with dosages and safety profiles.',
        breadcrumb: 'Joint Health & Mobility',
        heroSubtitle: 'A systematic review of supplements studied for joint pain relief, cartilage protection, and mobility improvement — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const jointKeys = ['joint_pain','joint_space_narrowing','jointPain','jointHealth',
                'function','functionalImprovement','osteoarthritisPain',
                'inflammation','antiInflammatory','anti_inflammatory',
                'cartilage','cartilageProtection','cartilage_markers',
                'exercise_recovery','recoveryImprovement','muscleRecovery',
                'pain_management','painReduction','pain_intensity',
                'mobility','range_of_motion','stiffness',
                'collagen_synthesis','connective_tissue'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => jointKeys.includes(k));
        },
        coreSuppNames: [
            'Glucosamine', 'Chondroitin Sulfate', 'MSM', 'Boswellia',
            'Turmeric/Curcumin', 'Omega-3 Fatty Acids', 'Stinging Nettle', 'Pine Bark Extract'
        ],
        snippetDefinition: 'Joint health supplements are compounds studied in clinical trials for their effects on joint pain, cartilage integrity, mobility, and inflammation. The strongest evidence exists for glucosamine, chondroitin sulfate, and curcumin, with multiple meta-analyses and large-scale randomized controlled trials demonstrating measurable effects on osteoarthritis symptoms and structural joint outcomes.',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Joint Health',
        introduction: `Osteoarthritis affects over 500 million people worldwide and is the most common cause of joint pain and disability in adults over 50. While joint replacement surgery and pharmaceutical pain management remain critical care options, a substantial body of peer-reviewed research has investigated the potential of dietary supplements to support joint health, promote a healthy inflammatory response, and slow cartilage degradation.

This guide systematically reviews the supplements with the strongest clinical evidence for joint health outcomes including pain reduction, cartilage protection, mobility improvement, and inflammatory modulation.

<strong>Important:</strong> This guide is for informational purposes only. Joint supplements are not replacements for prescribed treatments including disease-modifying therapies, physical therapy, or surgical intervention. Always consult a qualified healthcare professional before starting any supplement regimen, particularly if you have rheumatoid arthritis or other inflammatory joint conditions.`,
        mechanismsIntro: `Joint health supplements work through several distinct pathways to support cartilage integrity, promote a healthy inflammatory response, and improve mobility. Understanding these mechanisms helps match supplements to specific joint health goals.`,
        mechanisms: [
            {
                name: 'Cartilage Matrix Support',
                description: 'Joint cartilage is composed of a complex extracellular matrix including collagen, proteoglycans, and glycosaminoglycans. Several supplements provide building blocks for cartilage synthesis or inhibit enzymes that degrade cartilage matrix components (matrix metalloproteinases).',
                supplements: ['Glucosamine', 'Chondroitin Sulfate', 'MSM']
            },
            {
                name: 'Anti-Inflammatory Pathways',
                description: 'Chronic low-grade inflammation is a primary driver of joint degeneration in osteoarthritis. Multiple supplements target distinct inflammatory pathways — including COX-2, 5-LOX, and NF-κB — to reduce inflammatory mediators in joint tissues.',
                supplements: ['Turmeric/Curcumin', 'Boswellia', 'Omega-3 Fatty Acids', 'Stinging Nettle']
            },
            {
                name: 'Collagen Synthesis',
                description: 'Type II collagen is the predominant collagen in articular cartilage. Some supplements support collagen production by providing precursors (MSM provides sulfur), stimulating chondrocyte activity, or providing antioxidant protection to preserve existing collagen structures.',
                supplements: ['MSM', 'Pine Bark Extract', 'Glucosamine']
            },
            {
                name: 'Synovial Fluid Maintenance',
                description: 'Synovial fluid lubricates joints and provides nutrients to avascular cartilage. Supplements that support hyaluronic acid production, reduce synovial inflammation, or improve joint fluid viscosity contribute to better joint mechanics and reduced friction-related damage.',
                supplements: ['Chondroitin Sulfate', 'Omega-3 Fatty Acids', 'Glucosamine']
            }
        ],
        safetyIntro: `Joint health supplements generally have favorable safety profiles in clinical trials, but several important considerations and medication interactions apply.`,
        safetyNotes: [
            '<strong>Shellfish allergy:</strong> Glucosamine derived from shellfish (most common form) is contraindicated in individuals with shellfish allergies. Vegetarian glucosamine derived from corn fermentation is available as an alternative.',
            '<strong>Blood thinner interactions:</strong> Omega-3 fatty acids, boswellia, and curcumin may have mild antiplatelet or anticoagulant effects. Use caution when combining with warfarin, aspirin, or clopidogrel — INR monitoring may be necessary.',
            '<strong>GI effects:</strong> Glucosamine, chondroitin, and MSM may cause mild GI symptoms (nausea, bloating, diarrhea) in some individuals. Taking with food often reduces these effects. These are generally milder than NSAID-related GI complications.',
            '<strong>Diabetes considerations:</strong> Early concerns about glucosamine affecting blood sugar have not been confirmed in controlled trials, but individuals with diabetes should monitor glucose when starting supplementation.',
            '<strong>Pregnancy and lactation:</strong> Most joint supplements lack adequate safety data for use during pregnancy or breastfeeding. Consult a healthcare provider before use.',
            '<strong>Autoimmune arthritis:</strong> Supplements studied for osteoarthritis may not be appropriate for rheumatoid arthritis or other autoimmune joint conditions. Disease-modifying therapy should not be replaced with supplements.'
        ],
        researchGaps: [
            'Long-term structural disease modification by supplements (joint space narrowing, cartilage volume) remains debated despite large trials',
            'Optimal combinations of joint supplements (e.g., glucosamine + chondroitin + MSM) lack factorial trial designs',
            'Head-to-head comparisons with NSAIDs and other analgesics are limited for most supplements',
            'Effects in early-stage vs. advanced osteoarthritis may differ significantly but are rarely stratified in trials',
            'Bioavailability of oral supplements to joint tissues (synovial fluid concentrations) is poorly characterized',
            'Exercise synergy — whether supplements enhance the benefits of physical therapy and exercise programs — needs more study'
        ],
        relatedLinks: [
            { href: '../guides/cardiovascular.html', icon: 'fa-heartbeat', text: 'Cardiovascular Health Guide' },
            { href: '../guides/energy-vitality.html', icon: 'fa-bolt', text: 'Energy & Vitality Guide' },
            { href: '../categories/herbal-extracts.html', icon: 'fa-seedling', text: 'Browse Herbal Extracts' },
            { href: '../categories/essential-nutrients.html', icon: 'fa-capsules', text: 'Browse Essential Nutrients' },
            { href: '../compare/turmeric-vs-boswellia.html', icon: 'fa-scale-balanced', text: 'Turmeric vs Boswellia' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'metabolic-health',
        title: 'Evidence-Based Supplements for Metabolic Health & Blood Sugar',
        shortTitle: 'Metabolic Health',
        metaTitle: 'Best Supplements for Blood Sugar & Metabolism (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to the best supplements for blood sugar management, insulin sensitivity, and metabolic health. Ranked by evidence from peer-reviewed studies with dosages and safety data.',
        breadcrumb: 'Metabolic Health',
        heroSubtitle: 'A systematic review of supplements studied for glucose control, insulin sensitivity, and metabolic function — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const metabKeys = ['glucoseControl','glucoseReduction','glucose_control','glucose_fasting',
                'HbA1c','hba1c_reduction','fastingGlucoseT2DM','fastingGlucose',
                'insulinSensitivity','insulin_sensitivity','insulin_resistance','insulinResistance',
                'metabolicSupport','metabolicEnhancement','metabolicHealth','metabolic_markers',
                'bodyWeight','bodyComposition','body_weight','weightManagement','weight_management',
                'fat_oxidation','fatLoss','bmi_reduction',
                'glycemicControl','glycemic','blood_sugar',
                'lipidProfile','cholesterolReduction','triglycerides',
                'thermogenesis','metabolicRate','energy_expenditure'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => metabKeys.includes(k));
        },
        coreSuppNames: [
            'Berberine', 'Chromium', 'Cinnamon Extract', 'Bitter Melon',
            'Gymnema Sylvestre', 'Fenugreek', 'Alpha-Lipoic Acid', 'Green Tea Extract'
        ],
        snippetDefinition: 'Metabolic health supplements are compounds studied in clinical trials for their effects on blood glucose control, insulin sensitivity, lipid metabolism, and body composition. The strongest evidence exists for berberine, chromium, and alpha-lipoic acid, with multiple meta-analyses demonstrating measurable effects on fasting glucose, HbA1c, and metabolic biomarkers.',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Metabolic Health',
        introduction: `Metabolic syndrome affects approximately 25-30% of the global adult population and is characterized by a cluster of conditions including elevated blood sugar, insulin resistance, dyslipidemia, and central obesity. Type 2 diabetes alone affects over 530 million adults worldwide, with prevalence continuing to rise.

While lifestyle modifications (diet, exercise, weight management) and pharmaceutical interventions remain the cornerstone of metabolic health management, a substantial body of peer-reviewed research has investigated dietary supplements that may support glucose metabolism, insulin sensitivity, and related metabolic parameters.

<strong>Important:</strong> This guide is for informational purposes only. Metabolic supplements are not replacements for prescribed diabetes medications such as metformin, insulin, GLP-1 agonists, or SGLT2 inhibitors. Always consult an endocrinologist or qualified healthcare professional before starting any supplement, particularly if you have diabetes or are taking glucose-lowering medications — supplement-drug combinations may cause dangerous hypoglycemia.`,
        mechanismsIntro: `Metabolic health supplements work through several distinct biochemical pathways to support glucose metabolism and insulin function. Understanding these mechanisms helps explain their clinical applications and potential interactions.`,
        mechanisms: [
            {
                name: 'AMPK Activation & Glucose Uptake',
                description: 'AMP-activated protein kinase (AMPK) is a master metabolic regulator that increases glucose uptake, enhances fatty acid oxidation, and improves insulin sensitivity. Berberine is the most potent natural AMPK activator, working through a mechanism similar to metformin but via distinct molecular targets.',
                supplements: ['Berberine', 'Alpha-Lipoic Acid', 'Green Tea Extract']
            },
            {
                name: 'Insulin Sensitization',
                description: 'Insulin resistance — where cells respond poorly to insulin signaling — is a central feature of metabolic syndrome and type 2 diabetes. Several supplements improve insulin receptor sensitivity, enhance glucose transporter (GLUT4) translocation, or modulate insulin signaling cascades.',
                supplements: ['Chromium', 'Alpha-Lipoic Acid', 'Berberine', 'Cinnamon Extract']
            },
            {
                name: 'Carbohydrate Metabolism Modulation',
                description: 'Some supplements influence carbohydrate metabolism by inhibiting digestive enzymes (alpha-glucosidase, alpha-amylase), slowing glucose absorption, or modulating hepatic glucose production. These mechanisms help reduce postprandial glucose spikes.',
                supplements: ['Gymnema Sylvestre', 'Bitter Melon', 'Cinnamon Extract', 'Fenugreek']
            },
            {
                name: 'Thermogenesis & Fat Oxidation',
                description: 'Increased energy expenditure through thermogenesis and enhanced fatty acid oxidation can support metabolic health and body composition. Certain supplements stimulate these processes through catecholamine modulation, uncoupling protein activation, or direct mitochondrial effects.',
                supplements: ['Green Tea Extract', 'Alpha-Lipoic Acid', 'Berberine']
            }
        ],
        safetyIntro: `Metabolic health supplements require particular caution due to significant interactions with diabetes medications and the risk of dangerous hypoglycemia.`,
        safetyNotes: [
            '<strong>Hypoglycemia risk:</strong> Berberine, gymnema, bitter melon, chromium, and cinnamon all have glucose-lowering effects. When combined with diabetes medications (metformin, insulin, sulfonylureas, GLP-1 agonists), they may cause dangerous hypoglycemia. Blood glucose monitoring is essential and medication dose adjustments may be needed.',
            '<strong>Berberine drug interactions:</strong> Berberine is a potent inhibitor of CYP3A4, CYP2D6, and P-glycoprotein enzymes, affecting the metabolism of many prescription drugs including statins, antidepressants, and immunosuppressants. Medical supervision is required.',
            '<strong>Chromium kidney concerns:</strong> High-dose chromium supplementation (>1000mcg/day) has been associated with renal toxicity in some case reports. Stay within recommended doses (200-1000mcg/day) and avoid in individuals with pre-existing kidney disease.',
            '<strong>Bitter melon pregnancy contraindication:</strong> Bitter melon has demonstrated abortifacient properties in animal studies and is contraindicated during pregnancy. Avoid use during pregnancy or when attempting to conceive.',
            '<strong>Green tea extract liver risk:</strong> High-dose green tea extract supplements (especially fasted) have been associated with rare cases of liver injury. Take with food and avoid doses above 800mg EGCG/day.',
            '<strong>Medication timing:</strong> Berberine and fenugreek may interfere with the absorption of other medications. Separate dosing by at least 2 hours from prescription drugs.'
        ],
        researchGaps: [
            'Long-term effects of metabolic supplements on diabetes progression and cardiovascular outcomes are understudied',
            'Optimal dosing for pre-diabetes vs. established type 2 diabetes is poorly differentiated in most trials',
            'Interactions between multiple glucose-lowering supplements taken concurrently lack controlled evidence',
            'Effects on type 1 diabetes and gestational diabetes are largely unstudied for most supplements',
            'Genetic variation in supplement response (e.g., chromium transporter polymorphisms) is an emerging research area',
            'Quality and standardization issues — particularly for botanical extracts like bitter melon and gymnema — limit reproducibility across studies'
        ],
        relatedLinks: [
            { href: '../guides/cardiovascular.html', icon: 'fa-heartbeat', text: 'Cardiovascular Health Guide' },
            { href: '../guides/energy-vitality.html', icon: 'fa-bolt', text: 'Energy & Vitality Guide' },
            { href: '../categories/herbal-extracts.html', icon: 'fa-seedling', text: 'Browse Herbal Extracts' },
            { href: '../categories/essential-nutrients.html', icon: 'fa-capsules', text: 'Browse Essential Nutrients' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'energy-vitality',
        title: 'Evidence-Based Supplements for Energy & Vitality',
        shortTitle: 'Energy & Vitality',
        metaTitle: 'Best Supplements for Energy & Fatigue (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to the best supplements for energy, fatigue reduction, and physical vitality. Ranked by evidence from peer-reviewed studies with dosages and safety profiles.',
        breadcrumb: 'Energy & Vitality',
        heroSubtitle: 'A systematic review of supplements studied for energy production, fatigue resistance, and physical performance — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const energyKeys = ['energy_levels','energy','energyEnhancement','energyProduction',
                'exercise_performance','exercisePerformance','exerciseEndurance','physicalPerformance',
                'endurance_VO2','endurance','endurancePerformance','aerobic_performance',
                'fatigue','fatigueReduction','mentalFatigue','physicalFatigue','fatigue_reduction',
                'strength','strengthImprovement','muscleStrength','powerOutput',
                'alertness','alertnessImprovement','wakefulness',
                'ketone_production','cognitive_energy','cellularEnergy',
                'oxygen_utilization','VO2max','vo2_max',
                'muscle_mass','leanBodyMass','bodyComposition',
                'recovery','recoveryImprovement','exerciseRecovery',
                'metabolicRate','thermogenesis'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => energyKeys.includes(k));
        },
        coreSuppNames: [
            'Creatine', 'Caffeine', 'CoQ10', 'Iron',
            'Rhodiola rosea', 'Cordyceps', 'MCT Oil', 'Beta-Alanine'
        ],
        snippetDefinition: 'Energy and vitality supplements are compounds studied in clinical trials for their effects on ATP production, exercise performance, fatigue resistance, and physical endurance. The strongest evidence exists for creatine (Tier 1 with extensive meta-analyses), caffeine (Tier 1 for acute performance), and CoQ10 (Tier 2 for mitochondrial energy), with robust randomized controlled trials demonstrating measurable performance and energy benefits.',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Energy & Vitality',
        introduction: `Fatigue is one of the most common complaints in clinical practice, affecting up to 45% of the general population. While fatigue can stem from numerous medical, psychological, and lifestyle factors, cellular energy production — particularly mitochondrial ATP synthesis — is the fundamental biochemical process underlying physical and mental vitality.

This guide systematically reviews the supplements with the strongest clinical evidence for enhancing energy production, reducing fatigue, and supporting physical performance. Each recommendation is grounded in published randomized controlled trials (RCTs), systematic reviews, and meta-analyses.

<strong>Important:</strong> This guide is for informational purposes only. Persistent fatigue may indicate underlying medical conditions (thyroid dysfunction, anemia, sleep disorders, depression) that require proper diagnosis and professional care. Always consult a healthcare professional before starting supplements for fatigue, and ensure underlying causes have been appropriately evaluated.`,
        mechanismsIntro: `Energy supplements work through several distinct biochemical pathways to support cellular energy production, improve oxygen delivery, and enhance fatigue resistance. Understanding these mechanisms helps match supplements to specific energy goals.`,
        mechanisms: [
            {
                name: 'ATP Production & Phosphocreatine System',
                description: 'Adenosine triphosphate (ATP) is the universal energy currency of cells. The phosphocreatine system provides rapid ATP regeneration during high-intensity activities. Creatine supplementation increases intramuscular phosphocreatine stores by 20-40%, directly enhancing ATP availability for both physical and cognitive performance.',
                supplements: ['Creatine', 'CoQ10', 'Iron']
            },
            {
                name: 'Mitochondrial Electron Transport',
                description: 'Mitochondria generate ~90% of cellular ATP through oxidative phosphorylation. CoQ10 is an essential electron carrier in the mitochondrial respiratory chain (Complex I to III), and its levels naturally decline with age. Supporting mitochondrial function is fundamental to sustained energy production.',
                supplements: ['CoQ10', 'Iron', 'MCT Oil']
            },
            {
                name: 'Oxygen Utilization & VO2 Max',
                description: 'Maximal oxygen consumption (VO2 max) is a key determinant of aerobic performance and endurance capacity. Certain supplements improve oxygen delivery (iron for hemoglobin synthesis), oxygen utilization at the tissue level (cordyceps), or buffer metabolic byproducts that limit sustained effort (beta-alanine).',
                supplements: ['Iron', 'Cordyceps', 'Beta-Alanine', 'Rhodiola rosea']
            },
            {
                name: 'Adaptogenic Fatigue Resistance',
                description: 'Adaptogens are a class of compounds that modulate the stress response and improve resistance to physical and mental fatigue. They typically work by normalizing HPA axis function, modulating cortisol responses, and supporting neurotransmitter balance during prolonged stress.',
                supplements: ['Rhodiola rosea', 'Cordyceps', 'Caffeine']
            }
        ],
        safetyIntro: `Energy supplements generally have well-characterized safety profiles, but several important considerations apply — particularly regarding stimulant effects, nutrient interactions, and pre-existing conditions.`,
        safetyNotes: [
            '<strong>Caffeine tolerance & dependence:</strong> Regular caffeine consumption leads to tolerance (requiring higher doses for the same effect) and physical dependence (withdrawal headaches, fatigue, irritability). Limit intake to 400mg/day for most adults and cycle usage to maintain sensitivity.',
            '<strong>Iron overload risk:</strong> Iron supplementation without confirmed deficiency can lead to iron overload (hemochromatosis), causing liver damage, heart disease, and diabetes. Always test ferritin and iron saturation levels before supplementing — iron is not an "energy supplement" for non-deficient individuals.',
            '<strong>Creatine kidney myths vs. reality:</strong> Despite persistent myths, creatine monohydrate does not cause kidney damage in healthy individuals at standard doses (3-5g/day). However, creatine raises serum creatinine (a kidney marker), which can falsely suggest kidney impairment. Individuals with pre-existing kidney disease should consult a nephrologist.',
            '<strong>Stimulant stacking dangers:</strong> Combining multiple stimulants (caffeine + high-dose green tea + pre-workout supplements) can cause dangerous cardiovascular effects including tachycardia, hypertension, and arrhythmias. Use one stimulant source at a time.',
            '<strong>Sleep interference:</strong> Caffeine (half-life 5-6 hours), rhodiola, and cordyceps may interfere with sleep quality if taken later in the day. Consume stimulating supplements before noon to minimize sleep disruption.',
            '<strong>Pregnancy and lactation:</strong> Caffeine should be limited to 200mg/day during pregnancy. Most other performance supplements lack adequate pregnancy safety data. Consult a healthcare provider.'
        ],
        researchGaps: [
            'Long-term effects of energy supplement use (>12 months) on mitochondrial health and aging remain understudied',
            'Optimal timing and periodization of energy supplements for peak performance is poorly characterized',
            'Individual variation in caffeine metabolism (CYP1A2 polymorphisms) significantly affects response but is rarely accounted for in trials',
            'Synergistic effects of energy supplement combinations (e.g., creatine + caffeine) show conflicting evidence and need larger trials',
            'Effects on different types of fatigue (physical vs. mental vs. chronic) are often conflated in study designs',
            'Female-specific responses to energy supplements are underrepresented in the literature, with most trials conducted predominantly in male participants'
        ],
        relatedLinks: [
            { href: '../guides/cognitive-performance.html', icon: 'fa-brain', text: 'Cognitive Performance Guide' },
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../categories/performance-enhancers.html', icon: 'fa-dumbbell', text: 'Browse Performance Enhancers' },
            { href: '../categories/essential-nutrients.html', icon: 'fa-capsules', text: 'Browse Essential Nutrients' },
            { href: '../categories/antioxidants.html', icon: 'fa-shield-halved', text: 'Browse Antioxidants' },
            { href: '../compare/creatine-vs-beta-alanine.html', icon: 'fa-scale-balanced', text: 'Creatine vs Beta-Alanine' },
            { href: '../compare/coq10-vs-pqq.html', icon: 'fa-scale-balanced', text: 'CoQ10 vs PQQ' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    }
];

// ─── HTML Helpers ────────────────────────────────────────────────────────────
function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tierBadgeHtml(tier) {
    return `<span class="tier-badge tier-badge-${tier}">${getTierLabel(tier)}</span>`;
}

function getBenefitsList(s) {
    const cog = s.primaryBenefits?.cognitive || [];
    const non = s.primaryBenefits?.nonCognitive || [];
    return [...cog, ...non];
}

/**
 * Get the most domain-relevant benefit for snippet list display.
 * Falls back to first available benefit if no domain match found.
 */
function getDomainBenefit(s, guideSlug) {
    const cog = s.primaryBenefits?.cognitive || [];
    const non = s.primaryBenefits?.nonCognitive || [];
    const all = [...non, ...cog]; // non-cognitive first for non-cognitive domains

    const domainKeywords = {
        'anxiety-stress': ['anxiety', 'stress', 'calm', 'relax', 'cortisol', 'mood', 'sleep', 'gaba', 'serotonin', 'adaptogen'],
        'cognitive-performance': ['memory', 'cognit', 'focus', 'attention', 'brain', 'learning', 'mental', 'neuroprotect', 'neurotrophic', 'acetylcholine'],
        'cardiovascular': ['cardiovascular', 'heart', 'blood pressure', 'cholesterol', 'lipid', 'triglyceride', 'vascular', 'endothel', 'arterial', 'cardiac', 'circulation'],
        'immune-function': ['immune', 'infection', 'cold', 'flu', 'antioxidant', 'nk cell', 'cytokine', 'antibod', 'pathogen', 'antimicrobial', 'antiviral', 'white blood'],
        'joint-health': ['joint', 'cartilage', 'inflammat', 'arthritis', 'pain', 'mobility', 'collagen', 'bone', 'connective tissue', 'synovial', 'musculoskeletal'],
        'metabolic-health': ['glucose', 'insulin', 'blood sugar', 'metaboli', 'HbA1c', 'glycemic', 'diabetes', 'weight', 'fat', 'obesity', 'AMPK', 'thermogen'],
        'energy-vitality': ['energy', 'fatigue', 'endurance', 'performance', 'ATP', 'mitochondri', 'oxygen', 'VO2', 'stamina', 'power', 'strength', 'exercise']
    };

    const keywords = domainKeywords[guideSlug] || [];
    if (keywords.length > 0) {
        // Search nonCognitive first for most domains, cognitive first for cognitive
        const cogDomains = ['cognitive-performance'];
        const searchOrder = cogDomains.includes(guideSlug) ? [...cog, ...non] : [...non, ...cog];
        for (const benefit of searchOrder) {
            const lower = benefit.toLowerCase();
            if (keywords.some(kw => lower.includes(kw))) {
                return benefit;
            }
        }
    }

    // Fallback: for cognitive/energy guides prefer cognitive benefits, otherwise nonCognitive
    const cogFirstGuides = ['cognitive-performance', 'energy-vitality'];
    if (cogFirstGuides.includes(guideSlug)) {
        return cog[0] || non[0] || 'General support';
    }
    return non[0] || cog[0] || 'General support';
}

/**
 * Returns ALL benefits for a supplement, sorted so domain-relevant ones come first.
 * Used for card displays where we show multiple benefits but want the most relevant on top.
 */
function getDomainSortedBenefits(s, guideSlug) {
    const cog = s.primaryBenefits?.cognitive || [];
    const non = s.primaryBenefits?.nonCognitive || [];
    const all = guideSlug === 'cognitive-performance' ? [...cog, ...non] : [...non, ...cog];

    const domainKeywords = {
        'anxiety-stress': ['anxiety', 'stress', 'calm', 'relax', 'cortisol', 'mood', 'sleep', 'gaba', 'serotonin', 'adaptogen'],
        'cognitive-performance': ['memory', 'cognit', 'focus', 'attention', 'brain', 'learning', 'mental', 'neuroprotect', 'neurotrophic', 'acetylcholine'],
        'cardiovascular': ['cardiovascular', 'heart', 'blood pressure', 'cholesterol', 'lipid', 'triglyceride', 'vascular', 'endothel', 'arterial', 'cardiac', 'circulation'],
        'immune-function': ['immune', 'infection', 'cold', 'flu', 'antioxidant', 'nk cell', 'cytokine', 'antibod', 'pathogen', 'antimicrobial', 'antiviral', 'white blood'],
        'joint-health': ['joint', 'cartilage', 'inflammat', 'arthritis', 'pain', 'mobility', 'collagen', 'bone', 'connective tissue', 'synovial', 'musculoskeletal'],
        'metabolic-health': ['glucose', 'insulin', 'blood sugar', 'metaboli', 'HbA1c', 'glycemic', 'diabetes', 'weight', 'fat', 'obesity', 'AMPK', 'thermogen'],
        'energy-vitality': ['energy', 'fatigue', 'endurance', 'performance', 'ATP', 'mitochondri', 'oxygen', 'VO2', 'stamina', 'power', 'strength', 'exercise']
    };

    const keywords = domainKeywords[guideSlug] || [];
    if (keywords.length === 0) return all;

    const relevant = [];
    const other = [];
    for (const benefit of all) {
        const lower = benefit.toLowerCase();
        if (keywords.some(kw => lower.includes(kw))) {
            relevant.push(benefit);
        } else {
            other.push(benefit);
        }
    }
    return [...relevant, ...other];
}

function getAnxietyEffects(s) {
    if (!s.effectSizes || typeof s.effectSizes !== 'object') return [];
    const results = [];
    Object.entries(s.effectSizes).forEach(([k, v]) => {
        if (v && typeof v === 'string') {
            results.push({ domain: k, description: v });
        }
    });
    return results;
}

function getMechanismsList(s) {
    if (!s.mechanismsOfAction) return [];
    return s.mechanismsOfAction.map(m => m.mechanism || String(m));
}

// ─── Page Generator ──────────────────────────────────────────────────────────
function generateGuidePage(guide, allSupplements) {
    // Filter and sort supplements
    let filtered = allSupplements.filter(guide.filterFn);
    filtered.sort((a, b) => a.evidenceTier - b.evidenceTier || a.name.localeCompare(b.name));

    // Identify core vs supporting
    const coreSet = new Set(guide.coreSuppNames.map(n => n.toLowerCase()));
    const core = filtered.filter(s => coreSet.has(s.name.toLowerCase()));
    const supporting = filtered.filter(s => !coreSet.has(s.name.toLowerCase()));

    // Stats
    const totalCitations = filtered.reduce((sum, s) => sum + (s.keyCitations || []).length, 0);
    const tierCounts = {};
    filtered.forEach(s => { tierCounts[s.evidenceTier] = (tierCounts[s.evidenceTier] || 0) + 1; });

    const tocItems = [
        { id: 'introduction', label: 'Introduction' },
        { id: 'top-supplements', label: 'Top Supplements' },
        { id: 'evidence-comparison', label: 'Evidence Comparison' },
        { id: 'mechanisms', label: 'Mechanisms of Action' },
        { id: 'dosage-guidelines', label: 'Dosage Guidelines' },
        { id: 'safety', label: 'Safety & Interactions' },
        { id: 'research-gaps', label: 'Research Gaps' },
        { id: 'additional', label: 'Additional Supplements' },
        { id: 'references', label: 'References' },
    ];

    const today = new Date().toISOString().split('T')[0];

    // Build JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": guide.title,
        "description": guide.metaDescription,
        "datePublished": today,
        "dateModified": today,
        "publisher": {
            "@type": "Organization",
            "name": "SupplementDB",
            "url": "https://supplementdb.co"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://supplementdb.co/guides/${guide.slug}.html`
        }
    };

    // ── Build HTML ──────────────────────────────────────────────────────────
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(guide.metaTitle)}</title>
    <meta name="description" content="${esc(guide.metaDescription)}">
    <link rel="canonical" href="https://supplementdb.co/guides/${guide.slug}.html">
    <meta property="og:title" content="${esc(guide.metaTitle)}">
    <meta property="og:description" content="${esc(guide.metaDescription)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://supplementdb.co/guides/${guide.slug}.html">
    <meta property="og:image" content="https://supplementdb.co/assets/og-guide-${guide.slug}.svg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="SupplementDB">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(guide.metaTitle)}">
    <meta name="twitter:description" content="${esc(guide.metaDescription)}">
    <meta name="twitter:image" content="https://supplementdb.co/assets/og-guide-${guide.slug}.svg">

    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">

    <!-- PostHog Analytics -->
    <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageviewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('phc_esUgVXZLrnPplrCmbAQ8RlYbHuXS38hewwGHnLqtMF7', {
            api_host: 'https://us.i.posthog.com',
            person_profiles: 'identified_only',
            capture_pageview: true,
            capture_pageleave: true,
            autocapture: true
        });
    </script>

    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../legal/legal-shared.css">
    <link rel="stylesheet" href="../css/content-shared.css">

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body class="content-page">
    <!-- Navigation -->
    <nav class="legal-nav">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <a href="../index.html" class="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity">
                <i class="fas fa-pills text-xl"></i>
                <span class="font-bold text-lg">SupplementDB</span>
            </a>
            <div class="flex items-center space-x-4">
                <a href="../guides/sleep.html" class="text-gray-300 hover:text-white text-sm transition-colors hidden sm:inline">Sleep Guide</a>
                <a href="../index.html" class="text-gray-300 hover:text-white text-sm transition-colors">
                    <i class="fas fa-arrow-left mr-1"></i> Database
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="content-hero">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav class="content-breadcrumb" aria-label="Breadcrumb">
                <a href="../index.html">Home</a>
                <span class="separator"><i class="fas fa-chevron-right" style="font-size:0.65rem"></i></span>
                <a href="../index.html#guides">Evidence Guides</a>
                <span class="separator"><i class="fas fa-chevron-right" style="font-size:0.65rem"></i></span>
                <span>${esc(guide.breadcrumb)}</span>
            </nav>
            <h1>${esc(guide.title)}</h1>
            <p class="hero-subtitle">${esc(guide.heroSubtitle)}</p>
            <div class="hero-meta">
                <span class="hero-stat"><i class="fas fa-flask"></i> ${filtered.length} Supplements Reviewed</span>
                <span class="hero-stat"><i class="fas fa-file-lines"></i> ${totalCitations}+ Citations</span>
                <span class="hero-stat"><i class="fas fa-calendar"></i> Updated ${today}</span>
                ${Object.entries(tierCounts).sort(([a],[b])=>a-b).map(([t,c]) =>
                    `<span class="hero-stat">${tierBadgeHtml(t)} ${c}</span>`
                ).join('\n                ')}
            </div>
        </div>
    </section>

    <!-- Share Bar -->
    <div class="share-bar">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <span class="share-bar-label">Share this guide</span>
            <div class="share-bar-buttons">
                <button class="share-btn" data-share="twitter"><i class="fa-brands fa-x-twitter"></i> Twitter</button>
                <button class="share-btn" data-share="linkedin"><i class="fa-brands fa-linkedin"></i> LinkedIn</button>
                <button class="share-btn" data-share="facebook"><i class="fa-brands fa-facebook"></i> Facebook</button>
                <button class="share-btn share-btn-copy" data-share="copy"><i class="fas fa-link"></i> Copy Link</button>
            </div>
        </div>
    </div>

    <!-- Trust Signal Bar -->
    <div class="trust-bar" style="max-width:64rem;margin:1rem auto;">
        <span class="trust-bar-item"><i class="fas fa-check-circle"></i> ${totalCitations}+ Verified Citations</span>
        <span class="trust-bar-divider"></span>
        <span class="trust-bar-item"><i class="fas fa-shield-alt"></i> FDA-Compliant Language</span>
        <span class="trust-bar-divider"></span>
        <span class="trust-bar-item"><i class="fas fa-ban"></i> No Industry Funding</span>
        <span class="trust-bar-divider"></span>
        <span class="trust-bar-item"><i class="fas fa-flask"></i> <a href="../methodology.html">Our Methodology</a></span>
    </div>

    <!-- Main Content with optional TOC -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div style="display:grid; grid-template-columns: 1fr 220px; gap: 3rem; align-items: start;">
            <div>
`;

    // ── Medical Disclaimer ────────────────────────────────────────────────
    html += `
                <div class="content-disclaimer">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div><strong>Medical Disclaimer:</strong> This guide is for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment recommendations. Always consult a qualified healthcare professional before starting any supplement regimen. <a href="../legal/disclaimer.html" style="color:#92400e; text-decoration:underline;">Read full disclaimer</a>.</div>
                </div>
`;

    // ── Featured Snippet: Definition ──────────────────────────────────────
    html += `
                <!-- Featured Snippet: Definition -->
                <div class="snippet-definition">
                    <p><strong>${esc(guide.shortTitle)} supplements</strong> ${guide.snippetDefinition}</p>
                </div>
`;

    // ── Introduction ──────────────────────────────────────────────────────
    html += `
                <section class="content-section" id="introduction">
                    <h2>Introduction</h2>
                    ${guide.introduction.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n                    ')}
                </section>
`;

    // ── Featured Snippet: Top Supplements List ────────────────────────────
    html += `
                <!-- Featured Snippet: Ranked List -->
                <section class="content-section" id="top-supplements">
                    <h2>${esc(guide.snippetListTitle)}</h2>
                    <div class="snippet-list">
                        <h2>${esc(guide.snippetListTitle)}</h2>
                        <ol>
`;
    core.forEach(s => {
        const topBenefit = getDomainBenefit(s, guide.slug);
        html += `                            <li><a href="../supplements/${slugify(s.name)}.html" style="color:var(--accent);text-decoration:none;font-weight:700;">${esc(s.name)}</a> ${tierBadgeHtml(s.evidenceTier)} &mdash; ${esc(topBenefit)} (${esc(s.dosageRange || 'Dosage varies')})</li>\n`;
    });
    html += `                        </ol>
                    </div>
`;

    // ── Core Supplement Cards ─────────────────────────────────────────────
    html += `
                    <div class="supplement-card-grid">
`;
    core.forEach(s => {
        const benefits = getDomainSortedBenefits(s, guide.slug);
        const mechanisms = getMechanismsList(s);
        const effects = getAnxietyEffects(s);

        html += `                        <div class="supplement-card" id="supp-${slugify(s.name)}">
                            <div class="card-header">
                                <div>
                                    <h3 class="card-name"><a href="../supplements/${slugify(s.name)}.html" style="color:inherit;text-decoration:none;">${esc(s.name)}</a></h3>
                                    <p class="card-scientific">${esc(s.scientificName || '')}</p>
                                </div>
                                ${tierBadgeHtml(s.evidenceTier)}
                            </div>
                            <ul class="card-benefits">
`;
        benefits.slice(0, 4).forEach(b => {
            html += `                                <li>${esc(b)}</li>\n`;
        });
        html += `                            </ul>
`;
        // Key effect sizes
        if (effects.length > 0) {
            html += `                            <div style="margin: 0.5rem 0; padding: 0.5rem 0.75rem; background: var(--accent-bg); border-radius: 6px; font-size: 0.8rem; color: var(--text-muted);">\n`;
            effects.slice(0, 2).forEach(e => {
                html += `                                <div style="margin-bottom:0.25rem"><strong>${esc(e.domain)}:</strong> ${esc(e.description)}</div>\n`;
            });
            html += `                            </div>\n`;
        }
        // Mechanisms
        if (mechanisms.length > 0) {
            html += `                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;"><i class="fas fa-cogs" style="color:var(--accent); margin-right:0.25rem;"></i> ${esc(mechanisms.slice(0, 2).join('; '))}</div>\n`;
        }
        html += `                            <div class="card-dosage"><i class="fas fa-prescription-bottle"></i> ${esc(s.dosageRange || 'See studies for dosing')}</div>
                        </div>
`;
    });
    html += `                    </div>
                </section>
`;

    // ── Evidence Comparison Table ─────────────────────────────────────────
    html += `
                <section class="content-section" id="evidence-comparison">
                    <h2>Evidence Comparison</h2>
                    <p>The following table compares all ${filtered.length} supplements reviewed in this guide by evidence tier, category, key benefit, dosage range, and number of cited studies.</p>
                    <div class="content-table-wrap">
                        <table class="content-table snippet-table">
                            <thead>
                                <tr>
                                    <th>Supplement</th>
                                    <th>Evidence</th>
                                    <th>Category</th>
                                    <th>Key Benefit</th>
                                    <th>Dosage Range</th>
                                    <th>Studies</th>
                                </tr>
                            </thead>
                            <tbody>
`;
    filtered.forEach(s => {
        const topBenefit = getDomainBenefit(s, guide.slug);
        html += `                                <tr>
                                    <td><strong><a href="../supplements/${slugify(s.name)}.html" style="color:inherit;text-decoration:none;">${esc(s.name)}</a></strong></td>
                                    <td>${tierBadgeHtml(s.evidenceTier)}</td>
                                    <td>${esc(normalizeCategory(s.category))}</td>
                                    <td>${esc(topBenefit)}</td>
                                    <td style="font-size:0.8rem">${esc(s.dosageRange || '—')}</td>
                                    <td>${(s.keyCitations || []).length}</td>
                                </tr>
`;
    });
    html += `                            </tbody>
                        </table>
                    </div>
                </section>
`;

    // ── Mechanisms of Action ──────────────────────────────────────────────
    html += `
                <section class="content-section" id="mechanisms">
                    <h2>Mechanisms of Action</h2>
                    <p>${guide.mechanismsIntro}</p>
`;
    guide.mechanisms.forEach(m => {
        html += `
                    <h3>${esc(m.name)}</h3>
                    <p>${m.description}</p>
                    <p style="font-size:0.875rem; color:var(--text-muted)"><strong>Key supplements:</strong> ${m.supplements.map(n => `<a href="../supplements/${slugify(n)}.html">${esc(n)}</a>`).join(', ')}</p>
`;
    });
    html += `                </section>
`;

    // ── Dosage Guidelines ─────────────────────────────────────────────────
    html += `
                <section class="content-section" id="dosage-guidelines">
                    <h2>Dosage Guidelines</h2>
                    <p>The following dosage ranges reflect those used in published clinical trials. Individual needs may vary. Always start with the lower end of the range and titrate upward as tolerated.</p>
                    <div class="content-table-wrap">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>Supplement</th>
                                    <th>Clinical Dosage Range</th>
                                    <th>Evidence Tier</th>
                                    <th>Safety Rating</th>
                                </tr>
                            </thead>
                            <tbody>
`;
    core.forEach(s => {
        html += `                                <tr>
                                    <td><strong><a href="../supplements/${slugify(s.name)}.html" style="color:inherit;text-decoration:none;">${esc(s.name)}</a></strong></td>
                                    <td>${esc(s.dosageRange || '—')}</td>
                                    <td>${tierBadgeHtml(s.evidenceTier)}</td>
                                    <td>${esc(s.safetyProfile?.rating || '—')}</td>
                                </tr>
`;
    });
    html += `                            </tbody>
                        </table>
                    </div>
                    <div class="content-callout content-callout-warning">
                        <strong>Note:</strong> Dosage ranges are derived from clinical trial protocols and may not account for individual variation in body weight, metabolism, concurrent medications, or health status. Consult a healthcare provider for personalized dosing.
                    </div>
                </section>
`;

    // ── Safety & Interactions ─────────────────────────────────────────────
    html += `
                <section class="content-section" id="safety">
                    <h2>Safety &amp; Interactions</h2>
                    <p>${guide.safetyIntro}</p>
                    <ul>
`;
    guide.safetyNotes.forEach(note => {
        html += `                        <li>${note}</li>\n`;
    });
    html += `                    </ul>

                    <h3>Individual Supplement Safety Profiles</h3>
                    <div class="content-table-wrap">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>Supplement</th>
                                    <th>Common Side Effects</th>
                                    <th>Key Drug Interactions</th>
                                    <th>Safety Rating</th>
                                </tr>
                            </thead>
                            <tbody>
`;
    core.forEach(s => {
        const sideEffects = (s.safetyProfile?.commonSideEffects || []).slice(0, 3).join(', ') || '—';
        const interactions = (s.safetyProfile?.drugInteractions || []).slice(0, 3).join(', ') || '—';
        html += `                                <tr>
                                    <td><strong>${esc(s.name)}</strong></td>
                                    <td style="font-size:0.85rem">${esc(sideEffects)}</td>
                                    <td style="font-size:0.85rem">${esc(interactions)}</td>
                                    <td>${esc(s.safetyProfile?.rating || '—')}</td>
                                </tr>
`;
    });
    html += `                            </tbody>
                        </table>
                    </div>
                </section>
`;

    // ── Research Gaps ─────────────────────────────────────────────────────
    html += `
                <section class="content-section" id="research-gaps">
                    <h2>Research Gaps &amp; Limitations</h2>
                    <p>While the evidence base for ${guide.shortTitle.toLowerCase()} supplements continues to grow, several important gaps remain in the current literature:</p>
                    <ul>
`;
    guide.researchGaps.forEach(gap => {
        html += `                        <li>${esc(gap)}</li>\n`;
    });
    html += `                    </ul>
                </section>
`;

    // ── Additional Supporting Supplements ─────────────────────────────────
    if (supporting.length > 0) {
        html += `
                <section class="content-section" id="additional">
                    <h2>Additional Supplements with Relevant Evidence</h2>
                    <p>The following ${supporting.length} supplements show some evidence related to ${guide.shortTitle.toLowerCase()} but are not among the primary recommendations. They may have relevant benefits as secondary effects or within specific subpopulations.</p>
                    <div class="content-table-wrap">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>Supplement</th>
                                    <th>Evidence</th>
                                    <th>Category</th>
                                    <th>Relevant Benefit</th>
                                </tr>
                            </thead>
                            <tbody>
`;
        supporting.forEach(s => {
            const topBenefit = getDomainBenefit(s, guide.slug);
            html += `                                <tr>
                                    <td>${esc(s.name)}</td>
                                    <td>${tierBadgeHtml(s.evidenceTier)}</td>
                                    <td>${esc(normalizeCategory(s.category))}</td>
                                    <td style="font-size:0.85rem">${esc(topBenefit)}</td>
                                </tr>
`;
        });
        html += `                            </tbody>
                        </table>
                    </div>
                </section>
`;
    }

    // ── References ────────────────────────────────────────────────────────
    html += `
                <section class="content-section" id="references">
                    <h2>References</h2>
                    <p>All data in this guide is derived from the SupplementDB citation library of ${totalCitations}+ peer-reviewed research papers. Individual supplement citations are listed below.</p>
                    <ol class="citation-list">
`;
    let citNum = 1;
    filtered.forEach(s => {
        (s.keyCitations || []).forEach(c => {
            const doi = c.doi ? `<a class="citation-doi" href="https://doi.org/${esc(c.doi)}" target="_blank" rel="noopener">${esc(c.doi)}</a>` : '';
            const pmid = c.pmid ? ` PMID: ${esc(String(c.pmid))}` : '';
            html += `                        <li>${esc(c.authors || '')} (${esc(String(c.year || ''))}).  ${esc(c.title || '')}. <em>${esc(c.journal || '')}</em>. ${doi}${pmid}</li>\n`;
            citNum++;
        });
    });
    html += `                    </ol>
                </section>
`;

    // ── Email Capture ─────────────────────────────────────────────────────
    html += `
                <!-- Email Capture -->
                <section class="newsletter-section" id="subscribe">
                    <div class="newsletter-inner">
                        <h3><i class="fas fa-envelope-open-text"></i> Get ${esc(guide.title)} Research Updates</h3>
                        <p>Stay informed when new studies are published or evidence tiers are updated for these supplements.</p>
                        <div id="guide-newsletter-container">
                            <form id="guide-newsletter-form" class="newsletter-form" onsubmit="return handleGuideNewsletter(event)">
                                <input type="email" id="guide-newsletter-email" placeholder="your@email.com" required>
                                <button type="submit"><i class="fas fa-paper-plane"></i> Subscribe</button>
                            </form>
                            <p id="guide-newsletter-success" class="newsletter-success hidden">
                                <i class="fas fa-check-circle"></i> Subscribed! We'll notify you of relevant research updates.
                            </p>
                            <p id="guide-newsletter-already" class="newsletter-already hidden">
                                <i class="fas fa-info-circle"></i> You're already subscribed. Thank you!
                            </p>
                        </div>
                        <p class="newsletter-privacy"><i class="fas fa-lock"></i> No spam. <a href="../legal/privacy.html">Privacy Policy</a></p>
                    </div>
                </section>
`;

    // ── Related Content ───────────────────────────────────────────────────
    html += `
                <!-- Related Content -->
                <div class="related-content">
                    <h3>Related Resources</h3>
                    <div class="related-content-grid">
`;
    guide.relatedLinks.forEach(link => {
        html += `                        <a href="${link.href}"><i class="fas ${link.icon}"></i> ${esc(link.text)}</a>\n`;
    });
    html += `                    </div>
                </div>

            </div><!-- end main column -->

            <!-- Sidebar TOC (desktop only) -->
            <aside class="content-toc" aria-label="Table of Contents">
                <h4>Contents</h4>
                <ul>
`;
    tocItems.forEach(item => {
        html += `                    <li><a href="#${item.id}">${esc(item.label)}</a></li>\n`;
    });
    html += `                </ul>
            </aside>
        </div>
    </main>

    <!-- Footer -->
    <footer class="legal-footer">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025&ndash;2026 SupplementDB. All rights reserved.</p>
            <p class="mt-2 text-sm text-gray-400">
                <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice.
                <a href="../legal/disclaimer.html" style="color:#9ca3af; text-decoration:underline;">Full disclaimer</a>
            </p>
            <p class="mt-2 text-sm text-gray-500">
                <a href="../about.html" style="color:#9ca3af;">About</a> &middot;
                <a href="../methodology.html" style="color:#9ca3af;">Methodology</a> &middot;
                <a href="../faq.html" style="color:#9ca3af;">FAQ</a> &middot;
                <a href="../legal/privacy.html" style="color:#9ca3af;">Privacy</a> &middot;
                <a href="../legal/terms.html" style="color:#9ca3af;">Terms</a>
            </p>
        </div>
    </footer>

    <!-- Smooth scroll for TOC -->
    <script>
        document.querySelectorAll('.content-toc a').forEach(function(a) {
            a.addEventListener('click', function(e) {
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.replaceState(null, '', this.getAttribute('href'));
                }
            });
        });
        // Highlight active TOC item on scroll
        var tocLinks = document.querySelectorAll('.content-toc a');
        var sections = Array.from(tocLinks).map(function(a) {
            return document.querySelector(a.getAttribute('href'));
        }).filter(Boolean);
        window.addEventListener('scroll', function() {
            var scrollY = window.scrollY + 120;
            var active = sections[0];
            sections.forEach(function(sec) { if (sec.offsetTop <= scrollY) active = sec; });
            tocLinks.forEach(function(a) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + (active ? active.id : ''));
            });
        });

        // Guide newsletter handler
        window.handleGuideNewsletter = function(e) {
            e.preventDefault();
            var email = document.getElementById('guide-newsletter-email').value.trim();
            if (!email) return false;
            var subscribed = JSON.parse(localStorage.getItem('sdb_newsletter') || '[]');
            if (subscribed.indexOf(email) !== -1) {
                document.getElementById('guide-newsletter-form').classList.add('hidden');
                document.getElementById('guide-newsletter-already').classList.remove('hidden');
                return false;
            }
            if (typeof posthog !== 'undefined') {
                posthog.identify(email);
                posthog.people.set({
                    email: email,
                    newsletter_subscribed: true,
                    subscribed_guide: '${guide.slug}',
                    signup_source: 'guide_${guide.slug}',
                    signup_date: new Date().toISOString()
                });
                posthog.capture('guide_email_captured', {
                    source: 'guide',
                    guide_slug: '${guide.slug}',
                    email: email
                });
            }
            subscribed.push(email);
            localStorage.setItem('sdb_newsletter', JSON.stringify(subscribed));
            document.getElementById('guide-newsletter-form').classList.add('hidden');
            document.getElementById('guide-newsletter-success').classList.remove('hidden');
            return false;
        };
    </script>
    <script src="../js/share-bar.js"></script>
</body>
</html>`;

    return html;
}

// ─── Main ────────────────────────────────────────────────────────────────────
function main() {
    const db = loadSupplementData();
    if (!db) { console.error('Failed to load supplement data'); process.exit(1); }

    const outDir = path.join(__dirname, '..', 'guides');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    GUIDES.forEach(guide => {
        const html = generateGuidePage(guide, db.supplements);
        const outPath = path.join(outDir, `${guide.slug}.html`);
        fs.writeFileSync(outPath, html, 'utf8');
        const filtered = db.supplements.filter(guide.filterFn);
        const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
        console.log(`✓ Generated ${guide.slug}.html (${filtered.length} supplements, ${kb}KB)`);
    });

    console.log(`\nDone — ${GUIDES.length} guide pages generated.`);
}

main();
