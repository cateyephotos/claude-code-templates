# Evidence Updates

Dated Markdown reports produced by `scripts/pubmed-evidence-monitor.js`. Each
report surfaces **candidate new papers** — meta-analyses, systematic reviews,
and randomized controlled trials — that were published after a supplement's
latest known citation and that PubMed returns for the supplement's name.

The reports are _candidates_, not accepted citations. A human reviewer should
confirm relevance and study quality before promoting any entry into
`data/enhanced_citations/`.

## Running the monitor

```bash
# All 114 supplements — takes ~60–80 seconds at 3 req/sec
npm run evidence:check

# Narrow scope for testing
npm run evidence:check -- --only=ashwagandha,creatine
npm run evidence:check -- --since-year=2024 --force
npm run evidence:check -- --max-per-supp=5
npm run evidence:check -- --dry-run
```

### Rate limit

NCBI allows 3 req/sec without an API key and 10 req/sec with one. For weekly
runs across the full catalog, set `PUBMED_API_KEY` in your shell or CI
environment:

```bash
export PUBMED_API_KEY=your-ncbi-api-key
npm run evidence:check
```

Keys are free: <https://www.ncbi.nlm.nih.gov/account/settings/> → "API key
management."

## Outputs

- `docs/evidence-updates/{YYYY-MM-DD}.md` — human-readable report (this
  directory)
- `data/evidence-updates-latest.json` — latest-run machine-readable snapshot

## What counts as a "new paper"

A PubMed record is considered new if its PMID is not already referenced
anywhere in `data/enhanced_citations/{id}_{slug}_enhanced.js` for the
corresponding supplement.

The per-supplement cutoff year defaults to the most recent known citation
year (or `evidenceProfile.lastEvidenceUpdate` if present). Pass
`--since-year=YYYY` to override globally, or `--force` to scan supplements
whose most recent citation is already in the current calendar year.

## Scheduling (manual today)

The monitor is run manually today. A future follow-up can add one of:

- A GitHub Actions weekly cron that commits the Markdown report as a PR
- A Convex cron that posts new entries to an admin panel
- An email digest to the evidence curator

See the deferred BRO-50 follow-up tickets for details.
