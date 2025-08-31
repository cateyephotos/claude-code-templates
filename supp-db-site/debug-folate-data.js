const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Folate Data Structure...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get the raw folate data
    const folateDataAnalysis = await page.evaluate(() => {
      const rawData = window.enhancedCitations[23];
      if (!rawData) {
        return { error: 'No folate data found' };
      }
      
      return {
        hasData: true,
        supplementId: rawData.supplementId,
        supplementName: rawData.supplementName,
        dataStructure: Object.keys(rawData),
        citationSections: rawData.citations ? Object.keys(rawData.citations) : [],
        mechanismsSample: {
          exists: !!rawData.citations?.mechanisms,
          type: Array.isArray(rawData.citations?.mechanisms) ? 'array' : typeof rawData.citations?.mechanisms,
          count: rawData.citations?.mechanisms?.length || 0,
          firstMechanism: rawData.citations?.mechanisms?.[0] || null,
          firstMechanismKeys: rawData.citations?.mechanisms?.[0] ? Object.keys(rawData.citations.mechanisms[0]) : []
        }
      };
    });
    
    console.log('📊 Raw Folate Data Analysis:');
    console.log(JSON.stringify(folateDataAnalysis, null, 2));
    
    // Test the normalization process
    const normalizationTest = await page.evaluate(() => {
      const rawData = window.enhancedCitations[23];
      const renderer = window.app.citationRenderer;
      
      if (!rawData || !renderer) {
        return { error: 'Missing data or renderer' };
      }
      
      // Test mechanism normalization
      const mechanisms = rawData.citations?.mechanisms;
      if (!mechanisms) {
        return { error: 'No mechanisms found in data' };
      }
      
      try {
        const normalizedMechanisms = renderer._normalizeMechanisms(mechanisms);
        
        return {
          originalMechanisms: mechanisms.slice(0, 1), // First mechanism only
          normalizedMechanisms: normalizedMechanisms.slice(0, 1), // First normalized mechanism only
          mechanismEvidence: normalizedMechanisms[0]?.evidence?.slice(0, 1) || [] // First evidence only
        };
      } catch (error) {
        return { error: 'Normalization failed: ' + error.message };
      }
    });
    
    console.log('\n🔧 Normalization Test Results:');
    console.log(JSON.stringify(normalizationTest, null, 2));
    
    // Test the actual rendering
    console.log('\n🖱️ Testing modal rendering...');
    
    await page.fill('#searchInput', 'Folate');
    await page.waitForTimeout(1000);
    
    const modalResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(23);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (modalResult.success) {
      await page.waitForTimeout(1000);
      
      // Check if tabs exist
      const tabsExist = await page.evaluate(() => {
        const tabs = document.querySelectorAll('.citation-tab-btn');
        return {
          tabCount: tabs.length,
          tabTexts: Array.from(tabs).map(tab => tab.textContent.trim())
        };
      });
      
      console.log('\n📋 Tab Analysis:', tabsExist);
      
      // Try to get any citation content
      const citationContent = await page.evaluate(() => {
        const citationContainer = document.querySelector('.citation-content');
        const enhancedCards = document.querySelectorAll('.enhanced-citation-card');
        
        return {
          containerExists: !!citationContainer,
          containerHTML: citationContainer ? citationContainer.innerHTML.substring(0, 500) : null,
          cardCount: enhancedCards.length,
          containerText: citationContainer ? citationContainer.textContent.substring(0, 200) : null
        };
      });
      
      console.log('\n📄 Citation Content Analysis:', citationContent);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Folate debug complete');
  }
})();
