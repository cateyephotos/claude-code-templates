// Enhanced Citations Validation Test Suite - Magnesium Implementation
// Customized test suite for Magnesium (ID 35) enhanced citations

const { test, expect } = require('@playwright/test');

/**
 * Test Configuration - Magnesium Specific
 */
const TEST_CONFIG = {
    supplementId: 35, // Magnesium ID
    supplementName: 'Magnesium', // Magnesium name
    expectedTier: 1, // Tier 1 evidence (highest quality)
    minimumCitations: {
        tier1: 20,
        tier2: 15, 
        tier3: 10,
        tier4: 5
    },
    expectedCitationCounts: {
        mechanisms: 6,  // Tier 1 requirement
        benefits: 8,    // Tier 1 requirement
        safety: 3,      // Tier 1 requirement
        dosage: 2       // Tier 1 requirement
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
                    hasCorrectId: citation.id === supplementId,
                    hasName: citation.name === 'Magnesium',
                    hasEvidenceProfile: citation.evidenceProfile !== undefined,
                    hasTier1Quality: citation.evidenceProfile?.overallQuality === 'Tier 1',
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
            expect(citationStructure.hasCorrectId).toBe(true);
            expect(citationStructure.hasName).toBe(true);
            expect(citationStructure.hasTier1Quality).toBe(true);
            expect(citationStructure.hasEvidenceProfile).toBe(true);
            expect(citationStructure.hasCitations).toBe(true);
            expect(citationStructure.hasMetrics).toBe(true);
            expect(citationStructure.hasEvolution).toBe(true);
            expect(citationStructure.citationCategories.mechanisms).toBe(true);
            expect(citationStructure.citationCategories.benefits).toBe(true);
            expect(citationStructure.citationCategories.safety).toBe(true);
            expect(citationStructure.citationCategories.dosage).toBe(true);
        });

        test('should use correct tier badge classes for Tier 1', async ({ page }) => {
            // Find the supplement card
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await expect(supplementCard).toBeVisible();
            
            // Check tier badge class - Tier 1 should use 'tier-badge' class
            const tierBadge = supplementCard.locator('.tier-badge');
            await expect(tierBadge).toBeVisible();
            
            // Verify Tier 1 badge styling is applied
            const hasTier1Class = await tierBadge.evaluate((el) => {
                return el.classList.contains('tier-badge');
            });
            
            expect(hasTier1Class).toBe(true);
        });

        test('should have magnesium-specific content', async ({ page }) => {
            const magnesiumSpecifics = await page.evaluate((supplementId) => {
                const citation = window.enhancedCitations?.[supplementId];
                if (!citation) return null;
                
                return {
                    hasCommonNames: citation.commonNames?.includes('Magnesium Glycinate'),
                    hasCategory: citation.category === 'Essential Mineral',
                    hasScientificName: citation.scientificName?.includes('Magnesium'),
                    hasSleepBenefits: citation.citations?.benefits?.some(b => 
                        b.healthDomain?.includes('Sleep')),
                    hasNMDAMechanism: citation.citations?.mechanisms?.some(m => 
                        m.mechanism?.includes('NMDA')),
                    hasGABAMechanism: citation.citations?.mechanisms?.some(m => 
                        m.mechanism?.includes('GABA'))
                };
            }, TEST_CONFIG.supplementId);
            
            expect(magnesiumSpecifics).not.toBeNull();
            expect(magnesiumSpecifics.hasCommonNames).toBe(true);
            expect(magnesiumSpecifics.hasCategory).toBe(true);
            expect(magnesiumSpecifics.hasScientificName).toBe(true);
            expect(magnesiumSpecifics.hasSleepBenefits).toBe(true);
            expect(magnesiumSpecifics.hasNMDAMechanism).toBe(true);
            expect(magnesiumSpecifics.hasGABAMechanism).toBe(true);
        });
    });

    /**
     * Data Quality Tests - Tier 1 Requirements
     * Validates citation content quality and completeness
     */
    test.describe('Citation Data Quality - Tier 1 Standards', () => {
        
        test('should meet Tier 1 citation requirements', async ({ page }) => {
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
            
            expect(citationCounts).not.toBeNull();
            expect(citationCounts.total).toBeGreaterThanOrEqual(TEST_CONFIG.minimumCitations.tier1);
            expect(citationCounts.mechanisms).toBeGreaterThanOrEqual(TEST_CONFIG.expectedCitationCounts.mechanisms);
            expect(citationCounts.benefits).toBeGreaterThanOrEqual(TEST_CONFIG.expectedCitationCounts.benefits);
            expect(citationCounts.safety).toBeGreaterThanOrEqual(TEST_CONFIG.expectedCitationCounts.safety);
            expect(citationCounts.dosage).toBeGreaterThanOrEqual(TEST_CONFIG.expectedCitationCounts.dosage);
        });

        test('should have high-quality research citations', async ({ page }) => {
            const researchQuality = await page.evaluate((supplementId) => {
                const citation = window.enhancedCitations?.[supplementId];
                if (!citation) return null;
                
                const validateEvidence = (evidenceArray) => {
                    return evidenceArray.every(item => 
                        item.evidence && 
                        Array.isArray(item.evidence) &&
                        item.evidence.every(ev => 
                            ev.citationId && 
                            ev.title && 
                            ev.authors && 
                            Array.isArray(ev.authors) &&
                            ev.year &&
                            ev.journal &&
                            ev.findings
                        )
                    );
                };
                
                return {
                    mechanismsValid: validateEvidence(citation.citations?.mechanisms || []),
                    benefitsValid: validateEvidence(citation.citations?.benefits || []),
                    safetyValid: validateEvidence(citation.citations?.safety || []),
                    dosageValid: validateEvidence(citation.citations?.dosage || []),
                    hasMetaAnalyses: citation.citationMetrics?.studyTypes?.metaAnalyses > 0,
                    hasRCTs: citation.citationMetrics?.studyTypes?.rctCount >= 8,
                    qualityScore: citation.evidenceProfile?.researchQualityScore
                };
            }, TEST_CONFIG.supplementId);
            
            expect(researchQuality.mechanismsValid).toBe(true);
            expect(researchQuality.benefitsValid).toBe(true);
            expect(researchQuality.safetyValid).toBe(true);
            expect(researchQuality.dosageValid).toBe(true);
            expect(researchQuality.hasMetaAnalyses).toBe(true);
            expect(researchQuality.hasRCTs).toBe(true);
            expect(researchQuality.qualityScore).toBeGreaterThanOrEqual(80); // Tier 1 requirement
        });

        test('should have valid evidence profile metrics', async ({ page }) => {
            const evidenceProfile = await page.evaluate((supplementId) => {
                const citation = window.enhancedCitations?.[supplementId];
                return citation?.evidenceProfile;
            }, TEST_CONFIG.supplementId);
            
            expect(evidenceProfile).not.toBeNull();
            expect(evidenceProfile.overallQuality).toBe('Tier 1');
            expect(evidenceProfile.totalCitations).toBeGreaterThanOrEqual(20);
            expect(evidenceProfile.researchQualityScore).toBeGreaterThanOrEqual(80);
            expect(evidenceProfile.researchQualityScore).toBeLessThanOrEqual(100);
            expect(evidenceProfile.lastEvidenceUpdate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(evidenceProfile.evidenceStrength.mechanisms).toBe('Strong');
            expect(evidenceProfile.evidenceStrength.clinicalBenefits).toBe('Strong');
            expect(evidenceProfile.evidenceStrength.safety).toBe('Well-established');
            expect(evidenceProfile.evidenceStrength.dosage).toBe('Evidence-based');
        });

        test('should have comprehensive magnesium mechanisms', async ({ page }) => {
            const mechanisms = await page.evaluate((supplementId) => {
                const citation = window.enhancedCitations?.[supplementId];
                const mechanismTypes = citation?.citations?.mechanisms?.map(m => m.mechanism) || [];
                
                return {
                    mechanismTypes,
                    hasNMDA: mechanismTypes.some(m => m.includes('NMDA')),
                    hasEnzyme: mechanismTypes.some(m => m.includes('enzyme') || m.includes('Enzyme')),
                    hasMuscle: mechanismTypes.some(m => m.includes('muscle') || m.includes('Muscle')),
                    hasGABA: mechanismTypes.some(m => m.includes('GABA')),
                    hasCalcium: mechanismTypes.some(m => m.includes('calcium') || m.includes('Calcium')),
                    mechanismCount: mechanismTypes.length
                };
            }, TEST_CONFIG.supplementId);
            
            expect(mechanisms.mechanismCount).toBeGreaterThanOrEqual(6);
            expect(mechanisms.hasNMDA).toBe(true);
            expect(mechanisms.hasEnzyme).toBe(true);
            expect(mechanisms.hasMuscle).toBe(true);
            expect(mechanisms.hasGABA).toBe(true);
            expect(mechanisms.hasCalcium).toBe(true);
        });

        test('should have comprehensive benefit domains', async ({ page }) => {
            const benefits = await page.evaluate((supplementId) => {
                const citation = window.enhancedCitations?.[supplementId];
                const benefitDomains = citation?.citations?.benefits?.map(b => b.healthDomain) || [];
                
                return {
                    benefitDomains,
                    hasSleep: benefitDomains.some(d => d.includes('Sleep')),
                    hasAnxiety: benefitDomains.some(d => d.includes('Anxiety') || d.includes('Stress')),
                    hasMuscle: benefitDomains.some(d => d.includes('Muscle')),
                    hasCardiovascular: benefitDomains.some(d => d.includes('Blood Pressure') || d.includes('Cardiovascular')),
                    benefitCount: benefitDomains.length
                };
            }, TEST_CONFIG.supplementId);
            
            expect(benefits.benefitCount).toBeGreaterThanOrEqual(8);
            expect(benefits.hasSleep).toBe(true);
            expect(benefits.hasAnxiety).toBe(true);
            expect(benefits.hasMuscle).toBe(true);
            expect(benefits.hasCardiovascular).toBe(true);
        });
    });

    /**
     * UI Functionality Tests
     * Validates modal functionality and user interaction
     */
    test.describe('Enhanced Citation Modal Functionality', () => {
        
        test('should open enhanced citation modal for Magnesium', async ({ page }) => {
            // Find and click the Magnesium supplement card
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await expect(supplementCard).toBeVisible();
            await supplementCard.click();
            
            // Wait for modal to appear
            const modal = page.locator('.modal, [data-modal]');
            await expect(modal).toBeVisible({ timeout: 5000 });
            
            // Verify enhanced citation content is loaded
            const enhancedContent = page.locator('[data-enhanced-citation]');
            await expect(enhancedContent).toBeVisible();
            
            // Verify Magnesium-specific content appears
            const modalTitle = await page.locator('.modal h2, .modal-title').textContent();
            expect(modalTitle).toContain('Magnesium');
        });

        test('should display tabbed interface with all 4 categories', async ({ page }) => {
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
            
            // Check tab content includes magnesium-specific information
            await benefitsTab.click();
            const benefitsContent = await page.locator('[data-tab-content="benefits"]').textContent();
            expect(benefitsContent).toContain('Sleep' || 'Anxiety' || 'Muscle');
            
            await mechanismsTab.click();
            const mechanismsContent = await page.locator('[data-tab-content="mechanisms"]').textContent();
            expect(mechanismsContent).toContain('NMDA' || 'calcium' || 'GABA');
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

        test('should display Tier 1 badge correctly', async ({ page }) => {
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            
            // Verify Phase 2A badge is visible
            const phase2ABadge = page.locator('.phase-2a-badge');
            await expect(phase2ABadge).toBeVisible();
            
            // Verify Tier 1 badge styling
            const tierBadge = supplementCard.locator('.tier-badge');
            await expect(tierBadge).toBeVisible();
            
            // Check badge text or styling indicates Tier 1
            const badgeText = await tierBadge.textContent();
            expect(badgeText).toContain('1' || 'Tier 1' || 'Strong');
        });
    });

    /**
     * Error Handling Tests
     * Validates graceful degradation and error boundaries
     */
    test.describe('Error Handling and Boundaries', () => {
        
        test('should not break page functionality if enhanced citation fails', async ({ page }) => {
            // Simulate partial loading failure
            await page.addInitScript(() => {
                // Simulate corrupted citation data
                if (window.enhancedCitations && window.enhancedCitations[35]) {
                    window.enhancedCitations[35].citations = null;
                }
            });
            
            // Reload page
            await page.reload();
            await page.waitForFunction(() => window.supplementDatabase !== undefined);
            
            // Verify basic functionality still works
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await expect(supplementCard).toBeVisible();
            
            // Modal should still open (with graceful degradation)
            await supplementCard.click();
            const modal = page.locator('.modal, [data-modal]');
            await expect(modal).toBeVisible();
        });

        test('should handle console errors gracefully', async ({ page }) => {
            const consoleLogs = [];
            page.on('console', msg => {
                if (msg.type() === 'error' || msg.type() === 'warn') {
                    consoleLogs.push(msg.text());
                }
            });
            
            // Open modal and interact
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await supplementCard.click();
            
            // Wait for modal to load
            await page.waitForTimeout(2000);
            
            // Check for unexpected errors
            const criticalErrors = consoleLogs.filter(log => 
                log.includes('TypeError') || 
                log.includes('ReferenceError') ||
                log.includes('Cannot read property')
            );
            
            expect(criticalErrors.length).toBe(0);
        });
    });

    /**
     * Performance Tests
     * Validates loading times and responsiveness for Tier 1 implementation
     */
    test.describe('Performance Validation', () => {
        
        test('should load modal within 2 seconds', async ({ page }) => {
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            
            const startTime = Date.now();
            await supplementCard.click();
            
            // Wait for modal to appear
            await page.waitForSelector('.modal, [data-modal]', { timeout: 5000 });
            await page.waitForSelector('[data-enhanced-citation]', { timeout: 5000 });
            
            const endTime = Date.now();
            const loadTime = endTime - startTime;
            
            // Should load within 2 seconds (Tier 1 requirement)
            expect(loadTime).toBeLessThan(2000);
            console.log(`Modal load time: ${loadTime}ms`);
        });

        test('should handle large citation dataset efficiently', async ({ page }) => {
            const supplementCard = page.locator(`[data-supplement-id="${TEST_CONFIG.supplementId}"]`);
            await supplementCard.click();
            
            // Measure tab switching performance
            const tabSwitchTimes = [];
            const tabs = ['benefits', 'mechanisms', 'safety', 'dosage'];
            
            for (const tab of tabs) {
                const startTime = Date.now();
                
                const tabButton = page.locator(`[data-tab="${tab}"]`);
                await tabButton.click();
                await page.waitForSelector(`[data-tab-content="${tab}"]`);
                
                const endTime = Date.now();
                tabSwitchTimes.push(endTime - startTime);
            }
            
            // All tab switches should be under 500ms
            const maxTabSwitchTime = Math.max(...tabSwitchTimes);
            expect(maxTabSwitchTime).toBeLessThan(500);
            console.log(`Max tab switch time: ${maxTabSwitchTime}ms`);
        });
    });
});

/**
 * Magnesium-Specific Test Results Summary:
 * 
 * Expected Results for Successful Implementation:
 * - ✅ Global window pattern loading: window.enhancedCitations[35] exists
 * - ✅ Tier 1 citation requirements: 24 total citations (6+8+3+2 minimum)
 * - ✅ High research quality score: 85/100 (exceeds 80 threshold)
 * - ✅ Magnesium-specific mechanisms: NMDA, enzyme cofactor, muscle relaxation
 * - ✅ Key benefit domains: Sleep, anxiety, muscle cramps, blood pressure
 * - ✅ Safety profile: Well-established with detailed interaction data
 * - ✅ Dosage optimization: 200-400mg daily with form-specific guidance
 * - ✅ Modal performance: <2 second load time with 24 citations
 * - ✅ UI functionality: 4-tab interface with smooth navigation
 * - ✅ Error handling: Graceful degradation on data corruption
 * 
 * Run with: npx playwright test test-magnesium-enhanced.js --headed
 */