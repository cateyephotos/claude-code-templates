const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Testing Alpha-Lipoic Acid Enhanced Citations');
  console.log('Phase 3 Tier 2 Enhancement - First Target');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const supplementId = 44;
    const supplementName = 'Alpha-Lipoic Acid';
    
    console.log(`\n🔍 Testing: ${supplementName} (ID: ${supplementId})`);
    
    // Check if enhanced data exists
    const hasData = await page.evaluate((suppId) => {
      return !!window.enhancedCitations?.[suppId];
    }, supplementId);
    
    if (!hasData) {
      console.log(`❌ No enhanced citation data found`);
      return;
    }
    
    console.log(`✅ Enhanced data loaded`);
    
    // Get data structure analysis
    const dataAnalysis = await page.evaluate((suppId) => {
      const data = window.enhancedCitations?.[suppId];
      if (!data) return { error: 'No data found' };
      
      return {
        supplementName: data.supplementName,
        version: data.version,
        lastUpdated: data.lastUpdated,
        citationCounts: {
          mechanisms: data.citations?.mechanisms?.length || 0,
          benefits: data.citations?.benefits?.length || 0,
          safety: data.citations?.safety?.length || 0
        }
      };
    }, supplementId);
    
    console.log(`📊 Data Structure:`);
    console.log(`   Name: ${dataAnalysis.supplementName}`);
    console.log(`   Version: ${dataAnalysis.version}`);
    console.log(`   Last Updated: ${dataAnalysis.lastUpdated}`);
    console.log(`   Citation Counts:`);
    console.log(`     Mechanisms: ${dataAnalysis.citationCounts.mechanisms}`);
    console.log(`     Benefits: ${dataAnalysis.citationCounts.benefits}`);
    console.log(`     Safety: ${dataAnalysis.citationCounts.safety}`);
    
    // Test modal functionality
    await page.fill('#searchInput', supplementName);
    await page.waitForTimeout(500);
    
    const modalResult = await page.evaluate(async (suppId) => {
      try {
        await window.app.showSupplementDetails(suppId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, supplementId);
    
    if (!modalResult.success) {
      console.log(`❌ Modal error: ${modalResult.error}`);
      return;
    }
    
    console.log(`✅ Modal opened successfully`);
    await page.waitForTimeout(500);
    
    // Test all tabs
    const tabs = ['Benefits', 'Mechanisms', 'Safety'];
    let allTabsWorking = true;
    
    for (const tabName of tabs) {
      const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
      if (await tab.count() > 0) {
        await tab.click();
        await page.waitForTimeout(300);
        
        const tabAnalysis = await page.evaluate((suppId, tabName) => {
          const containerId = `${tabName.toLowerCase()}-${suppId}`;
          const container = document.getElementById(containerId);
          if (!container || container.classList.contains('hidden')) {
            return { error: `${tabName} container not accessible` };
          }
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const undefinedIssues = [];
          
          cards.forEach((card, index) => {
            const text = card.textContent;
            if (text.includes('undefined')) {
              const undefinedMatches = text.match(/undefined/g) || [];
              undefinedIssues.push({
                cardIndex: index,
                undefinedCount: undefinedMatches.length
              });
            }
          });
          
          return {
            totalCards: cards.length,
            undefinedCards: undefinedIssues.length,
            issues: undefinedIssues
          };
        }, supplementId, tabName);
        
        if (tabAnalysis.error) {
          console.log(`   ❌ ${tabAnalysis.error}`);
          allTabsWorking = false;
        } else if (tabAnalysis.undefinedCards > 0) {
          console.log(`   ❌ ${tabName}: ${tabAnalysis.undefinedCards} cards with undefined values`);
          allTabsWorking = false;
        } else if (tabAnalysis.totalCards === 0) {
          console.log(`   ❌ ${tabName}: No cards found`);
          allTabsWorking = false;
        } else {
          console.log(`   ✅ ${tabName}: ${tabAnalysis.totalCards} cards working perfectly`);
        }
      } else {
        console.log(`   ❌ ${tabName} tab not found`);
        allTabsWorking = false;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ALPHA-LIPOIC ACID TEST RESULTS');
    console.log('='.repeat(60));
    
    if (allTabsWorking) {
      console.log(`\n🎉 PERFECT SUCCESS!`);
      console.log(`✅ Enhanced data loaded correctly`);
      console.log(`✅ Modal functionality working`);
      console.log(`✅ All tabs rendering properly`);
      console.log(`✅ No undefined values found`);
      console.log(`✅ ${dataAnalysis.citationCounts.mechanisms + dataAnalysis.citationCounts.benefits + dataAnalysis.citationCounts.safety} total citations working`);
      
      console.log(`\n🚀 PHASE 3 PROGRESS:`);
      console.log(`✅ Alpha-Lipoic Acid: COMPLETE (1/18 Tier 2 targets)`);
      console.log(`📈 Progress: 5.6% of Phase 3 targets complete`);
      console.log(`🎯 Next: Panax Ginseng (ID: 15) - Adaptogen`);
      
      console.log(`\n💡 READY FOR NEXT SUPPLEMENT:`);
      console.log(`Alpha-Lipoic Acid is working perfectly!`);
      console.log(`Ready to proceed with next Tier 2 supplement.`);
      
    } else {
      console.log(`\n❌ ISSUES FOUND:`);
      console.log(`Alpha-Lipoic Acid needs fixes before proceeding.`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Alpha-Lipoic Acid testing complete');
  }
})();
