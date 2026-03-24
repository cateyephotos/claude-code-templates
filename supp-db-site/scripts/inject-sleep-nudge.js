#!/usr/bin/env node
/**
 * Inject soft sign-up nudge banner into the free sleep guide.
 * Sleep guide is hand-crafted, so this is a post-processing step.
 *
 * Usage: node scripts/inject-sleep-nudge.js
 * Idempotent: skips injection if banner already present.
 */

const fs = require('fs');
const path = require('path');

const SLEEP_PATH = path.join(__dirname, '..', 'guides', 'sleep.html');
const NUDGE_MARKER = '<!-- Soft Sign-Up Nudge -->';

const NUDGE_HTML = `
${NUDGE_MARKER}
<section class="max-w-3xl mx-auto px-4 sm:px-6 py-10 reveal" style="margin-top: 2rem;">
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 2rem; text-align: center;">
        <p style="color: var(--text-bright); font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">
            Get updates when new sleep research is added
        </p>
        <button onclick="window.SupplementDBAuth && window.SupplementDBAuth.openSignUp()"
                style="margin-top: 1rem; padding: 0.75rem 2rem; background: var(--glow); color: #000; border: none; border-radius: 8px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: opacity 0.2s;"
                onmouseover="this.style.opacity='0.85'"
                onmouseout="this.style.opacity='1'">
            Create Free Account
        </button>
        <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.75rem;">
            No spam. No cost.
        </p>
    </div>
</section>
`;

// Candidate insertion points in priority order
const INSERT_CANDIDATES = [
  '<!-- Auth & Content Gate -->',
  '<!-- Auth & Backend Scripts -->',
  '</body>',
];

function main() {
  if (!fs.existsSync(SLEEP_PATH)) {
    console.error(`ERROR: Sleep guide not found at ${SLEEP_PATH}`);
    process.exit(1);
  }

  let html = fs.readFileSync(SLEEP_PATH, 'utf8');

  // Idempotency check
  if (html.includes(NUDGE_MARKER)) {
    console.log('✓ Nudge banner already present in sleep.html — skipping.');
    return;
  }

  // Find the first available insertion point
  let insertBefore = null;
  for (const candidate of INSERT_CANDIDATES) {
    if (html.includes(candidate)) {
      insertBefore = candidate;
      break;
    }
  }

  if (!insertBefore) {
    console.error('ERROR: Could not find a suitable insertion point in sleep.html');
    console.error('Tried:', INSERT_CANDIDATES.join(', '));
    process.exit(1);
  }

  const insertIdx = html.indexOf(insertBefore);

  // Insert nudge banner before the located marker
  html = html.slice(0, insertIdx) + NUDGE_HTML + '\n' + html.slice(insertIdx);
  fs.writeFileSync(SLEEP_PATH, html, 'utf8');

  console.log(`✓ Nudge banner injected into sleep.html (before: ${insertBefore})`);
}

main();
