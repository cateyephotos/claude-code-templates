const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function comprehensiveVerificationTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the supplement database
    console.log('Navigating to supplement database...');
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'verification-screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    console.log('\n=== CRITICAL VERIFICATION TESTS ===\n');

    // 1. Evidence Bar Proportionality Fix
    console.log('1. Testing Evidence Bar Proportionality Fix...');
    
    // Take full page screenshot showing all evidence bars
    await page.screenshot({ 
        path: path.join(screenshotsDir, '01-evidence-bars-overview.png'),
        fullPage: true
    });

    // Check evidence bars for different tiers
    const evidenceBars = await page.locator('.evidence-bar').all();
    console.log(`Found ${evidenceBars.length} evidence bars`);

    // Analyze evidence bars by tier
    const tierAnalysis = {};
    for (let i = 0; i < evidenceBars.length; i++) {
        const bar = evidenceBars[i];
        const supplementCard = bar.locator('xpath=ancestor::*[contains(@class, "supplement-card")]');
        const tierElement = await supplementCard.locator('.tier').textContent();
        const width = await bar.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.width;
        });
        const backgroundColor = await bar.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.backgroundColor;
        });
        
        const tier = tierElement.replace('Tier ', '');
        if (!tierAnalysis[tier]) {
            tierAnalysis[tier] = [];
        }
        tierAnalysis[tier].push({ width, backgroundColor });
    }

    console.log('\nEvidence Bar Analysis by Tier:');
    Object.keys(tierAnalysis).forEach(tier => {
        const bars = tierAnalysis[tier];
        console.log(`Tier ${tier}: ${bars.length} supplements`);
        bars.forEach((bar, idx) => {
            console.log(`  - Bar ${idx + 1}: Width=${bar.width}, Color=${bar.backgroundColor}`);
        });
    });

    // 2. Enhanced Citation Modal Loading Fix
    console.log('\n2. Testing Enhanced Citation Modal Loading Fix...');
    
    // Look for Bacopa monnieri with Phase 2A Enhanced
    const bacopaCard = await page.locator('.supplement-card').filter({ 
        hasText: 'Bacopa monnieri' 
    }).first();
    
    // Check if Phase 2A badge exists
    const phase2ABadge = await bacopaCard.locator('.phase-2a-badge').isVisible();
    console.log(`Phase 2A badge visible: ${phase2ABadge}`);
    
    // Take screenshot of Bacopa card
    await bacopaCard.screenshot({ 
        path: path.join(screenshotsDir, '02-bacopa-card.png')
    });

    // Click "View Details" on Bacopa monnieri
    const viewDetailsButton = bacopaCard.locator('.view-details');
    await viewDetailsButton.click();
    await page.waitForTimeout(2000); // Wait for modal to load

    // Check if enhanced citation modal opened
    const modal = await page.locator('#citationModal').isVisible();
    console.log(`Enhanced citation modal opened: ${modal}`);
    
    if (modal) {
        // Take screenshot of modal
        await page.locator('#citationModal').screenshot({ 
            path: path.join(screenshotsDir, '03-enhanced-citation-modal.png')
        });

        // 3. Tab Content Verification
        console.log('\n3. Testing Tab Content Verification...');
        
        // Check for Enhanced Evidence Profile
        const qualityScore = await page.locator('.quality-score').textContent().catch(() => 'Not found');
        console.log(`Quality Score: ${qualityScore}`);
        
        // Test clicking between tabs
        const tabs = ['mechanisms-tab', 'benefits-tab', 'safety-tab'];
        for (const tabId of tabs) {
            const tab = page.locator(`#${tabId}`);
            if (await tab.isVisible()) {
                console.log(`Clicking ${tabId}...`);
                await tab.click();
                await page.waitForTimeout(1000);
                
                // Take screenshot of each tab
                await page.screenshot({ 
                    path: path.join(screenshotsDir, `04-${tabId}.png`)
                });
                
                // Check for content in active tab
                const activeContent = await page.locator('.tab-content.active').textContent();
                console.log(`${tabId} content length: ${activeContent.length} characters`);
            }
        }

        // Close modal
        const closeButton = page.locator('.modal .close');
        if (await closeButton.isVisible()) {
            await closeButton.click();
        }
    }

    // 4. JavaScript Console Monitoring
    console.log('\n4. Testing JavaScript Console Monitoring...');
    
    // Check for enhanced citations in global scope
    const enhancedCitationsCheck = await page.evaluate(() => {
        try {
            const citations = window.enhancedCitations;
            if (citations && citations[1]) {
                return {
                    available: true,
                    hasData: Object.keys(citations[1]).length > 0,
                    qualityScore: citations[1].qualityScore || 'Not found',
                    totalCitations: citations[1].totalCitations || 'Not found',
                    researchSpan: citations[1].researchSpan || 'Not found'
                };
            }
            return { available: false };
        } catch (error) {
            return { available: false, error: error.message };
        }
    });

    console.log('Enhanced Citations Global Check:', enhancedCitationsCheck);

    // Check for console errors
    const consoleMessages = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleMessages.push(`ERROR: ${msg.text()}`);
        }
    });

    // 5. Visual Quality Checks
    console.log('\n5. Testing Visual Quality Checks...');
    
    // Take final comprehensive screenshot
    await page.screenshot({ 
        path: path.join(screenshotsDir, '05-final-comprehensive-view.png'),
        fullPage: true
    });

    // Check supplement cards layout
    const supplementCards = await page.locator('.supplement-card').all();
    console.log(`Total supplement cards found: ${supplementCards.length}`);

    // Generate test report
    const testReport = {
        timestamp: new Date().toISOString(),
        evidenceBarAnalysis: tierAnalysis,
        enhancedCitationsCheck,
        phase2ABadgeVisible: phase2ABadge,
        modalOpened: modal,
        totalSupplements: supplementCards.length,
        consoleErrors: consoleMessages,
        screenshotsTaken: [
            '01-evidence-bars-overview.png',
            '02-bacopa-card.png',
            '03-enhanced-citation-modal.png',
            '04-mechanisms-tab.png',
            '04-benefits-tab.png',
            '04-safety-tab.png',
            '05-final-comprehensive-view.png'
        ]
    };

    // Save test report
    fs.writeFileSync(
        path.join(__dirname, 'verification-test-report.json'),
        JSON.stringify(testReport, null, 2)
    );

    console.log('\n=== TEST REPORT SUMMARY ===');
    console.log(`✓ Evidence bars analyzed for ${Object.keys(tierAnalysis).length} tiers`);
    console.log(`✓ Phase 2A badge visible: ${phase2ABadge}`);
    console.log(`✓ Enhanced citation modal opened: ${modal}`);
    console.log(`✓ Enhanced citations globally available: ${enhancedCitationsCheck.available}`);
    console.log(`✓ Console errors detected: ${consoleMessages.length}`);
    console.log(`✓ Screenshots saved to: ${screenshotsDir}`);
    console.log(`✓ Full test report saved: verification-test-report.json`);

    await browser.close();
}

// Run the test
comprehensiveVerificationTest().catch(console.error);