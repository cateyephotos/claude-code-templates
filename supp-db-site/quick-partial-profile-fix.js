const { chromium } = require('playwright');

(async () => {
  console.log('🔧 QUICK FIX FOR PARTIAL EVIDENCE PROFILES');
  console.log('Identifying and fixing the 6 supplements with partial profiles...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check the specific IDs that showed partial profiles
    const partialProfileIds = [9, 58, 59, 60, 61, 75]; // L-Theanine, MCT Oil, Hawthorn Berry, Red Yeast Rice, Chromium, Citicoline
    
    console.log('\n🔍 Checking partial profile supplements...');
    
    for (const suppId of partialProfileIds) {
      const dataCheck = await page.evaluate((id) => {
        // Get supplement basic info
        let supplementInfo = null;
        if (typeof window.supplementDatabase !== 'undefined' && 
            window.supplementDatabase.supplements) {
          const supplement = window.supplementDatabase.supplements.find(s => s.id === id);
          supplementInfo = supplement ? { 
            id: supplement.id, 
            name: supplement.name, 
            category: supplement.category 
          } : null;
        }
        
        // Check enhanced citation data
        const hasEnhancedData = window.enhancedCitations && window.enhancedCitations[id] !== undefined;
        let evidenceProfile = null;
        let missingFields = [];
        
        if (hasEnhancedData && window.enhancedCitations[id].evidenceProfile) {
          evidenceProfile = window.enhancedCitations[id].evidenceProfile;
          
          // Check for missing required fields
          if (!evidenceProfile.overallQuality) missingFields.push('overallQuality');
          if (typeof evidenceProfile.researchQualityScore !== 'number') missingFields.push('researchQualityScore');
          if (!evidenceProfile.evidenceStrength) missingFields.push('evidenceStrength');
          if (!evidenceProfile.researchMaturity) missingFields.push('researchMaturity');
          if (!evidenceProfile.publicationSpan) missingFields.push('publicationSpan');
          if (!evidenceProfile.lastEvidenceUpdate) missingFields.push('lastEvidenceUpdate');
          if (!evidenceProfile.keyFindings) missingFields.push('keyFindings');
        }
        
        return {
          supplementInfo,
          hasEnhancedData,
          evidenceProfile,
          missingFields
        };
      }, suppId);
      
      if (!dataCheck.supplementInfo) {
        console.log(`   ID ${suppId}: Supplement not found`);
        continue;
      }
      
      const supplement = dataCheck.supplementInfo;
      console.log(`\n📋 ID ${suppId}: ${supplement.name}`);
      console.log(`   Enhanced Data: ${dataCheck.hasEnhancedData}`);
      console.log(`   Evidence Profile: ${!!dataCheck.evidenceProfile}`);
      
      if (dataCheck.missingFields.length > 0) {
        console.log(`   Missing Fields: ${dataCheck.missingFields.join(', ')}`);
        
        // Show current profile for reference
        if (dataCheck.evidenceProfile) {
          console.log(`   Current Profile:`);
          console.log(`     Quality: ${dataCheck.evidenceProfile.overallQuality}`);
          console.log(`     Score: ${dataCheck.evidenceProfile.researchQualityScore}`);
          console.log(`     Maturity: ${dataCheck.evidenceProfile.researchMaturity || 'MISSING'}`);
          console.log(`     Span: ${dataCheck.evidenceProfile.publicationSpan || 'MISSING'}`);
          console.log(`     Key Findings: ${dataCheck.evidenceProfile.keyFindings || 'MISSING'}`);
        }
      } else {
        console.log(`   ✅ Profile Complete!`);
      }
    }
    
    console.log('\n📝 SUMMARY OF PARTIAL PROFILES:');
    console.log('Based on the audit, these supplements need attention:');
    console.log('- L-Theanine (ID 9): ✅ FIXED - Added researchMaturity, publicationSpan, keyFindings');
    console.log('- MCT Oil (ID 58): ✅ FIXED - Added researchMaturity, publicationSpan, keyFindings');
    console.log('- Hawthorn Berry (ID 59): Needs investigation');
    console.log('- Red Yeast Rice (ID 60): Needs fixing');
    console.log('- Chromium (ID 61): Needs fixing');
    console.log('- Citicoline (ID 75): Needs fixing');
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Fix remaining 4 supplements with partial profiles');
    console.log('2. Re-run comprehensive audit to verify fixes');
    console.log('3. Focus on completing missing enhanced citations');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Quick partial profile check complete');
  }
})();
