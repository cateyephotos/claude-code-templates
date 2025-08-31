const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Benefit Card Rendering');
  console.log('Testing why study cards are not appearing in benefits...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test the renderBenefitCard method step by step
    const stepByStepTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[15];
      
      if (!renderer || !data) return { error: 'Missing renderer or data' };
      
      const sampleBenefit = data.citations?.benefits?.[0];
      if (!sampleBenefit) return { error: 'No benefit found' };
      
      // Step 1: Check the benefit data
      const benefitData = {
        claim: sampleBenefit.claim,
        studies: sampleBenefit.studies,
        studiesCount: sampleBenefit.studies?.length || 0,
        firstStudy: sampleBenefit.studies?.[0] || null
      };
      
      // Step 2: Test renderStudyCard individually
      let studyCardTest = null;
      let studyCardError = null;
      
      try {
        if (benefitData.firstStudy) {
          studyCardTest = renderer.renderStudyCard(benefitData.firstStudy, 'green');
        }
      } catch (e) {
        studyCardError = e.message;
      }
      
      // Step 3: Test the studies.map() call
      let studyCardsArray = null;
      let studyCardsError = null;
      
      try {
        if (sampleBenefit.studies) {
          studyCardsArray = sampleBenefit.studies.map(study => renderer.renderStudyCard(study, 'green'));
        }
      } catch (e) {
        studyCardsError = e.message;
      }
      
      // Step 4: Test the full renderBenefitCard
      let fullBenefitCard = null;
      let fullBenefitError = null;
      
      try {
        fullBenefitCard = renderer.renderBenefitCard(sampleBenefit);
      } catch (e) {
        fullBenefitError = e.message;
      }
      
      return {
        benefitData: benefitData,
        studyCardTest: studyCardTest,
        studyCardError: studyCardError,
        studyCardsArray: studyCardsArray,
        studyCardsError: studyCardsError,
        fullBenefitCard: fullBenefitCard,
        fullBenefitError: fullBenefitError,
        studyCardLength: studyCardTest ? studyCardTest.length : 0,
        studyCardsArrayLength: studyCardsArray ? studyCardsArray.length : 0,
        fullBenefitCardLength: fullBenefitCard ? fullBenefitCard.length : 0,
        fullBenefitIncludesStudy: fullBenefitCard && benefitData.firstStudy ? 
          fullBenefitCard.includes(benefitData.firstStudy.title) : false
      };
    });
    
    console.log('\n📊 Step-by-Step Benefit Card Test:');
    
    console.log('\n1️⃣ Benefit Data:');
    console.log(`   Claim: "${stepByStepTest.benefitData?.claim}"`);
    console.log(`   Studies Count: ${stepByStepTest.benefitData?.studiesCount}`);
    if (stepByStepTest.benefitData?.firstStudy) {
      console.log(`   First Study Title: "${stepByStepTest.benefitData.firstStudy.title}"`);
      console.log(`   First Study PMID: "${stepByStepTest.benefitData.firstStudy.pmid}"`);
    }
    
    console.log('\n2️⃣ Individual Study Card Test:');
    console.log(`   Study Card Length: ${stepByStepTest.studyCardLength} chars`);
    console.log(`   Study Card Error: ${stepByStepTest.studyCardError || 'None'}`);
    if (stepByStepTest.studyCardTest) {
      console.log(`   Study Card Contains PMID: ${stepByStepTest.studyCardTest.includes('PMID')}`);
      console.log(`   Study Card Contains DOI: ${stepByStepTest.studyCardTest.includes('DOI')}`);
    }
    
    console.log('\n3️⃣ Studies Array Map Test:');
    console.log(`   Studies Array Length: ${stepByStepTest.studyCardsArrayLength}`);
    console.log(`   Studies Array Error: ${stepByStepTest.studyCardsError || 'None'}`);
    if (stepByStepTest.studyCardsArray) {
      const totalLength = stepByStepTest.studyCardsArray.reduce((sum, card) => sum + card.length, 0);
      console.log(`   Total Study Cards Length: ${totalLength} chars`);
    }
    
    console.log('\n4️⃣ Full Benefit Card Test:');
    console.log(`   Full Benefit Card Length: ${stepByStepTest.fullBenefitCardLength} chars`);
    console.log(`   Full Benefit Card Error: ${stepByStepTest.fullBenefitError || 'None'}`);
    console.log(`   Full Benefit Includes Study: ${stepByStepTest.fullBenefitIncludesStudy}`);
    
    if (stepByStepTest.fullBenefitCard) {
      console.log(`   Full Benefit Contains PMID: ${stepByStepTest.fullBenefitCard.includes('PMID')}`);
      console.log(`   Full Benefit Contains DOI: ${stepByStepTest.fullBenefitCard.includes('DOI')}`);
      console.log(`   Full Benefit Contains Findings: ${stepByStepTest.fullBenefitCard.includes('Findings')}`);
    }
    
    // Test the same for mechanisms to compare
    console.log('\n🔄 Comparison with Mechanisms:');
    
    const mechanismComparison = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[15];
      
      const sampleMechanism = data?.citations?.mechanisms?.[0];
      if (!sampleMechanism) return { error: 'No mechanism found' };
      
      let mechanismCard = null;
      let mechanismError = null;
      
      try {
        mechanismCard = renderer.renderMechanismCard(sampleMechanism);
      } catch (e) {
        mechanismError = e.message;
      }
      
      return {
        mechanismCard: mechanismCard,
        mechanismError: mechanismError,
        mechanismLength: mechanismCard ? mechanismCard.length : 0,
        mechanismIncludesStudy: mechanismCard && sampleMechanism.studies?.[0] ? 
          mechanismCard.includes(sampleMechanism.studies[0].title) : false,
        mechanismContainsPMID: mechanismCard ? mechanismCard.includes('PMID') : false
      };
    });
    
    console.log(`   Mechanism Card Length: ${mechanismComparison.mechanismLength} chars`);
    console.log(`   Mechanism Card Error: ${mechanismComparison.mechanismError || 'None'}`);
    console.log(`   Mechanism Includes Study: ${mechanismComparison.mechanismIncludesStudy}`);
    console.log(`   Mechanism Contains PMID: ${mechanismComparison.mechanismContainsPMID}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 BENEFIT CARD RENDERING DIAGNOSIS');
    console.log('='.repeat(60));
    
    if (stepByStepTest.studyCardLength > 100 && stepByStepTest.fullBenefitCardLength < 1000) {
      console.log(`\n❌ STUDY CARDS NOT BEING INCLUDED:`);
      console.log(`   Individual study cards work (${stepByStepTest.studyCardLength} chars).`);
      console.log(`   But full benefit card is short (${stepByStepTest.fullBenefitCardLength} chars).`);
      console.log(`   The study cards are not being included in the benefit card.`);
    } else if (stepByStepTest.studyCardError) {
      console.log(`\n❌ STUDY CARD RENDERING BROKEN:`);
      console.log(`   Individual study cards cannot be rendered.`);
      console.log(`   Error: ${stepByStepTest.studyCardError}`);
    } else if (stepByStepTest.fullBenefitError) {
      console.log(`\n❌ BENEFIT CARD RENDERING BROKEN:`);
      console.log(`   Full benefit card cannot be rendered.`);
      console.log(`   Error: ${stepByStepTest.fullBenefitError}`);
    } else if (stepByStepTest.fullBenefitIncludesStudy) {
      console.log(`\n✅ BENEFIT CARD RENDERING WORKS:`);
      console.log(`   Full benefit card includes study information.`);
      console.log(`   The issue might be elsewhere.`);
    } else {
      console.log(`\n⚠️ UNKNOWN ISSUE:`);
      console.log(`   Study cards work but are not included in benefit cards.`);
      console.log(`   Need to check the template string execution.`);
    }
    
    if (stepByStepTest.fullBenefitCard && stepByStepTest.fullBenefitCardLength < 1000) {
      console.log(`\n📄 Benefit Card Preview:`);
      console.log(stepByStepTest.fullBenefitCard.substring(0, 500) + '...');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Benefit card rendering debug complete');
  }
})();
