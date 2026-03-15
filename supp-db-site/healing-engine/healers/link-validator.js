'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { loadEnhancedFile, createIssue, createStageResult } = require('../utils/schema');
const { doiToUrl } = require('../utils/doi-utils');
const { pmidToUrl } = require('../utils/pmid-utils');
const { createLogger } = require('../utils/logger');

function collectExternalLinks() {
  const enhDir = config.paths.enhancedCitations;
  const files = fs.readdirSync(enhDir)
    .filter(f => f.match(/^\d+.*_enhanced\.js$/) && !f.endsWith('.bak'));

  const links = [];

  for (const file of files) {
    const data = loadEnhancedFile(path.join(enhDir, file));
    if (!data || !data.citations) continue;

    for (const section of config.schema.citationSections) {
      const arr = data.citations[section];
      if (!Array.isArray(arr)) continue;
      for (const group of arr) {
        if (!group || !Array.isArray(group.evidence)) continue;
        for (const item of group.evidence) {
          if (!item) continue;
          if (item.doi) {
            links.push({ url: doiToUrl(item.doi), type: 'doi', file, citationId: item.citationId || '' });
          }
          if (item.pmid) {
            links.push({ url: pmidToUrl(item.pmid), type: 'pmid', file, citationId: item.citationId || '' });
          }
        }
      }
    }
  }

  return links;
}

function checkUrl(url, timeout = 10000) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout, headers: { 'User-Agent': 'SupplementDB-LinkChecker/1.0' } }, (res) => {
      resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on('error', (e) => resolve({ url, status: 0, ok: false, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 0, ok: false, error: 'Timeout' }); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function validateLinks(options = {}) {
  const logger = createLogger('link-validation');
  const result = createStageResult('link-validation');

  const links = collectExternalLinks();
  const uniqueLinks = [...new Map(links.map(l => [l.url, l])).values()];

  if (options.limit) uniqueLinks.splice(options.limit);
  result.summary.total = uniqueLinks.length;

  const batchSize = options.concurrency || 5;
  const delay = options.delay || 500;

  for (let i = 0; i < uniqueLinks.length; i += batchSize) {
    const batch = uniqueLinks.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(l => checkUrl(l.url)));

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      const link = batch[j];
      if (r.ok) {
        result.summary.passed++;
      } else if (r.status === 301 || r.status === 302) {
        result.issues.push(createIssue({
          severity: 'low', category: 'stale-link',
          file: link.file, field: `${link.citationId}.${link.type}`,
          current: r.url, description: `Link redirects (${r.status})`,
          confidence: 0.85, source: 'link-check',
        }));
        result.summary.warnings++;
      } else {
        result.issues.push(createIssue({
          severity: 'medium', category: 'stale-link',
          file: link.file, field: `${link.citationId}.${link.type}`,
          current: r.url, description: `Dead link: HTTP ${r.status}${r.error ? ` (${r.error})` : ''}`,
          confidence: 0.80, source: 'link-check',
        }));
        result.summary.errors++;
      }
    }

    if (i + batchSize < uniqueLinks.length) await sleep(delay);
  }

  logger.info(`Validated ${uniqueLinks.length} links, ${result.issues.length} issues`);
  return result;
}

module.exports = { collectExternalLinks, validateLinks, checkUrl };
