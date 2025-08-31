/**
 * Fix Enhanced Properties - Targeted Approach
 * Add isEnhanced: true to supplements that have enhanced citation files
 */

const fs = require('fs');

function fixEnhancedPropertiesTargeted() {
    console.log('🔧 Fixing enhanced properties with targeted approach...');
    
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
    
    console.log(`📁 Found ${enhancedFiles.length} enhanced citation files`);
    console.log(`🔢 Enhanced IDs: ${Array.from(enhancedIds).sort((a,b) => a-b).slice(0, 15).join(', ')}...`);
    
    // Read supplements.js
    let content = fs.readFileSync('./data/supplements.js', 'utf8');
    
    let changesCount = 0;
    const changedSupplements = [];
    
    // For each enhanced ID, find and update the supplement
    enhancedIds.forEach(id => {
        // Create a more specific regex that finds the supplement object
        const supplementPattern = new RegExp(
            `(\\{[^}]*?"id":\\s*${id}[^}]*?)(\\s*\\})`,
            'gs'
        );
        
        content = content.replace(supplementPattern, (match, beforeClosing, closingBrace) => {
            // Check if already has isEnhanced
            if (beforeClosing.includes('"isEnhanced"')) {
                return match; // Already has it
            }
            
            changesCount++;
            
            // Extract supplement name for logging
            const nameMatch = beforeClosing.match(/"name":\s*"([^"]+)"/);
            const supplementName = nameMatch ? nameMatch[1] : `ID ${id}`;
            changedSupplements.push(supplementName);
            
            // Add isEnhanced before the closing brace
            // Make sure we have proper comma placement
            const needsComma = !beforeClosing.trim().endsWith(',');
            const comma = needsComma ? ',' : '';
            
            return beforeClosing + comma + '\n      "isEnhanced": true' + closingBrace;
        });
    });
    
    // Write the updated content
    fs.writeFileSync('./data/supplements.js', content);
    
    console.log(`✅ Updated ${changesCount} supplements`);
    if (changedSupplements.length > 0) {
        console.log('📝 Updated supplements:');
        changedSupplements.slice(0, 10).forEach(name => {
            console.log(`  ✓ ${name}`);
        });
        if (changedSupplements.length > 10) {
            console.log(`  ... and ${changedSupplements.length - 10} more`);
        }
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
        const result = fixEnhancedPropertiesTargeted();
        console.log(`\n🎉 Enhanced properties fixed! ${result.changesCount} of ${result.totalEnhanced} supplements updated.`);
        
        if (result.changesCount < result.totalEnhanced) {
            console.log(`⚠️ ${result.totalEnhanced - result.changesCount} supplements may already have isEnhanced or need manual review.`);
        }
        
        console.log('\n📋 Next steps:');
        console.log('  1. Test frontend loading');
        console.log('  2. Validate enhanced supplement rendering');
        console.log('  3. Run comprehensive validation');
    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    }
}

module.exports = { fixEnhancedPropertiesTargeted };
