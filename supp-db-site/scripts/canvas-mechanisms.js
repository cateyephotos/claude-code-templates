#!/usr/bin/env node
'use strict';

/**
 * Canvas Mechanisms — One-time extraction and consolidation script
 *
 * Reads all mechanismsOfAction from supplements.js, clusters near-duplicates,
 * auto-categorizes into 9 biological systems, and outputs data/mechanisms.js
 * with empty summary/relevance fields ready for AI generation.
 *
 * Usage: node scripts/canvas-mechanisms.js
 */

const fs = require('fs');
const path = require('path');

const db = require('../data/supplements.js');

// ── Step 1: Extract all unique mechanisms with supplement attribution ──────

const mechToSupps = {};
for (const s of db.supplements) {
  for (const m of (s.mechanismsOfAction || [])) {
    const mStr = typeof m === 'string' ? m : (m.mechanism || String(m));
    if (!mechToSupps[mStr]) mechToSupps[mStr] = [];
    if (!mechToSupps[mStr].includes(s.name)) mechToSupps[mStr].push(s.name);
  }
}

const allMechs = Object.keys(mechToSupps).sort();
console.log(`Extracted ${allMechs.length} unique mechanisms from ${db.supplements.length} supplements`);

// ── Step 2: Cluster near-duplicates ────────────────────────────────────────

function normalize(str) {
  return str.toLowerCase()
    // Strip parenthetical qualifiers: "(anti-inflammatory)", "(prefrontal cortex)", etc.
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    // Strip trailing long qualifiers after em-dash or " — "
    .replace(/\s*[—–-]{1,3}\s+.+$/, '')
    // Strip trailing action words that create near-duplicates
    .replace(/\s*(enhancement|support|increase|promotion|stimulation|improvement|modulation|activation|production|regulation|synthesis|precursor|optimization|reduction|conversion|contribution|maintenance|facilitation)\s*$/i, '')
    // Strip "via ..." and "reducing ..." suffixes
    .replace(/\s*(via|reducing|through|by)\s+.+$/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    // Collapse multiple spaces
    .replace(/\s+/g, ' ');
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

const clusters = {};
const assigned = new Set();

for (const m of allMechs) {
  if (assigned.has(m)) continue;

  const norm = normalize(m);

  // Find all mechanisms that share this normalized root
  const group = allMechs.filter(other => {
    if (assigned.has(other)) return false;
    return normalize(other) === norm;
  });

  if (group.length === 0) group.push(m);

  // Pick the shortest as canonical (usually the cleanest phrasing)
  const canonical = group.sort((a, b) => a.length - b.length)[0];
  const aliases = group.filter(g => g !== canonical);
  const supplements = new Set();
  for (const g of group) {
    for (const s of (mechToSupps[g] || [])) supplements.add(s);
  }

  const id = slugify(canonical);

  clusters[id] = {
    id,
    canonicalName: canonical,
    aliases,
    category: '',
    summary: '',
    relevance: '',
    relatedMechanisms: [],
    supplements: [...supplements].sort(),
  };

  group.forEach(g => assigned.add(g));
}

console.log(`Consolidated into ${Object.keys(clusters).length} canonical mechanisms`);

// ── Step 3: Auto-categorize ────────────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  'Neurotransmitter Systems': ['acetylcholine', 'dopamine', 'serotonin', 'gaba', 'glutamate', 'norepinephrine', 'neurotransmitter', 'cholinergic', 'adrenergic', 'receptor', 'synaptic', 'brain wave', 'alpha wave', 'nmda', 'ampa', 'adenosine', '5-ht', 'monoamine'],
  'Antioxidant & Cellular Protection': ['antioxidant', 'oxidative', 'free radical', 'nrf2', 'glutathione', 'superoxide', 'ros', 'lipid peroxidation', 'mitochondri', 'nad+', 'atp', 'cellular energy', 'electron transport', 'coenzyme q10', 'dna repair', 'telomer', 'sirtu', 'autophagy', 'membrane'],
  'Anti-inflammatory Pathways': ['anti-inflammatory', 'inflammation', 'nf-kb', 'nf-κb', 'cox-2', 'prostaglandin', 'cytokine', 'tnf', 'interleukin', 'leukotriene', 'lipoxygenase', 'mast cell'],
  'Hormonal & Endocrine': ['hormone', 'cortisol', 'testosterone', 'estrogen', 'thyroid', 'insulin sens', 'igf', 'hpa axis', 'adaptogen', 'endocrine', 'dhea', 'growth hormone', 'androgen', 'aromatase', 'stress response', 'adrenal'],
  'Metabolic & Energy': ['metaboli', 'glycol', 'glucos', 'ampk', 'lipid', 'fat oxidation', 'thermogen', 'ketone', 'creatine', 'phosphocreatine', 'glycogen', 'blood sugar', 'energy substrate', 'carnitine', 'beta-oxidation', 'calori', 'appetite', 'satiety', 'alpha-amylase', 'alpha-glucosidase'],
  'Cardiovascular & Circulatory': ['cardiovascular', 'blood pressure', 'vasodilat', 'nitric oxide', 'endothelial', 'blood flow', 'cholesterol', 'ldl', 'hdl', 'triglyceride', 'platelet', 'ace inhibit', 'angiotensin', 'cerebral blood', 'cardiac', 'heart'],
  'Immune Modulation': ['immune', 'immunomodulat', 'nk cell', 't-cell', 'lymphocyte', 'macrophage', 'interferon', 'antimicrobial', 'antibacterial', 'antiviral', 'pathogen', 'white blood'],
  'Structural & Repair': ['collagen', 'cartilage', 'bone', 'joint', 'connective tissue', 'myelin', 'nerve growth', 'ngf', 'bdnf', 'neurogenesis', 'synaptogenesis', 'proteoglycan', 'glycosaminoglycan', 'muscle protein', 'mtor', 'muscle repair', 'recovery', 'wound'],
  'Gut-Brain Axis': ['gut', 'microbiome', 'prebiotic', 'probiotic', 'intestinal', 'digestive', 'bile', 'gut-brain', 'enteric', 'gastric', 'stomach'],
};

for (const cluster of Object.values(clusters)) {
  const searchStr = (cluster.canonicalName + ' ' + cluster.aliases.join(' ')).toLowerCase();
  let bestCat = 'Metabolic & Energy';
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => searchStr.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }

  cluster.category = bestCat;
}

// ── Step 4: Build aliasMap ─────────────────────────────────────────────────

const aliasMap = {};
for (const cluster of Object.values(clusters)) {
  aliasMap[cluster.canonicalName] = cluster.id;
  for (const alias of cluster.aliases) {
    aliasMap[alias] = cluster.id;
  }
}

// ── Step 5: Build output ───────────────────────────────────────────────────

const categories = [
  'Neurotransmitter Systems',
  'Antioxidant & Cellular Protection',
  'Anti-inflammatory Pathways',
  'Hormonal & Endocrine',
  'Metabolic & Energy',
  'Cardiovascular & Circulatory',
  'Immune Modulation',
  'Structural & Repair',
  'Gut-Brain Axis',
];

const mechanisms = Object.values(clusters).sort((a, b) =>
  categories.indexOf(a.category) - categories.indexOf(b.category) ||
  a.canonicalName.localeCompare(b.canonicalName)
);

const output = {
  version: '1.0',
  lastUpdated: new Date().toISOString().split('T')[0],
  categories,
  mechanisms,
  aliasMap,
};

const outPath = path.join(__dirname, '..', 'data', 'mechanisms.js');
const js = `// Mechanism Glossary Database — Auto-generated by canvas-mechanisms.js
// ${mechanisms.length} canonical mechanisms consolidated from ${allMechs.length} raw strings
// Last generated: ${output.lastUpdated}
//
// REVIEW: summary and relevance fields need AI generation then human review

const mechanismDatabase = ${JSON.stringify(output, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = mechanismDatabase;
}
if (typeof window !== 'undefined') {
  window.mechanismDatabase = mechanismDatabase;
}
`;

fs.writeFileSync(outPath, js, 'utf8');

console.log(`\nWrote ${outPath}`);
console.log(`  ${mechanisms.length} canonical mechanisms`);
console.log(`  ${Object.keys(aliasMap).length} alias mappings`);
console.log(`  ${categories.length} categories`);

// Print category distribution
console.log('\nCategory distribution:');
const catCounts = {};
for (const m of mechanisms) catCounts[m.category] = (catCounts[m.category] || 0) + 1;
for (const cat of categories) {
  console.log(`  ${cat}: ${catCounts[cat] || 0}`);
}
