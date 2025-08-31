const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Analyzing Enhanced Citation Expansion Opportunities...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get comprehensive supplement analysis
    const supplementAnalysis = await page.evaluate(() => {
      const allSupplements = window.app.supplements;
      const enhancedSupplements = allSupplements.filter(s => s.enhancedCitations?.isEnhanced);
      const nonEnhancedSupplements = allSupplements.filter(s => !s.enhancedCitations?.isEnhanced);
      
      // Categorize by evidence tier
      const tierAnalysis = {
        tier1: { enhanced: 0, nonEnhanced: 0, supplements: [] },
        tier2: { enhanced: 0, nonEnhanced: 0, supplements: [] },
        tier3: { enhanced: 0, nonEnhanced: 0, supplements: [] },
        tier4: { enhanced: 0, nonEnhanced: 0, supplements: [] }
      };
      
      // Categorize by category
      const categoryAnalysis = {};
      
      allSupplements.forEach(supplement => {
        const tier = `tier${supplement.evidenceTier || 4}`;
        const isEnhanced = supplement.enhancedCitations?.isEnhanced;
        
        if (tierAnalysis[tier]) {
          if (isEnhanced) {
            tierAnalysis[tier].enhanced++;
          } else {
            tierAnalysis[tier].nonEnhanced++;
            tierAnalysis[tier].supplements.push({
              id: supplement.id,
              name: supplement.name,
              category: supplement.category,
              evidenceTier: supplement.evidenceTier
            });
          }
        }
        
        // Category analysis
        const category = supplement.category || 'Uncategorized';
        if (!categoryAnalysis[category]) {
          categoryAnalysis[category] = { enhanced: 0, nonEnhanced: 0, supplements: [] };
        }
        
        if (isEnhanced) {
          categoryAnalysis[category].enhanced++;
        } else {
          categoryAnalysis[category].nonEnhanced++;
          categoryAnalysis[category].supplements.push({
            id: supplement.id,
            name: supplement.name,
            evidenceTier: supplement.evidenceTier
          });
        }
      });
      
      return {
        totalSupplements: allSupplements.length,
        enhancedCount: enhancedSupplements.length,
        nonEnhancedCount: nonEnhancedSupplements.length,
        enhancedPercentage: Math.round((enhancedSupplements.length / allSupplements.length) * 100),
        tierAnalysis,
        categoryAnalysis,
        topPrioritySupplements: nonEnhancedSupplements
          .filter(s => s.evidenceTier <= 2)
          .sort((a, b) => a.evidenceTier - b.evidenceTier)
          .slice(0, 20)
          .map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            evidenceTier: s.evidenceTier
          }))
      };
    });
    
    console.log('📊 ENHANCED CITATION EXPANSION ANALYSIS');
    console.log('='.repeat(60));
    
    console.log(`\n📈 CURRENT STATUS:`);
    console.log(`   Total Supplements: ${supplementAnalysis.totalSupplements}`);
    console.log(`   Enhanced Citations: ${supplementAnalysis.enhancedCount}`);
    console.log(`   Non-Enhanced: ${supplementAnalysis.nonEnhancedCount}`);
    console.log(`   Coverage: ${supplementAnalysis.enhancedPercentage}%`);
    
    console.log(`\n🎯 EVIDENCE TIER BREAKDOWN:`);
    Object.entries(supplementAnalysis.tierAnalysis).forEach(([tier, data]) => {
      const tierNum = tier.replace('tier', '');
      const total = data.enhanced + data.nonEnhanced;
      const coverage = total > 0 ? Math.round((data.enhanced / total) * 100) : 0;
      console.log(`   Tier ${tierNum}: ${data.enhanced}/${total} enhanced (${coverage}%)`);
    });
    
    console.log(`\n📂 CATEGORY BREAKDOWN:`);
    const sortedCategories = Object.entries(supplementAnalysis.categoryAnalysis)
      .sort(([,a], [,b]) => (b.enhanced + b.nonEnhanced) - (a.enhanced + a.nonEnhanced))
      .slice(0, 10);
    
    sortedCategories.forEach(([category, data]) => {
      const total = data.enhanced + data.nonEnhanced;
      const coverage = total > 0 ? Math.round((data.enhanced / total) * 100) : 0;
      console.log(`   ${category}: ${data.enhanced}/${total} enhanced (${coverage}%)`);
    });
    
    console.log(`\n🏆 TOP PRIORITY SUPPLEMENTS FOR ENHANCEMENT:`);
    console.log('   (Tier 1-2 supplements without enhanced citations)');
    supplementAnalysis.topPrioritySupplements.forEach((supplement, index) => {
      console.log(`   ${index + 1}. ${supplement.name} (Tier ${supplement.evidenceTier}, ${supplement.category})`);
    });
    
    // Analyze research complexity for top priorities
    console.log(`\n🔬 RESEARCH COMPLEXITY ANALYSIS:`);
    const researchComplexity = {
      wellStudied: [],
      moderatelyStudied: [],
      limitedStudies: []
    };
    
    // Categorize based on supplement type and research availability
    supplementAnalysis.topPrioritySupplements.forEach(supplement => {
      const name = supplement.name.toLowerCase();
      
      // Well-studied supplements (lots of research available)
      if (name.includes('vitamin') || name.includes('omega') || name.includes('magnesium') || 
          name.includes('calcium') || name.includes('protein') || name.includes('creatine') ||
          name.includes('caffeine') || name.includes('beta-alanine')) {
        researchComplexity.wellStudied.push(supplement);
      }
      // Moderately studied (some research, but may need more digging)
      else if (name.includes('extract') || name.includes('acid') || name.includes('complex')) {
        researchComplexity.moderatelyStudied.push(supplement);
      }
      // Limited studies (newer or niche supplements)
      else {
        researchComplexity.limitedStudies.push(supplement);
      }
    });
    
    console.log(`   🟢 Well-Studied (${researchComplexity.wellStudied.length}): Easy to enhance`);
    researchComplexity.wellStudied.forEach(s => console.log(`      - ${s.name}`));
    
    console.log(`   🟡 Moderately-Studied (${researchComplexity.moderatelyStudied.length}): Moderate effort`);
    researchComplexity.moderatelyStudied.forEach(s => console.log(`      - ${s.name}`));
    
    console.log(`   🔴 Limited-Studies (${researchComplexity.limitedStudies.length}): High effort`);
    researchComplexity.limitedStudies.forEach(s => console.log(`      - ${s.name}`));
    
    // Generate expansion roadmap
    console.log(`\n🗺️ RECOMMENDED EXPANSION ROADMAP:`);
    console.log(`   Phase 1 (Quick Wins): ${researchComplexity.wellStudied.length} well-studied supplements`);
    console.log(`   Phase 2 (Moderate Effort): ${researchComplexity.moderatelyStudied.length} moderately-studied supplements`);
    console.log(`   Phase 3 (Research Intensive): ${researchComplexity.limitedStudies.length} limited-study supplements`);
    
    const totalNewSupplements = researchComplexity.wellStudied.length + 
                               researchComplexity.moderatelyStudied.length + 
                               researchComplexity.limitedStudies.length;
    
    const projectedCoverage = Math.round(((supplementAnalysis.enhancedCount + totalNewSupplements) / supplementAnalysis.totalSupplements) * 100);
    
    console.log(`\n📈 PROJECTED IMPACT:`);
    console.log(`   Current Coverage: ${supplementAnalysis.enhancedPercentage}%`);
    console.log(`   After Full Expansion: ${projectedCoverage}%`);
    console.log(`   New Enhanced Supplements: +${totalNewSupplements}`);
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Expansion analysis complete');
  }
})();
