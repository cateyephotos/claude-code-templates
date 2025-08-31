const { chromium } = require('playwright');

async function testCitationLoadingFixed() {
    console.log('🔍 Testing citation loading after fix...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Log console errors to see if the issue is resolved
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`CONSOLE ERROR: ${msg.text()}`);
        }
    });
    
    try {
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        
        // Wait for citations to load
        await page.waitForTimeout(5000);
        
        // Check which citations are loaded
        const loadedCitations = await page.evaluate(() => {
            return {
                hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
                loadedIds: window.enhancedCitations ? Object.keys(window.enhancedCitations) : [],
                totalCount: window.enhancedCitations ? Object.keys(window.enhancedCitations).length : 0
            };
        });
        
        console.log('Loaded citations:', loadedCitations);
        
        // Check specifically for our fixed supplements
        const targetSupplements = [4, 6, 7];
        for (const id of targetSupplements) {
            const isLoaded = await page.evaluate((supplementId) => {
                return window.enhancedCitations && window.enhancedCitations[supplementId] ? true : false;
            }, id);
            
            console.log(`Supplement ${id} loaded: ${isLoaded}`);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
    
    console.log('\\n🏁 Test complete');
}

testCitationLoadingFixed();