console.log('🎊 COMPREHENSIVE EVIDENCE PROFILE STATUS ANALYSIS');
console.log('Analyzing all enhanced citation files for Evidence Profile completion...');

const fs = require('fs');
const path = require('path');

try {
  const enhancedDir = './data/enhanced_citations';
  const files = fs.readdirSync(enhancedDir);
  
  // Filter for numbered supplement files (not 999_ files)
  const supplementFiles = files.filter(file => 
    file.match(/^\d+_.*_enhanced\.js$/) && !file.startsWith('999_')
  );
  
  console.log(`\n🔍 Found ${supplementFiles.length} supplement enhanced citation files`);
  
  const results = [];
  let completeProfiles = 0;
  let incompleteProfiles = 0;
  let missingProfiles = 0;
  
  const tierCounts = { 'Tier 1': 0, 'Tier 2': 0, 'Tier 3': 0 };
  const categoryStats = {};
  
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
      let profileData = null;
      
      if (content.includes('evidenceProfile')) {
        hasEvidenceProfile = true;
        
        // Check for required fields
        const hasOverallQuality = content.includes('overallQuality');
        const hasResearchScore = content.includes('researchQualityScore');
        const hasEvidenceStrength = content.includes('evidenceStrength');
        const hasResearchMaturity = content.includes('researchMaturity');
        const hasPublicationSpan = content.includes('publicationSpan');
        const hasKeyFindings = content.includes('keyFindings');
        
        isComplete = hasOverallQuality && hasResearchScore && hasEvidenceStrength && 
                    hasResearchMaturity && hasPublicationSpan && hasKeyFindings;
        
        // Try to extract tier information
        const tierMatch = content.match(/"overallQuality":\s*"(Tier [123])"/);
        if (tierMatch) {
          profileData = { tier: tierMatch[1] };
          tierCounts[tierMatch[1]]++;
        }
        
        // Try to extract category
        const categoryMatch = content.match(/"category":\s*"([^"]+)"/);
        if (categoryMatch) {
          const category = categoryMatch[1];
          if (!categoryStats[category]) {
            categoryStats[category] = { total: 0, complete: 0 };
          }
          categoryStats[category].total++;
          if (isComplete) {
            categoryStats[category].complete++;
          }
        }
      }
      
      const status = isComplete ? 'complete' : 
                    hasEvidenceProfile ? 'incomplete' : 'missing';
      
      results.push({
        id,
        name,
        file,
        status,
        hasEvidenceProfile,
        isComplete,
        profileData
      });
      
      if (isComplete) {
        completeProfiles++;
      } else if (hasEvidenceProfile) {
        incompleteProfiles++;
      } else {
        missingProfiles++;
      }
      
    } catch (error) {
      console.log(`   Error processing ${file}: ${error.message}`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE EVIDENCE PROFILE STATUS');
  console.log('='.repeat(80));
  
  const totalSupplements = results.length;
  const completionRate = Math.round((completeProfiles / totalSupplements) * 100);
  
  console.log(`\n📈 Overall Status:`);
  console.log(`   Total Supplements: ${totalSupplements}`);
  console.log(`   Complete Profiles: ${completeProfiles} (${completionRate}%)`);
  console.log(`   Incomplete Profiles: ${incompleteProfiles}`);
  console.log(`   Missing Profiles: ${missingProfiles}`);
  
  console.log(`\n🎯 Quality Tier Distribution:`);
  Object.entries(tierCounts).forEach(([tier, count]) => {
    const percentage = completeProfiles > 0 ? Math.round((count / completeProfiles) * 100) : 0;
    console.log(`   ${tier}: ${count} supplements (${percentage}%)`);
  });
  
  console.log(`\n📂 Category Performance:`);
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const rate = Math.round((stats.complete / stats.total) * 100);
    console.log(`   ${category}: ${stats.complete}/${stats.total} (${rate}%)`);
  });
  
  // Show incomplete/missing supplements
  const needsWork = results.filter(r => !r.isComplete);
  if (needsWork.length > 0) {
    console.log(`\n🔧 Supplements Needing Work (${needsWork.length}):`);
    needsWork.forEach(supp => {
      const statusIcon = supp.status === 'incomplete' ? '⚠️' : '❌';
      console.log(`   ${statusIcon} ID ${supp.id}: ${supp.name} (${supp.status})`);
    });
  }
  
  // Show complete supplements by tier
  const completeSupps = results.filter(r => r.isComplete);
  if (completeSupps.length > 0) {
    console.log(`\n✅ Complete Evidence Profiles by Tier:`);
    ['Tier 1', 'Tier 2', 'Tier 3'].forEach(tier => {
      const tierSupps = completeSupps.filter(s => s.profileData?.tier === tier);
      if (tierSupps.length > 0) {
        console.log(`\n   ${tier} (${tierSupps.length} supplements):`);
        tierSupps.forEach(supp => {
          console.log(`     • ID ${supp.id}: ${supp.name}`);
        });
      }
    });
  }
  
  console.log('\n🎊 COMPLETION STATUS:');
  if (completionRate >= 95) {
    console.log('🎉 EXCELLENT - Evidence Profile system completion achieved!');
    console.log('✅ 95%+ completion goal reached');
  } else if (completionRate >= 90) {
    console.log('🎊 VERY GOOD - Very close to completion goal');
    console.log('✅ 90%+ completion achieved');
  } else if (completionRate >= 85) {
    console.log('🔧 GOOD - Strong progress toward completion');
    console.log('✅ 85%+ completion achieved');
  } else if (completionRate >= 80) {
    console.log('🔧 DEVELOPING - Good progress made');
    console.log('✅ 80%+ completion achieved');
  } else {
    console.log('🔧 IN PROGRESS - Continued work needed');
  }
  
  console.log('\n📋 NEXT STEPS:');
  if (completionRate >= 95) {
    console.log('1. ✅ Evidence Profile system is complete!');
    console.log('2. 🎯 Focus on quality assurance and validation');
    console.log('3. 📋 Prepare for final system integration');
  } else if (needsWork.length <= 5) {
    console.log('1. 🔧 Complete remaining Evidence Profiles');
    console.log('2. ✅ Achieve 95%+ completion');
    console.log('3. 🎯 Final quality validation');
  } else {
    console.log('1. 🔧 Continue systematic Evidence Profile completion');
    console.log('2. 📋 Focus on high-priority supplements');
    console.log('3. 🎯 Target 95% completion');
  }
  
  console.log('\n✅ Comprehensive Evidence Profile status analysis complete');
  
} catch (error) {
  console.error('❌ Analysis error:', error.message);
}
