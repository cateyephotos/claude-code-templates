#!/usr/bin/env node
/**
 * generate-sitemap.js — Regenerate sitemap.xml from files on disk
 *
 * Scans supplements/, compare/, guides/, categories/, evidence/, and top-level
 * pages to produce a complete sitemap.xml. Run after ANY page generation.
 *
 * Usage:
 *   node scripts/generate-sitemap.js
 *   npm run generate:sitemap
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = "https://supplementdb.info";
const TODAY = new Date().toISOString().split("T")[0];

// Pages to skip (mockups, test files, sales funnels)
const SKIP_FILES = new Set([
  "mockup-a-refined.html",
  "mockup-b-revolutionary.html",
  "sleep-sales.html",
]);

// Per-file lastmod from filesystem mtime. Pages are regenerated when
// content changes (seed.js, generate-compare-pages.js, etc.), so mtime
// reflects the actual content-change time. Google detects and discounts
// blanket "today" lastmod values, so this matters for crawl prioritization.
function fileLastMod(absPath) {
  try {
    return fs.statSync(absPath).mtime.toISOString().split("T")[0];
  } catch {
    return TODAY;
  }
}

const urls = [];

function add(loc, freq, priority, sourceFile) {
  const lastmod = sourceFile ? fileLastMod(sourceFile) : TODAY;
  urls.push({ loc: BASE + loc, freq, priority, lastmod });
}

function scanDir(dir, urlPrefix, freq, priority) {
  const dirPath = path.join(ROOT, dir);
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".html") && !SKIP_FILES.has(f))
    .sort();
  files.forEach((f) => add(`/${urlPrefix}/${f}`, freq, priority, path.join(dirPath, f)));
  return files.length;
}

// ── Top-level pages ──────────────────────────────────────────────
add("/", "daily", "1.0", path.join(ROOT, "index.html"));
add("/about.html", "monthly", "0.5", path.join(ROOT, "about.html"));
add("/faq.html", "monthly", "0.5", path.join(ROOT, "faq.html"));
add("/methodology.html", "monthly", "0.5", path.join(ROOT, "methodology.html"));

// Tools
const stackAnalyzer = path.join(ROOT, "tools", "stack-analyzer.html");
if (fs.existsSync(stackAnalyzer)) {
  add("/tools/stack-analyzer.html", "weekly", "0.7", stackAnalyzer);
}

// Legal
const legalDir = path.join(ROOT, "legal");
if (fs.existsSync(legalDir)) {
  fs.readdirSync(legalDir)
    .filter((f) => f.endsWith(".html"))
    .sort()
    .forEach((f) => add(`/legal/${f}`, "monthly", "0.3", path.join(legalDir, f)));
}

// ── Content directories ──────────────────────────────────────────
const counts = {};
counts.supplements = scanDir("supplements", "supplements", "weekly", "0.8");
counts.categories = scanDir("categories", "categories", "weekly", "0.7");
counts.guides = scanDir("guides", "guides", "weekly", "0.8");
counts.compare = scanDir("compare", "compare", "weekly", "0.8");
counts.interactions = scanDir("interactions", "interactions", "weekly", "0.7");
counts.evidence = scanDir("evidence", "evidence", "monthly", "0.6");

// ── Build XML ────────────────────────────────────────────────────
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
urls.forEach((u) => {
  xml += "    <url>\n";
  xml += `        <loc>${u.loc}</loc>\n`;
  xml += `        <lastmod>${u.lastmod}</lastmod>\n`;
  xml += `        <changefreq>${u.freq}</changefreq>\n`;
  xml += `        <priority>${u.priority}</priority>\n`;
  xml += "    </url>\n";
});
xml += "</urlset>\n";

const outPath = path.join(ROOT, "sitemap.xml");
fs.writeFileSync(outPath, xml);

console.log(`Sitemap generated: ${urls.length} URLs`);
Object.entries(counts).forEach(([k, v]) => {
  if (v > 0) console.log(`  ${k}: ${v}`);
});
console.log(`Written to: ${outPath}`);
