const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Panax Ginseng Rendering Issues');
  console.log('Investigating clinical benefits and safety tab rendering...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 STEP 1: Data Structure Analysis');
    
    // Check raw data structure
    const dataAnalysis = await page.evaluate(() => {
      const data = window.enhancedCitations?.[15];
      if (!data) return { error: 'No data found for ID 15' };
      
      return {
        supplementId: data.supplementId,
        supplementName: data.supplementName,
        isEnhanced: data.isEnhanced,
        hasCitations: !!data.citations,
        citationKeys: data.citations ? Object.keys(data.citations) : [],
        mechanismsCount: data.citations?.mechanisms?.length || 0,
        benefitsCount: data.citations?.benefits?.length || 0,
        safetyCount: data.citations?.safety?.length || 0,
        sampleBenefit: data.citations?.benefits?.[0] || null,
        sampleSafety: data.citations?.safety?.[0] || null
      };
    });
    
    if (dataAnalysis.error) {
      console.log(`❌ ${dataAnalysis.error}`);
      return;
    }
    
    console.log(`✅ Data Structure:`);
    console.log(`   Supplement: ${dataAnalysis.supplementName} (ID: ${dataAnalysis.supplementId})`);
    console.log(`   Enhanced: ${dataAnalysis.isEnhanced}`);
    console.log(`   Has Citations: ${dataAnalysis.hasCitations}`);
    console.log(`   Citation Keys: ${dataAnalysis.citationKeys.join(', ')}`);
    console.log(`   Counts: ${dataAnalysis.mechanismsCount}M + ${dataAnalysis.benefitsCount}B + ${dataAnalysis.safetyCount}S`);
    
    if (dataAnalysis.sampleBenefit) {
      console.log(`   Sample Benefit: "${dataAnalysis.sampleBenefit.claim?.substring(0, 50)}..."`);
    }
    if (dataAnalysis.sampleSafety) {
      console.log(`   Sample Safety: "${dataAnalysis.sampleSafety.claim?.substring(0, 50)}..."`);
    }
    
    console.log('\n🔍 STEP 2: Modal Opening Test');
    
    // Search for Panax Ginseng
    await page.fill('#searchInput', 'Panax Ginseng');
    await page.waitForTimeout(1000);
    
    // Open modal
    const modalResult = await page.evaluate(async (suppId) => {
      try {
        await window.app.showSupplementDetails(suppId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, 15);
    
    if (!modalResult.success) {
      console.log(`❌ Modal error: ${modalResult.error}`);
      return;
    }
    
    console.log(`✅ Modal opened successfully`);
    await page.waitForTimeout(1000);
    
    console.log('\n🔍 STEP 3: Tab Structure Analysis');
    
    // Check tab structure
    const tabStructure = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.citation-tab-btn'));
      const tabInfo = tabs.map(tab => ({
        text: tab.textContent.trim(),
        visible: !tab.classList.contains('hidden'),
        active: tab.classList.contains('active')
      }));
      
      return {
        totalTabs: tabs.length,
        tabInfo: tabInfo
      };
    });
    
    console.log(`   Total Tabs: ${tabStructure.totalTabs}`);
    tabStructure.tabInfo.forEach((tab, index) => {
      console.log(`   Tab ${index + 1}: "${tab.text}" (Visible: ${tab.visible}, Active: ${tab.active})`);
    });
    
    console.log('\n🔍 STEP 4: Benefits Tab Detailed Analysis');
    
    // Click Benefits tab and analyze
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    if (await benefitsTab.count() > 0) {
      await benefitsTab.click();
      await page.waitForTimeout(500);
      
      const benefitsAnalysis = await page.evaluate(() => {
        const container = document.getElementById('benefits-15');
        if (!container) {
          return { error: 'Benefits container not found' };
        }
        
        const isHidden = container.classList.contains('hidden');
        const innerHTML = container.innerHTML;
        const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
        
        const cardAnalysis = cards.map((card, index) => {
          const title = card.querySelector('h5')?.textContent?.trim();
          const content = card.textContent;
          const hasUndefined = content.includes('undefined');
          const undefinedCount = (content.match(/undefined/g) || []).length;
          
          return {
            index: index,
            title: title,
            hasContent: content.length > 50,
            hasUndefined: hasUndefined,
            undefinedCount: undefinedCount,
            preview: content.substring(0, 150).replace(/\s+/g, ' ')
          };
        });
        
        return {
          containerExists: true,
          isHidden: isHidden,
          htmlLength: innerHTML.length,
          cardCount: cards.length,
          cardAnalysis: cardAnalysis,
          rawHTML: innerHTML.substring(0, 500) // First 500 chars for debugging
        };
      });
      
      if (benefitsAnalysis.error) {
        console.log(`   ❌ ${benefitsAnalysis.error}`);
      } else {
        console.log(`   ✅ Benefits Container Found:`);
        console.log(`     Hidden: ${benefitsAnalysis.isHidden}`);
        console.log(`     HTML Length: ${benefitsAnalysis.htmlLength} chars`);
        console.log(`     Card Count: ${benefitsAnalysis.cardCount}`);
        
        if (benefitsAnalysis.cardCount === 0) {
          console.log(`   ❌ NO CARDS FOUND - This is the issue!`);
          console.log(`     Raw HTML Preview: ${benefitsAnalysis.rawHTML}`);
        } else {
          benefitsAnalysis.cardAnalysis.forEach(card => {
            const status = card.hasUndefined ? `❌ ${card.undefinedCount} undefined` : '✅ Clean';
            console.log(`     Card ${card.index + 1}: ${status} - "${card.title}"`);
            if (card.hasUndefined) {
              console.log(`       Preview: ${card.preview}`);
            }
          });
        }
      }
    } else {
      console.log(`   ❌ Benefits tab not found`);
    }
    
    console.log('\n🔍 STEP 5: Safety Tab Detailed Analysis');
    
    // Click Safety tab and analyze
    const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
    if (await safetyTab.count() > 0) {
      await safetyTab.click();
      await page.waitForTimeout(500);
      
      const safetyAnalysis = await page.evaluate(() => {
        const container = document.getElementById('safety-15');
        if (!container) {
          return { error: 'Safety container not found' };
        }
        
        const isHidden = container.classList.contains('hidden');
        const innerHTML = container.innerHTML;
        const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
        
        const cardAnalysis = cards.map((card, index) => {
          const title = card.querySelector('h5')?.textContent?.trim();
          const content = card.textContent;
          const hasUndefined = content.includes('undefined');
          const undefinedCount = (content.match(/undefined/g) || []).length;
          
          return {
            index: index,
            title: title,
            hasContent: content.length > 50,
            hasUndefined: hasUndefined,
            undefinedCount: undefinedCount,
            preview: content.substring(0, 150).replace(/\s+/g, ' ')
          };
        });
        
        return {
          containerExists: true,
          isHidden: isHidden,
          htmlLength: innerHTML.length,
          cardCount: cards.length,
          cardAnalysis: cardAnalysis,
          rawHTML: innerHTML.substring(0, 500)
        };
      });
      
      if (safetyAnalysis.error) {
        console.log(`   ❌ ${safetyAnalysis.error}`);
      } else {
        console.log(`   ✅ Safety Container Found:`);
        console.log(`     Hidden: ${safetyAnalysis.isHidden}`);
        console.log(`     HTML Length: ${safetyAnalysis.htmlLength} chars`);
        console.log(`     Card Count: ${safetyAnalysis.cardCount}`);
        
        if (safetyAnalysis.cardCount === 0) {
          console.log(`   ❌ NO CARDS FOUND - This is the issue!`);
          console.log(`     Raw HTML Preview: ${safetyAnalysis.rawHTML}`);
        } else {
          safetyAnalysis.cardAnalysis.forEach(card => {
            const status = card.hasUndefined ? `❌ ${card.undefinedCount} undefined` : '✅ Clean';
            console.log(`     Card ${card.index + 1}: ${status} - "${card.title}"`);
            if (card.hasUndefined) {
              console.log(`       Preview: ${card.preview}`);
            }
          });
        }
      }
    } else {
      console.log(`   ❌ Safety tab not found`);
    }
    
    console.log('\n🔍 STEP 6: Citation Renderer Investigation');
    
    // Check if citation renderer is working
    const rendererCheck = await page.evaluate(() => {
      const data = window.enhancedCitations?.[15];
      if (!data) return { error: 'No data' };
      
      // Try to manually render a benefit
      const sampleBenefit = data.citations?.benefits?.[0];
      if (!sampleBenefit) return { error: 'No benefits found' };
      
      // Check if CitationRenderer exists and works
      const hasRenderer = typeof window.CitationRenderer !== 'undefined';
      
      let renderTest = null;
      if (hasRenderer && window.CitationRenderer.renderBenefit) {
        try {
          renderTest = window.CitationRenderer.renderBenefit(sampleBenefit);
        } catch (e) {
          renderTest = { error: e.message };
        }
      }
      
      return {
        hasRenderer: hasRenderer,
        sampleBenefit: sampleBenefit,
        renderTest: renderTest,
        rendererMethods: hasRenderer ? Object.keys(window.CitationRenderer) : []
      };
    });
    
    console.log(`   Citation Renderer Available: ${rendererCheck.hasRenderer}`);
    if (rendererCheck.hasRenderer) {
      console.log(`   Renderer Methods: ${rendererCheck.rendererMethods.join(', ')}`);
      if (rendererCheck.renderTest) {
        if (rendererCheck.renderTest.error) {
          console.log(`   ❌ Render Test Error: ${rendererCheck.renderTest.error}`);
        } else {
          console.log(`   ✅ Render Test Success: ${typeof rendererCheck.renderTest}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🔍 PANAX GINSENG RENDERING DIAGNOSIS');
    console.log('='.repeat(70));
    
    console.log(`\n📊 Summary:`);
    console.log(`   Data Structure: ${dataAnalysis.hasCitations ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Modal Opening: ${modalResult.success ? '✅ Working' : '❌ Failed'}`);
    console.log(`   Benefits Data: ${dataAnalysis.benefitsCount} items`);
    console.log(`   Safety Data: ${dataAnalysis.safetyCount} items`);
    console.log(`   Citation Renderer: ${rendererCheck.hasRenderer ? '✅ Available' : '❌ Missing'}`);
    
    console.log(`\n💡 Next Steps:`);
    console.log(`   1. Check if citation renderer is properly loading benefits/safety`);
    console.log(`   2. Verify data format compatibility with renderer`);
    console.log(`   3. Test manual rendering of individual citations`);
    console.log(`   4. Compare with working supplements (Alpha-Lipoic Acid, Spirulina)`);
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Panax Ginseng rendering debug complete');
  }
})();
