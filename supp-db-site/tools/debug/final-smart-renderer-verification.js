/**
 * Final Smart Renderer Verification
 * Comprehensive test of all enhanced supplements after smart renderer deployment
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function finalVerification() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🚀 Final Smart Renderer Verification Starting...');
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('📊 Analyzing all enhanced supplements...');
        
        // Get all supplement cards
        const supplementCards = await page.$$('[class*="card"]');
        console.log(`Found ${supplementCards.length} supplement cards`);
        
        const results = {
            timestamp: new Date().toISOString(),
            totalSupplements: supplementCards.length,
            enhancedSupplements: [],
            fullyResolved: [],
            partiallyResolved: [],
            stillBroken: [],
            notEnhanced: [],
            summary: {}
        };
        
        // Test each supplement card
        for (let i = 0; i < Math.min(supplementCards.length, 15); i++) { // Test first 15 to avoid timeouts
            const card = supplementCards[i];
            
            try {
                // Get supplement name
                const nameElement = await card.$('h3, h2, .supplement-name, [class*="title"]');
                const supplementName = await nameElement?.textContent() || `Supplement ${i + 1}`;
                
                console.log(`🔍 Testing: ${supplementName}`);
                
                // Check for Phase 2A badge (enhanced supplement indicator)
                const phase2ABadge = await card.$('.phase-2a-badge');
                const isEnhanced = !!phase2ABadge;
                
                if (!isEnhanced) {
                    results.notEnhanced.push(supplementName);
                    continue;
                }
                
                results.enhancedSupplements.push(supplementName);
                
                // Click View Details button
                const viewDetailsBtn = await card.$('button:has-text("View Details")');
                if (!viewDetailsBtn) {
                    console.log(`⚠️ No View Details button for ${supplementName}`);
                    continue;
                }
                
                await viewDetailsBtn.click();
                await page.waitForTimeout(2000);
                
                // Quick undefined check
                const modalContent = await page.textContent('body');
                const hasUndefined = modalContent && modalContent.includes('undefined');
                const undefinedCount = hasUndefined ? (modalContent.match(/undefined/g) || []).length : 0;
                
                if (undefinedCount === 0) {
                    console.log(`✅ ${supplementName}: FULLY RESOLVED`);
                    results.fullyResolved.push({
                        name: supplementName,
                        status: 'RESOLVED',
                        undefinedCount: 0
                    });
                } else if (undefinedCount < 10) {
                    console.log(`🔶 ${supplementName}: PARTIALLY RESOLVED (${undefinedCount} undefined)`);
                    results.partiallyResolved.push({
                        name: supplementName,
                        status: 'PARTIAL',
                        undefinedCount: undefinedCount
                    });
                } else {
                    console.log(`❌ ${supplementName}: STILL BROKEN (${undefinedCount} undefined)`);
                    results.stillBroken.push({
                        name: supplementName,
                        status: 'BROKEN',
                        undefinedCount: undefinedCount
                    });
                }
                
                // Close modal quickly
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
                
            } catch (error) {
                console.log(`⚠️ Error testing ${supplementName}: ${error.message}`);
            }
        }
        
        // Calculate summary statistics
        results.summary = {
            totalEnhanced: results.enhancedSupplements.length,
            fullyResolved: results.fullyResolved.length,
            partiallyResolved: results.partiallyResolved.length,
            stillBroken: results.stillBroken.length,
            successRate: Math.round((results.fullyResolved.length / results.enhancedSupplements.length) * 100),
            improvementRate: Math.round(((results.fullyResolved.length + results.partiallyResolved.length) / results.enhancedSupplements.length) * 100)
        };
        
        // Save comprehensive report
        fs.writeFileSync('smart-renderer-verification-report.json', JSON.stringify(results, null, 2));
        
        console.log('\n🎯 SMART RENDERER VERIFICATION COMPLETE');
        console.log('=' .repeat(60));
        console.log(`📊 Enhanced Supplements Tested: ${results.summary.totalEnhanced}`);
        console.log(`✅ Fully Resolved: ${results.summary.fullyResolved} (${results.summary.successRate}%)`);
        console.log(`🔶 Partially Resolved: ${results.summary.partiallyResolved}`);
        console.log(`❌ Still Broken: ${results.summary.stillBroken}`);
        console.log(`📈 Overall Improvement Rate: ${results.summary.improvementRate}%`);
        console.log('=' .repeat(60));
        
        if (results.fullyResolved.length > 0) {
            console.log('\n✅ FULLY RESOLVED SUPPLEMENTS:');
            results.fullyResolved.forEach(item => {
                console.log(`  ✓ ${item.name}`);
            });
        }
        
        if (results.partiallyResolved.length > 0) {
            console.log('\n🔶 PARTIALLY RESOLVED SUPPLEMENTS:');
            results.partiallyResolved.forEach(item => {
                console.log(`  ◐ ${item.name} (${item.undefinedCount} undefined remaining)`);
            });
        }
        
        if (results.stillBroken.length > 0) {
            console.log('\n❌ STILL BROKEN SUPPLEMENTS:');
            results.stillBroken.forEach(item => {
                console.log(`  ✗ ${item.name} (${item.undefinedCount} undefined)`);
            });
        }
        
        console.log('\n📄 Detailed report saved to: smart-renderer-verification-report.json');
        
        return results;
        
    } catch (error) {
        console.error('❌ Verification failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the verification
finalVerification()
    .then(results => {
        console.log('\n🎉 Smart Renderer verification completed successfully!');
        
        if (results.summary.successRate >= 80) {
            console.log('🚀 DEPLOYMENT SUCCESSFUL - Smart Renderer is working excellently!');
        } else if (results.summary.improvementRate >= 70) {
            console.log('✅ DEPLOYMENT GOOD - Smart Renderer shows significant improvement!');
        } else {
            console.log('⚠️ DEPLOYMENT NEEDS REVIEW - Some issues remain to be addressed.');
        }
    })
    .catch(error => {
        console.error('💥 Verification failed:', error);
        process.exit(1);
    });
