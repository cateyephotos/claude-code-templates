const puppeteer = require('playwright');

async function debugSpecificUndefined() {
    const browser = await puppeteer.chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Navigating to supplement database...');
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Find first enhanced supplement (Bacopa)
        const bacopaCard = await page.$('[data-supplement-id="1"]');
        if (!bacopaCard) {
            console.log('❌ Could not find Bacopa card');
            return;
        }
        
        console.log('🧪 Testing Bacopa monnieri specifically...');
        
        // Click to open modal
        const viewDetailsBtn = await bacopaCard.$('button:has-text("View Details")');
        await viewDetailsBtn.click();
        await page.waitForTimeout(1500);
        
        const modal = await page.$('.fixed.inset-0');
        if (!modal) {
            console.log('❌ Modal did not open');
            return;
        }
        
        console.log('📋 Modal opened, testing each tab...');
        
        // Test each tab and check for exact "Target undefined" text
        const tabs = await modal.$$('.citation-tab-btn');
        
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            const tabName = await tab.textContent();
            
            console.log(`\n📑 Testing tab: ${tabName?.trim()}`);
            
            await tab.click();
            await page.waitForTimeout(500);
            
            // Get the active tab content
            const activeTabContent = await modal.$('.citation-tab-content:not(.hidden)');
            if (activeTabContent) {
                // Check for specific patterns
                const tabHtml = await activeTabContent.innerHTML();
                const tabText = await activeTabContent.textContent();
                
                // Search for specific undefined patterns
                const patterns = [
                    /Target:\s*undefined/gi,
                    /Target undefined/gi,
                    /<strong>Target:<\/strong>\s*undefined/gi,
                    /tissueTarget.*undefined/gi,
                    /target.*undefined/gi
                ];
                
                console.log(`   Content length: ${tabText.length} characters`);
                
                let foundUndefined = false;
                patterns.forEach((pattern, index) => {
                    const matches = tabHtml.match(pattern);
                    if (matches && matches.length > 0) {
                        console.log(`   ❌ Pattern ${index + 1} found ${matches.length} matches: ${pattern}`);
                        console.log(`   First match context: ${matches[0]}`);
                        foundUndefined = true;
                    }
                });
                
                if (!foundUndefined) {
                    console.log(`   ✅ No undefined target patterns found in ${tabName?.trim()}`);
                } else {
                    // Get context around undefined matches
                    console.log('\n   🔍 HTML context around undefined:');
                    const lines = tabHtml.split('\n');
                    lines.forEach((line, lineIndex) => {
                        if (line.toLowerCase().includes('undefined') && line.toLowerCase().includes('target')) {
                            console.log(`   Line ${lineIndex + 1}: ${line.trim()}`);
                            // Show surrounding lines
                            if (lineIndex > 0) console.log(`   Line ${lineIndex}: ${lines[lineIndex - 1].trim()}`);
                            if (lineIndex < lines.length - 1) console.log(`   Line ${lineIndex + 2}: ${lines[lineIndex + 1].trim()}`);
                        }
                    });
                }
            }
        }
        
        // Close modal
        const closeBtn = await modal.$('button');
        if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(500);
        }
        
        console.log('\n✅ Debug complete');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await browser.close();
    }
}

// Run debug
debugSpecificUndefined().catch(console.error);