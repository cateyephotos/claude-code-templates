const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Comprehensive Enhanced Citation Verification System');
  console.log('Checking ALL enhanced supplements for complete citation rendering...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all enhanced supplements
    const enhancedSupplements = await page.evaluate(() => {
      const enhanced = [];
      if (window.enhancedCitations) {
        Object.keys(window.enhancedCitations).forEach(id => {
          const data = window.enhancedCitations[id];
          const supplement = window.app.supplements.find(s => s.id == id);
          if (supplement && data) {
            enhanced.push({
              id: parseInt(id),
              name: supplement.name,
              category: supplement.category,
              tier: supplement.evidenceTier,
              hasEnhanced: !!supplement.enhancedCitations?.isEnhanced
            });
          }
        });
      }
      return enhanced.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    console.log(`\n📊 Found ${enhancedSupplements.length} enhanced supplements to verify`);
    console.log('='.repeat(80));
    
    const results = [];
    let melatoninFound = false;
    
    for (const supplement of enhancedSupplements) {
      console.log(`\n🔍 Verifying: ${supplement.name} (ID: ${supplement.id})`);
      
      if (supplement.name.toLowerCase().includes('melatonin')) {
        melatoninFound = true;
        console.log('   🎯 MELATONIN FOUND - Will examine in detail');
      }
      
      // Search for the supplement
      await page.fill('#searchInput', supplement.name);
      await page.waitForTimeout(1000);
      
      // Open modal
      const modalResult = await page.evaluate(async (suppId) => {
        try {
          await window.app.showSupplementDetails(suppId);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, supplement.id);
      
      if (!modalResult.success) {
        console.log(`   ❌ Modal failed: ${modalResult.error}`);
        results.push({
          ...supplement,
          status: 'MODAL_ERROR',
          error: modalResult.error
        });
        continue;
      }
      
      await page.waitForTimeout(1000);
      
      // Check all three tabs
      const tabs = ['Mechanisms', 'Benefits', 'Safety'];
      const tabResults = {};
      let totalCitations = 0;
      let detailedCitations = 0;
      
      for (const tabName of tabs) {
        console.log(`   📑 Checking ${tabName} tab...`);
        
        const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
        if (await tab.count() === 0) {
          console.log(`   ❌ ${tabName} tab not found`);
          tabResults[tabName] = { status: 'TAB_MISSING', cards: 0, details: [] };
          continue;
        }
        
        await tab.click();
        await page.waitForTimeout(500);
        
        // Count citation cards
        const citationCards = await page.locator('.enhanced-citation-card');
        const cardCount = await citationCards.count();
        totalCitations += cardCount;
        
        console.log(`   📄 Found ${cardCount} citation cards`);
        
        if (cardCount === 0) {
          tabResults[tabName] = { status: 'NO_CARDS', cards: 0, details: [] };
          continue;
        }
        
        // Analyze each citation card in detail
        const cardDetails = [];
        for (let i = 0; i < Math.min(cardCount, 3); i++) { // Check first 3 cards
          const card = citationCards.nth(i);
          const cardText = await card.textContent();
          const cardHTML = await card.innerHTML();
          
          // Check for key citation elements
          const hasTitle = /[A-Z].*[a-z].*/.test(cardText) && cardText.length > 20;
          const hasYear = /\(\d{4}\)|\b(19|20)\d{2}\b/.test(cardText);
          const hasAuthors = !cardText.includes('Unknown authors') && 
                           !cardText.includes('undefined') &&
                           cardText.includes(',') || cardText.includes('et al');
          const hasJournal = cardText.split('\n').length > 3;
          const hasFindings = cardText.length > 100;
          
          const quality = hasTitle && hasYear && hasAuthors && hasJournal && hasFindings ? 'EXCELLENT' :
                         hasTitle && hasYear && hasAuthors ? 'GOOD' :
                         hasTitle && hasYear ? 'BASIC' : 'POOR';
          
          if (quality === 'EXCELLENT' || quality === 'GOOD') {
            detailedCitations++;
          }
          
          cardDetails.push({
            index: i,
            quality: quality,
            hasTitle: hasTitle,
            hasYear: hasYear,
            hasAuthors: hasAuthors,
            hasJournal: hasJournal,
            hasFindings: hasFindings,
            textLength: cardText.length,
            preview: cardText.substring(0, 150) + '...'
          });
          
          if (supplement.name.toLowerCase().includes('melatonin') && tabName === 'Benefits') {
            console.log(`   🎯 MELATONIN ${tabName} Card ${i + 1}:`);
            console.log(`      Quality: ${quality}`);
            console.log(`      Title: ${hasTitle ? '✅' : '❌'}`);
            console.log(`      Year: ${hasYear ? '✅' : '❌'}`);
            console.log(`      Authors: ${hasAuthors ? '✅' : '❌'}`);
            console.log(`      Journal: ${hasJournal ? '✅' : '❌'}`);
            console.log(`      Findings: ${hasFindings ? '✅' : '❌'}`);
            console.log(`      Preview: ${cardText.substring(0, 200)}...`);
          }
        }
        
        const tabQuality = cardDetails.length > 0 ? 
          cardDetails.every(c => c.quality === 'EXCELLENT') ? 'EXCELLENT' :
          cardDetails.some(c => c.quality === 'EXCELLENT' || c.quality === 'GOOD') ? 'GOOD' :
          'NEEDS_WORK' : 'NO_CARDS';
        
        tabResults[tabName] = {
          status: 'FOUND',
          cards: cardCount,
          quality: tabQuality,
          details: cardDetails
        };
        
        console.log(`   📊 ${tabName}: ${cardCount} cards, ${tabQuality} quality`);
      }
      
      // Overall assessment
      const overallQuality = Object.values(tabResults).every(tab => tab.quality === 'EXCELLENT') ? 'EXCELLENT' :
                            Object.values(tabResults).some(tab => tab.quality === 'EXCELLENT' || tab.quality === 'GOOD') ? 'GOOD' :
                            totalCitations > 0 ? 'NEEDS_WORK' : 'NO_CITATIONS';
      
      const completeness = totalCitations >= 15 ? 'COMPREHENSIVE' :
                          totalCitations >= 9 ? 'ADEQUATE' :
                          totalCitations >= 3 ? 'MINIMAL' : 'INSUFFICIENT';
      
      results.push({
        ...supplement,
        status: 'VERIFIED',
        totalCitations: totalCitations,
        detailedCitations: detailedCitations,
        overallQuality: overallQuality,
        completeness: completeness,
        tabResults: tabResults
      });
      
      console.log(`   🎯 Overall: ${overallQuality} quality, ${completeness} completeness (${totalCitations} total citations, ${detailedCitations} detailed)`);
    }
    
    // Summary Analysis
    console.log('\n' + '='.repeat(80));
    console.log('📈 COMPREHENSIVE CITATION VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    const excellentSupplements = results.filter(r => r.overallQuality === 'EXCELLENT');
    const goodSupplements = results.filter(r => r.overallQuality === 'GOOD');
    const needsWorkSupplements = results.filter(r => r.overallQuality === 'NEEDS_WORK');
    const noCitationsSupplements = results.filter(r => r.overallQuality === 'NO_CITATIONS');
    
    console.log(`\n📊 Quality Distribution:`);
    console.log(`   🎉 Excellent: ${excellentSupplements.length} supplements`);
    console.log(`   ✅ Good: ${goodSupplements.length} supplements`);
    console.log(`   🔧 Needs Work: ${needsWorkSupplements.length} supplements`);
    console.log(`   ❌ No Citations: ${noCitationsSupplements.length} supplements`);
    
    console.log(`\n📋 Detailed Results:`);
    results.forEach(result => {
      const status = result.overallQuality === 'EXCELLENT' ? '🎉' :
                    result.overallQuality === 'GOOD' ? '✅' :
                    result.overallQuality === 'NEEDS_WORK' ? '🔧' : '❌';
      console.log(`   ${status} ${result.name}: ${result.overallQuality} (${result.totalCitations} citations, ${result.completeness})`);
    });
    
    // Melatonin specific analysis
    if (melatoninFound) {
      console.log('\n' + '='.repeat(80));
      console.log('🎯 MELATONIN SPECIFIC ANALYSIS');
      console.log('='.repeat(80));
      
      const melatonin = results.find(r => r.name.toLowerCase().includes('melatonin'));
      if (melatonin) {
        console.log(`\nMelatonin Status: ${melatonin.overallQuality}`);
        console.log(`Total Citations: ${melatonin.totalCitations}`);
        console.log(`Detailed Citations: ${melatonin.detailedCitations}`);
        console.log(`Completeness: ${melatonin.completeness}`);
        
        Object.entries(melatonin.tabResults).forEach(([tabName, tabData]) => {
          console.log(`\n${tabName} Tab:`);
          console.log(`  Cards: ${tabData.cards}`);
          console.log(`  Quality: ${tabData.quality}`);
          if (tabData.details && tabData.details.length > 0) {
            tabData.details.forEach((detail, index) => {
              console.log(`  Card ${index + 1}: ${detail.quality} (${detail.textLength} chars)`);
            });
          }
        });
      }
    } else {
      console.log('\n⚠️ Melatonin not found in enhanced supplements list');
    }
    
    // Recommendations
    console.log('\n' + '='.repeat(80));
    console.log('🔧 RECOMMENDATIONS');
    console.log('='.repeat(80));
    
    if (needsWorkSupplements.length > 0) {
      console.log(`\n🔧 Supplements needing citation improvements:`);
      needsWorkSupplements.forEach(supp => {
        console.log(`   • ${supp.name}: ${supp.totalCitations} citations`);
        Object.entries(supp.tabResults).forEach(([tab, data]) => {
          if (data.quality === 'NEEDS_WORK' || data.cards === 0) {
            console.log(`     - ${tab}: ${data.cards} cards, ${data.quality}`);
          }
        });
      });
    }
    
    if (noCitationsSupplements.length > 0) {
      console.log(`\n❌ Supplements with no citations:`);
      noCitationsSupplements.forEach(supp => {
        console.log(`   • ${supp.name}: Check data structure compatibility`);
      });
    }
    
    const successRate = Math.round(((excellentSupplements.length + goodSupplements.length) / results.length) * 100);
    console.log(`\n🎯 Overall Success Rate: ${successRate}% (${excellentSupplements.length + goodSupplements.length}/${results.length} supplements with good+ quality)`);
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive citation verification complete');
  }
})();
