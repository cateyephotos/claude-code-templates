/**
 * Extract ALL PMIDs and DOIs from enhanced citation files
 * Outputs structured JSON for validation against PubMed
 *
 * Handles BOTH citation formats:
 *   1. JSON-style quoted keys: "pmid": "12345", "doi": "10.xxx", "title": "..."
 *   2. JS object literal unquoted keys: pmid: "12345", doi: "10.xxx", claim: "..."
 *   3. Files with PMIDs but no DOIs (older format)
 *
 * Strategy: Find every pmid occurrence, then extract the surrounding citation
 * object context to get associated fields (title/claim, doi, year, journal, authors)
 *
 * Usage: node supp-db-site/tools/extract_all_citations.js > supp-db-site/tools/citation_audit.json
 */

const fs = require('fs');
const path = require('path');

const CITATIONS_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');

/**
 * Find the enclosing object boundaries for a given position in the text.
 * Walks backwards to find '{' and forwards to find matching '}', handling nesting.
 */
function findEnclosingObject(content, position) {
    // Walk backwards to find the opening brace
    let braceDepth = 0;
    let start = position;
    for (let i = position; i >= 0; i--) {
        if (content[i] === '}') braceDepth++;
        if (content[i] === '{') {
            if (braceDepth === 0) {
                start = i;
                break;
            }
            braceDepth--;
        }
    }

    // Walk forwards to find the closing brace
    braceDepth = 0;
    let end = position;
    for (let i = start; i < content.length; i++) {
        if (content[i] === '{') braceDepth++;
        if (content[i] === '}') {
            braceDepth--;
            if (braceDepth === 0) {
                end = i + 1;
                break;
            }
        }
    }

    return content.substring(start, end);
}

/**
 * Extract a field value from a citation block text.
 * Handles both quoted and unquoted key formats.
 */
function extractField(block, fieldName) {
    // Match: "fieldName": "value" OR fieldName: "value" OR "fieldName": value
    const patterns = [
        new RegExp(`"?${fieldName}"?\\s*:\\s*"([^"]*)"`, 'i'),      // string value in quotes
        new RegExp(`"?${fieldName}"?\\s*:\\s*(\\d{4})(?=[,\\s}])`, 'i'), // numeric year
    ];

    for (const pattern of patterns) {
        const match = block.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Extract authors array from a citation block.
 */
function extractAuthors(block) {
    const authorsMatch = block.match(/"?authors"?\s*:\s*\[([^\]]*)\]/);
    if (authorsMatch) {
        const authorList = authorsMatch[1].match(/"([^"]+)"/g);
        return authorList ? authorList.map(a => a.replace(/"/g, '')) : [];
    }
    return [];
}

/**
 * Extract citation text from block - handles both 'citation' field and
 * constructs from details/claim for older formats
 */
function extractCitationText(block) {
    return extractField(block, 'citation');
}

function extractCitationsFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    // Extract supplement ID from filename
    const idMatch = fileName.match(/^(\d+)_/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    // Extract supplement name from the file content
    const nameMatch = content.match(/"?supplementName"?\s*:\s*"([^"]+)"/);
    const supplementName = nameMatch ? nameMatch[1] : fileName.replace(/\.js$/, '');

    const citations = [];
    const seenPmids = new Set();

    // Find ALL pmid occurrences using a universal regex
    // Handles: "pmid": "12345", pmid: "12345", "pmid": 12345, pmid: 12345
    const pmidRegex = /"?pmid"?\s*:\s*"?(\d+)"?/g;
    let match;

    while ((match = pmidRegex.exec(content)) !== null) {
        const pmid = match[1];
        const matchPosition = match.index;

        // Skip if we already captured this pmid at this position
        // (some files may have duplicate pmid entries)
        if (seenPmids.has(pmid + ':' + matchPosition)) continue;
        seenPmids.add(pmid + ':' + matchPosition);

        // Find the enclosing object block for this pmid
        const block = findEnclosingObject(content, matchPosition);

        // Extract all available fields from the block
        const doi = extractField(block, 'doi');
        const title = extractField(block, 'title');
        const claim = extractField(block, 'claim');
        const year = extractField(block, 'year');
        const journal = extractField(block, 'journal');
        const studyType = extractField(block, 'studyType');
        const citationId = extractField(block, 'citationId');
        const citationText = extractCitationText(block);
        const authors = extractAuthors(block);
        const details = extractField(block, 'details');

        // Use title if available, otherwise use claim (the two naming conventions)
        const displayTitle = title || claim || null;

        // Try to extract first author from details or citation text if not in authors array
        let firstAuthor = authors.length > 0 ? authors[0] : null;
        if (!firstAuthor && details) {
            // Try to extract "AuthorName et al." pattern from details
            const authorFromDetails = details.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+et\s+al\./);
            if (authorFromDetails) firstAuthor = authorFromDetails[1];
        }
        if (!firstAuthor && citationText) {
            // Try to extract from citation string "Author et al. Journal. Year"
            const authorFromCitation = citationText.match(/^([A-Z][a-z]+(?:\s[A-Z]+)?)\s+(?:et\s+al\.|&)/);
            if (authorFromCitation) firstAuthor = authorFromCitation[1];
        }

        citations.push({
            citationId: citationId || null,
            title: displayTitle,
            pmid: pmid,
            doi: doi || null,
            year: year ? parseInt(year) : null,
            journal: journal || null,
            studyType: studyType || null,
            firstAuthor: firstAuthor,
            hasCitationField: title !== null, // true = newer format with 'title', false = older format with 'claim'
            format: title ? 'title-format' : (claim ? 'claim-format' : 'unknown')
        });
    }

    // Deduplicate by pmid (keep first occurrence of each unique pmid within the file)
    const uniqueCitations = [];
    const uniquePmids = new Set();
    for (const c of citations) {
        if (!uniquePmids.has(c.pmid)) {
            uniquePmids.add(c.pmid);
            uniqueCitations.push(c);
        }
    }

    return {
        file: fileName,
        supplementId: id,
        supplementName,
        totalCitations: uniqueCitations.length,
        citationsWithDoi: uniqueCitations.filter(c => c.doi).length,
        citationsWithoutDoi: uniqueCitations.filter(c => !c.doi).length,
        citations: uniqueCitations
    };
}

// Process all files
const files = fs.readdirSync(CITATIONS_DIR)
    .filter(f => f.endsWith('.js') && !f.startsWith('_'))
    .sort((a, b) => {
        const aId = parseInt(a.match(/^(\d+)/)?.[1] || '999');
        const bId = parseInt(b.match(/^(\d+)/)?.[1] || '999');
        return aId - bId;
    });

const results = {
    extractionDate: new Date().toISOString(),
    totalFiles: files.length,
    supplements: [],
    summary: {
        totalCitations: 0,
        citationsWithPmid: 0,
        citationsWithDoi: 0,
        citationsWithBoth: 0,
        citationsWithPmidOnly: 0,
        filesWithDois: 0,
        filesWithoutDois: 0,
        uniquePmids: new Set(),
        uniqueDois: new Set()
    }
};

const pmidMap = {}; // Track which supplements use which PMIDs

for (const file of files) {
    const filePath = path.join(CITATIONS_DIR, file);
    const data = extractCitationsFromFile(filePath);
    results.supplements.push(data);

    let fileHasDois = false;

    for (const c of data.citations) {
        results.summary.totalCitations++;
        const hasPmid = !!c.pmid;
        const hasDoi = !!c.doi;

        if (hasPmid) results.summary.citationsWithPmid++;
        if (hasDoi) {
            results.summary.citationsWithDoi++;
            fileHasDois = true;
        }
        if (hasPmid && hasDoi) results.summary.citationsWithBoth++;
        if (hasPmid && !hasDoi) results.summary.citationsWithPmidOnly++;

        if (hasPmid) {
            results.summary.uniquePmids.add(c.pmid);
            if (!pmidMap[c.pmid]) pmidMap[c.pmid] = [];
            pmidMap[c.pmid].push({ supplement: data.supplementName, title: c.title });
        }

        if (hasDoi) results.summary.uniqueDois.add(c.doi);
    }

    if (fileHasDois) results.summary.filesWithDois++;
    else results.summary.filesWithoutDois++;
}

// Find PMIDs used across multiple supplements
const crossSupplementPmids = [];
for (const [pmid, uses] of Object.entries(pmidMap)) {
    const uniqueSupplements = [...new Set(uses.map(u => u.supplement))];
    if (uniqueSupplements.length > 1) {
        crossSupplementPmids.push({ pmid, supplements: uniqueSupplements, count: uniqueSupplements.length });
    }
}

// Convert Sets to counts for JSON serialization
results.summary.uniquePmidCount = results.summary.uniquePmids.size;
results.summary.uniqueDoiCount = results.summary.uniqueDois.size;
results.summary.crossSupplementPmids = crossSupplementPmids;
delete results.summary.uniquePmids;
delete results.summary.uniqueDois;

// Output all unique PMIDs as flat list for batch validation
const allPmids = [];
for (const supp of results.supplements) {
    for (const c of supp.citations) {
        if (c.pmid) {
            allPmids.push({
                pmid: c.pmid,
                expectedTitle: c.title,
                expectedDoi: c.doi,
                expectedYear: c.year,
                expectedJournal: c.journal,
                expectedFirstAuthor: c.firstAuthor,
                supplement: supp.supplementName,
                file: supp.file
            });
        }
    }
}

results.allPmidsForValidation = allPmids;

console.log(JSON.stringify(results, null, 2));
