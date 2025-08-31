const fs = require('fs');

// Get existing enhanced citation files
const enhancedDir = './data/enhanced_citations';
const files = fs.readdirSync(enhancedDir);

// Extract numeric IDs from filenames
const existingIds = new Set();
files.forEach(file => {
    const match = file.match(/^(\d+)(_|\.)/);
    if (match) {
        existingIds.add(parseInt(match[1]));
    }
});

// Check which IDs from 1-89 are missing
const missingIds = [];
for (let i = 1; i <= 89; i++) {
    if (!existingIds.has(i)) {
        missingIds.push(i);
    }
}

console.log('📊 Enhanced Citation Coverage Report');
console.log('====================================');
console.log(`Total expected supplements: 89`);
console.log(`Enhanced citations exist for: ${existingIds.size} supplements`);
console.log(`Missing enhanced citations: ${missingIds.length} supplements`);

console.log('\n✅ Existing enhanced citations (numeric IDs):');
const sortedExisting = Array.from(existingIds).sort((a, b) => a - b);
console.log(sortedExisting.join(', '));

console.log('\n❌ Missing enhanced citations:');
console.log(missingIds.join(', '));

// Group missing by ranges for easier processing
console.log('\n📦 Missing ID ranges for batch processing:');
const ranges = [];
let rangeStart = missingIds[0];
let rangeEnd = missingIds[0];

for (let i = 1; i < missingIds.length; i++) {
    if (missingIds[i] === rangeEnd + 1) {
        rangeEnd = missingIds[i];
    } else {
        ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
        rangeStart = missingIds[i];
        rangeEnd = missingIds[i];
    }
}
ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
console.log(ranges.join(', '));

// Suggest batch processing groups
console.log('\n🎯 Suggested batch processing (5 supplements per batch):');
for (let i = 0; i < missingIds.length; i += 5) {
    const batch = missingIds.slice(i, i + 5);
    console.log(`  Batch ${Math.floor(i/5) + 1}: IDs ${batch.join(', ')}`);
}