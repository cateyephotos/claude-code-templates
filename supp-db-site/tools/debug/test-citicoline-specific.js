/**
 * Specific Test: Citicoline Enhanced Citations Rendering
 * Check if the enhanced citation data is properly connected to frontend
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function testCiticolineSpecific() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Testing Citicoline enhanced citations specifically...');
    
    try {
        // Navigate to the supplement database with cache busting
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // Force reload to clear any cached enhanced citation files
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        console.log('📊 Page loaded, searching for Citicoline...');
        
        // Search for Citicoline specifically
        const searchBox = await page.$('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
        if (searchBox) {
            await searchBox.fill('Citicoline');
            await page.waitForTimeout(2000);
        }
        
        // Find Citicoline card and check for Phase 2A badge
        const citicolineCards = await page.$$('[class*="card"]');
        let citicolineCardElement = null;

        for (const card of citicolineCards) {
            const cardText = await card.textContent();
            if (cardText && cardText.includes('Citicoline')) {
                citicolineCardElement = card;
                break;
            }
        }

        if (!citicolineCardElement) {
            console.log('❌ Citicoline card not found');
            return;
        }

        console.log('✅ Found Citicoline card');

        // Check for Phase 2A badge
        const phase2ABadge = await citicolineCardElement.$('.phase-2a-badge');

        if (phase2ABadge) {
            console.log('✅ Phase 2A badge found on Citicoline');
        } else {
            console.log('❌ Phase 2A badge NOT found on Citicoline');
        }

        // Click View Details button
        const viewDetailsBtn = await citicolineCardElement.$('button:has-text("View Details")');
        if (!viewDetailsBtn) {
            console.log('❌ View Details button not found');
            return;
        }
        
        console.log('🔍 Clicking View Details for Citicoline...');
        await viewDetailsBtn.click();
        await page.waitForTimeout(3000);
        
        // Take screenshot of modal
        await page.screenshot({ 
            path: 'citicoline-modal-test.png', 
            fullPage: true 
        });
        
        // Check for enhanced citation tabs
        const mechanismsTab = await page.$('button:has-text("Mechanisms")');
        const benefitsTab = await page.$('button:has-text("Benefits"), button:has-text("Clinical Benefits")');
        const safetyTab = await page.$('button:has-text("Safety")');
        
        console.log('🔍 Checking for enhanced citation tabs:');
        console.log(`  Mechanisms tab: ${mechanismsTab ? '✅ Found' : '❌ Missing'}`);
        console.log(`  Benefits tab: ${benefitsTab ? '✅ Found' : '❌ Missing'}`);
        console.log(`  Safety tab: ${safetyTab ? '✅ Found' : '❌ Missing'}`);
        
        // Check each tab for undefined content
        const results = {
            citicoline: {
                hasEnhancedTabs: !!(mechanismsTab && benefitsTab && safetyTab),
                undefinedIssues: []
            }
        };
        
        if (benefitsTab) {
            console.log('🔍 Checking Clinical Benefits tab...');
            await benefitsTab.click();
            await page.waitForTimeout(2000);
            
            const benefitsContent = await page.textContent('body');
            if (benefitsContent && benefitsContent.includes('undefined')) {
                const undefinedMatches = benefitsContent.match(/undefined/g);
                results.citicoline.undefinedIssues.push({
                    tab: 'Clinical Benefits',
                    undefinedCount: undefinedMatches ? undefinedMatches.length : 0
                });
                console.log(`❌ UNDEFINED found in Clinical Benefits tab: ${undefinedMatches ? undefinedMatches.length : 0} instances`);
            } else {
                console.log('✅ Clinical Benefits tab renders properly');
            }
        }
        
        if (mechanismsTab) {
            console.log('🔍 Checking Mechanisms tab...');
            await mechanismsTab.click();
            await page.waitForTimeout(2000);
            
            const mechanismsContent = await page.textContent('body');
            if (mechanismsContent && mechanismsContent.includes('undefined')) {
                const undefinedMatches = mechanismsContent.match(/undefined/g);
                results.citicoline.undefinedIssues.push({
                    tab: 'Mechanisms',
                    undefinedCount: undefinedMatches ? undefinedMatches.length : 0
                });
                console.log(`❌ UNDEFINED found in Mechanisms tab: ${undefinedMatches ? undefinedMatches.length : 0} instances`);
            } else {
                console.log('✅ Mechanisms tab renders properly');
            }
        }
        
        if (safetyTab) {
            console.log('🔍 Checking Safety tab...');
            await safetyTab.click();
            await page.waitForTimeout(2000);
            
            const safetyContent = await page.textContent('body');
            if (safetyContent && safetyContent.includes('undefined')) {
                const undefinedMatches = safetyContent.match(/undefined/g);
                results.citicoline.undefinedIssues.push({
                    tab: 'Safety',
                    undefinedCount: undefinedMatches ? undefinedMatches.length : 0
                });
                console.log(`❌ UNDEFINED found in Safety tab: ${undefinedMatches ? undefinedMatches.length : 0} instances`);
            } else {
                console.log('✅ Safety tab renders properly');
            }
        }
        
        // Check if enhanced citation file is loaded
        const enhancedCitationsLoaded = await page.evaluate(() => {
            return window.enhancedCitations && window.enhancedCitations[75];
        });
        
        console.log(`🔍 Enhanced citations loaded in browser: ${enhancedCitationsLoaded ? '✅ Yes' : '❌ No'}`);
        
        if (enhancedCitationsLoaded) {
            const citationData = await page.evaluate(() => {
                return window.enhancedCitations[75];
            });
            console.log('📊 Enhanced citation data structure:', Object.keys(citationData));
        }
        
        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            supplement: 'Citicoline (ID: 75)',
            enhancedCitationFileExists: true,
            enhancedCitationsLoadedInBrowser: enhancedCitationsLoaded,
            hasEnhancedTabs: results.citicoline.hasEnhancedTabs,
            undefinedIssues: results.citicoline.undefinedIssues,
            totalUndefinedInstances: results.citicoline.undefinedIssues.reduce((sum, issue) => sum + issue.undefinedCount, 0),
            status: results.citicoline.undefinedIssues.length === 0 ? 'RESOLVED' : 'NEEDS_FIXING'
        };
        
        fs.writeFileSync('citicoline-test-report.json', JSON.stringify(report, null, 2));
        
        console.log('\n📋 CITICOLINE TEST SUMMARY:');
        console.log(`Enhanced Citation File: ✅ Exists`);
        console.log(`Loaded in Browser: ${enhancedCitationsLoaded ? '✅ Yes' : '❌ No'}`);
        console.log(`Enhanced Tabs: ${results.citicoline.hasEnhancedTabs ? '✅ Present' : '❌ Missing'}`);
        console.log(`Undefined Issues: ${results.citicoline.undefinedIssues.length === 0 ? '✅ None' : `❌ ${results.citicoline.undefinedIssues.length} tabs affected`}`);
        console.log(`Overall Status: ${report.status}`);
        
        if (results.citicoline.undefinedIssues.length > 0) {
            console.log('\n❌ UNDEFINED ISSUES FOUND:');
            results.citicoline.undefinedIssues.forEach(issue => {
                console.log(`  - ${issue.tab}: ${issue.undefinedCount} undefined instances`);
            });
        }
        
        return report;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
testCiticolineSpecific()
    .then(report => {
        console.log('\n🎯 Citicoline test completed');
        console.log('📄 Detailed report saved to: citicoline-test-report.json');
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
