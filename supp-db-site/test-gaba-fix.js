const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing GABA "Unknown" Issues Fix...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🖱️ Opening GABA modal...');
    await page.fill('#searchInput', 'GABA');
    await page.waitForTimeout(1000);
    
    const modalResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(40);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (modalResult.success) {
      await page.waitForTimeout(1000);
      
      // Test all three tabs
      const tabs = ['Mechanisms', 'Benefits', 'Safety'];
      
      for (const tabName of tabs) {
        console.log(`\n🔍 Checking ${tabName} tab...`);
        
        const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
        if (await tab.count() > 0) {
          await tab.click();
          await page.waitForTimeout(500);
          
          const citationCards = await page.locator('.enhanced-citation-card');
          const cardCount = await citationCards.count();
          console.log(`📄 Citation cards in ${tabName} tab: ${cardCount}`);
          
          if (cardCount > 0) {
            const firstCardText = await citationCards.first().textContent();
            console.log(`\nFirst ${tabName} card preview:`);
            console.log(firstCardText.substring(0, 300) + '...');
            
            // Check for issues
            const hasUnknown = firstCardText.toLowerCase().includes('unknown');
            const hasLevel4 = firstCardText.includes('Level 4');
            const hasPlaceholder = firstCardText.includes('Study finding') || 
                                 firstCardText.includes('Unknown authors') ||
                                 firstCardText.includes('Unknown journal');
            const hasProperMechanism = !firstCardText.includes('Unknown mechanism');
            const hasProperYear = /\(\d{4}\)/.test(firstCardText);
            
            console.log(`${hasUnknown ? '❌' : '✅'} Unknown values: ${hasUnknown ? 'Found' : 'None'}`);
            console.log(`${hasLevel4 ? '⚠️' : '✅'} Evidence level: ${hasLevel4 ? 'Level 4 (default)' : 'Proper level'}`);
            console.log(`${hasPlaceholder ? '❌' : '✅'} Placeholder data: ${hasPlaceholder ? 'Found' : 'None'}`);
            console.log(`${hasProperMechanism ? '✅' : '❌'} Mechanism name: ${hasProperMechanism ? 'Proper' : 'Unknown'}`);
            console.log(`${hasProperYear ? '✅' : '❌'} Year format: ${hasProperYear ? 'Has year' : 'Missing year'}`);
            
            // Overall status
            const isFixed = !hasUnknown && hasProperMechanism && hasProperYear;
            console.log(`\n${isFixed ? '🎉' : '🔧'} ${tabName} tab status: ${isFixed ? 'FIXED!' : 'Needs more work'}`);
          }
        } else {
          console.log(`❌ ${tabName} tab not found`);
        }
      }
    } else {
      console.log('❌ Failed to open modal:', modalResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ GABA fix test complete');
  }
})();
