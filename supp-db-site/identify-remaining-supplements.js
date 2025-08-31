const { chromium } = require('playwright');

(async () => {
  console.log('🔍 IDENTIFYING REMAINING SUPPLEMENTS FOR EVIDENCE PROFILES');
  console.log('Finding the final 23 supplements that need Evidence Profiles...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🧪 Scanning all supplements (IDs 1-89) for Evidence Profile status...');
    
    const results = [];
    const needsProfiles = [];
    const alreadyComplete = [];
    
    // Test all supplements
    for (let suppId = 1; suppId <= 89; suppId++) {
      try {
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
          
          // Check enhanced citation data and Evidence Profile
          const hasEnhancedData = window.enhancedCitations && window.enhancedCitations[id] !== undefined;
          let hasCompleteEvidenceProfile = false;
          let profileCompleteness = 0;
          
          if (hasEnhancedData && window.enhancedCitations[id].evidenceProfile) {
            const profile = window.enhancedCitations[id].evidenceProfile;
            
            // Check for all required fields
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
            hasCompleteEvidenceProfile = profileCompleteness === 100;
          }
          
          return {
            supplementInfo,
            hasEnhancedData,
            hasCompleteEvidenceProfile,
            profileCompleteness
          };
        }, suppId);
        
        if (!dataCheck.supplementInfo) {
          continue; // Skip if supplement doesn't exist
        }
        
        const supplement = dataCheck.supplementInfo;
        const status = dataCheck.hasCompleteEvidenceProfile ? 'complete' : 
                      dataCheck.hasEnhancedData ? 'needs-profile' : 'missing-enhanced-data';
        
        const result = {
          id: suppId,
          name: supplement.name,
          category: supplement.category,
          status,
          hasEnhancedData: dataCheck.hasEnhancedData,
          hasCompleteProfile: dataCheck.hasCompleteEvidenceProfile,
          profileCompleteness: dataCheck.profileCompleteness
        };
        
        results.push(result);
        
        if (status === 'complete') {
          alreadyComplete.push(result);
        } else {
          needsProfiles.push(result);
        }
        
      } catch (error) {
        console.log(`   ID ${suppId}: Error - ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 REMAINING SUPPLEMENTS ANALYSIS');
    console.log('='.repeat(80));
    
    const totalSupplements = results.length;
    const completeProfiles = alreadyComplete.length;
    const needingProfiles = needsProfiles.length;
    const completionRate = Math.round((completeProfiles / totalSupplements) * 100);
    
    console.log(`\n📈 Current Status:`);
    console.log(`   Total Supplements: ${totalSupplements}`);
    console.log(`   Complete Profiles: ${completeProfiles} (${completionRate}%)`);
    console.log(`   Need Profiles: ${needingProfiles} (${Math.round((needingProfiles/totalSupplements)*100)}%)`);
    
    // Categorize remaining supplements by priority
    const highPriority = needsProfiles.filter(s => 
      s.hasEnhancedData && ['Essential Nutrients', 'Antioxidant', 'Herbal Supplement', 'Adaptogen'].includes(s.category)
    );
    
    const mediumPriority = needsProfiles.filter(s => 
      s.hasEnhancedData && !highPriority.includes(s)
    );
    
    const missingEnhanced = needsProfiles.filter(s => !s.hasEnhancedData);
    
    console.log(`\n🎯 PRIORITY BREAKDOWN:`);
    console.log(`   High Priority (Has Enhanced Data): ${highPriority.length}`);
    console.log(`   Medium Priority (Has Enhanced Data): ${mediumPriority.length}`);
    console.log(`   Missing Enhanced Citations: ${missingEnhanced.length}`);
    
    console.log('\n🔴 HIGH PRIORITY - Quick Evidence Profile Addition:');
    highPriority.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name} (${supp.category})`);
    });
    
    console.log('\n🟡 MEDIUM PRIORITY - Evidence Profile Addition:');
    mediumPriority.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name} (${supp.category})`);
    });
    
    console.log('\n🟠 MISSING ENHANCED CITATIONS - Need Complete Work:');
    missingEnhanced.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name} (${supp.category})`);
    });
    
    // Calculate completion targets
    const targetFor80 = Math.ceil(totalSupplements * 0.80);
    const targetFor90 = Math.ceil(totalSupplements * 0.90);
    const targetFor95 = Math.ceil(totalSupplements * 0.95);
    
    console.log('\n🎯 COMPLETION TARGETS:');
    console.log(`   For 80% completion: Need ${Math.max(0, targetFor80 - completeProfiles)} more profiles`);
    console.log(`   For 90% completion: Need ${Math.max(0, targetFor90 - completeProfiles)} more profiles`);
    console.log(`   For 95% completion: Need ${Math.max(0, targetFor95 - completeProfiles)} more profiles`);
    
    console.log('\n🚀 EXECUTION PLAN:');
    console.log('1. 🔴 Complete High Priority supplements (quick Evidence Profile addition)');
    console.log('2. 🟡 Complete Medium Priority supplements (Evidence Profile addition)');
    console.log('3. 🟠 Address Missing Enhanced Citations (Phase 2 Week 3 supplements)');
    console.log('4. ✅ Achieve 95% Evidence Profile completion');
    
    // Show specific next steps
    const nextBatch = [...highPriority, ...mediumPriority].slice(0, 10);
    if (nextBatch.length > 0) {
      console.log('\n📋 NEXT BATCH (Top 10 for immediate completion):');
      nextBatch.forEach((supp, index) => {
        console.log(`   ${index + 1}. ID ${supp.id}: ${supp.name} (${supp.category})`);
      });
    }
    
    return {
      totalSupplements,
      completeProfiles,
      needingProfiles,
      completionRate,
      highPriority,
      mediumPriority,
      missingEnhanced,
      nextBatch
    };
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Remaining supplements analysis complete');
  }
})();
