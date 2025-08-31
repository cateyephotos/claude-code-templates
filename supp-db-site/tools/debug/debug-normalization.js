/**
 * Debug Normalization Process
 * Check exactly what the smart renderer is producing
 */

const { chromium } = require('playwright');

async function debugNormalization() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Debugging normalization process...');
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Inject debug code to intercept the normalization
        await page.evaluate(() => {
            // Store original method
            if (window.CitationRenderer && window.CitationRenderer.prototype._normalizeData) {
                const originalNormalize = window.CitationRenderer.prototype._normalizeData;
                
                window.CitationRenderer.prototype._normalizeData = function(citationData) {
                    console.log('🔧 BEFORE Normalization:', citationData);
                    const result = originalNormalize.call(this, citationData);
                    console.log('✅ AFTER Normalization:', result);
                    
                    // Store for debugging
                    window.debugNormalizationResult = result;
                    return result;
                };
            }
        });
        
        // Find and click Citicoline
        const citicolineCards = await page.$$('[class*="card"]');
        let citicolineCard = null;
        
        for (const card of citicolineCards) {
            const text = await card.textContent();
            if (text && text.includes('Citicoline')) {
                citicolineCard = card;
                break;
            }
        }
        
        if (citicolineCard) {
            const viewBtn = await citicolineCard.$('button:has-text("View Details")');
            if (viewBtn) {
                console.log('🔍 Opening Citicoline modal...');
                await viewBtn.click();
                await page.waitForTimeout(3000);
                
                // Get the normalization result
                const debugData = await page.evaluate(() => {
                    return {
                        hasDebugResult: !!window.debugNormalizationResult,
                        normalizedData: window.debugNormalizationResult,
                        originalData: window.enhancedCitations ? window.enhancedCitations[75] : null
                    };
                });
                
                console.log('\n📊 NORMALIZATION DEBUG RESULTS:');
                
                if (debugData.hasDebugResult) {
                    console.log('\n🔧 Original Data Structure:');
                    if (debugData.originalData) {
                        console.log('  Citations keys:', Object.keys(debugData.originalData.citations || {}));
                        console.log('  Mechanisms count:', debugData.originalData.citations?.mechanisms?.length || 0);
                        console.log('  Benefits count:', debugData.originalData.citations?.benefits?.length || 0);
                        console.log('  Safety count:', debugData.originalData.citations?.safety?.length || 0);
                        
                        if (debugData.originalData.citations?.mechanisms?.[0]) {
                            console.log('  Sample mechanism keys:', Object.keys(debugData.originalData.citations.mechanisms[0]));
                        }
                        if (debugData.originalData.citations?.benefits?.[0]) {
                            console.log('  Sample benefit keys:', Object.keys(debugData.originalData.citations.benefits[0]));
                        }
                    }
                    
                    console.log('\n✅ Normalized Data Structure:');
                    if (debugData.normalizedData) {
                        console.log('  Citations keys:', Object.keys(debugData.normalizedData.citations || {}));
                        console.log('  Mechanisms count:', debugData.normalizedData.citations?.mechanisms?.length || 0);
                        console.log('  Benefits count:', debugData.normalizedData.citations?.benefits?.length || 0);
                        console.log('  Safety count:', debugData.normalizedData.citations?.safety?.length || 0);
                        
                        if (debugData.normalizedData.citations?.mechanisms?.[0]) {
                            console.log('  Normalized mechanism keys:', Object.keys(debugData.normalizedData.citations.mechanisms[0]));
                            console.log('  Mechanism sample:', debugData.normalizedData.citations.mechanisms[0]);
                        }
                        if (debugData.normalizedData.citations?.benefits?.[0]) {
                            console.log('  Normalized benefit keys:', Object.keys(debugData.normalizedData.citations.benefits[0]));
                            console.log('  Benefit sample:', debugData.normalizedData.citations.benefits[0]);
                        }
                        if (debugData.normalizedData.citations?.safety?.[0]) {
                            console.log('  Normalized safety keys:', Object.keys(debugData.normalizedData.citations.safety[0]));
                            console.log('  Safety sample:', debugData.normalizedData.citations.safety[0]);
                        }
                    }
                } else {
                    console.log('❌ No normalization debug data captured');
                }
                
                // Check for remaining undefined instances
                const undefinedCheck = await page.evaluate(() => {
                    const modal = document.querySelector('#supplementModal, .modal, [class*="modal"]');
                    if (modal) {
                        const content = modal.innerHTML;
                        const undefinedMatches = content.match(/undefined/g);
                        
                        // Find specific undefined contexts
                        const contexts = [];
                        const lines = content.split('\n');
                        lines.forEach((line, index) => {
                            if (line.includes('undefined')) {
                                contexts.push({
                                    lineNumber: index + 1,
                                    context: line.trim().substring(0, 200)
                                });
                            }
                        });
                        
                        return {
                            undefinedCount: undefinedMatches ? undefinedMatches.length : 0,
                            contexts: contexts.slice(0, 5) // First 5 instances
                        };
                    }
                    return { undefinedCount: 0, contexts: [] };
                });
                
                console.log('\n❌ REMAINING UNDEFINED ISSUES:');
                console.log(`  Total undefined instances: ${undefinedCheck.undefinedCount}`);
                if (undefinedCheck.contexts.length > 0) {
                    console.log('  Sample contexts:');
                    undefinedCheck.contexts.forEach((ctx, i) => {
                        console.log(`    ${i + 1}. Line ${ctx.lineNumber}: ${ctx.context}`);
                    });
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugNormalization();
