const fs = require('fs');

console.log('📊 COMPREHENSIVE AUDIT RESULTS ANALYSIS');

// Load and analyze the audit results
const results = JSON.parse(fs.readFileSync('comprehensive-audit-results.json', 'utf8'));

console.log(`\n📈 PHASE 1 AUDIT SUMMARY:`);
console.log(`Total Supplements Tested: ${results.length}`);

const workingSupplements = results.filter(r => r.overallWorking);
const brokenSupplements = results.filter(r => !r.overallWorking);

console.log(`Working Supplements: ${workingSupplements.length}`);
console.log(`Broken Supplements: ${brokenSupplements.length}`);
console.log(`Success Rate: ${Math.round((workingSupplements.length / results.length) * 100)}%`);

console.log(`\n✅ WORKING SUPPLEMENTS (${workingSupplements.length}):`);
workingSupplements.forEach(supp => {
  console.log(`   • ${supp.name} (ID: ${supp.id})`);
});

console.log(`\n❌ BROKEN SUPPLEMENTS (${brokenSupplements.length}):`);
brokenSupplements.forEach(supp => {
  const allIssues = [...(supp.issues?.benefits || []), ...(supp.issues?.safety || []), ...(supp.issues?.mechanisms || [])];
  console.log(`   • ${supp.name} (ID: ${supp.id}) - Issues: ${allIssues.join(', ')}`);
});

// Analyze issue patterns
console.log(`\n🔍 ISSUE PATTERN ANALYSIS:`);

const issuePatterns = {
  'Missing PMIDs': 0,
  'No study cards': 0,
  'Undefined values': 0
};

brokenSupplements.forEach(supp => {
  const allIssues = [...(supp.issues?.benefits || []), ...(supp.issues?.safety || []), ...(supp.issues?.mechanisms || [])];
  allIssues.forEach(issue => {
    if (issue.includes('Missing PMIDs')) issuePatterns['Missing PMIDs']++;
    if (issue.includes('No study cards')) issuePatterns['No study cards']++;
    if (issue.includes('undefined')) issuePatterns['Undefined values']++;
  });
});

Object.entries(issuePatterns).forEach(([issue, count]) => {
  console.log(`   ${issue}: ${count} occurrences`);
});

// Tab-specific analysis
console.log(`\n📋 TAB-SPECIFIC FAILURE ANALYSIS:`);

const tabIssues = {
  benefits: results.filter(r => !r.benefitsWorking).length,
  safety: results.filter(r => !r.safetyWorking).length,
  mechanisms: results.filter(r => !r.mechanismsWorking).length
};

console.log(`Benefits Tab Failures: ${tabIssues.benefits}/${results.length} (${Math.round((tabIssues.benefits / results.length) * 100)}%)`);
console.log(`Safety Tab Failures: ${tabIssues.safety}/${results.length} (${Math.round((tabIssues.safety / results.length) * 100)}%)`);
console.log(`Mechanisms Tab Failures: ${tabIssues.mechanisms}/${results.length} (${Math.round((tabIssues.mechanisms / results.length) * 100)}%)`);

// Identify supplements by priority for remediation
const highPrioritySupplements = brokenSupplements.filter(supp => {
  const allIssues = [...(supp.issues?.benefits || []), ...(supp.issues?.safety || []), ...(supp.issues?.mechanisms || [])];
  return allIssues.some(issue => issue.includes('No study cards') || issue.includes('undefined'));
});

const mediumPrioritySupplements = brokenSupplements.filter(supp => {
  const allIssues = [...(supp.issues?.benefits || []), ...(supp.issues?.safety || []), ...(supp.issues?.mechanisms || [])];
  return allIssues.every(issue => issue.includes('Missing PMIDs')) && allIssues.length > 0;
});

console.log(`\n🎯 REMEDIATION PRIORITY CLASSIFICATION:`);
console.log(`\nHigh Priority (Structural Issues): ${highPrioritySupplements.length}`);
highPrioritySupplements.forEach(supp => {
  console.log(`   • ${supp.name} (ID: ${supp.id})`);
});

console.log(`\nMedium Priority (PMID Issues Only): ${mediumPrioritySupplements.length}`);
mediumPrioritySupplements.forEach(supp => {
  console.log(`   • ${supp.name} (ID: ${supp.id})`);
});

// Calculate target metrics
const currentSuccessRate = Math.round((workingSupplements.length / results.length) * 100);
const targetSuccessRate = 95;
const supplementsToFix = Math.ceil((targetSuccessRate - currentSuccessRate) * results.length / 100);

console.log(`\n🎯 PHASE 2 REMEDIATION TARGETS:`);
console.log(`Current Success Rate: ${currentSuccessRate}%`);
console.log(`Target Success Rate: ${targetSuccessRate}%`);
console.log(`Supplements to Fix: ${supplementsToFix} (minimum)`);
console.log(`Total Broken Supplements: ${brokenSupplements.length}`);

console.log(`\n🔧 RECOMMENDED REMEDIATION APPROACH:`);
console.log(`1. Fix ${highPrioritySupplements.length} high-priority supplements (structural issues)`);
console.log(`2. Fix ${mediumPrioritySupplements.length} medium-priority supplements (PMID issues)`);
console.log(`3. Validate fixes achieve >95% success rate`);
console.log(`4. Document all remediation steps and outcomes`);

// Save detailed analysis for Phase 2
const analysis = {
  timestamp: new Date().toISOString(),
  phase: 'Phase 1 - Comprehensive Audit Complete',
  totalTested: results.length,
  working: workingSupplements.length,
  broken: brokenSupplements.length,
  successRate: currentSuccessRate,
  targetSuccessRate: targetSuccessRate,
  supplementsToFix: supplementsToFix,
  workingSupplements: workingSupplements.map(s => ({ id: s.id, name: s.name })),
  brokenSupplements: brokenSupplements.map(s => ({
    id: s.id,
    name: s.name,
    issues: s.issues
  })),
  issuePatterns: issuePatterns,
  tabIssues: tabIssues,
  highPrioritySupplements: highPrioritySupplements.map(s => ({ id: s.id, name: s.name })),
  mediumPrioritySupplements: mediumPrioritySupplements.map(s => ({ id: s.id, name: s.name })),
  remediationPlan: {
    phase2Target: 'Fix all broken supplements to achieve >95% success rate',
    highPriorityCount: highPrioritySupplements.length,
    mediumPriorityCount: mediumPrioritySupplements.length,
    estimatedImpact: `${supplementsToFix}+ supplements fixed`
  }
};

fs.writeFileSync('phase1-audit-analysis.json', JSON.stringify(analysis, null, 2));
console.log(`\n💾 Phase 1 analysis saved to phase1-audit-analysis.json`);

console.log(`\n🚀 READY FOR PHASE 2: DATA STRUCTURE ANALYSIS & REMEDIATION`);
console.log(`Next: Begin systematic remediation of ${brokenSupplements.length} broken supplements`);

return analysis;
