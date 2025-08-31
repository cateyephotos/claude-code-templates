const { chromium } = require('playwright');

(async () => {
  console.log('🌙 Testing Melatonin Specific Clinical Benefits Citations...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🔍 Checking Melatonin enhanced citation data...');
    
    // Check if Melatonin data is loaded
    const melatoninData = await page.evaluate(() => {
      const data = window.enhancedCitations?.[8];
      if (!data) {
        return { error: 'No melatonin data found' };
      }
      
      return {
        hasData: true,
        supplementName: data.supplementName,
        isEnhanced: data.isEnhanced,
        version: data.version,
        benefitsCount: data.citations?.benefits?.length || 0,
        benefitsClaims: data.citations?.benefits?.map(b => b.claim) || []
      };
    });
    
    console.log('📊 Melatonin Data Status:', melatoninData);
    
    if (!melatoninData.hasData) {
      console.log('❌ Melatonin data not loaded properly');
      return;
    }
    
    // Search for Melatonin
    await page.fill('#searchInput', 'Melatonin');
    await page.waitForTimeout(1000);
    
    // Open modal
    const modalResult = await page.evaluate(async () => {
      try {
        await window.app.showSupplementDetails(8);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (!modalResult.success) {
      console.log(`❌ Modal failed: ${modalResult.error}`);
      return;
    }
    
    await page.waitForTimeout(1000);
    
    // Focus on Benefits tab
    console.log('\n🎯 Testing Clinical Benefits Tab...');
    
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    if (await benefitsTab.count() === 0) {
      console.log('❌ Benefits tab not found');
      return;
    }
    
    await benefitsTab.click();
    await page.waitForTimeout(500);
    
    // Count and analyze citation cards (only visible ones in Benefits tab)
    const visibleCards = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-8');
      if (!benefitsContainer || benefitsContainer.classList.contains('hidden')) {
        return [];
      }
      return Array.from(benefitsContainer.querySelectorAll('.enhanced-citation-card'));
    });

    const cardCount = visibleCards.length;
    
    console.log(`📄 Found ${cardCount} citation cards in Benefits tab`);
    
    if (cardCount === 0) {
      console.log('❌ No citation cards found in Benefits tab');
      return;
    }
    
    // Analyze each citation card for specific claims
    const expectedClaims = [
      'Significantly improves sleep quality as measured by validated scales',
      'Reduces sleep onset latency (time to fall asleep)',
      'Effectively prevents and treats jet lag symptoms',
      'Treats chronic insomnia in children and adults',
      'Improves sleep quality in shift workers',
      'Improves symptoms of seasonal affective disorder',
      'Particularly effective for age-related sleep disturbances',
      'Provides neuroprotective antioxidant effects'
    ];

    console.log('\n🔍 Analyzing specific clinical benefit claims...');

    const foundClaims = [];
    const cardDetails = [];

    // Get card details from the visible cards
    const cardAnalysis = await page.evaluate(() => {
      const benefitsContainer = document.getElementById('benefits-8');
      if (!benefitsContainer || benefitsContainer.classList.contains('hidden')) {
        return [];
      }

      const cards = Array.from(benefitsContainer.querySelectorAll('.enhanced-citation-card'));
      return cards.map((card, index) => ({
        index: index,
        text: card.textContent,
        html: card.innerHTML
      }));
    });

    for (let i = 0; i < cardAnalysis.length; i++) {
      const cardData = cardAnalysis[i];
      const cardText = cardData.text;
      const cardHTML = cardData.html;
      
      // Check for specific elements
      const hasTitle = /[A-Z].*[a-z].*/.test(cardText) && cardText.length > 20;
      const hasYear = /\(\d{4}\)|\b(19|20)\d{2}\b/.test(cardText);
      const hasAuthors = !cardText.includes('Unknown authors') && 
                       !cardText.includes('undefined') &&
                       (cardText.includes(',') || cardText.includes('et al'));
      const hasJournal = cardText.split('\n').length > 3;
      const hasDOI = cardText.includes('doi') || cardText.includes('DOI') || cardText.includes('10.');
      const hasPMID = cardText.includes('pmid') || cardText.includes('PMID');
      const hasFindings = cardText.length > 200;
      
      // Check for specific claims
      const matchedClaim = expectedClaims.find(claim => 
        cardText.toLowerCase().includes(claim.toLowerCase().substring(0, 30))
      );
      
      if (matchedClaim) {
        foundClaims.push(matchedClaim);
      }
      
      const quality = hasTitle && hasYear && hasAuthors && hasJournal && hasFindings ? 'EXCELLENT' :
                     hasTitle && hasYear && hasAuthors ? 'GOOD' :
                     hasTitle && hasYear ? 'BASIC' : 'POOR';
      
      cardDetails.push({
        index: i + 1,
        quality: quality,
        hasTitle: hasTitle,
        hasYear: hasYear,
        hasAuthors: hasAuthors,
        hasJournal: hasJournal,
        hasDOI: hasDOI,
        hasPMID: hasPMID,
        hasFindings: hasFindings,
        matchedClaim: matchedClaim,
        textLength: cardText.length,
        preview: cardText.substring(0, 200) + '...'
      });
      
      console.log(`\n📋 Card ${i + 1}:`);
      console.log(`   Quality: ${quality}`);
      console.log(`   Title: ${hasTitle ? '✅' : '❌'}`);
      console.log(`   Year: ${hasYear ? '✅' : '❌'}`);
      console.log(`   Authors: ${hasAuthors ? '✅' : '❌'}`);
      console.log(`   Journal: ${hasJournal ? '✅' : '❌'}`);
      console.log(`   DOI: ${hasDOI ? '✅' : '❌'}`);
      console.log(`   PMID: ${hasPMID ? '✅' : '❌'}`);
      console.log(`   Findings: ${hasFindings ? '✅' : '❌'}`);
      console.log(`   Matched Claim: ${matchedClaim ? '✅ ' + matchedClaim.substring(0, 50) + '...' : '❌ No match'}`);
      console.log(`   Preview: ${cardText.substring(0, 150)}...`);
    }
    
    // Summary analysis
    console.log('\n' + '='.repeat(80));
    console.log('📈 MELATONIN CLINICAL BENEFITS ANALYSIS SUMMARY');
    console.log('='.repeat(80));
    
    const excellentCards = cardDetails.filter(c => c.quality === 'EXCELLENT').length;
    const goodCards = cardDetails.filter(c => c.quality === 'GOOD').length;
    const cardsWithClaims = cardDetails.filter(c => c.matchedClaim).length;
    
    console.log(`\n📊 Quality Distribution:`);
    console.log(`   🎉 Excellent: ${excellentCards}/${cardCount} cards`);
    console.log(`   ✅ Good: ${goodCards}/${cardCount} cards`);
    console.log(`   🔧 Basic/Poor: ${cardCount - excellentCards - goodCards}/${cardCount} cards`);
    
    console.log(`\n🎯 Specific Claims Found:`);
    console.log(`   ✅ Matched Claims: ${cardsWithClaims}/${cardCount} cards`);
    console.log(`   📋 Expected Claims: ${expectedClaims.length} total`);
    console.log(`   📈 Coverage: ${Math.round((foundClaims.length / expectedClaims.length) * 100)}%`);
    
    console.log(`\n📋 Found Specific Claims:`);
    foundClaims.forEach((claim, index) => {
      console.log(`   ${index + 1}. ✅ ${claim.substring(0, 60)}...`);
    });
    
    const missingClaims = expectedClaims.filter(claim => !foundClaims.includes(claim));
    if (missingClaims.length > 0) {
      console.log(`\n❌ Missing Claims:`);
      missingClaims.forEach((claim, index) => {
        console.log(`   ${index + 1}. ❌ ${claim.substring(0, 60)}...`);
      });
    }
    
    // Overall assessment
    const overallQuality = excellentCards >= cardCount * 0.8 ? 'EXCELLENT' :
                          (excellentCards + goodCards) >= cardCount * 0.8 ? 'GOOD' :
                          'NEEDS_WORK';
    
    const claimCoverage = foundClaims.length >= expectedClaims.length * 0.8 ? 'COMPREHENSIVE' :
                         foundClaims.length >= expectedClaims.length * 0.6 ? 'ADEQUATE' :
                         'INSUFFICIENT';
    
    console.log(`\n🏆 Final Assessment:`);
    console.log(`   Overall Quality: ${overallQuality}`);
    console.log(`   Claim Coverage: ${claimCoverage}`);
    console.log(`   Total Citations: ${cardCount}`);
    console.log(`   Specific Claims: ${foundClaims.length}/${expectedClaims.length}`);
    
    if (overallQuality === 'EXCELLENT' && claimCoverage === 'COMPREHENSIVE') {
      console.log('\n🎉 SUCCESS! Melatonin clinical benefits are fully fleshed out with specific citations!');
    } else if (overallQuality === 'GOOD' && claimCoverage === 'ADEQUATE') {
      console.log('\n✅ GOOD! Melatonin clinical benefits are well-documented with most specific citations present.');
    } else {
      console.log('\n🔧 NEEDS WORK! Melatonin clinical benefits need improvement in quality or claim coverage.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Melatonin specific citation test complete');
  }
})();
