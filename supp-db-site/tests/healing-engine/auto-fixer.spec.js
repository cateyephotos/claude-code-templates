const { test, expect } = require('playwright/test');
const path = require('path');

const FIXER = path.join(__dirname, '..', '..', 'healing-engine', 'fixers', 'auto-fixer.js');

test.describe('Auto Fixer', () => {
  test('exports applyFixes function', () => {
    const { applyFixes } = require(FIXER);
    expect(typeof applyFixes).toBe('function');
  });

  test('filters issues by tier correctly', () => {
    const { filterByTier } = require(FIXER);
    const issues = [
      { id: '1', tier: 'auto-fix', category: 'whitespace' },
      { id: '2', tier: 'fix-and-report', category: 'malformed-doi' },
      { id: '3', tier: 'ask-before-fixing', category: 'remove-citation' },
    ];
    expect(filterByTier(issues, 'auto-fix').length).toBe(1);
    expect(filterByTier(issues, 'fix-and-report').length).toBe(1);
    expect(filterByTier(issues, 'ask-before-fixing').length).toBe(1);
  });

  test('applies DOI normalization fix in dry-run mode', () => {
    const { applyFixes } = require(FIXER);
    const issues = [{
      id: 'issue-0001', tier: 'auto-fix', category: 'doi-prefix-case',
      file: 'test.js', field: 'doi',
      current: 'https://doi.org/10.1234/abc', suggested: '10.1234/abc',
      confidence: 1.0,
    }];
    const result = applyFixes(issues, { dryRun: true });
    expect(result.wouldFix.length).toBe(1);
    expect(result.applied.length).toBe(0);
  });
});
