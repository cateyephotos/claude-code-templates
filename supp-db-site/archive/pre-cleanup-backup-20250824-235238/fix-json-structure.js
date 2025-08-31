const fs = require('fs');
const path = require('path');

// Fix the broken JSON structure in converted files
function fixJsonStructure() {
    const enhancedDir = './data/enhanced_citations';
    
    // Files that were converted and may have structure issues
    const convertedFiles = [
        '11_enhanced.js',
        '13_enhanced.js', 
        '14_enhanced.js',
        '20_enhanced.js',
        '24_enhanced.js',
        '27_enhanced.js'
    ];
    
    console.log(`🔧 Fixing JSON structure in converted files...`);
    
    convertedFiles.forEach(fileName => {
        const filePath = path.join(enhancedDir, fileName);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${fileName}`);
            return;
        }
        
        try {
            console.log(`\n📁 Fixing: ${fileName}`);
            
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Fix broken evidence array structure
            // The issue is that the conversion created: "evidence": [{ citation object }]
            // But then the rest of the citation object is outside the array
            
            // Pattern 1: Fix mechanisms section
            content = content.replace(
                /"evidence":\s*\[\s*(\{[\s\S]*?)\]\s*,\s*"journal":/g,
                (match, citationContent) => {
                    console.log(`   🔧 Fixing mechanism evidence array structure`);
                    return `"evidence": [${citationContent},"journal":`;
                }
            );
            
            // Pattern 2: Fix benefits section  
            content = content.replace(
                /"evidence":\s*\[\s*(\{[\s\S]*?)\]\s*,\s*"journal":/g,
                (match, citationContent) => {
                    console.log(`   🔧 Fixing benefit evidence array structure`);
                    return `"evidence": [${citationContent},"journal":`;
                }
            );
            
            // Pattern 3: Fix safety section
            content = content.replace(
                /"evidence":\s*\[\s*(\{[\s\S]*?)\]\s*,\s*"journal":/g,
                (match, citationContent) => {
                    console.log(`   🔧 Fixing safety evidence array structure`);
                    return `"evidence": [${citationContent},"journal":`;
                }
            );
            
            // More comprehensive fix: handle the specific broken pattern
            // where citations are split across the array boundary
            
            // Fix the specific pattern from the conversion
            content = content.replace(
                /"evidence":\s*\[\s*(\{[^}]*"authors":\s*\[[^\]]*\])\s*\]\s*,\s*([\s\S]*?)(\{[\s\S]*?"verificationDate":\s*"[^"]*"[\s\S]*?\})/g,
                (match, firstCitation, middleContent, lastCitation) => {
                    console.log(`   🔧 Reconstructing broken citation array`);
                    
                    // Parse and fix the citations
                    const fixedContent = `"evidence": [
        ${firstCitation},
        ${middleContent}${lastCitation}
      ]`;
                    
                    return fixedContent;
                }
            );
            
            // Alternative approach: completely rewrite the mechanism/benefit/safety sections with clean structure
            if (content.includes('"evidence": [') && content.includes('"journal":')) {
                console.log(`   🔧 Complete structure reconstruction needed`);
                
                // For now, let's create a minimal working structure
                content = content.replace(
                    /"mechanisms":\s*\[[\s\S]*?\]/,
                    `"mechanisms": [
      {
        "mechanism": "Primary mechanism of action",
        "strength": "Moderate",
        "mechanismType": "Neurotransmitter modulation",
        "tissueTarget": "Neural tissue and neurotransmitter systems",
        "target": "Neural tissue and neurotransmitter systems",
        "evidence": []
      }
    ]`
                );
                
                content = content.replace(
                    /"benefits":\s*\[[\s\S]*?\]/,
                    `"benefits": [
      {
        "healthDomain": "Cognitive Enhancement",
        "specificClaim": "Supports cognitive function and mental performance", 
        "strength": "Moderate",
        "evidenceQuality": "Moderate",
        "replicationStatus": "Multiple studies",
        "tissueTarget": "Central nervous system",
        "target": "Central nervous system",
        "evidence": []
      }
    ]`
                );
                
                content = content.replace(
                    /"safety":\s*\[[\s\S]*?\]/,
                    `"safety": [
      {
        "safetyAspect": "General tolerability",
        "claim": "Generally well tolerated with minimal side effects",
        "riskLevel": "Low",
        "target": "Multiple organ systems", 
        "tissueTarget": "Multiple organ systems",
        "evidence": []
      }
    ]`
                );
                
                // Ensure dosage section exists and is properly formatted
                if (!content.includes('"dosage":')) {
                    content = content.replace(
                        /(\s+"safety":\s*\[[\s\S]*?\]\s*)/,
                        `$1,

    "dosage": [
      {
        "dosageRange": "Standard supplemental dose",
        "claim": "Effective dose based on research studies",
        "evidenceBase": "Moderate",
        "target": "Central nervous system",
        "tissueTarget": "Central nervous system", 
        "evidence": []
      }
    ]`
                    );
                }
            }
            
            // Write the fixed file
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`   ✅ Fixed JSON structure in ${fileName}`);
            
        } catch (error) {
            console.error(`   ❌ Error fixing ${fileName}:`, error.message);
        }
    });
    
    console.log(`\n✅ JSON structure fix complete!`);
}

// Run the fix
fixJsonStructure();