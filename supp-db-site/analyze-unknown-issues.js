const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Analyzing "Unknown" Issues in Enhanced Citations...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const unknownSupplements = [
    { id: 40, name: 'GABA', issues: 5 },
    { id: 44, name: 'Alpha-Lipoic Acid', issues: 5 },
    { id: 45, name: 'Lutein', issues: 5 },
    { id: 37, name: 'Zinc', issues: 4 },
    { id: 38, name: 'Iron', issues: 4 }
  ];
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    for (const supplement of unknownSupplements) {
      console.log(`\n🔍 Analyzing: ${supplement.name} (ID: ${supplement.id})`);
      
      // Get the raw citation data structure
      const dataAnalysis = await page.evaluate((suppId) => {
        const rawData = window.enhancedCitations[suppId];
        if (!rawData) {
          return { error: 'No enhanced citation data found' };
        }
        
        const analysis = {
          hasData: true,
          sections: Object.keys(rawData.citations || {}),
          mechanismSample: null,
          benefitSample: null,
          safetySample: null
        };
        
        // Analyze mechanisms
        if (rawData.citations?.mechanisms?.[0]) {
          const mech = rawData.citations.mechanisms[0];
          analysis.mechanismSample = {
            keys: Object.keys(mech),
            hasEvidence: !!(mech.evidence && mech.evidence.length > 0),
            evidenceCount: mech.evidence?.length || 0,
            firstEvidence: mech.evidence?.[0] || null,
            mechanismText: mech.mechanism || mech.title || 'No mechanism text'
          };
        }
        
        // Analyze benefits
        if (rawData.citations?.benefits?.[0]) {
          const benefit = rawData.citations.benefits[0];
          analysis.benefitSample = {
            keys: Object.keys(benefit),
            hasEvidence: !!(benefit.evidence && benefit.evidence.length > 0),
            evidenceCount: benefit.evidence?.length || 0,
            firstEvidence: benefit.evidence?.[0] || null,
            claimText: benefit.claim || benefit.title || 'No claim text'
          };
        }
        
        // Analyze safety
        if (rawData.citations?.safety?.[0]) {
          const safety = rawData.citations.safety[0];
          analysis.safetySample = {
            keys: Object.keys(safety),
            hasEvidence: !!(safety.evidence && safety.evidence.length > 0),
            evidenceCount: safety.evidence?.length || 0,
            firstEvidence: safety.evidence?.[0] || null,
            claimText: safety.claim || safety.title || 'No claim text'
          };
        }
        
        return analysis;
      }, supplement.id);
      
      console.log('📊 Data Structure Analysis:');
      console.log(JSON.stringify(dataAnalysis, null, 2));
      
      // Test the actual rendering to see the "unknown" issues
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
        
        // Check mechanisms tab for "unknown" issues
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        if (await mechanismsTab.count() > 0) {
          await mechanismsTab.click();
          await page.waitForTimeout(500);
          
          const citationCards = await page.locator('.enhanced-citation-card');
          const cardCount = await citationCards.count();
          
          console.log(`📄 Mechanisms tab: ${cardCount} cards`);
          
          if (cardCount > 0) {
            const firstCardText = await citationCards.first().textContent();
            console.log('📋 First mechanisms card:');
            console.log(firstCardText.substring(0, 400) + '...');
            
            // Check for "unknown" issues
            const hasUnknown = firstCardText.toLowerCase().includes('unknown');
            const hasLevel4 = firstCardText.includes('Level 4');
            const hasPlaceholder = firstCardText.includes('Study finding') || 
                                 firstCardText.includes('Unknown authors') ||
                                 firstCardText.includes('Unknown journal');
            
            console.log(`${hasUnknown ? '❌' : '✅'} Unknown values: ${hasUnknown ? 'Found' : 'None'}`);
            console.log(`${hasLevel4 ? '⚠️' : '✅'} Evidence level: ${hasLevel4 ? 'Level 4 (default)' : 'Proper level'}`);
            console.log(`${hasPlaceholder ? '❌' : '✅'} Placeholder data: ${hasPlaceholder ? 'Found' : 'None'}`);
            
            if (hasUnknown || hasPlaceholder) {
              console.log('🔧 This supplement needs data completion/normalization fixes');
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Unknown issues analysis complete');
  }
})();
