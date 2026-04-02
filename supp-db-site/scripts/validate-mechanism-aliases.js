#!/usr/bin/env node
'use strict';

/**
 * validate-mechanism-aliases.js — Find supplement mechanism strings missing from aliasMap
 *
 * Usage:
 *   node scripts/validate-mechanism-aliases.js           # report missing aliases
 *   node scripts/validate-mechanism-aliases.js --fix     # auto-add missing aliases
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadSupplementData } = require('./parse-data');

const ROOT = path.join(__dirname, '..');
const MECH_PATH = path.join(ROOT, 'data', 'mechanisms.js');

// Load mechanisms.js
let mechDb;
try {
    delete require.cache[require.resolve(MECH_PATH)];
    mechDb = require(MECH_PATH);
} catch (e) {
    console.error(`Failed to load mechanisms.js: ${e.message}`);
    process.exit(1);
}

const aliasMap = mechDb.aliasMap || {};
const mechanisms = mechDb.mechanisms || [];

// Load supplements
const db = loadSupplementData();
if (!db || !db.supplements) {
    console.error('Failed to load supplement data');
    process.exit(1);
}

const supplements = db.supplements;
console.log(`Loaded ${supplements.length} supplements, ${Object.keys(aliasMap).length} alias mappings, ${mechanisms.length} canonical mechanisms\n`);

// Collect all mechanism strings from all supplements
const missingBySupp = {};
const allMissing = new Set();
let totalMechs = 0;
let totalLinked = 0;

for (const s of supplements) {
    const mechs = s.mechanismsOfAction || [];
    for (const m of mechs) {
        const mechStr = typeof m === 'string' ? m : (m.mechanism || String(m));
        totalMechs++;
        if (aliasMap[mechStr]) {
            totalLinked++;
        } else {
            allMissing.add(mechStr);
            if (!missingBySupp[s.name]) missingBySupp[s.name] = [];
            missingBySupp[s.name].push(mechStr);
        }
    }
}

console.log(`Total mechanism references: ${totalMechs}`);
console.log(`Linked (in aliasMap):       ${totalLinked}`);
console.log(`Missing (not in aliasMap):  ${allMissing.size} unique strings`);
console.log(`Supplements affected:       ${Object.keys(missingBySupp).length}\n`);

if (allMissing.size === 0) {
    console.log('✓ All mechanism strings are mapped. No gaps found.');
    process.exit(0);
}

// Print by supplement
const sortedSupps = Object.entries(missingBySupp).sort(([a], [b]) => a.localeCompare(b));
for (const [suppName, mechs] of sortedSupps) {
    console.log(`  ${suppName}:`);
    mechs.forEach(m => console.log(`    ✗ "${m}"`));
}

// ── Fuzzy matching: suggest existing canonical entries ────────────────────
console.log('\n═══ Suggested Mappings ═══\n');

// Build reverse map: canonical ID → mechanism entry
const idToEntry = {};
for (const mech of mechanisms) {
    idToEntry[mech.id] = mech;
}

// Build keyword index from canonical names and aliases
function normalizeForSearch(str) {
    if (!str) return '';
    return String(str).toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function findBestMatch(mechStr) {
    const normalized = normalizeForSearch(mechStr);
    const words = normalized.split(' ').filter(w => w.length > 2);

    let bestId = null;
    let bestScore = 0;

    for (const mech of mechanisms) {
        const targets = [mech.name, ...(mech.aliases || [])].filter(Boolean);
        for (const target of targets) {
            const targetNorm = normalizeForSearch(target);
            // Count matching words
            let score = 0;
            for (const w of words) {
                if (targetNorm.includes(w)) score++;
            }
            // Bonus for exact substring match
            if (targetNorm.includes(normalized) || normalized.includes(targetNorm)) {
                score += words.length;
            }
            if (score > bestScore) {
                bestScore = score;
                bestId = mech.id;
            }
        }
    }

    const matchPct = words.length > 0 ? (bestScore / words.length * 100).toFixed(0) : 0;
    return { id: bestId, score: bestScore, matchPct, totalWords: words.length };
}

const autoMappings = [];

for (const mechStr of [...allMissing].sort()) {
    const match = findBestMatch(mechStr);
    const entry = match.id ? idToEntry[match.id] : null;

    if (match.score >= 3 && parseInt(match.matchPct) >= 40) {
        console.log(`  "${mechStr}"`);
        console.log(`    → ${match.id} (${entry?.name || '?'}) [${match.matchPct}% match]`);
        autoMappings.push({ alias: mechStr, canonicalId: match.id });
    } else {
        console.log(`  "${mechStr}"`);
        console.log(`    → NO MATCH (best: ${match.id || 'none'} at ${match.matchPct}%)`);
    }
}

// ── Auto-fix mode ────────────────────────────────────────────────────────
if (process.argv.includes('--fix')) {
    console.log('\n═══ Auto-Fix Mode ═══\n');

    // Read the raw file to inject aliases
    let src = fs.readFileSync(MECH_PATH, 'utf8');
    let addedCount = 0;

    // For high-confidence matches, add to aliasMap
    const highConfidence = autoMappings.filter(m => parseInt(findBestMatch(m.alias).matchPct) >= 50);

    // Find the aliasMap closing brace to insert before it
    // Pattern: find the last entry before the closing }; of aliasMap
    const aliasMapEnd = src.lastIndexOf('};');
    if (aliasMapEnd === -1) {
        console.error('Could not find aliasMap closing brace');
        process.exit(1);
    }

    let insertions = '';
    for (const { alias, canonicalId } of highConfidence) {
        // Check it's not already there
        if (!src.includes(`"${alias}"`)) {
            insertions += `    "${alias}": "${canonicalId}",\n`;
            addedCount++;
        }
    }

    // For unmatched strings, create new canonical entries
    const unmatched = [...allMissing].filter(m => {
        const match = findBestMatch(m);
        return match.score < 3 || parseInt(match.matchPct) < 50;
    });

    if (unmatched.length > 0) {
        console.log(`\n  ${unmatched.length} mechanisms need NEW canonical entries (cannot auto-map):`);
        unmatched.forEach(m => console.log(`    "${m}"`));
    }

    if (insertions) {
        // Insert before the last };
        src = src.slice(0, aliasMapEnd) + insertions + src.slice(aliasMapEnd);
        fs.writeFileSync(MECH_PATH, src, 'utf8');
        console.log(`\n  ✓ Added ${addedCount} alias mappings to aliasMap`);
    }

    console.log(`\n  Remaining unresolved: ${unmatched.length} mechanisms`);
    if (unmatched.length > 0) {
        console.log('  These need manual review — create new mechanism entries or map to existing ones.');
    }
}
