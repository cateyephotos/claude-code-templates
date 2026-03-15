'use strict';

const fs = require('fs');
const path = require('path');
const { loadEnhancedFile, writeEnhancedFile } = require('../utils/schema');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
const ARCHIVE_DIR = path.join(ENH_DIR, '_archive');

/**
 * Given re-research results, build a replacement plan filtering by relevance.
 */
function buildReplacementPlan(reResearchResult, options = {}) {
  const { minRelevance = 0.5 } = options;

  const replacements = [];
  const skipped = [];

  for (const claim of reResearchResult.claims) {
    const bestCandidate = claim.candidates[0];
    if (!bestCandidate || bestCandidate.relevanceScore < minRelevance) {
      skipped.push({
        section: claim.section, citationIdx: claim.citationIdx,
        claimText: claim.claimText,
        reason: bestCandidate
          ? `Best candidate score ${bestCandidate.relevanceScore} < threshold ${minRelevance}`
          : 'No candidates found'
      });
      continue;
    }

    replacements.push({
      section: claim.section,
      citationIdx: claim.citationIdx,
      claimText: claim.claimText,
      oldEvidence: claim.currentEvidence,
      newPmid: bestCandidate.pmid,
      newDoi: bestCandidate.doi,
      newTitle: bestCandidate.title,
      newAuthors: bestCandidate.authors,
      newYear: bestCandidate.year,
      newJournal: bestCandidate.journal,
      relevanceScore: bestCandidate.relevanceScore,
      allCandidates: claim.candidates
    });
  }

  return {
    file: reResearchResult.file,
    supplementName: reResearchResult.supplementName,
    replacements,
    skipped,
    summary: {
      totalClaims: reResearchResult.claims.length,
      replacing: replacements.length,
      skipping: skipped.length
    }
  };
}

/**
 * Apply a replacement plan to the enhanced citation file.
 * Archives the original file first.
 */
function applyReplacementPlan(plan, options = {}) {
  const { dryRun = false } = options;
  const filePath = path.join(ENH_DIR, plan.file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Archive original
  if (!dryRun) {
    if (!fs.existsSync(ARCHIVE_DIR)) fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    const archiveName = plan.file.replace('.js', `.pre-remediation-${Date.now()}.js`);
    fs.copyFileSync(filePath, path.join(ARCHIVE_DIR, archiveName));
  }

  const data = loadEnhancedFile(filePath);
  if (!data || !data.citations) {
    throw new Error(`Could not load enhanced data from ${plan.file}`);
  }

  let applied = 0;
  for (const repl of plan.replacements) {
    const sectionArr = data.citations[repl.section];
    if (!sectionArr || !sectionArr[repl.citationIdx]) continue;

    const citation = sectionArr[repl.citationIdx];
    if (!citation.evidence || !Array.isArray(citation.evidence)) {
      citation.evidence = [];
    }

    // Replace the first evidence item (or add one if empty)
    const newEvidence = {
      citationId: `${repl.newAuthors[0] ? repl.newAuthors[0].split(' ').pop().toLowerCase() : 'unknown'}_${repl.newYear || 'nd'}`,
      title: repl.newTitle,
      authors: repl.newAuthors,
      year: repl.newYear,
      journal: repl.newJournal,
      doi: repl.newDoi,
      pmid: repl.newPmid,
      studyType: '',
      evidenceLevel: '',
      findings: citation.evidence[0] ? (citation.evidence[0].findings || '') : '',
      methodology: ''
    };

    if (citation.evidence.length > 0) {
      // Preserve fields that the new data doesn't have
      const old = citation.evidence[0];
      newEvidence.studyType = old.studyType || '';
      newEvidence.evidenceLevel = old.evidenceLevel || '';
      newEvidence.findings = old.findings || '';
      newEvidence.methodology = old.methodology || '';
      if (old.sampleSize) newEvidence.sampleSize = old.sampleSize;
      if (old.duration) newEvidence.duration = old.duration;
      if (old.keyFindings) newEvidence.keyFindings = old.keyFindings;
      if (old.effectSize) newEvidence.effectSize = old.effectSize;
      if (old.pValue) newEvidence.pValue = old.pValue;
      if (old.confidenceInterval) newEvidence.confidenceInterval = old.confidenceInterval;

      citation.evidence[0] = newEvidence;
    } else {
      citation.evidence.push(newEvidence);
    }

    applied++;
  }

  if (!dryRun && applied > 0) {
    writeEnhancedFile(filePath, data, { sourceFile: filePath });
  }

  return { file: plan.file, applied, total: plan.replacements.length, dryRun };
}

// CLI
if (require.main === module) {
  const reportFile = process.argv.find(a => a.endsWith('.json'));
  const dryRun = process.argv.includes('--dry-run');

  if (!reportFile) {
    console.error('Usage: node verify-replacements.js <remediation-report.json> [--dry-run]');
    process.exit(1);
  }

  const reResearchResult = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  const plan = buildReplacementPlan(reResearchResult, { minRelevance: 0.5 });

  console.log(`Replacement plan for ${plan.file}:`);
  console.log(`  Replacing: ${plan.summary.replacing} citations`);
  console.log(`  Skipping: ${plan.summary.skipping} (below relevance threshold)`);

  if (plan.replacements.length > 0) {
    console.log('\n--- Replacements ---');
    for (const r of plan.replacements) {
      console.log(`  [${r.section}] "${r.claimText.substring(0, 60)}..."`);
      console.log(`    -> ${r.newTitle.substring(0, 70)} (PMID ${r.newPmid}, score ${r.relevanceScore})`);
    }
  }

  if (!dryRun && plan.replacements.length > 0) {
    const result = applyReplacementPlan(plan, { dryRun });
    console.log(`\nApplied ${result.applied} replacements to ${result.file}`);
  } else if (dryRun) {
    console.log('\n(dry run - no changes applied)');
  }
}

module.exports = { buildReplacementPlan, applyReplacementPlan };
