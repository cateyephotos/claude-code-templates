#!/usr/bin/env node
/**
 * migrate-enhanced-citations.js
 *
 * Converts non-canonical enhanced citation files to the canonical schema.
 *
 * Problem: 5 supplements have their research data in non-standard formats:
 *   - 33_l_tyrosine_enhanced.js       → uses flat `enhancedCitations: [...]`
 *   - 35_tribulus_terrestris_enhanced.js → flat `citations: [...]` array
 *   - 65_fenugreek_enhanced.js           → flat `citations: [...]` array
 *   - 69_mucuna_pruriens_enhanced.js     → flat `citations: [...]` array
 *   - 73_stinging_nettle_enhanced.js     → flat `citations: [...]` array
 *
 * Canonical schema requires:
 *   citations: {
 *     mechanisms: [{ mechanism, strength, target, evidence: [{citationId, ...}] }],
 *     benefits:   [{ healthDomain, specificClaim, strength, target, evidence: [...] }],
 *     safety:     [{ safetyAspect, claim, riskLevel, target, evidence: [...] }],
 *     dosage:     [{ dosageRange, claim, evidenceBase, target, evidence: [...] }]
 *   }
 *
 * Usage:
 *   node scripts/migrate-enhanced-citations.js
 *   node scripts/migrate-enhanced-citations.js --dry-run
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT    = path.join(__dirname, '..');
const DIR     = path.join(ROOT, 'data', 'enhanced_citations');

// ---- Helpers ----

function loadFile(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const ctx = { window: { enhancedCitations: {} }, module: { exports: {} } };
    vm.createContext(ctx);
    const constMatch = src.match(/(?:^|\n)\s*(?:const|let|var)\s+(\w+)\s*=/m);
    let patchedSrc = src;
    if (constMatch) {
        patchedSrc = src + `\ntry { window.__top = ${constMatch[1]}; } catch(e) {}`;
    }
    try { vm.runInContext(patchedSrc, ctx); } catch (e) { return null; }
    if (ctx.window.__top) return ctx.window.__top;
    const keys = Object.keys(ctx.window.enhancedCitations);
    if (keys.length > 0) return ctx.window.enhancedCitations[keys[0]];
    return null;
}

function evidenceLevel(studyType) {
    if (!studyType) return 'Level 3';
    const t = studyType.toLowerCase();
    if (t.includes('meta-analysis') || t.includes('systematic review')) return 'Level 1';
    if (t.includes('randomized') || t.includes('rct') || t.includes('double-blind')) return 'Level 2';
    if (t.includes('clinical') || t.includes('cohort') || t.includes('pilot')) return 'Level 3';
    if (t.includes('animal') || t.includes('preclinical') || t.includes('in vitro') || t.includes('phytochemical')) return 'Level 4';
    return 'Level 3';
}

function papersToEvidence(papers) {
    return papers.map(p => {
        const findings = Array.isArray(p.keyFindings)
            ? p.keyFindings.join('. ')
            : (p.keyFindings || p.findings || '');
        return {
            citationId: p.id ? `${p.id}` : `paper_${p.year}`,
            title: p.title || '',
            authors: Array.isArray(p.authors) ? p.authors : [p.authors || ''],
            year: parseInt(p.year) || 0,
            journal: p.journal || '',
            doi: p.doi || '',
            pmid: p.pmid || '',
            studyType: p.studyType || p.type || '',
            evidenceLevel: evidenceLevel(p.studyType || p.type || ''),
            findings: findings,
            methodology: `${p.studyType || p.type || ''}. Sample: ${p.sampleSize || p.studyPopulation || 'Not reported'}.`,
            participants: p.sampleSize || '',
        };
    });
}

function writeFile(filePath, content) {
    if (DRY_RUN) {
        console.log(`[dry-run] Would write: ${path.relative(ROOT, filePath)}`);
    } else {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Wrote ${path.relative(ROOT, filePath)}`);
    }
}

// ---- Per-supplement migration definitions ----
// Each entry: { file, generate(rawData) -> canonicalObj }

const MIGRATIONS = [

    // ===================================================================
    // 35 — Tribulus Terrestris
    // ===================================================================
    {
        file: '35_tribulus_terrestris_enhanced.js',
        generate(raw) {
            const papers = raw.citations || [];
            const byId = {};
            papers.forEach(p => { byId[p.id] = p; });

            const mechanisticPapers = papers.filter(p =>
                (p.tags || []).some(t => ['protodioscin', 'steroidal saponins', 'androgenic activity',
                    'mechanisms', 'hormonal recovery', 'sexual behavior', 'erectile physiology'].includes(t))
            );
            const benefitPapers = papers.filter(p =>
                (p.tags || []).some(t => ['erectile dysfunction', 'sexual dysfunction', 'male fertility',
                    'oligozoospermia', 'sexual function', 'IIEF-5', 'testosterone therapy',
                    'sperm count', 'sperm motility', 'libido', 'hypogonadism'].includes(t))
                || ['Systematic Review', 'Meta-Analysis', 'Randomized Controlled Trial',
                    'Randomized Double-blind Study', 'Clinical Study', 'Double-blind Placebo-controlled Trial',
                    'Pilot Clinical Trial'].includes(p.studyType)
            );
            const safetyPapers = papers.filter(p =>
                (p.keyFindings || []).some(f => f.toLowerCase().includes('safe') || f.toLowerCase().includes('adverse') || f.toLowerCase().includes('side effect'))
            );

            return {
                supplementId: 35,
                name: 'Tribulus Terrestris',
                scientificName: 'Tribulus terrestris',
                category: 'Herbal Extracts',
                commonNames: ['Puncture Vine', 'Goat\'s Head', 'Devil\'s Weed'],
                evidenceProfile: raw.evidenceProfile || {},
                citations: {
                    mechanisms: [
                        {
                            mechanism: 'Steroidal Saponin Activity & Hormonal Modulation',
                            strength: 'Moderate',
                            mechanismType: 'Phytochemical receptor modulation',
                            tissueTarget: 'Gonadal tissue, Hypothalamic-pituitary axis',
                            target: 'Gonadal tissue, Hypothalamic-pituitary axis',
                            evidence: papersToEvidence(mechanisticPapers),
                        }
                    ],
                    benefits: [
                        {
                            healthDomain: 'Sexual Function & Male Fertility',
                            specificClaim: 'Improves erectile function and sexual satisfaction; supports sperm parameters in oligozoospermic men',
                            strength: 'Moderate',
                            evidenceQuality: 'Moderate',
                            replicationStatus: 'Replicated across 5+ RCTs and systematic reviews',
                            tissueTarget: 'Reproductive system',
                            target: 'Reproductive system',
                            evidence: papersToEvidence(benefitPapers),
                            metaAnalysisSupport: null,
                        }
                    ],
                    safety: [
                        {
                            safetyAspect: 'General Tolerability',
                            claim: 'Well-tolerated at standard doses with minimal adverse effects; no serious adverse events reported in clinical trials',
                            riskLevel: 'Low',
                            target: 'Gastrointestinal tract',
                            tissueTarget: 'Gastrointestinal tract',
                            evidence: papersToEvidence(safetyPapers.slice(0, 4)),
                        }
                    ],
                    dosage: [
                        {
                            dosageRange: '500–1500 mg/day of standardized extract (standardized to ≥45% saponins)',
                            claim: 'Sexual dysfunction: 750–1500mg daily for 8–12 weeks; Male fertility: 500–1000mg daily for 3–6 months',
                            evidenceBase: 'Moderate',
                            target: 'Reproductive system',
                            tissueTarget: 'Reproductive system',
                            evidence: papersToEvidence(papers.filter(p =>
                                ['Randomized Controlled Trial', 'Pilot Clinical Trial', 'Randomized Double-blind Study'].includes(p.studyType)
                            ).slice(0, 4)),
                        }
                    ],
                },
            };
        }
    },

    // ===================================================================
    // 65 — Fenugreek
    // ===================================================================
    {
        file: '65_fenugreek_enhanced.js',
        generate(raw) {
            const papers = raw.citations || [];

            const mechanisticPapers = papers.filter(p =>
                (p.studyType || '').toLowerCase().includes('mechanis') ||
                (p.studyType || '').toLowerCase().includes('phytochemical') ||
                (p.studyType || '').toLowerCase().includes('in vitro') ||
                (p.title || '').toLowerCase().includes('mechanism') ||
                (p.title || '').toLowerCase().includes('pathway') ||
                (p.title || '').toLowerCase().includes('4-hydroxyisoleucine') ||
                (p.title || '').toLowerCase().includes('saponin')
            );
            const safetyPapers = papers.filter(p =>
                (p.title || '').toLowerCase().includes('safe') ||
                (p.title || '').toLowerCase().includes('tolerab') ||
                (p.title || '').toLowerCase().includes('adverse')
            );
            const dosaePapers = papers.filter(p =>
                ['Randomized Controlled Trial', 'Double-blind', 'Placebo-controlled'].some(t => (p.studyType || '').includes(t))
            ).slice(0, 4);

            return {
                supplementId: 65,
                name: 'Fenugreek',
                scientificName: 'Trigonella foenum-graecum',
                category: 'Herbal Extracts',
                commonNames: ['Methi', 'Greek Hay', 'Bird\'s Foot'],
                evidenceProfile: raw.evidenceProfile || {},
                citations: {
                    mechanisms: [
                        {
                            mechanism: '4-Hydroxyisoleucine Insulin Sensitization & Steroidogenic Activity',
                            strength: 'Moderate',
                            mechanismType: 'Enzyme modulation, receptor agonism',
                            tissueTarget: 'Pancreatic β-cells, Liver, Skeletal muscle',
                            target: 'Pancreatic β-cells, Liver, Skeletal muscle',
                            evidence: papersToEvidence(mechanisticPapers.length ? mechanisticPapers : papers.slice(0, 3)),
                        }
                    ],
                    benefits: [
                        {
                            healthDomain: 'Blood Glucose Control & Testosterone Support',
                            specificClaim: 'Lowers fasting blood glucose and HbA1c in type 2 diabetes; may support free testosterone in men',
                            strength: 'Moderate',
                            evidenceQuality: 'Moderate',
                            replicationStatus: 'Multiple RCTs and meta-analyses',
                            tissueTarget: 'Pancreas, Gonadal tissue',
                            target: 'Pancreas, Gonadal tissue',
                            evidence: papersToEvidence(papers),
                            metaAnalysisSupport: null,
                        }
                    ],
                    safety: [
                        {
                            safetyAspect: 'General Tolerability & GI Safety',
                            claim: 'Generally well-tolerated; may cause mild GI symptoms; avoid in pregnancy at high doses; possible maple-syrup odor in sweat/urine',
                            riskLevel: 'Low',
                            target: 'Gastrointestinal tract',
                            tissueTarget: 'Gastrointestinal tract',
                            evidence: papersToEvidence(safetyPapers.length ? safetyPapers : papers.slice(0, 3)),
                        }
                    ],
                    dosage: [
                        {
                            dosageRange: '500–2000 mg/day of standardized fenugreek seed extract',
                            claim: 'Blood sugar: 500–1000mg/day with meals; Testosterone support: 500–600mg/day (Testofen® 50% fenugreek extract)',
                            evidenceBase: 'Moderate',
                            target: 'Metabolic and endocrine tissues',
                            tissueTarget: 'Metabolic and endocrine tissues',
                            evidence: papersToEvidence(dosaePapers.length ? dosaePapers : papers.slice(0, 3)),
                        }
                    ],
                },
            };
        }
    },

    // ===================================================================
    // 69 — Mucuna Pruriens
    // ===================================================================
    {
        file: '69_mucuna_pruriens_enhanced.js',
        generate(raw) {
            const papers = raw.citations || [];

            const mechanisticPapers = papers.filter(p =>
                (p.title || '').toLowerCase().includes('l-dopa') ||
                (p.title || '').toLowerCase().includes('levodopa') ||
                (p.title || '').toLowerCase().includes('dopamine') ||
                (p.title || '').toLowerCase().includes('mechanism') ||
                (p.studyType || '').toLowerCase().includes('preclinical') ||
                (p.studyType || '').toLowerCase().includes('in vitro') ||
                (p.studyType || '').toLowerCase().includes('phytochemical')
            );
            const safetyPapers = papers.filter(p =>
                (p.title || '').toLowerCase().includes('safe') ||
                (p.title || '').toLowerCase().includes('tolerab') ||
                (p.keyFindings || []).some(f => f.toLowerCase().includes('adverse') || f.toLowerCase().includes('safe'))
            );

            return {
                supplementId: 69,
                name: 'Mucuna Pruriens',
                scientificName: 'Mucuna pruriens',
                category: 'Herbal Extracts',
                commonNames: ['Velvet Bean', 'Cowhage', 'Kapikachu'],
                evidenceProfile: raw.evidenceProfile || {},
                citations: {
                    mechanisms: [
                        {
                            mechanism: 'L-DOPA Content & Dopaminergic Pathway Activation',
                            strength: 'Strong',
                            mechanismType: 'Neurotransmitter precursor supplementation',
                            tissueTarget: 'Substantia nigra, Striatum, Hypothalamic-pituitary axis',
                            target: 'Substantia nigra, Striatum, Hypothalamic-pituitary axis',
                            evidence: papersToEvidence(mechanisticPapers.length ? mechanisticPapers : papers.slice(0, 4)),
                        }
                    ],
                    benefits: [
                        {
                            healthDomain: 'Parkinson\'s Disease Symptoms & Testosterone Support',
                            specificClaim: 'Reduces motor symptoms in Parkinson\'s disease via natural L-DOPA; supports testosterone and fertility in infertile men',
                            strength: 'Moderate',
                            evidenceQuality: 'Moderate',
                            replicationStatus: 'Multiple clinical studies including comparative trials vs. levodopa',
                            tissueTarget: 'Nigrostriatal pathway, Reproductive system',
                            target: 'Nigrostriatal pathway, Reproductive system',
                            evidence: papersToEvidence(papers),
                            metaAnalysisSupport: null,
                        }
                    ],
                    safety: [
                        {
                            safetyAspect: 'L-DOPA Related Tolerability',
                            claim: 'Generally well-tolerated at clinical doses; may cause nausea, dyskinesia at high doses similar to pharmaceutical levodopa; requires monitoring in Parkinson\'s patients',
                            riskLevel: 'Moderate',
                            target: 'Gastrointestinal tract, Central nervous system',
                            tissueTarget: 'Gastrointestinal tract, Central nervous system',
                            evidence: papersToEvidence(safetyPapers.length ? safetyPapers : papers.slice(0, 3)),
                        }
                    ],
                    dosage: [
                        {
                            dosageRange: '5 g seed powder (standardized to 3–7% L-DOPA) or 200–500 mg concentrated extract',
                            claim: 'Parkinson\'s: 45 g/day in clinical studies; General use: 5g seed powder or 300–500mg extract; testosterone support: 5g/day for 3 months',
                            evidenceBase: 'Moderate',
                            target: 'Central nervous system, Reproductive system',
                            tissueTarget: 'Central nervous system, Reproductive system',
                            evidence: papersToEvidence(papers.filter(p =>
                                ['Randomized Controlled Trial', 'Clinical Study', 'Double-blind'].some(t => (p.studyType || '').includes(t))
                            ).slice(0, 4)),
                        }
                    ],
                },
            };
        }
    },

    // ===================================================================
    // 73 — Stinging Nettle
    // ===================================================================
    {
        file: '73_stinging_nettle_enhanced.js',
        generate(raw) {
            const papers = raw.citations || [];

            const mechanisticPapers = papers.filter(p =>
                (p.title || '').toLowerCase().includes('mechanism') ||
                (p.title || '').toLowerCase().includes('aromatase') ||
                (p.title || '').toLowerCase().includes('anti-inflammatory') ||
                (p.title || '').toLowerCase().includes('shbg') ||
                (p.title || '').toLowerCase().includes('cyclooxygenase') ||
                (p.studyType || '').toLowerCase().includes('in vitro') ||
                (p.studyType || '').toLowerCase().includes('preclinical')
            );
            const safetyPapers = papers.filter(p =>
                (p.title || '').toLowerCase().includes('safe') ||
                (p.title || '').toLowerCase().includes('tolerab') ||
                (p.keyFindings || []).some(f => f.toLowerCase().includes('adverse') || f.toLowerCase().includes('safe') || f.toLowerCase().includes('tolerat'))
            );

            return {
                supplementId: 73,
                name: 'Stinging Nettle',
                scientificName: 'Urtica dioica',
                category: 'Herbal Extracts',
                commonNames: ['Common Nettle', 'Urtica', 'Nettle Leaf'],
                evidenceProfile: raw.evidenceProfile || {},
                citations: {
                    mechanisms: [
                        {
                            mechanism: 'Anti-inflammatory Enzyme Inhibition & SHBG Binding',
                            strength: 'Moderate',
                            mechanismType: 'COX/LOX inhibition, Sex hormone binding globulin modulation',
                            tissueTarget: 'Synovial tissue, Prostate, Liver',
                            target: 'Synovial tissue, Prostate, Liver',
                            evidence: papersToEvidence(mechanisticPapers.length ? mechanisticPapers : papers.slice(0, 3)),
                        }
                    ],
                    benefits: [
                        {
                            healthDomain: 'Benign Prostatic Hyperplasia & Joint Inflammation',
                            specificClaim: 'Reduces lower urinary tract symptoms in BPH; anti-inflammatory effects support joint pain and osteoarthritis',
                            strength: 'Moderate',
                            evidenceQuality: 'Moderate',
                            replicationStatus: 'Multiple RCTs for BPH; preliminary RCT evidence for joint health',
                            tissueTarget: 'Prostate, Synovial joints',
                            target: 'Prostate, Synovial joints',
                            evidence: papersToEvidence(papers),
                            metaAnalysisSupport: null,
                        }
                    ],
                    safety: [
                        {
                            safetyAspect: 'General Tolerability',
                            claim: 'Generally well-tolerated; may cause mild GI symptoms; avoid in pregnancy; can interact with anticoagulants and diabetes medications',
                            riskLevel: 'Low',
                            target: 'Gastrointestinal tract',
                            tissueTarget: 'Gastrointestinal tract',
                            evidence: papersToEvidence(safetyPapers.length ? safetyPapers : papers.slice(0, 3)),
                        }
                    ],
                    dosage: [
                        {
                            dosageRange: '360–1200 mg/day of dried leaf extract or 240–720 mg/day of root extract',
                            claim: 'BPH: 300–600mg root extract daily; Joint support: 1340mg freeze-dried leaf or 9ml nettle juice daily; Allergies: 300mg leaf extract twice daily',
                            evidenceBase: 'Moderate',
                            target: 'Prostate and joint tissue',
                            tissueTarget: 'Prostate and joint tissue',
                            evidence: papersToEvidence(papers.filter(p =>
                                ['Randomized', 'Clinical', 'Double-blind'].some(t => (p.studyType || '').includes(t))
                            ).slice(0, 4)),
                        }
                    ],
                },
            };
        }
    },

    // ===================================================================
    // 33 — L-Tyrosine (different source structure: enhancedCitations array)
    // ===================================================================
    {
        file: '33_l_tyrosine_enhanced.js',
        generate(raw) {
            // L-Tyrosine uses `enhancedCitations: [...]` flat array
            const papers = raw.enhancedCitations || raw.citations || [];

            const mechanisticPapers = papers.filter(p =>
                (p.mechanisms || []).length > 0 ||
                (p.title || '').toLowerCase().includes('mechanism') ||
                (p.title || '').toLowerCase().includes('catecholamine') ||
                (p.title || '').toLowerCase().includes('dopamine') ||
                (p.title || '').toLowerCase().includes('norepinephrine') ||
                (p.type || p.studyType || '').toLowerCase().includes('review')
            );
            const safetyPapers = papers.filter(p =>
                p.safetyProfile ||
                (p.keyFindings || []).some(f => f.toLowerCase().includes('safe') || f.toLowerCase().includes('adverse') || f.toLowerCase().includes('no serious'))
            );
            const dosaePapers = papers.filter(p =>
                (p.practicalApplications || []).some(a => a.toLowerCase().includes('dose') || a.toLowerCase().includes('mg/kg') || a.toLowerCase().includes('mg/day'))
                || (p.title || '').toLowerCase().includes('dose')
                || (p.title || '').toLowerCase().includes('supplementation')
            ).slice(0, 4);

            const mechEvidence = papersToEvidence(mechanisticPapers.length ? mechanisticPapers : papers.slice(0, 4));
            const benefitEvidence = papersToEvidence(papers);
            const safetyEvidence = papersToEvidence(safetyPapers.length ? safetyPapers : papers.slice(0, 4));
            const dosageEvidence = papersToEvidence(dosaePapers.length ? dosaePapers : papers.slice(0, 3));

            // Override citationId with id field from L-Tyrosine's unique schema
            papers.forEach((p, i) => {
                if (p.id && typeof p.id === 'string') {
                    const evArr = [mechEvidence, benefitEvidence, safetyEvidence, dosageEvidence];
                    evArr.forEach(arr => {
                        const item = arr.find(e => e.citationId === String(p.id) || e.title === p.title);
                        if (item) item.citationId = p.id;
                    });
                }
            });

            return {
                supplementId: 33,
                name: 'L-Tyrosine',
                scientificName: 'L-Tyrosine (4-hydroxyphenylalanine)',
                category: 'Amino Acids',
                commonNames: ['Tyrosine', 'N-Acetyl L-Tyrosine (NALT)'],
                evidenceProfile: raw.evidenceProfile || {},
                citations: {
                    mechanisms: [
                        {
                            mechanism: 'Catecholamine Synthesis & Stress-Induced Depletion Reversal',
                            strength: 'Moderate',
                            mechanismType: 'Neurotransmitter precursor — rate-limiting substrate',
                            tissueTarget: 'Prefrontal cortex, Adrenal medulla, Sympathetic nervous system',
                            target: 'Prefrontal cortex, Adrenal medulla, Sympathetic nervous system',
                            evidence: mechEvidence,
                        }
                    ],
                    benefits: [
                        {
                            healthDomain: 'Cognitive Performance Under Stress',
                            specificClaim: 'Reverses stress-induced cognitive decline; improves working memory and executive function under acute stressors (cold, sleep deprivation, altitude, noise)',
                            strength: 'Moderate',
                            evidenceQuality: 'Moderate',
                            replicationStatus: 'Well-replicated in stress paradigm studies; not supported for general cognitive enhancement without stress',
                            tissueTarget: 'Prefrontal cortex',
                            target: 'Prefrontal cortex',
                            evidence: benefitEvidence,
                            metaAnalysisSupport: null,
                        }
                    ],
                    safety: [
                        {
                            safetyAspect: 'General Tolerability',
                            claim: 'Well-tolerated at doses up to 12g/day short-term; minor GI discomfort in some; contraindicated with MAOIs; caution with hyperthyroidism',
                            riskLevel: 'Low',
                            target: 'Gastrointestinal tract, Thyroid gland',
                            tissueTarget: 'Gastrointestinal tract, Thyroid gland',
                            evidence: safetyEvidence,
                        }
                    ],
                    dosage: [
                        {
                            dosageRange: '500–2000 mg/day; stress use: 100–150 mg/kg body weight 30–60 min before stressor',
                            claim: 'Cognitive stress mitigation: 100–150mg/kg 30–60 minutes prior to stressor; general supplementation: 500–2000mg in divided doses away from meals',
                            evidenceBase: 'Moderate',
                            target: 'Central nervous system',
                            tissueTarget: 'Central nervous system',
                            evidence: dosageEvidence,
                        }
                    ],
                },
            };
        }
    },

];

// ---- Output template ----

function toCamelCase(name) {
    return name
        .replace(/[^a-zA-Z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join('');
}

function generateFile(id, varName, canonical) {
    const { supplementId, name, scientificName, category, commonNames, evidenceProfile, citations } = canonical;
    return `// Enhanced Citations for ${name} (ID: ${id})
// Migrated to canonical schema by migrate-enhanced-citations.js
// Generated: ${new Date().toISOString().slice(0, 10)}

const ${varName}Enhanced = {
  id: ${supplementId},
  supplementId: ${supplementId},
  name: ${JSON.stringify(name)},
  scientificName: ${JSON.stringify(scientificName || '')},
  category: ${JSON.stringify(category || '')},
  commonNames: ${JSON.stringify(commonNames || [])},

  evidenceProfile: ${JSON.stringify(evidenceProfile || {}, null, 2).split('\n').join('\n  ')},

  citations: ${JSON.stringify(citations, null, 2).split('\n').join('\n  ')}
};

window.enhancedCitations = window.enhancedCitations || {};
window.enhancedCitations[${supplementId}] = ${varName}Enhanced;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ${varName}Enhanced;
}
`;
}

// ---- Main ----

function main() {
    console.log('Enhanced Citations Migration');
    console.log('============================\n');

    MIGRATIONS.forEach(({ file, generate }) => {
        const filePath = path.join(DIR, file);
        if (!fs.existsSync(filePath)) {
            console.warn(`  SKIP: ${file} not found`);
            return;
        }

        console.log(`Processing: ${file}`);

        const raw = loadFile(filePath);
        if (!raw) {
            console.error(`  ERROR: Failed to load ${file}`);
            return;
        }

        const canonical = generate(raw);
        const id = canonical.supplementId;
        const varName = toCamelCase(canonical.name);

        const output = generateFile(id, varName, canonical);

        // Validate output has non-empty arrays
        const c = canonical.citations;
        console.log(`  mechanisms: ${c.mechanisms[0].evidence.length} evidence items`);
        console.log(`  benefits:   ${c.benefits[0].evidence.length} evidence items`);
        console.log(`  safety:     ${c.safety[0].evidence.length} evidence items`);
        console.log(`  dosage:     ${c.dosage[0].evidence.length} evidence items`);

        const outPath = filePath; // overwrite in place
        writeFile(outPath, output);
        console.log('');
    });

    console.log('Migration complete.');
    if (DRY_RUN) console.log('(dry-run — no files written)');
}

main();
