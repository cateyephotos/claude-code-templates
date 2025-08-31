const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Study Card Rendering');
  console.log('Testing individual study card rendering...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test individual study card rendering
    const studyCardTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      if (!renderer) return { error: 'No renderer found' };
      
      const data = window.enhancedCitations?.[15];
      const sampleBenefit = data?.citations?.benefits?.[0];
      const sampleStudy = sampleBenefit?.studies?.[0];
      
      if (!sampleStudy) return { error: 'No study found' };
      
      // Test if _renderStudyCard method exists and is accessible
      const hasMethod = typeof renderer._renderStudyCard === 'function';
      
      let studyCardHTML = null;
      let benefitCardHTML = null;
      let error = null;
      
      try {
        // Try to call _renderStudyCard directly
        if (hasMethod) {
          studyCardHTML = renderer._renderStudyCard(sampleStudy, 'green');
        }
        
        // Try to call _renderBenefitCard to see if it includes studies
        benefitCardHTML = renderer._renderBenefitCard(sampleBenefit);
        
      } catch (e) {
        error = e.message;
      }
      
      return {
        hasMethod: hasMethod,
        studyData: sampleStudy,
        studyCardHTML: studyCardHTML,
        benefitCardHTML: benefitCardHTML,
        error: error,
        studyCardLength: studyCardHTML ? studyCardHTML.length : 0,
        benefitCardLength: benefitCardHTML ? benefitCardHTML.length : 0,
        benefitIncludesStudy: benefitCardHTML ? benefitCardHTML.includes(sampleStudy.title) : false
      };
    });
    
    console.log('\n📊 Study Card Rendering Test:');
    console.log(`   Has _renderStudyCard method: ${studyCardTest.hasMethod}`);
    console.log(`   Study data exists: ${!!studyCardTest.studyData}`);
    console.log(`   Error: ${studyCardTest.error || 'None'}`);
    
    if (studyCardTest.studyData) {
      console.log(`   Sample study title: "${studyCardTest.studyData.title}"`);
      console.log(`   Sample study PMID: "${studyCardTest.studyData.pmid}"`);
    }
    
    console.log(`   Study card HTML length: ${studyCardTest.studyCardLength} chars`);
    console.log(`   Benefit card HTML length: ${studyCardTest.benefitCardLength} chars`);
    console.log(`   Benefit includes study: ${studyCardTest.benefitIncludesStudy}`);
    
    if (studyCardTest.studyCardHTML) {
      console.log(`   Study card contains PMID: ${studyCardTest.studyCardHTML.includes('PMID')}`);
      console.log(`   Study card contains DOI: ${studyCardTest.studyCardHTML.includes('DOI')}`);
      console.log(`   Study card contains Findings: ${studyCardTest.studyCardHTML.includes('Findings')}`);
    }
    
    // Test the actual benefit card rendering in the DOM
    console.log('\n🔍 Testing DOM Benefit Card Content:');
    
    await page.fill('#searchInput', 'Panax Ginseng');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(15);
    });
    await page.waitForTimeout(1000);
    
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(500);
    
    const domAnalysis = await page.evaluate(() => {
      const container = document.getElementById('benefits-15');
      if (!container) return { error: 'Container not found' };
      
      const firstCard = container.querySelector('.enhanced-citation-card');
      if (!firstCard) return { error: 'No cards found' };
      
      const innerHTML = firstCard.innerHTML;
      const textContent = firstCard.textContent;
      
      // Look for study-specific elements
      const hasStudyCards = innerHTML.includes('study-card') || innerHTML.includes('citation-study');
      const hasStudyTitles = textContent.includes('Effects of') || textContent.includes('Ginseng for');
      const hasAuthors = textContent.includes('Authors:') || textContent.includes('et al');
      const hasJournal = textContent.includes('Journal:');
      const hasPMID = textContent.includes('PMID:');
      const hasDOI = textContent.includes('DOI:');
      const hasFindings = textContent.includes('Findings:');
      
      return {
        innerHTML: innerHTML.substring(0, 1000),
        textContent: textContent.substring(0, 500),
        hasStudyCards: hasStudyCards,
        hasStudyTitles: hasStudyTitles,
        hasAuthors: hasAuthors,
        hasJournal: hasJournal,
        hasPMID: hasPMID,
        hasDOI: hasDOI,
        hasFindings: hasFindings
      };
    });
    
    console.log(`   DOM card has study cards: ${domAnalysis.hasStudyCards}`);
    console.log(`   DOM card has study titles: ${domAnalysis.hasStudyTitles}`);
    console.log(`   DOM card has authors: ${domAnalysis.hasAuthors}`);
    console.log(`   DOM card has journal: ${domAnalysis.hasJournal}`);
    console.log(`   DOM card has PMID: ${domAnalysis.hasPMID}`);
    console.log(`   DOM card has DOI: ${domAnalysis.hasDOI}`);
    console.log(`   DOM card has findings: ${domAnalysis.hasFindings}`);
    
    console.log(`\n📄 DOM Card Content Preview:`);
    console.log(`${domAnalysis.textContent}...`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 STUDY CARD RENDERING DIAGNOSIS');
    console.log('='.repeat(60));
    
    if (studyCardTest.studyCardHTML && studyCardTest.studyCardHTML.length > 100) {
      console.log(`\n✅ STUDY CARD RENDERING WORKS:`);
      console.log(`   Individual study cards can be rendered successfully.`);
      
      if (!studyCardTest.benefitIncludesStudy) {
        console.log(`\n❌ INTEGRATION ISSUE:`);
        console.log(`   Study cards are not being included in benefit cards.`);
        console.log(`   The _renderBenefitCard method is not calling _renderStudyCard.`);
        console.log(`   Need to check the studies.map() call in _renderBenefitCard.`);
      } else {
        console.log(`\n✅ INTEGRATION WORKS:`);
        console.log(`   Study cards are being included in benefit cards.`);
      }
    } else {
      console.log(`\n❌ STUDY CARD RENDERING BROKEN:`);
      console.log(`   Individual study cards cannot be rendered.`);
      console.log(`   Error: ${studyCardTest.error}`);
    }
    
    if (!domAnalysis.hasPMID && !domAnalysis.hasAuthors) {
      console.log(`\n🔧 SOLUTION NEEDED:`);
      console.log(`   The study details are not appearing in the DOM.`);
      console.log(`   Check the _renderBenefitCard and _renderStudyCard methods.`);
      console.log(`   Verify the studies array is being processed correctly.`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Study card rendering debug complete');
  }
})();
