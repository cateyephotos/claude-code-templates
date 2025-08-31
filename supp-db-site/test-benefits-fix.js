const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Benefits Fix...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🌐 Loading application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🖱️ Opening Holy Basil modal...');
    await page.fill('#searchInput', 'Holy Basil');
    await page.waitForTimeout(1000);
    
    const directCallResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(67);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (directCallResult.success) {
      await page.waitForTimeout(1000);
      
      console.log('🔍 Checking Benefits tab...');
      
      // Click on Benefits tab
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(1000);
        
        // Count citation cards
        const citationCards = await page.locator('.enhanced-citation-card');
        const cardCount = await citationCards.count();
        console.log(`📄 Citation cards in Benefits tab: ${cardCount}`);
        
        // Check each card
        for (let i = 0; i < cardCount; i++) {
          const cardText = await citationCards.nth(i).textContent();
          console.log(`\nCard ${i + 1}:`);
          console.log(cardText.substring(0, 300) + '...');
          
          // Check for "undefined"
          if (cardText.includes('undefined')) {
            console.log(`❌ Still has "undefined" in card ${i + 1}`);
          } else {
            console.log(`✅ No "undefined" in card ${i + 1}`);
          }
        }
        
        // Expected benefits
        const expectedBenefits = [
          'stress and cortisol',
          'cognitive function',
          'mood and anxiety'
        ];
        
        console.log('\n🔍 Checking for expected benefits...');
        for (const expectedBenefit of expectedBenefits) {
          const benefitFound = await page.locator('.enhanced-citation-card').filter({ hasText: expectedBenefit }).count() > 0;
          console.log(`  ${expectedBenefit}: ${benefitFound ? '✅ Found' : '❌ Missing'}`);
        }
        
      } else {
        console.log('❌ Benefits tab not found');
      }
    } else {
      console.log('❌ Failed to open modal:', directCallResult.error);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Benefits fix test complete');
  }
})();
