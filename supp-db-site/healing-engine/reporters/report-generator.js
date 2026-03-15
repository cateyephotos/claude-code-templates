'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');

function generateReport(stageResults, options = {}) {
  const { dryRun = false } = options;
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const allIssues = stageResults.flatMap(s => s.issues || []);
  const allFixes = stageResults.flatMap(s => s.fixes_applied || []);
  const allErrors = stageResults.flatMap(s => s.errors || []);

  const autoFixed = allFixes.filter(f => {
    const issue = allIssues.find(i => i.id === f.id);
    return issue && issue.tier === 'auto-fix';
  }).length;

  const fixedAndReported = allFixes.filter(f => {
    const issue = allIssues.find(i => i.id === f.id);
    return issue && issue.tier === 'fix-and-report';
  }).length;

  const needsReview = allIssues.filter(i =>
    i.tier === 'ask-before-fixing' && !allFixes.find(f => f.id === i.id)
  ).length;

  const unfixable = allIssues.filter(i =>
    !allFixes.find(f => f.id === i.id) && i.tier !== 'ask-before-fixing'
  ).length;

  const report = {
    timestamp: now.toISOString(),
    summary: {
      totalIssuesFound: allIssues.length,
      autoFixed,
      fixedAndReported,
      needsReview,
      unfixable,
      totalErrors: allErrors.length,
      stagesRun: stageResults.length,
      stagesPassed: stageResults.filter(s => s.status === 'completed').length,
      stagesFailed: stageResults.filter(s => s.status === 'failed').length,
    },
    stages: stageResults.map(s => ({
      stage: s.stage,
      status: s.status,
      summary: s.summary,
      issueCount: (s.issues || []).length,
      fixCount: (s.fixes_applied || []).length,
      errorCount: (s.errors || []).length,
    })),
    issues: allIssues,
    fixes: allFixes,
    errors: allErrors,
    healerFixes: options.healerFixes || [],
  };

  if (!dryRun) {
    const reportDir = config.paths.healingReports;
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const jsonPath = path.join(reportDir, `${timestamp}_heal-report.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    report.filePath = jsonPath;

    const summaryPath = jsonPath.replace('.json', '-summary.txt');
    const summaryText = [
      `=== Healing Report ${now.toISOString()} ===`,
      `Issues found: ${report.summary.totalIssuesFound}`,
      `Auto-fixed: ${report.summary.autoFixed}`,
      `Fixed & reported: ${report.summary.fixedAndReported}`,
      `Needs review: ${report.summary.needsReview}`,
      `Unfixable: ${report.summary.unfixable}`,
      `Errors: ${report.summary.totalErrors}`,
      `Stages: ${report.summary.stagesRun} run, ${report.summary.stagesPassed} passed, ${report.summary.stagesFailed} failed`,
      '',
      ...stageResults.map(s => `  [${s.status === 'completed' ? 'OK' : 'FAIL'}] ${s.stage}: ${(s.issues || []).length} issues, ${(s.fixes_applied || []).length} fixes`),
    ].join('\n');
    fs.writeFileSync(summaryPath, summaryText);
  }

  return report;
}

module.exports = { generateReport };
