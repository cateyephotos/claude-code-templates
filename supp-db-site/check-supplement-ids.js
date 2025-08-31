const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Checking Supplement ID Mappings');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get supplement ID mappings
    const supplementMappings = await page.evaluate(() => {
      const supplements = window.app.supplements || [];
      const mappings = {};
      
      supplements.forEach(supp => {
        mappings[supp.name] = supp.id;
      });
      
      return mappings;
    });
    
    console.log('\n📊 Supplement ID Mappings:');
    
    const targetSupplements = [
      'Alpha-Lipoic Acid',
      'Choline',
      'GABA', 
      'Inositol',
      'Iron',
      'Zinc'
    ];
    
    targetSupplements.forEach(name => {
      const id = supplementMappings[name];
      console.log(`   ${name}: ID ${id}`);
    });
    
    // Check what enhanced citation files exist for these IDs
    console.log('\n🔍 Checking Enhanced Citation Files:');
    
    const enhancedData = await page.evaluate(() => {
      const enhanced = {};
      if (window.enhancedCitations) {
        Object.keys(window.enhancedCitations).forEach(id => {
          const data = window.enhancedCitations[id];
          enhanced[id] = {
            name: data.name || data.supplementName,
            hasData: !!data.citations,
            version: data.version,
            isEnhanced: data.isEnhanced
          };
        });
      }
      return enhanced;
    });
    
    targetSupplements.forEach(name => {
      const id = supplementMappings[name];
      const hasEnhanced = enhancedData[id];
      console.log(`   ${name} (ID ${id}): ${hasEnhanced ? '✅ Has enhanced data' : '❌ No enhanced data'}`);
      if (hasEnhanced) {
        console.log(`      Name: ${hasEnhanced.name}, Version: ${hasEnhanced.version || 'N/A'}`);
      }
    });
    
    // Show all enhanced citations that ARE loaded
    console.log('\n📋 All Currently Loaded Enhanced Citations:');
    Object.entries(enhancedData).forEach(([id, data]) => {
      console.log(`   ID ${id}: ${data.name} ${data.version ? `(v${data.version})` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ ID mapping check complete');
  }
})();
