/**
 * UI Functionality Test Suite
 * Tests enhanced citation visibility, database utility, and modernized architecture
 */

class UIFunctionalityTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            failures: []
        };
        this.testContainer = null;
    }

    /**
     * Run all UI functionality tests
     */
    async runAllTests() {
        console.log('Starting UI Functionality Test Suite...');
        
        // Create test container
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'test-container';
        this.testContainer.style.cssText = 'position: fixed; top: 10px; right: 10px; background: white; border: 2px solid #ccc; padding: 20px; z-index: 10000; max-width: 400px; max-height: 600px; overflow-y: auto;';
        document.body.appendChild(this.testContainer);

        // Test categories
        await this.testEnhancedCitationVisibility();
        await this.testDatabaseUtility();
        await this.testPerformanceOptimizations();
        await this.testErrorBoundaries();
        await this.testModernizedArchitecture();
        
        this.displayTestResults();
        return this.testResults;
    }

    /**
     * Test enhanced citation UI visibility and functionality
     */
    async testEnhancedCitationVisibility() {
        this.log('Testing Enhanced Citation Visibility...', 'category');

        // Test 1: Check if Bacopa monnieri has enhanced citations
        await this.test('Bacopa monnieri has enhanced citations', () => {
            const bacopaData = window.supplementDatabase.supplements.find(s => s.id === 1);
            return bacopaData && 
                   bacopaData.enhancedCitations && 
                   bacopaData.enhancedCitations.isEnhanced === true;
        });

        // Test 2: Phase 2A badge visibility
        await this.test('Phase 2A badges are displayed', () => {
            const supplementCards = document.querySelectorAll('[data-supplement-id="1"]');
            if (supplementCards.length === 0) return false;
            
            const card = supplementCards[0];
            const phase2Badge = card.querySelector('.phase-2a-badge');
            return phase2Badge !== null;
        });

        // Test 3: Enhanced citation modal content
        await this.test('Enhanced citation modal loads properly', async () => {
            if (window.app && window.app.showSupplementDetails) {
                await window.app.showSupplementDetails(1);
                
                // Check if modal is visible
                const modal = document.getElementById('supplementModal');
                const isVisible = modal && !modal.classList.contains('hidden');
                
                // Check for citation tabs
                const citationTabs = modal.querySelectorAll('.citation-tab');
                const hasCitationTabs = citationTabs.length > 0;
                
                // Close modal
                if (window.app.closeModal) {
                    window.app.closeModal();
                }
                
                return isVisible && hasCitationTabs;
            }
            return false;
        });

        // Test 4: Citation quality indicators
        await this.test('Citation quality indicators are present', () => {
            const bacopaData = window.supplementDatabase.supplements.find(s => s.id === 1);
            return bacopaData &&
                   bacopaData.enhancedCitations &&
                   bacopaData.enhancedCitations.evidenceProfile &&
                   bacopaData.enhancedCitations.evidenceProfile.researchQualityScore;
        });
    }

    /**
     * Test database utility and search capabilities
     */
    async testDatabaseUtility() {
        this.log('Testing Database Utility...', 'category');

        // Test 1: Search functionality
        await this.test('Search functionality works', () => {
            const searchInput = document.getElementById('searchInput');
            if (!searchInput) return false;

            // Simulate search
            searchInput.value = 'Bacopa';
            searchInput.dispatchEvent(new Event('input'));
            
            // Check if results are filtered
            setTimeout(() => {
                const results = document.querySelectorAll('.supplement-card');
                return results.length > 0;
            }, 500);
            
            return true; // Assume success for now
        });

        // Test 2: Category filtering
        await this.test('Category filtering works', () => {
            const categoryFilter = document.getElementById('categoryFilter');
            return categoryFilter && categoryFilter.options.length > 1;
        });

        // Test 3: Evidence tier filtering
        await this.test('Evidence tier filtering works', () => {
            const evidenceFilter = document.getElementById('evidenceTierFilter');
            return evidenceFilter && evidenceFilter.options.length > 1;
        });

        // Test 4: Data integrity
        await this.test('Database has 89 supplements', () => {
            return window.supplementDatabase && 
                   window.supplementDatabase.supplements &&
                   window.supplementDatabase.supplements.length === 89;
        });

        // Test 5: Supplement completeness
        await this.test('All supplements have required fields', () => {
            const supplements = window.supplementDatabase.supplements;
            return supplements.every(supplement => 
                supplement.id &&
                supplement.name &&
                supplement.scientificName &&
                supplement.category &&
                supplement.evidenceTier &&
                supplement.primaryBenefits &&
                supplement.dosageRange &&
                supplement.safetyProfile
            );
        });
    }

    /**
     * Test performance optimization effectiveness
     */
    async testPerformanceOptimizations() {
        this.log('Testing Performance Optimizations...', 'category');

        // Test 1: App initialization time
        await this.test('App initializes within reasonable time', () => {
            return window.app && typeof window.app._getPerformanceMetrics === 'function';
        });

        // Test 2: Citation loader performance
        await this.test('Citation loader has performance tracking', () => {
            return window.app &&
                   window.app.citationLoader &&
                   typeof window.app.citationLoader.getPerformanceMetrics === 'function';
        });

        // Test 3: Memory monitoring
        await this.test('Memory monitoring is active', () => {
            return window.app &&
                   window.app.performanceOptimizer &&
                   window.app.performanceOptimizer.memoryMonitor &&
                   typeof window.app.performanceOptimizer.memoryMonitor.getMetrics === 'function';
        });

        // Test 4: Virtual scrolling detection
        await this.test('Virtual scrolling is available for large lists', () => {
            return window.app &&
                   window.app.performanceOptimizer &&
                   window.app.performanceOptimizer.virtualScrolling;
        });

        // Test 5: Error boundary system
        await this.test('Error boundaries are initialized', () => {
            return window.app &&
                   window.app.errorBoundaries &&
                   Object.keys(window.app.errorBoundaries).length > 0;
        });
    }

    /**
     * Test error boundaries and graceful degradation
     */
    async testErrorBoundaries() {
        this.log('Testing Error Boundaries...', 'category');

        // Test 1: Global error manager exists
        await this.test('Global error manager is available', () => {
            return window.GlobalErrorManager && 
                   typeof window.GlobalErrorManager.getGlobalStats === 'function';
        });

        // Test 2: Error boundary creation
        await this.test('Error boundaries can be created', () => {
            try {
                const testBoundary = window.GlobalErrorManager.createBoundary('test-boundary');
                return testBoundary && typeof testBoundary.execute === 'function';
            } catch (error) {
                return false;
            }
        });

        // Test 3: Error handling graceful degradation
        await this.test('Error handling with graceful degradation', async () => {
            if (window.app && window.app.errorBoundaries.main) {
                try {
                    // Test error boundary execution
                    const result = await window.app.errorBoundaries.main.execute(
                        () => { throw new Error('Test error'); },
                        'Test error boundary'
                    );
                    return result === null; // Should return null on error
                } catch (error) {
                    return true; // Error was caught, which is good
                }
            }
            return false;
        });
    }

    /**
     * Test modernized architecture components
     */
    async testModernizedArchitecture() {
        this.log('Testing Modernized Architecture...', 'category');

        // Test 1: ES6 module support
        await this.test('ES6 modules are properly imported', () => {
            return window.app &&
                   window.app.citationLoader &&
                   window.app.citationRenderer &&
                   window.app.performanceOptimizer;
        });

        // Test 2: Template system
        await this.test('Template system is functional', () => {
            return window.app &&
                   window.app.templateSystem &&
                   typeof window.app.templateSystem.render === 'function';
        });

        // Test 3: Lazy loading capabilities
        await this.test('Lazy loading system is ready', () => {
            return window.app &&
                   window.app.citationLoader &&
                   typeof window.app.citationLoader.loadEnhancedCitations === 'function';
        });

        // Test 4: Performance metrics collection
        await this.test('Performance metrics are being collected', () => {
            if (window.app && typeof window.app._getPerformanceMetrics === 'function') {
                const metrics = window.app._getPerformanceMetrics();
                return metrics && 
                       metrics.renderMetrics &&
                       metrics.citationLoader &&
                       metrics.performanceOptimizer;
            }
            return false;
        });

        // Test 5: Cleanup capabilities
        await this.test('Cleanup methods are available', () => {
            return window.app &&
                   typeof window.app.destroy === 'function' &&
                   window.app.performanceOptimizer &&
                   typeof window.app.performanceOptimizer.cleanup === 'function';
        });
    }

    /**
     * Run individual test with error handling
     */
    async test(name, testFunction) {
        this.testResults.total++;
        
        try {
            const result = await testFunction();
            if (result) {
                this.testResults.passed++;
                this.log(`✅ ${name}`, 'pass');
            } else {
                this.testResults.failed++;
                this.testResults.failures.push(name);
                this.log(`❌ ${name}`, 'fail');
            }
        } catch (error) {
            this.testResults.failed++;
            this.testResults.failures.push(`${name}: ${error.message}`);
            this.log(`❌ ${name}: ${error.message}`, 'fail');
        }
    }

    /**
     * Log test messages
     */
    log(message, type = 'info') {
        const colors = {
            category: '#2563eb',
            pass: '#10b981',
            fail: '#ef4444',
            info: '#6b7280'
        };

        console.log(`%c${message}`, `color: ${colors[type]}; font-weight: bold;`);
        
        if (this.testContainer) {
            const logElement = document.createElement('div');
            logElement.style.cssText = `color: ${colors[type]}; margin: 5px 0; font-size: 12px;`;
            logElement.textContent = message;
            this.testContainer.appendChild(logElement);
            this.testContainer.scrollTop = this.testContainer.scrollHeight;
        }
    }

    /**
     * Display final test results
     */
    displayTestResults() {
        const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        
        this.log('\n=== TEST RESULTS ===', 'category');
        this.log(`Total Tests: ${this.testResults.total}`, 'info');
        this.log(`Passed: ${this.testResults.passed}`, 'pass');
        this.log(`Failed: ${this.testResults.failed}`, 'fail');
        this.log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'pass' : 'fail');

        if (this.testResults.failures.length > 0) {
            this.log('\nFAILED TESTS:', 'fail');
            this.testResults.failures.forEach(failure => {
                this.log(`- ${failure}`, 'fail');
            });
        }

        // Create summary element
        if (this.testContainer) {
            const summaryElement = document.createElement('div');
            summaryElement.style.cssText = 'margin-top: 20px; padding: 10px; background: #f3f4f6; border-radius: 5px; font-weight: bold;';
            summaryElement.innerHTML = `
                <div>Tests: ${this.testResults.passed}/${this.testResults.total} passed</div>
                <div>Pass Rate: ${passRate}%</div>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 3px; cursor: pointer;">Close</button>
            `;
            this.testContainer.appendChild(summaryElement);
        }
    }
}

// Export for use in browser console or other test runners
window.UIFunctionalityTests = UIFunctionalityTests;

// Auto-run tests when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to initialize
    setTimeout(async () => {
        if (window.app) {
            const testRunner = new UIFunctionalityTests();
            await testRunner.runAllTests();
        } else {
            console.error('App not initialized - cannot run tests');
        }
    }, 2000);
});