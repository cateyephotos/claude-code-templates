const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Checking Tier Data in Database');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check what tier data exists
    const tierCheck = await page.evaluate(() => {
      const supplements = window.app.supplements || [];
      
      const tierInfo = {
        totalSupplements: supplements.length,
        withTierInfo: 0,
        tierDistribution: {},
        sampleSupplements: []
      };
      
      supplements.forEach((supp, index) => {
        // Check what properties exist
        const hasEvidenceTier = 'evidenceTier' in supp;
        const hasTier = 'tier' in supp;
        const hasLevel = 'level' in supp;
        const hasQuality = 'quality' in supp;
        
        if (hasEvidenceTier || hasTier || hasLevel || hasQuality) {
          tierInfo.withTierInfo++;
        }
        
        // Count tier distribution
        const tierValue = supp.evidenceTier || supp.tier || supp.level || supp.quality || 'Unknown';
        if (!tierInfo.tierDistribution[tierValue]) {
          tierInfo.tierDistribution[tierValue] = 0;
        }
        tierInfo.tierDistribution[tierValue]++;
        
        // Sample first 10 supplements for inspection
        if (index < 10) {
          tierInfo.sampleSupplements.push({
            id: supp.id,
            name: supp.name,
            category: supp.category,
            evidenceTier: supp.evidenceTier,
            tier: supp.tier,
            level: supp.level,
            quality: supp.quality,
            allKeys: Object.keys(supp)
          });
        }
      });
      
      return tierInfo;
    });
    
    console.log('\n📊 TIER DATA ANALYSIS');
    console.log('='.repeat(50));
    
    console.log(`\nDatabase Overview:`);
    console.log(`  Total Supplements: ${tierCheck.totalSupplements}`);
    console.log(`  With Tier Info: ${tierCheck.withTierInfo}`);
    console.log(`  Tier Coverage: ${Math.round((tierCheck.withTierInfo / tierCheck.totalSupplements) * 100)}%`);
    
    console.log(`\nTier Distribution:`);
    Object.entries(tierCheck.tierDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([tier, count]) => {
        console.log(`  ${tier}: ${count} supplements`);
      });
    
    console.log(`\nSample Supplements (first 10):`);
    tierCheck.sampleSupplements.forEach(supp => {
      console.log(`\n  ${supp.name} (ID: ${supp.id}):`);
      console.log(`    Category: ${supp.category}`);
      console.log(`    Evidence Tier: ${supp.evidenceTier || 'Not set'}`);
      console.log(`    Tier: ${supp.tier || 'Not set'}`);
      console.log(`    Level: ${supp.level || 'Not set'}`);
      console.log(`    Quality: ${supp.quality || 'Not set'}`);
      console.log(`    All Keys: ${supp.allKeys.join(', ')}`);
    });
    
    // Check if we need to implement tier classification
    console.log(`\n💡 ANALYSIS RESULTS:`);
    
    if (tierCheck.withTierInfo === 0) {
      console.log(`  ❌ No tier information found in database`);
      console.log(`  📋 Need to implement tier classification system`);
      console.log(`  🎯 Alternative approach: Focus on category-based enhancement`);
    } else {
      console.log(`  ✅ Some tier information exists`);
      console.log(`  📊 ${tierCheck.withTierInfo} supplements have tier data`);
    }
    
    console.log(`\n🚀 PHASE 3 STRATEGY OPTIONS:`);
    console.log(`\nOption A: Category-Based Enhancement`);
    console.log(`  • Focus on high-value categories`);
    console.log(`  • Essential Nutrients, Nootropics (already complete)`);
    console.log(`  • Amino Acids, Vitamins, Minerals`);
    
    console.log(`\nOption B: Implement Tier Classification`);
    console.log(`  • Create evidence-based tier system`);
    console.log(`  • Classify supplements by research quality`);
    console.log(`  • Then proceed with tier-based enhancement`);
    
    console.log(`\nOption C: Popular Supplements Focus`);
    console.log(`  • Target most commonly used supplements`);
    console.log(`  • Focus on user demand and interest`);
    console.log(`  • Build comprehensive coverage of popular items`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Tier data check complete');
  }
})();
