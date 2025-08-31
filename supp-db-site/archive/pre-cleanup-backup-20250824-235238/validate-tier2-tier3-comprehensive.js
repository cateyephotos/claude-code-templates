/**
 * Comprehensive Tier 2 & 3 Supplement Validation
 * Focus on smart rendering system and different enhanced citation formats
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function validateTier2Tier3Comprehensive() {
    console.log('🔬 Comprehensive Tier 2 & 3 Supplement Validation\n');
    
    // Target supplements for validation - diverse mix of Tier 2 & 3
    const targetSupplements = [
        { id: 2, name: 'Turmeric/Curcumin', tier: 1, expectedFiles: ['2_enhanced.js'] },
        { id: 3, name: 'Ashwagandha', tier: 2, expectedFiles: ['3_enhanced.js'] },
        { id: 5, name: 'Creatine', tier: 2, expectedFiles: ['5_enhanced.js', '5_creatine_enhanced.js', '5_creatine_mens_health_enhanced.js'] },
        { id: 6, name: 'Magnesium', tier: 2, expectedFiles: ['6_enhanced.js', '6_magnesium_enhanced.js', '6_magnesium_l_threonate_enhanced.js'] },
        { id: 7, name: 'Vitamin D3', tier: 2, expectedFiles: ['7_enhanced.js', '7_vitamin_d3_enhanced.js'] },
        { id: 13, name: 'Acetyl-L-Carnitine', tier: 3, expectedFiles: ['13_enhanced.js', '13_acetyl_l_carnitine_enhanced.js'] },
        { id: 21, name: 'Vitamin B12', tier: 3, expectedFiles: ['21_enhanced.js', '21_vitamin_b12_enhanced.js'] },
        { id: 37, name: 'Zinc', tier: 3, expectedFiles: ['37_enhanced.js', '37_zinc_enhanced.js', '37_zinc_mens_health_enhanced.js'] },
        { id: 43, name: 'Choline', tier: 3, expectedFiles: ['43_enhanced.js', '43_choline_enhanced.js', '43_choline_bitartrate_enhanced.js'] },
        { id: 75, name: 'Berberine', tier: 3, expectedFiles: ['75_enhanced.js'] }
    ];
    
    console.log(`🎯 Testing ${targetSupplements.length} supplements across Tier 1-3`);
    console.log(`📊 Distribution: Tier 1: 1, Tier 2: 4, Tier 3: 5\n`);
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    const results = {
        timestamp: new Date().toISOString(),
        totalTested: 0,
        fullyWorking: 0,
        hasIssues: 0,
        failed: 0,
        smartRenderingTests: [],
        fileAnalysis: [],
        supplements: []
    };
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Get enhanced citations data from frontend
        const enhancedCitationsData = await page.evaluate(() => {
            return window.enhancedCitations ? Object.keys(window.enhancedCitations) : [];
        });
        
        console.log(`📚 Enhanced citations loaded: ${enhancedCitationsData.length} supplements`);
        console.log(`🔢 IDs: ${enhancedCitationsData.slice(0, 15).join(', ')}${enhancedCitationsData.length > 15 ? '...' : ''}\n`);
        
        for (const supplement of targetSupplements) {
            console.log(`🔍 Testing ${supplement.name} (ID: ${supplement.id}, Tier ${supplement.tier})...`);
            
            const result = {
                id: supplement.id,
                name: supplement.name,
                tier: supplement.tier,
                expectedFiles: supplement.expectedFiles,
                actualFiles: [],
                hasEnhancedBadge: false,
                hasEnhancedTabs: false,
                tabsFound: [],
                undefinedCount: 0,
                renderingQuality: 'UNKNOWN',
                smartRenderingTest: null,
                issues: []
            };
            
            // Check which enhanced files actually exist
            for (const fileName of supplement.expectedFiles) {
                const filePath = `./data/enhanced_citations/${fileName}`;
                if (fs.existsSync(filePath)) {
                    result.actualFiles.push(fileName);
                }
            }
            
            console.log(`  📁 Files: Expected ${supplement.expectedFiles.length}, Found ${result.actualFiles.length}`);
            if (result.actualFiles.length !== supplement.expectedFiles.length) {
                const missing = supplement.expectedFiles.filter(f => !result.actualFiles.includes(f));
                console.log(`    ⚠️ Missing files: ${missing.join(', ')}`);
                result.issues.push(`Missing files: ${missing.join(', ')}`);
            }
            
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
                    result.renderingQuality = 'CARD_NOT_FOUND';
                    result.issues.push('Card not found on page');
                    console.log(`  ❌ Card not found`);
                    results.supplements.push(result);
                    results.failed++;
                    continue;
                }
                
                // Check for enhanced badge
                const badge = await targetCard.$('.phase-2a-badge');
                result.hasEnhancedBadge = !!badge;
                console.log(`  📛 Enhanced badge: ${result.hasEnhancedBadge ? '✅' : '❌'}`);
                
                // Open modal
                const viewBtn = await targetCard.$('button:has-text("View Details")');
                if (!viewBtn) {
                    result.renderingQuality = 'NO_VIEW_BUTTON';
                    result.issues.push('View Details button not found');
                    console.log(`  ❌ No View Details button`);
                    results.supplements.push(result);
                    results.failed++;
                    continue;
                }
                
                await viewBtn.click();
                await page.waitForTimeout(3000);
                
                // Check for enhanced tabs
                const mechanismsTab = await page.$('button:has-text("Mechanisms")');
                const benefitsTab = await page.$('button:has-text("Benefits"), button:has-text("Clinical Benefits")');
                const safetyTab = await page.$('button:has-text("Safety")');
                const dosageTab = await page.$('button:has-text("Dosage")');
                
                if (mechanismsTab) result.tabsFound.push('Mechanisms');
                if (benefitsTab) result.tabsFound.push('Benefits');
                if (safetyTab) result.tabsFound.push('Safety');
                if (dosageTab) result.tabsFound.push('Dosage');
                
                result.hasEnhancedTabs = result.tabsFound.length >= 3;
                console.log(`  📑 Enhanced tabs: ${result.tabsFound.join(', ')}`);
                
                // Test smart rendering by checking each tab
                const smartRenderingTest = {
                    mechanismsTest: null,
                    benefitsTest: null,
                    safetyTest: null,
                    overallQuality: 'UNKNOWN'
                };
                
                // Test Benefits tab (most complex for smart rendering)
                if (benefitsTab) {
                    await benefitsTab.click();
                    await page.waitForTimeout(2000);
                    
                    const benefitsContent = await page.textContent('#supplementModal');
                    const undefinedCount = benefitsContent ? (benefitsContent.match(/undefined/g) || []).length : 0;
                    result.undefinedCount += undefinedCount;
                    
                    // Check for smart rendering indicators
                    const hasHealthDomains = benefitsContent && benefitsContent.includes('Health Domain');
                    const hasSpecificClaims = benefitsContent && benefitsContent.includes('Specific Claim');
                    const hasEvidenceQuality = benefitsContent && benefitsContent.includes('Evidence Quality');
                    const hasStudyDetails = benefitsContent && (benefitsContent.includes('Study Type') || benefitsContent.includes('Sample Size'));
                    
                    smartRenderingTest.benefitsTest = {
                        undefinedCount,
                        hasHealthDomains,
                        hasSpecificClaims,
                        hasEvidenceQuality,
                        hasStudyDetails,
                        contentLength: benefitsContent ? benefitsContent.length : 0
                    };
                    
                    console.log(`    🧪 Benefits: ${undefinedCount} undefined, ${benefitsContent ? benefitsContent.length : 0} chars`);
                }
                
                // Test Mechanisms tab
                if (mechanismsTab) {
                    await mechanismsTab.click();
                    await page.waitForTimeout(2000);
                    
                    const mechanismsContent = await page.textContent('#supplementModal');
                    const undefinedCount = mechanismsContent ? (mechanismsContent.match(/undefined/g) || []).length : 0;
                    result.undefinedCount += undefinedCount;
                    
                    smartRenderingTest.mechanismsTest = {
                        undefinedCount,
                        contentLength: mechanismsContent ? mechanismsContent.length : 0,
                        hasMechanismTypes: mechanismsContent && mechanismsContent.includes('Mechanism Type'),
                        hasTargetTissues: mechanismsContent && mechanismsContent.includes('Target')
                    };
                    
                    console.log(`    🧪 Mechanisms: ${undefinedCount} undefined, ${mechanismsContent ? mechanismsContent.length : 0} chars`);
                }
                
                // Test Safety tab
                if (safetyTab) {
                    await safetyTab.click();
                    await page.waitForTimeout(2000);
                    
                    const safetyContent = await page.textContent('#supplementModal');
                    const undefinedCount = safetyContent ? (safetyContent.match(/undefined/g) || []).length : 0;
                    result.undefinedCount += undefinedCount;
                    
                    smartRenderingTest.safetyTest = {
                        undefinedCount,
                        contentLength: safetyContent ? safetyContent.length : 0,
                        hasRiskLevels: safetyContent && safetyContent.includes('Risk Level'),
                        hasSafetyAspects: safetyContent && safetyContent.includes('Safety Aspect')
                    };
                    
                    console.log(`    🧪 Safety: ${undefinedCount} undefined, ${safetyContent ? safetyContent.length : 0} chars`);
                }
                
                // Determine smart rendering quality
                const totalUndefined = result.undefinedCount;
                const hasRichContent = (smartRenderingTest.benefitsTest?.contentLength || 0) > 500;
                const hasStructuredData = smartRenderingTest.benefitsTest?.hasHealthDomains || 
                                        smartRenderingTest.mechanismsTest?.hasMechanismTypes ||
                                        smartRenderingTest.safetyTest?.hasRiskLevels;
                
                if (totalUndefined === 0 && hasRichContent && hasStructuredData) {
                    smartRenderingTest.overallQuality = 'EXCELLENT';
                } else if (totalUndefined === 0 && hasRichContent) {
                    smartRenderingTest.overallQuality = 'GOOD';
                } else if (totalUndefined === 0) {
                    smartRenderingTest.overallQuality = 'BASIC';
                } else {
                    smartRenderingTest.overallQuality = 'POOR';
                }
                
                result.smartRenderingTest = smartRenderingTest;
                
                // Determine overall rendering quality
                if (!result.hasEnhancedBadge) {
                    result.renderingQuality = 'MISSING_BADGE';
                    result.issues.push('Missing enhanced badge');
                } else if (!result.hasEnhancedTabs) {
                    result.renderingQuality = 'MISSING_TABS';
                    result.issues.push(`Missing enhanced tabs. Found: ${result.tabsFound.join(', ')}`);
                } else if (result.undefinedCount > 0) {
                    result.renderingQuality = 'HAS_UNDEFINED';
                    result.issues.push(`${result.undefinedCount} undefined issues`);
                } else if (smartRenderingTest.overallQuality === 'EXCELLENT') {
                    result.renderingQuality = 'FULLY_WORKING_EXCELLENT';
                } else {
                    result.renderingQuality = 'FULLY_WORKING';
                }
                
                // Update counters
                if (result.renderingQuality.startsWith('FULLY_WORKING')) {
                    results.fullyWorking++;
                    console.log(`  ✅ ${result.renderingQuality} (Smart: ${smartRenderingTest.overallQuality})`);
                } else {
                    results.hasIssues++;
                    console.log(`  ⚠️ ${result.renderingQuality}: ${result.issues.join('; ')}`);
                }
                
                results.tested++;
                results.supplements.push(result);
                results.smartRenderingTests.push({
                    id: supplement.id,
                    name: supplement.name,
                    quality: smartRenderingTest.overallQuality,
                    details: smartRenderingTest
                });
                
                // Close modal
                await page.keyboard.press('Escape');
                await page.waitForTimeout(1000);
                
                // Force close if still open
                await page.evaluate(() => {
                    const modal = document.getElementById('supplementModal');
                    if (modal) modal.style.display = 'none';
                });
                
            } catch (error) {
                result.renderingQuality = 'ERROR';
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
            
            console.log(''); // Add spacing between supplements
            await page.waitForTimeout(1500); // Wait between tests
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
    
    return results;
}

// Run validation and generate comprehensive report
if (require.main === module) {
    validateTier2Tier3Comprehensive()
        .then(results => {
            console.log('\n📋 COMPREHENSIVE TIER 2 & 3 VALIDATION REPORT');
            console.log('=' .repeat(70));
            console.log(`🧪 Total Tested: ${results.totalTested}`);
            console.log(`✅ Fully Working: ${results.fullyWorking}`);
            console.log(`⚠️ Has Issues: ${results.hasIssues}`);
            console.log(`❌ Failed: ${results.failed}`);
            
            const successRate = results.totalTested > 0 ? Math.round((results.fullyWorking / results.totalTested) * 100) : 0;
            console.log(`📈 Success Rate: ${successRate}%`);
            
            // Smart rendering analysis
            console.log('\n🧠 SMART RENDERING ANALYSIS:');
            const smartQualities = results.smartRenderingTests.reduce((acc, test) => {
                acc[test.quality] = (acc[test.quality] || 0) + 1;
                return acc;
            }, {});
            
            Object.entries(smartQualities).forEach(([quality, count]) => {
                console.log(`  ${quality}: ${count} supplements`);
            });
            
            console.log('\n🔍 DETAILED RESULTS BY TIER:');
            [1, 2, 3].forEach(tier => {
                const tierSupplements = results.supplements.filter(s => s.tier === tier);
                if (tierSupplements.length > 0) {
                    console.log(`\nTier ${tier} Supplements:`);
                    tierSupplements.forEach(supp => {
                        const statusIcon = supp.renderingQuality.startsWith('FULLY_WORKING') ? '✅' : 
                                          supp.renderingQuality === 'ERROR' ? '❌' : '⚠️';
                        const smartQuality = supp.smartRenderingTest?.overallQuality || 'N/A';
                        console.log(`${statusIcon} ${supp.name} - ${supp.renderingQuality} (Smart: ${smartQuality})`);
                        if (supp.issues.length > 0) {
                            supp.issues.forEach(issue => {
                                console.log(`    • ${issue}`);
                            });
                        }
                    });
                }
            });
            
            // Save detailed report
            fs.writeFileSync('tier2-tier3-comprehensive-validation.json', JSON.stringify(results, null, 2));
            console.log('\n📄 Detailed report saved to: tier2-tier3-comprehensive-validation.json');
            
            // Final assessment
            if (results.fullyWorking === results.totalTested) {
                console.log('\n🚀 EXCELLENT - All tested supplements working perfectly!');
            } else if (results.fullyWorking / results.totalTested >= 0.8) {
                console.log('\n✅ GOOD - Most supplements working, minor fixes needed.');
            } else {
                console.log('\n⚠️ NEEDS WORK - Significant issues detected.');
            }
        })
        .catch(error => {
            console.error('💥 Validation failed:', error);
            process.exit(1);
        });
}

module.exports = { validateTier2Tier3Comprehensive };
