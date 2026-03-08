// Audit enhanced citation files - checks schema compliance for all files
const fs = require('fs');
const path = require('path');

const enhancedDir = path.join(__dirname, '..', 'data', 'enhanced_citations');
const files = fs.readdirSync(enhancedDir).filter(f => f.endsWith('.js'));

// Set up browser-like globals
global.window = { enhancedCitations: {} };
global.module = { exports: {} };

const results = [];

for (const file of files) {
  // Skip non-supplement files
  if (file.endsWith('.md') || file.startsWith('DOI_') || file.startsWith('PHASE')) continue;

  const filePath = path.join(enhancedDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract ID from filename
  const idMatch = file.match(/^(\d+)/);
  const id = idMatch ? parseInt(idMatch[1]) : null;

  // Determine file type
  const isNamed = file.match(/^\d+_[a-z]/i) && !file.match(/^\d+_enhanced\.js$/);
  const isGeneric = file.match(/^\d+_enhanced\.js$/);
  const isLegacy = !idMatch; // no numeric prefix

  const fileInfo = {
    filename: file,
    id: id,
    fileType: isLegacy ? 'legacy' : (isNamed ? 'named' : 'generic'),
    fileSize: content.length,
    issues: []
  };

  // Check for const declaration
  const constMatch = content.match(/const\s+(\w+Enhanced)\s*=/);
  fileInfo.hasConstDeclaration = !!constMatch;
  fileInfo.constName = constMatch ? constMatch[1] : null;

  // Check for window.enhancedCitations export
  fileInfo.hasWindowExport = content.includes('window.enhancedCitations');

  // Check for module.exports
  fileInfo.hasModuleExports = content.includes('module.exports');

  // Check for .citations property
  fileInfo.hasCitationsProperty = content.includes('.citations') || content.includes('"citations"');

  // Check for key sections
  fileInfo.hasMechanisms = content.includes('"mechanisms"') || content.includes("'mechanisms'");
  fileInfo.hasBenefits = content.includes('"benefits"') || content.includes("'benefits'");
  fileInfo.hasSafety = content.includes('"safety"') || content.includes("'safety'");
  fileInfo.hasDosage = content.includes('"dosage"') || content.includes("'dosage'");

  // Check for key evidence fields
  fileInfo.hasCitationIds = content.includes('"citationId"') || content.includes("'citationId'");
  fileInfo.hasDOIs = content.includes('"doi"') || content.includes("'doi'");
  fileInfo.hasPMIDs = content.includes('"pmid"') || content.includes("'pmid'");
  fileInfo.hasEvidenceLevel = content.includes('"evidenceLevel"') || content.includes("'evidenceLevel'");

  // Check for evidence profile
  fileInfo.hasEvidenceProfile = content.includes('"evidenceProfile"');
  fileInfo.hasResearchQualityScore = content.includes('"researchQualityScore"');

  // Schema format detection
  if (content.includes('"citationMetrics"')) fileInfo.format = 'full_canonical';
  else if (content.includes('"researchSynthesis"')) fileInfo.format = 'compact';
  else if (content.includes('"citations"')) fileInfo.format = 'standard';
  else fileInfo.format = 'unknown';

  // Count evidence items (approximate)
  const evidenceMatches = content.match(/"citationId"/g);
  fileInfo.citationCount = evidenceMatches ? evidenceMatches.length : 0;

  // DOI count
  const doiMatches = content.match(/"doi":\s*"/g);
  fileInfo.doiCount = doiMatches ? doiMatches.length : 0;

  // Check for placeholder/empty DOIs
  const emptyDois = content.match(/"doi":\s*""/g);
  fileInfo.emptyDoiCount = emptyDois ? emptyDois.length : 0;

  // Collect issues
  if (!fileInfo.hasConstDeclaration) fileInfo.issues.push('missing_const_declaration');
  if (!fileInfo.hasWindowExport) fileInfo.issues.push('missing_window_export');
  if (!fileInfo.hasMechanisms) fileInfo.issues.push('missing_mechanisms_section');
  if (!fileInfo.hasBenefits) fileInfo.issues.push('missing_benefits_section');
  if (!fileInfo.hasSafety) fileInfo.issues.push('missing_safety_section');
  if (!fileInfo.hasCitationIds) fileInfo.issues.push('missing_citation_ids');
  if (!fileInfo.hasDOIs) fileInfo.issues.push('missing_dois');
  if (fileInfo.emptyDoiCount > 0) fileInfo.issues.push('empty_dois_' + fileInfo.emptyDoiCount);
  if (!fileInfo.hasEvidenceProfile) fileInfo.issues.push('missing_evidence_profile');

  results.push(fileInfo);
}

// Summary statistics
const summary = {
  totalFiles: results.length,
  namedFiles: results.filter(r => r.fileType === 'named').length,
  genericFiles: results.filter(r => r.fileType === 'generic').length,
  legacyFiles: results.filter(r => r.fileType === 'legacy').length,
  withIssues: results.filter(r => r.issues.length > 0).length,
  formatDistribution: {
    full_canonical: results.filter(r => r.format === 'full_canonical').length,
    compact: results.filter(r => r.format === 'compact').length,
    standard: results.filter(r => r.format === 'standard').length,
    unknown: results.filter(r => r.format === 'unknown').length
  },
  commonIssues: {}
};

// Count issue frequency
for (const r of results) {
  for (const issue of r.issues) {
    const baseIssue = issue.replace(/_\d+$/, '');
    summary.commonIssues[baseIssue] = (summary.commonIssues[baseIssue] || 0) + 1;
  }
}

console.log(JSON.stringify({ summary, files: results }));
