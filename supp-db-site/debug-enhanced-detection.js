const { chromium } = require('playwright');

(async () => {
  console.log('🔧 DEBUGGING ENHANCED CITATION DETECTION');
  console.log('Checking how app detects enhanced citations...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check how the app detects enhanced citations for different supplements
    const detectionTest = await page.evaluate(() => {
      const supplements = window.supplements || [];
      const testSupplements = [
        { id: 2, name: 'Turmeric' },
        { id: 5, name: 'Creatine' },
        { id: 33, name: 'L-Tyrosine' }
      ];
      
      const results = {};
      
      testSupplements.forEach(({ id, name }) => {
        const supplement = supplements.find(s => s.id === id);
        const enhancedData = window.enhancedCitations?.[id];
        
        if (supplement) {
          results[name] = {
            id: id,
            supplementExists: true,
            hasIsEnhanced: !!supplement.isEnhanced,
            hasEnhancedCitations: !!supplement.enhancedCitations,
            enhancedCitationsIsEnhanced: supplement.enhancedCitations?.isEnhanced,
            enhancedDataExists: !!enhancedData,
            enhancedDataKeys: enhancedData ? Object.keys(enhancedData) : null,
            detectionResult: supplement.enhancedCitations && supplement.enhancedCitations.isEnhanced
          };
        } else {
          results[name] = {
            id: id,
            supplementExists: false
          };
        }
      });
      
      return results;
    });
    
    console.log('\n📊 Enhanced Citation Detection Analysis:');
    
    Object.entries(detectionTest).forEach(([name, data]) => {
      console.log(`\n${name} (ID: ${data.id}):`);
      console.log(`   Supplement Exists: ${data.supplementExists}`);
      if (data.supplementExists) {
        console.log(`   Has isEnhanced: ${data.hasIsEnhanced}`);
        console.log(`   Has enhancedCitations: ${data.hasEnhancedCitations}`);
        console.log(`   enhancedCitations.isEnhanced: ${data.enhancedCitationsIsEnhanced}`);
        console.log(`   Enhanced Data Exists: ${data.enhancedDataExists}`);
        console.log(`   Enhanced Data Keys: ${data.enhancedDataKeys?.join(', ')}`);
        console.log(`   Detection Result: ${data.detectionResult ? '✅ DETECTED' : '❌ NOT DETECTED'}`);
      }
    });
    
    // Test manual detection fix
    console.log('\n🔧 Testing Manual Detection Fix:');
    
    const manualTest = await page.evaluate(() => {
      const supplements = window.supplements || [];
      const lTyrosine = supplements.find(s => s.id === 33);
      
      if (!lTyrosine) return { error: 'L-Tyrosine not found' };
      
      // Check current state
      const currentDetection = lTyrosine.enhancedCitations && lTyrosine.enhancedCitations.isEnhanced;
      
      // Try to fix by adding enhancedCitations object
      if (!lTyrosine.enhancedCitations) {
        lTyrosine.enhancedCitations = { isEnhanced: true };
      } else if (!lTyrosine.enhancedCitations.isEnhanced) {
        lTyrosine.enhancedCitations.isEnhanced = true;
      }
      
      const fixedDetection = lTyrosine.enhancedCitations && lTyrosine.enhancedCitations.isEnhanced;
      
      return {
        currentDetection: currentDetection,
        fixedDetection: fixedDetection,
        lTyrosineStructure: {
          id: lTyrosine.id,
          name: lTyrosine.name,
          isEnhanced: lTyrosine.isEnhanced,
          enhancedCitations: lTyrosine.enhancedCitations
        }
      };
    });
    
    console.log(`   Current Detection: ${manualTest.currentDetection ? '✅' : '❌'}`);
    console.log(`   Fixed Detection: ${manualTest.fixedDetection ? '✅' : '❌'}`);
    console.log(`   L-Tyrosine Structure: ${JSON.stringify(manualTest.lTyrosineStructure, null, 2)}`);
    
    if (manualTest.fixedDetection) {
      console.log('\n🧪 Testing L-Tyrosine After Fix:');
      
      try {
        await page.fill('#searchInput', 'L-Tyrosine');
        await page.waitForTimeout(1000);
        
        await page.evaluate(async () => {
          await window.app.showSupplementDetails(33);
        });
        await page.waitForTimeout(2000);
        
        // Check if tabs are now created
        const tabsCheck = await page.evaluate(() => {
          const tabs = Array.from(document.querySelectorAll('.citation-tab-btn'));
          const containers = [
            document.getElementById('benefits-33'),
            document.getElementById('safety-33'),
            document.getElementById('mechanisms-33')
          ];
          
          return {
            tabCount: tabs.length,
            tabTexts: tabs.map(tab => tab.textContent.trim()),
            containersExist: containers.map(c => !!c),
            containerContent: containers.map(c => c ? c.innerHTML.length : 0)
          };
        });
        
        console.log(`   Citation Tabs: ${tabsCheck.tabCount} (${tabsCheck.tabTexts.join(', ')})`);
        console.log(`   Containers Exist: ${tabsCheck.containersExist.join(', ')}`);
        console.log(`   Container Content: ${tabsCheck.containerContent.join(', ')} chars`);
        
        if (tabsCheck.tabCount > 0) {
          console.log('   ✅ L-Tyrosine enhanced citations now working!');
        } else {
          console.log('   ❌ L-Tyrosine still not working');
        }
        
      } catch (error) {
        console.log(`   ❌ Test error: ${error.message}`);
      }
    }
    
    return detectionTest;
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Enhanced citation detection debug complete');
  }
})();
