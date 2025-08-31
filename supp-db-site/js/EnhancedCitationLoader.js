/**
 * Enhanced Citation Loader
 * Pre-loads all enhanced citation files into window.enhancedCitations for the EnhancedCitationAttacher
 */

class EnhancedCitationLoader {
    constructor() {
        this.loadedCitations = {};
        this.loadingPromises = new Map();
        this.loadStartTime = performance.now();
    }

    /**
     * Load all enhanced citation files into window.enhancedCitations
     * @returns {Promise<Object>} Loading results
     */
    async loadAllEnhancedCitations() {
        console.log('🔄 Loading all enhanced citation files...');

        // Initialize global object
        if (!window.enhancedCitations) {
            window.enhancedCitations = {};
        }

        // Simplified approach: Load files sequentially and wait for each one
        const enhancedFiles = [
            // Core Anti-inflammatory & Adaptogens
            { id: 2, file: '2_turmeric_enhanced.js', globalVar: 'turmericEnhanced' },
            { id: 3, file: '3_ashwagandha_enhanced.js', globalVar: 'ashwagandhaEnhanced' },
            { id: 4, file: '4_omega_3_fatty_acids_enhanced.js', globalVar: 'omega3FattyAcidsEnhanced' },
            { id: 8, file: '8_melatonin_enhanced.js', globalVar: 'melatoninEnhanced' },
            { id: 10, file: '10_rhodiola_rosea_enhanced.js', globalVar: 'rhodiolaRoseaEnhanced' },
            // Nootropics & Cognitive Support
            { id: 11, file: '11_lions_mane_enhanced.js', globalVar: 'lionsManeEnhanced' },
            { id: 12, file: '12_phosphatidylserine_enhanced.js', globalVar: 'phosphatidylserineEnhanced' },
            { id: 14, file: '14_ginkgo_biloba_enhanced.js', globalVar: 'ginkgoBilobaEnhanced' },
            { id: 16, file: '16_alpha_gpc_enhanced.js', globalVar: 'alphaGpcEnhanced' },
            { id: 75, file: '75_citicoline_enhanced.js', globalVar: 'citicolineEnhanced' },
            // Plant Alkaloids & Metabolic Support
            { id: 17, file: '75_berberine_enhanced.js', globalVar: 'berberineEnhanced' },
            { id: 18, file: '18_coq10_enhanced.js', globalVar: 'coq10Enhanced' },
            { id: 19, file: '19_b_complex_vitamins_enhanced.js', globalVar: 'bComplexVitaminsEnhanced' },
            { id: 20, file: '20_quercetin_enhanced.js', globalVar: 'quercetinEnhanced' },
            { id: 24, file: '24_green_tea_extract_enhanced.js', globalVar: 'greenTeaExtractEnhanced' },
            { id: 27, file: '27_resveratrol_enhanced.js', globalVar: 'resveratrolEnhanced' },
            // Amino Acids & Neurotransmitter Support
            { id: 34, file: '34_5_htp_enhanced.js', globalVar: 'fiveHtpEnhanced' },
            { id: 40, file: '40_gaba_enhanced.js', globalVar: 'gabaEnhanced' },
            { id: 57, file: '57_pea_enhanced.js', globalVar: 'peaEnhanced' },
            // Essential Nutrients & Antioxidants
            { id: 38, file: '38_iron_enhanced.js', globalVar: 'ironEnhanced' },
            { id: 45, file: '45_lutein_enhanced.js', globalVar: 'luteinEnhanced' },
            { id: 46, file: '46_astaxanthin_enhanced.js', globalVar: 'astaxanthinEnhanced' },
            { id: 49, file: '49_echinacea_enhanced.js', globalVar: 'echinaceaEnhanced' },
            { id: 52, file: '52_cordyceps_enhanced.js', globalVar: 'cordycepsEnhanced' },
            { id: 54, file: '54_chlorella_enhanced.js', globalVar: 'chlorellaEnhanced' },
            { id: 58, file: '58_mct_oil_enhanced.js', globalVar: 'mctOilEnhanced' },
            { id: 60, file: '60_red_yeast_rice_enhanced.js', globalVar: 'redYeastRiceEnhanced' },
            { id: 65, file: '65_fenugreek_enhanced.js', globalVar: 'fenugreekEnhanced' },
            { id: 69, file: '69_mucuna_pruriens_enhanced.js', globalVar: 'mucunaPruriensEnhanced' },
            { id: 73, file: '73_stinging_nettle_enhanced.js', globalVar: 'stingingNettleEnhanced' },
            { id: 89, file: '89_pterostilbene_enhanced.js', globalVar: 'pterostilbeneEnhanced' },
            // Phase 2: Joint Support
            { id: 28, file: '28_glucosamine_enhanced.js', globalVar: 'glucosamineEnhanced' },
            { id: 29, file: '29_enhanced.js', globalVar: 'msmEnhanced' },
            { id: 32, file: '32_chondroitin_sulfate_enhanced.js', globalVar: 'chondroitinSulfateEnhanced' },
            // Phase 2: Essential Nutrients
            { id: 23, file: '23_folate_enhanced.js', globalVar: 'folateEnhanced' },
            { id: 42, file: '42_selenium_enhanced.js', globalVar: 'seleniumEnhanced' },
            { id: 61, file: '61_chromium_enhanced.js', globalVar: 'chromiumEnhanced' },
            // Phase 2: Herbal Supplements
            { id: 47, file: '47_ginger_enhanced.js', globalVar: 'gingerEnhanced' },
            { id: 48, file: '48_garlic_enhanced.js', globalVar: 'garlicEnhanced' },
            { id: 51, file: '51_reishi_mushroom_enhanced.js', globalVar: 'reishiMushroomEnhanced' },
            // Phase 1: Performance Enhancers & Essential Nutrients
            { id: 30, file: '30_vitamin_e_enhanced.js', globalVar: 'vitaminEEnhanced' },
            { id: 31, file: '31_whey_protein_enhanced.js', globalVar: 'wheyProteinEnhanced' },
            { id: 36, file: '36_vitamin_c_enhanced.js', globalVar: 'vitaminCEnhanced' },
            { id: 50, file: '50_caffeine_enhanced.js', globalVar: 'caffeineEnhanced' },
            // Additional New Format Files
            { id: 13, file: '13_acetyl_l_carnitine_enhanced.js', globalVar: 'acetylLCarnitineEnhanced' },
            { id: 21, file: '21_vitamin_b12_enhanced.js', globalVar: 'vitaminB12Enhanced' },
            { id: 22, file: '22_vitamin_b6_enhanced.js', globalVar: 'vitaminB6Enhanced' },
            // Phase 2A Quality Fixes
            { id: 25, file: '25_gaba_enhanced.js', globalVar: 'gabaEnhanced' },
            { id: 26, file: 'pqq_enhanced.js', globalVar: 'pqqEnhanced' },
            // Phase 2B Nootropics Expansion
            { id: 55, file: '55_huperzine_a_enhanced.js', globalVar: 'huperzineAEnhanced' },
            { id: 56, file: '56_vinpocetine_enhanced.js', globalVar: 'vinpocetineEnhanced' },
            // Phase 2C Essential Nutrients Completion
            { id: 62, file: '62_vanadium_enhanced.js', globalVar: 'vanadiumEnhanced' },
            { id: 87, file: '87_krill_oil_enhanced.js', globalVar: 'krillOilEnhanced' },
            // Phase 2D Blood Sugar Support Supplements
            { id: 63, file: '63_bitter_melon_enhanced.js', globalVar: 'bitterMelonEnhanced' },
            { id: 64, file: '64_gymnema_sylvestre_enhanced.js', globalVar: 'gymnemaSylvestreEnhanced' },
            { id: 66, file: '66_cinnamon_extract_enhanced.js', globalVar: 'cinnamonExtractEnhanced' },
            // Phase 2E Weight Management Supplements
            { id: 70, file: '70_forskolin_enhanced.js', globalVar: 'forskolinEnhanced' },
            // Phase 2F Liver Support Supplements
            { id: 72, file: '72_milk_thistle_enhanced.js', globalVar: 'milkThistleEnhanced' },
            // Phase 2G Immune Support Supplements
            { id: 74, file: '74_elderberry_enhanced.js', globalVar: 'elderberryEnhanced' },
            // Phase 2 Week 3 Priority Supplements
            { id: 68, file: '68_schisandra_berry_enhanced.js', globalVar: 'schisandraBerryEnhanced' },
            { id: 71, file: '71_boswellia_enhanced.js', globalVar: 'boswelliaEnhanced' },
            { id: 79, file: '79_passionflower_enhanced.js', globalVar: 'passionflowerEnhanced' },
            // Phase 2 Week 4 Supplements
            { id: 82, file: '82_kanna_enhanced.js', globalVar: 'kannaEnhanced' },
            { id: 83, file: '83_black_seed_oil_enhanced.js', globalVar: 'blackSeedOilEnhanced' },
            { id: 84, file: '84_moringa_enhanced.js', globalVar: 'moringaEnhanced' },
            { id: 85, file: '85_pine_bark_extract_enhanced.js', globalVar: 'pineBarkExtractEnhanced' },
            { id: 86, file: '86_grape_seed_extract_enhanced.js', globalVar: 'grapeSeedExtractEnhanced' },
            { id: 88, file: '88_zeaxanthin_enhanced.js', globalVar: 'zeaxanthinEnhanced' },
            { id: 89, file: '89_pterostilbene_enhanced.js', globalVar: 'pterostilbeneEnhanced' },
            // Phase 3 High Priority Supplements
            { id: 9, file: '9_coq10_enhanced.js', globalVar: 'coq10Enhanced' },
            { id: 10, file: '10_ashwagandha_enhanced.js', globalVar: 'ashwagandhaEnhanced' },
            { id: 11, file: '11_rhodiola_rosea_enhanced.js', globalVar: 'rhodiolaRoseaEnhanced' },
            { id: 12, file: '12_lions_mane_enhanced.js', globalVar: 'lionsManeEnhanced' },
            { id: 20, file: '20_resveratrol_enhanced.js', globalVar: 'resveratrolEnhanced' },
            // Phase 3 Tier 2 Systematic Enhancement
            { id: 44, file: '44_alpha_lipoic_acid_enhanced.js', globalVar: 'alphaLipoicAcidEnhanced' },
            { id: 15, file: '15_panax_ginseng_enhanced.js', globalVar: 'panaxGinsengEnhanced' },
            { id: 53, file: '53_spirulina_enhanced.js', globalVar: 'spirulinaEnhanced' },
            { id: 33, file: '33_l_tyrosine_enhanced.js', globalVar: 'lTyrosineEnhanced' },
            { id: 35, file: '35_tribulus_terrestris_enhanced.js', globalVar: 'tribulusTerrestrisEnhanced' },
            { id: 37, file: '37_zinc_enhanced.js', globalVar: 'zincEnhanced' },
            { id: 39, file: '39_taurine_enhanced.js', globalVar: 'taurineEnhanced' },
            { id: 41, file: '41_inositol_enhanced.js', globalVar: 'inositol41Enhanced' },
            { id: 43, file: '43_choline_enhanced.js', globalVar: 'cholineEnhanced' },
            { id: 5, file: '5_creatine_enhanced.js', globalVar: 'creatineEnhanced' },
            { id: 6, file: '6_enhanced.js', globalVar: 'magnesiumEnhanced' },
            { id: 7, file: '7_vitamin_d3_enhanced.js', globalVar: 'vitaminD3Enhanced' },
            // Existing Enhanced Supplements
            { id: 67, file: '67_holy_basil_enhanced.js', globalVar: 'holyBasilEnhanced' },
            { id: 76, file: '76_sulbutiamine_enhanced.js', globalVar: 'sulbutiamineEnhanced' },
            { id: 77, file: '77_dmae_enhanced.js', globalVar: 'dmaeEnhanced' },
            { id: 78, file: '78_centella_asiatica_enhanced.js', globalVar: 'centellaAsiaticaEnhanced' },
            { id: 80, file: '80_aniracetam_enhanced.js', globalVar: 'aniracetamEnhanced' },
            { id: 81, file: '81_piracetam_enhanced.js', globalVar: 'piracetamEnhanced' },
            { id: 1, file: 'bacopa_monnieri_enhanced.js', globalVar: 'bacopaMonnieri' }
        ];

        const results = {
            totalFiles: enhancedFiles.length,
            loaded: 0,
            failed: 0,
            errors: []
        };

        // Load each file sequentially
        for (const { id, file, globalVar } of enhancedFiles) {
            try {
                console.log(`🔄 Loading ${file}...`);

                // Load the script and wait for it
                await this._loadScriptAndWait(file);

                // Check if the global variable exists
                if (window[globalVar] && window[globalVar].citations) {
                    window.enhancedCitations[id] = window[globalVar];
                    this.loadedCitations[id] = window[globalVar];
                    results.loaded++;
                    console.log(`✅ Loaded enhanced citations for ID ${id}: ${window[globalVar].name}`);
                } else {
                    results.failed++;
                    results.errors.push(`Failed to load ${file} - global variable ${globalVar} not found or invalid`);
                    console.warn(`⚠️ Failed to load ${file}: global variable ${globalVar} not found`);
                }
            } catch (error) {
                results.failed++;
                results.errors.push(`Error loading ${file}: ${error.message}`);
                console.warn(`⚠️ Failed to load ${file}:`, error.message);
            }
        }

        const loadTime = performance.now() - this.loadStartTime;
        console.log(`📊 Enhanced citation loading complete in ${loadTime.toFixed(2)}ms:`);
        console.log(`   ✅ Loaded: ${results.loaded}/${results.totalFiles}`);
        console.log(`   ❌ Failed: ${results.failed}`);

        if (results.errors.length > 0) {
            console.log(`   🔍 Errors:`, results.errors);
        }

        // Debug: Show what's in window.enhancedCitations
        console.log(`🔍 window.enhancedCitations now contains IDs: ${Object.keys(window.enhancedCitations).join(', ')}`);

        return results;
    }

    /**
     * Load a script file and wait for it to complete
     * @private
     */
    async _loadScriptAndWait(filename) {
        const path = `data/enhanced_citations/${filename}`;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = path;
            script.type = 'text/javascript';

            script.onload = () => {
                document.head.removeChild(script);
                resolve();
            };

            script.onerror = () => {
                document.head.removeChild(script);
                reject(new Error(`Failed to load script: ${path}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Load a single enhanced citation file (legacy method)
     * @private
     */
    async _loadSingleFile(id, filename, expectedGlobalVar = null) {
        const path = `data/enhanced_citations/${filename}`;
        
        try {
            // Create a script element to load the file
            const script = document.createElement('script');
            script.src = path;
            
            // Return a promise that resolves when the script loads
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    // Try to get the data from various global locations
                    let citationData = null;

                    // If we have an expected global variable name, try that first
                    if (expectedGlobalVar && window[expectedGlobalVar] && window[expectedGlobalVar].citations) {
                        citationData = window[expectedGlobalVar];
                    } else {
                        // Check for data in window with various naming patterns
                        const possibleNames = [
                            expectedGlobalVar,
                            `${filename.replace('.js', '').replace(/_enhanced$/, '')}Enhanced`,
                            `${filename.replace('.js', '').replace(/_enhanced$/, '')}_enhanced`,
                            `supplement_${id}_enhanced`,
                            `enhanced_${id}`,
                            // For specific files
                            'holyBasilEnhanced',
                            'sulbutiamineEnhanced',
                            'dmaeEnhanced',
                            'centellaAsiaticaEnhanced',
                            'aniracetamEnhanced',
                            'piracetamEnhanced',
                            'bacopaMonnieri',
                            'bacopa_monnieri'
                        ].filter(Boolean); // Remove null/undefined values

                        // Try to find the data
                        for (const name of possibleNames) {
                            if (window[name] && window[name].citations) {
                                citationData = window[name];
                                break;
                            }
                        }
                    }
                    
                    // Clean up
                    document.head.removeChild(script);
                    
                    if (citationData && citationData.citations) {
                        resolve(citationData);
                    } else {
                        reject(new Error('Citation data not found in global scope'));
                    }
                };
                
                script.onerror = () => {
                    document.head.removeChild(script);
                    reject(new Error('Failed to load script'));
                };
                
                // Add to head to trigger loading
                document.head.appendChild(script);
            });
            
        } catch (error) {
            throw new Error(`Failed to load ${path}: ${error.message}`);
        }
    }

    /**
     * Get loading statistics
     */
    getStats() {
        return {
            totalLoaded: Object.keys(this.loadedCitations).length,
            loadedIds: Object.keys(this.loadedCitations).map(id => parseInt(id)),
            loadTime: performance.now() - this.loadStartTime
        };
    }
}

// Export for ES6 modules
export default EnhancedCitationLoader;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCitationLoader;
}

// Global assignment for browser environments
if (typeof window !== 'undefined') {
    window.EnhancedCitationLoader = EnhancedCitationLoader;
}
