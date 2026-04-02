#!/usr/bin/env node

/**
 * resolve-citation-titles.js
 *
 * Scans enhanced citation files for studies with missing or suspiciously short
 * titles, resolves them against PubMed E-utilities, and writes the corrected
 * titles back into each file using targeted string replacement.
 *
 * Usage:
 *   node scripts/resolve-citation-titles.js [--dry-run] [--file <filename>]
 *
 * Options:
 *   --dry-run   Show what would change without writing files
 *   --file X    Process a single file (e.g., --file 33_l_tyrosine_enhanced.js)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ENHANCED_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');
const PUBMED_BATCH_SIZE = 200;
const PUBMED_DELAY_MS = 400;

// Titles that are empty or match these heuristics are considered "needs resolve"
const SUSPICIOUS_TITLE_MAX_WORDS = 2;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const fileIdx = args.indexOf('--file');
const singleFile = fileIdx !== -1 ? args[fileIdx + 1] : null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'SupplementDB-CitationResolver/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse JSON from PubMed: ' + e.message + '\nBody: ' + data.slice(0, 500)));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Returns true if the title is missing, empty, or suspiciously short.
 */
function titleNeedsResolving(title) {
  if (!title || typeof title !== 'string') return true;
  const trimmed = title.trim();
  if (trimmed === '') return true;
  const words = trimmed.split(/\s+/);
  if (words.length <= SUSPICIOUS_TITLE_MAX_WORDS) return true;
  return false;
}

/**
 * Extract the data object from a citation file's raw text.
 * Uses a sandboxed eval with mocked browser/node globals.
 */
function extractDataObject(fileContent, filePath) {
  const mockWindow = { enhancedCitations: {} };

  // Build a sandboxed script
  const wrappedCode = [
    '(function() {',
    '  var window = ' + JSON.stringify(mockWindow) + ';',
    '  window.enhancedCitations = window.enhancedCitations || {};',
    '  var module = { exports: null };',
    '  var exports = {};',
    '',
    fileContent,
    '',
    '  return module.exports || window.enhancedCitations[Object.keys(window.enhancedCitations).find(function(k) { return k !== "undefined"; })] || null;',
    '})()'
  ].join('\n');

  try {
    const result = eval(wrappedCode);
    return result;
  } catch (e) {
    console.error('  [ERROR] Failed to parse ' + path.basename(filePath) + ': ' + e.message);
    return null;
  }
}

/**
 * Walk through all citation sections and collect studies needing title resolution.
 * Returns an array of { pmid, currentTitle, sectionPath } objects.
 */
function collectStudiesNeedingTitles(dataObj) {
  const results = [];
  const citations = dataObj.citations || dataObj.citation || {};

  const sections = ['mechanisms', 'benefits', 'safety', 'dosage'];
  for (const section of sections) {
    const entries = citations[section];
    if (!Array.isArray(entries)) continue;

    for (let i = 0; i < entries.length; i++) {
      const evidence = entries[i].evidence;
      if (!Array.isArray(evidence)) continue;

      for (let j = 0; j < evidence.length; j++) {
        const study = evidence[j];
        if (!study.pmid) continue;

        const pmid = String(study.pmid).trim();
        if (!pmid || pmid === 'undefined' || pmid === 'null') continue;

        if (titleNeedsResolving(study.title)) {
          results.push({
            pmid: pmid,
            currentTitle: study.title || '',
            section: section,
            entryIndex: i,
            evidenceIndex: j
          });
        }
      }
    }
  }

  return results;
}

/**
 * Batch-resolve PMIDs against PubMed E-utilities.
 * Returns a Map of pmid -> resolvedTitle.
 */
async function resolvePMIDs(pmids) {
  const titleMap = new Map();
  const uniquePMIDs = [...new Set(pmids)];

  for (let i = 0; i < uniquePMIDs.length; i += PUBMED_BATCH_SIZE) {
    const batch = uniquePMIDs.slice(i, i + PUBMED_BATCH_SIZE);
    const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + batch.join(',') + '&retmode=json';

    try {
      const data = await fetchJSON(url);
      if (data.result) {
        for (const pmid of batch) {
          const entry = data.result[pmid];
          if (entry && entry.title) {
            titleMap.set(pmid, entry.title);
          }
        }
      }
    } catch (e) {
      console.error('  [ERROR] PubMed batch request failed: ' + e.message);
    }

    // Rate limit: wait between batches
    if (i + PUBMED_BATCH_SIZE < uniquePMIDs.length) {
      await sleep(PUBMED_DELAY_MS);
    }
  }

  return titleMap;
}

/**
 * Apply resolved titles back to the file using targeted string replacement.
 * For each study, find the PMID in the file text, then locate the nearest
 * "title" field and replace its value.
 */
function applyTitlesToFile(fileContent, studiesWithNewTitles) {
  var modified = fileContent;

  for (const item of studiesWithNewTitles) {
    var pmid = item.pmid;
    var currentTitle = item.currentTitle;
    var newTitle = item.newTitle;

    // Escape special regex characters in the current title
    var escapedCurrentTitle = currentTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Find all positions of this PMID in the file
    // Handle: "pmid": "123", pmid: "123", "pmid": 123, pmid: 123
    var pmidPattern = new RegExp('(?:"pmid"|pmid)\\s*:\\s*"?' + pmid + '"?(?=[,\\s\\n\\r}])', 'g');
    var pmidMatch;
    var replaced = false;

    while ((pmidMatch = pmidPattern.exec(modified)) !== null) {
      var pmidPos = pmidMatch.index;

      // Search within 2000 chars around the PMID for the title field
      var searchStart = Math.max(0, pmidPos - 2000);
      var searchEnd = Math.min(modified.length, pmidPos + 2000);
      var region = modified.substring(searchStart, searchEnd);
      var pmidOffsetInRegion = pmidPos - searchStart;

      // Find the "title": "..." or title: "..." pattern in this region
      var titleRegex = new RegExp('(?:"title"|title)\\s*:\\s*"' + escapedCurrentTitle + '"', 'g');
      var titleMatch;
      var closestMatch = null;
      var closestDist = Infinity;

      while ((titleMatch = titleRegex.exec(region)) !== null) {
        var dist = Math.abs(titleMatch.index - pmidOffsetInRegion);
        if (dist < closestDist) {
          closestDist = dist;
          closestMatch = titleMatch;
        }
      }

      if (closestMatch) {
        // Replace in the original string at the correct absolute position
        var absStart = searchStart + closestMatch.index;
        var absEnd = absStart + closestMatch[0].length;

        // Escape the new title for JSON string
        var escapedNewTitle = newTitle
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');

        // Preserve the original key format (quoted vs unquoted, spacing)
        // The matched text is like: "title": "old" or title:  "old"
        // We want to keep everything before the value's opening quote
        var matchedText = closestMatch[0];
        var colonPos = matchedText.indexOf(':');
        // Find the first quote after the colon — that starts the value
        var valueQuotePos = matchedText.indexOf('"', colonPos + 1);
        var prefix = matchedText.substring(0, valueQuotePos);
        var replacement = prefix + '"' + escapedNewTitle + '"';
        modified = modified.substring(0, absStart) + replacement + modified.substring(absEnd);
        replaced = true;
        break; // Only replace once per PMID
      }
    }

    if (!replaced) {
      console.warn('  [WARN] Could not locate title for PMID ' + pmid + ' in file text');
    }
  }

  return modified;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  var prefix = dryRun ? '[DRY RUN] ' : '';
  console.log(prefix + 'Resolve Citation Titles - PubMed E-utilities');
  console.log(prefix + 'Enhanced citations dir: ' + ENHANCED_DIR);
  console.log('');

  // Collect files to process
  var files;
  if (singleFile) {
    var fullPath = path.join(ENHANCED_DIR, singleFile);
    if (!fs.existsSync(fullPath)) {
      console.error('File not found: ' + fullPath);
      process.exit(1);
    }
    files = [singleFile];
  } else {
    var allEntries = fs.readdirSync(ENHANCED_DIR, { withFileTypes: true });
    files = allEntries
      .filter(function(e) { return e.isFile() && e.name.endsWith('.js'); })
      .map(function(e) { return e.name; });
  }

  console.log(prefix + 'Files to scan: ' + files.length);
  console.log('');

  // Phase 1: Scan all files and collect PMIDs that need resolution
  var fileStudyMap = new Map();
  var totalPMIDsNeeded = 0;
  var allPMIDs = new Set();

  for (const fileName of files) {
    var filePath = path.join(ENHANCED_DIR, fileName);
    var content = fs.readFileSync(filePath, 'utf-8');

    var dataObj = extractDataObject(content, filePath);
    if (!dataObj) {
      continue;
    }

    var studies = collectStudiesNeedingTitles(dataObj);
    if (studies.length > 0) {
      fileStudyMap.set(fileName, studies);
      for (const s of studies) {
        allPMIDs.add(s.pmid);
      }
      totalPMIDsNeeded += studies.length;
    }
  }

  console.log(prefix + 'Files with missing/short titles: ' + fileStudyMap.size);
  console.log(prefix + 'Total studies needing titles: ' + totalPMIDsNeeded);
  console.log(prefix + 'Unique PMIDs to resolve: ' + allPMIDs.size);
  console.log('');

  if (allPMIDs.size === 0) {
    console.log(prefix + 'Nothing to do. All titles are already populated.');
    return;
  }

  // Phase 2: Resolve PMIDs against PubMed
  console.log(prefix + 'Resolving PMIDs against PubMed E-utilities...');
  var batchCount = Math.ceil(allPMIDs.size / PUBMED_BATCH_SIZE);
  console.log(prefix + 'Batches: ' + batchCount + ' (up to ' + PUBMED_BATCH_SIZE + ' PMIDs each, ' + PUBMED_DELAY_MS + 'ms delay)');
  console.log('');

  var titleMap = await resolvePMIDs([...allPMIDs]);

  console.log(prefix + 'Resolved ' + titleMap.size + ' / ' + allPMIDs.size + ' PMIDs from PubMed');

  // Check for unresolved
  var unresolvedList = [...allPMIDs].filter(function(p) { return !titleMap.has(p); });
  if (unresolvedList.length > 0) {
    console.log(prefix + 'Unresolved PMIDs (' + unresolvedList.length + '): ' + unresolvedList.join(', '));
  }
  console.log('');

  // Phase 3: Apply titles to files
  var summaryRows = [];
  var totalUpdated = 0;

  for (const [fileName, studies] of fileStudyMap) {
    var filePath = path.join(ENHANCED_DIR, fileName);
    var content = fs.readFileSync(filePath, 'utf-8');

    var studiesWithNewTitles = [];
    for (const study of studies) {
      var resolvedTitle = titleMap.get(study.pmid);
      if (resolvedTitle) {
        studiesWithNewTitles.push({
          pmid: study.pmid,
          currentTitle: study.currentTitle,
          newTitle: resolvedTitle
        });
      }
    }

    if (studiesWithNewTitles.length === 0) {
      continue;
    }

    var modifiedContent = applyTitlesToFile(content, studiesWithNewTitles);

    if (modifiedContent !== content) {
      if (!dryRun) {
        fs.writeFileSync(filePath, modifiedContent, 'utf-8');
      }

      summaryRows.push({
        file: fileName,
        pmidsResolved: studiesWithNewTitles.length,
        titlesUpdated: studiesWithNewTitles.length
      });
      totalUpdated += studiesWithNewTitles.length;

      // Log individual changes
      for (const s of studiesWithNewTitles) {
        var oldDisplay = s.currentTitle ? ('"' + s.currentTitle + '"') : '(empty)';
        var truncatedNew = s.newTitle.length > 80 ? s.newTitle.substring(0, 80) + '...' : s.newTitle;
        console.log('  ' + fileName + ' | PMID ' + s.pmid + ': ' + oldDisplay + ' -> "' + truncatedNew + '"');
      }
    }
  }

  // Phase 4: Summary
  console.log('');
  console.log(prefix + '=== SUMMARY ===');
  console.log('');

  if (summaryRows.length === 0) {
    console.log(prefix + 'No changes made.');
    return;
  }

  // Table header
  var maxFileLen = Math.max(10, ...summaryRows.map(function(r) { return r.file.length; }));
  var header = 'File'.padEnd(maxFileLen) + ' | PMIDs Resolved | Titles Updated';
  var separator = '-'.repeat(header.length);
  console.log(header);
  console.log(separator);

  for (const row of summaryRows) {
    console.log(
      row.file.padEnd(maxFileLen) + ' | ' + String(row.pmidsResolved).padStart(14) + ' | ' + String(row.titlesUpdated).padStart(14)
    );
  }

  console.log(separator);
  console.log('TOTAL'.padEnd(maxFileLen) + ' | ' + String(totalUpdated).padStart(14) + ' | ' + String(totalUpdated).padStart(14));
  console.log('');
  console.log(prefix + (dryRun ? 'Would update' : 'Updated') + ' ' + totalUpdated + ' titles across ' + summaryRows.length + ' files.');
}

main().catch(function(e) {
  console.error('Fatal error:', e);
  process.exit(1);
});
