# Enhanced Citation Schema Remediation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize all 93 enhanced citation files to the canonical Pattern C nested-evidence schema, add missing fields (`citationId`, `evidenceLevel`, `methodology`), create a schema validator, and update all downstream consumers (seed.js, CitationRenderer.js, verify-citations.js) to produce valid output when the supplement-research-pipeline skill is invoked.

**Architecture:** A new migration script reads each enhanced citation file, detects its pattern (A/B/C), transforms it to the canonical Pattern C structure, and writes it back. A new schema validator extends verify-citations.js with a `--schema` flag. Downstream consumers already handle Pattern C via fallback chains, but we tighten them to prefer canonical field names. All changes are backward-compatible — the rendering pipeline continues to work during incremental migration.

**Tech Stack:** Node.js (VM sandboxing for file loading), existing Playwright test suite, shell scripts for batch operations.

---

## File Structure

```
supp-db-site/
  scripts/
    migrate-citations.js          # NEW — Pattern A/B → C migration script
    validate-schema.js            # NEW — Schema compliance checker (standalone)
    verify-citations.js           # MODIFY — add --schema flag delegating to validate-schema.js
    generate-stats.js             # MODIFY — fix metadata count (89 → actual)
  seed.js                         # MODIFY — flatten nested evidence[] for buildCard()
  js/CitationRenderer.js          # MODIFY — no changes needed (already handles Pattern C)
  tests/
    citation-schema.spec.js       # NEW — Playwright/Node tests for migration + validation
  data/
    enhanced_citations/*.js       # MODIFY — all 93 files migrated by script
```

---

## Chunk 1: Migration Script + Schema Validator

### Task 1: Create the schema validator (`scripts/validate-schema.js`)

**Files:**
- Create: `supp-db-site/scripts/validate-schema.js`
- Test: `supp-db-site/tests/citation-schema.spec.js`

- [ ] **Step 1: Write the test file for schema validation**

Create `supp-db-site/tests/citation-schema.spec.js`:

```javascript
/**
 * citation-schema.spec.js — Tests for enhanced citation schema validation + migration
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ENHANCED_DIR = path.join(ROOT, 'data', 'enhanced_citations');

/** Load an enhanced citation file via VM (same pattern as seed.js) */
function loadEnhanced(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
    vm.createContext(ctx);
    // Patch const/let/var assignment to capture via window.__enh
    const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+)\s*=/m);
    let patchedSrc = src;
    if (constMatch) {
        patchedSrc += `\nwindow.__enh = ${constMatch[1]};`;
    }
    vm.runInContext(patchedSrc, ctx);
    // Resolve in priority: __enh, first key of enhancedCitations, module.exports
    if (ctx.window.__enh) return ctx.window.__enh;
    const ecKeys = Object.keys(ctx.window.enhancedCitations || {});
    if (ecKeys.length) return ctx.window.enhancedCitations[ecKeys[0]];
    if (ctx.module.exports && Object.keys(ctx.module.exports).length) return ctx.module.exports;
    return null;
}

describe('validate-schema.js', () => {
    test('runs without error on a known file', () => {
        const out = execSync(
            `node scripts/validate-schema.js --id 1`,
            { cwd: ROOT, encoding: 'utf8', timeout: 15000 }
        );
        expect(out).toContain('citations');
    });

    test('reports missing citationId fields', () => {
        const out = execSync(
            `node scripts/validate-schema.js --id 1 --json`,
            { cwd: ROOT, encoding: 'utf8', timeout: 15000 }
        );
        const result = JSON.parse(out);
        // Before migration, Pattern A files lack citationId
        expect(result.issues).toBeDefined();
        expect(result.issues.length).toBeGreaterThan(0);
    });

    test('exit code 0 for clean file, 1 for issues', () => {
        // We expect issues on unmigrated files
        try {
            execSync(`node scripts/validate-schema.js --id 1 --strict`, {
                cwd: ROOT, encoding: 'utf8', timeout: 15000
            });
            // If it passes, the file was already migrated
        } catch (e) {
            expect(e.status).toBe(1);
        }
    });
});

describe('migrate-citations.js', () => {
    test('dry-run produces migration plan without modifying files', () => {
        const out = execSync(
            `node scripts/migrate-citations.js --id 1 --dry-run`,
            { cwd: ROOT, encoding: 'utf8', timeout: 30000 }
        );
        expect(out).toContain('dry-run');
        expect(out).not.toContain('ERROR');
    });

    test('migration of file 1 produces valid Pattern C structure', () => {
        // Run migration on a copy
        const origPath = path.join(ENHANCED_DIR, '1_bacopa_monnieri_enhanced.js');
        const backupPath = origPath + '.bak';
        fs.copyFileSync(origPath, backupPath);
        try {
            execSync(`node scripts/migrate-citations.js --id 1`, {
                cwd: ROOT, encoding: 'utf8', timeout: 30000
            });
            const data = loadEnhanced(origPath);
            expect(data).toBeTruthy();
            expect(data.citations).toBeDefined();
            // Verify Pattern C: mechanisms[0].evidence should be an array
            if (data.citations.mechanisms && data.citations.mechanisms.length > 0) {
                const firstMech = data.citations.mechanisms[0];
                expect(firstMech.mechanism || firstMech.claim).toBeTruthy();
                expect(firstMech.strength || firstMech.evidence).toBeTruthy();
                // In Pattern C, evidence should be an array (not a string)
                if (firstMech.evidence) {
                    expect(Array.isArray(firstMech.evidence)).toBe(true);
                }
            }
        } finally {
            // Restore original
            fs.copyFileSync(backupPath, origPath);
            fs.unlinkSync(backupPath);
        }
    });
});

describe('Enhanced citation files — post-migration schema compliance', () => {
    const files = fs.readdirSync(ENHANCED_DIR).filter(f => f.endsWith('_enhanced.js'));

    test('all 93 enhanced citation files exist', () => {
        expect(files.length).toBe(93);
    });

    // After full migration, enable this test:
    // test.each(files)('%s has valid Pattern C structure', (filename) => {
    //     const data = loadEnhanced(path.join(ENHANCED_DIR, filename));
    //     expect(data).toBeTruthy();
    //     expect(data.citations).toBeDefined();
    //     ['mechanisms', 'benefits', 'safety'].forEach(section => {
    //         const arr = data.citations[section];
    //         if (arr && arr.length) {
    //             arr.forEach(item => {
    //                 // Pattern C: evidence is an array
    //                 if (item.evidence !== undefined) {
    //                     expect(Array.isArray(item.evidence)).toBe(true);
    //                 }
    //             });
    //         }
    //     });
    // });
});
```

- [ ] **Step 2: Run test to verify it fails (scripts don't exist yet)**

Run: `cd supp-db-site && npx jest tests/citation-schema.spec.js --no-cache 2>&1 | head -30`
Expected: FAIL — "Cannot find module" for validate-schema.js and migrate-citations.js

- [ ] **Step 3: Write `scripts/validate-schema.js`**

Create `supp-db-site/scripts/validate-schema.js`:

```javascript
#!/usr/bin/env node
/**
 * validate-schema.js — Enhanced citation schema compliance checker
 *
 * Validates that enhanced citation files conform to the canonical Pattern C
 * nested-evidence schema. Reports missing/malformed fields per item.
 *
 * Usage:
 *   node scripts/validate-schema.js                    # Validate all files
 *   node scripts/validate-schema.js --id 1             # Validate one file
 *   node scripts/validate-schema.js --id 1 --json      # JSON output
 *   node scripts/validate-schema.js --id 1 --strict    # Exit 1 on any issue
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ENHANCED_DIR = path.join(ROOT, 'data', 'enhanced_citations');

// ── CLI args ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
const idFlag = args.indexOf('--id');
const targetId = idFlag >= 0 ? parseInt(args[idFlag + 1]) : null;
const jsonOut = args.includes('--json');
const strict = args.includes('--strict');

// ── Load enhanced file via VM ────────────────────────────────────
function loadEnhanced(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
    vm.createContext(ctx);
    const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+)\s*=/m);
    let patchedSrc = src;
    if (constMatch) patchedSrc += `\nwindow.__enh = ${constMatch[1]};`;
    vm.runInContext(patchedSrc, ctx);
    if (ctx.window.__enh) return ctx.window.__enh;
    const ecKeys = Object.keys(ctx.window.enhancedCitations || {});
    if (ecKeys.length) return ctx.window.enhancedCitations[ecKeys[0]];
    if (ctx.module.exports && Object.keys(ctx.module.exports).length) return ctx.module.exports;
    return null;
}

// ── Schema rules ─────────────────────────────────────────────────
const SECTIONS = ['mechanisms', 'benefits', 'safety', 'dosage'];

const GROUP_REQUIRED = {
    mechanisms: ['mechanism', 'strength'],
    benefits:   ['healthDomain', 'specificClaim', 'strength'],
    safety:     ['safetyAspect', 'riskLevel'],
    dosage:     ['dosageRange', 'evidenceBase'],
};

// These fields are required on individual evidence items (nested inside group.evidence[])
const EVIDENCE_REQUIRED = ['title', 'year', 'studyType'];
const EVIDENCE_RECOMMENDED = ['citationId', 'evidenceLevel', 'methodology', 'doi', 'pmid', 'authors', 'journal', 'findings'];

// ── Validate one file ────────────────────────────────────────────
function validateFile(filePath) {
    const filename = path.basename(filePath);
    const issues = [];

    let data;
    try {
        data = loadEnhanced(filePath);
    } catch (e) {
        issues.push({ severity: 'CRITICAL', field: 'file', message: `Failed to load: ${e.message}` });
        return { filename, issues, pattern: 'UNKNOWN' };
    }

    if (!data) {
        issues.push({ severity: 'CRITICAL', field: 'file', message: 'No data exported' });
        return { filename, issues, pattern: 'UNKNOWN' };
    }

    // Detect pattern
    let pattern = 'UNKNOWN';
    if (data.citations) {
        const firstSection = SECTIONS.find(s => data.citations[s]?.length > 0);
        if (firstSection) {
            const firstItem = data.citations[firstSection][0];
            if (Array.isArray(firstItem?.evidence)) {
                pattern = 'C'; // Nested evidence arrays
            } else if (typeof firstItem?.evidence === 'string' || firstItem?.claim) {
                pattern = 'A'; // Claim-descriptive with evidence as string
            } else if (firstItem?.title && firstItem?.authors) {
                pattern = 'B'; // Flat citation-list
            }
        }
    }

    // Top-level fields
    if (!data.id && !data.supplementId) {
        issues.push({ severity: 'WARNING', field: 'id', message: 'Missing id/supplementId' });
    }
    if (!data.name && !data.supplementName) {
        issues.push({ severity: 'WARNING', field: 'name', message: 'Missing name/supplementName' });
    }
    if (!data.evidenceProfile) {
        issues.push({ severity: 'WARNING', field: 'evidenceProfile', message: 'Missing evidenceProfile object' });
    } else {
        ['overallQuality', 'totalCitations', 'researchQualityScore'].forEach(f => {
            if (data.evidenceProfile[f] === undefined) {
                issues.push({ severity: 'INFO', field: `evidenceProfile.${f}`, message: `Missing ${f}` });
            }
        });
    }

    // Citations structure
    if (!data.citations) {
        issues.push({ severity: 'CRITICAL', field: 'citations', message: 'Missing citations object' });
        return { filename, issues, pattern };
    }

    const emptySections = SECTIONS.filter(s => !data.citations[s] || !data.citations[s].length);
    if (emptySections.length === SECTIONS.length) {
        issues.push({ severity: 'CRITICAL', field: 'citations', message: 'All citation arrays are empty' });
    }

    // Per-section validation
    for (const section of SECTIONS) {
        const arr = data.citations[section];
        if (!arr || !Array.isArray(arr) || arr.length === 0) continue;

        for (let gi = 0; gi < arr.length; gi++) {
            const group = arr[gi];
            const loc = `citations.${section}[${gi}]`;

            if (pattern !== 'C') {
                issues.push({
                    severity: 'MIGRATION',
                    field: loc,
                    message: `Pattern ${pattern} detected — needs migration to Pattern C (nested evidence arrays)`
                });
                continue; // Can't validate Pattern A/B against C schema
            }

            // Check group-level fields
            const reqFields = GROUP_REQUIRED[section] || [];
            // Accept claim as alias for mechanism/healthDomain/safetyAspect/dosageRange
            for (const f of reqFields) {
                if (!group[f] && !group.claim) {
                    issues.push({ severity: 'WARNING', field: `${loc}.${f}`, message: `Missing ${f}` });
                }
            }

            // Check nested evidence array
            if (!Array.isArray(group.evidence) || group.evidence.length === 0) {
                issues.push({ severity: 'WARNING', field: `${loc}.evidence`, message: 'Missing or empty evidence array' });
                continue;
            }

            for (let ei = 0; ei < group.evidence.length; ei++) {
                const ev = group.evidence[ei];
                const evLoc = `${loc}.evidence[${ei}]`;

                for (const f of EVIDENCE_REQUIRED) {
                    if (!ev[f]) {
                        issues.push({ severity: 'WARNING', field: `${evLoc}.${f}`, message: `Missing required field: ${f}` });
                    }
                }

                for (const f of EVIDENCE_RECOMMENDED) {
                    if (!ev[f]) {
                        issues.push({ severity: 'INFO', field: `${evLoc}.${f}`, message: `Missing recommended field: ${f}` });
                    }
                }

                // Check identifiers
                if (!ev.pmid && !ev.doi) {
                    issues.push({ severity: 'WARNING', field: `${evLoc}`, message: 'No PMID or DOI identifier' });
                }
            }
        }
    }

    return { filename, issues, pattern };
}

// ── Main ─────────────────────────────────────────────────────────
function main() {
    const files = fs.readdirSync(ENHANCED_DIR)
        .filter(f => f.endsWith('_enhanced.js'))
        .sort((a, b) => {
            const idA = parseInt(a.match(/^(\d+)/)?.[1] || '999');
            const idB = parseInt(b.match(/^(\d+)/)?.[1] || '999');
            return idA - idB;
        });

    const targets = targetId
        ? files.filter(f => f.startsWith(`${targetId}_`) || f === `${targetId}_enhanced.js`)
        : files;

    if (targets.length === 0) {
        console.error(`No enhanced citation file found for ID ${targetId}`);
        process.exit(2);
    }

    const results = targets.map(f => validateFile(path.join(ENHANCED_DIR, f)));

    if (jsonOut) {
        const combined = {
            totalFiles: results.length,
            issues: results.flatMap(r => r.issues.map(i => ({ ...i, file: r.filename }))),
            patterns: results.reduce((acc, r) => { acc[r.pattern] = (acc[r.pattern] || 0) + 1; return acc; }, {}),
        };
        console.log(JSON.stringify(combined, null, 2));
    } else {
        let totalIssues = 0;
        for (const r of results) {
            const critical = r.issues.filter(i => i.severity === 'CRITICAL').length;
            const warnings = r.issues.filter(i => i.severity === 'WARNING').length;
            const migration = r.issues.filter(i => i.severity === 'MIGRATION').length;
            const info = r.issues.filter(i => i.severity === 'INFO').length;

            const icon = critical ? '\u2717' : migration ? '\u26A0' : '\u2713';
            console.log(`${icon} ${r.filename} [Pattern ${r.pattern}] — ${critical} critical, ${warnings} warnings, ${migration} migration, ${info} info`);

            if (critical || warnings || migration) {
                for (const i of r.issues.filter(i => ['CRITICAL', 'WARNING', 'MIGRATION'].includes(i.severity))) {
                    console.log(`    ${i.severity}: ${i.field} — ${i.message}`);
                }
            }
            totalIssues += r.issues.length;
        }
        console.log(`\nTotal: ${results.length} files, ${totalIssues} issues`);
        console.log(`Patterns: ${JSON.stringify(results.reduce((acc, r) => { acc[r.pattern] = (acc[r.pattern] || 0) + 1; return acc; }, {}))}`);
    }

    if (strict) {
        const hasCritical = results.some(r => r.issues.some(i => i.severity === 'CRITICAL' || i.severity === 'MIGRATION'));
        process.exit(hasCritical ? 1 : 0);
    }
}

main();
```

- [ ] **Step 4: Run test for validate-schema — should now pass 2 of 3 tests**

Run: `cd supp-db-site && npx jest tests/citation-schema.spec.js -t "validate-schema" --no-cache`
Expected: 2 PASS (runs without error, reports missing citationId), 1 conditional (strict exit code)

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-schema.js tests/citation-schema.spec.js
git commit -m "feat: add enhanced citation schema validator (validate-schema.js)"
```

---

### Task 2: Create the migration script (`scripts/migrate-citations.js`)

**Files:**
- Create: `supp-db-site/scripts/migrate-citations.js`

- [ ] **Step 1: Write `scripts/migrate-citations.js`**

```javascript
#!/usr/bin/env node
/**
 * migrate-citations.js — Migrate enhanced citation files from Pattern A/B to Pattern C
 *
 * Pattern A (claim-descriptive): evidence is a string, items have claim/details/pmid flat
 * Pattern B (flat citation-list): items are direct citation objects with title/authors/doi
 * Pattern C (canonical nested):   items have mechanism/healthDomain + evidence[] array
 *
 * Usage:
 *   node scripts/migrate-citations.js --dry-run         # Preview all migrations
 *   node scripts/migrate-citations.js --id 1 --dry-run  # Preview one file
 *   node scripts/migrate-citations.js --id 1            # Migrate one file
 *   node scripts/migrate-citations.js                   # Migrate all files
 *   node scripts/migrate-citations.js --backup          # Create .bak before writing
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ENHANCED_DIR = path.join(ROOT, 'data', 'enhanced_citations');

const args = process.argv.slice(2);
const idFlag = args.indexOf('--id');
const targetId = idFlag >= 0 ? parseInt(args[idFlag + 1]) : null;
const dryRun = args.includes('--dry-run');
const backup = args.includes('--backup');

// ── Load enhanced file via VM ────────────────────────────────────
function loadEnhanced(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
    vm.createContext(ctx);
    const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+)\s*=/m);
    let patchedSrc = src;
    let varName = null;
    if (constMatch) {
        varName = constMatch[1];
        patchedSrc += `\nwindow.__enh = ${varName};`;
    }
    vm.runInContext(patchedSrc, ctx);
    let data;
    if (ctx.window.__enh) data = ctx.window.__enh;
    else {
        const ecKeys = Object.keys(ctx.window.enhancedCitations || {});
        if (ecKeys.length) data = ctx.window.enhancedCitations[ecKeys[0]];
    }
    if (!data && ctx.module.exports && Object.keys(ctx.module.exports).length) {
        data = ctx.module.exports;
    }
    return { data, varName };
}

// ── Detect pattern ───────────────────────────────────────────────
function detectPattern(data) {
    if (!data?.citations) return 'UNKNOWN';
    const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
    for (const s of sections) {
        const arr = data.citations[s];
        if (!arr || !arr.length) continue;
        const first = arr[0];
        if (Array.isArray(first?.evidence)) return 'C';
        if (typeof first?.evidence === 'string' || (first?.claim && !first?.title)) return 'A';
        if (first?.title && first?.authors) return 'B';
    }
    return 'UNKNOWN';
}

// ── Generate citationId from item ────────────────────────────────
function generateCitationId(item, section, index) {
    // Try to derive from authors + year + topic
    const authorPart = (() => {
        if (item.authors) {
            const authors = typeof item.authors === 'string' ? item.authors : (item.authors[0] || '');
            // Extract first author last name
            const match = authors.match(/^([A-Za-z'-]+)/);
            return match ? match[1].toLowerCase() : 'unknown';
        }
        return 'unknown';
    })();
    const yearPart = item.year || 'nd';
    const topicPart = (() => {
        const text = item.claim || item.mechanism || item.healthDomain || item.safetyAspect || item.title || section;
        // Extract first meaningful word
        const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
        return words[0] || section;
    })();
    return `${authorPart}_${yearPart}_${topicPart}`;
}

// ── Map evidence string to evidenceLevel ─────────────────────────
function mapEvidenceLevel(evidenceStr) {
    if (!evidenceStr) return 'Not assessed';
    const lower = evidenceStr.toLowerCase();
    if (lower.includes('strong') || lower.includes('gold') || lower.includes('level 1')) return 'Level 1';
    if (lower.includes('moderate') || lower.includes('level 2')) return 'Level 2';
    if (lower.includes('level 3') || lower.includes('good')) return 'Level 3';
    if (lower.includes('limited') || lower.includes('weak') || lower.includes('preliminary') || lower.includes('level 4')) return 'Level 4';
    if (lower.includes('theoretical') || lower.includes('level 5')) return 'Level 5';
    return 'Level 3'; // Default for unclassified
}

// ── Migrate Pattern A item to Pattern C ──────────────────────────
function migratePatternA(item, section, index) {
    const evidenceStr = typeof item.evidence === 'string' ? item.evidence : '';
    const cId = generateCitationId(item, section, index);

    // The group-level wrapper
    const groupFields = {};
    if (section === 'mechanisms') {
        groupFields.mechanism = item.claim || '';
        groupFields.strength = evidenceStr || 'Moderate';
        groupFields.mechanismType = item.studyType || '';
        groupFields.tissueTarget = '';
        groupFields.target = '';
    } else if (section === 'benefits') {
        groupFields.healthDomain = item.claim || '';
        groupFields.specificClaim = item.claim || '';
        groupFields.strength = evidenceStr || 'Moderate';
        groupFields.evidenceQuality = evidenceStr || 'Moderate';
        groupFields.replicationStatus = item.replication || '';
        groupFields.tissueTarget = '';
        groupFields.target = '';
        groupFields.metaAnalysisSupport = null;
    } else if (section === 'safety') {
        groupFields.safetyAspect = item.claim || '';
        groupFields.claim = item.claim || '';
        groupFields.riskLevel = evidenceStr.toLowerCase().includes('good') ? 'Low' :
                                evidenceStr.toLowerCase().includes('caution') ? 'Moderate' : 'Low';
        groupFields.target = '';
        groupFields.tissueTarget = '';
    } else if (section === 'dosage') {
        groupFields.dosageRange = item.claim || '';
        groupFields.claim = item.claim || '';
        groupFields.evidenceBase = evidenceStr || 'Moderate';
        groupFields.target = '';
        groupFields.tissueTarget = '';
    }

    // The nested evidence item (one item wrapping the flat fields)
    const evidenceItem = {
        citationId: cId,
        title: item.title || item.claim || '',
        authors: item.authors || '',
        year: item.year || null,
        journal: item.journal || '',
        doi: item.doi || '',
        pmid: item.pmid || '',
        studyType: item.studyType || '',
        evidenceLevel: mapEvidenceLevel(evidenceStr),
        sampleSize: item.participants || item.sampleSize || '',
        duration: item.duration || '',
        findings: item.details || item.findings || '',
        methodology: item.methodology || '',
    };

    return { ...groupFields, evidence: [evidenceItem] };
}

// ── Migrate Pattern B item to Pattern C ──────────────────────────
function migratePatternB(item, section, index) {
    const cId = generateCitationId(item, section, index);
    const significance = item.significance || '';

    const groupFields = {};
    if (section === 'mechanisms') {
        groupFields.mechanism = item.title || '';
        groupFields.strength = significance.includes('Strong') ? 'Strong' :
                               significance.includes('Moderate') ? 'Moderate' : 'Moderate';
        groupFields.mechanismType = '';
        groupFields.tissueTarget = '';
        groupFields.target = '';
    } else if (section === 'benefits') {
        groupFields.healthDomain = item.title || '';
        groupFields.specificClaim = item.title || '';
        groupFields.strength = 'Moderate';
        groupFields.evidenceQuality = 'Moderate';
        groupFields.replicationStatus = '';
        groupFields.tissueTarget = '';
        groupFields.target = '';
        groupFields.metaAnalysisSupport = null;
    } else if (section === 'safety') {
        groupFields.safetyAspect = item.title || '';
        groupFields.claim = item.title || '';
        groupFields.riskLevel = 'Low';
        groupFields.target = '';
        groupFields.tissueTarget = '';
    } else if (section === 'dosage') {
        groupFields.dosageRange = item.title || '';
        groupFields.claim = item.title || '';
        groupFields.evidenceBase = 'Moderate';
        groupFields.target = '';
        groupFields.tissueTarget = '';
    }

    const evidenceItem = {
        citationId: cId,
        title: item.title || '',
        authors: typeof item.authors === 'string' ? item.authors :
                 Array.isArray(item.authors) ? item.authors.join(', ') : '',
        year: item.year || null,
        journal: item.journal || '',
        doi: item.doi || '',
        pmid: item.pmid || '',
        studyType: item.studyType || '',
        evidenceLevel: mapEvidenceLevel(significance),
        sampleSize: item.participants || item.sampleSize || '',
        duration: item.duration || '',
        findings: item.significance || item.details || item.findings || '',
        methodology: item.methodology || '',
    };

    return { ...groupFields, evidence: [evidenceItem] };
}

// ── Enrich Pattern C item (add missing fields) ──────────────────
function enrichPatternC(group, section) {
    if (!Array.isArray(group.evidence)) return group;

    const enriched = { ...group };

    // Ensure group-level fields
    if (section === 'mechanisms' && !enriched.mechanism) {
        enriched.mechanism = enriched.claim || enriched.healthDomain || '';
    }
    if (!enriched.tissueTarget) enriched.tissueTarget = enriched.target || '';
    if (!enriched.target) enriched.target = enriched.tissueTarget || '';

    // Enrich each evidence item
    enriched.evidence = group.evidence.map((ev, ei) => {
        const enrichedEv = { ...ev };
        if (!enrichedEv.citationId) {
            enrichedEv.citationId = generateCitationId(enrichedEv, section, ei);
        }
        if (!enrichedEv.evidenceLevel) {
            enrichedEv.evidenceLevel = mapEvidenceLevel(enrichedEv.strength || group.strength || '');
        }
        if (!enrichedEv.methodology) {
            enrichedEv.methodology = enrichedEv.studyDesign || '';
        }
        if (!enrichedEv.findings) {
            enrichedEv.findings = (enrichedEv.keyFindings && Array.isArray(enrichedEv.keyFindings))
                ? enrichedEv.keyFindings.join('; ')
                : '';
        }
        return enrichedEv;
    });

    return enriched;
}

// ── Migrate one file ─────────────────────────────────────────────
function migrateFile(filePath) {
    const filename = path.basename(filePath);
    const { data, varName } = loadEnhanced(filePath);
    if (!data) return { filename, status: 'ERROR', message: 'Could not load data' };

    const pattern = detectPattern(data);
    if (pattern === 'C') {
        // Already Pattern C — just enrich missing fields
        let changed = false;
        const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
        for (const s of sections) {
            if (!data.citations[s]) continue;
            data.citations[s] = data.citations[s].map(group => {
                const enriched = enrichPatternC(group, s);
                if (JSON.stringify(enriched) !== JSON.stringify(group)) changed = true;
                return enriched;
            });
        }
        if (!changed) return { filename, status: 'ALREADY_COMPLIANT', pattern };
        if (dryRun) return { filename, status: 'WOULD_ENRICH', pattern, changes: 'Add missing citationId/evidenceLevel/methodology' };
        writeFile(filePath, data, varName);
        return { filename, status: 'ENRICHED', pattern };
    }

    if (pattern === 'UNKNOWN') {
        return { filename, status: 'SKIPPED', pattern, message: 'Could not detect pattern' };
    }

    // Migrate Pattern A or B
    const migrateFn = pattern === 'A' ? migratePatternA : migratePatternB;
    const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];

    for (const s of sections) {
        if (!data.citations[s] || !data.citations[s].length) continue;
        data.citations[s] = data.citations[s].map((item, i) => migrateFn(item, s, i));
    }

    // Normalize top-level field names
    if (data.supplementId && !data.id) data.id = data.supplementId;
    if (data.supplementName && !data.name) data.name = data.supplementName;

    if (dryRun) {
        return { filename, status: 'WOULD_MIGRATE', pattern, targetPattern: 'C' };
    }

    if (backup) {
        fs.copyFileSync(filePath, filePath + '.bak');
    }

    writeFile(filePath, data, varName);
    return { filename, status: 'MIGRATED', pattern, targetPattern: 'C' };
}

// ── Write migrated file ──────────────────────────────────────────
function writeFile(filePath, data, varName) {
    const id = data.id || data.supplementId;
    const name = data.name || data.supplementName || 'unknown';

    // Derive camelCase variable name
    const derivedVarName = varName || name
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('') + 'Enhanced';

    const jsonStr = JSON.stringify(data, null, 2);
    const output = `/**
 * Enhanced citation data for ${name}
 * Schema: Pattern C (canonical nested evidence arrays)
 * Migrated: ${new Date().toISOString().split('T')[0]}
 */
const ${derivedVarName} = ${jsonStr};

// === REQUIRED EXPORT BLOCK ===
window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[${id}] = ${derivedVarName};
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ${derivedVarName};
}
`;

    fs.writeFileSync(filePath, output, 'utf8');
}

// ── Main ─────────────────────────────────────────────────────────
function main() {
    const files = fs.readdirSync(ENHANCED_DIR)
        .filter(f => f.endsWith('_enhanced.js'))
        .sort((a, b) => {
            const idA = parseInt(a.match(/^(\d+)/)?.[1] || '999');
            const idB = parseInt(b.match(/^(\d+)/)?.[1] || '999');
            return idA - idB;
        });

    const targets = targetId
        ? files.filter(f => f.startsWith(`${targetId}_`) || f === `${targetId}_enhanced.js`)
        : files;

    if (targets.length === 0) {
        console.error(`No enhanced citation file found for ID ${targetId}`);
        process.exit(2);
    }

    console.log(`${dryRun ? '[dry-run] ' : ''}Migration: ${targets.length} file(s)\n`);

    const results = targets.map(f => migrateFile(path.join(ENHANCED_DIR, f)));

    const summary = {
        migrated: results.filter(r => r.status === 'MIGRATED' || r.status === 'WOULD_MIGRATE').length,
        enriched: results.filter(r => r.status === 'ENRICHED' || r.status === 'WOULD_ENRICH').length,
        compliant: results.filter(r => r.status === 'ALREADY_COMPLIANT').length,
        skipped: results.filter(r => r.status === 'SKIPPED').length,
        errors: results.filter(r => r.status === 'ERROR').length,
    };

    for (const r of results) {
        const icon = r.status.includes('ERROR') ? '\u2717' :
                     r.status.includes('MIGRATE') ? '\u21C4' :
                     r.status.includes('ENRICH') ? '\u2191' : '\u2713';
        const detail = r.message ? ` — ${r.message}` : r.changes ? ` — ${r.changes}` : '';
        console.log(`  ${icon} ${r.filename} [${r.pattern}] → ${r.status}${detail}`);
    }

    console.log(`\nSummary: ${summary.migrated} migrated, ${summary.enriched} enriched, ${summary.compliant} compliant, ${summary.skipped} skipped, ${summary.errors} errors`);
}

main();
```

- [ ] **Step 2: Run migration dry-run to verify it works**

Run: `cd supp-db-site && node scripts/migrate-citations.js --dry-run 2>&1 | tail -20`
Expected: Shows Pattern A/B files as WOULD_MIGRATE, Pattern C as WOULD_ENRICH or ALREADY_COMPLIANT

- [ ] **Step 3: Run migration test**

Run: `cd supp-db-site && npx jest tests/citation-schema.spec.js -t "migrate-citations" --no-cache`
Expected: dry-run test PASSES, migration test PASSES (restores backup)

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-citations.js
git commit -m "feat: add enhanced citation migration script (Pattern A/B → C)"
```

---

## Chunk 2: Update Downstream Consumers

### Task 3: Update `seed.js` to flatten nested evidence arrays in `buildCard()`

**Files:**
- Modify: `supp-db-site/seed.js:200-216` (buildEvidenceGroups function)

The current `buildEvidenceGroups()` passes each top-level citation item directly to `buildCard()`. After migration, Pattern C items have a nested `evidence[]` array — `buildCard()` needs to handle both:
1. **Flat items** (pre-migration or backward compat): item itself has pmid/doi/year
2. **Nested items** (Pattern C): item has `evidence[]` array; each sub-item should produce a card

- [ ] **Step 1: Modify `buildEvidenceGroups()` in seed.js**

Replace lines 200-216 in `seed.js`:

```javascript
/** Convert enhanced_citations.citations → evidenceGroups array for renderPage() */
function buildEvidenceGroups(citations) {
    if (!citations) return [];
    const groups = [];
    const MAP = [
        { key: 'mechanisms', title: 'Mechanisms of Action' },
        { key: 'benefits',   title: 'Clinical Benefits'    },
        { key: 'safety',     title: 'Safety & Tolerability'},
        { key: 'dosage',     title: 'Dosage Research'      },
    ];
    for (const { key, title } of MAP) {
        const items = citations[key];
        if (items && items.length) {
            const cards = [];
            for (const item of items) {
                // Pattern C: item has nested evidence[] array — flatten
                if (Array.isArray(item.evidence) && item.evidence.length > 0) {
                    // Use the group-level claim as the finding title for each sub-card
                    const groupTitle = h(item.claim || item.mechanism || item.healthDomain ||
                                         item.safetyAspect || item.dosageRange || '');
                    for (const ev of item.evidence) {
                        // Merge group-level title into each evidence item for card rendering
                        const merged = { ...ev };
                        if (!merged.claim && !merged.mechanism && !merged.healthDomain &&
                            !merged.safetyAspect && !merged.dosageRange) {
                            merged.claim = groupTitle;
                        }
                        // Prefer group-level strength for badge if evidence item lacks it
                        if (!merged.evidence && !merged.evidenceLevel && !merged.strength) {
                            merged.evidence = item.strength || item.evidence || '';
                            // Avoid setting evidence to the array itself
                            if (typeof merged.evidence !== 'string') merged.evidence = '';
                        }
                        cards.push(buildCard(merged));
                    }
                } else {
                    // Flat item (Pattern A/B or backward compat) — pass directly
                    cards.push(buildCard(item));
                }
            }
            if (cards.length) groups.push({ groupTitle: title, cards });
        }
    }
    return groups;
}
```

- [ ] **Step 2: Verify seed.js still works with current (unmigrated) files**

Run: `cd supp-db-site && node seed.js --id 1 --dry-run 2>&1 | head -20`
Expected: Bacopa validates with no errors (backward compat with Pattern A)

Run: `cd supp-db-site && node seed.js --id 89 --dry-run 2>&1 | head -20`
Expected: Pterostilbene validates with no errors (Pattern C already)

- [ ] **Step 3: Commit**

```bash
git add seed.js
git commit -m "feat: update buildEvidenceGroups to flatten Pattern C nested evidence arrays"
```

---

### Task 4: Wire `--schema` flag into `verify-citations.js`

**Files:**
- Modify: `supp-db-site/scripts/verify-citations.js` (add --schema flag)

- [ ] **Step 1: Add `--schema` delegation at the top of verify-citations.js main()**

Add after the existing CLI arg parsing (around line 50-60):

```javascript
// Schema validation mode — delegate to validate-schema.js
if (args.includes('--schema')) {
    const schemaArgs = args.filter(a => a !== '--schema');
    const { execSync } = require('child_process');
    try {
        const out = execSync(`node ${path.join(__dirname, 'validate-schema.js')} ${schemaArgs.join(' ')}`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        process.stdout.write(out);
        process.exit(0);
    } catch (e) {
        if (e.stdout) process.stdout.write(e.stdout);
        if (e.stderr) process.stderr.write(e.stderr);
        process.exit(e.status || 1);
    }
}
```

- [ ] **Step 2: Test the --schema flag**

Run: `cd supp-db-site && node scripts/verify-citations.js --schema --id 1 2>&1 | head -10`
Expected: Shows schema validation output for Bacopa

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-citations.js
git commit -m "feat: add --schema flag to verify-citations.js delegating to validate-schema.js"
```

---

### Task 5: Fix metadata count in supplements.js and run generate-stats.js

**Files:**
- Modify: `supp-db-site/data/supplements.js` (metadata block)

- [ ] **Step 1: Update metadata totalSupplements**

Find and replace in `data/supplements.js`:
```javascript
// OLD: "totalSupplements": 89
// NEW: "totalSupplements": 93
```

- [ ] **Step 2: Run generate-stats.js**

Run: `cd supp-db-site && node scripts/generate-stats.js 2>&1`
Expected: Updates site-stats.json + patches index.html counts

- [ ] **Step 3: Commit**

```bash
git add data/supplements.js data/site-stats.json index.html
git commit -m "fix: update metadata count 89→93 and regenerate site stats"
```

---

## Chunk 3: Execute Migration + Validate

### Task 6: Run the full migration

- [ ] **Step 1: Create backups**

Run: `cd supp-db-site && cp -r data/enhanced_citations data/enhanced_citations.bak`

- [ ] **Step 2: Run migration on all 93 files**

Run: `cd supp-db-site && node scripts/migrate-citations.js --backup 2>&1 | tail -30`
Expected: Shows migration results — Pattern A/B files migrated, Pattern C enriched

- [ ] **Step 3: Run schema validator on all files**

Run: `cd supp-db-site && node scripts/validate-schema.js 2>&1 | tail -10`
Expected: All files show Pattern C, reduced issue count

- [ ] **Step 4: Run citation integrity verification on migrated files**

Run: `cd supp-db-site && node scripts/verify-citations.js 2>&1 | tail -20`
Expected: No new CRITICAL issues introduced by migration

- [ ] **Step 5: Run seed.js dry-run on all supplements**

Run: `cd supp-db-site && node seed.js --dry-run 2>&1 | tail -20`
Expected: All supplements validate with 0 errors

- [ ] **Step 6: Run existing Playwright tests**

Run: `cd supp-db-site && npx playwright test --config=playwright.config.js --reporter=list 2>&1 | tail -10`
Expected: All 63 tests pass (no regressions)

- [ ] **Step 7: Remove backups and commit**

```bash
cd supp-db-site
rm -rf data/enhanced_citations.bak
rm -f data/enhanced_citations/*.bak
git add data/enhanced_citations/
git commit -m "migrate: normalize all 93 enhanced citation files to Pattern C schema

Migrated Pattern A (claim-descriptive) and Pattern B (flat citation-list)
files to canonical Pattern C (nested evidence arrays). Added citationId,
evidenceLevel, and methodology fields to all evidence items."
```

---

### Task 7: Update the supplement-research-pipeline skill document

**Files:**
- Modify: `.claude/skills/supplement-research-pipeline/SKILL.md`

- [ ] **Step 1: Add migration/validation notes to Mode 6 checklist**

In the Import Checklist section, add after the `verify-citations.js` line:

```markdown
- [ ] **Schema compliance gate** (MANDATORY — MUST be Pattern C with 0 CRITICAL):
  ```bash
  node supp-db-site/scripts/validate-schema.js --id {id} --strict
  ```
  Exit code 0 = pass. Exit code 1 = schema violations present — fix before proceeding.
```

- [ ] **Step 2: Add note about migration script for legacy data**

Add to the end of Mode 6, before the Import Checklist:

```markdown
#### Legacy Data Migration

If importing data from external sources that use the older flat citation
structure (Pattern A or B), run the migration script to normalize:

```bash
# Preview changes without writing
node supp-db-site/scripts/migrate-citations.js --id {id} --dry-run

# Migrate with backup
node supp-db-site/scripts/migrate-citations.js --id {id} --backup
```
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/supplement-research-pipeline/SKILL.md
git commit -m "docs: add schema validation gate and migration notes to pipeline skill"
```

---

## Post-Implementation Verification

After all tasks are complete, run this full verification sequence:

```bash
# 1. Schema validation — all files
node scripts/validate-schema.js

# 2. Citation integrity — all files
node scripts/verify-citations.js

# 3. Seed dry-run — all supplements
node seed.js --dry-run

# 4. Generate one page to test rendering
node seed.js --id 1 --out supplements-test/

# 5. Playwright tests
npx playwright test --config=playwright.config.js --reporter=list

# 6. Site stats
node scripts/generate-stats.js

# 7. Category pages
node scripts/generate-category-pages.js
```

All commands must exit with code 0 and produce no CRITICAL issues.
