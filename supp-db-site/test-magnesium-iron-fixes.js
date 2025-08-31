const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING MAGNESIUM AND IRON FIXES');
  console.log('Verifying fixes for structural issues...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test both supplements
    const supplements = [
      { id: 6, name: 'Magnesium', issue: 'Missing claim fields' },
      { id: 8, name: 'Iron', issue: 'Wrong data structure' }
    ];
    
    const results = [];
    
    for (const supplement of supplements) {
      console.log(`\n🔍 Testing ${supplement.name} (${supplement.issue})...`);
      
      try {
        // Search and open supplement
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(500);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1500);
        
        // Test all three tabs
        const tabResults = {};
        
        // Benefits tab
        const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
        await benefitsTab.click();
        await page.waitForTimeout(500);
        
        const benefitsResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          const innerHTML = container.innerHTML;
          
          return {
            totalCards: cards.length,
            studyCards: studyCards.length,
            hasPMID: innerHTML.includes('PMID'),
            hasUndefined: innerHTML.includes('undefined'),
            undefinedCount: (innerHTML.match(/undefined/g) || []).length,
            htmlLength: innerHTML.length,
            cardTitles: cards.map(card => {
              const titleElement = card.querySelector('h5');
              return titleElement ? titleElement.textContent.trim() : 'No title';
            })
          };
        }, supplement.id);
        
        // Safety tab
        const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
        await safetyTab.click();
        await page.waitForTimeout(500);
        
        const safetyResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`safety-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          return {
            studyCards: studyCards.length,
            hasPMID: container.innerHTML.includes('PMID')
          };
        }, supplement.id);
        
        // Mechanisms tab
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        await mechanismsTab.click();
        await page.waitForTimeout(500);
        
        const mechanismsResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`mechanisms-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          return {
            studyCards: studyCards.length,
            hasPMID: container.innerHTML.includes('PMID')
          };
        }, supplement.id);
        
        const benefitsWorking = benefitsResult.studyCards > 0 && benefitsResult.hasPMID && !benefitsResult.hasUndefined;
        const safetyWorking = safetyResult.studyCards > 0 && safetyResult.hasPMID;
        const mechanismsWorking = mechanismsResult.studyCards > 0 && mechanismsResult.hasPMID;
        
        const result = {
          id: supplement.id,
          name: supplement.name,
          issue: supplement.issue,
          benefitsWorking: benefitsWorking,
          safetyWorking: safetyWorking,
          mechanismsWorking: mechanismsWorking,
          overallWorking: benefitsWorking && safetyWorking && mechanismsWorking,
          benefitsDetails: benefitsResult
        };
        
        results.push(result);
        
        console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${benefitsResult.studyCards} cards, ${benefitsResult.undefinedCount} undefined)`);
        console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${safetyResult.studyCards} cards)`);
        console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${mechanismsResult.studyCards} cards)`);
        console.log(`   Overall: ${result.overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
        
        if (benefitsResult.cardTitles.length > 0) {
          console.log(`   Card Titles: ${benefitsResult.cardTitles.slice(0, 3).join(', ')}${benefitsResult.cardTitles.length > 3 ? '...' : ''}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔧 MAGNESIUM AND IRON FIX RESULTS');
    console.log('='.repeat(60));
    
    const workingCount = results.filter(r => r.overallWorking).length;
    const fixedCount = results.filter(r => r.overallWorking).length;
    
    console.log(`\n📊 Fix Results:`);
    console.log(`   Working: ${workingCount}/${results.length} supplements`);
    console.log(`   Fixed: ${fixedCount}/${results.length} supplements`);
    
    results.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`   Status: ${result.overallWorking ? '✅ COMPLETELY FIXED' : '❌ STILL BROKEN'}`);
      console.log(`   Issue: ${result.issue}`);
      
      if (!result.overallWorking) {
        const issues = [];
        if (!result.benefitsWorking) issues.push('Benefits');
        if (!result.safetyWorking) issues.push('Safety');
        if (!result.mechanismsWorking) issues.push('Mechanisms');
        console.log(`   Remaining Problems: ${issues.join(', ')}`);
      }
    });
    
    if (workingCount === results.length) {
      console.log(`\n🎉 ALL STRUCTURAL ISSUES FIXED!`);
      console.log(`   Both Magnesium and Iron now working properly.`);
    } else {
      console.log(`\n⚠️ PARTIAL SUCCESS:`);
      console.log(`   ${workingCount}/${results.length} supplements fixed.`);
      console.log(`   Continue with remaining structural issues.`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Magnesium and Iron fix test complete');
  }
})();
