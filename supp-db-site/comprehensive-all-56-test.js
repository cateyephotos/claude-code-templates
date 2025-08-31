const { chromium } = require('playwright');

(async () => {
  console.log('🔍 COMPREHENSIVE TEST OF ALL 56 SUPPLEMENTS');
  console.log('Verifying each supplement individually - no extrapolation...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all supplements from the database
    const allSupplements = await page.evaluate(() => {
      return window.supplements || [];
    });
    
    console.log(`\n📊 Found ${allSupplements.length} supplements in database`);
    
    const results = [];
    const workingSupplements = [];
    const brokenSupplements = [];
    const missingDataSupplements = [];
    const notFoundSupplements = [];
    
    // Test each supplement ID from 1 to 56
    for (let id = 1; id <= 56; id++) {
      const supplement = allSupplements.find(s => s.id === id);
      const supplementName = supplement ? supplement.name : `Unknown-${id}`;
      
      console.log(`\n🔍 Testing ID ${id}: ${supplementName}...`);
      
      if (!supplement) {
        console.log(`   ❌ Not found in supplements database`);
        notFoundSupplements.push({ id, name: supplementName, issue: 'Not in database' });
        continue;
      }
      
      try {
        // Check if enhanced citation data exists
        const hasEnhancedData = await page.evaluate((suppId) => {
          return window.enhancedCitations && window.enhancedCitations[suppId] !== undefined;
        }, id);
        
        if (!hasEnhancedData) {
          console.log(`   ❌ No enhanced citation data found`);
          missingDataSupplements.push({ 
            id, 
            name: supplementName, 
            category: supplement.category,
            issue: 'Missing enhanced citation data' 
          });
          continue;
        }
        
        // Search and open supplement
        await page.fill('#searchInput', supplementName);
        await page.waitForTimeout(500);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, id);
        await page.waitForTimeout(1500);
        
        // Test all three tabs
        const tabResults = await page.evaluate((suppId) => {
          const benefitsContainer = document.getElementById(`benefits-${suppId}`);
          const safetyContainer = document.getElementById(`safety-${suppId}`);
          const mechanismsContainer = document.getElementById(`mechanisms-${suppId}`);
          
          const getBenefitsData = () => {
            if (!benefitsContainer) return { studyCards: 0, hasUndefined: true, error: 'Container not found' };
            const studyCards = Array.from(benefitsContainer.querySelectorAll('.bg-gray-50'));
            const hasUndefined = benefitsContainer.innerHTML.includes('undefined');
            const hasPMID = benefitsContainer.innerHTML.includes('PMID');
            return { studyCards: studyCards.length, hasUndefined, hasPMID };
          };
          
          const getSafetyData = () => {
            if (!safetyContainer) return { studyCards: 0, error: 'Container not found' };
            const studyCards = Array.from(safetyContainer.querySelectorAll('.bg-gray-50'));
            const hasPMID = safetyContainer.innerHTML.includes('PMID');
            return { studyCards: studyCards.length, hasPMID };
          };
          
          const getMechanismsData = () => {
            if (!mechanismsContainer) return { studyCards: 0, error: 'Container not found' };
            const studyCards = Array.from(mechanismsContainer.querySelectorAll('.bg-gray-50'));
            const hasPMID = mechanismsContainer.innerHTML.includes('PMID');
            return { studyCards: studyCards.length, hasPMID };
          };
          
          return {
            benefits: getBenefitsData(),
            safety: getSafetyData(),
            mechanisms: getMechanismsData()
          };
        }, id);
        
        const benefitsWorking = tabResults.benefits.studyCards > 0 && !tabResults.benefits.hasUndefined;
        const safetyWorking = tabResults.safety.studyCards > 0;
        const mechanismsWorking = tabResults.mechanisms.studyCards > 0;
        const overallWorking = benefitsWorking && safetyWorking && mechanismsWorking;
        
        const result = {
          id: id,
          name: supplementName,
          category: supplement.category,
          benefitsWorking: benefitsWorking,
          safetyWorking: safetyWorking,
          mechanismsWorking: mechanismsWorking,
          overallWorking: overallWorking,
          hasEnhancedData: true,
          details: tabResults
        };
        
        results.push(result);
        
        if (overallWorking) {
          workingSupplements.push(result);
        } else {
          brokenSupplements.push(result);
        }
        
        const status = overallWorking ? '✅' : '❌';
        const workingTabs = [benefitsWorking, safetyWorking, mechanismsWorking].filter(Boolean).length;
        console.log(`   ${status} ${workingTabs}/3 tabs (B:${tabResults.benefits.studyCards} S:${tabResults.safety.studyCards} M:${tabResults.mechanisms.studyCards})`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        brokenSupplements.push({
          id: id,
          name: supplementName,
          category: supplement ? supplement.category : 'Unknown',
          overallWorking: false,
          hasEnhancedData: true,
          error: error.message
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE ALL 56 SUPPLEMENTS RESULTS');
    console.log('='.repeat(80));
    
    const totalSupplements = 56;
    const workingCount = workingSupplements.length;
    const brokenCount = brokenSupplements.length;
    const missingDataCount = missingDataSupplements.length;
    const notFoundCount = notFoundSupplements.length;
    const actualSuccessRate = Math.round((workingCount / totalSupplements) * 100);
    
    console.log(`\n📈 REAL SUCCESS RATE (No Extrapolation):`);
    console.log(`   Working: ${workingCount}/56 (${actualSuccessRate}%)`);
    console.log(`   Broken (with data): ${brokenCount}/56`);
    console.log(`   Missing Enhanced Data: ${missingDataCount}/56`);
    console.log(`   Not in Database: ${notFoundCount}/56`);
    console.log(`   Total Tested: ${workingCount + brokenCount + missingDataCount + notFoundCount}/56`);
    
    console.log('\n✅ WORKING SUPPLEMENTS:');
    workingSupplements.forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
    });
    
    console.log('\n❌ BROKEN SUPPLEMENTS (Have Data, Need Fixes):');
    brokenSupplements.forEach(supp => {
      if (supp.error) {
        console.log(`   ${supp.name} (ID: ${supp.id}) - Error: ${supp.error}`);
      } else {
        const issues = [];
        if (!supp.benefitsWorking) issues.push('Benefits');
        if (!supp.safetyWorking) issues.push('Safety');
        if (!supp.mechanismsWorking) issues.push('Mechanisms');
        console.log(`   ${supp.name} (ID: ${supp.id}) - Issues: ${issues.join(', ')}`);
      }
    });
    
    console.log('\n📋 MISSING ENHANCED CITATION DATA (Need Research):');
    missingDataSupplements.forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
    });
    
    console.log('\n🚫 NOT IN DATABASE:');
    notFoundSupplements.forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id})`);
    });
    
    console.log('\n🎯 ACTION PLAN TO REACH 95%:');
    const targetWorking = Math.ceil(56 * 0.95); // 54 supplements
    const needToFix = targetWorking - workingCount;
    
    console.log(`   Target (95%): ${targetWorking}/56 supplements working`);
    console.log(`   Current: ${workingCount}/56 supplements working`);
    console.log(`   Need to fix: ${needToFix} more supplements`);
    
    if (brokenCount > 0) {
      console.log(`\n🔧 IMMEDIATE FIXES (${brokenCount} supplements):`);
      console.log(`   Priority 1: Fix ${brokenCount} broken supplements with existing data`);
    }
    
    if (missingDataCount > 0) {
      console.log(`\n📚 RESEARCH REQUIRED (${missingDataCount} supplements):`);
      console.log(`   Priority 2: Research and create enhanced citations for:`);
      missingDataSupplements.slice(0, Math.min(10, needToFix - brokenCount)).forEach(supp => {
        console.log(`     - ${supp.name} (${supp.category})`);
      });
      
      if (missingDataCount > 10) {
        console.log(`     ... and ${missingDataCount - 10} more supplements`);
      }
    }
    
    console.log('\n📊 RESEARCH PRIORITY CATEGORIES:');
    const categoryCount = {};
    missingDataSupplements.forEach(supp => {
      categoryCount[supp.category] = (categoryCount[supp.category] || 0) + 1;
    });
    
    Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} supplements need research`);
      });
    
    return {
      totalSupplements,
      workingCount,
      brokenCount,
      missingDataCount,
      notFoundCount,
      actualSuccessRate,
      workingSupplements,
      brokenSupplements,
      missingDataSupplements,
      notFoundSupplements,
      needToFix
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive all 56 supplements test complete');
  }
})();
