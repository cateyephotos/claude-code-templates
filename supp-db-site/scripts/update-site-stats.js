#!/usr/bin/env node
'use strict';

/**
 * update-site-stats.js — Build-time script to update hardcoded stats
 *
 * Updates meta tags, JSON-LD structured data, and any remaining static
 * count references across all HTML files with current database values.
 *
 * This complements the client-side SiteStats.js by ensuring that
 * SEO-critical content (meta descriptions, JSON-LD) is always current,
 * since search engine crawlers may not execute JavaScript.
 *
 * Usage:
 *   node scripts/update-site-stats.js           # update all files
 *   node scripts/update-site-stats.js --dry-run  # preview changes
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SUPP_PATH = path.join(ROOT, 'data/supplements.js');
const ENHANCED_DIR = path.join(ROOT, 'data/enhanced_citations');

// ── Load database ────────────────────────────────────────────────────────────

function loadSupplementsDB() {
    const src = fs.readFileSync(SUPP_PATH, 'utf8');
    const ctx = { window: {}, module: { exports: {} }, require: () => ({}) };
    vm.runInNewContext(src, ctx);
    return ctx.module.exports || ctx.window.supplementDatabase;
}

function loadEnhancedCitations() {
    const files = fs.readdirSync(ENHANCED_DIR).filter(f => f.endsWith('_enhanced.js'));
    const citations = {};
    for (const file of files) {
        try {
            const src = fs.readFileSync(path.join(ENHANCED_DIR, file), 'utf8');
            const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
            vm.runInNewContext(src, ctx);
            Object.assign(citations, ctx.window.enhancedCitations);
        } catch (err) {
            console.warn(`  ⚠ Could not load ${file}: ${err.message}`);
        }
    }
    return citations;
}

// ── Compute stats ────────────────────────────────────────────────────────────

function computeStats() {
    const db = loadSupplementsDB();
    const enhanced = loadEnhancedCitations();

    const supplements = db.supplements;
    const categories = db.categories || [];
    const healthDomains = db.healthDomains || [];

    // Core counts
    const totalSupplements = supplements.length;
    const totalCategories = categories.length;
    const totalHealthDomains = healthDomains.length;

    // Key citations
    let totalKeyCitations = 0;
    supplements.forEach(s => {
        if (s.keyCitations && Array.isArray(s.keyCitations)) {
            totalKeyCitations += s.keyCitations.length;
        }
    });

    // Enhanced evidence items
    let totalEvidenceItems = 0;
    const enhancedCount = Object.keys(enhanced).length;
    for (const id of Object.keys(enhanced)) {
        const enh = enhanced[id];
        if (enh && enh.citations) {
            for (const section of ['mechanisms', 'benefits', 'safety', 'dosage']) {
                if (enh.citations[section] && Array.isArray(enh.citations[section])) {
                    for (const group of enh.citations[section]) {
                        if (group.evidence && Array.isArray(group.evidence)) {
                            totalEvidenceItems += group.evidence.length;
                        }
                    }
                }
            }
        }
    }

    const totalCombinedCitations = totalKeyCitations + totalEvidenceItems;

    // Round down to nearest 100 for display
    const displayCitations = Math.floor(totalCombinedCitations / 100) * 100;

    // Years of evidence: span from earliest to latest citation year
    const currentYear = new Date().getFullYear();
    const publicationYears = new Set();
    supplements.forEach(s => {
        if (s.keyCitations && Array.isArray(s.keyCitations)) {
            s.keyCitations.forEach(c => {
                if (c.year) publicationYears.add(c.year);
            });
        }
    });
    const yearsList = [...publicationYears].sort((a, b) => a - b);
    const earliestYear = yearsList.length > 0 ? yearsList[0] : currentYear;
    const latestYear = yearsList.length > 0 ? yearsList[yearsList.length - 1] : currentYear;
    const yearsOfEvidence = latestYear - earliestYear;

    // Guides count (from links in index.html)
    const indexSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const guideMatches = indexSrc.match(/href="guides\/[\w-]+\.html"/g) || [];
    const uniqueGuides = new Set(guideMatches);
    const totalGuides = uniqueGuides.size > 0 ? uniqueGuides.size : 8;

    return {
        totalSupplements,
        totalCategories,
        totalHealthDomains,
        totalKeyCitations,
        totalEvidenceItems,
        totalCombinedCitations,
        displayCitations,
        enhancedCount,
        yearsOfEvidence,
        totalGuides
    };
}

// ── Update HTML files ────────────────────────────────────────────────────────

function updateFile(filePath, stats, dryRun) {
    if (!fs.existsSync(filePath)) return false;

    let src = fs.readFileSync(filePath, 'utf8');
    const original = src;

    // Replace common patterns in meta tags and text content
    // Pattern: "471+" or "182+" citations/research papers
    src = src.replace(
        /(\d{2,4}\+?\s*(?:peer-reviewed\s+)?(?:research\s+)?(?:papers|citations|studies|verified))/gi,
        (match) => {
            // Only replace in meta tags and JSON-LD, not in data-stat elements
            return match;
        }
    );

    // Update supplements.js metadata
    if (filePath.endsWith('supplements.js')) {
        src = src.replace(
            /"totalSupplements":\s*\d+/,
            `"totalSupplements": ${stats.totalSupplements}`
        );
        src = src.replace(
            /"completedSupplements":\s*\d+/,
            `"completedSupplements": ${stats.totalSupplements}`
        );
        src = src.replace(
            /"targetSupplements":\s*\d+/,
            `"targetSupplements": ${stats.totalSupplements}`
        );
    }

    // Update meta description patterns
    // "backed by X+ peer-reviewed research papers"
    src = src.replace(
        /backed by \d[\d,]*\+?\s*(?:peer-reviewed\s+)?research papers/g,
        `backed by ${stats.displayCitations.toLocaleString()}+ peer-reviewed research papers`
    );

    // "backed by X+ research papers and systematic reviews"
    src = src.replace(
        /backed by \d[\d,]*\+?\s*research papers and systematic reviews/g,
        `backed by ${stats.displayCitations.toLocaleString()}+ research papers and systematic reviews`
    );

    // "analyzing X+ research papers"
    src = src.replace(
        /analyzing \d[\d,]*\+?\s*research papers/g,
        `analyzing ${stats.displayCitations.toLocaleString()}+ research papers`
    );

    // "X+ peer-reviewed research papers and systematic reviews"
    src = src.replace(
        /\d[\d,]*\+?\s*peer-reviewed research papers and systematic reviews/g,
        `${stats.displayCitations.toLocaleString()}+ peer-reviewed research papers and systematic reviews`
    );

    // "evaluate X+ studies across Y supplements"
    src = src.replace(
        /evaluate \d[\d,]*\+?\s*studies across \d+ supplements/g,
        `evaluate ${stats.displayCitations.toLocaleString()}+ studies across ${stats.totalSupplements} supplements`
    );

    // "X evidence-based supplement guides"
    src = src.replace(
        /(\d+)\s*evidence-based supplement guides/g,
        `${stats.totalGuides} evidence-based supplement guides`
    );

    // "from X+ peer-reviewed studies"
    src = src.replace(
        /from \d[\d,]*\+?\s*(?:peer-reviewed\s+)?studies/g,
        `from ${stats.displayCitations.toLocaleString()}+ peer-reviewed studies`
    );

    // "all X supplements" (in context of database coverage)
    src = src.replace(
        /(?:all |Covers all |covers all )\d+ supplements in the database/g,
        (match) => match.replace(/\d+/, String(stats.totalSupplements))
    );

    // "X supplements across Y citations"
    src = src.replace(
        /\d+\+?\s*supplements across \d[\d,]*\+?\s*(?:research\s+)?(?:papers|citations)/g,
        `${stats.totalSupplements} supplements across ${stats.displayCitations.toLocaleString()}+ research papers`
    );

    // "X+ supplements reviewed, Y+ citations"
    src = src.replace(
        /\d+\+?\s*supplements reviewed,\s*\d[\d,]*\+?\s*(?:clinical\s+)?citations/g,
        `${stats.totalSupplements}+ supplements reviewed, ${stats.displayCitations.toLocaleString()}+ citations`
    );

    // "All X+ citations"
    src = src.replace(
        /All \d[\d,]*\+?\s*citations are sourced/g,
        `All ${stats.displayCitations.toLocaleString()}+ citations are sourced`
    );

    // "X+ supplements, Y+ citations" pattern
    src = src.replace(
        /\d+\+?\s*supplements,\s*\d[\d,]*\+?\s*citations/g,
        `${stats.totalSupplements}+ supplements, ${stats.displayCitations.toLocaleString()}+ citations`
    );

    // Standalone stat numbers "471+" or "182+"
    // Only replace when preceded by common context words
    src = src.replace(
        /class="stat-number">(\d{3,4})\+</g,
        (match, num) => {
            const n = parseInt(num);
            if (n < 200 || n > 2000) return match; // skip unrelated numbers
            return `class="stat-number">${stats.displayCitations.toLocaleString()}+<`;
        }
    );

    // "A systematic review of X supplements across Y citations"
    src = src.replace(
        /systematic review of \d+ supplements across \d[\d,]*\+?\s*(?:PubMed-Verified\s+)?Citations/gi,
        `systematic review of ${stats.totalSupplements} supplements across ${stats.totalCombinedCitations.toLocaleString()}+ PubMed-Verified Citations`
    );

    // "reviews X+ sleep/XYZ supplements across Y+ research papers"
    src = src.replace(
        /reviews? \d+\+?\s*(?:sleep\s+)?supplements across \d[\d,]*\+?\s*research papers/g,
        `reviews ${stats.totalSupplements}+ supplements across ${stats.displayCitations.toLocaleString()}+ research papers`
    );

    // "X+ cited papers"
    src = src.replace(
        /\d[\d,]*\+?\s*cited papers/g,
        `${stats.displayCitations.toLocaleString()}+ cited papers`
    );

    if (src !== original) {
        if (dryRun) {
            console.log(`  [DRY RUN] Would update: ${path.relative(ROOT, filePath)}`);
        } else {
            fs.writeFileSync(filePath, src, 'utf8');
            console.log(`  ✓ Updated: ${path.relative(ROOT, filePath)}`);
        }
        return true;
    }
    return false;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const dryRun = process.argv.includes('--dry-run');

console.log('═══ SupplementDB Site Stats Updater ═══\n');

const stats = computeStats();

console.log('  Database Statistics:');
console.log(`    Supplements:        ${stats.totalSupplements}`);
console.log(`    Categories:         ${stats.totalCategories}`);
console.log(`    Health Domains:     ${stats.totalHealthDomains}`);
console.log(`    Key Citations:      ${stats.totalKeyCitations}`);
console.log(`    Evidence Items:     ${stats.totalEvidenceItems}`);
console.log(`    Combined Citations: ${stats.totalCombinedCitations}`);
console.log(`    Display (rounded):  ${stats.displayCitations}+`);
console.log(`    Enhanced Files:     ${stats.enhancedCount}`);
console.log(`    Years of Evidence:  ${stats.yearsOfEvidence}`);
console.log(`    Guides:             ${stats.totalGuides}`);
console.log('');

// Files to update (meta tags and structured data)
const targetFiles = [
    'index.html',
    'about.html',
    'faq.html',
    'methodology.html',
    'pricing.html',
    'data/supplements.js'
];

// Also update all guide pages and category pages
const guidesDir = path.join(ROOT, 'guides');
const categoriesDir = path.join(ROOT, 'categories');
if (fs.existsSync(guidesDir)) {
    fs.readdirSync(guidesDir)
        .filter(f => f.endsWith('.html'))
        .forEach(f => targetFiles.push('guides/' + f));
}
if (fs.existsSync(categoriesDir)) {
    fs.readdirSync(categoriesDir)
        .filter(f => f.endsWith('.html'))
        .forEach(f => targetFiles.push('categories/' + f));
}

let updated = 0;
for (const file of targetFiles) {
    const fullPath = path.join(ROOT, file);
    if (updateFile(fullPath, stats, dryRun)) {
        updated++;
    }
}

console.log(`\n═══ ${updated} file(s) ${dryRun ? 'would be ' : ''}updated ═══`);
