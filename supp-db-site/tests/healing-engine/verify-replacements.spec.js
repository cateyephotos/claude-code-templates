const { test, expect } = require('playwright/test');
const path = require('path');

test.describe('Verify Replacements', () => {
  test('buildReplacementPlan filters by relevance threshold', () => {
    const { buildReplacementPlan } = require(path.join(__dirname, '..', '..', 'healing-engine', 'scripts', 'verify-replacements'));

    const reResearchResult = {
      file: 'test_enhanced.js',
      supplementName: 'Test',
      claims: [
        {
          section: 'mechanisms', citationIdx: 0,
          claimText: 'Test mechanism',
          currentEvidence: [{ pmid: '111', doi: '', title: '' }],
          candidates: [
            { pmid: '999', title: 'Matching paper', doi: '10.1234/test', relevanceScore: 0.85, authors: ['Smith J'], year: 2023, journal: 'Nature' },
            { pmid: '888', title: 'Weak match', doi: '10.1234/weak', relevanceScore: 0.3, authors: ['Jones A'], year: 2020, journal: 'Other' }
          ]
        },
        {
          section: 'benefits', citationIdx: 0,
          claimText: 'Test benefit',
          currentEvidence: [{ pmid: '222', doi: '10.existing/doi', title: 'Already good' }],
          candidates: [
            { pmid: '777', title: 'Low relevance', doi: '10.1234/low', relevanceScore: 0.2, authors: ['Doe B'], year: 2019, journal: 'J' }
          ]
        }
      ]
    };

    const plan = buildReplacementPlan(reResearchResult, { minRelevance: 0.5 });

    // Only the first claim should have a replacement (0.85 > 0.5)
    expect(plan.replacements.length).toBe(1);
    expect(plan.replacements[0].newPmid).toBe('999');
    expect(plan.skipped.length).toBe(1); // second claim skipped (0.2 < 0.5)
  });
});
