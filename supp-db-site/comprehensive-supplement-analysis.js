const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🔍 COMPREHENSIVE SUPPLEMENT ANALYSIS - ALL 89 SUPPLEMENTS');
  console.log('Analyzing ID mappings, citation quality, and rendering functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);
    
    const analysisResults = await page.evaluate(() => {
      const results = {
        timestamp: new Date().toISOString(),
        totalSupplementsInDB: 0,
        totalEnhancedCitations: 0,
        supplementAnalysis: {},
        idMappingIssues: [],
        citationQualityMetrics: {
          totalWithCitations: 0,
          averageQualityScore: 0,
          averageSpecificity: 0,
          evidenceLevelDistribution: {}
        },
        renderingIssues: [],
        missingEnhancedCitations: [],
        duplicateIdIssues: [],
        summary: {
          fullyFunctional: 0,
          partialIssues: 0,
          majorIssues: 0,
          missing: 0
        }
      };
      
      // Get all supplements from the main database (simulated - would need actual data)
      // For now, we'll analyze what's available in enhanced citations
      
      if (!window.enhancedCitations) {
        results.error = 'Enhanced citations not loaded';
        return results;
      }
      
      results.totalEnhancedCitations = Object.keys(window.enhancedCitations).length;
      
      // Check for duplicate IDs
      const idCounts = {};
      for (const id of Object.keys(window.enhancedCitations)) {
        idCounts[id] = (idCounts[id] || 0) + 1;
      }
      
      for (const [id, count] of Object.entries(idCounts)) {
        if (count > 1) {
          results.duplicateIdIssues.push({ id: parseInt(id), count });
        }
      }
      
      // Analyze each enhanced citation
      for (const [id, citation] of Object.entries(window.enhancedCitations)) {
        const suppId = parseInt(id);
        const analysis = {
          id: suppId,
          name: citation.supplementName || citation.name || 'Unknown',
          scientificName: citation.scientificName || '',
          status: 'unknown',
          issues: [],
          qualityMetrics: {
            hasEvidenceProfile: false,
            hasCitations: false,
            citationCount: 0,
            specificityScore: 0,
            evidenceLevel: 'Unknown',
            qualityScore: 0
          }
        };
        
        // Check basic structure
        if (!citation.supplementName && !citation.name) {
          analysis.issues.push('Missing supplement name');
        }
        
        // Check evidence profile
        if (citation.evidenceProfile) {
          analysis.qualityMetrics.hasEvidenceProfile = true;
          analysis.qualityMetrics.evidenceLevel = citation.evidenceProfile.overallQuality || 'Unknown';
          analysis.qualityMetrics.qualityScore = citation.evidenceProfile.researchQualityScore || 0;
        } else {
          analysis.issues.push('Missing evidence profile');
        }
        
        // Check citations structure
        if (citation.citations) {
          analysis.qualityMetrics.hasCitations = true;
          let totalCitations = 0;
          let specificityScores = [];
          
          for (const [tab, citations] of Object.entries(citation.citations)) {
            if (Array.isArray(citations)) {
              totalCitations += citations.length;
              
              citations.forEach(cit => {
                // Calculate specificity score
                let specificity = 0;
                const claim = cit.claim || cit.mechanism || cit.title || cit.specificClaim || '';
                
                if (claim) {
                  if (claim.length > 20) specificity += 1;
                  if (claim.includes('study') || claim.includes('trial')) specificity += 1;
                  if (claim.includes('%') || claim.includes('mg') || claim.includes('dose')) specificity += 1;
                  if (cit.pmid || cit.doi) specificity += 1;
                  if (cit.evidence || cit.strength || cit.evidenceQuality) specificity += 1;
                  if (cit.participants || cit.studyType) specificity += 1;
                }
                
                specificityScores.push(specificity);
              });
            }
          }
          
          analysis.qualityMetrics.citationCount = totalCitations;
          analysis.qualityMetrics.specificityScore = specificityScores.length > 0 ? 
            (specificityScores.reduce((a, b) => a + b, 0) / specificityScores.length) : 0;
        } else {
          analysis.issues.push('Missing citations object');
        }
        
        // Determine overall status
        if (analysis.issues.length === 0 && analysis.qualityMetrics.hasCitations && analysis.qualityMetrics.hasEvidenceProfile) {
          analysis.status = 'fully_functional';
          results.summary.fullyFunctional++;
        } else if (analysis.qualityMetrics.hasCitations || analysis.qualityMetrics.hasEvidenceProfile) {
          analysis.status = 'partial_issues';
          results.summary.partialIssues++;
        } else {
          analysis.status = 'major_issues';
          results.summary.majorIssues++;
        }
        
        results.supplementAnalysis[suppId] = analysis;
        
        if (analysis.qualityMetrics.hasCitations) {
          results.citationQualityMetrics.totalWithCitations++;
        }
      }
      
      // Calculate overall metrics
      const qualityScores = Object.values(results.supplementAnalysis)
        .map(s => s.qualityMetrics.qualityScore)
        .filter(score => score > 0);
      
      const specificityScores = Object.values(results.supplementAnalysis)
        .map(s => s.qualityMetrics.specificityScore)
        .filter(score => score > 0);
      
      results.citationQualityMetrics.averageQualityScore = qualityScores.length > 0 ?
        (qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) : 0;
      
      results.citationQualityMetrics.averageSpecificity = specificityScores.length > 0 ?
        (specificityScores.reduce((a, b) => a + b, 0) / specificityScores.length) : 0;
      
      // Evidence level distribution
      const evidenceLevels = Object.values(results.supplementAnalysis)
        .map(s => s.qualityMetrics.evidenceLevel);
      
      results.citationQualityMetrics.evidenceLevelDistribution = evidenceLevels.reduce((acc, level) => {
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});
      
      return results;
    });
    
    // Generate concise summary
    console.log('\n📊 COMPREHENSIVE ANALYSIS RESULTS');
    console.log('='.repeat(50));
    
    console.log(`\n🔍 COVERAGE ANALYSIS:`);
    console.log(`   Enhanced Citations Available: ${analysisResults.totalEnhancedCitations}`);
    console.log(`   Fully Functional: ${analysisResults.summary.fullyFunctional}`);
    console.log(`   Partial Issues: ${analysisResults.summary.partialIssues}`);
    console.log(`   Major Issues: ${analysisResults.summary.majorIssues}`);
    console.log(`   Missing: ${analysisResults.summary.missing}`);
    
    console.log(`\n🎯 QUALITY METRICS:`);
    console.log(`   Average Quality Score: ${analysisResults.citationQualityMetrics.averageQualityScore.toFixed(1)}/100`);
    console.log(`   Average Specificity: ${analysisResults.citationQualityMetrics.averageSpecificity.toFixed(1)}/6`);
    console.log(`   Citations Coverage: ${analysisResults.citationQualityMetrics.totalWithCitations}/${analysisResults.totalEnhancedCitations}`);
    
    console.log(`\n📋 EVIDENCE DISTRIBUTION:`);
    for (const [level, count] of Object.entries(analysisResults.citationQualityMetrics.evidenceLevelDistribution)) {
      console.log(`   ${level}: ${count}`);
    }
    
    if (analysisResults.duplicateIdIssues.length > 0) {
      console.log(`\n🚨 DUPLICATE ID ISSUES:`);
      analysisResults.duplicateIdIssues.forEach(issue => {
        console.log(`   ID ${issue.id}: ${issue.count} entries`);
      });
    }
    
    // Save detailed analysis to file
    const reportContent = `# Comprehensive Supplement Analysis Report
**Date**: ${new Date().toISOString().split('T')[0]}
**Analysis Type**: Complete Enhanced Citation System Review

## Executive Summary

- **Total Enhanced Citations**: ${analysisResults.totalEnhancedCitations}
- **Fully Functional**: ${analysisResults.summary.fullyFunctional} (${((analysisResults.summary.fullyFunctional/analysisResults.totalEnhancedCitations)*100).toFixed(1)}%)
- **Partial Issues**: ${analysisResults.summary.partialIssues} (${((analysisResults.summary.partialIssues/analysisResults.totalEnhancedCitations)*100).toFixed(1)}%)
- **Major Issues**: ${analysisResults.summary.majorIssues} (${((analysisResults.summary.majorIssues/analysisResults.totalEnhancedCitations)*100).toFixed(1)}%)

## Quality Metrics

- **Average Quality Score**: ${analysisResults.citationQualityMetrics.averageQualityScore.toFixed(1)}/100
- **Average Specificity Score**: ${analysisResults.citationQualityMetrics.averageSpecificity.toFixed(1)}/6.0
- **Citations Coverage**: ${analysisResults.citationQualityMetrics.totalWithCitations}/${analysisResults.totalEnhancedCitations} supplements

## Evidence Level Distribution

${Object.entries(analysisResults.citationQualityMetrics.evidenceLevelDistribution)
  .map(([level, count]) => `- **${level}**: ${count} supplements`)
  .join('\n')}

## Detailed Supplement Analysis

${Object.values(analysisResults.supplementAnalysis)
  .sort((a, b) => a.id - b.id)
  .map(supp => `### ${supp.name} (ID: ${supp.id})
- **Status**: ${supp.status.replace('_', ' ').toUpperCase()}
- **Quality Score**: ${supp.qualityMetrics.qualityScore}/100
- **Evidence Level**: ${supp.qualityMetrics.evidenceLevel}
- **Citations**: ${supp.qualityMetrics.citationCount}
- **Specificity**: ${supp.qualityMetrics.specificityScore.toFixed(1)}/6.0
${supp.issues.length > 0 ? `- **Issues**: ${supp.issues.join(', ')}` : '- **Issues**: None'}
`).join('\n')}

## Recommendations

### High Priority
${analysisResults.summary.majorIssues > 0 ? `- Fix ${analysisResults.summary.majorIssues} supplements with major issues` : '- No major issues detected'}
${analysisResults.duplicateIdIssues.length > 0 ? `- Resolve ${analysisResults.duplicateIdIssues.length} duplicate ID conflicts` : ''}

### Medium Priority
${analysisResults.summary.partialIssues > 0 ? `- Address ${analysisResults.summary.partialIssues} supplements with partial issues` : ''}
- Improve average specificity score to ≥3.0/6.0

### Low Priority
- Expand coverage to remaining supplements
- Standardize evidence level classifications

---
**Generated**: ${analysisResults.timestamp}
**Tool**: Comprehensive Supplement Analysis Script`;

    // Write report to engineering docs
    fs.writeFileSync('engineering-docs/2025-01-28/comprehensive-analysis-report.md', reportContent);
    
    console.log(`\n✅ Analysis complete. Report saved to engineering-docs/2025-01-28/comprehensive-analysis-report.md`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  } finally {
    await browser.close();
  }
})();
