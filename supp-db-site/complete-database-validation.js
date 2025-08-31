const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE DATABASE VALIDATION - ALL 89 SUPPLEMENTS');
console.log('Creating complete supplement-to-enhanced-citation mapping...');

// Read supplements database
const supplementsPath = './data/supplements.js';
const supplementsContent = fs.readFileSync(supplementsPath, 'utf8');

// Extract supplements array from the file
const supplementsMatch = supplementsContent.match(/const supplementDatabase = ({[\s\S]*?});/);
if (!supplementsMatch) {
  console.error('❌ Could not parse supplements database');
  process.exit(1);
}

let supplementDatabase;
let supplements;
try {
  // Safely evaluate the supplements database
  eval(`supplementDatabase = ${supplementsMatch[1]}`);
  supplements = supplementDatabase.supplements;
  if (!supplements || !Array.isArray(supplements)) {
    throw new Error('Supplements array not found in database');
  }
} catch (error) {
  console.error('❌ Error parsing supplements database:', error.message);
  process.exit(1);
}

console.log(`📊 Found ${supplements.length} supplements in database`);

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

console.log(`📊 Found ${supplementEntries.length} entries in Enhanced Citation Loader`);

// Create comprehensive mapping analysis
const mappingAnalysis = {
  totalSupplements: supplements.length,
  totalLoaderEntries: supplementEntries.length,
  supplements: {},
  mismatches: [],
  missing: [],
  orphaned: [],
  duplicates: [],
  summary: {
    correctMappings: 0,
    mismatches: 0,
    missingEnhanced: 0,
    orphanedEnhanced: 0,
    duplicateIds: 0
  }
};

// Check for duplicate IDs in loader
const loaderIdCounts = {};
supplementEntries.forEach(entry => {
  loaderIdCounts[entry.id] = (loaderIdCounts[entry.id] || 0) + 1;
});

Object.entries(loaderIdCounts).forEach(([id, count]) => {
  if (count > 1) {
    mappingAnalysis.duplicates.push({
      id: parseInt(id),
      count: count,
      entries: supplementEntries.filter(e => e.id === parseInt(id))
    });
    mappingAnalysis.summary.duplicateIds++;
  }
});

// Analyze each supplement in the database
supplements.forEach(supplement => {
  const suppId = supplement.id;
  const suppName = supplement.name;
  
  const analysis = {
    id: suppId,
    name: suppName,
    scientificName: supplement.scientificName || '',
    category: supplement.category || '',
    hasEnhancedCitation: false,
    enhancedCitationFile: null,
    contentMatch: 'unknown',
    issues: [],
    status: 'unknown'
  };
  
  // Find corresponding enhanced citation entry
  const loaderEntry = supplementEntries.find(entry => entry.id === suppId);
  
  if (loaderEntry) {
    analysis.hasEnhancedCitation = true;
    analysis.enhancedCitationFile = loaderEntry.file;
    
    // Check if file exists
    const filePath = `./data/enhanced_citations/${loaderEntry.file}`;
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Extract supplement name from enhanced citation file
        const nameMatches = [
          fileContent.match(/supplementName:\s*["']([^"']+)["']/),
          fileContent.match(/name:\s*["']([^"']+)["']/),
          fileContent.match(/\/\/\s*Enhanced Citations for ([^(]+)/),
        ];
        
        let enhancedName = null;
        for (const nameMatch of nameMatches) {
          if (nameMatch) {
            enhancedName = nameMatch[1].trim();
            break;
          }
        }
        
        if (enhancedName) {
          // Normalize names for comparison
          const normalizedSuppName = suppName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normalizedEnhancedName = enhancedName.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Check for various name matching patterns
          const isExactMatch = normalizedSuppName === normalizedEnhancedName;
          const isPartialMatch = normalizedSuppName.includes(normalizedEnhancedName) || 
                                normalizedEnhancedName.includes(normalizedSuppName);
          const isAliasMatch = checkAliases(suppName, enhancedName);
          
          if (isExactMatch || isAliasMatch) {
            analysis.contentMatch = 'correct';
            analysis.status = 'correct_mapping';
            mappingAnalysis.summary.correctMappings++;
          } else if (isPartialMatch) {
            analysis.contentMatch = 'partial';
            analysis.status = 'partial_match';
            analysis.issues.push(`Partial name match: "${suppName}" vs "${enhancedName}"`);
          } else {
            analysis.contentMatch = 'mismatch';
            analysis.status = 'content_mismatch';
            analysis.issues.push(`Name mismatch: "${suppName}" vs "${enhancedName}"`);
            mappingAnalysis.mismatches.push({
              id: suppId,
              databaseName: suppName,
              enhancedName: enhancedName,
              file: loaderEntry.file
            });
            mappingAnalysis.summary.mismatches++;
          }
        } else {
          analysis.contentMatch = 'unknown';
          analysis.status = 'name_not_found';
          analysis.issues.push('Could not extract supplement name from enhanced citation file');
        }
        
        // Check file quality
        const hasEvidenceProfile = fileContent.includes('evidenceProfile');
        const hasCitations = fileContent.includes('"citations"');
        const citationCount = (fileContent.match(/"claim":|"mechanism":|"specificClaim":/g) || []).length;
        
        analysis.quality = {
          hasEvidenceProfile,
          hasCitations,
          citationCount,
          fileSize: fileContent.length
        };
        
      } catch (error) {
        analysis.issues.push(`Error reading file: ${error.message}`);
        analysis.status = 'file_error';
      }
    } else {
      analysis.issues.push('Enhanced citation file does not exist');
      analysis.status = 'missing_file';
    }
  } else {
    analysis.hasEnhancedCitation = false;
    analysis.status = 'no_enhanced_citation';
    mappingAnalysis.missing.push({
      id: suppId,
      name: suppName,
      category: supplement.category || 'Unknown'
    });
    mappingAnalysis.summary.missingEnhanced++;
  }
  
  mappingAnalysis.supplements[suppId] = analysis;
});

// Check for orphaned enhanced citations (files that don't match any supplement)
supplementEntries.forEach(entry => {
  const correspondingSupplement = supplements.find(s => s.id === entry.id);
  if (!correspondingSupplement) {
    mappingAnalysis.orphaned.push({
      id: entry.id,
      file: entry.file,
      globalVar: entry.globalVar
    });
    mappingAnalysis.summary.orphanedEnhanced++;
  }
});

// Helper function to check common supplement name aliases
function checkAliases(name1, name2) {
  const aliases = {
    'coq10': ['coenzyme q10', 'ubiquinone'],
    'omega3': ['omega-3', 'fish oil', 'epa', 'dha'],
    'ltheanine': ['l-theanine', 'theanine'],
    'rhodiola': ['rhodiola rosea'],
    'lionsmane': ['lions mane', 'lion\'s mane', 'hericium erinaceus'],
    'ashwagandha': ['withania somnifera'],
    'bacopa': ['bacopa monnieri'],
    'ginkgo': ['ginkgo biloba'],
    'turmeric': ['curcumin'],
    'phosphatidylserine': ['ps', 'phosphatidyl serine']
  };
  
  const norm1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const norm2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  for (const [key, aliasList] of Object.entries(aliases)) {
    if ((norm1.includes(key) || aliasList.some(alias => norm1.includes(alias.replace(/[^a-z0-9]/g, '')))) &&
        (norm2.includes(key) || aliasList.some(alias => norm2.includes(alias.replace(/[^a-z0-9]/g, ''))))) {
      return true;
    }
  }
  
  return false;
}

// Generate comprehensive report
console.log('\n📊 COMPREHENSIVE MAPPING ANALYSIS RESULTS');
console.log('='.repeat(60));

console.log(`\n🔍 OVERALL STATISTICS:`);
console.log(`   Total Supplements in Database: ${mappingAnalysis.totalSupplements}`);
console.log(`   Total Enhanced Citation Entries: ${mappingAnalysis.totalLoaderEntries}`);
console.log(`   Correct Mappings: ${mappingAnalysis.summary.correctMappings}`);
console.log(`   Content Mismatches: ${mappingAnalysis.summary.mismatches}`);
console.log(`   Missing Enhanced Citations: ${mappingAnalysis.summary.missingEnhanced}`);
console.log(`   Orphaned Enhanced Citations: ${mappingAnalysis.summary.orphanedEnhanced}`);
console.log(`   Duplicate IDs: ${mappingAnalysis.summary.duplicateIds}`);

if (mappingAnalysis.mismatches.length > 0) {
  console.log(`\n🚨 CONTENT MISMATCHES (${mappingAnalysis.mismatches.length}):`);
  mappingAnalysis.mismatches.forEach(mismatch => {
    console.log(`   ID ${mismatch.id}: "${mismatch.databaseName}" vs "${mismatch.enhancedName}" (${mismatch.file})`);
  });
}

if (mappingAnalysis.missing.length > 0) {
  console.log(`\n⚠️ MISSING ENHANCED CITATIONS (${mappingAnalysis.missing.length}):`);
  mappingAnalysis.missing.slice(0, 10).forEach(missing => {
    console.log(`   ID ${missing.id}: ${missing.name} (${missing.category})`);
  });
  if (mappingAnalysis.missing.length > 10) {
    console.log(`   ... and ${mappingAnalysis.missing.length - 10} more`);
  }
}

if (mappingAnalysis.duplicates.length > 0) {
  console.log(`\n🚨 DUPLICATE IDs (${mappingAnalysis.duplicates.length}):`);
  mappingAnalysis.duplicates.forEach(dup => {
    console.log(`   ID ${dup.id}: ${dup.count} entries`);
    dup.entries.forEach(entry => {
      console.log(`     - ${entry.file}`);
    });
  });
}

// Save detailed report
const reportContent = `# Complete Database Validation Report
**Date**: ${new Date().toISOString().split('T')[0]}
**Analysis Type**: Comprehensive Supplement-to-Enhanced-Citation Mapping

## Executive Summary

- **Total Supplements**: ${mappingAnalysis.totalSupplements}
- **Enhanced Citation Entries**: ${mappingAnalysis.totalLoaderEntries}
- **Correct Mappings**: ${mappingAnalysis.summary.correctMappings} (${((mappingAnalysis.summary.correctMappings/mappingAnalysis.totalSupplements)*100).toFixed(1)}%)
- **Content Mismatches**: ${mappingAnalysis.summary.mismatches}
- **Missing Enhanced Citations**: ${mappingAnalysis.summary.missingEnhanced}
- **Orphaned Enhanced Citations**: ${mappingAnalysis.summary.orphanedEnhanced}
- **Duplicate IDs**: ${mappingAnalysis.summary.duplicateIds}

## Content Mismatches

${mappingAnalysis.mismatches.map(m => `### ID ${m.id}: ${m.databaseName}
- **Database Name**: ${m.databaseName}
- **Enhanced Citation Name**: ${m.enhancedName}
- **File**: ${m.file}
- **Status**: MISMATCH - Enhanced citation content does not match database supplement
`).join('\n')}

## Missing Enhanced Citations

${mappingAnalysis.missing.map(m => `- **ID ${m.id}**: ${m.name} (${m.category})`).join('\n')}

## Duplicate ID Conflicts

${mappingAnalysis.duplicates.map(d => `### ID ${d.id} (${d.count} entries)
${d.entries.map(e => `- ${e.file}`).join('\n')}
`).join('\n')}

## Detailed Supplement Analysis

${Object.values(mappingAnalysis.supplements)
  .sort((a, b) => a.id - b.id)
  .map(supp => `### ID ${supp.id}: ${supp.name}
- **Status**: ${supp.status.replace(/_/g, ' ').toUpperCase()}
- **Enhanced Citation**: ${supp.hasEnhancedCitation ? '✅' : '❌'}
- **File**: ${supp.enhancedCitationFile || 'None'}
- **Content Match**: ${supp.contentMatch || 'N/A'}
${supp.quality ? `- **Quality**: ${supp.quality.citationCount} citations, Evidence Profile: ${supp.quality.hasEvidenceProfile ? '✅' : '❌'}` : ''}
${supp.issues.length > 0 ? `- **Issues**: ${supp.issues.join(', ')}` : '- **Issues**: None'}
`).join('\n')}

---
**Generated**: ${new Date().toISOString()}`;

fs.writeFileSync('./engineering-docs/2025-01-28/complete-database-validation-report.md', reportContent);

console.log(`\n✅ Complete validation finished. Report saved to engineering-docs/2025-01-28/complete-database-validation-report.md`);

// Return analysis for further processing
module.exports = mappingAnalysis;
