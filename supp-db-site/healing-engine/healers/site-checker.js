'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const { loadSupplementsJs, loadEnhancedFile, createIssue, createStageResult } = require('../utils/schema');
const { createLogger } = require('../utils/logger');

function checkSupplementPages() {
  const logger = createLogger('site-consistency');
  const result = createStageResult('site-consistency');

  const db = loadSupplementsJs();
  if (!db || !db.supplements) {
    result.status = 'failed';
    result.errors.push({ message: 'Could not load supplements.js' });
    return result;
  }

  const supplements = db.supplements;
  result.summary.total = supplements.length;
  const pagesDir = config.paths.supplementPages;

  for (const supp of supplements) {
    // Use same slugify logic as parse-data.js: replace all non-alphanumeric sequences with dashes
    const slug = supp.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const possibleFiles = [
      `${slug}.html`,
    ];

    const found = possibleFiles.some(f => fs.existsSync(path.join(pagesDir, f)));

    if (!found) {
      result.issues.push(createIssue({
        severity: 'high', category: 'missing-field',
        file: `supplements-new/${slug}.html`,
        description: `Supplement "${supp.name}" (ID ${supp.id}) has no HTML page`,
        confidence: 1.0, source: 'file-check',
      }));
      result.summary.errors++;
    } else {
      result.summary.passed++;
    }
  }

  const enhDir = config.paths.enhancedCitations;
  for (const supp of supplements) {
    const enhFiles = fs.readdirSync(enhDir)
      .filter(f => f.startsWith(`${supp.id}_`) && f.endsWith('_enhanced.js'));
    if (enhFiles.length === 0) {
      result.issues.push(createIssue({
        severity: 'high', category: 'missing-field',
        file: `enhanced_citations/${supp.id}_*_enhanced.js`,
        description: `No enhanced citation file for "${supp.name}" (ID ${supp.id})`,
        confidence: 1.0, source: 'file-check',
      }));
      result.summary.errors++;
    }
  }

  logger.info(`Checked ${supplements.length} supplements, ${result.issues.length} consistency issues`);
  return result;
}

function checkOrphanedFiles() {
  const logger = createLogger('orphan-check');
  const result = createStageResult('orphan-check');

  const db = loadSupplementsJs();
  if (!db || !db.supplements) {
    result.status = 'failed';
    return result;
  }

  const supplementIds = new Set(db.supplements.map(s => s.id));
  const enhDir = config.paths.enhancedCitations;
  const enhFiles = fs.readdirSync(enhDir)
    .filter(f => f.match(/^\d+.*_enhanced\.js$/) && !f.endsWith('.bak'));

  result.summary.total = enhFiles.length;

  for (const file of enhFiles) {
    const id = parseInt(file);
    if (!supplementIds.has(id)) {
      result.issues.push(createIssue({
        severity: 'medium', category: 'missing-field',
        file: `enhanced_citations/${file}`,
        description: `Enhanced citation file for ID ${id} has no matching supplement in supplements.js`,
        confidence: 1.0, source: 'orphan-check',
      }));
      result.summary.warnings++;
    } else {
      result.summary.passed++;
    }
  }

  logger.info(`Checked ${enhFiles.length} enhanced files, ${result.issues.length} orphans`);
  return result;
}

function runSiteCheck() {
  const result = createStageResult('site-check');
  const pageResult = checkSupplementPages();
  const orphanResult = checkOrphanedFiles();

  result.summary.total = pageResult.summary.total + orphanResult.summary.total;
  result.summary.passed = pageResult.summary.passed + orphanResult.summary.passed;
  result.summary.warnings = pageResult.summary.warnings + orphanResult.summary.warnings;
  result.summary.errors = pageResult.summary.errors + orphanResult.summary.errors;
  result.issues = [...pageResult.issues, ...orphanResult.issues];
  result.errors = [...pageResult.errors, ...orphanResult.errors];

  return result;
}

module.exports = { checkSupplementPages, checkOrphanedFiles, runSiteCheck };
