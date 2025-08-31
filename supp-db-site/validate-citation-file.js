#!/usr/bin/env node

/**
 * Citation File Validator
 * 
 * Usage: node validate-citation-file.js path/to/citation/file.js
 * 
 * This script validates enhanced citation files for:
 * - Data structure compliance
 * - Required field presence
 * - Citation quality standards
 * - Integration compatibility
 */

const fs = require('fs');
const path = require('path');

class CitationValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    validate(filePath) {
        console.log(`🔍 Validating citation file: ${filePath}`);
        console.log('='.repeat(60));

        // Check file exists
        if (!fs.existsSync(filePath)) {
            this.errors.push(`File not found: ${filePath}`);
            return this.getResults();
        }

        // Check file syntax
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            // Basic syntax check
            this.validateSyntax(fileContent);
            
            // Load and validate data structure
            const citationData = this.loadCitationData(filePath);
            if (citationData) {
                this.validateDataStructure(citationData);
                this.validateCitationQuality(citationData);
                this.validateIntegrationCompatibility(citationData, filePath);
            }
            
        } catch (error) {
            this.errors.push(`Failed to process file: ${error.message}`);
        }

        return this.getResults();
    }

    validateSyntax(fileContent) {
        // Check for data assignment (either const declaration or window assignment)
        const hasConstDeclaration = fileContent.includes('const ') || fileContent.includes('var ') || fileContent.includes('let ');
        const hasWindowAssignment = fileContent.includes('window.enhancedCitations[');

        if (!hasConstDeclaration && !hasWindowAssignment) {
            this.errors.push('No variable declaration or window assignment found');
        }

        if (!fileContent.includes('window.enhancedCitations')) {
            this.warnings.push('Missing global registration code');
        }

        // Module export is optional for window-based files
        if (hasConstDeclaration && !fileContent.includes('module.exports')) {
            this.warnings.push('Missing module export for Node.js compatibility');
        }

        // Check for potential issues
        if (fileContent.includes('undefined')) {
            this.warnings.push('File contains "undefined" - may cause display issues');
        }

        if (fileContent.includes('null')) {
            this.warnings.push('File contains "null" values - verify intentional');
        }
    }

    loadCitationData(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // Try to extract data object - handle both formats
            let match = fileContent.match(/const\s+(\w+)\s*=\s*({[\s\S]*?});/);
            let objectString = null;

            if (match) {
                // Format: const supplementEnhanced = { ... };
                objectString = match[2];
            } else {
                // Format: window.enhancedCitations[8] = { ... };
                match = fileContent.match(/window\.enhancedCitations\[\d+\]\s*=\s*({[\s\S]*?});/);
                if (match) {
                    objectString = match[1];
                } else {
                    this.errors.push('Could not find citation data object in either const or window format');
                    return null;
                }
            }

            // Evaluate the object safely
            const citationData = eval(`(${objectString})`);

            this.info.push(`Loaded citation data for: ${citationData.supplementName || 'Unknown'}`);
            return citationData;

        } catch (error) {
            this.errors.push(`Failed to load citation data: ${error.message}`);
            return null;
        }
    }

    validateDataStructure(data) {
        // Required top-level fields
        const requiredFields = {
            'supplementId': 'number',
            'supplementName': 'string',
            'isEnhanced': 'boolean',
            'citations': 'object'
        };

        Object.entries(requiredFields).forEach(([field, type]) => {
            if (!(field in data)) {
                this.errors.push(`Missing required field: ${field}`);
            } else if (typeof data[field] !== type) {
                this.errors.push(`Field ${field} should be ${type}, got ${typeof data[field]}`);
            }
        });

        // Recommended fields
        const recommendedFields = ['version', 'lastUpdated', 'evidenceProfile'];
        recommendedFields.forEach(field => {
            if (!(field in data)) {
                this.warnings.push(`Missing recommended field: ${field}`);
            }
        });

        // Validate citations structure
        if (data.citations) {
            const sections = ['mechanisms', 'benefits', 'safety'];
            sections.forEach(section => {
                if (!(section in data.citations)) {
                    this.warnings.push(`Missing citation section: ${section}`);
                } else if (!Array.isArray(data.citations[section])) {
                    this.errors.push(`Citation section ${section} must be an array`);
                } else {
                    this.validateCitationSection(data.citations[section], section);
                }
            });
        }
    }

    validateCitationSection(citations, sectionName) {
        if (citations.length === 0) {
            this.warnings.push(`Empty citation section: ${sectionName}`);
            return;
        }

        citations.forEach((citation, index) => {
            this.validateCitationItem(citation, sectionName, index);
        });

        // Section-specific recommendations
        const recommendations = {
            mechanisms: { min: 2, max: 8, recommended: '3-5' },
            benefits: { min: 3, max: 12, recommended: '5-8' },
            safety: { min: 1, max: 5, recommended: '2-3' }
        };

        const rec = recommendations[sectionName];
        if (rec) {
            if (citations.length < rec.min) {
                this.warnings.push(`${sectionName} has ${citations.length} citations, minimum recommended: ${rec.min}`);
            } else if (citations.length > rec.max) {
                this.warnings.push(`${sectionName} has ${citations.length} citations, maximum recommended: ${rec.max}`);
            } else {
                this.info.push(`${sectionName}: ${citations.length} citations (recommended: ${rec.recommended})`);
            }
        }
    }

    validateCitationItem(citation, sectionName, index) {
        const prefix = `${sectionName}[${index}]`;

        // Check for required claim or title
        if (!citation.claim && !citation.title) {
            this.errors.push(`${prefix}: Missing claim or title`);
        }

        // Validate studies array
        if (citation.studies) {
            if (!Array.isArray(citation.studies)) {
                this.errors.push(`${prefix}: studies must be an array`);
            } else if (citation.studies.length === 0) {
                this.warnings.push(`${prefix}: Empty studies array`);
            } else {
                citation.studies.forEach((study, studyIndex) => {
                    this.validateStudy(study, `${prefix}.studies[${studyIndex}]`);
                });
            }
        } else {
            this.warnings.push(`${prefix}: No studies provided`);
        }

        // Section-specific validations
        if (sectionName === 'benefits') {
            if (!citation.healthDomain) {
                this.warnings.push(`${prefix}: Missing healthDomain for categorization`);
            }
            if (!citation.strength) {
                this.warnings.push(`${prefix}: Missing evidence strength rating`);
            }
        }

        if (sectionName === 'mechanisms') {
            if (!citation.mechanismType) {
                this.warnings.push(`${prefix}: Missing mechanismType`);
            }
        }

        if (sectionName === 'safety') {
            if (!citation.safetyAspect) {
                this.warnings.push(`${prefix}: Missing safetyAspect`);
            }
            if (!citation.riskLevel) {
                this.warnings.push(`${prefix}: Missing riskLevel`);
            }
        }
    }

    validateStudy(study, prefix) {
        const requiredFields = ['title', 'authors', 'year', 'journal'];
        requiredFields.forEach(field => {
            if (!study[field]) {
                this.errors.push(`${prefix}: Missing required field: ${field}`);
            }
        });

        // Validate specific field types
        if (study.authors && !Array.isArray(study.authors)) {
            this.errors.push(`${prefix}: authors must be an array`);
        }

        if (study.year && (typeof study.year !== 'number' || study.year < 1950 || study.year > new Date().getFullYear())) {
            this.errors.push(`${prefix}: Invalid year: ${study.year}`);
        }

        // Quality indicators
        if (!study.pmid && !study.doi) {
            this.warnings.push(`${prefix}: Missing PMID and DOI - reduces citation quality`);
        }

        if (study.year && study.year < 2010) {
            this.warnings.push(`${prefix}: Study from ${study.year} - consider more recent research`);
        }

        if (!study.findings) {
            this.warnings.push(`${prefix}: Missing findings summary`);
        }
    }

    validateCitationQuality(data) {
        let totalStudies = 0;
        let studiesWithPMID = 0;
        let studiesWithDOI = 0;
        let recentStudies = 0;

        const sections = ['mechanisms', 'benefits', 'safety'];
        sections.forEach(section => {
            const citations = data.citations?.[section] || [];
            citations.forEach(citation => {
                const studies = citation.studies || [];
                studies.forEach(study => {
                    totalStudies++;
                    if (study.pmid) studiesWithPMID++;
                    if (study.doi) studiesWithDOI++;
                    if (study.year >= 2015) recentStudies++;
                });
            });
        });

        if (totalStudies > 0) {
            const pmidRate = Math.round((studiesWithPMID / totalStudies) * 100);
            const doiRate = Math.round((studiesWithDOI / totalStudies) * 100);
            const recentRate = Math.round((recentStudies / totalStudies) * 100);

            this.info.push(`Citation Quality Metrics:`);
            this.info.push(`  • Total studies: ${totalStudies}`);
            this.info.push(`  • Studies with PMID: ${pmidRate}%`);
            this.info.push(`  • Studies with DOI: ${doiRate}%`);
            this.info.push(`  • Recent studies (2015+): ${recentRate}%`);

            if (pmidRate < 50) {
                this.warnings.push('Low PMID coverage - consider adding more PubMed indexed studies');
            }
            if (recentRate < 60) {
                this.warnings.push('Consider adding more recent studies (2015+)');
            }
        }
    }

    validateIntegrationCompatibility(data, filePath) {
        // Check file naming convention
        const fileName = path.basename(filePath);
        const expectedPattern = /^\d+_[a-z_]+_enhanced\.js$/;
        
        if (!expectedPattern.test(fileName)) {
            this.warnings.push(`File name doesn't follow convention: {id}_{name}_enhanced.js`);
        }

        // Extract ID from filename and compare
        const fileIdMatch = fileName.match(/^(\d+)_/);
        if (fileIdMatch) {
            const fileId = parseInt(fileIdMatch[1]);
            if (data.supplementId !== fileId) {
                this.errors.push(`Supplement ID mismatch: filename has ${fileId}, data has ${data.supplementId}`);
            }
        }

        // Check for global registration
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (!fileContent.includes(`window.enhancedCitations[${data.supplementId}]`)) {
            this.warnings.push('Missing or incorrect global registration code');
        }
    }

    getResults() {
        return {
            errors: this.errors,
            warnings: this.warnings,
            info: this.info,
            isValid: this.errors.length === 0
        };
    }
}

// CLI Usage
if (require.main === module) {
    const filePath = process.argv[2];
    
    if (!filePath) {
        console.error('Usage: node validate-citation-file.js <path-to-citation-file>');
        process.exit(1);
    }

    const validator = new CitationValidator();
    const results = validator.validate(filePath);

    // Display results
    if (results.info.length > 0) {
        console.log('\n📊 Information:');
        results.info.forEach(info => console.log(`  ℹ️  ${info}`));
    }

    if (results.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        results.warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
    }

    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  ❌ ${error}`));
    }

    console.log('\n' + '='.repeat(60));
    if (results.isValid) {
        console.log('✅ Citation file is valid and ready for integration!');
        process.exit(0);
    } else {
        console.log(`❌ Citation file has ${results.errors.length} error(s) that must be fixed.`);
        process.exit(1);
    }
}

module.exports = CitationValidator;
