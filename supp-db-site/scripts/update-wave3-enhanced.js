const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data', 'enhanced_citations');

// =============================================
// 1. Update MCT Oil Enhanced File (ID 58)
// =============================================
function updateMCTOil() {
    const filePath = path.join(dataDir, '58_mct_oil_enhanced.js');
    let content = fs.readFileSync(filePath, 'utf8');

    // Update metadata
    content = content.replace(/totalCitations:\s*17/, 'totalCitations:  20');
    content = content.replace(/lastUpdated:\s*"2026-03-07"/, 'lastUpdated:  "2026-03-23"');
    content = content.replace(/lastEvidenceUpdate:\s*"2026-03-07"/, 'lastEvidenceUpdate:  "2026-03-23"');
    content = content.replace(/publicationSpan:\s*"2002-2024"/, 'publicationSpan:  "2002-2026"');

    // Add 2 new benefit papers after the last benefit block
    // Find the closing of benefits array - look for the pattern ]\n        ],\n        safety
    const benefitsClosePattern = /(\s*}\s*\n\s*\]\s*\n\s*\],\s*\n\s*safety:)/;
    // Actually let's find the end of the last benefit evidence block more carefully
    // The last benefit item ends with }  then ] then } before safety section

    // Find "safety:  [" and work backwards
    const safetyIdx = content.indexOf('safety:  [');
    if (safetyIdx === -1) {
        console.error('Could not find safety section in MCT Oil');
        return;
    }

    // Find the "]" that closes the benefits array just before safety
    let i = safetyIdx;
    while (i > 0 && content[i] !== ']') i--;
    const benefitsArrayClose = i; // position of the ] closing benefits array

    // Find the } before that ] (closing the last benefit object)
    let j = benefitsArrayClose;
    while (j > 0 && content[j] !== '}') j--;
    const lastBenefitClose = j; // position of } closing last benefit

    const newBenefits = `,
            {
                healthDomain:  "Meta-analysis of MCT-enriched diets shows significant body weight reduction (-1.53%) and improved metabolic markers in overweight/obese individuals",
                strength:  "Strong",
                evidence:  [
                    {
                        citationId:  "he_2024_benefits",
                        title:  "The impact of medium-chain triglycerides on weight loss and metabolic health in individuals with overweight or obesity: A systematic review and meta-analysis",
                        authors:  ["He H", "Liu K", "Liu M", "Yang AJ", "Cheng KW", "Lu LW", "Liu B", "Chen JH"],
                        year:  2024,
                        journal:  "Clinical Nutrition",
                        doi:  "10.1016/j.clnu.2024.06.016",
                        pmid:  "38936302",
                        studyType:  "Systematic Review and Meta-analysis",
                        evidenceLevel:  "Level 1",
                        findings:  "He et al. conducted the most comprehensive meta-analysis of MCT for weight management in Clinical Nutrition. MCT-enriched diets significantly reduced body weight (WMD: -1.53%) compared to LCT-enriched diets. Pure MCTs were more effective than blends. MCT diets also significantly reduced blood triglyceride levels and HOMA-IR scores.",
                        methodology:  "Systematic Review and Meta-analysis",
                        sampleSize:  "Multiple RCTs in overweight/obese populations"
                    }
                ]
            },
            {
                healthDomain:  "Single 12g MCT dose improves inhibitory control acutely; 4-week daily regimen enhances working memory in healthy young adults",
                strength:  "Moderate",
                evidence:  [
                    {
                        citationId:  "yuuki_2026_benefits",
                        title:  "Both a single dose and a 4-week daily regimen of medium-chain triglycerides boost certain aspects of cognitive function in young adults: A randomized controlled trial",
                        authors:  ["Yuuki IW", "Dora K", "Matsumura T", "Fukuzawa K", "Murakami Y", "Hashimoto K", "Tsukamoto H", "Hashimoto T"],
                        year:  2026,
                        journal:  "Physiology & Behavior",
                        doi:  "10.1016/j.physbeh.2025.115212",
                        pmid:  "41443401",
                        studyType:  "Randomized Controlled Trial",
                        evidenceLevel:  "Level 2",
                        findings:  "Yuuki et al. demonstrated that a single 12g MCT dose improved inhibitory control (p<0.05) versus olive oil in young adults. A 4-week daily MCT regimen enhanced working memory (p=0.04). Individual acute responders tended to remain responders to chronic supplementation.",
                        methodology:  "Randomized Controlled Trial",
                        sampleSize:  "36 young adults (mean age 21)",
                        duration:  "4 weeks"
                    }
                ]
            }`;

    content = content.substring(0, lastBenefitClose + 1) + newBenefits + content.substring(lastBenefitClose + 1);

    // Now add Cochrane epilepsy paper to safety section
    // Re-find safety section since content shifted
    const safetyIdx2 = content.indexOf('dosage:  [');
    if (safetyIdx2 === -1) {
        console.error('Could not find dosage section in MCT Oil');
        return;
    }

    // Find the ] closing safety array before dosage
    let k = safetyIdx2;
    while (k > 0 && content[k] !== ']') k--;
    const safetyArrayClose = k;

    let m = safetyArrayClose;
    while (m > 0 && content[m] !== '}') m--;
    const lastSafetyClose = m;

    const newSafety = `,
            {
                safetyAspect:  "Cochrane review confirms MCT-containing ketogenic diets significantly reduce seizure frequency in drug-resistant epilepsy with acceptable tolerability",
                strength:  "Good Safety Profile",
                evidence:  [
                    {
                        citationId:  "martin_mcgill_2020_safety",
                        title:  "Ketogenic diets for drug-resistant epilepsy",
                        authors:  ["Martin-McGill KJ", "Bresnahan R", "Levy RG", "Cooper PN"],
                        year:  2020,
                        journal:  "Cochrane Database of Systematic Reviews",
                        doi:  "10.1002/14651858.CD001903.pub5",
                        pmid:  "32588435",
                        studyType:  "Cochrane Systematic Review and Meta-analysis",
                        evidenceLevel:  "Level 1",
                        findings:  "Martin-McGill et al. Cochrane review of 13 studies (932 participants) found ketogenic diets including MCT-KD showed significantly higher seizure freedom (RR 3.16) and >=50% seizure reduction (RR 5.80) versus usual care. Evidence rated low to very low certainty.",
                        methodology:  "Cochrane systematic review and meta-analysis",
                        sampleSize:  "932 participants (711 children, 221 adults)"
                    }
                ]
            }`;

    content = content.substring(0, lastSafetyClose + 1) + newSafety + content.substring(lastSafetyClose + 1);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[MCT Oil] Added 2 new benefit papers + 1 new safety paper (20 total evidence items)');
}

// =============================================
// 2. Hawthorn Berry (ID 59) - already well-populated
//    The 4 new keyCitation papers are already in the enhanced file
//    (Holubarsch 2008 SPICE, Pittler 2003, Daniele 2006, Zick 2009)
//    Just update metadata
// =============================================
function updateHawthornBerry() {
    const filePath = path.join(dataDir, '59_hawthorn_berry_enhanced.js');
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/lastUpdated:\s*"2026-03-07"/, 'lastUpdated:  "2026-03-23"');
    content = content.replace(/lastEvidenceUpdate:\s*"2026-03-07"/, 'lastEvidenceUpdate:  "2026-03-23"');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[Hawthorn Berry] Updated metadata (21 evidence items, all keyCitation papers already present)');
}

// Run all updates
updateMCTOil();
updateHawthornBerry();
console.log('\nWave 3 enhanced file updates complete.');
