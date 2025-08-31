/**
 * Verify Enhancement Status
 * Cross-reference supplements.js with actual enhanced citation files
 */

const fs = require('fs');
const path = require('path');

function verifyEnhancementStatus() {
    console.log('🔍 Verifying actual enhancement status...');
    
    // Load supplements database
    const supplementsPath = './data/supplements.js';
    const supplementsContent = fs.readFileSync(supplementsPath, 'utf8');
    
    // Extract supplements array
    const supplementsMatch = supplementsContent.match(/"supplements":\s*\[([\s\S]*)\]\s*};/);
    if (!supplementsMatch) {
        throw new Error('Could not parse supplements array');
    }
    
    // Parse individual supplements
    const supplementsText = supplementsMatch[1];
    const supplements = [];
    
    const supplementBlocks = supplementsText.split(/(?=\s*{\s*"id":)/);
    
    supplementBlocks.forEach((block, index) => {
        if (block.trim()) {
            try {
                const idMatch = block.match(/"id":\s*(\d+)/);
                const nameMatch = block.match(/"name":\s*"([^"]+)"/);
                const tierMatch = block.match(/"evidenceTier":\s*(\d+)/);
                const enhancedMatch = block.match(/"isEnhanced":\s*true/);
                
                if (idMatch && nameMatch) {
                    supplements.push({
                        id: parseInt(idMatch[1]),
                        name: nameMatch[1],
                        evidenceTier: tierMatch ? parseInt(tierMatch[1]) : null,
                        isMarkedEnhanced: !!enhancedMatch
                    });
                }
            } catch (error) {
                console.log(`⚠️ Error parsing supplement block ${index}: ${error.message}`);
            }
        }
    });
    
    // Check actual enhanced citation files
    const enhancedDir = './data/enhanced_citations';
    const enhancedFiles = fs.readdirSync(enhancedDir).filter(file => file.endsWith('.js'));
    
    // Extract IDs from filenames
    const enhancedIds = new Set();
    enhancedFiles.forEach(file => {
        const idMatch = file.match(/^(\d+)_/);
        if (idMatch) {
            enhancedIds.add(parseInt(idMatch[1]));
        }
    });
    
    console.log(`📊 Found ${supplements.length} supplements in database`);
    console.log(`📁 Found ${enhancedFiles.length} enhanced citation files`);
    console.log(`🔢 Enhanced IDs found: ${Array.from(enhancedIds).sort((a,b) => a-b).join(', ')}`);
    
    // Cross-reference
    const analysis = supplements.map(supp => ({
        ...supp,
        hasEnhancedFile: enhancedIds.has(supp.id),
        status: enhancedIds.has(supp.id) ? 'ENHANCED' : 'NEEDS_ENHANCEMENT'
    }));
    
    // Categorize
    const enhanced = analysis.filter(s => s.hasEnhancedFile);
    const needsEnhancement = analysis.filter(s => !s.hasEnhancedFile);
    
    // Priority analysis
    const highPriority = needsEnhancement.filter(s => s.evidenceTier <= 2);
    const mediumPriority = needsEnhancement.filter(s => s.evidenceTier === 3);
    const lowPriority = needsEnhancement.filter(s => s.evidenceTier > 3 || !s.evidenceTier);
    
    console.log('\n📋 ENHANCEMENT STATUS VERIFICATION');
    console.log('=' .repeat(60));
    console.log(`✅ Enhanced: ${enhanced.length} (${Math.round(enhanced.length/supplements.length*100)}%)`);
    console.log(`❌ Needs Enhancement: ${needsEnhancement.length} (${Math.round(needsEnhancement.length/supplements.length*100)}%)`);
    
    console.log('\n🎯 PRIORITY BREAKDOWN:');
    console.log(`🔥 High Priority (Tier 1-2): ${highPriority.length} supplements`);
    console.log(`🔶 Medium Priority (Tier 3): ${mediumPriority.length} supplements`);
    console.log(`🔵 Low Priority (Tier 4+): ${lowPriority.length} supplements`);
    
    if (highPriority.length > 0) {
        console.log('\n🔥 HIGH PRIORITY SUPPLEMENTS NEEDING ENHANCEMENT:');
        highPriority.forEach(s => {
            console.log(`  ${s.id}. ${s.name} (Tier ${s.evidenceTier})`);
        });
    }
    
    if (mediumPriority.length > 0) {
        console.log('\n🔶 MEDIUM PRIORITY SUPPLEMENTS NEEDING ENHANCEMENT:');
        mediumPriority.slice(0, 15).forEach(s => {
            console.log(`  ${s.id}. ${s.name} (Tier ${s.evidenceTier})`);
        });
        if (mediumPriority.length > 15) {
            console.log(`  ... and ${mediumPriority.length - 15} more`);
        }
    }
    
    // Check for mismatches
    const markedButNoFile = analysis.filter(s => s.isMarkedEnhanced && !s.hasEnhancedFile);
    const fileButNotMarked = analysis.filter(s => !s.isMarkedEnhanced && s.hasEnhancedFile);
    
    if (markedButNoFile.length > 0) {
        console.log('\n⚠️ MARKED AS ENHANCED BUT NO FILE:');
        markedButNoFile.forEach(s => {
            console.log(`  ${s.id}. ${s.name}`);
        });
    }
    
    if (fileButNotMarked.length > 0) {
        console.log('\n⚠️ HAS FILE BUT NOT MARKED AS ENHANCED:');
        fileButNotMarked.forEach(s => {
            console.log(`  ${s.id}. ${s.name}`);
        });
    }
    
    // Save detailed report
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: supplements.length,
            enhanced: enhanced.length,
            needsEnhancement: needsEnhancement.length,
            enhancementRate: Math.round(enhanced.length/supplements.length*100)
        },
        priorities: {
            high: highPriority.length,
            medium: mediumPriority.length,
            low: lowPriority.length
        },
        highPriorityList: highPriority,
        mediumPriorityList: mediumPriority,
        mismatches: {
            markedButNoFile: markedButNoFile,
            fileButNotMarked: fileButNotMarked
        }
    };
    
    fs.writeFileSync('enhancement-status-verification.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: enhancement-status-verification.json');
    
    return report;
}

// Run verification
if (require.main === module) {
    try {
        const report = verifyEnhancementStatus();
        console.log('\n🎯 Verification complete! Ready for targeted enhancement expansion.');
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

module.exports = { verifyEnhancementStatus };
