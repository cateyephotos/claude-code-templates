#!/usr/bin/env node
/**
 * verify-citations.js — Citation Integrity Verifier
 *
 * Hardens the supplement database against hallucinated citations by checking
 * every PMID and DOI in every enhanced_citations file against live APIs:
 *
 *   PMID → PubMed E-utilities esummary  (free, no key, 3 req/sec)
 *   DOI  → CrossRef works API           (free, polite pool, 10 req/sec)
 *
 * For each citation item verified, checks:
 *   1. PMID/DOI existence in the API          — CRITICAL if missing
 *   2. Title match (word-overlap ≥ 0.50)      — HIGH if < 0.50, CRITICAL if < 0.25
 *   3. Year match (stored vs published)        — MEDIUM if off by > 2 years
 *   4. At least one of PMID/DOI is present    — HIGH if both absent
 *
 * Exit code:
 *   0 — no CRITICAL issues found
 *   1 — one or more CRITICAL issues found (CI gate)
 *
 * Usage:
 *   node scripts/verify-citations.js                  # all supplements
 *   node scripts/verify-citations.js --id 33          # one supplement
 *   node scripts/verify-citations.js --dry-run        # load + extract only, no API calls
 *   node scripts/verify-citations.js --summary        # counts only, no per-item detail
 *   node scripts/verify-citations.js --pmid-only      # skip DOI verification
 *   node scripts/verify-citations.js --doi-only       # skip PMID verification
 *   node scripts/verify-citations.js --schema         # run schema validation (delegates to validate-schema.js)
 *   node scripts/verify-citations.js --schema --id 33 # schema validation for one supplement
 */
'use strict';

// ---- Schema validation delegation ----
// When --schema is passed, delegate to validate-schema.js and exit
if (process.argv.includes('--schema')) {
    const { execFileSync } = require('child_process');
    const schemaScript = require('path').join(__dirname, 'validate-schema.js');
    const args = process.argv.slice(2).filter(a => a !== '--schema');
    try {
        execFileSync(process.execPath, [schemaScript, ...args], { stdio: 'inherit' });
        process.exit(0);
    } catch (e) {
        process.exit(e.status || 1);
    }
}

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');
const https = require('https');

const ROOT        = path.join(__dirname, '..');
const ENHANCED_DIR = path.join(ROOT, 'data', 'enhanced_citations');

// ---- CLI flags ----
const DRY_RUN    = process.argv.includes('--dry-run');
const SUMMARY    = process.argv.includes('--summary');
const PMID_ONLY  = process.argv.includes('--pmid-only');
const DOI_ONLY   = process.argv.includes('--doi-only');
const TARGET_ID  = (() => { const i = process.argv.indexOf('--id'); return i >= 0 ? parseInt(process.argv[i+1]) : null; })();

// ---- Rate-limit helper ----
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// PubMed: max 3 unauthenticated requests/second → 340 ms between requests
// CrossRef: polite pool is very generous → 100 ms between requests
const PUBMED_DELAY  = 350; // ms
const CROSSREF_DELAY = 100; // ms

// ---- HTTP helper ----
function fetchJson(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const opts = {
            headers: {
                'User-Agent': 'SupplementDB-CitationVerifier/1.0 (https://supplementdb.info; mailto:admin@supplementdb.info)',
                ...headers,
            }
        };
        https.get(url, opts, res => {
            if (res.statusCode === 404) { resolve(null); return; }
            if (res.statusCode !== 200) { resolve(null); return; }
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve(null); }
            });
        }).on('error', reject);
    });
}

// ---- Title similarity (word-overlap on content words ≥ 4 chars) ----
const STOP_WORDS = new Set(['with','that','this','from','have','been','were','they','their','into','than','also','more','some','such','even','most','then','when','only','both','much','very','each','same','many','well','over','after','before','during','between','about','through','which','there','where','these','those','while','would','could','should']);

function titleSimilarity(stored, actual) {
    if (!stored || !actual) return 0;
    const normalize = s => s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !STOP_WORDS.has(w));
    const a = new Set(normalize(stored));
    const b = new Set(normalize(actual));
    if (a.size === 0 || b.size === 0) return 0;
    const intersection = [...a].filter(w => b.has(w)).length;
    return intersection / Math.max(a.size, b.size);
}

// ---- Load enhanced citation file ----
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

// ---- Find enhanced file for a supplement id ----
function findEnhancedFile(id, name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const all = fs.readdirSync(ENHANCED_DIR);
    const match = all.find(f => f.startsWith(`${id}_`) && f.endsWith('_enhanced.js'));
    return match ? path.join(ENHANCED_DIR, match) : null;
}

// ---- Extract all citable evidence items from an enhanced object ----
// Handles two schemas:
//   Canonical (new): citations.mechanisms = [{ mechanism, evidence: [{citationId, pmid, doi, title, year}] }]
//   Flat (older):    citations.mechanisms = [{ claim, pmid, doi, title, year, ... }]
function extractCitationItems(enhanced, supplementName) {
    const items = [];
    const citations = enhanced.citations || {};

    Object.entries(citations).forEach(([section, arr]) => {
        if (!Array.isArray(arr)) return;
        arr.forEach((group, gi) => {
            if (!group || typeof group !== 'object') return;

            // Canonical grouped format: group.evidence is a non-empty array of citation objects
            if (Array.isArray(group.evidence) && group.evidence.length > 0) {
                group.evidence.forEach((ev, ei) => {
                    if (!ev || typeof ev !== 'object') return;
                    const pmid = String(ev.pmid || '').trim().replace(/[^0-9]/g, '');
                    const doi  = String(ev.doi  || '').trim();
                    items.push({
                        supplementName,
                        section,
                        groupIndex: gi,
                        evidenceIndex: ei,
                        citationId: ev.citationId || `${section}[${gi}][${ei}]`,
                        title:  String(ev.title || ''),
                        year:   ev.year   ? parseInt(ev.year)  : null,
                        pmid:   pmid || null,
                        doi:    doi  || null,
                    });
                });
                return; // handled as grouped
            }

            // Flat format: the group item itself is the citation
            // Detected by: has pmid/doi/title at the top level, or evidence is a string
            const pmid = String(group.pmid || '').trim().replace(/[^0-9]/g, '');
            const doi  = String(group.doi  || '').trim();
            // IMPORTANT: Only use group.title for title-matching — NOT group.claim.
            // group.claim stores a finding description, not the paper's actual title.
            // Setting hasActualTitle=false skips title similarity check for these items.
            const title = String(group.title || '');
            const hasActualTitle = !!group.title;
            const year  = group.year ? parseInt(group.year) : null;
            // Only record if it has at least one identifier (i.e. looks like a citation)
            if (pmid || doi || title) {
                items.push({
                    supplementName,
                    section,
                    groupIndex: gi,
                    evidenceIndex: 0,
                    citationId: group.citationId || group.id || `${section}[${gi}]`,
                    title,
                    hasActualTitle,   // false → skip title comparison
                    year,
                    pmid:  pmid || null,
                    doi:   doi  || null,
                });
            }
        });
    });
    return items;
}

// ---- PubMed batch verification ----
// Returns map: pmid → { exists: bool, title: string, year: number }
async function verifyPmids(pmids) {
    const results = {};
    if (pmids.length === 0) return results;

    // PubMed esummary accepts up to 200 IDs comma-separated
    const BATCH = 100;
    for (let i = 0; i < pmids.length; i += BATCH) {
        const batch = pmids.slice(i, i + BATCH);
        const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${batch.join(',')}&retmode=json`;
        try {
            const data = await fetchJson(url);
            if (data && data.result) {
                batch.forEach(pmid => {
                    const entry = data.result[pmid];
                    if (!entry || entry.error) {
                        results[pmid] = { exists: false, title: null, year: null };
                    } else {
                        // pubdate is like "2002 Aug" or "2024"
                        const yearMatch = String(entry.pubdate || '').match(/\d{4}/);
                        results[pmid] = {
                            exists: true,
                            title: entry.title || '',
                            year:  yearMatch ? parseInt(yearMatch[0]) : null,
                        };
                    }
                });
            } else {
                batch.forEach(pmid => { results[pmid] = { exists: false, title: null, year: null }; });
            }
        } catch (e) {
            batch.forEach(pmid => { results[pmid] = { error: e.message }; });
        }
        if (i + BATCH < pmids.length) await sleep(PUBMED_DELAY);
    }
    return results;
}

// ---- CrossRef DOI verification ----
// Returns map: doi → { exists: bool, title: string, year: number }
async function verifyDois(dois) {
    const results = {};
    for (const doi of dois) {
        const encoded = encodeURIComponent(doi);
        const url = `https://api.crossref.org/works/${encoded}`;
        try {
            const data = await fetchJson(url);
            if (data && data.status === 'ok' && data.message) {
                const msg = data.message;
                const titles = msg.title || [];
                const title = Array.isArray(titles) ? titles[0] || '' : titles;
                const pubDate = msg.published || msg['published-print'] || msg['published-online'];
                let year = null;
                if (pubDate && pubDate['date-parts'] && pubDate['date-parts'][0]) {
                    year = pubDate['date-parts'][0][0] || null;
                }
                results[doi] = { exists: true, title, year };
            } else {
                results[doi] = { exists: false, title: null, year: null };
            }
        } catch (e) {
            results[doi] = { error: e.message };
        }
        await sleep(CROSSREF_DELAY);
    }
    return results;
}

// ---- Issue severity helpers ----
const SEV = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };

function issue(item, severity, type, detail) {
    return { severity, type, detail, ...item };
}

// ---- Load supplements for names ----
function loadSupplementNames() {
    const filePath = path.join(ROOT, 'data', 'supplements.js');
    const src = fs.readFileSync(filePath, 'utf8');
    const window = {};
    try { eval(src); } catch(e) {}  // eslint-disable-line no-eval
    const db = window.supplementDatabase;
    if (!db || !db.supplements) return {};
    const map = {};
    db.supplements.forEach(s => { map[s.id] = s.name; });
    return map;
}

// ---- Main ----
async function main() {
    console.log('SupplementDB — Citation Integrity Verifier');
    console.log('==========================================\n');
    if (DRY_RUN) console.log('DRY-RUN mode: no API calls will be made.\n');

    const supplementNames = loadSupplementNames();
    const allFiles = fs.readdirSync(ENHANCED_DIR)
        .filter(f => f.match(/^\d+_.*_enhanced\.js$/))
        .sort((a, b) => parseInt(a) - parseInt(b));

    const targetFiles = TARGET_ID
        ? allFiles.filter(f => f.startsWith(`${TARGET_ID}_`))
        : allFiles;

    if (targetFiles.length === 0) {
        console.error(`ERROR: No enhanced citation file found for id=${TARGET_ID}`);
        process.exit(1);
    }

    // ---- Collect all citation items across all files ----
    let allItems = [];
    targetFiles.forEach(f => {
        const filePath = path.join(ENHANCED_DIR, f);
        const id = parseInt(f);
        const name = supplementNames[id] || f.replace('_enhanced.js', '').split('_').slice(1).join(' ');
        const enhanced = loadEnhancedFile(filePath);
        if (!enhanced) { console.warn(`  SKIP (load error): ${f}`); return; }
        const items = extractCitationItems(enhanced, name);
        allItems = allItems.concat(items);
    });

    console.log(`Supplements scanned : ${targetFiles.length}`);
    console.log(`Citation items found: ${allItems.length}`);

    const itemsWithPmid = allItems.filter(it => it.pmid);
    const itemsWithDoi  = allItems.filter(it => it.doi);
    const itemsNeitherPmidNorDoi = allItems.filter(it => !it.pmid && !it.doi);

    console.log(`  With PMID         : ${itemsWithPmid.length}`);
    console.log(`  With DOI          : ${itemsWithDoi.length}`);
    console.log(`  No identifier     : ${itemsNeitherPmidNorDoi.length} ${itemsNeitherPmidNorDoi.length > 0 ? '⚠' : '✓'}`);

    if (DRY_RUN) {
        console.log('\nDry-run complete — no API calls made.');
        if (itemsNeitherPmidNorDoi.length > 0) {
            console.log('\nItems with no PMID or DOI:');
            itemsNeitherPmidNorDoi.slice(0, 20).forEach(it =>
                console.log(`  [${it.supplementName}] ${it.section}/${it.citationId} — "${it.title.slice(0,60)}..."`));
        }
        return;
    }

    const issues = [];

    // ---- Flag items with no identifier ----
    itemsNeitherPmidNorDoi.forEach(it => {
        issues.push(issue(it, 'HIGH', 'NO_IDENTIFIER',
            'Citation has neither PMID nor DOI — cannot be independently verified'));
    });

    // ---- PMID verification ----
    if (!DOI_ONLY && itemsWithPmid.length > 0) {
        console.log(`\nVerifying ${itemsWithPmid.length} PMIDs via PubMed...`);
        const uniquePmids = [...new Set(itemsWithPmid.map(it => it.pmid))];
        console.log(`  (${uniquePmids.length} unique PMIDs)`);

        const pmidResults = await verifyPmids(uniquePmids);

        itemsWithPmid.forEach(it => {
            const r = pmidResults[it.pmid];
            if (!r) return;
            if (r.error) {
                issues.push(issue(it, 'MEDIUM', 'PMID_API_ERROR', `PubMed API error: ${r.error}`));
                return;
            }
            if (!r.exists) {
                issues.push(issue(it, 'CRITICAL', 'PMID_NOT_FOUND',
                    `PMID ${it.pmid} does not exist in PubMed — likely hallucinated`));
                return;
            }
            // Title check — only run when the stored field is an actual paper title
            // (not a claim/finding description from the flat citation format)
            if (it.hasActualTitle !== false && it.title) {
                const sim = titleSimilarity(it.title, r.title);
                if (sim < 0.25) {
                    issues.push(issue(it, 'CRITICAL', 'TITLE_MISMATCH_CRITICAL',
                        `Title similarity ${(sim*100).toFixed(0)}% < 25% — wrong paper mapped to citation.\n    Stored: "${it.title.slice(0,80)}"\n    Actual: "${r.title.slice(0,80)}"`));
                } else if (sim < 0.50) {
                    issues.push(issue(it, 'HIGH', 'TITLE_MISMATCH',
                        `Title similarity ${(sim*100).toFixed(0)}% < 50% — verify paper is correct.\n    Stored: "${it.title.slice(0,80)}"\n    Actual: "${r.title.slice(0,80)}"`));
                }
            } else if (it.hasActualTitle === false) {
                // Flat format: no actual title stored. Flag as LOW — encourages migration.
                issues.push(issue(it, 'LOW', 'NO_TITLE_FIELD',
                    `Citation uses claim-as-description format. Migrate to canonical schema with explicit title field. Actual title from PubMed: "${r.title.slice(0,100)}"`));
            }
            // Year check
            if (it.year && r.year && Math.abs(it.year - r.year) > 2) {
                issues.push(issue(it, 'MEDIUM', 'YEAR_MISMATCH',
                    `Stored year ${it.year} ≠ PubMed year ${r.year}`));
            }
        });
        console.log(`  PubMed verification complete.`);
    }

    // ---- DOI verification ----
    if (!PMID_ONLY && itemsWithDoi.length > 0) {
        console.log(`\nVerifying ${itemsWithDoi.length} DOIs via CrossRef...`);
        const uniqueDois = [...new Set(itemsWithDoi.map(it => it.doi))];
        console.log(`  (${uniqueDois.length} unique DOIs — this may take ~${Math.ceil(uniqueDois.length * CROSSREF_DELAY / 1000)}s)`);

        const doiResults = await verifyDois(uniqueDois);

        itemsWithDoi.forEach(it => {
            const r = doiResults[it.doi];
            if (!r) return;
            if (r.error) {
                issues.push(issue(it, 'MEDIUM', 'DOI_API_ERROR', `CrossRef API error: ${r.error}`));
                return;
            }
            if (!r.exists) {
                issues.push(issue(it, 'CRITICAL', 'DOI_NOT_FOUND',
                    `DOI "${it.doi}" does not resolve in CrossRef — broken or fabricated link`));
                return;
            }
            // Title check (only if no PMID already checked for this item, and only for proper title fields)
            if (!it.pmid && it.hasActualTitle !== false && it.title) {
                const sim = titleSimilarity(it.title, r.title);
                if (sim < 0.25) {
                    issues.push(issue(it, 'CRITICAL', 'TITLE_MISMATCH_CRITICAL',
                        `Title similarity ${(sim*100).toFixed(0)}% < 25% — wrong paper.\n    Stored: "${it.title.slice(0,80)}"\n    Actual: "${r.title.slice(0,80)}"`));
                } else if (sim < 0.50) {
                    issues.push(issue(it, 'HIGH', 'TITLE_MISMATCH',
                        `Title similarity ${(sim*100).toFixed(0)}% < 50% — verify paper.\n    Stored: "${it.title.slice(0,80)}"\n    Actual: "${r.title.slice(0,80)}"`));
                }
            } else if (!it.pmid && it.hasActualTitle === false) {
                issues.push(issue(it, 'LOW', 'NO_TITLE_FIELD',
                    `Citation uses claim-as-description format. Actual title from CrossRef: "${r.title.slice(0,100)}"`));
            }
            // Year check
            if (it.year && r.year && Math.abs(it.year - r.year) > 2) {
                issues.push(issue(it, 'MEDIUM', 'YEAR_MISMATCH',
                    `Stored year ${it.year} ≠ CrossRef year ${r.year}`));
            }
        });
        console.log(`  CrossRef verification complete.`);
    }

    // ---- Report ----
    const critical = issues.filter(i => i.severity === 'CRITICAL');
    const high     = issues.filter(i => i.severity === 'HIGH');
    const medium   = issues.filter(i => i.severity === 'MEDIUM');
    const low      = issues.filter(i => i.severity === 'LOW');

    console.log('\n════════════════════════════════════════');
    console.log('CITATION INTEGRITY REPORT');
    console.log('════════════════════════════════════════\n');
    console.log(`Total items verified : ${allItems.length}`);
    console.log(`✗ CRITICAL issues    : ${critical.length}  ← must fix before import`);
    console.log(`⚠ HIGH issues        : ${high.length}`);
    console.log(`ℹ MEDIUM issues      : ${medium.length}`);
    console.log(`  LOW (no title)     : ${low.length}  ← flat-format, encourage migration`);
    console.log(`  (No identifier)    : ${itemsNeitherPmidNorDoi.length}`);

    if (!SUMMARY && issues.length > 0) {
        const printGroup = (label, list) => {
            if (list.length === 0) return;
            console.log(`\n──────────────────────────────────────`);
            console.log(`${label} (${list.length})`);
            console.log(`──────────────────────────────────────`);
            list.forEach(iss => {
                console.log(`  [${iss.supplementName}] ${iss.section} / ${iss.citationId}`);
                if (iss.pmid) console.log(`    PMID: ${iss.pmid}`);
                if (iss.doi)  console.log(`    DOI:  ${iss.doi}`);
                console.log(`    ${iss.detail}`);
                console.log('');
            });
        };

        printGroup('✗ CRITICAL', critical);
        printGroup('⚠ HIGH', high);
        printGroup('ℹ MEDIUM', medium);
    }

    console.log('\n════════════════════════════════════════');
    if (critical.length > 0) {
        console.log('RESULT: ✗ FAILED — CRITICAL issues must be fixed before running seed.js');
        console.log('\nFix protocol:');
        console.log('  PMID_NOT_FOUND     → Search PubMed for the actual paper; replace PMID with verified one.');
        console.log('                       NEVER guess or reconstruct a PMID from memory.');
        console.log('  DOI_NOT_FOUND      → Verify DOI via https://doi.org/{doi}; replace with verified DOI.');
        console.log('  TITLE_MISMATCH     → Copy the exact title from the PubMed/CrossRef API response.');
        console.log('                       Do not paraphrase. Do not infer from abstract text.');
        console.log('After fixing, re-run: node supp-db-site/scripts/verify-citations.js --id {id}');
        process.exit(1);
    } else if (high.length > 0) {
        console.log('RESULT: ⚠ WARNINGS — HIGH issues should be reviewed before import.');
        console.log('  Re-run with --pmid-only after fixing for faster iteration.');
    } else {
        console.log('RESULT: ✓ PASSED — All verified citations resolve correctly.');
    }
}

main().catch(err => {
    console.error('\nFATAL:', err.message);
    process.exit(2);
});
