const { chromium } = require('playwright');

(async () => {
  console.log('🔍 COMPREHENSIVE EVIDENCE PROFILE AUDIT');
  console.log('Auditing Evidence Profiles across all 89 supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('\n🧪 Auditing Evidence Profiles for all supplements (IDs 1-89)...');
    
    const results = [];
    let totalTested = 0;
    let completeProfiles = 0;
    let partialProfiles = 0;
    let missingProfiles = 0;
    
    // Test supplements in batches
    const batchSize = 15;
    const totalSupplements = 89;
    
    for (let startId = 1; startId <= totalSupplements; startId += batchSize) {
      const endId = Math.min(startId + batchSize - 1, totalSupplements);
      console.log(`\n📦 Auditing batch: IDs ${startId}-${endId}`);
      
      for (let suppId = startId; suppId <= endId; suppId++) {
        try {
          totalTested++;
          
          // Get supplement info and enhanced citation data
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
            let profileCompleteness = {
              hasProfile: false,
              hasOverallQuality: false,
              hasResearchScore: false,
              hasEvidenceStrength: false,
              hasResearchMaturity: false,
              hasPublicationSpan: false,
              hasKeyFindings: false,
              hasLastUpdate: false
            };
            
            if (hasEnhancedData && window.enhancedCitations[id].evidenceProfile) {
              evidenceProfile = window.enhancedCitations[id].evidenceProfile;
              profileCompleteness = {
                hasProfile: true,
                hasOverallQuality: !!evidenceProfile.overallQuality,
                hasResearchScore: typeof evidenceProfile.researchQualityScore === 'number',
                hasEvidenceStrength: !!evidenceProfile.evidenceStrength,
                hasResearchMaturity: !!evidenceProfile.researchMaturity,
                hasPublicationSpan: !!evidenceProfile.publicationSpan,
                hasKeyFindings: !!evidenceProfile.keyFindings,
                hasLastUpdate: !!evidenceProfile.lastEvidenceUpdate
              };
            }
            
            return {
              supplementInfo,
              hasEnhancedData,
              evidenceProfile,
              profileCompleteness
            };
          }, suppId);
          
          if (!dataCheck.supplementInfo) {
            continue; // Skip if supplement doesn't exist
          }
          
          const supplement = dataCheck.supplementInfo;
          const profile = dataCheck.evidenceProfile;
          const completeness = dataCheck.profileCompleteness;
          
          // Assess profile completeness
          let profileStatus = 'missing';
          let completenessScore = 0;
          let issues = [];
          
          if (completeness.hasProfile) {
            const requiredFields = [
              'hasOverallQuality', 'hasResearchScore', 'hasEvidenceStrength', 
              'hasResearchMaturity', 'hasPublicationSpan', 'hasLastUpdate'
            ];
            
            const completedFields = requiredFields.filter(field => completeness[field]).length;
            completenessScore = Math.round((completedFields / requiredFields.length) * 100);
            
            if (completenessScore === 100) {
              profileStatus = 'complete';
              completeProfiles++;
            } else if (completenessScore >= 50) {
              profileStatus = 'partial';
              partialProfiles++;
            } else {
              profileStatus = 'incomplete';
              missingProfiles++;
            }
            
            // Identify specific issues
            if (!completeness.hasOverallQuality) issues.push('Missing Overall Quality');
            if (!completeness.hasResearchScore) issues.push('Missing Research Score');
            if (!completeness.hasEvidenceStrength) issues.push('Missing Evidence Strength');
            if (!completeness.hasResearchMaturity) issues.push('Missing Research Maturity');
            if (!completeness.hasPublicationSpan) issues.push('Missing Publication Span');
            if (!completeness.hasLastUpdate) issues.push('Missing Last Update');
            
            // Validate Evidence Strength categories if present
            if (profile && profile.evidenceStrength) {
              const strengthCategories = ['mechanisms', 'clinicalBenefits', 'safety', 'dosage'];
              const missingCategories = strengthCategories.filter(cat => !profile.evidenceStrength[cat]);
              if (missingCategories.length > 0) {
                issues.push(`Missing Evidence Strength: ${missingCategories.join(', ')}`);
              }
            }
            
            // Validate quality tier and score alignment
            if (profile && profile.overallQuality && typeof profile.researchQualityScore === 'number') {
              const tier = profile.overallQuality;
              const score = profile.researchQualityScore;
              let expectedTier = 'Tier 4';
              if (score >= 85) expectedTier = 'Tier 1';
              else if (score >= 70) expectedTier = 'Tier 2';
              else if (score >= 55) expectedTier = 'Tier 3';
              
              if (tier !== expectedTier) {
                issues.push(`Tier/Score Mismatch: ${tier} with score ${score} (expected ${expectedTier})`);
              }
            }
          } else {
            missingProfiles++;
          }
          
          const result = {
            id: suppId,
            name: supplement.name,
            category: supplement.category,
            hasEnhancedData: dataCheck.hasEnhancedData,
            profileStatus,
            completenessScore,
            issues,
            profile: profile ? {
              overallQuality: profile.overallQuality,
              researchQualityScore: profile.researchQualityScore,
              researchMaturity: profile.researchMaturity,
              publicationSpan: profile.publicationSpan
            } : null
          };
          
          results.push(result);
          
          // Log progress
          const statusIcon = profileStatus === 'complete' ? '✅' : 
                           profileStatus === 'partial' ? '⚠️' : '❌';
          const scoreText = completeness.hasProfile ? `${completenessScore}%` : 'N/A';
          console.log(`   ID ${suppId}: ${supplement.name} ${statusIcon} (${scoreText})`);
          
        } catch (error) {
          console.log(`   ID ${suppId}: Error - ${error.message}`);
        }
      }
      
      // Brief pause between batches
      await page.waitForTimeout(1000);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 COMPREHENSIVE EVIDENCE PROFILE AUDIT RESULTS');
    console.log('='.repeat(80));
    
    const profileSuccessRate = Math.round((completeProfiles / totalTested) * 100);
    const partialRate = Math.round((partialProfiles / totalTested) * 100);
    const missingRate = Math.round((missingProfiles / totalTested) * 100);
    
    console.log(`\n📊 Evidence Profile Status:`);
    console.log(`   Total Supplements: ${totalTested}`);
    console.log(`   Complete Profiles: ${completeProfiles}/${totalTested} (${profileSuccessRate}%)`);
    console.log(`   Partial Profiles: ${partialProfiles}/${totalTested} (${partialRate}%)`);
    console.log(`   Missing Profiles: ${missingProfiles}/${totalTested} (${missingRate}%)`);
    
    // Analyze by category
    const categoryAnalysis = {};
    results.forEach(result => {
      if (!categoryAnalysis[result.category]) {
        categoryAnalysis[result.category] = { total: 0, complete: 0, partial: 0, missing: 0 };
      }
      categoryAnalysis[result.category].total++;
      if (result.profileStatus === 'complete') categoryAnalysis[result.category].complete++;
      else if (result.profileStatus === 'partial') categoryAnalysis[result.category].partial++;
      else categoryAnalysis[result.category].missing++;
    });
    
    console.log('\n📋 Evidence Profile Status by Category:');
    Object.entries(categoryAnalysis).forEach(([category, stats]) => {
      const completeRate = Math.round((stats.complete / stats.total) * 100);
      console.log(`   ${category}: ${stats.complete}/${stats.total} complete (${completeRate}%)`);
    });
    
    // Show complete profiles
    console.log('\n✅ SUPPLEMENTS WITH COMPLETE EVIDENCE PROFILES:');
    const completeSupplements = results.filter(r => r.profileStatus === 'complete');
    completeSupplements.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name} (${supp.profile?.overallQuality}, Score: ${supp.profile?.researchQualityScore})`);
    });
    
    // Show supplements needing attention
    console.log('\n⚠️ SUPPLEMENTS NEEDING EVIDENCE PROFILE ATTENTION:');
    const needsAttention = results.filter(r => r.profileStatus !== 'complete' && r.hasEnhancedData);
    needsAttention.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name} (${supp.completenessScore}%) - ${supp.issues.slice(0, 2).join(', ')}`);
    });
    
    // Show supplements missing enhanced data entirely
    console.log('\n❌ SUPPLEMENTS MISSING ENHANCED CITATIONS ENTIRELY:');
    const missingEnhanced = results.filter(r => !r.hasEnhancedData);
    missingEnhanced.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name} (${supp.category})`);
    });
    
    // Priority recommendations
    console.log('\n🎯 EVIDENCE PROFILE COMPLETION PRIORITIES:');
    
    if (needsAttention.length > 0) {
      console.log('\n🔴 HIGH PRIORITY (Partial Profiles - Quick Fixes):');
      const highPriority = needsAttention.filter(r => r.completenessScore >= 70);
      highPriority.slice(0, 10).forEach(supp => {
        console.log(`   ID ${supp.id}: ${supp.name} (${supp.completenessScore}%) - ${supp.issues[0]}`);
      });
    }
    
    if (missingEnhanced.length > 0) {
      console.log('\n🟡 MEDIUM PRIORITY (Missing Enhanced Citations):');
      const mediumPriority = missingEnhanced.slice(0, 10);
      mediumPriority.forEach(supp => {
        console.log(`   ID ${supp.id}: ${supp.name} (${supp.category}) - Needs complete enhanced citations`);
      });
    }
    
    // Summary assessment
    if (profileSuccessRate >= 80) {
      console.log('\n🎉 EVIDENCE PROFILE SYSTEM STATUS: EXCELLENT');
      console.log('✅ Most supplements have complete Evidence Profiles');
      console.log('✅ System is well-implemented and consistent');
    } else if (profileSuccessRate >= 60) {
      console.log('\n🎊 EVIDENCE PROFILE SYSTEM STATUS: GOOD');
      console.log('✅ Good foundation with room for improvement');
      console.log('🔧 Focus on completing partial profiles');
    } else {
      console.log('\n⚠️ EVIDENCE PROFILE SYSTEM STATUS: NEEDS ATTENTION');
      console.log('🔧 Significant work needed to complete Evidence Profiles');
      console.log('📋 Prioritize systematic completion');
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Complete Evidence Profiles for supplements with partial data');
    console.log('2. Add Evidence Profiles to new enhanced citations');
    console.log('3. Validate tier/score alignments for existing profiles');
    console.log('4. Ensure all Phase 2 supplements have complete profiles');
    
    return {
      totalTested,
      completeProfiles,
      partialProfiles,
      missingProfiles,
      profileSuccessRate,
      results,
      categoryAnalysis
    };
    
  } catch (error) {
    console.error('❌ Audit error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Evidence Profile audit complete');
  }
})();
