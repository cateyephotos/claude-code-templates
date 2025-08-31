const { chromium } = require('playwright');

async function testSupplementsSimple() {
    console.log('🌐 Simple supplement test...');
    
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        console.log('   📄 Page loaded');
        
        // Check if supplements are showing enhanced badges
        const supplementsToTest = [4, 6, 7];
        
        for (const id of supplementsToTest) {
            console.log(`\\n🔍 Checking supplement ID: ${id}`);
            
            // Look for the supplement card
            const card = page.locator(`[data-supplement-id="${id}"]`);
            const exists = await card.count() > 0;
            console.log(`   Card exists: ${exists}`);
            
            if (exists) {
                // Check for Phase 2A badge
                const badge = card.locator('.phase-2a-badge');
                const hasBadge = await badge.count() > 0;
                console.log(`   Has Phase 2A badge: ${hasBadge}`);
                
                // Check for enhanced view details button
                const viewBtn = card.locator('button:has-text("View Details")');
                const hasViewBtn = await viewBtn.count() > 0;
                console.log(`   Has View Details button: ${hasViewBtn}`);
                
                // Get supplement name
                const nameElement = card.locator('h3');
                const name = await nameElement.textContent();
                console.log(`   Name: ${name}`);
            }
        }
        
        // Keep browser open to inspect
        console.log('\\nBrowser will stay open for inspection. Press Ctrl+C to close.');
        await page.waitForTimeout(60000); // Wait 1 minute
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testSupplementsSimple();