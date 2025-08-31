const { chromium } = require('playwright');
const fs = require('fs');

class EnhancedCitationFixer {
    constructor() {
        this.prioritySupplements = [
            { id: 8, name: 'Melatonin', issues: 7, type: 'undefined' },
            { id: 9, name: 'L-Theanine', issues: 7, type: 'undefined' },
            { id: 89, name: 'Pterostilbene', issues: 3, type: 'undefined' },
            { id: 40, name: 'GABA', issues: 5, type: 'unknown' },
            { id: 44, name: 'Alpha-Lipoic Acid', issues: 5, type: 'unknown' },
            { id: 45, name: 'Lutein', issues: 5, type: 'unknown' }
        ];
    }

    async analyzeAndFixSupplements() {
        console.log('🔧 Starting Systematic Enhanced Citation Fixes...');
        
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            
            for (const supplement of this.prioritySupplements) {
                console.log(`\n🔍 Analyzing: ${supplement.name} (ID: ${supplement.id})`);
                console.log(`   Issues: ${supplement.issues}, Type: ${supplement.type}`);
                
                const analysis = await this.analyzeSupplementData(page, supplement);
                console.log('📊 Analysis Results:');
                console.log(JSON.stringify(analysis, null, 2));
                
                if (supplement.type === 'undefined') {
                    await this.fixUndefinedIssues(supplement, analysis);
                } else if (supplement.type === 'unknown') {
                    await this.fixUnknownIssues(supplement, analysis);
                }
            }
            
        } catch (error) {
            console.error('❌ Fix process error:', error.message);
        } finally {
            await browser.close();
        }
    }

    async analyzeSupplementData(page, supplement) {
        return await page.evaluate(async (suppId) => {
            try {
                // Get raw enhanced citation data
                const rawData = window.enhancedCitations[suppId];
                if (!rawData) {
                    return { error: 'No enhanced citation data found' };
                }

                // Load the citation data through the loader
                const citationData = await window.app.citationLoader.loadEnhancedCitations(suppId);
                if (!citationData) {
                    return { error: 'Failed to load citation data' };
                }

                const analysis = {
                    hasRawData: !!rawData,
                    hasLoadedData: !!citationData,
                    dataStructure: {},
                    sampleData: {}
                };

                // Analyze data structure
                if (citationData.citations) {
                    const citations = citationData.citations;
                    
                    analysis.dataStructure = {
                        mechanisms: {
                            count: citations.mechanisms?.length || 0,
                            format: this.detectDataFormat(citations.mechanisms)
                        },
                        benefits: {
                            count: citations.benefits?.length || 0,
                            format: this.detectDataFormat(citations.benefits)
                        },
                        safety: {
                            count: citations.safety?.length || 0,
                            format: this.detectDataFormat(citations.safety)
                        }
                    };

                    // Get sample data for analysis
                    if (citations.mechanisms && citations.mechanisms.length > 0) {
                        const firstMech = citations.mechanisms[0];
                        analysis.sampleData.mechanism = {
                            hasStudies: !!(firstMech.studies && firstMech.studies.length > 0),
                            firstStudy: firstMech.studies?.[0] || null,
                            structure: Object.keys(firstMech)
                        };
                    }

                    if (citations.benefits && citations.benefits.length > 0) {
                        const firstBenefit = citations.benefits[0];
                        analysis.sampleData.benefit = {
                            hasStudies: !!(firstBenefit.studies && firstBenefit.studies.length > 0),
                            firstStudy: firstBenefit.studies?.[0] || null,
                            structure: Object.keys(firstBenefit)
                        };
                    }
                }

                return analysis;

            } catch (error) {
                return { error: error.message, stack: error.stack };
            }
        }, supplement.id);
    }

    async fixUndefinedIssues(supplement, analysis) {
        console.log(`\n🔧 Fixing "undefined" issues for ${supplement.name}...`);
        
        // The "undefined" issues are typically caused by:
        // 1. Missing author/year fields in study data
        // 2. Incorrect data structure normalization
        // 3. Template rendering issues
        
        if (analysis.error) {
            console.log(`❌ Cannot fix - analysis error: ${analysis.error}`);
            return;
        }

        // Check if the issue is in the data structure
        const sampleStudy = analysis.sampleData?.mechanism?.firstStudy || analysis.sampleData?.benefit?.firstStudy;
        
        if (sampleStudy) {
            console.log('📋 Sample study data:', sampleStudy);
            
            // Check what fields are missing
            const missingFields = [];
            if (!sampleStudy.authors || sampleStudy.authors === 'Unknown authors') missingFields.push('authors');
            if (!sampleStudy.year || sampleStudy.year === undefined) missingFields.push('year');
            if (!sampleStudy.journal) missingFields.push('journal');
            
            if (missingFields.length > 0) {
                console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
                console.log('🔧 This supplement needs enhanced citation data completion');
                
                // Generate template for missing data
                this.generateDataTemplate(supplement, analysis);
            } else {
                console.log('✅ Study data looks complete - issue might be in normalization logic');
                console.log('🔧 This supplement needs normalization logic fix');
            }
        } else {
            console.log('❌ No sample study data found');
        }
    }

    async fixUnknownIssues(supplement, analysis) {
        console.log(`\n🔧 Fixing "unknown" issues for ${supplement.name}...`);
        
        // The "unknown" issues are typically caused by:
        // 1. Placeholder data that hasn't been replaced with real research
        // 2. Default values being used instead of actual study data
        
        if (analysis.error) {
            console.log(`❌ Cannot fix - analysis error: ${analysis.error}`);
            return;
        }

        console.log('📋 Data structure analysis:', analysis.dataStructure);
        
        // Check if this supplement has placeholder data
        const sampleStudy = analysis.sampleData?.mechanism?.firstStudy;
        if (sampleStudy) {
            console.log('📋 Sample study:', sampleStudy);
            
            if (sampleStudy.authors === 'Unknown authors' || 
                sampleStudy.title === 'Study finding' ||
                sampleStudy.journal === 'Unknown journal') {
                console.log('❌ Contains placeholder data');
                console.log('🔧 This supplement needs real research data');
                
                // Generate research template
                this.generateResearchTemplate(supplement, analysis);
            } else {
                console.log('✅ Data looks real - issue might be in rendering');
            }
        }
    }

    generateDataTemplate(supplement, analysis) {
        const template = {
            id: supplement.id,
            name: supplement.name,
            issue: 'undefined_values',
            recommendation: 'Complete missing study data fields',
            sampleData: analysis.sampleData,
            requiredFields: ['authors', 'year', 'journal', 'title', 'pmid', 'doi'],
            exampleFix: {
                authors: ['Smith, J.', 'Johnson, A.'],
                year: 2023,
                journal: 'Journal of Nutrition',
                title: 'Effects of supplement on health outcomes',
                pmid: '12345678',
                doi: '10.1000/example'
            }
        };

        const filename = `fix-template-${supplement.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
        fs.writeFileSync(filename, JSON.stringify(template, null, 2));
        console.log(`📄 Generated fix template: ${filename}`);
    }

    generateResearchTemplate(supplement, analysis) {
        const template = {
            id: supplement.id,
            name: supplement.name,
            issue: 'placeholder_data',
            recommendation: 'Replace placeholder data with real research citations',
            currentStructure: analysis.dataStructure,
            researchNeeded: {
                mechanisms: 'Research on how this supplement works at molecular level',
                benefits: 'Clinical studies showing health benefits',
                safety: 'Safety studies and adverse event data'
            },
            searchTerms: [
                `${supplement.name} mechanism of action`,
                `${supplement.name} clinical trial`,
                `${supplement.name} safety study`,
                `${supplement.name} pharmacology`
            ]
        };

        const filename = `research-template-${supplement.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
        fs.writeFileSync(filename, JSON.stringify(template, null, 2));
        console.log(`📄 Generated research template: ${filename}`);
    }

    detectDataFormat(dataArray) {
        if (!dataArray || dataArray.length === 0) return 'empty';
        
        const firstItem = dataArray[0];
        if (firstItem.studies && Array.isArray(firstItem.studies)) {
            return 'grouped_with_studies';
        } else if (firstItem.title || firstItem.claim) {
            return 'direct_claims';
        } else if (firstItem.authors || firstItem.year) {
            return 'direct_studies';
        } else {
            return 'unknown_format';
        }
    }
}

// Run the analysis and fix process
(async () => {
    const fixer = new EnhancedCitationFixer();
    await fixer.analyzeAndFixSupplements();
})();
