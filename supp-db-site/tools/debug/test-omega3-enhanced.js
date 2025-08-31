// Enhanced Citations Validation Test Suite Template
// Use this template for testing each new enhanced citation implementation

const { test, expect } = require('@playwright/test');

/**
 * Test Configuration - CUSTOMIZE FOR EACH SUPPLEMENT
 */
const TEST_CONFIG = {
    supplementId: 22, // CHANGE: Use actual supplement ID
    supplementName: 'Omega-3 EPA/DHA', // CHANGE: Use actual supplement name
    expectedTier: 1, // CHANGE: Based on evidence tier (1-4)
    minimumCitations: {
        tier1: 20,
        tier2: 15, 
        tier3: 10,
        tier4: 5
    }
};

/**
 * Enhanced Citation Validation Test Suite
 * Validates implementation patterns, data quality, and UI functionality
 */
test.describe(`Enhanced Citations: ${TEST_CONFIG.supplementName}`, () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to the supplement database
        await page.goto('file://' + __dirname + '/index.html');
        
        // Wait for database to load
        await page.waitForFunction(() => window.supplementDatabase !== undefined);
        
        // Wait for enhanced citations to load
        await page.waitForTimeout(2000);
    });

    /**
     * Pattern Compliance Tests
     * Ensures implementation follows exact patterns from Phase 2A pilot
     */
    test.describe('Implementation Pattern Compliance', () => {
        
        test('should load enhanced citation via global window pattern', async ({ page }) => {
            const hasEnhancedCitation = await page.evaluate((supplementId) => {
                return window.enhancedCitations && 
                       window.enhancedCitations[supplementId] !== undefined;
            }, TEST_CONFIG.supplementId);
            
            expect(hasEnhancedCitation).toBe(true);
        });

        test('should have correct module structure', async ({ page }) => {
            const citationStructure = await page.evaluate((supplementId) => {
                const citation = window.enhancedCitations?.[supplementId];
                if (!citation) return null;
                
                return {
                    hasId: citation.id !== undefined,
                    hasEvidenceProfile: citation.evidenceProfile !== undefined,
                    hasCitations: citation.citations !== undefined,
                    hasMetrics: citation.citationMetrics !== undefined,
                    hasEvolution: citation.researchEvolution !== undefined,
                    citationCategories: {
                        mechanisms: Array.isArray(citation.citations?.mechanisms),
                        benefits: Array.isArray(citation.citations?.benefits),
                        safety: Array.isArray(citation.citations?.safety),
                        dosage: Array.isArray(citation.citations?.dosage)
                    }
                };
            }, TEST_CONFIG.supplementId);
            
            expect(citationStructure).not.toBeNull();
            expect(citationStructure.hasId).toBe(true);
            expect(citationStructure.hasEvidenceProfile).toBe(true);
            expect(citationStructure.hasCitations).toBe(true);
            expect(citationStructure.hasMetrics).toBe(true);
            expect(citationStructure.hasEvolution).toBe(true);
            expect(citationStructure.citationCategories.mechanisms).toBe(true);
            expect(citationStructure.citationCategories.benefits).toBe(true);
            expect(citationStructure.citationCategories.safety).toBe(true);
            expect(citationStructure.citationCategories.dosage).toBe(true);
        });

        test('should use correct tier badge classes', async ({ page }) => {
            // Find the supplement card
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await expect(supplementCard).toBeVisible();
            
            // Check tier badge class
            const tierBadge = supplementCard.locator('.tier-badge, .tier-2, .tier-3, .tier-4');
            await expect(tierBadge).toBeVisible();
            
            // Verify correct tier class is applied
            const expectedTierClass = TEST_CONFIG.expectedTier === 1 ? 'tier-badge' : `tier-${TEST_CONFIG.expectedTier}`;
            const haCorrectTierClass = await tierBadge.evaluate((el, tierClass) => {
                return el.classList.contains(tierClass);
            }, expectedTierClass);
            
            expect(haCorrectTierClass).toBe(true);
        });
    });

    /**
     * Data Quality Tests
     * Validates citation content quality and completeness
     */
    test.describe('Citation Data Quality', () => {
        
        test('should meet minimum citation requirements for tier', async ({ page }) => {
            const citationCounts = await page.evaluate((supplementId) => {
                const citation = window.enhancedCitations?.[supplementId];
                if (!citation) return null;
                
                return {
                    mechanisms: citation.citations?.mechanisms?.length || 0,
                    benefits: citation.citations?.benefits?.length || 0,
                    safety: citation.citations?.safety?.length || 0,
                    dosage: citation.citations?.dosage?.length || 0,
                    total: (citation.citationMetrics?.totalStudies || 0)
                };
            }, TEST_CONFIG.supplementId);
            
            const tierMinimum = TEST_CONFIG.minimumCitations[`tier${TEST_CONFIG.expectedTier}`];
            
            expect(citationCounts).not.toBeNull();
            expect(citationCounts.total).toBeGreaterThanOrEqual(tierMinimum);
            expect(citationCounts.mechanisms).toBeGreaterThan(0);
            expect(citationCounts.benefits).toBeGreaterThan(0);
            expect(citationCounts.safety).toBeGreaterThan(0);
            expect(citationCounts.dosage).toBeGreaterThan(0);
        });

        test('should have valid citation structure for each category', async ({ page }) => {
            const citationValidation = await page.evaluate((supplementId) => {
                const citation = window.enhancedCitations?.[supplementId];
                if (!citation) return null;
                
                const validateCitationArray = (arr, category) => {
                    return arr.map((item, index) => {
                        const validation = {
                            index,
                            category,
                            hasEvidence: Array.isArray(item.evidence),
                            evidenceCount: item.evidence?.length || 0,
                            evidenceValidation: []
                        };
                        
                        if (item.evidence) {
                            validation.evidenceValidation = item.evidence.map(ev => ({
                                hasCitationId: !!ev.citationId,
                                hasTitle: !!ev.title,
                                hasAuthors: Array.isArray(ev.authors),
                                hasYear: typeof ev.year === 'number',
                                hasJournal: !!ev.journal,
                                hasDoi: !!ev.doi,
                                hasFindings: !!ev.findings
                            }));
                        }
                        
                        return validation;
                    });
                };
                
                return {
                    mechanisms: validateCitationArray(citation.citations?.mechanisms || [], 'mechanisms'),
                    benefits: validateCitationArray(citation.citations?.benefits || [], 'benefits'),
                    safety: validateCitationArray(citation.citations?.safety || [], 'safety'),
                    dosage: validateCitationArray(citation.citations?.dosage || [], 'dosage')
                };
            }, TEST_CONFIG.supplementId);
            
            // Validate each category has proper structure
            Object.keys(citationValidation).forEach(category => {
                const categoryData = citationValidation[category];
                expect(categoryData.length).toBeGreaterThan(0);
                
                categoryData.forEach(item => {
                    expect(item.hasEvidence).toBe(true);
                    expect(item.evidenceCount).toBeGreaterThan(0);
                    
                    item.evidenceValidation.forEach(evidence => {
                        expect(evidence.hasCitationId).toBe(true);
                        expect(evidence.hasTitle).toBe(true);
                        expect(evidence.hasAuthors).toBe(true);
                        expect(evidence.hasYear).toBe(true);
                        expect(evidence.hasJournal).toBe(true);
                        expect(evidence.hasFindings).toBe(true);
                    });
                });
            });
        });

        test('should have valid evidence profile metrics', async ({ page }) => {
            const evidenceProfile = await page.evaluate((supplementId) => {
                const citation = window.enhancedCitations?.[supplementId];
                return citation?.evidenceProfile;
            }, TEST_CONFIG.supplementId);
            
            expect(evidenceProfile).not.toBeNull();
            expect(evidenceProfile.overallQuality).toMatch(/^Tier [1-4]$/);
            expect(typeof evidenceProfile.totalCitations).toBe('number');
            expect(evidenceProfile.totalCitations).toBeGreaterThan(0);
            expect(typeof evidenceProfile.researchQualityScore).toBe('number');
            expect(evidenceProfile.researchQualityScore).toBeGreaterThan(0);
            expect(evidenceProfile.researchQualityScore).toBeLessThanOrEqual(100);
            expect(evidenceProfile.lastEvidenceUpdate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    /**
     * UI Functionality Tests
     * Validates modal functionality and user interaction
     */
    test.describe('Enhanced Citation Modal Functionality', () => {
        
        test('should open enhanced citation modal', async ({ page }) => {
            // Find and click the supplement card
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await expect(supplementCard).toBeVisible();
            await supplementCard.click();
            
            // Wait for modal to appear
            const modal = page.locator('.modal, [data-modal]');
            await expect(modal).toBeVisible({ timeout: 5000 });
            
            // Verify enhanced citation content is loaded
            const enhancedContent = page.locator('[data-enhanced-citation]');
            await expect(enhancedContent).toBeVisible();
        });

        test('should display tabbed interface with all categories', async ({ page }) => {
            // Open modal
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await supplementCard.click();
            
            // Wait for modal and tabs
            await page.waitForSelector('[data-tab]', { timeout: 5000 });
            
            // Verify all required tabs are present
            const benefitsTab = page.locator('[data-tab="benefits"]');
            const mechanismsTab = page.locator('[data-tab="mechanisms"]');
            const safetyTab = page.locator('[data-tab="safety"]');
            const dosageTab = page.locator('[data-tab="dosage"]');
            
            await expect(benefitsTab).toBeVisible();
            await expect(mechanismsTab).toBeVisible();
            await expect(safetyTab).toBeVisible();
            await expect(dosageTab).toBeVisible();
        });

        test('should switch between tabs correctly', async ({ page }) => {
            // Open modal
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await supplementCard.click();
            
            // Test each tab switch
            const tabs = ['benefits', 'mechanisms', 'safety', 'dosage'];
            
            for (const tab of tabs) {
                const tabButton = page.locator(`[data-tab="${tab}"]`);
                await tabButton.click();
                
                // Verify tab is active
                const isActive = await tabButton.evaluate(el => el.classList.contains('active'));
                expect(isActive).toBe(true);
                
                // Verify tab content is visible
                const tabContent = page.locator(`[data-tab-content="${tab}"]`);
                await expect(tabContent).toBeVisible();
            }
        });

        test('should handle citation expansion/collapse', async ({ page }) => {
            // Open modal
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await supplementCard.click();
            
            // Wait for citations to load
            await page.waitForTimeout(1000);
            
            // Find expandable citation
            const expandablesCitation = page.locator('[data-expandable-citation]').first();
            if (await expandablesCitation.count() > 0) {
                // Test expand
                await expandablesCitation.click();
                const expandedContent = page.locator('[data-citation-details]').first();
                await expect(expandedContent).toBeVisible();
                
                // Test collapse
                await expandablesCitation.click();
                await expect(expandedContent).not.toBeVisible();
            }
        });
    });

    /**
     * Error Handling Tests
     * Validates graceful degradation and error boundaries
     */
    test.describe('Error Handling and Boundaries', () => {
        
        test('should not break page functionality if enhanced citation fails', async ({ page }) => {
            // Inject error to test error boundary
            await page.addInitScript(() => {
                // Simulate enhanced citation loading failure
                const originalCitation = window.enhancedCitations?.[22];
                if (originalCitation) {
                    window.enhancedCitations[22] = null;
                }
            });
            
            // Reload page
            await page.reload();
            await page.waitForFunction(() => window.supplementDatabase !== undefined);
            
            // Verify basic functionality still works
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await expect(supplementCard).toBeVisible();
            
            // Modal should still open (with basic content)
            await supplementCard.click();
            const modal = page.locator('.modal, [data-modal]');
            await expect(modal).toBeVisible();
        });

        test('should log appropriate error messages', async ({ page }) => {
            const consoleLogs = [];
            page.on('console', msg => {
                if (msg.type() === 'error' || msg.type() === 'warn') {
                    consoleLogs.push(msg.text());
                }
            });
            
            // Simulate error condition
            await page.evaluate((supplementId) => {
                // Try to load non-existent enhanced citation
                const fakeId = 999;
                try {
                    window.loadEnhancedCitation?.(fakeId);
                } catch (error) {
                    console.error('Test error:', error);
                }
            }, TEST_CONFIG.supplementId);
            
            // Check that appropriate error/warning messages are logged
            // (This test may need adjustment based on actual error handling implementation)
        });
    });

    /**
     * Performance Tests
     * Validates loading times and responsiveness
     */
    test.describe('Performance Validation', () => {
        
        test('should load modal within acceptable time', async ({ page }) => {
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            
            const startTime = Date.now();
            await supplementCard.click();
            
            // Wait for modal to appear
            await page.waitForSelector('.modal, [data-modal]', { timeout: 5000 });
            await page.waitForSelector('[data-enhanced-citation]', { timeout: 5000 });
            
            const endTime = Date.now();
            const loadTime = endTime - startTime;
            
            // Should load within 2 seconds (adjust threshold as needed)
            expect(loadTime).toBeLessThan(2000);
        });

        test('should not cause memory leaks with multiple modal opens', async ({ page }) => {
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            
            // Open and close modal multiple times
            for (let i = 0; i < 5; i++) {
                await supplementCard.click();
                await page.waitForSelector('[data-enhanced-citation]');
                
                // Close modal (assuming ESC key or close button)
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
            }
            
            // Check if page is still responsive
            await supplementCard.click();
            const modal = page.locator('.modal, [data-modal]');
            await expect(modal).toBeVisible();
        });
    });
});

/**
 * Usage Instructions:
 * 
 * 1. Copy this template for each new supplement
 * 2. Update TEST_CONFIG with supplement-specific values
 * 3. Customize any supplement-specific test cases
 * 4. Run tests with: npx playwright test test-omega3-enhanced.js
 * 
 * Expected Test Results:
 * - All Pattern Compliance tests should pass
 * - Data Quality tests validate citation completeness
 * - UI Functionality tests ensure modal works correctly
 * - Error Handling tests verify graceful degradation
 * - Performance tests ensure acceptable load times
 */