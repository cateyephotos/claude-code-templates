'use strict';

const { execSync } = require('child_process');
const path = require('path');
const config = require('../config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('page-regenerator');

function regeneratePages(supplementIds, options = {}) {
  const { dryRun = false } = options;
  const result = {
    wouldRegenerate: supplementIds.map(id => ({ id })),
    regenerated: [],
    errors: [],
  };

  if (dryRun) return result;

  const scriptPath = path.join(config.paths.root, 'generate-supplement-pages.js');

  try {
    logger.info(`Regenerating ${supplementIds.length} supplement pages...`);
    const output = execSync(`node "${scriptPath}"`, {
      cwd: config.paths.root,
      timeout: 120000,
      encoding: 'utf8',
    });

    result.regenerated = supplementIds.map(id => ({ id, status: 'regenerated' }));
    logger.info(`Regeneration complete: ${output.slice(-200)}`);
  } catch (e) {
    result.errors.push({ message: e.message, output: e.stdout?.slice(-500) || '' });
    logger.error(`Regeneration failed: ${e.message}`);
  }

  return result;
}

module.exports = { regeneratePages };
