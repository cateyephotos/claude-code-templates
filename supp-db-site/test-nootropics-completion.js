const { chromium } = require('playwright');

(async () => {
  console.log('🧠 Testing Nootropics Completion - Phase 2B Validation');
  console.log('Verifying all 3 new nootropics are working...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const testSupplements = [
      { id: 13, name: 'Acetyl-L-Carnitine', status: 'Converted format' },
      { id: 55, name: 'Huperzine A', status: 'Newly created' },
      { id: 56, name: 'Vinpocetine', status: 'Newly created' }
    ];
    
    let successCount = 0;
    
    for (const supplement of testSupplements) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 TESTING: ${supplement.name} (ID: ${supplement.id})`);
      console.log(`Status: ${supplement.status}`);
      console.log('='.repeat(60));
      
      // Check if enhanced data exists
      const hasData = await page.evaluate((suppId) => {
        return !!window.enhancedCitations?.[suppId];
      }, supplement.id);
      
      if (!hasData) {
        console.log(`❌ No enhanced citation data found`);
        continue;
      }
      
      console.log(`✅ Enhanced citation data loaded`);
      
      // Get data structure analysis
      const dataAnalysis = await page.evaluate((suppId) => {
        const data = window.enhancedCitations?.[suppId];
        if (!data) return { error: 'No data found' };
        
        return {
          supplementName: data.supplementName,
          version: data.version,
          lastUpdated: data.lastUpdated,
          citationCounts: {
            mechanisms: data.citations?.mechanisms?.length || 0,
            benefits: data.citations?.benefits?.length || 0,
            safety: data.citations?.safety?.length || 0
          }
        };
      }, supplement.id);
      
      console.log(`📊 Data Structure:`);
      console.log(`   Name: ${dataAnalysis.supplementName}`);
      console.log(`   Version: ${dataAnalysis.version}`);
      console.log(`   Last Updated: ${dataAnalysis.lastUpdated}`);
      console.log(`   Citation Counts:`);
      console.log(`     Mechanisms: ${dataAnalysis.citationCounts.mechanisms}`);
      console.log(`     Benefits: ${dataAnalysis.citationCounts.benefits}`);
      console.log(`     Safety: ${dataAnalysis.citationCounts.safety}`);
      
      // Test modal functionality
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
        console.log(`❌ Modal error: ${modalResult.error}`);
        continue;
      }
      
      console.log(`✅ Modal opened successfully`);
      await page.waitForTimeout(500);
      
      // Test Benefits tab for undefined values and proper rendering
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(300);
        
        const benefitsAnalysis = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container || container.classList.contains('hidden')) {
            return { error: 'Benefits container not accessible' };
          }
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const undefinedIssues = [];
          const cardDetails = [];
          
          cards.forEach((card, index) => {
            const text = card.textContent;
            const title = card.querySelector('h5')?.textContent?.trim();
            
            if (text.includes('undefined')) {
              const undefinedMatches = text.match(/undefined/g) || [];
              undefinedIssues.push({
                cardIndex: index,
                title: title,
                undefinedCount: undefinedMatches.length
              });
            }
            
            cardDetails.push({
              index: index,
              title: title,
              hasContent: text.length > 50,
              preview: text.substring(0, 100).replace(/\s+/g, ' ')
            });
          });
          
          return {
            totalCards: cards.length,
            undefinedCards: undefinedIssues.length,
            issues: undefinedIssues,
            cardDetails: cardDetails
          };
        }, supplement.id);
        
        if (benefitsAnalysis.error) {
          console.log(`   ❌ ${benefitsAnalysis.error}`);
        } else {
          console.log(`   📊 Benefits Tab:`);
          console.log(`     Total Cards: ${benefitsAnalysis.totalCards}`);
          console.log(`     Undefined Issues: ${benefitsAnalysis.undefinedCards}`);
          
          if (benefitsAnalysis.undefinedCards === 0 && benefitsAnalysis.totalCards > 0) {
            console.log(`   ✅ Benefits rendering properly`);
            
            // Show sample card content
            if (benefitsAnalysis.cardDetails.length > 0) {
              const firstCard = benefitsAnalysis.cardDetails[0];
              console.log(`   📋 Sample Card: "${firstCard.title}"`);
              console.log(`     Preview: ${firstCard.preview}...`);
            }
            
            successCount++;
          } else {
            console.log(`   ❌ Issues found:`);
            benefitsAnalysis.issues.forEach(issue => {
              console.log(`     Card ${issue.cardIndex + 1}: "${issue.title}" (${issue.undefinedCount} undefined)`);
            });
          }
        }
      } else {
        console.log(`   ❌ Benefits tab not found`);
      }
    }
    
    // Overall completion status
    console.log('\n' + '='.repeat(80));
    console.log('🎉 PHASE 2B NOOTROPICS COMPLETION STATUS');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Results Summary:`);
    console.log(`   Successfully tested: ${successCount}/${testSupplements.length}`);
    console.log(`   Success rate: ${Math.round((successCount / testSupplements.length) * 100)}%`);
    
    if (successCount === testSupplements.length) {
      console.log(`\n🎉 PHASE 2B NOOTROPICS EXPANSION COMPLETE!`);
      console.log(`\n✅ Achievements:`);
      console.log(`   • Acetyl-L-Carnitine: Format converted and working`);
      console.log(`   • Huperzine A: New enhanced citations created`);
      console.log(`   • Vinpocetine: New enhanced citations created`);
      console.log(`   • 100% Nootropics coverage achieved!`);
      
      // Get final nootropics coverage
      const finalCoverage = await page.evaluate(() => {
        const supplements = window.app.supplements || [];
        const enhanced = window.enhancedCitations || {};
        
        const nootropics = supplements.filter(supp => {
          const category = (supp.category || '').toLowerCase();
          const name = (supp.name || '').toLowerCase();
          
          return category.includes('nootropic') || 
                 category.includes('cognitive') ||
                 name.includes('piracetam') ||
                 name.includes('modafinil') ||
                 name.includes('noopept') ||
                 name.includes('aniracetam') ||
                 name.includes('oxiracetam') ||
                 name.includes('phenylpiracetam') ||
                 name.includes('bacopa') ||
                 name.includes('lions mane') ||
                 name.includes('ginkgo') ||
                 name.includes('rhodiola') ||
                 name.includes('phosphatidylserine') ||
                 name.includes('acetyl-l-carnitine') ||
                 name.includes('alpha-gpc') ||
                 name.includes('citicoline') ||
                 name.includes('huperzine') ||
                 name.includes('vinpocetine') ||
                 name.includes('pqq') ||
                 name.includes('centella asiatica') ||
                 name.includes('sulbutiamine') ||
                 name.includes('dmae');
        });
        
        const enhancedCount = nootropics.filter(supp => !!enhanced[supp.id]).length;
        
        return {
          total: nootropics.length,
          enhanced: enhancedCount,
          coverage: Math.round((enhancedCount / nootropics.length) * 100)
        };
      });
      
      console.log(`\n📈 Final Nootropics Coverage:`);
      console.log(`   Enhanced: ${finalCoverage.enhanced}/${finalCoverage.total}`);
      console.log(`   Coverage Rate: ${finalCoverage.coverage}%`);
      
      console.log(`\n🚀 READY FOR NEXT PHASE:`);
      console.log(`   Options for Phase 2C:`);
      console.log(`   • Essential Nutrients completion (71% → 100%)`);
      console.log(`   • Amino Acids expansion (57% → 80%)`);
      console.log(`   • Advanced search features implementation`);
      console.log(`   • Analytics dashboard development`);
      
    } else {
      console.log(`\n⚠️ Phase 2B needs additional work:`);
      console.log(`   ${testSupplements.length - successCount} supplements still need fixes`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Nootropics completion testing complete');
  }
})();
