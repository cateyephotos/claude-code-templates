#!/usr/bin/env node
/**
 * SupplementDB — Health Domain Guide Generator
 * Generates evidence-based guide pages from supplements.js data.
 * Uses the light clinical journal theme (about.html pattern).
 *
 * Usage:  node scripts/generate-guide-pages.js
 */

const vm = require('vm');
const fs = require('fs');
const path = require('path');
const {
    loadSupplementData,
    normalizeCategory,
    slugify,
    getTierLabel,
    getTierColor,
} = require('./parse-data');

// --- Content Split Configuration ---
const PREMIUM_CHUNKS_DIR = path.join(__dirname, '..', 'data', 'premium-chunks');

// ─── Enhanced Citations Loading ─────────────────────────────────────────────
const ENH_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');

/** Find the enhanced citations file for a given supplement ID */
function findEnhancedFile(id) {
    try {
        const files = fs.readdirSync(ENH_DIR);
        const named   = files.find(f => f.match(new RegExp(`^${id}_[a-z].*_enhanced\\.js$`, 'i')));
        const generic = files.find(f => f === `${id}_enhanced.js`);
        return named || generic || null;
    } catch (e) {
        return null;
    }
}

/** Load enhanced citations object from file, returning null on failure. */
function loadEnhanced(filename) {
    if (!filename) return null;
    try {
        let src = fs.readFileSync(path.join(ENH_DIR, filename), 'utf8');
        const constMatch = src.match(/(?:^|\n)(?:const|var|let)\s+(\w+Enhanced)\s*=/);
        if (constMatch) {
            src += `\n;try{window.__enh=${constMatch[1]};}catch(e){}`;
        }
        const ctx = { window: { enhancedCitations: {} } };
        vm.runInNewContext(src, ctx);
        if (ctx.window.__enh) return ctx.window.__enh;
        const winKeys = Object.keys(ctx.window).filter(k => k !== 'enhancedCitations' && k !== '__enh');
        if (winKeys.length) return ctx.window[winKeys[0]];
        const ec = ctx.window.enhancedCitations;
        if (ec && typeof ec === 'object') {
            const ecKeys = Object.keys(ec);
            if (ecKeys.length) return ec[ecKeys[0]];
        }
        return null;
    } catch (e) {
        return null;
    }
}

/** Map evidence strength string to CSS class modifier */
function enhEvidenceTagClass(text) {
    const t = String(text || '').trim().toLowerCase();
    if (t.includes('strong') || t.includes('level 1') || t.includes('level 2') ||
        t.includes('well-established') || t.includes('good safety'))    return 'evidence-tag-tier-1';
    if (t.includes('moderate') || t.includes('level 3') || t.includes('caution')) return 'evidence-tag-tier-2';
    if (t.includes('weak') || t.includes('limited') || t.includes('insufficient') ||
        t.includes('level 4') || t.includes('level 5') || t.includes('preliminary')) return 'evidence-tag-tier-3';
    return '';
}

/** Build a single evidence card from an enhanced citations item, with supplement context */
function buildGuideCard(item, supplementName) {
    const h = s => (s != null ? String(s) : '').trim();
    const tags = [];
    const evStr = h(item.evidence || item.evidenceLevel || item.strength || '');
    if (evStr) tags.push({ text: evStr, cls: enhEvidenceTagClass(evStr) });
    const st = h(item.studyType || '');
    if (st) tags.push({ text: st, cls: '' });
    if (item.year) tags.push({ text: String(item.year), cls: '' });
    const pts = h(item.participants || item.sampleSize || '');
    if (pts) tags.push({ text: pts, cls: '' });
    const pid = h(item.pmid || '');
    const doi = h(item.doi  || '');
    const linkHref = pid ? `https://pubmed.ncbi.nlm.nih.gov/${pid}/`
                         : (doi ? `https://doi.org/${doi}` : '');
    const linkLabel = pid ? `PubMed: ${pid}` : (doi ? `DOI: ${doi}` : 'View Source');
    return {
        findingTitle: h(item.claim || item.mechanism || item.healthDomain ||
                        item.safetyAspect || item.dosageRange || ''),
        tags,
        prose: h(item.details || item.findings || ''),
        linkHref,
        linkLabel,
        supplementName,
    };
}

/** Aggregate enhanced citations across supplements into 4 groups */
function aggregateEnhancedGroups(supplements) {
    const GROUP_MAP = [
        { key: 'mechanisms', title: 'Mechanisms of Action', icon: 'fa-microscope' },
        { key: 'benefits',   title: 'Clinical Benefits',    icon: 'fa-heart-pulse' },
        { key: 'safety',     title: 'Safety & Tolerability', icon: 'fa-shield-halved' },
        { key: 'dosage',     title: 'Dosage Research',       icon: 'fa-pills' },
    ];
    const groups = GROUP_MAP.map(g => ({ ...g, cards: [] }));

    for (const s of supplements) {
        const file = findEnhancedFile(s.id);
        const enh = loadEnhanced(file);
        if (!enh || !enh.citations) continue;
        for (let gi = 0; gi < GROUP_MAP.length; gi++) {
            const items = enh.citations[GROUP_MAP[gi].key];
            if (!items || !items.length) continue;
            for (const item of items) {
                const nestedArr = Array.isArray(item.evidence) ? item.evidence
                                : Array.isArray(item.studies)  ? item.studies
                                : null;
                if (nestedArr) {
                    for (const ev of nestedArr) {
                        groups[gi].cards.push(buildGuideCard({
                            ...ev,
                            claim: item.mechanism || item.healthDomain || item.safetyAspect || item.dosageRange || item.claim || '',
                            evidence: item.strength || item.evidenceQuality || ev.evidenceLevel || '',
                            details: ev.findings || ev.details || '',
                            participants: ev.sampleSize || ev.participants || '',
                        }, s.name));
                    }
                } else {
                    groups[gi].cards.push(buildGuideCard(item, s.name));
                }
            }
        }
    }
    return groups;
}

// ─── Mechanism Glossary Linking ──────────────────────────────────────────────
// Loads alias map from data/mechanisms.js for linking mechanism pills/text
// to the glossary page. Graceful fallback if file doesn't exist yet.
let mechanismAliasMap = {};
try {
    const mechDb = require('../data/mechanisms.js');
    mechanismAliasMap = mechDb.aliasMap || {};
    console.log(`  Loaded ${Object.keys(mechanismAliasMap).length} mechanism alias mappings`);
} catch(e) {
    console.warn('  mechanisms.js not found — mechanism links disabled');
}

function getMechanismLink(mechString) {
    const id = mechanismAliasMap[mechString];
    if (!id) return null;
    return `../guides/mechanisms.html#${id}`;
}

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
            { href: '../guides/mood-support.html', icon: 'fa-face-smile', text: 'Mood Support Guide' },
            { href: '../guides/stress-resilience.html', icon: 'fa-shield-heart', text: 'Stress Resilience Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions' },
            { href: '../categories/adaptogens.html', icon: 'fa-leaf', text: 'Browse Adaptogens' },
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
            { href: '../guides/memory-aging.html', icon: 'fa-brain', text: 'Memory & Cognitive Aging Guide' },
            { href: '../guides/brain-fog.html', icon: 'fa-cloud-sun', text: 'Brain Fog & Mental Clarity Guide' },
            { href: '../guides/nootropic-stacks.html', icon: 'fa-layer-group', text: 'Nootropic Stacks Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions' },
            { href: '../categories/nootropics.html', icon: 'fa-brain', text: 'Browse Nootropics' },
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
            { href: '../guides/longevity.html', icon: 'fa-hourglass-half', text: 'Longevity & Healthy Aging Guide' },
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions' },
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
            { href: '../guides/gut-brain.html', icon: 'fa-bacteria', text: 'Gut-Brain Axis Guide' },
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../guides/cardiovascular.html', icon: 'fa-heartbeat', text: 'Cardiovascular Health Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions' },
            { href: '../categories/herbal-extracts.html', icon: 'fa-seedling', text: 'Browse Herbal Extracts' },
            { href: '../categories/essential-nutrients.html', icon: 'fa-capsules', text: 'Browse Essential Nutrients' },
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
            { href: '../guides/recovery.html', icon: 'fa-bandage', text: 'Recovery & Soreness Guide' },
            { href: '../guides/cardiovascular.html', icon: 'fa-heartbeat', text: 'Cardiovascular Health Guide' },
            { href: '../guides/energy-vitality.html', icon: 'fa-bolt', text: 'Energy & Vitality Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions' },
            { href: '../categories/herbal-extracts.html', icon: 'fa-seedling', text: 'Browse Herbal Extracts' },
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
            { href: '../guides/longevity.html', icon: 'fa-hourglass-half', text: 'Longevity & Healthy Aging Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions' },
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
            { href: '../guides/muscle-strength.html', icon: 'fa-dumbbell', text: 'Muscle Strength Guide' },
            { href: '../guides/recovery.html', icon: 'fa-bandage', text: 'Recovery & Soreness Guide' },
            { href: '../guides/nootropic-stacks.html', icon: 'fa-layer-group', text: 'Nootropic Stacks Guide' },
            { href: '../guides/cognitive-performance.html', icon: 'fa-brain', text: 'Cognitive Performance Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions' },
            { href: '../categories/performance-enhancers.html', icon: 'fa-dumbbell', text: 'Browse Performance Enhancers' },
            { href: '../compare/creatine-vs-beta-alanine.html', icon: 'fa-scale-balanced', text: 'Creatine vs Beta-Alanine' },
            { href: '../compare/coq10-vs-pqq.html', icon: 'fa-scale-balanced', text: 'CoQ10 vs PQQ' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    // ─── Phase 8 Guides (12 new) ────────────────────────────────────────────
    {
        slug: 'mood-support',
        title: 'Evidence-Based Supplements for Mood Support & Depression',
        shortTitle: 'Mood Support & Depression',
        metaTitle: 'Best Supplements for Mood & Depression (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to supplements for mood support and depression. Ranked by clinical evidence from peer-reviewed studies. Includes dosages, mechanisms, and safety profiles.',
        breadcrumb: 'Mood Support & Depression',
        heroSubtitle: 'A systematic review of supplements studied for mood enhancement, depressive symptom reduction, and emotional well-being — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const moodKeys = ['depression','depressiveSymptoms','depressive_symptoms','mood','moodEnhancement',
                'mood_enhancement','mood_improvement','serotonin','emotionalWellbeing',
                'anxiety','anxietyReduction','cortisol','cortisolReduction',
                'motivation','pms_total','pms_mood','wellbeing','well_being',
                'happiness','sadness','hopelessness','bdnf','neurotransmitters'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => moodKeys.includes(k));
        },
        coreSuppNames: [
            'Ashwagandha', 'Omega-3 Fatty Acids', 'Magnesium', '5-HTP', 'SAMe',
            'Rhodiola rosea', 'Inositol', 'Vitamin B6', 'Vitamin B12', 'Vitamin D3'
        ],
        snippetDefinition: 'Mood-support supplements are dietary compounds studied in peer-reviewed clinical trials for their effects on depressive symptoms, emotional regulation, and overall psychological well-being. The strongest evidence exists for omega-3 fatty acids (EPA-dominant formulations), SAMe, and ashwagandha, with multiple RCTs demonstrating significant mood improvements.',
        snippetListTitle: 'Top 10 Evidence-Based Supplements for Mood Support',
        introduction: `Depression and mood disorders affect over 280 million people worldwide, making them a leading cause of disability (WHO, 2023). While pharmacological treatments and psychotherapy remain first-line interventions, a growing body of clinical evidence supports specific nutritional and herbal supplements as adjunctive therapies for mood support.

This guide systematically reviews supplements with the strongest clinical evidence for mood enhancement and depressive symptom reduction. Each recommendation is grounded in published randomized controlled trials (RCTs), systematic reviews, and meta-analyses — prioritizing large-scale studies and gold-standard methodologies.

<strong>Important:</strong> This guide is for informational purposes only. Depression is a serious medical condition requiring professional care. Supplements discussed here are studied as adjuncts to — not replacements for — evidence-based psychiatric treatment. If you are experiencing persistent depressive symptoms, please consult a qualified healthcare provider.`,
        mechanismsIntro: `Mood-support supplements work through several interconnected neurobiological pathways to influence serotonergic, dopaminergic, and neuroendocrine systems. Understanding these mechanisms helps identify targeted supplementation strategies.`,
        mechanisms: [
            {
                name: 'Serotonergic Pathway Modulation',
                description: 'Serotonin (5-HT) is a key neurotransmitter regulating mood, appetite, and sleep. Several supplements serve as serotonin precursors or enhance serotonergic signaling. 5-HTP crosses the blood-brain barrier and is directly converted to serotonin, while omega-3 fatty acids modulate serotonin receptor density and signal transduction.',
                supplements: ['5-HTP', 'Omega-3 Fatty Acids', 'Vitamin B6', 'Inositol']
            },
            {
                name: 'Methyl Donor & One-Carbon Metabolism',
                description: 'The methylation cycle is critical for neurotransmitter synthesis and DNA regulation. SAMe is the principal methyl donor in the brain, participating in over 100 methylation reactions including the synthesis of dopamine, serotonin, and norepinephrine. B vitamins (B6, B12, folate) serve as essential cofactors in this cycle.',
                supplements: ['SAMe', 'Vitamin B12', 'Vitamin B6', 'Magnesium']
            },
            {
                name: 'HPA Axis & Stress Response Regulation',
                description: 'Chronic stress dysregulates the hypothalamic-pituitary-adrenal (HPA) axis, leading to elevated cortisol and depressive symptoms. Adaptogens normalize HPA axis function, reducing cortisol output and improving stress resilience — a critical pathway linking chronic stress to depression.',
                supplements: ['Ashwagandha', 'Rhodiola rosea', 'Magnesium']
            },
            {
                name: 'Neuroinflammation & BDNF Support',
                description: 'Neuroinflammation is increasingly recognized as a contributor to depression. Pro-inflammatory cytokines reduce brain-derived neurotrophic factor (BDNF), impairing neuroplasticity. Anti-inflammatory supplements may restore BDNF levels and support neuronal health.',
                supplements: ['Omega-3 Fatty Acids', 'Vitamin D3', 'Ashwagandha']
            }
        ],
        safetyIntro: `Mood-support supplements have important safety considerations, particularly regarding interactions with psychiatric medications and serotonergic compounds.`,
        safetyNotes: [
            '<strong>Serotonin syndrome risk:</strong> 5-HTP and SAMe must NOT be combined with SSRIs, SNRIs, MAOIs, or other serotonergic drugs without medical supervision. Serotonin syndrome is a potentially life-threatening condition requiring emergency care.',
            '<strong>Bipolar disorder caution:</strong> SAMe, 5-HTP, and omega-3s may trigger mania or hypomania in individuals with bipolar disorder. Psychiatric supervision is essential before use.',
            '<strong>Medication interactions:</strong> Ashwagandha may potentiate sedatives and thyroid medications. Rhodiola may interact with antidepressants and blood pressure medications. Always disclose supplement use to your prescriber.',
            '<strong>Vitamin D toxicity:</strong> Vitamin D supplementation above 4,000 IU/day should be guided by blood testing (25-OH vitamin D levels) to avoid hypercalcemia.',
            '<strong>Magnesium forms matter:</strong> Not all magnesium forms cross the blood-brain barrier effectively. Magnesium glycinate and threonate show the best evidence for mood and neurological effects. Magnesium oxide has poor bioavailability.',
            '<strong>Pregnancy and lactation:</strong> Many mood supplements lack adequate pregnancy safety data. 5-HTP and SAMe should be avoided during pregnancy. Omega-3s and magnesium may be used with medical guidance.'
        ],
        researchGaps: [
            'Head-to-head comparisons between mood supplements and standard antidepressants remain limited',
            'Optimal duration of supplementation for sustained mood benefits is poorly characterized',
            'Individual genetic variations in serotonin transporter polymorphisms (5-HTTLPR) may affect supplement response but are rarely studied',
            'Combination protocols (e.g., omega-3 + vitamin D + B vitamins) need controlled trials to establish synergistic effects',
            'Gender-specific responses to mood supplements are underrepresented, with most trials showing mixed-gender results without subgroup analysis',
            'The gut-brain axis role in supplement-mediated mood improvement deserves more mechanistic investigation'
        ],
        relatedLinks: [
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../guides/stress-resilience.html', icon: 'fa-shield-heart', text: 'Stress Resilience Guide' },
            { href: '../guides/brain-fog.html', icon: 'fa-cloud-sun', text: 'Brain Fog Guide' },
            { href: '../guides/sleep.html', icon: 'fa-moon', text: 'Sleep Quality Guide' },
            { href: '../guides/gut-brain.html', icon: 'fa-bacteria', text: 'Gut-Brain Axis Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/ashwagandha-vs-rhodiola.html', icon: 'fa-scale-balanced', text: 'Ashwagandha vs Rhodiola' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'memory-aging',
        title: 'Evidence-Based Supplements for Memory & Cognitive Aging',
        shortTitle: 'Memory & Cognitive Aging',
        metaTitle: 'Best Supplements for Memory & Brain Aging (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to supplements for memory support and healthy cognitive aging. Ranked by clinical evidence from peer-reviewed studies. Dosages, mechanisms, and safety data.',
        breadcrumb: 'Memory & Cognitive Aging',
        heroSubtitle: 'A systematic review of supplements studied for memory preservation, neuroprotection, and age-related cognitive decline — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const memKeys = ['memory','memoryEnhancement','memoryImprovement','memoryHighDose','memoryOverall',
                'memory_elderly','memory_enhancement','memory_mci','composite_memory',
                'cognitive_aging','cognitive_decline','cognitive_protection',
                'dementiaCognition','mciCognition','vciCognition',
                'adas_cog_mci','adasCog','mmse','alzheimersFunctional',
                'nerve_regeneration','neuroprotection','neurotransmitters',
                'cerebral_blood_flow','cerebral_circulation','bdnf'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => memKeys.includes(k));
        },
        coreSuppNames: [
            'Bacopa monnieri', 'Citicoline', 'Phosphatidylserine', "Lion's Mane Mushroom",
            'Ginkgo Biloba', 'Alpha-GPC', 'PQQ', 'Huperzine A'
        ],
        snippetDefinition: 'Memory and cognitive aging supplements are compounds studied in clinical trials for their effects on memory preservation, neuroprotection, and age-related cognitive decline. The strongest evidence exists for bacopa monnieri (consistent memory improvements across 12+ RCTs), citicoline (FDA-approved for cognitive decline in some countries), and phosphatidylserine.',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Memory & Cognitive Aging',
        introduction: `Age-related cognitive decline affects the majority of adults over 60, with memory being one of the earliest and most noticeably affected domains. While some cognitive decline is a normal part of aging, the trajectory from healthy aging to mild cognitive impairment (MCI) and potentially dementia is not inevitable.

A growing body of clinical evidence has investigated whether targeted nutritional interventions can slow cognitive aging, preserve memory function, and support brain health across the lifespan. This guide reviews the supplements with the most robust evidence for memory enhancement and neuroprotection.

<strong>Important:</strong> This guide is for informational purposes only. Significant memory problems or rapid cognitive changes require medical evaluation. Supplements are not proven treatments for Alzheimer's disease, dementia, or other neurodegenerative conditions. Always consult a healthcare professional before beginning any supplement regimen.`,
        mechanismsIntro: `Memory-supporting supplements work through several complementary neurobiological mechanisms that target different aspects of memory formation, consolidation, and retrieval.`,
        mechanisms: [
            {
                name: 'Cholinergic System Support',
                description: 'Acetylcholine is essential for memory encoding and retrieval. Cholinergic decline is a hallmark of Alzheimer\'s disease. Supplements that provide choline precursors or inhibit acetylcholinesterase can maintain cholinergic signaling, supporting memory function in aging populations.',
                supplements: ['Alpha-GPC', 'Citicoline', 'Huperzine A']
            },
            {
                name: 'Nerve Growth Factor (NGF) Stimulation',
                description: 'NGF supports the survival, development, and function of neurons in the hippocampus and cortex — regions critical for memory. Lion\'s mane mushroom contains hericenones and erinacines that cross the blood-brain barrier and stimulate NGF synthesis.',
                supplements: ["Lion's Mane Mushroom", 'Bacopa monnieri', 'PQQ']
            },
            {
                name: 'Phospholipid Membrane Integrity',
                description: 'Neuronal membranes rich in phosphatidylserine (PS) are essential for signal transduction, neurotransmitter release, and synaptic plasticity. PS levels decline with age, and supplementation helps maintain membrane fluidity and receptor function critical for memory processes.',
                supplements: ['Phosphatidylserine', 'Citicoline', 'Omega-3 Fatty Acids']
            },
            {
                name: 'Cerebrovascular Blood Flow',
                description: 'Adequate blood flow delivers oxygen and glucose to neurons and removes metabolic waste. Age-related vascular changes reduce cerebral perfusion. Ginkgo biloba improves microcirculation through vasodilation and platelet inhibition, supporting oxygen delivery to memory-critical brain regions.',
                supplements: ['Ginkgo Biloba', 'Bacopa monnieri', 'Citicoline']
            }
        ],
        safetyIntro: `Memory supplements are generally well-tolerated, but important safety considerations exist — particularly for older adults who may take multiple medications.`,
        safetyNotes: [
            '<strong>Blood-thinning interactions:</strong> Ginkgo biloba has significant antiplatelet properties and must not be combined with warfarin, aspirin, or other anticoagulants without medical supervision. Discontinue at least 2 weeks before surgery.',
            '<strong>Cholinergic excess:</strong> Combining multiple cholinergic supplements (Alpha-GPC + Huperzine A + Citicoline) may cause headaches, nausea, diarrhea, or excessive sweating. Start with one agent and titrate.',
            '<strong>Huperzine A interactions:</strong> Huperzine A is a potent acetylcholinesterase inhibitor and must not be combined with prescription cholinesterase inhibitors (donepezil, rivastigmine, galantamine) due to additive effects.',
            '<strong>Phosphatidylserine source matters:</strong> Modern PS supplements are derived from soy or sunflower lecithin (not bovine cortex). Soy-derived PS may contain allergens. The FDA GRAS determination applies to soy-derived PS at up to 200mg/day.',
            '<strong>PQQ dosing:</strong> PQQ is effective at low doses (10-20mg/day). High doses have not been studied for long-term safety. PQQ may interact with medications affecting mitochondrial function.',
            '<strong>Dementia medication caution:</strong> If taking prescription medications for Alzheimer\'s or dementia, all supplements must be reviewed with a prescribing physician to avoid dangerous interactions.'
        ],
        researchGaps: [
            'Prevention trials (starting supplements before cognitive decline) are rare — most studies recruit already-impaired participants',
            'Optimal treatment duration for neuroprotective effects likely exceeds typical 12-week study periods',
            'Genetic risk factors (APOE4 carriers) may differentially respond to memory supplements but are rarely stratified in analyses',
            'Combination protocols targeting multiple mechanisms simultaneously need controlled evaluation',
            'Biomarker-driven supplementation (choosing supplements based on individual deficiencies) represents an unexplored paradigm',
            'The interaction between lifestyle factors (exercise, sleep, diet) and supplement efficacy for memory is poorly characterized'
        ],
        relatedLinks: [
            { href: '../guides/cognitive-performance.html', icon: 'fa-brain', text: 'Cognitive Performance Guide' },
            { href: '../guides/longevity.html', icon: 'fa-hourglass-half', text: 'Longevity & Healthy Aging Guide' },
            { href: '../guides/brain-fog.html', icon: 'fa-cloud-sun', text: 'Brain Fog Guide' },
            { href: '../guides/cardiovascular.html', icon: 'fa-heart', text: 'Cardiovascular Health Guide' },
            { href: '../guides/nootropic-stacks.html', icon: 'fa-layer-group', text: 'Nootropic Stacks Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/bacopa-vs-ginkgo.html', icon: 'fa-scale-balanced', text: 'Bacopa vs Ginkgo Biloba' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'longevity',
        title: 'Evidence-Based Supplements for Longevity & Healthy Aging',
        shortTitle: 'Longevity & Healthy Aging',
        metaTitle: 'Best Anti-Aging Supplements (2026) | Evidence-Based Longevity Guide',
        metaDescription: 'Science-backed guide to supplements for longevity, healthy aging, and cellular rejuvenation. Ranked by clinical evidence. Dosages, mechanisms, and safety profiles.',
        breadcrumb: 'Longevity & Healthy Aging',
        heroSubtitle: 'A systematic review of supplements studied for lifespan extension, cellular repair, and age-related disease prevention — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const longevityKeys = ['nad_blood_levels','senescent_cells','antioxidant_status','antioxidantCapacity',
                'antiInflammatory_CRP','FMD_endothelial','insulin_sensitivity',
                'heart_function','cardiovascularHealth','mitochondrial_function',
                'longevity','cellular_health','dna_repair','telomere',
                'oxidative_stress','oxidative_stress_reduction','lipidPeroxidation',
                'inflammation','inflammatory_markers','antiInflammatory','CRP_reduction',
                'blood_pressure','cholesterol','LDL_cholesterol','HDL_cholesterol',
                'endothelial_function','vascular_health'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => longevityKeys.includes(k));
        },
        coreSuppNames: [
            'CoQ10', 'NAD+ Precursors', 'Quercetin', 'Resveratrol',
            'PQQ', 'Astaxanthin', 'Alpha-Lipoic Acid', 'Omega-3 Fatty Acids'
        ],
        snippetDefinition: 'Longevity supplements are compounds studied for their effects on cellular aging, mitochondrial function, and age-related disease prevention. The strongest clinical evidence supports CoQ10 (mitochondrial electron transport), NAD+ precursors (cellular energy restoration), and omega-3 fatty acids (systemic inflammation reduction) for healthy aging outcomes.',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Longevity & Healthy Aging',
        introduction: `The biology of aging is increasingly understood as a modifiable process driven by cellular damage accumulation, mitochondrial dysfunction, chronic inflammation, and epigenetic changes. While no supplement has been proven to extend human lifespan, several compounds show compelling evidence for slowing specific hallmarks of aging and reducing age-related disease risk.

This guide reviews supplements targeting the key biological mechanisms of aging: mitochondrial function, NAD+ metabolism, senescence, oxidative damage, and chronic inflammation. Evidence is drawn from randomized controlled trials, systematic reviews, and translational research.

<strong>Important:</strong> This guide is for informational purposes only. Anti-aging supplement claims often exceed the evidence. No supplement has been proven to extend human lifespan. Focus on evidence-based interventions and consult a healthcare professional before starting any longevity protocol.`,
        mechanismsIntro: `Longevity-oriented supplements target distinct hallmarks of aging. The biology of aging involves interconnected pathways, and multi-target approaches may offer synergistic benefits.`,
        mechanisms: [
            {
                name: 'NAD+ Restoration & Sirtuin Activation',
                description: 'NAD+ levels decline 50% between ages 40 and 60, impairing sirtuin activity — key regulators of DNA repair, mitochondrial biogenesis, and cellular stress responses. NAD+ precursors (NMN, NR) restore cellular NAD+ pools, reactivating sirtuins and supporting genomic stability.',
                supplements: ['NAD+ Precursors', 'Resveratrol', 'PQQ']
            },
            {
                name: 'Mitochondrial Biogenesis & Function',
                description: 'Mitochondrial dysfunction is a hallmark of aging, contributing to reduced ATP production, increased reactive oxygen species (ROS), and cellular senescence. CoQ10 is essential for electron transport chain function, while PQQ stimulates mitochondrial biogenesis through PGC-1α activation.',
                supplements: ['CoQ10', 'PQQ', 'Alpha-Lipoic Acid', 'Astaxanthin']
            },
            {
                name: 'Senolytic & Anti-Senescence Activity',
                description: 'Senescent cells accumulate with age and secrete pro-inflammatory factors (SASP) that damage surrounding tissue. Senolytic compounds selectively clear these cells. Quercetin, especially combined with dasatinib in preclinical models, has shown senolytic properties, though human evidence is still emerging.',
                supplements: ['Quercetin', 'Resveratrol']
            },
            {
                name: 'Systemic Inflammation (Inflammaging) Control',
                description: 'Chronic low-grade inflammation ("inflammaging") drives most age-related diseases including cardiovascular disease, neurodegeneration, and cancer. Omega-3 fatty acids reduce CRP, IL-6, and TNF-α levels through specialized pro-resolving mediator (SPM) pathways.',
                supplements: ['Omega-3 Fatty Acids', 'Astaxanthin', 'Alpha-Lipoic Acid', 'Quercetin']
            }
        ],
        safetyIntro: `Longevity supplements have variable safety profiles, and long-term high-dose use requires careful monitoring. The anti-aging supplement market includes many unproven claims — evidence quality varies significantly.`,
        safetyNotes: [
            '<strong>Resveratrol bioavailability:</strong> Resveratrol has extremely poor oral bioavailability (<1%). High doses (>1g/day) may cause GI side effects without proportionally increasing efficacy. Trans-resveratrol formulations with enhanced absorption are preferred.',
            '<strong>CoQ10 drug interactions:</strong> CoQ10 may reduce the effectiveness of warfarin (vitamin K-like effect on coagulation). Statin users often benefit from CoQ10 supplementation, but should coordinate with their prescriber.',
            '<strong>NAD+ precursor safety:</strong> NMN and NR have favorable short-term safety profiles at 250-1000mg/day. Long-term (>1 year) human safety data is limited. Concerns about promoting growth in pre-existing cancers remain theoretical but unresolved.',
            '<strong>Quercetin absorption:</strong> Quercetin has poor bioavailability. Co-administration with vitamin C or bromelain enhances absorption. Quercetin may inhibit CYP3A4 enzymes, potentially increasing blood levels of many medications.',
            '<strong>Astaxanthin dosing:</strong> Astaxanthin at 4-12mg/day is well-tolerated. Higher doses have not been adequately studied. Astaxanthin may lower blood pressure — monitor if taking antihypertensives.',
            '<strong>Alpha-Lipoic Acid caution:</strong> ALA may lower blood glucose levels and should be used cautiously in diabetics taking insulin or oral hypoglycemics. Start with lower doses and monitor blood sugar.'
        ],
        researchGaps: [
            'Human longevity outcomes (actual lifespan extension) have not been demonstrated for any supplement in controlled trials',
            'Optimal combinations and dosing for multi-target anti-aging protocols remain unestablished',
            'Senolytic supplement effects in humans are extrapolated primarily from preclinical models',
            'Long-term safety data (>2 years) for NAD+ precursors and senolytics is severely lacking',
            'Biomarker-driven aging clocks (epigenetic, proteomic) could enable personalized longevity protocols but are rarely used in supplement trials',
            'The interaction between caloric restriction, exercise, and longevity supplements needs systematic investigation'
        ],
        relatedLinks: [
            { href: '../guides/memory-aging.html', icon: 'fa-brain', text: 'Memory & Cognitive Aging Guide' },
            { href: '../guides/cardiovascular.html', icon: 'fa-heart', text: 'Cardiovascular Health Guide' },
            { href: '../guides/cognitive-performance.html', icon: 'fa-brain', text: 'Cognitive Performance Guide' },
            { href: '../guides/womens-health.html', icon: 'fa-venus', text: 'Women\'s Health Guide' },
            { href: '../guides/mens-health.html', icon: 'fa-mars', text: 'Men\'s Health Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/coq10-vs-pqq.html', icon: 'fa-scale-balanced', text: 'CoQ10 vs PQQ' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'brain-fog',
        title: 'Evidence-Based Supplements for Brain Fog & Mental Clarity',
        shortTitle: 'Brain Fog & Mental Clarity',
        metaTitle: 'Best Supplements for Brain Fog (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to supplements for brain fog, mental clarity, and cognitive energy. Ranked by clinical evidence. Dosages, mechanisms, and safety profiles.',
        breadcrumb: 'Brain Fog & Mental Clarity',
        heroSubtitle: 'A systematic review of supplements studied for mental clarity, cognitive energy, and focus — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const fogKeys = ['mental_clarity','mentalFatigue','cognitive_energy','cognitiveEnergy',
                'focus','focusImprovement','attention','attentionEnhancement','attentionExecutive',
                'executiveFunction','executive_function','workingMemory','workingMemoryHighDose',
                'reaction_time','choiceReactionTime','visualReactionTime',
                'cerebral_blood_flow','cerebral_circulation',
                'cognitive_speed','processing_speed','alertness',
                'cognitiveClarity','cognitiveEndurance','cognitive_under_stress',
                'acute_cognition','concentration'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => fogKeys.includes(k));
        },
        coreSuppNames: [
            'Citicoline', 'Alpha-GPC', 'Creatine', "Lion's Mane Mushroom",
            'Bacopa monnieri', 'L-Tyrosine', 'Caffeine', 'MCT Oil'
        ],
        snippetDefinition: 'Brain fog supplements are compounds studied for their effects on mental clarity, cognitive energy, and sustained attention. The strongest evidence supports citicoline (improved attention and processing speed), creatine (enhanced working memory and mental endurance), and caffeine + L-theanine (focused alertness without jitteriness).',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Brain Fog & Mental Clarity',
        introduction: `Brain fog — characterized by difficulty concentrating, mental fatigue, forgetfulness, and reduced mental clarity — is one of the most common cognitive complaints in clinical practice. While not a formal medical diagnosis, it is a recognized symptom cluster associated with sleep deprivation, chronic stress, nutritional deficiencies, hormonal changes, and post-viral syndromes.

This guide reviews supplements with clinical evidence for improving mental clarity, cognitive energy, and sustained focus. Rather than targeting a specific disease, these supplements address the underlying neurobiological mechanisms that contribute to the subjective experience of brain fog.

<strong>Important:</strong> Persistent brain fog may indicate underlying conditions (thyroid dysfunction, anemia, sleep apnea, depression, post-COVID syndrome) that require medical evaluation. This guide is informational and does not replace professional medical assessment.`,
        mechanismsIntro: `Supplements targeting brain fog work through distinct but complementary mechanisms — from direct neurotransmitter support to metabolic energy optimization in neuronal tissues.`,
        mechanisms: [
            {
                name: 'Cholinergic Drive & Phospholipid Synthesis',
                description: 'Acetylcholine is the primary neurotransmitter for sustained attention and mental clarity. Citicoline uniquely provides both a choline precursor (for acetylcholine synthesis) and cytidine (for phosphatidylcholine membrane repair), addressing brain fog at both neurotransmitter and structural levels.',
                supplements: ['Citicoline', 'Alpha-GPC', "Lion's Mane Mushroom"]
            },
            {
                name: 'Brain Creatine & ATP Buffering',
                description: 'The brain consumes ~20% of total body energy despite representing only 2% of body mass. Creatine supplementation increases brain phosphocreatine stores, providing a rapid ATP buffer during demanding cognitive tasks — directly counteracting the "mental fatigue" component of brain fog.',
                supplements: ['Creatine', 'MCT Oil', 'CoQ10']
            },
            {
                name: 'Catecholamine Precursor Support',
                description: 'Dopamine and norepinephrine are critical for motivation, focus, and cognitive drive. L-Tyrosine is the rate-limiting precursor for catecholamine synthesis and is particularly effective when catecholamine stores are depleted by stress, sleep deprivation, or multitasking.',
                supplements: ['L-Tyrosine', 'Caffeine', 'Rhodiola rosea']
            },
            {
                name: 'Balanced Alertness & Alpha-Wave Modulation',
                description: 'Optimal mental clarity requires a balance between alertness and calm focus. L-Theanine promotes alpha-wave brain activity (associated with relaxed attention) while caffeine blocks adenosine receptors (promoting wakefulness). The combination produces "alert calm" — focused attention without anxiety or jitteriness.',
                supplements: ['Caffeine', 'L-Theanine', 'Bacopa monnieri']
            }
        ],
        safetyIntro: `Brain fog supplements are generally well-tolerated, but timing, dosing, and combinations require attention to avoid paradoxical effects or sleep disruption.`,
        safetyNotes: [
            '<strong>Caffeine timing:</strong> Caffeine (half-life 5-6 hours) can cause or worsen brain fog the following day if it disrupts sleep quality. Consume before noon and limit to 200-400mg/day.',
            '<strong>L-Tyrosine and MAOIs:</strong> L-Tyrosine should not be combined with monoamine oxidase inhibitors (MAOIs) or medications for Parkinson\'s disease without medical supervision, as it may cause dangerous catecholamine elevation.',
            '<strong>Cholinergic stacking:</strong> Combining citicoline + Alpha-GPC provides excessive choline precursors and may cause headaches, nausea, and cognitive dulling — the opposite of the intended effect. Use one primary choline source.',
            '<strong>Creatine hydration:</strong> Creatine increases intracellular water retention. Ensure adequate fluid intake (2.5-3L/day) to avoid headaches that could mimic or worsen brain fog.',
            '<strong>MCT Oil GI effects:</strong> Start with 5ml/day and increase gradually. Rapid introduction of MCT oil commonly causes nausea, cramping, and diarrhea. C8 (caprylic acid) formulations are better tolerated.',
            '<strong>Individual response variation:</strong> Brain fog has diverse underlying causes. A supplement addressing cholinergic deficits won\'t help brain fog caused by sleep apnea or thyroid dysfunction. Identify root causes first.'
        ],
        researchGaps: [
            'Post-COVID brain fog has no well-established supplement protocol despite immense patient demand',
            'Objective measurement of "brain fog" is difficult — most studies rely on subjective questionnaires or proxy cognitive tests',
            'Hormonal brain fog (perimenopause, postpartum, thyroid-related) is poorly studied with supplement interventions',
            'Optimal timing of brain fog supplements (morning vs. split dosing) is almost never studied',
            'The role of gut health and the microbiome in brain fog is an emerging area with limited controlled trial evidence',
            'Individual variation in brain fog causes means personalized supplementation protocols would be ideal but remain undeveloped'
        ],
        relatedLinks: [
            { href: '../guides/cognitive-performance.html', icon: 'fa-brain', text: 'Cognitive Performance Guide' },
            { href: '../guides/mood-support.html', icon: 'fa-face-smile', text: 'Mood Support Guide' },
            { href: '../guides/stress-resilience.html', icon: 'fa-shield-heart', text: 'Stress Resilience Guide' },
            { href: '../guides/energy-vitality.html', icon: 'fa-bolt', text: 'Energy & Vitality Guide' },
            { href: '../guides/nootropic-stacks.html', icon: 'fa-layer-group', text: 'Nootropic Stacks Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/citicoline-vs-alpha-gpc.html', icon: 'fa-scale-balanced', text: 'Citicoline vs Alpha-GPC' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'stress-resilience',
        title: 'Evidence-Based Supplements for Stress Resilience & Cortisol Management',
        shortTitle: 'Stress Resilience & Cortisol',
        metaTitle: 'Best Supplements for Stress & Cortisol (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to adaptogenic supplements for stress resilience and cortisol management. Ranked by clinical evidence. Dosages, mechanisms, and safety profiles.',
        breadcrumb: 'Stress Resilience & Cortisol',
        heroSubtitle: 'A systematic review of adaptogenic and stress-modulating supplements studied for cortisol reduction, HPA axis regulation, and burnout prevention — ranked by clinical evidence.',
        filterFn: (s) => {
            const stressKeys = ['cortisol','cortisolReduction','cortisol_reduction',
                'stress','stressReduction','stressReactivity','stress_reduction','stress_markers',
                'anxiety','anxietyReduction','anxiety_reduction',
                'relaxation','sleepQuality','sleep_quality',
                'mood','moodEnhancement','mood_enhancement',
                'adaptogenic','hpa_axis','burnout','fatigue_stress',
                'emotional_wellbeing','perceived_stress'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => stressKeys.includes(k));
        },
        coreSuppNames: [
            'Ashwagandha', 'Rhodiola rosea', 'Phosphatidylserine', 'Magnesium',
            'Holy Basil', 'L-Theanine', 'GABA', 'Reishi Mushroom'
        ],
        snippetDefinition: 'Stress resilience supplements (adaptogens and neuromodulators) are compounds studied for their effects on cortisol levels, HPA axis regulation, and stress tolerance. The strongest evidence exists for ashwagandha (cortisol reduction of 23-30% in multiple RCTs), rhodiola rosea, and phosphatidylserine.',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Stress Resilience',
        introduction: `Chronic stress is a primary driver of both mental and physical health deterioration, contributing to cardiovascular disease, immune suppression, metabolic dysfunction, and accelerated aging. The hypothalamic-pituitary-adrenal (HPA) axis — the body's central stress response system — becomes dysregulated under chronic stress, leading to persistently elevated cortisol with wide-ranging downstream effects.

Adaptogenic supplements are a class of compounds that specifically target stress response pathways, helping the body maintain homeostasis under physical, chemical, and biological stressors. This guide reviews the adaptogens and stress-modulating supplements with the strongest clinical evidence.

<strong>Important:</strong> This guide is for informational purposes only. Chronic stress may contribute to or coexist with anxiety disorders, depression, and other conditions requiring professional treatment. Supplements are not replacements for stress management strategies including sleep optimization, exercise, and psychotherapy.`,
        mechanismsIntro: `Stress-resilience supplements work through complementary mechanisms targeting the HPA axis, neurotransmitter balance, and the neuroinflammatory cascade triggered by chronic stress.`,
        mechanisms: [
            {
                name: 'HPA Axis Normalization',
                description: 'Adaptogens like ashwagandha modulate cortisol output by acting on the hypothalamic-pituitary-adrenal axis. Rather than simply suppressing cortisol, true adaptogens normalize the stress response — lowering excessive cortisol while supporting appropriate acute stress reactions.',
                supplements: ['Ashwagandha', 'Rhodiola rosea', 'Holy Basil']
            },
            {
                name: 'GABAergic Calming Pathways',
                description: 'GABA is the brain\'s primary inhibitory neurotransmitter, counterbalancing excitatory glutamate signaling. Enhanced GABAergic activity produces anxiolytic and calming effects without the sedation or dependency associated with pharmaceutical GABAergic agents (benzodiazepines).',
                supplements: ['L-Theanine', 'GABA', 'Magnesium', 'Ashwagandha']
            },
            {
                name: 'Cortisol-Binding & Phospholipid Regulation',
                description: 'Phosphatidylserine blunts the cortisol response to physical and psychological stress by modulating ACTH release. Studies in athletes and stressed individuals show 15-30% reductions in exercise-induced and psychological stress cortisol with PS supplementation.',
                supplements: ['Phosphatidylserine', 'Omega-3 Fatty Acids']
            },
            {
                name: 'Neuroinflammation & Oxidative Stress Buffering',
                description: 'Chronic stress increases neuroinflammation and oxidative damage in the brain, particularly in the hippocampus and prefrontal cortex. Reishi mushroom and magnesium reduce stress-induced neuroinflammation through NF-κB inhibition and NMDA receptor modulation respectively.',
                supplements: ['Reishi Mushroom', 'Magnesium', 'Rhodiola rosea']
            }
        ],
        safetyIntro: `Adaptogenic supplements have generally favorable safety profiles, but important considerations exist — particularly regarding thyroid function, autoimmune conditions, and medication interactions.`,
        safetyNotes: [
            '<strong>Ashwagandha thyroid effects:</strong> Ashwagandha can increase thyroid hormone levels (T3, T4) and should be used cautiously in hyperthyroid conditions or by those taking thyroid medications. Monitor thyroid function regularly.',
            '<strong>Autoimmune caution:</strong> Ashwagandha and reishi mushroom can stimulate immune function, which may exacerbate autoimmune conditions (lupus, rheumatoid arthritis, multiple sclerosis). Consult an immunologist before use.',
            '<strong>Sedation stacking:</strong> Combining multiple GABAergic supplements (L-theanine + GABA + magnesium) with alcohol or sedative medications may cause excessive drowsiness. Use caution with driving.',
            '<strong>Rhodiola stimulant properties:</strong> Rhodiola has mild stimulant properties and should be taken in the morning. It may cause insomnia if taken in the afternoon. Avoid combining with prescription stimulants.',
            '<strong>Magnesium forms:</strong> Magnesium glycinate is preferred for stress and anxiety (crosses BBB, calming glycine). Avoid magnesium oxide (poor absorption, primarily laxative effect). Doses above 400mg/day may cause loose stools.',
            '<strong>Pregnancy and lactation:</strong> Most adaptogens lack adequate safety data for pregnancy. Ashwagandha may have abortifacient properties at high doses. Avoid all adaptogens during pregnancy unless specifically approved by a healthcare provider.'
        ],
        researchGaps: [
            'Long-term adaptogen use (>6 months) effects on HPA axis sensitivity remain unknown — does chronic use cause dependency or blunting?',
            'Optimal cycling protocols (e.g., 8 weeks on, 2 weeks off) are based on tradition rather than controlled evidence',
            'Cortisol-lowering supplements in individuals with already-low cortisol (adrenal insufficiency) could be harmful but this population is rarely studied',
            'Workplace burnout as a specific endpoint for adaptogen trials has received very limited attention despite massive prevalence',
            'Combination adaptogenic protocols (ashwagandha + rhodiola + holy basil) need controlled evaluation for synergistic effects',
            'Sex-specific cortisol responses to adaptogens are poorly characterized, with most trials inadequately powered for subgroup analysis'
        ],
        relatedLinks: [
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../guides/mood-support.html', icon: 'fa-face-smile', text: 'Mood Support Guide' },
            { href: '../guides/sleep.html', icon: 'fa-moon', text: 'Sleep Quality Guide' },
            { href: '../guides/brain-fog.html', icon: 'fa-cloud-sun', text: 'Brain Fog Guide' },
            { href: '../guides/energy-vitality.html', icon: 'fa-bolt', text: 'Energy & Vitality Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/ashwagandha-vs-rhodiola.html', icon: 'fa-scale-balanced', text: 'Ashwagandha vs Rhodiola' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'safety-interactions',
        title: 'Supplement Safety, Drug Interactions & Contraindications',
        shortTitle: 'Safety & Interactions',
        metaTitle: 'Supplement Safety & Drug Interactions (2026) | Evidence-Based Guide',
        metaDescription: 'Comprehensive guide to supplement safety, drug interactions, and contraindications. Covers all 93 supplements in the database with evidence-based safety profiles.',
        breadcrumb: 'Safety & Interactions',
        heroSubtitle: 'A comprehensive safety reference covering drug interactions, contraindications, and adverse effects for all supplements in the SupplementDB database.',
        filterFn: (s) => true, // ALL supplements — this is a safety reference covering the full database
        coreSuppNames: [
            '5-HTP', 'Berberine', 'Red Yeast Rice', 'Ginkgo Biloba',
            'Omega-3 Fatty Acids', 'Ashwagandha', 'Kanna', 'Garlic'
        ],
        snippetDefinition: 'This comprehensive safety guide covers drug interactions, contraindications, and adverse effect profiles for all 93 supplements in the SupplementDB database. Supplements with the most significant interaction potential include 5-HTP (serotonin syndrome risk), berberine (CYP450 inhibition), ginkgo biloba (bleeding risk), and kanna (SSRI contraindication).',
        snippetListTitle: 'All Supplements: Safety & Interaction Profiles',
        introduction: `Dietary supplements are widely used but not without risk. Drug-supplement interactions, contraindications for specific populations, and adverse effects are real concerns that deserve the same evidence-based scrutiny applied to pharmaceutical agents.

This guide provides a comprehensive safety reference for all supplements in the SupplementDB database. Unlike our domain-specific guides that focus on efficacy, this resource prioritizes safety information: known drug interactions, contraindicated populations, dose-dependent adverse effects, and regulatory considerations.

<strong>Critical Notice:</strong> This guide is for informational purposes only and does not constitute medical advice. Always disclose all supplement use to your healthcare providers, including physicians, pharmacists, and anesthesiologists. Drug-supplement interactions can have serious — and in some cases life-threatening — consequences. When in doubt, consult a qualified healthcare professional before starting or combining any supplement.`,
        mechanismsIntro: `Understanding the pharmacological mechanisms through which supplements interact with drugs and body systems is essential for predicting and avoiding adverse interactions.`,
        mechanisms: [
            {
                name: 'CYP450 Enzyme Inhibition & Induction',
                description: 'The cytochrome P450 enzyme family metabolizes approximately 75% of all prescription drugs. Supplements that inhibit (e.g., berberine inhibits CYP2D6 and CYP3A4) or induce (e.g., St. John\'s Wort induces CYP3A4) these enzymes can dramatically alter drug blood levels, causing toxicity or therapeutic failure.',
                supplements: ['Berberine', 'Quercetin', 'Resveratrol', 'Ginkgo Biloba']
            },
            {
                name: 'Serotonergic Potentiation',
                description: 'Supplements that increase serotonin levels (5-HTP, SAMe, kanna) or inhibit serotonin reuptake create additive risks when combined with serotonergic medications (SSRIs, SNRIs, triptans, MAOIs). Serotonin syndrome is a potentially fatal condition requiring emergency medical attention.',
                supplements: ['5-HTP', 'SAMe', 'Kanna', 'Rhodiola rosea']
            },
            {
                name: 'Anticoagulant & Antiplatelet Effects',
                description: 'Multiple supplements have blood-thinning properties through various mechanisms: platelet aggregation inhibition (ginkgo, omega-3), vitamin K antagonism (high-dose vitamin E), or fibrinolytic activity (nattokinase). Combining these with prescription anticoagulants (warfarin, apixaban) or antiplatelet agents (aspirin, clopidogrel) increases bleeding risk.',
                supplements: ['Ginkgo Biloba', 'Omega-3 Fatty Acids', 'Garlic', 'Vitamin E']
            },
            {
                name: 'Thyroid & Endocrine Modulation',
                description: 'Several supplements affect thyroid hormone levels, cortisol production, or sex hormone metabolism. Ashwagandha increases thyroid hormones, while supplements like DIM and calcium D-glucarate alter estrogen metabolism. These effects can interfere with hormone-sensitive conditions and medications.',
                supplements: ['Ashwagandha', 'Berberine', 'Red Yeast Rice', 'Vitamin D3']
            }
        ],
        safetyIntro: `The following safety notes represent the most critical, highest-risk interactions and contraindications across the supplement database. This is not exhaustive — consult individual supplement monographs for complete safety profiles.`,
        safetyNotes: [
            '<strong>CRITICAL — Serotonin syndrome:</strong> Never combine 5-HTP, SAMe, or kanna with SSRIs, SNRIs, MAOIs, triptans, or tramadol without medical supervision. Symptoms include confusion, rapid heart rate, high blood pressure, dilated pupils, muscle twitching, and hyperthermia. Seek emergency care immediately if suspected.',
            '<strong>CRITICAL — Bleeding risk:</strong> Ginkgo biloba, omega-3 fatty acids (>3g/day), garlic, and vitamin E have anticoagulant effects. Discontinue all at least 2 weeks before surgery. Do not combine with warfarin, heparin, or novel oral anticoagulants without physician monitoring.',
            '<strong>CRITICAL — Statin interactions:</strong> Red yeast rice contains monacolin K (identical to lovastatin) and should NEVER be combined with prescription statins due to additive risk of rhabdomyolysis. Berberine also interacts with statin metabolism via CYP3A4 inhibition.',
            '<strong>Pregnancy contraindications:</strong> Many supplements lack adequate pregnancy safety data. Known contraindications include: ashwagandha (possible abortifacient), berberine (uterine contractions), high-dose vitamin A (teratogenic), kanna (no safety data). Always consult OB/GYN before any supplement use during pregnancy.',
            '<strong>Immunosuppressant interactions:</strong> Immune-stimulating supplements (reishi, astragalus, echinacea, vitamin D at high doses) may counteract immunosuppressant medications used in organ transplant recipients and autoimmune conditions. This interaction can have life-threatening consequences.',
            '<strong>Pre-surgical disclosure:</strong> All supplements must be disclosed to anesthesiologists before surgery. Common problematic supplements include valerian (potentiates anesthetics), ginkgo (bleeding), garlic (bleeding), and St. John\'s Wort (reduces effectiveness of many anesthetic agents).'
        ],
        researchGaps: [
            'Systematic drug-supplement interaction databases are incomplete — many potential interactions have never been formally studied',
            'Most supplement safety data comes from short-term trials (8-12 weeks) — long-term chronic use safety is largely unknown',
            'Pharmacokinetic interaction studies between popular supplement combinations are essentially non-existent',
            'Population-specific safety (elderly, pediatric, renally impaired) is poorly characterized for most supplements',
            'Contamination and adulteration of supplement products remains a significant safety concern not captured in efficacy trial data',
            'Reporting bias means adverse events from supplements are significantly underreported compared to pharmaceuticals'
        ],
        relatedLinks: [
            { href: '../guides/mood-support.html', icon: 'fa-face-smile', text: 'Mood Support Guide' },
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../guides/cardiovascular.html', icon: 'fa-heart', text: 'Cardiovascular Health Guide' },
            { href: '../guides/longevity.html', icon: 'fa-hourglass-half', text: 'Longevity Guide' },
            { href: '../guides/cognitive-performance.html', icon: 'fa-brain', text: 'Cognitive Performance Guide' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../disclaimer.html', icon: 'fa-file-shield', text: 'Medical Disclaimer' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'muscle-strength',
        title: 'Evidence-Based Supplements for Muscle Strength & Lean Mass',
        shortTitle: 'Muscle Strength & Lean Mass',
        metaTitle: 'Best Supplements for Muscle & Strength (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to supplements for muscle strength, lean mass, and physical performance. Ranked by clinical evidence. Dosages, mechanisms, and safety profiles.',
        breadcrumb: 'Muscle Strength & Lean Mass',
        heroSubtitle: 'A systematic review of supplements studied for strength gains, muscle hypertrophy, and body composition improvement — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const muscleKeys = ['strength','powerOutput','power_output','muscleMass','muscle_mass',
                'bodyComposition','body_composition','lean_mass','leanMass',
                'exercisePerformance','exercise_performance',
                'testosterone','testosteroneBoost','testosterone_boost','free_testosterone',
                'growth_hormone','anabolic','hypertrophy',
                'endurance','muscleEndurance','muscle_endurance',
                'bench_press','squat','deadlift','1rm',
                'sprint_performance','anaerobic_power'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => muscleKeys.includes(k));
        },
        coreSuppNames: [
            'Creatine', 'Whey Protein', 'HMB (β-Hydroxy β-Methylbutyrate)', 'Beta-Alanine',
            'Betaine', 'Caffeine', 'Citrulline Malate', 'Alpha-GPC'
        ],
        snippetDefinition: 'Muscle and strength supplements are compounds studied for their effects on lean mass accretion, strength output, and exercise performance. The strongest evidence exists for creatine monohydrate (the most well-studied sports supplement, with consistent strength gains of 5-15%), beta-alanine (buffering muscular endurance), and caffeine (acute performance enhancement of 2-6%).',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Muscle Strength',
        introduction: `Muscle strength and lean mass are not merely aesthetic concerns — they are among the strongest predictors of all-cause mortality, metabolic health, and functional independence across the lifespan. Resistance training remains the foundational intervention, but specific supplements have robust evidence for augmenting strength gains and muscle development.

This guide reviews the supplements with the strongest clinical evidence for supporting muscle strength, hypertrophy, and body composition. Evidence is drawn from meta-analyses of resistance training studies, sports nutrition trials, and systematic reviews from organizations including the International Society of Sports Nutrition (ISSN).

<strong>Important:</strong> No supplement replaces consistent progressive resistance training and adequate protein intake (1.6-2.2g/kg/day). Supplements discussed here enhance — but do not substitute for — foundational training and nutrition principles.`,
        mechanismsIntro: `Strength and muscle-building supplements work through distinct physiological mechanisms — from acute performance enhancement to chronic anabolic signaling and recovery optimization.`,
        mechanisms: [
            {
                name: 'Phosphocreatine Energy Buffer',
                description: 'Creatine monohydrate increases intramuscular phosphocreatine stores by 20-40%, providing rapid ATP regeneration during high-intensity efforts. This translates to more repetitions per set, heavier loads, and greater total training volume — the primary driver of muscle hypertrophy.',
                supplements: ['Creatine', 'Beta-Alanine']
            },
            {
                name: 'Protein Synthesis & Anti-Catabolic Signaling',
                description: 'Muscle growth requires net positive protein balance (synthesis > breakdown). Whey protein provides a rapid leucine bolus that activates mTOR signaling — the master switch for muscle protein synthesis. HMB (a leucine metabolite) additionally reduces protein breakdown during intense training or caloric deficits.',
                supplements: ['Whey Protein', 'HMB (β-Hydroxy β-Methylbutyrate)', 'Creatine']
            },
            {
                name: 'Neuromuscular Activation & Power Output',
                description: 'Caffeine blocks adenosine receptors, increasing neuromuscular excitability and reducing perceived exertion. Alpha-GPC increases acetylcholine availability at the neuromuscular junction, potentially enhancing peak power output. Both act acutely — effects are measured within 30-60 minutes of ingestion.',
                supplements: ['Caffeine', 'Alpha-GPC', 'Betaine']
            },
            {
                name: 'Nitric Oxide & Blood Flow Enhancement',
                description: 'Citrulline is converted to arginine in the kidneys, increasing nitric oxide production. Enhanced blood flow delivers more oxygen and nutrients to working muscles while improving metabolic waste clearance. This translates to improved work capacity and reduced fatigue during high-repetition training.',
                supplements: ['Citrulline Malate', 'Betaine', 'Nitrate (Beetroot)']
            }
        ],
        safetyIntro: `Performance supplements are among the most well-studied supplement categories, but dosing precision, timing, and individual factors require attention.`,
        safetyNotes: [
            '<strong>Creatine misconceptions:</strong> Creatine monohydrate does NOT cause kidney damage in healthy individuals at recommended doses (3-5g/day). However, it raises serum creatinine (a kidney marker), which may falsely suggest renal impairment. Individuals with pre-existing kidney disease should consult a nephrologist.',
            '<strong>Caffeine dosing:</strong> Performance benefits plateau at 3-6mg/kg bodyweight. Higher doses increase side effects (anxiety, tremor, tachycardia) without additional performance gains. Genetic fast/slow metabolizer status (CYP1A2) significantly affects individual response.',
            '<strong>Beta-alanine paresthesia:</strong> Beta-alanine commonly causes harmless tingling (paresthesia) at doses above 800mg. This is not an allergic reaction. Sustained-release formulations or split dosing (800mg × 4/day) minimize this effect.',
            '<strong>Stimulant stacking:</strong> Do NOT combine caffeine with other stimulants (DMAA, synephrine, yohimbine) without medical supervision. Cardiovascular risks (arrhythmia, hypertension) increase significantly with stimulant stacking.',
            '<strong>HMB timing:</strong> HMB-free acid (HMB-FA) has faster absorption than calcium HMB (HMB-Ca). Take HMB-FA 30-60 minutes before training, HMB-Ca 60-120 minutes before. Benefits are most pronounced in untrained individuals or during caloric restriction.',
            '<strong>Contamination risk:</strong> Sports supplements have the highest contamination/adulteration rates in the supplement industry. Use only NSF Certified for Sport or Informed Sport tested products, especially if subject to drug testing.'
        ],
        researchGaps: [
            'Optimal creatine dosing for different body compositions and training modalities is poorly refined beyond the standard 3-5g/day recommendation',
            'Long-term effects of chronic caffeine use on training adaptation (does tolerance reduce performance benefits?) remain debated',
            'Female-specific dosing guidelines for performance supplements are severely lacking — most research uses male participants',
            'The interaction between intermittent fasting/caloric restriction and supplement timing for body composition is poorly studied',
            'Plant-based protein supplements vs. whey for hypertrophy need larger head-to-head trials with matched leucine content',
            'Alpha-GPC effects on power output have promising pilot data but need replication in larger, well-controlled trials'
        ],
        relatedLinks: [
            { href: '../guides/recovery.html', icon: 'fa-bandage', text: 'Recovery & Soreness Guide' },
            { href: '../guides/energy-vitality.html', icon: 'fa-bolt', text: 'Energy & Vitality Guide' },
            { href: '../guides/nootropic-stacks.html', icon: 'fa-layer-group', text: 'Nootropic Stacks Guide' },
            { href: '../guides/mens-health.html', icon: 'fa-mars', text: 'Men\'s Health Guide' },
            { href: '../guides/womens-health.html', icon: 'fa-venus', text: 'Women\'s Health Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/creatine-vs-beta-alanine.html', icon: 'fa-scale-balanced', text: 'Creatine vs Beta-Alanine' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'recovery',
        title: 'Evidence-Based Supplements for Recovery & Soreness',
        shortTitle: 'Recovery & Soreness',
        metaTitle: 'Best Supplements for Recovery & DOMS (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to supplements for exercise recovery, muscle soreness (DOMS), and inflammation management. Ranked by clinical evidence with dosages and safety.',
        breadcrumb: 'Recovery & Soreness',
        heroSubtitle: 'A systematic review of supplements studied for accelerating recovery, reducing DOMS, and managing exercise-induced inflammation — ranked by clinical evidence.',
        filterFn: (s) => {
            const recoveryKeys = ['exercise_recovery','muscleRecovery','muscle_recovery','muscle_damage_CK',
                'DOMS','soreness','delayed_onset_muscle_soreness',
                'inflammation','inflammatory_markers','antiInflammatory','antiInflammatory_CRP','CRP_reduction',
                'joint_pain','joint_pain_reduction','pain_management','pain_reduction',
                'sleep_quality','sleepQuality','sleep','oxidative_stress_reduction',
                'immune_recovery','immune_function'];
            const eKeys = Object.keys(s.effectSizes || {});
            return eKeys.some(k => recoveryKeys.includes(k));
        },
        coreSuppNames: [
            'Omega-3 Fatty Acids', 'Turmeric/Curcumin', 'Taurine', 'MSM',
            'Astaxanthin', 'Citrulline Malate', 'CoQ10', 'Rhodiola rosea'
        ],
        snippetDefinition: 'Recovery supplements are compounds studied for their effects on exercise-induced muscle damage (EIMD), delayed-onset muscle soreness (DOMS), and inflammatory markers following intense training. The strongest evidence supports omega-3 fatty acids (reduced inflammatory cytokines and CK levels), curcumin (significant DOMS reduction in meta-analyses), and taurine (cellular protection and osmotic regulation).',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Recovery',
        introduction: `Exercise-induced muscle damage (EIMD) and delayed-onset muscle soreness (DOMS) are inevitable consequences of progressive overload — the fundamental driver of adaptation. While acute inflammation is necessary for muscle remodeling, excessive or prolonged inflammation impairs recovery, reduces training frequency, and increases injury risk.

This guide reviews supplements with clinical evidence for accelerating recovery, reducing exercise-induced soreness, and managing the inflammatory response to training. Evidence prioritizes meta-analyses of athlete populations, controlled exercise challenge studies, and systematic reviews from sports medicine literature.

<strong>Important:</strong> Recovery supplements complement — but do not replace — foundational recovery strategies: adequate sleep (7-9 hours), sufficient protein intake (1.6-2.2g/kg/day), progressive training periodization, and stress management.`,
        mechanismsIntro: `Recovery supplements target multiple phases of the post-exercise inflammatory and repair cascade, from acute damage limitation to accelerated tissue remodeling.`,
        mechanisms: [
            {
                name: 'Specialized Pro-Resolving Mediator (SPM) Pathways',
                description: 'Omega-3 fatty acids (EPA and DHA) are precursors to specialized pro-resolving mediators (resolvins, protectins, maresins) that actively resolve inflammation rather than simply suppressing it. This distinction is critical — proper resolution of inflammation supports tissue repair while preventing chronic inflammatory states.',
                supplements: ['Omega-3 Fatty Acids', 'Astaxanthin']
            },
            {
                name: 'NF-κB & COX-2 Inhibition',
                description: 'Curcumin is a potent inhibitor of NF-κB (master inflammatory transcription factor) and COX-2 (enzyme producing pro-inflammatory prostaglandins). Unlike NSAIDs, curcumin achieves anti-inflammatory effects without inhibiting COX-1 (which protects the gastric lining), offering a more favorable safety profile for chronic use.',
                supplements: ['Turmeric/Curcumin', 'MSM', 'Astaxanthin']
            },
            {
                name: 'Cellular Osmotic Protection & Membrane Stability',
                description: 'Taurine is a conditionally essential amino acid that stabilizes cell membranes, regulates calcium flux, and maintains osmotic balance during the cellular stress of intense exercise. Eccentric exercise depletes intramuscular taurine, and supplementation helps preserve cellular integrity during damage-inducing training.',
                supplements: ['Taurine', 'CoQ10', 'Magnesium']
            },
            {
                name: 'Blood Flow Enhancement & Metabolic Waste Clearance',
                description: 'Citrulline enhances nitric oxide production, improving blood flow to damaged tissues. Enhanced circulation accelerates delivery of immune cells and nutrients while removing metabolic waste products (lactate, ammonia) that contribute to post-exercise fatigue and soreness.',
                supplements: ['Citrulline Malate', 'Rhodiola rosea']
            }
        ],
        safetyIntro: `Recovery supplements are generally well-tolerated, but timing relative to training and potential interactions with anti-inflammatory medications require consideration.`,
        safetyNotes: [
            '<strong>Anti-inflammatory timing debate:</strong> Some evidence suggests that suppressing inflammation immediately post-exercise may blunt training adaptations (muscle growth, mitochondrial biogenesis). Consider using anti-inflammatory supplements only during competition periods or intensified training blocks, not chronically.',
            '<strong>Curcumin bioavailability:</strong> Standard curcumin has extremely poor absorption (<1%). Use formulations with enhanced bioavailability (piperine, phospholipid complexes, nanoparticles). Curcumin may interact with blood-thinning medications.',
            '<strong>Omega-3 dosing for recovery:</strong> Anti-inflammatory doses (2-4g EPA+DHA/day) are higher than general health doses (1g/day). High-dose omega-3 may increase bleeding time — inform your healthcare provider if taking anticoagulants or before surgery.',
            '<strong>Taurine and energy drinks:</strong> Taurine in energy drinks is typically under-dosed (1g vs. studied doses of 2-6g/day) and combined with caffeine and sugar. Use standalone taurine supplements for recovery rather than energy drinks.',
            '<strong>MSM dosing:</strong> MSM is well-tolerated at 1-3g/day. Higher doses (>6g/day) may cause GI discomfort. MSM has mild blood-thinning properties — use caution with anticoagulants.',
            '<strong>NSAIDs vs. supplements:</strong> Chronic NSAID use for exercise recovery is associated with GI, renal, and cardiovascular risks. Evidence-based supplement alternatives (curcumin, omega-3) may provide similar anti-inflammatory benefits with superior safety profiles for long-term use.'
        ],
        researchGaps: [
            'The "blunting hypothesis" (anti-inflammatory supplements reducing training adaptations) needs definitive long-term controlled trials',
            'Optimal timing of recovery supplements relative to training (immediately post-exercise vs. daily chronic dosing) is poorly defined',
            'Personalized recovery protocols based on training modality (endurance vs. resistance vs. HIIT) remain undeveloped',
            'Female-specific recovery supplement responses are severely underrepresented in the literature',
            'Eccentric vs. concentric exercise damage may respond differently to supplement interventions but are rarely differentiated',
            'Combined recovery supplement protocols (omega-3 + curcumin + taurine) need controlled evaluation for synergistic effects'
        ],
        relatedLinks: [
            { href: '../guides/muscle-strength.html', icon: 'fa-dumbbell', text: 'Muscle Strength Guide' },
            { href: '../guides/energy-vitality.html', icon: 'fa-bolt', text: 'Energy & Vitality Guide' },
            { href: '../guides/joint-health.html', icon: 'fa-bone', text: 'Joint Health Guide' },
            { href: '../guides/immune-function.html', icon: 'fa-shield-virus', text: 'Immune Function Guide' },
            { href: '../guides/sleep.html', icon: 'fa-moon', text: 'Sleep Quality Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/omega-3-vs-curcumin.html', icon: 'fa-scale-balanced', text: 'Omega-3 vs Curcumin' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'womens-health',
        title: 'Evidence-Based Supplements for Women\'s Health & Aging',
        shortTitle: 'Women\'s Health & Aging',
        metaTitle: 'Best Supplements for Women (2026) | Evidence-Based Health Guide',
        metaDescription: 'Science-backed guide to supplements for women\'s health including hormonal balance, bone health, and healthy aging. Ranked by clinical evidence with dosages and safety.',
        breadcrumb: 'Women\'s Health & Aging',
        heroSubtitle: 'A systematic review of supplements studied for women\'s hormonal health, bone density, and age-related concerns — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const womensKeys = ['pcos_symptoms','pms_total','pms_physical','pms_mood','pms_pain',
                'ntd_prevention','iron_status','iron_deficiency',
                'bone','bone_density','bone_health','osteoporosis',
                'mood','moodEnhancement','depression','anxiety',
                'menstrual','hormonal','estrogen','progesterone',
                'fertility','pregnancy','prenatal',
                'hot_flashes','menopause','perimenopause'];
            const eKeys = Object.keys(s.effectSizes || {});
            const nameMatch = ['Iron', 'Folate', 'Calcium', 'Vitamin D3'].some(n =>
                s.name.toLowerCase().includes(n.toLowerCase())
            );
            return nameMatch || eKeys.some(k => womensKeys.includes(k));
        },
        coreSuppNames: [
            'Omega-3 Fatty Acids', 'Magnesium', 'Vitamin D3', 'CoQ10',
            'Iron', 'Folate', 'Inositol', 'Zinc'
        ],
        snippetDefinition: 'Women\'s health supplements are compounds studied for their effects on hormonal balance, bone health, fertility, and age-related conditions specific to women. The strongest evidence supports vitamin D3 + calcium (bone density preservation), inositol (PCOS symptom management), magnesium (PMS symptom reduction), and folate (neural tube defect prevention).',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Women\'s Health',
        introduction: `Women face unique nutritional and health challenges across the lifespan — from menstrual health and fertility to pregnancy, perimenopause, and post-menopausal bone health. Hormonal fluctuations create distinct nutritional demands, and certain deficiencies (iron, folate, vitamin D, calcium) are significantly more prevalent in women.

This guide reviews supplements with the strongest clinical evidence for women-specific health outcomes. Evidence prioritizes trials conducted in female populations, addressing conditions and life stages unique to or disproportionately affecting women.

<strong>Important:</strong> This guide is for informational purposes only. Women's health involves complex hormonal interactions, and supplements can have unintended effects on hormone-sensitive conditions (PCOS, endometriosis, hormone-receptor-positive cancers). Always consult a healthcare provider — particularly regarding pregnancy, fertility treatments, and hormone therapy.`,
        mechanismsIntro: `Women's health supplements work through hormonal modulation, nutritional repletion, and bone-specific metabolic pathways that are distinctly relevant to female physiology.`,
        mechanisms: [
            {
                name: 'Insulin Signaling & Ovarian Function',
                description: 'Inositol (specifically myo-inositol and D-chiro-inositol) acts as a second messenger in insulin signaling pathways. In PCOS, insulin resistance impairs ovarian function. Inositol improves insulin sensitivity, restores ovulatory cycles, and reduces androgen levels — addressing the metabolic root of PCOS.',
                supplements: ['Inositol', 'Berberine', 'Magnesium']
            },
            {
                name: 'Calcium & Vitamin D Bone Metabolism',
                description: 'Estrogen decline during menopause accelerates bone resorption, increasing osteoporosis risk. Vitamin D3 enhances intestinal calcium absorption (from ~10-15% to 30-40%), while adequate calcium provides the substrate for bone mineralization. Combined supplementation reduces fracture risk in postmenopausal women.',
                supplements: ['Vitamin D3', 'Calcium', 'Magnesium', 'Vitamin K2']
            },
            {
                name: 'Iron Homeostasis & Oxygen Transport',
                description: 'Menstrual blood loss makes iron deficiency the most common nutritional deficiency in women of reproductive age. Iron is essential for hemoglobin synthesis, oxygen transport, and energy metabolism. Iron deficiency — even without anemia — causes fatigue, cognitive impairment, and reduced exercise capacity.',
                supplements: ['Iron', 'Vitamin C', 'Folate']
            },
            {
                name: 'Neural Tube Development & Methylation',
                description: 'Folate (as 5-MTHF or folic acid) is critical for neural tube closure during the first 28 days of embryonic development — often before pregnancy is confirmed. Adequate folate status reduces neural tube defect risk by 50-70%. The MTHFR polymorphism (present in ~40% of the population) may impair folic acid conversion.',
                supplements: ['Folate', 'Vitamin B12', 'Choline']
            }
        ],
        safetyIntro: `Women's health supplements require careful attention to reproductive status, hormonal conditions, and the significant physiological changes that occur across the female lifespan.`,
        safetyNotes: [
            '<strong>Iron overload risk:</strong> Iron supplementation should ONLY occur with confirmed deficiency (ferritin + iron panel testing). Iron overload is toxic to the liver, heart, and endocrine organs. Post-menopausal women have reduced iron needs and should not supplement without testing.',
            '<strong>Hormone-sensitive conditions:</strong> Supplements affecting estrogen metabolism (soy isoflavones, DIM, black cohosh) require medical supervision in women with hormone-receptor-positive breast cancer, endometriosis, or uterine fibroids.',
            '<strong>Pregnancy timing for folate:</strong> Folate supplementation (400-800mcg/day) should ideally begin 1-3 months before conception. Women with MTHFR polymorphisms may benefit from methylfolate (5-MTHF) rather than folic acid. Doses above 1mg/day should be medically supervised.',
            '<strong>Calcium supplement form:</strong> Calcium carbonate requires stomach acid for absorption (take with meals). Calcium citrate is absorbed independently of stomach acid. Total daily calcium (diet + supplements) should not exceed 2,500mg to avoid hypercalcemia and cardiovascular concerns.',
            '<strong>Vitamin D testing:</strong> Optimal 25-OH vitamin D levels for bone health are 30-50 ng/mL. Doses above 4,000 IU/day should be guided by blood testing. Vitamin D toxicity causes dangerous hypercalcemia.',
            '<strong>Inositol and fertility treatments:</strong> Inositol may enhance outcomes in IVF protocols and ovulation induction, but should be coordinated with a reproductive endocrinologist — not self-directed during fertility treatment.'
        ],
        researchGaps: [
            'Perimenopause-specific supplement protocols are severely understudied despite affecting all women typically between ages 40-55',
            'Supplement interactions with hormonal contraceptives are poorly characterized',
            'Optimal iron repletion strategies (dose, frequency, formulation) for menstruating women without anemia remain debated',
            'The MTHFR polymorphism\'s impact on supplement requirements beyond folate deserves more investigation',
            'Breast cancer risk modification through supplementation is an area of active but inconclusive research',
            'Postpartum recovery supplementation (beyond basic prenatal vitamins) lacks evidence-based guidelines'
        ],
        relatedLinks: [
            { href: '../guides/mens-health.html', icon: 'fa-mars', text: 'Men\'s Health Guide' },
            { href: '../guides/longevity.html', icon: 'fa-hourglass-half', text: 'Longevity & Healthy Aging Guide' },
            { href: '../guides/mood-support.html', icon: 'fa-face-smile', text: 'Mood Support Guide' },
            { href: '../guides/cardiovascular.html', icon: 'fa-heart', text: 'Cardiovascular Health Guide' },
            { href: '../guides/immune-function.html', icon: 'fa-shield-virus', text: 'Immune Function Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/vitamin-d3-vs-calcium.html', icon: 'fa-scale-balanced', text: 'Vitamin D3 vs Calcium' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'mens-health',
        title: 'Evidence-Based Supplements for Men\'s Health & Aging',
        shortTitle: 'Men\'s Health & Aging',
        metaTitle: 'Best Supplements for Men (2026) | Evidence-Based Health Guide',
        metaDescription: 'Science-backed guide to supplements for men\'s health including testosterone support, prostate health, and healthy aging. Ranked by clinical evidence with dosages and safety.',
        breadcrumb: 'Men\'s Health & Aging',
        heroSubtitle: 'A systematic review of supplements studied for men\'s testosterone support, prostate health, and age-related concerns — ranked by strength of clinical evidence.',
        filterFn: (s) => {
            const mensKeys = ['testosterone','testosteroneBoost','testosterone_boost','free_testosterone',
                'maleFertility','male_fertility','sperm','sperm_quality','sperm_motility',
                'erectileFunction','erectile_function','erectile_dysfunction',
                'strength','powerOutput','muscleMass','muscle_mass',
                'cardiovascular','cardiovascularHealth','blood_pressure',
                'prostate','psa','benign_prostatic_hyperplasia'];
            const eKeys = Object.keys(s.effectSizes || {});
            const nameMatch = ['Creatine', 'Zinc', 'Vitamin D3'].some(n =>
                s.name.toLowerCase().includes(n.toLowerCase())
            );
            return nameMatch || eKeys.some(k => mensKeys.includes(k));
        },
        coreSuppNames: [
            'Creatine', 'Omega-3 Fatty Acids', 'CoQ10', 'Magnesium',
            'Zinc', 'Vitamin D3', 'Ashwagandha', 'Fenugreek'
        ],
        snippetDefinition: 'Men\'s health supplements are compounds studied for testosterone support, prostate health, fertility, and male-pattern aging. The strongest evidence supports creatine (strength and lean mass), ashwagandha (testosterone increase of 14-17% in RCTs), zinc (essential for testosterone synthesis), and vitamin D3 (associated with testosterone levels in deficient men).',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Men\'s Health',
        introduction: `Men face distinct health challenges driven by testosterone decline (1-2% per year after age 30), increased cardiovascular risk, prostate enlargement, and lifestyle-related metabolic dysfunction. These interconnected concerns create specific nutritional demands that differ from general population guidelines.

This guide reviews supplements with the strongest clinical evidence for men-specific health outcomes: testosterone optimization, prostate health, cardiovascular protection, and male fertility. Evidence prioritizes trials conducted in male populations with relevant endpoints.

<strong>Important:</strong> This guide is for informational purposes only. Significant testosterone decline may indicate hypogonadism requiring medical evaluation. Prostate symptoms require urological assessment. Supplements are not replacements for proper medical diagnosis and treatment.`,
        mechanismsIntro: `Men's health supplements target androgen signaling, cardiovascular protection, and reproductive function through distinct but interconnected physiological pathways.`,
        mechanisms: [
            {
                name: 'Testosterone Synthesis & Free Testosterone',
                description: 'Zinc and vitamin D are essential cofactors in testosterone biosynthesis. Zinc deficiency directly reduces testosterone production, while vitamin D receptors in Leydig cells mediate testicular steroidogenesis. Ashwagandha reduces cortisol (which suppresses testosterone) and may directly support DHEA-S and free testosterone levels.',
                supplements: ['Zinc', 'Vitamin D3', 'Ashwagandha', 'Fenugreek']
            },
            {
                name: 'Muscular & Metabolic Health',
                description: 'Sarcopenia (age-related muscle loss) accelerates after 40 and is linked to metabolic syndrome, insulin resistance, and cardiovascular disease. Creatine is the most evidence-based supplement for preserving and building lean mass, with additional benefits for bone density and cognitive function in aging men.',
                supplements: ['Creatine', 'Omega-3 Fatty Acids', 'Magnesium']
            },
            {
                name: 'Cardiovascular & Endothelial Protection',
                description: 'Heart disease remains the leading cause of death in men. Omega-3 fatty acids reduce triglycerides and inflammation, CoQ10 supports myocardial energy production, and magnesium regulates vascular tone and rhythm. These mechanisms complement but do not replace lifestyle interventions.',
                supplements: ['Omega-3 Fatty Acids', 'CoQ10', 'Magnesium']
            },
            {
                name: 'Sperm Quality & Male Fertility',
                description: 'Male fertility has declined significantly over the past 50 years, with sperm counts dropping ~50%. Zinc is concentrated in seminal fluid and is essential for spermatogenesis. CoQ10 improves sperm motility through mitochondrial energy support. Ashwagandha has shown improvements in sperm count and motility in multiple RCTs.',
                supplements: ['Zinc', 'CoQ10', 'Ashwagandha', 'Omega-3 Fatty Acids']
            }
        ],
        safetyIntro: `Men's health supplements are generally safe but require awareness of hormonal interactions, prostate considerations, and cardiovascular medication interactions.`,
        safetyNotes: [
            '<strong>Testosterone boosters vs. TRT:</strong> No supplement replicates the effects of testosterone replacement therapy (TRT). Claims of dramatic testosterone increases from supplements are typically exaggerated. Supplements support optimization within natural ranges — not supraphysiological levels.',
            '<strong>Zinc upper limit:</strong> Zinc supplementation above 40mg/day chronically can cause copper deficiency, leading to anemia and neurological problems. If taking zinc long-term, include 1-2mg copper supplementation.',
            '<strong>Prostate considerations:</strong> Saw palmetto and zinc may affect PSA levels. Inform your urologist about all supplement use before PSA testing or prostate biopsies.',
            '<strong>Ashwagandha thyroid effects:</strong> Ashwagandha can increase thyroid hormone levels. Men with hyperthyroidism or taking thyroid medication should use caution and monitor thyroid function.',
            '<strong>Creatine and DHT:</strong> One small study suggested creatine may increase DHT (dihydrotestosterone). While not replicated, men with male pattern baldness or benign prostatic hyperplasia may wish to monitor for changes.',
            '<strong>Fenugreek and blood sugar:</strong> Fenugreek has hypoglycemic properties. Diabetic men taking insulin or oral hypoglycemics should monitor blood glucose more frequently when starting fenugreek supplementation.'
        ],
        researchGaps: [
            'The clinical significance of supplement-induced testosterone increases within normal ranges is debated — do small absolute increases translate to meaningful health outcomes?',
            'Prostate cancer risk modification through supplementation remains inconclusive despite decades of research',
            'Male fertility supplement protocols need larger RCTs with standardized semen analysis endpoints',
            'Age-stratified responses to men\'s health supplements (30s vs. 50s vs. 70s) are rarely studied',
            'The interaction between resistance training and supplement-mediated testosterone changes needs better characterization',
            'Long-term safety of "testosterone-boosting" supplement combinations taken chronically is unknown'
        ],
        relatedLinks: [
            { href: '../guides/womens-health.html', icon: 'fa-venus', text: 'Women\'s Health Guide' },
            { href: '../guides/longevity.html', icon: 'fa-hourglass-half', text: 'Longevity & Healthy Aging Guide' },
            { href: '../guides/muscle-strength.html', icon: 'fa-dumbbell', text: 'Muscle Strength Guide' },
            { href: '../guides/cardiovascular.html', icon: 'fa-heart', text: 'Cardiovascular Health Guide' },
            { href: '../guides/energy-vitality.html', icon: 'fa-bolt', text: 'Energy & Vitality Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/ashwagandha-vs-fenugreek.html', icon: 'fa-scale-balanced', text: 'Ashwagandha vs Fenugreek' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'gut-brain',
        title: 'Evidence-Based Supplements for the Gut-Brain Axis',
        shortTitle: 'Gut-Brain Axis',
        metaTitle: 'Best Supplements for Gut-Brain Health (2026) | Evidence-Based Guide',
        metaDescription: 'Science-backed guide to supplements for gut-brain axis health, digestive function, and microbiome support. Ranked by clinical evidence with dosages and safety.',
        breadcrumb: 'Gut-Brain Axis',
        heroSubtitle: 'A systematic review of supplements studied for gut-brain communication, digestive health, and microbiome-mediated mood and cognitive effects — ranked by clinical evidence.',
        filterFn: (s) => {
            const gutKeys = ['digestive_symptoms','digestive_health','liver','liver_protection','liver_detox',
                'nausea_reduction','detoxification','gut_health','microbiome',
                'immune_function','immune_enhancement','immune_modulation',
                'inflammation','inflammatory_markers','antiInflammatory',
                'intestinal','barrier_function','probiotic',
                'ibs','ibd','bloating','constipation'];
            const eKeys = Object.keys(s.effectSizes || {});
            const nameMatch = ['Ginger', 'Milk Thistle', 'Spirulina', 'Chlorella'].some(n =>
                s.name.toLowerCase().includes(n.toLowerCase())
            );
            return nameMatch || eKeys.some(k => gutKeys.includes(k));
        },
        coreSuppNames: [
            'Ginger', 'Milk Thistle', 'Schisandra Berry', 'Spirulina',
            'Chlorella', 'Omega-3 Fatty Acids', 'Vitamin D3', 'Choline'
        ],
        snippetDefinition: 'Gut-brain axis supplements are compounds studied for their effects on bidirectional communication between the gastrointestinal system and the central nervous system. The strongest evidence supports omega-3 fatty acids (anti-inflammatory, gut barrier integrity), ginger (nausea and motility), and probiotics (mood and digestive outcomes in multiple meta-analyses).',
        snippetListTitle: 'Top 8 Evidence-Based Supplements for Gut-Brain Health',
        introduction: `The gut-brain axis represents one of the most significant paradigm shifts in modern medicine — the recognition that the gastrointestinal system and the brain communicate bidirectionally through neural, hormonal, immune, and microbial pathways. The gut microbiome produces over 90% of the body's serotonin, modulates systemic inflammation, and directly influences mood, cognition, and stress resilience through the vagus nerve.

This guide reviews supplements with clinical evidence for supporting gut-brain communication, digestive health, and the downstream cognitive and mood effects of intestinal health optimization.

<strong>Important:</strong> This guide is for informational purposes only. Persistent digestive symptoms (IBS, IBD, unexplained abdominal pain, changes in bowel habits) require proper medical evaluation. The gut-brain axis is an emerging field — many claims exceed the current evidence base.`,
        mechanismsIntro: `Gut-brain supplements work through overlapping pathways that influence the microbiome, intestinal barrier, enteric nervous system, and systemic inflammatory tone.`,
        mechanisms: [
            {
                name: 'Intestinal Barrier & Tight Junction Integrity',
                description: 'The intestinal barrier prevents bacterial endotoxins (LPS) from entering systemic circulation and triggering neuroinflammation. "Leaky gut" (increased intestinal permeability) is associated with depression, anxiety, and cognitive impairment. Supplements that strengthen tight junctions reduce this pathway of brain inflammation.',
                supplements: ['Omega-3 Fatty Acids', 'Vitamin D3', 'Zinc']
            },
            {
                name: 'Hepatic Detoxification & Gut-Liver-Brain Axis',
                description: 'The liver processes toxins absorbed from the gut before they reach systemic circulation. Impaired liver function increases brain exposure to ammonia, inflammatory cytokines, and microbial metabolites. Milk thistle (silymarin) and schisandra support phase I and phase II liver detoxification pathways.',
                supplements: ['Milk Thistle', 'Schisandra Berry', 'Choline']
            },
            {
                name: 'Vagal Tone & Enteric Nervous System Signaling',
                description: 'The vagus nerve is the primary communication highway between the gut and brain, transmitting ~80% of signals gut-to-brain (afferent). Ginger stimulates gastric motility and reduces nausea through vagal and serotonergic mechanisms. Omega-3 fatty acids improve vagal tone, which is associated with better emotional regulation.',
                supplements: ['Ginger', 'Omega-3 Fatty Acids', 'Choline']
            },
            {
                name: 'Heavy Metal Binding & Toxin Removal',
                description: 'Environmental toxins accumulate in both the gut and brain, contributing to neuroinflammation and cognitive impairment. Chlorella and spirulina bind heavy metals (mercury, lead, cadmium) in the gastrointestinal tract, reducing absorption and supporting natural detoxification processes.',
                supplements: ['Chlorella', 'Spirulina', 'Milk Thistle']
            }
        ],
        safetyIntro: `Gut-brain supplements have variable safety profiles. Liver-supporting supplements require particular caution in individuals with existing liver disease, and probiotic supplements can cause temporary digestive discomfort.`,
        safetyNotes: [
            '<strong>Milk thistle and medications:</strong> Silymarin inhibits CYP2C9 and CYP3A4 enzymes, potentially increasing blood levels of many medications including warfarin, statins, and anti-diabetic drugs. Always disclose milk thistle use to your pharmacist and prescriber.',
            '<strong>Spirulina and chlorella contamination:</strong> Blue-green algae supplements can be contaminated with microcystins (liver toxins) and heavy metals if sourced from contaminated waters. Use only third-party tested products from reputable manufacturers.',
            '<strong>Ginger blood-thinning effects:</strong> Ginger has mild antiplatelet properties. While safe at culinary doses, therapeutic doses (1-2g/day) may enhance the effects of anticoagulant medications. Discontinue before surgery.',
            '<strong>Probiotic caution in immunocompromised:</strong> Live probiotic supplements should be used cautiously in severely immunocompromised individuals (organ transplant recipients, those on immunosuppressive therapy) due to rare but documented bacteremia/fungemia risks.',
            '<strong>Choline upper limit:</strong> Choline at doses above 3.5g/day may cause fishy body odor, nausea, and hypotension. Excessive choline can be converted to TMAO by gut bacteria, which is associated with cardiovascular risk in some studies.',
            '<strong>Existing liver disease:</strong> While milk thistle is studied for liver protection, individuals with cirrhosis, hepatitis, or other active liver disease should only use supplements under hepatologist supervision.'
        ],
        researchGaps: [
            'Microbiome-targeted supplementation (choosing supplements based on individual microbiome profiles) is conceptually promising but clinically unvalidated',
            'The gut-brain axis in neurodegenerative diseases (Alzheimer\'s, Parkinson\'s) represents a rapidly growing but still preliminary research frontier',
            'Psychobiotic supplements (probiotics specifically targeting mood outcomes) need larger, longer, and better-controlled trials',
            'The interaction between diet, supplements, and the microbiome is extraordinarily complex and individually variable',
            'Post-antibiotic gut-brain recovery protocols combining prebiotics, probiotics, and supportive supplements remain unstandardized',
            'Gut barrier testing (zonulin, lactulose/mannitol) as a guide for supplementation is used clinically but not validated in controlled trials'
        ],
        relatedLinks: [
            { href: '../guides/mood-support.html', icon: 'fa-face-smile', text: 'Mood Support Guide' },
            { href: '../guides/immune-function.html', icon: 'fa-shield-virus', text: 'Immune Function Guide' },
            { href: '../guides/anxiety-stress.html', icon: 'fa-heart-pulse', text: 'Anxiety & Stress Guide' },
            { href: '../guides/cognitive-performance.html', icon: 'fa-brain', text: 'Cognitive Performance Guide' },
            { href: '../guides/metabolic-health.html', icon: 'fa-weight-scale', text: 'Metabolic Health Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../index.html', icon: 'fa-database', text: 'Full Supplement Database' },
            { href: '../methodology.html', icon: 'fa-flask', text: 'Research Methodology' },
            { href: '../faq.html', icon: 'fa-circle-question', text: 'FAQ' }
        ]
    },
    {
        slug: 'nootropic-stacks',
        title: 'Evidence-Based Nootropic Stacks & Cognitive Combos',
        shortTitle: 'Nootropic Stacks',
        metaTitle: 'Best Nootropic Stacks (2026) | Evidence-Based Cognitive Combos Guide',
        metaDescription: 'Science-backed guide to nootropic stacks and synergistic cognitive supplement combinations. Ranked by clinical evidence. Stack protocols, dosages, and safety.',
        breadcrumb: 'Nootropic Stacks',
        heroSubtitle: 'A systematic review of synergistic nootropic combinations, cognitive enhancement stacks, and evidence-based supplement pairing strategies — ranked by clinical evidence.',
        filterFn: (s) => {
            const nootropicKeys = ['memory','memoryEnhancement','memoryImprovement','memoryHighDose',
                'cognition','cognitive_function','cognitive_speed','cognitive_energy',
                'attention','attentionEnhancement','attentionExecutive',
                'focus','focusImprovement','mental_clarity',
                'alertness','mentalFatigue',
                'neurotransmitters','dopamineSupport','serotonin',
                'acute_cognition','reaction_time','choiceReactionTime',
                'workingMemory','executiveFunction','learningImprovement','learning_capacity'];
            const cat = normalizeCategory(s.category);
            const eKeys = Object.keys(s.effectSizes || {});
            return cat === 'Nootropics' || eKeys.some(k => nootropicKeys.includes(k));
        },
        coreSuppNames: [
            'Caffeine', 'L-Theanine', 'Bacopa monnieri', 'Alpha-GPC',
            'Citicoline', 'Creatine', "Lion's Mane Mushroom", 'Piracetam'
        ],
        snippetDefinition: 'Nootropic stacks are intentional combinations of cognitive-enhancing supplements designed to produce synergistic effects greater than individual components. The most well-studied stack is caffeine + L-theanine (enhanced attention without anxiety). Other evidence-based combinations include citicoline + bacopa (cholinergic + memory) and creatine + caffeine (energy + alertness), though stack-specific controlled trials remain limited.',
        snippetListTitle: 'Top 8 Evidence-Based Nootropic Supplements for Stacking',
        introduction: `Nootropic stacking — the practice of combining cognitive-enhancing supplements for synergistic effects — is one of the most popular yet least evidence-based areas of supplementation. While individual nootropics have varying levels of clinical evidence, controlled trials specifically testing combinations are rare.

This guide reviews the individual nootropics most commonly used in stacks, evaluates the evidence for specific synergistic combinations, and provides evidence-based guidance for constructing cognitive enhancement protocols. We distinguish between well-studied combinations and theoretical synergies that lack controlled evaluation.

<strong>Important:</strong> This guide is for informational purposes only. Stacking multiple supplements increases both potential benefits and potential risks. Start with single agents, establish individual tolerance, and add one compound at a time. Never combine nootropics with prescription cognitive or psychiatric medications without medical supervision.`,
        mechanismsIntro: `Effective nootropic stacks combine supplements targeting complementary cognitive mechanisms, creating additive or synergistic effects while minimizing side effects through mechanism-based pairing.`,
        mechanisms: [
            {
                name: 'Balanced Stimulation (Caffeine + L-Theanine)',
                description: 'The most well-studied nootropic stack combines caffeine (adenosine antagonist, promotes alertness and focus) with L-theanine (promotes alpha-wave activity, reduces anxiety). L-theanine smooths the jittery edge of caffeine while preserving its cognitive benefits. Typical ratio: 2:1 (L-theanine:caffeine) — e.g., 200mg L-theanine + 100mg caffeine.',
                supplements: ['Caffeine', 'L-Theanine']
            },
            {
                name: 'Cholinergic Enhancement Stack',
                description: 'Cholinergic stacks provide choline precursors (citicoline or Alpha-GPC) alongside compounds that enhance cholinergic utilization (racetams) or protect cholinergic neurons (bacopa, lion\'s mane). The rationale: increased acetylcholine production paired with enhanced receptor sensitivity or neuroprotection.',
                supplements: ['Citicoline', 'Alpha-GPC', 'Bacopa monnieri', "Lion's Mane Mushroom"]
            },
            {
                name: 'Brain Energy & Endurance',
                description: 'Cognitive endurance stacks target the brain\'s massive energy demands (~20% of total ATP). Creatine replenishes phosphocreatine reserves, citicoline supports mitochondrial membrane integrity, and MCT oil provides rapid ketone-based fuel. This stack is designed for sustained cognitive performance under demanding conditions.',
                supplements: ['Creatine', 'Citicoline', 'MCT Oil', 'CoQ10']
            },
            {
                name: 'Neuroplasticity & Long-Term Cognitive Health',
                description: 'Long-term cognitive optimization stacks focus on neurogenesis, synaptic plasticity, and neuroprotection. Lion\'s mane stimulates NGF, bacopa enhances dendritic arborization, and omega-3 DHA provides structural support for neuronal membranes. These effects develop over weeks to months of consistent use.',
                supplements: ["Lion's Mane Mushroom", 'Bacopa monnieri', 'Omega-3 Fatty Acids', 'PQQ']
            }
        ],
        safetyIntro: `Nootropic stacking introduces compounding risks. The more supplements combined, the greater the potential for interactions, side effects, and unpredictable synergies.`,
        safetyNotes: [
            '<strong>One at a time rule:</strong> Never start a full stack simultaneously. Add one compound at a time, waiting 1-2 weeks between additions to identify individual response, tolerance, and potential side effects.',
            '<strong>Cholinergic overload:</strong> Do NOT stack multiple choline sources at full doses (e.g., citicoline 500mg + Alpha-GPC 600mg). Excessive acetylcholine causes headaches, brain fog (paradoxically), depression, and GI distress. Choose one primary choline source.',
            '<strong>Stimulant ceiling:</strong> Caffeine is included in many nootropic products. Track total daily caffeine from all sources (coffee, tea, supplements, pre-workout) to avoid exceeding 400mg/day. Symptoms of excess: anxiety, tremor, insomnia, tachycardia.',
            '<strong>Piracetam legal status:</strong> Piracetam is available by prescription in many countries and as a dietary supplement in others. Regulatory status varies — verify legality in your jurisdiction. Piracetam may increase the effects of blood-thinning medications.',
            '<strong>Bacopa timing:</strong> Bacopa monnieri is fat-soluble and should be taken with meals. Effects develop gradually over 8-12 weeks — not acutely. Bacopa may cause lethargy in some individuals, making it better suited for evening dosing.',
            '<strong>Psychiatric medication interactions:</strong> Do NOT combine nootropic stacks with prescription cognitive enhancers (modafinil, methylphenidate, amphetamines), SSRIs, or MAOIs without medical supervision. Multiple mechanism targeting increases unpredictable interaction risk.'
        ],
        researchGaps: [
            'Controlled trials specifically testing nootropic stacks (rather than individual compounds) are extremely rare',
            'Dose-response relationships within stacks (optimal ratio of each component) are almost entirely based on anecdotal evidence',
            'Long-term effects of chronic nootropic stacking (>12 months) on brain chemistry and receptor regulation are unknown',
            'Individual variation in stack response (due to genetics, baseline neurotransmitter levels, diet, sleep) makes standardized protocols unreliable',
            'The "more is better" assumption of stacking has never been tested against optimized single-agent protocols',
            'Withdrawal effects and dependency potential of chronic nootropic use need systematic investigation'
        ],
        relatedLinks: [
            { href: '../guides/cognitive-performance.html', icon: 'fa-brain', text: 'Cognitive Performance Guide' },
            { href: '../guides/brain-fog.html', icon: 'fa-cloud-sun', text: 'Brain Fog Guide' },
            { href: '../guides/memory-aging.html', icon: 'fa-brain', text: 'Memory & Aging Guide' },
            { href: '../guides/energy-vitality.html', icon: 'fa-bolt', text: 'Energy & Vitality Guide' },
            { href: '../guides/muscle-strength.html', icon: 'fa-dumbbell', text: 'Muscle Strength Guide' },
            { href: '../guides/safety-interactions.html', icon: 'fa-triangle-exclamation', text: 'Safety & Interactions Guide' },
            { href: '../compare/citicoline-vs-alpha-gpc.html', icon: 'fa-scale-balanced', text: 'Citicoline vs Alpha-GPC' },
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
    return `<span class="tier-${tier}-badge inline-block px-2 py-0.5 rounded text-xs font-bold">${getTierLabel(tier)}</span>`;
}

function getBenefitsList(s) {
    const cog = s.primaryBenefits?.cognitive || [];
    const non = s.primaryBenefits?.nonCognitive || [];
    return [...cog, ...non];
}

// ─── Domain Keywords (shared constant) ──────────────────────────────────────
// Used by getDomainBenefit() and getDomainSortedBenefits() to match benefits
// to guide domains. Kept as a single constant to avoid duplication.
const DOMAIN_KEYWORDS = {
    'anxiety-stress': ['anxiety', 'stress', 'calm', 'relax', 'cortisol', 'mood', 'sleep', 'gaba', 'serotonin', 'adaptogen'],
    'cognitive-performance': ['memory', 'cognit', 'focus', 'attention', 'brain', 'learning', 'mental', 'neuroprotect', 'neurotrophic', 'acetylcholine'],
    'cardiovascular': ['cardiovascular', 'heart', 'blood pressure', 'cholesterol', 'lipid', 'triglyceride', 'vascular', 'endothel', 'arterial', 'cardiac', 'circulation'],
    'immune-function': ['immune', 'infection', 'cold', 'flu', 'antioxidant', 'nk cell', 'cytokine', 'antibod', 'pathogen', 'antimicrobial', 'antiviral', 'white blood'],
    'joint-health': ['joint', 'cartilage', 'inflammat', 'arthritis', 'pain', 'mobility', 'collagen', 'bone', 'connective tissue', 'synovial', 'musculoskeletal'],
    'metabolic-health': ['glucose', 'insulin', 'blood sugar', 'metaboli', 'HbA1c', 'glycemic', 'diabetes', 'weight', 'fat', 'obesity', 'AMPK', 'thermogen'],
    'energy-vitality': ['energy', 'fatigue', 'endurance', 'performance', 'ATP', 'mitochondri', 'oxygen', 'VO2', 'stamina', 'power', 'strength', 'exercise'],
    'mood-support': ['mood', 'depression', 'serotonin', 'emotional', 'antidepressant', 'wellbeing', 'well-being', 'happiness', 'sadness', 'hopelessness'],
    'memory-aging': ['memory', 'cognitive aging', 'dementia', 'alzheimer', 'neuroprotect', 'brain aging', 'neurodegenerat', 'recall', 'forgetful', 'age-related'],
    'longevity': ['longevity', 'aging', 'anti-aging', 'lifespan', 'senescen', 'mitochondri', 'NAD', 'sirtuin', 'telomere', 'oxidative'],
    'brain-fog': ['brain fog', 'mental clarity', 'focus', 'concentration', 'alertness', 'mental fatigue', 'cognitive energy', 'processing speed', 'sharpness', 'foggy'],
    'stress-resilience': ['stress', 'cortisol', 'adaptogen', 'resilience', 'HPA', 'adrenal', 'burnout', 'overwhelm', 'calm', 'tension'],
    'safety-interactions': ['safety', 'interaction', 'contraindication', 'side effect', 'adverse', 'toxicity', 'warning', 'caution', 'drug interaction', 'risk'],
    'muscle-strength': ['muscle', 'strength', 'lean mass', 'hypertrophy', 'power', 'resistance', 'bodybuilding', 'anabolic', 'force', 'contractile'],
    'recovery': ['recovery', 'soreness', 'DOMS', 'repair', 'regenerat', 'post-exercise', 'muscle damage', 'inflammation', 'healing', 'rest'],
    'womens-health': ['women', 'female', 'menstrual', 'PMS', 'menopause', 'pregnancy', 'fertility', 'osteoporosis', 'iron', 'hormonal'],
    'mens-health': ['men', 'male', 'testosterone', 'prostate', 'fertility', 'erectile', 'androgen', 'DHT', 'sperm', 'virility'],
    'gut-brain': ['gut', 'digest', 'microbiome', 'probiotic', 'intestin', 'IBS', 'leaky gut', 'barrier', 'enteric', 'vagus'],
    'nootropic-stacks': ['nootropic', 'stack', 'synerg', 'cognitive enhance', 'smart drug', 'brain boost', 'neuroenhance', 'racetam', 'choline', 'cognitive combo']
};

// ─── Domain Themes (dark journal design) ─────────────────────────────────────
// Each domain gets a unique accent color palette but shares the same dark navy base.
const DOMAIN_THEMES = {
    'anxiety-stress':         { accent: '#7c3aed', accentLight: '#8b5cf6', glow: '#c4b5fd', glowRgb: '196,181,253', accentRgb: '124,58,237', icon: 'wave',       faIcon: 'fa-spa' },
    'cognitive-performance':  { accent: '#0891b2', accentLight: '#06b6d4', glow: '#67e8f9', glowRgb: '103,232,249', accentRgb: '8,145,178',   icon: 'brain',      faIcon: 'fa-brain' },
    'cardiovascular':         { accent: '#e11d48', accentLight: '#f43f5e', glow: '#fda4af', glowRgb: '253,164,175', accentRgb: '225,29,72',    icon: 'heart',      faIcon: 'fa-heart-pulse' },
    'immune-function':        { accent: '#059669', accentLight: '#10b981', glow: '#6ee7b7', glowRgb: '110,231,183', accentRgb: '5,150,105',    icon: 'shield',     faIcon: 'fa-shield-virus' },
    'joint-health':           { accent: '#d97706', accentLight: '#f59e0b', glow: '#fcd34d', glowRgb: '252,211,77',  accentRgb: '217,119,6',    icon: 'bone',       faIcon: 'fa-bone' },
    'metabolic-health':       { accent: '#ea580c', accentLight: '#f97316', glow: '#fdba74', glowRgb: '253,186,116', accentRgb: '234,88,12',    icon: 'flame',      faIcon: 'fa-fire' },
    'energy-vitality':        { accent: '#ca8a04', accentLight: '#eab308', glow: '#fde047', glowRgb: '253,224,71',  accentRgb: '202,138,4',    icon: 'lightning',  faIcon: 'fa-bolt' },
    'mood-support':           { accent: '#0284c7', accentLight: '#0ea5e9', glow: '#7dd3fc', glowRgb: '125,211,252', accentRgb: '2,132,199',    icon: 'sun',        faIcon: 'fa-sun' },
    'memory-aging':           { accent: '#475569', accentLight: '#64748b', glow: '#cbd5e1', glowRgb: '203,213,225', accentRgb: '71,85,105',    icon: 'chip',       faIcon: 'fa-microchip' },
    'longevity':              { accent: '#0d9488', accentLight: '#14b8a6', glow: '#5eead4', glowRgb: '94,234,212',  accentRgb: '13,148,136',   icon: 'hourglass',  faIcon: 'fa-hourglass-half' },
    'brain-fog':              { accent: '#c026d3', accentLight: '#d946ef', glow: '#f0abfc', glowRgb: '240,171,252', accentRgb: '192,38,211',   icon: 'cloud',      faIcon: 'fa-cloud' },
    'stress-resilience':      { accent: '#78716c', accentLight: '#a8a29e', glow: '#d6d3d1', glowRgb: '214,211,209', accentRgb: '120,113,108',  icon: 'mountain',   faIcon: 'fa-mountain' },
    'safety-interactions':    { accent: '#f59e0b', accentLight: '#fbbf24', glow: '#fde68a', glowRgb: '253,230,138', accentRgb: '245,158,11',   icon: 'warning',    faIcon: 'fa-triangle-exclamation' },
    'muscle-strength':        { accent: '#dc2626', accentLight: '#ef4444', glow: '#fca5a5', glowRgb: '252,165,165', accentRgb: '220,38,38',    icon: 'dumbbell',   faIcon: 'fa-dumbbell' },
    'recovery':               { accent: '#16a34a', accentLight: '#22c55e', glow: '#86efac', glowRgb: '134,239,172', accentRgb: '22,163,74',    icon: 'arrows',     faIcon: 'fa-rotate' },
    'womens-health':          { accent: '#db2777', accentLight: '#ec4899', glow: '#f9a8d4', glowRgb: '249,168,212', accentRgb: '219,39,119',   icon: 'venus',      faIcon: 'fa-venus' },
    'mens-health':            { accent: '#2563eb', accentLight: '#3b82f6', glow: '#bfdbfe', glowRgb: '191,219,254', accentRgb: '37,99,235',    icon: 'mars',       faIcon: 'fa-mars' },
    'gut-brain':              { accent: '#65a30d', accentLight: '#84cc16', glow: '#bef264', glowRgb: '190,242,100', accentRgb: '101,163,13',   icon: 'gut',        faIcon: 'fa-bacterium' },
    'nootropic-stacks':       { accent: '#2563eb', accentLight: '#3b82f6', glow: '#93c5fd', glowRgb: '147,197,253', accentRgb: '37,99,235',    icon: 'layers',     faIcon: 'fa-layer-group' },
};

// ─── Domain SVG Hero Icons ───────────────────────────────────────────────────
function getDomainHeroIcon(slug, theme) {
    const c = theme.glow;
    const icons = {
        'anxiety-stress': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 28c4-8 8-12 12-12s8 4 12 12 8 12 12 12" stroke="${c}" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.5"/><path d="M4 24c6-10 12-14 16-14s10 4 16 14" stroke="${c}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.3"/><circle cx="24" cy="24" r="4" fill="${c}" fill-opacity="0.25"/></svg>`,
        'cognitive-performance': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6C14 6 6 14 6 24s8 18 18 18 18-8 18-18S34 6 24 6z" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.3"/><path d="M24 10c-2 4-6 6-10 6m10-6c2 4 6 6 10 6M24 38c-2-4-6-6-10-6m10 6c2-4 6-6 10-6" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/><circle cx="24" cy="24" r="6" fill="${c}" fill-opacity="0.2"/><circle cx="24" cy="24" r="2" fill="${c}" fill-opacity="0.5"/></svg>`,
        'cardiovascular': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 40s-14-8-14-18c0-6 4-10 8-10 3 0 5 2 6 4 1-2 3-4 6-4 4 0 8 4 8 10 0 10-14 18-14 18z" fill="${c}" fill-opacity="0.25" stroke="${c}" stroke-width="1.5"/><path d="M8 24h6l3-6 4 12 3-8 4 6h12" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/></svg>`,
        'immune-function': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4v8m0 24v8M4 24h8m24 0h8M10 10l6 6m12 12l6 6M38 10l-6 6M16 28l-6 6" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/><circle cx="24" cy="24" r="10" stroke="${c}" stroke-width="2" fill="${c}" fill-opacity="0.15"/><circle cx="24" cy="24" r="4" fill="${c}" fill-opacity="0.3"/></svg>`,
        'joint-health': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8c0 4 2 8 6 10m6-10c0 4-2 8-6 10m-6 10c0-4 2-8 6-10m6 10c0-4-2-8-6-10" stroke="${c}" stroke-width="1.5" opacity="0.4"/><circle cx="24" cy="18" r="5" stroke="${c}" stroke-width="2" fill="${c}" fill-opacity="0.2"/><circle cx="24" cy="30" r="5" stroke="${c}" stroke-width="2" fill="${c}" fill-opacity="0.2"/><circle cx="24" cy="24" r="3" fill="${c}" fill-opacity="0.4"/></svg>`,
        'metabolic-health': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6c-4 8-12 14-12 24a12 12 0 0024 0c0-10-8-16-12-24z" fill="${c}" fill-opacity="0.2" stroke="${c}" stroke-width="1.5"/><path d="M20 32c2-4 6-6 8-4" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>`,
        'energy-vitality': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28 4L14 26h10L18 44l18-24H26L28 4z" fill="${c}" fill-opacity="0.25" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
        'mood-support': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="12" fill="${c}" fill-opacity="0.2" stroke="${c}" stroke-width="1.5"/><path d="M24 4v4m0 32v4M4 24h4m32 0h4M10 10l3 3m22 22l3 3M38 10l-3 3M13 35l-3 3" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/></svg>`,
        'memory-aging': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="12" width="24" height="24" rx="4" stroke="${c}" stroke-width="1.5" fill="${c}" fill-opacity="0.1"/><path d="M18 18h4v4h-4zm8 0h4v4h-4zm-8 8h4v4h-4zm8 0h4v4h-4z" fill="${c}" fill-opacity="0.3"/><circle cx="24" cy="24" r="2" fill="${c}" fill-opacity="0.5"/></svg>`,
        'longevity': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6v36M18 6h12M18 42h12" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/><path d="M18 6c0 10 6 14 6 18s-6 8-6 18" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.4"/><path d="M30 6c0 10-6 14-6 18s6 8 6 18" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.4"/><circle cx="24" cy="24" r="3" fill="${c}" fill-opacity="0.3"/></svg>`,
        'brain-fog': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 32c-2 0-4-2-4-4s2-4 4-4c0-4 4-8 8-8 1 0 2 0 3 .5C24 12 28 8 32 8c6 0 10 4 10 10 0 1-.2 2-.4 3 2 1 3.4 3 3.4 5s-2 4-4 4H12z" fill="${c}" fill-opacity="0.2" stroke="${c}" stroke-width="1.5"/><path d="M20 38l2-4m4 4l2-4m4 4l2-4" stroke="${c}" stroke-width="1" stroke-linecap="round" opacity="0.3"/></svg>`,
        'stress-resilience': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 40l10-16 8 8 8-20 8 12 6-8" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.4"/><path d="M4 40h40" stroke="${c}" stroke-width="1.5" opacity="0.2"/></svg>`,
        'safety-interactions': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6L6 40h36L24 6z" stroke="${c}" stroke-width="2" fill="${c}" fill-opacity="0.15"/><path d="M24 18v12" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="34" r="1.5" fill="${c}"/></svg>`,
        'muscle-strength': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 20v8M12 16v16M16 20v8M32 20v8M36 16v16M40 20v8" stroke="${c}" stroke-width="2" stroke-linecap="round" opacity="0.4"/><rect x="16" y="22" width="16" height="4" rx="2" fill="${c}" fill-opacity="0.3"/></svg>`,
        'recovery': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 8v12l8 4" stroke="${c}" stroke-width="2" stroke-linecap="round" opacity="0.4"/><circle cx="24" cy="24" r="16" stroke="${c}" stroke-width="1.5" fill="none" opacity="0.3"/><path d="M36 12l-4 4m4-4h-4m4 0v4" stroke="${c}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/></svg>`,
        'womens-health': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="18" r="10" stroke="${c}" stroke-width="1.5" fill="${c}" fill-opacity="0.15"/><path d="M24 28v12M18 36h12" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
        'mens-health': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="28" r="10" stroke="${c}" stroke-width="1.5" fill="${c}" fill-opacity="0.15"/><path d="M28 20l10-10m0 0h-8m8 0v8" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        'gut-brain': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="12" r="6" stroke="${c}" stroke-width="1.5" fill="${c}" fill-opacity="0.15"/><circle cx="24" cy="36" r="6" stroke="${c}" stroke-width="1.5" fill="${c}" fill-opacity="0.15"/><path d="M24 18v12" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.4"/><path d="M20 12c-2 6-4 8-4 12s2 6 4 12m8-24c2 6 4 8 4 12s-2 6-4 12" stroke="${c}" stroke-width="1" opacity="0.25"/></svg>`,
        'nootropic-stacks': `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="28" width="28" height="8" rx="3" stroke="${c}" stroke-width="1.5" fill="${c}" fill-opacity="0.1"/><rect x="14" y="18" width="20" height="8" rx="3" stroke="${c}" stroke-width="1.5" fill="${c}" fill-opacity="0.2"/><rect x="18" y="8" width="12" height="8" rx="3" stroke="${c}" stroke-width="1.5" fill="${c}" fill-opacity="0.3"/></svg>`,
    };
    return icons[slug] || icons['cognitive-performance'];
}

// ─── Inline CSS Generator (dark journal theme per domain) ────────────────────
function generateGuideCSS(t) {
    return `
    <style>
        :root {
            --navy-deep: #0d1117;
            --navy: #161b22;
            --navy-light: #1c2333;
            --accent: ${t.accent};
            --accent-light: ${t.accentLight};
            --accent-glow: rgba(${t.accentRgb}, 0.15);
            --glow: ${t.glow};
            --blue-muted: #7c8db5;
            --slate: #8b949e;
            --text-primary: #c9d1d9;
            --text-bright: #f0f6fc;
            --text-muted: #8b949e;
            --border: rgba(${t.accentRgb}, 0.12);
            --card-bg: rgba(22, 27, 34, 0.7);
            --tier1-from: #4ade80;
            --tier1-to: #22c55e;
            --tier2-from: #fbbf24;
            --tier2-to: #f59e0b;
            --tier3-from: #fb7185;
            --tier3-to: #e11d48;
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--navy-deep);
            color: var(--text-primary);
            -webkit-font-smoothing: antialiased;
            line-height: 1.7;
        }

        h1, h2, h3, h4 { font-family: 'DM Serif Display', Georgia, serif; }

        .guide-nav {
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(13, 17, 23, 0.85);
            backdrop-filter: blur(20px) saturate(1.2);
            border-bottom: 1px solid var(--border);
        }

        .hero-section {
            background:
                radial-gradient(ellipse 80% 60% at 50% 0%, rgba(${t.accentRgb}, 0.18) 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 80% 20%, rgba(118, 75, 162, 0.12) 0%, transparent 50%),
                var(--navy-deep);
            position: relative;
            overflow: hidden;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
            pointer-events: none;
        }

        .domain-icon-glow {
            filter: drop-shadow(0 0 20px rgba(${t.glowRgb}, 0.3));
        }

        .tier-1-badge {
            background: linear-gradient(135deg, var(--tier1-from), var(--tier1-to));
            color: #052e16;
        }
        .tier-2-badge {
            background: linear-gradient(135deg, var(--tier2-from), var(--tier2-to));
            color: #451a03;
        }
        .tier-3-badge {
            background: linear-gradient(135deg, var(--tier3-from), var(--tier3-to));
            color: #fff;
        }

        .evidence-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            backdrop-filter: blur(8px);
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .evidence-card:hover {
            border-color: rgba(${t.accentRgb}, 0.3);
            box-shadow: 0 0 30px rgba(${t.accentRgb}, 0.06);
        }

        .cite-ref {
            color: var(--accent-light);
            font-size: 0.75rem;
            font-weight: 600;
            cursor: help;
            vertical-align: super;
            line-height: 0;
            transition: color 0.2s;
        }
        .cite-ref:hover { color: var(--glow); }

        .pmid-link {
            color: var(--blue-muted);
            font-size: 0.8rem;
            font-family: 'DM Sans', monospace;
            opacity: 0.8;
            transition: opacity 0.2s, color 0.2s;
            text-decoration: none;
        }
        .pmid-link:hover {
            opacity: 1;
            color: var(--glow);
            text-decoration: underline;
        }

        .summary-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
        }
        .summary-table thead th {
            background: var(--navy-light);
            color: var(--text-muted);
            font-family: 'DM Sans', sans-serif;
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            text-align: left;
        }
        .summary-table thead th:first-child { border-radius: 8px 0 0 0; }
        .summary-table thead th:last-child { border-radius: 0 8px 0 0; }
        .summary-table tbody td {
            padding: 14px 16px;
            border-bottom: 1px solid rgba(${t.accentRgb}, 0.06);
            font-size: 0.88rem;
            vertical-align: top;
        }
        .summary-table tbody tr { transition: background 0.2s; }
        .summary-table tbody tr:hover { background: rgba(${t.accentRgb}, 0.04); }
        .summary-table tbody tr:last-child td { border-bottom: none; }

        .interaction-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 0.85rem;
        }
        .interaction-table th {
            background: var(--navy-light);
            color: var(--text-muted);
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            padding: 10px 14px;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }
        .interaction-table th:first-child { border-radius: 8px 0 0 0; }
        .interaction-table th:last-child { border-radius: 0 8px 0 0; }
        .interaction-table td {
            padding: 10px 14px;
            border-bottom: 1px solid rgba(${t.accentRgb}, 0.06);
            vertical-align: top;
        }
        .interaction-table tbody tr:last-child td { border-bottom: none; }

        .risk-high { color: #f87171; font-weight: 600; }
        .risk-moderate { color: #fbbf24; font-weight: 600; }
        .risk-low { color: #4ade80; font-weight: 600; }

        .tier-divider {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .tier-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, var(--border), transparent);
        }

        .finding-highlight {
            border-left: 3px solid var(--accent-light);
            background: rgba(${t.accentRgb}, 0.05);
            padding: 12px 16px;
            border-radius: 0 8px 8px 0;
        }

        .mech-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 0.78rem;
            font-weight: 500;
            background: rgba(${t.accentRgb}, 0.08);
            border: 1px solid rgba(${t.accentRgb}, 0.15);
            color: var(--glow);
        }
        a.mech-pill { text-decoration: none; color: inherit; cursor: pointer; }
        a.mech-pill:hover { opacity: 0.8; }

        .capture-section {
            background:
                radial-gradient(ellipse 70% 80% at 30% 50%, rgba(${t.accentRgb}, 0.15) 0%, transparent 60%),
                radial-gradient(ellipse 50% 70% at 80% 40%, rgba(118, 75, 162, 0.12) 0%, transparent 50%),
                linear-gradient(135deg, #1a1040 0%, #0d1117 100%);
            border: 1px solid rgba(${t.accentRgb}, 0.2);
        }

        .citation-entry {
            font-size: 0.84rem;
            line-height: 1.6;
            padding: 8px 0;
            border-bottom: 1px solid rgba(${t.accentRgb}, 0.05);
            color: var(--text-muted);
        }
        .citation-entry:last-child { border-bottom: none; }
        .citation-entry .cite-num {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 26px;
            height: 22px;
            border-radius: 4px;
            background: rgba(${t.accentRgb}, 0.1);
            color: var(--accent-light);
            font-size: 0.7rem;
            font-weight: 700;
            margin-right: 10px;
            flex-shrink: 0;
            padding: 0 4px;
        }

        /* Citation tabs */
        .cite-tabs { display:flex; gap:0.25rem; flex-wrap:wrap; margin-bottom:1.5rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.75rem; }
        .cite-tab { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:var(--text-muted); padding:0.4rem 0.75rem; border-radius:6px; cursor:pointer; font-size:0.8rem; font-family:inherit; transition:all 0.15s; }
        .cite-tab:hover { background:rgba(255,255,255,0.08); color:var(--text-primary); }
        .cite-tab.active { background:rgba(${t.accentRgb},0.15); border-color:rgba(${t.accentRgb},0.3); color:var(--accent-light); }
        .cite-tab-count { font-size:0.7rem; background:rgba(255,255,255,0.06); padding:0.1rem 0.35rem; border-radius:8px; margin-left:0.25rem; }
        .cite-tab.active .cite-tab-count { background:rgba(${t.accentRgb},0.2); }

        /* Citation entry styling */
        .cite-tab-panel ol { margin: 0; }
        .citation-entry { padding: 0.35rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .citation-entry:last-child { border-bottom: none; }

        html { scroll-behavior: smooth; }

        @media (max-width: 768px) {
            .summary-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .summary-table { min-width: 700px; }
            .interaction-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .interaction-table { min-width: 600px; }
            .evidence-card { margin-left: -4px; margin-right: -4px; }
        }

        .reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.visible {
            opacity: 1;
            transform: translateY(0);
        }

        a:focus-visible, button:focus-visible, input:focus-visible {
            outline: 2px solid var(--accent-light);
            outline-offset: 2px;
        }

        @media print {
            .guide-nav, .capture-section, .no-print { display: none !important; }
            body { background: #fff; color: #111; }
            .evidence-card { border: 1px solid #ddd; background: #fff; }
        }
    </style>`;
}

/**
 * Get the most domain-relevant benefit for snippet list display.
 * Falls back to first available benefit if no domain match found.
 */
function getDomainBenefit(s, guideSlug) {
    const cog = s.primaryBenefits?.cognitive || [];
    const non = s.primaryBenefits?.nonCognitive || [];
    const all = [...non, ...cog]; // non-cognitive first for non-cognitive domains

    const keywords = DOMAIN_KEYWORDS[guideSlug] || [];
    if (keywords.length > 0) {
        // Search nonCognitive first for most domains, cognitive first for cognitive
        const cogDomains = ['cognitive-performance', 'memory-aging', 'brain-fog', 'nootropic-stacks'];
        const searchOrder = cogDomains.includes(guideSlug) ? [...cog, ...non] : [...non, ...cog];
        for (const benefit of searchOrder) {
            const lower = benefit.toLowerCase();
            if (keywords.some(kw => lower.includes(kw))) {
                return benefit;
            }
        }
    }

    // Fallback: for cognitive/energy guides prefer cognitive benefits, otherwise nonCognitive
    const cogFirstGuides = ['cognitive-performance', 'energy-vitality', 'memory-aging', 'brain-fog', 'nootropic-stacks'];
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

    const keywords = DOMAIN_KEYWORDS[guideSlug] || [];
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

    // Theme and navigation
    const theme = DOMAIN_THEMES[guide.slug] || DOMAIN_THEMES['nootropic-stacks'];
    const heroIcon = getDomainHeroIcon(guide.slug, theme.glow);

    const navLinks = [{ id: 'summary', label: 'Summary' }];
    if (tierCounts[1]) navLinks.push({ id: 'tier1', label: 'Tier 1' });
    if (tierCounts[2]) navLinks.push({ id: 'tier2', label: 'Tier 2' });
    if (tierCounts[3]) navLinks.push({ id: 'tier3', label: 'Tier 3' });
    navLinks.push({ id: 'safety', label: 'Safety' }, { id: 'citations', label: 'Citations' });

    // Group supplements by tier for structured display
    const tier1 = filtered.filter(s => s.evidenceTier === 1);
    const tier2 = filtered.filter(s => s.evidenceTier === 2);
    const tier3 = filtered.filter(s => s.evidenceTier === 3);

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

    // ── Build HTML (dark journal theme) ─────────────────────────────────────
    // Helper: build an evidence card for one supplement
    function buildEvidenceCard(s, idx, guideSlug) {
        const benefits = getDomainSortedBenefits(s, guideSlug);
        const mechanisms = getMechanismsList(s);
        const effects = getAnxietyEffects(s);
        const safetyRating = s.safetyProfile?.rating || '';
        const riskClass = safetyRating.toLowerCase().includes('high') ? 'risk-high'
            : safetyRating.toLowerCase().includes('moderate') ? 'risk-moderate' : 'risk-low';
        const delay = (idx * 0.08).toFixed(2);

        let card = `
            <div class="evidence-card p-6 sm:p-8 reveal" style="animation-delay: ${delay}s;">
                <div class="flex items-start justify-between mb-4 flex-wrap gap-3">
                    <div>
                        <h3 class="text-xl sm:text-2xl font-normal mb-1" style="color: var(--text-bright); font-family: 'DM Serif Display', serif;">
                            <a href="../supplements/${slugify(s.name)}.html" style="color: inherit; text-decoration: none;">${esc(s.name)}</a>
                        </h3>
                        <p class="text-xs" style="color: var(--slate); font-style: italic;">${esc(s.scientificName || '')}</p>
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0">
                        <span class="text-xs font-medium px-3 py-1 rounded-full" style="background: rgba(${theme.accentRgb}, 0.1); color: ${theme.glow};">
                            ${esc(s.dosageRange || 'See studies')}
                        </span>
                        ${tierBadgeHtml(s.evidenceTier)}
                    </div>
                </div>`;

        // Mechanism pills
        if (mechanisms.length > 0) {
            card += `
                <div class="flex flex-wrap gap-2 mb-5">`;
            mechanisms.slice(0, 4).forEach(m => {
                const mechLink = getMechanismLink(m);
                if (mechLink) {
                    card += `
                    <a href="${mechLink}" class="mech-pill" style="text-decoration:none; color:inherit;"><i class="fas fa-circle" style="font-size:4px; color: var(--accent-light);"></i> ${esc(m)}</a>`;
                } else {
                    card += `
                    <span class="mech-pill"><i class="fas fa-circle" style="font-size:4px; color: var(--accent-light);"></i> ${esc(m)}</span>`;
                }
            });
            card += `
                </div>`;
        }

        // Key findings / effect sizes
        if (effects.length > 0 || benefits.length > 0) {
            card += `
                <div class="space-y-3 mb-5">`;
            effects.slice(0, 3).forEach(e => {
                card += `
                    <div class="finding-highlight">
                        <p class="text-xs font-semibold uppercase tracking-wider mb-1" style="color: var(--accent-light);">${esc(e.domain)}</p>
                        <p class="text-sm" style="color: var(--text-primary);">${esc(e.description)}</p>
                    </div>`;
            });
            // If no effect sizes, show top benefits
            if (effects.length === 0) {
                benefits.slice(0, 2).forEach(b => {
                    card += `
                    <div class="finding-highlight">
                        <p class="text-xs font-semibold uppercase tracking-wider mb-1" style="color: var(--accent-light);">Key Benefit</p>
                        <p class="text-sm" style="color: var(--text-primary);">${esc(b)}</p>
                    </div>`;
                });
            }
            card += `
                </div>`;
        }

        // Safety box
        if (safetyRating) {
            const sideEffects = (s.safetyProfile?.commonSideEffects || []).slice(0, 3).join(', ');
            card += `
                <div class="mt-4 p-3 rounded-lg" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);">
                    <p class="text-xs font-semibold uppercase tracking-wider mb-1" style="color: var(--text-muted);">Safety Profile</p>
                    <p class="text-sm" style="color: var(--text-primary);">
                        <span class="${riskClass}">●</span> ${esc(safetyRating)}${sideEffects ? '. Common: ' + esc(sideEffects) : ''}
                    </p>
                </div>`;
        }

        card += `
            </div>`;
        return card;
    }

    // Helper: build a tier section
    function buildTierSection(tierNum, supplements, guideSlug) {
        if (supplements.length === 0) return '';
        const tierLabels = { 1: 'Strong Evidence', 2: 'Moderate Evidence', 3: 'Preliminary Evidence' };
        let section = `
        <section id="tier${tierNum}" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
            <div class="tier-divider mb-8">
                ${tierBadgeHtml(tierNum)}
                <h2 class="text-xl sm:text-2xl" style="color: var(--text-bright); white-space: nowrap;">
                    Tier ${tierNum} &mdash; ${tierLabels[tierNum]}
                </h2>
            </div>
            <div class="space-y-6">`;
        supplements.forEach((s, i) => {
            section += buildEvidenceCard(s, i, guideSlug);
        });
        section += `
            </div>
        </section>`;
        return section;
    }

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
    <link rel="stylesheet" href="../css/content-gate.css?v=${Date.now()}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Auth: Clerk + Convex env injection (substituted by docker-entrypoint.sh / vercel-build.js) -->
    <meta name="clerk-key" content="__CLERK_PUBLISHABLE_KEY__">
    <meta name="convex-url" content="__CONVEX_URL__">
    <script src="https://unpkg.com/@clerk/clerk-js@latest/dist/clerk.browser.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/convex@latest/dist/browser/index.global.js" crossorigin="anonymous"></script>

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

    ${generateGuideCSS(theme)}
</head>
<body data-theme="dark">

<!-- Sticky Navigation -->
<nav class="guide-nav">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <a href="../index.html" class="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <i class="fas fa-arrow-left text-xs"></i>
            <span class="hidden sm:inline">Back to Database</span>
            <span class="sm:hidden">Back</span>
        </a>
        <div class="flex items-center gap-1">
            <i class="fas fa-pills text-sm" style="color: ${theme.accentLight};"></i>
            <span class="text-sm font-semibold text-gray-300">SupplementDB</span>
        </div>
        <button id="mobile-nav-toggle" class="md:hidden text-gray-400 hover:text-white transition-colors p-1">
            <i class="fas fa-bars text-sm"></i>
        </button>
        <div class="hidden md:flex items-center gap-5 text-xs font-medium text-gray-500">
            ${navLinks.map(l => `<a href="#${l.id}" class="hover:text-gray-300 transition-colors">${l.label}</a>`).join('\n            ')}
            <div id="auth-buttons"></div>
        </div>
    </div>
</nav>

<!-- Mobile navigation dropdown -->
<div id="mobile-nav-menu" class="hidden" style="position: fixed; top: 56px; left: 0; right: 0; z-index: 40; background: #0d1117; border-bottom: 1px solid rgba(255,255,255,0.05);">
    <div class="flex flex-col px-4 py-3 gap-1">
        ${navLinks.map(l => `<a href="#${l.id}" class="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2 border-b border-white/5">${l.label}</a>`).join('\n        ')}
    </div>
</div>

<!-- Hero Section -->
<header class="hero-section pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 text-center relative">
    <div class="max-w-3xl mx-auto relative z-10">
        <!-- Domain icon -->
        <div class="domain-icon-glow mb-6 inline-block">
            ${heroIcon}
        </div>

        <!-- Review badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style="background: rgba(${theme.accentRgb}, 0.12); color: ${theme.glow}; border: 1px solid rgba(${theme.accentRgb}, 0.2);">
            <i class="fas fa-clock text-xs" style="color: ${theme.accentLight}; font-size: 0.65rem;"></i>
            Last reviewed: ${today}
        </div>

        <h1 class="text-3xl sm:text-5xl font-normal mb-4 leading-tight" style="color: var(--text-bright);">
            ${esc(guide.title)}
        </h1>

        <p class="text-base sm:text-lg mb-8" style="color: var(--blue-muted); max-width: 520px; margin: 0 auto;">
            A systematic review of ${filtered.length} supplements across ${totalCitations}+ research citations, ranked by evidence strength.
        </p>

        <p class="text-xs px-4 py-2 rounded-lg inline-block" style="color: var(--text-muted); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
            <i class="fas fa-info-circle mr-1 opacity-60"></i>
            This guide summarizes published research. It does not constitute medical advice.
            <a href="../legal/disclaimer.html" style="color: ${theme.glow}; text-decoration: underline; opacity: 0.7;">Full disclaimer</a>.
        </p>
    </div>
</header>

<!-- Share Bar -->
<div class="share-bar dark-theme" style="background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06);">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <span class="share-bar-label" style="color: var(--text-muted);">Share this guide</span>
        <div class="share-bar-buttons">
            <button class="share-btn" data-share="twitter" style="border-color: rgba(255,255,255,0.1); color: var(--text-muted);"><i class="fa-brands fa-x-twitter"></i> Twitter</button>
            <button class="share-btn" data-share="linkedin" style="border-color: rgba(255,255,255,0.1); color: var(--text-muted);"><i class="fa-brands fa-linkedin"></i> LinkedIn</button>
            <button class="share-btn" data-share="facebook" style="border-color: rgba(255,255,255,0.1); color: var(--text-muted);"><i class="fa-brands fa-facebook"></i> Facebook</button>
            <button class="share-btn share-btn-copy" data-share="copy" style="border-color: rgba(255,255,255,0.1); color: var(--text-muted);"><i class="fas fa-link"></i> Copy Link</button>
        </div>
    </div>
</div>

<!-- Trust Signal Bar -->
<div class="trust-bar dark-theme" style="max-width:64rem;margin:1.5rem auto;">
    <span class="trust-bar-item"><i class="fas fa-check-circle"></i> ${totalCitations}+ Verified Citations</span>
    <span class="trust-bar-divider"></span>
    <span class="trust-bar-item"><i class="fas fa-shield-alt"></i> FDA-Compliant Language</span>
    <span class="trust-bar-divider"></span>
    <span class="trust-bar-item"><i class="fas fa-ban"></i> No Industry Funding</span>
    <span class="trust-bar-divider"></span>
    <span class="trust-bar-item"><i class="fas fa-flask"></i> <a href="../methodology.html">Our Methodology</a></span>
</div>

<!-- Main content wrapper for content gating -->
<main>
`;

    // ── Evidence Summary Table ────────────────────────────────────────────
    html += `
<section id="summary" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <div class="evidence-card p-6">
        <h2 class="text-xl sm:text-2xl mb-6" style="color: var(--text-bright);">Quick Evidence Summary</h2>
        <div class="summary-table-wrap">
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Supplement</th>
                        <th>Tier</th>
                        <th>Key Mechanism</th>
                        <th>Primary Finding</th>
                        <th>Dosage</th>
                    </tr>
                </thead>
                <tbody>`;
    const GATE_CUTOFF_AFTER_ROW = 3; // Show 3 rows before content gate cuts off
    filtered.forEach((s, idx) => {
        const topBenefit = getDomainBenefit(s, guide.slug);
        const topMech = getMechanismsList(s)[0] || '—';
        const mechSummaryLink = getMechanismLink(topMech);
        const mechTdContent = mechSummaryLink
            ? `<a href="${mechSummaryLink}" style="color: inherit; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 3px;">${esc(topMech)}</a>`
            : esc(topMech);
        html += `
                    <tr>
                        <td><strong><a href="../supplements/${slugify(s.name)}.html" style="color: var(--glow); text-decoration: none;">${esc(s.name)}</a></strong></td>
                        <td>${tierBadgeHtml(s.evidenceTier)}</td>
                        <td style="font-size:0.82rem; color: var(--text-muted);">${mechTdContent}</td>
                        <td style="font-size:0.82rem;">${esc(topBenefit)}</td>
                        <td style="font-size:0.82rem; color: var(--text-muted);">${esc(s.dosageRange || '—')}</td>
                    </tr>`;
        // Insert invisible gate cutoff marker after the Nth row
        if (idx === GATE_CUTOFF_AFTER_ROW - 1) {
            html += `
                    <tr data-gate-cutoff aria-hidden="true" style="height:0;border:none;padding:0;margin:0;"><td colspan="5" style="height:0;border:none;padding:0;margin:0;"></td></tr>`;
        }
    });
    html += `
                </tbody>
            </table>
        </div>
    </div>
</section>`;

    // ── Introduction ──────────────────────────────────────────────────────
    html += `
<section id="introduction" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="text-2xl sm:text-3xl mb-6" style="color: var(--text-bright);">Introduction</h2>
    ${guide.introduction.split('\n\n').map(p => `<p class="mb-4" style="color: var(--text-primary);">${p.trim()}</p>`).join('\n    ')}

    <!-- Featured Snippet -->
    <div class="evidence-card p-5 mt-6" style="border-left: 3px solid var(--accent-light);">
        <p class="text-sm" style="color: var(--text-primary);"><strong style="color: var(--text-bright);">${esc(guide.shortTitle)} supplements</strong> ${guide.snippetDefinition}</p>
    </div>

    <!-- Top supplement ranking -->
    <div class="mt-8">
        <h3 class="text-lg mb-4" style="color: var(--text-bright);">${esc(guide.snippetListTitle)}</h3>
        <ol class="space-y-2 pl-5" style="list-style-type: decimal; color: var(--text-primary);">`;
    core.forEach(s => {
        const topBenefit = getDomainBenefit(s, guide.slug);
        html += `
            <li class="text-sm"><a href="../supplements/${slugify(s.name)}.html" style="color: var(--glow); text-decoration: none; font-weight: 700;">${esc(s.name)}</a> ${tierBadgeHtml(s.evidenceTier)} &mdash; ${esc(topBenefit)} (${esc(s.dosageRange || 'Dosage varies')})</li>`;
    });
    html += `
        </ol>
    </div>
</section>`;

    // -- Split Point: Premium content starts here --
    html += `\n<!-- PREMIUM_CONTENT_START -->`;

    // ── Tier-Grouped Evidence Cards ──────────────────────────────────────
    html += `
<div id="top-supplements">`;
    html += buildTierSection(1, tier1, guide.slug);
    html += buildTierSection(2, tier2, guide.slug);
    html += buildTierSection(3, tier3, guide.slug);
    html += `
</div>`;

    // ── Mechanisms of Action ─────────────────────────────────────────────
    html += `
<section id="mechanisms" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="text-2xl sm:text-3xl mb-6" style="color: var(--text-bright);">Mechanisms of Action</h2>
    <p class="mb-6" style="color: var(--text-primary);">${guide.mechanismsIntro}</p>`;
    guide.mechanisms.forEach(m => {
        html += `
    <div class="evidence-card p-5 mb-4">
        <h3 class="text-lg mb-2" style="color: var(--text-bright);">${esc(m.name)}</h3>
        <p class="text-sm mb-3" style="color: var(--text-primary);">${m.description}</p>
        <p class="text-xs" style="color: var(--text-muted);"><strong>Key supplements:</strong> ${m.supplements.map(n => `<a href="../supplements/${slugify(n)}.html" style="color: var(--glow); text-decoration: none;">${esc(n)}</a>`).join(', ')}</p>
    </div>`;
    });
    html += `
</section>`;

    // ── Dosage Guidelines ────────────────────────────────────────────────
    html += `
<section id="dosage-guidelines" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="text-2xl sm:text-3xl mb-6" style="color: var(--text-bright);">Dosage Guidelines</h2>
    <p class="mb-6" style="color: var(--text-primary);">The following dosage ranges reflect those used in published clinical trials. Individual needs may vary. Always start with the lower end and titrate upward as tolerated.</p>
    <div class="evidence-card p-6">
        <div class="summary-table-wrap">
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Supplement</th>
                        <th>Clinical Dosage Range</th>
                        <th>Evidence Tier</th>
                        <th>Safety Rating</th>
                    </tr>
                </thead>
                <tbody>`;
    core.forEach(s => {
        html += `
                    <tr>
                        <td><strong><a href="../supplements/${slugify(s.name)}.html" style="color: var(--glow); text-decoration: none;">${esc(s.name)}</a></strong></td>
                        <td>${esc(s.dosageRange || '—')}</td>
                        <td>${tierBadgeHtml(s.evidenceTier)}</td>
                        <td>${esc(s.safetyProfile?.rating || '—')}</td>
                    </tr>`;
    });
    html += `
                </tbody>
            </table>
        </div>
    </div>
    <div class="mt-4 p-4 rounded-lg" style="background: rgba(251, 191, 36, 0.06); border: 1px solid rgba(251, 191, 36, 0.15);">
        <p class="text-sm" style="color: var(--text-primary);"><i class="fas fa-exclamation-triangle mr-2" style="color: #fbbf24;"></i><strong>Note:</strong> Dosage ranges are derived from clinical trial protocols and may not account for individual variation. Consult a healthcare provider for personalized dosing.</p>
    </div>
</section>`;

    // ── Safety & Interactions ────────────────────────────────────────────
    html += `
<section id="safety" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="text-2xl sm:text-3xl mb-6" style="color: var(--text-bright);">Safety &amp; Interactions</h2>
    <p class="mb-4" style="color: var(--text-primary);">${guide.safetyIntro}</p>
    <ul class="space-y-2 mb-8 pl-5" style="list-style-type: disc; color: var(--text-primary);">`;
    guide.safetyNotes.forEach(note => {
        html += `
        <li class="text-sm">${note}</li>`;
    });
    html += `
    </ul>

    <h3 class="text-lg mb-4" style="color: var(--text-bright);">Individual Supplement Safety Profiles</h3>
    <div class="evidence-card p-6">
        <div class="interaction-table-wrap">
            <table class="interaction-table">
                <thead>
                    <tr>
                        <th>Supplement</th>
                        <th>Common Side Effects</th>
                        <th>Key Drug Interactions</th>
                        <th>Safety Rating</th>
                    </tr>
                </thead>
                <tbody>`;
    core.forEach(s => {
        const sideEffects = (s.safetyProfile?.commonSideEffects || []).slice(0, 3).join(', ') || '—';
        const interactions = (s.safetyProfile?.drugInteractions || []).slice(0, 3).join(', ') || '—';
        const rating = s.safetyProfile?.rating || '—';
        const riskClass = rating.toLowerCase().includes('high') ? 'risk-high'
            : rating.toLowerCase().includes('moderate') ? 'risk-moderate' : 'risk-low';
        html += `
                    <tr>
                        <td><strong>${esc(s.name)}</strong></td>
                        <td>${esc(sideEffects)}</td>
                        <td>${esc(interactions)}</td>
                        <td><span class="${riskClass}">${esc(rating)}</span></td>
                    </tr>`;
    });
    html += `
                </tbody>
            </table>
        </div>
    </div>
</section>`;

    // ── Research Gaps ────────────────────────────────────────────────────
    html += `
<section id="research-gaps" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="text-2xl sm:text-3xl mb-6" style="color: var(--text-bright);">Research Gaps &amp; Limitations</h2>
    <p class="mb-4" style="color: var(--text-primary);">While the evidence base for ${guide.shortTitle.toLowerCase()} supplements continues to grow, several important gaps remain:</p>
    <ul class="space-y-2 pl-5" style="list-style-type: disc; color: var(--text-primary);">`;
    guide.researchGaps.forEach(gap => {
        html += `
        <li class="text-sm">${esc(gap)}</li>`;
    });
    html += `
    </ul>
</section>`;

    // ── Additional Supporting Supplements ────────────────────────────────
    if (supporting.length > 0) {
        html += `
<section id="additional" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="text-2xl sm:text-3xl mb-6" style="color: var(--text-bright);">Additional Supplements</h2>
    <p class="mb-6" style="color: var(--text-primary);">The following ${supporting.length} supplements show some evidence related to ${guide.shortTitle.toLowerCase()} but are not among the primary recommendations.</p>
    <div class="evidence-card p-6">
        <div class="summary-table-wrap">
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Supplement</th>
                        <th>Evidence</th>
                        <th>Category</th>
                        <th>Relevant Benefit</th>
                    </tr>
                </thead>
                <tbody>`;
        supporting.forEach(s => {
            const topBenefit = getDomainBenefit(s, guide.slug);
            html += `
                    <tr>
                        <td><a href="../supplements/${slugify(s.name)}.html" style="color: var(--glow); text-decoration: none;">${esc(s.name)}</a></td>
                        <td>${tierBadgeHtml(s.evidenceTier)}</td>
                        <td style="color: var(--text-muted);">${esc(normalizeCategory(s.category))}</td>
                        <td style="font-size:0.85rem">${esc(topBenefit)}</td>
                    </tr>`;
        });
        html += `
                </tbody>
            </table>
        </div>
    </div>
</section>`;
    }

    // ── Citations (Tabbed by Supplement) ────────────────────────────────
    // Build per-supplement citation groups for tabbed display
    const citationGroups = filtered
        .map(s => ({
            name: s.name,
            citations: (s.keyCitations || [])
        }))
        .filter(g => g.citations.length > 0);

    html += `
<section id="citations" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="text-2xl sm:text-3xl mb-6" style="color: var(--text-bright);">Citation Index</h2>

    <div class="evidence-card p-6 sm:p-8">
        <p class="text-sm mb-4" style="color: var(--text-muted);">
            All citations verified against PubMed. PMID links resolve to PubMed; DOI links resolve to the publisher. Grouped by supplement.
        </p>

        <div class="cite-tabs">
            <button class="cite-tab active" data-tab="all" onclick="showAllCitations()">All <span class="cite-tab-count">${totalCitations}</span></button>`;

    citationGroups.forEach(g => {
        html += `
                <button class="cite-tab" data-tab="${esc(g.name)}" onclick="switchCiteTab('${esc(g.name)}')">${esc(g.name)} <span class="cite-tab-count">${g.citations.length}</span></button>`;
    });

    html += `
        </div>

        <div class="cite-tab-panel" id="cite-panel-all">
            <ol class="space-y-1" style="list-style:none;padding:0;">`;

    // "All" panel — every citation with supplement badge
    let citNum = 1;
    citationGroups.forEach(g => {
        g.citations.forEach(c => {
            const pmid = c.pmid ? `
                <a href="https://pubmed.ncbi.nlm.nih.gov/${esc(String(c.pmid))}" target="_blank" rel="noopener" class="pmid-link">PMID: ${esc(String(c.pmid))}</a>` : '';
            const doi = c.doi ? `${pmid ? ' · ' : ''}
                <a href="https://doi.org/${esc(c.doi)}" target="_blank" rel="noopener" class="pmid-link">DOI</a>` : '';
            html += `
            <li class="citation-entry flex">
                <span class="cite-num">${citNum}</span>
                <span>${esc(c.authors || '')}. ${esc(c.title || '')}. <em>${esc(c.journal || '')}</em>, ${esc(String(c.year || ''))}.
                ${pmid}${doi}<span class="text-xs px-1.5 py-0.5 rounded" style="background:rgba(${theme.accentRgb},0.1);color:var(--accent-light);margin-left:0.5rem;">${esc(g.name)}</span></span>
            </li>`;
            citNum++;
        });
    });

    html += `
            </ol>
        </div>`;

    // Per-supplement panels
    citationGroups.forEach(g => {
        html += `
        <div class="cite-tab-panel" id="cite-panel-${esc(g.name)}" style="display:none;">
            <ol class="space-y-1" style="list-style:none;padding:0;">`;
        let suppCitNum = 1;
        g.citations.forEach(c => {
            const pmid = c.pmid ? `
                    <a href="https://pubmed.ncbi.nlm.nih.gov/${esc(String(c.pmid))}" target="_blank" rel="noopener" class="pmid-link">PMID: ${esc(String(c.pmid))}</a>` : '';
            const doi = c.doi ? `${pmid ? ' · ' : ''}
                    <a href="https://doi.org/${esc(c.doi)}" target="_blank" rel="noopener" class="pmid-link">DOI</a>` : '';
            html += `
            <li class="citation-entry flex">
                    <span class="cite-num">${suppCitNum}</span>
                    <span>${esc(c.authors || '')}. ${esc(c.title || '')}. <em>${esc(c.journal || '')}</em>, ${esc(String(c.year || ''))}.
                    ${pmid}${doi}</span>
                </li>`;
            suppCitNum++;
        });
        html += `
            </ol>
        </div>`;
    });

    html += `
    </div>
</section>`;

    // ── Email Capture ────────────────────────────────────────────────────
    html += `
<section class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <div class="capture-section rounded-xl p-8 sm:p-12 text-center">
        <h3 class="text-2xl mb-3" style="color: var(--text-bright);">
            <i class="fas fa-envelope-open-text mr-2" style="color: ${theme.accentLight};"></i>
            Get ${esc(guide.shortTitle)} Research Updates
        </h3>
        <p class="mb-6 text-sm" style="color: var(--text-muted); max-width: 440px; margin: 0 auto 1.5rem;">
            Stay informed when new studies are published or evidence tiers are updated for these supplements.
        </p>
        <div id="guide-newsletter-container">
            <form id="guide-newsletter-form" class="newsletter-form flex gap-3 max-w-md mx-auto flex-wrap justify-center">
                <input type="email" id="guide-newsletter-email" placeholder="your@email.com" required
                    class="flex-1 min-w-0 px-4 py-2.5 rounded-lg text-sm"
                    style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--text-bright); outline: none;">
                <button type="submit" class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style="background: ${theme.accent};"><i class="fas fa-paper-plane mr-1"></i> Subscribe</button>
            </form>
            <p id="guide-newsletter-message" class="newsletter-message" style="display:none; color: var(--text-bright);"></p>
        </div>
        <p class="text-xs mt-4" style="color: var(--text-muted); opacity: 0.6;"><i class="fas fa-lock mr-1"></i> No spam. <a href="../legal/privacy.html" style="color: var(--glow); opacity: 0.7;">Privacy Policy</a></p>
    </div>
</section>`;

    // ── Related Content ──────────────────────────────────────────────────
    html += `
<section class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <div class="related-content evidence-card p-6">
        <h3 class="text-lg mb-4" style="color: var(--text-bright);">Related Resources</h3>
        <div class="related-content-grid grid grid-cols-1 sm:grid-cols-2 gap-3">`;
    guide.relatedLinks.forEach(link => {
        html += `
            <a href="${link.href}" class="flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-colors" style="color: var(--glow); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
                <i class="fas ${link.icon}" style="color: ${theme.accentLight}; width: 16px; text-align: center;"></i> ${esc(link.text)}
            </a>`;
    });
    html += `
        </div>
    </div>
</section>

</main>

<!-- Footer -->
<footer class="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t" style="border-color: var(--border);">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4 flex-wrap">
            <a href="../index.html" class="flex items-center gap-2 text-sm font-medium transition-colors" style="color: var(--blue-muted);">
                <i class="fas fa-pills" style="color: ${theme.accentLight};"></i>
                <span>Return to Supplement Database</span>
            </a>
            <a href="../methodology.html" class="flex items-center gap-2 text-sm font-medium transition-colors" style="color: var(--blue-muted);">
                <i class="fas fa-flask"></i>
                <span>Research Methodology</span>
            </a>
        </div>
        <p class="text-xs text-center sm:text-right" style="color: var(--text-muted); max-width: 400px;">
            This guide is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional.
        </p>
    </div>
    <div class="text-center mt-8">
        <p class="text-xs" style="color: rgba(139, 148, 158, 0.5);">
            &copy; 2025&ndash;2026 SupplementDB. Evidence-Based Supplement Database.
        </p>
    </div>
</footer>

<!-- Scripts -->
<script>
// Scroll reveal animation
document.addEventListener('DOMContentLoaded', function() {
    var reveals = document.querySelectorAll('.reveal');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.01, rootMargin: '200px 0px 200px 0px' });
    reveals.forEach(function(el) { observer.observe(el); });

    // Fallback: reveal all sections after 2s to prevent content-gate or
    // large-page IntersectionObserver failures leaving sections invisible
    setTimeout(function() {
        reveals.forEach(function(el) {
            if (!el.classList.contains('visible')) {
                el.classList.add('visible');
            }
        });
    }, 2000);
});

// Smooth scroll for anchor links with nav offset
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            var navHeight = document.querySelector('.guide-nav').offsetHeight;
            var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// PostHog custom event tracking
(function() {
    if (typeof posthog === 'undefined') return;

    posthog.capture('guide_viewed', {
        guide_slug: '${guide.slug}',
        guide_title: '${esc(guide.title).replace(/'/g, "\\'")}',
        supplement_count: ${filtered.length},
        citation_count: ${totalCitations},
        tier1_count: ${tierCounts[1] || 0},
        tier2_count: ${tierCounts[2] || 0},
        tier3_count: ${tierCounts[3] || 0}
    });

    var sectionsMeta = {
        'summary': { name: 'Quick Evidence Summary', depth: 'top' },
        'tier1': { name: 'Tier 1: Strong Evidence', depth: 'upper' },
        'tier2': { name: 'Tier 2: Moderate Evidence', depth: 'middle' },
        'tier3': { name: 'Tier 3: Preliminary Evidence', depth: 'lower' },
        'safety': { name: 'Safety Considerations', depth: 'deep' },
        'citations': { name: 'Citation Index', depth: 'bottom' }
    };

    var trackedSections = {};
    var sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !trackedSections[entry.target.id]) {
                trackedSections[entry.target.id] = true;
                var meta = sectionsMeta[entry.target.id];
                if (meta) {
                    posthog.capture('guide_section_viewed', {
                        guide_slug: '${guide.slug}',
                        section_id: entry.target.id,
                        section_name: meta.name,
                        scroll_depth: meta.depth
                    });
                }
            }
        });
    }, { threshold: 0.2 });

    Object.keys(sectionsMeta).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });

    document.querySelectorAll('.pmid-link').forEach(function(link) {
        link.addEventListener('click', function() {
            var href = this.getAttribute('href') || '';
            posthog.capture('guide_citation_clicked', {
                guide_slug: '${guide.slug}',
                citation_type: href.includes('pubmed') ? 'pmid' : (href.includes('doi.org') ? 'doi' : 'other'),
                citation_url: href,
                citation_text: this.textContent.trim()
            });
        });
    });

    document.querySelectorAll('.guide-nav a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function() {
            posthog.capture('guide_nav_clicked', {
                guide_slug: '${guide.slug}',
                nav_target: this.getAttribute('href')
            });
        });
    });

    var elapsed = 0;
    var timeThresholds = [30, 60, 120, 300];
    var timeIndex = 0;
    var timerCheck = setInterval(function() {
        elapsed++;
        if (timeIndex < timeThresholds.length && elapsed >= timeThresholds[timeIndex]) {
            posthog.capture('guide_time_on_page', {
                guide_slug: '${guide.slug}',
                seconds: timeThresholds[timeIndex]
            });
            timeIndex++;
        }
        if (timeIndex >= timeThresholds.length) clearInterval(timerCheck);
    }, 1000);
})();

// Mobile nav toggle
document.getElementById('mobile-nav-toggle').addEventListener('click', function() {
    var menu = document.getElementById('mobile-nav-menu');
    menu.classList.toggle('hidden');
    this.querySelector('i').classList.toggle('fa-bars');
    this.querySelector('i').classList.toggle('fa-times');
});
document.querySelectorAll('#mobile-nav-menu a').forEach(function(link) {
    link.addEventListener('click', function() {
        document.getElementById('mobile-nav-menu').classList.add('hidden');
        var btn = document.getElementById('mobile-nav-toggle');
        btn.querySelector('i').classList.add('fa-bars');
        btn.querySelector('i').classList.remove('fa-times');
    });
});
</script>

<script src="../js/share-bar.js"></script>
<script src="../js/newsletter.js"></script>
<script>SupplementDBNewsletter.init("guide-newsletter-form", "guide-newsletter-email", "guide-newsletter-message", "guide-${guide.slug}");</script>

<!-- Citation Tab Switching -->
<script>
    function switchCiteTab(tabName) {
        document.querySelectorAll('.cite-tab').forEach(function(t) { t.classList.remove('active'); });
        document.querySelectorAll('.cite-tab-panel').forEach(function(p) { p.style.display = 'none'; });
        var tab = document.querySelector('.cite-tab[data-tab="' + tabName + '"]');
        if (tab) tab.classList.add('active');
        var panel = document.getElementById('cite-panel-' + tabName);
        if (panel) panel.style.display = '';
    }
    function showAllCitations() {
        document.querySelectorAll('.cite-tab').forEach(function(t) { t.classList.remove('active'); });
        document.querySelectorAll('.cite-tab-panel').forEach(function(p) { p.style.display = 'none'; });
        var tab = document.querySelector('.cite-tab[data-tab="all"]');
        if (tab) tab.classList.add('active');
        var panel = document.getElementById('cite-panel-all');
        if (panel) panel.style.display = '';
    }
</script>

<!-- PREMIUM_CONTENT_END -->
<!-- Auth & Content Gate -->
<script src="../js/auth.js"></script>
<script src="../js/convex-client.js"></script>
<script src="../js/rbac.js"></script>
<script src="../js/auth-ui.js"></script>
<script src="../js/content-gate.js"></script>
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
    if (!fs.existsSync(PREMIUM_CHUNKS_DIR)) fs.mkdirSync(PREMIUM_CHUNKS_DIR, { recursive: true });

    const version = new Date().toISOString().slice(0, 10);
    const generatedAt = new Date().toISOString();
    let splitCount = 0;

    GUIDES.forEach(guide => {
        const html = generateGuidePage(guide, db.supplements);
        const filtered = db.supplements.filter(guide.filterFn);

        const startMarker = '<!-- PREMIUM_CONTENT_START -->';
        const endMarker = '<!-- PREMIUM_CONTENT_END -->';
        const startIdx = html.indexOf(startMarker);
        const endIdx = html.indexOf(endMarker);

        if (startIdx === -1 || endIdx === -1) {
            // Fallback: write full HTML if markers not found
            console.warn(`⚠ ${guide.slug}: split markers not found, writing full HTML`);
            const outPath = path.join(outDir, `${guide.slug}.html`);
            fs.writeFileSync(outPath, html, 'utf8');
            return;
        }

        // Extract premium content (between markers)
        const premiumHtml = html.slice(startIdx + startMarker.length, endIdx);

        // Build teaser HTML: before marker + placeholder + after marker
        const beforeMarker = html.slice(0, startIdx);
        const afterMarker = html.slice(endIdx + endMarker.length);
        const placeholder = `\n<div id="premium-content" data-guide="${guide.slug}"></div>\n`;
        const teaserHtml = beforeMarker + placeholder + afterMarker;

        // Write teaser HTML
        const teaserPath = path.join(outDir, `${guide.slug}.html`);
        fs.writeFileSync(teaserPath, teaserHtml, 'utf8');

        // Write premium JSON chunk
        const premiumJson = {
            slug: guide.slug,
            htmlContent: premiumHtml,
            generatedAt,
            version,
        };
        const chunkPath = path.join(PREMIUM_CHUNKS_DIR, `${guide.slug}.json`);
        fs.writeFileSync(chunkPath, JSON.stringify(premiumJson, null, 2), 'utf8');

        const teaserKb = (Buffer.byteLength(teaserHtml, 'utf8') / 1024).toFixed(1);
        const premiumKb = (Buffer.byteLength(premiumHtml, 'utf8') / 1024).toFixed(1);
        console.log(`✓ [SPLIT] ${guide.slug}.html — teaser: ${teaserKb}KB, premium: ${premiumKb}KB (${filtered.length} supplements)`);
        splitCount++;
    });

    console.log(`\nDone — ${GUIDES.length} guide pages generated (${splitCount} split into teaser + premium).`);
}

// Export for audit tooling — only run main() when executed directly
if (require.main === module) {
    main();
} else {
    module.exports = { GUIDES, DOMAIN_KEYWORDS, DOMAIN_THEMES };
}
