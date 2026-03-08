/**
 * Extract ALL PMIDs and DOIs from enhanced citation files
 * Outputs structured JSON for validation against PubMed
 *
 * Usage: node supp-db-site/tools/extract_all_citations.js > citation_audit.json
 */

const fs = require('fs');
const path = require('path');

const CITATIONS_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');

function extractCitationsFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    // Extract supplement name and ID from file
    const idMatch = fileName.match(/^(\d+)_/);
    const id = idMatch ? parseInt(idMatch[1]) : null;

    const citations = [];

    // Match all citation objects with pmid and/or doi
    // Look for objects that have title, pmid, doi fields
    const pmidMatches = content.matchAll(/"?pmid"?\s*:\s*"?(\d+)"?/g);
    const doiMatches = content.matchAll(/"?doi"?\s*:\s*"([^"]+)"/g);
    const titleMatches = content.matchAll(/"?title"?\s*:\s*"([^"]+)"/g);
    const authorMatches = content.matchAll(/"?authors"?\s*:\s*\[([^\]]*)\]/g);
    const yearMatches = content.matchAll(/"?year"?\s*:\s*(\d{4})/g);
    const journalMatches = content.matchAll(/"?journal"?\s*:\s*"([^"]+)"/g);
    const citationIdMatches = content.matchAll(/"?citationId"?\s*:\s*"([^"]+)"/g);

    const pmids = [...pmidMatches].map(m => m[1]);
    const dois = [...doiMatches].map(m => m[1]);
    const titles = [...titleMatches].map(m => m[1]);
    const years = [...yearMatches].map(m => parseInt(m[1]));
    const journals = [...journalMatches].map(m => m[1]);
    const citationIds = [...citationIdMatches].map(m => m[1]);

    // Extract supplement name
    const nameMatch = content.match(/"?name"?\s*:\s*"([^"]+)"/);
    const supplementName = nameMatch ? nameMatch[1] : fileName.replace(/\.js$/, '');

    // Build citation list - match by position in file
    // We need a more robust approach - parse the actual objects
    const evidenceBlockRegex = /\{[^{}]*?"?citationId"?\s*:\s*"[^"]*"[^{}]*?"?pmid"?\s*:\s*"?\d+"?[^{}]*\}/gs;
    const evidenceBlocks = content.matchAll(evidenceBlockRegex);

    for (const block of evidenceBlocks) {
        const blockText = block[0];
        const cidMatch = blockText.match(/"?citationId"?\s*:\s*"([^"]+)"/);
        const titleM = blockText.match(/"?title"?\s*:\s*"([^"]+)"/);
        const pmidM = blockText.match(/"?pmid"?\s*:\s*"?(\d+)"?/);
        const doiM = blockText.match(/"?doi"?\s*:\s*"([^"]+)"/);
        const yearM = blockText.match(/"?year"?\s*:\s*(\d{4})/);
        const journalM = blockText.match(/"?journal"?\s*:\s*"([^"]+)"/);
        const authorsM = blockText.match(/"?authors"?\s*:\s*\[([^\]]*)\]/);

        let authors = [];
        if (authorsM) {
            authors = authorsM[1].match(/"([^"]+)"/g)?.map(a => a.replace(/"/g, '')) || [];
        }

        citations.push({
            citationId: cidMatch ? cidMatch[1] : null,
            title: titleM ? titleM[1] : null,
            pmid: pmidM ? pmidM[1] : null,
            doi: doiM ? doiM[1] : null,
            year: yearM ? parseInt(yearM[1]) : null,
            journal: journalM ? journalM[1] : null,
            firstAuthor: authors.length > 0 ? authors[0] : null
        });
    }

    // Also catch citations that have pmid but no citationId (older format)
    const altBlockRegex = /\{[^{}]*?"?pmid"?\s*:\s*"?\d+"?[^{}]*?"?title"?\s*:\s*"[^"]*"[^{}]*\}/gs;
    const altBlocks = content.matchAll(altBlockRegex);
    const existingPmids = new Set(citations.map(c => c.pmid));

    for (const block of altBlocks) {
        const blockText = block[0];
        const pmidM = blockText.match(/"?pmid"?\s*:\s*"?(\d+)"?/);
        if (pmidM && existingPmids.has(pmidM[1])) continue; // skip duplicates

        const titleM = blockText.match(/"?title"?\s*:\s*"([^"]+)"/);
        const doiM = blockText.match(/"?doi"?\s*:\s*"([^"]+)"/);
        const yearM = blockText.match(/"?year"?\s*:\s*(\d{4})/);
        const journalM = blockText.match(/"?journal"?\s*:\s*"([^"]+)"/);

        citations.push({
            citationId: null,
            title: titleM ? titleM[1] : null,
            pmid: pmidM ? pmidM[1] : null,
            doi: doiM ? doiM[1] : null,
            year: yearM ? parseInt(yearM[1]) : null,
            journal: journalM ? journalM[1] : null,
            firstAuthor: null
        });
    }

    return {
        file: fileName,
        supplementId: id,
        supplementName,
        totalCitations: citations.length,
        citations
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
        citationsWithNeither: 0,
        uniquePmids: new Set(),
        uniqueDois: new Set(),
        duplicatePmids: []
    }
};

const pmidMap = {}; // Track which supplements use which PMIDs

for (const file of files) {
    const filePath = path.join(CITATIONS_DIR, file);
    const data = extractCitationsFromFile(filePath);
    results.supplements.push(data);

    for (const c of data.citations) {
        results.summary.totalCitations++;
        const hasPmid = !!c.pmid;
        const hasDoi = !!c.doi;

        if (hasPmid) results.summary.citationsWithPmid++;
        if (hasDoi) results.summary.citationsWithDoi++;
        if (hasPmid && hasDoi) results.summary.citationsWithBoth++;
        if (!hasPmid && !hasDoi) results.summary.citationsWithNeither++;

        if (hasPmid) {
            if (results.summary.uniquePmids.has(c.pmid)) {
                // Duplicate PMID - might be intentional (shared across supplements) or error
                if (!pmidMap[c.pmid]) pmidMap[c.pmid] = [];
                pmidMap[c.pmid].push({ supplement: data.supplementName, title: c.title });
            }
            results.summary.uniquePmids.add(c.pmid);
            if (!pmidMap[c.pmid]) pmidMap[c.pmid] = [];
            pmidMap[c.pmid].push({ supplement: data.supplementName, title: c.title });
        }

        if (hasDoi) results.summary.uniqueDois.add(c.doi);
    }
}

// Find PMIDs used across multiple supplements (legitimate) vs duplicate within same supplement (likely error)
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
delete results.summary.duplicatePmids;

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
