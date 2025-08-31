const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Navigate and wait for load
    await page.goto('http://localhost:8001', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(5000);
    
    // Check the actual rendering process
    const renderingDebug = await page.evaluate(() => {
      console.log('=== DEBUGGING RENDERING PROCESS ===');
      
      if (!window.app) {
        return { error: 'App not loaded' };
      }
      
      const firstSupplement = window.app.supplements[0];
      console.log('First supplement full data:', firstSupplement);
      
      // Test the _renderBasicSupplementCard method manually
      const testCard = window.app._renderBasicSupplementCard(firstSupplement);
      console.log('Generated card HTML:', testCard);
      
      // Check if primaryBenefits exist in the generated HTML
      const hasMemoryEnhancement = testCard.includes('Memory enhancement');
      const hasAnxietyReduction = testCard.includes('Anxiety reduction');
      const hasBgBlue100 = testCard.includes('bg-blue-100');
      const hasBgGreen100 = testCard.includes('bg-green-100');
      
      // Try to render just the primary benefits section
      const cognitive = firstSupplement.primaryBenefits?.cognitive || [];
      const nonCognitive = firstSupplement.primaryBenefits?.nonCognitive || [];
      
      const cognitiveHTML = cognitive.slice(0, 2).map(benefit => 
        `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${benefit}</span>`
      ).join('');
      
      const nonCognitiveHTML = nonCognitive.slice(0, 2).map(benefit => 
        `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${benefit}</span>`
      ).join('');
      
      console.log('Cognitive HTML:', cognitiveHTML);
      console.log('Non-cognitive HTML:', nonCognitiveHTML);
      
      return {
        supplementData: {
          name: firstSupplement.name,
          hasPrimaryBenefits: !!firstSupplement.primaryBenefits,
          cognitive: firstSupplement.primaryBenefits?.cognitive,
          nonCognitive: firstSupplement.primaryBenefits?.nonCognitive
        },
        generatedCard: {
          hasMemoryEnhancement,
          hasAnxietyReduction,
          hasBgBlue100,
          hasBgGreen100,
          length: testCard.length
        },
        testHTML: {
          cognitive: cognitiveHTML,
          nonCognitive: nonCognitiveHTML
        }
      };
    });
    
    console.log('Rendering debug results:', JSON.stringify(renderingDebug, null, 2));
    
    // Check what's actually in the DOM for the first card
    const domContent = await page.evaluate(() => {
      const firstCard = document.querySelector('[data-supplement-id="1"]');
      if (!firstCard) return { error: 'Card not found' };
      
      // Get the primary benefits section specifically
      const primaryBenefitsHeader = firstCard.querySelector('h4');
      if (!primaryBenefitsHeader) return { error: 'No h4 found' };
      
      const section = primaryBenefitsHeader.parentElement;
      
      return {
        fullCardHTML: firstCard.innerHTML,
        primaryBenefitsSection: section.innerHTML,
        textContent: section.textContent
      };
    });
    
    console.log('DOM content check:');
    console.log('Primary Benefits section HTML:', domContent.primaryBenefitsSection);
    console.log('Text content:', domContent.textContent);
    
    await browser.close();
    
  } catch (error) {
    console.error('Rendering debug script failed:', error);
  }
})();
