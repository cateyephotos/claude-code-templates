const { chromium } = require('playwright');

(async () => {
  console.log('🚀 TESTING PHASE 1: NEWLY ADDED LOADER MAPPINGS');
  console.log('Testing sample of 21 newly mapped supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test a representative sample of the newly mapped supplements
    const testSupplements = [
      { id: 2, name: 'Turmeric', category: 'Anti-inflammatory' },
      { id: 3, name: 'Ashwagandha', category: 'Adaptogen' },
      { id: 4, name: 'Omega-3 Fatty Acids', category: 'Essential Fatty Acid' },
      { id: 9, name: 'L-Theanine', category: 'Amino Acid' },
      { id: 11, name: 'Lion\'s Mane Mushroom', category: 'Nootropic' },
      { id: 14, name: 'Ginkgo Biloba', category: 'Herbal Extract' },
      { id: 17, name: 'Berberine', category: 'Plant Alkaloid' },
      { id: 18, name: 'CoQ10', category: 'Antioxidant' },
      { id: 20, name: 'Quercetin', category: 'Flavonoid' },
      { id: 24, name: 'Green Tea Extract', category: 'Polyphenol' }
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
            category: supplement.category,
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
          category: supplement.category,
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
          category: supplement.category,
          overallWorking: false,
          error: error.message
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 PHASE 1 LOADER MAPPINGS TEST RESULTS');
    console.log('='.repeat(80));
    
    const totalTested = results.length;
    const sampleSuccessRate = Math.round((workingCount / totalTested) * 100);
    
    console.log(`\n📊 Sample Test Results (${totalTested} supplements):`);
    console.log(`   Working: ${workingCount}/${totalTested} (${sampleSuccessRate}%)`);
    
    console.log('\n✅ WORKING SUPPLEMENTS:');
    results.filter(r => r.overallWorking).forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
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
    
    console.log('\n🎯 PHASE 1 SUCCESS RATE PROJECTION:');
    
    const previousWorking = 52; // From comprehensive audit
    const estimatedNewWorking = Math.round((sampleSuccessRate / 100) * 21); // 21 newly mapped supplements
    const projectedTotalWorking = previousWorking + estimatedNewWorking;
    const totalSupplements = 89;
    const projectedSuccessRate = Math.round((projectedTotalWorking / totalSupplements) * 100);
    
    console.log(`   Previous working: ${previousWorking}/89 (58%)`);
    console.log(`   Sample success rate: ${sampleSuccessRate}%`);
    console.log(`   Estimated new working: +${estimatedNewWorking} supplements`);
    console.log(`   Projected total working: ${projectedTotalWorking}/89 (${projectedSuccessRate}%)`);
    
    if (sampleSuccessRate >= 80) {
      console.log('\n🎉 PHASE 1 HIGHLY SUCCESSFUL!');
      console.log('✅ Most newly mapped supplements are working');
      console.log(`✅ Projected success rate: ${projectedSuccessRate}%`);
      console.log('🚀 Ready to proceed with comprehensive test');
    } else if (sampleSuccessRate >= 60) {
      console.log('\n🎊 PHASE 1 MODERATELY SUCCESSFUL!');
      console.log(`✅ ${workingCount}/${totalTested} sample supplements working`);
      console.log(`✅ Projected success rate: ${projectedSuccessRate}%`);
      console.log('⚠️ Some supplements may need debugging');
    } else {
      console.log('\n⚠️ PHASE 1 NEEDS DEBUGGING');
      console.log(`❌ Only ${workingCount}/${totalTested} sample supplements working`);
      console.log('🔧 Need to investigate mapping or file issues');
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Run comprehensive test on all 89 supplements');
    console.log('2. Verify actual success rate improvement');
    console.log('3. Debug any remaining mapping issues');
    console.log('4. Begin Phase 2: Create enhanced citations for 16 missing supplements');
    
    return {
      totalTested,
      workingCount,
      sampleSuccessRate,
      projectedTotalWorking,
      projectedSuccessRate,
      results
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Phase 1 mapping test complete');
  }
})();
