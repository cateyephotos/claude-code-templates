const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Pterostilbene Fix...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🖱️ Opening Pterostilbene modal...');
    await page.fill('#searchInput', 'Pterostilbene');
    await page.waitForTimeout(1000);
    
    const modalResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(89);
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
            console.log(firstCardText.substring(0, 250) + '...');
            
            // Check for issues
            const hasUndefined = firstCardText.includes('undefined');
            const hasUnknown = firstCardText.includes('Unknown authors');
            const hasYear = /\(\d{4}\)/.test(firstCardText);
            
            console.log(`${hasUndefined ? '❌' : '✅'} Undefined status: ${hasUndefined ? 'Has undefined' : 'No undefined'}`);
            console.log(`${hasUnknown ? '❌' : '✅'} Author status: ${hasUnknown ? 'Unknown authors' : 'Real authors'}`);
            console.log(`${hasYear ? '✅' : '❌'} Year format: ${hasYear ? 'Has proper year' : 'Missing year'}`);
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
    console.log('✅ Pterostilbene fix test complete');
  }
})();
