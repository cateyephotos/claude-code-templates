const fs = require('fs');
const path = require('path');

console.log('🔍 FILE-BASED COMPREHENSIVE SUPPLEMENT ANALYSIS');
console.log('Analyzing Enhanced Citation Loader and citation files...');

// Read Enhanced Citation Loader
const loaderPath = './js/EnhancedCitationLoader.js';
const loaderContent = fs.readFileSync(loaderPath, 'utf8');

// Extract all supplement entries from the loader
const supplementEntries = [];
const entryRegex = /{\s*id:\s*(\d+),\s*file:\s*'([^']+)',\s*globalVar:\s*'([^']+)'\s*}/g;
let match;

while ((match = entryRegex.exec(loaderContent)) !== null) {
  supplementEntries.push({
    id: parseInt(match[1]),
    file: match[2],
    globalVar: match[3]
  });
}

console.log(`\n📊 ENHANCED CITATION LOADER ANALYSIS`);
console.log(`Total entries in loader: ${supplementEntries.length}`);

// Check for duplicate IDs
const idCounts = {};
supplementEntries.forEach(entry => {
  idCounts[entry.id] = (idCounts[entry.id] || 0) + 1;
});

const duplicateIds = Object.entries(idCounts).filter(([id, count]) => count > 1);
if (duplicateIds.length > 0) {
  console.log(`🚨 DUPLICATE IDs FOUND:`);
  duplicateIds.forEach(([id, count]) => {
    console.log(`   ID ${id}: ${count} entries`);
  });
} else {
  console.log(`✅ No duplicate IDs found`);
}

// Check file existence and analyze content
const analysisResults = {
  totalEntries: supplementEntries.length,
  existingFiles: 0,
  missingFiles: 0,
  qualityAnalysis: {},
  issues: []
};

console.log(`\n🔍 FILE EXISTENCE & QUALITY ANALYSIS:`);

supplementEntries.forEach(entry => {
  const filePath = `./data/enhanced_citations/${entry.file}`;
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    analysisResults.existingFiles++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic quality checks
      const analysis = {
        id: entry.id,
        file: entry.file,
        hasEvidenceProfile: content.includes('evidenceProfile'),
        hasCitations: content.includes('"citations"'),
        hasSpecificClaims: content.includes('claim') || content.includes('specificClaim'),
        hasEvidenceLevels: content.includes('evidence') || content.includes('strength'),
        hasPMIDs: content.includes('pmid'),
        hasDOIs: content.includes('doi'),
        fileSize: content.length,
        status: 'exists'
      };
      
      // Count citations
      const mechanismMatches = (content.match(/"mechanism":/g) || []).length;
      const claimMatches = (content.match(/"claim":/g) || []).length;
      const specificClaimMatches = (content.match(/"specificClaim":/g) || []).length;
      
      analysis.citationCount = mechanismMatches + claimMatches + specificClaimMatches;
      
      // Determine quality score
      let qualityScore = 0;
      if (analysis.hasEvidenceProfile) qualityScore += 2;
      if (analysis.hasCitations) qualityScore += 2;
      if (analysis.hasSpecificClaims) qualityScore += 1;
      if (analysis.hasEvidenceLevels) qualityScore += 1;
      if (analysis.hasPMIDs) qualityScore += 1;
      if (analysis.hasDOIs) qualityScore += 1;
      if (analysis.citationCount > 5) qualityScore += 1;
      if (analysis.citationCount > 10) qualityScore += 1;
      
      analysis.qualityScore = qualityScore;
      
      analysisResults.qualityAnalysis[entry.id] = analysis;
      
      console.log(`   ✅ ID ${entry.id}: ${entry.file} (Quality: ${qualityScore}/10, Citations: ${analysis.citationCount})`);
      
    } catch (error) {
      analysisResults.issues.push(`Error reading ${entry.file}: ${error.message}`);
      console.log(`   ❌ ID ${entry.id}: ${entry.file} (Read Error)`);
    }
  } else {
    analysisResults.missingFiles++;
    analysisResults.issues.push(`Missing file: ${entry.file}`);
    console.log(`   ❌ ID ${entry.id}: ${entry.file} (Missing)`);
  }
});

// Calculate overall metrics
const qualityScores = Object.values(analysisResults.qualityAnalysis).map(a => a.qualityScore);
const citationCounts = Object.values(analysisResults.qualityAnalysis).map(a => a.citationCount);

const avgQuality = qualityScores.length > 0 ? (qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) : 0;
const avgCitations = citationCounts.length > 0 ? (citationCounts.reduce((a, b) => a + b, 0) / citationCounts.length) : 0;

console.log(`\n📊 SUMMARY STATISTICS:`);
console.log(`   Total Entries: ${analysisResults.totalEntries}`);
console.log(`   Existing Files: ${analysisResults.existingFiles} (${((analysisResults.existingFiles/analysisResults.totalEntries)*100).toFixed(1)}%)`);
console.log(`   Missing Files: ${analysisResults.missingFiles} (${((analysisResults.missingFiles/analysisResults.totalEntries)*100).toFixed(1)}%)`);
console.log(`   Average Quality Score: ${avgQuality.toFixed(1)}/10`);
console.log(`   Average Citations per File: ${avgCitations.toFixed(1)}`);

// Quality distribution
const qualityDistribution = {};
qualityScores.forEach(score => {
  const range = score >= 8 ? 'High (8-10)' : score >= 5 ? 'Medium (5-7)' : 'Low (0-4)';
  qualityDistribution[range] = (qualityDistribution[range] || 0) + 1;
});

console.log(`\n📋 QUALITY DISTRIBUTION:`);
Object.entries(qualityDistribution).forEach(([range, count]) => {
  console.log(`   ${range}: ${count} files`);
});

if (analysisResults.issues.length > 0) {
  console.log(`\n🚨 ISSUES FOUND (${analysisResults.issues.length}):`);
  analysisResults.issues.slice(0, 10).forEach(issue => {
    console.log(`   - ${issue}`);
  });
  if (analysisResults.issues.length > 10) {
    console.log(`   ... and ${analysisResults.issues.length - 10} more issues`);
  }
}

// Generate report
const reportContent = `# File-Based Supplement Analysis Report
**Date**: ${new Date().toISOString().split('T')[0]}
**Analysis Type**: Enhanced Citation Files Review

## Executive Summary

- **Total Loader Entries**: ${analysisResults.totalEntries}
- **Existing Files**: ${analysisResults.existingFiles} (${((analysisResults.existingFiles/analysisResults.totalEntries)*100).toFixed(1)}%)
- **Missing Files**: ${analysisResults.missingFiles} (${((analysisResults.missingFiles/analysisResults.totalEntries)*100).toFixed(1)}%)
- **Average Quality Score**: ${avgQuality.toFixed(1)}/10
- **Average Citations per File**: ${avgCitations.toFixed(1)}

## Quality Distribution

${Object.entries(qualityDistribution).map(([range, count]) => `- **${range}**: ${count} files`).join('\n')}

## Detailed Analysis

${Object.values(analysisResults.qualityAnalysis)
  .sort((a, b) => a.id - b.id)
  .map(analysis => `### ID ${analysis.id}: ${analysis.file}
- **Quality Score**: ${analysis.qualityScore}/10
- **Citations**: ${analysis.citationCount}
- **Evidence Profile**: ${analysis.hasEvidenceProfile ? '✅' : '❌'}
- **Citations Object**: ${analysis.hasCitations ? '✅' : '❌'}
- **Specific Claims**: ${analysis.hasSpecificClaims ? '✅' : '❌'}
- **Evidence Levels**: ${analysis.hasEvidenceLevels ? '✅' : '❌'}
- **PMIDs**: ${analysis.hasPMIDs ? '✅' : '❌'}
- **DOIs**: ${analysis.hasDOIs ? '✅' : '❌'}
`).join('\n')}

${duplicateIds.length > 0 ? `## Duplicate ID Issues

${duplicateIds.map(([id, count]) => `- **ID ${id}**: ${count} entries`).join('\n')}` : ''}

${analysisResults.issues.length > 0 ? `## Issues Found

${analysisResults.issues.map(issue => `- ${issue}`).join('\n')}` : ''}

---
**Generated**: ${new Date().toISOString()}`;

// Write report
fs.writeFileSync('./engineering-docs/2025-01-28/file-based-analysis-report.md', reportContent);

console.log(`\n✅ Analysis complete. Report saved to engineering-docs/2025-01-28/file-based-analysis-report.md`);
