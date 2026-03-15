'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('auto-fixer');

function filterByTier(issues, tier) {
  return issues.filter(i => i.tier === tier);
}

function applyFixes(issues, options = {}) {
  const { dryRun = false, tier = 'auto-fix' } = options;
  const eligible = filterByTier(issues, tier);
  const result = { applied: [], skipped: [], wouldFix: [], errors: [] };

  for (const issue of eligible) {
    if (issue.confidence < config.tiers.autoFix.minConfidence && tier === 'auto-fix') {
      result.skipped.push({ id: issue.id, reason: `Confidence ${issue.confidence} below threshold` });
      continue;
    }

    if (!issue.suggested || issue.suggested === issue.current) {
      result.skipped.push({ id: issue.id, reason: 'No suggested fix or same as current' });
      continue;
    }

    if (dryRun) {
      result.wouldFix.push({
        id: issue.id, file: issue.file, field: issue.field,
        from: issue.current, to: issue.suggested,
      });
      continue;
    }

    try {
      const fixed = applyFixToFile(issue);
      if (fixed) {
        result.applied.push({
          id: issue.id, file: issue.file, field: issue.field,
          action: 'fixed', from: issue.current, to: issue.suggested,
        });
        logger.info(`Fixed ${issue.category} in ${issue.file}: ${issue.field}`);
      } else {
        result.skipped.push({ id: issue.id, reason: 'Could not locate value in file' });
      }
    } catch (e) {
      result.errors.push({ id: issue.id, error: e.message });
      logger.error(`Failed to fix ${issue.id}: ${e.message}`);
    }
  }

  return result;
}

function applyFixToFile(issue) {
  const enhDir = config.paths.enhancedCitations;
  const filePath = path.join(enhDir, issue.file);
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(issue.current)) {
    content = content.replace(issue.current, issue.suggested);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

module.exports = { applyFixes, filterByTier };
