const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Studies Array');
  console.log('Checking if studies data is properly structured...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check raw data structure for Panax Ginseng
    const dataCheck = await page.evaluate(() => {
      const data = window.enhancedCitations?.[15];
      if (!data) return { error: 'No data found' };
      
      const sampleBenefit = data.citations?.benefits?.[0];
      const sampleSafety = data.citations?.safety?.[0];
      const sampleMechanism = data.citations?.mechanisms?.[0];
      
      return {
        benefitStructure: {
          exists: !!sampleBenefit,
          claim: sampleBenefit?.claim,
          hasStudies: !!sampleBenefit?.studies,
          studiesLength: sampleBenefit?.studies?.length || 0,
          studiesArray: sampleBenefit?.studies || [],
          sampleStudy: sampleBenefit?.studies?.[0] || null
        },
        safetyStructure: {
          exists: !!sampleSafety,
          claim: sampleSafety?.claim,
          hasStudies: !!sampleSafety?.studies,
          studiesLength: sampleSafety?.studies?.length || 0,
          studiesArray: sampleSafety?.studies || [],
          sampleStudy: sampleSafety?.studies?.[0] || null
        },
        mechanismStructure: {
          exists: !!sampleMechanism,
          claim: sampleMechanism?.claim,
          hasStudies: !!sampleMechanism?.studies,
          studiesLength: sampleMechanism?.studies?.length || 0,
          studiesArray: sampleMechanism?.studies || [],
          sampleStudy: sampleMechanism?.studies?.[0] || null
        }
      };
    });
    
    console.log('\n📊 Data Structure Analysis:');
    
    console.log('\n📋 Benefits Structure:');
    console.log(`   Exists: ${dataCheck.benefitStructure.exists}`);
    console.log(`   Claim: "${dataCheck.benefitStructure.claim}"`);
    console.log(`   Has Studies: ${dataCheck.benefitStructure.hasStudies}`);
    console.log(`   Studies Length: ${dataCheck.benefitStructure.studiesLength}`);
    if (dataCheck.benefitStructure.sampleStudy) {
      console.log(`   Sample Study:`);
      console.log(`     Title: "${dataCheck.benefitStructure.sampleStudy.title}"`);
      console.log(`     Authors: ${JSON.stringify(dataCheck.benefitStructure.sampleStudy.authors)}`);
      console.log(`     Year: ${dataCheck.benefitStructure.sampleStudy.year}`);
      console.log(`     Journal: "${dataCheck.benefitStructure.sampleStudy.journal}"`);
      console.log(`     PMID: "${dataCheck.benefitStructure.sampleStudy.pmid}"`);
      console.log(`     DOI: "${dataCheck.benefitStructure.sampleStudy.doi}"`);
      console.log(`     Findings: "${dataCheck.benefitStructure.sampleStudy.findings}"`);
    }
    
    console.log('\n🛡️ Safety Structure:');
    console.log(`   Exists: ${dataCheck.safetyStructure.exists}`);
    console.log(`   Claim: "${dataCheck.safetyStructure.claim}"`);
    console.log(`   Has Studies: ${dataCheck.safetyStructure.hasStudies}`);
    console.log(`   Studies Length: ${dataCheck.safetyStructure.studiesLength}`);
    if (dataCheck.safetyStructure.sampleStudy) {
      console.log(`   Sample Study:`);
      console.log(`     Title: "${dataCheck.safetyStructure.sampleStudy.title}"`);
      console.log(`     Authors: ${JSON.stringify(dataCheck.safetyStructure.sampleStudy.authors)}`);
      console.log(`     Year: ${dataCheck.safetyStructure.sampleStudy.year}`);
      console.log(`     Journal: "${dataCheck.safetyStructure.sampleStudy.journal}"`);
      console.log(`     PMID: "${dataCheck.safetyStructure.sampleStudy.pmid}"`);
      console.log(`     DOI: "${dataCheck.safetyStructure.sampleStudy.doi}"`);
      console.log(`     Findings: "${dataCheck.safetyStructure.sampleStudy.findings}"`);
    }
    
    console.log('\n⚙️ Mechanism Structure:');
    console.log(`   Exists: ${dataCheck.mechanismStructure.exists}`);
    console.log(`   Claim: "${dataCheck.mechanismStructure.claim}"`);
    console.log(`   Has Studies: ${dataCheck.mechanismStructure.hasStudies}`);
    console.log(`   Studies Length: ${dataCheck.mechanismStructure.studiesLength}`);
    if (dataCheck.mechanismStructure.sampleStudy) {
      console.log(`   Sample Study:`);
      console.log(`     Title: "${dataCheck.mechanismStructure.sampleStudy.title}"`);
      console.log(`     Authors: ${JSON.stringify(dataCheck.mechanismStructure.sampleStudy.authors)}`);
      console.log(`     Year: ${dataCheck.mechanismStructure.sampleStudy.year}`);
      console.log(`     Journal: "${dataCheck.mechanismStructure.sampleStudy.journal}"`);
      console.log(`     PMID: "${dataCheck.mechanismStructure.sampleStudy.pmid}"`);
      console.log(`     DOI: "${dataCheck.mechanismStructure.sampleStudy.doi}"`);
      console.log(`     Findings: "${dataCheck.mechanismStructure.sampleStudy.findings}"`);
    }
    
    // Test manual rendering
    console.log('\n🔧 Manual Rendering Test:');
    
    const renderTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      if (!renderer) return { error: 'No renderer found' };
      
      const data = window.enhancedCitations?.[15];
      const sampleBenefit = data?.citations?.benefits?.[0];
      const sampleStudy = sampleBenefit?.studies?.[0];
      
      if (!sampleStudy) return { error: 'No study found' };
      
      try {
        const studyCard = renderer._renderStudyCard(sampleStudy, 'green');
        return {
          success: true,
          studyCard: studyCard,
          studyData: sampleStudy
        };
      } catch (e) {
        return { error: e.message, studyData: sampleStudy };
      }
    });
    
    if (renderTest.success) {
      console.log(`   ✅ Manual study card rendering works!`);
      console.log(`   Study Card Length: ${renderTest.studyCard.length} chars`);
      console.log(`   Contains PMID: ${renderTest.studyCard.includes('PMID')}`);
      console.log(`   Contains DOI: ${renderTest.studyCard.includes('DOI')}`);
      console.log(`   Contains Findings: ${renderTest.studyCard.includes('Findings')}`);
    } else {
      console.log(`   ❌ Manual rendering failed: ${renderTest.error}`);
      if (renderTest.studyData) {
        console.log(`   Study Data: ${JSON.stringify(renderTest.studyData, null, 2)}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 STUDIES ARRAY DIAGNOSIS');
    console.log('='.repeat(60));
    
    const benefitsHaveStudies = dataCheck.benefitStructure.studiesLength > 0;
    const safetyHaveStudies = dataCheck.safetyStructure.studiesLength > 0;
    const mechanismsHaveStudies = dataCheck.mechanismStructure.studiesLength > 0;
    
    console.log(`\n📊 Studies Data Status:`);
    console.log(`   Benefits have studies: ${benefitsHaveStudies ? '✅ Yes' : '❌ No'} (${dataCheck.benefitStructure.studiesLength})`);
    console.log(`   Safety have studies: ${safetyHaveStudies ? '✅ Yes' : '❌ No'} (${dataCheck.safetyStructure.studiesLength})`);
    console.log(`   Mechanisms have studies: ${mechanismsHaveStudies ? '✅ Yes' : '❌ No'} (${dataCheck.mechanismStructure.studiesLength})`);
    
    if (benefitsHaveStudies && safetyHaveStudies && mechanismsHaveStudies) {
      console.log(`\n✅ ALL DATA IS PRESENT:`);
      console.log(`   The studies arrays exist and contain data.`);
      console.log(`   The issue must be in the rendering pipeline.`);
    } else {
      console.log(`\n❌ MISSING STUDIES DATA:`);
      console.log(`   Some citation types are missing studies arrays.`);
      console.log(`   Need to check the enhanced citation file structure.`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Studies array debug complete');
  }
})();
