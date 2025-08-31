const { chromium } = require('playwright');

(async () => {
  console.log('✅ VERIFYING PARTIAL EVIDENCE PROFILE FIXES');
  console.log('Checking if all 6 partial profiles have been completed...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check the 6 supplements that had partial profiles
    const partialProfileIds = [
      { id: 9, name: 'L-Theanine' },
      { id: 58, name: 'MCT Oil' },
      { id: 59, name: 'Hawthorn Berry' },
      { id: 60, name: 'Red Yeast Rice' },
      { id: 61, name: 'Chromium' },
      { id: 75, name: 'Citicoline' }
    ];
    
    console.log('\n🔍 Verifying Evidence Profile completeness...');
    
    let allFixed = true;
    const results = [];
    
    for (const supplement of partialProfileIds) {
      const dataCheck = await page.evaluate((id) => {
        const hasEnhancedData = window.enhancedCitations && window.enhancedCitations[id] !== undefined;
        let evidenceProfile = null;
        let missingFields = [];
        let completenessScore = 0;
        
        if (hasEnhancedData && window.enhancedCitations[id].evidenceProfile) {
          evidenceProfile = window.enhancedCitations[id].evidenceProfile;
          
          // Check for all required fields
          const requiredFields = [
            'overallQuality',
            'researchQualityScore', 
            'evidenceStrength',
            'researchMaturity',
            'publicationSpan',
            'lastEvidenceUpdate',
            'keyFindings'
          ];
          
          const presentFields = requiredFields.filter(field => {
            if (field === 'researchQualityScore') {
              return typeof evidenceProfile[field] === 'number';
            }
            return !!evidenceProfile[field];
          });
          
          missingFields = requiredFields.filter(field => {
            if (field === 'researchQualityScore') {
              return typeof evidenceProfile[field] !== 'number';
            }
            return !evidenceProfile[field];
          });
          
          completenessScore = Math.round((presentFields.length / requiredFields.length) * 100);
        }
        
        return {
          hasEnhancedData,
          evidenceProfile,
          missingFields,
          completenessScore
        };
      }, supplement.id);
      
      const isComplete = dataCheck.completenessScore === 100;
      const statusIcon = isComplete ? '✅' : '❌';
      
      console.log(`\n📋 ${supplement.name} (ID: ${supplement.id}): ${statusIcon}`);
      console.log(`   Enhanced Data: ${dataCheck.hasEnhancedData}`);
      console.log(`   Completeness: ${dataCheck.completenessScore}%`);
      
      if (dataCheck.missingFields.length > 0) {
        console.log(`   Missing Fields: ${dataCheck.missingFields.join(', ')}`);
        allFixed = false;
      } else {
        console.log(`   All Required Fields Present ✅`);
        if (dataCheck.evidenceProfile) {
          console.log(`   Quality: ${dataCheck.evidenceProfile.overallQuality}`);
          console.log(`   Score: ${dataCheck.evidenceProfile.researchQualityScore}`);
          console.log(`   Maturity: ${dataCheck.evidenceProfile.researchMaturity}`);
          console.log(`   Span: ${dataCheck.evidenceProfile.publicationSpan}`);
        }
      }
      
      results.push({
        id: supplement.id,
        name: supplement.name,
        isComplete,
        completenessScore: dataCheck.completenessScore,
        missingFields: dataCheck.missingFields
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 PARTIAL PROFILE FIX VERIFICATION RESULTS');
    console.log('='.repeat(80));
    
    const fixedCount = results.filter(r => r.isComplete).length;
    const totalCount = results.length;
    
    console.log(`\n📊 Fix Results:`);
    console.log(`   Fixed Profiles: ${fixedCount}/${totalCount} (${Math.round((fixedCount/totalCount)*100)}%)`);
    console.log(`   Remaining Issues: ${totalCount - fixedCount}`);
    
    if (allFixed) {
      console.log('\n🎉 ALL PARTIAL PROFILES SUCCESSFULLY FIXED!');
      console.log('✅ All 6 supplements now have complete Evidence Profiles');
      console.log('✅ All required fields present and validated');
      console.log('✅ Ready to re-run comprehensive audit');
      
      console.log('\n📈 EXPECTED IMPROVEMENT:');
      console.log('   Before Fixes: 40/89 complete profiles (45%)');
      console.log('   After Fixes: 46/89 complete profiles (52%)');
      console.log('   Improvement: +6 complete profiles (+7% success rate)');
      
    } else {
      console.log('\n⚠️ SOME PROFILES STILL NEED ATTENTION:');
      const stillBroken = results.filter(r => !r.isComplete);
      stillBroken.forEach(supp => {
        console.log(`   ${supp.name}: ${supp.completenessScore}% - Missing: ${supp.missingFields.join(', ')}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (allFixed) {
      console.log('1. ✅ Run comprehensive Evidence Profile audit to verify improvement');
      console.log('2. 🔧 Focus on supplements missing enhanced citations entirely');
      console.log('3. 📋 Continue with Phase 2 Week 3 supplements');
      console.log('4. 🎯 Target 95% Evidence Profile completion by end of Phase 2');
    } else {
      console.log('1. 🔧 Fix remaining partial profiles');
      console.log('2. ✅ Re-run this verification test');
      console.log('3. 📋 Proceed with comprehensive audit once all fixed');
    }
    
    return {
      allFixed,
      fixedCount,
      totalCount,
      results
    };
    
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Partial profile fix verification complete');
  }
})();
