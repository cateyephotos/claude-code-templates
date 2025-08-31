/**
 * Error Boundary System
 * Implements defensive programming and graceful error handling
 */
class ErrorBoundary {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            showDetails: options.showDetails || false,
            enableReporting: options.enableReporting || true,
            fallbackContent: options.fallbackContent || null,
            onError: options.onError || null,
            retryAttempts: options.retryAttempts || 3,
            ...options
        };
        
        this.errorCount = 0;
        this.errorHistory = [];
        this.isInErrorState = false;
        
        this._setupErrorHandling();
    }

    /**
     * Setup global error handling for this boundary
     * @private
     */
    _setupErrorHandling() {
        // Wrap container methods
        this._wrapContainerMethods();
        
        // Setup unhandled promise rejection handling
        this._setupPromiseRejectionHandling();
        
        console.log(`Error boundary initialized for ${this.containerId}`);
    }

    /**
     * Wrap container methods with error handling
     * @private
     */
    _wrapContainerMethods() {
        if (!this.container) return;
        
        const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        
        Object.defineProperty(this.container, 'innerHTML', {
            set: (value) => {
                try {
                    originalInnerHTML.set.call(this.container, value);
                } catch (error) {
                    this._handleError(error, 'innerHTML assignment');
                }
            },
            get: originalInnerHTML.get
        });
    }

    /**
     * Setup promise rejection handling
     * @private
     */
    _setupPromiseRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            if (this._isRelatedToContainer(event.reason)) {
                this._handleError(event.reason, 'Unhandled Promise Rejection');
                event.preventDefault();
            }
        });
    }

    /**
     * Check if error is related to this container
     * @private
     */
    _isRelatedToContainer(error) {
        if (!error || !error.stack) return false;
        
        // Check if error stack contains container ID or related functionality
        const stackTrace = error.stack.toLowerCase();
        return stackTrace.includes(this.containerId.toLowerCase()) ||
               stackTrace.includes('citation') ||
               stackTrace.includes('supplement');
    }

    /**
     * Execute function with error boundary protection
     */
    async execute(fn, context = 'Unknown operation') {
        try {
            const result = await fn();
            this._onSuccess();
            return result;
        } catch (error) {
            return this._handleError(error, context);
        }
    }

    /**
     * Handle errors with graceful degradation
     * @private
     */
    _handleError(error, context) {
        this.errorCount++;
        const errorRecord = {
            error,
            context,
            timestamp: new Date().toISOString(),
            stackTrace: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errorHistory.push(errorRecord);
        console.error(`Error in ${this.containerId} (${context}):`, error);
        
        // Call custom error handler if provided
        if (this.options.onError) {
            try {
                this.options.onError(errorRecord);
            } catch (handlerError) {
                console.error('Error in custom error handler:', handlerError);
            }
        }
        
        // Report error if enabled
        if (this.options.enableReporting) {
            this._reportError(errorRecord);
        }
        
        // Show fallback UI
        this._showFallbackUI(errorRecord);
        
        return null;
    }

    /**
     * Show fallback UI when errors occur
     * @private
     */
    _showFallbackUI(errorRecord) {
        if (!this.container || this.isInErrorState) return;
        
        this.isInErrorState = true;
        
        const fallbackHTML = this.options.fallbackContent || 
            this._generateDefaultFallback(errorRecord);
        
        try {
            this.container.innerHTML = fallbackHTML;
            this.container.classList.add('error-state');
        } catch (fallbackError) {
            console.error('Failed to show fallback UI:', fallbackError);
            // Last resort: show minimal error message
            this.container.innerHTML = '<div class="text-red-500 p-4">An error occurred. Please refresh the page.</div>';
        }
    }

    /**
     * Generate default fallback content
     * @private
     */
    _generateDefaultFallback(errorRecord) {
        const showRetry = this.errorCount <= this.options.retryAttempts;
        
        return `
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="flex items-center mb-4">
                    <i class="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
                    <h3 class="text-lg font-semibold text-red-800">Something went wrong</h3>
                </div>
                
                <p class="text-red-700 mb-4">
                    We encountered an error while loading this content. 
                    ${showRetry ? 'You can try reloading this section or the entire page.' : 'Please refresh the page to continue.'}
                </p>
                
                ${showRetry ? `
                    <div class="flex space-x-3">
                        <button onclick="this.closest('.error-state').errorBoundary.retry()" 
                                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                            <i class="fas fa-redo mr-2"></i>Retry
                        </button>
                        <button onclick="location.reload()" 
                                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                            <i class="fas fa-refresh mr-2"></i>Reload Page
                        </button>
                    </div>
                ` : `
                    <button onclick="location.reload()" 
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                        <i class="fas fa-refresh mr-2"></i>Reload Page
                    </button>
                `}
                
                ${this.options.showDetails ? `
                    <details class="mt-4">
                        <summary class="cursor-pointer text-red-600 font-medium">Technical Details</summary>
                        <div class="mt-2 p-3 bg-red-100 rounded text-sm">
                            <p><strong>Error:</strong> ${errorRecord.error.message}</p>
                            <p><strong>Context:</strong> ${errorRecord.context}</p>
                            <p><strong>Time:</strong> ${new Date(errorRecord.timestamp).toLocaleString()}</p>
                            ${this.options.showDetails === 'full' ? `
                                <details class="mt-2">
                                    <summary class="cursor-pointer">Stack Trace</summary>
                                    <pre class="mt-1 text-xs overflow-auto">${errorRecord.stackTrace}</pre>
                                </details>
                            ` : ''}
                        </div>
                    </details>
                ` : ''}
            </div>
        `;
    }

    /**
     * Retry the last failed operation
     */
    async retry() {
        if (this.errorCount > this.options.retryAttempts) {
            console.warn('Maximum retry attempts exceeded');
            return;
        }
        
        this.isInErrorState = false;
        this.container.classList.remove('error-state');
        
        // Attempt to restore previous state or reload content
        try {
            // Trigger a re-render of the container content
            if (window.app && window.app.renderSupplements) {
                await window.app.renderSupplements();
            } else {
                // Fallback: just clear the error state
                this.container.innerHTML = '<div class="text-gray-500 p-4">Retrying...</div>';
                setTimeout(() => location.reload(), 1000);
            }
        } catch (retryError) {
            this._handleError(retryError, 'Retry attempt');
        }
    }

    /**
     * Report error to external service (placeholder)
     * @private
     */
    _reportError(errorRecord) {
        // In a real application, you would send this to your error reporting service
        // e.g., Sentry, LogRocket, Bugsnag, etc.
        
        const reportData = {
            containerId: this.containerId,
            errorMessage: errorRecord.error.message,
            stackTrace: errorRecord.stackTrace,
            context: errorRecord.context,
            timestamp: errorRecord.timestamp,
            userAgent: errorRecord.userAgent,
            url: errorRecord.url,
            errorCount: this.errorCount
        };
        
        // Simulated reporting (replace with actual service)
        console.log('Error report would be sent:', reportData);
        
        // Example implementation for a real error reporting service:
        /*
        fetch('/api/error-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        }).catch(reportingError => {
            console.error('Failed to report error:', reportingError);
        });
        */
    }

    /**
     * Handle successful operations
     * @private
     */
    _onSuccess() {
        if (this.isInErrorState) {
            this.isInErrorState = false;
            this.container?.classList.remove('error-state');
        }
    }

    /**
     * Clear error history and reset state
     */
    reset() {
        this.errorCount = 0;
        this.errorHistory = [];
        this.isInErrorState = false;
        this.container?.classList.remove('error-state');
        console.log(`Error boundary reset for ${this.containerId}`);
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const recentErrors = this.errorHistory.filter(
            error => Date.now() - new Date(error.timestamp).getTime() < 300000 // Last 5 minutes
        );
        
        return {
            totalErrors: this.errorCount,
            recentErrors: recentErrors.length,
            isInErrorState: this.isInErrorState,
            errorHistory: this.errorHistory.slice(-10), // Last 10 errors
            containerExists: !!this.container
        };
    }

    /**
     * Cleanup error boundary
     */
    destroy() {
        this.container?.classList.remove('error-state');
        // Remove any event listeners if added
        console.log(`Error boundary destroyed for ${this.containerId}`);
    }
}

/**
 * Global Error Manager
 * Manages multiple error boundaries and provides centralized error handling
 */
class GlobalErrorManager {
    constructor() {
        this.boundaries = new Map();
        this.globalErrorCount = 0;
        this.isInitialized = false;
        
        this._setupGlobalHandlers();
    }

    /**
     * Setup global error handlers
     * @private
     */
    _setupGlobalHandlers() {
        if (this.isInitialized) return;
        
        // Global error handler
        window.addEventListener('error', (event) => {
            this.globalErrorCount++;
            console.error('Global error caught:', event.error);
            this._notifyBoundaries(event.error, 'Global Error');
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.globalErrorCount++;
            console.error('Unhandled promise rejection:', event.reason);
            this._notifyBoundaries(event.reason, 'Promise Rejection');
        });
        
        this.isInitialized = true;
        console.log('Global error manager initialized');
    }

    /**
     * Create and register an error boundary
     */
    createBoundary(containerId, options = {}) {
        const boundary = new ErrorBoundary(containerId, options);
        this.boundaries.set(containerId, boundary);
        
        // Add reference to boundary on container for retry functionality
        const container = document.getElementById(containerId);
        if (container) {
            container.errorBoundary = boundary;
        }
        
        return boundary;
    }

    /**
     * Get error boundary by container ID
     */
    getBoundary(containerId) {
        return this.boundaries.get(containerId);
    }

    /**
     * Notify all boundaries of global errors
     * @private
     */
    _notifyBoundaries(error, context) {
        for (const [containerId, boundary] of this.boundaries) {
            if (boundary.options.onError) {
                try {
                    boundary.options.onError({
                        error,
                        context: `Global: ${context}`,
                        timestamp: new Date().toISOString(),
                        containerId
                    });
                } catch (notifyError) {
                    console.error(`Failed to notify boundary ${containerId}:`, notifyError);
                }
            }
        }
    }

    /**
     * Get global error statistics
     */
    getGlobalStats() {
        const boundaryStats = {};
        for (const [containerId, boundary] of this.boundaries) {
            boundaryStats[containerId] = boundary.getErrorStats();
        }
        
        return {
            globalErrorCount: this.globalErrorCount,
            totalBoundaries: this.boundaries.size,
            boundaries: boundaryStats,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Reset all error boundaries
     */
    resetAll() {
        for (const boundary of this.boundaries.values()) {
            boundary.reset();
        }
        this.globalErrorCount = 0;
        console.log('All error boundaries reset');
    }

    /**
     * Cleanup all boundaries
     */
    destroy() {
        for (const boundary of this.boundaries.values()) {
            boundary.destroy();
        }
        this.boundaries.clear();
        console.log('Global error manager destroyed');
    }
}

// Export for ES6 modules
export { ErrorBoundary, GlobalErrorManager };

// Create global instance
window.GlobalErrorManager = new GlobalErrorManager();
window.ErrorBoundary = ErrorBoundary;