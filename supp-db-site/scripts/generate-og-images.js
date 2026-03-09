#!/usr/bin/env node
/**
 * generate-og-images.js
 * Creates page-specific OG images (1200×630 SVGs) for SupplementDB content pages.
 * Reads guide/category/compare definitions from the generator scripts and
 * the supplement data to produce parameterized SVG OG images.
 *
 * Usage: node scripts/generate-og-images.js
 */

const fs = require('fs');
const path = require('path');
const { loadSupplementData, slugify, groupByCategory, normalizeCategory } = require('./parse-data');

const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');

// ── Brand Constants ────────────────────────────────────────────────────────
const ACCENT = '#2d5a3d';
const ACCENT_LIGHT = '#3a7d5c';
const SURFACE = '#fafaf8';
const SURFACE_END = '#f0f7f3';
const INK = '#1a1a2e';
const INK_MUTED = '#4a4a6a';
const MUTED = '#6b7280';

// Tier colours
const TIER_COLORS = {
    1: '#1a6b3c',
    2: '#b8860b',
    3: '#8b4513',
    4: '#64748b'
};
const TIER_LABELS = {
    1: 'Tier 1 — Strong Evidence',
    2: 'Tier 2 — Moderate Evidence',
    3: 'Tier 3 — Preliminary Evidence',
    4: 'Tier 4 — Limited Evidence'
};

// ── SVG Template ───────────────────────────────────────────────────────────
function ogTemplate({ title, subtitle, badge, stat1, stat2, stat3 }) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${SURFACE};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${SURFACE_END};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${ACCENT};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${ACCENT_LIGHT};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Top accent bar -->
  <rect x="0" y="0" width="1200" height="6" fill="url(#accent)" />
  <!-- Bottom accent bar -->
  <rect x="0" y="624" width="1200" height="6" fill="url(#accent)" />
  <!-- Left accent bar -->
  <rect x="0" y="0" width="6" height="630" fill="${ACCENT}" opacity="0.3" />

  <!-- Decorative grid dots -->
  <g fill="${ACCENT}" opacity="0.06">
    <circle cx="80" cy="80" r="3" /><circle cx="120" cy="80" r="3" /><circle cx="160" cy="80" r="3" />
    <circle cx="80" cy="120" r="3" /><circle cx="120" cy="120" r="3" /><circle cx="160" cy="120" r="3" />
    <circle cx="80" cy="160" r="3" /><circle cx="120" cy="160" r="3" /><circle cx="160" cy="160" r="3" />
    <circle cx="1040" cy="470" r="3" /><circle cx="1080" cy="470" r="3" /><circle cx="1120" cy="470" r="3" />
    <circle cx="1040" cy="510" r="3" /><circle cx="1080" cy="510" r="3" /><circle cx="1120" cy="510" r="3" />
    <circle cx="1040" cy="550" r="3" /><circle cx="1080" cy="550" r="3" /><circle cx="1120" cy="550" r="3" />
  </g>

  <!-- Logo mark -->
  <g transform="translate(100, 190)">
    <circle cx="45" cy="45" r="42" fill="${ACCENT}"/>
    <rect x="30" y="18" width="30" height="54" rx="15" fill="none" stroke="white" stroke-width="2.5"/>
    <line x1="30" y1="45" x2="60" y2="45" stroke="white" stroke-width="1.8"/>
    <path d="M45 18C36.716 18 30 24.716 30 33V45H60V33C60 24.716 53.284 18 45 18Z" fill="white" opacity="0.35"/>
    <path d="M30 45V57C30 65.284 36.716 72 45 72C53.284 72 60 65.284 60 57V45H30Z" fill="white" opacity="0.85"/>
  </g>

  <!-- Badge -->
  ${badge ? `<rect x="210" y="195" width="${badge.length * 9 + 32}" height="30" rx="15" fill="${ACCENT}" opacity="0.12"/>
  <text x="226" y="215" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" fill="${ACCENT}" font-weight="600">${escSvg(badge)}</text>` : ''}

  <!-- Title -->
  <text x="210" y="${badge ? '275' : '260'}" font-family="Georgia, 'Times New Roman', serif" font-size="${title.length > 45 ? '48' : '56'}" font-weight="700" fill="${INK}" letter-spacing="-1">${escSvg(truncate(title, 55))}</text>

  <!-- Subtitle -->
  <text x="210" y="${badge ? '325' : '320'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" fill="${INK_MUTED}" font-weight="400">${escSvg(truncate(subtitle, 75))}</text>

  <!-- Stats bar -->
  <g transform="translate(210, ${badge ? '375' : '370'})">
    <text font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" fill="${ACCENT}" font-weight="600">${escSvg(stat1)}</text>
    <text x="220" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" fill="#9ca3af">|</text>
    <text x="244" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" fill="${ACCENT}" font-weight="600">${escSvg(stat2)}</text>
    ${stat3 ? `<text x="510" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" fill="#9ca3af">|</text>
    <text x="534" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" fill="${ACCENT}" font-weight="600">${escSvg(stat3)}</text>` : ''}
  </g>

  <!-- Divider line -->
  <line x1="210" y1="${badge ? '425' : '420'}" x2="940" y2="${badge ? '425' : '420'}" stroke="${ACCENT}" stroke-width="1" opacity="0.2" />

  <!-- Domain / tagline -->
  <text x="210" y="${badge ? '465' : '460'}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" fill="${MUTED}" font-weight="400">${escSvg(subtitle.length > 60 ? 'Evidence-Based Research | Peer-Reviewed Citations | Open Access' : subtitle)}</text>

  <!-- URL -->
  <text x="210" y="540" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" fill="${ACCENT}" font-weight="500">supplementdb.co</text>
</svg>`;
}

function escSvg(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function truncate(str, maxLen) {
    if (!str || str.length <= maxLen) return str;
    return str.substring(0, maxLen - 1) + '…';
}

// ── Generate ───────────────────────────────────────────────────────────────
function main() {
    const db = loadSupplementData();
    const supplements = db.supplements || [];
    const byCategory = groupByCategory(supplements);
    let count = 0;

    // ── Guide OG Images ────────────────────────────────────────────────
    const GUIDE_DEFS = [
        { slug: 'sleep', title: 'Evidence-Based Supplements for Sleep', shortTitle: 'Sleep Quality', filterKey: 'sleep' },
        { slug: 'anxiety-stress', title: 'Supplements for Anxiety & Stress Relief', shortTitle: 'Anxiety & Stress Relief', filterKey: 'anxiety' },
        { slug: 'cognitive-performance', title: 'Supplements for Cognitive Performance', shortTitle: 'Cognitive Performance', filterKey: 'cognitive' },
        { slug: 'cardiovascular', title: 'Supplements for Cardiovascular Health', shortTitle: 'Cardiovascular Health', filterKey: 'cardiovascular' }
    ];

    GUIDE_DEFS.forEach(g => {
        const svg = ogTemplate({
            title: g.shortTitle,
            subtitle: 'Evidence-Based Supplement Guide',
            badge: 'EVIDENCE GUIDE',
            stat1: '471+ Citations',
            stat2: 'Peer-Reviewed',
            stat3: 'Systematic Review'
        });
        const outPath = path.join(ASSETS, `og-guide-${g.slug}.svg`);
        fs.writeFileSync(outPath, svg, 'utf8');
        console.log(`  ✓ og-guide-${g.slug}.svg`);
        count++;
    });

    // ── Comparison OG Images ───────────────────────────────────────────
    const COMPARE_DEFS = [
        { slug: 'ashwagandha-vs-rhodiola', suppA: 'Ashwagandha', suppB: 'Rhodiola', domain: 'Stress & Adaptogens' },
        { slug: 'magnesium-vs-melatonin', suppA: 'Magnesium', suppB: 'Melatonin', domain: 'Sleep Support' },
        { slug: 'omega-3-vs-coq10', suppA: 'Omega-3', suppB: 'CoQ10', domain: 'Cardiovascular Health' },
        { slug: 'bacopa-vs-ginkgo', suppA: 'Bacopa', suppB: 'Ginkgo Biloba', domain: 'Cognitive Enhancement' }
    ];

    COMPARE_DEFS.forEach(c => {
        const svg = ogTemplate({
            title: `${c.suppA} vs ${c.suppB}`,
            subtitle: `Head-to-Head Comparison for ${c.domain}`,
            badge: 'COMPARISON',
            stat1: 'Clinical Evidence',
            stat2: 'Dosage & Safety',
            stat3: 'Expert Verdict'
        });
        const outPath = path.join(ASSETS, `og-compare-${c.slug}.svg`);
        fs.writeFileSync(outPath, svg, 'utf8');
        console.log(`  ✓ og-compare-${c.slug}.svg`);
        count++;
    });

    // ── Category OG Images ─────────────────────────────────────────────
    const TARGET_CATEGORIES = [
        'Herbal Extracts', 'Essential Nutrients', 'Antioxidants',
        'Nootropics', 'Amino Acids', 'Performance Enhancers'
    ];

    TARGET_CATEGORIES.forEach(cat => {
        const slug = slugify(cat);
        const normalized = normalizeCategory(cat);
        const supps = byCategory[normalized] || [];
        const suppCount = supps.length;
        const totalCitations = supps.reduce((sum, s) => sum + (s.citations ? s.citations.length : 0), 0);

        const svg = ogTemplate({
            title: cat,
            subtitle: `${suppCount} Evidence-Based Supplements`,
            badge: 'CATEGORY',
            stat1: `${suppCount} Supplements`,
            stat2: `${totalCitations}+ Citations`,
            stat3: 'Peer-Reviewed'
        });
        const outPath = path.join(ASSETS, `og-cat-${slug}.svg`);
        fs.writeFileSync(outPath, svg, 'utf8');
        console.log(`  ✓ og-cat-${slug}.svg`);
        count++;
    });

    console.log(`\n[og-images] Done — ${count} OG images generated.`);
}

main();
