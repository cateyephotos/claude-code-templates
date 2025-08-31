const fs = require('fs');

console.log('🔍 COMPREHENSIVE SUPPLEMENT AUDIT FOR 89 SUPPLEMENTS');
console.log('Identifying which supplements need enhanced citations created...');

// Read supplements database manually
const supplementsFile = fs.readFileSync('./data/supplements.js', 'utf8');
const lines = supplementsFile.split('\n');

let allSupplements = [];
let currentSupplement = null;

for (const line of lines) {
  const trimmed = line.trim();
  
  // Look for supplement ID
  const idMatch = trimmed.match(/"id":\s*(\d+)/);
  if (idMatch) {
    if (currentSupplement) {
      allSupplements.push(currentSupplement);
    }
    currentSupplement = { id: parseInt(idMatch[1]) };
  }
  
  // Look for supplement name
  const nameMatch = trimmed.match(/"name":\s*"([^"]+)"/);
  if (nameMatch && currentSupplement) {
    currentSupplement.name = nameMatch[1];
  }
  
  // Look for category
  const categoryMatch = trimmed.match(/"category":\s*"([^"]+)"/);
  if (categoryMatch && currentSupplement) {
    currentSupplement.category = categoryMatch[1];
  }
  
  // Look for isEnhanced
  const enhancedMatch = trimmed.match(/"isEnhanced":\s*(true|false)/);
  if (enhancedMatch && currentSupplement) {
    currentSupplement.isEnhanced = enhancedMatch[1] === 'true';
  }
  
  // End of supplement block
  if (trimmed === '},' || (trimmed === '}' && currentSupplement)) {
    if (currentSupplement && currentSupplement.id && currentSupplement.name) {
      allSupplements.push(currentSupplement);
    }
    currentSupplement = null;
  }
}

// Add the last supplement if exists
if (currentSupplement && currentSupplement.id && currentSupplement.name) {
  allSupplements.push(currentSupplement);
}

// Filter to get supplements 1-89 only
const validSupplements = allSupplements
  .filter(s => s.id >= 1 && s.id <= 89)
  .sort((a, b) => a.id - b.id);

console.log(`\n📊 Database Overview:`);
console.log(`   Total supplements (IDs 1-89): ${validSupplements.length}`);

// Get existing citation files
const enhancedCitationsDir = './data/enhanced_citations';
let existingFiles = [];
try {
  existingFiles = fs.readdirSync(enhancedCitationsDir)
    .filter(file => file.endsWith('_enhanced.js'))
    .map(file => {
      const match = file.match(/^(\d+)_/);
      return match ? parseInt(match[1]) : null;
    })
    .filter(id => id !== null && id >= 1 && id <= 89);
} catch (error) {
  console.log('❌ Error reading enhanced citations directory:', error.message);
}

// Get loader mappings
let loaderMappings = [];
try {
  const loaderFile = fs.readFileSync('./js/EnhancedCitationLoader.js', 'utf8');
  const mappingMatches = loaderFile.matchAll(/{\s*id:\s*(\d+),\s*file:/g);
  for (const match of mappingMatches) {
    const id = parseInt(match[1]);
    if (id >= 1 && id <= 89) {
      loaderMappings.push(id);
    }
  }
} catch (error) {
  console.log('❌ Error reading loader file:', error.message);
}

console.log(`   Citation files (IDs 1-89): ${existingFiles.length}`);
console.log(`   Loader mappings (IDs 1-89): ${loaderMappings.length}`);

// Categorize supplements
const supplementsWithFiles = validSupplements.filter(s => existingFiles.includes(s.id));
const supplementsWithMappings = validSupplements.filter(s => loaderMappings.includes(s.id));
const supplementsNeedingFiles = validSupplements.filter(s => !existingFiles.includes(s.id));
const supplementsNeedingMappings = validSupplements.filter(s => existingFiles.includes(s.id) && !loaderMappings.includes(s.id));

console.log(`   Supplements with citation files: ${supplementsWithFiles.length}`);
console.log(`   Supplements with loader mappings: ${supplementsWithMappings.length}`);
console.log(`   Supplements needing citation files: ${supplementsNeedingFiles.length}`);
console.log(`   Supplements needing loader mappings: ${supplementsNeedingMappings.length}`);

console.log('\n' + '='.repeat(80));
console.log('🎯 SUPPLEMENTS NEEDING ENHANCED CITATIONS CREATED');
console.log('='.repeat(80));

console.log(`\n📋 Total supplements needing citation files: ${supplementsNeedingFiles.length}`);

// Group missing supplements by category
const missingByCategory = {};
supplementsNeedingFiles.forEach(supplement => {
  const category = supplement.category || 'Unknown';
  if (!missingByCategory[category]) {
    missingByCategory[category] = [];
  }
  missingByCategory[category].push(supplement);
});

console.log('\n📊 Missing Enhanced Citations by Category:');
Object.keys(missingByCategory).sort().forEach(category => {
  console.log(`\n${category} (${missingByCategory[category].length} supplements):`);
  missingByCategory[category].forEach(supplement => {
    console.log(`   ID ${supplement.id}: ${supplement.name}`);
  });
});

// Priority classification
const highPriority = supplementsNeedingFiles.filter(s => 
  ['Essential Nutrients', 'Nootropic', 'Adaptogen'].includes(s.category)
);

const mediumPriority = supplementsNeedingFiles.filter(s => 
  ['Herbal Supplement', 'Antioxidants', 'Sports Nutrition'].includes(s.category)
);

const lowPriority = supplementsNeedingFiles.filter(s => 
  !['Essential Nutrients', 'Nootropic', 'Adaptogen', 'Herbal Supplement', 'Antioxidants', 'Sports Nutrition'].includes(s.category)
);

console.log('\n🎯 PRIORITY CLASSIFICATION:');

console.log(`\n🔴 HIGH PRIORITY (${highPriority.length}): Essential Nutrients, Nootropics, Adaptogens`);
highPriority.forEach(s => {
  console.log(`   ID ${s.id}: ${s.name} (${s.category})`);
});

console.log(`\n🟡 MEDIUM PRIORITY (${mediumPriority.length}): Herbal, Antioxidants, Sports Nutrition`);
mediumPriority.forEach(s => {
  console.log(`   ID ${s.id}: ${s.name} (${s.category})`);
});

console.log(`\n🟢 LOW PRIORITY (${lowPriority.length}): Other categories`);
lowPriority.forEach(s => {
  console.log(`   ID ${s.id}: ${s.name} (${s.category || 'Unknown'})`);
});

// Also show supplements that need mappings
if (supplementsNeedingMappings.length > 0) {
  console.log('\n⚠️ SUPPLEMENTS WITH FILES BUT NO MAPPINGS:');
  supplementsNeedingMappings.forEach(s => {
    console.log(`   ID ${s.id}: ${s.name} (${s.category})`);
  });
}

console.log('\n📈 CURRENT PROGRESS:');
const totalSupplements = validSupplements.length;
const completedSupplements = supplementsWithMappings.length;
const progressPercentage = Math.round((completedSupplements / totalSupplements) * 100);

console.log(`   Completed: ${completedSupplements}/${totalSupplements} (${progressPercentage}%)`);
console.log(`   Need citation files: ${supplementsNeedingFiles.length}`);
console.log(`   Need mappings only: ${supplementsNeedingMappings.length}`);
console.log(`   Total remaining work: ${supplementsNeedingFiles.length + supplementsNeedingMappings.length}`);

console.log('\n🗺️ IMPLEMENTATION ROADMAP:');
console.log('\nPhase 1: High Priority Research & Implementation');
console.log(`- Create enhanced citations for ${highPriority.length} high-priority supplements`);
console.log('- Focus on essential nutrients and cognitive enhancers');
console.log('- Target: 2-3 weeks');

console.log('\nPhase 2: Medium Priority Research & Implementation');
console.log(`- Create enhanced citations for ${mediumPriority.length} medium-priority supplements`);
console.log('- Focus on popular herbal and sports supplements');
console.log('- Target: 4-6 weeks');

console.log('\nPhase 3: Low Priority Research & Implementation');
console.log(`- Create enhanced citations for ${lowPriority.length} low-priority supplements`);
console.log('- Complete remaining specialized supplements');
console.log('- Target: 8-10 weeks');

console.log('\n🎯 IMMEDIATE NEXT STEPS:');
console.log('1. Start with high-priority supplements (Essential Nutrients, Nootropics)');
console.log('2. Use engineer-guide documentation for research methodology');
console.log('3. Follow 20-year research window (2005-2025)');
console.log('4. Create 3-5 supplements per week to maintain quality');
console.log('5. Test each supplement after creation to verify functionality');

const estimatedWeeks = Math.ceil(supplementsNeedingFiles.length / 4); // 4 supplements per week
console.log(`\nEstimated completion time: ${estimatedWeeks} weeks for all ${supplementsNeedingFiles.length} supplements`);

console.log('\n✅ Comprehensive audit complete - ready for systematic enhancement!');
