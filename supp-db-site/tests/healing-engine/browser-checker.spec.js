const { test, expect } = require('playwright/test');
const path = require('path');

const CHECKER = path.join(__dirname, '..', '..', 'healing-engine', 'healers', 'browser-checker.js');

test.describe('Browser Checker', () => {
  test('module exports runBrowserChecks function', () => {
    const { runBrowserChecks } = require(CHECKER);
    expect(typeof runBrowserChecks).toBe('function');
  });

  test('module exports checkPage function', () => {
    const { checkPage } = require(CHECKER);
    expect(typeof checkPage).toBe('function');
  });
});
