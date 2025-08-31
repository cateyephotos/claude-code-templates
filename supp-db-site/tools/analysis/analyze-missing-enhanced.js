const fs = require('fs');

// Read and parse supplements database
const dataContent = fs.readFileSync('./data/supplements.js', 'utf8');

// Extract the supplements array from the JavaScript file
const startIndex = dataContent.indexOf('[');
const endIndex = dataContent.lastIndexOf(']') + 1;
const supplementsArray = JSON.parse(dataContent.substring(startIndex, endIndex));

// Check which enhanced citation files exist
const enhancedDir = './data/enhanced_citations';
const existingFiles = fs.readdirSync(enhancedDir);
const existingIds = existingFiles
    .map(f => {
        const match = f.match(/(\d+)_enhanced/);
        return match ? parseInt(match[1]) : null;
    })
    .filter(id => id !== null);

// Find supplements marked as enhanced
const enhancedSupplements = supplementsArray.filter(s => s.enhancedCitations?.isEnhanced);

// Find missing enhanced files
const missingEnhanced = enhancedSupplements.filter(s => !existingIds.includes(s.id));

// Find supplements not marked as enhanced
const notEnhanced = supplementsArray.filter(s => !s.enhancedCitations?.isEnhanced);

console.log('📊 Supplement Enhancement Status Report');
console.log('=======================================');
console.log(`Total supplements: ${supplementsArray.length}`);
console.log(`Marked as enhanced: ${enhancedSupplements.length}`);
console.log(`Enhanced files exist: ${existingIds.length}`);
console.log(`Missing enhanced files: ${missingEnhanced.length}`);
console.log(`Not marked as enhanced: ${notEnhanced.length}`);

console.log('\n✅ Existing enhanced citation files:');
console.log(existingIds.sort((a,b) => a-b).join(', '));

if (missingEnhanced.length > 0) {
    console.log('\n⚠️ Supplements marked enhanced but missing files:');
    missingEnhanced.forEach(s => console.log(`  ID ${s.id}: ${s.name}`));
}

console.log('\n📝 Supplements needing enhancement (not marked as enhanced):');
const prioritySupplements = notEnhanced.slice(0, 20);
prioritySupplements.forEach(s => {
    console.log(`  ID ${s.id}: ${s.name} (Tier ${s.evidenceTier})`);
});

if (notEnhanced.length > 20) {
    console.log(`  ... and ${notEnhanced.length - 20} more`);
}

// Group by evidence tier
const byTier = {};
notEnhanced.forEach(s => {
    const tier = s.evidenceTier || 4;
    if (!byTier[tier]) byTier[tier] = [];
    byTier[tier].push(s);
});

console.log('\n📊 Not enhanced supplements by evidence tier:');
Object.keys(byTier).sort().forEach(tier => {
    console.log(`  Tier ${tier}: ${byTier[tier].length} supplements`);
});