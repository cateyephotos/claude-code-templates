/**
 * Comprehensive Enhancement Gap Analysis
 * Identifies all supplements needing enhanced citations and available research
 */

const fs = require('fs');
const path = require('path');

function analyzeEnhancementGaps() {
    console.log('🔍 Analyzing enhancement gaps across all supplements...');
    
    // Load supplements database
    const supplementsPath = './data/supplements.js';
    const supplementsContent = fs.readFileSync(supplementsPath, 'utf8');
    
    // Extract supplements array using regex (since it's not a proper JSON)
    const supplementsMatch = supplementsContent.match(/"supplements":\s*\[([\s\S]*)\]\s*};/);
    if (!supplementsMatch) {
        throw new Error('Could not parse supplements array');
    }
    
    // Parse individual supplements
    const supplementsText = supplementsMatch[1];
    const supplements = [];
    
    // Split by supplement objects (looking for "id": pattern)
    const supplementBlocks = supplementsText.split(/(?=\s*{\s*"id":)/);
    
    supplementBlocks.forEach((block, index) => {
        if (block.trim()) {
            try {
                // Extract basic info using regex
                const idMatch = block.match(/"id":\s*(\d+)/);
                const nameMatch = block.match(/"name":\s*"([^"]+)"/);
                const tierMatch = block.match(/"evidenceTier":\s*(\d+)/);
                const enhancedMatch = block.match(/"isEnhanced":\s*true/);
                
                if (idMatch && nameMatch) {
                    supplements.push({
                        id: parseInt(idMatch[1]),
                        name: nameMatch[1],
                        evidenceTier: tierMatch ? parseInt(tierMatch[1]) : null,
                        isEnhanced: !!enhancedMatch
                    });
                }
            } catch (error) {
                console.log(`⚠️ Error parsing supplement block ${index}: ${error.message}`);
            }
        }
    });
    
    console.log(`📊 Found ${supplements.length} supplements in database`);
    
    // Check existing enhanced citation files
    const enhancedDir = './data/enhanced_citations';
    const enhancedFiles = fs.readdirSync(enhancedDir).filter(file => file.endsWith('.js'));
    
    console.log(`📁 Found ${enhancedFiles.length} enhanced citation files`);
    
    // Analyze gaps
    const analysis = {
        total: supplements.length,
        enhanced: supplements.filter(s => s.isEnhanced).length,
        unenhanced: supplements.filter(s => !s.isEnhanced).length,
        enhancedSupplements: supplements.filter(s => s.isEnhanced),
        unenhancedSupplements: supplements.filter(s => !s.isEnhanced),
        byTier: {
            tier1: supplements.filter(s => s.evidenceTier === 1),
            tier2: supplements.filter(s => s.evidenceTier === 2),
            tier3: supplements.filter(s => s.evidenceTier === 3)
        }
    };
    
    // Priority analysis
    const priorities = {
        highPriority: analysis.unenhancedSupplements.filter(s => s.evidenceTier <= 2),
        mediumPriority: analysis.unenhancedSupplements.filter(s => s.evidenceTier === 3),
        lowPriority: analysis.unenhancedSupplements.filter(s => s.evidenceTier > 3 || !s.evidenceTier)
    };
    
    // Generate report
    console.log('\n📋 ENHANCEMENT GAP ANALYSIS REPORT');
    console.log('=' .repeat(60));
    console.log(`📊 Total Supplements: ${analysis.total}`);
    console.log(`✅ Enhanced: ${analysis.enhanced} (${Math.round(analysis.enhanced/analysis.total*100)}%)`);
    console.log(`❌ Unenhanced: ${analysis.unenhanced} (${Math.round(analysis.unenhanced/analysis.total*100)}%)`);
    
    console.log('\n🎯 BY EVIDENCE TIER:');
    console.log(`Tier 1 (Strongest): ${analysis.byTier.tier1.length} total, ${analysis.byTier.tier1.filter(s => s.isEnhanced).length} enhanced`);
    console.log(`Tier 2 (Strong): ${analysis.byTier.tier2.length} total, ${analysis.byTier.tier2.filter(s => s.isEnhanced).length} enhanced`);
    console.log(`Tier 3 (Moderate): ${analysis.byTier.tier3.length} total, ${analysis.byTier.tier3.filter(s => s.isEnhanced).length} enhanced`);
    
    console.log('\n🚀 PRIORITY QUEUE:');
    console.log(`🔥 High Priority (Tier 1-2): ${priorities.highPriority.length} supplements`);
    console.log(`🔶 Medium Priority (Tier 3): ${priorities.mediumPriority.length} supplements`);
    console.log(`🔵 Low Priority (Tier 4+): ${priorities.lowPriority.length} supplements`);
    
    console.log('\n🔥 HIGH PRIORITY SUPPLEMENTS (Tier 1-2):');
    priorities.highPriority.forEach(s => {
        console.log(`  ${s.id}. ${s.name} (Tier ${s.evidenceTier})`);
    });
    
    console.log('\n🔶 MEDIUM PRIORITY SUPPLEMENTS (Tier 3):');
    priorities.mediumPriority.slice(0, 20).forEach(s => {
        console.log(`  ${s.id}. ${s.name} (Tier ${s.evidenceTier})`);
    });
    if (priorities.mediumPriority.length > 20) {
        console.log(`  ... and ${priorities.mediumPriority.length - 20} more`);
    }
    
    // Save detailed report
    const detailedReport = {
        timestamp: new Date().toISOString(),
        summary: analysis,
        priorities: priorities,
        enhancedSupplements: analysis.enhancedSupplements.map(s => ({
            id: s.id,
            name: s.name,
            tier: s.evidenceTier
        })),
        unenhancedSupplements: analysis.unenhancedSupplements.map(s => ({
            id: s.id,
            name: s.name,
            tier: s.evidenceTier,
            priority: s.evidenceTier <= 2 ? 'HIGH' : s.evidenceTier === 3 ? 'MEDIUM' : 'LOW'
        }))
    };
    
    fs.writeFileSync('enhancement-gap-analysis.json', JSON.stringify(detailedReport, null, 2));
    console.log('\n📄 Detailed report saved to: enhancement-gap-analysis.json');
    
    return detailedReport;
}

// Run analysis
if (require.main === module) {
    try {
        const report = analyzeEnhancementGaps();
        console.log('\n🎯 Analysis complete! Ready for systematic enhancement expansion.');
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
    }
}

module.exports = { analyzeEnhancementGaps };
