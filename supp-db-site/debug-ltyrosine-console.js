const { chromium } = require('playwright');

(async () => {
  console.log('🔧 DEBUGGING L-TYROSINE CONSOLE ERRORS');
  console.log('Checking for JavaScript errors during rendering...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen for console messages and errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warn') {
      console.log(`⚠️ Console Warning: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔍 Opening L-Tyrosine and monitoring console...');
    
    // Search and open supplement
    await page.fill('#searchInput', 'L-Tyrosine');
    await page.waitForTimeout(1000);
    
    console.log('Calling showSupplementDetails(33)...');
    await page.evaluate(async () => {
      await window.app.showSupplementDetails(33);
    });
    await page.waitForTimeout(3000);
    
    // Check what happened
    const renderingCheck = await page.evaluate(() => {
      const supplement = window.supplements?.find(s => s.id === 33);
      const enhancedData = window.enhancedCitations?.[33];
      const renderer = window.CitationRenderer;
      
      // Check if enhanced citation rendering was attempted
      const detailsPanel = document.getElementById('supplementDetails');
      const citationTabs = Array.from(document.querySelectorAll('.citation-tab-btn'));
      const containers = [
        document.getElementById('benefits-33'),
        document.getElementById('safety-33'),
        document.getElementById('mechanisms-33')
      ];
      
      let renderingError = null;
      let normalizedData = null;
      
      try {
        if (renderer && enhancedData) {
          normalizedData = renderer._normalizeData(enhancedData);
        }
      } catch (e) {
        renderingError = e.message;
      }
      
      return {
        supplementExists: !!supplement,
        supplementDetection: supplement?.enhancedCitations?.isEnhanced,
        enhancedDataExists: !!enhancedData,
        rendererExists: !!renderer,
        detailsPanelExists: !!detailsPanel,
        citationTabsCount: citationTabs.length,
        citationTabTexts: citationTabs.map(tab => tab.textContent.trim()),
        containersExist: containers.map(c => !!c),
        renderingError: renderingError,
        normalizedDataExists: !!normalizedData,
        normalizedCounts: normalizedData ? {
          benefits: normalizedData.citations?.benefits?.length || 0,
          safety: normalizedData.citations?.safety?.length || 0,
          mechanisms: normalizedData.citations?.mechanisms?.length || 0
        } : null
      };
    });
    
    console.log('\n📊 Rendering Check Results:');
    console.log(`   Supplement Exists: ${renderingCheck.supplementExists}`);
    console.log(`   Supplement Detection: ${renderingCheck.supplementDetection}`);
    console.log(`   Enhanced Data Exists: ${renderingCheck.enhancedDataExists}`);
    console.log(`   Renderer Exists: ${renderingCheck.rendererExists}`);
    console.log(`   Details Panel Exists: ${renderingCheck.detailsPanelExists}`);
    console.log(`   Citation Tabs: ${renderingCheck.citationTabsCount} (${renderingCheck.citationTabTexts.join(', ')})`);
    console.log(`   Containers Exist: ${renderingCheck.containersExist.join(', ')}`);
    
    if (renderingCheck.renderingError) {
      console.log(`   ❌ Rendering Error: ${renderingCheck.renderingError}`);
    }
    
    if (renderingCheck.normalizedDataExists) {
      console.log(`   ✅ Normalization Successful: B:${renderingCheck.normalizedCounts.benefits} S:${renderingCheck.normalizedCounts.safety} M:${renderingCheck.normalizedCounts.mechanisms}`);
    }
    
    // Try to manually trigger rendering
    console.log('\n🔧 Attempting Manual Rendering:');
    
    const manualRenderingResult = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const enhancedData = window.enhancedCitations?.[33];
      
      if (!renderer || !enhancedData) {
        return { error: 'Missing renderer or data' };
      }
      
      try {
        // Try to render benefits manually
        const normalized = renderer._normalizeData(enhancedData);
        const benefitsHtml = renderer.renderBenefitsTab(normalized.citations.benefits);
        
        return {
          success: true,
          benefitsHtmlLength: benefitsHtml.length,
          benefitsPreview: benefitsHtml.substring(0, 200),
          normalizedBenefitsCount: normalized.citations.benefits.length
        };
      } catch (e) {
        return {
          error: e.message,
          stack: e.stack
        };
      }
    });
    
    if (manualRenderingResult.error) {
      console.log(`   ❌ Manual Rendering Error: ${manualRenderingResult.error}`);
      if (manualRenderingResult.stack) {
        console.log(`   Stack: ${manualRenderingResult.stack.substring(0, 300)}...`);
      }
    } else {
      console.log(`   ✅ Manual Rendering Success: ${manualRenderingResult.benefitsHtmlLength} chars`);
      console.log(`   Benefits Count: ${manualRenderingResult.normalizedBenefitsCount}`);
      console.log(`   Preview: ${manualRenderingResult.benefitsPreview}...`);
    }
    
    return renderingCheck;
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ L-Tyrosine console debug complete');
  }
})();
