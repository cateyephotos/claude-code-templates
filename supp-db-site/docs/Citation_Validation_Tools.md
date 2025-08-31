# Citation Validation Tools & Automated Testing

## Overview

This document provides automated validation tools and testing scripts to ensure citation data quality and system compatibility before integration.

## Validation Scripts

### 1. Data Structure Validator

```javascript
// validate-citation-structure.js
function validateCitationStructure(citationData) {
    const errors = [];
    const warnings = [];
    
    // Required top-level fields
    const requiredFields = ['supplementId', 'supplementName', 'isEnhanced', 'citations'];
    requiredFields.forEach(field => {
        if (!citationData[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    });
    
    // Validate supplement ID
    if (typeof citationData.supplementId !== 'number') {
        errors.push('supplementId must be a number');
    }
    
    // Validate citations structure
    if (citationData.citations) {
        const sections = ['mechanisms', 'benefits', 'safety'];
        sections.forEach(section => {
            if (citationData.citations[section]) {
                if (!Array.isArray(citationData.citations[section])) {
                    errors.push(`${section} must be an array`);
                } else {
                    citationData.citations[section].forEach((item, index) => {
                        const itemErrors = validateCitationItem(item, section, index);
                        errors.push(...itemErrors);
                    });
                }
            }
        });
    }
    
    return { errors, warnings };
}

function validateCitationItem(item, section, index) {
    const errors = [];
    
    // Common required fields
    if (!item.claim && !item.title) {
        errors.push(`${section}[${index}]: Missing claim or title`);
    }
    
    // Validate studies array
    if (item.studies && Array.isArray(item.studies)) {
        item.studies.forEach((study, studyIndex) => {
            if (!study.title) {
                errors.push(`${section}[${index}].studies[${studyIndex}]: Missing title`);
            }
            if (!study.authors || !Array.isArray(study.authors)) {
                errors.push(`${section}[${index}].studies[${studyIndex}]: Missing or invalid authors array`);
            }
            if (!study.year || typeof study.year !== 'number') {
                errors.push(`${section}[${index}].studies[${studyIndex}]: Missing or invalid year`);
            }
            if (!study.journal) {
                errors.push(`${section}[${index}].studies[${studyIndex}]: Missing journal`);
            }
        });
    }
    
    return errors;
}

// Usage
const citationData = require('./path/to/citation/file.js');
const validation = validateCitationStructure(citationData);

if (validation.errors.length > 0) {
    console.error('❌ Validation Errors:');
    validation.errors.forEach(error => console.error(`  • ${error}`));
} else {
    console.log('✅ Citation structure is valid');
}
```

### 2. Citation Quality Checker

```javascript
// check-citation-quality.js
function checkCitationQuality(citationData) {
    const qualityReport = {
        score: 0,
        maxScore: 0,
        issues: [],
        recommendations: []
    };
    
    // Check evidence profile
    if (citationData.evidenceProfile) {
        qualityReport.maxScore += 20;
        if (citationData.evidenceProfile.studyCount >= 10) {
            qualityReport.score += 10;
        } else if (citationData.evidenceProfile.studyCount >= 5) {
            qualityReport.score += 5;
        }
        
        if (citationData.evidenceProfile.metaAnalyses > 0) {
            qualityReport.score += 10;
        }
    } else {
        qualityReport.issues.push('Missing evidence profile');
    }
    
    // Check citation completeness
    const sections = ['mechanisms', 'benefits', 'safety'];
    sections.forEach(section => {
        qualityReport.maxScore += 20;
        const citations = citationData.citations?.[section] || [];
        
        if (citations.length === 0) {
            qualityReport.issues.push(`No ${section} citations provided`);
        } else if (citations.length < 3) {
            qualityReport.score += 5;
            qualityReport.recommendations.push(`Consider adding more ${section} citations`);
        } else {
            qualityReport.score += 20;
        }
    });
    
    // Check study quality indicators
    qualityReport.maxScore += 40;
    let studyQualityScore = 0;
    
    sections.forEach(section => {
        const citations = citationData.citations?.[section] || [];
        citations.forEach(citation => {
            const studies = citation.studies || [];
            studies.forEach(study => {
                if (study.pmid) studyQualityScore += 2;
                if (study.doi) studyQualityScore += 2;
                if (study.year >= 2020) studyQualityScore += 1;
                if (study.journal && study.journal.includes('Nature') || 
                    study.journal.includes('Science') || 
                    study.journal.includes('Lancet')) {
                    studyQualityScore += 3;
                }
            });
        });
    });
    
    qualityReport.score += Math.min(studyQualityScore, 40);
    
    // Calculate percentage
    qualityReport.percentage = Math.round((qualityReport.score / qualityReport.maxScore) * 100);
    
    return qualityReport;
}

// Usage
const qualityReport = checkCitationQuality(citationData);
console.log(`📊 Citation Quality Score: ${qualityReport.percentage}%`);
if (qualityReport.issues.length > 0) {
    console.log('⚠️ Issues:');
    qualityReport.issues.forEach(issue => console.log(`  • ${issue}`));
}
```

### 3. Integration Test Suite

```javascript
// integration-test-suite.js
const { chromium } = require('playwright');

class CitationIntegrationTester {
    constructor() {
        this.browser = null;
        this.page = null;
    }
    
    async setup() {
        this.browser = await chromium.launch({ headless: false });
        this.page = await this.browser.newPage();
        await this.page.goto('http://localhost:3000');
        await this.page.waitForTimeout(3000);
    }
    
    async teardown() {
        if (this.browser) {
            await this.browser.close();
        }
    }
    
    async testSupplement(supplementId, supplementName) {
        const results = {
            supplementId,
            supplementName,
            passed: true,
            tests: {}
        };
        
        try {
            // Test 1: Data Loading
            results.tests.dataLoading = await this.testDataLoading(supplementId);
            
            // Test 2: Modal Functionality
            results.tests.modalFunctionality = await this.testModalFunctionality(supplementId, supplementName);
            
            // Test 3: Tab Separation
            results.tests.tabSeparation = await this.testTabSeparation(supplementId);
            
            // Test 4: Citation Quality
            results.tests.citationQuality = await this.testCitationQuality(supplementId);
            
            // Overall result
            results.passed = Object.values(results.tests).every(test => test.passed);
            
        } catch (error) {
            results.passed = false;
            results.error = error.message;
        }
        
        return results;
    }
    
    async testDataLoading(supplementId) {
        const dataCheck = await this.page.evaluate((id) => {
            const data = window.enhancedCitations?.[id];
            return {
                hasData: !!data,
                hasRequiredFields: !!(data?.supplementId && data?.supplementName && data?.citations),
                mechanismsCount: data?.citations?.mechanisms?.length || 0,
                benefitsCount: data?.citations?.benefits?.length || 0,
                safetyCount: data?.citations?.safety?.length || 0
            };
        }, supplementId);
        
        return {
            passed: dataCheck.hasData && dataCheck.hasRequiredFields,
            details: dataCheck
        };
    }
    
    async testModalFunctionality(supplementId, supplementName) {
        try {
            await this.page.fill('#searchInput', supplementName);
            await this.page.waitForTimeout(1000);
            
            const modalResult = await this.page.evaluate(async (id) => {
                try {
                    await window.app.showSupplementDetails(id);
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }, supplementId);
            
            await this.page.waitForTimeout(1000);
            
            return {
                passed: modalResult.success,
                details: modalResult
            };
        } catch (error) {
            return {
                passed: false,
                details: { error: error.message }
            };
        }
    }
    
    async testTabSeparation(supplementId) {
        const expectedCounts = await this.page.evaluate((id) => {
            const data = window.enhancedCitations?.[id];
            return {
                mechanisms: data?.citations?.mechanisms?.length || 0,
                benefits: data?.citations?.benefits?.length || 0,
                safety: data?.citations?.safety?.length || 0
            };
        }, supplementId);
        
        const actualCounts = {};
        const tabs = ['Mechanisms', 'Benefits', 'Safety'];
        
        for (const tab of tabs) {
            const tabElement = await this.page.locator('.citation-tab-btn').filter({ hasText: tab });
            if (await tabElement.count() > 0) {
                await tabElement.click();
                await this.page.waitForTimeout(500);
                
                actualCounts[tab.toLowerCase().slice(0, -1)] = await this.page.evaluate((id, tabType) => {
                    const container = document.getElementById(`${tabType}-${id}`);
                    return container ? container.querySelectorAll('.enhanced-citation-card').length : 0;
                }, supplementId, tab.toLowerCase().slice(0, -1));
            }
        }
        
        const matches = {
            mechanisms: actualCounts.mechanism === expectedCounts.mechanisms,
            benefits: actualCounts.benefit === expectedCounts.benefits,
            safety: actualCounts.safety === expectedCounts.safety
        };
        
        return {
            passed: Object.values(matches).every(match => match),
            details: { expected: expectedCounts, actual: actualCounts, matches }
        };
    }
    
    async testCitationQuality(supplementId) {
        const qualityCheck = await this.page.evaluate((id) => {
            const benefitsContainer = document.getElementById(`benefits-${id}`);
            if (!benefitsContainer) return { error: 'Benefits container not found' };
            
            const cards = Array.from(benefitsContainer.querySelectorAll('.enhanced-citation-card'));
            const issues = [];
            
            cards.forEach((card, index) => {
                const text = card.textContent;
                const title = card.querySelector('h5')?.textContent?.trim();
                
                if (text.includes('undefined')) {
                    issues.push(`Card ${index + 1}: Contains undefined values`);
                }
                if (!title || title.length < 10) {
                    issues.push(`Card ${index + 1}: Poor or missing title`);
                }
                if (!text.includes('(') || !text.match(/\(\d{4}\)/)) {
                    issues.push(`Card ${index + 1}: Missing publication year`);
                }
            });
            
            return {
                cardCount: cards.length,
                issues: issues,
                hasQualityIssues: issues.length > 0
            };
        }, supplementId);
        
        return {
            passed: !qualityCheck.hasQualityIssues,
            details: qualityCheck
        };
    }
}

// Usage
async function runIntegrationTests(supplements) {
    const tester = new CitationIntegrationTester();
    await tester.setup();
    
    const results = [];
    
    for (const supplement of supplements) {
        console.log(`🔍 Testing ${supplement.name}...`);
        const result = await tester.testSupplement(supplement.id, supplement.name);
        results.push(result);
        
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${supplement.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
        
        if (!result.passed) {
            Object.entries(result.tests).forEach(([testName, testResult]) => {
                if (!testResult.passed) {
                    console.log(`  ❌ ${testName}: ${JSON.stringify(testResult.details)}`);
                }
            });
        }
    }
    
    await tester.teardown();
    
    // Summary
    const passedCount = results.filter(r => r.passed).length;
    console.log(`\n📊 Integration Test Results: ${passedCount}/${results.length} passed`);
    
    return results;
}

// Export for use
module.exports = { CitationIntegrationTester, runIntegrationTests };
```

## Automated Quality Gates

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running citation validation..."

# Find modified enhanced citation files
CITATION_FILES=$(git diff --cached --name-only | grep "_enhanced\.js$")

if [ -n "$CITATION_FILES" ]; then
    echo "📋 Validating citation files:"
    for file in $CITATION_FILES; do
        echo "  • $file"
        
        # Syntax check
        node -c "$file"
        if [ $? -ne 0 ]; then
            echo "❌ Syntax error in $file"
            exit 1
        fi
        
        # Structure validation
        node validate-citation-structure.js "$file"
        if [ $? -ne 0 ]; then
            echo "❌ Structure validation failed for $file"
            exit 1
        fi
    done
    
    echo "✅ All citation files validated successfully"
fi

exit 0
```

### Continuous Integration Pipeline

```yaml
# .github/workflows/citation-validation.yml
name: Citation Validation

on:
  pull_request:
    paths:
      - 'data/enhanced_citations/**'

jobs:
  validate-citations:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm install
    
    - name: Validate citation structure
      run: |
        for file in data/enhanced_citations/*_enhanced.js; do
          echo "Validating $file"
          node validate-citation-structure.js "$file"
        done
    
    - name: Run integration tests
      run: |
        npm start &
        sleep 10
        node integration-test-suite.js
```

## Best Practices Summary

1. **Always validate before committing**
2. **Run integration tests after changes**
3. **Monitor citation quality scores**
4. **Use automated tools to catch issues early**
5. **Document any new validation patterns**

These tools ensure consistent quality and prevent integration issues before they reach production.
