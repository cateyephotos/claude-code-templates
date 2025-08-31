const { chromium } = require('playwright');

async function finalVerification() {
    console.log('🔍 Final verification of fixed supplements...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        
        const fixedSupplements = [4, 6, 7]; // Omega-3, Magnesium, Vitamin D3
        
        for (const id of fixedSupplements) {
            console.log(`\n📋 Verifying supplement ID: ${id}`);
            
            // Scroll to the supplement
            const card = page.locator(`[data-supplement-id="${id}"]`);
            await card.scrollIntoViewIfNeeded();
            
            // Get supplement name for reference
            const name = await card.locator('h3').textContent();
            console.log(`   Name: ${name}`);
            
            // Check if enhanced citation loads
            const hasEnhanced = await page.evaluate((supplementId) => {
                return window.enhancedCitations && window.enhancedCitations[supplementId];
            }, id);
            
            console.log(`   Enhanced citation loaded: ${hasEnhanced}`);
            
            if (hasEnhanced) {
                // Quick check of citation structure
                const citationStructure = await page.evaluate((supplementId) => {
                    const data = window.enhancedCitations[supplementId];
                    return {
                        hasMechanisms: data.citations && data.citations.mechanisms && data.citations.mechanisms.length > 0,
                        hasBenefits: data.citations && data.citations.benefits && data.citations.benefits.length > 0,
                        hasSafety: data.citations && data.citations.safety && data.citations.safety.length > 0,
                        hasDosage: data.citations && data.citations.dosage && data.citations.dosage.length > 0
                    };
                }, id);
                
                console.log(`   Citation sections:`, citationStructure);
                
                // Check for undefined values in the citation data
                const hasUndefined = await page.evaluate((supplementId) => {
                    const data = window.enhancedCitations[supplementId];
                    const jsonString = JSON.stringify(data);
                    return jsonString.includes('undefined');
                }, id);
                
                console.log(`   Contains undefined values: ${hasUndefined}`);
                
                if (!hasUndefined) {
                    console.log(`   ✅ ${name} structure is clean`);
                } else {
                    console.log(`   ⚠️  ${name} still has undefined values`);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    } finally {
        await browser.close();
    }
    
    console.log('\n🏁 Final verification complete');
}

finalVerification();