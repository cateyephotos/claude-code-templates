const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Data Structure Fixes');
  console.log('Verifying that problematic supplements are now working...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test the previously problematic supplements
    const testSupplements = [
      { name: 'Alpha-Lipoic Acid', id: 44, expectedM: 5, expectedB: 6, expectedS: 3 },
      { name: 'Choline', id: 15, expectedM: 4, expectedB: 6, expectedS: 2 },
      { name: 'GABA', id: 25, expectedM: 5, expectedB: 5, expectedS: 3 },
      { name: 'Inositol', id: 26, expectedM: 4, expectedB: 8, expectedS: 2 },
      { name: 'Iron', id: 38, expectedM: 4, expectedB: 6, expectedS: 2 },
      { name: 'Zinc', id: 37, expectedM: 4, expectedB: 7, expectedS: 2 }
    ];
    
    console.log(`\n📊 Testing ${testSupplements.length} previously problematic supplements`);
    console.log('='.repeat(80));
    
    const results = {
      fixed: [],
      stillBroken: [],
      noData: []
    };
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing: ${supplement.name} (ID: ${supplement.id})`);
      
      // Check if data is loaded
      const dataCheck = await page.evaluate((suppId) => {
        const data = window.enhancedCitations?.[suppId];
        if (!data) return { hasData: false };
        
        return {
          hasData: true,
          supplementName: data.name || data.supplementName,
          mechanismsCount: data.citations?.mechanisms?.length || 0,
          benefitsCount: data.citations?.benefits?.length || 0,
          safetyCount: data.citations?.safety?.length || 0,
          hasNewFormat: !!data.version || !!data.isEnhanced
        };
      }, supplement.id);
      
      if (!dataCheck.hasData) {
        console.log(`   ❌ No enhanced citation data found`);
        results.noData.push(supplement);
        continue;
      }
      
      console.log(`   📊 Data: M(${dataCheck.mechanismsCount}), B(${dataCheck.benefitsCount}), S(${dataCheck.safetyCount})`);
      console.log(`   📋 Expected: M(${supplement.expectedM}), B(${supplement.expectedB}), S(${supplement.expectedS})`);
      console.log(`   🔧 Format: ${dataCheck.hasNewFormat ? 'New Format' : 'Legacy Format'}`);
      
      // Test modal and tab counts
      await page.fill('#searchInput', supplement.name);
      await page.waitForTimeout(500);
      
      const modalResult = await page.evaluate(async (suppId) => {
        try {
          await window.app.showSupplementDetails(suppId);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, supplement.id);
      
      if (!modalResult.success) {
        console.log(`   ❌ Modal Error: ${modalResult.error}`);
        results.stillBroken.push({ ...supplement, issue: 'Modal Error' });
        continue;
      }
      
      await page.waitForTimeout(300);
      
      // Check rendered tab counts
      const tabCounts = await page.evaluate((suppId) => {
        const counts = {};
        ['mechanisms', 'benefits', 'safety'].forEach(type => {
          const container = document.getElementById(`${type}-${suppId}`);
          counts[type] = container ? container.querySelectorAll('.enhanced-citation-card').length : 0;
        });
        return counts;
      }, supplement.id);
      
      console.log(`   🖥️ Rendered: M(${tabCounts.mechanisms}), B(${tabCounts.benefits}), S(${tabCounts.safety})`);
      
      // Check if fixed
      const mechanismsFixed = tabCounts.mechanisms === supplement.expectedM;
      const benefitsFixed = tabCounts.benefits === supplement.expectedB;
      const safetyFixed = tabCounts.safety === supplement.expectedS;
      const allFixed = mechanismsFixed && benefitsFixed && safetyFixed;
      
      if (allFixed) {
        console.log(`   🎉 FIXED! All tab counts match expected values`);
        results.fixed.push(supplement);
      } else {
        const issues = [];
        if (!mechanismsFixed) issues.push(`M:${tabCounts.mechanisms}≠${supplement.expectedM}`);
        if (!benefitsFixed) issues.push(`B:${tabCounts.benefits}≠${supplement.expectedB}`);
        if (!safetyFixed) issues.push(`S:${tabCounts.safety}≠${supplement.expectedS}`);
        
        console.log(`   🔧 Still has issues: ${issues.join(', ')}`);
        results.stillBroken.push({ ...supplement, issues: issues });
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 FIX VERIFICATION RESULTS');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Results Summary:`);
    console.log(`   🎉 Fixed: ${results.fixed.length} supplements`);
    console.log(`   🔧 Still Broken: ${results.stillBroken.length} supplements`);
    console.log(`   ❌ No Data: ${results.noData.length} supplements`);
    
    if (results.fixed.length > 0) {
      console.log(`\n🎉 SUCCESSFULLY FIXED:`);
      results.fixed.forEach(supp => {
        console.log(`   ✅ ${supp.name}`);
      });
    }
    
    if (results.stillBroken.length > 0) {
      console.log(`\n🔧 STILL NEED WORK:`);
      results.stillBroken.forEach(supp => {
        console.log(`   🔧 ${supp.name}: ${supp.issues ? supp.issues.join(', ') : supp.issue}`);
      });
    }
    
    if (results.noData.length > 0) {
      console.log(`\n❌ NO ENHANCED DATA:`);
      results.noData.forEach(supp => {
        console.log(`   ❌ ${supp.name}: Need to create enhanced citation file`);
      });
    }
    
    const fixRate = Math.round((results.fixed.length / testSupplements.length) * 100);
    console.log(`\n🎯 Fix Success Rate: ${fixRate}% (${results.fixed.length}/${testSupplements.length})`);
    
    if (fixRate >= 80) {
      console.log(`\n🎉 EXCELLENT! Most issues have been resolved.`);
    } else if (fixRate >= 50) {
      console.log(`\n✅ GOOD PROGRESS! About half the issues are fixed.`);
    } else {
      console.log(`\n🔧 MORE WORK NEEDED! Additional fixes required.`);
    }
    
    console.log(`\n💡 Next Steps:`);
    if (results.noData.length > 0) {
      console.log(`   1. Create enhanced citation files for supplements with no data`);
    }
    if (results.stillBroken.length > 0) {
      console.log(`   2. Investigate remaining tab count issues`);
    }
    console.log(`   3. Run comprehensive audit to verify all supplements`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Fix verification complete');
  }
})();
