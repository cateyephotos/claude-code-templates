const puppeteer = require('playwright');

async function verifyEnhancedSupplements() {
    const browser = await puppeteer.chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('🌐 Navigating to supplement database...');
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Find all supplement cards with Phase 2A badges (enhanced citations)
        console.log('🔍 Finding enhanced supplements with Phase 2A badges...');
        
        const enhancedCards = await page.$$('[data-supplement-id]');
        console.log(`Found ${enhancedCards.length} total supplement cards`);
        
        const enhancedSupplements = [];
        
        for (let i = 0; i < Math.min(enhancedCards.length, 10); i++) { // Test first 10 for speed
            const card = enhancedCards[i];
            
            try {
                const supplementId = await card.getAttribute('data-supplement-id');
                const supplementName = await card.$eval('h3', el => el.textContent?.trim());
                
                // Check if this card has a Phase 2A badge
                const hasBadge = await card.$('.phase-2a-badge') !== null;
                
                if (hasBadge) {
                    console.log(`\n✨ Testing enhanced supplement: ${supplementName} (ID: ${supplementId})`);
                    
                    // Click View Details button
                    const viewDetailsBtn = await card.$('button:has-text("View Details")');
                    if (viewDetailsBtn) {
                        await viewDetailsBtn.click();
                        await page.waitForTimeout(1500);
                        
                        // Check if modal opened
                        const modal = await page.$('.fixed.inset-0');
                        if (modal) {
                            console.log(`   📋 Modal opened successfully`);
                            
                            // Check modal content for "undefined"
                            const modalText = await modal.textContent();
                            const hasUndefined = modalText?.includes('undefined') || modalText?.includes('Target undefined');
                            
                            // Test all tabs
                            const tabs = await modal.$$('.citation-tab-btn');
                            console.log(`   📑 Testing ${tabs.length} citation tabs...`);
                            
                            const tabResults = [];
                            for (let j = 0; j < tabs.length; j++) {
                                const tab = tabs[j];
                                const tabName = await tab.textContent();
                                
                                await tab.click();
                                await page.waitForTimeout(500);
                                
                                const tabContent = await modal.$('.citation-tab-content:not(.hidden)');
                                if (tabContent) {
                                    const tabText = await tabContent.textContent();
                                    const tabHasUndefined = tabText?.includes('undefined') || tabText?.includes('Target undefined');
                                    
                                    tabResults.push({
                                        tabName: tabName?.trim(),
                                        hasUndefined: tabHasUndefined,
                                        hasContent: tabText && tabText.length > 50
                                    });
                                    
                                    console.log(`     📄 ${tabName?.trim()}: ${tabHasUndefined ? '❌ HAS UNDEFINED' : '✅ Clean'} (${tabText ? 'Has content' : 'No content'})`);
                                }
                            }
                            
                            enhancedSupplements.push({
                                supplementId,
                                supplementName,
                                modalOpened: true,
                                hasUndefined: hasUndefined,
                                tabsCount: tabs.length,
                                tabResults: tabResults,
                                allTabsClean: tabResults.every(tab => !tab.hasUndefined)
                            });
                            
                            // Close modal
                            const closeBtn = await modal.$('button');
                            if (closeBtn) {
                                await closeBtn.click();
                                await page.waitForTimeout(500);
                            }
                            
                            console.log(`   ✅ ${supplementName}: ${hasUndefined ? '❌ HAS UNDEFINED' : '✅ ALL CLEAN'}`);
                        } else {
                            console.log(`   ❌ Modal failed to open for ${supplementName}`);
                        }
                    }
                }
            } catch (error) {
                console.error(`   ❌ Error testing supplement ${i + 1}:`, error.message);
            }
        }
        
        console.log(`\n📊 ENHANCED SUPPLEMENTS VERIFICATION SUMMARY:`);
        console.log(`   Enhanced supplements tested: ${enhancedSupplements.length}`);
        console.log(`   Supplements with undefined issues: ${enhancedSupplements.filter(s => s.hasUndefined).length}`);
        console.log(`   Supplements with all tabs clean: ${enhancedSupplements.filter(s => s.allTabsClean).length}`);
        
        if (enhancedSupplements.length > 0 && enhancedSupplements.every(s => s.allTabsClean && !s.hasUndefined)) {
            console.log(`\n🎉 SUCCESS: All enhanced supplements are free of undefined target issues!`);
        } else if (enhancedSupplements.some(s => s.hasUndefined || !s.allTabsClean)) {
            console.log(`\n⚠️  Some enhanced supplements may have issues - see details above`);
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            totalCardsChecked: Math.min(enhancedCards.length, 10),
            enhancedSupplementsFound: enhancedSupplements.length,
            allClean: enhancedSupplements.every(s => s.allTabsClean && !s.hasUndefined),
            enhancedSupplements: enhancedSupplements
        };
        
        return report;
        
    } catch (error) {
        console.error('❌ Enhanced supplements verification failed:', error);
        return { error: error.message };
    } finally {
        await browser.close();
    }
}

// Run verification
verifyEnhancedSupplements().then(report => {
    const fs = require('fs');
    fs.writeFileSync('enhanced-supplements-verification-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Enhanced supplements report saved to enhanced-supplements-verification-report.json');
}).catch(console.error);