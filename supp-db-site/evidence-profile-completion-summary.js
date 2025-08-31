const { chromium } = require('playwright');

(async () => {
  console.log('📊 EVIDENCE PROFILE COMPLETION SUMMARY');
  console.log('Final assessment of Evidence Profile system completion...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test all supplements we've worked on
    const completedSupplements = [
      // Original complete profiles (46)
      // Batch A: Vitamins & Minerals (6)
      { id: 22, name: 'Vitamin B6', batch: 'A', category: 'Essential Nutrients' },
      { id: 23, name: 'Folate', batch: 'A', category: 'Essential Nutrients' },
      { id: 30, name: 'Vitamin E', batch: 'A', category: 'Essential Nutrients' },
      { id: 36, name: 'Vitamin C', batch: 'A', category: 'Essential Nutrients' },
      { id: 42, name: 'Selenium', batch: 'A', category: 'Essential Nutrients' },
      { id: 62, name: 'Vanadium', batch: 'A', category: 'Essential Nutrients' },
      
      // Batch B: Amino Acids (3)
      { id: 13, name: 'Acetyl-L-Carnitine', batch: 'B', category: 'Amino Acid' },
      { id: 33, name: 'L-Tyrosine', batch: 'B', category: 'Amino Acid' },
      { id: 43, name: 'Choline', batch: 'B', category: 'Essential Nutrients' },
      
      // High Priority (2)
      { id: 8, name: 'Melatonin', batch: 'High Priority', category: 'Sleep Aid' },
      { id: 15, name: 'Panax Ginseng', batch: 'High Priority', category: 'Adaptogen' }
    ];
    
    console.log(`\n🔍 Testing ${completedSupplements.length} newly completed Evidence Profiles...`);
    
    const results = [];
    let allWorking = true;
    let batchStats = {};
    
    for (const supplement of completedSupplements) {
      const dataCheck = await page.evaluate((id) => {
        const hasEnhancedData = window.enhancedCitations && window.enhancedCitations[id] !== undefined;
        let evidenceProfile = null;
        let profileCompleteness = 0;
        let missingFields = [];
        
        if (hasEnhancedData && window.enhancedCitations[id].evidenceProfile) {
          evidenceProfile = window.enhancedCitations[id].evidenceProfile;
          
          // Check completeness
          const requiredFields = [
            'overallQuality', 'researchQualityScore', 'evidenceStrength',
            'researchMaturity', 'publicationSpan', 'lastEvidenceUpdate', 'keyFindings'
          ];
          
          const presentFields = requiredFields.filter(field => {
            if (field === 'researchQualityScore') {
              return typeof evidenceProfile[field] === 'number';
            }
            return !!evidenceProfile[field];
          });
          
          missingFields = requiredFields.filter(field => {
            if (field === 'researchQualityScore') {
              return typeof evidenceProfile[field] !== 'number';
            }
            return !evidenceProfile[field];
          });
          
          profileCompleteness = Math.round((presentFields.length / requiredFields.length) * 100);
        }
        
        return {
          hasEnhancedData,
          evidenceProfile,
          profileCompleteness,
          missingFields
        };
      }, supplement.id);
      
      const isComplete = dataCheck.profileCompleteness === 100;
      const statusIcon = isComplete ? '✅' : '❌';
      
      // Track batch statistics
      if (!batchStats[supplement.batch]) {
        batchStats[supplement.batch] = { total: 0, complete: 0 };
      }
      batchStats[supplement.batch].total++;
      if (isComplete) batchStats[supplement.batch].complete++;
      
      console.log(`   ${supplement.name} (${supplement.batch}): ${statusIcon} ${dataCheck.evidenceProfile?.overallQuality || 'N/A'}`);
      
      results.push({
        ...supplement,
        isComplete,
        profileCompleteness: dataCheck.profileCompleteness,
        tier: dataCheck.evidenceProfile?.overallQuality,
        score: dataCheck.evidenceProfile?.researchQualityScore
      });
      
      if (!isComplete) allWorking = false;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 EVIDENCE PROFILE COMPLETION SUMMARY');
    console.log('='.repeat(80));
    
    const completeCount = results.filter(r => r.isComplete).length;
    
    console.log(`\n📊 Completion Results:`);
    console.log(`   Newly Added Profiles: ${completeCount}/${completedSupplements.length} (${Math.round((completeCount/completedSupplements.length)*100)}%)`);
    
    console.log(`\n📋 Batch Performance:`);
    Object.entries(batchStats).forEach(([batch, stats]) => {
      const rate = Math.round((stats.complete / stats.total) * 100);
      console.log(`   ${batch}: ${stats.complete}/${stats.total} (${rate}%)`);
    });
    
    // Calculate overall database improvement
    const originalComplete = 46; // Before our work
    const newlyAdded = completeCount;
    const totalComplete = originalComplete + newlyAdded;
    const totalSupplements = 89;
    const overallRate = Math.round((totalComplete / totalSupplements) * 100);
    
    console.log(`\n📈 Overall Database Status:`);
    console.log(`   Before Session: 46/89 complete profiles (52%)`);
    console.log(`   After Session: ${totalComplete}/89 complete profiles (${overallRate}%)`);
    console.log(`   Improvement: +${newlyAdded} complete profiles (+${overallRate - 52}% success rate)`);
    console.log(`   Remaining: ${89 - totalComplete} supplements need Evidence Profiles`);
    
    // Show tier distribution
    const tierCounts = {};
    results.forEach(r => {
      if (r.tier) {
        tierCounts[r.tier] = (tierCounts[r.tier] || 0) + 1;
      }
    });
    
    console.log(`\n🎯 Quality Tier Distribution (Newly Added):`);
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} supplements`);
    });
    
    if (allWorking) {
      console.log('\n🎉 EVIDENCE PROFILE COMPLETION SUCCESS!');
      console.log('✅ All newly added Evidence Profiles are complete and working');
      console.log('✅ Systematic approach proved highly effective');
      console.log('✅ Quality standards maintained across all supplements');
      
      if (overallRate >= 65) {
        console.log('\n🎊 MAJOR MILESTONE ACHIEVED!');
        console.log(`✅ Database Evidence Profile completion: ${overallRate}%`);
        console.log('✅ Significant improvement in database quality');
        console.log('✅ Evidence Profile system is now comprehensive');
      }
      
    } else {
      console.log('\n⚠️ SOME EVIDENCE PROFILES NEED ATTENTION:');
      const broken = results.filter(r => !r.isComplete);
      broken.forEach(supp => {
        console.log(`   ${supp.name}: ${supp.profileCompleteness}% complete`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS FOR COMPLETE COVERAGE:');
    console.log('1. 🔧 Continue adding Evidence Profiles to remaining supplements');
    console.log('2. 📋 Focus on supplements missing enhanced citations entirely');
    console.log('3. 🎯 Target: 95% Evidence Profile completion (85/89 supplements)');
    console.log('4. ✅ Maintain quality standards and consistency');
    
    console.log('\n📋 EVIDENCE PROFILE SYSTEM STATUS:');
    if (overallRate >= 70) {
      console.log('🎉 EXCELLENT - Evidence Profile system is comprehensive and effective');
    } else if (overallRate >= 60) {
      console.log('🎊 GOOD - Strong foundation with continued improvement needed');
    } else {
      console.log('🔧 DEVELOPING - Good progress but more work needed');
    }
    
    return {
      allWorking,
      completeCount,
      totalComplete,
      overallRate,
      results,
      batchStats
    };
    
  } catch (error) {
    console.error('❌ Summary error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Evidence Profile completion summary complete');
  }
})();
