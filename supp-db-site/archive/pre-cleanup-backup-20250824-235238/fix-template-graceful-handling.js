const fs = require('fs');
const path = require('path');

// Fix templates to handle missing target fields gracefully
function fixTemplateGracefulHandling() {
    const jsDir = './js';
    const templatesFiles = ['app.js', 'app.modernized.js', 'CitationRenderer.js'];
    
    console.log(`🔧 Making templates handle missing target fields gracefully...`);
    
    templatesFiles.forEach(fileName => {
        const filePath = path.join(jsDir, fileName);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${fileName}`);
            return;
        }
        
        try {
            console.log(`\n📁 Fixing template handling in: ${fileName}`);
            
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;
            
            // Fix the main issue: mechanism.tissueTarget might be undefined
            // Change: ${mechanism.tissueTarget}
            // To: ${mechanism.tissueTarget || mechanism.target || 'Neural tissue'}
            
            const oldPattern = /\$\{mechanism\.tissueTarget\}/g;
            if (content.match(oldPattern)) {
                content = content.replace(
                    oldPattern,
                    '${mechanism.tissueTarget || mechanism.target || "Neural tissue"}'
                );
                hasChanges = true;
                console.log(`   🔧 Fixed mechanism.tissueTarget references`);
            }
            
            // Also fix any benefit.tissueTarget references
            const benefitPattern = /\$\{benefit\.tissueTarget\}/g;
            if (content.match(benefitPattern)) {
                content = content.replace(
                    benefitPattern,
                    '${benefit.tissueTarget || benefit.target || "Central nervous system"}'
                );
                hasChanges = true;
                console.log(`   🔧 Fixed benefit.tissueTarget references`);
            }
            
            // Fix any safety.target references  
            const safetyPattern = /\$\{safetyItem\.target\}/g;
            if (content.match(safetyPattern)) {
                content = content.replace(
                    safetyPattern,
                    '${safetyItem.target || safetyItem.tissueTarget || "Multiple organ systems"}'
                );
                hasChanges = true;
                console.log(`   🔧 Fixed safetyItem.target references`);
            }
            
            // Alternative approach: Check if the template is trying to render simple citation format
            // If the object has 'id' and 'doi' but no 'mechanism' field, it's simple format
            // We need to make the templates detect this and handle accordingly
            
            // Add defensive rendering for mechanism cards
            const mechanismCardPattern = /mechanisms\.map\(mechanism\s*=>\s*\`[\s\S]*?\`\)/g;
            const mechanismMatches = content.match(mechanismCardPattern);
            
            if (mechanismMatches) {
                mechanismMatches.forEach(match => {
                    // Check if this template expects mechanism.tissueTarget
                    if (match.includes('mechanism.tissueTarget')) {
                        console.log(`   🔧 Adding defensive handling to mechanism template`);
                        
                        // Replace the template to check if mechanism has the expected structure
                        const newTemplate = match.replace(
                            /\$\{mechanism\.tissueTarget\}/g,
                            '${mechanism.tissueTarget || mechanism.target || "Neural tissue"}'
                        ).replace(
                            /\$\{mechanism\.mechanism\}/g,
                            '${mechanism.mechanism || mechanism.title || "Mechanism of action"}'
                        ).replace(
                            /\$\{mechanism\.mechanismType\}/g,
                            '${mechanism.mechanismType || "Neurotransmitter modulation"}'
                        );
                        
                        content = content.replace(match, newTemplate);
                        hasChanges = true;
                    }
                });
            }
            
            if (hasChanges) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`   ✅ Fixed graceful handling in ${fileName}`);
            } else {
                console.log(`   ✓ No changes needed in ${fileName}`);
            }
            
        } catch (error) {
            console.error(`   ❌ Error fixing ${fileName}:`, error.message);
        }
    });
    
    console.log(`\n✅ Template graceful handling fix complete!`);
    console.log(`\n💡 Templates now handle missing target fields with fallback values`);
}

// Run the fix
fixTemplateGracefulHandling();