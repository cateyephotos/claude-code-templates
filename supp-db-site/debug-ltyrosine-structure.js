const { chromium } = require('playwright');

(async () => {
  console.log('🔧 DEBUGGING L-TYROSINE DATA STRUCTURE');
  console.log('Investigating why all tabs show 0 study cards...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check L-Tyrosine data structure
    const dataAnalysis = await page.evaluate(() => {
      const id = 33;
      const data = window.enhancedCitations?.[id];
      
      if (!data) return { error: 'No L-Tyrosine data found' };
      
      return {
        supplementId: id,
        supplementName: data.supplementName,
        dataKeys: Object.keys(data),
        citationsExists: !!data.citations,
        citationsType: typeof data.citations,
        citationsKeys: data.citations ? Object.keys(data.citations) : null,
        isLegacyFormat: data.citations && typeof data.citations === 'object' && 
          Object.keys(data.citations).some(key => /^\d+$/.test(key)),
        hasStandardSections: data.citations && 
          ['benefits', 'safety', 'mechanisms'].some(section => data.citations[section]),
        rawCitationsPreview: data.citations ? 
          JSON.stringify(data.citations).substring(0, 500) : null
      };
    });
    
    console.log('\n📊 L-Tyrosine Data Structure Analysis:');
    console.log(`   Supplement Name: ${dataAnalysis.supplementName}`);
    console.log(`   Data Keys: ${dataAnalysis.dataKeys?.join(', ')}`);
    console.log(`   Citations Exists: ${dataAnalysis.citationsExists}`);
    console.log(`   Citations Type: ${dataAnalysis.citationsType}`);
    console.log(`   Citations Keys: ${dataAnalysis.citationsKeys?.join(', ')}`);
    console.log(`   Is Legacy Format: ${dataAnalysis.isLegacyFormat}`);
    console.log(`   Has Standard Sections: ${dataAnalysis.hasStandardSections}`);
    
    if (dataAnalysis.rawCitationsPreview) {
      console.log(`   Raw Citations Preview: ${dataAnalysis.rawCitationsPreview}...`);
    }
    
    // Test normalization
    const normalizationTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[33];
      
      if (!renderer || !data) return { error: 'Missing renderer or data' };
      
      try {
        // Test legacy format detection
        const isLegacy = renderer._isLegacyFormat(data.citations);
        
        // Test normalization
        const normalized = renderer._normalizeData(data);
        
        return {
          success: true,
          isLegacyDetected: isLegacy,
          originalStructure: data.citations ? Object.keys(data.citations).slice(0, 10) : [],
          normalizedBenefitsCount: normalized.citations?.benefits?.length || 0,
          normalizedSafetyCount: normalized.citations?.safety?.length || 0,
          normalizedMechanismsCount: normalized.citations?.mechanisms?.length || 0,
          normalizedPreview: normalized.citations ? 
            JSON.stringify(normalized.citations).substring(0, 300) : null
        };
      } catch (e) {
        return {
          error: 'Normalization error: ' + e.message,
          stack: e.stack
        };
      }
    });
    
    console.log('\n🔧 Normalization Test:');
    if (normalizationTest.error) {
      console.log(`   ❌ Error: ${normalizationTest.error}`);
      if (normalizationTest.stack) {
        console.log(`   Stack: ${normalizationTest.stack.substring(0, 200)}...`);
      }
    } else {
      console.log(`   Legacy Format Detected: ${normalizationTest.isLegacyDetected}`);
      console.log(`   Original Structure: ${normalizationTest.originalStructure.join(', ')}`);
      console.log(`   Normalized Counts: B:${normalizationTest.normalizedBenefitsCount} S:${normalizationTest.normalizedSafetyCount} M:${normalizationTest.normalizedMechanismsCount}`);
      if (normalizationTest.normalizedPreview) {
        console.log(`   Normalized Preview: ${normalizationTest.normalizedPreview}...`);
      }
    }
    
    // Test manual supplement opening
    console.log('\n🧪 Testing Manual Supplement Opening:');
    
    try {
      await page.fill('#searchInput', 'L-Tyrosine');
      await page.waitForTimeout(1000);
      
      await page.evaluate(async () => {
        await window.app.showSupplementDetails(33);
      });
      await page.waitForTimeout(2000);
      
      // Check if tabs are created
      const tabsCheck = await page.evaluate(() => {
        const benefitsTab = document.querySelector('.citation-tab-btn[onclick*="benefits-33"]');
        const safetyTab = document.querySelector('.citation-tab-btn[onclick*="safety-33"]');
        const mechanismsTab = document.querySelector('.citation-tab-btn[onclick*="mechanisms-33"]');
        
        const benefitsContainer = document.getElementById('benefits-33');
        const safetyContainer = document.getElementById('safety-33');
        const mechanismsContainer = document.getElementById('mechanisms-33');
        
        return {
          tabsExist: {
            benefits: !!benefitsTab,
            safety: !!safetyTab,
            mechanisms: !!mechanismsTab
          },
          containersExist: {
            benefits: !!benefitsContainer,
            safety: !!safetyContainer,
            mechanisms: !!mechanismsContainer
          },
          containerContent: {
            benefits: benefitsContainer ? benefitsContainer.innerHTML.length : 0,
            safety: safetyContainer ? safetyContainer.innerHTML.length : 0,
            mechanisms: mechanismsContainer ? mechanismsContainer.innerHTML.length : 0
          }
        };
      });
      
      console.log(`   Tabs Exist: B:${tabsCheck.tabsExist.benefits} S:${tabsCheck.tabsExist.safety} M:${tabsCheck.tabsExist.mechanisms}`);
      console.log(`   Containers Exist: B:${tabsCheck.containersExist.benefits} S:${tabsCheck.containersExist.safety} M:${tabsCheck.containersExist.mechanisms}`);
      console.log(`   Container Content Length: B:${tabsCheck.containerContent.benefits} S:${tabsCheck.containerContent.safety} M:${tabsCheck.containerContent.mechanisms}`);
      
    } catch (error) {
      console.log(`   ❌ Manual test error: ${error.message}`);
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    
    if (!dataAnalysis.citationsExists) {
      console.log('❌ L-Tyrosine: No citations object found');
    } else if (dataAnalysis.isLegacyFormat && normalizationTest.normalizedBenefitsCount === 0) {
      console.log('❌ L-Tyrosine: Legacy format detected but normalization failed');
      console.log('   Check legacy format conversion logic');
    } else if (!dataAnalysis.isLegacyFormat && !dataAnalysis.hasStandardSections) {
      console.log('❌ L-Tyrosine: Non-standard data structure');
      console.log('   Neither legacy format nor standard sections found');
    } else {
      console.log('✅ L-Tyrosine: Data structure looks correct');
      console.log('   Issue might be in rendering or tab creation');
    }
    
    return {
      dataAnalysis,
      normalizationTest
    };
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ L-Tyrosine structure debug complete');
  }
})();
