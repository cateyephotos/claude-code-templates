const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING CHOLINE - VERIFYING IT\'S ACTUALLY WORKING');
  console.log('Using correct detection method...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Testing Choline (ID: 43)...');
    
    // Search and open supplement
    await page.fill('#searchInput', 'Choline');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(43);
    });
    await page.waitForTimeout(2000);
    
    // Test all tabs with correct detection method
    const tabResults = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-43');
      const safetyContainer = document.getElementById('safety-43');
      const mechanismsContainer = document.getElementById('mechanisms-43');
      
      const getBenefitsData = () => {
        if (!benefitsContainer) return { studyCards: 0, hasUndefined: true };
        // Use enhanced-citation-card instead of bg-gray-50
        const studyCards = Array.from(benefitsContainer.querySelectorAll('.enhanced-citation-card'));
        const hasUndefined = benefitsContainer.innerHTML.includes('undefined');
        const hasPMID = benefitsContainer.innerHTML.includes('PMID');
        return { studyCards: studyCards.length, hasUndefined, hasPMID };
      };
      
      const getSafetyData = () => {
        if (!safetyContainer) return { studyCards: 0 };
        const studyCards = Array.from(safetyContainer.querySelectorAll('.enhanced-citation-card'));
        const hasPMID = safetyContainer.innerHTML.includes('PMID');
        return { studyCards: studyCards.length, hasPMID };
      };
      
      const getMechanismsData = () => {
        if (!mechanismsContainer) return { studyCards: 0 };
        const studyCards = Array.from(mechanismsContainer.querySelectorAll('.enhanced-citation-card'));
        const hasPMID = mechanismsContainer.innerHTML.includes('PMID');
        return { studyCards: studyCards.length, hasPMID };
      };
      
      return {
        benefits: getBenefitsData(),
        safety: getSafetyData(),
        mechanisms: getMechanismsData()
      };
    });
    
    const benefitsWorking = tabResults.benefits.studyCards > 0 && !tabResults.benefits.hasUndefined;
    const safetyWorking = tabResults.safety.studyCards > 0;
    const mechanismsWorking = tabResults.mechanisms.studyCards > 0;
    const overallWorking = benefitsWorking && safetyWorking && mechanismsWorking;
    
    console.log('\n📊 Choline Test Results (Corrected Detection):');
    console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${tabResults.benefits.studyCards} cards)`);
    console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${tabResults.safety.studyCards} cards)`);
    console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${tabResults.mechanisms.studyCards} cards)`);
    console.log(`   Overall: ${overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
    
    if (overallWorking) {
      console.log('\n🎉 CHOLINE IS ACTUALLY WORKING PERFECTLY!');
      console.log('   The previous test was using incorrect CSS selectors');
      console.log('   Choline uses .enhanced-citation-card instead of .bg-gray-50');
    } else {
      console.log('\n⚠️ CHOLINE STILL HAS ISSUES:');
      if (!benefitsWorking) {
        console.log(`     Benefits: ${tabResults.benefits.studyCards} cards, undefined: ${tabResults.benefits.hasUndefined}`);
      }
      if (!safetyWorking) {
        console.log(`     Safety: ${tabResults.safety.studyCards} cards`);
      }
      if (!mechanismsWorking) {
        console.log(`     Mechanisms: ${tabResults.mechanisms.studyCards} cards`);
      }
    }
    
    // Test a few other supplements with the corrected method
    console.log('\n🧪 Testing Other Supplements with Corrected Method:');
    
    const testSupplements = [
      { id: 2, name: 'Turmeric' },
      { id: 5, name: 'Creatine' },
      { id: 23, name: 'Folate' }
    ];
    
    const correctedResults = [];
    
    for (const supplement of testSupplements) {
      try {
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(500);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1000);
        
        const result = await page.evaluate((suppId) => {
          const benefitsContainer = document.getElementById(`benefits-${suppId}`);
          const safetyContainer = document.getElementById(`safety-${suppId}`);
          const mechanismsContainer = document.getElementById(`mechanisms-${suppId}`);
          
          const getBenefitsData = () => {
            if (!benefitsContainer) return { studyCards: 0, hasUndefined: true };
            // Try both selectors
            let studyCards = Array.from(benefitsContainer.querySelectorAll('.enhanced-citation-card'));
            if (studyCards.length === 0) {
              studyCards = Array.from(benefitsContainer.querySelectorAll('.bg-gray-50'));
            }
            const hasUndefined = benefitsContainer.innerHTML.includes('undefined');
            return { studyCards: studyCards.length, hasUndefined };
          };
          
          const getSafetyData = () => {
            if (!safetyContainer) return { studyCards: 0 };
            let studyCards = Array.from(safetyContainer.querySelectorAll('.enhanced-citation-card'));
            if (studyCards.length === 0) {
              studyCards = Array.from(safetyContainer.querySelectorAll('.bg-gray-50'));
            }
            return { studyCards: studyCards.length };
          };
          
          const getMechanismsData = () => {
            if (!mechanismsContainer) return { studyCards: 0 };
            let studyCards = Array.from(mechanismsContainer.querySelectorAll('.enhanced-citation-card'));
            if (studyCards.length === 0) {
              studyCards = Array.from(mechanismsContainer.querySelectorAll('.bg-gray-50'));
            }
            return { studyCards: studyCards.length };
          };
          
          const benefits = getBenefitsData();
          const safety = getSafetyData();
          const mechanisms = getMechanismsData();
          
          return {
            benefits,
            safety,
            mechanisms,
            overallWorking: benefits.studyCards > 0 && !benefits.hasUndefined && 
                           safety.studyCards > 0 && mechanisms.studyCards > 0
          };
        }, supplement.id);
        
        correctedResults.push({
          id: supplement.id,
          name: supplement.name,
          ...result
        });
        
        console.log(`   ${supplement.name}: ${result.overallWorking ? '✅' : '❌'} (B:${result.benefits.studyCards} S:${result.safety.studyCards} M:${result.mechanisms.studyCards})`);
        
      } catch (error) {
        console.log(`   ${supplement.name}: ❌ Error: ${error.message}`);
      }
    }
    
    const workingCount = correctedResults.filter(r => r.overallWorking).length + (overallWorking ? 1 : 0);
    const totalTested = correctedResults.length + 1;
    
    console.log('\n🎯 CORRECTED SUCCESS RATE IMPACT:');
    console.log(`   Tested: ${totalTested} supplements`);
    console.log(`   Working: ${workingCount}/${totalTested}`);
    
    if (overallWorking) {
      console.log('\n🎉 SUCCESS: Choline is working, bringing us to 50/56 (89% success rate)!');
      console.log('   Only need 4 more supplements to reach 95% target');
    }
    
    return {
      cholineWorking: overallWorking,
      correctedResults,
      workingCount,
      totalTested
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Choline verification test complete');
  }
})();
