const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugJSLoading() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });

    // Collect network errors
    const networkErrors = [];
    page.on('response', response => {
        if (response.status() >= 400) {
            networkErrors.push({
                url: response.url(),
                status: response.status(),
                statusText: response.statusText()
            });
        }
    });

    try {
        console.log('Navigating to supplement database...');
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle', timeout: 60000 });

        // Wait for JavaScript to execute
        await page.waitForTimeout(5000);

        console.log('\n=== CONSOLE MESSAGES ===');
        consoleMessages.forEach(msg => {
            console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
            if (msg.location) {
                console.log(`  Location: ${msg.location.url}:${msg.location.lineNumber}:${msg.location.columnNumber}`);
            }
        });

        console.log('\n=== NETWORK ERRORS ===');
        networkErrors.forEach(err => {
            console.log(`[${err.status}] ${err.url} - ${err.statusText}`);
        });

        // Check JavaScript environment
        console.log('\n=== JAVASCRIPT ENVIRONMENT ===');
        const jsEnv = await page.evaluate(() => {
            return {
                hasSupplementDatabase: typeof supplementDatabase !== 'undefined',
                hasSupplements: typeof supplementDatabase !== 'undefined' ? (supplementDatabase.supplements ? supplementDatabase.supplements.length : 'no supplements property') : 'no supplementDatabase',
                hasAppInstance: typeof app !== 'undefined',
                hasWindowApp: typeof window.app !== 'undefined',
                hasEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
                documentReadyState: document.readyState,
                loadedScripts: Array.from(document.querySelectorAll('script[src]')).map(script => ({
                    src: script.src,
                    type: script.type,
                    loaded: script.readyState || 'unknown'
                })),
                moduleScriptErrors: window.moduleScriptErrors || 'no errors recorded',
                globalVariables: Object.keys(window).filter(key => key.includes('supplement') || key.includes('app') || key.includes('citation'))
            };
        });

        console.log('JavaScript Environment:', JSON.stringify(jsEnv, null, 2));

        // Try to manually trigger app initialization
        console.log('\n=== MANUAL APP INITIALIZATION ===');
        const manualInit = await page.evaluate(() => {
            try {
                if (typeof SupplementDatabase !== 'undefined') {
                    console.log('SupplementDatabase class found, attempting to instantiate...');
                    window.app = new SupplementDatabase();
                    return { success: true, message: 'App initialized manually' };
                } else {
                    return { success: false, message: 'SupplementDatabase class not found' };
                }
            } catch (error) {
                return { success: false, message: `Error initializing app: ${error.message}` };
            }
        });

        console.log('Manual initialization result:', manualInit);

        // Wait a bit more and check for supplement cards
        await page.waitForTimeout(3000);
        
        const supplementCards = await page.locator('.supplement-card').count();
        console.log(`\nSupplement cards after manual init: ${supplementCards}`);

        if (supplementCards > 0) {
            console.log('SUCCESS: Supplement cards are now visible!');
            
            // Take screenshot
            const screenshotsDir = path.join(__dirname, 'verification-screenshots');
            if (!fs.existsSync(screenshotsDir)) {
                fs.mkdirSync(screenshotsDir);
            }
            
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'debug-working-state.png'),
                fullPage: true
            });
            
            // Now run our verification tests
            await runVerificationTests(page, screenshotsDir);
        }

        // Save debug report
        const debugReport = {
            timestamp: new Date().toISOString(),
            consoleMessages,
            networkErrors,
            jsEnvironment: jsEnv,
            manualInitResult: manualInit,
            supplementCardsFound: supplementCards
        };

        fs.writeFileSync(
            path.join(__dirname, 'debug-report.json'),
            JSON.stringify(debugReport, null, 2)
        );

    } catch (error) {
        console.error('Debug test error:', error);
    } finally {
        await browser.close();
    }
}

async function runVerificationTests(page, screenshotsDir) {
    console.log('\n=== RUNNING VERIFICATION TESTS ===');
    
    // 1. Evidence Bar Proportionality Test
    console.log('\n1. Testing Evidence Bars...');
    const evidenceBars = await page.locator('.evidence-bar').all();
    console.log(`Found ${evidenceBars.length} evidence bars`);
    
    if (evidenceBars.length > 0) {
        const tierAnalysis = {};
        for (let i = 0; i < evidenceBars.length && i < 10; i++) { // Check first 10 bars
            const bar = evidenceBars[i];
            try {
                const supplementCard = bar.locator('xpath=ancestor::*[contains(@class, "supplement-card")]');
                const tierText = await supplementCard.locator('.tier').textContent();
                const width = await bar.evaluate(el => window.getComputedStyle(el).width);
                const backgroundColor = await bar.evaluate(el => window.getComputedStyle(el).backgroundColor);
                
                const tier = tierText ? tierText.replace('Tier ', '') : 'unknown';
                if (!tierAnalysis[tier]) tierAnalysis[tier] = [];
                tierAnalysis[tier].push({ width, backgroundColor });
                
                console.log(`  Bar ${i + 1}: Tier ${tier}, Width: ${width}, Color: ${backgroundColor}`);
            } catch (error) {
                console.log(`  Bar ${i + 1}: Error analyzing - ${error.message}`);
            }
        }
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'evidence-bars-analysis.png'),
            fullPage: true
        });
    }
    
    // 2. Phase 2A Enhanced Modal Test
    console.log('\n2. Testing Enhanced Citation Modal...');
    const bacopaCard = await page.locator('.supplement-card').filter({ hasText: 'Bacopa' }).first();
    if (await bacopaCard.isVisible()) {
        console.log('Bacopa card found!');
        
        // Check for Phase 2A badge
        const phase2ABadge = await bacopaCard.locator('.phase-2a-badge').isVisible();
        console.log(`Phase 2A badge visible: ${phase2ABadge}`);
        
        // Take screenshot of Bacopa card
        await bacopaCard.screenshot({ 
            path: path.join(screenshotsDir, 'bacopa-card-verification.png')
        });
        
        // Click View Details
        const viewDetailsBtn = bacopaCard.locator('.view-details');
        if (await viewDetailsBtn.isVisible()) {
            await viewDetailsBtn.click();
            await page.waitForTimeout(2000);
            
            const modal = await page.locator('#citationModal').isVisible();
            console.log(`Enhanced citation modal opened: ${modal}`);
            
            if (modal) {
                await page.screenshot({ 
                    path: path.join(screenshotsDir, 'enhanced-modal-verification.png')
                });
                
                // Test tabs
                const tabs = ['mechanisms-tab', 'benefits-tab', 'safety-tab'];
                for (const tabId of tabs) {
                    const tab = page.locator(`#${tabId}`);
                    if (await tab.isVisible()) {
                        await tab.click();
                        await page.waitForTimeout(1000);
                        console.log(`Clicked ${tabId}`);
                    }
                }
                
                // Close modal
                const closeBtn = page.locator('.modal .close');
                if (await closeBtn.isVisible()) {
                    await closeBtn.click();
                }
            }
        }
    } else {
        console.log('Bacopa card not found');
    }
    
    // 3. JavaScript Console Check
    console.log('\n3. Testing JavaScript Global Variables...');
    const globalCheck = await page.evaluate(() => {
        return {
            enhancedCitationsAvailable: typeof window.enhancedCitations !== 'undefined',
            enhancedCitation1: window.enhancedCitations && window.enhancedCitations[1] ? 
                {
                    qualityScore: window.enhancedCitations[1].qualityScore,
                    totalCitations: window.enhancedCitations[1].totalCitations,
                    researchSpan: window.enhancedCitations[1].researchSpan
                } : null
        };
    });
    
    console.log('Global variables check:', globalCheck);
    
    console.log('\n=== VERIFICATION TESTS COMPLETE ===');
}

// Run the debug test
debugJSLoading().catch(console.error);