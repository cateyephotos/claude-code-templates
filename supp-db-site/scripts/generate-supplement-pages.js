#!/usr/bin/env node
/**
 * generate-supplement-pages.js
 * Auto-generates individual supplement monograph pages from supplements.js data
 * and enhanced citations. Produces 93 deep-dive reference pages.
 * Phase 4 of the SupplementDB content plan.
 */

const fs = require('fs');
const path = require('path');
const { loadSupplementData, normalizeCategory, slugify, getTierLabel, getTierColor } = require('./parse-data');

const db = loadSupplementData();
if (!db) { console.error('Failed to load supplement data'); process.exit(1); }

const TODAY = new Date().toISOString().split('T')[0];
const SITE_URL = 'https://supplementdb.co';
const POSTHOG_KEY = 'phc_esUgVXZLrnPplrCmbAQ8RlYbHuXS38hewwGHnLqtMF7';
const OUTPUT_DIR = path.join(__dirname, '..', 'supplements');
const ENHANCED_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');

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

function safetyRatingBadge(rating) {
    const colors = {
        'Excellent': '#16a34a',
        'Good': '#2563eb',
        'Moderate': '#d97706',
        'Caution': '#dc2626',
        'Use Caution': '#dc2626'
    };
    const color = colors[rating] || '#6b7280';
    return `<span style="background:${color};color:#fff;padding:2px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;white-space:nowrap;">${esc(rating)}</span>`;
}

// ── Enhanced Citation Loader (Server-Side) ───────────────────────────────

function loadEnhancedCitation(supplement) {
    const id = supplement.id;
    try {
        const files = fs.readdirSync(ENHANCED_DIR);
        const matchFile = files.find(f => f.startsWith(`${id}_`) && f.endsWith('_enhanced.js'));
        if (!matchFile) return null;

        const src = fs.readFileSync(path.join(ENHANCED_DIR, matchFile), 'utf8');
        // Create a mock window environment for eval
        const window = { enhancedCitations: {} };
        // Also declare all possible globalVar names
        eval(src);

        // Strategy 1: Check window.enhancedCitations[id]
        if (window.enhancedCitations[id] && (window.enhancedCitations[id].citations || window.enhancedCitations[id].enhancedCitations)) {
            return window.enhancedCitations[id];
        }

        // Strategy 2: Check for any globalVar set on window (v2.0 pattern)
        for (const key of Object.keys(window)) {
            if (key === 'enhancedCitations') continue;
            const val = window[key];
            if (val && typeof val === 'object' && val.citations && val.supplementId === id) {
                return val;
            }
        }

        // Strategy 3: Check for any object with citations property
        for (const key of Object.keys(window)) {
            if (key === 'enhancedCitations') continue;
            const val = window[key];
            if (val && typeof val === 'object' && val.citations) {
                return val;
            }
        }

        return null;
    } catch (e) {
        console.warn(`  ⚠ Could not load enhanced citations for ID ${id}: ${e.message}`);
        return null;
    }
}

// ── Related Content Maps ─────────────────────────────────────────────────

const CATEGORY_PAGE_MAP = {
    'Herbal Extracts': { title: 'Herbal Extracts', url: '../categories/herbal-extracts.html' },
    'Essential Nutrients': { title: 'Essential Nutrients', url: '../categories/essential-nutrients.html' },
    'Antioxidants': { title: 'Antioxidants', url: '../categories/antioxidants.html' },
    'Amino Acids': { title: 'Amino Acids', url: '../categories/amino-acids.html' },
    'Nootropics': { title: 'Nootropics', url: '../categories/nootropics.html' },
    'Performance Enhancers': { title: 'Performance Enhancers', url: '../categories/performance-enhancers.html' },
    'Adaptogens': { title: 'Adaptogens (Herbal Extracts)', url: '../categories/herbal-extracts.html' },
    'Sleep Support': { title: 'Essential Nutrients', url: '../categories/essential-nutrients.html' },
    'Anti-inflammatory': { title: 'Herbal Extracts', url: '../categories/herbal-extracts.html' },
    'Metabolic Support': { title: 'Herbal Extracts', url: '../categories/herbal-extracts.html' },
    'Joint Support': { title: 'Amino Acids', url: '../categories/amino-acids.html' },
    'Polyphenols': { title: 'Antioxidants', url: '../categories/antioxidants.html' },
    'Specialized': { title: 'Nootropics', url: '../categories/nootropics.html' }
};

// Guide relevance: supplement name → relevant guide slugs
const GUIDE_MAP = {
    'Sleep Quality': { title: 'Sleep Quality Guide', url: '../guides/sleep.html' },
    'Anxiety & Stress': { title: 'Anxiety & Stress Relief Guide', url: '../guides/anxiety-stress.html' },
    'Cognitive Performance': { title: 'Cognitive Performance Guide', url: '../guides/cognitive-performance.html' },
    'Cardiovascular': { title: 'Cardiovascular Health Guide', url: '../guides/cardiovascular.html' },
    'Immune Function': { title: 'Immune Function Guide', url: '../guides/immune-function.html' },
    'Joint Health': { title: 'Joint Health & Mobility Guide', url: '../guides/joint-health.html' },
    'Metabolic Health': { title: 'Metabolic Health Guide', url: '../guides/metabolic-health.html' },
    'Energy & Vitality': { title: 'Energy & Vitality Guide', url: '../guides/energy-vitality.html' }
};

// Map supplement names to relevant guide domains
const SUPPLEMENT_GUIDE_RELEVANCE = {
    'Melatonin': ['Sleep Quality'],
    'Magnesium': ['Sleep Quality', 'Anxiety & Stress', 'Cardiovascular'],
    'L-Theanine': ['Sleep Quality', 'Anxiety & Stress', 'Cognitive Performance'],
    'Valerian Root': ['Sleep Quality'],
    'Passionflower': ['Sleep Quality', 'Anxiety & Stress'],
    'Ashwagandha': ['Anxiety & Stress', 'Cognitive Performance'],
    'Rhodiola rosea': ['Anxiety & Stress', 'Energy & Vitality'],
    '5-HTP': ['Anxiety & Stress', 'Sleep Quality'],
    'GABA': ['Anxiety & Stress', 'Sleep Quality'],
    'Holy Basil': ['Anxiety & Stress'],
    'Kanna': ['Anxiety & Stress'],
    'Inositol': ['Anxiety & Stress'],
    'Bacopa monnieri': ['Cognitive Performance'],
    "Lion's Mane Mushroom": ['Cognitive Performance'],
    'Alpha-GPC': ['Cognitive Performance'],
    'Ginkgo Biloba': ['Cognitive Performance'],
    'Citicoline': ['Cognitive Performance'],
    'Phosphatidylserine': ['Cognitive Performance'],
    'Huperzine A': ['Cognitive Performance'],
    'Panax Ginseng': ['Cognitive Performance', 'Energy & Vitality'],
    'Vinpocetine': ['Cognitive Performance'],
    'Aniracetam': ['Cognitive Performance'],
    'Piracetam': ['Cognitive Performance'],
    'DMAE': ['Cognitive Performance'],
    'Centella Asiatica': ['Cognitive Performance'],
    'Sulbutiamine': ['Cognitive Performance', 'Energy & Vitality'],
    'Omega-3 Fatty Acids': ['Cardiovascular', 'Cognitive Performance'],
    'CoQ10': ['Cardiovascular', 'Energy & Vitality'],
    'Berberine': ['Cardiovascular', 'Metabolic Health'],
    'Garlic': ['Cardiovascular', 'Immune Function'],
    'Red Yeast Rice': ['Cardiovascular'],
    'Hawthorn Berry': ['Cardiovascular'],
    'Grape Seed Extract': ['Cardiovascular', 'Immune Function'],
    'Krill Oil': ['Cardiovascular'],
    'Vitamin C': ['Immune Function'],
    'Zinc': ['Immune Function'],
    'Elderberry': ['Immune Function'],
    'Echinacea': ['Immune Function'],
    'Selenium': ['Immune Function'],
    'Spirulina': ['Immune Function'],
    'Reishi Mushroom': ['Immune Function'],
    'Vitamin D3': ['Immune Function', 'Cardiovascular'],
    'Glucosamine': ['Joint Health'],
    'Chondroitin Sulfate': ['Joint Health'],
    'MSM': ['Joint Health'],
    'Boswellia': ['Joint Health'],
    'Turmeric/Curcumin': ['Joint Health', 'Cardiovascular'],
    'Stinging Nettle': ['Joint Health'],
    'Pine Bark Extract': ['Joint Health'],
    'Chromium': ['Metabolic Health'],
    'Cinnamon Extract': ['Metabolic Health'],
    'Bitter Melon': ['Metabolic Health'],
    'Gymnema Sylvestre': ['Metabolic Health'],
    'Fenugreek': ['Metabolic Health'],
    'Alpha-Lipoic Acid': ['Metabolic Health'],
    'Green Tea Extract': ['Metabolic Health', 'Energy & Vitality'],
    'Creatine': ['Energy & Vitality', 'Cognitive Performance'],
    'Caffeine': ['Energy & Vitality', 'Cognitive Performance'],
    'Iron': ['Energy & Vitality'],
    'Cordyceps': ['Energy & Vitality'],
    'MCT Oil': ['Energy & Vitality'],
    'Beta-Alanine': ['Energy & Vitality'],
    'Citrulline Malate': ['Energy & Vitality'],
    'HMB': ['Energy & Vitality'],
    'Betaine': ['Energy & Vitality'],
    'B-Complex Vitamins': ['Energy & Vitality'],
    'Vitamin B12': ['Energy & Vitality', 'Cognitive Performance'],
    'Vitamin B6': ['Energy & Vitality'],
    'Folate': ['Cardiovascular'],
    'Acetyl-L-Carnitine': ['Cognitive Performance', 'Energy & Vitality'],
    'L-Tyrosine': ['Cognitive Performance', 'Energy & Vitality'],
    'Taurine': ['Cardiovascular', 'Energy & Vitality'],
    'Choline Bitartrate': ['Cognitive Performance'],
    'Whey Protein': ['Energy & Vitality'],
    'Tribulus Terrestris': ['Energy & Vitality'],
    'PQQ': ['Energy & Vitality', 'Cognitive Performance'],
    'NAD+ Precursors': ['Energy & Vitality'],
    'Resveratrol': ['Cardiovascular'],
    'Quercetin': ['Immune Function'],
    'Vitamin E': ['Cardiovascular'],
    'Lutein': ['Cognitive Performance'],
    'Astaxanthin': ['Cardiovascular'],
    'Ginger': ['Joint Health', 'Immune Function'],
    'Chlorella': ['Immune Function'],
    'PEA': ['Joint Health'],
    'Vanadium': ['Metabolic Health'],
    'Schisandra Berry': ['Anxiety & Stress', 'Energy & Vitality'],
    'Mucuna Pruriens': ['Cognitive Performance'],
    'Forskolin': ['Metabolic Health'],
    'Milk Thistle': ['Metabolic Health'],
    'Black Seed Oil': ['Immune Function', 'Metabolic Health'],
    'Moringa': ['Immune Function'],
    'Zeaxanthin': ['Cognitive Performance'],
    'Pterostilbene': ['Cardiovascular']
};

// Comparison articles: each supplement's comparisons
const COMPARISONS_LIST = [
    { slug: 'ashwagandha-vs-rhodiola', names: ['Ashwagandha', 'Rhodiola rosea'], title: 'Ashwagandha vs Rhodiola' },
    { slug: 'magnesium-vs-melatonin', names: ['Magnesium', 'Melatonin'], title: 'Magnesium vs Melatonin' },
    { slug: 'omega-3-vs-coq10', names: ['Omega-3 Fatty Acids', 'CoQ10'], title: 'Omega-3 vs CoQ10' },
    { slug: 'bacopa-vs-ginkgo', names: ['Bacopa monnieri', 'Ginkgo Biloba'], title: 'Bacopa vs Ginkgo Biloba' },
    { slug: 'lions-mane-vs-bacopa', names: ["Lion's Mane Mushroom", 'Bacopa monnieri'], title: "Lion's Mane vs Bacopa" },
    { slug: 'creatine-vs-beta-alanine', names: ['Creatine', 'Beta-Alanine'], title: 'Creatine vs Beta-Alanine' },
    { slug: 'vitamin-d-vs-magnesium', names: ['Vitamin D3', 'Magnesium'], title: 'Vitamin D vs Magnesium' },
    { slug: 'turmeric-vs-boswellia', names: ['Turmeric/Curcumin', 'Boswellia'], title: 'Turmeric vs Boswellia' },
    { slug: 'l-theanine-vs-5-htp', names: ['L-Theanine', '5-HTP'], title: 'L-Theanine vs 5-HTP' },
    { slug: 'coq10-vs-pqq', names: ['CoQ10', 'PQQ'], title: 'CoQ10 vs PQQ' }
];

function getRelatedGuides(suppName) {
    const domains = SUPPLEMENT_GUIDE_RELEVANCE[suppName] || [];
    return domains.map(d => GUIDE_MAP[d]).filter(Boolean);
}

function getRelatedComparisons(suppName) {
    return COMPARISONS_LIST
        .filter(c => c.names.includes(suppName))
        .map(c => ({ title: c.title, url: `../compare/${c.slug}.html` }));
}

function getCategoryPage(category) {
    const norm = normalizeCategory(category);
    return CATEGORY_PAGE_MAP[norm] || null;
}

// ── Enhanced Citation Rendering Helpers ───────────────────────────────────

function renderEnhancedCitationSection(sectionTitle, icon, citations) {
    if (!citations || citations.length === 0) return '';

    // Determine evidence strength class from string
    function strengthClass(str) {
        if (!str) return '';
        const lower = str.toLowerCase();
        if (lower.includes('strong') || lower.includes('robust') || lower.includes('well-established')) return 'evidence-tag-strong';
        if (lower.includes('moderate') || lower.includes('promising')) return 'evidence-tag-moderate';
        if (lower.includes('preliminary') || lower.includes('emerging') || lower.includes('limited')) return 'evidence-tag-preliminary';
        if (lower.includes('meta') || lower.includes('systematic')) return 'evidence-tag-meta';
        return '';
    }

    let html = `<div class="citation-group">
        <h4 class="citation-group-header"><i class="fas fa-${icon}"></i>${esc(sectionTitle)}</h4>\n`;

    citations.forEach((cit, idx) => {
        // Normalize: some entries use "mechanism" or "safetyAspect" instead of "claim"
        const displayTitle = cit.claim || cit.mechanism || cit.safetyAspect || cit.dosageContext || '';
        // Normalize: "evidence" can be array of study objects or a string; "studies" is the v1.0 array
        const studiesArr = cit.studies || (Array.isArray(cit.evidence) ? cit.evidence : null);
        const evidenceStr = typeof cit.evidence === 'string' ? cit.evidence : null;
        const strengthStr = cit.strength || cit.riskLevel || evidenceStr || '';

        // Handle flat format (no nested studies — v2.0 with string evidence)
        if (displayTitle && !studiesArr) {
            html += `        <div class="evidence-card">
            <p class="evidence-card-title">${esc(displayTitle)}</p>
            <div class="evidence-tags">
                ${strengthStr ? `<span class="evidence-tag ${strengthClass(strengthStr)}">${esc(strengthStr)}</span>` : ''}
                ${cit.studyType ? `<span class="evidence-tag">${esc(cit.studyType)}</span>` : ''}
                ${cit.year ? `<span class="evidence-tag">${esc(String(cit.year))}</span>` : ''}
                ${cit.participants ? `<span class="evidence-tag">n=${esc(cit.participants)}</span>` : ''}
                ${cit.duration ? `<span class="evidence-tag">${esc(cit.duration)}</span>` : ''}
            </div>
            ${cit.details ? `<p class="evidence-details">${esc(cit.details)}</p>` : ''}
            ${cit.pmid ? `<p class="evidence-link"><a href="https://pubmed.ncbi.nlm.nih.gov/${esc(cit.pmid)}/" target="_blank" rel="noopener">PubMed: ${esc(cit.pmid)}</a></p>` : ''}
        </div>\n`;
        }
        // Handle nested studies format (v1.0 with studies[] or evidence[] array)
        else if (displayTitle && studiesArr && studiesArr.length > 0) {
            html += `        <div class="evidence-card">
            <p class="evidence-card-title">${esc(displayTitle)}</p>
            <div class="evidence-tags">
                ${strengthStr ? `<span class="evidence-tag ${strengthClass(strengthStr)}">${esc(strengthStr)}</span>` : ''}
                ${cit.replicationStatus ? `<span class="evidence-tag">${esc(cit.replicationStatus)}</span>` : ''}
                ${cit.populationTarget ? `<span class="evidence-tag">${esc(cit.populationTarget)}</span>` : ''}
            </div>
            <div class="study-list">\n`;

            studiesArr.forEach(study => {
                const studyFindings = study.keyFindings || study.findings || '';
                html += `                <div class="study-item">
                    <p class="study-title">${esc(study.title || '')}</p>
                    <p class="study-meta">${esc(Array.isArray(study.authors) ? study.authors.join(', ') : (study.authors || ''))} (${esc(String(study.year || ''))}) — <em>${esc(study.journal || '')}</em></p>
                    ${studyFindings ? `<p class="study-findings">${esc(studyFindings)}</p>` : ''}
                    ${study.pmid ? `<a class="study-link" href="https://pubmed.ncbi.nlm.nih.gov/${esc(study.pmid)}/" target="_blank" rel="noopener">PubMed: ${esc(study.pmid)}</a>` : ''}
                </div>\n`;
            });

            html += `            </div>
        </div>\n`;
        }
    });

    html += `    </div>\n`;
    return html;
}

// ── Page Generator ────────────────────────────────────────────────────────

function generateSupplementPage(s) {
    const suppSlug = slugify(s.name);
    const norm = normalizeCategory(s.category);
    const catPage = getCategoryPage(s.category);
    const relatedGuides = getRelatedGuides(s.name);
    const relatedComparisons = getRelatedComparisons(s.name);

    // Load enhanced citations if available
    const enhanced = loadEnhancedCitation(s);
    const hasEnhanced = !!(enhanced && enhanced.citations);

    // Data extraction
    const cogBenefits = s.primaryBenefits?.cognitive || [];
    const nonCogBenefits = s.primaryBenefits?.nonCognitive || [];
    const allBenefits = [...cogBenefits, ...nonCogBenefits];
    const mechanisms = s.mechanismsOfAction || [];
    const sideEffects = s.safetyProfile?.commonSideEffects || [];
    const contraindications = s.safetyProfile?.contraindications || [];
    const drugInteractions = s.safetyProfile?.drugInteractions || [];
    const effectEntries = Object.entries(s.effectSizes || {});
    const keyCitations = s.keyCitations || [];
    const commonNames = s.commonNames || [];
    const forms = s.commercialAvailability?.forms || [];
    const costRange = s.commercialAvailability?.costRange || '';
    const qualityMarkers = s.commercialAvailability?.qualityMarkers || [];
    const studyPops = s.studyPopulations || [];
    const safetyRating = s.safetyProfile?.rating || 'Unknown';

    // Count total citations
    let enhancedCitCount = 0;
    if (hasEnhanced) {
        const cits = enhanced.citations;
        enhancedCitCount = (cits.mechanisms || []).length + (cits.benefits || []).length +
            (cits.safety || []).length + (cits.dosage || []).length;
    }
    const totalCitations = keyCitations.length + enhancedCitCount;

    // Meta strings
    const metaTitle = `${s.name} — Evidence-Based Guide | SupplementDB`;
    const metaDesc = `Comprehensive evidence review for ${s.name}${s.scientificName && s.scientificName !== s.name ? ` (${s.scientificName})` : ''}. Tier ${s.evidenceTier} evidence with ${totalCitations}+ citations covering benefits, dosage, safety, and mechanisms of action.`;

    // ── Build HTML ────────────────────────────────────────────────────────

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(metaDesc)}">
    <link rel="canonical" href="${SITE_URL}/supplements/${suppSlug}.html">
    <meta property="og:title" content="${esc(metaTitle)}">
    <meta property="og:description" content="${esc(metaDesc)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${SITE_URL}/supplements/${suppSlug}.html">
    <meta property="og:site_name" content="SupplementDB">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(metaTitle)}">
    <meta name="twitter:description" content="${esc(metaDesc)}">

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
    <link rel="stylesheet" href="../css/content-shared.css?v=${Date.now()}">

    <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "name": s.name,
        "headline": metaTitle,
        "description": metaDesc,
        "datePublished": TODAY,
        "dateModified": TODAY,
        "publisher": {
            "@type": "Organization",
            "name": "SupplementDB",
            "url": SITE_URL
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${SITE_URL}/supplements/${suppSlug}.html`
        },
        "about": {
            "@type": "DietarySupplement",
            "name": s.name,
            "alternateName": commonNames.length > 0 ? commonNames[0] : undefined,
            "activeIngredient": s.scientificName || s.name
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
            <a href="../index.html#database">Supplements</a>
            <span class="separator"><i class="fas fa-chevron-right"></i></span>
            <span class="current">${esc(s.name)}</span>
        </nav>

        <!-- Hero -->
        <header class="guide-hero monograph-hero">
            <div class="monograph-badges">
                ${tierBadgeHtml(s.evidenceTier)}
                <span class="monograph-badge monograph-badge-category">${esc(norm)}</span>
                ${safetyRating ? `<span class="monograph-badge monograph-badge-safety" data-safety="${esc(safetyRating.toLowerCase())}">${esc(safetyRating)}</span>` : ''}
            </div>
            <h1>${esc(s.name)}</h1>
            ${s.scientificName && s.scientificName !== s.name ? `<p class="scientific-name">${esc(s.scientificName)}</p>` : ''}
            ${commonNames.length > 0 ? `<p class="common-names">Also known as: ${commonNames.map(n => esc(n)).join(', ')}</p>` : ''}
            <p class="hero-subtitle">${esc(s.evidenceTierRationale || `Comprehensive evidence review covering benefits, mechanisms, dosage, and safety profile.`)}</p>
            <div class="monograph-stats">
                <div class="monograph-stat"><i class="fas fa-book-open"></i> ${totalCitations}+ Citations</div>
                <div class="monograph-stat"><i class="fas fa-flask"></i> Tier ${s.evidenceTier}: ${getTierLabel(s.evidenceTier)}</div>
                <div class="monograph-stat"><i class="fas fa-shield-alt"></i> Safety: ${esc(safetyRating)}</div>
                <div class="monograph-stat"><i class="fas fa-calendar"></i> Updated ${TODAY}</div>
            </div>
        </header>

        <!-- Share Bar -->
        <div class="share-bar">
            <span class="share-bar-label">Share this monograph</span>
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
            <!-- Sidebar -->
            <aside class="guide-sidebar">
                <nav class="sidebar-toc">
                    <h4>Contents</h4>
                    <ul>
                        <li><a href="#quick-facts">Quick Facts</a></li>
                        <li><a href="#overview">Overview</a></li>
                        <li><a href="#mechanisms">Mechanisms of Action</a></li>
                        <li><a href="#benefits">Benefits</a></li>
                        ${effectEntries.length > 0 ? '<li><a href="#effect-sizes">Effect Sizes</a></li>' : ''}
                        <li><a href="#dosage">Dosage & Administration</a></li>
                        <li><a href="#safety">Safety Profile</a></li>
                        ${hasEnhanced ? '<li><a href="#enhanced-evidence">Enhanced Evidence</a></li>' : ''}
                        <li><a href="#references">References</a></li>
                        <li><a href="#related">Related Content</a></li>
                    </ul>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="guide-main">
                <!-- Quick Facts Card -->
                <section class="content-section" id="quick-facts">
                    <h2><i class="fas fa-info-circle section-icon"></i> Quick Facts</h2>
                    <div class="table-responsive">
                        <table class="monograph-facts-table">
                            <tbody>
                                <tr><td><strong>Evidence Tier</strong></td><td>${tierBadgeHtml(s.evidenceTier)}</td></tr>
                                <tr><td><strong>Category</strong></td><td>${esc(norm)}</td></tr>
                                ${s.scientificName ? `<tr><td><strong>Scientific Name</strong></td><td><em>${esc(s.scientificName)}</em></td></tr>` : ''}
                                <tr><td><strong>Clinical Dosage</strong></td><td>${esc(s.dosageRange || 'See studies')}</td></tr>
                                <tr><td><strong>Optimal Duration</strong></td><td>${esc(s.optimalDuration || 'Varies')}</td></tr>
                                <tr><td><strong>Safety Rating</strong></td><td>${safetyRatingBadge(safetyRating)}</td></tr>
                                ${forms.length > 0 ? `<tr><td><strong>Available Forms</strong></td><td>${forms.map(f => esc(f)).join(', ')}</td></tr>` : ''}
                                ${costRange ? `<tr><td><strong>Cost Range</strong></td><td>${esc(costRange)}</td></tr>` : ''}
                                ${qualityMarkers.length > 0 ? `<tr><td><strong>Quality Markers</strong></td><td>${qualityMarkers.map(q => esc(q)).join(', ')}</td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- Overview -->
                <section class="content-section" id="overview">
                    <h2><i class="fas fa-file-alt section-icon"></i> Overview</h2>
                    <div class="snippet-paragraph">
                        <p>${esc(s.name)} is classified as ${esc(norm.toLowerCase())} with ${esc(getTierLabel(s.evidenceTier).toLowerCase())} (Tier ${s.evidenceTier}) for its primary applications. ${esc(s.evidenceTierRationale || '')}</p>
`;

    if (hasEnhanced && enhanced.evidenceProfile?.keyFindings) {
        html += `                        <p class="key-findings">${esc(enhanced.evidenceProfile.keyFindings)}</p>\n`;
    }

    if (studyPops.length > 0) {
        html += `                        <p class="study-populations"><strong>Key study populations:</strong> ${studyPops.map(p => esc(p)).join('; ')}</p>\n`;
    }

    html += `                    </div>
                </section>

                <!-- Mechanisms of Action -->
                <section class="content-section" id="mechanisms">
                    <h2><i class="fas fa-cogs section-icon"></i> Mechanisms of Action</h2>
`;

    if (mechanisms.length > 0) {
        html += `                    <div class="mechanism-grid">\n`;
        mechanisms.forEach((mech, idx) => {
            html += `                        <div class="mechanism-card">
                            <div class="mechanism-num">${idx + 1}</div>
                            <p class="mechanism-text">${esc(mech)}</p>
                        </div>\n`;
        });
        html += `                    </div>\n`;
    } else {
        html += `                    <p class="text-muted">Mechanism data not yet available for this supplement.</p>\n`;
    }

    html += `                </section>

                <!-- Benefits -->
                <section class="content-section" id="benefits">
                    <h2><i class="fas fa-check-circle section-icon"></i> Benefits</h2>
`;

    if (cogBenefits.length > 0) {
        html += `                    <h3>Cognitive Benefits</h3>
                    <ul class="benefit-list">\n`;
        cogBenefits.forEach(b => {
            html += `                        <li>${esc(b)}</li>\n`;
        });
        html += `                    </ul>\n`;
    }

    if (nonCogBenefits.length > 0) {
        html += `                    <h3>Non-Cognitive Benefits</h3>
                    <ul class="benefit-list">\n`;
        nonCogBenefits.forEach(b => {
            html += `                        <li>${esc(b)}</li>\n`;
        });
        html += `                    </ul>\n`;
    }

    if (allBenefits.length === 0) {
        html += `                    <p class="text-muted">Benefit data not yet available for this supplement.</p>\n`;
    }

    html += `                </section>
`;

    // Effect Sizes
    if (effectEntries.length > 0) {
        html += `                <!-- Effect Sizes -->
                <section class="content-section" id="effect-sizes">
                    <h2><i class="fas fa-chart-bar section-icon"></i> Effect Sizes</h2>
                    <p class="section-intro">Quantified effect sizes from clinical research, where available.</p>
                    <div class="table-responsive">
                        <table class="effect-table">
                            <thead>
                                <tr>
                                    <th>Domain</th>
                                    <th>Effect Size / Finding</th>
                                </tr>
                            </thead>
                            <tbody>\n`;
        effectEntries.forEach(([domain, value]) => {
            const domainLabel = domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            html += `                                <tr>
                                    <td class="effect-domain">${esc(domainLabel)}</td>
                                    <td class="effect-value">${esc(String(value))}</td>
                                </tr>\n`;
        });
        html += `                            </tbody>
                        </table>
                    </div>
                </section>
`;
    }

    // Dosage & Administration
    html += `                <!-- Dosage & Administration -->
                <section class="content-section" id="dosage">
                    <h2><i class="fas fa-prescription-bottle-alt section-icon"></i> Dosage & Administration</h2>
                    <div class="table-responsive">
                        <table class="snippet-table">
                            <tbody>
                                <tr><td><strong>Clinical Dosage Range</strong></td><td>${esc(s.dosageRange || 'Varies — consult studies')}</td></tr>
                                <tr><td><strong>Optimal Duration</strong></td><td>${esc(s.optimalDuration || 'Varies by application')}</td></tr>
                                ${forms.length > 0 ? `<tr><td><strong>Available Forms</strong></td><td>${forms.map(f => esc(f)).join(', ')}</td></tr>` : ''}
                                ${qualityMarkers.length > 0 ? `<tr><td><strong>Quality Markers</strong></td><td>${qualityMarkers.map(q => esc(q)).join(', ')}</td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>
`;

    if (studyPops.length > 0) {
        html += `                    <h3>Study Populations</h3>
                    <ul class="benefit-list">\n`;
        studyPops.forEach(pop => {
            html += `                        <li>${esc(pop)}</li>\n`;
        });
        html += `                    </ul>\n`;
    }

    html += `                </section>

                <!-- Safety Profile -->
                <section class="content-section" id="safety">
                    <h2><i class="fas fa-shield-alt section-icon"></i> Safety Profile</h2>
                    <div class="safety-rating-box">
                        <div class="safety-rating-label">
                            <strong>Overall Safety Rating:</strong> ${safetyRatingBadge(safetyRating)}
                        </div>
                    </div>
`;

    if (sideEffects.length > 0) {
        html += `                    <h3>Common Side Effects</h3>
                    <ul class="safety-list">\n`;
        sideEffects.forEach(se => {
            html += `                        <li>${esc(se)}</li>\n`;
        });
        html += `                    </ul>\n`;
    }

    if (contraindications.length > 0) {
        html += `                    <h3>Contraindications</h3>
                    <div class="safety-contraindications">
                        <ul>\n`;
        contraindications.forEach(ci => {
            html += `                            <li>${esc(ci)}</li>\n`;
        });
        html += `                        </ul>
                    </div>\n`;
    }

    if (drugInteractions.length > 0) {
        html += `                    <h3>Drug Interactions</h3>
                    <div class="safety-interactions">
                        <ul>\n`;
        drugInteractions.forEach(di => {
            html += `                            <li>${esc(di)}</li>\n`;
        });
        html += `                        </ul>
                    </div>\n`;
    }

    html += `                </section>
`;

    // Enhanced Evidence Section
    if (hasEnhanced) {
        const cits = enhanced.citations;
        html += `                <!-- Enhanced Evidence -->
                <section class="content-section" id="enhanced-evidence">
                    <h2><i class="fas fa-microscope section-icon"></i> Enhanced Evidence Review</h2>
                    <p class="section-intro">Detailed citation analysis from ${enhancedCitCount} peer-reviewed sources, organized by research domain.</p>
`;
        html += renderEnhancedCitationSection('Mechanisms of Action', 'cogs', cits.mechanisms || []);
        html += renderEnhancedCitationSection('Clinical Benefits', 'chart-line', cits.benefits || []);
        html += renderEnhancedCitationSection('Safety & Tolerability', 'shield-alt', cits.safety || []);
        html += renderEnhancedCitationSection('Dosage Research', 'prescription-bottle-alt', cits.dosage || []);

        html += `                </section>
`;
    }

    // References
    html += `                <!-- References -->
                <section class="content-section" id="references">
                    <h2><i class="fas fa-book section-icon"></i> References</h2>
`;

    if (keyCitations.length > 0) {
        html += `                    <ol class="references-list">\n`;
        keyCitations.forEach(c => {
            const authors = c.authors || 'Unknown authors';
            const year = c.year || '';
            const title = c.title || 'Untitled';
            const journal = c.journal || '';
            const doi = c.doi || '';
            const pmid = c.pmid || '';
            html += `                        <li>${esc(authors)} (${esc(String(year))}). ${esc(title)}. <em>${esc(journal)}</em>.${doi ? ` DOI: <a href="https://doi.org/${esc(doi)}" target="_blank" rel="noopener">${esc(doi)}</a>` : ''}${pmid ? ` | <a href="https://pubmed.ncbi.nlm.nih.gov/${esc(pmid)}/" target="_blank" rel="noopener">PubMed</a>` : ''}</li>\n`;
        });
        html += `                    </ol>\n`;
    } else {
        html += `                    <p class="text-muted">Key citations will be added in a future update.</p>\n`;
    }

    html += `                </section>

                <!-- Related Content -->
                <section class="content-section" id="related">
                    <h2><i class="fas fa-link section-icon"></i> Related Content</h2>
                    <div class="related-grid">
`;

    // Category link
    if (catPage) {
        html += `                        <a href="${catPage.url}" class="related-card">
                            <i class="fas fa-th-large related-card-icon"></i>
                            <strong>${esc(catPage.title)}</strong>
                            <p class="related-card-desc">Browse category</p>
                        </a>\n`;
    }

    // Guide links
    relatedGuides.forEach(guide => {
        html += `                        <a href="${guide.url}" class="related-card">
                            <i class="fas fa-book-reader related-card-icon"></i>
                            <strong>${esc(guide.title)}</strong>
                            <p class="related-card-desc">Evidence guide</p>
                        </a>\n`;
    });

    // Comparison links
    relatedComparisons.forEach(comp => {
        html += `                        <a href="${comp.url}" class="related-card">
                            <i class="fas fa-balance-scale related-card-icon"></i>
                            <strong>${esc(comp.title)}</strong>
                            <p class="related-card-desc">Head-to-head comparison</p>
                        </a>\n`;
    });

    html += `                    </div>
                </section>

                <!-- Medical Disclaimer -->
                <section class="content-section disclaimer-box">
                    <h3 class="disclaimer-title"><i class="fas fa-exclamation-triangle"></i> Medical Disclaimer</h3>
                    <p class="disclaimer-text">This monograph is for informational purposes only and does not constitute medical advice. The evidence presented is based on published research and does not replace consultation with a qualified healthcare provider. Supplement efficacy varies by individual, and interactions with medications or health conditions require professional evaluation. Always consult your physician before starting any new supplement regimen.</p>
                </section>

            </main>
        </div>
    </div>

    <!-- Footer -->
    <footer class="monograph-footer">
        <div class="monograph-footer-inner">
            <p class="footer-brand"><strong>SupplementDB</strong> &mdash; Evidence-based supplement research</p>
            <p class="footer-disclaimer">Data sourced from peer-reviewed studies. Not medical advice. Consult a healthcare provider.</p>
            <div class="footer-links">
                <a href="../index.html">Database</a>
                <a href="../about.html">About</a>
                <a href="../methodology.html">Methodology</a>
                <a href="../faq.html">FAQ</a>
                <a href="../legal/terms.html">Terms</a>
                <a href="../legal/privacy.html">Privacy</a>
            </div>
            <p class="footer-copyright">&copy; ${new Date().getFullYear()} SupplementDB. All rights reserved.</p>
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

// ── Main Execution ────────────────────────────────────────────────────────

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`\n🧬 Generating ${db.supplements.length} supplement monograph pages...\n`);

let generated = 0;
let enhanced = 0;
let errors = 0;

db.supplements.forEach(s => {
    try {
        const suppSlug = slugify(s.name);
        const html = generateSupplementPage(s);
        if (!html) {
            console.error(`  ✗ Failed to generate page for: ${s.name}`);
            errors++;
            return;
        }
        const outPath = path.join(OUTPUT_DIR, `${suppSlug}.html`);
        fs.writeFileSync(outPath, html, 'utf8');

        const hasEnh = !!(loadEnhancedCitation(s)?.citations);
        if (hasEnh) enhanced++;
        generated++;

        const sizeKb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
        console.log(`  ✓ ${s.name} (ID ${s.id}, Tier ${s.evidenceTier}${hasEnh ? ', enhanced' : ''}) → ${suppSlug}.html (${sizeKb} KB)`);
    } catch (e) {
        console.error(`  ✗ Error generating ${s.name}: ${e.message}`);
        errors++;
    }
});

console.log(`\n📊 Generation complete:`);
console.log(`   ✅ Generated: ${generated}/${db.supplements.length}`);
console.log(`   🔬 Enhanced:  ${enhanced}`);
console.log(`   ❌ Errors:    ${errors}`);
console.log(`   📁 Output:    ${OUTPUT_DIR}\n`);
