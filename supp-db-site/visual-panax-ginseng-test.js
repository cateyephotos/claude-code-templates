const { chromium } = require('playwright');

(async () => {
  console.log('👁️ Visual Panax Ginseng Test');
  console.log('Checking what the user actually sees in the browser...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Opening Panax Ginseng Modal...');
    
    // Search and open Panax Ginseng
    await page.fill('#searchInput', 'Panax Ginseng');
    await page.waitForTimeout(1000);
    
    // Open modal
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(15);
    });
    await page.waitForTimeout(2000);
    
    console.log('\n📋 Testing Benefits Tab Visibility...');
    
    // Click Benefits tab
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of benefits tab
    await page.screenshot({ 
      path: 'panax-ginseng-benefits-debug.png',
      fullPage: false
    });
    
    // Check what's actually visible
    const benefitsVisibility = await page.evaluate(() => {
      const container = document.getElementById('benefits-15');
      if (!container) return { error: 'Container not found' };
      
      const rect = container.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      const computedStyle = window.getComputedStyle(container);
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const visibleCards = cards.filter(card => {
        const cardRect = card.getBoundingClientRect();
        return cardRect.width > 0 && cardRect.height > 0;
      });
      
      return {
        containerVisible: isVisible,
        containerRect: { width: rect.width, height: rect.height },
        containerDisplay: computedStyle.display,
        containerVisibility: computedStyle.visibility,
        containerOpacity: computedStyle.opacity,
        totalCards: cards.length,
        visibleCards: visibleCards.length,
        cardTitles: visibleCards.map(card => card.querySelector('h5')?.textContent?.trim())
      };
    });
    
    console.log(`   Container Visible: ${benefitsVisibility.containerVisible}`);
    console.log(`   Container Size: ${benefitsVisibility.containerRect.width}x${benefitsVisibility.containerRect.height}`);
    console.log(`   CSS Display: ${benefitsVisibility.containerDisplay}`);
    console.log(`   CSS Visibility: ${benefitsVisibility.containerVisibility}`);
    console.log(`   CSS Opacity: ${benefitsVisibility.containerOpacity}`);
    console.log(`   Total Cards: ${benefitsVisibility.totalCards}`);
    console.log(`   Visible Cards: ${benefitsVisibility.visibleCards}`);
    
    if (benefitsVisibility.visibleCards > 0) {
      console.log(`   ✅ Benefits are visible! Card titles:`);
      benefitsVisibility.cardTitles.forEach((title, index) => {
        console.log(`     ${index + 1}. ${title}`);
      });
    } else {
      console.log(`   ❌ Benefits cards are not visible!`);
    }
    
    console.log('\n🛡️ Testing Safety Tab Visibility...');
    
    // Click Safety tab
    const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
    await safetyTab.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of safety tab
    await page.screenshot({ 
      path: 'panax-ginseng-safety-debug.png',
      fullPage: false
    });
    
    // Check safety visibility
    const safetyVisibility = await page.evaluate(() => {
      const container = document.getElementById('safety-15');
      if (!container) return { error: 'Container not found' };
      
      const rect = container.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      const computedStyle = window.getComputedStyle(container);
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const visibleCards = cards.filter(card => {
        const cardRect = card.getBoundingClientRect();
        return cardRect.width > 0 && cardRect.height > 0;
      });
      
      return {
        containerVisible: isVisible,
        containerRect: { width: rect.width, height: rect.height },
        containerDisplay: computedStyle.display,
        containerVisibility: computedStyle.visibility,
        containerOpacity: computedStyle.opacity,
        totalCards: cards.length,
        visibleCards: visibleCards.length,
        cardTitles: visibleCards.map(card => card.querySelector('h5')?.textContent?.trim())
      };
    });
    
    console.log(`   Container Visible: ${safetyVisibility.containerVisible}`);
    console.log(`   Container Size: ${safetyVisibility.containerRect.width}x${safetyVisibility.containerRect.height}`);
    console.log(`   CSS Display: ${safetyVisibility.containerDisplay}`);
    console.log(`   CSS Visibility: ${safetyVisibility.containerVisibility}`);
    console.log(`   CSS Opacity: ${safetyVisibility.containerOpacity}`);
    console.log(`   Total Cards: ${safetyVisibility.totalCards}`);
    console.log(`   Visible Cards: ${safetyVisibility.visibleCards}`);
    
    if (safetyVisibility.visibleCards > 0) {
      console.log(`   ✅ Safety data is visible! Card titles:`);
      safetyVisibility.cardTitles.forEach((title, index) => {
        console.log(`     ${index + 1}. ${title}`);
      });
    } else {
      console.log(`   ❌ Safety cards are not visible!`);
    }
    
    console.log('\n🔄 Comparing with Working Supplement (Alpha-Lipoic Acid)...');
    
    // Close current modal and open Alpha-Lipoic Acid for comparison
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.fill('#searchInput', 'Alpha-Lipoic Acid');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(44);
    });
    await page.waitForTimeout(1000);
    
    // Test Alpha-Lipoic Acid benefits
    const alaTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await alaTab.click();
    await page.waitForTimeout(500);
    
    const alaComparison = await page.evaluate(() => {
      const container = document.getElementById('benefits-44');
      if (!container) return { error: 'ALA container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const visibleCards = cards.filter(card => {
        const cardRect = card.getBoundingClientRect();
        return cardRect.width > 0 && cardRect.height > 0;
      });
      
      return {
        totalCards: cards.length,
        visibleCards: visibleCards.length,
        working: visibleCards.length > 0
      };
    });
    
    console.log(`   Alpha-Lipoic Acid Benefits: ${alaComparison.totalCards} total, ${alaComparison.visibleCards} visible`);
    console.log(`   Alpha-Lipoic Acid Working: ${alaComparison.working ? '✅ Yes' : '❌ No'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('👁️ VISUAL TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Panax Ginseng Visual Status:`);
    console.log(`   Benefits Visible: ${benefitsVisibility.visibleCards > 0 ? '✅ Yes' : '❌ No'} (${benefitsVisibility.visibleCards}/${benefitsVisibility.totalCards})`);
    console.log(`   Safety Visible: ${safetyVisibility.visibleCards > 0 ? '✅ Yes' : '❌ No'} (${safetyVisibility.visibleCards}/${safetyVisibility.totalCards})`);
    
    console.log(`\n📸 Screenshots saved:`);
    console.log(`   panax-ginseng-benefits-debug.png`);
    console.log(`   panax-ginseng-safety-debug.png`);
    
    if (benefitsVisibility.visibleCards === 0 || safetyVisibility.visibleCards === 0) {
      console.log(`\n🔧 ISSUE IDENTIFIED:`);
      console.log(`   The data exists but cards are not visually rendering.`);
      console.log(`   This suggests a CSS or rendering pipeline issue.`);
      console.log(`   Need to check citation renderer compatibility.`);
    } else {
      console.log(`\n✅ NO VISUAL ISSUES FOUND:`);
      console.log(`   Both Benefits and Safety tabs are rendering properly.`);
      console.log(`   The issue might be browser-specific or timing-related.`);
    }
    
    // Keep browser open for manual inspection
    console.log(`\n🔍 Browser kept open for manual inspection...`);
    console.log(`   Please check the Panax Ginseng modal manually.`);
    console.log(`   Press Enter to close when done.`);
    
    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
    
  } catch (error) {
    console.error('❌ Visual test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Visual test complete');
  }
})();
