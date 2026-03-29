#!/usr/bin/env node
'use strict';

/**
 * seed.js — SupplementDB Monograph Page Generator
 *
 * Generates the new melatonin-design HTML monograph pages DIRECTLY from
 * structured data — no old HTML intermediate required:
 *
 *   supplements.js            →  base supplement fields (dosage, safety, effectSizes, …)
 *   enhanced_citations/*.js   →  per-supplement citation arrays (mechanisms, benefits, safety, dosage)
 *
 * Unlike transform.js (which migrates old HTML → new HTML via cheerio extraction),
 * seed.js is the forward-path generator for NEW or UPDATED supplements. It is the
 * canonical bridge between the supplement-research-pipeline skill output and the
 * published HTML monograph pages.
 *
 * Usage:
 *   node seed.js                         # generate all 93 supplements → supplements-new/
 *   node seed.js --dry-run               # validate all; print field report; no writes
 *   node seed.js --slug ashwagandha      # generate one supplement by slug
 *   node seed.js --id 7                  # generate one supplement by ID
 *   node seed.js --out supplements/      # write directly to live directory
 *
 * Output directory defaults to supplements-new/.  Use --out supplements/ to push
 * directly to the live pages (after review).
 *
 * Environment variables (optional — for meta tags):
 *   CLERK_KEY      Clerk publishable key
 *   CONVEX_URL     Convex deployment URL
 *   BASE_URL       Canonical base URL (default: https://supplementdb.com)
 */

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT         = __dirname;
const SUPP_JS      = path.join(ROOT, 'data', 'supplements.js');
const ENH_DIR      = path.join(ROOT, 'data', 'enhanced_citations');
const TEMPLATE_CSS = path.join(ROOT, 'templates', 'monograph.css');
const DEFAULT_OUT  = path.join(ROOT, 'supplements-new');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args       = process.argv.slice(2);
const DRY_RUN    = args.includes('--dry-run');
const slugFilter = args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null;
const idFilter   = args.includes('--id')   ? parseInt(args[args.indexOf('--id')  + 1]) : null;
const outArg     = args.includes('--out')  ? args[args.indexOf('--out') + 1]  : null;
const OUT_DIR    = outArg ? path.resolve(ROOT, outArg) : DEFAULT_OUT;

// ── ENV ───────────────────────────────────────────────────────────────────────
const CLERK_KEY  = process.env.CLERK_KEY  || '__CLERK_PUBLISHABLE_KEY__';
const CONVEX_URL = process.env.CONVEX_URL || 'https://robust-frog-754.convex.cloud';
const BASE_URL   = process.env.BASE_URL   || 'https://supplementdb.com';

// ── Utilities ─────────────────────────────────────────────────────────────────
const h   = s => (s != null ? String(s) : '').trim();
const esc = s => h(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function slugify(name) {
    // CANONICAL: must match parse-data.js slugify() and app.js card link derivation
    // Do NOT strip apostrophes — Lion's → lion-s-mane-mushroom (matches existing files + app.js)
    return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// ── CSS Loading ─────────────────────────────────────────────────────────────────
// Design system CSS lives in templates/monograph.css — a dedicated file that
// seed.js owns. This eliminates the fragile dependency on parsing melatonin.html
// (which could be overwritten by other generators).
function loadCSS() {
    if (!fs.existsSync(TEMPLATE_CSS)) {
        console.error(`ERROR: Design system CSS not found at ${TEMPLATE_CSS}`);
        console.error('This file is the single source of truth for monograph styling.');
        console.error('It should never be deleted. Restore from git: git checkout HEAD -- templates/monograph.css');
        return '';
    }
    return fs.readFileSync(TEMPLATE_CSS, 'utf8');
}

// ── supplements.js loader ─────────────────────────────────────────────────────
function loadSupplements() {
    const src = fs.readFileSync(SUPP_JS, 'utf8');
    // supplements.js uses `const supplementDatabase = ...` which is block-scoped and
    // NOT automatically added to the vm sandbox context.  We append a line that
    // copies it onto a known sandbox key before the script finishes.
    const wrapped = src + '\n;try{__db=supplementDatabase;}catch(e){}';
    const ctx = { window: {}, module: { exports: {} }, __db: null };
    vm.runInNewContext(wrapped, ctx);
    const db = ctx.__db;
    if (!db || !db.supplements) throw new Error('supplements.js: cannot find supplementDatabase.supplements');
    return db.supplements;
}

// ── Enhanced citations loader ──────────────────────────────────────────────────
/** Find the enhanced citations file for a given supplement ID */
function findEnhancedFile(id) {
    const files = fs.readdirSync(ENH_DIR);
    // Prefer named file (e.g. 7_melatonin_enhanced.js) over generic (7_enhanced.js)
    const named   = files.find(f => f.match(new RegExp(`^${id}_[a-z].*_enhanced\\.js$`, 'i')));
    const generic = files.find(f => f === `${id}_enhanced.js`);
    return named || generic || null;
}

/** Load enhanced citations object from file, returning null on failure.
 *
 * Handles all four assignment patterns found in the wild:
 *   window.xyzEnhanced = { ... }          → vm window gets the key directly
 *   const/var xyzEnhanced = { ... }       → block-scoped; appended extraction
 *   window.enhancedCitations[id] = { ... }→ numeric ID key on enhancedCitations
 *   window.enhancedCitations["key"] = {}  → string key on enhancedCitations
 */
function loadEnhanced(filename) {
    if (!filename) return null;
    try {
        let src = fs.readFileSync(path.join(ENH_DIR, filename), 'utf8');

        // Pattern: const/var xyzEnhanced = {...} — block-scoped, not on window
        const constMatch = src.match(/(?:^|\n)(?:const|var|let)\s+(\w+Enhanced)\s*=/);
        if (constMatch) {
            src += `\n;try{window.__enh=${constMatch[1]};}catch(e){}`;
        }

        const ctx = { window: { enhancedCitations: {} } };
        vm.runInNewContext(src, ctx);

        // Priority 1: explicit const/var extraction
        if (ctx.window.__enh) return ctx.window.__enh;

        // Priority 2: window.xyzEnhanced pattern (any new key on window)
        const winKeys = Object.keys(ctx.window).filter(k => k !== 'enhancedCitations' && k !== '__enh');
        if (winKeys.length) return ctx.window[winKeys[0]];

        // Priority 3: window.enhancedCitations[id] or window.enhancedCitations["key"] pattern
        const ec = ctx.window.enhancedCitations;
        if (ec && typeof ec === 'object') {
            const ecKeys = Object.keys(ec);
            if (ecKeys.length) return ec[ecKeys[0]];  // return first stored enhanced object
        }

        return null;
    } catch (e) {
        return null;
    }
}

// ── Evidence tag class mapping ────────────────────────────────────────────────
/** Map evidence strength string → CSS class modifier for evidence-tag */
function evidenceTagClass(text) {
    const t = h(text).toLowerCase();
    if (t.includes('strong') || t.includes('level 1') || t.includes('level 2') ||
        t.includes('well-established') || t.includes('good safety'))    return 'evidence-tag-tier-1';
    if (t.includes('moderate') || t.includes('level 3') || t.includes('caution')) return 'evidence-tag-tier-2';
    if (t.includes('weak') || t.includes('limited') || t.includes('insufficient') ||
        t.includes('level 4') || t.includes('level 5') || t.includes('preliminary')) return 'evidence-tag-tier-3';
    return '';
}

/** Build a single evidence card object from an enhanced citations item */
function buildCard(item) {
    const tags = [];

    // Tag 0: evidence strength (with CSS class for colour coding)
    const evStr = h(item.evidence || item.evidenceLevel || item.strength || '');
    if (evStr) tags.push({ text: evStr, classes: evidenceTagClass(evStr) });

    // Tag 1: study type
    const st = h(item.studyType || '');
    if (st) tags.push({ text: st, classes: '' });

    // Tag 2: year
    if (item.year) tags.push({ text: String(item.year), classes: '' });

    // Tag 3: participants / n
    const pts = h(item.participants || item.sampleSize || '');
    if (pts) tags.push({ text: pts, classes: '' });

    // Tag 4: duration (present on benefits, sometimes dosage)
    const dur = h(item.duration || '');
    if (dur) tags.push({ text: dur, classes: '' });

    // Links
    const pid      = h(item.pmid || '');
    const doi      = h(item.doi  || '');
    const linkHref = pid ? `https://pubmed.ncbi.nlm.nih.gov/${pid}/`
                         : (doi ? `https://doi.org/${doi}` : '');
    const linkText = pid ? `PubMed: ${pid}`
                         : (doi ? `DOI: ${doi}` : 'View Source');

    return {
        findingTitle: h(item.claim || item.mechanism || item.healthDomain ||
                        item.safetyAspect || item.dosageRange || ''),
        tags,
        detailsProse: h(item.details || item.findings || ''),
        linkHref,
        linkText,
        pid,
    };
}

/** Convert enhanced_citations.citations → evidenceGroups array for renderPage() */
function buildEvidenceGroups(citations) {
    if (!citations) return [];
    const groups = [];
    const MAP = [
        { key: 'mechanisms', title: 'Mechanisms of Action' },
        { key: 'benefits',   title: 'Clinical Benefits'    },
        { key: 'safety',     title: 'Safety & Tolerability'},
        { key: 'dosage',     title: 'Dosage Research'      },
    ];
    for (const { key, title } of MAP) {
        const items = citations[key];
        if (items && items.length) {
            const flatCards = [];
            for (const item of items) {
                // Support both `evidence` and `studies` as the nested array key
                const nestedArr = Array.isArray(item.evidence) ? item.evidence
                                : Array.isArray(item.studies)  ? item.studies
                                : null;
                if (nestedArr) {
                    // Pattern C: nested group with evidence/studies array – flatten
                    for (const ev of nestedArr) {
                        flatCards.push(buildCard({
                            ...ev,
                            claim: item.mechanism || item.healthDomain || item.safetyAspect || item.dosageRange || item.claim || '',
                            evidence: item.strength || item.evidenceQuality || ev.evidenceLevel || '',
                            details: ev.findings || ev.details || '',
                            participants: ev.sampleSize || ev.participants || '',
                        }));
                    }
                } else {
                    // Pattern A/B: flat item – pass directly
                    flatCards.push(buildCard(item));
                }
            }
            if (flatCards.length) {
                groups.push({ groupTitle: title, cards: flatCards });
            }
        }
    }
    return groups;
}

// ── Category → site link maps ─────────────────────────────────────────────────
const CATEGORY_SLUG_MAP = {
    'nootropic'           : 'nootropics',
    'nootropics'          : 'nootropics',
    'adaptogen'           : 'herbal-extracts',
    'adaptogens'          : 'herbal-extracts',
    'herbal extract'      : 'herbal-extracts',
    'herbal extracts'     : 'herbal-extracts',
    'antioxidant'         : 'antioxidants',
    'antioxidants'        : 'antioxidants',
    'amino acid'          : 'amino-acids',
    'amino acids'         : 'amino-acids',
    'essential nutrient'  : 'essential-nutrients',
    'essential nutrients' : 'essential-nutrients',
    'vitamin'             : 'essential-nutrients',
    'mineral'             : 'essential-nutrients',
    'performance enhancer': 'performance-enhancers',
    'performance enhancers': 'performance-enhancers',
    'anti-inflammatory'   : 'antioxidants',
    'sleep support'       : 'nootropics',
};

const CATEGORY_GUIDE_MAP = {
    'nootropic'            : 'cognitive-performance',
    'nootropics'           : 'cognitive-performance',
    'adaptogen'            : 'stress-resilience',
    'adaptogens'           : 'stress-resilience',
    'sleep support'        : 'sleep',
    'performance enhancer' : 'muscle-strength',
    'performance enhancers': 'muscle-strength',
    'essential nutrient'   : 'immune-function',
    'essential nutrients'  : 'immune-function',
    'vitamin'              : 'immune-function',
    'mineral'              : 'metabolic-health',
    'antioxidant'          : 'longevity',
    'antioxidants'         : 'longevity',
    'anti-inflammatory'    : 'joint-health',
    'amino acid'           : 'cognitive-performance',
    'amino acids'          : 'cognitive-performance',
};

const GUIDE_LABELS = {
    'cognitive-performance': 'Cognitive Performance Guide',
    'stress-resilience'    : 'Stress Resilience Guide',
    'sleep'                : 'Sleep Guide',
    'muscle-strength'      : 'Muscle Strength Guide',
    'immune-function'      : 'Immune Function Guide',
    'metabolic-health'     : 'Metabolic Health Guide',
    'longevity'            : 'Longevity Guide',
    'joint-health'         : 'Joint Health Guide',
    'anxiety-stress'       : 'Anxiety & Stress Relief Guide',
    'mood-support'         : 'Mood Support Guide',
};

const CATEGORY_ICONS = {
    'nootropics'          : 'fas fa-brain',
    'herbal-extracts'     : 'fas fa-leaf',
    'antioxidants'        : 'fas fa-shield-virus',
    'amino-acids'         : 'fas fa-dna',
    'essential-nutrients' : 'fas fa-pills',
    'performance-enhancers': 'fas fa-dumbbell',
};

function buildRelatedCards(supp) {
    const catKey   = (supp.category || '').toLowerCase();
    const catSlug  = CATEGORY_SLUG_MAP[catKey] || 'nootropics';
    const guideKey = CATEGORY_GUIDE_MAP[catKey];
    const cards    = [];

    // 1. Category browse
    cards.push({
        href     : `../categories/${catSlug}.html`,
        iconClass: CATEGORY_ICONS[catSlug] || 'fas fa-th-large',
        title    : supp.category || 'Browse category',
        desc     : 'Browse category',
    });

    // 2. Relevant guide (if mapped)
    if (guideKey) {
        cards.push({
            href     : `../guides/${guideKey}.html`,
            iconClass: 'fas fa-book-open',
            title    : GUIDE_LABELS[guideKey] || `${guideKey} Guide`,
            desc     : 'Evidence guide',
        });
    }

    // 3. Cognitive Performance as a default second guide (if category isn't already cog)
    if (guideKey !== 'cognitive-performance') {
        cards.push({
            href     : '../guides/cognitive-performance.html',
            iconClass: 'fas fa-brain',
            title    : 'Cognitive Performance Guide',
            desc     : 'Evidence guide',
        });
    }

    // 4. Comparison page placeholder (derived from name)
    const slug = slugify(supp.name);
    cards.push({
        href     : `../compare/${slug}-vs-placebo.html`,
        iconClass: 'fas fa-balance-scale',
        title    : `${supp.name} vs Placebo`,
        desc     : 'Head-to-head comparison',
    });

    return cards;
}

/** Build references HTML from keyCitations (supplements.js) */
function buildReferencesFromCitations(supp) {
    return (supp.keyCitations || []).map(c => {
        let html = `${esc(h(c.authors))} (${esc(h(String(c.year || '')))}).`;
        if (c.title) html += ` ${esc(h(c.title))}.`;
        if (c.journal) html += ` <em>${esc(h(c.journal))}</em>.`;
        if (c.doi)  html += ` DOI: <a href="https://doi.org/${esc(h(c.doi))}">${esc(h(c.doi))}</a>`;
        if (c.pmid) html += ` | <a href="https://pubmed.ncbi.nlm.nih.gov/${esc(h(c.pmid))}/">PubMed</a>`;
        return html;
    });
}

// ── Tier helpers ──────────────────────────────────────────────────────────────
const TIER_LABELS = {
    1: 'Tier 1: Strong Evidence',
    2: 'Tier 2: Moderate Evidence',
    3: 'Tier 3: Preliminary Evidence',
    4: 'Tier 4: Emerging/Theoretical',
};

function tierBadgeClass(t) {
    if (/tier\s*1/i.test(t)) return 'hero-badge-tier hero-badge-tier-1';
    if (/tier\s*2/i.test(t)) return 'hero-badge-tier hero-badge-tier-2';
    if (/tier\s*3/i.test(t)) return 'hero-badge-tier hero-badge-tier-3';
    return 'hero-badge-tier';
}

function tierPillStyle(t) {
    if (/tier\s*1/i.test(t)) return 'background:#16a34a;color:#fff';
    if (/tier\s*2/i.test(t)) return 'background:#ca8a04;color:#fff';
    return 'background:#dc2626;color:#fff';
}

// ── Quick-Facts icon map ───────────────────────────────────────────────────────
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

// ── SEO: JSON-LD structured data builders ─────────────────────────────────────

function buildJsonLd(supp, slug, tierText, safetyRat, citCount) {
    const schemas = [];
    const url = `${BASE_URL}/supplements/${slug}.html`;
    const lastUpd = supp.lastUpdated || supp.dateAdded || '';
    const isoDate = lastUpd ? lastUpd.slice(0, 10) : new Date().toISOString().slice(0, 10);

    // 1. MedicalWebPage schema
    schemas.push(JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        name: `${supp.name} — Evidence-Based Guide`,
        description: buildMetaDesc(supp, tierText, safetyRat),
        url: url,
        dateModified: isoDate,
        datePublished: (supp.dateAdded || isoDate).slice(0, 10),
        publisher: {
            '@type': 'Organization',
            name: 'SupplementDB',
            url: BASE_URL
        },
        about: {
            '@type': 'DietarySupplement',
            name: supp.name,
            alternateName: supp.commonNames || [],
            activeIngredient: supp.scientificName || supp.name
        },
        mainContentOfPage: {
            '@type': 'WebPageElement',
            cssSelector: '#overview'
        },
        lastReviewed: isoDate,
        reviewedBy: {
            '@type': 'Organization',
            name: 'SupplementDB Research Team'
        }
    }));

    // 2. FAQPage schema — auto-generated from supplement data
    const faqs = [];

    if (supp.dosageRange) {
        faqs.push({
            '@type': 'Question',
            name: `What is the recommended dosage for ${supp.name}?`,
            acceptedAnswer: {
                '@type': 'Answer',
                text: `The clinical dosage range for ${supp.name} is ${supp.dosageRange}.${supp.optimalDuration ? ` Optimal duration: ${supp.optimalDuration}.` : ''}`
            }
        });
    }

    if (supp.safetyProfile?.rating) {
        const sideEffects = supp.safetyProfile.commonSideEffects || [];
        faqs.push({
            '@type': 'Question',
            name: `Is ${supp.name} safe to take?`,
            acceptedAnswer: {
                '@type': 'Answer',
                text: `${supp.name} has a safety rating of "${supp.safetyProfile.rating}."${sideEffects.length ? ` Common side effects include: ${sideEffects.join(', ')}.` : ''}`
            }
        });
    }

    const allBenefits = [
        ...(supp.primaryBenefits?.cognitive || []),
        ...(supp.primaryBenefits?.nonCognitive || [])
    ];
    if (allBenefits.length > 0) {
        faqs.push({
            '@type': 'Question',
            name: `What are the benefits of ${supp.name}?`,
            acceptedAnswer: {
                '@type': 'Answer',
                text: `Evidence-based benefits of ${supp.name} include: ${allBenefits.join(', ')}. Evidence tier: ${tierText}.`
            }
        });
    }

    if (supp.safetyProfile?.drugInteractions?.length > 0) {
        faqs.push({
            '@type': 'Question',
            name: `Does ${supp.name} interact with medications?`,
            acceptedAnswer: {
                '@type': 'Answer',
                text: `Known drug interactions for ${supp.name}: ${supp.safetyProfile.drugInteractions.join(', ')}. Consult your healthcare provider before combining with medications.`
            }
        });
    }

    if (faqs.length > 0) {
        schemas.push(JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs
        }));
    }

    // 3. BreadcrumbList schema
    schemas.push(JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Supplements', item: `${BASE_URL}/supplements/` },
            { '@type': 'ListItem', position: 3, name: supp.name, item: url }
        ]
    }));

    return schemas;
}

function buildMetaDesc(supp, tierText, safetyRat) {
    const parts = [`${supp.name}: ${tierText}`];
    if (supp.dosageRange) parts.push(`Dosage: ${supp.dosageRange}`);
    parts.push(`Safety: ${safetyRat}`);
    const benefits = [
        ...(supp.primaryBenefits?.cognitive || []),
        ...(supp.primaryBenefits?.nonCognitive || [])
    ].slice(0, 3);
    if (benefits.length) parts.push(benefits.join(', '));
    parts.push('Evidence-based research from peer-reviewed studies');
    return parts.join('. ') + '.';
}

// ── Canonical SupplementMonograph schema builder ───────────────────────────────
/**
 * Maps supplements.js + enhanced_citations → the full SupplementMonograph data
 * object consumed by renderPage().
 *
 * CANONICAL SCHEMA (mirrors all fields used by renderPage in transform.js):
 *
 * Meta/SEO:
 *   title, metaDesc, canonical, ogTitle, ogDesc, ogUrl,
 *   twTitle, twDesc, clerkKey, convexUrl, posthog, jsonLd[]
 *
 * Hero:
 *   tierText, categoryText, safetyText, name, sciName,
 *   commonNames, heroTagline, stats[], trustItems[]
 *
 * Sections (in order):
 *   1. quickFacts[]            { label, valueText }
 *   2. overviewPara, keyFindings, studyPops
 *   3. mechanisms[]            string[]
 *   4. cognBenefits[], nonCognBenefits[]
 *   5. effectSizes[]           { domain, value }
 *   6. dosageFields[]          { label, value }
 *      populationTags[]        string[]
 *   7. safetyRating, sideEffects[], contraindications[], drugInteractions[]
 *   8. evidenceGroups[]        { groupTitle, cards[] }
 *      cards: { findingTitle, tags[]{text,classes}, detailsProse, linkHref, linkText, pid }
 *   9. references[]            HTML string[]
 *  10. relatedCards[]          { href, iconClass, title, desc }
 */
function supplementToMonograph(supp, enhanced) {
    const tierNum   = supp.evidenceTier || 4;
    const tierText  = TIER_LABELS[tierNum] || `Tier ${tierNum}`;
    const safetyRat = h(supp.safetyProfile?.rating || 'See label');
    const slug      = slugify(supp.name);
    const citCount  = enhanced?.evidenceProfile?.totalCitations
                   || supp.enhancedCitations?.evidenceProfile?.totalCitations
                   || supp.keyCitations?.length || 0;
    const lastUpd   = enhanced?.lastUpdated
                   || supp.enhancedCitations?.evidenceProfile?.lastEvidenceUpdate
                   || '';

    // Effect sizes: supplements.js stores as {domain: value} object → convert to array
    const effectSizes = Object.entries(supp.effectSizes || {}).map(([domain, value]) => ({
        domain: domain
            .replace(/([A-Z])/g, ' $1')       // camelCase → Title Case
            .replace(/^./, c => c.toUpperCase())
            .trim(),
        value: h(value),
    }));

    // Quick Facts (9 standard cards in display order)
    const quickFacts = [
        { label: 'Evidence Tier',    valueText: tierText },
        { label: 'Category',         valueText: h(supp.category) },
        { label: 'Scientific Name',  valueText: h(supp.scientificName) },
        { label: 'Clinical Dosage',  valueText: h(supp.dosageRange) },
        { label: 'Optimal Duration', valueText: h(supp.optimalDuration) },
        { label: 'Safety Rating',    valueText: safetyRat },
        { label: 'Available Forms',  valueText: (supp.commercialAvailability?.forms || []).join(', ') },
        { label: 'Cost Range',       valueText: h(supp.commercialAvailability?.costRange) },
        { label: 'Quality Markers',  valueText: (supp.commercialAvailability?.qualityMarkers || []).join(', ') },
    ].filter(f => f.valueText);   // omit empty cards

    // Overview
    const overviewPara = `${h(supp.name)} is classified as ${(h(supp.category) || 'a supplement').toLowerCase()} `
                       + `with ${tierText.toLowerCase()} for its primary applications. `
                       + h(supp.evidenceTierRationale || '');

    // Stats chips in hero
    const stats = [
        citCount ? `${citCount}+ Citations` : null,
        tierText,
        `Safety: ${safetyRat}`,
        lastUpd ? `Updated ${lastUpd.slice(0, 10)}` : null,
    ].filter(Boolean);

    // Evidence groups from enhanced citations
    const evidenceGroups = buildEvidenceGroups(enhanced?.citations);

    // References
    const references = buildReferencesFromCitations(supp);

    // Related cards
    const relatedCards = buildRelatedCards(supp);

    // Common names sentence
    const commonNames = supp.commonNames?.length
        ? `Also known as: ${supp.commonNames.join(', ')}`
        : '';

    return {
        // ── meta ──────────────────────────────────────────────────────────────
        title      : `${h(supp.name)} — Evidence-Based Guide | SupplementDB`,
        metaDesc   : buildMetaDesc(supp, tierText, safetyRat),
        canonical  : `${BASE_URL}/supplements/${slug}.html`,
        ogTitle    : `${h(supp.name)} — Evidence-Based Guide`,
        ogDesc     : h(supp.evidenceTierRationale || `${supp.category} supplement with ${tierText}`),
        ogUrl      : `${BASE_URL}/supplements/${slug}.html`,
        twTitle    : `${h(supp.name)} — Evidence-Based Guide`,
        twDesc     : buildMetaDesc(supp, tierText, safetyRat),
        clerkKey   : CLERK_KEY,
        convexUrl  : CONVEX_URL,
        posthog    : '',      // populated by env if present
        jsonLd     : buildJsonLd(supp, slug, tierText, safetyRat, citCount),
        lastUpdated: (supp.lastUpdated || supp.dateAdded || '').slice(0, 10),

        // ── hero ──────────────────────────────────────────────────────────────
        tierText,
        categoryText: h(supp.category),
        safetyText  : safetyRat,
        name        : h(supp.name),
        sciName     : h(supp.scientificName),
        commonNames,
        heroTagline : h(supp.evidenceTierRationale),
        stats,
        trustItems  : [
            { text: citCount ? `${citCount}+ Citations` : 'Cited', isLink: false },
            { text: tierText,               isLink: false },
            { text: `Safety: ${safetyRat}`, isLink: false },
            { text: 'Our Methodology', href: '../methodology.html', isLink: true },
        ],

        // ── sections ──────────────────────────────────────────────────────────
        quickFacts,
        overviewPara,
        keyFindings : '',  // rationale already included in overviewPara
        studyPops   : supp.studyPopulations?.length
            ? `Key study populations: ${supp.studyPopulations.join('; ')}`
            : '',

        mechanisms     : supp.mechanismsOfAction || [],
        cognBenefits   : supp.primaryBenefits?.cognitive    || [],
        nonCognBenefits: supp.primaryBenefits?.nonCognitive || [],

        effectSizes,

        dosageFields: [
            { label: 'Clinical Dosage Range', value: h(supp.dosageRange) },
            { label: 'Optimal Duration',       value: h(supp.optimalDuration) },
            { label: 'Available Forms',        value: (supp.commercialAvailability?.forms || []).join(', ') },
            { label: 'Quality Markers',        value: (supp.commercialAvailability?.qualityMarkers || []).join(', ') },
        ].filter(f => f.value),
        populationTags: supp.studyPopulations || [],

        safetyRating      : safetyRat,
        sideEffects       : supp.safetyProfile?.commonSideEffects || [],
        contraindications : supp.safetyProfile?.contraindications  || [],
        drugInteractions  : supp.safetyProfile?.drugInteractions   || [],

        evidenceGroups,
        references,
        relatedCards,
    };
}

// ── HTML Builder functions (mirrors transform.js renderPage helpers) ───────────
function buildQuickFacts(qf, tierText) {
    return qf.map(({ label, valueText }) => {
        const icon = qfIcon(label);
        const lc = label.toLowerCase();
        let displayValue = esc(valueText);
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
    return cols.filter(c => c.items.length).map(({ title, items, mod }) =>
        `                <div class="safety-card ${mod}">
                    <div class="safety-card-header">
                        <i class="fas fa-exclamation-triangle"></i> ${esc(title)}
                    </div>
                    <ul class="safety-list">
                        ${items.map(i => `<li>${esc(i)}</li>`).join('\n                        ')}
                    </ul>
                </div>`
    ).join('\n');
}

function buildEvidenceGroupsHTML(groups) {
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
        return `        <div class="citation-group">
            <h3 class="citation-group-header">
                <i class="fas fa-microscope"></i> ${esc(groupTitle)}
            </h3>
            ${cardsHtml}
        </div>`;
    }).join('\n\n');
}

function buildReferencesHTML(refs) {
    return refs.map((html, i) => `            <li class="ref-item">
                <div class="ref-num">${i + 1}</div>
                <div class="ref-text">${html}</div>
            </li>`).join('\n');
}

function buildRelatedCardsHTML(cards) {
    return cards.map(({ href, iconClass, title, desc }) =>
        `                <a class="related-card" href="${esc(href)}">
                    <i class="${esc(iconClass)} related-card-icon"></i>
                    <strong>${esc(title)}</strong>
                    <p>${esc(desc)}</p>
                </a>`
    ).join('\n');
}

// ── Full page renderer (canonical — mirrors transform.js renderPage) ───────────
function renderPage(d, css) {
    const jsonLdHtml = d.jsonLd.map(s =>
        `    <script type="application/ld+json">${s}</script>`
    ).join('\n');

    const statsHtml = d.stats.map(s =>
        `            <div class="hero-stat"><i class="fas fa-circle"></i> ${esc(s)}</div>`
    ).join('\n');

    const trustHtml = d.stats.slice(0, 3).map(s =>
        `        <span class="trust-chip"><i class="fas fa-check-circle"></i> ${esc(s)}</span>`
    ).concat([`        <span class="trust-chip"><i class="fas fa-flask"></i> <a href="../methodology.html">Our Methodology</a></span>`])
    .join('\n');

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
${d.lastUpdated ? `    <meta property="article:modified_time" content="${esc(d.lastUpdated)}">` : ''}

    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">

    <!-- PostHog Analytics -->
    <script>${d.posthog || ''}</script>

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
        /* evidence-prose: prose-format citation details */
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
        ${d.sciName     ? `<p class="hero-sci-name">${esc(d.sciName)}</p>` : ''}
        ${d.commonNames ? `<p class="hero-also-known">${esc(d.commonNames)}</p>` : ''}
        ${d.heroTagline ? `<p class="hero-tagline">${esc(d.heroTagline)}</p>` : ''}
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

        <!-- 1 · Quick Facts -->
        <section class="section" id="quick-facts">
            <div class="section-header">
                <div class="section-num">1</div>
                <div class="section-header-text">
                    <div class="section-label">At a Glance</div>
                    <h2>Quick Facts</h2>
                </div>
            </div>
            <div class="facts-grid">
${buildQuickFacts(d.quickFacts, d.tierText)}
            </div>
        </section>

        <!-- 2 · Overview -->
        <section class="section" id="overview">
            <div class="section-header">
                <div class="section-num">2</div>
                <div class="section-header-text">
                    <div class="section-label">Background</div>
                    <h2>Overview</h2>
                </div>
            </div>
            <div class="overview-content">
                <p>${esc(d.overviewPara)}</p>
                ${d.keyFindings  ? `<p>${esc(d.keyFindings)}</p>` : ''}
                ${d.studyPops    ? `<p>${esc(d.studyPops)}</p>`  : ''}
            </div>
        </section>

        <!-- 3 · Mechanisms -->
        <section class="section" id="mechanisms">
            <div class="section-header">
                <div class="section-num">3</div>
                <div class="section-header-text">
                    <div class="section-label">How It Works</div>
                    <h2>Mechanisms of Action</h2>
                </div>
            </div>
            <div class="mechanism-grid">
${buildMechanisms(d.mechanisms)}
            </div>
        </section>

        <!-- MONOGRAPH_GATE_POINT -->

        <!-- 4 · Benefits -->
        <section class="section" id="benefits">
            <div class="section-header">
                <div class="section-num">4</div>
                <div class="section-header-text">
                    <div class="section-label">What the Research Shows</div>
                    <h2>Benefits</h2>
                </div>
            </div>
            <div class="benefits-grid">
${buildBenefitCol('Cognitive Benefits',     d.cognBenefits)}
${buildBenefitCol('Non-Cognitive Benefits', d.nonCognBenefits)}
            </div>
        </section>

        <!-- 5 · Effect Sizes -->
        <section class="section" id="effect-sizes">
            <div class="section-header">
                <div class="section-num">5</div>
                <div class="section-header-text">
                    <div class="section-label">Quantified Outcomes</div>
                    <h2>Effect Sizes</h2>
                </div>
            </div>
            <p class="section-intro">Quantified effect sizes from clinical research, where available.</p>
            <div class="effect-table-wrap">
                <table class="effect-table">
                    <thead><tr><th>Domain</th><th>Effect Size / Finding</th></tr></thead>
                    <tbody>
${buildEffectRows(d.effectSizes)}
                    </tbody>
                </table>
            </div>
        </section>

        <!-- 6 · Dosage -->
        <section class="section" id="dosage">
            <div class="section-header">
                <div class="section-num">6</div>
                <div class="section-header-text">
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

        <!-- 7 · Safety -->
        <section class="section" id="safety">
            <div class="section-header">
                <div class="section-num">7</div>
                <div class="section-header-text">
                    <div class="section-label">Tolerability</div>
                    <h2>Safety Profile</h2>
                </div>
            </div>
            <div class="safety-rating-box">
                <i class="fas fa-check-circle"></i> Overall Safety Rating: ${esc(d.safetyRating)}
            </div>
            <div class="safety-grid">
${buildSafetyCards(d.sideEffects, d.contraindications, d.drugInteractions)}
            </div>
        </section>

        <!-- 8 · Enhanced Evidence -->
        <section class="section" id="enhanced-evidence">
            <div class="section-header">
                <div class="section-num">8</div>
                <div class="section-header-text">
                    <div class="section-label">Deep Dive</div>
                    <h2>Enhanced Evidence Review</h2>
                </div>
            </div>
            <p class="section-intro">Detailed citation analysis organized by research domain.</p>
${buildEvidenceGroupsHTML(d.evidenceGroups)}
        </section>

        <!-- 9 · References -->
        <section class="section" id="references">
            <div class="section-header">
                <div class="section-num">9</div>
                <div class="section-header-text">
                    <div class="section-label">Citations</div>
                    <h2>References</h2>
                </div>
            </div>
            <ol class="ref-list">
${buildReferencesHTML(d.references)}
            </ol>
        </section>

        <!-- 10 · Related -->
        <section class="section" id="related">
            <div class="section-header">
                <div class="section-num">10</div>
                <div class="section-header-text">
                    <div class="section-label">Explore More</div>
                    <h2>Related Content</h2>
                </div>
            </div>
            <div class="related-grid">
${buildRelatedCardsHTML(d.relatedCards)}
            </div>
        </section>

        <!-- CTA: Free Sleep Guide -->
        <div class="guide-cta-banner" id="guide-cta">
            <div class="guide-cta-inner">
                <div class="guide-cta-icon"><i class="fas fa-moon"></i></div>
                <div class="guide-cta-content">
                    <h3 class="guide-cta-title">Free Evidence-Based Sleep Guide</h3>
                    <p class="guide-cta-desc">7 supplements ranked by research strength, with dosage protocols and interaction warnings. 96 verified citations.</p>
                </div>
                <a href="../guides/sleep" class="guide-cta-btn">
                    <i class="fas fa-book-open"></i> Read Free Guide
                </a>
            </div>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer-box">
            <div class="disclaimer-title"><i class="fas fa-info-circle"></i> Medical Disclaimer</div>
            <p>This monograph is for informational purposes only and does not constitute medical advice. The evidence presented is based on published research and does not replace consultation with a qualified healthcare provider. Supplement efficacy varies by individual, and interactions with medications or health conditions require professional evaluation. Always consult your physician before starting any new supplement regimen.</p>
        </div>

    </main>
</div>

<footer class="site-footer">
    <p><strong>SupplementDB</strong> — Evidence-based supplement research</p>
    <p>Data sourced from peer-reviewed studies. Not medical advice. Consult a healthcare provider.</p>
    <nav>
        <a href="../index.html">Database</a>
        <a href="../about.html">About</a>
        <a href="../methodology.html">Methodology</a>
        <a href="../faq.html">FAQ</a>
        <a href="../legal/terms.html">Terms</a>
        <a href="../legal/privacy.html">Privacy</a>
    </nav>
    <p>&copy; ${new Date().getFullYear()} SupplementDB. All rights reserved.</p>
</footer>

<script src="../js/auth.js" defer></script>
<script src="../js/rbac.js" defer></script>
<script src="../js/convex-client.js" defer></script>
<script>
// Sticky progress nav: highlight active step on scroll
(function(){
    const steps = document.querySelectorAll('.progress-step a');
    const sections = Array.from(steps).map(a => document.querySelector(a.getAttribute('href')));
    function onScroll(){
        const scrollY = window.scrollY + 120;
        let active = 0;
        sections.forEach((s, i) => { if(s && s.offsetTop <= scrollY) active = i; });
        steps.forEach((a, i) => a.classList.toggle('active', i === active));
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.share;
            const url  = encodeURIComponent(location.href);
            const title = encodeURIComponent(document.title);
            const links = {
                twitter  : 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title,
                linkedin : 'https://www.linkedin.com/shareArticle?mini=true&url=' + url,
                facebook : 'https://www.facebook.com/sharer/sharer.php?u=' + url,
            };
            if (type === 'copy') {
                navigator.clipboard.writeText(location.href).then(() => {
                    btn.textContent = '✓ Copied!';
                    setTimeout(() => btn.innerHTML = '<i class="fas fa-link"></i> Copy Link', 2000);
                });
            } else if (links[type]) {
                window.open(links[type], '_blank', 'noopener,width=600,height=400');
            }
        });
    });
})();
</script>
</body>
</html>`;
}

// ── Validation helper ─────────────────────────────────────────────────────────
/**
 * Returns { valid: bool, errors: string[], warnings: string[] } for a supplement.
 * Used by --dry-run mode and can be called standalone as a health check.
 */
function validateMonograph(supp, enhanced) {
    const errors   = [];
    const warnings = [];

    if (!supp.name)          errors.push('name: missing');
    if (!supp.category)      errors.push('category: missing');
    if (!supp.evidenceTier)  errors.push('evidenceTier: missing');
    if (!supp.dosageRange)   warnings.push('dosageRange: missing');
    if (!supp.mechanismsOfAction?.length) warnings.push('mechanismsOfAction: empty');
    if (!supp.primaryBenefits?.cognitive?.length &&
        !supp.primaryBenefits?.nonCognitive?.length) warnings.push('primaryBenefits: both arrays empty');
    if (!supp.effectSizes || !Object.keys(supp.effectSizes).length) warnings.push('effectSizes: empty');
    if (!supp.safetyProfile?.rating) warnings.push('safetyProfile.rating: missing');
    if (!supp.keyCitations?.length)  warnings.push('keyCitations: empty — references section will be empty');

    if (!enhanced) {
        warnings.push('enhanced citations: file not found — evidence section will be empty');
    } else {
        if (!enhanced.citations?.mechanisms?.length) warnings.push('enhanced.mechanisms: empty');
        if (!enhanced.citations?.benefits?.length)   warnings.push('enhanced.benefits: empty');
        if (!enhanced.citations?.safety?.length)     warnings.push('enhanced.safety: empty');
        if (!enhanced.citations?.dosage?.length)     warnings.push('enhanced.dosage: empty (optional)');
    }

    return { valid: errors.length === 0, errors, warnings };
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
    console.log('seed.js — SupplementDB Monograph Generator');
    console.log('DRY_RUN:', DRY_RUN, '| OUT:', OUT_DIR);
    console.log('');

    // Load design system CSS once from templates/monograph.css
    const css = loadCSS();
    if (!css) { process.exit(1); }

    // Load all supplements
    let supplements;
    try {
        supplements = loadSupplements();
    } catch (e) {
        console.error('ERROR loading supplements.js:', e.message);
        process.exit(1);
    }

    // Apply filters
    let targets = supplements;
    if (slugFilter) targets = supplements.filter(s => slugify(s.name) === slugFilter);
    if (idFilter)   targets = supplements.filter(s => s.id === idFilter);
    if (!targets.length) {
        console.error(`No supplement found matching filter (slug="${slugFilter}" id="${idFilter}")`);
        process.exit(1);
    }

    // Ensure output directory exists
    if (!DRY_RUN && !fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    const stats = { total: 0, written: 0, dryRun: 0, errors: 0, warnings: 0 };

    for (const supp of targets) {
        stats.total++;
        const slug          = slugify(supp.name);
        const enhancedFile  = findEnhancedFile(supp.id);
        const enhanced      = loadEnhanced(enhancedFile);
        const validation    = validateMonograph(supp, enhanced);

        // Report
        const status = validation.valid ? '✓' : '✗';
        const warnStr = validation.warnings.length ? ` ⚠ ${validation.warnings.length}` : '';
        const errStr  = validation.errors.length   ? ` ✗ ${validation.errors.join(', ')}`  : '';
        const enhStr  = enhancedFile ? `[${enhancedFile}]` : '[no enhanced file]';
        console.log(`  ${status} ${String(supp.id).padStart(3)} ${h(supp.name).padEnd(35)} ${enhStr}${warnStr}${errStr}`);

        if (validation.warnings.length && DRY_RUN) {
            validation.warnings.forEach(w => console.log(`       ⚠  ${w}`));
        }

        if (!validation.valid) {
            stats.errors++;
            if (!DRY_RUN) continue;   // skip invalid supplements in write mode
        }
        if (validation.warnings.length) stats.warnings++;

        if (DRY_RUN) {
            stats.dryRun++;
            continue;
        }

        // Build data object and render
        const data    = supplementToMonograph(supp, enhanced);
        const html    = renderPage(data, css);
        const outFile = path.join(OUT_DIR, `${slug}.html`);
        fs.writeFileSync(outFile, html, 'utf8');
        stats.written++;
    }

    console.log('');
    console.log(`Total: ${stats.total} | ✓ ${stats.written || stats.dryRun} generated | ⚠ ${stats.warnings} warnings | ✗ ${stats.errors} errors`);
    if (DRY_RUN) console.log('(dry-run — no files written)');
    else         console.log(`Output: ${OUT_DIR}`);
}

main();
