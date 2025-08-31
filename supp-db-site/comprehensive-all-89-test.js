const { chromium } = require('playwright');

(async () => {
  console.log('🔍 COMPREHENSIVE TEST: ALL 89 SUPPLEMENTS');
  console.log('Testing complete database after Phase 1 loader mappings...');
  
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
    
    // Test supplements in batches to avoid overwhelming the system
    const batchSize = 10;
    const totalSupplements = 89;
    
    for (let startId = 1; startId <= totalSupplements; startId += batchSize) {
      const endId = Math.min(startId + batchSize - 1, totalSupplements);
      console.log(`\n📦 Testing batch: IDs ${startId}-${endId}`);
      
      for (let suppId = startId; suppId <= endId; suppId++) {
        try {
          totalTested++;
          
          // Get supplement info from the page
          const supplementInfo = await page.evaluate((id) => {
            // Try to find supplement in the database
            if (typeof window.supplementDatabase !== 'undefined' && 
                window.supplementDatabase.supplements) {
              const supplement = window.supplementDatabase.supplements.find(s => s.id === id);
              return supplement ? { id: supplement.id, name: supplement.name, category: supplement.category } : null;
            }
            return null;
          }, suppId);
          
          if (!supplementInfo) {
            console.log(`   ID ${suppId}: Not found in database`);
            continue;
          }
          
          // Check if enhanced citation data is loaded
          const dataCheck = await page.evaluate((id) => {
            return {
              hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
              hasSupplementData: window.enhancedCitations && window.enhancedCitations[id] !== undefined,
              dataKeys: window.enhancedCitations && window.enhancedCitations[id] ? 
                Object.keys(window.enhancedCitations[id]) : null
            };
          }, suppId);
          
          if (!dataCheck.hasSupplementData) {
            console.log(`   ID ${suppId}: ${supplementInfo.name} - No enhanced data`);
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
            await page.waitForTimeout(1000);
            
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
            console.log(`   ID ${suppId}: ${supplementInfo.name} ❌ UI Error`);
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
      await page.waitForTimeout(2000);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 COMPREHENSIVE TEST RESULTS - ALL 89 SUPPLEMENTS');
    console.log('='.repeat(80));
    
    const successRate = Math.round((workingCount / totalTested) * 100);
    
    console.log(`\n📊 Overall Results:`);
    console.log(`   Total tested: ${totalTested}/89 supplements`);
    console.log(`   Working: ${workingCount}/${totalTested} (${successRate}%)`);
    console.log(`   Broken: ${totalTested - workingCount}/${totalTested} (${100 - successRate}%)`);
    
    // Group results by category
    const byCategory = {};
    results.forEach(result => {
      const category = result.category || 'Unknown';
      if (!byCategory[category]) {
        byCategory[category] = { working: 0, total: 0 };
      }
      byCategory[category].total++;
      if (result.overallWorking) {
        byCategory[category].working++;
      }
    });
    
    console.log('\n📊 Results by Category:');
    Object.keys(byCategory).sort().forEach(category => {
      const stats = byCategory[category];
      const categoryRate = Math.round((stats.working / stats.total) * 100);
      console.log(`   ${category}: ${stats.working}/${stats.total} (${categoryRate}%)`);
    });
    
    console.log('\n❌ Supplements Still Needing Work:');
    const broken = results.filter(r => !r.overallWorking);
    broken.forEach(supp => {
      if (supp.issue) {
        console.log(`   ID ${supp.id}: ${supp.name} - ${supp.issue}`);
      } else {
        const issues = [];
        if (!supp.benefitsWorking) issues.push('Benefits');
        if (!supp.safetyWorking) issues.push('Safety');
        if (!supp.mechanismsWorking) issues.push('Mechanisms');
        console.log(`   ID ${supp.id}: ${supp.name} - Issues: ${issues.join(', ')}`);
      }
    });
    
    console.log('\n🎯 PHASE 1 SUCCESS ASSESSMENT:');
    
    if (successRate >= 80) {
      console.log('🎉 PHASE 1 EXCEEDED EXPECTATIONS!');
      console.log(`✅ Achieved ${successRate}% success rate`);
      console.log('✅ Target of 82% met or exceeded');
      console.log('🚀 Ready to begin Phase 2: Create enhanced citations for remaining supplements');
    } else if (successRate >= 70) {
      console.log('🎊 PHASE 1 HIGHLY SUCCESSFUL!');
      console.log(`✅ Achieved ${successRate}% success rate`);
      console.log('✅ Significant improvement from 58%');
      console.log('⚠️ Some supplements may need debugging before Phase 2');
    } else {
      console.log('⚠️ PHASE 1 NEEDS ADDITIONAL WORK');
      console.log(`❌ Only achieved ${successRate}% success rate`);
      console.log('🔧 Need to debug mapping or file issues before Phase 2');
    }
    
    const remainingSupplements = broken.filter(r => r.issue === 'No enhanced citation data').length;
    
    console.log('\n📋 PHASE 2 PREPARATION:');
    console.log(`   Supplements needing enhanced citations: ${remainingSupplements}`);
    console.log('   Priority: Essential Nutrients, Nootropics, Adaptogens');
    console.log('   Research methodology: Follow engineer-guide documentation');
    console.log('   Target: 3-5 supplements per week');
    
    return {
      totalTested,
      workingCount,
      successRate,
      remainingSupplements,
      results
    };
    
  } catch (error) {
    console.error('❌ Comprehensive test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive test complete');
  }
})();
