const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Analyzing Problem Supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const problemSupplements = [
    { id: 8, name: 'Melatonin', issues: 7, type: 'undefined' },
    { id: 9, name: 'L-Theanine', issues: 7, type: 'undefined' },
    { id: 89, name: 'Pterostilbene', issues: 3, type: 'undefined' }
  ];
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    for (const supplement of problemSupplements) {
      console.log(`\n🔍 Analyzing: ${supplement.name} (ID: ${supplement.id})`);
      
      // Get the raw citation data
      const rawAnalysis = await page.evaluate((suppId) => {
        const rawData = window.enhancedCitations[suppId];
        if (!rawData) {
          return { error: 'No enhanced citation data found' };
        }
        
        const analysis = {
          hasRawData: true,
          citationSections: Object.keys(rawData.citations || {}),
          sampleMechanism: null,
          sampleBenefit: null,
          sampleSafety: null
        };
        
        // Get sample data from each section
        if (rawData.citations?.mechanisms?.[0]) {
          const mech = rawData.citations.mechanisms[0];
          analysis.sampleMechanism = {
            keys: Object.keys(mech),
            hasStudies: !!(mech.studies && mech.studies.length > 0),
            firstStudy: mech.studies?.[0] || null,
            claim: mech.claim || mech.title || 'No claim'
          };
        }
        
        if (rawData.citations?.benefits?.[0]) {
          const benefit = rawData.citations.benefits[0];
          analysis.sampleBenefit = {
            keys: Object.keys(benefit),
            hasStudies: !!(benefit.studies && benefit.studies.length > 0),
            firstStudy: benefit.studies?.[0] || null,
            claim: benefit.claim || benefit.title || 'No claim'
          };
        }
        
        if (rawData.citations?.safety?.[0]) {
          const safety = rawData.citations.safety[0];
          analysis.sampleSafety = {
            keys: Object.keys(safety),
            hasStudies: !!(safety.studies && safety.studies.length > 0),
            firstStudy: safety.studies?.[0] || null,
            claim: safety.claim || safety.title || 'No claim'
          };
        }
        
        return analysis;
      }, supplement.id);
      
      console.log('📊 Raw Data Analysis:');
      console.log(JSON.stringify(rawAnalysis, null, 2));
      
      // Test the actual rendering to see what's wrong
      console.log('\n🖱️ Testing modal rendering...');
      
      const modalResult = await page.evaluate(async (suppId) => {
        try {
          await window.app.showSupplementDetails(suppId);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, supplement.id);
      
      if (modalResult.success) {
        await page.waitForTimeout(1000);
        
        // Check mechanisms tab
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        if (await mechanismsTab.count() > 0) {
          await mechanismsTab.click();
          await page.waitForTimeout(500);
          
          const citationCards = await page.locator('.enhanced-citation-card');
          const cardCount = await citationCards.count();
          
          console.log(`📄 Mechanisms tab: ${cardCount} cards`);
          
          if (cardCount > 0) {
            const firstCardText = await citationCards.first().textContent();
            console.log('📋 First card text:');
            console.log(firstCardText.substring(0, 300) + '...');
            
            if (firstCardText.includes('undefined')) {
              console.log('❌ Found "undefined" in rendered text');
              
              // Get the HTML to see the structure
              const firstCardHTML = await citationCards.first().innerHTML();
              console.log('📋 First card HTML:');
              console.log(firstCardHTML.substring(0, 500) + '...');
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
  }
})();
