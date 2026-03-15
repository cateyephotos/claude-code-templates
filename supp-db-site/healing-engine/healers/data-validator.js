'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const { loadEnhancedFile, createIssue, createStageResult } = require('../utils/schema');
const { isValidDoi, normalizeDoi } = require('../utils/doi-utils');
const { isValidPmid } = require('../utils/pmid-utils');
const { createLogger } = require('../utils/logger');

function validateScrapedJson(data, filename) {
  const logger = createLogger('data-validation-scraped');
  const result = createStageResult('data-validation-scraped');

  if (!data.search_summary) {
    result.issues.push(createIssue({
      severity: 'high', category: 'missing-field', file: filename,
      field: 'search_summary', description: 'Missing search_summary object',
      confidence: 1.0, source: 'structure-check',
    }));
  }

  if (!Array.isArray(data.findings) || data.findings.length === 0) {
    result.issues.push(createIssue({
      severity: 'high', category: 'missing-field', file: filename,
      field: 'findings', description: 'Missing or empty findings array',
      confidence: 1.0, source: 'structure-check',
    }));
    result.summary.total = 1;
    result.summary.errors = 1;
    return result;
  }

  result.summary.total = data.findings.length;

  for (let i = 0; i < data.findings.length; i++) {
    const finding = data.findings[i];
    const prefix = `findings[${i}]`;

    for (const field of config.scraped.findingRequired) {
      if (!finding[field] || (typeof finding[field] === 'string' && finding[field].trim() === '')) {
        result.issues.push(createIssue({
          severity: 'medium', category: 'missing-field', file: filename,
          field: `${prefix}.${field}`, current: String(finding[field] || ''),
          description: `Missing required field: ${field}`,
          confidence: 1.0, source: 'structure-check',
        }));
        result.summary.errors++;
      }
    }

    if (finding.doi) {
      const normalized = normalizeDoi(finding.doi);
      if (!isValidDoi(normalized)) {
        result.issues.push(createIssue({
          severity: 'medium', category: 'malformed-doi', file: filename,
          field: `${prefix}.doi`, current: finding.doi,
          description: 'DOI format does not match expected pattern 10.xxxx/xxxx',
          confidence: 0.95, source: 'format-check',
        }));
        result.summary.warnings++;
      } else if (normalized !== finding.doi) {
        result.issues.push(createIssue({
          severity: 'low', category: 'doi-prefix-case', file: filename,
          field: `${prefix}.doi`, current: finding.doi, suggested: normalized,
          description: 'DOI needs normalization (URL prefix or whitespace)',
          confidence: 1.0, source: 'format-check',
        }));
      }
    }

    if (finding.pmid && !isValidPmid(finding.pmid)) {
      result.issues.push(createIssue({
        severity: 'medium', category: 'missing-pmid', file: filename,
        field: `${prefix}.pmid`, current: String(finding.pmid),
        description: 'PMID format invalid (should be numeric)',
        confidence: 0.95, source: 'format-check',
      }));
      result.summary.warnings++;
    }

    if (!Array.isArray(finding.key_findings) || finding.key_findings.length === 0) {
      result.issues.push(createIssue({
        severity: 'medium', category: 'missing-field', file: filename,
        field: `${prefix}.key_findings`,
        description: 'key_findings should be a non-empty array',
        confidence: 1.0, source: 'structure-check',
      }));
      result.summary.warnings++;
    }

    if (finding.quality_indicators) {
      if (typeof finding.quality_indicators.peer_reviewed !== 'boolean') {
        result.issues.push(createIssue({
          severity: 'low', category: 'formatting', file: filename,
          field: `${prefix}.quality_indicators.peer_reviewed`,
          description: 'peer_reviewed should be boolean',
          confidence: 0.99, source: 'type-check',
        }));
      }
    }

    if (!result.issues.some(i => i.field.startsWith(prefix) && i.severity !== 'low')) {
      result.summary.passed++;
    }
  }

  logger.info(`Validated ${result.summary.total} findings, ${result.issues.length} issues found`);
  return result;
}

function validateEnhancedCitations(targetId) {
  const logger = createLogger('data-validation-enhanced');
  const result = createStageResult('data-validation-enhanced');

  const enhDir = config.paths.enhancedCitations;
  let files = fs.readdirSync(enhDir)
    .filter(f => f.match(/^\d+.*_enhanced\.js$/) && !f.endsWith('.bak'))
    .sort((a, b) => parseInt(a) - parseInt(b));

  if (targetId) {
    files = files.filter(f => parseInt(f) === targetId);
  }

  result.summary.total = files.length;

  for (const file of files) {
    const filePath = path.join(enhDir, file);
    const data = loadEnhancedFile(filePath);

    if (!data) {
      result.issues.push(createIssue({
        severity: 'high', category: 'missing-field', file,
        description: 'File failed to load/parse',
        confidence: 1.0, source: 'load-check',
      }));
      result.summary.errors++;
      continue;
    }

    for (const field of config.schema.topLevelRequired) {
      const aliases = field === 'id' ? ['id', 'supplementId'] : field === 'name' ? ['name', 'supplementName'] : [field];
      const found = aliases.some(a => data[a] !== undefined && data[a] !== null);
      if (!found) {
        result.issues.push(createIssue({
          severity: 'high', category: 'missing-field', file,
          field, description: `Missing required top-level field: ${field}`,
          confidence: 1.0, source: 'schema-check',
        }));
        result.summary.errors++;
      }
    }

    if (data.evidenceProfile) {
      for (const field of config.schema.evidenceProfileRequired) {
        if (data.evidenceProfile[field] === undefined) {
          result.issues.push(createIssue({
            severity: 'medium', category: 'missing-field', file,
            field: `evidenceProfile.${field}`,
            description: `Missing evidenceProfile field: ${field}`,
            confidence: 1.0, source: 'schema-check',
          }));
          result.summary.warnings++;
        }
      }
    }

    if (data.citations) {
      for (const section of config.schema.citationSections) {
        const arr = data.citations[section];
        if (!Array.isArray(arr) || arr.length === 0) continue;

        for (let g = 0; g < arr.length; g++) {
          const group = arr[g];
          if (!group || typeof group !== 'object') continue;

          if (typeof group.evidence === 'string') {
            result.issues.push(createIssue({
              severity: 'high', category: 'pattern-a-evidence', file,
              field: `citations.${section}[${g}].evidence`,
              current: 'string', suggested: 'array',
              description: 'Pattern A detected: evidence is a string, should be nested array',
              confidence: 1.0, source: 'pattern-check',
            }));
            result.summary.errors++;
            continue;
          }

          if (Array.isArray(group.evidence)) {
            for (let e = 0; e < group.evidence.length; e++) {
              const item = group.evidence[e];
              if (!item || typeof item !== 'object') continue;

              for (const reqField of config.schema.evidenceItemRequired) {
                if (item[reqField] === undefined || item[reqField] === null || item[reqField] === '') {
                  result.issues.push(createIssue({
                    severity: 'medium', category: 'missing-field', file,
                    field: `citations.${section}[${g}].evidence[${e}].${reqField}`,
                    description: `Missing required evidence field: ${reqField}`,
                    confidence: 1.0, source: 'schema-check',
                  }));
                  result.summary.warnings++;
                }
              }

              if (item.doi && !isValidDoi(normalizeDoi(item.doi))) {
                result.issues.push(createIssue({
                  severity: 'medium', category: 'malformed-doi', file,
                  field: `citations.${section}[${g}].evidence[${e}].doi`,
                  current: item.doi,
                  description: 'Evidence item has malformed DOI',
                  confidence: 0.90, source: 'format-check',
                }));
              }

              if (item.pmid && !isValidPmid(item.pmid)) {
                result.issues.push(createIssue({
                  severity: 'medium', category: 'missing-pmid', file,
                  field: `citations.${section}[${g}].evidence[${e}].pmid`,
                  current: String(item.pmid),
                  description: 'Evidence item has invalid PMID format',
                  confidence: 0.90, source: 'format-check',
                }));
              }
            }
          }

          const keyField = config.schema.groupKeyFields[section];
          if (keyField && !group[keyField]) {
            result.issues.push(createIssue({
              severity: 'medium', category: 'missing-field', file,
              field: `citations.${section}[${g}].${keyField}`,
              description: `Missing group key field: ${keyField}`,
              confidence: 1.0, source: 'schema-check',
            }));
          }
        }
      }
    }

    if (!result.issues.some(i => i.file === file && (i.severity === 'high' || i.severity === 'medium'))) {
      result.summary.passed++;
    }
  }

  logger.info(`Validated ${result.summary.total} files, ${result.issues.length} issues found`);
  return result;
}

module.exports = { validateScrapedJson, validateEnhancedCitations };
