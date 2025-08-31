const { chromium } = require('playwright');

(async () => {
  console.log('🔍 TESTING MEDIUM-PRIORITY SUPPLEMENTS STATUS');
  console.log('Checking Turmeric and Creatine Benefits tab issues...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test medium-priority supplements with Benefits tab issues
    const mediumPrioritySupplements = [
      { id: 2, name: 'Turmeric/Curcumin', issue: 'Benefits undefined values' },
      { id: 5, name: 'Creatine', issue: 'Benefits undefined values' }
    ];
    
    const results = [];
    
    for (const supplement of mediumPrioritySupplements) {
      console.log(`\n🔍 Testing ${supplement.name} (${supplement.issue})...`);
      
      try {
        // Search and open supplement
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(500);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1500);
        
        // Focus on Benefits tab (the problematic one)
        const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
        await benefitsTab.click();
        await page.waitForTimeout(1000);
        
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
            firstCardText: cards[0] ? cards[0].textContent.substring(0, 200) : '',
            undefinedContexts: innerHTML.includes('undefined') ? 
              innerHTML.split('undefined').slice(0, 3).map((part, i) => 
                part.slice(-50) + 'undefined' + innerHTML.split('undefined')[i + 1]?.slice(0, 50)
              ) : []
          };
        }, supplement.id);
        
        // Quick check of other tabs for comparison
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
        
        if (benefitsResult.hasUndefined) {
          console.log(`   Undefined contexts: ${benefitsResult.undefinedContexts.slice(0, 2).join(' | ')}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MEDIUM-PRIORITY STATUS SUMMARY');
    console.log('='.repeat(60));
    
    const workingCount = results.filter(r => r.overallWorking).length;
    const benefitsIssueCount = results.filter(r => !r.benefitsWorking).length;
    
    console.log(`\n📈 Status:`);
    console.log(`   Working: ${workingCount}/${results.length} supplements`);
    console.log(`   Benefits Issues: ${benefitsIssueCount}/${results.length} supplements`);
    
    results.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`   Status: ${result.overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
      console.log(`   Issue: ${result.issue}`);
      
      if (!result.benefitsWorking) {
        console.log(`   Benefits Problem: ${result.benefitsDetails.undefinedCount} undefined values`);
      }
    });
    
    if (benefitsIssueCount === 0) {
      console.log(`\n🎉 ALL MEDIUM-PRIORITY BENEFITS ISSUES RESOLVED!`);
    } else {
      console.log(`\n🔧 NEXT ACTIONS:`);
      console.log(`   Fix Benefits tab undefined values in ${benefitsIssueCount} supplements`);
      console.log(`   Focus on claim field normalization issues`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Medium-priority status test complete');
  }
})();
