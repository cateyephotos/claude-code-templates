const { chromium } = require('playwright');

async function finalUndefinedVerification() {
    console.log('🎯 Final verification - checking for undefined target messages...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        
        // Wait for citations to load
        await page.waitForTimeout(3000);
        
        const fixedSupplements = [
            { id: 4, name: 'Omega-3 Fatty Acids' },
            { id: 6, name: 'Magnesium' },
            { id: 7, name: 'Vitamin D3' }
        ];
        
        for (const supplement of fixedSupplements) {
            console.log(`\\n📋 Testing ${supplement.name} (ID: ${supplement.id})`);
            
            // Check if citation data has undefined values
            const hasUndefinedInData = await page.evaluate((id) => {
                if (window.enhancedCitations && window.enhancedCitations[id]) {
                    const data = window.enhancedCitations[id];
                    const jsonString = JSON.stringify(data);
                    const undefinedMatches = jsonString.match(/undefined/g);
                    return undefinedMatches ? undefinedMatches.length : 0;
                }
                return -1; // Citation not loaded
            }, supplement.id);
            
            if (hasUndefinedInData === -1) {
                console.log(`   ❌ Citation not loaded`);
            } else if (hasUndefinedInData === 0) {
                console.log(`   ✅ Citation data is clean - no undefined values`);
            } else {
                console.log(`   ⚠️  Found ${hasUndefinedInData} undefined values in citation data`);
            }
            
            // Check if supplement card shows Phase 2A badge (indicates enhanced status)
            const card = page.locator(`[data-supplement-id="${supplement.id}"]`);
            await card.scrollIntoViewIfNeeded();
            
            const hasEnhancedBadge = await card.locator('.phase-2a-badge').count() > 0;
            console.log(`   📊 Phase 2A badge visible: ${hasEnhancedBadge}`);
            
            // Click the supplement to trigger any modal rendering that might show undefined
            try {
                await card.click();
                await page.waitForTimeout(1000);
                
                // Check if modal opened and look for undefined text
                const modalExists = await page.locator('.modal.active').count() > 0;
                if (modalExists) {
                    const modalText = await page.locator('.modal.active').textContent();
                    const undefinedInModal = (modalText.match(/undefined/g) || []).length;
                    console.log(`   🎯 Modal undefined count: ${undefinedInModal}`);
                    
                    // Close modal
                    await page.locator('.modal-close').click();
                    await page.waitForTimeout(500);
                }
                
            } catch (error) {
                console.log(`   ⚠️  Modal interaction failed: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    } finally {
        await browser.close();
    }
    
    console.log('\\n🏁 Final undefined verification complete!');
    console.log('\\n🎉 Summary: Fixed structural issues in enhanced citation files:');
    console.log('   - Removed duplicate target fields');
    console.log('   - Fixed field names (benefit→healthDomain, safetyDomain→safetyAspect, etc.)');
    console.log('   - Fixed syntax errors (missing commas)');
    console.log('   - Fixed browser compatibility issues (module.exports)');
    console.log('   - Increased preload limit to include target supplements');
}

finalUndefinedVerification();