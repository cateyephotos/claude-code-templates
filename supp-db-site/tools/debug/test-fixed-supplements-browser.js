const { chromium } = require('playwright');

async function testFixedSupplements() {
    console.log('🌐 Testing fixed supplements in browser...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Listen for console messages to catch undefined errors
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });
    
    try {
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        console.log('   📄 Page loaded successfully');
        
        // Test the three supplements we fixed
        const supplementsToTest = [
            { id: 4, name: 'Omega-3 Fatty Acids' },
            { id: 6, name: 'Magnesium' },
            { id: 7, name: 'Vitamin D3' }
        ];
        
        for (const supplement of supplementsToTest) {
            console.log(`\\n🔍 Testing ${supplement.name} (ID: ${supplement.id})`);
            
            // Find and click the supplement card
            const supplementCard = page.locator(`[data-supplement-id="${supplement.id}"]`);
            await supplementCard.scrollIntoViewIfNeeded();
            
            // Click view details button
            const viewDetailsBtn = supplementCard.locator('button:has-text("View Details")');
            await viewDetailsBtn.click();
            
            // Wait for modal to open
            await page.waitForSelector('.modal.active', { timeout: 5000 });
            console.log('   📋 Modal opened successfully');
            
            // Check for undefined text in the modal content
            const modalContent = await page.locator('.modal.active').textContent();
            const undefinedCount = (modalContent.match(/undefined/g) || []).length;
            
            if (undefinedCount === 0) {
                console.log('   ✅ No "undefined" text found in modal');
            } else {
                console.log(`   ⚠️  Found ${undefinedCount} instances of "undefined" text`);
            }
            
            // Close modal
            await page.locator('.modal-close').click();
            await page.waitForSelector('.modal.active', { state: 'hidden', timeout: 2000 });
            
            // Small delay between tests
            await page.waitForTimeout(500);
        }
        
        // Check for JavaScript console errors
        const errors = consoleMessages.filter(msg => msg.type === 'error');
        if (errors.length === 0) {
            console.log('\\n✅ No JavaScript console errors detected');
        } else {
            console.log(`\\n⚠️  Found ${errors.length} console errors:`);
            errors.forEach(error => {
                console.log(`   - ${error.text}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
    
    console.log('\\n🏁 Browser testing complete');
}

testFixedSupplements();