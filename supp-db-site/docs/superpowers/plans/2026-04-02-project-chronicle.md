# Project Chronicle Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a development archaeology skill that mines git history, docs, and session artifacts to produce an interactive mindmap/timeline visualization and Markdown narrative of a project's evolution.

**Architecture:** Single Node.js generator script with 8 internal modules. Reads git + docs + artifacts, clusters commits into themes, calls Claude for narrative labels, renders self-contained HTML (D3.js inline) and Markdown with Mermaid diagrams. Data persisted to JSON for incremental updates.

**Tech Stack:** Node.js (built-ins + child_process for git), D3.js v7 minified (bundled inline), Claude CLI for LLM pass (optional, degrades gracefully).

**Spec:** `supp-db-site/docs/superpowers/specs/2026-04-02-project-chronicle-design.md`

---

## File Structure

```
project-chronicle/
  generate.js              # Main generator (all 8 modules)
  config.json              # User configuration (created on first run if missing)
  chronicle-data.json      # Persisted structured data (generated)
  chronicle.md             # Markdown output (generated)
  index.html               # Interactive HTML visualization (generated)
  d3.v7.min.js             # D3 v7 minified (~90KB, bundled into HTML at build time)

.claude/skills/project-chronicle/
  SKILL.md                 # Skill definition for Claude Code
```

---

## Chunk 1: Data Mining Pipeline (Tasks 1-4)

### Task 1: Scaffold and CLI Parser

**Files:**
- Create: `project-chronicle/generate.js`

- [ ] **Step 1: Create generator scaffold** — CLI arg parsing, config loading, output directory setup
- [ ] **Step 2: Run to verify** — `node project-chronicle/generate.js` prints header
- [ ] **Step 3: Commit** — `feat(project-chronicle): scaffold generator with CLI arg parsing`

### Task 2: GitArchaeologist Module

**Files:**
- Modify: `project-chronicle/generate.js`

- [ ] **Step 1: Add GitArchaeologist** — parses git log with custom format, extracts commits with hash/author/date/subject/body/files/stats/prRefs/commitType
- [ ] **Step 2: Add file adjacency builder** — co-occurrence matrix of files that change together
- [ ] **Step 3: Wire into main pipeline** — parse commits, build adjacency, print counts
- [ ] **Step 4: Run and verify** — `node project-chronicle/generate.js --path supp-db-site` prints 200+ commits
- [ ] **Step 5: Commit** — `feat(project-chronicle): add GitArchaeologist module`

### Task 3: DocHarvester and DeepArtifactScanner

**Files:**
- Modify: `project-chronicle/generate.js`

- [ ] **Step 1: Add DocHarvester** — walks doc directories, parses markdown files extracting title/date/sections/type, reads sprint journal JSON, reads known root files (CLAUDE.md, CHANGELOG.md, etc.)
- [ ] **Step 2: Add DeepArtifactScanner** — scans .claude/skills for SKILL.md files, .claude/projects for memory files, git grep for TODO/FIXME (only with --deep flag)
- [ ] **Step 3: Wire into pipeline** — harvest docs, scan artifacts, print counts
- [ ] **Step 4: Run and verify** — `node project-chronicle/generate.js --path supp-db-site --deep` prints doc/skill/memory/TODO counts
- [ ] **Step 5: Commit** — `feat(project-chronicle): add DocHarvester and DeepArtifactScanner`

### Task 4: ThemeClusterer Module

**Files:**
- Modify: `project-chronicle/generate.js`

- [ ] **Step 1: Add ThemeClusterer** — assigns commits directory signatures, groups by primary dir, sub-clusters by commit type, merges small clusters into nearest related, caps at maxThemes, links docs to themes by path overlap and keyword matching
- [ ] **Step 2: Wire into pipeline** — cluster commits, print theme names and counts
- [ ] **Step 3: Run and verify** — prints 5-15 themes with commit counts
- [ ] **Step 4: Commit** — `feat(project-chronicle): add ThemeClusterer module`

---

## Chunk 2: LLM Narrative and Markdown (Tasks 5-6)

### Task 5: NarrativeGenerator and Main Pipeline

**Files:**
- Modify: `project-chronicle/generate.js`

- [ ] **Step 1: Add NarrativeGenerator** — detects LLM caller (claude CLI or fallback to heuristic), builds per-theme prompts asking for JSON {name, motivation, keyDecisions, outcome}, builds project-level narrative prompt, generates heuristic fallback narrative
- [ ] **Step 2: Make main() async** — full pipeline: git parse, doc harvest, deep scan, cluster, LLM narrative, build chronicle data object, merge with existing data for incremental mode, save JSON
- [ ] **Step 3: Run with --no-llm** — `node project-chronicle/generate.js --path supp-db-site --no-llm` generates chronicle-data.json
- [ ] **Step 4: Commit** — `feat(project-chronicle): add NarrativeGenerator + full data pipeline`

### Task 6: MarkdownRenderer

**Files:**
- Modify: `project-chronicle/generate.js`

- [ ] **Step 1: Add MarkdownRenderer** — generates project narrative section, Mermaid mindmap (root node, theme branches, motivation and decision leaves), Mermaid timeline (grouped by month), per-theme detail sections with motivation/decisions/outcome/commit tables/doc links
- [ ] **Step 2: Add Mermaid text sanitizer** — strips chars that break Mermaid syntax
- [ ] **Step 3: Run and verify** — generates chronicle.md, verify Mermaid diagrams render at mermaid.live
- [ ] **Step 4: Commit** — `feat(project-chronicle): add MarkdownRenderer with Mermaid diagrams`

---

## Chunk 3: HTML Visualization and Registration (Tasks 7-9)

### Task 7: HtmlRenderer — D3 Visualization

**Files:**
- Modify: `project-chronicle/generate.js`

- [ ] **Step 1: Add D3 fetcher** — checks for local d3.v7.min.js, fetches from CDN if missing, caches locally
- [ ] **Step 2: Add CSS generator** — dark theme, header/tabs/search/main layout/detail panel/responsive styles
- [ ] **Step 3: Add app JS generator** — tab switching, theme list population, detail panel click handler, D3 force-directed mindmap (root + theme nodes + motivation + decision branches, zoom/pan/drag), D3 timeline (time axis, swim lanes per theme, commit dots sized by change volume, hover tooltips), search filter across both views, fallback HTML list if D3 unavailable
- [ ] **Step 4: Add HTML template** — assembles DOCTYPE, head with inline CSS, body with header/tabs/search/main/views/detail panel, inline D3 script, inline app JS with embedded chronicle data JSON
- [ ] **Step 5: Run full pipeline** — `node project-chronicle/generate.js --path supp-db-site --no-llm`, open index.html in browser
- [ ] **Step 6: Verify** — mindmap shows force-directed graph, timeline shows swim lanes, clicking nodes opens detail panel, search works, no console errors
- [ ] **Step 7: Commit** — `feat(project-chronicle): add HtmlRenderer with D3 mindmap + timeline`

### Task 8: Incremental Update Testing

- [ ] **Step 1: Run full build** — `node project-chronicle/generate.js --path supp-db-site --no-llm`
- [ ] **Step 2: Run incremental** — `node project-chronicle/generate.js --since-last --path supp-db-site --no-llm --note "Test"`
- [ ] **Step 3: Verify** — chronicle-data.json has merged data, no duplicate commits, session note present
- [ ] **Step 4: Commit** — `feat(project-chronicle): verify incremental updates`

### Task 9: SKILL.md Registration

**Files:**
- Create: `.claude/skills/project-chronicle/SKILL.md`

- [ ] **Step 1: Create SKILL.md** — name, description, allowed-tools, invocation examples, workflow steps (run generator, open in browser, commit), output table, pipeline overview, config reference, important notes
- [ ] **Step 2: Commit** — `feat(project-chronicle): register skill`

### Task 10: End-to-End Test

- [ ] **Step 1: Full rebuild** — `node project-chronicle/generate.js --path supp-db-site --note "Initial chronicle"`
- [ ] **Step 2: Verify HTML** — mindmap, timeline, detail panel, search, no console errors
- [ ] **Step 3: Verify Markdown** — Mermaid diagrams render, theme sections complete
- [ ] **Step 4: Test incremental** — make a commit, run --since-last, verify merge
- [ ] **Step 5: Final commit and push**
