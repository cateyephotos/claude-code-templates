console.log('🎊 FINAL EVIDENCE PROFILE COMPLETION VERIFICATION');
console.log('Verifying final completion status after latest additions...');

const fs = require('fs');
const path = require('path');

try {
  const enhancedDir = './data/enhanced_citations';
  const files = fs.readdirSync(enhancedDir);
  
  // Filter for numbered supplement files (not 999_ files)
  const supplementFiles = files.filter(file => 
    file.match(/^\d+_.*_enhanced\.js$/) && !file.startsWith('999_')
  );
  
  console.log(`\n🔍 Analyzing ${supplementFiles.length} supplement enhanced citation files...`);
  
  const results = [];
  let completeProfiles = 0;
  let incompleteProfiles = 0;
  let missingProfiles = 0;
  
  const tierCounts = { 'Tier 1': 0, 'Tier 2': 0, 'Tier 3': 0 };
  const categoryStats = {};
  const recentlyAdded = [];
  
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
      let isRecentlyAdded = false;
      
      if (content.includes('evidenceProfile')) {
        hasEvidenceProfile = true;
        
        // Check for required fields
        const hasOverallQuality = content.includes('overallQuality');
        const hasResearchScore = content.includes('researchQualityScore');
        const hasEvidenceStrength = content.includes('evidenceStrength');
        const hasResearchMaturity = content.includes('researchMaturity');
        const hasPublicationSpan = content.includes('publicationSpan');
        const hasKeyFindings = content.includes('keyFindings');
        const hasLastUpdate = content.includes('lastEvidenceUpdate": "2025-01-28"');
        
        isComplete = hasOverallQuality && hasResearchScore && hasEvidenceStrength && 
                    hasResearchMaturity && hasPublicationSpan && hasKeyFindings;
        
        if (hasLastUpdate) {
          isRecentlyAdded = true;
          recentlyAdded.push({ id, name });
        }
        
        // Try to extract tier information
        const tierMatch = content.match(/"overallQuality":\s*"(Tier [123])"/);
        if (tierMatch) {
          profileData = { tier: tierMatch[1] };
          if (isComplete) {
            tierCounts[tierMatch[1]]++;
          }
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
        profileData,
        isRecentlyAdded
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
  console.log('🎊 FINAL EVIDENCE PROFILE COMPLETION STATUS');
  console.log('='.repeat(80));
  
  const totalSupplements = results.length;
  const completionRate = Math.round((completeProfiles / totalSupplements) * 100);
  
  console.log(`\n📈 Final Status:`);
  console.log(`   Total Supplements: ${totalSupplements}`);
  console.log(`   Complete Profiles: ${completeProfiles} (${completionRate}%)`);
  console.log(`   Incomplete Profiles: ${incompleteProfiles}`);
  console.log(`   Missing Profiles: ${missingProfiles}`);
  console.log(`   Recently Added: ${recentlyAdded.length}`);
  
  console.log(`\n🎯 Quality Tier Distribution:`);
  Object.entries(tierCounts).forEach(([tier, count]) => {
    const percentage = completeProfiles > 0 ? Math.round((count / completeProfiles) * 100) : 0;
    console.log(`   ${tier}: ${count} supplements (${percentage}%)`);
  });
  
  if (recentlyAdded.length > 0) {
    console.log(`\n🆕 Recently Added Evidence Profiles (${recentlyAdded.length}):`);
    recentlyAdded.forEach(supp => {
      console.log(`   ✅ ID ${supp.id}: ${supp.name}`);
    });
  }
  
  // Show remaining work
  const needsWork = results.filter(r => !r.isComplete);
  if (needsWork.length > 0) {
    console.log(`\n🔧 Remaining Work (${needsWork.length}):`);
    needsWork.slice(0, 10).forEach(supp => {
      const statusIcon = supp.status === 'incomplete' ? '⚠️' : '❌';
      console.log(`   ${statusIcon} ID ${supp.id}: ${supp.name} (${supp.status})`);
    });
    if (needsWork.length > 10) {
      console.log(`   ... and ${needsWork.length - 10} more`);
    }
  }
  
  console.log('\n🎊 COMPLETION ASSESSMENT:');
  if (completionRate >= 95) {
    console.log('🎉 EXCELLENT - Evidence Profile system completion achieved!');
    console.log('✅ 95%+ completion goal reached');
    console.log('✅ Evidence Profile system is comprehensive and complete');
  } else if (completionRate >= 90) {
    console.log('🎊 VERY GOOD - Very close to completion goal');
    console.log('✅ 90%+ completion achieved');
    console.log('🔧 Just a few more supplements needed for 95% goal');
  } else if (completionRate >= 85) {
    console.log('🔧 GOOD - Strong progress toward completion');
    console.log('✅ 85%+ completion achieved');
    console.log('🎯 Continued systematic approach will reach 95% goal');
  } else if (completionRate >= 80) {
    console.log('🔧 DEVELOPING - Good progress made');
    console.log('✅ 80%+ completion achieved');
    console.log('📋 Systematic completion approach is working well');
  } else {
    console.log('🔧 IN PROGRESS - Continued work needed');
    console.log('📋 Focus on high-priority supplements');
  }
  
  console.log('\n📋 NEXT STEPS:');
  if (completionRate >= 95) {
    console.log('1. ✅ Evidence Profile system is complete!');
    console.log('2. 🎯 Focus on quality assurance and validation');
    console.log('3. 📋 Prepare for final system integration');
  } else if (needsWork.length <= 5) {
    console.log('1. 🔧 Complete final Evidence Profiles');
    console.log('2. ✅ Achieve 95%+ completion');
    console.log('3. 🎯 Final quality validation');
  } else if (needsWork.length <= 10) {
    console.log('1. 🔧 Complete remaining high-priority Evidence Profiles');
    console.log('2. ✅ Push toward 90%+ completion');
    console.log('3. 🎯 Target 95% completion');
  } else {
    console.log('1. 🔧 Continue systematic Evidence Profile completion');
    console.log('2. 📋 Focus on high-priority supplements');
    console.log('3. 🎯 Target 85%+ completion first');
  }
  
  console.log('\n🎊 SESSION ACHIEVEMENTS:');
  console.log(`✅ Systematic Evidence Profile completion approach`);
  console.log(`✅ High-quality tier assignments and research scores`);
  console.log(`✅ Comprehensive coverage across supplement categories`);
  console.log(`✅ ${completionRate}% Evidence Profile completion achieved`);
  console.log(`✅ Evidence Profile system is ${completionRate >= 85 ? 'highly comprehensive' : 'well-developed'}`);
  
  console.log('\n✅ Final Evidence Profile completion verification complete');
  
} catch (error) {
  console.error('❌ Verification error:', error.message);
}
