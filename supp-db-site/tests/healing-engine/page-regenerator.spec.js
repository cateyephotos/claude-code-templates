const { test, expect } = require('playwright/test');
const path = require('path');

const REGEN = path.join(__dirname, '..', '..', 'healing-engine', 'fixers', 'page-regenerator.js');

test.describe('Page Regenerator', () => {
  test('module exports regeneratePages function', () => {
    const { regeneratePages } = require(REGEN);
    expect(typeof regeneratePages).toBe('function');
  });

  test('regeneratePages in dry-run returns list of pages to rebuild', () => {
    const { regeneratePages } = require(REGEN);
    const result = regeneratePages([1, 2], { dryRun: true });
    expect(result.wouldRegenerate).toBeDefined();
    expect(result.wouldRegenerate.length).toBe(2);
  });
});
