/**
 * Data Structure Optimizer
 * Optimizes supplement data loading and organization for scalability
 */
class DataStructureOptimizer {
    constructor() {
        this.indexedData = new Map();
        this.searchIndex = new Map();
        this.categoryIndex = new Map();
        this.tierIndex = new Map();
        this.isInitialized = false;
        
        this.compressionCache = new Map();
        this.deltaCache = new Map();
        
        console.log('Data structure optimizer initialized');
    }

    /**
     * Initialize and optimize the supplement data structure
     */
    async optimizeDataStructure(supplements) {
        if (this.isInitialized) return this.indexedData;
        
        console.log('Optimizing data structure for', supplements.length, 'supplements...');
        const startTime = performance.now();
        
        try {
            // Create optimized indexes
            this._createSupplementIndex(supplements);
            this._createSearchIndex(supplements);
            this._createCategoryIndex(supplements);
            this._createTierIndex(supplements);
            
            // Optimize for memory efficiency
            this._compressCommonStrings(supplements);
            this._createDeltaCompression(supplements);
            
            this.isInitialized = true;
            
            const optimizationTime = performance.now() - startTime;
            console.log(`Data structure optimized in ${optimizationTime.toFixed(2)}ms`);
            
            return this.indexedData;
            
        } catch (error) {
            console.error('Data structure optimization failed:', error);
            return new Map(supplements.map(s => [s.id, s]));
        }
    }

    /**
     * Create efficient supplement lookup index
     * @private
     */
    _createSupplementIndex(supplements) {
        supplements.forEach(supplement => {
            // Store optimized supplement data
            const optimized = this._optimizeSupplementObject(supplement);
            this.indexedData.set(supplement.id, optimized);
        });
        
        console.log(`Created supplement index for ${supplements.length} items`);
    }

    /**
     * Create full-text search index for fast filtering
     * @private
     */
    _createSearchIndex(supplements) {
        const searchTerms = new Map();
        
        supplements.forEach(supplement => {
            const terms = this._extractSearchTerms(supplement);
            
            terms.forEach(term => {
                if (!searchTerms.has(term)) {
                    searchTerms.set(term, new Set());
                }
                searchTerms.get(term).add(supplement.id);
            });
        });
        
        // Convert Sets to Arrays for better performance
        for (const [term, supplementIds] of searchTerms) {
            this.searchIndex.set(term, Array.from(supplementIds));
        }
        
        console.log(`Created search index with ${searchTerms.size} terms`);
    }

    /**
     * Create category-based index for filtering
     * @private
     */
    _createCategoryIndex(supplements) {
        supplements.forEach(supplement => {
            const category = supplement.category;
            
            if (!this.categoryIndex.has(category)) {
                this.categoryIndex.set(category, []);
            }
            
            this.categoryIndex.get(category).push(supplement.id);
        });
        
        console.log(`Created category index with ${this.categoryIndex.size} categories`);
    }

    /**
     * Create evidence tier index for filtering
     * @private
     */
    _createTierIndex(supplements) {
        supplements.forEach(supplement => {
            const tier = supplement.evidenceTier;
            
            if (!this.tierIndex.has(tier)) {
                this.tierIndex.set(tier, []);
            }
            
            this.tierIndex.get(tier).push(supplement.id);
        });
        
        console.log(`Created tier index with ${this.tierIndex.size} tiers`);
    }

    /**
     * Optimize individual supplement object for memory efficiency
     * @private
     */
    _optimizeSupplementObject(supplement) {
        return {
            // Core properties (always loaded)
            id: supplement.id,
            name: supplement.name,
            scientificName: supplement.scientificName,
            category: supplement.category,
            evidenceTier: supplement.evidenceTier,
            evidenceTierRationale: supplement.evidenceTierRationale,
            
            // Compressed/referenced properties
            primaryBenefits: {
                cognitive: supplement.primaryBenefits.cognitive.slice(0, 3), // Limit for performance
                nonCognitive: supplement.primaryBenefits.nonCognitive.slice(0, 3)
            },
            
            // Lazy-loaded properties (only load when needed)
            _lazyLoad: {
                dosageRange: supplement.dosageRange,
                optimalDuration: supplement.optimalDuration,
                safetyProfile: supplement.safetyProfile,
                mechanismsOfAction: supplement.mechanismsOfAction,
                studyPopulations: supplement.studyPopulations,
                keyCitations: supplement.keyCitations,
                commercialAvailability: supplement.commercialAvailability,
                effectSizes: supplement.effectSizes,
                commonNames: supplement.commonNames
            },
            
            // Enhanced citation reference
            enhancedCitations: supplement.enhancedCitations ? {
                isEnhanced: supplement.enhancedCitations.isEnhanced,
                // Store only reference, load data separately
                _ref: supplement.id
            } : null
        };
    }

    /**
     * Extract search terms from supplement for indexing
     * @private
     */
    _extractSearchTerms(supplement) {
        const terms = new Set();
        
        // Primary searchable fields
        const searchableText = [
            supplement.name,
            supplement.scientificName,
            supplement.category,
            ...supplement.commonNames,
            ...supplement.primaryBenefits.cognitive,
            ...supplement.primaryBenefits.nonCognitive,
            ...supplement.mechanismsOfAction
        ].join(' ').toLowerCase();
        
        // Extract words and create n-grams for better search
        const words = searchableText.match(/\w+/g) || [];
        
        words.forEach(word => {
            if (word.length >= 2) {
                terms.add(word);
                
                // Create bi-grams for better partial matching
                if (word.length >= 4) {
                    for (let i = 0; i <= word.length - 3; i++) {
                        terms.add(word.substring(i, i + 3));
                    }
                }
            }
        });
        
        return Array.from(terms);
    }

    /**
     * Compress common strings to reduce memory usage
     * @private
     */
    _compressCommonStrings(supplements) {
        const commonStrings = new Map();
        const threshold = 3; // String must appear 3+ times to be compressed
        
        // Find frequently used strings
        supplements.forEach(supplement => {
            const strings = [
                supplement.category,
                supplement.evidenceTierRationale,
                ...supplement.primaryBenefits.cognitive,
                ...supplement.primaryBenefits.nonCognitive,
                ...supplement.mechanismsOfAction,
                supplement.safetyProfile.rating
            ];
            
            strings.forEach(str => {
                if (str && str.length > 10) {
                    commonStrings.set(str, (commonStrings.get(str) || 0) + 1);
                }
            });
        });
        
        // Create compression map for frequently used strings
        for (const [str, count] of commonStrings) {
            if (count >= threshold) {
                this.compressionCache.set(str, `#${this.compressionCache.size}`);
            }
        }
        
        console.log(`Created compression cache for ${this.compressionCache.size} common strings`);
    }

    /**
     * Create delta compression for similar supplements
     * @private
     */
    _createDeltaCompression(supplements) {
        const categories = new Map();
        
        // Group supplements by category for delta compression
        supplements.forEach(supplement => {
            const category = supplement.category;
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category).push(supplement);
        });
        
        // Create deltas for each category
        for (const [category, categorySupplements] of categories) {
            if (categorySupplements.length > 1) {
                const base = categorySupplements[0];
                const deltas = categorySupplements.slice(1).map(supplement => 
                    this._createDelta(base, supplement)
                );
                
                this.deltaCache.set(category, { base, deltas });
            }
        }
        
        console.log(`Created delta compression for ${this.deltaCache.size} categories`);
    }

    /**
     * Create delta between two supplement objects
     * @private
     */
    _createDelta(base, target) {
        const delta = { id: target.id };
        
        // Only store differences
        Object.keys(target).forEach(key => {
            if (key === 'id') return; // Always include ID
            
            if (JSON.stringify(base[key]) !== JSON.stringify(target[key])) {
                delta[key] = target[key];
            }
        });
        
        return delta;
    }

    /**
     * Fast search using pre-built indexes
     */
    fastSearch(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            return Array.from(this.indexedData.keys());
        }
        
        const normalizedTerm = searchTerm.toLowerCase();
        const matchingIds = new Set();
        
        // Search through index
        for (const [term, supplementIds] of this.searchIndex) {
            if (term.includes(normalizedTerm)) {
                supplementIds.forEach(id => matchingIds.add(id));
            }
        }
        
        return Array.from(matchingIds);
    }

    /**
     * Fast category filtering
     */
    filterByCategory(category) {
        return this.categoryIndex.get(category) || [];
    }

    /**
     * Fast tier filtering
     */
    filterByTier(tier) {
        return this.tierIndex.get(tier) || [];
    }

    /**
     * Get supplement by ID with lazy loading
     */
    getSupplement(id, loadFull = false) {
        const supplement = this.indexedData.get(id);
        if (!supplement) return null;
        
        if (loadFull && supplement._lazyLoad) {
            // Merge lazy-loaded properties
            return { ...supplement, ...supplement._lazyLoad, _lazyLoad: undefined };
        }
        
        return supplement;
    }

    /**
     * Batch get supplements with optimization
     */
    getSupplements(ids, loadFull = false) {
        const results = [];
        const batchSize = 50; // Process in batches to avoid blocking
        
        for (let i = 0; i < ids.length; i += batchSize) {
            const batch = ids.slice(i, i + batchSize);
            const batchResults = batch.map(id => this.getSupplement(id, loadFull)).filter(Boolean);
            results.push(...batchResults);
            
            // Yield control periodically
            if (i + batchSize < ids.length) {
                setTimeout(() => {}, 0);
            }
        }
        
        return results;
    }

    /**
     * Combined filter with multiple criteria
     */
    combinedFilter(criteria) {
        let resultIds = Array.from(this.indexedData.keys());
        
        // Apply search filter
        if (criteria.searchTerm) {
            const searchResults = this.fastSearch(criteria.searchTerm);
            resultIds = resultIds.filter(id => searchResults.includes(id));
        }
        
        // Apply category filter
        if (criteria.category) {
            const categoryResults = this.filterByCategory(criteria.category);
            resultIds = resultIds.filter(id => categoryResults.includes(id));
        }
        
        // Apply tier filter
        if (criteria.evidenceTier) {
            const tierResults = this.filterByTier(parseInt(criteria.evidenceTier));
            resultIds = resultIds.filter(id => tierResults.includes(id));
        }
        
        // Apply safety filter
        if (criteria.safetyRating) {
            resultIds = resultIds.filter(id => {
                const supplement = this.getSupplement(id, true);
                return supplement && supplement.safetyProfile?.rating === criteria.safetyRating;
            });
        }
        
        return resultIds;
    }

    /**
     * Get optimization statistics
     */
    getStats() {
        const memoryEstimate = this._estimateMemoryUsage();
        
        return {
            totalSupplements: this.indexedData.size,
            searchTerms: this.searchIndex.size,
            categories: this.categoryIndex.size,
            tiers: this.tierIndex.size,
            compressedStrings: this.compressionCache.size,
            deltaCompressions: this.deltaCache.size,
            estimatedMemoryKB: Math.round(memoryEstimate / 1024),
            indexingComplete: this.isInitialized
        };
    }

    /**
     * Estimate memory usage of optimized structure
     * @private
     */
    _estimateMemoryUsage() {
        let estimate = 0;
        
        // Estimate index memory
        estimate += this.indexedData.size * 200; // ~200 bytes per supplement (estimated)
        estimate += this.searchIndex.size * 50;  // ~50 bytes per search term
        estimate += this.categoryIndex.size * 100; // ~100 bytes per category
        estimate += this.tierIndex.size * 50;    // ~50 bytes per tier
        
        return estimate;
    }

    /**
     * Clear all caches and indexes
     */
    reset() {
        this.indexedData.clear();
        this.searchIndex.clear();
        this.categoryIndex.clear();
        this.tierIndex.clear();
        this.compressionCache.clear();
        this.deltaCache.clear();
        this.isInitialized = false;
        
        console.log('Data structure optimizer reset');
    }

    /**
     * Export optimized data structure for analysis
     */
    exportStructure() {
        return {
            metadata: this.getStats(),
            indexes: {
                supplements: this.indexedData.size,
                search: Array.from(this.searchIndex.keys()).slice(0, 10), // Sample
                categories: Array.from(this.categoryIndex.keys()),
                tiers: Array.from(this.tierIndex.keys())
            },
            compression: {
                commonStrings: Array.from(this.compressionCache.keys()).slice(0, 10),
                deltaCategories: Array.from(this.deltaCache.keys())
            }
        };
    }
}

// Export for use in main application
window.DataStructureOptimizer = DataStructureOptimizer;