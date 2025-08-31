const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Tab Separation Across Multiple Supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testSupplements = [
    { id: 8, name: 'Melatonin' },
    { id: 50, name: 'Caffeine' },
    { id: 28, name: 'Glucosamine' }
  ];
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing: ${supplement.name} (ID: ${supplement.id})`);
      
      // Get expected counts from raw data
      const expectedCounts = await page.evaluate((suppId) => {
        const data = window.enhancedCitations?.[suppId];
        if (!data) return { error: 'No data found' };
        
        return {
          mechanisms: data.citations?.mechanisms?.length || 0,
          benefits: data.citations?.benefits?.length || 0,
          safety: data.citations?.safety?.length || 0
        };
      }, supplement.id);
      
      console.log(`   Expected: Mechanisms(${expectedCounts.mechanisms}), Benefits(${expectedCounts.benefits}), Safety(${expectedCounts.safety})`);
      
      // Search and open modal
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
      
      if (!modalResult.success) {
        console.log(`   ❌ Modal failed: ${modalResult.error}`);
        continue;
      }
      
      await page.waitForTimeout(1000);
      
      // Test each tab
      const tabs = ['Mechanisms', 'Benefits', 'Safety'];
      const actualCounts = {};
      
      for (const tabName of tabs) {
        const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
        if (await tab.count() > 0) {
          await tab.click();
          await page.waitForTimeout(500);
          
          const cardCount = await page.locator('.enhanced-citation-card').count();
          actualCounts[tabName.toLowerCase()] = cardCount;
          
          console.log(`   ${tabName}: ${cardCount} cards`);
        }
      }
      
      // Check for mismatches
      const mechanismMatch = actualCounts.mechanisms === expectedCounts.mechanisms;
      const benefitMatch = actualCounts.benefits === expectedCounts.benefits;
      const safetyMatch = actualCounts.safety === expectedCounts.safety;
      
      console.log(`   Matches: Mechanisms(${mechanismMatch ? '✅' : '❌'}), Benefits(${benefitMatch ? '✅' : '❌'}), Safety(${safetyMatch ? '✅' : '❌'})`);
      
      if (!mechanismMatch || !benefitMatch || !safetyMatch) {
        console.log(`   ⚠️ TAB SEPARATION ISSUE DETECTED`);
      } else {
        console.log(`   ✅ Tab separation working correctly`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Tab separation test complete');
  }
})();
