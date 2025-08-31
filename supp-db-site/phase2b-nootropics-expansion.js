const { chromium } = require('playwright');

(async () => {
  console.log('🧠 Phase 2B: Nootropics Expansion Analysis');
  console.log('Analyzing current nootropics coverage and planning systematic enhancement...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get comprehensive nootropics analysis
    const nootropicsAnalysis = await page.evaluate(() => {
      const supplements = window.app.supplements || [];
      const enhanced = window.enhancedCitations || {};
      
      // Identify nootropics by category and name patterns
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
      
      const analysis = {
        totalNootropics: nootropics.length,
        enhancedNootropics: 0,
        unenhancedNootropics: [],
        enhancedList: [],
        categoryBreakdown: {},
        tierBreakdown: { tier1: 0, tier2: 0, tier3: 0, unknown: 0 },
        enhancedByTier: { tier1: 0, tier2: 0, tier3: 0, unknown: 0 }
      };
      
      nootropics.forEach(supp => {
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
          analysis.enhancedNootropics++;
          analysis.enhancedList.push({
            id: supp.id,
            name: supp.name,
            category: category,
            tier: tier
          });
          analysis.categoryBreakdown[category].enhanced++;
        } else {
          analysis.unenhancedNootropics.push({
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
    
    console.log('\n📊 NOOTROPICS COVERAGE ANALYSIS');
    console.log('='.repeat(60));
    
    console.log(`\n🧠 Overall Nootropics Status:`);
    console.log(`   Total Nootropics: ${nootropicsAnalysis.totalNootropics}`);
    console.log(`   Enhanced: ${nootropicsAnalysis.enhancedNootropics}`);
    console.log(`   Coverage Rate: ${Math.round((nootropicsAnalysis.enhancedNootropics / nootropicsAnalysis.totalNootropics) * 100)}%`);
    console.log(`   Remaining: ${nootropicsAnalysis.unenhancedNootropics.length}`);
    
    console.log(`\n🎯 Coverage by Evidence Tier:`);
    console.log(`   Tier 1: ${nootropicsAnalysis.enhancedByTier.tier1}/${nootropicsAnalysis.tierBreakdown.tier1} (${Math.round((nootropicsAnalysis.enhancedByTier.tier1 / (nootropicsAnalysis.tierBreakdown.tier1 || 1)) * 100)}%)`);
    console.log(`   Tier 2: ${nootropicsAnalysis.enhancedByTier.tier2}/${nootropicsAnalysis.tierBreakdown.tier2} (${Math.round((nootropicsAnalysis.enhancedByTier.tier2 / (nootropicsAnalysis.tierBreakdown.tier2 || 1)) * 100)}%)`);
    console.log(`   Tier 3: ${nootropicsAnalysis.enhancedByTier.tier3}/${nootropicsAnalysis.tierBreakdown.tier3} (${Math.round((nootropicsAnalysis.enhancedByTier.tier3 / (nootropicsAnalysis.tierBreakdown.tier3 || 1)) * 100)}%)`);
    
    console.log(`\n📋 Coverage by Category:`);
    Object.entries(nootropicsAnalysis.categoryBreakdown)
      .sort(([,a], [,b]) => b.total - a.total)
      .forEach(([category, data]) => {
        const rate = Math.round((data.enhanced / data.total) * 100);
        console.log(`   ${category}: ${data.enhanced}/${data.total} (${rate}%)`);
      });
    
    console.log(`\n✅ Currently Enhanced Nootropics:`);
    nootropicsAnalysis.enhancedList
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(supp => {
        console.log(`   • ${supp.name} (${supp.tier}) - ${supp.category}`);
      });
    
    console.log(`\n🎯 Priority Targets for Enhancement:`);
    
    // Group unenhanced by priority
    const highPriority = nootropicsAnalysis.unenhancedNootropics.filter(s => s.priority === 'High');
    const mediumPriority = nootropicsAnalysis.unenhancedNootropics.filter(s => s.priority === 'Medium');
    const lowPriority = nootropicsAnalysis.unenhancedNootropics.filter(s => s.priority === 'Low');
    
    if (highPriority.length > 0) {
      console.log(`\n🔥 HIGH PRIORITY (Tier 1): ${highPriority.length} supplements`);
      highPriority.forEach(supp => {
        console.log(`   • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
    }
    
    if (mediumPriority.length > 0) {
      console.log(`\n📈 MEDIUM PRIORITY (Tier 2): ${mediumPriority.length} supplements`);
      mediumPriority.slice(0, 10).forEach(supp => {
        console.log(`   • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
      if (mediumPriority.length > 10) {
        console.log(`   ... and ${mediumPriority.length - 10} more`);
      }
    }
    
    if (lowPriority.length > 0) {
      console.log(`\n📅 LOW PRIORITY (Tier 3): ${lowPriority.length} supplements`);
      lowPriority.slice(0, 5).forEach(supp => {
        console.log(`   • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
      if (lowPriority.length > 5) {
        console.log(`   ... and ${lowPriority.length - 5} more`);
      }
    }
    
    // Phase 2B Implementation Plan
    console.log('\n' + '='.repeat(80));
    console.log('🚀 PHASE 2B: NOOTROPICS EXPANSION PLAN');
    console.log('='.repeat(80));
    
    console.log(`\n🎯 Expansion Targets:`);
    const currentCoverage = Math.round((nootropicsAnalysis.enhancedNootropics / nootropicsAnalysis.totalNootropics) * 100);
    const targetCoverage = 85; // Target 85% coverage
    const targetEnhanced = Math.ceil(nootropicsAnalysis.totalNootropics * 0.85);
    const needToCreate = targetEnhanced - nootropicsAnalysis.enhancedNootropics;
    
    console.log(`   Current Coverage: ${currentCoverage}%`);
    console.log(`   Target Coverage: ${targetCoverage}%`);
    console.log(`   Need to Create: ${needToCreate} enhanced citations`);
    
    console.log(`\n📋 Implementation Strategy:`);
    console.log(`   Week 1: High Priority Tier 1 (${highPriority.length} supplements)`);
    console.log(`   Week 2: Top Tier 2 Nootropics (${Math.min(mediumPriority.length, 8)} supplements)`);
    console.log(`   Week 3: Remaining Tier 2 + Popular Tier 3 (${Math.min(needToCreate - highPriority.length - 8, 8)} supplements)`);
    console.log(`   Week 4: Quality review and optimization`);
    
    console.log(`\n🔬 Research Data Sources:`);
    console.log(`   • supp-db-project research files`);
    console.log(`   • PubMed systematic reviews`);
    console.log(`   • Cognitive enhancement meta-analyses`);
    console.log(`   • Nootropics research databases`);
    
    console.log(`\n💡 IMMEDIATE NEXT STEPS:`);
    console.log(`   1. Create enhanced citations for Tier 1 nootropics`);
    console.log(`   2. Leverage existing research data from supp-db-project`);
    console.log(`   3. Focus on cognitive enhancement mechanisms`);
    console.log(`   4. Prioritize supplements with strong research backing`);
    
    // Specific recommendations
    if (highPriority.length > 0) {
      console.log(`\n🎯 RECOMMENDED STARTING POINTS:`);
      console.log(`   Start with these high-impact Tier 1 nootropics:`);
      highPriority.slice(0, 3).forEach(supp => {
        console.log(`   • ${supp.name} - Strong research base expected`);
      });
    }
    
    if (mediumPriority.length > 0) {
      console.log(`\n📈 NEXT BATCH (Tier 2):`);
      console.log(`   Popular nootropics with good research:`);
      mediumPriority
        .filter(s => s.name.toLowerCase().includes('bacopa') || 
                    s.name.toLowerCase().includes('lions') ||
                    s.name.toLowerCase().includes('rhodiola') ||
                    s.name.toLowerCase().includes('ginkgo') ||
                    s.name.toLowerCase().includes('phosphatidylserine'))
        .slice(0, 5)
        .forEach(supp => {
          console.log(`   • ${supp.name} - Well-researched cognitive enhancer`);
        });
    }
    
    console.log(`\n🏆 SUCCESS METRICS FOR PHASE 2B:`);
    console.log(`   • Achieve 85%+ nootropics coverage`);
    console.log(`   • Complete all Tier 1 nootropics`);
    console.log(`   • Focus on cognitive enhancement mechanisms`);
    console.log(`   • Maintain high citation quality standards`);
    console.log(`   • Leverage existing research data effectively`);
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Nootropics expansion analysis complete');
  }
})();
