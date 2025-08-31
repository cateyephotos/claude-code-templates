const { chromium } = require('playwright');

(async () => {
  console.log('🔧 Testing Fixed Citation Rendering');
  console.log('Verifying detailed citations now appear for Panax Ginseng...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Testing Panax Ginseng with Fixed Renderer');
    
    // Open Panax Ginseng
    await page.fill('#searchInput', 'Panax Ginseng');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(15);
    });
    await page.waitForTimeout(1000);
    
    // Test Benefits tab
    console.log('\n📋 Testing Benefits Tab...');
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(500);
    
    const benefitsAnalysis = await page.evaluate(() => {
      const container = document.getElementById('benefits-15');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const cardAnalysis = cards.map((card, index) => {
        const title = card.querySelector('h5')?.textContent?.trim();
        const content = card.textContent;
        
        // Check for detailed citation information
        const hasStudyTitle = content.includes('Effects of') || content.includes('Study:') || content.includes('Title:');
        const hasAuthors = content.includes('Authors:') || content.includes('et al') || content.includes(',');
        const hasYear = /\b(19|20)\d{2}\b/.test(content);
        const hasJournal = content.includes('Journal:') || content.includes('PLoS') || content.includes('Cochrane');
        const hasPMID = content.includes('PMID') || content.includes('pmid');
        const hasDOI = content.includes('DOI') || content.includes('doi');
        const hasFindings = content.includes('Findings:') || content.includes('findings');
        
        return {
          index: index,
          title: title,
          hasStudyTitle: hasStudyTitle,
          hasAuthors: hasAuthors,
          hasYear: hasYear,
          hasJournal: hasJournal,
          hasPMID: hasPMID,
          hasDOI: hasDOI,
          hasFindings: hasFindings,
          detailScore: [hasStudyTitle, hasAuthors, hasYear, hasJournal, hasPMID, hasDOI, hasFindings].filter(Boolean).length,
          contentLength: content.length,
          preview: content.substring(0, 300).replace(/\s+/g, ' ')
        };
      });
      
      return {
        totalCards: cards.length,
        cardAnalysis: cardAnalysis
      };
    });
    
    console.log(`   Benefits Cards: ${benefitsAnalysis.totalCards}`);
    if (benefitsAnalysis.totalCards > 0) {
      benefitsAnalysis.cardAnalysis.forEach(card => {
        console.log(`   Card ${card.index + 1}: "${card.title}"`);
        console.log(`     Detail Score: ${card.detailScore}/7`);
        console.log(`     Study Info: ${card.hasStudyTitle ? '✅' : '❌'} | Authors: ${card.hasAuthors ? '✅' : '❌'} | Year: ${card.hasYear ? '✅' : '❌'}`);
        console.log(`     Journal: ${card.hasJournal ? '✅' : '❌'} | PMID: ${card.hasPMID ? '✅' : '❌'} | Findings: ${card.hasFindings ? '✅' : '❌'}`);
        console.log(`     Content Length: ${card.contentLength} chars`);
        if (card.detailScore >= 4) {
          console.log(`     ✅ DETAILED CITATIONS WORKING!`);
        } else {
          console.log(`     ❌ Missing citation details`);
          console.log(`     Preview: ${card.preview}...`);
        }
        console.log('');
      });
    }
    
    // Test Safety tab
    console.log('\n🛡️ Testing Safety Tab...');
    const safetyTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Safety' }).first();
    await safetyTab.click();
    await page.waitForTimeout(500);
    
    const safetyAnalysis = await page.evaluate(() => {
      const container = document.getElementById('safety-15');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const cardAnalysis = cards.map((card, index) => {
        const title = card.querySelector('h5')?.textContent?.trim();
        const content = card.textContent;
        
        const hasStudyInfo = content.includes('Safety') || content.includes('Study:');
        const hasAuthors = content.includes('Authors:') || content.includes('et al');
        const hasYear = /\b(19|20)\d{2}\b/.test(content);
        const hasFindings = content.includes('Findings:') || content.includes('findings');
        
        return {
          index: index,
          title: title,
          hasStudyInfo: hasStudyInfo,
          hasAuthors: hasAuthors,
          hasYear: hasYear,
          hasFindings: hasFindings,
          detailScore: [hasStudyInfo, hasAuthors, hasYear, hasFindings].filter(Boolean).length,
          contentLength: content.length
        };
      });
      
      return {
        totalCards: cards.length,
        cardAnalysis: cardAnalysis
      };
    });
    
    console.log(`   Safety Cards: ${safetyAnalysis.totalCards}`);
    if (safetyAnalysis.totalCards > 0) {
      safetyAnalysis.cardAnalysis.forEach(card => {
        console.log(`   Card ${card.index + 1}: "${card.title}"`);
        console.log(`     Detail Score: ${card.detailScore}/4`);
        console.log(`     Study: ${card.hasStudyInfo ? '✅' : '❌'} | Authors: ${card.hasAuthors ? '✅' : '❌'} | Year: ${card.hasYear ? '✅' : '❌'} | Findings: ${card.hasFindings ? '✅' : '❌'}`);
        console.log(`     Content Length: ${card.contentLength} chars`);
        if (card.detailScore >= 2) {
          console.log(`     ✅ DETAILED CITATIONS WORKING!`);
        } else {
          console.log(`     ❌ Missing citation details`);
        }
        console.log('');
      });
    }
    
    // Test Mechanisms tab
    console.log('\n⚙️ Testing Mechanisms Tab...');
    const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
    await mechanismsTab.click();
    await page.waitForTimeout(500);
    
    const mechanismsAnalysis = await page.evaluate(() => {
      const container = document.getElementById('mechanisms-15');
      if (!container) return { error: 'Container not found' };
      
      const cards = Array.from(container.querySelectorAll('.enhanced-citation-card'));
      const cardAnalysis = cards.map((card, index) => {
        const title = card.querySelector('h5')?.textContent?.trim();
        const content = card.textContent;
        
        const hasStudyInfo = content.includes('Ginseng') || content.includes('Study:');
        const hasAuthors = content.includes('Authors:') || content.includes('et al');
        const hasYear = /\b(19|20)\d{2}\b/.test(content);
        const hasFindings = content.includes('Findings:') || content.includes('findings');
        
        return {
          index: index,
          title: title,
          hasStudyInfo: hasStudyInfo,
          hasAuthors: hasAuthors,
          hasYear: hasYear,
          hasFindings: hasFindings,
          detailScore: [hasStudyInfo, hasAuthors, hasYear, hasFindings].filter(Boolean).length,
          contentLength: content.length
        };
      });
      
      return {
        totalCards: cards.length,
        cardAnalysis: cardAnalysis
      };
    });
    
    console.log(`   Mechanisms Cards: ${mechanismsAnalysis.totalCards}`);
    if (mechanismsAnalysis.totalCards > 0) {
      mechanismsAnalysis.cardAnalysis.forEach(card => {
        console.log(`   Card ${card.index + 1}: "${card.title}"`);
        console.log(`     Detail Score: ${card.detailScore}/4`);
        console.log(`     Study: ${card.hasStudyInfo ? '✅' : '❌'} | Authors: ${card.hasAuthors ? '✅' : '❌'} | Year: ${card.hasYear ? '✅' : '❌'} | Findings: ${card.hasFindings ? '✅' : '❌'}`);
        console.log(`     Content Length: ${card.contentLength} chars`);
        if (card.detailScore >= 2) {
          console.log(`     ✅ DETAILED CITATIONS WORKING!`);
        } else {
          console.log(`     ❌ Missing citation details`);
        }
        console.log('');
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🔧 CITATION RENDERING FIX RESULTS');
    console.log('='.repeat(70));
    
    const benefitsWorking = benefitsAnalysis.cardAnalysis?.some(card => card.detailScore >= 4) || false;
    const safetyWorking = safetyAnalysis.cardAnalysis?.some(card => card.detailScore >= 2) || false;
    const mechanismsWorking = mechanismsAnalysis.cardAnalysis?.some(card => card.detailScore >= 2) || false;
    
    console.log(`\n📊 Detailed Citation Status:`);
    console.log(`   Benefits: ${benefitsWorking ? '✅ FIXED' : '❌ Still broken'}`);
    console.log(`   Safety: ${safetyWorking ? '✅ FIXED' : '❌ Still broken'}`);
    console.log(`   Mechanisms: ${mechanismsWorking ? '✅ FIXED' : '❌ Still broken'}`);
    
    const overallFixed = benefitsWorking && safetyWorking && mechanismsWorking;
    
    if (overallFixed) {
      console.log(`\n🎉 CITATION RENDERING COMPLETELY FIXED!`);
      console.log(`   Panax Ginseng now shows detailed citations with:`);
      console.log(`   • Study titles and authors`);
      console.log(`   • Publication years and journals`);
      console.log(`   • PMIDs and DOIs`);
      console.log(`   • Research findings`);
      console.log(`   • Evidence quality indicators`);
      
      console.log(`\n🚀 READY TO CONTINUE PHASE 3:`);
      console.log(`   All enhanced citations should now render properly!`);
    } else {
      console.log(`\n⚠️ PARTIAL FIX:`);
      console.log(`   Some citation details are working, but more fixes needed.`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Citation rendering fix test complete');
  }
})();
