const { chromium } = require('playwright');

(async () => {
  console.log('🔧 TESTING JAVASCRIPT ERRORS FIXED');
  console.log('Checking if variable redeclaration errors are resolved...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Give time for all files to load
    
    console.log('\n📊 JavaScript Error Analysis:');
    console.log(`   Total Errors: ${errors.length}`);
    
    // Filter for specific error types
    const redeclarationErrors = errors.filter(err => err.includes('already been declared'));
    const fileNotFoundErrors = errors.filter(err => err.includes('404') || err.includes('File not found'));
    const otherErrors = errors.filter(err => !err.includes('already been declared') && !err.includes('404') && !err.includes('File not found'));
    
    console.log(`   Redeclaration Errors: ${redeclarationErrors.length}`);
    console.log(`   File Not Found Errors: ${fileNotFoundErrors.length}`);
    console.log(`   Other Errors: ${otherErrors.length}`);
    
    if (redeclarationErrors.length > 0) {
      console.log('\n❌ Redeclaration Errors:');
      redeclarationErrors.slice(0, 5).forEach(err => {
        console.log(`   ${err}`);
      });
      if (redeclarationErrors.length > 5) {
        console.log(`   ... and ${redeclarationErrors.length - 5} more`);
      }
    }
    
    if (fileNotFoundErrors.length > 0) {
      console.log('\n⚠️ File Not Found Errors:');
      console.log(`   ${fileNotFoundErrors.length} files not found (expected for missing supplements)`);
    }
    
    if (otherErrors.length > 0) {
      console.log('\n🔍 Other Errors:');
      otherErrors.slice(0, 3).forEach(err => {
        console.log(`   ${err}`);
      });
    }
    
    // Test L-Tyrosine specifically
    console.log('\n🧪 Testing L-Tyrosine After Error Fixes:');
    
    try {
      await page.fill('#searchInput', 'L-Tyrosine');
      await page.waitForTimeout(1000);
      
      await page.evaluate(async () => {
        await window.app.showSupplementDetails(33);
      });
      await page.waitForTimeout(2000);
      
      // Check if details panel is created
      const detailsCheck = await page.evaluate(() => {
        const detailsPanel = document.getElementById('supplementDetails');
        const citationTabs = Array.from(document.querySelectorAll('.citation-tab-btn'));
        const containers = [
          document.getElementById('benefits-33'),
          document.getElementById('safety-33'),
          document.getElementById('mechanisms-33')
        ];
        
        return {
          detailsPanelExists: !!detailsPanel,
          detailsPanelVisible: detailsPanel && detailsPanel.style.display !== 'none',
          citationTabsCount: citationTabs.length,
          containersExist: containers.map(c => !!c),
          containerContent: containers.map(c => c ? c.innerHTML.length : 0)
        };
      });
      
      console.log(`   Details Panel Exists: ${detailsCheck.detailsPanelExists}`);
      console.log(`   Details Panel Visible: ${detailsCheck.detailsPanelVisible}`);
      console.log(`   Citation Tabs: ${detailsCheck.citationTabsCount}`);
      console.log(`   Containers Exist: ${detailsCheck.containersExist.join(', ')}`);
      console.log(`   Container Content: ${detailsCheck.containerContent.join(', ')} chars`);
      
      if (detailsCheck.detailsPanelExists && detailsCheck.citationTabsCount > 0) {
        console.log('   ✅ L-Tyrosine supplement details working!');
        
        // Test if tabs have content
        if (detailsCheck.containerContent.some(length => length > 0)) {
          console.log('   ✅ L-Tyrosine citation content loading!');
        } else {
          console.log('   ⚠️ L-Tyrosine tabs created but no content');
        }
      } else {
        console.log('   ❌ L-Tyrosine still not working');
      }
      
    } catch (error) {
      console.log(`   ❌ L-Tyrosine test error: ${error.message}`);
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    
    if (redeclarationErrors.length === 0) {
      console.log('✅ JavaScript redeclaration errors resolved!');
    } else {
      console.log('❌ JavaScript redeclaration errors still present');
      console.log('   Need to identify and fix remaining duplicate variables');
    }
    
    return {
      totalErrors: errors.length,
      redeclarationErrors: redeclarationErrors.length,
      fileNotFoundErrors: fileNotFoundErrors.length,
      otherErrors: otherErrors.length,
      lTyrosineWorking: detailsCheck?.detailsPanelExists && detailsCheck?.citationTabsCount > 0
    };
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ JavaScript error test complete');
  }
})();
