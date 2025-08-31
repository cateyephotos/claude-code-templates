/**
 * Validate Single Supplement Rendering
 * Test one supplement at a time with proper modal handling
 */

const { chromium } = require('playwright');

async function validateSingleSupplement(supplementId, supplementName) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log(`🔍 Validating ${supplementName} (ID: ${supplementId})...`);
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const result = {
            id: supplementId,
            name: supplementName,
            hasEnhancedBadge: false,
            hasEnhancedTabs: false,
            tabsFound: [],
            undefinedCount: 0,
            renderingStatus: 'UNKNOWN',
            issues: [],
            citationData: {}
        };
        
        // Find the supplement card by name
        console.log(`  🔍 Looking for card with "${supplementName}"...`);
        
        const cards = await page.$$('[class*="card"]');
        let targetCard = null;
        
        for (const card of cards) {
            const text = await card.textContent();
            if (text && text.includes(supplementName)) {
                targetCard = card;
                console.log(`  ✅ Found card for ${supplementName}`);
                break;
            }
        }
        
        if (!targetCard) {
            result.issues.push('Card not found on page');
            result.renderingStatus = 'CARD_NOT_FOUND';
            console.log(`  ❌ Card not found for ${supplementName}`);
            return result;
        }
        
        // Check for Phase 2A badge
        const badge = await targetCard.$('.phase-2a-badge');
        result.hasEnhancedBadge = !!badge;
        console.log(`  📛 Enhanced badge: ${result.hasEnhancedBadge ? '✅' : '❌'}`);
        
        // Open modal with better error handling
        const viewBtn = await targetCard.$('button:has-text("View Details")');
        if (!viewBtn) {
            result.issues.push('View Details button not found');
            result.renderingStatus = 'NO_VIEW_BUTTON';
            console.log(`  ❌ View Details button not found`);
            return result;
        }
        
        console.log(`  🖱️ Clicking View Details...`);
        await viewBtn.click();
        await page.waitForTimeout(3000);
        
        // Check for modal
        const modal = await page.$('#supplementModal');
        if (!modal) {
            result.issues.push('Modal did not open');
            result.renderingStatus = 'MODAL_NOT_OPENED';
            console.log(`  ❌ Modal did not open`);
            return result;
        }
        
        console.log(`  ✅ Modal opened successfully`);
        
        // Check for enhanced citation tabs
        const mechanismsTab = await page.$('button:has-text("Mechanisms")');
        const benefitsTab = await page.$('button:has-text("Benefits"), button:has-text("Clinical Benefits")');
        const safetyTab = await page.$('button:has-text("Safety")');
        
        if (mechanismsTab) result.tabsFound.push('Mechanisms');
        if (benefitsTab) result.tabsFound.push('Benefits');
        if (safetyTab) result.tabsFound.push('Safety');
        
        result.hasEnhancedTabs = result.tabsFound.length >= 3;
        console.log(`  📑 Enhanced tabs found: ${result.tabsFound.join(', ')}`);
        
        if (!result.hasEnhancedTabs) {
            result.issues.push(`Missing enhanced citation tabs. Found: ${result.tabsFound.join(', ')}`);
        }
        
        // Test each tab for undefined issues
        if (benefitsTab) {
            console.log(`  🧪 Testing Benefits tab...`);
            await benefitsTab.click();
            await page.waitForTimeout(2000);
            
            const benefitsContent = await page.textContent('#supplementModal');
            const benefitsUndefined = benefitsContent ? (benefitsContent.match(/undefined/g) || []).length : 0;
            result.undefinedCount += benefitsUndefined;
            result.citationData.benefits = {
                undefinedCount: benefitsUndefined,
                hasContent: benefitsContent && benefitsContent.length > 100
            };
            
            if (benefitsUndefined > 0) {
                result.issues.push(`Benefits tab has ${benefitsUndefined} undefined issues`);
                console.log(`    ⚠️ Found ${benefitsUndefined} undefined issues in Benefits`);
            } else {
                console.log(`    ✅ Benefits tab clean`);
            }
        }
        
        if (mechanismsTab) {
            console.log(`  🧪 Testing Mechanisms tab...`);
            await mechanismsTab.click();
            await page.waitForTimeout(2000);
            
            const mechanismsContent = await page.textContent('#supplementModal');
            const mechanismsUndefined = mechanismsContent ? (mechanismsContent.match(/undefined/g) || []).length : 0;
            result.undefinedCount += mechanismsUndefined;
            result.citationData.mechanisms = {
                undefinedCount: mechanismsUndefined,
                hasContent: mechanismsContent && mechanismsContent.length > 100
            };
            
            if (mechanismsUndefined > 0) {
                result.issues.push(`Mechanisms tab has ${mechanismsUndefined} undefined issues`);
                console.log(`    ⚠️ Found ${mechanismsUndefined} undefined issues in Mechanisms`);
            } else {
                console.log(`    ✅ Mechanisms tab clean`);
            }
        }
        
        if (safetyTab) {
            console.log(`  🧪 Testing Safety tab...`);
            await safetyTab.click();
            await page.waitForTimeout(2000);
            
            const safetyContent = await page.textContent('#supplementModal');
            const safetyUndefined = safetyContent ? (safetyContent.match(/undefined/g) || []).length : 0;
            result.undefinedCount += safetyUndefined;
            result.citationData.safety = {
                undefinedCount: safetyUndefined,
                hasContent: safetyContent && safetyContent.length > 100
            };
            
            if (safetyUndefined > 0) {
                result.issues.push(`Safety tab has ${safetyUndefined} undefined issues`);
                console.log(`    ⚠️ Found ${safetyUndefined} undefined issues in Safety`);
            } else {
                console.log(`    ✅ Safety tab clean`);
            }
        }
        
        // Determine overall status
        if (!result.hasEnhancedTabs) {
            result.renderingStatus = 'MISSING_ENHANCED_TABS';
        } else if (result.undefinedCount > 0) {
            result.renderingStatus = 'RENDERING_WITH_UNDEFINED';
        } else {
            result.renderingStatus = 'FULLY_WORKING';
        }
        
        console.log(`  📊 Final Status: ${result.renderingStatus}`);
        console.log(`  📈 Issues: ${result.issues.length}`);
        console.log(`  🔢 Undefined count: ${result.undefinedCount}`);
        
        // CRITICAL: Properly close modal using multiple methods
        console.log(`  🚪 Closing modal...`);
        
        // Method 1: Try close button
        const closeBtn = await page.$('button:has-text("×"), button:has-text("Close"), .modal-close');
        if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(1000);
        }
        
        // Method 2: Try Escape key
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
        // Method 3: Click outside modal
        await page.click('body', { position: { x: 10, y: 10 } });
        await page.waitForTimeout(1000);
        
        // Verify modal is closed
        const modalStillOpen = await page.$('#supplementModal:visible');
        if (modalStillOpen) {
            console.log(`  ⚠️ Modal still open, forcing close...`);
            await page.evaluate(() => {
                const modal = document.getElementById('supplementModal');
                if (modal) {
                    modal.style.display = 'none';
                    modal.remove();
                }
            });
        }
        
        console.log(`  ✅ Modal closed successfully`);
        
        return result;
        
    } catch (error) {
        console.error(`❌ Validation failed for ${supplementName}:`, error.message);
        
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
        
        throw error;
    } finally {
        await browser.close();
    }
}

// Test specific supplements
async function testEnhancedSupplements() {
    const testSupplements = [
        { id: 1, name: 'Bacopa monnieri' },
        { id: 2, name: 'Turmeric/Curcumin' },
        { id: 3, name: 'Ashwagandha' }
    ];
    
    console.log('🧪 Testing Enhanced Supplements Individually...\n');
    
    for (const supplement of testSupplements) {
        try {
            const result = await validateSingleSupplement(supplement.id, supplement.name);
            
            console.log(`\n📋 SUMMARY for ${supplement.name}:`);
            console.log(`   Status: ${result.renderingStatus}`);
            console.log(`   Enhanced Badge: ${result.hasEnhancedBadge ? '✅' : '❌'}`);
            console.log(`   Enhanced Tabs: ${result.hasEnhancedTabs ? '✅' : '❌'} (${result.tabsFound.join(', ')})`);
            console.log(`   Undefined Issues: ${result.undefinedCount}`);
            if (result.issues.length > 0) {
                console.log(`   Issues: ${result.issues.join('; ')}`);
            }
            console.log('─'.repeat(60));
            
        } catch (error) {
            console.error(`💥 Failed to test ${supplement.name}:`, error.message);
            console.log('─'.repeat(60));
        }
        
        // Wait between tests to ensure clean state
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// Run tests
if (require.main === module) {
    testEnhancedSupplements()
        .then(() => {
            console.log('\n🎯 Individual supplement testing complete!');
        })
        .catch(error => {
            console.error('💥 Testing failed:', error);
            process.exit(1);
        });
}

module.exports = { validateSingleSupplement, testEnhancedSupplements };
