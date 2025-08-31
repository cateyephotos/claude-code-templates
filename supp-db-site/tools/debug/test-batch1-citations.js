// Test Script for Batch 1 Enhanced Citations Validation
// Tests IDs: 26 (PQQ), 28 (Glucosamine), 29 (MSM), 30 (Vitamin E), 31 (Whey Protein)

console.log('🧪 Testing Batch 1 Enhanced Citations');
console.log('=====================================');

const batch1Ids = [26, 28, 29, 30, 31];
const supplementNames = {
  26: 'PQQ',
  28: 'Glucosamine', 
  29: 'MSM',
  30: 'Vitamin E',
  31: 'Whey Protein'
};

// Wait for page to load
setTimeout(() => {
  console.log('\n🔍 Checking Enhanced Citations Loading:');
  
  batch1Ids.forEach(id => {
    const citation = window.enhancedCitations?.[id];
    const name = supplementNames[id];
    
    if (citation) {
      console.log(`✅ ID ${id} (${name}): Enhanced citations loaded`);
      console.log(`   - Total citations: ${citation.citations?.mechanisms?.length || 0} mechanisms, ${citation.citations?.benefits?.length || 0} benefits`);
      console.log(`   - Evidence tier: ${citation.evidenceProfile?.overallQuality}`);
      console.log(`   - Quality score: ${citation.evidenceProfile?.researchQualityScore}`);
    } else {
      console.error(`❌ ID ${id} (${name}): Enhanced citations NOT loaded`);
    }
  });
  
  console.log('\n🎯 Checking Supplement Database Integration:');
  
  if (window.supplementDatabase?.supplements) {
    batch1Ids.forEach(id => {
      const supplement = window.supplementDatabase.supplements.find(s => s.id === id);
      const name = supplementNames[id];
      
      if (supplement) {
        if (supplement.enhancedCitations?.isEnhanced) {
          console.log(`✅ ID ${id} (${name}): Marked as enhanced in database`);
        } else {
          console.warn(`⚠️ ID ${id} (${name}): NOT marked as enhanced in database`);
        }
      } else {
        console.error(`❌ ID ${id} (${name}): Supplement not found in database`);
      }
    });
  } else {
    console.error('❌ Supplement database not loaded');
  }
  
  console.log('\n🔬 Testing Citation Data Structure:');
  
  batch1Ids.forEach(id => {
    const citation = window.enhancedCitations?.[id];
    const name = supplementNames[id];
    
    if (citation) {
      const tests = [
        { test: 'Has mechanisms array', pass: Array.isArray(citation.citations?.mechanisms) },
        { test: 'Has benefits array', pass: Array.isArray(citation.citations?.benefits) },
        { test: 'Has safety array', pass: Array.isArray(citation.citations?.safety) },
        { test: 'Has dosage array', pass: Array.isArray(citation.citations?.dosage) },
        { test: 'Has evidence profile', pass: !!citation.evidenceProfile },
        { test: 'Has quality assurance', pass: !!citation.qualityAssurance }
      ];
      
      const passed = tests.filter(t => t.pass).length;
      const total = tests.length;
      
      console.log(`${name} (ID ${id}): ${passed}/${total} structure tests passed`);
      
      if (passed < total) {
        tests.forEach(t => {
          if (!t.pass) console.log(`   ❌ ${t.test}`);
        });
      }
    }
  });
  
  console.log('\n📊 Enhanced Citations Summary:');
  const totalLoaded = batch1Ids.filter(id => window.enhancedCitations?.[id]).length;
  console.log(`✅ Successfully loaded: ${totalLoaded}/${batch1Ids.length} enhanced citations`);
  console.log(`🎯 Batch 1 completion: ${(totalLoaded/batch1Ids.length)*100}%`);
  
}, 2000); // Wait 2 seconds for all files to load