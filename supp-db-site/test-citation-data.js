const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Citation Data Processing...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🌐 Loading application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test the raw citation data
    const citationData = await page.evaluate(() => {
      // Get the raw enhanced citation data for Holy Basil
      const rawData = window.enhancedCitations[67];
      
      if (!rawData) {
        return { error: 'No enhanced citation data found for Holy Basil' };
      }
      
      // Extract the first benefit study for analysis
      const firstBenefit = rawData.citations?.benefits?.[0];
      const firstStudy = firstBenefit?.studies?.[0];
      
      return {
        hasRawData: !!rawData,
        benefitsCount: rawData.citations?.benefits?.length || 0,
        firstBenefit: {
          claim: firstBenefit?.claim,
          studyCount: firstBenefit?.studies?.length || 0,
          firstStudy: firstStudy ? {
            title: firstStudy.title,
            authors: firstStudy.authors,
            year: firstStudy.year,
            journal: firstStudy.journal,
            evidenceLevel: firstStudy.evidenceLevel,
            hasAllFields: !!(firstStudy.title && firstStudy.authors && firstStudy.year && firstStudy.journal)
          } : null
        },
        rawFirstStudy: firstStudy // Full raw data
      };
    });
    
    console.log('📊 Raw Citation Data Analysis:');
    console.log(JSON.stringify(citationData, null, 2));
    
    // Now test what happens when the citation renderer processes this data
    const rendererTest = await page.evaluate(async () => {
      try {
        // Get the citation renderer
        const renderer = window.app.citationRenderer;
        if (!renderer) {
          return { error: 'Citation renderer not found' };
        }
        
        // Get the supplement
        const supplement = window.app.supplements.find(s => s.id === 67);
        if (!supplement) {
          return { error: 'Holy Basil supplement not found' };
        }
        
        // Load the enhanced citation data
        const citationData = await window.app.citationLoader.loadEnhancedCitations(67);
        if (!citationData) {
          return { error: 'Failed to load enhanced citation data' };
        }
        
        // Test the normalization process
        const benefits = citationData.citations?.benefits || [];
        if (benefits.length === 0) {
          return { error: 'No benefits found in citation data' };
        }
        
        const firstBenefit = benefits[0];
        const studies = firstBenefit.studies || [];
        
        if (studies.length === 0) {
          return { error: 'No studies found in first benefit' };
        }
        
        // Test the study normalization
        const rawStudy = studies[0];
        
        // Simulate what the renderer does to normalize the study
        const normalizedStudy = {
          ...rawStudy,
          evidenceLevel: rawStudy.evidenceLevel || "Level 4",
          findings: rawStudy.findings || '',
          authors: Array.isArray(rawStudy.authors) ? rawStudy.authors : [rawStudy.authors || 'Unknown authors'],
          title: rawStudy.title || "Study finding"
        };
        
        return {
          success: true,
          rawStudy: {
            title: rawStudy.title,
            authors: rawStudy.authors,
            year: rawStudy.year,
            journal: rawStudy.journal,
            evidenceLevel: rawStudy.evidenceLevel
          },
          normalizedStudy: {
            title: normalizedStudy.title,
            authors: normalizedStudy.authors,
            year: normalizedStudy.year,
            journal: normalizedStudy.journal,
            evidenceLevel: normalizedStudy.evidenceLevel
          },
          authorType: typeof rawStudy.authors,
          yearType: typeof rawStudy.year,
          journalType: typeof rawStudy.journal
        };
        
      } catch (error) {
        return { error: error.message, stack: error.stack };
      }
    });
    
    console.log('\n🔧 Citation Renderer Test:');
    console.log(JSON.stringify(rendererTest, null, 2));
    
    // Test the actual rendering output
    console.log('\n🖱️ Opening Holy Basil modal to see actual rendering...');
    
    await page.fill('#searchInput', 'Holy Basil');
    await page.waitForTimeout(1000);
    
    const directCallResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(67);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (directCallResult.success) {
      await page.waitForTimeout(1000);
      
      // Click on Benefits tab
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(500);
        
        // Get the actual rendered citation text
        const citationCards = await page.locator('.enhanced-citation-card');
        const cardCount = await citationCards.count();
        
        if (cardCount > 0) {
          const firstCardText = await citationCards.first().textContent();
          console.log('\n📄 First Citation Card Rendered Text:');
          console.log(firstCardText);
          
          // Check for the specific "undefined" issue
          if (firstCardText.includes('undefined')) {
            console.log('\n❌ Found "undefined" in rendered text!');
            
            // Get the HTML to see the exact structure
            const firstCardHTML = await citationCards.first().innerHTML();
            console.log('\n📋 First Citation Card HTML:');
            console.log(firstCardHTML);
          } else {
            console.log('\n✅ No "undefined" found in rendered text');
          }
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Citation data test complete');
  }
})();
