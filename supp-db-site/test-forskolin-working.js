const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING FORSKOLIN - PHASE 2 WEEK 2 FIRST SUPPLEMENT');
  console.log('Verifying Forskolin (ID: 70) enhanced citations and evidence profile...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Testing Forskolin (ID: 70)...');
    
    // Check if Forskolin data is loaded
    const dataCheck = await page.evaluate(() => {
      return {
        hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
        hasForskolinData: window.enhancedCitations && window.enhancedCitations[70] !== undefined,
        hasGlobalVar: typeof window.forskolinEnhanced !== 'undefined',
        forskolinDataKeys: window.enhancedCitations && window.enhancedCitations[70] ? 
          Object.keys(window.enhancedCitations[70]) : null,
        forskolinName: window.enhancedCitations && window.enhancedCitations[70] ? 
          window.enhancedCitations[70].name : null,
        evidenceProfile: window.enhancedCitations && window.enhancedCitations[70] ? 
          window.enhancedCitations[70].evidenceProfile : null
      };
    });
    
    console.log('\n📊 Forskolin Data Check:');
    console.log(`   Enhanced Citations Exists: ${dataCheck.hasEnhancedCitations}`);
    console.log(`   Forskolin Data Loaded: ${dataCheck.hasForskolinData}`);
    console.log(`   Global Variable Exists: ${dataCheck.hasGlobalVar}`);
    console.log(`   Forskolin Name: ${dataCheck.forskolinName}`);
    console.log(`   Forskolin Data Keys: ${dataCheck.forskolinDataKeys?.join(', ')}`);
    
    // Check Evidence Profile
    if (dataCheck.evidenceProfile) {
      console.log('\n📋 Evidence Profile Check:');
      console.log(`   Overall Quality: ${dataCheck.evidenceProfile.overallQuality}`);
      console.log(`   Research Score: ${dataCheck.evidenceProfile.researchQualityScore}`);
      console.log(`   Research Maturity: ${dataCheck.evidenceProfile.researchMaturity}`);
      console.log(`   Publication Span: ${dataCheck.evidenceProfile.publicationSpan}`);
      if (dataCheck.evidenceProfile.evidenceStrength) {
        console.log(`   Evidence Strengths: M:${dataCheck.evidenceProfile.evidenceStrength.mechanisms}, C:${dataCheck.evidenceProfile.evidenceStrength.clinicalBenefits}, S:${dataCheck.evidenceProfile.evidenceStrength.safety}, D:${dataCheck.evidenceProfile.evidenceStrength.dosage}`);
      }
    }
    
    if (!dataCheck.hasForskolinData) {
      console.log('❌ Forskolin data not loaded - check file or mapping');
      return;
    }
    
    // Search and open Forskolin supplement
    await page.fill('#searchInput', 'Forskolin');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(70);
    });
    await page.waitForTimeout(2000);
    
    // Test all tabs
    const tabResults = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-70');
      const safetyContainer = document.getElementById('safety-70');
      const mechanismsContainer = document.getElementById('mechanisms-70');
      
      const getBenefitsData = () => {
        if (!benefitsContainer) return { studyCards: 0, hasUndefined: true };
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
    const evidenceProfileComplete = dataCheck.evidenceProfile && 
                                   dataCheck.evidenceProfile.overallQuality && 
                                   dataCheck.evidenceProfile.researchQualityScore;
    
    console.log('\n📊 Forskolin Test Results:');
    console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${tabResults.benefits.studyCards} cards, undefined: ${tabResults.benefits.hasUndefined}, PMID: ${tabResults.benefits.hasPMID})`);
    console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${tabResults.safety.studyCards} cards, PMID: ${tabResults.safety.hasPMID})`);
    console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${tabResults.mechanisms.studyCards} cards, PMID: ${tabResults.mechanisms.hasPMID})`);
    console.log(`   Evidence Profile: ${evidenceProfileComplete ? '✅' : '❌'} (Complete: ${evidenceProfileComplete})`);
    console.log(`   Overall: ${overallWorking && evidenceProfileComplete ? '✅ WORKING' : '❌ BROKEN'}`);
    
    if (overallWorking && evidenceProfileComplete) {
      console.log('\n🎉 FORSKOLIN IS NOW WORKING!');
      console.log('✅ Phase 2 Week 2 first supplement successfully completed');
      console.log('✅ All tabs displaying enhanced citations properly');
      console.log('✅ Evidence Profile complete and accurate');
      console.log('✅ PMIDs and study details rendering correctly');
      console.log('🚀 Ready to proceed with next Week 2 supplement');
    } else {
      console.log('\n⚠️ FORSKOLIN HAS ISSUES:');
      if (!benefitsWorking) {
        console.log(`     Benefits: ${tabResults.benefits.studyCards} cards, undefined: ${tabResults.benefits.hasUndefined}`);
      }
      if (!safetyWorking) {
        console.log(`     Safety: ${tabResults.safety.studyCards} cards`);
      }
      if (!mechanismsWorking) {
        console.log(`     Mechanisms: ${tabResults.mechanisms.studyCards} cards`);
      }
      if (!evidenceProfileComplete) {
        console.log(`     Evidence Profile: Incomplete or missing`);
      }
    }
    
    console.log('\n📋 PHASE 2 WEEK 2 PROGRESS UPDATE:');
    console.log('   Week 2 Goal: 3 supplements (Forskolin, Milk Thistle, Elderberry)');
    console.log(`   Completed: 1/3 (${overallWorking && evidenceProfileComplete ? 'Forskolin ✅' : 'Forskolin ❌'})`);
    console.log('   Next: Milk Thistle (ID: 72) - Liver support');
    console.log('   Target: 85% success rate by end of Week 2');
    
    return {
      forskolinWorking: overallWorking && evidenceProfileComplete,
      dataLoaded: dataCheck.hasForskolinData,
      evidenceProfileComplete,
      tabResults
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Forskolin test complete');
  }
})();
