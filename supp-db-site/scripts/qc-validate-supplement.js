#!/usr/bin/env node
'use strict';

/**
 * QC Validation Gate — Pipeline Quality Control
 *
 * Validates a supplement entry + enhanced citations BEFORE seeding.
 * Catches schema mismatches, missing fields, format errors, and data quality
 * issues that would cause broken or incomplete monograph pages.
 *
 * Usage:
 *   node scripts/qc-validate-supplement.js --file /path/to/supplement-data.json
 *   node scripts/qc-validate-supplement.js --id 94        (validates in-DB entry)
 *   node scripts/qc-validate-supplement.js --all           (validates all DB entries)
 *
 * Exit codes:
 *   0 = PASS (0 critical, 0 errors — safe to seed)
 *   1 = FAIL (critical issues found — must fix before seeding)
 *   2 = WARN (warnings only — can seed but review recommended)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SUPP_PATH = path.join(ROOT, 'data/supplements.js');
const ENHANCED_DIR = path.join(ROOT, 'data/enhanced_citations');
const MECH_PATH = path.join(ROOT, 'data/mechanisms.js');

// ── Issue tracking ──────────────────────────────────────────────────────────

class QCReport {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.critical = [];   // Blocks seeding — page will be broken
        this.errors = [];     // Should fix — section will be empty/wrong
        this.warnings = [];   // Cosmetic — page works but suboptimal
        this.info = [];       // Informational notes
    }

    addCritical(msg) { this.critical.push(msg); }
    addError(msg)    { this.errors.push(msg); }
    addWarning(msg)  { this.warnings.push(msg); }
    addInfo(msg)     { this.info.push(msg); }

    get passed() { return this.critical.length === 0 && this.errors.length === 0; }
    get seedable() { return this.critical.length === 0; }

    print() {
        const icon = this.critical.length ? '\u2717' : this.errors.length ? '\u26A0' : '\u2713';
        console.log(`\n${icon}  ${this.name} (ID: ${this.id})`);
        console.log('\u2500'.repeat(60));

        if (this.critical.length) {
            console.log('  CRITICAL (blocks seeding):');
            this.critical.forEach(m => console.log(`    \u2717 ${m}`));
        }
        if (this.errors.length) {
            console.log('  ERRORS (section will be broken):');
            this.errors.forEach(m => console.log(`    \u26A0 ${m}`));
        }
        if (this.warnings.length) {
            console.log('  WARNINGS (review recommended):');
            this.warnings.forEach(m => console.log(`    \u25CB ${m}`));
        }
        if (this.info.length) {
            console.log('  INFO:');
            this.info.forEach(m => console.log(`    \u2022 ${m}`));
        }
        if (this.passed) {
            console.log('  \u2713 ALL CHECKS PASSED \u2014 safe to seed');
        }
    }

    toJSON() {
        return {
            name: this.name, id: this.id,
            passed: this.passed, seedable: this.seedable,
            critical: this.critical, errors: this.errors,
            warnings: this.warnings, info: this.info
        };
    }
}

// ── Validators ──────────────────────────────────────────────────────────────

function validateSupplementEntry(supp, report) {
    // === CRITICAL: Required fields that block page generation ===
    if (!supp.name)         report.addCritical('name: MISSING \u2014 page cannot be generated');
    if (!supp.id)           report.addCritical('id: MISSING \u2014 cannot link to enhanced citations');
    if (!supp.category)     report.addCritical('category: MISSING \u2014 required for card rendering');
    if (!supp.evidenceTier) report.addCritical('evidenceTier: MISSING \u2014 required for hero badge');

    // === ERRORS: Fields that cause empty sections ===
    if (!supp.scientificName) report.addError('scientificName: missing \u2014 hero sub-heading empty');
    if (!supp.dosageRange)    report.addError('dosageRange: missing \u2014 Quick Facts + Dosage section empty');
    if (!supp.optimalDuration) report.addError('optimalDuration: missing \u2014 Dosage section incomplete');

    if (!supp.mechanismsOfAction?.length)
        report.addError('mechanismsOfAction[]: empty \u2014 Mechanisms section will be blank');

    if (!supp.primaryBenefits?.cognitive?.length && !supp.primaryBenefits?.nonCognitive?.length)
        report.addError('primaryBenefits: both cognitive and nonCognitive arrays empty \u2014 Benefits section blank');

    if (!supp.effectSizes || !Object.keys(supp.effectSizes).length)
        report.addError('effectSizes{}: empty \u2014 Effect Sizes table will not render');

    if (!supp.safetyProfile?.rating)
        report.addError('safetyProfile.rating: missing \u2014 Safety section header broken');

    // === keyCitations format check (GAP 1 fix validation) ===
    if (!supp.keyCitations?.length) {
        report.addError('keyCitations[]: empty \u2014 References section will be blank');
    } else {
        supp.keyCitations.forEach((c, i) => {
            if (typeof c === 'string') {
                report.addCritical(`keyCitations[${i}]: is a STRING ("${c}") \u2014 MUST be an object {authors, year, title, journal, doi, pmid}. seed.js cannot render string IDs.`);
            } else if (typeof c === 'object') {
                if (!c.authors) report.addError(`keyCitations[${i}].authors: missing`);
                if (!c.year)    report.addError(`keyCitations[${i}].year: missing`);
                if (!c.title)   report.addError(`keyCitations[${i}].title: missing`);
                if (!c.journal) report.addWarning(`keyCitations[${i}].journal: missing`);
                if (!c.doi)     report.addWarning(`keyCitations[${i}].doi: missing \u2014 no DOI link`);
                if (!c.pmid)    report.addWarning(`keyCitations[${i}].pmid: missing \u2014 no PubMed link`);

                // DOI format check
                if (c.doi && !String(c.doi).startsWith('10.'))
                    report.addError(`keyCitations[${i}].doi: "${c.doi}" does not start with "10." \u2014 likely malformed`);

                // PMID format check
                if (c.pmid && !/^\d+$/.test(String(c.pmid)))
                    report.addError(`keyCitations[${i}].pmid: "${c.pmid}" is not numeric \u2014 likely malformed`);
            }
        });
    }

    // === Safety sub-fields ===
    if (!supp.safetyProfile?.commonSideEffects?.length)
        report.addWarning('safetyProfile.commonSideEffects[]: empty');
    if (!supp.safetyProfile?.contraindications?.length)
        report.addWarning('safetyProfile.contraindications[]: empty');
    if (!supp.safetyProfile?.drugInteractions?.length)
        report.addWarning('safetyProfile.drugInteractions[]: empty');

    // === Commercial availability ===
    if (!supp.commercialAvailability?.forms?.length)
        report.addWarning('commercialAvailability.forms[]: empty \u2014 Quick Facts incomplete');
    if (!supp.commercialAvailability?.costRange)
        report.addWarning('commercialAvailability.costRange: missing');

    // === Enhanced citations flag ===
    if (!supp.isEnhanced) report.addWarning('isEnhanced: false \u2014 homepage may not show enhanced badge');
    if (!supp.enhancedCitations?.isEnhanced) report.addWarning('enhancedCitations.isEnhanced: false');

    // === Study populations ===
    if (!supp.studyPopulations?.length)
        report.addWarning('studyPopulations[]: empty \u2014 Overview section incomplete');

    // === Evidence tier rationale ===
    if (!supp.evidenceTierRationale)
        report.addWarning('evidenceTierRationale: missing \u2014 Overview paragraph incomplete');

    // === Common names ===
    if (!supp.commonNames?.length)
        report.addInfo('commonNames[]: empty \u2014 hero sub-heading will only show scientific name');

    // === Health domains ===
    if (!supp.healthDomains?.length)
        report.addInfo('healthDomains[]: empty \u2014 homepage filter may not include this supplement');
}

function validateEnhancedCitations(enhanced, id, report) {
    if (!enhanced) {
        report.addError('Enhanced citations file: NOT FOUND \u2014 evidence section will be completely empty');
        return;
    }

    // === lastUpdated (GAP 4 fix validation) ===
    if (!enhanced.lastUpdated)
        report.addError('lastUpdated: missing \u2014 hero "Last Updated" display will be empty');

    // === Evidence profile ===
    if (!enhanced.evidenceProfile) {
        report.addError('evidenceProfile: missing \u2014 citation count and quality score unavailable');
    } else {
        if (!enhanced.evidenceProfile.totalCitations)
            report.addWarning('evidenceProfile.totalCitations: missing');
        if (!enhanced.evidenceProfile.researchQualityScore)
            report.addWarning('evidenceProfile.researchQualityScore: missing');
        if (!enhanced.evidenceProfile.lastEvidenceUpdate)
            report.addWarning('evidenceProfile.lastEvidenceUpdate: missing');
    }

    // === Citation groups ===
    const groups = ['mechanisms', 'benefits', 'safety', 'dosage'];
    for (const group of groups) {
        const items = enhanced.citations?.[group];
        if (!items?.length) {
            if (group === 'dosage') {
                report.addWarning(`citations.${group}[]: empty (optional)`);
            } else {
                report.addError(`citations.${group}[]: empty \u2014 "${group}" evidence group will not render`);
            }
            continue;
        }

        // Validate each citation group item
        items.forEach((item, i) => {
            const prefix = `citations.${group}[${i}]`;

            // Group-specific title field
            const titleField = group === 'mechanisms' ? 'mechanism'
                : group === 'benefits' ? 'healthDomain'
                : group === 'safety' ? 'safetyAspect'
                : 'dosageRange';

            if (!item[titleField] && !item.claim)
                report.addError(`${prefix}: missing "${titleField}" or "claim" \u2014 card title will be empty`);

            if (!item.strength && !item.evidenceQuality && !item.riskLevel)
                report.addWarning(`${prefix}: no strength/evidenceQuality/riskLevel \u2014 badge may be empty`);

            if (!item.tissueTarget && !item.target)
                report.addWarning(`${prefix}: no tissueTarget or target`);

            // Evidence array
            if (!item.evidence?.length) {
                report.addError(`${prefix}.evidence[]: empty \u2014 no study cards will render`);
            } else {
                item.evidence.forEach((ev, j) => {
                    const evPrefix = `${prefix}.evidence[${j}]`;
                    validateEvidenceItem(ev, evPrefix, report);
                });
            }
        });
    }
}

function validateEvidenceItem(ev, prefix, report) {
    if (!ev.citationId)    report.addWarning(`${prefix}.citationId: missing`);
    if (!ev.title)         report.addError(`${prefix}.title: missing \u2014 study card incomplete`);
    if (!ev.year)          report.addWarning(`${prefix}.year: missing \u2014 tag will be empty`);
    if (!ev.journal)       report.addWarning(`${prefix}.journal: missing`);
    if (!ev.studyType)     report.addWarning(`${prefix}.studyType: missing \u2014 tag will be empty`);
    if (!ev.evidenceLevel) report.addWarning(`${prefix}.evidenceLevel: missing \u2014 badge may be empty`);

    // Findings (canonical) vs details (alias)
    if (!ev.findings && !ev.details)
        report.addError(`${prefix}: no "findings" or "details" \u2014 evidence prose will be empty`);

    // Identifiers
    if (!ev.doi && !ev.pmid)
        report.addError(`${prefix}: no DOI or PMID \u2014 study link will be missing`);

    if (ev.doi && !String(ev.doi).startsWith('10.'))
        report.addError(`${prefix}.doi: "${ev.doi}" malformed (should start with "10.")`);

    if (ev.pmid && !/^\d+$/.test(String(ev.pmid)))
        report.addError(`${prefix}.pmid: "${ev.pmid}" not numeric`);

    // Alias usage warnings
    if (ev.details && !ev.findings)
        report.addInfo(`${prefix}: uses "details" instead of canonical "findings"`);
    if (ev.participants && !ev.sampleSize)
        report.addInfo(`${prefix}: uses "participants" instead of canonical "sampleSize"`);
}

function validateMechanismGlossary(supp, report) {
    let mechDb;
    try {
        mechDb = require(MECH_PATH);
    } catch (e) {
        report.addInfo('mechanisms.js: could not load \u2014 skipping glossary check');
        return;
    }

    const aliasMap = mechDb.aliasMap || {};
    const missing = [];

    for (const mech of (supp.mechanismsOfAction || [])) {
        if (!aliasMap[mech]) {
            missing.push(mech);
        }
    }

    if (missing.length) {
        report.addWarning(`mechanismsOfAction: ${missing.length} not in glossary aliasMap \u2014 add before glossary rebuild`);
        missing.forEach(m => report.addInfo(`  Missing from glossary: "${m}"`));
    }
}

// ── Load enhanced citations using vm.runInNewContext (safe sandbox) ──────────

function loadEnhanced(id) {
    const files = fs.readdirSync(ENHANCED_DIR).filter(f => f.startsWith(`${id}_`));
    if (!files.length) return null;

    const filePath = path.join(ENHANCED_DIR, files[0]);
    const code = fs.readFileSync(filePath, 'utf8');

    // Create sandboxed context with window/module stubs
    const sandbox = {
        window: { enhancedCitations: {} },
        module: { exports: {} },
        exports: {}
    };

    try {
        vm.runInNewContext(code, sandbox, { filename: filePath, timeout: 5000 });
    } catch (e) {
        return { __loadError: e.message };
    }

    // Try module.exports first
    if (sandbox.module.exports && typeof sandbox.module.exports === 'object' && sandbox.module.exports.id) {
        return sandbox.module.exports;
    }

    // Try window.enhancedCitations[id]
    const ecKeys = Object.keys(sandbox.window.enhancedCitations || {});
    if (ecKeys.length) return sandbox.window.enhancedCitations[ecKeys[0]];

    // Check for direct window assignments (e.g., window.xyzEnhanced)
    for (const [k, v] of Object.entries(sandbox.window)) {
        if (k !== 'enhancedCitations' && typeof v === 'object' && v?.citations) return v;
    }

    return null;
}

// ── Validate a standalone JSON file (pre-import) ────────────────────────────

function validateFile(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const supp = data.supplement || data;
    const enhanced = data.enhanced || data.enhancedCitations || null;

    const report = new QCReport(supp.name || 'UNKNOWN', supp.id || 0);

    validateSupplementEntry(supp, report);
    if (enhanced) validateEnhancedCitations(enhanced, supp.id, report);
    validateMechanismGlossary(supp, report);

    return report;
}

// ── Validate in-database entry ──────────────────────────────────────────────

function validateById(id) {
    const db = require(SUPP_PATH);
    const supp = db.supplements.find(s => s.id === id);
    if (!supp) {
        const report = new QCReport('NOT FOUND', id);
        report.addCritical(`No supplement with ID ${id} in database`);
        return report;
    }

    const enhanced = loadEnhanced(id);
    const report = new QCReport(supp.name, supp.id);

    if (enhanced?.__loadError) {
        report.addCritical(`Enhanced file parse error: ${enhanced.__loadError}`);
        validateSupplementEntry(supp, report);
    } else {
        validateSupplementEntry(supp, report);
        validateEnhancedCitations(enhanced, id, report);
    }

    validateMechanismGlossary(supp, report);
    return report;
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function main() {
    const args = process.argv.slice(2);

    console.log('QC Validation Gate \u2014 Supplement Pipeline Quality Control');
    console.log('='.repeat(60));

    let reports = [];

    if (args.includes('--all')) {
        const db = require(SUPP_PATH);
        for (const supp of db.supplements) {
            reports.push(validateById(supp.id));
        }
    } else if (args.includes('--id')) {
        const id = parseInt(args[args.indexOf('--id') + 1]);
        reports.push(validateById(id));
    } else if (args.includes('--file')) {
        const filePath = args[args.indexOf('--file') + 1];
        reports.push(validateFile(filePath));
    } else {
        console.log('Usage:');
        console.log('  node scripts/qc-validate-supplement.js --id 94');
        console.log('  node scripts/qc-validate-supplement.js --file /path/to/data.json');
        console.log('  node scripts/qc-validate-supplement.js --all');
        process.exit(0);
    }

    // Print reports
    let totalCritical = 0, totalErrors = 0, totalWarnings = 0;
    for (const r of reports) {
        r.print();
        totalCritical += r.critical.length;
        totalErrors += r.errors.length;
        totalWarnings += r.warnings.length;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`SUMMARY: ${reports.length} supplement(s) checked`);
    console.log(`  Critical: ${totalCritical} | Errors: ${totalErrors} | Warnings: ${totalWarnings}`);

    const allSeedable = reports.every(r => r.seedable);
    const allPassed = reports.every(r => r.passed);

    if (allPassed) {
        console.log('  \u2713 ALL PASSED \u2014 safe to seed');
        process.exit(0);
    } else if (allSeedable) {
        console.log('  \u26A0 SEEDABLE with warnings/errors \u2014 review recommended');
        process.exit(2);
    } else {
        console.log('  \u2717 BLOCKED \u2014 critical issues must be fixed before seeding');
        process.exit(1);
    }
}

main();
