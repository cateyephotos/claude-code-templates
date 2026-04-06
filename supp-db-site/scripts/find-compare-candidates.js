#!/usr/bin/env node
/**
 * find-compare-candidates.js — Algorithmic supplement comparison candidate scoring
 *
 * Scores all possible supplement pairs (114 choose 2 = 6,441) on five dimensions
 * to find the best head-to-head comparison candidates. Filters out existing
 * comparisons and outputs a ranked list with rationale.
 *
 * Usage:
 *   node scripts/find-compare-candidates.js [options]
 *
 * Options:
 *   --top N          Show top N candidates (default 30)
 *   --min-score N    Minimum score threshold (default 0)
 *   --category NAME  Filter to pairs including at least one supplement in this category
 *   --stubs          Print COMPARISONS config stubs for generate-compare-pages.js
 *   --json           JSON-only output (suppress console table)
 */

const fs = require("fs");
const path = require("path");
const { loadSupplementData, normalizeCategory, slugify } = require("./parse-data");

// ── CLI Arguments ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name, fallback) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return args[idx + 1] || fallback;
}
const TOP_N = parseInt(getArg("top", "30"), 10);
const MIN_SCORE = parseFloat(getArg("min-score", "0"));
const CATEGORY_FILTER = getArg("category", null);
const STUBS = args.includes("--stubs");
const JSON_ONLY = args.includes("--json");

// ── Existing Comparisons (skip these) ─────────────────────────────────
const EXISTING_SLUGS = new Set([
  "ashwagandha-vs-rhodiola",
  "magnesium-vs-melatonin",
  "omega-3-vs-coq10",
  "bacopa-vs-ginkgo",
  "lions-mane-vs-bacopa",
  "creatine-vs-beta-alanine",
  "vitamin-d-vs-magnesium",
  "turmeric-vs-boswellia",
  "l-theanine-vs-5-htp",
  "coq10-vs-pqq",
  "inulin-vs-berberine",
  "inulin-vs-akkermansia",
  "glucosamine-vs-chondroitin",
  "lutein-vs-zeaxanthin",
  "quercetin-vs-grape-seed-extract",
  "elderberry-vs-black-seed-oil",
]);

// Also track by supplement name pairs for robust matching
const EXISTING_PAIRS = new Set([
  "Ashwagandha|Rhodiola rosea",
  "Magnesium|Melatonin",
  "Omega-3 Fatty Acids|CoQ10",
  "Bacopa monnieri|Ginkgo Biloba",
  "Lion's Mane Mushroom|Bacopa monnieri",
  "Creatine|Beta-Alanine",
  "Vitamin D3|Magnesium",
  "Turmeric/Curcumin|Boswellia",
  "L-Theanine|5-HTP",
  "CoQ10|PQQ",
  "Inulin|Berberine",
  "Inulin|Akkermansia muciniphila",
  "Glucosamine|Chondroitin Sulfate",
  "Lutein|Zeaxanthin",
  "Quercetin|Grape Seed Extract",
  "Elderberry|Black Seed Oil",
]);

function isExistingPair(nameA, nameB) {
  const key1 = `${nameA}|${nameB}`;
  const key2 = `${nameB}|${nameA}`;
  if (EXISTING_PAIRS.has(key1) || EXISTING_PAIRS.has(key2)) return true;
  const slugAB = slugify(nameA) + "-vs-" + slugify(nameB);
  const slugBA = slugify(nameB) + "-vs-" + slugify(nameA);
  return EXISTING_SLUGS.has(slugAB) || EXISTING_SLUGS.has(slugBA);
}

// ── Score Weights ─────────────────────────────────────────────────────
const WEIGHTS = {
  benefit: 30,
  mechanism: 25,
  category: 15,
  evidence: 20,
  safety: 10,
};

// ── Stopwords for tokenization ────────────────────────────────────────
const STOPWORDS = new Set([
  "and", "the", "in", "of", "via", "for", "with", "by", "from", "to",
  "a", "an", "may", "can", "also", "both", "its", "through", "into",
  "that", "this", "are", "is", "has", "have", "been", "being", "be",
  "not", "but", "or", "which", "their", "than", "other", "such",
  "more", "most", "less", "very", "well", "high", "low",
  "effects", "effect", "related", "based", "including", "particularly",
]);

// ── Category Proximity ───────────────────────────────────────────────
const CATEGORY_PROXIMITY = {
  "Nootropics": ["Amino Acids", "Adaptogens"],
  "Adaptogens": ["Herbal Extracts", "Nootropics"],
  "Performance Enhancers": ["Amino Acids"],
  "Essential Nutrients": ["Antioxidants"],
  "Anti-inflammatory": ["Herbal Extracts", "Joint Support"],
  "Joint Support": ["Anti-inflammatory", "Herbal Extracts"],
  "Polyphenols": ["Antioxidants", "Herbal Extracts"],
  "Antioxidants": ["Polyphenols", "Essential Nutrients"],
  "Metabolic Support": ["Herbal Extracts"],
  "Sleep Support": ["Amino Acids", "Essential Nutrients"],
  "Amino Acids": ["Nootropics", "Performance Enhancers", "Sleep Support"],
  "Herbal Extracts": ["Adaptogens", "Anti-inflammatory", "Polyphenols"],
};

// ── Pathway Families (for mechanism scoring) ─────────────────────────
const PATHWAY_FAMILIES = [
  { name: "AMPK", pattern: /ampk/i },
  { name: "NF-kB", pattern: /nf-?[kκ]b/i },
  { name: "Antioxidant/ROS", pattern: /antioxidant|reactive\s*oxygen|free\s*radical|oxidative\s*stress|ros\b/i },
  { name: "Cholinergic", pattern: /acetylcholine|cholinesterase|choline|cholinergic/i },
  { name: "GABAergic", pattern: /gaba/i },
  { name: "Dopaminergic", pattern: /dopamin/i },
  { name: "Serotonergic", pattern: /serotonin|5-ht\b|tryptophan/i },
  { name: "Mitochondrial", pattern: /mitochondri|atp\b|electron\s*transport/i },
  { name: "Anti-inflammatory", pattern: /anti.inflammat|cox-?2|prostaglandin|inflammat|tnf|interleukin|il-6/i },
  { name: "BDNF/Neuroplasticity", pattern: /bdnf|neuroplast|nerve\s*growth|ngf\b|neurotrophic/i },
  { name: "HPA Axis", pattern: /hpa|cortisol|adrenal/i },
  { name: "Nrf2", pattern: /nrf2|nrf-2/i },
  { name: "mTOR", pattern: /mtor/i },
  { name: "Nitric Oxide", pattern: /nitric\s*oxide|enos|no\s*synthase/i },
  { name: "Autophagy", pattern: /autophag|sirtu|sirt1/i },
  { name: "Gut Microbiome", pattern: /microbiome|prebiotic|probiotic|gut\s*barrier|scfa|short.chain/i },
  { name: "Insulin/Glucose", pattern: /insulin|glucose|glycemic|blood\s*sugar/i },
];

// ── Domain Inference Map ──────────────────────────────────────────────
const DOMAIN_KEYWORDS = [
  { domain: "Cognitive Enhancement", keywords: ["memory", "cognitive", "focus", "attention", "learning", "nootropic", "brain", "mental", "concentration", "neuroplasticity"] },
  { domain: "Stress & Adaptogenic Support", keywords: ["stress", "anxiety", "cortisol", "adaptogen", "hpa", "resilience", "calm", "relaxation"] },
  { domain: "Sleep Support", keywords: ["sleep", "insomnia", "circadian", "melatonin", "sedative", "relaxation"] },
  { domain: "Cardiovascular Health", keywords: ["heart", "cardiovascular", "cholesterol", "triglyceride", "blood pressure", "vascular", "endothelial"] },
  { domain: "Anti-inflammatory & Pain", keywords: ["inflammatory", "inflammation", "joint", "pain", "arthritis", "cox", "prostaglandin"] },
  { domain: "Antioxidant & Longevity", keywords: ["antioxidant", "aging", "longevity", "mitochondri", "senescent", "telomere", "oxidative"] },
  { domain: "Energy & Performance", keywords: ["energy", "fatigue", "endurance", "performance", "exercise", "atp", "muscle", "strength"] },
  { domain: "Gut Health", keywords: ["gut", "microbiome", "digestive", "prebiotic", "probiotic", "intestinal", "scfa"] },
  { domain: "Immune Support", keywords: ["immune", "immunity", "infection", "antimicrobial", "viral", "pathogen"] },
  { domain: "Mood & Mental Health", keywords: ["mood", "depression", "serotonin", "dopamine", "emotional", "wellbeing"] },
  { domain: "Metabolic Health", keywords: ["blood sugar", "insulin", "metabolic", "glucose", "weight", "obesity", "lipid"] },
  { domain: "Neuroprotection", keywords: ["neuroprotect", "neurodegenerat", "alzheimer", "parkinson", "dementia", "cognitive decline"] },
];

// ── Evidence Quality Matrix ──────────────────────────────────────────
const TIER_SCORES = {
  "1-1": 1.00,
  "1-2": 0.85,
  "2-2": 0.70,
  "1-3": 0.50,
  "2-3": 0.35,
  "3-3": 0.15,
};

// ── Tokenization ─────────────────────────────────────────────────────

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function extractBenefitTokens(supp) {
  const cog = supp.primaryBenefits?.cognitive || [];
  const nonCog = supp.primaryBenefits?.nonCognitive || [];
  const all = [...cog, ...nonCog];
  const tokens = new Set();
  all.forEach((b) => tokenize(b).forEach((t) => tokens.add(t)));
  return tokens;
}

function extractMechanismFamilies(mechanisms) {
  if (!mechanisms || !mechanisms.length) return new Set();
  const families = new Set();
  const joined = mechanisms.join(" ");
  PATHWAY_FAMILIES.forEach((pf) => {
    if (pf.pattern.test(joined)) families.add(pf.name);
  });
  return families;
}

function extractMechanismTokens(mechanisms) {
  if (!mechanisms || !mechanisms.length) return new Set();
  const tokens = new Set();
  mechanisms.forEach((m) => tokenize(m).forEach((t) => tokens.add(t)));
  return tokens;
}

// ── IDF Map ──────────────────────────────────────────────────────────

function buildIDF(supplements) {
  const df = {};
  const n = supplements.length;
  supplements.forEach((s) => {
    const tokens = extractBenefitTokens(s);
    tokens.forEach((t) => {
      df[t] = (df[t] || 0) + 1;
    });
  });
  const idf = {};
  Object.keys(df).forEach((t) => {
    idf[t] = Math.log(n / df[t]);
  });
  return idf;
}

// ── Scoring Functions ────────────────────────────────────────────────

function scoreBenefitOverlap(suppA, suppB, idf) {
  const tokensA = extractBenefitTokens(suppA);
  const tokensB = extractBenefitTokens(suppB);

  if (tokensA.size === 0 || tokensB.size === 0) {
    return { score: 0, sharedTerms: [] };
  }

  const intersection = new Set([...tokensA].filter((t) => tokensB.has(t)));
  const union = new Set([...tokensA, ...tokensB]);

  if (union.size === 0) return { score: 0, sharedTerms: [] };

  let sharedWeight = 0;
  let totalWeight = 0;
  intersection.forEach((t) => (sharedWeight += idf[t] || 1));
  union.forEach((t) => (totalWeight += idf[t] || 1));

  let score = totalWeight > 0 ? sharedWeight / totalWeight : 0;

  // Bonus if both have cognitive benefits
  const bothCognitive =
    (suppA.primaryBenefits?.cognitive?.length || 0) > 0 &&
    (suppB.primaryBenefits?.cognitive?.length || 0) > 0;
  if (bothCognitive && intersection.size > 0) {
    score = Math.min(1.0, score + 0.05);
  }

  return { score, sharedTerms: [...intersection].slice(0, 8) };
}

function scoreMechanismOverlap(suppA, suppB) {
  const familiesA = extractMechanismFamilies(suppA.mechanismsOfAction);
  const familiesB = extractMechanismFamilies(suppB.mechanismsOfAction);

  const sharedFamilies = new Set(
    [...familiesA].filter((f) => familiesB.has(f))
  );
  const unionFamilies = new Set([...familiesA, ...familiesB]);

  const familyScore =
    unionFamilies.size > 0 ? sharedFamilies.size / unionFamilies.size : 0;

  // Keyword fallback for mechanisms that don't map to families
  const tokensA = extractMechanismTokens(suppA.mechanismsOfAction);
  const tokensB = extractMechanismTokens(suppB.mechanismsOfAction);
  const sharedTokens = new Set([...tokensA].filter((t) => tokensB.has(t)));
  const unionTokens = new Set([...tokensA, ...tokensB]);
  const tokenScore =
    unionTokens.size > 0 ? sharedTokens.size / unionTokens.size : 0;

  const score = 0.7 * familyScore + 0.3 * tokenScore;

  return { score, sharedPathways: [...sharedFamilies] };
}

function scoreCategoryProximity(suppA, suppB) {
  const catA = normalizeCategory(suppA.category);
  const catB = normalizeCategory(suppB.category);

  if (catA === catB) {
    return { score: 1.0, relationship: `Same category: ${catA}` };
  }

  const related = CATEGORY_PROXIMITY[catA] || [];
  if (related.includes(catB)) {
    return { score: 0.5, relationship: `Related: ${catA} ↔ ${catB}` };
  }

  // Check reverse
  const relatedB = CATEGORY_PROXIMITY[catB] || [];
  if (relatedB.includes(catA)) {
    return { score: 0.5, relationship: `Related: ${catA} ↔ ${catB}` };
  }

  return { score: 0.0, relationship: `Different: ${catA} vs ${catB}` };
}

function scoreEvidenceQuality(suppA, suppB) {
  const tierA = suppA.evidenceTier || 3;
  const tierB = suppB.evidenceTier || 3;
  const key = [Math.min(tierA, tierB), Math.max(tierA, tierB)].join("-");
  const score = TIER_SCORES[key] || 0.15;
  return { score, tierLabel: `Tier ${tierA} vs Tier ${tierB}` };
}

function scoreSafetyCompatibility(suppA, suppB) {
  let score = 0.8;

  const ratingA = suppA.safetyProfile?.rating || "";
  const ratingB = suppB.safetyProfile?.rating || "";

  // Bonus for both having good safety
  if (
    ratingA.toLowerCase().includes("good") &&
    ratingB.toLowerCase().includes("good")
  ) {
    score += 0.1;
  }

  // Check for overlapping drug interaction categories (informative for comparison)
  const interactionsA = (suppA.safetyProfile?.drugInteractions || [])
    .join(" ")
    .toLowerCase();
  const interactionsB = (suppB.safetyProfile?.drugInteractions || [])
    .join(" ")
    .toLowerCase();

  const sharedDrugClasses = [
    "blood thinner",
    "anticoagulant",
    "ssri",
    "antidepressant",
    "sedative",
    "antihypertensive",
    "diabetes",
    "thyroid",
    "immunosuppressant",
    "statin",
  ];

  let overlappingInteractions = 0;
  sharedDrugClasses.forEach((cls) => {
    if (interactionsA.includes(cls) && interactionsB.includes(cls)) {
      overlappingInteractions++;
    }
  });

  // Shared interaction categories are informative for comparison pages
  if (overlappingInteractions > 0) score += 0.05;

  // Penalty if both have serious contraindications
  const contraA = (suppA.safetyProfile?.contraindications || [])
    .join(" ")
    .toLowerCase();
  const contraB = (suppB.safetyProfile?.contraindications || [])
    .join(" ")
    .toLowerCase();

  const seriousFlags = ["liver", "kidney", "surgery", "bleeding"];
  let seriousOverlap = 0;
  seriousFlags.forEach((flag) => {
    if (contraA.includes(flag) && contraB.includes(flag)) seriousOverlap++;
  });
  if (seriousOverlap >= 2) score -= 0.2;

  return { score: Math.max(0, Math.min(1, score)), notes: "" };
}

// ── Domain Inference ─────────────────────────────────────────────────

function inferDomains(sharedTerms, sharedPathways) {
  const allTokens = [
    ...sharedTerms,
    ...sharedPathways.map((p) => p.toLowerCase()),
  ].join(" ");

  const scores = DOMAIN_KEYWORDS.map((d) => {
    let count = 0;
    d.keywords.forEach((kw) => {
      if (allTokens.includes(kw)) count++;
    });
    return { domain: d.domain, count };
  })
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  if (scores.length === 0) return { domain: "General Health", sharedDomains: [] };

  const primary = scores[0].domain;
  const sharedDomains = sharedTerms.slice(0, 5);

  return { domain: primary, sharedDomains };
}

// ── Rationale Generation ─────────────────────────────────────────────

function generateRationale(suppA, suppB, scores, totalScore) {
  const catA = normalizeCategory(suppA.category);
  const catB = normalizeCategory(suppB.category);
  const catStr =
    catA === catB
      ? `both ${catA}`
      : `${catA} and ${catB}`;

  const pathwayStr =
    scores.mechanism.sharedPathways.length > 0
      ? ` They share ${scores.mechanism.sharedPathways.length} mechanism pathway${scores.mechanism.sharedPathways.length > 1 ? "s" : ""} (${scores.mechanism.sharedPathways.slice(0, 3).join(", ")}).`
      : "";

  const benefitStr =
    scores.benefit.sharedTerms.length > 0
      ? ` with ${scores.benefit.sharedTerms.length} shared benefit areas (${scores.benefit.sharedTerms.slice(0, 4).join(", ")})`
      : "";

  return `${suppA.name} (Tier ${suppA.evidenceTier}) and ${suppB.name} (Tier ${suppB.evidenceTier}) are ${catStr}${benefitStr}.${pathwayStr} Score: ${totalScore}/100.`;
}

// ── Main ─────────────────────────────────────────────────────────────

function main() {
  const data = loadSupplementData();
  if (!data) {
    console.error("Failed to load supplement data.");
    process.exit(1);
  }

  const supplements = data.supplements || data;
  if (!Array.isArray(supplements)) {
    console.error("Supplement data is not an array. Got:", typeof supplements);
    process.exit(1);
  }

  if (!JSON_ONLY) {
    console.log(`\nLoaded ${supplements.length} supplements.`);
    console.log(`Existing comparisons: ${EXISTING_SLUGS.size}`);
    console.log(`Generating all pairs...\n`);
  }

  const idf = buildIDF(supplements);

  const results = [];
  let skippedExisting = 0;

  for (let i = 0; i < supplements.length; i++) {
    for (let j = i + 1; j < supplements.length; j++) {
      const suppA = supplements[i];
      const suppB = supplements[j];

      // Skip existing comparisons
      if (isExistingPair(suppA.name, suppB.name)) {
        skippedExisting++;
        continue;
      }

      // Category filter
      if (CATEGORY_FILTER) {
        const normFilter = CATEGORY_FILTER.toLowerCase();
        const catA = normalizeCategory(suppA.category).toLowerCase();
        const catB = normalizeCategory(suppB.category).toLowerCase();
        if (!catA.includes(normFilter) && !catB.includes(normFilter)) continue;
      }

      // Score all dimensions
      const benefit = scoreBenefitOverlap(suppA, suppB, idf);
      const mechanism = scoreMechanismOverlap(suppA, suppB);
      const category = scoreCategoryProximity(suppA, suppB);
      const evidence = scoreEvidenceQuality(suppA, suppB);
      const safety = scoreSafetyCompatibility(suppA, suppB);

      const totalScore = Math.round(
        benefit.score * WEIGHTS.benefit +
          mechanism.score * WEIGHTS.mechanism +
          category.score * WEIGHTS.category +
          evidence.score * WEIGHTS.evidence +
          safety.score * WEIGHTS.safety
      );

      if (totalScore < MIN_SCORE) continue;

      const { domain, sharedDomains } = inferDomains(
        benefit.sharedTerms,
        mechanism.sharedPathways
      );

      const rationale = generateRationale(
        suppA,
        suppB,
        { benefit, mechanism },
        totalScore
      );

      const slug = slugify(suppA.name) + "-vs-" + slugify(suppB.name);

      results.push({
        rank: 0,
        suppA: suppA.name,
        suppB: suppB.name,
        slug,
        totalScore,
        domain,
        sharedDomains,
        tierLabel: evidence.tierLabel,
        categoryRelation: category.relationship,
        sharedBenefitTerms: benefit.sharedTerms,
        sharedPathways: mechanism.sharedPathways,
        rationale,
        scores: {
          benefit: Math.round(benefit.score * 100) / 100,
          mechanism: Math.round(mechanism.score * 100) / 100,
          category: Math.round(category.score * 100) / 100,
          evidence: Math.round(evidence.score * 100) / 100,
          safety: Math.round(safety.score * 100) / 100,
        },
      });
    }
  }

  // Sort and rank
  results.sort((a, b) => b.totalScore - a.totalScore);
  const topResults = results.slice(0, TOP_N);
  topResults.forEach((r, i) => (r.rank = i + 1));

  if (!JSON_ONLY) {
    console.log(`Total pairs scored: ${results.length}`);
    console.log(`Skipped existing: ${skippedExisting}`);
    if (CATEGORY_FILTER)
      console.log(`Category filter: ${CATEGORY_FILTER}`);
    console.log(`\n${"═".repeat(110)}`);
    console.log(
      `${"Rank".padStart(4)}  ${"Score".padStart(5)}  ${"Pair".padEnd(50)}  ${"Domain".padEnd(28)}  ${"Tiers".padEnd(15)}`
    );
    console.log(`${"─".repeat(110)}`);

    topResults.forEach((r) => {
      const pair = `${r.suppA} vs ${r.suppB}`;
      console.log(
        `${String(r.rank).padStart(4)}  ${String(r.totalScore).padStart(5)}  ${pair.padEnd(50).slice(0, 50)}  ${r.domain.padEnd(28).slice(0, 28)}  ${r.tierLabel.padEnd(15)}`
      );
    });
    console.log(`${"═".repeat(110)}\n`);
  }

  // Write JSON
  const outPath = path.join(__dirname, "..", "data", "compare-candidates.json");
  const output = {
    generated: new Date().toISOString(),
    totalSupplements: supplements.length,
    totalPairsScored: results.length,
    existingComparisons: EXISTING_SLUGS.size,
    filters: {
      topN: TOP_N,
      minScore: MIN_SCORE,
      category: CATEGORY_FILTER,
    },
    candidates: topResults,
  };
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  if (!JSON_ONLY) {
    console.log(`JSON written to: ${outPath}`);
  } else {
    console.log(JSON.stringify(output, null, 2));
  }

  // Print COMPARISONS stubs
  if (STUBS && !JSON_ONLY) {
    console.log(`\n${"═".repeat(80)}`);
    console.log("COMPARISONS CONFIG STUBS (paste into generate-compare-pages.js):");
    console.log(`${"═".repeat(80)}\n`);

    topResults.slice(0, 10).forEach((r) => {
      console.log(`    {
        slug: '${r.slug}',
        suppA: '${r.suppA}',
        suppB: '${r.suppB}',
        title: '${r.suppA} vs ${r.suppB}: Evidence-Based Comparison',
        metaTitle: '${r.suppA} vs ${r.suppB} (2026) | Head-to-Head Comparison',
        metaDescription: 'Evidence-based comparison of ${r.suppA} vs ${r.suppB} for ${r.sharedDomains.slice(0, 3).join(", ")}. Compare dosages, mechanisms, side effects, and which supplement is right for you.',
        domain: '${r.domain}',
        sharedDomains: ${JSON.stringify(r.sharedDomains)},
        verdict: '', // TODO: Write evidence-based verdict
        whoShouldChoose: [
            // TODO: Add 4-6 scenario/recommendation objects
        ],
        canStack: '', // TODO: Write stacking guidance
        relatedGuides: [],
        relatedCategories: []
    },`);
      console.log();
    });
  }
}

main();
