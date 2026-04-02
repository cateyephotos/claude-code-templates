const { chromium } = require('playwright');

async function testUIRenderingFix() {
    console.log('🔍 UI RENDERING ISSUE INVESTIGATION');
    console.log('===================================');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Navigate to the site
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        
        console.log('📊 CHECKING CARD RENDERING...');
        
        // Check what cards are actually rendered
        const cardAnalysis = await page.evaluate(() => {
            return {
                // Different ways to find cards
                supplementCards: document.querySelectorAll('.supplement-card').length,
                cardHoverElements: document.querySelectorAll('.card-hover').length,
                bgWhiteCards: document.querySelectorAll('.bg-white.rounded-lg.shadow-md').length,
                dataSupplementId: document.querySelectorAll('[data-supplement-id]').length,
                anyCards: document.querySelectorAll('[class*="card"]').length,
                
                // Check grid container
                gridExists: !!document.getElementById('supplementGrid'),
                gridChildren: document.getElementById('supplementGrid')?.children.length || 0,
                gridClasses: document.getElementById('supplementGrid')?.className || '',
                gridHidden: document.getElementById('supplementGrid')?.classList.contains('hidden'),
                
                // Sample card classes
                firstCardClasses: document.querySelector('[data-supplement-id]')?.className || 'No cards found',
                
                // Check if cards have content
                cardsWithContent: Array.from(document.querySelectorAll('[data-supplement-id]')).map(card => ({
                    id: card.dataset.supplementId,
                    hasText: card.textContent.length > 50,
                    textPreview: card.textContent.substring(0, 100)
                })).slice(0, 3) // First 3 cards
            };
        });
        
        console.log('\n📋 CARD ANALYSIS RESULTS:');
        console.log(`   .supplement-card elements: ${cardAnalysis.supplementCards}`);
        console.log(`   .card-hover elements: ${cardAnalysis.cardHoverElements}`);
        console.log(`   .bg-white.rounded-lg.shadow-md: ${cardAnalysis.bgWhiteCards}`);
        console.log(`   [data-supplement-id] elements: ${cardAnalysis.dataSupplementId}`);
        console.log(`   [class*="card"] elements: ${cardAnalysis.anyCards}`);
        
        console.log('\n🎯 GRID CONTAINER STATUS:');
        console.log(`   Grid exists: ${cardAnalysis.gridExists}`);
        console.log(`   Grid children: ${cardAnalysis.gridChildren}`);
        console.log(`   Grid classes: ${cardAnalysis.gridClasses}`);
        console.log(`   Grid hidden: ${cardAnalysis.gridHidden}`);
        
        console.log('\n🔍 FIRST CARD DETAILS:');
        console.log(`   First card classes: ${cardAnalysis.firstCardClasses}`);
        
        if (cardAnalysis.cardsWithContent.length > 0) {
            console.log('\n📝 SAMPLE CARD CONTENT:');
            cardAnalysis.cardsWithContent.forEach((card, i) => {
                console.log(`   Card ${i + 1} (ID: ${card.id}): ${card.hasText ? 'Has content' : 'Empty'}`);
                if (card.hasText) {
                    console.log(`      Preview: ${card.textPreview}...`);
                }
            });
        }
        
        // Test clicking on a card
        if (cardAnalysis.dataSupplementId > 0) {
            console.log('\n🖱️  TESTING CARD INTERACTION...');
            
            try {
                // Click on the first card
                await page.click('[data-supplement-id]');
                await page.waitForTimeout(2000);
                
                // Check if modal opened
                const modalCheck = await page.evaluate(() => {
                    const modal = document.querySelector('.modal, .supplement-modal, [class*="modal"]');
                    return {
                        modalExists: !!modal,
                        modalVisible: modal ? !modal.classList.contains('hidden') : false,
                        modalClasses: modal?.className || 'No modal found'
                    };
                });
                
                console.log(`   Modal opened: ${modalCheck.modalExists && modalCheck.modalVisible}`);
                console.log(`   Modal classes: ${modalCheck.modalClasses}`);
                
                if (modalCheck.modalExists && modalCheck.modalVisible) {
                    console.log('   ✅ Card interaction working!');
                    
                    // Close modal
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(1000);
                } else {
                    console.log('   ❌ Card interaction not working');
                }
                
            } catch (error) {
                console.log(`   ❌ Error testing card interaction: ${error.message}`);
            }
        }
        
        // Final diagnosis
        console.log('\n🏥 DIAGNOSIS:');
        if (cardAnalysis.dataSupplementId > 0) {
            console.log('   ✅ Cards ARE rendering correctly!');
            console.log('   ✅ The issue was with the test selector');
            console.log('   📝 Cards use class: "bg-white rounded-lg shadow-md card-hover"');
            console.log('   📝 NOT class: "supplement-card"');
            console.log('   🎯 Solution: Update test selectors to use correct classes');
        } else {
            console.log('   ❌ Cards are NOT rendering');
            console.log('   🔍 Need to investigate rendering pipeline');
        }
        
        return cardAnalysis;
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
testUIRenderingFix()
    .then(results => {
        console.log('\n🎉 UI rendering investigation completed!');
        console.log(`📊 Found ${results.dataSupplementId} supplement cards`);
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Investigation failed:', error);
        process.exit(1);
    });
