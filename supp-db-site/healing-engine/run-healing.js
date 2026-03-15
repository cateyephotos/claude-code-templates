#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { validateScrapedJson, validateEnhancedCitations } = require('./healers/data-validator');
const { healCitationsOffline } = require('./healers/citation-healer');
const { runSiteCheck } = require('./healers/site-checker');
const { checkContentQuality } = require('./healers/content-quality');
const { applyFixes, filterByTier } = require('./fixers/auto-fixer');
const { generateReport } = require('./reporters/report-generator');
const { createLogger } = require('./utils/logger');
const { resetIssueCounter } = require('./utils/schema');
const config = require('./config');

const logger = createLogger('orchestrator');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_BROWSER = args.includes('--skip-browser');
const SKIP_LINKS = args.includes('--skip-links');
const JSON_OUTPUT = args.includes('--json');
const STAGE = (() => {
  const i = args.indexOf('--stage');
  return i >= 0 ? args[i + 1] : null;
})();
const TARGET_FILE = (() => {
  const i = args.indexOf('--file');
  return i >= 0 ? args[i + 1] : null;
})();

async function main() {
  resetIssueCounter();
  const stageResults = [];
  const healerFixes = [];

  logger.info('=== Healing Engine Starting ===');
  logger.info(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);

  // Stage 1-2: Data Validation
  if (!STAGE || STAGE === 'data-validation') {
    if (TARGET_FILE) {
      const filePath = path.resolve(TARGET_FILE);
      if (fs.existsSync(filePath)) {
        logger.info(`Stage 1: Validating scraped JSON: ${path.basename(filePath)}`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const result = validateScrapedJson(data, path.basename(filePath));
        stageResults.push(result);
        logger.info(`Stage 1 (scraped): ${result.issues.length} issues`);
      }
    }

    logger.info('Stage 2: Validating enhanced citations...');
    const enhResult = validateEnhancedCitations();
    stageResults.push(enhResult);
    logger.info(`Stage 2 (enhanced): ${enhResult.issues.length} issues`);
  }

  // Stage 3: Citation healing (offline)
  if (!STAGE || STAGE === 'citation-healing') {
    logger.info('Stage 3: Citation healing (offline)...');
    const citResult = healCitationsOffline();
    stageResults.push(citResult);
    logger.info(`Stage 3 (citations): ${citResult.issues.length} issues`);
  }

  // Stage 4: Site consistency check
  if (!STAGE || STAGE === 'site-check') {
    logger.info('Stage 4: Site consistency check...');
    const siteResult = runSiteCheck();
    stageResults.push(siteResult);
    logger.info(`Stage 4 (site): ${siteResult.issues.length} issues`);
  }

  // Stage 5: Browser checks (requires Playwright — skippable)
  if (!SKIP_BROWSER && (!STAGE || STAGE === 'browser-check')) {
    logger.info('Stage 5 (browser): Skipped in CLI mode — use Claude orchestration for Playwright checks');
  }

  // Stage 6: Link validation (slow — skippable)
  if (!SKIP_LINKS && (!STAGE || STAGE === 'link-validation')) {
    logger.info('Stage 6: Link validation...');
    const { validateLinks } = require('./healers/link-validator');
    const linkResult = await validateLinks({ limit: 50, concurrency: 3 });
    stageResults.push(linkResult);
    logger.info(`Stage 6 (links): ${linkResult.issues.length} issues`);
  }

  // Stage 7: Content quality
  if (!STAGE || STAGE === 'content-quality') {
    logger.info('Stage 7: Content quality check...');
    const qualityResult = checkContentQuality();
    stageResults.push(qualityResult);
    logger.info(`Stage 7 (quality): ${qualityResult.issues.length} issues`);
  }

  // Apply auto-fixes
  const allIssues = stageResults.flatMap(s => s.issues);
  const autoFixable = filterByTier(allIssues, 'auto-fix');

  if (autoFixable.length > 0) {
    logger.info(`Applying ${autoFixable.length} auto-fixes (dry-run: ${DRY_RUN})...`);
    const fixResult = applyFixes(allIssues, { dryRun: DRY_RUN, tier: 'auto-fix' });
    logger.info(`Auto-fixed: ${fixResult.applied.length}, skipped: ${fixResult.skipped.length}`);

    for (const stage of stageResults) {
      stage.fixes_applied = fixResult.applied.filter(f =>
        stage.issues.some(i => i.id === f.id)
      );
    }
  }

  // Generate report
  const report = generateReport(stageResults, { dryRun: DRY_RUN, healerFixes });

  // Print summary
  console.log('\n=== Healing Summary ===');
  console.log(`Issues found: ${report.summary.totalIssuesFound}`);
  console.log(`Auto-fixed: ${report.summary.autoFixed}`);
  console.log(`Fixed & reported: ${report.summary.fixedAndReported}`);
  console.log(`Needs review: ${report.summary.needsReview}`);
  console.log(`Unfixable: ${report.summary.unfixable}`);
  if (report.filePath) {
    console.log(`Report saved: ${report.filePath}`);
  }

  // Output JSON for Claude to parse
  if (JSON_OUTPUT) {
    console.log('\n---JSON_OUTPUT_START---');
    console.log(JSON.stringify(report, null, 2));
    console.log('---JSON_OUTPUT_END---');
  }

  return report;
}

main().catch(e => {
  console.error('Healing engine error:', e);
  process.exit(1);
});
