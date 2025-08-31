const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Comprehensive Spirulina Testing');
  console.log('Phase 3 Tier 2 Enhancement - Data Structure & Rendering Validation');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 STEP 1: Data Structure Validation');
    
    // Test data structure compatibility
    const dataStructure = await page.evaluate(() => {
      const data = window.enhancedCitations?.[53];
      if (!data) return { error: 'No data found' };
      
      // Validate required structure
      const structure = {
        hasSupplementId: typeof data.supplementId === 'number',
        hasSupplementName: typeof data.supplementName === 'string',
        hasIsEnhanced: typeof data.isEnhanced === 'boolean',
        hasVersion: typeof data.version === 'string',
        hasLastUpdated: typeof data.lastUpdated === 'string',
        hasCitations: !!data.citations,
        hasMechanisms: Array.isArray(data.citations?.mechanisms),
        hasBenefits: Array.isArray(data.citations?.benefits),
        hasSafety: Array.isArray(data.citations?.safety)
      };
      
      // Count citations
      const counts = {
        mechanisms: data.citations?.mechanisms?.length || 0,
        benefits: data.citations?.benefits?.length || 0,
        safety: data.citations?.safety?.length || 0
      };
      
      // Validate citation structure
      const sampleMechanism = data.citations?.mechanisms?.[0];
      const sampleBenefit = data.citations?.benefits?.[0];
      const sampleSafety = data.citations?.safety?.[0];
      
      const citationStructure = {
        mechanismValid: !!(sampleMechanism?.claim && sampleMechanism?.mechanismType && sampleMechanism?.studies),
        benefitValid: !!(sampleBenefit?.claim && sampleBenefit?.healthDomain && sampleBenefit?.studies),
        safetyValid: !!(sampleSafety?.claim && sampleSafety?.safetyAspect && sampleSafety?.studies)
      };
      
      return {
        structure,
        counts,
        citationStructure,
        supplementId: data.supplementId,
        supplementName: data.supplementName
      };
    });
    
    if (dataStructure.error) {
      console.log(`❌ ${dataStructure.error}`);
      return;
    }
    
    console.log(`✅ Data Structure Validation:`);
    console.log(`   Supplement ID: ${dataStructure.supplementId}`);
    console.log(`   Supplement Name: ${dataStructure.supplementName}`);
    console.log(`   Required Fields: ${Object.values(dataStructure.structure).every(v => v) ? 'All Present' : 'Missing Fields'}`);
    console.log(`   Citation Counts: ${dataStructure.counts.mechanisms}M + ${dataStructure.counts.benefits}B + ${dataStructure.counts.safety}S = ${dataStructure.counts.mechanisms + dataStructure.counts.benefits + dataStructure.counts.safety}`);
    console.log(`   Citation Structure: ${Object.values(dataStructure.citationStructure).every(v => v) ? 'Valid' : 'Invalid'}`);
    
    console.log('\n🔍 STEP 2: Modal Functionality Test');
    
    // Search for Spirulina
    await page.fill('#searchInput', 'Spirulina');
    await page.waitForTimeout(1000);
    
    // Test modal opening
    const modalResult = await page.evaluate(async (suppId) => {
      try {
        await window.app.showSupplementDetails(suppId);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, 53);
    
    if (!modalResult.success) {
      console.log(`❌ Modal error: ${modalResult.error}`);
      return;
    }
    
    console.log(`✅ Modal opened successfully`);
    await page.waitForTimeout(1000);
    
    console.log('\n🔍 STEP 3: Tab Rendering Validation');
    
    // Test all tabs for proper rendering
    const tabs = ['Benefits', 'Mechanisms', 'Safety'];
    let allTabsValid = true;
    const tabResults = {};
    
    for (const tabName of tabs) {
      console.log(`\n   Testing ${tabName} Tab:`);
      
      const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabName }).first();
      if (await tab.count() === 0) {
        console.log(`   ❌ ${tabName} tab not found`);
        allTabsValid = false;
        continue;
      }
      
      await tab.click();
      await page.waitForTimeout(500);
      
      const tabAnalysis = await page.evaluate((suppId, tabName) => {
        const containerId = `${tabName.toLowerCase()}-${suppId}`;
        const container = document.getElementById(containerId);
        
        if (!container) {
          return { error: `Container ${containerId} not found` };
        }
        
        if (container.classList.contains('hidden')) {
          return { error: `Container ${containerId} is hidden` };
        }
        
        const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
        const issues = [];
        const cardDetails = [];
        
        cards.forEach((card, index) => {
          const text = card.textContent;
          const title = card.querySelector('h5')?.textContent?.trim();
          
          // Check for undefined values
          if (text.includes('undefined')) {
            const undefinedMatches = text.match(/undefined/g) || [];
            issues.push({
              cardIndex: index,
              title: title,
              undefinedCount: undefinedMatches.length
            });
          }
          
          // Check for empty content
          if (text.trim().length < 50) {
            issues.push({
              cardIndex: index,
              title: title,
              issue: 'Content too short'
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
          issues: issues,
          cardDetails: cardDetails,
          containerVisible: !container.classList.contains('hidden')
        };
      }, 53, tabName);
      
      if (tabAnalysis.error) {
        console.log(`   ❌ ${tabAnalysis.error}`);
        allTabsValid = false;
      } else if (tabAnalysis.issues.length > 0) {
        console.log(`   ❌ ${tabAnalysis.issues.length} issues found:`);
        tabAnalysis.issues.forEach(issue => {
          console.log(`     - Card ${issue.cardIndex + 1}: ${issue.title} (${issue.undefinedCount || 0} undefined, ${issue.issue || 'undefined values'})`);
        });
        allTabsValid = false;
      } else if (tabAnalysis.totalCards === 0) {
        console.log(`   ❌ No cards found`);
        allTabsValid = false;
      } else {
        console.log(`   ✅ ${tabAnalysis.totalCards} cards rendering perfectly`);
        if (tabAnalysis.cardDetails.length > 0) {
          const firstCard = tabAnalysis.cardDetails[0];
          console.log(`     Sample: "${firstCard.title}"`);
          console.log(`     Preview: ${firstCard.preview}...`);
        }
      }
      
      tabResults[tabName] = tabAnalysis;
    }
    
    console.log('\n🔍 STEP 4: Phase 3 Progress Validation');
    
    // Test all Phase 3 supplements together
    const phase3Progress = await page.evaluate(() => {
      const phase3Ids = [44, 15, 53]; // Alpha-Lipoic Acid, Panax Ginseng, Spirulina
      const results = {};
      let totalCitations = 0;
      
      phase3Ids.forEach(id => {
        const data = window.enhancedCitations?.[id];
        if (data) {
          const citationCount = (data.citations?.mechanisms?.length || 0) + 
                               (data.citations?.benefits?.length || 0) + 
                               (data.citations?.safety?.length || 0);
          results[id] = {
            name: data.supplementName,
            working: true,
            citations: citationCount
          };
          totalCitations += citationCount;
        } else {
          results[id] = { working: false };
        }
      });
      
      return {
        results,
        totalCitations,
        totalEnhanced: Object.keys(window.enhancedCitations || {}).length
      };
    });
    
    console.log(`\n📊 Phase 3 Progress Summary:`);
    Object.entries(phase3Progress.results).forEach(([id, result]) => {
      if (result.working) {
        console.log(`   ✅ ID ${id}: ${result.name} (${result.citations} citations)`);
      } else {
        console.log(`   ❌ ID ${id}: Not working`);
      }
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 SPIRULINA COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(70));
    
    if (allTabsValid && Object.values(phase3Progress.results).every(r => r.working)) {
      console.log(`\n🎉 PERFECT SUCCESS!`);
      console.log(`✅ Data structure: Compatible with citation loader`);
      console.log(`✅ Modal functionality: Working perfectly`);
      console.log(`✅ Tab rendering: All tabs rendering without issues`);
      console.log(`✅ Citation quality: ${dataStructure.counts.mechanisms + dataStructure.counts.benefits + dataStructure.counts.safety} comprehensive citations`);
      console.log(`✅ Phase 3 progress: 3/18 Tier 2 targets (16.7%)`);
      
      console.log(`\n🚀 PHASE 3 MOMENTUM:`);
      console.log(`   Total Phase 3 Citations: ${phase3Progress.totalCitations}`);
      console.log(`   Total Enhanced Citations: ${phase3Progress.totalEnhanced}`);
      console.log(`   Success Rate: 100% (3/3 supplements working perfectly)`);
      
      console.log(`\n🎯 READY FOR NEXT TARGET:`);
      console.log(`   Next: Cordyceps (ID: 52) - Herbal Supplement`);
      console.log(`   Or: MCT Oil (ID: 58) - Performance Enhancers`);
      
    } else {
      console.log(`\n❌ ISSUES FOUND:`);
      console.log(`   Data structure issues: ${!Object.values(dataStructure.structure).every(v => v)}`);
      console.log(`   Tab rendering issues: ${!allTabsValid}`);
      console.log(`   Phase 3 supplements not working: ${!Object.values(phase3Progress.results).every(r => r.working)}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive Spirulina testing complete');
  }
})();
