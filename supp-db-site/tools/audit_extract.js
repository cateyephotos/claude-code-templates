// Audit extraction script - reads supplements.js and outputs structured audit data
const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'supplements.js'), 'utf8');

// Use Function constructor to avoid strict mode issues
const fn = new Function(data + '\nreturn supplementDatabase;');
const db = fn();
const supps = db.supplements;

console.log('Total supplements:', supps.length);

const auditData = supps.map(s => ({
  id: s.id,
  name: s.name,
  category: s.category,
  evidenceTier: s.evidenceTier,
  isEnhanced: s.isEnhanced,
  hasEffectSizes: !!(s.effectSizes && Object.keys(s.effectSizes).length > 0),
  effectSizeCount: s.effectSizes ? Object.keys(s.effectSizes).length : 0,
  hasSafetyProfile: !!(s.safetyProfile),
  safetyRating: s.safetyProfile ? s.safetyProfile.rating : null,
  hasSideEffects: !!(s.safetyProfile && s.safetyProfile.commonSideEffects && s.safetyProfile.commonSideEffects.length > 0),
  hasContraindications: !!(s.safetyProfile && s.safetyProfile.contraindications && s.safetyProfile.contraindications.length > 0),
  hasDrugInteractions: !!(s.safetyProfile && s.safetyProfile.drugInteractions && s.safetyProfile.drugInteractions.length > 0),
  keyCitationCount: s.keyCitations ? s.keyCitations.length : 0,
  keyCitationsWithDOIs: s.keyCitations ? s.keyCitations.filter(c => c.doi).length : 0,
  enhancedCitationsInline: !!(s.enhancedCitations),
  enhancedIsEnhanced: s.enhancedCitations ? s.enhancedCitations.isEnhanced : false,
  lastEvidenceUpdate: s.enhancedCitations && s.enhancedCitations.evidenceProfile ? s.enhancedCitations.evidenceProfile.lastEvidenceUpdate : null,
  researchQualityScore: s.enhancedCitations && s.enhancedCitations.evidenceProfile ? s.enhancedCitations.evidenceProfile.researchQualityScore : null,
  totalCitations: s.enhancedCitations && s.enhancedCitations.evidenceProfile ? s.enhancedCitations.evidenceProfile.totalCitations : null,
  researchMaturity: s.enhancedCitations && s.enhancedCitations.evidenceProfile ? s.enhancedCitations.evidenceProfile.researchMaturity : null,
  inlineMechanisms: s.enhancedCitations && s.enhancedCitations.mechanisms ? s.enhancedCitations.mechanisms.length : 0,
  inlineBenefits: s.enhancedCitations && s.enhancedCitations.benefits ? s.enhancedCitations.benefits.length : 0,
  inlineSafety: s.enhancedCitations && s.enhancedCitations.safety ? s.enhancedCitations.safety.length : 0,
  inlineDosage: s.enhancedCitations && s.enhancedCitations.dosage ? s.enhancedCitations.dosage.length : 0,
  mechanismsOfActionCount: s.mechanismsOfAction ? s.mechanismsOfAction.length : 0,
  dosageRange: s.dosageRange || null
}));

console.log(JSON.stringify(auditData));
