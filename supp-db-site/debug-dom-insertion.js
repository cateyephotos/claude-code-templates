const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging DOM Insertion Issue');
  console.log('Checking why benefits study details disappear from DOM...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Open Panax Ginseng
    await page.fill('#searchInput', 'Panax Ginseng');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(15);
    });
    await page.waitForTimeout(1000);
    
    console.log('\n🔍 Step 1: Check Initial DOM State');
    
    // Check what's in the DOM immediately after modal opens
    const initialState = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-15');
      const mechanismsContainer = document.getElementById('mechanisms-15');
      
      return {
        benefitsExists: !!benefitsContainer,
        mechanismsExists: !!mechanismsContainer,
        benefitsHTML: benefitsContainer ? benefitsContainer.innerHTML.substring(0, 500) : 'Not found',
        mechanismsHTML: mechanismsContainer ? mechanismsContainer.innerHTML.substring(0, 500) : 'Not found',
        benefitsHasPMID: benefitsContainer ? benefitsContainer.innerHTML.includes('PMID') : false,
        mechanismsHasPMID: mechanismsContainer ? mechanismsContainer.innerHTML.includes('PMID') : false
      };
    });
    
    console.log(`   Benefits container exists: ${initialState.benefitsExists}`);
    console.log(`   Mechanisms container exists: ${initialState.mechanismsExists}`);
    console.log(`   Benefits has PMID: ${initialState.benefitsHasPMID}`);
    console.log(`   Mechanisms has PMID: ${initialState.mechanismsHasPMID}`);
    
    console.log('\n🔍 Step 2: Click Benefits Tab and Monitor Changes');
    
    // Click benefits tab and monitor what happens
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(1000);
    
    const afterBenefitsClick = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-15');
      
      if (!benefitsContainer) return { error: 'Benefits container not found' };
      
      const innerHTML = benefitsContainer.innerHTML;
      const isHidden = benefitsContainer.classList.contains('hidden');
      const computedDisplay = window.getComputedStyle(benefitsContainer).display;
      
      // Check for study cards specifically
      const studyCards = Array.from(benefitsContainer.querySelectorAll('.bg-gray-50'));
      const citationCards = Array.from(benefitsContainer.querySelectorAll('.enhanced-citation-card'));
      
      return {
        isHidden: isHidden,
        computedDisplay: computedDisplay,
        htmlLength: innerHTML.length,
        hasPMID: innerHTML.includes('PMID'),
        hasDOI: innerHTML.includes('DOI'),
        hasFindings: innerHTML.includes('Findings'),
        studyCardsCount: studyCards.length,
        citationCardsCount: citationCards.length,
        innerHTML: innerHTML.substring(0, 1000)
      };
    });
    
    console.log(`   Benefits hidden: ${afterBenefitsClick.isHidden}`);
    console.log(`   Benefits display: ${afterBenefitsClick.computedDisplay}`);
    console.log(`   Benefits HTML length: ${afterBenefitsClick.htmlLength}`);
    console.log(`   Benefits has PMID: ${afterBenefitsClick.hasPMID}`);
    console.log(`   Benefits has DOI: ${afterBenefitsClick.hasDOI}`);
    console.log(`   Benefits has Findings: ${afterBenefitsClick.hasFindings}`);
    console.log(`   Study cards count: ${afterBenefitsClick.studyCardsCount}`);
    console.log(`   Citation cards count: ${afterBenefitsClick.citationCardsCount}`);
    
    console.log('\n🔍 Step 3: Compare with Mechanisms Tab');
    
    // Click mechanisms tab for comparison
    const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
    await mechanismsTab.click();
    await page.waitForTimeout(1000);
    
    const afterMechanismsClick = await page.evaluate(() => {
      const mechanismsContainer = document.getElementById('mechanisms-15');
      
      if (!mechanismsContainer) return { error: 'Mechanisms container not found' };
      
      const innerHTML = mechanismsContainer.innerHTML;
      const isHidden = mechanismsContainer.classList.contains('hidden');
      const computedDisplay = window.getComputedStyle(mechanismsContainer).display;
      
      // Check for study cards specifically
      const studyCards = Array.from(mechanismsContainer.querySelectorAll('.bg-gray-50'));
      const citationCards = Array.from(mechanismsContainer.querySelectorAll('.enhanced-citation-card'));
      
      return {
        isHidden: isHidden,
        computedDisplay: computedDisplay,
        htmlLength: innerHTML.length,
        hasPMID: innerHTML.includes('PMID'),
        hasDOI: innerHTML.includes('DOI'),
        hasFindings: innerHTML.includes('Findings'),
        studyCardsCount: studyCards.length,
        citationCardsCount: citationCards.length
      };
    });
    
    console.log(`   Mechanisms hidden: ${afterMechanismsClick.isHidden}`);
    console.log(`   Mechanisms display: ${afterMechanismsClick.computedDisplay}`);
    console.log(`   Mechanisms HTML length: ${afterMechanismsClick.htmlLength}`);
    console.log(`   Mechanisms has PMID: ${afterMechanismsClick.hasPMID}`);
    console.log(`   Mechanisms has DOI: ${afterMechanismsClick.hasDOI}`);
    console.log(`   Mechanisms has Findings: ${afterMechanismsClick.hasFindings}`);
    console.log(`   Study cards count: ${afterMechanismsClick.studyCardsCount}`);
    console.log(`   Citation cards count: ${afterMechanismsClick.citationCardsCount}`);
    
    console.log('\n🔍 Step 4: Check for JavaScript Overrides');
    
    // Check if there are any event listeners or scripts that might be modifying content
    const jsCheck = await page.evaluate(() => {
      // Check if there are any mutation observers or event listeners
      const benefitsContainer = document.getElementById('benefits-15');
      
      if (!benefitsContainer) return { error: 'Benefits container not found' };
      
      // Check for any scripts that might be modifying the content
      const scripts = Array.from(document.querySelectorAll('script')).map(script => script.src || 'inline');
      
      // Check if the content is being replaced after initial render
      const originalHTML = benefitsContainer.innerHTML;
      
      // Wait a moment and check again
      setTimeout(() => {
        const newHTML = benefitsContainer.innerHTML;
        window.htmlChanged = originalHTML !== newHTML;
        window.originalLength = originalHTML.length;
        window.newLength = newHTML.length;
      }, 100);
      
      return {
        scripts: scripts,
        hasEventListeners: !!benefitsContainer.onclick || !!benefitsContainer.onchange,
        innerHTML: originalHTML.substring(0, 500)
      };
    });
    
    await page.waitForTimeout(200);
    
    const htmlChangeCheck = await page.evaluate(() => {
      return {
        htmlChanged: window.htmlChanged,
        originalLength: window.originalLength,
        newLength: window.newLength
      };
    });
    
    console.log(`   HTML changed after render: ${htmlChangeCheck.htmlChanged}`);
    console.log(`   Original length: ${htmlChangeCheck.originalLength}`);
    console.log(`   New length: ${htmlChangeCheck.newLength}`);
    
    console.log('\n🔍 Step 5: Manual Content Injection Test');
    
    // Try manually injecting study content to see if it appears
    const manualTest = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-15');
      if (!benefitsContainer) return { error: 'Benefits container not found' };
      
      // Try to manually add a study card
      const testStudyCard = `
        <div class="bg-gray-50 p-3 rounded border-l-4 border-green-400" style="margin: 10px 0;">
          <h6 class="font-medium text-gray-900">TEST STUDY CARD</h6>
          <p class="text-sm text-gray-700 mt-1"><strong>PMID:</strong> 12345678</p>
          <p class="text-sm text-gray-700"><strong>DOI:</strong> 10.1234/test</p>
          <p class="text-sm text-gray-700"><strong>Findings:</strong> This is a test study card to see if it appears.</p>
        </div>
      `;
      
      // Add it to the first citation card
      const firstCard = benefitsContainer.querySelector('.enhanced-citation-card');
      if (firstCard) {
        firstCard.innerHTML += testStudyCard;
        return { success: true, cardExists: true };
      } else {
        return { success: false, cardExists: false };
      }
    });
    
    await page.waitForTimeout(500);
    
    const manualTestResult = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-15');
      return {
        hasTestCard: benefitsContainer ? benefitsContainer.innerHTML.includes('TEST STUDY CARD') : false,
        hasTestPMID: benefitsContainer ? benefitsContainer.innerHTML.includes('12345678') : false
      };
    });
    
    console.log(`   Manual test card appears: ${manualTestResult.hasTestCard}`);
    console.log(`   Manual test PMID appears: ${manualTestResult.hasTestPMID}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 DOM INSERTION DIAGNOSIS');
    console.log('='.repeat(60));
    
    if (manualTestResult.hasTestCard) {
      console.log(`\n✅ DOM INSERTION WORKS:`);
      console.log(`   Manual content injection appears in benefits tab.`);
      console.log(`   The issue is in the automatic rendering process.`);
    } else {
      console.log(`\n❌ DOM INSERTION BLOCKED:`);
      console.log(`   Even manual content injection doesn't appear.`);
      console.log(`   There might be CSS or JavaScript preventing display.`);
    }
    
    if (afterBenefitsClick.hasPMID) {
      console.log(`\n✅ BENEFITS CONTENT IS CORRECT:`);
      console.log(`   Benefits HTML contains PMID information.`);
      console.log(`   The rendering is working correctly.`);
    } else {
      console.log(`\n❌ BENEFITS CONTENT IS MISSING:`);
      console.log(`   Benefits HTML does not contain study details.`);
      console.log(`   The rendering process is not working.`);
    }
    
    console.log(`\n💡 NEXT STEPS:`);
    if (afterBenefitsClick.hasPMID && !manualTestResult.hasTestCard) {
      console.log(`   The content is there but not visible - check CSS.`);
    } else if (!afterBenefitsClick.hasPMID) {
      console.log(`   The content is not being rendered - check JavaScript.`);
    } else {
      console.log(`   Everything should be working - check browser refresh.`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ DOM insertion debug complete');
  }
})();
