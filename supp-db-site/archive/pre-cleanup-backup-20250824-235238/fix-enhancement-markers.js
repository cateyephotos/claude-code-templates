/**
 * Fix Enhancement Markers
 * Update supplements.js to mark all supplements with enhanced citation files as enhanced
 */

const fs = require('fs');

function fixEnhancementMarkers() {
    console.log('🔧 Fixing enhancement markers in supplements.js...');
    
    // Get list of supplements with enhanced citation files
    const enhancedDir = './data/enhanced_citations';
    const enhancedFiles = fs.readdirSync(enhancedDir).filter(file => file.endsWith('.js'));
    
    const enhancedIds = new Set();
    enhancedFiles.forEach(file => {
        const idMatch = file.match(/^(\d+)_/);
        if (idMatch) {
            enhancedIds.add(parseInt(idMatch[1]));
        }
    });
    
    console.log(`📁 Found enhanced citation files for IDs: ${Array.from(enhancedIds).sort((a,b) => a-b).join(', ')}`);
    
    // Read supplements.js
    const supplementsPath = './data/supplements.js';
    let supplementsContent = fs.readFileSync(supplementsPath, 'utf8');
    
    // Track changes
    let changesCount = 0;
    const changedSupplements = [];
    
    // For each enhanced ID, ensure it's marked as enhanced
    enhancedIds.forEach(id => {
        // Look for the supplement with this ID
        const supplementRegex = new RegExp(`(\\{[^}]*"id":\\s*${id}[^}]*?)("isEnhanced":\\s*(?:true|false))?([^}]*\\})`, 'g');
        
        const newContent = supplementsContent.replace(supplementRegex, (match, before, isEnhancedPart, after) => {
            if (isEnhancedPart && isEnhancedPart.includes('true')) {
                // Already marked as enhanced
                return match;
            } else {
                // Need to add or update isEnhanced
                changesCount++;
                
                // Extract supplement name for logging
                const nameMatch = match.match(/"name":\s*"([^"]+)"/);
                const supplementName = nameMatch ? nameMatch[1] : `ID ${id}`;
                changedSupplements.push(supplementName);
                
                if (isEnhancedPart) {
                    // Replace false with true
                    return before + '"isEnhanced": true' + after;
                } else {
                    // Add isEnhanced: true before the closing brace
                    const beforeClosing = after.replace(/(\s*\})$/, ',\n    "isEnhanced": true$1');
                    return before + beforeClosing;
                }
            }
        });
        
        supplementsContent = newContent;
    });
    
    // Write back to file
    fs.writeFileSync(supplementsPath, supplementsContent);
    
    console.log(`✅ Fixed ${changesCount} enhancement markers`);
    if (changedSupplements.length > 0) {
        console.log('📝 Updated supplements:');
        changedSupplements.forEach(name => {
            console.log(`  ✓ ${name}`);
        });
    }
    
    return {
        changesCount,
        changedSupplements,
        totalEnhanced: enhancedIds.size
    };
}

// Run fix
if (require.main === module) {
    try {
        const result = fixEnhancementMarkers();
        console.log(`\n🎉 Enhancement markers fixed! ${result.totalEnhanced} supplements now properly marked as enhanced.`);
    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    }
}

module.exports = { fixEnhancementMarkers };
