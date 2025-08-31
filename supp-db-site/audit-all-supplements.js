const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE SUPPLEMENT AUDIT');
console.log('Identifying supplements that need enhanced citations...');

// Read supplements database
let supplementsData;
try {
  const supplementsFile = fs.readFileSync('./data/supplements.js', 'utf8');
  // Extract the supplements array from the file
  const supplementsMatch = supplementsFile.match(/"supplements":\s*\[([\s\S]*?)\]\s*}/);
  if (supplementsMatch) {
    // Parse the supplements array
    const supplementsArrayText = '[' + supplementsMatch[1] + ']';
    // Clean up the text to make it valid JSON
    const cleanedText = supplementsArrayText
      .replace(/\/\/.*$/gm, '') // Remove comments
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote property names
      .replace(/:\s*([^",\[\{][^,\]\}]*)/g, (match, value) => {
        // Quote unquoted string values
        const trimmed = value.trim();
        if (trimmed === 'true' || trimmed === 'false' || !isNaN(trimmed) || trimmed.startsWith('"') || trimmed.startsWith('[') || trimmed.startsWith('{')) {
          return ': ' + trimmed;
        }
        return ': "' + trimmed + '"';
      });
    
    try {
      supplementsData = JSON.parse(cleanedText);
    } catch (e) {
      console.log('❌ Could not parse supplements as JSON, reading manually...');
      supplementsData = null;
    }
  }
} catch (error) {
  console.log('❌ Error reading supplements file:', error.message);
}

// If JSON parsing failed, read the file manually
if (!supplementsData) {
  console.log('📋 Reading supplements manually from file...');
  const supplementsFile = fs.readFileSync('./data/supplements.js', 'utf8');
  const lines = supplementsFile.split('\n');
  
  supplementsData = [];
  let currentSupplement = null;
  let inSupplementBlock = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for supplement ID
    const idMatch = trimmed.match(/"id":\s*(\d+)/);
    if (idMatch) {
      if (currentSupplement) {
        supplementsData.push(currentSupplement);
      }
      currentSupplement = { id: parseInt(idMatch[1]) };
      inSupplementBlock = true;
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
    if (trimmed === '},' || (trimmed === '}' && inSupplementBlock)) {
      if (currentSupplement && currentSupplement.id && currentSupplement.name) {
        supplementsData.push(currentSupplement);
      }
      currentSupplement = null;
      inSupplementBlock = false;
    }
  }
  
  // Add the last supplement if exists
  if (currentSupplement && currentSupplement.id && currentSupplement.name) {
    supplementsData.push(currentSupplement);
  }
}

console.log(`\n📊 Database Overview:`);
console.log(`   Total supplements found: ${supplementsData.length}`);

// Check which enhanced citation files exist
const enhancedCitationsDir = './data/enhanced_citations';
let existingFiles = [];
try {
  existingFiles = fs.readdirSync(enhancedCitationsDir)
    .filter(file => file.endsWith('_enhanced.js'))
    .map(file => {
      const match = file.match(/^(\d+)_/);
      return match ? parseInt(match[1]) : null;
    })
    .filter(id => id !== null);
} catch (error) {
  console.log('❌ Error reading enhanced citations directory:', error.message);
}

console.log(`   Enhanced citation files found: ${existingFiles.length}`);

// Check loader mappings
let loaderMappings = [];
try {
  const loaderFile = fs.readFileSync('./js/EnhancedCitationLoader.js', 'utf8');
  const mappingMatches = loaderFile.matchAll(/{\s*id:\s*(\d+),\s*file:/g);
  for (const match of mappingMatches) {
    loaderMappings.push(parseInt(match[1]));
  }
} catch (error) {
  console.log('❌ Error reading loader file:', error.message);
}

console.log(`   Loader mappings found: ${loaderMappings.length}`);

// Categorize supplements
const supplementsWithEnhanced = supplementsData.filter(s => s.isEnhanced);
const supplementsWithFiles = supplementsData.filter(s => existingFiles.includes(s.id));
const supplementsWithLoaderMappings = supplementsData.filter(s => loaderMappings.includes(s.id));

console.log(`   Supplements marked as enhanced: ${supplementsWithEnhanced.length}`);
console.log(`   Supplements with citation files: ${supplementsWithFiles.length}`);
console.log(`   Supplements with loader mappings: ${supplementsWithLoaderMappings.length}`);

// Find supplements that need work
const needsEnhancedCitations = supplementsData.filter(s => 
  !existingFiles.includes(s.id) || !loaderMappings.includes(s.id)
);

console.log('\n' + '='.repeat(80));
console.log('🎯 SUPPLEMENTS NEEDING ENHANCED CITATIONS');
console.log('='.repeat(80));

console.log(`\n📋 Total supplements needing enhanced citations: ${needsEnhancedCitations.length}`);

// Group by category
const byCategory = {};
needsEnhancedCitations.forEach(supplement => {
  const category = supplement.category || 'Unknown';
  if (!byCategory[category]) {
    byCategory[category] = [];
  }
  byCategory[category].push(supplement);
});

console.log('\n📊 Breakdown by Category:');
Object.keys(byCategory).sort().forEach(category => {
  console.log(`\n${category} (${byCategory[category].length} supplements):`);
  byCategory[category].forEach(supplement => {
    const hasFile = existingFiles.includes(supplement.id) ? '📄' : '❌';
    const hasMapping = loaderMappings.includes(supplement.id) ? '🔗' : '❌';
    const isMarkedEnhanced = supplement.isEnhanced ? '✅' : '❌';
    console.log(`   ${supplement.id}: ${supplement.name} ${hasFile}${hasMapping}${isMarkedEnhanced}`);
  });
});

console.log('\n📝 Legend:');
console.log('   📄 = Has citation file');
console.log('   🔗 = Has loader mapping');
console.log('   ✅ = Marked as enhanced in database');

// Priority recommendations
console.log('\n🎯 PRIORITY RECOMMENDATIONS:');

const highPriority = needsEnhancedCitations.filter(s => 
  ['Essential Nutrients', 'Nootropic', 'Adaptogen'].includes(s.category)
);

const mediumPriority = needsEnhancedCitations.filter(s => 
  ['Herbal Supplement', 'Antioxidants', 'Sports Nutrition'].includes(s.category)
);

const lowPriority = needsEnhancedCitations.filter(s => 
  !['Essential Nutrients', 'Nootropic', 'Adaptogen', 'Herbal Supplement', 'Antioxidants', 'Sports Nutrition'].includes(s.category)
);

console.log(`\n🔴 HIGH PRIORITY (${highPriority.length}): Essential Nutrients, Nootropics, Adaptogens`);
highPriority.slice(0, 10).forEach(s => {
  console.log(`   ${s.id}: ${s.name} (${s.category})`);
});
if (highPriority.length > 10) {
  console.log(`   ... and ${highPriority.length - 10} more`);
}

console.log(`\n🟡 MEDIUM PRIORITY (${mediumPriority.length}): Herbal, Antioxidants, Sports Nutrition`);
mediumPriority.slice(0, 10).forEach(s => {
  console.log(`   ${s.id}: ${s.name} (${s.category})`);
});
if (mediumPriority.length > 10) {
  console.log(`   ... and ${mediumPriority.length - 10} more`);
}

console.log(`\n🟢 LOW PRIORITY (${lowPriority.length}): Other categories`);
lowPriority.slice(0, 5).forEach(s => {
  console.log(`   ${s.id}: ${s.name} (${s.category || 'Unknown'})`);
});
if (lowPriority.length > 5) {
  console.log(`   ... and ${lowPriority.length - 5} more`);
}

// Implementation roadmap
console.log('\n🗺️ IMPLEMENTATION ROADMAP:');
console.log('\nPhase 1: High Priority Supplements (Essential & Cognitive)');
console.log('- Focus on supplements with strong research base');
console.log('- Target: Complete within 2-3 weeks');
console.log(`- Count: ${highPriority.length} supplements`);

console.log('\nPhase 2: Medium Priority Supplements (Popular & Well-Researched)');
console.log('- Focus on commonly used supplements');
console.log('- Target: Complete within 4-6 weeks');
console.log(`- Count: ${mediumPriority.length} supplements`);

console.log('\nPhase 3: Low Priority Supplements (Specialized & Niche)');
console.log('- Complete remaining supplements');
console.log('- Target: Complete within 8-10 weeks');
console.log(`- Count: ${lowPriority.length} supplements`);

console.log('\n📈 CURRENT PROGRESS:');
const totalSupplements = supplementsData.length;
const completedSupplements = supplementsWithFiles.length;
const progressPercentage = Math.round((completedSupplements / totalSupplements) * 100);

console.log(`   Completed: ${completedSupplements}/${totalSupplements} (${progressPercentage}%)`);
console.log(`   Remaining: ${needsEnhancedCitations.length} supplements`);
console.log(`   Target: 100% enhanced citations for all ${totalSupplements} supplements`);

console.log('\n✅ Audit complete - ready for systematic enhancement!');
