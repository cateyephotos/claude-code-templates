const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Debugging Benefits vs Mechanisms Rendering');
  console.log('Comparing why mechanisms work but benefits dont...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Open Panax Ginseng
    await page.fill('#searchInput', 'Panax Ginseng');
    await page.waitForTimeout(1000);
    
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(15);
    });
    await page.waitForTimeout(1000);
    
    // Compare raw HTML output for mechanisms vs benefits
    console.log('\n🔍 Comparing Raw HTML Output...');
    
    // Test Mechanisms tab
    const mechanismsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Mechanisms' }).first();
    await mechanismsTab.click();
    await page.waitForTimeout(500);
    
    const mechanismsHTML = await page.evaluate(() => {
      const container = document.getElementById('mechanisms-15');
      return container ? container.innerHTML : 'Container not found';
    });
    
    // Test Benefits tab
    const benefitsTab = await page.locator('.citation-tab-btn').filter({ hasText: 'Benefits' }).first();
    await benefitsTab.click();
    await page.waitForTimeout(500);
    
    const benefitsHTML = await page.evaluate(() => {
      const container = document.getElementById('benefits-15');
      return container ? container.innerHTML : 'Container not found';
    });
    
    console.log(`\n📊 HTML Length Comparison:`);
    console.log(`   Mechanisms HTML: ${mechanismsHTML.length} chars`);
    console.log(`   Benefits HTML: ${benefitsHTML.length} chars`);
    
    // Check for study cards in HTML
    const mechanismsHasStudyCards = mechanismsHTML.includes('border-green-400') || mechanismsHTML.includes('PMID') || mechanismsHTML.includes('DOI');
    const benefitsHasStudyCards = benefitsHTML.includes('border-green-400') || benefitsHTML.includes('PMID') || benefitsHTML.includes('DOI');
    
    console.log(`   Mechanisms has study cards: ${mechanismsHasStudyCards}`);
    console.log(`   Benefits has study cards: ${benefitsHasStudyCards}`);
    
    // Check for specific study content
    const mechanismsHasFindings = mechanismsHTML.includes('Findings:');
    const benefitsHasFindings = benefitsHTML.includes('Findings:');
    
    console.log(`   Mechanisms has findings: ${mechanismsHasFindings}`);
    console.log(`   Benefits has findings: ${benefitsHasFindings}`);
    
    // Test direct rendering comparison
    console.log('\n🔧 Direct Rendering Comparison...');
    
    const renderingComparison = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[15];
      
      if (!renderer || !data) return { error: 'Missing renderer or data' };
      
      const sampleMechanism = data.citations?.mechanisms?.[0];
      const sampleBenefit = data.citations?.benefits?.[0];
      
      let mechanismCard = null;
      let benefitCard = null;
      let error = null;
      
      try {
        mechanismCard = renderer.renderMechanismCard(sampleMechanism);
        benefitCard = renderer.renderBenefitCard(sampleBenefit);
      } catch (e) {
        error = e.message;
      }
      
      return {
        mechanismCard: mechanismCard,
        benefitCard: benefitCard,
        error: error,
        mechanismLength: mechanismCard ? mechanismCard.length : 0,
        benefitLength: benefitCard ? benefitCard.length : 0,
        mechanismHasStudy: mechanismCard ? mechanismCard.includes('PMID') : false,
        benefitHasStudy: benefitCard ? benefitCard.includes('PMID') : false
      };
    });
    
    console.log(`   Direct mechanism card: ${renderingComparison.mechanismLength} chars`);
    console.log(`   Direct benefit card: ${renderingComparison.benefitLength} chars`);
    console.log(`   Mechanism includes PMID: ${renderingComparison.mechanismHasStudy}`);
    console.log(`   Benefit includes PMID: ${renderingComparison.benefitHasStudy}`);
    console.log(`   Error: ${renderingComparison.error || 'None'}`);
    
    if (renderingComparison.mechanismCard && renderingComparison.benefitCard) {
      console.log(`\n📄 Sample Content Comparison:`);
      console.log(`\nMechanism Card Preview:`);
      console.log(renderingComparison.mechanismCard.substring(0, 300) + '...');
      
      console.log(`\nBenefit Card Preview:`);
      console.log(renderingComparison.benefitCard.substring(0, 300) + '...');
    }
    
    // Check if the issue is in the template rendering
    console.log('\n🔍 Template Rendering Check...');
    
    const templateCheck = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const data = window.enhancedCitations?.[15];
      
      if (!renderer || !data) return { error: 'Missing renderer or data' };
      
      // Try to render the full sections
      let mechanismsSection = null;
      let benefitsSection = null;
      let error = null;
      
      try {
        mechanismsSection = renderer._renderMechanisms(15, data.citations.mechanisms);
        benefitsSection = renderer._renderBenefits(15, data.citations.benefits);
      } catch (e) {
        error = e.message;
      }
      
      return {
        mechanismsSection: mechanismsSection,
        benefitsSection: benefitsSection,
        error: error,
        mechanismsSectionLength: mechanismsSection ? mechanismsSection.length : 0,
        benefitsSectionLength: benefitsSection ? benefitsSection.length : 0,
        mechanismsSectionHasStudy: mechanismsSection ? mechanismsSection.includes('PMID') : false,
        benefitsSectionHasStudy: benefitsSection ? benefitsSection.includes('PMID') : false
      };
    });
    
    console.log(`   Mechanisms section: ${templateCheck.mechanismsSectionLength} chars`);
    console.log(`   Benefits section: ${templateCheck.benefitsSectionLength} chars`);
    console.log(`   Mechanisms section has PMID: ${templateCheck.mechanismsSectionHasStudy}`);
    console.log(`   Benefits section has PMID: ${templateCheck.benefitsSectionHasStudy}`);
    console.log(`   Template error: ${templateCheck.error || 'None'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 BENEFITS VS MECHANISMS DIAGNOSIS');
    console.log('='.repeat(60));
    
    if (renderingComparison.mechanismHasStudy && !renderingComparison.benefitHasStudy) {
      console.log(`\n❌ BENEFIT CARD RENDERING ISSUE:`);
      console.log(`   Individual mechanism cards include study details.`);
      console.log(`   Individual benefit cards do NOT include study details.`);
      console.log(`   The issue is in the renderBenefitCard method.`);
    } else if (templateCheck.mechanismsSectionHasStudy && !templateCheck.benefitsSectionHasStudy) {
      console.log(`\n❌ BENEFITS SECTION RENDERING ISSUE:`);
      console.log(`   Mechanisms section includes study details.`);
      console.log(`   Benefits section does NOT include study details.`);
      console.log(`   The issue is in the _renderBenefits method.`);
    } else if (mechanismsHasStudyCards && !benefitsHasStudyCards) {
      console.log(`\n❌ DOM RENDERING ISSUE:`);
      console.log(`   Direct rendering works for both.`);
      console.log(`   But DOM only shows study details for mechanisms.`);
      console.log(`   The issue is in how benefits are being inserted into DOM.`);
    } else {
      console.log(`\n✅ BOTH SHOULD BE WORKING:`);
      console.log(`   Both mechanisms and benefits include study details.`);
      console.log(`   The issue might be elsewhere.`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Benefits vs mechanisms debug complete');
  }
})();
