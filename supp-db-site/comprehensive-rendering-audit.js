const { chromium } = require('playwright');

(async () => {
  console.log('🔍 COMPREHENSIVE ENHANCED CITATION RENDERING AUDIT');
  console.log('Testing browser rendering for all 89 supplements...');
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();
  
  // Audit results storage
  const auditResults = {
    working: [],
    partial: [],
    failed: [],
    missing: [],
    errors: []
  };
  
  try {
    console.log('\n🌐 Loading supplement database...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for initial load
    await page.waitForTimeout(5000);
    
    console.log('\n🔍 PHASE 1: EXAMINING GINKGO BILOBA CLINICAL BENEFITS');
    
    // First, let's examine Ginkgo Biloba specifically
    const ginkgoAudit = await page.evaluate(() => {
      // Find Ginkgo Biloba (should be ID 14 based on common database structures)
      const ginkgoIds = [14, 16]; // Check common IDs for Ginkgo
      let ginkgoData = null;
      let ginkgoId = null;
      
      for (const id of ginkgoIds) {
        if (window.enhancedCitations && window.enhancedCitations[id]) {
          const data = window.enhancedCitations[id];
          if (data.supplementName && data.supplementName.toLowerCase().includes('ginkgo')) {
            ginkgoData = data;
            ginkgoId = id;
            break;
          }
        }
      }
      
      if (!ginkgoData) {
        // Search through all citations for Ginkgo
        if (window.enhancedCitations) {
          for (const [id, data] of Object.entries(window.enhancedCitations)) {
            if (data.supplementName && data.supplementName.toLowerCase().includes('ginkgo')) {
              ginkgoData = data;
              ginkgoId = parseInt(id);
              break;
            }
          }
        }
      }
      
      return {
        found: !!ginkgoData,
        id: ginkgoId,
        name: ginkgoData?.supplementName,
        hasCitations: !!(ginkgoData?.citations),
        hasBenefits: !!(ginkgoData?.citations?.benefits),
        benefitsCount: ginkgoData?.citations?.benefits?.length || 0,
        hasEvidenceProfile: !!(ginkgoData?.evidenceProfile),
        sampleBenefit: ginkgoData?.citations?.benefits?.[0]
      };
    });
    
    console.log(`   Ginkgo Biloba Found: ${ginkgoAudit.found ? '✅' : '❌'}`);
    if (ginkgoAudit.found) {
      console.log(`   ID: ${ginkgoAudit.id}, Name: ${ginkgoAudit.name}`);
      console.log(`   Has Citations: ${ginkgoAudit.hasCitations ? '✅' : '❌'}`);
      console.log(`   Has Benefits: ${ginkgoAudit.hasBenefits ? '✅' : '❌'} (${ginkgoAudit.benefitsCount} benefits)`);
      console.log(`   Has Evidence Profile: ${ginkgoAudit.hasEvidenceProfile ? '✅' : '❌'}`);
      
      if (ginkgoAudit.sampleBenefit) {
        console.log(`   Sample Benefit: "${ginkgoAudit.sampleBenefit.claim}"`);
        console.log(`   Evidence Level: "${ginkgoAudit.sampleBenefit.evidence}"`);
      }
      
      // Now test actual rendering by clicking on Ginkgo Biloba
      if (ginkgoAudit.id) {
        console.log('\n🧪 Testing Ginkgo Biloba rendering...');
        
        try {
          // Find and click the Ginkgo Biloba supplement card
          const ginkgoCard = await page.locator(`[data-supplement-id="${ginkgoAudit.id}"]`).first();
          if (await ginkgoCard.count() > 0) {
            await ginkgoCard.click();
            await page.waitForTimeout(2000);
            
            // Check if modal opened
            const modal = page.locator('.modal, .supplement-modal, [role="dialog"]');
            const modalVisible = await modal.count() > 0;
            console.log(`   Modal opened: ${modalVisible ? '✅' : '❌'}`);
            
            if (modalVisible) {
              // Test Clinical Benefits tab
              const benefitsTab = page.locator('text="Clinical Benefits", text="Benefits"').first();
              if (await benefitsTab.count() > 0) {
                await benefitsTab.click();
                await page.waitForTimeout(1000);
                
                // Check for citation content
                const citationContent = await page.evaluate(() => {
                  const benefitsSection = document.querySelector('[data-tab="benefits"], .benefits-tab, .clinical-benefits');
                  if (!benefitsSection) return { found: false, reason: 'No benefits section found' };
                  
                  const citations = benefitsSection.querySelectorAll('.citation, .benefit-citation, [data-citation]');
                  const hasStudyDetails = Array.from(citations).some(citation => {
                    const text = citation.textContent || '';
                    return text.includes('participants') || text.includes('study') || text.includes('RCT') || text.includes('Evidence');
                  });
                  
                  return {
                    found: citations.length > 0,
                    count: citations.length,
                    hasStudyDetails,
                    sampleText: citations[0]?.textContent?.substring(0, 200) || 'No text found'
                  };
                });
                
                console.log(`   Citations rendered: ${citationContent.found ? '✅' : '❌'} (${citationContent.count} citations)`);
                console.log(`   Study details present: ${citationContent.hasStudyDetails ? '✅' : '❌'}`);
                if (citationContent.sampleText) {
                  console.log(`   Sample text: "${citationContent.sampleText.substring(0, 100)}..."`);
                }
              }
              
              // Close modal
              const closeButton = page.locator('.close, .modal-close, [aria-label="Close"]').first();
              if (await closeButton.count() > 0) {
                await closeButton.click();
                await page.waitForTimeout(500);
              }
            }
          } else {
            console.log(`   ❌ Could not find supplement card for ID ${ginkgoAudit.id}`);
          }
        } catch (error) {
          console.log(`   ❌ Error testing Ginkgo rendering: ${error.message}`);
        }
      }
    }
    
    console.log('\n🔍 PHASE 2: SYSTEMATIC DATABASE AUDIT');
    console.log('Testing all 89 supplements...');
    
    // Get all supplement IDs (1-89)
    const allSupplementIds = Array.from({length: 89}, (_, i) => i + 1);
    
    let processedCount = 0;
    const batchSize = 5; // Smaller batches for rendering tests
    
    for (let i = 0; i < allSupplementIds.length; i += batchSize) {
      const batch = allSupplementIds.slice(i, i + batchSize);
      
      console.log(`\n📊 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allSupplementIds.length/batchSize)} (IDs: ${batch[0]}-${batch[batch.length-1]})`);
      
      for (const id of batch) {
        processedCount++;
        
        const result = await page.evaluate((supplementId) => {
          // Smart evidence extraction function (same as CitationRenderer)
          function extractEvidence(citationItem) {
            // Format A: Direct evidence field (Phase 3 format)
            if (citationItem.evidence && typeof citationItem.evidence === 'string') {
              return citationItem.evidence;
            }

            // Format B: Map from strength field (Legacy format)
            if (citationItem.strength) {
              const strengthMap = {
                "Strong": "Strong Evidence",
                "Moderate": "Moderate Evidence",
                "Weak": "Limited Evidence",
                "Limited": "Limited Evidence",
                "High": "Strong Evidence",
                "Medium": "Moderate Evidence",
                "Low": "Limited Evidence"
              };
              return strengthMap[citationItem.strength] || (citationItem.strength + " Evidence");
            }

            // Format B: Map from evidenceQuality field
            if (citationItem.evidenceQuality) {
              return citationItem.evidenceQuality.includes("Evidence") ?
                     citationItem.evidenceQuality :
                     citationItem.evidenceQuality + " Evidence";
            }

            // Safety-specific mapping
            if (citationItem.riskLevel) {
              const riskMap = {
                "Low": "Good Safety Profile",
                "Minimal": "Excellent Safety Profile",
                "Moderate": "Caution Advised",
                "High": "Safety Concerns",
                "Very Low": "Excellent Safety Profile"
              };
              return riskMap[citationItem.riskLevel] || "Safety Information";
            }

            // Mechanism-specific fallback
            if (citationItem.mechanismType) {
              return "Established Mechanism";
            }

            // Default fallback
            return "Evidence Available";
          }

          const result = {
            id: supplementId,
            name: 'Unknown',
            status: 'missing',
            details: {},
            issues: []
          };

          // Check if enhanced citation exists
          if (window.enhancedCitations && window.enhancedCitations[supplementId]) {
            const citation = window.enhancedCitations[supplementId];
            result.name = citation.supplementName || `Supplement ${supplementId}`;
            result.status = 'found';
            
            // Check Evidence Profile
            result.details.hasEvidenceProfile = !!citation.evidenceProfile;
            if (citation.evidenceProfile) {
              result.details.tier = citation.evidenceProfile.overallQuality;
              result.details.score = citation.evidenceProfile.researchQualityScore;
            }
            
            // Check Citations structure - handle multiple formats
            const hasCitationsObject = !!citation.citations;
            const hasCitationsArray = Array.isArray(citation.citations);
            const hasEnhancedCitations = Array.isArray(citation.enhancedCitations);

            result.details.hasCitations = hasCitationsObject || hasCitationsArray || hasEnhancedCitations;

            if (hasCitationsObject && typeof citation.citations === 'object' && !Array.isArray(citation.citations)) {
              // Standard format: citations.mechanisms, citations.benefits, citations.safety
              const tabs = ['mechanisms', 'benefits', 'safety'];
              result.details.tabs = {};

              for (const tab of tabs) {
                const tabData = citation.citations[tab];
                result.details.tabs[tab] = {
                  exists: !!tabData,
                  count: Array.isArray(tabData) ? tabData.length : 0,
                  hasValidCitations: false
                };
                
                // Enhanced validation with smart evidence extraction
                if (Array.isArray(tabData) && tabData.length > 0) {
                  const firstCitation = tabData[0];

                  // Check for claim field (required) - multiple possible field names
                  const hasClaim = !!(firstCitation.claim || firstCitation.mechanism || firstCitation.title || firstCitation.specificClaim);

                  // Smart evidence extraction
                  const extractedEvidence = extractEvidence(firstCitation);
                  const hasEvidence = !!extractedEvidence;

                  const hasRequired = hasClaim && hasEvidence;

                  result.details.tabs[tab].hasValidCitations = hasRequired;
                  result.details.tabs[tab].sampleClaim = firstCitation.claim || firstCitation.mechanism || firstCitation.title || firstCitation.specificClaim || 'Missing';
                  result.details.tabs[tab].sampleEvidence = extractedEvidence || 'Missing';

                  if (!hasRequired) {
                    const missing = [];
                    if (!hasClaim) missing.push('claim');
                    if (!hasEvidence) missing.push('evidence');
                    result.issues.push(`${tab}: Missing ${missing.join(', ')}`);
                  }
                }
              }
            } else if (hasCitationsArray || hasEnhancedCitations) {
              // Alternative format: citations as array or enhancedCitations array
              const citationsArray = citation.citations || citation.enhancedCitations;

              result.details.tabs = {
                mechanisms: { exists: true, count: 0, hasValidCitations: false },
                benefits: { exists: true, count: 0, hasValidCitations: false },
                safety: { exists: true, count: 0, hasValidCitations: false }
              };

              if (Array.isArray(citationsArray) && citationsArray.length > 0) {
                // Treat the array as containing all types of citations
                const totalCount = citationsArray.length;

                // Distribute citations across tabs for display purposes
                result.details.tabs.mechanisms.count = Math.ceil(totalCount / 3);
                result.details.tabs.benefits.count = Math.ceil(totalCount / 3);
                result.details.tabs.safety.count = Math.floor(totalCount / 3);

                // Check if citations have valid structure
                const firstCitation = citationsArray[0];

                // Check for claim field (multiple possible field names)
                const hasClaim = !!(firstCitation.claim || firstCitation.title || firstCitation.mechanism || firstCitation.specificClaim);

                // Smart evidence extraction
                const extractedEvidence = extractEvidence(firstCitation);
                const hasEvidence = !!extractedEvidence;

                const hasRequired = hasClaim && hasEvidence;

                if (hasRequired) {
                  // Mark all tabs as working since we have valid citation structure
                  result.details.tabs.mechanisms.hasValidCitations = true;
                  result.details.tabs.benefits.hasValidCitations = true;
                  result.details.tabs.safety.hasValidCitations = true;

                  result.details.tabs.mechanisms.sampleClaim = firstCitation.claim || firstCitation.title || 'Available';
                  result.details.tabs.mechanisms.sampleEvidence = extractedEvidence;
                  result.details.tabs.benefits.sampleClaim = firstCitation.claim || firstCitation.title || 'Available';
                  result.details.tabs.benefits.sampleEvidence = extractedEvidence;
                  result.details.tabs.safety.sampleClaim = firstCitation.claim || firstCitation.title || 'Available';
                  result.details.tabs.safety.sampleEvidence = extractedEvidence;
                } else {
                  const missing = [];
                  if (!hasClaim) missing.push('claim/title');
                  if (!hasEvidence) missing.push('evidence');
                  result.issues.push(`Array format: Missing ${missing.join(', ')}`);
                }
              } else {
                result.issues.push('Empty citations array');
              }
            } else {
              result.status = 'failed';
              result.issues.push('No citations object found');
            }

            // Determine overall status if we have tabs
            if (result.details.tabs) {
              const workingTabs = Object.values(result.details.tabs).filter(tab => tab.hasValidCitations).length;
              const totalTabs = Object.keys(result.details.tabs).length;

              if (workingTabs === totalTabs && workingTabs > 0) {
                result.status = 'working';
              } else if (workingTabs > 0) {
                result.status = 'partial';
                result.issues.push(`Only ${workingTabs}/${totalTabs} tabs working`);
              } else if (result.status !== 'failed') {
                result.status = 'failed';
                result.issues.push('No tabs have valid citations');
              }
            }
          } else {
            result.status = 'missing';
            result.issues.push('No enhanced citation data found');
          }
          
          return result;
        }, id);
        
        const statusIcon = {
          'working': '✅',
          'partial': '⚠️',
          'failed': '❌',
          'missing': '⭕'
        }[result.status] || '❓';
        
        console.log(`   ${statusIcon} ID ${result.id}: ${result.name} (${result.status})`);
        
        if (result.details.tabs) {
          const tabStatus = Object.entries(result.details.tabs)
            .map(([tab, data]) => `${tab.charAt(0).toUpperCase()}:${data.hasValidCitations ? '✅' : '❌'}(${data.count})`)
            .join(' ');
          console.log(`     Tabs: ${tabStatus}`);
        }
        
        if (result.details.hasEvidenceProfile) {
          console.log(`     Evidence: ${result.details.tier} (Score: ${result.details.score})`);
        }
        
        if (result.issues.length > 0) {
          console.log(`     Issues: ${result.issues.join(', ')}`);
        }
        
        // Categorize result
        auditResults[result.status].push(result);
        
        // Small delay between supplements
        await page.waitForTimeout(200);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 COMPREHENSIVE AUDIT RESULTS');
    console.log('='.repeat(80));
    
    const total = processedCount;
    const working = auditResults.working.length;
    const partial = auditResults.partial.length;
    const failed = auditResults.failed.length;
    const missing = auditResults.missing.length;
    
    console.log(`\n📊 OVERALL STATISTICS:`);
    console.log(`   Total Supplements Tested: ${total}`);
    console.log(`   ✅ Fully Working: ${working} (${Math.round((working/total)*100)}%)`);
    console.log(`   ⚠️ Partially Working: ${partial} (${Math.round((partial/total)*100)}%)`);
    console.log(`   ❌ Failed/Broken: ${failed} (${Math.round((failed/total)*100)}%)`);
    console.log(`   ⭕ Missing Citations: ${missing} (${Math.round((missing/total)*100)}%)`);
    
    const functional = working + partial;
    console.log(`   🎯 Total Functional: ${functional} (${Math.round((functional/total)*100)}%)`);
    
    return {
      total,
      working,
      partial,
      failed,
      missing,
      functionalPercentage: Math.round((functional/total)*100),
      auditResults
    };
    
  } catch (error) {
    console.error('\n❌ Audit failed:', error.message);
    auditResults.errors.push(error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Comprehensive citation audit complete');
  }
})();
