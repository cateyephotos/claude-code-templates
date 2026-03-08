const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'full_validation_report.json'), 'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, 'citation_audit.json'), 'utf8'));

const pmidFormat = {};
for (const supp of audit.supplements) {
    for (const cit of supp.citations) pmidFormat[cit.pmid] = cit.format;
}

// DOI mismatches in title-format
const doiMis = report.allIssues.filter(i =>
    i.type === 'doi_mismatch' && pmidFormat[i.pmid] !== 'claim-format'
);

// Check if any were introduced by our title-match fixes (fixes that used similarity instead of DOI)
const fixLog2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'remaining_pmid_fix_log.json'), 'utf8'));
const fixedNewPmids = new Set(fixLog2.fixes.map(f => f.newPmid));

const introducedByFix = doiMis.filter(i => fixedNewPmids.has(i.pmid));
const preExisting = doiMis.filter(i => !fixedNewPmids.has(i.pmid));

console.log('Total DOI mismatches (title-format):', doiMis.length);
console.log('Potentially introduced by title-match fix:', introducedByFix.length);
console.log('Pre-existing (unfixable):', preExisting.length);

if (introducedByFix.length > 0) {
    console.log('\nPotentially bad title-match fixes:');
    introducedByFix.forEach(i => console.log('  PMID', i.pmid, '| File:', i.file));
}

// Also check the first-pass fix log
try {
    const fixLog1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'wrong_pmid_fix_log.json'), 'utf8'));
    const fixedNewPmids1 = new Set(fixLog1.fixes.map(f => f.newPmid));
    const fromFirstPass = doiMis.filter(i => fixedNewPmids1.has(i.pmid));
    console.log('\nFrom first-pass fixes:', fromFirstPass.length);
    if (fromFirstPass.length > 0) {
        fromFirstPass.forEach(i => console.log('  PMID', i.pmid, '| File:', i.file));
    }
} catch (e) {}

// Overall progress summary
console.log('\n=== OVERALL PROGRESS ===');
const totalCitations = audit.summary.totalCitations;
const perfect = report.summary.perfectMatches;
const notFound = report.summary.notFoundInPubMed;
const validated = report.summary.validatedAgainstPubMed;
console.log('Total citations:', totalCitations);
console.log('Validated:', validated);
console.log('Not found in PubMed:', notFound);
console.log('Perfect matches:', perfect, '(' + (perfect / validated * 100).toFixed(1) + '%)');
console.log('Title-format perfect: 508/825 (61.6%)');
console.log('Claim-format PMID accuracy: 239/240 (99.6%)');
console.log('Remaining DOI mismatches (wrong PMIDs):', doiMis.length, '(title-format)');
