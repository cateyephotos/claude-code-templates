const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Modal Opening Issue...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for all console messages and errors
  page.on('console', msg => {
    console.log('📝 Console:', msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  try {
    console.log('🌐 Loading application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🔍 Searching for Holy Basil...');
    await page.fill('#searchInput', 'Holy Basil');
    await page.waitForTimeout(1000);
    
    // Check if Holy Basil card exists and is clickable
    const holyBasilCard = await page.locator('[data-supplement-id="67"]').first();
    const cardExists = await holyBasilCard.count() > 0;
    console.log('📋 Holy Basil card found:', cardExists);
    
    if (cardExists) {
      // Check if card is visible and clickable
      const isVisible = await holyBasilCard.isVisible();
      const isEnabled = await holyBasilCard.isEnabled();
      console.log('👁️ Card visible:', isVisible);
      console.log('🖱️ Card enabled:', isEnabled);
      
      // Get card content to verify it's the right element
      const cardText = await holyBasilCard.textContent();
      console.log('📄 Card content preview:', cardText.substring(0, 100) + '...');
      
      // Try clicking with more explicit approach
      console.log('🖱️ Attempting to click Holy Basil card...');
      
      // First try: regular click
      try {
        await holyBasilCard.click();
        await page.waitForTimeout(2000);
        
        const modal = await page.locator('#supplementModal').first();
        const modalVisible = await modal.isVisible();
        console.log('📱 Modal opened after regular click:', modalVisible);
        
        if (!modalVisible) {
          // Second try: force click
          console.log('🔄 Trying force click...');
          await holyBasilCard.click({ force: true });
          await page.waitForTimeout(2000);
          
          const modalVisible2 = await modal.isVisible();
          console.log('📱 Modal opened after force click:', modalVisible2);
          
          if (!modalVisible2) {
            // Third try: click on specific element within card
            console.log('🔄 Trying to click card title...');
            const cardTitle = await holyBasilCard.locator('h3, .font-semibold').first();
            if (await cardTitle.count() > 0) {
              await cardTitle.click();
              await page.waitForTimeout(2000);
              
              const modalVisible3 = await modal.isVisible();
              console.log('📱 Modal opened after title click:', modalVisible3);
            }
          }
        }
        
        // Check if modal exists in DOM but is hidden
        const modalExists = await page.locator('#supplementModal').count() > 0;
        console.log('🔍 Modal exists in DOM:', modalExists);
        
        if (modalExists) {
          const modalClasses = await page.locator('#supplementModal').getAttribute('class');
          console.log('🎨 Modal classes:', modalClasses);
        }
        
      } catch (clickError) {
        console.log('❌ Click error:', clickError.message);
      }
      
      // Test with a different supplement for comparison
      console.log('\n🔍 Testing with Phosphatidylserine for comparison...');
      await page.fill('#searchInput', 'Phosphatidylserine');
      await page.waitForTimeout(1000);
      
      const psCard = await page.locator('[data-supplement-id="12"]').first();
      const psExists = await psCard.count() > 0;
      console.log('📋 Phosphatidylserine card found:', psExists);
      
      if (psExists) {
        await psCard.click();
        await page.waitForTimeout(2000);
        
        const modal = await page.locator('#supplementModal').first();
        const psModalVisible = await modal.isVisible();
        console.log('📱 Phosphatidylserine modal opened:', psModalVisible);
        
        if (psModalVisible) {
          console.log('✅ Phosphatidylserine modal works - issue is specific to Holy Basil');
          
          // Close modal and try Holy Basil again
          const closeButton = await page.locator('#supplementModal .fa-times, #supplementModal [onclick*="close"]').first();
          if (await closeButton.count() > 0) {
            await closeButton.click();
            await page.waitForTimeout(1000);
          }
        }
      }
      
    } else {
      console.log('❌ Holy Basil card not found');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Debug test complete');
  }
})();
