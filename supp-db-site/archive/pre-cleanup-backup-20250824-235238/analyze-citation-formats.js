const fs = require('fs');
const path = require('path');

// Analyze citation file formats to understand the structure mismatch
function analyzeCitationFormats() {
    const enhancedDir = './data/enhanced_citations';
    const files = fs.readdirSync(enhancedDir).filter(file => file.endsWith('_enhanced.js'));
    
    console.log(`🔍 Analyzing ${files.length} enhanced citation files...`);
    
    const simpleFormat = [];
    const complexFormat = [];
    const invalidFiles = [];
    
    files.forEach(file => {
        const filePath = path.join(enhancedDir, file);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check if it has the complex format (mechanisms with tissueTarget)
            const hasComplexMechanisms = content.includes('"mechanism":') && content.includes('"tissueTarget":');
            
            // Check if it has the simple format (mechanisms with id, doi)
            const hasSimpleMechanisms = content.includes('"mechanisms":') && content.includes('"id":') && content.includes('"doi":');
            
            if (hasComplexMechanisms) {
                complexFormat.push(file);
                console.log(`✅ Complex format: ${file}`);
            } else if (hasSimpleMechanisms) {
                simpleFormat.push(file);
                console.log(`📋 Simple format: ${file}`);
            } else {
                invalidFiles.push(file);
                console.log(`❓ Unknown format: ${file}`);
            }
            
        } catch (error) {
            console.error(`❌ Error reading ${file}:`, error.message);
            invalidFiles.push(file);
        }
    });
    
    console.log(`\n📊 ANALYSIS RESULTS:`);
    console.log(`   Complex format (with tissueTarget): ${complexFormat.length} files`);
    console.log(`   Simple format (citations only): ${simpleFormat.length} files`);
    console.log(`   Invalid/Unknown format: ${invalidFiles.length} files`);
    
    if (simpleFormat.length > 0) {
        console.log(`\n📋 Simple format files that need conversion:`);
        simpleFormat.forEach(file => console.log(`   - ${file}`));
    }
    
    return {
        complexFormat,
        simpleFormat,
        invalidFiles
    };
}

// Run analysis
const analysis = analyzeCitationFormats();

// Generate conversion strategy
console.log(`\n💡 CONVERSION STRATEGY:`);
if (analysis.simpleFormat.length > 0) {
    console.log(`   Need to convert ${analysis.simpleFormat.length} simple format files to complex format`);
    console.log(`   This will add mechanism objects with tissueTarget fields`);
} else {
    console.log(`   All files already use complex format - issue may be with missing fields`);
}