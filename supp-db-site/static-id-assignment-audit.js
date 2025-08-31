const fs = require('fs');
const path = require('path');

console.log('🔍 STATIC SUPPLEMENT ID ASSIGNMENT AUDIT');
console.log('Analyzing files directly for ID assignment issues...');

// Read supplements database
let supplementsData = {};
try {
  const supplementsContent = fs.readFileSync('data/supplements.js', 'utf8');
  // Extract supplements array using regex
  const supplementsMatch = supplementsContent.match(/window\.supplements\s*=\s*(\[[\s\S]*?\]);/);
  if (supplementsMatch) {
    const supplementsArrayStr = supplementsMatch[1];
    // Use eval to parse (not ideal but works for this analysis)
    const supplements = eval(supplementsArrayStr);
    supplements.forEach(supp => {
      if (supp.id && supp.name) {
        supplementsData[supp.id] = {
          id: supp.id,
          name: supp.name,
          scientificName: supp.scientificName || '',
          category: supp.category || '',
          evidenceTier: supp.evidenceTier || 'Unknown'
        };
      }
    });
  }
  console.log(`✅ Loaded ${Object.keys(supplementsData).length} supplements from database`);
} catch (error) {
  console.error('❌ Failed to read supplements database:', error.message);
  process.exit(1);
}

// Read Enhanced Citation Loader
let loaderMappings = {};
try {
  const loaderContent = fs.readFileSync('js/EnhancedCitationLoader.js', 'utf8');
  // Extract all ID mappings using regex
  const mappingMatches = loaderContent.matchAll(/{\s*id:\s*(\d+),\s*file:\s*['"]([^'"]+)['"],\s*globalVar:\s*['"]([^'"]+)['"]\s*}/g);
  for (const match of mappingMatches) {
    const id = parseInt(match[1]);
    const file = match[2];
    const globalVar = match[3];
    loaderMappings[id] = { id, file, globalVar };
  }
  console.log(`✅ Loaded ${Object.keys(loaderMappings).length} enhanced citation mappings from loader`);
} catch (error) {
  console.error('❌ Failed to read Enhanced Citation Loader:', error.message);
  process.exit(1);
}

// Read enhanced citation files to get their actual IDs and names
let enhancedCitationsData = {};
const enhancedDir = 'data/enhanced_citations';
try {
  const files = fs.readdirSync(enhancedDir);
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.includes('999_'));
  
  for (const file of jsFiles) {
    try {
      const content = fs.readFileSync(path.join(enhancedDir, file), 'utf8');
      
      // Extract ID assignment
      const idMatches = content.match(/window\.enhancedCitations\[(\d+)\]/g);
      if (idMatches) {
        const ids = idMatches.map(match => parseInt(match.match(/\[(\d+)\]/)[1]));
        const primaryId = ids[0]; // Use first ID found
        
        // Extract supplement name
        let name = 'Unknown';
        const nameMatches = content.match(/(?:supplementName|name):\s*["']([^"']+)["']/);
        if (nameMatches) {
          name = nameMatches[1];
        }
        
        // Extract scientific name
        let scientificName = '';
        const sciNameMatches = content.match(/scientificName:\s*["']([^"']+)["']/);
        if (sciNameMatches) {
          scientificName = sciNameMatches[1];
        }
        
        enhancedCitationsData[primaryId] = {
          id: primaryId,
          name: name,
          scientificName: scientificName,
          file: file,
          allIds: ids
        };
      }
    } catch (error) {
      console.warn(`⚠️ Failed to read ${file}:`, error.message);
    }
  }
  console.log(`✅ Analyzed ${Object.keys(enhancedCitationsData).length} enhanced citation files`);
} catch (error) {
  console.error('❌ Failed to read enhanced citations directory:', error.message);
  process.exit(1);
}

console.log('\n📊 STATIC ID ASSIGNMENT AUDIT RESULTS');
console.log('='.repeat(60));

// Analysis
const results = {
  correctAssignments: [],
  incorrectAssignments: [],
  loaderMismatches: [],
  duplicateIds: [],
  missingFromLoader: [],
  missingFromSupplements: []
};

// Check all IDs
const allIds = new Set([
  ...Object.keys(supplementsData).map(id => parseInt(id)),
  ...Object.keys(enhancedCitationsData).map(id => parseInt(id)),
  ...Object.keys(loaderMappings).map(id => parseInt(id))
]);

for (const id of allIds) {
  const supplement = supplementsData[id];
  const enhanced = enhancedCitationsData[id];
  const loader = loaderMappings[id];
  
  if (supplement && enhanced) {
    // Check name match
    const suppName = supplement.name.toLowerCase().trim();
    const enhName = enhanced.name.toLowerCase().trim();
    
    const isExactMatch = suppName === enhName;
    const isCloseMatch = suppName.includes(enhName) || enhName.includes(suppName) || 
                       (supplement.scientificName && enhanced.scientificName && 
                        supplement.scientificName.toLowerCase() === enhanced.scientificName.toLowerCase());
    
    if (isExactMatch || isCloseMatch) {
      results.correctAssignments.push({
        id,
        supplementName: supplement.name,
        enhancedName: enhanced.name,
        matchType: isExactMatch ? 'exact' : 'close',
        hasLoader: !!loader,
        loaderFile: loader?.file || 'Not in loader'
      });
    } else {
      results.incorrectAssignments.push({
        id,
        supplementName: supplement.name,
        enhancedName: enhanced.name,
        supplementScientific: supplement.scientificName,
        enhancedScientific: enhanced.scientificName,
        enhancedFile: enhanced.file,
        hasLoader: !!loader,
        loaderFile: loader?.file || 'Not in loader'
      });
    }
  }
  
  if (enhanced && loader) {
    // Check if loader file matches enhanced file
    if (!enhanced.file.includes(loader.file.replace('.js', '')) && 
        !loader.file.includes(enhanced.file.replace('.js', ''))) {
      results.loaderMismatches.push({
        id,
        enhancedFile: enhanced.file,
        loaderFile: loader.file,
        enhancedName: enhanced.name
      });
    }
  }
  
  if (enhanced && !loader) {
    results.missingFromLoader.push({
      id,
      enhancedName: enhanced.name,
      enhancedFile: enhanced.file
    });
  }
  
  if (supplement && !enhanced) {
    results.missingFromSupplements.push({
      id,
      supplementName: supplement.name,
      category: supplement.category,
      evidenceTier: supplement.evidenceTier
    });
  }
}

// Check for duplicate IDs in enhanced citations
const idCounts = {};
Object.values(enhancedCitationsData).forEach(enhanced => {
  enhanced.allIds.forEach(id => {
    idCounts[id] = (idCounts[id] || 0) + 1;
  });
});

for (const [id, count] of Object.entries(idCounts)) {
  if (count > 1) {
    const duplicates = Object.values(enhancedCitationsData)
      .filter(enhanced => enhanced.allIds.includes(parseInt(id)))
      .map(enhanced => ({ name: enhanced.name, file: enhanced.file }));
    results.duplicateIds.push({ id: parseInt(id), count, duplicates });
  }
}

// Display results
console.log(`\n📈 OVERVIEW:`);
console.log(`   ✅ Correct Assignments: ${results.correctAssignments.length}`);
console.log(`   ❌ Incorrect Assignments: ${results.incorrectAssignments.length}`);
console.log(`   🔄 Loader File Mismatches: ${results.loaderMismatches.length}`);
console.log(`   🔢 Duplicate IDs: ${results.duplicateIds.length}`);
console.log(`   ⚠️ Missing from Loader: ${results.missingFromLoader.length}`);
console.log(`   ⚠️ Missing Enhanced Citations: ${results.missingFromSupplements.length}`);

if (results.incorrectAssignments.length > 0) {
  console.log(`\n❌ INCORRECT ID ASSIGNMENTS (${results.incorrectAssignments.length}):`);
  results.incorrectAssignments.forEach(item => {
    console.log(`   🚨 ID ${item.id}:`);
    console.log(`      Supplement DB: "${item.supplementName}" (${item.supplementScientific || 'No scientific name'})`);
    console.log(`      Enhanced File: "${item.enhancedName}" (${item.enhancedScientific || 'No scientific name'})`);
    console.log(`      File: ${item.enhancedFile}`);
    console.log(`      In Loader: ${item.hasLoader ? '✅' : '❌'} (${item.loaderFile})`);
    console.log('');
  });
}

if (results.loaderMismatches.length > 0) {
  console.log(`\n🔄 LOADER FILE MISMATCHES (${results.loaderMismatches.length}):`);
  results.loaderMismatches.forEach(item => {
    console.log(`   ID ${item.id}: "${item.enhancedName}"`);
    console.log(`      Enhanced File: ${item.enhancedFile}`);
    console.log(`      Loader File: ${item.loaderFile}`);
    console.log('');
  });
}

if (results.duplicateIds.length > 0) {
  console.log(`\n🔢 DUPLICATE IDS (${results.duplicateIds.length}):`);
  results.duplicateIds.forEach(dup => {
    console.log(`   ID ${dup.id} used ${dup.count} times:`);
    dup.duplicates.forEach(item => {
      console.log(`      - "${item.name}" (${item.file})`);
    });
    console.log('');
  });
}

if (results.missingFromLoader.length > 0) {
  console.log(`\n⚠️ ENHANCED CITATIONS NOT IN LOADER (${results.missingFromLoader.length}):`);
  results.missingFromLoader.slice(0, 10).forEach(item => {
    console.log(`   ID ${item.id}: "${item.enhancedName}" (${item.enhancedFile})`);
  });
  if (results.missingFromLoader.length > 10) {
    console.log(`   ... and ${results.missingFromLoader.length - 10} more`);
  }
}

console.log(`\n✅ SAMPLE CORRECT ASSIGNMENTS (first 5):`);
results.correctAssignments.slice(0, 5).forEach(item => {
  console.log(`   ID ${item.id}: "${item.supplementName}" (${item.matchType} match, Loader: ${item.hasLoader ? '✅' : '❌'})`);
});

// Save results
fs.writeFileSync('static-id-assignment-audit-report.json', JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: {
    correctAssignments: results.correctAssignments.length,
    incorrectAssignments: results.incorrectAssignments.length,
    loaderMismatches: results.loaderMismatches.length,
    duplicateIds: results.duplicateIds.length,
    missingFromLoader: results.missingFromLoader.length,
    missingFromSupplements: results.missingFromSupplements.length
  },
  details: results
}, null, 2));

console.log('\n📄 Detailed report saved to: static-id-assignment-audit-report.json');
console.log('\n✅ Static ID assignment audit complete');
