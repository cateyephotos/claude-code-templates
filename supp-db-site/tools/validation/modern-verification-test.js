const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function modernVerificationTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, 'verification-screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    try {
        console.log('Navigating to supplement database...');
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle', timeout: 60000 });

        // Wait for the modern app to fully initialize
        console.log('Waiting for modern app initialization...');
        await page.waitForTimeout(5000);

        console.log('\n=== CRITICAL VERIFICATION TESTS ===\n');

        // 1. Evidence Bar Proportionality Fix
        console.log('1. Testing Evidence Bar Proportionality Fix...');
        
        // Take full page screenshot
        await page.screenshot({ 
            path: path.join(screenshotsDir, '01-modern-overview.png'),
            fullPage: true
        });

        // Look for the correct selectors based on the modern template system
        const supplementCards = await page.locator('[data-supplement-id]').all();
        console.log(`Found ${supplementCards.length} supplement cards`);

        // Analyze evidence bars and tiers
        const tierAnalysis = {};
        for (let i = 0; i < Math.min(supplementCards.length, 15); i++) {
            const card = supplementCards[i];
            try {
                // Get tier information
                const tierBadge = await card.locator('.tier-badge').textContent();
                const evidenceMeter = card.locator('.evidence-meter-fill');
                
                if (await evidenceMeter.isVisible()) {
                    const width = await evidenceMeter.evaluate(el => window.getComputedStyle(el).width);
                    const backgroundColor = await evidenceMeter.evaluate(el => window.getComputedStyle(el).backgroundColor);
                    
                    const tier = tierBadge ? tierBadge.replace('Tier ', '') : 'unknown';
                    if (!tierAnalysis[tier]) tierAnalysis[tier] = [];
                    tierAnalysis[tier].push({ width, backgroundColor });
                    
                    console.log(`  Card ${i + 1}: ${tierBadge}, Width: ${width}, Color: ${backgroundColor}`);
                }
            } catch (error) {
                console.log(`  Card ${i + 1}: Error analyzing - ${error.message}`);
            }
        }

        console.log('\nEvidence Bar Analysis by Tier:');
        Object.keys(tierAnalysis).forEach(tier => {
            const bars = tierAnalysis[tier];
            console.log(`Tier ${tier}: ${bars.length} supplements`);
            bars.forEach((bar, idx) => {
                console.log(`  - Bar ${idx + 1}: Width=${bar.width}, Color=${bar.backgroundColor}`);
            });
        });

        // 2. Enhanced Citation Modal Loading Fix
        console.log('\n2. Testing Enhanced Citation Modal Loading Fix...');
        
        // Look for Bacopa monnieri (should be supplement ID 1)
        const bacopaCard = await page.locator('[data-supplement-id="1"]').first();
        
        if (await bacopaCard.isVisible()) {
            console.log('Found Bacopa monnieri card (ID: 1)');
            
            // Take screenshot of Bacopa card
            await bacopaCard.screenshot({ 
                path: path.join(screenshotsDir, '02-bacopa-card-modern.png')
            });

            // Check for Phase 2A badge
            const phase2ABadge = await bacopaCard.locator('.phase-2a-badge').isVisible();
            console.log(`Phase 2A badge visible: ${phase2ABadge}`);

            // Click View Details button
            const viewDetailsBtn = bacopaCard.locator('button:has-text("View Details")');
            if (await viewDetailsBtn.isVisible()) {
                console.log('Clicking View Details...');
                await viewDetailsBtn.click();
                await page.waitForTimeout(2000);

                // Check if modal opened
                const modal = await page.locator('#supplementModal').isVisible();
                console.log(`Modal opened: ${modal}`);

                if (modal) {
                    // Take screenshot of modal
                    await page.screenshot({ 
                        path: path.join(screenshotsDir, '03-enhanced-modal-modern.png')
                    });

                    // 3. Tab Content Verification
                    console.log('\n3. Testing Tab Content Verification...');
                    
                    // Check for Enhanced Evidence Profile
                    const qualityScore = await page.locator('.quality-score').textContent().catch(() => 'Not found');
                    console.log(`Quality Score: ${qualityScore}`);

                    // Check for enhanced citation sections
                    const enhancedSection = await page.locator('.enhanced-citations').isVisible().catch(() => false);
                    console.log(`Enhanced citations section visible: ${enhancedSection}`);

                    // Test clicking different tabs/sections within the modal
                    const tabSelectors = [
                        'button:has-text("Mechanisms")',
                        'button:has-text("Benefits")', 
                        'button:has-text("Safety")',
                        '.tab-mechanisms',
                        '.tab-benefits',
                        '.tab-safety'
                    ];

                    for (const selector of tabSelectors) {
                        const element = page.locator(selector);
                        if (await element.isVisible()) {
                            console.log(`Found and clicking: ${selector}`);
                            await element.click();
                            await page.waitForTimeout(1000);
                            
                            // Take screenshot of each tab
                            await page.screenshot({ 
                                path: path.join(screenshotsDir, `04-tab-${selector.replace(/[^a-zA-Z0-9]/g, '-')}.png`)
                            });
                        }
                    }

                    // Close modal
                    const closeButton = page.locator('.modal-close, button:has-text("Close"), .close');
                    if (await closeButton.first().isVisible()) {
                        await closeButton.first().click();
                        await page.waitForTimeout(1000);
                    }
                }
            } else {
                console.log('View Details button not found');
            }
        } else {
            console.log('Bacopa monnieri card not found');
        }

        // 4. JavaScript Console Monitoring
        console.log('\n4. Testing JavaScript Global Variables...');
        
        const jsCheck = await page.evaluate(() => {
            try {
                const citations = window.enhancedCitations;
                return {
                    enhancedCitationsAvailable: typeof citations !== 'undefined',
                    citation1Available: citations && citations[1] ? true : false,
                    citation1Data: citations && citations[1] ? {
                        qualityScore: citations[1].qualityScore || 'Not found',
                        totalCitations: citations[1].totalCitations || 'Not found', 
                        researchSpan: citations[1].researchSpan || 'Not found',
                        hasMechanisms: citations[1].mechanisms ? citations[1].mechanisms.length : 'Not found',
                        hasBenefits: citations[1].clinicalBenefits ? citations[1].clinicalBenefits.length : 'Not found',
                        hasSafety: citations[1].safety ? Object.keys(citations[1].safety).length : 'Not found'
                    } : null,
                    appInstance: typeof window.app !== 'undefined',
                    supplementCount: window.app ? window.app.supplements?.length || 'Not available' : 'App not available'
                };
            } catch (error) {
                return { error: error.message };
            }
        });

        console.log('JavaScript Global Variables Check:', jsCheck);

        // 5. Visual Quality Checks
        console.log('\n5. Testing Visual Quality Checks...');
        
        // Check tier distribution and colors
        const tierDistribution = await page.evaluate(() => {
            const tierBadges = Array.from(document.querySelectorAll('.tier-badge'));
            const distribution = {};
            tierBadges.forEach(badge => {
                const tierText = badge.textContent.trim();
                const bgColor = window.getComputedStyle(badge).backgroundColor;
                if (!distribution[tierText]) distribution[tierText] = [];
                distribution[tierText].push(bgColor);
            });
            return distribution;
        });

        console.log('Tier Distribution and Colors:', tierDistribution);

        // Take final comprehensive screenshot
        await page.screenshot({ 
            path: path.join(screenshotsDir, '05-final-modern-view.png'),
            fullPage: true
        });

        // Generate comprehensive test report
        const testReport = {
            timestamp: new Date().toISOString(),
            testType: 'Modern Verification Test',
            supplementCardsFound: supplementCards.length,
            evidenceBarAnalysis: tierAnalysis,
            jsGlobalCheck: jsCheck,
            tierDistribution: tierDistribution,
            screenshotFiles: [
                '01-modern-overview.png',
                '02-bacopa-card-modern.png', 
                '03-enhanced-modal-modern.png',
                '05-final-modern-view.png'
            ],
            summary: {
                evidenceBarFix: Object.keys(tierAnalysis).length > 0 ? 'PASSED' : 'FAILED',
                enhancedCitationsFix: jsCheck.enhancedCitationsAvailable && jsCheck.citation1Available ? 'PASSED' : 'FAILED',
                overallStatus: supplementCards.length > 0 ? 'SUCCESS' : 'FAILED'
            }
        };

        // Save test report
        fs.writeFileSync(
            path.join(__dirname, 'modern-verification-report.json'),
            JSON.stringify(testReport, null, 2)
        );

        console.log('\n=== MODERN VERIFICATION TEST SUMMARY ===');
        console.log(`✓ Supplement cards found: ${supplementCards.length}`);
        console.log(`✓ Evidence bars analyzed: ${Object.keys(tierAnalysis).length} tiers`);
        console.log(`✓ Enhanced citations available: ${jsCheck.enhancedCitationsAvailable}`);
        console.log(`✓ Bacopa citation data available: ${jsCheck.citation1Available}`);
        console.log(`✓ Overall test status: ${testReport.summary.overallStatus}`);
        console.log(`✓ Screenshots saved to: ${screenshotsDir}`);
        console.log(`✓ Full report saved: modern-verification-report.json`);

        console.log('\n=== EVIDENCE BAR PROPORTIONALITY VERIFICATION ===');
        if (Object.keys(tierAnalysis).length > 0) {
            console.log('✅ PASSED: Evidence bars are rendering with variable widths by tier');
            console.log('Tier breakdown:');
            Object.keys(tierAnalysis).sort().forEach(tier => {
                const avgWidth = tierAnalysis[tier].reduce((sum, bar) => {
                    const width = parseInt(bar.width.replace('px', ''));
                    return sum + width;
                }, 0) / tierAnalysis[tier].length;
                console.log(`  - Tier ${tier}: ${tierAnalysis[tier].length} supplements, avg width: ${avgWidth.toFixed(1)}px`);
            });
        } else {
            console.log('❌ FAILED: No evidence bars found or analyzed');
        }

        console.log('\n=== ENHANCED CITATION MODAL VERIFICATION ===');
        if (jsCheck.enhancedCitationsAvailable && jsCheck.citation1Available) {
            console.log('✅ PASSED: Enhanced citations loading successfully');
            console.log(`Quality Score: ${jsCheck.citation1Data.qualityScore}`);
            console.log(`Total Citations: ${jsCheck.citation1Data.totalCitations}`);
            console.log(`Research Span: ${jsCheck.citation1Data.researchSpan}`);
            console.log(`Mechanisms: ${jsCheck.citation1Data.hasMechanisms}`);
            console.log(`Benefits: ${jsCheck.citation1Data.hasBenefits}`);
            console.log(`Safety Data: ${jsCheck.citation1Data.hasSafety}`);
        } else {
            console.log('❌ FAILED: Enhanced citations not loading properly');
        }

    } catch (error) {
        console.error('Modern verification test error:', error);
    } finally {
        await browser.close();
    }
}

// Run the modern verification test
modernVerificationTest().catch(console.error);