const { chromium } = require('playwright');

(async () => {
  console.log('🔧 Testing Direct Study Rendering');
  console.log('Testing if study cards can be rendered individually...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test direct study card rendering
    const directTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[15];
      
      if (!renderer || !data) return { error: 'Missing renderer or data' };
      
      const sampleBenefit = data.citations?.benefits?.[0];
      const sampleStudy = sampleBenefit?.studies?.[0];
      
      if (!sampleStudy) return { error: 'No study found' };
      
      // Test if public methods exist
      const hasRenderStudyCard = typeof renderer.renderStudyCard === 'function';
      const hasRenderBenefitCard = typeof renderer.renderBenefitCard === 'function';
      
      let studyCardResult = null;
      let benefitCardResult = null;
      let error = null;
      
      try {
        // Test direct study card rendering
        if (hasRenderStudyCard) {
          studyCardResult = renderer.renderStudyCard(sampleStudy, 'green');
        }
        
        // Test benefit card rendering
        if (hasRenderBenefitCard) {
          benefitCardResult = renderer.renderBenefitCard(sampleBenefit);
        }
        
      } catch (e) {
        error = e.message;
      }
      
      return {
        hasRenderStudyCard: hasRenderStudyCard,
        hasRenderBenefitCard: hasRenderBenefitCard,
        studyData: sampleStudy,
        benefitData: {
          claim: sampleBenefit.claim,
          studiesCount: sampleBenefit.studies?.length || 0
        },
        studyCardResult: studyCardResult,
        benefitCardResult: benefitCardResult,
        error: error,
        studyCardLength: studyCardResult ? studyCardResult.length : 0,
        benefitCardLength: benefitCardResult ? benefitCardResult.length : 0,
        benefitIncludesStudyTitle: benefitCardResult && sampleStudy ? benefitCardResult.includes(sampleStudy.title) : false
      };
    });
    
    console.log('\n📊 Direct Rendering Test Results:');
    console.log(`   Has renderStudyCard: ${directTest.hasRenderStudyCard}`);
    console.log(`   Has renderBenefitCard: ${directTest.hasRenderBenefitCard}`);
    console.log(`   Error: ${directTest.error || 'None'}`);
    
    if (directTest.studyData) {
      console.log(`\n📚 Study Data:`);
      console.log(`   Title: "${directTest.studyData.title}"`);
      console.log(`   Authors: ${JSON.stringify(directTest.studyData.authors)}`);
      console.log(`   Year: ${directTest.studyData.year}`);
      console.log(`   PMID: "${directTest.studyData.pmid}"`);
      console.log(`   DOI: "${directTest.studyData.doi}"`);
    }
    
    if (directTest.benefitData) {
      console.log(`\n📋 Benefit Data:`);
      console.log(`   Claim: "${directTest.benefitData.claim}"`);
      console.log(`   Studies Count: ${directTest.benefitData.studiesCount}`);
    }
    
    console.log(`\n🔧 Rendering Results:`);
    console.log(`   Study Card Length: ${directTest.studyCardLength} chars`);
    console.log(`   Benefit Card Length: ${directTest.benefitCardLength} chars`);
    console.log(`   Benefit Includes Study Title: ${directTest.benefitIncludesStudyTitle}`);
    
    if (directTest.studyCardResult) {
      console.log(`\n✅ Study Card Content Check:`);
      console.log(`   Contains PMID: ${directTest.studyCardResult.includes('PMID')}`);
      console.log(`   Contains DOI: ${directTest.studyCardResult.includes('DOI')}`);
      console.log(`   Contains Authors: ${directTest.studyCardResult.includes('Authors')}`);
      console.log(`   Contains Findings: ${directTest.studyCardResult.includes('Findings')}`);
      console.log(`   Contains Year: ${directTest.studyCardResult.includes(directTest.studyData.year)}`);
      
      if (directTest.studyCardResult.length > 200) {
        console.log(`   ✅ Study card rendering works!`);
        console.log(`   Preview: ${directTest.studyCardResult.substring(0, 200)}...`);
      } else {
        console.log(`   ❌ Study card too short`);
      }
    }
    
    if (directTest.benefitCardResult) {
      console.log(`\n📋 Benefit Card Content Check:`);
      if (directTest.benefitIncludesStudyTitle) {
        console.log(`   ✅ Benefit card includes study information!`);
      } else {
        console.log(`   ❌ Benefit card missing study information`);
        console.log(`   Preview: ${directTest.benefitCardResult.substring(0, 300)}...`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔧 DIRECT RENDERING DIAGNOSIS');
    console.log('='.repeat(60));
    
    if (directTest.studyCardLength > 200 && directTest.benefitIncludesStudyTitle) {
      console.log(`\n🎉 RENDERING COMPLETELY FIXED!`);
      console.log(`   Both study cards and benefit cards are working.`);
      console.log(`   The issue was with method accessibility.`);
    } else if (directTest.studyCardLength > 200) {
      console.log(`\n⚠️ PARTIAL SUCCESS:`);
      console.log(`   Study cards work individually.`);
      console.log(`   But benefit cards are not including study details.`);
      console.log(`   Check the studies.map() call in renderBenefitCard.`);
    } else {
      console.log(`\n❌ STILL BROKEN:`);
      console.log(`   Study cards are not rendering properly.`);
      console.log(`   Error: ${directTest.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Direct study rendering test complete');
  }
})();
