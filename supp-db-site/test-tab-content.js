const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Citation Tab Content...');
  
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
      
      // Check all available tabs
      const citationTabs = await page.locator('.citation-tab-btn');
      const tabCount = await citationTabs.count();
      console.log(`📑 Found ${tabCount} citation tabs`);
      
      for (let i = 0; i < tabCount; i++) {
        const tabText = await citationTabs.nth(i).textContent();
        console.log(`  Tab ${i + 1}: ${tabText.trim()}`);
      }
      
      // Test each tab content
      const tabs = ['Mechanisms', 'Benefits', 'Safety'];
      
      for (const tabName of tabs) {
        console.log(`\n🔍 Testing ${tabName} tab...`);
        
        const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
        const tabExists = await tab.count() > 0;
        
        if (tabExists) {
          await tab.click();
          await page.waitForTimeout(500);
          
          // Get the tab content
          const tabContentId = `#${tabName.toLowerCase()}-67`;
          const tabContent = await page.locator(tabContentId).first();
          const contentExists = await tabContent.count() > 0;
          
          console.log(`  📋 ${tabName} tab content exists: ${contentExists}`);
          
          if (contentExists) {
            const contentText = await tabContent.textContent();
            console.log(`  📄 ${tabName} content preview:`, contentText.substring(0, 200) + '...');
            
            // Check for citation cards in this tab
            const citationCards = await tabContent.locator('.enhanced-citation-card');
            const cardCount = await citationCards.count();
            console.log(`  📄 Citation cards in ${tabName}: ${cardCount}`);
            
            if (cardCount > 0) {
              for (let i = 0; i < Math.min(cardCount, 2); i++) {
                const cardText = await citationCards.nth(i).textContent();
                console.log(`    Card ${i + 1}:`, cardText.substring(0, 150) + '...');
                
                // Check for "undefined" in this specific card
                if (cardText.includes('undefined')) {
                  console.log(`    ❌ Found "undefined" in ${tabName} tab, card ${i + 1}`);
                  
                  // Get the HTML to debug
                  const cardHTML = await citationCards.nth(i).innerHTML();
                  console.log(`    📋 Card HTML:`, cardHTML.substring(0, 300) + '...');
                }
              }
            }
          } else {
            console.log(`  ❌ No content found for ${tabName} tab`);
          }
        } else {
          console.log(`  ❌ ${tabName} tab not found`);
        }
      }
      
      // Test the raw citation data structure to see what should be displayed
      const citationStructure = await page.evaluate(() => {
        const rawData = window.enhancedCitations[67];
        if (!rawData || !rawData.citations) {
          return { error: 'No citation data found' };
        }
        
        const citations = rawData.citations;
        return {
          mechanisms: {
            count: citations.mechanisms?.length || 0,
            firstClaim: citations.mechanisms?.[0]?.claim || 'None',
            firstStudyTitle: citations.mechanisms?.[0]?.studies?.[0]?.title || 'None'
          },
          benefits: {
            count: citations.benefits?.length || 0,
            firstClaim: citations.benefits?.[0]?.claim || 'None',
            firstStudyTitle: citations.benefits?.[0]?.studies?.[0]?.title || 'None'
          },
          safety: {
            count: citations.safety?.length || 0,
            firstClaim: citations.safety?.[0]?.claim || 'None',
            firstStudyTitle: citations.safety?.[0]?.studies?.[0]?.title || 'None'
          }
        };
      });
      
      console.log('\n📊 Raw Citation Structure:');
      console.log(JSON.stringify(citationStructure, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Tab content test complete');
  }
})();
