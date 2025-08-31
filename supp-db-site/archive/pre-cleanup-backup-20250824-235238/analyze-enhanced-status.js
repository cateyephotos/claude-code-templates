const fs = require('fs');
const path = require('path');

// Load the supplements database using require (safer approach)
// First, let's make a temporary copy that can be required
const dataContent = fs.readFileSync('./data/supplements.js', 'utf8');

// Create a module-compatible version
const moduleContent = dataContent
    .replace('const supplementDatabase =', 'module.exports =')
    .replace('export default supplementDatabase;', '');

// Write to temp file
fs.writeFileSync('./data/supplements-temp.js', moduleContent);

// Now require it
const supplementDatabase = require('./data/supplements-temp.js');

// Clean up temp file
fs.unlinkSync('./data/supplements-temp.js');

// Check which enhanced citation files exist
const enhancedDir = './data/enhanced_citations';
const existingFiles = fs.readdirSync(enhancedDir);
const existingIds = existingFiles
    .map(f => {
        const match = f.match(/(\d+)_enhanced/);
        return match ? parseInt(match[1]) : null;
    })
    .filter(id => id !== null);

// Get all supplements
const allSupplements = supplementDatabase.supplements;

// Find supplements marked as enhanced
const enhancedSupplements = allSupplements.filter(s => s.enhancedCitations?.isEnhanced);

// Find missing enhanced files
const missingEnhanced = enhancedSupplements.filter(s => !existingIds.includes(s.id));

// Find supplements not marked as enhanced
const notEnhanced = allSupplements.filter(s => !s.enhancedCitations?.isEnhanced);

// Find supplements with enhanced files but not marked
const hasFileButNotMarked = existingIds.filter(id => 
    !enhancedSupplements.find(s => s.id === id)
);

console.log('📊 Supplement Enhancement Status Report');
console.log('=======================================');
console.log(`Total supplements: ${allSupplements.length}`);
console.log(`Marked as enhanced: ${enhancedSupplements.length}`);
console.log(`Enhanced files exist: ${existingIds.length}`);
console.log(`Missing enhanced files: ${missingEnhanced.length}`);
console.log(`Not marked as enhanced: ${notEnhanced.length}`);

console.log('\n✅ Existing enhanced citation files:');
console.log(existingIds.sort((a,b) => a-b).map(id => {
    const supp = allSupplements.find(s => s.id === id);
    return `${id}${supp ? ` (${supp.name})` : ''}`;
}).join(', '));

if (missingEnhanced.length > 0) {
    console.log('\n⚠️ Supplements marked enhanced but missing files:');
    missingEnhanced.forEach(s => console.log(`  ID ${s.id}: ${s.name} (Tier ${s.evidenceTier})`));
}

if (hasFileButNotMarked.length > 0) {
    console.log('\n⚠️ Has enhanced file but not marked in database:');
    hasFileButNotMarked.forEach(id => {
        const supp = allSupplements.find(s => s.id === id);
        if (supp) {
            console.log(`  ID ${id}: ${supp.name}`);
        }
    });
}

// Group not enhanced by evidence tier
const byTier = {};
notEnhanced.forEach(s => {
    const tier = s.evidenceTier || 4;
    if (!byTier[tier]) byTier[tier] = [];
    byTier[tier].push(s);
});

console.log('\n📊 Not enhanced supplements by evidence tier:');
Object.keys(byTier).sort().forEach(tier => {
    console.log(`\n  Tier ${tier} (${byTier[tier].length} supplements):`);
    byTier[tier].slice(0, 10).forEach(s => {
        console.log(`    ID ${s.id}: ${s.name}`);
    });
    if (byTier[tier].length > 10) {
        console.log(`    ... and ${byTier[tier].length - 10} more`);
    }
});

console.log('\n🎯 Priority supplements for enhancement (Tier 1 & 2):');
const prioritySupps = [...(byTier[1] || []), ...(byTier[2] || [])];
prioritySupps.slice(0, 15).forEach(s => {
    console.log(`  ID ${s.id}: ${s.name} (Tier ${s.evidenceTier})`);
});