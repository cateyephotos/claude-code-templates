// Utility: Load and parse supplements.js data
const fs = require('fs');
const path = require('path');

function loadSupplementData() {
    const filePath = path.join(__dirname, '..', 'data', 'supplements.js');
    let src = fs.readFileSync(filePath, 'utf8');

    // Execute the JS to get the data object
    // The file defines `const supplementDatabase = {...}` and then assigns to window
    // We'll eval in a context where window exists
    const window = {};
    eval(src);
    return window.supplementDatabase || null;
}

// Category normalization map: raw values from data → standardized names per style guide
// Source data has 20 raw categories → normalize to 13 official categories
const CATEGORY_MAP = {
    // Direct matches (13 official)
    'Herbal Extracts': 'Herbal Extracts',
    'Essential Nutrients': 'Essential Nutrients',
    'Antioxidants': 'Antioxidants',
    'Amino Acids': 'Amino Acids',
    'Nootropics': 'Nootropics',
    'Adaptogens': 'Adaptogens',
    'Performance Enhancers': 'Performance Enhancers',
    'Anti-inflammatory': 'Anti-inflammatory',
    'Sleep Support': 'Sleep Support',
    'Metabolic Support': 'Metabolic Support',
    'Joint Support': 'Joint Support',
    'Polyphenols': 'Polyphenols',
    'Specialized': 'Specialized',
    // Singular forms
    'Herbal Supplement': 'Herbal Extracts',
    'Herbal Extract': 'Herbal Extracts',
    'Essential Nutrient': 'Essential Nutrients',
    'Vitamin': 'Essential Nutrients',
    'Mineral': 'Essential Nutrients',
    'Antioxidant': 'Antioxidants',
    'Amino Acid': 'Amino Acids',
    'Nootropic': 'Nootropics',
    'Adaptogen': 'Adaptogens',
    'Performance Enhancer': 'Performance Enhancers',
    'Polyphenol': 'Polyphenols',
    // Sub-types found in data → map to parent category
    'B-Vitamin Related': 'Essential Nutrients',
    'Essential Mineral': 'Essential Nutrients',
    'Essential Fatty Acid': 'Essential Nutrients',
    'Choline Compound': 'Nootropics',
    'Phospholipid': 'Nootropics',
    'Flavonoid': 'Antioxidants',
    'Plant Alkaloid': 'Herbal Extracts',
    'Protein': 'Performance Enhancers',
    'Sleep Aid': 'Sleep Support',
};

function normalizeCategory(raw) {
    return CATEGORY_MAP[raw] || raw;
}

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getTierLabel(tier) {
    const labels = {
        1: 'Strong Evidence',
        2: 'Moderate Evidence',
        3: 'Preliminary Evidence',
        4: 'Emerging Evidence'
    };
    return labels[tier] || 'Unknown';
}

function getTierColor(tier) {
    const colors = { 1: '#16a34a', 2: '#2563eb', 3: '#d97706', 4: '#6b7280' };
    return colors[tier] || '#6b7280';
}

function groupByCategory(supplements) {
    const groups = {};
    supplements.forEach(s => {
        const norm = normalizeCategory(s.category);
        if (!groups[norm]) groups[norm] = [];
        groups[norm].push(s);
    });
    return groups;
}

module.exports = {
    loadSupplementData,
    CATEGORY_MAP,
    normalizeCategory,
    slugify,
    getTierLabel,
    getTierColor,
    groupByCategory
};

// CLI: if run directly, print category summary
if (require.main === module) {
    const db = loadSupplementData();
    if (!db) { console.error('Failed to load data'); process.exit(1); }

    const groups = groupByCategory(db.supplements);
    console.log(`Total supplements: ${db.supplements.length}\n`);
    Object.keys(groups).sort().forEach(cat => {
        const supps = groups[cat];
        const tierDist = {};
        supps.forEach(s => { tierDist[s.evidenceTier] = (tierDist[s.evidenceTier] || 0) + 1; });
        console.log(`${cat} (${supps.length}):`);
        console.log(`  Tiers: ${Object.entries(tierDist).sort(([a],[b]) => a-b).map(([t,c]) => `T${t}:${c}`).join(', ')}`);
        console.log(`  Supps: ${supps.map(s => `${s.name} [T${s.evidenceTier}]`).join(', ')}`);
        console.log();
    });
}
