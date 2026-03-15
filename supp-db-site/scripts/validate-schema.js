#!/usr/bin/env node
/**
 * validate-schema.js — Schema Compliance Checker for Enhanced Citation Files
 *
 * Validates that enhanced citation files conform to the canonical Pattern C schema.
 * Detects which pattern (A/B/C) each file uses and reports deviations.
 *
 * Usage:
 *   node scripts/validate-schema.js                # validate all files
 *   node scripts/validate-schema.js --id 89        # validate single supplement
 *   node scripts/validate-schema.js --fix          # auto-fix simple issues
 *   node scripts/validate-schema.js --summary      # counts only, no per-file detail
 *
 * Exit codes:
 *   0 — no errors found
 *   1 — one or more errors found
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT         = path.join(__dirname, '..');
const ENHANCED_DIR = path.join(ROOT, 'data', 'enhanced_citations');

// ---- CLI flags ----
const SUMMARY   = process.argv.includes('--summary');
const FIX       = process.argv.includes('--fix');
const TARGET_ID = (() => {
    const i = process.argv.indexOf('--id');
    return i >= 0 ? parseInt(process.argv[i + 1], 10) : null;
})();

// ---- Severity levels ----
const SEV = { ERROR: 'ERROR', WARNING: 'WARNING', INFO: 'INFO' };

// ---- Color helpers for terminal output ----
const COLOR = {
    red:    (s) => `\x1b[31m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    green:  (s) => `\x1b[32m${s}\x1b[0m`,
    cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
    bold:   (s) => `\x1b[1m${s}\x1b[0m`,
    dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

// ---- File loader (same pattern as verify-citations.js) ----
function loadEnhancedFile(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
    vm.createContext(ctx);
    const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+)\s*=/m);
    let patchedSrc = src;
    if (constMatch) {
        patchedSrc = src + `\ntry { window.__top = ${constMatch[1]}; } catch(e) {}`;
    }
    try {
        vm.runInContext(patchedSrc, ctx);
    } catch (e) {
        return null;
    }
    if (ctx.window.__top) return ctx.window.__top;
    const keys = Object.keys(ctx.window.enhancedCitations);
    if (keys.length > 0) return ctx.window.enhancedCitations[keys[0]];
    return null;
}

// ---- Schema definitions ----
const EVIDENCE_ITEM_REQUIRED = {
    citationId: 'string',
    title:      'string',
    authors:    ['string', 'array'],  // string or array
    year:       'number',
    journal:    'string',
    doi:        'string',
    pmid:       'string',
    studyType:  'string',
};

const EVIDENCE_ITEM_RECOMMENDED = {
    evidenceLevel: 'string',
    findings:      'string',
    methodology:   'string',
};

const EVIDENCE_PROFILE_REQUIRED = {
    overallQuality:      'string',
    totalCitations:      'number',
    researchQualityScore:'number',
    lastEvidenceUpdate:  'string',
    evidenceStrength:    'object',
    researchMaturity:    'string',
};

const TOP_LEVEL_REQUIRED = {
    id:              'number',
    name:            'string',
    evidenceProfile: 'object',
    citations:       'object',
};

// ID field aliases — files may use supplementId or id
const ID_ALIASES   = ['id', 'supplementId'];
const NAME_ALIASES = ['name', 'supplementName'];

// Citation group key field mapping for Pattern C
const GROUP_KEY_FIELDS = {
    mechanisms: 'mechanism',
    benefits:   'healthDomain',
    safety:     'safetyAspect',
    dosage:     'dosageRange',
};

// ---- Pattern detection ----
function detectPattern(data) {
    if (!data || !data.citations || typeof data.citations !== 'object') {
        return 'UNKNOWN';
    }

    const groups = ['mechanisms', 'benefits', 'safety', 'dosage'];
    let foundGroup = null;
    let firstItems = [];

    for (const group of groups) {
        if (Array.isArray(data.citations[group]) && data.citations[group].length > 0) {
            foundGroup = group;
            firstItems = data.citations[group].slice(0, 3);
            break;
        }
    }

    if (!foundGroup || firstItems.length === 0) {
        return 'UNKNOWN';
    }

    const item = firstItems[0];

    // Pattern A: has claim + evidence as string + studyType/participants/pmid at top level
    if (typeof item.claim === 'string' && typeof item.evidence === 'string' &&
        (item.studyType || item.participants || item.details)) {
        return 'A';
    }

    // Pattern C: has nested evidence[] or studies[] array and a strength field
    const nestedArr = item.evidence || item.studies;
    if (Array.isArray(nestedArr) && typeof item.strength === 'string') {
        return 'C';
    }
    // Pattern C variant: has nested evidence[]/studies[] array with mechanism/healthDomain/safetyAspect
    if (Array.isArray(nestedArr) &&
        (item.mechanism || item.healthDomain || item.safetyAspect || item.dosageRange)) {
        return 'C';
    }

    // Pattern B: flat citation list with title/authors/journal at top level, no nested evidence[]
    if (typeof item.title === 'string' && (item.authors || item.journal) &&
        !Array.isArray(nestedArr)) {
        return 'B';
    }

    return 'UNKNOWN';
}

// ---- Validation helpers ----
function checkType(value, expectedType) {
    if (Array.isArray(expectedType)) {
        return expectedType.some(t => checkType(value, t));
    }
    if (expectedType === 'array') return Array.isArray(value);
    if (expectedType === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value);
    return typeof value === expectedType;
}

function resolveField(data, aliases) {
    for (const alias of aliases) {
        if (data[alias] !== undefined) return { key: alias, value: data[alias] };
    }
    return { key: aliases[0], value: undefined };
}

// ---- Core validation ----
function validateFile(filePath, data) {
    const issues = [];
    const fileName = path.basename(filePath);

    function addIssue(severity, field, message) {
        issues.push({ severity, field, message, file: fileName });
    }

    // 1. Detect pattern
    const pattern = detectPattern(data);
    if (pattern !== 'C') {
        addIssue(SEV.ERROR, 'citations', `File uses Pattern ${pattern} (expected Pattern C canonical nested schema)`);
    }

    // 2. Top-level required fields
    const idField   = resolveField(data, ID_ALIASES);
    const nameField = resolveField(data, NAME_ALIASES);

    if (idField.value === undefined) {
        addIssue(SEV.ERROR, 'id', 'Missing required field: id (or supplementId)');
    } else if (typeof idField.value !== 'number') {
        addIssue(SEV.ERROR, 'id', `Field "${idField.key}" must be a number, got ${typeof idField.value}`);
    }

    if (nameField.value === undefined) {
        addIssue(SEV.ERROR, 'name', 'Missing required field: name (or supplementName)');
    } else if (typeof nameField.value !== 'string') {
        addIssue(SEV.ERROR, 'name', `Field "${nameField.key}" must be a string, got ${typeof nameField.value}`);
    }

    if (!data.evidenceProfile) {
        addIssue(SEV.ERROR, 'evidenceProfile', 'Missing required field: evidenceProfile');
    }

    if (!data.citations) {
        addIssue(SEV.ERROR, 'citations', 'Missing required field: citations');
    }

    // 3. Evidence profile validation
    if (data.evidenceProfile && typeof data.evidenceProfile === 'object') {
        const ep = data.evidenceProfile;

        for (const [field, expectedType] of Object.entries(EVIDENCE_PROFILE_REQUIRED)) {
            if (ep[field] === undefined) {
                addIssue(SEV.ERROR, `evidenceProfile.${field}`, `Missing required evidence profile field: ${field}`);
            } else if (!checkType(ep[field], expectedType)) {
                addIssue(SEV.ERROR, `evidenceProfile.${field}`,
                    `Field must be ${expectedType}, got ${typeof ep[field]}`);
            }
        }

        // Validate evidenceStrength sub-fields
        if (ep.evidenceStrength && typeof ep.evidenceStrength === 'object') {
            const expectedStrengthFields = ['mechanisms', 'clinicalBenefits', 'safety', 'dosage'];
            for (const sf of expectedStrengthFields) {
                if (!ep.evidenceStrength[sf]) {
                    addIssue(SEV.WARNING, `evidenceProfile.evidenceStrength.${sf}`,
                        `Recommended evidenceStrength sub-field missing: ${sf}`);
                }
            }
        }

        // Optional evidence profile fields
        const optionalEpFields = ['publicationSpan', 'keyFindings', 'tierRationale'];
        for (const f of optionalEpFields) {
            if (!ep[f]) {
                addIssue(SEV.INFO, `evidenceProfile.${f}`, `Optional field missing: ${f}`);
            }
        }
    }

    // 4. Citations structure validation
    if (data.citations && typeof data.citations === 'object') {
        const cit = data.citations;
        const requiredGroups = ['mechanisms', 'benefits', 'safety'];
        const optionalGroups = ['dosage'];

        for (const group of requiredGroups) {
            if (!Array.isArray(cit[group])) {
                addIssue(SEV.ERROR, `citations.${group}`,
                    `Missing or non-array required citation group: ${group}`);
            } else {
                validateCitationGroup(group, cit[group], pattern, addIssue);
            }
        }

        for (const group of optionalGroups) {
            if (cit[group] !== undefined) {
                if (!Array.isArray(cit[group])) {
                    addIssue(SEV.WARNING, `citations.${group}`,
                        `Optional citation group "${group}" exists but is not an array`);
                } else {
                    validateCitationGroup(group, cit[group], pattern, addIssue);
                }
            } else {
                addIssue(SEV.INFO, `citations.${group}`, `Optional citation group missing: ${group}`);
            }
        }
    }

    return { pattern, issues };
}

function validateCitationGroup(groupName, items, pattern, addIssue) {
    const keyField = GROUP_KEY_FIELDS[groupName];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const prefix = `citations.${groupName}[${i}]`;

        if (pattern === 'C') {
            // Pattern C: validate nested structure
            if (!item[keyField] && !item.healthDomain && !item.mechanism && !item.safetyAspect && !item.dosageRange) {
                addIssue(SEV.ERROR, `${prefix}.${keyField}`,
                    `Missing key field "${keyField}" (or equivalent) for ${groupName} item`);
            }

            if (item.strength === undefined && groupName !== 'dosage') {
                addIssue(SEV.WARNING, `${prefix}.strength`, `Missing "strength" field`);
            }

            // Accept both `evidence` and `studies` as the nested array key
            const evidenceArr = Array.isArray(item.evidence) ? item.evidence
                              : Array.isArray(item.studies)  ? item.studies
                              : null;
            if (!evidenceArr) {
                addIssue(SEV.ERROR, `${prefix}.evidence`,
                    `Missing or non-array "evidence" field (Pattern C requires nested evidence[] or studies[])`);
            } else {
                if (item.studies && !item.evidence) {
                    addIssue(SEV.WARNING, `${prefix}.studies`,
                        `Uses "studies" instead of canonical "evidence" — run migrate-citations.js to rename`);
                }
                for (let j = 0; j < evidenceArr.length; j++) {
                    validateEvidenceItem(evidenceArr[j], `${prefix}.evidence[${j}]`, addIssue);
                }
            }
        }
        // Pattern A and B items are already flagged at file level as non-C
    }
}

function validateEvidenceItem(ev, prefix, addIssue) {
    // Required fields
    const requiredChecks = [
        ['title',     'string'],
        ['authors',   ['string', 'array']],
        ['year',      'number'],
        ['journal',   'string'],
        ['doi',       'string'],
        ['pmid',      'string'],
        ['studyType', 'string'],
    ];

    for (const [field, expectedType] of requiredChecks) {
        if (ev[field] === undefined) {
            addIssue(SEV.ERROR, `${prefix}.${field}`, `Missing required evidence field: ${field}`);
        } else if (!checkType(ev[field], expectedType)) {
            const typeLabel = Array.isArray(expectedType) ? expectedType.join(' or ') : expectedType;
            addIssue(SEV.ERROR, `${prefix}.${field}`,
                `Field must be ${typeLabel}, got ${typeof ev[field]}`);
        }
    }

    // citationId: required but often absent — check
    if (ev.citationId === undefined) {
        addIssue(SEV.WARNING, `${prefix}.citationId`, `Missing "citationId" field`);
    } else if (typeof ev.citationId !== 'string') {
        addIssue(SEV.ERROR, `${prefix}.citationId`,
            `Field must be string, got ${typeof ev.citationId}`);
    }

    // Recommended fields
    for (const [field, expectedType] of Object.entries(EVIDENCE_ITEM_RECOMMENDED)) {
        if (ev[field] === undefined) {
            addIssue(SEV.WARNING, `${prefix}.${field}`, `Recommended field missing: ${field}`);
        }
    }

    // Validate year range sanity
    if (typeof ev.year === 'number' && (ev.year < 1900 || ev.year > 2030)) {
        addIssue(SEV.WARNING, `${prefix}.year`, `Year ${ev.year} is outside expected range 1900-2030`);
    }

    // Validate DOI format
    if (typeof ev.doi === 'string' && ev.doi.length > 0 && !ev.doi.startsWith('10.')) {
        addIssue(SEV.WARNING, `${prefix}.doi`, `DOI "${ev.doi}" does not start with "10."`);
    }

    // Validate PMID is numeric string
    if (typeof ev.pmid === 'string' && ev.pmid.length > 0 && !/^\d+$/.test(ev.pmid)) {
        addIssue(SEV.WARNING, `${prefix}.pmid`, `PMID "${ev.pmid}" is not a purely numeric string`);
    }
}

// ---- Auto-fix simple issues ----
function applyFixes(filePath, data) {
    let fixCount = 0;
    const fileName = path.basename(filePath);
    const src = fs.readFileSync(filePath, 'utf8');
    let modified = src;

    // Fix 1: Normalize supplementId → id if id is missing
    if (data.supplementId !== undefined && data.id === undefined) {
        // Add id field after supplementId
        const re = /(\bsupplementId\s*:\s*\d+)/;
        const match = modified.match(re);
        if (match) {
            modified = modified.replace(re, `id: ${data.supplementId},\n    $1`);
            fixCount++;
            console.log(`  ${COLOR.green('FIX')} ${fileName}: Added "id: ${data.supplementId}" (alias of supplementId)`);
        }
    }

    // Fix 2: Normalize supplementName → name if name is missing
    if (data.supplementName !== undefined && data.name === undefined) {
        const re = /(\bsupplementName\s*:\s*"[^"]+")/;
        const match = modified.match(re);
        if (match) {
            modified = modified.replace(re, `name: "${data.supplementName}",\n    $1`);
            fixCount++;
            console.log(`  ${COLOR.green('FIX')} ${fileName}: Added "name: ${JSON.stringify(data.supplementName)}" (alias of supplementName)`);
        }
    }

    if (fixCount > 0 && modified !== src) {
        fs.writeFileSync(filePath, modified, 'utf8');
    }

    return fixCount;
}

// ---- Main execution ----
function main() {
    console.log(COLOR.bold('\n=== Enhanced Citation Schema Validator ===\n'));

    // Collect files
    let files;
    try {
        files = fs.readdirSync(ENHANCED_DIR)
            .filter(f => f.endsWith('_enhanced.js'))
            .sort((a, b) => {
                const numA = parseInt(a.match(/^(\d+)/)?.[1] || '999', 10);
                const numB = parseInt(b.match(/^(\d+)/)?.[1] || '999', 10);
                return numA - numB;
            });
    } catch (e) {
        console.error(COLOR.red(`Cannot read directory: ${ENHANCED_DIR}`));
        console.error(e.message);
        process.exit(1);
    }

    if (TARGET_ID !== null) {
        files = files.filter(f => {
            const match = f.match(/^(\d+)/);
            return match && parseInt(match[1], 10) === TARGET_ID;
        });
        if (files.length === 0) {
            console.error(COLOR.red(`No enhanced citation file found for --id ${TARGET_ID}`));
            process.exit(1);
        }
    }

    console.log(`Scanning ${files.length} enhanced citation file(s) in ${ENHANCED_DIR}\n`);

    // Aggregated stats
    const stats = {
        total:        files.length,
        loaded:       0,
        loadFailed:   0,
        patternA:     0,
        patternB:     0,
        patternC:     0,
        patternUnk:   0,
        errors:       0,
        warnings:     0,
        infos:        0,
        fixesApplied: 0,
        filesWithErrors: [],
        needsMigration:  [],
    };

    for (const file of files) {
        const filePath = path.join(ENHANCED_DIR, file);
        const data = loadEnhancedFile(filePath);

        if (data === null) {
            stats.loadFailed++;
            if (!SUMMARY) {
                console.log(`${COLOR.red('LOAD FAIL')} ${file} — could not parse/execute file`);
            }
            stats.filesWithErrors.push(file);
            stats.errors++;
            continue;
        }

        stats.loaded++;
        const { pattern, issues } = validateFile(filePath, data);

        // Pattern counts
        switch (pattern) {
            case 'A': stats.patternA++; break;
            case 'B': stats.patternB++; break;
            case 'C': stats.patternC++; break;
            default:  stats.patternUnk++; break;
        }

        if (pattern !== 'C') {
            stats.needsMigration.push(file);
        }

        const errors   = issues.filter(i => i.severity === SEV.ERROR);
        const warnings = issues.filter(i => i.severity === SEV.WARNING);
        const infos    = issues.filter(i => i.severity === SEV.INFO);

        stats.errors   += errors.length;
        stats.warnings += warnings.length;
        stats.infos    += infos.length;

        if (errors.length > 0) {
            stats.filesWithErrors.push(file);
        }

        // Apply fixes if requested
        if (FIX && data) {
            stats.fixesApplied += applyFixes(filePath, data);
        }

        // Per-file output (unless --summary)
        if (!SUMMARY) {
            const patternLabel = pattern === 'C'
                ? COLOR.green(`Pattern ${pattern}`)
                : COLOR.yellow(`Pattern ${pattern}`);

            const idVal   = resolveField(data, ID_ALIASES).value;
            const nameVal = resolveField(data, NAME_ALIASES).value;

            if (errors.length === 0 && warnings.length === 0) {
                console.log(`${COLOR.green('PASS')} ${file} [${patternLabel}] id=${idVal} "${nameVal || '?'}"`);
            } else {
                const errLabel = errors.length > 0
                    ? COLOR.red(`${errors.length} error(s)`)
                    : '';
                const warnLabel = warnings.length > 0
                    ? COLOR.yellow(`${warnings.length} warning(s)`)
                    : '';
                const parts = [errLabel, warnLabel].filter(Boolean).join(', ');
                console.log(`${errors.length > 0 ? COLOR.red('FAIL') : COLOR.yellow('WARN')} ${file} [${patternLabel}] id=${idVal} "${nameVal || '?'}" — ${parts}`);

                for (const issue of errors) {
                    console.log(`  ${COLOR.red(SEV.ERROR)}   ${issue.field}: ${issue.message}`);
                }
                for (const issue of warnings) {
                    console.log(`  ${COLOR.yellow(SEV.WARNING)} ${issue.field}: ${issue.message}`);
                }
                for (const issue of infos) {
                    console.log(`  ${COLOR.dim(SEV.INFO)}    ${issue.field}: ${issue.message}`);
                }
            }
        }
    }

    // ---- Summary ----
    console.log(COLOR.bold('\n=== Summary ===\n'));
    console.log(`Files scanned:    ${stats.total}`);
    console.log(`Successfully loaded: ${stats.loaded}`);
    console.log(`Load failures:    ${stats.loadFailed}`);
    console.log('');
    console.log(COLOR.bold('Pattern Distribution:'));
    console.log(`  Pattern A (claim-descriptive):  ${stats.patternA}`);
    console.log(`  Pattern B (flat citation-list): ${stats.patternB}`);
    console.log(`  Pattern C (canonical nested):   ${stats.patternC}`);
    console.log(`  Unknown:                        ${stats.patternUnk}`);
    console.log('');
    console.log(COLOR.bold('Issue Counts:'));
    console.log(`  ${COLOR.red('Errors')}:   ${stats.errors}`);
    console.log(`  ${COLOR.yellow('Warnings')}: ${stats.warnings}`);
    console.log(`  ${COLOR.dim('Info')}:     ${stats.infos}`);

    if (FIX) {
        console.log(`\n  Fixes applied: ${stats.fixesApplied}`);
    }

    if (stats.filesWithErrors.length > 0) {
        console.log(COLOR.bold('\nFiles with errors:'));
        for (const f of stats.filesWithErrors) {
            console.log(`  ${COLOR.red('x')} ${f}`);
        }
    }

    if (stats.needsMigration.length > 0) {
        console.log(COLOR.bold('\nFiles needing migration to Pattern C:'));
        for (const f of stats.needsMigration) {
            console.log(`  ${COLOR.yellow('-')} ${f}`);
        }
    }

    console.log('');

    // Exit code
    if (stats.errors > 0) {
        console.log(COLOR.red(`Validation FAILED — ${stats.errors} error(s) found.\n`));
        process.exit(1);
    } else {
        console.log(COLOR.green('Validation PASSED — no errors found.\n'));
        process.exit(0);
    }
}

main();
