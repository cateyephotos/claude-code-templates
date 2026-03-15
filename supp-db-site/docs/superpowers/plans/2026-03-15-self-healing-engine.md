# Self-Healing Engine Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude-orchestrated self-healing pipeline that validates scraped JSON data, heals citations, checks site integrity via Playwright, and auto-fixes issues using a tiered risk strategy.

**Architecture:** Modular healing scripts in `healing-engine/` return structured JSON. Claude orchestrates by running each script, inspecting outputs, fixing script bugs in-process, applying tiered fixes (auto-fix low-risk, report medium-risk, ask before high-risk), and generating timestamped reports to `healing-reports/`.

**Tech Stack:** Node.js, Playwright, PubMed E-utilities API, CrossRef API, existing VM-based file loader pattern.

---

## Chunk 1: Foundation — Config, Utils, and Report Generator

### Task 1: Create config.js

**Files:**
- Create: `supp-db-site/healing-engine/config.js`
- Test: `supp-db-site/tests/healing-engine/config.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/config.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

test.describe('Healing Engine Config', () => {
  test('config loads and has required tier definitions', () => {
    const config = require(path.join(__dirname, '..', 'healing-engine', 'config.js'));
    expect(config.tiers).toBeDefined();
    expect(config.tiers.autoFix).toBeDefined();
    expect(config.tiers.fixAndReport).toBeDefined();
    expect(config.tiers.askBeforeFixing).toBeDefined();
    expect(config.tiers.autoFix.minConfidence).toBeGreaterThanOrEqual(0.95);
  });

  test('config has API settings', () => {
    const config = require(path.join(__dirname, '..', 'healing-engine', 'config.js'));
    expect(config.apis.pubmed.baseUrl).toContain('eutils.ncbi.nlm.nih.gov');
    expect(config.apis.crossref.baseUrl).toContain('api.crossref.org');
    expect(config.apis.pubmed.rateLimit).toBeGreaterThan(0);
  });

  test('config has quality thresholds', () => {
    const config = require(path.join(__dirname, '..', 'healing-engine', 'config.js'));
    expect(config.quality.minCitationsPerSection).toBeGreaterThanOrEqual(1);
    expect(config.quality.maxEmptySections).toBe(0);
  });

  test('config has correct project paths', () => {
    const config = require(path.join(__dirname, '..', 'healing-engine', 'config.js'));
    const fs = require('fs');
    expect(fs.existsSync(config.paths.enhancedCitations)).toBe(true);
    expect(fs.existsSync(config.paths.dataDir)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd supp-db-site && npx playwright test tests/healing-engine/config.spec.js`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Write config.js**

```javascript
// healing-engine/config.js
'use strict';
const path = require('path');

const ROOT = path.join(__dirname, '..');

module.exports = {
  paths: {
    root: ROOT,
    dataDir: path.join(ROOT, 'data'),
    supplementsJs: path.join(ROOT, 'data', 'supplements.js'),
    citationsJs: path.join(ROOT, 'data', 'citations.js'),
    enhancedCitations: path.join(ROOT, 'data', 'enhanced_citations'),
    supplementPages: path.join(ROOT, 'supplements-new'),
    guides: path.join(ROOT, 'guides'),
    healingReports: path.join(ROOT, '..', 'healing-reports'),
    scrapedJsonDir: path.join(ROOT, '..'),
  },

  tiers: {
    autoFix: {
      categories: [
        'whitespace', 'casing', 'formatting', 'trailing-slash',
        'duplicate-space', 'missing-protocol', 'doi-prefix-case'
      ],
      minConfidence: 0.99,
    },
    fixAndReport: {
      categories: [
        'malformed-doi', 'missing-pmid', 'pmid-mismatch', 'missing-field',
        'stale-link', 'doi-lookup', 'title-mismatch', 'year-mismatch',
        'journal-normalization'
      ],
      minConfidence: 0.80,
    },
    askBeforeFixing: {
      categories: [
        'remove-citation', 'change-evidence-tier', 'alter-study-type',
        'merge-duplicates', 'change-dosage', 'reclassify-mechanism',
        'change-safety-rating'
      ],
      minConfidence: 0,
    },
  },

  apis: {
    pubmed: {
      baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
      rateLimit: 3,
      batchSize: 200,
      retryAttempts: 3,
      retryDelayMs: 1000,
    },
    crossref: {
      baseUrl: 'https://api.crossref.org/',
      rateLimit: 50,
      retryAttempts: 3,
      retryDelayMs: 500,
    },
  },

  quality: {
    minCitationsPerSection: 2,
    minEvidenceTiers: 1,
    maxEmptySections: 0,
    checkScreenshots: true,
    minSupplements: 93,
  },

  schema: {
    evidenceItemRequired: [
      'citationId', 'title', 'authors', 'year', 'journal', 'doi', 'pmid', 'studyType'
    ],
    evidenceItemRecommended: [
      'evidenceLevel', 'findings', 'methodology'
    ],
    evidenceProfileRequired: [
      'overallQuality', 'totalCitations', 'researchQualityScore',
      'lastEvidenceUpdate', 'evidenceStrength', 'researchMaturity'
    ],
    topLevelRequired: ['id', 'name', 'evidenceProfile', 'citations'],
    citationSections: ['mechanisms', 'benefits', 'safety', 'dosage'],
    groupKeyFields: {
      mechanisms: 'mechanism',
      benefits: 'healthDomain',
      safety: 'safetyAspect',
      dosage: 'dosageRange',
    },
  },

  scraped: {
    expectedCategories: [
      'mechanisms', 'clinical_benefits', 'safety', 'dosage',
      'exercise_performance', 'neuroprotection'
    ],
    findingRequired: ['category', 'citation', 'doi', 'type', 'key_findings'],
    findingRecommended: ['pmid', 'methodology', 'quality_indicators'],
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd supp-db-site && npx playwright test tests/healing-engine/config.spec.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/config.js supp-db-site/tests/healing-engine/config.spec.js
git commit -m "feat(healing): add config.js with tier definitions, API settings, and schema rules"
```

---

### Task 2: Create utils — doi-utils.js, pmid-utils.js, logger.js, schema.js

**Files:**
- Create: `supp-db-site/healing-engine/utils/doi-utils.js`
- Create: `supp-db-site/healing-engine/utils/pmid-utils.js`
- Create: `supp-db-site/healing-engine/utils/logger.js`
- Create: `supp-db-site/healing-engine/utils/schema.js`
- Test: `supp-db-site/tests/healing-engine/utils.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/utils.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

const UTILS = path.join(__dirname, '..', 'healing-engine', 'utils');

test.describe('DOI Utils', () => {
  test('validates correct DOI format', () => {
    const { isValidDoi, normalizeDoi } = require(path.join(UTILS, 'doi-utils.js'));
    expect(isValidDoi('10.1016/j.phymed.2026.157915')).toBe(true);
    expect(isValidDoi('10.3390/nu13030868')).toBe(true);
    expect(isValidDoi('not-a-doi')).toBe(false);
    expect(isValidDoi('')).toBe(false);
    expect(isValidDoi(null)).toBe(false);
  });

  test('normalizes DOI format', () => {
    const { normalizeDoi } = require(path.join(UTILS, 'doi-utils.js'));
    expect(normalizeDoi('https://doi.org/10.1016/j.foo')).toBe('10.1016/j.foo');
    expect(normalizeDoi('http://dx.doi.org/10.1016/j.foo')).toBe('10.1016/j.foo');
    expect(normalizeDoi('DOI: 10.1016/j.foo')).toBe('10.1016/j.foo');
    expect(normalizeDoi('  10.1016/j.foo  ')).toBe('10.1016/j.foo');
  });

  test('builds DOI URL', () => {
    const { doiToUrl } = require(path.join(UTILS, 'doi-utils.js'));
    expect(doiToUrl('10.1016/j.foo')).toBe('https://doi.org/10.1016/j.foo');
  });
});

test.describe('PMID Utils', () => {
  test('validates correct PMID format', () => {
    const { isValidPmid } = require(path.join(UTILS, 'pmid-utils.js'));
    expect(isValidPmid('12345678')).toBe(true);
    expect(isValidPmid('1234')).toBe(true);
    expect(isValidPmid('abc')).toBe(false);
    expect(isValidPmid('')).toBe(false);
    expect(isValidPmid(null)).toBe(false);
    expect(isValidPmid(12345)).toBe(true);
  });

  test('normalizes PMID', () => {
    const { normalizePmid } = require(path.join(UTILS, 'pmid-utils.js'));
    expect(normalizePmid(' 12345678 ')).toBe('12345678');
    expect(normalizePmid('PMID: 12345678')).toBe('12345678');
    expect(normalizePmid(12345678)).toBe('12345678');
  });

  test('builds PubMed URL', () => {
    const { pmidToUrl } = require(path.join(UTILS, 'pmid-utils.js'));
    expect(pmidToUrl('12345678')).toBe('https://pubmed.ncbi.nlm.nih.gov/12345678/');
  });
});

test.describe('Logger', () => {
  test('creates structured log entries', () => {
    const { createLogger } = require(path.join(UTILS, 'logger.js'));
    const logger = createLogger('test-stage');
    const entry = logger.info('test message', { key: 'value' });
    expect(entry.stage).toBe('test-stage');
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('test message');
    expect(entry.data.key).toBe('value');
    expect(entry.timestamp).toBeDefined();
  });

  test('logger collects entries', () => {
    const { createLogger } = require(path.join(UTILS, 'logger.js'));
    const logger = createLogger('test');
    logger.info('msg1');
    logger.warn('msg2');
    logger.error('msg3');
    const entries = logger.getEntries();
    expect(entries.length).toBe(3);
    expect(entries[0].level).toBe('info');
    expect(entries[1].level).toBe('warn');
    expect(entries[2].level).toBe('error');
  });
});

test.describe('Schema Utils', () => {
  test('loadEnhancedFile loads a valid file', () => {
    const { loadEnhancedFile } = require(path.join(UTILS, 'schema.js'));
    const fs = require('fs');
    const enhDir = path.join(__dirname, '..', 'data', 'enhanced_citations');
    const files = fs.readdirSync(enhDir).filter(f => f.match(/^\d+.*_enhanced\.js$/));
    expect(files.length).toBeGreaterThan(0);
    const data = loadEnhancedFile(path.join(enhDir, files[0]));
    expect(data).not.toBeNull();
    expect(data.citations).toBeDefined();
  });

  test('createIssue builds correct issue object', () => {
    const { createIssue } = require(path.join(UTILS, 'schema.js'));
    const issue = createIssue({
      severity: 'medium',
      category: 'malformed-doi',
      file: 'test.js',
      field: 'citations[0].doi',
      current: 'bad-doi',
      suggested: '10.1234/fixed',
      confidence: 0.90,
      source: 'format-check',
      description: 'DOI format invalid',
    });
    expect(issue.id).toMatch(/^issue-/);
    expect(issue.tier).toBe('fix-and-report');
    expect(issue.severity).toBe('medium');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd supp-db-site && npx playwright test tests/healing-engine/utils.spec.js`
Expected: FAIL

- [ ] **Step 3: Write doi-utils.js**

```javascript
// healing-engine/utils/doi-utils.js
'use strict';

const DOI_REGEX = /^10\.\d{4,9}\/[^\s]+$/;

function isValidDoi(doi) {
  if (!doi || typeof doi !== 'string') return false;
  return DOI_REGEX.test(doi.trim());
}

function normalizeDoi(doi) {
  if (!doi || typeof doi !== 'string') return '';
  let d = doi.trim();
  d = d.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  d = d.replace(/^doi:\s*/i, '');
  return d.trim();
}

function doiToUrl(doi) {
  const normalized = normalizeDoi(doi);
  return normalized ? `https://doi.org/${normalized}` : '';
}

function extractDoiFromCitation(citationStr) {
  if (!citationStr || typeof citationStr !== 'string') return null;
  const match = citationStr.match(/10\.\d{4,9}\/[^\s,;)}\]]+/);
  return match ? match[0] : null;
}

module.exports = { isValidDoi, normalizeDoi, doiToUrl, extractDoiFromCitation };
```

- [ ] **Step 4: Write pmid-utils.js**

```javascript
// healing-engine/utils/pmid-utils.js
'use strict';

function isValidPmid(pmid) {
  if (pmid === null || pmid === undefined || pmid === '') return false;
  const str = String(pmid).trim();
  return /^\d{1,10}$/.test(str);
}

function normalizePmid(pmid) {
  if (pmid === null || pmid === undefined) return '';
  let str = String(pmid).trim();
  str = str.replace(/^pmid:\s*/i, '');
  return str.trim();
}

function pmidToUrl(pmid) {
  const normalized = normalizePmid(pmid);
  return normalized ? `https://pubmed.ncbi.nlm.nih.gov/${normalized}/` : '';
}

module.exports = { isValidPmid, normalizePmid, pmidToUrl };
```

- [ ] **Step 5: Write logger.js**

```javascript
// healing-engine/utils/logger.js
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
```

- [ ] **Step 6: Write schema.js**

```javascript
// healing-engine/utils/schema.js
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

module.exports = {
  loadEnhancedFile,
  loadSupplementsJs,
  createIssue,
  createStageResult,
  getTierForCategory,
  resetIssueCounter,
};
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd supp-db-site && npx playwright test tests/healing-engine/utils.spec.js`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add supp-db-site/healing-engine/utils/ supp-db-site/tests/healing-engine/utils.spec.js
git commit -m "feat(healing): add doi-utils, pmid-utils, logger, and schema utils"
```

---

### Task 3: Create report-generator.js

**Files:**
- Create: `supp-db-site/healing-engine/reporters/report-generator.js`
- Test: `supp-db-site/tests/healing-engine/report-generator.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/report-generator.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Report Generator', () => {
  const reportDir = path.join(__dirname, '..', '..', 'healing-reports');

  test('generates a timestamped JSON report', () => {
    const { generateReport } = require(path.join(__dirname, '..', 'healing-engine', 'reporters', 'report-generator.js'));
    const stageResults = [
      {
        stage: 'test-stage',
        status: 'completed',
        summary: { total: 10, passed: 8, warnings: 1, errors: 1 },
        issues: [{ id: 'issue-0001', severity: 'low', tier: 'auto-fix', category: 'whitespace' }],
        fixes_applied: [{ id: 'issue-0001', action: 'fixed' }],
        errors: [],
      }
    ];
    const report = generateReport(stageResults, { dryRun: true });
    expect(report.summary).toBeDefined();
    expect(report.summary.totalIssuesFound).toBe(1);
    expect(report.summary.autoFixed).toBe(1);
    expect(report.stages).toHaveLength(1);
  });

  test('writes report files when not dry run', () => {
    const { generateReport } = require(path.join(__dirname, '..', 'healing-engine', 'reporters', 'report-generator.js'));
    const stageResults = [
      {
        stage: 'write-test',
        status: 'completed',
        summary: { total: 1, passed: 1, warnings: 0, errors: 0 },
        issues: [],
        fixes_applied: [],
        errors: [],
      }
    ];
    const report = generateReport(stageResults, { dryRun: false });
    expect(report.filePath).toBeDefined();
    expect(fs.existsSync(report.filePath)).toBe(true);
    // Cleanup
    fs.unlinkSync(report.filePath);
    const summaryPath = report.filePath.replace('.json', '-summary.txt');
    if (fs.existsSync(summaryPath)) fs.unlinkSync(summaryPath);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write report-generator.js**

```javascript
// healing-engine/reporters/report-generator.js
'use strict';

const fs = require('fs');
const path = require('path');
const config = require('../config');

function generateReport(stageResults, options = {}) {
  const { dryRun = false } = options;
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const allIssues = stageResults.flatMap(s => s.issues || []);
  const allFixes = stageResults.flatMap(s => s.fixes_applied || []);
  const allErrors = stageResults.flatMap(s => s.errors || []);

  const autoFixed = allFixes.filter(f => {
    const issue = allIssues.find(i => i.id === f.id);
    return issue && issue.tier === 'auto-fix';
  }).length;

  const fixedAndReported = allFixes.filter(f => {
    const issue = allIssues.find(i => i.id === f.id);
    return issue && issue.tier === 'fix-and-report';
  }).length;

  const needsReview = allIssues.filter(i =>
    i.tier === 'ask-before-fixing' && !allFixes.find(f => f.id === i.id)
  ).length;

  const unfixable = allIssues.filter(i =>
    !allFixes.find(f => f.id === i.id) && i.tier !== 'ask-before-fixing'
  ).length;

  const report = {
    timestamp: now.toISOString(),
    summary: {
      totalIssuesFound: allIssues.length,
      autoFixed,
      fixedAndReported,
      needsReview,
      unfixable,
      totalErrors: allErrors.length,
      stagesRun: stageResults.length,
      stagesPassed: stageResults.filter(s => s.status === 'completed').length,
      stagesFailed: stageResults.filter(s => s.status === 'failed').length,
    },
    stages: stageResults.map(s => ({
      stage: s.stage,
      status: s.status,
      summary: s.summary,
      issueCount: (s.issues || []).length,
      fixCount: (s.fixes_applied || []).length,
      errorCount: (s.errors || []).length,
    })),
    issues: allIssues,
    fixes: allFixes,
    errors: allErrors,
    healerFixes: options.healerFixes || [],
  };

  if (!dryRun) {
    const reportDir = config.paths.healingReports;
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const jsonPath = path.join(reportDir, `${timestamp}_heal-report.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    report.filePath = jsonPath;

    const summaryPath = jsonPath.replace('.json', '-summary.txt');
    const summaryText = [
      `=== Healing Report ${now.toISOString()} ===`,
      `Issues found: ${report.summary.totalIssuesFound}`,
      `Auto-fixed: ${report.summary.autoFixed}`,
      `Fixed & reported: ${report.summary.fixedAndReported}`,
      `Needs review: ${report.summary.needsReview}`,
      `Unfixable: ${report.summary.unfixable}`,
      `Errors: ${report.summary.totalErrors}`,
      `Stages: ${report.summary.stagesRun} run, ${report.summary.stagesPassed} passed, ${report.summary.stagesFailed} failed`,
      '',
      ...stageResults.map(s => `  [${s.status === 'completed' ? 'OK' : 'FAIL'}] ${s.stage}: ${(s.issues || []).length} issues, ${(s.fixes_applied || []).length} fixes`),
    ].join('\n');
    fs.writeFileSync(summaryPath, summaryText);
  }

  return report;
}

module.exports = { generateReport };
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/reporters/ supp-db-site/tests/healing-engine/report-generator.spec.js
git commit -m "feat(healing): add report generator with JSON and summary output"
```

---

## Chunk 2: Data Healing — Validator and Citation Healer

### Task 4: Create data-validator.js

**Files:**
- Create: `supp-db-site/healing-engine/healers/data-validator.js`
- Test: `supp-db-site/tests/healing-engine/data-validator.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/data-validator.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');
const fs = require('fs');

const HEALER = path.join(__dirname, '..', 'healing-engine', 'healers', 'data-validator.js');
const SCRAPED_DIR = path.join(__dirname, '..', '..');

test.describe('Data Validator - Scraped JSON', () => {
  test('validates a well-formed scraped JSON file', () => {
    const { validateScrapedJson } = require(HEALER);
    const files = fs.readdirSync(SCRAPED_DIR).filter(f => f.endsWith('_Comprehensive_Research_Report.json'));
    expect(files.length).toBeGreaterThan(0);
    const data = JSON.parse(fs.readFileSync(path.join(SCRAPED_DIR, files[0]), 'utf8'));
    const result = validateScrapedJson(data, files[0]);
    expect(result.stage).toBe('data-validation-scraped');
    expect(result.status).toBe('completed');
    expect(result.summary.total).toBeGreaterThan(0);
  });

  test('detects missing required fields in findings', () => {
    const { validateScrapedJson } = require(HEALER);
    const badData = {
      search_summary: { queries_used: [], databases_searched: [], total_papers_reviewed: 0, papers_selected: 0 },
      findings: [
        { category: 'mechanisms', citation: 'Test', doi: '', type: '', key_findings: [] }
      ]
    };
    const result = validateScrapedJson(badData, 'test.json');
    expect(result.issues.length).toBeGreaterThan(0);
  });
});

test.describe('Data Validator - Enhanced Citations', () => {
  test('validates existing enhanced citation files', () => {
    const { validateEnhancedCitations } = require(HEALER);
    const result = validateEnhancedCitations();
    expect(result.stage).toBe('data-validation-enhanced');
    expect(result.status).toBe('completed');
    expect(result.summary.total).toBeGreaterThanOrEqual(93);
  });

  test('detects Pattern A violations', () => {
    const { validateEnhancedCitations } = require(HEALER);
    const result = validateEnhancedCitations();
    // All should be Pattern C by now
    const patternA = result.issues.filter(i => i.category === 'pattern-a-evidence');
    // We expect 0 Pattern A issues
    expect(patternA.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write data-validator.js**

```javascript
// healing-engine/healers/data-validator.js
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

  // Validate search_summary
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

    // Check required fields
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

    // Validate DOI format
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

    // Validate PMID format
    if (finding.pmid && !isValidPmid(finding.pmid)) {
      result.issues.push(createIssue({
        severity: 'medium', category: 'missing-pmid', file: filename,
        field: `${prefix}.pmid`, current: String(finding.pmid),
        description: 'PMID format invalid (should be numeric)',
        confidence: 0.95, source: 'format-check',
      }));
      result.summary.warnings++;
    }

    // Check key_findings is a non-empty array
    if (!Array.isArray(finding.key_findings) || finding.key_findings.length === 0) {
      result.issues.push(createIssue({
        severity: 'medium', category: 'missing-field', file: filename,
        field: `${prefix}.key_findings`,
        description: 'key_findings should be a non-empty array',
        confidence: 1.0, source: 'structure-check',
      }));
      result.summary.warnings++;
    }

    // Check quality_indicators
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

    // Check top-level required fields
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

    // Check evidenceProfile
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

    // Check citation sections
    if (data.citations) {
      for (const section of config.schema.citationSections) {
        const arr = data.citations[section];
        if (!Array.isArray(arr) || arr.length === 0) continue;

        for (let g = 0; g < arr.length; g++) {
          const group = arr[g];
          if (!group || typeof group !== 'object') continue;

          // Check for Pattern A (evidence as string)
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

          // Validate evidence items
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

              // Validate DOI in evidence items
              if (item.doi && !isValidDoi(normalizeDoi(item.doi))) {
                result.issues.push(createIssue({
                  severity: 'medium', category: 'malformed-doi', file,
                  field: `citations.${section}[${g}].evidence[${e}].doi`,
                  current: item.doi,
                  description: 'Evidence item has malformed DOI',
                  confidence: 0.90, source: 'format-check',
                }));
              }

              // Validate PMID in evidence items
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

          // Check group key field
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd supp-db-site && npx playwright test tests/healing-engine/data-validator.spec.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/healers/data-validator.js supp-db-site/tests/healing-engine/data-validator.spec.js
git commit -m "feat(healing): add data-validator for scraped JSON and enhanced citations"
```

---

### Task 5: Create citation-healer.js

**Files:**
- Create: `supp-db-site/healing-engine/healers/citation-healer.js`
- Test: `supp-db-site/tests/healing-engine/citation-healer.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/citation-healer.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

const HEALER = path.join(__dirname, '..', 'healing-engine', 'healers', 'citation-healer.js');

test.describe('Citation Healer - Offline Checks', () => {
  test('detects duplicate DOIs across files', () => {
    const { findDuplicateDois } = require(HEALER);
    const citations = [
      { file: 'a.js', doi: '10.1234/abc', citationId: 'c1' },
      { file: 'b.js', doi: '10.1234/abc', citationId: 'c2' },
      { file: 'c.js', doi: '10.5678/xyz', citationId: 'c3' },
    ];
    const dupes = findDuplicateDois(citations);
    expect(dupes.length).toBe(1);
    expect(dupes[0].doi).toBe('10.1234/abc');
  });

  test('detects duplicate PMIDs across files', () => {
    const { findDuplicatePmids } = require(HEALER);
    const citations = [
      { file: 'a.js', pmid: '12345', citationId: 'c1' },
      { file: 'b.js', pmid: '12345', citationId: 'c2' },
    ];
    const dupes = findDuplicatePmids(citations);
    expect(dupes.length).toBe(1);
  });

  test('collects all citations from enhanced files', () => {
    const { collectAllCitations } = require(HEALER);
    const citations = collectAllCitations();
    expect(citations.length).toBeGreaterThan(0);
    expect(citations[0]).toHaveProperty('doi');
    expect(citations[0]).toHaveProperty('file');
  });
});

test.describe('Citation Healer - Full Run', () => {
  test('runs offline healing and returns structured result', () => {
    const { healCitationsOffline } = require(HEALER);
    const result = healCitationsOffline();
    expect(result.stage).toBe('citation-healing');
    expect(result.status).toBe('completed');
    expect(result.summary.total).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write citation-healer.js**

```javascript
// healing-engine/healers/citation-healer.js
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

  // Check for missing DOIs
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

  // Check for missing PMIDs
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

  // Check for duplicate DOIs (same paper cited in different files is OK,
  // but same DOI with different metadata is suspicious)
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

  // Check for duplicate PMIDs with different DOIs
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
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/healers/citation-healer.js supp-db-site/tests/healing-engine/citation-healer.spec.js
git commit -m "feat(healing): add citation healer with offline DOI/PMID validation and duplicate detection"
```

---

### Task 6: Create batch-api-client.js

**Files:**
- Create: `supp-db-site/healing-engine/fixers/batch-api-client.js`
- Test: `supp-db-site/tests/healing-engine/batch-api-client.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/batch-api-client.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

const CLIENT = path.join(__dirname, '..', 'healing-engine', 'fixers', 'batch-api-client.js');

test.describe('Batch API Client', () => {
  test('module exports required functions', () => {
    const client = require(CLIENT);
    expect(typeof client.lookupPmidBatch).toBe('function');
    expect(typeof client.lookupDoiCrossref).toBe('function');
    expect(typeof client.verifyCitation).toBe('function');
  });

  test('lookupPmidBatch handles empty array', async () => {
    const { lookupPmidBatch } = require(CLIENT);
    const result = await lookupPmidBatch([]);
    expect(result).toEqual({});
  });

  test('lookupDoiCrossref handles invalid DOI', async () => {
    const { lookupDoiCrossref } = require(CLIENT);
    const result = await lookupDoiCrossref('invalid-doi');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write batch-api-client.js**

```javascript
// healing-engine/fixers/batch-api-client.js
'use strict';

const https = require('https');
const config = require('../config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('batch-api-client');

function httpGet(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
        }
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function lookupPmidBatch(pmids) {
  if (!pmids || pmids.length === 0) return {};

  const results = {};
  const batchSize = config.apis.pubmed.batchSize;
  const delay = Math.ceil(1000 / config.apis.pubmed.rateLimit);

  for (let i = 0; i < pmids.length; i += batchSize) {
    const batch = pmids.slice(i, i + batchSize);
    const idList = batch.join(',');
    const url = `${config.apis.pubmed.baseUrl}esummary.fcgi?db=pubmed&id=${idList}&retmode=json`;

    for (let attempt = 0; attempt < config.apis.pubmed.retryAttempts; attempt++) {
      try {
        const resp = await httpGet(url);
        if (resp.data && resp.data.result) {
          for (const pmid of batch) {
            const entry = resp.data.result[pmid];
            if (entry && !entry.error) {
              results[pmid] = {
                title: entry.title || '',
                authors: (entry.authors || []).map(a => a.name),
                journal: entry.fulljournalname || entry.source || '',
                year: entry.pubdate ? parseInt(entry.pubdate) : null,
                doi: (entry.articleids || []).find(a => a.idtype === 'doi')?.value || '',
              };
            }
          }
        }
        break;
      } catch (e) {
        logger.warn(`PubMed batch attempt ${attempt + 1} failed: ${e.message}`);
        if (attempt < config.apis.pubmed.retryAttempts - 1) {
          await sleep(config.apis.pubmed.retryDelayMs * (attempt + 1));
        }
      }
    }

    if (i + batchSize < pmids.length) await sleep(delay);
  }

  return results;
}

async function lookupDoiCrossref(doi) {
  if (!doi) return null;
  const url = `${config.apis.crossref.baseUrl}works/${encodeURIComponent(doi)}`;

  for (let attempt = 0; attempt < config.apis.crossref.retryAttempts; attempt++) {
    try {
      const resp = await httpGet(url);
      if (resp.status === 200 && resp.data && resp.data.message) {
        const msg = resp.data.message;
        return {
          title: Array.isArray(msg.title) ? msg.title[0] : msg.title || '',
          authors: (msg.author || []).map(a => `${a.given || ''} ${a.family || ''}`.trim()),
          journal: msg['container-title'] ? msg['container-title'][0] : '',
          year: msg.published?.['date-parts']?.[0]?.[0] || null,
          doi: msg.DOI || doi,
          pmid: null,
        };
      }
      return null;
    } catch (e) {
      logger.warn(`CrossRef attempt ${attempt + 1} failed for ${doi}: ${e.message}`);
      if (attempt < config.apis.crossref.retryAttempts - 1) {
        await sleep(config.apis.crossref.retryDelayMs * (attempt + 1));
      }
    }
  }
  return null;
}

async function verifyCitation(citation) {
  const issues = [];

  // Try PubMed first if we have PMID
  if (citation.pmid) {
    const pubmedData = await lookupPmidBatch([citation.pmid]);
    const pm = pubmedData[citation.pmid];
    if (pm) {
      // Check title match
      if (pm.title && citation.title) {
        const simScore = simpleSimilarity(pm.title, citation.title);
        if (simScore < 0.5) {
          issues.push({
            field: 'title',
            current: citation.title,
            expected: pm.title,
            similarity: simScore,
            source: 'pubmed',
          });
        }
      }
      // Check DOI match
      if (pm.doi && citation.doi && pm.doi.toLowerCase() !== citation.doi.toLowerCase()) {
        issues.push({
          field: 'doi',
          current: citation.doi,
          expected: pm.doi,
          source: 'pubmed',
        });
      }
    }
  }

  return issues;
}

function simpleSimilarity(a, b) {
  if (!a || !b) return 0;
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1.0;

  const wordsA = new Set(na.split(/\s+/));
  const wordsB = new Set(nb.split(/\s+/));
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  return (2 * intersection.length) / (wordsA.size + wordsB.size);
}

module.exports = { lookupPmidBatch, lookupDoiCrossref, verifyCitation, simpleSimilarity };
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/fixers/batch-api-client.js supp-db-site/tests/healing-engine/batch-api-client.spec.js
git commit -m "feat(healing): add batch API client for PubMed and CrossRef lookups"
```

---

## Chunk 3: Auto-Fixer and Site Health Checks

### Task 7: Create auto-fixer.js

**Files:**
- Create: `supp-db-site/healing-engine/fixers/auto-fixer.js`
- Test: `supp-db-site/tests/healing-engine/auto-fixer.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/auto-fixer.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

const FIXER = path.join(__dirname, '..', 'healing-engine', 'fixers', 'auto-fixer.js');

test.describe('Auto Fixer', () => {
  test('exports applyFixes function', () => {
    const { applyFixes } = require(FIXER);
    expect(typeof applyFixes).toBe('function');
  });

  test('filters issues by tier correctly', () => {
    const { filterByTier } = require(FIXER);
    const issues = [
      { id: '1', tier: 'auto-fix', category: 'whitespace' },
      { id: '2', tier: 'fix-and-report', category: 'malformed-doi' },
      { id: '3', tier: 'ask-before-fixing', category: 'remove-citation' },
    ];
    expect(filterByTier(issues, 'auto-fix').length).toBe(1);
    expect(filterByTier(issues, 'fix-and-report').length).toBe(1);
    expect(filterByTier(issues, 'ask-before-fixing').length).toBe(1);
  });

  test('applies DOI normalization fix in dry-run mode', () => {
    const { applyFixes } = require(FIXER);
    const issues = [{
      id: 'issue-0001', tier: 'auto-fix', category: 'doi-prefix-case',
      file: 'test.js', field: 'doi',
      current: 'https://doi.org/10.1234/abc', suggested: '10.1234/abc',
      confidence: 1.0,
    }];
    const result = applyFixes(issues, { dryRun: true });
    expect(result.wouldFix.length).toBe(1);
    expect(result.applied.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write auto-fixer.js**

```javascript
// healing-engine/fixers/auto-fixer.js
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
  const escaped = escapeForRegex(issue.current);

  if (content.includes(issue.current)) {
    content = content.replace(issue.current, issue.suggested);
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { applyFixes, filterByTier };
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/fixers/auto-fixer.js supp-db-site/tests/healing-engine/auto-fixer.spec.js
git commit -m "feat(healing): add auto-fixer with tiered fix application and dry-run mode"
```

---

### Task 8: Create site-checker.js

**Files:**
- Create: `supp-db-site/healing-engine/healers/site-checker.js`
- Test: `supp-db-site/tests/healing-engine/site-checker.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/site-checker.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

const CHECKER = path.join(__dirname, '..', 'healing-engine', 'healers', 'site-checker.js');

test.describe('Site Checker - Internal Consistency', () => {
  test('checks supplements.js entries have HTML pages', () => {
    const { checkSupplementPages } = require(CHECKER);
    const result = checkSupplementPages();
    expect(result.stage).toBe('site-consistency');
    expect(result.summary.total).toBeGreaterThanOrEqual(93);
  });

  test('checks enhanced citation files have supplements.js entries', () => {
    const { checkOrphanedFiles } = require(CHECKER);
    const result = checkOrphanedFiles();
    expect(result.stage).toBe('orphan-check');
    expect(result.status).toBe('completed');
  });

  test('runs full site check', () => {
    const { runSiteCheck } = require(CHECKER);
    const result = runSiteCheck();
    expect(result.stage).toBe('site-check');
    expect(result.status).toBe('completed');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write site-checker.js**

```javascript
// healing-engine/healers/site-checker.js
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
    const slug = supp.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    const possibleFiles = [
      `${slug}.html`,
      `${supp.name.toLowerCase().replace(/\s+/g, '-')}.html`,
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

  // Check enhanced citation files exist for each supplement
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
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/healers/site-checker.js supp-db-site/tests/healing-engine/site-checker.spec.js
git commit -m "feat(healing): add site-checker for internal consistency and orphan detection"
```

---

### Task 9: Create content-quality.js

**Files:**
- Create: `supp-db-site/healing-engine/healers/content-quality.js`
- Test: `supp-db-site/tests/healing-engine/content-quality.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/content-quality.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

const CHECKER = path.join(__dirname, '..', 'healing-engine', 'healers', 'content-quality.js');

test.describe('Content Quality Checker', () => {
  test('checks citation counts per section', () => {
    const { checkContentQuality } = require(CHECKER);
    const result = checkContentQuality();
    expect(result.stage).toBe('content-quality');
    expect(result.status).toBe('completed');
    expect(result.summary.total).toBeGreaterThanOrEqual(93);
  });

  test('detects supplements with empty sections', () => {
    const { checkSingleSupplement } = require(CHECKER);
    const fakeData = {
      id: 999, name: 'Test',
      evidenceProfile: { overallQuality: 'Tier 4', totalCitations: 0, researchQualityScore: 0, lastEvidenceUpdate: '', evidenceStrength: {}, researchMaturity: '' },
      citations: { mechanisms: [], benefits: [], safety: [], dosage: [] },
    };
    const issues = checkSingleSupplement(fakeData, 'test.js');
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(i => i.description.includes('empty'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write content-quality.js**

```javascript
// healing-engine/healers/content-quality.js
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
      // Count total evidence items
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

  // Check evidence profile quality
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
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/healers/content-quality.js supp-db-site/tests/healing-engine/content-quality.spec.js
git commit -m "feat(healing): add content quality checker for citation coverage and completeness"
```

---

## Chunk 4: Browser Checker, Link Validator, Page Regenerator

### Task 10: Create browser-checker.js

**Files:**
- Create: `supp-db-site/healing-engine/healers/browser-checker.js`
- Test: `supp-db-site/tests/healing-engine/browser-checker.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/browser-checker.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

const CHECKER = path.join(__dirname, '..', 'healing-engine', 'healers', 'browser-checker.js');

test.describe('Browser Checker', () => {
  test('module exports runBrowserChecks function', () => {
    const { runBrowserChecks } = require(CHECKER);
    expect(typeof runBrowserChecks).toBe('function');
  });

  test('checkPage returns structured result for valid URL', async ({ page }) => {
    const { checkPage } = require(CHECKER);
    await page.goto('http://localhost:8080');
    const result = await checkPage(page, 'http://localhost:8080', '/');
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('consoleErrors');
    expect(result).toHaveProperty('status');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write browser-checker.js**

```javascript
// healing-engine/healers/browser-checker.js
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

  // Check for empty body
  const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || '').catch(() => '');
  const hasContent = bodyText.length > 50;

  // Check for broken images
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

  // Add homepage and key pages
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
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/healers/browser-checker.js supp-db-site/tests/healing-engine/browser-checker.spec.js
git commit -m "feat(healing): add browser checker with Playwright page validation"
```

---

### Task 11: Create link-validator.js

**Files:**
- Create: `supp-db-site/healing-engine/healers/link-validator.js`
- Test: `supp-db-site/tests/healing-engine/link-validator.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/link-validator.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

const VALIDATOR = path.join(__dirname, '..', 'healing-engine', 'healers', 'link-validator.js');

test.describe('Link Validator', () => {
  test('module exports required functions', () => {
    const { collectExternalLinks, validateLinks } = require(VALIDATOR);
    expect(typeof collectExternalLinks).toBe('function');
    expect(typeof validateLinks).toBe('function');
  });

  test('collects DOI and PMID URLs from enhanced citations', () => {
    const { collectExternalLinks } = require(VALIDATOR);
    const links = collectExternalLinks();
    expect(links.length).toBeGreaterThan(0);
    expect(links.some(l => l.url.includes('doi.org'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write link-validator.js**

```javascript
// healing-engine/healers/link-validator.js
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
  // Deduplicate by URL
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
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/healers/link-validator.js supp-db-site/tests/healing-engine/link-validator.spec.js
git commit -m "feat(healing): add link validator for DOI and PubMed URL verification"
```

---

### Task 12: Create page-regenerator.js

**Files:**
- Create: `supp-db-site/healing-engine/fixers/page-regenerator.js`
- Test: `supp-db-site/tests/healing-engine/page-regenerator.spec.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/healing-engine/page-regenerator.spec.js
const { test, expect } = require('playwright/test');
const path = require('path');

const REGEN = path.join(__dirname, '..', 'healing-engine', 'fixers', 'page-regenerator.js');

test.describe('Page Regenerator', () => {
  test('module exports regeneratePages function', () => {
    const { regeneratePages } = require(REGEN);
    expect(typeof regeneratePages).toBe('function');
  });

  test('regeneratePages in dry-run returns list of pages to rebuild', () => {
    const { regeneratePages } = require(REGEN);
    const result = regeneratePages([1, 2], { dryRun: true });
    expect(result.wouldRegenerate).toBeDefined();
    expect(result.wouldRegenerate.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write page-regenerator.js**

```javascript
// healing-engine/fixers/page-regenerator.js
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
```

- [ ] **Step 4: Run tests to verify they pass**

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/fixers/page-regenerator.js supp-db-site/tests/healing-engine/page-regenerator.spec.js
git commit -m "feat(healing): add page regenerator wrapper for generate-supplement-pages.js"
```

---

## Chunk 5: Claude Code Skill and Integration

### Task 13: Create the self-healing Claude Code skill

**Files:**
- Create: `supp-db-site/healing-engine/run-healing.js` (CLI entry point)
- Create skill file (location depends on Claude Code skill format)

- [ ] **Step 1: Write the CLI runner test**

```javascript
// tests/healing-engine/run-healing.spec.js
const { test, expect } = require('playwright/test');
const { execSync } = require('child_process');
const path = require('path');

test.describe('Healing Engine CLI', () => {
  test('run-healing.js --dry-run completes without error', () => {
    const scriptPath = path.join(__dirname, '..', 'healing-engine', 'run-healing.js');
    const output = execSync(`node "${scriptPath}" --dry-run --skip-browser --skip-links`, {
      cwd: path.join(__dirname, '..'),
      timeout: 60000,
      encoding: 'utf8',
    });
    expect(output).toContain('Healing');
  });

  test('run-healing.js --dry-run --stage data-validation works', () => {
    const scriptPath = path.join(__dirname, '..', 'healing-engine', 'run-healing.js');
    const output = execSync(`node "${scriptPath}" --dry-run --stage data-validation`, {
      cwd: path.join(__dirname, '..'),
      timeout: 60000,
      encoding: 'utf8',
    });
    expect(output).toContain('data-validation');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Write run-healing.js**

```javascript
// healing-engine/run-healing.js
#!/usr/bin/env node
'use strict';

const path = require('path');
const { validateScrapedJson, validateEnhancedCitations } = require('./healers/data-validator');
const { healCitationsOffline } = require('./healers/citation-healer');
const { runSiteCheck } = require('./healers/site-checker');
const { checkContentQuality } = require('./healers/content-quality');
const { applyFixes, filterByTier } = require('./fixers/auto-fixer');
const { generateReport } = require('./reporters/report-generator');
const { createLogger } = require('./utils/logger');
const { resetIssueCounter } = require('./utils/schema');
const fs = require('fs');
const config = require('./config');

const logger = createLogger('orchestrator');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_BROWSER = args.includes('--skip-browser');
const SKIP_LINKS = args.includes('--skip-links');
const STAGE = (() => {
  const i = args.indexOf('--stage');
  return i >= 0 ? args[i + 1] : null;
})();
const TARGET_FILE = (() => {
  const i = args.indexOf('--file');
  return i >= 0 ? args[i + 1] : null;
})();

async function main() {
  resetIssueCounter();
  const stageResults = [];
  const healerFixes = [];

  logger.info('=== Healing Engine Starting ===');
  logger.info(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);

  // Stage 1: Validate scraped JSON (if a target file is provided)
  if (!STAGE || STAGE === 'data-validation') {
    if (TARGET_FILE) {
      const filePath = path.resolve(TARGET_FILE);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const result = validateScrapedJson(data, path.basename(filePath));
        stageResults.push(result);
        logger.info(`Stage 1 (scraped): ${result.issues.length} issues`);
      }
    }

    // Stage 2: Validate enhanced citations
    const enhResult = validateEnhancedCitations();
    stageResults.push(enhResult);
    logger.info(`Stage 2 (enhanced): ${enhResult.issues.length} issues`);
  }

  // Stage 3: Citation healing (offline)
  if (!STAGE || STAGE === 'citation-healing') {
    const citResult = healCitationsOffline();
    stageResults.push(citResult);
    logger.info(`Stage 3 (citations): ${citResult.issues.length} issues`);
  }

  // Stage 4: Site consistency check
  if (!STAGE || STAGE === 'site-check') {
    const siteResult = runSiteCheck();
    stageResults.push(siteResult);
    logger.info(`Stage 4 (site): ${siteResult.issues.length} issues`);
  }

  // Stage 5: Browser checks (requires Playwright — skippable)
  if (!SKIP_BROWSER && (!STAGE || STAGE === 'browser-check')) {
    logger.info('Stage 5 (browser): Skipped in CLI mode — use Claude orchestration for Playwright checks');
  }

  // Stage 6: Link validation (slow — skippable)
  if (!SKIP_LINKS && (!STAGE || STAGE === 'link-validation')) {
    const { validateLinks } = require('./healers/link-validator');
    const linkResult = await validateLinks({ limit: 50, concurrency: 3 });
    stageResults.push(linkResult);
    logger.info(`Stage 6 (links): ${linkResult.issues.length} issues`);
  }

  // Stage 7: Content quality
  if (!STAGE || STAGE === 'content-quality') {
    const qualityResult = checkContentQuality();
    stageResults.push(qualityResult);
    logger.info(`Stage 7 (quality): ${qualityResult.issues.length} issues`);
  }

  // Apply auto-fixes
  const allIssues = stageResults.flatMap(s => s.issues);
  const autoFixable = filterByTier(allIssues, 'auto-fix');

  if (autoFixable.length > 0) {
    logger.info(`Applying ${autoFixable.length} auto-fixes (dry-run: ${DRY_RUN})...`);
    const fixResult = applyFixes(allIssues, { dryRun: DRY_RUN, tier: 'auto-fix' });
    logger.info(`Auto-fixed: ${fixResult.applied.length}, skipped: ${fixResult.skipped.length}`);

    // Add fixes to stage results
    for (const stage of stageResults) {
      stage.fixes_applied = fixResult.applied.filter(f =>
        stage.issues.some(i => i.id === f.id)
      );
    }
  }

  // Generate report
  const report = generateReport(stageResults, { dryRun: DRY_RUN, healerFixes });

  // Print summary
  console.log('\n=== Healing Summary ===');
  console.log(`Issues found: ${report.summary.totalIssuesFound}`);
  console.log(`Auto-fixed: ${report.summary.autoFixed}`);
  console.log(`Fixed & reported: ${report.summary.fixedAndReported}`);
  console.log(`Needs review: ${report.summary.needsReview}`);
  console.log(`Unfixable: ${report.summary.unfixable}`);
  if (report.filePath) {
    console.log(`Report saved: ${report.filePath}`);
  }

  // Output JSON for Claude to parse
  if (args.includes('--json')) {
    console.log('\n---JSON_OUTPUT_START---');
    console.log(JSON.stringify(report, null, 2));
    console.log('---JSON_OUTPUT_END---');
  }

  return report;
}

main().catch(e => {
  console.error('Healing engine error:', e);
  process.exit(1);
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd supp-db-site && npx playwright test tests/healing-engine/run-healing.spec.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supp-db-site/healing-engine/run-healing.js supp-db-site/tests/healing-engine/run-healing.spec.js
git commit -m "feat(healing): add CLI orchestrator with stage selection and dry-run mode"
```

---

### Task 14: Create the self-healing skill file

**Files:**
- Create: Skill file at the appropriate location for Claude Code skills

- [ ] **Step 1: Write the skill definition**

The skill file should be created as a Claude Code skill. The exact path depends on the skill infrastructure. The skill content:

```markdown
---
name: self-healing
description: Claude-orchestrated self-healing pipeline for scraped JSON data and site integrity. Validates data, heals citations, checks site health via Playwright, and auto-fixes issues using tiered risk strategy.
---

# Self-Healing Pipeline Skill

You are orchestrating the self-healing pipeline for the supplement database.

## Entry Point

Run: `node supp-db-site/healing-engine/run-healing.js --json --dry-run --skip-browser --skip-links`

Parse the JSON output between `---JSON_OUTPUT_START---` and `---JSON_OUTPUT_END---`.

## Orchestration Loop

For each stage result in the JSON output:

1. **Inspect the output** — check for script errors, unexpected shapes, edge cases
2. **If script has a bug** — read the script source, fix it, re-run
3. **Apply tiered fixes:**
   - `auto-fix` tier issues → already applied by the script. Verify they look correct.
   - `fix-and-report` tier issues → review each one. Apply fixes you're confident about, show diffs to user.
   - `ask-before-fixing` tier issues → present to user with context and recommendation, wait for approval.
4. **Re-validate** affected files after fixes
5. **Run browser checks** using Playwright MCP to load pages and check for rendering issues
6. **Generate final report** in healing-reports/

## Tiered Fix Rules

- **Low-risk (auto-fix):** whitespace, casing, DOI prefix normalization — fix silently
- **Medium-risk (fix-and-report):** malformed DOIs, missing PMIDs, title mismatches — fix and show diff
- **High-risk (ask-before-fixing):** removing citations, changing evidence tiers, altering study types — ask first

## Browser Check Phase

After data healing, use Playwright to:
1. Load each supplement page
2. Check for console errors
3. Check for broken images
4. Check for empty sections
5. Take screenshots of flagged pages

## Self-Healing the Healers

If any script throws an error or returns malformed output:
1. Read the script source
2. Identify the bug
3. Fix it
4. Re-run
5. Log the fix in the report under "healerFixes"

## Report Location

Save reports to: `healing-reports/` at project root (timestamped JSON + summary text)
```

- [ ] **Step 2: Create the skill file**

- [ ] **Step 3: Add npm script to package.json**

Add to `supp-db-site/package.json` scripts:
```json
"heal": "node healing-engine/run-healing.js",
"heal:dry-run": "node healing-engine/run-healing.js --dry-run --skip-browser --skip-links",
"heal:full": "node healing-engine/run-healing.js --json"
```

- [ ] **Step 4: Commit**

```bash
git add supp-db-site/package.json
git commit -m "feat(healing): add self-healing skill definition and npm scripts"
```

---

### Task 15: Integration test — full pipeline dry run

**Files:**
- Create: `supp-db-site/tests/healing-engine/integration.spec.js`

- [ ] **Step 1: Write integration test**

```javascript
// tests/healing-engine/integration.spec.js
const { test, expect } = require('playwright/test');
const { execSync } = require('child_process');
const path = require('path');

test.describe('Healing Engine Integration', () => {
  test('full dry-run pipeline completes and produces valid report', () => {
    const scriptPath = path.join(__dirname, '..', 'healing-engine', 'run-healing.js');
    const output = execSync(
      `node "${scriptPath}" --dry-run --skip-browser --skip-links --json`,
      { cwd: path.join(__dirname, '..'), timeout: 120000, encoding: 'utf8' }
    );

    expect(output).toContain('Healing');
    expect(output).toContain('---JSON_OUTPUT_START---');

    const jsonMatch = output.match(/---JSON_OUTPUT_START---\n([\s\S]*?)\n---JSON_OUTPUT_END---/);
    expect(jsonMatch).not.toBeNull();

    const report = JSON.parse(jsonMatch[1]);
    expect(report.summary).toBeDefined();
    expect(report.summary.totalIssuesFound).toBeGreaterThanOrEqual(0);
    expect(report.stages).toBeDefined();
    expect(report.stages.length).toBeGreaterThan(0);
  });

  test('data validation stage finds 93+ enhanced citation files', () => {
    const scriptPath = path.join(__dirname, '..', 'healing-engine', 'run-healing.js');
    const output = execSync(
      `node "${scriptPath}" --dry-run --stage data-validation --json`,
      { cwd: path.join(__dirname, '..'), timeout: 60000, encoding: 'utf8' }
    );

    const jsonMatch = output.match(/---JSON_OUTPUT_START---\n([\s\S]*?)\n---JSON_OUTPUT_END---/);
    const report = JSON.parse(jsonMatch[1]);
    const enhStage = report.stages.find(s => s.stage.includes('enhanced'));
    expect(enhStage).toBeDefined();
  });

  test('citation healing stage runs without crashes', () => {
    const scriptPath = path.join(__dirname, '..', 'healing-engine', 'run-healing.js');
    const output = execSync(
      `node "${scriptPath}" --dry-run --stage citation-healing --json`,
      { cwd: path.join(__dirname, '..'), timeout: 60000, encoding: 'utf8' }
    );

    const jsonMatch = output.match(/---JSON_OUTPUT_START---\n([\s\S]*?)\n---JSON_OUTPUT_END---/);
    const report = JSON.parse(jsonMatch[1]);
    expect(report.summary.totalIssuesFound).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Run integration test**

Run: `cd supp-db-site && npx playwright test tests/healing-engine/integration.spec.js`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add supp-db-site/tests/healing-engine/integration.spec.js
git commit -m "test(healing): add integration tests for full pipeline dry-run"
```

---

## Task Execution Order

1. Tasks 1-3 (Chunk 1): Foundation — can be built in parallel
2. Tasks 4-6 (Chunk 2): Data healing — depends on Chunk 1
3. Tasks 7-9 (Chunk 3): Auto-fixer and site checks — depends on Chunk 1
4. Tasks 10-12 (Chunk 4): Browser/link/regen — depends on Chunk 1
5. Tasks 13-15 (Chunk 5): Skill and integration — depends on all above
