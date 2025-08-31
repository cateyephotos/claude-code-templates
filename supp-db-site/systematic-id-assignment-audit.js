const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🔍 SYSTEMATIC SUPPLEMENT ID ASSIGNMENT AUDIT');
  console.log('Checking for incorrect ID assignments and mappings...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const auditResults = await page.evaluate(() => {
      const results = {
        totalEnhancedCitations: 0,
        correctAssignments: [],
        incorrectAssignments: [],
        missingSupplements: [],
        duplicateNames: [],
        enhancedCitationsMap: {},
        supplementsWithoutEnhanced: [],
        enhancedWithoutSupplements: []
      };
      
      // Get all enhanced citations
      if (window.enhancedCitations) {
        results.totalEnhancedCitations = Object.keys(window.enhancedCitations).length;
        
        // Create map of enhanced citations
        for (const [id, citation] of Object.entries(window.enhancedCitations)) {
          const enhancedId = parseInt(id);
          const enhancedName = citation.supplementName || citation.name || `Unknown ${id}`;
          const scientificName = citation.scientificName || '';
          
          results.enhancedCitationsMap[enhancedId] = {
            id: enhancedId,
            name: enhancedName,
            scientificName: scientificName,
            hasEvidenceProfile: !!citation.evidenceProfile,
            hasCitations: !!citation.citations,
            citationStructure: citation.citations ? Object.keys(citation.citations) : []
          };
        }
      }
      
      // Get all supplements from main database
      const supplementsMap = {};
      if (window.supplements && Array.isArray(window.supplements)) {
        window.supplements.forEach(supp => {
          if (supp.id && supp.name) {
            supplementsMap[supp.id] = {
              id: supp.id,
              name: supp.name,
              scientificName: supp.scientificName || '',
              category: supp.category || '',
              evidenceTier: supp.evidenceTier || 'Unknown'
            };
          }
        });
      }
      
      // Compare assignments
      const allIds = new Set([
        ...Object.keys(results.enhancedCitationsMap).map(id => parseInt(id)),
        ...Object.keys(supplementsMap).map(id => parseInt(id))
      ]);
      
      for (const id of allIds) {
        const enhanced = results.enhancedCitationsMap[id];
        const supplement = supplementsMap[id];
        
        if (enhanced && supplement) {
          // Both exist - check if names match
          const enhancedNameNorm = enhanced.name.toLowerCase().trim();
          const supplementNameNorm = supplement.name.toLowerCase().trim();
          
          // Check for exact match or close match
          const isExactMatch = enhancedNameNorm === supplementNameNorm;
          const isCloseMatch = enhancedNameNorm.includes(supplementNameNorm) || 
                             supplementNameNorm.includes(enhancedNameNorm);
          
          if (isExactMatch || isCloseMatch) {
            results.correctAssignments.push({
              id: id,
              supplementName: supplement.name,
              enhancedName: enhanced.name,
              matchType: isExactMatch ? 'exact' : 'close',
              category: supplement.category,
              evidenceTier: supplement.evidenceTier,
              hasEnhanced: true
            });
          } else {
            results.incorrectAssignments.push({
              id: id,
              supplementName: supplement.name,
              enhancedName: enhanced.name,
              supplementScientific: supplement.scientificName,
              enhancedScientific: enhanced.scientificName,
              category: supplement.category,
              evidenceTier: supplement.evidenceTier
            });
          }
        } else if (enhanced && !supplement) {
          // Enhanced exists but no supplement in main database
          results.enhancedWithoutSupplements.push({
            id: id,
            enhancedName: enhanced.name,
            scientificName: enhanced.scientificName
          });
        } else if (supplement && !enhanced) {
          // Supplement exists but no enhanced citation
          results.supplementsWithoutEnhanced.push({
            id: id,
            supplementName: supplement.name,
            scientificName: supplement.scientificName,
            category: supplement.category,
            evidenceTier: supplement.evidenceTier
          });
        }
      }
      
      // Check for duplicate names
      const nameCount = {};
      Object.values(results.enhancedCitationsMap).forEach(enhanced => {
        const name = enhanced.name.toLowerCase().trim();
        nameCount[name] = (nameCount[name] || 0) + 1;
      });
      
      for (const [name, count] of Object.entries(nameCount)) {
        if (count > 1) {
          const duplicates = Object.values(results.enhancedCitationsMap)
            .filter(enhanced => enhanced.name.toLowerCase().trim() === name)
            .map(enhanced => ({ id: enhanced.id, name: enhanced.name }));
          results.duplicateNames.push({ name, count, duplicates });
        }
      }
      
      return results;
    });
    
    console.log('\n📊 SYSTEMATIC ID ASSIGNMENT AUDIT RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📈 OVERVIEW:`);
    console.log(`   Total Enhanced Citations: ${auditResults.totalEnhancedCitations}`);
    console.log(`   ✅ Correct Assignments: ${auditResults.correctAssignments.length}`);
    console.log(`   ❌ Incorrect Assignments: ${auditResults.incorrectAssignments.length}`);
    console.log(`   ⚠️ Enhanced Without Supplements: ${auditResults.enhancedWithoutSupplements.length}`);
    console.log(`   ⚠️ Supplements Without Enhanced: ${auditResults.supplementsWithoutEnhanced.length}`);
    console.log(`   🔄 Duplicate Names: ${auditResults.duplicateNames.length}`);
    
    if (auditResults.incorrectAssignments.length > 0) {
      console.log(`\n❌ INCORRECT ID ASSIGNMENTS (${auditResults.incorrectAssignments.length}):`);
      console.log('   These need immediate attention:');
      auditResults.incorrectAssignments.forEach(item => {
        console.log(`   🚨 ID ${item.id}:`);
        console.log(`      Supplement DB: "${item.supplementName}" (${item.supplementScientific || 'No scientific name'})`);
        console.log(`      Enhanced Citation: "${item.enhancedName}" (${item.enhancedScientific || 'No scientific name'})`);
        console.log(`      Category: ${item.category} | Tier: ${item.evidenceTier}`);
        console.log('');
      });
    }
    
    if (auditResults.duplicateNames.length > 0) {
      console.log(`\n🔄 DUPLICATE NAMES (${auditResults.duplicateNames.length}):`);
      auditResults.duplicateNames.forEach(dup => {
        console.log(`   "${dup.name}" appears ${dup.count} times:`);
        dup.duplicates.forEach(item => {
          console.log(`      - ID ${item.id}: ${item.name}`);
        });
        console.log('');
      });
    }
    
    if (auditResults.enhancedWithoutSupplements.length > 0) {
      console.log(`\n⚠️ ENHANCED CITATIONS WITHOUT SUPPLEMENTS (${auditResults.enhancedWithoutSupplements.length}):`);
      auditResults.enhancedWithoutSupplements.forEach(item => {
        console.log(`   ID ${item.id}: "${item.enhancedName}" (${item.scientificName || 'No scientific name'})`);
      });
    }
    
    if (auditResults.supplementsWithoutEnhanced.length > 10) {
      console.log(`\n⚠️ SUPPLEMENTS WITHOUT ENHANCED CITATIONS (showing first 10 of ${auditResults.supplementsWithoutEnhanced.length}):`);
      auditResults.supplementsWithoutEnhanced.slice(0, 10).forEach(item => {
        console.log(`   ID ${item.id}: "${item.supplementName}" (${item.category}, Tier ${item.evidenceTier})`);
      });
      console.log(`   ... and ${auditResults.supplementsWithoutEnhanced.length - 10} more`);
    } else if (auditResults.supplementsWithoutEnhanced.length > 0) {
      console.log(`\n⚠️ SUPPLEMENTS WITHOUT ENHANCED CITATIONS (${auditResults.supplementsWithoutEnhanced.length}):`);
      auditResults.supplementsWithoutEnhanced.forEach(item => {
        console.log(`   ID ${item.id}: "${item.supplementName}" (${item.category}, Tier ${item.evidenceTier})`);
      });
    }
    
    console.log(`\n✅ CORRECT ASSIGNMENTS (showing first 10 of ${auditResults.correctAssignments.length}):`);
    auditResults.correctAssignments.slice(0, 10).forEach(item => {
      console.log(`   ID ${item.id}: "${item.supplementName}" (${item.matchType} match, ${item.category}, Tier ${item.evidenceTier})`);
    });
    if (auditResults.correctAssignments.length > 10) {
      console.log(`   ... and ${auditResults.correctAssignments.length - 10} more correct assignments`);
    }
    
    // Save detailed results to file
    const detailedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalEnhancedCitations: auditResults.totalEnhancedCitations,
        correctAssignments: auditResults.correctAssignments.length,
        incorrectAssignments: auditResults.incorrectAssignments.length,
        enhancedWithoutSupplements: auditResults.enhancedWithoutSupplements.length,
        supplementsWithoutEnhanced: auditResults.supplementsWithoutEnhanced.length,
        duplicateNames: auditResults.duplicateNames.length
      },
      details: auditResults
    };
    
    fs.writeFileSync('systematic-id-assignment-audit-report.json', JSON.stringify(detailedReport, null, 2));
    console.log('\n📄 Detailed report saved to: systematic-id-assignment-audit-report.json');
    
    return auditResults;
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Systematic ID assignment audit complete');
  }
})();
