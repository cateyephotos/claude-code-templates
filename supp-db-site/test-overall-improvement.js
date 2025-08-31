const { chromium } = require('playwright');

(async () => {
  console.log('📊 TESTING OVERALL IMPROVEMENT AFTER STRUCTURAL FIXES');
  console.log('Quick test of key supplements to measure improvement...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test a representative sample of supplements
    const testSupplements = [
      // Previously working
      { id: 15, name: 'Panax Ginseng', category: 'baseline-working' },
      { id: 13, name: 'Acetyl-L-Carnitine', category: 'baseline-working' },
      
      // High-priority (structural issues)
      { id: 9, name: 'L-Theanine', category: 'high-priority' },
      { id: 14, name: 'Ginkgo Biloba', category: 'high-priority' },
      { id: 20, name: 'Quercetin', category: 'high-priority' },
      
      // Medium-priority (PMID issues)
      { id: 2, name: 'Turmeric/Curcumin', category: 'medium-priority' },
      { id: 5, name: 'Creatine', category: 'medium-priority' },
      { id: 11, name: 'Lion\'s Mane Mushroom', category: 'medium-priority' },
      
      // Random sample
      { id: 18, name: 'CoQ10', category: 'sample' },
      { id: 24, name: 'Green Tea Extract', category: 'sample' }
    ];
    
    const results = [];
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing ${supplement.name}...`);
      
      try {
        // Search and open supplement
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(500);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1500);
        
        // Quick test of all tabs
        const quickTest = async (tabName) => {
          const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
          await tab.click();
          await page.waitForTimeout(500);
          
          return await page.evaluate((suppId, tabName) => {
            const container = document.getElementById(`${tabName.toLowerCase()}-${suppId}`);
            if (!container) return { error: 'Container not found' };
            
            const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
            const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
            
            return {
              totalCards: cards.length,
              studyCards: studyCards.length,
              hasPMID: container.innerHTML.includes('PMID'),
              hasUndefined: container.innerHTML.includes('undefined')
            };
          }, supplement.id, tabName);
        };
        
        const benefitsResult = await quickTest('Benefits');
        const safetyResult = await quickTest('Safety');
        const mechanismsResult = await quickTest('Mechanisms');
        
        const benefitsWorking = benefitsResult.studyCards > 0 && benefitsResult.hasPMID && !benefitsResult.hasUndefined;
        const safetyWorking = safetyResult.studyCards > 0 && safetyResult.hasPMID && !safetyResult.hasUndefined;
        const mechanismsWorking = mechanismsResult.studyCards > 0 && mechanismsResult.hasPMID && !mechanismsResult.hasUndefined;
        
        const result = {
          id: supplement.id,
          name: supplement.name,
          category: supplement.category,
          benefitsWorking: benefitsWorking,
          safetyWorking: safetyWorking,
          mechanismsWorking: mechanismsWorking,
          overallWorking: benefitsWorking && safetyWorking && mechanismsWorking
        };
        
        results.push(result);
        
        console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} | Safety: ${safetyWorking ? '✅' : '❌'} | Mechanisms: ${mechanismsWorking ? '✅' : '❌'} | Overall: ${result.overallWorking ? '✅' : '❌'}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 OVERALL IMPROVEMENT ANALYSIS');
    console.log('='.repeat(70));
    
    const workingSupplements = results.filter(r => r.overallWorking);
    const brokenSupplements = results.filter(r => !r.overallWorking);
    
    console.log(`\nCurrent Success Rate: ${Math.round((workingSupplements.length / results.length) * 100)}% (${workingSupplements.length}/${results.length})`);
    
    // Analyze by category
    const categories = ['baseline-working', 'high-priority', 'medium-priority', 'sample'];
    categories.forEach(category => {
      const categorySupplements = results.filter(r => r.category === category);
      const categoryWorking = categorySupplements.filter(r => r.overallWorking).length;
      const categoryRate = categorySupplements.length > 0 ? Math.round((categoryWorking / categorySupplements.length) * 100) : 0;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`   Success Rate: ${categoryRate}% (${categoryWorking}/${categorySupplements.length})`);
      
      categorySupplements.forEach(supp => {
        console.log(`   ${supp.overallWorking ? '✅' : '❌'} ${supp.name}`);
      });
    });
    
    console.log(`\n🎯 PROGRESS ASSESSMENT:`);
    
    const highPriorityWorking = results.filter(r => r.category === 'high-priority' && r.overallWorking).length;
    const highPriorityTotal = results.filter(r => r.category === 'high-priority').length;
    
    console.log(`High-Priority Fixes: ${highPriorityWorking}/${highPriorityTotal} working`);
    
    if (highPriorityWorking === highPriorityTotal) {
      console.log(`✅ All high-priority structural issues resolved!`);
    } else {
      console.log(`⚠️ ${highPriorityTotal - highPriorityWorking} high-priority supplements still need work`);
    }
    
    const mediumPriorityWorking = results.filter(r => r.category === 'medium-priority' && r.overallWorking).length;
    const mediumPriorityTotal = results.filter(r => r.category === 'medium-priority').length;
    
    console.log(`Medium-Priority Status: ${mediumPriorityWorking}/${mediumPriorityTotal} working`);
    
    console.log(`\n🚀 NEXT STEPS:`);
    if (highPriorityWorking < highPriorityTotal) {
      console.log(`1. Continue fixing remaining ${highPriorityTotal - highPriorityWorking} high-priority supplements`);
    }
    console.log(`2. Address medium-priority supplements (${mediumPriorityTotal - mediumPriorityWorking} remaining)`);
    console.log(`3. Run full audit to measure overall improvement`);
    console.log(`4. Target >95% success rate across all supplements`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Overall improvement test complete');
  }
})();
