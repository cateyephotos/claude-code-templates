/**
 * Quick Enhanced Citations Check
 * Simple verification of enhanced citations integration
 * Generated: 2025-08-20
 */

const fs = require('fs');
const path = require('path');

function quickCheck() {
    console.log('🔍 QUICK ENHANCED CITATIONS CHECK');
    console.log('================================\n');

    const results = {
        enhancedFiles: [],
        databaseFlags: [],
        issues: []
    };

    // 1. Check enhanced citation files
    console.log('1. Checking enhanced citation files...');
    const enhancedDir = path.join(__dirname, 'data', 'enhanced_citations');
    
    if (fs.existsSync(enhancedDir)) {
        const files = fs.readdirSync(enhancedDir).filter(f => f.endsWith('.js'));
        console.log(`   Found ${files.length} enhanced citation files`);
        
        const targetFiles = [
            '21_vitamin_b12_enhanced.js',
            '22_vitamin_b6_enhanced.js', 
            '34_enhanced.js',
            '37_zinc_enhanced.js',
            '38_iron_enhanced.js',
            '40_enhanced.js',
            '41_inositol_enhanced.js',
            '43_choline_enhanced.js',
            '44_enhanced.js',
            '45_enhanced.js'
        ];

        const foundTargetFiles = targetFiles.filter(tf => files.includes(tf));
        console.log(`   Target files found: ${foundTargetFiles.length}/10`);
        
        foundTargetFiles.forEach(file => {
            console.log(`   ✅ ${file}`);
        });

        results.enhancedFiles = foundTargetFiles;
    } else {
        console.log('   ❌ Enhanced citations directory not found');
        results.issues.push('Enhanced citations directory missing');
    }

    // 2. Check supplements.js for enhanced flags
    console.log('\n2. Checking supplements database...');
    const supplementsPath = path.join(__dirname, 'data', 'supplements.js');
    
    if (fs.existsSync(supplementsPath)) {
        const content = fs.readFileSync(supplementsPath, 'utf8');
        
        // Count isEnhanced flags
        const enhancedMatches = content.match(/\"isEnhanced\":\s*true/g);
        const enhancedCount = enhancedMatches ? enhancedMatches.length : 0;
        console.log(`   Found ${enhancedCount} supplements with isEnhanced: true`);

        // Check specific target supplements
        const targetSupplements = [
            { id: 21, name: 'Vitamin B12' },
            { id: 22, name: 'Vitamin B6' },
            { id: 34, name: '5-HTP' },
            { id: 37, name: 'Zinc' },
            { id: 38, name: 'Iron' },
            { id: 40, name: 'GABA' },
            { id: 41, name: 'Inositol' },
            { id: 43, name: 'Choline' },
            { id: 44, name: 'Alpha-Lipoic Acid' },
            { id: 45, name: 'Lutein' }
        ];

        let targetEnhancedCount = 0;
        targetSupplements.forEach(supplement => {
            // Look for the supplement ID pattern with enhanced flag
            const pattern = new RegExp(`"id":\\s*${supplement.id}[\\s\\S]*?"isEnhanced":\\s*true`, 'i');
            if (pattern.test(content)) {
                console.log(`   ✅ ${supplement.name} (ID: ${supplement.id}) - enhanced`);
                targetEnhancedCount++;
                results.databaseFlags.push(supplement.name);
            } else {
                console.log(`   ❌ ${supplement.name} (ID: ${supplement.id}) - not enhanced`);
                results.issues.push(`${supplement.name} missing enhanced flag`);
            }
        });

        console.log(`   Target supplements enhanced: ${targetEnhancedCount}/10`);
        
    } else {
        console.log('   ❌ supplements.js not found');
        results.issues.push('supplements.js not found');
    }

    // 3. Check if HTML includes enhanced citation scripts
    console.log('\n3. Checking HTML integration...');
    const htmlPath = path.join(__dirname, 'index.html');
    
    if (fs.existsSync(htmlPath)) {
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        const hasCitationLoader = htmlContent.includes('CitationLoader.js');
        const hasCitationRenderer = htmlContent.includes('CitationRenderer.js');
        const hasEnhancedStyles = htmlContent.includes('enhanced-citation-card');
        
        console.log(`   CitationLoader.js included: ${hasCitationLoader ? '✅' : '❌'}`);
        console.log(`   CitationRenderer.js included: ${hasCitationRenderer ? '✅' : '❌'}`);
        console.log(`   Enhanced citation styles: ${hasEnhancedStyles ? '✅' : '❌'}`);
        
        if (!hasCitationLoader) results.issues.push('CitationLoader.js not included in HTML');
        if (!hasCitationRenderer) results.issues.push('CitationRenderer.js not included in HTML');
        if (!hasEnhancedStyles) results.issues.push('Enhanced citation styles missing');
        
    } else {
        console.log('   ❌ index.html not found');
        results.issues.push('index.html not found');
    }

    // 4. Check specific enhanced citation files content
    console.log('\n4. Validating specific enhanced citation files...');
    
    const testFiles = [
        '21_vitamin_b12_enhanced.js',
        '37_zinc_enhanced.js',
        '43_choline_enhanced.js'
    ];

    testFiles.forEach(fileName => {
        const filePath = path.join(__dirname, 'data', 'enhanced_citations', fileName);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            const hasWindowAssignment = content.includes('window.enhancedCitations');
            const hasCitations = content.includes('"citations":');
            const hasEvidenceProfile = content.includes('"evidenceProfile":');
            const hasQualityAssurance = content.includes('"qualityAssurance":');
            
            console.log(`   ${fileName}:`);
            console.log(`     Window assignment: ${hasWindowAssignment ? '✅' : '❌'}`);
            console.log(`     Citations: ${hasCitations ? '✅' : '❌'}`);
            console.log(`     Evidence profile: ${hasEvidenceProfile ? '✅' : '❌'}`);
            console.log(`     Quality assurance: ${hasQualityAssurance ? '✅' : '❌'}`);
            
            if (!hasWindowAssignment) results.issues.push(`${fileName}: Missing window assignment`);
            if (!hasCitations) results.issues.push(`${fileName}: Missing citations`);
        } else {
            console.log(`   ❌ ${fileName} not found`);
            results.issues.push(`${fileName} not found`);
        }
    });

    // Summary
    console.log('\n🎯 QUICK CHECK SUMMARY');
    console.log('====================');
    
    const integrationScore = ((results.enhancedFiles.length + results.databaseFlags.length) / 20 * 100).toFixed(1);
    console.log(`Integration Score: ${integrationScore}%`);
    console.log(`Enhanced Files: ${results.enhancedFiles.length}/10`);
    console.log(`Database Flags: ${results.databaseFlags.length}/10`);
    console.log(`Issues Found: ${results.issues.length}`);
    
    if (results.issues.length === 0) {
        console.log('\n✅ SUCCESS: Enhanced citations integration appears to be working correctly!');
    } else if (results.issues.length <= 5) {
        console.log('\n⚠️  WARNING: Minor issues found, but integration is mostly functional.');
        console.log('\nIssues:');
        results.issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
        console.log('\n❌ CRITICAL: Multiple issues found requiring attention.');
        console.log('\nIssues:');
        results.issues.forEach(issue => console.log(`  - ${issue}`));
    }

    // Next steps
    console.log('\n📋 NEXT STEPS:');
    if (results.enhancedFiles.length === 10 && results.databaseFlags.length === 10) {
        console.log('1. ✅ Enhanced citations integration is complete');
        console.log('2. 🚀 Test front-end functionality at http://localhost:8001');
        console.log('3. 📊 Monitor citation loading performance');
    } else {
        console.log('1. 🔧 Complete missing enhanced citation files');
        console.log('2. 🔄 Add isEnhanced flags to remaining supplements');
        console.log('3. 🧪 Re-run validation after fixes');
    }

    return results;
}

// Run the check
if (require.main === module) {
    quickCheck();
}

module.exports = quickCheck;