/**
 * Simple Structure Test
 * Just load the file and check the structure
 */

const { chromium } = require('playwright');

async function testStructureSimple() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const structure = await page.evaluate(() => {
            if (window.enhancedCitations && window.enhancedCitations[8]) {
                const data = window.enhancedCitations[8];
                return {
                    rootKeys: Object.keys(data),
                    hasCitations: !!data.citations,
                    citationsKeys: data.citations ? Object.keys(data.citations) : null,
                    hasBenefitsAtRoot: !!data.benefits,
                    hasBenefitsInCitations: !!(data.citations && data.citations.benefits),
                    benefitsLocation: data.benefits ? 'root' : (data.citations && data.citations.benefits ? 'citations' : 'missing')
                };
            }
            return { error: 'No data found' };
        });
        
        console.log('📊 Structure Analysis:');
        console.log(JSON.stringify(structure, null, 2));
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testStructureSimple();
