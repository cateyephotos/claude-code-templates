const fs = require('fs');

// Test the specific supplements that were showing undefined issues
const supplementsToTest = [
    { id: 4, name: 'Omega-3 Fatty Acids' },
    { id: 6, name: 'Magnesium' },
    { id: 7, name: 'Vitamin D3' }
];

console.log('🧪 Testing specific supplements for undefined issues...\n');

supplementsToTest.forEach(supplement => {
    console.log(`📋 Testing ${supplement.name} (ID: ${supplement.id})`);
    
    const enhancedFile = `./data/enhanced_citations/${supplement.id}_enhanced.js`;
    
    if (!fs.existsSync(enhancedFile)) {
        console.log(`   ❌ Enhanced citation file not found`);
        return;
    }
    
    try {
        // Read and parse the enhanced citation file
        const content = fs.readFileSync(enhancedFile, 'utf8');
        
        // Check for structural issues
        let issues = [];
        
        // Check for duplicate target fields
        const duplicateTargets = content.match(/"target":\s*"[^"]*",\s*"target":/g);
        if (duplicateTargets) {
            issues.push(`${duplicateTargets.length} duplicate target fields`);
        }
        
        // Check for wrong field names in benefits section
        if (content.includes('"benefit":')) {
            issues.push('Uses "benefit" instead of "healthDomain" and "specificClaim"');
        }
        
        // Check for wrong field names in safety section  
        if (content.includes('"safetyDomain":')) {
            issues.push('Uses "safetyDomain" instead of "safetyAspect" and "claim"');
        }
        
        // Check for wrong field names in dosage section (structural level, not within evidence)
        const dosageSection = content.match(/"dosage":\s*\[[^\]]*\]/s);
        if (dosageSection) {
            if (dosageSection[0].includes('"indication":') || dosageSection[0].includes('"optimalDose":')) {
                issues.push('Uses "indication"/"optimalDose" instead of "dosageRange" and "claim"');
            }
        }
        
        if (issues.length === 0) {
            console.log(`   ✅ Structure looks clean`);
        } else {
            console.log(`   ⚠️  Issues found:`);
            issues.forEach(issue => console.log(`      - ${issue}`));
        }
        
    } catch (error) {
        console.log(`   ❌ Error reading file: ${error.message}`);
    }
    
    console.log('');
});

console.log('🔍 Test complete - check results above');