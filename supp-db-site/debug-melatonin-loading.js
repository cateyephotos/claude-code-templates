const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Melatonin Citation Loading...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check what Melatonin data is actually loaded
    const melatoninAnalysis = await page.evaluate(() => {
      const rawData = window.enhancedCitations?.[8];
      const supplement = window.app.supplements.find(s => s.id === 8);
      
      return {
        hasRawData: !!rawData,
        hasSupplementData: !!supplement,
        supplementName: supplement?.name,
        supplementEnhanced: !!supplement?.enhancedCitations?.isEnhanced,
        rawDataStructure: rawData ? Object.keys(rawData) : [],
        rawDataVersion: rawData?.version,
        rawDataSupplementName: rawData?.supplementName,
        rawDataIsEnhanced: rawData?.isEnhanced,
        citationStructure: rawData?.citations ? Object.keys(rawData.citations) : [],
        benefitsType: rawData?.citations?.benefits ? (Array.isArray(rawData.citations.benefits) ? 'array' : typeof rawData.citations.benefits) : 'missing',
        benefitsCount: rawData?.citations?.benefits?.length || 0,
        firstBenefitStructure: rawData?.citations?.benefits?.[0] ? Object.keys(rawData.citations.benefits[0]) : [],
        firstBenefitClaim: rawData?.citations?.benefits?.[0]?.claim || 'No claim found'
      };
    });
    
    console.log('📊 Melatonin Loading Analysis:');
    console.log(JSON.stringify(melatoninAnalysis, null, 2));
    
    // Check if the citation renderer is processing the data correctly
    const rendererTest = await page.evaluate(() => {
      const rawData = window.enhancedCitations?.[8];
      const renderer = window.app.citationRenderer;
      
      if (!rawData || !renderer) {
        return { error: 'Missing data or renderer' };
      }
      
      try {
        // Test benefits normalization specifically
        const benefits = rawData.citations?.benefits;
        if (!benefits) {
          return { error: 'No benefits found in raw data' };
        }
        
        const normalizedBenefits = renderer._normalizeBenefits(benefits);
        
        return {
          originalBenefitsCount: benefits.length,
          normalizedBenefitsCount: normalizedBenefits.length,
          firstOriginalBenefit: benefits[0],
          firstNormalizedBenefit: normalizedBenefits[0],
          normalizationSuccess: normalizedBenefits.length > 0
        };
      } catch (error) {
        return { error: 'Normalization failed: ' + error.message };
      }
    });
    
    console.log('\n🔧 Renderer Test Results:');
    console.log(JSON.stringify(rendererTest, null, 2));
    
    // Check what's actually being displayed in the modal
    console.log('\n🖱️ Testing modal display...');
    
    await page.fill('#searchInput', 'Melatonin');
    await page.waitForTimeout(1000);
    
    const modalResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(8);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (modalResult.success) {
      await page.waitForTimeout(1000);
      
      // Check what data is being passed to the renderer
      const modalData = await page.evaluate(() => {
        const supplement = window.app.supplements.find(s => s.id === 8);
        const enhancedData = window.enhancedCitations?.[8];
        
        return {
          modalSupplementName: supplement?.name,
          modalHasEnhanced: !!supplement?.enhancedCitations?.isEnhanced,
          modalEnhancedData: !!enhancedData,
          modalDataVersion: enhancedData?.version,
          modalBenefitsCount: enhancedData?.citations?.benefits?.length || 0
        };
      });
      
      console.log('\n📋 Modal Data Analysis:', modalData);
      
      // Check Benefits tab specifically
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(500);
        
        // Get the actual HTML content being rendered
        const benefitsContent = await page.evaluate(() => {
          const container = document.querySelector('.citation-content');
          const cards = document.querySelectorAll('.enhanced-citation-card');
          
          return {
            containerExists: !!container,
            cardCount: cards.length,
            firstCardHTML: cards[0] ? cards[0].innerHTML.substring(0, 500) : null,
            firstCardText: cards[0] ? cards[0].textContent.substring(0, 300) : null
          };
        });
        
        console.log('\n📄 Benefits Content Analysis:', benefitsContent);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Melatonin loading debug complete');
  }
})();
