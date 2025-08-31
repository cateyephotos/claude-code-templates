const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🔍 COMPREHENSIVE CITATION DATA AUDIT');
  console.log('Identifying all supplements with citation data...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all supplement data and enhanced citations
    const auditResults = await page.evaluate(() => {
      const supplements = window.supplementDatabase?.supplements || [];
      const enhancedCitations = window.enhancedCitations || {};
      
      const auditData = {
        totalSupplements: supplements.length,
        supplementsWithCitations: [],
        supplementsWithEnhancedCitations: [],
        supplementsWithLegacyCitations: [],
        supplementsWithMixedCitations: [],
        supplementsWithoutCitations: [],
        citationFormatAnalysis: {}
      };
      
      supplements.forEach(supplement => {
        const hasLegacyCitations = supplement.citations && supplement.citations.length > 0;
        const hasEnhancedCitations = enhancedCitations[supplement.id];
        
        const supplementInfo = {
          id: supplement.id,
          name: supplement.name,
          category: supplement.category,
          hasLegacyCitations: hasLegacyCitations,
          hasEnhancedCitations: hasEnhancedCitations,
          legacyCitationCount: hasLegacyCitations ? supplement.citations.length : 0,
          enhancedCitationStructure: null
        };
        
        // Analyze enhanced citation structure if present
        if (hasEnhancedCitations) {
          const enhanced = enhancedCitations[supplement.id];
          supplementInfo.enhancedCitationStructure = {
            hasBenefits: !!(enhanced.citations?.benefits?.length),
            hasSafety: !!(enhanced.citations?.safety?.length),
            hasMechanisms: !!(enhanced.citations?.mechanisms?.length),
            benefitsCount: enhanced.citations?.benefits?.length || 0,
            safetyCount: enhanced.citations?.safety?.length || 0,
            mechanismsCount: enhanced.citations?.mechanisms?.length || 0,
            benefitsFormat: null,
            safetyFormat: null,
            mechanismsFormat: null
          };
          
          // Analyze format of each section
          if (enhanced.citations?.benefits?.length > 0) {
            const benefit = enhanced.citations.benefits[0];
            supplementInfo.enhancedCitationStructure.benefitsFormat = {
              hasClaim: !!benefit.claim,
              hasSpecificClaim: !!benefit.specificClaim,
              hasStudies: !!benefit.studies,
              hasEvidence: !!benefit.evidence,
              studiesCount: benefit.studies?.length || 0,
              evidenceCount: benefit.evidence?.length || 0
            };
          }
          
          if (enhanced.citations?.safety?.length > 0) {
            const safety = enhanced.citations.safety[0];
            supplementInfo.enhancedCitationStructure.safetyFormat = {
              hasClaim: !!safety.claim,
              hasStudies: !!safety.studies,
              hasEvidence: !!safety.evidence,
              studiesCount: safety.studies?.length || 0,
              evidenceCount: safety.evidence?.length || 0
            };
          }
          
          if (enhanced.citations?.mechanisms?.length > 0) {
            const mechanism = enhanced.citations.mechanisms[0];
            supplementInfo.enhancedCitationStructure.mechanismsFormat = {
              hasClaim: !!mechanism.claim,
              hasMechanism: !!mechanism.mechanism,
              hasStudies: !!mechanism.studies,
              hasEvidence: !!mechanism.evidence,
              studiesCount: mechanism.studies?.length || 0,
              evidenceCount: mechanism.evidence?.length || 0
            };
          }
        }
        
        // Categorize supplement
        if (hasEnhancedCitations && hasLegacyCitations) {
          auditData.supplementsWithMixedCitations.push(supplementInfo);
        } else if (hasEnhancedCitations) {
          auditData.supplementsWithEnhancedCitations.push(supplementInfo);
        } else if (hasLegacyCitations) {
          auditData.supplementsWithLegacyCitations.push(supplementInfo);
        } else {
          auditData.supplementsWithoutCitations.push(supplementInfo);
        }
        
        if (hasLegacyCitations || hasEnhancedCitations) {
          auditData.supplementsWithCitations.push(supplementInfo);
        }
      });
      
      return auditData;
    });
    
    console.log('\n📊 CITATION DATA INVENTORY:');
    console.log(`   Total Supplements: ${auditResults.totalSupplements}`);
    console.log(`   With Citations: ${auditResults.supplementsWithCitations.length}`);
    console.log(`   Enhanced Citations Only: ${auditResults.supplementsWithEnhancedCitations.length}`);
    console.log(`   Legacy Citations Only: ${auditResults.supplementsWithLegacyCitations.length}`);
    console.log(`   Mixed Citations: ${auditResults.supplementsWithMixedCitations.length}`);
    console.log(`   No Citations: ${auditResults.supplementsWithoutCitations.length}`);
    
    console.log('\n📋 SUPPLEMENTS WITH ENHANCED CITATIONS:');
    auditResults.supplementsWithEnhancedCitations.forEach(supp => {
      const struct = supp.enhancedCitationStructure;
      console.log(`\n${supp.name} (ID: ${supp.id})`);
      console.log(`   Benefits: ${struct.benefitsCount} | Safety: ${struct.safetyCount} | Mechanisms: ${struct.mechanismsCount}`);
      
      if (struct.benefitsFormat) {
        const bf = struct.benefitsFormat;
        console.log(`   Benefits Format: claim:${bf.hasClaim} studies:${bf.hasStudies}(${bf.studiesCount}) evidence:${bf.hasEvidence}(${bf.evidenceCount})`);
      }
      
      if (struct.safetyFormat) {
        const sf = struct.safetyFormat;
        console.log(`   Safety Format: claim:${sf.hasClaim} studies:${sf.hasStudies}(${sf.studiesCount}) evidence:${sf.hasEvidence}(${sf.evidenceCount})`);
      }
      
      if (struct.mechanismsFormat) {
        const mf = struct.mechanismsFormat;
        console.log(`   Mechanisms Format: claim:${mf.hasClaim} studies:${mf.hasStudies}(${mf.studiesCount}) evidence:${mf.hasEvidence}(${mf.evidenceCount})`);
      }
    });
    
    console.log('\n📋 SUPPLEMENTS WITH MIXED CITATIONS:');
    auditResults.supplementsWithMixedCitations.forEach(supp => {
      const struct = supp.enhancedCitationStructure;
      console.log(`\n${supp.name} (ID: ${supp.id})`);
      console.log(`   Legacy Citations: ${supp.legacyCitationCount}`);
      console.log(`   Enhanced - Benefits: ${struct.benefitsCount} | Safety: ${struct.safetyCount} | Mechanisms: ${struct.mechanismsCount}`);
    });
    
    console.log('\n📋 SUPPLEMENTS WITH LEGACY CITATIONS ONLY:');
    auditResults.supplementsWithLegacyCitations.forEach(supp => {
      console.log(`   ${supp.name} (ID: ${supp.id}) - ${supp.legacyCitationCount} citations`);
    });
    
    // Save audit results to file
    const auditReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSupplements: auditResults.totalSupplements,
        withCitations: auditResults.supplementsWithCitations.length,
        enhancedOnly: auditResults.supplementsWithEnhancedCitations.length,
        legacyOnly: auditResults.supplementsWithLegacyCitations.length,
        mixed: auditResults.supplementsWithMixedCitations.length,
        noCitations: auditResults.supplementsWithoutCitations.length
      },
      supplementsWithEnhancedCitations: auditResults.supplementsWithEnhancedCitations,
      supplementsWithMixedCitations: auditResults.supplementsWithMixedCitations,
      supplementsWithLegacyCitations: auditResults.supplementsWithLegacyCitations,
      supplementsWithoutCitations: auditResults.supplementsWithoutCitations.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category
      }))
    };
    
    fs.writeFileSync('citation-audit-report.json', JSON.stringify(auditReport, null, 2));
    console.log('\n💾 Audit report saved to citation-audit-report.json');
    
    console.log('\n' + '='.repeat(70));
    console.log('🔍 CITATION DATA AUDIT COMPLETE');
    console.log('='.repeat(70));
    
    const prioritySupplements = auditResults.supplementsWithEnhancedCitations.filter(supp => {
      const struct = supp.enhancedCitationStructure;
      return struct.benefitsCount > 0 || struct.safetyCount > 0 || struct.mechanismsCount > 0;
    });
    
    console.log(`\n🎯 PRIORITY SUPPLEMENTS FOR TESTING: ${prioritySupplements.length}`);
    console.log('These supplements have enhanced citation data and need testing:');
    prioritySupplements.forEach(supp => {
      console.log(`   • ${supp.name} (ID: ${supp.id})`);
    });
    
    return auditResults;
    
  } catch (error) {
    console.error('❌ Audit error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Citation data audit complete');
  }
})();
