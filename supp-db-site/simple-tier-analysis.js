const { chromium } = require('playwright');

(async () => {
  console.log('🌟 Phase 3: Tier 1 & 2 Analysis');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get tier analysis
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
        const tier = supp.evidenceTier || 'Unknown';
        const isEnhanced = !!enhanced[supp.id];
        
        if (tier === 'Tier 1') {
          tier1.push(supp);
          if (isEnhanced) {
            tier1Enhanced.push(supp);
          } else {
            tier1Unenhanced.push(supp);
          }
        } else if (tier === 'Tier 2') {
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
          unenhanced: tier1Unenhanced.map(s => ({ id: s.id, name: s.name, category: s.category }))
        },
        tier2: {
          total: tier2.length,
          enhanced: tier2Enhanced.length,
          unenhanced: tier2Unenhanced.map(s => ({ id: s.id, name: s.name, category: s.category }))
        }
      };
    });
    
    console.log('\n📊 TIER 1 & 2 STATUS');
    console.log('='.repeat(50));
    
    console.log(`\n🥇 Tier 1 (Highest Evidence):`);
    console.log(`  Total: ${analysis.tier1.total}`);
    console.log(`  Enhanced: ${analysis.tier1.enhanced}`);
    console.log(`  Coverage: ${Math.round((analysis.tier1.enhanced / analysis.tier1.total) * 100)}%`);
    console.log(`  Remaining: ${analysis.tier1.unenhanced.length}`);
    
    console.log(`\n🥈 Tier 2 (Strong Evidence):`);
    console.log(`  Total: ${analysis.tier2.total}`);
    console.log(`  Enhanced: ${analysis.tier2.enhanced}`);
    console.log(`  Coverage: ${Math.round((analysis.tier2.enhanced / analysis.tier2.total) * 100)}%`);
    console.log(`  Remaining: ${analysis.tier2.unenhanced.length}`);
    
    const combinedTotal = analysis.tier1.total + analysis.tier2.total;
    const combinedEnhanced = analysis.tier1.enhanced + analysis.tier2.enhanced;
    const combinedCoverage = Math.round((combinedEnhanced / combinedTotal) * 100);
    
    console.log(`\n📈 Combined Tier 1 & 2:`);
    console.log(`  Total: ${combinedTotal}`);
    console.log(`  Enhanced: ${combinedEnhanced}`);
    console.log(`  Coverage: ${combinedCoverage}%`);
    console.log(`  Remaining: ${analysis.tier1.unenhanced.length + analysis.tier2.unenhanced.length}`);
    
    if (analysis.tier1.unenhanced.length > 0) {
      console.log(`\n🔥 CRITICAL PRIORITY - Tier 1 Unenhanced (${analysis.tier1.unenhanced.length}):`);
      analysis.tier1.unenhanced.forEach(supp => {
        console.log(`  • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
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
    const tier1Target = Math.ceil(analysis.tier1.total * 0.95);
    const tier2Target = Math.ceil(analysis.tier2.total * 0.90);
    const tier1Needed = Math.max(0, tier1Target - analysis.tier1.enhanced);
    const tier2Needed = Math.max(0, tier2Target - analysis.tier2.enhanced);
    
    console.log(`  Tier 1 Target: 95% (need ${tier1Needed} more)`);
    console.log(`  Tier 2 Target: 90% (need ${tier2Needed} more)`);
    console.log(`  Total Need: ${tier1Needed + tier2Needed} enhanced citations`);
    
    console.log(`\n💡 NEXT STEPS:`);
    if (tier1Needed > 0) {
      console.log(`  1. Complete remaining ${tier1Needed} Tier 1 supplements (critical)`);
    }
    if (tier2Needed > 0) {
      console.log(`  2. Enhance ${tier2Needed} highest-priority Tier 2 supplements`);
    }
    console.log(`  3. Focus on evidence-based health benefits`);
    console.log(`  4. Use authoritative research sources`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Analysis complete');
  }
})();
