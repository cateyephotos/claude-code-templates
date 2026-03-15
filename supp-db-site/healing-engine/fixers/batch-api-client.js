'use strict';

const https = require('https');
const config = require('../config');
const { createLogger } = require('../utils/logger');

const logger = createLogger('batch-api-client');

function httpGet(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
        }
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function lookupPmidBatch(pmids) {
  if (!pmids || pmids.length === 0) return {};

  const results = {};
  const batchSize = config.apis.pubmed.batchSize;
  const delay = Math.ceil(1000 / config.apis.pubmed.rateLimit);

  for (let i = 0; i < pmids.length; i += batchSize) {
    const batch = pmids.slice(i, i + batchSize);
    const idList = batch.join(',');
    const url = `${config.apis.pubmed.baseUrl}esummary.fcgi?db=pubmed&id=${idList}&retmode=json`;

    for (let attempt = 0; attempt < config.apis.pubmed.retryAttempts; attempt++) {
      try {
        const resp = await httpGet(url);
        if (resp.data && resp.data.result) {
          for (const pmid of batch) {
            const entry = resp.data.result[pmid];
            if (entry && !entry.error) {
              results[pmid] = {
                title: entry.title || '',
                authors: (entry.authors || []).map(a => a.name),
                journal: entry.fulljournalname || entry.source || '',
                year: entry.pubdate ? parseInt(entry.pubdate) : null,
                doi: (entry.articleids || []).find(a => a.idtype === 'doi')?.value || '',
              };
            }
          }
        }
        break;
      } catch (e) {
        logger.warn(`PubMed batch attempt ${attempt + 1} failed: ${e.message}`);
        if (attempt < config.apis.pubmed.retryAttempts - 1) {
          await sleep(config.apis.pubmed.retryDelayMs * (attempt + 1));
        }
      }
    }

    if (i + batchSize < pmids.length) await sleep(delay);
  }

  return results;
}

async function lookupDoiCrossref(doi) {
  if (!doi) return null;
  const url = `${config.apis.crossref.baseUrl}works/${encodeURIComponent(doi)}`;

  for (let attempt = 0; attempt < config.apis.crossref.retryAttempts; attempt++) {
    try {
      const resp = await httpGet(url);
      if (resp.status === 200 && resp.data && resp.data.message) {
        const msg = resp.data.message;
        return {
          title: Array.isArray(msg.title) ? msg.title[0] : msg.title || '',
          authors: (msg.author || []).map(a => `${a.given || ''} ${a.family || ''}`.trim()),
          journal: msg['container-title'] ? msg['container-title'][0] : '',
          year: msg.published?.['date-parts']?.[0]?.[0] || null,
          doi: msg.DOI || doi,
          pmid: null,
        };
      }
      return null;
    } catch (e) {
      logger.warn(`CrossRef attempt ${attempt + 1} failed for ${doi}: ${e.message}`);
      if (attempt < config.apis.crossref.retryAttempts - 1) {
        await sleep(config.apis.crossref.retryDelayMs * (attempt + 1));
      }
    }
  }
  return null;
}

async function verifyCitation(citation) {
  const issues = [];

  if (citation.pmid) {
    const pubmedData = await lookupPmidBatch([citation.pmid]);
    const pm = pubmedData[citation.pmid];
    if (pm) {
      if (pm.title && citation.title) {
        const simScore = simpleSimilarity(pm.title, citation.title);
        if (simScore < 0.5) {
          issues.push({
            field: 'title',
            current: citation.title,
            expected: pm.title,
            similarity: simScore,
            source: 'pubmed',
          });
        }
      }
      if (pm.doi && citation.doi && pm.doi.toLowerCase() !== citation.doi.toLowerCase()) {
        issues.push({
          field: 'doi',
          current: citation.doi,
          expected: pm.doi,
          source: 'pubmed',
        });
      }
    }
  }

  return issues;
}

function simpleSimilarity(a, b) {
  if (!a || !b) return 0;
  const normalize = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1.0;

  const wordsA = new Set(na.split(/\s+/));
  const wordsB = new Set(nb.split(/\s+/));
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  return (2 * intersection.length) / (wordsA.size + wordsB.size);
}

module.exports = { lookupPmidBatch, lookupDoiCrossref, verifyCitation, simpleSimilarity };
