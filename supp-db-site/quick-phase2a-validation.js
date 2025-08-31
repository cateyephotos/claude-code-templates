const { chromium } = require('playwright');

(async () => {
  console.log('🎯 Phase 2A Quality Fixes - Final Validation');
  console.log('Testing all 5 target supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const testSupplements = [
      { id: 61, name: 'Chromium', issue: 'Undefined values' },
      { id: 38, name: 'Iron', issue: 'Undefined values' },
      { id: 37, name: 'Zinc', issue: 'Undefined values' },
      { id: 25, name: 'GABA', issue: 'Missing enhanced data' },
      { id: 26, name: 'Inositol', issue: 'Missing enhanced data' }
    ];
    
    let fixedCount = 0;
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing: ${supplement.name} (${supplement.issue})`);
      
      // Check if enhanced data exists
      const hasData = await page.evaluate((suppId) => {
        return !!window.enhancedCitations?.[suppId];
      }, supplement.id);
      
      if (!hasData) {
        console.log(`   ❌ No enhanced citation data`);
        continue;
      }
      
      console.log(`   ✅ Enhanced data loaded`);
      
      // Test modal and check for undefined values
      await page.fill('#searchInput', supplement.name);
      await page.waitForTimeout(500);
      
      const modalResult = await page.evaluate(async (suppId) => {
        try {
          await window.app.showSupplementDetails(suppId);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, supplement.id);
      
      if (!modalResult.success) {
        console.log(`   ❌ Modal error: ${modalResult.error}`);
        continue;
      }
      
      await page.waitForTimeout(500);
      
      // Check Benefits tab for undefined values
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(300);
        
        const undefinedCheck = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container || container.classList.contains('hidden')) {
            return { error: 'Benefits container not accessible' };
          }
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const hasUndefined = cards.some(card => card.textContent.includes('undefined'));
          
          return {
            cardCount: cards.length,
            hasUndefined: hasUndefined
          };
        }, supplement.id);
        
        if (undefinedCheck.error) {
          console.log(`   ❌ ${undefinedCheck.error}`);
        } else if (undefinedCheck.hasUndefined) {
          console.log(`   ❌ Still contains undefined values (${undefinedCheck.cardCount} cards)`);
        } else {
          console.log(`   ✅ No undefined values found (${undefinedCheck.cardCount} cards)`);
          fixedCount++;
        }
      } else {
        console.log(`   ❌ Benefits tab not found`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PHASE 2A COMPLETION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n🎯 Target Issues:`);
    console.log(`   • Fix undefined values in Chromium, Iron, Zinc`);
    console.log(`   • Create enhanced citations for GABA, Inositol`);
    
    console.log(`\n📈 Results:`);
    console.log(`   Fixed supplements: ${fixedCount}/${testSupplements.length}`);
    console.log(`   Success rate: ${Math.round((fixedCount / testSupplements.length) * 100)}%`);
    
    if (fixedCount === testSupplements.length) {
      console.log(`\n🎉 PHASE 2A SUCCESSFULLY COMPLETED!`);
      console.log(`\n✅ Achievements:`);
      console.log(`   • All undefined values eliminated`);
      console.log(`   • All missing enhanced citations created`);
      console.log(`   • Smart Citation Renderer improved`);
      console.log(`   • Data structure compatibility enhanced`);
      
      console.log(`\n🚀 READY FOR PHASE 2B: TIER 2 EXPANSION`);
      console.log(`   Next targets:`);
      console.log(`   • Systematic Tier 2 supplement enhancement`);
      console.log(`   • Target: 80% Tier 2 coverage`);
      console.log(`   • Focus on Essential Nutrients, Amino Acids, Nootropics`);
      
    } else {
      console.log(`\n⚠️ Phase 2A needs additional work:`);
      console.log(`   ${testSupplements.length - fixedCount} supplements still need fixes`);
      
      testSupplements.forEach((supplement, index) => {
        if (index >= fixedCount) {
          console.log(`   • ${supplement.name}: ${supplement.issue}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Validation error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Phase 2A validation complete');
  }
})();
