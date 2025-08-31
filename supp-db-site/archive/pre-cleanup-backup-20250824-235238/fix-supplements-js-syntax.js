/**
 * Fix Supplements.js Syntax Issues
 * Properly place isEnhanced properties at the supplement level
 */

const fs = require('fs');

function fixSupplementsJsSyntax() {
    console.log('🔧 Fixing supplements.js syntax issues...');
    
    // Read the current file
    let content = fs.readFileSync('./data/supplements.js', 'utf8');
    
    console.log('📄 Original file size:', content.length);
    
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
    console.log(`🔢 Enhanced IDs: ${Array.from(enhancedIds).sort((a,b) => a-b).slice(0, 10).join(', ')}...`);
    
    // Fix the syntax by removing misplaced isEnhanced properties and adding them correctly
    let fixedContent = content;
    let changesCount = 0;
    
    // First, remove all existing isEnhanced properties (they're in wrong places)
    fixedContent = fixedContent.replace(/,?\s*"isEnhanced":\s*true/g, '');
    
    // Now add isEnhanced properly for each supplement that has an enhanced citation file
    enhancedIds.forEach(id => {
        // Find the supplement object and add isEnhanced at the correct level
        const supplementRegex = new RegExp(
            `(\\{[^}]*?"id":\\s*${id}[^}]*?)(\\s*\\})`,
            'g'
        );
        
        const newContent = fixedContent.replace(supplementRegex, (match, before, after) => {
            // Check if this supplement already has isEnhanced
            if (before.includes('"isEnhanced"')) {
                return match; // Already has it
            }
            
            changesCount++;
            // Add isEnhanced before the closing brace
            return before + ',\n      "isEnhanced": true' + after;
        });
        
        fixedContent = newContent;
    });
    
    // Validate the fixed content
    try {
        // Try to parse as JavaScript (basic validation)
        eval(`(${fixedContent.replace(/^.*?const supplementDatabase = /, '').replace(/;[\s\S]*$/, '')})`);
        console.log('✅ Fixed content is valid JavaScript');
    } catch (error) {
        console.error('❌ Fixed content has syntax errors:', error.message);
        return false;
    }
    
    // Write the fixed content
    fs.writeFileSync('./data/supplements.js', fixedContent);
    
    console.log(`✅ Fixed ${changesCount} supplements`);
    console.log('📄 Fixed file size:', fixedContent.length);
    
    return true;
}

// Run fix
if (require.main === module) {
    try {
        const success = fixSupplementsJsSyntax();
        if (success) {
            console.log('\n🎉 supplements.js syntax fixed successfully!');
            console.log('📋 Next steps:');
            console.log('  1. Restart the server');
            console.log('  2. Test frontend loading');
            console.log('  3. Validate enhanced supplement rendering');
        } else {
            console.log('\n❌ Fix failed - manual intervention required');
        }
    } catch (error) {
        console.error('💥 Fix failed:', error);
        process.exit(1);
    }
}

module.exports = { fixSupplementsJsSyntax };
