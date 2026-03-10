// Main application JavaScript
class SupplementDatabase {
    constructor() {
        this.supplements = supplementDatabase.supplements;
        this.categories = supplementDatabase.categories;
        this.healthDomains = supplementDatabase.healthDomains;
        this.filteredSupplements = [...this.supplements];
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.comparisonList = [];
        
        this.init();
    }
    
    init() {
        this.populateFilters();
        this.renderSupplements();
        this.setupEventListeners();
        this.updateFavoritesCount();
        this.updateStats();
    }
    
    populateFilters() {
        // Populate category filter
        const categoryFilter = document.getElementById('categoryFilter');
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
        
        // Populate health domain filter
        const healthDomainFilter = document.getElementById('healthDomainFilter');
        this.healthDomains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain.name;
            option.textContent = domain.name;
            healthDomainFilter.appendChild(option);
        });
        
        // Populate comparison selects
        ['compareSelect1', 'compareSelect2', 'compareSelect3'].forEach(selectId => {
            const select = document.getElementById(selectId);
            this.supplements.forEach(supplement => {
                const option = document.createElement('option');
                option.value = supplement.id;
                option.textContent = supplement.name;
                select.appendChild(option);
            });
        });
    }
    
    setupEventListeners() {
        // Search input
        document.getElementById('searchInput').addEventListener('input', 
            this.debounce(() => this.filterSupplements(), 300));
        
        // Filter selects
        ['evidenceTierFilter', 'categoryFilter', 'healthDomainFilter', 'safetyFilter'].forEach(filterId => {
            document.getElementById(filterId).addEventListener('change', () => this.filterSupplements());
        });
        
        // Sort select
        document.getElementById('sortBy').addEventListener('change', () => this.sortSupplements());
        
        // Comparison selects
        ['compareSelect1', 'compareSelect2', 'compareSelect3'].forEach(selectId => {
            document.getElementById(selectId).addEventListener('change', () => this.updateComparison());
        });
        
        // Modal close
        document.getElementById('supplementModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });
        
        // Favorites button
        document.getElementById('favoritesBtn').addEventListener('click', () => this.showFavorites());
        
        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
    }
    
    debounce(func, wait) {
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
    
    filterSupplements() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const evidenceTier = document.getElementById('evidenceTierFilter').value;
        const category = document.getElementById('categoryFilter').value;
        const healthDomain = document.getElementById('healthDomainFilter').value;
        const safetyRating = document.getElementById('safetyFilter').value;
        
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
                    this.getHealthDomainForBenefit(benefit) === healthDomain) ||
                supplement.primaryBenefits.nonCognitive.some(benefit => 
                    this.getHealthDomainForBenefit(benefit) === healthDomain);
            
            // Safety rating filter
            const matchesSafety = !safetyRating || supplement.safetyProfile.rating === safetyRating;
            
            return matchesSearch && matchesEvidenceTier && matchesCategory && matchesHealthDomain && matchesSafety;
        });
        
        this.renderSupplements();
        this.updateResultsCount();
    }
    
    getHealthDomainForBenefit(benefit) {
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
    
    sortSupplements() {
        const sortBy = document.getElementById('sortBy').value;
        
        this.filteredSupplements.sort((a, b) => {
            switch (sortBy) {
                case 'evidenceTier':
                    return a.evidenceTier - b.evidenceTier;
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'safetyRating':
                    const safetyOrder = { 'Excellent': 1, 'Good': 2, 'Fair': 3, 'Poor': 4 };
                    return safetyOrder[a.safetyProfile.rating] - safetyOrder[b.safetyProfile.rating];
                default:
                    return 0;
            }
        });
        
        this.renderSupplements();
    }
    
    renderSupplements() {
        const grid = document.getElementById('supplementGrid');
        const noResults = document.getElementById('noResults');
        
        if (this.filteredSupplements.length === 0) {
            grid.classList.add('hidden');
            noResults.classList.remove('hidden');
            return;
        }
        
        grid.classList.remove('hidden');
        noResults.classList.add('hidden');
        
        grid.innerHTML = this.filteredSupplements.map(supplement => this.createSupplementCard(supplement)).join('');
    }
    
    createSupplementCard(supplement) {
        const isFavorite = this.favorites.includes(supplement.id);
        const tierClass = this.getTierClass(supplement.evidenceTier);
        const hasEnhancedCitations = supplement.enhancedCitations && supplement.enhancedCitations.isEnhanced;
        
        return `
            <div class="bg-white rounded-lg shadow-md card-hover p-6 relative">
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
                    ${hasEnhancedCitations ? `
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
            </div>
        `;
    }
    
    getTierClass(tier) {
        switch (tier) {
            case 1: return 'tier-badge';
            case 2: return 'tier-2';
            case 3: return 'tier-3';
            case 4: return 'tier-4';
            default: return 'tier-4';
        }
    }
    
    showSupplementDetails(id) {
        const supplement = this.supplements.find(s => s.id === id);
        if (!supplement) return;
        
        const modal = document.getElementById('supplementModal');
        const modalContent = modal.querySelector('.p-6');
        
        modalContent.innerHTML = `
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">${supplement.name}</h2>
                    <p class="text-lg text-gray-600 italic">${supplement.scientificName}</p>
                    <div class="flex items-center mt-2 space-x-3">
                        <span class="tier-badge ${this.getTierClass(supplement.evidenceTier)} text-white px-3 py-1 rounded-full text-sm font-semibold">
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
                            <span class="ml-2 px-2 py-1 rounded text-sm font-medium ${this.getSafetyColor(supplement.safetyProfile.rating)}">
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
            
            <div class="mt-8">
                <h3 class="text-xl font-semibold mb-4">Commercial Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium text-gray-700 mb-2">Available Forms:</h4>
                        <p class="text-gray-600">${supplement.commercialAvailability.forms.join(', ')}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium text-gray-700 mb-2">Cost Range:</h4>
                        <p class="text-gray-600">${supplement.commercialAvailability.costRange}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium text-gray-700 mb-2">Quality Markers:</h4>
                        <p class="text-gray-600">${supplement.commercialAvailability.qualityMarkers.join(', ')}</p>
                    </div>
                </div>
            </div>
            
            ${supplement.effectSizes ? `
            <div class="mt-8">
                <h3 class="text-xl font-semibold mb-4">Effect Sizes</h3>
                <div class="bg-green-50 p-4 rounded-lg">
                    ${Object.entries(supplement.effectSizes).map(([domain, effect]) => 
                        `<p><strong>${domain}:</strong> ${effect}</p>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
            
            ${this.renderCitationsSection(supplement)}
            
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
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    getSafetyColor(rating) {
        switch (rating) {
            case 'Excellent': return 'bg-green-100 text-green-800';
            case 'Good': return 'bg-blue-100 text-blue-800';
            case 'Fair': return 'bg-yellow-100 text-yellow-800';
            case 'Poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    
    renderCitationsSection(supplement) {
        // Check if supplement has enhanced citations (Phase 2A feature)
        if (supplement.enhancedCitations && supplement.enhancedCitations.isEnhanced) {
            return this.renderEnhancedCitations(supplement);
        } else {
            return this.renderBasicCitations(supplement);
        }
    }
    
    renderBasicCitations(supplement) {
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
    
    renderEnhancedCitations(supplement) {
        const enhanced = supplement.enhancedCitations;
        
        return `
            <div class="mt-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold">Enhanced Citation System</h3>
                    <div class="flex items-center space-x-2">
                        <span class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Phase 2A Enhanced
                        </span>
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            ${enhanced.evidenceProfile.totalCitations} Citations
                        </span>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Quality Score: ${enhanced.evidenceProfile.researchQualityScore}/100
                        </span>
                    </div>
                </div>
                
                <!-- Evidence Profile Summary -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
                    <h4 class="text-lg font-semibold text-gray-900 mb-4">Evidence Profile</h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="text-sm text-gray-600 mb-1">Mechanisms</div>
                            <div class="font-semibold text-${this.getStrengthColor(enhanced.evidenceProfile.evidenceStrength.mechanisms)}">${enhanced.evidenceProfile.evidenceStrength.mechanisms}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm text-gray-600 mb-1">Clinical Benefits</div>
                            <div class="font-semibold text-${this.getStrengthColor(enhanced.evidenceProfile.evidenceStrength.clinicalBenefits)}">${enhanced.evidenceProfile.evidenceStrength.clinicalBenefits}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm text-gray-600 mb-1">Safety</div>
                            <div class="font-semibold text-${this.getStrengthColor(enhanced.evidenceProfile.evidenceStrength.safety)}">${enhanced.evidenceProfile.evidenceStrength.safety}</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm text-gray-600 mb-1">Dosage</div>
                            <div class="font-semibold text-${this.getStrengthColor(enhanced.evidenceProfile.evidenceStrength.dosage)}">${enhanced.evidenceProfile.evidenceStrength.dosage}</div>
                        </div>
                    </div>
                    <div class="mt-4 text-center">
                        <span class="text-sm text-gray-600">Research Maturity: </span>
                        <span class="font-medium">${enhanced.evidenceProfile.researchMaturity}</span>
                        <span class="text-sm text-gray-600 ml-4">Publication Span: </span>
                        <span class="font-medium">${enhanced.evidenceProfile.publicationSpan}</span>
                    </div>
                </div>
                
                <!-- Enhanced Citations Tabs -->
                <div class="border-b border-gray-200">
                    <nav class="flex space-x-8">
                        <button onclick="app.showCitationTab('mechanisms-${supplement.id}')" 
                                class="citation-tab-btn active-tab py-2 px-1 border-b-2 font-medium text-sm">
                            Mechanisms (${enhanced.mechanisms ? enhanced.mechanisms.length : 0})
                        </button>
                        <button onclick="app.showCitationTab('benefits-${supplement.id}')" 
                                class="citation-tab-btn py-2 px-1 border-b-2 font-medium text-sm">
                            Clinical Benefits (${enhanced.benefits ? enhanced.benefits.length : 0})
                        </button>
                        <button onclick="app.showCitationTab('safety-${supplement.id}')" 
                                class="citation-tab-btn py-2 px-1 border-b-2 font-medium text-sm">
                            Safety Data (${enhanced.safety ? enhanced.safety.length : 0})
                        </button>
                    </nav>
                </div>
                
                <!-- Mechanisms Tab -->
                <div id="mechanisms-${supplement.id}" class="citation-tab-content mt-6">
                    <h4 class="text-lg font-semibold mb-4">Mechanism-Specific Citations</h4>
                    ${enhanced.mechanisms ? enhanced.mechanisms.map(mechanism => `
                        <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                            <div class="flex justify-between items-start mb-3">
                                <h5 class="text-lg font-medium text-gray-900">${mechanism.mechanism || mechanism.title || "Mechanism of action"}</h5>
                                <div class="flex space-x-2">
                                    <span class="px-2 py-1 rounded text-xs bg-${this.getStrengthColor(mechanism.strength)}-100 text-${this.getStrengthColor(mechanism.strength)}-800">
                                        ${mechanism.strength} Evidence
                                    </span>
                                    <span class="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                        ${mechanism.mechanismType || "Neurotransmitter modulation"}
                                    </span>
                                </div>
                            </div>
                            <p class="text-sm text-gray-600 mb-3"><strong>Target:</strong> ${mechanism.tissueTarget || mechanism.target || "Neural tissue"}</p>
                            
                            <div class="space-y-3">
                                ${mechanism.evidence.map(study => `
                                    <div class="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                                        <div class="flex justify-between items-start mb-2">
                                            <h6 class="font-medium text-gray-900 text-sm">${study.title}</h6>
                                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${study.evidenceLevel}</span>
                                        </div>
                                        <p class="text-xs text-gray-600 mb-2">${study.authors.join(', ')} (${study.year}) - ${study.journal}</p>
                                        <p class="text-sm text-gray-700 mb-2"><strong>Findings:</strong> ${study.findings}</p>
                                        <p class="text-xs text-gray-600"><strong>Methodology:</strong> ${study.methodology}</p>
                                        ${study.doi ? `<p class="text-xs text-blue-600 mt-1">DOI: <a href="https://doi.org/${study.doi}" target="_blank" class="hover:underline">${study.doi}</a></p>` : ''}
                                        ${study.pmid ? `<p class="text-xs text-green-600">PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/${study.pmid}" target="_blank" class="hover:underline">${study.pmid}</a></p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('') : '<p class="text-gray-600">No mechanism-specific citations available.</p>'}
                </div>
                
                <!-- Benefits Tab -->
                <div id="benefits-${supplement.id}" class="citation-tab-content mt-6 hidden">
                    <h4 class="text-lg font-semibold mb-4">Clinical Benefit Citations</h4>
                    ${enhanced.benefits ? enhanced.benefits.map(benefit => `
                        <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                            <div class="flex justify-between items-start mb-3">
                                <h5 class="text-lg font-medium text-gray-900">${benefit.healthDomain}</h5>
                                <div class="flex space-x-2">
                                    <span class="px-2 py-1 rounded text-xs bg-${this.getStrengthColor(benefit.strength)}-100 text-${this.getStrengthColor(benefit.strength)}-800">
                                        ${benefit.strength} Evidence
                                    </span>
                                    <span class="px-2 py-1 rounded text-xs bg-purple-100 text-purple-600">
                                        ${benefit.evidenceQuality} Quality
                                    </span>
                                </div>
                            </div>
                            <p class="text-sm text-gray-700 mb-3"><strong>Specific Claim:</strong> ${benefit.specificClaim}</p>
                            <p class="text-xs text-gray-600 mb-3"><strong>Replication Status:</strong> ${benefit.replicationStatus}</p>
                            
                            <div class="space-y-3">
                                ${benefit.evidence.map(study => `
                                    <div class="bg-gray-50 p-3 rounded border-l-4 border-green-400">
                                        <div class="flex justify-between items-start mb-2">
                                            <h6 class="font-medium text-gray-900 text-sm">${study.title}</h6>
                                            <div class="flex space-x-1">
                                                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">${study.evidenceLevel}</span>
                                                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${study.studyType}</span>
                                            </div>
                                        </div>
                                        <p class="text-xs text-gray-600 mb-2">${study.authors.join(', ')} (${study.year}) - ${study.journal}</p>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                            <p class="text-xs text-gray-600"><strong>Sample Size:</strong> ${study.sampleSize}</p>
                                            <p class="text-xs text-gray-600"><strong>Duration:</strong> ${study.duration}</p>
                                            <p class="text-xs text-gray-600"><strong>Dosage:</strong> ${study.dosage}</p>
                                            <p class="text-xs text-gray-600"><strong>Design:</strong> ${study.studyDesign}</p>
                                        </div>
                                        ${study.results ? `
                                            <div class="bg-white p-2 rounded mb-2">
                                                <p class="text-xs font-medium text-gray-700 mb-1">Results:</p>
                                                <p class="text-xs text-gray-600"><strong>Effect Size:</strong> ${study.results.effectSize}</p>
                                                <p class="text-xs text-gray-600"><strong>Significance:</strong> ${study.results.pValue}</p>
                                                <p class="text-xs text-gray-600"><strong>Clinical Significance:</strong> ${study.results.clinicalSignificance}</p>
                                            </div>
                                        ` : ''}
                                        <p class="text-xs text-gray-600"><strong>Clinical Relevance:</strong> ${study.clinicalRelevance}</p>
                                        ${study.doi ? `<p class="text-xs text-blue-600 mt-1">DOI: <a href="https://doi.org/${study.doi}" target="_blank" class="hover:underline">${study.doi}</a></p>` : ''}
                                        ${study.pmid ? `<p class="text-xs text-green-600">PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/${study.pmid}" target="_blank" class="hover:underline">${study.pmid}</a></p>` : ''}
                                    </div>
                                `).join('')}
                                
                                ${benefit.metaAnalysisSupport ? `
                                    <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                                        <h6 class="font-medium text-yellow-800 text-sm mb-2">Meta-Analysis Support</h6>
                                        <p class="text-sm font-medium text-gray-900">${benefit.metaAnalysisSupport.title}</p>
                                        <p class="text-xs text-gray-600 mb-2">${benefit.metaAnalysisSupport.authors.join(', ')} (${benefit.metaAnalysisSupport.year})</p>
                                        <p class="text-xs text-gray-700 mb-1"><strong>Studies Included:</strong> ${benefit.metaAnalysisSupport.studiesIncluded} (${benefit.metaAnalysisSupport.totalParticipants} participants)</p>
                                        <p class="text-xs text-gray-700 mb-1"><strong>Pooled Results:</strong> ${benefit.metaAnalysisSupport.pooledResults.overallCognition}</p>
                                        <p class="text-xs text-gray-700"><strong>Conclusion:</strong> ${benefit.metaAnalysisSupport.conclusion}</p>
                                        ${benefit.metaAnalysisSupport.doi ? `<p class="text-xs text-blue-600 mt-1">DOI: <a href="https://doi.org/${benefit.metaAnalysisSupport.doi}" target="_blank" class="hover:underline">${benefit.metaAnalysisSupport.doi}</a></p>` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') : '<p class="text-gray-600">No clinical benefit citations available.</p>'}
                </div>
                
                <!-- Safety Tab -->
                <div id="safety-${supplement.id}" class="citation-tab-content mt-6 hidden">
                    <h4 class="text-lg font-semibold mb-4">Safety & Tolerability Data</h4>
                    ${enhanced.safety ? enhanced.safety.map(safety => `
                        <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                            <div class="flex justify-between items-start mb-3">
                                <h5 class="text-lg font-medium text-gray-900">${safety.safetyAspect}</h5>
                                <span class="px-2 py-1 rounded text-xs bg-${this.getRiskColor(safety.riskLevel)}-100 text-${this.getRiskColor(safety.riskLevel)}-800">
                                    ${safety.riskLevel} Risk
                                </span>
                            </div>
                            <p class="text-sm text-gray-700 mb-3"><strong>Safety Claim:</strong> ${safety.claim}</p>
                            
                            <div class="space-y-3">
                                ${safety.evidence.map(study => `
                                    <div class="bg-gray-50 p-3 rounded border-l-4 border-orange-400">
                                        <h6 class="font-medium text-gray-900 text-sm mb-2">${study.title}</h6>
                                        <p class="text-xs text-gray-600 mb-2">${study.authors.join(', ')} (${study.year})</p>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                            <p class="text-xs text-gray-600"><strong>Population:</strong> ${study.safetyPopulation}</p>
                                            <p class="text-xs text-gray-600"><strong>Duration:</strong> ${study.duration}</p>
                                            <p class="text-xs text-gray-600"><strong>Sample Size:</strong> ${study.sampleSize}</p>
                                            <p class="text-xs text-gray-600"><strong>Serious AEs:</strong> ${study.seriousAdverseEvents}</p>
                                        </div>
                                        ${study.adverseEvents ? `
                                            <div class="bg-white p-2 rounded mb-2">
                                                <p class="text-xs font-medium text-gray-700 mb-1">Adverse Events:</p>
                                                ${study.adverseEvents.map(ae => 
                                                    `<p class="text-xs text-gray-600">• ${ae.event}: ${ae.frequency} (${ae.severity})</p>`
                                                ).join('')}
                                            </div>
                                        ` : ''}
                                        <p class="text-xs text-gray-600"><strong>Conclusion:</strong> ${study.conclusion}</p>
                                        ${study.doi ? `<p class="text-xs text-blue-600 mt-1">DOI: <a href="https://doi.org/${study.doi}" target="_blank" class="hover:underline">${study.doi}</a></p>` : ''}
                                        ${study.pmid ? `<p class="text-xs text-green-600">PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/${study.pmid}" target="_blank" class="hover:underline">${study.pmid}</a></p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('') : '<p class="text-gray-600">No safety-specific citations available.</p>'}
                </div>
            </div>
        `;
    }
    
    getStrengthColor(strength) {
        switch (strength.toLowerCase()) {
            case 'strong': return 'green';
            case 'moderate': return 'yellow';
            case 'limited': case 'weak': return 'orange';
            case 'theoretical': return 'gray';
            case 'well-established': case 'evidence-based': return 'green';
            default: return 'blue';
        }
    }
    
    getRiskColor(risk) {
        switch (risk.toLowerCase()) {
            case 'low': return 'green';
            case 'low-moderate': case 'moderate': return 'yellow';
            case 'high': return 'red';
            default: return 'gray';
        }
    }
    
    showCitationTab(tabId) {
        // Hide all tabs
        document.querySelectorAll('.citation-tab-content').forEach(tab => {
            tab.classList.add('hidden');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.citation-tab-btn').forEach(btn => {
            btn.classList.remove('active-tab', 'border-indigo-500', 'text-indigo-600');
            btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }
        
        // Add active class to clicked button
        event.target.classList.add('active-tab', 'border-indigo-500', 'text-indigo-600');
        event.target.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
    }
    
    closeModal() {
        document.getElementById('supplementModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    toggleFavorite(id) {
        const index = this.favorites.indexOf(id);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(id);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateFavoritesCount();
        this.renderSupplements();
    }
    
    updateFavoritesCount() {
        const count = this.favorites.length;
        const countElement = document.getElementById('favoritesCount');
        if (count > 0) {
            countElement.textContent = count;
            countElement.classList.remove('hidden');
        } else {
            countElement.classList.add('hidden');
        }
    }
    
    showFavorites() {
        if (this.favorites.length === 0) {
            alert('You have no favorite supplements yet. Click the heart icon on supplements to add them to your favorites.');
            return;
        }
        
        this.filteredSupplements = this.supplements.filter(s => this.favorites.includes(s.id));
        this.renderSupplements();
        this.updateResultsCount();
        
        // Scroll to database section
        document.getElementById('database').scrollIntoView({ behavior: 'smooth' });
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
        this.updateComparisonSelects();
        
        // Scroll to compare section
        document.getElementById('compare').scrollIntoView({ behavior: 'smooth' });
    }
    
    updateComparisonSelects() {
        this.comparisonList.forEach((id, index) => {
            const select = document.getElementById(`compareSelect${index + 1}`);
            if (select) {
                select.value = id;
            }
        });
        this.updateComparison();
    }
    
    updateComparison() {
        const selectedIds = [
            document.getElementById('compareSelect1').value,
            document.getElementById('compareSelect2').value,
            document.getElementById('compareSelect3').value
        ].filter(id => id);
        
        if (selectedIds.length < 2) {
            document.getElementById('comparisonTable').classList.add('hidden');
            document.getElementById('comparisonChart').classList.add('hidden');
            return;
        }
        
        const selectedSupplements = selectedIds.map(id => 
            this.supplements.find(s => s.id.toString() === id)
        );
        
        this.renderComparisonTable(selectedSupplements);
        this.renderComparisonChart(selectedSupplements);
        
        document.getElementById('comparisonTable').classList.remove('hidden');
        document.getElementById('comparisonChart').classList.remove('hidden');
    }
    
    renderComparisonTable(supplements) {
        // Update headers
        supplements.forEach((supplement, index) => {
            const header = document.getElementById(`compareHeader${index + 1}`);
            if (header) {
                header.textContent = supplement.name;
            }
        });
        
        // Hide unused headers
        for (let i = supplements.length; i < 3; i++) {
            const header = document.getElementById(`compareHeader${i + 1}`);
            if (header) {
                header.textContent = '';
            }
        }
        
        const tbody = document.getElementById('comparisonTableBody');
        const attributes = [
            { key: 'evidenceTier', label: 'Evidence Tier', format: (val) => `Tier ${val}` },
            { key: 'category', label: 'Category' },
            { key: 'dosageRange', label: 'Dosage Range' },
            { key: 'optimalDuration', label: 'Duration' },
            { key: 'safetyProfile.rating', label: 'Safety Rating' },
            { key: 'commercialAvailability.costRange', label: 'Cost Range' }
        ];
        
        tbody.innerHTML = attributes.map(attr => `
            <tr class="border-b">
                <td class="p-4 font-medium text-gray-700">${attr.label}</td>
                ${supplements.map(supplement => {
                    let value = this.getNestedProperty(supplement, attr.key);
                    if (attr.format) {
                        value = attr.format(value);
                    }
                    return `<td class="p-4 text-gray-600">${value || 'N/A'}</td>`;
                }).join('')}
                ${Array(3 - supplements.length).fill('<td class="p-4"></td>').join('')}
            </tr>
        `).join('');
    }
    
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }
    
    renderComparisonChart(supplements) {
        const ctx = document.getElementById('evidenceChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.comparisonChart) {
            window.comparisonChart.destroy();
        }
        
        window.comparisonChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Evidence Strength', 'Safety Rating', 'Cost Effectiveness', 'Commercial Availability'],
                datasets: supplements.map((supplement, index) => ({
                    label: supplement.name,
                    data: [
                        5 - supplement.evidenceTier, // Invert so higher is better
                        this.getSafetyScore(supplement.safetyProfile.rating),
                        this.getCostScore(supplement.commercialAvailability.costRange),
                        supplement.commercialAvailability.forms.length
                    ],
                    borderColor: this.getChartColor(index),
                    backgroundColor: this.getChartColor(index, 0.2),
                    pointBackgroundColor: this.getChartColor(index),
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.getChartColor(index)
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
    }
    
    getSafetyScore(rating) {
        const scores = { 'Excellent': 5, 'Good': 4, 'Fair': 3, 'Poor': 2 };
        return scores[rating] || 1;
    }
    
    getCostScore(costRange) {
        // Extract numeric value from cost range and invert (lower cost = higher score)
        const match = costRange.match(/\$(\d+)/);
        if (match) {
            const cost = parseInt(match[1]);
            if (cost < 15) return 5;
            if (cost < 25) return 4;
            if (cost < 35) return 3;
            if (cost < 45) return 2;
            return 1;
        }
        return 3; // Default
    }
    
    getChartColor(index, alpha = 1) {
        const colors = [
            `rgba(99, 102, 241, ${alpha})`, // Indigo
            `rgba(16, 185, 129, ${alpha})`, // Green
            `rgba(245, 158, 11, ${alpha})`, // Yellow
        ];
        return colors[index % colors.length];
    }
    
    updateResultsCount() {
        document.getElementById('resultsCount').textContent = this.filteredSupplements.length;
    }
    
    updateStats() {
        document.getElementById('totalSupplements').textContent = this.supplements.length;
    }
    
    exportData() {
        const dataToExport = {
            supplements: this.filteredSupplements,
            favorites: this.favorites.map(id => this.supplements.find(s => s.id === id)),
            exportDate: new Date().toISOString(),
            totalSupplements: this.filteredSupplements.length
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
}

// Dosage Calculator Functions
function calculateRecommendations() {
    const age = parseInt(document.getElementById('userAge').value);
    const weight = parseInt(document.getElementById('userWeight').value);
    const sex = document.getElementById('userSex').value;
    const activityLevel = document.getElementById('activityLevel').value;
    const healthGoals = Array.from(document.querySelectorAll('.health-goal:checked')).map(cb => cb.value);
    
    if (!age || !weight || !sex || !activityLevel || healthGoals.length === 0) {
        alert('Please fill in all fields and select at least one health goal.');
        return;
    }
    
    const recommendations = generateRecommendations(age, weight, sex, activityLevel, healthGoals);
    displayRecommendations(recommendations);
}

function generateRecommendations(age, weight, sex, activityLevel, healthGoals) {
    const recommendations = [];
    
    // Goal-based supplement recommendations
    const goalSupplementMap = {
        memory: ['Bacopa monnieri', 'Creatine', 'Omega-3 Fatty Acids'],
        focus: ['L-Theanine', 'Rhodiola rosea', 'Bacopa monnieri'],
        sleep: ['Melatonin', 'Magnesium'],
        anxiety: ['Ashwagandha', 'L-Theanine', 'Magnesium'],
        stress: ['Ashwagandha', 'Rhodiola rosea', 'Magnesium'],
        mood: ['Omega-3 Fatty Acids', 'Vitamin D3', 'Turmeric/Curcumin'],
        neuroprotection: ['Turmeric/Curcumin', 'Omega-3 Fatty Acids', 'Vitamin D3']
    };
    
    const recommendedSupplements = new Set();
    healthGoals.forEach(goal => {
        if (goalSupplementMap[goal]) {
            goalSupplementMap[goal].forEach(supplement => recommendedSupplements.add(supplement));
        }
    });
    
    recommendedSupplements.forEach(supplementName => {
        const supplement = app.supplements.find(s => s.name === supplementName);
        if (supplement) {
            const personalizedDosage = calculatePersonalizedDosage(supplement, age, weight, sex, activityLevel);
            recommendations.push({
                supplement: supplement,
                personalizedDosage: personalizedDosage,
                relevantGoals: healthGoals.filter(goal => 
                    goalSupplementMap[goal] && goalSupplementMap[goal].includes(supplementName)
                )
            });
        }
    });
    
    return recommendations.sort((a, b) => a.supplement.evidenceTier - b.supplement.evidenceTier);
}

function calculatePersonalizedDosage(supplement, age, weight, sex, activityLevel) {
    // This is a simplified personalization algorithm
    // In practice, this would be much more sophisticated
    
    let baseDosage = supplement.dosageRange;
    let adjustmentFactor = 1.0;
    
    // Age adjustments
    if (age > 65) adjustmentFactor *= 0.8; // Lower for elderly
    if (age < 25) adjustmentFactor *= 1.1; // Slightly higher for young adults
    
    // Weight adjustments (for certain supplements)
    if (weight > 80) adjustmentFactor *= 1.1;
    if (weight < 60) adjustmentFactor *= 0.9;
    
    // Activity level adjustments
    if (activityLevel === 'active') adjustmentFactor *= 1.1;
    if (activityLevel === 'sedentary') adjustmentFactor *= 0.9;
    
    return {
        original: baseDosage,
        personalized: `${baseDosage} (${adjustmentFactor > 1 ? 'consider upper range' : adjustmentFactor < 1 ? 'consider lower range' : 'standard range'})`,
        adjustmentFactor: adjustmentFactor
    };
}

function displayRecommendations(recommendations) {
    const resultsDiv = document.getElementById('recommendationsResults');
    const listDiv = document.getElementById('recommendationsList');
    
    if (recommendations.length === 0) {
        listDiv.innerHTML = '<p class="text-gray-600">No specific recommendations found for your profile.</p>';
        resultsDiv.classList.remove('hidden');
        return;
    }
    
    listDiv.innerHTML = recommendations.map(rec => `
        <div class="bg-white border rounded-lg p-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="text-lg font-semibold text-gray-900">${rec.supplement.name}</h4>
                    <p class="text-sm text-gray-600">${rec.supplement.scientificName}</p>
                    <span class="tier-badge ${app.getTierClass(rec.supplement.evidenceTier)} text-white text-xs px-2 py-1 rounded-full font-semibold mt-2 inline-block">
                        Evidence Tier ${rec.supplement.evidenceTier}
                    </span>
                </div>
                <button onclick="app.showSupplementDetails(${rec.supplement.id})" 
                        class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View Details →
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <h5 class="font-medium text-gray-700 mb-2">Personalized Dosage:</h5>
                    <p class="text-gray-600 text-sm">${rec.personalizedDosage.personalized}</p>
                </div>
                <div>
                    <h5 class="font-medium text-gray-700 mb-2">Relevant for Your Goals:</h5>
                    <div class="flex flex-wrap gap-1">
                        ${rec.relevantGoals.map(goal => 
                            `<span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">${goal}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            
            <div class="bg-yellow-50 p-3 rounded text-sm">
                <p class="text-yellow-800">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    <strong>Important:</strong> Consult with a healthcare provider before starting any supplement regimen, especially if you have medical conditions or take medications.
                </p>
            </div>
        </div>
    `).join('');
    
    resultsDiv.classList.remove('hidden');
}

// Utility Functions
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('evidenceTierFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('healthDomainFilter').value = '';
    document.getElementById('safetyFilter').value = '';
    
    app.filteredSupplements = [...app.supplements];
    app.renderSupplements();
    app.updateResultsCount();
}

function showAdvancedFilters() {
    alert('Advanced filters coming soon! This feature will include price range, study duration, sample size, and publication date filters.');
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SupplementDatabase();
});

// Handle responsive navigation
document.addEventListener('DOMContentLoaded', () => {
    // Add mobile menu toggle if needed
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'md:hidden p-2 text-gray-600';
    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Add to navigation if on mobile
    if (window.innerWidth < 768) {
        const nav = document.querySelector('nav .flex');
        if (nav) {
            nav.appendChild(mobileMenuButton);
        }
    }
});