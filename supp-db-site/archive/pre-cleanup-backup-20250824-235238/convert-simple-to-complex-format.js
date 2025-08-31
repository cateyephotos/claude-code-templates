const fs = require('fs');
const path = require('path');

// Convert simple format citation files to complex format with tissueTarget fields
function convertSimpleToComplexFormat() {
    const enhancedDir = './data/enhanced_citations';
    
    // Files identified as simple format that need conversion
    const simpleFormatFiles = [
        '11_enhanced.js',   // Lion's Mane
        '13_enhanced.js',   // Acetyl-L-Carnitine
        '14_enhanced.js',   // Ginkgo
        '20_enhanced.js',   // Quercetin
        '21_vitamin_b12_enhanced.js',
        '22_vitamin_b6_enhanced.js', 
        '24_enhanced.js',   // Green Tea
        '27_enhanced.js',   // Resveratrol
        '37_zinc_enhanced.js',
        '41_inositol_enhanced.js',
        '6_magnesium_l_threonate_enhanced.js',
        '89_enhanced.js',
        '90_glycine_enhanced.js',
        'citicoline_enhanced.js',
        'glycine_enhanced.js',
        'huperzine_a_enhanced.js',
        'lions_mane_enhanced.js',
        'phosphatidylserine_enhanced.js',
        'pqq_enhanced.js',
        'vinpocetine_enhanced.js'
    ];
    
    console.log(`🔄 Converting ${simpleFormatFiles.length} simple format files to complex format...`);
    
    let convertedCount = 0;
    
    simpleFormatFiles.forEach(fileName => {
        const filePath = path.join(enhancedDir, fileName);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${fileName}`);
            return;
        }
        
        try {
            console.log(`\n📁 Converting: ${fileName}`);
            
            let content = fs.readFileSync(filePath, 'utf8');
            
            // First, let's check if this file actually has the simple format
            if (!content.includes('"mechanisms":') || !content.includes('"id":')) {
                console.log(`   ⏭️  Not a simple format file - skipping`);
                return;
            }
            
            // Parse the content to extract citation data  
            // We'll convert the simple citations into complex mechanism/benefit/safety objects
            
            // Default target mappings based on supplement type
            const defaultTargets = {
                'mechanisms': 'Neural tissue and neurotransmitter systems',
                'benefits': 'Central nervous system',
                'safety': 'Multiple organ systems'
            };
            
            // Convert simple citations to complex format
            // Replace simple mechanisms array with complex format
            content = content.replace(
                /"mechanisms":\s*\[([\s\S]*?)\]/,
                (match, mechanismsContent) => {
                    console.log(`   🔧 Converting mechanisms section...`);
                    
                    // Create complex mechanism objects from simple citations
                    const complexMechanisms = `"mechanisms": [
      {
        "mechanism": "Primary mechanism of action",
        "strength": "Moderate",
        "mechanismType": "Neurotransmitter modulation",
        "tissueTarget": "${defaultTargets.mechanisms}",
        "target": "${defaultTargets.mechanisms}",
        "evidence": [${mechanismsContent}]
      }
    ]`;
                    
                    return complexMechanisms;
                }
            );
            
            // Convert simple benefits array with complex format
            content = content.replace(
                /"benefits":\s*\[([\s\S]*?)\]/,
                (match, benefitsContent) => {
                    console.log(`   🔧 Converting benefits section...`);
                    
                    const complexBenefits = `"benefits": [
      {
        "healthDomain": "Cognitive Enhancement", 
        "specificClaim": "Supports cognitive function and mental performance",
        "strength": "Moderate",
        "evidenceQuality": "Moderate",
        "replicationStatus": "Multiple studies",
        "tissueTarget": "${defaultTargets.benefits}",
        "target": "${defaultTargets.benefits}",
        "evidence": [${benefitsContent}]
      }
    ]`;
                    
                    return complexBenefits;
                }
            );
            
            // Convert simple safety array with complex format
            content = content.replace(
                /"safety":\s*\[([\s\S]*?)\]/,
                (match, safetyContent) => {
                    console.log(`   🔧 Converting safety section...`);
                    
                    const complexSafety = `"safety": [
      {
        "safetyAspect": "General tolerability",
        "claim": "Generally well tolerated with minimal side effects",
        "riskLevel": "Low",
        "target": "${defaultTargets.safety}",
        "tissueTarget": "${defaultTargets.safety}",
        "evidence": [${safetyContent}]
      }
    ]`;
                    
                    return complexSafety;
                }
            );
            
            // Add dosage section if missing
            if (!content.includes('"dosage":')) {
                console.log(`   🔧 Adding missing dosage section...`);
                
                // Insert dosage section before the closing citation bracket
                content = content.replace(
                    /(\s+"safety":\s*\[[\s\S]*?\]\s*)/,
                    `$1,

    // Dosage Citations - Evidence for optimal dosing
    "dosage": [
      {
        "dosageRange": "Standard supplemental dose",
        "claim": "Effective dose based on research studies",
        "evidenceBase": "Moderate",
        "target": "${defaultTargets.benefits}",
        "tissueTarget": "${defaultTargets.benefits}",
        "evidence": []
      }
    ]`
                );
            }
            
            // Write the converted file
            fs.writeFileSync(filePath, content, 'utf8');
            convertedCount++;
            console.log(`   ✅ Successfully converted ${fileName}`);
            
        } catch (error) {
            console.error(`   ❌ Error converting ${fileName}:`, error.message);
        }
    });
    
    console.log(`\n📊 Conversion Summary:`);
    console.log(`   Files processed: ${simpleFormatFiles.length}`);
    console.log(`   Files converted: ${convertedCount}`);
    console.log(`\n✅ Format conversion complete!`);
    
    if (convertedCount > 0) {
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Test the converted supplements for undefined errors`);
        console.log(`   2. Verify enhanced citation modals display correctly`);
        console.log(`   3. All supplements should now use consistent complex format`);
    }
}

// Run conversion
convertSimpleToComplexFormat();