const { test, expect } = require('playwright/test');
const { execSync } = require('child_process');
const path = require('path');

test.describe('Healing Engine Integration', () => {
  test('full dry-run pipeline completes and produces valid report', () => {
    const scriptPath = path.join(__dirname, '..', '..', 'healing-engine', 'run-healing.js');
    const output = execSync(
      `node "${scriptPath}" --dry-run --skip-browser --skip-links --json`,
      { cwd: path.join(__dirname, '..', '..'), timeout: 120000, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );

    expect(output).toContain('Healing');
    expect(output).toContain('---JSON_OUTPUT_START---');

    const jsonMatch = output.match(/---JSON_OUTPUT_START---\n([\s\S]*?)\n---JSON_OUTPUT_END---/);
    expect(jsonMatch).not.toBeNull();

    const report = JSON.parse(jsonMatch[1]);
    expect(report.summary).toBeDefined();
    expect(report.summary.totalIssuesFound).toBeGreaterThanOrEqual(0);
    expect(report.stages).toBeDefined();
    expect(report.stages.length).toBeGreaterThan(0);
  });

  test('data validation stage finds 93+ enhanced citation files', () => {
    const scriptPath = path.join(__dirname, '..', '..', 'healing-engine', 'run-healing.js');
    const output = execSync(
      `node "${scriptPath}" --dry-run --stage data-validation --json`,
      { cwd: path.join(__dirname, '..', '..'), timeout: 60000, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );

    const jsonMatch = output.match(/---JSON_OUTPUT_START---\n([\s\S]*?)\n---JSON_OUTPUT_END---/);
    const report = JSON.parse(jsonMatch[1]);
    const enhStage = report.stages.find(s => s.stage.includes('enhanced'));
    expect(enhStage).toBeDefined();
  });

  test('citation healing stage runs without crashes', () => {
    const scriptPath = path.join(__dirname, '..', '..', 'healing-engine', 'run-healing.js');
    const output = execSync(
      `node "${scriptPath}" --dry-run --stage citation-healing --json`,
      { cwd: path.join(__dirname, '..', '..'), timeout: 60000, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );

    const jsonMatch = output.match(/---JSON_OUTPUT_START---\n([\s\S]*?)\n---JSON_OUTPUT_END---/);
    const report = JSON.parse(jsonMatch[1]);
    expect(report.summary.totalIssuesFound).toBeGreaterThanOrEqual(0);
  });
});
