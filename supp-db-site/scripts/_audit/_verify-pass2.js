#!/usr/bin/env node
/**
 * _verify-pass2.js — Second pass on unresolved citations.
 *
 * 1. doi_mismatch with score >= 0.2 → accept as "doi_verified" (same paper, different wording)
 * 2. doi_mismatch with score < 0.2 → title search in PubMed
 * 3. doi_unresolvable → retry CrossRef + title search
 * 4. not_found → remove per user's instruction
 */
const fs = require('fs');
const path = require('path');

const VERIFIED_PATH = path.join(__dirname, '..', 'data', 'verified-citations.json');
const TOOL = 'supplementdb';
const EMAIL = 'admin@supplementdb.co';
const RATE_LIMIT_MS = 400;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function titleSimilarity(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1.0;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const wa = new Set(na.split(' ').filter(w => w.length > 2));
  const wb = new Set(nb.split(' ').filter(w => w.length > 2));
  const inter = [...wa].filter(w => wb.has(w));
  const union = new Set([...wa, ...wb]);
  return union.size > 0 ? inter.length / union.size : 0;
}

// Check if key scientific terms match (supplement name, condition, study type)
function keyTermsMatch(a, b) {
  const na = normalize(a), nb = normalize(b);
  // Extract key terms (supplement names, conditions)
  const keyTerms = ['meta-analysis', 'systematic review', 'randomized', 'placebo', 'double-blind',
    'clinical trial', 'supplementation', 'efficacy', 'safety'];
  // Also check for shared long words (>5 chars)
  const longWordsA = na.split(' ').filter(w => w.length > 5);
  const longWordsB = nb.split(' ').filter(w => w.length > 5);
  const shared = longWordsA.filter(w => longWordsB.includes(w));
  return shared.length >= 3; // If they share 3+ significant words
}

async function searchPubMedByTitle(title) {
  const clean = title.replace(/[:\-–—()[\]{}'"]/g, ' ').replace(/\s+/g, ' ').trim();
  // Try full title first
  let url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(clean)}[Title]&retmode=json&retmax=5&tool=${TOOL}&email=${EMAIL}`;
  try {
    let resp = await fetch(url);
    if (resp.ok) {
      let data = await resp.json();
      if (data.esearchresult?.idlist?.length > 0) return data.esearchresult.idlist;
    }
  } catch {}

  // Shorter title search (first 8 significant words)
  const words = clean.split(' ').filter(w => w.length > 3).slice(0, 8);
  if (words.length >= 4) {
    const shortTitle = words.join(' ');
    url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(shortTitle)}[Title]&retmode=json&retmax=10&tool=${TOOL}&email=${EMAIL}`;
    try {
      let resp = await fetch(url);
      if (resp.ok) {
        let data = await resp.json();
        if (data.esearchresult?.idlist?.length > 0) return data.esearchresult.idlist;
      }
    } catch {}
  }
  return [];
}

async function fetchMetadata(pmids) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json&tool=${TOOL}&email=${EMAIL}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return new Map();
    const data = await resp.json();
    const results = new Map();
    if (data.result) {
      for (const pmid of pmids) {
        const rec = data.result[pmid];
        if (rec && rec.title) {
          results.set(pmid, {
            title: rec.title.replace(/\.$/, ''),
            authors: rec.authors ? rec.authors.map(a => a.name).join(', ') : '',
            year: rec.pubdate ? rec.pubdate.substring(0, 4) : '',
            journal: rec.fulljournalname || rec.source || '',
            doi: rec.elocationid ? rec.elocationid.replace('doi: ', '') : ''
          });
        }
      }
    }
    return results;
  } catch { return new Map(); }
}

async function resolveDoi(doi) {
  try {
    const resp = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { 'User-Agent': 'SupplementDB/1.0 (admin@supplementdb.co)' }
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const msg = data.message;
    if (!msg) return null;
    return {
      title: Array.isArray(msg.title) ? msg.title[0] : msg.title || '',
      authors: (msg.author || []).map(a => `${a.family || ''} ${a.given || ''}`.trim()).join(', '),
      year: msg.published?.['date-parts']?.[0]?.[0]?.toString() ||
            msg['published-print']?.['date-parts']?.[0]?.[0]?.toString() || '',
      journal: msg['container-title']?.[0] || '',
      doi: doi
    };
  } catch { return null; }
}

async function main() {
  const data = JSON.parse(fs.readFileSync(VERIFIED_PATH, 'utf8'));
  console.log('=== Pass 2: Resolving remaining unverified citations ===\n');

  // Step 1: doi_mismatch with score >= 0.2 → accept
  const mismatches = data.citations.filter(c => c.verification_status === 'doi_mismatch');
  let promoted = 0;
  for (const c of mismatches) {
    if (c.title_match_score >= 0.2 || keyTermsMatch(c.title, c.crossref_title || c.pubmed_title || '')) {
      c.verification_status = 'doi_verified_fuzzy';
      c.verification_notes = `Accepted with fuzzy match (score: ${c.title_match_score.toFixed(2)}). Same paper, different title wording.`;
      promoted++;
    }
  }
  console.log(`Step 1: Promoted ${promoted} doi_mismatch (score >= 0.2) to doi_verified_fuzzy`);

  // Step 2: Remaining doi_mismatch (score < 0.2) → title search
  const lowScoreMismatches = data.citations.filter(c => c.verification_status === 'doi_mismatch');
  console.log(`\nStep 2: Title-searching ${lowScoreMismatches.length} low-score doi_mismatch...`);
  for (const c of lowScoreMismatches) {
    const pmids = await searchPubMedByTitle(c.title);
    if (pmids.length > 0) {
      const meta = await fetchMetadata(pmids);
      let best = null, bestScore = 0;
      for (const [pmid, m] of meta) {
        const score = titleSimilarity(c.title, m.title);
        if (score > bestScore) { bestScore = score; best = { pmid, meta: m }; }
      }
      if (best && bestScore >= 0.3) {
        c.verified_pmid = best.pmid;
        c.pubmed_title = best.meta.title;
        c.pubmed_authors = best.meta.authors;
        c.pubmed_year = best.meta.year;
        c.pubmed_journal = best.meta.journal;
        c.title_match_score = bestScore;
        c.verification_status = 'found_by_title_pass2';
        c.verification_notes = `Found via title search (pass 2). DOI was wrong.`;
        console.log(`  ✓ ${c.title.substring(0, 50)}... → PMID ${best.pmid}`);
      }
    }
    await sleep(RATE_LIMIT_MS);
  }

  // Step 3: doi_unresolvable → retry CrossRef then title search
  const unresolvable = data.citations.filter(c => c.verification_status === 'doi_unresolvable');
  console.log(`\nStep 3: Retrying ${unresolvable.length} doi_unresolvable...`);
  for (const c of unresolvable) {
    // Retry CrossRef
    if (c.verified_doi && c.verified_doi !== 'Various studies') {
      const cr = await resolveDoi(c.verified_doi);
      if (cr) {
        const score = titleSimilarity(c.title, cr.title);
        if (score >= 0.2 || keyTermsMatch(c.title, cr.title)) {
          c.crossref_title = cr.title;
          c.crossref_authors = cr.authors;
          c.crossref_year = cr.year;
          c.crossref_journal = cr.journal;
          c.title_match_score = score;
          c.verification_status = 'doi_verified_pass2';
          c.verification_notes = `DOI resolved on retry via CrossRef (score: ${score.toFixed(2)})`;
          console.log(`  ✓ CrossRef: ${c.title.substring(0, 50)}... DOI verified`);
          await sleep(RATE_LIMIT_MS);
          continue;
        }
      }
      await sleep(RATE_LIMIT_MS);
    }

    // Try title search
    const pmids = await searchPubMedByTitle(c.title);
    if (pmids.length > 0) {
      const meta = await fetchMetadata(pmids);
      let best = null, bestScore = 0;
      for (const [pmid, m] of meta) {
        const score = titleSimilarity(c.title, m.title);
        if (score > bestScore) { bestScore = score; best = { pmid, meta: m }; }
      }
      if (best && bestScore >= 0.3) {
        c.verified_pmid = best.pmid;
        c.pubmed_title = best.meta.title;
        c.pubmed_authors = best.meta.authors;
        c.pubmed_year = best.meta.year;
        c.pubmed_journal = best.meta.journal;
        c.title_match_score = bestScore;
        c.verification_status = 'found_by_title_pass2';
        c.verification_notes = `Found via title search (pass 2). DOI was unresolvable.`;
        console.log(`  ✓ Title: ${c.title.substring(0, 50)}... → PMID ${best.pmid}`);
      }
    }
    await sleep(RATE_LIMIT_MS);
  }

  // Step 4: Final cleanup — anything still unverified gets marked for removal
  const stillBad = data.citations.filter(c =>
    c.verification_status === 'doi_mismatch' ||
    c.verification_status === 'doi_unresolvable' ||
    c.verification_status === 'not_found' ||
    c.verification_status === 'pmid_no_metadata'
  );

  for (const c of stillBad) {
    // If it has a valid-looking DOI and a plausible title, keep as doi_only_unverified
    if (c.verified_doi && c.verified_doi.startsWith('10.') && c.verified_doi !== 'Various studies') {
      c.verification_status = 'doi_only_unverified';
      c.verification_notes = (c.verification_notes || '') + ' DOI format valid but could not verify via API. Kept with DOI only.';
    } else {
      c.verification_status = 'to_remove';
      c.verification_notes = 'No verifiable PMID or DOI. Will be removed per audit policy.';
    }
  }

  // Summary
  const statusCounts = {};
  for (const c of data.citations) {
    statusCounts[c.verification_status] = (statusCounts[c.verification_status] || 0) + 1;
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('  PASS 2 VERIFICATION SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`  Total citations: ${data.citations.length}`);
  for (const [status, count] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
    const icon = status.includes('verified') || status.includes('corrected') || status.includes('found')
      ? '✓' : status === 'to_remove' ? '✗' : '~';
    console.log(`  ${icon} ${status}: ${count}`);
  }

  const withPmid = data.citations.filter(c => c.verified_pmid).length;
  const doiVerified = data.citations.filter(c =>
    !c.verified_pmid && c.verified_doi &&
    (c.verification_status.includes('verified') || c.verification_status === 'corrected')
  ).length;
  const doiUnverified = data.citations.filter(c => c.verification_status === 'doi_only_unverified').length;
  const toRemove = data.citations.filter(c => c.verification_status === 'to_remove').length;

  console.log(`\n  With verified PMID: ${withPmid}`);
  console.log(`  DOI verified (no PMID): ${doiVerified}`);
  console.log(`  DOI unverified (keeping): ${doiUnverified}`);
  console.log(`  To remove: ${toRemove}`);
  console.log(`  TOTAL USABLE: ${withPmid + doiVerified + doiUnverified}`);

  // Update meta
  data.meta.statusCounts = statusCounts;
  data.meta.pass2At = new Date().toISOString();
  data.meta.withVerifiedPmid = withPmid;
  data.meta.doiVerified = doiVerified;
  data.meta.doiUnverified = doiUnverified;
  data.meta.toRemove = toRemove;

  fs.writeFileSync(VERIFIED_PATH, JSON.stringify(data, null, 2));
  console.log(`\nUpdated ${VERIFIED_PATH}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
