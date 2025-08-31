/**
 * Modular Citation Rendering System
 * Breaks down large rendering functions into focused, reusable components
 */
class CitationRenderer {
    constructor() {
        this.templates = new Map();
        this.performanceObserver = null;
        this.renderMetrics = {
            renderTimes: [],
            templateCacheHits: 0,
            templateCacheMisses: 0
        };
        
        this._initializeTemplates();
        this._setupPerformanceObserver();
    }

    /**
     * Main entry point for rendering enhanced citations
     * Replaces the massive 238-line function with modular approach
     */
    async renderEnhancedCitations(supplement, citationData) {
        const startTime = performance.now();

        try {
            if (!citationData || !citationData.citations) {
                return this._renderFallbackCitations(supplement);
            }

            // Smart format normalization - handles both data structures
            const normalizedData = this._normalizeData(citationData);

            const sections = await Promise.all([
                this._renderEvidenceProfile(normalizedData.evidenceProfile),
                this._renderCitationTabs(supplement.id, normalizedData.citations),
                this._renderMechanisms(supplement.id, normalizedData.citations.mechanisms),
                this._renderBenefits(supplement.id, normalizedData.citations.benefits),
                this._renderSafety(supplement.id, normalizedData.citations.safety)
            ]);

            const html = this._assembleEnhancedCitationHTML(sections);
            
            // Record performance
            const renderTime = performance.now() - startTime;
            this.renderMetrics.renderTimes.push(renderTime);
            
            if (renderTime > 16) { // More than one frame at 60fps
                console.warn(`Slow citation rendering: ${renderTime.toFixed(2)}ms for ${supplement.name}`);
            }
            
            return html;
        } catch (error) {
            console.error('Citation rendering error:', error);
            return this._renderErrorState(supplement, error);
        }
    }

    /**
     * Render evidence profile summary with performance optimization
     * @private
     */
    _renderEvidenceProfile(evidenceProfile) {
        if (!evidenceProfile) return '';
        
        const template = this._getTemplate('evidenceProfile');
        
        return template({
            totalCitations: evidenceProfile.totalCitations || 0,
            qualityScore: evidenceProfile.researchQualityScore || 0,
            mechanisms: evidenceProfile.evidenceStrength?.mechanisms || 'Unknown',
            clinicalBenefits: evidenceProfile.evidenceStrength?.clinicalBenefits || 'Unknown',
            safety: evidenceProfile.evidenceStrength?.safety || 'Unknown',
            dosage: evidenceProfile.evidenceStrength?.dosage || 'Unknown',
            researchMaturity: evidenceProfile.researchMaturity || 'Unknown',
            publicationSpan: evidenceProfile.publicationSpan || 'Unknown',
            strengthColorMap: {
                'Strong': 'green',
                'Moderate': 'yellow', 
                'Limited': 'orange',
                'Weak': 'orange',
                'Well-established': 'green',
                'Evidence-based': 'green'
            }
        });
    }

    /**
     * Render citation navigation tabs
     * @private
     */
    _renderCitationTabs(supplementId, citations) {
        const template = this._getTemplate('citationTabs');
        
        return template({
            supplementId,
            mechanismsCount: citations.mechanisms?.length || 0,
            benefitsCount: citations.benefits?.length || 0,
            safetyCount: citations.safety?.length || 0
        });
    }

    /**
     * Render mechanisms section with lazy loading
     * @private
     */
    _renderMechanisms(supplementId, mechanisms) {
        if (!mechanisms || mechanisms.length === 0) {
            return '<p class="text-gray-600">No mechanism-specific citations available.</p>';
        }

        const template = this._getTemplate('mechanismSection');
        
        return template({
            supplementId,
            mechanisms: mechanisms.map(mechanism => ({
                ...mechanism,
                strengthColor: this._getStrengthColor(mechanism.strength),
                evidence: mechanism.evidence || []
            }))
        });
    }

    /**
     * Render benefits section with meta-analysis support
     * @private
     */
    _renderBenefits(supplementId, benefits) {
        if (!benefits || benefits.length === 0) {
            return '<p class="text-gray-600">No clinical benefit citations available.</p>';
        }

        const template = this._getTemplate('benefitSection');
        
        return template({
            supplementId,
            benefits: benefits.map(benefit => ({
                ...benefit,
                strengthColor: this._getStrengthColor(benefit.strength),
                evidence: benefit.evidence || [],
                hasMetaAnalysis: !!benefit.metaAnalysisSupport
            }))
        });
    }

    /**
     * Render safety section
     * @private
     */
    _renderSafety(supplementId, safety) {
        if (!safety || safety.length === 0) {
            return '<p class="text-gray-600">No safety-specific citations available.</p>';
        }

        const template = this._getTemplate('safetySection');
        
        return template({
            supplementId,
            safety: safety.map(safetyItem => ({
                ...safetyItem,
                riskColor: this._getRiskColor(safetyItem.riskLevel),
                evidence: safetyItem.evidence || []
            }))
        });
    }

    /**
     * Template management with caching
     * @private
     */
    _getTemplate(templateName) {
        if (this.templates.has(templateName)) {
            this.renderMetrics.templateCacheHits++;
            return this.templates.get(templateName);
        }

        this.renderMetrics.templateCacheMisses++;
        const template = this._createTemplate(templateName);
        this.templates.set(templateName, template);
        return template;
    }

    /**
     * Create optimized templates using template literals
     * @private
     */
    _createTemplate(templateName) {
        switch (templateName) {
            case 'evidenceProfile':
                return (data) => `
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Evidence Profile</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            ${this._renderEvidenceStrengthItems(data)}
                        </div>
                        <div class="mt-4 text-center">
                            <span class="text-sm text-gray-600">Research Maturity: </span>
                            <span class="font-medium">${data.researchMaturity}</span>
                            <span class="text-sm text-gray-600 ml-4">Publication Span: </span>
                            <span class="font-medium">${data.publicationSpan}</span>
                        </div>
                    </div>
                `;

            case 'citationTabs':
                return (data) => `
                    <div class="border-b border-gray-200">
                        <nav class="flex space-x-8">
                            <button onclick="app.citationRenderer.showTab('mechanisms-${data.supplementId}')" 
                                    class="citation-tab-btn active-tab py-2 px-1 border-b-2 font-medium text-sm">
                                Mechanisms (${data.mechanismsCount})
                            </button>
                            <button onclick="app.citationRenderer.showTab('benefits-${data.supplementId}')" 
                                    class="citation-tab-btn py-2 px-1 border-b-2 font-medium text-sm">
                                Clinical Benefits (${data.benefitsCount})
                            </button>
                            <button onclick="app.citationRenderer.showTab('safety-${data.supplementId}')" 
                                    class="citation-tab-btn py-2 px-1 border-b-2 font-medium text-sm">
                                Safety Data (${data.safetyCount})
                            </button>
                        </nav>
                    </div>
                `;

            case 'mechanismSection':
                return (data) => `
                    <div id="mechanisms-${data.supplementId}" class="citation-tab-content mt-6">
                        <h4 class="text-lg font-semibold mb-4">Mechanism-Specific Citations</h4>
                        ${data.mechanisms.map(mechanism => this._renderMechanismCard(mechanism)).join('')}
                    </div>
                `;

            case 'benefitSection':
                return (data) => `
                    <div id="benefits-${data.supplementId}" class="citation-tab-content mt-6 hidden">
                        <h4 class="text-lg font-semibold mb-4">Clinical Benefit Citations</h4>
                        ${data.benefits.map(benefit => this._renderBenefitCard(benefit)).join('')}
                    </div>
                `;

            case 'safetySection':
                return (data) => `
                    <div id="safety-${data.supplementId}" class="citation-tab-content mt-6 hidden">
                        <h4 class="text-lg font-semibold mb-4">Safety & Tolerability Data</h4>
                        ${data.safety.map(safetyItem => this._renderSafetyCard(safetyItem)).join('')}
                    </div>
                `;

            default:
                return () => '<div class="text-red-500">Template not found</div>';
        }
    }

    /**
     * Helper methods for specific card rendering
     * @private
     */
    _renderEvidenceStrengthItems(data) {
        const items = ['mechanisms', 'clinicalBenefits', 'safety', 'dosage'];
        return items.map(item => {
            const value = data[item];
            const color = data.strengthColorMap[value] || 'blue';
            return `
                <div class="text-center">
                    <div class="text-sm text-gray-600 mb-1">${this._formatLabel(item)}</div>
                    <div class="font-semibold text-${color}-600">${value}</div>
                </div>
            `;
        }).join('');
    }

    _renderMechanismCard(mechanism) {
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 enhanced-citation-card">
                <div class="flex justify-between items-start mb-3">
                    <h5 class="text-lg font-medium text-gray-900">${mechanism.mechanism}</h5>
                    <div class="flex space-x-2">
                        <span class="px-2 py-1 rounded text-xs bg-${mechanism.strengthColor}-100 text-${mechanism.strengthColor}-800">
                            ${mechanism.strength} Evidence
                        </span>
                        <span class="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            ${mechanism.mechanismType}
                        </span>
                    </div>
                </div>
                <p class="text-sm text-gray-600 mb-3"><strong>Target:</strong> ${mechanism.tissueTarget || mechanism.target || "Neural tissue"}</p>
                <div class="space-y-3">
                    ${mechanism.evidence.map(study => this._renderStudyCard(study, 'blue')).join('')}
                </div>
            </div>
        `;
    }

    _renderBenefitCard(benefit) {
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 enhanced-citation-card">
                <div class="flex justify-between items-start mb-3">
                    <h5 class="text-lg font-medium text-gray-900">${benefit.healthDomain}</h5>
                    <div class="flex space-x-2">
                        <span class="px-2 py-1 rounded text-xs bg-${benefit.strengthColor}-100 text-${benefit.strengthColor}-800">
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
                    ${benefit.evidence.map(study => this._renderStudyCard(study, 'green')).join('')}
                    ${benefit.hasMetaAnalysis ? this._renderMetaAnalysisCard(benefit.metaAnalysisSupport) : ''}
                </div>
            </div>
        `;
    }

    _renderSafetyCard(safetyItem) {
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 enhanced-citation-card">
                <div class="flex justify-between items-start mb-3">
                    <h5 class="text-lg font-medium text-gray-900">${safetyItem.safetyAspect}</h5>
                    <span class="px-2 py-1 rounded text-xs bg-${safetyItem.riskColor}-100 text-${safetyItem.riskColor}-800">
                        ${safetyItem.riskLevel} Risk
                    </span>
                </div>
                <p class="text-sm text-gray-700 mb-3"><strong>Safety Claim:</strong> ${safetyItem.claim}</p>
                <div class="space-y-3">
                    ${safetyItem.evidence.map(study => this._renderStudyCard(study, 'orange')).join('')}
                </div>
            </div>
        `;
    }

    _renderStudyCard(study, borderColor) {
        return `
            <div class="bg-gray-50 p-3 rounded border-l-4 border-${borderColor}-400">
                <div class="flex justify-between items-start mb-2">
                    <h6 class="font-medium text-gray-900 text-sm">${study.title}</h6>
                    <span class="text-xs bg-${borderColor}-100 text-${borderColor}-800 px-2 py-1 rounded">${study.evidenceLevel}</span>
                </div>
                <p class="text-xs text-gray-600 mb-2">${this._safeJoin(study.authors, ', ')} (${study.year}) - ${study.journal}</p>
                ${study.findings ? `<p class="text-sm text-gray-700 mb-2"><strong>Findings:</strong> ${study.findings}</p>` : ''}
                ${study.methodology ? `<p class="text-xs text-gray-600"><strong>Methodology:</strong> ${study.methodology}</p>` : ''}
                ${this._renderStudyLinks(study)}
            </div>
        `;
    }

    _renderStudyLinks(study) {
        let links = '';
        if (study.doi) {
            links += `<p class="text-xs text-blue-600 mt-1">DOI: <a href="https://doi.org/${study.doi}" target="_blank" class="hover:underline">${study.doi}</a></p>`;
        }
        if (study.pmid) {
            links += `<p class="text-xs text-green-600">PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/${study.pmid}" target="_blank" class="hover:underline">${study.pmid}</a></p>`;
        }
        return links;
    }

    _renderMetaAnalysisCard(metaAnalysis) {
        return `
            <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                <h6 class="font-medium text-yellow-800 text-sm mb-2">Meta-Analysis Support</h6>
                <p class="text-sm font-medium text-gray-900">${metaAnalysis.title}</p>
                <p class="text-xs text-gray-600 mb-2">${this._safeJoin(metaAnalysis.authors, ', ')} (${metaAnalysis.year})</p>
                <p class="text-xs text-gray-700 mb-1"><strong>Studies Included:</strong> ${metaAnalysis.studiesIncluded} (${metaAnalysis.totalParticipants} participants)</p>
                <p class="text-xs text-gray-700 mb-1"><strong>Pooled Results:</strong> ${metaAnalysis.pooledResults.overallCognition}</p>
                <p class="text-xs text-gray-700"><strong>Conclusion:</strong> ${metaAnalysis.conclusion}</p>
                ${metaAnalysis.doi ? `<p class="text-xs text-blue-600 mt-1">DOI: <a href="https://doi.org/${metaAnalysis.doi}" target="_blank" class="hover:underline">${metaAnalysis.doi}</a></p>` : ''}
            </div>
        `;
    }

    /**
     * Assemble the complete HTML structure
     * @private
     */
    _assembleEnhancedCitationHTML(sections) {
        const [evidenceProfile, citationTabs, mechanisms, benefits, safety] = sections;
        
        return `
            <div class="mt-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold">Enhanced Citation System</h3>
                    <div class="flex items-center space-x-2">
                        <span class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Phase 2A Enhanced
                        </span>
                    </div>
                </div>
                
                ${evidenceProfile}
                ${citationTabs}
                ${mechanisms}
                ${benefits}
                ${safety}
            </div>
        `;
    }

    /**
     * Fallback for basic citations
     * @private
     */
    _renderFallbackCitations(supplement) {
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
     * Error state rendering
     * @private
     */
    _renderErrorState(supplement, error) {
        return `
            <div class="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-red-800 mb-2">Citation Loading Error</h3>
                <p class="text-red-700 mb-4">Failed to load enhanced citations for ${supplement.name}</p>
                <details class="text-sm text-red-600">
                    <summary class="cursor-pointer">Technical Details</summary>
                    <pre class="mt-2 text-xs">${error.message}</pre>
                </details>
                <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Reload Page
                </button>
            </div>
        `;
    }

    /**
     * Tab switching functionality
     */
    showTab(tabId) {
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
        if (event && event.target) {
            event.target.classList.add('active-tab', 'border-indigo-500', 'text-indigo-600');
            event.target.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        }
    }

    /**
     * Utility methods
     * @private
     */
    _getStrengthColor(strength) {
        const colorMap = {
            'Strong': 'green',
            'Moderate': 'yellow',
            'Limited': 'orange',
            'Weak': 'orange',
            'Theoretical': 'gray',
            'Well-established': 'green',
            'Evidence-based': 'green'
        };
        return colorMap[strength] || 'blue';
    }

    _getRiskColor(risk) {
        const colorMap = {
            'Low': 'green',
            'Low-Moderate': 'yellow',
            'Moderate': 'yellow',
            'High': 'red'
        };
        return colorMap[risk] || 'gray';
    }

    _formatLabel(camelCase) {
        return camelCase.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    /**
     * Performance monitoring setup
     * @private
     */
    _setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name.includes('citation-render')) {
                        this.renderMetrics.renderTimes.push(entry.duration);
                    }
                });
            });
            
            this.performanceObserver.observe({ entryTypes: ['measure'] });
        }
    }

    /**
     * Initialize template cache
     * @private
     */
    _initializeTemplates() {
        // Templates will be lazy-loaded as needed
        console.log('Citation renderer initialized with lazy template loading');
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const avgRenderTime = this.renderMetrics.renderTimes.length > 0
            ? this.renderMetrics.renderTimes.reduce((a, b) => a + b, 0) / this.renderMetrics.renderTimes.length
            : 0;

        return {
            averageRenderTime: Math.round(avgRenderTime),
            totalRenders: this.renderMetrics.renderTimes.length,
            templateCacheHitRate: Math.round(
                (this.renderMetrics.templateCacheHits /
                (this.renderMetrics.templateCacheHits + this.renderMetrics.templateCacheMisses)) * 100
            ) || 0,
            slowRenders: this.renderMetrics.renderTimes.filter(time => time > 16).length
        };
    }

    /**
     * Smart Data Normalization - Handles Multiple Citation Formats
     * Automatically detects and converts different data structures to expected format
     * @private
     */
    _normalizeData(citationData) {
        const normalized = {
            ...citationData,
            citations: {
                mechanisms: this._normalizeMechanisms(citationData.citations?.mechanisms || []),
                benefits: this._normalizeBenefits(citationData.citations?.benefits || []),
                safety: this._normalizeSafety(citationData.citations?.safety || []),
                dosage: this._normalizeDosage(citationData.citations?.dosage || [])
            }
        };

        return normalized;
    }

    /**
     * Normalize mechanisms to expected format
     * @private
     */
    _normalizeMechanisms(mechanisms) {
        if (!Array.isArray(mechanisms)) return [];

        return mechanisms.map(mechanism => ({
            mechanism: mechanism.mechanism || mechanism.mechanismType || "Unknown mechanism",
            mechanismType: mechanism.mechanismType || mechanism.mechanism || "Unknown",
            strength: mechanism.strength || mechanism.evidenceLevel || "Moderate",
            tissueTarget: mechanism.tissueTarget || mechanism.target || "Neural tissue",
            target: mechanism.tissueTarget || mechanism.target || "Neural tissue",
            description: mechanism.description || "",
            evidence: this._normalizeStudies(mechanism.evidence || mechanism.citations || [])
        }));
    }

    /**
     * Normalize benefits to expected format
     * Handles both grouped format and direct study list format
     * @private
     */
    _normalizeBenefits(benefits) {
        if (!Array.isArray(benefits)) return [];

        // Check if this is already in grouped format (has healthDomain, specificClaim, etc.)
        if (benefits.length > 0 && (benefits[0].healthDomain || benefits[0].specificClaim)) {
            // Already in correct format, just ensure required properties
            return benefits.map(benefit => ({
                healthDomain: benefit.healthDomain || "Cognitive Health",
                specificClaim: benefit.specificClaim || benefit.claim || "Health benefit",
                strength: benefit.strength || benefit.evidenceQuality || "Moderate",
                evidenceQuality: benefit.evidenceQuality || benefit.strength || "Moderate",
                replicationStatus: benefit.replicationStatus || "Multiple studies",
                tissueTarget: benefit.tissueTarget || benefit.target || "Central nervous system",
                target: benefit.tissueTarget || benefit.target || "Central nervous system",
                evidence: this._normalizeStudies(benefit.evidence || [])
            }));
        }

        // This is direct study list format - convert to grouped format
        if (benefits.length > 0 && (benefits[0].title || benefits[0].id || benefits[0].claim)) {
            return [{
                healthDomain: "Cognitive Health",
                specificClaim: "Multiple cognitive and health benefits",
                strength: "Strong",
                evidenceQuality: "Strong",
                replicationStatus: "Multiple studies",
                tissueTarget: "Central nervous system",
                target: "Central nervous system",
                evidence: this._normalizeStudies(benefits) // Use all studies as evidence
            }];
        }

        return [];
    }

    /**
     * Normalize safety data to expected format
     * @private
     */
    _normalizeSafety(safety) {
        if (!Array.isArray(safety)) return [];

        // Check if already in grouped format
        if (safety.length > 0 && (safety[0].safetyAspect || safety[0].riskLevel)) {
            return safety.map(safetyItem => ({
                safetyAspect: safetyItem.safetyAspect || "General Safety",
                riskLevel: safetyItem.riskLevel || "Low",
                claim: safetyItem.claim || safetyItem.description || "Generally well tolerated",
                evidence: this._normalizeStudies(safetyItem.evidence || [])
            }));
        }

        // This is direct study list format - convert to grouped format
        if (safety.length > 0 && (safety[0].title || safety[0].id || safety[0].claim)) {
            return [{
                safetyAspect: "General Safety Profile",
                riskLevel: "Low",
                claim: "Well-tolerated with minimal side effects based on clinical studies",
                evidence: this._normalizeStudies(safety) // Use all studies as evidence
            }];
        }

        return [];
    }

    /**
     * Normalize dosage data (optional section)
     * @private
     */
    _normalizeDosage(dosage) {
        if (!Array.isArray(dosage)) return [];
        return dosage; // Dosage format is usually consistent
    }

    /**
     * Normalize individual studies to ensure required properties
     * @private
     */
    _normalizeStudies(studies) {
        if (!Array.isArray(studies)) return [];

        return studies.map(study => {
            // Handle Format C (Melatonin/L-Theanine style with claim, citation, doi)
            if (study.claim && study.citation && !study.title) {
                return {
                    ...study,
                    title: study.claim || "Study finding",
                    authors: this._extractAuthorsFromCitation(study.citation),
                    year: this._extractYearFromCitation(study.citation),
                    evidenceLevel: study.evidenceLevel || study.evidence || this._mapStudyTypeToEvidenceLevel(study.studyType) || "Level 4",
                    findings: study.keyFinding || study.claim || '',
                    doi: study.doi || ''
                };
            }

            // Handle standard formats
            return {
                ...study,
                evidenceLevel: study.evidenceLevel || this._mapStudyTypeToEvidenceLevel(study.studyType) || "Level 4",
                findings: study.findings || this._safeNormalizeKeyFindings(study.keyFindings) || '',
                authors: Array.isArray(study.authors) ? study.authors : [study.authors || 'Unknown authors'],
                title: study.title || study.claim || "Study finding"
            };
        });
    }

    /**
     * Safe join method that handles non-arrays gracefully
     * @private
     */
    _safeJoin(value, separator = ', ') {
        if (!value) return '';

        // If it's already a string, return it
        if (typeof value === 'string') {
            return value;
        }

        // If it's an array, join safely
        if (Array.isArray(value)) {
            try {
                return value.join(separator);
            } catch (error) {
                console.error('Safe join error:', error, 'Value:', value);
                return String(value);
            }
        }

        // If it's an object or other type, convert to string
        return String(value);
    }

    /**
     * Safe normalize keyFindings with comprehensive error handling
     * @private
     */
    _safeNormalizeKeyFindings(keyFindings) {
        try {
            return this._normalizeKeyFindings(keyFindings);
        } catch (error) {
            console.error('KeyFindings normalization error:', error, 'Input:', keyFindings);
            // Fallback: convert to string safely
            if (keyFindings === null || keyFindings === undefined) {
                return '';
            }
            return String(keyFindings);
        }
    }

    /**
     * Normalize keyFindings to handle both arrays and objects
     * @private
     */
    _normalizeKeyFindings(keyFindings) {
        // Comprehensive null/undefined check
        if (keyFindings === null || keyFindings === undefined || keyFindings === '') {
            return '';
        }

        // If it's already a string, return it
        if (typeof keyFindings === 'string') {
            return keyFindings;
        }

        // If it's an array, join with semicolons (with safety check)
        if (Array.isArray(keyFindings)) {
            try {
                return keyFindings.join('; ');
            } catch (error) {
                console.error('Array join error:', error, 'Array:', keyFindings);
                return String(keyFindings);
            }
        }

        // If it's an object, extract meaningful text
        if (typeof keyFindings === 'object') {
            const findings = [];

            // Common patterns in keyFindings objects
            Object.entries(keyFindings).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    findings.push(`${key}: ${value}`);
                } else if (typeof value === 'object' && value !== null) {
                    // Handle nested objects
                    if (value.finding || value.outcome || value.effect || value.result) {
                        findings.push(`${key}: ${value.finding || value.outcome || value.effect || value.result}`);
                    } else if (value.statistics || value.effectSize) {
                        findings.push(`${key}: ${value.statistics || value.effectSize}`);
                    } else {
                        // Fallback: stringify the object
                        findings.push(`${key}: ${JSON.stringify(value)}`);
                    }
                }
            });

            return findings.join('; ');
        }

        // Fallback: stringify whatever it is
        return String(keyFindings);
    }

    /**
     * Map study types to evidence levels
     * @private
     */
    _mapStudyTypeToEvidenceLevel(studyType) {
        const mappings = {
            'systematic_review_meta_analysis': 'Level 1',
            'meta_analysis': 'Level 1',
            'systematic_review': 'Level 2',
            'randomized_controlled_trial': 'Level 2',
            'clinical_trial': 'Level 3',
            'cohort_study': 'Level 3',
            'case_control_study': 'Level 4',
            'mechanistic_review': 'Level 4',
            'mechanistic_study': 'Level 4',
            'comprehensive_review': 'Level 4',
            'review': 'Level 4'
        };
        return mappings[studyType] || 'Level 4';
    }

    /**
     * Extract authors from citation string
     * @private
     */
    _extractAuthorsFromCitation(citation) {
        if (!citation) return ['Unknown authors'];

        // Try to extract first author from citation
        const authorMatch = citation.match(/^([^(]+?)\s*\(/);
        if (authorMatch) {
            const authorPart = authorMatch[1].trim();
            // Handle "Author et al." format
            if (authorPart.includes('et al')) {
                return [authorPart];
            }
            // Handle "Author, A., Author, B." format
            if (authorPart.includes(',')) {
                const authors = authorPart.split(',').map(a => a.trim()).filter(a => a);
                return authors.slice(0, 3); // First 3 authors max
            }
            return [authorPart];
        }

        return ['Unknown authors'];
    }

    /**
     * Extract year from citation string
     * @private
     */
    _extractYearFromCitation(citation) {
        if (!citation) return 'Unknown year';

        // Look for year in parentheses
        const yearMatch = citation.match(/\((\d{4})\)/);
        if (yearMatch) {
            return yearMatch[1];
        }

        // Look for year after author names
        const yearMatch2 = citation.match(/(\d{4})/);
        if (yearMatch2) {
            return yearMatch2[1];
        }

        return 'Unknown year';
    }
}

// Export for use in main application
export default CitationRenderer;
window.CitationRenderer = CitationRenderer;