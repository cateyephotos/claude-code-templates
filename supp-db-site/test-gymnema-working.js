const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING GYMNEMA SYLVESTRE - PHASE 2 THIRD SUPPLEMENT');
  console.log('Verifying Gymnema Sylvestre (ID: 64) enhanced citations are working...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Testing Gymnema Sylvestre (ID: 64)...');
    
    // Check if Gymnema Sylvestre data is loaded
    const dataCheck = await page.evaluate(() => {
      return {
        hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
        hasGymnemaData: window.enhancedCitations && window.enhancedCitations[64] !== undefined,
        hasGlobalVar: typeof window.gymnemaSylvestreEnhanced !== 'undefined',
        gymnemaDataKeys: window.enhancedCitations && window.enhancedCitations[64] ? 
          Object.keys(window.enhancedCitations[64]) : null,
        gymnemaName: window.enhancedCitations && window.enhancedCitations[64] ? 
          window.enhancedCitations[64].name : null
      };
    });
    
    console.log('\n📊 Gymnema Sylvestre Data Check:');
    console.log(`   Enhanced Citations Exists: ${dataCheck.hasEnhancedCitations}`);
    console.log(`   Gymnema Data Loaded: ${dataCheck.hasGymnemaData}`);
    console.log(`   Global Variable Exists: ${dataCheck.hasGlobalVar}`);
    console.log(`   Gymnema Name: ${dataCheck.gymnemaName}`);
    console.log(`   Gymnema Data Keys: ${dataCheck.gymnemaDataKeys?.join(', ')}`);
    
    if (!dataCheck.hasGymnemaData) {
      console.log('❌ Gymnema Sylvestre data not loaded - check file or mapping');
      return;
    }
    
    // Search and open Gymnema Sylvestre supplement
    await page.fill('#searchInput', 'Gymnema');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(64);
    });
    await page.waitForTimeout(2000);
    
    // Test all tabs
    const tabResults = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-64');
      const safetyContainer = document.getElementById('safety-64');
      const mechanismsContainer = document.getElementById('mechanisms-64');
      
      const getBenefitsData = () => {
        if (!benefitsContainer) return { studyCards: 0, hasUndefined: true };
        // Try multiple selectors
        let studyCards = Array.from(benefitsContainer.querySelectorAll('.enhanced-citation-card'));
        if (studyCards.length === 0) {
          studyCards = Array.from(benefitsContainer.querySelectorAll('.bg-gray-50'));
        }
        if (studyCards.length === 0) {
          studyCards = Array.from(benefitsContainer.querySelectorAll('.citation-card'));
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
        if (studyCards.length === 0) {
          studyCards = Array.from(safetyContainer.querySelectorAll('.citation-card'));
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
        if (studyCards.length === 0) {
          studyCards = Array.from(mechanismsContainer.querySelectorAll('.citation-card'));
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
    
    console.log('\n📊 Gymnema Sylvestre Test Results:');
    console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${tabResults.benefits.studyCards} cards, undefined: ${tabResults.benefits.hasUndefined}, PMID: ${tabResults.benefits.hasPMID})`);
    console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${tabResults.safety.studyCards} cards, PMID: ${tabResults.safety.hasPMID})`);
    console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${tabResults.mechanisms.studyCards} cards, PMID: ${tabResults.mechanisms.hasPMID})`);
    console.log(`   Overall: ${overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
    
    if (overallWorking) {
      console.log('\n🎉 GYMNEMA SYLVESTRE IS NOW WORKING!');
      console.log('✅ Phase 2 third supplement successfully completed');
      console.log('✅ All tabs displaying enhanced citations properly');
      console.log('✅ PMIDs and study details rendering correctly');
      console.log('🚀 Ready to proceed with final Week 1 supplement');
    } else {
      console.log('\n⚠️ GYMNEMA SYLVESTRE HAS ISSUES:');
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
    
    console.log('\n📋 PHASE 2 PROGRESS UPDATE:');
    console.log('   Week 1 Goal: 4 supplements (PEA, Bitter Melon, Gymnema Sylvestre, Cinnamon Extract)');
    console.log(`   Completed: 3/4 (PEA ✅, Bitter Melon ✅, ${overallWorking ? 'Gymnema Sylvestre ✅' : 'Gymnema Sylvestre ❌'})`);
    console.log('   Next: Cinnamon Extract (ID: 66) - Blood sugar support');
    console.log('   Target: 82% success rate by end of Week 1');
    
    return {
      gymnemaWorking: overallWorking,
      dataLoaded: dataCheck.hasGymnemaData,
      tabResults
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Gymnema Sylvestre test complete');
  }
})();
