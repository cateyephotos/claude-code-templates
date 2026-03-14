#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const dir  = path.join(ROOT, 'supplements');

const pages = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
console.log('Total HTML pages:', pages.length);

const checks = [
    'quick-facts',
    'mechanism-grid',
    'benefits-grid',
    'effect-table',
    'dosage-grid',
    'safety-card',
    'citation-group',
    'ref-item'
];

let ok = 0;
const incomplete = [];

pages.forEach(f => {
    const h = fs.readFileSync(path.join(dir, f), 'utf8');
    const missing = checks.filter(c => !h.includes(c));
    if (missing.length) {
        incomplete.push({ f, missing });
    } else {
        ok++;
    }
});

console.log('Complete pages:', ok, '| Incomplete:', incomplete.length);

if (incomplete.length) {
    // Group by missing sections for easier analysis
    const bySection = {};
    incomplete.forEach(x => {
        x.missing.forEach(m => {
            bySection[m] = (bySection[m] || []);
            bySection[m].push(x.f.replace('.html', ''));
        });
    });

    console.log('\nIncomplete pages:');
    incomplete.forEach(x => console.log(' ', x.f, '->', x.missing.join(', ')));

    console.log('\nMissing sections summary:');
    Object.entries(bySection).sort(([,a],[,b]) => b.length - a.length).forEach(([sec, files]) => {
        console.log(' ', sec + ':', files.length, 'pages');
        if (files.length <= 5) files.forEach(f => console.log('    -', f));
    });
}
