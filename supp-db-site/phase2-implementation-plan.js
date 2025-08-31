const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Phase 2 Implementation Plan - Data Structure Analysis');
  console.log('Analyzing current state and planning systematic improvements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Step 1: Identify current issues and priorities
    console.log('\n📊 PHASE 2A: QUALITY OPTIMIZATION ANALYSIS');
    console.log('='.repeat(60));
    
    // Get current system status
    const currentStatus = await page.evaluate(() => {
      const supplements = window.app.supplements || [];
      const enhanced = window.enhancedCitations || {};
      
      const analysis = {
        totalSupplements: supplements.length,
        enhancedCount: Object.keys(enhanced).length,
        qualityIssues: [],
        missingCritical: [],
        tierStatus: { tier1: 0, tier2: 0, tier3: 0 },
        enhancedByTier: { tier1: 0, tier2: 0, tier3: 0 }
      };
      
      // Analyze each supplement
      supplements.forEach(supp => {
        const tier = supp.evidenceTier || 'Unknown';
        const isEnhanced = !!enhanced[supp.id];
        
        // Count by tier
        if (tier === 'Tier 1') {
          analysis.tierStatus.tier1++;
          if (isEnhanced) analysis.enhancedByTier.tier1++;
        } else if (tier === 'Tier 2') {
          analysis.tierStatus.tier2++;
          if (isEnhanced) analysis.enhancedByTier.tier2++;
        } else if (tier === 'Tier 3') {
          analysis.tierStatus.tier3++;
          if (isEnhanced) analysis.enhancedByTier.tier3++;
        }
        
        // Identify missing critical supplements
        if (tier === 'Tier 1' && !isEnhanced) {
          analysis.missingCritical.push({
            id: supp.id,
            name: supp.name,
            category: supp.category
          });
        }
      });
      
      return analysis;
    });
    
    console.log(`📈 Current Status:`);
    console.log(`   Total Supplements: ${currentStatus.totalSupplements}`);
    console.log(`   Enhanced Citations: ${currentStatus.enhancedCount}`);
    console.log(`   Coverage Rate: ${Math.round((currentStatus.enhancedCount / currentStatus.totalSupplements) * 100)}%`);
    
    console.log(`\n🎯 Tier Coverage:`);
    console.log(`   Tier 1: ${currentStatus.enhancedByTier.tier1}/${currentStatus.tierStatus.tier1} (${Math.round((currentStatus.enhancedByTier.tier1 / currentStatus.tierStatus.tier1) * 100)}%)`);
    console.log(`   Tier 2: ${currentStatus.enhancedByTier.tier2}/${currentStatus.tierStatus.tier2} (${Math.round((currentStatus.enhancedByTier.tier2 / currentStatus.tierStatus.tier2) * 100)}%)`);
    console.log(`   Tier 3: ${currentStatus.enhancedByTier.tier3}/${currentStatus.tierStatus.tier3} (${Math.round((currentStatus.enhancedByTier.tier3 / currentStatus.tierStatus.tier3) * 100)}%)`);
    
    if (currentStatus.missingCritical.length > 0) {
      console.log(`\n🚨 Missing Critical Tier 1 Supplements:`);
      currentStatus.missingCritical.forEach(supp => {
        console.log(`   ❌ ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
    }
    
    // Step 2: Test current quality issues
    console.log('\n🔍 QUALITY ISSUE DETECTION');
    console.log('='.repeat(60));
    
    const qualityIssues = [];
    const testSupplements = [
      { id: 61, name: 'Chromium' },
      { id: 25, name: 'GABA' },
      { id: 26, name: 'Inositol' },
      { id: 38, name: 'Iron' },
      { id: 37, name: 'Zinc' }
    ];
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing: ${supplement.name} (ID: ${supplement.id})`);
      
      // Check if enhanced data exists
      const hasData = await page.evaluate((suppId) => {
        return !!window.enhancedCitations?.[suppId];
      }, supplement.id);
      
      if (!hasData) {
        console.log(`   ❌ No enhanced citation data`);
        qualityIssues.push({ supplement: supplement.name, issue: 'No enhanced data' });
        continue;
      }
      
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
        console.log(`   ❌ Modal error: ${modalResult.error}`);
        qualityIssues.push({ supplement: supplement.name, issue: 'Modal error' });
        continue;
      }
      
      await page.waitForTimeout(500);
      
      // Check for undefined values in Benefits tab
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(300);
        
        const undefinedCheck = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container || container.classList.contains('hidden')) {
            return { hasUndefined: false, cardCount: 0 };
          }
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const hasUndefined = cards.some(card => card.textContent.includes('undefined'));
          
          return {
            hasUndefined: hasUndefined,
            cardCount: cards.length,
            undefinedCards: cards.filter(card => card.textContent.includes('undefined')).length
          };
        }, supplement.id);
        
        if (undefinedCheck.hasUndefined) {
          console.log(`   ⚠️ Contains undefined values (${undefinedCheck.undefinedCards}/${undefinedCheck.cardCount} cards)`);
          qualityIssues.push({ supplement: supplement.name, issue: 'Undefined values' });
        } else {
          console.log(`   ✅ No undefined values found (${undefinedCheck.cardCount} cards)`);
        }
      }
    }
    
    // Step 3: Plan Phase 2 Implementation
    console.log('\n' + '='.repeat(80));
    console.log('🎯 PHASE 2 IMPLEMENTATION PLAN');
    console.log('='.repeat(80));
    
    console.log(`\n📋 Phase 2A: Quality Optimization (Week 1)`);
    console.log(`   Priority 1: Fix undefined values (${qualityIssues.filter(i => i.issue === 'Undefined values').length} supplements)`);
    console.log(`   Priority 2: Complete Tier 1 coverage (${currentStatus.missingCritical.length} supplements)`);
    console.log(`   Priority 3: Create missing critical citations`);
    
    console.log(`\n📈 Phase 2B: Tier 2 Expansion (Weeks 2-4)`);
    const tier2Remaining = currentStatus.tierStatus.tier2 - currentStatus.enhancedByTier.tier2;
    const tier2Target = Math.round(currentStatus.tierStatus.tier2 * 0.8);
    const tier2Needed = tier2Target - currentStatus.enhancedByTier.tier2;
    
    console.log(`   Current Tier 2: ${currentStatus.enhancedByTier.tier2}/${currentStatus.tierStatus.tier2} (${Math.round((currentStatus.enhancedByTier.tier2 / currentStatus.tierStatus.tier2) * 100)}%)`);
    console.log(`   Target: ${tier2Target}/${currentStatus.tierStatus.tier2} (80%)`);
    console.log(`   Need to create: ${tier2Needed} enhanced citations`);
    
    console.log(`\n🔧 Phase 2C: System Features (Parallel)`);
    console.log(`   Advanced search functionality`);
    console.log(`   Analytics dashboard`);
    console.log(`   Mobile optimization`);
    console.log(`   Performance monitoring`);
    
    // Step 4: Immediate Action Items
    console.log(`\n🚀 IMMEDIATE ACTION ITEMS (This Week)`);
    console.log(`=`.repeat(60));
    
    console.log(`\n1. 🔧 Fix Quality Issues:`);
    qualityIssues.forEach(issue => {
      console.log(`   • ${issue.supplement}: ${issue.issue}`);
    });
    
    console.log(`\n2. 🎯 Complete Tier 1:`);
    currentStatus.missingCritical.forEach(supp => {
      console.log(`   • Create enhanced citations for ${supp.name} (ID: ${supp.id})`);
    });
    
    console.log(`\n3. 📊 Validate Data Structure:`);
    console.log(`   • Run comprehensive audit`);
    console.log(`   • Test all enhanced supplements`);
    console.log(`   • Verify citation quality`);
    
    console.log(`\n4. 🏗️ Prepare for Tier 2 Expansion:`);
    console.log(`   • Identify high-priority Tier 2 supplements`);
    console.log(`   • Gather research data for next batch`);
    console.log(`   • Update documentation and tools`);
    
    // Step 5: Success Metrics
    console.log(`\n📊 SUCCESS METRICS FOR PHASE 2A`);
    console.log(`=`.repeat(60));
    
    console.log(`\n🎯 Quality Targets:`);
    console.log(`   • Zero undefined values in enhanced citations`);
    console.log(`   • 100% Tier 1 coverage`);
    console.log(`   • 100% functional rate maintained`);
    console.log(`   • All critical supplements enhanced`);
    
    console.log(`\n📈 Coverage Targets:`);
    console.log(`   • Tier 1: 100% (from ${Math.round((currentStatus.enhancedByTier.tier1 / currentStatus.tierStatus.tier1) * 100)}%)`);
    console.log(`   • Tier 2: 80% (from ${Math.round((currentStatus.enhancedByTier.tier2 / currentStatus.tierStatus.tier2) * 100)}%)`);
    console.log(`   • Overall: 65% (from ${Math.round((currentStatus.enhancedCount / currentStatus.totalSupplements) * 100)}%)`);
    
    console.log(`\n⚡ Performance Targets:`);
    console.log(`   • <2s citation loading time`);
    console.log(`   • Mobile responsive design`);
    console.log(`   • Advanced search functionality`);
    console.log(`   • Real-time quality monitoring`);
    
    console.log(`\n💡 RECOMMENDED NEXT STEPS:`);
    console.log(`=`.repeat(60));
    
    if (qualityIssues.length > 0) {
      console.log(`\n🔧 IMMEDIATE (Today):`);
      console.log(`   1. Fix undefined values in ${qualityIssues.filter(i => i.issue === 'Undefined values').length} supplements`);
      console.log(`   2. Test and validate fixes`);
      console.log(`   3. Run quality audit`);
    }
    
    if (currentStatus.missingCritical.length > 0) {
      console.log(`\n🎯 THIS WEEK:`);
      console.log(`   1. Create enhanced citations for ${currentStatus.missingCritical.length} Tier 1 supplements`);
      console.log(`   2. Achieve 100% Tier 1 coverage`);
      console.log(`   3. Validate all Tier 1 quality`);
    }
    
    console.log(`\n📈 NEXT 2-4 WEEKS:`);
    console.log(`   1. Begin systematic Tier 2 expansion`);
    console.log(`   2. Implement advanced search features`);
    console.log(`   3. Deploy analytics dashboard`);
    console.log(`   4. Optimize mobile experience`);
    
    console.log(`\n🎉 PHASE 2 COMPLETION CRITERIA:`);
    console.log(`   ✅ 100% Tier 1 coverage with zero quality issues`);
    console.log(`   ✅ 80% Tier 2 coverage with high-quality citations`);
    console.log(`   ✅ Advanced search and analytics features deployed`);
    console.log(`   ✅ Mobile-optimized user experience`);
    console.log(`   ✅ Comprehensive documentation and validation tools`);
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Phase 2 implementation plan complete');
  }
})();
