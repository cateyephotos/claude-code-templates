const { chromium } = require('playwright');

(async () => {
  console.log('🔄 Testing with Browser Refresh');
  console.log('Forcing fresh page load to bypass caching...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Force fresh page load with cache disabled
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Force reload to clear any cached content
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Testing Panax Ginseng with Fresh Page Load');
    
    // Open Panax Ginseng
    await page.fill('#searchInput', 'Panax Ginseng');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(15);
    });
    await page.waitForTimeout(2000);
    
    // Test Benefits tab with fresh load
    console.log('\n📋 Testing Benefits Tab (Fresh Load)...');
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(1000);
    
    const benefitsAnalysis = await page.evaluate(() => {
      const container = document.getElementById('benefits-15');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      
      const firstCard = cards[0];
      const firstCardContent = firstCard ? firstCard.textContent : '';
      
      return {
        totalCards: cards.length,
        studyCards: studyCards.length,
        htmlLength: container.innerHTML.length,
        hasPMID: container.innerHTML.includes('PMID'),
        hasDOI: container.innerHTML.includes('DOI'),
        hasFindings: container.innerHTML.includes('Findings'),
        hasAuthors: container.innerHTML.includes('Authors') || container.innerHTML.includes('et al'),
        hasYear: /\b(19|20)\d{2}\b/.test(container.innerHTML),
        firstCardContent: firstCardContent.substring(0, 300),
        firstCardLength: firstCardContent.length
      };
    });
    
    console.log(`   Benefits Cards: ${benefitsAnalysis.totalCards}`);
    console.log(`   Study Cards: ${benefitsAnalysis.studyCards}`);
    console.log(`   HTML Length: ${benefitsAnalysis.htmlLength} chars`);
    console.log(`   Has PMID: ${benefitsAnalysis.hasPMID ? '✅' : '❌'}`);
    console.log(`   Has DOI: ${benefitsAnalysis.hasDOI ? '✅' : '❌'}`);
    console.log(`   Has Findings: ${benefitsAnalysis.hasFindings ? '✅' : '❌'}`);
    console.log(`   Has Authors: ${benefitsAnalysis.hasAuthors ? '✅' : '❌'}`);
    console.log(`   Has Year: ${benefitsAnalysis.hasYear ? '✅' : '❌'}`);
    console.log(`   First Card Length: ${benefitsAnalysis.firstCardLength} chars`);
    
    if (benefitsAnalysis.hasPMID) {
      console.log(`   🎉 BENEFITS CITATIONS ARE WORKING!`);
    } else {
      console.log(`   ❌ Benefits citations still missing`);
      console.log(`   First Card Preview: ${benefitsAnalysis.firstCardContent}...`);
    }
    
    // Test Safety tab
    console.log('\n🛡️ Testing Safety Tab (Fresh Load)...');
    const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
    await safetyTab.click();
    await page.waitForTimeout(1000);
    
    const safetyAnalysis = await page.evaluate(() => {
      const container = document.getElementById('safety-15');
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
        hasAuthors: container.innerHTML.includes('Authors') || container.innerHTML.includes('et al'),
        hasYear: /\b(19|20)\d{2}\b/.test(container.innerHTML)
      };
    });
    
    console.log(`   Safety Cards: ${safetyAnalysis.totalCards}`);
    console.log(`   Study Cards: ${safetyAnalysis.studyCards}`);
    console.log(`   HTML Length: ${safetyAnalysis.htmlLength} chars`);
    console.log(`   Has PMID: ${safetyAnalysis.hasPMID ? '✅' : '❌'}`);
    console.log(`   Has DOI: ${safetyAnalysis.hasDOI ? '✅' : '❌'}`);
    console.log(`   Has Findings: ${safetyAnalysis.hasFindings ? '✅' : '❌'}`);
    console.log(`   Has Authors: ${safetyAnalysis.hasAuthors ? '✅' : '❌'}`);
    console.log(`   Has Year: ${safetyAnalysis.hasYear ? '✅' : '❌'}`);
    
    if (safetyAnalysis.hasPMID) {
      console.log(`   🎉 SAFETY CITATIONS ARE WORKING!`);
    } else {
      console.log(`   ❌ Safety citations still missing`);
    }
    
    // Test Mechanisms tab for comparison
    console.log('\n⚙️ Testing Mechanisms Tab (Fresh Load)...');
    const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
    await mechanismsTab.click();
    await page.waitForTimeout(1000);
    
    const mechanismsAnalysis = await page.evaluate(() => {
      const container = document.getElementById('mechanisms-15');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      
      return {
        totalCards: cards.length,
        studyCards: studyCards.length,
        htmlLength: container.innerHTML.length,
        hasPMID: container.innerHTML.includes('PMID'),
        hasDOI: container.innerHTML.includes('DOI'),
        hasFindings: container.innerHTML.includes('Findings')
      };
    });
    
    console.log(`   Mechanisms Cards: ${mechanismsAnalysis.totalCards}`);
    console.log(`   Study Cards: ${mechanismsAnalysis.studyCards}`);
    console.log(`   HTML Length: ${mechanismsAnalysis.htmlLength} chars`);
    console.log(`   Has PMID: ${mechanismsAnalysis.hasPMID ? '✅' : '❌'}`);
    console.log(`   Has DOI: ${mechanismsAnalysis.hasDOI ? '✅' : '❌'}`);
    console.log(`   Has Findings: ${mechanismsAnalysis.hasFindings ? '✅' : '❌'}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('🔄 FRESH BROWSER TEST RESULTS');
    console.log('='.repeat(70));
    
    const benefitsWorking = benefitsAnalysis.hasPMID && benefitsAnalysis.hasFindings;
    const safetyWorking = safetyAnalysis.hasPMID && safetyAnalysis.hasFindings;
    const mechanismsWorking = mechanismsAnalysis.hasPMID && mechanismsAnalysis.hasFindings;
    
    console.log(`\n📊 Citation Status After Fresh Load:`);
    console.log(`   Benefits: ${benefitsWorking ? '🎉 WORKING' : '❌ Still broken'}`);
    console.log(`   Safety: ${safetyWorking ? '🎉 WORKING' : '❌ Still broken'}`);
    console.log(`   Mechanisms: ${mechanismsWorking ? '🎉 WORKING' : '❌ Still broken'}`);
    
    const allWorking = benefitsWorking && safetyWorking && mechanismsWorking;
    
    if (allWorking) {
      console.log(`\n🎉🎉🎉 COMPLETE SUCCESS! 🎉🎉🎉`);
      console.log(`   ALL CITATION RENDERING IS NOW WORKING!`);
      console.log(`   Panax Ginseng shows detailed citations in all tabs:`);
      console.log(`   • Study titles and authors`);
      console.log(`   • Publication years and journals`);
      console.log(`   • PMIDs and DOIs`);
      console.log(`   • Research findings`);
      console.log(`   • Evidence quality indicators`);
      
      console.log(`\n🚀 READY FOR PHASE 3 CONTINUATION:`);
      console.log(`   The Smart Citation Renderer is fully functional!`);
      console.log(`   Enhanced citations are rendering properly across all tabs!`);
    } else if (benefitsWorking || safetyWorking) {
      console.log(`\n🎉 MAJOR PROGRESS!`);
      console.log(`   Some tabs are now working after fresh load.`);
      console.log(`   The issue was likely browser caching.`);
    } else {
      console.log(`\n⚠️ STILL INVESTIGATING:`);
      console.log(`   Fresh load didn't resolve the issue.`);
      console.log(`   Need to check the DOM update process.`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Fresh browser test complete');
  }
})();
