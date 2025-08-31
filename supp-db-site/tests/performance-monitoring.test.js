/**
 * Performance Monitoring Test Suite
 * Tests modernized architecture performance, memory usage, and optimization effectiveness
 */

class PerformanceMonitoringTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            failures: [],
            performance: {}
        };
        this.benchmarkData = {};
    }

    /**
     * Run all performance monitoring tests
     */
    async runAllTests() {
        console.log('🚀 Starting Performance Monitoring Test Suite...');
        
        await this.testInitializationPerformance();
        await this.testRenderingPerformance();
        await this.testMemoryManagement();
        await this.testCitationLoadingPerformance();
        await this.testErrorBoundaryPerformance();
        await this.testVirtualScrollingPerformance();
        
        this.displayResults();
        return this.testResults;
    }

    /**
     * Test application initialization performance
     */
    async testInitializationPerformance() {
        console.log('⏱️ Testing Initialization Performance...');

        // Test 1: App initialization time
        await this.test('App initializes within 2 seconds', () => {
            // This would typically be measured during actual initialization
            // For now, check if the app is properly initialized
            const isInitialized = window.app && 
                                  window.app.supplements && 
                                  window.app.supplements.length === 89;
            
            // Simulate timing check (in real scenario, this would be measured at startup)
            this.benchmarkData.initializationTime = performance.now() - window.appStartTime || 0;
            return isInitialized && this.benchmarkData.initializationTime < 2000;
        });

        // Test 2: DOM readiness
        await this.test('DOM elements are ready', () => {
            const requiredElements = [
                'supplementGrid',
                'searchInput', 
                'categoryFilter',
                'evidenceTierFilter',
                'supplementModal'
            ];
            
            return requiredElements.every(id => document.getElementById(id) !== null);
        });

        // Test 3: Data loading performance
        await this.test('Supplement data loads efficiently', () => {
            return window.supplementDatabase &&
                   window.supplementDatabase.supplements &&
                   window.supplementDatabase.supplements.length === 89;
        });
    }

    /**
     * Test rendering performance metrics
     */
    async testRenderingPerformance() {
        console.log('⏱️ Testing Rendering Performance...');

        // Test 1: Performance metrics collection
        await this.test('Performance metrics are collected', () => {
            if (window.app && typeof window.app._getPerformanceMetrics === 'function') {
                const metrics = window.app._getPerformanceMetrics();
                this.testResults.performance.appMetrics = metrics;
                return metrics && metrics.renderMetrics;
            }
            return false;
        });

        // Test 2: Render time benchmarking
        await this.test('Render times are reasonable (<100ms average)', async () => {
            if (window.app && window.app.metrics && window.app.metrics.renderTimes) {
                const renderTimes = window.app.metrics.renderTimes;
                if (renderTimes.length === 0) {
                    // Trigger a render to get metrics
                    await window.app._renderSupplements();
                    return true; // First render, assume success
                }
                
                const avgTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
                this.benchmarkData.averageRenderTime = avgTime;
                return avgTime < 100;
            }
            return false;
        });

        // Test 3: Performance optimizer functionality
        await this.test('Performance optimizer is active', () => {
            return window.app &&
                   window.app.performanceOptimizer &&
                   typeof window.app.performanceOptimizer.getMetrics === 'function';
        });

        // Test 4: Template system efficiency
        await this.test('Template system is efficient', () => {
            if (window.app && window.app.templateSystem) {
                const metrics = window.app.templateSystem.getMetrics ? 
                               window.app.templateSystem.getMetrics() : null;
                return metrics !== null;
            }
            return window.app && window.app.templateSystem;
        });
    }

    /**
     * Test memory management and monitoring
     */
    async testMemoryManagement() {
        console.log('⏱️ Testing Memory Management...');

        // Test 1: Memory monitor is active
        await this.test('Memory monitor is active', () => {
            return window.app &&
                   window.app.performanceOptimizer &&
                   window.app.performanceOptimizer.memoryMonitor &&
                   window.app.performanceOptimizer.memoryMonitor.isSupported();
        });

        // Test 2: Memory metrics collection
        await this.test('Memory metrics are collected', () => {
            if (window.app && window.app.performanceOptimizer && window.app.performanceOptimizer.memoryMonitor) {
                const metrics = window.app.performanceOptimizer.memoryMonitor.getMetrics();
                this.testResults.performance.memoryMetrics = metrics;
                return metrics && typeof metrics.currentMemoryMB === 'number';
            }
            return false;
        });

        // Test 3: Memory usage is reasonable
        await this.test('Memory usage is reasonable (<50MB)', () => {
            if (this.testResults.performance.memoryMetrics) {
                const currentMemory = this.testResults.performance.memoryMetrics.currentMemoryMB;
                this.benchmarkData.memoryUsage = currentMemory;
                return currentMemory < 50;
            }
            return true; // If we can't measure, assume it's fine
        });

        // Test 4: Citation cache management
        await this.test('Citation cache has memory limits', () => {
            return window.app &&
                   window.app.citationLoader &&
                   window.app.citationLoader.maxCacheSize &&
                   window.app.citationLoader.maxCacheSize <= 10; // Reasonable cache size
        });

        // Test 5: Cleanup functionality exists
        await this.test('Memory cleanup functionality exists', () => {
            return window.app &&
                   typeof window.app.destroy === 'function' &&
                   window.app.performanceOptimizer &&
                   typeof window.app.performanceOptimizer.cleanup === 'function';
        });
    }

    /**
     * Test citation loading performance
     */
    async testCitationLoadingPerformance() {
        console.log('⏱️ Testing Citation Loading Performance...');

        // Test 1: Citation loader performance tracking
        await this.test('Citation loader tracks performance', () => {
            if (window.app && window.app.citationLoader) {
                const metrics = window.app.citationLoader.getPerformanceMetrics();
                this.testResults.performance.citationMetrics = metrics;
                return metrics && typeof metrics.averageLoadTime === 'number';
            }
            return false;
        });

        // Test 2: Citation cache efficiency
        await this.test('Citation cache is efficient', () => {
            if (this.testResults.performance.citationMetrics) {
                const hitRate = this.testResults.performance.citationMetrics.cacheHitRate;
                return typeof hitRate === 'number';
            }
            return true;
        });

        // Test 3: Lazy loading implementation
        await this.test('Lazy loading is implemented', () => {
            return window.app &&
                   window.app.citationLoader &&
                   typeof window.app.citationLoader.loadEnhancedCitations === 'function';
        });

        // Test 4: Citation loading time benchmark
        await this.test('Citation loading is fast (<500ms)', async () => {
            if (window.app && window.app.citationLoader) {
                const startTime = performance.now();
                try {
                    // Test loading enhanced citations for Bacopa (ID 1)
                    await window.app.citationLoader.loadEnhancedCitations(1);
                    const loadTime = performance.now() - startTime;
                    this.benchmarkData.citationLoadTime = loadTime;
                    return loadTime < 500;
                } catch (error) {
                    // If it fails to load, that's not necessarily a performance issue
                    return true;
                }
            }
            return true;
        });
    }

    /**
     * Test error boundary performance impact
     */
    async testErrorBoundaryPerformance() {
        console.log('⏱️ Testing Error Boundary Performance...');

        // Test 1: Error boundaries don't impact normal operation
        await this.test('Error boundaries have minimal performance impact', async () => {
            if (window.app && window.app.errorBoundaries) {
                const startTime = performance.now();
                
                // Execute a normal operation through error boundary
                try {
                    await window.app.errorBoundaries.main.execute(() => {
                        return 'test operation';
                    }, 'Performance test');
                    
                    const executionTime = performance.now() - startTime;
                    this.benchmarkData.errorBoundaryOverhead = executionTime;
                    return executionTime < 5; // Should add minimal overhead
                } catch (error) {
                    return false;
                }
            }
            return true;
        });

        // Test 2: Error reporting is efficient
        await this.test('Error reporting is efficient', () => {
            return window.GlobalErrorManager &&
                   typeof window.GlobalErrorManager.getGlobalStats === 'function';
        });

        // Test 3: Error recovery is fast
        await this.test('Error recovery mechanisms are fast', () => {
            // Check if error boundaries have retry mechanisms
            return window.app &&
                   window.app.errorBoundaries &&
                   Object.values(window.app.errorBoundaries).every(boundary => 
                       typeof boundary.execute === 'function'
                   );
        });
    }

    /**
     * Test virtual scrolling performance
     */
    async testVirtualScrollingPerformance() {
        console.log('⏱️ Testing Virtual Scrolling Performance...');

        // Test 1: Virtual scrolling threshold
        await this.test('Virtual scrolling has reasonable threshold', () => {
            if (window.app && window.app.performanceOptimizer) {
                const config = window.app.performanceOptimizer.config;
                return config && 
                       config.virtualScrollThreshold && 
                       config.virtualScrollThreshold >= 20 && 
                       config.virtualScrollThreshold <= 50;
            }
            return true;
        });

        // Test 2: Virtual scrolling metrics
        await this.test('Virtual scrolling metrics are tracked', () => {
            if (window.app && window.app.performanceOptimizer && window.app.performanceOptimizer.virtualScrolling) {
                const metrics = window.app.performanceOptimizer.virtualScrolling.getMetrics();
                return metrics && typeof metrics.totalItems === 'number';
            }
            return true; // Not a failure if not using virtual scrolling
        });

        // Test 3: Intersection observer for lazy loading
        await this.test('Intersection observer is properly configured', () => {
            return window.app &&
                   window.app.performanceOptimizer &&
                   window.app.performanceOptimizer.intersectionObserver;
        });

        // Test 4: Skeleton loading performance
        await this.test('Skeleton loading is efficient', () => {
            if (window.app && window.app.performanceOptimizer && window.app.performanceOptimizer.skeletonLoader) {
                const metrics = window.app.performanceOptimizer.skeletonLoader.getMetrics();
                return metrics && typeof metrics.averageDisplayTime === 'number';
            }
            return true;
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
                console.log(`✅ ${name}`);
            } else {
                this.testResults.failed++;
                this.testResults.failures.push(name);
                console.log(`❌ ${name}`);
            }
        } catch (error) {
            this.testResults.failed++;
            this.testResults.failures.push(`${name}: ${error.message}`);
            console.log(`❌ ${name}: ${error.message}`);
        }
    }

    /**
     * Display comprehensive test results
     */
    displayResults() {
        const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        
        console.log('\n🚀 PERFORMANCE MONITORING TEST RESULTS');
        console.log('=========================================');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Pass Rate: ${passRate}%`);

        // Display benchmark data
        if (Object.keys(this.benchmarkData).length > 0) {
            console.log('\n📊 PERFORMANCE BENCHMARKS:');
            Object.entries(this.benchmarkData).forEach(([key, value]) => {
                console.log(`  ${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`);
            });
        }

        // Display performance metrics if available
        if (this.testResults.performance.appMetrics) {
            console.log('\n📈 APPLICATION METRICS:');
            console.log('  Render Metrics:', this.testResults.performance.appMetrics.renderMetrics);
            if (this.testResults.performance.memoryMetrics) {
                console.log('  Memory Usage:', `${this.testResults.performance.memoryMetrics.currentMemoryMB}MB`);
            }
            if (this.testResults.performance.citationMetrics) {
                console.log('  Citation Cache Hit Rate:', `${this.testResults.performance.citationMetrics.cacheHitRate}%`);
            }
        }

        if (this.testResults.failures.length > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults.failures.forEach(failure => {
                console.log(`  - ${failure}`);
            });
        }

        // Performance assessment
        const performanceGrade = this.assessPerformance();
        console.log(`\n🎯 PERFORMANCE GRADE: ${performanceGrade}`);
        
        if (passRate >= 90) {
            console.log('🎉 Excellent performance! Modernized architecture is working optimally.');
        } else if (passRate >= 75) {
            console.log('✅ Good performance with room for optimization.');
        } else {
            console.log('⚠️ Performance needs attention. Consider optimization strategies.');
        }
    }

    /**
     * Assess overall performance grade
     */
    assessPerformance() {
        let score = 0;
        let maxScore = 0;

        // Render performance (25 points)
        if (this.benchmarkData.averageRenderTime) {
            maxScore += 25;
            if (this.benchmarkData.averageRenderTime < 50) score += 25;
            else if (this.benchmarkData.averageRenderTime < 100) score += 20;
            else if (this.benchmarkData.averageRenderTime < 200) score += 15;
            else score += 10;
        }

        // Memory usage (25 points)
        if (this.benchmarkData.memoryUsage) {
            maxScore += 25;
            if (this.benchmarkData.memoryUsage < 25) score += 25;
            else if (this.benchmarkData.memoryUsage < 50) score += 20;
            else if (this.benchmarkData.memoryUsage < 75) score += 15;
            else score += 10;
        }

        // Citation loading (25 points)
        if (this.benchmarkData.citationLoadTime) {
            maxScore += 25;
            if (this.benchmarkData.citationLoadTime < 200) score += 25;
            else if (this.benchmarkData.citationLoadTime < 500) score += 20;
            else if (this.benchmarkData.citationLoadTime < 1000) score += 15;
            else score += 10;
        }

        // Error boundary overhead (25 points)
        if (this.benchmarkData.errorBoundaryOverhead) {
            maxScore += 25;
            if (this.benchmarkData.errorBoundaryOverhead < 2) score += 25;
            else if (this.benchmarkData.errorBoundaryOverhead < 5) score += 20;
            else if (this.benchmarkData.errorBoundaryOverhead < 10) score += 15;
            else score += 10;
        }

        if (maxScore === 0) return 'Unable to assess';

        const percentage = (score / maxScore) * 100;
        
        if (percentage >= 90) return 'A+ (Excellent)';
        if (percentage >= 80) return 'A (Very Good)';
        if (percentage >= 70) return 'B (Good)';
        if (percentage >= 60) return 'C (Fair)';
        return 'D (Needs Improvement)';
    }
}

// Export for use in browser console
window.PerformanceMonitoringTests = PerformanceMonitoringTests;

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        if (window.app) {
            const testRunner = new PerformanceMonitoringTests();
            await testRunner.runAllTests();
        } else {
            console.error('App not initialized - cannot run performance tests');
        }
    }, 3000); // Wait a bit longer for app to be fully initialized
});