const { chromium } = require('playwright');

(async () => {
  console.log('🥇 Essential Nutrients Analysis - Phase 2C');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all supplements and check for essential nutrients
    const analysis = await page.evaluate(() => {
      const supplements = window.app.supplements || [];
      const enhanced = window.enhancedCitations || {};
      
      // Find supplements that are likely essential nutrients
      const nutrients = [];
      const enhanced_nutrients = [];
      const unenhanced_nutrients = [];
      
      supplements.forEach(supp => {
        const category = (supp.category || '').toLowerCase();
        const name = (supp.name || '').toLowerCase();
        
        // Check if it's an essential nutrient
        const isNutrient = category.includes('essential') ||
                          category.includes('vitamin') ||
                          category.includes('mineral') ||
                          name.includes('vitamin') ||
                          name.includes('magnesium') ||
                          name.includes('zinc') ||
                          name.includes('iron') ||
                          name.includes('calcium') ||
                          name.includes('omega-3') ||
                          name.includes('fish oil');
        
        if (isNutrient) {
          nutrients.push(supp);
          
          if (enhanced[supp.id]) {
            enhanced_nutrients.push(supp);
          } else {
            unenhanced_nutrients.push(supp);
          }
        }
      });
      
      return {
        total: nutrients.length,
        enhanced: enhanced_nutrients.length,
        unenhanced: unenhanced_nutrients.length,
        enhanced_list: enhanced_nutrients.map(s => ({ id: s.id, name: s.name, category: s.category, tier: s.evidenceTier })),
        unenhanced_list: unenhanced_nutrients.map(s => ({ id: s.id, name: s.name, category: s.category, tier: s.evidenceTier }))
      };
    });
    
    console.log('\n📊 ESSENTIAL NUTRIENTS STATUS');
    console.log('='.repeat(50));
    
    console.log(`\nOverall Status:`);
    console.log(`  Total Essential Nutrients: ${analysis.total}`);
    console.log(`  Enhanced: ${analysis.enhanced}`);
    console.log(`  Unenhanced: ${analysis.unenhanced}`);
    console.log(`  Coverage: ${Math.round((analysis.enhanced / analysis.total) * 100)}%`);
    
    console.log(`\n✅ Enhanced Essential Nutrients (${analysis.enhanced}):`);
    analysis.enhanced_list.forEach(supp => {
      console.log(`  • ${supp.name} (${supp.tier || 'No tier'}) - ${supp.category}`);
    });
    
    console.log(`\n❌ Unenhanced Essential Nutrients (${analysis.unenhanced}):`);
    analysis.unenhanced_list.forEach(supp => {
      console.log(`  • ${supp.name} (ID: ${supp.id}, ${supp.tier || 'No tier'}) - ${supp.category}`);
    });
    
    console.log(`\n🎯 PHASE 2C PLAN:`);
    if (analysis.unenhanced <= 5) {
      console.log(`  Quick completion possible - only ${analysis.unenhanced} nutrients remaining`);
      console.log(`  Timeline: 1 week to achieve 100% coverage`);
    } else {
      console.log(`  Systematic approach needed - ${analysis.unenhanced} nutrients to enhance`);
      console.log(`  Timeline: 2-3 weeks for complete coverage`);
    }
    
    console.log(`\n💡 NEXT STEPS:`);
    console.log(`  1. Create enhanced citations for unenhanced nutrients`);
    console.log(`  2. Focus on highest priority/tier nutrients first`);
    console.log(`  3. Leverage government nutrition databases`);
    console.log(`  4. Test and validate each enhancement`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Analysis complete');
  }
})();
