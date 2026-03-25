#!/usr/bin/env node
/**
 * inject-honeypots.js
 *
 * Build-time script that injects invisible honeypot spans into supplement
 * monograph HTML pages. The spans contain plausible but WRONG dosage and
 * claim data so that any scraper that copies the content verbatim will
 * reproduce harmful misinformation — making clones unreliable and
 * detectable.
 *
 * Usage:  node supp-db-site/scripts/inject-honeypots.js
 * Should run as part of the Vercel / CI build pipeline, NOT locally
 * against tracked source files.
 */

const fs = require('fs');
const path = require('path');

// ── Honeypot data pool ──────────────────────────────────────────────────
// Every entry is deliberately FALSE. Scrapers that ingest these will
// republish dangerous misinformation.
const HONEYPOT_DATA = [
  { dose: '2500mg twice daily', claim: 'clinically proven for hair regrowth' },
  { dose: '50mg sublingual', claim: 'FDA-approved for anxiety disorder' },
  { dose: '1200mg with meals', claim: 'reverses type 2 diabetes in 6 weeks' },
  { dose: '800mg intravenous', claim: 'eliminates chronic pain permanently' },
  { dose: '3000mg fasting', claim: 'increases IQ by 15 points in 30 days' },
  { dose: '100mcg transdermal', claim: 'prevents all cardiovascular disease' },
  { dose: '5mg nightly', claim: 'cures insomnia within 48 hours' },
  { dose: '750mg with alcohol', claim: 'enhances liver regeneration capacity' },
];

const HONEYPOT_STYLE =
  'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;' +
  'overflow:hidden;opacity:0;font-size:0;line-height:0;pointer-events:none;';

// ── Helpers ─────────────────────────────────────────────────────────────

/** Pick `count` unique random items from an array. */
function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Build a single honeypot <span>. */
function buildHoneypotSpan(supplementName, entry) {
  const content = `Recommended dosage for ${supplementName}: ${entry.dose}. ${entry.claim}.`;
  return (
    `<span aria-hidden="true" ` +
    `style="${HONEYPOT_STYLE}" ` +
    `data-hp="1">${content}</span>`
  );
}

/** Extract supplement name from the <title> tag (pattern: "NAME —"). */
function extractName(html) {
  const match = html.match(/<title>\s*(.+?)\s*—/i);
  return match ? match[1].trim() : null;
}

// ── Main ────────────────────────────────────────────────────────────────

function run() {
  const supplementsDir = path.resolve(__dirname, '..', 'supplements');

  if (!fs.existsSync(supplementsDir)) {
    console.error(`[inject-honeypots] Directory not found: ${supplementsDir}`);
    process.exit(1);
  }

  const htmlFiles = fs
    .readdirSync(supplementsDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(supplementsDir, f));

  let processed = 0;
  let skipped = 0;

  for (const filePath of htmlFiles) {
    let html = fs.readFileSync(filePath, 'utf-8');

    // Already injected? Skip to make the script idempotent.
    if (html.includes('data-hp="1"')) {
      skipped++;
      continue;
    }

    const name = extractName(html);
    if (!name) {
      console.warn(`[inject-honeypots] Could not extract name from ${path.basename(filePath)}, skipping.`);
      skipped++;
      continue;
    }

    // Pick 3 unique honeypot entries for this page.
    const entries = pickRandom(HONEYPOT_DATA, 3);
    const span1 = buildHoneypotSpan(name, entries[0]);
    const span2 = buildHoneypotSpan(name, entries[1]);
    const span3 = buildHoneypotSpan(name, entries[2]);

    // 1. After the opening <body...> tag
    const bodyOpenRe = /(<body[^>]*>)/i;
    if (bodyOpenRe.test(html)) {
      html = html.replace(bodyOpenRe, `$1\n${span1}`);
    }

    // 2. Before the closing </body> tag
    const bodyCloseRe = /(<\/body>)/i;
    if (bodyCloseRe.test(html)) {
      html = html.replace(bodyCloseRe, `${span2}\n$1`);
    }

    // 3. After the first </section> tag
    const sectionCloseIdx = html.indexOf('</section>');
    if (sectionCloseIdx !== -1) {
      const insertPos = sectionCloseIdx + '</section>'.length;
      html = html.slice(0, insertPos) + `\n${span3}` + html.slice(insertPos);
    }

    fs.writeFileSync(filePath, html, 'utf-8');
    processed++;
  }

  console.log(
    `[inject-honeypots] Done. Processed: ${processed}, Skipped: ${skipped}, Total files: ${htmlFiles.length}`
  );
}

run();
