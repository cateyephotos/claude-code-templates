/**
 * Enhanced Citations Integration Validation Test (Simple Version)
 * Comprehensive test suite for Phase 2A Enhanced Citations - No Browser Dependencies
 * Generated: 2025-08-20
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

class EnhancedCitationsValidator {
    constructor() {
        this.results = {
            fileValidation: {},
            databaseIntegration: {},
            specificSupplements: {},
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
            targetSupplementFiles: {},
            errors: []
        };

        try {
            // Check if enhanced_citations directory exists
            if (!fs.existsSync(enhancedDir)) {
                throw new Error('Enhanced citations directory not found');
            }

            const files = fs.readdirSync(enhancedDir).filter(f => f.endsWith('.js'));
            results.totalFiles = files.length;

            console.log(`   📁 Found ${files.length} enhanced citation files`);

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

            // Check for target supplements enhanced citation files
            for (const supplement of this.targetSupplements) {
                const expectedFiles = [
                    `${supplement.id}_enhanced.js`,
                    `${supplement.name.toLowerCase().replace(/[- ]/g, '_')}_enhanced.js`,
                    `${supplement.id}_${supplement.name.toLowerCase().replace(/[- ]/g, '_')}_enhanced.js`
                ];
                
                const foundFile = expectedFiles.find(expectedFile => 
                    files.includes(expectedFile)
                );
                
                results.targetSupplementFiles[supplement.name] = {
                    found: !!foundFile,
                    fileName: foundFile || 'Not found',
                    supplementId: supplement.id
                };
                
                if (!foundFile) {
                    results.errors.push(`Missing enhanced citation file for ${supplement.name} (ID: ${supplement.id})`);
                }
            }

        } catch (error) {
            results.errors.push(`Directory validation error: ${error.message}`);
        }

        this.results.fileValidation = results;
        console.log(`   ✅ Valid files: ${results.validFiles}/${results.totalFiles}`);
        console.log(`   📋 Target supplement files found: ${Object.values(results.targetSupplementFiles).filter(f => f.found).length}/${this.targetSupplements.length}`);
        
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
            structure: {},
            citationQuality: {}
        };

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for global window assignment
            if (content.includes('window.enhancedCitations')) {
                result.globalAssignment = true;
            } else {
                result.errors.push('Missing global window assignment');
                result.valid = false;
            }

            // Check for module.exports
            if (!content.includes('module.exports')) {
                result.errors.push('Missing module.exports for Node.js compatibility');
            }

            // Check for proper structure using VM
            const sandbox = { 
                window: { enhancedCitations: {} }, 
                module: { exports: {} },
                console: { log: () => {} }
            };
            const context = vm.createContext(sandbox);
            
            try {
                vm.runInContext(content, context);
                
                // Check if the enhanced citation object was created
                const enhancedData = Object.values(sandbox.window.enhancedCitations)[0] || sandbox.module.exports;
                if (enhancedData) {
                    result.structure = {
                        hasId: !!enhancedData.id,
                        hasName: !!enhancedData.name,
                        hasCitations: !!enhancedData.citations,
                        hasEvidenceProfile: !!enhancedData.evidenceProfile,
                        hasResearchSummary: !!enhancedData.researchSummary,
                        hasQualityAssurance: !!enhancedData.qualityAssurance
                    };

                    // Validate citation structure
                    if (enhancedData.citations) {
                        const citations = enhancedData.citations;
                        result.citationQuality = {
                            totalSections: Object.keys(citations).length,
                            mechanismsCount: citations.mechanisms ? citations.mechanisms.length : 0,
                            benefitsCount: citations.benefits ? citations.benefits.length : 0,
                            safetyCount: citations.safety ? citations.safety.length : 0,
                            dosageCount: citations.dosage ? citations.dosage.length : 0,
                            totalCitations: Object.values(citations).flat().length
                        };

                        // Validate individual citations have DOIs
                        let doiCount = 0;
                        let pmidCount = 0;
                        
                        Object.values(citations).flat().forEach(citation => {
                            if (citation.doi) doiCount++;
                            if (citation.pmid) pmidCount++;
                        });

                        result.citationQuality.doiCount = doiCount;
                        result.citationQuality.pmidCount = pmidCount;
                        result.citationQuality.doiCoverage = (doiCount / result.citationQuality.totalCitations * 100).toFixed(1);
                    }

                    // Check required structure elements
                    if (!result.structure.hasId) result.errors.push('Missing id field');
                    if (!result.structure.hasName) result.errors.push('Missing name field');
                    if (!result.structure.hasCitations) result.errors.push('Missing citations field');
                    if (!result.structure.hasEvidenceProfile) result.errors.push('Missing evidenceProfile field');
                    
                } else {
                    result.errors.push('Enhanced citation object not found');
                    result.valid = false;
                }
                
            } catch (evalError) {
                result.errors.push(`JavaScript evaluation error: ${evalError.message}`);
                result.valid = false;
            }

        } catch (error) {
            result.errors.push(`File read error: ${error.message}`);
            result.valid = false;
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
            totalSupplements: 0,
            enhancedFlags: 0,
            targetSupplementsFound: 0,
            targetSupplementsEnhanced: 0,
            targetSupplementDetails: {},
            errors: []
        };

        try {
            const supplementsPath = path.join(__dirname, 'data', 'supplements.js');
            if (!fs.existsSync(supplementsPath)) {
                throw new Error('supplements.js not found');
            }

            const content = fs.readFileSync(supplementsPath, 'utf8');
            
            // Create a sandbox to evaluate supplements.js
            const sandbox = { 
                supplementDatabase: null,
                console: { log: () => {} }
            };
            const context = vm.createContext(sandbox);
            
            try {
                vm.runInContext(content, context);
                
                if (sandbox.supplementDatabase && sandbox.supplementDatabase.supplements) {
                    results.supplementsLoaded = true;
                    const supplements = sandbox.supplementDatabase.supplements;
                    results.totalSupplements = supplements.length;
                    
                    // Count enhanced flags
                    results.enhancedFlags = supplements.filter(s => s.isEnhanced === true).length;
                    
                    // Check target supplements
                    for (const targetSupplement of this.targetSupplements) {
                        const found = supplements.find(s => s.id === targetSupplement.id);
                        if (found) {
                            results.targetSupplementsFound++;
                            results.targetSupplementDetails[targetSupplement.name] = {
                                id: found.id,
                                name: found.name,
                                isEnhanced: found.isEnhanced === true,
                                evidenceTier: found.evidenceTier,
                                category: found.category
                            };
                            
                            if (found.isEnhanced === true) {
                                results.targetSupplementsEnhanced++;
                            }
                        } else {
                            results.targetSupplementDetails[targetSupplement.name] = {
                                id: targetSupplement.id,
                                found: false
                            };
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
        console.log(`   ✅ Total supplements: ${results.totalSupplements}`);
        console.log(`   ✅ Supplements with enhanced flags: ${results.enhancedFlags}`);
        console.log(`   ✅ Target supplements found: ${results.targetSupplementsFound}/${this.targetSupplements.length}`);
        console.log(`   ✅ Target supplements enhanced: ${results.targetSupplementsEnhanced}/${this.targetSupplements.length}`);
    }

    /**
     * 3. SPECIFIC SUPPLEMENT VALIDATION
     */
    async validateSpecificSupplements() {
        console.log('🔍 3. VALIDATING SPECIFIC TARGET SUPPLEMENTS...');
        
        const results = {};

        for (const supplement of this.targetSupplements) {
            const supplementResult = {
                databaseEntry: null,
                enhancedFile: null,
                isIntegrated: false,
                issues: []
            };

            // Check database entry
            const dbResults = this.results.databaseIntegration.targetSupplementDetails[supplement.name];
            if (dbResults && dbResults.found !== false) {
                supplementResult.databaseEntry = dbResults;
                
                if (!dbResults.isEnhanced) {
                    supplementResult.issues.push('Database entry missing isEnhanced flag');
                }
            } else {
                supplementResult.issues.push('Not found in database');
            }

            // Check enhanced citation file
            const fileResults = this.results.fileValidation.targetSupplementFiles[supplement.name];
            if (fileResults && fileResults.found) {
                supplementResult.enhancedFile = fileResults;
                
                // Find the specific file details
                const fileDetail = this.results.fileValidation.fileResults.find(f => 
                    f.fileName === fileResults.fileName
                );
                
                if (fileDetail) {
                    supplementResult.enhancedFile.validation = fileDetail;
                    if (!fileDetail.valid) {
                        supplementResult.issues.push('Enhanced citation file has validation errors');
                    }
                }
            } else {
                supplementResult.issues.push('Enhanced citation file not found');
            }

            // Check integration
            if (supplementResult.databaseEntry && supplementResult.databaseEntry.isEnhanced && 
                supplementResult.enhancedFile && supplementResult.enhancedFile.found) {
                supplementResult.isIntegrated = true;
            }

            results[supplement.name] = supplementResult;
        }

        this.results.specificSupplements = results;

        // Summary
        const integrated = Object.values(results).filter(r => r.isIntegrated).length;
        const hasIssues = Object.values(results).filter(r => r.issues.length > 0).length;
        
        console.log(`   ✅ Fully integrated supplements: ${integrated}/${this.targetSupplements.length}`);
        console.log(`   ⚠️  Supplements with issues: ${hasIssues}`);
    }

    /**
     * 4. ERROR DETECTION AND QUALITY ASSESSMENT
     */
    async validateErrorDetection() {
        console.log('🔍 4. VALIDATING ERROR DETECTION AND QUALITY...');
        
        const results = {
            fileErrors: [],
            databaseErrors: [],
            integrationErrors: [],
            qualityMetrics: {},
            totalErrors: 0
        };

        // Collect file validation errors
        if (this.results.fileValidation && this.results.fileValidation.errors) {
            results.fileErrors = this.results.fileValidation.errors;
        }

        // Collect database errors
        if (this.results.databaseIntegration && this.results.databaseIntegration.errors) {
            results.databaseErrors = this.results.databaseIntegration.errors;
        }

        // Collect integration errors from specific supplements
        if (this.results.specificSupplements) {
            Object.entries(this.results.specificSupplements).forEach(([name, data]) => {
                if (data.issues.length > 0) {
                    results.integrationErrors.push(`${name}: ${data.issues.join(', ')}`);
                }
            });
        }

        // Calculate quality metrics
        if (this.results.fileValidation) {
            const fileResults = this.results.fileValidation.fileResults;
            if (fileResults.length > 0) {
                const avgCitations = fileResults
                    .filter(f => f.citationQuality && f.citationQuality.totalCitations)
                    .map(f => f.citationQuality.totalCitations)
                    .reduce((a, b) => a + b, 0) / fileResults.length;
                
                const avgDoiCoverage = fileResults
                    .filter(f => f.citationQuality && f.citationQuality.doiCoverage)
                    .map(f => parseFloat(f.citationQuality.doiCoverage))
                    .reduce((a, b) => a + b, 0) / fileResults.length;

                results.qualityMetrics = {
                    averageCitationsPerFile: avgCitations.toFixed(1),
                    averageDoiCoverage: avgDoiCoverage.toFixed(1) + '%',
                    filesWithValidStructure: fileResults.filter(f => f.valid).length,
                    totalCitationFiles: fileResults.length
                };
            }
        }

        results.totalErrors = results.fileErrors.length + results.databaseErrors.length + results.integrationErrors.length;

        this.results.errorDetection = results;
        console.log(`   ✅ Total errors detected: ${results.totalErrors}`);
        console.log(`   📊 Average citations per file: ${results.qualityMetrics.averageCitationsPerFile || 'N/A'}`);
        console.log(`   📊 Average DOI coverage: ${results.qualityMetrics.averageDoiCoverage || 'N/A'}`);
    }

    /**
     * 5. GENERATE COMPREHENSIVE REPORT
     */
    generateValidationReport() {
        console.log('📊 GENERATING COMPREHENSIVE VALIDATION REPORT...');
        
        const testDuration = Date.now() - this.testStartTime;
        
        const summary = {
            timestamp: new Date().toISOString(),
            testDuration: `${(testDuration / 1000).toFixed(1)}s`,
            overallStatus: 'PASSED',
            criticalIssues: 0,
            warnings: 0,
            recommendations: [],
            integrationScore: 0
        };

        // Evaluate overall status
        const issues = [];
        
        // File validation issues
        if (this.results.fileValidation) {
            const fv = this.results.fileValidation;
            if (fv.invalidFiles > 0) {
                issues.push(`${fv.invalidFiles} invalid enhanced citation files`);
                summary.criticalIssues++;
            }
            
            const targetFilesMissing = Object.values(fv.targetSupplementFiles || {}).filter(f => !f.found).length;
            if (targetFilesMissing > 0) {
                issues.push(`${targetFilesMissing} target supplements missing enhanced citation files`);
                summary.criticalIssues++;
            }
        }

        // Database integration issues
        if (this.results.databaseIntegration) {
            const db = this.results.databaseIntegration;
            if (db.targetSupplementsEnhanced < this.targetSupplements.length) {
                const missing = this.targetSupplements.length - db.targetSupplementsEnhanced;
                issues.push(`${missing} target supplements missing enhanced flags in database`);
                summary.criticalIssues++;
            }
        }

        // Integration issues
        if (this.results.specificSupplements) {
            const integratedCount = Object.values(this.results.specificSupplements).filter(s => s.isIntegrated).length;
            summary.integrationScore = ((integratedCount / this.targetSupplements.length) * 100).toFixed(1);
            
            if (integratedCount < this.targetSupplements.length) {
                const missing = this.targetSupplements.length - integratedCount;
                if (missing > 2) {
                    issues.push(`${missing} supplements not fully integrated`);
                    summary.criticalIssues++;
                } else {
                    summary.warnings++;
                    summary.recommendations.push(`Complete integration for ${missing} remaining supplements`);
                }
            }
        }

        // Quality warnings
        if (this.results.errorDetection && this.results.errorDetection.qualityMetrics) {
            const qm = this.results.errorDetection.qualityMetrics;
            const doiCoverage = parseFloat(qm.averageDoiCoverage);
            if (doiCoverage < 90) {
                summary.warnings++;
                summary.recommendations.push('Improve DOI coverage in citation files');
            }
        }

        // Error threshold
        if (this.results.errorDetection && this.results.errorDetection.totalErrors > 5) {
            issues.push(`${this.results.errorDetection.totalErrors} total errors detected`);
            summary.criticalIssues++;
        }

        // Determine overall status
        if (summary.criticalIssues > 0) {
            summary.overallStatus = 'FAILED';
        } else if (summary.warnings > 0 || issues.length > 0) {
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
                timestamp: summary.timestamp,
                targetSupplements: this.targetSupplements
            }
        };

        // Save report to file
        const reportPath = path.join(__dirname, 'enhanced-citations-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Generate markdown summary
        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(__dirname, 'enhanced-citations-validation-report.md');
        fs.writeFileSync(markdownPath, markdownReport);

        // Console summary
        console.log('\n🎯 VALIDATION SUMMARY');
        console.log('===================');
        console.log(`Status: ${summary.overallStatus}`);
        console.log(`Duration: ${summary.testDuration}`);
        console.log(`Integration Score: ${summary.integrationScore}%`);
        console.log(`Critical Issues: ${summary.criticalIssues}`);
        console.log(`Warnings: ${summary.warnings}`);
        
        if (issues.length > 0) {
            console.log('\nIssues Found:');
            issues.forEach(issue => console.log(`  ❌ ${issue}`));
        }

        if (summary.recommendations.length > 0) {
            console.log('\nRecommendations:');
            summary.recommendations.forEach(rec => console.log(`  💡 ${rec}`));
        }

        console.log(`\nDetailed report saved to:`);
        console.log(`  📄 JSON: ${reportPath}`);
        console.log(`  📝 Markdown: ${markdownPath}`);
        
        return report;
    }

    generateMarkdownReport(report) {
        const s = report.summary;
        const timestamp = new Date().toLocaleString();
        
        let markdown = `# Enhanced Citations Integration Validation Report

**Generated:** ${timestamp}  
**Status:** ${s.overallStatus}  
**Integration Score:** ${s.integrationScore}%  
**Duration:** ${s.testDuration}

## Summary

`;

        if (s.overallStatus === 'PASSED') {
            markdown += '✅ **VALIDATION PASSED** - Enhanced citations integration is working properly.\n\n';
        } else if (s.overallStatus === 'PASSED_WITH_WARNINGS') {
            markdown += '⚠️ **VALIDATION PASSED WITH WARNINGS** - Integration working but improvements recommended.\n\n';
        } else {
            markdown += '❌ **VALIDATION FAILED** - Critical issues found requiring attention.\n\n';
        }

        // Issues
        if (s.issues.length > 0) {
            markdown += '## Issues Found\n\n';
            s.issues.forEach(issue => {
                markdown += `- ❌ ${issue}\n`;
            });
            markdown += '\n';
        }

        // Recommendations
        if (s.recommendations.length > 0) {
            markdown += '## Recommendations\n\n';
            s.recommendations.forEach(rec => {
                markdown += `- 💡 ${rec}\n`;
            });
            markdown += '\n';
        }

        // Test Results
        markdown += '## Test Results\n\n';
        
        // File validation
        if (report.fileValidation) {
            const fv = report.fileValidation;
            markdown += `### Enhanced Citation Files\n`;
            markdown += `- **Total Files:** ${fv.totalFiles}\n`;
            markdown += `- **Valid Files:** ${fv.validFiles}\n`;
            markdown += `- **Invalid Files:** ${fv.invalidFiles}\n`;
            markdown += `- **Target Supplement Files Found:** ${Object.values(fv.targetSupplementFiles || {}).filter(f => f.found).length}/${this.targetSupplements.length}\n\n`;
        }

        // Database integration
        if (report.databaseIntegration) {
            const db = report.databaseIntegration;
            markdown += `### Database Integration\n`;
            markdown += `- **Total Supplements:** ${db.totalSupplements}\n`;
            markdown += `- **Enhanced Flags:** ${db.enhancedFlags}\n`;
            markdown += `- **Target Supplements Found:** ${db.targetSupplementsFound}/${this.targetSupplements.length}\n`;
            markdown += `- **Target Supplements Enhanced:** ${db.targetSupplementsEnhanced}/${this.targetSupplements.length}\n\n`;
        }

        // Specific supplements
        if (report.specificSupplements) {
            markdown += `### Target Supplements Status\n\n`;
            markdown += `| Supplement | Database | Enhanced File | Integrated | Issues |\n`;
            markdown += `|------------|----------|---------------|------------|--------|\n`;
            
            Object.entries(report.specificSupplements).forEach(([name, data]) => {
                const dbStatus = data.databaseEntry ? '✅' : '❌';
                const fileStatus = data.enhancedFile && data.enhancedFile.found ? '✅' : '❌';
                const integrated = data.isIntegrated ? '✅' : '❌';
                const issues = data.issues.length > 0 ? data.issues.length : '-';
                
                markdown += `| ${name} | ${dbStatus} | ${fileStatus} | ${integrated} | ${issues} |\n`;
            });
            markdown += '\n';
        }

        // Quality metrics
        if (report.errorDetection && report.errorDetection.qualityMetrics) {
            const qm = report.errorDetection.qualityMetrics;
            markdown += `### Quality Metrics\n`;
            markdown += `- **Average Citations per File:** ${qm.averageCitationsPerFile}\n`;
            markdown += `- **Average DOI Coverage:** ${qm.averageDoiCoverage}\n`;
            markdown += `- **Files with Valid Structure:** ${qm.filesWithValidStructure}/${qm.totalCitationFiles}\n\n`;
        }

        markdown += `## Next Steps\n\n`;
        
        if (s.overallStatus === 'PASSED') {
            markdown += `1. ✅ Enhanced citations integration is complete and functional\n`;
            markdown += `2. 🚀 System ready for production use\n`;
            markdown += `3. 📊 Monitor performance metrics in production\n`;
        } else {
            markdown += `1. 🔧 Address critical issues listed above\n`;
            markdown += `2. 🔄 Re-run validation after fixes\n`;
            markdown += `3. 📋 Review integration completeness\n`;
        }

        return markdown;
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
            await this.validateSpecificSupplements();
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