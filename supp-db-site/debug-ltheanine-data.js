const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUGGING L-THEANINE DATA STRUCTURE');
  console.log('Analyzing the exact data structure issues...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Analyze L-Theanine data structure
    const dataAnalysis = await page.evaluate(() => {
      const lTheanineData = window.enhancedCitations?.[9]; // L-Theanine ID: 9
      
      if (!lTheanineData) return { error: 'No L-Theanine data found' };
      
      console.log('L-Theanine Raw Data:', lTheanineData);
      
      const benefits = lTheanineData.citations?.benefits || [];
      const safety = lTheanineData.citations?.safety || [];
      const mechanisms = lTheanineData.citations?.mechanisms || [];
      
      return {
        supplementId: 9,
        supplementName: 'L-Theanine',
        benefitsCount: benefits.length,
        safetyCount: safety.length,
        mechanismsCount: mechanisms.length,
        benefitsData: benefits.map((item, index) => ({
          index: index,
          claim: item.claim,
          studies: item.studies,
          evidence: item.evidence,
          studiesType: typeof item.studies,
          evidenceType: typeof item.evidence,
          studiesValue: item.studies,
          evidenceValue: item.evidence
        })),
        safetyData: safety.map((item, index) => ({
          index: index,
          claim: item.claim,
          studies: item.studies,
          evidence: item.evidence,
          studiesType: typeof item.studies,
          evidenceType: typeof item.evidence,
          studiesValue: item.studies,
          evidenceValue: item.evidence
        })),
        mechanismsData: mechanisms.map((item, index) => ({
          index: index,
          claim: item.claim,
          mechanism: item.mechanism,
          studies: item.studies,
          evidence: item.evidence,
          studiesType: typeof item.studies,
          evidenceType: typeof item.evidence,
          studiesValue: item.studies,
          evidenceValue: item.evidence
        }))
      };
    });
    
    console.log('\n📊 L-THEANINE DATA ANALYSIS:');
    console.log(`Benefits: ${dataAnalysis.benefitsCount} items`);
    console.log(`Safety: ${dataAnalysis.safetyCount} items`);
    console.log(`Mechanisms: ${dataAnalysis.mechanismsCount} items`);
    
    console.log('\n📋 BENEFITS DATA:');
    dataAnalysis.benefitsData.forEach(item => {
      console.log(`  Item ${item.index + 1}:`);
      console.log(`    Claim: "${item.claim}"`);
      console.log(`    Studies: ${item.studiesType} = ${JSON.stringify(item.studiesValue)}`);
      console.log(`    Evidence: ${item.evidenceType} = ${JSON.stringify(item.evidenceValue)}`);
      console.log('');
    });
    
    console.log('\n🛡️ SAFETY DATA:');
    dataAnalysis.safetyData.forEach(item => {
      console.log(`  Item ${item.index + 1}:`);
      console.log(`    Claim: "${item.claim}"`);
      console.log(`    Studies: ${item.studiesType} = ${JSON.stringify(item.studiesValue)}`);
      console.log(`    Evidence: ${item.evidenceType} = ${JSON.stringify(item.evidenceValue)}`);
      console.log('');
    });
    
    console.log('\n⚙️ MECHANISMS DATA:');
    dataAnalysis.mechanismsData.forEach(item => {
      console.log(`  Item ${item.index + 1}:`);
      console.log(`    Claim: "${item.claim}"`);
      console.log(`    Mechanism: "${item.mechanism}"`);
      console.log(`    Studies: ${item.studiesType} = ${JSON.stringify(item.studiesValue)}`);
      console.log(`    Evidence: ${item.evidenceType} = ${JSON.stringify(item.evidenceValue)}`);
      console.log('');
    });
    
    console.log('\n🔍 ISSUE IDENTIFICATION:');
    
    // Identify specific issues
    const issues = [];
    
    dataAnalysis.benefitsData.forEach((item, index) => {
      if (typeof item.studies === 'string') {
        issues.push(`Benefits item ${index + 1}: studies is string "${item.studies}"`);
      }
      if (typeof item.evidence === 'string') {
        issues.push(`Benefits item ${index + 1}: evidence is string "${item.evidence}"`);
      }
    });
    
    dataAnalysis.safetyData.forEach((item, index) => {
      if (typeof item.studies === 'string') {
        issues.push(`Safety item ${index + 1}: studies is string "${item.studies}"`);
      }
      if (typeof item.evidence === 'string') {
        issues.push(`Safety item ${index + 1}: evidence is string "${item.evidence}"`);
      }
    });
    
    dataAnalysis.mechanismsData.forEach((item, index) => {
      if (typeof item.studies === 'string') {
        issues.push(`Mechanisms item ${index + 1}: studies is string "${item.studies}"`);
      }
      if (typeof item.evidence === 'string') {
        issues.push(`Mechanisms item ${index + 1}: evidence is string "${item.evidence}"`);
      }
    });
    
    console.log(`Found ${issues.length} data structure issues:`);
    issues.forEach(issue => console.log(`  • ${issue}`));
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Convert string studies/evidence values to empty arrays');
    console.log('2. Add proper study objects with PMID, title, authors');
    console.log('3. Ensure evidence arrays contain study objects, not strings');
    
    return dataAnalysis;
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ L-Theanine data analysis complete');
  }
})();
