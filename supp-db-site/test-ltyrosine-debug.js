const { chromium } = require('playwright');

(async () => {
  console.log('🔧 DEBUGGING L-TYROSINE ISSUES');
  console.log('Investigating why L-Tyrosine (ID: 33) is not working...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('\n📊 JavaScript Error Analysis:');
    console.log(`   Total Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors:');
      errors.slice(0, 10).forEach(err => {
        console.log(`   ${err}`);
      });
    }
    
    console.log('\n🔍 Testing L-Tyrosine Data Loading...');
    
    // Check if L-Tyrosine data is loaded
    const dataCheck = await page.evaluate(() => {
      return {
        hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
        hasLTyrosineData: window.enhancedCitations && window.enhancedCitations[33] !== undefined,
        hasGlobalVar: typeof window.lTyrosineEnhanced !== 'undefined',
        lTyrosineDataKeys: window.enhancedCitations && window.enhancedCitations[33] ? 
          Object.keys(window.enhancedCitations[33]) : null,
        dataStructure: window.enhancedCitations && window.enhancedCitations[33] ? 
          {
            hasEnhancedCitations: Array.isArray(window.enhancedCitations[33].enhancedCitations),
            enhancedCitationsLength: window.enhancedCitations[33].enhancedCitations ? 
              window.enhancedCitations[33].enhancedCitations.length : 0,
            hasCitations: !!window.enhancedCitations[33].citations,
            supplementName: window.enhancedCitations[33].supplementName
          } : null
      };
    });
    
    console.log('\n📊 L-Tyrosine Data Check:');
    console.log(`   Enhanced Citations Exists: ${dataCheck.hasEnhancedCitations}`);
    console.log(`   L-Tyrosine Data Loaded: ${dataCheck.hasLTyrosineData}`);
    console.log(`   Global Variable Exists: ${dataCheck.hasGlobalVar}`);
    console.log(`   L-Tyrosine Data Keys: ${dataCheck.lTyrosineDataKeys?.join(', ')}`);
    
    if (dataCheck.dataStructure) {
      console.log('\n📋 Data Structure Analysis:');
      console.log(`   Supplement Name: ${dataCheck.dataStructure.supplementName}`);
      console.log(`   Has Enhanced Citations Array: ${dataCheck.dataStructure.hasEnhancedCitations}`);
      console.log(`   Enhanced Citations Length: ${dataCheck.dataStructure.enhancedCitationsLength}`);
      console.log(`   Has Standard Citations Object: ${dataCheck.dataStructure.hasCitations}`);
    }
    
    if (!dataCheck.hasLTyrosineData) {
      console.log('❌ L-Tyrosine data not loaded - check file loading');
      return;
    }
    
    console.log('\n🧪 Testing L-Tyrosine UI Rendering...');
    
    // Search and open L-Tyrosine supplement
    await page.fill('#searchInput', 'L-Tyrosine');
    await page.waitForTimeout(1000);
    
    try {
      await page.evaluate(async () => {
        await window.app.showSupplementDetails(33);
      });
      await page.waitForTimeout(3000);
      
      // Check if details panel is created
      const uiCheck = await page.evaluate(() => {
        const detailsPanel = document.getElementById('supplementDetails');
        const citationTabs = Array.from(document.querySelectorAll('.citation-tab-btn'));
        const containers = [
          document.getElementById('benefits-33'),
          document.getElementById('safety-33'),
          document.getElementById('mechanisms-33')
        ];
        
        return {
          detailsPanelExists: !!detailsPanel,
          detailsPanelVisible: detailsPanel && detailsPanel.style.display !== 'none',
          citationTabsCount: citationTabs.length,
          containersExist: containers.map(c => !!c),
          containerContent: containers.map(c => c ? c.innerHTML.length : 0),
          hasUndefined: containers.map(c => c ? c.innerHTML.includes('undefined') : false)
        };
      });
      
      console.log('\n📊 UI Rendering Check:');
      console.log(`   Details Panel Exists: ${uiCheck.detailsPanelExists}`);
      console.log(`   Details Panel Visible: ${uiCheck.detailsPanelVisible}`);
      console.log(`   Citation Tabs: ${uiCheck.citationTabsCount}`);
      console.log(`   Containers Exist: ${uiCheck.containersExist.join(', ')}`);
      console.log(`   Container Content: ${uiCheck.containerContent.join(', ')} chars`);
      console.log(`   Has Undefined: ${uiCheck.hasUndefined.join(', ')}`);
      
      if (uiCheck.detailsPanelExists && uiCheck.citationTabsCount > 0) {
        console.log('\n✅ L-Tyrosine UI elements created successfully');
        
        if (uiCheck.containerContent.some(length => length > 0)) {
          console.log('✅ L-Tyrosine content is rendering');
          
          // Test normalization
          const normalizationTest = await page.evaluate(() => {
            const renderer = window.CitationRenderer;
            const data = window.enhancedCitations?.[33];
            
            if (!renderer || !data) return { error: 'Missing renderer or data' };
            
            try {
              const normalized = renderer._normalizeData(data);
              
              return {
                success: true,
                isEnhancedArrayDetected: renderer._isEnhancedCitationsArray(data),
                normalizedBenefitsCount: normalized.citations?.benefits?.length || 0,
                normalizedSafetyCount: normalized.citations?.safety?.length || 0,
                normalizedMechanismsCount: normalized.citations?.mechanisms?.length || 0
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
          } else {
            console.log(`   Enhanced Array Detected: ${normalizationTest.isEnhancedArrayDetected}`);
            console.log(`   Normalized counts: B:${normalizationTest.normalizedBenefitsCount} S:${normalizationTest.normalizedSafetyCount} M:${normalizationTest.normalizedMechanismsCount}`);
          }
          
        } else {
          console.log('❌ L-Tyrosine tabs created but no content rendered');
        }
      } else {
        console.log('❌ L-Tyrosine UI elements not created properly');
      }
      
    } catch (error) {
      console.log(`❌ L-Tyrosine UI test error: ${error.message}`);
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    
    if (errors.length > 0) {
      console.log('❌ JavaScript errors are preventing proper functionality');
      console.log('   Need to resolve script errors first');
    } else if (!dataCheck.hasLTyrosineData) {
      console.log('❌ L-Tyrosine data not loading');
      console.log('   Check file path and loader configuration');
    } else if (dataCheck.dataStructure?.hasEnhancedCitations && dataCheck.dataStructure?.enhancedCitationsLength > 0) {
      console.log('✅ L-Tyrosine data loaded with enhanced citations array format');
      console.log('   Smart Citation Renderer should handle this format');
    } else {
      console.log('⚠️ L-Tyrosine data structure may need adjustment');
    }
    
    return {
      hasErrors: errors.length > 0,
      dataLoaded: dataCheck.hasLTyrosineData,
      uiWorking: uiCheck?.detailsPanelExists && uiCheck?.citationTabsCount > 0
    };
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ L-Tyrosine debug complete');
  }
})();
