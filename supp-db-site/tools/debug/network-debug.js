/**
 * Network Debug Investigation - Check what resources are loading
 */

const { chromium } = require('playwright');

async function debugNetworkRequests() {
    console.log('🌐 Starting network debug investigation...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Track network requests
    const requests = [];
    const responses = [];
    const failures = [];
    
    page.on('request', request => {
        requests.push({
            url: request.url(),
            method: request.method(),
            resourceType: request.resourceType()
        });
        console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
        responses.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
        });
        console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
    });
    
    page.on('requestfailed', request => {
        failures.push({
            url: request.url(),
            failure: request.failure()
        });
        console.log(`❌ FAILED: ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    // Track console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push({ type: msg.type(), text });
        console.log(`🖥️ CONSOLE [${msg.type()}]: ${text}`);
    });
    
    // Track JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => {
        jsErrors.push({ message: error.message, stack: error.stack });
        console.log(`💥 JS ERROR: ${error.message}`);
    });
    
    try {
        // Navigate and wait for network idle
        await page.goto('http://localhost:8000', { 
            waitUntil: 'networkidle',
            timeout: 15000 
        });
        
        // Wait for potential async loading
        await page.waitForTimeout(5000);
        
        // Check if key elements exist
        const elementChecks = await page.evaluate(() => {
            return {
                supplementGrid: !!document.getElementById('supplementGrid'),
                supplementDatabase: typeof window.supplementDatabase !== 'undefined',
                supplementDatabaseGlobal: !!window.supplementDatabase,
                modernApp: !!window.app,
                scriptTags: Array.from(document.querySelectorAll('script')).map(script => ({
                    src: script.src || 'inline',
                    type: script.type || 'text/javascript'
                }))
            };
        });
        
        // Try to access the database directly
        const databaseCheck = await page.evaluate(() => {
            // Check multiple ways the database might be available
            const checks = {
                windowSupplementDatabase: typeof window.supplementDatabase,
                globalSupplementDatabase: typeof supplementDatabase,
                anySupplementDatabase: typeof window.supplementDatabase !== 'undefined' || typeof supplementDatabase !== 'undefined'
            };
            
            // If database exists, get some info
            const database = window.supplementDatabase || (typeof supplementDatabase !== 'undefined' ? supplementDatabase : null);
            if (database) {
                checks.databaseInfo = {
                    hasSupplements: !!database.supplements,
                    supplementCount: database.supplements?.length || 0,
                    firstSupplementName: database.supplements?.[0]?.name || null,
                    firstSupplementBenefits: database.supplements?.[0]?.primaryBenefits || null
                };
            }
            
            return checks;
        });
        
        // Summary
        console.log('\n📊 === NETWORK DEBUG SUMMARY ===');
        console.log('Total requests:', requests.length);
        console.log('Failed requests:', failures.length);
        console.log('Console messages:', consoleMessages.length);
        console.log('JS errors:', jsErrors.length);
        console.log('Element checks:', JSON.stringify(elementChecks, null, 2));
        console.log('Database checks:', JSON.stringify(databaseCheck, null, 2));
        
        // Check specific script loading
        const scriptRequests = requests.filter(r => r.resourceType === 'script');
        console.log('\n📜 Script requests:');
        scriptRequests.forEach(req => console.log(`  - ${req.url}`));
        
        const scriptResponses = responses.filter(r => r.url.endsWith('.js'));
        console.log('\n📜 Script responses:');
        scriptResponses.forEach(res => console.log(`  - ${res.status} ${res.url}`));
        
        if (failures.length > 0) {
            console.log('\n❌ Request failures:');
            failures.forEach(fail => console.log(`  - ${fail.url}: ${fail.failure?.errorText}`));
        }
        
        if (jsErrors.length > 0) {
            console.log('\n💥 JavaScript errors:');
            jsErrors.forEach(err => console.log(`  - ${err.message}`));
        }
        
        await page.screenshot({ path: 'network-debug-screenshot.png', fullPage: true });
        
    } catch (error) {
        console.error('❌ Network debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugNetworkRequests().catch(console.error);