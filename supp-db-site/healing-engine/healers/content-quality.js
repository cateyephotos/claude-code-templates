'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const { loadEnhancedFile, createIssue, createStageResult } = require('../utils/schema');
const { createLogger } = require('../utils/logger');

function checkSingleSupplement(data, filename) {
  const issues = [];

  if (!data.citations) {
    issues.push(createIssue({
      severity: 'high', category: 'missing-field', file: filename,
      field: 'citations', description: 'No citations object found',
      confidence: 1.0, source: 'quality-check',
    }));
    return issues;
  }

  let emptySections = 0;
  for (const section of config.schema.citationSections) {
    const arr = data.citations[section];
    if (!Array.isArray(arr) || arr.length === 0) {
      emptySections++;
      issues.push(createIssue({
        severity: 'medium', category: 'missing-field', file: filename,
        field: `citations.${section}`,
        description: `Section "${section}" is empty — needs content`,
        confidence: 1.0, source: 'quality-check',
      }));
    } else {
      let evidenceCount = 0;
      for (const group of arr) {
        if (group && Array.isArray(group.evidence)) {
          evidenceCount += group.evidence.length;
        }
      }
      if (evidenceCount < config.quality.minCitationsPerSection) {
        issues.push(createIssue({
          severity: 'low', category: 'missing-field', file: filename,
          field: `citations.${section}`,
          description: `Section "${section}" has only ${evidenceCount} citations (min: ${config.quality.minCitationsPerSection})`,
          confidence: 0.90, source: 'quality-check',
        }));
      }
    }
  }

  if (emptySections > config.quality.maxEmptySections) {
    issues.push(createIssue({
      severity: 'high', category: 'missing-field', file: filename,
      description: `${emptySections} empty sections (max allowed: ${config.quality.maxEmptySections})`,
      confidence: 1.0, source: 'quality-check',
    }));
  }

  if (data.evidenceProfile) {
    if (data.evidenceProfile.totalCitations === 0) {
      issues.push(createIssue({
        severity: 'high', category: 'missing-field', file: filename,
        field: 'evidenceProfile.totalCitations',
        description: 'totalCitations is 0 — no evidence tracked',
        confidence: 1.0, source: 'quality-check',
      }));
    }
    if (data.evidenceProfile.researchQualityScore === 0) {
      issues.push(createIssue({
        severity: 'medium', category: 'missing-field', file: filename,
        field: 'evidenceProfile.researchQualityScore',
        description: 'researchQualityScore is 0',
        confidence: 0.90, source: 'quality-check',
      }));
    }
  }

  return issues;
}

function checkContentQuality(targetId) {
  const logger = createLogger('content-quality');
  const result = createStageResult('content-quality');

  const enhDir = config.paths.enhancedCitations;
  let files = fs.readdirSync(enhDir)
    .filter(f => f.match(/^\d+.*_enhanced\.js$/) && !f.endsWith('.bak'))
    .sort((a, b) => parseInt(a) - parseInt(b));

  if (targetId) {
    files = files.filter(f => parseInt(f) === targetId);
  }

  result.summary.total = files.length;

  for (const file of files) {
    const data = loadEnhancedFile(path.join(enhDir, file));
    if (!data) {
      result.summary.errors++;
      continue;
    }

    const issues = checkSingleSupplement(data, file);
    result.issues.push(...issues);

    if (issues.some(i => i.severity === 'high')) {
      result.summary.errors++;
    } else if (issues.some(i => i.severity === 'medium')) {
      result.summary.warnings++;
    } else {
      result.summary.passed++;
    }
  }

  logger.info(`Quality checked ${files.length} supplements, ${result.issues.length} quality issues`);
  return result;
}

module.exports = { checkContentQuality, checkSingleSupplement };
