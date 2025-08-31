/**
 * Debug Normalization in Detail
 * Check exactly what's happening in the study normalization process
 */

const { chromium } = require('playwright');

async function debugNormalizationDetailed() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Debugging normalization in detail...');
    
    try {
        await page.goto(`http://localhost:3000?t=${Date.now()}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Inject detailed debug code
        await page.evaluate(() => {
            // Override the _normalizeStudies method with detailed logging
            if (window.CitationRenderer && window.CitationRenderer.prototype._normalizeStudies) {
                const originalNormalizeStudies = window.CitationRenderer.prototype._normalizeStudies;
                
                window.CitationRenderer.prototype._normalizeStudies = function(studies) {
                    console.log('🔧 _normalizeStudies called with:', studies);
                    
                    if (!Array.isArray(studies)) {
                        console.log('❌ Studies is not an array:', studies);
                        return [];
                    }
                    
                    const result = studies.map((study, index) => {
                        console.log(`🔍 Processing study ${index}:`, study);
                        
                        // Handle Format C (Melatonin/L-Theanine style)
                        if (study.claim && study.citation && !study.title) {
                            console.log(`📋 Format C detected for study ${index}`);
                            
                            const authors = this._extractAuthorsFromCitation(study.citation);
                            const year = this._extractYearFromCitation(study.citation);
                            
                            console.log(`  Extracted authors:`, authors);
                            console.log(`  Extracted year:`, year);
                            
                            const normalized = {
                                ...study,
                                title: study.claim || "Study finding",
                                authors: authors,
                                year: year,
                                evidenceLevel: study.evidenceLevel || study.evidence || this._mapStudyTypeToEvidenceLevel(study.studyType) || "Level 4",
                                findings: study.keyFinding || study.claim || '',
                                doi: study.doi || ''
                            };
                            
                            console.log(`  Normalized study ${index}:`, normalized);
                            return normalized;
                        }
                        
                        // Handle standard formats
                        console.log(`📋 Standard format for study ${index}`);
                        const normalized = {
                            ...study,
                            evidenceLevel: study.evidenceLevel || this._mapStudyTypeToEvidenceLevel(study.studyType) || "Level 4",
                            findings: study.findings || (study.keyFindings ? study.keyFindings.join('; ') : ''),
                            authors: Array.isArray(study.authors) ? study.authors : [study.authors || 'Unknown authors'],
                            title: study.title || study.claim || "Study finding"
                        };
                        
                        console.log(`  Normalized study ${index}:`, normalized);
                        return normalized;
                    });
                    
                    console.log('✅ Final normalized studies:', result);
                    return result;
                };
            }
        });
        
        // Find Melatonin and open modal
        const cards = await page.$$('[class*="card"]');
        let melatoninCard = null;
        
        for (const card of cards) {
            const text = await card.textContent();
            if (text && text.includes('Melatonin')) {
                melatoninCard = card;
                break;
            }
        }
        
        if (melatoninCard) {
            console.log('🔍 Opening Melatonin modal...');
            const viewBtn = await melatoninCard.$('button:has-text("View Details")');
            if (viewBtn) {
                await viewBtn.click();
                await page.waitForTimeout(3000);
                
                // Click Benefits tab to trigger normalization
                const benefitsTab = await page.$('button:has-text("Benefits")');
                if (benefitsTab) {
                    console.log('🔍 Clicking Benefits tab...');
                    await benefitsTab.click();
                    await page.waitForTimeout(3000);
                    
                    // Check console logs
                    const logs = await page.evaluate(() => {
                        return window.debugLogs || [];
                    });
                    
                    console.log('📋 Browser console logs:', logs);
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugNormalizationDetailed();
