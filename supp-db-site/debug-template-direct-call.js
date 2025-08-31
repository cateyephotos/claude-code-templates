const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Template Direct Call');
  console.log('Testing template functions directly...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test direct template calls
    const templateTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[15];
      
      if (!renderer || !data) return { error: 'Missing renderer or data' };
      
      // Get the raw data
      const benefitsData = data.citations?.benefits || [];
      const safetyData = data.citations?.safety || [];
      const mechanismsData = data.citations?.mechanisms || [];
      
      console.log('Benefits data:', benefitsData.length, 'items');
      console.log('Safety data:', safetyData.length, 'items');
      console.log('Mechanisms data:', mechanismsData.length, 'items');
      
      // Test individual card rendering
      let benefitCardTest = null;
      let safetyCardTest = null;
      let mechanismCardTest = null;
      
      try {
        if (benefitsData[0]) {
          benefitCardTest = renderer.renderBenefitCard(benefitsData[0]);
          console.log('Benefit card test length:', benefitCardTest.length);
        }
        if (safetyData[0]) {
          safetyCardTest = renderer.renderSafetyCard(safetyData[0]);
          console.log('Safety card test length:', safetyCardTest.length);
        }
        if (mechanismsData[0]) {
          mechanismCardTest = renderer.renderMechanismCard(mechanismsData[0]);
          console.log('Mechanism card test length:', mechanismCardTest.length);
        }
      } catch (e) {
        console.error('Card rendering error:', e);
      }
      
      // Test template functions directly
      let benefitTemplate = null;
      let safetyTemplate = null;
      let mechanismTemplate = null;
      
      try {
        benefitTemplate = renderer._getTemplate('benefitSection');
        safetyTemplate = renderer._getTemplate('safetySection');
        mechanismTemplate = renderer._getTemplate('mechanismSection');
        
        console.log('Templates retrieved successfully');
      } catch (e) {
        console.error('Template retrieval error:', e);
      }
      
      // Test template execution
      let benefitTemplateResult = null;
      let safetyTemplateResult = null;
      let mechanismTemplateResult = null;
      
      try {
        if (benefitTemplate && benefitsData.length > 0) {
          const benefitTemplateData = {
            supplementId: 15,
            benefits: benefitsData.map(benefit => ({
              ...benefit,
              strengthColor: renderer._getStrengthColor(benefit.strength),
              hasMetaAnalysis: !!benefit.metaAnalysisSupport
            }))
          };
          benefitTemplateResult = benefitTemplate(benefitTemplateData);
          console.log('Benefit template result length:', benefitTemplateResult.length);
        }
        
        if (safetyTemplate && safetyData.length > 0) {
          const safetyTemplateData = {
            supplementId: 15,
            safety: safetyData.map(safetyItem => ({
              ...safetyItem,
              riskColor: renderer._getRiskColor(safetyItem.riskLevel)
            }))
          };
          safetyTemplateResult = safetyTemplate(safetyTemplateData);
          console.log('Safety template result length:', safetyTemplateResult.length);
        }
        
        if (mechanismTemplate && mechanismsData.length > 0) {
          const mechanismTemplateData = {
            supplementId: 15,
            mechanisms: mechanismsData.map(mechanism => ({
              ...mechanism,
              strengthColor: renderer._getStrengthColor(mechanism.strength),
              evidence: mechanism.studies || mechanism.evidence || []
            }))
          };
          mechanismTemplateResult = mechanismTemplate(mechanismTemplateData);
          console.log('Mechanism template result length:', mechanismTemplateResult.length);
        }
      } catch (e) {
        console.error('Template execution error:', e);
      }
      
      return {
        benefitsCount: benefitsData.length,
        safetyCount: safetyData.length,
        mechanismsCount: mechanismsData.length,
        benefitCardLength: benefitCardTest ? benefitCardTest.length : 0,
        safetyCardLength: safetyCardTest ? safetyCardTest.length : 0,
        mechanismCardLength: mechanismCardTest ? mechanismCardTest.length : 0,
        benefitTemplateLength: benefitTemplateResult ? benefitTemplateResult.length : 0,
        safetyTemplateLength: safetyTemplateResult ? safetyTemplateResult.length : 0,
        mechanismTemplateLength: mechanismTemplateResult ? mechanismTemplateResult.length : 0,
        benefitCardHasPMID: benefitCardTest ? benefitCardTest.includes('PMID') : false,
        safetyCardHasPMID: safetyCardTest ? safetyCardTest.includes('PMID') : false,
        mechanismCardHasPMID: mechanismCardTest ? mechanismCardTest.includes('PMID') : false,
        benefitTemplateHasPMID: benefitTemplateResult ? benefitTemplateResult.includes('PMID') : false,
        safetyTemplateHasPMID: safetyTemplateResult ? safetyTemplateResult.includes('PMID') : false,
        mechanismTemplateHasPMID: mechanismTemplateResult ? mechanismTemplateResult.includes('PMID') : false
      };
    });
    
    console.log('\n📊 Template Direct Call Results:');
    
    console.log('\n📋 Data Counts:');
    console.log(`   Benefits: ${templateTest.benefitsCount}`);
    console.log(`   Safety: ${templateTest.safetyCount}`);
    console.log(`   Mechanisms: ${templateTest.mechanismsCount}`);
    
    console.log('\n🔧 Individual Card Tests:');
    console.log(`   Benefit Card: ${templateTest.benefitCardLength} chars, PMID: ${templateTest.benefitCardHasPMID ? '✅' : '❌'}`);
    console.log(`   Safety Card: ${templateTest.safetyCardLength} chars, PMID: ${templateTest.safetyCardHasPMID ? '✅' : '❌'}`);
    console.log(`   Mechanism Card: ${templateTest.mechanismCardLength} chars, PMID: ${templateTest.mechanismCardHasPMID ? '✅' : '❌'}`);
    
    console.log('\n📄 Template Execution Tests:');
    console.log(`   Benefit Template: ${templateTest.benefitTemplateLength} chars, PMID: ${templateTest.benefitTemplateHasPMID ? '✅' : '❌'}`);
    console.log(`   Safety Template: ${templateTest.safetyTemplateLength} chars, PMID: ${templateTest.safetyTemplateHasPMID ? '✅' : '❌'}`);
    console.log(`   Mechanism Template: ${templateTest.mechanismTemplateLength} chars, PMID: ${templateTest.mechanismTemplateHasPMID ? '✅' : '❌'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 TEMPLATE DIRECT CALL DIAGNOSIS');
    console.log('='.repeat(60));
    
    const individualCardsWork = templateTest.benefitCardHasPMID && templateTest.safetyCardHasPMID && templateTest.mechanismCardHasPMID;
    const templatesWork = templateTest.benefitTemplateHasPMID && templateTest.safetyTemplateHasPMID && templateTest.mechanismTemplateHasPMID;
    
    if (individualCardsWork && templatesWork) {
      console.log(`\n🎉 EVERYTHING WORKS!`);
      console.log(`   Individual cards and templates both include PMID content.`);
      console.log(`   The issue must be in the main rendering pipeline.`);
    } else if (individualCardsWork && !templatesWork) {
      console.log(`\n❌ TEMPLATE EXECUTION ISSUE:`);
      console.log(`   Individual cards work but templates don't.`);
      console.log(`   The issue is in the template function execution.`);
    } else if (!individualCardsWork) {
      console.log(`\n❌ CARD RENDERING ISSUE:`);
      console.log(`   Individual cards are not working.`);
      console.log(`   The issue is in the card rendering methods.`);
    } else {
      console.log(`\n⚠️ MIXED RESULTS:`);
      console.log(`   Some components work, others don't.`);
    }
    
    if (templateTest.mechanismTemplateHasPMID && !templateTest.benefitTemplateHasPMID) {
      console.log(`\n🔍 SPECIFIC ISSUE:`);
      console.log(`   Mechanism templates work but benefit templates don't.`);
      console.log(`   The issue is in the benefit/safety template execution.`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Template direct call debug complete');
  }
})();
