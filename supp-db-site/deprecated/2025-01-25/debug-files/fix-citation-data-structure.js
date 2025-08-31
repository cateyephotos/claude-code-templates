/**
 * Fix Citation Data Structure Mismatch
 * Converts all enhanced citation files to the expected frontend format
 */

const fs = require('fs');
const path = require('path');

function fixCitationDataStructure() {
    const enhancedDir = './data/enhanced_citations';
    const files = fs.readdirSync(enhancedDir).filter(file => file.endsWith('.js'));
    
    console.log(`🔧 Fixing citation data structure for ${files.length} files...`);
    
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    const issues = [];
    
    files.forEach(file => {
        const filePath = path.join(enhancedDir, file);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;
            
            // Check if this file uses the old format (direct mechanisms/benefits/safety arrays)
            // vs the new format (nested under citations object)
            
            // Pattern 1: Direct mechanisms array (OLD FORMAT)
            if (content.includes('"mechanisms": [') && !content.includes('"citations": {')) {
                console.log(`🔧 Converting ${file} from Format A to Format B...`);
                
                // Extract the direct arrays
                const mechanismsMatch = content.match(/"mechanisms":\s*\[([\s\S]*?)\]/);
                const benefitsMatch = content.match(/"benefits":\s*\[([\s\S]*?)\]/);
                const safetyMatch = content.match(/"safety":\s*\[([\s\S]*?)\]/);
                const dosageMatch = content.match(/"dosage":\s*\[([\s\S]*?)\]/);
                
                if (mechanismsMatch || benefitsMatch || safetyMatch) {
                    // Create the new citations structure
                    let citationsObject = '  "citations": {\n';
                    
                    if (mechanismsMatch) {
                        citationsObject += `    "mechanisms": [${mechanismsMatch[1]}],\n`;
                        content = content.replace(mechanismsMatch[0], '');
                    }
                    
                    if (benefitsMatch) {
                        citationsObject += `    "benefits": [${benefitsMatch[1]}],\n`;
                        content = content.replace(benefitsMatch[0], '');
                    }
                    
                    if (safetyMatch) {
                        citationsObject += `    "safety": [${safetyMatch[1]}],\n`;
                        content = content.replace(safetyMatch[0], '');
                    }
                    
                    if (dosageMatch) {
                        citationsObject += `    "dosage": [${dosageMatch[1]}],\n`;
                        content = content.replace(dosageMatch[0], '');
                    }
                    
                    citationsObject += '  },\n';
                    
                    // Insert the citations object after evidenceProfile
                    const evidenceProfileEnd = content.indexOf('},', content.indexOf('"evidenceProfile"'));
                    if (evidenceProfileEnd !== -1) {
                        const insertPoint = evidenceProfileEnd + 2;
                        content = content.slice(0, insertPoint) + '\n\n' + citationsObject + content.slice(insertPoint);
                        hasChanges = true;
                    }
                }
            }
            
            // Pattern 2: Check for missing citations wrapper but has mechanisms/benefits
            else if (content.includes('"mechanisms": [') && content.includes('"citations": {')) {
                // This might be a mixed format - check if mechanisms is inside citations
                const citationsStart = content.indexOf('"citations": {');
                const mechanismsIndex = content.indexOf('"mechanisms": [');
                
                if (mechanismsIndex < citationsStart) {
                    console.log(`🔧 Fixing mixed format in ${file}...`);
                    // Mechanisms is outside citations block - need to move it inside
                    // This is more complex, so we'll flag it for manual review
                    issues.push({
                        file: file,
                        issue: 'Mixed format detected - mechanisms outside citations block',
                        needsManualReview: true
                    });
                }
            }
            
            // Pattern 3: Check for completely missing citations structure
            else if (!content.includes('"citations": {') && (content.includes('Enhanced') || content.includes('enhanced'))) {
                console.log(`⚠️ ${file} appears to be enhanced but missing citations structure`);
                issues.push({
                    file: file,
                    issue: 'Missing citations structure entirely',
                    needsManualReview: true
                });
            }
            
            // Clean up any double commas or formatting issues
            if (hasChanges) {
                content = content.replace(/,\s*,/g, ',');
                content = content.replace(/,(\s*})/g, '$1');
                
                fs.writeFileSync(filePath, content);
                fixedCount++;
                console.log(`✅ Fixed ${file}`);
            } else {
                alreadyCorrectCount++;
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
            issues.push({
                file: file,
                issue: `Processing error: ${error.message}`,
                needsManualReview: true
            });
        }
    });
    
    // Generate report
    const report = {
        timestamp: new Date().toISOString(),
        totalFiles: files.length,
        fixedFiles: fixedCount,
        alreadyCorrect: alreadyCorrectCount,
        issuesFound: issues.length,
        issues: issues,
        summary: {
            successRate: `${Math.round(((fixedCount + alreadyCorrectCount) / files.length) * 100)}%`,
            needsManualReview: issues.filter(i => i.needsManualReview).length
        }
    };
    
    fs.writeFileSync('citation-structure-fix-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📋 CITATION STRUCTURE FIX SUMMARY:');
    console.log(`Total Files: ${files.length}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Already Correct: ${alreadyCorrectCount}`);
    console.log(`Issues Found: ${issues.length}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    
    if (issues.length > 0) {
        console.log('\n⚠️ FILES NEEDING MANUAL REVIEW:');
        issues.forEach(issue => {
            console.log(`  - ${issue.file}: ${issue.issue}`);
        });
    }
    
    console.log('\n📄 Detailed report saved to: citation-structure-fix-report.json');
    
    return report;
}

// Run the fix
if (require.main === module) {
    fixCitationDataStructure()
        .then ? fixCitationDataStructure().then(report => {
            console.log('\n🎯 Citation structure fix completed');
        }).catch(error => {
            console.error('💥 Fix failed:', error);
            process.exit(1);
        }) : (() => {
            const report = fixCitationDataStructure();
            console.log('\n🎯 Citation structure fix completed');
        })();
}

module.exports = { fixCitationDataStructure };
