const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUGGING DATA LOADING ISSUES');
  console.log('Checking what data is actually loaded for broken supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Give extra time for all files to load
    
    // Check what data is available for the broken supplements
    const dataCheck = await page.evaluate(() => {
      const supplements = [23, 33, 35]; // Folate, L-Tyrosine, Tribulus Terrestris
      const results = {};
      
      supplements.forEach(id => {
        results[id] = {
          id: id,
          hasEnhancedCitation: window.enhancedCitations && window.enhancedCitations[id] !== undefined,
          enhancedCitationData: window.enhancedCitations && window.enhancedCitations[id] ? 
            Object.keys(window.enhancedCitations[id]) : null,
          globalVars: {
            folateEnhanced: typeof window.folateEnhanced !== 'undefined',
            lTyrosineEnhanced: typeof window.lTyrosineEnhanced !== 'undefined',
            tribulusTerrestrisEnhanced: typeof window.tribulusTerrestrisEnhanced !== 'undefined'
          }
        };
      });
      
      return {
        enhancedCitationsExists: typeof window.enhancedCitations !== 'undefined',
        enhancedCitationsKeys: window.enhancedCitations ? Object.keys(window.enhancedCitations) : [],
        supplementResults: results,
        allGlobalVars: Object.keys(window).filter(key => key.includes('Enhanced')),
        citationLoaderExists: typeof window.EnhancedCitationLoader !== 'undefined'
      };
    });
    
    console.log('\n📊 Data Loading Analysis:');
    console.log(`   Enhanced Citations Exists: ${dataCheck.enhancedCitationsExists}`);
    console.log(`   Citation Loader Exists: ${dataCheck.citationLoaderExists}`);
    console.log(`   Enhanced Citation Keys: ${dataCheck.enhancedCitationsKeys.slice(0, 10).join(', ')}...`);
    console.log(`   All Enhanced Global Vars: ${dataCheck.allGlobalVars.join(', ')}`);
    
    console.log('\n🔍 Specific Supplement Analysis:');
    
    Object.values(dataCheck.supplementResults).forEach(result => {
      const suppName = result.id === 23 ? 'Folate' : result.id === 33 ? 'L-Tyrosine' : 'Tribulus Terrestris';
      console.log(`\n${suppName} (ID: ${result.id}):`);
      console.log(`   Has Enhanced Citation: ${result.hasEnhancedCitation}`);
      if (result.enhancedCitationData) {
        console.log(`   Citation Data Keys: ${result.enhancedCitationData.slice(0, 5).join(', ')}`);
      }
      console.log(`   Global Variables:`);
      Object.entries(result.globalVars).forEach(([key, exists]) => {
        console.log(`     ${key}: ${exists ? '✅' : '❌'}`);
      });
    });
    
    // Test direct citation rendering for one of them
    console.log('\n🧪 Testing Direct Citation Rendering:');
    
    const renderingTest = await page.evaluate(() => {
      const testId = 23; // Folate
      const data = window.enhancedCitations && window.enhancedCitations[testId];
      
      if (!data) {
        return { error: 'No data found for Folate (ID: 23)' };
      }
      
      const renderer = window.CitationRenderer;
      if (!renderer) {
        return { error: 'CitationRenderer not found' };
      }
      
      const benefits = data.citations && data.citations.benefits;
      if (!benefits || !Array.isArray(benefits)) {
        return { 
          error: 'No benefits array found',
          dataStructure: Object.keys(data),
          citationsStructure: data.citations ? Object.keys(data.citations) : null
        };
      }
      
      try {
        const firstBenefit = benefits[0];
        const renderedCard = renderer.renderBenefitCard(firstBenefit);
        
        return {
          success: true,
          benefitsCount: benefits.length,
          firstBenefitKeys: Object.keys(firstBenefit),
          renderedLength: renderedCard.length,
          hasUndefined: renderedCard.includes('undefined'),
          preview: renderedCard.substring(0, 200)
        };
      } catch (e) {
        return {
          error: 'Rendering error: ' + e.message,
          benefitsCount: benefits.length,
          firstBenefitKeys: Object.keys(benefits[0] || {})
        };
      }
    });
    
    console.log('\nFolate Rendering Test:');
    if (renderingTest.error) {
      console.log(`   ❌ Error: ${renderingTest.error}`);
      if (renderingTest.dataStructure) {
        console.log(`   Data Structure: ${renderingTest.dataStructure.join(', ')}`);
      }
      if (renderingTest.citationsStructure) {
        console.log(`   Citations Structure: ${renderingTest.citationsStructure.join(', ')}`);
      }
    } else {
      console.log(`   ✅ Success: ${renderingTest.benefitsCount} benefits found`);
      console.log(`   First Benefit Keys: ${renderingTest.firstBenefitKeys.join(', ')}`);
      console.log(`   Rendered Length: ${renderingTest.renderedLength} chars`);
      console.log(`   Has Undefined: ${renderingTest.hasUndefined ? '❌' : '✅'}`);
      console.log(`   Preview: ${renderingTest.preview}...`);
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    
    const folateData = dataCheck.supplementResults[23];
    const lTyrosineData = dataCheck.supplementResults[33];
    const tribulusData = dataCheck.supplementResults[35];
    
    if (!folateData.hasEnhancedCitation) {
      console.log('❌ Folate: Enhanced citation data not loaded');
    } else if (!dataCheck.globalVars.folateEnhanced) {
      console.log('❌ Folate: Global variable not set');
    } else {
      console.log('✅ Folate: Data loaded but rendering issue');
    }
    
    if (!lTyrosineData.hasEnhancedCitation) {
      console.log('❌ L-Tyrosine: Enhanced citation data not loaded');
    } else if (!dataCheck.globalVars.lTyrosineEnhanced) {
      console.log('❌ L-Tyrosine: Global variable not set');
    } else {
      console.log('✅ L-Tyrosine: Data loaded but rendering issue');
    }
    
    if (!tribulusData.hasEnhancedCitation) {
      console.log('❌ Tribulus Terrestris: Enhanced citation data not loaded');
    } else if (!dataCheck.globalVars.tribulusTerrestrisEnhanced) {
      console.log('❌ Tribulus Terrestris: Global variable not set');
    } else {
      console.log('✅ Tribulus Terrestris: Data loaded but rendering issue');
    }
    
    return dataCheck;
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Data loading debug complete');
  }
})();
