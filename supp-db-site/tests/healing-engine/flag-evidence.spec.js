const { test, expect } = require('playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Flag Evidence Quality', () => {
  test('flagSingleFile produces quality sidecar with expected structure', async () => {
    const { flagSingleFile } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 'flag-evidence-quality'));

    // Use melatonin (has titles, can verify)
    const result = await flagSingleFile('8_melatonin_enhanced.js');
    expect(result).toBeTruthy();
    expect(result.file).toBe('8_melatonin_enhanced.js');
    expect(result.totalEvidence).toBeGreaterThan(0);
    expect(typeof result.verified).toBe('number');
    expect(typeof result.mismatched).toBe('number');
    expect(typeof result.unverifiable).toBe('number');
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items[0]).toHaveProperty('status');
    expect(['verified', 'mismatched', 'questionable', 'unverifiable', 'no_pmid', 'pmid_not_found']).toContain(result.items[0].status);
  }, 60000);

  test('flagSingleFile handles title-less files correctly', async () => {
    const { flagSingleFile } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 'flag-evidence-quality'));

    // Rhodiola has no titles — all should be 'unverifiable'
    const result = await flagSingleFile('10_rhodiola_rosea_enhanced.js');
    expect(result).toBeTruthy();
    expect(result.unverifiable).toBe(result.totalEvidence);
  }, 60000);
});
