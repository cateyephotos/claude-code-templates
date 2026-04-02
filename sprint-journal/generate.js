#!/usr/bin/env node
'use strict';

/**
 * Sprint Journal Generator
 *
 * Reads git history, groups commits by date into sprint entries,
 * and generates a self-contained HTML journal file.
 *
 * Usage:
 *   node generate.js                          # Full rebuild from all history
 *   node generate.js --since-last             # Only new entries since last journal update
 *   node generate.js --since "2026-03-08"     # From specific date
 *   node generate.js --until "2026-03-15"     # Up to specific date
 *   node generate.js --note "Session summary" # Append note to today's entry
 *   node generate.js --path supp-db-site      # Filter to subdirectory
 *   node generate.js --config sprint-journal/config.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── CLI Args ─────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    since: null,
    until: null,
    sinceLast: false,
    note: null,
    pathFilter: null,
    configPath: null,
    outputDir: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--since':       opts.since = args[++i]; break;
      case '--until':       opts.until = args[++i]; break;
      case '--since-last':  opts.sinceLast = true; break;
      case '--note':        opts.note = args[++i]; break;
      case '--path':        opts.pathFilter = args[++i]; break;
      case '--config':      opts.configPath = args[++i]; break;
      case '--output':      opts.outputDir = args[++i]; break;
      default:
        if (!args[i].startsWith('-')) opts.pathFilter = args[i];
    }
  }
  return opts;
}

// ── Config ───────────────────────────────────────────────────────────────────

function loadConfig(configPath) {
  const defaults = {
    projectName: null,
    pathFilter: null,
    excludePatterns: [],
    theme: 'dark',
    maxCommitsPerEntry: 200,
  };

  if (configPath && fs.existsSync(configPath)) {
    try {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...defaults, ...userConfig };
    } catch (e) {
      console.warn(`Warning: Could not parse config at ${configPath}`);
    }
  }

  // Auto-detect config in sprint-journal/config.json
  const autoPath = path.join(getProjectRoot(), 'sprint-journal', 'config.json');
  if (fs.existsSync(autoPath)) {
    try {
      const userConfig = JSON.parse(fs.readFileSync(autoPath, 'utf8'));
      return { ...defaults, ...userConfig };
    } catch (e) { /* ignore */ }
  }

  return defaults;
}

function getProjectRoot() {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  } catch {
    return process.cwd();
  }
}

function getProjectName(config) {
  if (config.projectName) return config.projectName;
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remote.match(/\/([^/]+?)(?:\.git)?$/);
    if (match) return match[1];
  } catch { /* ignore */ }
  return path.basename(getProjectRoot());
}

// ── Git Data ─────────────────────────────────────────────────────────────────

function getCommits(opts, config) {
  const pathFilter = opts.pathFilter || config.pathFilter || '';

  let dateArgs = '';
  if (opts.since) dateArgs += ` --since="${opts.since}"`;
  if (opts.until) dateArgs += ` --until="${opts.until}"`;

  // If --since-last, try to read last entry date from existing journal data
  if (opts.sinceLast) {
    const dataPath = path.join(getProjectRoot(), 'sprint-journal', 'journal-data.json');
    if (fs.existsSync(dataPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        if (data.entries && data.entries.length > 0) {
          const lastDate = data.entries[data.entries.length - 1].date;
          // Add one day to avoid re-including
          const next = new Date(lastDate);
          next.setDate(next.getDate() + 1);
          dateArgs = ` --since="${next.toISOString().split('T')[0]}"`;
        }
      } catch (e) { /* rebuild all */ }
    }
  }

  const SEP = '\x01\x02\x03';
  const format = `--format=%H${SEP}%ai${SEP}%s${SEP}%an`;
  const cmd = `git log ${format}${dateArgs} --all ${pathFilter ? '-- ' + pathFilter : ''}`;

  try {
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }).trim();
    if (!output) return [];

    return output.split('\n').map(line => {
      const [hash, date, subject, author] = line.split(SEP);
      return { hash, date, subject, author };
    }).filter(c => c.hash);
  } catch (e) {
    console.error('Error reading git log:', e.message);
    return [];
  }
}

function getCommitStats(hash) {
  try {
    const output = execSync(`git show ${hash} --stat --format=""`, { encoding: 'utf8' }).trim();
    const lines = output.split('\n');
    const summaryLine = lines[lines.length - 1] || '';

    const filesMatch = summaryLine.match(/(\d+) files? changed/);
    const insertMatch = summaryLine.match(/(\d+) insertions?\(\+\)/);
    const deleteMatch = summaryLine.match(/(\d+) deletions?\(-\)/);

    // Get changed file names
    const changedFiles = lines.slice(0, -1)
      .map(l => l.trim().split(/\s+\|/)[0]?.trim())
      .filter(f => f && !f.includes('changed'));

    return {
      filesChanged: parseInt(filesMatch?.[1] || '0'),
      insertions: parseInt(insertMatch?.[1] || '0'),
      deletions: parseInt(deleteMatch?.[1] || '0'),
      files: changedFiles.slice(0, 20),
    };
  } catch {
    return { filesChanged: 0, insertions: 0, deletions: 0, files: [] };
  }
}

// ── Categorization ───────────────────────────────────────────────────────────

function categorizeCommit(subject) {
  const lower = subject.toLowerCase();
  if (lower.startsWith('feat')) return 'feature';
  if (lower.startsWith('fix')) return 'fix';
  if (lower.startsWith('test')) return 'test';
  if (lower.startsWith('docs') || lower.startsWith('doc:')) return 'docs';
  if (lower.startsWith('chore') || lower.startsWith('build') || lower.startsWith('ci')) return 'chore';
  if (lower.startsWith('refactor')) return 'refactor';
  if (lower.startsWith('data')) return 'data';
  if (lower.startsWith('style')) return 'style';
  if (lower.startsWith('perf')) return 'perf';
  return 'other';
}

function getCategoryIcon(cat) {
  const icons = {
    feature: '\u2728', fix: '\uD83D\uDD27', test: '\uD83E\uDDEA', docs: '\uD83D\uDCDD',
    chore: '\uD83E\uDDF9', refactor: '\u267B\uFE0F', data: '\uD83D\uDCCA', style: '\uD83C\uDFA8',
    perf: '\u26A1', other: '\uD83D\uDD39',
  };
  return icons[cat] || icons.other;
}

function getCategoryLabel(cat) {
  const labels = {
    feature: 'Features', fix: 'Fixes', test: 'Tests', docs: 'Documentation',
    chore: 'Chores', refactor: 'Refactoring', data: 'Data Updates', style: 'Styling',
    perf: 'Performance', other: 'Other',
  };
  return labels[cat] || 'Other';
}

// ── Entry Building ───────────────────────────────────────────────────────────

function groupByDate(commits) {
  const groups = {};
  for (const c of commits) {
    const date = c.date.split(' ')[0]; // YYYY-MM-DD
    if (!groups[date]) groups[date] = [];
    groups[date].push(c);
  }
  return groups;
}

function buildEntry(date, commits) {
  // Sort commits chronologically within the day
  commits.sort((a, b) => new Date(a.date) - new Date(b.date));

  const firstTime = commits[0].date.split(' ')[1]?.slice(0, 5) || '';
  const lastTime = commits[commits.length - 1].date.split(' ')[1]?.slice(0, 5) || '';

  // Categorize
  const byCategory = {};
  let totalFiles = 0, totalInsertions = 0, totalDeletions = 0;

  for (const c of commits) {
    const cat = categorizeCommit(c.subject);
    if (!byCategory[cat]) byCategory[cat] = [];

    const stats = getCommitStats(c.hash);
    totalFiles += stats.filesChanged;
    totalInsertions += stats.insertions;
    totalDeletions += stats.deletions;

    byCategory[cat].push({
      hash: c.hash.slice(0, 7),
      subject: c.subject,
      author: c.author,
      stats,
    });
  }

  // Extract scope tags from commits
  const scopes = new Set();
  for (const c of commits) {
    const scopeMatch = c.subject.match(/^\w+\(([^)]+)\)/);
    if (scopeMatch) scopes.add(scopeMatch[1]);
  }

  return {
    date,
    dayOfWeek: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
    timespan: firstTime && lastTime ? `${firstTime} - ${lastTime}` : '',
    commitCount: commits.length,
    totalFiles,
    totalInsertions,
    totalDeletions,
    scopes: [...scopes],
    categories: byCategory,
    note: null,
  };
}

// ── HTML Generation ──────────────────────────────────────────────────────────

function generateHTML(entries, projectName, config) {
  const theme = config.theme || 'dark';

  // Aggregate stats
  const totalCommits = entries.reduce((s, e) => s + e.commitCount, 0);
  const totalFeatures = entries.reduce((s, e) => s + (e.categories.feature?.length || 0), 0);
  const totalFixes = entries.reduce((s, e) => s + (e.categories.fix?.length || 0), 0);
  const totalInsertions = entries.reduce((s, e) => s + e.totalInsertions, 0);
  const totalDeletions = entries.reduce((s, e) => s + e.totalDeletions, 0);

  const isDark = theme === 'dark';
  const bg = isDark ? '#0d1117' : '#ffffff';
  const cardBg = isDark ? '#161b22' : '#f6f8fa';
  const text = isDark ? '#c9d1d9' : '#24292f';
  const textMuted = isDark ? '#8b949e' : '#57606a';
  const border = isDark ? '#30363d' : '#d0d7de';
  const accent = '#58a6ff';
  const green = '#3fb950';
  const red = '#f85149';
  const purple = '#bc8cff';

  function renderEntry(entry, index) {
    const catSections = Object.entries(entry.categories)
      .sort((a, b) => {
        const order = ['feature', 'fix', 'data', 'refactor', 'test', 'docs', 'chore', 'perf', 'style', 'other'];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      })
      .map(([cat, commits]) => {
        const commitItems = commits.map(c => `
          <div class="commit-item">
            <code class="commit-hash">${c.hash}</code>
            <span class="commit-msg">${escapeHtml(c.subject)}</span>
            ${c.stats.filesChanged > 0 ? `<span class="commit-stats">
              <span class="stat-add">+${c.stats.insertions}</span>
              <span class="stat-del">-${c.stats.deletions}</span>
            </span>` : ''}
          </div>
        `).join('');

        return `
          <div class="category-section">
            <h4 class="category-header">
              <span class="cat-icon">${getCategoryIcon(cat)}</span>
              ${getCategoryLabel(cat)}
              <span class="cat-count">${commits.length}</span>
            </h4>
            <div class="commit-list">${commitItems}</div>
          </div>
        `;
      }).join('');

    const scopeTags = entry.scopes.map(s =>
      `<span class="scope-tag">${escapeHtml(s)}</span>`
    ).join('');

    return `
      <article class="sprint-entry" id="entry-${entry.date}">
        <div class="entry-header" onclick="toggleEntry(this)">
          <div class="entry-date-block">
            <span class="entry-day">${entry.dayOfWeek}</span>
            <span class="entry-date">${formatDate(entry.date)}</span>
            ${entry.timespan ? `<span class="entry-time">${entry.timespan}</span>` : ''}
          </div>
          <div class="entry-summary">
            <div class="entry-stats-row">
              <span class="stat-badge commits">${entry.commitCount} commits</span>
              <span class="stat-badge files">${entry.totalFiles} files</span>
              <span class="stat-badge additions">+${entry.totalInsertions.toLocaleString()}</span>
              <span class="stat-badge deletions">-${entry.totalDeletions.toLocaleString()}</span>
            </div>
            ${scopeTags ? `<div class="scope-tags">${scopeTags}</div>` : ''}
          </div>
          <span class="toggle-icon">&#9660;</span>
        </div>
        <div class="entry-body">
          ${entry.note ? `<div class="session-note"><strong>Session Note:</strong> ${escapeHtml(entry.note)}</div>` : ''}
          ${catSections}
        </div>
      </article>
    `;
  }

  const entriesHTML = entries.map((e, i) => renderEntry(e, i)).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(projectName)} \u2014 Sprint Journal</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: ${bg};
    color: ${text};
    line-height: 1.6;
    min-height: 100vh;
  }

  .container { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }

  /* ── Header ───────────────────────────────────────────────────────────── */

  .journal-header {
    text-align: center;
    padding: 2.5rem 1rem 2rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid ${border};
  }

  .journal-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${accent};
    margin-bottom: 0.25rem;
    letter-spacing: -0.5px;
  }

  .journal-header .subtitle {
    color: ${textMuted};
    font-size: 0.95rem;
  }

  /* ── Aggregate Stats ──────────────────────────────────────────────────── */

  .stats-bar {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1.25rem;
  }

  .stats-bar .stat-card {
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    text-align: center;
    min-width: 120px;
  }

  .stat-card .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    display: block;
  }

  .stat-card .stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${textMuted};
  }

  .stat-value.commits-val { color: ${accent}; }
  .stat-value.features-val { color: ${green}; }
  .stat-value.fixes-val { color: ${red}; }
  .stat-value.lines-val { color: ${purple}; }

  /* ── Timeline ─────────────────────────────────────────────────────────── */

  .timeline {
    position: relative;
    padding-left: 2rem;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 0.5rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${border};
  }

  /* ── Entry ─────────────────────────────────────────────────────────────── */

  .sprint-entry {
    position: relative;
    margin-bottom: 1.25rem;
    background: ${cardBg};
    border: 1px solid ${border};
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .sprint-entry::before {
    content: '';
    position: absolute;
    left: -1.75rem;
    top: 1.5rem;
    width: 10px;
    height: 10px;
    background: ${accent};
    border-radius: 50%;
    border: 2px solid ${bg};
    z-index: 1;
  }

  .sprint-entry:hover { border-color: ${accent}40; }

  .entry-header {
    display: flex;
    align-items: center;
    padding: 1rem 1.25rem;
    cursor: pointer;
    user-select: none;
    gap: 1rem;
  }

  .entry-header:hover { background: ${isDark ? '#1c2128' : '#f0f3f6'}; }

  .entry-date-block {
    display: flex;
    flex-direction: column;
    min-width: 130px;
  }

  .entry-day {
    font-weight: 600;
    font-size: 0.95rem;
    color: ${accent};
  }

  .entry-date {
    font-size: 0.85rem;
    color: ${textMuted};
  }

  .entry-time {
    font-size: 0.75rem;
    color: ${textMuted};
    font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  }

  .entry-summary { flex: 1; }

  .entry-stats-row {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .stat-badge {
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 12px;
    font-weight: 500;
    font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;
  }

  .stat-badge.commits { background: ${accent}20; color: ${accent}; }
  .stat-badge.files { background: ${purple}20; color: ${purple}; }
  .stat-badge.additions { background: ${green}20; color: ${green}; }
  .stat-badge.deletions { background: ${red}20; color: ${red}; }

  .scope-tags { margin-top: 0.35rem; display: flex; gap: 0.35rem; flex-wrap: wrap; }

  .scope-tag {
    font-size: 0.7rem;
    padding: 0.1rem 0.45rem;
    border-radius: 4px;
    background: ${isDark ? '#30363d' : '#e1e4e8'};
    color: ${textMuted};
  }

  .toggle-icon {
    font-size: 0.7rem;
    color: ${textMuted};
    transition: transform 0.2s;
  }

  .sprint-entry.collapsed .toggle-icon { transform: rotate(-90deg); }
  .sprint-entry.collapsed .entry-body { display: none; }

  /* ── Entry Body ────────────────────────────────────────────────────────── */

  .entry-body {
    padding: 0 1.25rem 1.25rem;
    border-top: 1px solid ${border};
  }

  .session-note {
    margin: 1rem 0;
    padding: 0.75rem 1rem;
    border-left: 3px solid ${accent};
    background: ${accent}08;
    border-radius: 0 6px 6px 0;
    font-size: 0.9rem;
  }

  .category-section { margin-top: 1rem; }

  .category-header {
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
    color: ${text};
  }

  .cat-icon { font-size: 1rem; }

  .cat-count {
    font-size: 0.7rem;
    background: ${isDark ? '#30363d' : '#e1e4e8'};
    color: ${textMuted};
    padding: 0.05rem 0.4rem;
    border-radius: 10px;
    font-weight: 500;
  }

  .commit-list { display: flex; flex-direction: column; gap: 0.25rem; }

  .commit-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
    transition: background 0.15s;
  }

  .commit-item:hover { background: ${isDark ? '#1c2128' : '#f0f3f6'}; }

  .commit-hash {
    font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;
    font-size: 0.75rem;
    color: ${accent};
    background: ${accent}15;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .commit-msg { flex: 1; color: ${text}; }

  .commit-stats {
    font-family: 'SF Mono', SFMono-Regular, Consolas, monospace;
    font-size: 0.7rem;
    flex-shrink: 0;
    display: flex;
    gap: 0.3rem;
  }

  .stat-add { color: ${green}; }
  .stat-del { color: ${red}; }

  /* ── Footer ────────────────────────────────────────────────────────────── */

  .journal-footer {
    text-align: center;
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid ${border};
    color: ${textMuted};
    font-size: 0.8rem;
  }

  /* ── Filter Bar ────────────────────────────────────────────────────────── */

  .filter-bar {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    background: ${cardBg};
    border: 1px solid ${border};
    color: ${text};
    padding: 0.35rem 0.85rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.8rem;
    font-family: inherit;
    transition: all 0.15s;
  }

  .filter-btn:hover, .filter-btn.active {
    background: ${accent}20;
    border-color: ${accent};
    color: ${accent};
  }

  .search-input {
    background: ${cardBg};
    border: 1px solid ${border};
    color: ${text};
    padding: 0.35rem 0.85rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-family: inherit;
    outline: none;
    width: 200px;
    transition: border-color 0.15s;
  }

  .search-input:focus { border-color: ${accent}; }
  .search-input::placeholder { color: ${textMuted}; }

  /* ── Responsive ────────────────────────────────────────────────────────── */

  @media (max-width: 640px) {
    .container { padding: 1rem; }
    .timeline { padding-left: 1rem; }
    .entry-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    .entry-date-block { flex-direction: row; gap: 0.5rem; align-items: baseline; min-width: auto; }
    .stats-bar { gap: 0.5rem; }
    .stat-card { min-width: 90px; padding: 0.5rem 0.75rem; }
    .commit-stats { display: none; }
  }
</style>
</head>
<body>
<div class="container">
  <header class="journal-header">
    <h1>\uD83D\uDCD3 ${escapeHtml(projectName)}</h1>
    <p class="subtitle">Sprint Journal &mdash; Development Timeline</p>
    <div class="stats-bar">
      <div class="stat-card">
        <span class="stat-value commits-val">${totalCommits}</span>
        <span class="stat-label">Commits</span>
      </div>
      <div class="stat-card">
        <span class="stat-value features-val">${totalFeatures}</span>
        <span class="stat-label">Features</span>
      </div>
      <div class="stat-card">
        <span class="stat-value fixes-val">${totalFixes}</span>
        <span class="stat-label">Fixes</span>
      </div>
      <div class="stat-card">
        <span class="stat-value lines-val">${(totalInsertions + totalDeletions).toLocaleString()}</span>
        <span class="stat-label">Lines Changed</span>
      </div>
      <div class="stat-card">
        <span class="stat-value" style="color:${text}">${entries.length}</span>
        <span class="stat-label">Sessions</span>
      </div>
    </div>
  </header>

  <div class="filter-bar">
    <button class="filter-btn active" onclick="filterEntries('all')">All</button>
    <button class="filter-btn" onclick="filterEntries('feature')">Features</button>
    <button class="filter-btn" onclick="filterEntries('fix')">Fixes</button>
    <button class="filter-btn" onclick="filterEntries('data')">Data</button>
    <button class="filter-btn" onclick="filterEntries('test')">Tests</button>
    <input type="text" class="search-input" placeholder="Search commits..." oninput="searchEntries(this.value)">
  </div>

  <section class="timeline">
    ${entriesHTML}
  </section>

  <footer class="journal-footer">
    Generated ${new Date().toISOString().replace('T', ' ').slice(0, 19)} &bull;
    Covering ${entries.length > 0 ? formatDate(entries[entries.length - 1].date) + ' to ' + formatDate(entries[0].date) : 'no entries'}
  </footer>
</div>

<script>
function toggleEntry(header) {
  header.closest('.sprint-entry').classList.toggle('collapsed');
}

// Start with all entries expanded (first 3) or collapsed (rest)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sprint-entry').forEach((el, i) => {
    if (i >= 3) el.classList.add('collapsed');
  });
});

function filterEntries(category) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  document.querySelectorAll('.sprint-entry').forEach(entry => {
    if (category === 'all') {
      entry.style.display = '';
      return;
    }
    const hasCat = entry.querySelector('.category-header')?.textContent
      .toLowerCase().includes(category === 'feature' ? 'features' : category === 'fix' ? 'fixes' : category);
    entry.style.display = hasCat ? '' : 'none';
  });
}

function searchEntries(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.sprint-entry').forEach(entry => {
    if (!q) { entry.style.display = ''; return; }
    const text = entry.textContent.toLowerCase();
    entry.style.display = text.includes(q) ? '' : 'none';
  });
}
</script>
</body>
</html>`;
}

// ── Utilities ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs();
  const config = loadConfig(opts.configPath);
  const projectName = getProjectName(config);
  const outputDir = opts.outputDir || path.join(getProjectRoot(), 'sprint-journal');

  console.log(`\uD83D\uDCD3 Sprint Journal Generator`);
  console.log(`   Project: ${projectName}`);
  console.log(`   Output:  ${outputDir}/index.html`);

  // Get commits
  const commits = getCommits(opts, config);
  if (commits.length === 0) {
    console.log('   No commits found for the given range.');
    return;
  }
  console.log(`   Commits: ${commits.length}`);

  // Group by date
  const groups = groupByDate(commits);
  const dates = Object.keys(groups).sort().reverse(); // newest first

  // Build entries
  console.log(`   Building ${dates.length} sprint entries...`);
  const entries = dates.map(date => {
    const entry = buildEntry(date, groups[date]);
    process.stdout.write(`     ${date}: ${entry.commitCount} commits\r`);
    return entry;
  });
  console.log('');

  // Apply note to today if provided
  if (opts.note) {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(e => e.date === today);
    if (todayEntry) {
      todayEntry.note = opts.note;
    } else {
      // Create a note-only entry for today
      entries.unshift({
        date: today,
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        timespan: '',
        commitCount: 0,
        totalFiles: 0,
        totalInsertions: 0,
        totalDeletions: 0,
        scopes: [],
        categories: {},
        note: opts.note,
      });
    }
  }

  // Merge with existing entries if --since-last
  if (opts.sinceLast) {
    const dataPath = path.join(outputDir, 'journal-data.json');
    if (fs.existsSync(dataPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const existingDates = new Set(existing.entries.map(e => e.date));
        const newEntries = entries.filter(e => !existingDates.has(e.date));
        entries.length = 0;
        entries.push(...newEntries, ...existing.entries);
        entries.sort((a, b) => b.date.localeCompare(a.date));
      } catch (e) { /* rebuild all */ }
    }
  }

  // Ensure output dir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save data for incremental updates
  fs.writeFileSync(
    path.join(outputDir, 'journal-data.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), projectName, entries }, null, 2),
    'utf8'
  );

  // Generate HTML
  const html = generateHTML(entries, projectName, config);
  const htmlPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  console.log(`   \u2705 Generated ${htmlPath}`);
  console.log(`   \u2705 ${entries.length} sprint entries covering ${commits.length} commits`);
  console.log(`\n   Open in browser: ${htmlPath}`);
}

main();
