/**
 * Database Utility Test Suite
 * Tests data integrity, search functionality, and filtering capabilities
 */

class DatabaseUtilityTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            failures: []
        };
    }

    /**
     * Run all database utility tests
     */
    async runAllTests() {
        console.log('Starting Database Utility Test Suite...');
        
        await this.testDataIntegrity();
        await this.testSearchFunctionality();
        await this.testFilteringCapabilities();
        await this.testEnhancedCitationData();
        await this.testDataConsistency();
        
        this.displayResults();
        return this.testResults;
    }

    /**
     * Test data integrity and completeness
     */
    async testDataIntegrity() {
        console.log('🔍 Testing Data Integrity...');

        // Test 1: Database exists and has correct structure
        await this.test('Database structure is valid', () => {
            return window.supplementDatabase &&
                   window.supplementDatabase.supplements &&
                   Array.isArray(window.supplementDatabase.supplements) &&
                   window.supplementDatabase.categories &&
                   Array.isArray(window.supplementDatabase.categories) &&
                   window.supplementDatabase.healthDomains &&
                   Array.isArray(window.supplementDatabase.healthDomains);
        });

        // Test 2: Correct number of supplements
        await this.test('Database contains 89 supplements', () => {
            return window.supplementDatabase.supplements.length === 89;
        });

        // Test 3: All supplements have required fields
        await this.test('All supplements have required fields', () => {
            const requiredFields = [
                'id', 'name', 'scientificName', 'category', 'evidenceTier', 
                'primaryBenefits', 'dosageRange', 'safetyProfile', 'keyCitations'
            ];
            
            return window.supplementDatabase.supplements.every(supplement => 
                requiredFields.every(field => supplement.hasOwnProperty(field))
            );
        });

        // Test 4: Evidence tiers are valid
        await this.test('Evidence tiers are valid (1-4)', () => {
            return window.supplementDatabase.supplements.every(supplement => 
                supplement.evidenceTier >= 1 && supplement.evidenceTier <= 4
            );
        });

        // Test 5: Safety profiles are complete
        await this.test('Safety profiles are complete', () => {
            return window.supplementDatabase.supplements.every(supplement => 
                supplement.safetyProfile &&
                supplement.safetyProfile.rating &&
                Array.isArray(supplement.safetyProfile.commonSideEffects) &&
                Array.isArray(supplement.safetyProfile.contraindications) &&
                Array.isArray(supplement.safetyProfile.drugInteractions)
            );
        });

        // Test 6: Primary benefits structure
        await this.test('Primary benefits have cognitive and nonCognitive arrays', () => {
            return window.supplementDatabase.supplements.every(supplement => 
                supplement.primaryBenefits &&
                Array.isArray(supplement.primaryBenefits.cognitive) &&
                Array.isArray(supplement.primaryBenefits.nonCognitive)
            );
        });

        // Test 7: Citations have required fields
        await this.test('Citations have required fields', () => {
            return window.supplementDatabase.supplements.every(supplement => 
                Array.isArray(supplement.keyCitations) &&
                supplement.keyCitations.every(citation => 
                    citation.title && citation.authors && citation.year
                )
            );
        });
    }

    /**
     * Test search functionality
     */
    async testSearchFunctionality() {
        console.log('🔍 Testing Search Functionality...');

        // Test 1: Search by supplement name
        await this.test('Search by supplement name works', () => {
            const searchTerm = 'Bacopa';
            const results = this.simulateSearch(searchTerm);
            return results.some(supplement => 
                supplement.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        // Test 2: Search by scientific name
        await this.test('Search by scientific name works', () => {
            const searchTerm = 'monnieri';
            const results = this.simulateSearch(searchTerm);
            return results.some(supplement => 
                supplement.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        // Test 3: Search by category
        await this.test('Search by category works', () => {
            const searchTerm = 'Nootropic';
            const results = this.simulateSearch(searchTerm);
            return results.some(supplement => 
                supplement.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        // Test 4: Search by benefits
        await this.test('Search by benefits works', () => {
            const searchTerm = 'memory';
            const results = this.simulateSearch(searchTerm);
            return results.some(supplement => 
                supplement.primaryBenefits.cognitive.some(benefit => 
                    benefit.toLowerCase().includes(searchTerm.toLowerCase())
                ) ||
                supplement.primaryBenefits.nonCognitive.some(benefit => 
                    benefit.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        });

        // Test 5: Search by mechanisms of action
        await this.test('Search by mechanisms works', () => {
            const searchTerm = 'neurotransmitter';
            const results = this.simulateSearch(searchTerm);
            return results.some(supplement => 
                supplement.mechanismsOfAction &&
                supplement.mechanismsOfAction.some(mechanism => 
                    mechanism.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        });

        // Test 6: Case insensitive search
        await this.test('Search is case insensitive', () => {
            const lowerResults = this.simulateSearch('bacopa');
            const upperResults = this.simulateSearch('BACOPA');
            return lowerResults.length === upperResults.length && lowerResults.length > 0;
        });

        // Test 7: Empty search returns all results
        await this.test('Empty search returns all supplements', () => {
            const results = this.simulateSearch('');
            return results.length === window.supplementDatabase.supplements.length;
        });
    }

    /**
     * Test filtering capabilities
     */
    async testFilteringCapabilities() {
        console.log('🔍 Testing Filtering Capabilities...');

        // Test 1: Evidence tier filtering
        await this.test('Evidence tier filtering works', () => {
            const tier1Supplements = this.simulateFilter({ evidenceTier: '1' });
            return tier1Supplements.every(supplement => supplement.evidenceTier === 1) &&
                   tier1Supplements.length > 0;
        });

        // Test 2: Category filtering
        await this.test('Category filtering works', () => {
            const categories = [...new Set(window.supplementDatabase.supplements.map(s => s.category))];
            if (categories.length === 0) return false;
            
            const testCategory = categories[0];
            const filtered = this.simulateFilter({ category: testCategory });
            return filtered.every(supplement => supplement.category === testCategory) &&
                   filtered.length > 0;
        });

        // Test 3: Safety rating filtering
        await this.test('Safety rating filtering works', () => {
            const excellentSafety = this.simulateFilter({ safetyRating: 'Excellent' });
            return excellentSafety.every(supplement => 
                supplement.safetyProfile.rating === 'Excellent'
            );
        });

        // Test 4: Combined filtering
        await this.test('Combined filtering works', () => {
            const combined = this.simulateFilter({ 
                evidenceTier: '2', 
                category: 'Nootropic Herb' 
            });
            return combined.every(supplement => 
                supplement.evidenceTier === 2 && supplement.category === 'Nootropic Herb'
            );
        });

        // Test 5: Health domain filtering
        await this.test('Health domain filtering works', () => {
            // Simulate health domain filtering based on benefits
            const memorySupplements = window.supplementDatabase.supplements.filter(supplement =>
                supplement.primaryBenefits.cognitive.some(benefit => 
                    benefit.toLowerCase().includes('memory')
                ) ||
                supplement.primaryBenefits.nonCognitive.some(benefit => 
                    benefit.toLowerCase().includes('memory')
                )
            );
            return memorySupplements.length > 0;
        });
    }

    /**
     * Test enhanced citation data integrity
     */
    async testEnhancedCitationData() {
        console.log('🔍 Testing Enhanced Citation Data...');

        // Test 1: Bacopa monnieri has enhanced citations
        await this.test('Bacopa monnieri has enhanced citations', () => {
            const bacopa = window.supplementDatabase.supplements.find(s => s.id === 1);
            return bacopa && 
                   bacopa.enhancedCitations && 
                   bacopa.enhancedCitations.isEnhanced === true;
        });

        // Test 2: Enhanced citation structure
        await this.test('Enhanced citations have proper structure', () => {
            const bacopa = window.supplementDatabase.supplements.find(s => s.id === 1);
            if (!bacopa || !bacopa.enhancedCitations) return false;
            
            const enhanced = bacopa.enhancedCitations;
            return enhanced.evidenceProfile &&
                   enhanced.evidenceProfile.overallQuality &&
                   enhanced.evidenceProfile.totalCitations &&
                   enhanced.evidenceProfile.researchQualityScore;
        });

        // Test 3: Citation quality scoring
        await this.test('Citation quality scores are valid', () => {
            const bacopa = window.supplementDatabase.supplements.find(s => s.id === 1);
            if (!bacopa || !bacopa.enhancedCitations) return false;
            
            const score = bacopa.enhancedCitations.evidenceProfile.researchQualityScore;
            return typeof score === 'number' && score >= 0 && score <= 100;
        });

        // Test 4: Enhanced vs basic citation distinction
        await this.test('Enhanced supplements are properly marked', () => {
            const enhancedCount = window.supplementDatabase.supplements.filter(s => 
                s.enhancedCitations && s.enhancedCitations.isEnhanced
            ).length;
            
            const basicCount = window.supplementDatabase.supplements.filter(s => 
                !s.enhancedCitations || !s.enhancedCitations.isEnhanced
            ).length;
            
            return enhancedCount > 0 && basicCount > 0 && (enhancedCount + basicCount === 89);
        });
    }

    /**
     * Test data consistency across the database
     */
    async testDataConsistency() {
        console.log('🔍 Testing Data Consistency...');

        // Test 1: Unique supplement IDs
        await this.test('Supplement IDs are unique', () => {
            const ids = window.supplementDatabase.supplements.map(s => s.id);
            const uniqueIds = [...new Set(ids)];
            return ids.length === uniqueIds.length;
        });

        // Test 2: Sequential IDs
        await this.test('Supplement IDs are sequential (1-89)', () => {
            const ids = window.supplementDatabase.supplements.map(s => s.id).sort((a, b) => a - b);
            return ids[0] === 1 && ids[ids.length - 1] === 89 && ids.length === 89;
        });

        // Test 3: Categories exist in category list
        await this.test('All supplement categories exist in category list', () => {
            const supplementCategories = [...new Set(window.supplementDatabase.supplements.map(s => s.category))];
            const definedCategories = window.supplementDatabase.categories.map(c => c.name);
            
            return supplementCategories.every(category => 
                definedCategories.includes(category)
            );
        });

        // Test 4: Evidence tier rationales exist
        await this.test('All supplements have evidence tier rationales', () => {
            return window.supplementDatabase.supplements.every(supplement => 
                supplement.evidenceTierRationale && 
                supplement.evidenceTierRationale.trim().length > 0
            );
        });

        // Test 5: Dosage ranges are properly formatted
        await this.test('Dosage ranges are properly formatted', () => {
            return window.supplementDatabase.supplements.every(supplement => 
                supplement.dosageRange && 
                supplement.dosageRange.trim().length > 0 &&
                !supplement.dosageRange.includes('undefined')
            );
        });

        // Test 6: Metadata consistency
        await this.test('Database metadata is consistent', () => {
            const metadata = window.supplementDatabase.metadata;
            return metadata &&
                   metadata.totalSupplements === 89 &&
                   metadata.version &&
                   metadata.lastUpdated;
        });
    }

    /**
     * Simulate search functionality
     */
    simulateSearch(searchTerm) {
        if (!searchTerm) return window.supplementDatabase.supplements;
        
        const term = searchTerm.toLowerCase();
        return window.supplementDatabase.supplements.filter(supplement => {
            return supplement.name.toLowerCase().includes(term) ||
                   supplement.scientificName.toLowerCase().includes(term) ||
                   supplement.category.toLowerCase().includes(term) ||
                   supplement.primaryBenefits.cognitive.some(benefit => 
                       benefit.toLowerCase().includes(term)
                   ) ||
                   supplement.primaryBenefits.nonCognitive.some(benefit => 
                       benefit.toLowerCase().includes(term)
                   ) ||
                   (supplement.mechanismsOfAction && 
                    supplement.mechanismsOfAction.some(mechanism => 
                        mechanism.toLowerCase().includes(term)
                    ));
        });
    }

    /**
     * Simulate filtering functionality
     */
    simulateFilter(filters) {
        return window.supplementDatabase.supplements.filter(supplement => {
            // Evidence tier filter
            if (filters.evidenceTier && supplement.evidenceTier.toString() !== filters.evidenceTier) {
                return false;
            }
            
            // Category filter
            if (filters.category && supplement.category !== filters.category) {
                return false;
            }
            
            // Safety rating filter
            if (filters.safetyRating && supplement.safetyProfile.rating !== filters.safetyRating) {
                return false;
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
     * Display test results
     */
    displayResults() {
        const passRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        
        console.log('\n📊 DATABASE UTILITY TEST RESULTS');
        console.log('=====================================');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Pass Rate: ${passRate}%`);

        if (this.testResults.failures.length > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults.failures.forEach(failure => {
                console.log(`  - ${failure}`);
            });
        }

        if (passRate >= 95) {
            console.log('\n🎉 Database utility is excellent!');
        } else if (passRate >= 80) {
            console.log('\n✅ Database utility is good.');
        } else {
            console.log('\n⚠️ Database utility needs attention.');
        }
    }
}

// Export for use in browser console
window.DatabaseUtilityTests = DatabaseUtilityTests;

// Auto-run when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        if (window.supplementDatabase) {
            const testRunner = new DatabaseUtilityTests();
            await testRunner.runAllTests();
        } else {
            console.error('Supplement database not loaded - cannot run tests');
        }
    }, 1000);
});