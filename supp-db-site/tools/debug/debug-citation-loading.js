const { chromium } = require('playwright');

async function debugCitationLoading() {
    console.log('🔍 Debugging citation loading...');
    
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage();
    
    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
        console.log(`CONSOLE ${msg.type().toUpperCase()}: ${msg.text()}`);
        consoleMessages.push({
            type: msg.type(),
            text: msg.text()
        });
    });
    
    // Collect errors
    page.on('pageerror', error => {
        console.log('PAGE ERROR:', error.message);
    });
    
    try {
        console.log('Loading page...');
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        
        console.log('Page loaded. Waiting for initial setup...');
        await page.waitForTimeout(3000);
        
        // Check if citation system is initialized
        const systemStatus = await page.evaluate(() => {
            return {
                hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
                citationLoaderExists: typeof CitationLoader !== 'undefined',
                supplementDatabaseExists: typeof window.supplementDatabase !== 'undefined',
                appExists: typeof window.app !== 'undefined'
            };
        });
        
        console.log('System Status:', systemStatus);
        
        // Try to manually load a citation for supplement 4
        console.log('\\nTrying to manually trigger citation loading for supplement 4...');
        
        const loadResult = await page.evaluate(async () => {
            try {
                if (typeof CitationLoader !== 'undefined') {
                    const loader = new CitationLoader();
                    const result = await loader.loadCitation(4);
                    return { success: true, result: !!result };
                }
                return { success: false, error: 'CitationLoader not found' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('Manual load result:', loadResult);
        
        // Check if citation is now loaded
        const citationCheck = await page.evaluate(() => {
            return {
                hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
                hasCitation4: window.enhancedCitations && window.enhancedCitations[4] ? true : false,
                citationKeys: window.enhancedCitations ? Object.keys(window.enhancedCitations) : []
            };
        });
        
        console.log('Citation check:', citationCheck);
        
        console.log('\\nKeeping browser open for manual inspection...');
        await page.waitForTimeout(30000); // Wait 30 seconds for manual inspection
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    } finally {
        await browser.close();
    }
    
    console.log('\\n🏁 Debug complete');
}

debugCitationLoading();