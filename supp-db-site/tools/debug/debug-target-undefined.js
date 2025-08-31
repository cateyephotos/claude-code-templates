const puppeteer = require('playwright');

async function debugTargetUndefined() {
    const browser = await puppeteer.chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
        if (msg.text().includes('undefined') || msg.text().includes('Target')) {
            console.log(`🔍 CONSOLE ${msg.type().toUpperCase()}: ${msg.text()}`);
        }
    });
    
    // Capture errors
    page.on('pageerror', err => {
        console.log(`❌ PAGE ERROR: ${err.message}`);
    });
    
    try {
        console.log('🌐 Navigating to http://localhost:1285...');
        await page.goto('http://localhost:1285', { waitUntil: 'networkidle' });
        
        // Wait for app to initialize
        await page.waitForTimeout(3000);
        
        console.log('\n📋 Checking for "Target undefined" issues...');
        
        // Check for undefined in enhanced citations
        const enhancedCitationsCheck = await page.evaluate(() => {
            const issues = [];
            
            if (window.enhancedCitations) {
                for (const [id, data] of Object.entries(window.enhancedCitations)) {
                    if (data && data.citations) {
                        ['mechanisms', 'benefits', 'safety', 'dosage'].forEach(category => {
                            if (data.citations[category]) {
                                data.citations[category].forEach((citation, index) => {
                                    if (citation.target === undefined || citation.target === 'undefined') {
                                        issues.push({
                                            supplementId: id,
                                            category: category,
                                            citationIndex: index,
                                            issue: 'target is undefined',
                                            citation: citation
                                        });
                                    }
                                    if (citation.tissueTarget === undefined || citation.tissueTarget === 'undefined') {
                                        issues.push({
                                            supplementId: id,
                                            category: category,
                                            citationIndex: index,
                                            issue: 'tissueTarget is undefined',
                                            citation: citation
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
            
            return issues;
        });
        
        console.log(`\n🔍 Found ${enhancedCitationsCheck.length} undefined target issues:`);
        enhancedCitationsCheck.forEach((issue, index) => {
            console.log(`\n${index + 1}. Supplement ID: ${issue.supplementId}`);
            console.log(`   Category: ${issue.category}`);
            console.log(`   Citation Index: ${issue.citationIndex}`);
            console.log(`   Issue: ${issue.issue}`);
            console.log(`   Citation: ${JSON.stringify(issue.citation, null, 2)}`);
        });
        
        // Check if any cards are showing "Target undefined"
        const cardIssues = await page.evaluate(() => {
            const cards = document.querySelectorAll('.supplement-card');
            const issues = [];
            
            cards.forEach((card, index) => {
                const text = card.innerText || card.textContent;
                if (text.includes('Target undefined') || text.includes('undefined')) {
                    issues.push({
                        cardIndex: index,
                        supplementName: card.querySelector('h3')?.textContent || 'Unknown',
                        text: text.substring(0, 200) + '...'
                    });
                }
            });
            
            return issues;
        });
        
        console.log(`\n🔍 Found ${cardIssues.length} cards with "undefined" text:`);
        cardIssues.forEach((issue, index) => {
            console.log(`\n${index + 1}. Card: ${issue.supplementName}`);
            console.log(`   Text excerpt: ${issue.text}`);
        });
        
        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            consoleMessages: consoleMessages,
            enhancedCitationIssues: enhancedCitationsCheck,
            cardTextIssues: cardIssues
        };
        
        console.log(`\n📊 Saving detailed report to debug-target-undefined-report.json`);
        return report;
        
    } catch (error) {
        console.error('❌ Error during debugging:', error);
        return { error: error.message };
    } finally {
        await browser.close();
    }
}

// Run the debug function
debugTargetUndefined().then(report => {
    const fs = require('fs');
    fs.writeFileSync('debug-target-undefined-report.json', JSON.stringify(report, null, 2));
    console.log('\n✅ Debug complete! Check debug-target-undefined-report.json for full details.');
}).catch(console.error);