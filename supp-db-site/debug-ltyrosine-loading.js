const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUGGING L-TYROSINE LOADING');
  console.log('Checking if L-Tyrosine data is actually loading...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Give extra time for all files to load
    
    // Check L-Tyrosine data loading
    const dataCheck = await page.evaluate(() => {
      const id = 33; // L-Tyrosine
      
      return {
        hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
        hasLTyrosineData: window.enhancedCitations && window.enhancedCitations[id] !== undefined,
        hasGlobalVar: typeof window.lTyrosineEnhanced !== 'undefined',
        enhancedCitationsKeys: window.enhancedCitations ? Object.keys(window.enhancedCitations) : [],
        lTyrosineDataKeys: window.enhancedCitations && window.enhancedCitations[id] ? 
          Object.keys(window.enhancedCitations[id]) : null,
        citationLoaderMappings: window.EnhancedCitationLoader ? 
          window.EnhancedCitationLoader.supplementMappings?.filter(m => m.id === 33) : null,
        allGlobalVars: Object.keys(window).filter(key => key.toLowerCase().includes('tyrosine'))
      };
    });
    
    console.log('\n📊 L-Tyrosine Data Analysis:');
    console.log(`   Enhanced Citations Exists: ${dataCheck.hasEnhancedCitations}`);
    console.log(`   L-Tyrosine Data Loaded: ${dataCheck.hasLTyrosineData}`);
    console.log(`   Global Variable Exists: ${dataCheck.hasGlobalVar}`);
    console.log(`   Enhanced Citation Keys: ${dataCheck.enhancedCitationsKeys.slice(0, 15).join(', ')}...`);
    console.log(`   Tyrosine Global Vars: ${dataCheck.allGlobalVars.join(', ')}`);
    
    if (dataCheck.lTyrosineDataKeys) {
      console.log(`   L-Tyrosine Data Keys: ${dataCheck.lTyrosineDataKeys.join(', ')}`);
    }
    
    if (dataCheck.citationLoaderMappings) {
      console.log(`   Loader Mapping: ${JSON.stringify(dataCheck.citationLoaderMappings[0])}`);
    }
    
    // Try to manually trigger supplement details
    console.log('\n🧪 Manual Supplement Loading Test:');
    
    try {
      await page.fill('#searchInput', 'L-Tyrosine');
      await page.waitForTimeout(1000);
      
      // Check if supplement appears in search
      const searchResults = await page.evaluate(() => {
        const searchInput = document.getElementById('searchInput');
        const searchValue = searchInput ? searchInput.value : '';
        
        // Check if there are any visible supplement cards
        const supplementCards = Array.from(document.querySelectorAll('.supplement-card'));
        const visibleCards = supplementCards.filter(card => 
          card.style.display !== 'none' && 
          card.textContent.toLowerCase().includes('tyrosine')
        );
        
        return {
          searchValue: searchValue,
          totalCards: supplementCards.length,
          visibleCards: visibleCards.length,
          cardTexts: visibleCards.map(card => card.textContent.trim().substring(0, 50))
        };
      });
      
      console.log(`   Search Value: "${searchResults.searchValue}"`);
      console.log(`   Total Cards: ${searchResults.totalCards}`);
      console.log(`   Visible Cards: ${searchResults.visibleCards}`);
      console.log(`   Card Texts: ${searchResults.cardTexts.join(', ')}`);
      
      if (searchResults.visibleCards > 0) {
        // Try to click on the supplement
        await page.click('.supplement-card:visible');
        await page.waitForTimeout(2000);
        
        // Check if details panel opened
        const detailsCheck = await page.evaluate(() => {
          const detailsPanel = document.getElementById('supplementDetails');
          const isVisible = detailsPanel && detailsPanel.style.display !== 'none';
          const hasContent = detailsPanel && detailsPanel.innerHTML.length > 100;
          
          return {
            panelExists: !!detailsPanel,
            isVisible: isVisible,
            hasContent: hasContent,
            contentLength: detailsPanel ? detailsPanel.innerHTML.length : 0
          };
        });
        
        console.log(`   Details Panel Opened: ${detailsCheck.isVisible}`);
        console.log(`   Has Content: ${detailsCheck.hasContent}`);
        console.log(`   Content Length: ${detailsCheck.contentLength} chars`);
        
        if (detailsCheck.isVisible) {
          // Check for citation tabs
          const tabsCheck = await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.citation-tab-btn'));
            return {
              tabCount: tabs.length,
              tabTexts: tabs.map(tab => tab.textContent.trim())
            };
          });
          
          console.log(`   Citation Tabs: ${tabsCheck.tabCount} (${tabsCheck.tabTexts.join(', ')})`);
        }
      } else {
        console.log('   ❌ No L-Tyrosine supplement found in search results');
      }
      
    } catch (error) {
      console.log(`   ❌ Manual loading error: ${error.message}`);
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    
    if (!dataCheck.hasLTyrosineData) {
      console.log('❌ L-Tyrosine: Enhanced citation data not loaded');
      console.log('   Check if file is being loaded by citation loader');
    } else if (!dataCheck.hasGlobalVar) {
      console.log('❌ L-Tyrosine: Global variable not set');
      console.log('   Check global variable assignment in file');
    } else {
      console.log('✅ L-Tyrosine: Data loaded but UI issue');
      console.log('   Check supplement search/display functionality');
    }
    
    return dataCheck;
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ L-Tyrosine loading debug complete');
  }
})();
