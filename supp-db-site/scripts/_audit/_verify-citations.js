#!/usr/bin/env node
/**
 * _verify-citations.js — Comprehensive citation verification & correction
 *
 * Strategy:
 *   1. Convert all DOIs → PMIDs using NCBI ID Converter API (batch)
 *   2. Fetch PubMed metadata for all resolved PMIDs to verify title match
 *   3. For DOIs that don't resolve, search PubMed by title
 *   4. For 4 citations without DOIs, search PubMed by title
 *   5. Write verified-citations.json as single source of truth
 *
 * Usage: node scripts/_verify-citations.js
 */
const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'data', 'citations-to-verify.json');
const OUTPUT = path.join(__dirname, '..', 'data', 'verified-citations.json');

const TOOL = 'supplementdb';
const EMAIL = 'admin@supplementdb.info';
const RATE_LIMIT_MS = 350; // NCBI rate limit: ~3 requests/sec without API key

// ── Helpers ────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleSimilarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1.0;

  // Check if one contains the other (handles truncated titles)
  if (na.includes(nb) || nb.includes(na)) return 0.9;

  // Word overlap (Jaccard similarity)
  const wordsA = new Set(na.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(nb.split(' ').filter(w => w.length > 2));
  const intersection = [...wordsA].filter(w => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);
  return union.size > 0 ? intersection.length / union.size : 0;
}

// ── NCBI API calls ────────────────────────────────────────────────
async function batchConvertDois(dois) {
  // NCBI ID Converter accepts up to ~200 IDs per request
  const results = new Map(); // doi -> { pmid, pmcid }
  const batchSize = 50;

  for (let i = 0; i < dois.length; i += batchSize) {
    const batch = dois.slice(i, i + batchSize);
    const idsParam = batch.join(',');
    const url = `https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?tool=${TOOL}&email=${EMAIL}&ids=${encodeURIComponent(idsParam)}&format=json`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        console.error(`  ID Converter batch ${i}-${i + batch.length}: HTTP ${resp.status}`);
        await sleep(RATE_LIMIT_MS * 3);
        continue;
      }
      const data = await resp.json();
      if (data.records) {
        for (const rec of data.records) {
          if (rec.doi) {
            results.set(rec.doi.toLowerCase(), {
              pmid: rec.pmid || null,
              pmcid: rec.pmcid || null,
              doi: rec.doi,
              status: rec.status || 'ok'
            });
          }
        }
      }
      console.log(`  Converted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dois.length / batchSize)}: ${data.records ? data.records.length : 0} results`);
    } catch (err) {
      console.error(`  ID Converter batch error: ${err.message}`);
    }
    await sleep(RATE_LIMIT_MS);
  }
  return results;
}

async function fetchPubMedMetadata(pmids) {
  // EFetch returns XML, we'll parse title from it
  const results = new Map(); // pmid -> { title, authors, year, doi, journal }
  const batchSize = 50;

  for (let i = 0; i < pmids.length; i += batchSize) {
    const batch = pmids.slice(i, i + batchSize);
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${batch.join(',')}&retmode=json&tool=${TOOL}&email=${EMAIL}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        console.error(`  EFetch batch ${i}-${i + batch.length}: HTTP ${resp.status}`);
        await sleep(RATE_LIMIT_MS * 3);
        continue;
      }
      const data = await resp.json();
      if (data.result) {
        for (const pmid of batch) {
          const rec = data.result[pmid];
          if (rec && rec.title) {
            results.set(pmid, {
              title: rec.title.replace(/\.$/, ''), // Remove trailing period
              authors: rec.authors ? rec.authors.map(a => a.name).join(', ') : '',
              year: rec.pubdate ? rec.pubdate.substring(0, 4) : '',
              journal: rec.fulljournalname || rec.source || '',
              doi: rec.elocationid ? rec.elocationid.replace('doi: ', '') : '',
              sortpubdate: rec.sortpubdate || ''
            });
          }
        }
      }
      console.log(`  Fetched metadata batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pmids.length / batchSize)}: ${batch.length} PMIDs`);
    } catch (err) {
      console.error(`  EFetch error: ${err.message}`);
    }
    await sleep(RATE_LIMIT_MS);
  }
  return results;
}

async function searchByTitle(title) {
  // ESearch by title
  const cleanTitle = title
    .replace(/[:\-–—()[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(cleanTitle)}[Title]&retmode=json&retmax=5&tool=${TOOL}&email=${EMAIL}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.esearchresult?.idlist || [];
  } catch {
    return [];
  }
}

// ── DOI resolution via doi.org API ────────────────────────────────
async function resolveDoi(doi) {
  // CrossRef API to get metadata from DOI
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'SupplementDB/1.0 (admin@supplementdb.info)' }
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const msg = data.message;
    if (!msg) return null;
    return {
      title: Array.isArray(msg.title) ? msg.title[0] : msg.title || '',
      authors: (msg.author || []).map(a => `${a.family || ''} ${a.given || ''}`.trim()).join(', '),
      year: msg.published?.['date-parts']?.[0]?.[0]?.toString() ||
            msg['published-print']?.['date-parts']?.[0]?.[0]?.toString() ||
            msg.created?.['date-parts']?.[0]?.[0]?.toString() || '',
      journal: msg['container-title']?.[0] || '',
      doi: doi,
      type: msg.type || ''
    };
  } catch {
    return null;
  }
}

// ── Main verification pipeline ────────────────────────────────────
async function main() {
  console.log('=== Citation Verification & Correction Pipeline ===\n');

  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const allCitations = [...data.withPmid, ...data.doiOnly];
  console.log(`Total citations to verify: ${allCitations.length}`);
  console.log(`  With existing PMID: ${data.withPmid.length}`);
  console.log(`  DOI only: ${data.doiOnly.length}\n`);

  // Phase 1: Batch convert DOIs → PMIDs via NCBI
  console.log('── Phase 1: DOI → PMID conversion via NCBI ──');
  const doisToConvert = allCitations.filter(c => c.doi).map(c => c.doi);
  console.log(`  Converting ${doisToConvert.length} DOIs...`);
  const doiConversions = await batchConvertDois(doisToConvert);
  console.log(`  Resolved: ${[...doiConversions.values()].filter(v => v.pmid).length} PMIDs\n`);

  // Phase 2: For DOIs that didn't resolve via NCBI, try CrossRef for metadata
  console.log('── Phase 2: CrossRef fallback for unresolved DOIs ──');
  const unresolvedDois = doisToConvert.filter(doi => {
    const conv = doiConversions.get(doi.toLowerCase());
    return !conv || !conv.pmid;
  });
  console.log(`  ${unresolvedDois.length} DOIs need CrossRef lookup...`);

  const crossrefResults = new Map();
  for (let i = 0; i < unresolvedDois.length; i++) {
    const cr = await resolveDoi(unresolvedDois[i]);
    if (cr) crossrefResults.set(unresolvedDois[i].toLowerCase(), cr);
    if (i % 10 === 9) console.log(`  CrossRef: ${i + 1}/${unresolvedDois.length}`);
    await sleep(RATE_LIMIT_MS);
  }
  console.log(`  CrossRef resolved: ${crossrefResults.size} metadata records\n`);

  // Phase 3: Fetch PubMed metadata for all resolved PMIDs
  console.log('── Phase 3: PubMed metadata for resolved PMIDs ──');
  const resolvedPmids = [];
  for (const [doi, conv] of doiConversions) {
    if (conv.pmid) resolvedPmids.push(conv.pmid);
  }
  // Also include original PMIDs that might be correct
  for (const c of data.withPmid) {
    if (c.pmid && !resolvedPmids.includes(c.pmid)) {
      resolvedPmids.push(c.pmid);
    }
  }
  console.log(`  Fetching metadata for ${resolvedPmids.length} unique PMIDs...`);
  const pmidMeta = await fetchPubMedMetadata(resolvedPmids);
  console.log(`  Got metadata for ${pmidMeta.size} PMIDs\n`);

  // Phase 4: For citations without DOIs, search PubMed by title
  console.log('── Phase 4: Title search for citations without DOIs ──');
  const noDoi = allCitations.filter(c => !c.doi);
  const titleSearchResults = new Map();
  for (const c of noDoi) {
    const pmids = await searchByTitle(c.title);
    if (pmids.length > 0) {
      titleSearchResults.set(c.title, pmids);
      console.log(`  Found PMID for "${c.title.substring(0, 60)}...": ${pmids[0]}`);
    } else {
      console.log(`  No PMID found for "${c.title.substring(0, 60)}..."`);
    }
    await sleep(RATE_LIMIT_MS);
  }
  // Fetch metadata for title-search PMIDs
  const titlePmids = [...titleSearchResults.values()].flat();
  if (titlePmids.length > 0) {
    const titleMeta = await fetchPubMedMetadata(titlePmids);
    for (const [k, v] of titleMeta) pmidMeta.set(k, v);
  }
  console.log('');

  // Phase 5: Compile verified citations
  console.log('── Phase 5: Compiling verified citations ──');
  const verified = [];
  let verifiedCount = 0;
  let correctedCount = 0;
  let doiOnlyCount = 0;
  let removedCount = 0;

  for (const c of allCitations) {
    const entry = {
      supplement: c.supplement,
      supplementId: c.supplementId,
      citationIndex: c.citationIndex,
      title: c.title,
      authors: c.authors,
      year: c.year,
      journal: c.journal,
      supplements: c.supplements,
      // Original values
      original_pmid: c.pmid || null,
      original_doi: c.doi || null,
      // Verified values (to be filled)
      verified_pmid: null,
      verified_doi: c.doi || null,
      verification_status: 'unverified',
      verification_notes: '',
      title_match_score: 0
    };

    // Try DOI → PMID conversion first
    if (c.doi) {
      const conv = doiConversions.get(c.doi.toLowerCase());
      if (conv && conv.pmid) {
        // Got a PMID from DOI conversion — verify title match
        const meta = pmidMeta.get(conv.pmid);
        if (meta) {
          const score = titleSimilarity(c.title, meta.title);
          entry.verified_pmid = conv.pmid;
          entry.verified_doi = c.doi;
          entry.title_match_score = score;
          entry.pubmed_title = meta.title;
          entry.pubmed_authors = meta.authors;
          entry.pubmed_year = meta.year;
          entry.pubmed_journal = meta.journal;

          if (score >= 0.5) {
            if (c.pmid && c.pmid === conv.pmid) {
              entry.verification_status = 'verified_correct';
              verifiedCount++;
            } else {
              entry.verification_status = 'corrected';
              correctedCount++;
            }
          } else {
            // Title doesn't match — DOI might be wrong too
            entry.verification_status = 'doi_mismatch';
            entry.verification_notes = `DOI resolved to PMID ${conv.pmid} but title doesn't match (score: ${score.toFixed(2)}). PubMed title: "${meta.title}"`;
          }
        } else {
          entry.verified_pmid = conv.pmid;
          entry.verification_status = 'pmid_no_metadata';
          entry.verification_notes = 'PMID resolved but metadata fetch failed';
        }
      } else {
        // DOI didn't resolve to PMID via NCBI — check CrossRef
        const cr = crossrefResults.get(c.doi.toLowerCase());
        if (cr) {
          const score = titleSimilarity(c.title, cr.title);
          entry.crossref_title = cr.title;
          entry.crossref_authors = cr.authors;
          entry.crossref_year = cr.year;
          entry.crossref_journal = cr.journal;
          entry.title_match_score = score;

          if (score >= 0.4) {
            entry.verification_status = 'doi_verified_no_pmid';
            doiOnlyCount++;
            entry.verification_notes = 'DOI verified via CrossRef but no PMID available';
          } else {
            entry.verification_status = 'doi_mismatch';
            entry.verification_notes = `CrossRef title doesn't match (score: ${score.toFixed(2)}). CrossRef title: "${cr.title}"`;
          }
        } else {
          entry.verification_status = 'doi_unresolvable';
          entry.verification_notes = 'DOI could not be resolved via NCBI or CrossRef';
        }
      }
    } else {
      // No DOI — try title search
      const titlePmids = titleSearchResults.get(c.title);
      if (titlePmids && titlePmids.length > 0) {
        // Check each candidate PMID for title match
        let bestMatch = null;
        let bestScore = 0;
        for (const pmid of titlePmids) {
          const meta = pmidMeta.get(pmid);
          if (meta) {
            const score = titleSimilarity(c.title, meta.title);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = { pmid, meta };
            }
          }
        }
        if (bestMatch && bestScore >= 0.5) {
          entry.verified_pmid = bestMatch.pmid;
          entry.pubmed_title = bestMatch.meta.title;
          entry.pubmed_authors = bestMatch.meta.authors;
          entry.pubmed_year = bestMatch.meta.year;
          entry.pubmed_journal = bestMatch.meta.journal;
          entry.title_match_score = bestScore;
          entry.verification_status = 'found_by_title';
          correctedCount++;
        } else {
          entry.verification_status = 'not_found';
          entry.verification_notes = 'No matching PubMed article found by title search';
          removedCount++;
        }
      } else {
        entry.verification_status = 'not_found';
        entry.verification_notes = 'No DOI and no PubMed title match';
        removedCount++;
      }
    }

    verified.push(entry);
  }

  // Phase 6: Additional title search for doi_mismatch and doi_unresolvable
  console.log('── Phase 5b: Title search for unresolved citations ──');
  const needTitleSearch = verified.filter(v =>
    v.verification_status === 'doi_mismatch' ||
    v.verification_status === 'doi_unresolvable' ||
    v.verification_status === 'pmid_no_metadata'
  );
  console.log(`  ${needTitleSearch.length} citations need title-based PubMed search...`);

  for (let i = 0; i < needTitleSearch.length; i++) {
    const v = needTitleSearch[i];
    const pmids = await searchByTitle(v.title);
    if (pmids.length > 0) {
      // Fetch metadata for candidates
      const candidateMeta = await fetchPubMedMetadata(pmids);
      let bestMatch = null;
      let bestScore = 0;
      for (const [pmid, meta] of candidateMeta) {
        const score = titleSimilarity(v.title, meta.title);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { pmid, meta };
        }
      }
      if (bestMatch && bestScore >= 0.4) {
        v.verified_pmid = bestMatch.pmid;
        v.pubmed_title = bestMatch.meta.title;
        v.pubmed_authors = bestMatch.meta.authors;
        v.pubmed_year = bestMatch.meta.year;
        v.pubmed_journal = bestMatch.meta.journal;
        v.title_match_score = bestScore;
        v.verification_status = 'found_by_title';
        v.verification_notes = `Found via title search (was: ${v.verification_status})`;
        correctedCount++;
        console.log(`  ✓ Found: "${v.title.substring(0, 50)}..." → PMID ${bestMatch.pmid}`);
      }
    }
    if (i % 5 === 4) await sleep(RATE_LIMIT_MS * 2);
    else await sleep(RATE_LIMIT_MS);
  }

  // Summary
  const statusCounts = {};
  for (const v of verified) {
    statusCounts[v.verification_status] = (statusCounts[v.verification_status] || 0) + 1;
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  VERIFICATION SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`  Total citations: ${verified.length}`);
  for (const [status, count] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${status}: ${count}`);
  }
  console.log(`\n  With verified PMID: ${verified.filter(v => v.verified_pmid).length}`);
  console.log(`  With verified DOI only: ${verified.filter(v => !v.verified_pmid && v.verified_doi).length}`);
  console.log(`  Unverified/removed: ${verified.filter(v => v.verification_status === 'not_found' || v.verification_status === 'doi_unresolvable').length}`);

  // Write output
  const output = {
    meta: {
      totalCitations: verified.length,
      verifiedAt: new Date().toISOString(),
      statusCounts,
      withVerifiedPmid: verified.filter(v => v.verified_pmid).length,
      withVerifiedDoiOnly: verified.filter(v => !v.verified_pmid && v.verified_doi &&
        (v.verification_status === 'doi_verified_no_pmid' || v.verification_status === 'corrected' || v.verification_status === 'verified_correct')).length,
      unverified: verified.filter(v =>
        v.verification_status === 'not_found' ||
        v.verification_status === 'doi_unresolvable' ||
        v.verification_status === 'doi_mismatch'
      ).length
    },
    citations: verified
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${OUTPUT}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
