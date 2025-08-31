const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Citation Rendering Format');
  console.log('Comparing Panax Ginseng vs working supplements...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 STEP 1: Testing Working Supplement (Alpha-Lipoic Acid)');
    
    // Test Alpha-Lipoic Acid first (known working)
    await page.fill('#searchInput', 'Alpha-Lipoic Acid');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(44);
    });
    await page.waitForTimeout(1000);
    
    // Click Benefits tab
    const alaTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await alaTab.click();
    await page.waitForTimeout(500);
    
    // Analyze Alpha-Lipoic Acid citation format
    const alaFormat = await page.evaluate(() => {
      const container = document.getElementById('benefits-44');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const cardAnalysis = cards.map((card, index) => {
        const title = card.querySelector('h5')?.textContent?.trim();
        const content = card.textContent;
        const hasStudyInfo = content.includes('PMID') || content.includes('DOI') || content.includes('Journal:');
        const hasAuthorInfo = content.includes('Authors:');
        const hasYearInfo = content.includes('Year:');
        const hasEvidenceLevel = content.includes('Evidence:') || content.includes('Quality:');
        
        return {
          index: index,
          title: title,
          hasStudyInfo: hasStudyInfo,
          hasAuthorInfo: hasAuthorInfo,
          hasYearInfo: hasYearInfo,
          hasEvidenceLevel: hasEvidenceLevel,
          contentLength: content.length,
          preview: content.substring(0, 200).replace(/\s+/g, ' ')
        };
      });
      
      return {
        totalCards: cards.length,
        cardAnalysis: cardAnalysis,
        sampleHTML: cards[0]?.innerHTML?.substring(0, 500) || 'No cards'
      };
    });
    
    console.log(`   Alpha-Lipoic Acid Benefits: ${alaFormat.totalCards} cards`);
    if (alaFormat.totalCards > 0) {
      const firstCard = alaFormat.cardAnalysis[0];
      console.log(`   Sample Card Analysis:`);
      console.log(`     Title: "${firstCard.title}"`);
      console.log(`     Has Study Info: ${firstCard.hasStudyInfo}`);
      console.log(`     Has Author Info: ${firstCard.hasAuthorInfo}`);
      console.log(`     Has Year Info: ${firstCard.hasYearInfo}`);
      console.log(`     Has Evidence Level: ${firstCard.hasEvidenceLevel}`);
      console.log(`     Content Length: ${firstCard.contentLength} chars`);
      console.log(`     Preview: ${firstCard.preview}...`);
    }
    
    console.log('\n🔍 STEP 2: Testing Panax Ginseng Citation Format');
    
    // Close current modal and open Panax Ginseng
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    await page.fill('#searchInput', 'Panax Ginseng');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(15);
    });
    await page.waitForTimeout(1000);
    
    // Click Benefits tab
    const ginsengTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await ginsengTab.click();
    await page.waitForTimeout(500);
    
    // Analyze Panax Ginseng citation format
    const ginsengFormat = await page.evaluate(() => {
      const container = document.getElementById('benefits-15');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const cardAnalysis = cards.map((card, index) => {
        const title = card.querySelector('h5')?.textContent?.trim();
        const content = card.textContent;
        const hasStudyInfo = content.includes('PMID') || content.includes('DOI') || content.includes('Journal:');
        const hasAuthorInfo = content.includes('Authors:');
        const hasYearInfo = content.includes('Year:');
        const hasEvidenceLevel = content.includes('Evidence:') || content.includes('Quality:');
        
        return {
          index: index,
          title: title,
          hasStudyInfo: hasStudyInfo,
          hasAuthorInfo: hasAuthorInfo,
          hasYearInfo: hasYearInfo,
          hasEvidenceLevel: hasEvidenceLevel,
          contentLength: content.length,
          preview: content.substring(0, 200).replace(/\s+/g, ' ')
        };
      });
      
      return {
        totalCards: cards.length,
        cardAnalysis: cardAnalysis,
        sampleHTML: cards[0]?.innerHTML?.substring(0, 500) || 'No cards'
      };
    });
    
    console.log(`   Panax Ginseng Benefits: ${ginsengFormat.totalCards} cards`);
    if (ginsengFormat.totalCards > 0) {
      const firstCard = ginsengFormat.cardAnalysis[0];
      console.log(`   Sample Card Analysis:`);
      console.log(`     Title: "${firstCard.title}"`);
      console.log(`     Has Study Info: ${firstCard.hasStudyInfo}`);
      console.log(`     Has Author Info: ${firstCard.hasAuthorInfo}`);
      console.log(`     Has Year Info: ${firstCard.hasYearInfo}`);
      console.log(`     Has Evidence Level: ${firstCard.hasEvidenceLevel}`);
      console.log(`     Content Length: ${firstCard.contentLength} chars`);
      console.log(`     Preview: ${firstCard.preview}...`);
    }
    
    console.log('\n🔍 STEP 3: Raw Data Comparison');
    
    // Compare raw data structures
    const dataComparison = await page.evaluate(() => {
      const alaData = window.enhancedCitations?.[44];
      const ginsengData = window.enhancedCitations?.[15];
      
      const alaSample = alaData?.citations?.benefits?.[0];
      const ginsengSample = ginsengData?.citations?.benefits?.[0];
      
      return {
        ala: {
          exists: !!alaData,
          benefitsCount: alaData?.citations?.benefits?.length || 0,
          sampleBenefit: alaSample,
          sampleStudy: alaSample?.studies?.[0]
        },
        ginseng: {
          exists: !!ginsengData,
          benefitsCount: ginsengData?.citations?.benefits?.length || 0,
          sampleBenefit: ginsengSample,
          sampleStudy: ginsengSample?.studies?.[0]
        }
      };
    });
    
    console.log(`   Alpha-Lipoic Acid Data:`);
    console.log(`     Exists: ${dataComparison.ala.exists}`);
    console.log(`     Benefits Count: ${dataComparison.ala.benefitsCount}`);
    if (dataComparison.ala.sampleStudy) {
      console.log(`     Sample Study: "${dataComparison.ala.sampleStudy.title}"`);
      console.log(`     PMID: ${dataComparison.ala.sampleStudy.pmid}`);
      console.log(`     Authors: ${dataComparison.ala.sampleStudy.authors?.slice(0, 2).join(', ')}...`);
    }
    
    console.log(`   Panax Ginseng Data:`);
    console.log(`     Exists: ${dataComparison.ginseng.exists}`);
    console.log(`     Benefits Count: ${dataComparison.ginseng.benefitsCount}`);
    if (dataComparison.ginseng.sampleStudy) {
      console.log(`     Sample Study: "${dataComparison.ginseng.sampleStudy.title}"`);
      console.log(`     PMID: ${dataComparison.ginseng.sampleStudy.pmid}`);
      console.log(`     Authors: ${dataComparison.ginseng.sampleStudy.authors?.slice(0, 2).join(', ')}...`);
    }
    
    console.log('\n🔍 STEP 4: Citation Renderer Investigation');
    
    // Check how citations are being rendered
    const rendererAnalysis = await page.evaluate(() => {
      // Check if there's a difference in how the renderer handles different supplements
      const renderer = window.CitationRenderer;
      if (!renderer) return { error: 'No renderer found' };
      
      const alaData = window.enhancedCitations?.[44];
      const ginsengData = window.enhancedCitations?.[15];
      
      // Try to manually render both
      let alaRender = null;
      let ginsengRender = null;
      
      try {
        if (renderer.renderBenefit && alaData?.citations?.benefits?.[0]) {
          alaRender = renderer.renderBenefit(alaData.citations.benefits[0]);
        }
      } catch (e) {
        alaRender = { error: e.message };
      }
      
      try {
        if (renderer.renderBenefit && ginsengData?.citations?.benefits?.[0]) {
          ginsengRender = renderer.renderBenefit(ginsengData.citations.benefits[0]);
        }
      } catch (e) {
        ginsengRender = { error: e.message };
      }
      
      return {
        rendererExists: !!renderer,
        rendererMethods: renderer ? Object.keys(renderer) : [],
        alaRender: alaRender,
        ginsengRender: ginsengRender
      };
    });
    
    console.log(`   Citation Renderer:`);
    console.log(`     Exists: ${rendererAnalysis.rendererExists}`);
    console.log(`     Methods: ${rendererAnalysis.rendererMethods.join(', ')}`);
    console.log(`     ALA Render: ${rendererAnalysis.alaRender ? (rendererAnalysis.alaRender.error ? 'Error' : 'Success') : 'None'}`);
    console.log(`     Ginseng Render: ${rendererAnalysis.ginsengRender ? (rendererAnalysis.ginsengRender.error ? 'Error' : 'Success') : 'None'}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('🔍 CITATION RENDERING DIAGNOSIS');
    console.log('='.repeat(70));
    
    const alaHasDetails = alaFormat.cardAnalysis?.[0]?.hasStudyInfo || false;
    const ginsengHasDetails = ginsengFormat.cardAnalysis?.[0]?.hasStudyInfo || false;
    
    console.log(`\n📊 Comparison Results:`);
    console.log(`   Alpha-Lipoic Acid: ${alaHasDetails ? '✅ Has detailed citations' : '❌ Missing citation details'}`);
    console.log(`   Panax Ginseng: ${ginsengHasDetails ? '✅ Has detailed citations' : '❌ Missing citation details'}`);
    
    if (!ginsengHasDetails && alaHasDetails) {
      console.log(`\n🔧 ISSUE IDENTIFIED:`);
      console.log(`   Panax Ginseng is not rendering detailed citation information.`);
      console.log(`   The data exists but the citation renderer is not processing it correctly.`);
      console.log(`   This suggests a data format compatibility issue.`);
      
      console.log(`\n💡 SOLUTION NEEDED:`);
      console.log(`   1. Check if Panax Ginseng data format matches working supplements`);
      console.log(`   2. Verify citation renderer is recognizing the enhanced format`);
      console.log(`   3. Fix any data structure inconsistencies`);
      console.log(`   4. Test rendering after fixes`);
    } else if (ginsengHasDetails) {
      console.log(`\n✅ NO ISSUES FOUND:`);
      console.log(`   Both supplements are rendering detailed citations correctly.`);
    } else {
      console.log(`\n❌ BROADER ISSUE:`);
      console.log(`   Neither supplement is rendering detailed citations.`);
      console.log(`   This suggests a system-wide citation rendering problem.`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Citation rendering format debug complete');
  }
})();
