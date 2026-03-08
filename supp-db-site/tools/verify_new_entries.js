const fs = require('fs');
const content = fs.readFileSync('data/supplements.js', 'utf-8');
const match = content.match(/const supplementDatabase = (\{[\s\S]*\});/);
if (match === null) {
  console.log('PARSE ERROR: Could not extract supplementDatabase');
  process.exit(1);
}
try {
  const db = new Function('return ' + match[1])();
  console.log('Total supplements:', db.supplements.length);
  console.log('\nLast 5 entries:');
  db.supplements.slice(-5).forEach(s => {
    const enhanced = s.enhancedCitations ? s.enhancedCitations.isEnhanced : false;
    console.log('  ID', s.id, '-', s.name, '| enhanced:', enhanced);
  });

  // Verify IDs 90-93 exist
  [90, 91, 92, 93].forEach(id => {
    const s = db.supplements.find(x => x.id === id);
    if (s) {
      console.log('\nID', id, '- FOUND:', s.name);
      console.log('  Category:', s.category);
      console.log('  Dosage:', s.dosageRange);
      console.log('  Mechanisms:', s.mechanismsOfAction.length);
      console.log('  Health Domains:', s.healthDomains.join(', '));
    } else {
      console.log('\nID', id, '- NOT FOUND');
    }
  });

  // Check Performance Enhancers category
  const perf = db.categories.find(c => c.name === 'Performance Enhancers');
  console.log('\nPerformance Enhancers category:', perf.supplements.length, 'items');
  console.log('  Includes Beta-Alanine:', perf.supplements.includes('Beta-Alanine'));
  console.log('  Includes Citrulline Malate:', perf.supplements.includes('Citrulline Malate'));
  const hmb = 'HMB (β-Hydroxy β-Methylbutyrate)';
  console.log('  Includes HMB:', perf.supplements.includes(hmb));
  console.log('  Includes Betaine:', perf.supplements.includes('Betaine'));
} catch(e) {
  console.log('PARSE ERROR:', e.message);
  console.log(e.stack);
}
