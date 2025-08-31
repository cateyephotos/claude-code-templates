const { chromium } = require('playwright');
const fs = require('fs');

async function comprehensiveEvidenceTest() {
    const browser = await chromium.launch({ headless: false }); // Show browser for visual verification
    const page = await browser.newPage();
    
    // Set viewport size for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('=== COMPREHENSIVE EVIDENCE TESTING ===\n');
    
    try {
        // Navigate to the supplement database
        console.log('1. Navigating to supplement database...');
        await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait for the supplement grid to load
        await page.waitForSelector('#supplementGrid', { timeout: 15000 });
        await page.waitForTimeout(3000); // Wait for JavaScript to initialize
        
        console.log('✓ Page loaded successfully\n');
        
        // === TEST 1: EVIDENCE STRENGTH BAR TESTING ===
        console.log('=== TEST 1: EVIDENCE STRENGTH BAR TESTING ===');
        
        // Take screenshot of supplement grid
        await page.screenshot({ 
            path: 'evidence-bars-overview.png', 
            fullPage: true 
        });
        console.log('✓ Screenshot taken: evidence-bars-overview.png');
        
        // Analyze evidence bars by tier
        const tierAnalysis = await page.evaluate(() => {
            const results = {
                tier1: [],
                tier2: [],
                tier3: [],
                tier4: []
            };
            
            const cards = document.querySelectorAll('[data-supplement-id]');
            
            cards.forEach(card => {
                const tierBadge = card.querySelector('.tier-badge');
                const evidenceBar = card.querySelector('.evidence-bar');
                const supplementName = card.querySelector('h3')?.textContent;
                
                if (tierBadge && evidenceBar && supplementName) {
                    const tierClass = tierBadge.className;
                    const barWidth = evidenceBar.style.width || getComputedStyle(evidenceBar).width;
                    const barColor = getComputedStyle(evidenceBar).backgroundColor;
                    
                    const entry = {
                        name: supplementName.trim(),
                        width: barWidth,
                        color: barColor,
                        element: evidenceBar.outerHTML
                    };
                    
                    if (tierClass.includes('tier-1')) {
                        results.tier1.push(entry);
                    } else if (tierClass.includes('tier-2')) {
                        results.tier2.push(entry);
                    } else if (tierClass.includes('tier-3')) {
                        results.tier3.push(entry);
                    } else if (tierClass.includes('tier-4')) {
                        results.tier4.push(entry);
                    }
                }
            });
            
            return results;
        });
        
        // Report tier analysis
        console.log('\n--- Evidence Bar Analysis by Tier ---');
        Object.keys(tierAnalysis).forEach(tier => {
            const supplements = tierAnalysis[tier];
            console.log(`${tier.toUpperCase()}: ${supplements.length} supplements`);
            supplements.slice(0, 3).forEach(supp => {
                console.log(`  - ${supp.name}: Width ${supp.width}, Color ${supp.color}`);
            });
        });
        
        // === TEST 2: FIND AND TEST BACOPA MONNIERI ===
        console.log('\n=== TEST 2: BACOPA MONNIERI ENHANCED CITATION TESTING ===');
        
        // Find Bacopa monnieri card
        const bacopaCard = await page.locator('[data-supplement-id]').filter({ hasText: 'Bacopa monnieri' }).first();
        
        if (await bacopaCard.count() > 0) {
            console.log('✓ Found Bacopa monnieri card');
            
            // Check for Phase 2A Enhanced badge
            const hasEnhancedBadge = await bacopaCard.locator('.bg-purple-600, .enhanced-badge').count() > 0;
            console.log(`Enhanced badge present: ${hasEnhancedBadge}`);
            
            // Take screenshot of Bacopa card specifically
            await bacopaCard.screenshot({ path: 'bacopa-card.png' });
            console.log('✓ Screenshot taken: bacopa-card.png');
            
            // Click "View Details" button
            const viewDetailsBtn = bacopaCard.locator('button').filter({ hasText: 'View Details' });
            await viewDetailsBtn.click();
            console.log('✓ Clicked View Details button');
            
            // Wait for modal to appear
            await page.waitForSelector('.modal-overlay, #citationModal', { timeout: 10000 });
            await page.waitForTimeout(2000); // Wait for modal animation
            
            console.log('✓ Citation modal opened');
            
            // === TEST 3: ENHANCED CITATION MODAL TESTING ===
            console.log('\n=== TEST 3: ENHANCED CITATION MODAL TESTING ===');
            
            // Take screenshot of modal
            await page.screenshot({ path: 'enhanced-modal-overview.png' });
            console.log('✓ Screenshot taken: enhanced-modal-overview.png');
            
            // Check for Enhanced Evidence Profile section
            const hasEnhancedProfile = await page.locator('.enhanced-evidence-profile, .enhanced-profile').count() > 0;
            console.log(`Enhanced Evidence Profile present: ${hasEnhancedProfile}`);
            
            // Check for tabbed interface
            const tabs = await page.locator('.tab-button, .modal-tab').count();
            console.log(`Number of tabs found: ${tabs}`);
            
            // === TEST 4: TAB FUNCTIONALITY VERIFICATION ===
            console.log('\n=== TEST 4: TAB FUNCTIONALITY VERIFICATION ===');
            
            const tabSelectors = [
                '.tab-button[data-tab="mechanisms"], [data-tab="mechanisms"]',
                '.tab-button[data-tab="benefits"], [data-tab="benefits"]', 
                '.tab-button[data-tab="safety"], [data-tab="safety"]'
            ];
            
            const tabNames = ['Mechanisms', 'Clinical Benefits', 'Safety'];
            
            for (let i = 0; i < tabSelectors.length; i++) {
                const tabSelector = tabSelectors[i];
                const tabName = tabNames[i];
                
                try {
                    const tab = page.locator(tabSelector).first();
                    if (await tab.count() > 0) {
                        console.log(`Testing ${tabName} tab...`);
                        await tab.click();
                        await page.waitForTimeout(1000);
                        
                        // Take screenshot of this tab
                        await page.screenshot({ path: `modal-${tabName.toLowerCase().replace(' ', '-')}-tab.png` });
                        console.log(`✓ Screenshot taken: modal-${tabName.toLowerCase().replace(' ', '-')}-tab.png`);
                        
                        // Check for content in this tab
                        const activeTabContent = await page.locator('.tab-content.active, .tab-pane.active').textContent();
                        const hasContent = activeTabContent && activeTabContent.length > 50;
                        console.log(`  ${tabName} tab has content: ${hasContent}`);
                        
                        if (hasContent) {
                            console.log(`  Content preview: ${activeTabContent.substring(0, 100)}...`);
                        }
                    } else {
                        console.log(`  ❌ ${tabName} tab not found`);
                    }
                } catch (error) {
                    console.log(`  ❌ Error testing ${tabName} tab: ${error.message}`);
                }
            }
            
            // === TEST 5: DATA QUALITY CHECKS ===
            console.log('\n=== TEST 5: DATA QUALITY CHECKS ===');
            
            const qualityMetrics = await page.evaluate(() => {
                const results = {};
                
                // Look for quality score
                const qualityScore = document.querySelector('.quality-score, .evidence-score');
                if (qualityScore) {
                    results.qualityScore = qualityScore.textContent;
                }
                
                // Look for citation count
                const citationCount = document.querySelector('.citation-count, .total-citations');
                if (citationCount) {
                    results.citationCount = citationCount.textContent;
                }
                
                // Look for research maturity
                const researchMaturity = document.querySelector('.research-maturity, .publication-span');
                if (researchMaturity) {
                    results.researchMaturity = researchMaturity.textContent;
                }
                
                // Check for real citation data (not placeholder)
                const citations = document.querySelectorAll('.citation-item, .citation');
                results.realCitations = citations.length > 0 && 
                    Array.from(citations).some(c => 
                        c.textContent.length > 50 && 
                        !c.textContent.includes('placeholder') &&
                        !c.textContent.includes('Lorem ipsum')
                    );
                
                return results;
            });
            
            console.log('Quality Metrics Found:');
            Object.keys(qualityMetrics).forEach(key => {
                console.log(`  ${key}: ${qualityMetrics[key]}`);
            });
            
        } else {
            console.log('❌ Bacopa monnieri card not found');
        }
        
        // === TEST 6: JAVASCRIPT CONSOLE MONITORING ===
        console.log('\n=== TEST 6: JAVASCRIPT CONSOLE MONITORING ===');
        
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString()
            });
        });
        
        // Trigger some interactions to generate console activity
        await page.reload();
        await page.waitForSelector('#supplementGrid', { timeout: 15000 });
        await page.waitForTimeout(3000);
        
        console.log('Console Messages Captured:');
        consoleMessages.forEach(msg => {
            console.log(`  [${msg.type.toUpperCase()}] ${msg.text}`);
        });
        
        // === TEST 7: VISUAL VERIFICATION SUMMARY ===
        console.log('\n=== TEST 7: VISUAL VERIFICATION SUMMARY ===');
        
        const visualVerification = await page.evaluate(() => {
            const results = {};
            
            // Count evidence bars with different lengths
            const evidenceBars = document.querySelectorAll('.evidence-bar');
            const barWidths = Array.from(evidenceBars).map(bar => {
                const width = bar.style.width || getComputedStyle(bar).width;
                return parseFloat(width);
            });
            
            results.evidenceBarCount = evidenceBars.length;
            results.uniqueWidths = [...new Set(barWidths)].length;
            results.averageWidth = barWidths.reduce((a, b) => a + b, 0) / barWidths.length;
            
            // Check for enhanced badges
            const enhancedBadges = document.querySelectorAll('.bg-purple-600, .enhanced-badge');
            results.enhancedBadgeCount = enhancedBadges.length;
            
            // Check modal styling
            const modal = document.querySelector('.modal-overlay, #citationModal');
            if (modal) {
                results.modalVisible = !modal.classList.contains('hidden') && 
                                     getComputedStyle(modal).display !== 'none';
                results.modalHasTabs = modal.querySelectorAll('.tab-button, .modal-tab').length > 0;
            }
            
            return results;
        });
        
        console.log('Visual Verification Results:');
        Object.keys(visualVerification).forEach(key => {
            console.log(`  ${key}: ${visualVerification[key]}`);
        });
        
        // Close modal if open
        try {
            await page.locator('.modal-close, .close-modal, [data-dismiss="modal"]').first().click();
            await page.waitForTimeout(1000);
        } catch (error) {
            console.log('Modal close button not found or already closed');
        }
        
        // Final full page screenshot
        await page.screenshot({ 
            path: 'final-test-state.png', 
            fullPage: true 
        });
        console.log('✓ Final screenshot taken: final-test-state.png');
        
        console.log('\n=== TESTING COMPLETE ===');
        console.log('Screenshots generated:');
        console.log('- evidence-bars-overview.png (full page with evidence bars)');
        console.log('- bacopa-card.png (Bacopa monnieri card)'); 
        console.log('- enhanced-modal-overview.png (citation modal)');
        console.log('- modal-mechanisms-tab.png (mechanisms tab)');
        console.log('- modal-clinical-benefits-tab.png (benefits tab)');
        console.log('- modal-safety-tab.png (safety tab)');
        console.log('- final-test-state.png (final state)');
        
    } catch (error) {
        console.error('Error during testing:', error);
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('Error screenshot saved as: error-screenshot.png');
    } finally {
        await browser.close();
    }
}

// Save test results to file
const originalConsoleLog = console.log;
let testOutput = '';

console.log = function(...args) {
    const message = args.join(' ');
    testOutput += message + '\n';
    originalConsoleLog.apply(console, args);
};

comprehensiveEvidenceTest().then(() => {
    fs.writeFileSync('comprehensive-test-results.txt', testOutput);
    console.log('\nTest results saved to: comprehensive-test-results.txt');
}).catch(console.error);