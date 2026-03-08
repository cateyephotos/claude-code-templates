const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'full_validation_report.json'), 'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, 'citation_audit.json'), 'utf8'));

// Build a map of PMID -> format type from audit
const pmidFormat = {};
for (const supp of audit.supplements) {
    for (const cit of supp.citations) {
        pmidFormat[cit.pmid] = cit.format;
    }
}

// Separate issues by format type
let claimIssues = 0, titleIssues = 0;
let claimHigh = 0, titleHigh = 0;
let claimTitleMismatch = 0, titleTitleMismatch = 0;
let claimDoiMismatch = 0, titleDoiMismatch = 0;

for (const issue of report.allIssues) {
    const fmt = pmidFormat[issue.pmid] || 'unknown';
    if (fmt === 'claim-format') {
        claimIssues++;
        if (issue.severity === 'high') claimHigh++;
        if (issue.type === 'title_mismatch') claimTitleMismatch++;
        if (issue.type === 'doi_mismatch') claimDoiMismatch++;
    } else {
        titleIssues++;
        if (issue.severity === 'high') titleHigh++;
        if (issue.type === 'title_mismatch') titleTitleMismatch++;
        if (issue.type === 'doi_mismatch') titleDoiMismatch++;
    }
}

console.log('=== ISSUES BY FORMAT TYPE ===');
console.log('');
console.log('CLAIM-FORMAT (expected mismatches - claims are not paper titles):');
console.log('  Total issues:', claimIssues);
console.log('  High severity:', claimHigh);
console.log('  Title mismatch:', claimTitleMismatch, '(expected)');
console.log('  DOI mismatch:', claimDoiMismatch, '(these are real problems)');
console.log('');
console.log('TITLE-FORMAT (real issues):');
console.log('  Total issues:', titleIssues);
console.log('  High severity:', titleHigh);
console.log('  Title mismatch:', titleTitleMismatch);
console.log('  DOI mismatch:', titleDoiMismatch);

// Remaining title-format DOI mismatches (still-wrong PMIDs)
const titleFormatDoi = report.allIssues.filter(i =>
    i.type === 'doi_mismatch' && pmidFormat[i.pmid] !== 'claim-format'
);
console.log('');
console.log('=== REMAINING WRONG PMIDs (title-format with DOI mismatch) ===');
console.log('Count:', titleFormatDoi.length);
const byFile = {};
for (const i of titleFormatDoi) byFile[i.file] = (byFile[i.file] || 0) + 1;
for (const [f, c] of Object.entries(byFile).sort((a, b) => b[1] - a[1])) {
    console.log('  ' + f + ': ' + c);
}

// Calculate true accuracy (excluding claim-format title mismatches)
const claimCitations = audit.supplements.reduce((acc, s) => {
    return acc + s.citations.filter(c => c.format === 'claim-format').length;
}, 0);
const titleCitations = audit.supplements.reduce((acc, s) => {
    return acc + s.citations.filter(c => c.format === 'title-format').length;
}, 0);

console.log('');
console.log('=== CITATION COUNTS BY FORMAT ===');
console.log('Claim-format citations:', claimCitations);
console.log('Title-format citations:', titleCitations);

// For title-format, what percentage are perfect?
const titleFormatPmids = new Set();
for (const supp of audit.supplements) {
    for (const cit of supp.citations) {
        if (cit.format === 'title-format') titleFormatPmids.add(cit.pmid);
    }
}

// PMIDs with any issue (title-format only)
const titleFormatWithIssue = new Set();
for (const issue of report.allIssues) {
    if (pmidFormat[issue.pmid] === 'title-format') {
        titleFormatWithIssue.add(issue.pmid);
    }
}

const titleFormatPerfect = [...titleFormatPmids].filter(p => !titleFormatWithIssue.has(p)).length;
console.log('');
console.log('=== TITLE-FORMAT ACCURACY ===');
console.log('Total title-format unique PMIDs:', titleFormatPmids.size);
console.log('Perfect:', titleFormatPerfect);
console.log('With issues:', titleFormatWithIssue.size);
console.log('Accuracy:', (titleFormatPerfect / titleFormatPmids.size * 100).toFixed(1) + '%');

// For claim-format, what percentage have correct PMIDs (no DOI mismatch)?
const claimFormatPmids = new Set();
for (const supp of audit.supplements) {
    for (const cit of supp.citations) {
        if (cit.format === 'claim-format') claimFormatPmids.add(cit.pmid);
    }
}
const claimWithDoiIssue = new Set();
for (const issue of report.allIssues) {
    if (pmidFormat[issue.pmid] === 'claim-format' && issue.type === 'doi_mismatch') {
        claimWithDoiIssue.add(issue.pmid);
    }
}
console.log('');
console.log('=== CLAIM-FORMAT PMID ACCURACY ===');
console.log('Total claim-format unique PMIDs:', claimFormatPmids.size);
console.log('With DOI mismatch (wrong PMID):', claimWithDoiIssue.size);
console.log('Correct PMIDs:', claimFormatPmids.size - claimWithDoiIssue.size);
console.log('PMID accuracy:', ((claimFormatPmids.size - claimWithDoiIssue.size) / claimFormatPmids.size * 100).toFixed(1) + '%');
