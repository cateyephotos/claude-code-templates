const puppeteer = require('playwright');

async function testFixedSupplements() {
    const browser = await puppeteer.chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Test specific supplements that had issues
    const testSupplements = [
        { id: '4', name: 'Omega-3 Fatty Acids' },
        { id: '6', name: 'Magnesium' },
        { id: '7', name: 'Vitamin D3' },
        { id: '11', name: "Lion's Mane Mushroom" },
        { id: '12', name: 'Phosphatidylserine' },
        { id: '13', name: 'Acetyl-L-Carnitine' }
    ];
    
    try {
        console.log('🌐 Testing fixed supplements...');
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const results = [];
        
        for (const supp of testSupplements) {
            console.log(`\n🧪 Testing ${supp.name} (ID: ${supp.id})...`);
            
            const card = await page.$(`[data-supplement-id="${supp.id}"]`);
            if (!card) {
                console.log(`   ❌ Card not found`);
                continue;
            }
            
            const viewDetailsBtn = await card.$('button:has-text("View Details")');
            if (!viewDetailsBtn) {
                console.log(`   ❌ No View Details button`);
                continue;
            }
            
            await viewDetailsBtn.click();
            await page.waitForTimeout(1500);
            
            const modal = await page.$('.fixed.inset-0');
            if (!modal) {
                console.log(`   ❌ Modal failed to open`);
                continue;
            }
            
            // Check for undefined patterns
            const modalHtml = await modal.innerHTML();
            const undefinedPatterns = [
                /<strong>Target:<\/strong>\s*undefined/gi,
                /Target:\s*undefined/gi,
                /\bundefined\b/gi
            ];
            
            let hasUndefined = false;
            undefinedPatterns.forEach(pattern => {
                const matches = modalHtml.match(pattern);
                if (matches && matches.length > 0) {
                    hasUndefined = true;
                    console.log(`   ❌ Still has undefined: ${matches.length} matches of ${pattern}`);
                }
            });
            
            if (!hasUndefined) {
                console.log(`   ✅ FIXED: No undefined issues found!`);
            }
            
            results.push({
                id: supp.id,
                name: supp.name,
                isFixed: !hasUndefined
            });
            
            // Close modal
            const closeBtn = await modal.$('button');
            if (closeBtn) {
                await closeBtn.click();
                await page.waitForTimeout(500);
            }
        }
        
        console.log(`\n📊 RESULTS:`);
        const fixedCount = results.filter(r => r.isFixed).length;
        console.log(`   Fixed supplements: ${fixedCount}/${results.length}`);
        
        results.forEach(result => {
            console.log(`   ${result.isFixed ? '✅' : '❌'} ${result.name}`);
        });
        
        if (fixedCount === results.length) {
            console.log(`\n🎉 ALL TESTED SUPPLEMENTS ARE NOW FIXED!`);
        } else {
            console.log(`\n⚠️  ${results.length - fixedCount} supplements still have issues`);
        }
        
        return results;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return [];
    } finally {
        await browser.close();
    }
}

// Run test
testFixedSupplements().then(results => {
    console.log('\n📄 Test complete');
}).catch(console.error);