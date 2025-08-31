const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Finding Phase 1 Supplement IDs...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const targetSupplements = ['Vitamin C', 'Vitamin E', 'Whey Protein'];
  const results = [];
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    for (const supplementName of targetSupplements) {
      console.log(`\n🔍 Searching for: ${supplementName}`);
      
      await page.fill('#searchInput', supplementName);
      await page.waitForTimeout(1000);
      
      const supplementInfo = await page.evaluate((name) => {
        const allSupplements = window.app.supplements;
        const supplement = allSupplements.find(s => 
          s.name.toLowerCase().includes(name.toLowerCase()) ||
          s.name.toLowerCase() === name.toLowerCase()
        );
        
        if (!supplement) {
          return { error: `${name} supplement not found` };
        }
        
        return {
          id: supplement.id,
          name: supplement.name,
          category: supplement.category,
          evidenceTier: supplement.evidenceTier,
          hasEnhancedCitations: !!supplement.enhancedCitations?.isEnhanced
        };
      }, supplementName);
      
      console.log(`📊 ${supplementName}:`, supplementInfo);
      results.push({ target: supplementName, ...supplementInfo });
    }
    
    console.log('\n📋 PHASE 1 SUPPLEMENT SUMMARY:');
    results.forEach(result => {
      if (!result.error) {
        console.log(`   ${result.target}: ID ${result.id}, Tier ${result.evidenceTier}, Enhanced: ${result.hasEnhancedCitations ? 'Yes' : 'No'}`);
      } else {
        console.log(`   ${result.target}: ${result.error}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Phase 1 supplement search complete');
  }
})();
