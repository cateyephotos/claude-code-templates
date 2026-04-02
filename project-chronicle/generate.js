#!/usr/bin/env node

/**
 * Project Chronicle — Development Archaeology Generator
 *
 * Mines git history, docs, and session artifacts to produce an interactive
 * mindmap/timeline visualization and Markdown narrative of a project's evolution.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// ---------------------------------------------------------------------------
// CLI Argument Parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    sinceLast: false,
    deep: false,
    pathFilter: null,
    theme: null,
    note: null,
    noLlm: false,
    configPath: null,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--since-last':
        opts.sinceLast = true;
        break;
      case '--deep':
        opts.deep = true;
        break;
      case '--path':
        opts.pathFilter = args[++i];
        break;
      case '--theme':
        opts.theme = args[++i];
        break;
      case '--note':
        opts.note = args[++i];
        break;
      case '--no-llm':
        opts.noLlm = true;
        break;
      case '--config':
        opts.configPath = args[++i];
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
        break;
      default:
        console.error(`Unknown argument: ${args[i]}`);
        printUsage();
        process.exit(1);
    }
  }

  return opts;
}

function printUsage() {
  console.log(`
Project Chronicle — Development Archaeology Generator

Usage: node generate.js [options]

Options:
  --since-last       Incremental: only process commits since last run
  --deep             Include .claude/ memory, skills, TODOs
  --path <dir>       Scope commits to subdirectory
  --theme <name>     Regenerate only one named theme
  --note <text>      Add manual session note to current entry
  --no-llm           Skip LLM pass, use heuristic names only
  --config <path>    Custom config file path
  -h, --help         Show this help message
`);
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG = {
  projectName: 'Project Chronicle',
  pathFilter: null,
  docPaths: ['docs/'],
  excludePatterns: ['node_modules', 'archive', '.pre-'],
  theme: 'dark',
  maxThemes: 15,
  minCommitsPerTheme: 3,
};

function getRepoRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch {
    console.error('Error: Not inside a git repository. Run this from within a git repo.');
    process.exit(1);
  }
}

function loadConfig(configPath) {
  const resolvedPath = configPath || path.join(__dirname, 'config.json');

  if (fs.existsSync(resolvedPath)) {
    try {
      const raw = fs.readFileSync(resolvedPath, 'utf8');
      const userConfig = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...userConfig };
    } catch (err) {
      console.warn(`Warning: Could not parse config at ${resolvedPath}: ${err.message}`);
      console.warn('Using default configuration.');
      return { ...DEFAULT_CONFIG };
    }
  }

  // Create default config on first run
  const defaultOnDisk = {
    projectName: 'SupplementDB',
    pathFilter: 'supp-db-site',
    docPaths: ['docs/', 'supp-db-site/docs/'],
    excludePatterns: ['node_modules', 'archive', '.pre-'],
    theme: 'dark',
    maxThemes: 15,
    minCommitsPerTheme: 3,
  };

  try {
    fs.writeFileSync(resolvedPath, JSON.stringify(defaultOnDisk, null, 2) + '\n', 'utf8');
    console.log(`Created default config at ${resolvedPath}`);
  } catch {
    // Non-fatal — proceed with in-memory defaults
  }

  return { ...DEFAULT_CONFIG, ...defaultOnDisk };
}

// ---------------------------------------------------------------------------
// GitArchaeologist — Parse git log into structured commit objects
// ---------------------------------------------------------------------------

const COMMIT_SEPARATOR = '---CHRONICLE-COMMIT---';
const FIELD_SEPARATOR = '---CHRONICLE-FIELD---';

class GitArchaeologist {
  constructor(repoRoot, config) {
    this.repoRoot = repoRoot;
    this.config = config;
  }

  parseCommits(sinceSha) {
    const formatFields = [
      '%H',   // hash
      '%an',  // author name
      '%aI',  // author date ISO
      '%s',   // subject
      '%b',   // body
    ].join(FIELD_SEPARATOR);

    const gitArgs = [
      'log',
      `--format=${COMMIT_SEPARATOR}${formatFields}`,
      '--numstat',
    ];

    if (sinceSha) {
      gitArgs.push(`${sinceSha}..HEAD`);
    }

    if (this.config.pathFilter) {
      gitArgs.push('--', this.config.pathFilter);
    }

    let raw;
    try {
      raw = execFileSync('git', gitArgs, {
        encoding: 'utf8',
        cwd: this.repoRoot,
        maxBuffer: 50 * 1024 * 1024,
      });
    } catch (err) {
      console.error('Error running git log:', err.message);
      return [];
    }

    if (!raw.trim()) return [];

    const commitBlocks = raw.split(COMMIT_SEPARATOR).filter(b => b.trim());
    const commits = [];

    for (const block of commitBlocks) {
      const commit = this._parseCommitBlock(block);
      if (commit && !this._isExcluded(commit)) {
        commits.push(commit);
      }
    }

    return commits;
  }

  _parseCommitBlock(block) {
    const lines = block.split('\n');
    // First line contains the field-separated metadata
    const metaLine = lines[0];
    const fields = metaLine.split(FIELD_SEPARATOR);

    if (fields.length < 4) return null;

    const hash = fields[0].trim();
    const author = fields[1].trim();
    const date = fields[2].trim();
    const subject = fields[3].trim();
    const body = (fields[4] || '').trim();

    // Remaining lines are numstat (added\tremoved\tfilepath)
    const files = [];
    let additions = 0;
    let deletions = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split('\t');
      if (parts.length >= 3) {
        const added = parts[0] === '-' ? 0 : parseInt(parts[0], 10) || 0;
        const removed = parts[1] === '-' ? 0 : parseInt(parts[1], 10) || 0;
        const filePath = parts[2];
        files.push({ path: filePath, additions: added, deletions: removed });
        additions += added;
        deletions += removed;
      }
    }

    // Extract PR/issue references from subject + body
    const fullMessage = subject + ' ' + body;
    const prRefs = [];
    const refPattern = /#(\d+)/g;
    let match;
    while ((match = refPattern.exec(fullMessage)) !== null) {
      prRefs.push(parseInt(match[1], 10));
    }

    // Detect commit type from conventional commit prefix
    const commitType = this._detectCommitType(subject);

    return {
      hash,
      author,
      date,
      subject,
      body,
      files,
      additions,
      deletions,
      filesChanged: files.length,
      prRefs: [...new Set(prRefs)],
      commitType,
    };
  }

  _detectCommitType(subject) {
    const lower = subject.toLowerCase();
    if (/^feat[\s(:]/.test(lower)) return 'feat';
    if (/^fix[\s(:]/.test(lower)) return 'fix';
    if (/^docs[\s(:]/.test(lower)) return 'docs';
    if (/^refactor[\s(:]/.test(lower)) return 'refactor';
    if (/^test[\s(:]/.test(lower)) return 'test';
    if (/^chore[\s(:]/.test(lower)) return 'chore';
    if (/^style[\s(:]/.test(lower)) return 'style';
    if (/^perf[\s(:]/.test(lower)) return 'perf';
    if (/^ci[\s(:]/.test(lower)) return 'ci';
    if (/^build[\s(:]/.test(lower)) return 'build';
    return 'other';
  }

  _isExcluded(commit) {
    if (!this.config.excludePatterns || this.config.excludePatterns.length === 0) return false;
    // Exclude commits where ALL files match exclude patterns
    if (commit.files.length === 0) return false;
    return commit.files.every(f =>
      this.config.excludePatterns.some(pat => f.path.includes(pat))
    );
  }

  buildFileAdjacency(commits) {
    // Co-occurrence matrix: files that change together in the same commit
    const coOccurrence = new Map();

    for (const commit of commits) {
      const paths = commit.files.map(f => f.path);
      for (let i = 0; i < paths.length; i++) {
        for (let j = i + 1; j < paths.length; j++) {
          const key = [paths[i], paths[j]].sort().join('|');
          coOccurrence.set(key, (coOccurrence.get(key) || 0) + 1);
        }
      }
    }

    // Build adjacency list with weights (only pairs that co-occur 2+ times)
    const adjacency = new Map();
    for (const [key, count] of coOccurrence) {
      if (count < 2) continue;
      const [a, b] = key.split('|');
      if (!adjacency.has(a)) adjacency.set(a, []);
      if (!adjacency.has(b)) adjacency.set(b, []);
      adjacency.get(a).push({ file: b, weight: count });
      adjacency.get(b).push({ file: a, weight: count });
    }

    return adjacency;
  }
}

// ---------------------------------------------------------------------------
// DocHarvester — Scan and parse markdown docs, planning files, journals
// ---------------------------------------------------------------------------

class DocHarvester {
  constructor(repoRoot, config) {
    this.repoRoot = repoRoot;
    this.config = config;
  }

  harvest() {
    const docs = [];

    // Scan configured doc directories
    for (const docDir of (this.config.docPaths || [])) {
      const fullPath = path.join(this.repoRoot, docDir);
      if (fs.existsSync(fullPath)) {
        this._walkDir(fullPath, docs);
      }
    }

    // Read known root files
    const rootFiles = [
      'CLAUDE.md', 'CHANGELOG.md', 'ROADMAP.md', 'PROJECT_STATUS.md',
      'README.md', 'CONTRIBUTING.md', 'ARCHITECTURE.md',
    ];
    for (const name of rootFiles) {
      const filePath = path.join(this.repoRoot, name);
      if (fs.existsSync(filePath)) {
        const doc = this._parseMarkdownFile(filePath, name);
        if (doc) docs.push(doc);
      }
    }

    // Read sprint journal if available
    const journalPath = path.join(this.repoRoot, 'sprint-journal', 'journal-data.json');
    const journalEntries = this._readSprintJournal(journalPath);

    return { docs, journalEntries };
  }

  _walkDir(dir, results) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip excluded patterns
      if (this.config.excludePatterns.some(pat => fullPath.includes(pat))) continue;

      if (entry.isDirectory()) {
        this._walkDir(fullPath, results);
      } else if (entry.name.endsWith('.md')) {
        const doc = this._parseMarkdownFile(fullPath, path.relative(this.repoRoot, fullPath));
        if (doc) results.push(doc);
      }
    }
  }

  _parseMarkdownFile(filePath, relativePath) {
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      return null;
    }

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md');

    // Extract date from frontmatter or filename
    let date = null;
    const fmDateMatch = content.match(/(?:^|\n)\*?\*?Date:?\*?\*?\s*(.+)/i);
    if (fmDateMatch) {
      date = fmDateMatch[1].trim();
    } else {
      const filenameDateMatch = relativePath.match(/(\d{4}-\d{2}-\d{2})/);
      if (filenameDateMatch) date = filenameDateMatch[1];
    }

    // Extract section headings
    const sections = [];
    const headingPattern = /^#{2,3}\s+(.+)/gm;
    let hMatch;
    while ((hMatch = headingPattern.exec(content)) !== null) {
      sections.push(hMatch[1].trim());
    }

    // Classify document type
    const type = this._classifyDoc(relativePath, title);

    // Extract first 500 chars as excerpt
    const excerpt = content.replace(/^#.+\n/, '').trim().slice(0, 500);

    return {
      path: relativePath,
      title,
      date,
      sections,
      type,
      excerpt,
    };
  }

  _classifyDoc(relPath, title) {
    const lower = (relPath + ' ' + title).toLowerCase();
    if (lower.includes('spec')) return 'spec';
    if (lower.includes('plan')) return 'plan';
    if (lower.includes('report') || lower.includes('completion')) return 'report';
    if (lower.includes('roadmap')) return 'roadmap';
    if (lower.includes('changelog')) return 'changelog';
    if (lower.includes('status')) return 'status';
    if (lower.includes('prd') || lower.includes('requirement')) return 'prd';
    if (lower.includes('readme')) return 'readme';
    return 'doc';
  }

  _readSprintJournal(journalPath) {
    if (!fs.existsSync(journalPath)) return [];
    try {
      const raw = fs.readFileSync(journalPath, 'utf8');
      const data = JSON.parse(raw);
      return Array.isArray(data.sessions) ? data.sessions : [];
    } catch {
      return [];
    }
  }
}

// ---------------------------------------------------------------------------
// DeepArtifactScanner — .claude/ memory, skills, TODO/FIXME (--deep only)
// ---------------------------------------------------------------------------

class DeepArtifactScanner {
  constructor(repoRoot, config) {
    this.repoRoot = repoRoot;
    this.config = config;
  }

  scan() {
    const skills = this._scanSkills();
    const memoryFiles = this._scanMemory();
    const todos = this._scanTodos();

    return { skills, memoryFiles, todos };
  }

  _scanSkills() {
    const skills = [];
    const skillsDir = path.join(this.repoRoot, '.claude', 'skills');
    if (!fs.existsSync(skillsDir)) return skills;

    let entries;
    try {
      entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    } catch {
      return skills;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;

      try {
        const content = fs.readFileSync(skillFile, 'utf8');
        const nameMatch = content.match(/^#\s+(.+)/m);
        const descMatch = content.match(/(?:^|\n)\*?\*?(?:Description|description):?\*?\*?\s*(.+)/i);
        skills.push({
          name: entry.name,
          title: nameMatch ? nameMatch[1].trim() : entry.name,
          description: descMatch ? descMatch[1].trim() : '',
          path: path.relative(this.repoRoot, skillFile),
        });
      } catch {
        // Skip unreadable skill files
      }
    }

    return skills;
  }

  _scanMemory() {
    const memoryFiles = [];
    const memoryDir = path.join(this.repoRoot, '.claude', 'projects');
    if (!fs.existsSync(memoryDir)) return memoryFiles;

    this._walkForMemory(memoryDir, memoryFiles);
    return memoryFiles;
  }

  _walkForMemory(dir, results) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'memory') {
          // Found a memory directory — read its .md files
          this._readMemoryDir(fullPath, results);
        } else {
          this._walkForMemory(fullPath, results);
        }
      }
    }
  }

  _readMemoryDir(dir, results) {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const name of entries) {
      if (!name.endsWith('.md') || name === 'MEMORY.md') continue;
      const filePath = path.join(dir, name);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const nameMatch = content.match(/name:\s*(.+)/);
        const typeMatch = content.match(/type:\s*(.+)/);
        results.push({
          name: nameMatch ? nameMatch[1].trim() : name,
          type: typeMatch ? typeMatch[1].trim() : 'unknown',
          path: path.relative(this.repoRoot, filePath),
          excerpt: content.slice(0, 300),
        });
      } catch {
        // Skip
      }
    }
  }

  _scanTodos() {
    const todos = [];
    try {
      const raw = execFileSync('git', ['grep', '-n', '-E', 'TODO|FIXME', '--', '*.js', '*.ts', '*.jsx', '*.tsx', '*.py'], {
        encoding: 'utf8',
        cwd: this.repoRoot,
        maxBuffer: 10 * 1024 * 1024,
      });

      for (const line of raw.split('\n').filter(l => l.trim())) {
        const match = line.match(/^([^:]+):(\d+):(.+)$/);
        if (match) {
          todos.push({
            file: match[1],
            line: parseInt(match[2], 10),
            text: match[3].trim(),
          });
        }
      }
    } catch {
      // git grep returns non-zero if no matches — that's fine
    }

    return todos;
  }
}

// ---------------------------------------------------------------------------
// ThemeClusterer — Group commits into coherent themes
// ---------------------------------------------------------------------------

class ThemeClusterer {
  constructor(config) {
    this.maxThemes = config.maxThemes || 15;
    this.minCommitsPerTheme = config.minCommitsPerTheme || 3;
  }

  cluster(commits, docs) {
    // Step 1: Assign directory signatures to each commit
    const dirCommits = new Map(); // dirSignature -> [commit]

    for (const commit of commits) {
      const sig = this._directorySignature(commit);
      if (!dirCommits.has(sig)) dirCommits.set(sig, []);
      dirCommits.get(sig).push(commit);
    }

    // Step 2: Build initial clusters from directory groups
    let clusters = [];
    for (const [sig, clusterCommits] of dirCommits) {
      clusters.push({
        id: sig,
        dirSignature: sig,
        commits: clusterCommits,
        commitTypes: this._countTypes(clusterCommits),
        files: this._uniqueFiles(clusterCommits),
        docs: [],
      });
    }

    // Step 3: Sub-cluster large groups by commit type
    const expanded = [];
    for (const cluster of clusters) {
      if (cluster.commits.length > this.maxThemes * 3) {
        const subClusters = this._subClusterByType(cluster);
        expanded.push(...subClusters);
      } else {
        expanded.push(cluster);
      }
    }
    clusters = expanded;

    // Step 4: Merge small clusters into nearest related
    clusters = this._mergeSmallClusters(clusters);

    // Step 5: Cap at maxThemes — merge smallest into nearest
    while (clusters.length > this.maxThemes) {
      clusters.sort((a, b) => a.commits.length - b.commits.length);
      const smallest = clusters.shift();
      const nearest = this._findNearest(smallest, clusters);
      nearest.commits.push(...smallest.commits);
      nearest.files = this._uniqueFiles(nearest.commits);
      nearest.commitTypes = this._countTypes(nearest.commits);
    }

    // Step 6: Link docs to themes by path overlap and keyword matching
    for (const cluster of clusters) {
      cluster.docs = this._linkDocs(cluster, docs);
    }

    // Step 7: Sort by commit count descending, assign stable IDs
    clusters.sort((a, b) => b.commits.length - a.commits.length);
    clusters.forEach((c, i) => {
      c.id = `theme-${i + 1}`;
      c.heuristicName = this._heuristicName(c);
      // Sort commits chronologically within theme
      c.commits.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    return clusters;
  }

  _directorySignature(commit) {
    if (commit.files.length === 0) return 'root';

    // Count occurrences of each top-level + second-level directory
    const dirCounts = new Map();
    for (const f of commit.files) {
      const parts = f.path.split('/');
      // Use up to 2 levels of directory depth for signature
      const key = parts.length > 2
        ? parts.slice(0, 2).join('/')
        : parts.length > 1
          ? parts[0]
          : 'root';
      dirCounts.set(key, (dirCounts.get(key) || 0) + 1);
    }

    // Return the most common directory as the signature
    let maxDir = 'root';
    let maxCount = 0;
    for (const [dir, count] of dirCounts) {
      if (count > maxCount) {
        maxCount = count;
        maxDir = dir;
      }
    }
    return maxDir;
  }

  _subClusterByType(cluster) {
    const byType = new Map();
    for (const commit of cluster.commits) {
      const key = `${cluster.dirSignature}/${commit.commitType}`;
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key).push(commit);
    }

    return Array.from(byType.entries()).map(([key, commits]) => ({
      id: key,
      dirSignature: cluster.dirSignature,
      commits,
      commitTypes: this._countTypes(commits),
      files: this._uniqueFiles(commits),
      docs: [],
    }));
  }

  _mergeSmallClusters(clusters) {
    const merged = [];
    const small = [];

    for (const c of clusters) {
      if (c.commits.length < this.minCommitsPerTheme) {
        small.push(c);
      } else {
        merged.push(c);
      }
    }

    // If everything is small, just return them all
    if (merged.length === 0) return clusters;

    for (const s of small) {
      const nearest = this._findNearest(s, merged);
      nearest.commits.push(...s.commits);
      nearest.files = this._uniqueFiles(nearest.commits);
      nearest.commitTypes = this._countTypes(nearest.commits);
    }

    return merged;
  }

  _findNearest(target, candidates) {
    if (candidates.length === 0) return target;

    let best = candidates[0];
    let bestScore = 0;

    const targetDirs = new Set(target.files.map(f => f.split('/')[0]));

    for (const candidate of candidates) {
      // Score by directory overlap
      const candidateDirs = new Set(candidate.files.map(f => f.split('/')[0]));
      let overlap = 0;
      for (const d of targetDirs) {
        if (candidateDirs.has(d)) overlap++;
      }

      // Bonus for same dir signature
      if (candidate.dirSignature === target.dirSignature) overlap += 3;

      if (overlap > bestScore) {
        bestScore = overlap;
        best = candidate;
      }
    }

    return best;
  }

  _linkDocs(cluster, docs) {
    const linked = [];
    const clusterDirs = new Set(cluster.files.map(f => {
      const parts = f.split('/');
      return parts.length > 1 ? parts[0] : '';
    }));

    for (const doc of docs) {
      // Check path overlap
      const docDir = doc.path.split('/')[0] || '';
      if (clusterDirs.has(docDir) && docDir !== '') {
        linked.push(doc);
        continue;
      }

      // Check keyword matching — compare doc title against commit subjects
      const titleWords = new Set(doc.title.toLowerCase().split(/\W+/).filter(w => w.length > 3));
      for (const commit of cluster.commits) {
        const subjectWords = commit.subject.toLowerCase().split(/\W+/);
        const overlap = subjectWords.filter(w => titleWords.has(w)).length;
        if (overlap >= 2) {
          linked.push(doc);
          break;
        }
      }
    }

    return linked;
  }

  _heuristicName(cluster) {
    // Generate a human-readable name from directory + dominant commit type
    const dir = cluster.dirSignature.replace(/\//g, ' > ');
    const dominantType = Object.entries(cluster.commitTypes)
      .sort((a, b) => b[1] - a[1])[0];
    const typeLabel = dominantType ? dominantType[0] : 'work';

    // Clean up directory name
    const cleanDir = dir
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    return `${cleanDir} (${typeLabel})`;
  }

  _countTypes(commits) {
    const counts = {};
    for (const c of commits) {
      counts[c.commitType] = (counts[c.commitType] || 0) + 1;
    }
    return counts;
  }

  _uniqueFiles(commits) {
    const files = new Set();
    for (const c of commits) {
      for (const f of c.files) {
        files.add(f.path);
      }
    }
    return Array.from(files);
  }
}

// ---------------------------------------------------------------------------
// NarrativeGenerator — LLM or heuristic narrative for themes
// ---------------------------------------------------------------------------

class NarrativeGenerator {
  constructor(noLlm) {
    this.noLlm = noLlm;
    this.llmAvailable = false;
    if (!noLlm) {
      this.llmAvailable = this._detectLlm();
    }
  }

  _detectLlm() {
    try {
      execFileSync('claude', ['--version'], { encoding: 'utf8', stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async generate(themes, config) {
    if (this.noLlm || !this.llmAvailable) {
      if (!this.noLlm) {
        console.log('  Warning: Claude CLI not found, using heuristic names only.');
      }
      return this._heuristicNarrative(themes, config);
    }

    return this._llmNarrative(themes, config);
  }

  async _llmNarrative(themes, config) {
    const result = {
      projectNarrative: '',
      themeNarratives: new Map(),
    };

    // Generate per-theme narratives
    for (const theme of themes) {
      const topCommits = theme.commits.slice(-10).map(c => c.subject).join('\n');
      const docTitles = theme.docs.map(d => d.title).join(', ') || 'none';
      const topFiles = theme.files.slice(0, 15).join(', ');

      const prompt = `You are analyzing a software project's development history. Given the following cluster of commits, generate a JSON object with exactly these fields:
- "name": A concise theme name (3-5 words, like "Citation Data Integrity" or "Guide Generation System")
- "motivation": One sentence explaining WHY this work existed
- "keyDecisions": An array of 2-3 strings, each a key decision made and why
- "outcome": One sentence of what was achieved

Commit messages:
${topCommits}

Related docs: ${docTitles}
Key files: ${topFiles}

Respond ONLY with valid JSON, no markdown fencing.`;

      try {
        const raw = execFileSync('claude', ['-p', prompt], {
          encoding: 'utf8',
          timeout: 30000,
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        const parsed = JSON.parse(raw.trim());
        result.themeNarratives.set(theme.id, {
          name: parsed.name || theme.heuristicName,
          motivation: parsed.motivation || '',
          keyDecisions: Array.isArray(parsed.keyDecisions) ? parsed.keyDecisions : [],
          outcome: parsed.outcome || '',
        });
      } catch {
        // Fall back to heuristic for this theme
        result.themeNarratives.set(theme.id, this._heuristicTheme(theme));
      }
    }

    // Generate project-level narrative
    const themeList = themes.map(t => {
      const nar = result.themeNarratives.get(t.id);
      return `- ${nar.name}: ${nar.motivation}`;
    }).join('\n');

    const projectPrompt = `You are writing a development narrative for "${config.projectName}". Given these development themes, write 2-3 paragraphs telling the story of how this project evolved. Focus on the motivations, key turning points, and how different workstreams connected.

Themes:
${themeList}

Write in past tense, professional tone. No markdown headings, just paragraphs.`;

    try {
      result.projectNarrative = execFileSync('claude', ['-p', projectPrompt], {
        encoding: 'utf8',
        timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
    } catch {
      result.projectNarrative = this._heuristicProjectNarrative(themes, config);
    }

    return result;
  }

  _heuristicNarrative(themes, config) {
    const result = {
      projectNarrative: this._heuristicProjectNarrative(themes, config),
      themeNarratives: new Map(),
    };

    for (const theme of themes) {
      result.themeNarratives.set(theme.id, this._heuristicTheme(theme));
    }

    return result;
  }

  _heuristicTheme(theme) {
    const dominant = Object.entries(theme.commitTypes)
      .sort((a, b) => b[1] - a[1])[0];
    const typeVerb = {
      feat: 'Building new functionality',
      fix: 'Fixing issues and bugs',
      docs: 'Improving documentation',
      refactor: 'Refactoring and cleanup',
      test: 'Adding test coverage',
      chore: 'Maintenance tasks',
      perf: 'Performance optimization',
      style: 'Style improvements',
    }[dominant?.[0]] || 'Development work';

    const dateRange = theme.commits.length > 0
      ? `${theme.commits[0].date.slice(0, 10)} to ${theme.commits[theme.commits.length - 1].date.slice(0, 10)}`
      : 'unknown period';

    return {
      name: theme.heuristicName,
      motivation: `${typeVerb} in the ${theme.dirSignature} area of the codebase.`,
      keyDecisions: [
        `Primary focus: ${dominant?.[0] || 'mixed'} work (${dominant?.[1] || 0} commits)`,
        `Spanned ${theme.files.length} files across ${dateRange}`,
      ],
      outcome: `Completed ${theme.commits.length} commits affecting ${theme.files.length} files.`,
    };
  }

  _heuristicProjectNarrative(themes, config) {
    const totalCommits = themes.reduce((sum, t) => sum + t.commits.length, 0);
    const allDates = themes.flatMap(t => t.commits.map(c => c.date)).sort();
    const startDate = allDates[0]?.slice(0, 10) || 'unknown';
    const endDate = allDates[allDates.length - 1]?.slice(0, 10) || 'unknown';

    const topThemes = themes.slice(0, 5).map(t => t.heuristicName).join(', ');

    return `${config.projectName} evolved through ${totalCommits} commits across ${themes.length} major workstreams from ${startDate} to ${endDate}. The primary areas of development were: ${topThemes}.

The project progressed through distinct phases, with each theme representing a coherent body of work that advanced the overall product. Feature development was the dominant activity, supplemented by bug fixes, documentation improvements, and infrastructure work.`;
  }
}

// ---------------------------------------------------------------------------
// DataPersistence — Read/write chronicle-data.json for incremental updates
// ---------------------------------------------------------------------------

class DataPersistence {
  constructor(outDir) {
    this.filePath = path.join(outDir, 'chronicle-data.json');
    this.backupPath = path.join(outDir, 'chronicle-data.json.bak');
  }

  load() {
    if (!fs.existsSync(this.filePath)) return null;
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      // Corrupted — backup and rebuild
      console.warn('  Warning: chronicle-data.json corrupted, backing up and rebuilding.');
      try {
        fs.copyFileSync(this.filePath, this.backupPath);
      } catch { /* ignore */ }
      return null;
    }
  }

  save(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }

  mergeIncremental(existing, newData) {
    if (!existing) return newData;

    // Merge commits — deduplicate by hash
    const existingHashes = new Set(
      (existing.themes || []).flatMap(t => (t.commits || []).map(c => c.hash))
    );

    for (const newTheme of newData.themes) {
      const matchingExisting = existing.themes.find(t => t.dirSignature === newTheme.dirSignature);

      if (matchingExisting) {
        // Merge new commits into existing theme
        for (const commit of newTheme.commits) {
          if (!existingHashes.has(commit.hash)) {
            matchingExisting.commits.push(commit);
            matchingExisting.needsNarrativeUpdate = true;
          }
        }
        // Preserve manually edited names
        if (!matchingExisting.manualName) {
          matchingExisting.heuristicName = newTheme.heuristicName;
        }
      } else {
        // New theme
        newTheme.needsNarrativeUpdate = true;
        existing.themes.push(newTheme);
      }
    }

    existing.lastSha = newData.lastSha;
    existing.generatedAt = newData.generatedAt;

    // Merge session notes
    if (newData.sessionNotes) {
      existing.sessionNotes = existing.sessionNotes || [];
      existing.sessionNotes.push(...newData.sessionNotes);
    }

    return existing;
  }
}

// ---------------------------------------------------------------------------
// MarkdownRenderer — Generate chronicle.md with Mermaid diagrams
// ---------------------------------------------------------------------------

class MarkdownRenderer {
  constructor(outDir) {
    this.outDir = outDir;
  }

  render(data) {
    const lines = [];

    // Header
    lines.push(`# Project Chronicle: ${data.projectName}`);
    lines.push('');
    lines.push(`> Generated: ${data.generatedAt}`);
    lines.push('');

    // Project Narrative
    lines.push('## Project Narrative');
    lines.push('');
    lines.push(data.projectNarrative);
    lines.push('');

    // Session Notes
    if (data.sessionNotes && data.sessionNotes.length > 0) {
      lines.push('## Session Notes');
      lines.push('');
      for (const note of data.sessionNotes) {
        lines.push(`- **${note.date.slice(0, 10)}:** ${note.text}`);
      }
      lines.push('');
    }

    // Mermaid Mindmap
    lines.push('## Theme Map');
    lines.push('');
    lines.push('```mermaid');
    lines.push('mindmap');
    lines.push(`  root((${this._sanitizeMermaid(data.projectName)}))`);
    for (const theme of data.themes) {
      const name = theme.narrativeName || theme.heuristicName;
      lines.push(`    ${this._sanitizeMermaid(name)}`);
      if (theme.motivation) {
        // Truncate long motivations for mindmap readability
        const shortMotivation = theme.motivation.length > 60
          ? theme.motivation.slice(0, 57) + '...'
          : theme.motivation;
        lines.push(`      ${this._sanitizeMermaid(shortMotivation)}`);
      }
      if (theme.keyDecisions) {
        for (const decision of theme.keyDecisions.slice(0, 2)) {
          const shortDecision = decision.length > 50
            ? decision.slice(0, 47) + '...'
            : decision;
          lines.push(`      ${this._sanitizeMermaid(shortDecision)}`);
        }
      }
    }
    lines.push('```');
    lines.push('');

    // Mermaid Timeline
    lines.push('## Timeline');
    lines.push('');
    lines.push('```mermaid');
    lines.push('timeline');
    lines.push(`    title ${this._sanitizeMermaid(data.projectName)} Development Timeline`);

    // Group commits by month across all themes
    const monthGroups = this._groupByMonth(data.themes);
    for (const [month, events] of monthGroups) {
      const eventStr = events.slice(0, 5).map(e => this._sanitizeMermaid(e)).join(' : ');
      lines.push(`    ${month} : ${eventStr}`);
    }
    lines.push('```');
    lines.push('');

    // Per-theme detail sections
    lines.push('## Themes');
    lines.push('');
    for (let i = 0; i < data.themes.length; i++) {
      const theme = data.themes[i];
      const name = theme.narrativeName || theme.heuristicName;

      lines.push(`### ${i + 1}. ${name}`);
      lines.push('');
      if (theme.motivation) {
        lines.push(`**Motivation:** ${theme.motivation}`);
        lines.push('');
      }
      if (theme.keyDecisions && theme.keyDecisions.length > 0) {
        lines.push('**Key Decisions:**');
        for (const d of theme.keyDecisions) {
          lines.push(`- ${d}`);
        }
        lines.push('');
      }
      if (theme.outcome) {
        lines.push(`**Outcome:** ${theme.outcome}`);
        lines.push('');
      }
      lines.push(`**Commits:** ${theme.commitCount} | **Files:** ${theme.fileCount} | **Docs:** ${theme.docs.map(d => d.title).join(', ') || 'none'}`);
      lines.push('');

      // Key commits table (last 10)
      const keyCommits = theme.commits.slice(-10);
      if (keyCommits.length > 0) {
        lines.push('#### Key Commits');
        lines.push('');
        lines.push('| Date | Message | Files |');
        lines.push('|------|---------|-------|');
        for (const c of keyCommits) {
          const date = c.date.slice(0, 10);
          const msg = c.subject.replace(/\|/g, '\\|');
          lines.push(`| ${date} | ${msg} | ${c.filesChanged} |`);
        }
        lines.push('');
      }

      // Linked docs
      if (theme.docs.length > 0) {
        lines.push('#### Linked Documents');
        lines.push('');
        for (const doc of theme.docs) {
          lines.push(`- [${doc.title}](${doc.path}) *(${doc.type})*`);
        }
        lines.push('');
      }
    }

    // Write file
    const markdown = lines.join('\n');
    const filePath = path.join(this.outDir, 'chronicle.md');
    fs.writeFileSync(filePath, markdown, 'utf8');
    return filePath;
  }

  _sanitizeMermaid(text) {
    // Strip characters that break Mermaid syntax
    return text
      .replace(/[()[\]{}<>]/g, '')
      .replace(/"/g, "'")
      .replace(/`/g, "'")
      .replace(/:/g, ' -')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  _groupByMonth(themes) {
    const months = new Map();
    for (const theme of themes) {
      for (const commit of theme.commits) {
        const month = commit.date.slice(0, 7); // YYYY-MM
        if (!months.has(month)) months.set(month, []);
        // Add notable commits (features/fixes with short subjects)
        if ((commit.commitType === 'feat' || commit.commitType === 'fix') && commit.subject.length < 60) {
          const existing = months.get(month);
          if (existing.length < 8) {
            existing.push(commit.subject.replace(/^(feat|fix)[\s(:]+/i, '').replace(/\)$/, ''));
          }
        }
      }
    }

    // Sort by month and ensure at least one entry per month
    const sorted = new Map([...months.entries()].sort());
    for (const [month, events] of sorted) {
      if (events.length === 0) {
        events.push('maintenance work');
      }
    }

    return sorted;
  }
}

// ---------------------------------------------------------------------------
// HtmlRenderer — Self-contained interactive HTML with inline D3.js
// ---------------------------------------------------------------------------

class HtmlRenderer {
  constructor(outDir) {
    this.outDir = outDir;
  }

  async render(data) {
    const d3Source = await this._getD3Source();
    const css = this._generateCSS();
    const appJs = this._generateAppJS(data);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Project Chronicle: ${this._esc(data.projectName)}</title>
<style>${css}</style>
</head>
<body>
<header>
  <h1>Project Chronicle: ${this._esc(data.projectName)}</h1>
  <p class="subtitle">Generated ${new Date(data.generatedAt).toLocaleDateString()} &mdash; ${data.themes.length} themes, ${data.themes.reduce((s, t) => s + t.commitCount, 0)} commits</p>
</header>
<nav class="tabs">
  <button class="tab active" data-view="mindmap">Mindmap</button>
  <button class="tab" data-view="timeline">Timeline</button>
  <button class="tab" data-view="narrative">Narrative</button>
</nav>
<div class="search-bar">
  <input type="text" id="searchInput" placeholder="Search commits, themes, docs..." />
  <div class="filters">
    <select id="themeFilter"><option value="">All themes</option></select>
    <select id="typeFilter">
      <option value="">All types</option>
      <option value="feat">Features</option>
      <option value="fix">Fixes</option>
      <option value="docs">Docs</option>
      <option value="refactor">Refactor</option>
      <option value="test">Tests</option>
      <option value="chore">Chores</option>
    </select>
  </div>
</div>
<main>
  <div class="view-container">
    <div id="mindmapView" class="view active">
      <svg id="mindmapSvg"></svg>
    </div>
    <div id="timelineView" class="view">
      <svg id="timelineSvg"></svg>
    </div>
    <div id="narrativeView" class="view">
      <div id="narrativeContent"></div>
    </div>
  </div>
  <aside id="detailPanel" class="detail-panel">
    <button id="closeDetail" class="close-btn">&times;</button>
    <div id="detailContent"></div>
  </aside>
</main>
<div id="tooltip" class="tooltip"></div>
${d3Source ? `<script>${d3Source}</script>` : '<!-- D3 not available, using fallback -->'}
<script>
const CHRONICLE_DATA = ${JSON.stringify(data)};
${appJs}
</script>
</body>
</html>`;

    const filePath = path.join(this.outDir, 'index.html');
    fs.writeFileSync(filePath, html, 'utf8');
    return filePath;
  }

  async _getD3Source() {
    const localPath = path.join(this.outDir, 'd3.v7.min.js');

    // Check for local cached copy
    if (fs.existsSync(localPath)) {
      try {
        return fs.readFileSync(localPath, 'utf8');
      } catch { /* fall through */ }
    }

    // Fetch from CDN
    const https = require('https');
    const cdnUrl = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';

    try {
      const d3Code = await new Promise((resolve, reject) => {
        const req = https.get(cdnUrl, { timeout: 15000 }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            https.get(res.headers.location, { timeout: 15000 }, (res2) => {
              let body = '';
              res2.on('data', chunk => body += chunk);
              res2.on('end', () => resolve(body));
              res2.on('error', reject);
            }).on('error', reject);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}`));
            return;
          }
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(body));
          res.on('error', reject);
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      });

      // Cache locally
      try {
        fs.writeFileSync(localPath, d3Code, 'utf8');
        console.log('  Cached D3.js locally');
      } catch { /* non-fatal */ }

      return d3Code;
    } catch (err) {
      console.warn('  Warning: Could not fetch D3.js (' + err.message + '). Using fallback HTML view.');
      return null;
    }
  }

  _generateCSS() {
    return `
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #0d1117; --surface: #161b22; --border: #30363d;
  --text: #e6edf3; --text-dim: #8b949e; --accent: #58a6ff;
  --green: #3fb950; --red: #f85149; --orange: #d29922;
  --purple: #bc8cff; --pink: #f778ba;
}
body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; overflow-x: hidden; }
header { padding: 24px 32px 12px; border-bottom: 1px solid var(--border); }
header h1 { font-size: 1.5rem; font-weight: 600; }
.subtitle { color: var(--text-dim); font-size: 0.875rem; margin-top: 4px; }
.tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); padding: 0 32px; }
.tab { background: none; border: none; color: var(--text-dim); padding: 12px 20px; cursor: pointer; font-size: 0.875rem; border-bottom: 2px solid transparent; transition: all 0.15s; }
.tab:hover { color: var(--text); }
.tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.search-bar { padding: 12px 32px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.search-bar input { flex: 1; min-width: 200px; background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 8px 12px; border-radius: 6px; font-size: 0.875rem; }
.search-bar input:focus { outline: none; border-color: var(--accent); }
.filters { display: flex; gap: 8px; }
.filters select { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; }
main { display: flex; height: calc(100vh - 160px); overflow: hidden; }
.view-container { flex: 1; overflow: hidden; position: relative; }
.view { display: none; width: 100%; height: 100%; }
.view.active { display: block; }
.view svg { width: 100%; height: 100%; }
#narrativeView { padding: 32px; overflow-y: auto; }
#narrativeContent { max-width: 800px; margin: 0 auto; line-height: 1.7; }
#narrativeContent h2 { font-size: 1.3rem; margin: 24px 0 12px; color: var(--accent); }
#narrativeContent h3 { font-size: 1.1rem; margin: 20px 0 8px; color: var(--text); }
#narrativeContent p { margin-bottom: 16px; color: var(--text-dim); }
#narrativeContent .theme-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 16px; cursor: pointer; transition: border-color 0.15s; }
#narrativeContent .theme-card:hover { border-color: var(--accent); }
#narrativeContent .theme-card h3 { margin: 0 0 8px; }
#narrativeContent .theme-card .meta { font-size: 0.8rem; color: var(--text-dim); }
#narrativeContent .theme-card .motivation { font-size: 0.875rem; margin-top: 8px; }
#narrativeContent .theme-card .decisions { font-size: 0.8rem; margin-top: 8px; padding-left: 16px; color: var(--text-dim); }
#narrativeContent .theme-card .decisions li { margin-bottom: 4px; }
.detail-panel { width: 0; overflow-y: auto; background: var(--surface); border-left: 1px solid var(--border); transition: width 0.2s; padding: 0; }
.detail-panel.open { width: 380px; padding: 20px; }
.close-btn { position: absolute; top: 12px; right: 12px; background: none; border: none; color: var(--text-dim); font-size: 1.2rem; cursor: pointer; z-index: 10; }
.close-btn:hover { color: var(--text); }
#detailContent h3 { font-size: 1rem; margin-bottom: 12px; color: var(--accent); }
#detailContent .detail-section { margin-bottom: 16px; }
#detailContent .detail-label { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
#detailContent .detail-value { font-size: 0.875rem; line-height: 1.5; }
#detailContent .commit-list { list-style: none; }
#detailContent .commit-list li { padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 0.8rem; }
#detailContent .commit-list .hash { color: var(--accent); font-family: monospace; font-size: 0.75rem; }
#detailContent .commit-list .date { color: var(--text-dim); font-size: 0.7rem; }
#detailContent .doc-link { display: block; color: var(--accent); text-decoration: none; font-size: 0.8rem; padding: 4px 0; }
#detailContent .doc-link:hover { text-decoration: underline; }
.tooltip { position: absolute; pointer-events: none; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; font-size: 0.8rem; max-width: 300px; z-index: 100; opacity: 0; transition: opacity 0.1s; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
.tooltip.visible { opacity: 1; }
.node circle { stroke-width: 2; cursor: pointer; transition: r 0.15s; }
.node circle:hover { filter: brightness(1.3); }
.node text { fill: var(--text); font-size: 11px; pointer-events: none; }
.link { stroke: var(--border); stroke-opacity: 0.6; fill: none; }
.lane-bg { fill: var(--surface); stroke: var(--border); stroke-width: 0.5; }
.lane-label { fill: var(--text-dim); font-size: 11px; }
.commit-dot { cursor: pointer; transition: r 0.1s; }
.commit-dot:hover { filter: brightness(1.4); }
.axis text { fill: var(--text-dim); font-size: 10px; }
.axis line, .axis path { stroke: var(--border); }
.fallback-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
.fallback-table th, .fallback-table td { padding: 8px 12px; border: 1px solid var(--border); text-align: left; font-size: 0.8rem; }
.fallback-table th { background: var(--surface); color: var(--accent); }
@media (max-width: 768px) {
  main { flex-direction: column; }
  .detail-panel.open { width: 100%; height: 50vh; border-left: none; border-top: 1px solid var(--border); }
  .tabs { overflow-x: auto; }
  .search-bar { padding: 8px 16px; }
  header { padding: 16px; }
}`;
  }

  _generateAppJS(data) {
    // NOTE: All dynamic content rendered via this JS uses the esc() function
    // which escapes &, <, >, and " to prevent XSS. The CHRONICLE_DATA is
    // generated server-side from git/doc data (no user-controlled web input).
    const themeColors = [
      '#58a6ff', '#3fb950', '#d29922', '#f85149', '#bc8cff',
      '#f778ba', '#79c0ff', '#7ee787', '#e3b341', '#ffa198',
      '#d2a8ff', '#ff9bce', '#56d4dd', '#db61a2',
    ];

    return `
(function() {
  var data = CHRONICLE_DATA;
  var colors = ${JSON.stringify(themeColors)};
  var tooltip = document.getElementById('tooltip');
  var detailPanel = document.getElementById('detailPanel');
  var detailContent = document.getElementById('detailContent');

  // --- Escaping helper (XSS-safe for all rendered content) ---
  function esc(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  // --- Tab switching ---
  document.querySelectorAll('.tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById(tab.dataset.view + 'View').classList.add('active');
    });
  });

  // --- Populate theme filter ---
  var themeSelect = document.getElementById('themeFilter');
  data.themes.forEach(function(t) {
    var opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.narrativeName || t.heuristicName;
    themeSelect.appendChild(opt);
  });

  // --- Detail panel ---
  document.getElementById('closeDetail').addEventListener('click', function() {
    detailPanel.classList.remove('open');
  });

  function buildDetailHTML(sections) {
    // sections: [{tag, color, text}, {label, value}, {label, listItems}, ...]
    var parts = [];
    sections.forEach(function(s) {
      if (s.tag === 'h3') {
        parts.push('<h3 style="color:' + esc(s.color || '') + '">' + esc(s.text) + '</h3>');
      } else if (s.listItems) {
        parts.push('<div class="detail-section"><div class="detail-label">' + esc(s.label) + '</div><ul class="detail-value" style="padding-left:16px">');
        s.listItems.forEach(function(item) { parts.push('<li>' + esc(item) + '</li>'); });
        parts.push('</ul></div>');
      } else if (s.commitItems) {
        parts.push('<div class="detail-section"><div class="detail-label">' + esc(s.label) + '</div><ul class="commit-list">');
        s.commitItems.forEach(function(c) {
          parts.push('<li><span class="hash">' + esc(c.hash.slice(0,7)) + '</span> ' + esc(c.subject) + '<br><span class="date">' + esc(c.date.slice(0,10)) + ' \\u2014 ' + c.filesChanged + ' files</span></li>');
        });
        parts.push('</ul></div>');
      } else if (s.docLinks) {
        parts.push('<div class="detail-section"><div class="detail-label">' + esc(s.label) + '</div>');
        s.docLinks.forEach(function(d) {
          parts.push('<span class="doc-link">' + esc(d.title) + ' <small>(' + esc(d.type) + ')</small></span>');
        });
        parts.push('</div>');
      } else {
        parts.push('<div class="detail-section"><div class="detail-label">' + esc(s.label) + '</div><div class="detail-value"' + (s.style ? ' style="' + esc(s.style) + '"' : '') + '>' + esc(s.value) + '</div></div>');
      }
    });
    return parts.join('');
  }

  function showThemeDetail(theme) {
    var idx = data.themes.indexOf(theme);
    var color = colors[idx % colors.length];
    var sections = [
      { tag: 'h3', color: color, text: theme.narrativeName || theme.heuristicName },
      { label: 'Motivation', value: theme.motivation },
    ];
    if (theme.keyDecisions && theme.keyDecisions.length) {
      sections.push({ label: 'Key Decisions', listItems: theme.keyDecisions });
    }
    sections.push({ label: 'Outcome', value: theme.outcome });
    sections.push({ label: 'Stats', value: theme.commitCount + ' commits, ' + theme.fileCount + ' files' });
    sections.push({ label: 'Recent Commits', commitItems: theme.commits.slice(-15).reverse() });
    if (theme.docs && theme.docs.length) {
      sections.push({ label: 'Linked Documents', docLinks: theme.docs });
    }
    detailContent.innerHTML = buildDetailHTML(sections);
    detailPanel.classList.add('open');
  }

  function showCommitDetail(commit, theme) {
    var idx = data.themes.indexOf(theme);
    var color = colors[idx % colors.length];
    var sections = [
      { tag: 'h3', color: color, text: commit.subject },
      { label: 'Hash', value: commit.hash, style: 'font-family:monospace' },
      { label: 'Date', value: commit.date.slice(0,10) },
      { label: 'Author', value: commit.author },
      { label: 'Changes', value: '+' + commit.additions + ' -' + commit.deletions + ' in ' + commit.filesChanged + ' files' },
      { label: 'Theme', value: theme.narrativeName || theme.heuristicName, style: 'color:' + color },
    ];
    detailContent.innerHTML = buildDetailHTML(sections);
    detailPanel.classList.add('open');
  }

  function showTooltip(evt, text) {
    tooltip.textContent = text;
    tooltip.classList.add('visible');
    tooltip.style.left = (evt.pageX + 12) + 'px';
    tooltip.style.top = (evt.pageY - 20) + 'px';
  }
  function hideTooltip() { tooltip.classList.remove('visible'); }

  // --- Narrative view ---
  function renderNarrative() {
    var container = document.getElementById('narrativeContent');
    // Build narrative via DOM for safety
    container.textContent = '';
    var h2 = document.createElement('h2');
    h2.textContent = 'Project Narrative';
    container.appendChild(h2);
    var pText = data.projectNarrative || '';
    var paragraphs = pText.split(/\\n\\n/);
    if (paragraphs.length <= 1) paragraphs = [pText];
    paragraphs.forEach(function(pt) {
      if (pt.trim()) {
        var p = document.createElement('p');
        p.textContent = pt.trim();
        container.appendChild(p);
      }
    });

    var h2t = document.createElement('h2');
    h2t.textContent = 'Themes';
    container.appendChild(h2t);

    data.themes.forEach(function(theme, i) {
      var color = colors[i % colors.length];
      var card = document.createElement('div');
      card.className = 'theme-card';
      card.dataset.theme = theme.id;
      card.style.borderLeft = '3px solid ' + color;

      var h3 = document.createElement('h3');
      h3.style.color = color;
      h3.textContent = theme.narrativeName || theme.heuristicName;
      card.appendChild(h3);

      var meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = theme.commitCount + ' commits \\u00b7 ' + theme.fileCount + ' files \\u00b7 ' + Object.keys(theme.commitTypes).map(function(k) { return k + ':' + theme.commitTypes[k]; }).join(', ');
      card.appendChild(meta);

      if (theme.motivation) {
        var mot = document.createElement('div');
        mot.className = 'motivation';
        mot.textContent = theme.motivation;
        card.appendChild(mot);
      }

      if (theme.keyDecisions && theme.keyDecisions.length) {
        var ul = document.createElement('ul');
        ul.className = 'decisions';
        theme.keyDecisions.forEach(function(d) {
          var li = document.createElement('li');
          li.textContent = d;
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      card.addEventListener('click', function() { showThemeDetail(theme); });
      container.appendChild(card);
    });
  }
  renderNarrative();

  // --- Check for D3 availability ---
  if (typeof d3 === 'undefined') {
    renderFallback();
    return;
  }

  // --- D3 Mindmap ---
  function renderMindmap() {
    var svg = d3.select('#mindmapSvg');
    var container = document.getElementById('mindmapView');
    var width = container.clientWidth || 900;
    var height = container.clientHeight || 600;
    svg.attr('viewBox', [0, 0, width, height]);

    var nodes = [{ id: 'root', label: data.projectName, type: 'root', r: 28 }];
    var links = [];

    data.themes.forEach(function(theme, i) {
      var themeId = theme.id;
      var color = colors[i % colors.length];
      var r = Math.max(10, Math.min(24, 6 + Math.sqrt(theme.commitCount) * 2.5));
      nodes.push({ id: themeId, label: theme.narrativeName || theme.heuristicName, type: 'theme', r: r, color: color, theme: theme });
      links.push({ source: 'root', target: themeId });

      if (theme.motivation) {
        var motId = themeId + '-mot';
        var motLabel = theme.motivation.length > 60 ? theme.motivation.slice(0,57) + '...' : theme.motivation;
        nodes.push({ id: motId, label: motLabel, type: 'motivation', r: 5, color: color, theme: theme });
        links.push({ source: themeId, target: motId });
      }

      (theme.keyDecisions || []).slice(0, 2).forEach(function(dec, j) {
        var decId = themeId + '-dec-' + j;
        var decLabel = dec.length > 45 ? dec.slice(0,42) + '...' : dec;
        nodes.push({ id: decId, label: decLabel, type: 'decision', r: 4, color: color, theme: theme });
        links.push({ source: themeId, target: decId });
      });
    });

    var simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(function(d) { return d.id; }).distance(function(d) {
        if (d.source.type === 'root' || d.source === 'root') return 140;
        if (d.source.type === 'theme') return 80;
        return 50;
      }))
      .force('charge', d3.forceManyBody().strength(function(d) { return d.type === 'root' ? -400 : d.type === 'theme' ? -150 : -40; }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(function(d) { return d.r + 8; }));

    var g = svg.append('g');
    svg.call(d3.zoom().scaleExtent([0.3, 4]).on('zoom', function(event) {
      g.attr('transform', event.transform);
    }));

    var link = g.selectAll('.link')
      .data(links).enter().append('line')
      .attr('class', 'link')
      .attr('stroke-width', function(d) { return (d.source === 'root' || (d.source && d.source.type === 'root')) ? 1.5 : 0.8; });

    var node = g.selectAll('.node')
      .data(nodes).enter().append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', function(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', function(event, d) { d.fx = event.x; d.fy = event.y; })
        .on('end', function(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    node.append('circle')
      .attr('r', function(d) { return d.r; })
      .attr('fill', function(d) { return d.type === 'root' ? 'var(--accent)' : d.color || '#555'; })
      .attr('stroke', function(d) { return d.type === 'root' ? '#fff' : (d.color || '#555'); })
      .attr('fill-opacity', function(d) { return d.type === 'theme' ? 0.7 : d.type === 'root' ? 0.9 : 0.4; })
      .on('click', function(event, d) {
        if (d.theme) showThemeDetail(d.theme);
      })
      .on('mouseover', function(event, d) {
        if (d.theme) showTooltip(event, (d.theme.outcome || d.label) + ' (' + (d.theme.commitCount || '') + ' commits)');
        else if (d.type === 'root') showTooltip(event, data.projectName);
      })
      .on('mouseout', hideTooltip);

    node.filter(function(d) { return d.type === 'root' || d.type === 'theme'; })
      .append('text')
      .attr('dy', function(d) { return d.r + 14; })
      .attr('text-anchor', 'middle')
      .text(function(d) { var lbl = d.label; return lbl.length > 25 ? lbl.slice(0,22) + '...' : lbl; });

    simulation.on('tick', function() {
      link
        .attr('x1', function(d) { return d.source.x; }).attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; }).attr('y2', function(d) { return d.target.y; });
      node.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    });
  }

  // --- D3 Timeline ---
  function renderTimeline() {
    var svg = d3.select('#timelineSvg');
    var container = document.getElementById('timelineView');
    var width = container.clientWidth || 900;
    var laneHeight = 40;
    var marginTop = 40;
    var marginLeft = 200;
    var marginRight = 30;
    var height = Math.max(400, marginTop + data.themes.length * laneHeight + 40);
    svg.attr('viewBox', [0, 0, width, height]);

    var allDates = data.themes.flatMap(function(t) { return t.commits.map(function(c) { return new Date(c.date); }); });
    if (allDates.length === 0) return;
    var timeExtent = d3.extent(allDates);
    timeExtent[0] = d3.timeDay.offset(timeExtent[0], -3);
    timeExtent[1] = d3.timeDay.offset(timeExtent[1], 3);

    var xScale = d3.scaleTime().domain(timeExtent).range([marginLeft, width - marginRight]);
    var g = svg.append('g');

    var xAxisG = g.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + marginTop + ')')
      .call(d3.axisTop(xScale).ticks(8).tickFormat(d3.timeFormat('%b %d')));

    svg.call(d3.zoom().scaleExtent([0.5, 20]).on('zoom', function(event) {
      var newX = event.transform.rescaleX(xScale);
      xAxisG.call(d3.axisTop(newX).ticks(8).tickFormat(d3.timeFormat('%b %d')));
      g.selectAll('.commit-dot').attr('cx', function(d) { return newX(new Date(d.commit.date)); });
    }));

    data.themes.forEach(function(theme, i) {
      var y = marginTop + i * laneHeight;
      var color = colors[i % colors.length];

      g.append('rect')
        .attr('class', 'lane-bg')
        .attr('x', marginLeft).attr('y', y)
        .attr('width', width - marginLeft - marginRight)
        .attr('height', laneHeight - 2)
        .attr('rx', 2)
        .attr('fill', i % 2 === 0 ? 'rgba(22,27,34,0.3)' : 'rgba(22,27,34,0.6)');

      g.append('text')
        .attr('class', 'lane-label')
        .attr('x', marginLeft - 8).attr('y', y + laneHeight / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', color)
        .text((theme.narrativeName || theme.heuristicName).slice(0, 25));

      theme.commits.forEach(function(commit) {
        var cx = xScale(new Date(commit.date));
        var r = Math.max(3, Math.min(8, 2 + Math.sqrt(commit.filesChanged)));

        g.append('circle')
          .attr('class', 'commit-dot')
          .datum({ commit: commit, theme: theme })
          .attr('cx', cx)
          .attr('cy', y + laneHeight / 2)
          .attr('r', r)
          .attr('fill', color)
          .attr('fill-opacity', 0.7)
          .on('click', function(event, d) { showCommitDetail(d.commit, d.theme); })
          .on('mouseover', function(event, d) { showTooltip(event, d.commit.subject + ' (' + d.commit.date.slice(0,10) + ')'); })
          .on('mouseout', hideTooltip);
      });
    });
  }

  renderMindmap();
  renderTimeline();

  // --- Search ---
  document.getElementById('searchInput').addEventListener('input', function() {
    var q = this.value.toLowerCase();
    document.querySelectorAll('.theme-card').forEach(function(card) {
      var match = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
      card.style.opacity = match ? 1 : 0.3;
    });
  });

  // --- Filter by theme ---
  themeSelect.addEventListener('change', function() {
    var id = this.value;
    document.querySelectorAll('.theme-card').forEach(function(card) {
      card.style.display = (!id || card.dataset.theme === id) ? '' : 'none';
    });
  });

  // --- Fallback for no D3 ---
  function renderFallback() {
    var mindmapView = document.getElementById('mindmapView');
    // Build fallback via DOM
    var wrapper = document.createElement('div');
    wrapper.style.padding = '32px';
    var h2 = document.createElement('h2');
    h2.style.color = 'var(--accent)';
    h2.style.marginBottom = '16px';
    h2.textContent = 'Themes (D3 not available)';
    wrapper.appendChild(h2);

    var table = document.createElement('table');
    table.className = 'fallback-table';
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    ['Theme', 'Commits', 'Files', 'Type'].forEach(function(t) {
      var th = document.createElement('th');
      th.textContent = t;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    data.themes.forEach(function(t, i) {
      var row = document.createElement('tr');
      row.style.cursor = 'pointer';
      row.addEventListener('click', function() { showThemeDetail(t); });

      var td1 = document.createElement('td');
      td1.style.color = colors[i % colors.length];
      td1.textContent = t.narrativeName || t.heuristicName;
      row.appendChild(td1);

      var td2 = document.createElement('td');
      td2.textContent = t.commitCount;
      row.appendChild(td2);

      var td3 = document.createElement('td');
      td3.textContent = t.fileCount;
      row.appendChild(td3);

      var td4 = document.createElement('td');
      td4.textContent = Object.keys(t.commitTypes).join(', ');
      row.appendChild(td4);

      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    mindmapView.textContent = '';
    mindmapView.appendChild(wrapper);
  }
})();`;
  }

  _esc(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

// ---------------------------------------------------------------------------
// Output Directory Setup
// ---------------------------------------------------------------------------

function ensureOutputDir() {
  const outDir = __dirname;
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  return outDir;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv);
  const config = loadConfig(opts.configPath);

  // CLI --path overrides config pathFilter
  if (opts.pathFilter) {
    config.pathFilter = opts.pathFilter;
  }

  const repoRoot = getRepoRoot();
  const outDir = ensureOutputDir();

  console.log('=== Project Chronicle ===');
  console.log(`Project:    ${config.projectName}`);
  console.log(`Repo root:  ${repoRoot}`);
  console.log(`Path filter: ${config.pathFilter || '(all)'}`);
  console.log(`Output dir: ${outDir}`);
  console.log(`Mode:       ${opts.sinceLast ? 'incremental' : 'full rebuild'}`);
  console.log(`Deep scan:  ${opts.deep ? 'yes' : 'no'}`);
  console.log(`LLM:        ${opts.noLlm ? 'disabled' : 'enabled'}`);
  if (opts.note) console.log(`Note:       ${opts.note}`);
  if (opts.theme) console.log(`Theme filter: ${opts.theme}`);
  console.log('');

  // --- Stage 1: Git Archaeology ---
  console.log('Stage 1 — Git Archaeology...');
  const archaeologist = new GitArchaeologist(repoRoot, config);
  const commits = archaeologist.parseCommits(null);
  const adjacency = archaeologist.buildFileAdjacency(commits);
  console.log(`  Parsed ${commits.length} commits`);
  console.log(`  File adjacency pairs: ${adjacency.size}`);

  // Commit type breakdown
  const typeCounts = {};
  for (const c of commits) {
    typeCounts[c.commitType] = (typeCounts[c.commitType] || 0) + 1;
  }
  console.log(`  Commit types: ${JSON.stringify(typeCounts)}`);
  console.log('');

  // --- Stage 2: Document Harvesting ---
  console.log('Stage 2 — Document Harvesting...');
  const harvester = new DocHarvester(repoRoot, config);
  const { docs, journalEntries } = harvester.harvest();
  console.log(`  Found ${docs.length} documents`);
  console.log(`  Sprint journal entries: ${journalEntries.length}`);

  // Doc type breakdown
  const docTypes = {};
  for (const d of docs) {
    docTypes[d.type] = (docTypes[d.type] || 0) + 1;
  }
  console.log(`  Doc types: ${JSON.stringify(docTypes)}`);
  console.log('');

  // --- Stage 3: Deep Artifacts (optional) ---
  let deepArtifacts = { skills: [], memoryFiles: [], todos: [] };
  if (opts.deep) {
    console.log('Stage 3 — Deep Artifact Scan...');
    const scanner = new DeepArtifactScanner(repoRoot, config);
    deepArtifacts = scanner.scan();
    console.log(`  Skills found: ${deepArtifacts.skills.length}`);
    console.log(`  Memory files: ${deepArtifacts.memoryFiles.length}`);
    console.log(`  TODO/FIXME: ${deepArtifacts.todos.length}`);
    console.log('');
  } else {
    console.log('Stage 3 — Deep Artifact Scan... (skipped, use --deep to enable)');
    console.log('');
  }

  // --- Stage 4: Theme Clustering ---
  console.log('Stage 4 — Theme Clustering...');
  const clusterer = new ThemeClusterer(config);
  const themes = clusterer.cluster(commits, docs);
  console.log(`  Generated ${themes.length} themes:`);
  for (const theme of themes) {
    console.log(`    ${theme.id}: "${theme.heuristicName}" — ${theme.commits.length} commits, ${theme.files.length} files, ${theme.docs.length} docs`);
  }
  console.log('');

  // --- Stage 5: LLM Narrative ---
  console.log('Stage 5 — Narrative Generation...');
  const narrator = new NarrativeGenerator(opts.noLlm);
  const narrative = await narrator.generate(themes, config);

  // Apply narrative names to themes
  for (const theme of themes) {
    const nar = narrative.themeNarratives.get(theme.id);
    if (nar) {
      theme.narrativeName = nar.name;
      theme.motivation = nar.motivation;
      theme.keyDecisions = nar.keyDecisions;
      theme.outcome = nar.outcome;
    }
  }
  console.log(`  Project narrative: ${narrative.projectNarrative.length} chars`);
  console.log(`  Theme narratives: ${narrative.themeNarratives.size}`);
  console.log('');

  // --- Build chronicle data object ---
  const lastSha = commits.length > 0 ? commits[commits.length - 1].hash : null;
  const chronicleData = {
    projectName: config.projectName,
    generatedAt: new Date().toISOString(),
    lastSha,
    projectNarrative: narrative.projectNarrative,
    sessionNotes: opts.note ? [{ date: new Date().toISOString(), text: opts.note }] : [],
    themes: themes.map(t => ({
      id: t.id,
      dirSignature: t.dirSignature,
      heuristicName: t.heuristicName,
      narrativeName: t.narrativeName || t.heuristicName,
      motivation: t.motivation || '',
      keyDecisions: t.keyDecisions || [],
      outcome: t.outcome || '',
      commitCount: t.commits.length,
      fileCount: t.files.length,
      commitTypes: t.commitTypes,
      commits: t.commits.map(c => ({
        hash: c.hash,
        date: c.date,
        subject: c.subject,
        author: c.author,
        filesChanged: c.filesChanged,
        additions: c.additions,
        deletions: c.deletions,
        commitType: c.commitType,
      })),
      files: t.files.slice(0, 50), // Cap file list for JSON size
      docs: t.docs.map(d => ({ path: d.path, title: d.title, type: d.type })),
    })),
  };

  // --- Incremental merge ---
  const persistence = new DataPersistence(outDir);
  let finalData;
  if (opts.sinceLast) {
    const existing = persistence.load();
    finalData = persistence.mergeIncremental(existing, chronicleData);
  } else {
    finalData = chronicleData;
  }

  persistence.save(finalData);
  console.log(`Saved chronicle-data.json (${themes.length} themes, ${commits.length} commits)`);
  console.log('');

  // --- Stage 6: Render Markdown + HTML ---
  console.log('Stage 6 — Rendering...');
  const mdRenderer = new MarkdownRenderer(outDir);
  const mdPath = mdRenderer.render(finalData);
  console.log(`  Markdown: ${mdPath}`);

  const htmlRenderer = new HtmlRenderer(outDir);
  const htmlPath = await htmlRenderer.render(finalData);
  console.log(`  HTML: ${htmlPath}`);
  console.log('');

  console.log('Done. Open index.html in a browser to explore.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
