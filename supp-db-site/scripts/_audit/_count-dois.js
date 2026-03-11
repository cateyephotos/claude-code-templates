const d = require('../data/citations-to-verify.json');
const all = [...d.withPmid, ...d.doiOnly];
const withDoi = all.filter(c => c.doi);
const noDoi = all.filter(c => !c.doi);
console.log('Total citations:', all.length);
console.log('With DOI:', withDoi.length);
console.log('Without DOI:', noDoi.length);
if (noDoi.length > 0) {
  console.log('No DOI titles:', noDoi.map(c => c.title));
}
// Print all DOIs for batch processing
console.log('\n--- ALL DOIs ---');
withDoi.forEach(c => console.log(c.doi));
