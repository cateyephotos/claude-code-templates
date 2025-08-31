const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Current Caffeine Enhanced Citations...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check if Caffeine has enhanced citations
    const caffeineStatus = await page.evaluate(() => {
      const caffeine = window.app.supplements.find(s => s.id === 50);
      return {
        found: !!caffeine,
        name: caffeine?.name,
        hasEnhanced: !!caffeine?.enhancedCitations?.isEnhanced,
        enhancedData: !!window.enhancedCitations?.[50]
      };
    });
    
    console.log('📊 Caffeine Status:', caffeineStatus);
    
    if (caffeineStatus.hasEnhanced) {
      console.log('✅ Caffeine already has enhanced citations - testing quality...');
      
      // Test the modal
      await page.fill('#searchInput', 'Caffeine');
      await page.waitForTimeout(1000);
      
      const modalResult = await page.evaluate(async () => {
        try {
          await window.app.showSupplementDetails(50);
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
              const hasUndefined = firstCardText.includes('undefined');
              const hasUnknown = firstCardText.toLowerCase().includes('unknown');
              const hasProperYear = /\(\d{4}\)/.test(firstCardText);
              const hasProperAuthors = !firstCardText.includes('Unknown authors');
              
              console.log(`${hasUndefined ? '❌' : '✅'} Undefined values: ${hasUndefined ? 'Found' : 'None'}`);
              console.log(`${hasUnknown ? '❌' : '✅'} Unknown values: ${hasUnknown ? 'Found' : 'None'}`);
              console.log(`${hasProperYear ? '✅' : '❌'} Year format: ${hasProperYear ? 'Has year' : 'Missing'}`);
              console.log(`${hasProperAuthors ? '✅' : '❌'} Authors: ${hasProperAuthors ? 'Real authors' : 'Unknown'}`);
              
              const isGoodQuality = !hasUndefined && !hasUnknown && hasProperYear && hasProperAuthors;
              console.log(`${isGoodQuality ? '🎉' : '🔧'} ${tabName} quality: ${isGoodQuality ? 'EXCELLENT' : 'Needs improvement'}`);
            }
          } else {
            console.log(`❌ ${tabName} tab not found`);
          }
        }
      }
    } else {
      console.log('❌ Caffeine does not have enhanced citations - ready for implementation');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Caffeine test complete');
  }
})();
