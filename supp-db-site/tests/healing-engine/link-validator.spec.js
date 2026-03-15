const { test, expect } = require('playwright/test');
const path = require('path');

const VALIDATOR = path.join(__dirname, '..', '..', 'healing-engine', 'healers', 'link-validator.js');

test.describe('Link Validator', () => {
  test('module exports required functions', () => {
    const { collectExternalLinks, validateLinks } = require(VALIDATOR);
    expect(typeof collectExternalLinks).toBe('function');
    expect(typeof validateLinks).toBe('function');
  });

  test('collects DOI and PMID URLs from enhanced citations', () => {
    const { collectExternalLinks } = require(VALIDATOR);
    const links = collectExternalLinks();
    expect(links.length).toBeGreaterThan(0);
    expect(links.some(l => l.url.includes('doi.org'))).toBe(true);
  });
});
