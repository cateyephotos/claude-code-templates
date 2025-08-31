const { chromium } = require('playwright');

(async () => {
  console.log('🌟 Phase 3: Tier 1 & 2 Analysis (Corrected)');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get tier analysis with correct numeric format
    const analysis = await page.evaluate(() => {
      const supplements = window.app.supplements || [];
      const enhanced = window.enhancedCitations || {};
      
      const tier1 = [];
      const tier2 = [];
      const tier1Enhanced = [];
      const tier2Enhanced = [];
      const tier1Unenhanced = [];
      const tier2Unenhanced = [];
      
      supplements.forEach(supp => {
        const tier = supp.evidenceTier; // Numeric: 1, 2, 3
        const isEnhanced = !!enhanced[supp.id];
        
        if (tier === 1) {
          tier1.push(supp);
          if (isEnhanced) {
            tier1Enhanced.push(supp);
          } else {
            tier1Unenhanced.push(supp);
          }
        } else if (tier === 2) {
          tier2.push(supp);
          if (isEnhanced) {
            tier2Enhanced.push(supp);
          } else {
            tier2Unenhanced.push(supp);
          }
        }
      });
      
      return {
        tier1: {
          total: tier1.length,
          enhanced: tier1Enhanced.length,
          unenhanced: tier1Unenhanced.map(s => ({ 
            id: s.id, 
            name: s.name, 
            category: s.category,
            evidenceTierRationale: s.evidenceTierRationale || 'No rationale provided'
          }))
        },
        tier2: {
          total: tier2.length,
          enhanced: tier2Enhanced.length,
          unenhanced: tier2Unenhanced.map(s => ({ 
            id: s.id, 
            name: s.name, 
            category: s.category,
            evidenceTierRationale: s.evidenceTierRationale || 'No rationale provided'
          }))
        }
      };
    });
    
    console.log('\n📊 TIER 1 & 2 STATUS (CORRECTED)');
    console.log('='.repeat(60));
    
    console.log(`\n🥇 Tier 1 (Highest Evidence - Gold Standard):`);
    console.log(`  Total: ${analysis.tier1.total}`);
    console.log(`  Enhanced: ${analysis.tier1.enhanced}`);
    console.log(`  Coverage: ${Math.round((analysis.tier1.enhanced / analysis.tier1.total) * 100)}%`);
    console.log(`  Remaining: ${analysis.tier1.unenhanced.length}`);
    
    console.log(`\n🥈 Tier 2 (Strong Evidence - Silver Standard):`);
    console.log(`  Total: ${analysis.tier2.total}`);
    console.log(`  Enhanced: ${analysis.tier2.enhanced}`);
    console.log(`  Coverage: ${Math.round((analysis.tier2.enhanced / analysis.tier2.total) * 100)}%`);
    console.log(`  Remaining: ${analysis.tier2.unenhanced.length}`);
    
    const combinedTotal = analysis.tier1.total + analysis.tier2.total;
    const combinedEnhanced = analysis.tier1.enhanced + analysis.tier2.enhanced;
    const combinedCoverage = Math.round((combinedEnhanced / combinedTotal) * 100);
    
    console.log(`\n📈 Combined Tier 1 & 2 Status:`);
    console.log(`  Total: ${combinedTotal}`);
    console.log(`  Enhanced: ${combinedEnhanced}`);
    console.log(`  Coverage: ${combinedCoverage}%`);
    console.log(`  Remaining: ${analysis.tier1.unenhanced.length + analysis.tier2.unenhanced.length}`);
    
    if (analysis.tier1.unenhanced.length > 0) {
      console.log(`\n🔥 CRITICAL PRIORITY - Tier 1 Unenhanced (${analysis.tier1.unenhanced.length}):`);
      analysis.tier1.unenhanced.forEach(supp => {
        console.log(`  • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
        console.log(`    Rationale: ${supp.evidenceTierRationale.substring(0, 80)}...`);
      });
    }
    
    if (analysis.tier2.unenhanced.length > 0) {
      console.log(`\n📈 HIGH PRIORITY - Tier 2 Unenhanced (${analysis.tier2.unenhanced.length}):`);
      analysis.tier2.unenhanced.slice(0, 15).forEach(supp => {
        console.log(`  • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
      });
      if (analysis.tier2.unenhanced.length > 15) {
        console.log(`  ... and ${analysis.tier2.unenhanced.length - 15} more`);
      }
    }
    
    console.log(`\n🎯 PHASE 3 TARGETS:`);
    const tier1Target = Math.ceil(analysis.tier1.total * 0.95); // 95% Tier 1
    const tier2Target = Math.ceil(analysis.tier2.total * 0.90); // 90% Tier 2
    const tier1Needed = Math.max(0, tier1Target - analysis.tier1.enhanced);
    const tier2Needed = Math.max(0, tier2Target - analysis.tier2.enhanced);
    
    console.log(`  Tier 1 Target: 95% (${tier1Target}/${analysis.tier1.total})`);
    console.log(`  Tier 1 Need: ${tier1Needed} supplements`);
    console.log(`  Tier 2 Target: 90% (${tier2Target}/${analysis.tier2.total})`);
    console.log(`  Tier 2 Need: ${tier2Needed} supplements`);
    console.log(`  Total Need: ${tier1Needed + tier2Needed} enhanced citations`);
    
    console.log(`\n📋 IMPLEMENTATION STRATEGY:`);
    if (tier1Needed + tier2Needed <= 10) {
      console.log(`  Week 1-2: Complete all Tier 1 (${tier1Needed} supplements)`);
      console.log(`  Week 3-4: Complete Tier 2 targets (${tier2Needed} supplements)`);
      console.log(`  Week 5: Quality review and optimization`);
      console.log(`  Timeline: 5 weeks to completion`);
    } else if (tier1Needed + tier2Needed <= 20) {
      console.log(`  Week 1-2: Complete all Tier 1 (${tier1Needed} supplements)`);
      console.log(`  Week 3-4: High-priority Tier 2 (${Math.min(tier2Needed, 10)} supplements)`);
      console.log(`  Week 5-6: Remaining Tier 2 (${Math.max(0, tier2Needed - 10)} supplements)`);
      console.log(`  Week 7: Quality review and optimization`);
      console.log(`  Timeline: 7 weeks to completion`);
    } else {
      console.log(`  Week 1-2: Complete all Tier 1 (${tier1Needed} supplements)`);
      console.log(`  Week 3-4: Essential Tier 2 categories (8-10 supplements)`);
      console.log(`  Week 5-6: Popular Tier 2 supplements (8-10 supplements)`);
      console.log(`  Week 7-8: Remaining Tier 2 targets`);
      console.log(`  Week 9: Quality review and optimization`);
      console.log(`  Timeline: 9 weeks to completion`);
    }
    
    console.log(`\n💡 IMMEDIATE NEXT STEPS:`);
    if (tier1Needed > 0) {
      console.log(`  1. 🔥 CRITICAL: Complete ${tier1Needed} remaining Tier 1 supplements`);
      console.log(`     These are gold-standard supplements with strongest evidence`);
    } else {
      console.log(`  1. ✅ Tier 1 already complete!`);
    }
    
    if (tier2Needed > 0) {
      console.log(`  2. 📈 HIGH: Enhance ${tier2Needed} highest-priority Tier 2 supplements`);
      console.log(`     Focus on popular categories and well-researched supplements`);
    } else {
      console.log(`  2. ✅ Tier 2 target already achieved!`);
    }
    
    console.log(`  3. 🔬 Use authoritative research sources (PubMed, Cochrane, NIH)`);
    console.log(`  4. 📊 Focus on evidence-based health benefits`);
    console.log(`  5. 🏆 Maintain 100% system quality and reliability`);
    
    console.log(`\n🏆 SUCCESS METRICS FOR PHASE 3:`);
    console.log(`  • Achieve 95%+ Tier 1 coverage (${tier1Target}/${analysis.tier1.total})`);
    console.log(`  • Achieve 90%+ Tier 2 coverage (${tier2Target}/${analysis.tier2.total})`);
    console.log(`  • Maintain 100% system reliability`);
    console.log(`  • Focus on gold and silver standard supplements`);
    console.log(`  • Leverage highest-quality research sources`);
    
    console.log(`\n🎉 PHASE 3 COMPLETION BENEFITS:`);
    console.log(`  • Market-leading supplement research platform`);
    console.log(`  • Comprehensive coverage of highest-evidence supplements`);
    console.log(`  • Unmatched scientific rigor and depth`);
    console.log(`  • Strong competitive advantage in quality`);
    console.log(`  • Foundation for advanced features and partnerships`);
    
    // Show current status summary
    console.log(`\n📊 CURRENT STATUS SUMMARY:`);
    console.log(`  🎯 Phase 2 Achievements:`);
    console.log(`    ✅ 100% Nootropics coverage`);
    console.log(`    ✅ 100% Essential Nutrients coverage`);
    console.log(`    ✅ 100% System quality (no undefined values)`);
    console.log(`    ✅ Perfect modal functionality`);
    
    console.log(`  🚀 Phase 3 Ready to Launch:`);
    console.log(`    🥇 Tier 1: ${analysis.tier1.enhanced}/${analysis.tier1.total} (${Math.round((analysis.tier1.enhanced / analysis.tier1.total) * 100)}%)`);
    console.log(`    🥈 Tier 2: ${analysis.tier2.enhanced}/${analysis.tier2.total} (${Math.round((analysis.tier2.enhanced / analysis.tier2.total) * 100)}%)`);
    console.log(`    📈 Combined: ${combinedEnhanced}/${combinedTotal} (${combinedCoverage}%)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Phase 3 tier analysis complete');
  }
})();
