const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing Complete Phase 1 Enhanced Citations...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const phase1Supplements = [
    { id: 50, name: 'Caffeine', tier: 1, category: 'Performance Enhancers' },
    { id: 36, name: 'Vitamin C', tier: 2, category: 'Essential Nutrients' },
    { id: 30, name: 'Vitamin E', tier: 2, category: 'Essential Nutrients' },
    { id: 31, name: 'Whey Protein', tier: 2, category: 'Protein' }
  ];
  
  const results = [];
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📊 PHASE 1 ENHANCED CITATION VERIFICATION');
    console.log('='.repeat(60));
    
    for (const supplement of phase1Supplements) {
      console.log(`\n🔍 Testing: ${supplement.name} (ID: ${supplement.id}, Tier ${supplement.tier})`);
      
      // Check enhanced citation status
      const enhancedStatus = await page.evaluate((suppId) => {
        const supp = window.app.supplements.find(s => s.id === suppId);
        return {
          found: !!supp,
          hasEnhanced: !!supp?.enhancedCitations?.isEnhanced,
          enhancedData: !!window.enhancedCitations?.[suppId]
        };
      }, supplement.id);
      
      console.log(`   📋 Enhanced Status: ${enhancedStatus.hasEnhanced ? '✅ Enhanced' : '❌ Not Enhanced'}`);
      console.log(`   📄 Data Available: ${enhancedStatus.enhancedData ? '✅ Yes' : '❌ No'}`);
      
      if (enhancedStatus.hasEnhanced && enhancedStatus.enhancedData) {
        // Test modal functionality
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(1000);
        
        const modalResult = await page.evaluate(async (suppId) => {
          try {
            await window.app.showSupplementDetails(suppId);
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }, supplement.id);
        
        if (modalResult.success) {
          await page.waitForTimeout(1000);
          
          // Test all three tabs
          const tabs = ['Mechanisms', 'Benefits', 'Safety'];
          const tabResults = {};
          
          for (const tabName of tabs) {
            const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
            if (await tab.count() > 0) {
              await tab.click();
              await page.waitForTimeout(500);
              
              const citationCards = await page.locator('.enhanced-citation-card');
              const cardCount = await citationCards.count();
              
              let quality = 'EXCELLENT';
              if (cardCount > 0) {
                const firstCardText = await citationCards.first().textContent();
                
                const hasUndefined = firstCardText.includes('undefined');
                const hasUnknown = firstCardText.toLowerCase().includes('unknown');
                const hasProperYear = /\(\d{4}\)/.test(firstCardText);
                const hasProperAuthors = !firstCardText.includes('Unknown authors');
                
                if (hasUndefined || hasUnknown || !hasProperYear || !hasProperAuthors) {
                  quality = 'NEEDS_WORK';
                }
              } else {
                quality = 'NO_CARDS';
              }
              
              tabResults[tabName] = {
                cardCount: cardCount,
                quality: quality
              };
              
              console.log(`   📑 ${tabName}: ${cardCount} cards, ${quality}`);
            } else {
              tabResults[tabName] = { cardCount: 0, quality: 'TAB_MISSING' };
              console.log(`   📑 ${tabName}: ❌ Tab not found`);
            }
          }
          
          // Overall assessment
          const allTabsExcellent = Object.values(tabResults).every(tab => tab.quality === 'EXCELLENT' && tab.cardCount > 0);
          const overallStatus = allTabsExcellent ? 'EXCELLENT' : 'NEEDS_WORK';
          
          results.push({
            ...supplement,
            enhanced: true,
            modalWorks: true,
            tabResults: tabResults,
            overallStatus: overallStatus
          });
          
          console.log(`   🎯 Overall Status: ${overallStatus === 'EXCELLENT' ? '🎉' : '🔧'} ${overallStatus}`);
          
        } else {
          results.push({
            ...supplement,
            enhanced: true,
            modalWorks: false,
            error: modalResult.error,
            overallStatus: 'MODAL_ERROR'
          });
          console.log(`   ❌ Modal Error: ${modalResult.error}`);
        }
      } else {
        results.push({
          ...supplement,
          enhanced: false,
          overallStatus: 'NOT_ENHANCED'
        });
        console.log(`   ❌ Not enhanced or missing data`);
      }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 PHASE 1 COMPLETION SUMMARY');
    console.log('='.repeat(60));
    
    const excellentCount = results.filter(r => r.overallStatus === 'EXCELLENT').length;
    const totalCount = results.length;
    const successRate = Math.round((excellentCount / totalCount) * 100);
    
    console.log(`\n✅ Successfully Enhanced: ${excellentCount}/${totalCount} supplements`);
    console.log(`📊 Success Rate: ${successRate}%`);
    
    console.log('\n📋 Detailed Results:');
    results.forEach(result => {
      const status = result.overallStatus === 'EXCELLENT' ? '🎉' : 
                    result.overallStatus === 'NOT_ENHANCED' ? '❌' : '🔧';
      console.log(`   ${status} ${result.name} (Tier ${result.tier}): ${result.overallStatus}`);
    });
    
    if (excellentCount === totalCount) {
      console.log('\n🏆 PHASE 1 COMPLETE! ALL SUPPLEMENTS WORKING PERFECTLY!');
      console.log('🚀 Ready to proceed to Phase 2 expansion');
    } else {
      console.log(`\n🔧 ${totalCount - excellentCount} supplements need attention before Phase 1 completion`);
    }
    
    // Coverage analysis
    const enhancedSupplementsTotal = await page.evaluate(() => {
      return window.app.supplements.filter(s => s.enhancedCitations?.isEnhanced).length;
    });
    
    console.log(`\n📈 Enhanced Citation Coverage: ${enhancedSupplementsTotal} total supplements enhanced`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Phase 1 verification complete');
  }
})();
