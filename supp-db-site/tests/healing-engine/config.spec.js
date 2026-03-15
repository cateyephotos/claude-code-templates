const { test, expect } = require('playwright/test');
const path = require('path');

test.describe('Healing Engine Config', () => {
  test('config loads and has required tier definitions', () => {
    const config = require(path.join(__dirname, '..', '..', 'healing-engine', 'config.js'));
    expect(config.tiers).toBeDefined();
    expect(config.tiers.autoFix).toBeDefined();
    expect(config.tiers.fixAndReport).toBeDefined();
    expect(config.tiers.askBeforeFixing).toBeDefined();
    expect(config.tiers.autoFix.minConfidence).toBeGreaterThanOrEqual(0.95);
  });

  test('config has API settings', () => {
    const config = require(path.join(__dirname, '..', '..', 'healing-engine', 'config.js'));
    expect(config.apis.pubmed.baseUrl).toContain('eutils.ncbi.nlm.nih.gov');
    expect(config.apis.crossref.baseUrl).toContain('api.crossref.org');
    expect(config.apis.pubmed.rateLimit).toBeGreaterThan(0);
  });

  test('config has quality thresholds', () => {
    const config = require(path.join(__dirname, '..', '..', 'healing-engine', 'config.js'));
    expect(config.quality.minCitationsPerSection).toBeGreaterThanOrEqual(1);
    expect(config.quality.maxEmptySections).toBe(0);
  });

  test('config has correct project paths', () => {
    const config = require(path.join(__dirname, '..', '..', 'healing-engine', 'config.js'));
    const fs = require('fs');
    expect(fs.existsSync(config.paths.enhancedCitations)).toBe(true);
    expect(fs.existsSync(config.paths.dataDir)).toBe(true);
  });
});
