const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DETAILED CITATION STRUCTURE ANALYSIS');
  console.log('Analyzing field requirements causing validation failures...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const analysisResults = await page.evaluate(() => {
      const results = {
        workingSupplements: [],
        partialSupplements: [],
        failedSupplements: [],
        fieldAnalysis: {
          requiredFields: ['claim', 'evidence'],
          commonFields: new Set(),
          missingFields: {},
          dataStructureVariations: []
        }
      };
      
      if (!window.enhancedCitations) {
        return { error: 'No enhanced citations found' };
      }
      
      // Analyze each supplement's citation structure
      for (const [id, citation] of Object.entries(window.enhancedCitations)) {
        const suppId = parseInt(id);
        const analysis = {
          id: suppId,
          name: citation.supplementName || `Supplement ${suppId}`,
          status: 'unknown',
          tabAnalysis: {},
          fieldIssues: [],
          sampleCitations: {}
        };
        
        if (citation.citations) {
          const tabs = ['mechanisms', 'benefits', 'safety'];
          let workingTabs = 0;
          
          for (const tab of tabs) {
            const tabData = citation.citations[tab];
            analysis.tabAnalysis[tab] = {
              exists: !!tabData,
              count: Array.isArray(tabData) ? tabData.length : 0,
              hasValidCitations: false,
              fieldStructure: {},
              missingFields: []
            };
            
            if (Array.isArray(tabData) && tabData.length > 0) {
              const firstCitation = tabData[0];
              
              // Analyze field structure
              const fields = Object.keys(firstCitation);
              analysis.tabAnalysis[tab].fieldStructure = fields;
              
              // Track all fields across supplements
              fields.forEach(field => results.fieldAnalysis.commonFields.add(field));
              
              // Check required fields
              const requiredFields = ['claim', 'evidence'];
              const missingRequired = requiredFields.filter(field => !firstCitation[field]);
              analysis.tabAnalysis[tab].missingFields = missingRequired;
              
              if (missingRequired.length === 0) {
                analysis.tabAnalysis[tab].hasValidCitations = true;
                workingTabs++;
              } else {
                analysis.fieldIssues.push(`${tab}: Missing ${missingRequired.join(', ')}`);
              }
              
              // Store sample citation for analysis
              analysis.sampleCitations[tab] = {
                fields: fields,
                hasClaimEvidence: !!(firstCitation.claim && firstCitation.evidence),
                sampleData: {
                  claim: firstCitation.claim || 'MISSING',
                  evidence: firstCitation.evidence || 'MISSING',
                  studyType: firstCitation.studyType || 'MISSING',
                  participants: firstCitation.participants || 'MISSING',
                  pmid: firstCitation.pmid || 'MISSING'
                }
              };
            }
          }
          
          // Determine overall status
          const totalTabs = tabs.length;
          if (workingTabs === totalTabs && workingTabs > 0) {
            analysis.status = 'working';
            results.workingSupplements.push(analysis);
          } else if (workingTabs > 0) {
            analysis.status = 'partial';
            results.partialSupplements.push(analysis);
          } else {
            analysis.status = 'failed';
            results.failedSupplements.push(analysis);
          }
        } else {
          analysis.status = 'no-citations';
          analysis.fieldIssues.push('No citations object found');
          results.failedSupplements.push(analysis);
        }
      }
      
      // Convert Set to Array for JSON serialization
      results.fieldAnalysis.commonFields = Array.from(results.fieldAnalysis.commonFields);
      
      // Analyze field patterns
      const allSupplements = [...results.workingSupplements, ...results.partialSupplements, ...results.failedSupplements];
      
      // Count missing field occurrences
      allSupplements.forEach(supp => {
        supp.fieldIssues.forEach(issue => {
          if (!results.fieldAnalysis.missingFields[issue]) {
            results.fieldAnalysis.missingFields[issue] = 0;
          }
          results.fieldAnalysis.missingFields[issue]++;
        });
      });
      
      return results;
    });
    
    if (analysisResults.error) {
      console.error('❌ Analysis failed:', analysisResults.error);
      return;
    }
    
    console.log('\n📊 CITATION STRUCTURE ANALYSIS RESULTS');
    console.log('='.repeat(60));
    
    const { workingSupplements, partialSupplements, failedSupplements, fieldAnalysis } = analysisResults;
    
    console.log(`\n🔍 SUPPLEMENT CATEGORIES:`);
    console.log(`   ✅ Working: ${workingSupplements.length}`);
    console.log(`   ⚠️ Partial: ${partialSupplements.length}`);
    console.log(`   ❌ Failed: ${failedSupplements.length}`);
    
    console.log(`\n📋 FIELD ANALYSIS:`);
    console.log(`   Required Fields: ${fieldAnalysis.requiredFields.join(', ')}`);
    console.log(`   Common Fields Found: ${fieldAnalysis.commonFields.length}`);
    console.log(`   All Fields: ${fieldAnalysis.commonFields.join(', ')}`);
    
    console.log(`\n🚨 MISSING FIELD PATTERNS:`);
    Object.entries(fieldAnalysis.missingFields)
      .sort(([,a], [,b]) => b - a)
      .forEach(([issue, count]) => {
        console.log(`   ${issue}: ${count} supplements`);
      });
    
    console.log(`\n✅ WORKING SUPPLEMENTS ANALYSIS (${workingSupplements.length}):`);
    console.log('Examining field structures of successful citations...');
    
    // Analyze working supplement patterns
    const workingFieldPatterns = {};
    workingSupplements.slice(0, 5).forEach(supp => {
      console.log(`\n   📋 ${supp.name} (ID: ${supp.id}):`);
      Object.entries(supp.sampleCitations).forEach(([tab, data]) => {
        if (data.hasClaimEvidence) {
          console.log(`     ${tab}: ✅ Has claim/evidence`);
          console.log(`       Fields: ${data.fields.join(', ')}`);
          console.log(`       Claim: "${data.sampleData.claim.substring(0, 50)}..."`);
          console.log(`       Evidence: "${data.sampleData.evidence}"`);
          
          // Track field patterns
          const pattern = data.fields.sort().join('|');
          if (!workingFieldPatterns[pattern]) {
            workingFieldPatterns[pattern] = { count: 0, supplements: [] };
          }
          workingFieldPatterns[pattern].count++;
          workingFieldPatterns[pattern].supplements.push(`${supp.name}(${tab})`);
        }
      });
    });
    
    console.log(`\n❌ FAILED SUPPLEMENTS ANALYSIS (${failedSupplements.length}):`);
    console.log('Examining why citations are failing validation...');
    
    failedSupplements.slice(0, 5).forEach(supp => {
      console.log(`\n   📋 ${supp.name} (ID: ${supp.id}):`);
      console.log(`     Issues: ${supp.fieldIssues.join(', ')}`);
      
      Object.entries(supp.sampleCitations).forEach(([tab, data]) => {
        if (data) {
          console.log(`     ${tab}:`);
          console.log(`       Fields: ${data.fields.join(', ')}`);
          console.log(`       Has claim/evidence: ${data.hasClaimEvidence ? '✅' : '❌'}`);
          console.log(`       Sample claim: "${data.sampleData.claim}"`);
          console.log(`       Sample evidence: "${data.sampleData.evidence}"`);
        }
      });
    });
    
    console.log(`\n🔍 FIELD PATTERN ANALYSIS:`);
    console.log('Common field structures in working supplements:');
    Object.entries(workingFieldPatterns)
      .sort(([,a], [,b]) => b.count - a.count)
      .forEach(([pattern, data]) => {
        console.log(`\n   Pattern: ${pattern}`);
        console.log(`   Count: ${data.count}`);
        console.log(`   Examples: ${data.supplements.slice(0, 3).join(', ')}`);
      });
    
    console.log(`\n📊 STANDARDIZATION FEASIBILITY ASSESSMENT:`);
    
    // Assess Phase 3 supplements specifically
    const phase3Ids = [2, 9, 10, 11, 12, 20, 24, 75];
    const phase3Working = workingSupplements.filter(supp => phase3Ids.includes(supp.id));
    
    console.log(`\n🎯 PHASE 3 SUPPLEMENTS (${phase3Working.length}/8 working):`);
    if (phase3Working.length > 0) {
      const phase3Sample = phase3Working[0];
      console.log(`   Sample: ${phase3Sample.name}`);
      Object.entries(phase3Sample.sampleCitations).forEach(([tab, data]) => {
        if (data.hasClaimEvidence) {
          console.log(`     ${tab} fields: ${data.fields.join(', ')}`);
        }
      });
      
      console.log(`\n   ✅ Phase 3 supplements can serve as the standard format`);
    }
    
    // Calculate standardization impact
    const totalSupplements = workingSupplements.length + partialSupplements.length + failedSupplements.length;
    const needsStandardization = partialSupplements.length + failedSupplements.length;
    
    console.log(`\n📈 STANDARDIZATION IMPACT:`);
    console.log(`   Total supplements: ${totalSupplements}`);
    console.log(`   Currently working: ${workingSupplements.length} (${Math.round((workingSupplements.length/totalSupplements)*100)}%)`);
    console.log(`   Need standardization: ${needsStandardization} (${Math.round((needsStandardization/totalSupplements)*100)}%)`);
    console.log(`   Potential improvement: ${Math.round((needsStandardization/totalSupplements)*100)}% → 100%`);
    
    console.log(`\n🎯 RECOMMENDED STANDARDIZATION STRATEGY:`);
    console.log(`1. ✅ Use Phase 3 format as standard (proven working)`);
    console.log(`2. 🔧 Preserve all working supplements (${workingSupplements.length})`);
    console.log(`3. 🔧 Migrate ${needsStandardization} supplements to standard format`);
    console.log(`4. 📋 Required fields: claim, evidence, studyType, participants`);
    console.log(`5. 📋 Optional fields: pmid, year, duration, details, replication`);
    
    return analysisResults;
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Citation structure analysis complete');
  }
})();
