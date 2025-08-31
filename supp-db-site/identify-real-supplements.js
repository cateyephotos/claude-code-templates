const fs = require('fs');

console.log('🔍 IDENTIFYING REAL SUPPLEMENTS NEEDING MAPPINGS');
console.log('Filtering out test files (ID 999) and focusing on legitimate supplements...');

// Get existing citation files (excluding ID 999 test files)
const enhancedCitationsDir = './data/enhanced_citations';
let realSupplementFiles = [];
try {
  const allFiles = fs.readdirSync(enhancedCitationsDir)
    .filter(file => file.endsWith('_enhanced.js'))
    .map(file => {
      const match = file.match(/^(\d+)_(.+)_enhanced\.js$/);
      return match ? { 
        id: parseInt(match[1]), 
        filename: file,
        supplementName: match[2].replace(/_/g, ' ')
      } : null;
    })
    .filter(item => item !== null);
  
  // Filter out test files (ID 999) and duplicates
  realSupplementFiles = allFiles
    .filter(file => file.id !== 999 && file.id <= 89)
    .sort((a, b) => a.id - b.id);
    
} catch (error) {
  console.log('❌ Error reading enhanced citations directory:', error.message);
  process.exit(1);
}

// Get current loader mappings
let loaderMappings = [];
try {
  const loaderFile = fs.readFileSync('./js/EnhancedCitationLoader.js', 'utf8');
  const mappingMatches = loaderFile.matchAll(/{\s*id:\s*(\d+),\s*file:\s*'([^']+)',\s*globalVar:\s*'([^']+)'\s*}/g);
  for (const match of mappingMatches) {
    loaderMappings.push({
      id: parseInt(match[1]),
      file: match[2],
      globalVar: match[3]
    });
  }
} catch (error) {
  console.log('❌ Error reading loader file:', error.message);
  process.exit(1);
}

console.log(`\n📊 Real Supplements Status:`);
console.log(`   Real supplement citation files: ${realSupplementFiles.length}`);
console.log(`   Current loader mappings: ${loaderMappings.length}`);

// Find missing mappings for real supplements
const mappedIds = loaderMappings.map(m => m.id);
const missingMappings = realSupplementFiles.filter(file => !mappedIds.includes(file.id));

console.log(`   Missing mappings for real supplements: ${missingMappings.length}`);

if (missingMappings.length === 0) {
  console.log('\n✅ All real supplement citation files have loader mappings!');
  process.exit(0);
}

console.log('\n🎯 REAL SUPPLEMENTS NEEDING LOADER MAPPINGS:');
console.log('='.repeat(80));

// Group by priority
const highPriority = missingMappings.filter(s => s.id <= 30); // Core supplements
const mediumPriority = missingMappings.filter(s => s.id > 30 && s.id <= 60); // Extended supplements
const lowPriority = missingMappings.filter(s => s.id > 60); // Specialized supplements

console.log(`\n🔴 HIGH PRIORITY (IDs 1-30): ${highPriority.length} supplements`);
highPriority.forEach(supplement => {
  const globalVarName = supplement.supplementName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Enhanced';
  
  console.log(`   ID ${supplement.id}: ${supplement.supplementName}`);
  console.log(`      { id: ${supplement.id}, file: '${supplement.filename}', globalVar: '${globalVarName}' },`);
});

console.log(`\n🟡 MEDIUM PRIORITY (IDs 31-60): ${mediumPriority.length} supplements`);
mediumPriority.forEach(supplement => {
  const globalVarName = supplement.supplementName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Enhanced';
  
  console.log(`   ID ${supplement.id}: ${supplement.supplementName}`);
  console.log(`      { id: ${supplement.id}, file: '${supplement.filename}', globalVar: '${globalVarName}' },`);
});

console.log(`\n🟢 LOW PRIORITY (IDs 61+): ${lowPriority.length} supplements`);
lowPriority.forEach(supplement => {
  const globalVarName = supplement.supplementName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Enhanced';
  
  console.log(`   ID ${supplement.id}: ${supplement.supplementName}`);
  console.log(`      { id: ${supplement.id}, file: '${supplement.filename}', globalVar: '${globalVarName}' },`);
});

console.log('\n📋 COMPLETE LOADER MAPPINGS TO ADD:');
console.log('='.repeat(50));
console.log('Add these lines to js/EnhancedCitationLoader.js:');
console.log('');

const allMissing = [...highPriority, ...mediumPriority, ...lowPriority];
allMissing.forEach(supplement => {
  const globalVarName = supplement.supplementName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Enhanced';
  
  console.log(`            { id: ${supplement.id}, file: '${supplement.filename}', globalVar: '${globalVarName}' },`);
});

// Calculate potential success rate
const currentWorkingEstimate = 55; // From our last test
const potentialWorking = currentWorkingEstimate + missingMappings.length;
const totalSupplements = 89;
const potentialSuccessRate = Math.round((potentialWorking / totalSupplements) * 100);

console.log(`\n📈 POTENTIAL IMPACT:`);
console.log(`   Current working (estimated): ${currentWorkingEstimate}/89 (62%)`);
console.log(`   After adding mappings: ${potentialWorking}/89 (${potentialSuccessRate}%)`);
console.log(`   Improvement: +${missingMappings.length} supplements (+${Math.round((missingMappings.length / totalSupplements) * 100)}%)`);

console.log('\n🎯 IMPLEMENTATION STRATEGY:');
console.log('1. Add high priority mappings first (core supplements)');
console.log('2. Test to verify they work correctly');
console.log('3. Add medium and low priority mappings');
console.log('4. Run comprehensive test to measure final success rate');

console.log('\n✅ Real supplement analysis complete!');
