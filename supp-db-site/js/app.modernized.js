/**
 * Modernized Supplement Database Application
 * Implements lazy loading, modular architecture, performance optimization, and error boundaries
 */

// Import required modules
import CitationLoader from './CitationLoader.js?v=20260307m';
import CitationRenderer from './CitationRenderer.js?v=20260307m';
import EnhancedCitationLoader from './EnhancedCitationLoader.js?v=20260307m';
import EnhancedCitationAttacher from './EnhancedCitationAttacher.js?v=20260307m';
import { ErrorBoundary, GlobalErrorManager } from './ErrorBoundary.js';
import TemplateSystem from './TemplateSystem.js';
import PerformanceOptimizer from './PerformanceOptimizer.js';
class ModernSupplementDatabase {
    constructor() {
        // Initialize basic properties first
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.comparisonList = [];
        
        // Performance metrics
        this.metrics = {
            renderTimes: [],
            filterTimes: [],
            loadTimes: []
        };
        
        // Wait for data to be available
        this._waitForData();
    }
    
    /**
     * Wait for supplementDatabase to be available
     * @private
     */
    _waitForData() {
        // Track retry attempts to prevent infinite loops
        if (!this.dataWaitRetries) {
            this.dataWaitRetries = 0;
            this.maxDataWaitRetries = 100; // 10 seconds max wait
        }
        
        // Check for data availability in multiple locations
        const database = window.supplementDatabase || (typeof supplementDatabase !== 'undefined' ? supplementDatabase : null);
        
        if (database && database.supplements && database.categories && database.healthDomains) {
            console.log('Database found, initializing...');
            this._initializeWithData(database);
        } else if (this.dataWaitRetries < this.maxDataWaitRetries) {
            this.dataWaitRetries++;
            // Check again in 100ms
            setTimeout(() => this._waitForData(), 100);
        } else {
            // Fallback after timeout
            console.error('Database failed to load after maximum retries, attempting fallback');
            this._handleDataLoadFailure();
        }
    }
    
    /**
     * Handle data load failure with fallback mechanisms
     * @private
     */
    _handleDataLoadFailure() {
        try {
            // Try to load original app.js as fallback
            const fallbackScript = document.createElement('script');
            fallbackScript.src = 'js/app.js';
            fallbackScript.onload = () => {
                console.log('Fallback to original app.js loaded successfully');
            };
            fallbackScript.onerror = () => {
                console.error('Fallback app.js also failed to load');
                this._showDataLoadError();
            };
            document.head.appendChild(fallbackScript);
        } catch (error) {
            console.error('Failed to load fallback:', error);
            this._showDataLoadError();
        }
    }
    
    /**
     * Show data load error to user
     * @private
     */
    _showDataLoadError() {
        const container = document.getElementById('supplementGrid');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-red-800 mb-2">Database Load Error</h3>
                    <p class="text-red-700 mb-4">The supplement database could not be loaded. Please check your internet connection and try again.</p>
                    <div class="flex space-x-3">
                        <button onclick="location.reload()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                            Reload Page
                        </button>
                        <button onclick="app._retryDataLoad()" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                            Retry Load
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Retry loading data manually
     * @private
     */
    _retryDataLoad() {
        this.dataWaitRetries = 0;
        this._waitForData();
    }

    /**
     * Initialize once data is available
     * @private
     */
    _initializeWithData(database = null) {
        try {
            // Use provided database or find it
            const db = database || window.supplementDatabase || supplementDatabase;
            
            if (!db) {
                throw new Error('No supplement database found');
            }
            
            // Core data
            this.supplements = db.supplements;
            this.categories = db.categories;
            this.healthDomains = db.healthDomains;
            this.filteredSupplements = [...this.supplements];
            
            // Validate data integrity
            if (!this.supplements || !Array.isArray(this.supplements)) {
                throw new Error('Invalid supplements data');
            }
            if (!this.categories || !Array.isArray(this.categories)) {
                throw new Error('Invalid categories data');
            }
            if (!this.healthDomains || !Array.isArray(this.healthDomains)) {
                throw new Error('Invalid healthDomains data');
            }
            
            console.log(`Database loaded: ${this.supplements.length} supplements, ${this.categories.length} categories, ${this.healthDomains.length} health domains`);
            
            // Make data available globally for tests
            window.supplementDatabase = {
                supplements: this.supplements,
                categories: this.categories,
                healthDomains: this.healthDomains
            };
            
            // Also store app instance globally
            window.app = this;
            
            // Initialize modern systems
            this.citationLoader = new CitationLoader();
            this.citationRenderer = new CitationRenderer();
            this.enhancedCitationLoader = new EnhancedCitationLoader();
            this.enhancedCitationAttacher = new EnhancedCitationAttacher();
            this.performanceOptimizer = new PerformanceOptimizer();
            this.templateSystem = new TemplateSystem();

            // Initialize enhanced citations asynchronously after constructor
            this._initializeEnhancedCitations();
            
            // Setup error boundaries
            this.errorBoundaries = {
                main: window.GlobalErrorManager.createBoundary('supplementGrid', {
                    showDetails: true,
                    onError: this._handleSupplementGridError.bind(this)
                }),
                modal: window.GlobalErrorManager.createBoundary('supplementModal', {
                    showDetails: false,
                    onError: this._handleModalError.bind(this)
                }),
                comparison: window.GlobalErrorManager.createBoundary('comparisonTable', {
                    showDetails: false,
                    onError: this._handleComparisonError.bind(this)
                })
            };
            
            this._initialize();
        } catch (error) {
            console.error('Failed to initialize with data:', error);
            this._showApplicationError(error);
        }
    }

    /**
     * Initialize the application with error handling
     * @private
     */
    async _initialize() {
        try {
            console.log('Initializing modernized supplement database...');
            
            // Initialize core functionality
            await this.errorBoundaries.main.execute(async () => {
                this._populateFilters();
                this._setupEventListeners();
                await this._renderSupplements();
                this._updateFavoritesCount();
                this._updateStats();
            }, 'Application initialization');
            
            // Note: Enhanced citations are loaded by EnhancedCitationLoader.loadAllEnhancedCitations()
            // called from _initializeEnhancedCitations() in the constructor.
            // The redundant _preloadEnhancedCitations() was removed to prevent duplicate script loading.

            // Setup performance monitoring
            this._setupPerformanceMonitoring();
            
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this._showApplicationError(error);
        }
    }

    /**
     * Populate filter dropdowns with optimized rendering
     * @private
     */
    _populateFilters() {
        const startTime = performance.now();
        
        try {
            // Validate data first
            if (!this.categories || !Array.isArray(this.categories)) {
                throw new Error('Categories data is not available or invalid');
            }
            if (!this.healthDomains || !Array.isArray(this.healthDomains)) {
                throw new Error('Health domains data is not available or invalid');
            }
            if (!this.supplements || !Array.isArray(this.supplements)) {
                throw new Error('Supplements data is not available or invalid');
            }
            
            // Check for empty arrays
            if (this.categories.length === 0) {
                console.warn('Categories array is empty');
            }
            if (this.healthDomains.length === 0) {
                console.warn('Health domains array is empty');
            }
            if (this.supplements.length === 0) {
                console.warn('Supplements array is empty');
            }
            
            // Populate category filter
            const categoryFilter = document.getElementById('categoryFilter');
            if (!categoryFilter) {
                console.warn('Category filter element not found');
            } else {
                // Clear existing options first (except the default)
                const defaultOption = categoryFilter.querySelector('option[value=""]');
                const defaultText = defaultOption ? defaultOption.textContent : 'All Categories';
                categoryFilter.innerHTML = '';
                
                // Recreate default option
                const newDefaultOption = document.createElement('option');
                newDefaultOption.value = '';
                newDefaultOption.textContent = defaultText;
                categoryFilter.appendChild(newDefaultOption);
                
                const categoryFragment = document.createDocumentFragment();
                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categoryFragment.appendChild(option);
                });
                categoryFilter.appendChild(categoryFragment);
                console.log(`Populated ${this.categories.length} categories`);
            }
            
            // Populate health domain filter
            const healthDomainFilter = document.getElementById('healthDomainFilter');
            if (!healthDomainFilter) {
                console.warn('Health domain filter element not found');
            } else {
                // Clear existing options first (except the default)
                const defaultOption = healthDomainFilter.querySelector('option[value=""]');
                const defaultText = defaultOption ? defaultOption.textContent : 'All Health Domains';
                healthDomainFilter.innerHTML = '';
                
                // Recreate default option
                const newDefaultOption = document.createElement('option');
                newDefaultOption.value = '';
                newDefaultOption.textContent = defaultText;
                healthDomainFilter.appendChild(newDefaultOption);
                
                const domainFragment = document.createDocumentFragment();
                this.healthDomains.forEach(domain => {
                    const option = document.createElement('option');
                    option.value = domain.name;
                    option.textContent = domain.name;
                    domainFragment.appendChild(option);
                });
                healthDomainFilter.appendChild(domainFragment);
                console.log(`Populated ${this.healthDomains.length} health domains`);
            }
            
            // Populate comparison selects efficiently
            if (this.supplements && Array.isArray(this.supplements)) {
                const supplementOptions = this.supplements.map(supplement => {
                    return { value: supplement.id, text: supplement.name };
                });
                
                ['compareSelect1', 'compareSelect2', 'compareSelect3'].forEach(selectId => {
                    const select = document.getElementById(selectId);
                    if (!select) {
                        console.warn(`Comparison select ${selectId} not found`);
                        return;
                    }
                    
                    // Clear existing options first (except the default)
                    const defaultOption = select.querySelector('option[value=""]');
                    const defaultText = defaultOption ? defaultOption.textContent : 'Select supplement';
                    select.innerHTML = '';
                    
                    // Recreate default option
                    const newDefaultOption = document.createElement('option');
                    newDefaultOption.value = '';
                    newDefaultOption.textContent = defaultText;
                    select.appendChild(newDefaultOption);
                    
                    const fragment = document.createDocumentFragment();
                    supplementOptions.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.text;
                        fragment.appendChild(optionElement);
                    });
                    
                    select.appendChild(fragment);
                });
                console.log(`Populated comparison selects with ${supplementOptions.length} supplements`);
            }
            
            const filterTime = performance.now() - startTime;
            this.metrics.filterTimes.push(filterTime);
            
            // Log performance warning if slow
            if (filterTime > 100) {
                console.warn(`Slow filter population: ${filterTime.toFixed(2)}ms`);
            } else {
                console.log(`Filters populated in ${filterTime.toFixed(2)}ms`);
            }
            
        } catch (error) {
            console.error('Error populating filters:', error);
            throw error; // Re-throw to be caught by error boundary
        }
    }

    /**
     * Setup event listeners with error boundaries
     * @private
     */
    _setupEventListeners() {
        // Search input with debouncing
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', 
                this._debounce(() => {
                    this.errorBoundaries.main.execute(
                        () => this.filterSupplements(),
                        'Search filtering'
                    );
                }, 300)
            );
        }
        
        // Filter selects
        ['evidenceTierFilter', 'categoryFilter', 'healthDomainFilter', 'safetyFilter'].forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => {
                    this.errorBoundaries.main.execute(
                        () => this.filterSupplements(),
                        `Filter change: ${filterId}`
                    );
                });
            }
        });
        
        // Sort select
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', () => {
                this.errorBoundaries.main.execute(
                    () => this.sortSupplements(),
                    'Sorting supplements'
                );
            });
        }
        
        // Comparison selects
        ['compareSelect1', 'compareSelect2', 'compareSelect3'].forEach(selectId => {
            const element = document.getElementById(selectId);
            if (element) {
                element.addEventListener('change', () => {
                    this.errorBoundaries.comparison.execute(
                        () => this.updateComparison(),
                        'Comparison update'
                    );
                });
            }
        });
        
        // Modal close
        const modal = document.getElementById('supplementModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.closeModal();
                }
            });
        }
        
        // Favorites and export buttons
        this._setupButtonListeners();
    }

    /**
     * Setup button event listeners
     * @private
     */
    _setupButtonListeners() {
        const favoritesBtn = document.getElementById('favoritesBtn');
        if (favoritesBtn) {
            favoritesBtn.addEventListener('click', () => {
                this.errorBoundaries.main.execute(
                    () => this.showFavorites(),
                    'Show favorites'
                );
            });
        }
        
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.errorBoundaries.main.execute(
                    () => this.exportData(),
                    'Export data'
                );
            });
        }
    }

    /**
     * Render supplements with performance optimization
     */
    async _renderSupplements() {
        const startTime = performance.now();
        
        try {
            const grid = document.getElementById('supplementGrid');
            const noResults = document.getElementById('noResults');
            
            if (!grid || !noResults) {
                throw new Error('Required DOM elements not found');
            }
            
            if (this.filteredSupplements.length === 0) {
                grid.classList.add('hidden');
                noResults.classList.remove('hidden');
                return;
            }
            
            grid.classList.remove('hidden');
            noResults.classList.add('hidden');
            
            // Always use normal rendering to ensure proper card display
            // Disable virtual scrolling for better card layout and sizing
            await this._renderSupplementCards(grid);
            
            const renderTime = performance.now() - startTime;
            this.metrics.renderTimes.push(renderTime);
            
            console.log(`Rendered ${this.filteredSupplements.length} supplements in ${renderTime.toFixed(2)}ms (normal rendering mode)`);
            
        } catch (error) {
            console.error('Error rendering supplements:', error);
            throw error;
        }
    }

    /**
     * Render supplement cards using template system with fallback
     * @private
     */
    async _renderSupplementCards(container) {
        const fragment = document.createDocumentFragment();
        
        for (const supplement of this.filteredSupplements) {
            try {
                // Try using template system first
                const cardData = this._prepareSupplementCardData(supplement);
                let cardHTML;
                
                // Temporarily force basic rendering to fix Primary Benefits
                // TODO: Fix template system to properly handle Primary Benefits
                cardHTML = this._renderBasicSupplementCard(supplement);
                
                // if (this.templateSystem && this.templateSystem.render) {
                //     try {
                //         cardHTML = this.templateSystem.render('supplementCard', cardData);
                //     } catch (templateError) {
                //         console.warn(`Template rendering failed for ${supplement.name}, using fallback:`, templateError);
                //         cardHTML = this._renderBasicSupplementCard(supplement);
                //     }
                // } else {
                //     // Fallback to basic rendering
                //     cardHTML = this._renderBasicSupplementCard(supplement);
                // }
                
                const cardElement = document.createElement('div');
                cardElement.innerHTML = cardHTML;
                fragment.appendChild(cardElement.firstElementChild);
                
            } catch (error) {
                console.error(`Error rendering card for ${supplement.name}:`, error);
                // Create a minimal error card
                const errorCard = this._createErrorCard(supplement, error);
                fragment.appendChild(errorCard);
            }
        }
        
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    /**
     * Render basic supplement card as fallback
     * @private
     */
    _renderBasicSupplementCard(supplement) {
        const isFavorite = this.favorites.includes(supplement.id);
        const tierClass = this._getTierClass(supplement.evidenceTier);
        const hasEnhanced = supplement.enhancedCitations?.isEnhanced;
        
        return `
            <div class="bg-white rounded-lg shadow-md card-hover p-6 relative" data-supplement-id="${supplement.id}">
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
                    ${hasEnhanced ? `
                        <div class="flex justify-end">
                            <span class="phase-2a-badge text-white text-xs px-2 py-1 rounded-full font-semibold">
                                Phase 2A Enhanced
                            </span>
                        </div>
                    ` : ''}
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
                        ${(supplement.primaryBenefits?.cognitive || []).slice(0, 2).map(benefit => 
                            `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${benefit}</span>`
                        ).join('')}
                    </div>
                    <div class="flex flex-wrap gap-1">
                        ${(supplement.primaryBenefits?.nonCognitive || []).slice(0, 2).map(benefit => 
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
                    <button onclick="app.showSupplementDetails(${supplement.id})" 
                            class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                        View Details
                    </button>
                    <button onclick="app.addToComparison(${supplement.id})" 
                            class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                        Compare
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Prepare data for supplement card template
     * @private
     */
    _prepareSupplementCardData(supplement) {
        return {
            id: supplement.id,
            name: supplement.name,
            scientificName: supplement.scientificName,
            category: supplement.category,
            evidenceTier: supplement.evidenceTier,
            evidenceTierRationale: supplement.evidenceTierRationale,
            tierClass: this._getTierClass(supplement.evidenceTier),
            isFavorite: this.favorites.includes(supplement.id),
            hasEnhanced: supplement.enhancedCitations?.isEnhanced || false,
            cognitiveBenefits: (supplement.primaryBenefits?.cognitive || []).slice(0, 2),
            nonCognitiveBenefits: (supplement.primaryBenefits?.nonCognitive || []).slice(0, 2),
            evidenceWidth: (5 - supplement.evidenceTier) * 25,
            dosageRange: supplement.dosageRange,
            safetyRating: supplement.safetyProfile.rating
        };
    }

    /**
     * Create error card for failed supplement rendering
     * @private
     */
    _createErrorCard(supplement, error) {
        const errorCard = document.createElement('div');
        errorCard.className = 'bg-red-50 border border-red-200 rounded-lg p-4';
        
        try {
            // Try to use template system first
            if (this.templateSystem && this.templateSystem.render) {
                errorCard.innerHTML = this.templateSystem.render('error', {
                    title: `Error loading ${supplement.name}`,
                    message: 'This supplement card could not be rendered properly.',
                    showRetry: true,
                    retryAction: `app._retrySupplementCard(${supplement.id})`
                });
            } else {
                throw new Error('Template system not available');
            }
        } catch (templateError) {
            // Fallback to pure JavaScript HTML generation
            errorCard.innerHTML = `
                <div class="flex items-center mb-3">
                    <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                    <h4 class="font-semibold text-red-800">Error loading ${supplement.name}</h4>
                </div>
                <p class="text-red-700 mb-3">This supplement card could not be rendered properly.</p>
                <button onclick="app._retrySupplementCard(${supplement.id})" 
                        class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                    Retry
                </button>
            `;
        }
        return errorCard;
    }

    /**
     * Retry rendering a specific supplement card
     */
    async _retrySupplementCard(supplementId) {
        const supplement = this.supplements.find(s => s.id === supplementId);
        if (!supplement) return;
        
        try {
            const cardData = this._prepareSupplementCardData(supplement);
            const cardHTML = this.templateSystem.render('supplementCard', cardData);
            
            // Find and replace the error card
            const errorCard = document.querySelector(`[data-supplement-id="${supplementId}"]`);
            if (errorCard) {
                errorCard.outerHTML = cardHTML;
            }
        } catch (error) {
            console.error(`Retry failed for supplement ${supplementId}:`, error);
        }
    }

    /**
     * Get tier-specific CSS class for styling
     * @private
     */
    _getTierClass(tier) {
        switch (tier) {
            case 1: return 'tier-badge';
            case 2: return 'tier-2';
            case 3: return 'tier-3';
            case 4: return 'tier-4';
            default: return 'tier-4';
        }
    }

    /**
     * Show detailed supplement information in modal
     */
    async showSupplementDetails(id) {
        const supplement = this.supplements.find(s => s.id === id);
        if (!supplement) return;
        
        const modal = document.getElementById('supplementModal');
        const modalContent = modal.querySelector('.p-6');
        
        try {
            // Check if this supplement has enhanced citations
            const hasEnhanced = supplement.enhancedCitations?.isEnhanced;
            let enhancedData = null;
            
            if (hasEnhanced) {
                // Load enhanced citation data
                enhancedData = await this.citationLoader.loadEnhancedCitations(supplement.id);
            }
            
            // Generate modal content
            const modalHTML = this._generateModalContent(supplement, enhancedData);
            modalContent.innerHTML = modalHTML;
            
            // Show modal
            modal.classList.remove('hidden');
            
            // Initialize enhanced citation tabs if available
            if (hasEnhanced && enhancedData) {
                this._initializeCitationTabs(supplement.id);
            }
            
        } catch (error) {
            console.error('Error loading supplement details:', error);
            modalContent.innerHTML = this._generateBasicModalContent(supplement);
            modal.classList.remove('hidden');
        }
    }

    /**
     * Generate enhanced modal content
     * @private
     */
    _generateModalContent(supplement, enhancedData) {
        const hasEnhanced = enhancedData && enhancedData.citations;
        
        return `
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">${supplement.name}</h2>
                    <p class="text-lg text-gray-600 italic">${supplement.scientificName}</p>
                    <div class="flex items-center mt-2 space-x-3">
                        <span class="tier-badge ${this._getTierClass(supplement.evidenceTier)} text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Evidence Tier ${supplement.evidenceTier}
                        </span>
                        <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            ${supplement.category}
                        </span>
                        ${hasEnhanced ? `
                            <span class="phase-2a-badge text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Phase 2A Enhanced
                            </span>
                        ` : ''}
                    </div>
                </div>
                <button onclick="app.closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            ${hasEnhanced ? this._generateEnhancedCitationContent(supplement, enhancedData) : this._generateBasicContent(supplement)}
        `;
    }

    /**
     * Generate enhanced citation content with tabs
     * @private
     */
    _generateEnhancedCitationContent(supplement, enhancedData) {
        const mechanisms = enhancedData.citations.mechanisms || [];
        const benefits = enhancedData.citations.benefits || [];
        const safety = enhancedData.citations.safety || [];
        
        return `
            <!-- Enhanced Evidence Profile -->
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold mb-4 text-gray-900">Enhanced Evidence Profile</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div class="text-2xl font-bold text-purple-600">${enhancedData.evidenceProfile.researchQualityScore}/100</div>
                        <div class="text-sm text-gray-600">Quality Score</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-blue-600">${enhancedData.evidenceProfile.totalCitations}</div>
                        <div class="text-sm text-gray-600">Total Citations</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-green-600">${enhancedData.evidenceProfile.evidenceStrength.mechanisms}</div>
                        <div class="text-sm text-gray-600">Mechanisms</div>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-green-600">${enhancedData.evidenceProfile.evidenceStrength.clinicalBenefits}</div>
                        <div class="text-sm text-gray-600">Clinical Benefits</div>
                    </div>
                </div>
                <div class="mt-4 text-center">
                    <span class="text-sm text-gray-600">Research Maturity: </span>
                    <span class="font-medium">${enhancedData.evidenceProfile.researchMaturity}</span>
                    <span class="text-sm text-gray-600 ml-4">Publication Span: </span>
                    <span class="font-medium">${enhancedData.evidenceProfile.publicationSpan}</span>
                </div>
            </div>
            
            <!-- Enhanced Citations Tabs -->
            <div class="border-b border-gray-200">
                <nav class="flex space-x-8">
                    <button onclick="app.showCitationTab('mechanisms-${supplement.id}')" 
                            class="citation-tab-btn active-tab py-2 px-1 border-b-2 border-purple-500 font-medium text-sm text-purple-600">
                        Mechanisms (${mechanisms.length})
                    </button>
                    <button onclick="app.showCitationTab('benefits-${supplement.id}')" 
                            class="citation-tab-btn py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                        Clinical Benefits (${benefits.length})
                    </button>
                    <button onclick="app.showCitationTab('safety-${supplement.id}')" 
                            class="citation-tab-btn py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
                        Safety Data (${safety.length})
                    </button>
                </nav>
            </div>
            
            <!-- Tab Content -->
            <div id="mechanisms-${supplement.id}" class="citation-tab-content mt-6">
                ${this._generateMechanismsTab(mechanisms)}
            </div>
            <div id="benefits-${supplement.id}" class="citation-tab-content mt-6 hidden">
                ${this._generateBenefitsTab(benefits)}
            </div>
            <div id="safety-${supplement.id}" class="citation-tab-content mt-6 hidden">
                ${this._generateSafetyTab(safety)}
            </div>
        `;
    }

    /**
     * Generate basic content for non-enhanced supplements
     * @private
     */
    _generateBasicContent(supplement) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold mb-4">Primary Benefits</h3>
                    <div class="mb-6">
                        <h4 class="font-medium text-gray-700 mb-2">Cognitive Benefits:</h4>
                        <div class="flex flex-wrap gap-2">
                            ${supplement.primaryBenefits.cognitive.map(benefit => 
                                `<span class="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">${benefit}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="mb-6">
                        <h4 class="font-medium text-gray-700 mb-2">Non-Cognitive Benefits:</h4>
                        <div class="flex flex-wrap gap-2">
                            ${supplement.primaryBenefits.nonCognitive.map(benefit => 
                                `<span class="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">${benefit}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                <div>
                    <h3 class="text-xl font-semibold mb-4">Dosage & Safety</h3>
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-medium text-gray-700">Recommended Dosage:</h4>
                            <p class="text-gray-600">${supplement.dosageRange}</p>
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-700">Optimal Duration:</h4>
                            <p class="text-gray-600">${supplement.optimalDuration}</p>
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-700">Safety Rating:</h4>
                            <p class="text-gray-600">${supplement.safetyProfile.rating}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('supplementModal');
        modal.classList.add('hidden');
    }

    /**
     * Generate mechanisms tab content
     * @private
     */
    _generateMechanismsTab(mechanisms) {
        if (!mechanisms || mechanisms.length === 0) {
            return '<p class="text-gray-500">No mechanism-specific citations available.</p>';
        }
        
        return `
            <h4 class="text-lg font-semibold mb-4">Mechanism-Specific Citations</h4>
            ${mechanisms.map(mechanism => `
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="text-lg font-medium text-gray-900">${mechanism.mechanism || mechanism.title || "Mechanism of action"}</h5>
                        <div class="flex space-x-2">
                            <span class="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                ${mechanism.strength} Evidence
                            </span>
                            <span class="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                ${mechanism.mechanismType || "Neurotransmitter modulation"}
                            </span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-3"><strong>Target:</strong> ${mechanism.tissueTarget || mechanism.target || "Neural tissue"}</p>
                    
                    <div class="space-y-3">
                        ${mechanism.evidence.map(citation => `
                            <div class="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                                <h6 class="font-medium text-gray-900 mb-1">${citation.title}</h6>
                                <p class="text-sm text-gray-600 mb-1">
                                    ${citation.authors.join(', ')} (${citation.year})
                                </p>
                                <p class="text-sm text-gray-700 mb-2">${citation.findings}</p>
                                <div class="flex space-x-4 text-xs text-gray-500">
                                    <span>${citation.journal}</span>
                                    <span>PMID: ${citation.pmid || 'N/A'}</span>
                                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">${citation.evidenceLevel}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    /**
     * Generate benefits tab content
     * @private
     */
    _generateBenefitsTab(benefits) {
        if (!benefits || benefits.length === 0) {
            return '<p class="text-gray-500">No benefit-specific citations available.</p>';
        }
        
        return `
            <h4 class="text-lg font-semibold mb-4">Clinical Benefits Evidence</h4>
            ${benefits.map(benefit => `
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="text-lg font-medium text-gray-900">${benefit.healthDomain}</h5>
                        <div class="flex space-x-2">
                            <span class="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                ${benefit.strength} Evidence
                            </span>
                            <span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                ${benefit.evidenceQuality} Quality
                            </span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-700 mb-3"><strong>Claim:</strong> ${benefit.specificClaim}</p>
                    <p class="text-sm text-gray-600 mb-3"><strong>Status:</strong> ${benefit.replicationStatus}</p>
                    
                    <div class="space-y-3">
                        ${benefit.evidence.map(citation => `
                            <div class="bg-gray-50 p-3 rounded border-l-4 border-green-400">
                                <h6 class="font-medium text-gray-900 mb-1">${citation.title}</h6>
                                <p class="text-sm text-gray-600 mb-1">
                                    ${citation.authors.join(', ')} (${citation.year})
                                </p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                                    <div><strong>Study Type:</strong> ${citation.studyType}</div>
                                    <div><strong>Sample Size:</strong> ${citation.sampleSize || 'N/A'}</div>
                                    <div><strong>Duration:</strong> ${citation.duration || 'N/A'}</div>
                                    <div><strong>Dosage:</strong> ${citation.dosage || 'N/A'}</div>
                                </div>
                                ${citation.results ? `
                                    <div class="mt-2">
                                        <strong>Key Results:</strong>
                                        <ul class="text-sm text-gray-700 ml-4 mt-1">
                                            ${Object.entries(citation.results.primaryEndpoint || {}).map(([key, value]) => 
                                                `<li>• ${key}: ${value}</li>`
                                            ).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                <div class="flex space-x-4 text-xs text-gray-500 mt-2">
                                    <span>${citation.journal}</span>
                                    <span>PMID: ${citation.pmid || 'N/A'}</span>
                                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded">${citation.evidenceLevel}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${benefit.metaAnalysisSupport ? `
                        <div class="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                            <h6 class="font-medium text-blue-900 mb-2">Meta-Analysis Support</h6>
                            <p class="text-sm text-blue-800 mb-1">${benefit.metaAnalysisSupport.title}</p>
                            <p class="text-sm text-blue-700">
                                ${benefit.metaAnalysisSupport.studiesIncluded} studies, ${benefit.metaAnalysisSupport.totalParticipants} participants
                            </p>
                            <p class="text-sm text-blue-700 mt-1">${benefit.metaAnalysisSupport.conclusion}</p>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        `;
    }

    /**
     * Generate safety tab content
     * @private
     */
    _generateSafetyTab(safety) {
        if (!safety || safety.length === 0) {
            return '<p class="text-gray-500">No safety-specific citations available.</p>';
        }
        
        return `
            <h4 class="text-lg font-semibold mb-4">Safety Evidence</h4>
            ${safety.map(safetyItem => `
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="text-lg font-medium text-gray-900">${safetyItem.safetyAspect}</h5>
                        <span class="px-2 py-1 rounded text-xs ${safetyItem.riskLevel === 'Low' ? 'bg-green-100 text-green-800' : 
                            safetyItem.riskLevel === 'Low-Moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                            ${safetyItem.riskLevel} Risk
                        </span>
                    </div>
                    <p class="text-sm text-gray-700 mb-3"><strong>Assessment:</strong> ${safetyItem.claim}</p>
                    
                    <div class="space-y-3">
                        ${safetyItem.evidence.map(citation => `
                            <div class="bg-gray-50 p-3 rounded border-l-4 border-yellow-400">
                                <h6 class="font-medium text-gray-900 mb-1">${citation.title}</h6>
                                <p class="text-sm text-gray-600 mb-1">
                                    ${citation.authors.join(', ')} (${citation.year})
                                </p>
                                
                                ${citation.adverseEvents ? `
                                    <div class="mt-2">
                                        <strong>Adverse Events:</strong>
                                        <ul class="text-sm text-gray-700 ml-4 mt-1">
                                            ${citation.adverseEvents.map(ae => 
                                                `<li>• ${ae.event}: ${ae.frequency} (${ae.severity})</li>`
                                            ).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                
                                ${citation.interactionAnalysis ? `
                                    <div class="mt-2">
                                        <strong>Drug Interactions:</strong>
                                        <div class="text-sm text-gray-700 ml-4 mt-1">
                                            ${Object.entries(citation.interactionAnalysis).map(([drug, info]) => 
                                                `<div>• <strong>${drug}:</strong> ${info.interactionType} - ${info.recommendation}</div>`
                                            ).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="flex space-x-4 text-xs text-gray-500 mt-2">
                                    <span>${citation.journal}</span>
                                    <span>PMID: ${citation.pmid || 'N/A'}</span>
                                    <span>Population: ${citation.safetyPopulation || 'General'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    /**
     * Show specific citation tab
     */
    showCitationTab(tabId) {
        // Hide all tab contents
        const allTabs = document.querySelectorAll('.citation-tab-content');
        allTabs.forEach(tab => tab.classList.add('hidden'));
        
        // Remove active class from all tab buttons
        const allBtns = document.querySelectorAll('.citation-tab-btn');
        allBtns.forEach(btn => {
            btn.classList.remove('active-tab', 'border-purple-500', 'text-purple-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
            
            // Update button styling
            const btnText = tabId.split('-')[0];
            const activeBtn = Array.from(allBtns).find(btn => 
                btn.textContent.toLowerCase().includes(btnText)
            );
            if (activeBtn) {
                activeBtn.classList.add('active-tab', 'border-purple-500', 'text-purple-600');
                activeBtn.classList.remove('border-transparent', 'text-gray-500');
            }
        }
    }

    /**
     * Filter supplements with performance tracking
     */
    async filterSupplements() {
        const startTime = performance.now();
        
        try {
            const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
            const evidenceTier = document.getElementById('evidenceTierFilter')?.value || '';
            const category = document.getElementById('categoryFilter')?.value || '';
            const healthDomain = document.getElementById('healthDomainFilter')?.value || '';
            const safetyRating = document.getElementById('safetyFilter')?.value || '';
            
            this.filteredSupplements = this.supplements.filter(supplement => {
                // Search term filter
                const matchesSearch = !searchTerm || 
                    supplement.name.toLowerCase().includes(searchTerm) ||
                    supplement.scientificName.toLowerCase().includes(searchTerm) ||
                    supplement.category.toLowerCase().includes(searchTerm) ||
                    supplement.commonNames.some(name => name.toLowerCase().includes(searchTerm)) ||
                    supplement.primaryBenefits.cognitive.some(benefit => benefit.toLowerCase().includes(searchTerm)) ||
                    supplement.primaryBenefits.nonCognitive.some(benefit => benefit.toLowerCase().includes(searchTerm)) ||
                    supplement.mechanismsOfAction.some(mechanism => mechanism.toLowerCase().includes(searchTerm));
                
                // Evidence tier filter
                const matchesEvidenceTier = !evidenceTier || supplement.evidenceTier.toString() === evidenceTier;
                
                // Category filter
                const matchesCategory = !category || supplement.category === category;
                
                // Health domain filter
                const matchesHealthDomain = !healthDomain || 
                    supplement.primaryBenefits.cognitive.some(benefit => 
                        this._getHealthDomainForBenefit(benefit) === healthDomain) ||
                    supplement.primaryBenefits.nonCognitive.some(benefit => 
                        this._getHealthDomainForBenefit(benefit) === healthDomain);
                
                // Safety rating filter
                const matchesSafety = !safetyRating || supplement.safetyProfile.rating === safetyRating;
                
                return matchesSearch && matchesEvidenceTier && matchesCategory && matchesHealthDomain && matchesSafety;
            });
            
            await this._renderSupplements();
            this._updateResultsCount();
            
            const filterTime = performance.now() - startTime;
            this.metrics.filterTimes.push(filterTime);
            
        } catch (error) {
            console.error('Error filtering supplements:', error);
            throw error;
        }
    }

    /**
     * Show supplement details with enhanced citations
     */
    async showSupplementDetails(id) {
        const startTime = performance.now();
        
        try {
            const supplement = this.supplements.find(s => s.id === id);
            if (!supplement) {
                throw new Error(`Supplement with ID ${id} not found`);
            }
            
            const modal = document.getElementById('supplementModal');
            const modalContent = modal.querySelector('.p-6');
            
            if (!modal || !modalContent) {
                throw new Error('Modal elements not found');
            }
            
            // Show loading state
            modalContent.innerHTML = this.templateSystem.render('skeleton');
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            // Load enhanced citations if available
            let citationHTML = '';
            if (supplement.enhancedCitations?.isEnhanced) {
                try {
                    const citationData = await this.citationLoader.loadEnhancedCitations(supplement.id);
                    if (citationData) {
                        citationHTML = await this.citationRenderer.renderEnhancedCitations(supplement, citationData);
                    } else {
                        citationHTML = this._renderBasicCitations(supplement);
                    }
                } catch (citationError) {
                    console.error('Failed to load enhanced citations:', citationError);
                    citationHTML = this._renderBasicCitations(supplement);
                }
            } else {
                citationHTML = this._renderBasicCitations(supplement);
            }
            
            // Render complete modal content
            modalContent.innerHTML = this._generateModalContent(supplement, citationHTML);
            
            const loadTime = performance.now() - startTime;
            this.metrics.loadTimes.push(loadTime);
            
            console.log(`Modal loaded for ${supplement.name} in ${loadTime.toFixed(2)}ms`);
            
        } catch (error) {
            this.errorBoundaries.modal.execute(
                () => { throw error; },
                `Show supplement details: ${id}`
            );
        }
    }

    /**
     * Generate modal content using template system
     * @private
     */
    _generateModalContent(supplement, citationHTML) {
        // Use template system for consistent modal rendering
        return `
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">${supplement.name}</h2>
                    <p class="text-lg text-gray-600 italic">${supplement.scientificName}</p>
                    <div class="flex items-center mt-2 space-x-3">
                        <span class="tier-badge ${this._getTierClass(supplement.evidenceTier)} text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Evidence Tier ${supplement.evidenceTier}
                        </span>
                        <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            ${supplement.category}
                        </span>
                    </div>
                </div>
                <button onclick="app.closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold mb-4">Primary Benefits</h3>
                    <div class="mb-6">
                        <h4 class="font-medium text-gray-700 mb-2">Cognitive Benefits:</h4>
                        <ul class="list-disc list-inside text-gray-600 space-y-1">
                            ${supplement.primaryBenefits.cognitive.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="mb-6">
                        <h4 class="font-medium text-gray-700 mb-2">Other Health Benefits:</h4>
                        <ul class="list-disc list-inside text-gray-600 space-y-1">
                            ${supplement.primaryBenefits.nonCognitive.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <h3 class="text-xl font-semibold mb-4">Dosage & Duration</h3>
                    <div class="bg-gray-50 p-4 rounded-lg mb-6">
                        <p class="font-medium text-gray-700 mb-2">Recommended Dosage:</p>
                        <p class="text-gray-600 mb-3">${supplement.dosageRange}</p>
                        <p class="font-medium text-gray-700 mb-2">Optimal Duration:</p>
                        <p class="text-gray-600">${supplement.optimalDuration}</p>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold mb-4">Evidence & Research</h3>
                    <div class="mb-6">
                        <p class="text-gray-600 mb-3">${supplement.evidenceTierRationale}</p>
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h4 class="font-medium text-blue-800 mb-2">Study Populations:</h4>
                            <ul class="list-disc list-inside text-blue-700 space-y-1">
                                ${supplement.studyPopulations.map(pop => `<li>${pop}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <h3 class="text-xl font-semibold mb-4">Mechanisms of Action</h3>
                    <ul class="list-disc list-inside text-gray-600 space-y-1 mb-6">
                        ${supplement.mechanismsOfAction.map(mechanism => `<li>${mechanism}</li>`).join('')}
                    </ul>
                    
                    <h3 class="text-xl font-semibold mb-4">Safety Profile</h3>
                    <div class="bg-yellow-50 p-4 rounded-lg mb-6">
                        <div class="flex items-center mb-2">
                            <span class="font-medium text-gray-700">Safety Rating:</span>
                            <span class="ml-2 px-2 py-1 rounded text-sm font-medium ${this._getSafetyColor(supplement.safetyProfile.rating)}">
                                ${supplement.safetyProfile.rating}
                            </span>
                        </div>
                        <div class="mb-3">
                            <p class="font-medium text-gray-700 mb-1">Common Side Effects:</p>
                            <p class="text-gray-600">${supplement.safetyProfile.commonSideEffects.join(', ')}</p>
                        </div>
                        <div class="mb-3">
                            <p class="font-medium text-gray-700 mb-1">Contraindications:</p>
                            <p class="text-gray-600">${supplement.safetyProfile.contraindications.join(', ')}</p>
                        </div>
                        <div>
                            <p class="font-medium text-gray-700 mb-1">Drug Interactions:</p>
                            <p class="text-gray-600">${supplement.safetyProfile.drugInteractions.join(', ')}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            ${citationHTML}
            
            <div class="mt-8 flex space-x-4">
                <button onclick="app.toggleFavorite(${supplement.id})" 
                        class="px-6 py-3 ${this.favorites.includes(supplement.id) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} rounded-lg font-medium hover:bg-opacity-80 transition-colors">
                    <i class="fas fa-heart mr-2"></i>
                    ${this.favorites.includes(supplement.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                <button onclick="app.addToComparison(${supplement.id})" 
                        class="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
                    <i class="fas fa-balance-scale mr-2"></i>Add to Comparison
                </button>
            </div>
        `;

        // Actually show the modal
        const modal = document.getElementById('supplementModal');
        const modalContent = modal.querySelector('.p-6');

        if (modal && modalContent) {
            modalContent.innerHTML = modalHTML;
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            const loadTime = performance.now() - startTime;
            console.log(`Modal loaded for ${supplement.name} in ${loadTime.toFixed(2)}ms`);
        } else {
            console.error('❌ Modal elements not found');
        }

    } catch (error) {
        console.error('❌ Error showing supplement details:', error);
        this.errorBoundary.handleError(error, 'showSupplementDetails', { supplementId: id });
    }

    /**
     * Render basic citations fallback
     * @private
     */
    _renderBasicCitations(supplement) {
        return `
            <div class="mt-8">
                <h3 class="text-xl font-semibold mb-4">Key Citations</h3>
                <div class="space-y-2">
                    ${supplement.keyCitations.map(citation => `
                        <div class="bg-gray-50 p-3 rounded">
                            <p class="font-medium text-gray-800">${citation.title}</p>
                            <p class="text-sm text-gray-600">${citation.authors} (${citation.year})</p>
                            ${citation.doi ? `<p class="text-xs text-blue-600">DOI: ${citation.doi}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Initialize enhanced citations asynchronously
     * @private
     */
    async _initializeEnhancedCitations() {
        try {
            await this._loadAndAttachEnhancedCitations();
        } catch (error) {
            console.error('❌ Failed to initialize enhanced citations:', error);
        }
    }

    /**
     * Load enhanced citations first, then attach to supplement objects
     * @private
     */
    async _loadAndAttachEnhancedCitations() {
        try {
            // Step 1: Load all enhanced citation files into window.enhancedCitations
            console.log('🔄 Step 1: Loading enhanced citation files...');
            const loadResults = await this.enhancedCitationLoader.loadAllEnhancedCitations();

            console.log(`📊 Enhanced citation loading results:`);
            console.log(`   📁 Total files: ${loadResults.totalFiles}`);
            console.log(`   ✅ Loaded: ${loadResults.loaded}`);
            console.log(`   ❌ Failed: ${loadResults.failed}`);

            if (loadResults.errors.length > 0) {
                console.log(`   🔍 Errors:`, loadResults.errors.slice(0, 3));
                if (loadResults.errors.length > 3) {
                    console.log(`   ... and ${loadResults.errors.length - 3} more errors`);
                }
            }

            // Step 2: Attach enhanced citations to supplement objects
            console.log('🔄 Step 2: Attaching enhanced citations to supplements...');
            const attachResults = await this.enhancedCitationAttacher.attachEnhancedCitations(this.supplements);

            console.log(`🔗 Enhanced citation attachment results:`);
            console.log(`   📊 Total supplements: ${attachResults.totalSupplements}`);
            console.log(`   ✅ Enhanced attached: ${attachResults.enhancedAttached}`);
            console.log(`   ❌ Errors: ${attachResults.errors.length}`);

            if (attachResults.enhancedAttached > 0) {
                console.log(`📋 Enhanced supplements:`, attachResults.attachedSupplements.slice(0, 5).map(s => s.name));
                if (attachResults.attachedSupplements.length > 5) {
                    console.log(`   ... and ${attachResults.attachedSupplements.length - 5} more`);
                }
            }

            // Update filtered supplements to reflect changes
            this.filteredSupplements = [...this.supplements];

        } catch (error) {
            console.error('❌ Failed to load and attach enhanced citations:', error);
        }
    }

    /**
     * Attach enhanced citations to supplement objects (legacy method)
     * @private
     */
    async _attachEnhancedCitations() {
        // This method is now replaced by _loadAndAttachEnhancedCitations
        // Keeping for backward compatibility
        return this._loadAndAttachEnhancedCitations();
    }

    // _preloadEnhancedCitations() removed — was redundantly loading ${id}_enhanced.js files
    // via CitationLoader while EnhancedCitationLoader already loads named files.
    // This caused duplicate const declarations when both XX_enhanced.js and XX_name_enhanced.js existed.

    /**
     * Setup performance monitoring
     * @private
     */
    _setupPerformanceMonitoring() {
        // Monitor performance every 30 seconds
        this.performanceMonitorInterval = setInterval(() => {
            const metrics = this._getPerformanceMetrics();
            
            // Log performance warnings
            if (metrics.averageRenderTime > 100) {
                console.warn(`Slow rendering detected: ${metrics.averageRenderTime}ms average`);
            }
            
            if (metrics.memoryUsage?.currentMemoryMB > 100) {
                console.warn(`High memory usage: ${metrics.memoryUsage.currentMemoryMB}MB`);
            }
            
        }, 30000);
    }

    /**
     * Get comprehensive performance metrics
     */
    _getPerformanceMetrics() {
        return {
            renderMetrics: {
                averageRenderTime: this.metrics.renderTimes.length > 0 
                    ? Math.round(this.metrics.renderTimes.reduce((a, b) => a + b, 0) / this.metrics.renderTimes.length)
                    : 0,
                totalRenders: this.metrics.renderTimes.length,
                slowRenders: this.metrics.renderTimes.filter(time => time > 100).length
            },
            citationLoader: this.citationLoader.getPerformanceMetrics(),
            citationRenderer: this.citationRenderer.getPerformanceMetrics(),
            performanceOptimizer: this.performanceOptimizer.getMetrics(),
            templateSystem: this.templateSystem.getMetrics(),
            memoryUsage: this.performanceOptimizer.memoryMonitor.getMetrics(),
            errorBoundaries: window.GlobalErrorManager.getGlobalStats()
        };
    }

    // Utility methods (keeping existing functionality)
    _debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    _getTierClass(tier) {
        const classes = {
            1: 'tier-badge',
            2: 'tier-2',
            3: 'tier-3', 
            4: 'tier-4'
        };
        return classes[tier] || 'tier-4';
    }

    _getSafetyColor(rating) {
        const colors = {
            'Excellent': 'bg-green-100 text-green-800',
            'Good': 'bg-blue-100 text-blue-800',
            'Fair': 'bg-yellow-100 text-yellow-800',
            'Poor': 'bg-red-100 text-red-800'
        };
        return colors[rating] || 'bg-gray-100 text-gray-800';
    }

    _getHealthDomainForBenefit(benefit) {
        const benefitMap = {
            'Memory enhancement': 'Memory Enhancement',
            'Memory support': 'Memory Enhancement',
            'Focus & Attention': 'Focus & Attention',
            'Attention improvement': 'Focus & Attention',
            'Sleep quality': 'Sleep Quality',
            'Sleep enhancement': 'Sleep Quality',
            'Anxiety reduction': 'Anxiety Reduction',
            'Stress management': 'Stress Resilience',
            'Stress reduction': 'Stress Resilience',
            'Mood support': 'Mood Stabilization',
            'Neuroprotection': 'Neuroprotection'
        };
        return benefitMap[benefit] || null;
    }

    // Error handlers
    _handleSupplementGridError(errorRecord) {
        console.log('Supplement grid error logged:', errorRecord);
        // Could send to analytics service here
    }

    _handleModalError(errorRecord) {
        console.log('Modal error logged:', errorRecord);
        this.closeModal();
    }

    _handleComparisonError(errorRecord) {
        console.log('Comparison error logged:', errorRecord);
    }

    _showApplicationError(error) {
        const container = document.getElementById('supplementGrid');
        if (container) {
            try {
                // Try to use template system first
                if (this.templateSystem && this.templateSystem.render) {
                    container.innerHTML = this.templateSystem.render('error', {
                        title: 'Application Error',
                        message: 'The supplement database failed to initialize. Please refresh the page.',
                        showRetry: true,
                        retryAction: 'location.reload()'
                    });
                } else {
                    throw new Error('Template system not available');
                }
            } catch (templateError) {
                // Fallback to pure JavaScript HTML generation
                container.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div class="flex items-center mb-3">
                            <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                            <h3 class="text-lg font-semibold text-red-800">Application Error</h3>
                        </div>
                        <p class="text-red-700 mb-4">The supplement database failed to initialize. Please refresh the page.</p>
                        <button onclick="location.reload()" 
                                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                            Reload Page
                        </button>
                    </div>
                `;
            }
        }
    }

    _updateResultsCount() {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = this.filteredSupplements.length;
        }
    }

    _updateStats() {
        const totalElement = document.getElementById('totalSupplements');
        if (totalElement) {
            totalElement.textContent = this.supplements.length;
        }
    }

    _updateFavoritesCount() {
        const count = this.favorites.length;
        const countElement = document.getElementById('favoritesCount');
        if (countElement) {
            if (count > 0) {
                countElement.textContent = count;
                countElement.classList.remove('hidden');
            } else {
                countElement.classList.add('hidden');
            }
        }
    }

    // Keep existing methods for compatibility
    closeModal() {
        const modal = document.getElementById('supplementModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    toggleFavorite(id) {
        const index = this.favorites.indexOf(id);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(id);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this._updateFavoritesCount();
        this._renderSupplements();
    }

    addToComparison(id) {
        if (this.comparisonList.length >= 3) {
            alert('You can compare up to 3 supplements at a time.');
            return;
        }
        
        if (this.comparisonList.includes(id)) {
            alert('This supplement is already in your comparison list.');
            return;
        }
        
        this.comparisonList.push(id);
        // Additional comparison logic would go here
        
        document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' });
    }

    showFavorites() {
        if (this.favorites.length === 0) {
            alert('You have no favorite supplements yet. Click the heart icon on supplements to add them to your favorites.');
            return;
        }
        
        this.filteredSupplements = this.supplements.filter(s => this.favorites.includes(s.id));
        this._renderSupplements();
        this._updateResultsCount();
        
        document.getElementById('database')?.scrollIntoView({ behavior: 'smooth' });
    }

    exportData() {
        const dataToExport = {
            supplements: this.filteredSupplements,
            favorites: this.favorites.map(id => this.supplements.find(s => s.id === id)).filter(Boolean),
            exportDate: new Date().toISOString(),
            totalSupplements: this.filteredSupplements.length,
            performanceMetrics: this._getPerformanceMetrics()
        };
        
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'supplement-database-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Placeholder methods for other functionality
    sortSupplements() {
        // Implementation would go here
        console.log('Sort supplements called');
    }

    updateComparison() {
        // Implementation would go here
        console.log('Update comparison called');
    }

    /**
     * Clear all filters and show all supplements
     */
    clearFilters() {
        try {
            // Reset all filter inputs
            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');
            const tierFilter = document.getElementById('tierFilter');

            if (searchInput) searchInput.value = '';
            if (categoryFilter) categoryFilter.value = '';
            if (tierFilter) tierFilter.value = '';

            // Reset internal state
            this.currentSearchTerm = '';
            this.currentCategoryFilter = '';
            this.currentTierFilter = '';

            // Apply filters (which will show all supplements)
            this.applyFilters();

            console.log('🔄 All filters cleared');
        } catch (error) {
            console.error('❌ Error clearing filters:', error);
        }
    }

    /**
     * Show advanced filters (placeholder for future implementation)
     */
    showAdvancedFilters() {
        try {
            // For now, just log that this feature is planned
            console.log('🔧 Advanced filters feature coming soon!');

            // Could implement modal with advanced filter options:
            // - Multiple category selection
            // - Evidence quality ranges
            // - Dosage ranges
            // - Interaction warnings
            // - Research date ranges

        } catch (error) {
            console.error('❌ Error showing advanced filters:', error);
        }
    }

    /**
     * Cleanup method for proper resource management
     */
    destroy() {
        try {
            // Clean up performance monitoring interval
            if (this.performanceMonitorInterval) {
                clearInterval(this.performanceMonitorInterval);
            }
            
            // Clean up modern systems
            if (this.performanceOptimizer) {
                this.performanceOptimizer.cleanup();
            }
            if (this.citationLoader) {
                this.citationLoader.clearCache();
            }
            if (this.templateSystem) {
                this.templateSystem.clearCache();
            }
            if (window.GlobalErrorManager) {
                window.GlobalErrorManager.destroy();
            }
            
            // Clear references
            this.supplements = null;
            this.categories = null;
            this.healthDomains = null;
            this.filteredSupplements = null;
            this.favorites = null;
            this.comparisonList = null;
            this.metrics = null;
            
            console.log('Application cleaned up successfully');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

// Export for ES6 modules
export default ModernSupplementDatabase;

// Global app instance
let app;

document.addEventListener('DOMContentLoaded', function() {
    try {
        app = new ModernSupplementDatabase();
        window.app = app; // Make globally available

        // Make filter functions globally accessible for HTML onclick handlers
        window.clearFilters = () => app.clearFilters();
        window.showAdvancedFilters = () => app.showAdvancedFilters();

        console.log('Modernized supplement database loaded successfully');
        
        // Log performance metrics periodically in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setInterval(() => {
                console.log('Performance Metrics:', app._getPerformanceMetrics());
            }, 60000); // Every minute
        }
        
    } catch (error) {
        console.error('Failed to initialize modernized application:', error);
        
        // Fallback: show error message
        const container = document.getElementById('supplementGrid');
        if (container) {
            container.innerHTML = `
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-red-800 mb-2">Application Failed to Load</h3>
                    <p class="text-red-700 mb-4">The supplement database could not be initialized.</p>
                    <button onclick="location.reload()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }
});