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

const urls = [];

function add(loc, freq, priority) {
  urls.push({ loc: BASE + loc, freq, priority, lastmod: TODAY });
}

function scanDir(dir, urlPrefix, freq, priority) {
  const dirPath = path.join(ROOT, dir);
  if (!fs.existsSync(dirPath)) return 0;
  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".html") && !SKIP_FILES.has(f))
    .sort();
  files.forEach((f) => add(`/${urlPrefix}/${f}`, freq, priority));
  return files.length;
}

// ── Top-level pages ──────────────────────────────────────────────
add("/", "daily", "1.0");
add("/about.html", "monthly", "0.5");
add("/faq.html", "monthly", "0.5");
add("/methodology.html", "monthly", "0.5");

// Tools
if (fs.existsSync(path.join(ROOT, "tools", "stack-analyzer.html"))) {
  add("/tools/stack-analyzer.html", "weekly", "0.7");
}

// Legal
const legalDir = path.join(ROOT, "legal");
if (fs.existsSync(legalDir)) {
  fs.readdirSync(legalDir)
    .filter((f) => f.endsWith(".html"))
    .sort()
    .forEach((f) => add(`/legal/${f}`, "monthly", "0.3"));
}

// ── Content directories ──────────────────────────────────────────
const counts = {};
counts.supplements = scanDir("supplements", "supplements", "weekly", "0.8");
counts.categories = scanDir("categories", "categories", "weekly", "0.7");
counts.guides = scanDir("guides", "guides", "weekly", "0.8");
counts.compare = scanDir("compare", "compare", "weekly", "0.8");
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
