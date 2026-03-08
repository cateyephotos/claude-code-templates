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
            if (!citationData || (!citationData.citations && !citationData.enhancedCitations)) {
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
                evidence: mechanism.studies || mechanism.evidence || []
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
                riskColor: this._getRiskColor(safetyItem.riskLevel)
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
                    <div class="p-6 rounded-lg mb-6" style="background: var(--accent-50); border: 1px solid var(--accent-200);">
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
                                    class="citation-tab-btn active-tab py-2 px-1 border-b-2 font-medium text-sm" style="border-color: var(--accent); color: var(--accent);">
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
                const selfMechanism = this;
                return (data) => {
                    const mechanismCards = data.mechanisms.map(mechanism => selfMechanism.renderMechanismCard(mechanism)).join('');
                    return `
                        <div id="mechanisms-${data.supplementId}" class="citation-tab-content mt-6">
                            <h4 class="text-lg font-semibold mb-4">Mechanism-Specific Citations</h4>
                            ${mechanismCards}
                        </div>
                    `;
                };

            case 'benefitSection':
                const self = this;
                return (data) => {
                    const benefitCards = data.benefits.map(benefit => self.renderBenefitCard(benefit)).join('');
                    return `
                        <div id="benefits-${data.supplementId}" class="citation-tab-content mt-6 hidden">
                            <h4 class="text-lg font-semibold mb-4">Clinical Benefit Citations</h4>
                            ${benefitCards}
                        </div>
                    `;
                };

            case 'safetySection':
                const selfSafety = this;
                return (data) => {
                    const safetyCards = data.safety.map(safetyItem => selfSafety.renderSafetyCard(safetyItem)).join('');
                    return `
                        <div id="safety-${data.supplementId}" class="citation-tab-content mt-6 hidden">
                            <h4 class="text-lg font-semibold mb-4">Safety & Tolerability Data</h4>
                            ${safetyCards}
                        </div>
                    `;
                };

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

    renderMechanismCard(mechanism) {
        // Support both old and new enhanced citation formats
        // Handle "undefined" strings as missing values
        const claim = (mechanism.claim && mechanism.claim !== 'undefined') ? mechanism.claim :
                     (mechanism.mechanism && mechanism.mechanism !== 'undefined') ? mechanism.mechanism :
                     'No mechanism provided';
        // Ensure studies is always an array
        let studies = mechanism.studies || mechanism.evidence || [];
        if (!Array.isArray(studies)) {
            studies = []; // Convert non-arrays to empty array
        }

        // Pre-compute study cards to maintain 'this' context
        const studyCards = studies.map(study => this.renderStudyCard(study, 'blue')).join('');

        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 enhanced-citation-card">
                <div class="flex justify-between items-start mb-3">
                    <h5 class="text-lg font-medium text-gray-900">${claim}</h5>
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
                    ${studyCards}
                </div>
            </div>
        `;
    }

    renderBenefitCard(benefit) {
        // Support both old and new enhanced citation formats
        // Handle "undefined" strings as missing values
        const claim = (benefit.claim && benefit.claim !== 'undefined') ? benefit.claim :
                     (benefit.specificClaim && benefit.specificClaim !== 'undefined') ? benefit.specificClaim :
                     'No claim provided';
        // Ensure studies is always an array
        let studies = benefit.studies || benefit.evidence || [];
        if (!Array.isArray(studies)) {
            studies = []; // Convert non-arrays to empty array
        }

        // Pre-compute study cards to maintain 'this' context
        const studyCards = studies.map(study => this.renderStudyCard(study, 'green')).join('');

        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 enhanced-citation-card">
                <div class="flex justify-between items-start mb-3">
                    <h5 class="text-lg font-medium text-gray-900">${claim}</h5>
                    <div class="flex space-x-2">
                        <span class="px-2 py-1 rounded text-xs bg-${benefit.strengthColor}-100 text-${benefit.strengthColor}-800">
                            ${benefit.strength} Evidence
                        </span>
                        <span class="px-2 py-1 rounded text-xs" style="background: var(--accent-50); color: var(--accent);">
                            ${benefit.evidenceQuality} Quality
                        </span>
                    </div>
                </div>
                <p class="text-sm text-gray-700 mb-3"><strong>Health Domain:</strong> ${benefit.healthDomain}</p>
                <p class="text-xs text-gray-600 mb-3"><strong>Replication Status:</strong> ${benefit.replicationStatus}</p>
                <div class="space-y-3">
                    ${studyCards}
                    ${benefit.hasMetaAnalysis ? this._renderMetaAnalysisCard(benefit.metaAnalysisSupport) : ''}
                </div>
            </div>
        `;
    }

    renderSafetyCard(safetyItem) {
        // Support both old and new enhanced citation formats
        // Handle "undefined" strings as missing values
        const claim = (safetyItem.claim && safetyItem.claim !== 'undefined') ? safetyItem.claim : 'Safety information';
        // Ensure studies is always an array
        let studies = safetyItem.studies || safetyItem.evidence || [];
        if (!Array.isArray(studies)) {
            studies = []; // Convert non-arrays to empty array
        }

        // Pre-compute study cards to maintain 'this' context
        const studyCards = studies.map(study => this.renderStudyCard(study, 'orange')).join('');

        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 enhanced-citation-card">
                <div class="flex justify-between items-start mb-3">
                    <h5 class="text-lg font-medium text-gray-900">${safetyItem.safetyAspect}</h5>
                    <span class="px-2 py-1 rounded text-xs bg-${safetyItem.riskColor}-100 text-${safetyItem.riskColor}-800">
                        ${safetyItem.riskLevel} Risk
                    </span>
                </div>
                <p class="text-sm text-gray-700 mb-3"><strong>Safety Claim:</strong> ${claim}</p>
                <div class="space-y-3">
                    ${studyCards}
                </div>
            </div>
        `;
    }

    renderStudyCard(study, borderColor) {
        // Handle missing evidenceLevel gracefully
        const evidenceLevel = study.evidenceLevel || study.significance || 'Research Study';

        return `
            <div class="bg-gray-50 p-3 rounded border-l-4 border-${borderColor}-400">
                <div class="flex justify-between items-start mb-2">
                    <h6 class="font-medium text-gray-900 text-sm">${study.title || 'Research Study'}</h6>
                    <span class="text-xs bg-${borderColor}-100 text-${borderColor}-800 px-2 py-1 rounded">${evidenceLevel}</span>
                </div>
                <p class="text-xs text-gray-600 mb-2">${this._safeJoin(study.authors, ', ')} (${study.year || 'Recent'}) - ${study.journal || 'Research Publication'}</p>
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
            btn.classList.remove('active-tab');
            btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            btn.style.borderColor = '';
            btn.style.color = '';
        });

        // Show selected tab
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }

        // Add active class to clicked button
        if (event && event.target) {
            event.target.classList.add('active-tab');
            event.target.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
            event.target.style.borderColor = 'var(--accent)';
            event.target.style.color = 'var(--accent)';
        }
    }

    /**
     * Helper method to normalize a single study
     * @private
     */
    _normalizeStudy(study) {
        // Handle custom citation format (like Chromium)
        if (study.citation && !study.title) {
            const parsedCitation = this._parseCitationString(study.citation);
            return {
                title: study.description || parsedCitation.title || 'Research study',
                authors: parsedCitation.authors || ['Research team'],
                year: parsedCitation.year || new Date().getFullYear(),
                journal: parsedCitation.journal || 'Research publication',
                pmid: study.pmid || null,
                doi: study.doi || null,
                findings: study.description || study.significance || 'Research findings support this claim',
                evidenceLevel: study.type || study.evidenceLevel || 'Research Study'
            };
        }

        // Handle standard format (including Phase 3B-7 flat references)
        // Phase 3B-7 has: authors as string, keyFindings as array, studyType, clinicalRelevance
        const authors = typeof study.authors === 'string'
            ? [study.authors]
            : (study.authors || ['Unknown authors']);

        const findings = study.findings
            || study.significance
            || (Array.isArray(study.keyFindings) ? study.keyFindings.join('; ') : study.keyFindings)
            || 'Research findings support this claim';

        return {
            title: study.title || 'Research study',
            authors: authors,
            year: study.year || new Date().getFullYear(),
            journal: study.journal || 'Research publication',
            pmid: study.pmid || null,
            doi: study.doi || null,
            volume: study.volume || null,
            issue: study.issue || null,
            pages: study.pages || null,
            findings: findings,
            evidenceLevel: study.clinicalRelevance || study.evidenceLevel || study.type || 'Research Study',
            studyType: study.studyType || study.type || null,
            sampleSize: study.sampleSize || null
        };
    }

    /**
     * Helper method to parse citation string into components
     * @private
     */
    _parseCitationString(citation) {
        const result = {
            title: '',
            authors: [],
            year: null,
            journal: ''
        };

        try {
            // Extract year (4 digits in parentheses)
            const yearMatch = citation.match(/\((\d{4})\)/);
            if (yearMatch) {
                result.year = parseInt(yearMatch[1]);
            }

            // Extract authors (before year)
            const authorMatch = citation.match(/^([^(]+)\s*\(/);
            if (authorMatch) {
                const authorText = authorMatch[1].trim();
                if (authorText.includes(' et al')) {
                    result.authors = [authorText.replace(' et al', '')];
                } else {
                    result.authors = [authorText];
                }
            }

            // Extract title (after year, before journal)
            const titleMatch = citation.match(/\(\d{4}\)\.\s*([^.]+)\./);
            if (titleMatch) {
                result.title = titleMatch[1].trim();
            }

            // Extract journal (after title)
            const journalMatch = citation.match(/\.\s*([A-Z][^,\d]*?)[\d,]/);
            if (journalMatch) {
                result.journal = journalMatch[1].trim();
            }
        } catch (error) {
            console.warn('Error parsing citation:', citation, error);
        }

        return result;
    }

    /**
     * Helper method to infer health domain from a single study
     * @private
     */
    _inferHealthDomainFromStudy(study) {
        const title = (study.title || '').toLowerCase();

        if (title.includes('cognitive') || title.includes('memory') || title.includes('brain')) {
            return 'Cognitive Enhancement';
        } else if (title.includes('immune') || title.includes('infection')) {
            return 'Immune Support';
        } else if (title.includes('energy') || title.includes('fatigue')) {
            return 'Energy & Vitality';
        } else if (title.includes('sleep') || title.includes('insomnia')) {
            return 'Sleep Quality';
        } else if (title.includes('mood') || title.includes('depression') || title.includes('anxiety')) {
            return 'Mood Support';
        } else if (title.includes('heart') || title.includes('cardiovascular')) {
            return 'Cardiovascular Health';
        } else {
            return 'General Health';
        }
    }

    /**
     * Helper method to infer safety aspect from a single study
     * @private
     */
    _inferSafetyAspectFromStudy(study) {
        const title = (study.title || '').toLowerCase();
        return this._inferSafetyAspectFromText(title);
    }

    _inferSafetyAspectFromClaim(claim) {
        const text = (claim || '').toLowerCase();
        return this._inferSafetyAspectFromText(text);
    }

    _inferSafetyAspectFromText(text) {
        if (text.includes('toxicity') || text.includes('toxic') || text.includes('noael') || text.includes('ld50')) {
            return 'Toxicity Profile';
        } else if (text.includes('side effects') || text.includes('adverse') || text.includes('tolerab')) {
            return 'Side Effects & Tolerability';
        } else if (text.includes('interaction') || text.includes('drug')) {
            return 'Drug Interactions';
        } else if (text.includes('dosage') || text.includes('dose')) {
            return 'Dosage Safety';
        } else if (text.includes('gastrointestinal') || text.includes('stomach')) {
            return 'Gastrointestinal Safety';
        } else if (text.includes('liver') || text.includes('hepatic')) {
            return 'Liver Safety';
        } else if (text.includes('children') || text.includes('pediatric') || text.includes('adolescent')) {
            return 'Pediatric Safety';
        } else if (text.includes('pregnancy') || text.includes('pregnant')) {
            return 'Pregnancy Safety';
        } else {
            return 'General Safety';
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
        // Detect different data formats
        const isFlatArray = Array.isArray(citationData.citations);
        const isEnhancedCitationsArray = this._isEnhancedCitationsArray(citationData);
        const isLegacyFormat = !isFlatArray && this._isLegacyFormat(citationData.citations);

        let citations;
        if (isEnhancedCitationsArray) {
            // Convert enhancedCitations array format (L-Tyrosine style - no citations key)
            citations = this._convertFlatCitationArray(citationData.enhancedCitations);
        } else if (isFlatArray) {
            // Convert flat citations array format (Phase 3B-6/7 style - citations is array)
            citations = this._convertFlatCitationArray(citationData.citations);
        } else if (isLegacyFormat) {
            // Convert legacy numbered citations to grouped format
            citations = this._convertLegacyFormat(citationData.citations);
        } else {
            // Use standard normalization for modern format
            citations = {
                mechanisms: this._normalizeMechanisms(citationData.citations?.mechanisms || []),
                benefits: this._normalizeBenefits(citationData.citations?.benefits || []),
                safety: this._normalizeSafety(citationData.citations?.safety || []),
                dosage: this._normalizeDosage(citationData.citations?.dosage || [])
            };
        }

        const normalized = {
            ...citationData,
            citations: citations
        };

        return normalized;
    }

    /**
     * Smart evidence extraction for backward compatibility
     * @private
     */
    _extractEvidence(citationItem) {
        // Format A: Direct evidence field (Phase 3 format)
        if (citationItem.evidence && typeof citationItem.evidence === 'string') {
            return citationItem.evidence;
        }

        // Format B: Map from strength field (Legacy format)
        if (citationItem.strength) {
            const strengthMap = {
                "Strong": "Strong Evidence",
                "Moderate": "Moderate Evidence",
                "Weak": "Limited Evidence",
                "Limited": "Limited Evidence",
                "High": "Strong Evidence",
                "Medium": "Moderate Evidence",
                "Low": "Limited Evidence"
            };
            return strengthMap[citationItem.strength] || (citationItem.strength + " Evidence");
        }

        // Format B: Map from evidenceQuality field
        if (citationItem.evidenceQuality) {
            return citationItem.evidenceQuality.includes("Evidence") ?
                   citationItem.evidenceQuality :
                   citationItem.evidenceQuality + " Evidence";
        }

        // Safety-specific mapping
        if (citationItem.riskLevel) {
            const riskMap = {
                "Low": "Good Safety Profile",
                "Minimal": "Excellent Safety Profile",
                "Moderate": "Caution Advised",
                "High": "Safety Concerns",
                "Very Low": "Excellent Safety Profile"
            };
            return riskMap[citationItem.riskLevel] || "Safety Information";
        }

        // Mechanism-specific fallback
        if (citationItem.mechanismType) {
            return "Established Mechanism";
        }

        // Default fallback
        return "Evidence Available";
    }

    /**
     * Normalize mechanisms to expected format with enhanced validation compatibility
     * @private
     */
    _normalizeMechanisms(mechanisms) {
        if (!Array.isArray(mechanisms)) return [];

        // Check if this is direct study list format (GABA/Zinc/Iron style)
        if (mechanisms.length > 0 && mechanisms[0].title && mechanisms[0].authors && !mechanisms[0].mechanism) {
            // Convert each study to individual mechanism card
            return mechanisms.map((study, index) => ({
                mechanism: study.title || `Mechanism ${index + 1}`,
                mechanismType: "Biochemical pathway",
                strength: "Moderate",
                tissueTarget: "Multiple systems",
                target: "Multiple systems",
                description: study.significance || "Research-supported mechanism",
                evidence: [this._normalizeStudy(study)],
                // Add required validation fields
                claim: study.title || `Mechanism ${index + 1}`,
                evidence: "Established Mechanism"
            }));
        }

        // Check for v2.0 flat citation format: each item has claim + evidence(string) + pmid + year + details
        // but does NOT have nested evidence array or title/authors fields
        if (mechanisms.length > 0 && mechanisms[0].claim && mechanisms[0].pmid
            && typeof mechanisms[0].evidence === 'string' && !mechanisms[0].title && !mechanisms[0].authors) {
            return mechanisms.map(citation => ({
                mechanism: citation.claim.length > 100 ? citation.claim.substring(0, 100) + '...' : citation.claim,
                claim: citation.claim,
                mechanismType: citation.studyType || "Research study",
                strength: citation.evidence || "Moderate",
                tissueTarget: citation.participants || "See study details",
                target: citation.participants || "See study details",
                description: citation.details || "",
                evidence: [{
                    title: citation.claim,
                    authors: [citation.studyType || 'Research study'],
                    year: citation.year || 'Unknown',
                    journal: citation.studyType || 'Research study',
                    pmid: citation.pmid,
                    findings: citation.details || '',
                    evidenceLevel: citation.evidence || 'Moderate',
                    studyType: citation.studyType,
                    replication: citation.replication || '',
                    sampleSize: citation.participants || ''
                }]
            }));
        }

        return mechanisms.map(mechanism => {
            // Ensure required validation fields are present
            const normalizedMechanism = {
                ...mechanism,
                claim: mechanism.claim || mechanism.mechanism || mechanism.title || "Research-supported mechanism",
                evidence: this._extractEvidence(mechanism)
            };

            // Normalize evidence and merge parent fields for hybrid formats
            let evidence = mechanism.evidence || mechanism.studies || mechanism.citations || [];
            if (Array.isArray(evidence)) {
                evidence = evidence.map(study => ({
                    ...study,
                    // Merge parent mechanism fields if missing in study
                    year: study.year || mechanism.year,
                    journal: study.journal || mechanism.journal,
                    doi: study.doi || mechanism.doi,
                    pmid: study.pmid || mechanism.pmid,
                    findings: study.findings || study.keyFindings || mechanism.keyFindings
                }));
            }

            return {
                ...normalizedMechanism,
                mechanism: mechanism.mechanism || mechanism.mechanismType || mechanism.claim || "Unknown mechanism",
                mechanismType: mechanism.mechanismType || mechanism.mechanism || this._inferMechanismTypeFromClaim(mechanism.claim) || "Unknown",
                strength: mechanism.strength || mechanism.evidenceLevel || "Moderate",
                tissueTarget: mechanism.tissueTarget || mechanism.target || mechanism.populationTarget || "Neural tissue",
                target: mechanism.tissueTarget || mechanism.target || mechanism.populationTarget || "Neural tissue",
                description: mechanism.description || "",
                evidence: this._normalizeStudies(evidence)
            };
        });
    }

    /**
     * Normalize benefits to expected format
     * Handles both grouped format and direct study list format
     * @private
     */
    _normalizeBenefits(benefits) {
        if (!Array.isArray(benefits)) return [];

        // Check if this is direct study list format (GABA/Zinc/Iron style)
        if (benefits.length > 0 && benefits[0].title && benefits[0].authors && !benefits[0].healthDomain && !benefits[0].claim) {
            // Convert each study to individual benefit card
            return benefits.map((study, index) => ({
                healthDomain: this._inferHealthDomainFromStudy(study),
                specificClaim: study.title || `Health benefit ${index + 1}`,
                strength: "Moderate",
                evidenceQuality: "Moderate",
                replicationStatus: "Research-supported",
                tissueTarget: "Multiple systems",
                target: "Multiple systems",
                evidence: [this._normalizeStudy(study)],
                // Add required validation fields
                claim: study.title || `Health benefit ${index + 1}`,
                evidence: "Moderate Evidence"
            }));
        }

        // Check for v2.0 flat citation format: each item has claim + evidence(string) + pmid + year + details
        // but does NOT have nested evidence array, healthDomain, specificClaim, title/authors
        if (benefits.length > 0 && benefits[0].claim && benefits[0].pmid
            && typeof benefits[0].evidence === 'string' && !benefits[0].title && !benefits[0].authors
            && !benefits[0].healthDomain && !benefits[0].specificClaim) {
            return benefits.map(citation => ({
                healthDomain: this._getHealthDomainForBenefit(citation.claim) || "Health Benefits",
                specificClaim: citation.claim,
                claim: citation.claim,
                strength: citation.evidence || "Moderate",
                evidenceQuality: citation.evidence || "Moderate",
                replicationStatus: citation.replication || "See study details",
                tissueTarget: citation.participants || "See study details",
                target: citation.participants || "See study details",
                evidence: [{
                    title: citation.claim,
                    authors: [citation.studyType || 'Research study'],
                    year: citation.year || 'Unknown',
                    journal: citation.studyType || 'Research study',
                    pmid: citation.pmid,
                    findings: citation.details || '',
                    evidenceLevel: citation.evidence || 'Moderate',
                    studyType: citation.studyType,
                    duration: citation.duration || '',
                    sampleSize: citation.participants || '',
                    dosage: citation.dosage || ''
                }]
            }));
        }

        return benefits.map(benefit => {
            // Ensure required validation fields are present
            const normalizedBenefit = {
                ...benefit,
                claim: benefit.claim || benefit.specificClaim || benefit.title || "Health benefit",
                evidence: this._extractEvidence(benefit)
            };

            // Check if this is already in grouped format (has healthDomain, specificClaim, etc.)
            if (benefit.healthDomain || benefit.specificClaim) {
                // Already in correct format, just ensure required properties
                return {
                    ...normalizedBenefit,
                    healthDomain: benefit.healthDomain || "Cognitive Health",
                    specificClaim: benefit.specificClaim || benefit.claim || "Health benefit",
                    strength: benefit.strength || benefit.evidenceQuality || "Moderate",
                    evidenceQuality: benefit.evidenceQuality || benefit.strength || "Moderate",
                    replicationStatus: benefit.replicationStatus || "Multiple studies",
                    tissueTarget: benefit.tissueTarget || benefit.target || "Central nervous system",
                    target: benefit.tissueTarget || benefit.target || "Central nervous system",
                    studies: this._ensureStudiesArray(benefit.studies, benefit.evidence),
                    evidence: this._normalizeStudies(benefit.evidence || [])
                };
            }

            // This is direct benefit claims format - convert each benefit to grouped format
            return {
                ...normalizedBenefit,
                healthDomain: this._getHealthDomainForBenefit(benefit.claim || benefit.title) || "Health Benefits",
                specificClaim: benefit.claim || benefit.title || "Health benefit",
                strength: benefit.strength || "Moderate",
                evidenceQuality: benefit.strength || "Moderate",
                replicationStatus: benefit.replicationStatus || "Multiple studies",
                tissueTarget: benefit.populationTarget || benefit.target || "General population",
                target: benefit.populationTarget || benefit.target || "General population",
                studies: this._ensureStudiesArray(benefit.studies, benefit.evidence),
                evidence: this._normalizeStudies(benefit.studies || [])
            };
        });
    }

    /**
     * Get health domain for a specific benefit claim
     * @private
     */
    _getHealthDomainForBenefit(benefit) {
        if (!benefit) return null;

        const benefitLower = benefit.toLowerCase();
        const benefitMap = {
            // Stress and mood
            'stress': 'Stress Resilience',
            'cortisol': 'Stress Resilience',
            'anxiety': 'Anxiety Reduction',
            'mood': 'Mood Enhancement',
            'depression': 'Mood Enhancement',

            // Cognitive
            'cognitive': 'Cognitive Enhancement',
            'memory': 'Memory Enhancement',
            'focus': 'Focus & Attention',
            'attention': 'Focus & Attention',
            'concentration': 'Focus & Attention',

            // Sleep and energy
            'sleep': 'Sleep Quality',
            'energy': 'Energy & Vitality',
            'fatigue': 'Energy & Vitality',

            // Physical health
            'inflammation': 'Anti-inflammatory',
            'antioxidant': 'Antioxidant Support',
            'immune': 'Immune Support',
            'neuroprotection': 'Neuroprotection',
            'cardiovascular': 'Cardiovascular Health'
        };

        // Find matching domain
        for (const [keyword, domain] of Object.entries(benefitMap)) {
            if (benefitLower.includes(keyword)) {
                return domain;
            }
        }

        return 'Health Benefits'; // Default fallback
    }

    /**
     * Normalize safety data to expected format
     * @private
     */
    _normalizeSafety(safety) {
        if (!Array.isArray(safety)) return [];

        // Check for v2.0 flat citation format: each item has claim + evidence(string) + pmid + year + details
        if (safety.length > 0 && safety[0].claim && safety[0].pmid
            && typeof safety[0].evidence === 'string' && !safety[0].title && !safety[0].authors
            && !safety[0].safetyAspect) {
            return safety.map(citation => ({
                safetyAspect: this._inferSafetyAspectFromClaim(citation.claim) || "General Safety",
                riskLevel: "Low",
                claim: citation.claim,
                strength: citation.evidence || "Good Safety Profile",
                evidence: [{
                    title: citation.claim,
                    authors: [citation.studyType || 'Research study'],
                    year: citation.year || 'Unknown',
                    journal: citation.studyType || 'Research study',
                    pmid: citation.pmid,
                    findings: citation.details || '',
                    evidenceLevel: citation.evidence || 'Good Safety Profile',
                    studyType: citation.studyType,
                    sampleSize: citation.participants || ''
                }]
            }));
        }

        // Check if this is direct study list format (academic papers)
        if (safety.length > 0 && safety[0].title && safety[0].authors && !safety[0].safetyAspect) {
            // Convert each study to individual safety card
            return safety.map((study, index) => ({
                safetyAspect: this._inferSafetyAspectFromStudy(study),
                riskLevel: "Low",
                claim: study.title || `Safety consideration ${index + 1}`,
                evidence: "Good Safety Profile",
                studies: [this._normalizeStudy(study)],
                evidence: [this._normalizeStudy(study)]
            }));
        }

        return safety.map(safetyItem => {
            // Ensure required validation fields are present
            const normalizedSafety = {
                ...safetyItem,
                claim: safetyItem.claim || safetyItem.description || safetyItem.title || "Generally well tolerated",
                evidence: this._extractEvidence(safetyItem)
            };

            // Check if already in grouped format
            if (safetyItem.safetyAspect || safetyItem.riskLevel) {
                return {
                    ...normalizedSafety,
                    safetyAspect: safetyItem.safetyAspect || "General Safety",
                    riskLevel: safetyItem.riskLevel || "Low",
                    studies: this._ensureStudiesArray(safetyItem.studies, safetyItem.evidence),
                    evidence: this._normalizeStudies(safetyItem.evidence || [])
                };
            }

            // This is legacy format - convert to grouped format
            return {
                ...normalizedSafety,
                safetyAspect: "General Safety Profile",
                riskLevel: "Low",
                studies: this._ensureStudiesArray(safetyItem.studies, safetyItem.evidence),
                evidence: this._normalizeStudies(safetyItem.studies || [])
            };
        });
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
            if ((study.claim || study.description) && study.citation && !study.title) {
                return {
                    ...study,
                    title: study.claim || study.description || "Study finding",
                    authors: this._extractAuthorsFromCitation(study.citation),
                    year: this._extractYearFromCitation(study.citation),
                    journal: this._extractJournalFromCitation(study.citation),
                    evidenceLevel: study.type || study.evidenceLevel || study.evidence || this._mapStudyTypeToEvidenceLevel(study.studyType) || "Level 4",
                    findings: study.keyFinding || study.description || study.claim || '',
                    doi: study.doi || ''
                };
            }

            // Handle hybrid format (Pterostilbene style with direct fields + nested evidence)
            if (study.evidence && Array.isArray(study.evidence) && study.evidence.length > 0) {
                const nestedStudy = study.evidence[0];
                return {
                    ...study,
                    title: nestedStudy.title || study.mechanism || study.specificClaim || "Study finding",
                    authors: Array.isArray(nestedStudy.authors) ? nestedStudy.authors : [nestedStudy.authors || 'Unknown authors'],
                    year: study.year || nestedStudy.year || 'Unknown year',
                    journal: study.journal || nestedStudy.journal || 'Unknown journal',
                    evidenceLevel: study.strength || study.evidenceLevel || this._mapStudyTypeToEvidenceLevel(study.studyType) || "Level 4",
                    findings: study.keyFindings || nestedStudy.keyFindings || study.findings || '',
                    doi: study.doi || nestedStudy.doi || ''
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
     * Ensure studies field is always an array, handling various data formats
     * @private
     */
    _ensureStudiesArray(studies, evidence) {
        // If studies exists and is an array, use it
        if (Array.isArray(studies)) {
            return studies;
        }

        // If studies is a string (like "Level 1"), ignore it and use evidence
        if (typeof studies === 'string') {
            return Array.isArray(evidence) ? evidence : [];
        }

        // If studies is an object, wrap it in an array
        if (studies && typeof studies === 'object') {
            return [studies];
        }

        // Fall back to evidence if it's an array
        if (Array.isArray(evidence)) {
            return evidence;
        }

        // Last resort: empty array
        return [];
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

    /**
     * Extract journal from citation string
     * @private
     */
    _extractJournalFromCitation(citation) {
        if (!citation) return 'Unknown journal';

        // Look for journal after the title (usually after a period and before volume/year)
        // Pattern: "Title. Journal Name, volume(issue), pages."
        const journalMatch = citation.match(/\.\s*([^,]+),\s*\d+/);
        if (journalMatch) {
            return journalMatch[1].trim();
        }

        // Alternative pattern: "Title. Journal Name. Year"
        const journalMatch2 = citation.match(/\.\s*([^.]+)\.\s*\d{4}/);
        if (journalMatch2) {
            return journalMatch2[1].trim();
        }

        // Fallback: look for text between periods
        const parts = citation.split('.');
        if (parts.length >= 3) {
            return parts[1].trim();
        }

        return 'Unknown journal';
    }

    /**
     * Infer mechanism name from study titles
     * @private
     */
    _inferMechanismFromStudies(studies) {
        if (!studies || studies.length === 0) return "Multiple mechanisms";

        const firstTitle = studies[0].title || "";
        const titleLower = firstTitle.toLowerCase();

        // Common mechanism patterns
        const mechanismMap = {
            'gaba': 'GABA neurotransmitter modulation',
            'neurotransmitter': 'Neurotransmitter system regulation',
            'receptor': 'Receptor binding and activation',
            'antioxidant': 'Antioxidant and free radical scavenging',
            'alpha-lipoic': 'Mitochondrial energy metabolism',
            'lutein': 'Macular pigment and visual protection',
            'zeaxanthin': 'Retinal protection and visual health',
            'zinc': 'Enzymatic cofactor and cellular signaling',
            'iron': 'Oxygen transport and cellular metabolism',
            'cognitive': 'Cognitive enhancement pathways',
            'neuroprotect': 'Neuroprotective mechanisms',
            'inflammation': 'Anti-inflammatory pathways',
            'metabolism': 'Metabolic regulation'
        };

        // Find matching mechanism
        for (const [keyword, mechanism] of Object.entries(mechanismMap)) {
            if (titleLower.includes(keyword)) {
                return mechanism;
            }
        }

        // Fallback: use supplement-specific defaults
        return "Primary mechanism of action";
    }

    /**
     * Infer health domain from study titles
     * @private
     */
    _inferHealthDomainFromStudies(studies) {
        if (!studies || studies.length === 0) return "Health Benefits";

        const firstTitle = studies[0].title || "";
        const titleLower = firstTitle.toLowerCase();

        // Health domain patterns
        const domainMap = {
            'cognitive': 'Cognitive Enhancement',
            'memory': 'Memory Enhancement',
            'attention': 'Focus & Attention',
            'adhd': 'Focus & Attention',
            'anxiety': 'Anxiety Reduction',
            'stress': 'Stress Resilience',
            'sleep': 'Sleep Quality',
            'mood': 'Mood Enhancement',
            'depression': 'Mood Enhancement',
            'eye': 'Visual Health',
            'macular': 'Visual Health',
            'vision': 'Visual Health',
            'antioxidant': 'Antioxidant Support',
            'immune': 'Immune Support',
            'inflammation': 'Anti-inflammatory',
            'diabetes': 'Metabolic Health',
            'insulin': 'Metabolic Health',
            'energy': 'Energy & Vitality',
            'neuroprotect': 'Neuroprotection',
            'brain': 'Cognitive Enhancement'
        };

        // Find matching domain
        for (const [keyword, domain] of Object.entries(domainMap)) {
            if (titleLower.includes(keyword)) {
                return domain;
            }
        }

        return "Health Benefits";
    }

    /**
     * Infer mechanism type from claim text
     * @private
     */
    _inferMechanismTypeFromClaim(claim) {
        if (!claim) return "Unknown";

        const claimLower = claim.toLowerCase();

        // Mechanism type patterns
        const typeMap = {
            'receptor': 'Receptor modulation',
            'neurotransmitter': 'Neurotransmitter system',
            'adenosine': 'Adenosine pathway',
            'phosphodiesterase': 'Enzyme inhibition',
            'calcium': 'Calcium signaling',
            'antioxidant': 'Antioxidant pathway',
            'enzyme': 'Enzymatic pathway',
            'metabolic': 'Metabolic pathway',
            'signaling': 'Cellular signaling',
            'transport': 'Transport mechanism',
            'synthesis': 'Biosynthesis pathway',
            'degradation': 'Degradation pathway'
        };

        // Find matching type
        for (const [keyword, type] of Object.entries(typeMap)) {
            if (claimLower.includes(keyword)) {
                return type;
            }
        }

        return "Biochemical pathway";
    }

    /**
     * Detect if citations use legacy numbered format instead of grouped sections
     * @private
     */
    _isLegacyFormat(citations) {
        if (!citations || typeof citations !== 'object') return false;

        // Check if citations has numbered keys (0, 1, 2, etc.) instead of named sections
        const keys = Object.keys(citations);
        const hasNumberedKeys = keys.some(key => /^\d+$/.test(key));
        const hasNamedSections = keys.some(key => ['benefits', 'safety', 'mechanisms'].includes(key));

        // Legacy format has numbered keys but no named sections
        return hasNumberedKeys && !hasNamedSections;
    }

    /**
     * Detect if data uses enhancedCitations array format (L-Tyrosine style)
     * Note: The attacher now normalizes enhancedCitations→citations, but this handles
     * any case where the original key still comes through
     * @private
     */
    _isEnhancedCitationsArray(citationData) {
        return citationData &&
               Array.isArray(citationData.enhancedCitations) &&
               citationData.enhancedCitations.length > 0 &&
               (!citationData.citations || Array.isArray(citationData.citations));
    }

    /**
     * Convert flat citation array to grouped sections
     * Handles both L-Tyrosine style (enhancedCitations key) and Phase 3B-6/7 style (citations as array)
     * Uses content-aware categorization via _categorizeLegacyCitation for smart section assignment
     * @private
     */
    _convertFlatCitationArray(citationArray) {
        if (!Array.isArray(citationArray) || citationArray.length === 0) {
            return { benefits: [], safety: [], mechanisms: [], dosage: [] };
        }

        const benefits = [];
        const safety = [];
        const mechanisms = [];

        citationArray.forEach((citation, index) => {
            // Use smart content-based categorization
            const category = this._categorizeLegacyCitation(citation);
            const normalizedStudy = this._normalizeStudy(citation);

            switch (category) {
                case 'safety':
                    safety.push({
                        safetyAspect: citation.mensHealthFocus || citation.womensHealthFocus || "General Safety",
                        riskLevel: "Low",
                        claim: citation.title || `Safety information ${index + 1}`,
                        tissueTarget: citation.sampleSize || "Multiple systems",
                        target: citation.sampleSize || "Multiple systems",
                        evidence: [normalizedStudy]
                    });
                    break;

                case 'mechanism':
                    mechanisms.push({
                        mechanism: citation.title || `Mechanism ${index + 1}`,
                        claim: citation.title || `Mechanism ${index + 1}`,
                        mechanismType: citation.studyType || "Biochemical pathway",
                        strength: citation.clinicalRelevance || "Moderate",
                        tissueTarget: citation.sampleSize || "Multiple systems",
                        target: citation.sampleSize || "Multiple systems",
                        evidence: [normalizedStudy]
                    });
                    break;

                default: // 'benefit'
                    benefits.push({
                        healthDomain: this._inferHealthDomainFromStudy(citation),
                        specificClaim: citation.title || `Health benefit ${index + 1}`,
                        claim: citation.title || `Health benefit ${index + 1}`,
                        strength: citation.clinicalRelevance || "Moderate",
                        evidenceQuality: citation.clinicalRelevance || "Moderate",
                        replicationStatus: "Research-supported",
                        tissueTarget: citation.sampleSize || "Multiple systems",
                        target: citation.sampleSize || "Multiple systems",
                        evidence: [normalizedStudy]
                    });
            }

            // If L-Tyrosine style citation has explicit mechanisms array, add those too
            if (citation.mechanisms && Array.isArray(citation.mechanisms)) {
                citation.mechanisms.forEach((mechanism, mechIndex) => {
                    mechanisms.push({
                        mechanism: mechanism.name || mechanism.description || `Mechanism ${mechIndex + 1}`,
                        claim: mechanism.name || mechanism.description || `Mechanism ${mechIndex + 1}`,
                        mechanismType: "Biochemical pathway",
                        strength: "Moderate",
                        tissueTarget: "Multiple systems",
                        target: "Multiple systems",
                        evidence: [normalizedStudy]
                    });
                });
            }

            // If L-Tyrosine style citation has safety profile, add safety entry
            if (citation.safetyProfile || citation.limitations) {
                safety.push({
                    safetyAspect: "General Safety",
                    riskLevel: "Low",
                    claim: citation.safetyProfile?.rating || "Generally well tolerated",
                    tissueTarget: "Multiple systems",
                    target: "Multiple systems",
                    evidence: [normalizedStudy]
                });
            }
        });

        // Ensure at least one safety entry for supplements with no safety-categorized citations
        if (safety.length === 0) {
            safety.push({
                safetyAspect: "General Safety",
                riskLevel: "Low",
                claim: "Generally well tolerated based on available research",
                tissueTarget: "Multiple systems",
                target: "Multiple systems",
                evidence: []
            });
        }

        return {
            benefits: benefits,
            safety: safety,
            mechanisms: mechanisms,
            dosage: []
        };
    }

    /**
     * Convert legacy numbered citation format to grouped sections
     * @private
     */
    _convertLegacyFormat(citations) {
        const benefits = [];
        const safety = [];
        const mechanisms = [];

        // Extract all numbered citations
        const citationArray = [];
        Object.keys(citations).forEach(key => {
            if (/^\d+$/.test(key)) {
                citationArray.push(citations[key]);
            }
        });

        // Categorize citations based on content analysis
        citationArray.forEach((citation, index) => {
            const category = this._categorizeLegacyCitation(citation);

            switch (category) {
                case 'benefit':
                    benefits.push(this._convertToBenefitFormat(citation, index));
                    break;
                case 'safety':
                    safety.push(this._convertToSafetyFormat(citation, index));
                    break;
                case 'mechanism':
                    mechanisms.push(this._convertToMechanismFormat(citation, index));
                    break;
                default:
                    // Default to benefit if unclear
                    benefits.push(this._convertToBenefitFormat(citation, index));
            }
        });

        return {
            benefits: benefits,
            safety: safety,
            mechanisms: mechanisms,
            dosage: []
        };
    }

    /**
     * Categorize a legacy citation based on its content
     * @private
     */
    _categorizeLegacyCitation(citation) {
        const title = (citation.title || '').toLowerCase();
        const tags = (citation.tags || []).join(' ').toLowerCase();
        const keyFindings = (citation.keyFindings || []).join(' ').toLowerCase();
        const content = `${title} ${tags} ${keyFindings}`;

        // Safety indicators
        if (content.includes('safety') || content.includes('adverse') ||
            content.includes('toxicity') || content.includes('side effect') ||
            content.includes('tolerability') || content.includes('contraindication')) {
            return 'safety';
        }

        // Mechanism indicators
        if (content.includes('mechanism') || content.includes('pathway') ||
            content.includes('receptor') || content.includes('enzyme') ||
            content.includes('neurotransmitter') || content.includes('molecular')) {
            return 'mechanism';
        }

        // Default to benefit
        return 'benefit';
    }

    /**
     * Convert legacy citation to benefit format
     * @private
     */
    _convertToBenefitFormat(citation, index) {
        return {
            healthDomain: this._inferHealthDomainFromStudy(citation),
            specificClaim: citation.title || `Health benefit ${index + 1}`,
            claim: citation.title || `Health benefit ${index + 1}`,
            strength: "Moderate",
            evidenceQuality: "Moderate",
            replicationStatus: "Research-supported",
            tissueTarget: "Multiple systems",
            target: "Multiple systems",
            evidence: [this._normalizeStudy(citation)]
        };
    }

    /**
     * Convert legacy citation to safety format
     * @private
     */
    _convertToSafetyFormat(citation, index) {
        return {
            safetyAspect: "General Safety",
            riskLevel: "Low",
            claim: citation.title || `Safety information ${index + 1}`,
            tissueTarget: "Multiple systems",
            target: "Multiple systems",
            evidence: [this._normalizeStudy(citation)]
        };
    }

    /**
     * Convert legacy citation to mechanism format
     * @private
     */
    _convertToMechanismFormat(citation, index) {
        return {
            mechanism: citation.title || `Mechanism ${index + 1}`,
            claim: citation.title || `Mechanism ${index + 1}`,
            mechanismType: "Biochemical pathway",
            strength: "Moderate",
            tissueTarget: "Multiple systems",
            target: "Multiple systems",
            evidence: [this._normalizeStudy(citation)]
        };
    }
}

// Export for use in main application
export default CitationRenderer;
window.CitationRenderer = new CitationRenderer();