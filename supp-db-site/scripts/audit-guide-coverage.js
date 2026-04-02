#!/usr/bin/env node
'use strict';

/**
 * audit-guide-coverage.js — Evidence Guide Reassessment Audit
 *
 * After new supplements are imported, this script analyzes which evidence
 * guide pages are affected and how significantly. Produces a structured
 * manifest for operator review and pipeline decision-making.
 *
 * Usage:
 *   node scripts/audit-guide-coverage.js           # full audit + update snapshot
 *   node scripts/audit-guide-coverage.js --dry-run  # report only, no snapshot update
 *   node scripts/audit-guide-coverage.js --reset    # clear snapshot, establish new baseline
 *   node scripts/audit-guide-coverage.js --current  # show current coverage without diffing
 */

const fs = require('fs');
const path = require('path');
const { loadSupplementData } = require('./parse-data');

const ROOT = path.join(__dirname, '..');
const SNAPSHOT_PATH = path.join(ROOT, 'data', '.guide-coverage-snapshot.json');
const MANIFEST_PATH = path.join(ROOT, 'data', 'guide-update-manifest.json');

// ── Load GUIDES array from generate-guide-pages.js ──────────────────────────
let GUIDES;
try {
    const guideModule = require('./generate-guide-pages');
    GUIDES = guideModule.GUIDES;
    if (!GUIDES || !Array.isArray(GUIDES)) {
        throw new Error('GUIDES array not found in generate-guide-pages.js exports');
    }
} catch (err) {
    console.error(`Failed to load GUIDES: ${err.message}`);
    console.error('Ensure generate-guide-pages.js exports { GUIDES } when require.main !== module');
    process.exit(1);
}

// ── Build Coverage Map ──────────────────────────────────────────────────────

function buildCoverageMap(supplements) {
    const coverage = {};
    for (const guide of GUIDES) {
        const matched = supplements.filter(guide.filterFn);
        coverage[guide.slug] = matched.map(s => ({
            id: s.id,
            name: s.name,
            tier: s.evidenceTier || 3,
            category: s.category || 'Unknown'
        }));
    }
    return coverage;
}

// ── Snapshot Management ─────────────────────────────────────────────────────

function loadSnapshot() {
    if (!fs.existsSync(SNAPSHOT_PATH)) return null;
    try {
        return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
    } catch (err) {
        console.warn(`  Warning: Could not parse snapshot: ${err.message}`);
        return null;
    }
}

function saveSnapshot(coverage, totalSupplements) {
    const snapshot = {
        generatedAt: new Date().toISOString(),
        totalSupplements,
        coverage: {}
    };
    for (const [slug, supps] of Object.entries(coverage)) {
        snapshot.coverage[slug] = supps.map(s => s.id);
    }
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), 'utf8');
    console.log(`  Snapshot saved to ${path.relative(ROOT, SNAPSHOT_PATH)}`);
}

// ── Diff Coverage ───────────────────────────────────────────────────────────

function diffCoverage(current, previousSnapshot) {
    const diffs = {};
    const prevCoverage = previousSnapshot ? previousSnapshot.coverage : {};

    for (const [slug, currentSupps] of Object.entries(current)) {
        const prevIds = new Set(prevCoverage[slug] || []);
        const currentIds = new Set(currentSupps.map(s => s.id));

        const added = currentSupps.filter(s => !prevIds.has(s.id));
        const removed = [...prevIds].filter(id => !currentIds.has(id));

        diffs[slug] = {
            previousCount: prevIds.size,
            currentCount: currentIds.size,
            newSupplements: added,
            removedIds: removed,
            tier1Additions: added.filter(s => s.tier === 1).length,
            tier2Additions: added.filter(s => s.tier === 2).length,
            tier3Additions: added.filter(s => s.tier === 3).length
        };
    }
    return diffs;
}

// ── Impact Classification ───────────────────────────────────────────────────

function classifyImpact(diff) {
    if (diff.newSupplements.length === 0 && diff.removedIds.length === 0) return 'none';
    if (diff.tier1Additions > 0 || diff.newSupplements.length >= 3) return 'high';
    if (diff.tier2Additions > 0 || diff.newSupplements.length >= 1) return 'medium';
    return 'low';
}

// ── Recommendations ─────────────────────────────────────────────────────────

function generateRecommendations(guide, diff) {
    const recs = {
        updateCoreSuppNames: false,
        reviewMechanisms: false,
        reviewSafetyNotes: false,
        reviewProse: false
    };

    if (diff.newSupplements.length === 0) return recs;

    // Check if any new Tier 1/2 supplements should be added to coreSuppNames
    const coreNames = new Set(guide.coreSuppNames || []);
    const newHighTier = diff.newSupplements.filter(s => s.tier <= 2);
    if (newHighTier.some(s => !coreNames.has(s.name))) {
        recs.updateCoreSuppNames = true;
    }

    // If Tier 1 additions, review prose (introduction mentions top supplements)
    if (diff.tier1Additions > 0) {
        recs.reviewProse = true;
        recs.reviewMechanisms = true;
        recs.reviewSafetyNotes = true;
    }

    // If 3+ additions of any tier, review mechanisms (may introduce new pathways)
    if (diff.newSupplements.length >= 3) {
        recs.reviewMechanisms = true;
    }

    // If any Tier 2 addition, suggest safety review
    if (diff.tier2Additions > 0) {
        recs.reviewSafetyNotes = true;
    }

    return recs;
}

// ── Orphan Detection ────────────────────────────────────────────────────────

function findOrphans(supplements, coverage) {
    const coveredIds = new Set();
    for (const supps of Object.values(coverage)) {
        supps.forEach(s => coveredIds.add(s.id));
    }
    return supplements.filter(s => !coveredIds.has(s.id)).map(s => ({
        id: s.id,
        name: s.name,
        tier: s.evidenceTier || 3,
        category: s.category || 'Unknown',
        effectSizeKeys: Object.keys(s.effectSizes || {})
    }));
}

// ── Generate Manifest ───────────────────────────────────────────────────────

function generateManifest(supplements, coverage, diffs, previousSnapshot) {
    const previousTotal = previousSnapshot ? previousSnapshot.totalSupplements : 0;

    // Identify newly added supplement IDs (not in previous snapshot)
    const prevAllIds = new Set();
    if (previousSnapshot && previousSnapshot.coverage) {
        for (const ids of Object.values(previousSnapshot.coverage)) {
            ids.forEach(id => prevAllIds.add(id));
        }
    }
    const newSupplementsList = supplements
        .filter(s => !prevAllIds.has(s.id))
        .map(s => `${s.name} (ID ${s.id})`);

    const guides = {};
    let guidesAffected = 0;
    let highImpact = 0;
    let mediumImpact = 0;

    for (const guide of GUIDES) {
        const diff = diffs[guide.slug];
        const impact = classifyImpact(diff);
        const recs = generateRecommendations(guide, diff);

        if (impact !== 'none') guidesAffected++;
        if (impact === 'high') highImpact++;
        if (impact === 'medium') mediumImpact++;

        guides[guide.slug] = {
            title: guide.shortTitle || guide.title,
            previousCount: diff.previousCount,
            currentCount: diff.currentCount,
            newSupplements: diff.newSupplements,
            removedIds: diff.removedIds,
            tier1Additions: diff.tier1Additions,
            tier2Additions: diff.tier2Additions,
            tier3Additions: diff.tier3Additions,
            impactLevel: impact,
            recommendations: recs
        };
    }

    const orphans = findOrphans(supplements, coverage);

    return {
        generatedAt: new Date().toISOString(),
        totalSupplements: supplements.length,
        previousTotal,
        newSupplements: newSupplementsList,
        guides,
        orphans: orphans.length > 0 ? orphans : undefined,
        summary: {
            guidesAffected,
            guidesWithHighImpact: highImpact,
            guidesWithMediumImpact: mediumImpact,
            guidesUnchanged: GUIDES.length - guidesAffected,
            orphanSupplements: orphans.length
        }
    };
}

// ── Console Report ──────────────────────────────────────────────────────────

function printReport(manifest) {
    console.log('\n═══ Evidence Guide Coverage Audit ═══\n');
    console.log(`  Supplements: ${manifest.previousTotal} → ${manifest.totalSupplements} (+${manifest.totalSupplements - manifest.previousTotal})`);
    if (manifest.newSupplements.length > 0) {
        console.log(`  New supplements: ${manifest.newSupplements.join(', ')}`);
    }

    console.log('\n  Guide Impact Summary:');
    console.log(`    High impact:   ${manifest.summary.guidesWithHighImpact}`);
    console.log(`    Medium impact: ${manifest.summary.guidesWithMediumImpact}`);
    console.log(`    Unchanged:     ${manifest.summary.guidesUnchanged}`);

    // Detailed per-guide report
    const sortedGuides = Object.entries(manifest.guides)
        .sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2, none: 3 };
            return (order[a[1].impactLevel] || 3) - (order[b[1].impactLevel] || 3);
        });

    for (const [slug, guide] of sortedGuides) {
        if (guide.impactLevel === 'none') continue;

        const icon = guide.impactLevel === 'high' ? '🔴' :
                     guide.impactLevel === 'medium' ? '🟡' : '🟢';
        console.log(`\n  ${icon} ${slug} (${guide.title})`);
        console.log(`     ${guide.previousCount} → ${guide.currentCount} supplements`);

        if (guide.newSupplements.length > 0) {
            console.log('     New:');
            for (const s of guide.newSupplements) {
                const tierLabel = s.tier === 1 ? 'Tier 1 ★' : s.tier === 2 ? 'Tier 2' : 'Tier 3';
                console.log(`       + ${s.name} (${tierLabel})`);
            }
        }

        if (guide.removedIds.length > 0) {
            console.log(`     Removed IDs: ${guide.removedIds.join(', ')}`);
        }

        const recs = guide.recommendations;
        const activeRecs = Object.entries(recs).filter(([, v]) => v);
        if (activeRecs.length > 0) {
            console.log('     Recommendations:');
            if (recs.updateCoreSuppNames) console.log('       → Update coreSuppNames in GUIDES array');
            if (recs.reviewMechanisms)    console.log('       → Review mechanism sections for new pathways');
            if (recs.reviewSafetyNotes)   console.log('       → Review safety notes for new interactions');
            if (recs.reviewProse)         console.log('       → Review introduction/prose for updated content');
        }
    }

    // Orphan supplements
    if (manifest.orphans && manifest.orphans.length > 0) {
        console.log(`\n  ⚠️  Orphan Supplements (matched zero guides): ${manifest.orphans.length}`);
        for (const s of manifest.orphans) {
            const keys = s.effectSizeKeys.length > 0 ? s.effectSizeKeys.join(', ') : 'NO effectSizes';
            console.log(`     ${s.name} (ID ${s.id}, ${s.category}) — effectSizes: [${keys}]`);
        }
    }

    console.log(`\n═══ ${manifest.summary.guidesAffected} guide(s) affected ═══\n`);
}

// ── Main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const reset = args.includes('--reset');
const currentOnly = args.includes('--current');

// Load supplement data
const db = loadSupplementData();
if (!db || !db.supplements) {
    console.error('Failed to load supplement data');
    process.exit(1);
}

const supplements = db.supplements;
console.log(`  Loaded ${supplements.length} supplements, ${GUIDES.length} guide definitions`);

// Build current coverage map
const coverage = buildCoverageMap(supplements);

if (currentOnly) {
    // Just show current coverage counts
    console.log('\n═══ Current Guide Coverage ═══\n');
    for (const guide of GUIDES) {
        const supps = coverage[guide.slug];
        const t1 = supps.filter(s => s.tier === 1).length;
        const t2 = supps.filter(s => s.tier === 2).length;
        const t3 = supps.filter(s => s.tier === 3).length;
        console.log(`  ${guide.slug}: ${supps.length} supplements (T1:${t1} T2:${t2} T3:${t3})`);
    }
    const orphans = findOrphans(supplements, coverage);
    if (orphans.length > 0) {
        console.log(`\n  ⚠️  ${orphans.length} orphan supplement(s) match zero guides`);
        orphans.forEach(s => console.log(`     ${s.name} (ID ${s.id})`));
    }
    console.log('');
    process.exit(0);
}

// Handle reset
if (reset) {
    if (fs.existsSync(SNAPSHOT_PATH)) {
        fs.unlinkSync(SNAPSHOT_PATH);
        console.log('  Snapshot cleared');
    }
    saveSnapshot(coverage, supplements.length);
    console.log('  New baseline established');
    process.exit(0);
}

// Load previous snapshot for diffing
const previousSnapshot = loadSnapshot();
if (!previousSnapshot) {
    console.log('  No previous snapshot found — establishing baseline');
}

// Diff coverage
const diffs = diffCoverage(coverage, previousSnapshot);

// Generate manifest
const manifest = generateManifest(supplements, coverage, diffs, previousSnapshot);

// Print report
printReport(manifest);

// Save manifest
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`  Manifest saved to ${path.relative(ROOT, MANIFEST_PATH)}`);

// Update snapshot (unless dry run)
if (!dryRun) {
    saveSnapshot(coverage, supplements.length);
} else {
    console.log('  [DRY RUN] Snapshot not updated');
}
