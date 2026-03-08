// Generate comprehensive audit report for all 89 supplements
const fs = require('fs');
const path = require('path');

// ============ 1. Load supplements.js data ============
const suppData = fs.readFileSync(path.join(__dirname, '..', 'data', 'supplements.js'), 'utf8');
const fn = new Function(suppData + '\nreturn supplementDatabase;');
const db = fn();
const supps = db.supplements;

// ============ 2. Scan enhanced_citations directory ============
const enhancedDir = path.join(__dirname, '..', 'data', 'enhanced_citations');
const allFiles = fs.readdirSync(enhancedDir).filter(f => f.endsWith('.js'));

// Build file map: id -> {named: [], generic: [], legacy: []}
const fileMap = {};
for (const f of allFiles) {
  const idMatch = f.match(/^(\d+)/);
  if (!idMatch) continue; // legacy files without ID
  const id = parseInt(idMatch[1]);
  if (!fileMap[id]) fileMap[id] = { named: [], generic: [] };
  if (f.match(/^\d+_enhanced\.js$/)) {
    fileMap[id].generic.push(f);
  } else {
    fileMap[id].named.push(f);
  }
}

// ============ 3. Check provenance directory ============
const provenanceDir = path.join(__dirname, '..', 'content', 'provenance');
let provenanceDirs = [];
if (fs.existsSync(provenanceDir)) {
  provenanceDirs = fs.readdirSync(provenanceDir).filter(f => {
    return f !== '.gitkeep' && fs.statSync(path.join(provenanceDir, f)).isDirectory();
  });
}

// ============ 4. Run audit checks ============
const today = new Date('2026-03-04');
const sixMonthsAgo = new Date('2025-09-04');
const twelveMonthsAgo = new Date('2025-03-04');

const issues = [];

for (const s of supps) {
  const id = s.id;
  const name = s.name;
  const files = fileMap[id] || { named: [], generic: [] };

  // CHECK 1: Stale evidence
  const lastUpdate = s.enhancedCitations && s.enhancedCitations.evidenceProfile
    ? s.enhancedCitations.evidenceProfile.lastEvidenceUpdate : null;

  if (!lastUpdate) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'stale_evidence', severity: 'critical',
      description: 'No lastEvidenceUpdate date recorded — evidence freshness unknown',
      suggestedAction: 'Run Mode 2 evidence update to establish baseline date'
    });
  } else {
    const updateDate = new Date(lastUpdate);
    if (updateDate < twelveMonthsAgo) {
      issues.push({
        supplementId: id, supplementName: name,
        issueType: 'stale_evidence', severity: 'critical',
        description: `Last evidence update was ${lastUpdate} (>12 months ago)`,
        suggestedAction: 'Run Mode 2 evidence update — high priority'
      });
    } else if (updateDate < sixMonthsAgo) {
      issues.push({
        supplementId: id, supplementName: name,
        issueType: 'stale_evidence', severity: 'warning',
        description: `Last evidence update was ${lastUpdate} (>6 months ago)`,
        suggestedAction: 'Schedule Mode 2 evidence update'
      });
    }
  }

  // CHECK 2: Missing canonical enhanced citation file
  if (files.named.length === 0 && files.generic.length > 0) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'missing_canonical_file', severity: 'warning',
      description: `Only generic ${id}_enhanced.js exists — no canonical named file`,
      suggestedAction: `Create canonical file following {id}_{slug}_enhanced.js naming convention`
    });
  } else if (files.named.length === 0 && files.generic.length === 0) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'no_enhanced_file', severity: 'critical',
      description: 'No enhanced citation file exists at all',
      suggestedAction: 'Run Mode 1 or Mode 2 to generate enhanced citation file'
    });
  }

  // CHECK 3: Missing inline enhanced citations data in supplements.js
  if (!s.enhancedCitations || !s.enhancedCitations.isEnhanced) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'incomplete_enhanced', severity: 'warning',
      description: 'enhancedCitations.isEnhanced is false or missing in supplements.js',
      suggestedAction: 'Update supplements.js entry with enhanced citation profile'
    });
  }

  // CHECK 4: Missing evidence profile
  if (!s.enhancedCitations || !s.enhancedCitations.evidenceProfile ||
      !s.enhancedCitations.evidenceProfile.researchQualityScore) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'missing_quality_score', severity: 'warning',
      description: 'No researchQualityScore in evidenceProfile — evidence quality unscored',
      suggestedAction: 'Calculate and populate researchQualityScore during next Mode 2 run'
    });
  }

  // CHECK 5: Missing DOIs in key citations
  if (s.keyCitations) {
    const missingDois = s.keyCitations.filter(c => !c.doi).length;
    if (missingDois > 0) {
      issues.push({
        supplementId: id, supplementName: name,
        issueType: 'missing_doi', severity: 'warning',
        description: `${missingDois} of ${s.keyCitations.length} key citations missing DOI`,
        suggestedAction: 'Validate and add DOIs using citation-management skill'
      });
    }
  }

  // CHECK 6: Missing safety data
  if (!s.safetyProfile || !s.safetyProfile.rating) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'missing_safety', severity: 'critical',
      description: 'No safety profile or safety rating defined',
      suggestedAction: 'Add safety profile with rating, side effects, contraindications, and drug interactions'
    });
  } else {
    if (!s.safetyProfile.commonSideEffects || s.safetyProfile.commonSideEffects.length === 0) {
      issues.push({
        supplementId: id, supplementName: name,
        issueType: 'missing_safety', severity: 'warning',
        description: 'Safety profile exists but commonSideEffects is empty',
        suggestedAction: 'Add documented side effects from clinical literature'
      });
    }
    if (!s.safetyProfile.drugInteractions || s.safetyProfile.drugInteractions.length === 0) {
      issues.push({
        supplementId: id, supplementName: name,
        issueType: 'missing_safety', severity: 'info',
        description: 'No drug interactions listed (may be genuinely none, or data gap)',
        suggestedAction: 'Verify no known interactions or document known ones'
      });
    }
  }

  // CHECK 7: Effect size gaps
  if (!s.effectSizes || Object.keys(s.effectSizes).length === 0) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'no_effect_sizes', severity: 'warning',
      description: 'No quantitative effect sizes documented',
      suggestedAction: 'Extract and document effect sizes (Cohen\'s d, SMD) from key RCTs'
    });
  }

  // CHECK 8: Tier vs citation quality mismatch (basic heuristic)
  const tier = s.evidenceTier;
  const totalCitations = s.enhancedCitations && s.enhancedCitations.evidenceProfile
    ? s.enhancedCitations.evidenceProfile.totalCitations : 0;

  if (tier === 1 && totalCitations < 10) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'tier_mismatch', severity: 'warning',
      description: `Tier 1 (Gold Standard) but only ${totalCitations || 'unknown'} total citations — may be insufficient`,
      suggestedAction: 'Verify tier assignment with evidence decision tree; consider downgrade if criteria not met'
    });
  }
  if (tier === 4 && totalCitations > 15) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'tier_mismatch', severity: 'info',
      description: `Tier 4 (Emerging) but ${totalCitations} citations — may warrant upgrade`,
      suggestedAction: 'Re-evaluate tier using decision tree; may qualify for Tier 3 or higher'
    });
  }

  // CHECK 9: Missing provenance trail
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  if (!provenanceDirs.includes(slug)) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'missing_provenance', severity: 'info',
      description: 'No provenance trail documents exist for this supplement',
      suggestedAction: 'Generate provenance trail during next pipeline run'
    });
  }

  // CHECK 10: Missing dosage data
  if (!s.dosageRange) {
    issues.push({
      supplementId: id, supplementName: name,
      issueType: 'missing_dosage', severity: 'warning',
      description: 'No dosage range specified',
      suggestedAction: 'Document evidence-based dosage range from clinical literature'
    });
  }

  // CHECK 11: Inline citation sections completeness
  const inlineMech = s.enhancedCitations && s.enhancedCitations.mechanisms ? s.enhancedCitations.mechanisms.length : 0;
  const inlineBen = s.enhancedCitations && s.enhancedCitations.benefits ? s.enhancedCitations.benefits.length : 0;
  const inlineSafe = s.enhancedCitations && s.enhancedCitations.safety ? s.enhancedCitations.safety.length : 0;

  if (s.enhancedCitations && s.enhancedCitations.isEnhanced) {
    if (inlineMech === 0 && inlineBen === 0 && inlineSafe === 0) {
      issues.push({
        supplementId: id, supplementName: name,
        issueType: 'incomplete_enhanced', severity: 'warning',
        description: 'enhancedCitations marked as enhanced but has no inline mechanisms/benefits/safety arrays',
        suggestedAction: 'The enhanced data lives in the external file — verify the external file has proper data'
      });
    }
  }
}

// ============ 5. Enhanced file schema checks (read the saved audit results) ============
// We'll add file-level issues from the enhanced audit directly

// ============ 6. Build summary ============
const criticalCount = issues.filter(i => i.severity === 'critical').length;
const warningCount = issues.filter(i => i.severity === 'warning').length;
const infoCount = issues.filter(i => i.severity === 'info').length;

// Calculate health score
const maxScore = 100;
const criticalPenalty = 3; // per critical issue
const warningPenalty = 1;  // per warning
const rawScore = Math.max(0, maxScore - (criticalCount * criticalPenalty) - (warningCount * warningPenalty));
const healthScore = Math.round(rawScore);

// Issue type distribution
const issueTypeCounts = {};
for (const issue of issues) {
  issueTypeCounts[issue.issueType] = (issueTypeCounts[issue.issueType] || 0) + 1;
}

// Supplements with most issues
const issueCountBySupp = {};
for (const issue of issues) {
  const key = `${issue.supplementId}_${issue.supplementName}`;
  issueCountBySupp[key] = (issueCountBySupp[key] || 0) + 1;
}
const topIssueSupps = Object.entries(issueCountBySupp)
  .map(([key, count]) => {
    const [id, ...nameParts] = key.split('_');
    return { id: parseInt(id), name: nameParts.join('_'), issueCount: count };
  })
  .sort((a, b) => b.issueCount - a.issueCount)
  .slice(0, 20);

// Tier distribution
const tierDist = { 1: 0, 2: 0, 3: 0, 4: 0 };
for (const s of supps) {
  tierDist[s.evidenceTier] = (tierDist[s.evidenceTier] || 0) + 1;
}

// Supplements with lastEvidenceUpdate
const withUpdate = supps.filter(s =>
  s.enhancedCitations && s.enhancedCitations.evidenceProfile &&
  s.enhancedCitations.evidenceProfile.lastEvidenceUpdate
).length;

// Supplements with quality scores
const withQualityScore = supps.filter(s =>
  s.enhancedCitations && s.enhancedCitations.evidenceProfile &&
  s.enhancedCitations.evidenceProfile.researchQualityScore
).length;

const report = {
  auditDate: '2026-03-04',
  auditMode: 'Mode 5 — Full Database Evidence Audit',
  databaseVersion: db.metadata.version,
  databaseLastUpdated: db.metadata.lastUpdated,
  supplementsAudited: supps.length,
  issues: issues,
  summary: {
    critical: criticalCount,
    warnings: warningCount,
    info: infoCount,
    totalIssues: issues.length,
    overallHealthScore: healthScore,
    issueTypeDistribution: issueTypeCounts,
    topIssueSupplements: topIssueSupps
  },
  databaseStatistics: {
    totalSupplements: supps.length,
    tierDistribution: tierDist,
    supplementsWithLastEvidenceUpdate: withUpdate,
    supplementsWithoutLastEvidenceUpdate: supps.length - withUpdate,
    supplementsWithQualityScore: withQualityScore,
    supplementsWithoutQualityScore: supps.length - withQualityScore,
    supplementsWithEffectSizes: supps.filter(s => s.effectSizes && Object.keys(s.effectSizes).length > 0).length,
    supplementsWithSafetyProfile: supps.filter(s => s.safetyProfile && s.safetyProfile.rating).length,
    supplementsWithDosageRange: supps.filter(s => s.dosageRange).length,
    enhancedCitationFiles: {
      total: allFiles.length,
      namedFiles: Object.values(fileMap).reduce((sum, v) => sum + v.named.length, 0),
      genericFiles: Object.values(fileMap).reduce((sum, v) => sum + v.generic.length, 0),
      supplementsWithNamedFiles: Object.entries(fileMap).filter(([_, v]) => v.named.length > 0).length,
      supplementsWithOnlyGenericFiles: Object.entries(fileMap).filter(([_, v]) => v.named.length === 0 && v.generic.length > 0).length,
      supplementsWithNoFiles: supps.filter(s => !fileMap[s.id] || (fileMap[s.id].named.length === 0 && fileMap[s.id].generic.length === 0)).length
    },
    provenanceTrails: {
      supplementsWithProvenance: provenanceDirs.length,
      supplementsWithoutProvenance: supps.length - provenanceDirs.length
    }
  }
};

// Write JSON report
const outputDir = path.join(__dirname, '..', 'content', 'audits');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, '2026-03-04_full_audit_report.json'),
  JSON.stringify(report, null, 2)
);

console.log('AUDIT REPORT GENERATED');
console.log('Critical:', criticalCount);
console.log('Warnings:', warningCount);
console.log('Info:', infoCount);
console.log('Health Score:', healthScore, '/ 100');
console.log('Issue Types:', JSON.stringify(issueTypeCounts));
console.log('Tier Distribution:', JSON.stringify(tierDist));
console.log('With Evidence Update Date:', withUpdate, '/', supps.length);
console.log('With Quality Score:', withQualityScore, '/', supps.length);
console.log('---TOP_ISSUES---');
for (const s of topIssueSupps) {
  console.log(`  ID ${s.id} ${s.name}: ${s.issueCount} issues`);
}
