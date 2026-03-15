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

test.describe('Re-research Engine', () => {
  test('reResearchClaim finds relevant PubMed papers for a specific claim', async () => {
    const { reResearchClaim } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 're-research-supplement'));

    const candidates = await reResearchClaim({
      claimText: 'Curcumin inhibits NF-kB inflammatory pathway',
      supplementName: 'Curcumin',
      section: 'mechanisms',
      maxCandidates: 5
    });

    expect(Array.isArray(candidates)).toBe(true);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]).toHaveProperty('pmid');
    expect(candidates[0]).toHaveProperty('title');
    expect(candidates[0]).toHaveProperty('doi');
    expect(candidates[0]).toHaveProperty('relevanceScore');
    expect(candidates[0].relevanceScore).toBeGreaterThan(0);
  }, 30000);

  test('reResearchSupplement processes all claims for a supplement', async () => {
    const { reResearchSupplement } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 're-research-supplement'));

    const result = await reResearchSupplement('12_phosphatidylserine_enhanced.js', {
      maxCandidatesPerClaim: 3,
      onlyMismatched: true
    });

    expect(result).toBeTruthy();
    expect(result.file).toBe('12_phosphatidylserine_enhanced.js');
    expect(Array.isArray(result.claims)).toBe(true);
    expect(result.claims.length).toBeGreaterThan(0);
  }, 120000);
});
