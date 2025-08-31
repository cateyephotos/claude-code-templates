const { chromium } = require('playwright');

(async () => {
  console.log('🔍 COMPREHENSIVE SUCCESS RATE TEST - POST WEEK 1');
  console.log('Measuring exact success rate after Phase 2 Week 1 completion...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('\n🧪 Testing all supplements (IDs 1-89)...');
    
    const results = [];
    let workingCount = 0;
    let totalTested = 0;
    
    // Test supplements in batches
    const batchSize = 15;
    const totalSupplements = 89;
    
    for (let startId = 1; startId <= totalSupplements; startId += batchSize) {
      const endId = Math.min(startId + batchSize - 1, totalSupplements);
      console.log(`\n📦 Testing batch: IDs ${startId}-${endId}`);
      
      for (let suppId = startId; suppId <= endId; suppId++) {
        try {
          totalTested++;
          
          // Get supplement info from the page
          const supplementInfo = await page.evaluate((id) => {
            if (typeof window.supplementDatabase !== 'undefined' && 
                window.supplementDatabase.supplements) {
              const supplement = window.supplementDatabase.supplements.find(s => s.id === id);
              return supplement ? { id: supplement.id, name: supplement.name, category: supplement.category } : null;
            }
            return null;
          }, suppId);
          
          if (!supplementInfo) {
            continue;
          }
          
          // Check if enhanced citation data is loaded
          const dataCheck = await page.evaluate((id) => {
            return {
              hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
              hasSupplementData: window.enhancedCitations && window.enhancedCitations[id] !== undefined
            };
          }, suppId);
          
          if (!dataCheck.hasSupplementData) {
            results.push({
              id: suppId,
              name: supplementInfo.name,
              category: supplementInfo.category,
              overallWorking: false,
              issue: 'No enhanced citation data'
            });
            continue;
          }
          
          // Test supplement details functionality
          try {
            await page.evaluate(async (id) => {
              if (window.app && window.app.showSupplementDetails) {
                await window.app.showSupplementDetails(id);
              }
            }, suppId);
            await page.waitForTimeout(800);
            
            // Test all tabs
            const tabResults = await page.evaluate((id) => {
              const benefitsContainer = document.getElementById(`benefits-${id}`);
              const safetyContainer = document.getElementById(`safety-${id}`);
              const mechanismsContainer = document.getElementById(`mechanisms-${id}`);
              
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
            }, suppId);
            
            const benefitsWorking = tabResults.benefits.studyCards > 0 && !tabResults.benefits.hasUndefined;
            const safetyWorking = tabResults.safety.studyCards > 0;
            const mechanismsWorking = tabResults.mechanisms.studyCards > 0;
            const overallWorking = benefitsWorking && safetyWorking && mechanismsWorking;
            
            const result = {
              id: suppId,
              name: supplementInfo.name,
              category: supplementInfo.category,
              benefitsWorking: benefitsWorking,
              safetyWorking: safetyWorking,
              mechanismsWorking: mechanismsWorking,
              overallWorking: overallWorking,
              details: tabResults
            };
            
            results.push(result);
            
            if (overallWorking) {
              workingCount++;
              console.log(`   ID ${suppId}: ${supplementInfo.name} ✅`);
            } else {
              const issues = [];
              if (!benefitsWorking) issues.push('B');
              if (!safetyWorking) issues.push('S');
              if (!mechanismsWorking) issues.push('M');
              console.log(`   ID ${suppId}: ${supplementInfo.name} ❌ (${issues.join(',')})`);
            }
            
          } catch (uiError) {
            results.push({
              id: suppId,
              name: supplementInfo.name,
              category: supplementInfo.category,
              overallWorking: false,
              issue: 'UI Error: ' + uiError.message
            });
          }
          
        } catch (error) {
          console.log(`   ID ${suppId}: Error - ${error.message}`);
        }
      }
      
      // Brief pause between batches
      await page.waitForTimeout(1000);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 COMPREHENSIVE SUCCESS RATE RESULTS - POST WEEK 1');
    console.log('='.repeat(80));
    
    const successRate = Math.round((workingCount / totalTested) * 100);
    
    console.log(`\n📊 Overall Results:`);
    console.log(`   Total tested: ${totalTested}/89 supplements`);
    console.log(`   Working: ${workingCount}/${totalTested} (${successRate}%)`);
    console.log(`   Broken: ${totalTested - workingCount}/${totalTested} (${100 - successRate}%)`);
    
    // Identify Phase 2 Week 1 supplements
    const week1Supplements = [57, 63, 64, 66]; // PEA, Bitter Melon, Gymnema, Cinnamon
    const week1Results = results.filter(r => week1Supplements.includes(r.id));
    const week1Working = week1Results.filter(r => r.overallWorking).length;
    
    console.log(`\n🎯 Phase 2 Week 1 Supplements:`);
    console.log(`   Week 1 working: ${week1Working}/4 (${Math.round((week1Working/4)*100)}%)`);
    week1Results.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name} ${supp.overallWorking ? '✅' : '❌'}`);
    });
    
    // Compare to previous results
    const previousSuccessRate = 78; // From Phase 1
    const improvement = successRate - previousSuccessRate;
    
    console.log('\n📈 SUCCESS RATE COMPARISON:');
    console.log(`   Phase 1 Complete: ${previousSuccessRate}% (69/89 supplements)`);
    console.log(`   Phase 2 Week 1 Complete: ${successRate}% (${workingCount}/89 supplements)`);
    console.log(`   Improvement: +${improvement}% (+${workingCount - 69} supplements)`);
    
    // Remaining work assessment
    const remainingSupplements = totalTested - workingCount;
    const targetSuccessRate = 95;
    const targetWorking = Math.ceil((targetSuccessRate / 100) * 89);
    const supplementsNeeded = targetWorking - workingCount;
    
    console.log('\n🎯 REMAINING WORK TO REACH 95% TARGET:');
    console.log(`   Current: ${workingCount}/89 (${successRate}%)`);
    console.log(`   Target: ${targetWorking}/89 (${targetSuccessRate}%)`);
    console.log(`   Supplements needed: ${supplementsNeeded}`);
    console.log(`   Weeks remaining at current pace: ${Math.ceil(supplementsNeeded / 3)} weeks`);
    
    if (successRate >= 82) {
      console.log('\n🎉 EXCELLENT PROGRESS!');
      console.log('✅ Week 1 exceeded expectations');
      console.log('✅ On track to reach 95% target');
      console.log('🚀 Ready for Week 2: Forskolin, Milk Thistle, Elderberry');
    } else if (successRate >= 80) {
      console.log('\n🎊 GOOD PROGRESS!');
      console.log('✅ Week 1 met expectations');
      console.log('✅ Solid foundation for remaining weeks');
    } else {
      console.log('\n⚠️ PROGRESS NEEDS ATTENTION');
      console.log('❌ Week 1 below expectations');
      console.log('🔧 May need to debug existing supplements');
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Begin Week 2 supplements (Forskolin, Milk Thistle, Elderberry)');
    console.log('2. Continue systematic research and creation');
    console.log('3. Target 3-4 supplements per week');
    console.log('4. Maintain quality standards (4 benefits, 2 safety, 3 mechanisms)');
    
    return {
      totalTested,
      workingCount,
      successRate,
      improvement,
      week1Working,
      supplementsNeeded,
      results
    };
    
  } catch (error) {
    console.error('❌ Comprehensive test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive success rate test complete');
  }
})();
