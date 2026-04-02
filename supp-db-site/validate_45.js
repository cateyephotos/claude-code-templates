const fs = require('fs');
const path = require('path');

const base = path.dirname(__filename);

// ── Validate 45_enhanced.js ──────────────────────────────────────────────────
const raw45 = fs.readFileSync(path.join(base, 'data/enhanced_citations/45_enhanced.js'), 'utf8');

const match45 = raw45.match(/const\s+\w+\s*=\s*(\{[\s\S]*?\});\s*\n*(?:\/\/|if\s*\(|module\.exports)/);
if (!match45) {
  console.error('FAIL: Could not extract object from 45_enhanced.js');
  process.exit(1);
}

let obj45;
try {
  obj45 = eval('(' + match45[1] + ')');
} catch(e) {
  console.error('FAIL: 45_enhanced.js parse error:', e.message);
  process.exit(1);
}

const errors = [];
const warnings = [];

// Required top-level fields
if (obj45.id !== 45)              errors.push('id should be 45, got: ' + obj45.id);
if (obj45.isEnhanced !== true)    errors.push('isEnhanced missing or not true at top level');
if (obj45.name !== 'Lutein')      warnings.push('name: ' + obj45.name + ' (expected Lutein)');

// evidenceProfile checks
const ep = obj45.evidenceProfile || {};
if (ep.totalCitations !== 17)               errors.push('totalCitations: expected 17, got ' + ep.totalCitations);
if (ep.researchQualityScore !== 70)         errors.push('researchQualityScore: expected 70, got ' + ep.researchQualityScore);
if (ep.lastEvidenceUpdate !== '2026-03-06') errors.push('lastEvidenceUpdate: expected 2026-03-06, got ' + ep.lastEvidenceUpdate);
if (ep.overallQuality !== 'Tier 2')         errors.push('overallQuality: expected Tier 2, got ' + ep.overallQuality);
if (ep.publicationSpan !== '1993-2018')     errors.push('publicationSpan: expected 1993-2018, got ' + ep.publicationSpan);

// evidenceStrength labels
const es = ep.evidenceStrength || {};
if (es.clinicalBenefits !== 'Moderate') errors.push('evidenceStrength.clinicalBenefits: expected Moderate, got ' + es.clinicalBenefits);

// Citation structure: flat arrays
const cits = obj45.citations || {};
const mechCount = (cits.mechanisms || []).length;
const benCount  = (cits.benefits  || []).length;
const safeCount = (cits.safety    || []).length;
const doseCount = (cits.dosage    || []).length;
const actualTotal = mechCount + benCount + safeCount + doseCount;

if (mechCount !== 5) errors.push('mechanisms count: expected 5, got ' + mechCount);
if (benCount  !== 6) errors.push('benefits count: expected 6, got ' + benCount);
if (safeCount !== 3) errors.push('safety count: expected 3, got ' + safeCount);
if (doseCount !== 3) errors.push('dosage count: expected 3, got ' + doseCount);
if (actualTotal !== 17) errors.push('Actual citation count: ' + actualTotal + ' (expected 17) — mech=' + mechCount + ' ben=' + benCount + ' safe=' + safeCount + ' dose=' + doseCount);

// qualityAssurance
const qa = obj45.qualityAssurance || {};
if (qa.doiVerificationDate !== '2026-03-06') errors.push('qualityAssurance.doiVerificationDate: expected 2026-03-06, got ' + qa.doiVerificationDate);
if (qa.totalVerifiedCitations !== 17) errors.push('qualityAssurance.totalVerifiedCitations: expected 17, got ' + qa.totalVerifiedCitations);

// Verify key PMIDs are present in citations
const allCitText = JSON.stringify(obj45.citations || {});
const expectedPMIDs = {
  '19168000': 'Roberts 2009 (mech)',
  '23572691': 'Sindhu 2010 (mech)',
  '24923778': 'Widomska 2014 (mech)',
  '11157880': 'Beatty 2001 (mech)',
  '8407219':  'Bone 1993 (mech)',
  '23644932': 'AREDS2 2013 (ben)',
  '29933554': 'Buscemi 2018 (ben)',
  '15019385': 'Richer 2004 (ben)',
  '10565517': 'Chasan-Taber 1999 (ben)',
  '16292668': 'Bahrami 2006 (ben)',
  '21856009': 'Weigert 2011 (ben)',
  '28012999': 'Ranard 2017 (safe)',
  '18515595': 'Obana 2008 (safe)',
  '15287677': 'Higuera-Ciapara 2004 (safe)',
  '11985953': 'Bowen 2002 (dose)',
  '17525179': 'Trieschmann 2007 (dose)',
  '12634107': 'Bone 2003 (dose)'
};
const missingPMIDs = [];
Object.entries(expectedPMIDs).forEach(([pmid, label]) => {
  if (!allCitText.includes('"' + pmid + '"')) missingPMIDs.push(pmid + ' (' + label + ')');
});
if (missingPMIDs.length > 0) errors.push('Missing PMIDs: ' + missingPMIDs.join(', '));

// Verify no cross-domain PMID duplicates
const allCitArrays = [
  ...(cits.mechanisms || []).map(c => ({ pmid: c.pmid, domain: 'mechanisms' })),
  ...(cits.benefits   || []).map(c => ({ pmid: c.pmid, domain: 'benefits'   })),
  ...(cits.safety     || []).map(c => ({ pmid: c.pmid, domain: 'safety'     })),
  ...(cits.dosage     || []).map(c => ({ pmid: c.pmid, domain: 'dosage'     }))
];
const pmidSeen = {};
const dupPMIDs = [];
allCitArrays.forEach(({ pmid, domain }) => {
  if (!pmid) return;
  if (pmidSeen[pmid]) dupPMIDs.push(pmid + ' (in ' + pmidSeen[pmid] + ' and ' + domain + ')');
  else pmidSeen[pmid] = domain;
});
if (dupPMIDs.length > 0) errors.push('Cross-domain duplicate PMIDs: ' + dupPMIDs.join(', '));

// Verify score is not inflated (should not be > 75 for Tier 2 without Cochrane)
if (ep.researchQualityScore > 75) errors.push('researchQualityScore ' + ep.researchQualityScore + ' is too high for Tier 2 without Cochrane review (max expected 75)');

// Verify old inflated Tier 1 claim is gone
const noTier1 = !allCitText.includes('"Tier 1"') && !raw45.includes('"Tier 1"');
if (!noTier1) errors.push('Old Tier 1 claim still present in file — should be Tier 2 only');

// Verify old score 89 is gone
const noScore89 = !raw45.includes('researchQualityScore: 89') && !raw45.includes('"researchQualityScore": 89');
if (!noScore89) errors.push('Old inflated researchQualityScore 89 still present — should be 70');

console.log('=== 45_enhanced.js validation ===');
console.log('  id:', obj45.id, '| isEnhanced:', obj45.isEnhanced, '| name:', obj45.name);
console.log('  tier:', ep.overallQuality, '| score:', ep.researchQualityScore, '| totalCitations:', ep.totalCitations);
console.log('  publicationSpan:', ep.publicationSpan, '| lastUpdate:', ep.lastEvidenceUpdate);
console.log('  Citation breakdown: mech=' + mechCount + ' ben=' + benCount + ' safe=' + safeCount + ' dose=' + doseCount + ' = ' + actualTotal);
console.log('  clinicalBenefits label:', es.clinicalBenefits);
console.log('  qualityAssurance.totalVerifiedCitations:', qa.totalVerifiedCitations);
console.log('  All 17 PMIDs present:', missingPMIDs.length === 0 ? 'YES' : 'NO (' + missingPMIDs.length + ' missing)');
console.log('  Cross-domain duplicates:', dupPMIDs.length === 0 ? 'NONE (correct)' : dupPMIDs.length + ' found');
console.log('  Old Tier 1 claim absent:', noTier1 ? 'YES (correct)' : 'NO (ERROR)');
console.log('  Old score 89 absent:', noScore89 ? 'YES (correct)' : 'NO (ERROR)');

if (errors.length === 0) {
  console.log('  RESULT: PASS (' + (warnings.length > 0 ? warnings.length + ' warning(s)' : 'clean') + ')');
} else {
  console.log('  RESULT: FAIL');
  errors.forEach(e => console.log('    ERROR:', e));
}
if (warnings.length) warnings.forEach(w => console.log('    WARNING:', w));

// ── Validate supplements.js ID 45 entry ─────────────────────────────────────
console.log('');
console.log('=== supplements.js ID 45 entry validation ===');

const suppRaw = fs.readFileSync(path.join(base, 'data/supplements.js'), 'utf8');

// Find the ID 45 block (up to ID 46)
const id45Match = suppRaw.match(/"id"\s*:\s*45[\s\S]{0,6000}?"id"\s*:\s*46/);
const block45 = id45Match ? id45Match[0] : '';

const suppErrors = [];

if (!block45) {
  suppErrors.push('Could not locate ID 45 block in supplements.js');
} else {
  // Check isEnhanced at top level (should appear before primaryBenefits)
  const isEnhancedIdx  = block45.indexOf('"isEnhanced"');
  const primaryBenIdx  = block45.indexOf('"primaryBenefits"');
  const enhCitIdx      = block45.indexOf('"enhancedCitations"');

  if (isEnhancedIdx === -1) {
    suppErrors.push('isEnhanced not found in ID 45 block');
  } else if (primaryBenIdx !== -1 && isEnhancedIdx > primaryBenIdx && isEnhancedIdx > enhCitIdx) {
    suppErrors.push('isEnhanced appears only inside enhancedCitations — not at top level');
  } else {
    const topLevelIsEnhanced = isEnhancedIdx < (primaryBenIdx !== -1 ? primaryBenIdx : block45.length);
    if (topLevelIsEnhanced) {
      console.log('  isEnhanced: found at top level (before primaryBenefits)');
    } else {
      suppErrors.push('isEnhanced not at top level — appears after primaryBenefits');
    }
  }

  // Verify no duplicate isEnhanced inside primaryBenefits
  const primaryBenBlock = primaryBenIdx !== -1 ? block45.substring(primaryBenIdx, primaryBenIdx + 500) : '';
  const isEnhancedCountInPrimaryBen = (primaryBenBlock.match(/"isEnhanced"/g) || []).length;
  if (isEnhancedCountInPrimaryBen > 0) {
    suppErrors.push('isEnhanced found inside primaryBenefits block — duplicate bug not fixed (' + isEnhancedCountInPrimaryBen + ' occurrence(s))');
  } else {
    console.log('  No duplicate isEnhanced inside primaryBenefits: CLEAN (correct)');
  }

  // Check enhancedCitations block
  if (block45.includes('"enhancedCitations"')) {
    console.log('  enhancedCitations block: present');
  } else {
    suppErrors.push('enhancedCitations block missing from supplements.js ID 45');
  }

  // Check corrected values
  if (block45.includes('"researchQualityScore": 70')) {
    console.log('  researchQualityScore: 70 (correct)');
  } else {
    suppErrors.push('researchQualityScore 70 not found in ID 45 enhancedCitations block');
  }

  if (block45.includes('"totalCitations": 17')) {
    console.log('  totalCitations: 17 (correct)');
  } else {
    suppErrors.push('totalCitations 17 not found in ID 45 enhancedCitations block');
  }

  if (block45.includes('"overallQuality": "Tier 2"')) {
    console.log('  overallQuality: Tier 2 (correct)');
  } else {
    suppErrors.push('overallQuality Tier 2 not found in ID 45 enhancedCitations block');
  }

  // Verify old inflated score is gone
  if (block45.includes('"researchQualityScore": 89')) {
    suppErrors.push('Old inflated researchQualityScore 89 still present — should be 70');
  } else {
    console.log('  Old score 89: removed (correct)');
  }

  // Check lastUpdated corrected date
  if (block45.includes('"lastUpdated": "2026-03-06"')) {
    console.log('  lastUpdated: 2026-03-06 (correct)');
  } else {
    suppErrors.push('lastUpdated "2026-03-06" not found in ID 45 enhancedCitations block');
  }

  // Check keyCitations has 3 entries with PMIDs
  const keyCitStart = block45.indexOf('"keyCitations"');
  const keyCitSection = keyCitStart !== -1 ? block45.substring(keyCitStart, keyCitStart + 3000) : '';
  const pmidMatches = keyCitSection.match(/"pmid"/g) || [];
  if (pmidMatches.length >= 3) {
    console.log('  keyCitations: ' + pmidMatches.length + ' entries with PMIDs (correct, expected 3)');
  } else {
    suppErrors.push('keyCitations: expected 3 entries with PMIDs, found ' + pmidMatches.length);
  }

  // Verify specific PMIDs in keyCitations
  const kcPMIDs = ['23644932', '17525179', '29933554'];
  kcPMIDs.forEach(pmid => {
    if (keyCitSection.includes('"' + pmid + '"')) {
      console.log('    PMID ' + pmid + ': present in keyCitations');
    } else {
      suppErrors.push('keyCitations missing PMID ' + pmid);
    }
  });

  // Verify no duplicate isEnhanced (old bug where it appeared twice in primaryBenefits)
  const totalIsEnhancedInBlock = (block45.match(/"isEnhanced"/g) || []).length;
  // Expected: 1 at top level + 1 inside enhancedCitations = 2
  if (totalIsEnhancedInBlock === 2) {
    console.log('  Total isEnhanced occurrences: 2 (top-level + enhancedCitations — correct)');
  } else if (totalIsEnhancedInBlock > 2) {
    suppErrors.push('Unexpected extra isEnhanced occurrences: found ' + totalIsEnhancedInBlock + ' (expected 2)');
  } else {
    suppErrors.push('Too few isEnhanced occurrences: found ' + totalIsEnhancedInBlock + ' (expected 2: top-level + enhancedCitations)');
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
const provDir = path.join(base, 'content/provenance/lutein');
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
