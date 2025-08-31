const { chromium } = require('playwright');

(async () => {
  console.log('🔍 COMPREHENSIVE CITATION RENDERING TEST');
  console.log('Testing multiple supplements after Smart Citation Renderer fixes...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test a broader range of supplements
    const testSupplements = [
      // Working format
      { id: 15, name: 'Panax Ginseng', category: 'working' },
      { id: 13, name: 'Acetyl-L-Carnitine', category: 'working' },
      
      // Legacy format
      { id: 1, name: 'Bacopa monnieri', category: 'legacy' },
      { id: 2, name: 'Turmeric/Curcumin', category: 'legacy' },
      { id: 3, name: 'Ashwagandha', category: 'legacy' },
      { id: 4, name: 'Omega-3 Fatty Acids', category: 'legacy' },
      
      // Empty format
      { id: 37, name: 'Zinc', category: 'empty' },
      { id: 40, name: 'GABA', category: 'empty' },
      
      // Additional supplements
      { id: 7, name: 'Vitamin D3', category: 'legacy' },
      { id: 9, name: 'L-Theanine', category: 'legacy' }
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
        
        // Test Benefits tab
        const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
        await benefitsTab.click();
        await page.waitForTimeout(500);
        
        const benefitsResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          
          return {
            totalCards: cards.length,
            studyCards: studyCards.length,
            hasPMID: container.innerHTML.includes('PMID'),
            hasUndefined: container.innerHTML.includes('undefined'),
            htmlLength: container.innerHTML.length
          };
        }, supplement.id);
        
        // Test Safety tab
        const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
        await safetyTab.click();
        await page.waitForTimeout(500);
        
        const safetyResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`safety-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          
          return {
            totalCards: cards.length,
            studyCards: studyCards.length,
            hasPMID: container.innerHTML.includes('PMID'),
            hasUndefined: container.innerHTML.includes('undefined')
          };
        }, supplement.id);
        
        // Test Mechanisms tab
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        await mechanismsTab.click();
        await page.waitForTimeout(500);
        
        const mechanismsResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`mechanisms-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          
          return {
            totalCards: cards.length,
            studyCards: studyCards.length,
            hasPMID: container.innerHTML.includes('PMID'),
            hasUndefined: container.innerHTML.includes('undefined')
          };
        }, supplement.id);
        
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
          overallWorking: benefitsWorking && safetyWorking && mechanismsWorking,
          details: {
            benefits: benefitsResult,
            safety: safetyResult,
            mechanisms: mechanismsResult
          }
        };
        
        results.push(result);
        
        console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${benefitsResult.studyCards} cards)`);
        console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${safetyResult.studyCards} cards)`);
        console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${mechanismsResult.studyCards} cards)`);
        console.log(`   Overall: ${result.overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
        
      } catch (error) {
        console.log(`   ❌ Error testing ${supplement.name}: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(70));
    
    const workingSupplements = results.filter(r => r.overallWorking);
    const brokenSupplements = results.filter(r => !r.overallWorking);
    
    console.log(`\n✅ WORKING SUPPLEMENTS (${workingSupplements.length}/${results.length}):`);
    workingSupplements.forEach(supp => {
      console.log(`   • ${supp.name} (${supp.category})`);
    });
    
    console.log(`\n❌ BROKEN SUPPLEMENTS (${brokenSupplements.length}/${results.length}):`);
    brokenSupplements.forEach(supp => {
      const issues = [];
      if (!supp.benefitsWorking) issues.push('Benefits');
      if (!supp.safetyWorking) issues.push('Safety');
      if (!supp.mechanismsWorking) issues.push('Mechanisms');
      
      console.log(`   • ${supp.name} (${supp.category}) - Issues: ${issues.join(', ')}`);
      
      // Show specific undefined issues
      if (supp.details.benefits.hasUndefined) console.log(`     Benefits has undefined values`);
      if (supp.details.safety.hasUndefined) console.log(`     Safety has undefined values`);
      if (supp.details.mechanisms.hasUndefined) console.log(`     Mechanisms has undefined values`);
    });
    
    console.log('\n📋 CATEGORY ANALYSIS:');
    const categories = ['working', 'legacy', 'empty'];
    categories.forEach(category => {
      const categorySupplements = results.filter(r => r.category === category);
      const categoryWorking = categorySupplements.filter(r => r.overallWorking).length;
      const categoryBroken = categorySupplements.filter(r => !r.overallWorking).length;
      
      console.log(`\n${category.toUpperCase()} FORMAT:`);
      console.log(`   Total: ${categorySupplements.length} | Working: ${categoryWorking} | Broken: ${categoryBroken}`);
      
      if (categoryBroken > 0) {
        console.log(`   Broken: ${categorySupplements.filter(r => !r.overallWorking).map(r => r.name).join(', ')}`);
      }
    });
    
    const successRate = Math.round((workingSupplements.length / results.length) * 100);
    
    console.log(`\n🎯 OVERALL SUCCESS RATE: ${successRate}% (${workingSupplements.length}/${results.length})`);
    
    if (successRate >= 90) {
      console.log(`\n🎉 EXCELLENT! Smart Citation Renderer is working well across supplements.`);
    } else if (successRate >= 70) {
      console.log(`\n👍 GOOD! Most supplements are working, minor fixes needed.`);
    } else {
      console.log(`\n⚠️ NEEDS WORK! Significant issues remain with citation rendering.`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive citation test complete');
  }
})();
