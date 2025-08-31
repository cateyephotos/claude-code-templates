const { chromium } = require('playwright');

(async () => {
  console.log('🚀 QUICK PHASE 2 PROGRESS TEST');
  console.log('Testing our 3 newly created supplements: PEA, Bitter Melon, Gymnema Sylvestre');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const testSupplements = [
      { id: 57, name: 'PEA (Phenylethylamine)', status: 'Phase 2 - Week 1' },
      { id: 63, name: 'Bitter Melon', status: 'Phase 2 - Week 1' },
      { id: 64, name: 'Gymnema Sylvestre', status: 'Phase 2 - Week 1' }
    ];
    
    const results = [];
    let workingCount = 0;
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing ${supplement.name} (ID: ${supplement.id})...`);
      
      try {
        // Check if data is loaded
        const dataCheck = await page.evaluate((suppId) => {
          return {
            hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
            hasSupplementData: window.enhancedCitations && window.enhancedCitations[suppId] !== undefined,
            supplementDataKeys: window.enhancedCitations && window.enhancedCitations[suppId] ? 
              Object.keys(window.enhancedCitations[suppId]) : null
          };
        }, supplement.id);
        
        console.log(`   Data Loaded: ${dataCheck.hasSupplementData}`);
        
        if (!dataCheck.hasSupplementData) {
          console.log('   ❌ Data not loaded - check file or mapping');
          results.push({
            id: supplement.id,
            name: supplement.name,
            overallWorking: false,
            error: 'Data not loaded'
          });
          continue;
        }
        
        // Test supplement details functionality
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1500);
        
        // Test all tabs
        const tabResults = await page.evaluate((suppId) => {
          const benefitsContainer = document.getElementById(`benefits-${suppId}`);
          const safetyContainer = document.getElementById(`safety-${suppId}`);
          const mechanismsContainer = document.getElementById(`mechanisms-${suppId}`);
          
          const getBenefitsData = () => {
            if (!benefitsContainer) return { studyCards: 0, hasUndefined: true };
            let studyCards = Array.from(benefitsContainer.querySelectorAll('.enhanced-citation-card'));
            if (studyCards.length === 0) {
              studyCards = Array.from(benefitsContainer.querySelectorAll('.bg-gray-50'));
            }
            if (studyCards.length === 0) {
              studyCards = Array.from(benefitsContainer.querySelectorAll('.citation-card'));
            }
            const hasUndefined = benefitsContainer.innerHTML.includes('undefined');
            return { studyCards: studyCards.length, hasUndefined };
          };
          
          const getSafetyData = () => {
            if (!safetyContainer) return { studyCards: 0 };
            let studyCards = Array.from(safetyContainer.querySelectorAll('.enhanced-citation-card'));
            if (studyCards.length === 0) {
              studyCards = Array.from(safetyContainer.querySelectorAll('.bg-gray-50'));
            }
            if (studyCards.length === 0) {
              studyCards = Array.from(safetyContainer.querySelectorAll('.citation-card'));
            }
            return { studyCards: studyCards.length };
          };
          
          const getMechanismsData = () => {
            if (!mechanismsContainer) return { studyCards: 0 };
            let studyCards = Array.from(mechanismsContainer.querySelectorAll('.enhanced-citation-card'));
            if (studyCards.length === 0) {
              studyCards = Array.from(mechanismsContainer.querySelectorAll('.bg-gray-50'));
            }
            if (studyCards.length === 0) {
              studyCards = Array.from(mechanismsContainer.querySelectorAll('.citation-card'));
            }
            return { studyCards: studyCards.length };
          };
          
          return {
            benefits: getBenefitsData(),
            safety: getSafetyData(),
            mechanisms: getMechanismsData()
          };
        }, supplement.id);
        
        const benefitsWorking = tabResults.benefits.studyCards > 0 && !tabResults.benefits.hasUndefined;
        const safetyWorking = tabResults.safety.studyCards > 0;
        const mechanismsWorking = tabResults.mechanisms.studyCards > 0;
        const overallWorking = benefitsWorking && safetyWorking && mechanismsWorking;
        
        const result = {
          id: supplement.id,
          name: supplement.name,
          status: supplement.status,
          benefitsWorking: benefitsWorking,
          safetyWorking: safetyWorking,
          mechanismsWorking: mechanismsWorking,
          overallWorking: overallWorking,
          details: tabResults
        };
        
        results.push(result);
        
        if (overallWorking) {
          workingCount++;
        }
        
        const statusIcon = overallWorking ? '✅' : '❌';
        const workingTabs = [benefitsWorking, safetyWorking, mechanismsWorking].filter(Boolean).length;
        console.log(`   ${statusIcon} ${workingTabs}/3 tabs (B:${tabResults.benefits.studyCards} S:${tabResults.safety.studyCards} M:${tabResults.mechanisms.studyCards})`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({
          id: supplement.id,
          name: supplement.name,
          status: supplement.status,
          overallWorking: false,
          error: error.message
        });
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🏆 PHASE 2 PROGRESS TEST RESULTS');
    console.log('='.repeat(70));
    
    const totalTested = results.length;
    const successRate = Math.round((workingCount / totalTested) * 100);
    
    console.log(`\n📊 Phase 2 Week 1 Progress:`);
    console.log(`   Working: ${workingCount}/${totalTested} (${successRate}%)`);
    
    console.log('\n✅ WORKING SUPPLEMENTS:');
    results.filter(r => r.overallWorking).forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id}) - All tabs working`);
    });
    
    console.log('\n❌ BROKEN SUPPLEMENTS:');
    results.filter(r => !r.overallWorking).forEach(supp => {
      if (supp.error) {
        console.log(`   ${supp.name} (ID: ${supp.id}) - Error: ${supp.error}`);
      } else {
        const issues = [];
        if (!supp.benefitsWorking) issues.push('Benefits');
        if (!supp.safetyWorking) issues.push('Safety');
        if (!supp.mechanismsWorking) issues.push('Mechanisms');
        console.log(`   ${supp.name} (ID: ${supp.id}) - Issues: ${issues.join(', ')}`);
      }
    });
    
    console.log('\n🎯 WEEK 1 PROGRESS ASSESSMENT:');
    console.log('   Goal: 4 supplements (PEA, Bitter Melon, Gymnema Sylvestre, Cinnamon Extract)');
    console.log(`   Completed: ${workingCount}/4 supplements`);
    console.log('   Remaining: Cinnamon Extract (ID: 66)');
    
    if (workingCount === 3) {
      console.log('\n🎉 EXCELLENT PROGRESS!');
      console.log('✅ 3/4 Week 1 supplements completed');
      console.log('✅ All Phase 2 supplements working perfectly');
      console.log('🚀 Ready to complete Cinnamon Extract to finish Week 1');
    } else if (workingCount >= 2) {
      console.log('\n🎊 GOOD PROGRESS!');
      console.log(`✅ ${workingCount}/4 Week 1 supplements completed`);
      console.log('⚠️ Some supplements may need debugging');
    } else {
      console.log('\n⚠️ PROGRESS NEEDS ATTENTION');
      console.log(`❌ Only ${workingCount}/4 Week 1 supplements working`);
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Complete Cinnamon Extract (ID: 66) to finish Week 1 goal');
    console.log('2. Run comprehensive test to measure overall success rate improvement');
    console.log('3. Begin Week 2 supplements (Forskolin, Milk Thistle, Elderberry)');
    
    return {
      totalTested,
      workingCount,
      successRate,
      results
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Phase 2 progress test complete');
  }
})();
