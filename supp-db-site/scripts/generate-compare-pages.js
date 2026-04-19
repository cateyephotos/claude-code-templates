#!/usr/bin/env node
/**
 * generate-compare-pages.js
 * Auto-generates head-to-head supplement comparison pages from supplements.js data.
 * Phase 2, Steps 9-12 of the SupplementDB content plan.
 */

const fs = require('fs');
const path = require('path');
const { loadSupplementData, normalizeCategory, slugify, getTierLabel, getTierColor } = require('./parse-data');

const db = loadSupplementData();
if (!db) { console.error('Failed to load supplement data'); process.exit(1); }

const TODAY = new Date().toISOString().split('T')[0];
const SITE_URL = 'https://supplementdb.info';
const POSTHOG_KEY = 'phc_esUgVXZLrnPplrCmbAQ8RlYbHuXS38hewwGHnLqtMF7';
const OUTPUT_DIR = path.join(__dirname, '..', 'compare');

// ── HTML Helpers ──────────────────────────────────────────────────────────

function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tierBadgeHtml(tier) {
    const label = getTierLabel(tier);
    const color = getTierColor(tier);
    return `<span class="tier-badge" style="background:${color};color:#fff;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:600;white-space:nowrap;">Tier ${tier}: ${label}</span>`;
}

function findSupplement(name) {
    return db.supplements.find(s => s.name === name) || null;
}

// ── Comparison Definitions ────────────────────────────────────────────────

const COMPARISONS = [
    {
        slug: 'ashwagandha-vs-rhodiola',
        suppA: 'Ashwagandha',
        suppB: 'Rhodiola rosea',
        title: 'Ashwagandha vs Rhodiola Rosea: Evidence-Based Comparison',
        metaTitle: 'Ashwagandha vs Rhodiola (2026) | Which Adaptogen Is Better?',
        metaDescription: 'Evidence-based comparison of Ashwagandha vs Rhodiola Rosea for stress, anxiety, and cognitive performance. Compare dosages, benefits, side effects, and which adaptogen is right for you.',
        domain: 'Stress & Adaptogenic Support',
        sharedDomains: ['stress', 'anxiety', 'fatigue', 'cognitive performance'],
        verdict: 'Ashwagandha (Tier 1) has stronger overall evidence, particularly for anxiety reduction and cortisol management. Rhodiola Rosea (Tier 2) excels for acute mental fatigue and physical endurance. Both are well-tolerated adaptogens with complementary mechanisms — Ashwagandha for chronic stress and Rhodiola for acute performance demands.',
        whoShouldChoose: [
            { scenario: 'Chronic stress & anxiety', recommendation: 'Ashwagandha', reason: 'Superior evidence for sustained cortisol reduction (SMD = -1.18 across 23 RCTs) and anxiety management.' },
            { scenario: 'Mental fatigue & focus', recommendation: 'Rhodiola rosea', reason: 'Better acute anti-fatigue effects with faster onset; improves attention under stress conditions.' },
            { scenario: 'Physical performance', recommendation: 'Rhodiola rosea', reason: 'More evidence for exercise endurance (VO2 max improvement) and reduced muscle damage markers.' },
            { scenario: 'Sleep quality', recommendation: 'Ashwagandha', reason: 'Direct sleep quality improvement; Rhodiola may cause sleep disturbances if taken late.' },
            { scenario: 'Hormonal support (men)', recommendation: 'Ashwagandha', reason: 'Evidence for testosterone increase and reproductive health in men.' },
            { scenario: 'Depression symptoms', recommendation: 'Both viable', reason: 'Both show preliminary evidence; Rhodiola through MAO inhibition, Ashwagandha through HPA axis modulation.' }
        ],
        canStack: 'Yes — Ashwagandha and Rhodiola can be safely combined. Their mechanisms are complementary: Ashwagandha modulates the HPA axis and GABA signaling, while Rhodiola acts through MAO inhibition and stress protein expression. A common stack uses Ashwagandha (300mg evening) for baseline stress resilience and Rhodiola (200mg morning) for daytime mental energy. No known adverse interactions between these adaptogens.',
        relatedGuides: [
            { title: 'Anxiety & Stress Relief Guide', url: '../guides/anxiety-stress.html' },
            { title: 'Cognitive Performance Guide', url: '../guides/cognitive-performance.html' }
        ],
        relatedCategories: [
            { title: 'Adaptogens', url: '../categories/herbal-extracts.html' }
        ]
    },
    {
        slug: 'magnesium-vs-melatonin',
        suppA: 'Magnesium',
        suppB: 'Melatonin',
        title: 'Magnesium vs Melatonin for Sleep: Evidence-Based Comparison',
        metaTitle: 'Magnesium vs Melatonin for Sleep (2026) | Which Is Better?',
        metaDescription: 'Evidence-based comparison of Magnesium vs Melatonin for sleep quality. Compare mechanisms, dosages, side effects, and which supplement works better for different sleep issues.',
        domain: 'Sleep Support',
        sharedDomains: ['sleep quality', 'sleep onset', 'relaxation'],
        verdict: 'Both Magnesium and Melatonin are Tier 1 (Strong Evidence) for sleep support, but they work through entirely different mechanisms. Melatonin directly regulates the circadian clock and is most effective for sleep onset and jet lag. Magnesium promotes relaxation through GABA modulation and muscle relaxation, offering broader benefits including cardiovascular and stress management support. For sleep onset issues, Melatonin is typically more effective; for overall sleep quality with additional health benefits, Magnesium is the better choice.',
        whoShouldChoose: [
            { scenario: 'Difficulty falling asleep', recommendation: 'Melatonin', reason: 'Directly reduces sleep onset latency by signaling the circadian system that it is time to sleep.' },
            { scenario: 'Jet lag or shift work', recommendation: 'Melatonin', reason: 'Uniquely effective for circadian rhythm resetting; Magnesium does not address circadian disruption.' },
            { scenario: 'Stress-related insomnia', recommendation: 'Magnesium', reason: 'Addresses the root cause through GABA modulation, muscle relaxation, and cortisol reduction.' },
            { scenario: 'Overall sleep quality', recommendation: 'Magnesium', reason: 'Broader mechanism of action; also supports muscle relaxation and reduces nighttime cramps.' },
            { scenario: 'Long-term daily use', recommendation: 'Magnesium', reason: 'Essential mineral with no dependency risk; Melatonin may affect endogenous production with chronic high-dose use.' },
            { scenario: 'Children or elderly', recommendation: 'Consult physician', reason: 'Both have specific dosing considerations in these populations; medical guidance recommended.' }
        ],
        canStack: 'Yes — Magnesium and Melatonin are frequently combined and work through complementary pathways. Magnesium promotes physical relaxation and GABA activity while Melatonin signals circadian sleep timing. A common protocol is Magnesium (200-400mg glycinate/threonate) taken 1-2 hours before bed with Melatonin (0.5-3mg) taken 30-60 minutes before bed. No known adverse interactions. This combination may be more effective than either alone for people with both difficulty relaxing and difficulty initiating sleep.',
        relatedGuides: [
            { title: 'Sleep Quality Guide', url: '../guides/sleep.html' },
            { title: 'Anxiety & Stress Relief Guide', url: '../guides/anxiety-stress.html' }
        ],
        relatedCategories: [
            { title: 'Essential Nutrients', url: '../categories/essential-nutrients.html' }
        ]
    },
    {
        slug: 'omega-3-vs-coq10',
        suppA: 'Omega-3 Fatty Acids',
        suppB: 'CoQ10',
        title: 'Omega-3 vs CoQ10 for Heart Health: Evidence-Based Comparison',
        metaTitle: 'Omega-3 vs CoQ10 (2026) | Which Is Better for Heart Health?',
        metaDescription: 'Evidence-based comparison of Omega-3 (Fish Oil) vs CoQ10 for cardiovascular health. Compare benefits for heart function, cholesterol, blood pressure, and which supplement to choose.',
        domain: 'Cardiovascular Health',
        sharedDomains: ['heart health', 'cardiovascular function', 'anti-inflammatory'],
        verdict: 'Omega-3 Fatty Acids (Tier 1) have stronger and broader cardiovascular evidence, particularly for triglyceride reduction, anti-inflammatory effects, and overall cardiovascular mortality reduction. CoQ10 (Tier 2) has more targeted benefits for mitochondrial energy production, heart failure support, and endothelial function. Omega-3 is the better first-line cardiovascular supplement, while CoQ10 is particularly valuable for those on statins (which deplete CoQ10) or with heart failure.',
        whoShouldChoose: [
            { scenario: 'High triglycerides', recommendation: 'Omega-3 Fatty Acids', reason: 'Strong evidence for triglyceride reduction (15-30% at therapeutic doses); primary FDA-approved indication.' },
            { scenario: 'General heart disease prevention', recommendation: 'Omega-3 Fatty Acids', reason: 'Broader cardiovascular evidence including mortality reduction, anti-inflammatory effects, and metabolic benefits.' },
            { scenario: 'Statin users', recommendation: 'CoQ10', reason: 'Statins deplete CoQ10 levels; supplementation may support muscle comfort and energy production.' },
            { scenario: 'Heart failure', recommendation: 'CoQ10', reason: 'Specific evidence for improving heart function parameters and exercise tolerance in heart failure patients.' },
            { scenario: 'Anti-aging & energy', recommendation: 'CoQ10', reason: 'Central role in mitochondrial energy production; declines with age, making supplementation more relevant for older adults.' },
            { scenario: 'Comprehensive cardiovascular support', recommendation: 'Both', reason: 'Complementary mechanisms — Omega-3 for inflammation and lipids, CoQ10 for energy production and endothelial function.' }
        ],
        canStack: 'Yes — Omega-3 and CoQ10 are commonly combined for comprehensive cardiovascular support. Their mechanisms are fully complementary: Omega-3 supports a healthy inflammatory response, supports healthy triglyceride levels, and promotes cell membrane fluidity, while CoQ10 supports mitochondrial energy production and endothelial function. This combination is widely used, especially alongside statin therapy. Take both with a fat-containing meal for optimal absorption. No known adverse interactions.',
        relatedGuides: [
            { title: 'Cardiovascular Health Guide', url: '../guides/cardiovascular.html' }
        ],
        relatedCategories: [
            { title: 'Essential Nutrients', url: '../categories/essential-nutrients.html' },
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'bacopa-vs-ginkgo',
        suppA: 'Bacopa monnieri',
        suppB: 'Ginkgo Biloba',
        title: 'Bacopa vs Ginkgo Biloba for Memory: Evidence-Based Comparison',
        metaTitle: 'Bacopa vs Ginkgo Biloba (2026) | Which Nootropic Is Better?',
        metaDescription: 'Evidence-based comparison of Bacopa Monnieri vs Ginkgo Biloba for memory, focus, and cognitive performance. Compare mechanisms, study evidence, and which nootropic suits your needs.',
        domain: 'Cognitive Enhancement',
        sharedDomains: ['memory', 'cognitive function', 'neuroprotection'],
        verdict: 'Both Bacopa monnieri and Ginkgo Biloba are Tier 2 (Moderate Evidence) nootropics, but they enhance cognition through different mechanisms. Bacopa is stronger for memory formation and learning through acetylcholinesterase inhibition and synaptic transmission enhancement — but requires 8-12 weeks for full effects. Ginkgo works faster through cerebral blood flow enhancement and is better studied for age-related cognitive decline and vascular cognitive impairment. Choose Bacopa for memory and learning; choose Ginkgo for circulation-related cognitive support and acute mental clarity.',
        whoShouldChoose: [
            { scenario: 'Memory & learning', recommendation: 'Bacopa monnieri', reason: 'Strongest evidence for memory consolidation and learning facilitation through cholinergic enhancement.' },
            { scenario: 'Age-related cognitive decline', recommendation: 'Ginkgo Biloba', reason: 'More studied in elderly populations; evidence for stabilizing cognitive decline in dementia and MCI.' },
            { scenario: 'Quick cognitive boost', recommendation: 'Ginkgo Biloba', reason: 'Faster onset through cerebral blood flow; Bacopa requires 8-12 weeks for full effects.' },
            { scenario: 'Students & exam preparation', recommendation: 'Bacopa monnieri', reason: 'Better evidence for attention, working memory, and information processing speed in healthy young adults.' },
            { scenario: 'Poor circulation / cold extremities', recommendation: 'Ginkgo Biloba', reason: 'Unique peripheral circulation benefits; also supports tinnitus and vascular health.' },
            { scenario: 'Anxiety with cognitive concerns', recommendation: 'Bacopa monnieri', reason: 'Has anxiolytic properties alongside cognitive benefits; Ginkgo does not address anxiety.' }
        ],
        canStack: 'Yes — Bacopa and Ginkgo can be safely combined for complementary cognitive enhancement. Bacopa works through acetylcholinesterase inhibition and synaptic enhancement (improving memory formation), while Ginkgo enhances cerebral blood flow and provides antioxidant neuroprotection. This combination addresses both neurochemical and vascular pathways of cognitive function. Standard dosing: Bacopa 300mg (55% bacosides) with meals, Ginkgo 120-240mg (EGb 761 extract). Note: both may interact with blood thinners — consult a healthcare provider if on anticoagulant therapy.',
        relatedGuides: [
            { title: 'Cognitive Performance Guide', url: '../guides/cognitive-performance.html' }
        ],
        relatedCategories: [
            { title: 'Nootropics', url: '../categories/nootropics.html' },
            { title: 'Herbal Extracts', url: '../categories/herbal-extracts.html' }
        ]
    },

    // ── Phase 3 Comparisons ──────────────────────────────────────────────

    {
        slug: 'lions-mane-vs-bacopa',
        suppA: "Lion's Mane Mushroom",
        suppB: 'Bacopa monnieri',
        title: "Lion's Mane vs Bacopa Monnieri: Evidence-Based Comparison for Cognitive Enhancement",
        metaTitle: "Lion's Mane vs Bacopa (2026) | Which Nootropic Is Better for Memory?",
        metaDescription: "Evidence-based comparison of Lion's Mane Mushroom vs Bacopa Monnieri for memory, neuroprotection, and cognitive function. Compare mechanisms, clinical evidence, and which nootropic suits your needs.",
        domain: 'Cognitive Enhancement',
        sharedDomains: ['memory', 'neuroprotection', 'cognitive function', 'learning'],
        verdict: "Both Lion's Mane Mushroom and Bacopa monnieri are Tier 2 (Moderate Evidence) nootropics that support cognitive function through distinct and complementary mechanisms. Bacopa monnieri has stronger evidence for memory consolidation and learning facilitation, working through acetylcholinesterase inhibition and synaptic transmission enhancement — though it requires 8-12 weeks for full effects. Lion's Mane is unique among nootropics for stimulating nerve growth factor (NGF) synthesis, supporting neurogenesis and nerve regeneration. Choose Bacopa for proven memory enhancement; choose Lion's Mane for neurotrophic support and long-term neuroprotection.",
        whoShouldChoose: [
            { scenario: 'Memory & learning', recommendation: 'Bacopa monnieri', reason: 'Strongest evidence for memory consolidation and learning facilitation through cholinergic enhancement; multiple RCTs in healthy adults.' },
            { scenario: 'Neurogenesis & nerve repair', recommendation: "Lion's Mane Mushroom", reason: "Unique ability to stimulate NGF synthesis; may support nerve regeneration and myelination — a mechanism not shared by other common nootropics." },
            { scenario: 'Age-related cognitive decline', recommendation: 'Both viable', reason: "Bacopa supports memory retention while Lion's Mane may support structural brain health through neurotrophic factors." },
            { scenario: 'Students & exam preparation', recommendation: 'Bacopa monnieri', reason: 'Better evidence for attention, working memory, and information processing speed in healthy young adults.' },
            { scenario: 'Long-term neuroprotection', recommendation: "Lion's Mane Mushroom", reason: "NGF stimulation may support long-term neuronal health and resilience; emerging evidence for mood and immune modulation." },
            { scenario: 'Anxiety alongside cognition', recommendation: 'Bacopa monnieri', reason: 'Has demonstrated anxiolytic properties alongside cognitive benefits in clinical trials.' }
        ],
        canStack: "Yes — Lion's Mane and Bacopa work through complementary mechanisms and can be safely combined. Lion's Mane stimulates NGF synthesis (neurotrophic pathway) while Bacopa modulates acetylcholinesterase and synaptic transmission (cholinergic pathway). This combination addresses both structural neuronal growth and neurochemical signaling for comprehensive cognitive support. Standard dosing: Lion's Mane 500-1000mg (fruiting body extract) and Bacopa 300mg (55% bacosides) with meals. No known adverse interactions between these compounds.",
        relatedGuides: [
            { title: 'Cognitive Performance Guide', url: '../guides/cognitive-performance.html' }
        ],
        relatedCategories: [
            { title: 'Nootropics', url: '../categories/nootropics.html' }
        ]
    },
    {
        slug: 'creatine-vs-beta-alanine',
        suppA: 'Creatine',
        suppB: 'Beta-Alanine',
        title: 'Creatine vs Beta-Alanine: Evidence-Based Comparison for Performance',
        metaTitle: 'Creatine vs Beta-Alanine (2026) | Which Performance Supplement Is Better?',
        metaDescription: 'Evidence-based comparison of Creatine vs Beta-Alanine for physical and cognitive performance. Compare mechanisms, clinical evidence for strength, endurance, and which supplement fits your goals.',
        domain: 'Physical & Cognitive Performance',
        sharedDomains: ['exercise performance', 'muscle function', 'physical endurance', 'strength'],
        verdict: 'Creatine (Tier 1) has vastly superior evidence compared to Beta-Alanine (Tier 3) across both physical and cognitive performance domains. Creatine is one of the most extensively studied supplements in existence, with strong meta-analytic support for strength, power, lean mass, and emerging evidence for cognitive benefits — particularly under sleep deprivation or mental fatigue. Beta-Alanine supports endurance through carnosine-mediated acid buffering, which is more specific to sustained high-intensity efforts lasting 1-10 minutes. Creatine is the clear first choice for most people; Beta-Alanine is a targeted addition for endurance-specific goals.',
        whoShouldChoose: [
            { scenario: 'Strength & power output', recommendation: 'Creatine', reason: 'Extensive meta-analysis support for increased strength, power, and lean body mass across diverse populations.' },
            { scenario: 'Cognitive performance', recommendation: 'Creatine', reason: 'Emerging Tier 1 evidence for cognitive benefits, particularly under conditions of sleep deprivation, mental fatigue, and aging.' },
            { scenario: 'High-intensity endurance (1-10 min)', recommendation: 'Beta-Alanine', reason: 'Carnosine buffering specifically supports sustained efforts where lactic acid accumulation is the limiting factor.' },
            { scenario: 'General supplementation', recommendation: 'Creatine', reason: 'Broader benefits, stronger evidence base, well-established safety profile, and cognitive benefits make it the superior all-around choice.' },
            { scenario: 'Time-to-exhaustion sports', recommendation: 'Beta-Alanine', reason: 'May improve time-to-exhaustion in activities like rowing, cycling sprints, and high-intensity interval training.' },
            { scenario: 'Maximum overall performance', recommendation: 'Both', reason: 'Different mechanisms (phosphocreatine energy system vs carnosine acid buffering) are fully complementary for comprehensive performance support.' }
        ],
        canStack: 'Yes — Creatine and Beta-Alanine are commonly stacked in sports nutrition and target entirely different performance pathways. Creatine replenishes phosphocreatine for short-duration maximal efforts (ATP resynthesis), while Beta-Alanine increases intramuscular carnosine to buffer hydrogen ions during sustained high-intensity work. This combination is one of the most evidence-supported supplement stacks for athletic performance. Standard dosing: Creatine 3-5g/day (monohydrate) and Beta-Alanine 3.2-6.4g/day (split doses to minimize paresthesia). No known adverse interactions.',
        relatedGuides: [
            { title: 'Energy & Vitality Guide', url: '../guides/energy-vitality.html' }
        ],
        relatedCategories: [
            { title: 'Performance Enhancers', url: '../categories/performance-enhancers.html' }
        ]
    },
    {
        slug: 'vitamin-d-vs-magnesium',
        suppA: 'Vitamin D3',
        suppB: 'Magnesium',
        title: 'Vitamin D3 vs Magnesium: Evidence-Based Comparison for Foundational Health',
        metaTitle: 'Vitamin D vs Magnesium (2026) | Which Essential Nutrient Do You Need?',
        metaDescription: 'Evidence-based comparison of Vitamin D3 vs Magnesium for mood, sleep, bone health, and immune function. Compare deficiency patterns, clinical evidence, and which essential nutrient to prioritize.',
        domain: 'Foundational Health',
        sharedDomains: ['mood', 'sleep', 'bone health', 'immune function', 'muscle function'],
        verdict: 'Vitamin D3 and Magnesium are both Tier 1 (Strong Evidence) essential nutrients that address widespread population deficiencies. Rather than competing supplements, they are synergistic — magnesium is required for vitamin D metabolism, and both are foundational to hundreds of enzymatic processes. Vitamin D3 has stronger evidence for immune function, bone mineral density, and mood regulation. Magnesium has stronger evidence for sleep quality, stress response, muscle relaxation, and cardiovascular function. Most people benefit from both, and deficiency in one can impair the function of the other.',
        whoShouldChoose: [
            { scenario: 'Sleep quality', recommendation: 'Magnesium', reason: 'Stronger evidence for sleep onset, sleep quality, and GABA modulation; particularly glycinate and threonate forms.' },
            { scenario: 'Immune function', recommendation: 'Vitamin D3', reason: 'Critical for both innate and adaptive immunity; deficiency strongly associated with increased infection susceptibility.' },
            { scenario: 'Mood & depression', recommendation: 'Both', reason: 'Both deficiencies are associated with depression; Vitamin D modulates serotonin synthesis while Magnesium supports NMDA receptor regulation.' },
            { scenario: 'Bone health', recommendation: 'Vitamin D3', reason: 'Essential for calcium absorption and bone mineralization; best combined with K2 for directing calcium to bones rather than soft tissue.' },
            { scenario: 'Muscle cramps & tension', recommendation: 'Magnesium', reason: 'Directly involved in muscle relaxation and neuromuscular transmission; deficiency commonly causes cramps and tension.' },
            { scenario: 'Budget (one supplement only)', recommendation: 'Depends on deficiency status', reason: 'Get tested — 42% of US adults are vitamin D deficient, while ~50% have inadequate magnesium intake. Prioritize the greater deficiency.' }
        ],
        canStack: 'Yes — Vitamin D3 and Magnesium are synergistic and commonly recommended together. Magnesium is required for the enzymatic conversion of vitamin D to its active form (calcitriol). Research suggests that magnesium deficiency can impair vitamin D metabolism, making both supplements less effective alone than combined. Standard dosing: Vitamin D3 1000-5000 IU/day (based on blood levels) and Magnesium 200-400mg/day (glycinate, threonate, or citrate forms). Vitamin D3 is best taken with a fat-containing meal; Magnesium can be taken anytime but evening may support sleep.',
        relatedGuides: [
            { title: 'Sleep Quality Guide', url: '../guides/sleep.html' },
            { title: 'Anxiety & Stress Guide', url: '../guides/anxiety-stress.html' }
        ],
        relatedCategories: [
            { title: 'Essential Nutrients', url: '../categories/essential-nutrients.html' }
        ]
    },
    {
        slug: 'turmeric-vs-boswellia',
        suppA: 'Turmeric/Curcumin',
        suppB: 'Boswellia',
        title: 'Turmeric/Curcumin vs Boswellia: Evidence-Based Comparison for Inflammation',
        metaTitle: 'Turmeric vs Boswellia (2026) | Which Anti-Inflammatory Is Better?',
        metaDescription: 'Evidence-based comparison of Turmeric/Curcumin vs Boswellia for inflammation, joint health, and pain management. Compare mechanisms, clinical evidence, and which anti-inflammatory suits your needs.',
        domain: 'Anti-Inflammatory Support',
        sharedDomains: ['inflammation', 'joint health', 'pain management', 'antioxidant'],
        verdict: 'Turmeric/Curcumin (Tier 1) has a vastly broader evidence base compared to Boswellia (Tier 2), with strong meta-analytic support spanning systemic inflammation, joint health, cognitive function, cardiovascular markers, and metabolic health. Boswellia is more specifically targeted at 5-lipoxygenase (5-LOX) inhibition and has notable evidence for osteoarthritis and inflammatory bowel conditions. For general anti-inflammatory support, curcumin is the better first choice due to its broader mechanism of action and stronger evidence base. Boswellia excels in joint-specific and GI inflammatory conditions.',
        whoShouldChoose: [
            { scenario: 'Systemic inflammation', recommendation: 'Turmeric/Curcumin', reason: 'Broader anti-inflammatory mechanism targeting NF-κB, COX-2, and multiple inflammatory cytokines; strong meta-analytic support for CRP reduction.' },
            { scenario: 'Joint-specific pain', recommendation: 'Boswellia', reason: 'Targeted 5-LOX inhibition is particularly effective for joint inflammation; strong evidence in osteoarthritis trials.' },
            { scenario: 'Cognitive support + anti-inflammatory', recommendation: 'Turmeric/Curcumin', reason: 'Emerging evidence for neuroprotective effects and cognitive support alongside anti-inflammatory benefits.' },
            { scenario: 'IBD / GI inflammation', recommendation: 'Boswellia', reason: 'Specific evidence for inflammatory bowel conditions including ulcerative colitis and Crohn\'s disease.' },
            { scenario: 'Metabolic health', recommendation: 'Turmeric/Curcumin', reason: 'Evidence for supporting healthy lipid profiles, blood glucose, and liver function markers.' },
            { scenario: 'Osteoarthritis', recommendation: 'Both viable', reason: 'Both have evidence for osteoarthritis; curcumin addresses broader inflammatory markers while Boswellia targets joint-specific pathways.' }
        ],
        canStack: 'Yes — Turmeric/Curcumin and Boswellia target different inflammatory pathways and are commonly combined for comprehensive anti-inflammatory support. Curcumin primarily inhibits NF-κB and COX-2 pathways, while Boswellia\'s boswellic acids specifically inhibit 5-lipoxygenase (5-LOX). This dual-pathway approach may provide more thorough inflammatory modulation than either supplement alone. Standard dosing: Curcumin 500-1000mg/day (with piperine or phytosome formulation for absorption) and Boswellia 300-500mg/day (standardized to 30-40% AKBA). Both are best taken with food. Note: both may have mild blood-thinning effects — consult a healthcare provider if on anticoagulant therapy.',
        relatedGuides: [
            { title: 'Joint Health Guide', url: '../guides/joint-health.html' }
        ],
        relatedCategories: [
            { title: 'Herbal Extracts', url: '../categories/herbal-extracts.html' }
        ]
    },
    {
        slug: 'l-theanine-vs-5-htp',
        suppA: 'L-Theanine',
        suppB: '5-HTP',
        title: 'L-Theanine vs 5-HTP: Evidence-Based Comparison for Calm & Mood Support',
        metaTitle: 'L-Theanine vs 5-HTP (2026) | Which Is Better for Anxiety & Mood?',
        metaDescription: 'Evidence-based comparison of L-Theanine vs 5-HTP for mood, relaxation, and sleep support. Compare safety profiles, drug interactions, and which calming supplement suits your needs.',
        domain: 'Calm & Mood Support',
        sharedDomains: ['mood', 'relaxation', 'sleep quality', 'anxiety reduction'],
        verdict: 'L-Theanine (Tier 2) and 5-HTP (Tier 2) both support mood and relaxation, but through fundamentally different mechanisms and with very different safety profiles. L-Theanine promotes calm, focused alertness by modulating alpha brain waves and supporting GABA, serotonin, and dopamine balance — with an excellent safety profile and no known drug interaction concerns. 5-HTP is a direct serotonin precursor that can be more potent for mood elevation and sleep onset, but carries a serious risk of serotonin syndrome when combined with SSRIs, SNRIs, or other serotonergic medications. L-Theanine is the safer choice for most people; 5-HTP is more targeted but requires careful screening for medication interactions.',
        whoShouldChoose: [
            { scenario: 'Calm focus without sedation', recommendation: 'L-Theanine', reason: 'Promotes alpha brain waves for relaxed alertness; excellent for daytime use without drowsiness or cognitive impairment.' },
            { scenario: 'Mood & depression support', recommendation: '5-HTP', reason: 'Direct serotonin precursor with more potent mood-elevating effects; but ONLY for those NOT on serotonergic medications.' },
            { scenario: 'On SSRIs or SNRIs', recommendation: 'L-Theanine ONLY', reason: '5-HTP is CONTRAINDICATED with serotonergic medications due to serious serotonin syndrome risk. L-Theanine is safe with these medications.' },
            { scenario: 'Sleep onset support', recommendation: '5-HTP', reason: 'Serotonin is a precursor to melatonin; 5-HTP may support both sleep onset and sleep quality through this pathway.' },
            { scenario: 'Daily long-term use', recommendation: 'L-Theanine', reason: 'Excellent long-term safety profile with no tolerance, dependence, or withdrawal concerns. 5-HTP long-term safety is less established.' },
            { scenario: 'Stress-related anxiety', recommendation: 'L-Theanine', reason: 'Evidence for reducing stress response and physiological markers of anxiety without sedation or impairment.' }
        ],
        canStack: 'Use caution — while L-Theanine and 5-HTP can be taken together at standard doses by healthy individuals not on serotonergic medications, both influence serotonin pathways. L-Theanine modulates serotonin indirectly, while 5-HTP directly increases serotonin synthesis. This combination is generally considered safe for most people at standard doses (L-Theanine 100-200mg, 5-HTP 50-100mg), but is NOT recommended for anyone taking SSRIs, SNRIs, MAOIs, tramadol, triptans, or other serotonergic drugs. Start with the lowest effective doses and monitor for symptoms of excess serotonin (agitation, confusion, rapid heartbeat, elevated body temperature).',
        relatedGuides: [
            { title: 'Anxiety & Stress Guide', url: '../guides/anxiety-stress.html' },
            { title: 'Sleep Quality Guide', url: '../guides/sleep.html' }
        ],
        relatedCategories: [
            { title: 'Amino Acids', url: '../categories/amino-acids.html' }
        ]
    },
    {
        slug: 'coq10-vs-pqq',
        suppA: 'CoQ10',
        suppB: 'PQQ',
        title: 'CoQ10 vs PQQ: Evidence-Based Comparison for Mitochondrial Health',
        metaTitle: 'CoQ10 vs PQQ (2026) | Which Mitochondrial Supplement Is Better?',
        metaDescription: 'Evidence-based comparison of CoQ10 vs PQQ for mitochondrial function, energy, and cognitive support. Compare clinical evidence, mechanisms, and which supplement is best for cellular health.',
        domain: 'Mitochondrial & Cellular Health',
        sharedDomains: ['mitochondrial function', 'antioxidant protection', 'cognitive support', 'energy production'],
        verdict: 'CoQ10 (Tier 2) has a vastly stronger evidence base compared to PQQ (Tier 3), with extensive clinical trials supporting its role in cardiovascular health, mitochondrial energy production, statin-related CoQ10 depletion, and antioxidant defense. PQQ (pyrroloquinoline quinone) is an emerging compound with preliminary evidence for stimulating mitochondrial biogenesis — the creation of new mitochondria — and early signals for memory and sleep quality support. CoQ10 is the proven, well-established choice for mitochondrial support; PQQ is a promising but largely unproven addition that may complement CoQ10.',
        whoShouldChoose: [
            { scenario: 'Heart health', recommendation: 'CoQ10', reason: 'Extensive evidence for cardiovascular support, particularly heart failure, blood pressure, and endothelial function.' },
            { scenario: 'Statin users', recommendation: 'CoQ10', reason: 'Statins inhibit CoQ10 biosynthesis; supplementation may support muscle comfort and energy levels in statin users.' },
            { scenario: 'Energy & fatigue', recommendation: 'CoQ10', reason: 'Central role in the mitochondrial electron transport chain; well-established for supporting cellular energy production.' },
            { scenario: 'Mitochondrial biogenesis', recommendation: 'PQQ (preliminary)', reason: 'Early evidence suggests PQQ may stimulate PGC-1α and the creation of new mitochondria — a unique mechanism not shared by CoQ10.' },
            { scenario: 'Memory & cognitive function', recommendation: 'PQQ shows early promise', reason: 'Preliminary studies suggest PQQ may support cognitive function and memory in middle-aged and elderly adults, but evidence is limited.' },
            { scenario: 'Proven track record', recommendation: 'CoQ10', reason: 'Decades of clinical research with hundreds of trials; well-characterized safety profile and established efficacy across multiple health domains.' }
        ],
        canStack: 'Yes — CoQ10 and PQQ are commonly combined for comprehensive mitochondrial support. CoQ10 optimizes the function of existing mitochondria by serving as an essential electron carrier in the respiratory chain, while PQQ may stimulate the biogenesis of new mitochondria through PGC-1α activation. This combination theoretically supports both the quantity and quality of mitochondrial function. Standard dosing: CoQ10 100-300mg/day (ubiquinol form for better absorption) and PQQ 10-20mg/day. Both are best taken with food. No known adverse interactions between these compounds.',
        relatedGuides: [
            { title: 'Cardiovascular Health Guide', url: '../guides/cardiovascular.html' },
            { title: 'Cognitive Performance Guide', url: '../guides/cognitive-performance.html' }
        ],
        relatedCategories: [
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'inulin-vs-berberine',
        suppA: 'Inulin',
        suppB: 'Berberine',
        title: 'Inulin vs Berberine: Evidence-Based Comparison for Blood Sugar & Metabolic Health',
        metaTitle: 'Inulin vs Berberine (2026) | Blood Sugar & Gut Health Comparison',
        metaDescription: 'Evidence-based comparison of Inulin vs Berberine for blood sugar control, weight management, and metabolic health. Compare mechanisms, clinical evidence, dosages, and side effects.',
        domain: 'Metabolic & Blood Sugar Control',
        sharedDomains: ['blood sugar control', 'weight management', 'gut microbiome', 'insulin sensitivity', 'lipid profile'],
        verdict: 'Both Inulin (Tier 2) and Berberine (Tier 2) improve blood sugar control via the gut, but through distinct mechanisms. Berberine delivers more potent acute glycemic effects (AMPK activation, comparable to metformin in some studies), while Inulin operates through prebiotic fermentation — slower but exceptionally safe and suited for long-term use. For diabetic patients prioritizing glucose reduction, Berberine offers stronger single-compound effects. For gut-centric metabolic support with superior tolerability, Inulin is the preferred choice.',
        whoShouldChoose: [
            { scenario: 'Type 2 diabetes management', recommendation: 'Berberine', reason: 'Stronger acute glycemic effects: HbA1c -0.90% vs Inulin\'s -0.58% in T2DM meta-analyses. AMPK activation mimics pharmacological glucose lowering.' },
            { scenario: 'Gut microbiome support', recommendation: 'Inulin', reason: 'Selectively feeds Bifidobacterium and Lactobacillus; proven bifidogenic prebiotic with robust dose-response data.' },
            { scenario: 'Weight management', recommendation: 'Inulin', reason: '32-RCT meta-analysis: -0.97 kg body weight. Inulin uniquely reduces appetite via GLP-1/PYY stimulation with no GI mucosal concerns.' },
            { scenario: 'Lipid lowering (LDL)', recommendation: 'Berberine', reason: 'Berberine reduces LDL by ~0.65 mmol/L; Inulin reduces LDL by ~0.14 mmol/L. Berberine is substantially more potent for lipid management.' },
            { scenario: 'Long-term daily use', recommendation: 'Inulin', reason: 'Excellent safety profile; a dietary fiber with GRAS status. Berberine carries more drug interaction risk (CYP3A4 inhibition) and is not recommended for extended unsupervised use.' },
            { scenario: 'Healthy adults (prevention)', recommendation: 'Inulin', reason: 'Widely applicable as a food ingredient or supplement at 5-10g/day. Berberine is more appropriate for therapeutic metabolic concerns under clinical guidance.' }
        ],
        canStack: 'Yes, with caution — Inulin and Berberine can be combined as their mechanisms are additive and complementary. Inulin\'s fermentation-derived SCFAs activate GPR41/43 receptors, while Berberine activates AMPK, providing dual-pathway glucose modulation. Inulin\'s prebiotic effect may also improve Berberine\'s bioavailability by modulating intestinal microbiota involved in Berberine absorption. However, monitor blood glucose carefully if combining with diabetes medications. Start Berberine at a lower dose (500mg/day) when adding to Inulin (10g/day) and adjust based on glycemic response. Both compounds enhance GLP-1 secretion — synergistic effects are expected.',
        relatedGuides: [
            { title: 'Blood Sugar Control Guide', url: '../guides/blood-sugar.html' },
            { title: 'Digestive Health Guide', url: '../guides/digestive-health.html' }
        ],
        relatedCategories: [
            { title: 'Herbal Extracts', url: '../categories/herbal-extracts.html' }
        ]
    },
    {
        slug: 'inulin-vs-akkermansia',
        suppA: 'Inulin',
        suppB: 'Akkermansia muciniphila',
        title: 'Inulin vs Akkermansia muciniphila: Evidence-Based Comparison for Gut & Metabolic Health',
        metaTitle: 'Inulin vs Akkermansia (2026) | Prebiotic vs Postbiotic Gut Health',
        metaDescription: 'Evidence-based comparison of Inulin (prebiotic) vs Akkermansia muciniphila (postbiotic) for gut barrier function, metabolic health, and longevity. Compare mechanisms, evidence tiers, and synergies.',
        domain: 'Gut Health & Metabolic Support',
        sharedDomains: ['gut microbiome', 'gut barrier integrity', 'metabolic health', 'insulin sensitivity', 'inflammation'],
        verdict: 'Inulin (Tier 2) and Akkermansia muciniphila (Tier 3) represent two distinct but synergistic approaches to gut health. Inulin is a well-established prebiotic with 55+ RCTs demonstrating consistent metabolic and microbiome benefits. Akkermansia is a promising next-generation postbiotic with early but compelling human data on gut barrier function and metabolic health. Inulin is the evidence-backed foundation; Akkermansia is the emerging frontier. Critically, Inulin naturally enriches Akkermansia abundance — making them synergistic partners rather than alternatives.',
        whoShouldChoose: [
            { scenario: 'Proven clinical outcomes', recommendation: 'Inulin', reason: 'Tier 2 vs Tier 3: Inulin has 55+ RCTs, 5 meta-analyses, and consistent effects across body weight, blood sugar, and lipids. Akkermansia has promising but limited human data.' },
            { scenario: 'Gut barrier / leaky gut', recommendation: 'Akkermansia (emerging)', reason: 'Akkermansia directly colonizes the mucus layer and produces Amuc_1100 protein that activates TLR2, tightening gut junctions. Inulin\'s barrier effects are indirect (via SCFA production).' },
            { scenario: 'Blood sugar & weight', recommendation: 'Inulin', reason: 'Robust meta-analytic evidence for fasting glucose (-0.60 mmol/L in T2DM) and weight (-0.97 kg). Akkermansia\'s glycemic effects are preliminary.' },
            { scenario: 'Microbiome enrichment', recommendation: 'Both (synergistic)', reason: 'Inulin selectively feeds Bifidobacterium and also raises Akkermansia abundance. For targeted Akkermansia enrichment, pasteurized Akkermansia supplementation is required; for broad bifidogenic benefit, Inulin suffices.' },
            { scenario: 'Healthy aging / longevity', recommendation: 'Akkermansia (emerging)', reason: 'Akkermansia abundance inversely correlates with age-related metabolic decline. PMID 39286985 links inulin supplementation to frailty reduction partly through microbiome shifts.' },
            { scenario: 'Budget-conscious choice', recommendation: 'Inulin', reason: 'Widely available as chicory root fiber at $0.10-0.30/day. Pasteurized Akkermansia supplements are expensive ($1.50-3.00/day) with emerging evidence only.' }
        ],
        canStack: 'Yes — Inulin and Akkermansia muciniphila are highly synergistic. Inulin fermentation produces acetate and propionate, which serve as energy substrates for Akkermansia and promote its colonization in the colon. Several studies show Inulin supplementation increases Akkermansia abundance by 2-3 fold in healthy adults. Taking Inulin (10g/day) alongside pasteurized Akkermansia (10^10 CFU/day) provides both the prebiotic substrate and direct bacterial supplementation, potentially producing additive effects on gut barrier integrity and metabolic health. No known adverse interactions. This prebiotic + postbiotic combination is considered a rational microbiome strategy.',
        relatedGuides: [
            { title: 'Digestive Health Guide', url: '../guides/digestive-health.html' },
            { title: 'Blood Sugar Control Guide', url: '../guides/blood-sugar.html' }
        ],
        relatedCategories: [
            { title: 'Herbal Extracts', url: '../categories/herbal-extracts.html' },
            { title: 'Probiotics', url: '../categories/probiotics.html' }
        ]
    },
    {
        slug: 'glucosamine-vs-chondroitin',
        suppA: 'Glucosamine',
        suppB: 'Chondroitin Sulfate',
        title: 'Glucosamine vs Chondroitin Sulfate: Evidence-Based Comparison',
        metaTitle: 'Glucosamine vs Chondroitin (2026) | Which Is Better for Joints?',
        metaDescription: 'Evidence-based comparison of Glucosamine vs Chondroitin Sulfate for joint health and osteoarthritis. Compare mechanisms, clinical evidence, dosages, and which supplement is right for your joints.',
        domain: 'Joint Support',
        sharedDomains: ['joint health', 'osteoarthritis', 'cartilage support', 'anti-inflammatory'],
        verdict: 'Both Glucosamine Sulfate and Chondroitin Sulfate are Tier 2 (Moderate Evidence) for osteoarthritis, but they approach cartilage support through distinct mechanisms. Glucosamine provides raw building blocks for cartilage GAG synthesis and shows consistent evidence for slowing joint space narrowing (SMD -0.42). Chondroitin works primarily by inhibiting cartilage-degrading enzymes (MMPs and ADAMTS) and enhancing synovial fluid. Independent meta-analyses show both have modest pain relief below clinical significance thresholds, but structural benefits are more robust. Pharmaceutical-grade formulations are critical for both — supplement-grade products show weaker effects.',
        whoShouldChoose: [
            { scenario: 'Early osteoarthritis prevention', recommendation: 'Glucosamine Sulfate', reason: 'Stronger evidence for slowing joint space narrowing; sulfate form specifically (not HCl) showed significance in long-term RCTs.' },
            { scenario: 'Active cartilage degradation', recommendation: 'Chondroitin Sulfate', reason: 'Directly inhibits matrix metalloproteinases (MMPs) and ADAMTS enzymes that break down cartilage.' },
            { scenario: 'Pain relief priority', recommendation: 'Either (modest)', reason: 'Both show sub-clinical pain improvements (VAS WMD -5 to -7mm vs 15mm MCID). Neither replaces NSAIDs for acute pain.' },
            { scenario: 'Synovial fluid support', recommendation: 'Chondroitin Sulfate', reason: 'Enhances synovial fluid viscosity and proteoglycan content, supporting joint lubrication.' },
            { scenario: 'Comprehensive joint support', recommendation: 'Both combined', reason: 'The GAIT trial and subsequent analyses suggest the combination may outperform either alone for moderate-to-severe knee OA.' },
            { scenario: 'Budget-conscious choice', recommendation: 'Glucosamine Sulfate', reason: 'Generally less expensive; widely available as a standalone supplement with consistent dosing guidelines.' }
        ],
        canStack: 'Yes — Glucosamine and Chondroitin are frequently combined and this is one of the most studied supplement combinations in joint health. The GAIT trial (Clegg 2006, N=1583) found the combination showed benefit in the moderate-to-severe OA subgroup. Their mechanisms are complementary: Glucosamine provides building blocks for GAG synthesis while Chondroitin inhibits degrading enzymes. Standard combination: Glucosamine Sulfate 1500mg + Chondroitin Sulfate 800-1200mg daily, preferably pharmaceutical-grade. Both are well-tolerated with mild GI side effects. Caution with shellfish allergy (glucosamine source) and anticoagulants (chondroitin may enhance effects).',
        relatedGuides: [],
        relatedCategories: [
            { title: 'Joint Support', url: '../categories/joint-support.html' }
        ]
    },
    {
        slug: 'lutein-vs-zeaxanthin',
        suppA: 'Lutein',
        suppB: 'Zeaxanthin',
        title: 'Lutein vs Zeaxanthin for Eye & Brain Health: Evidence-Based Comparison',
        metaTitle: 'Lutein vs Zeaxanthin (2026) | Which Carotenoid Is Better?',
        metaDescription: 'Evidence-based comparison of Lutein vs Zeaxanthin for macular health, eye protection, and cognitive function. Compare mechanisms, dosages, and which carotenoid is right for you.',
        domain: 'Eye & Brain Health',
        sharedDomains: ['macular health', 'eye protection', 'blue light filtration', 'cognitive function'],
        verdict: 'Lutein and Zeaxanthin are both Tier 2 (Moderate Evidence) carotenoids that accumulate in the macula and brain. They are stereoisomers with nearly identical structures but distinct distributions: Lutein dominates the peripheral macula and brain tissue, while Zeaxanthin concentrates in the central fovea where visual acuity is highest. Both filter blue light and provide antioxidant protection. Clinical evidence from the AREDS2 trial (N=4203) established Lutein + Zeaxanthin as the standard replacement for beta-carotene in age-related macular degeneration prevention. Most evidence supports using them together rather than choosing one over the other.',
        whoShouldChoose: [
            { scenario: 'Central vision protection', recommendation: 'Zeaxanthin', reason: 'Concentrates in the fovea centralis where sharp vision originates; provides targeted protection against blue light damage at the macula center.' },
            { scenario: 'Overall macular support', recommendation: 'Lutein', reason: 'Distributes across the broader macula and peripheral retina; more extensively studied with larger effect sizes for macular pigment optical density (MPOD).' },
            { scenario: 'Cognitive function', recommendation: 'Lutein', reason: 'Greater accumulation in brain tissue; linked to cognitive processing speed and memory in observational studies.' },
            { scenario: 'Age-related macular degeneration risk', recommendation: 'Both combined', reason: 'AREDS2 trial demonstrated the combination (10mg Lutein + 2mg Zeaxanthin) reduces AMD progression risk; neither alone matches this evidence.' },
            { scenario: 'Screen-heavy work (blue light exposure)', recommendation: 'Both combined', reason: 'Together they filter blue light across the full macular area — Lutein at the periphery, Zeaxanthin at the center.' },
            { scenario: 'Skin health bonus', recommendation: 'Either', reason: 'Both provide UV photoprotection for skin; minimal difference in this application.' }
        ],
        canStack: 'Yes — Lutein and Zeaxanthin are almost always used together and this is the clinically validated approach. The AREDS2 formula uses 10mg Lutein + 2mg Zeaxanthin (5:1 ratio). They share the same absorption pathway and are synergistic in macular pigment formation, with each covering different regions of the macula. Most commercial formulas combine them. Take with a fat-containing meal for optimal absorption (both are fat-soluble carotenoids). No known adverse interactions. The combination is considered the standard of care for macular health supplementation.',
        relatedGuides: [],
        relatedCategories: [
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'quercetin-vs-grape-seed-extract',
        suppA: 'Quercetin',
        suppB: 'Grape Seed Extract',
        title: 'Quercetin vs Grape Seed Extract: Evidence-Based Comparison',
        metaTitle: 'Quercetin vs Grape Seed Extract (2026) | Which Antioxidant Is Better?',
        metaDescription: 'Evidence-based comparison of Quercetin vs Grape Seed Extract for cardiovascular health, antioxidant protection, and anti-aging. Compare mechanisms, senolytic effects, and which supplement to choose.',
        domain: 'Cardiovascular & Antioxidant Support',
        sharedDomains: ['antioxidant protection', 'cardiovascular health', 'anti-inflammatory', 'neuroprotection'],
        verdict: 'Both Quercetin and Grape Seed Extract (GSE) are Tier 2 (Moderate Evidence) polyphenolic antioxidants with cardiovascular and anti-inflammatory benefits, but they have distinctly different clinical profiles. Quercetin is a flavonol with emerging senolytic properties (clearing senescent cells when combined with dasatinib) and broad anti-inflammatory effects. GSE contains proanthocyanidins — among the most potent natural antioxidants — with strong evidence for endothelial function and blood pressure support. Quercetin is the more versatile compound for anti-aging and immune support; GSE excels for vascular health and skin protection.',
        whoShouldChoose: [
            { scenario: 'Blood pressure support', recommendation: 'Grape Seed Extract', reason: 'More robust evidence for endothelial function enhancement and modest blood pressure reduction via nitric oxide pathway support.' },
            { scenario: 'Anti-aging / senolytic effects', recommendation: 'Quercetin', reason: 'Unique senolytic activity — clears senescent cells (with dasatinib in research protocols). GSE has no demonstrated senolytic properties.' },
            { scenario: 'Pure antioxidant capacity', recommendation: 'Grape Seed Extract', reason: 'Proanthocyanidins have higher oxygen radical absorbance capacity (ORAC) than most flavonoids including quercetin.' },
            { scenario: 'Immune support', recommendation: 'Quercetin', reason: 'Broader immune-modulating evidence including antiviral activity and mast cell stabilization (useful for allergies).' },
            { scenario: 'Skin health', recommendation: 'Grape Seed Extract', reason: 'Collagen cross-linking protection and UV photoprotection; proanthocyanidins specifically support dermal matrix integrity.' },
            { scenario: 'Comprehensive cardiovascular support', recommendation: 'Both combined', reason: 'Complementary mechanisms — Quercetin for inflammation and cellular senescence, GSE for endothelial function and vascular tone.' }
        ],
        canStack: 'Yes — Quercetin and Grape Seed Extract can be safely combined and target complementary pathways. Quercetin acts on inflammatory signaling and senescent cell clearance while GSE strengthens endothelial function and provides direct antioxidant protection. Standard doses: Quercetin 500-1000mg daily + GSE 100-400mg daily. Both are well-tolerated. Note: Quercetin may inhibit certain CYP enzymes affecting drug metabolism — check interactions if on medications. GSE may enhance anticoagulant effects. Take both with meals for improved absorption.',
        relatedGuides: [
            { title: 'Cardiovascular Health Guide', url: '../guides/cardiovascular.html' }
        ],
        relatedCategories: [
            { title: 'Antioxidants', url: '../categories/antioxidants.html' },
            { title: 'Polyphenols', url: '../categories/polyphenols.html' }
        ]
    },
    {
        slug: 'elderberry-vs-black-seed-oil',
        suppA: 'Elderberry',
        suppB: 'Black Seed Oil',
        title: 'Elderberry vs Black Seed Oil for Immune Support: Evidence-Based Comparison',
        metaTitle: 'Elderberry vs Black Seed Oil (2026) | Which Is Better for Immunity?',
        metaDescription: 'Evidence-based comparison of Elderberry vs Black Seed Oil for immune support, anti-inflammatory effects, and respiratory health. Compare mechanisms, dosages, and which supplement suits your needs.',
        domain: 'Immune & Respiratory Support',
        sharedDomains: ['immune support', 'anti-inflammatory', 'respiratory health', 'antioxidant'],
        verdict: 'Elderberry and Black Seed Oil (Nigella sativa) are both Tier 2 (Moderate Evidence) herbal supplements with immune-supporting properties, but they serve different clinical roles. Elderberry has stronger evidence for acute viral infections — its anthocyanins inhibit viral hemagglutinin, and meta-analyses show it reduces cold duration by 2-4 days. Black Seed Oil (via thymoquinone) has broader therapeutic reach including metabolic support, anti-inflammatory activity, and immune modulation, but weaker acute antiviral evidence. Choose Elderberry for seasonal immune defense; choose Black Seed Oil for year-round anti-inflammatory and metabolic support with immune benefits.',
        whoShouldChoose: [
            { scenario: 'Cold & flu season defense', recommendation: 'Elderberry', reason: 'Stronger evidence for reducing cold/flu duration (2-4 day reduction); specific antiviral mechanism via hemagglutinin inhibition.' },
            { scenario: 'Chronic inflammation', recommendation: 'Black Seed Oil', reason: 'Thymoquinone provides sustained anti-inflammatory effects across multiple pathways; better suited for ongoing inflammatory conditions.' },
            { scenario: 'Metabolic health + immunity', recommendation: 'Black Seed Oil', reason: 'Unique dual benefit — supports both immune function and metabolic parameters (blood sugar, lipids) simultaneously.' },
            { scenario: 'Respiratory tract support', recommendation: 'Both viable', reason: 'Elderberry supports upper respiratory tract specifically; Black Seed Oil has broader respiratory anti-inflammatory evidence.' },
            { scenario: 'Children (immune support)', recommendation: 'Elderberry', reason: 'More pediatric safety data; widely used in children\'s formulas. Black Seed Oil has less pediatric research.' },
            { scenario: 'Allergy-related immunity', recommendation: 'Black Seed Oil', reason: 'Thymoquinone has antihistamine-like properties and mast cell stabilization; addresses allergic inflammation specifically.' }
        ],
        canStack: 'Yes — Elderberry and Black Seed Oil can be safely combined for comprehensive immune support. Their mechanisms are complementary: Elderberry provides direct antiviral activity via hemagglutinin inhibition plus anthocyanin antioxidants, while Black Seed Oil (thymoquinone) modulates broader immune and inflammatory pathways. A practical protocol: Elderberry (300-600mg standardized extract) for seasonal immune defense + Black Seed Oil (500-1000mg) for ongoing anti-inflammatory and immune modulation. Both are well-tolerated with excellent safety profiles. Caution: Black Seed Oil may affect blood sugar — monitor if diabetic. Both may enhance anticoagulant effects.',
        relatedGuides: [],
        relatedCategories: [
            { title: 'Herbal Extracts', url: '../categories/herbal-extracts.html' }
        ]
    },
    {
        slug: 'calcium-alpha-ketoglutarate-vs-nmn',
        suppA: 'Calcium Alpha-Ketoglutarate',
        suppB: 'NMN (Nicotinamide Mononucleotide)',
        title: 'Ca-AKG vs NMN: Evidence-Based Comparison for Longevity',
        metaTitle: 'Ca-AKG vs NMN (2026) | Which Longevity Supplement Is Better?',
        metaDescription: 'Evidence-based comparison of Calcium Alpha-Ketoglutarate vs NMN for biological age, mitochondrial energy, and healthy aging. Compare mechanisms, human data, and tier ratings.',
        domain: 'Longevity & Healthy Aging',
        sharedDomains: ['biological age reduction', 'mitochondrial function', 'cellular energy metabolism', 'age-related decline support'],
        verdict: 'NMN (Tier 2) has a substantially larger human evidence base than Ca-AKG (Tier 3), with multiple placebo-controlled RCTs showing elevated NAD+ levels, improved aerobic capacity, and muscle function in aging adults. Ca-AKG\u2019s longevity case rests on landmark mouse lifespan data (Asadi Shahmirzadi 2020, Cell Metab) and a single n=42 retrospective DNA-methylation analysis (Demidenko 2021). NMN targets the NAD+ decline of aging; Ca-AKG targets TCA-cycle metabolism, epigenetic regulation (TET / Jumonji demethylases), and ATP synthase / TOR. They address complementary aging hallmarks, and the ABLE RCT (Lim 2025) is expected to begin filling the Ca-AKG evidence gap.',
        whoShouldChoose: [
            { scenario: 'Most robust human RCT evidence', recommendation: 'NMN', reason: 'Multiple placebo-controlled RCTs (n > 1,500 cumulative) on NAD+ elevation, aerobic capacity, and muscle function.' },
            { scenario: 'Biological-age reduction goal', recommendation: 'Ca-AKG (preliminary)', reason: 'Only supplement with a published human DNA-methylation clock reduction signal (Demidenko 2021), though retrospective and uncontrolled.' },
            { scenario: 'Mitochondrial energy & aerobic performance', recommendation: 'NMN', reason: 'Direct NAD+ precursor with demonstrated aerobic-capacity and walking-distance improvements in older adults.' },
            { scenario: 'Epigenetic / histone methylation support', recommendation: 'Ca-AKG', reason: 'Cofactor for TET and Jumonji-family demethylases; mechanism-replicated in aged-mouse bone marrow MSCs.' },
            { scenario: 'Maximum mechanistic breadth in one compound', recommendation: 'Ca-AKG', reason: 'Hits TOR, ATP synthase, epigenetic regulation, and mitophagy from a single metabolic intermediate.' },
            { scenario: 'Budget-conscious user', recommendation: 'NMN', reason: 'Generic NMN is now widely available at $20\u201335/month vs $40\u201370/month for branded Rejuvant-style Ca-AKG.' }
        ],
        canStack: 'Yes \u2014 Ca-AKG and NMN target non-overlapping aging mechanisms and can be stacked. NMN raises NAD+ availability (driving sirtuin and PARP activity); Ca-AKG provides TCA-cycle substrate and drives TOR inhibition and epigenetic demethylation. There are no reported adverse interactions. Typical stacking: NMN 500\u20131000 mg/day in the morning; Ca-AKG 1000 mg/day with food. Because both interventions are under active clinical investigation, combined long-term safety data are not yet available \u2014 monitor for any GI discomfort and prioritise independently-verified brands.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Mechanism Glossary', url: '../guides/mechanisms.html' }
        ],
        relatedCategories: [
            { title: 'Metabolic Support', url: '../categories/metabolic-support.html' },
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'calcium-alpha-ketoglutarate-vs-urolithin-a',
        suppA: 'Calcium Alpha-Ketoglutarate',
        suppB: 'Urolithin A',
        title: 'Ca-AKG vs Urolithin A: Evidence-Based Longevity Comparison',
        metaTitle: 'Ca-AKG vs Urolithin A (2026) | Mitochondrial Longevity Compared',
        metaDescription: 'Compare Calcium Alpha-Ketoglutarate and Urolithin A for mitochondrial quality control, mitophagy, and healthy aging. Evidence tiers, mechanisms, and dosing side-by-side.',
        domain: 'Mitochondrial Longevity',
        sharedDomains: ['mitophagy', 'mitochondrial quality control', 'muscle & joint aging', 'healthy aging'],
        verdict: 'Urolithin A (Tier 2) is ahead on human RCT evidence, with two placebo-controlled trials in older adults showing improved mitochondrial gene expression and muscle endurance. Ca-AKG (Tier 3) has stronger rodent lifespan data and a broader mechanistic footprint (TOR, epigenetic regulation, mitophagy) but only preliminary human data. Both activate mitophagy, though through different upstream routes: Urolithin A directly signals via PINK1/Parkin-independent and -dependent mitophagy; Ca-AKG engages mitophagy downstream of TCA-cycle and ROS effects.',
        whoShouldChoose: [
            { scenario: 'Muscle endurance in older adults', recommendation: 'Urolithin A', reason: 'Direct human RCT evidence (Singh et al. 2022, JAMA Network Open) for improved muscle endurance in middle-aged adults.' },
            { scenario: 'Biological-age reduction framing', recommendation: 'Ca-AKG', reason: 'Demidenko 2021 retrospective DNA-methylation reduction signal is specific to Ca-AKG (Rejuvant).' },
            { scenario: 'Strongest mitophagy evidence', recommendation: 'Urolithin A', reason: 'Mitophagy induction is the primary proposed mechanism and is most directly demonstrated in human muscle biopsies.' },
            { scenario: 'Mechanistic breadth (TOR + epigenetics + mitophagy)', recommendation: 'Ca-AKG', reason: 'Single metabolite engages multiple aging hallmarks via TCA-cycle replenishment.' },
            { scenario: 'Budget', recommendation: 'Ca-AKG', reason: 'Generic Ca-AKG is cheaper than branded Mitopure (Urolithin A), which remains premium-priced.' },
            { scenario: 'Bone health support', recommendation: 'Ca-AKG', reason: 'Preclinical bone mineral density restoration via histone demethylation (Wang 2020, Nat Commun).' }
        ],
        canStack: 'Yes \u2014 Ca-AKG and Urolithin A both support mitochondrial health through complementary mechanisms and are reasonable to stack. Urolithin A directly activates mitophagy and has demonstrated muscle-function benefits; Ca-AKG provides TCA-cycle substrate, TOR downregulation, and epigenetic cofactor activity. Typical stacking: Urolithin A 500\u20131000 mg/day and Ca-AKG 1000 mg/day, both with food. No adverse interactions reported. Evidence for combined use remains observational \u2014 individual RCT data supports each compound separately.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Muscle & Strength Guide', url: '../guides/muscle-strength.html' }
        ],
        relatedCategories: [
            { title: 'Metabolic Support', url: '../categories/metabolic-support.html' },
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'calcium-alpha-ketoglutarate-vs-spermidine',
        suppA: 'Calcium Alpha-Ketoglutarate',
        suppB: 'Spermidine',
        title: 'Ca-AKG vs Spermidine: Epigenetic & Autophagy Comparison',
        metaTitle: 'Ca-AKG vs Spermidine (2026) | Autophagy & Longevity Compared',
        metaDescription: 'Compare Calcium Alpha-Ketoglutarate and Spermidine for autophagy, epigenetic regulation, and healthy aging. Mechanisms, evidence tiers, and human data side-by-side.',
        domain: 'Longevity & Cellular Renewal',
        sharedDomains: ['autophagy', 'epigenetic regulation', 'biological age', 'healthy aging'],
        verdict: 'Both Ca-AKG (Tier 3) and Spermidine (Tier 3) sit at the Emerging end of the evidence spectrum for longevity. Spermidine has a slightly larger observational base (dietary intake studies) and multiple small human trials on cognition and cardiovascular markers; Ca-AKG has the single Demidenko 2021 DNA-methylation signal and stronger rodent lifespan data. Both act through cellular-renewal mechanisms: Spermidine directly induces autophagy via EIF5A hypusination and related pathways; Ca-AKG supports mitophagy, epigenetic demethylation, and TOR downregulation.',
        whoShouldChoose: [
            { scenario: 'Autophagy induction', recommendation: 'Spermidine', reason: 'Most robust preclinical and observational evidence for direct autophagy induction as a longevity mechanism.' },
            { scenario: 'Biological-age clock reduction', recommendation: 'Ca-AKG (preliminary)', reason: 'Only Ca-AKG has a published human DNA-methylation clock reduction data point.' },
            { scenario: 'Cognitive aging support', recommendation: 'Spermidine', reason: 'Small human trials (e.g., SmartAge) have tested spermidine for cognition in older adults.' },
            { scenario: 'TOR / caloric-restriction mimicry', recommendation: 'Ca-AKG', reason: 'Direct ATP synthase binding and TOR pathway downregulation (Chin 2014, Nature).' },
            { scenario: 'Bone health', recommendation: 'Ca-AKG', reason: 'Preclinical bone mass restoration via histone demethylation.' },
            { scenario: 'Dietary-intake parallel', recommendation: 'Spermidine', reason: 'Natural dietary sources (wheat germ, legumes) allow partial dietary supplementation; Ca-AKG is not meaningfully obtained from food.' }
        ],
        canStack: 'Yes \u2014 Ca-AKG and Spermidine target complementary cellular-renewal mechanisms and can be stacked. Spermidine\u2019s autophagy induction and Ca-AKG\u2019s mitophagy / epigenetic / TOR effects are biologically distinct. No reported adverse interactions. Typical combinations: Spermidine 1\u20135 mg/day (often from wheat-germ extract) and Ca-AKG 1000 mg/day. As with all emerging-evidence longevity supplements, combined long-term data is lacking; stack for mechanistic breadth with modest expectations for near-term measurable effects.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Mechanism Glossary', url: '../guides/mechanisms.html' }
        ],
        relatedCategories: [
            { title: 'Metabolic Support', url: '../categories/metabolic-support.html' }
        ]
    },
    {
        slug: 'calcium-alpha-ketoglutarate-vs-coq10',
        suppA: 'Calcium Alpha-Ketoglutarate',
        suppB: 'CoQ10',
        title: 'Ca-AKG vs CoQ10: Mitochondrial & Longevity Comparison',
        metaTitle: 'Ca-AKG vs CoQ10 (2026) | Mitochondrial Supplement Comparison',
        metaDescription: 'Compare Calcium Alpha-Ketoglutarate and CoQ10 for mitochondrial function, cardiovascular health, and longevity. Evidence tiers, mechanisms, and human data.',
        domain: 'Mitochondrial Health & Longevity',
        sharedDomains: ['mitochondrial function', 'cellular energy', 'oxidative stress', 'healthy aging'],
        verdict: 'CoQ10 (Tier 2) is an extensively studied mitochondrial electron-transport carrier with decades of clinical evidence in cardiovascular disease, statin-induced myopathy, and heart failure. Ca-AKG (Tier 3) is an emerging TCA-cycle intermediate with rodent lifespan data and a single human DNA-methylation study. These compounds support mitochondria differently: CoQ10 is an electron carrier in the respiratory chain; Ca-AKG provides TCA-cycle substrate, engages TOR and ATP synthase, and acts as an epigenetic cofactor. CoQ10 is the clinically validated mitochondrial supplement; Ca-AKG is the longevity-research candidate.',
        whoShouldChoose: [
            { scenario: 'Heart failure or statin-related muscle symptoms', recommendation: 'CoQ10', reason: 'Strongest clinical evidence base; decades of trials supporting cardiovascular indications.' },
            { scenario: 'Biological-age / epigenetic goals', recommendation: 'Ca-AKG', reason: 'Only Ca-AKG has published (preliminary) human biological-age data and epigenetic-cofactor mechanism.' },
            { scenario: 'Proven clinical safety profile', recommendation: 'CoQ10', reason: 'Excellent long-term safety record in large RCTs across cardiovascular indications.' },
            { scenario: 'Caloric-restriction / TOR mimicry', recommendation: 'Ca-AKG', reason: 'Direct ATP synthase / TOR engagement is a Ca-AKG-specific mechanism.' },
            { scenario: 'Migraine prophylaxis', recommendation: 'CoQ10', reason: 'Multiple RCTs support CoQ10 for migraine frequency reduction \u2014 no equivalent Ca-AKG data.' },
            { scenario: 'Budget', recommendation: 'CoQ10', reason: 'Ubiquinol and ubiquinone formulations are widely available at competitive prices.' }
        ],
        canStack: 'Yes \u2014 Ca-AKG and CoQ10 complement each other well: CoQ10 supports the function of existing mitochondria (electron transport), while Ca-AKG supports TCA-cycle substrate supply, mitophagy of damaged mitochondria, and downstream epigenetic regulation. Typical stacking: CoQ10 100\u2013300 mg/day (ubiquinol form for better absorption) and Ca-AKG 1000 mg/day, both with food. No reported adverse interactions. This combination is reasonable for users prioritising mitochondrial health and longevity.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Cardiovascular Health Guide', url: '../guides/cardiovascular.html' }
        ],
        relatedCategories: [
            { title: 'Metabolic Support', url: '../categories/metabolic-support.html' },
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'ergothioneine-vs-urolithin-a',
        suppA: 'Ergothioneine',
        suppB: 'Urolithin A',
        title: 'Ergothioneine vs Urolithin A: Mushroom Antioxidant vs Pomegranate Postbiotic',
        metaTitle: 'Ergothioneine vs Urolithin A (2026) | Longevity Antioxidants Compared',
        metaDescription: 'Compare Ergothioneine and Urolithin A for longevity, mitochondrial protection, and tissue antioxidant defense. Evidence tiers, mechanisms, dosing and human data side-by-side.',
        domain: 'Longevity & Mitochondrial Antioxidants',
        sharedDomains: ['mitochondrial protection', 'longevity', 'oxidative stress reduction', 'healthy aging'],
        verdict: 'Urolithin A (Tier 2) leads on completed human RCT evidence with placebo-controlled trials in middle-aged adults showing improved muscle endurance and mitochondrial gene expression. Ergothioneine (Tier 3) has the stronger long-term mortality signal \u2014 a 21-year prospective cohort (Smith 2020, Heart, n=3236) tying higher plasma levels to reduced cardiovascular and overall mortality \u2014 plus a small completed pilot RCT in mild cognitive impairment. Both are mitochondrial antioxidants with distinct mechanisms: Urolithin A directly induces mitophagy; Ergothioneine accumulates in mitochondria via OCTN1, scavenges hydroxyl radicals, and directly activates the mitochondrial enzyme MPST.',
        whoShouldChoose: [
            { scenario: 'Strongest completed human RCT evidence', recommendation: 'Urolithin A', reason: 'Singh 2022 (JAMA Network Open) and Liu 2022 are double-blind placebo-controlled trials in middle-aged adults; Ergothioneine has a single n=19 pilot.' },
            { scenario: 'Cardiovascular mortality risk reduction', recommendation: 'Ergothioneine', reason: 'Smith 2020 (Heart) shows HR=0.79 cardiovascular mortality and HR=0.86 all-cause mortality per 1 SD higher plasma ergothioneine over 21.4 years (n=3236).' },
            { scenario: 'Tissue retention without daily dosing', recommendation: 'Ergothioneine', reason: 'OCTN1-mediated tissue accumulation gives ergothioneine a half-life of weeks-to-months; Urolithin A levels fluctuate with dosing.' },
            { scenario: 'Direct mitophagy induction', recommendation: 'Urolithin A', reason: 'Mitophagy is the primary mechanism, demonstrated in human muscle biopsies.' },
            { scenario: 'Cognitive decline prevention in MCI', recommendation: 'Ergothioneine', reason: 'Yau 2024 pilot RCT in n=19 MCI subjects showed improved learning and stabilized neurofilament light chain over 12 months.' },
            { scenario: 'Budget', recommendation: 'Ergothioneine', reason: 'Generic L-ergothioneine at 5\u201310 mg/day costs $25\u2013$60/month; Urolithin A (Mitopure) is premium-priced.' }
        ],
        canStack: 'Yes \u2014 Ergothioneine and Urolithin A are biochemically distinct mitochondrial antioxidants with no known interactions and complementary mechanisms. Urolithin A induces mitophagy of damaged mitochondria; Ergothioneine accumulates inside surviving mitochondria via OCTN1, activates MPST, and scavenges hydroxyl radicals on-site. Typical stacking: Urolithin A 500\u20131000 mg/day with food and Ergothioneine 5\u201325 mg/day. No reported adverse interactions. Combined RCT data does not yet exist; stack for mechanistic breadth across both mitochondrial turnover and intra-mitochondrial redox protection.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Mechanism Glossary', url: '../guides/mechanisms.html' }
        ],
        relatedCategories: [
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'ergothioneine-vs-glutathione',
        suppA: 'Ergothioneine',
        suppB: 'Glutathione',
        title: 'Ergothioneine vs Glutathione: Network Antioxidants Compared',
        metaTitle: 'Ergothioneine vs Glutathione (2026) | Cellular Antioxidant Comparison',
        metaDescription: 'Compare Ergothioneine and Glutathione as cellular antioxidants. Bioavailability, tissue retention, mechanisms, evidence tiers and dosing side-by-side.',
        domain: 'Cellular Antioxidant Defense',
        sharedDomains: ['oxidative stress reduction', 'cellular cytoprotection', 'detoxification support', 'healthy aging'],
        verdict: 'Glutathione (Tier 2) is the most abundant endogenous cellular antioxidant with extensive clinical literature, but oral glutathione has historically poor bioavailability \u2014 most studied formulations are liposomal, sublingual or precursor-based (NAC, GlyNAC). Ergothioneine (Tier 3) has the opposite profile: it is highly bioavailable orally and retained in tissues for weeks via the OCTN1/SLC22A4 transporter, but the human evidence base is thinner (one large prospective cohort + one small pilot RCT). They occupy complementary positions in the cellular antioxidant network: glutathione is the workhorse intracellular reducing agent, ergothioneine acts as a backup scavenger that accumulates specifically in oxidatively-stressed tissues and helps recycle oxidised glutathione.',
        whoShouldChoose: [
            { scenario: 'Cellular detoxification support', recommendation: 'Glutathione', reason: 'Glutathione is the central substrate for hepatic Phase II conjugation reactions and the workhorse intracellular reductant.' },
            { scenario: 'Reliable oral bioavailability and tissue retention', recommendation: 'Ergothioneine', reason: 'OCTN1-mediated active uptake gives ergothioneine weeks-to-months tissue half-life; oral glutathione is rapidly degraded and poorly absorbed.' },
            { scenario: 'Long-term mortality / cardiovascular signal', recommendation: 'Ergothioneine', reason: 'Smith 2020 (Heart, n=3236) shows long-term inverse association with cardiovascular and all-cause mortality \u2014 no equivalent prospective dataset for plasma glutathione.' },
            { scenario: 'Acute oxidative-stress events (ischaemia, paracetamol toxicity)', recommendation: 'Glutathione (or NAC precursor)', reason: 'Glutathione repletion via NAC has emergency-medicine indications; no equivalent acute role for ergothioneine.' },
            { scenario: 'Targeting immune-cell antioxidant defense (neutrophils, monocytes)', recommendation: 'Ergothioneine', reason: 'OCTN1 expression concentrates ergothioneine in neutrophils, monocytes and macrophages \u2014 cells with high oxidative burst.' },
            { scenario: 'Budget and convenience', recommendation: 'Ergothioneine', reason: 'Effective doses are 5\u201330 mg/day and tissue retention allows intermittent dosing; clinically meaningful glutathione products are typically more expensive per effective dose.' }
        ],
        canStack: 'Yes \u2014 Ergothioneine and Glutathione (or its precursors NAC/GlyNAC) are highly compatible. Ergothioneine concentrates inside oxidatively-stressed tissues and is reported to support the reduced glutathione regeneration cycle, so the two can act as a coordinated network rather than compete. Typical stacking: Ergothioneine 5\u201325 mg/day plus liposomal glutathione 250\u20131000 mg/day or GlyNAC at trial-validated doses. No reported adverse interactions. The stack is reasonable for users prioritising cellular antioxidant breadth.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Mechanism Glossary', url: '../guides/mechanisms.html' }
        ],
        relatedCategories: [
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'ergothioneine-vs-calcium-alpha-ketoglutarate',
        suppA: 'Ergothioneine',
        suppB: 'Calcium Alpha-Ketoglutarate',
        title: 'Ergothioneine vs Ca-AKG: Two Emerging Longevity Compounds Compared',
        metaTitle: 'Ergothioneine vs Ca-AKG (2026) | Longevity Vitamin Comparison',
        metaDescription: 'Compare Ergothioneine (longevity vitamin) and Calcium Alpha-Ketoglutarate (Ca-AKG) for healthy aging. Mechanisms, evidence tiers, human data and dosing side-by-side.',
        domain: 'Healthy Aging & Longevity',
        sharedDomains: ['longevity', 'mitochondrial function', 'oxidative stress reduction', 'healthy aging'],
        verdict: 'Both Ergothioneine (Tier 3) and Ca-AKG (Tier 3) sit at the Emerging end of the longevity-evidence spectrum, with strong rodent lifespan data but limited completed human trials. Ergothioneine has the larger long-term human cohort signal (Smith 2020, n=3236, 21.4yr inverse association with cardiovascular and all-cause mortality) plus a 12-month placebo-controlled pilot RCT in MCI; Ca-AKG has the Demidenko 2021 retrospective DNA-methylation clock reduction signal (n=42, ~7 months). They act through fundamentally different mechanisms: Ergothioneine is a tissue-retained antioxidant with direct MPST mitochondrial activation, while Ca-AKG operates through TCA-cycle replenishment, ATP synthase / TOR inhibition, and \u03b1-KG-dependent epigenetic demethylation.',
        whoShouldChoose: [
            { scenario: 'Long-term mortality risk reduction signal', recommendation: 'Ergothioneine', reason: 'Smith 2020 (Heart) is a 21-year prospective cohort with an HR=0.86 all-cause mortality association \u2014 no equivalent dataset for Ca-AKG.' },
            { scenario: 'Biological-age clock reduction signal', recommendation: 'Ca-AKG', reason: 'Demidenko 2021 retrospective TruAge analysis is the only human DNA-methylation clock signal among longevity-class supplements.' },
            { scenario: 'Cognitive aging support (RCT-tested)', recommendation: 'Ergothioneine', reason: 'Yau 2024 pilot RCT in MCI subjects showed improved learning and stabilized neurofilament light chain.' },
            { scenario: 'TOR / caloric-restriction mimicry', recommendation: 'Ca-AKG', reason: 'Direct ATP synthase binding and TOR pathway downregulation (Chin 2014, Nature) is Ca-AKG specific.' },
            { scenario: 'Bone health support (preclinical)', recommendation: 'Ca-AKG', reason: 'Wang 2020 (Nat Commun) shows histone-demethylation-mediated bone density restoration in aged mice.' },
            { scenario: 'Mitochondrial accumulation and exercise capacity', recommendation: 'Ergothioneine', reason: 'Sprenger 2025 (Cell Metab) identifies MPST as the direct ergothioneine target driving mitochondrial respiration and exercise performance.' },
            { scenario: 'Lowest-dose / convenience', recommendation: 'Ergothioneine', reason: 'Effective dose is 5\u201325 mg/day; Ca-AKG protocols use 1000 mg/day.' }
        ],
        canStack: 'Yes \u2014 Ergothioneine and Ca-AKG act through largely independent longevity mechanisms (antioxidant tissue accumulation + MPST activation vs. TCA-cycle replenishment + TOR / epigenetic effects) and are reasonable to stack for mechanistic breadth. Typical stacking: Ergothioneine 5\u201325 mg/day plus Ca-AKG 1000 mg/day, both with food. No reported adverse interactions. As with most emerging-evidence longevity stacks, combined RCT data is not yet available \u2014 expectations should be modest in the near term.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Mechanism Glossary', url: '../guides/mechanisms.html' }
        ],
        relatedCategories: [
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'sulforaphane-vs-turmeric-curcumin',
        suppA: 'Sulforaphane',
        suppB: 'Turmeric/Curcumin',
        title: 'Sulforaphane vs Curcumin: Nrf2 vs NF-κB Pathway Comparison',
        metaTitle: 'Sulforaphane vs Curcumin (2026) | Nrf2 vs NF-κB Antioxidants Compared',
        metaDescription: 'Compare Sulforaphane and Curcumin/Turmeric for inflammation, antioxidant defense, and clinical evidence. Mechanisms, evidence tiers, and human trial data side-by-side.',
        domain: 'Cellular Defense & Anti-inflammatory',
        sharedDomains: ['oxidative stress reduction', 'inflammation modulation', 'detoxification', 'chemoprevention'],
        verdict: 'Both Sulforaphane (Tier 2) and Curcumin (Tier 2) sit at the Strong-Evidence level with multiple completed RCTs, but they target complementary pathways. Sulforaphane is the canonical small-molecule Nrf2 activator \u2014 inducing Phase II detoxification enzymes (GST, NQO1, HO-1) and demonstrably enhancing urinary excretion of airborne pollutants in a 291-person Qidong RCT. Curcumin\'s primary mechanism is NF-\u03baB inhibition with secondary anti-inflammatory effects on COX-2 and pro-inflammatory cytokines. Sulforaphane has the strongest unique RCT evidence in autism spectrum disorder (Singh 2014 PNAS, 34% ABC improvement) and lung-cancer chemoprevention (Yuan 2025 Phase II); Curcumin has stronger osteoarthritis and inflammation-marker RCT evidence.',
        whoShouldChoose: [
            { scenario: 'Phase II detoxification of environmental pollutants', recommendation: 'Sulforaphane', reason: 'Egner 2014 Qidong RCT (n=291) demonstrates +61% benzene mercapturic acid excretion via GST induction.' },
            { scenario: 'Chronic joint inflammation / osteoarthritis', recommendation: 'Curcumin', reason: 'Multiple RCTs show curcumin reduces osteoarthritis pain comparable to NSAIDs.' },
            { scenario: 'Autism spectrum disorder behavioural support', recommendation: 'Sulforaphane', reason: 'Singh 2014 PNAS pivotal RCT in young men with moderate-to-severe ASD; no equivalent curcumin evidence.' },
            { scenario: 'NF-\u03baB-driven systemic inflammation', recommendation: 'Curcumin', reason: 'Curcumin is the more direct NF-\u03baB inhibitor; sulforaphane acts primarily through Nrf2.' },
            { scenario: 'Bioavailability without enhancers', recommendation: 'Sulforaphane', reason: 'SFN absorption is good with myrosinase-active formulations; curcumin requires piperine or formulation enhancements.' },
            { scenario: 'Lung-cancer chemoprevention (smokers)', recommendation: 'Sulforaphane', reason: 'Yuan 2025 Phase II RCT showed Ki-67 bronchial proliferation reduction over 12 months.' }
        ],
        canStack: 'Yes \u2014 Sulforaphane and Curcumin engage complementary inflammation/cytoprotection pathways (Nrf2 vs NF-\u03baB) with no reported adverse interactions and are reasonable to stack for breadth. Typical stacking: Sulforaphane 15\u201340 mg/day (myrosinase-active formulation) plus Curcumin 500\u20131000 mg/day (with piperine or phytosome formulation). The combination is widely used in chemoprevention-focused stacks.',
        relatedGuides: [
            { title: 'Cardiovascular Guide', url: '../guides/cardiovascular.html' },
            { title: 'Mechanism Glossary', url: '../guides/mechanisms.html' }
        ],
        relatedCategories: [
            { title: 'Antioxidants', url: '../categories/antioxidants.html' },
            { title: 'Anti-inflammatory', url: '../categories/anti-inflammatory.html' }
        ]
    },
    {
        slug: 'sulforaphane-vs-quercetin',
        suppA: 'Sulforaphane',
        suppB: 'Quercetin',
        title: 'Sulforaphane vs Quercetin: Isothiocyanate vs Polyphenol Antioxidants',
        metaTitle: 'Sulforaphane vs Quercetin (2026) | Two Major Phytochemical Antioxidants',
        metaDescription: 'Compare Sulforaphane (broccoli-derived isothiocyanate) and Quercetin (polyphenol) for cellular defense, allergies, and longevity. Mechanisms, RCTs, dosing.',
        domain: 'Phytochemical Antioxidants',
        sharedDomains: ['antioxidant defense', 'oxidative stress reduction', 'inflammation modulation', 'longevity'],
        verdict: 'Sulforaphane (Tier 2) and Quercetin (Tier 3) are both well-studied phytochemical antioxidants but with very different evidence profiles. Sulforaphane has multiple successful placebo-controlled RCTs in defined indications (ASD, pollutant detoxification, lung-cancer chemoprevention biomarkers, NAFLD insulin resistance) and a thoroughly characterised Nrf2 mechanism. Quercetin has strong in vitro and animal data for senolytic, anti-allergic and anti-inflammatory effects, with emerging human trials in allergic rhinitis, hypertension and exercise recovery, but lacks the RCT density of sulforaphane in any single indication. Both are well-tolerated.',
        whoShouldChoose: [
            { scenario: 'Strong RCT evidence in defined indication', recommendation: 'Sulforaphane', reason: 'ASD, lung chemoprevention, pollutant detoxification all have completed placebo-controlled RCTs.' },
            { scenario: 'Allergic rhinitis or histamine-related symptoms', recommendation: 'Quercetin', reason: 'Quercetin is a mast-cell stabiliser with the most direct anti-allergic profile.' },
            { scenario: 'Senolytic activity (Dasatinib + Quercetin protocol)', recommendation: 'Quercetin', reason: 'Quercetin is part of the most-studied senolytic combination; sulforaphane is not senolytic.' },
            { scenario: 'Phase II detoxification', recommendation: 'Sulforaphane', reason: 'Sulforaphane is the canonical Nrf2 activator with demonstrated Phase II enzyme induction in humans.' },
            { scenario: 'Bioavailability on its own', recommendation: 'Sulforaphane', reason: 'Quercetin oral bioavailability is poor; sulforaphane in myrosinase-active form has good absorption.' },
            { scenario: 'Cardiovascular blood pressure effects', recommendation: 'Quercetin', reason: 'Quercetin meta-analyses show modest blood-pressure-lowering effects.' }
        ],
        canStack: 'Yes \u2014 Sulforaphane and Quercetin engage different antioxidant pathways (Nrf2 induction vs direct radical scavenging + mast-cell stabilisation) and can be stacked for breadth. Typical stacking: Sulforaphane 15\u201340 mg/day plus Quercetin 500\u20131000 mg/day (with bromelain or vitamin C for absorption). No significant adverse interactions reported.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Mechanism Glossary', url: '../guides/mechanisms.html' }
        ],
        relatedCategories: [
            { title: 'Antioxidants', url: '../categories/antioxidants.html' },
            { title: 'Polyphenols', url: '../categories/polyphenols.html' }
        ]
    },
    {
        slug: 'sulforaphane-vs-glutathione',
        suppA: 'Sulforaphane',
        suppB: 'Glutathione',
        title: 'Sulforaphane vs Glutathione: Nrf2 Activator vs Master Antioxidant',
        metaTitle: 'Sulforaphane vs Glutathione (2026) | Cellular Antioxidant Comparison',
        metaDescription: 'Compare Sulforaphane (Nrf2 activator) and Glutathione (master cellular antioxidant). Bioavailability, mechanisms, RCTs, and dosing side-by-side.',
        domain: 'Cellular Antioxidant Defense',
        sharedDomains: ['glutathione system', 'oxidative stress reduction', 'detoxification', 'cellular cytoprotection'],
        verdict: 'Sulforaphane (Tier 2) and Glutathione (Tier 2) play complementary roles in the cellular antioxidant network. Sulforaphane is an inducer \u2014 it activates Nrf2 to upregulate the cell\'s own glutathione synthesis machinery and Phase II detoxification enzymes. Glutathione is the substrate \u2014 the master intracellular reductant that performs the actual radical-neutralising work. Sulforaphane has stronger RCT evidence base across diverse indications; oral glutathione has notoriously poor bioavailability and most clinical evidence comes from liposomal formulations or precursor strategies (NAC, GlyNAC).',
        whoShouldChoose: [
            { scenario: 'Inducing the cell\'s own antioxidant machinery', recommendation: 'Sulforaphane', reason: 'Activates Nrf2 to upregulate glutathione synthesis enzymes, GST, NQO1, HO-1.' },
            { scenario: 'Acute glutathione repletion (paracetamol toxicity, ICU oxidative stress)', recommendation: 'Glutathione (or NAC precursor)', reason: 'Direct repletion via NAC has emergency-medicine indications.' },
            { scenario: 'Bioavailability of orally consumed product', recommendation: 'Sulforaphane', reason: 'Oral SFN (myrosinase-active) is well-absorbed; oral glutathione is poorly absorbed.' },
            { scenario: 'Strongest indication-specific RCT evidence', recommendation: 'Sulforaphane', reason: 'Multiple successful RCTs in ASD, pollutant detoxification, lung chemoprevention.' },
            { scenario: 'Aging / sarcopenia (GlyNAC variant)', recommendation: 'GlyNAC (precursor strategy)', reason: 'Sekhar lab geriatric trials of glycine + NAC show specific benefits in older adults.' },
            { scenario: 'Phase II xenobiotic detoxification', recommendation: 'Sulforaphane', reason: 'Egner 2014 demonstrated significant urinary mercapturic acid excretion in 291-person trial.' }
        ],
        canStack: 'Yes \u2014 Sulforaphane and Glutathione (or its precursors NAC/GlyNAC) are highly complementary: sulforaphane induces the synthesis machinery while glutathione/precursors provide substrate. Typical stacking: Sulforaphane 15\u201340 mg/day plus liposomal glutathione 250\u20131000 mg/day or GlyNAC at trial-validated doses. The stack is reasonable for users prioritising deep cellular antioxidant support.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Mechanism Glossary', url: '../guides/mechanisms.html' }
        ],
        relatedCategories: [
            { title: 'Antioxidants', url: '../categories/antioxidants.html' }
        ]
    },
    {
        slug: 'glycine-vs-glynac',
        suppA: 'Glycine',
        suppB: 'GlyNAC',
        title: 'Glycine vs GlyNAC: Single Amino Acid vs Combination Precursor',
        metaTitle: 'Glycine vs GlyNAC (2026) | When to Choose Each',
        metaDescription: 'Compare standalone Glycine vs the GlyNAC (Glycine + N-Acetylcysteine) combination for sleep, cognition, glutathione, and aging. Mechanisms, RCTs and dosing side-by-side.',
        domain: 'Amino Acid Supplementation Strategy',
        sharedDomains: ['glutathione synthesis', 'longevity', 'oxidative stress reduction', 'cognitive support'],
        verdict: 'Glycine (Tier 3) and GlyNAC (Tier 3) overlap by design \u2014 GlyNAC is a fixed glycine + N-acetylcysteine (NAC) combination dosed and trialled specifically as a geroscience intervention by the Sekhar lab at Baylor. Pure glycine has its own evidence base (sleep at 3 g pre-bed; cognition; collagen substrate) and is much cheaper. GlyNAC has the strongest geroscience-aging RCT data (Kumar 2023 J Gerontol A, n=24, 16 weeks, broad reversal of aging hallmarks) but cannot isolate the glycine vs NAC contribution. Use glycine alone for sleep, cognition, collagen support, and budget-sensitive precursor intake. Use GlyNAC for the trial-validated geroscience protocol.',
        whoShouldChoose: [
            { scenario: 'Sleep quality (3 g pre-bed)', recommendation: 'Glycine', reason: 'Bannai program established 3 g pre-bed glycine alone for sleep \u2014 GlyNAC is not the right dose form.' },
            { scenario: 'Trial-validated aging-hallmark reversal protocol', recommendation: 'GlyNAC', reason: 'Kumar 2023 randomized placebo-controlled trial used the fixed 0.1 g/kg/day each of glycine + NAC.' },
            { scenario: 'NMDA cognitive support', recommendation: 'Glycine', reason: 'File 1999 cognition RCT used pure glycine; NAC adds different chemistry.' },
            { scenario: 'Glutathione substrate restoration', recommendation: 'GlyNAC', reason: 'Cysteine (via NAC) is rate-limiting for GSH synthesis alongside glycine; NAC closes the substrate loop.' },
            { scenario: 'Collagen synthesis support', recommendation: 'Glycine', reason: 'Pure glycine at 2\u201310 g/day is the substrate; NAC is unrelated to collagen.' },
            { scenario: 'Budget', recommendation: 'Glycine', reason: 'Generic L-glycine powder is a fraction of the cost of branded GlyNAC formulations.' }
        ],
        canStack: 'Choosing GlyNAC effectively means glycine + NAC as a combination. Stacking pure glycine with separate NAC is functionally similar to GlyNAC but lets the user titrate doses independently \u2014 useful for users wanting 3 g pre-bed glycine for sleep plus daytime NAC for glutathione precursor support. No reported adverse interactions between glycine and NAC.',
        relatedGuides: [
            { title: 'Longevity Guide', url: '../guides/longevity.html' },
            { title: 'Sleep Guide', url: '../guides/sleep.html' }
        ],
        relatedCategories: [
            { title: 'Amino Acids', url: '../categories/amino-acids.html' }
        ]
    },
    {
        slug: 'glycine-vs-l-theanine',
        suppA: 'Glycine',
        suppB: 'L-Theanine',
        title: 'Glycine vs L-Theanine: Two Amino Acid Sleep Aids Compared',
        metaTitle: 'Glycine vs L-Theanine (2026) | Amino Acid Sleep Comparison',
        metaDescription: 'Compare Glycine (3 g pre-bed) and L-Theanine for sleep quality, anxiety reduction, and cognitive support. Mechanisms, RCT evidence, dosing.',
        domain: 'Sleep Quality & Calm',
        sharedDomains: ['sleep quality', 'cognitive support', 'NMDA modulation', 'amino acid biology'],
        verdict: 'Glycine (Tier 3) and L-Theanine (Tier 2) are two amino acid-class supplements with complementary sleep-and-calm profiles. L-Theanine acts during the day as a relaxation/focus modulator (alpha-wave EEG, mild anxiolysis) and is used widely with caffeine for jitter-free focus; glycine is specifically a pre-bed sleep agent that lowers core body temperature and improves subjective sleep quality at 3 g. L-Theanine has more RCTs across anxiety, sleep onset and stress; glycine has the more specific pre-sleep thermoregulatory mechanism and is much cheaper at the gram-scale doses required.',
        whoShouldChoose: [
            { scenario: 'Pre-bed sleep onset improvement', recommendation: 'Glycine', reason: 'Bannai program established 3 g pre-bed glycine specifically for sleep onset and quality.' },
            { scenario: 'Daytime relaxation without sedation', recommendation: 'L-Theanine', reason: 'L-theanine 100\u2013200 mg is widely used during the day for calm focus, often paired with caffeine.' },
            { scenario: 'Anxiety reduction', recommendation: 'L-Theanine', reason: 'Multiple RCTs support L-theanine for stress and anxiety; glycine is not primarily an anxiolytic.' },
            { scenario: 'Sustained-attention support in middle age', recommendation: 'Glycine', reason: 'File 1999 RCT showed glycine improved sustained attention in middle-aged men (Bioglycin).' },
            { scenario: 'Glutathione precursor strategy', recommendation: 'Glycine', reason: 'Glycine is a rate-limiting GSH substrate; L-theanine is not.' },
            { scenario: 'Pairing with caffeine', recommendation: 'L-Theanine', reason: 'L-Theanine + caffeine is the canonical jitter-free focus stack.' }
        ],
        canStack: 'Yes \u2014 Glycine and L-Theanine target different times of day and different mechanisms (pre-bed thermoregulation vs daytime alpha-wave calm). Typical stacking: L-Theanine 100\u2013200 mg in the morning/afternoon plus 3 g glycine 30\u201360 minutes pre-bed. No reported adverse interactions.',
        relatedGuides: [
            { title: 'Sleep Guide', url: '../guides/sleep.html' },
            { title: 'Anxiety & Stress Guide', url: '../guides/anxiety-stress.html' }
        ],
        relatedCategories: [
            { title: 'Amino Acids', url: '../categories/amino-acids.html' },
            { title: 'Sleep Support', url: '../categories/sleep-support.html' }
        ]
    },
    {
        slug: 'glycine-vs-collagen-peptides',
        suppA: 'Glycine',
        suppB: 'Collagen Peptides',
        title: 'Glycine vs Collagen Peptides: Single Amino Acid vs Whole Peptide Mix',
        metaTitle: 'Glycine vs Collagen Peptides (2026) | Connective-Tissue Support Compared',
        metaDescription: 'Compare standalone Glycine and Collagen Peptides for skin, joint, and bone support. Glycine is 33% of collagen by mass. Mechanisms, RCTs, dosing.',
        domain: 'Connective Tissue & Skin Support',
        sharedDomains: ['collagen synthesis', 'skin elasticity', 'joint support', 'bone matrix'],
        verdict: 'Glycine (Tier 3) and Collagen Peptides (Tier 2) overlap because glycine is 33% of collagen by mass \u2014 every third amino acid in the collagen sequence is glycine. Hydrolysed collagen peptides supply glycine plus proline, hydroxyproline and the di-/tri-peptide bioactive fragments (Pro-Hyp, Hyp-Gly) that have signalling effects on fibroblasts and chondrocytes. Pure glycine alone provides only the substrate, not the bioactive collagen peptides. Collagen peptides have stronger RCT evidence specifically for skin elasticity, joint pain and bone mineral density; pure glycine has broader applicability (sleep, cognition, GSH precursor) and is much cheaper.',
        whoShouldChoose: [
            { scenario: 'Skin elasticity / wrinkle reduction', recommendation: 'Collagen Peptides', reason: 'Multiple RCTs show hydrolysed collagen improves skin elasticity, hydration and wrinkle metrics; the bioactive peptides matter beyond the amino-acid mix.' },
            { scenario: 'Sleep quality at 3 g pre-bed', recommendation: 'Glycine', reason: 'Standalone glycine is the validated pre-bed sleep dose; collagen peptides are typically taken differently.' },
            { scenario: 'Joint pain in athletes / osteoarthritis', recommendation: 'Collagen Peptides', reason: 'Bioactive collagen peptides have RCT evidence for joint pain reduction.' },
            { scenario: 'Glutathione precursor strategy', recommendation: 'Glycine', reason: 'Glycine alone is the rate-limiting GSH substrate; collagen peptides include glycine but at lower per-dose efficiency.' },
            { scenario: 'Postmenopausal bone mineral density', recommendation: 'Collagen Peptides', reason: 'Specific bioactive collagen peptides (BCP) have RCT-level BMD evidence in postmenopausal women.' },
            { scenario: 'Budget for amino-acid substrate', recommendation: 'Glycine', reason: 'Generic L-glycine powder is much cheaper per gram than collagen peptides.' }
        ],
        canStack: 'Yes \u2014 Glycine and Collagen Peptides are highly compatible. Collagen peptides supply the bioactive fragments and the full collagen-amino-acid profile; supplemental glycine boosts total dietary glycine for sleep and additional substrate availability. Typical stacking: 10\u201320 g/day collagen peptides plus 3 g glycine pre-bed for sleep. No reported adverse interactions.',
        relatedGuides: [
            { title: 'Joint Health Guide', url: '../guides/joint-health.html' },
            { title: 'Recovery Guide', url: '../guides/recovery.html' }
        ],
        relatedCategories: [
            { title: 'Amino Acids', url: '../categories/amino-acids.html' },
            { title: 'Joint Support', url: '../categories/joint-support.html' }
        ]
    }
];

// ── Emoji Mapping ──────────────────────────────────────────────────────────

const SUPPLEMENT_EMOJIS = {
    "Lion's Mane Mushroom": '🍄',
    'Bacopa monnieri': '🌿',
    'Ashwagandha': '🌙',
    'Rhodiola rosea': '🏔️',
    'Melatonin': '🌛',
    'Magnesium': '🪨',
    'Omega-3 Fatty Acids': '🐟',
    'CoQ10': '⚡',
    'PQQ': '🔬',
    'Ginkgo Biloba': '🍃',
    'Creatine': '💪',
    'Beta-Alanine': '🔥',
    'Vitamin D3': '☀️',
    'Vitamin D': '☀️',
    'Turmeric/Curcumin': '🟡',
    'Turmeric': '🟡',
    'Boswellia': '🌲',
    'L-Theanine': '🍵',
    '5-HTP': '😌',
    'Caffeine': '☕',
    'Zinc': '⚗️',
    'Iron': '🧲',
    'Vitamin C': '🍊',
    'Vitamin B12': '💊',
    'Probiotics': '🦠',
    'Collagen': '🧬',
    'Berberine': '🌾',
    'Resveratrol': '🍇',
    'NAD+': '🔋',
    'Alpha-Lipoic Acid': '⚡',
    'GABA': '🧘',
    'Valerian Root': '🌸',
    'Passionflower': '🌺',
    'Inulin': '🌾',
    'Calcium Alpha-Ketoglutarate': '⚗️',
    'Ergothioneine': '🍄',
    'Sulforaphane': '🥦',
    'Glycine': '🧬',
    'NMN (Nicotinamide Mononucleotide)': '🔋',
    'Urolithin A': '🪷',
    'Spermidine': '🌾',
    'Akkermansia muciniphila': '🦠',
    'Glucosamine': '🦴',
    'Chondroitin Sulfate': '🦴',
    'Lutein': '👁️',
    'Zeaxanthin': '👁️',
    'Quercetin': '🍎',
    'Grape Seed Extract': '🍇',
    'Elderberry': '🫐',
    'Black Seed Oil': '🌑'
};

const CATEGORY_EMOJIS = {
    'Nootropic': '🧠',
    'Adaptogen': '🌿',
    'Anti-inflammatory': '🛡️',
    'Essential Nutrients': '💊',
    'Antioxidant': '⚡',
    'Performance Enhancers': '💪',
    'Amino Acids': '🧬',
    'Herbal Extracts': '🌿',
    'Mineral': '⚗️',
    'Vitamins': '☀️',
    'Probiotic': '🦠',
    'Sleep Support': '🌙',
    'Cardiovascular': '❤️'
};

function getSupplementEmoji(name, category) {
    return SUPPLEMENT_EMOJIS[name] || CATEGORY_EMOJIS[category] || '🔬';
}

// ── Compare Page CSS ────────────────────────────────────────────────────────

const COMPARE_CSS = `:root {
    --accent: #2d5a3d;
    --accent-light: #3a7a52;
    --accent-bg: #f0f7f2;
    --accent-dark: #1e3e2b;
    --blue: #2563eb;
    --blue-bg: #eff6ff;
    --text-primary: #1a1a2e;
    --text-secondary: #4a4a6a;
    --text-muted: #6b7280;
    --border: #e5e7eb;
    --bg-page: #fafaf8;
    --bg-card: #ffffff;
    --bg-nav: #1a1a2e;
    --radius: 10px;
    --serif: 'Source Serif 4', Georgia, serif;
    --sans: 'DM Sans', system-ui, sans-serif;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
    --col-width: 720px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: var(--bg-page); color: var(--text-primary); font-family: var(--sans); font-size: 16px; line-height: 1.75; -webkit-font-smoothing: antialiased; }
.nav { background: var(--bg-nav); position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; display: flex; align-items: center; justify-content: space-between; height: 58px; }
.nav-brand { color: #fff; font-weight: 700; font-size: 1rem; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
.nav-links { display: flex; gap: 1.25rem; align-items: center; }
.nav-links a { color: rgba(255,255,255,0.65); font-size: 0.875rem; text-decoration: none; transition: color 0.15s; }
.nav-links a:hover { color: #fff; }
.progress-track { position: sticky; top: 58px; z-index: 90; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.progress-track-inner { max-width: var(--col-width); margin: 0 auto; padding: 0 1.5rem; display: flex; align-items: center; gap: 0; overflow-x: auto; scrollbar-width: none; }
.progress-track-inner::-webkit-scrollbar { display: none; }
.progress-step { flex-shrink: 0; display: flex; align-items: center; gap: 0; }
.progress-step a { display: flex; align-items: center; gap: 0.375rem; padding: 0.625rem 0.75rem; font-size: 0.75rem; font-weight: 500; color: var(--text-muted); text-decoration: none; white-space: nowrap; border-bottom: 2px solid transparent; transition: all 0.2s; }
.progress-step a:hover { color: var(--accent); }
.progress-step a.active { color: var(--accent); border-bottom-color: var(--accent); }
.progress-step .step-num { display: inline-flex; align-items: center; justify-content: center; width: 1.25rem; height: 1.25rem; background: var(--border); border-radius: 50%; font-size: 0.65rem; font-weight: 700; color: var(--text-muted); transition: all 0.2s; }
.progress-step a.active .step-num { background: var(--accent); color: #fff; }
.progress-divider { width: 1.5rem; height: 1px; background: var(--border); flex-shrink: 0; }
.hero { background: linear-gradient(160deg, var(--accent-dark) 0%, #1a1a2e 60%, #0f1629 100%); position: relative; overflow: hidden; padding: 0; }
.hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 50%, rgba(45,90,61,0.35) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(37,99,235,0.15) 0%, transparent 60%); }
.hero-inner { position: relative; max-width: var(--col-width); margin: 0 auto; padding: 3.5rem 1.5rem 3rem; }
.hero-breadcrumb { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: rgba(255,255,255,0.45); margin-bottom: 1.75rem; }
.hero-breadcrumb a { color: rgba(255,255,255,0.55); text-decoration: none; }
.hero-breadcrumb a:hover { color: rgba(255,255,255,0.85); }
.hero-breadcrumb .sep { font-size: 0.6rem; }
.hero-vs-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: center; margin-bottom: 1.75rem; }
.hero-supp { padding: 1.25rem 1.5rem; border-radius: var(--radius); }
.hero-supp-a { background: rgba(45,90,61,0.3); border: 1px solid rgba(45,90,61,0.5); }
.hero-supp-b { background: rgba(37,99,235,0.2); border: 1px solid rgba(37,99,235,0.35); }
.hero-supp-emoji { font-size: 2rem; line-height: 1; margin-bottom: 0.5rem; }
.hero-supp-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.375rem; }
.hero-supp-a .hero-supp-label { color: rgba(160,220,180,0.9); }
.hero-supp-b .hero-supp-label { color: rgba(147,197,253,0.9); }
.hero-supp-name { font-family: var(--serif); font-size: 1.2rem; font-weight: 700; color: #fff; line-height: 1.25; margin-bottom: 0.375rem; }
.hero-supp-sci { font-family: var(--serif); font-style: italic; font-size: 0.8rem; color: rgba(255,255,255,0.5); }
.hero-vs-divider { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.vs-line { width: 1px; height: 2rem; background: rgba(255,255,255,0.15); }
.vs-text { font-family: var(--serif); font-size: 1.125rem; font-weight: 700; color: rgba(255,255,255,0.4); line-height: 1; }
.hero-title { font-family: var(--serif); font-size: 1.625rem; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 0.875rem; }
.hero-sub { font-size: 0.95rem; color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 1.5rem; max-width: 540px; }
.hero-meta-row { display: flex; flex-wrap: wrap; gap: 0.625rem; }
.hero-chip { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.75rem; border: 1px solid rgba(255,255,255,0.2); border-radius: 100px; font-size: 0.75rem; color: rgba(255,255,255,0.65); }
.hero-chip i { color: rgba(255,255,255,0.4); }
.page-content { max-width: var(--col-width); margin: 0 auto; padding: 0 1.5rem; }
.meta-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
.trust-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.trust-chip { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
.trust-chip i { color: var(--accent); font-size: 0.7rem; }
.share-btns { display: flex; gap: 0.5rem; }
.share-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.75rem; border: 1px solid var(--border); border-radius: 100px; background: transparent; color: var(--text-muted); font-family: var(--sans); font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.share-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-bg); }
.section { margin-bottom: 3.5rem; scroll-margin-top: 110px; }
.section-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
.section-num { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; margin-top: 0.125rem; }
.section-num-circle { width: 2rem; height: 2rem; border-radius: 50%; background: var(--accent-bg); border: 2px solid var(--accent); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: var(--accent); }
.section-num-line { width: 2px; flex: 1; min-height: 1.5rem; background: linear-gradient(to bottom, var(--accent), transparent); margin-top: 4px; }
.section-heading-group { flex: 1; }
.section-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 0.2rem; }
.section h2 { font-family: var(--serif); font-size: 1.375rem; font-weight: 700; color: var(--text-primary); line-height: 1.3; margin: 0; }
.verdict-card { background: linear-gradient(135deg, var(--accent-bg) 0%, #e8f0eb 100%); border: 1px solid rgba(45,90,61,0.25); border-left: 4px solid var(--accent); border-radius: var(--radius); padding: 1.5rem 1.75rem; }
.verdict-card p { color: var(--text-primary); font-size: 1rem; line-height: 1.8; margin: 0; }
.split-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow-sm); margin: 1.25rem 0; }
.split-side { padding: 1.375rem 1.5rem; }
.split-side-a { background: linear-gradient(135deg, #f0f7f2 0%, #e8f4ed 100%); border-right: 1px solid var(--border); }
.split-side-b { background: linear-gradient(135deg, #eff6ff 0%, #e0edff 100%); }
.split-side-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.875rem; padding-bottom: 0.75rem; border-bottom: 1px solid; }
.split-side-a .split-side-header { border-bottom-color: rgba(45,90,61,0.2); }
.split-side-b .split-side-header { border-bottom-color: rgba(37,99,235,0.2); }
.split-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.split-dot-a { background: var(--accent); }
.split-dot-b { background: var(--blue); }
.split-name { font-family: var(--serif); font-size: 0.925rem; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
.split-name a { color: inherit; text-decoration: none; }
.split-meta { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.625rem; }
.split-sub-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-muted); margin-bottom: 0.375rem; }
.split-list { list-style: none; padding: 0; margin: 0; }
.split-list li { font-size: 0.82rem; color: var(--text-secondary); padding: 0.275rem 0; border-bottom: 1px solid rgba(0,0,0,0.05); line-height: 1.5; }
.split-list li:last-child { border-bottom: none; }
.split-list strong { color: var(--text-primary); }
.compare-table-wrap { border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow-sm); margin: 1.25rem 0; overflow-x: auto; }
.compare-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; background: #fff; }
.compare-table th { padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; text-align: left; }
.compare-table th:first-child { background: #f9fafb; color: var(--text-muted); border-right: 1px solid var(--border); }
.compare-table th.col-a { background: #e8f4ed; color: var(--accent); }
.compare-table th.col-b { background: #e0edff; color: var(--blue); }
.compare-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); color: var(--text-secondary); vertical-align: top; }
.compare-table td:first-child { background: #f9fafb; font-size: 0.8rem; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border); white-space: nowrap; }
.compare-table td.col-a-data { background: rgba(240,247,242,0.4); }
.compare-table td.col-b-data { background: rgba(239,246,255,0.4); }
.compare-table tr:last-child td { border-bottom: none; }
.decision-cards { display: flex; flex-direction: column; gap: 0.75rem; margin: 1.25rem 0; }
.decision-card { display: grid; grid-template-columns: auto 1fr 1fr; gap: 0; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: #fff; }
.decision-goal { padding: 0.875rem 1rem; background: #f9fafb; font-size: 0.85rem; font-weight: 600; color: var(--text-primary); border-right: 1px solid var(--border); display: flex; align-items: center; min-width: 160px; max-width: 190px; }
.decision-winner { padding: 0.875rem 1rem; border-right: 1px solid var(--border); }
.decision-reason-col { padding: 0.875rem 1rem; }
.decision-badge { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.25rem; }
.badge-a { color: var(--accent); }
.badge-b { color: var(--blue); }
.badge-both { color: #6b21a8; }
.decision-reason { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; }
.stack-box { background: linear-gradient(135deg, var(--accent-bg) 0%, #e8f0eb 100%); border: 1px solid rgba(45,90,61,0.25); border-radius: var(--radius); padding: 1.5rem 1.75rem; margin: 1.25rem 0; }
.stack-verdict-label { display: inline-flex; align-items: center; gap: 0.375rem; background: var(--accent); color: #fff; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; padding: 0.25rem 0.75rem; border-radius: 100px; margin-bottom: 0.875rem; }
.stack-box p { color: var(--text-primary); font-size: 0.95rem; line-height: 1.75; margin: 0; }
.related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.625rem; margin: 1rem 0; }
.related-link { display: flex; align-items: center; gap: 0.625rem; padding: 0.875rem 1rem; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); text-decoration: none; color: var(--text-primary); font-size: 0.875rem; font-weight: 500; transition: all 0.15s; }
.related-link:hover { border-color: var(--accent); background: var(--accent-bg); color: var(--accent); }
.related-link i { color: var(--accent); font-size: 1rem; }
.ref-group { margin-bottom: 1.5rem; }
.ref-group-title { font-family: var(--serif); font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.625rem; }
.ref-group-title a { color: inherit; text-decoration: none; }
.ref-list { list-style: none; padding: 0; margin: 0; }
.ref-item { display: flex; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border); }
.ref-item:last-child { border-bottom: none; }
.ref-num { flex-shrink: 0; width: 1.5rem; height: 1.5rem; background: var(--accent-bg); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: var(--accent); margin-top: 0.125rem; }
.ref-text { font-size: 0.83rem; color: var(--text-muted); line-height: 1.65; }
.ref-text a { color: var(--accent); }
.disclaimer { background: #fff; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem 1.5rem; margin: 2rem 0 3rem; }
.disclaimer-title { font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.375rem; }
.disclaimer p { font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.65; }
.tier-badge { display: inline-flex; align-items: center; font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; white-space: nowrap; vertical-align: middle; }
#toc-toggle { position: fixed; bottom: 1.5rem; right: 1.5rem; width: 3rem; height: 3rem; background: var(--accent); color: #fff; border: none; border-radius: 50%; font-size: 1rem; cursor: pointer; box-shadow: var(--shadow-md); display: flex; align-items: center; justify-content: center; z-index: 200; transition: background 0.2s, transform 0.2s; }
#toc-toggle:hover { background: var(--accent-light); transform: scale(1.08); }
.toc-panel { position: fixed; bottom: 5rem; right: 1.5rem; width: 220px; background: var(--bg-nav); border-radius: var(--radius); padding: 1.125rem; box-shadow: var(--shadow-lg); z-index: 199; display: none; }
.toc-panel.open { display: block; }
.toc-panel h5 { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.45); margin-bottom: 0.75rem; }
.toc-panel ul { list-style: none; }
.toc-panel a { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0; font-size: 0.8rem; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.15s; }
.toc-panel a:hover { color: #fff; }
.toc-panel .toc-num { width: 1.25rem; height: 1.25rem; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: rgba(255,255,255,0.5); flex-shrink: 0; }
.site-footer { background: var(--bg-nav); color: rgba(255,255,255,0.55); padding: 2.5rem 1.5rem; text-align: center; font-size: 0.85rem; }
.site-footer strong { color: #fff; }
.site-footer a { color: rgba(255,255,255,0.55); text-decoration: none; margin: 0 0.75rem; }
.site-footer a:hover { color: #fff; }
.footer-links { margin: 1rem 0; }
@media (max-width: 640px) {
    .hero-vs-row { grid-template-columns: 1fr; gap: 0.75rem; }
    .hero-vs-divider { display: none; }
    .hero-title { font-size: 1.375rem; }
    .split-compare { grid-template-columns: 1fr; }
    .split-side-a { border-right: none; border-bottom: 1px solid var(--border); }
    .decision-card { grid-template-columns: 1fr; }
    .decision-goal { max-width: 100%; border-right: none; border-bottom: 1px solid var(--border); }
    .decision-winner { border-right: none; border-bottom: 1px solid var(--border); }
    .related-grid { grid-template-columns: 1fr; }
    .section-num { display: none; }
    .section-header { gap: 0; }
    .progress-track { display: none; }
    .page-content { padding: 0 1rem; }
    .hero-inner { padding: 2rem 1rem 2rem; }
}
@media (max-width: 900px) {
    .progress-track-inner { gap: 0; }
    .progress-step a { padding: 0.5rem; }
    .progress-step a span:not(.step-num) { display: none; }
}`;

// ── Page Generator ────────────────────────────────────────────────────────

function generateComparePage(comp) {
    const a = findSupplement(comp.suppA);
    const b = findSupplement(comp.suppB);
    if (!a || !b) {
        console.error(`Supplement not found: ${!a ? comp.suppA : comp.suppB}`);
        return null;
    }

    const suppData = [a, b].map(s => {
        const cog = s.primaryBenefits?.cognitive || [];
        const nonCog = s.primaryBenefits?.nonCognitive || [];
        const mechanisms = s.mechanismsOfAction || [];
        const sideEffects = s.safetyProfile?.commonSideEffects || [];
        const interactions = s.safetyProfile?.drugInteractions || [];
        const contraindications = s.safetyProfile?.contraindications || [];
        const effectEntries = Object.entries(s.effectSizes || {});
        const citations = s.keyCitations || [];
        return {
            name: s.name,
            scientificName: s.scientificName || '',
            tier: s.evidenceTier,
            category: normalizeCategory(s.category),
            dosage: s.dosageRange || 'See studies',
            cogBenefits: cog,
            nonCogBenefits: nonCog,
            allBenefits: [...cog, ...nonCog],
            mechanisms,
            sideEffects,
            interactions,
            contraindications,
            effectEntries,
            citations,
            citationCount: citations.length
        };
    });
    const [dA, dB] = suppData;

    const overlapping = [];
    const uniqueA = [];
    const uniqueB = [];
    dA.allBenefits.forEach(bA => {
        const lA = bA.toLowerCase();
        const match = dB.allBenefits.find(bB => {
            const lB = bB.toLowerCase();
            const wordsA = lA.split(/\s+/).filter(w => w.length > 3);
            const wordsB = lB.split(/\s+/).filter(w => w.length > 3);
            return wordsA.some(w => wordsB.includes(w)) || lB.includes(lA.split(' ')[0]) || lA.includes(lB.split(' ')[0]);
        });
        if (match) { overlapping.push({ a: bA, b: match }); } else { uniqueA.push(bA); }
    });
    dB.allBenefits.forEach(bB => {
        const lB = bB.toLowerCase();
        const alreadyMatched = overlapping.some(o => o.b === bB);
        if (!alreadyMatched) {
            const match = dA.allBenefits.find(bA => {
                const lA = bA.toLowerCase();
                const wordsA = lA.split(/\s+/).filter(w => w.length > 3);
                const wordsB = lB.split(/\s+/).filter(w => w.length > 3);
                return wordsA.some(w => wordsB.includes(w));
            });
            if (!match) uniqueB.push(bB);
        }
    });

    const eKeysA = new Set(dA.effectEntries.map(([k]) => k));
    const eKeysB = new Set(dB.effectEntries.map(([k]) => k));
    const sharedEffectKeys = [...eKeysA].filter(k => eKeysB.has(k));
    const totalCitations = dA.citationCount + dB.citationCount;

    const emojiA = getSupplementEmoji(dA.name, dA.category);
    const emojiB = getSupplementEmoji(dB.name, dB.category);

    function getDecisionBadgeClass(rec, nameA, nameB) {
        const r = rec.toLowerCase();
        if (r.includes('both') || r.includes('either') || r.includes('consult') || r.includes('depends')) return 'badge-both';
        const firstWordA = nameA.toLowerCase().split(/[\s\/]/)[0];
        const firstWordB = nameB.toLowerCase().split(/[\s\/]/)[0];
        if (r.includes(firstWordA)) return 'badge-a';
        if (r.includes(firstWordB)) return 'badge-b';
        return 'badge-both';
    }

    function sectionHeader(num, label, heading) {
        return `<div class="section-header">
            <div class="section-num">
                <div class="section-num-circle">${num}</div>
                <div class="section-num-line"></div>
            </div>
            <div class="section-heading-group">
                <div class="section-label">${label}</div>
                <h2>${heading}</h2>
            </div>
        </div>`;
    }

    // Build HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(comp.metaTitle)}</title>
    <meta name="description" content="${esc(comp.metaDescription)}">
    <link rel="canonical" href="${SITE_URL}/compare/${comp.slug}.html">
    <meta property="og:title" content="${esc(comp.metaTitle)}">
    <meta property="og:description" content="${esc(comp.metaDescription)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${SITE_URL}/compare/${comp.slug}.html">
    <meta property="og:image" content="${SITE_URL}/assets/og-compare-${comp.slug}.svg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="SupplementDB">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(comp.metaTitle)}">
    <meta name="twitter:description" content="${esc(comp.metaDescription)}">
    <meta name="twitter:image" content="${SITE_URL}/assets/og-compare-${comp.slug}.svg">
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
    <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageviewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${POSTHOG_KEY}', { api_host: 'https://us.i.posthog.com', person_profiles: 'identified_only', capture_pageview: true, capture_pageleave: true, autocapture: true });
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Auth: Clerk + Convex env injection (substituted by docker-entrypoint.sh / vercel-build.js) -->
    <meta name="clerk-key" content="__CLERK_PUBLISHABLE_KEY__">
    <meta name="convex-url" content="__CONVEX_URL__">

    <style>${COMPARE_CSS}</style>
    <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": comp.title,
        "description": comp.metaDescription,
        "datePublished": TODAY,
        "dateModified": TODAY,
        "publisher": { "@type": "Organization", "name": "SupplementDB", "url": SITE_URL },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/compare/${comp.slug}.html` }
    })}</script>
    <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
            { "@type": "ListItem", "position": 2, "name": "Comparisons", "item": `${SITE_URL}/compare/` },
            { "@type": "ListItem", "position": 3, "name": `${comp.suppA} vs ${comp.suppB}`, "item": `${SITE_URL}/compare/${comp.slug}.html` }
        ]
    })}</script>
</head>
<body>

<nav class="nav">
    <div class="nav-inner">
        <a href="../index.html" class="nav-brand">
            <i class="fas fa-pills"></i>
            SupplementDB
        </a>
        <div class="nav-links">
            <a href="../guides/sleep.html">Sleep Guide</a>
            <a href="../index.html"><i class="fas fa-arrow-left"></i> Database</a>
        </div>
    </div>
</nav>

<header class="hero">
    <div class="hero-inner">
        <nav class="hero-breadcrumb">
            <a href="../index.html">Home</a>
            <span class="sep"><i class="fas fa-chevron-right"></i></span>
            <a href="../index.html#guides">Compare</a>
            <span class="sep"><i class="fas fa-chevron-right"></i></span>
            <span>${esc(dA.category)}</span>
        </nav>
        <div class="hero-vs-row">
            <div class="hero-supp hero-supp-a">
                <div class="hero-supp-emoji">${emojiA}</div>
                <div class="hero-supp-label">Supplement A</div>
                <div class="hero-supp-name">${esc(dA.name)}</div>
                ${dA.scientificName ? `<div class="hero-supp-sci">${esc(dA.scientificName)}</div>` : ''}
            </div>
            <div class="hero-vs-divider">
                <div class="vs-line"></div>
                <div class="vs-text">VS</div>
                <div class="vs-line"></div>
            </div>
            <div class="hero-supp hero-supp-b">
                <div class="hero-supp-emoji">${emojiB}</div>
                <div class="hero-supp-label">Supplement B</div>
                <div class="hero-supp-name">${esc(dB.name)}</div>
                ${dB.scientificName ? `<div class="hero-supp-sci">${esc(dB.scientificName)}</div>` : ''}
            </div>
        </div>
        <h1 class="hero-title">${esc(comp.suppA)} vs ${esc(comp.suppB)}:<br>Evidence-Based Comparison</h1>
        <p class="hero-sub">Analyzing clinical evidence, mechanisms, dosages, and safety profiles to help you make an informed decision.</p>
        <div class="hero-meta-row">
            <div class="hero-chip"><i class="fas fa-book-open"></i> ${totalCitations}+ Verified Citations</div>
            <div class="hero-chip"><i class="fas fa-calendar"></i> Updated ${TODAY}</div>
            <div class="hero-chip"><i class="fas fa-ban"></i> No Industry Funding</div>
        </div>
    </div>
</header>

<div class="progress-track" id="progress-track">
    <div class="progress-track-inner">
        <div class="progress-step"><a href="#verdict" class="active"><span class="step-num">1</span><span>Verdict</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#at-a-glance"><span class="step-num">2</span><span>At a Glance</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#evidence"><span class="step-num">3</span><span>Evidence</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#benefits"><span class="step-num">4</span><span>Benefits</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#mechanisms"><span class="step-num">5</span><span>Mechanisms</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#dosage"><span class="step-num">6</span><span>Dosage</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#safety"><span class="step-num">7</span><span>Safety</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#who-should-choose"><span class="step-num">8</span><span>Who?</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#stacking"><span class="step-num">9</span><span>Stacking</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#references"><span class="step-num">10</span><span>References</span></a></div>
    </div>
</div>

<div class="page-content" style="padding-top:2.5rem;">

    <div class="meta-row">
        <div class="trust-chips">
            <span class="trust-chip"><i class="fas fa-check-circle"></i> ${totalCitations}+ Verified Citations</span>
            <span class="trust-chip"><i class="fas fa-flask"></i> <a href="../methodology.html" style="color:var(--accent);font-weight:600;">Our Methodology</a></span>
        </div>
        <div class="share-btns">
            <button class="share-btn" data-share="twitter"><i class="fa-brands fa-x-twitter"></i></button>
            <button class="share-btn" data-share="linkedin"><i class="fa-brands fa-linkedin"></i></button>
            <button class="share-btn" data-share="copy"><i class="fas fa-link"></i> Copy</button>
        </div>
    </div>

    <section class="section" id="verdict">
        ${sectionHeader(1, 'Summary', 'Quick Verdict')}
        <div class="verdict-card">
            <p>${esc(comp.verdict)}</p>
        </div>
    </section>

    <section class="section" id="at-a-glance">
        ${sectionHeader(2, 'Overview', 'At a Glance')}
        <div class="compare-table-wrap">
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>Attribute</th>
                        <th class="col-a">${emojiA} ${esc(dA.name)}</th>
                        <th class="col-b">${emojiB} ${esc(dB.name)}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Evidence Tier</td>
                        <td class="col-a-data">${tierBadgeHtml(dA.tier)}</td>
                        <td class="col-b-data">${tierBadgeHtml(dB.tier)}</td>
                    </tr>
                    <tr>
                        <td>Category</td>
                        <td class="col-a-data">${esc(dA.category)}</td>
                        <td class="col-b-data">${esc(dB.category)}</td>
                    </tr>
                    <tr>
                        <td>Scientific Name</td>
                        <td class="col-a-data"><em>${esc(dA.scientificName)}</em></td>
                        <td class="col-b-data"><em>${esc(dB.scientificName)}</em></td>
                    </tr>
                    <tr>
                        <td>Clinical Dosage</td>
                        <td class="col-a-data">${esc(dA.dosage)}</td>
                        <td class="col-b-data">${esc(dB.dosage)}</td>
                    </tr>
                    <tr>
                        <td>Key Studies</td>
                        <td class="col-a-data">${dA.citationCount} citations</td>
                        <td class="col-b-data">${dB.citationCount} citations</td>
                    </tr>
                    <tr>
                        <td>Primary Benefits</td>
                        <td class="col-a-data">${dA.allBenefits.slice(0, 3).map(b => esc(b)).join('; ')}</td>
                        <td class="col-b-data">${dB.allBenefits.slice(0, 3).map(b => esc(b)).join('; ')}</td>
                    </tr>
                    <tr>
                        <td>Side Effects</td>
                        <td class="col-a-data">${esc(dA.sideEffects.join(', ') || 'Minimal reported')}</td>
                        <td class="col-b-data">${esc(dB.sideEffects.join(', ') || 'Minimal reported')}</td>
                    </tr>
                    <tr>
                        <td>Drug Interactions</td>
                        <td class="col-a-data">${esc(dA.interactions.join(', ') || 'None known')}</td>
                        <td class="col-b-data">${esc(dB.interactions.join(', ') || 'None known')}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <section class="section" id="evidence">
        ${sectionHeader(3, 'Clinical Research', 'Evidence Comparison')}
        <div class="split-compare">
            <div class="split-side split-side-a">
                <div class="split-side-header">
                    <div class="split-dot split-dot-a"></div>
                    <div>
                        <div class="split-name"><a href="../supplements/${slugify(dA.name)}.html">${esc(dA.name)}</a></div>
                    </div>
                </div>
                <div class="split-meta">${esc(dA.category)} &bull; ${dA.citationCount} key citations</div>
                ${dA.effectEntries.length > 0 ? `<div class="split-sub-label">Studied Effects</div><ul class="split-list">${dA.effectEntries.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(typeof v === 'string' ? v : JSON.stringify(v))}</li>`).join('')}</ul>` : ''}
            </div>
            <div class="split-side split-side-b">
                <div class="split-side-header">
                    <div class="split-dot split-dot-b"></div>
                    <div>
                        <div class="split-name"><a href="../supplements/${slugify(dB.name)}.html">${esc(dB.name)}</a></div>
                    </div>
                </div>
                <div class="split-meta">${esc(dB.category)} &bull; ${dB.citationCount} key citations</div>
                ${dB.effectEntries.length > 0 ? `<div class="split-sub-label">Studied Effects</div><ul class="split-list">${dB.effectEntries.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(typeof v === 'string' ? v : JSON.stringify(v))}</li>`).join('')}</ul>` : ''}
            </div>
        </div>
        ${sharedEffectKeys.length > 0 ? `
        <div class="compare-table-wrap">
            <table class="compare-table">
                <thead><tr><th>Shared Domain</th><th class="col-a">${emojiA} ${esc(dA.name)}</th><th class="col-b">${emojiB} ${esc(dB.name)}</th></tr></thead>
                <tbody>${sharedEffectKeys.map(k => {
                    const vA = dA.effectEntries.find(([key]) => key === k);
                    const vB = dB.effectEntries.find(([key]) => key === k);
                    return `<tr><td>${esc(k)}</td><td class="col-a-data">${esc(vA ? (typeof vA[1] === 'string' ? vA[1] : JSON.stringify(vA[1])) : '—')}</td><td class="col-b-data">${esc(vB ? (typeof vB[1] === 'string' ? vB[1] : JSON.stringify(vB[1])) : '—')}</td></tr>`;
                }).join('')}</tbody>
            </table>
        </div>` : ''}
    </section>

    <section class="section" id="benefits">
        ${sectionHeader(4, 'Outcomes', 'Benefits Comparison')}
        <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1rem;">Shared benefits and each supplement's unique advantages.</p>
        ${overlapping.length > 0 ? `
        <div class="compare-table-wrap" style="margin-bottom:1.25rem;">
            <table class="compare-table">
                <thead><tr><th class="col-a">${emojiA} ${esc(dA.name)} Shared</th><th class="col-b">${emojiB} ${esc(dB.name)} Shared</th></tr></thead>
                <tbody>${overlapping.map(o => `<tr><td class="col-a-data">${esc(o.a)}</td><td class="col-b-data">${esc(o.b)}</td></tr>`).join('')}</tbody>
            </table>
        </div>` : ''}
        <div class="split-compare">
            <div class="split-side split-side-a">
                <div class="split-sub-label">Unique to ${esc(dA.name)}</div>
                <ul class="split-list">${(uniqueA.length > 0 ? uniqueA : ['No unique benefits identified']).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
            </div>
            <div class="split-side split-side-b">
                <div class="split-sub-label">Unique to ${esc(dB.name)}</div>
                <ul class="split-list">${(uniqueB.length > 0 ? uniqueB : ['No unique benefits identified']).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
            </div>
        </div>
    </section>

    <section class="section" id="mechanisms">
        ${sectionHeader(5, 'Pharmacology', 'Mechanisms of Action')}
        <div class="split-compare">
            <div class="split-side split-side-a">
                <div class="split-side-header">
                    <div class="split-dot split-dot-a"></div>
                    <div class="split-name"><a href="../supplements/${slugify(dA.name)}.html">${esc(dA.name)}</a></div>
                </div>
                <ol style="font-size:0.85rem;padding-left:1.125rem;margin:0;color:var(--text-secondary);">${dA.mechanisms.map(m => `<li style="margin-bottom:0.4rem;">${esc(m)}</li>`).join('')}</ol>
            </div>
            <div class="split-side split-side-b">
                <div class="split-side-header">
                    <div class="split-dot split-dot-b"></div>
                    <div class="split-name"><a href="../supplements/${slugify(dB.name)}.html">${esc(dB.name)}</a></div>
                </div>
                <ol style="font-size:0.85rem;padding-left:1.125rem;margin:0;color:var(--text-secondary);">${dB.mechanisms.map(m => `<li style="margin-bottom:0.4rem;">${esc(m)}</li>`).join('')}</ol>
            </div>
        </div>
    </section>

    <section class="section" id="dosage">
        ${sectionHeader(6, 'Protocol', 'Dosage &amp; Timing')}
        <div class="compare-table-wrap">
            <table class="compare-table">
                <thead><tr><th>Parameter</th><th class="col-a">${emojiA} ${esc(dA.name)}</th><th class="col-b">${emojiB} ${esc(dB.name)}</th></tr></thead>
                <tbody>
                    <tr><td>Clinical Dosage</td><td class="col-a-data">${esc(dA.dosage)}</td><td class="col-b-data">${esc(dB.dosage)}</td></tr>
                </tbody>
            </table>
        </div>
    </section>

    <section class="section" id="safety">
        ${sectionHeader(7, 'Risk Profile', 'Safety Profiles')}
        <div class="compare-table-wrap">
            <table class="compare-table">
                <thead><tr><th>Safety Aspect</th><th class="col-a">${emojiA} ${esc(dA.name)}</th><th class="col-b">${emojiB} ${esc(dB.name)}</th></tr></thead>
                <tbody>
                    <tr><td>Common Side Effects</td><td class="col-a-data">${esc(dA.sideEffects.join(', ') || 'Minimal reported')}</td><td class="col-b-data">${esc(dB.sideEffects.join(', ') || 'Minimal reported')}</td></tr>
                    <tr><td>Drug Interactions</td><td class="col-a-data">${esc(dA.interactions.join(', ') || 'None known')}</td><td class="col-b-data">${esc(dB.interactions.join(', ') || 'None known')}</td></tr>
                    <tr><td>Contraindications</td><td class="col-a-data">${esc(dA.contraindications.join(', ') || 'None known')}</td><td class="col-b-data">${esc(dB.contraindications.join(', ') || 'None known')}</td></tr>
                </tbody>
            </table>
        </div>
    </section>

    <section class="section" id="who-should-choose">
        ${sectionHeader(8, 'Decision Guide', 'Who Should Choose Which?')}
        <div class="decision-cards">
            ${comp.whoShouldChoose.map(row => {
                const cls = getDecisionBadgeClass(row.recommendation, dA.name, dB.name);
                const icon = cls === 'badge-a' ? 'fa-arrow-left' : cls === 'badge-b' ? 'fa-arrow-right' : 'fa-equals';
                return `<div class="decision-card">
                    <div class="decision-goal">${esc(row.scenario)}</div>
                    <div class="decision-winner">
                        <div class="decision-badge ${cls}"><i class="fas ${icon}"></i> ${esc(row.recommendation)}</div>
                    </div>
                    <div class="decision-reason-col"><div class="decision-reason">${esc(row.reason)}</div></div>
                </div>`;
            }).join('')}
        </div>
    </section>

    <section class="section" id="stacking">
        ${sectionHeader(9, 'Combination Protocol', `Can You Stack ${esc(dA.name)} &amp; ${esc(dB.name)}?`)}
        <div class="stack-box">
            <div class="stack-verdict-label"><i class="fas fa-layer-group"></i> Stacking Verdict</div>
            <p>${esc(comp.canStack)}</p>
        </div>
    </section>

    <section class="section" id="related">
        ${sectionHeader('', 'Further Reading', 'Related Guides')}
        <div class="related-grid">
            ${comp.relatedGuides.map(link => `<a href="${link.url}" class="related-link"><i class="fas fa-book-reader"></i> ${esc(link.title)}</a>`).join('')}
            ${comp.relatedCategories.map(link => `<a href="${link.url}" class="related-link"><i class="fas fa-th-large"></i> ${esc(link.title)}</a>`).join('')}
        </div>
    </section>

    <section class="section" id="references">
        ${sectionHeader(10, 'Citations', 'References')}
        <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1.5rem;">Key citations from the SupplementDB evidence database. For full details, see each supplement's <a href="../index.html" style="color:var(--accent);">database entry</a>.</p>
        ${[dA, dB].map(d => d.citations.length > 0 ? `
        <div class="ref-group">
            <div class="ref-group-title"><a href="../supplements/${slugify(d.name)}.html">${esc(d.name)}</a> (${d.citationCount} citations)</div>
            <ul class="ref-list">${d.citations.map((c, i) => {
                const authors = c.authors || 'Unknown authors';
                const year = c.year || '';
                const title = c.title || 'Untitled';
                const journal = c.journal || '';
                const doi = c.doi || '';
                return `<li class="ref-item"><div class="ref-num">${i + 1}</div><div class="ref-text">${esc(authors)} (${esc(String(year))}). ${esc(title)}. <em>${esc(journal)}</em>.${doi ? ` DOI: <a href="https://doi.org/${esc(doi)}" target="_blank" rel="noopener">${esc(doi)}</a>` : ''}</div></li>`;
            }).join('')}</ul>
        </div>` : '').join('')}
    </section>

    <div class="disclaimer">
        <div class="disclaimer-title"><i class="fas fa-exclamation-triangle" style="color:#f59e0b;margin-right:0.4rem;"></i> Medical Disclaimer</div>
        <p>This comparison is for informational purposes only and does not constitute medical advice. The evidence presented is based on published research and does not replace consultation with a qualified healthcare provider. Supplement efficacy varies by individual, and interactions with medications or health conditions require professional evaluation. Always consult your physician before starting any new supplement regimen.</p>
    </div>

</div>

<button id="toc-toggle" aria-label="Table of contents"><i class="fas fa-list"></i></button>
<div class="toc-panel" id="toc-panel">
    <h5>Contents</h5>
    <ul>
        <li><a href="#verdict"><span class="toc-num">1</span> Verdict</a></li>
        <li><a href="#at-a-glance"><span class="toc-num">2</span> At a Glance</a></li>
        <li><a href="#evidence"><span class="toc-num">3</span> Evidence</a></li>
        <li><a href="#benefits"><span class="toc-num">4</span> Benefits</a></li>
        <li><a href="#mechanisms"><span class="toc-num">5</span> Mechanisms</a></li>
        <li><a href="#dosage"><span class="toc-num">6</span> Dosage</a></li>
        <li><a href="#safety"><span class="toc-num">7</span> Safety</a></li>
        <li><a href="#who-should-choose"><span class="toc-num">8</span> Who?</a></li>
        <li><a href="#stacking"><span class="toc-num">9</span> Stacking</a></li>
        <li><a href="#references"><span class="toc-num">10</span> References</a></li>
    </ul>
</div>

<footer class="site-footer">
    <strong>SupplementDB</strong> &mdash; Evidence-based supplement research<br>
    <div class="footer-links">
        <a href="../index.html">Database</a>
        <a href="../about.html">About</a>
        <a href="../methodology.html">Methodology</a>
        <a href="../faq.html">FAQ</a>
        <a href="../legal/terms.html">Terms</a>
        <a href="../legal/privacy.html">Privacy</a>
    </div>
    <p>Data sourced from peer-reviewed studies. Not medical advice. &copy; ${new Date().getFullYear()} SupplementDB.</p>
</footer>

<script>
(function() {
    // Progress tracker active state
    const steps = document.querySelectorAll('.progress-step a');
    const sectionIds = ['verdict','at-a-glance','evidence','benefits','mechanisms','dosage','safety','who-should-choose','stacking','references'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    function updateProgress() {
        let current = 0;
        sections.forEach((s, i) => {
            if (s.getBoundingClientRect().top <= 120) current = i;
        });
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === current);
        });
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // Floating TOC
    const tocToggle = document.getElementById('toc-toggle');
    const tocPanel = document.getElementById('toc-panel');
    tocToggle.addEventListener('click', function() {
        tocPanel.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
        if (!tocToggle.contains(e.target) && !tocPanel.contains(e.target)) {
            tocPanel.classList.remove('open');
        }
    });

    // Share buttons
    document.querySelectorAll('[data-share]').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.share;
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            if (type === 'twitter') window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + title, '_blank');
            else if (type === 'linkedin') window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + url, '_blank');
            else if (type === 'copy') {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => { this.innerHTML = '<i class="fas fa-link"></i> Copy'; }, 2000);
                });
            }
        });
    });
})();
</script>

<!-- Auth & Convex client -->
<script src="../js/auth.js"></script>
<script src="../js/convex-client.js"></script>
<script src="../js/rbac.js"></script>
<script src="../js/auth-ui.js"></script>
</body>
</html>`;

    return html;
}

// ── Main ──────────────────────────────────────────────────────────────────

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

COMPARISONS.forEach(comp => {
    const html = generateComparePage(comp);
    if (html) {
        const outPath = path.join(OUTPUT_DIR, `${comp.slug}.html`);
        fs.writeFileSync(outPath, html, 'utf8');
        const sizeKB = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
        console.log(`✓ Generated ${comp.slug}.html (${sizeKB}KB)`);
    }
});

console.log(`\nDone — ${COMPARISONS.length} comparison pages generated.`);
