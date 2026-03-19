#!/usr/bin/env node
'use strict';

/**
 * Build Mechanism Glossary — Renders guides/mechanisms.html from data/mechanisms.js
 *
 * Generates a self-contained static HTML page with:
 *   - Hero section with mechanism count
 *   - Client-side search bar
 *   - Category pill navigation
 *   - Mechanism entries grouped by category, alphabetical within
 *   - Supplement links back to supplement pages
 *
 * Usage: node scripts/build-mechanism-glossary.js
 */

const fs = require('fs');
const path = require('path');

const db = require('../data/mechanisms.js');

function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Group mechanisms by category
const grouped = {};
for (const cat of db.categories) grouped[cat] = [];
for (const m of db.mechanisms) {
  const cat = m.category || 'Metabolic & Energy';
  if (!grouped[cat]) grouped[cat] = [];
  grouped[cat].push(m);
}
// Sort alphabetically within each category
for (const arr of Object.values(grouped)) {
  arr.sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));
}

const totalMechanisms = db.mechanisms.length;
const totalWithDescriptions = db.mechanisms.filter(m => m.summary && m.summary.length > 10).length;

// Category icons
const CATEGORY_ICONS = {
  'Neurotransmitter Systems': 'fa-brain',
  'Antioxidant & Cellular Protection': 'fa-shield-halved',
  'Anti-inflammatory Pathways': 'fa-fire-flame-curved',
  'Hormonal & Endocrine': 'fa-vials',
  'Metabolic & Energy': 'fa-bolt',
  'Cardiovascular & Circulatory': 'fa-heart-pulse',
  'Immune Modulation': 'fa-virus-slash',
  'Structural & Repair': 'fa-wrench',
  'Gut-Brain Axis': 'fa-bacterium',
};

// Build category nav pills
const catNav = db.categories.map(cat => {
  const count = (grouped[cat] || []).length;
  const catId = slugify(cat);
  return `<button class="cite-tab" data-cat="${catId}" onclick="scrollToCat('${catId}')">${esc(cat)} <span class="cite-tab-count">${count}</span></button>`;
}).join('\n            ');

// Build mechanism entries
function renderEntry(m) {
  const aliases = m.aliases.length > 0
    ? `<p class="mech-aliases"><span style="color:var(--text-muted);font-size:0.78rem;">Also known as:</span> ${m.aliases.map(a => esc(a)).join(', ')}</p>`
    : '';

  const summary = m.summary
    ? `<p class="mech-summary">${esc(m.summary)}</p>`
    : `<p class="mech-summary" style="color:var(--text-muted);font-style:italic;">Description pending review.</p>`;

  const relevance = m.relevance
    ? `<p class="mech-relevance"><strong>Why it matters:</strong> ${esc(m.relevance)}</p>`
    : '';

  const suppLinks = m.supplements.map(s =>
    `<a href="../supplements-new/${slugify(s)}.html" class="mech-supp-link">${esc(s)}</a>`
  ).join('');

  const suppSection = m.supplements.length > 0
    ? `<div class="mech-supplements"><span style="color:var(--text-muted);font-size:0.78rem;">Found in:</span> ${suppLinks}</div>`
    : '';

  return `
            <div class="mech-entry" id="${esc(m.id)}">
                <h3 class="mech-entry-name">${esc(m.canonicalName)}</h3>
                ${aliases}
                ${summary}
                ${relevance}
                ${suppSection}
            </div>`;
}

// Build category sections
const categorySections = db.categories.map(cat => {
  const entries = grouped[cat] || [];
  if (entries.length === 0) return '';

  const catId = slugify(cat);
  const icon = CATEGORY_ICONS[cat] || 'fa-circle';

  return `
        <section class="mech-category-section" id="cat-${catId}">
            <div class="tier-divider mb-6">
                <h2 class="text-xl" style="color: var(--text-bright); white-space: nowrap;">
                    <i class="fas ${icon} mr-2" style="font-size: 0.9em; color: var(--accent-light);"></i>
                    ${esc(cat)}
                    <span class="text-sm font-normal ml-2" style="color: var(--text-muted);">${entries.length} mechanisms</span>
                </h2>
            </div>
            <div class="mech-entries-grid">
                ${entries.map(renderEntry).join('')}
            </div>
        </section>`;
}).join('\n');

// Build the full HTML page
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mechanism Glossary | SupplementDB</title>
    <meta name="description" content="Plain-language explanations of ${totalMechanisms}+ biological mechanisms referenced across SupplementDB evidence guides. Understand how supplements work at the molecular level.">

    <meta name="clerk-key" content="__CLERK_PUBLISHABLE_KEY__">
    <meta name="convex-url" content="__CONVEX_URL__">

    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Auth CDN -->
    <script src="https://unpkg.com/@clerk/clerk-js@latest/dist/clerk.browser.js" crossorigin="anonymous"></script>

<style>
    :root {
        --bg-base: #0d1117;
        --bg-card: #161b22;
        --bg-card-alt: #1c2128;
        --text-bright: #e6edf3;
        --text-primary: #c9d1d9;
        --text-muted: #8b949e;
        --accent: rgb(99, 102, 241);
        --accent-light: #a5b4fc;
        --accent-rgb: 99, 102, 241;
        --glow: #7dd3fc;
        --border: #30363d;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
        font-family: 'DM Sans', system-ui, sans-serif;
        background: var(--bg-base);
        color: var(--text-primary);
        line-height: 1.7;
        min-height: 100vh;
    }

    h1, h2, h3 { font-family: 'DM Serif Display', Georgia, serif; }

    /* Nav */
    .guide-nav {
        position: sticky; top: 0; z-index: 50;
        background: rgba(13,17,23,0.92); backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border);
        padding: 0.75rem 1.5rem;
        display: flex; align-items: center; justify-content: space-between;
    }
    .guide-nav a { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; transition: color 0.15s; }
    .guide-nav a:hover { color: var(--text-bright); }

    /* Hero */
    .hero-section {
        text-align: center; padding: 4rem 1rem 3rem;
        background: radial-gradient(ellipse 60% 50% at 50% 30%, rgba(var(--accent-rgb), 0.08) 0%, transparent 60%),
                    linear-gradient(135deg, #1a1040 0%, var(--bg-base) 100%);
    }
    .hero-section h1 { font-size: 2.5rem; color: var(--text-bright); margin-bottom: 0.75rem; }
    .hero-section p { color: var(--text-muted); font-size: 1.05rem; max-width: 540px; margin: 0 auto; }

    /* Search */
    .search-container { max-width: 500px; margin: 2rem auto 0; position: relative; }
    .search-input {
        width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem;
        background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;
        color: var(--text-primary); font-size: 0.95rem; font-family: inherit;
        outline: none; transition: border-color 0.15s;
    }
    .search-input:focus { border-color: var(--accent); }
    .search-input::placeholder { color: var(--text-muted); }
    .search-icon {
        position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
        color: var(--text-muted); font-size: 0.9rem;
    }
    .search-count { text-align: center; margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted); }

    /* Category nav */
    .cat-nav {
        max-width: 56rem; margin: 2rem auto; padding: 0 1rem;
        display: flex; gap: 0.3rem; flex-wrap: wrap; justify-content: center;
    }
    .cite-tab {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        color: var(--text-muted); padding: 0.35rem 0.65rem; border-radius: 6px;
        cursor: pointer; font-size: 0.75rem; font-family: inherit; transition: all 0.15s;
    }
    .cite-tab:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); }
    .cite-tab.active { background: rgba(var(--accent-rgb),0.15); border-color: rgba(var(--accent-rgb),0.3); color: var(--accent-light); }
    .cite-tab-count { font-size: 0.65rem; background: rgba(255,255,255,0.06); padding: 0.05rem 0.3rem; border-radius: 8px; margin-left: 0.2rem; }

    /* Content */
    .glossary-content { max-width: 56rem; margin: 0 auto; padding: 0 1rem 3rem; }

    /* Category sections */
    .mech-category-section { margin-bottom: 3rem; }
    .tier-divider {
        display: flex; align-items: center; gap: 1rem;
        padding-bottom: 0.75rem; border-bottom: 1px solid var(--border);
    }

    /* Mechanism entries */
    .mech-entries-grid { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.25rem; }
    .mech-entry {
        background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;
        padding: 1.25rem 1.5rem; transition: border-color 0.15s;
    }
    .mech-entry:target { border-color: var(--accent); box-shadow: 0 0 0 1px rgba(var(--accent-rgb), 0.2); }
    .mech-entry-name { font-size: 1.1rem; color: var(--text-bright); margin-bottom: 0.4rem; }
    .mech-aliases { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.6rem; font-style: italic; }
    .mech-summary { font-size: 0.9rem; color: var(--text-primary); margin-bottom: 0.5rem; line-height: 1.7; }
    .mech-relevance { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.6rem; }
    .mech-supplements { display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center; }
    .mech-supp-link {
        font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 4px;
        background: rgba(var(--accent-rgb), 0.08); color: var(--accent-light);
        text-decoration: none; transition: background 0.15s;
    }
    .mech-supp-link:hover { background: rgba(var(--accent-rgb), 0.18); }

    /* Footer */
    .guide-footer {
        max-width: 56rem; margin: 0 auto; padding: 2rem 1rem;
        border-top: 1px solid var(--border); text-align: center;
        color: var(--text-muted); font-size: 0.8rem;
    }
    .guide-footer a { color: var(--accent-light); text-decoration: none; }

    /* Responsive */
    @media (max-width: 640px) {
        .hero-section h1 { font-size: 1.8rem; }
        .mech-entry { padding: 1rem; }
        .cat-nav { gap: 0.2rem; }
        .cite-tab { font-size: 0.7rem; padding: 0.25rem 0.5rem; }
    }
</style>
</head>
<body>

<!-- Navigation -->
<nav class="guide-nav">
    <a href="../index.html" style="font-weight:600; color: var(--accent-light);"><i class="fas fa-pills mr-1"></i> SupplementDB</a>
    <div style="display:flex; gap:1.5rem; align-items:center;">
        <a href="../index.html"><i class="fas fa-arrow-left mr-1"></i> Back to Database</a>
        <a href="../methodology.html">Methodology</a>
        <div id="auth-buttons"></div>
    </div>
</nav>

<!-- Hero -->
<header class="hero-section">
    <div style="display:inline-block; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.75rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; background:rgba(var(--accent-rgb),0.12); color:var(--accent-light); margin-bottom:1rem;">
        <i class="fas fa-circle" style="font-size:5px; vertical-align:middle; margin-right:4px;"></i> Reference
    </div>
    <h1>Mechanism Glossary</h1>
    <p>Plain-language explanations of ${totalMechanisms} biological mechanisms referenced across our evidence guides.</p>

    <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input type="text" class="search-input" id="mech-search" placeholder="Search mechanisms..." oninput="filterMechanisms(this.value)">
    </div>
    <div class="search-count" id="search-count"></div>
</header>

<!-- Category Navigation -->
<div class="cat-nav">
    <button class="cite-tab active" data-cat="all" onclick="showAllCats()">All <span class="cite-tab-count">${totalMechanisms}</span></button>
    ${catNav}
</div>

<!-- Glossary Content -->
<main class="glossary-content">
    ${categorySections}
</main>

<!-- Footer -->
<footer class="guide-footer">
    <p>
        <a href="../index.html"><i class="fas fa-pills mr-1"></i> Return to Supplement Database</a>
        &nbsp;&middot;&nbsp;
        <a href="../methodology.html"><i class="fas fa-flask mr-1"></i> Research Methodology</a>
    </p>
    <p style="margin-top:0.75rem;">
        This glossary is for informational purposes only and does not constitute medical advice.
        Always consult a qualified healthcare professional.
    </p>
    <p style="margin-top:0.5rem;">&copy; 2025&ndash;2026 SupplementDB. Evidence-Based Supplement Database.</p>
</footer>

<!-- Search & Category JS -->
<script>
function filterMechanisms(query) {
    var q = query.toLowerCase().trim();
    var entries = document.querySelectorAll('.mech-entry');
    var sections = document.querySelectorAll('.mech-category-section');
    var shown = 0;

    entries.forEach(function(el) {
        var text = el.textContent.toLowerCase();
        var match = !q || text.indexOf(q) !== -1;
        el.style.display = match ? '' : 'none';
        if (match) shown++;
    });

    // Hide category sections with no visible entries
    sections.forEach(function(sec) {
        var visible = sec.querySelectorAll('.mech-entry:not([style*="display: none"])');
        sec.style.display = visible.length > 0 ? '' : 'none';
    });

    var countEl = document.getElementById('search-count');
    if (q) {
        countEl.textContent = shown + ' of ${totalMechanisms} mechanisms match';
    } else {
        countEl.textContent = '';
    }

    // Reset category nav active state
    if (q) {
        document.querySelectorAll('.cite-tab').forEach(function(t) { t.classList.remove('active'); });
    } else {
        showAllCats();
    }
}

function scrollToCat(catId) {
    document.querySelectorAll('.cite-tab').forEach(function(t) { t.classList.remove('active'); });
    event.target.classList.add('active');

    // Clear search
    document.getElementById('mech-search').value = '';
    filterMechanisms('');

    var section = document.getElementById('cat-' + catId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showAllCats() {
    document.querySelectorAll('.cite-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelector('.cite-tab[data-cat="all"]').classList.add('active');
    document.querySelectorAll('.mech-category-section').forEach(function(s) { s.style.display = ''; });
    document.querySelectorAll('.mech-entry').forEach(function(e) { e.style.display = ''; });
    document.getElementById('search-count').textContent = '';
    document.getElementById('mech-search').value = '';
}

// Highlight entry if arriving via anchor link
if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target) {
        setTimeout(function() { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
    }
}
</script>

<!-- Auth -->
<script src="../js/auth.js"></script>
<script src="../js/auth-ui.js"></script>

</body>
</html>`;

// Write output
const outPath = path.join(__dirname, '..', 'guides', 'mechanisms.html');
fs.writeFileSync(outPath, html, 'utf8');

console.log(`Built ${outPath}`);
console.log(`  ${totalMechanisms} mechanisms across ${db.categories.length} categories`);
console.log(`  ${totalWithDescriptions} have descriptions`);
console.log(`  ${totalMechanisms - totalWithDescriptions} pending`);
