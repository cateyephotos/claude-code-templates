const { test, expect } = require('playwright/test');
const path = require('path');

const UTILS = path.join(__dirname, '..', '..', 'healing-engine', 'utils');

test.describe('DOI Utils', () => {
  test('validates correct DOI format', () => {
    const { isValidDoi } = require(path.join(UTILS, 'doi-utils.js'));
    expect(isValidDoi('10.1016/j.phymed.2026.157915')).toBe(true);
    expect(isValidDoi('10.3390/nu13030868')).toBe(true);
    expect(isValidDoi('not-a-doi')).toBe(false);
    expect(isValidDoi('')).toBe(false);
    expect(isValidDoi(null)).toBe(false);
  });

  test('normalizes DOI format', () => {
    const { normalizeDoi } = require(path.join(UTILS, 'doi-utils.js'));
    expect(normalizeDoi('https://doi.org/10.1016/j.foo')).toBe('10.1016/j.foo');
    expect(normalizeDoi('http://dx.doi.org/10.1016/j.foo')).toBe('10.1016/j.foo');
    expect(normalizeDoi('DOI: 10.1016/j.foo')).toBe('10.1016/j.foo');
    expect(normalizeDoi('  10.1016/j.foo  ')).toBe('10.1016/j.foo');
  });

  test('builds DOI URL', () => {
    const { doiToUrl } = require(path.join(UTILS, 'doi-utils.js'));
    expect(doiToUrl('10.1016/j.foo')).toBe('https://doi.org/10.1016/j.foo');
  });
});

test.describe('PMID Utils', () => {
  test('validates correct PMID format', () => {
    const { isValidPmid } = require(path.join(UTILS, 'pmid-utils.js'));
    expect(isValidPmid('12345678')).toBe(true);
    expect(isValidPmid('1234')).toBe(true);
    expect(isValidPmid('abc')).toBe(false);
    expect(isValidPmid('')).toBe(false);
    expect(isValidPmid(null)).toBe(false);
    expect(isValidPmid(12345)).toBe(true);
  });

  test('normalizes PMID', () => {
    const { normalizePmid } = require(path.join(UTILS, 'pmid-utils.js'));
    expect(normalizePmid(' 12345678 ')).toBe('12345678');
    expect(normalizePmid('PMID: 12345678')).toBe('12345678');
    expect(normalizePmid(12345678)).toBe('12345678');
  });

  test('builds PubMed URL', () => {
    const { pmidToUrl } = require(path.join(UTILS, 'pmid-utils.js'));
    expect(pmidToUrl('12345678')).toBe('https://pubmed.ncbi.nlm.nih.gov/12345678/');
  });
});

test.describe('Logger', () => {
  test('creates structured log entries', () => {
    const { createLogger } = require(path.join(UTILS, 'logger.js'));
    const logger = createLogger('test-stage');
    const entry = logger.info('test message', { key: 'value' });
    expect(entry.stage).toBe('test-stage');
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('test message');
    expect(entry.data.key).toBe('value');
    expect(entry.timestamp).toBeDefined();
  });

  test('logger collects entries', () => {
    const { createLogger } = require(path.join(UTILS, 'logger.js'));
    const logger = createLogger('test');
    logger.info('msg1');
    logger.warn('msg2');
    logger.error('msg3');
    const entries = logger.getEntries();
    expect(entries.length).toBe(3);
    expect(entries[0].level).toBe('info');
    expect(entries[1].level).toBe('warn');
    expect(entries[2].level).toBe('error');
  });
});

test.describe('Schema Utils', () => {
  test('loadEnhancedFile loads a valid file', () => {
    const { loadEnhancedFile } = require(path.join(UTILS, 'schema.js'));
    const fs = require('fs');
    const enhDir = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
    const files = fs.readdirSync(enhDir).filter(f => f.match(/^\d+.*_enhanced\.js$/));
    expect(files.length).toBeGreaterThan(0);
    const data = loadEnhancedFile(path.join(enhDir, files[0]));
    expect(data).not.toBeNull();
    expect(data.citations).toBeDefined();
  });

  test('createIssue builds correct issue object', () => {
    const { createIssue } = require(path.join(UTILS, 'schema.js'));
    const issue = createIssue({
      severity: 'medium',
      category: 'malformed-doi',
      file: 'test.js',
      field: 'citations[0].doi',
      current: 'bad-doi',
      suggested: '10.1234/fixed',
      confidence: 0.90,
      source: 'format-check',
      description: 'DOI format invalid',
    });
    expect(issue.id).toMatch(/^issue-/);
    expect(issue.tier).toBe('fix-and-report');
    expect(issue.severity).toBe('medium');
  });
});
