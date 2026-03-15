'use strict';

function createLogger(stage) {
  const entries = [];

  function log(level, message, data) {
    const entry = {
      timestamp: new Date().toISOString(),
      stage,
      level,
      message,
      data: data || {},
    };
    entries.push(entry);
    const prefix = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m';
    const reset = '\x1b[0m';
    if (process.env.HEALING_QUIET !== 'true') {
      console.log(`${prefix}[${stage}] ${level.toUpperCase()}: ${message}${reset}`);
    }
    return entry;
  }

  return {
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
    getEntries: () => [...entries],
    getSummary: () => ({
      stage,
      total: entries.length,
      errors: entries.filter(e => e.level === 'error').length,
      warnings: entries.filter(e => e.level === 'warn').length,
      info: entries.filter(e => e.level === 'info').length,
    }),
  };
}

module.exports = { createLogger };
