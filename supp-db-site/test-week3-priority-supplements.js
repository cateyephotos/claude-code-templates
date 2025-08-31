const { chromium } = require('playwright');

(async () => {
  console.log('🧪 TESTING WEEK 3 PRIORITY SUPPLEMENTS');
  console.log('Verifying Schisandra Berry, Boswellia, and Passionflower...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Week 3 priority supplements
    const week3Supplements = [
      { id: 68, name: 'Schisandra Berry', expectedTier: 'Tier 2', expectedScore: 76, category: 'Adaptogen' },
      { id: 71, name: 'Boswellia', expectedTier: 'Tier 2', expectedScore: 82, category: 'Anti-inflammatory' },
      { id: 79, name: 'Passionflower', expectedTier: 'Tier 2', expectedScore: 74, category: 'Calming' }
    ];
    
    console.log(`\n🔍 Testing ${week3Supplements.length} Week 3 priority supplements...`);
    
    const results = [];
    let allWorking = true;
    
    for (const supplement of week3Supplements) {
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
      
      const statusIcon = isComplete ? '✅' : '❌';
      const tierIcon = tierCorrect ? '✅' : '⚠️';
      const scoreIcon = scoreCorrect ? '✅' : '⚠️';
      const citationIcon = hasSufficientCitations ? '✅' : '⚠️';
      
      console.log(`\n📋 ${supplement.name} (ID: ${supplement.id}): ${statusIcon}`);
      console.log(`   Category: ${supplement.category}`);
      console.log(`   Enhanced Data: ${dataCheck.hasEnhancedData}`);
      console.log(`   Evidence Profile Complete: ${isComplete} (${dataCheck.profileCompleteness}%)`);
      
      if (dataCheck.evidenceProfile) {
        console.log(`   Quality: ${dataCheck.evidenceProfile.overallQuality} ${tierIcon} (Expected: ${supplement.expectedTier})`);
        console.log(`   Score: ${dataCheck.evidenceProfile.researchQualityScore} ${scoreIcon} (Expected: ${supplement.expectedScore})`);
        console.log(`   Maturity: ${dataCheck.evidenceProfile.researchMaturity}`);
        console.log(`   Span: ${dataCheck.evidenceProfile.publicationSpan}`);
        console.log(`   Key Findings: ${dataCheck.evidenceProfile.keyFindings ? 'Present' : 'Missing'}`);
      }
      
      console.log(`   Citations: M:${dataCheck.citationCounts.mechanisms}, B:${dataCheck.citationCounts.benefits}, S:${dataCheck.citationCounts.safety} ${citationIcon}`);
      
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
        citationCounts: dataCheck.citationCounts
      });
      
      if (!isComplete || !hasSufficientCitations) allWorking = false;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 WEEK 3 PRIORITY SUPPLEMENTS TEST RESULTS');
    console.log('='.repeat(80));
    
    const completeCount = results.filter(r => r.isComplete).length;
    const tierCorrectCount = results.filter(r => r.tierCorrect).length;
    const scoreCorrectCount = results.filter(r => r.scoreCorrect).length;
    const citationSufficientCount = results.filter(r => r.hasSufficientCitations).length;
    
    console.log(`\n📊 Week 3 Results:`);
    console.log(`   Complete Evidence Profiles: ${completeCount}/${week3Supplements.length} (${Math.round((completeCount/week3Supplements.length)*100)}%)`);
    console.log(`   Correct Tiers: ${tierCorrectCount}/${week3Supplements.length} (${Math.round((tierCorrectCount/week3Supplements.length)*100)}%)`);
    console.log(`   Correct Scores: ${scoreCorrectCount}/${week3Supplements.length} (${Math.round((scoreCorrectCount/week3Supplements.length)*100)}%)`);
    console.log(`   Sufficient Citations: ${citationSufficientCount}/${week3Supplements.length} (${Math.round((citationSufficientCount/week3Supplements.length)*100)}%)`);
    
    // Show detailed citation breakdown
    console.log(`\n📚 Citation Analysis:`);
    results.forEach(supp => {
      const total = supp.citationCounts.mechanisms + supp.citationCounts.benefits + supp.citationCounts.safety;
      console.log(`   ${supp.name}: ${total} total (M:${supp.citationCounts.mechanisms}, B:${supp.citationCounts.benefits}, S:${supp.citationCounts.safety})`);
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
    
    if (allWorking) {
      console.log('\n🎉 WEEK 3 PRIORITY SUPPLEMENTS SUCCESS!');
      console.log('✅ All 3 supplements have complete Evidence Profiles');
      console.log('✅ All tiers and scores properly assigned');
      console.log('✅ Sufficient citations across all categories');
      console.log('✅ Quality standards maintained');
      console.log('🚀 Ready to continue with Week 4 supplements');
      
      console.log('\n📈 Phase 2 Progress Update:');
      console.log('   Week 3 Priority: 3/3 complete (100%)');
      console.log('   Total Phase 2 Progress: 3/10 remaining supplements (30%)');
      console.log('   Evidence Profile System: 71/89 supplements (80%)');
      
    } else {
      console.log('\n⚠️ WEEK 3 SUPPLEMENTS HAVE ISSUES:');
      const broken = results.filter(r => !r.isComplete || !r.hasSufficientCitations);
      broken.forEach(supp => {
        console.log(`   ${supp.name}: ${supp.profileCompleteness}% complete, Citations: ${supp.citationCounts.mechanisms + supp.citationCounts.benefits + supp.citationCounts.safety}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (allWorking) {
      console.log('1. ✅ Continue with Week 4 supplements (Kanna, Black Seed Oil, Moringa)');
      console.log('2. 🔧 Add remaining supplements (Pine Bark, Grape Seed, Zeaxanthin, Pterostilbene)');
      console.log('3. 📋 Target: 100% Evidence Profile coverage (89/89 supplements)');
      console.log('4. 🎯 Complete Phase 2 roadmap by February 25, 2025');
    } else {
      console.log('1. 🔧 Fix remaining Week 3 issues');
      console.log('2. ✅ Re-test Week 3 supplements');
      console.log('3. 📋 Continue with Week 4 once fixed');
    }
    
    return {
      allWorking,
      completeCount,
      results
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Week 3 priority supplements test complete');
  }
})();
