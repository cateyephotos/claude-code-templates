const { chromium } = require('playwright');

(async () => {
  console.log('🚀 BATCH EVIDENCE PROFILE EXECUTOR');
  console.log('Systematically adding Evidence Profiles to supplements with enhanced citations...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Priority 1 supplements that need Evidence Profiles added
    const supplementsNeedingProfiles = [
      // Batch A: Vitamins & Minerals
      { id: 22, name: 'Vitamin B6', category: 'Essential Nutrients', file: '22_enhanced.js' },
      { id: 23, name: 'Folate', category: 'Essential Nutrients', file: '23_enhanced.js' },
      { id: 30, name: 'Vitamin E', category: 'Essential Nutrients', file: '30_enhanced.js' },
      { id: 36, name: 'Vitamin C', category: 'Essential Nutrients', file: '36_enhanced.js' },
      { id: 42, name: 'Selenium', category: 'Essential Nutrients', file: '42_enhanced.js' },
      { id: 62, name: 'Vanadium', category: 'Essential Nutrients', file: '62_enhanced.js' },
      
      // Batch B: Amino Acids
      { id: 13, name: 'Acetyl-L-Carnitine', category: 'Amino Acid', file: '13_enhanced.js' },
      { id: 33, name: 'L-Tyrosine', category: 'Amino Acid', file: '33_enhanced.js' },
      { id: 43, name: 'Choline', category: 'Essential Nutrients', file: '43_enhanced.js' },
      
      // Batch C: Herbal Supplements (High Priority)
      { id: 8, name: 'Melatonin', category: 'Sleep Aid', file: '8_enhanced.js' },
      { id: 15, name: 'Panax Ginseng', category: 'Adaptogen', file: '15_enhanced.js' },
      { id: 35, name: 'Tribulus Terrestris', category: 'Herbal Supplement', file: '35_enhanced.js' },
      { id: 47, name: 'Ginger', category: 'Herbal Supplement', file: '47_enhanced.js' },
      { id: 48, name: 'Garlic', category: 'Herbal Supplement', file: '48_enhanced.js' },
      { id: 49, name: 'Echinacea', category: 'Herbal Supplement', file: '49_enhanced.js' },
      { id: 51, name: 'Reishi Mushroom', category: 'Herbal Supplement', file: '51_enhanced.js' },
      { id: 52, name: 'Cordyceps', category: 'Herbal Supplement', file: '52_enhanced.js' },
      { id: 65, name: 'Fenugreek', category: 'Herbal Supplement', file: '65_enhanced.js' },
      { id: 69, name: 'Mucuna Pruriens', category: 'Herbal Supplement', file: '69_enhanced.js' },
      { id: 73, name: 'Stinging Nettle', category: 'Herbal Supplement', file: '73_enhanced.js' },
      
      // Batch D: Antioxidants
      { id: 25, name: 'NAD+ Precursors', category: 'Anti-aging', file: '25_enhanced.js' },
      { id: 26, name: 'PQQ', category: 'Antioxidant', file: '26_enhanced.js' },
      { id: 44, name: 'Alpha-Lipoic Acid', category: 'Antioxidant', file: '44_enhanced.js' },
      { id: 46, name: 'Astaxanthin', category: 'Antioxidant', file: '46_enhanced.js' },
      { id: 53, name: 'Spirulina', category: 'Antioxidant', file: '53_enhanced.js' },
      { id: 54, name: 'Chlorella', category: 'Antioxidant', file: '54_enhanced.js' },
      
      // Batch E: Specialized
      { id: 28, name: 'Glucosamine', category: 'Joint Support', file: '28_enhanced.js' },
      { id: 31, name: 'Whey Protein', category: 'Protein', file: '31_enhanced.js' },
      { id: 32, name: 'Chondroitin Sulfate', category: 'Joint Support', file: '32_enhanced.js' },
      { id: 50, name: 'Caffeine', category: 'Performance Enhancer', file: '50_enhanced.js' },
      { id: 55, name: 'Huperzine A', category: 'Nootropic', file: '55_enhanced.js' },
      { id: 56, name: 'Vinpocetine', category: 'Nootropic', file: '56_enhanced.js' },
      { id: 87, name: 'Krill Oil', category: 'Essential Fatty Acid', file: '87_enhanced.js' }
    ];
    
    console.log(`\n🔍 Checking ${supplementsNeedingProfiles.length} supplements for Evidence Profile status...`);
    
    const results = [];
    let needsProfileCount = 0;
    let alreadyCompleteCount = 0;
    let missingEnhancedDataCount = 0;
    
    for (const supplement of supplementsNeedingProfiles) {
      const dataCheck = await page.evaluate((id) => {
        const hasEnhancedData = window.enhancedCitations && window.enhancedCitations[id] !== undefined;
        let hasEvidenceProfile = false;
        let profileCompleteness = 0;
        
        if (hasEnhancedData && window.enhancedCitations[id].evidenceProfile) {
          const profile = window.enhancedCitations[id].evidenceProfile;
          hasEvidenceProfile = true;
          
          // Check completeness
          const requiredFields = [
            'overallQuality', 'researchQualityScore', 'evidenceStrength',
            'researchMaturity', 'publicationSpan', 'lastEvidenceUpdate', 'keyFindings'
          ];
          
          const presentFields = requiredFields.filter(field => {
            if (field === 'researchQualityScore') {
              return typeof profile[field] === 'number';
            }
            return !!profile[field];
          });
          
          profileCompleteness = Math.round((presentFields.length / requiredFields.length) * 100);
        }
        
        return {
          hasEnhancedData,
          hasEvidenceProfile,
          profileCompleteness
        };
      }, supplement.id);
      
      let status = 'unknown';
      if (!dataCheck.hasEnhancedData) {
        status = 'missing-enhanced-data';
        missingEnhancedDataCount++;
      } else if (!dataCheck.hasEvidenceProfile || dataCheck.profileCompleteness < 100) {
        status = 'needs-profile';
        needsProfileCount++;
      } else {
        status = 'complete';
        alreadyCompleteCount++;
      }
      
      const statusIcon = status === 'complete' ? '✅' : 
                        status === 'needs-profile' ? '🔧' : '❌';
      
      console.log(`   ID ${supplement.id}: ${supplement.name} ${statusIcon} (${status})`);
      
      results.push({
        ...supplement,
        status,
        hasEnhancedData: dataCheck.hasEnhancedData,
        hasEvidenceProfile: dataCheck.hasEvidenceProfile,
        profileCompleteness: dataCheck.profileCompleteness
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 EVIDENCE PROFILE STATUS SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📋 Status Breakdown:`);
    console.log(`   Complete Profiles: ${alreadyCompleteCount}/${supplementsNeedingProfiles.length} (${Math.round((alreadyCompleteCount/supplementsNeedingProfiles.length)*100)}%)`);
    console.log(`   Need Profiles: ${needsProfileCount}/${supplementsNeedingProfiles.length} (${Math.round((needsProfileCount/supplementsNeedingProfiles.length)*100)}%)`);
    console.log(`   Missing Enhanced Data: ${missingEnhancedDataCount}/${supplementsNeedingProfiles.length} (${Math.round((missingEnhancedDataCount/supplementsNeedingProfiles.length)*100)}%)`);
    
    // Show supplements that need Evidence Profiles
    const needsProfiles = results.filter(r => r.status === 'needs-profile');
    if (needsProfiles.length > 0) {
      console.log('\n🔧 SUPPLEMENTS NEEDING EVIDENCE PROFILES:');
      needsProfiles.forEach(supp => {
        console.log(`   ID ${supp.id}: ${supp.name} (${supp.category}) - File: ${supp.file}`);
      });
    }
    
    // Show supplements missing enhanced data entirely
    const missingEnhanced = results.filter(r => r.status === 'missing-enhanced-data');
    if (missingEnhanced.length > 0) {
      console.log('\n❌ SUPPLEMENTS MISSING ENHANCED DATA:');
      missingEnhanced.forEach(supp => {
        console.log(`   ID ${supp.id}: ${supp.name} (${supp.category}) - Needs complete enhanced citations`);
      });
    }
    
    // Show already complete supplements
    const alreadyComplete = results.filter(r => r.status === 'complete');
    if (alreadyComplete.length > 0) {
      console.log('\n✅ SUPPLEMENTS WITH COMPLETE EVIDENCE PROFILES:');
      alreadyComplete.forEach(supp => {
        console.log(`   ID ${supp.id}: ${supp.name} (${supp.category})`);
      });
    }
    
    console.log('\n🎯 EXECUTION PLAN:');
    console.log(`1. Add Evidence Profiles to ${needsProfileCount} supplements with enhanced citations`);
    console.log(`2. Create complete enhanced citations for ${missingEnhancedDataCount} supplements`);
    console.log(`3. Expected improvement: +${needsProfileCount} complete Evidence Profiles`);
    console.log(`4. Target: ${46 + needsProfileCount}/89 complete profiles (${Math.round(((46 + needsProfileCount)/89)*100)}%)`);
    
    if (needsProfileCount > 0) {
      console.log('\n🚀 READY TO BEGIN EVIDENCE PROFILE ADDITION');
      console.log('Next step: Start with Batch A (Vitamins & Minerals) - 6 supplements');
    }
    
    return {
      total: supplementsNeedingProfiles.length,
      needsProfiles: needsProfileCount,
      alreadyComplete: alreadyCompleteCount,
      missingEnhanced: missingEnhancedDataCount,
      results
    };
    
  } catch (error) {
    console.error('❌ Batch executor error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Batch evidence profile executor complete');
  }
})();
