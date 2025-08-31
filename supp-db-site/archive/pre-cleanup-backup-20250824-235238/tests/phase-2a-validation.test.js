/**
 * Phase 2A Enhanced Citation Validation Test Suite
 * Validates enhanced citation implementations against established patterns
 */

class Phase2AValidationTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            errors: []
        };
        this.supplementsToTest = [];
        this.startTime = performance.now();
    }

    /**
     * Run comprehensive Phase 2A validation tests
     */
    async runAllTests() {
        console.log('🧪 Starting Phase 2A Enhanced Citation Validation Tests...');
        
        // Discover all enhanced supplements
        await this.discoverEnhancedSupplements();
        
        // Run pattern compliance tests
        await this.testPatternCompliance();
        
        // Run data quality validation
        await this.testDataQuality();
        
        // Run UI functionality tests
        await this.testUIFunctionality();
        
        // Run performance benchmarks
        await this.testPerformanceBenchmarks();
        
        // Run console error monitoring
        await this.testConsoleErrorMonitoring();
        
        this.displayResults();
        return this.testResults;
    }

    /**
     * Discover all enhanced supplements in the system
     */
    async discoverEnhancedSupplements() {
        console.log('🔍 Discovering enhanced supplements...');
        
        if (window.supplementDatabase && window.supplementDatabase.supplements) {
            this.supplementsToTest = window.supplementDatabase.supplements.filter(
                supplement => supplement.enhancedCitations?.isEnhanced === true
            );
            console.log(`Found ${this.supplementsToTest.length} enhanced supplements`);
        } else {
            this.logError('Supplement database not available');
        }
    }

    /**
     * Test pattern compliance against established constraints
     */
    async testPatternCompliance() {
        console.log('⚙️ Testing pattern compliance...');
        
        for (const supplement of this.supplementsToTest) {
            // Test 1: Global citation data availability
            await this.test(`Enhanced citations available for ${supplement.name}`, () => {
                return window.enhancedCitations && 
                       window.enhancedCitations[supplement.id] !== undefined;
            });

            // Test 2: Phase 2A badge presence
            await this.test(`Phase 2A badge present for ${supplement.name}`, () => {
                const badge = document.querySelector(`[data-supplement-id="${supplement.id}"] .phase-2a-badge`);
                return badge !== null;
            });

            // Test 3: Tier class correctness
            await this.test(`Tier class correct for ${supplement.name}`, () => {
                const tierBadge = document.querySelector(`[data-supplement-id="${supplement.id}"] .tier-badge, [data-supplement-id="${supplement.id}"] .tier-2, [data-supplement-id="${supplement.id}"] .tier-3, [data-supplement-id="${supplement.id}"] .tier-4`);
                
                const expectedClass = this.getExpectedTierClass(supplement.evidenceTier);
                return tierBadge && tierBadge.classList.contains(expectedClass);
            });

            // Test 4: Evidence bar proportional width
            await this.test(`Evidence bar width correct for ${supplement.name}`, () => {
                const evidenceBar = document.querySelector(`[data-supplement-id="${supplement.id}"] .evidence-fill`);
                if (!evidenceBar) return false;
                
                const style = evidenceBar.getAttribute('style');
                const expectedWidth = (5 - supplement.evidenceTier) * 25;
                
                return style && style.includes(`width: ${expectedWidth}%`);
            });
        }
    }

    /**
     * Test data quality requirements by tier
     */
    async testDataQuality() {
        console.log('📊 Testing data quality requirements...');
        
        for (const supplement of this.supplementsToTest) {
            const enhancedData = window.enhancedCitations[supplement.id];
            if (!enhancedData) continue;

            const tier = supplement.evidenceTier;
            const requirements = this.getTierRequirements(tier);

            // Test citation counts by category
            const citations = enhancedData.citations || {};
            
            await this.test(`${supplement.name} mechanisms count (min: ${requirements.mechanisms})`, () => {
                return citations.mechanisms && citations.mechanisms.length >= requirements.mechanisms;
            });

            await this.test(`${supplement.name} benefits count (min: ${requirements.benefits})`, () => {
                return citations.benefits && citations.benefits.length >= requirements.benefits;
            });

            await this.test(`${supplement.name} safety count (min: ${requirements.safety})`, () => {
                return citations.safety && citations.safety.length >= requirements.safety;
            });

            await this.test(`${supplement.name} dosage count (min: ${requirements.dosage})`, () => {
                return citations.dosage && citations.dosage.length >= requirements.dosage;
            });

            // Test evidence profile completeness
            await this.test(`${supplement.name} evidence profile complete`, () => {
                const profile = enhancedData.evidenceProfile;
                return profile && 
                       profile.researchQualityScore !== undefined &&
                       profile.totalCitations !== undefined &&
                       profile.evidenceStrength !== undefined;
            });

            // Test total citation count
            const totalCitations = Object.values(citations).reduce((sum, category) => 
                sum + (Array.isArray(category) ? category.length : 0), 0
            );
            
            await this.test(`${supplement.name} total citations (min: ${requirements.total})`, () => {
                return totalCitations >= requirements.total;
            });
        }
    }

    /**
     * Test UI functionality for enhanced supplements
     */
    async testUIFunctionality() {
        console.log('🎨 Testing UI functionality...');
        
        for (const supplement of this.supplementsToTest) {
            // Test modal opening
            await this.test(`${supplement.name} modal opens`, async () => {
                try {
                    if (window.app && window.app.showSupplementDetails) {
                        await window.app.showSupplementDetails(supplement.id);
                        const modal = document.getElementById('supplementModal');
                        return modal && !modal.classList.contains('hidden');
                    }
                    return false;
                } catch (error) {
                    console.warn(`Modal test failed for ${supplement.name}:`, error);
                    return false;
                }
            });

            // Test tab presence
            await this.test(`${supplement.name} citation tabs present`, () => {
                const tabs = document.querySelectorAll('.citation-tab-btn');
                return tabs.length === 3;
            });

            // Test enhanced evidence profile display
            await this.test(`${supplement.name} evidence profile displays`, () => {
                const profile = document.querySelector('.bg-gradient-to-r.from-purple-50.to-pink-50');
                return profile !== null;
            });

            // Close modal for next test
            if (window.app && window.app.closeModal) {
                window.app.closeModal();
            }
        }
    }

    /**
     * Test performance benchmarks
     */
    async testPerformanceBenchmarks() {
        console.log('⚡ Testing performance benchmarks...');
        
        for (const supplement of this.supplementsToTest) {
            // Test citation loading performance
            await this.test(`${supplement.name} loads within 500ms`, async () => {
                const startTime = performance.now();
                
                try {
                    if (window.app && window.app.citationLoader) {
                        await window.app.citationLoader.loadEnhancedCitations(supplement.id);
                    }
                    
                    const loadTime = performance.now() - startTime;
                    console.log(`${supplement.name} loaded in ${loadTime.toFixed(2)}ms`);
                    return loadTime < 500;
                } catch (error) {
                    console.warn(`Performance test failed for ${supplement.name}:`, error);
                    return false;
                }
            });
        }

        // Test overall application performance
        await this.test('Application renders within 2 seconds', () => {
            const totalTime = performance.now() - this.startTime;
            console.log(`Total application time: ${totalTime.toFixed(2)}ms`);
            return totalTime < 2000;
        });
    }

    /**
     * Monitor console errors during testing
     */
    async testConsoleErrorMonitoring() {
        console.log('🚨 Monitoring console errors...');
        
        const originalError = console.error;
        const errors = [];
        
        // Temporarily capture console errors
        console.error = function(...args) {
            errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        // Trigger enhanced citation loading for all supplements
        for (const supplement of this.supplementsToTest) {
            try {
                if (window.app && window.app.citationLoader) {
                    await window.app.citationLoader.loadEnhancedCitations(supplement.id);
                }
            } catch (error) {
                errors.push(`Citation loading error for ${supplement.name}: ${error.message}`);
            }
        }

        // Restore console.error
        console.error = originalError;

        await this.test('No console errors during enhanced citation loading', () => {
            if (errors.length > 0) {
                console.warn('Console errors detected:', errors);
            }
            return errors.length === 0;
        });
    }

    /**
     * Get expected tier class based on tier number
     */
    getExpectedTierClass(tier) {
        switch (tier) {
            case 1: return 'tier-badge';
            case 2: return 'tier-2';
            case 3: return 'tier-3';
            case 4: return 'tier-4';
            default: return 'tier-4';
        }
    }

    /**
     * Get citation requirements by tier
     */
    getTierRequirements(tier) {
        const requirements = {
            1: { total: 20, mechanisms: 6, benefits: 8, safety: 3, dosage: 2 },
            2: { total: 15, mechanisms: 4, benefits: 6, safety: 3, dosage: 2 },
            3: { total: 10, mechanisms: 3, benefits: 4, safety: 2, dosage: 1 },
            4: { total: 5,  mechanisms: 2, benefits: 2, safety: 1, dosage: 1 }
        };
        
        return requirements[tier] || requirements[4];
    }

    /**
     * Run individual test with error handling
     */
    async test(description, testFunction) {
        try {
            const result = await testFunction();
            if (result) {
                console.log(`✅ ${description}`);
                this.testResults.passed++;
            } else {
                console.log(`❌ ${description}`);
                this.testResults.failed++;
                this.testResults.errors.push(description);
            }
        } catch (error) {
            console.log(`❌ ${description}: ${error.message}`);
            this.testResults.failed++;
            this.testResults.errors.push(`${description}: ${error.message}`);
        }
    }

    /**
     * Log error message
     */
    logError(message) {
        console.error(`❌ ${message}`);
        this.testResults.failed++;
        this.testResults.errors.push(message);
    }

    /**
     * Display final test results
     */
    displayResults() {
        const total = this.testResults.passed + this.testResults.failed;
        const passRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0;
        
        console.log('\n=== PHASE 2A VALIDATION RESULTS ===');
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Pass Rate: ${passRate}%`);
        
        if (this.testResults.errors.length > 0) {
            console.log('\nFAILED TESTS:');
            this.testResults.errors.forEach(error => console.log(`- ${error}`));
        }
        
        console.log(`\nTests: ${this.testResults.passed}/${total} passed`);
        console.log(`Pass Rate: ${passRate}%`);
    }
}

// Make available globally for testing
window.Phase2AValidationTests = Phase2AValidationTests;

// Auto-run if in test environment
if (typeof window !== 'undefined' && window.location.search.includes('test=phase2a')) {
    window.addEventListener('load', async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for app initialization
        const validator = new Phase2AValidationTests();
        await validator.runAllTests();
    });
}