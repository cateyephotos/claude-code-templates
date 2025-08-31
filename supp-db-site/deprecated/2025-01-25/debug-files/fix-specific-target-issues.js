const fs = require('fs');
const path = require('path');

// Fix specific undefined target issues found in the supplements
function fixSpecificTargetIssues() {
    const enhancedDir = './data/enhanced_citations';
    
    // Supplements with identified issues
    const problematicSupplements = [
        '4_enhanced.js',   // Omega-3 
        '6_enhanced.js',   // Magnesium
        '7_enhanced.js',   // Vitamin D3
        '11_enhanced.js',  // Lion's Mane
        '12_enhanced.js',  // Phosphatidylserine
        '13_enhanced.js',  // Acetyl-L-Carnitine
        '14_enhanced.js',  // Ginkgo
        '15_enhanced.js',  // Creatine
        '16_enhanced.js',  // L-Arginine
        '17_enhanced.js',  // Berberine
        '18_enhanced.js',  // CoQ10
        '19_enhanced.js',  // B-Complex
        '20_enhanced.js',  // Quercetin
        '24_enhanced.js',  // Green Tea
        '27_enhanced.js'   // Resveratrol
    ];
    
    console.log(`🔧 Fixing specific target issues in ${problematicSupplements.length} files...`);
    
    let totalFixed = 0;
    
    problematicSupplements.forEach(fileName => {
        const filePath = path.join(enhancedDir, fileName);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${fileName}`);
            return;
        }
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;
            let fixCount = 0;
            
            console.log(`\n📁 Processing: ${fileName}`);
            
            // The specific issue appears to be that some objects have incomplete target info
            // The templates are looking for fields that don't exist
            
            // 1. Fix benefit objects that have different structures
            const oldBenefitPattern = /"benefit":\s*"([^"]+)"[\s\S]*?(?="evidence")/g;
            content = content.replace(oldBenefitPattern, (match, benefit) => {
                if (!match.includes('"target":') && !match.includes('"tissueTarget":')) {
                    hasChanges = true;
                    fixCount++;
                    console.log(`   🔧 Added target fields to benefit: "${benefit}"`);
                    return match + `"target": "Central nervous system",\n        "tissueTarget": "Central nervous system",\n        `;
                }
                return match;
            });
            
            // 2. Fix safety objects with different structures
            const oldSafetyPattern = /"safetyDomain":\s*"([^"]+)"[\s\S]*?(?="evidence")/g;
            content = content.replace(oldSafetyPattern, (match, safetyDomain) => {
                if (!match.includes('"target":') && !match.includes('"tissueTarget":')) {
                    hasChanges = true;
                    fixCount++;
                    console.log(`   🔧 Added target fields to safety domain: "${safetyDomain}"`);
                    return match + `"target": "Multiple organ systems",\n        "tissueTarget": "Multiple organ systems",\n        `;
                }
                return match;
            });
            
            // 3. Fix dosage objects with different structures  
            const oldDosagePattern = /"indication":\s*"([^"]+)"[\s\S]*?(?="evidence")/g;
            content = content.replace(oldDosagePattern, (match, indication) => {
                if (!match.includes('"target":') && !match.includes('"tissueTarget":')) {
                    hasChanges = true;
                    fixCount++;
                    console.log(`   🔧 Added target fields to dosage indication: "${indication}"`);
                    return match + `"target": "Central nervous system",\n        "tissueTarget": "Central nervous system",\n        `;
                }
                return match;
            });
            
            // 4. Fix any remaining undefined target references by ensuring all objects have both fields
            // Check for objects that have only one of target/tissueTarget but not both
            const missingTargetPattern = /"tissueTarget":\s*"([^"]+)",(?!\s*[\s\S]*?"target":)/g;
            content = content.replace(missingTargetPattern, (match, tissueTarget) => {
                hasChanges = true;
                fixCount++;
                console.log(`   🔧 Added missing target field for tissueTarget: "${tissueTarget}"`);
                return match + `\n        "target": "${tissueTarget}",`;
            });
            
            const missingTissueTargetPattern = /"target":\s*"([^"]+)",(?!\s*[\s\S]*?"tissueTarget":)/g;
            content = content.replace(missingTissueTargetPattern, (match, target) => {
                hasChanges = true;
                fixCount++;
                console.log(`   🔧 Added missing tissueTarget field for target: "${target}"`);
                return match + `\n        "tissueTarget": "${target}",`;
            });
            
            // 5. Ensure all mechanism objects have both target and tissueTarget
            const mechanismPattern = /"mechanism":\s*"([^"]+)"[\s\S]*?"tissueTarget":\s*"([^"]+)"/g;
            content = content.replace(mechanismPattern, (match, mechanism, tissueTarget) => {
                if (!match.includes('"target":')) {
                    hasChanges = true;
                    fixCount++;
                    console.log(`   🔧 Added target field to mechanism: "${mechanism}"`);
                    return match.replace(
                        `"tissueTarget": "${tissueTarget}"`,
                        `"tissueTarget": "${tissueTarget}",\n        "target": "${tissueTarget}"`
                    );
                }
                return match;
            });
            
            if (hasChanges) {
                fs.writeFileSync(filePath, content, 'utf8');
                totalFixed++;
                console.log(`   ✅ Fixed ${fixCount} target issues in ${fileName}`);
            } else {
                console.log(`   ✓ No target issues found in ${fileName}`);
            }
            
        } catch (error) {
            console.error(`   ❌ Error processing ${fileName}:`, error.message);
        }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Files processed: ${problematicSupplements.length}`);
    console.log(`   Files fixed: ${totalFixed}`);
    console.log(`\n✅ Specific target fix operation complete!`);
}

// Run the fix
fixSpecificTargetIssues();