const fs = require('fs');

console.log('🔍 IDENTIFYING MISSING LOADER MAPPINGS');
console.log('Finding supplements with citation files but no loader mappings...');

// Get existing citation files
const enhancedCitationsDir = './data/enhanced_citations';
let existingFiles = [];
try {
  existingFiles = fs.readdirSync(enhancedCitationsDir)
    .filter(file => file.endsWith('_enhanced.js'))
    .map(file => {
      const match = file.match(/^(\d+)_(.+)_enhanced\.js$/);
      return match ? { 
        id: parseInt(match[1]), 
        filename: file,
        supplementName: match[2].replace(/_/g, ' ')
      } : null;
    })
    .filter(item => item !== null)
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

console.log(`\n📊 Current Status:`);
console.log(`   Citation files found: ${existingFiles.length}`);
console.log(`   Loader mappings found: ${loaderMappings.length}`);

// Find missing mappings
const mappedIds = loaderMappings.map(m => m.id);
const missingMappings = existingFiles.filter(file => !mappedIds.includes(file.id));

console.log(`   Missing mappings: ${missingMappings.length}`);

if (missingMappings.length === 0) {
  console.log('\n✅ All citation files have loader mappings!');
  process.exit(0);
}

console.log('\n🎯 SUPPLEMENTS WITH CITATION FILES BUT NO LOADER MAPPINGS:');
console.log('='.repeat(80));

missingMappings.forEach(supplement => {
  // Generate global variable name
  const globalVarName = supplement.supplementName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .split(' ')
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Enhanced';
  
  console.log(`\nID ${supplement.id}: ${supplement.supplementName}`);
  console.log(`   File: ${supplement.filename}`);
  console.log(`   Suggested mapping: { id: ${supplement.id}, file: '${supplement.filename}', globalVar: '${globalVarName}' }`);
});

console.log('\n📋 LOADER MAPPINGS TO ADD:');
console.log('='.repeat(50));
console.log('Add these lines to js/EnhancedCitationLoader.js:');
console.log('');

missingMappings.forEach(supplement => {
  const globalVarName = supplement.supplementName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Enhanced';
  
  console.log(`            { id: ${supplement.id}, file: '${supplement.filename}', globalVar: '${globalVarName}' },`);
});

console.log('\n🎯 NEXT STEPS:');
console.log('1. Add the above mappings to EnhancedCitationLoader.js');
console.log('2. Test the supplements to ensure they load correctly');
console.log('3. Run comprehensive test to verify improved success rate');
console.log(`4. Expected improvement: +${missingMappings.length} working supplements`);

// Calculate potential success rate
const currentWorkingEstimate = 55; // From our last test
const potentialWorking = currentWorkingEstimate + missingMappings.length;
const totalSupplements = 89;
const potentialSuccessRate = Math.round((potentialWorking / totalSupplements) * 100);

console.log(`\n📈 POTENTIAL IMPACT:`);
console.log(`   Current working (estimated): ${currentWorkingEstimate}/89`);
console.log(`   After adding mappings: ${potentialWorking}/89 (${potentialSuccessRate}%)`);
console.log(`   Improvement: +${missingMappings.length} supplements (+${Math.round((missingMappings.length / totalSupplements) * 100)}%)`);

console.log('\n✅ Analysis complete!');
