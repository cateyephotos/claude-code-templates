/**
 * Final Verification Script
 * Confirms that Primary Benefits are displaying correctly
 */

const { chromium } = require('playwright');

async function finalVerification() {
    console.log('🔍 === FINAL VERIFICATION: Primary Benefits Display ===');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle' });
        
        // Wait for supplement cards to load
        await page.waitForSelector('[data-supplement-id]', { timeout: 10000 });
        
        // Detailed inspection of cards and their Primary Benefits sections
        const cardAnalysis = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('[data-supplement-id]'));
            
            return cards.slice(0, 10).map(card => {
                const supplementId = card.getAttribute('data-supplement-id');
                const supplementName = card.querySelector('h3')?.textContent || 'Unknown';
                
                // Look for Primary Benefits heading
                const benefitsHeading = Array.from(card.querySelectorAll('h4')).find(h4 => 
                    h4.textContent.includes('Primary Benefits')
                );
                
                // Count benefit tags
                const cognitiveSpans = card.querySelectorAll('.bg-blue-100');
                const nonCognitiveSpans = card.querySelectorAll('.bg-green-100');
                
                // Get benefit text
                const cognitiveTexts = Array.from(cognitiveSpans).map(span => span.textContent);
                const nonCognitiveTexts = Array.from(nonCognitiveSpans).map(span => span.textContent);
                
                return {
                    supplementId,
                    supplementName,
                    hasPrimaryBenefitsHeading: !!benefitsHeading,
                    benefitsHeadingText: benefitsHeading?.textContent || null,
                    cognitiveTagCount: cognitiveSpans.length,
                    nonCognitiveTagCount: nonCognitiveSpans.length,
                    cognitiveTexts,
                    nonCognitiveTexts,
                    totalBenefitTags: cognitiveSpans.length + nonCognitiveSpans.length
                };
            });
        });
        
        // Overall statistics
        const overallStats = {
            totalCardsAnalyzed: cardAnalysis.length,
            cardsWithPrimaryBenefitsHeading: cardAnalysis.filter(c => c.hasPrimaryBenefitsHeading).length,
            cardsWithCognitiveTags: cardAnalysis.filter(c => c.cognitiveTagCount > 0).length,
            cardsWithNonCognitiveTags: cardAnalysis.filter(c => c.nonCognitiveTagCount > 0).length,
            totalCognitiveTags: cardAnalysis.reduce((sum, c) => sum + c.cognitiveTagCount, 0),
            totalNonCognitiveTags: cardAnalysis.reduce((sum, c) => sum + c.nonCognitiveTagCount, 0),
            totalBenefitTags: cardAnalysis.reduce((sum, c) => sum + c.totalBenefitTags, 0)
        };
        
        // Take focused screenshots
        await page.screenshot({ 
            path: 'final-verification-full-page.png', 
            fullPage: true 
        });
        
        // Screenshot just the cards area
        const cardsArea = await page.locator('#supplementGrid');
        await cardsArea.screenshot({ path: 'final-verification-cards-area.png' });
        
        // Screenshot of first card
        const firstCard = await page.locator('[data-supplement-id]:first-child');
        await firstCard.screenshot({ path: 'final-verification-first-card.png' });
        
        console.log('\n📊 === VERIFICATION RESULTS ===');
        console.log('Overall Statistics:');
        console.table(overallStats);
        
        console.log('\nDetailed Card Analysis:');
        cardAnalysis.forEach((card, index) => {
            console.log(`\n${index + 1}. ${card.supplementName} (ID: ${card.supplementId})`);
            console.log(`   ✅ Has Primary Benefits heading: ${card.hasPrimaryBenefitsHeading ? 'YES' : 'NO'}`);
            console.log(`   🔵 Cognitive tags: ${card.cognitiveTagCount} (${card.cognitiveTexts.join(', ')})`);
            console.log(`   🟢 Non-cognitive tags: ${card.nonCognitiveTagCount} (${card.nonCognitiveTexts.join(', ')})`);
        });
        
        // Final assessment
        const isWorkingCorrectly = 
            overallStats.cardsWithPrimaryBenefitsHeading === overallStats.totalCardsAnalyzed &&
            overallStats.totalBenefitTags > 0 &&
            overallStats.totalCognitiveTags > 0 &&
            overallStats.totalNonCognitiveTags > 0;
        
        console.log('\n🎯 === FINAL ASSESSMENT ===');
        if (isWorkingCorrectly) {
            console.log('✅ PRIMARY BENEFITS ARE DISPLAYING CORRECTLY!');
            console.log('✅ All supplement cards show Primary Benefits sections');
            console.log('✅ Cognitive benefit tags (blue) are rendering');
            console.log('✅ Non-cognitive benefit tags (green) are rendering');
            console.log('✅ No issues found with the Primary Benefits display');
        } else {
            console.log('❌ Issues found with Primary Benefits display');
            console.log(`   - Cards with headings: ${overallStats.cardsWithPrimaryBenefitsHeading}/${overallStats.totalCardsAnalyzed}`);
            console.log(`   - Cards with cognitive tags: ${overallStats.cardsWithCognitiveTags}/${overallStats.totalCardsAnalyzed}`);
            console.log(`   - Cards with non-cognitive tags: ${overallStats.cardsWithNonCognitiveTags}/${overallStats.totalCardsAnalyzed}`);
        }
        
        console.log('\n📸 Screenshots saved:');
        console.log('   - final-verification-full-page.png (full page)');
        console.log('   - final-verification-cards-area.png (cards area)');
        console.log('   - final-verification-first-card.png (first card detail)');
        
        return {
            isWorkingCorrectly,
            overallStats,
            cardAnalysis,
            assessment: isWorkingCorrectly ? 'SUCCESS' : 'ISSUES_FOUND'
        };
        
    } catch (error) {
        console.error('❌ Verification failed:', error);
        return { assessment: 'ERROR', error: error.message };
    } finally {
        await browser.close();
    }
}

finalVerification()
    .then(result => {
        console.log('\n🏁 Verification complete.');
        if (result.assessment === 'SUCCESS') {
            console.log('🎉 CONCLUSION: The Primary Benefits feature is working correctly!');
        } else {
            console.log('⚠️ CONCLUSION: Issues need to be addressed.');
        }
    })
    .catch(console.error);