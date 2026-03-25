#!/usr/bin/env node
/**
 * Build-time data obfuscation script for SupplementDB.
 *
 * Reads data/supplements.js, obfuscates field names, injects decoy entries,
 * shuffles the array, and writes:
 *   - data/supplements.min.js   (obfuscated data)
 *   - js/decoder.min.js         (runtime decoder that restores window.supplementDatabase)
 *
 * Security: decoder uses only JSON.parse for data handling. No dynamic code
 * execution of any kind.
 *
 * Usage:  node scripts/obfuscate-data.js
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1. Static field-name mapping  (source key -> obfuscated key)
//    We use a deterministic, non-obvious short-key scheme.
// ---------------------------------------------------------------------------

const FIELD_MAP = {
  // Top-level / metadata
  metadata: '_m0',
  version: '_m1',
  lastUpdated: '_m2',
  totalSupplements: '_m3',
  completedSupplements: '_m4',
  targetSupplements: '_m5',
  evidenceBasedOn: '_m6',
  expansionStatus: '_m7',

  // Supplement core fields
  supplements: '_s0',
  id: '_s1',
  name: '_s2',
  scientificName: '_s3',
  category: '_s4',
  commonNames: '_s5',
  evidenceTier: '_s6',
  evidenceTierRationale: '_s7',
  primaryBenefits: '_s8',
  isEnhanced: '_s9',
  dosageRange: '_sa',
  optimalDuration: '_sb',
  studyPopulations: '_sc',
  mechanismsOfAction: '_sd',
  healthDomains: '_se',

  // primaryBenefits sub-keys
  cognitive: '_b0',
  nonCognitive: '_b1',

  // safetyProfile
  safetyProfile: '_sf',
  rating: '_sf0',
  commonSideEffects: '_sf1',
  contraindications: '_sf2',
  drugInteractions: '_sf3',

  // effectSizes  (dynamic keys inside – we map the container)
  effectSizes: '_e0',

  // commercialAvailability
  commercialAvailability: '_c0',
  forms: '_c1',
  costRange: '_c2',
  qualityMarkers: '_c3',

  // keyCitations
  keyCitations: '_k0',
  title: '_k1',
  authors: '_k2',
  year: '_k3',
  doi: '_k4',
  pmid: '_k5',

  // enhancedCitations
  enhancedCitations: '_ec',
  evidenceProfile: '_ep',
  overallQuality: '_ep0',
  totalCitations: '_ep1',
  researchQualityScore: '_ep2',
  lastEvidenceUpdate: '_ep3',
  evidenceStrength: '_ep4',
  researchMaturity: '_ep5',
  publicationSpan: '_ep6',
  clinicalBenefits: '_ep7',
  safety: '_ep8',
  dosage: '_ep9',

  // enhancedCitations sub-structures
  mechanisms: '_ec0',
  mechanism: '_ec1',
  strength: '_ec2',
  mechanismType: '_ec3',
  tissueTarget: '_ec4',
  evidence: '_ec5',

  // citation evidence detail fields
  citationId: '_ci0',
  journal: '_ci1',
  studyType: '_ci2',
  evidenceLevel: '_ci3',
  findings: '_ci4',
  methodology: '_ci5',
  clinicalTranslation: '_ci6',
  studyDesign: '_ci7',
  sampleSize: '_ci8',
  duration: '_ci9',
  primaryOutcome: '_cia',
  results: '_cib',
  limitations: '_cic',
  clinicalRelevance: '_cid',
  effectSize: '_cie',
  pValue: '_cif',
  clinicalSignificance: '_cig',

  // benefits sub-structure
  benefits: '_bn0',
  healthDomain: '_bn1',
  specificClaim: '_bn2',
  evidenceQuality: '_bn3',
  replicationStatus: '_bn4',
  claim: '_bn5',
  riskLevel: '_bn6',

  // meta-analysis support
  metaAnalysisSupport: '_ma0',
  studiesIncluded: '_ma1',
  totalParticipants: '_ma2',
  pooledResults: '_ma3',
  conclusion: '_ma4',

  // safety sub-structure
  safetyAspect: '_sa0',
  safetyPopulation: '_sa1',
  adverseEvents: '_sa2',
  seriousAdverseEvents: '_sa3',
  event: '_sa4',
  frequency: '_sa5',
  severity: '_sa6',

  // categories / healthDomains top-level
  categories: '_cat',
  description: '_ds',

  // citation file references
  citationFile: '_cf0',
  hasEnhancedFile: '_cf1',
  enhancedFileId: '_cf2',
  fileId: '_cf3',
  fileRef: '_cf4',
  dataFile: '_cf5',
  file: '_cf6',
  processingMode: '_cf7',
  fabricatedCitationsNote: '_cf8',
  citations: '_cf9',

  // misc fields found in effectSizes / various
  source: '_x0',
  notes: '_x1',
  note: '_x2',
  type: '_x3',
  value: '_x4',
  quality: '_x5',
  population: '_x6',
  study: '_x7',
  tier: '_x8',
  n: '_x9',
  k: '_xa',
  function: '_xb',
  safetyRecord: '_xc',
  mechanisticBasis: '_xd',
  doseOptimization: '_xe',
};

// Build reverse map for the decoder
const REVERSE_MAP = {};
for (const [orig, obf] of Object.entries(FIELD_MAP)) {
  REVERSE_MAP[obf] = orig;
}

// ---------------------------------------------------------------------------
// 2. Read and parse supplements.js
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');
const SRC_PATH = path.join(ROOT, 'data', 'supplements.js');
const OUT_DATA = path.join(ROOT, 'data', 'supplements.min.js');
const OUT_DECODER = path.join(ROOT, 'js', 'decoder.min.js');

/**
 * Strip JS single-line comments while preserving // inside strings.
 * Walks char by char tracking whether we are inside a quoted string.
 */
function stripComments(src) {
  let out = '';
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      out += ch;
      if (ch === '\\') {
        // skip escaped char
        i++;
        if (i < src.length) out += src[i];
      } else if (ch === stringChar) {
        inString = false;
      }
    } else {
      if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
        out += ch;
      } else if (ch === '/' && i + 1 < src.length && src[i + 1] === '/') {
        // skip until end of line
        while (i < src.length && src[i] !== '\n') i++;
        out += '\n';  // preserve the newline
      } else {
        out += ch;
      }
    }
  }
  return out;
}

function readAndParse() {
  const raw = fs.readFileSync(SRC_PATH, 'utf-8');

  // Extract the object literal: strip the `const supplementDatabase = ` prefix
  // and the trailing `; // Export ...` footer.
  let jsonStr = raw;

  // Remove everything before the first `{`
  const firstBrace = jsonStr.indexOf('{');
  jsonStr = jsonStr.substring(firstBrace);

  // Remove everything after the matching closing `}`
  // Find the last `};` which closes the top-level object
  const lastClose = jsonStr.lastIndexOf('};');
  if (lastClose !== -1) {
    jsonStr = jsonStr.substring(0, lastClose + 1);
  }

  // Clean JS-isms that break JSON.parse:
  // 1. Strip single-line comments that are outside of quoted strings.
  //    Process line by line: track whether we are inside a string.
  jsonStr = stripComments(jsonStr);
  // 2. Strip trailing commas before ] or }
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
  // 3. Quote unquoted object keys:  { key: ... } -> { "key": ... }
  //    Matches word chars used as keys that aren't already quoted
  jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('JSON.parse failed. Attempting to locate error...');
    const match = err.message.match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1], 10);
      console.error('Context around error:');
      console.error(jsonStr.substring(Math.max(0, pos - 200), pos + 200));
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// 3. Recursive key renaming
// ---------------------------------------------------------------------------

function obfuscateKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(obfuscateKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(obj)) {
      const newKey = FIELD_MAP[key] || key;  // unmapped keys stay as-is
      out[newKey] = obfuscateKeys(val);
    }
    return out;
  }
  return obj;  // primitives pass through
}

// ---------------------------------------------------------------------------
// 4. Decoy supplement generation
// ---------------------------------------------------------------------------

const DECOY_SUPPLEMENTS = [
  {
    id: 9001,
    name: 'Synaptol-X',
    scientificName: 'Synaptolium xeraphine',
    category: 'Nootropic',
    commonNames: ['Brain Boost Pro', 'Neural Catalyst'],
    evidenceTier: 1,
    evidenceTierRationale: 'Multiple phase III trials with large effect sizes',
    primaryBenefits: {
      cognitive: ['Rapid memory consolidation', 'Synaptic plasticity enhancement'],
      nonCognitive: ['Mood elevation', 'Circadian rhythm optimization']
    },
    isEnhanced: true,
    dosageRange: '450mg twice daily',
    optimalDuration: '6-8 weeks',
    mechanismsOfAction: ['CREB phosphorylation amplification', 'AMPA receptor potentiation'],
    safetyProfile: { rating: 'Good', commonSideEffects: ['Mild insomnia'], contraindications: ['MAOIs'], drugInteractions: [] },
    effectSizes: { memory: 'Very large effect (d=1.42)', attention: 'Large effect (d=0.91)' },
    commercialAvailability: { forms: ['Capsules', 'Sublingual'], costRange: '$35-55/month', qualityMarkers: ['USP verified'] },
    keyCitations: [{ title: 'Synaptol-X and cognitive amplification: a phase III multicenter trial', authors: 'Mercer R, Tanaka Y, et al.', year: '2025', doi: '10.1093/brain/awz401' }]
  },
  {
    id: 9002,
    name: 'NeuroVex Compound',
    scientificName: 'Vexillum neuroactis',
    category: 'Nootropic',
    commonNames: ['CortexShield', 'NV-7'],
    evidenceTier: 2,
    evidenceTierRationale: 'Two independent RCTs with moderate samples',
    primaryBenefits: {
      cognitive: ['Executive function enhancement', 'Processing speed boost'],
      nonCognitive: ['Stress buffering']
    },
    isEnhanced: true,
    dosageRange: '200mg daily with food',
    optimalDuration: '10-14 weeks',
    mechanismsOfAction: ['Prefrontal dopamine modulation', 'Glutamate reuptake balancing'],
    safetyProfile: { rating: 'Moderate', commonSideEffects: ['Headache', 'Dry mouth'], contraindications: ['Pregnancy'], drugInteractions: ['SSRIs'] },
    effectSizes: { executiveFunction: 'Medium effect (d=0.67)', processingSpeed: 'Medium effect (d=0.58)' },
    commercialAvailability: { forms: ['Tablets'], costRange: '$28-42/month', qualityMarkers: ['GMP certified'] },
    keyCitations: [{ title: 'NeuroVex effects on prefrontal cortex function', authors: 'Albrecht K, Phan L.', year: '2024', doi: '10.1016/j.neuropharm.2024.109932' }]
  },
  {
    id: 9003,
    name: 'Adaptoflux-9',
    scientificName: 'Fluxidia adaptogenica',
    category: 'Adaptogen',
    commonNames: ['StressGuard Ultra', 'AF-9'],
    evidenceTier: 1,
    evidenceTierRationale: 'Umbrella meta-analysis of 14 RCTs',
    primaryBenefits: {
      cognitive: ['Cognitive resilience under stress'],
      nonCognitive: ['HPA axis normalization', 'Cortisol dampening', 'Immune modulation']
    },
    isEnhanced: true,
    dosageRange: '600mg standardized extract',
    optimalDuration: '8-12 weeks',
    mechanismsOfAction: ['HSP70 induction', 'Cortisol receptor desensitization'],
    safetyProfile: { rating: 'Good', commonSideEffects: ['GI discomfort'], contraindications: ['Autoimmune conditions'], drugInteractions: ['Immunosuppressants'] },
    effectSizes: { stressReduction: 'Large (d=0.89)', cortisol: 'Medium (d=0.55)' },
    commercialAvailability: { forms: ['Capsules', 'Powder'], costRange: '$22-38/month', qualityMarkers: ['Standardized to 8% withanolides'] },
    keyCitations: [{ title: 'Adaptoflux-9 cortisol modulation: umbrella review', authors: 'Johansson M, et al.', year: '2025', doi: '10.1007/s00213-025-06621-2' }]
  },
  {
    id: 9004,
    name: 'Mitozen-R',
    scientificName: 'Mitozinium regeneratum',
    category: 'Anti-Aging',
    commonNames: ['MitoRestore', 'CellAge Reverse'],
    evidenceTier: 2,
    evidenceTierRationale: 'Three RCTs with biomarker endpoints',
    primaryBenefits: {
      cognitive: ['Neuroprotection', 'Mitochondrial cognitive support'],
      nonCognitive: ['Cellular senescence clearance', 'NAD+ pathway activation']
    },
    isEnhanced: true,
    dosageRange: '750mg daily',
    optimalDuration: '12-24 weeks',
    mechanismsOfAction: ['Mitophagy induction via PINK1/Parkin', 'Sirtuin-3 activation'],
    safetyProfile: { rating: 'Good', commonSideEffects: ['Mild fatigue (transient)'], contraindications: [], drugInteractions: ['Metformin'] },
    effectSizes: { biologicalAge: 'Medium effect (d=0.61)', mitochondrialFunction: 'Large (d=0.84)' },
    commercialAvailability: { forms: ['Capsules'], costRange: '$45-70/month', qualityMarkers: ['Clinical grade'] },
    keyCitations: [{ title: 'Mitozen-R and mitophagy biomarkers in aging adults', authors: 'Chen W, Ortega D.', year: '2024', doi: '10.1038/s41591-024-03121-8' }]
  },
  {
    id: 9005,
    name: 'Enteroguard-B7',
    scientificName: 'Bifidobacterium guardensis',
    category: 'Metabolic Support',
    commonNames: ['GutShield Pro', 'EB-7'],
    evidenceTier: 3,
    evidenceTierRationale: 'Preliminary RCTs with promising microbiome data',
    primaryBenefits: {
      cognitive: ['Gut-brain axis optimization'],
      nonCognitive: ['Intestinal barrier repair', 'SCFA production boost', 'Metabolic endotoxemia reduction']
    },
    isEnhanced: false,
    dosageRange: '20 billion CFU daily',
    optimalDuration: '8-16 weeks',
    mechanismsOfAction: ['Tight junction protein upregulation', 'Butyrate synthesis pathway'],
    safetyProfile: { rating: 'Good', commonSideEffects: ['Bloating (first week)'], contraindications: ['Immunocompromised'], drugInteractions: [] },
    effectSizes: { gutPermeability: 'Medium (d=0.54)', inflammation: 'Small to medium (d=0.39)' },
    commercialAvailability: { forms: ['Capsules', 'Sachets'], costRange: '$30-50/month', qualityMarkers: ['Strain-specific guarantee'] },
    keyCitations: [{ title: 'Enteroguard-B7 and intestinal barrier function', authors: 'Reyes P, Nakamura H.', year: '2025', doi: '10.1053/j.gastro.2025.01.046' }]
  },
  {
    id: 9006,
    name: 'Vasculotide-K',
    scientificName: 'Vasculotidium kappense',
    category: 'Anti-inflammatory',
    commonNames: ['FlowMax CV', 'VK-Plus'],
    evidenceTier: 2,
    evidenceTierRationale: 'Two double-blind RCTs on endothelial function',
    primaryBenefits: {
      cognitive: ['Cerebrovascular perfusion'],
      nonCognitive: ['Endothelial NO synthesis', 'Arterial compliance improvement']
    },
    isEnhanced: true,
    dosageRange: '350mg twice daily',
    optimalDuration: '8-12 weeks',
    mechanismsOfAction: ['eNOS upregulation', 'Vascular smooth muscle relaxation'],
    safetyProfile: { rating: 'Moderate', commonSideEffects: ['Flushing', 'Mild hypotension'], contraindications: ['Hypotension'], drugInteractions: ['Antihypertensives', 'PDE5 inhibitors'] },
    effectSizes: { endothelialFunction: 'Medium (FMD +2.8%)', bloodPressure: 'Small (d=0.31)' },
    commercialAvailability: { forms: ['Tablets'], costRange: '$25-40/month', qualityMarkers: ['Bioavailability enhanced'] },
    keyCitations: [{ title: 'Vasculotide-K on flow-mediated dilation', authors: 'Petrov I, Delgado S.', year: '2024', doi: '10.1161/JAHA.124.035211' }]
  },
  {
    id: 9007,
    name: 'Somniplex-3',
    scientificName: 'Somniplexium trivalens',
    category: 'Sleep Support',
    commonNames: ['DeepRest Formula', 'SP-3'],
    evidenceTier: 2,
    evidenceTierRationale: 'Two RCTs with polysomnography endpoints',
    primaryBenefits: {
      cognitive: ['Sleep-dependent memory consolidation'],
      nonCognitive: ['Sleep onset latency reduction', 'Deep sleep duration increase']
    },
    isEnhanced: false,
    dosageRange: '500mg 30 minutes before bedtime',
    optimalDuration: '4-8 weeks',
    mechanismsOfAction: ['GABAergic positive allosteric modulation', 'Adenosine receptor agonism'],
    safetyProfile: { rating: 'Good', commonSideEffects: ['Morning grogginess'], contraindications: ['Sleep apnea'], drugInteractions: ['Benzodiazepines', 'Z-drugs'] },
    effectSizes: { sleepOnset: 'Large (d=0.92)', deepSleep: 'Medium (d=0.63)' },
    commercialAvailability: { forms: ['Capsules', 'Liquid'], costRange: '$18-32/month', qualityMarkers: ['Melatonin-free'] },
    keyCitations: [{ title: 'Somniplex-3 polysomnography outcomes in chronic insomnia', authors: 'Hartley G, Osman F.', year: '2025', doi: '10.5665/sleep.15422' }]
  },
  {
    id: 9008,
    name: 'Immunolyze-Delta',
    scientificName: 'Immunolyzium deltaforme',
    category: 'Essential Nutrients',
    commonNames: ['ImmuneEdge', 'ID-4'],
    evidenceTier: 3,
    evidenceTierRationale: 'Pilot RCTs with immune biomarker endpoints',
    primaryBenefits: {
      cognitive: ['Neuroinflammation reduction'],
      nonCognitive: ['NK cell activation', 'Cytokine balance', 'Mucosal immunity']
    },
    isEnhanced: false,
    dosageRange: '800mg daily in divided doses',
    optimalDuration: '6-12 weeks',
    mechanismsOfAction: ['TLR4 antagonism', 'IL-10 induction', 'Dendritic cell maturation'],
    safetyProfile: { rating: 'Good', commonSideEffects: ['Mild rash (rare)'], contraindications: ['Organ transplant recipients'], drugInteractions: ['TNF inhibitors'] },
    effectSizes: { nkCellActivity: 'Medium (d=0.52)', upperRespiratory: 'Small (d=0.28)' },
    commercialAvailability: { forms: ['Capsules', 'Powder'], costRange: '$32-48/month', qualityMarkers: ['Allergen-free'] },
    keyCitations: [{ title: 'Immunolyze-Delta pilot trial on innate immunity', authors: 'Kwon S, Bergman T.', year: '2024', doi: '10.1016/j.jaci.2024.07.019' }]
  }
];

// ---------------------------------------------------------------------------
// 5. Deterministic shuffle (seeded Fisher-Yates)
// ---------------------------------------------------------------------------

function seededRandom(seed) {
  // Simple mulberry32 PRNG
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deterministicShuffle(arr, seed) {
  const rng = seededRandom(seed);
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ---------------------------------------------------------------------------
// 6. Main
// ---------------------------------------------------------------------------

function main() {
  console.log('[obfuscate] Reading data/supplements.js ...');
  const data = readAndParse();

  const realCount = data.supplements ? data.supplements.length : 0;
  console.log('[obfuscate] Parsed ' + realCount + ' real supplements.');

  // Inject decoys into the supplements array
  if (data.supplements) {
    data.supplements = data.supplements.concat(DECOY_SUPPLEMENTS);
    console.log('[obfuscate] Injected ' + DECOY_SUPPLEMENTS.length + ' decoy entries (IDs 9001-9008).');

    // Deterministic shuffle with a fixed seed
    const SHUFFLE_SEED = 0x53555050;  // "SUPP"
    data.supplements = deterministicShuffle(data.supplements, SHUFFLE_SEED);
    console.log('[obfuscate] Shuffled ' + data.supplements.length + ' total entries.');
  }

  // Obfuscate all keys
  const obfuscated = obfuscateKeys(data);

  // Write minified obfuscated data
  const minifiedData = 'var _sd=' + JSON.stringify(obfuscated) + ';';
  fs.writeFileSync(OUT_DATA, minifiedData, 'utf-8');
  console.log('[obfuscate] Wrote ' + OUT_DATA + ' (' + (Buffer.byteLength(minifiedData) / 1024).toFixed(1) + ' KB)');

  // Generate decoder
  const decoderCode = generateDecoder();
  fs.writeFileSync(OUT_DECODER, decoderCode, 'utf-8');
  console.log('[obfuscate] Wrote ' + OUT_DECODER + ' (' + (Buffer.byteLength(decoderCode) / 1024).toFixed(1) + ' KB)');

  console.log('[obfuscate] Done.');
}

// ---------------------------------------------------------------------------
// 7. Decoder generation
// ---------------------------------------------------------------------------

function generateDecoder() {
  const reverseMapJson = JSON.stringify(REVERSE_MAP);

  // The decoder is a self-executing function that:
  //  - Embeds the reverse map
  //  - Recursively decodes keys
  //  - Filters out decoy entries (id >= 9000)
  //  - Sets window.supplementDatabase
  //
  // Only JSON.parse is used for data handling — no dynamic code execution.

  return '(function(){' +
    'var _r=JSON.parse(\'' + reverseMapJson.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\');' +
    'function _d(o){' +
      'if(Array.isArray(o))return o.map(_d);' +
      'if(o!==null&&typeof o==="object"){' +
        'var r={};' +
        'for(var k in o){' +
          'if(o.hasOwnProperty(k)){' +
            'r[_r[k]||k]=_d(o[k])' +
          '}' +
        '}' +
        'return r' +
      '}' +
      'return o' +
    '}' +
    'if(typeof _sd!=="undefined"){' +
      'var _db=_d(_sd);' +
      'if(_db.supplements&&Array.isArray(_db.supplements)){' +
        '_db.supplements=_db.supplements.filter(function(s){return!s.id||s.id<9000})' +
      '}' +
      'if(typeof window!=="undefined"){' +
        'window.supplementDatabase=_db;' +
        'window.supplementsData=_db' +
      '}' +
    '}' +
  '})();';
}

// Run
main();
