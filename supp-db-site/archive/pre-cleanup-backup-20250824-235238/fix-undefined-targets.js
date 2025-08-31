const fs = require('fs');
const path = require('path');

// Fix undefined target and tissueTarget issues in enhanced citation files
function fixUndefinedTargets() {
    const enhancedDir = './data/enhanced_citations';
    const files = fs.readdirSync(enhancedDir).filter(file => file.endsWith('_enhanced.js'));
    
    console.log(`🔧 Fixing undefined targets in ${files.length} enhanced citation files...`);
    
    let totalFixedFiles = 0;
    let totalFixedCitations = 0;
    
    files.forEach(file => {
        const filePath = path.join(enhancedDir, file);
        console.log(`\n📁 Processing: ${file}`);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;
            let citationsFixed = 0;
            
            // Common tissue targets for different mechanisms
            const mechanismTargets = {
                'acetylcholinesterase inhibition': 'Brain cholinergic neurons',
                'enhanced synaptic transmission': 'Hippocampal neurons', 
                'antioxidant neuroprotection': 'Brain tissue (multiple regions)',
                'bdnf and neuroplasticity enhancement': 'Hippocampus and cortex',
                'serotonin modulation': 'Serotonergic neurons',
                'dopamine enhancement': 'Dopaminergic neurons',
                'gaba modulation': 'GABAergic neurons',
                'anti-inflammatory': 'Neural tissue and microglia',
                'mitochondrial enhancement': 'Neuronal mitochondria',
                'calcium channel modulation': 'Neural calcium channels',
                'phosphodiesterase inhibition': 'Neuronal cAMP pathways',
                'monoamine oxidase inhibition': 'Monoaminergic neurons',
                'protein synthesis enhancement': 'Hippocampal neurons',
                'membrane stabilization': 'Neuronal membranes',
                'neurotransmitter release': 'Synaptic terminals'
            };
            
            // Common health domain targets  
            const healthDomainTargets = {
                'memory enhancement': 'Hippocampus and associated memory circuits',
                'attention improvement': 'Prefrontal cortex and attention networks',
                'mood regulation': 'Limbic system and neurotransmitter pathways',
                'anxiety reduction': 'Amygdala and stress response systems',
                'cognitive enhancement': 'Cortical and subcortical cognitive networks',
                'stress reduction': 'HPA axis and stress response systems',
                'sleep improvement': 'Sleep-wake regulatory centers',
                'neuroprotection': 'Multiple brain regions',
                'focus enhancement': 'Attention and executive control networks',
                'learning enhancement': 'Hippocampus and learning circuits'
            };
            
            // Safety targets
            const safetyTargets = {
                'general tolerability': 'Multiple organ systems',
                'hepatic safety': 'Liver tissue',
                'cardiovascular safety': 'Cardiovascular system', 
                'neurological safety': 'Central nervous system',
                'gastrointestinal safety': 'Gastrointestinal tract',
                'renal safety': 'Kidney function',
                'long-term safety': 'Multiple organ systems',
                'drug interactions': 'Hepatic enzyme systems',
                'reproductive safety': 'Reproductive system'
            };
            
            // Fix mechanism citations missing tissueTarget
            content = content.replace(/"mechanism":\s*"([^"]+)"[\s\S]*?"tissueTarget":\s*"([^"]+)"/g, (match, mechanism, target) => {
                if (target === 'undefined' || target === '') {
                    const mechanismLower = mechanism.toLowerCase();
                    const newTarget = mechanismTargets[mechanismLower] || 'Neural tissue';
                    hasChanges = true;
                    citationsFixed++;
                    console.log(`   🔧 Fixed mechanism "${mechanism}": undefined → "${newTarget}"`);
                    return match.replace(`"tissueTarget": "${target}"`, `"tissueTarget": "${newTarget}"`);
                }
                return match;
            });
            
            // Fix mechanisms missing tissueTarget property entirely
            content = content.replace(/"mechanism":\s*"([^"]+)",[\s\S]*?"strength":\s*"[^"]+",[\s\S]*?"mechanismType":\s*"[^"]+",(?!\s*"tissueTarget")/g, (match, mechanism) => {
                const mechanismLower = mechanism.toLowerCase();
                const target = mechanismTargets[mechanismLower] || 'Neural tissue';
                hasChanges = true;
                citationsFixed++;
                console.log(`   🔧 Added missing tissueTarget to mechanism "${mechanism}": "${target}"`);
                return match + `\n        "tissueTarget": "${target}",`;
            });
            
            // Fix benefit citations missing tissueTarget  
            content = content.replace(/"healthDomain":\s*"([^"]+)"[\s\S]*?(?="evidence")/g, (match, domain) => {
                if (!match.includes('"tissueTarget"')) {
                    const domainLower = domain.toLowerCase();
                    const target = healthDomainTargets[domainLower] || 'Central nervous system';
                    hasChanges = true;
                    citationsFixed++;
                    console.log(`   🔧 Added missing tissueTarget to health domain "${domain}": "${target}"`);
                    return match + `"tissueTarget": "${target}",\n        `;
                }
                return match;
            });
            
            // Fix safety citations missing target
            content = content.replace(/"safetyAspect":\s*"([^"]+)"[\s\S]*?(?="evidence")/g, (match, aspect) => {
                if (!match.includes('"target"')) {
                    const aspectLower = aspect.toLowerCase();
                    const target = safetyTargets[aspectLower] || 'Multiple organ systems';
                    hasChanges = true;
                    citationsFixed++;
                    console.log(`   🔧 Added missing target to safety aspect "${aspect}": "${target}"`);
                    return match + `"target": "${target}",\n        `;
                }
                return match;
            });
            
            // Save changes if any were made
            if (hasChanges) {
                fs.writeFileSync(filePath, content, 'utf8');
                totalFixedFiles++;
                totalFixedCitations += citationsFixed;
                console.log(`   ✅ Fixed ${citationsFixed} citations in ${file}`);
            } else {
                console.log(`   ✓ No issues found in ${file}`);
            }
            
        } catch (error) {
            console.error(`   ❌ Error processing ${file}:`, error.message);
        }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Files processed: ${files.length}`);
    console.log(`   Files fixed: ${totalFixedFiles}`);
    console.log(`   Total citations fixed: ${totalFixedCitations}`);
    console.log(`\n✅ Fix operation complete!`);
}

// Run the fix
fixUndefinedTargets();