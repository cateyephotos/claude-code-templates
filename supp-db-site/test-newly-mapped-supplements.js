const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING NEWLY MAPPED SUPPLEMENTS');
  console.log('Verifying the 5 supplements with new loader mappings...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const testSupplements = [
      { id: 58, name: 'MCT Oil', status: 'Newly mapped' },
      { id: 60, name: 'Red Yeast Rice', status: 'Newly mapped' },
      { id: 65, name: 'Fenugreek', status: 'Newly mapped' },
      { id: 69, name: 'Mucuna Pruriens', status: 'Newly mapped' },
      { id: 73, name: 'Stinging Nettle', status: 'Newly mapped' }
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
        
        // Search and open supplement
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(500);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1500);
        
        // Test all tabs with flexible selectors
        const tabResults = await page.evaluate((suppId) => {
          const benefitsContainer = document.getElementById(`benefits-${suppId}`);
          const safetyContainer = document.getElementById(`safety-${suppId}`);
          const mechanismsContainer = document.getElementById(`mechanisms-${suppId}`);
          
          const getBenefitsData = () => {
            if (!benefitsContainer) return { studyCards: 0, hasUndefined: true };
            // Try multiple selectors
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
    console.log('🏆 NEWLY MAPPED SUPPLEMENTS TEST RESULTS');
    console.log('='.repeat(70));
    
    const totalTested = results.length;
    const successRate = Math.round((workingCount / totalTested) * 100);
    
    console.log(`\n📊 Newly Mapped Supplements Results:`);
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
    
    console.log('\n🎯 SUCCESS RATE IMPACT:');
    
    const previousWorking = 55; // From our last comprehensive test
    const newTotalWorking = previousWorking + workingCount;
    const totalSupplements = 89;
    const newSuccessRate = Math.round((newTotalWorking / totalSupplements) * 100);
    
    console.log(`   Previous working: ${previousWorking}/89 (62%)`);
    console.log(`   New working supplements: +${workingCount}`);
    console.log(`   Updated total working: ${newTotalWorking}/89 (${newSuccessRate}%)`);
    console.log(`   Improvement: +${Math.round((workingCount / totalSupplements) * 100)}%`);
    
    if (workingCount === 5) {
      console.log('\n🎉 ALL 5 NEWLY MAPPED SUPPLEMENTS WORKING!');
      console.log('✅ Loader mappings successfully added');
      console.log(`✅ Success rate improved to ${newSuccessRate}%`);
    } else if (workingCount >= 3) {
      console.log('\n🎊 MOST NEWLY MAPPED SUPPLEMENTS WORKING!');
      console.log(`✅ ${workingCount}/5 supplements now working`);
      console.log(`✅ Success rate improved to ${newSuccessRate}%`);
    } else {
      console.log('\n⚠️ SOME NEWLY MAPPED SUPPLEMENTS NEED DEBUGGING');
      console.log(`❌ Only ${workingCount}/5 supplements working`);
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Run comprehensive test to verify overall success rate');
    console.log('2. Identify remaining supplements without citation files');
    console.log('3. Create enhanced citations for missing supplements');
    console.log('4. Target: 100% enhanced citations for all 89 supplements');
    
    return {
      totalTested,
      workingCount,
      successRate,
      newTotalWorking,
      newSuccessRate,
      results
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Newly mapped supplements test complete');
  }
})();
