const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Focused Data Structure & Rendering Audit');
  console.log('Identifying critical issues across enhanced supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get enhanced supplements data
    const enhancedSupplements = await page.evaluate(() => {
      const enhanced = [];
      if (window.enhancedCitations) {
        Object.keys(window.enhancedCitations).forEach(id => {
          const data = window.enhancedCitations[id];
          const supplement = window.app.supplements.find(s => s.id == id);
          if (supplement && data) {
            enhanced.push({
              id: parseInt(id),
              name: supplement.name,
              hasData: !!data.citations,
              mechanismsCount: data.citations?.mechanisms?.length || 0,
              benefitsCount: data.citations?.benefits?.length || 0,
              safetyCount: data.citations?.safety?.length || 0
            });
          }
        });
      }
      return enhanced.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    console.log(`\n📊 Testing ${enhancedSupplements.length} enhanced supplements`);
    console.log('='.repeat(80));
    
    const results = {
      excellent: [],
      good: [],
      needsWork: [],
      critical: []
    };
    
    // Test first 10 supplements for detailed analysis
    const testSupplements = enhancedSupplements.slice(0, 10);
    
    for (const supplement of testSupplements) {
      console.log(`\n🔍 Testing: ${supplement.name} (ID: ${supplement.id})`);
      console.log(`   Expected: M(${supplement.mechanismsCount}), B(${supplement.benefitsCount}), S(${supplement.safetyCount})`);
      
      // Search and open modal
      await page.fill('#searchInput', supplement.name);
      await page.waitForTimeout(1000);
      
      const modalResult = await page.evaluate(async (suppId) => {
        try {
          await window.app.showSupplementDetails(suppId);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, supplement.id);
      
      if (!modalResult.success) {
        console.log(`   ❌ Modal Error: ${modalResult.error}`);
        results.critical.push({ ...supplement, issue: 'Modal Error' });
        continue;
      }
      
      await page.waitForTimeout(1000);
      
      // Test tab separation
      const tabTest = await page.evaluate((suppId) => {
        const containers = ['mechanisms', 'benefits', 'safety'].map(type => {
          const container = document.getElementById(`${type}-${suppId}`);
          return {
            type: type,
            exists: !!container,
            cardCount: container ? container.querySelectorAll('.enhanced-citation-card').length : 0,
            isHidden: container ? container.classList.contains('hidden') : true
          };
        });
        
        return containers;
      }, supplement.id);
      
      console.log(`   Containers:`, tabTest.map(t => `${t.type}(${t.cardCount})`).join(', '));
      
      // Check for tab separation issues
      const mechanismsMatch = tabTest[0].cardCount === supplement.mechanismsCount;
      const benefitsMatch = tabTest[1].cardCount === supplement.benefitsCount;
      const safetyMatch = tabTest[2].cardCount === supplement.safetyCount;
      
      const allMatch = mechanismsMatch && benefitsMatch && safetyMatch;
      
      // Test Benefits tab specifically for title quality
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      let benefitsQuality = { hasIssues: false, issues: [] };
      
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(500);
        
        benefitsQuality = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container || container.classList.contains('hidden')) {
            return { hasIssues: true, issues: ['Benefits container not accessible'] };
          }
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const issues = [];
          
          cards.forEach((card, index) => {
            const title = card.querySelector('h5')?.textContent?.trim();
            const text = card.textContent;
            
            // Check for generic titles (main Melatonin issue)
            const genericTitles = ['Sleep Quality', 'Health Benefits', 'Antioxidant Support', 'Cognitive Enhancement', 'General Health'];
            if (genericTitles.some(generic => title === generic)) {
              issues.push(`Generic title: "${title}"`);
            }
            
            // Check for undefined values
            if (text.includes('undefined')) {
              issues.push('Contains undefined values');
            }
            
            // Check for missing data
            if (!title || title.length < 5) {
              issues.push('Missing/poor title');
            }
          });
          
          return {
            hasIssues: issues.length > 0,
            issues: [...new Set(issues)], // Remove duplicates
            cardCount: cards.length
          };
        }, supplement.id);
      }
      
      // Overall assessment
      const issues = [];
      if (!allMatch) issues.push('Tab separation issues');
      if (benefitsQuality.hasIssues) issues.push(...benefitsQuality.issues);
      
      const status = issues.length === 0 ? 'excellent' :
                    issues.length <= 2 ? 'good' :
                    issues.length <= 4 ? 'needsWork' : 'critical';
      
      results[status].push({
        ...supplement,
        issues: issues,
        tabSeparation: allMatch,
        benefitsQuality: benefitsQuality
      });
      
      const statusIcon = status === 'excellent' ? '🎉' : status === 'good' ? '✅' : status === 'needsWork' ? '🔧' : '❌';
      console.log(`   ${statusIcon} Status: ${status.toUpperCase()} ${issues.length > 0 ? '(' + issues.slice(0, 2).join(', ') + ')' : ''}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 FOCUSED AUDIT SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Status Distribution (${testSupplements.length} supplements tested):`);
    console.log(`   🎉 Excellent: ${results.excellent.length} supplements`);
    console.log(`   ✅ Good: ${results.good.length} supplements`);
    console.log(`   🔧 Needs Work: ${results.needsWork.length} supplements`);
    console.log(`   ❌ Critical: ${results.critical.length} supplements`);
    
    if (results.critical.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES:`);
      results.critical.forEach(supp => {
        console.log(`   ❌ ${supp.name}: ${supp.issue || supp.issues.join(', ')}`);
      });
    }
    
    if (results.needsWork.length > 0) {
      console.log(`\n🔧 NEEDS WORK:`);
      results.needsWork.forEach(supp => {
        console.log(`   🔧 ${supp.name}: ${supp.issues.slice(0, 2).join(', ')}`);
      });
    }
    
    if (results.good.length > 0) {
      console.log(`\n✅ GOOD (Minor issues):`);
      results.good.forEach(supp => {
        console.log(`   ✅ ${supp.name}: ${supp.issues.join(', ') || 'Minor issues'}`);
      });
    }
    
    if (results.excellent.length > 0) {
      console.log(`\n🎉 EXCELLENT (No issues):`);
      results.excellent.forEach(supp => {
        console.log(`   🎉 ${supp.name}`);
      });
    }
    
    // Identify common patterns
    const allIssues = [
      ...results.needsWork.flatMap(s => s.issues),
      ...results.critical.flatMap(s => s.issues || [s.issue])
    ];
    
    const issueFrequency = {};
    allIssues.forEach(issue => {
      issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
    });
    
    console.log(`\n🔍 Common Issue Patterns:`);
    Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .forEach(([issue, count]) => {
        console.log(`   • ${issue}: ${count} supplements`);
      });
    
    const successRate = Math.round(((results.excellent.length + results.good.length) / testSupplements.length) * 100);
    console.log(`\n🎯 Success Rate: ${successRate}% (${results.excellent.length + results.good.length}/${testSupplements.length} working well)`);
    
    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    
    if (issueFrequency['Generic title']) {
      console.log(`   🔧 Fix generic titles: Update benefit rendering to use specific claims instead of health domains`);
    }
    
    if (issueFrequency['Tab separation issues']) {
      console.log(`   🔧 Fix tab separation: Check for wrapper div issues in citation assembly`);
    }
    
    if (issueFrequency['Contains undefined values']) {
      console.log(`   🔧 Fix undefined values: Update data normalization to handle missing fields`);
    }
    
    if (results.critical.length > 0) {
      console.log(`   🚨 Priority: Fix critical modal/rendering errors first`);
    }
    
    console.log(`\n📋 Next Steps:`);
    console.log(`   1. Fix critical issues (${results.critical.length} supplements)`);
    console.log(`   2. Address common patterns (generic titles, tab separation)`);
    console.log(`   3. Test remaining ${enhancedSupplements.length - testSupplements.length} supplements`);
    console.log(`   4. Implement systematic fixes for identified patterns`);
    
  } catch (error) {
    console.error('❌ Audit error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Focused audit complete');
  }
})();
