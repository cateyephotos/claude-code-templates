#!/usr/bin/env node
/**
 * migrate-citations.js — Pattern A/B → Pattern C Citation Schema Migrator
 *
 * Converts enhanced citation files from legacy formats to the canonical
 * nested-evidence schema (Pattern C).
 *
 * Three recognized patterns:
 *   Pattern A (claim-descriptive): item.claim + item.evidence (string)
 *   Pattern B (flat citation-list): item.title + item.authors (no nested evidence)
 *   Pattern C (canonical):         item.evidence is an array of citation objects
 *
 * Usage:
 *   node scripts/migrate-citations.js                  # migrate all non-C files
 *   node scripts/migrate-citations.js --id 1           # migrate single file
 *   node scripts/migrate-citations.js --dry-run        # detect + report only
 *   node scripts/migrate-citations.js --backup         # create .bak before overwriting
 *   node scripts/migrate-citations.js --dry-run --id 1 # inspect one file
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT         = path.join(__dirname, '..');
const ENHANCED_DIR = path.join(ROOT, 'data', 'enhanced_citations');

// ---- CLI flags ----
const DRY_RUN   = process.argv.includes('--dry-run');
const BACKUP    = process.argv.includes('--backup');
const TARGET_ID = (() => {
    const i = process.argv.indexOf('--id');
    return i >= 0 ? parseInt(process.argv[i + 1], 10) : null;
})();

// ---- Section-specific group title field names ----
const SECTION_TITLE_FIELD = {
    mechanisms: 'mechanism',
    benefits:   'healthDomain',
    safety:     'safetyAspect',
    dosage:     'dosageRange',
};

// ---- Evidence level mapping ----
const EVIDENCE_LEVEL_MAP = {
    'strong':        'Level 2',
    'strong evidence': 'Level 2',
    'moderate':      'Level 3',
    'moderate evidence': 'Level 3',
    'weak':          'Level 4',
    'limited':       'Level 4',
    'preliminary':   'Level 5',
    'evidence-based': 'Level 3',
    'good':          'Level 3',
    'well-established': 'Level 2',
};

function deriveEvidenceLevel(strengthStr) {
    if (!strengthStr) return 'Level 3';
    const key = String(strengthStr).toLowerCase().trim();
    return EVIDENCE_LEVEL_MAP[key] || 'Level 3';
}

// ---- Truncation helper ----
function truncate(text, maxLen) {
    if (!text) return '';
    const str = String(text).trim();
    if (str.length <= maxLen) return str;
    // Try to cut at first sentence boundary
    const sentenceEnd = str.indexOf('. ');
    if (sentenceEnd > 0 && sentenceEnd <= maxLen) {
        return str.slice(0, sentenceEnd + 1);
    }
    return str.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
}

// ---- Citation ID generation ----
function generateCitationId(item, section) {
    let author = 'unknown';
    // Try to extract first author from various sources
    if (item.authors) {
        if (Array.isArray(item.authors) && item.authors.length > 0) {
            // Pattern B: ["Roberts, R.L.", "Green, J."]
            const first = item.authors[0];
            const surname = first.split(',')[0].split(' ')[0].trim();
            author = surname.toLowerCase().replace(/[^a-z]/g, '');
        } else if (typeof item.authors === 'string') {
            const surname = item.authors.split(/[\s,]+/)[0].trim();
            author = surname.toLowerCase().replace(/[^a-z]/g, '');
        }
    } else if (item.details && typeof item.details === 'string') {
        // Pattern A: extract first name from details text
        const nameMatch = item.details.match(/^([A-Z][a-z]+(?:\s(?:and|&)\s[A-Z][a-z]+)?)\s/);
        if (nameMatch) {
            author = nameMatch[1].split(/[\s&]+/)[0].toLowerCase().replace(/[^a-z]/g, '');
        }
    }
    const year = item.year || 'unknown';
    const sectionSlug = section.toLowerCase().replace(/[^a-z]/g, '_');
    return `${author}_${year}_${sectionSlug}`;
}

// ---- Load enhanced file via vm sandbox ----
function loadEnhancedFile(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
    vm.createContext(ctx);
    const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+)\s*=/m);
    let patchedSrc = src;
    if (constMatch) {
        patchedSrc = src + `\ntry { window.__top = ${constMatch[1]}; } catch(e) {}`;
    }
    try { vm.runInContext(patchedSrc, ctx); } catch (e) { return null; }
    if (ctx.window.__top) return ctx.window.__top;
    const keys = Object.keys(ctx.window.enhancedCitations);
    if (keys.length > 0) return ctx.window.enhancedCitations[keys[0]];
    return null;
}

// ---- Detect pattern of a citations section ----
// Returns 'A', 'B', 'C', 'C_STUDIES', or null (empty/unrecognized)
// 'C_STUDIES' = Pattern C but uses `studies` instead of `evidence` — needs rename
function detectPattern(citations) {
    if (!citations || typeof citations !== 'object') return null;

    const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
    for (const section of sections) {
        const arr = citations[section];
        if (!Array.isArray(arr) || arr.length === 0) continue;

        for (const item of arr) {
            if (!item || typeof item !== 'object') continue;

            // Pattern C: evidence is a non-empty array
            if (Array.isArray(item.evidence) && item.evidence.length > 0) {
                return 'C';
            }

            // Pattern C variant: uses `studies` instead of `evidence`
            if (Array.isArray(item.studies) && item.studies.length > 0) {
                return 'C_STUDIES';
            }

            // Pattern A: has claim + evidence is a string
            if (item.claim && typeof item.evidence === 'string') {
                return 'A';
            }

            // Pattern B: has title + authors, no nested evidence array
            if (item.title && item.authors && !Array.isArray(item.evidence)) {
                return 'B';
            }
        }
    }
    return null;
}

// ---- Rename `studies` → `evidence` in all citation groups ----
function renameStudiesToEvidence(citations) {
    const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
    for (const section of sections) {
        const arr = citations[section];
        if (!Array.isArray(arr)) continue;
        for (const item of arr) {
            if (item && Array.isArray(item.studies)) {
                item.evidence = item.studies;
                delete item.studies;
            }
        }
    }
    return citations;
}

// ---- Migrate Pattern A item → Pattern C group ----
function migratePatternAItem(item, section) {
    const titleField = SECTION_TITLE_FIELD[section] || 'mechanism';
    const groupTitle = truncate(item.claim, 100);

    const citationId = generateCitationId(item, section);
    const evidenceLevel = deriveEvidenceLevel(item.evidence);

    const evidenceEntry = {
        citationId,
        title: '',
        authors: [],
        year: item.year || null,
        journal: '',
        doi: item.doi || '',
        pmid: item.pmid || '',
        studyType: item.studyType || '',
        evidenceLevel,
        findings: item.details || '',
        methodology: item.studyType || '',
        sampleSize: item.participants || '',
    };

    if (item.duration) {
        evidenceEntry.duration = item.duration;
    }

    const group = {};
    group[titleField] = groupTitle;
    group.strength = typeof item.evidence === 'string' ? item.evidence : 'Moderate';
    group.evidence = [evidenceEntry];

    return group;
}

// ---- Migrate Pattern B item → Pattern C group ----
function migratePatternBItem(item, section) {
    const titleField = SECTION_TITLE_FIELD[section] || 'mechanism';
    const groupTitle = truncate(item.significance || item.title || '', 100);

    const citationId = generateCitationId(item, section);

    const evidenceEntry = {
        citationId,
        title: item.title || '',
        authors: item.authors || [],
        year: item.year || null,
        journal: item.journal || '',
        doi: item.doi || '',
        pmid: item.pmid || '',
        studyType: '',
        evidenceLevel: 'Level 3',
        findings: item.significance || '',
        methodology: '',
    };

    const group = {};
    group[titleField] = groupTitle;
    group.strength = 'Moderate';
    group.evidence = [evidenceEntry];

    return group;
}

// ---- Migrate entire citations object ----
function migrateCitations(citations, pattern) {
    const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
    const migrated = {};

    for (const section of sections) {
        const arr = citations[section];
        if (!Array.isArray(arr) || arr.length === 0) continue;

        migrated[section] = arr.map(item => {
            if (!item || typeof item !== 'object') return item;

            if (pattern === 'A') {
                return migratePatternAItem(item, section);
            } else if (pattern === 'B') {
                return migratePatternBItem(item, section);
            }
            return item;
        });
    }

    return migrated;
}

// ---- Detect export pattern from source text ----
// Returns: { type: 'window-var' | 'const-var' | 'direct', varName, id, comments }
function detectExportPattern(src) {
    const lines = src.split('\n');

    // Collect leading comment lines (before first executable code)
    const commentLines = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            commentLines.push(line);
        } else {
            break;
        }
    }
    const comments = commentLines.join('\n');

    // Find the enhancedCitations init line (if any)
    const hasInit = /window\.enhancedCitations\s*=\s*window\.enhancedCitations\s*\|\|\s*\{\s*\}/.test(src);

    // Pattern 1: window.xyzEnhanced = { ... }; window.enhancedCitations[ID] = window.xyzEnhanced;
    const windowVarMatch = src.match(/window\.(\w+Enhanced)\s*=\s*\{/);
    const windowAssignMatch = src.match(/window\.enhancedCitations\[(\d+)\]\s*=\s*window\.(\w+)/);
    if (windowVarMatch && windowAssignMatch) {
        return {
            type: 'window-var',
            varName: windowVarMatch[1],
            id: parseInt(windowAssignMatch[1], 10),
            comments,
            hasInit,
        };
    }

    // Pattern 2: const xyzEnhanced = { ... }; window.enhancedCitations[ID] = xyzEnhanced;
    const constMatch = src.match(/(?:const|let|var)\s+(\w+)\s*=\s*\{/);
    const constAssignMatch = src.match(/window\.enhancedCitations\[(\d+)\]\s*=\s*(\w+)/);
    if (constMatch && constAssignMatch) {
        return {
            type: 'const-var',
            varName: constMatch[1],
            id: parseInt(constAssignMatch[1], 10),
            comments,
            hasInit,
        };
    }

    // Pattern 3: window.enhancedCitations[ID] = { ... };
    const directMatch = src.match(/window\.enhancedCitations\[(\d+)\]\s*=\s*\{/);
    if (directMatch) {
        return {
            type: 'direct',
            varName: null,
            id: parseInt(directMatch[1], 10),
            comments,
            hasInit,
        };
    }

    return { type: 'unknown', varName: null, id: null, comments, hasInit };
}

// ---- Serialize data object as JS (JSON.stringify with cleanup) ----
function serializeAsJs(obj) {
    let json = JSON.stringify(obj, null, 4);
    // Remove quotes from keys that are valid JS identifiers
    json = json.replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)"\s*:/g, '$1: ');
    return json;
}

// ---- Build output file content ----
function buildOutput(data, exportInfo) {
    const parts = [];

    // Leading comments
    if (exportInfo.comments) {
        parts.push(exportInfo.comments);
        if (!exportInfo.comments.endsWith('\n')) parts.push('');
    }

    const serialized = serializeAsJs(data);

    // Check for module.exports in original source pattern
    const hasModuleExports = true; // Always include for pipeline compatibility

    if (exportInfo.type === 'window-var') {
        // window.enhancedCitations = window.enhancedCitations || {};
        if (exportInfo.hasInit) {
            parts.push('window.enhancedCitations = window.enhancedCitations || {};');
            parts.push('');
        }
        // window.xyzEnhanced = { ... };
        parts.push(`window.${exportInfo.varName} = ${serialized};`);
        parts.push('');
        // window.enhancedCitations[ID] = window.xyzEnhanced;
        parts.push(`window.enhancedCitations[${exportInfo.id}] = window.${exportInfo.varName};`);
        parts.push('');
        // module.exports
        parts.push("if (typeof module !== 'undefined' && module.exports) {");
        parts.push(`    module.exports = window.${exportInfo.varName};`);
        parts.push('}');
    } else if (exportInfo.type === 'const-var') {
        // window.enhancedCitations = window.enhancedCitations || {};  (if present originally)
        // const xyzEnhanced = { ... };
        parts.push(`const ${exportInfo.varName} = ${serialized};`);
        parts.push('');
        // Export for browser and Node.js environments
        if (exportInfo.hasInit) {
            parts.push('window.enhancedCitations = window.enhancedCitations || {};');
        } else {
            parts.push("if (typeof window !== 'undefined') {");
            parts.push('    window.enhancedCitations = window.enhancedCitations || {};');
            parts.push(`    window.enhancedCitations[${exportInfo.id}] = ${exportInfo.varName};`);
            parts.push('}');
            parts.push('');
            parts.push("if (typeof module !== 'undefined' && module.exports) {");
            parts.push(`    module.exports = ${exportInfo.varName};`);
            parts.push('}');
            return parts.join('\n') + '\n';
        }
        parts.push(`window.enhancedCitations[${exportInfo.id}] = ${exportInfo.varName};`);
        parts.push('');
        parts.push("if (typeof module !== 'undefined' && module.exports) {");
        parts.push(`    module.exports = ${exportInfo.varName};`);
        parts.push('}');
    } else if (exportInfo.type === 'direct') {
        // window.enhancedCitations = window.enhancedCitations || {};
        parts.push('window.enhancedCitations = window.enhancedCitations || {};');
        parts.push(`window.enhancedCitations[${exportInfo.id}] = ${serialized};`);
        parts.push('');
        parts.push("if (typeof module !== 'undefined' && module.exports) {");
        parts.push(`    module.exports = window.enhancedCitations[${exportInfo.id}];`);
        parts.push('}');
    } else {
        // Fallback: const-var style with generated name
        const safeName = `supplement_${data.supplementId || 'unknown'}_enhanced`;
        parts.push(`const ${safeName} = ${serialized};`);
        parts.push('');
        parts.push("if (typeof window !== 'undefined') {");
        parts.push('    window.enhancedCitations = window.enhancedCitations || {};');
        const id = data.supplementId || data.id || 0;
        parts.push(`    window.enhancedCitations[${id}] = ${safeName};`);
        parts.push('}');
        parts.push('');
        parts.push("if (typeof module !== 'undefined' && module.exports) {");
        parts.push(`    module.exports = ${safeName};`);
        parts.push('}');
    }

    return parts.join('\n') + '\n';
}

// ---- Main ----
function main() {
    console.log('SupplementDB — Citation Schema Migrator (Pattern A/B → C)');
    console.log('==========================================================\n');
    if (DRY_RUN) console.log('DRY-RUN mode: no files will be modified.\n');
    if (BACKUP)  console.log('BACKUP mode: .bak files will be created before overwriting.\n');

    const allFiles = fs.readdirSync(ENHANCED_DIR)
        .filter(f => f.match(/^\d+_.*enhanced\.js$/))
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const targetFiles = TARGET_ID
        ? allFiles.filter(f => f.startsWith(`${TARGET_ID}_`))
        : allFiles;

    if (targetFiles.length === 0) {
        if (TARGET_ID) {
            console.error(`ERROR: No enhanced citation file found for id=${TARGET_ID}`);
        } else {
            console.error('ERROR: No enhanced citation files found in ' + ENHANCED_DIR);
        }
        process.exit(1);
    }

    const stats = { total: 0, skipped: 0, migrated: 0, errors: 0 };
    const results = [];

    for (const filename of targetFiles) {
        stats.total++;
        const filePath = path.join(ENHANCED_DIR, filename);
        const src = fs.readFileSync(filePath, 'utf8');

        // Load data
        const data = loadEnhancedFile(filePath);
        if (!data) {
            stats.errors++;
            results.push({ file: filename, status: 'ERROR', detail: 'Failed to load/parse file' });
            console.log(`  ERROR   ${filename} — could not load/parse`);
            continue;
        }

        // Detect pattern
        const pattern = detectPattern(data.citations);
        if (!pattern) {
            stats.skipped++;
            results.push({ file: filename, status: 'SKIPPED', detail: 'No recognizable citation sections found' });
            console.log(`  SKIP    ${filename} — no recognizable citation sections`);
            continue;
        }

        if (pattern === 'C') {
            stats.skipped++;
            results.push({ file: filename, status: 'SKIPPED', detail: 'Already Pattern C (canonical)' });
            console.log(`  SKIP    ${filename} — already Pattern C`);
            continue;
        }

        // Pattern C variant: uses `studies` instead of `evidence` — rename in-place
        if (pattern === 'C_STUDIES') {
            if (DRY_RUN) {
                stats.migrated++;
                results.push({ file: filename, status: 'WOULD_RENAME', detail: 'Pattern C with studies→evidence rename' });
                console.log(`  DETECT  ${filename} — Pattern C (studies→evidence rename needed)`);
                continue;
            }
            // Rename studies → evidence in data
            renameStudiesToEvidence(data.citations);
            const newData = {};
            for (const key of Object.keys(data)) {
                newData[key] = data[key];
            }
            const exportInfo = detectExportPattern(src);
            if (exportInfo.id === null && (data.supplementId || data.id)) {
                exportInfo.id = data.supplementId || data.id;
            }
            const output = buildOutput(newData, exportInfo);
            if (BACKUP) {
                fs.writeFileSync(filePath + '.bak', src, 'utf8');
                console.log(`  BACKUP  ${filename}.bak created`);
            }
            fs.writeFileSync(filePath, output, 'utf8');
            stats.migrated++;
            results.push({ file: filename, status: 'RENAMED', detail: 'studies→evidence rename' });
            console.log(`  RENAME  ${filename} — studies→evidence (Pattern C fix)`);
            continue;
        }

        // Count items being migrated
        const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
        let itemCount = 0;
        for (const s of sections) {
            if (Array.isArray(data.citations[s])) {
                itemCount += data.citations[s].length;
            }
        }

        if (DRY_RUN) {
            stats.migrated++;
            results.push({
                file: filename,
                status: 'WOULD_MIGRATE',
                detail: `Pattern ${pattern} → C (${itemCount} items across sections)`,
            });
            console.log(`  DETECT  ${filename} — Pattern ${pattern} (${itemCount} items) → would migrate to C`);
            continue;
        }

        // Migrate citations
        const migratedCitations = migrateCitations(data.citations, pattern);

        // Build new data object preserving all top-level fields
        const newData = {};
        for (const key of Object.keys(data)) {
            if (key === 'citations') {
                newData.citations = migratedCitations;
            } else {
                newData[key] = data[key];
            }
        }

        // Detect export pattern from original source
        const exportInfo = detectExportPattern(src);
        if (exportInfo.id === null && (data.supplementId || data.id)) {
            exportInfo.id = data.supplementId || data.id;
        }

        // Build output
        const output = buildOutput(newData, exportInfo);

        // Backup if requested
        if (BACKUP) {
            const backupPath = filePath + '.bak';
            fs.writeFileSync(backupPath, src, 'utf8');
            console.log(`  BACKUP  ${filename}.bak created`);
        }

        // Write
        try {
            fs.writeFileSync(filePath, output, 'utf8');
            stats.migrated++;
            results.push({
                file: filename,
                status: 'MIGRATED',
                detail: `Pattern ${pattern} → C (${itemCount} items)`,
            });
            console.log(`  MIGRATE ${filename} — Pattern ${pattern} → C (${itemCount} items)`);
        } catch (e) {
            stats.errors++;
            results.push({ file: filename, status: 'ERROR', detail: `Write failed: ${e.message}` });
            console.log(`  ERROR   ${filename} — write failed: ${e.message}`);
        }

        // Verify the written file loads correctly
        const verifyData = loadEnhancedFile(filePath);
        if (!verifyData) {
            console.log(`  WARNING ${filename} — written file failed to reload; restoring from backup`);
            if (BACKUP) {
                fs.writeFileSync(filePath, src, 'utf8');
                console.log(`  RESTORE ${filename} — original restored from backup`);
            }
            stats.migrated--;
            stats.errors++;
            results[results.length - 1].status = 'ERROR';
            results[results.length - 1].detail = 'Post-write verification failed';
        } else {
            const postPattern = detectPattern(verifyData.citations);
            if (postPattern !== 'C') {
                console.log(`  WARNING ${filename} — post-migration pattern is '${postPattern}', expected 'C'`);
            }
        }
    }

    // ---- Summary ----
    console.log('\n==========================================================');
    console.log('MIGRATION SUMMARY');
    console.log('==========================================================');
    console.log(`  Total files scanned : ${stats.total}`);
    console.log(`  Skipped (already C) : ${stats.skipped}`);
    console.log(`  ${DRY_RUN ? 'Would migrate' : 'Migrated'}        : ${stats.migrated}`);
    console.log(`  Errors              : ${stats.errors}`);
    console.log('==========================================================');

    if (DRY_RUN && stats.migrated > 0) {
        console.log('\nRe-run without --dry-run to perform the migration.');
        console.log('Add --backup to create .bak files before overwriting.');
    }

    if (stats.errors > 0) {
        process.exit(1);
    }
}

main();
