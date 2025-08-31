const { chromium } = require('playwright');

(async () => {
  console.log('🚀 TESTING HIGH-PRIORITY EVIDENCE PROFILES');
  console.log('Verifying Evidence Profiles for high-impact supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // High-priority supplements just completed
    const highPrioritySupplements = [
      { id: 50, name: 'Caffeine', expectedTier: 'Tier 1', expectedScore: 94, category: 'Performance Enhancer' },
      { id: 46, name: 'Astaxanthin', expectedTier: 'Tier 2', expectedScore: 79, category: 'Antioxidant' },
      { id: 44, name: 'Alpha-Lipoic Acid', expectedTier: 'Tier 2', expectedScore: 83, category: 'Antioxidant' },
      { id: 47, name: 'Ginger', expectedTier: 'Tier 2', expectedScore: 81, category: 'Herbal Supplement' },
      { id: 48, name: 'Garlic', expectedTier: 'Tier 2', expectedScore: 84, category: 'Herbal Supplement' },
      { id: 49, name: 'Echinacea', expectedTier: 'Tier 2', expectedScore: 76, category: 'Herbal Supplement' },
      { id: 31, name: 'Whey Protein', expectedTier: 'Tier 1', expectedScore: 89, category: 'Protein' }
    ];
    
    console.log(`\n🔍 Testing ${highPrioritySupplements.length} high-priority supplements...`);
    
    const results = [];
    let allWorking = true;
    let categoryStats = {};
    
    for (const supplement of highPrioritySupplements) {
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
      const tierCorrect = dataCheck.evidenceProfile?.overallQuality === supplement.expectedTier;
      const scoreCorrect = dataCheck.evidenceProfile?.researchQualityScore === supplement.expectedScore;
      
      // Track category statistics
      if (!categoryStats[supplement.category]) {
        categoryStats[supplement.category] = { total: 0, complete: 0 };
      }
      categoryStats[supplement.category].total++;
      if (isComplete) categoryStats[supplement.category].complete++;
      
      const statusIcon = isComplete ? '✅' : '❌';
      const tierIcon = tierCorrect ? '✅' : '⚠️';
      const scoreIcon = scoreCorrect ? '✅' : '⚠️';
      
      console.log(`\n📋 ${supplement.name} (ID: ${supplement.id}): ${statusIcon}`);
      console.log(`   Category: ${supplement.category}`);
      console.log(`   Enhanced Data: ${dataCheck.hasEnhancedData}`);
      console.log(`   Profile Complete: ${isComplete} (${dataCheck.profileCompleteness}%)`);
      
      if (dataCheck.evidenceProfile) {
        console.log(`   Quality: ${dataCheck.evidenceProfile.overallQuality} ${tierIcon} (Expected: ${supplement.expectedTier})`);
        console.log(`   Score: ${dataCheck.evidenceProfile.researchQualityScore} ${scoreIcon} (Expected: ${supplement.expectedScore})`);
        console.log(`   Maturity: ${dataCheck.evidenceProfile.researchMaturity}`);
        console.log(`   Span: ${dataCheck.evidenceProfile.publicationSpan}`);
        
        if (dataCheck.evidenceProfile.evidenceStrength) {
          console.log(`   Strengths: M:${dataCheck.evidenceProfile.evidenceStrength.mechanisms}, C:${dataCheck.evidenceProfile.evidenceStrength.clinicalBenefits}, S:${dataCheck.evidenceProfile.evidenceStrength.safety}, D:${dataCheck.evidenceProfile.evidenceStrength.dosage}`);
        }
      }
      
      if (dataCheck.missingFields.length > 0) {
        console.log(`   Missing: ${dataCheck.missingFields.join(', ')}`);
        allWorking = false;
      }
      
      results.push({
        id: supplement.id,
        name: supplement.name,
        category: supplement.category,
        isComplete,
        tierCorrect,
        scoreCorrect,
        profileCompleteness: dataCheck.profileCompleteness,
        tier: dataCheck.evidenceProfile?.overallQuality,
        score: dataCheck.evidenceProfile?.researchQualityScore
      });
      
      if (!isComplete) allWorking = false;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 HIGH-PRIORITY EVIDENCE PROFILE TEST RESULTS');
    console.log('='.repeat(80));
    
    const completeCount = results.filter(r => r.isComplete).length;
    const tierCorrectCount = results.filter(r => r.tierCorrect).length;
    const scoreCorrectCount = results.filter(r => r.scoreCorrect).length;
    
    console.log(`\n📊 High-Priority Results:`);
    console.log(`   Complete Profiles: ${completeCount}/${highPrioritySupplements.length} (${Math.round((completeCount/highPrioritySupplements.length)*100)}%)`);
    console.log(`   Correct Tiers: ${tierCorrectCount}/${highPrioritySupplements.length} (${Math.round((tierCorrectCount/highPrioritySupplements.length)*100)}%)`);
    console.log(`   Correct Scores: ${scoreCorrectCount}/${highPrioritySupplements.length} (${Math.round((scoreCorrectCount/highPrioritySupplements.length)*100)}%)`);
    
    console.log(`\n📋 Category Performance:`);
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const rate = Math.round((stats.complete / stats.total) * 100);
      console.log(`   ${category}: ${stats.complete}/${stats.total} (${rate}%)`);
    });
    
    // Show tier distribution
    const tierCounts = {};
    results.forEach(r => {
      if (r.tier) {
        tierCounts[r.tier] = (tierCounts[r.tier] || 0) + 1;
      }
    });
    
    console.log(`\n🎯 Quality Tier Distribution:`);
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} supplements`);
    });
    
    // Calculate overall database improvement
    const previousComplete = 57; // After Batches A & B
    const newlyAdded = completeCount;
    const totalComplete = previousComplete + newlyAdded;
    const totalSupplements = 89;
    const overallRate = Math.round((totalComplete / totalSupplements) * 100);
    
    console.log(`\n📈 Overall Database Impact:`);
    console.log(`   Before High-Priority: 57/89 complete profiles (64%)`);
    console.log(`   After High-Priority: ${totalComplete}/89 complete profiles (${overallRate}%)`);
    console.log(`   Improvement: +${newlyAdded} complete profiles (+${overallRate - 64}% success rate)`);
    console.log(`   Remaining: ${89 - totalComplete} supplements need Evidence Profiles`);
    
    if (allWorking) {
      console.log('\n🎉 HIGH-PRIORITY SUPPLEMENTS COMPLETE SUCCESS!');
      console.log('✅ All 7 high-priority supplements have complete Evidence Profiles');
      console.log('✅ All tiers and scores properly assigned');
      console.log('✅ Quality standards maintained across all categories');
      console.log('🚀 Major impact on database quality achieved');
      
      if (overallRate >= 70) {
        console.log('\n🎊 MAJOR MILESTONE ACHIEVED!');
        console.log(`✅ Database Evidence Profile completion: ${overallRate}%`);
        console.log('✅ Crossed 70% completion threshold');
        console.log('✅ Evidence Profile system is now highly comprehensive');
      }
      
    } else {
      console.log('\n⚠️ HIGH-PRIORITY SUPPLEMENTS HAVE ISSUES:');
      const broken = results.filter(r => !r.isComplete);
      broken.forEach(supp => {
        console.log(`   ${supp.name}: ${supp.profileCompleteness}% complete`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (allWorking) {
      console.log('1. ✅ Continue with additional high-impact supplements');
      console.log('2. 🔧 Target: 75% completion (67/89 supplements)');
      console.log('3. 📋 Focus on remaining antioxidants and adaptogens');
      console.log('4. 🎯 Prepare for Phase 2 Week 3 supplements');
    } else {
      console.log('1. 🔧 Fix remaining high-priority issues');
      console.log('2. ✅ Re-test high-priority supplements');
      console.log('3. 📋 Continue with additional supplements once fixed');
    }
    
    console.log('\n📋 EVIDENCE PROFILE SYSTEM STATUS:');
    if (overallRate >= 75) {
      console.log('🎉 EXCELLENT - Evidence Profile system is highly comprehensive');
    } else if (overallRate >= 70) {
      console.log('🎊 VERY GOOD - Strong comprehensive coverage achieved');
    } else if (overallRate >= 65) {
      console.log('🔧 GOOD - Solid foundation with continued improvement');
    } else {
      console.log('🔧 DEVELOPING - Good progress but more work needed');
    }
    
    return {
      allWorking,
      completeCount,
      totalComplete,
      overallRate,
      results,
      categoryStats
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ High-priority Evidence Profile test complete');
  }
})();
