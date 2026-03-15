const { test, expect } = require('playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Report Generator', () => {
  test('generates a timestamped JSON report', () => {
    const { generateReport } = require(path.join(__dirname, '..', '..', 'healing-engine', 'reporters', 'report-generator.js'));
    const stageResults = [
      {
        stage: 'test-stage',
        status: 'completed',
        summary: { total: 10, passed: 8, warnings: 1, errors: 1 },
        issues: [{ id: 'issue-0001', severity: 'low', tier: 'auto-fix', category: 'whitespace' }],
        fixes_applied: [{ id: 'issue-0001', action: 'fixed' }],
        errors: [],
      }
    ];
    const report = generateReport(stageResults, { dryRun: true });
    expect(report.summary).toBeDefined();
    expect(report.summary.totalIssuesFound).toBe(1);
    expect(report.summary.autoFixed).toBe(1);
    expect(report.stages).toHaveLength(1);
  });

  test('writes report files when not dry run', () => {
    const { generateReport } = require(path.join(__dirname, '..', '..', 'healing-engine', 'reporters', 'report-generator.js'));
    const stageResults = [
      {
        stage: 'write-test',
        status: 'completed',
        summary: { total: 1, passed: 1, warnings: 0, errors: 0 },
        issues: [],
        fixes_applied: [],
        errors: [],
      }
    ];
    const report = generateReport(stageResults, { dryRun: false });
    expect(report.filePath).toBeDefined();
    expect(fs.existsSync(report.filePath)).toBe(true);
    // Cleanup
    fs.unlinkSync(report.filePath);
    const summaryPath = report.filePath.replace('.json', '-summary.txt');
    if (fs.existsSync(summaryPath)) fs.unlinkSync(summaryPath);
  });
});
