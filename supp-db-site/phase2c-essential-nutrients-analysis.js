const { chromium } = require('playwright');

(async () => {
  console.log('🥇 Phase 2C: Essential Nutrients Completion Analysis');
  console.log('Analyzing current essential nutrients coverage and planning 100% completion...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get comprehensive essential nutrients analysis
    const nutrientsAnalysis = await page.evaluate(() => {
      const supplements = window.app.supplements || [];
      const enhanced = window.enhancedCitations || {};
      
      // Identify essential nutrients by category and name patterns
      const essentialNutrients = supplements.filter(supp => {
        const category = (supp.category || '').toLowerCase();
        const name = (supp.name || '').toLowerCase();
        
        return category.includes('essential nutrients') ||
               category.includes('vitamin') ||
               category.includes('mineral') ||
               name.includes('vitamin') ||
               name.includes('magnesium') ||
               name.includes('zinc') ||
               name.includes('iron') ||
               name.includes('calcium') ||
               name.includes('potassium') ||
               name.includes('selenium') ||
               name.includes('chromium') ||
               name.includes('iodine') ||
               name.includes('manganese') ||
               name.includes('copper') ||
               name.includes('molybdenum') ||
               name.includes('biotin') ||
               name.includes('folate') ||
               name.includes('folic acid') ||
               name.includes('cobalamin') ||
               name.includes('thiamine') ||
               name.includes('riboflavin') ||
               name.includes('niacin') ||
               name.includes('pantothenic') ||
               name.includes('pyridoxine') ||
               name.includes('omega-3') ||
               name.includes('fish oil') ||
               name.includes('cod liver oil');
      });
      
      const analysis = {
        totalNutrients: essentialNutrients.length,
        enhancedNutrients: 0,
        unenhancedNutrients: [],
        enhancedList: [],
        categoryBreakdown: {},
        tierBreakdown: { tier1: 0, tier2: 0, tier3: 0, unknown: 0 },
        enhancedByTier: { tier1: 0, tier2: 0, tier3: 0, unknown: 0 }
      };
      
      essentialNutrients.forEach(supp => {
        const isEnhanced = !!enhanced[supp.id];
        const tier = supp.evidenceTier || 'Unknown';
        const category = supp.category || 'Unknown';
        
        // Count by tier
        if (tier === 'Tier 1') {
          analysis.tierBreakdown.tier1++;
          if (isEnhanced) analysis.enhancedByTier.tier1++;
        } else if (tier === 'Tier 2') {
          analysis.tierBreakdown.tier2++;
          if (isEnhanced) analysis.enhancedByTier.tier2++;
        } else if (tier === 'Tier 3') {
          analysis.tierBreakdown.tier3++;
          if (isEnhanced) analysis.enhancedByTier.tier3++;
        } else {
          analysis.tierBreakdown.unknown++;
          if (isEnhanced) analysis.enhancedByTier.unknown++;
        }
        
        // Count by category
        if (!analysis.categoryBreakdown[category]) {
          analysis.categoryBreakdown[category] = { total: 0, enhanced: 0 };
        }
        analysis.categoryBreakdown[category].total++;
        
        if (isEnhanced) {
          analysis.enhancedNutrients++;
          analysis.enhancedList.push({
            id: supp.id,
            name: supp.name,
            category: category,
            tier: tier
          });
          analysis.categoryBreakdown[category].enhanced++;
        } else {
          analysis.unenhancedNutrients.push({
            id: supp.id,
            name: supp.name,
            category: category,
            tier: tier,
            priority: tier === 'Tier 1' ? 'High' : tier === 'Tier 2' ? 'Medium' : 'Low'
          });
        }
      });
      
      return analysis;
    });
    
    console.log('\n📊 ESSENTIAL NUTRIENTS COVERAGE ANALYSIS');
    console.log('='.repeat(60));
    
    console.log(`\n🥇 Overall Essential Nutrients Status:`);
    console.log(`   Total Essential Nutrients: ${nutrientsAnalysis.totalNutrients}`);
    console.log(`   Enhanced: ${nutrientsAnalysis.enhancedNutrients}`);
    console.log(`   Coverage Rate: ${Math.round((nutrientsAnalysis.enhancedNutrients / nutrientsAnalysis.totalNutrients) * 100)}%`);
    console.log(`   Remaining: ${nutrientsAnalysis.unenhancedNutrients.length}`);
    
    console.log(`\n🎯 Coverage by Evidence Tier:`);
    console.log(`   Tier 1: ${nutrientsAnalysis.enhancedByTier.tier1}/${nutrientsAnalysis.tierBreakdown.tier1} (${Math.round((nutrientsAnalysis.enhancedByTier.tier1 / (nutrientsAnalysis.tierBreakdown.tier1 || 1)) * 100)}%)`);
    console.log(`   Tier 2: ${nutrientsAnalysis.enhancedByTier.tier2}/${nutrientsAnalysis.tierBreakdown.tier2} (${Math.round((nutrientsAnalysis.enhancedByTier.tier2 / (nutrientsAnalysis.tierBreakdown.tier2 || 1)) * 100)}%)`);
    console.log(`   Tier 3: ${nutrientsAnalysis.enhancedByTier.tier3}/${nutrientsAnalysis.tierBreakdown.tier3} (${Math.round((nutrientsAnalysis.enhancedByTier.tier3 / (nutrientsAnalysis.tierBreakdown.tier3 || 1)) * 100)}%)`);
    
    console.log(`\n📋 Coverage by Category:`);
    Object.entries(nutrientsAnalysis.categoryBreakdown)
      .sort(([,a], [,b]) => b.total - a.total)
      .forEach(([category, data]) => {
        const rate = Math.round((data.enhanced / data.total) * 100);
        console.log(`   ${category}: ${data.enhanced}/${data.total} (${rate}%)`);
      });
    
    console.log(`\n✅ Currently Enhanced Essential Nutrients:`);
    nutrientsAnalysis.enhancedList
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(supp => {
        console.log(`   • ${supp.name} (${supp.tier}) - ${supp.category}`);
      });
    
    console.log(`\n🎯 REMAINING ESSENTIAL NUTRIENTS TO ENHANCE:`);
    
    // Group unenhanced by priority
    const highPriority = nutrientsAnalysis.unenhancedNutrients.filter(s => s.priority === 'High');
    const mediumPriority = nutrientsAnalysis.unenhancedNutrients.filter(s => s.priority === 'Medium');
    const lowPriority = nutrientsAnalysis.unenhancedNutrients.filter(s => s.priority === 'Low');
    
    if (highPriority.length > 0) {
      console.log(`\n🔥 HIGH PRIORITY (Tier 1): ${highPriority.length} nutrients`);
      highPriority.forEach(supp => {
        console.log(`   • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
    }
    
    if (mediumPriority.length > 0) {
      console.log(`\n📈 MEDIUM PRIORITY (Tier 2): ${mediumPriority.length} nutrients`);
      mediumPriority.forEach(supp => {
        console.log(`   • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
    }
    
    if (lowPriority.length > 0) {
      console.log(`\n📅 LOW PRIORITY (Tier 3): ${lowPriority.length} nutrients`);
      lowPriority.forEach(supp => {
        console.log(`   • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
    }
    
    // Phase 2C Implementation Plan
    console.log('\n' + '='.repeat(80));
    console.log('🚀 PHASE 2C: ESSENTIAL NUTRIENTS COMPLETION PLAN');
    console.log('='.repeat(80));
    
    console.log(`\n🎯 Completion Targets:`);
    const currentCoverage = Math.round((nutrientsAnalysis.enhancedNutrients / nutrientsAnalysis.totalNutrients) * 100);
    const targetCoverage = 100; // Target 100% coverage
    const needToCreate = nutrientsAnalysis.unenhancedNutrients.length;
    
    console.log(`   Current Coverage: ${currentCoverage}%`);
    console.log(`   Target Coverage: ${targetCoverage}%`);
    console.log(`   Need to Create: ${needToCreate} enhanced citations`);
    
    console.log(`\n📋 Implementation Strategy:`);
    if (needToCreate <= 5) {
      console.log(`   Week 1: Complete all remaining nutrients (${needToCreate} supplements)`);
      console.log(`   Week 2: Quality review and optimization`);
    } else if (needToCreate <= 10) {
      console.log(`   Week 1: High Priority + Half of Medium Priority (${Math.ceil(needToCreate/2)} supplements)`);
      console.log(`   Week 2: Remaining nutrients + Quality review (${Math.floor(needToCreate/2)} supplements)`);
    } else {
      console.log(`   Week 1: High Priority Tier 1 (${highPriority.length} supplements)`);
      console.log(`   Week 2: Medium Priority Tier 2 (${Math.min(mediumPriority.length, 8)} supplements)`);
      console.log(`   Week 3: Remaining nutrients (${Math.max(0, needToCreate - highPriority.length - 8)} supplements)`);
    }
    
    console.log(`\n🔬 Research Data Sources:`);
    console.log(`   • NIH Office of Dietary Supplements`);
    console.log(`   • Cochrane systematic reviews`);
    console.log(`   • PubMed clinical trials`);
    console.log(`   • FDA nutrition guidelines`);
    console.log(`   • supp-db-project research files`);
    
    console.log(`\n💡 IMMEDIATE NEXT STEPS:`);
    console.log(`   1. Start with highest priority essential nutrients`);
    console.log(`   2. Focus on well-established health benefits`);
    console.log(`   3. Leverage government health databases`);
    console.log(`   4. Prioritize nutrients with RDA/DRI guidelines`);
    
    // Specific recommendations
    if (highPriority.length > 0) {
      console.log(`\n🎯 RECOMMENDED STARTING POINTS:`);
      console.log(`   Start with these critical Tier 1 nutrients:`);
      highPriority.slice(0, 3).forEach(supp => {
        console.log(`   • ${supp.name} - Essential for health, strong research base`);
      });
    }
    
    if (mediumPriority.length > 0) {
      console.log(`\n📈 NEXT BATCH (Tier 2):`);
      console.log(`   Important nutrients with good research:`);
      mediumPriority.slice(0, 5).forEach(supp => {
        console.log(`   • ${supp.name} - Well-researched essential nutrient`);
      });
    }
    
    console.log(`\n🏆 SUCCESS METRICS FOR PHASE 2C:`);
    console.log(`   • Achieve 100% essential nutrients coverage`);
    console.log(`   • Complete all Tier 1 essential nutrients`);
    console.log(`   • Focus on established health benefits`);
    console.log(`   • Maintain high citation quality standards`);
    console.log(`   • Leverage authoritative nutrition sources`);
    
    console.log(`\n🎉 PHASE 2C COMPLETION BENEFITS:`);
    console.log(`   • Complete foundational supplement category`);
    console.log(`   • High user value and engagement`);
    console.log(`   • Strong scientific backing`);
    console.log(`   • Competitive advantage in essential nutrients`);
    console.log(`   • Foundation for advanced features development`);
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Essential nutrients analysis complete');
  }
})();
