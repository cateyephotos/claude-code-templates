const { chromium } = require('playwright');

(async () => {
  console.log('🔍 INVESTIGATING PQQ SUPPLEMENT CITATION RENDERING');
  console.log('Checking PQQ supplement ID and citation loading...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const pqqInvestigation = await page.evaluate(() => {
      const results = {
        pqqSearchResults: [],
        id17Details: null,
        id26Details: null,
        allSupplementNames: [],
        enhancedCitationsKeys: Object.keys(window.enhancedCitations || {}),
        pqqFileLoaded: false
      };
      
      // Search for PQQ in all enhanced citations
      if (window.enhancedCitations) {
        for (const [id, citation] of Object.entries(window.enhancedCitations)) {
          const name = citation.supplementName || citation.name || `Supplement ${id}`;
          results.allSupplementNames.push({ id: parseInt(id), name });
          
          // Check if this is PQQ
          if (name.toLowerCase().includes('pqq') || 
              name.toLowerCase().includes('pyrroloquinoline') ||
              citation.scientificName?.toLowerCase().includes('pyrroloquinoline')) {
            results.pqqSearchResults.push({
              id: parseInt(id),
              name: name,
              scientificName: citation.scientificName,
              hasEvidenceProfile: !!citation.evidenceProfile,
              hasCitations: !!citation.citations,
              citationStructure: citation.citations ? Object.keys(citation.citations) : []
            });
          }
        }
        
        // Check specific IDs
        if (window.enhancedCitations[17]) {
          const citation17 = window.enhancedCitations[17];
          results.id17Details = {
            name: citation17.supplementName || citation17.name,
            scientificName: citation17.scientificName,
            hasEvidenceProfile: !!citation17.evidenceProfile,
            hasCitations: !!citation17.citations,
            citationStructure: citation17.citations ? Object.keys(citation17.citations) : []
          };
        }
        
        if (window.enhancedCitations[26]) {
          const citation26 = window.enhancedCitations[26];
          results.id26Details = {
            name: citation26.supplementName || citation26.name,
            scientificName: citation26.scientificName,
            hasEvidenceProfile: !!citation26.evidenceProfile,
            hasCitations: !!citation26.citations,
            citationStructure: citation26.citations ? Object.keys(citation26.citations) : []
          };
          results.pqqFileLoaded = true;
        }
      }
      
      return results;
    });
    
    console.log('\n📊 PQQ INVESTIGATION RESULTS:');
    console.log('='.repeat(50));
    
    console.log(`\n🔍 Enhanced Citations Loaded: ${pqqInvestigation.enhancedCitationsKeys.length}`);
    console.log(`   IDs: ${pqqInvestigation.enhancedCitationsKeys.join(', ')}`);
    
    console.log(`\n🔍 PQQ Search Results: ${pqqInvestigation.pqqSearchResults.length} found`);
    if (pqqInvestigation.pqqSearchResults.length > 0) {
      pqqInvestigation.pqqSearchResults.forEach(result => {
        console.log(`   ✅ ID ${result.id}: ${result.name}`);
        console.log(`      Scientific Name: ${result.scientificName || 'Not specified'}`);
        console.log(`      Evidence Profile: ${result.hasEvidenceProfile ? '✅' : '❌'}`);
        console.log(`      Citations: ${result.hasCitations ? '✅' : '❌'} (${result.citationStructure.join(', ')})`);
      });
    } else {
      console.log('   ❌ No PQQ supplements found in enhanced citations');
    }
    
    console.log(`\n🔍 ID 17 Details:`);
    if (pqqInvestigation.id17Details) {
      console.log(`   Name: ${pqqInvestigation.id17Details.name}`);
      console.log(`   Scientific Name: ${pqqInvestigation.id17Details.scientificName || 'Not specified'}`);
      console.log(`   Evidence Profile: ${pqqInvestigation.id17Details.hasEvidenceProfile ? '✅' : '❌'}`);
      console.log(`   Citations: ${pqqInvestigation.id17Details.hasCitations ? '✅' : '❌'} (${pqqInvestigation.id17Details.citationStructure.join(', ')})`);
    } else {
      console.log('   ❌ No supplement found at ID 17');
    }
    
    console.log(`\n🔍 ID 26 Details:`);
    if (pqqInvestigation.id26Details) {
      console.log(`   Name: ${pqqInvestigation.id26Details.name}`);
      console.log(`   Scientific Name: ${pqqInvestigation.id26Details.scientificName || 'Not specified'}`);
      console.log(`   Evidence Profile: ${pqqInvestigation.id26Details.hasEvidenceProfile ? '✅' : '❌'}`);
      console.log(`   Citations: ${pqqInvestigation.id26Details.hasCitations ? '✅' : '❌'} (${pqqInvestigation.id26Details.citationStructure.join(', ')})`);
    } else {
      console.log('   ❌ No supplement found at ID 26');
    }
    
    console.log(`\n📋 PQQ File Status:`);
    console.log(`   PQQ Enhanced File Loaded: ${pqqInvestigation.pqqFileLoaded ? '✅' : '❌'}`);
    
    if (!pqqInvestigation.pqqFileLoaded) {
      console.log('\n🚨 ISSUE IDENTIFIED:');
      console.log('   The pqq_enhanced.js file exists but is not being loaded');
      console.log('   This means the Enhanced Citation Loader is not configured to load it');
    }
    
    console.log('\n📋 ALL SUPPLEMENT NAMES (first 20):');
    pqqInvestigation.allSupplementNames.slice(0, 20).forEach(supp => {
      console.log(`   ID ${supp.id}: ${supp.name}`);
    });
    
    if (pqqInvestigation.allSupplementNames.length > 20) {
      console.log(`   ... and ${pqqInvestigation.allSupplementNames.length - 20} more`);
    }
    
    return pqqInvestigation;
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ PQQ investigation complete');
  }
})();
