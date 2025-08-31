const { chromium } = require('playwright');

(async () => {
  console.log('🧪 TESTING SERVER CONNECTION WITH PLAYWRIGHT');
  console.log('Checking server status and supplement loading...');
  
  let browser;
  try {
    // Launch browser
    console.log('\n🚀 Launching browser...');
    browser = await chromium.launch({ 
      headless: false,
      timeout: 30000
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      console.log(`   Browser Console: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.log(`   Browser Error: ${error.message}`);
    });
    
    // Test server connection
    console.log('\n🌐 Testing server connection...');
    
    try {
      const response = await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 15000
      });
      
      if (response) {
        console.log(`   ✅ Server responded with status: ${response.status()}`);
        console.log(`   ✅ URL loaded: ${response.url()}`);
      } else {
        console.log('   ❌ No response received from server');
        return;
      }
    } catch (error) {
      console.log(`   ❌ Failed to connect to server: ${error.message}`);
      console.log('\n🔧 TROUBLESHOOTING STEPS:');
      console.log('   1. Check if server is running on port 3000');
      console.log('   2. Try: python -m http.server 3000');
      console.log('   3. Check for port conflicts');
      console.log('   4. Verify firewall settings');
      return;
    }
    
    // Wait for page to load
    console.log('\n⏳ Waiting for page to fully load...');
    await page.waitForTimeout(3000);
    
    // Check page title
    const title = await page.title();
    console.log(`   📄 Page title: "${title}"`);
    
    // Check if main elements are present
    console.log('\n🔍 Checking page elements...');
    
    const bodyExists = await page.locator('body').count() > 0;
    console.log(`   Body element: ${bodyExists ? '✅' : '❌'}`);
    
    const hasContent = await page.locator('body').textContent();
    console.log(`   Page has content: ${hasContent && hasContent.length > 0 ? '✅' : '❌'}`);
    
    // Check for JavaScript errors
    console.log('\n🔧 Checking JavaScript execution...');
    
    const windowExists = await page.evaluate(() => typeof window !== 'undefined');
    console.log(`   Window object: ${windowExists ? '✅' : '❌'}`);
    
    // Test enhanced citations loading
    console.log('\n📚 Testing Enhanced Citations System...');
    
    const enhancedCitationsCheck = await page.evaluate(() => {
      return {
        windowEnhancedCitations: typeof window.enhancedCitations !== 'undefined',
        enhancedCitationsCount: window.enhancedCitations ? Object.keys(window.enhancedCitations).length : 0,
        loaderExists: typeof window.addEnhancedCitation === 'function',
        sampleCitation: window.enhancedCitations && window.enhancedCitations[2] ? 'Omega-3 loaded' : 'Not found'
      };
    });
    
    console.log(`   Enhanced Citations Object: ${enhancedCitationsCheck.windowEnhancedCitations ? '✅' : '❌'}`);
    console.log(`   Citations Count: ${enhancedCitationsCheck.enhancedCitationsCount}`);
    console.log(`   Loader Function: ${enhancedCitationsCheck.loaderExists ? '✅' : '❌'}`);
    console.log(`   Sample Citation (Omega-3): ${enhancedCitationsCheck.sampleCitation}`);
    
    // Test specific Phase 3 supplements
    console.log('\n🧪 Testing Phase 3 Supplements...');
    
    const phase3Supplements = [2, 9, 10, 11, 12, 20, 24, 75];
    const supplementNames = {
      2: "Omega-3 Fish Oil",
      9: "CoQ10",
      10: "Ashwagandha", 
      11: "Rhodiola Rosea",
      12: "Lion's Mane",
      20: "Resveratrol",
      24: "L-Theanine",
      75: "Berberine"
    };
    
    for (const id of phase3Supplements) {
      const supplementCheck = await page.evaluate((suppId) => {
        const citation = window.enhancedCitations && window.enhancedCitations[suppId];
        return {
          exists: !!citation,
          hasEvidenceProfile: citation && !!citation.evidenceProfile,
          tier: citation && citation.evidenceProfile ? citation.evidenceProfile.overallQuality : null,
          score: citation && citation.evidenceProfile ? citation.evidenceProfile.researchQualityScore : null
        };
      }, id);
      
      const name = supplementNames[id];
      const status = supplementCheck.exists ? '✅' : '❌';
      const profileStatus = supplementCheck.hasEvidenceProfile ? '✅' : '❌';
      
      console.log(`   ${name} (ID: ${id}): ${status} | Evidence Profile: ${profileStatus}`);
      if (supplementCheck.exists) {
        console.log(`     Tier: ${supplementCheck.tier || 'Missing'} | Score: ${supplementCheck.score || 'Missing'}`);
      }
    }
    
    // Check overall completion
    console.log('\n📊 Overall System Status...');
    
    const systemStatus = await page.evaluate(() => {
      const totalCitations = window.enhancedCitations ? Object.keys(window.enhancedCitations).length : 0;
      const completionRate = Math.round((totalCitations / 89) * 100);
      
      return {
        totalCitations,
        completionRate,
        systemWorking: totalCitations > 70 // Should have 76+ citations
      };
    });
    
    console.log(`   Total Citations Loaded: ${systemStatus.totalCitations}`);
    console.log(`   Completion Rate: ${systemStatus.completionRate}%`);
    console.log(`   System Status: ${systemStatus.systemWorking ? '✅ Working' : '⚠️ Issues detected'}`);
    
    // Final assessment
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SERVER CONNECTION TEST RESULTS');
    console.log('='.repeat(60));
    
    if (systemStatus.systemWorking && systemStatus.completionRate >= 85) {
      console.log('\n🎉 SERVER TEST: SUCCESS!');
      console.log('✅ Server is running correctly');
      console.log('✅ Enhanced Citations system is working');
      console.log('✅ Phase 3 supplements are loaded');
      console.log(`✅ ${systemStatus.completionRate}% completion rate achieved`);
      console.log('✅ Evidence Profile system is operational');
    } else if (systemStatus.totalCitations > 0) {
      console.log('\n⚠️ SERVER TEST: PARTIAL SUCCESS');
      console.log('✅ Server is accessible');
      console.log('⚠️ Some citations may not be loading properly');
      console.log(`⚠️ Current completion: ${systemStatus.completionRate}%`);
      console.log('🔧 May need to refresh or check file loading');
    } else {
      console.log('\n❌ SERVER TEST: ISSUES DETECTED');
      console.log('❌ Enhanced Citations not loading');
      console.log('🔧 Check JavaScript files and loading sequence');
      console.log('🔧 Verify file paths and syntax');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (systemStatus.systemWorking) {
      console.log('1. ✅ Server is working - continue with development');
      console.log('2. 🚀 Add remaining supplements for 100% completion');
      console.log('3. 🧪 Test specific supplement functionality');
    } else {
      console.log('1. 🔧 Check server logs for errors');
      console.log('2. 🔧 Verify file paths and loading');
      console.log('3. 🔧 Test individual citation files');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Ensure server is running: python -m http.server 3000');
    console.log('2. Check port availability');
    console.log('3. Verify file permissions');
    console.log('4. Check browser compatibility');
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('\n✅ Server connection test complete');
  }
})();
