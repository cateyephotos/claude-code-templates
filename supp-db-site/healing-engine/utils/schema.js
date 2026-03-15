'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const config = require('../config');

let issueCounter = 0;

function loadEnhancedFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
  vm.createContext(ctx);
  const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+)\s*=/m);
  let patchedSrc = src;
  if (constMatch) {
    patchedSrc = src + `\ntry { window.__top = ${constMatch[1]}; } catch(e) {}`;
  }
  try {
    vm.runInContext(patchedSrc, ctx);
  } catch (e) {
    return null;
  }
  if (ctx.window.__top) return ctx.window.__top;
  const keys = Object.keys(ctx.window.enhancedCitations);
  if (keys.length > 0) return ctx.window.enhancedCitations[keys[0]];
  if (ctx.module.exports && Object.keys(ctx.module.exports).length > 0) return ctx.module.exports;
  return null;
}

function loadSupplementsJs() {
  const src = fs.readFileSync(config.paths.supplementsJs, 'utf8');
  const ctx = { window: {}, module: { exports: {} } };
  vm.createContext(ctx);
  try {
    vm.runInContext(src, ctx);
  } catch (e) {
    return null;
  }
  return ctx.window.supplementDatabase || ctx.module.exports || null;
}

function getTierForCategory(category) {
  if (config.tiers.autoFix.categories.includes(category)) return 'auto-fix';
  if (config.tiers.fixAndReport.categories.includes(category)) return 'fix-and-report';
  if (config.tiers.askBeforeFixing.categories.includes(category)) return 'ask-before-fixing';
  return 'fix-and-report';
}

function createIssue({ severity, category, file, field, current, suggested, confidence, source, description }) {
  issueCounter++;
  return {
    id: `issue-${String(issueCounter).padStart(4, '0')}`,
    severity: severity || 'medium',
    tier: getTierForCategory(category),
    category,
    file: file || '',
    field: field || '',
    current: current || '',
    suggested: suggested || '',
    confidence: confidence || 0,
    source: source || 'unknown',
    description: description || '',
  };
}

function createStageResult(stage) {
  return {
    timestamp: new Date().toISOString(),
    stage,
    status: 'completed',
    summary: { total: 0, passed: 0, warnings: 0, errors: 0 },
    issues: [],
    fixes_applied: [],
    errors: [],
  };
}

function resetIssueCounter() {
  issueCounter = 0;
}

function writeEnhancedFile(filePath, data, options = {}) {
  let header = '';
  let format = 'const'; // default

  // If sourceFile provided, detect format from it
  if (options.sourceFile && fs.existsSync(options.sourceFile)) {
    const source = fs.readFileSync(options.sourceFile, 'utf8');
    // Preserve comment header
    const headerLines = [];
    for (const line of source.split('\n')) {
      if (line.startsWith('//')) headerLines.push(line);
      else break;
    }
    header = headerLines.join('\n') + (headerLines.length ? '\n\n' : '');

    if (source.includes('window.enhancedCitations')) format = 'window';
    else if (source.includes('module.exports')) format = 'module';
    else format = 'const';
  }

  const json = JSON.stringify(data, null, 2);

  let content;
  if (format === 'window') {
    const varName = data.supplementName
      ? data.supplementName.replace(/[^a-zA-Z0-9]/g, '') + 'Enhanced'
      : 'enhancedData';
    const lcVarName = varName.charAt(0).toLowerCase() + varName.slice(1);
    const id = data.supplementId || data.id || 0;
    content = `${header}window.enhancedCitations = window.enhancedCitations || {};\n\nwindow.${lcVarName} = ${json};\n\nwindow.enhancedCitations[${id}] = window.${lcVarName};\n\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = window.${lcVarName};\n}\n`;
  } else if (format === 'module') {
    content = `${header}module.exports = ${json};\n`;
  } else {
    const rawName = data.name || data.supplementName || 'enhanced';
    const varName = rawName.replace(/[^a-zA-Z0-9]/g, '');
    const lcVarName = varName.charAt(0).toLowerCase() + varName.slice(1) + 'Enhanced';
    content = `${header}const ${lcVarName} = ${json};\n\nif (typeof module !== 'undefined') module.exports = ${lcVarName};\nif (typeof window !== 'undefined') window.enhancedCitations = Object.assign(window.enhancedCitations || {}, { ${lcVarName} });\n`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = {
  loadEnhancedFile,
  loadSupplementsJs,
  createIssue,
  createStageResult,
  getTierForCategory,
  resetIssueCounter,
  writeEnhancedFile,
};
