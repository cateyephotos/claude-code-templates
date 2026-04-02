# Project Chronicle — Design Spec

**Date:** 2026-04-02
**Status:** Approved
**Skill name:** `/project-chronicle`

## Problem

Development happens across many sessions, branches, and planning documents. The motivations behind commits, the decisions that shaped architecture, and the reasoning that drove priorities are scattered across git history, planning docs, memory files, and skill definitions. There is no single view that reconstructs the "why" behind a project's evolution across time.

## Solution

A Claude Code skill that mines all available project artifacts — git history, planning documents, session memory, skill definitions, and source code annotations — to reconstruct the development narrative. It clusters work into coherent themes, uses an LLM to generate human-readable names and motivation statements, and renders the result as both an interactive HTML visualization and a portable Markdown document with Mermaid diagrams.

## Invocation

```
/project-chronicle                              # full rebuild from all history
/project-chronicle --since-last                 # append since last run (incremental)
/project-chronicle --theme "Citation System"    # regenerate one theme only
/project-chronicle --deep                       # include .claude/ memory, skills, TODOs
/project-chronicle --path supp-db-site          # scope to subdirectory
```

## Outputs

| File | Purpose |
|------|---------|
| `project-chronicle/index.html` | Interactive visualization (mindmap + timeline + detail panel) |
| `project-chronicle/chronicle.md` | Markdown with Mermaid diagrams (renders on GitHub/Obsidian) |
| `project-chronicle/chronicle-data.json` | Structured data for incremental updates |
| `project-chronicle/config.json` | User configuration (project name, paths, theme) |

## Data Mining Pipeline

### Stage 1 — Git Archaeology (always runs)

- Parse all commits: message, author, date, files changed, diff stats via `git log`
- Extract branch names and merge patterns
- Detect PR/issue references in commit messages (`#123`, `gh pr`)
- Build a file-change adjacency graph (files that change together belong to the same workstream)

### Stage 2 — Document Harvesting (always runs)

- Scan `docs/` recursively for `.md` files — extract titles, dates, section headings
- Parse planning docs (`specs/`, `plans/`) for stated goals, decisions, trade-offs
- Parse phase completion reports for milestone markers and outcome summaries
- Read `CLAUDE.md` and memory files for persisted learnings and project rules
- Read `sprint-journal/journal-data.json` for session narratives
- Read `CHANGELOG.md`, `ROADMAP.md`, `PROJECT_STATUS.md` for stated intentions

### Stage 3 — Deep Artifacts (only with `--deep`)

- Scan `.claude/skills/*/SKILL.md` for workflow decisions embedded in skill definitions
- Scan `.claude/projects/*/memory/` for cross-session memory
- Extract TODO/FIXME comments from source files with surrounding context
- Parse issue/PR references found in commits against GitHub API (if `gh` CLI available)

### Stage 4 — Heuristic Clustering

- **Primary:** Group commits by file-path proximity (files in same directory changing together)
- **Secondary:** Group by commit message prefix patterns (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Tertiary:** Group by temporal proximity (commits within same session/day on same files)
- **Output:** 5-15 raw clusters, each with a list of commits, affected files, and associated docs
- **Config:** `maxThemes` (default 15), `minCommitsPerTheme` (default 3). Clusters below the min threshold merge into the nearest related cluster.

### Stage 5 — LLM Narrative Pass

- For each cluster, feed: top 10 commit messages, associated doc titles/excerpts, file paths
- Claude generates per-theme:
  - **Theme name** (3-5 words, e.g., "Citation Data Integrity")
  - **Motivation statement** (1 sentence — why this work existed)
  - **Key decisions** (2-3 bullet points of choices made and why)
  - **Outcome summary** (1 sentence of what was achieved)
- Also generates a **project-level narrative** (2-3 paragraphs telling the overall story)
- **LLM integration:** Uses `@anthropic-ai/sdk` if installed, falls back to `claude` CLI shell exec, falls back to heuristic-only names if no API access

## Visualization

### Interactive HTML (`index.html`)

Three interconnected views in a single self-contained page. No external dependencies, works offline.

**View 1 — Mindmap (default landing view)**
- Central node: project name
- First ring: theme nodes (color-coded, sized by commit count)
- Second ring: motivation statements branching from each theme
- Third ring: key decisions as leaf nodes
- Click any node to highlight its commits in the timeline view
- Hover shows the outcome summary

**View 2 — Timeline (swim lane)**
- Horizontal time axis (dates)
- Vertical swim lanes, one per theme
- Each commit is a dot on its theme's lane, sized by files changed
- Milestone markers (phase completions, major features) shown as diamond nodes
- Zoom/pan with mouse. Click a commit dot to see full message, files, linked docs
- Session blocks shown as shaded regions grouping same-day commits

**View 3 — Detail Panel (right sidebar)**
- Opens when clicking any node in mindmap or timeline
- Shows: commit message, files changed, linked planning docs (clickable), motivation context, related commits in same theme
- For doc-linked nodes: shows relevant excerpt from planning/spec doc

**Navigation:**
- Tab bar to switch views, or side-by-side (mindmap left, timeline right) on wide screens
- Global search: keyword highlights across both views
- Filter by theme, date range, or commit type

**Rendering technology:**
- D3.js bundled inline (~90KB minified) for force-directed mindmap and axis-based timeline
- Plain HTML/CSS for detail panel and search
- Total bundle: ~120KB self-contained HTML
- Responsive: flexbox, stacks vertically on narrow screens

### Markdown Output (`chronicle.md`)

```markdown
# Project Chronicle: {ProjectName}

## Project Narrative
{LLM-generated 2-3 paragraph story}

## Theme Map
\`\`\`mermaid
mindmap
  root(({ProjectName}))
    Theme 1
      Motivation
      Key Decision A
      Key Decision B
    Theme 2
      ...
\`\`\`

## Timeline
\`\`\`mermaid
timeline
    title Development Timeline
    Phase 1 : Milestone A : Milestone B
    Phase 2 : Milestone C
\`\`\`

## Themes

### 1. {Theme Name}
**Motivation:** {why}
**Key Decisions:**
- {decision 1}
- {decision 2}
**Outcome:** {what was achieved}
**Commits:** {count} | **Docs:** {linked doc names}

#### Milestones
| Date | Event | Detail |
|------|-------|--------|

#### Key Commits
| Date | Message | Files |
|------|---------|-------|
```

## Generator Architecture

**`project-chronicle/generate.js`** — single Node.js script.

**Internal modules (all in one file):**

| Module | Responsibility |
|--------|---------------|
| `GitArchaeologist` | Shells out to `git log`/`git diff`, parses into structured commit objects |
| `DocHarvester` | Reads/parses markdown files, extracts titles, dates, sections, excerpts |
| `DeepArtifactScanner` | `.claude/` memory, skills, TODO/FIXME extraction (--deep only) |
| `ThemeClusterer` | Heuristic grouping by path/prefix/temporal proximity |
| `NarrativeGenerator` | Formats cluster data, calls Claude for theme names + narrative |
| `HtmlRenderer` | Builds self-contained HTML with inline D3.js, CSS, app JS |
| `MarkdownRenderer` | Builds chronicle.md with Mermaid diagram blocks |
| `DataPersistence` | Reads/writes chronicle-data.json for incremental updates |

**Incremental updates (`--since-last`):**
- Reads existing `chronicle-data.json` for previously processed commits
- Only processes new commits since last recorded SHA
- Merges new commits into existing clusters (may create new themes or extend existing)
- Re-runs LLM narrative pass only on themes that received new commits
- Preserves manually edited theme names if present in JSON

**Configuration (`project-chronicle/config.json`):**
```json
{
  "projectName": "SupplementDB",
  "pathFilter": "supp-db-site",
  "docPaths": ["docs/", "supp-db-site/docs/"],
  "excludePatterns": ["node_modules", "archive", ".pre-"],
  "theme": "dark",
  "maxThemes": 15,
  "minCommitsPerTheme": 3
}
```

## CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--since-last` | off | Incremental: only process commits since last run |
| `--deep` | off | Include .claude/ memory, skills, TODOs |
| `--path <dir>` | repo root | Scope commits to subdirectory |
| `--theme <name>` | all | Regenerate only one named theme |
| `--note <text>` | none | Add manual session note to current entry |
| `--no-llm` | off | Skip LLM pass, use heuristic names only |
| `--config <path>` | `project-chronicle/config.json` | Custom config file |

## Error Handling

- If `git` is not available: exit with clear error message
- If no commits found (empty repo or bad path filter): exit with guidance
- If LLM API unavailable: fall back to heuristic-only names, warn in output
- If `chronicle-data.json` is corrupted: backup to `.bak`, rebuild from scratch
- If D3.js inline bundle fails: fall back to a simple HTML table view

## Testing Strategy

- Run on the SupplementDB repo (215+ commits, 50+ docs) as the primary test case
- Verify: all commits appear in at least one theme
- Verify: no theme has fewer than `minCommitsPerTheme` commits
- Verify: HTML opens in browser with working mindmap, timeline, and detail panel
- Verify: Mermaid diagrams render in GitHub markdown preview
- Verify: `--since-last` correctly appends without losing existing themes
- Verify: `--no-llm` produces complete output with mechanical names
