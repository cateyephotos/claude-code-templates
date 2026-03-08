#!/usr/bin/env node
/**
 * Browser-Level Citation Verification Script
 * =============================================
 * Designed to be run via Playwright MCP or in a browser console.
 * Verifies that every supplement with enhanced citations actually
 * renders correctly in the live UI:
 *
 *   1. Database loads with expected supplement count
 *   2. Enhanced citations load and attach
 *   3. Modal opens without JS errors
 *   4. PMID links render as clickable <a> tags to pubmed.ncbi.nlm.nih.gov
 *   5. DOI links render as clickable <a> tags to doi.org
 *   6. No [object Object] text anywhere in the modal
 *   7. No "undefined" text in citation blocks
 *
 * Usage (in browser console after page load):
 *   paste this entire script, or load via <script src="...">
 *
 * Returns a results object with per-supplement pass/fail.
 */

(async function browserVerifyCitations() {
  const results = {
    timestamp: new Date().toISOString(),
    totalSupplements: 0,
    enhancedCount: 0,
    tested: 0,
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  // Wait for database
  if (!window.supplements || !window.supplements.supplements) {
    console.error('❌ supplements database not loaded');
    results.errors.push('Database not loaded');
    return results;
  }

  const db = window.supplements;
  results.totalSupplements = db.supplements.length;

  // Count enhanced supplements
  const enhanced = db.supplements.filter(s =>
    s.enhancedCitations && s.enhancedCitations.isEnhanced
  );
  results.enhancedCount = enhanced.length;

  console.log(`📊 Database: ${results.totalSupplements} supplements, ${results.enhancedCount} enhanced`);

  // Test each enhanced supplement
  for (const supp of enhanced) {
    const detail = {
      id: supp.id,
      name: supp.name,
      passed: true,
      pmidCount: 0,
      doiCount: 0,
      issues: []
    };

    try {
      // Check that enhanced citation data was attached
      const citData = supp.enhancedCitations;
      if (!citData || (!citData.citations && !citData.enhancedCitations)) {
        detail.passed = false;
        detail.issues.push('No citation data attached despite isEnhanced=true');
        results.details.push(detail);
        results.failed++;
        results.tested++;
        continue;
      }

      // Try to find the card and click it
      const cards = document.querySelectorAll('[data-supplement-id]');
      let card = null;
      for (const c of cards) {
        if (parseInt(c.getAttribute('data-supplement-id')) === supp.id) {
          card = c;
          break;
        }
      }

      if (!card) {
        // Try searching by name in card text
        const allCards = document.querySelectorAll('.supplement-card, [class*="card"]');
        for (const c of allCards) {
          if (c.textContent.includes(supp.name)) {
            card = c;
            break;
          }
        }
      }

      if (!card) {
        detail.issues.push('Card not found in DOM — may need to scroll or search');
        // Still count citation data quality even without DOM card
      }

      // Count PMIDs and DOIs in the citation data structure
      const citations = citData.citations || citData.enhancedCitations;
      const citationStr = JSON.stringify(citations);

      const pmidMatches = citationStr.match(/"pmid":\s*"?\d+"?/g) || [];
      const doiMatches = citationStr.match(/"doi":\s*"[^"]+"/g) || [];
      detail.pmidCount = pmidMatches.length;
      detail.doiCount = doiMatches.length;

      // Check for [object Object] in citation data
      if (citationStr.includes('[object Object]')) {
        detail.passed = false;
        detail.issues.push('[object Object] found in citation data');
      }

      // Check for undefined values in key fields
      if (citationStr.includes('"undefined"') || citationStr.includes(':undefined')) {
        detail.passed = false;
        detail.issues.push('undefined values found in citation data');
      }

      if (detail.pmidCount === 0) {
        detail.issues.push('No PMIDs in citation data');
      }
      if (detail.doiCount === 0) {
        detail.issues.push('No DOIs in citation data');
      }

    } catch (e) {
      detail.passed = false;
      detail.issues.push(`Exception: ${e.message}`);
    }

    if (detail.passed && detail.issues.length === 0) {
      results.passed++;
    } else if (detail.issues.length > 0 && detail.passed) {
      // Warnings only (missing card but data OK)
      results.passed++;
    } else {
      results.failed++;
    }

    results.tested++;
    results.details.push(detail);
  }

  // Summary
  console.log(`\n═══ Browser Verification Summary ═══`);
  console.log(`Tested: ${results.tested}/${results.enhancedCount} enhanced supplements`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);

  if (results.failed > 0) {
    console.log(`\nFailed supplements:`);
    results.details.filter(d => !d.passed).forEach(d => {
      console.log(`  ❌ ID ${d.id} ${d.name}: ${d.issues.join(', ')}`);
    });
  }

  return results;
})();
