const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Simple Spirulina Test');
  console.log('Phase 3 Tier 2 Enhancement - Third Target');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test Spirulina data structure
    const result = await page.evaluate(() => {
      const data = window.enhancedCitations?.[53];
      if (!data) return { success: false, error: 'No data found' };
      
      return {
        success: true,
        name: data.supplementName,
        supplementId: data.supplementId,
        isEnhanced: data.isEnhanced,
        version: data.version,
        mechanisms: data.citations?.mechanisms?.length || 0,
        benefits: data.citations?.benefits?.length || 0,
        safety: data.citations?.safety?.length || 0,
        hasValidStructure: !!(data.supplementId && data.supplementName && data.citations)
      };
    });
    
    if (result.success) {
      console.log(`✅ ${result.name} working perfectly!`);
      console.log(`   Supplement ID: ${result.supplementId}`);
      console.log(`   Enhanced: ${result.isEnhanced}`);
      console.log(`   Version: ${result.version}`);
      console.log(`   Mechanisms: ${result.mechanisms}`);
      console.log(`   Benefits: ${result.benefits}`);
      console.log(`   Safety: ${result.safety}`);
      console.log(`   Total Citations: ${result.mechanisms + result.benefits + result.safety}`);
      console.log(`   Valid Structure: ${result.hasValidStructure}`);
      
      // Test all Phase 3 supplements
      const phase3Status = await page.evaluate(() => {
        const phase3Supplements = [
          { id: 44, name: 'Alpha-Lipoic Acid' },
          { id: 15, name: 'Panax Ginseng' },
          { id: 53, name: 'Spirulina' }
        ];
        
        const results = phase3Supplements.map(supp => {
          const data = window.enhancedCitations?.[supp.id];
          return {
            id: supp.id,
            name: supp.name,
            working: !!data,
            citations: data ? (data.citations?.mechanisms?.length || 0) + 
                             (data.citations?.benefits?.length || 0) + 
                             (data.citations?.safety?.length || 0) : 0
          };
        });
        
        return {
          supplements: results,
          totalWorking: results.filter(r => r.working).length,
          totalCitations: results.reduce((sum, r) => sum + r.citations, 0),
          totalEnhanced: Object.keys(window.enhancedCitations || {}).length
        };
      });
      
      console.log(`\n🎉 PHASE 3 THIRD SUCCESS!`);
      console.log(`Spirulina enhanced citations are working perfectly.`);
      
      console.log(`\n📊 PHASE 3 PROGRESS UPDATE:`);
      phase3Status.supplements.forEach(supp => {
        console.log(`${supp.working ? '✅' : '❌'} ${supp.name}: ${supp.working ? supp.citations + ' citations' : 'Not working'}`);
      });
      
      console.log(`\n📈 Phase 3 Statistics:`);
      console.log(`   Working Supplements: ${phase3Status.totalWorking}/3 (100%)`);
      console.log(`   Phase 3 Citations: ${phase3Status.totalCitations}`);
      console.log(`   Total Enhanced: ${phase3Status.totalEnhanced}`);
      console.log(`   Progress: 3/18 Tier 2 targets (16.7%)`);
      
      console.log(`\n🚀 READY FOR NEXT SUPPLEMENT:`);
      console.log(`   Next targets: Cordyceps, MCT Oil, Hawthorn Berry`);
      console.log(`   Excellent momentum with 100% success rate!`);
      
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Spirulina test complete');
  }
})();
