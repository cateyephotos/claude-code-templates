/**
 * Debug Remaining Issues: Melatonin and L-Theanine
 * Investigate why these 2 supplements still have undefined issues
 */

const { chromium } = require('playwright');

async function debugRemainingIssues() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Debugging remaining undefined issues...');
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const problematicSupplements = ['Melatonin', 'L-Theanine'];
        
        for (const supplementName of problematicSupplements) {
            console.log(`\n🔍 Analyzing ${supplementName}...`);
            
            // Find the supplement card
            const cards = await page.$$('[class*="card"]');
            let targetCard = null;
            
            for (const card of cards) {
                const text = await card.textContent();
                if (text && text.includes(supplementName)) {
                    targetCard = card;
                    break;
                }
            }
            
            if (!targetCard) {
                console.log(`❌ ${supplementName} card not found`);
                continue;
            }
            
            // Check if it has enhanced badge
            const badge = await targetCard.$('.phase-2a-badge');
            if (!badge) {
                console.log(`⚠️ ${supplementName} doesn't have Phase 2A badge`);
                continue;
            }
            
            // Get the supplement ID from the data
            const supplementId = await page.evaluate((name) => {
                // Find the supplement ID in the supplements data
                if (window.supplementDatabase && window.supplementDatabase.supplements) {
                    const supplement = window.supplementDatabase.supplements.find(s => 
                        s.name.toLowerCase().includes(name.toLowerCase())
                    );
                    return supplement ? supplement.id : null;
                }
                return null;
            }, supplementName);
            
            console.log(`📊 ${supplementName} ID: ${supplementId}`);
            
            // Check if enhanced citation data exists
            const citationData = await page.evaluate((id) => {
                if (window.enhancedCitations && window.enhancedCitations[id]) {
                    const data = window.enhancedCitations[id];
                    return {
                        hasData: true,
                        dataKeys: Object.keys(data),
                        hasCitations: !!data.citations,
                        citationsKeys: data.citations ? Object.keys(data.citations) : null,
                        sampleStructure: {
                            mechanisms: data.citations?.mechanisms?.[0] ? Object.keys(data.citations.mechanisms[0]) : null,
                            benefits: data.citations?.benefits?.[0] ? Object.keys(data.citations.benefits[0]) : null,
                            safety: data.citations?.safety?.[0] ? Object.keys(data.citations.safety[0]) : null
                        }
                    };
                }
                return { hasData: false };
            }, supplementId);
            
            console.log(`📋 ${supplementName} Citation Data:`, JSON.stringify(citationData, null, 2));
            
            // Open modal and check specific undefined contexts
            const viewBtn = await targetCard.$('button:has-text("View Details")');
            if (viewBtn) {
                await viewBtn.click();
                await page.waitForTimeout(2000);
                
                // Get specific undefined contexts
                const undefinedAnalysis = await page.evaluate(() => {
                    const modal = document.querySelector('#supplementModal, .modal, [class*="modal"]');
                    if (modal) {
                        const content = modal.innerHTML;
                        const lines = content.split('\n');
                        const undefinedLines = [];
                        
                        lines.forEach((line, index) => {
                            if (line.includes('undefined')) {
                                undefinedLines.push({
                                    lineNumber: index + 1,
                                    context: line.trim().substring(0, 300)
                                });
                            }
                        });
                        
                        return {
                            totalUndefined: (content.match(/undefined/g) || []).length,
                            undefinedContexts: undefinedLines.slice(0, 10) // First 10 instances
                        };
                    }
                    return { totalUndefined: 0, undefinedContexts: [] };
                });
                
                console.log(`❌ ${supplementName} Undefined Analysis:`);
                console.log(`  Total undefined: ${undefinedAnalysis.totalUndefined}`);
                console.log(`  Sample contexts:`);
                undefinedAnalysis.undefinedContexts.forEach((ctx, i) => {
                    console.log(`    ${i + 1}. Line ${ctx.lineNumber}: ${ctx.context}`);
                });
                
                await page.keyboard.press('Escape');
                await page.waitForTimeout(1000);
            }
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugRemainingIssues();
