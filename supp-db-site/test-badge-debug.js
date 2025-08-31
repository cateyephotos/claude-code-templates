const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Badge Display Issue...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🌐 Loading application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test the supplement object state
    const supplementState = await page.evaluate(() => {
      const holyBasil = window.app.supplements.find(s => s.id === 67);
      const phosphatidylserine = window.app.supplements.find(s => s.id === 12);
      
      return {
        holyBasil: {
          id: holyBasil?.id,
          name: holyBasil?.name,
          hasEnhancedCitations: !!holyBasil?.enhancedCitations,
          isEnhanced: holyBasil?.enhancedCitations?.isEnhanced,
          enhancedCitationsKeys: holyBasil?.enhancedCitations ? Object.keys(holyBasil.enhancedCitations) : []
        },
        phosphatidylserine: {
          id: phosphatidylserine?.id,
          name: phosphatidylserine?.name,
          hasEnhancedCitations: !!phosphatidylserine?.enhancedCitations,
          isEnhanced: phosphatidylserine?.enhancedCitations?.isEnhanced,
          enhancedCitationsKeys: phosphatidylserine?.enhancedCitations ? Object.keys(phosphatidylserine.enhancedCitations) : []
        }
      };
    });
    
    console.log('📊 Supplement State Analysis:');
    console.log('Holy Basil:', supplementState.holyBasil);
    console.log('Phosphatidylserine:', supplementState.phosphatidylserine);
    
    // Search for Holy Basil and check the rendered HTML
    console.log('\n🔍 Searching for Holy Basil...');
    await page.fill('#searchInput', 'Holy Basil');
    await page.waitForTimeout(1000);
    
    const holyBasilCard = await page.locator('[data-supplement-id="67"]').first();
    const cardExists = await holyBasilCard.count() > 0;
    console.log('📋 Holy Basil card found:', cardExists);
    
    if (cardExists) {
      // Check for Phase 2A badge
      const badgeExists = await holyBasilCard.locator('.phase-2a-badge').count() > 0;
      console.log('🏷️ Phase 2A badge found:', badgeExists);
      
      if (!badgeExists) {
        // Get the full HTML of the card to debug
        const cardHTML = await holyBasilCard.innerHTML();
        console.log('\n📄 Holy Basil Card HTML:');
        console.log(cardHTML.substring(0, 500) + '...');
        
        // Check if hasEnhanced is being calculated correctly during rendering
        const hasEnhancedCheck = await page.evaluate(() => {
          const holyBasil = window.app.supplements.find(s => s.id === 67);
          const hasEnhanced = holyBasil?.enhancedCitations?.isEnhanced;
          return {
            supplement: holyBasil?.name,
            enhancedCitations: holyBasil?.enhancedCitations,
            hasEnhanced: hasEnhanced,
            calculation: `${holyBasil?.enhancedCitations}?.isEnhanced = ${hasEnhanced}`
          };
        });
        
        console.log('\n🔧 hasEnhanced Calculation:', hasEnhancedCheck);
      }
      
      // Compare with Phosphatidylserine
      console.log('\n🔍 Searching for Phosphatidylserine...');
      await page.fill('#searchInput', 'Phosphatidylserine');
      await page.waitForTimeout(1000);
      
      const psCard = await page.locator('[data-supplement-id="12"]').first();
      const psCardExists = await psCard.count() > 0;
      console.log('📋 Phosphatidylserine card found:', psCardExists);
      
      if (psCardExists) {
        const psBadgeExists = await psCard.locator('.phase-2a-badge').count() > 0;
        console.log('🏷️ Phosphatidylserine Phase 2A badge found:', psBadgeExists);
        
        if (psBadgeExists) {
          const psBadgeText = await psCard.locator('.phase-2a-badge').textContent();
          console.log('📝 Phosphatidylserine badge text:', psBadgeText);
        }
      }
    }
    
    // Test if re-rendering fixes the issue
    console.log('\n🔄 Testing re-render...');
    await page.evaluate(() => {
      // Force re-render
      window.app._renderSupplements();
    });
    
    await page.waitForTimeout(1000);
    
    // Search for Holy Basil again
    await page.fill('#searchInput', 'Holy Basil');
    await page.waitForTimeout(1000);
    
    const holyBasilCardAfter = await page.locator('[data-supplement-id="67"]').first();
    const badgeExistsAfter = await holyBasilCardAfter.locator('.phase-2a-badge').count() > 0;
    console.log('🏷️ Phase 2A badge found after re-render:', badgeExistsAfter);
    
    if (badgeExistsAfter) {
      const badgeText = await holyBasilCardAfter.locator('.phase-2a-badge').textContent();
      console.log('📝 Badge text:', badgeText);
      console.log('✅ Badge issue resolved with re-render!');
    } else {
      console.log('❌ Badge still missing after re-render');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Badge test complete');
  }
})();
