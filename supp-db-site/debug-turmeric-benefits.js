const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUGGING TURMERIC BENEFITS TAB');
  console.log('Analyzing undefined values in Benefits tab...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Analyze Turmeric data structure
    const dataAnalysis = await page.evaluate(() => {
      const turmericData = window.enhancedCitations?.[2]; // Turmeric ID: 2
      
      if (!turmericData) return { error: 'No Turmeric data found' };
      
      console.log('Turmeric Raw Data:', turmericData);
      
      const benefits = turmericData.citations?.benefits || [];
      
      return {
        supplementId: 2,
        supplementName: 'Turmeric/Curcumin',
        benefitsCount: benefits.length,
        benefitsData: benefits.map((item, index) => ({
          index: index,
          claim: item.claim,
          specificClaim: item.specificClaim,
          healthDomain: item.healthDomain,
          studies: item.studies,
          evidence: item.evidence,
          claimType: typeof item.claim,
          specificClaimType: typeof item.specificClaim,
          studiesType: typeof item.studies,
          evidenceType: typeof item.evidence,
          rawItem: item
        }))
      };
    });
    
    console.log('\n📊 TURMERIC BENEFITS DATA ANALYSIS:');
    console.log(`Benefits Count: ${dataAnalysis.benefitsCount} items`);
    
    console.log('\n📋 BENEFITS ITEMS:');
    dataAnalysis.benefitsData.forEach(item => {
      console.log(`\nItem ${item.index + 1}:`);
      console.log(`  Claim: ${item.claimType} = "${item.claim}"`);
      console.log(`  SpecificClaim: ${item.specificClaimType} = "${item.specificClaim}"`);
      console.log(`  HealthDomain: "${item.healthDomain}"`);
      console.log(`  Studies: ${item.studiesType} = ${Array.isArray(item.studies) ? `[${item.studies.length} items]` : item.studies}`);
      console.log(`  Evidence: ${item.evidenceType} = ${Array.isArray(item.evidence) ? `[${item.evidence.length} items]` : item.evidence}`);
    });
    
    // Test direct rendering
    console.log('\n🔧 TESTING DIRECT RENDERING:');
    
    const renderingTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[2];
      
      if (!renderer || !data) return { error: 'Missing renderer or data' };
      
      const benefits = data.citations?.benefits || [];
      
      return benefits.map((item, index) => {
        try {
          const card = renderer.renderBenefitCard(item);
          return {
            index: index,
            success: true,
            length: card.length,
            hasPMID: card.includes('PMID'),
            hasUndefined: card.includes('undefined'),
            undefinedCount: (card.match(/undefined/g) || []).length,
            preview: card.substring(0, 300)
          };
        } catch (e) {
          return {
            index: index,
            success: false,
            error: e.message
          };
        }
      });
    });
    
    console.log('\n🎨 RENDERING RESULTS:');
    renderingTest.forEach(result => {
      console.log(`\nItem ${result.index + 1}:`);
      if (result.success) {
        console.log(`  Success: ✅ (${result.length} chars)`);
        console.log(`  Has PMID: ${result.hasPMID ? '✅' : '❌'}`);
        console.log(`  Has Undefined: ${result.hasUndefined ? '❌' : '✅'} (${result.undefinedCount} occurrences)`);
        if (result.hasUndefined) {
          console.log(`  Preview: ${result.preview}...`);
        }
      } else {
        console.log(`  Success: ❌ Error: ${result.error}`);
      }
    });
    
    console.log('\n🔍 ISSUE IDENTIFICATION:');
    
    const issues = [];
    
    dataAnalysis.benefitsData.forEach((item, index) => {
      if (item.claim === undefined || item.claim === null) {
        issues.push(`Item ${index + 1}: claim is ${item.claim}`);
      }
      if (item.specificClaim === undefined || item.specificClaim === null) {
        issues.push(`Item ${index + 1}: specificClaim is ${item.specificClaim}`);
      }
      if (typeof item.claim === 'string' && item.claim.includes('undefined')) {
        issues.push(`Item ${index + 1}: claim contains "undefined" string`);
      }
    });
    
    console.log(`Found ${issues.length} data issues:`);
    issues.forEach(issue => console.log(`  • ${issue}`));
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Check enhanced citation file for missing or null claim fields');
    console.log('2. Ensure all benefits items have proper claim or specificClaim values');
    console.log('3. Fix any "undefined" string values in the data');
    
    return dataAnalysis;
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Turmeric benefits debug complete');
  }
})();
