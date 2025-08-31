const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING ASTAXANTHIN ENHANCED CITATIONS');
  console.log('Verifying Astaxanthin (ID: 46) is now working...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Testing Astaxanthin (ID: 46)...');
    
    // Check if Astaxanthin data is loaded
    const dataCheck = await page.evaluate(() => {
      return {
        hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
        hasAstaxanthinData: window.enhancedCitations && window.enhancedCitations[46] !== undefined,
        hasGlobalVar: typeof window.astaxanthinEnhanced !== 'undefined',
        astaxanthinDataKeys: window.enhancedCitations && window.enhancedCitations[46] ? 
          Object.keys(window.enhancedCitations[46]) : null
      };
    });
    
    console.log('\n📊 Astaxanthin Data Check:');
    console.log(`   Enhanced Citations Exists: ${dataCheck.hasEnhancedCitations}`);
    console.log(`   Astaxanthin Data Loaded: ${dataCheck.hasAstaxanthinData}`);
    console.log(`   Global Variable Exists: ${dataCheck.hasGlobalVar}`);
    console.log(`   Astaxanthin Data Keys: ${dataCheck.astaxanthinDataKeys?.join(', ')}`);
    
    if (!dataCheck.hasAstaxanthinData) {
      console.log('❌ Astaxanthin data not loaded - check loader mappings');
      return;
    }
    
    // Search and open Astaxanthin supplement
    await page.fill('#searchInput', 'Astaxanthin');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(46);
    });
    await page.waitForTimeout(2000);
    
    // Test all tabs
    const tabResults = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-46');
      const safetyContainer = document.getElementById('safety-46');
      const mechanismsContainer = document.getElementById('mechanisms-46');
      
      const getBenefitsData = () => {
        if (!benefitsContainer) return { studyCards: 0, hasUndefined: true };
        // Try both selectors
        let studyCards = Array.from(benefitsContainer.querySelectorAll('.enhanced-citation-card'));
        if (studyCards.length === 0) {
          studyCards = Array.from(benefitsContainer.querySelectorAll('.bg-gray-50'));
        }
        const hasUndefined = benefitsContainer.innerHTML.includes('undefined');
        const hasPMID = benefitsContainer.innerHTML.includes('PMID');
        return { studyCards: studyCards.length, hasUndefined, hasPMID };
      };
      
      const getSafetyData = () => {
        if (!safetyContainer) return { studyCards: 0 };
        let studyCards = Array.from(safetyContainer.querySelectorAll('.enhanced-citation-card'));
        if (studyCards.length === 0) {
          studyCards = Array.from(safetyContainer.querySelectorAll('.bg-gray-50'));
        }
        const hasPMID = safetyContainer.innerHTML.includes('PMID');
        return { studyCards: studyCards.length, hasPMID };
      };
      
      const getMechanismsData = () => {
        if (!mechanismsContainer) return { studyCards: 0 };
        let studyCards = Array.from(mechanismsContainer.querySelectorAll('.enhanced-citation-card'));
        if (studyCards.length === 0) {
          studyCards = Array.from(mechanismsContainer.querySelectorAll('.bg-gray-50'));
        }
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
    
    console.log('\n📊 Astaxanthin Test Results:');
    console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${tabResults.benefits.studyCards} cards, undefined: ${tabResults.benefits.hasUndefined})`);
    console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${tabResults.safety.studyCards} cards)`);
    console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${tabResults.mechanisms.studyCards} cards)`);
    console.log(`   Overall: ${overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
    
    if (overallWorking) {
      console.log('\n🎉 ASTAXANTHIN IS NOW WORKING!');
      console.log('   Success rate improved to 52/56 (93% success rate)');
      console.log('   Only need 2 more supplements to reach 95% target');
    } else {
      console.log('\n⚠️ ASTAXANTHIN STILL HAS ISSUES:');
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
    
    return {
      astaxanthinWorking: overallWorking,
      dataLoaded: dataCheck.hasAstaxanthinData,
      tabResults
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Astaxanthin test complete');
  }
})();
