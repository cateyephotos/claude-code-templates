console.log('🎯 PHASE 3: FINAL COMPLETION ANALYSIS');
console.log('Identifying remaining 11 supplements for 100% completion...');

const fs = require('fs');
const path = require('path');

try {
  // Get all supplement IDs from 1-89
  const allSupplementIds = Array.from({length: 89}, (_, i) => i + 1);
  
  // Get existing enhanced citation files
  const enhancedDir = './data/enhanced_citations';
  const files = fs.readdirSync(enhancedDir);
  
  // Extract IDs from existing enhanced citation files
  const existingIds = new Set();
  
  files.forEach(file => {
    const match = file.match(/^(\d+)_.*_enhanced\.js$/);
    if (match) {
      const id = parseInt(match[1]);
      if (id >= 1 && id <= 89) {
        existingIds.add(id);
      }
    }
  });
  
  // Find missing supplements
  const missingIds = allSupplementIds.filter(id => !existingIds.has(id));
  
  console.log(`\n📊 Completion Analysis:`);
  console.log(`   Total Supplements: 89`);
  console.log(`   Enhanced Citations: ${existingIds.size}`);
  console.log(`   Remaining: ${missingIds.length}`);
  console.log(`   Completion Rate: ${Math.round((existingIds.size / 89) * 100)}%`);
  
  console.log(`\n❌ Missing Supplement IDs (${missingIds.length}):`);
  missingIds.forEach(id => {
    console.log(`   ID ${id}: [Need to identify supplement name]`);
  });
  
  // Check if we can identify supplement names from the main database
  console.log(`\n🔍 Attempting to identify supplement names...`);
  
  // Common supplement mapping based on typical database structure
  const knownSupplements = {
    2: "Omega-3 Fish Oil",
    3: "Vitamin B Complex", 
    4: "Probiotics",
    9: "CoQ10",
    10: "Ashwagandha",
    11: "Rhodiola Rosea",
    12: "Lion's Mane",
    14: "Citicoline",
    16: "Phosphatidylserine",
    17: "PQQ",
    18: "NAD+",
    19: "NMN",
    20: "Resveratrol",
    24: "L-Theanine",
    27: "Glucosamine Sulfate",
    29: "MSM",
    34: "Saw Palmetto",
    40: "Biotin",
    45: "Quercetin",
    58: "MCT Oil",
    75: "Berberine",
    87: "Krill Oil"
  };
  
  console.log(`\n📋 Identified Missing Supplements:`);
  missingIds.forEach(id => {
    const name = knownSupplements[id] || `Unknown Supplement ${id}`;
    console.log(`   ID ${id}: ${name}`);
  });
  
  // Categorize by priority for Phase 3
  const highPriority = []; // Popular, well-researched
  const mediumPriority = []; // Moderate research
  const lowPriority = []; // Limited research
  
  missingIds.forEach(id => {
    const name = knownSupplements[id];
    if ([2, 3, 4, 9, 10, 11, 12, 20, 24, 75].includes(id)) {
      highPriority.push({id, name: name || `Supplement ${id}`});
    } else if ([14, 16, 17, 27, 29, 34, 40, 45].includes(id)) {
      mediumPriority.push({id, name: name || `Supplement ${id}`});
    } else {
      lowPriority.push({id, name: name || `Supplement ${id}`});
    }
  });
  
  console.log(`\n🎯 PHASE 3 PRIORITY CLASSIFICATION:`);
  
  if (highPriority.length > 0) {
    console.log(`\n🔴 HIGH PRIORITY (${highPriority.length}) - Popular & Well-Researched:`);
    highPriority.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name}`);
    });
  }
  
  if (mediumPriority.length > 0) {
    console.log(`\n🟡 MEDIUM PRIORITY (${mediumPriority.length}) - Moderate Research:`);
    mediumPriority.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name}`);
    });
  }
  
  if (lowPriority.length > 0) {
    console.log(`\n🟢 LOW PRIORITY (${lowPriority.length}) - Limited Research:`);
    lowPriority.forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name}`);
    });
  }
  
  console.log(`\n📋 PHASE 3 STRATEGY:`);
  console.log(`1. 🎯 Focus on HIGH PRIORITY supplements first (${highPriority.length})`);
  console.log(`2. 🔧 Complete MEDIUM PRIORITY supplements (${mediumPriority.length})`);
  console.log(`3. ✅ Finish LOW PRIORITY supplements (${lowPriority.length})`);
  console.log(`4. 🎉 Achieve 100% completion (89/89 supplements)`);
  
  console.log(`\n⏱️ ESTIMATED TIMELINE:`);
  const totalRemaining = missingIds.length;
  if (totalRemaining <= 5) {
    console.log(`   Week 1: Complete all ${totalRemaining} supplements`);
    console.log(`   Target: 1 week for 100% completion`);
  } else if (totalRemaining <= 10) {
    console.log(`   Week 1: High priority (${highPriority.length}) + Medium priority (${Math.min(mediumPriority.length, 5)})`);
    console.log(`   Week 2: Remaining supplements`);
    console.log(`   Target: 2 weeks for 100% completion`);
  } else {
    console.log(`   Week 1: High priority supplements (${highPriority.length})`);
    console.log(`   Week 2: Medium priority supplements (${mediumPriority.length})`);
    console.log(`   Week 3: Low priority supplements (${lowPriority.length})`);
    console.log(`   Target: 3 weeks for 100% completion`);
  }
  
  console.log(`\n🎯 IMMEDIATE NEXT STEPS:`);
  console.log(`1. 🔍 Verify supplement names and research availability`);
  console.log(`2. 🚀 Start with highest priority supplement`);
  console.log(`3. 📋 Create enhanced citations with Evidence Profiles`);
  console.log(`4. ✅ Test and validate each supplement`);
  console.log(`5. 🎉 Push toward 100% completion`);
  
  console.log('\n✅ Phase 3 analysis complete');
  
  return {
    totalRemaining: missingIds.length,
    missingIds,
    highPriority,
    mediumPriority,
    lowPriority,
    currentCompletion: Math.round((existingIds.size / 89) * 100)
  };
  
} catch (error) {
  console.error('❌ Analysis error:', error.message);
}
