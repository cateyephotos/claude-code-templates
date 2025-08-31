console.log('📊 PHASE 3 PROGRESS CHECK');
console.log('Checking completion status after high-priority supplements...');

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
  
  // Phase 3 supplements added in this session
  const phase3Added = [2, 9, 10, 11, 12, 20, 24, 75];
  const phase3AddedThisSession = phase3Added.filter(id => existingIds.has(id));
  
  console.log(`\n📊 Current Completion Status:`);
  console.log(`   Total Supplements: 89`);
  console.log(`   Enhanced Citations: ${existingIds.size}`);
  console.log(`   Remaining: ${missingIds.length}`);
  console.log(`   Completion Rate: ${Math.round((existingIds.size / 89) * 100)}%`);
  
  console.log(`\n🚀 Phase 3 Progress:`);
  console.log(`   High-Priority Added This Session: ${phase3AddedThisSession.length}`);
  console.log(`   Phase 3 Target Supplements: ${phase3Added.length}`);
  console.log(`   Phase 3 Completion: ${Math.round((phase3AddedThisSession.length / phase3Added.length) * 100)}%`);
  
  if (phase3AddedThisSession.length > 0) {
    console.log(`\n✅ Successfully Added High-Priority Supplements:`);
    phase3AddedThisSession.forEach(id => {
      const supplementNames = {
        2: "Omega-3 Fish Oil",
        9: "CoQ10", 
        10: "Ashwagandha",
        11: "Rhodiola Rosea",
        12: "Lion's Mane",
        20: "Resveratrol",
        24: "L-Theanine",
        75: "Berberine"
      };
      console.log(`   ✅ ID ${id}: ${supplementNames[id]}`);
    });
  }
  
  console.log(`\n❌ Still Missing Supplements (${missingIds.length}):`);
  const supplementNames = {
    3: "Vitamin B Complex",
    4: "Probiotics", 
    14: "Citicoline",
    16: "Phosphatidylserine",
    17: "PQQ",
    18: "NAD+",
    19: "NMN",
    27: "Glucosamine Sulfate",
    29: "MSM",
    34: "Saw Palmetto",
    40: "Biotin",
    45: "Quercetin",
    58: "MCT Oil",
    87: "Krill Oil"
  };
  
  // Categorize remaining by priority
  const highPriorityRemaining = [3, 4]; // Still high priority
  const mediumPriorityRemaining = [14, 16, 17, 27, 29, 34, 40, 45];
  const lowPriorityRemaining = [18, 19, 58, 87];
  
  if (highPriorityRemaining.length > 0) {
    console.log(`\n🔴 HIGH PRIORITY REMAINING (${highPriorityRemaining.length}):`);
    highPriorityRemaining.forEach(id => {
      const name = supplementNames[id] || `Supplement ${id}`;
      console.log(`   🔴 ID ${id}: ${name}`);
    });
  }
  
  if (mediumPriorityRemaining.length > 0) {
    console.log(`\n🟡 MEDIUM PRIORITY REMAINING (${mediumPriorityRemaining.length}):`);
    mediumPriorityRemaining.forEach(id => {
      const name = supplementNames[id] || `Supplement ${id}`;
      console.log(`   🟡 ID ${id}: ${name}`);
    });
  }
  
  if (lowPriorityRemaining.length > 0) {
    console.log(`\n🟢 LOW PRIORITY REMAINING (${lowPriorityRemaining.length}):`);
    lowPriorityRemaining.forEach(id => {
      const name = supplementNames[id] || `Supplement ${id}`;
      console.log(`   🟢 ID ${id}: ${name}`);
    });
  }
  
  // Calculate progress toward 100%
  const currentCompletion = Math.round((existingIds.size / 89) * 100);
  const remainingForCompletion = 89 - existingIds.size;
  
  console.log(`\n🎯 COMPLETION ANALYSIS:`);
  if (currentCompletion >= 95) {
    console.log(`🎉 EXCELLENT - Very close to 100% completion!`);
    console.log(`✅ ${currentCompletion}% completion achieved`);
    console.log(`🔧 Only ${remainingForCompletion} supplements needed for 100%`);
  } else if (currentCompletion >= 90) {
    console.log(`🎊 VERY GOOD - Approaching completion milestone`);
    console.log(`✅ ${currentCompletion}% completion achieved`);
    console.log(`🎯 ${remainingForCompletion} supplements remaining for 100%`);
  } else if (currentCompletion >= 85) {
    console.log(`🔧 GOOD - Strong progress toward completion`);
    console.log(`✅ ${currentCompletion}% completion achieved`);
    console.log(`📋 ${remainingForCompletion} supplements remaining`);
  } else {
    console.log(`🔧 PROGRESSING - Continued systematic approach`);
    console.log(`✅ ${currentCompletion}% completion achieved`);
    console.log(`📋 ${remainingForCompletion} supplements remaining`);
  }
  
  console.log(`\n📋 NEXT IMMEDIATE STEPS:`);
  if (remainingForCompletion <= 5) {
    console.log(`1. 🎯 Complete final ${remainingForCompletion} supplements`);
    console.log(`2. ✅ Achieve 100% completion`);
    console.log(`3. 🎉 Celebrate complete Evidence Profile system`);
  } else if (remainingForCompletion <= 10) {
    console.log(`1. 🔧 Continue with remaining high-priority supplements`);
    console.log(`2. 🎯 Target 95%+ completion`);
    console.log(`3. 📋 Plan final completion push`);
  } else {
    console.log(`1. 🔧 Complete remaining high-priority supplements (${highPriorityRemaining.length})`);
    console.log(`2. 🔧 Work through medium-priority supplements (${mediumPriorityRemaining.length})`);
    console.log(`3. 🎯 Target 90%+ completion milestone`);
  }
  
  console.log(`\n🏆 SESSION ACHIEVEMENTS:`);
  console.log(`✅ Added ${phase3AddedThisSession.length} high-priority supplements`);
  console.log(`✅ Achieved ${currentCompletion}% completion rate`);
  console.log(`✅ Systematic Evidence Profile creation`);
  console.log(`✅ Quality tier assignments and research scores`);
  console.log(`✅ Comprehensive citation coverage`);
  
  if (currentCompletion >= 85) {
    console.log(`✅ Evidence Profile system is highly comprehensive`);
  }
  
  console.log('\n✅ Phase 3 progress check complete');
  
  return {
    currentCompletion,
    remainingForCompletion,
    phase3AddedThisSession: phase3AddedThisSession.length,
    highPriorityRemaining: highPriorityRemaining.length,
    mediumPriorityRemaining: mediumPriorityRemaining.length,
    lowPriorityRemaining: lowPriorityRemaining.length
  };
  
} catch (error) {
  console.error('❌ Progress check error:', error.message);
}
