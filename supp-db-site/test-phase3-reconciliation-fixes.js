const { chromium } = require('playwright');
const fs = require('fs');

async function testPhase3ReconciliationFixes() {
    console.log('🔍 PHASE 3 RECONCILIATION VERIFICATION');
    console.log('=====================================');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Navigate to the site
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const results = {
            timestamp: new Date().toISOString(),
            testType: 'Phase 3 Reconciliation Verification',
            fixes: {
                lTheanine: { id: 9, status: 'unknown', details: {} },
                phosphatidylserine: { id: 12, status: 'unknown', details: {} },
                quercetin: { id: 20, status: 'unknown', details: {} },
                nadPrecursors: { id: 25, status: 'unknown', details: {} },
                hawthornBerry: { id: 59, status: 'unknown', details: {} }
            },
            summary: {
                totalTested: 5,
                working: 0,
                broken: 0,
                errors: []
            }
        };
        
        // Test each reconciled supplement
        const testSupplements = [
            { name: 'L-Theanine', id: 9, key: 'lTheanine' },
            { name: 'Phosphatidylserine', id: 12, key: 'phosphatidylserine' },
            { name: 'Quercetin', id: 20, key: 'quercetin' },
            { name: 'NAD+ Precursors', id: 25, key: 'nadPrecursors' },
            { name: 'Hawthorn Berry', id: 59, key: 'hawthornBerry' }
        ];
        
        for (const supplement of testSupplements) {
            console.log(`\n🧪 Testing ${supplement.name} (ID: ${supplement.id})`);
            
            try {
                // Find and click the supplement card
                const cardSelector = `[data-supplement-id="${supplement.id}"], .supplement-card:has-text("${supplement.name}")`;
                await page.waitForSelector('.supplement-card', { timeout: 5000 });
                
                // Try multiple ways to find the card
                let card = await page.locator(cardSelector).first();
                if (await card.count() === 0) {
                    // Try finding by text content
                    card = await page.locator('.supplement-card').filter({ hasText: supplement.name }).first();
                }
                
                if (await card.count() === 0) {
                    console.log(`   ❌ Card not found for ${supplement.name}`);
                    results.fixes[supplement.key].status = 'card_not_found';
                    results.summary.broken++;
                    continue;
                }
                
                console.log(`   ✅ Found card for ${supplement.name}`);
                
                // Click the card to open modal
                await card.click();
                await page.waitForTimeout(2000);
                
                // Check if modal opened
                const modal = await page.locator('.modal, .supplement-modal').first();
                if (await modal.count() === 0) {
                    console.log(`   ❌ Modal did not open for ${supplement.name}`);
                    results.fixes[supplement.key].status = 'modal_failed';
                    results.summary.broken++;
                    continue;
                }
                
                console.log(`   ✅ Modal opened for ${supplement.name}`);
                
                // Check for enhanced citation content
                const enhancedContent = await page.evaluate(() => {
                    const modal = document.querySelector('.modal, .supplement-modal');
                    if (!modal) return { found: false, reason: 'No modal found' };
                    
                    // Look for enhanced citation indicators
                    const evidenceProfile = modal.querySelector('[class*="evidence"], [class*="tier"], .research-quality');
                    const citationCount = modal.textContent.includes('citations') || modal.textContent.includes('studies');
                    const hasDetailedContent = modal.textContent.length > 500;
                    
                    return {
                        found: true,
                        hasEvidenceProfile: !!evidenceProfile,
                        hasCitationCount: citationCount,
                        hasDetailedContent: hasDetailedContent,
                        contentLength: modal.textContent.length,
                        modalClasses: modal.className
                    };
                });
                
                if (enhancedContent.found && (enhancedContent.hasEvidenceProfile || enhancedContent.hasDetailedContent)) {
                    console.log(`   ✅ Enhanced citations working for ${supplement.name}`);
                    console.log(`      - Content length: ${enhancedContent.contentLength} chars`);
                    console.log(`      - Evidence profile: ${enhancedContent.hasEvidenceProfile ? 'Yes' : 'No'}`);
                    console.log(`      - Citation indicators: ${enhancedContent.hasCitationCount ? 'Yes' : 'No'}`);
                    
                    results.fixes[supplement.key].status = 'working';
                    results.fixes[supplement.key].details = enhancedContent;
                    results.summary.working++;
                } else {
                    console.log(`   ❌ Enhanced citations not working for ${supplement.name}`);
                    console.log(`      - Content length: ${enhancedContent.contentLength || 0} chars`);
                    
                    results.fixes[supplement.key].status = 'enhanced_citations_missing';
                    results.fixes[supplement.key].details = enhancedContent;
                    results.summary.broken++;
                }
                
                // Close modal
                const closeButton = await page.locator('.close, .modal-close, [aria-label="Close"]').first();
                if (await closeButton.count() > 0) {
                    await closeButton.click();
                    await page.waitForTimeout(1000);
                } else {
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(1000);
                }
                
            } catch (error) {
                console.log(`   ❌ Error testing ${supplement.name}: ${error.message}`);
                results.fixes[supplement.key].status = 'error';
                results.fixes[supplement.key].details = { error: error.message };
                results.summary.broken++;
                results.summary.errors.push(`${supplement.name}: ${error.message}`);
            }
        }
        
        // Generate summary
        console.log('\n📊 RECONCILIATION TEST SUMMARY');
        console.log('==============================');
        console.log(`✅ Working: ${results.summary.working}/${results.summary.totalTested}`);
        console.log(`❌ Broken: ${results.summary.broken}/${results.summary.totalTested}`);
        console.log(`📈 Success Rate: ${Math.round((results.summary.working / results.summary.totalTested) * 100)}%`);
        
        if (results.summary.errors.length > 0) {
            console.log('\n🚨 Errors encountered:');
            results.summary.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        // Save detailed results
        fs.writeFileSync('phase3-reconciliation-test-results.json', JSON.stringify(results, null, 2));
        console.log('\n💾 Detailed results saved to: phase3-reconciliation-test-results.json');
        
        return results;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
testPhase3ReconciliationFixes()
    .then(results => {
        console.log('\n🎉 Phase 3 reconciliation test completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
