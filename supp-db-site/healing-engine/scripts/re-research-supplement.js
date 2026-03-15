'use strict';

const fs = require('fs');
const path = require('path');
const { loadEnhancedFile } = require('../utils/schema');
const { searchPubMed, lookupPmidBatch, simpleSimilarity } = require('../fixers/batch-api-client');
const config = require('../config');

const ENH_DIR = path.join(__dirname, '..', '..', 'data', 'enhanced_citations');
const QUALITY_DIR = path.join(ENH_DIR, '_quality');
const REPORT_DIR = path.join(__dirname, '..', '..', '..', 'healing-reports', 'remediation');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Search PubMed for a specific scientific claim and return ranked candidates.
 */
async function reResearchClaim(options) {
  const { claimText, supplementName, section, maxCandidates = 5 } = options;

  // Build search query: supplement name + key terms from claim
  const query = `${supplementName} ${claimText}`.substring(0, 300);
  const pmids = await searchPubMed(query, { maxResults: maxCandidates * 2 });

  if (pmids.length === 0) return [];

  await sleep(350); // PubMed rate limit
  const metadata = await lookupPmidBatch(pmids);

  // Score and rank candidates
  const candidates = [];
  for (const pmid of pmids) {
    const pm = metadata[pmid];
    if (!pm || !pm.title) continue;

    const titleSim = simpleSimilarity(claimText, pm.title);
    const supplementMention = pm.title.toLowerCase().includes(supplementName.toLowerCase()) ? 0.2 : 0;
    const relevanceScore = parseFloat((titleSim * 0.7 + supplementMention + 0.1).toFixed(3));

    candidates.push({
      pmid,
      title: pm.title,
      authors: pm.authors || [],
      year: pm.year,
      journal: pm.journal || '',
      doi: pm.doi || '',
      relevanceScore,
      titleSimilarity: parseFloat(titleSim.toFixed(3))
    });
  }

  // Sort by relevance, take top N
  candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return candidates.slice(0, maxCandidates);
}

/**
 * Re-research all claims for a single supplement file.
 * Reads quality sidecar to know which items need re-research.
 */
async function reResearchSupplement(filename, options = {}) {
  const { maxCandidatesPerClaim = 5, onlyMismatched = false } = options;

  const filePath = path.join(ENH_DIR, filename);
  const data = loadEnhancedFile(filePath);
  if (!data || !data.citations) return null;

  const supplementName = data.supplementName || data.name || '';

  // Load quality sidecar if available
  const qualityFile = path.join(QUALITY_DIR, filename.replace('_enhanced.js', '_quality.json'));
  let qualityData = null;
  if (fs.existsSync(qualityFile)) {
    qualityData = JSON.parse(fs.readFileSync(qualityFile, 'utf8'));
  }

  const claims = [];
  const sectionKeys = config.schema.citationSections;
  const groupKeys = config.schema.groupKeyFields;

  for (const section of sectionKeys) {
    const sectionArr = data.citations[section];
    if (!Array.isArray(sectionArr)) continue;

    for (let ci = 0; ci < sectionArr.length; ci++) {
      const citation = sectionArr[ci];
      const groupKey = groupKeys[section];
      const claimText = citation[groupKey] || citation.claim || citation.specificClaim || '';

      if (!claimText) continue;

      // Check if this claim has mismatched evidence
      let needsReresearch = true;
      if (onlyMismatched && qualityData && Array.isArray(qualityData.items)) {
        const claimItems = qualityData.items.filter(
          i => i.section === section && i.citationIdx === ci
        );
        // If quality data exists, only re-research mismatched/unverifiable claims
        needsReresearch = claimItems.some(
          i => i.status === 'mismatched' || i.status === 'unverifiable' || i.status === 'pmid_not_found' || i.status === 'no_pmid'
        );
      }
      // When onlyMismatched is set but no quality sidecar exists, research all claims

      if (!needsReresearch) continue;

      const candidates = await reResearchClaim({
        claimText, supplementName, section,
        maxCandidates: maxCandidatesPerClaim
      });

      claims.push({
        section, citationIdx: ci,
        claimText: claimText.substring(0, 200),
        currentEvidence: (citation.evidence || []).map(ev => ({
          pmid: ev.pmid || '', doi: ev.doi || '', title: (ev.title || '').substring(0, 100)
        })),
        candidates,
        topCandidateScore: candidates.length > 0 ? candidates[0].relevanceScore : 0
      });

      await sleep(400); // Rate limit between claims
    }
  }

  const result = {
    file: filename,
    supplementName,
    timestamp: new Date().toISOString(),
    totalClaims: claims.length,
    claimsWithCandidates: claims.filter(c => c.candidates.length > 0).length,
    avgTopScore: claims.length > 0
      ? parseFloat((claims.reduce((s, c) => s + c.topCandidateScore, 0) / claims.length).toFixed(3))
      : 0,
    claims
  };

  return result;
}

// CLI
if (require.main === module) {
  const targetFile = process.argv.find(a => a.endsWith('_enhanced.js'));
  const dryRun = process.argv.includes('--dry-run');

  if (!targetFile) {
    console.error('Usage: node re-research-supplement.js <filename_enhanced.js> [--dry-run]');
    process.exit(1);
  }

  reResearchSupplement(path.basename(targetFile), { onlyMismatched: true })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));

      if (!dryRun && result) {
        if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
        const reportName = path.basename(targetFile).replace('_enhanced.js', '-remediation.json');
        fs.writeFileSync(path.join(REPORT_DIR, reportName), JSON.stringify(result, null, 2));
        console.log(`\nReport saved to healing-reports/remediation/${reportName}`);
      }
    })
    .catch(console.error);
}

module.exports = { reResearchClaim, reResearchSupplement };
