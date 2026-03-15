'use strict';
const path = require('path');

const ROOT = path.join(__dirname, '..');

module.exports = {
  paths: {
    root: ROOT,
    dataDir: path.join(ROOT, 'data'),
    supplementsJs: path.join(ROOT, 'data', 'supplements.js'),
    citationsJs: path.join(ROOT, 'data', 'citations.js'),
    enhancedCitations: path.join(ROOT, 'data', 'enhanced_citations'),
    supplementPages: path.join(ROOT, 'supplements-new'),
    guides: path.join(ROOT, 'guides'),
    healingReports: path.join(ROOT, '..', 'healing-reports'),
    scrapedJsonDir: path.join(ROOT, '..'),
  },

  tiers: {
    autoFix: {
      categories: [
        'whitespace', 'casing', 'formatting', 'trailing-slash',
        'duplicate-space', 'missing-protocol', 'doi-prefix-case'
      ],
      minConfidence: 0.99,
    },
    fixAndReport: {
      categories: [
        'malformed-doi', 'missing-pmid', 'pmid-mismatch', 'missing-field',
        'stale-link', 'doi-lookup', 'title-mismatch', 'year-mismatch',
        'journal-normalization'
      ],
      minConfidence: 0.80,
    },
    askBeforeFixing: {
      categories: [
        'remove-citation', 'change-evidence-tier', 'alter-study-type',
        'merge-duplicates', 'change-dosage', 'reclassify-mechanism',
        'change-safety-rating'
      ],
      minConfidence: 0,
    },
  },

  apis: {
    pubmed: {
      baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
      rateLimit: 3,
      batchSize: 200,
      retryAttempts: 3,
      retryDelayMs: 1000,
    },
    crossref: {
      baseUrl: 'https://api.crossref.org/',
      rateLimit: 50,
      retryAttempts: 3,
      retryDelayMs: 500,
    },
  },

  quality: {
    minCitationsPerSection: 2,
    minEvidenceTiers: 1,
    maxEmptySections: 0,
    checkScreenshots: true,
    minSupplements: 93,
  },

  schema: {
    evidenceItemRequired: [
      'citationId', 'title', 'authors', 'year', 'journal', 'doi', 'pmid', 'studyType'
    ],
    evidenceItemRecommended: [
      'evidenceLevel', 'findings', 'methodology'
    ],
    evidenceProfileRequired: [
      'overallQuality', 'totalCitations', 'researchQualityScore',
      'lastEvidenceUpdate', 'evidenceStrength', 'researchMaturity'
    ],
    topLevelRequired: ['id', 'name', 'evidenceProfile', 'citations'],
    citationSections: ['mechanisms', 'benefits', 'safety', 'dosage'],
    groupKeyFields: {
      mechanisms: 'mechanism',
      benefits: 'healthDomain',
      safety: 'safetyAspect',
      dosage: 'dosageRange',
    },
  },

  scraped: {
    expectedCategories: [
      'mechanisms', 'clinical_benefits', 'safety', 'dosage',
      'exercise_performance', 'neuroprotection'
    ],
    findingRequired: ['category', 'citation', 'doi', 'type', 'key_findings'],
    findingRecommended: ['pmid', 'methodology', 'quality_indicators'],
  },
};
