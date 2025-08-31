/**
 * Playwright Debug Investigation for Primary Benefits Issue
 * Uses Playwright to automate browser testing and debugging
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function debugPrimaryBenefitsIssue() {
    console.log('🚀 Starting Playwright debug investigation...');
    
    const browser = await chromium.launch({ 
        headless: false,  // Show browser for debugging
        slowMo: 1000     // Slow down for observation
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // 1. Navigate to localhost:8000
        console.log('📍 Navigating to http://localhost:8000...');
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
        
        // 2. Wait for supplement grid to load
        await page.waitForSelector('#supplementGrid', { timeout: 10000 });
        console.log('✅ Supplement grid found');
        
        // 3. Take initial screenshot
        await page.screenshot({ 
            path: 'debug-initial-state.png',
            fullPage: true
        });
        console.log('📸 Initial screenshot taken');
        
        // 4. Inject and run our debug script
        await page.addScriptTag({ path: './debug-primary-benefits.js' });
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        // 5. Execute comprehensive debug analysis
        console.log('🔍 Running comprehensive debug analysis...');
        const debugResults = await page.evaluate(async () => {
            // Wait for our debug function to be available
            if (typeof window.debugPrimaryBenefits === 'function') {
                return await window.debugPrimaryBenefits();
            } else {
                // Run the debug manually if function not available
                const results = {
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    
                    // Check database
                    database: {
                        exists: !!(window.supplementDatabase || (typeof supplementDatabase !== 'undefined' ? supplementDatabase : null)),
                        supplementCount: window.supplementDatabase?.supplements?.length || 0,
                        firstSupplement: window.supplementDatabase?.supplements?.[0] || null
                    },
                    
                    // Check app
                    app: {
                        modernAppExists: !!window.app,
                        modernAppType: typeof window.app,
                        hasSupplements: !!window.app?.supplements,
                        supplementCount: window.app?.supplements?.length || 0
                    },
                    
                    // Check DOM
                    dom: {
                        gridExists: !!document.getElementById('supplementGrid'),
                        cardCount: document.querySelectorAll('[data-supplement-id]').length,
                        benefitsHeadings: document.querySelectorAll('h4').length,
                        cognitiveSpans: document.querySelectorAll('.bg-blue-100').length,
                        nonCognitiveSpans: document.querySelectorAll('.bg-green-100').length
                    }
                };
                
                return results;
            }
        });
        
        // 6. Specific supplement card inspection
        console.log('🔍 Inspecting individual supplement cards...');
        const cardInspection = await page.evaluate(() => {
            const cards = document.querySelectorAll('[data-supplement-id]');
            return Array.from(cards).slice(0, 3).map(card => {
                const supplementId = card.getAttribute('data-supplement-id');
                const benefitsSection = card.querySelector('h4');
                const cognitiveSpans = card.querySelectorAll('.bg-blue-100');
                const nonCognitiveSpans = card.querySelectorAll('.bg-green-100');
                
                return {
                    supplementId,
                    hasBenefitsHeading: !!benefitsSection,
                    benefitsHeadingText: benefitsSection?.textContent || null,
                    cognitiveTagsCount: cognitiveSpans.length,
                    nonCognitiveTagsCount: nonCognitiveSpans.length,
                    cardInnerHTML: card.innerHTML.substring(0, 500) + '...'
                };
            });
        });
        
        // 7. Check specific supplement data access
        console.log('🔍 Testing supplement data access...');
        const dataAccessTest = await page.evaluate(() => {
            const database = window.supplementDatabase || (typeof supplementDatabase !== 'undefined' ? supplementDatabase : null);
            if (!database || !database.supplements || database.supplements.length === 0) {
                return { error: 'No database or supplements found' };
            }
            
            const firstSupplement = database.supplements[0];
            return {
                supplementName: firstSupplement.name,
                hasId: !!firstSupplement.id,
                hasPrimaryBenefits: !!firstSupplement.primaryBenefits,
                primaryBenefitsStructure: firstSupplement.primaryBenefits ? {
                    hasCognitive: !!firstSupplement.primaryBenefits.cognitive,
                    hasNonCognitive: !!firstSupplement.primaryBenefits.nonCognitive,
                    cognitiveArray: firstSupplement.primaryBenefits.cognitive || null,
                    nonCognitiveArray: firstSupplement.primaryBenefits.nonCognitive || null
                } : null
            };
        });
        
        // 8. Test render function directly
        console.log('🔍 Testing render function directly...');
        const renderTest = await page.evaluate(() => {
            if (!window.app || !window.app._renderBasicSupplementCard) {
                return { error: 'Modern app or render function not found' };
            }
            
            const database = window.supplementDatabase || (typeof supplementDatabase !== 'undefined' ? supplementDatabase : null);
            if (!database || !database.supplements || database.supplements.length === 0) {
                return { error: 'No database or supplements found for render test' };
            }
            
            try {
                const testHTML = window.app._renderBasicSupplementCard(database.supplements[0]);
                return {
                    success: true,
                    htmlLength: testHTML.length,
                    containsPrimaryBenefits: testHTML.includes('Primary Benefits:'),
                    containsBlueTags: testHTML.includes('bg-blue-100'),
                    containsGreenTags: testHTML.includes('bg-green-100'),
                    sampleHTML: testHTML.substring(0, 800)
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    stack: error.stack
                };
            }
        });
        
        // 9. Check for JavaScript errors
        const jsErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                jsErrors.push(msg.text());
            }
        });
        
        // 10. Take final screenshot highlighting the issue
        await page.screenshot({ 
            path: 'debug-final-state.png',
            fullPage: true
        });
        
        // 11. Compile comprehensive report
        const comprehensiveReport = {
            timestamp: new Date().toISOString(),
            debugResults,
            cardInspection,
            dataAccessTest,
            renderTest,
            jsErrors,
            diagnosis: generateDiagnosis(debugResults, cardInspection, dataAccessTest, renderTest, jsErrors)
        };
        
        // Save report to file
        fs.writeFileSync('debug-primary-benefits-report.json', JSON.stringify(comprehensiveReport, null, 2));
        
        console.log('📊 === INVESTIGATION COMPLETE ===');
        console.log('Database exists:', debugResults?.database?.exists);
        console.log('App exists:', debugResults?.app?.modernAppExists);
        console.log('Cards found:', debugResults?.dom?.cardCount || 0);
        console.log('Benefits headings:', debugResults?.dom?.benefitsHeadings || 0);
        console.log('Cognitive tags:', debugResults?.dom?.cognitiveSpans || 0);
        console.log('Non-cognitive tags:', debugResults?.dom?.nonCognitiveSpans || 0);
        console.log('Render test success:', renderTest?.success);
        console.log('JavaScript errors:', jsErrors.length);
        
        console.log('\n📋 DIAGNOSIS:', comprehensiveReport.diagnosis);
        
        return comprehensiveReport;
        
    } catch (error) {
        console.error('❌ Investigation failed:', error);
        
        // Try to take error screenshot
        try {
            await page.screenshot({ path: 'debug-error-state.png' });
        } catch (screenshotError) {
            console.error('Failed to take error screenshot:', screenshotError);
        }
        
        throw error;
    } finally {
        await browser.close();
    }
}

function generateDiagnosis(debugResults, cardInspection, dataAccessTest, renderTest, jsErrors) {
    const issues = [];
    const recommendations = [];
    
    // Check for database issues
    if (!debugResults?.database?.exists) {
        issues.push('CRITICAL: Database not loaded or accessible');
        recommendations.push('Fix supplement database loading - check data/supplements.js');
    }
    
    // Check for app issues
    if (!debugResults?.app?.modernAppExists) {
        issues.push('CRITICAL: Modern app not initialized');
        recommendations.push('Fix app.modernized.js loading and initialization');
    }
    
    // Check for data structure issues
    if (dataAccessTest?.error) {
        issues.push('DATA: ' + dataAccessTest.error);
        recommendations.push('Fix supplement data access and structure');
    } else if (dataAccessTest && !dataAccessTest.hasPrimaryBenefits) {
        issues.push('DATA: Primary benefits missing from supplement data');
        recommendations.push('Add primaryBenefits property to supplement data');
    } else if (dataAccessTest && (!dataAccessTest.primaryBenefitsStructure?.hasCognitive || !dataAccessTest.primaryBenefitsStructure?.hasNonCognitive)) {
        issues.push('DATA: Primary benefits structure incomplete (missing cognitive or nonCognitive arrays)');
        recommendations.push('Fix primaryBenefits data structure to include cognitive and nonCognitive arrays');
    }
    
    // Check for render issues
    if (renderTest?.error) {
        issues.push('RENDER: ' + renderTest.error);
        recommendations.push('Fix _renderBasicSupplementCard method');
    } else if (renderTest && renderTest.success && !renderTest.containsPrimaryBenefits) {
        issues.push('RENDER: Template not generating Primary Benefits section');
        recommendations.push('Fix HTML template in _renderBasicSupplementCard method');
    } else if (renderTest && renderTest.success && (!renderTest.containsBlueTags || !renderTest.containsGreenTags)) {
        issues.push('RENDER: Template not generating benefit tags');
        recommendations.push('Fix benefit tag generation in template');
    }
    
    // Check for DOM issues
    if (debugResults?.dom?.cardCount === 0) {
        issues.push('DOM: No supplement cards rendered');
        recommendations.push('Fix card rendering and DOM insertion process');
    } else if (debugResults?.dom?.cognitiveSpans === 0 && debugResults?.dom?.nonCognitiveSpans === 0) {
        issues.push('DOM: No benefit tags rendered in cards');
        recommendations.push('Check CSS classes and tag rendering');
    }
    
    // Check for JavaScript errors
    if (jsErrors.length > 0) {
        issues.push(`JS_ERRORS: ${jsErrors.length} JavaScript errors detected`);
        recommendations.push('Fix JavaScript errors: ' + jsErrors.join(', '));
    }
    
    const severity = issues.filter(i => i.includes('CRITICAL')).length > 0 ? 'CRITICAL' :
                    issues.length > 2 ? 'HIGH' :
                    issues.length > 0 ? 'MEDIUM' : 'LOW';
    
    return {
        severity,
        issues,
        recommendations,
        summary: `${issues.length} issues found with ${severity} severity`
    };
}

// Run the debug investigation
if (require.main === module) {
    debugPrimaryBenefitsIssue()
        .then(report => {
            console.log('✅ Debug investigation completed successfully');
            console.log('📁 Report saved to debug-primary-benefits-report.json');
        })
        .catch(error => {
            console.error('❌ Debug investigation failed:', error);
            process.exit(1);
        });
}

module.exports = { debugPrimaryBenefitsIssue };