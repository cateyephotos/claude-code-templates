const { chromium } = require('playwright');

async function waitForCitationsTest() {
    console.log('🔍 Waiting for enhanced citations to load...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        
        const fixedSupplements = [4, 6, 7]; // Omega-3, Magnesium, Vitamin D3
        
        for (const id of fixedSupplements) {
            console.log(`\n📋 Testing supplement ID: ${id}`);
            
            // Scroll to the supplement and click it to trigger citation loading
            const card = page.locator(`[data-supplement-id="${id}"]`);
            await card.scrollIntoViewIfNeeded();
            
            // Get supplement name
            const name = await card.locator('h3').textContent();
            console.log(`   Name: ${name}`);
            
            // Click the supplement card to trigger loading
            await card.click();
            
            // Wait a bit for citation loading
            await page.waitForTimeout(2000);
            
            // Check if enhanced citation is now loaded
            const hasEnhanced = await page.evaluate((supplementId) => {
                return window.enhancedCitations && window.enhancedCitations[supplementId];
            }, id);
            
            console.log(`   Enhanced citation loaded: ${hasEnhanced}`);
            
            if (hasEnhanced) {
                // Check for undefined in the data
                const hasUndefined = await page.evaluate((supplementId) => {
                    const data = window.enhancedCitations[supplementId];
                    const jsonString = JSON.stringify(data);
                    const undefinedCount = (jsonString.match(/undefined/g) || []).length;
                    return undefinedCount;
                }, id);
                
                if (hasUndefined === 0) {
                    console.log(`   ✅ ${name} - No undefined values found`);
                } else {
                    console.log(`   ⚠️  ${name} - Found ${hasUndefined} undefined values`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
    
    console.log('\n🏁 Citation loading test complete');
}

waitForCitationsTest();