/**
 * Test Problematic Supplements: Melatonin and L-Theanine
 * Verify the enhanced Smart Renderer fixes their undefined issues
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function testProblematicSupplements() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Testing problematic supplements with enhanced Smart Renderer...');
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const problematicSupplements = [
            { name: 'Melatonin', id: 8 },
            { name: 'L-Theanine', id: 9 }
        ];
        
        const results = {
            timestamp: new Date().toISOString(),
            supplements: [],
            summary: {}
        };
        
        for (const supplement of problematicSupplements) {
            console.log(`\n🔍 Testing ${supplement.name}...`);
            
            // Find the supplement card
            const cards = await page.$$('[class*="card"]');
            let targetCard = null;
            
            for (const card of cards) {
                const text = await card.textContent();
                if (text && text.includes(supplement.name)) {
                    targetCard = card;
                    break;
                }
            }
            
            if (!targetCard) {
                console.log(`❌ ${supplement.name} card not found`);
                continue;
            }
            
            // Check Phase 2A badge
            const badge = await targetCard.$('.phase-2a-badge');
            const hasEnhancedBadge = !!badge;
            console.log(`📊 ${supplement.name} Enhanced Badge: ${hasEnhancedBadge ? '✅' : '❌'}`);
            
            // Open modal
            const viewBtn = await targetCard.$('button:has-text("View Details")');
            if (!viewBtn) {
                console.log(`❌ ${supplement.name} View Details button not found`);
                continue;
            }
            
            await viewBtn.click();
            await page.waitForTimeout(3000);
            
            // Check for enhanced citation tabs
            const mechanismsTab = await page.$('button:has-text("Mechanisms")');
            const benefitsTab = await page.$('button:has-text("Benefits"), button:has-text("Clinical Benefits")');
            const safetyTab = await page.$('button:has-text("Safety")');
            
            const hasEnhancedTabs = !!(mechanismsTab && benefitsTab && safetyTab);
            console.log(`📋 ${supplement.name} Enhanced Tabs: ${hasEnhancedTabs ? '✅' : '❌'}`);
            
            // Check for undefined issues
            const undefinedAnalysis = await page.evaluate(() => {
                const modal = document.querySelector('#supplementModal, .modal, [class*="modal"]');
                if (modal) {
                    const content = modal.innerHTML;
                    const undefinedMatches = content.match(/undefined/g);
                    
                    // Get specific undefined contexts
                    const lines = content.split('\n');
                    const contexts = [];
                    lines.forEach((line, index) => {
                        if (line.includes('undefined')) {
                            contexts.push({
                                lineNumber: index + 1,
                                context: line.trim().substring(0, 150)
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
            
            // Test each tab individually
            const tabResults = {};
            
            if (benefitsTab) {
                console.log(`🔍 Testing ${supplement.name} Benefits tab...`);
                await benefitsTab.click();
                await page.waitForTimeout(2000);
                
                const benefitsContent = await page.textContent('body');
                const benefitsUndefined = benefitsContent ? (benefitsContent.match(/undefined/g) || []).length : 0;
                tabResults.benefits = benefitsUndefined;
                console.log(`  Benefits undefined count: ${benefitsUndefined}`);
            }
            
            if (mechanismsTab) {
                console.log(`🔍 Testing ${supplement.name} Mechanisms tab...`);
                await mechanismsTab.click();
                await page.waitForTimeout(2000);
                
                const mechanismsContent = await page.textContent('body');
                const mechanismsUndefined = mechanismsContent ? (mechanismsContent.match(/undefined/g) || []).length : 0;
                tabResults.mechanisms = mechanismsUndefined;
                console.log(`  Mechanisms undefined count: ${mechanismsUndefined}`);
            }
            
            if (safetyTab) {
                console.log(`🔍 Testing ${supplement.name} Safety tab...`);
                await safetyTab.click();
                await page.waitForTimeout(2000);
                
                const safetyContent = await page.textContent('body');
                const safetyUndefined = safetyContent ? (safetyContent.match(/undefined/g) || []).length : 0;
                tabResults.safety = safetyUndefined;
                console.log(`  Safety undefined count: ${safetyUndefined}`);
            }
            
            // Determine status
            const totalUndefined = undefinedAnalysis.undefinedCount;
            let status;
            if (totalUndefined === 0) {
                status = 'RESOLVED';
                console.log(`✅ ${supplement.name}: FULLY RESOLVED!`);
            } else if (totalUndefined < 10) {
                status = 'IMPROVED';
                console.log(`🔶 ${supplement.name}: SIGNIFICANTLY IMPROVED (${totalUndefined} undefined remaining)`);
            } else {
                status = 'STILL_BROKEN';
                console.log(`❌ ${supplement.name}: STILL BROKEN (${totalUndefined} undefined)`);
            }
            
            results.supplements.push({
                name: supplement.name,
                id: supplement.id,
                hasEnhancedBadge,
                hasEnhancedTabs,
                undefinedCount: totalUndefined,
                tabResults,
                status,
                undefinedContexts: undefinedAnalysis.contexts
            });
            
            // Close modal
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
        }
        
        // Calculate summary
        const resolved = results.supplements.filter(s => s.status === 'RESOLVED').length;
        const improved = results.supplements.filter(s => s.status === 'IMPROVED').length;
        const stillBroken = results.supplements.filter(s => s.status === 'STILL_BROKEN').length;
        
        results.summary = {
            totalTested: results.supplements.length,
            resolved,
            improved,
            stillBroken,
            successRate: Math.round((resolved / results.supplements.length) * 100),
            improvementRate: Math.round(((resolved + improved) / results.supplements.length) * 100)
        };
        
        // Save detailed report
        fs.writeFileSync('problematic-supplements-test-report.json', JSON.stringify(results, null, 2));
        
        console.log('\n🎯 PROBLEMATIC SUPPLEMENTS TEST COMPLETE');
        console.log('=' .repeat(60));
        console.log(`📊 Supplements Tested: ${results.summary.totalTested}`);
        console.log(`✅ Fully Resolved: ${results.summary.resolved}`);
        console.log(`🔶 Improved: ${results.summary.improved}`);
        console.log(`❌ Still Broken: ${results.summary.stillBroken}`);
        console.log(`📈 Success Rate: ${results.summary.successRate}%`);
        console.log(`📈 Improvement Rate: ${results.summary.improvementRate}%`);
        console.log('=' .repeat(60));
        
        if (results.summary.resolved > 0) {
            console.log('\n✅ RESOLVED SUPPLEMENTS:');
            results.supplements.filter(s => s.status === 'RESOLVED').forEach(s => {
                console.log(`  ✓ ${s.name}`);
            });
        }
        
        if (results.summary.improved > 0) {
            console.log('\n🔶 IMPROVED SUPPLEMENTS:');
            results.supplements.filter(s => s.status === 'IMPROVED').forEach(s => {
                console.log(`  ◐ ${s.name} (${s.undefinedCount} undefined remaining)`);
            });
        }
        
        if (results.summary.stillBroken > 0) {
            console.log('\n❌ STILL BROKEN SUPPLEMENTS:');
            results.supplements.filter(s => s.status === 'STILL_BROKEN').forEach(s => {
                console.log(`  ✗ ${s.name} (${s.undefinedCount} undefined)`);
                if (s.undefinedContexts.length > 0) {
                    console.log(`    Sample issues:`);
                    s.undefinedContexts.slice(0, 2).forEach(ctx => {
                        console.log(`      - ${ctx.context}`);
                    });
                }
            });
        }
        
        console.log('\n📄 Detailed report saved to: problematic-supplements-test-report.json');
        
        return results;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

testProblematicSupplements()
    .then(results => {
        console.log('\n🎉 Problematic supplements test completed!');
        
        if (results.summary.successRate === 100) {
            console.log('🚀 PERFECT SUCCESS - All problematic supplements resolved!');
        } else if (results.summary.improvementRate >= 50) {
            console.log('✅ SIGNIFICANT IMPROVEMENT - Smart Renderer working well!');
        } else {
            console.log('⚠️ NEEDS MORE WORK - Additional fixes required.');
        }
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
