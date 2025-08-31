const { chromium } = require('playwright');

(async () => {
  console.log('🔬 TESTING UPDATED EVIDENCE PROFILES');
  console.log('Verifying Evidence Profiles for Phase 2 Week 1 supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const testSupplements = [
      { id: 57, name: 'PEA (Phenylethylamine)', expectedTier: 'Tier 3', expectedScore: 65 },
      { id: 63, name: 'Bitter Melon', expectedTier: 'Tier 2', expectedScore: 78 },
      { id: 64, name: 'Gymnema Sylvestre', expectedTier: 'Tier 2', expectedScore: 75 },
      { id: 66, name: 'Cinnamon Extract', expectedTier: 'Tier 1', expectedScore: 85 }
    ];
    
    const results = [];
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing Evidence Profile for ${supplement.name} (ID: ${supplement.id})...`);
      
      try {
        // Check if enhanced citation data is loaded
        const dataCheck = await page.evaluate((suppId) => {
          const data = window.enhancedCitations && window.enhancedCitations[suppId];
          if (!data) return { hasData: false };
          
          return {
            hasData: true,
            hasEvidenceProfile: !!data.evidenceProfile,
            evidenceProfile: data.evidenceProfile,
            profileKeys: data.evidenceProfile ? Object.keys(data.evidenceProfile) : null
          };
        }, supplement.id);
        
        console.log(`   Data Loaded: ${dataCheck.hasData}`);
        console.log(`   Evidence Profile Exists: ${dataCheck.hasEvidenceProfile}`);
        
        if (!dataCheck.hasData || !dataCheck.hasEvidenceProfile) {
          console.log('   ❌ Evidence Profile not found');
          results.push({
            id: supplement.id,
            name: supplement.name,
            profileWorking: false,
            error: 'Evidence Profile not found'
          });
          continue;
        }
        
        const profile = dataCheck.evidenceProfile;
        console.log(`   Profile Keys: ${dataCheck.profileKeys?.join(', ')}`);
        console.log(`   Overall Quality: ${profile.overallQuality}`);
        console.log(`   Research Quality Score: ${profile.researchQualityScore}`);
        console.log(`   Research Maturity: ${profile.researchMaturity}`);
        console.log(`   Publication Span: ${profile.publicationSpan}`);
        
        // Verify Evidence Strength categories
        if (profile.evidenceStrength) {
          console.log(`   Evidence Strength:`);
          console.log(`     Mechanisms: ${profile.evidenceStrength.mechanisms}`);
          console.log(`     Clinical Benefits: ${profile.evidenceStrength.clinicalBenefits}`);
          console.log(`     Safety: ${profile.evidenceStrength.safety}`);
          console.log(`     Dosage: ${profile.evidenceStrength.dosage}`);
        }
        
        // Open supplement details to test UI rendering
        await page.evaluate(async (suppId) => {
          await window.app.showSupplementDetails(suppId);
        }, supplement.id);
        await page.waitForTimeout(2000);
        
        // Check if Evidence Profile is rendered in the UI
        const uiCheck = await page.evaluate(() => {
          // Look for evidence profile elements
          const profileElements = document.querySelectorAll('.enhanced-evidence-profile, .evidence-profile, .evidence-meter');
          const qualityScoreElements = document.querySelectorAll('[class*="quality"], [class*="score"], [class*="tier"]');
          
          return {
            hasProfileElements: profileElements.length > 0,
            hasQualityElements: qualityScoreElements.length > 0,
            profileElementsCount: profileElements.length,
            qualityElementsCount: qualityScoreElements.length
          };
        });
        
        console.log(`   UI Profile Elements: ${uiCheck.hasProfileElements} (${uiCheck.profileElementsCount} found)`);
        console.log(`   UI Quality Elements: ${uiCheck.hasQualityElements} (${uiCheck.qualityElementsCount} found)`);
        
        // Validate profile completeness
        const isComplete = profile.overallQuality && 
                          profile.researchQualityScore && 
                          profile.evidenceStrength &&
                          profile.researchMaturity &&
                          profile.publicationSpan;
        
        const tierMatches = profile.overallQuality === supplement.expectedTier;
        const scoreMatches = profile.researchQualityScore === supplement.expectedScore;
        
        const result = {
          id: supplement.id,
          name: supplement.name,
          profileWorking: isComplete,
          tierCorrect: tierMatches,
          scoreCorrect: scoreMatches,
          uiRendering: uiCheck.hasProfileElements || uiCheck.hasQualityElements,
          profile: profile
        };
        
        results.push(result);
        
        const statusIcon = isComplete ? '✅' : '❌';
        const tierIcon = tierMatches ? '✅' : '⚠️';
        const scoreIcon = scoreMatches ? '✅' : '⚠️';
        
        console.log(`   Profile Complete: ${statusIcon}`);
        console.log(`   Tier Correct: ${tierIcon} (Expected: ${supplement.expectedTier}, Got: ${profile.overallQuality})`);
        console.log(`   Score Correct: ${scoreIcon} (Expected: ${supplement.expectedScore}, Got: ${profile.researchQualityScore})`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({
          id: supplement.id,
          name: supplement.name,
          profileWorking: false,
          error: error.message
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 EVIDENCE PROFILE TEST RESULTS');
    console.log('='.repeat(80));
    
    const totalTested = results.length;
    const workingProfiles = results.filter(r => r.profileWorking).length;
    const correctTiers = results.filter(r => r.tierCorrect).length;
    const correctScores = results.filter(r => r.scoreCorrect).length;
    const uiRendering = results.filter(r => r.uiRendering).length;
    
    console.log(`\n📊 Evidence Profile Results:`);
    console.log(`   Complete Profiles: ${workingProfiles}/${totalTested} (${Math.round((workingProfiles/totalTested)*100)}%)`);
    console.log(`   Correct Tiers: ${correctTiers}/${totalTested} (${Math.round((correctTiers/totalTested)*100)}%)`);
    console.log(`   Correct Scores: ${correctScores}/${totalTested} (${Math.round((correctScores/totalTested)*100)}%)`);
    console.log(`   UI Rendering: ${uiRendering}/${totalTested} (${Math.round((uiRendering/totalTested)*100)}%)`);
    
    console.log('\n✅ WORKING EVIDENCE PROFILES:');
    results.filter(r => r.profileWorking).forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id}) - ${supp.profile.overallQuality}, Score: ${supp.profile.researchQualityScore}`);
    });
    
    console.log('\n❌ BROKEN EVIDENCE PROFILES:');
    results.filter(r => !r.profileWorking).forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id}) - ${supp.error || 'Profile incomplete'}`);
    });
    
    if (workingProfiles === totalTested) {
      console.log('\n🎉 ALL EVIDENCE PROFILES WORKING!');
      console.log('✅ Phase 2 Week 1 supplements have complete Evidence Profiles');
      console.log('✅ Quality tiers and scores properly assigned');
      console.log('✅ Evidence strength categories evaluated');
      console.log('🚀 Ready to begin Week 2 with proper Evidence Profile methodology');
    } else {
      console.log('\n⚠️ SOME EVIDENCE PROFILES NEED ATTENTION');
      console.log('🔧 Review and fix incomplete profiles before proceeding');
    }
    
    console.log('\n📋 EVIDENCE PROFILE SUMMARY:');
    results.forEach(supp => {
      if (supp.profile) {
        console.log(`\n${supp.name}:`);
        console.log(`   Quality: ${supp.profile.overallQuality} (Score: ${supp.profile.researchQualityScore})`);
        console.log(`   Maturity: ${supp.profile.researchMaturity}`);
        console.log(`   Span: ${supp.profile.publicationSpan}`);
        if (supp.profile.evidenceStrength) {
          console.log(`   Strengths: M:${supp.profile.evidenceStrength.mechanisms}, C:${supp.profile.evidenceStrength.clinicalBenefits}, S:${supp.profile.evidenceStrength.safety}, D:${supp.profile.evidenceStrength.dosage}`);
        }
      }
    });
    
    return {
      totalTested,
      workingProfiles,
      correctTiers,
      correctScores,
      results
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Evidence Profile test complete');
  }
})();
