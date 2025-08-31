const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing All "Unknown" Issues Fixes...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const unknownSupplements = [
    { id: 40, name: 'GABA' },
    { id: 44, name: 'Alpha-Lipoic Acid' },
    { id: 45, name: 'Lutein' },
    { id: 37, name: 'Zinc' },
    { id: 38, name: 'Iron' }
  ];
  
  const results = [];
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    for (const supplement of unknownSupplements) {
      console.log(`\n🔍 Testing: ${supplement.name} (ID: ${supplement.id})`);
      
      await page.fill('#searchInput', supplement.name);
      await page.waitForTimeout(1000);
      
      const modalResult = await page.evaluate(async (suppId) => {
        try {
          await window.app.showSupplementDetails(suppId);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, supplement.id);
      
      if (modalResult.success) {
        await page.waitForTimeout(1000);
        
        // Test mechanisms tab
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        if (await mechanismsTab.count() > 0) {
          await mechanismsTab.click();
          await page.waitForTimeout(500);
          
          const citationCards = await page.locator('.enhanced-citation-card');
          const cardCount = await citationCards.count();
          
          if (cardCount > 0) {
            const firstCardText = await citationCards.first().textContent();
            
            // Check for issues
            const hasUnknown = firstCardText.toLowerCase().includes('unknown');
            const hasProperMechanism = !firstCardText.includes('Unknown mechanism');
            const hasProperYear = /\(\d{4}\)/.test(firstCardText);
            
            const isFixed = !hasUnknown && hasProperMechanism && hasProperYear;
            
            results.push({
              supplement: supplement.name,
              id: supplement.id,
              cardCount: cardCount,
              hasUnknown: hasUnknown,
              hasProperMechanism: hasProperMechanism,
              hasProperYear: hasProperYear,
              isFixed: isFixed,
              preview: firstCardText.substring(0, 150) + '...'
            });
            
            console.log(`📄 Cards: ${cardCount}`);
            console.log(`${hasUnknown ? '❌' : '✅'} Unknown values: ${hasUnknown ? 'Found' : 'None'}`);
            console.log(`${hasProperMechanism ? '✅' : '❌'} Mechanism: ${hasProperMechanism ? 'Proper' : 'Unknown'}`);
            console.log(`${hasProperYear ? '✅' : '❌'} Year: ${hasProperYear ? 'Has year' : 'Missing'}`);
            console.log(`${isFixed ? '🎉' : '🔧'} Status: ${isFixed ? 'FIXED!' : 'Needs work'}`);
          }
        }
      }
    }
    
    // Summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 UNKNOWN ISSUES FIX SUMMARY');
    console.log('='.repeat(60));
    
    const fixedCount = results.filter(r => r.isFixed).length;
    const totalCount = results.length;
    
    console.log(`\n✅ Fixed: ${fixedCount}/${totalCount} supplements`);
    console.log(`📈 Success Rate: ${Math.round((fixedCount / totalCount) * 100)}%`);
    
    console.log('\n📋 Detailed Results:');
    results.forEach(result => {
      console.log(`   ${result.isFixed ? '✅' : '❌'} ${result.supplement}: ${result.isFixed ? 'FIXED' : 'Issues remain'}`);
    });
    
    if (fixedCount === totalCount) {
      console.log('\n🎉 ALL "UNKNOWN" ISSUES HAVE BEEN RESOLVED!');
    } else {
      console.log(`\n🔧 ${totalCount - fixedCount} supplements still need attention`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ All unknown fixes test complete');
  }
})();
