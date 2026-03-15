const { test, expect } = require('playwright/test');
const path = require('path');

const CHECKER = path.join(__dirname, '..', '..', 'healing-engine', 'healers', 'content-quality.js');

test.describe('Content Quality Checker', () => {
  test('checks citation counts per section', () => {
    const { checkContentQuality } = require(CHECKER);
    const result = checkContentQuality();
    expect(result.stage).toBe('content-quality');
    expect(result.status).toBe('completed');
    expect(result.summary.total).toBeGreaterThanOrEqual(93);
  });

  test('detects supplements with empty sections', () => {
    const { checkSingleSupplement } = require(CHECKER);
    const fakeData = {
      id: 999, name: 'Test',
      evidenceProfile: { overallQuality: 'Tier 4', totalCitations: 0, researchQualityScore: 0, lastEvidenceUpdate: '', evidenceStrength: {}, researchMaturity: '' },
      citations: { mechanisms: [], benefits: [], safety: [], dosage: [] },
    };
    const issues = checkSingleSupplement(fakeData, 'test.js');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(i => i.description.includes('empty'))).toBe(true);
  });
});
