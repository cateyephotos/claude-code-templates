const fs = require('fs');
const path = require('path');

// Fix the remaining target/tissueTarget issues
function fixRemainingTargets() {
    const enhancedDir = './data/enhanced_citations';
    const files = fs.readdirSync(enhancedDir).filter(file => file.endsWith('_enhanced.js'));
    
    console.log(`🔧 Fixing remaining target/tissueTarget issues...`);
    
    files.forEach(file => {
        const filePath = path.join(enhancedDir, file);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;
            
            // Fix safety objects that use different field names
            // Pattern: "safetyDomain" instead of "safetyAspect"
            content = content.replace(
                /"safetyDomain":\s*"([^"]+)"[\s\S]*?(?="evidence")/g,
                (match, domain) => {
                    if (!match.includes('"target":') && !match.includes('"tissueTarget":')) {
                        hasChanges = true;
                        console.log(`   🔧 Added target to safetyDomain "${domain}" in ${file}`);
                        return match + `"target": "Multiple organ systems",\n        "tissueTarget": "Multiple organ systems",\n        `;
                    }
                    return match;
                }
            );
            
            // Fix benefits that use "benefit" instead of "healthDomain"
            content = content.replace(
                /"benefit":\s*"([^"]+)"[\s\S]*?(?="evidence")/g,
                (match, benefit) => {
                    if (!match.includes('"target":') && !match.includes('"tissueTarget":')) {
                        hasChanges = true;
                        console.log(`   🔧 Added target to benefit "${benefit}" in ${file}`);
                        return match + `"target": "Central nervous system",\n        "tissueTarget": "Central nervous system",\n        `;
                    }
                    return match;
                }
            );
            
            // Fix dosage objects with "indication" field
            content = content.replace(
                /"indication":\s*"([^"]+)"[\s\S]*?(?="evidence")/g,
                (match, indication) => {
                    if (!match.includes('"target":') && !match.includes('"tissueTarget":')) {
                        hasChanges = true;
                        console.log(`   🔧 Added target to dosage indication "${indication}" in ${file}`);
                        return match + `"target": "Central nervous system",\n        "tissueTarget": "Central nervous system",\n        `;
                    }
                    return match;
                }
            );
            
            // Add missing tissueTarget to safety objects that have target but not tissueTarget
            content = content.replace(
                /"target":\s*"([^"]+)",(?!\s*[\s\S]*?"tissueTarget":)/g,
                (match, target) => {
                    hasChanges = true;
                    console.log(`   🔧 Added missing tissueTarget matching target "${target}" in ${file}`);
                    return match + `\n        "tissueTarget": "${target}",`;
                }
            );
            
            // Add missing target to objects that have tissueTarget but not target
            content = content.replace(
                /"tissueTarget":\s*"([^"]+)",(?!\s*[\s\S]*?"target":)/g,
                (match, tissueTarget) => {
                    hasChanges = true;
                    console.log(`   🔧 Added missing target matching tissueTarget "${tissueTarget}" in ${file}`);
                    return match + `\n        "target": "${tissueTarget}",`;
                }
            );
            
            if (hasChanges) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`   ✅ Fixed remaining target issues in ${file}`);
            }
            
        } catch (error) {
            console.error(`   ❌ Error processing ${file}:`, error.message);
        }
    });
    
    console.log(`\n✅ Remaining target fix operation complete!`);
}

// Run the fix
fixRemainingTargets();