const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Extended Data Structure Audit - Testing All Enhanced Supplements');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all enhanced supplements
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
              mechanismsCount: data.citations?.mechanisms?.length || 0,
              benefitsCount: data.citations?.benefits?.length || 0,
              safetyCount: data.citations?.safety?.length || 0
            });
          }
        });
      }
      return enhanced.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    console.log(`\n📊 Testing ALL ${enhancedSupplements.length} enhanced supplements`);
    console.log('='.repeat(80));
    
    const results = {
      excellent: [],
      good: [],
      needsWork: [],
      critical: [],
      modalErrors: []
    };
    
    const issuePatterns = {};
    
    for (let i = 0; i < enhancedSupplements.length; i++) {
      const supplement = enhancedSupplements[i];
      
      // Progress indicator
      if (i % 10 === 0) {
        console.log(`\n📈 Progress: ${i}/${enhancedSupplements.length} (${Math.round(i/enhancedSupplements.length*100)}%)`);
      }
      
      console.log(`🔍 ${supplement.name} (${supplement.id})`);
      
      // Search and open modal
      await page.fill('#searchInput', supplement.name);
      await page.waitForTimeout(500);
      
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
        results.modalErrors.push({ ...supplement, error: modalResult.error });
        continue;
      }
      
      await page.waitForTimeout(300);
      
      // Quick tab separation test
      const tabTest = await page.evaluate((suppId, expected) => {
        const actual = {};
        const issues = [];
        
        ['mechanisms', 'benefits', 'safety'].forEach(type => {
          const container = document.getElementById(`${type}-${suppId}`);
          if (container) {
            actual[type] = container.querySelectorAll('.enhanced-citation-card').length;
            if (actual[type] !== expected[type + 'Count']) {
              issues.push(`${type}: ${actual[type]}≠${expected[type + 'Count']}`);
            }
          } else {
            issues.push(`${type}: missing container`);
          }
        });
        
        return { actual, issues, hasIssues: issues.length > 0 };
      }, supplement.id, supplement);
      
      // Quick benefits quality check
      let qualityIssues = [];
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(200);
        
        const qualityCheck = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container || container.classList.contains('hidden')) return [];
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const issues = [];
          
          cards.forEach((card, index) => {
            const title = card.querySelector('h5')?.textContent?.trim();
            const text = card.textContent;
            
            // Check for the main issues we found with Melatonin
            if (['Sleep Quality', 'Health Benefits', 'Antioxidant Support', 'Cognitive Enhancement'].includes(title)) {
              issues.push('Generic title');
            }
            if (text.includes('undefined')) {
              issues.push('Undefined values');
            }
            if (!title || title.length < 5) {
              issues.push('Missing title');
            }
          });
          
          return [...new Set(issues)];
        }, supplement.id);
        
        qualityIssues = qualityCheck;
      }
      
      // Categorize
      const allIssues = [...(tabTest.issues || []), ...qualityIssues];
      
      // Track issue patterns
      allIssues.forEach(issue => {
        issuePatterns[issue] = (issuePatterns[issue] || 0) + 1;
      });
      
      const status = allIssues.length === 0 ? 'excellent' :
                    allIssues.length <= 1 ? 'good' :
                    allIssues.length <= 3 ? 'needsWork' : 'critical';
      
      results[status].push({
        ...supplement,
        issues: allIssues,
        tabTest: tabTest
      });
      
      const icon = status === 'excellent' ? '🎉' : status === 'good' ? '✅' : status === 'needsWork' ? '🔧' : '❌';
      console.log(`   ${icon} ${allIssues.length === 0 ? 'Perfect' : allIssues.slice(0, 2).join(', ')}`);
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 COMPLETE ENHANCED SUPPLEMENTS AUDIT');
    console.log('='.repeat(80));
    
    const total = enhancedSupplements.length;
    console.log(`\n📊 Final Results (${total} supplements):`);
    console.log(`   🎉 Excellent: ${results.excellent.length} (${Math.round(results.excellent.length/total*100)}%)`);
    console.log(`   ✅ Good: ${results.good.length} (${Math.round(results.good.length/total*100)}%)`);
    console.log(`   🔧 Needs Work: ${results.needsWork.length} (${Math.round(results.needsWork.length/total*100)}%)`);
    console.log(`   ❌ Critical: ${results.critical.length} (${Math.round(results.critical.length/total*100)}%)`);
    console.log(`   💥 Modal Errors: ${results.modalErrors.length} (${Math.round(results.modalErrors.length/total*100)}%)`);
    
    const successRate = Math.round(((results.excellent.length + results.good.length) / total) * 100);
    console.log(`\n🎯 Overall Success Rate: ${successRate}%`);
    
    // Issue patterns
    if (Object.keys(issuePatterns).length > 0) {
      console.log(`\n🔍 Most Common Issues:`);
      Object.entries(issuePatterns)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([issue, count]) => {
          console.log(`   • ${issue}: ${count} supplements (${Math.round(count/total*100)}%)`);
        });
    }
    
    // Priority fixes
    if (results.critical.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES (Fix First):`);
      results.critical.slice(0, 5).forEach(supp => {
        console.log(`   ❌ ${supp.name}: ${supp.issues.join(', ')}`);
      });
    }
    
    if (results.modalErrors.length > 0) {
      console.log(`\n💥 MODAL ERRORS:`);
      results.modalErrors.slice(0, 5).forEach(supp => {
        console.log(`   💥 ${supp.name}: ${supp.error}`);
      });
    }
    
    if (results.needsWork.length > 0) {
      console.log(`\n🔧 NEEDS WORK:`);
      results.needsWork.slice(0, 10).forEach(supp => {
        console.log(`   🔧 ${supp.name}: ${supp.issues.join(', ')}`);
      });
    }
    
    // Recommendations
    console.log(`\n💡 SYSTEMATIC FIX PLAN:`);
    
    if (issuePatterns['Generic title'] > 0) {
      console.log(`   1. 🔧 Fix Generic Titles (${issuePatterns['Generic title']} supplements)`);
      console.log(`      → Update benefit rendering to use specificClaim instead of healthDomain`);
    }
    
    if (issuePatterns['Undefined values'] > 0) {
      console.log(`   2. 🔧 Fix Undefined Values (${issuePatterns['Undefined values']} supplements)`);
      console.log(`      → Improve data normalization to handle missing fields`);
    }
    
    const tabIssues = Object.keys(issuePatterns).filter(issue => issue.includes(':')).length;
    if (tabIssues > 0) {
      console.log(`   3. 🔧 Fix Tab Separation Issues (${tabIssues} supplements)`);
      console.log(`      → Check data structure consistency and container generation`);
    }
    
    if (results.modalErrors.length > 0) {
      console.log(`   4. 🚨 Fix Modal Errors (${results.modalErrors.length} supplements)`);
      console.log(`      → Debug supplement detail loading issues`);
    }
    
    console.log(`\n🎯 OVERALL ASSESSMENT:`);
    if (successRate >= 90) {
      console.log(`   🎉 EXCELLENT! ${successRate}% success rate. System is working very well.`);
      console.log(`   📋 Focus on fixing the few remaining issues for perfection.`);
    } else if (successRate >= 75) {
      console.log(`   ✅ GOOD! ${successRate}% success rate. Most supplements working well.`);
      console.log(`   📋 Address common patterns to improve further.`);
    } else {
      console.log(`   🔧 NEEDS WORK! ${successRate}% success rate. Significant improvements needed.`);
      console.log(`   📋 Systematic fixes required for common issues.`);
    }
    
  } catch (error) {
    console.error('❌ Extended audit error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Extended audit complete');
  }
})();
