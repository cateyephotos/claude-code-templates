#!/usr/bin/env node
/**
 * SupplementDB — Single Source of Truth Stats Generator
 *
 * Reads data/supplements.js and computes all site-wide metrics:
 *   - Total supplements
 *   - Total citations (sum of keyCitations.length)
 *   - Average evidence tier
 *   - Counts per category
 *   - Counts per health domain
 *
 * Writes computed stats to data/site-stats.json (machine-readable single source of truth),
 * then patches hardcoded values in index.html and any other static HTML that embeds counts.
 *
 * Usage:
 *   node scripts/generate-stats.js              # compute + patch
 *   node scripts/generate-stats.js --dry-run    # compute only, print diff, no writes
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { loadSupplementData, normalizeCategory, slugify } = require('./parse-data');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT    = path.join(__dirname, '..');

// ---- Health-domain → guide page slug mapping (drives subtitle patching in index.html) ----
// Maps each healthDomain.name to the guide page whose subtitle should show the count
const DOMAIN_TO_GUIDE_SLUG = {
    'Sleep Quality':              'sleep',
    'Anxiety Reduction':          'anxiety-stress',
    'Stress Resilience':          'stress-resilience',
    'Memory Enhancement':         'memory-aging',
    'Focus & Attention':          'cognitive-performance',
    'Mood Stabilization':         'mood-support',
    'Cardiovascular Health':      'cardiovascular',
    'Metabolic Support':          'metabolic-health',
    'Joint Health & Mobility':    'joint-health',
    'Immune System Support':      'immune-function',
    'Energy & Vitality':          'energy-vitality',
    'Neuroprotection':            'cognitive-performance',
    'Antioxidant Support':        'longevity',
};

// ---- Helpers ----

function writeFile(filePath, content) {
    if (DRY_RUN) {
        console.log(`[dry-run] Would write: ${path.relative(ROOT, filePath)}`);
    } else {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Wrote ${path.relative(ROOT, filePath)}`);
    }
}

function patchHtml(filePath, patches) {
    if (!fs.existsSync(filePath)) {
        console.warn(`WARNING: ${path.relative(ROOT, filePath)} not found — skipping`);
        return;
    }
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const { pattern, replacement, description } of patches) {
        if (typeof pattern === 'string') {
            if (html.includes(pattern)) {
                html = html.split(pattern).join(replacement);
                changed = true;
                if (DRY_RUN) console.log(`  [patch] ${description}: "${pattern}" → "${replacement}"`);
            }
        } else if (pattern instanceof RegExp) {
            const before = html;
            html = html.replace(pattern, replacement);
            if (html !== before) {
                changed = true;
                if (DRY_RUN) console.log(`  [patch] ${description}`);
            }
        }
    }

    if (changed) {
        if (DRY_RUN) {
            console.log(`[dry-run] Would patch: ${path.relative(ROOT, filePath)}`);
        } else {
            fs.writeFileSync(filePath, html, 'utf8');
            console.log(`✓ Patched ${path.relative(ROOT, filePath)}`);
        }
    } else {
        if (!DRY_RUN) console.log(`  (no changes) ${path.relative(ROOT, filePath)}`);
    }
}

// ---- Main computation ----

function computeStats(db) {
    const supps = db.supplements;

    // Global
    const totalSupplements = supps.length;
    const totalCitations   = supps.reduce((s, x) => s + (x.keyCitations?.length || 0), 0);
    const avgEvidenceTier  = parseFloat((supps.reduce((s, x) => s + x.evidenceTier, 0) / supps.length).toFixed(2));

    // Tier distribution
    const tierDist = {};
    supps.forEach(s => { tierDist[s.evidenceTier] = (tierDist[s.evidenceTier] || 0) + 1; });

    // Per normalized category
    const perCategory = {};
    supps.forEach(s => {
        const cat  = normalizeCategory(s.category);
        const slot = perCategory[cat] || { supplements: 0, citations: 0 };
        slot.supplements++;
        slot.citations += s.keyCitations?.length || 0;
        perCategory[cat] = slot;
    });

    // Per health domain (match by primary benefits text)
    const perDomain = {};
    (db.healthDomains || []).forEach(d => {
        let count = 0;
        supps.forEach(s => {
            const all = [
                ...(s.primaryBenefits?.cognitive || []),
                ...(s.primaryBenefits?.nonCognitive || []),
                ...(s.studyPopulations || [])
            ].join(' ').toLowerCase();
            const kw = d.name.toLowerCase().split(/[\s&]+/)[0];
            if (all.includes(kw)) count++;
        });
        perDomain[d.name] = count;
    });

    return {
        generated:         new Date().toISOString().slice(0, 10),
        totalSupplements,
        totalCitations,
        avgEvidenceTier,
        tierDist,
        perCategory,
        perDomain
    };
}

// ---- Patch index.html ----

function buildIndexPatches(stats) {
    const { totalSupplements, totalCitations } = stats;
    const patches = [];

    // Meta description and OG/Twitter counts (471+)
    const citCount = `${totalCitations}+`;
    const suppCount = String(totalSupplements);

    // Citation count in meta descriptions and hero
    [
        'backed by 471+ research papers and systematic reviews.',
        'backed by 471+ research papers',
    ].forEach(old => {
        patches.push({
            pattern: old,
            replacement: old.replace('471+', citCount),
            description: `meta description citation count → ${citCount}`
        });
    });

    // Inline stat: 471+
    patches.push({
        pattern: '>471+<',
        replacement: `>${citCount}<`,
        description: `hero stat citation count → ${citCount}`
    });

    // Footer description "Analyzing 471+ peer-reviewed studies across 93 supplements"
    patches.push({
        pattern: /Analyzing \d+\+ peer-reviewed studies across \d+ supplements/g,
        replacement: `Analyzing ${citCount} peer-reviewed studies across ${suppCount} supplements`,
        description: `footer stats → ${citCount} studies / ${suppCount} supplements`
    });

    // Text line "backed by 471+ research papers and systematic reviews"
    patches.push({
        pattern: /backed by \d+\+ research papers and systematic reviews/g,
        replacement: `backed by ${citCount} research papers and systematic reviews`,
        description: `hero subtitle citation count → ${citCount}`
    });

    // Body text "analyzing 471+ research papers from the last 20 years"
    patches.push({
        pattern: /analyzing \d+\+ research papers from the last \d+ years/gi,
        replacement: `analyzing ${citCount} research papers from the last 20 years`,
        description: `trust section citation count → ${citCount}`
    });

    return patches;
}

// ---- Patch static category footer nav in index.html ----

function buildCategoryNavPatches(stats) {
    // The footer category links in index.html only list 6 categories;
    // this replaces that entire block with all generated categories.
    // We identify the block by a known anchor string and replace it.
    // If the block changes shape, this is a no-op (won't error).
    return [];  // index.html footer nav is maintained separately
}

// ---- Main ----

function main() {
    console.log('SupplementDB — Stats Generator');
    console.log('===============================\n');

    const db = loadSupplementData();
    if (!db) {
        console.error('ERROR: Failed to load supplement data');
        process.exit(1);
    }

    const stats = computeStats(db);

    // ---- Write site-stats.json ----
    const statsPath = path.join(ROOT, 'data', 'site-stats.json');
    writeFile(statsPath, JSON.stringify(stats, null, 2));

    console.log('\nStats computed:');
    console.log(`  Supplements : ${stats.totalSupplements}`);
    console.log(`  Citations   : ${stats.totalCitations}`);
    console.log(`  Avg Tier    : ${stats.avgEvidenceTier}`);
    console.log(`  Tier dist   : ${Object.entries(stats.tierDist).sort(([a],[b]) => a-b).map(([t,c]) => `T${t}:${c}`).join(', ')}`);

    console.log('\nPer category:');
    Object.entries(stats.perCategory).sort(([,a],[,b]) => b.supplements - a.supplements).forEach(([cat, data]) => {
        console.log(`  ${cat}: ${data.supplements} supps, ${data.citations} citations`);
    });

    // ---- Patch index.html ----
    console.log('\nPatching index.html...');
    const indexPath = path.join(ROOT, 'index.html');
    patchHtml(indexPath, buildIndexPatches(stats));

    console.log('\nDone.');
    if (DRY_RUN) console.log('(dry-run — no files written)');
}

main();
