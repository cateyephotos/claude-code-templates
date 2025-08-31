const { chromium } = require('playwright');

(async () => {
  console.log('🔍 TESTING BROADER SAMPLE OF SUPPLEMENTS');
  console.log('Testing 15 supplements to identify patterns...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test a broader sample including known working and broken ones
    const supplements = [
      { id: 1, name: 'Bacopa Monnieri', expected: 'working' },
      { id: 2, name: 'Turmeric', expected: 'working' },
      { id: 3, name: 'Omega-3', expected: 'unknown' },
      { id: 4, name: 'Vitamin D', expected: 'unknown' },
      { id: 5, name: 'Creatine', expected: 'working' },
      { id: 6, name: 'Magnesium', expected: 'broken' },
      { id: 7, name: 'Zinc', expected: 'unknown' },
      { id: 8, name: 'Iron', expected: 'broken' },
      { id: 9, name: 'L-Theanine', expected: 'working' },
      { id: 10, name: 'Caffeine', expected: 'working' },
      { id: 11, name: 'Melatonin', expected: 'unknown' },
      { id: 12, name: 'Ashwagandha', expected: 'unknown' },
      { id: 13, name: 'Acetyl-L-Carnitine', expected: 'unknown' },
      { id: 14, name: 'Ginkgo Biloba', expected: 'working' },
      { id: 15, name: 'Panax Ginseng', expected: 'unknown' }
    ];
    
    const results = [];
    
    for (const supplement of supplements) {
      console.log(`\n🔍 Testing ${supplement.name} (ID: ${supplement.id})...`);
      
      try {
        // Search and open supplement
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(300);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1000);
        
        // Test Benefits tab quickly
        const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
        await benefitsTab.click();
        await page.waitForTimeout(300);
        
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
        
        // Test Safety tab
        const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
        await safetyTab.click();
        await page.waitForTimeout(300);
        
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
        
        // Test Mechanisms tab
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        await mechanismsTab.click();
        await page.waitForTimeout(300);
        
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
        
        const benefitsWorking = benefitsResult.studyCards > 0 && !benefitsResult.hasUndefined;
        const safetyWorking = safetyResult.studyCards > 0;
        const mechanismsWorking = mechanismsResult.studyCards > 0;
        const overallWorking = benefitsWorking && safetyWorking && mechanismsWorking;
        
        const result = {
          id: supplement.id,
          name: supplement.name,
          expected: supplement.expected,
          benefitsWorking: benefitsWorking,
          safetyWorking: safetyWorking,
          mechanismsWorking: mechanismsWorking,
          overallWorking: overallWorking,
          details: {
            benefits: benefitsResult,
            safety: safetyResult,
            mechanisms: mechanismsResult
          }
        };
        
        results.push(result);
        
        const status = overallWorking ? '✅' : '❌';
        const workingTabs = [benefitsWorking, safetyWorking, mechanismsWorking].filter(Boolean).length;
        console.log(`   ${status} ${workingTabs}/3 tabs working (B:${benefitsResult.studyCards} S:${safetyResult.studyCards} M:${mechanismsResult.studyCards})`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({
          id: supplement.id,
          name: supplement.name,
          expected: supplement.expected,
          overallWorking: false,
          error: error.message
        });
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 BROADER SAMPLE RESULTS');
    console.log('='.repeat(70));
    
    const workingCount = results.filter(r => r.overallWorking).length;
    const brokenCount = results.filter(r => !r.overallWorking).length;
    const partialCount = results.filter(r => !r.overallWorking && !r.error && 
      (r.benefitsWorking || r.safetyWorking || r.mechanismsWorking)).length;
    
    console.log(`\n📈 Overall Status:`);
    console.log(`   Working: ${workingCount}/${results.length} (${Math.round(workingCount/results.length*100)}%)`);
    console.log(`   Partially Working: ${partialCount}/${results.length}`);
    console.log(`   Completely Broken: ${brokenCount - partialCount}/${results.length}`);
    
    console.log('\n✅ WORKING SUPPLEMENTS:');
    results.filter(r => r.overallWorking).forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id}) - All tabs working`);
    });
    
    console.log('\n🔄 PARTIALLY WORKING SUPPLEMENTS:');
    results.filter(r => !r.overallWorking && !r.error && 
      (r.benefitsWorking || r.safetyWorking || r.mechanismsWorking)).forEach(supp => {
      const workingTabs = [];
      const brokenTabs = [];
      if (supp.benefitsWorking) workingTabs.push('Benefits'); else brokenTabs.push('Benefits');
      if (supp.safetyWorking) workingTabs.push('Safety'); else brokenTabs.push('Safety');
      if (supp.mechanismsWorking) workingTabs.push('Mechanisms'); else brokenTabs.push('Mechanisms');
      console.log(`   ${supp.name} (ID: ${supp.id}) - Working: ${workingTabs.join(', ')} | Broken: ${brokenTabs.join(', ')}`);
    });
    
    console.log('\n❌ COMPLETELY BROKEN SUPPLEMENTS:');
    results.filter(r => !r.overallWorking && (!r.benefitsWorking && !r.safetyWorking && !r.mechanismsWorking)).forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id}) - All tabs broken`);
    });
    
    console.log('\n🎯 PRIORITY FIXES NEEDED:');
    const completelyBroken = results.filter(r => !r.overallWorking && (!r.benefitsWorking && !r.safetyWorking && !r.mechanismsWorking));
    const partiallyBroken = results.filter(r => !r.overallWorking && !r.error && 
      (r.benefitsWorking || r.safetyWorking || r.mechanismsWorking));
    
    console.log(`1. Fix ${completelyBroken.length} completely broken supplements (structural issues)`);
    console.log(`2. Fix ${partiallyBroken.length} partially working supplements (specific tab issues)`);
    console.log(`3. Target: Get to >95% success rate (${Math.ceil(results.length * 0.95)} working supplements)`);
    
    return {
      totalTested: results.length,
      workingCount,
      partialCount,
      brokenCount,
      completelyBroken,
      partiallyBroken,
      results
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Broader sample test complete');
  }
})();
