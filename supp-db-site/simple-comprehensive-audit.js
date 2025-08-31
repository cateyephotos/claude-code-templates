const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Simple Comprehensive Audit - All Enhanced Supplements');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all enhanced supplements and their expected counts
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
              expectedMechanisms: data.citations?.mechanisms?.length || 0,
              expectedBenefits: data.citations?.benefits?.length || 0,
              expectedSafety: data.citations?.safety?.length || 0
            });
          }
        });
      }
      return enhanced.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    console.log(`\n📊 Testing ${enhancedSupplements.length} enhanced supplements`);
    console.log('='.repeat(80));
    
    const results = {
      perfect: [],
      good: [],
      issues: [],
      errors: []
    };
    
    const issueTracker = {};
    
    for (let i = 0; i < enhancedSupplements.length; i++) {
      const supplement = enhancedSupplements[i];
      
      if (i % 10 === 0) {
        console.log(`\n📈 Progress: ${i}/${enhancedSupplements.length}`);
      }
      
      console.log(`🔍 ${supplement.name}`);
      
      // Search and open modal
      await page.fill('#searchInput', supplement.name);
      await page.waitForTimeout(300);
      
      const modalResult = await page.evaluate(async (suppId) => {
        try {
          await window.app.showSupplementDetails(suppId);
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, supplement.id);
      
      if (!modalResult.success) {
        console.log(`   ❌ Modal Error`);
        results.errors.push({ ...supplement, type: 'modal', error: modalResult.error });
        continue;
      }
      
      await page.waitForTimeout(200);
      
      // Test tab counts
      const tabCounts = await page.evaluate((suppId) => {
        const counts = {};
        ['mechanisms', 'benefits', 'safety'].forEach(type => {
          const container = document.getElementById(`${type}-${suppId}`);
          counts[type] = container ? container.querySelectorAll('.enhanced-citation-card').length : 0;
        });
        return counts;
      }, supplement.id);
      
      // Check for issues
      const problems = [];
      
      if (tabCounts.mechanisms !== supplement.expectedMechanisms) {
        problems.push(`M:${tabCounts.mechanisms}≠${supplement.expectedMechanisms}`);
      }
      if (tabCounts.benefits !== supplement.expectedBenefits) {
        problems.push(`B:${tabCounts.benefits}≠${supplement.expectedBenefits}`);
      }
      if (tabCounts.safety !== supplement.expectedSafety) {
        problems.push(`S:${tabCounts.safety}≠${supplement.expectedSafety}`);
      }
      
      // Quick benefits quality check
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(100);
        
        const qualityIssues = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container || container.classList.contains('hidden')) return [];
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const issues = [];
          
          cards.forEach(card => {
            const title = card.querySelector('h5')?.textContent?.trim();
            const text = card.textContent;
            
            if (['Sleep Quality', 'Health Benefits', 'Antioxidant Support', 'Cognitive Enhancement'].includes(title)) {
              issues.push('Generic title');
            }
            if (text.includes('undefined')) {
              issues.push('Undefined');
            }
          });
          
          return [...new Set(issues)];
        }, supplement.id);
        
        problems.push(...qualityIssues);
      }
      
      // Track issues
      problems.forEach(issue => {
        issueTracker[issue] = (issueTracker[issue] || 0) + 1;
      });
      
      // Categorize
      if (problems.length === 0) {
        results.perfect.push(supplement);
        console.log(`   🎉 Perfect`);
      } else if (problems.length <= 2) {
        results.good.push({ ...supplement, issues: problems });
        console.log(`   ✅ Good (${problems.join(', ')})`);
      } else {
        results.issues.push({ ...supplement, issues: problems });
        console.log(`   🔧 Issues (${problems.slice(0, 2).join(', ')})`);
      }
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 COMPREHENSIVE AUDIT RESULTS');
    console.log('='.repeat(80));
    
    const total = enhancedSupplements.length;
    console.log(`\n📊 Status Distribution (${total} supplements):`);
    console.log(`   🎉 Perfect: ${results.perfect.length} (${Math.round(results.perfect.length/total*100)}%)`);
    console.log(`   ✅ Good: ${results.good.length} (${Math.round(results.good.length/total*100)}%)`);
    console.log(`   🔧 Issues: ${results.issues.length} (${Math.round(results.issues.length/total*100)}%)`);
    console.log(`   ❌ Errors: ${results.errors.length} (${Math.round(results.errors.length/total*100)}%)`);
    
    const successRate = Math.round(((results.perfect.length + results.good.length) / total) * 100);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    // Most common issues
    if (Object.keys(issueTracker).length > 0) {
      console.log(`\n🔍 Most Common Issues:`);
      Object.entries(issueTracker)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .forEach(([issue, count]) => {
          console.log(`   • ${issue}: ${count} supplements`);
        });
    }
    
    // Specific problem supplements
    if (results.errors.length > 0) {
      console.log(`\n❌ MODAL ERRORS (${results.errors.length}):`);
      results.errors.slice(0, 5).forEach(supp => {
        console.log(`   ❌ ${supp.name}`);
      });
      if (results.errors.length > 5) console.log(`   ... and ${results.errors.length - 5} more`);
    }
    
    if (results.issues.length > 0) {
      console.log(`\n🔧 SUPPLEMENTS WITH ISSUES (${results.issues.length}):`);
      results.issues.slice(0, 10).forEach(supp => {
        console.log(`   🔧 ${supp.name}: ${supp.issues.slice(0, 3).join(', ')}`);
      });
      if (results.issues.length > 10) console.log(`   ... and ${results.issues.length - 10} more`);
    }
    
    // Action plan
    console.log(`\n💡 ACTION PLAN:`);
    
    const genericTitleCount = issueTracker['Generic title'] || 0;
    const undefinedCount = issueTracker['Undefined'] || 0;
    const tabIssueCount = Object.keys(issueTracker).filter(k => k.includes(':')).reduce((sum, k) => sum + issueTracker[k], 0);
    
    if (genericTitleCount > 0) {
      console.log(`   1. 🔧 Fix Generic Titles (${genericTitleCount} supplements)`);
      console.log(`      → Apply Melatonin fix: use specificClaim instead of healthDomain in benefit titles`);
    }
    
    if (undefinedCount > 0) {
      console.log(`   2. 🔧 Fix Undefined Values (${undefinedCount} supplements)`);
      console.log(`      → Improve data normalization to handle missing fields gracefully`);
    }
    
    if (tabIssueCount > 0) {
      console.log(`   3. 🔧 Fix Tab Count Mismatches (${tabIssueCount} issues)`);
      console.log(`      → Check data structure consistency and rendering logic`);
    }
    
    if (results.errors.length > 0) {
      console.log(`   4. 🚨 Fix Modal Errors (${results.errors.length} supplements)`);
      console.log(`      → Debug supplement loading and modal rendering issues`);
    }
    
    console.log(`\n🎯 OVERALL ASSESSMENT:`);
    if (successRate >= 90) {
      console.log(`   🎉 EXCELLENT! ${successRate}% working well. System is in great shape.`);
    } else if (successRate >= 75) {
      console.log(`   ✅ GOOD! ${successRate}% working well. Some improvements needed.`);
    } else {
      console.log(`   🔧 NEEDS WORK! ${successRate}% working well. Systematic fixes required.`);
    }
    
    console.log(`\n📋 PRIORITY ORDER:`);
    console.log(`   1. Fix modal errors (${results.errors.length} supplements)`);
    console.log(`   2. Apply generic title fix to all affected supplements`);
    console.log(`   3. Address undefined value issues`);
    console.log(`   4. Investigate tab count mismatches`);
    
  } catch (error) {
    console.error('❌ Audit error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive audit complete');
  }
})();
