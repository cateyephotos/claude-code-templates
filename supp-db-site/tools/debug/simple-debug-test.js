/**
 * Simple debug test to isolate the Primary Benefits issue
 * Run this in the browser console to debug step by step
 */

// Test 1: Check if data loads
console.log('=== TEST 1: Data Loading ===');
setTimeout(() => {
    const database = window.supplementDatabase || (typeof supplementDatabase !== 'undefined' ? supplementDatabase : null);
    console.log('Database available:', !!database);
    if (database) {
        console.log('Supplements count:', database.supplements?.length);
        console.log('First supplement:', database.supplements?.[0]?.name);
        console.log('Primary benefits structure:', database.supplements?.[0]?.primaryBenefits);
    }
}, 1000);

// Test 2: Check app initialization
console.log('=== TEST 2: App Initialization ===');
setTimeout(() => {
    console.log('Modern app available:', !!window.app);
    console.log('App type:', typeof window.app);
    if (window.app) {
        console.log('App supplements:', !!window.app.supplements);
        console.log('App supplements count:', window.app.supplements?.length);
    }
}, 2000);

// Test 3: Check DOM state
console.log('=== TEST 3: DOM State ===');
setTimeout(() => {
    const grid = document.getElementById('supplementGrid');
    console.log('Grid element:', !!grid);
    if (grid) {
        console.log('Grid class list:', grid.className);
        console.log('Grid has error state:', grid.classList.contains('error-state'));
        console.log('Grid inner HTML preview:', grid.innerHTML.substring(0, 200));
        console.log('Card count:', grid.querySelectorAll('[data-supplement-id]').length);
    }
}, 3000);

// Test 4: Test render function directly
console.log('=== TEST 4: Render Function Test ===');
setTimeout(() => {
    if (window.app && window.supplementDatabase) {
        try {
            const testHTML = window.app._renderBasicSupplementCard(window.supplementDatabase.supplements[0]);
            console.log('Render test successful:', !!testHTML);
            console.log('Contains Primary Benefits:', testHTML.includes('Primary Benefits:'));
            console.log('Contains blue tags:', testHTML.includes('bg-blue-100'));
            console.log('Contains green tags:', testHTML.includes('bg-green-100'));
            
            // Show a snippet of the rendered HTML
            console.log('Rendered HTML snippet:');
            const benefitsStart = testHTML.indexOf('Primary Benefits:');
            if (benefitsStart !== -1) {
                console.log(testHTML.substring(benefitsStart, benefitsStart + 300));
            }
        } catch (error) {
            console.error('Render test failed:', error);
        }
    } else {
        console.log('Cannot test render: missing app or database');
    }
}, 4000);

// Test 5: Force render test (bypass app initialization)
console.log('=== TEST 5: Force Render Test ===');
setTimeout(() => {
    const database = window.supplementDatabase || (typeof supplementDatabase !== 'undefined' ? supplementDatabase : null);
    if (database && database.supplements && database.supplements[0]) {
        const supplement = database.supplements[0];
        
        // Manual render function (copy from app.modernized.js)
        const manualRender = (supplement) => {
            const tierClass = `tier-${supplement.evidenceTier}`;
            return `
                <div class="bg-white rounded-lg shadow-md card-hover p-6 relative" data-supplement-id="${supplement.id}">
                    <div class="mb-4">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${supplement.name}</h3>
                        <p class="text-sm text-gray-600 italic mb-2">${supplement.scientificName}</p>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="text-sm font-semibold text-gray-700 mb-2">Primary Benefits:</h4>
                        <div class="flex flex-wrap gap-1 mb-2">
                            ${supplement.primaryBenefits.cognitive.slice(0, 2).map(benefit => 
                                `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${benefit}</span>`
                            ).join('')}
                        </div>
                        <div class="flex flex-wrap gap-1">
                            ${supplement.primaryBenefits.nonCognitive.slice(0, 2).map(benefit => 
                                `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${benefit}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;
        };
        
        try {
            const manualHTML = manualRender(supplement);
            console.log('Manual render successful:', !!manualHTML);
            console.log('Manual HTML contains Primary Benefits:', manualHTML.includes('Primary Benefits:'));
            console.log('Manual HTML contains blue tags:', manualHTML.includes('bg-blue-100'));
            console.log('Manual HTML contains green tags:', manualHTML.includes('bg-green-100'));
            
            // Test DOM insertion
            const testDiv = document.createElement('div');
            testDiv.innerHTML = manualHTML;
            console.log('DOM insertion test successful');
            console.log('Blue spans in test:', testDiv.querySelectorAll('.bg-blue-100').length);
            console.log('Green spans in test:', testDiv.querySelectorAll('.bg-green-100').length);
            
        } catch (error) {
            console.error('Manual render failed:', error);
        }
    }
}, 5000);

console.log('Debug tests scheduled. Check console in 5 seconds...');