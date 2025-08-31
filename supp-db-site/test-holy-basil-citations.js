const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Holy Basil Citation Content...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    if (msg.text().includes('Holy Basil') || msg.text().includes('citation') || msg.text().includes('enhanced')) {
      console.log('📝 Console:', msg.text());
    }
  });
  
  try {
    console.log('🌐 Loading application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🔍 Searching for Holy Basil...');
    await page.fill('#searchInput', 'Holy Basil');
    await page.waitForTimeout(1000);
    
    // Click on Holy Basil card
    console.log('🖱️ Clicking Holy Basil card...');
    const holyBasilCard = await page.locator('[data-supplement-id="67"]').first();
    await holyBasilCard.click();
    await page.waitForTimeout(2000);
    
    // Check if modal opened
    const modal = await page.locator('#supplementModal').first();
    const modalVisible = await modal.isVisible();
    console.log('📱 Modal opened:', modalVisible);
    
    if (modalVisible) {
      // Check for enhanced citation tabs
      const citationTabs = await page.locator('.citation-tab-btn');
      const tabCount = await citationTabs.count();
      console.log('📑 Citation tabs found:', tabCount);
      
      if (tabCount > 0) {
        // Get tab names
        for (let i = 0; i < tabCount; i++) {
          const tabText = await citationTabs.nth(i).textContent();
          console.log(`  Tab ${i + 1}: ${tabText}`);
        }
        
        // Click on Benefits tab to see content
        console.log('🖱️ Clicking Benefits tab...');
        const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
        if (await benefitsTab.count() > 0) {
          await benefitsTab.click();
          await page.waitForTimeout(1000);
          
          // Check for citation content
          const citationCards = await page.locator('.enhanced-citation-card');
          const cardCount = await citationCards.count();
          console.log('📄 Citation cards in Benefits tab:', cardCount);
          
          if (cardCount > 0) {
            // Get content of first citation card
            const firstCard = citationCards.first();
            const cardContent = await firstCard.textContent();
            console.log('📋 First citation card content:');
            console.log(cardContent.substring(0, 200) + '...');
          } else {
            console.log('❌ No citation cards found in Benefits tab');
            
            // Check what content is actually there
            const tabContent = await page.locator('#benefits-67').textContent();
            console.log('📋 Benefits tab content:', tabContent.substring(0, 300));
          }
        }
        
        // Click on Mechanisms tab
        console.log('🖱️ Clicking Mechanisms tab...');
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        if (await mechanismsTab.count() > 0) {
          await mechanismsTab.click();
          await page.waitForTimeout(1000);
          
          const mechanismCards = await page.locator('.enhanced-citation-card');
          const mechanismCount = await mechanismCards.count();
          console.log('🔬 Citation cards in Mechanisms tab:', mechanismCount);
          
          if (mechanismCount === 0) {
            const tabContent = await page.locator('#mechanisms-67').textContent();
            console.log('📋 Mechanisms tab content:', tabContent.substring(0, 300));
          }
        }
      }
      
      // Check for any error messages
      const errorMessages = await page.locator('.text-red-700, .bg-red-50');
      const errorCount = await errorMessages.count();
      if (errorCount > 0) {
        console.log('❌ Error messages found:', errorCount);
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorMessages.nth(i).textContent();
          console.log(`  Error ${i + 1}: ${errorText}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Test complete');
  }
})();
