const { chromium } = require('playwright');

(async () => {
  console.log('🔍 CHECKING SUPPLEMENT NAMES AND IDS');
  console.log('Finding all available supplements and looking for L-Tyrosine...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all supplements data
    const supplementsData = await page.evaluate(() => {
      const supplements = window.supplements || [];
      
      return {
        totalSupplements: supplements.length,
        supplementsList: supplements.map(supp => ({
          id: supp.id,
          name: supp.name,
          category: supp.category
        })),
        tyrosineMatches: supplements.filter(supp => 
          supp.name.toLowerCase().includes('tyrosine')
        ),
        searchTerms: ['tyrosine', 'l-tyrosine', 'L-Tyrosine', 'Tyrosine']
      };
    });
    
    console.log('\n📊 Supplements Database Analysis:');
    console.log(`   Total Supplements: ${supplementsData.totalSupplements}`);
    
    console.log('\n🔍 Looking for Tyrosine variants:');
    supplementsData.searchTerms.forEach(term => {
      const matches = supplementsData.supplementsList.filter(supp => 
        supp.name.toLowerCase().includes(term.toLowerCase())
      );
      console.log(`   "${term}": ${matches.length} matches`);
      matches.forEach(match => {
        console.log(`     ID ${match.id}: ${match.name} (${match.category})`);
      });
    });
    
    console.log('\n📋 All Supplements (IDs 30-40):');
    supplementsData.supplementsList
      .filter(supp => supp.id >= 30 && supp.id <= 40)
      .forEach(supp => {
        console.log(`   ID ${supp.id}: ${supp.name} (${supp.category})`);
      });
    
    // Check if there are any supplements with ID 33
    const id33Supplement = supplementsData.supplementsList.find(supp => supp.id === 33);
    if (id33Supplement) {
      console.log(`\n✅ Found supplement with ID 33: ${id33Supplement.name}`);
      
      // Try to search for this supplement by its actual name
      console.log(`\n🧪 Testing search for "${id33Supplement.name}"...`);
      
      await page.fill('#searchInput', id33Supplement.name);
      await page.waitForTimeout(1000);
      
      const searchResults = await page.evaluate(() => {
        const supplementCards = Array.from(document.querySelectorAll('.supplement-card'));
        const visibleCards = supplementCards.filter(card => 
          card.style.display !== 'none'
        );
        
        return {
          totalCards: supplementCards.length,
          visibleCards: visibleCards.length,
          cardTexts: visibleCards.map(card => card.textContent.trim().substring(0, 50))
        };
      });
      
      console.log(`   Visible Cards: ${searchResults.visibleCards}`);
      console.log(`   Card Texts: ${searchResults.cardTexts.join(', ')}`);
      
      if (searchResults.visibleCards > 0) {
        // Try to click and test
        try {
          await page.click('.supplement-card:visible');
          await page.waitForTimeout(2000);
          
          // Check if citation tabs appear
          const tabsCheck = await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.citation-tab-btn'));
            return {
              tabCount: tabs.length,
              tabTexts: tabs.map(tab => tab.textContent.trim())
            };
          });
          
          console.log(`   Citation Tabs: ${tabsCheck.tabCount} (${tabsCheck.tabTexts.join(', ')})`);
          
          if (tabsCheck.tabCount > 0) {
            console.log('   ✅ Supplement details loaded successfully!');
          } else {
            console.log('   ❌ No citation tabs found');
          }
          
        } catch (error) {
          console.log(`   ❌ Click error: ${error.message}`);
        }
      }
      
    } else {
      console.log('\n❌ No supplement found with ID 33');
      console.log('   This explains why L-Tyrosine testing fails');
    }
    
    // Check enhanced citations for ID 33
    const enhancedCitationCheck = await page.evaluate(() => {
      return {
        hasEnhancedCitation33: window.enhancedCitations && window.enhancedCitations[33] !== undefined,
        enhancedCitationName: window.enhancedCitations && window.enhancedCitations[33] ? 
          window.enhancedCitations[33].supplementName : null
      };
    });
    
    console.log('\n📊 Enhanced Citation vs Supplement Database:');
    console.log(`   Enhanced Citation for ID 33: ${enhancedCitationCheck.hasEnhancedCitation33 ? '✅' : '❌'}`);
    if (enhancedCitationCheck.enhancedCitationName) {
      console.log(`   Enhanced Citation Name: "${enhancedCitationCheck.enhancedCitationName}"`);
    }
    console.log(`   Supplement Database for ID 33: ${id33Supplement ? '✅' : '❌'}`);
    if (id33Supplement) {
      console.log(`   Supplement Database Name: "${id33Supplement.name}"`);
    }
    
    console.log('\n🎯 CONCLUSION:');
    if (enhancedCitationCheck.hasEnhancedCitation33 && !id33Supplement) {
      console.log('❌ MISMATCH: Enhanced citation exists but supplement not in database');
      console.log('   Solution: Add L-Tyrosine to supplements database or use different ID');
    } else if (enhancedCitationCheck.hasEnhancedCitation33 && id33Supplement) {
      console.log('✅ MATCH: Both enhanced citation and supplement exist');
      console.log('   Issue might be elsewhere in the rendering process');
    }
    
    return supplementsData;
    
  } catch (error) {
    console.error('❌ Check error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Supplement names check complete');
  }
})();
