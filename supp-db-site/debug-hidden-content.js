const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Hidden Content');
  console.log('Checking if benefits content exists but is hidden...');
  
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
    await page.waitForTimeout(2000);
    
    console.log('\n🔍 Checking Hidden Content in All Tabs...');
    
    // Check all tab content regardless of visibility
    const allTabsContent = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-15');
      const safetyContainer = document.getElementById('safety-15');
      const mechanismsContainer = document.getElementById('mechanisms-15');
      
      const getTabInfo = (container, name) => {
        if (!container) return { name, exists: false };
        
        return {
          name: name,
          exists: true,
          isHidden: container.classList.contains('hidden'),
          computedDisplay: window.getComputedStyle(container).display,
          htmlLength: container.innerHTML.length,
          hasPMID: container.innerHTML.includes('PMID'),
          hasDOI: container.innerHTML.includes('DOI'),
          hasFindings: container.innerHTML.includes('Findings'),
          studyCardsCount: container.querySelectorAll('.bg-gray-50').length,
          citationCardsCount: container.querySelectorAll('.enhanced-citation-card').length,
          innerHTML: container.innerHTML.substring(0, 500)
        };
      };
      
      return {
        benefits: getTabInfo(benefitsContainer, 'Benefits'),
        safety: getTabInfo(safetyContainer, 'Safety'),
        mechanisms: getTabInfo(mechanismsContainer, 'Mechanisms')
      };
    });
    
    console.log('\n📊 All Tabs Content Analysis:');
    
    ['benefits', 'safety', 'mechanisms'].forEach(tabName => {
      const tab = allTabsContent[tabName];
      console.log(`\n${tab.name.toUpperCase()} TAB:`);
      console.log(`   Exists: ${tab.exists}`);
      if (tab.exists) {
        console.log(`   Hidden: ${tab.isHidden}`);
        console.log(`   Display: ${tab.computedDisplay}`);
        console.log(`   HTML Length: ${tab.htmlLength} chars`);
        console.log(`   Has PMID: ${tab.hasPMID ? '✅' : '❌'}`);
        console.log(`   Has DOI: ${tab.hasDOI ? '✅' : '❌'}`);
        console.log(`   Has Findings: ${tab.hasFindings ? '✅' : '❌'}`);
        console.log(`   Study Cards: ${tab.studyCardsCount}`);
        console.log(`   Citation Cards: ${tab.citationCardsCount}`);
        
        if (tab.hasPMID) {
          console.log(`   🎉 CONTENT IS THERE!`);
        } else {
          console.log(`   ❌ Content missing`);
          console.log(`   Preview: ${tab.innerHTML.substring(0, 200)}...`);
        }
      }
    });
    
    // Test manual visibility toggle
    console.log('\n🔧 Testing Manual Visibility Toggle...');
    
    const visibilityTest = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-15');
      const safetyContainer = document.getElementById('safety-15');
      
      if (!benefitsContainer || !safetyContainer) {
        return { error: 'Containers not found' };
      }
      
      // Force show benefits and safety
      benefitsContainer.classList.remove('hidden');
      safetyContainer.classList.remove('hidden');
      
      // Check if content becomes visible
      const benefitsVisible = window.getComputedStyle(benefitsContainer).display !== 'none';
      const safetyVisible = window.getComputedStyle(safetyContainer).display !== 'none';
      
      // Check if PMIDs are now visible
      const benefitsHasPMID = benefitsContainer.innerHTML.includes('PMID');
      const safetyHasPMID = safetyContainer.innerHTML.includes('PMID');
      
      return {
        benefitsVisible: benefitsVisible,
        safetyVisible: safetyVisible,
        benefitsHasPMID: benefitsHasPMID,
        safetyHasPMID: safetyHasPMID
      };
    });
    
    console.log(`   Benefits visible after unhiding: ${visibilityTest.benefitsVisible}`);
    console.log(`   Safety visible after unhiding: ${visibilityTest.safetyVisible}`);
    console.log(`   Benefits has PMID after unhiding: ${visibilityTest.benefitsHasPMID ? '✅' : '❌'}`);
    console.log(`   Safety has PMID after unhiding: ${visibilityTest.safetyHasPMID ? '✅' : '❌'}`);
    
    // Test clicking tabs to see if content appears
    console.log('\n🖱️ Testing Tab Clicking...');
    
    // Click Benefits tab
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(1000);
    
    const afterBenefitsClick = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-15');
      return {
        isHidden: benefitsContainer ? benefitsContainer.classList.contains('hidden') : null,
        hasPMID: benefitsContainer ? benefitsContainer.innerHTML.includes('PMID') : false,
        htmlLength: benefitsContainer ? benefitsContainer.innerHTML.length : 0
      };
    });
    
    console.log(`   After clicking Benefits tab:`);
    console.log(`     Hidden: ${afterBenefitsClick.isHidden}`);
    console.log(`     Has PMID: ${afterBenefitsClick.hasPMID ? '✅' : '❌'}`);
    console.log(`     HTML Length: ${afterBenefitsClick.htmlLength} chars`);
    
    // Click Safety tab
    const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
    await safetyTab.click();
    await page.waitForTimeout(1000);
    
    const afterSafetyClick = await page.evaluate(() => {
      const safetyContainer = document.getElementById('safety-15');
      return {
        isHidden: safetyContainer ? safetyContainer.classList.contains('hidden') : null,
        hasPMID: safetyContainer ? safetyContainer.innerHTML.includes('PMID') : false,
        htmlLength: safetyContainer ? safetyContainer.innerHTML.length : 0
      };
    });
    
    console.log(`   After clicking Safety tab:`);
    console.log(`     Hidden: ${afterSafetyClick.isHidden}`);
    console.log(`     Has PMID: ${afterSafetyClick.hasPMID ? '✅' : '❌'}`);
    console.log(`     HTML Length: ${afterSafetyClick.htmlLength} chars`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 HIDDEN CONTENT DIAGNOSIS');
    console.log('='.repeat(60));
    
    const benefitsHasContent = allTabsContent.benefits.hasPMID;
    const safetyHasContent = allTabsContent.safety.hasPMID;
    const mechanismsHasContent = allTabsContent.mechanisms.hasPMID;
    
    if (benefitsHasContent && safetyHasContent) {
      console.log(`\n🎉 ALL CONTENT IS THERE!`);
      console.log(`   Benefits, Safety, and Mechanisms all have PMID content.`);
      console.log(`   The issue was just CSS visibility.`);
      console.log(`   Citation rendering is working perfectly!`);
    } else if (mechanismsHasContent && !benefitsHasContent) {
      console.log(`\n❌ CONTENT GENERATION ISSUE:`);
      console.log(`   Mechanisms have content but Benefits/Safety don't.`);
      console.log(`   The issue is in the rendering process, not visibility.`);
    } else {
      console.log(`\n⚠️ MIXED RESULTS:`);
      console.log(`   Benefits has content: ${benefitsHasContent}`);
      console.log(`   Safety has content: ${safetyHasContent}`);
      console.log(`   Mechanisms has content: ${mechanismsHasContent}`);
    }
    
    if (afterBenefitsClick.hasPMID || afterSafetyClick.hasPMID) {
      console.log(`\n🎉 TAB CLICKING WORKS!`);
      console.log(`   Content appears when tabs are clicked.`);
    } else {
      console.log(`\n❌ TAB CLICKING DOESN'T HELP:`);
      console.log(`   Content is still missing after clicking tabs.`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Hidden content debug complete');
  }
})();
