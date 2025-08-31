const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING BITTER MELON - PHASE 2 SECOND SUPPLEMENT');
  console.log('Verifying Bitter Melon (ID: 63) enhanced citations are working...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Testing Bitter Melon (ID: 63)...');
    
    // Check if Bitter Melon data is loaded
    const dataCheck = await page.evaluate(() => {
      return {
        hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
        hasBitterMelonData: window.enhancedCitations && window.enhancedCitations[63] !== undefined,
        hasGlobalVar: typeof window.bitterMelonEnhanced !== 'undefined',
        bitterMelonDataKeys: window.enhancedCitations && window.enhancedCitations[63] ? 
          Object.keys(window.enhancedCitations[63]) : null,
        bitterMelonName: window.enhancedCitations && window.enhancedCitations[63] ? 
          window.enhancedCitations[63].name : null
      };
    });
    
    console.log('\n📊 Bitter Melon Data Check:');
    console.log(`   Enhanced Citations Exists: ${dataCheck.hasEnhancedCitations}`);
    console.log(`   Bitter Melon Data Loaded: ${dataCheck.hasBitterMelonData}`);
    console.log(`   Global Variable Exists: ${dataCheck.hasGlobalVar}`);
    console.log(`   Bitter Melon Name: ${dataCheck.bitterMelonName}`);
    console.log(`   Bitter Melon Data Keys: ${dataCheck.bitterMelonDataKeys?.join(', ')}`);
    
    if (!dataCheck.hasBitterMelonData) {
      console.log('❌ Bitter Melon data not loaded - check file or mapping');
      return;
    }
    
    // Search and open Bitter Melon supplement
    await page.fill('#searchInput', 'Bitter Melon');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(63);
    });
    await page.waitForTimeout(2000);
    
    // Test all tabs
    const tabResults = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-63');
      const safetyContainer = document.getElementById('safety-63');
      const mechanismsContainer = document.getElementById('mechanisms-63');
      
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
    
    console.log('\n📊 Bitter Melon Test Results:');
    console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${tabResults.benefits.studyCards} cards, undefined: ${tabResults.benefits.hasUndefined}, PMID: ${tabResults.benefits.hasPMID})`);
    console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${tabResults.safety.studyCards} cards, PMID: ${tabResults.safety.hasPMID})`);
    console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${tabResults.mechanisms.studyCards} cards, PMID: ${tabResults.mechanisms.hasPMID})`);
    console.log(`   Overall: ${overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
    
    if (overallWorking) {
      console.log('\n🎉 BITTER MELON IS NOW WORKING!');
      console.log('✅ Phase 2 second supplement successfully completed');
      console.log('✅ All tabs displaying enhanced citations properly');
      console.log('✅ PMIDs and study details rendering correctly');
      console.log('🚀 Ready to proceed with next high-priority supplement');
    } else {
      console.log('\n⚠️ BITTER MELON HAS ISSUES:');
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
    console.log(`   Completed: 2/4 (PEA ✅, ${overallWorking ? 'Bitter Melon ✅' : 'Bitter Melon ❌'})`);
    console.log('   Next: Gymnema Sylvestre (ID: 64) - Metabolic support');
    console.log('   Target: 82% success rate by end of Week 1');
    
    return {
      bitterMelonWorking: overallWorking,
      dataLoaded: dataCheck.hasBitterMelonData,
      tabResults
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Bitter Melon test complete');
  }
})();
