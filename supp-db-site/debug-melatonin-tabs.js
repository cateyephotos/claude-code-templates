const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Melatonin Tab Content Distribution...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
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
    
    // Test all three tabs
    const tabs = ['Mechanisms', 'Benefits', 'Safety'];
    const tabAnalysis = {};
    
    for (const tabName of tabs) {
      console.log(`\n🔍 Analyzing ${tabName} tab...`);
      
      const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
      if (await tab.count() === 0) {
        console.log(`❌ ${tabName} tab not found`);
        continue;
      }
      
      await tab.click();
      await page.waitForTimeout(500);
      
      // Count citation cards
      const citationCards = await page.locator('.enhanced-citation-card');
      const cardCount = await citationCards.count();
      
      console.log(`📄 ${tabName}: ${cardCount} cards`);
      
      // Analyze first few cards
      const cardDetails = [];
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = citationCards.nth(i);
        const cardText = await card.textContent();
        
        // Extract the main title/claim
        const lines = cardText.split('\n').filter(line => line.trim().length > 0);
        const title = lines.find(line => line.length > 10 && !line.includes('Evidence') && !line.includes('Moderate') && !line.includes('Strong'));
        
        cardDetails.push({
          index: i + 1,
          title: title || 'No title found',
          preview: cardText.substring(0, 100).replace(/\s+/g, ' ').trim()
        });
        
        console.log(`   Card ${i + 1}: ${title || 'No title found'}`);
      }
      
      tabAnalysis[tabName] = {
        cardCount: cardCount,
        cardDetails: cardDetails
      };
    }
    
    // Check the raw data structure
    console.log('\n📊 Raw Data Analysis...');
    
    const rawDataAnalysis = await page.evaluate(() => {
      const data = window.enhancedCitations?.[8];
      if (!data) return { error: 'No data found' };
      
      return {
        mechanismsCount: data.citations?.mechanisms?.length || 0,
        benefitsCount: data.citations?.benefits?.length || 0,
        safetyCount: data.citations?.safety?.length || 0,
        mechanismTitles: data.citations?.mechanisms?.map(m => m.claim) || [],
        benefitTitles: data.citations?.benefits?.map(b => b.claim) || [],
        safetyTitles: data.citations?.safety?.map(s => s.claim) || []
      };
    });
    
    console.log('Raw Data Structure:', rawDataAnalysis);
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 TAB CONTENT DISTRIBUTION ANALYSIS');
    console.log('='.repeat(80));
    
    Object.entries(tabAnalysis).forEach(([tabName, data]) => {
      console.log(`\n🏷️ ${tabName} Tab:`);
      console.log(`   Cards Displayed: ${data.cardCount}`);
      console.log(`   Expected Count: ${rawDataAnalysis[tabName.toLowerCase() + 'Count'] || 'Unknown'}`);
      
      if (data.cardCount !== rawDataAnalysis[tabName.toLowerCase() + 'Count']) {
        console.log(`   ⚠️ MISMATCH: Expected ${rawDataAnalysis[tabName.toLowerCase() + 'Count']}, got ${data.cardCount}`);
      } else {
        console.log(`   ✅ MATCH: Card count matches expected data`);
      }
    });
    
    // Check if there's cross-contamination
    console.log('\n🔍 Cross-Contamination Check:');
    
    const mechanismTitles = rawDataAnalysis.mechanismTitles || [];
    const benefitTitles = rawDataAnalysis.benefitTitles || [];
    
    const benefitsTabCards = tabAnalysis.Benefits?.cardDetails || [];
    
    benefitsTabCards.forEach(card => {
      const isMechanism = mechanismTitles.some(mech => 
        card.title.toLowerCase().includes(mech.toLowerCase().substring(0, 20))
      );
      const isBenefit = benefitTitles.some(ben => 
        card.title.toLowerCase().includes(ben.toLowerCase().substring(0, 20))
      );
      
      if (isMechanism) {
        console.log(`   ❌ Card ${card.index} in Benefits tab is actually a MECHANISM: ${card.title}`);
      } else if (isBenefit) {
        console.log(`   ✅ Card ${card.index} in Benefits tab is correctly a BENEFIT: ${card.title}`);
      } else {
        console.log(`   ⚠️ Card ${card.index} in Benefits tab is UNKNOWN type: ${card.title}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Melatonin tab analysis complete');
  }
})();
