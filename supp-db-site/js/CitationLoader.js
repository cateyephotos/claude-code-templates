/**
 * Enhanced Citation Lazy Loading System
 * Implements dynamic imports and caching for performance optimization
 */
class CitationLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.performanceMetrics = {
            cacheHits: 0,
            cacheMisses: 0,
            loadTimes: []
        };
        
        // Memory management
        this.maxCacheSize = 5; // Keep only 5 supplements in memory
        this.cacheAccessOrder = [];
    }

    /**
     * Load enhanced citations for a supplement with caching
     * @param {string} supplementId - The supplement identifier
     * @returns {Promise<Object>} Enhanced citation data
     */
    async loadEnhancedCitations(supplementId) {
        const startTime = performance.now();
        
        // Check cache first
        if (this.cache.has(supplementId)) {
            this.performanceMetrics.cacheHits++;
            this._updateCacheAccess(supplementId);
            return this.cache.get(supplementId);
        }

        // Check if already loading
        if (this.loadingPromises.has(supplementId)) {
            return this.loadingPromises.get(supplementId);
        }

        // Create loading promise
        const loadingPromise = this._loadCitationData(supplementId, startTime);
        this.loadingPromises.set(supplementId, loadingPromise);

        try {
            const result = await loadingPromise;
            return result;
        } finally {
            this.loadingPromises.delete(supplementId);
        }
    }

    /**
     * Internal method to load citation data
     * @private
     */
    async _loadCitationData(supplementId, startTime) {
        this.performanceMetrics.cacheMisses++;
        
        try {
            // Dynamic import based on supplement ID
            const citationModule = await this._dynamicImport(supplementId);
            
            if (!citationModule) {
                throw new Error(`No enhanced citations found for supplement: ${supplementId}`);
            }
            
            // Handle both old and new citation formats
            // New format: direct object with citations property
            // Legacy format: module.exports with citations property
            let processedModule;
            if (citationModule.citations) {
                // New format - already correctly structured
                processedModule = citationModule;
            } else if (citationModule.exports && citationModule.exports.citations) {
                // Legacy format
                processedModule = citationModule.exports;
            } else {
                throw new Error(`Invalid citation format for supplement: ${supplementId}`);
            }

            // Cache the loaded data
            this._addToCache(supplementId, processedModule);
            
            // Record performance metrics
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.loadTimes.push(loadTime);
            
            console.log(`Loaded enhanced citations for ${supplementId} in ${loadTime.toFixed(2)}ms`);
            
            return processedModule;
        } catch (error) {
            console.warn(`Failed to load enhanced citations for ${supplementId}:`, error);
            return null;
        }
    }

    /**
     * Dynamic import with fallback handling
     * @private
     */
    async _dynamicImport(supplementId) {
        // First check if data is already available globally
        if (window.enhancedCitations && window.enhancedCitations[supplementId]) {
            // Wrap the data in expected format for compatibility
            const citationData = window.enhancedCitations[supplementId];
            return { 
                citations: citationData.citations || citationData,
                ...citationData 
            };
        }
        
        // Try loading via script tag
        const citationPaths = [
            `data/enhanced_citations/${supplementId}_enhanced.js`,
            `./data/enhanced_citations/${supplementId}_enhanced.js`,
            `../data/enhanced_citations/${supplementId}_enhanced.js`
        ];

        for (const path of citationPaths) {
            try {
                await this._loadScript(path);
                
                // Check if data is now available
                if (window.enhancedCitations && window.enhancedCitations[supplementId]) {
                    // Wrap the data in expected format for compatibility
                    const citationData = window.enhancedCitations[supplementId];
                    return { 
                        citations: citationData.citations || citationData,
                        ...citationData 
                    };
                }
            } catch (error) {
                console.warn(`Failed to load script from ${path}:`, error);
                continue;
            }
        }
        
        throw new Error(`Could not load citation module for ${supplementId}`);
    }
    
    /**
     * Load script dynamically
     * @private
     */
    async _loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            
            document.head.appendChild(script);
        });
    }

    /**
     * Evaluate module for browsers without dynamic import support
     * @private
     */
    _evaluateModule(moduleText, supplementId) {
        try {
            // Create a safe evaluation context
            const moduleExports = {};
            const module = { exports: moduleExports };
            
            // Evaluate the module text in a controlled environment
            const moduleFunction = new Function('module', 'exports', moduleText);
            moduleFunction(module, moduleExports);
            
            return module.exports || moduleExports;
        } catch (error) {
            throw new Error(`Failed to evaluate module for ${supplementId}: ${error.message}`);
        }
    }

    /**
     * Add data to cache with memory management
     * @private
     */
    _addToCache(supplementId, data) {
        // Implement LRU cache eviction
        if (this.cache.size >= this.maxCacheSize) {
            const oldestId = this.cacheAccessOrder[0];
            this.cache.delete(oldestId);
            this.cacheAccessOrder.shift();
            console.log(`Evicted ${oldestId} from citation cache`);
        }

        this.cache.set(supplementId, data);
        this.cacheAccessOrder.push(supplementId);
    }

    /**
     * Update cache access order for LRU
     * @private
     */
    _updateCacheAccess(supplementId) {
        const index = this.cacheAccessOrder.indexOf(supplementId);
        if (index > -1) {
            this.cacheAccessOrder.splice(index, 1);
            this.cacheAccessOrder.push(supplementId);
        }
    }

    /**
     * Preload citations for likely-to-be-accessed supplements
     * @param {string[]} supplementIds - Array of supplement IDs to preload
     */
    async preloadCitations(supplementIds) {
        const preloadPromises = supplementIds.map(id => 
            this.loadEnhancedCitations(id).catch(error => {
                console.warn(`Preload failed for ${id}:`, error);
                return null;
            })
        );

        try {
            await Promise.all(preloadPromises);
            console.log(`Preloaded citations for ${supplementIds.length} supplements`);
        } catch (error) {
            console.warn('Some preloads failed:', error);
        }
    }

    /**
     * Check if enhanced citations are available for a supplement
     * @param {string} supplementId - The supplement identifier
     * @returns {boolean} True if enhanced citations are available
     */
    hasEnhancedCitations(supplementId) {
        return this.cache.has(supplementId) || this._moduleExists(supplementId);
    }

    /**
     * Check if citation module exists (without loading it)
     * @private
     */
    async _moduleExists(supplementId) {
        try {
            const response = await fetch(`data/enhanced_citations/${supplementId}_enhanced.js`, { 
                method: 'HEAD' 
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Clear cache and reset performance metrics
     */
    clearCache() {
        this.cache.clear();
        this.cacheAccessOrder = [];
        this.loadingPromises.clear();
        console.log('Citation cache cleared');
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance data
     */
    getPerformanceMetrics() {
        const totalRequests = this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses;
        const cacheHitRate = totalRequests > 0 ? (this.performanceMetrics.cacheHits / totalRequests) * 100 : 0;
        const averageLoadTime = this.performanceMetrics.loadTimes.length > 0 
            ? this.performanceMetrics.loadTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.loadTimes.length 
            : 0;

        return {
            cacheHitRate: Math.round(cacheHitRate),
            averageLoadTime: Math.round(averageLoadTime),
            totalRequests,
            cacheSize: this.cache.size,
            ...this.performanceMetrics
        };
    }

    /**
     * Memory usage estimation
     * @returns {Object} Memory usage data
     */
    getMemoryUsage() {
        let estimatedSize = 0;
        for (const [id, data] of this.cache) {
            // Rough estimation of object size in memory
            estimatedSize += JSON.stringify(data).length * 2; // UTF-16 encoding
        }

        return {
            estimatedSizeKB: Math.round(estimatedSize / 1024),
            cachedSupplements: this.cache.size,
            maxCacheSize: this.maxCacheSize
        };
    }
}

// Export for use in main application
export default CitationLoader;
window.CitationLoader = CitationLoader;