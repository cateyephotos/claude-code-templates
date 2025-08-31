console.log('🔍 TARGETED ANALYSIS FOR TRULY INCOMPLETE EVIDENCE PROFILES');
console.log('Finding supplements that actually need Evidence Profile completion...');

const fs = require('fs');
const path = require('path');

try {
  const enhancedDir = './data/enhanced_citations';
  const files = fs.readdirSync(enhancedDir);
  
  // Filter for numbered supplement files (not 999_ files)
  const supplementFiles = files.filter(file => 
    file.match(/^\d+_.*_enhanced\.js$/) && !file.startsWith('999_')
  );
  
  console.log(`\n🔍 Analyzing ${supplementFiles.length} supplement files for incomplete Evidence Profiles...`);
  
  const incompleteSupplements = [];
  const missingSupplements = [];
  const completeSupplements = [];
  
  supplementFiles.forEach(file => {
    try {
      const filePath = path.join(enhancedDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract supplement ID and name from filename
      const match = file.match(/^(\d+)_(.+)_enhanced\.js$/);
      if (!match) return;
      
      const id = parseInt(match[1]);
      const name = match[2].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Check for evidenceProfile in content
      let hasEvidenceProfile = false;
      let isComplete = false;
      let missingFields = [];
      
      if (content.includes('evidenceProfile')) {
        hasEvidenceProfile = true;
        
        // Check for required fields with more precise matching
        const requiredFields = [
          'overallQuality', 'researchQualityScore', 'evidenceStrength',
          'researchMaturity', 'publicationSpan', 'lastEvidenceUpdate', 'keyFindings'
        ];
        
        const missing = [];
        
        // Check overallQuality
        if (!content.match(/"overallQuality":\s*"Tier [123]"/)) {
          missing.push('overallQuality');
        }
        
        // Check researchQualityScore
        if (!content.match(/"researchQualityScore":\s*\d+/)) {
          missing.push('researchQualityScore');
        }
        
        // Check evidenceStrength (should have mechanisms, clinicalBenefits, safety, dosage)
        if (!content.includes('"evidenceStrength"') || 
            !content.includes('"mechanisms"') || 
            !content.includes('"clinicalBenefits"') || 
            !content.includes('"safety"') || 
            !content.includes('"dosage"')) {
          missing.push('evidenceStrength');
        }
        
        // Check researchMaturity
        if (!content.match(/"researchMaturity":\s*"[^"]+"/)) {
          missing.push('researchMaturity');
        }
        
        // Check publicationSpan
        if (!content.match(/"publicationSpan":\s*"[^"]+"/)) {
          missing.push('publicationSpan');
        }
        
        // Check lastEvidenceUpdate
        if (!content.match(/"lastEvidenceUpdate":\s*"[^"]+"/)) {
          missing.push('lastEvidenceUpdate');
        }
        
        // Check keyFindings
        if (!content.match(/"keyFindings":\s*"[^"]+"/)) {
          missing.push('keyFindings');
        }
        
        missingFields = missing;
        isComplete = missing.length === 0;
      }
      
      const supplement = {
        id,
        name,
        file,
        hasEvidenceProfile,
        isComplete,
        missingFields
      };
      
      if (!hasEvidenceProfile) {
        missingSupplements.push(supplement);
      } else if (!isComplete) {
        incompleteSupplements.push(supplement);
      } else {
        completeSupplements.push(supplement);
      }
      
    } catch (error) {
      console.log(`   Error processing ${file}: ${error.message}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('🔍 TARGETED INCOMPLETE EVIDENCE PROFILE ANALYSIS');
  console.log('='.repeat(80));
  
  const totalSupplements = supplementFiles.length;
  const completeCount = completeSupplements.length;
  const incompleteCount = incompleteSupplements.length;
  const missingCount = missingSupplements.length;
  const completionRate = Math.round((completeCount / totalSupplements) * 100);
  
  console.log(`\n📈 Accurate Status:`);
  console.log(`   Total Supplements: ${totalSupplements}`);
  console.log(`   Complete Profiles: ${completeCount} (${completionRate}%)`);
  console.log(`   Incomplete Profiles: ${incompleteCount}`);
  console.log(`   Missing Profiles: ${missingCount}`);
  
  if (missingSupplements.length > 0) {
    console.log(`\n❌ Supplements Missing Evidence Profiles (${missingCount}):`);
    missingSupplements.forEach(supp => {
      console.log(`   ❌ ID ${supp.id}: ${supp.name}`);
    });
  }
  
  if (incompleteSupplements.length > 0) {
    console.log(`\n⚠️ Supplements with Incomplete Evidence Profiles (${incompleteCount}):`);
    incompleteSupplements.slice(0, 15).forEach(supp => {
      const missingText = supp.missingFields.length > 0 ? ` (Missing: ${supp.missingFields.join(', ')})` : '';
      console.log(`   ⚠️ ID ${supp.id}: ${supp.name}${missingText}`);
    });
    if (incompleteSupplements.length > 15) {
      console.log(`   ... and ${incompleteSupplements.length - 15} more`);
    }
  }
  
  // Show some complete examples for reference
  if (completeSupplements.length > 0) {
    console.log(`\n✅ Examples of Complete Evidence Profiles (${Math.min(10, completeCount)}):`);
    completeSupplements.slice(0, 10).forEach(supp => {
      console.log(`   ✅ ID ${supp.id}: ${supp.name}`);
    });
    if (completeCount > 10) {
      console.log(`   ... and ${completeCount - 10} more complete profiles`);
    }
  }
  
  console.log('\n🎯 PRIORITY TARGETS FOR COMPLETION:');
  
  // Prioritize missing profiles first
  if (missingSupplements.length > 0) {
    console.log('\n🔴 HIGH PRIORITY - Missing Evidence Profiles:');
    missingSupplements.forEach(supp => {
      console.log(`   1. ID ${supp.id}: ${supp.name} - Needs complete Evidence Profile`);
    });
  }
  
  // Then prioritize incomplete profiles
  if (incompleteSupplements.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY - Incomplete Evidence Profiles:');
    incompleteSupplements.slice(0, 10).forEach((supp, index) => {
      const priority = supp.missingFields.length <= 2 ? 'Quick Fix' : 'Needs Work';
      console.log(`   ${index + 1}. ID ${supp.id}: ${supp.name} - ${priority} (${supp.missingFields.length} missing fields)`);
    });
  }
  
  console.log('\n📋 COMPLETION STRATEGY:');
  if (missingCount + incompleteCount <= 5) {
    console.log('1. 🔧 Complete remaining Evidence Profiles (very close to completion!)');
    console.log('2. ✅ Achieve 95%+ completion');
    console.log('3. 🎯 Final quality validation');
  } else if (missingCount + incompleteCount <= 15) {
    console.log('1. 🔧 Focus on missing Evidence Profiles first');
    console.log('2. 🔧 Fix incomplete Evidence Profiles');
    console.log('3. ✅ Push toward 90%+ completion');
  } else {
    console.log('1. 🔧 Systematic completion of missing profiles');
    console.log('2. 🔧 Fix high-priority incomplete profiles');
    console.log('3. 🎯 Target 85%+ completion');
  }
  
  console.log('\n✅ Targeted incomplete analysis complete');
  
  return {
    totalSupplements,
    completeCount,
    incompleteCount,
    missingCount,
    completionRate,
    incompleteSupplements: incompleteSupplements.slice(0, 10),
    missingSupplements
  };
  
} catch (error) {
  console.error('❌ Analysis error:', error.message);
}
