const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Finding Caffeine Supplement Information...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Search for Caffeine
    await page.fill('#searchInput', 'Caffeine');
    await page.waitForTimeout(1000);
    
    // Get Caffeine supplement information
    const caffeineInfo = await page.evaluate(() => {
      const allSupplements = window.app.supplements;
      const caffeine = allSupplements.find(s => s.name.toLowerCase().includes('caffeine'));
      
      if (!caffeine) {
        return { error: 'Caffeine supplement not found' };
      }
      
      return {
        id: caffeine.id,
        name: caffeine.name,
        category: caffeine.category,
        evidenceTier: caffeine.evidenceTier,
        hasEnhancedCitations: !!caffeine.enhancedCitations?.isEnhanced,
        description: caffeine.description,
        benefits: caffeine.benefits,
        mechanisms: caffeine.mechanisms,
        dosage: caffeine.dosage,
        sideEffects: caffeine.sideEffects
      };
    });
    
    console.log('📊 Caffeine Supplement Information:');
    console.log(JSON.stringify(caffeineInfo, null, 2));
    
    if (caffeineInfo.id) {
      // Check if enhanced citation file already exists
      const hasEnhancedFile = await page.evaluate((id) => {
        return !!window.enhancedCitations[id];
      }, caffeineInfo.id);
      
      console.log(`\n📄 Enhanced citation file exists: ${hasEnhancedFile ? 'Yes' : 'No'}`);
      
      if (hasEnhancedFile) {
        console.log('⚠️ Caffeine already has enhanced citations - checking quality...');
        
        // Test the modal
        const modalResult = await page.evaluate(async (id) => {
          try {
            await window.app.showSupplementDetails(id);
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }, caffeineInfo.id);
        
        if (modalResult.success) {
          await page.waitForTimeout(1000);
          
          // Check citation quality
          const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
          if (await mechanismsTab.count() > 0) {
            await mechanismsTab.click();
            await page.waitForTimeout(500);
            
            const citationCards = await page.locator('.enhanced-citation-card');
            const cardCount = await citationCards.count();
            
            console.log(`📄 Current citation cards: ${cardCount}`);
            
            if (cardCount > 0) {
              const firstCardText = await citationCards.first().textContent();
              console.log('📋 First card preview:');
              console.log(firstCardText.substring(0, 300) + '...');
              
              const hasIssues = firstCardText.includes('undefined') || 
                              firstCardText.includes('Unknown') ||
                              firstCardText.includes('Study finding');
              
              console.log(`${hasIssues ? '🔧' : '✅'} Citation quality: ${hasIssues ? 'Needs improvement' : 'Good'}`);
            }
          }
        }
      } else {
        console.log('✅ Ready to create new enhanced citations for Caffeine');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Caffeine info search complete');
  }
})();
