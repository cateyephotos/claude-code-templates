const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging showTab Function...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Search for Melatonin and open modal
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
    
    if (!modalResult.success) {
      console.log(`❌ Modal failed: ${modalResult.error}`);
      return;
    }
    
    await page.waitForTimeout(1000);
    
    // Check the initial HTML structure
    const initialStructure = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.citation-tab-content')).map(container => ({
        id: container.id,
        isHidden: container.classList.contains('hidden'),
        cardCount: container.querySelectorAll('.enhanced-citation-card').length,
        exists: !!container
      }));
      
      return {
        containers: containers,
        totalContainers: containers.length,
        visibleContainers: containers.filter(c => !c.isHidden).length
      };
    });
    
    console.log('📊 Initial HTML Structure:');
    console.log(JSON.stringify(initialStructure, null, 2));
    
    // Test the showTab function directly
    console.log('\n🔧 Testing showTab function directly...');
    
    const showTabTests = [
      'mechanisms-8',
      'benefits-8', 
      'safety-8'
    ];
    
    for (const tabId of showTabTests) {
      console.log(`\n🔍 Testing showTab('${tabId}')...`);
      
      const result = await page.evaluate((targetTabId) => {
        try {
          // Call showTab function
          if (window.app && window.app.citationRenderer && window.app.citationRenderer.showTab) {
            window.app.citationRenderer.showTab(targetTabId);
            
            // Check the result
            const containers = Array.from(document.querySelectorAll('.citation-tab-content')).map(container => ({
              id: container.id,
              isHidden: container.classList.contains('hidden'),
              cardCount: container.querySelectorAll('.enhanced-citation-card').length
            }));
            
            const visibleCards = Array.from(document.querySelectorAll('.enhanced-citation-card')).filter(card => 
              !card.closest('.citation-tab-content')?.classList.contains('hidden')
            );
            
            return {
              success: true,
              targetTab: targetTabId,
              containers: containers,
              visibleCardCount: visibleCards.length,
              targetTabVisible: !document.getElementById(targetTabId)?.classList.contains('hidden')
            };
          } else {
            return { success: false, error: 'showTab function not found' };
          }
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, tabId);
      
      console.log(`   Result:`, result);
      
      if (result.success) {
        const targetContainer = result.containers.find(c => c.id === tabId);
        if (targetContainer && !targetContainer.isHidden) {
          console.log(`   ✅ ${tabId} is now visible with ${targetContainer.cardCount} cards`);
        } else {
          console.log(`   ❌ ${tabId} is still hidden or not found`);
        }
        
        const hiddenContainers = result.containers.filter(c => c.id !== tabId && c.isHidden);
        console.log(`   📋 Hidden containers: ${hiddenContainers.map(c => c.id).join(', ')}`);
      }
    }
    
    // Test clicking tab buttons
    console.log('\n🖱️ Testing tab button clicks...');
    
    const tabs = ['Mechanisms', 'Benefits', 'Safety'];
    
    for (const tabName of tabs) {
      console.log(`\n🔍 Clicking ${tabName} tab button...`);
      
      const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
      if (await tab.count() > 0) {
        await tab.click();
        await page.waitForTimeout(500);
        
        const afterClick = await page.evaluate(() => {
          const containers = Array.from(document.querySelectorAll('.citation-tab-content')).map(container => ({
            id: container.id,
            isHidden: container.classList.contains('hidden')
          }));
          
          const visibleCards = Array.from(document.querySelectorAll('.enhanced-citation-card')).filter(card => 
            !card.closest('.citation-tab-content')?.classList.contains('hidden')
          );
          
          return {
            containers: containers,
            visibleCardCount: visibleCards.length,
            visibleContainerIds: containers.filter(c => !c.isHidden).map(c => c.id)
          };
        });
        
        console.log(`   After clicking ${tabName}:`, afterClick);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ showTab function debug complete');
  }
})();
