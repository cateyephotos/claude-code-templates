/**
 * Citation Loading Performance Test
 * Tests enhanced citation file loading performance
 * Generated: 2025-08-20
 */

const http = require('http');

async function testCitationPerformance() {
    console.log('⚡ ENHANCED CITATIONS PERFORMANCE TEST');
    console.log('=====================================\n');

    const enhancedFiles = [
        'data/enhanced_citations/21_vitamin_b12_enhanced.js',
        'data/enhanced_citations/22_vitamin_b6_enhanced.js',
        'data/enhanced_citations/34_enhanced.js',
        'data/enhanced_citations/37_zinc_enhanced.js',
        'data/enhanced_citations/38_iron_enhanced.js',
        'data/enhanced_citations/40_enhanced.js',
        'data/enhanced_citations/41_inositol_enhanced.js',
        'data/enhanced_citations/43_choline_enhanced.js',
        'data/enhanced_citations/44_enhanced.js',
        'data/enhanced_citations/45_enhanced.js'
    ];

    const results = [];
    let totalTime = 0;
    let successCount = 0;

    console.log('Testing citation file loading performance...\n');

    for (const file of enhancedFiles) {
        const fileName = file.split('/').pop();
        const startTime = Date.now();
        
        try {
            await new Promise((resolve, reject) => {
                const req = http.get(`http://localhost:8001/${file}`, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        const loadTime = Date.now() - startTime;
                        const fileSize = Buffer.byteLength(data, 'utf8');
                        
                        results.push({
                            file: fileName,
                            loadTime,
                            fileSize,
                            status: 'success',
                            sizeKB: (fileSize / 1024).toFixed(1)
                        });
                        
                        totalTime += loadTime;
                        successCount++;
                        
                        const status = loadTime < 500 ? '✅' : loadTime < 1000 ? '⚠️' : '❌';
                        console.log(`${status} ${fileName.padEnd(35)} ${loadTime}ms (${(fileSize / 1024).toFixed(1)} KB)`);
                        resolve();
                    });
                });
                
                req.on('error', (err) => {
                    const loadTime = Date.now() - startTime;
                    results.push({
                        file: fileName,
                        loadTime,
                        status: 'error',
                        error: err.message
                    });
                    console.log(`❌ ${fileName.padEnd(35)} Error: ${err.message}`);
                    resolve();
                });
                
                req.setTimeout(5000, () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
            });
        } catch (error) {
            console.log(`❌ ${fileName.padEnd(35)} Timeout`);
            results.push({
                file: fileName,
                status: 'timeout',
                error: 'Request timeout'
            });
        }
    }

    // Performance Analysis
    console.log('\n📊 PERFORMANCE ANALYSIS');
    console.log('=======================');

    const successfulTests = results.filter(r => r.status === 'success');
    const averageLoadTime = successfulTests.length > 0 ? 
        successfulTests.reduce((sum, r) => sum + r.loadTime, 0) / successfulTests.length : 0;
    const maxLoadTime = successfulTests.length > 0 ? 
        Math.max(...successfulTests.map(r => r.loadTime)) : 0;
    const minLoadTime = successfulTests.length > 0 ? 
        Math.min(...successfulTests.map(r => r.loadTime)) : 0;
    const totalDataTransfer = successfulTests.reduce((sum, r) => sum + r.fileSize, 0);

    console.log(`Successful loads: ${successfulTests.length}/${enhancedFiles.length}`);
    console.log(`Average load time: ${averageLoadTime.toFixed(1)}ms`);
    console.log(`Fastest load: ${minLoadTime}ms`);
    console.log(`Slowest load: ${maxLoadTime}ms`);
    console.log(`Total data transfer: ${(totalDataTransfer / 1024).toFixed(1)} KB`);

    // Performance Rating
    let performanceRating = 'EXCELLENT';
    let recommendations = [];

    if (averageLoadTime > 500) {
        performanceRating = 'NEEDS_IMPROVEMENT';
        recommendations.push('Optimize citation file sizes');
        recommendations.push('Consider implementing gzip compression');
    } else if (averageLoadTime > 200) {
        performanceRating = 'GOOD';
        recommendations.push('Consider CDN for faster delivery');
    }

    if (maxLoadTime > 1000) {
        recommendations.push('Investigate slow-loading files');
    }

    if (successfulTests.length < enhancedFiles.length) {
        recommendations.push('Fix file accessibility issues');
    }

    console.log(`\n🎯 PERFORMANCE RATING: ${performanceRating}`);

    if (performanceRating === 'EXCELLENT') {
        console.log('🎉 All citation files load quickly and efficiently!');
        console.log('✅ Performance meets production standards (<500ms average)');
    } else if (performanceRating === 'GOOD') {
        console.log('✅ Good performance with room for optimization');
    } else {
        console.log('⚠️  Performance improvements recommended');
    }

    if (recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        recommendations.forEach(rec => console.log(`   - ${rec}`));
    }

    // User Experience Impact
    console.log('\n👤 USER EXPERIENCE IMPACT:');
    if (averageLoadTime < 100) {
        console.log('🚀 INSTANT: Users will experience instant citation loading');
    } else if (averageLoadTime < 300) {
        console.log('⚡ FAST: Users will experience fast, responsive citation loading');
    } else if (averageLoadTime < 500) {
        console.log('✅ GOOD: Users will experience good citation loading performance');
    } else {
        console.log('⏳ SLOW: Users may notice delays in citation loading');
    }

    // Detailed breakdown for largest files
    const largestFiles = successfulTests
        .sort((a, b) => b.fileSize - a.fileSize)
        .slice(0, 3);

    if (largestFiles.length > 0) {
        console.log('\n📁 LARGEST CITATION FILES:');
        largestFiles.forEach(file => {
            console.log(`   ${file.file}: ${file.sizeKB} KB (${file.loadTime}ms)`);
        });
    }

    // Save performance report
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalFiles: enhancedFiles.length,
            successfulLoads: successfulTests.length,
            averageLoadTime: parseFloat(averageLoadTime.toFixed(1)),
            performanceRating,
            recommendations
        },
        results,
        analysis: {
            minLoadTime,
            maxLoadTime,
            totalDataTransfer,
            averageFileSize: totalDataTransfer / successfulTests.length
        }
    };

    const reportPath = require('path').join(__dirname, 'citation-performance-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Performance report saved to: ${reportPath}`);

    return report;
}

// Run the test
if (require.main === module) {
    testCitationPerformance().catch(console.error);
}

module.exports = testCitationPerformance;