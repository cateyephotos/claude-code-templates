const { test, expect } = require('playwright/test');
const path = require('path');

test.describe('Regenerate and Diff', () => {
  test('regenerateAllPages calls all generators without error in dry-run', async () => {
    const { regenerateAllPages } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 'regenerate-and-diff'));

    const result = await regenerateAllPages({ dryRun: true });
    expect(result).toBeTruthy();
    expect(result.generators).toBeGreaterThan(0);
    expect(result.errors).toEqual([]);
  }, 30000);
});
