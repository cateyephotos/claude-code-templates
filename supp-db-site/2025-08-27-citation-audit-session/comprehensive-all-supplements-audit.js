const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🔍 COMPREHENSIVE ALL SUPPLEMENTS CITATION AUDIT');
  console.log('Testing citation rendering for ALL 61 supplements with enhanced citation data...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all supplements with enhanced citation data from our previous audit
    const allSupplementsWithCitations = [
      { id: 1, name: 'Bacopa monnieri' },
      { id: 2, name: 'Turmeric/Curcumin' },
      { id: 3, name: 'Ashwagandha' },
      { id: 4, name: 'Omega-3 Fatty Acids' },
      { id: 5, name: 'Creatine' },
      { id: 7, name: 'Vitamin D3' },
      { id: 9, name: 'L-Theanine' },
      { id: 10, name: 'Rhodiola rosea' },
      { id: 11, name: 'Lion\'s Mane Mushroom' },
      { id: 12, name: 'Phosphatidylserine' },
      { id: 13, name: 'Acetyl-L-Carnitine' },
      { id: 14, name: 'Ginkgo Biloba' },
      { id: 15, name: 'Panax Ginseng' },
      { id: 16, name: 'Alpha-GPC' },
      { id: 17, name: 'Berberine' },
      { id: 18, name: 'CoQ10' },
      { id: 19, name: 'B-Complex Vitamins' },
      { id: 20, name: 'Quercetin' },
      { id: 21, name: 'Vitamin B12' },
      { id: 22, name: 'Vitamin B6' },
      { id: 24, name: 'Green Tea Extract' },
      { id: 25, name: 'NAD+ Precursors' },
      { id: 26, name: 'PQQ' },
      { id: 27, name: 'Resveratrol' },
      { id: 28, name: 'Glucosamine' },
      { id: 30, name: 'Vitamin E' },
      { id: 31, name: 'Whey Protein' },
      { id: 32, name: 'Chondroitin Sulfate' },
      { id: 34, name: '5-HTP' },
      { id: 36, name: 'Vitamin C' },
      { id: 37, name: 'Zinc' },
      { id: 38, name: 'Iron' },
      { id: 39, name: 'Taurine' },
      { id: 40, name: 'GABA' },
      { id: 41, name: 'Inositol' },
      { id: 42, name: 'Selenium' },
      { id: 44, name: 'Alpha-Lipoic Acid' },
      { id: 45, name: 'Lutein' },
      { id: 47, name: 'Ginger' },
      { id: 48, name: 'Garlic' },
      { id: 50, name: 'Caffeine' },
      { id: 51, name: 'Reishi Mushroom' },
      { id: 53, name: 'Spirulina' },
      { id: 55, name: 'Huperzine A' },
      { id: 56, name: 'Vinpocetine' },
      { id: 61, name: 'Chromium' },
      { id: 62, name: 'Vanadium' },
      { id: 67, name: 'Holy Basil' },
      { id: 75, name: 'Citicoline' },
      { id: 76, name: 'Sulbutiamine' },
      { id: 77, name: 'DMAE' },
      { id: 78, name: 'Centella Asiatica' },
      { id: 80, name: 'Aniracetam' },
      { id: 81, name: 'Piracetam' },
      { id: 87, name: 'Krill Oil' },
      { id: 89, name: 'Pterostilbene' }
    ];
    
    console.log(`\n📊 Testing ${allSupplementsWithCitations.length} supplements with enhanced citation data...`);
    
    const results = [];
    let processedCount = 0;
    
    for (const supplement of allSupplementsWithCitations) {
      processedCount++;
      console.log(`\n🔍 [${processedCount}/${allSupplementsWithCitations.length}] Testing ${supplement.name} (ID: ${supplement.id})...`);
      
      try {
        // Search and open supplement
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(500);
        
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(1500);
        
        // Test all three tabs with detailed analysis
        const tabResults = {};
        
        // Test Benefits tab
        console.log(`   📋 Testing Benefits tab...`);
        const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
        await benefitsTab.click();
        await page.waitForTimeout(800);
        
        const benefitsResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          const pmidLinks = Array.from(container.querySelectorAll('a[href*="pubmed"]'));
          const doiLinks = Array.from(container.querySelectorAll('a[href*="doi"]'));
          
          const innerHTML = container.innerHTML;
          const hasUndefined = innerHTML.includes('undefined');
          const undefinedMatches = innerHTML.match(/undefined/g) || [];
          
          // Check for specific citation elements
          const hasPMID = innerHTML.includes('PMID');
          const hasDOI = innerHTML.includes('DOI');
          const hasFindings = innerHTML.includes('Findings');
          const hasAuthors = innerHTML.includes('Authors') || innerHTML.includes('et al');
          const hasYear = /\b(19|20)\d{2}\b/.test(innerHTML);
          const hasJournal = innerHTML.includes('Journal');
          
          return {
            totalCards: cards.length,
            studyCards: studyCards.length,
            pmidLinks: pmidLinks.length,
            doiLinks: doiLinks.length,
            htmlLength: innerHTML.length,
            hasUndefined: hasUndefined,
            undefinedCount: undefinedMatches.length,
            hasPMID: hasPMID,
            hasDOI: hasDOI,
            hasFindings: hasFindings,
            hasAuthors: hasAuthors,
            hasYear: hasYear,
            hasJournal: hasJournal,
            detailScore: [hasPMID, hasDOI, hasFindings, hasAuthors, hasYear, hasJournal].filter(Boolean).length,
            firstCardPreview: cards[0] ? cards[0].textContent.substring(0, 200) : ''
          };
        }, supplement.id);
        
        tabResults.benefits = benefitsResult;
        
        // Test Safety tab
        console.log(`   🛡️ Testing Safety tab...`);
        const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
        await safetyTab.click();
        await page.waitForTimeout(800);
        
        const safetyResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`safety-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          const pmidLinks = Array.from(container.querySelectorAll('a[href*="pubmed"]'));
          
          const innerHTML = container.innerHTML;
          const hasUndefined = innerHTML.includes('undefined');
          const hasPMID = innerHTML.includes('PMID');
          const hasFindings = innerHTML.includes('Findings');
          
          return {
            totalCards: cards.length,
            studyCards: studyCards.length,
            pmidLinks: pmidLinks.length,
            hasUndefined: hasUndefined,
            hasPMID: hasPMID,
            hasFindings: hasFindings,
            detailScore: [hasPMID, hasFindings].filter(Boolean).length
          };
        }, supplement.id);
        
        tabResults.safety = safetyResult;
        
        // Test Mechanisms tab
        console.log(`   ⚙️ Testing Mechanisms tab...`);
        const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
        await mechanismsTab.click();
        await page.waitForTimeout(800);
        
        const mechanismsResult = await page.evaluate((suppId) => {
          const container = document.getElementById(`mechanisms-${suppId}`);
          if (!container) return { error: 'Container not found' };
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const studyCards = Array.from(container.querySelectorAll('.bg-gray-50'));
          const pmidLinks = Array.from(container.querySelectorAll('a[href*="pubmed"]'));
          
          const innerHTML = container.innerHTML;
          const hasUndefined = innerHTML.includes('undefined');
          const hasPMID = innerHTML.includes('PMID');
          const hasFindings = innerHTML.includes('Findings');
          
          return {
            totalCards: cards.length,
            studyCards: studyCards.length,
            pmidLinks: pmidLinks.length,
            hasUndefined: hasUndefined,
            hasPMID: hasPMID,
            hasFindings: hasFindings,
            detailScore: [hasPMID, hasFindings].filter(Boolean).length
          };
        }, supplement.id);
        
        tabResults.mechanisms = mechanismsResult;
        
        // Calculate working status with detailed criteria
        const benefitsWorking = benefitsResult.studyCards > 0 && benefitsResult.hasPMID && !benefitsResult.hasUndefined;
        const safetyWorking = safetyResult.studyCards > 0 && safetyResult.hasPMID && !safetyResult.hasUndefined;
        const mechanismsWorking = mechanismsResult.studyCards > 0 && mechanismsResult.hasPMID && !mechanismsResult.hasUndefined;
        
        const result = {
          id: supplement.id,
          name: supplement.name,
          benefitsWorking: benefitsWorking,
          safetyWorking: safetyWorking,
          mechanismsWorking: mechanismsWorking,
          overallWorking: benefitsWorking && safetyWorking && mechanismsWorking,
          tabResults: tabResults,
          issues: {
            benefits: benefitsWorking ? [] : [
              benefitsResult.studyCards === 0 ? 'No study cards' : null,
              !benefitsResult.hasPMID ? 'Missing PMIDs' : null,
              benefitsResult.hasUndefined ? `${benefitsResult.undefinedCount} undefined values` : null
            ].filter(Boolean),
            safety: safetyWorking ? [] : [
              safetyResult.studyCards === 0 ? 'No study cards' : null,
              !safetyResult.hasPMID ? 'Missing PMIDs' : null,
              safetyResult.hasUndefined ? 'Undefined values' : null
            ].filter(Boolean),
            mechanisms: mechanismsWorking ? [] : [
              mechanismsResult.studyCards === 0 ? 'No study cards' : null,
              !mechanismsResult.hasPMID ? 'Missing PMIDs' : null,
              mechanismsResult.hasUndefined ? 'Undefined values' : null
            ].filter(Boolean)
          }
        };
        
        results.push(result);
        
        // Log immediate results
        console.log(`     Benefits: ${benefitsWorking ? '✅' : '❌'} (${benefitsResult.studyCards} cards, score: ${benefitsResult.detailScore}/6)`);
        console.log(`     Safety: ${safetyWorking ? '✅' : '❌'} (${safetyResult.studyCards} cards, score: ${safetyResult.detailScore}/2)`);
        console.log(`     Mechanisms: ${mechanismsWorking ? '✅' : '❌'} (${mechanismsResult.studyCards} cards, score: ${mechanismsResult.detailScore}/2)`);
        console.log(`     Overall: ${result.overallWorking ? '✅ WORKING' : '❌ BROKEN'}`);
        
        if (!result.overallWorking) {
          const allIssues = [...result.issues.benefits, ...result.issues.safety, ...result.issues.mechanisms];
          console.log(`     Issues: ${allIssues.join(', ')}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error testing ${supplement.name}: ${error.message}`);
        results.push({
          id: supplement.id,
          name: supplement.name,
          error: error.message,
          overallWorking: false
        });
      }
      
      // Progress indicator
      if (processedCount % 10 === 0) {
        const workingCount = results.filter(r => r.overallWorking).length;
        const currentRate = Math.round((workingCount / results.length) * 100);
        console.log(`\n📊 Progress: ${processedCount}/${allSupplementsWithCitations.length} tested | Success rate: ${currentRate}%`);
      }
    }
    
    // Save intermediate results
    fs.writeFileSync('comprehensive-audit-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Comprehensive audit results saved to comprehensive-audit-results.json');
    
    return results;
    
  } catch (error) {
    console.error('❌ Audit error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive citation audit complete');
  }
})();
