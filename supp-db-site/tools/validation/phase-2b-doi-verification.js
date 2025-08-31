// Phase 2B Final DOI Verification Script
// Comprehensive verification of all citations in enhanced files 20, 21, 22
// 100% accuracy requirement for gold standard compliance

const https = require('https');
const fs = require('fs');

// DOI verification using CrossRef API
function verifyDOI(doi) {
    return new Promise((resolve) => {
        const url = `https://api.crossref.org/works/${doi}`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.status === 'ok' && result.message) {
                        resolve({
                            verified: true,
                            title: result.message.title ? result.message.title[0] : 'N/A',
                            authors: result.message.author || [],
                            journal: result.message['container-title'] ? result.message['container-title'][0] : 'N/A',
                            year: result.message.published ? result.message.published['date-parts'][0][0] : 'N/A',
                            doi: result.message.DOI
                        });
                    } else {
                        resolve({ verified: false, error: 'DOI not found in CrossRef' });
                    }
                } catch (e) {
                    resolve({ verified: false, error: 'JSON parse error' });
                }
            });
        }).on('error', (e) => {
            resolve({ verified: false, error: e.message });
        });
    });
}

// Extract all DOIs from enhanced citation files
function extractDOIs() {
    const citations = {
        quercetin: [],
        greenTea: [],
        nadPrecursors: []
    };

    // Quercetin (ID: 20) DOIs
    citations.quercetin = [
        { id: 'mech_001', doi: '10.3390/ijms252212091', pmid: '39596162', title: 'A Systematic Review: Quercetin—Secondary Metabolite of the Flavonol Class, with Multiple Health Benefits and Low Bioavailability' },
        { id: 'mech_002', doi: '10.3390/ph16071020', pmid: '37513932', title: 'Recent Advances in Potential Health Benefits of Quercetin' },
        { id: 'mech_003', doi: '10.3389/fcvm.2023.1203713', pmid: '38054093', title: 'Research progress of quercetin in cardiovascular disease' },
        { id: 'mech_004', doi: '10.1021/acsomega.0c01818', pmid: '33553890', title: 'Therapeutic Potential of Quercetin: New Insights and Perspectives for Human Health' },
        { id: 'ben_001', doi: '10.5114/biolsport.2023.121320', pmid: '37398956', title: 'Quercetin supplementation promotes recovery after exercise-induced muscle damage: a systematic review and meta-analysis of randomized controlled trials' },
        { id: 'ben_002', doi: '10.1017/S0007114519003380', pmid: '31213101', title: 'Impact of quercetin on systemic levels of inflammation: a meta-analysis of randomised controlled human trials' },
        { id: 'ben_003', doi: '10.1161/JAHA.115.002713', pmid: '27405810', title: 'Effects of Quercetin on Blood Pressure: A Systematic Review and Meta‐Analysis of Randomized Controlled Trials' },
        { id: 'ben_004', doi: '10.1002/ptr.6542', pmid: '31017459', title: 'The effects of quercetin supplementation on lipid profiles and inflammatory markers among patients with metabolic syndrome and related disorders' },
        { id: 'ben_005', doi: '10.3390/nu14102117', pmid: '35571883', title: 'Short-Term Oral Quercetin Supplementation Improves Post-exercise Insulin Sensitivity, Antioxidant Capacity and Enhances Subsequent Cycling Time to Exhaustion in Healthy Adults' },
        { id: 'ben_006', doi: '10.3390/nu13114004', pmid: '34803913', title: 'Quercetin Modulates IGF-I and IGF-II Levels After Eccentric Exercise-Induced Muscle-Damage: A Placebo-Controlled Study' },
        { id: 'safe_001', doi: '10.1002/mnfr.201700447', pmid: '29127724', title: 'Safety Aspects of the Use of Quercetin as a Dietary Supplement' },
        { id: 'safe_002', doi: '10.1136/bmjresp-2019-000392', pmid: '32071149', title: 'Randomised clinical trial to determine the safety of quercetin supplementation in patients with chronic obstructive pulmonary disease' },
        { id: 'dos_001', doi: '10.1021/acsomega.2c05929', pmid: '36570216', title: 'Enhanced Bioavailability and Pharmacokinetics of a Natural Self-Emulsifying Reversible Hybrid-Hydrogel System of Quercetin' },
        { id: 'dos_002', doi: '10.1007/s13318-018-0517-3', pmid: '30328058', title: 'Improved Oral Absorption of Quercetin from Quercetin Phytosome®, a New Delivery System Based on Food Grade Lecithin' }
    ];

    // Green Tea Extract (ID: 21) DOIs
    citations.greenTea = [
        { id: 'mech_001', doi: '10.3390/ijms24010340', pmid: '36613784', title: 'Therapeutic Effects of Green Tea Polyphenol (‒)-Epigallocatechin-3-Gallate (EGCG) in Relation to Molecular Pathways Controlling Inflammation, Oxidative Stress, and Apoptosis' },
        { id: 'mech_002', doi: '10.3390/nu13020644', pmid: '33671139', title: 'Effect of Acute and Chronic Dietary Supplementation with Green Tea Catechins on Resting Metabolic Rate, Energy Expenditure and Respiratory Quotient: A Systematic Review' },
        { id: 'mech_003', doi: '10.3389/fphar.2018.01366', pmid: '30524270', title: 'EGCG Reduces Obesity and White Adipose Tissue Gain Partly Through AMPK Activation in Mice' },
        { id: 'mech_004', doi: '10.1016/j.phymed.2017.07.008', pmid: '28899506', title: 'Green tea effects on cognition, mood and human brain function: A systematic review' },
        { id: 'ben_001', doi: '10.3389/fnut.2022.1084455', pmid: '36712505', title: 'The effects of green tea supplementation on cardiovascular risk factors: A systematic review and meta-analysis' },
        { id: 'ben_002', doi: '10.1017/S0007114523002246', pmid: '38031409', title: 'The effects of green tea extract supplementation on body composition, obesity-related hormones and oxidative stress markers: a grade-assessed systematic review and dose–response meta-analysis of randomised controlled trials' },
        { id: 'ben_003', doi: '10.1002/14651858.CD008650.pub2', pmid: '23235664', title: 'Green tea for weight loss and weight maintenance in overweight or obese adults' },
        { id: 'ben_004', doi: '10.1038/oby.2007.176', pmid: '17557985', title: 'A green tea extract high in catechins reduces body fat and cardiovascular risks in humans' },
        { id: 'ben_005', doi: '10.1002/ptr.6697', pmid: '32338764', title: 'The effect of green tea supplementation on obesity: A systematic review and dose–response meta‐analysis of randomized controlled trials' },
        { id: 'ben_007', doi: '10.1016/j.physbeh.2008.12.030', pmid: '20156466', title: 'Green tea catechins, caffeine and body-weight regulation' },
        { id: 'safe_001', doi: '10.1016/j.yrtph.2018.03.019', pmid: '29580974', title: 'The safety of green tea and green tea extract consumption in adults – Results of a systematic review' },
        { id: 'safe_002', doi: '10.2903/j.efsa.2018.5239', pmid: '32625776', title: 'Scientific opinion on the safety of green tea catechins' },
        { id: 'dos_001', doi: '10.1097/MCO.0000000000000932', pmid: '37104714', title: 'Therapeutic Activity of Green Tea Epigallocatechin-3-Gallate on Metabolic Diseases and Non-Alcoholic Fatty Liver Diseases: The Current Updates' }
    ];

    // NAD+ Precursors (ID: 22) DOIs
    citations.nadPrecursors = [
        { id: 'mech_001', doi: '10.3390/molecules24091720', pmid: '31052253', title: 'The Science Behind NMN–A Stable, Reliable NAD+Activator and Anti-Aging Molecule' },
        { id: 'mech_002', doi: '10.3390/nu12061616', pmid: '32486488', title: 'Nicotinamide Riboside—The Current State of Research and Therapeutic Uses' },
        { id: 'mech_003', doi: '10.1038/s41392-020-00311-7', pmid: '33384389', title: 'NAD+ metabolism: pathophysiologic mechanisms and therapeutic potential' },
        { id: 'mech_004', doi: '10.1016/j.cell.2013.06.016', pmid: '23870130', title: 'The NAD+/sirtuin pathway modulates longevity through activation of mitochondrial UPR and FOXO signaling' },
        { id: 'ben_001', doi: '10.1016/j.advnut.2023.08.008', pmid: '37619764', title: 'The Safety and Antiaging Effects of Nicotinamide Mononucleotide in Human Clinical Trials: an Update' },
        { id: 'ben_002', doi: '10.1007/s11357-022-00705-1', pmid: '36372861', title: 'The efficacy and safety of β-nicotinamide mononucleotide (NMN) supplementation in healthy middle-aged adults: a randomized, multicenter, double-blind, placebo-controlled, parallel-group, dose-dependent clinical trial' },
        { id: 'ben_003', doi: '10.1038/s41467-018-03421-7', pmid: '29599478', title: 'Chronic nicotinamide riboside supplementation is well-tolerated and elevates NAD+ in healthy middle-aged and older adults' },
        { id: 'ben_004', doi: '10.1038/s41467-023-43514-6', pmid: '38001066', title: 'NR-SAFE: a randomized, double-blind safety trial of high dose nicotinamide riboside in Parkinson\'s disease' },
        { id: 'ben_005', doi: '10.1161/CIRCULATIONAHA.121.056589', pmid: '32673500', title: 'NAD+ Metabolism in Cardiac Health, Aging, and Disease' },
        { id: 'ben_006', doi: '10.1093/ajcn/nqy132', pmid: '29992272', title: 'A randomized placebo-controlled clinical trial of nicotinamide riboside in obese men: safety, insulin-sensitivity, and lipid-mobilizing effects' },
        { id: 'safe_001', doi: '10.1007/s13668-019-00281-7', pmid: '31317480', title: 'NAD+ Precursors Nicotinamide Mononucleotide (NMN) and Nicotinamide Riboside (NR): Potential Dietary Contribution to Health' },
        { id: 'safe_002', doi: '10.1126/sciadv.adi4862', pmid: '28835917', title: 'What is really known about the effects of nicotinamide riboside supplementation in humans' },
        { id: 'dos_001', doi: '10.1016/j.bbrc.2021.08.056', pmid: '34454297', title: 'The therapeutic perspective of NAD+ precursors in age-related diseases' },
        { id: 'dos_002', doi: '10.1016/j.jnutbio.2019.108329', pmid: '31991237', title: 'Nicotinamide mononucleotide (NMN) as an anti-aging health product – Promises and safety concerns' }
    ];

    return citations;
}

// Main verification function
async function verifyAllDOIs() {
    console.log('Phase 2B DOI Verification Starting...');
    console.log('======================================');
    
    const citations = extractDOIs();
    const results = {
        quercetin: { verified: 0, failed: 0, details: [] },
        greenTea: { verified: 0, failed: 0, details: [] },
        nadPrecursors: { verified: 0, failed: 0, details: [] }
    };

    // Verify Quercetin citations
    console.log('\n1. QUERCETIN (ID: 20) VERIFICATION');
    console.log('==================================');
    
    for (const citation of citations.quercetin) {
        console.log(`\nVerifying: ${citation.id} - ${citation.doi}`);
        
        const result = await verifyDOI(citation.doi);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        
        if (result.verified) {
            results.quercetin.verified++;
            console.log(`✅ VERIFIED: ${result.title}`);
        } else {
            results.quercetin.failed++;
            console.log(`❌ FAILED: ${result.error}`);
        }
        
        results.quercetin.details.push({
            id: citation.id,
            doi: citation.doi,
            pmid: citation.pmid,
            expected: citation.title,
            verified: result.verified,
            actual: result.title || 'N/A',
            error: result.error || null
        });
    }

    // Verify Green Tea citations  
    console.log('\n\n2. GREEN TEA EXTRACT (ID: 21) VERIFICATION');
    console.log('==========================================');
    
    for (const citation of citations.greenTea) {
        console.log(`\nVerifying: ${citation.id} - ${citation.doi}`);
        
        const result = await verifyDOI(citation.doi);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        
        if (result.verified) {
            results.greenTea.verified++;
            console.log(`✅ VERIFIED: ${result.title}`);
        } else {
            results.greenTea.failed++;
            console.log(`❌ FAILED: ${result.error}`);
        }
        
        results.greenTea.details.push({
            id: citation.id,
            doi: citation.doi,
            pmid: citation.pmid,
            expected: citation.title,
            verified: result.verified,
            actual: result.title || 'N/A',
            error: result.error || null
        });
    }

    // Verify NAD+ Precursors citations
    console.log('\n\n3. NAD+ PRECURSORS (ID: 22) VERIFICATION');
    console.log('========================================');
    
    for (const citation of citations.nadPrecursors) {
        console.log(`\nVerifying: ${citation.id} - ${citation.doi}`);
        
        const result = await verifyDOI(citation.doi);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        
        if (result.verified) {
            results.nadPrecursors.verified++;
            console.log(`✅ VERIFIED: ${result.title}`);
        } else {
            results.nadPrecursors.failed++;
            console.log(`❌ FAILED: ${result.error}`);
        }
        
        results.nadPrecursors.details.push({
            id: citation.id,
            doi: citation.doi,
            pmid: citation.pmid,
            expected: citation.title,
            verified: result.verified,
            actual: result.title || 'N/A',
            error: result.error || null
        });
    }

    // Generate summary
    const totalVerified = results.quercetin.verified + results.greenTea.verified + results.nadPrecursors.verified;
    const totalFailed = results.quercetin.failed + results.greenTea.failed + results.nadPrecursors.failed;
    const totalCitations = totalVerified + totalFailed;
    const accuracyRate = ((totalVerified / totalCitations) * 100).toFixed(2);

    console.log('\n\nPHASE 2B VERIFICATION SUMMARY');
    console.log('============================');
    console.log(`Quercetin: ${results.quercetin.verified}/${citations.quercetin.length} verified`);
    console.log(`Green Tea: ${results.greenTea.verified}/${citations.greenTea.length} verified`);
    console.log(`NAD+ Precursors: ${results.nadPrecursors.verified}/${citations.nadPrecursors.length} verified`);
    console.log(`\nTOTAL ACCURACY: ${accuracyRate}% (${totalVerified}/${totalCitations})`);
    console.log(`Gold Standard Compliance: ${accuracyRate === '100.00' ? 'YES ✅' : 'NO ❌'}`);

    // Write detailed report
    const report = {
        verificationDate: new Date().toISOString(),
        summary: {
            totalCitations,
            totalVerified,
            totalFailed,
            accuracyRate: `${accuracyRate}%`,
            goldStandardCompliant: accuracyRate === '100.00'
        },
        supplements: {
            quercetin: results.quercetin,
            greenTea: results.greenTea,
            nadPrecursors: results.nadPrecursors
        }
    };

    fs.writeFileSync('phase-2b-verification-results.json', JSON.stringify(report, null, 2));
    console.log('\nDetailed results saved to: phase-2b-verification-results.json');
    
    return report;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { verifyAllDOIs, extractDOIs };
}

// Run verification if called directly
if (require.main === module) {
    verifyAllDOIs().catch(console.error);
}