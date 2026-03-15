#!/usr/bin/env node
'use strict';

/**
 * transform.js  —  Supplement monograph redesign migration tool
 *
 * Converts old Tailwind + content-shared.css pages to the new self-contained
 * melatonin design system (Source Serif 4 / DM Sans, dark-navy/forest theme,
 * 10-step numbered sticky nav, Quick Facts card grid, etc.)
 *
 * Usage:
 *   node transform.js --dry-run                     # validation report only, no writes
 *   node transform.js                               # process all pages → supplements-new/
 *   node transform.js ashwagandha.html creatine.html  # specific pages only
 *
 * The script NEVER modifies originals.  All output goes to supplements-new/.
 */

const cheerio = require('cheerio');
const fs      = require('fs');
const path    = require('path');

// ── Paths ─────────────────────────────────────────────────────────────────────
const SUPP_DIR  = path.join(__dirname, 'supplements');
const OUT_DIR   = path.join(__dirname, 'supplements-new');
const TEMPLATE  = path.join(SUPP_DIR, 'melatonin.html');  // CSS source
const SKIP      = new Set(['melatonin.html']);              // already redesigned

// ── Utilities ─────────────────────────────────────────────────────────────────
function readFile(fp)         { return fs.readFileSync(fp, 'utf8'); }
function writeFile(fp, c)     { fs.writeFileSync(fp, c, 'utf8'); }
function h(s)                 { return s ? String(s).trim() : ''; }

/** Safe HTML escape — only escapes in attribute/text contexts where we use esc() */
function esc(s) {
    return h(s)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;');
}

/** Extract the <style> block from melatonin.html */
function extractCSS(html) {
    const $ = cheerio.load(html, { decodeEntities: false });
    return $('style').first().html() || '';
}

/** Map tier text → badge class */
function tierBadgeClass(t) {
    if (/tier\s*1/i.test(t)) return 'hero-badge-tier hero-badge-tier-1';
    if (/tier\s*2/i.test(t)) return 'hero-badge-tier hero-badge-tier-2';
    if (/tier\s*3/i.test(t)) return 'hero-badge-tier hero-badge-tier-3';
    return 'hero-badge-tier';
}

/** Tier background colour (pill inside fact-card) */
function tierPillStyle(t) {
    if (/tier\s*1/i.test(t)) return 'background:#16a34a;color:#fff';
    if (/tier\s*2/i.test(t)) return 'background:#ca8a04;color:#fff';
    if (/tier\s*3/i.test(t)) return 'background:#dc2626;color:#fff';
    return 'background:#16a34a;color:#fff';
}

/** Quick-Facts icon per label */
const QF_ICON_MAP = {
    'evidence tier'  : 'fas fa-medal',
    'category'       : 'fas fa-th-large',
    'scientific name': 'fas fa-dna',
    'clinical dosage': 'fas fa-prescription-bottle-alt',
    'optimal duration': 'fas fa-clock',
    'duration'       : 'fas fa-clock',
    'safety rating'  : 'fas fa-shield-alt',
    'available forms': 'fas fa-capsules',
    'cost range'     : 'fas fa-dollar-sign',
    'quality markers': 'fas fa-certificate',
};
function qfIcon(label) {
    const k = label.toLowerCase().replace(/[^a-z ]/g, '').trim();
    for (const [key, icon] of Object.entries(QF_ICON_MAP)) {
        if (k.includes(key)) return icon;
    }
    return 'fas fa-info-circle';
}

/** Safety card modifier class from section title */
function safetyCardMod(title) {
    const t = title.toLowerCase();
    if (t.includes('side effect') || t.includes('adverse')) return 'safety-card-amber';
    if (t.includes('contraindication'))                       return 'safety-card-red';
    if (t.includes('interaction'))                            return 'safety-card-orange';
    return 'safety-card-amber';
}

/** Extract PubMed ID from a URL */
function pmid(url) {
    const m = String(url).match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
    return m ? m[1] : null;
}

// ── Data Extraction ───────────────────────────────────────────────────────────
function extract($, filename) {
    const d = { filename, errors: [], warnings: [] };

    function req(field, val) {
        const empty = !val || (typeof val === 'string' && !val.trim()) ||
                      (Array.isArray(val) && !val.length);
        if (empty) d.errors.push(`Missing required: ${field}`);
        return val;
    }
    function warn(field, val) {
        const empty = !val || (typeof val === 'string' && !val.trim()) ||
                      (Array.isArray(val) && !val.length);
        if (empty) d.warnings.push(`Missing optional: ${field}`);
        return val;
    }

    // ── head meta ────────────────────────────────────────────────────────────
    d.title              = req('title',       h($('title').text()));
    d.metaDesc           = h($('meta[name="description"]').attr('content'));
    d.canonical          = h($('link[rel="canonical"]').attr('href'));
    d.ogTitle            = h($('meta[property="og:title"]').attr('content'));
    d.ogDesc             = h($('meta[property="og:description"]').attr('content'));
    d.ogUrl              = h($('meta[property="og:url"]').attr('content'));
    d.twTitle            = h($('meta[name="twitter:title"]').attr('content'));
    d.twDesc             = h($('meta[name="twitter:description"]').attr('content'));
    d.clerkKey           = h($('meta[name="clerk-key"]').attr('content'))  || '__CLERK_PUBLISHABLE_KEY__';
    d.convexUrl          = h($('meta[name="convex-url"]').attr('content')) || '__CONVEX_URL__';

    // PostHog — preserve verbatim
    d.posthog = '';
    $('script').each((_, el) => {
        const src = $(el).html() || '';
        if (src.includes('posthog.init')) d.posthog = src;
    });
    warn('posthog', d.posthog);

    // JSON-LD — preserve verbatim
    d.jsonLd = [];
    $('script[type="application/ld+json"]').each((_, el) => {
        d.jsonLd.push($(el).html() || '');
    });

    // ── hero ─────────────────────────────────────────────────────────────────
    d.tierText      = req('tierText',     h($('.monograph-badges .tier-badge').first().text()));
    d.categoryText  = req('categoryText', h($('.monograph-badge-category').first().text()));
    d.safetyText    = req('safetyText',   h($('.monograph-badge-safety').first().text()));
    d.name          = req('name',         h($('.guide-hero h1, header.guide-hero h1').first().text()));
    d.sciName       = warn('sciName',     h($('.scientific-name').first().text()));
    d.commonNames   = warn('commonNames', h($('.common-names').first().text()));
    d.heroTagline   = warn('heroTagline', h($('.hero-subtitle').first().text()));

    // stats row  (text from each .monograph-stat)
    d.stats = [];
    $('.monograph-stat').each((_, el) => d.stats.push(h($(el).text())));

    // ── trust bar ────────────────────────────────────────────────────────────
    d.trustItems = [];
    $('.trust-bar-item').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a');
        if (link.length) {
            d.trustItems.push({ text: h(link.text()), href: h(link.attr('href')), isLink: true });
        } else {
            d.trustItems.push({ text: h($el.text()), isLink: false });
        }
    });

    // ── quick facts ──────────────────────────────────────────────────────────
    d.quickFacts = [];
    $('#quick-facts table tbody tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length < 2) return;
        d.quickFacts.push({
            label    : h(tds.first().text()),
            valueText: h(tds.last().text()),
        });
    });
    warn('quickFacts', d.quickFacts);

    // ── overview ─────────────────────────────────────────────────────────────
    const $ov = $('#overview');
    d.overviewPara = h($ov.find('.snippet-paragraph p').first().text());
    d.keyFindings  = h($ov.find('.key-findings').text());
    d.studyPops    = h($ov.find('.study-populations').text());

    // ── mechanisms ───────────────────────────────────────────────────────────
    d.mechanisms = [];
    $('#mechanisms .mechanism-card').each((_, el) => {
        d.mechanisms.push(h($(el).find('.mechanism-text').text()));
    });
    warn('mechanisms', d.mechanisms);

    // ── benefits ─────────────────────────────────────────────────────────────
    d.cognBenefits    = [];
    d.nonCognBenefits = [];
    let currentBucket = null;
    $('#benefits').children().each((_, el) => {
        const tag = (el.tagName || '').toLowerCase();
        if (tag === 'h3') {
            const t = h($(el).text()).toLowerCase();
            currentBucket = (t.includes('cognitive') && !t.includes('non')) ? 'cogn' : 'nonCogn';
        } else if ($(el).hasClass('benefit-list')) {
            const items = [];
            $(el).find('li').each((_, li) => items.push(h($(li).text())));
            if (currentBucket === 'cogn')    d.cognBenefits    = items;
            else                             d.nonCognBenefits = items;
        }
    });

    // ── effect sizes ─────────────────────────────────────────────────────────
    d.effectSizes = [];
    $('#effect-sizes table tbody tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length < 2) return;
        d.effectSizes.push({ domain: h($(tds[0]).text()), value: h($(tds[1]).text()) });
    });
    warn('effectSizes', d.effectSizes);

    // ── dosage ────────────────────────────────────────────────────────────────
    d.dosageFields = [];
    $('#dosage table.snippet-table tbody tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if (tds.length < 2) return;
        d.dosageFields.push({ label: h(tds.first().text()), value: h(tds.last().text()) });
    });

    d.populationTags = [];
    $('#dosage h3').each((_, h3) => {
        if (h($(h3).text()).toLowerCase().includes('population')) {
            $(h3).next('.benefit-list').find('li').each((_, li) =>
                d.populationTags.push(h($(li).text()))
            );
        }
    });

    // ── safety ────────────────────────────────────────────────────────────────
    d.safetyRating    = h($('#safety .safety-rating-box').text())
                          .replace(/Overall Safety Rating:/i, '').trim() || d.safetyText;
    d.sideEffects     = [];
    d.contraindications = [];
    d.drugInteractions  = [];

    $('#safety h3').each((_, h3el) => {
        const label = h($(h3el).text()).toLowerCase();
        const items = [];
        // Try direct next ul, then .safety-list, then .safety-contraindications ul, etc.
        let $ul = $(h3el).next('ul');
        if (!$ul.length) $ul = $(h3el).next('div').find('ul').first();
        if (!$ul.length) $ul = $(h3el).nextUntil('h3').filter('ul').first();
        $ul.find('li').each((_, li) => items.push(h($(li).text())));

        if (label.includes('side effect') || label.includes('adverse'))  d.sideEffects       = items;
        else if (label.includes('contraindication'))                       d.contraindications  = items;
        else if (label.includes('interaction'))                            d.drugInteractions   = items;
    });

    // ── enhanced evidence ─────────────────────────────────────────────────────
    d.evidenceGroups = [];
    $('#enhanced-evidence .citation-group').each((_, grp) => {
        const $grp = $(grp);
        const groupTitle = h($grp.find('.citation-group-header').text());
        const cards = [];

        $grp.find('.evidence-card').each((_, card) => {
            const $c = $(card);
            const findingTitle  = h($c.find('.evidence-card-title').text());
            const detailsProse  = h($c.find('.evidence-details').text());
            const linkEl        = $c.find('.evidence-link a');
            const linkHref      = h(linkEl.attr('href'));
            const linkText      = h(linkEl.text());
            const pid           = pmid(linkHref);

            const tags = [];
            $c.find('.evidence-tags .evidence-tag').each((_, tag) => {
                tags.push({
                    text   : h($(tag).text()),
                    classes: ($(tag).attr('class') || '').split(/\s+/).filter(c => c && c !== 'evidence-tag').join(' '),
                });
            });

            cards.push({ findingTitle, tags, detailsProse, linkHref, linkText, pid });
        });

        d.evidenceGroups.push({ groupTitle, cards });
    });
    warn('evidenceGroups', d.evidenceGroups);

    // ── references ────────────────────────────────────────────────────────────
    d.references = [];
    $('#references ol.references-list li').each((_, li) => {
        d.references.push($(li).html() || '');
    });
    warn('references', d.references);

    // ── related ───────────────────────────────────────────────────────────────
    d.relatedCards = [];
    $('#related .related-card').each((_, el) => {
        const $el = $(el);
        d.relatedCards.push({
            href     : h($el.attr('href')),
            iconClass: h($el.find('i').attr('class')),
            title    : h($el.find('strong').text()),
            desc     : h($el.find('.related-card-desc, p').text()),
        });
    });

    return d;
}

// ── HTML Builders ─────────────────────────────────────────────────────────────

function buildQuickFacts(qf, tierText) {
    return qf.map(({ label, valueText }) => {
        const icon = qfIcon(label);
        let displayValue = esc(valueText);

        // Special formatting for Evidence Tier and Safety Rating pills
        const lc = label.toLowerCase();
        if (lc.includes('evidence tier') || lc.includes('tier')) {
            displayValue = `<span style="display:inline-flex;align-items:center;${tierPillStyle(valueText)};padding:2px 10px;border-radius:100px;font-size:0.72rem;font-weight:700;">${esc(valueText)}</span>`;
        } else if (lc.includes('safety rating')) {
            displayValue = `<span style="display:inline-flex;align-items:center;background:var(--blue-bg);color:var(--blue);padding:2px 10px;border-radius:100px;font-size:0.72rem;font-weight:700;border:1px solid rgba(37,99,235,0.25);">${esc(valueText)}</span>`;
        } else if (lc.includes('scientific name')) {
            displayValue = `<em>${esc(valueText)}</em>`;
        }

        return `                <div class="fact-card">
                    <div class="fact-card-icon"><i class="${icon}"></i></div>
                    <div class="fact-card-label">${esc(label)}</div>
                    <div class="fact-card-value">${displayValue}</div>
                </div>`;
    }).join('\n');
}

function buildMechanisms(mechs) {
    return mechs.map((m, i) => `                <div class="mechanism-card">
                    <div class="mechanism-num">${i + 1}</div>
                    <p class="mechanism-text">${esc(m)}</p>
                </div>`).join('\n');
}

function buildBenefitCol(title, items) {
    if (!items.length) return '';
    return `                <div class="benefit-col">
                    <div class="benefit-col-title">${esc(title)}</div>
                    <ul class="benefit-list">
                        ${items.map(i => `<li>${esc(i)}</li>`).join('\n                        ')}
                    </ul>
                </div>`;
}

function buildEffectRows(rows) {
    return rows.map(({ domain, value }) =>
        `                    <tr>
                        <td class="effect-domain">${esc(domain)}</td>
                        <td class="effect-value">${esc(value)}</td>
                    </tr>`
    ).join('\n');
}

function buildDosageGrid(fields) {
    return fields.map(({ label, value }) =>
        `                    <div class="dosage-field">
                        <label>${esc(label)}</label>
                        <span>${esc(value)}</span>
                    </div>`
    ).join('\n');
}

function buildPopulationTags(pops) {
    return pops.map(p => `<span class="population-tag">${esc(p)}</span>`).join('\n                    ');
}

function buildSafetyCards(sideEffects, contraindications, drugInteractions) {
    const cols = [
        { title: 'Common Side Effects', items: sideEffects,      mod: 'safety-card-amber' },
        { title: 'Contraindications',   items: contraindications, mod: 'safety-card-red'   },
        { title: 'Drug Interactions',   items: drugInteractions,  mod: 'safety-card-orange'},
    ];
    return cols.filter(c => c.items.length).map(({ title, items, mod }) => `                <div class="safety-card ${mod}">
                    <div class="safety-card-header">
                        <i class="fas fa-exclamation-triangle"></i> ${esc(title)}
                    </div>
                    <ul class="safety-list">
                        ${items.map(i => `<li>${esc(i)}</li>`).join('\n                        ')}
                    </ul>
                </div>`).join('\n');
}

function buildEvidenceGroups(groups) {
    return groups.map(({ groupTitle, cards }) => {
        const cardsHtml = cards.map(({ findingTitle, tags, detailsProse, linkHref, pid, linkText }) => {
            const tagsHtml = tags.map(({ text, classes }) =>
                `<span class="evidence-tag${classes ? ' ' + classes : ''}">${esc(text)}</span>`
            ).join(' ');
            const displayLink = pid ? `PubMed: ${pid}` : (linkText || 'View Source');
            return `            <div class="evidence-card">
                <p class="evidence-card-title">${esc(findingTitle)}</p>
                <div class="evidence-tags">${tagsHtml}</div>
                <div class="study-item">
                    <p class="evidence-prose">${esc(detailsProse)}</p>
                    <a class="study-link" href="${esc(linkHref)}" target="_blank" rel="noopener">
                        <i class="fas fa-external-link-alt"></i> ${esc(displayLink)}
                    </a>
                </div>
            </div>`;
        }).join('\n');

        // Preserve original group header icon if it had one (strip text, reattach)
        return `        <div class="citation-group">
            <h3 class="citation-group-header">
                <i class="fas fa-microscope"></i> ${esc(groupTitle)}
            </h3>
            ${cardsHtml}
        </div>`;
    }).join('\n\n');
}

function buildReferences(refs) {
    return refs.map((html, i) => `            <li class="ref-item">
                <div class="ref-num">${i + 1}</div>
                <div class="ref-text">${html}</div>
            </li>`).join('\n');
}

function buildRelatedCards(cards) {
    return cards.map(({ href, iconClass, title, desc }) =>
        `                <a class="related-card" href="${esc(href)}">
                    <i class="${esc(iconClass)} related-card-icon"></i>
                    <strong>${esc(title)}</strong>
                    <p>${esc(desc)}</p>
                </a>`
    ).join('\n');
}

// ── Full Page Render ──────────────────────────────────────────────────────────
function renderPage(d, css) {
    const jsonLdHtml = d.jsonLd.map(s =>
        `    <script type="application/ld+json">${s}</script>`
    ).join('\n');

    const statsHtml = d.stats.map(s =>
        `            <div class="hero-stat"><i class="fas fa-circle"></i> ${esc(s)}</div>`
    ).join('\n');

    // Trust chips — use stats for first 3 items; last item is always methodology link
    const trustHtml = d.stats.slice(0, 3).map(s =>
        `        <span class="trust-chip"><i class="fas fa-check-circle"></i> ${esc(s)}</span>`
    ).concat([`        <span class="trust-chip"><i class="fas fa-flask"></i> <a href="../methodology.html">Our Methodology</a></span>`])
    .join('\n');

    const cognColHtml    = buildBenefitCol('Cognitive Benefits',     d.cognBenefits);
    const nonCognColHtml = buildBenefitCol('Non-Cognitive Benefits', d.nonCognBenefits);

    const populationsSection = d.populationTags.length ? `
                    <hr class="dosage-divider">
                    <div class="populations-label">Study Populations</div>
                    <div class="population-tags">
                        ${buildPopulationTags(d.populationTags)}
                    </div>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(d.title)}</title>
    <meta name="description" content="${esc(d.metaDesc)}">
    <link rel="canonical" href="${esc(d.canonical)}">
    <meta property="og:title" content="${esc(d.ogTitle)}">
    <meta property="og:description" content="${esc(d.ogDesc)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${esc(d.ogUrl)}">
    <meta property="og:site_name" content="SupplementDB">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(d.twTitle)}">
    <meta name="twitter:description" content="${esc(d.twDesc)}">

    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">

    <!-- PostHog Analytics -->
    <script>
${d.posthog}
    </script>

    <!-- Clerk Auth -->
    <meta name="clerk-key" content="${esc(d.clerkKey)}">
    <meta name="convex-url" content="${esc(d.convexUrl)}">

    <link rel="stylesheet" href="../css/auth.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

${jsonLdHtml}

    <style>
${css}
        /* ── evidence-prose: old pages store findings as prose paragraphs ── */
        .evidence-prose {
            font-size: 0.83rem;
            color: var(--text-secondary);
            line-height: 1.65;
            margin-bottom: 0.75rem;
        }
        /* tier badge colour variants */
        .hero-badge-tier-2 { background: #ca8a04 !important; }
        .hero-badge-tier-3 { background: #dc2626 !important; }
    </style>
</head>
<body>

<!-- Navigation -->
<nav class="nav">
    <div class="nav-inner">
        <a href="../index.html" class="nav-brand">
            <i class="fas fa-pills"></i> SupplementDB
        </a>
        <div class="nav-links">
            <a href="../guides/sleep.html" class="nav-link">Sleep Guide</a>
            <a href="../index.html" class="nav-link"><i class="fas fa-arrow-left"></i> Database</a>
            <div id="auth-buttons"></div>
        </div>
    </div>
</nav>

<!-- Sticky numbered section nav -->
<div class="progress-track" id="progress-track">
    <div class="progress-track-inner">
        <div class="progress-step"><a href="#quick-facts" class="active"><span class="step-num">1</span><span>Quick Facts</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#overview"><span class="step-num">2</span><span>Overview</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#mechanisms"><span class="step-num">3</span><span>Mechanisms</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#benefits"><span class="step-num">4</span><span>Benefits</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#effect-sizes"><span class="step-num">5</span><span>Effect Sizes</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#dosage"><span class="step-num">6</span><span>Dosage</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#safety"><span class="step-num">7</span><span>Safety</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#enhanced-evidence"><span class="step-num">8</span><span>Evidence</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#references"><span class="step-num">9</span><span>References</span></a></div>
        <div class="progress-divider"></div>
        <div class="progress-step"><a href="#related"><span class="step-num">10</span><span>Related</span></a></div>
    </div>
</div>

<!-- Hero -->
<header class="hero">
    <div class="hero-inner">
        <nav class="hero-breadcrumb" aria-label="Breadcrumb">
            <a href="../index.html">Home</a>
            <span><i class="fas fa-chevron-right" style="font-size:0.55rem;"></i></span>
            <a href="../index.html#database">Supplements</a>
            <span><i class="fas fa-chevron-right" style="font-size:0.55rem;"></i></span>
            <span>${esc(d.name)}</span>
        </nav>
        <div class="hero-badges">
            <span class="hero-badge ${tierBadgeClass(d.tierText)}">
                <i class="fas fa-star"></i> ${esc(d.tierText)}
            </span>
            <span class="hero-badge hero-badge-category">
                <i class="fas fa-tag"></i> ${esc(d.categoryText)}
            </span>
            <span class="hero-badge hero-badge-safety">
                <i class="fas fa-shield-alt"></i> Safety: ${esc(d.safetyText)}
            </span>
        </div>
        <h1>${esc(d.name)}</h1>
        ${d.sciName    ? `<p class="hero-sci-name">${esc(d.sciName)}</p>` : ''}
        ${d.commonNames? `<p class="hero-also-known">${esc(d.commonNames)}</p>` : ''}
        ${d.heroTagline? `<p class="hero-tagline">${esc(d.heroTagline)}</p>` : ''}
        <div class="hero-stats">
${statsHtml}
        </div>
    </div>
</header>

<!-- Share + Trust bar -->
<div class="meta-bar">
    <div class="trust-chips">
${trustHtml}
    </div>
    <div class="share-btns">
        <button class="share-btn" data-share="twitter"><i class="fa-brands fa-x-twitter"></i> Twitter</button>
        <button class="share-btn" data-share="linkedin"><i class="fa-brands fa-linkedin"></i> LinkedIn</button>
        <button class="share-btn" data-share="facebook"><i class="fa-brands fa-facebook"></i> Facebook</button>
        <button class="share-btn" data-share="copy"><i class="fas fa-link"></i> Copy Link</button>
    </div>
</div>

<!-- Page layout: sidebar + main -->
<div class="page-layout">

    <!-- Sidebar TOC -->
    <aside class="sidebar">
        <nav class="sidebar-toc" aria-label="Table of contents">
            <div class="sidebar-toc-title">Contents</div>
            <ul>
                <li><a href="#quick-facts">Quick Facts</a></li>
                <li><a href="#overview">Overview</a></li>
                <li><a href="#mechanisms">Mechanisms of Action</a></li>
                <li><a href="#benefits">Benefits</a></li>
                <li><a href="#effect-sizes">Effect Sizes</a></li>
                <li><a href="#dosage">Dosage &amp; Administration</a></li>
                <li><a href="#safety">Safety Profile</a></li>
                <li><a href="#enhanced-evidence">Enhanced Evidence</a></li>
                <li><a href="#references">References</a></li>
                <li><a href="#related">Related Content</a></li>
            </ul>
        </nav>
    </aside>

    <!-- Main content -->
    <main class="main-content">

        <!-- 1. Quick Facts -->
        <section class="section" id="quick-facts">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">1</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">At a Glance</div>
                    <h2>Quick Facts</h2>
                </div>
            </div>
            <div class="facts-grid">
${buildQuickFacts(d.quickFacts, d.tierText)}
            </div>
        </section>

        <!-- 2. Overview -->
        <section class="section" id="overview">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">2</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">Background</div>
                    <h2>Overview</h2>
                </div>
            </div>
            <div class="overview-card">
                ${d.overviewPara ? `<p>${esc(d.overviewPara)}</p>` : ''}
                ${d.keyFindings  ? `<p class="key-finding-text">${esc(d.keyFindings)}</p>` : ''}
                ${d.studyPops    ? `<p class="populations-text">${esc(d.studyPops)}</p>` : ''}
            </div>
        </section>

        <!-- 3. Mechanisms -->
        <section class="section" id="mechanisms">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">3</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">How It Works</div>
                    <h2>Mechanisms of Action</h2>
                </div>
            </div>
            <div class="mechanism-grid">
${buildMechanisms(d.mechanisms)}
            </div>
        </section>

        <!-- 4. Benefits -->
        <section class="section" id="benefits">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">4</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">What the Research Shows</div>
                    <h2>Benefits</h2>
                </div>
            </div>
            <div class="benefits-grid">
${cognColHtml}
${nonCognColHtml}
            </div>
        </section>

        <!-- 5. Effect Sizes -->
        <section class="section" id="effect-sizes">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">5</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">Quantified Outcomes</div>
                    <h2>Effect Sizes</h2>
                </div>
            </div>
            <p class="section-intro">Quantified effect sizes from clinical research, where available.</p>
            <div class="effect-table-wrap">
                <table class="effect-table">
                    <thead>
                        <tr><th>Domain</th><th>Effect Size / Finding</th></tr>
                    </thead>
                    <tbody>
${buildEffectRows(d.effectSizes)}
                    </tbody>
                </table>
            </div>
        </section>

        <!-- 6. Dosage -->
        <section class="section" id="dosage">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">6</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">How to Use</div>
                    <h2>Dosage &amp; Administration</h2>
                </div>
            </div>
            <div class="dosage-card">
                <div class="dosage-grid">
${buildDosageGrid(d.dosageFields)}
                </div>${populationsSection}
            </div>
        </section>

        <!-- 7. Safety -->
        <section class="section" id="safety">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">7</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">Tolerability</div>
                    <h2>Safety Profile</h2>
                </div>
            </div>
            <div class="safety-rating-display">
                <span class="safety-rating-badge">
                    <i class="fas fa-shield-alt"></i> Overall Safety Rating: ${esc(d.safetyRating)}
                </span>
            </div>
            <div class="safety-grid">
${buildSafetyCards(d.sideEffects, d.contraindications, d.drugInteractions)}
            </div>
        </section>

        <!-- 8. Enhanced Evidence -->
        <section class="section" id="enhanced-evidence">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">8</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">Deep Dive</div>
                    <h2>Enhanced Evidence Review</h2>
                </div>
            </div>
            <p class="section-intro">Detailed citation analysis organized by research domain.</p>
${buildEvidenceGroups(d.evidenceGroups)}
        </section>

        <!-- 9. References -->
        <section class="section" id="references">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">9</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">Citations</div>
                    <h2>References</h2>
                </div>
            </div>
            <ol class="ref-list">
${buildReferences(d.references)}
            </ol>
        </section>

        <!-- 10. Related -->
        <section class="section" id="related">
            <div class="section-header">
                <div class="section-num-col">
                    <div class="section-num-circle">10</div>
                    <div class="section-num-line"></div>
                </div>
                <div class="section-heading-group">
                    <div class="section-label">Explore More</div>
                    <h2>Related Content</h2>
                </div>
            </div>
            <div class="related-grid">
${buildRelatedCards(d.relatedCards)}
            </div>
        </section>

        <!-- Medical Disclaimer -->
        <div class="disclaimer-box">
            <div class="disclaimer-title">
                <i class="fas fa-exclamation-triangle"></i> Medical Disclaimer
            </div>
            <p class="disclaimer-text">This monograph is for informational purposes only and does not constitute medical advice. The evidence presented is based on published research and does not replace consultation with a qualified healthcare provider. Supplement efficacy varies by individual, and interactions with medications or health conditions require professional evaluation. Always consult your physician before starting any new supplement regimen.</p>
        </div>

    </main>
</div>

<!-- Footer -->
<footer class="site-footer">
    <p><strong>SupplementDB</strong> — Evidence-based supplement research</p>
    <p>Data sourced from peer-reviewed studies. Not medical advice. Consult a healthcare provider.</p>
    <div class="footer-links">
        <a href="../index.html">Database</a>
        <a href="../about.html">About</a>
        <a href="../methodology.html">Methodology</a>
        <a href="../faq.html">FAQ</a>
        <a href="../legal/terms.html">Terms</a>
        <a href="../legal/privacy.html">Privacy</a>
    </div>
    <p class="footer-copyright">© 2026 SupplementDB. All rights reserved.</p>
</footer>

<!-- Scripts -->
<script>
(function() {
    'use strict';

    /* Share buttons */
    document.querySelectorAll('.share-btn[data-share]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var type  = this.getAttribute('data-share');
            var url   = encodeURIComponent(window.location.href);
            var title = encodeURIComponent(document.title);
            var targets = {
                twitter:  'https://twitter.com/intent/tweet?url=' + url + '&text=' + title,
                linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url,
                facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url
            };
            if (type === 'copy') {
                navigator.clipboard.writeText(window.location.href).then(function() {
                    var orig = btn.innerHTML;
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    btn.style.color = 'var(--accent)';
                    btn.style.borderColor = 'var(--accent)';
                    setTimeout(function() { btn.innerHTML = orig; btn.style.color = ''; btn.style.borderColor = ''; }, 2000);
                });
            } else if (targets[type]) {
                window.open(targets[type], '_blank', 'noopener,noreferrer,width=600,height=450');
            }
        });
    });

    /* Sticky numbered nav — active section highlighting */
    var progressLinks = document.querySelectorAll('.progress-track .progress-step a');
    var sectionIds = [];
    progressLinks.forEach(function(a) {
        var href = a.getAttribute('href');
        if (href && href.startsWith('#')) sectionIds.push(href.slice(1));
    });
    function updateProgressNav() {
        var scrollY = window.scrollY + 130;
        var active = sectionIds[0];
        sectionIds.forEach(function(id) {
            var el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top + window.scrollY <= scrollY) active = id;
        });
        progressLinks.forEach(function(a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + active);
        });
    }

    /* Sidebar TOC — active link tracking */
    var tocLinks = document.querySelectorAll('.sidebar-toc a');
    var tocSections = [];
    tocLinks.forEach(function(link) {
        var el = document.getElementById(link.getAttribute('href').replace('#', ''));
        if (el) tocSections.push({ el: el, link: link });
    });
    function updateSidebarToc() {
        var scrollY = window.scrollY + 130;
        var current = tocSections[0];
        tocSections.forEach(function(s) {
            if (s.el.getBoundingClientRect().top + window.scrollY <= scrollY) current = s;
        });
        tocLinks.forEach(function(l) { l.classList.remove('active'); });
        if (current) current.link.classList.add('active');
    }

    function onScroll() { updateProgressNav(); updateSidebarToc(); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
</script>

<script src="../js/auth.js"></script>
<script src="../js/convex-client.js"></script>
<script src="../js/rbac.js"></script>
<script src="../js/auth-ui.js"></script>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
    const args    = process.argv.slice(2);
    const dryRun  = args.includes('--dry-run');
    const fileArgs = args.filter(a => !a.startsWith('--'));

    // Build file list
    let files;
    if (fileArgs.length) {
        files = fileArgs.map(f => path.isAbsolute(f) ? f : path.join(SUPP_DIR, f));
    } else {
        files = fs.readdirSync(SUPP_DIR)
            .filter(f => f.endsWith('.html') && !SKIP.has(f))
            .sort()
            .map(f => path.join(SUPP_DIR, f));
    }

    // Extract CSS template from melatonin.html
    const css = extractCSS(readFile(TEMPLATE));
    if (!css) { console.error('ERROR: Could not extract CSS from melatonin.html'); process.exit(1); }
    console.log(`✓ CSS extracted from melatonin.html (${css.length.toLocaleString()} chars)`);
    console.log(`  Processing ${files.length} files  [${dryRun ? 'DRY RUN' : 'WRITING'}]\n`);

    if (!dryRun && !fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    const results = [];

    for (const fp of files) {
        const filename = path.basename(fp);
        let html;
        try {
            html = readFile(fp);
        } catch (e) {
            results.push({ filename, errors: [`Read error: ${e.message}`], warnings: [] });
            continue;
        }

        const $ = cheerio.load(html, { decodeEntities: false });
        const d = extract($, filename);

        let written = false;
        if (!dryRun && !d.errors.length) {
            try {
                const out = renderPage(d, css);
                writeFile(path.join(OUT_DIR, filename), out);
                written = true;
            } catch (e) {
                d.errors.push(`Render error: ${e.message}`);
            }
        }

        results.push({
            filename,
            name        : d.name,
            errors      : d.errors,
            warnings    : d.warnings,
            evidGroups  : (d.evidenceGroups || []).length,
            refs        : (d.references || []).length,
            written,
        });
    }

    // ── Report ────────────────────────────────────────────────────────────────
    const W = 110;
    console.log('='.repeat(W));
    console.log(`TRANSFORM REPORT — ${dryRun ? 'DRY RUN (no files written)' : `GENERATION → ${OUT_DIR}`}`);
    console.log('='.repeat(W));

    let nOk = 0, nWarn = 0, nErr = 0;
    for (const r of results) {
        const status = r.errors.length   ? '✗ ERR ' :
                       r.warnings.length ? '⚠ WARN' : '✓ OK  ';
        const written = r.written ? ' [written]' : '';
        console.log(`${status}  ${r.filename.padEnd(42)} ${(r.name || '').padEnd(28)} ev:${String(r.evidGroups||0).padStart(2)} ref:${String(r.refs||0).padStart(2)}${written}`);
        r.errors.forEach(e   => console.log(`       ↳ ERROR: ${e}`));
        r.warnings.forEach(w => console.log(`       ↳ warn:  ${w}`));
        if (r.errors.length)              nErr++;
        else if (r.warnings.length)       nWarn++;
        else                              nOk++;
    }

    console.log('='.repeat(W));
    console.log(`Total: ${files.length} | ✓ ${nOk} clean | ⚠ ${nWarn} warnings | ✗ ${nErr} errors`);
    console.log('='.repeat(W));

    if (nErr > 0) process.exit(1);
}

main();
