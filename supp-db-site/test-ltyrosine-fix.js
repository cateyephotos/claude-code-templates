const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING L-TYROSINE FIX');
  console.log('Verifying enhanced citations array format support...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Testing L-Tyrosine (ID: 33)...');
    
    // Search and open supplement
    await page.fill('#searchInput', 'L-Tyrosine');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(33);
    });
    await page.waitForTimeout(2000);
    
    // Test Benefits tab
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(500);
    
    const benefitsResult = await page.evaluate(() => {
      const container = document.getElementById('benefits-33');
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
        htmlLength: innerHTML.length
      };
    });
    
    // Test Safety tab
    const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
    await safetyTab.click();
    await page.waitForTimeout(500);
    
    const safetyResult = await page.evaluate(() => {
      const container = document.getElementById('safety-33');
      if (!container) return { error: 'Container not found' };
      
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      return {
        studyCards: studyCards.length,
        hasPMID: container.innerHTML.includes('PMID')
      };
    });
    
    // Test Mechanisms tab
    const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
    await mechanismsTab.click();
    await page.waitForTimeout(500);
    
    const mechanismsResult = await page.evaluate(() => {
      const container = document.getElementById('mechanisms-33');
      if (!container) return { error: 'Container not found' };
      
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      return {
        studyCards: studyCards.length,
        hasPMID: container.innerHTML.includes('PMID')
      };
    });
    
    const benefitsWorking = benefitsResult.studyCards > 0 && benefitsResult.hasPMID && !benefitsResult.hasUndefined;
    const safetyWorking = safetyResult.studyCards > 0 && safetyResult.hasPMID;
    const mechanismsWorking = mechanismsResult.studyCards > 0 && mechanismsResult.hasPMID;
    const overallWorking = benefitsWorking && safetyWorking && mechanismsWorking;
    
    console.log('\n📊 L-Tyrosine Test Results:');
    console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${benefitsResult.studyCards} cards, ${benefitsResult.undefinedCount} undefined)`);
    console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${safetyResult.studyCards} cards)`);
    console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${mechanismsResult.studyCards} cards)`);
    console.log(`   Overall: ${overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
    
    if (overallWorking) {
      console.log('\n🎉 L-TYROSINE FIX SUCCESSFUL!');
      console.log('   Enhanced citations array format support working correctly');
    } else {
      console.log('\n⚠️ L-TYROSINE STILL HAS ISSUES:');
      if (!benefitsWorking) {
        console.log(`     Benefits: ${benefitsResult.error || `${benefitsResult.studyCards} cards, ${benefitsResult.undefinedCount} undefined`}`);
      }
      if (!safetyWorking) {
        console.log(`     Safety: ${safetyResult.error || `${safetyResult.studyCards} cards`}`);
      }
      if (!mechanismsWorking) {
        console.log(`     Mechanisms: ${mechanismsResult.error || `${mechanismsResult.studyCards} cards`}`);
      }
    }
    
    return {
      benefitsWorking,
      safetyWorking,
      mechanismsWorking,
      overallWorking,
      benefitsResult,
      safetyResult,
      mechanismsResult
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ L-Tyrosine fix test complete');
  }
})();
