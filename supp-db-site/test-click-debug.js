const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Click Event Handling...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for all console messages
  page.on('console', msg => {
    if (msg.text().includes('Modal') || msg.text().includes('showSupplementDetails') || msg.text().includes('Holy Basil') || msg.text().includes('Error')) {
      console.log('📝 Console:', msg.text());
    }
  });
  
  // Listen for errors
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
    
    // Check if Holy Basil card exists
    const holyBasilCard = await page.locator('[data-supplement-id="67"]').first();
    const cardExists = await holyBasilCard.count() > 0;
    console.log('📋 Holy Basil card found:', cardExists);
    
    if (cardExists) {
      // Test if app object exists
      const appExists = await page.evaluate(() => typeof window.app !== 'undefined');
      console.log('🔧 App object exists:', appExists);
      
      if (appExists) {
        // Test if showSupplementDetails method exists
        const methodExists = await page.evaluate(() => typeof window.app.showSupplementDetails === 'function');
        console.log('🔧 showSupplementDetails method exists:', methodExists);
        
        if (methodExists) {
          // Try calling the method directly
          console.log('🖱️ Calling showSupplementDetails(67) directly...');
          
          const directCallResult = await page.evaluate(async () => {
            try {
              console.log('🔄 Direct call: showSupplementDetails(67)');
              await window.app.showSupplementDetails(67);
              return { success: true, error: null };
            } catch (error) {
              console.log('❌ Direct call error:', error.message);
              return { success: false, error: error.message };
            }
          });
          
          console.log('📊 Direct call result:', directCallResult);
          
          // Check if modal opened after direct call
          await page.waitForTimeout(1000);
          const modal = await page.locator('#supplementModal').first();
          const modalVisible = await modal.isVisible();
          console.log('📱 Modal visible after direct call:', modalVisible);
          
          if (modalVisible) {
            console.log('✅ Modal opened successfully with direct call!');
            
            // Check modal content
            const modalContent = await modal.textContent();
            console.log('📄 Modal content preview:', modalContent.substring(0, 200) + '...');
            
            // Check for enhanced citation tabs
            const citationTabs = await page.locator('.citation-tab-btn');
            const tabCount = await citationTabs.count();
            console.log('📑 Citation tabs found:', tabCount);
            
            if (tabCount > 0) {
              console.log('✅ Enhanced citation tabs are working!');
              
              // Test clicking a tab
              const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
              if (await benefitsTab.count() > 0) {
                await benefitsTab.click();
                await page.waitForTimeout(500);
                
                const citationCards = await page.locator('.enhanced-citation-card');
                const cardCount = await citationCards.count();
                console.log('📄 Citation cards in Benefits tab:', cardCount);
                
                if (cardCount > 0) {
                  console.log('🎉 HOLY BASIL ENHANCED CITATIONS ARE WORKING PERFECTLY!');
                } else {
                  console.log('⚠️ Enhanced citation tabs exist but no citation cards found');
                }
              }
            }
          } else {
            console.log('❌ Modal did not open even with direct call');
          }
        } else {
          console.log('❌ showSupplementDetails method not found on app object');
        }
      } else {
        console.log('❌ App object not found in window');
      }
      
      // Now test the click event
      console.log('\\n🖱️ Testing click event on card...');
      
      // Check if the card has the correct onclick attribute
      const onclickAttr = await holyBasilCard.getAttribute('onclick');
      console.log('🔧 Card onclick attribute:', onclickAttr);
      
      // Try clicking the "View Details" button specifically
      const viewDetailsBtn = await holyBasilCard.locator('button').filter({ hasText: 'View Details' }).first();
      const btnExists = await viewDetailsBtn.count() > 0;
      console.log('🔘 View Details button found:', btnExists);
      
      if (btnExists) {
        const btnOnclick = await viewDetailsBtn.getAttribute('onclick');
        console.log('🔧 Button onclick attribute:', btnOnclick);
        
        console.log('🖱️ Clicking View Details button...');
        await viewDetailsBtn.click();
        await page.waitForTimeout(1000);
        
        const modalVisible2 = await modal.isVisible();
        console.log('📱 Modal visible after button click:', modalVisible2);
      }
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Click test complete');
  }
})();
