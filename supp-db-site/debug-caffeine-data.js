const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Caffeine Data Processing...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get the raw caffeine data
    const caffeineDataAnalysis = await page.evaluate(() => {
      const rawData = window.enhancedCitations[50];
      if (!rawData) {
        return { error: 'No caffeine data found' };
      }
      
      return {
        hasData: true,
        supplementId: rawData.supplementId,
        supplementName: rawData.supplementName,
        isEnhanced: rawData.isEnhanced,
        citationSections: Object.keys(rawData.citations || {}),
        mechanismsSample: {
          count: rawData.citations?.mechanisms?.length || 0,
          firstMechanism: rawData.citations?.mechanisms?.[0] || null,
          firstMechanismKeys: rawData.citations?.mechanisms?.[0] ? Object.keys(rawData.citations.mechanisms[0]) : []
        },
        benefitsSample: {
          count: rawData.citations?.benefits?.length || 0,
          firstBenefit: rawData.citations?.benefits?.[0] || null,
          firstBenefitKeys: rawData.citations?.benefits?.[0] ? Object.keys(rawData.citations.benefits[0]) : []
        }
      };
    });
    
    console.log('📊 Raw Caffeine Data Analysis:');
    console.log(JSON.stringify(caffeineDataAnalysis, null, 2));
    
    // Test the normalization process
    const normalizationTest = await page.evaluate(() => {
      const rawData = window.enhancedCitations[50];
      const renderer = window.app.citationRenderer;
      
      if (!rawData || !renderer) {
        return { error: 'Missing data or renderer' };
      }
      
      // Test mechanism normalization
      const mechanisms = rawData.citations.mechanisms;
      const normalizedMechanisms = renderer._normalizeMechanisms(mechanisms);
      
      return {
        originalMechanisms: mechanisms.slice(0, 1), // First mechanism only
        normalizedMechanisms: normalizedMechanisms.slice(0, 1), // First normalized mechanism only
        mechanismEvidence: normalizedMechanisms[0]?.evidence?.slice(0, 1) || [] // First evidence only
      };
    });
    
    console.log('\n🔧 Normalization Test Results:');
    console.log(JSON.stringify(normalizationTest, null, 2));
    
    // Test the actual rendering
    console.log('\n🖱️ Testing modal rendering...');
    
    await page.fill('#searchInput', 'Caffeine');
    await page.waitForTimeout(1000);
    
    const modalResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(50);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (modalResult.success) {
      await page.waitForTimeout(1000);
      
      // Get the actual rendered HTML
      const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
      if (await mechanismsTab.count() > 0) {
        await mechanismsTab.click();
        await page.waitForTimeout(500);
        
        const firstCard = await page.locator('.enhanced-citation-card').first();
        if (await firstCard.count() > 0) {
          const cardHTML = await firstCard.innerHTML();
          const cardText = await firstCard.textContent();
          
          console.log('\n📋 First Card HTML (first 600 chars):');
          console.log(cardHTML.substring(0, 600) + '...');
          
          console.log('\n📋 First Card Text:');
          console.log(cardText);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Caffeine debug complete');
  }
})();
