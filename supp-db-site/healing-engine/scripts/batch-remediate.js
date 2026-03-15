'use strict';

const { remediateSupplement } = require('./remediate-supplement');

const files = [
  "2_curcumin_enhanced.js","3_ashwagandha_enhanced.js","4_omega_3_fish_oil_enhanced.js",
  "6_magnesium_enhanced.js","9_l_theanine_enhanced.js","10_rhodiola_rosea_enhanced.js",
  "11_lions_mane_enhanced.js","18_coq10_enhanced.js","24_l_theanine_enhanced.js",
  "27_resveratrol_enhanced.js","58_mct_oil_enhanced.js","59_hawthorn_berry_enhanced.js",
  "60_red_yeast_rice_enhanced.js","61_chromium_enhanced.js","79_passionflower_enhanced.js",
  "12_phosphatidylserine_enhanced.js","14_enhanced.js","19_enhanced.js",
  "26_pqq_enhanced.js","30_vitamin_e_enhanced.js","37_zinc_enhanced.js",
  "41_inositol_enhanced.js","44_alpha_lipoic_acid_enhanced.js","62_vanadium_enhanced.js",
  "66_cinnamon_extract_enhanced.js","76_sulbutiamine_enhanced.js","88_zeaxanthin_enhanced.js",
  "89_pterostilbene_enhanced.js","28_glucosamine_enhanced.js","32_chondroitin_sulfate_enhanced.js",
  "73_stinging_nettle_enhanced.js","51_reishi_mushroom_enhanced.js","43_choline_bitartrate_enhanced.js",
  "45_enhanced.js","50_caffeine_enhanced.js","65_fenugreek_enhanced.js",
  "69_mucuna_pruriens_enhanced.js","53_spirulina_enhanced.js","55_huperzine_a_enhanced.js",
  "56_vinpocetine_enhanced.js","40_gaba_enhanced.js","77_dmae_enhanced.js",
  "78_centella_asiatica_enhanced.js","13_acetyl_l_carnitine_enhanced.js","38_iron_enhanced.js",
  "15_panax_ginseng_enhanced.js","31_whey_protein_enhanced.js","42_selenium_enhanced.js",
  "80_aniracetam_enhanced.js","81_piracetam_enhanced.js","87_krill_oil_enhanced.js",
  "47_ginger_enhanced.js","35_tribulus_terrestris_enhanced.js"
];

async function main() {
  const results = [];
  console.log(`Batch remediation: ${files.length} files`);
  console.log('='.repeat(60));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`\n[${i+1}/${files.length}] Processing ${file}...`);
    try {
      const result = await remediateSupplement(file, { skipRegenerate: true });
      const before = result?.quality?.reliabilityScore || 0;
      const replacements = result?.plan?.summary?.replacing || 0;
      results.push({ file, before, replacements, status: 'ok' });
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      results.push({ file, status: 'error', error: e.message });
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('BATCH REMEDIATION SUMMARY');
  console.log('='.repeat(60));
  const ok = results.filter(r => r.status === 'ok');
  const fixed = ok.filter(r => r.replacements > 0);
  console.log(`Processed: ${ok.length}/${files.length}`);
  console.log(`Remediated: ${fixed.length} (${fixed.reduce((s,r) => s + r.replacements, 0)} total replacements)`);
  console.log(`Errors: ${results.filter(r => r.status === 'error').length}`);
}

main().catch(console.error);
