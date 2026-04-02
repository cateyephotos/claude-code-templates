const { chromium } = require('playwright');

async function debugPageLoading() {
    console.log('🔍 DEBUGGING PAGE LOADING');
    console.log('==========================');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Listen for console messages and errors
    page.on('console', msg => {
        console.log(`🖥️  CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    try {
        console.log('📡 Navigating to localhost:8080...');
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        
        console.log('⏱️  Waiting for page to load...');
        await page.waitForTimeout(5000);
        
        // Check what's actually on the page
        const pageContent = await page.evaluate(() => {
            return {
                title: document.title,
                bodyText: document.body ? document.body.textContent.substring(0, 200) : 'No body',
                hasSupplementCards: document.querySelectorAll('.supplement-card').length,
                hasSupplementsContainer: !!document.querySelector('#supplements-container, .supplements-container'),
                scriptTags: Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline'),
                errors: window.errors || []
            };
        });
        
        console.log('\n📄 PAGE CONTENT ANALYSIS:');
        console.log(`   Title: ${pageContent.title}`);
        console.log(`   Body text preview: ${pageContent.bodyText}`);
        console.log(`   Supplement cards found: ${pageContent.hasSupplementCards}`);
        console.log(`   Has supplements container: ${pageContent.hasSupplementsContainer}`);
        console.log(`   Script tags: ${pageContent.scriptTags.length}`);
        
        if (pageContent.scriptTags.length > 0) {
            console.log('   Scripts loaded:');
            pageContent.scriptTags.forEach((script, i) => {
                console.log(`     ${i + 1}. ${script}`);
            });
        }
        
        // Check if our enhanced citations are loading
        const enhancedCitationsStatus = await page.evaluate(() => {
            return {
                enhancedCitationsExists: !!window.enhancedCitations,
                enhancedCitationsCount: window.enhancedCitations ? Object.keys(window.enhancedCitations).length : 0,
                supplementDatabaseExists: !!window.supplementDatabase,
                supplementCount: window.supplementDatabase ? window.supplementDatabase.supplements?.length : 0,
                specificSupplements: {
                    lTheanine: !!window.enhancedCitations?.[9],
                    phosphatidylserine: !!window.enhancedCitations?.[12],
                    quercetin: !!window.enhancedCitations?.[20],
                    nadPrecursors: !!window.enhancedCitations?.[25],
                    hawthornBerry: !!window.enhancedCitations?.[59]
                }
            };
        });
        
        console.log('\n🧬 ENHANCED CITATIONS STATUS:');
        console.log(`   Enhanced citations object exists: ${enhancedCitationsStatus.enhancedCitationsExists}`);
        console.log(`   Enhanced citations count: ${enhancedCitationsStatus.enhancedCitationsCount}`);
        console.log(`   Supplement database exists: ${enhancedCitationsStatus.supplementDatabaseExists}`);
        console.log(`   Total supplements: ${enhancedCitationsStatus.supplementCount}`);
        
        console.log('\n🎯 SPECIFIC SUPPLEMENTS CHECK:');
        Object.entries(enhancedCitationsStatus.specificSupplements).forEach(([name, exists]) => {
            console.log(`   ${name}: ${exists ? '✅' : '❌'}`);
        });
        
        // Take a screenshot for visual debugging
        await page.screenshot({ path: 'debug-page-loading.png', fullPage: true });
        console.log('\n📸 Screenshot saved: debug-page-loading.png');
        
        // Wait a bit more to see if anything loads
        console.log('\n⏳ Waiting additional 10 seconds for any delayed loading...');
        await page.waitForTimeout(10000);
        
        const finalCheck = await page.evaluate(() => {
            return {
                supplementCards: document.querySelectorAll('.supplement-card').length,
                anyCards: document.querySelectorAll('[class*="card"]').length,
                bodyClasses: document.body?.className || '',
                mainContent: document.querySelector('main, #main, .main')?.textContent?.substring(0, 100) || 'No main content'
            };
        });
        
        console.log('\n🔍 FINAL CHECK:');
        console.log(`   Supplement cards: ${finalCheck.supplementCards}`);
        console.log(`   Any cards: ${finalCheck.anyCards}`);
        console.log(`   Body classes: ${finalCheck.bodyClasses}`);
        console.log(`   Main content: ${finalCheck.mainContent}`);
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugPageLoading()
    .then(() => {
        console.log('\n✅ Debug completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Debug failed:', error);
        process.exit(1);
    });
