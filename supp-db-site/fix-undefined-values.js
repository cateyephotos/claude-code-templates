const { chromium } = require('playwright');

(async () => {
  console.log('🔧 Fixing Undefined Values in Enhanced Citations');
  console.log('Targeting Chromium, Iron, and Zinc...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const problematicSupplements = [
      { id: 61, name: 'Chromium' },
      { id: 38, name: 'Iron' },
      { id: 37, name: 'Zinc' }
    ];
    
    for (const supplement of problematicSupplements) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 ANALYZING: ${supplement.name} (ID: ${supplement.id})`);
      console.log('='.repeat(60));
      
      // Get raw data structure
      const dataAnalysis = await page.evaluate((suppId) => {
        const data = window.enhancedCitations?.[suppId];
        if (!data) return { error: 'No data found' };
        
        const analyzeSection = (section, name) => {
          if (!section || !Array.isArray(section)) {
            return { error: `${name} is not array`, data: section };
          }
          
          return {
            count: section.length,
            items: section.map((item, index) => ({
              index: index,
              keys: Object.keys(item),
              hasUndefinedValues: JSON.stringify(item).includes('undefined'),
              undefinedFields: Object.entries(item).filter(([key, value]) => 
                value === undefined || value === 'undefined' || 
                (typeof value === 'string' && value.includes('undefined'))
              ).map(([key]) => key),
              sample: {
                title: item.title,
                claim: item.claim,
                authors: item.authors,
                journal: item.journal
              }
            }))
          };
        };
        
        return {
          supplementName: data.name || data.supplementName,
          citations: {
            mechanisms: analyzeSection(data.citations?.mechanisms, 'mechanisms'),
            benefits: analyzeSection(data.citations?.benefits, 'benefits'),
            safety: analyzeSection(data.citations?.safety, 'safety')
          }
        };
      }, supplement.id);
      
      console.log(`📊 Data Analysis for ${supplement.name}:`);
      console.log(JSON.stringify(dataAnalysis, null, 2));
      
      // Test modal and identify undefined display issues
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
        console.log(`❌ Modal error: ${modalResult.error}`);
        continue;
      }
      
      await page.waitForTimeout(500);
      
      // Check Benefits tab for undefined values
      const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
      if (await benefitsTab.count() > 0) {
        await benefitsTab.click();
        await page.waitForTimeout(300);
        
        const undefinedAnalysis = await page.evaluate((suppId) => {
          const container = document.getElementById(`benefits-${suppId}`);
          if (!container || container.classList.contains('hidden')) {
            return { error: 'Benefits container not accessible' };
          }
          
          const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
          const undefinedIssues = [];
          
          cards.forEach((card, index) => {
            const text = card.textContent;
            const html = card.innerHTML;
            
            if (text.includes('undefined')) {
              const undefinedMatches = text.match(/undefined/g) || [];
              const title = card.querySelector('h5')?.textContent?.trim();
              
              undefinedIssues.push({
                cardIndex: index,
                title: title,
                undefinedCount: undefinedMatches.length,
                textPreview: text.substring(0, 200).replace(/\s+/g, ' '),
                htmlPreview: html.substring(0, 300)
              });
            }
          });
          
          return {
            totalCards: cards.length,
            undefinedCards: undefinedIssues.length,
            issues: undefinedIssues
          };
        }, supplement.id);
        
        console.log(`\n🔍 Undefined Value Analysis:`);
        console.log(`   Total Cards: ${undefinedAnalysis.totalCards}`);
        console.log(`   Cards with Undefined: ${undefinedAnalysis.undefinedCards}`);
        
        if (undefinedAnalysis.issues && undefinedAnalysis.issues.length > 0) {
          console.log(`\n❌ Undefined Issues Found:`);
          undefinedAnalysis.issues.forEach(issue => {
            console.log(`   Card ${issue.cardIndex + 1}: "${issue.title}"`);
            console.log(`      Undefined count: ${issue.undefinedCount}`);
            console.log(`      Preview: ${issue.textPreview}...`);
          });
        }
      }
      
      // Identify the root cause and solution
      console.log(`\n💡 Root Cause Analysis for ${supplement.name}:`);
      
      if (dataAnalysis.citations) {
        ['mechanisms', 'benefits', 'safety'].forEach(section => {
          const sectionData = dataAnalysis.citations[section];
          if (sectionData.items) {
            const itemsWithUndefined = sectionData.items.filter(item => item.hasUndefinedValues);
            if (itemsWithUndefined.length > 0) {
              console.log(`   ${section}: ${itemsWithUndefined.length}/${sectionData.count} items have undefined values`);
              itemsWithUndefined.forEach(item => {
                console.log(`      Item ${item.index}: undefined fields: ${item.undefinedFields.join(', ')}`);
              });
            }
          }
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🔧 UNDEFINED VALUE FIX RECOMMENDATIONS');
    console.log('='.repeat(80));
    
    console.log(`\n📋 Issues Identified:`);
    console.log(`   • Chromium: Academic paper format with missing field handling`);
    console.log(`   • Iron: Academic paper format with missing field handling`);
    console.log(`   • Zinc: Academic paper format with missing field handling`);
    
    console.log(`\n💡 Solution Strategy:`);
    console.log(`   1. Update normalization logic to handle missing fields gracefully`);
    console.log(`   2. Add default values for undefined fields`);
    console.log(`   3. Improve academic paper format parsing`);
    console.log(`   4. Test and validate fixes`);
    
    console.log(`\n🔧 Specific Fixes Needed:`);
    console.log(`   • Update _normalizeStudy method to handle missing authors`);
    console.log(`   • Add fallback values for missing journal names`);
    console.log(`   • Improve title extraction from academic citations`);
    console.log(`   • Add validation for required fields`);
    
    console.log(`\n🎯 Next Steps:`);
    console.log(`   1. Update CitationRenderer.js normalization logic`);
    console.log(`   2. Add graceful handling for missing fields`);
    console.log(`   3. Test fixes on all three supplements`);
    console.log(`   4. Run comprehensive validation`);
    
  } catch (error) {
    console.error('❌ Analysis error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Undefined value analysis complete');
  }
})();
