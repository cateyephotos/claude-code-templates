# Enhanced Citation System Integration Guide

## Overview

This document provides comprehensive technical specifications for acquiring, structuring, and integrating citation resources into the Enhanced Citation System. Following these guidelines ensures compatibility, data quality, and proper rendering across all supplement profiles.

## Table of Contents

1. [Data Structure Specifications](#data-structure-specifications)
2. [Citation Acquisition Guidelines](#citation-acquisition-guidelines)
3. [File Creation Process](#file-creation-process)
4. [Quality Assurance Checklist](#quality-assurance-checklist)
5. [Integration Testing](#integration-testing)
6. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## Data Structure Specifications

### 1. Primary Data Format (Recommended)

The Enhanced Citation System uses a standardized JSON structure with the following schema:

```javascript
const supplementEnhanced = {
    supplementId: 8,                    // Must match supplement ID in main database
    supplementName: "Melatonin",        // Exact name match required
    isEnhanced: true,                   // Always true for enhanced citations
    version: "2.1",                     // Version for tracking updates
    lastUpdated: "2024-01-15",         // ISO date format
    
    evidenceProfile: {
        overallStrength: "Strong",      // Strong | Moderate | Limited | Weak
        studyCount: 45,                 // Total number of studies
        metaAnalyses: 8,               // Number of meta-analyses
        clinicalTrials: 23,            // Number of clinical trials
        qualityScore: 87               // 0-100 quality assessment
    },
    
    citations: {
        mechanisms: [/* Mechanism objects */],
        benefits: [/* Benefit objects */],
        safety: [/* Safety objects */]
    }
};
```

### 2. Mechanism Citation Structure

```javascript
{
    claim: "MT1 and MT2 melatonin receptor activation regulates circadian rhythms",
    mechanismType: "Receptor binding",
    strength: "Strong",                 // Strong | Moderate | Limited
    tissueTarget: "Pineal gland",
    description: "Detailed mechanism description",
    studies: [
        {
            title: "Melatonin receptor signaling pathways",
            authors: ["Smith, J.", "Johnson, A."],
            year: 2023,
            journal: "Nature Neuroscience",
            pmid: "12345678",
            doi: "10.1038/nn.2023.001",
            findings: "Study demonstrated specific receptor binding patterns"
        }
    ]
}
```

### 3. Benefit Citation Structure

```javascript
{
    claim: "Significantly improves sleep quality as measured by validated scales",
    healthDomain: "Sleep Quality",      // For categorization
    strength: "Strong",                 // Evidence strength
    evidenceQuality: "High",           // High | Moderate | Low
    replicationStatus: "Well-replicated",
    studies: [
        {
            title: "Melatonin for sleep disorders: systematic review",
            authors: ["Brown, K.", "Wilson, M."],
            year: 2023,
            journal: "Sleep Medicine Reviews",
            pmid: "87654321",
            doi: "10.1016/j.smrv.2023.001",
            findings: "Meta-analysis of 15 RCTs showed significant improvement"
        }
    ]
}
```

### 4. Safety Citation Structure

```javascript
{
    claim: "Generally well-tolerated with minimal side effects in clinical studies",
    safetyAspect: "General Safety",     // General Safety | Drug Interactions | Dosage Safety
    riskLevel: "Low",                   // Low | Moderate | High
    studies: [
        {
            title: "Safety profile of melatonin supplementation",
            authors: ["Davis, R.", "Miller, S."],
            year: 2023,
            journal: "Clinical Pharmacology",
            pmid: "11223344",
            doi: "10.1002/cpt.2023.001",
            findings: "No serious adverse events reported in 500+ participants"
        }
    ]
}
```

---

## Citation Acquisition Guidelines

### 1. Research Sources Priority

**Primary Sources (Highest Priority):**
- PubMed/MEDLINE indexed journals
- Cochrane systematic reviews
- Meta-analyses and systematic reviews
- Randomized controlled trials (RCTs)

**Secondary Sources:**
- Peer-reviewed observational studies
- Clinical case studies
- Regulatory agency reports (FDA, EMA, Health Canada)

**Avoid:**
- Non-peer-reviewed sources
- Manufacturer-sponsored studies without independent validation
- Anecdotal reports or testimonials

### 2. Study Selection Criteria

**Inclusion Criteria:**
- Published in peer-reviewed journals
- Human studies preferred (animal studies for mechanisms only)
- Sample size ≥20 participants (for clinical studies)
- Clear methodology and statistical analysis
- Available PMID or DOI

**Quality Indicators:**
- Impact factor ≥1.0 for journal
- Clear conflict of interest disclosure
- Appropriate statistical methods
- Reproducible methodology

### 3. Data Extraction Standards

**Required Fields:**
- `title`: Complete study title
- `authors`: Array of author names (Last, F. format)
- `year`: Publication year (integer)
- `journal`: Full journal name
- `pmid`: PubMed ID (string, if available)
- `doi`: Digital Object Identifier (string, if available)
- `findings`: 1-2 sentence summary of key findings

**Optional Fields:**
- `volume`: Journal volume
- `issue`: Journal issue
- `pages`: Page range
- `studyType`: RCT | Meta-analysis | Systematic Review | Observational
- `sampleSize`: Number of participants

---

## File Creation Process

### 1. File Naming Convention

```
{supplementId}_{supplement_name}_enhanced.js
```

Examples:
- `8_melatonin_enhanced.js`
- `37_zinc_enhanced.js`
- `50_caffeine_enhanced.js`

### 2. File Template

```javascript
// Enhanced Citation Data for [Supplement Name]
// Generated: [Date]
// Version: [Version Number]

const [supplementName]Enhanced = {
    supplementId: [ID],
    supplementName: "[Exact Name]",
    isEnhanced: true,
    version: "[Version]",
    lastUpdated: "[YYYY-MM-DD]",
    
    evidenceProfile: {
        overallStrength: "[Strength]",
        studyCount: [Number],
        metaAnalyses: [Number],
        clinicalTrials: [Number],
        qualityScore: [0-100]
    },
    
    citations: {
        mechanisms: [
            // Mechanism objects here
        ],
        benefits: [
            // Benefit objects here
        ],
        safety: [
            // Safety objects here
        ]
    }
};

// Register with global citation system
if (typeof window !== 'undefined' && window.enhancedCitations) {
    window.enhancedCitations[[ID]] = [supplementName]Enhanced;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = [supplementName]Enhanced;
}
```

### 3. Integration with EnhancedCitationLoader.js

Add new supplement to the loader array:

```javascript
{ id: [ID], file: '[filename].js', globalVar: '[supplementName]Enhanced' }
```

**Important:** Ensure the `id` matches the supplement ID in the main database.

---

## Quality Assurance Checklist

### Pre-Integration Checklist

- [ ] **Data Structure Validation**
  - [ ] All required fields present
  - [ ] Correct data types used
  - [ ] Valid enum values (strength, riskLevel, etc.)
  - [ ] No undefined or null critical values

- [ ] **Citation Quality**
  - [ ] All studies have PMID or DOI
  - [ ] Author names properly formatted
  - [ ] Journal names complete and accurate
  - [ ] Publication years valid (1950-current)
  - [ ] Findings summaries clear and factual

- [ ] **Content Standards**
  - [ ] Claims are specific and measurable
  - [ ] No exaggerated or unsupported statements
  - [ ] Appropriate evidence strength ratings
  - [ ] Balanced representation of research

- [ ] **Technical Compliance**
  - [ ] File naming convention followed
  - [ ] Supplement ID matches database
  - [ ] Global variable registration included
  - [ ] No JavaScript syntax errors

### Post-Integration Testing

- [ ] **Functional Testing**
  - [ ] Modal opens without errors
  - [ ] All tabs display correct content
  - [ ] Citation cards render properly
  - [ ] Tab switching works correctly

- [ ] **Content Verification**
  - [ ] Expected number of citations per section
  - [ ] No "undefined" values in display
  - [ ] Proper titles and descriptions
  - [ ] Links and references functional

---

## Integration Testing

### 1. Local Testing Script

Create a test file to verify integration:

```javascript
// test-integration.js
const { chromium } = require('playwright');

async function testSupplement(supplementId, supplementName) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(3000);
        
        // Check data loading
        const dataCheck = await page.evaluate((id) => {
            const data = window.enhancedCitations?.[id];
            return {
                hasData: !!data,
                mechanismsCount: data?.citations?.mechanisms?.length || 0,
                benefitsCount: data?.citations?.benefits?.length || 0,
                safetyCount: data?.citations?.safety?.length || 0
            };
        }, supplementId);
        
        console.log(`${supplementName} Data:`, dataCheck);
        
        // Test modal functionality
        await page.fill('#searchInput', supplementName);
        await page.waitForTimeout(1000);
        
        await page.evaluate(async (id) => {
            await window.app.showSupplementDetails(id);
        }, supplementId);
        
        await page.waitForTimeout(1000);
        
        // Verify tab functionality
        const tabs = ['Mechanisms', 'Benefits', 'Safety'];
        for (const tab of tabs) {
            const tabElement = await page.locator('.citation-tab-btn').filter({ hasText: tab });
            if (await tabElement.count() > 0) {
                await tabElement.click();
                await page.waitForTimeout(500);
                
                const cardCount = await page.evaluate((id, tabType) => {
                    const container = document.getElementById(`${tabType.toLowerCase()}-${id}`);
                    return container ? container.querySelectorAll('.enhanced-citation-card').length : 0;
                }, supplementId, tab.slice(0, -1));
                
                console.log(`${tab}: ${cardCount} cards`);
            }
        }
        
        console.log(`✅ ${supplementName} integration test passed`);
        
    } catch (error) {
        console.error(`❌ ${supplementName} integration test failed:`, error.message);
    } finally {
        await browser.close();
    }
}

// Usage
testSupplement(8, 'Melatonin');
```

### 2. Validation Checklist

Run these checks after integration:

```bash
# 1. Syntax validation
node -c path/to/new_enhanced_file.js

# 2. Integration test
node test-integration.js

# 3. Comprehensive audit
node simple-comprehensive-audit.js
```

---

## Troubleshooting Common Issues

### Issue 1: "undefined" Values in Display

**Symptoms:** Citation cards show "undefined" text
**Causes:** Missing required fields in data structure
**Solution:** Ensure all required fields are present and not null

```javascript
// Bad
{
    claim: undefined,  // Will show "undefined"
    studies: []
}

// Good
{
    claim: "Specific, measurable claim",
    studies: [/* study objects */]
}
```

### Issue 2: Tab Count Mismatches

**Symptoms:** Expected vs actual citation counts don't match
**Causes:** Data structure not recognized by normalization logic
**Solution:** Follow exact data structure specifications

### Issue 3: Modal Loading Errors

**Symptoms:** Modal fails to open or shows errors
**Causes:** JavaScript syntax errors or missing global registration
**Solution:** Validate syntax and ensure proper global variable setup

### Issue 4: Citations Not Loading

**Symptoms:** No enhanced citations appear for supplement
**Causes:** File not added to EnhancedCitationLoader.js
**Solution:** Add entry to loader array with correct ID mapping

---

## Version Control and Updates

### Versioning Scheme

Use semantic versioning: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes to data structure
- **MINOR**: New citations or significant content additions
- **PATCH**: Bug fixes or minor content updates

### Update Process

1. Increment version number in file
2. Update `lastUpdated` date
3. Document changes in commit message
4. Run integration tests
5. Update this guide if structure changes

---

## Advanced Topics

### Legacy Format Support

The system supports three data formats for backward compatibility:

1. **New Format** (Recommended): Uses `claim` and `studies` fields
2. **Academic Paper Format**: Direct study arrays with `title`, `authors`, etc.
3. **Legacy Format**: Uses `id` and `citation` fields

The normalization logic automatically detects and converts these formats.

### Performance Considerations

- Keep study arrays under 20 items per section for optimal performance
- Use lazy loading for large datasets
- Compress images and optimize file sizes
- Consider pagination for supplements with 50+ citations

### Internationalization

For multi-language support:
- Store English as primary language
- Use ISO language codes for translations
- Maintain consistent terminology across languages

---

## Contact and Support

For questions or issues with citation integration:
- Review this guide first
- Check existing enhanced citation files for examples
- Run integration tests to identify specific issues
- Document any new patterns or edge cases discovered

This guide should be updated whenever new data formats or integration patterns are discovered to maintain system compatibility and quality standards.

---

## Appendix: Complete Working Example

See `8_melatonin_enhanced.js` for a complete, production-ready example that demonstrates all best practices outlined in this guide.
