const { chromium } = require('playwright');

async function testEnhancedCitations() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('=== ENHANCED CITATION MODAL TESTING ===\n');
    
    try {
        console.log('1. Loading supplement database...');
        await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        await page.waitForSelector('#supplementGrid', { timeout: 15000 });
        await page.waitForTimeout(5000); // Wait for full initialization
        
        console.log('✓ Page loaded successfully\n');
        
        // Monitor console for enhanced citation loading
        const enhancedLogs = [];
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('enhanced') || text.includes('citation') || text.includes('tab')) {
                enhancedLogs.push({
                    type: msg.type(),
                    text: text,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Find Bacopa monnieri and click View Details
        console.log('2. Testing Bacopa monnieri enhanced citations...');
        
        const bacopaCard = await page.locator('[data-supplement-id="1"]').first();
        
        if (await bacopaCard.count() > 0) {
            console.log('✓ Found Bacopa monnieri card (ID: 1)');
            
            // Check for Phase 2A Enhanced badge
            const enhancedBadge = await bacopaCard.locator('.phase-2a-badge, .enhanced-badge, [class*="phase-2a"]').first();
            if (await enhancedBadge.count() > 0) {
                console.log('✓ Phase 2A Enhanced badge found');
            } else {
                console.log('⚠ Phase 2A Enhanced badge not found, checking for purple badges...');
                const purpleBadges = await bacopaCard.locator('[class*="purple"]').count();
                console.log(`Found ${purpleBadges} purple elements on card`);
            }
            
            // Click View Details
            const viewDetailsBtn = await bacopaCard.locator('button').filter({ hasText: 'View Details' });
            await viewDetailsBtn.click();
            console.log('✓ Clicked View Details');
            
            await page.waitForTimeout(3000); // Wait for modal and potential enhanced loading
            
            // Check if enhanced citations loaded
            console.log('\n3. Checking for enhanced citation features...');
            
            // Look for enhanced citation indicators
            const enhancedIndicators = await page.evaluate(() => {
                const results = {};
                
                // Check for enhanced evidence profile
                const enhancedProfile = document.querySelector('.enhanced-evidence-profile, .enhanced-profile, [class*="enhanced-evidence"]');
                results.hasEnhancedProfile = !!enhancedProfile;
                
                // Check for quality score
                const qualityScore = document.querySelector('.quality-score, .evidence-score, [class*="quality"]');
                if (qualityScore) {
                    results.qualityScore = qualityScore.textContent.trim();
                }
                
                // Check for citation count
                const citationCount = document.querySelector('.citation-count, .total-citations, [class*="citation-count"]');
                if (citationCount) {
                    results.citationCount = citationCount.textContent.trim();
                }
                
                // Check for research maturity
                const researchMaturity = document.querySelector('.research-maturity, .publication-span, [class*="maturity"]');
                if (researchMaturity) {
                    results.researchMaturity = researchMaturity.textContent.trim();
                }
                
                // Look for tab interface
                const tabs = document.querySelectorAll('.tab-button, .modal-tab, [data-tab], .nav-tab, [class*="tab"]');
                results.tabCount = tabs.length;
                
                if (tabs.length > 0) {
                    results.tabTypes = Array.from(tabs).map(tab => {
                        return {
                            text: tab.textContent.trim(),
                            dataTab: tab.getAttribute('data-tab'),
                            className: tab.className
                        };
                    });
                }
                
                // Check for enhanced citation sections
                const citationSections = document.querySelectorAll('[class*="citation"], [class*="mechanism"], [class*="benefit"], [class*="safety"]');
                results.citationSectionCount = citationSections.length;
                
                // Look for specific enhanced content
                const mechanismSection = document.querySelector('[data-tab="mechanisms"], .mechanisms-tab, [class*="mechanism"]');
                const benefitsSection = document.querySelector('[data-tab="benefits"], .benefits-tab, [class*="benefit"]');
                const safetySection = document.querySelector('[data-tab="safety"], .safety-tab, [class*="safety"]');
                
                results.hasMechanismSection = !!mechanismSection;
                results.hasBenefitsSection = !!benefitsSection;
                results.hasSafetySection = !!safetySection;
                
                // Check modal content text for enhanced features
                const modalContent = document.querySelector('.modal-overlay, #citationModal, .modal');
                if (modalContent) {
                    const content = modalContent.textContent.toLowerCase();
                    results.hasEnhancedKeywords = {
                        qualityScore: content.includes('quality score') || content.includes('evidence score'),
                        totalCitations: content.includes('total citations') || content.includes('citation count'),
                        researchMaturity: content.includes('research maturity') || content.includes('publication span'),
                        mechanisms: content.includes('mechanisms of action') || content.includes('acetylcholinesterase'),
                        clinicalBenefits: content.includes('clinical benefits') || content.includes('clinical trials'),
                        safetyProfile: content.includes('safety profile') || content.includes('adverse events')
                    };
                }
                
                return results;
            });
            
            console.log('\nEnhanced Citation Features Analysis:');
            Object.keys(enhancedIndicators).forEach(key => {
                console.log(`  ${key}: ${JSON.stringify(enhancedIndicators[key])}`);
            });
            
            // Take screenshot of modal
            await page.screenshot({ path: 'enhanced-citation-modal-test.png' });
            console.log('✓ Screenshot taken: enhanced-citation-modal-test.png');
            
            // Test tab functionality if tabs are present
            if (enhancedIndicators.tabCount > 0) {
                console.log('\n4. Testing tab functionality...');
                
                const tabSelectors = [
                    '[data-tab="mechanisms"]',
                    '[data-tab="benefits"]', 
                    '[data-tab="safety"]',
                    '.mechanisms-tab',
                    '.benefits-tab',
                    '.safety-tab'
                ];
                
                for (const selector of tabSelectors) {
                    const tab = page.locator(selector).first();
                    if (await tab.count() > 0) {
                        try {
                            const tabText = await tab.textContent();
                            console.log(`Testing tab: ${tabText}`);
                            await tab.click();
                            await page.waitForTimeout(1000);
                            
                            // Take screenshot of active tab
                            const sanitizedName = tabText.toLowerCase().replace(/[^a-z0-9]/g, '-');
                            await page.screenshot({ path: `enhanced-tab-${sanitizedName}.png` });
                            console.log(`✓ Screenshot taken: enhanced-tab-${sanitizedName}.png`);
                            
                            // Check tab content
                            const tabContent = await page.evaluate(() => {
                                const activeContent = document.querySelector('.tab-content.active, .tab-pane.active, .active-tab-content');
                                return activeContent ? activeContent.textContent.substring(0, 200) : 'No active content found';
                            });
                            
                            console.log(`  Content preview: ${tabContent}...`);
                            
                        } catch (error) {
                            console.log(`  ❌ Error testing tab ${selector}: ${error.message}`);
                        }
                    }
                }
            } else {
                console.log('\n4. No tabs found - checking for standard citation modal...');
                
                // Check for standard citation content that should be enhanced
                const standardContent = await page.evaluate(() => {
                    const modal = document.querySelector('.modal-overlay, #citationModal, .modal');
                    if (!modal) return 'No modal found';
                    
                    const results = {};
                    
                    // Check for citation sections
                    const citationSection = modal.querySelector('.citation-section, [class*="citation"]');
                    results.hasCitationSection = !!citationSection;
                    
                    // Check for mechanism content
                    const mechanismText = modal.textContent.toLowerCase();
                    results.hasMechanismContent = mechanismText.includes('acetylcholinesterase') || 
                                                mechanismText.includes('mechanism') ||
                                                mechanismText.includes('synaptic');
                    
                    // Check for DOI links (indicates real research)
                    const doiLinks = modal.querySelectorAll('[href*="doi.org"], [href*="DOI"]');
                    results.doiLinkCount = doiLinks.length;
                    
                    // Check for PMID references
                    const pmidRefs = modal.textContent.match(/PMID[\s:]\d+/gi);
                    results.pmidCount = pmidRefs ? pmidRefs.length : 0;
                    
                    return results;
                });
                
                console.log('\nStandard Citation Content Analysis:');
                Object.keys(standardContent).forEach(key => {
                    console.log(`  ${key}: ${standardContent[key]}`);
                });
            }
            
            // Check enhanced citation loading in console
            console.log('\n5. Enhanced Citation Loading Analysis:');
            if (enhancedLogs.length > 0) {
                console.log(`Found ${enhancedLogs.length} enhanced citation related logs:`);
                enhancedLogs.forEach(log => {
                    console.log(`  [${log.type.toUpperCase()}] ${log.text}`);
                });
            } else {
                console.log('No enhanced citation loading logs found');
            }
            
            // Force reload enhanced citations if available
            console.log('\n6. Attempting to force load enhanced citations...');
            
            const forceLoadResult = await page.evaluate(() => {
                // Try to access the citation loader and force load enhanced citations
                if (window.app && window.app.citationLoader) {
                    return window.app.citationLoader.loadEnhancedCitations(1).then(() => {
                        return 'Enhanced citations load attempted';
                    }).catch(err => {
                        return `Enhanced citations load failed: ${err.message}`;
                    });
                } else {
                    return 'Citation loader not available';
                }
            });
            
            console.log(`Force load result: ${forceLoadResult}`);
            
            // Final verification screenshot
            await page.screenshot({ path: 'enhanced-citation-final.png' });
            console.log('✓ Final screenshot taken: enhanced-citation-final.png');
            
        } else {
            console.log('❌ Bacopa monnieri card not found');
        }
        
        console.log('\n=== ENHANCED CITATION TESTING COMPLETE ===');
        console.log('\nScreenshots generated:');
        console.log('- enhanced-citation-modal-test.png (Main modal)');
        console.log('- enhanced-citation-final.png (Final state)');
        console.log('- enhanced-tab-*.png (Tab screenshots if tabs were found)');
        
        // Summary
        console.log('\n=== ENHANCED CITATION TEST SUMMARY ===');
        const finalCheck = await page.evaluate(() => {
            const modal = document.querySelector('.modal-overlay, #citationModal, .modal');
            if (!modal) return { modalPresent: false };
            
            return {
                modalPresent: true,
                hasEnhancedElements: modal.querySelectorAll('[class*="enhanced"]').length > 0,
                hasTabInterface: modal.querySelectorAll('[class*="tab"]').length > 0,
                hasQualityScores: modal.textContent.includes('quality') || modal.textContent.includes('score'),
                hasCitationCounts: modal.textContent.includes('citation') && modal.textContent.includes('15'),
                hasRealResearch: modal.textContent.includes('doi.org') || modal.textContent.includes('PMID')
            };
        });
        
        console.log('Final Verification:');
        Object.keys(finalCheck).forEach(key => {
            console.log(`  ${key}: ${finalCheck[key]}`);
        });
        
    } catch (error) {
        console.error('Error during enhanced citation testing:', error);
        await page.screenshot({ path: 'enhanced-citation-error.png' });
        console.log('Error screenshot saved as: enhanced-citation-error.png');
    } finally {
        await browser.close();
    }
}

testEnhancedCitations().catch(console.error);