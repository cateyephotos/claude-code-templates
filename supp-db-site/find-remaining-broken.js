const { chromium } = require('playwright');

(async () => {
  console.log('🔍 FINDING REMAINING BROKEN SUPPLEMENTS');
  console.log('Testing IDs 36-56 to identify final issues to fix...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test remaining range of supplements
    const supplements = [
      { id: 36, name: 'Rhodiola Rosea' },
      { id: 37, name: 'Zinc' },
      { id: 38, name: 'Iron' },
      { id: 39, name: 'Phosphatidylserine' },
      { id: 40, name: 'Alpha-GPC' },
      { id: 41, name: 'Citicoline' },
      { id: 42, name: 'Selenium' },
      { id: 43, name: 'Copper' },
      { id: 44, name: 'Manganese' },
      { id: 45, name: 'Chromium' },
      { id: 46, name: 'Molybdenum' },
      { id: 47, name: 'Boron' },
      { id: 48, name: 'Vanadium' },
      { id: 49, name: 'Silicon' },
      { id: 50, name: 'Nickel' },
      { id: 51, name: 'Tin' },
      { id: 52, name: 'Cobalt' },
      { id: 53, name: 'Spirulina' },
      { id: 54, name: 'Chlorella' },
      { id: 55, name: 'Kelp' },
      { id: 56, name: 'Dulse' }
    ];
    
    const results = [];
    const brokenSupplements = [];
    
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
        
        // Test Benefits tab
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
        
        if (!overallWorking) {
          brokenSupplements.push(result);
        }
        
        const status = overallWorking ? '✅' : '❌';
        const workingTabs = [benefitsWorking, safetyWorking, mechanismsWorking].filter(Boolean).length;
        console.log(`   ${status} ${workingTabs}/3 tabs working (B:${benefitsResult.studyCards} S:${safetyResult.studyCards} M:${mechanismsResult.studyCards})`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        brokenSupplements.push({
          id: supplement.id,
          name: supplement.name,
          overallWorking: false,
          error: error.message
        });
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 REMAINING SUPPLEMENTS AUDIT (IDs 36-56)');
    console.log('='.repeat(70));
    
    const workingCount = results.filter(r => r.overallWorking).length;
    const brokenCount = brokenSupplements.length;
    const partialCount = results.filter(r => !r.overallWorking && !r.error && 
      (r.benefitsWorking || r.safetyWorking || r.mechanismsWorking)).length;
    
    console.log(`\n📈 Range 36-56 Status:`);
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
    
    console.log('\n🎯 PRIORITY FIXES FOR >95% TARGET:');
    const completelyBroken = results.filter(r => !r.overallWorking && (!r.benefitsWorking && !r.safetyWorking && !r.mechanismsWorking));
    const partiallyBroken = results.filter(r => !r.overallWorking && !r.error && 
      (r.benefitsWorking || r.safetyWorking || r.mechanismsWorking));
    
    console.log(`1. Fix ${completelyBroken.length} completely broken supplements (highest priority)`);
    console.log(`2. Fix ${partiallyBroken.length} partially working supplements (medium priority)`);
    
    // Calculate overall progress
    const currentWorking = 44; // From previous session
    const newWorking = workingCount;
    const totalWorking = currentWorking + newWorking;
    const totalSupplements = 56;
    const currentSuccessRate = Math.round((totalWorking / totalSupplements) * 100);
    const targetWorking = Math.ceil(totalSupplements * 0.95);
    const needToFix = targetWorking - totalWorking;
    
    console.log(`\n📊 OVERALL PROGRESS UPDATE:`);
    console.log(`   Previous Working: ${currentWorking}/56`);
    console.log(`   New Working (36-56): ${newWorking}/${results.length}`);
    console.log(`   Total Working: ${totalWorking}/56 (${currentSuccessRate}%)`);
    console.log(`   Target (95%): ${targetWorking}/56`);
    console.log(`   Need to Fix: ${needToFix} more supplements`);
    
    if (needToFix <= completelyBroken.length) {
      console.log(`\n🎯 ACHIEVABLE: Fix ${needToFix} completely broken supplements to reach 95%!`);
    } else {
      console.log(`\n🎯 STRATEGY: Fix all ${completelyBroken.length} completely broken + ${needToFix - completelyBroken.length} partially broken`);
    }
    
    return {
      totalTested: results.length,
      workingCount,
      partialCount,
      brokenCount,
      completelyBroken,
      partiallyBroken,
      results,
      overallProgress: {
        totalWorking,
        currentSuccessRate,
        needToFix
      }
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Remaining supplements audit complete');
  }
})();
