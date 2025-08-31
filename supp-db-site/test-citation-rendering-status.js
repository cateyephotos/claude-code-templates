const { chromium } = require('playwright');

(async () => {
  console.log('🔍 TESTING CITATION RENDERING STATUS');
  console.log('Testing supplements with different citation formats...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test supplements from different format categories
    const testSupplements = [
      // Working format (claim: true, studies: true)
      { id: 15, name: 'Panax Ginseng', expectedFormat: 'working' },
      { id: 13, name: 'Acetyl-L-Carnitine', expectedFormat: 'working' },
      { id: 44, name: 'Alpha-Lipoic Acid', expectedFormat: 'working' },
      
      // Legacy format (claim: false, evidence: true)
      { id: 1, name: 'Bacopa monnieri', expectedFormat: 'legacy' },
      { id: 2, name: 'Turmeric/Curcumin', expectedFormat: 'legacy' },
      { id: 3, name: 'Ashwagandha', expectedFormat: 'legacy' },
      
      // Empty format (no studies or evidence)
      { id: 37, name: 'Zinc', expectedFormat: 'empty' },
      { id: 38, name: 'Iron', expectedFormat: 'empty' },
      { id: 40, name: 'GABA', expectedFormat: 'empty' }
    ];
    
    const results = [];
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing ${supplement.name} (ID: ${supplement.id})...`);
      
      // Search and open supplement
      await page.fill('#searchInput', supplement.name);
      await page.waitForTimeout(1000);
      
      await page.evaluate(async (suppId) => {
        await window.app.showSupplementDetails(suppId);
      }, supplement.id);
      await page.waitForTimeout(2000);
      
      // Test all three tabs
      const tabResults = {};
      
      // Test Benefits tab
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      await benefitsTab.click();
      await page.waitForTimeout(1000);
      
      const benefitsAnalysis = await page.evaluate((suppId) => {
        const container = document.getElementById(`benefits-${suppId}`);
        if (!container) return { error: 'Container not found' };
        
        const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
        const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
        
        return {
          totalCards: cards.length,
          studyCards: studyCards.length,
          htmlLength: container.innerHTML.length,
          hasPMID: container.innerHTML.includes('PMID'),
          hasDOI: container.innerHTML.includes('DOI'),
          hasFindings: container.innerHTML.includes('Findings'),
          hasYear: /\b(19|20)\d{2}\b/.test(container.innerHTML),
          firstCardContent: cards[0] ? cards[0].textContent.substring(0, 200) : ''
        };
      }, supplement.id);
      
      tabResults.benefits = benefitsAnalysis;
      
      // Test Safety tab
      const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
      await safetyTab.click();
      await page.waitForTimeout(1000);
      
      const safetyAnalysis = await page.evaluate((suppId) => {
        const container = document.getElementById(`safety-${suppId}`);
        if (!container) return { error: 'Container not found' };
        
        const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
        const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
        
        return {
          totalCards: cards.length,
          studyCards: studyCards.length,
          htmlLength: container.innerHTML.length,
          hasPMID: container.innerHTML.includes('PMID'),
          hasDOI: container.innerHTML.includes('DOI'),
          hasFindings: container.innerHTML.includes('Findings')
        };
      }, supplement.id);
      
      tabResults.safety = safetyAnalysis;
      
      // Test Mechanisms tab
      const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
      await mechanismsTab.click();
      await page.waitForTimeout(1000);
      
      const mechanismsAnalysis = await page.evaluate((suppId) => {
        const container = document.getElementById(`mechanisms-${suppId}`);
        if (!container) return { error: 'Container not found' };
        
        const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
        const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
        
        return {
          totalCards: cards.length,
          studyCards: studyCards.length,
          htmlLength: container.innerHTML.length,
          hasPMID: container.innerHTML.includes('PMID'),
          hasDOI: container.innerHTML.includes('DOI'),
          hasFindings: container.innerHTML.includes('Findings')
        };
      }, supplement.id);
      
      tabResults.mechanisms = mechanismsAnalysis;
      
      // Calculate overall status
      const benefitsWorking = benefitsAnalysis.hasPMID && benefitsAnalysis.studyCards > 0;
      const safetyWorking = safetyAnalysis.hasPMID && safetyAnalysis.studyCards > 0;
      const mechanismsWorking = mechanismsAnalysis.hasPMID && mechanismsAnalysis.studyCards > 0;
      
      const result = {
        id: supplement.id,
        name: supplement.name,
        expectedFormat: supplement.expectedFormat,
        benefitsWorking: benefitsWorking,
        safetyWorking: safetyWorking,
        mechanismsWorking: mechanismsWorking,
        overallWorking: benefitsWorking && safetyWorking && mechanismsWorking,
        tabResults: tabResults
      };
      
      results.push(result);
      
      console.log(`   Benefits: ${benefitsWorking ? '✅' : '❌'} (${benefitsAnalysis.studyCards} study cards)`);
      console.log(`   Safety: ${safetyWorking ? '✅' : '❌'} (${safetyAnalysis.studyCards} study cards)`);
      console.log(`   Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${mechanismsAnalysis.studyCards} study cards)`);
      console.log(`   Overall: ${result.overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 CITATION RENDERING STATUS SUMMARY');
    console.log('='.repeat(70));
    
    const workingSupplements = results.filter(r => r.overallWorking);
    const brokenSupplements = results.filter(r => !r.overallWorking);
    
    console.log(`\n✅ WORKING SUPPLEMENTS (${workingSupplements.length}):`);
    workingSupplements.forEach(supp => {
      console.log(`   • ${supp.name} (${supp.expectedFormat} format)`);
    });
    
    console.log(`\n❌ BROKEN SUPPLEMENTS (${brokenSupplements.length}):`);
    brokenSupplements.forEach(supp => {
      const issues = [];
      if (!supp.benefitsWorking) issues.push('Benefits');
      if (!supp.safetyWorking) issues.push('Safety');
      if (!supp.mechanismsWorking) issues.push('Mechanisms');
      
      console.log(`   • ${supp.name} (${supp.expectedFormat} format) - Issues: ${issues.join(', ')}`);
      
      // Show specific issues
      if (!supp.benefitsWorking) {
        const b = supp.tabResults.benefits;
        console.log(`     Benefits: ${b.totalCards} cards, ${b.studyCards} study cards, ${b.htmlLength} chars`);
      }
    });
    
    console.log('\n📋 FORMAT ANALYSIS:');
    const formatGroups = {
      working: results.filter(r => r.expectedFormat === 'working'),
      legacy: results.filter(r => r.expectedFormat === 'legacy'),
      empty: results.filter(r => r.expectedFormat === 'empty')
    };
    
    Object.entries(formatGroups).forEach(([format, supplements]) => {
      const workingCount = supplements.filter(s => s.overallWorking).length;
      const brokenCount = supplements.filter(s => !s.overallWorking).length;
      
      console.log(`\n${format.toUpperCase()} FORMAT:`);
      console.log(`   Total: ${supplements.length} | Working: ${workingCount} | Broken: ${brokenCount}`);
      
      if (brokenCount > 0) {
        console.log(`   Broken supplements:`);
        supplements.filter(s => !s.overallWorking).forEach(supp => {
          console.log(`     - ${supp.name}`);
        });
      }
    });
    
    console.log('\n🎯 NEXT STEPS:');
    if (brokenSupplements.length > 0) {
      console.log(`   1. Fix ${brokenSupplements.length} broken supplements`);
      console.log(`   2. Focus on legacy format supplements (likely data structure issues)`);
      console.log(`   3. Fix empty format supplements (missing data)`);
      console.log(`   4. Apply same normalization fixes used for Panax Ginseng`);
    } else {
      console.log(`   ✅ All tested supplements are working correctly!`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Citation rendering status test complete');
  }
})();
