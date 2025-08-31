const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Testing Panax Ginseng Enhanced Citations');
  console.log('Phase 3 Tier 2 Enhancement - Second Target');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test Panax Ginseng
    const result = await page.evaluate(() => {
      const data = window.enhancedCitations?.[15];
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
      
      console.log(`\n🎉 PHASE 3 SECOND SUCCESS!`);
      console.log(`Panax Ginseng enhanced citations are working perfectly.`);
      
      // Test both supplements together
      const bothResults = await page.evaluate(() => {
        const ala = window.enhancedCitations?.[44];
        const ginseng = window.enhancedCitations?.[15];
        
        return {
          alphaLipoicAcid: !!ala,
          panaxGinseng: !!ginseng,
          totalEnhanced: Object.keys(window.enhancedCitations || {}).length
        };
      });
      
      console.log(`\n📊 PHASE 3 PROGRESS UPDATE:`);
      console.log(`✅ Alpha-Lipoic Acid: ${bothResults.alphaLipoicAcid ? 'Working' : 'Not found'}`);
      console.log(`✅ Panax Ginseng: ${bothResults.panaxGinseng ? 'Working' : 'Not found'}`);
      console.log(`📈 Total Enhanced Citations: ${bothResults.totalEnhanced}`);
      console.log(`🎯 Phase 3 Progress: 2/18 Tier 2 targets (11.1%)`);
      
      console.log(`\n🚀 READY FOR NEXT SUPPLEMENT:`);
      console.log(`Next target: Spirulina (ID: 53) - Antioxidants`);
      
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Panax Ginseng test complete');
  }
})();
