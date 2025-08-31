const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Melatonin Citation Data...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get detailed Melatonin data
    const melatoninData = await page.evaluate(() => {
      const rawData = window.enhancedCitations[8]; // Melatonin ID
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
      
      // Get first mechanism with evidence
      if (rawData.citations?.mechanisms?.[0]) {
        const mech = rawData.citations.mechanisms[0];
        analysis.mechanismSample = {
          mechanism: mech.mechanism,
          hasEvidence: !!(mech.evidence && mech.evidence.length > 0),
          evidenceCount: mech.evidence?.length || 0,
          firstEvidence: mech.evidence?.[0] || null,
          allKeys: Object.keys(mech)
        };
      }
      
      // Get first benefit with evidence
      if (rawData.citations?.benefits?.[0]) {
        const benefit = rawData.citations.benefits[0];
        analysis.benefitSample = {
          claim: benefit.claim,
          citation: benefit.citation,
          hasAllFields: !!(benefit.claim && benefit.citation && benefit.doi),
          allKeys: Object.keys(benefit)
        };
      }
      
      // Get first safety with evidence
      if (rawData.citations?.safety?.[0]) {
        const safety = rawData.citations.safety[0];
        analysis.safetySample = {
          claim: safety.claim,
          citation: safety.citation,
          hasAllFields: !!(safety.claim && safety.citation),
          allKeys: Object.keys(safety)
        };
      }
      
      return analysis;
    });
    
    console.log('📊 Melatonin Data Analysis:');
    console.log(JSON.stringify(melatoninData, null, 2));
    
    // Test the citation extraction
    if (melatoninData.benefitSample?.citation) {
      const extractionTest = await page.evaluate((citation) => {
        // Test the extraction methods
        const renderer = window.app.citationRenderer;
        
        return {
          originalCitation: citation,
          extractedAuthors: renderer._extractAuthorsFromCitation(citation),
          extractedYear: renderer._extractYearFromCitation(citation)
        };
      }, melatoninData.benefitSample.citation);
      
      console.log('\n🔧 Citation Extraction Test:');
      console.log(JSON.stringify(extractionTest, null, 2));
    }
    
    // Test the normalization process
    if (melatoninData.mechanismSample?.firstEvidence) {
      const normalizationTest = await page.evaluate((evidence) => {
        const renderer = window.app.citationRenderer;
        
        // Test the normalization
        const normalized = renderer._normalizeStudies([evidence]);
        
        return {
          originalEvidence: evidence,
          normalizedStudy: normalized[0] || null
        };
      }, melatoninData.mechanismSample.firstEvidence);
      
      console.log('\n🔧 Normalization Test:');
      console.log(JSON.stringify(normalizationTest, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
})();
