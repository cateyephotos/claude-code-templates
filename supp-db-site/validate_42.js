const fs = require('fs');
const path = require('path');

const base = path.dirname(__filename);

// ── Validate 42_enhanced.js ──────────────────────────────────────────────────
const raw42 = fs.readFileSync(path.join(base, 'data/enhanced_citations/42_enhanced.js'), 'utf8');

const match42 = raw42.match(/const\s+\w+\s*=\s*(\{[\s\S]*?\});\s*\n*(?:\/\/|if\s*\(|module\.exports)/);
if (!match42) {
  console.error('FAIL: Could not extract object from 42_enhanced.js');
  process.exit(1);
}

let obj42;
try {
  obj42 = eval('(' + match42[1] + ')');
} catch(e) {
  console.error('FAIL: 42_enhanced.js parse error:', e.message);
  process.exit(1);
}

const errors = [];
const warnings = [];

// Required top-level fields
if (obj42.id !== 42)              errors.push('id should be 42, got: ' + obj42.id);
if (obj42.isEnhanced !== true)    errors.push('isEnhanced missing or not true at top level');
if (obj42.name !== 'Selenium')    warnings.push('name: ' + obj42.name + ' (expected Selenium)');

// evidenceProfile checks
const ep = obj42.evidenceProfile || {};
if (ep.totalCitations !== 16)         errors.push('totalCitations: expected 16, got ' + ep.totalCitations);
if (ep.researchQualityScore !== 67)   errors.push('researchQualityScore: expected 67, got ' + ep.researchQualityScore);
if (ep.lastEvidenceUpdate !== '2026-03-06') errors.push('lastEvidenceUpdate: expected 2026-03-06, got ' + ep.lastEvidenceUpdate);
if (ep.overallQuality !== 'Tier 2')   errors.push('overallQuality: expected Tier 2, got ' + ep.overallQuality);
if (ep.publicationSpan !== '2001-2018') errors.push('publicationSpan: expected 2001-2018, got ' + ep.publicationSpan);

// evidenceStrength labels
const es = ep.evidenceStrength || {};
if (es.clinicalBenefits !== 'Moderate') errors.push('evidenceStrength.clinicalBenefits: expected Moderate, got ' + es.clinicalBenefits);

// Check no duplicate standalone 'target' keys (not tissueTarget)
const targetOnlyLines = raw42.split('\n').filter(l => l.match(/^\s*"target"\s*:/));
if (targetOnlyLines.length > 0) errors.push('Found ' + targetOnlyLines.length + ' duplicate "target": lines remaining');

// Count actual citations
// NOTE: benefits is an array of health-domain objects, each with nested evidence[] arrays
// mechanisms, safety, dosage items = 1 citation each at top level
const cits = obj42.citations || {};
const mechCount = (cits.mechanisms || []).length;
// benefits: count evidence items within each health domain
const benCount = (cits.benefits || []).reduce((sum, domain) => {
  return sum + ((domain.evidence || []).length);
}, 0);
const safeCount = (cits.safety  || []).length;
const doseCount = (cits.dosage  || []).length;
const defCount  = (cits.deficiency || []).length;
const actualTotal = mechCount + benCount + safeCount + doseCount + defCount;
const benDomains = (cits.benefits || []).length;

if (actualTotal !== 16) errors.push('Actual citation count: ' + actualTotal + ' (expected 16) breakdown: mech=' + mechCount + ' ben=' + benCount + '(in ' + benDomains + ' domains) safe=' + safeCount + ' dose=' + doseCount + ' def=' + defCount);

// qualityAssurance totalVerifiedCitations
const qa = obj42.qualityAssurance || {};
if (qa.totalVerifiedCitations !== 16) errors.push('qualityAssurance.totalVerifiedCitations: expected 16, got ' + qa.totalVerifiedCitations);

console.log('=== 42_enhanced.js validation ===');
console.log('  id:', obj42.id, '| isEnhanced:', obj42.isEnhanced, '| name:', obj42.name);
console.log('  tier:', ep.overallQuality, '| score:', ep.researchQualityScore, '| totalCitations:', ep.totalCitations);
console.log('  publicationSpan:', ep.publicationSpan, '| lastUpdate:', ep.lastEvidenceUpdate);
console.log('  Citation breakdown: mech=' + mechCount + ' ben=' + benCount + ' safe=' + safeCount + ' dose=' + doseCount + ' def=' + defCount + ' = ' + actualTotal);
console.log('  clinicalBenefits label:', es.clinicalBenefits);
console.log('  qualityAssurance.totalVerifiedCitations:', qa.totalVerifiedCitations);

if (errors.length === 0) {
  console.log('  RESULT: PASS (' + (warnings.length > 0 ? warnings.length + ' warning(s)' : 'clean') + ')');
} else {
  console.log('  RESULT: FAIL');
  errors.forEach(e => console.log('    ERROR:', e));
}
if (warnings.length) warnings.forEach(w => console.log('    WARNING:', w));

// ── Validate supplements.js ID 42 entry ─────────────────────────────────────
console.log('');
console.log('=== supplements.js ID 42 entry validation ===');

const suppRaw = fs.readFileSync(path.join(base, 'data/supplements.js'), 'utf8');

// Find the ID 42 block
const id42Match = suppRaw.match(/"id"\s*:\s*42[\s\S]{0,5000}?"id"\s*:\s*43/);
const block42 = id42Match ? id42Match[0] : '';

const suppErrors = [];

if (!block42) {
  suppErrors.push('Could not locate ID 42 block in supplements.js');
} else {
  // Check isEnhanced at top level (should appear before primaryBenefits)
  const isEnhancedIdx = block42.indexOf('"isEnhanced"');
  const primaryBenIdx = block42.indexOf('"primaryBenefits"');
  if (isEnhancedIdx === -1) {
    suppErrors.push('isEnhanced not found in ID 42 block');
  } else if (primaryBenIdx !== -1 && isEnhancedIdx > primaryBenIdx) {
    suppErrors.push('isEnhanced appears AFTER primaryBenefits — not at top level');
  } else {
    console.log('  isEnhanced: found at top level (before primaryBenefits)');
  }

  // Check enhancedCitations block
  if (block42.includes('"enhancedCitations"')) {
    console.log('  enhancedCitations block: present');
  } else {
    suppErrors.push('enhancedCitations block missing from supplements.js ID 42');
  }

  // Check for score and tier in block
  if (block42.includes('"researchQualityScore": 67')) {
    console.log('  researchQualityScore: 67 (correct)');
  } else {
    suppErrors.push('researchQualityScore 67 not found in ID 42 enhancedCitations block');
  }

  if (block42.includes('"totalCitations": 16')) {
    console.log('  totalCitations: 16 (correct)');
  } else {
    suppErrors.push('totalCitations 16 not found in ID 42 enhancedCitations block');
  }

  if (block42.includes('"overallQuality": "Tier 2"')) {
    console.log('  overallQuality: Tier 2 (correct)');
  } else {
    suppErrors.push('overallQuality Tier 2 not found in ID 42 enhancedCitations block');
  }

  // Check keyCitations has 3 entries
  const keyCitStart = block42.indexOf('"keyCitations"');
  const keyCitSection = keyCitStart !== -1 ? block42.substring(keyCitStart, keyCitStart + 2000) : '';
  const pmidMatches = keyCitSection.match(/"pmid"/g) || [];
  if (pmidMatches.length >= 3) {
    console.log('  keyCitations: ' + pmidMatches.length + ' entries with PMIDs (correct, expected 3)');
  } else {
    suppErrors.push('keyCitations: expected 3 entries with PMIDs, found ' + pmidMatches.length);
  }

  // Verify old Berr 2000 citation is gone
  if (block42.includes('Berr')) {
    suppErrors.push('Old Berr et al. 2000 citation still present — should have been replaced');
  } else {
    console.log('  Old Berr 2000 citation: removed (correct)');
  }
}

if (suppErrors.length === 0) {
  console.log('  RESULT: PASS');
} else {
  console.log('  RESULT: FAIL');
  suppErrors.forEach(e => console.log('    ERROR:', e));
}

// ── Provenance files check ───────────────────────────────────────────────────
console.log('');
console.log('=== Provenance files check ===');
const provFiles = [
  'search_log.md',
  'screening_decisions.md',
  'evidence_evaluation.md',
  'synthesis_notes.md',
  'tier_assignment.md'
];
const provDir = path.join(base, 'content/provenance/selenium');
let provPass = true;
provFiles.forEach(f => {
  const fp = path.join(provDir, f);
  if (fs.existsSync(fp)) {
    const size = fs.statSync(fp).size;
    console.log('  ' + f + ': exists (' + size + ' bytes)');
  } else {
    console.log('  MISSING: ' + f);
    provPass = false;
  }
});
console.log('  RESULT: ' + (provPass ? 'PASS' : 'FAIL'));

// ── Overall result ───────────────────────────────────────────────────────────
console.log('');
const allPass = errors.length === 0 && suppErrors.length === 0 && provPass;
console.log('=== OVERALL VALIDATION: ' + (allPass ? 'PASS' : 'FAIL') + ' ===');
if (!allPass) process.exit(1);
