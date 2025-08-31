const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Tab HTML Structure...');
  
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
    
    // Get the complete HTML structure of the citation area
    const htmlStructure = await page.evaluate(() => {
      const citationContainer = document.querySelector('.citation-content') || 
                               document.querySelector('[class*="citation"]') ||
                               document.querySelector('#supplementModal .modal-content');
      
      if (!citationContainer) {
        return { error: 'No citation container found' };
      }
      
      // Get all tab-related elements
      const tabButtons = Array.from(document.querySelectorAll('.citation-tab-btn')).map(btn => ({
        text: btn.textContent.trim(),
        onclick: btn.getAttribute('onclick'),
        classes: btn.className
      }));
      
      const tabContents = Array.from(document.querySelectorAll('.citation-tab-content')).map(content => ({
        id: content.id,
        classes: content.className,
        cardCount: content.querySelectorAll('.enhanced-citation-card').length,
        isHidden: content.classList.contains('hidden'),
        innerHTML: content.innerHTML.substring(0, 500) + '...'
      }));
      
      const allCards = Array.from(document.querySelectorAll('.enhanced-citation-card')).map((card, index) => ({
        index: index,
        parentId: card.closest('.citation-tab-content')?.id || 'no-parent',
        title: card.querySelector('h5')?.textContent?.trim() || 'No title',
        isVisible: !card.closest('.citation-tab-content')?.classList.contains('hidden')
      }));
      
      return {
        tabButtons: tabButtons,
        tabContents: tabContents,
        allCards: allCards,
        totalCards: allCards.length,
        visibleCards: allCards.filter(card => card.isVisible).length
      };
    });
    
    console.log('📊 HTML Structure Analysis:');
    console.log(JSON.stringify(htmlStructure, null, 2));
    
    // Test tab switching manually
    console.log('\n🔄 Testing Tab Switching...');
    
    const tabs = ['Mechanisms', 'Benefits', 'Safety'];
    
    for (const tabName of tabs) {
      console.log(`\n🔍 Switching to ${tabName} tab...`);
      
      const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
      if (await tab.count() > 0) {
        await tab.click();
        await page.waitForTimeout(500);
        
        // Check what's visible after clicking
        const visibilityCheck = await page.evaluate(() => {
          const tabContents = Array.from(document.querySelectorAll('.citation-tab-content')).map(content => ({
            id: content.id,
            isHidden: content.classList.contains('hidden'),
            cardCount: content.querySelectorAll('.enhanced-citation-card').length
          }));
          
          const visibleCards = Array.from(document.querySelectorAll('.enhanced-citation-card')).filter(card => 
            !card.closest('.citation-tab-content')?.classList.contains('hidden')
          );
          
          return {
            tabContents: tabContents,
            visibleCardCount: visibleCards.length,
            visibleCardTitles: visibleCards.slice(0, 3).map(card => 
              card.querySelector('h5')?.textContent?.trim() || 'No title'
            )
          };
        });
        
        console.log(`   Visible after ${tabName} click:`, visibilityCheck);
      }
    }
    
    // Check if the showTab function is working correctly
    console.log('\n🔧 Testing showTab function directly...');
    
    const showTabTest = await page.evaluate(() => {
      // Test the showTab function directly
      if (window.app && window.app.citationRenderer && window.app.citationRenderer.showTab) {
        try {
          window.app.citationRenderer.showTab('benefits-8');
          
          const afterShowTab = Array.from(document.querySelectorAll('.citation-tab-content')).map(content => ({
            id: content.id,
            isHidden: content.classList.contains('hidden')
          }));
          
          return { success: true, afterShowTab: afterShowTab };
        } catch (error) {
          return { success: false, error: error.message };
        }
      } else {
        return { success: false, error: 'showTab function not found' };
      }
    });
    
    console.log('ShowTab test result:', showTabTest);
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Tab HTML debug complete');
  }
})();
