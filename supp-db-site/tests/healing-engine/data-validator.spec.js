const { test, expect } = require('playwright/test');
const path = require('path');
const fs = require('fs');

const HEALER = path.join(__dirname, '..', '..', 'healing-engine', 'healers', 'data-validator.js');
const SCRAPED_DIR = path.join(__dirname, '..', '..', '..');

test.describe('Data Validator - Scraped JSON', () => {
  test('validates a well-formed scraped JSON file', () => {
    const { validateScrapedJson } = require(HEALER);
    const files = fs.readdirSync(SCRAPED_DIR).filter(f => f.endsWith('_Comprehensive_Research_Report.json'));
    expect(files.length).toBeGreaterThan(0);
    const data = JSON.parse(fs.readFileSync(path.join(SCRAPED_DIR, files[0]), 'utf8'));
    const result = validateScrapedJson(data, files[0]);
    expect(result.stage).toBe('data-validation-scraped');
    expect(result.status).toBe('completed');
    expect(result.summary.total).toBeGreaterThan(0);
  });

  test('detects missing required fields in findings', () => {
    const { validateScrapedJson } = require(HEALER);
    const badData = {
      search_summary: { queries_used: [], databases_searched: [], total_papers_reviewed: 0, papers_selected: 0 },
      findings: [
        { category: 'mechanisms', citation: 'Test', doi: '', type: '', key_findings: [] }
      ]
    };
    const result = validateScrapedJson(badData, 'test.json');
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

test.describe('Data Validator - Enhanced Citations', () => {
  test('validates existing enhanced citation files', () => {
    const { validateEnhancedCitations } = require(HEALER);
    const result = validateEnhancedCitations();
    expect(result.stage).toBe('data-validation-enhanced');
    expect(result.status).toBe('completed');
    expect(result.summary.total).toBeGreaterThanOrEqual(93);
  });

  test('detects Pattern A violations', () => {
    const { validateEnhancedCitations } = require(HEALER);
    const result = validateEnhancedCitations();
    const patternA = result.issues.filter(i => i.category === 'pattern-a-evidence');
    expect(patternA.length).toBe(0);
  });
});
