const fs = require('fs');
const path = require('path');

const base = path.dirname(__filename);

// ── Validate 43_enhanced.js ──────────────────────────────────────────────────
const raw43 = fs.readFileSync(path.join(base, 'data/enhanced_citations/43_enhanced.js'), 'utf8');

const match43 = raw43.match(/const\s+\w+\s*=\s*(\{[\s\S]*?\});\s*\n*(?:\/\/|if\s*\(|module\.exports)/);
if (!match43) {
  console.error('FAIL: Could not extract object from 43_enhanced.js');
  process.exit(1);
}

let obj43;
try {
  obj43 = eval('(' + match43[1] + ')');
} catch(e) {
  console.error('FAIL: 43_enhanced.js parse error:', e.message);
  process.exit(1);
}

const errors = [];
const warnings = [];

// Required top-level fields
if (obj43.id !== 43)                    errors.push('id should be 43, got: ' + obj43.id);
if (obj43.isEnhanced !== true)          errors.push('isEnhanced missing or not true at top level');
if (obj43.name !== 'Choline Bitartrate') warnings.push('name: ' + obj43.name + ' (expected Choline Bitartrate)');

// evidenceProfile checks
const ep = obj43.evidenceProfile || {};
if (ep.totalCitations !== 17)              errors.push('totalCitations: expected 17, got ' + ep.totalCitations);
if (ep.researchQualityScore !== 66)        errors.push('researchQualityScore: expected 66, got ' + ep.researchQualityScore);
if (ep.lastEvidenceUpdate !== '2026-03-06') errors.push('lastEvidenceUpdate: expected 2026-03-06, got ' + ep.lastEvidenceUpdate);
if (ep.overallQuality !== 'Tier 2')        errors.push('overallQuality: expected Tier 2, got ' + ep.overallQuality);
if (ep.publicationSpan !== '1992-2019')    errors.push('publicationSpan: expected 1992-2019, got ' + ep.publicationSpan);

// evidenceStrength labels
const es = ep.evidenceStrength || {};
if (es.clinicalBenefits !== 'Moderate') errors.push('evidenceStrength.clinicalBenefits: expected Moderate, got ' + es.clinicalBenefits);

// Citation structure: all flat arrays (benefits is NOT nested unlike Selenium)
const cits = obj43.citations || {};
const mechCount = (cits.mechanisms || []).length;
const benCount  = (cits.benefits  || []).length;
const defCount  = (cits.deficiency || []).length;
const safeCount = (cits.safety    || []).length;
const doseCount = (cits.dosage    || []).length;
const actualTotal = mechCount + benCount + defCount + safeCount + doseCount;

if (mechCount !== 4) errors.push('mechanisms count: expected 4, got ' + mechCount);
if (benCount  !== 6) errors.push('benefits count: expected 6, got ' + benCount);
if (defCount  !== 2) errors.push('deficiency count: expected 2, got ' + defCount);
if (safeCount !== 2) errors.push('safety count: expected 2, got ' + safeCount);
if (doseCount !== 3) errors.push('dosage count: expected 3, got ' + doseCount);
if (actualTotal !== 17) errors.push('Actual citation count: ' + actualTotal + ' (expected 17) — mech=' + mechCount + ' ben=' + benCount + ' def=' + defCount + ' safe=' + safeCount + ' dose=' + doseCount);

// qualityAssurance
const qa = obj43.qualityAssurance || {};
if (qa.doiVerificationDate !== '2026-03-06') errors.push('qualityAssurance.doiVerificationDate: expected 2026-03-06, got ' + qa.doiVerificationDate);
if (qa.totalVerifiedCitations !== 17) errors.push('qualityAssurance.totalVerifiedCitations: expected 17, got ' + qa.totalVerifiedCitations);

// Verify key PMIDs are present in citations
const allCitText = JSON.stringify(obj43.citations || {});
const expectedPMIDs = {
  '19906248': 'Zeisel 2009 (mech)',
  '28608931': 'Blusztajn 2017 (mech)',
  '18005667': 'Li 2008 (mech)',
  '19454612': 'Shaw 2009 (mech)',
  '22071706': 'Poly 2011 (ben)',
  '28449127': 'Wallace 2017 (ben)',
  '30248911': 'Caudill 2018 (ben)',
  '17921386': 'Fischer 2007 (ben)',
  '31109059': 'Bernhard 2019 (ben)',
  '24699999': 'Muoio 2014 (ben)',
  '7590654':  'Buchman 1995 (def)',
  '30248994': 'Wallace 2018 (def)',
  '1487572':  'Conlay 1992 (safe)',
  '29065455': 'Taylor 2017 (safe)',
  '23193625': 'IOM 1998 (dose)',
  '11744339': 'Buchman 2001 (dose)',
  '30704570': 'Derbyshire 2019 (dose)'
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
  ...(cits.deficiency || []).map(c => ({ pmid: c.pmid, domain: 'deficiency' })),
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

console.log('=== 43_enhanced.js validation ===');
console.log('  id:', obj43.id, '| isEnhanced:', obj43.isEnhanced, '| name:', obj43.name);
console.log('  tier:', ep.overallQuality, '| score:', ep.researchQualityScore, '| totalCitations:', ep.totalCitations);
console.log('  publicationSpan:', ep.publicationSpan, '| lastUpdate:', ep.lastEvidenceUpdate);
console.log('  Citation breakdown: mech=' + mechCount + ' ben=' + benCount + ' def=' + defCount + ' safe=' + safeCount + ' dose=' + doseCount + ' = ' + actualTotal);
console.log('  clinicalBenefits label:', es.clinicalBenefits);
console.log('  qualityAssurance.totalVerifiedCitations:', qa.totalVerifiedCitations);
console.log('  All 17 PMIDs present:', missingPMIDs.length === 0 ? 'YES' : 'NO (' + missingPMIDs.length + ' missing)');
console.log('  Cross-domain duplicates:', dupPMIDs.length === 0 ? 'NONE (correct)' : dupPMIDs.length + ' found');

if (errors.length === 0) {
  console.log('  RESULT: PASS (' + (warnings.length > 0 ? warnings.length + ' warning(s)' : 'clean') + ')');
} else {
  console.log('  RESULT: FAIL');
  errors.forEach(e => console.log('    ERROR:', e));
}
if (warnings.length) warnings.forEach(w => console.log('    WARNING:', w));

// ── Validate supplements.js ID 43 entry ─────────────────────────────────────
console.log('');
console.log('=== supplements.js ID 43 entry validation ===');

const suppRaw = fs.readFileSync(path.join(base, 'data/supplements.js'), 'utf8');

// Find the ID 43 block (up to ID 44)
const id43Match = suppRaw.match(/"id"\s*:\s*43[\s\S]{0,6000}?"id"\s*:\s*44/);
const block43 = id43Match ? id43Match[0] : '';

const suppErrors = [];

if (!block43) {
  suppErrors.push('Could not locate ID 43 block in supplements.js');
} else {
  // Check isEnhanced at top level (should appear before primaryBenefits)
  const isEnhancedIdx  = block43.indexOf('"isEnhanced"');
  const primaryBenIdx  = block43.indexOf('"primaryBenefits"');
  const enhCitIdx      = block43.indexOf('"enhancedCitations"');

  if (isEnhancedIdx === -1) {
    suppErrors.push('isEnhanced not found in ID 43 block');
  } else if (primaryBenIdx !== -1 && isEnhancedIdx > primaryBenIdx && isEnhancedIdx > enhCitIdx) {
    suppErrors.push('isEnhanced appears only inside enhancedCitations — not at top level');
  } else {
    // The top-level isEnhanced should appear before primaryBenefits
    const topLevelIsEnhanced = isEnhancedIdx < (primaryBenIdx !== -1 ? primaryBenIdx : block43.length);
    if (topLevelIsEnhanced) {
      console.log('  isEnhanced: found at top level (before primaryBenefits)');
    } else {
      suppErrors.push('isEnhanced not at top level — appears after primaryBenefits');
    }
  }

  // Check enhancedCitations block
  if (block43.includes('"enhancedCitations"')) {
    console.log('  enhancedCitations block: present');
  } else {
    suppErrors.push('enhancedCitations block missing from supplements.js ID 43');
  }

  // Check corrected values
  if (block43.includes('"researchQualityScore": 66')) {
    console.log('  researchQualityScore: 66 (correct)');
  } else {
    suppErrors.push('researchQualityScore 66 not found in ID 43 enhancedCitations block');
  }

  if (block43.includes('"totalCitations": 17')) {
    console.log('  totalCitations: 17 (correct)');
  } else {
    suppErrors.push('totalCitations 17 not found in ID 43 enhancedCitations block');
  }

  if (block43.includes('"overallQuality": "Tier 2"')) {
    console.log('  overallQuality: Tier 2 (correct)');
  } else {
    suppErrors.push('overallQuality Tier 2 not found in ID 43 enhancedCitations block');
  }

  // Verify old inflated score is gone
  if (block43.includes('"researchQualityScore": 86')) {
    suppErrors.push('Old inflated researchQualityScore 86 still present — should be 66');
  } else {
    console.log('  Old score 86: removed (correct)');
  }

  // Check keyCitations has 3 entries with PMIDs
  const keyCitStart = block43.indexOf('"keyCitations"');
  const keyCitSection = keyCitStart !== -1 ? block43.substring(keyCitStart, keyCitStart + 2000) : '';
  const pmidMatches = keyCitSection.match(/"pmid"/g) || [];
  if (pmidMatches.length >= 3) {
    console.log('  keyCitations: ' + pmidMatches.length + ' entries with PMIDs (correct, expected 3)');
  } else {
    suppErrors.push('keyCitations: expected 3 entries with PMIDs, found ' + pmidMatches.length);
  }

  // Verify specific PMIDs in keyCitations
  const kcPMIDs = ['28449127', '30248911', '19906248'];
  kcPMIDs.forEach(pmid => {
    if (keyCitSection.includes('"' + pmid + '"')) {
      console.log('    PMID ' + pmid + ': present in keyCitations');
    } else {
      suppErrors.push('keyCitations missing PMID ' + pmid);
    }
  });

  // lastUpdated corrected date
  if (block43.includes('"lastUpdated": "2026-03-06"')) {
    console.log('  lastUpdated: 2026-03-06 (correct)');
  } else {
    suppErrors.push('lastUpdated "2026-03-06" not found in ID 43 enhancedCitations block');
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
const provDir = path.join(base, 'content/provenance/choline');
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
