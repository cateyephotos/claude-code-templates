const { chromium } = require('playwright');

(async () => {
  console.log('🔍 CHECKING SUPPLEMENT DATA AVAILABILITY');
  console.log('Investigating data structure and available supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check what data is available
    const dataCheck = await page.evaluate(() => {
      return {
        hasSupplements: typeof window.supplements !== 'undefined',
        supplementsLength: window.supplements ? window.supplements.length : 0,
        hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
        enhancedCitationsLength: window.enhancedCitations ? Object.keys(window.enhancedCitations).length : 0,
        firstFewSupplements: window.supplements ? window.supplements.slice(0, 10).map(s => ({
          id: s.id,
          name: s.name,
          category: s.category
        })) : [],
        enhancedCitationIds: window.enhancedCitations ? Object.keys(window.enhancedCitations).slice(0, 10) : []
      };
    });
    
    console.log('\n📊 Data Structure Analysis:');
    console.log(`   Has supplements: ${dataCheck.hasSupplements}`);
    console.log(`   Supplements count: ${dataCheck.supplementsLength}`);
    console.log(`   Has enhanced citations: ${dataCheck.hasEnhancedCitations}`);
    console.log(`   Enhanced citations count: ${dataCheck.enhancedCitationsLength}`);
    
    console.log('\n📋 First 10 Supplements:');
    dataCheck.firstFewSupplements.forEach(supp => {
      console.log(`   ${supp.id}: ${supp.name} (${supp.category})`);
    });
    
    console.log('\n📋 Enhanced Citation IDs:');
    console.log(`   Available IDs: ${dataCheck.enhancedCitationIds.join(', ')}`);
    
    // Test a few known supplements manually
    const knownSupplements = [
      { id: 1, name: 'Bacopa Monnieri' },
      { id: 2, name: 'Turmeric' },
      { id: 3, name: 'Omega-3' },
      { id: 4, name: 'Vitamin D' },
      { id: 5, name: 'Creatine' },
      { id: 6, name: 'Magnesium' },
      { id: 7, name: 'Zinc' },
      { id: 8, name: 'Iron' },
      { id: 9, name: 'L-Theanine' },
      { id: 10, name: 'Caffeine' }
    ];
    
    console.log('\n🧪 Testing Known Supplements:');
    
    const testResults = [];
    
    for (const supplement of knownSupplements) {
      try {
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(500);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1000);
        
        // Test Benefits tab
        const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
        await benefitsTab.click();
        await page.waitForTimeout(500);
        
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
        
        // Test Safety tab
        const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
        await safetyTab.click();
        await page.waitForTimeout(500);
        
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
        
        // Test Mechanisms tab
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        await mechanismsTab.click();
        await page.waitForTimeout(500);
        
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
        
        const benefitsWorking = benefitsResult.studyCards > 0 && !benefitsResult.hasUndefined;
        const safetyWorking = safetyResult.studyCards > 0;
        const mechanismsWorking = mechanismsResult.studyCards > 0;
        const overallWorking = benefitsWorking && safetyWorking && mechanismsWorking;
        
        const result = {
          id: supplement.id,
          name: supplement.name,
          benefitsWorking: benefitsWorking,
          safetyWorking: safetyWorking,
          mechanismsWorking: mechanismsWorking,
          overallWorking: overallWorking,
          details: {
            benefits: benefitsResult,
            safety: safetyResult,
            mechanisms: mechanismsResult
          }
        };
        
        testResults.push(result);
        
        const status = overallWorking ? '✅' : '❌';
        console.log(`   ${supplement.id}: ${supplement.name} ${status}`);
        console.log(`      B:${benefitsWorking ? '✅' : '❌'}(${benefitsResult.studyCards}) S:${safetyWorking ? '✅' : '❌'}(${safetyResult.studyCards}) M:${mechanismsWorking ? '✅' : '❌'}(${mechanismsResult.studyCards})`);
        
      } catch (error) {
        console.log(`   ${supplement.id}: ${supplement.name} ❌ Error: ${error.message}`);
      }
    }
    
    const workingCount = testResults.filter(r => r.overallWorking).length;
    const brokenCount = testResults.filter(r => !r.overallWorking).length;
    
    console.log('\n📊 Sample Results:');
    console.log(`   Working: ${workingCount}/${testResults.length}`);
    console.log(`   Broken: ${brokenCount}/${testResults.length}`);
    console.log(`   Success Rate: ${Math.round((workingCount / testResults.length) * 100)}%`);
    
    console.log('\n❌ Broken Supplements from Sample:');
    testResults.filter(r => !r.overallWorking).forEach(supp => {
      const issues = [];
      if (!supp.benefitsWorking) issues.push('Benefits');
      if (!supp.safetyWorking) issues.push('Safety');
      if (!supp.mechanismsWorking) issues.push('Mechanisms');
      console.log(`   ${supp.name} (ID: ${supp.id}): ${issues.join(', ')}`);
    });
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Check error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Supplement data check complete');
  }
})();
