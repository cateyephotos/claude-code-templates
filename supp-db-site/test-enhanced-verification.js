const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Playwright verification...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log('📝 Console:', text);
  });
  
  // Listen for errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ Page Error:', error.message);
  });
  
  try {
    console.log('🌐 Loading main application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait a bit for the app to initialize
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Checking for enhanced citation loading messages...');
    const enhancedLoadingMessages = consoleMessages.filter(msg => 
      msg.includes('Loading enhanced citation files') ||
      msg.includes('Loaded enhanced citations for ID') ||
      msg.includes('Enhanced citation loading complete') ||
      msg.includes('Enhanced citation attachment results')
    );
    
    console.log('📊 Enhanced Loading Messages Found:', enhancedLoadingMessages.length);
    enhancedLoadingMessages.forEach(msg => console.log('  ✅', msg));
    
    console.log('\n🔍 Searching for Holy Basil...');
    await page.fill('#searchInput', 'Holy Basil');
    await page.waitForTimeout(1000);
    
    // Check if Holy Basil card exists
    const holyBasilCard = await page.locator('[data-supplement-id="67"]').first();
    const cardExists = await holyBasilCard.count() > 0;
    console.log('📋 Holy Basil card found:', cardExists);
    
    if (cardExists) {
      // Check for enhanced badge
      const enhancedBadge = await holyBasilCard.locator('.phase-2a-badge').count();
      console.log('🏷️ Enhanced badge found:', enhancedBadge > 0);
      
      // Click on Holy Basil to open modal
      console.log('🖱️ Clicking Holy Basil card...');
      await holyBasilCard.click();
      await page.waitForTimeout(1000);
      
      // Check if modal opened
      const modal = await page.locator('#supplementModal').first();
      const modalVisible = await modal.isVisible();
      console.log('📱 Modal opened:', modalVisible);
      
      if (modalVisible) {
        // Check for enhanced features in modal
        const enhancedProfile = await page.locator('.bg-gradient-to-r').count();
        const citationTabs = await page.locator('.citation-tab-btn').count();
        
        console.log('🎯 Enhanced Evidence Profile found:', enhancedProfile > 0);
        console.log('📑 Citation tabs found:', citationTabs);
      }
    }
    
    console.log('\n🔍 Checking Phosphatidylserine for comparison...');
    await page.fill('#searchInput', 'Phosphatidylserine');
    await page.waitForTimeout(1000);
    
    const psCard = await page.locator('[data-supplement-id="12"]').first();
    const psCardExists = await psCard.count() > 0;
    console.log('📋 Phosphatidylserine card found:', psCardExists);
    
    if (psCardExists) {
      const psBadge = await psCard.locator('.phase-2a-badge').count();
      console.log('🏷️ Phosphatidylserine enhanced badge:', psBadge > 0);
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('Total console messages:', consoleMessages.length);
    console.log('Enhanced loading messages:', enhancedLoadingMessages.length);
    console.log('Errors found:', errors.length);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(error => console.log('  -', error));
    }
    
    console.log('\n🔍 All console messages:');
    consoleMessages.forEach((msg, i) => console.log(`  ${i+1}. ${msg}`));
    
  } catch (error) {
    console.log('❌ Playwright error:', error.message);
  } finally {
    await browser.close();
    console.log('✅ Playwright verification complete');
  }
})();
