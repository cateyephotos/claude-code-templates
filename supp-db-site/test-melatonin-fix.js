const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Melatonin Fix...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🖱️ Opening Melatonin modal...');
    await page.fill('#searchInput', 'Melatonin');
    await page.waitForTimeout(1000);
    
    const modalResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(8);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (modalResult.success) {
      await page.waitForTimeout(1000);
      
      console.log('🔍 Checking Mechanisms tab...');
      
      // Click on Mechanisms tab
      const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
      if (await mechanismsTab.count() > 0) {
        await mechanismsTab.click();
        await page.waitForTimeout(1000);
        
        // Count citation cards
        const citationCards = await page.locator('.enhanced-citation-card');
        const cardCount = await citationCards.count();
        console.log(`📄 Citation cards in Mechanisms tab: ${cardCount}`);
        
        // Check first few cards
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const cardText = await citationCards.nth(i).textContent();
          console.log(`\nCard ${i + 1}:`);
          console.log(cardText.substring(0, 400) + '...');
          
          // Check for "undefined"
          if (cardText.includes('undefined')) {
            console.log(`❌ Still has "undefined" in card ${i + 1}`);
          } else {
            console.log(`✅ No "undefined" in card ${i + 1}`);
          }
          
          // Check for proper author/year format
          if (cardText.includes('(2024)') || cardText.includes('(2022)') || cardText.includes('(2023)')) {
            console.log(`✅ Has proper year format in card ${i + 1}`);
          }
          
          if (cardText.includes('et al.') || cardText.includes('Unknown authors')) {
            const hasRealAuthors = !cardText.includes('Unknown authors');
            console.log(`${hasRealAuthors ? '✅' : '❌'} Author status in card ${i + 1}: ${hasRealAuthors ? 'Real authors' : 'Unknown authors'}`);
          }
        }
        
        // Test Benefits tab too
        console.log('\n🔍 Checking Benefits tab...');
        const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
        if (await benefitsTab.count() > 0) {
          await benefitsTab.click();
          await page.waitForTimeout(500);
          
          const benefitCards = await page.locator('.enhanced-citation-card');
          const benefitCardCount = await benefitCards.count();
          console.log(`📄 Citation cards in Benefits tab: ${benefitCardCount}`);
          
          if (benefitCardCount > 0) {
            const firstBenefitText = await benefitCards.first().textContent();
            console.log('\nFirst Benefits card:');
            console.log(firstBenefitText.substring(0, 300) + '...');
            
            const hasUndefined = firstBenefitText.includes('undefined');
            console.log(`${hasUndefined ? '❌' : '✅'} Benefits tab undefined status: ${hasUndefined ? 'Has undefined' : 'No undefined'}`);
          }
        }
        
      } else {
        console.log('❌ Mechanisms tab not found');
      }
    } else {
      console.log('❌ Failed to open modal:', modalResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Melatonin fix test complete');
  }
})();
