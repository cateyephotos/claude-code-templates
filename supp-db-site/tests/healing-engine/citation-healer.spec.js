const { test, expect } = require('playwright/test');
const path = require('path');

const HEALER = path.join(__dirname, '..', '..', 'healing-engine', 'healers', 'citation-healer.js');

test.describe('Citation Healer - Offline Checks', () => {
  test('detects duplicate DOIs across files', () => {
    const { findDuplicateDois } = require(HEALER);
    const citations = [
      { file: 'a.js', doi: '10.1234/abc', citationId: 'c1' },
      { file: 'b.js', doi: '10.1234/abc', citationId: 'c2' },
      { file: 'c.js', doi: '10.5678/xyz', citationId: 'c3' },
    ];
    const dupes = findDuplicateDois(citations);
    expect(dupes.length).toBe(1);
    expect(dupes[0].doi).toBe('10.1234/abc');
  });

  test('detects duplicate PMIDs across files', () => {
    const { findDuplicatePmids } = require(HEALER);
    const citations = [
      { file: 'a.js', pmid: '12345', citationId: 'c1' },
      { file: 'b.js', pmid: '12345', citationId: 'c2' },
    ];
    const dupes = findDuplicatePmids(citations);
    expect(dupes.length).toBe(1);
  });

  test('collects all citations from enhanced files', () => {
    const { collectAllCitations } = require(HEALER);
    const citations = collectAllCitations();
    expect(citations.length).toBeGreaterThan(0);
    expect(citations[0]).toHaveProperty('doi');
    expect(citations[0]).toHaveProperty('file');
  });
});

test.describe('Citation Healer - Full Run', () => {
  test('runs offline healing and returns structured result', () => {
    const { healCitationsOffline } = require(HEALER);
    const result = healCitationsOffline();
    expect(result.stage).toBe('citation-healing');
    expect(result.status).toBe('completed');
    expect(result.summary.total).toBeGreaterThan(0);
  });
});
