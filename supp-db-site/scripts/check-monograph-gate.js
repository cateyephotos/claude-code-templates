#!/usr/bin/env node
/**
 * check-monograph-gate.js — Build-time guard against silent gate regression.
 *
 * Why: on 2026-03-29 a routine seed.js regen (commit 1626abcc) silently
 * stripped the monograph preview wall from all 113 supplement pages because
 * the gate's <link>/<script> tags lived in inject-auth.js (a separate
 * post-step) instead of in the template itself. Those tags now live in
 * seed.js. This script asserts that every generated supplement page
 * contains the marker, the CSS link, and the JS script tag — and exits
 * non-zero if any page is missing any of them. Wire into the page
 * generation pipeline so a future template regression breaks the build.
 */
const fs = require("fs");
const path = require("path");

const SUPPLEMENTS_DIR = path.resolve(__dirname, "..", "supplements");

const REQUIREMENTS = [
  { name: "MONOGRAPH_GATE_POINT marker", needle: "MONOGRAPH_GATE_POINT" },
  { name: "content-gate.css link",       needle: "content-gate.css" },
  { name: "monograph-gate.js script",    needle: "monograph-gate.js" },
];

function main() {
  if (!fs.existsSync(SUPPLEMENTS_DIR)) {
    console.error(`❌ Supplements directory not found: ${SUPPLEMENTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SUPPLEMENTS_DIR)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(SUPPLEMENTS_DIR, f));

  if (files.length === 0) {
    console.error(`❌ No supplement HTML files found in ${SUPPLEMENTS_DIR}`);
    process.exit(1);
  }

  const failures = [];
  for (const file of files) {
    const html = fs.readFileSync(file, "utf-8");
    const missing = REQUIREMENTS.filter((r) => !html.includes(r.needle)).map((r) => r.name);
    if (missing.length > 0) {
      failures.push({ file: path.relative(SUPPLEMENTS_DIR, file), missing });
    }
  }

  if (failures.length > 0) {
    console.error(`❌ Monograph gate check FAILED on ${failures.length} of ${files.length} pages.\n`);
    for (const f of failures) {
      console.error(`   ${f.file}`);
      for (const m of f.missing) console.error(`     - missing: ${m}`);
    }
    console.error(`\nThis means the preview wall is not active on those pages.`);
    console.error(`Fix: ensure seed.js template includes content-gate.css <link>,`);
    console.error(`monograph-gate.js <script>, and MONOGRAPH_GATE_POINT marker,`);
    console.error(`then re-run: node seed.js --out supplements/`);
    process.exit(1);
  }

  console.log(`✅ Monograph gate present on all ${files.length} supplement pages.`);
}

main();
