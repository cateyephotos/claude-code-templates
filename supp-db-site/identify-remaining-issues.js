const { chromium } = require('playwright');

(async () => {
  console.log('🔍 IDENTIFYING REMAINING 14 SUPPLEMENTS TO FIX');
  console.log('Comprehensive audit to find all broken supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all supplement IDs from the data
    const allSupplements = await page.evaluate(() => {
      const supplements = window.supplements || [];
      return supplements.map(supp => ({
        id: supp.id,
        name: supp.name,
        category: supp.category
      })).slice(0, 56); // First 56 supplements
    });
    
    console.log(`\n📊 Testing ${allSupplements.length} supplements...`);
    
    const results = [];
    const brokenSupplements = [];
    const workingSupplements = [];
    
    for (let i = 0; i < allSupplements.length; i++) {
      const supplement = allSupplements[i];
      
      if (i % 10 === 0) {
        console.log(`\n🔄 Progress: ${i}/${allSupplements.length} supplements tested...`);
      }
      
      try {
        // Search and open supplement
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(300);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1000);
        
        // Test all three tabs quickly
        const tabResults = {};
        
        // Benefits tab
        const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
        await benefitsTab.click();
        await page.waitForTimeout(300);
        
        const benefitsResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          const hasPMID = container.innerHTML.includes('PMID');
          const hasUndefined = container.innerHTML.includes('undefined');
          
          return {
            studyCards: studyCards.length,
            hasPMID: hasPMID,
            hasUndefined: hasUndefined
          };
        }, supplement.id);
        
        // Safety tab
        const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
        await safetyTab.click();
        await page.waitForTimeout(300);
        
        const safetyResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`safety-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          const hasPMID = container.innerHTML.includes('PMID');
          
          return {
            studyCards: studyCards.length,
            hasPMID: hasPMID
          };
        }, supplement.id);
        
        // Mechanisms tab
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        await mechanismsTab.click();
        await page.waitForTimeout(300);
        
        const mechanismsResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`mechanisms-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          const hasPMID = container.innerHTML.includes('PMID');
          
          return {
            studyCards: studyCards.length,
            hasPMID: hasPMID
          };
        }, supplement.id);
        
        // Determine working status
        const benefitsWorking = benefitsResult.studyCards > 0 && !benefitsResult.hasUndefined;
        const safetyWorking = safetyResult.studyCards > 0;
        const mechanismsWorking = mechanismsResult.studyCards > 0;
        
        const overallWorking = benefitsWorking && safetyWorking && mechanismsWorking;
        
        const result = {
          id: supplement.id,
          name: supplement.name,
          category: supplement.category,
          benefitsWorking: benefitsWorking,
          safetyWorking: safetyWorking,
          mechanismsWorking: mechanismsWorking,
          overallWorking: overallWorking,
          issues: [],
          details: {
            benefits: benefitsResult,
            safety: safetyResult,
            mechanisms: mechanismsResult
          }
        };
        
        // Identify specific issues
        if (!benefitsWorking) {
          if (benefitsResult.studyCards === 0) result.issues.push('Benefits: No study cards');
          if (benefitsResult.hasUndefined) result.issues.push('Benefits: Undefined values');
          if (!benefitsResult.hasPMID) result.issues.push('Benefits: Missing PMIDs');
        }
        if (!safetyWorking) {
          if (safetyResult.studyCards === 0) result.issues.push('Safety: No study cards');
          if (!safetyResult.hasPMID) result.issues.push('Safety: Missing PMIDs');
        }
        if (!mechanismsWorking) {
          if (mechanismsResult.studyCards === 0) result.issues.push('Mechanisms: No study cards');
          if (!mechanismsResult.hasPMID) result.issues.push('Mechanisms: Missing PMIDs');
        }
        
        results.push(result);
        
        if (overallWorking) {
          workingSupplements.push(result);
        } else {
          brokenSupplements.push(result);
        }
        
      } catch (error) {
        console.log(`   ❌ Error testing ${supplement.name}: ${error.message}`);
        brokenSupplements.push({
          id: supplement.id,
          name: supplement.name,
          category: supplement.category,
          overallWorking: false,
          issues: ['Testing error: ' + error.message]
        });
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPREHENSIVE SUPPLEMENT AUDIT RESULTS');
    console.log('='.repeat(70));
    
    const workingCount = workingSupplements.length;
    const brokenCount = brokenSupplements.length;
    const successRate = Math.round((workingCount / results.length) * 100);
    
    console.log(`\n📈 Overall Status:`);
    console.log(`   Working: ${workingCount}/${results.length} supplements`);
    console.log(`   Broken: ${brokenCount}/${results.length} supplements`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Target: 95% (${Math.ceil(results.length * 0.95)} supplements)`);
    console.log(`   Need to Fix: ${Math.ceil(results.length * 0.95) - workingCount} more supplements`);
    
    console.log('\n❌ BROKEN SUPPLEMENTS (Priority Order):');
    
    // Categorize broken supplements by issue type
    const structuralIssues = brokenSupplements.filter(s => 
      s.issues.some(issue => issue.includes('No study cards'))
    );
    
    const pmidIssues = brokenSupplements.filter(s => 
      !s.issues.some(issue => issue.includes('No study cards')) &&
      s.issues.some(issue => issue.includes('Missing PMIDs'))
    );
    
    const undefinedIssues = brokenSupplements.filter(s => 
      s.issues.some(issue => issue.includes('Undefined values'))
    );
    
    console.log(`\n🔴 HIGH PRIORITY - Structural Issues (${structuralIssues.length} supplements):`);
    structuralIssues.forEach((supp, index) => {
      console.log(`   ${index + 1}. ${supp.name} (ID: ${supp.id})`);
      console.log(`      Issues: ${supp.issues.join(', ')}`);
    });
    
    console.log(`\n🟡 MEDIUM PRIORITY - Undefined Values (${undefinedIssues.length} supplements):`);
    undefinedIssues.forEach((supp, index) => {
      console.log(`   ${index + 1}. ${supp.name} (ID: ${supp.id})`);
      console.log(`      Issues: ${supp.issues.join(', ')}`);
    });
    
    console.log(`\n🟢 LOW PRIORITY - PMID Issues (${pmidIssues.length} supplements):`);
    pmidIssues.forEach((supp, index) => {
      console.log(`   ${index + 1}. ${supp.name} (ID: ${supp.id})`);
      console.log(`      Issues: ${supp.issues.join(', ')}`);
    });
    
    console.log('\n🎯 RECOMMENDED FIX ORDER:');
    console.log('1. Fix structural issues first (empty study cards)');
    console.log('2. Fix undefined value issues');
    console.log('3. Add missing PMIDs to working supplements');
    
    // Save results for further analysis
    console.log('\n💾 Saving detailed results...');
    
    return {
      totalSupplements: results.length,
      workingCount,
      brokenCount,
      successRate,
      structuralIssues,
      undefinedIssues,
      pmidIssues,
      allResults: results
    };
    
  } catch (error) {
    console.error('❌ Audit error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive audit complete');
  }
})();
