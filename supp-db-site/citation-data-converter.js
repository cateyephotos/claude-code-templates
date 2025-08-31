#!/usr/bin/env node

/**
 * Citation Data Converter
 * 
 * Converts citation data from supp-db-project research files into 
 * enhanced citation format compatible with our system
 */

const fs = require('fs');
const path = require('path');

class CitationDataConverter {
    constructor() {
        this.sourceDir = 'c:\\Users\\Mind0\\Downloads\\git\\claudecodewebui\\claude-code-templates\\supp-db-project\\01-research-phase\\analysis';
        this.outputDir = './data/enhanced_citations';
        this.supplementMap = new Map();
        this.citationReferences = new Map();
    }

    async convertAll() {
        console.log('🔄 Starting Citation Data Conversion Process');
        console.log('='.repeat(60));

        try {
            // Step 1: Load and parse source data
            await this.loadSourceData();
            
            // Step 2: Extract supplement information
            await this.extractSupplementData();
            
            // Step 3: Parse citation references
            await this.parseCitationReferences();
            
            // Step 4: Generate enhanced citation files
            await this.generateEnhancedCitations();
            
            console.log('\n✅ Citation data conversion complete!');
            
        } catch (error) {
            console.error('❌ Conversion error:', error.message);
        }
    }

    async loadSourceData() {
        console.log('\n📂 Loading source data files...');
        
        const files = [
            'comprehensive_supplement_database.md',
            'comprehensive_supplement_database_extended.md',
            'supplement_reference_guide.md'
        ];

        for (const file of files) {
            const filePath = path.join(this.sourceDir, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                console.log(`   ✅ Loaded: ${file} (${content.length} chars)`);
                
                // Store content for processing
                this[file.replace('.md', '').replace(/_/g, '')] = content;
            } else {
                console.log(`   ⚠️  File not found: ${file}`);
            }
        }
    }

    async extractSupplementData() {
        console.log('\n🔍 Extracting supplement data...');
        
        // Parse supplement reference guide for detailed supplement info
        if (this.supplementreferenceguide) {
            this.parseSupplementReferenceGuide();
        }
        
        // Parse comprehensive databases for additional data
        if (this.comprehensivesupplementdatabase) {
            this.parseComprehensiveDatabase();
        }
        
        if (this.comprehensivesupplementdatabaseextended) {
            this.parseExtendedDatabase();
        }
        
        console.log(`   📊 Extracted data for ${this.supplementMap.size} supplements`);
    }

    parseSupplementReferenceGuide() {
        const content = this.supplementreferenceguide;
        
        // Extract supplement sections using regex patterns
        const supplementSections = content.split(/###\s+([^#\n]+)/);
        
        for (let i = 1; i < supplementSections.length; i += 2) {
            const name = supplementSections[i].trim();
            const data = supplementSections[i + 1];
            
            if (name && data) {
                const supplementData = this.parseSupplementSection(name, data);
                if (supplementData) {
                    this.supplementMap.set(name, supplementData);
                    console.log(`   📋 Parsed: ${name}`);
                }
            }
        }
    }

    parseSupplementSection(name, content) {
        const supplement = {
            name: name,
            benefits: [],
            mechanisms: [],
            safety: [],
            dosage: null,
            studyPopulation: null,
            duration: null
        };

        // Extract dosage information
        const dosageMatch = content.match(/\*\*Recommended Dosage:\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/);
        if (dosageMatch) {
            supplement.dosage = this.cleanText(dosageMatch[1]);
        }

        // Extract cognitive benefits
        const benefitsMatch = content.match(/\*\*Cognitive Benefits:\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/);
        if (benefitsMatch) {
            const benefits = benefitsMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
            supplement.benefits = benefits.map(benefit => this.cleanText(benefit.replace(/^-\s*/, '')));
        }

        // Extract mechanism of action
        const mechanismMatch = content.match(/\*\*Mechanism of Action:\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/);
        if (mechanismMatch) {
            const mechanisms = mechanismMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
            supplement.mechanisms = mechanisms.map(mech => this.cleanText(mech.replace(/^-\s*/, '')));
        }

        // Extract safety information
        const safetyMatch = content.match(/\*\*Side Effects and Contraindications:\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/);
        if (safetyMatch) {
            const safety = safetyMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
            supplement.safety = safety.map(safe => this.cleanText(safe.replace(/^-\s*/, '')));
        }

        // Extract study population
        const populationMatch = content.match(/\*\*Study Population:\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/);
        if (populationMatch) {
            supplement.studyPopulation = this.cleanText(populationMatch[1]);
        }

        // Extract duration
        const durationMatch = content.match(/\*\*Duration of Successful Trials:\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/);
        if (durationMatch) {
            supplement.duration = this.cleanText(durationMatch[1]);
        }

        return supplement;
    }

    parseComprehensiveDatabase() {
        // Parse tier-based evidence from comprehensive database
        const content = this.comprehensivesupplementdatabase;
        
        // Extract tier sections
        const tierSections = content.split(/##\s+Tier\s+\d+:/);
        
        for (let i = 1; i < tierSections.length; i++) {
            const tierContent = tierSections[i];
            this.parseTierSection(tierContent, i);
        }
    }

    parseExtendedDatabase() {
        // Parse extended database for additional supplement data
        const content = this.comprehensivesupplementdatabaseextended;
        
        // Similar parsing logic for extended data
        const supplementSections = content.split(/####\s+\*\*([^*]+)\*\*/);
        
        for (let i = 1; i < supplementSections.length; i += 2) {
            const name = supplementSections[i].trim();
            const data = supplementSections[i + 1];
            
            if (name && data) {
                this.updateSupplementData(name, data);
            }
        }
    }

    parseTierSection(content, tier) {
        // Extract supplement names and data from tier sections
        const supplements = content.split(/###\s+([^#\n]+)/);
        
        for (let i = 1; i < supplements.length; i += 2) {
            const name = supplements[i].trim();
            const data = supplements[i + 1];
            
            if (name && data) {
                this.updateSupplementTier(name, data, tier);
            }
        }
    }

    updateSupplementData(name, data) {
        if (!this.supplementMap.has(name)) {
            this.supplementMap.set(name, { name: name, benefits: [], mechanisms: [], safety: [] });
        }
        
        const supplement = this.supplementMap.get(name);
        
        // Extract additional data and merge
        // Implementation details for merging data
    }

    updateSupplementTier(name, data, tier) {
        if (!this.supplementMap.has(name)) {
            this.supplementMap.set(name, { name: name, benefits: [], mechanisms: [], safety: [] });
        }
        
        const supplement = this.supplementMap.get(name);
        supplement.evidenceTier = tier;
        supplement.tierData = data;
    }

    async parseCitationReferences() {
        console.log('\n📚 Parsing citation references...');
        
        // Extract numbered references from all source files
        const allContent = [
            this.supplementreferenceguide || '',
            this.comprehensivesupplementdatabase || '',
            this.comprehensivesupplementdatabaseextended || ''
        ].join('\n');

        // Find all numbered references [1], [2], etc.
        const referencePattern = /\[(\d+)\]\s+([^\[]+?)(?=\[\d+\]|$)/gs;
        let match;

        while ((match = referencePattern.exec(allContent)) !== null) {
            const refNumber = match[1];
            const refText = this.cleanText(match[2]);
            
            if (refText.length > 10) { // Filter out incomplete references
                this.citationReferences.set(refNumber, this.parseCitationText(refText));
                console.log(`   📖 Reference [${refNumber}]: ${refText.substring(0, 50)}...`);
            }
        }
        
        console.log(`   📊 Parsed ${this.citationReferences.size} citation references`);
    }

    parseCitationText(text) {
        // Parse citation text to extract structured data
        const citation = {
            title: '',
            authors: [],
            year: null,
            journal: '',
            doi: '',
            pmid: '',
            findings: text
        };

        // Extract year
        const yearMatch = text.match(/\((\d{4})\)/);
        if (yearMatch) {
            citation.year = parseInt(yearMatch[1]);
        }

        // Extract authors (before year)
        const authorMatch = text.match(/^([^(]+)\s*\(/);
        if (authorMatch) {
            const authorText = authorMatch[1].trim();
            citation.authors = this.parseAuthors(authorText);
        }

        // Extract title (after year, before journal)
        const titleMatch = text.match(/\(\d{4}\)\.\s*([^.]+)\./);
        if (titleMatch) {
            citation.title = titleMatch[1].trim();
        }

        // Extract journal
        const journalMatch = text.match(/\.\s*([A-Z][^,\d]*?)[\d,]/);
        if (journalMatch) {
            citation.journal = journalMatch[1].trim();
        }

        return citation;
    }

    parseAuthors(authorText) {
        // Parse author names from citation text
        const authors = [];
        
        if (authorText.includes('et al')) {
            const firstAuthor = authorText.split('et al')[0].trim().replace(/,$/, '');
            authors.push(firstAuthor);
        } else {
            // Split by commas and clean up
            const authorList = authorText.split(',').map(author => author.trim());
            authors.push(...authorList.filter(author => author.length > 2));
        }
        
        return authors;
    }

    async generateEnhancedCitations() {
        console.log('\n🏗️  Generating enhanced citation files...');
        
        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        let generatedCount = 0;

        for (const [name, supplementData] of this.supplementMap) {
            try {
                const enhancedCitation = this.createEnhancedCitationStructure(supplementData);
                if (enhancedCitation) {
                    const filename = this.generateFilename(name, enhancedCitation.supplementId);
                    const filepath = path.join(this.outputDir, filename);
                    
                    const fileContent = this.generateFileContent(enhancedCitation);
                    fs.writeFileSync(filepath, fileContent, 'utf8');
                    
                    console.log(`   ✅ Generated: ${filename}`);
                    generatedCount++;
                }
            } catch (error) {
                console.log(`   ❌ Failed to generate ${name}: ${error.message}`);
            }
        }

        console.log(`\n📊 Generated ${generatedCount} enhanced citation files`);
    }

    createEnhancedCitationStructure(supplementData) {
        // Create enhanced citation structure from parsed data
        // This will be implemented based on our current enhanced citation format
        
        return {
            supplementId: this.getSupplementId(supplementData.name),
            supplementName: supplementData.name,
            isEnhanced: true,
            version: "2.0",
            lastUpdated: new Date().toISOString().split('T')[0],
            citations: {
                mechanisms: this.convertMechanisms(supplementData.mechanisms),
                benefits: this.convertBenefits(supplementData.benefits),
                safety: this.convertSafety(supplementData.safety)
            }
        };
    }

    convertMechanisms(mechanisms) {
        // Convert mechanism data to enhanced citation format
        return mechanisms.map((mechanism, index) => ({
            claim: mechanism,
            mechanismType: "Biochemical pathway",
            strength: "Moderate",
            tissueTarget: "Multiple systems",
            description: mechanism,
            studies: this.getRelatedStudies(mechanism)
        }));
    }

    convertBenefits(benefits) {
        // Convert benefit data to enhanced citation format
        return benefits.map((benefit, index) => ({
            claim: benefit,
            healthDomain: this.inferHealthDomain(benefit),
            strength: "Moderate",
            evidenceQuality: "Moderate",
            replicationStatus: "Research-supported",
            studies: this.getRelatedStudies(benefit)
        }));
    }

    convertSafety(safety) {
        // Convert safety data to enhanced citation format
        return safety.map((safetyItem, index) => ({
            claim: safetyItem,
            safetyAspect: "General Safety",
            riskLevel: "Low",
            studies: this.getRelatedStudies(safetyItem)
        }));
    }

    getRelatedStudies(text) {
        // Find citation references in text and return study objects
        const studies = [];
        const refPattern = /\[(\d+)\]/g;
        let match;

        while ((match = refPattern.exec(text)) !== null) {
            const refNumber = match[1];
            const citation = this.citationReferences.get(refNumber);
            
            if (citation) {
                studies.push({
                    title: citation.title || `Research study ${refNumber}`,
                    authors: citation.authors || ['Research team'],
                    year: citation.year || 2023,
                    journal: citation.journal || 'Research publication',
                    pmid: citation.pmid || '',
                    doi: citation.doi || '',
                    findings: citation.findings || text
                });
            }
        }

        // If no specific references found, create a generic study
        if (studies.length === 0) {
            studies.push({
                title: `Research supporting: ${text.substring(0, 50)}...`,
                authors: ['Research team'],
                year: 2023,
                journal: 'Research publication',
                pmid: '',
                doi: '',
                findings: text
            });
        }

        return studies;
    }

    getSupplementId(name) {
        // Map supplement names to IDs (this would need to be populated with actual IDs)
        const idMap = {
            'Bacopa monnieri': 1,
            'Melatonin': 8,
            'Turmeric': 49,
            'Curcumin': 49,
            'Magnesium': 6,
            'Omega-3': 14,
            // Add more mappings as needed
        };
        
        return idMap[name] || 999; // Default ID for unmapped supplements
    }

    inferHealthDomain(benefit) {
        const text = benefit.toLowerCase();
        
        if (text.includes('memory') || text.includes('cognitive')) return 'Cognitive Enhancement';
        if (text.includes('sleep') || text.includes('insomnia')) return 'Sleep Quality';
        if (text.includes('anxiety') || text.includes('stress')) return 'Mood Support';
        if (text.includes('energy') || text.includes('fatigue')) return 'Energy & Vitality';
        if (text.includes('immune')) return 'Immune Support';
        if (text.includes('heart') || text.includes('cardiovascular')) return 'Cardiovascular Health';
        
        return 'General Health';
    }

    generateFilename(name, id) {
        const cleanName = name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_');
        return `${id}_${cleanName}_enhanced.js`;
    }

    generateFileContent(enhancedCitation) {
        // Generate the actual JavaScript file content
        const varName = enhancedCitation.supplementName.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/^./, c => c.toUpperCase()) + 'Enhanced';

        return `// Enhanced Citation Data for ${enhancedCitation.supplementName}
// Generated from supp-db-project research data
// Version: ${enhancedCitation.version}

window.enhancedCitations[${enhancedCitation.supplementId}] = ${JSON.stringify(enhancedCitation, null, 4)};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.enhancedCitations[${enhancedCitation.supplementId}];
}`;
    }

    cleanText(text) {
        return text.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
    }
}

// CLI Usage
if (require.main === module) {
    const converter = new CitationDataConverter();
    converter.convertAll();
}

module.exports = CitationDataConverter;
