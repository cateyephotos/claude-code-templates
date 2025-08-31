/**
 * Test Melatonin Specifically
 * Debug exactly what's happening with Melatonin's enhanced citations
 */

const { chromium } = require('playwright');

async function testMelatoninSpecific() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Testing Melatonin specifically...');
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // Force reload to clear cache
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Check if Melatonin data is loaded
        const melatoninData = await page.evaluate(() => {
            if (window.enhancedCitations && window.enhancedCitations[8]) {
                const data = window.enhancedCitations[8];
                return {
                    hasData: true,
                    dataKeys: Object.keys(data),
                    hasCitations: !!data.citations,
                    citationsKeys: data.citations ? Object.keys(data.citations) : null,
                    benefitsStructure: data.citations?.benefits ? {
                        count: data.citations.benefits.length,
                        firstBenefit: data.citations.benefits[0],
                        firstBenefitKeys: data.citations.benefits[0] ? Object.keys(data.citations.benefits[0]) : null
                    } : null
                };
            }
            return { hasData: false };
        });
        
        console.log('📊 Melatonin Data Analysis:');
        console.log(JSON.stringify(melatoninData, null, 2));
        
        // Find Melatonin card
        const cards = await page.$$('[class*="card"]');
        let melatoninCard = null;
        
        for (const card of cards) {
            const text = await card.textContent();
            if (text && text.includes('Melatonin')) {
                melatoninCard = card;
                break;
            }
        }
        
        if (melatoninCard) {
            console.log('✅ Found Melatonin card');
            
            const viewBtn = await melatoninCard.$('button:has-text("View Details")');
            if (viewBtn) {
                console.log('🔍 Opening Melatonin modal...');
                await viewBtn.click();
                await page.waitForTimeout(3000);
                
                // Check if normalization is being called
                const normalizationCheck = await page.evaluate(() => {
                    // Check if the renderer is working
                    if (window.CitationRenderer) {
                        return {
                            rendererExists: true,
                            hasNormalizeMethod: !!window.CitationRenderer.prototype._normalizeData
                        };
                    }
                    return { rendererExists: false };
                });
                
                console.log('🔧 Renderer Check:', normalizationCheck);
                
                // Click Benefits tab and check content
                const benefitsTab = await page.$('button:has-text("Benefits")');
                if (benefitsTab) {
                    console.log('🔍 Clicking Benefits tab...');
                    await benefitsTab.click();
                    await page.waitForTimeout(2000);
                    
                    // Get the actual rendered content
                    const benefitsContent = await page.evaluate(() => {
                        const modal = document.querySelector('#supplementModal, .modal, [class*="modal"]');
                        if (modal) {
                            // Look for study cards specifically
                            const studyCards = modal.querySelectorAll('.study-card, [class*="study"]');
                            const studyInfo = Array.from(studyCards).slice(0, 3).map(card => ({
                                innerHTML: card.innerHTML.substring(0, 300),
                                textContent: card.textContent.substring(0, 200)
                            }));
                            
                            return {
                                studyCardsFound: studyCards.length,
                                studyInfo: studyInfo,
                                modalHTML: modal.innerHTML.substring(0, 1000)
                            };
                        }
                        return { studyCardsFound: 0, studyInfo: [], modalHTML: '' };
                    });
                    
                    console.log('📋 Benefits Content Analysis:');
                    console.log(`  Study cards found: ${benefitsContent.studyCardsFound}`);
                    console.log('  Sample study info:', benefitsContent.studyInfo);
                    
                    // Check for specific undefined patterns
                    const undefinedPatterns = await page.evaluate(() => {
                        const modal = document.querySelector('#supplementModal, .modal, [class*="modal"]');
                        if (modal) {
                            const content = modal.innerHTML;
                            const patterns = {
                                'Unknown authors (undefined)': (content.match(/Unknown authors \(undefined\)/g) || []).length,
                                'undefined</h6>': (content.match(/undefined<\/h6>/g) || []).length,
                                'undefined</p>': (content.match(/undefined<\/p>/g) || []).length,
                                'undefined</span>': (content.match(/undefined<\/span>/g) || []).length
                            };
                            return patterns;
                        }
                        return {};
                    });
                    
                    console.log('❌ Undefined Patterns:', undefinedPatterns);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testMelatoninSpecific();
