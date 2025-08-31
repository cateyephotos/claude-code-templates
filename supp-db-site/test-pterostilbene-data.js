const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Analyzing Pterostilbene Data Structure...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get detailed Pterostilbene data
    const pterostilbeneData = await page.evaluate(() => {
      const rawData = window.enhancedCitations[89]; // Pterostilbene ID
      if (!rawData) {
        return { error: 'No data found' };
      }
      
      const analysis = {
        hasData: true,
        sections: Object.keys(rawData.citations || {}),
        mechanismSample: null,
        benefitSample: null,
        safetySample: null
      };
      
      // Get first mechanism
      if (rawData.citations?.mechanisms?.[0]) {
        const mech = rawData.citations.mechanisms[0];
        analysis.mechanismSample = {
          allKeys: Object.keys(mech),
          mechanism: mech.mechanism,
          hasEvidence: !!(mech.evidence && mech.evidence.length > 0),
          evidenceCount: mech.evidence?.length || 0,
          firstEvidence: mech.evidence?.[0] || null,
          // Check if it's direct data (not nested evidence)
          hasDirectData: !!(mech.journal || mech.year || mech.doi),
          directFields: {
            journal: mech.journal,
            year: mech.year,
            doi: mech.doi,
            keyFindings: mech.keyFindings
          }
        };
      }
      
      // Get first benefit
      if (rawData.citations?.benefits?.[0]) {
        const benefit = rawData.citations.benefits[0];
        analysis.benefitSample = {
          allKeys: Object.keys(benefit),
          hasDirectData: !!(benefit.journal || benefit.year || benefit.doi),
          directFields: {
            healthDomain: benefit.healthDomain,
            specificClaim: benefit.specificClaim,
            journal: benefit.journal,
            year: benefit.year,
            doi: benefit.doi,
            keyFindings: benefit.keyFindings
          }
        };
      }
      
      return analysis;
    });
    
    console.log('📊 Pterostilbene Data Analysis:');
    console.log(JSON.stringify(pterostilbeneData, null, 2));
    
    // Test normalization
    if (pterostilbeneData.mechanismSample) {
      const normalizationTest = await page.evaluate((mechData) => {
        const renderer = window.app.citationRenderer;
        
        // Test normalizing the mechanism directly (not its evidence)
        const normalized = renderer._normalizeStudies([mechData]);
        
        return {
          originalMechanism: mechData,
          normalizedStudy: normalized[0] || null
        };
      }, pterostilbeneData.mechanismSample.directFields);
      
      console.log('\n🔧 Direct Mechanism Normalization Test:');
      console.log(JSON.stringify(normalizationTest, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
})();
