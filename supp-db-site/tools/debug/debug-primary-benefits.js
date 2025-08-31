const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Navigate to the page
    await page.goto('http://localhost:8001', { waitUntil: 'networkidle', timeout: 15000 });
    
    // Wait for the page to load
    await page.waitForTimeout(5000);
    
    // Check if supplement data is loaded
    const supplementDataCheck = await page.evaluate(() => {
      console.log('=== DEBUG: Checking supplement data ===');
      
      // Check if app exists
      if (!window.app) {
        return { error: 'window.app not found' };
      }
      
      // Check if supplements exist
      if (!window.app.supplements) {
        return { error: 'window.app.supplements not found' };
      }
      
      const firstSupplement = window.app.supplements[0];
      console.log('First supplement:', firstSupplement);
      
      if (!firstSupplement) {
        return { error: 'No supplements found' };
      }
      
      console.log('Primary benefits structure:', firstSupplement.primaryBenefits);
      
      return {
        supplementName: firstSupplement.name,
        hasPrimaryBenefits: !!firstSupplement.primaryBenefits,
        primaryBenefitsStructure: firstSupplement.primaryBenefits,
        cognitiveBenefits: firstSupplement.primaryBenefits?.cognitive,
        nonCognitiveBenefits: firstSupplement.primaryBenefits?.nonCognitive
      };
    });
    
    console.log('Supplement data check result:', supplementDataCheck);
    
    // Check if Primary Benefits sections exist in DOM
    const primaryBenefitsCheck = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-supplement-id]');
      const results = [];
      
      cards.forEach((card, index) => {
        if (index < 3) { // Check first 3 cards
          const supplementId = card.dataset.supplementId;
          const primaryBenefitsSection = card.querySelector('h4');
          const hasPrimaryBenefitsText = card.textContent.includes('Primary Benefits');
          const cognitiveSpans = card.querySelectorAll('.bg-blue-100');
          const nonCognitiveSpans = card.querySelectorAll('.bg-green-100');
          
          results.push({
            supplementId,
            hasPrimaryBenefitsSection: !!primaryBenefitsSection,
            hasPrimaryBenefitsText,
            cognitiveSpansCount: cognitiveSpans.length,
            nonCognitiveSpansCount: nonCognitiveSpans.length,
            cardHTML: card.innerHTML.substring(0, 500) + '...'
          });
        }
      });
      
      return results;
    });
    
    console.log('Primary benefits DOM check:', primaryBenefitsCheck);
    
    await browser.close();
    
  } catch (error) {
    console.error('Debug script failed:', error);
  }
})();
