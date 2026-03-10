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
const SITE_URL = 'https://supplementdb.co';
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
    }
];

// ── Page Generator ────────────────────────────────────────────────────────

function generateComparePage(comp) {
    const a = findSupplement(comp.suppA);
    const b = findSupplement(comp.suppB);
    if (!a || !b) {
        console.error(`Supplement not found: ${!a ? comp.suppA : comp.suppB}`);
        return null;
    }

    // Collect data for both
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

    // Find overlapping benefits (simple keyword matching)
    const overlapping = [];
    const uniqueA = [];
    const uniqueB = [];
    dA.allBenefits.forEach(bA => {
        const lA = bA.toLowerCase();
        const match = dB.allBenefits.find(bB => {
            const lB = bB.toLowerCase();
            // Check for significant word overlap
            const wordsA = lA.split(/\s+/).filter(w => w.length > 3);
            const wordsB = lB.split(/\s+/).filter(w => w.length > 3);
            return wordsA.some(w => wordsB.includes(w)) || lB.includes(lA.split(' ')[0]) || lA.includes(lB.split(' ')[0]);
        });
        if (match) {
            overlapping.push({ a: bA, b: match });
        } else {
            uniqueA.push(bA);
        }
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

    // Find shared effect size domains
    const eKeysA = new Set(dA.effectEntries.map(([k]) => k));
    const eKeysB = new Set(dB.effectEntries.map(([k]) => k));
    const sharedEffectKeys = [...eKeysA].filter(k => eKeysB.has(k));

    // Total citations across both
    const totalCitations = dA.citationCount + dB.citationCount;

    // ── Build HTML ────────────────────────────────────────────────────────

    let html = `<!DOCTYPE html>
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

    <!-- PostHog Analytics -->
    <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageviewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${POSTHOG_KEY}', {
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

    <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": comp.title,
        "description": comp.metaDescription,
        "datePublished": TODAY,
        "dateModified": TODAY,
        "publisher": {
            "@type": "Organization",
            "name": "SupplementDB",
            "url": SITE_URL
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${SITE_URL}/compare/${comp.slug}.html`
        }
    })}</script>
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

    <div class="content-body">
        <!-- Breadcrumbs -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="../index.html">Home</a>
            <span class="separator"><i class="fas fa-chevron-right"></i></span>
            <a href="../index.html#guides">Compare</a>
            <span class="separator"><i class="fas fa-chevron-right"></i></span>
            <span class="current">${esc(dA.name)} vs ${esc(dB.name)}</span>
        </nav>

        <!-- Hero -->
        <header class="guide-hero">
            <h1>${esc(comp.title)}</h1>
            <p class="hero-subtitle">An evidence-based head-to-head comparison for ${esc(comp.domain.toLowerCase())} — analyzing clinical evidence, mechanisms, dosages, and safety profiles to help you make an informed decision.</p>
            <div class="hero-stats">
                <div class="hero-stat"><i class="fas fa-flask"></i> ${esc(dA.name)}: ${tierBadgeHtml(dA.tier)}</div>
                <div class="hero-stat"><i class="fas fa-flask"></i> ${esc(dB.name)}: ${tierBadgeHtml(dB.tier)}</div>
                <div class="hero-stat"><i class="fas fa-book-open"></i> ${totalCitations}+ Citations</div>
                <div class="hero-stat"><i class="fas fa-calendar"></i> Updated ${TODAY}</div>
            </div>
        </header>

        <!-- Share Bar -->
        <div class="share-bar">
            <span class="share-bar-label">Share this comparison</span>
            <div class="share-bar-buttons">
                <button class="share-btn" data-share="twitter"><i class="fa-brands fa-x-twitter"></i> Twitter</button>
                <button class="share-btn" data-share="linkedin"><i class="fa-brands fa-linkedin"></i> LinkedIn</button>
                <button class="share-btn" data-share="facebook"><i class="fa-brands fa-facebook"></i> Facebook</button>
                <button class="share-btn share-btn-copy" data-share="copy"><i class="fas fa-link"></i> Copy Link</button>
            </div>
        </div>

        <!-- Trust Signal Bar -->
        <div class="trust-bar">
            <span class="trust-bar-item"><i class="fas fa-check-circle"></i> ${totalCitations}+ Verified Citations</span>
            <span class="trust-bar-divider"></span>
            <span class="trust-bar-item"><i class="fas fa-shield-alt"></i> FDA-Compliant Language</span>
            <span class="trust-bar-divider"></span>
            <span class="trust-bar-item"><i class="fas fa-ban"></i> No Industry Funding</span>
            <span class="trust-bar-divider"></span>
            <span class="trust-bar-item"><i class="fas fa-flask"></i> <a href="../methodology.html">Our Methodology</a></span>
        </div>

        <div class="guide-layout">
            <!-- Sidebar TOC -->
            <aside class="guide-sidebar">
                <nav class="sidebar-toc">
                    <h4>Contents</h4>
                    <ul>
                        <li><a href="#verdict">Quick Verdict</a></li>
                        <li><a href="#at-a-glance">At a Glance</a></li>
                        <li><a href="#evidence">Evidence Comparison</a></li>
                        <li><a href="#benefits">Benefits Comparison</a></li>
                        <li><a href="#mechanisms">Mechanisms of Action</a></li>
                        <li><a href="#dosage">Dosage & Timing</a></li>
                        <li><a href="#safety">Safety Profiles</a></li>
                        <li><a href="#who-should-choose">Who Should Choose Which</a></li>
                        <li><a href="#stacking">Can You Stack Them?</a></li>
                        <li><a href="#references">References</a></li>
                    </ul>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="guide-main">
                <!-- Quick Verdict (Featured Snippet Target) -->
                <section class="content-section" id="verdict">
                    <h2><i class="fas fa-gavel section-icon"></i> Quick Verdict: ${esc(dA.name)} vs ${esc(dB.name)}</h2>
                    <div class="snippet-paragraph">
                        <p>${esc(comp.verdict)}</p>
                    </div>
                </section>

                <!-- At a Glance Table -->
                <section class="content-section" id="at-a-glance">
                    <h2><i class="fas fa-table section-icon"></i> At a Glance</h2>
                    <div class="table-responsive">
                        <table class="snippet-table comparison-table">
                            <thead>
                                <tr>
                                    <th>Attribute</th>
                                    <th>${esc(dA.name)}</th>
                                    <th>${esc(dB.name)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Evidence Tier</strong></td>
                                    <td>${tierBadgeHtml(dA.tier)}</td>
                                    <td>${tierBadgeHtml(dB.tier)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Category</strong></td>
                                    <td>${esc(dA.category)}</td>
                                    <td>${esc(dB.category)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Scientific Name</strong></td>
                                    <td><em>${esc(dA.scientificName)}</em></td>
                                    <td><em>${esc(dB.scientificName)}</em></td>
                                </tr>
                                <tr>
                                    <td><strong>Clinical Dosage</strong></td>
                                    <td>${esc(dA.dosage)}</td>
                                    <td>${esc(dB.dosage)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Key Studies</strong></td>
                                    <td>${dA.citationCount} citations</td>
                                    <td>${dB.citationCount} citations</td>
                                </tr>
                                <tr>
                                    <td><strong>Primary Benefits</strong></td>
                                    <td>${dA.allBenefits.slice(0, 3).map(b => esc(b)).join('; ')}</td>
                                    <td>${dB.allBenefits.slice(0, 3).map(b => esc(b)).join('; ')}</td>
                                </tr>
                                <tr>
                                    <td><strong>Side Effects</strong></td>
                                    <td>${dA.sideEffects.join(', ') || 'Minimal reported'}</td>
                                    <td>${dB.sideEffects.join(', ') || 'Minimal reported'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Drug Interactions</strong></td>
                                    <td>${dA.interactions.join(', ') || 'None known'}</td>
                                    <td>${dB.interactions.join(', ') || 'None known'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Evidence Comparison -->
                <section class="content-section" id="evidence">
                    <h2><i class="fas fa-chart-bar section-icon"></i> Evidence Comparison</h2>
                    <div class="compare-cards" style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin:1.5rem 0;">
`;

    // Evidence cards for each supplement
    [dA, dB].forEach(d => {
        html += `                        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:1.5rem;">
                            <h3 style="margin-top:0;"><a href="../supplements/${slugify(d.name)}.html" style="color:inherit;text-decoration:none;">${esc(d.name)}</a> ${tierBadgeHtml(d.tier)}</h3>
                            <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">${esc(d.category)} &bull; ${d.citationCount} key citations</p>
`;
        if (d.effectEntries.length > 0) {
            html += `                            <h4 style="font-size:0.85rem;font-weight:600;margin-bottom:0.5rem;">Studied Effects:</h4>
                            <ul style="font-size:0.85rem;margin:0;padding-left:1.2rem;">\n`;
            d.effectEntries.forEach(([k, v]) => {
                html += `                                <li><strong>${esc(k)}:</strong> ${esc(typeof v === 'string' ? v : JSON.stringify(v))}</li>\n`;
            });
            html += `                            </ul>\n`;
        }
        html += `                        </div>\n`;
    });

    html += `                    </div>
`;

    // Shared domains
    if (sharedEffectKeys.length > 0) {
        html += `                    <h3>Shared Research Domains</h3>
                    <p>Both supplements have been studied for: <strong>${sharedEffectKeys.map(k => esc(k)).join(', ')}</strong>.</p>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Domain</th>
                                    <th>${esc(dA.name)}</th>
                                    <th>${esc(dB.name)}</th>
                                </tr>
                            </thead>
                            <tbody>
`;
        sharedEffectKeys.forEach(k => {
            const vA = dA.effectEntries.find(([key]) => key === k);
            const vB = dB.effectEntries.find(([key]) => key === k);
            html += `                                <tr>
                                    <td><strong>${esc(k)}</strong></td>
                                    <td style="font-size:0.85rem;">${esc(vA ? (typeof vA[1] === 'string' ? vA[1] : JSON.stringify(vA[1])) : '—')}</td>
                                    <td style="font-size:0.85rem;">${esc(vB ? (typeof vB[1] === 'string' ? vB[1] : JSON.stringify(vB[1])) : '—')}</td>
                                </tr>
`;
        });
        html += `                            </tbody>
                        </table>
                    </div>
`;
    }

    html += `                </section>

                <!-- Benefits Comparison -->
                <section class="content-section" id="benefits">
                    <h2><i class="fas fa-check-double section-icon"></i> Benefits Comparison</h2>
`;

    if (overlapping.length > 0) {
        html += `                    <h3>Shared Benefits</h3>
                    <div class="table-responsive">
                        <table>
                            <thead><tr><th>${esc(dA.name)}</th><th>${esc(dB.name)}</th></tr></thead>
                            <tbody>
`;
        overlapping.forEach(o => {
            html += `                                <tr><td>${esc(o.a)}</td><td>${esc(o.b)}</td></tr>\n`;
        });
        html += `                            </tbody>
                        </table>
                    </div>
`;
    }

    html += `                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin:1.5rem 0;">
                        <div>
                            <h3>Unique to ${esc(dA.name)}</h3>
                            <ul>
`;
    (uniqueA.length > 0 ? uniqueA : ['No unique benefits identified']).forEach(b => {
        html += `                                <li>${esc(b)}</li>\n`;
    });
    html += `                            </ul>
                        </div>
                        <div>
                            <h3>Unique to ${esc(dB.name)}</h3>
                            <ul>
`;
    (uniqueB.length > 0 ? uniqueB : ['No unique benefits identified']).forEach(b => {
        html += `                                <li>${esc(b)}</li>\n`;
    });
    html += `                            </ul>
                        </div>
                    </div>
                </section>

                <!-- Mechanisms of Action -->
                <section class="content-section" id="mechanisms">
                    <h2><i class="fas fa-cogs section-icon"></i> Mechanisms of Action</h2>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin:1.5rem 0;">
`;

    [dA, dB].forEach(d => {
        html += `                        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:1.5rem;">
                            <h3 style="margin-top:0;"><a href="../supplements/${slugify(d.name)}.html" style="color:inherit;text-decoration:none;">${esc(d.name)}</a></h3>
                            <ol style="font-size:0.9rem;padding-left:1.2rem;">
`;
        d.mechanisms.forEach(m => {
            html += `                                <li style="margin-bottom:0.5rem;">${esc(m)}</li>\n`;
        });
        html += `                            </ol>
                        </div>\n`;
    });

    html += `                    </div>
                </section>

                <!-- Dosage & Timing -->
                <section class="content-section" id="dosage">
                    <h2><i class="fas fa-prescription-bottle section-icon"></i> Dosage &amp; Timing</h2>
                    <div class="table-responsive">
                        <table class="snippet-table">
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>${esc(dA.name)}</th>
                                    <th>${esc(dB.name)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Clinical Dosage</strong></td>
                                    <td>${esc(dA.dosage)}</td>
                                    <td>${esc(dB.dosage)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Safety Profiles -->
                <section class="content-section" id="safety">
                    <h2><i class="fas fa-shield-alt section-icon"></i> Safety Profiles</h2>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Safety Aspect</th>
                                    <th>${esc(dA.name)}</th>
                                    <th>${esc(dB.name)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Common Side Effects</strong></td>
                                    <td>${dA.sideEffects.join(', ') || 'Minimal reported'}</td>
                                    <td>${dB.sideEffects.join(', ') || 'Minimal reported'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Drug Interactions</strong></td>
                                    <td>${dA.interactions.join(', ') || 'None known'}</td>
                                    <td>${dB.interactions.join(', ') || 'None known'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Contraindications</strong></td>
                                    <td>${dA.contraindications.join(', ') || 'None known'}</td>
                                    <td>${dB.contraindications.join(', ') || 'None known'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Who Should Choose Which -->
                <section class="content-section" id="who-should-choose">
                    <h2><i class="fas fa-user-check section-icon"></i> Who Should Choose Which?</h2>
                    <div class="table-responsive">
                        <table class="snippet-table">
                            <thead>
                                <tr>
                                    <th>If Your Goal Is...</th>
                                    <th>Choose</th>
                                    <th>Why</th>
                                </tr>
                            </thead>
                            <tbody>
`;

    comp.whoShouldChoose.forEach(row => {
        html += `                                <tr>
                                    <td><strong>${esc(row.scenario)}</strong></td>
                                    <td><strong>${esc(row.recommendation)}</strong></td>
                                    <td style="font-size:0.85rem;">${esc(row.reason)}</td>
                                </tr>
`;
    });

    html += `                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Can You Stack Them? -->
                <section class="content-section" id="stacking">
                    <h2><i class="fas fa-layer-group section-icon"></i> Can You Stack ${esc(dA.name)} and ${esc(dB.name)}?</h2>
                    <div style="background:var(--accent-bg);border-left:4px solid var(--accent);border-radius:0 8px 8px 0;padding:1.25rem 1.5rem;margin:1rem 0;">
                        <p style="margin:0;line-height:1.7;">${esc(comp.canStack)}</p>
                    </div>
                </section>

                <!-- Related Content -->
                <section class="content-section" id="related">
                    <h2><i class="fas fa-link section-icon"></i> Related Content</h2>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:1rem;margin:1rem 0;">
`;

    comp.relatedGuides.forEach(link => {
        html += `                        <a href="${link.url}" style="display:block;padding:1rem 1.25rem;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;text-decoration:none;color:var(--text-primary);transition:border-color 0.2s;">
                            <i class="fas fa-book-reader" style="color:var(--accent);margin-right:0.5rem;"></i>
                            <strong>${esc(link.title)}</strong>
                        </a>\n`;
    });
    comp.relatedCategories.forEach(link => {
        html += `                        <a href="${link.url}" style="display:block;padding:1rem 1.25rem;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;text-decoration:none;color:var(--text-primary);transition:border-color 0.2s;">
                            <i class="fas fa-th-large" style="color:var(--accent);margin-right:0.5rem;"></i>
                            <strong>${esc(link.title)}</strong>
                        </a>\n`;
    });

    html += `                    </div>
                </section>

                <!-- References -->
                <section class="content-section" id="references">
                    <h2><i class="fas fa-book section-icon"></i> References</h2>
                    <p style="color:var(--text-muted);font-size:0.9rem;">Key citations from the SupplementDB evidence database. For full citation details, see each supplement's entry in the <a href="../index.html">main database</a>.</p>
`;

    [dA, dB].forEach(d => {
        if (d.citations.length > 0) {
            html += `                    <h3><a href="../supplements/${slugify(d.name)}.html" style="color:inherit;text-decoration:none;">${esc(d.name)}</a> (${d.citationCount} key citations)</h3>
                    <ol style="font-size:0.85rem;padding-left:1.5rem;">\n`;
            d.citations.forEach(c => {
                const authors = c.authors || 'Unknown authors';
                const year = c.year || '';
                const title = c.title || 'Untitled';
                const journal = c.journal || '';
                const doi = c.doi || '';
                html += `                        <li style="margin-bottom:0.5rem;">${esc(authors)} (${esc(String(year))}). ${esc(title)}. <em>${esc(journal)}</em>.${doi ? ` DOI: <a href="https://doi.org/${esc(doi)}" target="_blank" rel="noopener">${esc(doi)}</a>` : ''}</li>\n`;
            });
            html += `                    </ol>\n`;
        }
    });

    html += `                </section>

                <!-- Medical Disclaimer -->
                <section class="content-section" style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:1.5rem;margin-top:2rem;">
                    <h3 style="margin-top:0;font-size:0.95rem;"><i class="fas fa-exclamation-triangle" style="color:var(--tier-3);margin-right:0.5rem;"></i> Medical Disclaimer</h3>
                    <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0;">This comparison is for informational purposes only and does not constitute medical advice. The evidence presented is based on published research and does not replace consultation with a qualified healthcare provider. Supplement efficacy varies by individual, and interactions with medications or health conditions require professional evaluation. Always consult your physician before starting any new supplement regimen.</p>
                </section>

            </main>
        </div>
    </div>

    <!-- Footer -->
    <footer style="background:#1a1a2e;color:rgba(255,255,255,0.7);padding:3rem 1.5rem;margin-top:3rem;text-align:center;font-size:0.85rem;">
        <div style="max-width:800px;margin:0 auto;">
            <p style="margin-bottom:0.5rem;"><strong style="color:#fff;">SupplementDB</strong> &mdash; Evidence-based supplement research</p>
            <p style="margin-bottom:1rem;">Data sourced from peer-reviewed studies. Not medical advice. Consult a healthcare provider.</p>
            <div style="margin-bottom:1rem;">
                <a href="../index.html" style="color:rgba(255,255,255,0.7);margin:0 0.75rem;text-decoration:none;">Database</a>
                <a href="../about.html" style="color:rgba(255,255,255,0.7);margin:0 0.75rem;text-decoration:none;">About</a>
                <a href="../methodology.html" style="color:rgba(255,255,255,0.7);margin:0 0.75rem;text-decoration:none;">Methodology</a>
                <a href="../faq.html" style="color:rgba(255,255,255,0.7);margin:0 0.75rem;text-decoration:none;">FAQ</a>
                <a href="../legal/terms.html" style="color:rgba(255,255,255,0.7);margin:0 0.75rem;text-decoration:none;">Terms</a>
                <a href="../legal/privacy.html" style="color:rgba(255,255,255,0.7);margin:0 0.75rem;text-decoration:none;">Privacy</a>
            </div>
            <p>&copy; ${new Date().getFullYear()} SupplementDB. All rights reserved.</p>
        </div>
    </footer>

    <!-- Sidebar TOC active state script -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const tocLinks = document.querySelectorAll('.sidebar-toc a');
        const sections = [];
        tocLinks.forEach(link => {
            const id = link.getAttribute('href').replace('#', '');
            const el = document.getElementById(id);
            if (el) sections.push({ el, link });
        });
        function updateActive() {
            let current = sections[0];
            sections.forEach(s => {
                if (s.el.getBoundingClientRect().top <= 120) current = s;
            });
            tocLinks.forEach(l => l.classList.remove('active'));
            if (current) current.link.classList.add('active');
        }
        window.addEventListener('scroll', updateActive, { passive: true });
        updateActive();
    });
    </script>
    <script src="../js/share-bar.js"></script>
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
