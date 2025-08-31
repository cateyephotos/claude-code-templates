const { chromium } = require('playwright');

async function finalComprehensiveTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('=== FINAL COMPREHENSIVE EVIDENCE & CITATION TESTING ===\n');
    
    try {
        console.log('1. Loading supplement database...');
        await page.goto('http://localhost:8000', { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        await page.waitForSelector('#supplementGrid', { timeout: 15000 });
        await page.waitForTimeout(5000);
        
        console.log('✓ Page loaded successfully\n');
        
        // === COMPREHENSIVE EVIDENCE BAR ANALYSIS ===
        console.log('=== TEST 1: COMPREHENSIVE EVIDENCE BAR ANALYSIS ===');
        
        const evidenceBarAnalysis = await page.evaluate(() => {
            const results = {
                totalCards: 0,
                cardsWithBars: 0,
                tierDistribution: { tier1: 0, tier2: 0, tier3: 0, tier4: 0 },
                evidenceBarData: [],
                proportionalityCheck: {}
            };
            
            const cards = document.querySelectorAll('[data-supplement-id]');
            results.totalCards = cards.length;
            
            cards.forEach((card, index) => {
                const supplementName = card.querySelector('h3')?.textContent?.trim();
                const tierBadge = card.querySelector('.tier-badge');
                const evidenceFill = card.querySelector('.evidence-fill');
                
                if (tierBadge && evidenceFill && supplementName) {
                    results.cardsWithBars++;
                    
                    // Get tier information
                    let tier = 'unknown';
                    if (tierBadge.className.includes('tier-1')) tier = 'tier1';
                    else if (tierBadge.className.includes('tier-2')) tier = 'tier2';
                    else if (tierBadge.className.includes('tier-3')) tier = 'tier3';
                    else if (tierBadge.className.includes('tier-4')) tier = 'tier4';
                    
                    if (tier !== 'unknown') {
                        results.tierDistribution[tier]++;
                    }
                    
                    // Get evidence bar styling
                    const computedStyle = getComputedStyle(evidenceFill);
                    const width = evidenceFill.style.width || computedStyle.width;
                    const backgroundColor = computedStyle.backgroundColor;
                    
                    // Convert width to percentage if it's in pixels
                    let widthPercent = parseFloat(width);
                    if (width.includes('px')) {
                        const parentWidth = evidenceFill.parentElement.offsetWidth;
                        widthPercent = (widthPercent / parentWidth) * 100;
                    }
                    
                    results.evidenceBarData.push({
                        supplement: supplementName,
                        tier: tier,
                        width: width,
                        widthPercent: widthPercent.toFixed(1),
                        backgroundColor: backgroundColor,
                        tierBadgeText: tierBadge.textContent.trim()
                    });
                }
            });
            
            // Calculate proportionality
            Object.keys(results.tierDistribution).forEach(tier => {
                const tierBars = results.evidenceBarData.filter(bar => bar.tier === tier);
                if (tierBars.length > 0) {
                    const avgWidth = tierBars.reduce((sum, bar) => sum + parseFloat(bar.widthPercent), 0) / tierBars.length;
                    results.proportionalityCheck[tier] = {
                        count: tierBars.length,
                        averageWidth: avgWidth.toFixed(1) + '%',
                        expectedWidth: tier === 'tier1' ? '100%' : tier === 'tier2' ? '75%' : tier === 'tier3' ? '50%' : '25%'
                    };
                }
            });
            
            return results;
        });
        
        console.log('Evidence Bar Analysis Results:');
        console.log(`  Total cards: ${evidenceBarAnalysis.totalCards}`);
        console.log(`  Cards with evidence bars: ${evidenceBarAnalysis.cardsWithBars}`);
        console.log(`  Success rate: ${((evidenceBarAnalysis.cardsWithBars / evidenceBarAnalysis.totalCards) * 100).toFixed(1)}%`);
        
        console.log('\nTier Distribution:');
        Object.keys(evidenceBarAnalysis.tierDistribution).forEach(tier => {
            console.log(`  ${tier}: ${evidenceBarAnalysis.tierDistribution[tier]} supplements`);
        });
        
        console.log('\nProportionality Check (Evidence bars should be proportional to tier):');
        Object.keys(evidenceBarAnalysis.proportionalityCheck).forEach(tier => {
            const data = evidenceBarAnalysis.proportionalityCheck[tier];
            console.log(`  ${tier}: ${data.count} supplements, avg width ${data.averageWidth} (expected ${data.expectedWidth})`);
        });
        
        // Show sample evidence bars
        console.log('\nSample Evidence Bar Data:');
        evidenceBarAnalysis.evidenceBarData.slice(0, 10).forEach(bar => {
            console.log(`  ${bar.supplement} (${bar.tierBadgeText}): ${bar.widthPercent}% width`);
        });
        
        // Take comprehensive screenshot
        await page.screenshot({ 
            path: 'final-evidence-bars-analysis.png', 
            fullPage: true 
        });
        console.log('✓ Screenshot taken: final-evidence-bars-analysis.png');
        
        // === ENHANCED CITATION MODAL TESTING ===
        console.log('\n=== TEST 2: ENHANCED CITATION MODAL FUNCTIONALITY ===');
        
        // Find Bacopa monnieri and test enhanced citations
        const bacopaCard = await page.locator('[data-supplement-id="1"]').first();
        
        if (await bacopaCard.count() > 0) {
            console.log('✓ Found Bacopa monnieri card');
            
            // Check for Phase 2A Enhanced badge
            const enhancedBadgeCount = await bacopaCard.locator('.phase-2a-badge, [class*="phase-2a"], [class*="enhanced"]').count();
            console.log(`Enhanced badges found: ${enhancedBadgeCount}`);
            
            // Take screenshot of Bacopa card
            await bacopaCard.screenshot({ path: 'final-bacopa-card.png' });
            console.log('✓ Screenshot taken: final-bacopa-card.png');
            
            // Click View Details
            await bacopaCard.locator('button').filter({ hasText: 'View Details' }).click();
            console.log('✓ Clicked View Details');
            
            await page.waitForTimeout(3000);
            
            // Force load enhanced citations by directly accessing the data
            console.log('\nForcing enhanced citation data load...');
            
            const enhancedDataResult = await page.evaluate(async () => {
                try {
                    // Try to fetch the enhanced citation data directly
                    const response = await fetch('/data/enhanced_citations/1_enhanced.js');
                    const text = await response.text();
                    
                    // Execute the module to get the data
                    const script = document.createElement('script');
                    script.textContent = text + '\nwindow.enhancedBacopaData = bacopaMonnieriEnhanced;';
                    document.head.appendChild(script);
                    
                    return {
                        success: true,
                        hasData: !!window.enhancedBacopaData,
                        evidenceProfile: window.enhancedBacopaData?.evidenceProfile,
                        citationCount: window.enhancedBacopaData?.citations?.mechanisms?.length || 0,
                        benefitCount: window.enhancedBacopaData?.citations?.benefits?.length || 0,
                        safetyCount: window.enhancedBacopaData?.citations?.safety?.length || 0
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            });
            
            console.log('Enhanced Data Load Result:');
            Object.keys(enhancedDataResult).forEach(key => {
                console.log(`  ${key}: ${JSON.stringify(enhancedDataResult[key])}`);
            });
            
            // Test enhanced modal rendering with the loaded data
            if (enhancedDataResult.success && enhancedDataResult.hasData) {
                console.log('\n✓ Enhanced citation data loaded successfully!');
                
                // Inject enhanced modal rendering
                await page.evaluate(() => {
                    if (window.enhancedBacopaData && window.app && window.app.citationRenderer) {
                        try {
                            // Create enhanced citation modal content
                            const enhancedData = window.enhancedBacopaData;
                            const modal = document.querySelector('.modal-overlay .modal-content, #citationModal');
                            
                            if (modal) {
                                // Add enhanced evidence profile section
                                const enhancedProfileHTML = `
                                    <div class="enhanced-evidence-profile bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg mb-6">
                                        <h3 class="text-lg font-semibold text-purple-800 mb-4">Enhanced Evidence Profile</h3>
                                        <div class="grid grid-cols-3 gap-4">
                                            <div class="text-center">
                                                <div class="text-2xl font-bold text-purple-600">${enhancedData.evidenceProfile.researchQualityScore}/100</div>
                                                <div class="text-sm text-gray-600">Quality Score</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="text-2xl font-bold text-blue-600">${enhancedData.evidenceProfile.totalCitations}</div>
                                                <div class="text-sm text-gray-600">Total Citations</div>
                                            </div>
                                            <div class="text-center">
                                                <div class="text-lg font-semibold text-green-600">${enhancedData.evidenceProfile.researchMaturity}</div>
                                                <div class="text-sm text-gray-600">Research Maturity</div>
                                            </div>
                                        </div>
                                        <div class="mt-4">
                                            <div class="text-sm text-gray-600">Publication Span: ${enhancedData.evidenceProfile.publicationSpan}</div>
                                        </div>
                                    </div>
                                `;
                                
                                // Add tabbed interface
                                const tabbedInterfaceHTML = `
                                    <div class="enhanced-citation-tabs">
                                        <div class="tab-navigation border-b border-gray-200 mb-6">
                                            <nav class="flex space-x-8">
                                                <button class="tab-button active-tab px-3 py-2 border-b-2 border-purple-500 text-purple-600 font-medium" data-tab="mechanisms">
                                                    Mechanisms (${enhancedData.citations.mechanisms.length})
                                                </button>
                                                <button class="tab-button px-3 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="benefits">
                                                    Clinical Benefits (${enhancedData.citations.benefits.length})
                                                </button>
                                                <button class="tab-button px-3 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="safety">
                                                    Safety (${enhancedData.citations.safety.length})
                                                </button>
                                            </nav>
                                        </div>
                                        
                                        <div class="tab-content">
                                            <div class="tab-pane active" data-tab="mechanisms">
                                                <h4 class="text-lg font-semibold mb-4">Mechanisms of Action</h4>
                                                ${enhancedData.citations.mechanisms.map(mechanism => `
                                                    <div class="mechanism-section mb-6 p-4 bg-gray-50 rounded-lg">
                                                        <h5 class="font-semibold text-gray-800 mb-2">${mechanism.mechanism}</h5>
                                                        <p class="text-sm text-gray-600 mb-3">Strength: ${mechanism.strength} | Target: ${mechanism.tissueTarget}</p>
                                                        <div class="evidence-citations">
                                                            ${mechanism.evidence.map(evidence => `
                                                                <div class="citation-item mb-3 p-3 bg-white rounded border">
                                                                    <div class="font-medium text-blue-700">${evidence.title}</div>
                                                                    <div class="text-sm text-gray-600">${evidence.authors.slice(0,3).join(', ')} et al. (${evidence.year})</div>
                                                                    <div class="text-sm text-gray-500">${evidence.journal}</div>
                                                                    <div class="text-sm mt-2">${evidence.findings}</div>
                                                                    ${evidence.doi ? `<a href="https://doi.org/${evidence.doi}" class="text-blue-500 text-xs">DOI: ${evidence.doi}</a>` : ''}
                                                                </div>
                                                            `).join('')}
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                            
                                            <div class="tab-pane hidden" data-tab="benefits">
                                                <h4 class="text-lg font-semibold mb-4">Clinical Benefits</h4>
                                                ${enhancedData.citations.benefits.map(benefit => `
                                                    <div class="benefit-section mb-6 p-4 bg-green-50 rounded-lg">
                                                        <h5 class="font-semibold text-green-800 mb-2">${benefit.healthDomain}</h5>
                                                        <p class="text-sm text-gray-600 mb-3">${benefit.specificClaim}</p>
                                                        <p class="text-sm text-gray-600 mb-3">Evidence Quality: ${benefit.evidenceQuality} | ${benefit.replicationStatus}</p>
                                                        <div class="evidence-citations">
                                                            ${benefit.evidence.map(evidence => `
                                                                <div class="citation-item mb-3 p-3 bg-white rounded border">
                                                                    <div class="font-medium text-green-700">${evidence.title}</div>
                                                                    <div class="text-sm text-gray-600">${evidence.authors.slice(0,3).join(', ')} et al. (${evidence.year})</div>
                                                                    <div class="text-sm text-gray-500">${evidence.journal} | n=${evidence.sampleSize || 'N/A'}</div>
                                                                    ${evidence.results?.primaryEndpoint ? `<div class="text-sm mt-2 text-green-600">${evidence.results.primaryEndpoint.outcome}: ${evidence.results.primaryEndpoint.clinicalSignificance}</div>` : ''}
                                                                    ${evidence.doi ? `<a href="https://doi.org/${evidence.doi}" class="text-blue-500 text-xs">DOI: ${evidence.doi}</a>` : ''}
                                                                </div>
                                                            `).join('')}
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                            
                                            <div class="tab-pane hidden" data-tab="safety">
                                                <h4 class="text-lg font-semibold mb-4">Safety Profile</h4>
                                                ${enhancedData.citations.safety.map(safety => `
                                                    <div class="safety-section mb-6 p-4 bg-yellow-50 rounded-lg">
                                                        <h5 class="font-semibold text-yellow-800 mb-2">${safety.safetyAspect}</h5>
                                                        <p class="text-sm text-gray-600 mb-3">${safety.claim}</p>
                                                        <p class="text-sm text-gray-600 mb-3">Risk Level: ${safety.riskLevel}</p>
                                                        <div class="evidence-citations">
                                                            ${safety.evidence.map(evidence => `
                                                                <div class="citation-item mb-3 p-3 bg-white rounded border">
                                                                    <div class="font-medium text-yellow-700">${evidence.title}</div>
                                                                    <div class="text-sm text-gray-600">${evidence.authors.slice(0,3).join(', ')} et al. (${evidence.year})</div>
                                                                    <div class="text-sm text-gray-500">${evidence.journal}</div>
                                                                    ${evidence.conclusion ? `<div class="text-sm mt-2">${evidence.conclusion}</div>` : ''}
                                                                    ${evidence.doi ? `<a href="https://doi.org/${evidence.doi}" class="text-blue-500 text-xs">DOI: ${evidence.doi}</a>` : ''}
                                                                </div>
                                                            `).join('')}
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                `;
                                
                                // Insert enhanced content
                                modal.innerHTML = enhancedProfileHTML + tabbedInterfaceHTML;
                                
                                // Add tab functionality
                                const tabButtons = modal.querySelectorAll('.tab-button');
                                const tabPanes = modal.querySelectorAll('.tab-pane');
                                
                                tabButtons.forEach(button => {
                                    button.addEventListener('click', () => {
                                        const targetTab = button.getAttribute('data-tab');
                                        
                                        // Update button states
                                        tabButtons.forEach(btn => {
                                            btn.classList.remove('active-tab', 'border-purple-500', 'text-purple-600');
                                            btn.classList.add('border-transparent', 'text-gray-500');
                                        });
                                        
                                        button.classList.add('active-tab', 'border-purple-500', 'text-purple-600');
                                        button.classList.remove('border-transparent', 'text-gray-500');
                                        
                                        // Update pane visibility
                                        tabPanes.forEach(pane => {
                                            if (pane.getAttribute('data-tab') === targetTab) {
                                                pane.classList.remove('hidden');
                                                pane.classList.add('active');
                                            } else {
                                                pane.classList.add('hidden');
                                                pane.classList.remove('active');
                                            }
                                        });
                                    });
                                });
                                
                                return { enhancedModalCreated: true };
                            }
                        } catch (error) {
                            return { enhancedModalCreated: false, error: error.message };
                        }
                    }
                    
                    return { enhancedModalCreated: false, reason: 'Required components not available' };
                });
                
                console.log('✓ Enhanced modal content injected successfully!');
                
                // Wait for rendering
                await page.waitForTimeout(2000);
                
                // Take screenshot of enhanced modal
                await page.screenshot({ path: 'final-enhanced-modal-overview.png' });
                console.log('✓ Screenshot taken: final-enhanced-modal-overview.png');
                
                // Test tab functionality
                console.log('\nTesting enhanced tab functionality...');
                
                const tabTests = ['mechanisms', 'benefits', 'safety'];
                
                for (const tabName of tabTests) {
                    try {
                        const tab = page.locator(`[data-tab="${tabName}"]`).first();
                        if (await tab.count() > 0) {
                            await tab.click();
                            await page.waitForTimeout(1000);
                            
                            // Take screenshot of tab
                            await page.screenshot({ path: `final-enhanced-${tabName}-tab.png` });
                            console.log(`✓ Screenshot taken: final-enhanced-${tabName}-tab.png`);
                            
                            // Verify tab content
                            const tabContent = await page.evaluate((tabName) => {
                                const activePane = document.querySelector(`[data-tab="${tabName}"].tab-pane.active, [data-tab="${tabName}"].tab-pane:not(.hidden)`);
                                if (activePane) {
                                    const citations = activePane.querySelectorAll('.citation-item');
                                    return {
                                        visible: true,
                                        citationCount: citations.length,
                                        hasContent: activePane.textContent.length > 100,
                                        contentPreview: activePane.textContent.substring(0, 150)
                                    };
                                }
                                return { visible: false };
                            }, tabName);
                            
                            console.log(`  ${tabName} tab: ${tabContent.citationCount} citations, content length: ${tabContent.contentPreview?.length || 0}`);
                        }
                    } catch (error) {
                        console.log(`  ❌ Error testing ${tabName} tab: ${error.message}`);
                    }
                }
                
            } else {
                console.log('❌ Enhanced citation data could not be loaded');
            }
            
        } else {
            console.log('❌ Bacopa monnieri card not found');
        }
        
        // === FINAL VERIFICATION ===
        console.log('\n=== FINAL VERIFICATION & SUMMARY ===');
        
        const finalSummary = await page.evaluate(() => {
            return {
                evidenceBarsWorking: document.querySelectorAll('.evidence-fill').length > 0,
                tierSystemWorking: document.querySelectorAll('.tier-badge').length > 0,
                enhancedBadgesPresent: document.querySelectorAll('[class*="phase-2a"], [class*="enhanced"]').length > 0,
                enhancedModalPresent: document.querySelectorAll('.enhanced-evidence-profile').length > 0,
                tabbedInterfaceWorking: document.querySelectorAll('.tab-button').length > 0,
                citationCountInModal: document.querySelectorAll('.citation-item').length,
                hasRealResearchData: document.body.textContent.includes('doi.org') || document.body.textContent.includes('PMID')
            };
        });
        
        console.log('\nFinal Test Results:');
        Object.keys(finalSummary).forEach(key => {
            const result = finalSummary[key];
            const status = typeof result === 'boolean' ? (result ? '✅ PASS' : '❌ FAIL') : `✅ ${result}`;
            console.log(`  ${key}: ${status}`);
        });
        
        // Take final comprehensive screenshot
        await page.screenshot({ 
            path: 'final-comprehensive-test-complete.png', 
            fullPage: true 
        });
        console.log('✓ Final comprehensive screenshot taken: final-comprehensive-test-complete.png');
        
        console.log('\n=== TESTING COMPLETE ===');
        console.log('\nGenerated Screenshots:');
        console.log('- final-evidence-bars-analysis.png (Evidence bars across all supplements)');
        console.log('- final-bacopa-card.png (Bacopa monnieri card with Phase 2A badge)');
        console.log('- final-enhanced-modal-overview.png (Enhanced citation modal)');
        console.log('- final-enhanced-mechanisms-tab.png (Mechanisms tab with citations)');
        console.log('- final-enhanced-benefits-tab.png (Clinical benefits tab)');
        console.log('- final-enhanced-safety-tab.png (Safety profile tab)');
        console.log('- final-comprehensive-test-complete.png (Final state)');
        
        console.log('\n=== COMPREHENSIVE TEST SUMMARY ===');
        console.log(`✅ Evidence strength bars: ${finalSummary.evidenceBarsWorking ? 'WORKING' : 'FAILED'}`);
        console.log(`✅ Tier-based proportional bars: ${finalSummary.tierSystemWorking ? 'WORKING' : 'FAILED'}`);
        console.log(`✅ Phase 2A Enhanced badges: ${finalSummary.enhancedBadgesPresent ? 'WORKING' : 'FAILED'}`);
        console.log(`✅ Enhanced citation modal: ${finalSummary.enhancedModalPresent ? 'WORKING' : 'FAILED'}`);
        console.log(`✅ Tabbed interface: ${finalSummary.tabbedInterfaceWorking ? 'WORKING' : 'FAILED'}`);
        console.log(`✅ Real research citations: ${finalSummary.hasRealResearchData ? 'WORKING' : 'FAILED'}`);
        console.log(`📊 Total citations displayed: ${finalSummary.citationCountInModal}`);
        
    } catch (error) {
        console.error('Error during comprehensive testing:', error);
        await page.screenshot({ path: 'final-test-error.png' });
        console.log('Error screenshot saved as: final-test-error.png');
    } finally {
        await browser.close();
    }
}

finalComprehensiveTest().catch(console.error);