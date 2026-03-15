'use strict';

const { createIssue, createStageResult } = require('../utils/schema');
const { createLogger } = require('../utils/logger');
const config = require('../config');

async function checkPage(page, baseUrl, urlPath) {
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({ url: response.url(), status: response.status() });
    }
  });

  const fullUrl = `${baseUrl}${urlPath}`;
  let status = 200;

  try {
    const response = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
    status = response ? response.status() : 0;
  } catch (e) {
    status = 0;
    consoleErrors.push(`Navigation error: ${e.message}`);
  }

  const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '').catch(() => '');
  const hasContent = bodyText.length > 50;

  const brokenImages = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
  }).catch(() => []);

  return {
    url: fullUrl,
    status,
    consoleErrors,
    networkErrors,
    hasContent,
    brokenImages,
    bodyLength: bodyText.length,
  };
}

async function runBrowserChecks(page, options = {}) {
  const logger = createLogger('browser-check');
  const result = createStageResult('browser-check');
  const baseUrl = options.baseUrl || 'http://localhost:8080';

  const fs = require('fs');
  const path = require('path');
  const pagesDir = config.paths.supplementPages;

  let pages = [];
  if (fs.existsSync(pagesDir)) {
    pages = fs.readdirSync(pagesDir)
      .filter(f => f.endsWith('.html'))
      .map(f => `/supplements-new/${f}`);
  }

  const keyPages = ['/', '/guides/', '/evidence/'];
  const allPages = [...keyPages, ...pages];

  if (options.limit) {
    allPages.splice(options.limit);
  }

  result.summary.total = allPages.length;

  for (const urlPath of allPages) {
    const pageResult = await checkPage(page, baseUrl, urlPath);

    if (pageResult.status >= 400 || pageResult.status === 0) {
      result.issues.push(createIssue({
        severity: 'high', category: 'missing-field',
        file: urlPath, current: String(pageResult.status),
        description: `Page returned HTTP ${pageResult.status}`,
        confidence: 1.0, source: 'browser-check',
      }));
      result.summary.errors++;
    } else if (pageResult.consoleErrors.length > 0) {
      result.issues.push(createIssue({
        severity: 'medium', category: 'missing-field',
        file: urlPath, current: pageResult.consoleErrors.join('; '),
        description: `${pageResult.consoleErrors.length} console errors on page`,
        confidence: 0.90, source: 'browser-check',
      }));
      result.summary.warnings++;
    } else if (!pageResult.hasContent) {
      result.issues.push(createIssue({
        severity: 'high', category: 'missing-field',
        file: urlPath, description: 'Page has no meaningful content (body < 50 chars)',
        confidence: 0.95, source: 'browser-check',
      }));
      result.summary.errors++;
    } else if (pageResult.brokenImages.length > 0) {
      result.issues.push(createIssue({
        severity: 'medium', category: 'stale-link',
        file: urlPath, current: pageResult.brokenImages.join(', '),
        description: `${pageResult.brokenImages.length} broken images`,
        confidence: 0.95, source: 'browser-check',
      }));
      result.summary.warnings++;
    } else {
      result.summary.passed++;
    }
  }

  logger.info(`Browser checked ${allPages.length} pages, ${result.issues.length} issues`);
  return result;
}

module.exports = { checkPage, runBrowserChecks };
