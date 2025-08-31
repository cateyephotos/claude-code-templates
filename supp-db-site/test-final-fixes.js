const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING FINAL FIXES');
  console.log('Verifying Turmeric and L-Theanine issues are resolved...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test both problematic supplements
    const testSupplements = [
      { id: 2, name: 'Turmeric/Curcumin' },
      { id: 9, name: 'L-Theanine' }
    ];
    
    const results = [];
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing ${supplement.name}...`);
      
      // Search and open supplement
      await page.fill('#searchInput', supplement.name);
      await page.waitForTimeout(1000);
      
      await page.evaluate(async (suppId) => {
        await window.app.showSupplementDetails(suppId);
      }, supplement.id);
      await page.waitForTimeout(2000);
      
      // Test all three tabs
      const tabResults = {};
      
      // Test Benefits tab
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      await benefitsTab.click();
      await page.waitForTimeout(1000);
      
      const benefitsResult = await page.evaluate((suppId) => {
        const container = document.getElementById(`benefits-${suppId}`);
        if (!container) return { error: 'Container not found' };
        
        const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
        const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
        
        return {
          totalCards: cards.length,
          studyCards: studyCards.length,
          htmlLength: container.innerHTML.length,
          hasPMID: container.innerHTML.includes('PMID'),
          hasDOI: container.innerHTML.includes('DOI'),
          hasFindings: container.innerHTML.includes('Findings'),
          hasUndefined: container.innerHTML.includes('undefined'),
          undefinedCount: (container.innerHTML.match(/undefined/g) || []).length,
          firstCardText: cards[0] ? cards[0].textContent.substring(0, 150) : ''
        };
      }, supplement.id);
      
      tabResults.benefits = benefitsResult;
      
      // Test Safety tab
      const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
      await safetyTab.click();
      await page.waitForTimeout(1000);
      
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
      
      tabResults.safety = safetyResult;
      
      // Test Mechanisms tab
      const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
      await mechanismsTab.click();
      await page.waitForTimeout(1000);
      
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
      
      tabResults.mechanisms = mechanismsResult;
      
      // Calculate working status
      const benefitsWorking = benefitsResult.totalCards > 0 && !benefitsResult.hasUndefined;
      const safetyWorking = safetyResult.totalCards > 0 && !safetyResult.hasUndefined;
      const mechanismsWorking = mechanismsResult.totalCards > 0 && !mechanismsResult.hasUndefined;
      
      const result = {
        id: supplement.id,
        name: supplement.name,
        benefitsWorking: benefitsWorking,
        safetyWorking: safetyWorking,
        mechanismsWorking: mechanismsWorking,
        overallWorking: benefitsWorking && safetyWorking && mechanismsWorking,
        tabResults: tabResults
      };
      
      results.push(result);
      
      console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${benefitsResult.totalCards} cards, ${benefitsResult.undefinedCount} undefined)`);
      console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${safetyResult.totalCards} cards)`);
      console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${mechanismsResult.totalCards} cards)`);
      console.log(`   Overall: ${result.overallWorking ? '✅ FIXED' : '❌ Still broken'}`);
      
      if (benefitsResult.firstCardText && !benefitsWorking) {
        console.log(`   First Card: ${benefitsResult.firstCardText}...`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔧 FINAL FIXES RESULTS');
    console.log('='.repeat(60));
    
    const fixedSupplements = results.filter(r => r.overallWorking);
    const stillBrokenSupplements = results.filter(r => !r.overallWorking);
    
    console.log(`\n✅ FIXED SUPPLEMENTS (${fixedSupplements.length}/${results.length}):`);
    fixedSupplements.forEach(supp => {
      console.log(`   • ${supp.name}`);
    });
    
    console.log(`\n❌ STILL BROKEN SUPPLEMENTS (${stillBrokenSupplements.length}/${results.length}):`);
    stillBrokenSupplements.forEach(supp => {
      const issues = [];
      if (!supp.benefitsWorking) issues.push('Benefits');
      if (!supp.safetyWorking) issues.push('Safety');
      if (!supp.mechanismsWorking) issues.push('Mechanisms');
      
      console.log(`   • ${supp.name} - Issues: ${issues.join(', ')}`);
      
      // Show specific issues
      if (!supp.benefitsWorking && supp.tabResults.benefits.hasUndefined) {
        console.log(`     Benefits has ${supp.tabResults.benefits.undefinedCount} undefined values`);
      }
    });
    
    if (stillBrokenSupplements.length === 0) {
      console.log(`\n🎉 ALL ISSUES RESOLVED!`);
      console.log(`   Both Turmeric and L-Theanine are now working correctly.`);
      console.log(`   Smart Citation Renderer fixes are complete.`);
    } else {
      console.log(`\n⚠️ SOME ISSUES REMAIN:`);
      console.log(`   ${stillBrokenSupplements.length} supplements still need attention.`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Final fixes test complete');
  }
})();
