const { test, expect } = require('playwright/test');
const path = require('path');

test.describe('PubMed esearch', () => {
  test('searchPubMed returns PMIDs for a known query', async () => {
    const { searchPubMed } = require(path.join(__dirname, '..', '..', 'healing-engine', 'fixers', 'batch-api-client'));
    const results = await searchPubMed('curcumin anti-inflammatory randomized controlled trial', { maxResults: 5 });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatch(/^\d+$/);
  });

  test('searchPubMed returns empty array for nonsense query', async () => {
    const { searchPubMed } = require(path.join(__dirname, '..', '..', 'healing-engine', 'fixers', 'batch-api-client'));
    const results = await searchPubMed('xyzzy9999notarealquery', { maxResults: 5 });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});
