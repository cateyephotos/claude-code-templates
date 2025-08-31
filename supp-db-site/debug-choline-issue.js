const { chromium } = require('playwright');

(async () => {
  console.log('🔧 DEBUGGING CHOLINE ISSUE');
  console.log('Investigating why Safety and Mechanisms tabs are broken...');
  
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
    
    // Check data structure
    const dataAnalysis = await page.evaluate(() => {
      const cholineData = window.enhancedCitations?.[43];
      
      if (!cholineData) return { error: 'No Choline data found' };
      
      return {
        supplementId: 43,
        supplementName: cholineData.supplementName,
        dataKeys: Object.keys(cholineData),
        citationsStructure: cholineData.citations ? Object.keys(cholineData.citations) : null,
        benefitsCount: cholineData.citations?.benefits?.length || 0,
        safetyCount: cholineData.citations?.safety?.length || 0,
        mechanismsCount: cholineData.citations?.mechanisms?.length || 0,
        isLegacyFormat: cholineData.citations && typeof cholineData.citations === 'object' && 
          Object.keys(cholineData.citations).some(key => /^\d+$/.test(key)),
        hasEnhancedCitationsArray: Array.isArray(cholineData.enhancedCitations)
      };
    });
    
    console.log('\n📊 Choline Data Analysis:');
    console.log(`   Supplement Name: ${dataAnalysis.supplementName}`);
    console.log(`   Data Keys: ${dataAnalysis.dataKeys?.join(', ')}`);
    console.log(`   Citations Structure: ${dataAnalysis.citationsStructure?.join(', ')}`);
    console.log(`   Benefits Count: ${dataAnalysis.benefitsCount}`);
    console.log(`   Safety Count: ${dataAnalysis.safetyCount}`);
    console.log(`   Mechanisms Count: ${dataAnalysis.mechanismsCount}`);
    console.log(`   Is Legacy Format: ${dataAnalysis.isLegacyFormat}`);
    console.log(`   Has Enhanced Citations Array: ${dataAnalysis.hasEnhancedCitationsArray}`);
    
    // Test each tab individually
    console.log('\n🧪 Testing Individual Tabs:');
    
    // Benefits tab (should be working)
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(1000);
    
    const benefitsResult = await page.evaluate(() => {
      const container = document.getElementById('benefits-43');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      const innerHTML = container.innerHTML;
      
      return {
        totalCards: cards.length,
        studyCards: studyCards.length,
        hasPMID: innerHTML.includes('PMID'),
        hasUndefined: innerHTML.includes('undefined'),
        undefinedCount: (innerHTML.match(/undefined/g) || []).length,
        htmlLength: innerHTML.length,
        htmlPreview: innerHTML.substring(0, 300)
      };
    });
    
    console.log(`   Benefits: ${benefitsResult.studyCards} study cards, ${benefitsResult.undefinedCount} undefined`);
    
    // Safety tab (should be broken)
    const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
    await safetyTab.click();
    await page.waitForTimeout(1000);
    
    const safetyResult = await page.evaluate(() => {
      const container = document.getElementById('safety-43');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      const innerHTML = container.innerHTML;
      
      return {
        totalCards: cards.length,
        studyCards: studyCards.length,
        hasPMID: innerHTML.includes('PMID'),
        hasUndefined: innerHTML.includes('undefined'),
        undefinedCount: (innerHTML.match(/undefined/g) || []).length,
        htmlLength: innerHTML.length,
        htmlPreview: innerHTML.substring(0, 300)
      };
    });
    
    console.log(`   Safety: ${safetyResult.studyCards} study cards, ${safetyResult.undefinedCount} undefined`);
    if (safetyResult.htmlPreview) {
      console.log(`   Safety HTML Preview: ${safetyResult.htmlPreview}...`);
    }
    
    // Mechanisms tab (should be broken)
    const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
    await mechanismsTab.click();
    await page.waitForTimeout(1000);
    
    const mechanismsResult = await page.evaluate(() => {
      const container = document.getElementById('mechanisms-43');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
      const innerHTML = container.innerHTML;
      
      return {
        totalCards: cards.length,
        studyCards: studyCards.length,
        hasPMID: innerHTML.includes('PMID'),
        hasUndefined: innerHTML.includes('undefined'),
        undefinedCount: (innerHTML.match(/undefined/g) || []).length,
        htmlLength: innerHTML.length,
        htmlPreview: innerHTML.substring(0, 300)
      };
    });
    
    console.log(`   Mechanisms: ${mechanismsResult.studyCards} study cards, ${mechanismsResult.undefinedCount} undefined`);
    if (mechanismsResult.htmlPreview) {
      console.log(`   Mechanisms HTML Preview: ${mechanismsResult.htmlPreview}...`);
    }
    
    // Test normalization
    console.log('\n🔧 Testing Normalization:');
    
    const normalizationTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[43];
      
      if (!renderer || !data) return { error: 'Missing renderer or data' };
      
      try {
        const normalized = renderer._normalizeData(data);
        
        return {
          success: true,
          originalBenefitsCount: data.citations?.benefits?.length || 0,
          originalSafetyCount: data.citations?.safety?.length || 0,
          originalMechanismsCount: data.citations?.mechanisms?.length || 0,
          normalizedBenefitsCount: normalized.citations?.benefits?.length || 0,
          normalizedSafetyCount: normalized.citations?.safety?.length || 0,
          normalizedMechanismsCount: normalized.citations?.mechanisms?.length || 0,
          isLegacyDetected: renderer._isLegacyFormat(data.citations),
          isEnhancedArrayDetected: renderer._isEnhancedCitationsArray(data)
        };
      } catch (e) {
        return {
          error: 'Normalization error: ' + e.message,
          stack: e.stack
        };
      }
    });
    
    if (normalizationTest.error) {
      console.log(`   ❌ Error: ${normalizationTest.error}`);
    } else {
      console.log(`   Original counts: B:${normalizationTest.originalBenefitsCount} S:${normalizationTest.originalSafetyCount} M:${normalizationTest.originalMechanismsCount}`);
      console.log(`   Normalized counts: B:${normalizationTest.normalizedBenefitsCount} S:${normalizationTest.normalizedSafetyCount} M:${normalizationTest.normalizedMechanismsCount}`);
      console.log(`   Legacy format detected: ${normalizationTest.isLegacyDetected}`);
      console.log(`   Enhanced array detected: ${normalizationTest.isEnhancedArrayDetected}`);
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    
    if (dataAnalysis.safetyCount === 0 && dataAnalysis.mechanismsCount === 0) {
      console.log('❌ Choline: Missing safety and mechanisms data in source file');
      console.log('   Solution: Add safety and mechanisms data to enhanced citation file');
    } else if (safetyResult.undefinedCount > 0 || mechanismsResult.undefinedCount > 0) {
      console.log('❌ Choline: Data exists but rendering shows undefined values');
      console.log('   Solution: Fix data structure or field mapping issues');
    } else if (normalizationTest.normalizedSafetyCount === 0 || normalizationTest.normalizedMechanismsCount === 0) {
      console.log('❌ Choline: Normalization not creating safety/mechanisms data');
      console.log('   Solution: Fix normalization logic for this data format');
    } else {
      console.log('✅ Choline: Data structure looks correct, check rendering logic');
    }
    
    return {
      dataAnalysis,
      benefitsResult,
      safetyResult,
      mechanismsResult,
      normalizationTest
    };
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Choline debug complete');
  }
})();
