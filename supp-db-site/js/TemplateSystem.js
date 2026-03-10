/**
 * Configurable Template System
 * Replaces hardcoded templates with a flexible, maintainable system
 */
class TemplateSystem {
    constructor() {
        this.templates = new Map();
        this.partials = new Map();
        this.helpers = new Map();
        this.cache = new Map();
        this.config = {
            cacheEnabled: true,
            maxCacheSize: 100,
            enableHelpers: true,
            throwOnMissingTemplate: false
        };
        
        this._initializeDefaultTemplates();
        this._initializeHelpers();
        console.log('Template system initialized');
    }

    /**
     * Register a template
     */
    registerTemplate(name, template, options = {}) {
        if (typeof template === 'function') {
            this.templates.set(name, {
                fn: template,
                compiled: true,
                ...options
            });
        } else if (typeof template === 'string') {
            this.templates.set(name, {
                source: template,
                compiled: false,
                ...options
            });
        } else {
            throw new Error(`Invalid template type for ${name}. Expected string or function.`);
        }
        
        // Clear cached versions
        this._clearCacheForTemplate(name);
        console.log(`Template registered: ${name}`);
    }

    /**
     * Register a partial template
     */
    registerPartial(name, template) {
        this.partials.set(name, template);
        this._clearCacheForPartial(name);
        console.log(`Partial registered: ${name}`);
    }

    /**
     * Register a helper function
     */
    registerHelper(name, helperFn) {
        if (typeof helperFn !== 'function') {
            throw new Error(`Helper ${name} must be a function`);
        }
        this.helpers.set(name, helperFn);
        console.log(`Helper registered: ${name}`);
    }

    /**
     * Render a template with data
     */
    render(templateName, data = {}, options = {}) {
        try {
            const cacheKey = this._getCacheKey(templateName, data, options);
            
            // Check cache first
            if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            const template = this._getTemplate(templateName);
            if (!template) {
                return this._handleMissingTemplate(templateName);
            }
            
            // Compile template if needed
            if (!template.compiled) {
                template.fn = this._compileTemplate(template.source);
                template.compiled = true;
            }
            
            // Create render context
            const context = this._createRenderContext(data, options);
            
            // Render template
            const result = template.fn(context);
            
            // Cache result
            if (this.config.cacheEnabled) {
                this._addToCache(cacheKey, result);
            }
            
            return result;
        } catch (error) {
            console.error(`Template rendering error for ${templateName}:`, error);
            return this._handleRenderError(templateName, error);
        }
    }

    /**
     * Get template by name
     * @private
     */
    _getTemplate(name) {
        return this.templates.get(name);
    }

    /**
     * Compile template string into function
     * @private
     */
    _compileTemplate(source) {
        // Simple template compilation - replace with more sophisticated engine if needed
        return (context) => {
            let result = source;
            
            // Replace variables: {{variable}}
            result = result.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
                return this._getValueFromContext(context, varName) || '';
            });
            
            // Replace helpers: {{helper arg1 arg2}}
            result = result.replace(/\{\{(\w+)\s+([^}]+)\}\}/g, (match, helperName, args) => {
                if (this.helpers.has(helperName)) {
                    const helper = this.helpers.get(helperName);
                    const argValues = this._parseArguments(args, context);
                    return helper(...argValues, context) || '';
                }
                return match;
            });
            
            // Replace partials: {{> partialName}}
            result = result.replace(/\{\{>\s*(\w+)\s*\}\}/g, (match, partialName) => {
                const partial = this.partials.get(partialName);
                if (partial) {
                    if (typeof partial === 'function') {
                        return partial(context);
                    } else {
                        return this._compileTemplate(partial)(context);
                    }
                }
                return '';
            });
            
            // Replace conditionals: {{#if condition}}...{{/if}}
            result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
                const value = this._getValueFromContext(context, condition);
                return value ? content : '';
            });
            
            // Replace loops: {{#each array}}...{{/each}}
            result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
                const array = this._getValueFromContext(context, arrayName);
                if (Array.isArray(array)) {
                    return array.map((item, index) => {
                        const itemContext = { ...context, this: item, index, '@index': index };
                        return this._compileTemplate(content)(itemContext);
                    }).join('');
                }
                return '';
            });
            
            return result;
        };
    }

    /**
     * Create render context with data and helpers
     * @private
     */
    _createRenderContext(data, options) {
        const context = {
            ...data,
            _helpers: this.helpers,
            _partials: this.partials,
            _options: options
        };
        
        // Add global helpers to context
        if (this.config.enableHelpers) {
            for (const [name, helper] of this.helpers) {
                context[name] = (...args) => helper(...args, context);
            }
        }
        
        return context;
    }

    /**
     * Get value from context using dot notation
     * @private
     */
    _getValueFromContext(context, path) {
        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : null;
        }, context);
    }

    /**
     * Parse helper arguments
     * @private
     */
    _parseArguments(argsString, context) {
        return argsString.split(/\s+/).map(arg => {
            // Check if it's a quoted string
            if (arg.startsWith('"') && arg.endsWith('"')) {
                return arg.slice(1, -1);
            }
            // Check if it's a number
            if (!isNaN(arg)) {
                return parseFloat(arg);
            }
            // Check if it's a boolean
            if (arg === 'true') return true;
            if (arg === 'false') return false;
            // Otherwise, treat as variable
            return this._getValueFromContext(context, arg);
        });
    }

    /**
     * Handle missing template
     * @private
     */
    _handleMissingTemplate(templateName) {
        const message = `Template not found: ${templateName}`;
        
        if (this.config.throwOnMissingTemplate) {
            throw new Error(message);
        }
        
        console.warn(message);
        return `<div class="text-red-500 p-4 border border-red-300 rounded">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Template "${templateName}" not found
        </div>`;
    }

    /**
     * Handle render error
     * @private
     */
    _handleRenderError(templateName, error) {
        return `<div class="text-red-500 p-4 border border-red-300 rounded">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Error rendering template "${templateName}": ${error.message}
        </div>`;
    }

    /**
     * Cache management
     * @private
     */
    _getCacheKey(templateName, data, options) {
        // Simple cache key - could be improved with hashing for large data
        return `${templateName}:${JSON.stringify(data)}:${JSON.stringify(options)}`;
    }

    _addToCache(key, result) {
        if (this.cache.size >= this.config.maxCacheSize) {
            // Remove oldest entry (simple LRU)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, result);
    }

    _clearCacheForTemplate(templateName) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(`${templateName}:`)) {
                this.cache.delete(key);
            }
        }
    }

    _clearCacheForPartial(partialName) {
        // Clear all cache since partials can affect any template
        this.cache.clear();
    }

    /**
     * Initialize default templates
     * @private
     */
    _initializeDefaultTemplates() {
        // Supplement card template
        this.registerTemplate('supplementCard', `
            <div class="bg-white rounded-lg shadow-md card-hover p-6 relative" data-supplement-id="{{id}}">
                <div class="absolute top-4 right-4 flex flex-col space-y-2">
                    <div class="flex space-x-2">
                        <span class="tier-badge {{tierClass}} text-white text-xs px-2 py-1 rounded-full font-semibold">
                            Tier {{evidenceTier}}
                        </span>
                        <button onclick="app.toggleFavorite({{id}})" 
                                class="text-gray-400 hover:text-red-500 transition-colors">
                            <i class="fas fa-heart {{#if isFavorite}}text-red-500{{/if}}"></i>
                        </button>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">{{name}}</h3>
                    <p class="text-sm text-gray-600 italic mb-2">{{scientificName}}</p>
                    <span class="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {{category}}
                    </span>
                </div>
                
                <div class="mb-4">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Primary Benefits:</h4>
                    <div class="flex flex-wrap gap-1 mb-2">
                        {{#each cognitiveBenefits}}
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{{this}}</span>
                        {{/each}}
                    </div>
                    <div class="flex flex-wrap gap-1">
                        {{#each nonCognitiveBenefits}}
                        <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{{this}}</span>
                        {{/each}}
                    </div>
                </div>
                
                {{> evidenceMeter}}
                {{> supplementActions}}
            </div>
        `);

        // Evidence meter partial
        this.registerPartial('evidenceMeter', `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-700">Evidence Strength</span>
                    <span class="text-sm text-gray-600">{{evidenceTierRationale}}</span>
                </div>
                <div class="evidence-meter bg-gray-200">
                    <div class="evidence-fill {{tierClass}}" style="width: {{evidenceWidth}}%"></div>
                </div>
            </div>
        `);

        // Supplement actions partial
        this.registerPartial('supplementActions', `
            <div class="flex space-x-2">
                <a href="supplements/{{slug}}.html"
                   class="flex-1 bg-accent text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-900 transition-colors text-center"
                   style="text-decoration:none;">
                    Full Monograph
                </a>
                <button onclick="app.showSupplementDetails({{id}})"
                        class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                    Quick View
                </button>
                <button onclick="app.addToComparison({{id}})"
                        class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors">
                    Compare
                </button>
            </div>
        `);

        // Citation section template
        this.registerTemplate('citationSection', `
            <div class="mt-8">
                {{#if isEnhanced}}
                    {{> enhancedCitationHeader}}
                    {{> evidenceProfile}}
                    {{> citationTabs}}
                    {{> citationContent}}
                {{else}}
                    {{> basicCitations}}
                {{/if}}
            </div>
        `);

        // Enhanced citation header
        this.registerPartial('enhancedCitationHeader', `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold">Enhanced Citation System</h3>
                <div class="flex items-center space-x-2">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {{totalCitations}} Citations
                    </span>
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Quality Score: {{qualityScore}}/100
                    </span>
                </div>
            </div>
        `);

        // Loading skeleton template
        this.registerTemplate('skeleton', `
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
        `);

        // Error template
        this.registerTemplate('error', `
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="flex items-center mb-4">
                    <i class="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
                    <h3 class="text-lg font-semibold text-red-800">{{title}}</h3>
                </div>
                <p class="text-red-700 mb-4">{{message}}</p>
                {{#if showRetry}}
                <button onclick="{{retryAction}}" 
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    <i class="fas fa-redo mr-2"></i>Retry
                </button>
                {{/if}}
            </div>
        `);
    }

    /**
     * Initialize helper functions
     * @private
     */
    _initializeHelpers() {
        // Format number helper
        this.registerHelper('formatNumber', (num) => {
            return typeof num === 'number' ? num.toLocaleString() : num;
        });

        // Capitalize helper
        this.registerHelper('capitalize', (str) => {
            return typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : str;
        });

        // Truncate helper
        this.registerHelper('truncate', (str, length = 50) => {
            if (typeof str !== 'string') return str;
            return str.length > length ? str.substring(0, length) + '...' : str;
        });

        // Date format helper
        this.registerHelper('formatDate', (date, format = 'short') => {
            if (!date) return '';
            const d = new Date(date);
            if (format === 'short') {
                return d.toLocaleDateString();
            } else if (format === 'long') {
                return d.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
            return d.toString();
        });

        // Join array helper
        this.registerHelper('join', (array, separator = ', ') => {
            return Array.isArray(array) ? array.join(separator) : array;
        });

        // Get tier class helper
        this.registerHelper('getTierClass', (tier) => {
            const classes = {
                1: 'tier-badge',
                2: 'tier-2', 
                3: 'tier-3',
                4: 'tier-4'
            };
            return classes[tier] || 'tier-4';
        });

        // Calculate evidence width helper
        this.registerHelper('evidenceWidth', (tier) => {
            return (5 - tier) * 25;
        });

        // Safety color helper
        this.registerHelper('getSafetyColor', (rating) => {
            const colors = {
                'Excellent': 'bg-green-100 text-green-800',
                'Good': 'bg-blue-100 text-blue-800',
                'Fair': 'bg-yellow-100 text-yellow-800',
                'Poor': 'bg-red-100 text-red-800'
            };
            return colors[rating] || 'bg-gray-100 text-gray-800';
        });

        // Slice array helper
        this.registerHelper('slice', (array, start, end) => {
            return Array.isArray(array) ? array.slice(start, end) : [];
        });

        // Math operations helper
        this.registerHelper('math', (a, operator, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            
            switch (operator) {
                case '+': return numA + numB;
                case '-': return numA - numB;
                case '*': return numA * numB;
                case '/': return numB !== 0 ? numA / numB : 0;
                case '%': return numB !== 0 ? numA % numB : 0;
                default: return a;
            }
        });
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.cache.clear();
        console.log('Template cache cleared');
    }

    /**
     * Get template system metrics
     */
    getMetrics() {
        return {
            templatesRegistered: this.templates.size,
            partialsRegistered: this.partials.size,
            helpersRegistered: this.helpers.size,
            cacheSize: this.cache.size,
            cacheEnabled: this.config.cacheEnabled,
            maxCacheSize: this.config.maxCacheSize
        };
    }

    /**
     * Export templates for backup/import
     */
    exportTemplates() {
        const exported = {
            templates: {},
            partials: {},
            helpers: {}
        };
        
        for (const [name, template] of this.templates) {
            exported.templates[name] = template.source || template.fn.toString();
        }
        
        for (const [name, partial] of this.partials) {
            exported.partials[name] = typeof partial === 'string' ? partial : partial.toString();
        }
        
        for (const [name, helper] of this.helpers) {
            exported.helpers[name] = helper.toString();
        }
        
        return exported;
    }

    /**
     * Import templates from exported data
     */
    importTemplates(data) {
        if (data.templates) {
            for (const [name, template] of Object.entries(data.templates)) {
                this.registerTemplate(name, template);
            }
        }
        
        if (data.partials) {
            for (const [name, partial] of Object.entries(data.partials)) {
                this.registerPartial(name, partial);
            }
        }
        
        if (data.helpers) {
            for (const [name, helperStr] of Object.entries(data.helpers)) {
                try {
                    // Note: eval should be avoided in production
                    const helper = new Function('return ' + helperStr)();
                    this.registerHelper(name, helper);
                } catch (error) {
                    console.error(`Failed to import helper ${name}:`, error);
                }
            }
        }
        
        console.log('Templates imported successfully');
    }
}

// Export for use in main application
export default TemplateSystem;
window.TemplateSystem = TemplateSystem;