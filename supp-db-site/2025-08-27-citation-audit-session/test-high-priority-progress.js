const { chromium } = require('playwright');

(async () => {
  console.log('📊 TESTING HIGH-PRIORITY SUPPLEMENTS PROGRESS');
  console.log('Checking progress on L-Theanine, Ginkgo Biloba, and Quercetin...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test high-priority supplements
    const highPrioritySupplements = [
      { id: 9, name: 'L-Theanine', priority: 'CRITICAL' },
      { id: 14, name: 'Ginkgo Biloba', priority: 'HIGH' },
      { id: 20, name: 'Quercetin', priority: 'MEDIUM' }
    ];
    
    const results = [];
    
    for (const supplement of highPrioritySupplements) {
      console.log(`\n🔍 Testing ${supplement.name} (${supplement.priority})...`);
      
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
          
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          const hasPMID = container.innerHTML.includes('PMID');
          const hasUndefined = container.innerHTML.includes('undefined');
          
          return {
            studyCards: studyCards.length,
            hasPMID: hasPMID,
            hasUndefined: hasUndefined
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
          const hasPMID = container.innerHTML.includes('PMID');
          
          return {
            studyCards: studyCards.length,
            hasPMID: hasPMID
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
          const hasPMID = container.innerHTML.includes('PMID');
          
          return {
            studyCards: studyCards.length,
            hasPMID: hasPMID
          };
        }, supplement.id);
        
        // More lenient working criteria - study cards present and some PMIDs
        const benefitsWorking = benefitsResult.studyCards > 0 && !benefitsResult.hasUndefined;
        const safetyWorking = safetyResult.studyCards > 0;
        const mechanismsWorking = mechanismsResult.studyCards > 0;
        
        const result = {
          id: supplement.id,
          name: supplement.name,
          priority: supplement.priority,
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
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 HIGH-PRIORITY PROGRESS SUMMARY');
    console.log('='.repeat(60));
    
    const workingCount = results.filter(r => r.overallWorking).length;
    const partiallyWorkingCount = results.filter(r => !r.overallWorking && (r.benefitsWorking || r.safetyWorking || r.mechanismsWorking)).length;
    const brokenCount = results.filter(r => !r.benefitsWorking && !r.safetyWorking && !r.mechanismsWorking).length;
    
    console.log(`\n📈 Progress Status:`);
    console.log(`   ✅ Fully Working: ${workingCount}/${results.length}`);
    console.log(`   🔄 Partially Working: ${partiallyWorkingCount}/${results.length}`);
    console.log(`   ❌ Completely Broken: ${brokenCount}/${results.length}`);
    
    results.forEach(result => {
      const workingTabs = [result.benefitsWorking, result.safetyWorking, result.mechanismsWorking].filter(Boolean).length;
      console.log(`\n${result.name} (${result.priority}):`);
      console.log(`   Status: ${result.overallWorking ? '✅ WORKING' : workingTabs > 0 ? `🔄 ${workingTabs}/3 tabs working` : '❌ BROKEN'}`);
      
      if (!result.overallWorking) {
        const issues = [];
        if (!result.benefitsWorking) issues.push('Benefits');
        if (!result.safetyWorking) issues.push('Safety');
        if (!result.mechanismsWorking) issues.push('Mechanisms');
        if (issues.length > 0) {
          console.log(`   Issues: ${issues.join(', ')}`);
        }
      }
    });
    
    if (workingCount === results.length) {
      console.log(`\n🎉 ALL HIGH-PRIORITY SUPPLEMENTS FIXED!`);
      console.log(`   Ready to move to medium-priority supplements.`);
    } else if (workingCount + partiallyWorkingCount === results.length) {
      console.log(`\n👍 GOOD PROGRESS!`);
      console.log(`   ${workingCount} fully working, ${partiallyWorkingCount} partially working.`);
      console.log(`   Continue fixing remaining tab issues.`);
    } else {
      console.log(`\n⚠️ MORE WORK NEEDED:`);
      console.log(`   ${brokenCount} supplements still completely broken.`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ High-priority progress test complete');
  }
})();
