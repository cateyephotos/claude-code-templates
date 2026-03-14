#!/usr/bin/env node
/**
 * Layer 2 Audit — Enhanced Citations Schema Check
 *
 * For each supplement (1–93), checks:
 *   - File exists in data/enhanced_citations/
 *   - File loads without error (4 patterns supported)
 *   - Required citation arrays present and non-empty
 *   - Per-item required fields present
 *
 * Usage:
 *   node scripts/audit-enhanced-citations.js
 *   node scripts/audit-enhanced-citations.js --id 33
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');
const { loadSupplementData } = require('./parse-data');

const ROOT        = path.join(__dirname, '..');
const ENHANCED_DIR = path.join(ROOT, 'data', 'enhanced_citations');

const TARGET_ID = (() => {
    const i = process.argv.indexOf('--id');
    return i >= 0 ? parseInt(process.argv[i + 1]) : null;
})();

// ---- Load enhanced citation file (mirrors seed.js logic) ----
function loadEnhancedFile(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');

    // Pattern 1: window.xyzEnhanced = {...}
    // Pattern 2: const xyzEnhanced = {...}
    // Pattern 3/4: window.enhancedCitations[id] = {...}

    const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
    vm.createContext(ctx);

    // Handle const/let var assignments by injecting into window
    let patchedSrc = src;

    // Detect const/let assignments to *Enhanced variables
    const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+Enhanced)\s*=/m);
    if (constMatch) {
        // Wrap: after the const decl, assign to window
        patchedSrc = src + `\ntry { window.__enh = ${constMatch[1]}; } catch(e) {}`;
    }

    try {
        vm.runInContext(patchedSrc, ctx);
    } catch (e) {
        return { error: e.message };
    }

    // Extract the citations object
    let enhanced = null;

    if (ctx.window.__enh) {
        enhanced = ctx.window.__enh;
    } else if (Object.keys(ctx.window.enhancedCitations).length > 0) {
        const key = Object.keys(ctx.window.enhancedCitations)[0];
        enhanced = ctx.window.enhancedCitations[key];
    } else if (ctx.module.exports && ctx.module.exports.citations) {
        enhanced = ctx.module.exports;
    } else {
        // Scan window for any key with .citations
        for (const k of Object.keys(ctx.window)) {
            if (k !== 'enhancedCitations' && ctx.window[k] && ctx.window[k].citations) {
                enhanced = ctx.window[k];
                break;
            }
        }
    }

    return enhanced ? { data: enhanced } : { error: 'No enhanced object found after eval' };
}

// ---- Find enhanced citation file for a supplement ----
function findEnhancedFile(supp) {
    const id   = supp.id;
    const slug = supp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const candidates = [
        `${id}_${slug}_enhanced.js`,
        `${id}_enhanced.js`,
    ];
    // Also check any file starting with `${id}_`
    const all = fs.readdirSync(ENHANCED_DIR);
    const match = all.find(f => f.startsWith(`${id}_`) && f.endsWith('_enhanced.js'));
    if (match && !candidates.includes(match)) candidates.unshift(match);

    for (const c of candidates) {
        const fp = path.join(ENHANCED_DIR, c);
        if (fs.existsSync(fp)) return fp;
    }
    return null;
}

// ---- Audit one supplement ----
function auditSupplement(supp) {
    const result = {
        id:       supp.id,
        name:     supp.name,
        file:     null,
        loaded:   false,
        error:    null,
        arrays:   { mechanisms: 0, benefits: 0, safety: 0, dosage: 0 },
        score:    0,     // 0–100
        issues:   [],
    };

    const filePath = findEnhancedFile(supp);
    if (!filePath) {
        result.issues.push('⛔ No enhanced citation file found');
        return result;
    }
    result.file = path.relative(ROOT, filePath);

    const { data, error } = loadEnhancedFile(filePath);
    if (error) {
        result.error = error;
        result.issues.push(`✗ Load error: ${error}`);
        return result;
    }
    result.loaded = true;

    if (!data.citations) {
        result.issues.push('✗ Missing .citations property');
        return result;
    }

    const C = data.citations;
    const ARRAYS = ['mechanisms', 'benefits', 'safety', 'dosage'];
    let score = 0;
    ARRAYS.forEach(arr => {
        const items = C[arr];
        const len = Array.isArray(items) ? items.length : 0;
        result.arrays[arr] = len;
        if (len > 0) score += 25;
        else if (arr === 'mechanisms' || arr === 'benefits') {
            result.issues.push(`✗ citations.${arr}[] is empty (critical)`);
        } else if (arr === 'safety') {
            result.issues.push(`⚠ citations.${arr}[] is empty`);
        } else {
            result.issues.push(`ℹ citations.${arr}[] is empty (optional)`);
        }
    });
    result.score = score;

    // Per-item required field check (sample first item of each non-empty array)
    const REQUIRED_ITEM_FIELDS = ['citationId', 'title', 'year', 'doi', 'pmid', 'findings'];
    ARRAYS.forEach(arr => {
        const items = C[arr];
        if (!Array.isArray(items) || items.length === 0) return;
        items.forEach((group, gi) => {
            const evidenceArr = group.evidence;
            if (!Array.isArray(evidenceArr) || evidenceArr.length === 0) {
                result.issues.push(`⚠ citations.${arr}[${gi}].evidence[] is empty`);
                return;
            }
            // Check first evidence item
            const ev = evidenceArr[0];
            REQUIRED_ITEM_FIELDS.forEach(f => {
                if (!ev[f]) result.issues.push(`⚠ citations.${arr}[${gi}].evidence[0] missing .${f}`);
            });
        });
    });

    return result;
}

// ---- Main ----
function main() {
    const db = loadSupplementData();
    if (!db) { console.error('ERROR: Failed to load supplement data'); process.exit(1); }

    let supps = db.supplements;
    if (TARGET_ID) supps = supps.filter(s => s.id === TARGET_ID);

    console.log('Layer 2 — Enhanced Citations Audit');
    console.log('====================================\n');

    const results = supps.map(auditSupplement);

    // Summary
    const noFile    = results.filter(r => !r.file);
    const loadErr   = results.filter(r => r.file && !r.loaded);
    const fullCov   = results.filter(r => r.score === 100);
    const missDos   = results.filter(r => r.score === 75);
    const partial   = results.filter(r => r.score > 0 && r.score < 75);
    const noEvid    = results.filter(r => r.loaded && r.score === 0);

    console.log('SUMMARY');
    console.log('-------');
    console.log(`Total supplements audited : ${results.length}`);
    console.log(`⛔ No file                : ${noFile.length}`);
    console.log(`✗  Load error             : ${loadErr.length}`);
    console.log(`🟢 Full coverage (100%)   : ${fullCov.length}`);
    console.log(`🟡 Missing dosage (75%)   : ${missDos.length}`);
    console.log(`🟠 Partial (1–74%)        : ${partial.length}`);
    console.log(`🔴 No evidence (0%)       : ${noEvid.length}`);

    // Detailed table for supplements with issues
    const withIssues = results.filter(r => r.issues.length > 0);
    if (withIssues.length === 0) {
        console.log('\n✓ All supplements have complete enhanced citations!');
        return;
    }

    // Critical first (no file, load errors, empty critical arrays)
    const critical = results.filter(r => !r.file || !r.loaded || r.score < 50);
    if (critical.length) {
        console.log('\nCRITICAL / HIGH PRIORITY (score < 50 or no file):');
        console.log('---------------------------------------------------');
        critical.forEach(r => {
            const arrStr = Object.entries(r.arrays).map(([k,v]) => `${k[0]}:${v}`).join(' ');
            console.log(`  [${String(r.id).padStart(2)}] ${r.name.padEnd(30)} score:${r.score}%  [${arrStr}]`);
            r.issues.filter(i => i.startsWith('✗') || i.startsWith('⛔')).forEach(i => console.log(`       ${i}`));
        });
    }

    // Medium priority (score 50–74)
    const medium = results.filter(r => r.loaded && r.score >= 50 && r.score < 75);
    if (medium.length) {
        console.log('\nMEDIUM PRIORITY (score 50–74%):');
        console.log('--------------------------------');
        medium.forEach(r => {
            const arrStr = Object.entries(r.arrays).map(([k,v]) => `${k[0]}:${v}`).join(' ');
            console.log(`  [${String(r.id).padStart(2)}] ${r.name.padEnd(30)} score:${r.score}%  [${arrStr}]`);
        });
    }

    // Low priority (score 75 — only missing dosage)
    const low = results.filter(r => r.score === 75);
    if (low.length) {
        console.log(`\nLOW PRIORITY (missing dosage[] only) — ${low.length} supplements:`);
        const names = low.map(r => `${r.name}(${r.id})`).join(', ');
        // Print in chunks of 5
        const chunks = [];
        for (let i = 0; i < low.length; i += 5) chunks.push(low.slice(i, i+5).map(r => r.name).join(', '));
        chunks.forEach(c => console.log(' ', c));
    }

    // Per-item field warnings (only for critical supplements)
    const itemWarnings = critical.filter(r => r.issues.some(i => i.startsWith('⚠')));
    if (itemWarnings.length) {
        console.log('\nPER-ITEM FIELD WARNINGS (critical supps only):');
        itemWarnings.forEach(r => {
            const warns = r.issues.filter(i => i.startsWith('⚠'));
            if (warns.length) {
                console.log(`  ${r.name}:`);
                warns.slice(0, 5).forEach(w => console.log(`    ${w}`));
            }
        });
    }

    console.log('\nDone.');
}

main();
