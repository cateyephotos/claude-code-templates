#!/usr/bin/env node
/**
 * Audit: compare enhanced citation metadata totalCitations vs actual array counts.
 * Also checks keyCitations from supplements.js and reports the full picture.
 */
const fs = require('fs');
const path = require('path');
const { loadSupplementData } = require('./parse-data');

const ENHANCED_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');
const rawDb = loadSupplementData();
if (!rawDb) { console.error('Failed to load supplement data'); process.exit(1); }
const db = rawDb.supplements || Object.values(rawDb).find(v => Array.isArray(v)) || [];

const files = fs.readdirSync(ENHANCED_DIR).filter(f => f.endsWith('_enhanced.js')).sort();

let metaMismatches = 0;
const results = [];

files.forEach(f => {
    const src = fs.readFileSync(path.join(ENHANCED_DIR, f), 'utf8');
    const window = { enhancedCitations: {} };
    try { eval(src); } catch(e) { return; }

    let data = null;
    const ec = window.enhancedCitations;
    for (const id of Object.keys(ec)) {
        if (ec[id] && ec[id].citations) { data = ec[id]; break; }
    }
    if (!data) {
        for (const key of Object.keys(window)) {
            if (key === 'enhancedCitations') continue;
            if (window[key] && window[key].citations) { data = window[key]; break; }
        }
    }
    if (!data || !data.citations) return;

    const cits = data.citations;
    const enhancedActual = (cits.mechanisms || []).length + (cits.benefits || []).length +
                           (cits.safety || []).length + (cits.dosage || []).length;
    const metaClaimed = (data.evidenceProfile && data.evidenceProfile.totalCitations) || 0;

    // Find matching supplement in supplements.js
    const suppId = data.supplementId;
    const supp = db.find(s => s.id === suppId);
    const keyCitCount = supp ? (supp.keyCitations || []).length : 0;
    const trueTotal = keyCitCount + enhancedActual;

    if (metaClaimed !== trueTotal) {
        metaMismatches++;
        results.push({
            file: f,
            name: supp ? supp.name : `ID ${suppId}`,
            metaClaimed,
            keyCitations: keyCitCount,
            enhancedActual,
            trueTotal,
            delta: metaClaimed - trueTotal
        });
    }
});

console.log('=== Citation Count Audit ===\n');
console.log(`Enhanced files: ${files.length}`);
console.log(`Supplements in DB: ${db.length}`);
console.log(`Metadata mismatches: ${metaMismatches}\n`);

if (results.length > 0) {
    console.log('MISMATCHES (metadata totalCitations vs keyCitations + enhanced arrays):\n');
    console.log('Supplement'.padEnd(35), 'Meta'.padStart(5), 'Key'.padStart(5), 'Enh'.padStart(5), 'True'.padStart(6), 'Delta'.padStart(6));
    console.log('-'.repeat(62));
    results.forEach(r => {
        console.log(
            r.name.padEnd(35),
            String(r.metaClaimed).padStart(5),
            String(r.keyCitations).padStart(5),
            String(r.enhancedActual).padStart(5),
            String(r.trueTotal).padStart(6),
            String(r.delta).padStart(6)
        );
    });
} else {
    console.log('All metadata totalCitations values match actual citation array counts. ✅');
}

// Also check: supplements with NO enhanced file
const enhancedIds = new Set();
files.forEach(f => {
    const match = f.match(/^(\d+)_/);
    if (match) enhancedIds.add(parseInt(match[1]));
});

const noEnhanced = db.filter(s => !enhancedIds.has(s.id));
if (noEnhanced.length > 0) {
    console.log(`\n${noEnhanced.length} supplements have NO enhanced citations file (using keyCitations only):`);
    noEnhanced.forEach(s => {
        console.log(`  ${s.name} (ID ${s.id}): ${(s.keyCitations || []).length} keyCitations`);
    });
}
