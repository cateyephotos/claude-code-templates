/**
 * Enhanced Citations Integration Validation Test
 * Comprehensive test suite for Phase 2A Enhanced Citations
 * Generated: 2025-08-20
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class EnhancedCitationsValidator {
    constructor() {
        this.results = {
            fileValidation: {},
            databaseIntegration: {},
            frontEndTests: {},
            specificSupplements: {},
            performanceTests: {},
            errorDetection: {},
            summary: {}
        };
        
        this.targetSupplements = [
            { id: 21, name: 'Vitamin B12' },
            { id: 22, name: 'Vitamin B6' },
            { id: 34, name: '5-HTP' },
            { id: 37, name: 'Zinc' },
            { id: 38, name: 'Iron' },
            { id: 40, name: 'GABA' },
            { id: 41, name: 'Inositol' },
            { id: 43, name: 'Choline' },
            { id: 44, name: 'Alpha-Lipoic Acid' },
            { id: 45, name: 'Lutein' }
        ];
        
        this.siteUrl = 'http://localhost:8001';
        this.testStartTime = Date.now();
    }

    /**
     * 1. ENHANCED CITATION FILES VALIDATION
     */
    async validateEnhancedCitationFiles() {
        console.log('🔍 1. VALIDATING ENHANCED CITATION FILES...');
        
        const enhancedDir = path.join(__dirname, 'data', 'enhanced_citations');
        const results = {
            totalFiles: 0,
            validFiles: 0,
            invalidFiles: 0,
            fileResults: [],
            errors: []
        };

        try {
            // Check if enhanced_citations directory exists
            if (!fs.existsSync(enhancedDir)) {
                throw new Error('Enhanced citations directory not found');
            }

            const files = fs.readdirSync(enhancedDir).filter(f => f.endsWith('.js'));
            results.totalFiles = files.length;

            for (const file of files) {
                const filePath = path.join(enhancedDir, file);
                const fileResult = await this.validateSingleEnhancedFile(filePath, file);
                results.fileResults.push(fileResult);
                
                if (fileResult.valid) {
                    results.validFiles++;
                } else {
                    results.invalidFiles++;
                    results.errors.push(`${file}: ${fileResult.errors.join(', ')}`);
                }
            }

            // Validate target supplements have enhanced citation files
            for (const supplement of this.targetSupplements) {
                const expectedFiles = [
                    `${supplement.id}_enhanced.js`,
                    `${supplement.name.toLowerCase().replace(/[- ]/g, '_')}_enhanced.js`
                ];
                
                const hasEnhancedFile = expectedFiles.some(expectedFile => 
                    files.includes(expectedFile)
                );
                
                if (!hasEnhancedFile) {
                    results.errors.push(`Missing enhanced citation file for ${supplement.name} (ID: ${supplement.id})`);
                }
            }

        } catch (error) {
            results.errors.push(`Directory validation error: ${error.message}`);
        }

        this.results.fileValidation = results;
        console.log(`   ✅ Valid files: ${results.validFiles}/${results.totalFiles}`);
        if (results.errors.length > 0) {
            console.log(`   ❌ Errors: ${results.errors.length}`);
        }
    }

    async validateSingleEnhancedFile(filePath, fileName) {
        const result = {
            fileName,
            valid: true,
            errors: [],
            globalAssignment: false,
            structure: {}
        };

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for global window assignment
            if (content.includes('window.enhancedCitations')) {
                result.globalAssignment = true;
            } else {
                result.errors.push('Missing global window assignment');
            }

            // Check for proper structure (using eval in controlled environment)
            const sandbox = { window: { enhancedCitations: {} }, module: { exports: {} } };
            const vm = require('vm');
            const context = vm.createContext(sandbox);
            
            try {
                vm.runInContext(content, context);
                
                // Check if the enhanced citation object was created
                const enhancedData = Object.values(sandbox.window.enhancedCitations)[0];
                if (enhancedData) {
                    result.structure = {
                        hasId: !!enhancedData.id,
                        hasName: !!enhancedData.name,
                        hasCitations: !!enhancedData.citations,
                        hasEvidenceProfile: !!enhancedData.evidenceProfile,
                        citationCount: enhancedData.citations ? Object.keys(enhancedData.citations).length : 0
                    };
                } else {
                    result.errors.push('Enhanced citation object not found');
                }
                
            } catch (evalError) {
                result.errors.push(`JavaScript evaluation error: ${evalError.message}`);
            }

        } catch (error) {
            result.errors.push(`File read error: ${error.message}`);
        }

        result.valid = result.errors.length === 0;
        return result;
    }

    /**
     * 2. DATABASE INTEGRATION TESTING
     */
    async validateDatabaseIntegration() {
        console.log('🔍 2. VALIDATING DATABASE INTEGRATION...');
        
        const results = {
            supplementsLoaded: false,
            enhancedFlags: 0,
            targetSupplementsFound: 0,
            targetSupplementsEnhanced: 0,
            errors: []
        };

        try {
            const supplementsPath = path.join(__dirname, 'data', 'supplements.js');
            if (!fs.existsSync(supplementsPath)) {
                throw new Error('supplements.js not found');
            }

            const content = fs.readFileSync(supplementsPath, 'utf8');
            
            // Create a sandbox to evaluate supplements.js
            const sandbox = { supplementDatabase: null };
            const vm = require('vm');
            const context = vm.createContext(sandbox);
            
            try {
                vm.runInContext(content, context);
                
                if (sandbox.supplementDatabase && sandbox.supplementDatabase.supplements) {
                    results.supplementsLoaded = true;
                    const supplements = sandbox.supplementDatabase.supplements;
                    
                    // Count enhanced flags
                    results.enhancedFlags = supplements.filter(s => s.isEnhanced === true).length;
                    
                    // Check target supplements
                    for (const targetSupplement of this.targetSupplements) {
                        const found = supplements.find(s => s.id === targetSupplement.id);
                        if (found) {
                            results.targetSupplementsFound++;
                            if (found.isEnhanced === true) {
                                results.targetSupplementsEnhanced++;
                            }
                        }
                    }
                    
                } else {
                    results.errors.push('supplements.js did not create supplementDatabase object');
                }
                
            } catch (evalError) {
                results.errors.push(`JavaScript evaluation error: ${evalError.message}`);
            }

        } catch (error) {
            results.errors.push(`Database validation error: ${error.message}`);
        }

        this.results.databaseIntegration = results;
        console.log(`   ✅ Supplements with enhanced flags: ${results.enhancedFlags}`);
        console.log(`   ✅ Target supplements found: ${results.targetSupplementsFound}/${this.targetSupplements.length}`);
        console.log(`   ✅ Target supplements enhanced: ${results.targetSupplementsEnhanced}/${this.targetSupplements.length}`);
    }

    /**
     * 3. FRONT-END MODAL SYSTEM TESTING
     */
    async validateFrontEndSystem() {
        console.log('🔍 3. VALIDATING FRONT-END MODAL SYSTEM...');
        
        const browser = await puppeteer.launch({ 
            headless: false,
            slowMo: 100,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        try {
            const page = await browser.newPage();
            
            // Set up console monitoring
            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            // Set up network monitoring  
            const networkErrors = [];
            page.on('response', response => {
                if (!response.ok()) {
                    networkErrors.push(`${response.status()} ${response.url()}`);
                }
            });

            console.log(`   📱 Loading ${this.siteUrl}...`);
            const startTime = Date.now();
            
            try {
                await page.goto(this.siteUrl, { waitUntil: 'networkidle0', timeout: 30000 });
            } catch (error) {
                throw new Error(`Failed to load site: ${error.message}`);
            }

            const loadTime = Date.now() - startTime;

            // Wait for supplements to load
            await page.waitForSelector('#supplementGrid', { timeout: 10000 });

            // Test enhanced citation modal functionality
            const modalTests = await this.testEnhancedCitationModals(page);
            
            // Test specific supplements
            const specificTests = await this.testSpecificSupplements(page);

            this.results.frontEndTests = {
                pageLoaded: true,
                loadTime,
                consoleErrors,
                networkErrors,
                modalTests,
                specificTests
            };

            console.log(`   ✅ Page loaded in ${loadTime}ms`);
            console.log(`   ✅ Console errors: ${consoleErrors.length}`);
            console.log(`   ✅ Network errors: ${networkErrors.length}`);

        } catch (error) {
            this.results.frontEndTests = {
                pageLoaded: false,
                error: error.message
            };
            console.log(`   ❌ Front-end test failed: ${error.message}`);
        } finally {
            await browser.close();
        }
    }

    async testEnhancedCitationModals(page) {
        const results = {
            modalsOpened: 0,
            enhancedCitationsLoaded: 0,
            tabbedInterfaceWorks: 0,
            phase2aBadgesVisible: 0,
            errors: []
        };

        try {
            // Find all supplement cards
            const cards = await page.$$('.card-hover');
            console.log(`   🔍 Found ${cards.length} supplement cards`);

            // Test first few cards that should have enhanced citations
            for (let i = 0; i < Math.min(5, cards.length); i++) {
                try {
                    await cards[i].click();
                    await page.waitForSelector('#supplementModal', { visible: true, timeout: 5000 });
                    results.modalsOpened++;

                    // Check for enhanced citation tabs
                    const tabs = await page.$$('.citation-tab-btn');
                    if (tabs.length > 0) {
                        results.tabbedInterfaceWorks++;
                        
                        // Check if enhanced citations are loaded
                        const enhancedContent = await page.$('.enhanced-citation-card');
                        if (enhancedContent) {
                            results.enhancedCitationsLoaded++;
                        }
                    }

                    // Check for Phase 2A badge
                    const phase2aBadge = await page.$('.phase-2a-badge');
                    if (phase2aBadge) {
                        results.phase2aBadgesVisible++;
                    }

                    // Close modal
                    await page.click('.modal-overlay');
                    await page.waitForSelector('#supplementModal', { hidden: true, timeout: 3000 });

                } catch (error) {
                    results.errors.push(`Card ${i}: ${error.message}`);
                }
            }

        } catch (error) {
            results.errors.push(`Modal testing error: ${error.message}`);
        }

        return results;
    }

    async testSpecificSupplements(page) {
        const results = {};

        for (const supplement of this.targetSupplements) {
            const testResult = {
                found: false,
                modalOpened: false,
                enhancedCitationsVisible: false,
                citationLoadTime: null,
                errors: []
            };

            try {
                // Search for the supplement
                await page.click('#searchInput');
                await page.type('#searchInput', supplement.name);
                await page.waitForTimeout(1000);

                // Look for the supplement card
                const cards = await page.$$('.card-hover');
                let targetCard = null;

                for (const card of cards) {
                    const cardText = await page.evaluate(el => el.textContent, card);
                    if (cardText.includes(supplement.name)) {
                        targetCard = card;
                        testResult.found = true;
                        break;
                    }
                }

                if (targetCard) {
                    // Test modal opening
                    const citationLoadStart = Date.now();
                    await targetCard.click();
                    await page.waitForSelector('#supplementModal', { visible: true, timeout: 5000 });
                    testResult.modalOpened = true;

                    // Check for enhanced citations
                    const enhancedContent = await page.$('.enhanced-citation-card');
                    if (enhancedContent) {
                        testResult.enhancedCitationsVisible = true;
                        testResult.citationLoadTime = Date.now() - citationLoadStart;
                    }

                    // Close modal
                    await page.click('.modal-overlay');
                    await page.waitForSelector('#supplementModal', { hidden: true, timeout: 3000 });
                }

                // Clear search
                await page.click('#searchInput');
                await page.keyboard.selectAll();
                await page.keyboard.press('Backspace');

            } catch (error) {
                testResult.errors.push(error.message);
            }

            results[supplement.name] = testResult;
        }

        return results;
    }

    /**
     * 4. PERFORMANCE TESTING
     */
    async validatePerformance() {
        console.log('🔍 4. VALIDATING PERFORMANCE...');
        
        const results = {
            citationLoadTimes: [],
            averageLoadTime: 0,
            slowLoads: 0,
            memoryUsage: null,
            errors: []
        };

        // Extract performance data from specific supplement tests
        if (this.results.frontEndTests && this.results.frontEndTests.specificTests) {
            const specificTests = this.results.frontEndTests.specificTests;
            
            for (const [name, test] of Object.entries(specificTests)) {
                if (test.citationLoadTime !== null) {
                    results.citationLoadTimes.push(test.citationLoadTime);
                    if (test.citationLoadTime > 500) {
                        results.slowLoads++;
                    }
                }
            }

            if (results.citationLoadTimes.length > 0) {
                results.averageLoadTime = results.citationLoadTimes.reduce((a, b) => a + b, 0) / results.citationLoadTimes.length;
            }
        }

        this.results.performanceTests = results;
        console.log(`   ✅ Average citation load time: ${results.averageLoadTime.toFixed(0)}ms`);
        console.log(`   ✅ Loads over 500ms: ${results.slowLoads}`);
    }

    /**
     * 5. ERROR DETECTION
     */
    async validateErrorDetection() {
        console.log('🔍 5. VALIDATING ERROR DETECTION...');
        
        const results = {
            jsErrors: [],
            networkErrors: [],
            validationErrors: [],
            totalErrors: 0
        };

        // Collect JavaScript errors from front-end tests
        if (this.results.frontEndTests) {
            results.jsErrors = this.results.frontEndTests.consoleErrors || [];
            results.networkErrors = this.results.frontEndTests.networkErrors || [];
        }

        // Collect validation errors from other tests
        if (this.results.fileValidation && this.results.fileValidation.errors) {
            results.validationErrors.push(...this.results.fileValidation.errors);
        }

        if (this.results.databaseIntegration && this.results.databaseIntegration.errors) {
            results.validationErrors.push(...this.results.databaseIntegration.errors);
        }

        results.totalErrors = results.jsErrors.length + results.networkErrors.length + results.validationErrors.length;

        this.results.errorDetection = results;
        console.log(`   ✅ Total errors detected: ${results.totalErrors}`);
    }

    /**
     * 6. GENERATE COMPREHENSIVE REPORT
     */
    generateValidationReport() {
        console.log('📊 GENERATING COMPREHENSIVE VALIDATION REPORT...');
        
        const testDuration = Date.now() - this.testStartTime;
        
        const summary = {
            timestamp: new Date().toISOString(),
            testDuration: `${(testDuration / 1000).toFixed(1)}s`,
            overallStatus: 'PASSED',
            criticalIssues: 0,
            recommendations: []
        };

        // Evaluate overall status
        const issues = [];
        
        // File validation issues
        if (this.results.fileValidation && this.results.fileValidation.invalidFiles > 0) {
            issues.push(`${this.results.fileValidation.invalidFiles} invalid enhanced citation files`);
            summary.criticalIssues++;
        }

        // Database integration issues
        if (this.results.databaseIntegration) {
            const db = this.results.databaseIntegration;
            if (db.targetSupplementsEnhanced < this.targetSupplements.length) {
                const missing = this.targetSupplements.length - db.targetSupplementsEnhanced;
                issues.push(`${missing} target supplements missing enhanced flags`);
                summary.criticalIssues++;
            }
        }

        // Performance issues
        if (this.results.performanceTests && this.results.performanceTests.slowLoads > 2) {
            issues.push(`${this.results.performanceTests.slowLoads} slow citation loads detected`);
            summary.recommendations.push('Optimize citation loading for better performance');
        }

        // Error issues
        if (this.results.errorDetection && this.results.errorDetection.totalErrors > 5) {
            issues.push(`${this.results.errorDetection.totalErrors} errors detected`);
            summary.criticalIssues++;
        }

        if (summary.criticalIssues > 0) {
            summary.overallStatus = 'FAILED';
        } else if (issues.length > 0) {
            summary.overallStatus = 'PASSED_WITH_WARNINGS';
        }

        summary.issues = issues;
        this.results.summary = summary;

        // Generate detailed report
        const report = {
            ...this.results,
            metadata: {
                testSuite: 'Enhanced Citations Integration Validation',
                version: '1.0.0',
                generatedBy: 'Claude Code Enhanced Citations Validator',
                timestamp: summary.timestamp
            }
        };

        // Save report to file
        const reportPath = path.join(__dirname, 'enhanced-citations-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Console summary
        console.log('\n🎯 VALIDATION SUMMARY');
        console.log('===================');
        console.log(`Status: ${summary.overallStatus}`);
        console.log(`Duration: ${summary.testDuration}`);
        console.log(`Critical Issues: ${summary.criticalIssues}`);
        
        if (issues.length > 0) {
            console.log('\nIssues Found:');
            issues.forEach(issue => console.log(`  - ${issue}`));
        }

        if (summary.recommendations.length > 0) {
            console.log('\nRecommendations:');
            summary.recommendations.forEach(rec => console.log(`  - ${rec}`));
        }

        console.log(`\nDetailed report saved to: ${reportPath}`);
        
        return report;
    }

    /**
     * MAIN VALIDATION RUNNER
     */
    async runCompleteValidation() {
        console.log('🚀 ENHANCED CITATIONS INTEGRATION VALIDATION');
        console.log('============================================\n');

        try {
            await this.validateEnhancedCitationFiles();
            await this.validateDatabaseIntegration();
            await this.validateFrontEndSystem();
            await this.validatePerformance();
            await this.validateErrorDetection();
            
            const report = this.generateValidationReport();
            
            return report;
            
        } catch (error) {
            console.error('❌ VALIDATION FAILED:', error.message);
            return {
                status: 'FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Export for use
module.exports = EnhancedCitationsValidator;

// If run directly
if (require.main === module) {
    (async () => {
        const validator = new EnhancedCitationsValidator();
        await validator.runCompleteValidation();
    })();
}