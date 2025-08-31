/**
 * Enhanced Citation Attacher
 * Attaches enhanced citation data to supplement objects during initialization
 */

class EnhancedCitationAttacher {
    constructor() {
        this.attachmentCount = 0;
        this.errors = [];
    }

    /**
     * Attach enhanced citations to supplement objects
     * @param {Array} supplements - Array of supplement objects
     * @returns {Promise<Object>} Attachment results
     */
    async attachEnhancedCitations(supplements) {
        console.log('🔗 Attaching enhanced citations to supplement objects...');
        
        const results = {
            totalSupplements: supplements.length,
            enhancedAttached: 0,
            errors: [],
            attachedSupplements: []
        };

        // Wait a bit for enhanced citation files to load
        await this._waitForEnhancedCitations();

        if (!window.enhancedCitations) {
            console.warn('⚠️ No enhanced citations found in window.enhancedCitations');
            return results;
        }

        const enhancedIds = Object.keys(window.enhancedCitations).map(id => parseInt(id));
        console.log(`📊 Found ${enhancedIds.length} enhanced citation files for IDs: ${enhancedIds.slice(0, 10).join(', ')}${enhancedIds.length > 10 ? '...' : ''}`);

        // Process each supplement
        for (const supplement of supplements) {
            try {
                const hasEnhancedFile = enhancedIds.includes(supplement.id);
                
                if (hasEnhancedFile) {
                    const enhancedData = window.enhancedCitations[supplement.id];
                    
                    if (enhancedData && enhancedData.citations) {
                        // Attach enhanced citation data to supplement
                        supplement.enhancedCitations = {
                            isEnhanced: true,
                            ...enhancedData
                        };
                        
                        results.enhancedAttached++;
                        results.attachedSupplements.push({
                            id: supplement.id,
                            name: supplement.name,
                            citationCount: this._countCitations(enhancedData.citations)
                        });
                        
                        console.log(`✅ Attached enhanced citations to ${supplement.name} (ID: ${supplement.id})`);
                    } else {
                        const error = `Enhanced file exists but invalid data structure for ${supplement.name} (ID: ${supplement.id})`;
                        results.errors.push(error);
                        console.warn(`⚠️ ${error}`);
                    }
                } else {
                    // Ensure no enhanced citations flag for supplements without files
                    if (supplement.enhancedCitations) {
                        delete supplement.enhancedCitations;
                    }
                }
            } catch (error) {
                const errorMsg = `Failed to process ${supplement.name} (ID: ${supplement.id}): ${error.message}`;
                results.errors.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
            }
        }

        console.log(`🎯 Enhanced citation attachment complete:`);
        console.log(`   📊 Total supplements: ${results.totalSupplements}`);
        console.log(`   ✅ Enhanced attached: ${results.enhancedAttached}`);
        console.log(`   ❌ Errors: ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.warn('⚠️ Attachment errors:', results.errors);
        }

        return results;
    }

    /**
     * Wait for enhanced citations to be loaded
     * @private
     */
    async _waitForEnhancedCitations() {
        const maxWait = 50; // 5 seconds max
        let attempts = 0;

        while (attempts < maxWait) {
            if (window.enhancedCitations && Object.keys(window.enhancedCitations).length > 0) {
                console.log(`📚 Enhanced citations loaded after ${attempts * 100}ms`);
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        console.warn('⚠️ Enhanced citations not loaded within timeout period');
    }

    /**
     * Count total citations in enhanced data
     * @private
     */
    _countCitations(citations) {
        let count = 0;
        
        if (citations.mechanisms) {
            citations.mechanisms.forEach(mechanism => {
                if (mechanism.evidence) count += mechanism.evidence.length;
            });
        }
        
        if (citations.benefits) {
            citations.benefits.forEach(benefit => {
                if (benefit.evidence) count += benefit.evidence.length;
            });
        }
        
        if (citations.safety) {
            citations.safety.forEach(safety => {
                if (safety.evidence) count += safety.evidence.length;
            });
        }
        
        if (citations.dosage) {
            count += citations.dosage.length;
        }
        
        return count;
    }

    /**
     * Validate enhanced citation data structure
     * @param {Object} data - Enhanced citation data
     * @returns {boolean} Is valid
     */
    _validateEnhancedData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.citations || typeof data.citations !== 'object') return false;
        
        // Check for required sections
        const requiredSections = ['mechanisms', 'benefits', 'safety', 'dosage'];
        const hasRequiredSections = requiredSections.some(section => 
            data.citations[section] && Array.isArray(data.citations[section])
        );
        
        return hasRequiredSections;
    }

    /**
     * Get attachment statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            attachmentCount: this.attachmentCount,
            errorCount: this.errors.length,
            errors: [...this.errors]
        };
    }

    /**
     * Clear statistics
     */
    clearStats() {
        this.attachmentCount = 0;
        this.errors = [];
    }
}

export default EnhancedCitationAttacher;
