const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING L-THEANINE DATA FIX');
  console.log('Verifying L-Theanine data structure fixes...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test L-Theanine specifically
    console.log('\n🔍 Testing L-Theanine (ID: 9)...');
    
    await page.fill('#searchInput', 'L-Theanine');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(9);
    });
    await page.waitForTimeout(2000);
    
    // Test Benefits tab
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(1000);
    
    const benefitsResult = await page.evaluate(() => {
      const container = document.getElementById('benefits-9');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      
      return {
        totalCards: cards.length,
        studyCards: studyCards.length,
        hasPMID: container.innerHTML.includes('PMID'),
        hasUndefined: container.innerHTML.includes('undefined'),
        firstCardText: cards[0] ? cards[0].textContent.substring(0, 150) : ''
      };
    });
    
    console.log('\n📊 Benefits Tab Results:');
    console.log(`   Total Cards: ${benefitsResult.totalCards}`);
    console.log(`   Study Cards: ${benefitsResult.studyCards}`);
    console.log(`   Has PMID: ${benefitsResult.hasPMID ? '✅' : '❌'}`);
    console.log(`   Has Undefined: ${benefitsResult.hasUndefined ? '❌' : '✅'}`);
    
    if (benefitsResult.firstCardText) {
      console.log(`   First Card: ${benefitsResult.firstCardText}...`);
    }
    
    // Test Safety tab
    const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
    await safetyTab.click();
    await page.waitForTimeout(1000);
    
    const safetyResult = await page.evaluate(() => {
      const container = document.getElementById('safety-9');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      
      return {
        totalCards: cards.length,
        studyCards: studyCards.length,
        hasPMID: container.innerHTML.includes('PMID'),
        hasUndefined: container.innerHTML.includes('undefined')
      };
    });
    
    console.log('\n🛡️ Safety Tab Results:');
    console.log(`   Total Cards: ${safetyResult.totalCards}`);
    console.log(`   Study Cards: ${safetyResult.studyCards}`);
    console.log(`   Has PMID: ${safetyResult.hasPMID ? '✅' : '❌'}`);
    console.log(`   Has Undefined: ${safetyResult.hasUndefined ? '❌' : '✅'}`);
    
    // Test Mechanisms tab
    const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
    await mechanismsTab.click();
    await page.waitForTimeout(1000);
    
    const mechanismsResult = await page.evaluate(() => {
      const container = document.getElementById('mechanisms-9');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      
      return {
        totalCards: cards.length,
        studyCards: studyCards.length,
        hasPMID: container.innerHTML.includes('PMID'),
        hasUndefined: container.innerHTML.includes('undefined')
      };
    });
    
    console.log('\n⚙️ Mechanisms Tab Results:');
    console.log(`   Total Cards: ${mechanismsResult.totalCards}`);
    console.log(`   Study Cards: ${mechanismsResult.studyCards}`);
    console.log(`   Has PMID: ${mechanismsResult.hasPMID ? '✅' : '❌'}`);
    console.log(`   Has Undefined: ${mechanismsResult.hasUndefined ? '❌' : '✅'}`);
    
    // Calculate working status
    const benefitsWorking = benefitsResult.studyCards > 0 && benefitsResult.hasPMID && !benefitsResult.hasUndefined;
    const safetyWorking = safetyResult.studyCards > 0 && safetyResult.hasPMID && !safetyResult.hasUndefined;
    const mechanismsWorking = mechanismsResult.studyCards > 0 && mechanismsResult.hasPMID && !mechanismsResult.hasUndefined;
    
    console.log('\n' + '='.repeat(50));
    console.log('🔧 L-THEANINE FIX RESULTS');
    console.log('='.repeat(50));
    
    console.log(`\n📊 Tab Status:`);
    console.log(`   Benefits: ${benefitsWorking ? '✅ WORKING' : '❌ Still broken'}`);
    console.log(`   Safety: ${safetyWorking ? '✅ WORKING' : '❌ Still broken'}`);
    console.log(`   Mechanisms: ${mechanismsWorking ? '✅ WORKING' : '❌ Still broken'}`);
    
    const overallWorking = benefitsWorking && safetyWorking && mechanismsWorking;
    
    if (overallWorking) {
      console.log(`\n🎉 L-THEANINE COMPLETELY FIXED!`);
      console.log(`   All tabs now show detailed citations with PMIDs.`);
    } else {
      console.log(`\n⚠️ PARTIAL FIX:`);
      console.log(`   Some tabs still have issues.`);
    }
    
    return {
      benefitsWorking,
      safetyWorking,
      mechanismsWorking,
      overallWorking
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ L-Theanine fix test complete');
  }
})();
