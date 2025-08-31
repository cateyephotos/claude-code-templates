const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Benefit Title Rendering...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check the raw benefit data
    const benefitDataAnalysis = await page.evaluate(() => {
      const data = window.enhancedCitations?.[8];
      if (!data) return { error: 'No data found' };
      
      const benefits = data.citations?.benefits || [];
      
      return {
        benefitsCount: benefits.length,
        benefitStructures: benefits.map((benefit, index) => ({
          index: index,
          keys: Object.keys(benefit),
          claim: benefit.claim,
          title: benefit.title,
          name: benefit.name,
          hasStudies: !!benefit.studies,
          studiesCount: benefit.studies?.length || 0,
          firstStudyTitle: benefit.studies?.[0]?.title
        }))
      };
    });
    
    console.log('📊 Raw Benefit Data Analysis:');
    console.log(JSON.stringify(benefitDataAnalysis, null, 2));
    
    // Search for Melatonin and open modal
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
    
    if (!modalResult.success) {
      console.log(`❌ Modal failed: ${modalResult.error}`);
      return;
    }
    
    await page.waitForTimeout(1000);
    
    // Switch to Benefits tab
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    if (await benefitsTab.count() > 0) {
      await benefitsTab.click();
      await page.waitForTimeout(500);
      
      // Get detailed information about each benefit card
      const benefitCards = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('#benefits-8 .enhanced-citation-card'));
        
        return cards.map((card, index) => {
          const title = card.querySelector('h5')?.textContent?.trim();
          const fullText = card.textContent;
          const html = card.innerHTML;
          
          // Look for specific claim text in the card
          const hasSpecificClaim = fullText.includes('Significantly improves sleep quality') ||
                                  fullText.includes('Reduces sleep onset latency') ||
                                  fullText.includes('Effectively prevents and treats jet lag') ||
                                  fullText.includes('Treats chronic insomnia') ||
                                  fullText.includes('Improves sleep quality in shift workers') ||
                                  fullText.includes('seasonal affective disorder') ||
                                  fullText.includes('age-related sleep disturbances') ||
                                  fullText.includes('neuroprotective antioxidant');
          
          // Extract the actual claim from the text
          const lines = fullText.split('\n').filter(line => line.trim().length > 10);
          const possibleClaim = lines.find(line => 
            line.length > 30 && 
            !line.includes('Evidence') && 
            !line.includes('Moderate') &&
            !line.includes('Strong') &&
            !line.includes('Multiple studies')
          );
          
          return {
            index: index,
            title: title,
            hasSpecificClaim: hasSpecificClaim,
            possibleClaim: possibleClaim,
            textLength: fullText.length,
            preview: fullText.substring(0, 200).replace(/\s+/g, ' ').trim()
          };
        });
      });
      
      console.log('\n📋 Benefit Card Analysis:');
      benefitCards.forEach(card => {
        console.log(`\nCard ${card.index + 1}:`);
        console.log(`  Title: ${card.title}`);
        console.log(`  Has Specific Claim: ${card.hasSpecificClaim ? '✅' : '❌'}`);
        console.log(`  Possible Claim: ${card.possibleClaim || 'Not found'}`);
        console.log(`  Preview: ${card.preview}...`);
      });
      
      // Test the benefit normalization process
      const normalizationTest = await page.evaluate(() => {
        const data = window.enhancedCitations?.[8];
        const renderer = window.app.citationRenderer;
        
        if (!data || !renderer) {
          return { error: 'Missing data or renderer' };
        }
        
        try {
          const benefits = data.citations.benefits;
          const normalizedBenefits = renderer._normalizeBenefits(benefits);
          
          return {
            originalCount: benefits.length,
            normalizedCount: normalizedBenefits.length,
            firstOriginal: benefits[0],
            firstNormalized: normalizedBenefits[0],
            titleMapping: normalizedBenefits.map((norm, index) => ({
              index: index,
              originalClaim: benefits[index]?.claim,
              normalizedBenefit: norm.benefit,
              normalizedTitle: norm.title
            }))
          };
        } catch (error) {
          return { error: 'Normalization failed: ' + error.message };
        }
      });
      
      console.log('\n🔧 Normalization Test Results:');
      console.log(JSON.stringify(normalizationTest, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Benefit title debug complete');
  }
})();
