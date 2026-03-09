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
                            <h3 style="margin-top:0;">${esc(d.name)} ${tierBadgeHtml(d.tier)}</h3>
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
                            <h3 style="margin-top:0;">${esc(d.name)}</h3>
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
            html += `                    <h3>${esc(d.name)} (${d.citationCount} key citations)</h3>
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
