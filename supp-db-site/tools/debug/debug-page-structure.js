/**
 * Debug Page Structure - See what's actually on the page
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function debugPageStructure() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Debugging page structure...');
    
    try {
        // Navigate to the supplement database
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // Allow full loading
        
        console.log('📊 Page loaded, analyzing structure...');
        
        // Take a screenshot first
        await page.screenshot({ path: 'debug-page-screenshot.png', fullPage: true });
        console.log('📸 Screenshot saved: debug-page-screenshot.png');
        
        // Get page title
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);
        
        // Get all elements with common card-like classes
        const cardSelectors = [
            '.supplement-card',
            '.card',
            '[class*="supplement"]',
            '.bg-white.border',
            '[class*="card"]',
            '.rounded',
            '.border',
            '.p-4',
            '.p-6'
        ];
        
        console.log('\n🔍 Testing card selectors:');
        for (const selector of cardSelectors) {
            try {
                const elements = await page.$$(selector);
                console.log(`  ${selector}: ${elements.length} elements`);
                
                if (elements.length > 0 && elements.length < 20) {
                    // Get text content of first few elements
                    for (let i = 0; i < Math.min(3, elements.length); i++) {
                        const text = await elements[i].textContent();
                        const preview = text ? text.substring(0, 100).replace(/\n/g, ' ') : 'No text';
                        console.log(`    [${i}]: ${preview}...`);
                    }
                }
            } catch (error) {
                console.log(`    ${selector}: Error - ${error.message}`);
            }
        }
        
        // Look for specific supplement names
        console.log('\n🔍 Looking for supplement names:');
        const supplementNames = [
            'Bacopa',
            'Omega-3',
            'Creatine',
            'Magnesium',
            'Turmeric',
            'Vitamin D',
            'Ashwagandha'
        ];
        
        for (const name of supplementNames) {
            try {
                const element = await page.$(`text=${name}`);
                if (element) {
                    console.log(`  ✅ Found: ${name}`);
                } else {
                    console.log(`  ❌ Not found: ${name}`);
                }
            } catch (error) {
                console.log(`  ⚠️ Error searching for ${name}: ${error.message}`);
            }
        }
        
        // Look for Phase 2A badges
        console.log('\n🔍 Looking for Phase 2A badges:');
        const badgeSelectors = [
            '.phase-2a-badge',
            '[class*="phase-2a"]',
            '[class*="enhanced"]',
            'text=Phase 2A',
            'text=Enhanced'
        ];
        
        for (const selector of badgeSelectors) {
            try {
                const elements = await page.$$(selector);
                console.log(`  ${selector}: ${elements.length} elements`);
            } catch (error) {
                console.log(`  ${selector}: Error - ${error.message}`);
            }
        }
        
        // Get all buttons
        console.log('\n🔍 Looking for buttons:');
        const buttons = await page.$$('button');
        console.log(`  Found ${buttons.length} buttons`);
        
        for (let i = 0; i < Math.min(10, buttons.length); i++) {
            const text = await buttons[i].textContent();
            console.log(`    Button ${i}: "${text}"`);
        }
        
        // Check for any error messages or loading states
        console.log('\n🔍 Checking for errors or loading states:');
        const errorSelectors = [
            'text=Error',
            'text=Loading',
            'text=Failed',
            '.error',
            '.loading'
        ];
        
        for (const selector of errorSelectors) {
            try {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    console.log(`  ⚠️ Found ${elements.length} elements with: ${selector}`);
                }
            } catch (error) {
                // Ignore errors for text selectors
            }
        }
        
        // Get the main content area
        console.log('\n🔍 Main content analysis:');
        const mainContent = await page.textContent('body');
        const contentPreview = mainContent ? mainContent.substring(0, 500).replace(/\s+/g, ' ') : 'No content';
        console.log(`Body content preview: ${contentPreview}...`);
        
        // Save page HTML for analysis
        const html = await page.content();
        fs.writeFileSync('debug-page-content.html', html);
        console.log('💾 Page HTML saved: debug-page-content.html');
        
        console.log('\n✅ Debug analysis complete');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the debug
debugPageStructure()
    .then(() => {
        console.log('\n🎯 Debug completed successfully');
    })
    .catch(error => {
        console.error('💥 Debug failed:', error);
        process.exit(1);
    });
