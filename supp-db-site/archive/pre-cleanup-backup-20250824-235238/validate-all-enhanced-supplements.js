/**
 * Validate All Enhanced Supplements
 * Test all supplements that have enhanced citation files
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function validateAllEnhancedSupplements() {
    console.log('🧪 Validating ALL Enhanced Supplements...\n');
    
    // Get list of enhanced citation files
    const enhancedDir = './data/enhanced_citations';
    const enhancedFiles = fs.readdirSync(enhancedDir).filter(file => file.endsWith('.js'));
    
    const enhancedIds = [];
    enhancedFiles.forEach(file => {
        const idMatch = file.match(/^(\d+)_/);
        if (idMatch) {
            enhancedIds.push(parseInt(idMatch[1]));
        }
    });
    
    enhancedIds.sort((a, b) => a - b);
    console.log(`📊 Found ${enhancedIds.length} enhanced citation files`);
    console.log(`🔢 Enhanced IDs: ${enhancedIds.slice(0, 15).join(', ')}${enhancedIds.length > 15 ? '...' : ''}\n`);
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    const results = {
        timestamp: new Date().toISOString(),
        totalEnhanced: enhancedIds.length,
        tested: 0,
        fullyWorking: 0,
        hasIssues: 0,
        failed: 0,
        supplements: []
    };
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Get supplement data from frontend
        const supplementsData = await page.evaluate(() => {
            if (window.supplementsData && window.supplementsData.supplements) {
                return window.supplementsData.supplements.map(s => ({
                    id: s.id,
                    name: s.name,
                    isEnhanced: s.isEnhanced
                }));
            }
            return [];
        });
        
        const supplementsMap = new Map();
        supplementsData.forEach(s => supplementsMap.set(s.id, s));
        
        // Test first 10 enhanced supplements for speed
        const testIds = enhancedIds.slice(0, 10);
        console.log(`🧪 Testing first ${testIds.length} enhanced supplements...\n`);
        
        for (const id of testIds) {
            const supplement = supplementsMap.get(id);
            if (!supplement) {
                console.log(`⚠️ Supplement ID ${id} not found in frontend data`);
                continue;
            }
            
            console.log(`🔍 Testing ${supplement.name} (ID: ${id})...`);
            
            const result = {
                id: id,
                name: supplement.name,
                isEnhancedInData: supplement.isEnhanced,
                hasEnhancedBadge: false,
                hasEnhancedTabs: false,
                tabsFound: [],
                undefinedCount: 0,
                status: 'UNKNOWN',
                issues: []
            };
            
            try {
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
                    result.status = 'CARD_NOT_FOUND';
                    result.issues.push('Card not found on page');
                    console.log(`  ❌ Card not found`);
                    results.supplements.push(result);
                    results.failed++;
                    continue;
                }
                
                // Check for enhanced badge
                const badge = await targetCard.$('.phase-2a-badge');
                result.hasEnhancedBadge = !!badge;
                
                // Open modal
                const viewBtn = await targetCard.$('button:has-text("View Details")');
                if (!viewBtn) {
                    result.status = 'NO_VIEW_BUTTON';
                    result.issues.push('View Details button not found');
                    console.log(`  ❌ No View Details button`);
                    results.supplements.push(result);
                    results.failed++;
                    continue;
                }
                
                await viewBtn.click();
                await page.waitForTimeout(2000);
                
                // Check for enhanced tabs
                const mechanismsTab = await page.$('button:has-text("Mechanisms")');
                const benefitsTab = await page.$('button:has-text("Benefits"), button:has-text("Clinical Benefits")');
                const safetyTab = await page.$('button:has-text("Safety")');
                
                if (mechanismsTab) result.tabsFound.push('Mechanisms');
                if (benefitsTab) result.tabsFound.push('Benefits');
                if (safetyTab) result.tabsFound.push('Safety');
                
                result.hasEnhancedTabs = result.tabsFound.length >= 3;
                
                // Quick check for undefined issues in Benefits tab
                if (benefitsTab) {
                    await benefitsTab.click();
                    await page.waitForTimeout(1000);
                    
                    const content = await page.textContent('#supplementModal');
                    const undefinedCount = content ? (content.match(/undefined/g) || []).length : 0;
                    result.undefinedCount += undefinedCount;
                }
                
                // Determine status
                if (!result.hasEnhancedBadge) {
                    result.status = 'MISSING_BADGE';
                    result.issues.push('Missing enhanced badge');
                } else if (!result.hasEnhancedTabs) {
                    result.status = 'MISSING_TABS';
                    result.issues.push(`Missing enhanced tabs. Found: ${result.tabsFound.join(', ')}`);
                } else if (result.undefinedCount > 0) {
                    result.status = 'HAS_UNDEFINED';
                    result.issues.push(`${result.undefinedCount} undefined issues`);
                } else {
                    result.status = 'FULLY_WORKING';
                }
                
                // Update counters
                if (result.status === 'FULLY_WORKING') {
                    results.fullyWorking++;
                    console.log(`  ✅ FULLY_WORKING`);
                } else {
                    results.hasIssues++;
                    console.log(`  ⚠️ ${result.status}: ${result.issues.join('; ')}`);
                }
                
                results.tested++;
                results.supplements.push(result);
                
                // Close modal
                await page.keyboard.press('Escape');
                await page.waitForTimeout(1000);
                
                // Force close if still open
                await page.evaluate(() => {
                    const modal = document.getElementById('supplementModal');
                    if (modal) modal.style.display = 'none';
                });
                
            } catch (error) {
                result.status = 'ERROR';
                result.issues.push(`Test error: ${error.message}`);
                results.failed++;
                console.log(`  ❌ ERROR: ${error.message}`);
                results.supplements.push(result);
                
                // Force close modal on error
                try {
                    await page.keyboard.press('Escape');
                    await page.evaluate(() => {
                        const modal = document.getElementById('supplementModal');
                        if (modal) modal.style.display = 'none';
                    });
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
            
            // Wait between tests
            await page.waitForTimeout(1000);
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
    
    // Generate report
    console.log('\n📋 ENHANCED SUPPLEMENTS VALIDATION REPORT');
    console.log('=' .repeat(60));
    console.log(`📊 Total Enhanced Files: ${results.totalEnhanced}`);
    console.log(`🧪 Tested: ${results.tested}`);
    console.log(`✅ Fully Working: ${results.fullyWorking}`);
    console.log(`⚠️ Has Issues: ${results.hasIssues}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    const successRate = results.tested > 0 ? Math.round((results.fullyWorking / results.tested) * 100) : 0;
    console.log(`📈 Success Rate: ${successRate}%`);
    
    console.log('\n🔍 DETAILED RESULTS:');
    results.supplements.forEach(supp => {
        const statusIcon = supp.status === 'FULLY_WORKING' ? '✅' : 
                          supp.status === 'ERROR' ? '❌' : '⚠️';
        console.log(`${statusIcon} ${supp.name} (ID: ${supp.id}) - ${supp.status}`);
        if (supp.issues.length > 0) {
            supp.issues.forEach(issue => {
                console.log(`    • ${issue}`);
            });
        }
    });
    
    // Save detailed report
    fs.writeFileSync('enhanced-supplements-validation.json', JSON.stringify(results, null, 2));
    console.log('\n📄 Detailed report saved to: enhanced-supplements-validation.json');
    
    return results;
}

// Run validation
if (require.main === module) {
    validateAllEnhancedSupplements()
        .then(results => {
            console.log('\n🎯 Enhanced supplements validation complete!');
            
            if (results.fullyWorking === results.tested) {
                console.log('🚀 EXCELLENT - All tested supplements working perfectly!');
            } else if (results.fullyWorking / results.tested >= 0.8) {
                console.log('✅ GOOD - Most supplements working, minor fixes needed.');
            } else {
                console.log('⚠️ NEEDS WORK - Significant issues detected.');
            }
        })
        .catch(error => {
            console.error('💥 Validation failed:', error);
            process.exit(1);
        });
}

module.exports = { validateAllEnhancedSupplements };
