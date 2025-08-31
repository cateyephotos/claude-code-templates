const fs = require('fs');
const path = require('path');

// More targeted fix for the specific target issues
function fixTargetSpecific() {
    const enhancedDir = './data/enhanced_citations';
    const files = fs.readdirSync(enhancedDir).filter(file => file.endsWith('_enhanced.js'));
    
    console.log(`🔧 Analyzing target field issues in ${files.length} files...`);
    
    files.forEach(file => {
        const filePath = path.join(enhancedDir, file);
        console.log(`\n📁 Processing: ${file}`);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;
            
            // The issue appears to be that mechanism objects are expected to have 'target' field
            // But they only have 'tissueTarget'. Let's add 'target' that mirrors 'tissueTarget'
            
            // Fix mechanisms - add 'target' field that mirrors 'tissueTarget'
            content = content.replace(
                /"mechanism":\s*"([^"]+)",[\s\S]*?"tissueTarget":\s*"([^"]+)",/g,
                (match, mechanism, tissueTarget) => {
                    // Only add if 'target' is not already present
                    if (!match.includes('"target":')) {
                        hasChanges = true;
                        console.log(`   🔧 Added 'target' field to mechanism "${mechanism}"`);
                        return match.replace(
                            `"tissueTarget": "${tissueTarget}",`,
                            `"tissueTarget": "${tissueTarget}",\n        "target": "${tissueTarget}",`
                        );
                    }
                    return match;
                }
            );
            
            // Fix benefits - some need 'target' field in addition to 'tissueTarget'
            content = content.replace(
                /"healthDomain":\s*"([^"]+)"[\s\S]*?"tissueTarget":\s*"([^"]+)",/g,
                (match, domain, tissueTarget) => {
                    // Only add if 'target' is not already present
                    if (!match.includes('"target":')) {
                        hasChanges = true;
                        console.log(`   🔧 Added 'target' field to health domain "${domain}"`);
                        return match.replace(
                            `"tissueTarget": "${tissueTarget}",`,
                            `"tissueTarget": "${tissueTarget}",\n        "target": "${tissueTarget}",`
                        );
                    }
                    return match;
                }
            );
            
            // Fix dosage citations - add 'target' field
            content = content.replace(
                /"dosageRange":\s*"([^"]+)"[\s\S]*?(?="evidence")/g,
                (match, dosageRange) => {
                    if (!match.includes('"target":')) {
                        hasChanges = true;
                        console.log(`   🔧 Added 'target' field to dosage "${dosageRange}"`);
                        return match + `"target": "Central nervous system",\n        `;
                    }
                    return match;
                }
            );
            
            // Fix any remaining 'tissueTarget' that needs to also have 'target'
            content = content.replace(
                /"tissueTarget":\s*"([^"]+)",(?!\s*"target":)/g,
                (match, tissueTarget) => {
                    hasChanges = true;
                    console.log(`   🔧 Added missing 'target' field matching tissueTarget "${tissueTarget}"`);
                    return match + `\n        "target": "${tissueTarget}",`;
                }
            );
            
            if (hasChanges) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`   ✅ Fixed target issues in ${file}`);
            } else {
                console.log(`   ✓ No target issues found in ${file}`);
            }
            
        } catch (error) {
            console.error(`   ❌ Error processing ${file}:`, error.message);
        }
    });
    
    console.log(`\n✅ Target-specific fix operation complete!`);
}

// Run the targeted fix
fixTargetSpecific();