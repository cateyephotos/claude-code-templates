const { chromium } = require('playwright');

(async () => {
  console.log('🌟 Phase 3: Tier 1 & 2 Systematic Enhancement Analysis');
  console.log('Analyzing current coverage and planning comprehensive enhancement...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get comprehensive Tier 1 & 2 analysis
    const tierAnalysis = await page.evaluate(() => {
      const supplements = window.app.supplements || [];
      const enhanced = window.enhancedCitations || {};
      
      const analysis = {
        tier1: { total: 0, enhanced: 0, supplements: [] },
        tier2: { total: 0, enhanced: 0, supplements: [] },
        tier3: { total: 0, enhanced: 0, supplements: [] },
        unknown: { total: 0, enhanced: 0, supplements: [] },
        categoryBreakdown: {},
        priorityTargets: []
      };
      
      supplements.forEach(supp => {
        const tier = supp.evidenceTier || 'Unknown';
        const isEnhanced = !!enhanced[supp.id];
        const category = supp.category || 'Unknown';
        
        // Categorize by tier
        const tierKey = tier === 'Tier 1' ? 'tier1' : 
                       tier === 'Tier 2' ? 'tier2' : 
                       tier === 'Tier 3' ? 'tier3' : 'unknown';
        
        analysis[tierKey].total++;
        if (isEnhanced) {
          analysis[tierKey].enhanced++;
        }
        
        analysis[tierKey].supplements.push({
          id: supp.id,
          name: supp.name,
          category: category,
          isEnhanced: isEnhanced,
          description: supp.description || '',
          benefits: supp.benefits || [],
          mechanisms: supp.mechanisms || []
        });
        
        // Category breakdown for Tier 1 & 2
        if (tier === 'Tier 1' || tier === 'Tier 2') {
          if (!analysis.categoryBreakdown[category]) {
            analysis.categoryBreakdown[category] = { 
              tier1: { total: 0, enhanced: 0 }, 
              tier2: { total: 0, enhanced: 0 } 
            };
          }
          
          if (tier === 'Tier 1') {
            analysis.categoryBreakdown[category].tier1.total++;
            if (isEnhanced) analysis.categoryBreakdown[category].tier1.enhanced++;
          } else {
            analysis.categoryBreakdown[category].tier2.total++;
            if (isEnhanced) analysis.categoryBreakdown[category].tier2.enhanced++;
          }
        }
        
        // Identify priority targets (Tier 1 & 2 unenhanced)
        if ((tier === 'Tier 1' || tier === 'Tier 2') && !isEnhanced) {
          analysis.priorityTargets.push({
            id: supp.id,
            name: supp.name,
            tier: tier,
            category: category,
            priority: tier === 'Tier 1' ? 'Critical' : 'High',
            description: supp.description || 'No description available'
          });
        }
      });
      
      return analysis;
    });
    
    console.log('\n📊 TIER 1 & 2 COVERAGE ANALYSIS');
    console.log('='.repeat(60));
    
    console.log(`\n🥇 Tier 1 Status (Highest Evidence):`);
    console.log(`   Total: ${tierAnalysis.tier1.total}`);
    console.log(`   Enhanced: ${tierAnalysis.tier1.enhanced}`);
    console.log(`   Coverage: ${Math.round((tierAnalysis.tier1.enhanced / tierAnalysis.tier1.total) * 100)}%`);
    console.log(`   Remaining: ${tierAnalysis.tier1.total - tierAnalysis.tier1.enhanced}`);
    
    console.log(`\n🥈 Tier 2 Status (Strong Evidence):`);
    console.log(`   Total: ${tierAnalysis.tier2.total}`);
    console.log(`   Enhanced: ${tierAnalysis.tier2.enhanced}`);
    console.log(`   Coverage: ${Math.round((tierAnalysis.tier2.enhanced / tierAnalysis.tier2.total) * 100)}%`);
    console.log(`   Remaining: ${tierAnalysis.tier2.total - tierAnalysis.tier2.enhanced}`);
    
    console.log(`\n📈 Combined Tier 1 & 2 Status:`);
    const combinedTotal = tierAnalysis.tier1.total + tierAnalysis.tier2.total;
    const combinedEnhanced = tierAnalysis.tier1.enhanced + tierAnalysis.tier2.enhanced;
    const combinedCoverage = Math.round((combinedEnhanced / combinedTotal) * 100);
    console.log(`   Total: ${combinedTotal}`);
    console.log(`   Enhanced: ${combinedEnhanced}`);
    console.log(`   Coverage: ${combinedCoverage}%`);
    console.log(`   Remaining: ${combinedTotal - combinedEnhanced}`);
    
    console.log(`\n📋 Coverage by Category (Tier 1 & 2):`);
    Object.entries(tierAnalysis.categoryBreakdown)
      .sort(([,a], [,b]) => (b.tier1.total + b.tier2.total) - (a.tier1.total + a.tier2.total))
      .forEach(([category, data]) => {
        const tier1Rate = data.tier1.total > 0 ? Math.round((data.tier1.enhanced / data.tier1.total) * 100) : 0;
        const tier2Rate = data.tier2.total > 0 ? Math.round((data.tier2.enhanced / data.tier2.total) * 100) : 0;
        const totalInCategory = data.tier1.total + data.tier2.total;
        const enhancedInCategory = data.tier1.enhanced + data.tier2.enhanced;
        const overallRate = totalInCategory > 0 ? Math.round((enhancedInCategory / totalInCategory) * 100) : 0;
        
        console.log(`   ${category}:`);
        console.log(`     Tier 1: ${data.tier1.enhanced}/${data.tier1.total} (${tier1Rate}%)`);
        console.log(`     Tier 2: ${data.tier2.enhanced}/${data.tier2.total} (${tier2Rate}%)`);
        console.log(`     Overall: ${enhancedInCategory}/${totalInCategory} (${overallRate}%)`);
      });
    
    console.log(`\n🎯 PRIORITY TARGETS FOR ENHANCEMENT:`);
    
    // Group by priority
    const criticalTargets = tierAnalysis.priorityTargets.filter(t => t.priority === 'Critical');
    const highTargets = tierAnalysis.priorityTargets.filter(t => t.priority === 'High');
    
    if (criticalTargets.length > 0) {
      console.log(`\n🔥 CRITICAL PRIORITY (Tier 1): ${criticalTargets.length} supplements`);
      criticalTargets.forEach(supp => {
        console.log(`   • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
    }
    
    if (highTargets.length > 0) {
      console.log(`\n📈 HIGH PRIORITY (Tier 2): ${highTargets.length} supplements`);
      highTargets.slice(0, 15).forEach(supp => {
        console.log(`   • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
      if (highTargets.length > 15) {
        console.log(`   ... and ${highTargets.length - 15} more`);
      }
    }
    
    // Phase 3 Implementation Plan
    console.log('\n' + '='.repeat(80));
    console.log('🚀 PHASE 3: TIER 1 & 2 SYSTEMATIC ENHANCEMENT PLAN');
    console.log('='.repeat(80));
    
    console.log(`\n🎯 Enhancement Targets:`);
    const tier1Target = Math.ceil(tierAnalysis.tier1.total * 0.95); // 95% Tier 1
    const tier2Target = Math.ceil(tierAnalysis.tier2.total * 0.90); // 90% Tier 2
    const tier1Needed = Math.max(0, tier1Target - tierAnalysis.tier1.enhanced);
    const tier2Needed = Math.max(0, tier2Target - tierAnalysis.tier2.enhanced);
    const totalNeeded = tier1Needed + tier2Needed;
    
    console.log(`   Tier 1 Target: 95% (${tier1Target}/${tierAnalysis.tier1.total})`);
    console.log(`   Tier 1 Need: ${tier1Needed} supplements`);
    console.log(`   Tier 2 Target: 90% (${tier2Target}/${tierAnalysis.tier2.total})`);
    console.log(`   Tier 2 Need: ${tier2Needed} supplements`);
    console.log(`   Total Need: ${totalNeeded} enhanced citations`);
    
    console.log(`\n📋 Implementation Strategy:`);
    if (totalNeeded <= 10) {
      console.log(`   Week 1-2: Complete all Tier 1 (${tier1Needed} supplements)`);
      console.log(`   Week 3-4: Complete Tier 2 targets (${tier2Needed} supplements)`);
      console.log(`   Week 5: Quality review and optimization`);
    } else if (totalNeeded <= 20) {
      console.log(`   Week 1-2: Complete all Tier 1 (${tier1Needed} supplements)`);
      console.log(`   Week 3-4: High-priority Tier 2 (${Math.min(tier2Needed, 10)} supplements)`);
      console.log(`   Week 5-6: Remaining Tier 2 (${Math.max(0, tier2Needed - 10)} supplements)`);
      console.log(`   Week 7: Quality review and optimization`);
    } else {
      console.log(`   Week 1-2: Complete all Tier 1 (${tier1Needed} supplements)`);
      console.log(`   Week 3-4: Essential Tier 2 categories (8-10 supplements)`);
      console.log(`   Week 5-6: Popular Tier 2 supplements (8-10 supplements)`);
      console.log(`   Week 7-8: Remaining Tier 2 targets`);
      console.log(`   Week 9: Quality review and optimization`);
    }
    
    console.log(`\n🔬 Research Data Sources:`);
    console.log(`   • PubMed systematic reviews and meta-analyses`);
    console.log(`   • Cochrane Database of Systematic Reviews`);
    console.log(`   • Government health agencies (NIH, FDA, Health Canada)`);
    console.log(`   • Professional medical associations`);
    console.log(`   • supp-db-project research files`);
    
    console.log(`\n💡 IMMEDIATE NEXT STEPS:`);
    console.log(`   1. Complete all remaining Tier 1 supplements (highest priority)`);
    console.log(`   2. Focus on categories with strong research backing`);
    console.log(`   3. Prioritize supplements with established health benefits`);
    console.log(`   4. Leverage authoritative medical sources`);
    
    // Category-specific recommendations
    console.log(`\n🎯 STRATEGIC CATEGORY PRIORITIES:`);
    const categoryPriorities = Object.entries(tierAnalysis.categoryBreakdown)
      .map(([category, data]) => ({
        category,
        totalSupplements: data.tier1.total + data.tier2.total,
        totalEnhanced: data.tier1.enhanced + data.tier2.enhanced,
        coverage: Math.round(((data.tier1.enhanced + data.tier2.enhanced) / (data.tier1.total + data.tier2.total)) * 100),
        tier1Missing: data.tier1.total - data.tier1.enhanced,
        tier2Missing: data.tier2.total - data.tier2.enhanced
      }))
      .filter(cat => cat.totalSupplements >= 3) // Focus on substantial categories
      .sort((a, b) => (b.tier1Missing * 2 + b.tier2Missing) - (a.tier1Missing * 2 + a.tier2Missing)); // Prioritize by missing high-tier supplements
    
    categoryPriorities.slice(0, 5).forEach(cat => {
      console.log(`   ${cat.category}: ${cat.coverage}% coverage`);
      console.log(`     Missing: ${cat.tier1Missing} Tier 1, ${cat.tier2Missing} Tier 2`);
      console.log(`     Priority: ${cat.tier1Missing > 0 ? 'Critical' : cat.tier2Missing > 3 ? 'High' : 'Medium'}`);
    });
    
    console.log(`\n🏆 SUCCESS METRICS FOR PHASE 3:`);
    console.log(`   • Achieve 95%+ Tier 1 coverage`);
    console.log(`   • Achieve 90%+ Tier 2 coverage`);
    console.log(`   • Maintain 100% system reliability`);
    console.log(`   • Focus on evidence-based health benefits`);
    console.log(`   • Leverage authoritative research sources`);
    
    console.log(`\n🎉 PHASE 3 COMPLETION BENEFITS:`);
    console.log(`   • Market-leading supplement research platform`);
    console.log(`   • Comprehensive coverage of highest-quality supplements`);
    console.log(`   • Unmatched depth and scientific rigor`);
    console.log(`   • Strong competitive advantage`);
    console.log(`   • Foundation for advanced features and partnerships`);
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Tier 1 & 2 analysis complete');
  }
})();
