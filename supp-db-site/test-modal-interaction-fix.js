const { chromium } = require('playwright');

async function testModalInteractionFix() {
    console.log('🔍 MODAL INTERACTION DEBUGGING');
    console.log('==============================');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Listen for console messages and errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`🖥️  CONSOLE ERROR: ${msg.text()}`);
        }
    });
    
    page.on('pageerror', error => {
        console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    try {
        // Navigate to the site
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        
        console.log('🔍 CHECKING GLOBAL APP OBJECT...');
        
        // Check if app object exists and has the right methods
        const appStatus = await page.evaluate(() => {
            return {
                appExists: typeof window.app !== 'undefined',
                appType: typeof window.app,
                hasShowSupplementDetails: typeof window.app?.showSupplementDetails === 'function',
                appMethods: window.app ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.app)).filter(name => typeof window.app[name] === 'function') : [],
                appProperties: window.app ? Object.keys(window.app) : []
            };
        });
        
        console.log(`   App exists: ${appStatus.appExists}`);
        console.log(`   App type: ${appStatus.appType}`);
        console.log(`   Has showSupplementDetails: ${appStatus.hasShowSupplementDetails}`);
        console.log(`   App methods: ${appStatus.appMethods.slice(0, 10).join(', ')}${appStatus.appMethods.length > 10 ? '...' : ''}`);
        
        if (!appStatus.appExists) {
            console.log('❌ CRITICAL: window.app object not found!');
            return;
        }
        
        if (!appStatus.hasShowSupplementDetails) {
            console.log('❌ CRITICAL: showSupplementDetails method not found!');
            return;
        }
        
        console.log('\n🔍 TESTING BUTTON CLICK...');
        
        // Find the first View Details button
        const buttonTest = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button[onclick*="showSupplementDetails"]');
            return {
                buttonCount: buttons.length,
                firstButtonExists: buttons.length > 0,
                firstButtonOnclick: buttons[0]?.getAttribute('onclick') || 'No onclick found',
                firstButtonText: buttons[0]?.textContent || 'No button found'
            };
        });
        
        console.log(`   View Details buttons found: ${buttonTest.buttonCount}`);
        console.log(`   First button onclick: ${buttonTest.firstButtonOnclick}`);
        console.log(`   First button text: ${buttonTest.firstButtonText}`);
        
        if (buttonTest.buttonCount === 0) {
            console.log('❌ No View Details buttons found!');
            return;
        }
        
        // Try clicking the button
        console.log('\n🖱️  CLICKING VIEW DETAILS BUTTON...');
        
        try {
            // Click using the button selector
            await page.click('button[onclick*="showSupplementDetails"]');
            await page.waitForTimeout(2000);
            
            // Check modal status
            const modalStatus = await page.evaluate(() => {
                const modal = document.getElementById('supplementModal');
                return {
                    modalExists: !!modal,
                    modalHidden: modal?.classList.contains('hidden'),
                    modalClasses: modal?.className || 'Modal not found',
                    modalContent: modal?.textContent?.substring(0, 100) || 'No content'
                };
            });
            
            console.log(`   Modal exists: ${modalStatus.modalExists}`);
            console.log(`   Modal hidden: ${modalStatus.modalHidden}`);
            console.log(`   Modal classes: ${modalStatus.modalClasses}`);
            
            if (modalStatus.modalExists && !modalStatus.modalHidden) {
                console.log('✅ SUCCESS: Modal opened correctly!');
                console.log(`   Modal content preview: ${modalStatus.modalContent}...`);
                
                // Test closing modal
                await page.keyboard.press('Escape');
                await page.waitForTimeout(1000);
                
                const modalClosed = await page.evaluate(() => {
                    const modal = document.getElementById('supplementModal');
                    return modal?.classList.contains('hidden');
                });
                
                console.log(`   Modal closed with ESC: ${modalClosed}`);
                
            } else {
                console.log('❌ FAILED: Modal did not open');
                
                // Try manual function call
                console.log('\n🔧 TRYING MANUAL FUNCTION CALL...');
                
                const manualTest = await page.evaluate(() => {
                    try {
                        window.app.showSupplementDetails(1); // Try with ID 1
                        return { success: true, error: null };
                    } catch (error) {
                        return { success: false, error: error.message };
                    }
                });
                
                if (manualTest.success) {
                    console.log('✅ Manual function call worked!');
                    
                    const modalStatusAfterManual = await page.evaluate(() => {
                        const modal = document.getElementById('supplementModal');
                        return {
                            modalHidden: modal?.classList.contains('hidden'),
                            modalClasses: modal?.className || 'Modal not found'
                        };
                    });
                    
                    console.log(`   Modal hidden after manual call: ${modalStatusAfterManual.modalHidden}`);
                    
                } else {
                    console.log(`❌ Manual function call failed: ${manualTest.error}`);
                }
            }
            
        } catch (clickError) {
            console.log(`❌ Error clicking button: ${clickError.message}`);
        }
        
        // Final diagnosis
        console.log('\n🏥 DIAGNOSIS:');
        if (appStatus.appExists && appStatus.hasShowSupplementDetails) {
            if (buttonTest.buttonCount > 0) {
                console.log('   ✅ App object exists with correct methods');
                console.log('   ✅ View Details buttons exist');
                console.log('   🔍 Issue likely in onclick handler or modal display logic');
            } else {
                console.log('   ❌ No View Details buttons found in DOM');
            }
        } else {
            console.log('   ❌ App object or methods missing');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
testModalInteractionFix()
    .then(() => {
        console.log('\n🎉 Modal interaction debugging completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Debugging failed:', error);
        process.exit(1);
    });
