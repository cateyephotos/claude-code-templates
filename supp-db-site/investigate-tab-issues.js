const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Investigating Tab Count Issues');
  console.log('Deep dive into problematic supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Test the most problematic supplements
    const problematicSupplements = [
      { name: 'Alpha-Lipoic Acid', id: 44 },
      { name: 'Choline', id: 15 },
      { name: 'GABA', id: 25 },
      { name: 'Inositol', id: 26 }
    ];
    
    for (const supplement of problematicSupplements) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 DEEP DIVE: ${supplement.name} (ID: ${supplement.id})`);
      console.log('='.repeat(60));
      
      // 1. Check raw data structure
      const rawDataAnalysis = await page.evaluate((suppId) => {
        const data = window.enhancedCitations?.[suppId];
        if (!data) return { error: 'No data found' };
        
        const analyzeSection = (section, name) => {
          if (!section) return { error: `No ${name} section` };
          if (!Array.isArray(section)) return { error: `${name} is not array` };
          
          return {
            count: section.length,
            firstItem: section[0] ? {
              keys: Object.keys(section[0]),
              hasClaimField: !!section[0].claim,
              hasStudiesField: !!section[0].studies,
              hasIdField: !!section[0].id,
              hasCitationField: !!section[0].citation,
              format: section[0].claim && section[0].studies ? 'NEW_FORMAT' :
                     section[0].id && section[0].citation ? 'LEGACY_FORMAT' : 'UNKNOWN'
            } : null,
            allFormats: section.map(item => {
              const keys = Object.keys(item);
              return keys.includes('claim') && keys.includes('studies') ? 'NEW_FORMAT' :
                     keys.includes('id') && keys.includes('citation') ? 'LEGACY_FORMAT' : 'UNKNOWN';
            })
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
      console.log(JSON.stringify(rawDataAnalysis, null, 2));
      
      // 2. Test modal and rendering
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
        console.log(`❌ Modal Error: ${modalResult.error}`);
        continue;
      }
      
      await page.waitForTimeout(1000);
      
      // 3. Check rendered HTML structure
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
            firstCardPreview: cards[0] ? cards[0].textContent.substring(0, 100) : null
          };
        });
        
        return containers;
      }, supplement.id);
      
      console.log('\n🖥️ Rendered HTML Analysis:');
      renderedAnalysis.forEach(container => {
        console.log(`   ${container.type}: ${container.cardCount} cards ${container.isHidden ? '(hidden)' : '(visible)'}`);
        if (container.firstCardTitle) {
          console.log(`      First card: "${container.firstCardTitle}"`);
        }
      });
      
      // 4. Test normalization process
      const normalizationTest = await page.evaluate((suppId) => {
        const data = window.enhancedCitations?.[suppId];
        const renderer = window.app.citationRenderer;
        
        if (!data || !renderer) {
          return { error: 'Missing data or renderer' };
        }
        
        try {
          const normalizedData = renderer._normalizeData(data);
          
          return {
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
            normalizationWorking: true
          };
        } catch (error) {
          return { error: 'Normalization failed: ' + error.message };
        }
      }, supplement.id);
      
      console.log('\n🔧 Normalization Test:');
      console.log(JSON.stringify(normalizationTest, null, 2));
      
      // 5. Compare expected vs actual
      const expectedCounts = rawDataAnalysis.citations;
      const actualCounts = renderedAnalysis.reduce((acc, container) => {
        acc[container.type] = container.cardCount;
        return acc;
      }, {});
      
      console.log('\n📊 Count Comparison:');
      ['mechanisms', 'benefits', 'safety'].forEach(type => {
        const expected = expectedCounts[type]?.count || 0;
        const actual = actualCounts[type] || 0;
        const match = expected === actual;
        console.log(`   ${type}: Expected ${expected}, Got ${actual} ${match ? '✅' : '❌'}`);
      });
      
      // 6. Identify root cause
      console.log('\n🎯 Root Cause Analysis:');
      
      const issues = [];
      
      // Check data format consistency
      Object.entries(expectedCounts).forEach(([type, data]) => {
        if (data.error) {
          issues.push(`${type}: ${data.error}`);
        } else if (data.allFormats && !data.allFormats.every(f => f === data.allFormats[0])) {
          issues.push(`${type}: Inconsistent data formats`);
        } else if (data.firstItem?.format === 'LEGACY_FORMAT') {
          issues.push(`${type}: Using legacy format`);
        } else if (data.firstItem?.format === 'UNKNOWN') {
          issues.push(`${type}: Unknown data format`);
        }
      });
      
      // Check normalization issues
      if (normalizationTest.error) {
        issues.push(`Normalization error: ${normalizationTest.error}`);
      } else if (normalizationTest.originalCounts && normalizationTest.normalizedCounts) {
        Object.keys(normalizationTest.originalCounts).forEach(type => {
          if (normalizationTest.originalCounts[type] !== normalizationTest.normalizedCounts[type]) {
            issues.push(`${type}: Normalization changed count`);
          }
        });
      }
      
      if (issues.length === 0) {
        console.log('   ✅ No obvious issues found - may be rendering problem');
      } else {
        console.log('   ❌ Issues identified:');
        issues.forEach(issue => console.log(`      • ${issue}`));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📈 INVESTIGATION SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n💡 Next steps based on findings:');
    console.log('1. Check if problematic supplements are using legacy data format');
    console.log('2. Verify normalization logic handles all data formats correctly');
    console.log('3. Test rendering logic for edge cases');
    console.log('4. Apply systematic fixes based on identified patterns');
    
  } catch (error) {
    console.error('❌ Investigation error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Investigation complete');
  }
})();
