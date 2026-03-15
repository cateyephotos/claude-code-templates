'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const GENERATORS = [
  { name: 'supplement-pages', script: 'seed.js', args: '--out supplements/' },
  { name: 'guide-pages', script: 'scripts/generate-guide-pages.js' },
  { name: 'compare-pages', script: 'scripts/generate-compare-pages.js' },
  { name: 'evidence-pages', script: 'scripts/generate-evidence-pages.js' },
  { name: 'category-pages', script: 'scripts/generate-category-pages.js' },
];

async function regenerateAllPages(options = {}) {
  const { dryRun = false } = options;
  const results = { generators: 0, errors: [], outputs: [] };

  for (const gen of GENERATORS) {
    const scriptPath = path.join(ROOT, gen.script);
    if (!fs.existsSync(scriptPath)) {
      results.outputs.push({ name: gen.name, status: 'skipped', reason: 'script not found' });
      continue;
    }

    if (dryRun) {
      results.outputs.push({ name: gen.name, status: 'would-run' });
      results.generators++;
      continue;
    }

    try {
      const genArgs = gen.args ? ` ${gen.args}` : '';
      execSync(`node "${scriptPath}"${genArgs}`, {
        cwd: ROOT,
        stdio: 'pipe',
        maxBuffer: 50 * 1024 * 1024,
        timeout: 120000
      });
      results.outputs.push({ name: gen.name, status: 'success' });
      results.generators++;
    } catch (e) {
      results.errors.push({ name: gen.name, error: e.message.substring(0, 200) });
      results.outputs.push({ name: gen.name, status: 'error', error: e.message.substring(0, 200) });
    }
  }

  return results;
}

/**
 * Take screenshots of specific supplement pages for visual diff.
 * Requires Docker (nginx) to be running on port 8080.
 */
async function screenshotPages(supplementSlugs, options = {}) {
  const { outputDir = path.join(ROOT, '..', 'healing-reports', 'screenshots') } = options;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  let browser;
  try {
    const { chromium } = require('playwright');
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });

    const results = [];
    for (const slug of supplementSlugs) {
      const url = `http://localhost:8080/supplements/${slug}.html`;
      try {
        await page.goto(url, { timeout: 15000, waitUntil: 'networkidle' });
        const screenshotPath = path.join(outputDir, `${slug}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        results.push({ slug, status: 'captured', path: screenshotPath });
      } catch (e) {
        results.push({ slug, status: 'error', error: e.message.substring(0, 100) });
      }
    }

    return results;
  } finally {
    if (browser) await browser.close();
  }
}

// CLI
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  const screenshotOnly = process.argv.includes('--screenshots');

  if (screenshotOnly) {
    const slugs = process.argv.filter(a => !a.startsWith('-') && !a.includes('/') && !a.includes('.') && a !== 'node');
    if (slugs.length === 0) {
      console.error('Provide supplement slugs: node regenerate-and-diff.js --screenshots bacopa-monnieri curcumin');
      process.exit(1);
    }
    screenshotPages(slugs).then(r => console.log(JSON.stringify(r, null, 2))).catch(console.error);
  } else {
    regenerateAllPages({ dryRun }).then(r => {
      console.log(JSON.stringify(r, null, 2));
      if (dryRun) console.log('\n(dry run - no pages regenerated)');
    }).catch(console.error);
  }
}

module.exports = { regenerateAllPages, screenshotPages };
