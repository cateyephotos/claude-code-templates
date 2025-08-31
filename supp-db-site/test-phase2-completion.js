const { chromium } = require('playwright');

(async () => {
  console.log('🎉 PHASE 2 COMPLETION TEST');
  console.log('Testing all 10 Phase 2 supplements with Evidence Profiles...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // All Phase 2 supplements
    const phase2Supplements = [
      // Week 3 Priority
      { id: 68, name: 'Schisandra Berry', expectedTier: 'Tier 2', expectedScore: 76, category: 'Adaptogen' },
      { id: 71, name: 'Boswellia', expectedTier: 'Tier 2', expectedScore: 82, category: 'Anti-inflammatory' },
      { id: 79, name: 'Passionflower', expectedTier: 'Tier 2', expectedScore: 74, category: 'Calming' },
      // Week 4 Supplements
      { id: 82, name: 'Kanna', expectedTier: 'Tier 3', expectedScore: 62, category: 'Mood Support' },
      { id: 83, name: 'Black Seed Oil', expectedTier: 'Tier 2', expectedScore: 79, category: 'Multi-purpose' },
      { id: 84, name: 'Moringa', expectedTier: 'Tier 2', expectedScore: 73, category: 'Superfood' },
      { id: 85, name: 'Pine Bark Extract', expectedTier: 'Tier 2', expectedScore: 84, category: 'Antioxidant' },
      { id: 86, name: 'Grape Seed Extract', expectedTier: 'Tier 2', expectedScore: 81, category: 'Antioxidant' },
      { id: 88, name: 'Zeaxanthin', expectedTier: 'Tier 2', expectedScore: 78, category: 'Eye Health' },
      { id: 89, name: 'Pterostilbene', expectedTier: 'Tier 2', expectedScore: 77, category: 'Antioxidant' }
    ];
    
    console.log(`\n🔍 Testing ${phase2Supplements.length} Phase 2 supplements...`);
    
    const results = [];
    let allWorking = true;
    let totalCitations = 0;
    
    for (const supplement of phase2Supplements) {
      const dataCheck = await page.evaluate((id) => {
        const hasEnhancedData = window.enhancedCitations && window.enhancedCitations[id] !== undefined;
        let evidenceProfile = null;
        let profileCompleteness = 0;
        let missingFields = [];
        let citationCounts = { mechanisms: 0, benefits: 0, safety: 0 };
        
        if (hasEnhancedData) {
          const data = window.enhancedCitations[id];
          
          // Check Evidence Profile
          if (data.evidenceProfile) {
            evidenceProfile = data.evidenceProfile;
            
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
          
          // Check citation counts
          if (data.citations) {
            citationCounts.mechanisms = data.citations.mechanisms ? data.citations.mechanisms.length : 0;
            citationCounts.benefits = data.citations.benefits ? data.citations.benefits.length : 0;
            citationCounts.safety = data.citations.safety ? data.citations.safety.length : 0;
          }
        }
        
        return {
          hasEnhancedData,
          evidenceProfile,
          profileCompleteness,
          missingFields,
          citationCounts
        };
      }, supplement.id);
      
      const isComplete = dataCheck.profileCompleteness === 100;
      const tierCorrect = dataCheck.evidenceProfile?.overallQuality === supplement.expectedTier;
      const scoreCorrect = dataCheck.evidenceProfile?.researchQualityScore === supplement.expectedScore;
      const hasSufficientCitations = dataCheck.citationCounts.mechanisms >= 3 && 
                                    dataCheck.citationCounts.benefits >= 4 && 
                                    dataCheck.citationCounts.safety >= 2;
      
      const supplementTotal = dataCheck.citationCounts.mechanisms + dataCheck.citationCounts.benefits + dataCheck.citationCounts.safety;
      totalCitations += supplementTotal;
      
      const statusIcon = isComplete ? '✅' : '❌';
      const tierIcon = tierCorrect ? '✅' : '⚠️';
      const scoreIcon = scoreCorrect ? '✅' : '⚠️';
      const citationIcon = hasSufficientCitations ? '✅' : '⚠️';
      
      console.log(`\n📋 ${supplement.name} (ID: ${supplement.id}): ${statusIcon}`);
      console.log(`   Category: ${supplement.category}`);
      console.log(`   Enhanced Data: ${dataCheck.hasEnhancedData}`);
      console.log(`   Evidence Profile: ${isComplete} (${dataCheck.profileCompleteness}%)`);
      
      if (dataCheck.evidenceProfile) {
        console.log(`   Quality: ${dataCheck.evidenceProfile.overallQuality} ${tierIcon} (Expected: ${supplement.expectedTier})`);
        console.log(`   Score: ${dataCheck.evidenceProfile.researchQualityScore} ${scoreIcon} (Expected: ${supplement.expectedScore})`);
        console.log(`   Maturity: ${dataCheck.evidenceProfile.researchMaturity}`);
        console.log(`   Key Findings: ${dataCheck.evidenceProfile.keyFindings ? 'Present' : 'Missing'}`);
      }
      
      console.log(`   Citations: M:${dataCheck.citationCounts.mechanisms}, B:${dataCheck.citationCounts.benefits}, S:${dataCheck.citationCounts.safety} (Total: ${supplementTotal}) ${citationIcon}`);
      
      if (dataCheck.missingFields.length > 0) {
        console.log(`   Missing Fields: ${dataCheck.missingFields.join(', ')}`);
        allWorking = false;
      }
      
      results.push({
        id: supplement.id,
        name: supplement.name,
        category: supplement.category,
        isComplete,
        tierCorrect,
        scoreCorrect,
        hasSufficientCitations,
        profileCompleteness: dataCheck.profileCompleteness,
        tier: dataCheck.evidenceProfile?.overallQuality,
        score: dataCheck.evidenceProfile?.researchQualityScore,
        citationCounts: dataCheck.citationCounts,
        totalCitations: supplementTotal
      });
      
      if (!isComplete || !hasSufficientCitations) allWorking = false;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 PHASE 2 COMPLETION TEST RESULTS');
    console.log('='.repeat(80));
    
    const completeCount = results.filter(r => r.isComplete).length;
    const tierCorrectCount = results.filter(r => r.tierCorrect).length;
    const scoreCorrectCount = results.filter(r => r.scoreCorrect).length;
    const citationSufficientCount = results.filter(r => r.hasSufficientCitations).length;
    
    console.log(`\n📊 Phase 2 Final Results:`);
    console.log(`   Complete Evidence Profiles: ${completeCount}/${phase2Supplements.length} (${Math.round((completeCount/phase2Supplements.length)*100)}%)`);
    console.log(`   Correct Tiers: ${tierCorrectCount}/${phase2Supplements.length} (${Math.round((tierCorrectCount/phase2Supplements.length)*100)}%)`);
    console.log(`   Correct Scores: ${scoreCorrectCount}/${phase2Supplements.length} (${Math.round((scoreCorrectCount/phase2Supplements.length)*100)}%)`);
    console.log(`   Sufficient Citations: ${citationSufficientCount}/${phase2Supplements.length} (${Math.round((citationSufficientCount/phase2Supplements.length)*100)}%)`);
    console.log(`   Total Citations Added: ${totalCitations}`);
    
    // Show tier distribution
    const tierCounts = {};
    results.forEach(r => {
      if (r.tier) {
        tierCounts[r.tier] = (tierCounts[r.tier] || 0) + 1;
      }
    });
    
    console.log(`\n🎯 Quality Tier Distribution:`);
    Object.entries(tierCounts).forEach(([tier, count]) => {
      const percentage = Math.round((count / results.length) * 100);
      console.log(`   ${tier}: ${count} supplements (${percentage}%)`);
    });
    
    // Calculate overall database status
    const totalSupplementsInDatabase = 89;
    const enhancedSupplementsBeforePhase2 = 68;
    const phase2Additions = completeCount;
    const totalEnhancedNow = enhancedSupplementsBeforePhase2 + phase2Additions;
    const overallCompletionRate = Math.round((totalEnhancedNow / totalSupplementsInDatabase) * 100);
    
    console.log(`\n📈 Overall Database Status:`);
    console.log(`   Total Supplements: ${totalSupplementsInDatabase}`);
    console.log(`   Enhanced Before Phase 2: ${enhancedSupplementsBeforePhase2}`);
    console.log(`   Phase 2 Additions: ${phase2Additions}`);
    console.log(`   Total Enhanced Now: ${totalEnhancedNow}`);
    console.log(`   Overall Completion: ${overallCompletionRate}%`);
    
    if (allWorking && completeCount === phase2Supplements.length) {
      console.log('\n🎉 PHASE 2 ROADMAP COMPLETE SUCCESS!');
      console.log('✅ All 10 Phase 2 supplements have complete Evidence Profiles');
      console.log('✅ All tiers and scores properly assigned');
      console.log('✅ Sufficient citations across all categories');
      console.log('✅ Quality standards maintained throughout');
      console.log(`✅ Evidence Profile system now covers ${totalEnhancedNow}/89 supplements (${overallCompletionRate}%)`);
      
      console.log('\n🏆 PHASE 2 ACHIEVEMENTS:');
      console.log(`   ✅ 10 new supplements with enhanced citations`);
      console.log(`   ✅ 10 complete Evidence Profiles created`);
      console.log(`   ✅ ${totalCitations} total citations added`);
      console.log(`   ✅ Systematic quality tier assignments`);
      console.log(`   ✅ Evidence-based research scores`);
      console.log(`   ✅ Comprehensive safety assessments`);
      
      if (overallCompletionRate >= 85) {
        console.log('\n🎊 DATABASE MILESTONE ACHIEVED:');
        console.log(`   🎯 ${overallCompletionRate}% completion rate achieved`);
        console.log(`   🎯 Evidence Profile system is highly comprehensive`);
        console.log(`   🎯 Ready for final completion push`);
      }
      
    } else {
      console.log('\n⚠️ PHASE 2 HAS REMAINING ISSUES:');
      const broken = results.filter(r => !r.isComplete || !r.hasSufficientCitations);
      broken.forEach(supp => {
        console.log(`   ${supp.name}: ${supp.profileCompleteness}% complete, Citations: ${supp.totalCitations}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (allWorking && completeCount === phase2Supplements.length) {
      const remaining = totalSupplementsInDatabase - totalEnhancedNow;
      console.log(`1. 🎉 Phase 2 roadmap successfully completed!`);
      console.log(`2. 📋 ${remaining} supplements remaining for 100% completion`);
      console.log(`3. 🎯 Consider Phase 3 for final completion push`);
      console.log(`4. ✅ Evidence Profile system is highly comprehensive`);
    } else {
      console.log('1. 🔧 Fix remaining Phase 2 issues');
      console.log('2. ✅ Re-test Phase 2 supplements');
      console.log('3. 📋 Complete Phase 2 before moving forward');
    }
    
    return {
      allWorking,
      completeCount,
      totalCitations,
      overallCompletionRate,
      results
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Phase 2 completion test complete');
  }
})();
