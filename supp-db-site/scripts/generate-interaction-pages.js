#!/usr/bin/env node
/**
 * Supplement Interaction Checker — Page Generator
 *
 * Produces:
 *   /interactions/index.html            — hub page with interactive search
 *   /interactions/{category-slug}.html  — one SEO landing page per drug category
 *
 * Source data:
 *   data/supplements.js               — 114 supplements with safetyProfile.drugInteractions[]
 *   data/interaction-categories.js    — normalized drug category taxonomy
 *
 * Output data (client-side consumption):
 *   data/interactions-index.json      — normalized lookup table for the hub-page search
 */

const fs = require('fs');
const path = require('path');
const { loadSupplementData, slugify } = require('./parse-data');
const {
    INTERACTION_CATEGORIES,
    AVOID_KEYWORDS,
    SAFE_KEYWORDS
} = require('../data/interaction-categories');

const SITE_URL = 'https://supplementdb.info';
const OUT_DIR = path.join(__dirname, '..', 'interactions');
const DATA_DIR = path.join(__dirname, '..', 'data');
const TODAY = new Date().toISOString().slice(0, 10);

const escHtml = (s) =>
    String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

// ─────────────────────────────────────────────────────────────────────────────
// Normalization
// ─────────────────────────────────────────────────────────────────────────────

function classifyInteraction(rawText) {
    const lower = rawText.toLowerCase().trim();

    for (const kw of SAFE_KEYWORDS) {
        if (lower.includes(kw)) {
            return [{ categorySlug: null, severity: 'safe', rawText }];
        }
    }

    const matches = [];
    for (const cat of INTERACTION_CATEGORIES) {
        for (const alias of cat.aliases) {
            if (lower.includes(alias)) {
                let severity = cat.defaultSeverity;
                for (const kw of AVOID_KEYWORDS) {
                    if (lower.includes(kw)) {
                        severity = 'avoid';
                        break;
                    }
                }
                matches.push({ categorySlug: cat.slug, severity, rawText });
                break;
            }
        }
    }

    if (matches.length === 0) {
        return [{ categorySlug: 'other', severity: 'caution', rawText }];
    }
    return matches;
}

function buildNormalizedIndex(supplements) {
    const perSupplement = [];
    const perCategory = {};
    INTERACTION_CATEGORIES.forEach((c) => { perCategory[c.slug] = []; });
    perCategory['other'] = [];

    for (const s of supplements) {
        const raws = s?.safetyProfile?.drugInteractions || [];
        const slug = slugify(s.name);
        const entry = {
            name: s.name,
            slug,
            category: s.category || '',
            evidenceTier: s.evidenceTier || null,
            interactions: []
        };

        if (raws.length === 0) {
            entry.interactions.push({ categorySlug: null, severity: 'safe', rawText: 'None reported' });
        } else {
            const seen = new Set();
            for (const raw of raws) {
                const classified = classifyInteraction(raw);
                for (const c of classified) {
                    const key = `${c.categorySlug}|${c.rawText}`;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    entry.interactions.push(c);
                    if (c.categorySlug && perCategory[c.categorySlug]) {
                        perCategory[c.categorySlug].push({
                            supplement: s.name,
                            slug,
                            severity: c.severity,
                            rawText: c.rawText,
                            evidenceTier: s.evidenceTier || null
                        });
                    }
                }
            }
        }

        perSupplement.push(entry);
    }

    const sevOrder = { avoid: 0, caution: 1, monitor: 2, safe: 3 };
    for (const slug of Object.keys(perCategory)) {
        perCategory[slug].sort((a, b) => {
            const s = (sevOrder[a.severity] || 9) - (sevOrder[b.severity] || 9);
            if (s !== 0) return s;
            return a.supplement.localeCompare(b.supplement);
        });
    }
    perSupplement.sort((a, b) => a.name.localeCompare(b.name));

    return { perSupplement, perCategory };
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML shared
// ─────────────────────────────────────────────────────────────────────────────

const SHARED_HEAD = (title, desc, canonical, ogImg = '/assets/og-default.svg') => `    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Anchor all relative paths to /interactions/ so they resolve correctly
         under Vercel cleanUrls + trailingSlash:false (which strips the
         trailing slash and would otherwise break hub-page relative hrefs). -->
    <base href="/interactions/">
    <title>${escHtml(title)}</title>
    <meta name="description" content="${escHtml(desc)}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${escHtml(title)}">
    <meta property="og:description" content="${escHtml(desc)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${SITE_URL}${ogImg}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="SupplementDB">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escHtml(title)}">
    <meta name="twitter:description" content="${escHtml(desc)}">
    <meta name="twitter:image" content="${SITE_URL}${ogImg}">
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
    <meta name="clerk-key" content="__CLERK_PUBLISHABLE_KEY__">
    <meta name="convex-url" content="__CONVEX_URL__">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../legal/legal-shared.css">
    <link rel="stylesheet" href="../css/content-shared.css">
    <link rel="stylesheet" href="interactions.css">`;

const SHARED_NAV = `<nav class="legal-nav">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="../index.html" class="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity">
            <i class="fas fa-pills text-xl"></i>
            <span class="font-bold text-lg">SupplementDB</span>
        </a>
        <div class="flex items-center space-x-4">
            <a href="../index.html" class="text-gray-300 hover:text-white text-sm">
                <i class="fas fa-arrow-left mr-1"></i> Back to Database
            </a>
            <div id="auth-buttons"></div>
        </div>
    </div>
</nav>`;

const SHARED_FOOTER = `<footer class="interactions-footer">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-400">
        <p class="mb-2"><strong>Medical disclaimer:</strong> This tool is for educational use only and does not replace the advice of a licensed healthcare provider. Interactions listed here are derived from published safety summaries and may not reflect every known or theoretical interaction. Always consult your prescriber before combining supplements with any prescription medication.</p>
        <p class="text-gray-500">Data sourced from the SupplementDB monograph library (${TODAY}).</p>
    </div>
</footer>`;

const SHARED_SCRIPTS = `<script src="../js/auth.js" defer></script>
<script src="../js/convex-client.js" defer></script>
<script src="../js/auth-ui.js" defer></script>`;

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────

const INTERACTIONS_CSS = `/* interactions.css — Supplement Interaction Checker styles */
body.interactions-page { background: #0a0e17; color: #e5e7eb; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
.interactions-hero { padding: 3rem 1rem 2rem; text-align: center; }
.interactions-hero h1 { font-family: 'Source Serif 4', serif; font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 700; color: #fff; line-height: 1.15; margin-bottom: 0.75rem; }
.interactions-hero .lede { color: #9ca3af; max-width: 42rem; margin: 0 auto; font-size: 1.05rem; line-height: 1.6; }
.interactions-shell { max-width: 72rem; margin: 0 auto; padding: 0 1rem 4rem; }
.interactions-search-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.5rem; margin-bottom: 2rem; }
.interactions-search-card h2 { font-family: 'Source Serif 4', serif; font-size: 1.35rem; font-weight: 600; color: #fff; margin-bottom: 0.75rem; }
.interactions-search-input { width: 100%; background: #111827; border: 1px solid #374151; border-radius: 10px; padding: 0.75rem 1rem; color: #fff; font-size: 1rem; }
.interactions-search-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
.interactions-results { margin-top: 1rem; max-height: 26rem; overflow-y: auto; border-radius: 10px; background: rgba(0,0,0,0.25); }
.interactions-result-row { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.interactions-result-row:last-child { border-bottom: none; }
.interactions-result-row:hover, .interactions-result-row.active { background: rgba(59,130,246,0.08); }
.interactions-result-row .supp-name { color: #fff; font-weight: 500; }
.interactions-result-row .supp-meta { color: #6b7280; font-size: 0.85rem; }
.interactions-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.5rem; margin-bottom: 1.5rem; }
.interactions-panel h3 { font-family: 'Source Serif 4', serif; font-size: 1.25rem; font-weight: 600; color: #fff; margin-bottom: 0.75rem; }
.interaction-item { padding: 1rem; background: #111827; border-radius: 10px; border-left: 4px solid #6b7280; margin-bottom: 0.75rem; }
.interaction-item.sev-avoid { border-left-color: #dc2626; }
.interaction-item.sev-caution { border-left-color: #f59e0b; }
.interaction-item.sev-monitor { border-left-color: #3b82f6; }
.interaction-item.sev-safe { border-left-color: #10b981; }
.interaction-item .badge { display: inline-block; padding: 0.15rem 0.55rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-right: 0.5rem; }
.badge.sev-avoid { background: rgba(220,38,38,0.15); color: #fca5a5; }
.badge.sev-caution { background: rgba(245,158,11,0.15); color: #fbbf24; }
.badge.sev-monitor { background: rgba(59,130,246,0.15); color: #93c5fd; }
.badge.sev-safe { background: rgba(16,185,129,0.15); color: #6ee7b7; }
.interaction-item .category { font-weight: 600; color: #fff; margin-bottom: 0.25rem; }
.interaction-item .raw-text { color: #d1d5db; font-size: 0.95rem; }
.interaction-item .advice-text { margin-top: 0.45rem; color: #9ca3af; font-size: 0.88rem; }
.interaction-item .drill-link { display: inline-block; margin-top: 0.45rem; color: #60a5fa; font-size: 0.85rem; text-decoration: none; }
.interaction-item .drill-link:hover { text-decoration: underline; }
.categories-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.category-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem; transition: all 0.15s; }
.category-card:hover { border-color: rgba(59,130,246,0.5); transform: translateY(-1px); }
.category-card h3 { font-family: 'Source Serif 4', serif; font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 0.35rem; }
.category-card .count { color: #9ca3af; font-size: 0.85rem; margin-bottom: 0.75rem; }
.category-card .summary { color: #d1d5db; font-size: 0.92rem; line-height: 1.5; margin-bottom: 0.75rem; }
.category-card a.view-link { color: #60a5fa; font-size: 0.9rem; text-decoration: none; font-weight: 500; }
.category-card a.view-link:hover { text-decoration: underline; }
.supplements-interaction-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.supplements-interaction-table th, .supplements-interaction-table td { text-align: left; padding: 0.75rem 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.supplements-interaction-table th { color: #9ca3af; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
.supplements-interaction-table td { color: #e5e7eb; font-size: 0.95rem; }
.supplements-interaction-table a { color: #60a5fa; text-decoration: none; }
.supplements-interaction-table a:hover { text-decoration: underline; }
.hub-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
.hub-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem 1rem; text-align: center; }
.hub-stat .num { font-family: 'Source Serif 4', serif; font-size: 1.6rem; font-weight: 700; color: #fff; line-height: 1; }
.hub-stat .label { color: #9ca3af; font-size: 0.78rem; margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }
.interactions-breadcrumb { color: #9ca3af; font-size: 0.85rem; margin: 1rem 0 0.5rem; }
.interactions-breadcrumb a { color: #60a5fa; text-decoration: none; }
.interactions-breadcrumb a:hover { text-decoration: underline; }
.category-intro { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.5rem; margin-bottom: 2rem; }
.category-intro .severity-key { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
.interactions-footer { border-top: 1px solid rgba(255,255,255,0.08); margin-top: 3rem; }
.empty-state { text-align: center; padding: 2rem 1rem; color: #6b7280; }
.back-to-hub { display: inline-block; margin-top: 1rem; color: #60a5fa; text-decoration: none; font-size: 0.9rem; }
.back-to-hub:hover { text-decoration: underline; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Client-side JS — uses safe DOM construction (createElement + textContent)
// Per CLAUDE.md: no .innerHTML with untrusted content.
// ─────────────────────────────────────────────────────────────────────────────

const CLIENT_JS = `(function(){
    var INDEX = window.__INTERACTION_INDEX__ || [];
    var CATEGORIES = window.__INTERACTION_CATEGORIES__ || [];
    var CAT_BY_SLUG = {};
    CATEGORIES.forEach(function(c){ CAT_BY_SLUG[c.slug] = c; });

    var input = document.getElementById('interaction-search');
    var resultsEl = document.getElementById('interaction-results');
    var detailEl = document.getElementById('interaction-detail');
    if (!input || !resultsEl || !detailEl) return;

    function sevLabel(sev){
        if (sev === 'avoid') return 'Avoid';
        if (sev === 'caution') return 'Caution';
        if (sev === 'monitor') return 'Monitor';
        if (sev === 'safe') return 'No Interaction';
        return 'Review';
    }

    function clear(el){ while (el.firstChild) el.removeChild(el.firstChild); }

    function mkEl(tag, cls, txt){
        var el = document.createElement(tag);
        if (cls) el.className = cls;
        if (txt != null) el.textContent = txt;
        return el;
    }

    function renderResults(q){
        clear(resultsEl);
        if (!q) return;
        var needle = q.toLowerCase();
        var matches = INDEX.filter(function(s){ return s.name.toLowerCase().indexOf(needle) !== -1; }).slice(0, 12);
        if (matches.length === 0) {
            resultsEl.appendChild(mkEl('div', 'empty-state', 'No supplement matches "' + q + '".'));
            return;
        }
        matches.forEach(function(s){
            var row = mkEl('div', 'interactions-result-row');
            row.setAttribute('role', 'option');
            row.setAttribute('tabindex', '0');
            var left = mkEl('div');
            left.appendChild(mkEl('span', 'supp-name', s.name));
            left.appendChild(mkEl('span', 'supp-meta', ' \\u2014 ' + (s.category || 'Supplement')));
            row.appendChild(left);
            var flagged = s.interactions.filter(function(i){ return i.severity !== 'safe'; }).length;
            row.appendChild(mkEl('span', 'supp-meta', flagged + ' interaction' + (flagged === 1 ? '' : 's')));
            row.addEventListener('click', function(){ showDetail(s); });
            row.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showDetail(s); } });
            resultsEl.appendChild(row);
        });
    }

    function renderInteractionItem(i, suppName){
        var catSlug = i.categorySlug;
        var cat = catSlug ? CAT_BY_SLUG[catSlug] : null;
        var heading, advice, link = null;
        if (i.severity === 'safe') {
            heading = 'No significant drug interactions reported';
            advice = 'Based on published safety summaries, ' + suppName + ' has no flagged drug class interactions. Always review specific product labels and consult your prescriber before combining with any medication.';
        } else if (cat) {
            heading = cat.name;
            advice = cat.description + ' ' + cat.clinicalAdvice;
            var a = document.createElement('a');
            a.className = 'drill-link';
            a.href = cat.slug + '.html';
            a.textContent = 'See all supplements flagged for ' + (cat.shortName || cat.name) + ' \\u2192';
            link = a;
        } else {
            heading = 'Other / general';
            advice = 'Clinical significance unclear \\u2014 consult your prescriber if you take this type of medication.';
        }

        var item = mkEl('div', 'interaction-item sev-' + i.severity);
        var topRow = mkEl('div');
        topRow.appendChild(mkEl('span', 'badge sev-' + i.severity, sevLabel(i.severity)));
        topRow.appendChild(mkEl('span', 'category', heading));
        item.appendChild(topRow);
        item.appendChild(mkEl('div', 'raw-text', 'Raw: "' + i.rawText + '"'));
        item.appendChild(mkEl('div', 'advice-text', advice));
        if (link) item.appendChild(link);
        return item;
    }

    function showDetail(s){
        clear(resultsEl);
        input.value = s.name;
        clear(detailEl);
        var panel = mkEl('div', 'interactions-panel');
        var h = mkEl('h3');
        var icon = document.createElement('i');
        icon.className = 'fas fa-vial mr-2';
        icon.style.color = '#60a5fa';
        h.appendChild(icon);
        h.appendChild(document.createTextNode(s.name + ' \\u2014 drug interactions'));
        panel.appendChild(h);

        var p = mkEl('p', 'text-gray-400 text-sm mb-4');
        p.appendChild(document.createTextNode('Read the full monograph: '));
        var monoLink = document.createElement('a');
        monoLink.className = 'text-blue-400 underline';
        monoLink.href = '../supplements/' + s.slug + '.html';
        monoLink.textContent = s.name + ' evidence review';
        p.appendChild(monoLink);
        panel.appendChild(p);

        s.interactions.forEach(function(i){ panel.appendChild(renderInteractionItem(i, s.name)); });
        detailEl.appendChild(panel);
        detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        try {
            if (typeof window.posthog !== 'undefined' && window.posthog.capture) {
                window.posthog.capture('interaction_check', {
                    supplement: s.name,
                    slug: s.slug,
                    flagged_count: s.interactions.filter(function(i){ return i.severity !== 'safe'; }).length
                });
            }
        } catch (e) { /* non-blocking */ }
    }

    var debounceTimer = null;
    input.addEventListener('input', function(){
        clearTimeout(debounceTimer);
        var q = input.value.trim();
        debounceTimer = setTimeout(function(){ renderResults(q); }, 120);
    });
    input.addEventListener('focus', function(){ if (input.value.trim()) renderResults(input.value.trim()); });

    var m = window.location.search.match(/[?&]q=([^&]+)/);
    if (m) {
        var pre = decodeURIComponent(m[1]).replace(/\\+/g, ' ');
        input.value = pre;
        renderResults(pre);
    }
})();`;

// ─────────────────────────────────────────────────────────────────────────────
// Templates — HUB page
// ─────────────────────────────────────────────────────────────────────────────

function renderHubPage(normalizedIndex) {
    const title = 'Supplement Interaction Checker — Drug Interactions for 114 Supplements | SupplementDB';
    const desc = 'Free evidence-based supplement-drug interaction checker. Look up any of 114 supplements and see interactions with blood thinners, diabetes medications, SSRIs, and other drug classes.';
    const canonical = `${SITE_URL}/interactions/`;

    const stats = {
        supplements: normalizedIndex.perSupplement.length,
        categories: INTERACTION_CATEGORIES.length,
        interactions: normalizedIndex.perSupplement.reduce(
            (sum, s) => sum + s.interactions.filter(i => i.severity !== 'safe').length, 0
        )
    };

    const clientIndex = normalizedIndex.perSupplement.map(s => ({
        name: s.name,
        slug: s.slug,
        category: s.category,
        tier: s.evidenceTier,
        interactions: s.interactions
    }));

    const clientCategories = INTERACTION_CATEGORIES.map(c => ({
        slug: c.slug,
        name: c.name,
        shortName: c.shortName,
        description: c.description,
        clinicalAdvice: c.clinicalAdvice
    }));

    const categoryCards = INTERACTION_CATEGORIES.map(cat => {
        const count = (normalizedIndex.perCategory[cat.slug] || []).length;
        return `<article class="category-card">
            <h3>${escHtml(cat.name)}</h3>
            <div class="count">${count} supplement${count === 1 ? '' : 's'} flagged</div>
            <p class="summary">${escHtml(cat.description)}</p>
            <a class="view-link" href="${cat.slug}.html">View interactions &rarr;</a>
        </article>`;
    }).join('\n');

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Supplement Interaction Checker",
            "description": desc,
            "url": canonical,
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Any (browser)",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Interactions", "item": canonical }
            ]
        }
    ];

    return `<!DOCTYPE html>
<html lang="en">
<head>
${SHARED_HEAD(title, desc, canonical)}
    <script type="application/ld+json">${JSON.stringify(jsonLd[0])}</script>
    <script type="application/ld+json">${JSON.stringify(jsonLd[1])}</script>
</head>
<body class="interactions-page">
${SHARED_NAV}
<header class="interactions-hero">
    <div class="max-w-4xl mx-auto px-4">
        <h1>Supplement Interaction Checker</h1>
        <p class="lede">Look up any of ${stats.supplements} evidence-rated supplements and see the prescription drug classes they may interact with. Backed by the SupplementDB safety profile library.</p>
    </div>
</header>
<main class="interactions-shell">

    <div class="hub-stats">
        <div class="hub-stat"><div class="num">${stats.supplements}</div><div class="label">Supplements</div></div>
        <div class="hub-stat"><div class="num">${stats.categories}</div><div class="label">Drug Classes</div></div>
        <div class="hub-stat"><div class="num">${stats.interactions}</div><div class="label">Flagged Interactions</div></div>
    </div>

    <section class="interactions-search-card" aria-labelledby="search-heading">
        <h2 id="search-heading"><i class="fas fa-search mr-2" style="color:#60a5fa;"></i>Look up a supplement</h2>
        <input type="search" id="interaction-search" class="interactions-search-input"
               placeholder="Start typing — e.g. ashwagandha, magnesium, turmeric…"
               autocomplete="off" aria-label="Search supplement name">
        <div id="interaction-results" class="interactions-results" role="listbox" aria-live="polite"></div>
    </section>

    <section id="interaction-detail" aria-live="polite"></section>

    <section class="interactions-panel">
        <h3>Browse by drug class</h3>
        <p class="text-gray-400 mb-4">Each page lists every supplement in the database flagged for that drug class, with severity labels and plain-English guidance.</p>
        <div class="categories-grid">${categoryCards}</div>
    </section>

</main>
${SHARED_FOOTER}
<script>window.__INTERACTION_INDEX__ = ${JSON.stringify(clientIndex)};
window.__INTERACTION_CATEGORIES__ = ${JSON.stringify(clientCategories)};</script>
<script src="interactions-client.js" defer></script>
${SHARED_SCRIPTS}
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Templates — CATEGORY page
// ─────────────────────────────────────────────────────────────────────────────

function renderCategoryPage(cat, hits) {
    const title = `Supplements That Interact With ${cat.name} | SupplementDB`;
    const descRaw = `${hits.length} evidence-rated supplements with potential interactions with ${cat.shortName.toLowerCase()}. ${cat.description.slice(0, 100)}`;
    const desc = descRaw.length > 158 ? descRaw.slice(0, 155) + '…' : descRaw + '…';
    const canonical = `${SITE_URL}/interactions/${cat.slug}.html`;

    const sevCount = hits.reduce((acc, h) => { acc[h.severity] = (acc[h.severity] || 0) + 1; return acc; }, {});

    const tableRows = hits.length === 0
        ? `<tr><td colspan="3"><div class="empty-state">No supplements in the database are flagged for this drug class.</div></td></tr>`
        : hits.map(h => `<tr>
            <td><a href="../supplements/${escHtml(h.slug)}.html">${escHtml(h.supplement)}</a></td>
            <td><span class="badge sev-${h.severity}">${h.severity === 'avoid' ? 'Avoid' : h.severity === 'caution' ? 'Caution' : 'Monitor'}</span></td>
            <td>${escHtml(h.rawText)}</td>
        </tr>`).join('\n');

    const examplesHtml = cat.examples.map(e => `<li>${escHtml(e)}</li>`).join('');

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": title,
            "description": desc,
            "url": canonical,
            "about": {
                "@type": "DrugClass",
                "name": cat.name,
                "description": cat.description
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
                { "@type": "ListItem", "position": 2, "name": "Interactions", "item": `${SITE_URL}/interactions/` },
                { "@type": "ListItem", "position": 3, "name": cat.name, "item": canonical }
            ]
        }
    ];

    return `<!DOCTYPE html>
<html lang="en">
<head>
${SHARED_HEAD(title, desc, canonical)}
    <script type="application/ld+json">${JSON.stringify(jsonLd[0])}</script>
    <script type="application/ld+json">${JSON.stringify(jsonLd[1])}</script>
</head>
<body class="interactions-page">
${SHARED_NAV}
<header class="interactions-hero">
    <div class="max-w-4xl mx-auto px-4">
        <div class="interactions-breadcrumb">
            <a href="../index.html">Home</a> &rsaquo; <a href="index.html">Interactions</a> &rsaquo; ${escHtml(cat.name)}
        </div>
        <h1>Supplements That Interact With ${escHtml(cat.name)}</h1>
        <p class="lede">${escHtml(cat.description)}</p>
    </div>
</header>
<main class="interactions-shell">

    <section class="category-intro">
        <h3 style="font-family:'Source Serif 4',serif;color:#fff;font-size:1.15rem;font-weight:600;margin-bottom:0.5rem;">Why this class matters</h3>
        <p style="color:#d1d5db;line-height:1.6;margin-bottom:0.75rem;"><strong>Mechanism:</strong> ${escHtml(cat.mechanism)}</p>
        <p style="color:#d1d5db;line-height:1.6;margin-bottom:0.75rem;"><strong>What to do:</strong> ${escHtml(cat.clinicalAdvice)}</p>
        <p style="color:#d1d5db;line-height:1.6;"><strong>Representative drugs:</strong></p>
        <ul style="color:#d1d5db;margin-left:1.25rem;list-style:disc;line-height:1.7;">${examplesHtml}</ul>
        <div class="severity-key">
            ${sevCount.avoid ? `<span class="badge sev-avoid">${sevCount.avoid} Avoid</span>` : ''}
            ${sevCount.caution ? `<span class="badge sev-caution">${sevCount.caution} Caution</span>` : ''}
            ${sevCount.monitor ? `<span class="badge sev-monitor">${sevCount.monitor} Monitor</span>` : ''}
        </div>
    </section>

    <section class="interactions-panel">
        <h3><i class="fas fa-list mr-2" style="color:#60a5fa;"></i>${hits.length} supplement${hits.length === 1 ? '' : 's'} flagged</h3>
        <table class="supplements-interaction-table">
            <thead><tr><th>Supplement</th><th>Severity</th><th>Source note</th></tr></thead>
            <tbody>${tableRows}</tbody>
        </table>
        <a href="index.html" class="back-to-hub"><i class="fas fa-arrow-left mr-1"></i> Back to Interaction Checker</a>
    </section>

</main>
${SHARED_FOOTER}
${SHARED_SCRIPTS}
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main() {
    console.log('SupplementDB — Interaction Checker Generator');
    console.log('=============================================\n');

    const db = loadSupplementData();
    if (!db || !Array.isArray(db.supplements)) {
        throw new Error('Failed to load supplement database');
    }
    console.log(`Loaded ${db.supplements.length} supplements`);

    const normalized = buildNormalizedIndex(db.supplements);
    console.log(`Classified ${normalized.perSupplement.length} supplements across ${Object.keys(normalized.perCategory).length} categories\n`);

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    fs.writeFileSync(path.join(OUT_DIR, 'interactions.css'), INTERACTIONS_CSS);
    console.log('✓ Wrote interactions.css');

    fs.writeFileSync(path.join(OUT_DIR, 'interactions-client.js'), CLIENT_JS);
    console.log('✓ Wrote interactions-client.js');

    fs.writeFileSync(
        path.join(DATA_DIR, 'interactions-index.json'),
        JSON.stringify({
            generatedAt: new Date().toISOString(),
            supplements: normalized.perSupplement,
            perCategory: normalized.perCategory
        }, null, 2)
    );
    console.log('✓ Wrote data/interactions-index.json');

    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), renderHubPage(normalized));
    console.log('✓ Wrote interactions/index.html');

    let pageCount = 0;
    for (const cat of INTERACTION_CATEGORIES) {
        const hits = normalized.perCategory[cat.slug] || [];
        const outPath = path.join(OUT_DIR, `${cat.slug}.html`);
        fs.writeFileSync(outPath, renderCategoryPage(cat, hits));
        console.log(`✓ Wrote interactions/${cat.slug}.html (${hits.length} supplements)`);
        pageCount++;
    }

    console.log(`\nDone — 1 hub page + ${pageCount} category pages generated.`);
}

main();
