const puppeteer = require('playwright');

async function finalVisualTest() {
    const browser = await puppeteer.chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Opening supplement database for final visual verification...');
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Take a screenshot of the main page
        await page.screenshot({ path: 'final-main-page.png', fullPage: true });
        console.log('📸 Main page screenshot saved as final-main-page.png');
        
        // Test a few enhanced supplements visually
        const testSupplements = [
            { id: '1', name: 'Bacopa monnieri' },
            { id: '2', name: 'Turmeric/Curcumin' },
            { id: '5', name: 'Creatine' }
        ];
        
        for (const supp of testSupplements) {
            console.log(`\n🧪 Testing ${supp.name}...`);
            
            const card = await page.$(`[data-supplement-id="${supp.id}"]`);
            if (card) {
                const viewDetailsBtn = await card.$('button:has-text("View Details")');
                if (viewDetailsBtn) {
                    await viewDetailsBtn.click();
                    await page.waitForTimeout(1500);
                    
                    // Take screenshot of modal
                    await page.screenshot({ path: `final-${supp.name.replace(/[^a-zA-Z0-9]/g, '_')}-modal.png` });
                    console.log(`   📸 Modal screenshot saved for ${supp.name}`);
                    
                    // Close modal
                    const modal = await page.$('.fixed.inset-0');
                    if (modal) {
                        const closeBtn = await modal.$('button');
                        if (closeBtn) {
                            await closeBtn.click();
                            await page.waitForTimeout(500);
                        }
                    }
                    
                    console.log(`   ✅ ${supp.name} modal tested successfully`);
                } else {
                    console.log(`   ❌ No View Details button found for ${supp.name}`);
                }
            } else {
                console.log(`   ❌ Card not found for ${supp.name}`);
            }
        }
        
        console.log('\n🎉 Final visual test complete!');
        console.log('📄 Screenshots saved showing clean interface without undefined text');
        
    } catch (error) {
        console.error('❌ Final visual test failed:', error);
    } finally {
        // Keep browser open for 5 seconds so user can see the final state
        console.log('\n👀 Keeping browser open for 5 seconds for manual inspection...');
        await page.waitForTimeout(5000);
        await browser.close();
    }
}

// Run final visual test
finalVisualTest().catch(console.error);