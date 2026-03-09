#!/usr/bin/env node
/**
 * audit-fda-claims.js
 * Scans all supplement data and generated HTML content for FDA-prohibited
 * disease claims, drug-like language, and non-compliant phrasing.
 *
 * Based on the supplement-disclaimer skill's Language Substitution Guide
 * and the FDA's structure/function claim rules.
 *
 * Usage: node scripts/audit-fda-claims.js [--fix]
 *   --fix  Output a JSON patch file with suggested replacements
 */

const fs = require('fs');
const path = require('path');
const { loadSupplementData } = require('./parse-data');

const ROOT = path.resolve(__dirname, '..');

// ── FDA Prohibited Patterns ──────────────────────────────────────────────────
// Each pattern has: regex, severity, description, suggestion
const PROHIBITED_PATTERNS = [
    // === SEVERITY: HIGH — Direct disease claims ===
    { pattern: /\bcures?\b/i, severity: 'HIGH', desc: 'Disease claim: "cure"', suggestion: 'Replace with "supports" or "promotes"' },
    { pattern: /\btreat(?:s|ing|ment)?\b(?!\s+(?:group|arm|condition|phase|protocol|period|allocation|assignment|response|effect|versus|vs|comparator|comparison|strategy|dose|regimen|naive|resistant|refractory|experienced|emergent|related|associated|induced|seeking|as\s+usual|study|trial|week|month|day|duration|outcome))/i, severity: 'HIGH', desc: 'Disease claim: "treat/treatment"', suggestion: 'Replace with "supports" or "helps manage"', context_exempt: ['study', 'trial', 'clinical', 'RCT', 'placebo', 'methodology', 'design', 'research', 'citation', 'meta-analysis'] },
    { pattern: /\bprevents?\b(?!\s+(?:oxidative|oxidation|degradation|breakdown|absorption|loss of(?:\s+\w+){0,3}\s+(?:quality|potency|freshness)))/i, severity: 'HIGH', desc: 'Disease claim: "prevent"', suggestion: 'Replace with "supports resilience" or "helps maintain"', context_exempt: ['study', 'trial', 'preeclampsia prevention', 'prevention of oxidative'] },
    { pattern: /\bdiagnos(?:e|es|ing|tic)\b/i, severity: 'HIGH', desc: 'Disease claim: "diagnose"', suggestion: 'Remove or reframe as educational content' },
    { pattern: /\bheals?\b(?!\s+(?:time|rate|process))/i, severity: 'HIGH', desc: 'Disease claim: "heal"', suggestion: 'Replace with "supports recovery" or "promotes wellness"' },

    // === SEVERITY: HIGH — Disease-specific claims ===
    { pattern: /\bcures?\s+(?:cancer|diabetes|arthritis|alzheimer|parkinson|depression|anxiety|heart\s+disease|hypertension)/i, severity: 'CRITICAL', desc: 'Direct disease cure claim', suggestion: 'Remove entirely — this is a prohibited disease claim' },
    { pattern: /\bfights?\s+cancer\b/i, severity: 'CRITICAL', desc: 'Cancer treatment claim', suggestion: 'Remove entirely' },
    { pattern: /\banti-cancer\b/i, severity: 'HIGH', desc: 'Cancer claim: "anti-cancer"', suggestion: 'Replace with "antioxidant properties" or remove', context_exempt: ['research', 'study', 'investigation', 'citation'] },
    { pattern: /\banti-diabetic\b/i, severity: 'HIGH', desc: 'Disease claim: "anti-diabetic"', suggestion: 'Replace with "supports healthy blood sugar levels already in the normal range"', context_exempt: ['research', 'study', 'citation'] },

    // === SEVERITY: MEDIUM — Implicit disease claims ===
    { pattern: /\blowers?\s+(?:blood\s+pressure|cholesterol|blood\s+sugar|triglycerides|glucose)\b/i, severity: 'MEDIUM', desc: 'Implicit disease claim: "lowers [biomarker]"', suggestion: 'Replace with "supports healthy [X] levels already in the normal range"' },
    { pattern: /\breduces?\s+(?:blood\s+pressure|cholesterol|blood\s+sugar|inflammation|tumor|tumour)\b/i, severity: 'MEDIUM', desc: 'Implicit disease claim: "reduces [condition/biomarker]"', suggestion: 'Replace with "supports healthy [X] levels" or "supports a healthy inflammatory response"' },
    { pattern: /\breduces?\s+(?:anxiety|depression|stress)\b/i, severity: 'MEDIUM', desc: 'Implicit disease claim: "reduces [mental health condition]"', suggestion: 'Replace with "supports calm mood" or "promotes relaxation"' },
    { pattern: /\bboosts?\s+immun/i, severity: 'MEDIUM', desc: 'Overclaim: "boosts immunity"', suggestion: 'Replace with "supports immune system function"' },
    { pattern: /\bburns?\s+fat\b/i, severity: 'MEDIUM', desc: 'Overclaim: "burns fat"', suggestion: 'Replace with "supports healthy metabolism"' },
    { pattern: /\bfixes?\s+(?:joint|back|knee|pain)\b/i, severity: 'MEDIUM', desc: 'Disease claim: "fixes [pain/condition]"', suggestion: 'Replace with "supports joint comfort and mobility"' },
    { pattern: /\beliminate(?:s)?\s+(?:pain|symptoms|inflammation)\b/i, severity: 'MEDIUM', desc: 'Disease claim: "eliminates [symptoms]"', suggestion: 'Replace with "supports comfort" or "promotes well-being"' },
    { pattern: /\banti-inflammatory\b/i, severity: 'LOW', desc: 'Category label "anti-inflammatory" — acceptable as category but not as claim', suggestion: 'As a category name this is acceptable; as a direct benefit claim, prefer "supports a healthy inflammatory response"', context_exempt: ['category', 'Category'] },

    // === SEVERITY: MEDIUM — Drug-like efficacy language ===
    { pattern: /\bclinically\s+proven\b/i, severity: 'MEDIUM', desc: 'Drug-level efficacy claim: "clinically proven"', suggestion: 'Replace with "supported by clinical research" or "studied in clinical trials"' },
    { pattern: /\bscientifically\s+proven\b/i, severity: 'MEDIUM', desc: 'Drug-level efficacy claim: "scientifically proven"', suggestion: 'Replace with "supported by scientific research"' },
    { pattern: /\bproven\s+to\b/i, severity: 'MEDIUM', desc: 'Drug-level efficacy claim: "proven to"', suggestion: 'Replace with "research suggests" or "studies indicate"' },
    { pattern: /\bguaranteed?\b/i, severity: 'MEDIUM', desc: 'Efficacy guarantee', suggestion: 'Remove — no supplement can guarantee results' },
    { pattern: /\bdoctor\s+recommended\b/i, severity: 'MEDIUM', desc: 'Medical endorsement claim', suggestion: 'Remove unless documented endorsement exists' },

    // === SEVERITY: LOW — Borderline language worth reviewing ===
    { pattern: /\bprotects?\s+against\s+(?:disease|cancer|stroke|heart\s+attack|dementia)/i, severity: 'HIGH', desc: 'Disease prevention claim: "protects against [disease]"', suggestion: 'Replace with "supports [organ/system] health"' },
    { pattern: /\bneuroprotect(?:ive|ion)\b/i, severity: 'LOW', desc: 'Borderline: "neuroprotective" — acceptable in research context', suggestion: 'Acceptable when describing mechanism of action in research context; avoid as consumer-facing benefit claim', context_exempt: ['mechanism', 'research', 'study', 'citation'] },
    { pattern: /\bcardioprotect(?:ive|ion)\b/i, severity: 'LOW', desc: 'Borderline: "cardioprotective" — acceptable in research context', suggestion: 'Acceptable when describing mechanism; prefer "supports cardiovascular health" for consumer claims', context_exempt: ['mechanism', 'research', 'study'] },
    { pattern: /\bantioxidant\b/i, severity: 'INFO', desc: 'Info: "antioxidant" — generally acceptable as structure/function', suggestion: 'Acceptable as structure/function claim', context_exempt: ['*'] },
];

// Fields to audit in supplement data
const AUDIT_FIELDS = [
    { path: 'primaryBenefits.cognitive', label: 'Cognitive Benefits' },
    { path: 'primaryBenefits.nonCognitive', label: 'Non-Cognitive Benefits' },
    { path: 'mechanismsOfAction', label: 'Mechanisms of Action' },
    { path: 'category', label: 'Category' },
    { path: 'evidenceTierRationale', label: 'Evidence Tier Rationale' },
];

// Fields in enhanced citations that are research context (more lenient)
const RESEARCH_CONTEXT_FIELDS = [
    'enhancedCitations',
    'keyCitations',
    'effectSizes',
    'safetyProfile',
    'studyPopulations',
];

function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
}

function flattenValue(val) {
    if (Array.isArray(val)) return val.map(v => typeof v === 'string' ? v : JSON.stringify(v));
    if (typeof val === 'string') return [val];
    if (typeof val === 'object' && val !== null) return Object.values(val).flatMap(flattenValue);
    return [String(val)];
}

function isResearchContext(text, lineContext) {
    const researchTerms = ['study', 'trial', 'RCT', 'meta-analysis', 'systematic review', 'placebo',
        'double-blind', 'randomized', 'cohort', 'observational', 'methodology', 'citation',
        'PMID', 'DOI', 'journal', 'authors', 'findings', 'p-value', 'p =', 'SMD', 'CI:',
        'n=', 'sample', 'outcome', 'endpoint', 'baseline', 'intervention'];
    const ctx = (text + ' ' + (lineContext || '')).toLowerCase();
    return researchTerms.some(t => ctx.includes(t.toLowerCase()));
}

/**
 * Check if the matched text is in a known false-positive context:
 * - Disclaimer boilerplate ("does not constitute... treatment")
 * - Citation/paper titles ("for treating chronic heart failure")
 * - Safety warnings ("if undergoing cancer treatment")
 * - Negative assertion ("does not guarantee", "is not intended to")
 */
function isFalsePositiveContext(text, matched) {
    const lower = text.toLowerCase();
    const matchLower = matched.toLowerCase();

    // 1. Standard disclaimer language
    const disclaimerPatterns = [
        /does\s+not\s+constitute\s+(?:medical\s+)?(?:advice|diagnosis|treatment)/i,
        /is\s+not\s+intended\s+to\s+diagnose,?\s*treat,?\s*cure,?\s*or\s*prevent/i,
        /not\s+intended\s+(?:as\s+)?(?:a\s+)?substitute\s+for/i,
        /have\s+not\s+been\s+evaluated\s+by\s+the\s+(?:food\s+and\s+drug|fda)/i,
        /consult\s+(?:your\s+|a\s+)?(?:doctor|physician|healthcare)/i,
    ];
    if (disclaimerPatterns.some(p => p.test(text))) return true;

    // 2. Negative context — "does not [verb]", "is not intended to", "cannot [verb]"
    const negativePatterns = [
        new RegExp(`(?:does|do|is|are|can)\\s+not\\s+(?:\\w+\\s+)*${matchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
        new RegExp(`not\\s+(?:intended|meant|designed)\\s+to\\s+(?:\\w+\\s+)*${matchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
        new RegExp(`no\\s+(?:\\w+\\s+)*${matchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
    ];
    if (negativePatterns.some(p => p.test(text))) return true;

    // 3. Citation title context — text that looks like a paper title
    const citationPatterns = [
        /["'""]\s*.*(?:for\s+(?:treating|treatment|prevention))\b.*["'""]/i,
        /(?:et\s+al|PMID|DOI|doi:|pubmed|cochrane|lancet|jama|bmj|nature)\b/i,
        /\(\d{4}\)/,  // Year in parentheses like (2020)
        /\d{4};\s*\d+\(\d+\)/,  // Journal citation format
    ];
    if (citationPatterns.some(p => p.test(text))) return true;

    // 4. Safety warning context
    const safetyPatterns = [
        /(?:if\s+(?:you\s+are|undergoing|taking|receiving)\s+(?:\w+\s+)*treatment)/i,
        /(?:during|before|after)\s+(?:\w+\s+)*treatment/i,
        /(?:consult|talk\s+to|speak\s+with|check\s+with)\s+(?:your\s+|an?\s+)?(?:doctor|physician|oncologist|healthcare)/i,
        /(?:adverse|side)\s+effect/i,
        /contraindicated/i,
    ];
    if (safetyPatterns.some(p => p.test(text))) return true;

    // 5. "guarantee" in negative context
    if (matchLower.includes('guarantee') && /(?:does\s+not|no|cannot|without)\s+(?:\w+\s+)*guarantee/i.test(text)) return true;

    // 6. Academic paper title patterns (commonly appear as link text on pages)
    const paperTitlePatterns = [
        /\bfor\s+(?:the\s+)?treat(?:ing|ment)\s+(?:of\s+)?\w/i,  // "for treating X" / "for the treatment of X"
        /\bto\s+(?:p|P)revent\s+\w/i,  // "to Prevent Neural Tube..."
        /\b(?:effects?|efficacy|safety|role)\s+of\s+\w+.*(?:on|in|for)\b/i,  // "Effect of X on Y"
        /\bassociated\s+with\s+\w+.*\bfor\s+the\b/i,  // "Adverse events associated with X for the..."
        /\bsupplementation\s+(?:and|to|for|in)\b/i,  // "supplementation to prevent..."
        /\bin\s+the\s+treatment\s+of\b/i,  // "in the treatment of"
        /\b(?:improves?|enhances?|modulates?)\s+\w+.*\b(?:and|in)\s+\w+.*\b(?:cadets?|subjects?|patients?|adults?|participants?|volunteers?|individuals?)\b/i,  // Paper title: "improves X in subjects"
    ];
    if (paperTitlePatterns.some(p => p.test(text))) return true;

    // 7. "does not offer/provide" + "treatment/diagnosis" (FAQ and about page disclaimers)
    if (/does\s+not\s+(?:offer|provide)\s+(?:\w+\s+)*(?:advice|diagnosis|treatment)/i.test(text)) return true;

    // 8. Medication context ("health status, medications, treatment plans")
    if (/(?:medications?|prescription|drug\s+interactions?)\s*,?\s*(?:\w+\s+)*treatment/i.test(text)) return true;

    return false;
}

// ── Main Audit ──────────────────────────────────────────────────────────────
function auditSupplementData() {
    const db = loadSupplementData();
    const supplements = db.supplements || [];
    const findings = [];

    supplements.forEach(supp => {
        // Audit consumer-facing fields (strict)
        AUDIT_FIELDS.forEach(field => {
            const val = getNestedValue(supp, field.path);
            if (!val) return;
            const texts = flattenValue(val);

            // evidenceTierRationale is research/methodology context — skip HIGH for this field
            const isRationaleField = field.path === 'evidenceTierRationale';

            texts.forEach(text => {
                PROHIBITED_PATTERNS.forEach(rule => {
                    if (rule.severity === 'INFO') return; // skip info-only
                    // For rationale fields, only flag CRITICAL (the rest is research context)
                    if (isRationaleField && rule.severity !== 'CRITICAL') return;

                    const match = text.match(rule.pattern);
                    if (!match) return;

                    // Check context exemptions
                    if (rule.context_exempt) {
                        if (rule.context_exempt.includes('*')) return;
                        if (rule.context_exempt.some(ex => text.toLowerCase().includes(ex.toLowerCase()))) return;
                    }

                    // Check if this is a field label match (e.g., "Anti-inflammatory" as category)
                    if (field.path === 'category' && rule.pattern.toString().includes('anti-inflammatory')) return;

                    findings.push({
                        supplement: supp.name,
                        id: supp.id,
                        field: field.label,
                        fieldPath: field.path,
                        severity: rule.severity,
                        text: text,
                        matched: match[0],
                        description: rule.desc,
                        suggestion: rule.suggestion,
                    });
                });
            });
        });
    });

    return findings;
}

function auditHTMLFiles() {
    const findings = [];
    const htmlDirs = [
        path.join(ROOT, 'guides'),
        path.join(ROOT, 'categories'),
        path.join(ROOT, 'compare'),
    ];

    // Add root HTML files
    const rootFiles = ['index.html', 'about.html', 'faq.html'].map(f => path.join(ROOT, f));

    const allFiles = [];
    htmlDirs.forEach(dir => {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(f => {
            allFiles.push(path.join(dir, f));
        });
    });
    rootFiles.forEach(f => { if (fs.existsSync(f)) allFiles.push(f); });

    allFiles.forEach(filePath => {
        const html = fs.readFileSync(filePath, 'utf8');
        const relPath = path.relative(ROOT, filePath);

        // Extract visible text content (strip HTML tags, scripts, styles)
        const visibleText = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&[a-z]+;/gi, ' ')
            .replace(/\s+/g, ' ');

        // Split into sentences for context
        const sentences = visibleText.split(/[.!?]+/).filter(s => s.trim().length > 10);

        sentences.forEach(sentence => {
            PROHIBITED_PATTERNS.forEach(rule => {
                if (rule.severity === 'INFO' || rule.severity === 'LOW') return;
                const match = sentence.match(rule.pattern);
                if (!match) return;

                // Skip if in research context
                if (isResearchContext(sentence, '')) return;

                // Skip false positives (disclaimers, citation titles, safety warnings, negations)
                if (isFalsePositiveContext(sentence, match[0])) return;

                // Check context exemptions
                if (rule.context_exempt) {
                    if (rule.context_exempt.includes('*')) return;
                    if (rule.context_exempt.some(ex => sentence.toLowerCase().includes(ex.toLowerCase()))) return;
                }

                findings.push({
                    file: relPath,
                    severity: rule.severity,
                    text: sentence.trim().substring(0, 120),
                    matched: match[0],
                    description: rule.desc,
                    suggestion: rule.suggestion,
                });
            });
        });
    });

    return findings;
}

function auditGeneratorTemplates() {
    const findings = [];
    const generators = [
        'scripts/generate-guide-pages.js',
        'scripts/generate-category-pages.js',
        'scripts/generate-compare-pages.js',
    ];

    generators.forEach(genPath => {
        const filePath = path.join(ROOT, genPath);
        if (!fs.existsSync(filePath)) return;
        const code = fs.readFileSync(filePath, 'utf8');

        // Extract template string literals (content between backticks that looks like HTML)
        const templateMatches = code.match(/`[^`]*<[^`]*`/g) || [];
        templateMatches.forEach(template => {
            const visibleText = template
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\$\{[^}]+\}/g, ' ')
                .replace(/&[a-z]+;/gi, ' ')
                .replace(/\s+/g, ' ');

            PROHIBITED_PATTERNS.forEach(rule => {
                if (rule.severity === 'INFO' || rule.severity === 'LOW') return;
                const match = visibleText.match(rule.pattern);
                if (!match) return;

                if (rule.context_exempt) {
                    if (rule.context_exempt.includes('*')) return;
                    if (rule.context_exempt.some(ex => visibleText.toLowerCase().includes(ex.toLowerCase()))) return;
                }

                // Skip research context
                if (isResearchContext(visibleText, '')) return;

                // Skip false positives (disclaimers, citation titles, safety warnings, negations)
                if (isFalsePositiveContext(visibleText, match[0])) return;

                findings.push({
                    file: genPath,
                    severity: rule.severity,
                    text: visibleText.trim().substring(0, 120),
                    matched: match[0],
                    description: rule.desc,
                    suggestion: rule.suggestion,
                    type: 'template',
                });
            });
        });
    });

    return findings;
}

// ── Report ───────────────────────────────────────────────────────────────────
function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║       FDA CLAIM LANGUAGE AUDIT — SupplementDB               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // 1. Audit supplement data
    console.log('── Auditing data/supplements.js ──────────────────────────────\n');
    const dataFindings = auditSupplementData();

    // 2. Audit HTML pages
    console.log('── Auditing HTML content pages ───────────────────────────────\n');
    const htmlFindings = auditHTMLFiles();

    // 3. Audit generator templates
    console.log('── Auditing generator templates ──────────────────────────────\n');
    const templateFindings = auditGeneratorTemplates();

    const allFindings = [...dataFindings, ...htmlFindings, ...templateFindings];

    // Group by severity
    const critical = allFindings.filter(f => f.severity === 'CRITICAL');
    const high = allFindings.filter(f => f.severity === 'HIGH');
    const medium = allFindings.filter(f => f.severity === 'MEDIUM');
    const low = allFindings.filter(f => f.severity === 'LOW');

    if (critical.length > 0) {
        console.log(`\n🚨 CRITICAL FINDINGS (${critical.length}):`);
        critical.forEach(f => {
            console.log(`  [CRITICAL] ${f.supplement || f.file}`);
            console.log(`    Field: ${f.field || f.type || 'HTML content'}`);
            console.log(`    Match: "${f.matched}" in "${f.text.substring(0, 80)}..."`);
            console.log(`    Issue: ${f.description}`);
            console.log(`    Fix:   ${f.suggestion}`);
            console.log();
        });
    }

    if (high.length > 0) {
        console.log(`\n⛔ HIGH SEVERITY (${high.length}):`);
        high.forEach(f => {
            console.log(`  [HIGH] ${f.supplement || f.file}`);
            console.log(`    Field: ${f.field || f.type || 'HTML content'}`);
            console.log(`    Match: "${f.matched}" in "${f.text.substring(0, 80)}..."`);
            console.log(`    Issue: ${f.description}`);
            console.log(`    Fix:   ${f.suggestion}`);
            console.log();
        });
    }

    if (medium.length > 0) {
        console.log(`\n⚠️  MEDIUM SEVERITY (${medium.length}):`);
        medium.forEach(f => {
            console.log(`  [MEDIUM] ${f.supplement || f.file}`);
            console.log(`    Field: ${f.field || f.type || 'HTML content'}`);
            console.log(`    Match: "${f.matched}" in "${f.text.substring(0, 80)}..."`);
            console.log(`    Issue: ${f.description}`);
            console.log(`    Fix:   ${f.suggestion}`);
            console.log();
        });
    }

    // Summary
    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('AUDIT SUMMARY');
    console.log('══════════════════════════════════════════════════════════════');
    console.log(`  Supplements scanned: ${(loadSupplementData().supplements || []).length}`);
    console.log(`  HTML pages scanned:  ${htmlFindings.length > 0 ? 'Yes' : 'Yes (0 findings)'}`);
    console.log(`  Generator templates: ${templateFindings.length > 0 ? 'Yes' : 'Yes (0 findings)'}`);
    console.log();
    console.log(`  🚨 CRITICAL: ${critical.length}`);
    console.log(`  ⛔ HIGH:     ${high.length}`);
    console.log(`  ⚠️  MEDIUM:   ${medium.length}`);
    console.log(`  ℹ️  LOW:      ${low.length}`);
    console.log(`  ─────────────`);
    console.log(`  TOTAL:       ${allFindings.length}`);
    console.log();

    if (critical.length > 0 || high.length > 0) {
        console.log('❌ AUDIT FAILED — Critical/High severity findings must be resolved.');
        console.log('   Run with --fix to generate a patch file with suggested replacements.');
    } else if (medium.length > 0) {
        console.log('⚠️  AUDIT PASSED WITH WARNINGS — Medium findings should be reviewed.');
    } else {
        console.log('✅ AUDIT PASSED — No prohibited FDA claims detected.');
    }

    // Write findings to JSON if --fix flag
    if (process.argv.includes('--fix')) {
        const outPath = path.join(ROOT, 'scripts', 'fda-audit-findings.json');
        fs.writeFileSync(outPath, JSON.stringify(allFindings, null, 2), 'utf8');
        console.log(`\n📄 Findings written to: ${outPath}`);
    }

    return allFindings;
}

const findings = main();
process.exit(findings.filter(f => f.severity === 'CRITICAL').length > 0 ? 2 :
    findings.filter(f => f.severity === 'HIGH').length > 0 ? 1 : 0);
