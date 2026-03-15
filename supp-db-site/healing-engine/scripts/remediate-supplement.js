'use strict';

const fs = require('fs');
const path = require('path');
const { flagSingleFile } = require('./flag-evidence-quality');
const { reResearchSupplement } = require('./re-research-supplement');
const { buildReplacementPlan, applyReplacementPlan } = require('./verify-replacements');
const { regenerateAllPages } = require('./regenerate-and-diff');

const REPORT_DIR = path.join(__dirname, '..', '..', '..', 'healing-reports', 'remediation');

async function remediateSupplement(filename, options = {}) {
  const { dryRun = false, minRelevance = 0.5, skipRegenerate = false } = options;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`REMEDIATION: ${filename}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('='.repeat(60));

  // Phase 1: Flag
  console.log('\n--- Phase 1: Flagging evidence quality ---');
  const quality = await flagSingleFile(filename);
  if (!quality) { console.error('Failed to load file'); return null; }

  console.log(`  Total evidence: ${quality.totalEvidence}`);
  console.log(`  Verified: ${quality.verified} | Mismatched: ${quality.mismatched} | Unverifiable: ${quality.unverifiable}`);
  console.log(`  Reliability: ${quality.reliabilityScore}%`);

  if (quality.mismatched === 0 && quality.unverifiable === 0) {
    console.log('\nAll evidence verified - no remediation needed');
    return { file: filename, status: 'clean', quality };
  }

  // Phase 2: Re-research
  console.log('\n--- Phase 2: Re-researching claims via PubMed ---');
  const reResearch = await reResearchSupplement(filename, {
    onlyMismatched: true,
    maxCandidatesPerClaim: 5
  });
  console.log(`  Claims researched: ${reResearch.totalClaims}`);
  console.log(`  Claims with candidates: ${reResearch.claimsWithCandidates}`);
  console.log(`  Average top score: ${reResearch.avgTopScore}`);

  // Phase 3: Build and review replacement plan
  console.log('\n--- Phase 3: Building replacement plan ---');
  const plan = buildReplacementPlan(reResearch, { minRelevance });
  console.log(`  Replacements planned: ${plan.summary.replacing}`);
  console.log(`  Skipped (low relevance): ${plan.summary.skipping}`);

  if (plan.replacements.length > 0) {
    console.log('\n  Proposed replacements:');
    for (const r of plan.replacements) {
      console.log(`    [${r.section}] "${r.claimText.substring(0, 50)}..."`);
      console.log(`      Old: PMID ${r.oldEvidence[0]?.pmid || 'none'} | "${(r.oldEvidence[0]?.title || 'no title').substring(0, 50)}"`);
      console.log(`      New: PMID ${r.newPmid} | "${r.newTitle.substring(0, 50)}..." (score: ${r.relevanceScore})`);
    }
  }

  // Apply
  if (!dryRun && plan.replacements.length > 0) {
    console.log('\n--- Applying replacements ---');
    const applied = applyReplacementPlan(plan);
    console.log(`  Applied ${applied.applied} of ${applied.total} replacements`);

    // Re-flag to verify improvement
    console.log('\n--- Re-flagging after remediation ---');
    const postQuality = await flagSingleFile(filename);
    console.log(`  Reliability: ${quality.reliabilityScore}% -> ${postQuality.reliabilityScore}%`);

    // Phase 4: Regenerate
    if (!skipRegenerate) {
      console.log('\n--- Phase 4: Regenerating pages ---');
      const regen = await regenerateAllPages();
      console.log(`  Generators run: ${regen.generators}, errors: ${regen.errors.length}`);
    }
  }

  // Save report
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
  const report = { quality, reResearch, plan, timestamp: new Date().toISOString(), dryRun };
  const reportName = filename.replace('_enhanced.js', '-remediation.json');
  fs.writeFileSync(path.join(REPORT_DIR, reportName), JSON.stringify(report, null, 2));
  console.log(`\nReport: healing-reports/remediation/${reportName}`);

  return report;
}

// CLI
if (require.main === module) {
  const targetFile = process.argv.find(a => a.endsWith('_enhanced.js'));
  const dryRun = process.argv.includes('--dry-run');
  const skipRegen = process.argv.includes('--skip-regenerate');

  if (!targetFile) {
    console.error('Usage: node remediate-supplement.js <filename_enhanced.js> [--dry-run] [--skip-regenerate]');
    process.exit(1);
  }

  remediateSupplement(path.basename(targetFile), { dryRun, skipRegenerate: skipRegen })
    .catch(console.error);
}

module.exports = { remediateSupplement };
