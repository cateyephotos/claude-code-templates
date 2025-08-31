const puppeteer = require('playwright');

async function checkAllSupplementsSystematic() {
    const browser = await puppeteer.chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Track already verified clean supplements
    const verifiedClean = ['1', '2', '5']; // Bacopa, Turmeric, Creatine already verified
    
    const issues = [];
    const cleanSupplements = [];
    
    try {
        console.log('🌐 Navigating to supplement database...');
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Get all supplement cards
        const cards = await page.$$('[data-supplement-id]');
        console.log(`Found ${cards.length} supplement cards to check`);
        
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            
            try {
                const supplementId = await card.getAttribute('data-supplement-id');
                const supplementName = await card.$eval('h3', el => el.textContent?.trim());
                
                // Skip already verified supplements
                if (verifiedClean.includes(supplementId)) {
                    console.log(`⏭️  Skipping ${supplementName} (ID: ${supplementId}) - already verified clean`);
                    cleanSupplements.push({ id: supplementId, name: supplementName, status: 'previously_verified' });
                    continue;
                }
                
                console.log(`\n🔍 Checking supplement ${i + 1}/${cards.length}: ${supplementName} (ID: ${supplementId})`);
                
                // Check if this supplement has enhanced citations (Phase 2A badge)
                const hasPhase2ABadge = await card.$('.phase-2a-badge') !== null;
                
                if (!hasPhase2ABadge) {
                    console.log(`   ℹ️  No enhanced citations - skipping modal test`);
                    cleanSupplements.push({ id: supplementId, name: supplementName, status: 'no_enhanced_citations' });
                    continue;
                }
                
                console.log(`   ✨ Enhanced supplement detected - testing modal...`);
                
                // Click View Details button
                const viewDetailsBtn = await card.$('button:has-text("View Details")');
                if (!viewDetailsBtn) {
                    console.log(`   ❌ No View Details button found`);
                    issues.push({
                        type: 'no_view_details_button',
                        supplementId: supplementId,
                        supplementName: supplementName
                    });
                    continue;
                }
                
                await viewDetailsBtn.click();
                await page.waitForTimeout(1500);
                
                // Check if modal opened
                const modal = await page.$('.fixed.inset-0');
                if (!modal) {
                    console.log(`   ❌ Modal failed to open`);
                    issues.push({
                        type: 'modal_failed_to_open',
                        supplementId: supplementId,
                        supplementName: supplementName
                    });
                    continue;
                }
                
                console.log(`   📋 Modal opened - checking for undefined text...`);
                
                // Check entire modal for undefined text
                const modalText = await modal.textContent();
                const modalHtml = await modal.innerHTML();
                
                // Look for various undefined patterns
                const undefinedPatterns = [
                    /Target:\s*undefined/gi,
                    /Target undefined/gi,
                    /<strong>Target:<\/strong>\s*undefined/gi,
                    /tissueTarget.*undefined/gi,
                    /target.*undefined/gi,
                    /\bundefined\b/gi  // Any standalone "undefined"
                ];
                
                let foundUndefined = false;
                const foundPatterns = [];
                
                undefinedPatterns.forEach((pattern, index) => {
                    const matches = modalHtml.match(pattern);
                    if (matches && matches.length > 0) {
                        foundUndefined = true;
                        foundPatterns.push({
                            pattern: pattern.toString(),
                            matches: matches.length,
                            examples: matches.slice(0, 3) // First 3 examples
                        });
                    }
                });
                
                if (foundUndefined) {
                    console.log(`   ❌ UNDEFINED ISSUES FOUND!`);
                    foundPatterns.forEach((fp, index) => {
                        console.log(`     Pattern ${index + 1}: ${fp.pattern} (${fp.matches} matches)`);
                        fp.examples.forEach(example => {
                            console.log(`       Example: "${example}"`);
                        });
                    });
                    
                    // Test individual tabs to isolate the issue
                    const tabs = await modal.$$('.citation-tab-btn');
                    const tabIssues = [];
                    
                    for (let j = 0; j < tabs.length; j++) {
                        const tab = tabs[j];
                        const tabName = await tab.textContent();
                        
                        await tab.click();
                        await page.waitForTimeout(500);
                        
                        const activeTabContent = await modal.$('.citation-tab-content:not(.hidden)');
                        if (activeTabContent) {
                            const tabContentHtml = await activeTabContent.innerHTML();
                            const tabHasUndefined = undefinedPatterns.some(pattern => pattern.test(tabContentHtml));
                            
                            if (tabHasUndefined) {
                                console.log(`     📑 Tab "${tabName?.trim()}" has undefined issues`);
                                tabIssues.push(tabName?.trim());
                            } else {
                                console.log(`     📑 Tab "${tabName?.trim()}" is clean`);
                            }
                        }
                    }
                    
                    issues.push({
                        type: 'undefined_in_modal',
                        supplementId: supplementId,
                        supplementName: supplementName,
                        patterns: foundPatterns,
                        affectedTabs: tabIssues
                    });
                    
                } else {
                    console.log(`   ✅ Clean - no undefined issues found`);
                    cleanSupplements.push({ id: supplementId, name: supplementName, status: 'verified_clean' });
                }
                
                // Close modal
                const closeBtn = await modal.$('button');
                if (closeBtn) {
                    await closeBtn.click();
                    await page.waitForTimeout(500);
                }
                
            } catch (error) {
                console.error(`   ❌ Error checking supplement ${i + 1}:`, error.message);
                issues.push({
                    type: 'verification_error',
                    supplementId: await card.getAttribute('data-supplement-id'),
                    supplementName: 'Unknown',
                    error: error.message
                });
            }
        }
        
        // Generate comprehensive report
        console.log(`\n📊 SYSTEMATIC CHECK COMPLETE:`);
        console.log(`   Total supplements: ${cards.length}`);
        console.log(`   Clean supplements: ${cleanSupplements.length}`);
        console.log(`   Supplements with issues: ${issues.length}`);
        
        if (issues.length > 0) {
            console.log(`\n❌ SUPPLEMENTS WITH UNDEFINED ISSUES:`);
            issues.filter(issue => issue.type === 'undefined_in_modal').forEach((issue, index) => {
                console.log(`\n${index + 1}. ${issue.supplementName} (ID: ${issue.supplementId})`);
                console.log(`   Affected tabs: ${issue.affectedTabs.join(', ')}`);
                issue.patterns.forEach(pattern => {
                    console.log(`   Pattern: ${pattern.pattern} (${pattern.matches} matches)`);
                });
            });
        } else {
            console.log(`\n🎉 ALL SUPPLEMENTS ARE CLEAN!`);
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalSupplements: cards.length,
                cleanSupplements: cleanSupplements.length,
                issuesFound: issues.length,
                enhancedSupplementsChecked: cleanSupplements.filter(s => s.status === 'verified_clean').length + issues.filter(i => i.type === 'undefined_in_modal').length
            },
            cleanSupplements: cleanSupplements,
            issues: issues
        };
        
        return report;
        
    } catch (error) {
        console.error('❌ Systematic check failed:', error);
        return { error: error.message };
    } finally {
        await browser.close();
    }
}

// Run systematic check
checkAllSupplementsSystematic().then(report => {
    const fs = require('fs');
    fs.writeFileSync('systematic-supplement-check-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to systematic-supplement-check-report.json');
}).catch(console.error);