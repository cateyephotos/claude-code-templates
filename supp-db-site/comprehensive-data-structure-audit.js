const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Comprehensive Data Structure & Rendering Audit');
  console.log('Identifying all issues similar to the Melatonin problems...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Get all enhanced supplements from the loader
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
              category: supplement.category,
              tier: supplement.evidenceTier,
              hasEnhanced: !!supplement.enhancedCitations?.isEnhanced,
              dataVersion: data.version,
              dataStructure: {
                hasSupplementId: !!data.supplementId,
                hasSupplementName: !!data.supplementName,
                hasIsEnhanced: !!data.isEnhanced,
                hasCitations: !!data.citations,
                citationSections: data.citations ? Object.keys(data.citations) : [],
                mechanismsCount: data.citations?.mechanisms?.length || 0,
                benefitsCount: data.citations?.benefits?.length || 0,
                safetyCount: data.citations?.safety?.length || 0
              }
            });
          }
        });
      }
      return enhanced.sort((a, b) => a.name.localeCompare(b.name));
    });
    
    console.log(`\n📊 Found ${enhancedSupplements.length} enhanced supplements to audit`);
    console.log('='.repeat(100));
    
    const auditResults = [];
    const issueCategories = {
      dataStructure: [],
      tabSeparation: [],
      citationQuality: [],
      renderingErrors: [],
      legacyFormat: []
    };
    
    for (const supplement of enhancedSupplements) {
      console.log(`\n🔍 Auditing: ${supplement.name} (ID: ${supplement.id})`);
      
      // 1. Data Structure Analysis
      const dataIssues = [];
      if (!supplement.dataStructure.hasSupplementId) dataIssues.push('Missing supplementId');
      if (!supplement.dataStructure.hasSupplementName) dataIssues.push('Missing supplementName');
      if (!supplement.dataStructure.hasIsEnhanced) dataIssues.push('Missing isEnhanced flag');
      if (!supplement.dataStructure.hasCitations) dataIssues.push('Missing citations object');
      if (supplement.dataStructure.citationSections.length === 0) dataIssues.push('No citation sections');
      if (supplement.dataStructure.mechanismsCount === 0) dataIssues.push('No mechanisms');
      if (supplement.dataStructure.benefitsCount === 0) dataIssues.push('No benefits');
      if (supplement.dataStructure.safetyCount === 0) dataIssues.push('No safety data');
      
      console.log(`   📋 Data Structure: ${dataIssues.length === 0 ? '✅ Good' : '❌ Issues: ' + dataIssues.join(', ')}`);
      
      // 2. Detailed Data Format Analysis
      const formatAnalysis = await page.evaluate((suppId) => {
        const data = window.enhancedCitations?.[suppId];
        if (!data) return { error: 'No data found' };
        
        const analyzeSection = (section, sectionName) => {
          if (!section || !Array.isArray(section)) {
            return { error: `${sectionName} is not an array` };
          }
          
          const formats = section.map((item, index) => {
            const keys = Object.keys(item);
            return {
              index: index,
              keys: keys,
              hasClaimField: keys.includes('claim'),
              hasStudiesField: keys.includes('studies'),
              hasEvidenceField: keys.includes('evidence'),
              hasCitationField: keys.includes('citation'),
              hasIdField: keys.includes('id'),
              format: keys.includes('claim') && keys.includes('studies') ? 'NEW_FORMAT' :
                     keys.includes('id') && keys.includes('citation') ? 'LEGACY_FORMAT' :
                     'UNKNOWN_FORMAT'
            };
          });
          
          return {
            count: section.length,
            formats: formats,
            consistentFormat: formats.every(f => f.format === formats[0]?.format),
            primaryFormat: formats[0]?.format || 'UNKNOWN'
          };
        };
        
        return {
          mechanisms: analyzeSection(data.citations?.mechanisms, 'mechanisms'),
          benefits: analyzeSection(data.citations?.benefits, 'benefits'),
          safety: analyzeSection(data.citations?.safety, 'safety')
        };
      }, supplement.id);
      
      console.log(`   🔧 Format Analysis:`, formatAnalysis);
      
      // 3. Test Modal and Tab Functionality
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
        auditResults.push({
          ...supplement,
          status: 'MODAL_ERROR',
          issues: ['Modal fails to open'],
          dataIssues: dataIssues,
          formatAnalysis: formatAnalysis
        });
        continue;
      }
      
      await page.waitForTimeout(1000);
      
      // 4. Tab Separation Test
      const tabTest = await page.evaluate((suppId) => {
        const expectedCounts = {
          mechanisms: window.enhancedCitations?.[suppId]?.citations?.mechanisms?.length || 0,
          benefits: window.enhancedCitations?.[suppId]?.citations?.benefits?.length || 0,
          safety: window.enhancedCitations?.[suppId]?.citations?.safety?.length || 0
        };
        
        const actualCounts = {};
        const tabIssues = [];
        
        // Test each tab
        ['mechanisms', 'benefits', 'safety'].forEach(tabType => {
          const containerId = `${tabType}-${suppId}`;
          const container = document.getElementById(containerId);
          
          if (!container) {
            tabIssues.push(`${tabType} container not found`);
            actualCounts[tabType] = 0;
          } else {
            const cards = container.querySelectorAll('.enhanced-citation-card');
            actualCounts[tabType] = cards.length;
            
            if (actualCounts[tabType] !== expectedCounts[tabType]) {
              tabIssues.push(`${tabType}: expected ${expectedCounts[tabType]}, got ${actualCounts[tabType]}`);
            }
          }
        });
        
        return {
          expectedCounts: expectedCounts,
          actualCounts: actualCounts,
          tabIssues: tabIssues,
          tabSeparationWorking: tabIssues.length === 0
        };
      }, supplement.id);
      
      console.log(`   📑 Tab Test: ${tabTest.tabSeparationWorking ? '✅ Working' : '❌ Issues: ' + tabTest.tabIssues.join(', ')}`);
      
      // 5. Citation Quality Test (Benefits tab focus)
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(500);
        
        const qualityTest = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container || container.classList.contains('hidden')) {
            return { error: 'Benefits container not found or hidden' };
          }
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const qualityIssues = [];
          
          cards.forEach((card, index) => {
            const text = card.textContent;
            const title = card.querySelector('h5')?.textContent?.trim();
            
            // Check for quality issues
            if (!title || title.length < 10) qualityIssues.push(`Card ${index + 1}: Poor/missing title`);
            if (text.includes('undefined')) qualityIssues.push(`Card ${index + 1}: Contains 'undefined'`);
            if (text.includes('Unknown authors')) qualityIssues.push(`Card ${index + 1}: Unknown authors`);
            if (!text.includes('(') || !text.match(/\(\d{4}\)/)) qualityIssues.push(`Card ${index + 1}: Missing year`);
            if (text.length < 200) qualityIssues.push(`Card ${index + 1}: Too short (${text.length} chars)`);
            
            // Check for generic titles (like the Melatonin issue)
            const genericTitles = ['Sleep Quality', 'Health Benefits', 'Antioxidant Support', 'Cognitive Enhancement'];
            if (genericTitles.some(generic => title === generic)) {
              qualityIssues.push(`Card ${index + 1}: Generic title "${title}"`);
            }
          });
          
          return {
            cardCount: cards.length,
            qualityIssues: qualityIssues,
            hasQualityIssues: qualityIssues.length > 0
          };
        }, supplement.id);
        
        console.log(`   🎯 Quality Test: ${qualityTest.hasQualityIssues ? '❌ Issues: ' + qualityTest.qualityIssues.slice(0, 3).join(', ') + (qualityTest.qualityIssues.length > 3 ? '...' : '') : '✅ Good'}`);
      }
      
      // 6. Overall Assessment
      const overallIssues = [
        ...dataIssues,
        ...(tabTest.tabIssues || []),
        ...(qualityTest?.qualityIssues || [])
      ];
      
      const status = overallIssues.length === 0 ? 'EXCELLENT' :
                    overallIssues.length <= 3 ? 'GOOD' :
                    overallIssues.length <= 6 ? 'NEEDS_WORK' : 'CRITICAL';
      
      auditResults.push({
        ...supplement,
        status: status,
        issues: overallIssues,
        dataIssues: dataIssues,
        formatAnalysis: formatAnalysis,
        tabTest: tabTest,
        qualityTest: qualityTest
      });
      
      console.log(`   🎯 Overall Status: ${status === 'EXCELLENT' ? '🎉' : status === 'GOOD' ? '✅' : status === 'NEEDS_WORK' ? '🔧' : '❌'} ${status} (${overallIssues.length} issues)`);
      
      // Categorize issues
      if (dataIssues.length > 0) issueCategories.dataStructure.push(supplement.name);
      if (tabTest.tabIssues?.length > 0) issueCategories.tabSeparation.push(supplement.name);
      if (qualityTest?.hasQualityIssues) issueCategories.citationQuality.push(supplement.name);
      if (formatAnalysis.benefits?.primaryFormat === 'LEGACY_FORMAT') issueCategories.legacyFormat.push(supplement.name);
    }
    
    // Summary Analysis
    console.log('\n' + '='.repeat(100));
    console.log('📈 COMPREHENSIVE AUDIT SUMMARY');
    console.log('='.repeat(100));
    
    const statusCounts = {
      EXCELLENT: auditResults.filter(r => r.status === 'EXCELLENT').length,
      GOOD: auditResults.filter(r => r.status === 'GOOD').length,
      NEEDS_WORK: auditResults.filter(r => r.status === 'NEEDS_WORK').length,
      CRITICAL: auditResults.filter(r => r.status === 'CRITICAL').length,
      MODAL_ERROR: auditResults.filter(r => r.status === 'MODAL_ERROR').length
    };
    
    console.log(`\n📊 Status Distribution:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      const icon = status === 'EXCELLENT' ? '🎉' : status === 'GOOD' ? '✅' : status === 'NEEDS_WORK' ? '🔧' : '❌';
      console.log(`   ${icon} ${status}: ${count} supplements`);
    });
    
    console.log(`\n🔍 Issue Categories:`);
    Object.entries(issueCategories).forEach(([category, supplements]) => {
      if (supplements.length > 0) {
        console.log(`   🏷️ ${category}: ${supplements.length} supplements`);
        supplements.forEach(name => console.log(`      • ${name}`));
      }
    });
    
    console.log(`\n📋 Priority Fix List:`);
    const criticalSupplements = auditResults.filter(r => r.status === 'CRITICAL' || r.status === 'MODAL_ERROR');
    const needsWorkSupplements = auditResults.filter(r => r.status === 'NEEDS_WORK');
    
    if (criticalSupplements.length > 0) {
      console.log(`\n🚨 CRITICAL (Fix Immediately):`);
      criticalSupplements.forEach(supp => {
        console.log(`   ❌ ${supp.name}: ${supp.issues.slice(0, 3).join(', ')}`);
      });
    }
    
    if (needsWorkSupplements.length > 0) {
      console.log(`\n🔧 NEEDS WORK (Fix Soon):`);
      needsWorkSupplements.forEach(supp => {
        console.log(`   🔧 ${supp.name}: ${supp.issues.slice(0, 2).join(', ')}`);
      });
    }
    
    const successRate = Math.round(((statusCounts.EXCELLENT + statusCounts.GOOD) / auditResults.length) * 100);
    console.log(`\n🎯 Overall Success Rate: ${successRate}% (${statusCounts.EXCELLENT + statusCounts.GOOD}/${auditResults.length} supplements working well)`);
    
    if (successRate >= 90) {
      console.log('\n🎉 EXCELLENT! Most supplements are working well. Focus on fixing the few remaining issues.');
    } else if (successRate >= 75) {
      console.log('\n✅ GOOD! Majority working well, but several supplements need attention.');
    } else {
      console.log('\n🔧 NEEDS WORK! Significant number of supplements have issues requiring fixes.');
    }
    
  } catch (error) {
    console.error('❌ Audit error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive audit complete');
  }
})();
