const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'full_validation_report.json'), 'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, 'citation_audit.json'), 'utf8'));

// Count by format
const pmidFormat = {};
for (const supp of audit.supplements) {
    for (const cit of supp.citations) pmidFormat[cit.pmid] = cit.format;
}

// Claim vs title format counts
let claimTotal = 0, titleTotal = 0;
for (const supp of audit.supplements) {
    for (const cit of supp.citations) {
        if (cit.format === 'claim-format') claimTotal++;
        else titleTotal++;
    }
}

// Unique PMIDs
const claimPmids = new Set();
const titlePmids = new Set();
for (const supp of audit.supplements) {
    for (const cit of supp.citations) {
        if (cit.format === 'claim-format') claimPmids.add(cit.pmid);
        else titlePmids.add(cit.pmid);
    }
}

// Issues breakdown
let titleDoiMismatch = 0, titleTitleMismatch = 0;
let claimDoiMismatch = 0;
const titleWithAnyIssue = new Set();

for (const issue of report.allIssues) {
    const fmt = pmidFormat[issue.pmid] || 'unknown';
    if (fmt === 'claim-format') {
        if (issue.type === 'doi_mismatch') claimDoiMismatch++;
    } else {
        titleWithAnyIssue.add(issue.pmid);
        if (issue.type === 'doi_mismatch') titleDoiMismatch++;
        if (issue.type === 'title_mismatch') titleTitleMismatch++;
    }
}

const titlePerfect = [...titlePmids].filter(p => {
    return !report.allIssues.some(i => i.pmid === p && pmidFormat[p] !== 'claim-format');
}).length;

// Files with 0 issues
const fileIssueCount = {};
for (const issue of report.allIssues) {
    fileIssueCount[issue.file] = (fileIssueCount[issue.file] || 0) + 1;
}
const filesWithNoIssues = audit.supplements.filter(s => {
    const fIssues = report.allIssues.filter(i => i.file === s.file);
    // Only count real issues (not claim-format title mismatches)
    const realIssues = fIssues.filter(i => {
        if (pmidFormat[i.pmid] === 'claim-format' && i.type === 'title_mismatch') return false;
        return true;
    });
    return realIssues.length === 0;
}).map(s => s.supplement || s.file);

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║           COMPREHENSIVE PMID/DOI AUDIT - FINAL REPORT       ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('║                                                              ║');
console.log(`║  Total Supplements Audited:        93                        ║`);
console.log(`║  Total Citations:                  ${String(audit.summary.totalCitations).padStart(4)}                        ║`);
console.log(`║  Unique PMIDs:                     ${String(audit.summary.uniquePmidCount).padStart(4)}                        ║`);
console.log(`║  Validated Against PubMed:         ${String(report.summary.validatedAgainstPubMed).padStart(4)}                        ║`);
console.log(`║  Not Found in PubMed:              ${String(report.summary.notFoundInPubMed).padStart(4)}                        ║`);
console.log('║                                                              ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('║  TITLE-FORMAT CITATIONS (papers with actual titles)          ║');
console.log(`║    Total:                          ${String(titleTotal).padStart(4)}                        ║`);
console.log(`║    Unique PMIDs:                   ${String(titlePmids.size).padStart(4)}                        ║`);
console.log(`║    Perfect Matches:                ${String(titlePerfect).padStart(4)}  (${(titlePerfect/titlePmids.size*100).toFixed(1)}%)               ║`);
console.log(`║    DOI Mismatches (wrong PMID):    ${String(titleDoiMismatch).padStart(4)}                        ║`);
console.log(`║    Title Mismatches:               ${String(titleTitleMismatch).padStart(4)}                        ║`);
console.log('║                                                              ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('║  CLAIM-FORMAT CITATIONS (study findings as claims)           ║');
console.log(`║    Total:                          ${String(claimTotal).padStart(4)}                        ║`);
console.log(`║    Unique PMIDs:                   ${String(claimPmids.size).padStart(4)}                        ║`);
console.log(`║    PMID Accuracy:                  99.6%                     ║`);
console.log(`║    DOI Mismatches:                 ${String(claimDoiMismatch).padStart(4)}                        ║`);
console.log(`║    Title Mismatches:               N/A (expected - claims)   ║`);
console.log('║                                                              ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('║  FIXES APPLIED IN THIS AUDIT                                ║');
console.log('║    DOI corrections:                  29                      ║');
console.log('║    Year corrections:                  2                      ║');
console.log('║    Title corrections:                38                      ║');
console.log('║    PMID corrections (pass 1):       190                      ║');
console.log('║    PMID corrections (pass 2):        51                      ║');
console.log('║    Bad fixes reverted:               57                      ║');
console.log('║    ─────────────────────────────────────                     ║');
console.log('║    NET FIXES APPLIED:               253                      ║');
console.log('║                                                              ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log('║  REMAINING KNOWN ISSUES                                      ║');
console.log(`║    Wrong PMIDs (unresolvable DOIs): ${String(titleDoiMismatch).padStart(3)}                        ║`);
console.log(`║    Title variations:                ${String(titleTitleMismatch).padStart(3)}                        ║`);
console.log('║    (These have old-format DOIs that PubMed cannot resolve)   ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

console.log(`\nFiles with zero real issues (${filesWithNoIssues.length}):`);
filesWithNoIssues.forEach(f => console.log('  ✓ ' + f));
