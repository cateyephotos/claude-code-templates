const puppeteer = require('playwright');

async function verifySupplementsSimple() {
    const browser = await puppeteer.chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Navigating to supplement database...');
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        
        // Wait longer for app to fully initialize
        console.log('⏳ Waiting for app to initialize...');
        await page.waitForTimeout(5000);
        
        // Try different selectors to find supplement cards
        console.log('🔍 Searching for supplement cards with different selectors...');
        
        const selectors = ['.supplement-card', '[data-supplement-id]', '.card', '.supplement'];
        let cards = [];
        
        for (const selector of selectors) {
            cards = await page.$$(selector);
            if (cards.length > 0) {
                console.log(`Found ${cards.length} elements with selector: ${selector}`);
                break;
            }
        }
        
        if (cards.length === 0) {
            // Check the page structure
            console.log('📋 No supplement cards found. Checking page structure...');
            
            const bodyText = await page.evaluate(() => {
                return document.body.innerText.substring(0, 500);
            });
            
            console.log('Page content preview:', bodyText);
            
            // Check for specific elements
            const hasSupplementDatabase = await page.$('#supplement-app') !== null;
            const hasCardsArea = await page.$('#supplement-cards') !== null;
            const hasAnyCards = await page.$('.bg-white') !== null;
            
            console.log('Page structure check:');
            console.log('  Has supplement app:', hasSupplementDatabase);
            console.log('  Has cards area:', hasCardsArea);
            console.log('  Has any white bg elements:', hasAnyCards);
            
            // Try to wait for specific elements
            try {
                await page.waitForSelector('#supplement-cards', { timeout: 10000 });
                console.log('✓ Cards container found, waiting for cards...');
                await page.waitForTimeout(3000);
                cards = await page.$$('.supplement-card');
                console.log(`Found ${cards.length} supplement cards after waiting`);
            } catch (error) {
                console.log('❌ Timeout waiting for cards container');
            }
        }
        
        // Search for any text containing "undefined" in the page
        console.log('\n🔍 Searching entire page for "undefined" text...');
        
        const pageText = await page.evaluate(() => document.body.innerText);
        const undefinedMatches = pageText.match(/undefined/gi) || [];
        const targetUndefinedMatches = pageText.match(/target undefined/gi) || [];
        
        console.log(`Found ${undefinedMatches.length} instances of "undefined" in page text`);
        console.log(`Found ${targetUndefinedMatches.length} instances of "target undefined" in page text`);
        
        if (undefinedMatches.length > 0) {
            // Find context around "undefined" occurrences
            const lines = pageText.split('\n');
            const undefinedLines = lines.filter(line => line.toLowerCase().includes('undefined'));
            
            console.log('\n❌ Lines containing "undefined":');
            undefinedLines.slice(0, 10).forEach((line, index) => {
                console.log(`${index + 1}. ${line.trim()}`);
            });
            
            if (undefinedLines.length > 10) {
                console.log(`... and ${undefinedLines.length - 10} more lines`);
            }
        }
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'verification-screenshot.png', fullPage: true });
        console.log('📸 Screenshot saved as verification-screenshot.png');
        
        const report = {
            timestamp: new Date().toISOString(),
            cardsFound: cards.length,
            undefinedOccurrences: undefinedMatches.length,
            targetUndefinedOccurrences: targetUndefinedMatches.length,
            pageLoadedSuccessfully: cards.length > 0,
            undefinedContextLines: pageText.split('\n').filter(line => line.toLowerCase().includes('undefined')).slice(0, 20)
        };
        
        if (undefinedMatches.length === 0) {
            console.log('\n🎉 SUCCESS: No "undefined" text found anywhere on the page!');
        } else {
            console.log('\n⚠️  Found "undefined" text in page content - see details above');
        }
        
        return report;
        
    } catch (error) {
        console.error('❌ Verification failed:', error);
        return { error: error.message };
    } finally {
        await browser.close();
    }
}

// Run verification
verifySupplementsSimple().then(report => {
    const fs = require('fs');
    fs.writeFileSync('simple-verification-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to simple-verification-report.json');
}).catch(console.error);