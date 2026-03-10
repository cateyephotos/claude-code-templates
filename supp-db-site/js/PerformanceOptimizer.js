/**
 * Performance Optimization Module
 * Implements virtual scrolling, skeleton loading, and memory management
 */
class PerformanceOptimizer {
    constructor() {
        this.virtualScrolling = new VirtualScrollManager();
        this.skeletonLoader = new SkeletonLoader();
        this.memoryMonitor = new MemoryMonitor();
        this.intersectionObserver = null;
        
        this.config = {
            virtualScrollThreshold: 20, // Enable virtual scrolling for 20+ items
            skeletonDelay: 200, // Show skeleton after 200ms
            memoryCheckInterval: 30000, // Check memory every 30s
            lazyLoadOffset: 100 // Start loading 100px before element is visible
        };
        
        this._initialize();
    }

    /**
     * Initialize performance optimization systems
     * @private
     */
    _initialize() {
        this._setupIntersectionObserver();
        this._startMemoryMonitoring();
        console.log('Performance optimizer initialized');
    }

    /**
     * Setup intersection observer for lazy loading
     * @private
     */
    _setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                this._handleIntersection.bind(this),
                {
                    rootMargin: `${this.config.lazyLoadOffset}px`,
                    threshold: 0.1
                }
            );
        }
    }

    /**
     * Handle intersection events for lazy loading
     * @private
     */
    _handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const supplementId = element.dataset.supplementId;
                
                if (supplementId && element.classList.contains('lazy-load-citation')) {
                    this._loadCitationData(element, supplementId);
                    this.intersectionObserver.unobserve(element);
                }
            }
        });
    }

    /**
     * Load citation data for lazy-loaded elements
     * @private
     */
    async _loadCitationData(element, supplementId) {
        try {
            // Show skeleton while loading
            this.skeletonLoader.show(element);
            
            // Load the citation data
            const citationData = await window.app.citationLoader.loadEnhancedCitations(supplementId);
            
            if (citationData) {
                // Render the actual content
                const html = await window.app.citationRenderer.renderEnhancedCitations(
                    { id: supplementId, name: supplementId },
                    citationData
                );
                element.innerHTML = html;
                element.classList.remove('lazy-load-citation');
            } else {
                element.innerHTML = '<p class="text-gray-500 p-4">Enhanced citations not available</p>';
            }
        } catch (error) {
            console.error(`Failed to load citation for ${supplementId}:`, error);
            element.innerHTML = '<p class="text-red-500 p-4">Failed to load citation data</p>';
        } finally {
            this.skeletonLoader.hide(element);
        }
    }

    /**
     * Optimize supplement grid rendering with virtual scrolling
     */
    optimizeSupplementGrid(container, supplements) {
        if (supplements.length >= this.config.virtualScrollThreshold) {
            return this.virtualScrolling.setup(container, supplements);
        } else {
            // Use normal rendering for smaller lists
            return this._renderNormalGrid(container, supplements);
        }
    }

    /**
     * Normal grid rendering for small lists
     * @private
     */
    _renderNormalGrid(container, supplements) {
        const fragment = document.createDocumentFragment();
        
        supplements.forEach(supplement => {
            const card = this._createSupplementCard(supplement);
            fragment.appendChild(card);
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
        
        return { type: 'normal', count: supplements.length };
    }

    /**
     * Create optimized supplement card element
     * @private
     */
    _createSupplementCard(supplement) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md card-hover p-6 relative';
        card.dataset.supplementId = supplement.id;
        
        // Create card content (simplified for performance)
        card.innerHTML = this._getCardHTML(supplement);
        
        // Add intersection observer for enhanced citations
        if (supplement.enhancedCitations?.isEnhanced) {
            const citationContainer = card.querySelector('.citation-container');
            if (citationContainer) {
                citationContainer.classList.add('lazy-load-citation');
                citationContainer.dataset.supplementId = supplement.id;
                this.intersectionObserver?.observe(citationContainer);
            }
        }
        
        return card;
    }

    /**
     * Get card HTML template (optimized for performance)
     * @private
     */
    _getCardHTML(supplement) {
        const isFavorite = window.app?.favorites?.includes(supplement.id) || false;
        const tierClass = this._getTierClass(supplement.evidenceTier);
        const hasEnhanced = supplement.enhancedCitations?.isEnhanced;
        
        return `
            <div class="absolute top-4 right-4 flex flex-col space-y-2">
                <div class="flex space-x-2">
                    <span class="tier-badge ${tierClass} text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Tier ${supplement.evidenceTier}
                    </span>
                    <button onclick="app.toggleFavorite(${supplement.id})" 
                            class="text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fas fa-heart ${isFavorite ? 'text-red-500' : ''}"></i>
                    </button>
                </div>
            </div>
            
            <div class="mb-4">
                <h3 class="text-xl font-bold text-gray-900 mb-2">${supplement.name}</h3>
                <p class="text-sm text-gray-600 italic mb-2">${supplement.scientificName}</p>
                <span class="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    ${supplement.category}
                </span>
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
            
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-700">Evidence Strength</span>
                    <span class="text-sm text-gray-600">${supplement.evidenceTierRationale}</span>
                </div>
                <div class="evidence-meter bg-gray-200">
                    <div class="evidence-fill ${tierClass}" style="width: ${(5 - supplement.evidenceTier) * 25}%"></div>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-medium text-gray-700">Dosage:</span>
                        <p class="text-gray-600">${supplement.dosageRange}</p>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Safety:</span>
                        <p class="text-gray-600">${supplement.safetyProfile.rating}</p>
                    </div>
                </div>
            </div>
            
            <div class="flex space-x-2">
                <a href="supplements/${supplement.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.html"
                   class="flex-1 bg-accent text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-900 transition-colors text-center"
                   style="text-decoration:none;">
                    Full Monograph
                </a>
                <button onclick="app.showSupplementDetails(${supplement.id})"
                        class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                    Quick View
                </button>
                <button onclick="app.addToComparison(${supplement.id})"
                        class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                    Compare
                </button>
            </div>
            
            ${hasEnhanced ? '<div class="citation-container mt-4"></div>' : ''}
        `;
    }

    /**
     * Get tier class for styling
     * @private
     */
    _getTierClass(tier) {
        const classes = {
            1: 'tier-badge',
            2: 'tier-2',
            3: 'tier-3',
            4: 'tier-4'
        };
        return classes[tier] || 'tier-4';
    }

    /**
     * Start memory monitoring
     * @private
     */
    _startMemoryMonitoring() {
        if (this.memoryMonitor.isSupported()) {
            setInterval(() => {
                this.memoryMonitor.checkMemoryUsage();
            }, this.config.memoryCheckInterval);
        }
    }

    /**
     * Clean up resources for memory management
     */
    cleanup() {
        this.intersectionObserver?.disconnect();
        this.virtualScrolling.cleanup();
        this.memoryMonitor.stop();
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            virtualScrolling: this.virtualScrolling.getMetrics(),
            memory: this.memoryMonitor.getMetrics(),
            skeletonLoading: this.skeletonLoader.getMetrics()
        };
    }
}

/**
 * Virtual Scroll Manager
 * Handles rendering of large lists efficiently
 */
class VirtualScrollManager {
    constructor() {
        this.container = null;
        this.items = [];
        this.visibleItems = [];
        this.itemHeight = 400; // Estimated supplement card height
        this.containerHeight = 0;
        this.scrollTop = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        this.renderBuffer = 3; // Render 3 extra items before/after visible area
        
        this.metrics = {
            totalItems: 0,
            visibleItems: 0,
            renderCalls: 0,
            scrollEvents: 0
        };
    }

    /**
     * Setup virtual scrolling for a container
     */
    setup(container, items) {
        this.container = container;
        this.items = items;
        this.metrics.totalItems = items.length;
        
        this.containerHeight = container.clientHeight || window.innerHeight;
        this._calculateVisibleRange();
        this._render();
        this._attachScrollListener();
        
        console.log(`Virtual scrolling enabled for ${items.length} items`);
        return { type: 'virtual', count: items.length, visible: this.visibleItems.length };
    }

    /**
     * Calculate which items should be visible
     * @private
     */
    _calculateVisibleRange() {
        const visibleCount = Math.ceil(this.containerHeight / this.itemHeight) + (this.renderBuffer * 2);
        this.startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.renderBuffer);
        this.endIndex = Math.min(this.items.length, this.startIndex + visibleCount);
        
        this.visibleItems = this.items.slice(this.startIndex, this.endIndex);
        this.metrics.visibleItems = this.visibleItems.length;
    }

    /**
     * Render visible items
     * @private
     */
    _render() {
        if (!this.container) return;
        
        this.metrics.renderCalls++;
        
        // Create container with proper height
        const totalHeight = this.items.length * this.itemHeight;
        const offsetY = this.startIndex * this.itemHeight;
        
        this.container.style.height = `${totalHeight}px`;
        this.container.style.position = 'relative';
        
        // Clear and render visible items
        const fragment = document.createDocumentFragment();
        
        this.visibleItems.forEach((item, index) => {
            const element = this._createVirtualItem(item, this.startIndex + index);
            element.style.position = 'absolute';
            element.style.top = `${offsetY + (index * this.itemHeight)}px`;
            element.style.width = '100%';
            fragment.appendChild(element);
        });
        
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }

    /**
     * Create virtual item element
     * @private
     */
    _createVirtualItem(item, index) {
        const element = document.createElement('div');
        element.className = 'virtual-item';
        element.dataset.index = index;
        element.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-4 mb-4">
                <h3 class="font-bold">${item.name}</h3>
                <p class="text-gray-600">${item.scientificName}</p>
                <a href="supplements/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.html"
                   class="mt-2 inline-block bg-accent text-white px-4 py-2 rounded text-center"
                   style="text-decoration:none;">
                    Full Monograph
                </a>
                <button onclick="app.showSupplementDetails(${item.id})"
                        class="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded">
                    Quick View
                </button>
            </div>
        `;
        return element;
    }

    /**
     * Attach scroll listener
     * @private
     */
    _attachScrollListener() {
        if (!this.container) return;
        
        const scrollListener = this._throttle(() => {
            this.metrics.scrollEvents++;
            this.scrollTop = this.container.scrollTop;
            
            const newStartIndex = Math.floor(this.scrollTop / this.itemHeight) - this.renderBuffer;
            
            if (Math.abs(newStartIndex - this.startIndex) >= this.renderBuffer) {
                this._calculateVisibleRange();
                this._render();
            }
        }, 16); // ~60fps
        
        this.container.addEventListener('scroll', scrollListener);
    }

    /**
     * Throttle function for performance
     * @private
     */
    _throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Cleanup virtual scrolling
     */
    cleanup() {
        if (this.container) {
            this.container.style.height = '';
            this.container.style.position = '';
        }
    }

    /**
     * Get virtual scrolling metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
}

/**
 * Skeleton Loader
 * Shows loading placeholders while content loads
 */
class SkeletonLoader {
    constructor() {
        this.activeSkeletons = new Set();
        this.metrics = {
            shown: 0,
            hidden: 0,
            averageDisplayTime: 0
        };
        this.displayTimes = [];
    }

    /**
     * Show skeleton loader for element
     */
    show(element) {
        const startTime = Date.now();
        element.dataset.skeletonStart = startTime;
        
        element.innerHTML = this._getSkeletonHTML();
        element.classList.add('skeleton-loading');
        
        this.activeSkeletons.add(element);
        this.metrics.shown++;
    }

    /**
     * Hide skeleton loader
     */
    hide(element) {
        const startTime = element.dataset.skeletonStart;
        if (startTime) {
            const displayTime = Date.now() - parseInt(startTime);
            this.displayTimes.push(displayTime);
            this._updateAverageDisplayTime();
        }
        
        element.classList.remove('skeleton-loading');
        this.activeSkeletons.delete(element);
        this.metrics.hidden++;
    }

    /**
     * Get skeleton HTML
     * @private
     */
    _getSkeletonHTML() {
        return `
            <div class="animate-pulse">
                <div class="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div class="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div class="h-3 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div class="grid grid-cols-2 gap-2 mb-4">
                    <div class="h-2 bg-gray-300 rounded"></div>
                    <div class="h-2 bg-gray-300 rounded"></div>
                    <div class="h-2 bg-gray-300 rounded"></div>
                    <div class="h-2 bg-gray-300 rounded"></div>
                </div>
                <div class="h-8 bg-gray-300 rounded w-full"></div>
            </div>
        `;
    }

    /**
     * Update average display time
     * @private
     */
    _updateAverageDisplayTime() {
        if (this.displayTimes.length > 0) {
            this.metrics.averageDisplayTime = Math.round(
                this.displayTimes.reduce((a, b) => a + b, 0) / this.displayTimes.length
            );
        }
    }

    /**
     * Get skeleton loading metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            activeSkeletons: this.activeSkeletons.size
        };
    }
}

/**
 * Memory Monitor
 * Tracks memory usage and triggers cleanup when needed
 */
class MemoryMonitor {
    constructor() {
        this.metrics = {
            peakMemory: 0,
            currentMemory: 0,
            cleanupEvents: 0,
            isSupported: this.isSupported()
        };
        this.memoryThreshold = 100 * 1024 * 1024; // 100MB threshold
    }

    /**
     * Check if memory API is supported
     */
    isSupported() {
        return 'memory' in performance && 'usedJSHeapSize' in performance.memory;
    }

    /**
     * Check current memory usage
     */
    checkMemoryUsage() {
        if (!this.isSupported()) return;
        
        const memory = performance.memory;
        this.metrics.currentMemory = memory.usedJSHeapSize;
        this.metrics.peakMemory = Math.max(this.metrics.peakMemory, memory.usedJSHeapSize);
        
        if (memory.usedJSHeapSize > this.memoryThreshold) {
            this._triggerCleanup();
        }
    }

    /**
     * Trigger memory cleanup
     * @private
     */
    _triggerCleanup() {
        this.metrics.cleanupEvents++;
        
        // Clear citation cache
        if (window.app?.citationLoader) {
            window.app.citationLoader.clearCache();
        }
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        console.log('Memory cleanup triggered');
    }

    /**
     * Get memory metrics
     */
    getMetrics() {
        if (this.isSupported()) {
            this.checkMemoryUsage();
        }
        
        return {
            ...this.metrics,
            currentMemoryMB: Math.round(this.metrics.currentMemory / (1024 * 1024)),
            peakMemoryMB: Math.round(this.metrics.peakMemory / (1024 * 1024))
        };
    }

    /**
     * Stop memory monitoring
     */
    stop() {
        // Cleanup any running intervals would go here
    }
}

// Export for use in main application
export default PerformanceOptimizer;
window.PerformanceOptimizer = PerformanceOptimizer;