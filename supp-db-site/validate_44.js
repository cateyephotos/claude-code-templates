const fs = require('fs');
const path = require('path');

const base = path.dirname(__filename);

// ── Validate 44_enhanced.js ──────────────────────────────────────────────────
const raw44 = fs.readFileSync(path.join(base, 'data/enhanced_citations/44_enhanced.js'), 'utf8');

const match44 = raw44.match(/const\s+\w+\s*=\s*(\{[\s\S]*?\});\s*\n*(?:\/\/|if\s*\(|module\.exports)/);
if (!match44) {
  console.error('FAIL: Could not extract object from 44_enhanced.js');
  process.exit(1);
}

let obj44;
try {
  obj44 = eval('(' + match44[1] + ')');
} catch(e) {
  console.error('FAIL: 44_enhanced.js parse error:', e.message);
  process.exit(1);
}

const errors = [];
const warnings = [];

// Required top-level fields
if (obj44.id !== 44)                    errors.push('id should be 44, got: ' + obj44.id);
if (obj44.isEnhanced !== true)          errors.push('isEnhanced missing or not true at top level');
if (obj44.name !== 'Alpha-Lipoic Acid') warnings.push('name: ' + obj44.name + ' (expected Alpha-Lipoic Acid)');

// evidenceProfile checks
const ep = obj44.evidenceProfile || {};
if (ep.totalCitations !== 14)              errors.push('totalCitations: expected 14, got ' + ep.totalCitations);
if (ep.researchQualityScore !== 68)        errors.push('researchQualityScore: expected 68, got ' + ep.researchQualityScore);
if (ep.lastEvidenceUpdate !== '2026-03-06') errors.push('lastEvidenceUpdate: expected 2026-03-06, got ' + ep.lastEvidenceUpdate);
if (ep.overallQuality !== 'Tier 2')        errors.push('overallQuality: expected Tier 2, got ' + ep.overallQuality);
if (ep.publicationSpan !== '1995-2018')    errors.push('publicationSpan: expected 1995-2018, got ' + ep.publicationSpan);

// evidenceStrength labels
const es = ep.evidenceStrength || {};
if (es.clinicalBenefits !== 'Moderate') errors.push('evidenceStrength.clinicalBenefits: expected Moderate, got ' + es.clinicalBenefits);

// Citation structure: flat arrays
const cits = obj44.citations || {};
const mechCount = (cits.mechanisms || []).length;
const benCount  = (cits.benefits  || []).length;
const safeCount = (cits.safety    || []).length;
const doseCount = (cits.dosage    || []).length;
const actualTotal = mechCount + benCount + safeCount + doseCount;

if (mechCount !== 4) errors.push('mechanisms count: expected 4, got ' + mechCount);
if (benCount  !== 6) errors.push('benefits count: expected 6, got ' + benCount);
if (safeCount !== 2) errors.push('safety count: expected 2, got ' + safeCount);
if (doseCount !== 2) errors.push('dosage count: expected 2, got ' + doseCount);
if (actualTotal !== 14) errors.push('Actual citation count: ' + actualTotal + ' (expected 14) — mech=' + mechCount + ' ben=' + benCount + ' safe=' + safeCount + ' dose=' + doseCount);

// qualityAssurance
const qa = obj44.qualityAssurance || {};
if (qa.doiVerificationDate !== '2026-03-06') errors.push('qualityAssurance.doiVerificationDate: expected 2026-03-06, got ' + qa.doiVerificationDate);
if (qa.totalVerifiedCitations !== 14) errors.push('qualityAssurance.totalVerifiedCitations: expected 14, got ' + qa.totalVerifiedCitations);

// Verify key PMIDs are present in citations
const allCitText = JSON.stringify(obj44.citations || {});
const expectedPMIDs = {
  '17292493': 'Holmquist 2007 (mech)',
  '11469271': 'Evans & Goldfine 2000 (mech)',
  '10381194': 'Jacob 1999 (mech)',
  '12897426': 'Moini 2002 (mech)',
  '10490251': 'Reljanovic 1999 ALADIN II (ben)',
  '21088437': 'Haritoglou 2011 (ben)',
  '29031735': 'Namazi 2018 (ben)',
  '29408453': 'Akbari 2018 (ben)',
  '26016853': 'Rochette 2015 (ben)',
  '27338359': 'Derosa 2016 (ben)',
  '16644601': 'Ziegler 2006 SYDNEY 2 (safe)',
  '7649494':  'Packer 1995 (safe)',
  '8582546':  'Ziegler 1995 ALADIN I (dose)',
  '19664869': 'Shay 2009 (dose)'
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

// Verify no fabricated citations remain
const noFabricatedCitations = !allCitText.includes('"Research team"') && !allCitText.includes('"Beitner"');
if (!noFabricatedCitations) errors.push('Fabricated citations still present (Research team / Beitner)');

// Verify score is not inflated (should not be > 75 for Tier 2 without Cochrane)
if (ep.researchQualityScore > 75) errors.push('researchQualityScore ' + ep.researchQualityScore + ' is too high for Tier 2 without Cochrane review (max expected 75)');

console.log('=== 44_enhanced.js validation ===');
console.log('  id:', obj44.id, '| isEnhanced:', obj44.isEnhanced, '| name:', obj44.name);
console.log('  tier:', ep.overallQuality, '| score:', ep.researchQualityScore, '| totalCitations:', ep.totalCitations);
console.log('  publicationSpan:', ep.publicationSpan, '| lastUpdate:', ep.lastEvidenceUpdate);
console.log('  Citation breakdown: mech=' + mechCount + ' ben=' + benCount + ' safe=' + safeCount + ' dose=' + doseCount + ' = ' + actualTotal);
console.log('  clinicalBenefits label:', es.clinicalBenefits);
console.log('  qualityAssurance.totalVerifiedCitations:', qa.totalVerifiedCitations);
console.log('  All 14 PMIDs present:', missingPMIDs.length === 0 ? 'YES' : 'NO (' + missingPMIDs.length + ' missing)');
console.log('  Cross-domain duplicates:', dupPMIDs.length === 0 ? 'NONE (correct)' : dupPMIDs.length + ' found');
console.log('  Fabricated citations absent:', noFabricatedCitations ? 'YES (correct)' : 'NO (ERROR)');

if (errors.length === 0) {
  console.log('  RESULT: PASS (' + (warnings.length > 0 ? warnings.length + ' warning(s)' : 'clean') + ')');
} else {
  console.log('  RESULT: FAIL');
  errors.forEach(e => console.log('    ERROR:', e));
}
if (warnings.length) warnings.forEach(w => console.log('    WARNING:', w));

// ── Validate supplements.js ID 44 entry ─────────────────────────────────────
console.log('');
console.log('=== supplements.js ID 44 entry validation ===');

const suppRaw = fs.readFileSync(path.join(base, 'data/supplements.js'), 'utf8');

// Find the ID 44 block (up to ID 45)
const id44Match = suppRaw.match(/"id"\s*:\s*44[\s\S]{0,6000}?"id"\s*:\s*45/);
const block44 = id44Match ? id44Match[0] : '';

const suppErrors = [];

if (!block44) {
  suppErrors.push('Could not locate ID 44 block in supplements.js');
} else {
  // Check isEnhanced at top level (should appear before primaryBenefits)
  const isEnhancedIdx  = block44.indexOf('"isEnhanced"');
  const primaryBenIdx  = block44.indexOf('"primaryBenefits"');
  const enhCitIdx      = block44.indexOf('"enhancedCitations"');

  if (isEnhancedIdx === -1) {
    suppErrors.push('isEnhanced not found in ID 44 block');
  } else if (primaryBenIdx !== -1 && isEnhancedIdx > primaryBenIdx && isEnhancedIdx > enhCitIdx) {
    suppErrors.push('isEnhanced appears only inside enhancedCitations — not at top level');
  } else {
    const topLevelIsEnhanced = isEnhancedIdx < (primaryBenIdx !== -1 ? primaryBenIdx : block44.length);
    if (topLevelIsEnhanced) {
      console.log('  isEnhanced: found at top level (before primaryBenefits)');
    } else {
      suppErrors.push('isEnhanced not at top level — appears after primaryBenefits');
    }
  }

  // Verify no duplicate isEnhanced inside primaryBenefits
  const primaryBenBlock = primaryBenIdx !== -1 ? block44.substring(primaryBenIdx, primaryBenIdx + 500) : '';
  const isEnhancedCountInPrimaryBen = (primaryBenBlock.match(/"isEnhanced"/g) || []).length;
  if (isEnhancedCountInPrimaryBen > 0) {
    suppErrors.push('isEnhanced found inside primaryBenefits block — duplicate bug not fixed (' + isEnhancedCountInPrimaryBen + ' occurrence(s))');
  } else {
    console.log('  No duplicate isEnhanced inside primaryBenefits: CLEAN (correct)');
  }

  // Check enhancedCitations block
  if (block44.includes('"enhancedCitations"')) {
    console.log('  enhancedCitations block: present');
  } else {
    suppErrors.push('enhancedCitations block missing from supplements.js ID 44');
  }

  // Check corrected values
  if (block44.includes('"researchQualityScore": 68')) {
    console.log('  researchQualityScore: 68 (correct)');
  } else {
    suppErrors.push('researchQualityScore 68 not found in ID 44 enhancedCitations block');
  }

  if (block44.includes('"totalCitations": 14')) {
    console.log('  totalCitations: 14 (correct)');
  } else {
    suppErrors.push('totalCitations 14 not found in ID 44 enhancedCitations block');
  }

  if (block44.includes('"overallQuality": "Tier 2"')) {
    console.log('  overallQuality: Tier 2 (correct)');
  } else {
    suppErrors.push('overallQuality Tier 2 not found in ID 44 enhancedCitations block');
  }

  // Verify old inflated score is gone
  if (block44.includes('"researchQualityScore": 92')) {
    suppErrors.push('Old inflated researchQualityScore 92 still present — should be 68');
  } else {
    console.log('  Old score 92: removed (correct)');
  }

  // Check keyCitations has 3 entries with PMIDs
  const keyCitStart = block44.indexOf('"keyCitations"');
  const keyCitSection = keyCitStart !== -1 ? block44.substring(keyCitStart, keyCitStart + 3000) : '';
  const pmidMatches = keyCitSection.match(/"pmid"/g) || [];
  if (pmidMatches.length >= 3) {
    console.log('  keyCitations: ' + pmidMatches.length + ' entries with PMIDs (correct, expected 3)');
  } else {
    suppErrors.push('keyCitations: expected 3 entries with PMIDs, found ' + pmidMatches.length);
  }

  // Verify specific PMIDs in keyCitations
  const kcPMIDs = ['8582546', '29408453', '10490251'];
  kcPMIDs.forEach(pmid => {
    if (keyCitSection.includes('"' + pmid + '"')) {
      console.log('    PMID ' + pmid + ': present in keyCitations');
    } else {
      suppErrors.push('keyCitations missing PMID ' + pmid);
    }
  });

  // lastUpdated corrected date
  if (block44.includes('"lastUpdated": "2026-03-06"')) {
    console.log('  lastUpdated: 2026-03-06 (correct)');
  } else {
    suppErrors.push('lastUpdated "2026-03-06" not found in ID 44 enhancedCitations block');
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
const provDir = path.join(base, 'content/provenance/alpha-lipoic-acid');
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
