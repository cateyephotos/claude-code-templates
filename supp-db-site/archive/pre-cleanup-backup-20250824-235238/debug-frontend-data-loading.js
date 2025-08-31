/**
 * Debug Frontend Data Loading
 * Investigate why enhanced supplements aren't being detected in the frontend
 */

const { chromium } = require('playwright');

async function debugFrontendDataLoading() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Debugging frontend data loading...');
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        
        // Check what data is actually loaded in the frontend
        const frontendData = await page.evaluate(() => {
            const data = {
                supplementsDataExists: !!window.supplementsData,
                supplementsDataKeys: window.supplementsData ? Object.keys(window.supplementsData) : null,
                supplementsArray: null,
                enhancedCitationsExists: !!window.enhancedCitations,
                enhancedCitationsKeys: window.enhancedCitations ? Object.keys(window.enhancedCitations) : null,
                sampleSupplements: [],
                loadedScripts: []
            };
            
            // Get list of loaded scripts
            const scripts = document.querySelectorAll('script[src]');
            data.loadedScripts = Array.from(scripts).map(script => script.src);
            
            // Check supplements data structure
            if (window.supplementsData && window.supplementsData.supplements) {
                data.supplementsArray = {
                    length: window.supplementsData.supplements.length,
                    firstFew: window.supplementsData.supplements.slice(0, 3).map(s => ({
                        id: s.id,
                        name: s.name,
                        isEnhanced: s.isEnhanced,
                        evidenceTier: s.evidenceTier
                    }))
                };
                
                // Count enhanced supplements
                const enhanced = window.supplementsData.supplements.filter(s => s.isEnhanced);
                data.enhancedCount = enhanced.length;
                data.sampleEnhanced = enhanced.slice(0, 5).map(s => ({
                    id: s.id,
                    name: s.name,
                    isEnhanced: s.isEnhanced
                }));
            }
            
            return data;
        });
        
        console.log('📊 Frontend Data Analysis:');
        console.log('=' .repeat(50));
        console.log(`Supplements Data Exists: ${frontendData.supplementsDataExists}`);
        console.log(`Enhanced Citations Exists: ${frontendData.enhancedCitationsExists}`);
        
        if (frontendData.supplementsDataExists) {
            console.log(`Supplements Data Keys: ${frontendData.supplementsDataKeys}`);
            if (frontendData.supplementsArray) {
                console.log(`Total Supplements: ${frontendData.supplementsArray.length}`);
                console.log(`Enhanced Count: ${frontendData.enhancedCount || 0}`);
                console.log('First Few Supplements:', frontendData.supplementsArray.firstFew);
                if (frontendData.sampleEnhanced) {
                    console.log('Sample Enhanced:', frontendData.sampleEnhanced);
                }
            }
        } else {
            console.log('❌ supplementsData not found in window object');
        }
        
        if (frontendData.enhancedCitationsExists) {
            console.log(`Enhanced Citations Keys: ${frontendData.enhancedCitationsKeys?.slice(0, 10)}`);
            console.log(`Total Enhanced Citations: ${frontendData.enhancedCitationsKeys?.length || 0}`);
        } else {
            console.log('❌ enhancedCitations not found in window object');
        }
        
        console.log('\n📜 Loaded Scripts:');
        frontendData.loadedScripts.forEach(script => {
            if (script.includes('supplements') || script.includes('enhanced')) {
                console.log(`  ✓ ${script}`);
            }
        });
        
        // Check if supplements.js is loading properly
        const supplementsJsCheck = await page.evaluate(() => {
            // Try to find supplements.js content
            const scripts = document.querySelectorAll('script');
            let supplementsContent = null;
            
            for (const script of scripts) {
                if (script.textContent && script.textContent.includes('supplements')) {
                    supplementsContent = {
                        hasSupplementsKeyword: true,
                        hasIsEnhanced: script.textContent.includes('isEnhanced'),
                        contentLength: script.textContent.length,
                        sampleContent: script.textContent.substring(0, 500)
                    };
                    break;
                }
            }
            
            return supplementsContent;
        });
        
        console.log('\n📄 Supplements.js Content Check:');
        if (supplementsJsCheck) {
            console.log(`Has supplements keyword: ${supplementsJsCheck.hasSupplementsKeyword}`);
            console.log(`Has isEnhanced property: ${supplementsJsCheck.hasIsEnhanced}`);
            console.log(`Content length: ${supplementsJsCheck.contentLength}`);
            console.log('Sample content:', supplementsJsCheck.sampleContent);
        } else {
            console.log('❌ No supplements.js content found in page');
        }
        
        // Check network requests
        const networkRequests = [];
        page.on('request', request => {
            if (request.url().includes('supplements') || request.url().includes('enhanced')) {
                networkRequests.push({
                    url: request.url(),
                    method: request.method(),
                    resourceType: request.resourceType()
                });
            }
        });
        
        // Reload page to capture network requests
        console.log('\n🔄 Reloading page to capture network requests...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        console.log('\n🌐 Network Requests:');
        networkRequests.forEach(req => {
            console.log(`  ${req.method} ${req.resourceType}: ${req.url}`);
        });
        
        return frontendData;
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run debug
if (require.main === module) {
    debugFrontendDataLoading()
        .then(data => {
            console.log('\n🎯 Debug complete!');
            
            if (!data.supplementsDataExists) {
                console.log('\n🚨 CRITICAL ISSUE: supplements.js not loading properly');
                console.log('📋 Next steps:');
                console.log('  1. Check if supplements.js file exists and is accessible');
                console.log('  2. Verify HTML includes correct script tag');
                console.log('  3. Check for JavaScript syntax errors in supplements.js');
                console.log('  4. Ensure server is serving the file correctly');
            } else if (data.enhancedCount === 0) {
                console.log('\n🚨 ISSUE: supplements.js loading but no enhanced supplements detected');
                console.log('📋 Next steps:');
                console.log('  1. Check if isEnhanced properties are properly set in supplements.js');
                console.log('  2. Verify the fix-enhancement-markers.js script worked correctly');
                console.log('  3. Check for syntax errors in supplements.js');
            } else {
                console.log('\n✅ Data loading appears to be working correctly');
            }
        })
        .catch(error => {
            console.error('💥 Debug failed:', error);
            process.exit(1);
        });
}

module.exports = { debugFrontendDataLoading };
