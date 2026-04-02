/**
 * SiteStats.js — Dynamic Database Statistics Module
 *
 * Computes all site-wide counts from the live supplement database
 * rather than relying on hardcoded numbers. Auto-binds to any HTML
 * element with a data-stat="<statKey>" attribute.
 *
 * Depends on: data/supplements.js (window.supplementDatabase)
 * Optional:   window.enhancedCitations (from EnhancedCitationLoader)
 *
 * Usage in HTML:
 *   <span data-stat="totalSupplements"></span>
 *   <span data-stat="totalCitations" data-stat-suffix="+"></span>
 *   <span data-stat="totalSupplements" data-stat-format="comma"></span>
 */
(function () {
    'use strict';

    // ── Core stat computation ────────────────────────────────────────────────

    function computeStats() {
        var db = window.supplementDatabase || window.supplementsData;
        if (!db || !db.supplements) {
            console.warn('[SiteStats] supplementDatabase not loaded yet');
            return null;
        }

        var supplements = db.supplements;
        var categories = db.categories || [];
        var healthDomains = db.healthDomains || [];

        // Total supplements
        var totalSupplements = supplements.length;

        // Total categories (from the categories array)
        var totalCategories = categories.length;

        // Total health domains
        var totalHealthDomains = healthDomains.length;

        // Unique categories from supplement entries (as cross-check)
        var uniqueCategories = {};
        supplements.forEach(function (s) {
            if (s.category) uniqueCategories[s.category] = true;
        });
        var uniqueCategoryCount = Object.keys(uniqueCategories).length;

        // Unique health domains from supplement entries
        var allHealthDomainSet = {};
        supplements.forEach(function (s) {
            if (s.healthDomains && Array.isArray(s.healthDomains)) {
                s.healthDomains.forEach(function (hd) {
                    allHealthDomainSet[hd] = true;
                });
            }
        });
        var uniqueHealthDomainCount = Object.keys(allHealthDomainSet).length;

        // Total key citations (from keyCitations arrays on each supplement)
        var totalKeyCitations = 0;
        supplements.forEach(function (s) {
            if (s.keyCitations && Array.isArray(s.keyCitations)) {
                totalKeyCitations += s.keyCitations.length;
            }
        });

        // Total enhanced evidence items (deep count from enhanced citations)
        var totalEvidenceItems = 0;
        var enhancedSupplementCount = 0;
        if (window.enhancedCitations) {
            var keys = Object.keys(window.enhancedCitations);
            enhancedSupplementCount = keys.length;
            keys.forEach(function (id) {
                var enh = window.enhancedCitations[id];
                if (enh && enh.citations) {
                    var sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
                    sections.forEach(function (section) {
                        if (enh.citations[section] && Array.isArray(enh.citations[section])) {
                            enh.citations[section].forEach(function (group) {
                                if (group.evidence && Array.isArray(group.evidence)) {
                                    totalEvidenceItems += group.evidence.length;
                                }
                            });
                        }
                    });
                }
            });
        }

        // Combined citation count: key citations + enhanced evidence items
        // This gives the "total research papers / citations" number
        var totalCombinedCitations = totalKeyCitations + totalEvidenceItems;

        // Supplements with enhanced citations
        var enhancedCount = 0;
        supplements.forEach(function (s) {
            if (s.isEnhanced || (s.enhancedCitations && s.enhancedCitations.isEnhanced)) {
                enhancedCount++;
            }
        });

        // Evidence tier distribution
        var tierDistribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
        supplements.forEach(function (s) {
            if (s.evidenceTier >= 1 && s.evidenceTier <= 4) {
                tierDistribution[s.evidenceTier]++;
            }
        });

        // Years of evidence: count distinct publication years across all citations
        var currentYear = new Date().getFullYear();
        var publicationYears = {};
        supplements.forEach(function (s) {
            if (s.keyCitations && Array.isArray(s.keyCitations)) {
                s.keyCitations.forEach(function (c) {
                    if (c.year) publicationYears[c.year] = true;
                });
            }
        });
        var yearsList = Object.keys(publicationYears).map(Number).sort();
        var earliestYear = yearsList.length > 0 ? yearsList[0] : currentYear;
        var latestYear = yearsList.length > 0 ? yearsList[yearsList.length - 1] : currentYear;
        // Span of years covered by our research base
        var yearsOfEvidence = latestYear - earliestYear;
        // Use distinct count if span is very large (>40 years from outlier old citations)
        var distinctYearsCount = yearsList.length;

        // Guide count — derived from guide links referenced in the DB
        // These are the health domain guides on the site
        var guideCount = 0;
        if (db.guides && Array.isArray(db.guides)) {
            guideCount = db.guides.length;
        } else {
            // Fallback: count from known guide structure
            // Guides map roughly to major health domains
            guideCount = countGuidePages();
        }

        // Safety profile distribution
        var safetyDistribution = { Excellent: 0, Good: 0, Moderate: 0, Caution: 0 };
        supplements.forEach(function (s) {
            if (s.safetyProfile && s.safetyProfile.rating) {
                if (safetyDistribution.hasOwnProperty(s.safetyProfile.rating)) {
                    safetyDistribution[s.safetyProfile.rating]++;
                }
            }
        });

        return {
            // Core counts
            totalSupplements: totalSupplements,
            totalCategories: totalCategories,
            totalHealthDomains: totalHealthDomains,
            uniqueCategoryCount: uniqueCategoryCount,
            uniqueHealthDomainCount: uniqueHealthDomainCount,

            // Citation/evidence counts
            totalKeyCitations: totalKeyCitations,
            totalEvidenceItems: totalEvidenceItems,
            totalCombinedCitations: totalCombinedCitations,
            totalResearchPapers: totalCombinedCitations, // alias

            // Enhanced data
            enhancedSupplementCount: enhancedSupplementCount,
            enhancedCount: enhancedCount,

            // Evidence quality
            tierDistribution: tierDistribution,
            tier1Count: tierDistribution[1],
            tier2Count: tierDistribution[2],
            tier3Count: tierDistribution[3],
            tier4Count: tierDistribution[4],

            // Safety
            safetyDistribution: safetyDistribution,
            excellentSafetyCount: safetyDistribution.Excellent,
            goodSafetyCount: safetyDistribution.Good,

            // Time
            yearsOfEvidence: yearsOfEvidence,
            distinctYearsCount: distinctYearsCount,
            earliestCitationYear: earliestYear,
            latestCitationYear: latestYear,
            currentYear: currentYear,

            // Guides
            totalGuides: guideCount,

            // Computed display values (with formatting hints)
            displayCitations: formatWithPlus(totalCombinedCitations),
            displaySupplements: String(totalSupplements),
            displayCategories: String(totalCategories),
            displayHealthDomains: String(totalHealthDomains),
            displayGuides: String(guideCount)
        };
    }

    /**
     * Count guide HTML pages by scanning known guide links.
     * This provides a fallback when guides aren't listed in the DB.
     */
    function countGuidePages() {
        // Known guide pages from the site structure
        var guideLinks = document.querySelectorAll('a[href*="guides/"]');
        var uniqueGuides = {};
        for (var i = 0; i < guideLinks.length; i++) {
            var href = guideLinks[i].getAttribute('href');
            if (href && href.match(/guides\/[\w-]+\.html/)) {
                uniqueGuides[href] = true;
            }
        }
        var count = Object.keys(uniqueGuides).length;
        return count > 0 ? count : 8; // minimum known guides
    }

    // ── Formatting helpers ───────────────────────────────────────────────────

    function formatNumber(num) {
        if (typeof num !== 'number') return String(num);
        return num.toLocaleString('en-US');
    }

    function formatWithPlus(num) {
        return formatNumber(num) + '+';
    }

    function roundToNearest(num, nearest) {
        return Math.floor(num / nearest) * nearest;
    }

    /**
     * Format a stat value based on data attributes on the element.
     *
     * data-stat-format: "comma" | "rounded" | "plus" | "raw"
     * data-stat-suffix: appended after the number (e.g., "+")
     * data-stat-prefix: prepended before the number (e.g., "$")
     * data-stat-round:  round to nearest N (e.g., "100" rounds 1383 → 1300)
     */
    function formatStat(value, el) {
        if (value === null || value === undefined) return '';

        var num = typeof value === 'number' ? value : value;
        var format = el.getAttribute('data-stat-format') || 'comma';
        var suffix = el.getAttribute('data-stat-suffix') || '';
        var prefix = el.getAttribute('data-stat-prefix') || '';
        var roundTo = parseInt(el.getAttribute('data-stat-round'), 10);

        if (typeof num === 'number') {
            if (roundTo && !isNaN(roundTo)) {
                num = roundToNearest(num, roundTo);
            }
            if (format === 'comma') {
                num = formatNumber(num);
            } else if (format === 'plus') {
                num = formatNumber(num) + '+';
                // Don't double-add the + if suffix also has it
                if (suffix === '+') suffix = '';
            } else if (format === 'rounded') {
                num = formatNumber(num);
            }
            // 'raw' leaves as-is
        }

        return prefix + String(num) + suffix;
    }

    // ── DOM binding ──────────────────────────────────────────────────────────

    function bindStats(stats) {
        if (!stats) return;

        var elements = document.querySelectorAll('[data-stat]');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var key = el.getAttribute('data-stat');
            if (stats.hasOwnProperty(key)) {
                var formatted = formatStat(stats[key], el);
                el.textContent = formatted;
            }
        }
    }

    /**
     * Update meta tags with dynamic stats.
     * Looks for meta tags with data-stat-meta="description" etc.
     * and replaces {statKey} placeholders.
     */
    function updateMetaStats(stats) {
        if (!stats) return;

        // Update meta description
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            var content = metaDesc.getAttribute('content');
            if (content) {
                metaDesc.setAttribute('content', replacePlaceholders(content, stats));
            }
        }

        // Update OG description
        var ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
            var content = ogDesc.getAttribute('content');
            if (content) {
                ogDesc.setAttribute('content', replacePlaceholders(content, stats));
            }
        }

        // Update Twitter description
        var twDesc = document.querySelector('meta[name="twitter:description"]');
        if (twDesc) {
            var content = twDesc.getAttribute('content');
            if (content) {
                twDesc.setAttribute('content', replacePlaceholders(content, stats));
            }
        }
    }

    function replacePlaceholders(text, stats) {
        return text.replace(/\{\{(\w+)\}\}/g, function (match, key) {
            if (stats.hasOwnProperty(key)) {
                var val = stats[key];
                return typeof val === 'number' ? formatNumber(val) : String(val);
            }
            return match;
        });
    }

    // ── Initialization ───────────────────────────────────────────────────────

    var _cachedStats = null;

    function getStats() {
        if (!_cachedStats) {
            _cachedStats = computeStats();
        }
        return _cachedStats;
    }

    function refreshStats() {
        _cachedStats = null;
        _cachedStats = computeStats();
        if (_cachedStats) {
            bindStats(_cachedStats);
        }
        return _cachedStats;
    }

    function init() {
        var stats = computeStats();
        if (stats) {
            _cachedStats = stats;
            bindStats(stats);
            updateMetaStats(stats);
        }
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            // Delay slightly to ensure supplements.js and enhanced citations are loaded
            setTimeout(init, 100);
        });
    } else {
        setTimeout(init, 100);
    }

    // Also re-bind after enhanced citations finish loading
    // (EnhancedCitationLoader fires a custom event)
    document.addEventListener('enhancedCitationsLoaded', function () {
        refreshStats();
    });

    // ── Public API ───────────────────────────────────────────────────────────

    window.SiteStats = {
        getStats: getStats,
        refreshStats: refreshStats,
        computeStats: computeStats,
        init: init,
        formatNumber: formatNumber,
        formatWithPlus: formatWithPlus
    };

})();
