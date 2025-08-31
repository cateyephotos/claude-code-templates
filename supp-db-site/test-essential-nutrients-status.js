const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Testing Essential Nutrients Status');
  console.log('Checking which nutrients are actually working...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const targetNutrients = [
      { id: 21, name: 'Vitamin B12' },
      { id: 22, name: 'Vitamin B6' },
      { id: 62, name: 'Vanadium' },
      { id: 87, name: 'Krill Oil' }
    ];
    
    let workingCount = 0;
    
    for (const nutrient of targetNutrients) {
      console.log(`\n🔍 Testing: ${nutrient.name} (ID: ${nutrient.id})`);
      
      // Check if enhanced data exists
      const hasData = await page.evaluate((suppId) => {
        return !!window.enhancedCitations?.[suppId];
      }, nutrient.id);
      
      if (!hasData) {
        console.log(`   ❌ No enhanced citation data found`);
        continue;
      }
      
      console.log(`   ✅ Enhanced data loaded`);
      
      // Test modal functionality
      await page.fill('#searchInput', nutrient.name);
      await page.waitForTimeout(500);
      
      const modalResult = await page.evaluate(async (suppId) => {
        try {
          await window.app.showSupplementDetails(suppId);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, nutrient.id);
      
      if (!modalResult.success) {
        console.log(`   ❌ Modal error: ${modalResult.error}`);
        continue;
      }
      
      console.log(`   ✅ Modal working`);
      await page.waitForTimeout(500);
      
      // Check Benefits tab
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(300);
        
        const benefitsCheck = await page.evaluate((suppId) => {
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
        }, nutrient.id);
        
        if (benefitsCheck.error) {
          console.log(`   ❌ ${benefitsCheck.error}`);
        } else if (benefitsCheck.hasUndefined) {
          console.log(`   ❌ Contains undefined values (${benefitsCheck.cardCount} cards)`);
        } else if (benefitsCheck.cardCount === 0) {
          console.log(`   ❌ No benefit cards found`);
        } else {
          console.log(`   ✅ Benefits working (${benefitsCheck.cardCount} cards)`);
          workingCount++;
        }
      } else {
        console.log(`   ❌ Benefits tab not found`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ESSENTIAL NUTRIENTS TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\nWorking nutrients: ${workingCount}/${targetNutrients.length}`);
    console.log(`Success rate: ${Math.round((workingCount / targetNutrients.length) * 100)}%`);
    
    const needToCreate = targetNutrients.length - workingCount;
    
    if (needToCreate > 0) {
      console.log(`\n🎯 NEXT STEPS:`);
      console.log(`   Need to create/fix: ${needToCreate} enhanced citations`);
      console.log(`   Focus on nutrients that aren't working properly`);
      console.log(`   Use standard enhanced citation format`);
    } else {
      console.log(`\n🎉 ALL ESSENTIAL NUTRIENTS WORKING!`);
      console.log(`   100% Essential Nutrients coverage achieved`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Essential nutrients testing complete');
  }
})();
