const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUGGING TURMERIC/CURCUMIN ISSUE');
  console.log('Investigating why Benefits tab shows undefined values...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check Turmeric data structure
    const dataAnalysis = await page.evaluate(() => {
      const enhancedCitations = window.enhancedCitations?.[2]; // Turmeric ID: 2
      
      if (!enhancedCitations) return { error: 'No enhanced citations found' };
      
      const benefits = enhancedCitations.citations?.benefits || [];
      const safety = enhancedCitations.citations?.safety || [];
      const mechanisms = enhancedCitations.citations?.mechanisms || [];
      
      return {
        benefitsCount: benefits.length,
        safetyCount: safety.length,
        mechanismsCount: mechanisms.length,
        firstBenefit: benefits[0] || null,
        firstSafety: safety[0] || null,
        firstMechanism: mechanisms[0] || null,
        benefitsStructure: benefits.map(b => ({
          hasClaim: !!b.claim,
          hasSpecificClaim: !!b.specificClaim,
          hasStudies: !!b.studies,
          hasEvidence: !!b.evidence,
          studiesLength: b.studies?.length || 0,
          evidenceLength: b.evidence?.length || 0,
          claim: b.claim,
          specificClaim: b.specificClaim
        }))
      };
    });
    
    console.log('\n📊 Turmeric Data Structure Analysis:');
    console.log(`   Benefits: ${dataAnalysis.benefitsCount}`);
    console.log(`   Safety: ${dataAnalysis.safetyCount}`);
    console.log(`   Mechanisms: ${dataAnalysis.mechanismsCount}`);
    
    if (dataAnalysis.firstBenefit) {
      console.log('\n📋 First Benefit Structure:');
      console.log(`   Claim: "${dataAnalysis.firstBenefit.claim}"`);
      console.log(`   Specific Claim: "${dataAnalysis.firstBenefit.specificClaim}"`);
      console.log(`   Has Studies: ${!!dataAnalysis.firstBenefit.studies}`);
      console.log(`   Has Evidence: ${!!dataAnalysis.firstBenefit.evidence}`);
      console.log(`   Studies Length: ${dataAnalysis.firstBenefit.studies?.length || 0}`);
      console.log(`   Evidence Length: ${dataAnalysis.firstBenefit.evidence?.length || 0}`);
    }
    
    console.log('\n📋 All Benefits Structure:');
    dataAnalysis.benefitsStructure.forEach((benefit, index) => {
      console.log(`   Benefit ${index + 1}:`);
      console.log(`     Claim: ${benefit.hasClaim} ("${benefit.claim}")`);
      console.log(`     Studies: ${benefit.hasStudies} (${benefit.studiesLength})`);
      console.log(`     Evidence: ${benefit.hasEvidence} (${benefit.evidenceLength})`);
    });
    
    // Test direct rendering
    console.log('\n🔧 Testing Direct Rendering...');
    
    const renderingTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[2];
      
      if (!renderer || !data) return { error: 'Missing renderer or data' };
      
      const benefits = data.citations?.benefits || [];
      
      let renderResults = [];
      let errors = [];
      
      benefits.forEach((benefit, index) => {
        try {
          const card = renderer.renderBenefitCard(benefit);
          renderResults.push({
            index: index,
            cardLength: card.length,
            hasPMID: card.includes('PMID'),
            hasUndefined: card.includes('undefined'),
            cardPreview: card.substring(0, 300)
          });
        } catch (e) {
          errors.push({
            index: index,
            error: e.message
          });
        }
      });
      
      return {
        renderResults: renderResults,
        errors: errors
      };
    });
    
    console.log('\n🔧 Direct Rendering Results:');
    if (renderingTest.renderResults) {
      renderingTest.renderResults.forEach(result => {
        console.log(`   Benefit ${result.index + 1}:`);
        console.log(`     Card Length: ${result.cardLength} chars`);
        console.log(`     Has PMID: ${result.hasPMID}`);
        console.log(`     Has Undefined: ${result.hasUndefined ? '❌' : '✅'}`);
        if (result.hasUndefined) {
          console.log(`     Preview: ${result.cardPreview}...`);
        }
      });
    }
    
    if (renderingTest.errors.length > 0) {
      console.log('\n❌ Rendering Errors:');
      renderingTest.errors.forEach(error => {
        console.log(`   Benefit ${error.index + 1}: ${error.error}`);
      });
    }
    
    // Test in browser DOM
    console.log('\n🌐 Testing in Browser DOM...');
    
    await page.fill('#searchInput', 'Turmeric');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(2);
    });
    await page.waitForTimeout(2000);
    
    // Click Benefits tab
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(1000);
    
    const domAnalysis = await page.evaluate(() => {
      const container = document.getElementById('benefits-2');
      if (!container) return { error: 'Container not found' };
      
      const innerHTML = container.innerHTML;
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      
      return {
        htmlLength: innerHTML.length,
        cardCount: cards.length,
        hasUndefined: innerHTML.includes('undefined'),
        undefinedCount: (innerHTML.match(/undefined/g) || []).length,
        innerHTML: innerHTML.substring(0, 1000),
        cardPreviews: cards.map((card, index) => ({
          index: index,
          hasUndefined: card.innerHTML.includes('undefined'),
          preview: card.textContent.substring(0, 200)
        }))
      };
    });
    
    console.log(`   HTML Length: ${domAnalysis.htmlLength} chars`);
    console.log(`   Card Count: ${domAnalysis.cardCount}`);
    console.log(`   Has Undefined: ${domAnalysis.hasUndefined ? '❌' : '✅'}`);
    console.log(`   Undefined Count: ${domAnalysis.undefinedCount}`);
    
    if (domAnalysis.hasUndefined) {
      console.log('\n❌ Cards with Undefined Values:');
      domAnalysis.cardPreviews.forEach(card => {
        if (card.hasUndefined) {
          console.log(`   Card ${card.index + 1}: ${card.preview}...`);
        }
      });
      
      console.log('\n📄 HTML Preview with Undefined:');
      console.log(domAnalysis.innerHTML.substring(0, 500) + '...');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 TURMERIC ISSUE DIAGNOSIS');
    console.log('='.repeat(60));
    
    const hasDataIssue = dataAnalysis.benefitsStructure.some(b => !b.hasClaim);
    const hasRenderingIssue = renderingTest.renderResults?.some(r => r.hasUndefined);
    const hasDOMIssue = domAnalysis.hasUndefined;
    
    if (hasDataIssue) {
      console.log(`\n❌ DATA STRUCTURE ISSUE:`);
      console.log(`   Some benefits are missing 'claim' field.`);
      console.log(`   Need to fix the enhanced citation data structure.`);
    }
    
    if (hasRenderingIssue) {
      console.log(`\n❌ RENDERING ISSUE:`);
      console.log(`   Direct rendering produces 'undefined' values.`);
      console.log(`   Need to fix the renderBenefitCard method.`);
    }
    
    if (hasDOMIssue) {
      console.log(`\n❌ DOM ISSUE:`);
      console.log(`   Browser DOM contains 'undefined' values.`);
      console.log(`   The issue is reaching the final output.`);
    }
    
    if (!hasDataIssue && !hasRenderingIssue && !hasDOMIssue) {
      console.log(`\n✅ NO ISSUES FOUND:`);
      console.log(`   Turmeric data and rendering appear to be working correctly.`);
      console.log(`   The issue might have been resolved.`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Turmeric issue debug complete');
  }
})();
