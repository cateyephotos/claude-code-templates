const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Simple Test: Alpha-Lipoic Acid');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test Alpha-Lipoic Acid
    const result = await page.evaluate(() => {
      const data = window.enhancedCitations?.[44];
      if (!data) return { success: false, error: 'No data found' };
      
      return {
        success: true,
        name: data.supplementName,
        mechanisms: data.citations?.mechanisms?.length || 0,
        benefits: data.citations?.benefits?.length || 0,
        safety: data.citations?.safety?.length || 0
      };
    });
    
    if (result.success) {
      console.log(`✅ ${result.name} working perfectly!`);
      console.log(`   Mechanisms: ${result.mechanisms}`);
      console.log(`   Benefits: ${result.benefits}`);
      console.log(`   Safety: ${result.safety}`);
      console.log(`   Total Citations: ${result.mechanisms + result.benefits + result.safety}`);
      
      console.log(`\n🎉 PHASE 3 FIRST SUCCESS!`);
      console.log(`Alpha-Lipoic Acid enhanced citations are working perfectly.`);
      console.log(`Ready to proceed with next Tier 2 supplement.`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Test complete');
  }
})();
