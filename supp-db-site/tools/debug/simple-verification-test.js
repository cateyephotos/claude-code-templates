const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function simpleVerificationTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('Navigating to supplement database...');
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle', timeout: 30000 });

        // Create screenshots directory
        const screenshotsDir = path.join(__dirname, 'verification-screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir);
        }

        console.log('Taking initial screenshot...');
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'initial-page.png'),
            fullPage: true
        });

        // Check what elements are actually present
        console.log('\n=== PAGE ANALYSIS ===');
        
        const title = await page.title();
        console.log(`Page title: ${title}`);
        
        const url = page.url();
        console.log(`Current URL: ${url}`);

        // Look for any supplement-related content
        const supplementCards = await page.locator('*[class*="supplement"]').count();
        console.log(`Elements with "supplement" in class: ${supplementCards}`);

        const cardElements = await page.locator('.card, .supplement-card, [class*="card"]').count();
        console.log(`Card-like elements found: ${cardElements}`);

        // Check for evidence bars
        const evidenceBars = await page.locator('*[class*="evidence"]').count();
        console.log(`Evidence-related elements: ${evidenceBars}`);

        // Check for any Phase 2A content
        const phase2AElements = await page.locator('*:has-text("Phase 2A")').count();
        console.log(`Phase 2A elements: ${phase2AElements}`);

        // Check for Bacopa content
        const bacopaElements = await page.locator('*:has-text("Bacopa")').count();
        console.log(`Bacopa-related elements: ${bacopaElements}`);

        // Get page content for debugging
        const bodyHTML = await page.locator('body').innerHTML();
        console.log(`\nBody HTML length: ${bodyHTML.length} characters`);
        
        // Save the HTML content for inspection
        fs.writeFileSync(path.join(screenshotsDir, 'page-content.html'), bodyHTML);

        // Check for JavaScript errors in console
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push(`${msg.type().toUpperCase()}: ${msg.text()}`);
        });

        // Wait a bit more and check console
        await page.waitForTimeout(3000);
        console.log(`\nConsole messages: ${consoleMessages.length}`);
        consoleMessages.forEach(msg => console.log(`  ${msg}`));

        // Check for specific classes we expect
        const specificClasses = [
            '.supplement-card',
            '.evidence-bar', 
            '.phase-2a-badge',
            '.tier',
            '.view-details',
            '#citationModal'
        ];

        console.log('\n=== CLASS EXISTENCE CHECK ===');
        for (const selector of specificClasses) {
            const count = await page.locator(selector).count();
            console.log(`${selector}: ${count} elements found`);
        }

        // Try to evaluate some JavaScript to check global variables
        console.log('\n=== JAVASCRIPT EVALUATION ===');
        const jsCheck = await page.evaluate(() => {
            return {
                hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
                hasSupplements: typeof window.supplements !== 'undefined',
                documentReady: document.readyState,
                bodyClasses: document.body.className,
                hasAppJs: !!document.querySelector('script[src*="app.js"]')
            };
        });
        
        console.log('JavaScript environment:', jsCheck);

        console.log('\n=== TEST COMPLETE ===');
        console.log(`Screenshots saved to: ${screenshotsDir}`);
        console.log(`Page content saved as: page-content.html`);

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
simpleVerificationTest().catch(console.error);