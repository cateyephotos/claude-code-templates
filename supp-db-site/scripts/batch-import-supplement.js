#!/usr/bin/env node
'use strict';

/**
 * Batch Import Script — Pipeline Mode 6 Automation
 *
 * Takes a JSON file with supplement data and writes:
 *   1. Appends entry to data/supplements.js
 *   2. Creates data/enhanced_citations/{id}_{slug}_enhanced.js
 *   3. Updates js/EnhancedCitationLoader.js registry
 *
 * Usage:
 *   node scripts/batch-import-supplement.js --file /path/to/supplement-data.json
 *   node scripts/batch-import-supplement.js --dir /path/to/batch-dir/  (imports all .json files)
 *   node scripts/batch-import-supplement.js --dry-run --file ...       (validate without writing)
 *
 * The JSON file must have this structure:
 * {
 *   "supplementEntry": { ...supplements.js object... },
 *   "enhancedCitations": { ...enhanced citations object... }
 * }
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SUPP_PATH = path.join(ROOT, 'data/supplements.js');
const ENHANCED_DIR = path.join(ROOT, 'data/enhanced_citations');
const LOADER_PATH = path.join(ROOT, 'js/EnhancedCitationLoader.js');

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name) {
    return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function camelCase(name) {
    return name
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

function loadSupplementsDB() {
    const src = fs.readFileSync(SUPP_PATH, 'utf8');
    const ctx = { window: {}, module: { exports: {} }, require: () => ({}) };
    vm.runInNewContext(src, ctx);
    return ctx.module.exports || ctx.window.supplementDatabase;
}

function getNextId() {
    const db = loadSupplementsDB();
    const maxId = db.supplements.reduce((max, s) => Math.max(max, s.id), 0);
    return maxId + 1;
}

// ── Validation ───────────────────────────────────────────────────────────────

function validateSupplementEntry(entry) {
    const errors = [];
    const required = ['id', 'name', 'category', 'evidenceTier'];
    for (const f of required) {
        if (!entry[f]) errors.push(`Missing required field: ${f}`);
    }

    // Check keyCitations are objects, not strings
    if (entry.keyCitations) {
        for (let i = 0; i < entry.keyCitations.length; i++) {
            const c = entry.keyCitations[i];
            if (typeof c === 'string') {
                errors.push(`keyCitations[${i}] is a string — must be an object with {authors, year, title, journal, doi, pmid}`);
            } else if (typeof c === 'object') {
                if (!c.title) errors.push(`keyCitations[${i}] missing title`);
                if (!c.authors) errors.push(`keyCitations[${i}] missing authors`);
                if (!c.year) errors.push(`keyCitations[${i}] missing year`);
            }
        }
    }

    // Check mechanismsOfAction are strings
    if (entry.mechanismsOfAction) {
        for (let i = 0; i < entry.mechanismsOfAction.length; i++) {
            if (typeof entry.mechanismsOfAction[i] !== 'string') {
                errors.push(`mechanismsOfAction[${i}] must be a string, got ${typeof entry.mechanismsOfAction[i]}`);
            }
        }
    }

    // Check effectSizes values are strings
    if (entry.effectSizes) {
        for (const [k, v] of Object.entries(entry.effectSizes)) {
            if (typeof v !== 'string') {
                errors.push(`effectSizes.${k} must be a string, got ${typeof v}`);
            }
        }
    }

    // Safety profile rating
    const validRatings = ['Excellent', 'Good', 'Moderate', 'Caution'];
    if (entry.safetyProfile && entry.safetyProfile.rating && !validRatings.includes(entry.safetyProfile.rating)) {
        errors.push(`safetyProfile.rating "${entry.safetyProfile.rating}" not in valid set: ${validRatings.join(', ')}`);
    }

    return errors;
}

function validateEnhancedCitations(enh) {
    const errors = [];
    if (!enh.citations) {
        errors.push('Missing citations object');
        return errors;
    }

    const sections = ['mechanisms', 'benefits', 'safety'];
    for (const s of sections) {
        if (!enh.citations[s] || !Array.isArray(enh.citations[s])) {
            errors.push(`Missing or non-array citations.${s}`);
        } else if (enh.citations[s].length === 0) {
            errors.push(`Empty citations.${s} array`);
        }
    }

    // Check evidence items
    for (const section of sections) {
        if (!enh.citations[section]) continue;
        for (let i = 0; i < enh.citations[section].length; i++) {
            const group = enh.citations[section][i];
            if (group.evidence) {
                for (let j = 0; j < group.evidence.length; j++) {
                    const ev = group.evidence[j];
                    if (!ev.title) errors.push(`citations.${section}[${i}].evidence[${j}] missing title`);
                    if (!ev.doi && !ev.pmid) errors.push(`citations.${section}[${i}].evidence[${j}] missing both doi and pmid`);
                    if (ev.doi && !String(ev.doi).startsWith('10.')) {
                        errors.push(`citations.${section}[${i}].evidence[${j}] DOI doesn't start with "10.": ${ev.doi}`);
                    }
                    if (ev.pmid && !/^\d+$/.test(String(ev.pmid))) {
                        errors.push(`citations.${section}[${i}].evidence[${j}] PMID not numeric: ${ev.pmid}`);
                    }
                }
            }
        }
    }

    if (!enh.lastUpdated && !(enh.evidenceProfile && enh.evidenceProfile.lastEvidenceUpdate)) {
        errors.push('Missing lastUpdated or evidenceProfile.lastEvidenceUpdate');
    }

    return errors;
}

// ── Writers ──────────────────────────────────────────────────────────────────

function appendToSupplementsJS(entry) {
    let src = fs.readFileSync(SUPP_PATH, 'utf8');

    // Find the closing of the supplements array: look for the pattern
    // where the last supplement object closes with "}" followed by "],"
    // that belongs to "supplements": [...]
    const entryJson = JSON.stringify(entry, null, 6);
    // Indent to match existing (6-space indent for supplement objects)
    const indented = entryJson.split('\n').map((line, i) => {
        if (i === 0) return '    ' + line; // 4-space indent for opening {
        return '    ' + line; // 4-space for all lines
    }).join('\n');

    // Find the end of the last supplement: }\n  ],\n\n  "categories"
    const marker = /(\})\s*\n(\s*)\],\s*\n\s*"categories"/;
    const match = src.match(marker);
    if (!match) {
        throw new Error('Could not find supplements array end marker in supplements.js');
    }

    const insertPos = src.indexOf(match[0]);
    const before = src.slice(0, insertPos + 1); // include the closing }
    const after = src.slice(insertPos + 1);      // rest starting with \n  ],

    src = before + ',\n' + indented + after;

    // Update metadata
    src = src.replace(/"totalSupplements":\s*\d+/, `"totalSupplements": ${entry.id}`);
    src = src.replace(/"completedSupplements":\s*\d+/, `"completedSupplements": ${entry.id}`);
    src = src.replace(/"targetSupplements":\s*\d+/, `"targetSupplements": ${entry.id}`);

    fs.writeFileSync(SUPP_PATH, src, 'utf8');
    console.log(`  ✓ Appended ID ${entry.id} (${entry.name}) to supplements.js`);
}

function writeEnhancedCitationsFile(id, name, enhData) {
    const slug = slugify(name);
    const varName = camelCase(name) + 'Enhanced';
    const filename = `${id}_${slug}_enhanced.js`;
    const filepath = path.join(ENHANCED_DIR, filename);

    // Ensure lastUpdated is set
    if (!enhData.lastUpdated) {
        enhData.lastUpdated = new Date().toISOString().split('T')[0];
    }
    if (enhData.evidenceProfile && !enhData.evidenceProfile.lastEvidenceUpdate) {
        enhData.evidenceProfile.lastEvidenceUpdate = new Date().toISOString().split('T')[0];
    }

    const json = JSON.stringify(enhData, null, 2);
    const content = `const ${varName} = ${json};

// === REQUIRED EXPORT BLOCK ===
window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[${id}] = ${varName};
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ${varName};
}
`;

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  ✓ Created ${filename}`);
    return { filename, varName };
}

function updateEnhancedCitationLoader(id, filename, varName) {
    let src = fs.readFileSync(LOADER_PATH, 'utf8');

    // Find the last entry in the enhancedFiles array
    const lastEntryRegex = /\{ id: (\d+), file: '[^']+', globalVar: '[^']+' \}\s*\n\s*\];/;
    const match = src.match(lastEntryRegex);
    if (!match) {
        throw new Error('Could not find enhancedFiles array end in EnhancedCitationLoader.js');
    }

    const newEntry = `{ id: ${id}, file: '${filename}', globalVar: '${varName}' }`;
    const insertPoint = src.indexOf(match[0]);
    const before = src.slice(0, insertPoint + match[0].indexOf('\n'));
    const after = src.slice(insertPoint + match[0].indexOf('\n'));

    // Insert after the last entry, before the closing ];
    src = src.slice(0, insertPoint) +
        match[0].replace('\n', '') + ',\n' +
        `            ${newEntry}\n` +
        '        ];\n' +
        src.slice(insertPoint + match[0].length + (src.slice(insertPoint + match[0].length).indexOf('\n') >= 0 ? 0 : 0));

    // Simpler approach: just replace the last entry + closing bracket
    src = fs.readFileSync(LOADER_PATH, 'utf8');
    const closingPattern = `{ id: ${parseInt(match[1])}, file: '`;
    const closingIdx = src.indexOf(closingPattern);
    if (closingIdx === -1) throw new Error('Cannot find last loader entry');

    // Find the ];  after this last entry
    const bracketIdx = src.indexOf('];', closingIdx);
    if (bracketIdx === -1) throw new Error('Cannot find ]; after last loader entry');

    // Insert new entry before ];
    const beforeBracket = src.slice(0, bracketIdx);
    const afterBracket = src.slice(bracketIdx);

    // The line before ]; should end with the last entry. Add comma + newline + new entry
    src = beforeBracket.trimEnd() + ',\n' +
        `            ${newEntry}\n` +
        '        ' + afterBracket;

    fs.writeFileSync(LOADER_PATH, src, 'utf8');
    console.log(`  ✓ Added ID ${id} to EnhancedCitationLoader.js`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

function importSupplement(data, dryRun) {
    const { supplementEntry, enhancedCitations } = data;

    if (!supplementEntry || !enhancedCitations) {
        console.error('ERROR: JSON must have "supplementEntry" and "enhancedCitations" keys');
        return false;
    }

    const name = supplementEntry.name;
    const id = supplementEntry.id;
    console.log(`\n── Import: ${name} (ID ${id}) ──`);

    // Validate
    const suppErrors = validateSupplementEntry(supplementEntry);
    const enhErrors = validateEnhancedCitations(enhancedCitations);

    if (suppErrors.length > 0 || enhErrors.length > 0) {
        console.log('\n  VALIDATION ERRORS:');
        for (const e of suppErrors) console.log(`    ✗ [supp] ${e}`);
        for (const e of enhErrors) console.log(`    ✗ [enh]  ${e}`);
        if (!dryRun) {
            console.log('\n  ✗ Import BLOCKED — fix errors above');
            return false;
        }
    } else {
        console.log('  ✓ Validation passed');
    }

    if (dryRun) {
        console.log('  [DRY RUN] Would write files — skipping');
        return suppErrors.length === 0 && enhErrors.length === 0;
    }

    // Write files
    try {
        appendToSupplementsJS(supplementEntry);
        const { filename, varName } = writeEnhancedCitationsFile(id, name, enhancedCitations);
        updateEnhancedCitationLoader(id, filename, varName);
        console.log(`  ✓ Import complete for ${name}`);
        return true;
    } catch (err) {
        console.error(`  ✗ Import failed: ${err.message}`);
        return false;
    }
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fileIdx = args.indexOf('--file');
const dirIdx = args.indexOf('--dir');

if (fileIdx >= 0 && args[fileIdx + 1]) {
    const filePath = path.resolve(args[fileIdx + 1]);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const ok = importSupplement(data, dryRun);
    process.exit(ok ? 0 : 1);
} else if (dirIdx >= 0 && args[dirIdx + 1]) {
    const dirPath = path.resolve(args[dirIdx + 1]);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json')).sort();
    let pass = 0, fail = 0;
    for (const f of files) {
        const data = JSON.parse(fs.readFileSync(path.join(dirPath, f), 'utf8'));
        if (importSupplement(data, dryRun)) pass++;
        else fail++;
    }
    console.log(`\n══ Batch complete: ${pass} passed, ${fail} failed ══`);
    process.exit(fail > 0 ? 1 : 0);
} else {
    console.log('Usage:');
    console.log('  node scripts/batch-import-supplement.js --file supplement.json [--dry-run]');
    console.log('  node scripts/batch-import-supplement.js --dir ./batch/ [--dry-run]');
    process.exit(2);
}
