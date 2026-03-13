#!/usr/bin/env node
/**
 * inject-schema.js
 * BRO-45: Add BreadcrumbList JSON-LD to all supplement & guide pages,
 *         and add Article JSON-LD to sleep.html which has none.
 *
 * Run: node inject-schema.js
 */

const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname);
const BASE_URL = 'https://supplementdb.co';

let supplementsFixed = 0;
let guidesFixed = 0;
let errors = [];

// ─────────────────────────────────────────────
// Helper: extract a JSON-LD block from HTML
// ─────────────────────────────────────────────
function extractJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────
// Helper: build BreadcrumbList schema
// ─────────────────────────────────────────────
function buildBreadcrumb(pageUrl, pageName, sectionLabel) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": BASE_URL + "/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": sectionLabel,
        "item": BASE_URL + "/" + (sectionLabel === "Supplements" ? "supplements/" : "guides/")
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": pageName,
        "item": pageUrl
      }
    ]
  };
}

// ─────────────────────────────────────────────
// Helper: inject a second JSON-LD block just
//         before </head>
// ─────────────────────────────────────────────
function injectBeforeHead(html, schema) {
  const tag = `\n    <script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  return html.replace('</head>', tag + '\n</head>');
}

// ─────────────────────────────────────────────
// Helper: check if BreadcrumbList already present
// ─────────────────────────────────────────────
function hasBreadcrumb(html) {
  return html.includes('"BreadcrumbList"');
}

// ─────────────────────────────────────────────
// Process supplement pages
// ─────────────────────────────────────────────
function processSupplements() {
  const dir = path.join(SITE_ROOT, 'supplements');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    if (hasBreadcrumb(html)) {
      // Already done – skip
      continue;
    }

    const jsonLd = extractJsonLd(html);
    if (!jsonLd) {
      errors.push(`supplements/${file}: No existing JSON-LD found`);
      continue;
    }

    const pageName = jsonLd.name || file.replace('.html', '');
    const pageUrl = jsonLd.mainEntityOfPage?.['@id'] ||
      `${BASE_URL}/supplements/${file}`;

    const breadcrumb = buildBreadcrumb(pageUrl, pageName, 'Supplements');
    html = injectBeforeHead(html, breadcrumb);
    fs.writeFileSync(filePath, html, 'utf8');
    supplementsFixed++;
  }
}

// ─────────────────────────────────────────────
// Process guide pages
// ─────────────────────────────────────────────

// Map from filename to human-readable guide title (for sleep.html which has no JSON-LD)
const GUIDE_TITLES = {
  'anxiety-stress.html':     'Anxiety & Stress',
  'brain-fog.html':          'Brain Fog',
  'cardiovascular.html':     'Cardiovascular Health',
  'cognitive-performance.html': 'Cognitive Performance',
  'energy-vitality.html':    'Energy & Vitality',
  'gut-brain.html':          'Gut-Brain Axis',
  'immune-function.html':    'Immune Function',
  'joint-health.html':       'Joint Health',
  'longevity.html':          'Longevity',
  'memory-aging.html':       'Memory & Aging',
  'mens-health.html':        "Men's Health",
  'metabolic-health.html':   'Metabolic Health',
  'mood-support.html':       'Mood Support',
  'muscle-strength.html':    'Muscle Strength',
  'nootropic-stacks.html':   'Nootropic Stacks',
  'recovery.html':           'Recovery',
  'safety-interactions.html':'Safety & Interactions',
  'sleep.html':              'Sleep',
  'stress-resilience.html':  'Stress Resilience',
  'womens-health.html':      "Women's Health",
};

function processGuides() {
  const dir = path.join(SITE_ROOT, 'guides');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // ── Special case: sleep.html has NO JSON-LD at all ──
    if (file === 'sleep.html' && !html.includes('application/ld+json')) {
      const sleepUrl = `${BASE_URL}/guides/sleep.html`;

      // Extract description from meta tag
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
      const description = descMatch ? descMatch[1] : 'Systematic review of supplements for sleep quality.';

      // Extract published date from og meta
      const pubMatch = html.match(/published_time" content="([^"]+)"/);
      const datePublished = pubMatch ? pubMatch[1] : '2026-03-04';

      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Evidence-Based Supplements for Sleep | Sleep Evidence Guide",
        "description": description,
        "datePublished": datePublished,
        "dateModified": datePublished,
        "publisher": {
          "@type": "Organization",
          "name": "SupplementDB",
          "url": BASE_URL
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": sleepUrl
        }
      };

      html = injectBeforeHead(html, articleSchema);
      changed = true;
    }

    // ── Add BreadcrumbList if missing ──
    if (!hasBreadcrumb(html)) {
      const jsonLd = extractJsonLd(html);
      let pageName = GUIDE_TITLES[file] || file.replace('.html', '');
      let pageUrl = `${BASE_URL}/guides/${file}`;

      if (jsonLd) {
        // Prefer the name from existing JSON-LD headline stripped of site name
        const headline = jsonLd.headline || '';
        // Use the guide title map for clean short names
        pageName = GUIDE_TITLES[file] || headline.split('|')[0].trim() || pageName;
        pageUrl = jsonLd.mainEntityOfPage?.['@id'] || pageUrl;
      }

      const breadcrumb = buildBreadcrumb(pageUrl, pageName, 'Guides');
      html = injectBeforeHead(html, breadcrumb);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, html, 'utf8');
      guidesFixed++;
    }
  }
}

// ─────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────
console.log('━━━━ BRO-45: Schema.org Injection ━━━━');
console.log('Processing supplement pages…');
processSupplements();
console.log(`  ✅ ${supplementsFixed} supplement pages updated`);

console.log('Processing guide pages…');
processGuides();
console.log(`  ✅ ${guidesFixed} guide pages updated`);

if (errors.length) {
  console.log('\n⚠️  Errors:');
  errors.forEach(e => console.log('  •', e));
} else {
  console.log('\n🎉 No errors. All pages processed successfully.');
}

console.log('\nSummary:');
console.log(`  Supplement pages: ${supplementsFixed} updated`);
console.log(`  Guide pages:      ${guidesFixed} updated`);
console.log(`  Total errors:     ${errors.length}`);
