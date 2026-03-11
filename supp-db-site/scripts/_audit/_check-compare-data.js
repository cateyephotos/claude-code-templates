const { loadSupplementData, normalizeCategory } = require('./parse-data');
const db = loadSupplementData();
const names = ['Ashwagandha', 'Rhodiola rosea', 'Magnesium', 'Melatonin', 'Omega-3 Fatty Acids', 'CoQ10', 'Bacopa Monnieri', 'Ginkgo Biloba'];
names.forEach(n => {
    const s = db.supplements.find(x => x.name === n);
    if (!s) { console.log(n + ': NOT FOUND'); return; }
    const eKeys = Object.keys(s.effectSizes || {});
    console.log('=== ' + s.name + ' (T' + s.evidenceTier + ', ' + normalizeCategory(s.category) + ') ===');
    console.log('  Dose:', s.dosageRange);
    console.log('  Cog:', (s.primaryBenefits?.cognitive || []).join('; '));
    console.log('  NonCog:', (s.primaryBenefits?.nonCognitive || []).join('; '));
    console.log('  Effects:', eKeys.join(', '));
    console.log('  Cites:', (s.keyCitations || []).length);
    console.log('  Safety:', s.safetyProfile?.overallRating || 'N/A');
    console.log('  Sides:', (s.safetyProfile?.commonSideEffects || []).join(', '));
    console.log('  Mechanisms:', (s.mechanismsOfAction || []).slice(0, 3).join('; '));
    console.log('  Interactions:', (s.safetyProfile?.drugInteractions || []).join(', '));
    console.log('  Contraindications:', (s.safetyProfile?.contraindications || []).join(', '));
    console.log();
});
