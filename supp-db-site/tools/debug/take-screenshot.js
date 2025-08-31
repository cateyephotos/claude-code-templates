const { chromium } = require('playwright');

async function takeScreenshot() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    try {
        // Navigate to the supplement database
        console.log('Navigating to http://localhost:8000...');
        await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait for the supplement grid to load
        console.log('Waiting for supplement grid...');
        await page.waitForSelector('#supplementGrid', { timeout: 15000 });
        
        // Wait a bit for JavaScript to load
        await page.waitForTimeout(5000);
        
        // Check what's in the grid
        const gridContent = await page.locator('#supplementGrid').innerHTML();
        console.log('Grid content preview:', gridContent.substring(0, 500));
        
        // Look for any cards that might have loaded
        const cardSelectors = [
            '[data-supplement-id]',
            '.bg-white.rounded-lg',
            '.supplement-card',
            '#supplementGrid > div'
        ];
        
        let cardsFound = false;
        for (const selector of cardSelectors) {
            const count = await page.locator(selector).count();
            console.log(`Found ${count} elements with selector: ${selector}`);
            if (count > 0) {
                cardsFound = true;
                break;
            }
        }
        
        if (!cardsFound) {
            console.log('No supplement cards found, checking for errors...');
            const errors = await page.evaluate(() => {
                const errorMessages = [];
                // Check console errors
                if (window.console && window.console.error) {
                    errorMessages.push('Console available');
                }
                // Check if app is loaded
                if (window.app) {
                    errorMessages.push('App instance found');
                } else {
                    errorMessages.push('No app instance found');
                }
                // Check if data is loaded
                if (window.supplementDatabase) {
                    errorMessages.push(`Database found with ${window.supplementDatabase.supplements?.length || 0} supplements`);
                } else {
                    errorMessages.push('No supplementDatabase found');
                }
                return errorMessages;
            });
            console.log('Page status:', errors);
        }
        
        // Take full page screenshot
        await page.screenshot({ 
            path: 'full-page-screenshot.png', 
            fullPage: true 
        });
        
        // Take viewport screenshot
        await page.screenshot({ 
            path: 'viewport-screenshot.png', 
            fullPage: false 
        });
        
        // Take screenshot of just the supplement cards section
        const supplementSection = await page.locator('#supplementGrid').first();
        await supplementSection.screenshot({ path: 'supplement-cards-section.png' });
        
        console.log('Screenshots taken successfully:');
        console.log('- full-page-screenshot.png (entire page)');
        console.log('- viewport-screenshot.png (viewport only)');
        console.log('- supplement-cards-section.png (cards section only)');
        
        // Get some basic metrics about the cards
        const cardCount = await page.locator('[data-supplement-id]').count();
        const gridElement = await page.locator('#supplementGrid').first();
        const gridBounds = await gridElement.boundingBox();
        
        console.log(`\nCard Analysis:`);
        console.log(`- Total cards visible: ${cardCount}`);
        console.log(`- Grid dimensions: ${gridBounds.width}x${gridBounds.height}px`);
        
        // Get individual card dimensions
        if (cardCount > 0) {
            const firstCard = await page.locator('[data-supplement-id]').first();
            const cardBounds = await firstCard.boundingBox();
            console.log(`- Individual card size: ${cardBounds.width}x${cardBounds.height}px`);
        }
        
    } catch (error) {
        console.error('Error taking screenshot:', error);
    } finally {
        await browser.close();
    }
}

takeScreenshot().catch(console.error);