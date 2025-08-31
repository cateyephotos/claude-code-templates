const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:8001', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(5000);
    
    // Check CSS loading and Primary Benefits visibility
    const cssCheck = await page.evaluate(() => {
      // Check if Tailwind is loaded
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-blue-100';
      document.body.appendChild(testDiv);
      const computedStyle = window.getComputedStyle(testDiv);
      const bgColor = computedStyle.backgroundColor;
      document.body.removeChild(testDiv);
      
      // Check Primary Benefits elements
      const firstCard = document.querySelector('[data-supplement-id="1"]');
      if (!firstCard) {
        return { error: 'First card not found' };
      }
      
      // Find Primary Benefits section
      const primaryBenefitsHeader = Array.from(firstCard.querySelectorAll('h4'))
        .find(h4 => h4.textContent.includes('Primary Benefits'));
      
      if (!primaryBenefitsHeader) {
        return { error: 'Primary Benefits header not found' };
      }
      
      // Get the Primary Benefits section
      const primaryBenefitsSection = primaryBenefitsHeader.parentElement;
      const cognitiveSpans = primaryBenefitsSection.querySelectorAll('.bg-blue-100');
      const nonCognitiveSpans = primaryBenefitsSection.querySelectorAll('.bg-green-100');
      
      // Check styles of cognitive spans
      const cognitiveStyles = Array.from(cognitiveSpans).map(span => {
        const style = window.getComputedStyle(span);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          width: style.width,
          height: style.height,
          textContent: span.textContent
        };
      });
      
      // Check styles of non-cognitive spans
      const nonCognitiveStyles = Array.from(nonCognitiveSpans).map(span => {
        const style = window.getComputedStyle(span);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          width: style.width,
          height: style.height,
          textContent: span.textContent
        };
      });
      
      return {
        tailwindLoaded: bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent',
        testBgColor: bgColor,
        primaryBenefitsFound: true,
        cognitiveSpansCount: cognitiveSpans.length,
        nonCognitiveSpansCount: nonCognitiveSpans.length,
        cognitiveStyles,
        nonCognitiveStyles,
        sectionHTML: primaryBenefitsSection.innerHTML
      };
    });
    
    console.log('CSS and visibility check:', JSON.stringify(cssCheck, null, 2));
    
    // Take a focused screenshot of just the first card
    const firstCardBounds = await page.locator('[data-supplement-id="1"]').boundingBox();
    if (firstCardBounds) {
      await page.screenshot({
        path: 'debug-first-card.png',
        clip: firstCardBounds
      });
      console.log('First card screenshot saved as debug-first-card.png');
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('CSS debug script failed:', error);
  }
})();
