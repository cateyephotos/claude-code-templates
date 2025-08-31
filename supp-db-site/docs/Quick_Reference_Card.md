# Enhanced Citation System - Quick Reference Card

## 🚀 Quick Start Checklist

### 1. Before You Start
- [ ] Get supplement ID from main database
- [ ] Gather 5-15 high-quality peer-reviewed studies
- [ ] Ensure studies have PMID/DOI identifiers
- [ ] Check existing enhanced citation files for examples

### 2. File Creation
```bash
# File naming pattern
{supplementId}_{supplement_name}_enhanced.js

# Examples
8_melatonin_enhanced.js
37_zinc_enhanced.js
50_caffeine_enhanced.js
```

### 3. Required Data Structure
```javascript
const supplementEnhanced = {
    supplementId: 8,                    // ✅ Must match database ID
    supplementName: "Melatonin",        // ✅ Exact name match
    isEnhanced: true,                   // ✅ Always true
    version: "2.1",                     // ✅ Semantic versioning
    lastUpdated: "2024-01-15",         // ✅ ISO date format
    
    citations: {
        mechanisms: [/* 3-8 items */],   // ✅ How it works
        benefits: [/* 5-12 items */],    // ✅ What it does
        safety: [/* 2-5 items */]       // ✅ Safety profile
    }
};
```

### 4. Citation Item Template
```javascript
{
    claim: "Specific, measurable claim",              // ✅ Required
    studies: [                                        // ✅ Required
        {
            title: "Complete study title",           // ✅ Required
            authors: ["Last, F.", "Name, S."],      // ✅ Required array
            year: 2023,                              // ✅ Required number
            journal: "Journal Name",                 // ✅ Required
            pmid: "12345678",                       // ✅ Highly recommended
            doi: "10.1000/journal.2023.001",       // ✅ Highly recommended
            findings: "Key finding summary"          // ✅ Required
        }
    ]
}
```

## ⚠️ Common Mistakes to Avoid

### ❌ Data Structure Errors
```javascript
// DON'T DO THIS
{
    claim: undefined,           // ❌ Will show "undefined"
    studies: null,             // ❌ Will cause errors
    year: "2023",              // ❌ Should be number
    authors: "Smith, J."       // ❌ Should be array
}

// DO THIS INSTEAD
{
    claim: "Specific claim text",
    studies: [],
    year: 2023,
    authors: ["Smith, J."]
}
```

### ❌ File Integration Errors
```javascript
// ❌ Wrong ID mapping
{ id: 15, file: '43_choline_enhanced.js' }  // ID mismatch!

// ✅ Correct ID mapping  
{ id: 43, file: '43_choline_enhanced.js' }  // IDs match
```

### ❌ Citation Quality Issues
- ❌ Using non-peer-reviewed sources
- ❌ Missing PMID/DOI identifiers
- ❌ Vague or exaggerated claims
- ❌ Outdated studies (prefer 2015+)

## 🔧 Integration Steps

### Step 1: Create Citation File
```javascript
// 1. Create file: data/enhanced_citations/ID_name_enhanced.js
// 2. Use template structure
// 3. Add your citation data
// 4. Include global registration code
```

### Step 2: Update Loader
```javascript
// Add to js/EnhancedCitationLoader.js
{ id: 99, file: '99_newsupplement_enhanced.js', globalVar: 'newSupplementEnhanced' }
```

### Step 3: Test Integration
```bash
# 1. Syntax check
node -c data/enhanced_citations/99_newsupplement_enhanced.js

# 2. Start local server
npm start

# 3. Test in browser
# - Search for supplement
# - Open modal
# - Check all tabs work
# - Verify citation counts
```

## 🧪 Quality Validation

### Required Fields Checklist
- [ ] `supplementId` (number)
- [ ] `supplementName` (string)
- [ ] `isEnhanced` (true)
- [ ] `citations.mechanisms` (array)
- [ ] `citations.benefits` (array)
- [ ] `citations.safety` (array)

### Study Quality Checklist
- [ ] Peer-reviewed journal
- [ ] PMID or DOI present
- [ ] Publication year ≥ 2010
- [ ] Clear methodology
- [ ] Human studies preferred

### Content Quality Checklist
- [ ] Claims are specific and measurable
- [ ] No exaggerated language
- [ ] Balanced representation
- [ ] Appropriate evidence strength ratings

## 📊 Expected Citation Counts

| Section | Minimum | Recommended | Maximum |
|---------|---------|-------------|---------|
| Mechanisms | 2 | 3-5 | 8 |
| Benefits | 3 | 5-8 | 12 |
| Safety | 1 | 2-3 | 5 |

## 🔍 Testing Commands

```bash
# Validate structure
node validate-citation-structure.js path/to/file.js

# Check quality
node check-citation-quality.js path/to/file.js

# Integration test
node test-integration.js supplementId supplementName

# Full audit
node simple-comprehensive-audit.js
```

## 🆘 Troubleshooting

### Issue: "undefined" in display
**Fix:** Check all required fields are present and not null

### Issue: Tab counts don't match
**Fix:** Verify data structure follows exact specifications

### Issue: Modal won't open
**Fix:** Check JavaScript syntax and global variable registration

### Issue: Citations not loading
**Fix:** Ensure file is added to EnhancedCitationLoader.js

## 📚 Reference Examples

### ✅ Perfect Example
See: `8_melatonin_enhanced.js`
- Complete data structure
- High-quality citations
- Proper formatting
- All required fields

### ✅ Academic Paper Format
See: `37_zinc_enhanced.js`, `38_iron_enhanced.js`
- Direct study arrays
- Automatic normalization
- Individual citation cards

## 🔗 Documentation Links

- **Full Guide:** `Enhanced_Citation_Integration_Guide.md`
- **Validation Tools:** `Citation_Validation_Tools.md`
- **System Architecture:** `CitationRenderer.js`

## 📞 Support

1. Check this quick reference first
2. Review full integration guide
3. Test with validation tools
4. Check existing examples
5. Document new patterns discovered

---

**Remember:** Quality over quantity. 5 excellent citations are better than 15 poor ones!
