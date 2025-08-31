const puppeteer = require('playwright');

async function verifyAllSupplements() {
    const browser = await puppeteer.chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Capture console messages and errors
    const issues = [];
    const consoleMessages = [];
    
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push({ type: msg.type(), text: text });
        
        if (text.includes('undefined') || text.includes('Target undefined')) {
            issues.push({
                type: 'console_error',
                message: text,
                location: msg.location()
            });
        }
    });
    
    page.on('pageerror', err => {
        issues.push({
            type: 'page_error',
            message: err.message
        });
    });
    
    try {
        console.log('🌐 Navigating to supplement database...');
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        
        // Wait for the app to initialize
        await page.waitForTimeout(3000);
        
        console.log('🔍 Finding all supplement cards...');
        const supplementCards = await page.$$('.supplement-card');
        console.log(`Found ${supplementCards.length} supplement cards to verify`);
        
        const verificationResults = [];
        
        for (let i = 0; i < supplementCards.length; i++) {
            const card = supplementCards[i];
            
            try {
                // Get supplement info
                const supplementName = await card.$eval('h3', el => el.textContent?.trim() || 'Unknown');
                const supplementId = await card.getAttribute('data-supplement-id');
                
                console.log(`\n📊 Verifying supplement ${i + 1}/${supplementCards.length}: ${supplementName} (ID: ${supplementId})`);
                
                // Check if card text contains "undefined"
                const cardText = await card.textContent();
                const hasUndefinedInCard = cardText?.includes('undefined') || cardText?.includes('Target undefined');
                
                if (hasUndefinedInCard) {
                    issues.push({
                        type: 'card_undefined_text',
                        supplementId: supplementId,
                        supplementName: supplementName,
                        cardText: cardText?.substring(0, 200) + '...'
                    });
                }
                
                // Check if card has Phase 2A badge (enhanced citations)
                const hasPhase2ABadge = await card.$('.phase-2a-badge') !== null;
                
                let modalVerification = null;
                
                if (hasPhase2ABadge) {
                    console.log(`   ✨ Enhanced supplement detected - testing modal...`);
                    
                    // Click the "View Details" button
                    const viewDetailsBtn = await card.$('button:has-text("View Details")');
                    if (viewDetailsBtn) {
                        await viewDetailsBtn.click();
                        await page.waitForTimeout(1000);
                        
                        // Check if modal opened
                        const modal = await page.$('.fixed.inset-0');
                        if (modal) {
                            console.log(`   📋 Modal opened - checking for undefined text...`);
                            
                            // Check modal content for "undefined"
                            const modalText = await modal.textContent();
                            const modalHasUndefined = modalText?.includes('undefined') || modalText?.includes('Target undefined');
                            
                            if (modalHasUndefined) {
                                issues.push({
                                    type: 'modal_undefined_text',
                                    supplementId: supplementId,
                                    supplementName: supplementName,
                                    modalText: modalText?.substring(0, 300) + '...'
                                });
                            }
                            
                            // Test all tabs in the modal
                            const tabs = await modal.$$('.citation-tab-btn');
                            console.log(`   📑 Testing ${tabs.length} citation tabs...`);
                            
                            const tabResults = [];
                            for (let j = 0; j < tabs.length; j++) {
                                const tab = tabs[j];
                                const tabText = await tab.textContent();
                                
                                await tab.click();
                                await page.waitForTimeout(500);
                                
                                // Check tab content for undefined
                                const tabContent = await modal.$('.citation-tab-content:not(.hidden)');
                                if (tabContent) {
                                    const tabContentText = await tabContent.textContent();
                                    const tabHasUndefined = tabContentText?.includes('undefined') || tabContentText?.includes('Target undefined');
                                    
                                    tabResults.push({
                                        tabName: tabText?.trim(),
                                        hasUndefined: tabHasUndefined,
                                        contentPreview: tabContentText?.substring(0, 100) + '...'
                                    });
                                    
                                    if (tabHasUndefined) {
                                        issues.push({
                                            type: 'tab_undefined_text',
                                            supplementId: supplementId,
                                            supplementName: supplementName,
                                            tabName: tabText?.trim(),
                                            tabContent: tabContentText?.substring(0, 300) + '...'
                                        });
                                    }
                                }
                            }
                            
                            modalVerification = {
                                modalOpened: true,
                                hasUndefined: modalHasUndefined,
                                tabsCount: tabs.length,
                                tabResults: tabResults
                            };
                            
                            // Close modal
                            const closeBtn = await modal.$('button:has-text("×")');
                            if (closeBtn) {
                                await closeBtn.click();
                                await page.waitForTimeout(500);
                            }
                        } else {
                            modalVerification = { modalOpened: false };
                            issues.push({
                                type: 'modal_failed_to_open',
                                supplementId: supplementId,
                                supplementName: supplementName
                            });
                        }
                    }
                }
                
                verificationResults.push({
                    supplementId: supplementId,
                    supplementName: supplementName,
                    hasPhase2ABadge: hasPhase2ABadge,
                    hasUndefinedInCard: hasUndefinedInCard,
                    modalVerification: modalVerification
                });
                
                console.log(`   ✅ Verified: ${supplementName} ${hasUndefinedInCard ? '❌ HAS UNDEFINED' : '✓ Clean'}`);
                
            } catch (error) {
                console.error(`   ❌ Error verifying supplement ${i + 1}:`, error.message);
                issues.push({
                    type: 'verification_error',
                    supplementIndex: i,
                    error: error.message
                });
            }
        }
        
        // Generate comprehensive report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalSupplements: supplementCards.length,
                supplementsWithPhase2A: verificationResults.filter(r => r.hasPhase2ABadge).length,
                supplementsWithUndefined: verificationResults.filter(r => r.hasUndefinedInCard).length,
                totalIssuesFound: issues.length
            },
            issues: issues,
            verificationResults: verificationResults,
            consoleMessages: consoleMessages.filter(msg => msg.type === 'error' || msg.text.includes('undefined'))
        };
        
        console.log(`\n📊 VERIFICATION SUMMARY:`);
        console.log(`   Total supplements checked: ${report.summary.totalSupplements}`);
        console.log(`   Enhanced supplements (Phase 2A): ${report.summary.supplementsWithPhase2A}`);
        console.log(`   Supplements with undefined issues: ${report.summary.supplementsWithUndefined}`);
        console.log(`   Total issues found: ${report.summary.totalIssuesFound}`);
        
        if (issues.length === 0) {
            console.log(`\n🎉 SUCCESS: No undefined target issues found in any supplement!`);
        } else {
            console.log(`\n❌ ISSUES FOUND:`);
            issues.forEach((issue, index) => {
                console.log(`\n${index + 1}. ${issue.type.toUpperCase()}:`);
                console.log(`   Supplement: ${issue.supplementName || 'Unknown'} (ID: ${issue.supplementId || 'Unknown'})`);
                if (issue.message) console.log(`   Message: ${issue.message}`);
                if (issue.cardText) console.log(`   Card Text: ${issue.cardText}`);
                if (issue.modalText) console.log(`   Modal Text: ${issue.modalText}`);
                if (issue.tabName) console.log(`   Tab: ${issue.tabName}`);
                if (issue.tabContent) console.log(`   Tab Content: ${issue.tabContent}`);
            });
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
verifyAllSupplements().then(report => {
    const fs = require('fs');
    fs.writeFileSync('comprehensive-supplement-verification-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to comprehensive-supplement-verification-report.json');
}).catch(console.error);