/**
 * Manual Front-End Test for Enhanced Citations
 * Tests the actual functionality at http://localhost:8001
 * Generated: 2025-08-20
 */

const http = require('http');

async function testFrontEnd() {
    console.log('🌐 FRONT-END ENHANCED CITATIONS TEST');
    console.log('====================================\n');

    const results = {
        serverRunning: false,
        pageAccessible: false,
        timestamp: new Date().toISOString(),
        testResults: {}
    };

    // Test 1: Check if server is running
    console.log('1. Testing server accessibility...');
    try {
        await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:8001', (res) => {
                if (res.statusCode === 200) {
                    results.serverRunning = true;
                    results.pageAccessible = true;
                    console.log('   ✅ Server is running and accessible');
                    resolve();
                } else {
                    console.log(`   ❌ Server returned status: ${res.statusCode}`);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
            
            req.on('error', (err) => {
                console.log(`   ❌ Server not accessible: ${err.message}`);
                reject(err);
            });
            
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
        });
    } catch (error) {
        results.serverRunning = false;
        console.log(`   ❌ Cannot access server: ${error.message}`);
    }

    // Test 2: HTML content validation
    if (results.serverRunning) {
        console.log('\n2. Testing HTML content...');
        try {
            const htmlContent = await new Promise((resolve, reject) => {
                let data = '';
                const req = http.get('http://localhost:8001', (res) => {
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(data));
                });
                req.on('error', reject);
                req.setTimeout(10000, () => {
                    req.destroy();
                    reject(new Error('Request timeout'));
                });
            });

            // Check for key components
            const checks = {
                hasSupplementsScript: htmlContent.includes('data/supplements.js'),
                hasCitationLoader: htmlContent.includes('CitationLoader.js'),
                hasCitationRenderer: htmlContent.includes('CitationRenderer.js'),
                hasModalContainer: htmlContent.includes('supplementModal'),
                hasEnhancedStyles: htmlContent.includes('enhanced-citation-card'),
                hasPhase2aBadge: htmlContent.includes('phase-2a-badge')
            };

            results.testResults.htmlValidation = checks;
            
            Object.entries(checks).forEach(([check, passed]) => {
                const status = passed ? '✅' : '❌';
                const description = check.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase());
                console.log(`   ${status} ${description}`);
            });

            const passedChecks = Object.values(checks).filter(Boolean).length;
            console.log(`   Summary: ${passedChecks}/${Object.keys(checks).length} checks passed`);

        } catch (error) {
            console.log(`   ❌ Error testing HTML content: ${error.message}`);
        }
    }

    // Test 3: JavaScript files accessibility
    if (results.serverRunning) {
        console.log('\n3. Testing JavaScript files...');
        
        const jsFiles = [
            'data/supplements.js',
            'js/CitationLoader.js',
            'js/CitationRenderer.js',
            'js/app.modernized.js'
        ];

        const jsResults = {};
        
        for (const file of jsFiles) {
            try {
                await new Promise((resolve, reject) => {
                    const req = http.get(`http://localhost:8001/${file}`, (res) => {
                        if (res.statusCode === 200) {
                            jsResults[file] = { accessible: true, status: res.statusCode };
                            console.log(`   ✅ ${file} - accessible`);
                            resolve();
                        } else {
                            jsResults[file] = { accessible: false, status: res.statusCode };
                            console.log(`   ❌ ${file} - HTTP ${res.statusCode}`);
                            resolve(); // Don't fail the whole test
                        }
                    });
                    req.on('error', (err) => {
                        jsResults[file] = { accessible: false, error: err.message };
                        console.log(`   ❌ ${file} - ${err.message}`);
                        resolve(); // Don't fail the whole test
                    });
                    req.setTimeout(5000, () => {
                        req.destroy();
                        reject(new Error('Timeout'));
                    });
                });
            } catch (error) {
                jsResults[file] = { accessible: false, error: error.message };
                console.log(`   ❌ ${file} - ${error.message}`);
            }
        }
        
        results.testResults.jsFiles = jsResults;
    }

    // Test 4: Enhanced citation files accessibility
    if (results.serverRunning) {
        console.log('\n4. Testing enhanced citation files...');
        
        const enhancedFiles = [
            'data/enhanced_citations/21_vitamin_b12_enhanced.js',
            'data/enhanced_citations/37_zinc_enhanced.js',
            'data/enhanced_citations/43_choline_enhanced.js'
        ];

        const enhancedResults = {};
        
        for (const file of enhancedFiles) {
            try {
                await new Promise((resolve, reject) => {
                    const req = http.get(`http://localhost:8001/${file}`, (res) => {
                        if (res.statusCode === 200) {
                            enhancedResults[file] = { accessible: true, status: res.statusCode };
                            console.log(`   ✅ ${file} - accessible`);
                            resolve();
                        } else {
                            enhancedResults[file] = { accessible: false, status: res.statusCode };
                            console.log(`   ❌ ${file} - HTTP ${res.statusCode}`);
                            resolve();
                        }
                    });
                    req.on('error', (err) => {
                        enhancedResults[file] = { accessible: false, error: err.message };
                        console.log(`   ❌ ${file} - ${err.message}`);
                        resolve();
                    });
                    req.setTimeout(5000, () => {
                        req.destroy();
                        reject(new Error('Timeout'));
                    });
                });
            } catch (error) {
                enhancedResults[file] = { accessible: false, error: error.message };
                console.log(`   ❌ ${file} - ${error.message}`);
            }
        }
        
        results.testResults.enhancedFiles = enhancedResults;
    }

    // Summary and recommendations
    console.log('\n🎯 FRONT-END TEST SUMMARY');
    console.log('=========================');
    
    if (results.serverRunning) {
        console.log('✅ Server Status: Running and accessible');
        
        // Calculate overall score
        let totalChecks = 0;
        let passedChecks = 0;
        
        if (results.testResults.htmlValidation) {
            const htmlChecks = Object.values(results.testResults.htmlValidation);
            totalChecks += htmlChecks.length;
            passedChecks += htmlChecks.filter(Boolean).length;
        }
        
        if (results.testResults.jsFiles) {
            const jsChecks = Object.values(results.testResults.jsFiles);
            totalChecks += jsChecks.length;
            passedChecks += jsChecks.filter(f => f.accessible).length;
        }
        
        if (results.testResults.enhancedFiles) {
            const enhancedChecks = Object.values(results.testResults.enhancedFiles);
            totalChecks += enhancedChecks.length;
            passedChecks += enhancedChecks.filter(f => f.accessible).length;
        }
        
        const score = totalChecks > 0 ? ((passedChecks / totalChecks) * 100).toFixed(1) : 0;
        console.log(`🎯 Overall Score: ${score}% (${passedChecks}/${totalChecks} checks passed)`);
        
        if (score >= 90) {
            console.log('🎉 EXCELLENT: Front-end integration is working optimally!');
        } else if (score >= 75) {
            console.log('✅ GOOD: Front-end integration is mostly working.');
        } else {
            console.log('⚠️  NEEDS ATTENTION: Multiple front-end issues detected.');
        }
        
        console.log('\n📋 MANUAL TESTING RECOMMENDATIONS:');
        console.log('1. 🌐 Visit http://localhost:8001 in your browser');
        console.log('2. 🔍 Search for "Vitamin B12" and click on its card');
        console.log('3. 📖 Check if enhanced citation modal opens correctly');
        console.log('4. 🏷️  Look for Phase 2A badges on supplement cards');
        console.log('5. ⚡ Test citation loading performance (<500ms)');
        console.log('6. 🕹️  Test tab navigation in citation modal');
        console.log('7. 🔄 Test other target supplements from the list');
        
    } else {
        console.log('❌ Server Status: Not running or not accessible');
        console.log('\n📋 TROUBLESHOOTING:');
        console.log('1. 🚀 Ensure server is running: python -m http.server 8001');
        console.log('2. 🌐 Check if port 8001 is available');
        console.log('3. 📁 Verify you are in the correct directory');
        console.log('4. 🔄 Try a different port if 8001 is in use');
    }

    // Save results
    const reportPath = require('path').join(__dirname, 'frontend-test-results.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Test results saved to: ${reportPath}`);

    return results;
}

// Run the test
if (require.main === module) {
    testFrontEnd().catch(console.error);
}

module.exports = testFrontEnd;