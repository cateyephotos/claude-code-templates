/**
 * Validate Enhanced Frontend Rendering
 * Comprehensive validation that enhanced supplements actually render properly in the frontend
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function validateEnhancedFrontendRendering() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Validating enhanced supplement frontend rendering...');
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Get list of supplements marked as enhanced
        const enhancedSupplements = await page.evaluate(() => {
            if (window.supplementsData && window.supplementsData.supplements) {
                return window.supplementsData.supplements
                    .filter(s => s.isEnhanced)
                    .map(s => ({
                        id: s.id,
                        name: s.name,
                        evidenceTier: s.evidenceTier
                    }));
            }
            return [];
        });
        
        console.log(`📊 Found ${enhancedSupplements.length} supplements marked as enhanced`);
        
        // Check which enhanced citation files actually exist
        const enhancedDir = './data/enhanced_citations';
        const enhancedFiles = fs.readdirSync(enhancedDir).filter(file => file.endsWith('.js'));
        const enhancedIds = new Set();
        enhancedFiles.forEach(file => {
            const idMatch = file.match(/^(\d+)_/);
            if (idMatch) {
                enhancedIds.add(parseInt(idMatch[1]));
            }
        });
        
        console.log(`📁 Found ${enhancedFiles.length} enhanced citation files`);
        
        const validationResults = {
            timestamp: new Date().toISOString(),
            totalMarkedEnhanced: enhancedSupplements.length,
            totalEnhancedFiles: enhancedFiles.length,
            supplements: [],
            summary: {
                fullyWorking: 0,
                hasFileButNotRendering: 0,
                markedButNoFile: 0,
                undefinedIssues: 0
            }
        };
        
        // Test each enhanced supplement
        for (const supplement of enhancedSupplements.slice(0, 10)) { // Test first 10 for speed
            console.log(`\n🔍 Testing ${supplement.name} (ID: ${supplement.id})...`);
            
            const result = {
                id: supplement.id,
                name: supplement.name,
                evidenceTier: supplement.evidenceTier,
                hasEnhancedFile: enhancedIds.has(supplement.id),
                hasEnhancedBadge: false,
                hasEnhancedTabs: false,
                undefinedCount: 0,
                renderingStatus: 'UNKNOWN',
                issues: []
            };
            
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
                result.issues.push('Card not found on page');
                result.renderingStatus = 'CARD_NOT_FOUND';
                validationResults.supplements.push(result);
                continue;
            }
            
            // Check for Phase 2A badge
            const badge = await targetCard.$('.phase-2a-badge');
            result.hasEnhancedBadge = !!badge;
            
            if (!result.hasEnhancedBadge) {
                result.issues.push('Missing Phase 2A enhanced badge');
            }
            
            // Open modal
            const viewBtn = await targetCard.$('button:has-text("View Details")');
            if (!viewBtn) {
                result.issues.push('View Details button not found');
                result.renderingStatus = 'NO_VIEW_BUTTON';
                validationResults.supplements.push(result);
                continue;
            }
            
            await viewBtn.click();
            await page.waitForTimeout(3000);
            
            // Check for enhanced citation tabs
            const mechanismsTab = await page.$('button:has-text("Mechanisms")');
            const benefitsTab = await page.$('button:has-text("Benefits"), button:has-text("Clinical Benefits")');
            const safetyTab = await page.$('button:has-text("Safety")');
            
            result.hasEnhancedTabs = !!(mechanismsTab && benefitsTab && safetyTab);
            
            if (!result.hasEnhancedTabs) {
                result.issues.push('Missing enhanced citation tabs (Mechanisms/Benefits/Safety)');
            }
            
            // Check for undefined issues if tabs exist
            if (result.hasEnhancedTabs) {
                // Test Benefits tab
                if (benefitsTab) {
                    await benefitsTab.click();
                    await page.waitForTimeout(2000);
                    
                    const benefitsContent = await page.textContent('body');
                    const benefitsUndefined = benefitsContent ? (benefitsContent.match(/undefined/g) || []).length : 0;
                    result.undefinedCount += benefitsUndefined;
                    
                    if (benefitsUndefined > 0) {
                        result.issues.push(`Benefits tab has ${benefitsUndefined} undefined issues`);
                    }
                }
                
                // Test Mechanisms tab
                if (mechanismsTab) {
                    await mechanismsTab.click();
                    await page.waitForTimeout(2000);
                    
                    const mechanismsContent = await page.textContent('body');
                    const mechanismsUndefined = mechanismsContent ? (mechanismsContent.match(/undefined/g) || []).length : 0;
                    result.undefinedCount += mechanismsUndefined;
                    
                    if (mechanismsUndefined > 0) {
                        result.issues.push(`Mechanisms tab has ${mechanismsUndefined} undefined issues`);
                    }
                }
                
                // Test Safety tab
                if (safetyTab) {
                    await safetyTab.click();
                    await page.waitForTimeout(2000);
                    
                    const safetyContent = await page.textContent('body');
                    const safetyUndefined = safetyContent ? (safetyContent.match(/undefined/g) || []).length : 0;
                    result.undefinedCount += safetyUndefined;
                    
                    if (safetyUndefined > 0) {
                        result.issues.push(`Safety tab has ${safetyUndefined} undefined issues`);
                    }
                }
            }
            
            // Determine overall status
            if (!result.hasEnhancedFile) {
                result.renderingStatus = 'MARKED_BUT_NO_FILE';
                validationResults.summary.markedButNoFile++;
            } else if (!result.hasEnhancedTabs) {
                result.renderingStatus = 'HAS_FILE_NOT_RENDERING';
                validationResults.summary.hasFileButNotRendering++;
            } else if (result.undefinedCount > 0) {
                result.renderingStatus = 'RENDERING_WITH_UNDEFINED';
                validationResults.summary.undefinedIssues++;
            } else {
                result.renderingStatus = 'FULLY_WORKING';
                validationResults.summary.fullyWorking++;
            }
            
            console.log(`  Status: ${result.renderingStatus}`);
            console.log(`  Issues: ${result.issues.length}`);
            console.log(`  Undefined count: ${result.undefinedCount}`);
            
            validationResults.supplements.push(result);
            
            // Close modal
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
        }
        
        // Generate summary report
        console.log('\n📋 FRONTEND RENDERING VALIDATION REPORT');
        console.log('=' .repeat(60));
        console.log(`📊 Total Marked Enhanced: ${validationResults.totalMarkedEnhanced}`);
        console.log(`📁 Total Enhanced Files: ${validationResults.totalEnhancedFiles}`);
        console.log(`🧪 Tested Supplements: ${validationResults.supplements.length}`);
        
        console.log('\n🎯 RENDERING STATUS BREAKDOWN:');
        console.log(`✅ Fully Working: ${validationResults.summary.fullyWorking}`);
        console.log(`🔶 Has File But Not Rendering: ${validationResults.summary.hasFileButNotRendering}`);
        console.log(`❌ Marked But No File: ${validationResults.summary.markedButNoFile}`);
        console.log(`⚠️ Rendering With Undefined: ${validationResults.summary.undefinedIssues}`);
        
        console.log('\n🔍 DETAILED ISSUES:');
        validationResults.supplements.forEach(supp => {
            if (supp.issues.length > 0) {
                console.log(`\n${supp.name} (ID: ${supp.id}) - ${supp.renderingStatus}:`);
                supp.issues.forEach(issue => {
                    console.log(`  ⚠️ ${issue}`);
                });
            }
        });
        
        // Save detailed report
        fs.writeFileSync('frontend-rendering-validation.json', JSON.stringify(validationResults, null, 2));
        console.log('\n📄 Detailed report saved to: frontend-rendering-validation.json');
        
        return validationResults;
        
    } catch (error) {
        console.error('❌ Validation failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run validation
if (require.main === module) {
    try {
        validateEnhancedFrontendRendering()
            .then(results => {
                console.log('\n🎯 Frontend rendering validation complete!');
                
                const successRate = Math.round((results.summary.fullyWorking / results.supplements.length) * 100);
                console.log(`📈 Success Rate: ${successRate}%`);
                
                if (successRate >= 80) {
                    console.log('🚀 EXCELLENT - Most enhanced supplements rendering properly!');
                } else if (successRate >= 60) {
                    console.log('✅ GOOD - Majority working, some fixes needed.');
                } else {
                    console.log('⚠️ NEEDS WORK - Significant rendering issues detected.');
                }
            });
    } catch (error) {
        console.error('💥 Validation failed:', error);
        process.exit(1);
    }
}

module.exports = { validateEnhancedFrontendRendering };
