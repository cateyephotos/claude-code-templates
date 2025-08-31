/**
 * Comprehensive Audit: Undefined Enhanced Citations Detection
 * Uses Playwright to identify supplements with rendering issues
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function auditUndefinedCitations() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Starting comprehensive undefined citations audit...');
    
    try {
        // Navigate to the supplement database
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000); // Allow full loading
        
        console.log('📊 Page loaded, analyzing supplement cards...');
        
        // Get all supplement cards using the correct selector
        const supplementCards = await page.$$('[class*="card"]');
        console.log(`Found ${supplementCards.length} supplement cards`);
        
        const auditResults = {
            timestamp: new Date().toISOString(),
            totalSupplements: supplementCards.length,
            enhancedSupplements: [],
            undefinedIssues: [],
            properlyRendered: [],
            lastWorkedSupplement: null
        };
        
        // Check each supplement card
        for (let i = 0; i < supplementCards.length; i++) {
            const card = supplementCards[i];
            
            try {
                // Get supplement name - try multiple selectors
                let nameElement = await card.$('h3');
                if (!nameElement) nameElement = await card.$('h2');
                if (!nameElement) nameElement = await card.$('.supplement-name');
                if (!nameElement) nameElement = await card.$('[class*="title"]');
                const supplementName = await nameElement?.textContent() || `Supplement ${i + 1}`;
                
                // Check for Phase 2A badge (enhanced supplement indicator)
                const phase2ABadge = await card.$('.phase-2a-badge');
                const isEnhanced = !!phase2ABadge;
                
                if (isEnhanced) {
                    console.log(`🔬 Found enhanced supplement: ${supplementName}`);
                    auditResults.enhancedSupplements.push(supplementName);
                    
                    // Click to open modal and check for undefined issues
                    const viewDetailsBtn = await card.$('button:has-text("View Details")');
                    if (viewDetailsBtn) {
                        await viewDetailsBtn.click();
                        await page.waitForTimeout(2000); // Wait for modal to load
                        
                        // Check for undefined text in modal
                        const modalContent = await page.textContent('body');
                        const hasUndefined = modalContent && modalContent.includes('undefined');
                        
                        if (hasUndefined) {
                            console.log(`❌ UNDEFINED FOUND in ${supplementName}`);
                            
                            // Capture specific undefined instances
                            const undefinedMatches = modalContent.match(/undefined/g);
                            auditResults.undefinedIssues.push({
                                supplement: supplementName,
                                undefinedCount: undefinedMatches ? undefinedMatches.length : 0,
                                cardIndex: i
                            });
                            
                            // Take screenshot of the issue
                            await page.screenshot({
                                path: `undefined-issue-${supplementName.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
                                fullPage: true
                            });
                        } else {
                            console.log(`✅ ${supplementName} renders properly`);
                            auditResults.properlyRendered.push(supplementName);
                        }
                        
                        // Close modal
                        await page.keyboard.press('Escape');
                        await page.waitForTimeout(1000);
                    }
                }
            } catch (error) {
                console.log(`⚠️ Error checking supplement ${i}: ${error.message}`);
            }
        }
        
        // Identify the last worked supplement based on timestamps
        // From project logs: most recent files were 27_enhanced.js, 24_enhanced.js, 20_enhanced.js
        const recentlyWorkedSupplements = [
            'Supplement ID 27', 'Supplement ID 24', 'Supplement ID 20',
            'Supplement ID 35', 'Supplement ID 15', 'Supplement ID 75'
        ];
        
        // Check if any of the recently worked supplements are in our enhanced list
        for (const recentSupplement of recentlyWorkedSupplements) {
            const found = auditResults.enhancedSupplements.find(name => 
                name.toLowerCase().includes(recentSupplement.toLowerCase()) ||
                auditResults.undefinedIssues.find(issue => issue.supplement === name)
            );
            if (found) {
                auditResults.lastWorkedSupplement = found;
                break;
            }
        }
        
        // Generate comprehensive report
        const report = {
            ...auditResults,
            summary: {
                totalEnhanced: auditResults.enhancedSupplements.length,
                withUndefinedIssues: auditResults.undefinedIssues.length,
                properlyRendered: auditResults.properlyRendered.length,
                successRate: `${Math.round((auditResults.properlyRendered.length / auditResults.enhancedSupplements.length) * 100)}%`
            }
        };
        
        // Save detailed report
        fs.writeFileSync(
            'undefined-citations-audit-report.json',
            JSON.stringify(report, null, 2)
        );
        
        console.log('\n📋 AUDIT COMPLETE - SUMMARY:');
        console.log(`Total Supplements: ${report.totalSupplements}`);
        console.log(`Enhanced Supplements: ${report.summary.totalEnhanced}`);
        console.log(`With Undefined Issues: ${report.summary.withUndefinedIssues}`);
        console.log(`Properly Rendered: ${report.summary.properlyRendered}`);
        console.log(`Success Rate: ${report.summary.successRate}`);
        
        if (report.undefinedIssues.length > 0) {
            console.log('\n❌ SUPPLEMENTS WITH UNDEFINED ISSUES:');
            report.undefinedIssues.forEach(issue => {
                console.log(`  - ${issue.supplement} (${issue.undefinedCount} undefined instances)`);
            });
        }
        
        if (report.lastWorkedSupplement) {
            console.log(`\n🔧 Last Worked Supplement: ${report.lastWorkedSupplement}`);
            const isResolved = report.properlyRendered.includes(report.lastWorkedSupplement);
            console.log(`Status: ${isResolved ? '✅ RESOLVED' : '❌ STILL HAS ISSUES'}`);
        }
        
        return report;
        
    } catch (error) {
        console.error('❌ Audit failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the audit
auditUndefinedCitations()
    .then(report => {
        console.log('\n🎯 Audit completed successfully');
        console.log('📄 Detailed report saved to: undefined-citations-audit-report.json');
    })
    .catch(error => {
        console.error('💥 Audit failed:', error);
        process.exit(1);
    });
