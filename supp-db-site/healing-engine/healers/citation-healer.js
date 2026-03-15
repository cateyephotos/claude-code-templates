'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const { loadEnhancedFile, createIssue, createStageResult } = require('../utils/schema');
const { isValidDoi, normalizeDoi } = require('../utils/doi-utils');
const { isValidPmid, normalizePmid } = require('../utils/pmid-utils');
const { createLogger } = require('../utils/logger');

function collectAllCitations() {
  const enhDir = config.paths.enhancedCitations;
  const files = fs.readdirSync(enhDir)
    .filter(f => f.match(/^\d+.*_enhanced\.js$/) && !f.endsWith('.bak'));

  const allCitations = [];

  for (const file of files) {
    const data = loadEnhancedFile(path.join(enhDir, file));
    if (!data || !data.citations) continue;

    for (const section of config.schema.citationSections) {
      const arr = data.citations[section];
      if (!Array.isArray(arr)) continue;

      for (const group of arr) {
        if (!group || !Array.isArray(group.evidence)) continue;
        for (const item of group.evidence) {
          if (!item || typeof item !== 'object') continue;
          allCitations.push({
            file,
            section,
            citationId: item.citationId || '',
            title: item.title || '',
            doi: item.doi ? normalizeDoi(item.doi) : '',
            pmid: item.pmid ? normalizePmid(item.pmid) : '',
            year: item.year,
            authors: item.authors,
          });
        }
      }
    }
  }

  return allCitations;
}

function findDuplicateDois(citations) {
  const doiMap = {};
  for (const c of citations) {
    if (!c.doi) continue;
    const key = c.doi.toLowerCase();
    if (!doiMap[key]) doiMap[key] = [];
    doiMap[key].push(c);
  }
  return Object.entries(doiMap)
    .filter(([_, arr]) => arr.length > 1)
    .map(([doi, arr]) => ({ doi, occurrences: arr }));
}

function findDuplicatePmids(citations) {
  const pmidMap = {};
  for (const c of citations) {
    if (!c.pmid) continue;
    if (!pmidMap[c.pmid]) pmidMap[c.pmid] = [];
    pmidMap[c.pmid].push(c);
  }
  return Object.entries(pmidMap)
    .filter(([_, arr]) => arr.length > 1)
    .map(([pmid, arr]) => ({ pmid, occurrences: arr }));
}

function healCitationsOffline() {
  const logger = createLogger('citation-healing');
  const result = createStageResult('citation-healing');

  const allCitations = collectAllCitations();
  result.summary.total = allCitations.length;

  const missingDoi = allCitations.filter(c => !c.doi || !isValidDoi(c.doi));
  for (const c of missingDoi) {
    result.issues.push(createIssue({
      severity: 'medium', category: 'malformed-doi', file: c.file,
      field: `${c.citationId}.doi`, current: c.doi || '(empty)',
      description: `Citation "${c.citationId}" has missing/invalid DOI`,
      confidence: 0.85, source: 'offline-check',
    }));
    result.summary.warnings++;
  }

  const missingPmid = allCitations.filter(c => !c.pmid || !isValidPmid(c.pmid));
  for (const c of missingPmid) {
    result.issues.push(createIssue({
      severity: 'medium', category: 'missing-pmid', file: c.file,
      field: `${c.citationId}.pmid`, current: c.pmid || '(empty)',
      description: `Citation "${c.citationId}" has missing/invalid PMID`,
      confidence: 0.85, source: 'offline-check',
    }));
    result.summary.warnings++;
  }

  const dupeDois = findDuplicateDois(allCitations);
  for (const dupe of dupeDois) {
    const titles = [...new Set(dupe.occurrences.map(o => o.title.toLowerCase().trim()))];
    if (titles.length > 1) {
      result.issues.push(createIssue({
        severity: 'medium', category: 'pmid-mismatch', file: dupe.occurrences.map(o => o.file).join(', '),
        field: 'doi', current: dupe.doi,
        description: `DOI ${dupe.doi} appears ${dupe.occurrences.length} times with different titles`,
        confidence: 0.80, source: 'duplicate-check',
      }));
    }
  }

  const dupePmids = findDuplicatePmids(allCitations);
  for (const dupe of dupePmids) {
    const dois = [...new Set(dupe.occurrences.map(o => o.doi).filter(Boolean))];
    if (dois.length > 1) {
      result.issues.push(createIssue({
        severity: 'high', category: 'pmid-mismatch', file: dupe.occurrences.map(o => o.file).join(', '),
        field: 'pmid', current: dupe.pmid,
        description: `PMID ${dupe.pmid} maps to multiple DOIs: ${dois.join(', ')}`,
        confidence: 0.90, source: 'duplicate-check',
      }));
      result.summary.errors++;
    }
  }

  result.summary.passed = result.summary.total - missingDoi.length - missingPmid.length;
  logger.info(`Checked ${allCitations.length} citations, ${result.issues.length} issues found`);
  return result;
}

module.exports = { collectAllCitations, findDuplicateDois, findDuplicatePmids, healCitationsOffline };
