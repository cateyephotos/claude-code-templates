const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Detailed Pterostilbene Analysis...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test the actual normalization process
    const normalizationTest = await page.evaluate(() => {
      const rawData = window.enhancedCitations[89];
      if (!rawData) return { error: 'No data' };
      
      const renderer = window.app.citationRenderer;
      
      // Get the first mechanism
      const firstMech = rawData.citations.mechanisms[0];
      
      // Test normalizing the mechanism directly
      const normalizedMechanisms = renderer._normalizeMechanisms([firstMech]);
      
      return {
        originalMechanism: firstMech,
        normalizedMechanism: normalizedMechanisms[0],
        evidenceFromNormalized: normalizedMechanisms[0]?.evidence?.[0] || null
      };
    });
    
    console.log('📊 Normalization Test Results:');
    console.log(JSON.stringify(normalizationTest, null, 2));
    
    // Test opening the modal and getting the actual rendered HTML
    console.log('\n🖱️ Testing actual modal rendering...');
    
    const modalResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(89);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (modalResult.success) {
      await page.waitForTimeout(1000);
      
      // Click mechanisms tab and get the first card HTML
      const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
      if (await mechanismsTab.count() > 0) {
        await mechanismsTab.click();
        await page.waitForTimeout(500);
        
        const firstCard = await page.locator('.enhanced-citation-card').first();
        if (await firstCard.count() > 0) {
          const cardHTML = await firstCard.innerHTML();
          const cardText = await firstCard.textContent();
          
          console.log('\n📋 First Card HTML (first 800 chars):');
          console.log(cardHTML.substring(0, 800) + '...');
          
          console.log('\n📋 First Card Text:');
          console.log(cardText);
          
          // Look for the specific undefined issue
          if (cardText.includes('undefined')) {
            console.log('\n❌ Found "undefined" in the text');
            
            // Find where exactly
            const lines = cardText.split('\n').map(line => line.trim()).filter(line => line);
            lines.forEach((line, index) => {
              if (line.includes('undefined')) {
                console.log(`   Line ${index + 1}: "${line}"`);
              }
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
})();
