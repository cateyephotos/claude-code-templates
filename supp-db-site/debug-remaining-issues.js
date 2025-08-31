const { chromium } = require('playwright');

(async () => {
  console.log('🔍 DEBUGGING REMAINING ISSUES');
  console.log('Investigating Turmeric and L-Theanine specific problems...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check data structures for both problematic supplements
    const dataAnalysis = await page.evaluate(() => {
      const turmericData = window.enhancedCitations?.[2]; // Turmeric
      const lTheanineData = window.enhancedCitations?.[9]; // L-Theanine
      
      const analyzeSupplementData = (data, name) => {
        if (!data) return { name, error: 'No data found' };
        
        const benefits = data.citations?.benefits || [];
        const safety = data.citations?.safety || [];
        const mechanisms = data.citations?.mechanisms || [];
        
        return {
          name: name,
          benefitsCount: benefits.length,
          safetyCount: safety.length,
          mechanismsCount: mechanisms.length,
          benefitsStructure: benefits.map((b, i) => ({
            index: i,
            hasClaim: !!b.claim,
            hasSpecificClaim: !!b.specificClaim,
            hasStudies: !!b.studies,
            hasEvidence: !!b.evidence,
            claim: b.claim,
            specificClaim: b.specificClaim,
            studiesLength: b.studies?.length || 0,
            evidenceLength: b.evidence?.length || 0,
            claimValue: b.claim || b.specificClaim || 'missing'
          })),
          safetyStructure: safety.map((s, i) => ({
            index: i,
            hasClaim: !!s.claim,
            hasStudies: !!s.studies,
            hasEvidence: !!s.evidence,
            claim: s.claim,
            studiesLength: s.studies?.length || 0,
            evidenceLength: s.evidence?.length || 0
          })),
          mechanismsStructure: mechanisms.map((m, i) => ({
            index: i,
            hasClaim: !!m.claim,
            hasMechanism: !!m.mechanism,
            hasStudies: !!m.studies,
            hasEvidence: !!m.evidence,
            claim: m.claim,
            mechanism: m.mechanism,
            studiesLength: m.studies?.length || 0,
            evidenceLength: m.evidence?.length || 0
          }))
        };
      };
      
      return {
        turmeric: analyzeSupplementData(turmericData, 'Turmeric'),
        lTheanine: analyzeSupplementData(lTheanineData, 'L-Theanine')
      };
    });
    
    console.log('\n📊 DATA STRUCTURE ANALYSIS:');
    
    // Analyze Turmeric
    console.log('\n🌿 TURMERIC/CURCUMIN:');
    const turmeric = dataAnalysis.turmeric;
    console.log(`   Benefits: ${turmeric.benefitsCount} | Safety: ${turmeric.safetyCount} | Mechanisms: ${turmeric.mechanismsCount}`);
    
    console.log('\n   Benefits Structure:');
    turmeric.benefitsStructure.forEach(b => {
      console.log(`     ${b.index + 1}: claim="${b.claimValue}" studies:${b.studiesLength} evidence:${b.evidenceLength}`);
    });
    
    // Analyze L-Theanine
    console.log('\n🍃 L-THEANINE:');
    const lTheanine = dataAnalysis.lTheanine;
    console.log(`   Benefits: ${lTheanine.benefitsCount} | Safety: ${lTheanine.safetyCount} | Mechanisms: ${lTheanine.mechanismsCount}`);
    
    console.log('\n   Benefits Structure:');
    lTheanine.benefitsStructure.forEach(b => {
      console.log(`     ${b.index + 1}: claim="${b.claimValue}" studies:${b.studiesLength} evidence:${b.evidenceLength}`);
    });
    
    console.log('\n   Safety Structure:');
    lTheanine.safetyStructure.forEach(s => {
      console.log(`     ${s.index + 1}: claim="${s.claim}" studies:${s.studiesLength} evidence:${s.evidenceLength}`);
    });
    
    console.log('\n   Mechanisms Structure:');
    lTheanine.mechanismsStructure.forEach(m => {
      console.log(`     ${m.index + 1}: claim="${m.claim}" mechanism="${m.mechanism}" studies:${m.studiesLength} evidence:${m.evidenceLength}`);
    });
    
    // Test direct rendering for both
    console.log('\n🔧 DIRECT RENDERING TEST:');
    
    const renderingTest = await page.evaluate(() => {
      const renderer = window.CitationRenderer;
      const turmericData = window.enhancedCitations?.[2];
      const lTheanineData = window.enhancedCitations?.[9];
      
      const testRendering = (data, name) => {
        if (!data || !renderer) return { name, error: 'Missing data or renderer' };
        
        const benefits = data.citations?.benefits || [];
        const safety = data.citations?.safety || [];
        const mechanisms = data.citations?.mechanisms || [];
        
        let results = {
          name: name,
          benefitsResults: [],
          safetyResults: [],
          mechanismsResults: [],
          errors: []
        };
        
        // Test benefits rendering
        benefits.forEach((benefit, i) => {
          try {
            const card = renderer.renderBenefitCard(benefit);
            results.benefitsResults.push({
              index: i,
              success: true,
              length: card.length,
              hasPMID: card.includes('PMID'),
              hasUndefined: card.includes('undefined')
            });
          } catch (e) {
            results.errors.push(`Benefits ${i}: ${e.message}`);
            results.benefitsResults.push({
              index: i,
              success: false,
              error: e.message
            });
          }
        });
        
        // Test safety rendering
        safety.forEach((safetyItem, i) => {
          try {
            const card = renderer.renderSafetyCard(safetyItem);
            results.safetyResults.push({
              index: i,
              success: true,
              length: card.length,
              hasPMID: card.includes('PMID'),
              hasUndefined: card.includes('undefined')
            });
          } catch (e) {
            results.errors.push(`Safety ${i}: ${e.message}`);
            results.safetyResults.push({
              index: i,
              success: false,
              error: e.message
            });
          }
        });
        
        // Test mechanisms rendering
        mechanisms.forEach((mechanism, i) => {
          try {
            const card = renderer.renderMechanismCard(mechanism);
            results.mechanismsResults.push({
              index: i,
              success: true,
              length: card.length,
              hasPMID: card.includes('PMID'),
              hasUndefined: card.includes('undefined')
            });
          } catch (e) {
            results.errors.push(`Mechanisms ${i}: ${e.message}`);
            results.mechanismsResults.push({
              index: i,
              success: false,
              error: e.message
            });
          }
        });
        
        return results;
      };
      
      return {
        turmeric: testRendering(turmericData, 'Turmeric'),
        lTheanine: testRendering(lTheanineData, 'L-Theanine')
      };
    });
    
    console.log('\n🌿 TURMERIC RENDERING:');
    const turmericRender = renderingTest.turmeric;
    console.log(`   Benefits: ${turmericRender.benefitsResults.filter(r => r.success).length}/${turmericRender.benefitsResults.length} success`);
    console.log(`   Safety: ${turmericRender.safetyResults.filter(r => r.success).length}/${turmericRender.safetyResults.length} success`);
    console.log(`   Mechanisms: ${turmericRender.mechanismsResults.filter(r => r.success).length}/${turmericRender.mechanismsResults.length} success`);
    
    if (turmericRender.errors.length > 0) {
      console.log(`   Errors: ${turmericRender.errors.join(', ')}`);
    }
    
    console.log('\n🍃 L-THEANINE RENDERING:');
    const lTheanineRender = renderingTest.lTheanine;
    console.log(`   Benefits: ${lTheanineRender.benefitsResults.filter(r => r.success).length}/${lTheanineRender.benefitsResults.length} success`);
    console.log(`   Safety: ${lTheanineRender.safetyResults.filter(r => r.success).length}/${lTheanineRender.safetyResults.length} success`);
    console.log(`   Mechanisms: ${lTheanineRender.mechanismsResults.filter(r => r.success).length}/${lTheanineRender.mechanismsResults.length} success`);
    
    if (lTheanineRender.errors.length > 0) {
      console.log(`   Errors: ${lTheanineRender.errors.join(', ')}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 ISSUE DIAGNOSIS');
    console.log('='.repeat(60));
    
    // Diagnose Turmeric issue
    const turmericBenefitsHaveUndefined = turmeric.benefitsStructure.some(b => b.claimValue === 'undefined');
    const turmericRenderingWorks = turmericRender.benefitsResults.every(r => r.success);
    
    console.log('\n🌿 TURMERIC DIAGNOSIS:');
    if (turmericBenefitsHaveUndefined) {
      console.log(`   ❌ Data Issue: Benefits have "undefined" claim values`);
    }
    if (!turmericRenderingWorks) {
      console.log(`   ❌ Rendering Issue: Direct rendering fails`);
    }
    if (turmericBenefitsHaveUndefined && turmericRenderingWorks) {
      console.log(`   ⚠️ Data Issue Only: Rendering works but data has undefined values`);
    }
    
    // Diagnose L-Theanine issue
    const lTheanineBenefitsHaveData = lTheanine.benefitsStructure.some(b => b.studiesLength > 0 || b.evidenceLength > 0);
    const lTheanineRenderingWorks = lTheanineRender.benefitsResults.every(r => r.success) && 
                                   lTheanineRender.safetyResults.every(r => r.success) && 
                                   lTheanineRender.mechanismsResults.every(r => r.success);
    
    console.log('\n🍃 L-THEANINE DIAGNOSIS:');
    if (!lTheanineBenefitsHaveData) {
      console.log(`   ❌ Data Issue: Benefits missing studies/evidence data`);
    }
    if (!lTheanineRenderingWorks) {
      console.log(`   ❌ Rendering Issue: Direct rendering fails`);
    }
    if (lTheanineBenefitsHaveData && lTheanineRenderingWorks) {
      console.log(`   ✅ Should be working: Data and rendering both work`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Remaining issues debug complete');
  }
})();
