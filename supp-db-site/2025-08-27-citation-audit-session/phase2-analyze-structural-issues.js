const { chromium } = require('playwright');

(async () => {
  console.log('🔍 PHASE 2: ANALYZING STRUCTURAL ISSUES');
  console.log('Deep-diving into high-priority supplements with structural problems...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // High-priority supplements with structural issues
    const highPrioritySupplements = [
      { id: 9, name: 'L-Theanine' },
      { id: 14, name: 'Ginkgo Biloba' },
      { id: 20, name: 'Quercetin' }
    ];
    
    const analysisResults = [];
    
    for (const supplement of highPrioritySupplements) {
      console.log(`\n🔍 Analyzing ${supplement.name} (ID: ${supplement.id})...`);
      
      // Check data structure
      const dataAnalysis = await page.evaluate((suppId) => {
        const enhancedCitations = window.enhancedCitations?.[suppId];
        
        if (!enhancedCitations) return { error: 'No enhanced citations found' };
        
        const benefits = enhancedCitations.citations?.benefits || [];
        const safety = enhancedCitations.citations?.safety || [];
        const mechanisms = enhancedCitations.citations?.mechanisms || [];
        
        const analyzeSection = (items, sectionName) => {
          return items.map((item, index) => {
            const studies = item.studies || item.evidence || [];
            const isStudiesArray = Array.isArray(studies);
            
            return {
              index: index,
              hasClaim: !!(item.claim || item.specificClaim || item.mechanism),
              claimValue: item.claim || item.specificClaim || item.mechanism || 'missing',
              hasStudies: !!item.studies,
              hasEvidence: !!item.evidence,
              studiesType: typeof studies,
              studiesIsArray: isStudiesArray,
              studiesLength: isStudiesArray ? studies.length : 0,
              studiesValue: studies,
              rawItem: item
            };
          });
        };
        
        return {
          supplementId: suppId,
          benefitsCount: benefits.length,
          safetyCount: safety.length,
          mechanismsCount: mechanisms.length,
          benefitsAnalysis: analyzeSection(benefits, 'benefits'),
          safetyAnalysis: analyzeSection(safety, 'safety'),
          mechanismsAnalysis: analyzeSection(mechanisms, 'mechanisms')
        };
      }, supplement.id);
      
      console.log(`   Data Structure:`);
      console.log(`     Benefits: ${dataAnalysis.benefitsCount} items`);
      console.log(`     Safety: ${dataAnalysis.safetyCount} items`);
      console.log(`     Mechanisms: ${dataAnalysis.mechanismsCount} items`);
      
      // Analyze each section for issues
      const analyzeIssues = (analysis, sectionName) => {
        console.log(`\n   ${sectionName.toUpperCase()} Analysis:`);
        analysis.forEach(item => {
          console.log(`     Item ${item.index + 1}:`);
          console.log(`       Claim: "${item.claimValue}"`);
          console.log(`       Studies: ${item.hasStudies} (${item.studiesType}, array: ${item.studiesIsArray}, length: ${item.studiesLength})`);
          console.log(`       Evidence: ${item.hasEvidence}`);
          
          if (!item.studiesIsArray && item.studiesValue !== undefined) {
            console.log(`       ❌ ISSUE: Studies is not an array: ${JSON.stringify(item.studiesValue)}`);
          }
          if (item.studiesLength === 0) {
            console.log(`       ⚠️ WARNING: No studies data`);
          }
        });
      };
      
      analyzeIssues(dataAnalysis.benefitsAnalysis, 'benefits');
      analyzeIssues(dataAnalysis.safetyAnalysis, 'safety');
      analyzeIssues(dataAnalysis.mechanismsAnalysis, 'mechanisms');
      
      // Test direct rendering
      console.log(`\n   🔧 Testing Direct Rendering:`);
      
      const renderingTest = await page.evaluate((suppId) => {
        const renderer = window.CitationRenderer;
        const data = window.enhancedCitations?.[suppId];
        
        if (!renderer || !data) return { error: 'Missing renderer or data' };
        
        const benefits = data.citations?.benefits || [];
        const safety = data.citations?.safety || [];
        const mechanisms = data.citations?.mechanisms || [];
        
        const testSection = (items, sectionName, renderMethod) => {
          return items.map((item, index) => {
            try {
              const card = renderMethod(item);
              return {
                index: index,
                success: true,
                length: card.length,
                hasPMID: card.includes('PMID'),
                hasUndefined: card.includes('undefined'),
                preview: card.substring(0, 200)
              };
            } catch (e) {
              return {
                index: index,
                success: false,
                error: e.message
              };
            }
          });
        };
        
        return {
          benefits: testSection(benefits, 'benefits', renderer.renderBenefitCard.bind(renderer)),
          safety: testSection(safety, 'safety', renderer.renderSafetyCard.bind(renderer)),
          mechanisms: testSection(mechanisms, 'mechanisms', renderer.renderMechanismCard.bind(renderer))
        };
      }, supplement.id);
      
      ['benefits', 'safety', 'mechanisms'].forEach(section => {
        const results = renderingTest[section];
        const successCount = results.filter(r => r.success).length;
        console.log(`     ${section}: ${successCount}/${results.length} successful`);
        
        results.forEach(result => {
          if (!result.success) {
            console.log(`       Item ${result.index + 1}: ❌ ${result.error}`);
          } else if (result.length < 500) {
            console.log(`       Item ${result.index + 1}: ⚠️ Short content (${result.length} chars)`);
          }
        });
      });
      
      analysisResults.push({
        id: supplement.id,
        name: supplement.name,
        dataAnalysis: dataAnalysis,
        renderingTest: renderingTest
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🔍 STRUCTURAL ISSUES ANALYSIS SUMMARY');
    console.log('='.repeat(70));
    
    analysisResults.forEach(result => {
      console.log(`\n${result.name} (ID: ${result.id}):`);
      
      // Identify specific issues
      const issues = [];
      
      ['benefitsAnalysis', 'safetyAnalysis', 'mechanismsAnalysis'].forEach(section => {
        const analysis = result.dataAnalysis[section];
        analysis.forEach(item => {
          if (!item.studiesIsArray && item.studiesValue !== undefined) {
            issues.push(`${section}: Item ${item.index + 1} has non-array studies (${item.studiesType})`);
          }
          if (item.studiesLength === 0 && item.hasEvidence) {
            issues.push(`${section}: Item ${item.index + 1} has evidence but no studies array`);
          }
        });
      });
      
      if (issues.length > 0) {
        console.log(`   Issues Found:`);
        issues.forEach(issue => console.log(`     • ${issue}`));
      } else {
        console.log(`   ✅ No structural issues found`);
      }
    });
    
    console.log(`\n🔧 RECOMMENDED FIXES:`);
    console.log(`1. Apply array validation fixes to all card renderers`);
    console.log(`2. Ensure data normalization handles non-array evidence fields`);
    console.log(`3. Add fallback handling for missing studies data`);
    console.log(`4. Test fixes with before/after validation`);
    
    return analysisResults;
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Structural issues analysis complete');
  }
})();
