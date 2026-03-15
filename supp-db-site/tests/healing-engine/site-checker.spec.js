const { test, expect } = require('playwright/test');
const path = require('path');

const CHECKER = path.join(__dirname, '..', '..', 'healing-engine', 'healers', 'site-checker.js');

test.describe('Site Checker - Internal Consistency', () => {
  test('checks supplements.js entries have HTML pages', () => {
    const { checkSupplementPages } = require(CHECKER);
    const result = checkSupplementPages();
    expect(result.stage).toBe('site-consistency');
    expect(result.summary.total).toBeGreaterThanOrEqual(93);
  });

  test('checks enhanced citation files have supplements.js entries', () => {
    const { checkOrphanedFiles } = require(CHECKER);
    const result = checkOrphanedFiles();
    expect(result.stage).toBe('orphan-check');
    expect(result.status).toBe('completed');
  });

  test('runs full site check', () => {
    const { runSiteCheck } = require(CHECKER);
    const result = runSiteCheck();
    expect(result.stage).toBe('site-check');
    expect(result.status).toBe('completed');
  });
});
