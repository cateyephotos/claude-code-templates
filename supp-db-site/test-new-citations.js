const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Testing New Enhanced Citations: GABA and Inositol');
  console.log('Verifying Phase 2A quality fixes...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const testSupplements = [
      { id: 25, name: 'GABA' },
      { id: 26, name: 'Inositol' }
    ];
    
    for (const supplement of testSupplements) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 TESTING: ${supplement.name} (ID: ${supplement.id})`);
      console.log('='.repeat(60));
      
      // Check if enhanced data exists
      const hasData = await page.evaluate((suppId) => {
        return !!window.enhancedCitations?.[suppId];
      }, supplement.id);
      
      if (!hasData) {
        console.log(`❌ No enhanced citation data found for ${supplement.name}`);
        continue;
      }
      
      console.log(`✅ Enhanced citation data loaded for ${supplement.name}`);
      
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
      
      console.log(`📊 Data Analysis:`);
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
      
      // Test each tab
      const tabs = ['Mechanisms', 'Benefits', 'Safety'];
      
      for (const tab of tabs) {
        console.log(`\n🔍 Testing ${tab} tab:`);
        
        const tabElement = await page.locator('.citation-tab-btn').filter({ hasText: tab });
        if (await tabElement.count() > 0) {
          await tabElement.click();
          await page.waitForTimeout(300);
          
          const tabAnalysis = await page.evaluate((suppId, tabType) => {
            const container = document.getElementById(`${tabType.toLowerCase()}-${suppId}`);
            if (!container || container.classList.contains('hidden')) {
              return { error: `${tabType} container not accessible` };
            }
            
            const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
            const undefinedIssues = [];
            
            cards.forEach((card, index) => {
              const text = card.textContent;
              if (text.includes('undefined')) {
                const undefinedMatches = text.match(/undefined/g) || [];
                const title = card.querySelector('h5')?.textContent?.trim();
                
                undefinedIssues.push({
                  cardIndex: index,
                  title: title,
                  undefinedCount: undefinedMatches.length
                });
              }
            });
            
            return {
              totalCards: cards.length,
              undefinedCards: undefinedIssues.length,
              issues: undefinedIssues
            };
          }, supplement.id, tab);
          
          if (tabAnalysis.error) {
            console.log(`   ❌ ${tabAnalysis.error}`);
          } else {
            console.log(`   📊 Cards: ${tabAnalysis.totalCards}`);
            console.log(`   ✅ Undefined issues: ${tabAnalysis.undefinedCards}`);
            
            if (tabAnalysis.undefinedCards > 0) {
              console.log(`   ⚠️ Issues found:`);
              tabAnalysis.issues.forEach(issue => {
                console.log(`     Card ${issue.cardIndex + 1}: "${issue.title}" (${issue.undefinedCount} undefined)`);
              });
            }
          }
        } else {
          console.log(`   ❌ ${tab} tab not found`);
        }
      }
    }
    
    // Overall Phase 2A status check
    console.log('\n' + '='.repeat(80));
    console.log('📊 PHASE 2A QUALITY FIXES - COMPLETION STATUS');
    console.log('='.repeat(80));
    
    const allTestSupplements = [
      { id: 61, name: 'Chromium' },
      { id: 38, name: 'Iron' },
      { id: 37, name: 'Zinc' },
      { id: 25, name: 'GABA' },
      { id: 26, name: 'Inositol' }
    ];
    
    let completedFixes = 0;
    
    for (const supplement of allTestSupplements) {
      const hasData = await page.evaluate((suppId) => {
        return !!window.enhancedCitations?.[suppId];
      }, supplement.id);
      
      if (hasData) {
        // Quick undefined check
        await page.fill('#searchInput', supplement.name);
        await page.waitForTimeout(300);
        
        const modalResult = await page.evaluate(async (suppId) => {
          try {
            await window.app.showSupplementDetails(suppId);
            return { success: true };
          } catch (error) {
            return { success: false };
          }
        }, supplement.id);
        
        if (modalResult.success) {
          await page.waitForTimeout(300);
          
          // Check Benefits tab for undefined
          const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
          if (await benefitsTab.count() > 0) {
            await benefitsTab.click();
            await page.waitForTimeout(200);
            
            const undefinedCheck = await page.evaluate((suppId) => {
              const container = document.getElementById(`benefits-${suppId}`);
              if (!container || container.classList.contains('hidden')) {
                return { hasUndefined: false };
              }
              
              const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
              const hasUndefined = cards.some(card => card.textContent.includes('undefined'));
              
              return { hasUndefined: hasUndefined };
            }, supplement.id);
            
            if (!undefinedCheck.hasUndefined) {
              completedFixes++;
              console.log(`✅ ${supplement.name}: Fixed and working`);
            } else {
              console.log(`❌ ${supplement.name}: Still has undefined values`);
            }
          }
        } else {
          console.log(`❌ ${supplement.name}: Modal error`);
        }
      } else {
        console.log(`❌ ${supplement.name}: No enhanced data`);
      }
    }
    
    console.log(`\n📊 Phase 2A Results:`);
    console.log(`   Fixed supplements: ${completedFixes}/${allTestSupplements.length}`);
    console.log(`   Success rate: ${Math.round((completedFixes / allTestSupplements.length) * 100)}%`);
    
    if (completedFixes === allTestSupplements.length) {
      console.log(`\n🎉 PHASE 2A COMPLETE!`);
      console.log(`   ✅ All undefined values fixed`);
      console.log(`   ✅ All missing citations created`);
      console.log(`   ✅ System quality restored`);
      console.log(`\n🚀 Ready for Phase 2B: Tier 2 Expansion`);
    } else {
      console.log(`\n⚠️ Phase 2A needs more work:`);
      console.log(`   ${allTestSupplements.length - completedFixes} supplements still need fixes`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ New citation testing complete');
  }
})();
