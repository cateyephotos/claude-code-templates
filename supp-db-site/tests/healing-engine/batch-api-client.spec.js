const { test, expect } = require('playwright/test');
const path = require('path');

const CLIENT = path.join(__dirname, '..', '..', 'healing-engine', 'fixers', 'batch-api-client.js');

test.describe('Batch API Client', () => {
  test('module exports required functions', () => {
    const client = require(CLIENT);
    expect(typeof client.lookupPmidBatch).toBe('function');
    expect(typeof client.lookupDoiCrossref).toBe('function');
    expect(typeof client.verifyCitation).toBe('function');
  });

  test('lookupPmidBatch handles empty array', async () => {
    const { lookupPmidBatch } = require(CLIENT);
    const result = await lookupPmidBatch([]);
    expect(result).toEqual({});
  });

  test('lookupDoiCrossref handles invalid DOI', async () => {
    const { lookupDoiCrossref } = require(CLIENT);
    const result = await lookupDoiCrossref('invalid-doi');
    expect(result).toBeNull();
  });

  test('simpleSimilarity computes correct scores', () => {
    const { simpleSimilarity } = require(CLIENT);
    expect(simpleSimilarity('hello world', 'hello world')).toBe(1.0);
    expect(simpleSimilarity('hello world', 'goodbye moon')).toBe(0);
    expect(simpleSimilarity('the quick brown fox', 'the quick red fox')).toBeGreaterThan(0.5);
    expect(simpleSimilarity('', '')).toBe(0);
    expect(simpleSimilarity(null, 'test')).toBe(0);
  });
});
