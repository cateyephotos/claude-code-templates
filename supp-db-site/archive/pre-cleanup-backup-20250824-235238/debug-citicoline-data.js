/**
 * Debug Citicoline Data Structure
 * Check exactly what data is loaded and how it's structured
 */

const { chromium } = require('playwright');

async function debugCiticolineData() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Debugging Citicoline data structure...');
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Check what's actually loaded for Citicoline
        const citationData = await page.evaluate(() => {
            if (window.enhancedCitations && window.enhancedCitations[75]) {
                return {
                    hasData: true,
                    dataKeys: Object.keys(window.enhancedCitations[75]),
                    hasCitations: !!window.enhancedCitations[75].citations,
                    citationsKeys: window.enhancedCitations[75].citations ? Object.keys(window.enhancedCitations[75].citations) : null,
                    mechanismsCount: window.enhancedCitations[75].citations?.mechanisms?.length || 0,
                    benefitsCount: window.enhancedCitations[75].citations?.benefits?.length || 0,
                    safetyCount: window.enhancedCitations[75].citations?.safety?.length || 0,
                    dosageCount: window.enhancedCitations[75].citations?.dosage?.length || 0,
                    sampleMechanism: window.enhancedCitations[75].citations?.mechanisms?.[0] || null,
                    sampleBenefit: window.enhancedCitations[75].citations?.benefits?.[0] || null
                };
            }
            return { hasData: false };
        });
        
        console.log('📊 Citation Data Analysis:');
        console.log(JSON.stringify(citationData, null, 2));
        
        // Check what the CitationRenderer is actually receiving
        const rendererDebug = await page.evaluate(() => {
            // Try to access the CitationRenderer if it's available
            if (window.CitationRenderer) {
                return {
                    rendererExists: true,
                    methods: Object.getOwnPropertyNames(window.CitationRenderer.prototype || {})
                };
            }
            return { rendererExists: false };
        });
        
        console.log('🔧 Renderer Debug:');
        console.log(JSON.stringify(rendererDebug, null, 2));
        
        // Find Citicoline and open modal
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
                await viewBtn.click();
                await page.waitForTimeout(2000);
                
                // Check what's in the modal content
                const modalContent = await page.evaluate(() => {
                    const modal = document.querySelector('#supplementModal, .modal, [class*="modal"]');
                    if (modal) {
                        return {
                            hasModal: true,
                            innerHTML: modal.innerHTML.substring(0, 1000), // First 1000 chars
                            undefinedCount: (modal.innerHTML.match(/undefined/g) || []).length,
                            hasEnhancedTabs: !!modal.querySelector('button:has-text("Mechanisms"), button[data-tab="mechanisms"]'),
                            tabButtons: Array.from(modal.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(text => text)
                        };
                    }
                    return { hasModal: false };
                });
                
                console.log('🔍 Modal Content Analysis:');
                console.log(JSON.stringify(modalContent, null, 2));
                
                // Check if there are any JavaScript errors
                const jsErrors = await page.evaluate(() => {
                    return window.lastJSErrors || [];
                });
                
                if (jsErrors.length > 0) {
                    console.log('❌ JavaScript Errors:');
                    jsErrors.forEach(error => console.log(`  - ${error}`));
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugCiticolineData();
