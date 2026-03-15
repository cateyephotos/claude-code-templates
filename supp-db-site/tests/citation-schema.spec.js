// @ts-check
const { test, expect } = require('playwright/test');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ENHANCED_DIR = path.join(ROOT, 'data', 'enhanced_citations');

/**
 * Citation Schema Validation Tests
 *
 * Verifies that:
 * 1. All enhanced citation files load without errors
 * 2. No Pattern A (string evidence) files remain
 * 3. seed.js produces valid HTML for all supplements
 * 4. validate-schema.js and migrate-citations.js run without crashes
 * 5. verify-citations.js --schema flag delegates correctly
 * 6. supplements.js metadata is accurate
 */

// Helper: load an enhanced citation file using VM sandbox
function loadEnhancedFile(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
    vm.createContext(ctx);
    const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+)\s*=/m);
    let patchedSrc = src;
    if (constMatch) patchedSrc = src + `\ntry { window.__top = ${constMatch[1]}; } catch(e) {}`;
    try { vm.runInContext(patchedSrc, ctx); } catch (e) { return null; }
    if (ctx.window.__top) return ctx.window.__top;
    const keys = Object.keys(ctx.window.enhancedCitations);
    if (keys.length > 0) return ctx.window.enhancedCitations[keys[0]];
    return null;
}

// Get all enhanced citation files (multiple naming patterns)
function getEnhancedFiles() {
    return fs.readdirSync(ENHANCED_DIR)
        .filter(f => f.match(/^\d+.*_enhanced\.js$/) && !f.endsWith('.bak'))
        .sort((a, b) => parseInt(a) - parseInt(b));
}

test.describe('Citation Schema Compliance', () => {

    test('all enhanced citation files exist and load without errors', () => {
        const files = getEnhancedFiles();
        expect(files.length).toBeGreaterThanOrEqual(93);

        const failures = [];
        for (const f of files) {
            const data = loadEnhancedFile(path.join(ENHANCED_DIR, f));
            if (!data) failures.push(f);
        }
        expect(failures).toEqual([]);
    });

    test('no Pattern A files remain (evidence as string is eliminated)', () => {
        const files = getEnhancedFiles();
        const patternA = [];

        for (const f of files) {
            const data = loadEnhancedFile(path.join(ENHANCED_DIR, f));
            if (!data || !data.citations) continue;

            const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
            for (const section of sections) {
                const arr = data.citations[section];
                if (!Array.isArray(arr) || arr.length === 0) continue;

                for (const item of arr) {
                    if (!item || typeof item !== 'object') continue;
                    // Pattern A: evidence is a descriptive string, not an array
                    if (typeof item.evidence === 'string' && item.claim) {
                        patternA.push(`${f}: ${section} has Pattern A (evidence="${item.evidence}")`);
                        break;
                    }
                }
            }
        }

        expect(patternA).toEqual([]);
    });

    test('most citation groups use nested evidence arrays', () => {
        const files = getEnhancedFiles();
        let totalGroups = 0;
        let nestedGroups = 0;

        for (const f of files) {
            const data = loadEnhancedFile(path.join(ENHANCED_DIR, f));
            if (!data || !data.citations) continue;

            const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
            for (const section of sections) {
                const arr = data.citations[section];
                if (!Array.isArray(arr)) continue;
                for (const item of arr) {
                    if (!item || typeof item !== 'object') continue;
                    totalGroups++;
                    if (Array.isArray(item.evidence) || Array.isArray(item.studies)) {
                        nestedGroups++;
                    }
                }
            }
        }

        // At least 80% of citation groups should use nested evidence arrays
        const ratio = nestedGroups / totalGroups;
        console.log(`Nested evidence groups: ${nestedGroups}/${totalGroups} (${(ratio * 100).toFixed(1)}%)`);
        expect(ratio).toBeGreaterThan(0.80);
    });

    test('all files have evidenceProfile object', () => {
        const files = getEnhancedFiles();
        const noProfile = [];

        for (const f of files) {
            const data = loadEnhancedFile(path.join(ENHANCED_DIR, f));
            if (!data) continue;
            if (!data.evidenceProfile) {
                noProfile.push(f);
            }
        }
        expect(noProfile).toEqual([]);
    });

    test('all files have citations object with content', () => {
        const files = getEnhancedFiles();
        const empty = [];

        for (const f of files) {
            const data = loadEnhancedFile(path.join(ENHANCED_DIR, f));
            if (!data || !data.citations) {
                empty.push(`${f}: no citations object`);
                continue;
            }
            const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
            const hasContent = sections.some(s =>
                Array.isArray(data.citations[s]) && data.citations[s].length > 0
            );
            if (!hasContent) {
                empty.push(`${f}: all citation sections empty`);
            }
        }
        expect(empty).toEqual([]);
    });
});

test.describe('Downstream Consumers', () => {

    test('seed.js dry-run succeeds for all supplements', () => {
        const result = execSync(
            'node seed.js --dry-run',
            { cwd: ROOT, encoding: 'utf8', timeout: 60000 }
        );
        expect(result).toContain('0 errors');
        expect(result).toContain('93 generated');
    });

    test('seed.js generates valid HTML for Pattern C supplement', () => {
        const tmpDir = path.join(ROOT, 'supplements-test-tmp');
        try {
            execSync(`node seed.js --id 89 --out "${tmpDir}"`,
                { cwd: ROOT, encoding: 'utf8', timeout: 30000 });
            const html = fs.readFileSync(path.join(tmpDir, 'pterostilbene.html'), 'utf8');
            expect(html).toContain('Pterostilbene');
            expect(html).toContain('evidence-card');
            // Verify HTML has proper structural elements
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('canonical');
        } finally {
            if (fs.existsSync(tmpDir)) {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            }
        }
    });

    test('seed.js generates valid HTML for migrated Pattern A supplement', () => {
        const tmpDir = path.join(ROOT, 'supplements-test-tmp');
        try {
            execSync(`node seed.js --id 1 --out "${tmpDir}"`,
                { cwd: ROOT, encoding: 'utf8', timeout: 30000 });
            const html = fs.readFileSync(path.join(tmpDir, 'bacopa-monnieri.html'), 'utf8');
            expect(html).toContain('Bacopa');
            expect(html).toContain('evidence-card');
        } finally {
            if (fs.existsSync(tmpDir)) {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            }
        }
    });
});

test.describe('Tooling Scripts', () => {

    test('validate-schema.js runs and scans all files', () => {
        // validate-schema.js exits 1 when errors found, but should not crash
        try {
            execSync('node scripts/validate-schema.js --summary',
                { cwd: ROOT, encoding: 'utf8', timeout: 30000 });
        } catch (e) {
            // Exit code 1 is expected (data quality errors exist)
            const output = e.stdout || e.stderr || '';
            expect(output).toContain('Files scanned:');
            expect(output).toContain('Pattern C');
            // All files should be detected as Pattern C after migration
            expect(output).toContain('Pattern A (claim-descriptive):  0');
        }
    });

    test('verify-citations.js --schema delegates to validate-schema.js', () => {
        try {
            execSync('node scripts/verify-citations.js --schema --summary',
                { cwd: ROOT, encoding: 'utf8', timeout: 30000 });
        } catch (e) {
            const output = e.stdout || e.stderr || '';
            expect(output).toContain('Pattern Distribution');
        }
    });

    test('verify-citations.js --dry-run extracts items from all files', () => {
        const result = execSync(
            'node scripts/verify-citations.js --dry-run',
            { cwd: ROOT, encoding: 'utf8', timeout: 30000 }
        );
        expect(result).toContain('Citation items found');
        expect(result).toContain('Supplements scanned');
    });

    test('migrate-citations.js --dry-run shows no files need migration', () => {
        const result = execSync(
            'node scripts/migrate-citations.js --dry-run',
            { cwd: ROOT, encoding: 'utf8', timeout: 30000 }
        );
        expect(result).toContain('Skipped (already C)');
        expect(result).not.toContain('would migrate');
    });

    test('supplements.js metadata count matches actual count', () => {
        const src = fs.readFileSync(path.join(ROOT, 'data', 'supplements.js'), 'utf8');
        // supplements.js uses `const supplementDatabase = { ... }`
        // which is a top-level const, not a window assignment
        const ctx = { window: {} };
        vm.createContext(ctx);
        // Wrap so supplementDatabase is accessible
        const wrappedSrc = src + '\nwindow.__db = supplementDatabase;';
        vm.runInContext(wrappedSrc, ctx);
        const db = ctx.window.__db;
        expect(db).toBeDefined();
        expect(db.metadata.totalSupplements).toBe(db.supplements.length);
    });
});
