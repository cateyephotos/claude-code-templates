const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Finding Phase 2 Supplement IDs...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const targetSupplements = [
    // Joint Support
    'Glucosamine', 'Chondroitin', 'Chondroitin Sulfate',
    // Essential Nutrients  
    'Folate', 'Folic Acid', 'Selenium', 'Chromium',
    // Herbal Supplements
    'Ginger', 'Garlic', 'Reishi'
  ];
  
  const results = [];
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📊 PHASE 2 SUPPLEMENT DISCOVERY');
    console.log('='.repeat(60));
    
    for (const supplementName of targetSupplements) {
      console.log(`\n🔍 Searching for: ${supplementName}`);
      
      await page.fill('#searchInput', supplementName);
      await page.waitForTimeout(1000);
      
      const supplementInfo = await page.evaluate((name) => {
        const allSupplements = window.app.supplements;
        
        // Try exact match first
        let supplement = allSupplements.find(s => 
          s.name.toLowerCase() === name.toLowerCase()
        );
        
        // Try partial match if exact fails
        if (!supplement) {
          supplement = allSupplements.find(s => 
            s.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(s.name.toLowerCase())
          );
        }
        
        if (!supplement) {
          return { error: `${name} supplement not found` };
        }
        
        return {
          id: supplement.id,
          name: supplement.name,
          category: supplement.category,
          evidenceTier: supplement.evidenceTier,
          hasEnhancedCitations: !!supplement.enhancedCitations?.isEnhanced,
          description: supplement.description?.substring(0, 100) + '...'
        };
      }, supplementName);
      
      if (!supplementInfo.error) {
        console.log(`   ✅ Found: ${supplementInfo.name} (ID: ${supplementInfo.id})`);
        console.log(`   📂 Category: ${supplementInfo.category}`);
        console.log(`   🏆 Tier: ${supplementInfo.evidenceTier}`);
        console.log(`   🔬 Enhanced: ${supplementInfo.hasEnhancedCitations ? 'Yes' : 'No'}`);
        
        results.push({ 
          searchTerm: supplementName, 
          found: true,
          ...supplementInfo 
        });
      } else {
        console.log(`   ❌ ${supplementInfo.error}`);
        results.push({ 
          searchTerm: supplementName, 
          found: false,
          error: supplementInfo.error 
        });
      }
    }
    
    // Categorize results
    console.log('\n' + '='.repeat(60));
    console.log('📋 PHASE 2 SUPPLEMENT CATEGORIZATION');
    console.log('='.repeat(60));
    
    const categories = {
      'Joint Support': [],
      'Essential Nutrients': [],
      'Herbal Supplements': [],
      'Other': [],
      'Not Found': []
    };
    
    results.forEach(result => {
      if (!result.found) {
        categories['Not Found'].push(result);
        return;
      }
      
      const category = result.category;
      if (category && category.includes('Joint')) {
        categories['Joint Support'].push(result);
      } else if (category && (category.includes('Vitamin') || category.includes('Mineral') || category.includes('Essential'))) {
        categories['Essential Nutrients'].push(result);
      } else if (category && (category.includes('Herb') || category.includes('Extract') || category.includes('Botanical'))) {
        categories['Herbal Supplements'].push(result);
      } else {
        categories['Other'].push(result);
      }
    });
    
    Object.entries(categories).forEach(([categoryName, supplements]) => {
      if (supplements.length > 0) {
        console.log(`\n🏷️ ${categoryName}:`);
        supplements.forEach(supp => {
          if (supp.found) {
            console.log(`   • ${supp.name} (ID: ${supp.id}, Tier ${supp.evidenceTier}) - ${supp.hasEnhancedCitations ? 'Enhanced' : 'Not Enhanced'}`);
          } else {
            console.log(`   • ${supp.searchTerm} - NOT FOUND`);
          }
        });
      }
    });
    
    // Priority recommendations
    console.log('\n' + '='.repeat(60));
    console.log('🎯 PHASE 2 IMPLEMENTATION PRIORITIES');
    console.log('='.repeat(60));
    
    const foundSupplements = results.filter(r => r.found && !r.hasEnhancedCitations);
    const tier1Supplements = foundSupplements.filter(s => s.evidenceTier <= 1);
    const tier2Supplements = foundSupplements.filter(s => s.evidenceTier === 2);
    
    console.log(`\n🥇 Tier 1 Priorities (${tier1Supplements.length}):`);
    tier1Supplements.forEach(supp => {
      console.log(`   1. ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
    });
    
    console.log(`\n🥈 Tier 2 Targets (${tier2Supplements.length}):`);
    tier2Supplements.forEach(supp => {
      console.log(`   • ${supp.name} (ID: ${supp.id}) - ${supp.category}`);
    });
    
    console.log(`\n📊 Phase 2 Summary:`);
    console.log(`   Total Found: ${results.filter(r => r.found).length}`);
    console.log(`   Already Enhanced: ${results.filter(r => r.found && r.hasEnhancedCitations).length}`);
    console.log(`   Ready for Enhancement: ${foundSupplements.length}`);
    console.log(`   Not Found: ${results.filter(r => !r.found).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Phase 2 supplement discovery complete');
  }
})();
