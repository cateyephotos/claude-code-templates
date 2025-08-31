# Enhanced Citation Format Guide

## Purpose
This guide ensures all future enhanced citation work integrates properly with the Smart Citation Renderer system.

## Key Principles

### 1. Format Flexibility
- **Any format is supported** - the Smart Citation Renderer will normalize it
- **Focus on data quality** over format consistency
- **Preserve original research structure** when possible

### 2. Required Structure
All enhanced citation files must have this minimum structure:
```javascript
window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[SUPPLEMENT_ID] = {
  "evidenceProfile": { /* ... */ },
  "citations": {
    "mechanisms": [ /* array of mechanism objects */ ],
    "benefits": [ /* array of benefit objects or studies */ ],
    "safety": [ /* array of safety objects or studies */ ],
    "dosage": [ /* optional array of dosage objects */ ]
  }
};
```

### 3. Study Properties
For automatic normalization, include these properties in study objects:
- **studyType**: Will be mapped to evidenceLevel automatically
- **title**: Study title
- **authors**: Array of author names or single string
- **id**: Unique identifier
- **doi**: DOI if available
- **pmid**: PubMed ID if available

## Supported Data Patterns

### Pattern 1: Direct Study Arrays (Recommended for Research Phase)
Use when you have individual studies to cite:
```javascript
"benefits": [
  {
    "id": "study_001",
    "title": "Cognitive Enhancement Study",
    "studyType": "randomized_controlled_trial",
    "authors": ["Smith, J.", "Doe, A."],
    "keyFindings": ["Improved memory", "Enhanced focus"]
  }
]
```

### Pattern 2: Grouped Benefits (Recommended for Polished Citations)
Use when organizing studies by health domains:
```javascript
"benefits": [
  {
    "healthDomain": "Memory Enhancement",
    "strength": "Strong",
    "evidence": [
      { "id": "study_001", "evidenceLevel": "Level 2" },
      { "id": "study_002", "evidenceLevel": "Level 1" }
    ]
  }
]
```

### Pattern 3: Mixed Format (Automatically Handled)
The Smart Renderer handles files with mixed patterns seamlessly.

## Study Type Mappings

Use these studyType values for automatic evidence level assignment:

| Study Type | Evidence Level | Description |
|------------|---------------|-------------|
| `systematic_review_meta_analysis` | Level 1 | Highest quality evidence |
| `meta_analysis` | Level 1 | Quantitative synthesis |
| `systematic_review` | Level 2 | Comprehensive review |
| `randomized_controlled_trial` | Level 2 | Gold standard trials |
| `clinical_trial` | Level 3 | Human studies |
| `cohort_study` | Level 3 | Observational studies |
| `case_control_study` | Level 4 | Retrospective studies |
| `mechanistic_study` | Level 4 | Mechanism research |
| `review` | Level 4 | General reviews |

## Best Practices

### For Research Phase (supp-db-project)
1. **Focus on comprehensive data collection**
2. **Use direct study arrays** for easy data entry
3. **Include all available study metadata**
4. **Don't worry about perfect formatting**

### For Production Implementation
1. **Copy research data to enhanced citation files**
2. **Let Smart Renderer handle normalization**
3. **Test in browser to verify rendering**
4. **Document any unique format requirements**

### Quality Assurance
1. **Always include studyType** for proper evidence level mapping
2. **Verify supplement ID matches** supplements.js
3. **Test undefined rendering** after implementation
4. **Check all tabs** (Mechanisms, Benefits, Safety) render properly

## Common Issues & Solutions

### Issue: "undefined" in rendered text
**Cause**: Missing required properties in study objects
**Solution**: Ensure studies have `evidenceLevel` or `studyType` properties

### Issue: Empty citation tabs
**Cause**: Incorrect data structure or missing citations object
**Solution**: Verify `citations` object exists with proper array structure

### Issue: Studies not displaying
**Cause**: Missing evidence arrays in grouped format
**Solution**: Ensure benefit/safety objects have `evidence` arrays

## Integration Workflow

### Step 1: Research Phase
1. Create comprehensive citation data in `supp-db-project`
2. Use whatever format is most efficient for data collection
3. Focus on completeness over format consistency

### Step 2: Implementation Phase
1. Copy research data to `data/enhanced_citations/[ID]_enhanced.js`
2. Ensure basic structure requirements are met
3. Mark supplement as enhanced in `supplements.js`

### Step 3: Verification Phase
1. Test supplement in browser
2. Verify no undefined rendering issues
3. Check all citation tabs function properly
4. Document any format-specific notes

## Future Considerations

### Planned Enhancements
- **Automatic validation** of citation data structure
- **Format migration tools** for updating old files
- **Quality scoring** based on citation completeness
- **Export tools** for generating standardized formats

### Extensibility
- **Custom study types** can be added to mapping system
- **New format patterns** will be supported automatically
- **Additional citation sections** can be added as needed

## Success Metrics

Track these metrics for enhanced citation quality:
- **Undefined rendering instances**: Should be 0
- **Citation completeness**: All sections populated
- **Study evidence levels**: Properly mapped and displayed
- **User engagement**: Time spent in citation tabs

## Contact & Support

For questions about enhanced citation formatting:
1. **Check this guide** for standard patterns
2. **Review Smart Renderer documentation** for technical details
3. **Test with existing working examples** (Citicoline, Bacopa monnieri)
4. **Document new patterns** discovered during implementation

---

**Remember**: The Smart Citation Renderer is designed to handle format variations automatically. Focus on data quality and completeness rather than perfect format consistency.
