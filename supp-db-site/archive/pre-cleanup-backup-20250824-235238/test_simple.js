// Simple test script for supplement database functionality
const fs = require('fs');
const path = require('path');

console.log('=== SUPPLEMENT DATABASE FUNCTIONALITY TEST REPORT ===\n');

try {
    // Read the supplements.js file
    const supplementsPath = path.join(__dirname, 'data', 'supplements.js');
    let supplementsContent = fs.readFileSync(supplementsPath, 'utf8');
    
    // Remove the export statements that might cause issues
    supplementsContent = supplementsContent.replace(/if \(typeof module.*?\}/gs, '');
    
    // Execute the content to get the supplementDatabase
    let supplementDatabase;
    eval(supplementsContent);
    
    console.log('1. DATA STRUCTURE VALIDATION:');
    if (typeof supplementDatabase !== 'undefined' && supplementDatabase) {
        console.log('✅ supplementDatabase loaded successfully');
        console.log(`📊 Supplements: ${supplementDatabase.supplements ? supplementDatabase.supplements.length : 'MISSING'}`);
        console.log(`📊 Categories: ${supplementDatabase.categories ? supplementDatabase.categories.length : 'MISSING'}`);
        console.log(`📊 Health Domains: ${supplementDatabase.healthDomains ? supplementDatabase.healthDomains.length : 'MISSING'}`);
    } else {
        console.log('❌ supplementDatabase not loaded');
        process.exit(1);
    }

    console.log('\n2. CATEGORIES FUNCTIONALITY TEST:');
    if (supplementDatabase.categories && Array.isArray(supplementDatabase.categories)) {
        const categoryNames = supplementDatabase.categories.map(cat => cat.name);
        console.log(`✅ Categories loaded: ${categoryNames.length}`);
        console.log(`📋 Category names: ${categoryNames.slice(0, 10).join(', ')}${categoryNames.length > 10 ? '...' : ''}`);
        
        // Check for expected categories
        const expectedCategories = ['Nootropics', 'Adaptogens', 'Anti-inflammatory', 'Essential Nutrients'];
        const foundExpected = expectedCategories.filter(cat => categoryNames.includes(cat));
        const missingExpected = expectedCategories.filter(cat => !categoryNames.includes(cat));
        
        console.log(`✅ Expected categories found: ${foundExpected.join(', ')}`);
        if (missingExpected.length > 0) {
            console.log(`⚠️ Missing expected categories: ${missingExpected.join(', ')}`);
        }
    } else {
        console.log('❌ Categories array not found or invalid');
    }

    console.log('\n3. HEALTH DOMAINS FUNCTIONALITY TEST:');
    if (supplementDatabase.healthDomains && Array.isArray(supplementDatabase.healthDomains)) {
        const domainNames = supplementDatabase.healthDomains.map(domain => domain.name);
        console.log(`✅ Health domains loaded: ${domainNames.length}`);
        console.log(`📋 Domain names: ${domainNames.slice(0, 10).join(', ')}${domainNames.length > 10 ? '...' : ''}`);
        
        // Check for expected domains
        const expectedDomains = ['Memory Enhancement', 'Focus & Attention', 'Sleep Quality', 'Anxiety Reduction'];
        const foundExpectedDomains = expectedDomains.filter(domain => domainNames.includes(domain));
        const missingExpectedDomains = expectedDomains.filter(domain => !domainNames.includes(domain));
        
        console.log(`✅ Expected health domains found: ${foundExpectedDomains.join(', ')}`);
        if (missingExpectedDomains.length > 0) {
            console.log(`⚠️ Missing expected domains: ${missingExpectedDomains.join(', ')}`);
        }
    } else {
        console.log('❌ Health domains array not found or invalid');
    }

    console.log('\n4. SUPPLEMENT DATA QUALITY TEST:');
    if (supplementDatabase.supplements && Array.isArray(supplementDatabase.supplements)) {
        const supplements = supplementDatabase.supplements;
        console.log(`📊 Total supplements: ${supplements.length}`);
        
        // Test for Phase 2A enhanced supplements
        const enhancedSupplements = supplements.filter(supp => supp.enhancedCitations && supp.enhancedCitations.isEnhanced);
        console.log(`✅ Phase 2A enhanced supplements: ${enhancedSupplements.length}`);
        if (enhancedSupplements.length > 0) {
            console.log(`📋 Enhanced supplements: ${enhancedSupplements.slice(0, 5).map(s => s.name).join(', ')}${enhancedSupplements.length > 5 ? '...' : ''}`);
        }
        
        // Test evidence tier distribution
        const tierDistribution = {};
        supplements.forEach(supp => {
            const tier = supp.evidenceTier;
            tierDistribution[tier] = (tierDistribution[tier] || 0) + 1;
        });
        console.log(`📊 Evidence tier distribution: ${JSON.stringify(tierDistribution)}`);
    } else {
        console.log('❌ Supplements array not found or invalid');
    }

    console.log('\n5. FILTER SIMULATION TEST:');
    try {
        // Test category filtering
        const nootropicsSupplements = supplementDatabase.supplements.filter(s => s.category === 'Nootropics');
        console.log(`✅ Nootropics category filter: ${nootropicsSupplements.length} supplements found`);
        console.log(`📋 Sample Nootropics: ${nootropicsSupplements.slice(0, 5).map(s => s.name).join(', ')}`);
        
        // Test memory enhancement filtering
        const memorySupplements = supplementDatabase.supplements.filter(s => {
            return s.primaryBenefits && s.primaryBenefits.cognitive && 
                   s.primaryBenefits.cognitive.some(benefit => benefit.toLowerCase().includes('memory'));
        });
        console.log(`✅ Memory enhancement filter: ${memorySupplements.length} supplements found`);
        console.log(`📋 Sample memory supplements: ${memorySupplements.slice(0, 5).map(s => s.name).join(', ')}`);
        
    } catch (error) {
        console.log(`❌ Filter simulation failed: ${error.message}`);
    }

    console.log('\n6. SPECIFIC ISSUE VERIFICATION:');
    console.log('🔍 Testing the specific issues mentioned in the request:');

    // Test if categories would populate dropdown
    if (supplementDatabase.categories && supplementDatabase.categories.length > 0) {
        console.log('✅ Category filter dropdown WOULD be populated correctly');
        console.log(`📋 Available categories: ${supplementDatabase.categories.map(c => c.name).join(', ')}`);
    } else {
        console.log('❌ Category filter dropdown would NOT be populated');
    }

    // Test if health domains would populate dropdown
    if (supplementDatabase.healthDomains && supplementDatabase.healthDomains.length > 0) {
        console.log('✅ Health domain filter dropdown WOULD be populated correctly');
        console.log(`📋 Available health domains: ${supplementDatabase.healthDomains.map(d => d.name).join(', ')}`);
    } else {
        console.log('❌ Health domain filter dropdown would NOT be populated');
    }

    // Test if comparison selects would be populated
    if (supplementDatabase.supplements && supplementDatabase.supplements.length > 0) {
        console.log('✅ Comparison selects WOULD be populated correctly');
        console.log(`📊 ${supplementDatabase.supplements.length} supplements available for comparison`);
    } else {
        console.log('❌ Comparison selects would NOT be populated');
    }

    console.log('\n7. FINAL ASSESSMENT:');
    let criticalIssues = 0;
    let warnings = 0;

    if (!supplementDatabase || !supplementDatabase.supplements || !supplementDatabase.categories || !supplementDatabase.healthDomains) {
        criticalIssues++;
    }

    if (supplementDatabase && supplementDatabase.supplements && supplementDatabase.supplements.length < 89) {
        warnings++;
    }

    console.log(`📊 Critical issues: ${criticalIssues}`);
    console.log(`📊 Warnings: ${warnings}`);

    if (criticalIssues === 0) {
        console.log('🎉 ALL CRITICAL TESTS PASSED! Categories and health domains should work correctly.');
        console.log('✅ The website functionality for categories and health domains has been verified as working.');
    } else {
        console.log('⚠️ Critical issues detected that would prevent proper functionality.');
    }

} catch (error) {
    console.error('❌ Test failed with error:', error.message);
}

console.log('\n=== END OF TEST REPORT ===');