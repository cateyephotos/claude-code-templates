#!/usr/bin/env node
/**
 * pubmed-evidence-monitor.js — Weekly Evidence Freshness Scanner
 *
 * For every supplement in the database, queries PubMed for recent
 * meta-analyses, systematic reviews, and randomized controlled trials
 * that were published *after* the supplement's latest known citation,
 * and reports anything we don't already track.
 *
 * Outputs
 * ───────
 *   docs/evidence-updates/{YYYY-MM-DD}.md   — human-readable Markdown report
 *   data/evidence-updates-latest.json       — machine-readable snapshot
 *
 * Usage
 * ─────
 *   node scripts/pubmed-evidence-monitor.js                   # all supplements
 *   node scripts/pubmed-evidence-monitor.js --only=ashwagandha,creatine
 *   node scripts/pubmed-evidence-monitor.js --since-year=2024 # override cutoff
 *   node scripts/pubmed-evidence-monitor.js --max-per-supp=5  # cap per supplement
 *   node scripts/pubmed-evidence-monitor.js --dry-run         # no writes
 *
 * Optional environment
 * ────────────────────
 *   PUBMED_API_KEY — NCBI personal API key. When set, raises the rate
 *                    limit from 3/sec to 10/sec (340ms → 100ms delay).
 *                    Recommended for weekly runs across all supplements.
 *
 * Design notes
 * ────────────
 *  - Reads supplements.js + enhanced_citations/ for each supp to build
 *    the "known PMIDs" set.
 *  - Queries PubMed esearch for each supplement name restricted to
 *    pub types we care about (meta-analysis, systematic review, RCT)
 *    within a date range starting one year before the max known year.
 *  - Fetches summaries (title/year/journal/pubtype) for new PMIDs via
 *    esummary — batched to minimize round-trips.
 *  - Skips supplements whose supplementDatabase record already has
 *    enough recent evidence (max known citation year === current year)
 *    unless --force is passed.
 *  - Never modifies supplements.js or enhanced_citations; writes only
 *    the report + JSON snapshot, which is suitable for a cron / CI run.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const vm = require('vm');

// ─── Config ────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const ENHANCED_DIR = path.join(ROOT, 'data', 'enhanced_citations');
const REPORT_DIR = path.join(ROOT, 'docs', 'evidence-updates');
const JSON_LATEST = path.join(ROOT, 'data', 'evidence-updates-latest.json');

const PUBMED_API_KEY = process.env.PUBMED_API_KEY || null;
const PUBMED_DELAY = PUBMED_API_KEY ? 110 : 350; // 10/sec with key, 3/sec without
const TODAY = new Date().toISOString().slice(0, 10);

const arg = (name, fallback = null) => {
    const i = process.argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
    if (i < 0) return fallback;
    const inline = process.argv[i].split('=')[1];
    if (inline !== undefined) return inline;
    return process.argv[i + 1] || fallback;
};

const ONLY = (arg('only') || '').split(',').map((s) => s.trim()).filter(Boolean);
const SINCE_YEAR_OVERRIDE = arg('since-year') ? parseInt(arg('since-year'), 10) : null;
const MAX_PER_SUPP = parseInt(arg('max-per-supp') || '10', 10);
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

// ─── Helpers ───────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fetchJson(url) {
    return new Promise((resolve) => {
        const opts = {
            headers: {
                'User-Agent': 'SupplementDB-EvidenceMonitor/1.0 (https://supplementdb.info; mailto:admin@supplementdb.info)'
            }
        };
        https.get(url, opts, (res) => {
            if (res.statusCode !== 200) { resolve(null); return; }
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

function withApiKey(url) {
    if (!PUBMED_API_KEY) return url;
    const joiner = url.includes('?') ? '&' : '?';
    return `${url}${joiner}api_key=${PUBMED_API_KEY}`;
}

// ─── Load supplements + known PMIDs ────────────────────────────────────────

function loadSupplementsDb() {
    const src = fs.readFileSync(path.join(ROOT, 'data', 'supplements.js'), 'utf8');
    const ctx = { window: {}, module: { exports: {} } };
    vm.createContext(ctx);
    vm.runInContext(src, ctx);
    return ctx.window.supplementDatabase || null;
}

function findEnhancedFile(id) {
    if (!fs.existsSync(ENHANCED_DIR)) return null;
    const hit = fs.readdirSync(ENHANCED_DIR).find((f) => f.startsWith(`${id}_`) && f.endsWith('_enhanced.js'));
    return hit ? path.join(ENHANCED_DIR, hit) : null;
}

function loadEnhancedFile(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
    vm.createContext(ctx);
    const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+)\s*=/m);
    let patchedSrc = src;
    if (constMatch) patchedSrc += `\ntry { window.__top = ${constMatch[1]}; } catch(e) {}`;
    try { vm.runInContext(patchedSrc, ctx); } catch (e) { return null; }
    if (ctx.window.__top) return ctx.window.__top;
    const keys = Object.keys(ctx.window.enhancedCitations);
    return keys.length > 0 ? ctx.window.enhancedCitations[keys[0]] : null;
}

/** Walk every citations.{section} array and collect (pmid, year) pairs. */
function collectKnownPmids(enhanced) {
    const pmids = new Set();
    let maxYear = null;
    const walk = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach(walk); return; }
        if (node.pmid) {
            const cleaned = String(node.pmid).trim().replace(/[^0-9]/g, '');
            if (cleaned) pmids.add(cleaned);
        }
        if (node.year != null) {
            const y = parseInt(node.year, 10);
            if (!isNaN(y) && (maxYear == null || y > maxYear)) maxYear = y;
        }
        for (const k of Object.keys(node)) if (typeof node[k] === 'object') walk(node[k]);
    };
    walk(enhanced?.citations || {});
    return { pmids, maxYear };
}

// ─── PubMed queries ────────────────────────────────────────────────────────

const HIGH_VALUE_PUB_TYPES = [
    '"Meta-Analysis"[Publication Type]',
    '"Systematic Review"[Publication Type]',
    '"Randomized Controlled Trial"[Publication Type]'
];

/** Build a PubMed search URL for a supplement since a given year. */
function buildSearchUrl(supplement, sinceYear) {
    const names = new Set([supplement.name]);
    if (supplement.scientificName) names.add(supplement.scientificName);
    if (Array.isArray(supplement.commonNames)) supplement.commonNames.forEach((n) => names.add(n));
    // Keep the term tight — quoted names OR'd together.
    const termPart = Array.from(names)
        .filter(Boolean)
        .map((n) => `"${n.replace(/"/g, '')}"[Title/Abstract]`)
        .join(' OR ');
    const pubTypes = HIGH_VALUE_PUB_TYPES.join(' OR ');
    const dateRange = `${sinceYear}/01/01:3000/12/31[dp]`;
    const q = `(${termPart}) AND (${pubTypes}) AND ${dateRange}`;
    const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed' +
        `&term=${encodeURIComponent(q)}` +
        '&retmode=json&retmax=30&sort=pub+date';
    return withApiKey(url);
}

/** esummary a batch of PMIDs → array of { pmid, title, year, journal, pubtypes }. */
async function esummaryBatch(pmids) {
    if (pmids.length === 0) return [];
    const url = withApiKey(
        'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed' +
        `&id=${pmids.join(',')}&retmode=json`
    );
    const data = await fetchJson(url);
    if (!data || !data.result) return [];
    const out = [];
    for (const pmid of pmids) {
        const entry = data.result[pmid];
        if (!entry || entry.error) continue;
        const yearMatch = String(entry.pubdate || '').match(/\d{4}/);
        out.push({
            pmid,
            title: entry.title || '',
            year: yearMatch ? parseInt(yearMatch[0], 10) : null,
            journal: entry.fulljournalname || entry.source || '',
            pubTypes: Array.isArray(entry.pubtype) ? entry.pubtype : []
        });
    }
    return out;
}

// ─── Main monitoring pass ──────────────────────────────────────────────────

function classifyStudyType(pubTypes) {
    const lc = (pubTypes || []).map((s) => String(s).toLowerCase());
    if (lc.some((t) => t.includes('meta-analysis'))) return 'meta-analysis';
    if (lc.some((t) => t.includes('systematic review'))) return 'systematic-review';
    if (lc.some((t) => t.includes('randomized controlled trial'))) return 'rct';
    return 'other';
}

const STUDY_TYPE_WEIGHT = {
    'meta-analysis': 3,
    'systematic-review': 2,
    'rct': 1,
    'other': 0
};

function rankNewPapers(papers) {
    return papers
        .slice()
        .sort((a, b) => {
            const w = (STUDY_TYPE_WEIGHT[b.studyType] || 0) - (STUDY_TYPE_WEIGHT[a.studyType] || 0);
            if (w !== 0) return w;
            return (b.year || 0) - (a.year || 0);
        });
}

async function monitorSupplement(supp) {
    const enhancedPath = findEnhancedFile(supp.id);
    const enhanced = enhancedPath ? loadEnhancedFile(enhancedPath) : null;
    const { pmids: knownPmids, maxYear } = collectKnownPmids(enhanced || {});

    // Determine cutoff year: override → enhanced.lastEvidenceUpdate year → max citation year → 2 years back.
    let sinceYear;
    if (SINCE_YEAR_OVERRIDE) {
        sinceYear = SINCE_YEAR_OVERRIDE;
    } else if (enhanced && enhanced.evidenceProfile && enhanced.evidenceProfile.lastEvidenceUpdate) {
        const m = String(enhanced.evidenceProfile.lastEvidenceUpdate).match(/\d{4}/);
        sinceYear = m ? parseInt(m[0], 10) : null;
    }
    if (!sinceYear && maxYear) sinceYear = maxYear;
    if (!sinceYear) sinceYear = new Date().getFullYear() - 2;

    const currentYear = new Date().getFullYear();
    if (!FORCE && maxYear && maxYear >= currentYear) {
        return {
            name: supp.name,
            slug: slugify(supp.name),
            knownPmidCount: knownPmids.size,
            sinceYear,
            skipped: 'up-to-date',
            newPapers: []
        };
    }

    // esearch
    const searchUrl = buildSearchUrl(supp, sinceYear);
    const searchData = await fetchJson(searchUrl);
    await sleep(PUBMED_DELAY);

    const ids = (searchData && searchData.esearchresult && Array.isArray(searchData.esearchresult.idlist))
        ? searchData.esearchresult.idlist
        : [];
    const newIds = ids.filter((pmid) => !knownPmids.has(pmid));

    let newPapers = [];
    if (newIds.length > 0) {
        const summaries = await esummaryBatch(newIds);
        await sleep(PUBMED_DELAY);
        newPapers = summaries.map((s) => ({
            pmid: s.pmid,
            title: s.title,
            year: s.year,
            journal: s.journal,
            pubTypes: s.pubTypes,
            studyType: classifyStudyType(s.pubTypes),
            url: `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`
        }));
        newPapers = rankNewPapers(newPapers).slice(0, MAX_PER_SUPP);
    }

    return {
        name: supp.name,
        slug: slugify(supp.name),
        knownPmidCount: knownPmids.size,
        sinceYear,
        pubmedHitCount: ids.length,
        newPapers
    };
}

// ─── Report generation ─────────────────────────────────────────────────────

function renderMarkdown(runMeta, entries) {
    const withNew = entries.filter((e) => e.newPapers && e.newPapers.length > 0);
    const total = withNew.reduce((sum, e) => sum + e.newPapers.length, 0);

    const lines = [];
    lines.push(`# Evidence Update Report — ${runMeta.date}`);
    lines.push('');
    lines.push(`**Scan window:** since-year cutoffs default to each supplement's latest known citation year.`);
    lines.push(`**Rate limit:** ${PUBMED_API_KEY ? '10 req/sec (API key present)' : '3 req/sec (no API key)'}`);
    lines.push('');
    lines.push(`- Supplements scanned: **${runMeta.scanned}**`);
    lines.push(`- Supplements skipped (already current): **${runMeta.skipped}**`);
    lines.push(`- Supplements with ≥1 candidate new paper: **${withNew.length}**`);
    lines.push(`- Total candidate new papers: **${total}**`);
    lines.push('');
    lines.push('---');
    lines.push('');

    if (withNew.length === 0) {
        lines.push('No new high-value papers (meta-analyses, systematic reviews, or RCTs) found since the last evidence update. ✅');
        return lines.join('\n');
    }

    // Surface the "biggest deltas" first.
    const sorted = withNew.slice().sort((a, b) => b.newPapers.length - a.newPapers.length);
    for (const entry of sorted) {
        lines.push(`## ${entry.name}`);
        lines.push('');
        lines.push(`- Known citations: ${entry.knownPmidCount}`);
        lines.push(`- Search cutoff: papers ≥ ${entry.sinceYear}`);
        lines.push(`- New candidate papers: **${entry.newPapers.length}**`);
        lines.push('');
        lines.push('| Year | Type | Title | Journal | PMID |');
        lines.push('|-----:|------|-------|---------|------|');
        for (const p of entry.newPapers) {
            const typeLabel = {
                'meta-analysis': 'Meta-analysis',
                'systematic-review': 'Systematic review',
                'rct': 'RCT',
                'other': 'Other'
            }[p.studyType] || p.studyType;
            const title = String(p.title).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
            const journal = String(p.journal).replace(/\|/g, '\\|').trim();
            lines.push(`| ${p.year || '—'} | ${typeLabel} | [${title}](${p.url}) | ${journal} | ${p.pmid} |`);
        }
        lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push(`_Generated by \`scripts/pubmed-evidence-monitor.js\` on ${runMeta.date}. Candidate papers are not yet vetted — a human reviewer should confirm relevance and study quality before adding to enhanced_citations._`);
    return lines.join('\n');
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
    console.log('PubMed Evidence Monitor');
    console.log('=======================');
    const db = loadSupplementsDb();
    if (!db || !Array.isArray(db.supplements)) {
        console.error('Failed to load supplements.js');
        process.exit(1);
    }

    let targets = db.supplements;
    if (ONLY.length > 0) {
        const needle = new Set(ONLY.map((s) => slugify(s)));
        targets = targets.filter((s) => needle.has(slugify(s.name)));
        if (targets.length === 0) {
            console.error(`No supplements matched --only=${ONLY.join(',')}`);
            process.exit(1);
        }
    }

    console.log(`Scanning ${targets.length} supplement${targets.length === 1 ? '' : 's'}`);
    console.log(`Rate: ${PUBMED_API_KEY ? '10/sec (API key)' : '3/sec (no key — set PUBMED_API_KEY to speed up)'}`);
    console.log('');

    const entries = [];
    let done = 0;
    let skipped = 0;
    for (const supp of targets) {
        try {
            const entry = await monitorSupplement(supp);
            entries.push(entry);
            if (entry.skipped) {
                skipped++;
                process.stdout.write(`  ${supp.name} — skipped (${entry.skipped})\n`);
            } else {
                process.stdout.write(`  ${supp.name} — ${entry.newPapers.length} new candidate${entry.newPapers.length === 1 ? '' : 's'} (${entry.pubmedHitCount || 0} total hits since ${entry.sinceYear})\n`);
            }
        } catch (err) {
            entries.push({ name: supp.name, slug: slugify(supp.name), error: String(err && err.message || err) });
            process.stdout.write(`  ${supp.name} — ERROR: ${err && err.message}\n`);
        }
        done++;
    }

    const runMeta = {
        date: TODAY,
        scanned: targets.length,
        skipped,
        generatedAt: new Date().toISOString(),
        apiKey: !!PUBMED_API_KEY
    };
    const markdown = renderMarkdown(runMeta, entries);

    if (DRY_RUN) {
        console.log('\n[dry-run] Skipping writes. Markdown preview:\n');
        console.log(markdown.slice(0, 2000) + (markdown.length > 2000 ? '\n…(truncated)' : ''));
        return;
    }

    if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
    const reportPath = path.join(REPORT_DIR, `${TODAY}.md`);
    fs.writeFileSync(reportPath, markdown);
    console.log(`\n✓ Report:    ${path.relative(ROOT, reportPath)}`);

    fs.writeFileSync(
        JSON_LATEST,
        JSON.stringify({ meta: runMeta, entries }, null, 2)
    );
    console.log(`✓ JSON:      ${path.relative(ROOT, JSON_LATEST)}`);

    const withNew = entries.filter((e) => e.newPapers && e.newPapers.length > 0);
    const total = withNew.reduce((sum, e) => sum + e.newPapers.length, 0);
    console.log(`\n${withNew.length} supplement${withNew.length === 1 ? '' : 's'} with new candidate papers — ${total} total.`);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
