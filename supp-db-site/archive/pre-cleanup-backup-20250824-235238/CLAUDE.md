# Evidence-Based Supplement Database - Implementation Guide

## Project Overview
Evidence-Based Supplement Database with Phase 2A Enhanced Citation System
- 89 total supplements with modernized ES6 architecture
- Enhanced citations for research-backed supplements
- Comprehensive testing suite with Playwright validation

## Critical Implementation Constraints

### 1. Module Loading Pattern (REQUIRED)
```javascript
// ✅ CORRECT: Global pattern for enhanced citations
window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[supplementId] = enhancedCitationData;

// ❌ INCORRECT: ES6 exports (causes loading failures)
export default enhancedCitationData;
```

### 2. Tier Class Mapping (CRITICAL)
```javascript
_getTierClass(tier) {
    switch (tier) {
        case 1: return 'tier-badge';  // Green gradient
        case 2: return 'tier-2';      // Yellow gradient
        case 3: return 'tier-3';      // Red gradient  
        case 4: return 'tier-4';      // Gray gradient
        default: return 'tier-4';
    }
}
```

### 3. Evidence Bar Proportions
- Tier 1: `(5-1) * 25 = 100%` width (strongest evidence)
- Tier 2: `(5-2) * 25 = 75%` width  
- Tier 3: `(5-3) * 25 = 50%` width
- Tier 4: `(5-4) * 25 = 25%` width (weakest evidence)

### 4. Data Initialization Order
```javascript
// Must wait for supplementDatabase availability
_waitForData() {
    const database = window.supplementDatabase || 
                    (typeof supplementDatabase !== 'undefined' ? supplementDatabase : null);
    
    if (database && database.supplements && database.categories && database.healthDomains) {
        this._initializeWithData(database);
    } else {
        setTimeout(() => this._waitForData(), 100);
    }
}
```

## Phase 2A Enhanced Citation Requirements

### Data Structure Template
```javascript
const enhancedCitationData = {
    "id": supplementId,
    "name": "Supplement Name",
    "evidenceProfile": {
        "overallQuality": "Tier X",
        "totalCitations": 15, // Minimum by tier
        "researchQualityScore": 82, // 0-100 scale
        "evidenceStrength": {
            "mechanisms": "Strong|Moderate|Weak",
            "clinicalBenefits": "Strong|Moderate|Weak",
            "safety": "Well-established|Moderate|Limited",
            "dosage": "Evidence-based|Moderate|Limited"
        }
    },
    "citations": {
        "mechanisms": [...], // Minimum 2-6 by tier
        "benefits": [...],   // Minimum 2-8 by tier  
        "safety": [...],     // Minimum 1-3 by tier
        "dosage": [...]      // Minimum 1-2 by tier
    }
};
```

### Citation Quality Standards by Tier
- **Tier 1**: 20+ total citations, 6 mechanisms, 8 benefits, 3 safety, 2 dosage
- **Tier 2**: 15+ total citations, 4 mechanisms, 6 benefits, 3 safety, 2 dosage  
- **Tier 3**: 10+ total citations, 3 mechanisms, 4 benefits, 2 safety, 1 dosage
- **Tier 4**: 5+ total citations, 2 mechanisms, 2 benefits, 1 safety, 1 dosage

## Testing Requirements

### Playwright Validation Checklist
```javascript
// 1. Enhanced citation file loads without errors
await expect(window.enhancedCitations[id]).toBeDefined();

// 2. Phase 2A badge displays correctly
const badge = page.locator('.phase-2a-badge');
await expect(badge).toBeVisible();

// 3. Modal opens with tabbed interface
await page.click(`[data-supplement-id="${id}"] button:has-text("View Details")`);
await expect(page.locator('.citation-tab-btn')).toHaveCount(3);

// 4. Evidence bars show correct proportional width
const evidenceBar = page.locator('.evidence-fill');
const width = await evidenceBar.getAttribute('style');
// Validate width matches tier calculation

// 5. Console errors monitoring
const errors = [];
page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
});
```

## Implementation Workflow

### Step 1: Create Enhanced Citation File
1. Copy template structure
2. Research real citations for supplement
3. Implement in `/data/enhanced_citations/{id}_enhanced.js`
4. Use global pattern: `window.enhancedCitations[id] = data;`

### Step 2: Update Supplement Database
```javascript
// In supplements.js, add to supplement object:
"enhancedCitations": {
    "isEnhanced": true
}
```

### Step 3: Testing Protocol
1. **Console Error Check**: Verify no JavaScript errors
2. **Visual Validation**: Confirm Phase 2A badge appears
3. **Modal Function**: Test tabbed interface works
4. **Data Quality**: Verify citation counts meet tier requirements
5. **Performance**: Monitor loading times <500ms

## Top 20 Priority Supplements for Phase 2A

### Tier 1 (Strongest Evidence) - 4 supplements
1. Creatine (id: 2)
2. Omega-3 Fatty Acids (id: 3) 
3. Magnesium (id: 4)
4. Vitamin D3 (id: 5)

### Tier 2 (Strong Evidence) - 7 supplements  
5. Lion's Mane Mushroom (id: 11)
6. Ashwagandha (id: 6)
7. Turmeric/Curcumin (id: 7)
8. L-Theanine (id: 8)
9. Melatonin (id: 9)
10. Rhodiola rosea (id: 10)
11. Phosphatidylserine (id: 12)

### Tier 3 (Moderate Evidence) - 9 supplements
12. Acetyl-L-Carnitine (id: 13)
13. Ginkgo Biloba (id: 14)
14. Alpha-GPC (id: 16)  
15. Berberine (id: 17)
16. CoQ10 (id: 18)
17. B-Complex Vitamins (id: 19)
18. Quercetin (id: 20)
19. Green Tea Extract (id: 21)
20. NAD+ Precursors (id: 22)

## Error Prevention & Recovery

### Common Issues and Solutions
1. **Module Loading Failure**: Use global pattern, not ES6 exports
2. **Tier Class Mismatch**: Ensure `tier-badge` for Tier 1
3. **Evidence Bar Width**: Verify CSS calculation matches database tier
4. **Modal Display**: Check citation data structure completeness
5. **Performance Issues**: Implement lazy loading with caching

### Rollback Procedure
```javascript
// Remove enhanced status to fallback to basic display
supplement.enhancedCitations.isEnhanced = false;
delete window.enhancedCitations[supplementId];
```

## Development Commands

### Server Management
```bash
# Start development server
cd supp-db-site && python -m http.server 8000

# Test server accessibility  
curl -s http://localhost:8000 | head -5
```

### Testing
```bash
# Run comprehensive test suite
npm test

# Playwright visual testing
npx playwright test --headed
```

## Success Metrics

### Phase 2A Expansion Targets
- **Week 1**: 4 Tier 1 supplements (100% citation quality)
- **Week 2**: 7 Tier 2 supplements (85% citation quality) 
- **Week 3**: 9 Tier 3 supplements (70% citation quality)
- **Final**: 20 total enhanced supplements operational

### Quality Gates
- Zero console errors during enhanced citation loading
- <500ms modal loading time for enhanced supplements
- 100% success rate for Phase 2A badge display
- Complete citation data for all implemented tiers