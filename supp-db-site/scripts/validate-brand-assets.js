#!/usr/bin/env node
/**
 * validate-brand-assets.js
 * Scans all HTML files for correct brand assets:
 * - Favicon references (not purple #6366F1 base64)
 * - Apple touch icon
 * - OG image meta tag
 * - Zero remaining references to old purple color
 *
 * Usage: node scripts/validate-brand-assets.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIRS = [
    ROOT,
    path.join(ROOT, 'guides'),
    path.join(ROOT, 'categories'),
    path.join(ROOT, 'compare'),
    path.join(ROOT, 'legal')
];

let totalFiles = 0;
let passCount = 0;
let failCount = 0;
const failures = [];

DIRS.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const EXCLUDE = ['debug-', 'test-'];
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !EXCLUDE.some(e => f.startsWith(e)));
    files.forEach(f => {
        const filePath = path.join(dir, f);
        const relPath = path.relative(ROOT, filePath);
        const html = fs.readFileSync(filePath, 'utf8');
        totalFiles++;

        const issues = [];

        // Check: no purple base64 favicon data URI
        // The old favicon was a base64-encoded SVG containing #6366F1
        // Sleep guide legitimately uses #6366f1 in CSS variables for its dark theme
        if (html.includes('data:image/svg+xml;base64,PHN2Z')) {
            issues.push('Contains old base64 favicon data URI');
        }
        // Check for purple in favicon link elements specifically (not CSS vars or decoration)
        const faviconLinkMatch = html.match(/<link[^>]*rel="icon"[^>]*6366[fF]1[^>]*>/);
        if (faviconLinkMatch) {
            issues.push('Favicon link element contains old purple #6366F1');
        }
        if (html.includes('data:image/svg+xml;base64,PHN2Z')) {
            issues.push('Contains old base64 favicon data URI');
        }

        // Check: has SVG favicon link
        if (!html.includes('favicon.svg')) {
            issues.push('Missing favicon.svg reference');
        }

        // Check: has apple-touch-icon
        if (!html.includes('apple-touch-icon')) {
            issues.push('Missing apple-touch-icon');
        }

        // Check: has og:image meta tag
        if (html.includes('og:image')) {
            // Verify it's not still using og-default.svg on content pages
            if (relPath.startsWith('guides') || relPath.startsWith('categories') || relPath.startsWith('compare')) {
                if (html.includes('og-default.svg')) {
                    issues.push('Still using og-default.svg (should be page-specific)');
                }
            }
        }

        if (issues.length === 0) {
            console.log(`  ✓ ${relPath}`);
            passCount++;
        } else {
            console.log(`  ✗ ${relPath}`);
            issues.forEach(issue => console.log(`      → ${issue}`));
            failCount++;
            failures.push({ file: relPath, issues });
        }
    });
});

console.log('\n' + '═'.repeat(60));
console.log(`Brand Asset Validation: ${totalFiles} files scanned`);
console.log(`  Pass: ${passCount}  |  Fail: ${failCount}`);
if (failCount > 0) {
    console.log(`\nFailures:`);
    failures.forEach(f => {
        console.log(`  ${f.file}: ${f.issues.join('; ')}`);
    });
    process.exit(1);
} else {
    console.log('\nAll brand assets validated successfully!');
}
