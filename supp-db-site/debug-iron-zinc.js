const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Iron and Zinc Rendering Issues');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const testSupplements = [
      { name: 'Iron', id: 38 },
      { name: 'Zinc', id: 37 }
    ];
    
    for (const supplement of testSupplements) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 DEBUGGING: ${supplement.name} (ID: ${supplement.id})`);
      console.log('='.repeat(60));
      
      // 1. Check raw data structure
      const rawDataAnalysis = await page.evaluate((suppId) => {
        const data = window.enhancedCitations?.[suppId];
        if (!data) return { error: 'No data found' };
        
        const analyzeSection = (section, name) => {
          if (!section || !Array.isArray(section)) {
            return { error: `${name} is not array`, data: section };
          }
          
          return {
            count: section.length,
            firstItem: section[0] ? {
              keys: Object.keys(section[0]),
              sample: section[0]
            } : null,
            allItems: section.map((item, index) => ({
              index: index,
              keys: Object.keys(item),
              preview: JSON.stringify(item).substring(0, 100) + '...'
            }))
          };
        };
        
        return {
          supplementName: data.name || data.supplementName,
          hasMetadata: {
            supplementId: !!data.supplementId,
            supplementName: !!data.supplementName,
            isEnhanced: !!data.isEnhanced,
            version: !!data.version
          },
          citations: {
            mechanisms: analyzeSection(data.citations?.mechanisms, 'mechanisms'),
            benefits: analyzeSection(data.citations?.benefits, 'benefits'),
            safety: analyzeSection(data.citations?.safety, 'safety')
          }
        };
      }, supplement.id);
      
      console.log('📊 Raw Data Analysis:');
      console.log(`   Supplement: ${rawDataAnalysis.supplementName}`);
      console.log(`   Metadata: ${JSON.stringify(rawDataAnalysis.hasMetadata)}`);
      
      ['mechanisms', 'benefits', 'safety'].forEach(section => {
        const data = rawDataAnalysis.citations[section];
        console.log(`\n   ${section.toUpperCase()}:`);
        if (data.error) {
          console.log(`      ❌ ${data.error}`);
        } else {
          console.log(`      Count: ${data.count}`);
          console.log(`      First item keys: ${data.firstItem?.keys.join(', ')}`);
          if (data.allItems && data.allItems.length > 0) {
            console.log(`      Sample items:`);
            data.allItems.slice(0, 2).forEach(item => {
              console.log(`         ${item.index}: ${item.preview}`);
            });
          }
        }
      });
      
      // 2. Test normalization
      const normalizationTest = await page.evaluate((suppId) => {
        const data = window.enhancedCitations?.[suppId];
        const renderer = window.app.citationRenderer;
        
        if (!data || !renderer) {
          return { error: 'Missing data or renderer' };
        }
        
        try {
          const normalizedData = renderer._normalizeData(data);
          
          return {
            success: true,
            originalCounts: {
              mechanisms: data.citations?.mechanisms?.length || 0,
              benefits: data.citations?.benefits?.length || 0,
              safety: data.citations?.safety?.length || 0
            },
            normalizedCounts: {
              mechanisms: normalizedData.citations?.mechanisms?.length || 0,
              benefits: normalizedData.citations?.benefits?.length || 0,
              safety: normalizedData.citations?.safety?.length || 0
            },
            normalizedSample: {
              firstMechanism: normalizedData.citations?.mechanisms?.[0],
              firstBenefit: normalizedData.citations?.benefits?.[0],
              firstSafety: normalizedData.citations?.safety?.[0]
            }
          };
        } catch (error) {
          return { error: 'Normalization failed: ' + error.message, stack: error.stack };
        }
      }, supplement.id);
      
      console.log('\n🔧 Normalization Test:');
      if (normalizationTest.error) {
        console.log(`   ❌ Error: ${normalizationTest.error}`);
      } else {
        console.log(`   Original: M(${normalizationTest.originalCounts.mechanisms}), B(${normalizationTest.originalCounts.benefits}), S(${normalizationTest.originalCounts.safety})`);
        console.log(`   Normalized: M(${normalizationTest.normalizedCounts.mechanisms}), B(${normalizationTest.normalizedCounts.benefits}), S(${normalizationTest.normalizedCounts.safety})`);
        
        if (normalizationTest.normalizedSample.firstBenefit) {
          console.log(`   Sample normalized benefit:`, JSON.stringify(normalizationTest.normalizedSample.firstBenefit, null, 2).substring(0, 200) + '...');
        }
      }
      
      // 3. Test modal rendering
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
        console.log(`\n❌ Modal Error: ${modalResult.error}`);
        continue;
      }
      
      await page.waitForTimeout(500);
      
      // 4. Check rendered HTML
      const renderedAnalysis = await page.evaluate((suppId) => {
        const containers = ['mechanisms', 'benefits', 'safety'].map(type => {
          const container = document.getElementById(`${type}-${suppId}`);
          if (!container) return { type, error: 'Container not found' };
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          return {
            type: type,
            exists: true,
            cardCount: cards.length,
            isHidden: container.classList.contains('hidden'),
            firstCardTitle: cards[0] ? cards[0].querySelector('h5')?.textContent?.trim() : null,
            firstCardHTML: cards[0] ? cards[0].innerHTML.substring(0, 300) + '...' : null
          };
        });
        
        return containers;
      }, supplement.id);
      
      console.log('\n🖥️ Rendered HTML Analysis:');
      renderedAnalysis.forEach(container => {
        console.log(`   ${container.type}: ${container.cardCount} cards ${container.isHidden ? '(hidden)' : '(visible)'}`);
        if (container.firstCardTitle) {
          console.log(`      Title: "${container.firstCardTitle}"`);
        }
      });
      
      // 5. Root cause analysis
      console.log('\n🎯 Root Cause Analysis:');
      
      const issues = [];
      
      // Check if normalization is reducing counts
      if (normalizationTest.success) {
        ['mechanisms', 'benefits', 'safety'].forEach(type => {
          const original = normalizationTest.originalCounts[type];
          const normalized = normalizationTest.normalizedCounts[type];
          if (original !== normalized) {
            issues.push(`${type}: Normalization reduced count from ${original} to ${normalized}`);
          }
        });
      }
      
      // Check if rendering matches normalization
      renderedAnalysis.forEach(container => {
        if (normalizationTest.success) {
          const expectedCount = normalizationTest.normalizedCounts[container.type];
          if (container.cardCount !== expectedCount) {
            issues.push(`${container.type}: Rendering shows ${container.cardCount} but normalization has ${expectedCount}`);
          }
        }
      });
      
      if (issues.length === 0) {
        console.log('   ✅ No obvious issues found');
      } else {
        console.log('   ❌ Issues identified:');
        issues.forEach(issue => console.log(`      • ${issue}`));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📈 IRON & ZINC DEBUG SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n💡 Based on the analysis, the likely issues are:');
    console.log('1. Data format not recognized by normalization logic');
    console.log('2. Normalization reducing citation counts incorrectly');
    console.log('3. Rendering logic not handling specific data structures');
    
    console.log('\n🔧 Recommended fixes:');
    console.log('1. Update normalization logic to handle Iron/Zinc data format');
    console.log('2. Check if these supplements use a different citation structure');
    console.log('3. Verify rendering templates handle all data formats correctly');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Iron & Zinc debug complete');
  }
})();
