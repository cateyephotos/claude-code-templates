/**
 * stack-analyzer.js — Stack Analyzer Frontend Logic
 *
 * Provides the interactive UI for the AI-powered supplement stack analyzer.
 * All inputs are constrained (no free text) — supplements come from a
 * multi-select pulldown, health goal from a single-select dropdown,
 * and depth from radio buttons.
 *
 * Dependencies:
 *   - auth.js (window.SupplementDBAuth)
 *   - rbac.js (window.SupplementDBRBAC)
 *   - convex-client.js (window.SupplementDB)
 *   - stack-analyzer.css (styling)
 *
 * Convex API calls:
 *   - Query:  analysisCredits:getMyCredits
 *   - Query:  analysisCredits:hasCreditsAvailable
 *   - Query:  analysisCredits:getMyAnalyses
 *   - Action: stackAnalyzer:analyzeStack
 */
(function () {
  "use strict";

  // ── Supplement Database (embedded from data/supplements.js) ──────
  // Each entry: { id, name, category, evidenceTier, dosageRange, mechanisms[] }
  const SUPPLEMENT_DB = [{"id":1,"name":"Bacopa monnieri","category":"Nootropic","evidenceTier":2,"dosageRange":"300mg daily (standardized to 55% bacosides)","mechanisms":["Acetylcholinesterase inhibition","Antioxidant neuroprotection","Enhanced synaptic transmission"]},{"id":2,"name":"Turmeric/Curcumin","category":"Anti-inflammatory","evidenceTier":1,"dosageRange":"500-1000mg daily (with piperine for absorption)","mechanisms":["NF-\u03baB pathway inhibition","Amyloid-\u03b2 formation inhibition","Cerebrovascular function enhancement"]},{"id":3,"name":"Ashwagandha","category":"Adaptogen","evidenceTier":1,"dosageRange":"300-600mg daily (standardized extract)","mechanisms":["HPA axis modulation","Cortisol reduction","GABA signaling enhancement"]},{"id":4,"name":"Omega-3 Fatty Acids","category":"Essential Fatty Acid","evidenceTier":1,"dosageRange":"1000-2000mg daily (combined EPA/DHA)","mechanisms":["Cell membrane fluidity","Neuroinflammation reduction","Neurotransmitter synthesis"]},{"id":5,"name":"Creatine","category":"Performance Enhancer","evidenceTier":1,"dosageRange":"3-5g daily (maintenance)","mechanisms":["ATP regeneration","Brain energy metabolism","Neuroprotection"]},{"id":6,"name":"Magnesium","category":"Essential Mineral","evidenceTier":1,"dosageRange":"200-400mg daily (elemental magnesium)","mechanisms":["GABA receptor modulation","NMDA receptor antagonism","Muscle relaxation"]},{"id":7,"name":"Vitamin D3","category":"Vitamin","evidenceTier":1,"dosageRange":"1000-4000 IU daily","mechanisms":["Vitamin D receptor activation","Calcium homeostasis","Gene expression regulation"]},{"id":8,"name":"Melatonin","category":"Sleep Aid","evidenceTier":1,"dosageRange":"0.5-3mg, 30-60 min before bed","mechanisms":["Melatonin receptor activation","Circadian rhythm regulation","Antioxidant effects"]},{"id":9,"name":"L-Theanine","category":"Amino Acid","evidenceTier":2,"dosageRange":"100-200mg daily","mechanisms":["GABA receptor modulation","Alpha brain wave promotion","Dopamine and serotonin modulation"]},{"id":10,"name":"Rhodiola rosea","category":"Adaptogen","evidenceTier":2,"dosageRange":"200-400mg daily (standardized extract)","mechanisms":["HPA axis modulation","Monoamine oxidase inhibition","Stress protein expression"]},{"id":11,"name":"Lion's Mane Mushroom","category":"Nootropic","evidenceTier":2,"dosageRange":"500-1000mg daily","mechanisms":["NGF stimulation","Neurogenesis promotion","Myelin regeneration"]},{"id":12,"name":"Phosphatidylserine","category":"Phospholipid","evidenceTier":2,"dosageRange":"100-300mg daily","mechanisms":["Cell membrane fluidity optimization","Neurotransmitter function support","Cortisol response modulation"]},{"id":13,"name":"Acetyl-L-Carnitine","category":"Amino Acid","evidenceTier":2,"dosageRange":"500-2000mg daily","mechanisms":["Mitochondrial energy production","Acetylcholine synthesis support","Neurotrophin factor enhancement"]},{"id":14,"name":"Ginkgo Biloba","category":"Herbal Extract","evidenceTier":2,"dosageRange":"120-240mg daily (EGb 761)","mechanisms":["Cerebral blood flow enhancement","Platelet aggregation inhibition","Antioxidant neuroprotection"]},{"id":15,"name":"Panax Ginseng","category":"Adaptogen","evidenceTier":2,"dosageRange":"200-400mg daily","mechanisms":["HPA axis modulation","Neurotransmitter enhancement","Anti-inflammatory activity"]},{"id":16,"name":"Alpha-GPC","category":"Choline Compound","evidenceTier":2,"dosageRange":"300-600mg daily","mechanisms":["Acetylcholine synthesis enhancement","Cell membrane support","Growth hormone release"]},{"id":17,"name":"Berberine","category":"Plant Alkaloid","evidenceTier":2,"dosageRange":"500-1500mg daily (divided doses)","mechanisms":["AMPK pathway activation","Glucose metabolism enhancement","Inflammation reduction"]},{"id":18,"name":"CoQ10","category":"Antioxidant","evidenceTier":2,"dosageRange":"100-300mg daily","mechanisms":["Mitochondrial energy production","Antioxidant protection","Cell membrane stabilization"]},{"id":19,"name":"B-Complex Vitamins","category":"Essential Nutrients","evidenceTier":1,"dosageRange":"RDA to therapeutic doses","mechanisms":["Neurotransmitter synthesis support","Homocysteine metabolism","Myelin sheath maintenance"]},{"id":20,"name":"Quercetin","category":"Flavonoid","evidenceTier":2,"dosageRange":"500-1000mg daily","mechanisms":["Senescent cell clearance","Anti-inflammatory pathways","Antioxidant activity"]},{"id":21,"name":"Vitamin B12","category":"Essential Nutrients","evidenceTier":1,"dosageRange":"2.4\u00b5g-1000\u00b5g","mechanisms":["Myelin sheath maintenance","Homocysteine metabolism","DNA methylation"]},{"id":22,"name":"Vitamin B6","category":"Essential Nutrients","evidenceTier":2,"dosageRange":"1.3-100mg daily","mechanisms":["Neurotransmitter synthesis","Homocysteine metabolism","Amino acid metabolism"]},{"id":23,"name":"Folate","category":"Essential Nutrients","evidenceTier":1,"dosageRange":"400-800 mcg/day","mechanisms":["One-carbon metabolism","Homocysteine remethylation","DNA synthesis and repair"]},{"id":24,"name":"Green Tea Extract","category":"Polyphenol","evidenceTier":2,"dosageRange":"200-400mg EGCG daily","mechanisms":["EGCG multi-target cellular signaling","DYRK1A kinase inhibition","AMPK pathway activation"]},{"id":25,"name":"NAD+ Precursors","category":"Metabolic Support","evidenceTier":2,"dosageRange":"250-500mg NR or NMN daily","mechanisms":["NAD+ biosynthesis","Sirtuin activation","Mitochondrial biogenesis"]},{"id":26,"name":"PQQ","category":"Antioxidant","evidenceTier":3,"dosageRange":"20mg daily","mechanisms":["Mitochondrial biogenesis","Redox cofactor activity","Cerebral blood flow enhancement"]},{"id":27,"name":"Resveratrol","category":"Polyphenol","evidenceTier":2,"dosageRange":"150-500mg daily","mechanisms":["NF-\u03baB pathway inhibition","eNOS activation","SIRT1 activation"]},{"id":28,"name":"Glucosamine","category":"Joint Support","evidenceTier":2,"dosageRange":"1500mg glucosamine sulfate daily","mechanisms":["Cartilage matrix synthesis","NF-\u03baB pathway inhibition","Joint space narrowing reduction"]},{"id":29,"name":"MSM","category":"Joint Support","evidenceTier":3,"dosageRange":"2000-3375mg daily","mechanisms":["NF-\u03baB pathway inhibition","Sulfur donor for connective tissue","Free radical scavenging"]},{"id":30,"name":"Vitamin E","category":"Essential Nutrients","evidenceTier":2,"dosageRange":"15mg-200 IU/day","mechanisms":["Lipid peroxidation inhibition","T-cell enhancement","Antioxidant neuroprotection"]},{"id":31,"name":"Whey Protein","category":"Protein","evidenceTier":2,"dosageRange":"20-40g post-exercise","mechanisms":["mTOR pathway activation","Muscle protein synthesis","Glutathione precursor"]},{"id":32,"name":"Chondroitin Sulfate","category":"Joint Support","evidenceTier":2,"dosageRange":"800-1200mg daily","mechanisms":["MMP/ADAMTS suppression","NF-\u03baB pathway inhibition","Synovial fluid enhancement"]},{"id":33,"name":"L-Tyrosine","category":"Amino Acid","evidenceTier":3,"dosageRange":"100-150 mg/kg or 2g twice daily","mechanisms":["Dopamine synthesis precursor","Norepinephrine precursor","Catecholamine depletion reversal"]},{"id":34,"name":"5-HTP","category":"Amino Acid","evidenceTier":2,"dosageRange":"50-300mg daily","mechanisms":["Serotonin synthesis precursor","Crosses blood-brain barrier","Aromatic amino acid decarboxylase substrate"]},{"id":35,"name":"Tribulus Terrestris","category":"Herbal Supplement","evidenceTier":3,"dosageRange":"250-750mg daily","mechanisms":["Steroidal saponin activity","Nitric oxide enhancement","Antioxidant activity"]},{"id":36,"name":"Vitamin C","category":"Essential Nutrients","evidenceTier":1,"dosageRange":"500mg-2g daily","mechanisms":["Antioxidant activity","Collagen synthesis cofactor","Immune system modulation"]},{"id":37,"name":"Zinc","category":"Essential Nutrients","evidenceTier":1,"dosageRange":"8-40mg daily","mechanisms":["Enzyme cofactor (300+ enzymes)","Protein structure stabilization","Gene expression regulation"]},{"id":38,"name":"Iron","category":"Essential Nutrients","evidenceTier":1,"dosageRange":"8-65mg daily","mechanisms":["Oxygen transport","Cellular energy production","Neurotransmitter synthesis"]},{"id":39,"name":"Taurine","category":"Amino Acid","evidenceTier":3,"dosageRange":"1-6g daily","mechanisms":["Calcium regulation","Antioxidant properties","Bile acid conjugation"]},{"id":40,"name":"GABA","category":"Amino Acid","evidenceTier":3,"dosageRange":"100-750mg daily","mechanisms":["Inhibitory neurotransmitter","Peripheral nervous system calming","Gut-brain axis modulation"]},{"id":41,"name":"Inositol","category":"B-Vitamin Related","evidenceTier":2,"dosageRange":"2-18g daily","mechanisms":["Second messenger system","Neurotransmitter regulation","Insulin signal transduction"]},{"id":42,"name":"Selenium","category":"Essential Nutrients","evidenceTier":2,"dosageRange":"55-200mcg daily","mechanisms":["Glutathione peroxidase cofactor","Thyroid hormone metabolism","Antioxidant enzyme systems"]},{"id":43,"name":"Choline","category":"Essential Nutrients","evidenceTier":2,"dosageRange":"250mg-2g daily","mechanisms":["Acetylcholine precursor","Phospholipid synthesis","Methylation pathway support"]},{"id":44,"name":"Alpha-Lipoic Acid","category":"Antioxidant","evidenceTier":2,"dosageRange":"100-600mg daily","mechanisms":["Universal antioxidant","Mitochondrial energy production","Glucose metabolism enhancement"]},{"id":45,"name":"Lutein","category":"Antioxidant","evidenceTier":2,"dosageRange":"6-20mg daily","mechanisms":["Macular pigment accumulation","Blue light filtration","Antioxidant protection"]},{"id":46,"name":"Astaxanthin","category":"Antioxidant","evidenceTier":3,"dosageRange":"4-12mg daily","mechanisms":["Potent antioxidant activity","Membrane stabilization","Anti-inflammatory effects"]},{"id":47,"name":"Ginger","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"500mg-2g daily","mechanisms":["COX and LOX inhibition","5-HT3 receptor antagonism","Antioxidant activity"]},{"id":48,"name":"Garlic","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"600mg-2g daily","mechanisms":["Allicin and sulfur compounds","Antioxidant activity","Nitric oxide production"]},{"id":49,"name":"Echinacea","category":"Herbal Supplement","evidenceTier":3,"dosageRange":"300mg-1g daily","mechanisms":["Immune system modulation","Cytokine regulation","Antioxidant activity"]},{"id":50,"name":"Caffeine","category":"Performance Enhancer","evidenceTier":1,"dosageRange":"50-400mg daily","mechanisms":["Adenosine receptor antagonism","Dopamine enhancement","Adrenaline stimulation"]},{"id":51,"name":"Reishi Mushroom","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"1-3g daily (extract)","mechanisms":["Beta-glucan immune modulation","Triterpene liver protection","Adaptogenic stress response"]},{"id":52,"name":"Cordyceps","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"1-3g daily","mechanisms":["ATP and oxygen utilization","Mitochondrial function improvement","Adaptogenic stress response"]},{"id":53,"name":"Spirulina","category":"Antioxidant","evidenceTier":2,"dosageRange":"1-8g daily","mechanisms":["Phycocyanin antioxidant activity","Immune system modulation","Micronutrient density"]},{"id":54,"name":"Chlorella","category":"Antioxidant","evidenceTier":3,"dosageRange":"3-10g daily","mechanisms":["Chlorophyll detoxification","Heavy metal binding","Immune system enhancement"]},{"id":55,"name":"Huperzine A","category":"Nootropic","evidenceTier":2,"dosageRange":"50-200mcg daily","mechanisms":["Acetylcholinesterase inhibition","NMDA receptor antagonism","Nerve growth factor protection"]},{"id":56,"name":"Vinpocetine","category":"Nootropic","evidenceTier":3,"dosageRange":"5-20mg daily","mechanisms":["Cerebral vasodilation","Improved glucose utilization","Sodium channel modulation"]},{"id":57,"name":"PEA (Phenylethylamine)","category":"Amino Acid","evidenceTier":3,"dosageRange":"100-500mg daily","mechanisms":["Dopamine and norepinephrine release","Monoamine reuptake inhibition","Trace amine receptor activation"]},{"id":58,"name":"MCT Oil","category":"Performance Enhancer","evidenceTier":2,"dosageRange":"5-30ml daily","mechanisms":["Rapid ketone body production","Alternative brain fuel","Bypass glucose metabolism"]},{"id":59,"name":"Hawthorn Berry","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"160-1800mg daily","mechanisms":["ACE inhibition","Antioxidant cardiovascular protection","Improved coronary blood flow"]},{"id":60,"name":"Red Yeast Rice","category":"Metabolic Support","evidenceTier":2,"dosageRange":"1200-2400mg daily","mechanisms":["HMG-CoA reductase inhibition","Natural statin activity","Cholesterol synthesis reduction"]},{"id":61,"name":"Chromium","category":"Essential Nutrients","evidenceTier":2,"dosageRange":"200-400mcg daily","mechanisms":["Enhanced insulin receptor binding","Glucose transporter activation","Improved glucose uptake"]},{"id":62,"name":"Vanadium","category":"Essential Nutrients","evidenceTier":3,"dosageRange":"10-100mg daily","mechanisms":["Protein tyrosine phosphatase inhibition","Insulin receptor activation","Glucose transporter enhancement"]},{"id":63,"name":"Bitter Melon","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"500-2000mg daily","mechanisms":["Alpha-glucosidase inhibition","Glucose transporter enhancement","Insulin secretion stimulation"]},{"id":64,"name":"Gymnema Sylvestre","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"200-800mg daily","mechanisms":["Gymnemic acid sugar blocking","Beta cell regeneration","Glucose absorption inhibition"]},{"id":65,"name":"Fenugreek","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"500-1000mg daily","mechanisms":["Alpha-amylase inhibition","Delayed gastric emptying","Enhanced insulin sensitivity"]},{"id":66,"name":"Cinnamon Extract","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"120mg-6g daily","mechanisms":["Enhanced insulin sensitivity","Glucose transporter activation","Alpha-glucosidase inhibition"]},{"id":67,"name":"Holy Basil","category":"Adaptogen","evidenceTier":2,"dosageRange":"300-600mg daily","mechanisms":["HPA axis modulation","Cortisol normalization","GABA receptor activity"]},{"id":68,"name":"Schisandra Berry","category":"Adaptogen","evidenceTier":2,"dosageRange":"500-1500mg daily","mechanisms":["Liver enzyme induction","Antioxidant enzyme activation","Stress hormone modulation"]},{"id":69,"name":"Mucuna Pruriens","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"500-1000mg daily","mechanisms":["L-DOPA dopamine precursor","Tyrosine hydroxylase activation","Antioxidant neuroprotection"]},{"id":70,"name":"Forskolin","category":"Herbal Supplement","evidenceTier":3,"dosageRange":"250-500mg daily","mechanisms":["Adenylyl cyclase activation","cAMP elevation","Protein kinase A activation"]},{"id":71,"name":"Boswellia","category":"Anti-inflammatory","evidenceTier":2,"dosageRange":"300-800mg daily","mechanisms":["5-lipoxygenase inhibition","Leukotriene synthesis reduction","NF-kappaB modulation"]},{"id":72,"name":"Milk Thistle","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"200-600mg daily (80% silymarin)","mechanisms":["Antioxidant liver protection","Hepatocyte membrane stabilization","Protein synthesis stimulation"]},{"id":73,"name":"Stinging Nettle","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"300-600mg daily","mechanisms":["Histamine receptor antagonism","5-lipoxygenase inhibition","COX enzyme inhibition"]},{"id":74,"name":"Elderberry","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"300-600mg daily","mechanisms":["Antiviral hemagglutinin inhibition","Immune system stimulation","Anthocyanin antioxidant"]},{"id":75,"name":"Citicoline","category":"Nootropic","evidenceTier":1,"dosageRange":"250-1000mg daily","mechanisms":["Phosphatidylcholine synthesis","Acetylcholine production increase","Dopamine receptor improvement"]},{"id":76,"name":"Sulbutiamine","category":"Essential Nutrients","evidenceTier":2,"dosageRange":"200-600mg daily","mechanisms":["Enhanced thiamine bioavailability","Improved mitochondrial function","Dopamine receptor modulation"]},{"id":77,"name":"DMAE","category":"Nootropic","evidenceTier":3,"dosageRange":"100-300mg daily","mechanisms":["Choline precursor activity","Acetylcholine synthesis","Cell membrane stabilization"]},{"id":78,"name":"Centella Asiatica","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"300-900mg daily","mechanisms":["Improved cerebral circulation","Antioxidant neuroprotection","Collagen synthesis"]},{"id":79,"name":"Passionflower","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"250-800mg daily","mechanisms":["GABA receptor enhancement","Monoamine oxidase inhibition","Serotonin reuptake modulation"]},{"id":80,"name":"Aniracetam","category":"Nootropic","evidenceTier":3,"dosageRange":"750-1500mg daily","mechanisms":["AMPA receptor modulation","Enhanced synaptic plasticity","Increased BDNF expression"]},{"id":81,"name":"Piracetam","category":"Nootropic","evidenceTier":2,"dosageRange":"2400-4800mg daily","mechanisms":["Neuronal membrane fluidity","Increased ATP synthesis","Interhemispheric transfer"]},{"id":82,"name":"Kanna","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"25-100mg daily","mechanisms":["Serotonin reuptake inhibition","PDE4 inhibition","GABA enhancement"]},{"id":83,"name":"Black Seed Oil","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"500-2000mg daily","mechanisms":["Thymoquinone antioxidant","Anti-inflammatory modulation","Immune system modulation"]},{"id":84,"name":"Moringa","category":"Herbal Supplement","evidenceTier":2,"dosageRange":"500-1500mg daily","mechanisms":["Dense nutritional profile","Potent antioxidant activity","Anti-inflammatory compounds"]},{"id":85,"name":"Pine Bark Extract","category":"Antioxidant","evidenceTier":2,"dosageRange":"50-200mg daily","mechanisms":["Potent antioxidant activity","Nitric oxide enhancement","Anti-inflammatory effects"]},{"id":86,"name":"Grape Seed Extract","category":"Antioxidant","evidenceTier":2,"dosageRange":"100-400mg daily","mechanisms":["Proanthocyanidin antioxidants","Endothelial function enhancement","Anti-inflammatory activity"]},{"id":87,"name":"Krill Oil","category":"Essential Nutrients","evidenceTier":2,"dosageRange":"500-2000mg daily","mechanisms":["Phospholipid-bound omega-3","Enhanced bioavailability","Astaxanthin antioxidant"]},{"id":88,"name":"Zeaxanthin","category":"Antioxidant","evidenceTier":2,"dosageRange":"2-10mg daily","mechanisms":["Macular pigment density","Blue light filtration","Antioxidant protection"]},{"id":89,"name":"Pterostilbene","category":"Antioxidant","evidenceTier":3,"dosageRange":"50-250mg daily","mechanisms":["Enhanced bioavailability","Sirtuin activation","Antioxidant enzyme induction"]},{"id":90,"name":"Beta-Alanine","category":"Performance Enhancer","evidenceTier":3,"dosageRange":"4-6g daily","mechanisms":["Carnosine synthesis","Intracellular pH buffering","Delayed neuromuscular fatigue"]},{"id":91,"name":"Citrulline Malate","category":"Performance Enhancer","evidenceTier":3,"dosageRange":"6-8g pre-workout","mechanisms":["Arginine-nitric oxide pathway","Ammonia detoxification","Aerobic energy production"]},{"id":92,"name":"HMB","category":"Performance Enhancer","evidenceTier":3,"dosageRange":"3g daily","mechanisms":["mTOR pathway activation","Ubiquitin-proteasome inhibition","Cell membrane repair"]},{"id":93,"name":"Betaine","category":"Performance Enhancer","evidenceTier":3,"dosageRange":"2.5g daily","mechanisms":["Osmolyte function","Methyl donor in methionine cycle","Creatine synthesis support"]}];

  // ── Health Goals (embedded from data/problems.js) ──────────────
  const HEALTH_GOALS = [
    { id: "sleep", name: "Sleep Quality & Insomnia" },
    { id: "anxiety", name: "Anxiety & Stress Management" },
    { id: "cognitive-performance", name: "Cognitive Performance & Memory" },
    { id: "longevity", name: "Longevity & Anti-Aging" },
    { id: "metabolic-health", name: "Metabolic Health & Blood Sugar" },
    { id: "exercise-performance", name: "Exercise Performance & Recovery" },
    { id: "inflammation", name: "Inflammation & Joint Health" },
    { id: "mood-depression", name: "Mood & Depression Support" },
    { id: "memory-aging", name: "Memory & Cognitive Aging" },
    { id: "muscle-strength", name: "Muscle Strength & Lean Mass" },
    { id: "recovery-soreness", name: "Exercise Recovery & Soreness" },
    { id: "gut-brain", name: "Gut-Brain Axis" },
    { id: "stress-resilience", name: "Stress Resilience & Cortisol" }
  ];

  // ── Normalized category map (merge duplicates) ─────────────────
  const CATEGORY_MAP = {};
  SUPPLEMENT_DB.forEach(s => {
    // Normalize: "Adaptogens" → "Adaptogen", "Performance Enhancers" → "Performance Enhancer", etc.
    let cat = s.category;
    if (cat.endsWith("s") && !cat.endsWith("ss") && cat !== "Essential Nutrients" && cat !== "Antioxidants") {
      const singular = cat.slice(0, -1);
      // Check if the singular exists as another category
      const hasSingular = SUPPLEMENT_DB.some(x => x.category === singular);
      if (hasSingular) cat = singular;
    }
    if (!CATEGORY_MAP[cat]) CATEGORY_MAP[cat] = [];
    CATEGORY_MAP[cat].push(s);
  });

  // Sort categories alphabetically, sort supplements within each by name
  const SORTED_CATEGORIES = Object.keys(CATEGORY_MAP).sort();
  SORTED_CATEGORIES.forEach(cat => {
    CATEGORY_MAP[cat].sort((a, b) => a.name.localeCompare(b.name));
  });

  // ── Configuration ──────────────────────────────────────────────
  const MIN_SUPPLEMENTS = 2;
  const MAX_SUPPLEMENTS = 15;

  // ── State ──────────────────────────────────────────────────────
  let selectedSupplements = [];  // Array of supplement objects
  let selectedGoals = [];        // Array of health goal objects (max 2)
  let selectedDepth = "standard"; // "quick" | "standard" | "deep"
  let isAnalyzing = false;
  let currentCredits = null;
  let smartSortEnabled = false;  // Whether Smart Sort toggle is active
  let relevanceData = null;      // Loaded from problems.js on demand

  // ── Relevance Data (lazy-loaded from problems.js) ────────────────
  async function loadRelevanceData() {
    if (relevanceData) return relevanceData;
    try {
      // problems.js defines `const problemDatabase = [...]` globally when loaded
      // It's already included in the HTML page via script tag
      if (typeof problemDatabase !== "undefined") {
        relevanceData = {};
        for (const domain of problemDatabase) {
          relevanceData[domain.id] = {};
          for (const supp of (domain.supplements || [])) {
            relevanceData[domain.id][supp.supplementId] = {
              relevanceScore: supp.relevanceScore || 0,
              mechanismMatch: supp.mechanismMatch || [],
            };
          }
        }
        return relevanceData;
      }
    } catch (e) {
      console.warn("[StackAnalyzer] Could not load relevance data:", e);
    }
    return null;
  }

  function getRelevanceScore(goalId, supplementId) {
    if (!relevanceData || !relevanceData[goalId]) return 0;
    return relevanceData[goalId][supplementId]?.relevanceScore || 0;
  }

  function getCombinedRelevance(goals, supplementId) {
    if (!goals.length || !relevanceData) return 0;
    return Math.max(...goals.map(g => getRelevanceScore(g.id, supplementId)));
  }

  // ── DOM References ─────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ── Initialization ─────────────────────────────────────────────
  function init() {
    // Only run on Stack Analyzer page
    if (!document.getElementById("sa-app")) return;

    // Check auth state
    const auth = window.SupplementDBAuth;
    if (auth?.isLoaded) {
      renderForAuthState();
    } else {
      // Show loading state
      renderLoadingState();
      document.addEventListener("auth:loaded", () => renderForAuthState(), { once: true });
    }

    // Listen for auth changes
    document.addEventListener("auth:signed-in", () => {
      setTimeout(renderForAuthState, 300);
    });
    document.addEventListener("auth:signed-out", () => {
      renderForAuthState();
    });
  }

  function renderLoadingState() {
    const app = $("#sa-app");
    if (!app) return;
    app.innerHTML = `
      <div class="sa-loading-state">
        <div class="sa-spinner"></div>
        <p style="color: var(--text-muted); margin-top: 1rem;">Loading Stack Analyzer...</p>
      </div>
    `;
  }

  function renderForAuthState() {
    const app = $("#sa-app");
    if (!app) return;
    const auth = window.SupplementDBAuth;

    if (!auth?.isSignedIn) {
      renderAuthGate(app);
      return;
    }

    // Signed in — render the analyzer
    renderAnalyzer(app);
    loadCredits();
    loadHistory();
  }

  // ── Auth Gate (unauthenticated users) ──────────────────────────
  function renderAuthGate(container) {
    container.innerHTML = `
      <div class="sa-auth-gate">
        <div class="sa-auth-gate-inner">
          <div class="sa-auth-gate-icon">
            <i class="fas fa-flask-vial"></i>
          </div>
          <h2 class="sa-auth-gate-title">Sign in to use Stack Analyzer</h2>
          <p class="sa-auth-gate-desc">
            Get AI-powered analysis of your supplement stack with synergy detection,
            safety checks, and dosage optimization — backed by clinical evidence.
          </p>
          <div class="sa-auth-gate-features">
            <div class="sa-auth-gate-feature">
              <i class="fas fa-check-circle"></i>
              <span>Pairwise interaction analysis</span>
            </div>
            <div class="sa-auth-gate-feature">
              <i class="fas fa-check-circle"></i>
              <span>Mechanism coverage mapping</span>
            </div>
            <div class="sa-auth-gate-feature">
              <i class="fas fa-check-circle"></i>
              <span>Safety flag detection</span>
            </div>
            <div class="sa-auth-gate-feature">
              <i class="fas fa-check-circle"></i>
              <span>Optimized dosage protocols</span>
            </div>
          </div>
          <button class="sa-btn-primary" id="sa-gate-signup">
            <i class="fas fa-user-plus"></i>
            Create Free Account
          </button>
          <p class="sa-auth-gate-signin">
            Already have an account?
            <button class="sa-link-btn" id="sa-gate-signin">Sign in</button>
          </p>
          <p class="sa-auth-gate-credit-info">
            <i class="fas fa-gift"></i>
            Free accounts include 3 analyses per month
          </p>
        </div>
      </div>
    `;

    $("#sa-gate-signup")?.addEventListener("click", () => {
      window.SupplementDBAuth?.openSignUp?.();
    });
    $("#sa-gate-signin")?.addEventListener("click", () => {
      window.SupplementDBAuth?.openSignIn?.();
    });
  }

  // ── Main Analyzer UI ──────────────────────────────────────────
  function renderAnalyzer(container) {
    container.innerHTML = `
      <!-- Credit Meter -->
      <div class="sa-credit-bar" id="sa-credit-bar">
        <div class="sa-credit-bar-inner">
          <div class="sa-credit-info">
            <span class="sa-credit-label">Analysis Credits</span>
            <span class="sa-credit-count" id="sa-credit-count">—</span>
          </div>
          <div class="sa-credit-meter">
            <div class="sa-credit-fill" id="sa-credit-fill" style="width: 0%"></div>
          </div>
          <span class="sa-credit-tier" id="sa-credit-tier"></span>
        </div>
      </div>

      <!-- Input Panel -->
      <div class="sa-panel" id="sa-input-panel">
        <div class="sa-panel-header">
          <h2 class="sa-panel-title">
            <i class="fas fa-list-check"></i>
            Build Your Stack
          </h2>
          <p class="sa-panel-subtitle">Select 2–15 supplements, a health goal, and analysis depth</p>
        </div>

        <!-- Supplement Multi-Select -->
        <div class="sa-field">
          <label class="sa-field-label">
            Supplements
            <span class="sa-field-count" id="sa-supp-count">0 / ${MAX_SUPPLEMENTS}</span>
          </label>
          <div class="sa-multiselect" id="sa-supp-select">
            <div class="sa-multiselect-selected" id="sa-supp-chips"></div>
            <input
              type="text"
              class="sa-multiselect-search"
              id="sa-supp-search"
              placeholder="Search supplements..."
              autocomplete="off"
              spellcheck="false"
            />
            <div class="sa-multiselect-dropdown" id="sa-supp-dropdown"></div>
          </div>
          <p class="sa-field-hint" id="sa-supp-hint">
            Select at least ${MIN_SUPPLEMENTS} supplements to analyze
          </p>
        </div>

        <!-- Smart Sort Toggle -->
        <div class="sa-field">
          <div class="sa-smart-sort-toggle" id="sa-smart-sort-toggle" role="switch" aria-checked="false" aria-label="Enable smart sort by health goal" tabindex="0">
            <div class="sa-toggle-switch" id="sa-toggle-switch"></div>
            <div class="sa-toggle-content">
              <span class="sa-toggle-label"><i class="fas fa-lightbulb"></i> Smart Sort by Health Goal</span>
              <span class="sa-toggle-hint">Groups supplements by relevance to your goal</span>
            </div>
          </div>
        </div>

        <!-- Goal Selection (always visible — goal is required for analysis) -->
        <div class="sa-field sa-goal-section" id="sa-goal-section">
          <label class="sa-field-label" for="sa-goal-select">Health Goal</label>
          <select class="sa-goal-select" id="sa-goal-select">
            <option value="">Choose a health goal...</option>
            ${HEALTH_GOALS.map(g => `<option value="${g.id}">${g.name}</option>`).join("")}
          </select>
          <div class="sa-goal-chips" id="sa-goal-chips"></div>

          <!-- Progressive disclosure: second goal (shown after first goal selected) -->
          <div class="sa-second-goal-disclosure" id="sa-second-goal-disclosure" style="display:none" aria-expanded="false">
            <button class="sa-add-goal-btn" id="sa-add-goal-btn" type="button">
              <i class="fas fa-plus"></i> Add second health goal
              <span class="sa-add-goal-cost">(+1 credit)</span>
            </button>
            <div class="sa-second-goal-select" id="sa-second-goal-select" style="display:none">
              <select class="sa-goal-select sa-goal-select--secondary" id="sa-goal-select-2">
                <option value="">Choose second goal...</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Depth Selector -->
        <div class="sa-field">
          <label class="sa-field-label">Analysis Depth</label>
          <div class="sa-depth-options" id="sa-depth-selector">
            <label class="sa-depth-option">
              <input type="radio" name="sa-depth" value="quick" />
              <div class="sa-depth-card">
                <div class="sa-depth-card-icon"><i class="fas fa-bolt"></i></div>
                <div class="sa-depth-card-title">Quick</div>
                <div class="sa-depth-card-desc">Key interactions & safety flags</div>
                <div class="sa-depth-card-cost">~$0.003</div>
              </div>
            </label>
            <label class="sa-depth-option">
              <input type="radio" name="sa-depth" value="standard" checked />
              <div class="sa-depth-card">
                <div class="sa-depth-card-icon"><i class="fas fa-microscope"></i></div>
                <div class="sa-depth-card-title">Standard</div>
                <div class="sa-depth-card-desc">Full analysis with mechanisms</div>
                <div class="sa-depth-card-cost">~$0.006</div>
              </div>
            </label>
            <label class="sa-depth-option">
              <input type="radio" name="sa-depth" value="deep" />
              <div class="sa-depth-card">
                <div class="sa-depth-card-icon"><i class="fas fa-dna"></i></div>
                <div class="sa-depth-card-title">Deep</div>
                <div class="sa-depth-card-desc">Comprehensive with full protocols</div>
                <div class="sa-depth-card-cost">~$0.009</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Analyze Button -->
        <div class="sa-actions">
          <button class="sa-analyze-btn" id="sa-analyze-btn" disabled>
            <span class="sa-analyze-btn-text">
              <i class="fas fa-flask-vial"></i>
              Analyze Stack
            </span>
            <span class="sa-analyze-btn-loading" style="display:none">
              <span class="sa-spinner-sm"></span>
              Analyzing...
            </span>
          </button>
          <p class="sa-analyze-hint" id="sa-analyze-hint"></p>
        </div>
      </div>

      <!-- Results Panel (hidden until analysis completes) -->
      <div class="sa-panel sa-results-panel" id="sa-results-panel" style="display:none">
        <div class="sa-panel-header">
          <h2 class="sa-panel-title">
            <i class="fas fa-chart-line"></i>
            Analysis Results
          </h2>
        </div>
        <div id="sa-results-content"></div>
      </div>

      <!-- History Panel -->
      <div class="sa-panel sa-history-panel" id="sa-history-panel" style="display:none">
        <div class="sa-panel-header">
          <h2 class="sa-panel-title">
            <i class="fas fa-clock-rotate-left"></i>
            Recent Analyses
          </h2>
        </div>
        <div id="sa-history-content"></div>
      </div>
    `;

    // Initialize interactive components
    initSupplementSelect();
    initGoalSelect();
    initDepthSelector();
    initAnalyzeButton();
    initSmartSortToggle();
  }

  // ── Supplement Multi-Select ────────────────────────────────────
  function initSupplementSelect() {
    const searchInput = $("#sa-supp-search");
    const dropdown = $("#sa-supp-dropdown");
    const selectEl = $("#sa-supp-select");
    if (!searchInput || !dropdown || !selectEl) return;

    // Build dropdown content
    renderDropdown("");

    // Search input events
    searchInput.addEventListener("focus", () => {
      dropdown.classList.add("open");
      renderDropdown(searchInput.value);
    });

    searchInput.addEventListener("input", () => {
      dropdown.classList.add("open");
      renderDropdown(searchInput.value);
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!selectEl.contains(e.target)) {
        dropdown.classList.remove("open");
      }
    });

    // Keyboard navigation
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dropdown.classList.remove("open");
        searchInput.blur();
      }
      if (e.key === "Backspace" && searchInput.value === "" && selectedSupplements.length > 0) {
        removeSupplementAt(selectedSupplements.length - 1);
      }
    });
  }

  function renderDropdownItem(s, relevanceScore, isDualRelevant) {
    const relevanceHtml = relevanceScore !== null && relevanceScore !== undefined
      ? '<span class="sa-relevance-indicator">' +
          '<span class="sa-relevance-bar"><span class="sa-relevance-fill ' + (relevanceScore >= 80 ? 'high' : relevanceScore >= 50 ? 'medium' : 'low') + '" style="width:' + relevanceScore + '%"></span></span>' +
          '<span class="sa-relevance-score ' + (relevanceScore >= 80 ? 'high' : relevanceScore >= 50 ? 'medium' : 'low') + '">' + relevanceScore + '</span>' +
        '</span>'
      : "";
    const dualBadge = isDualRelevant ? '<span class="sa-dual-badge" title="Relevant to both goals">●●</span>' : "";

    return '<div class="sa-dropdown-item" data-supp-id="' + s.id + '" role="button" tabindex="0">' +
        '<span class="tier-dot tier-' + s.evidenceTier + '"></span>' +
        '<span class="sa-dropdown-item-name">' + escapeHtml(s.name) + '</span>' +
        dualBadge +
        relevanceHtml +
        '<span class="sa-dropdown-item-tier">T' + s.evidenceTier + '</span>' +
      '</div>';
  }

  function renderCategorySortedDropdown(dropdown, query, selectedIds) {
    let html = "";

    for (const cat of SORTED_CATEGORIES) {
      const supps = CATEGORY_MAP[cat].filter(s => {
        if (selectedIds.has(s.id)) return false;
        if (!query) return true;
        return s.name.toLowerCase().includes(query) ||
               cat.toLowerCase().includes(query);
      });

      if (supps.length === 0) continue;

      html += `<div class="sa-dropdown-group-label">${escapeHtml(cat)}</div>`;
      for (const s of supps) {
        html += renderDropdownItem(s, null, false);
      }
    }

    if (!html) {
      html = '<div class="sa-dropdown-empty">No supplements match your search</div>';
    }

    dropdown.innerHTML = html;
  }

  function renderRelevanceSortedDropdown(dropdown, query, selectedIds) {
    const scored = SUPPLEMENT_DB
      .filter(s => !selectedIds.has(s.id))
      .filter(s => {
        if (!query) return true;
        return s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query);
      })
      .map(s => {
        const score = getCombinedRelevance(selectedGoals, s.id);
        const isDualRelevant = selectedGoals.length > 1 &&
          selectedGoals.every(g => getRelevanceScore(g.id, s.id) >= 50);
        return { ...s, relevanceScore: score, isDualRelevant };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    const high = scored.filter(s => s.relevanceScore >= 80);
    const moderate = scored.filter(s => s.relevanceScore >= 50 && s.relevanceScore < 80);
    const other = scored.filter(s => s.relevanceScore < 50);

    let html = "";

    if (high.length) {
      html += '<div class="sa-dropdown-group-label sa-relevance-high"><i class="fas fa-bullseye"></i> Highly Relevant <span class="sa-group-count">' + high.length + '</span></div>';
      for (const s of high) html += renderDropdownItem(s, s.relevanceScore, s.isDualRelevant);
    }
    if (moderate.length) {
      html += '<div class="sa-dropdown-group-label sa-relevance-moderate"><i class="fas fa-search"></i> Moderately Relevant <span class="sa-group-count">' + moderate.length + '</span></div>';
      for (const s of moderate) html += renderDropdownItem(s, s.relevanceScore, s.isDualRelevant);
    }
    if (other.length) {
      html += '<div class="sa-dropdown-group-label sa-relevance-other"><i class="fas fa-list"></i> Other Supplements <span class="sa-group-count">' + other.length + '</span></div>';
      for (const s of other) html += renderDropdownItem(s, s.relevanceScore, false);
    }

    if (!html) html = '<div class="sa-dropdown-empty">No supplements match your search</div>';
    dropdown.innerHTML = html;
  }

  function renderDropdown(filter) {
    const dropdown = $("#sa-supp-dropdown");
    if (!dropdown) return;

    const query = filter.toLowerCase().trim();
    const selectedIds = new Set(selectedSupplements.map(s => s.id));

    if (smartSortEnabled && selectedGoals.length > 0 && relevanceData) {
      renderRelevanceSortedDropdown(dropdown, query, selectedIds);
    } else {
      renderCategorySortedDropdown(dropdown, query, selectedIds);
    }

    // Attach click handlers (shared for both modes)
    dropdown.querySelectorAll(".sa-dropdown-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(btn.dataset.suppId, 10);
        addSupplement(id);
        const searchInput = $("#sa-supp-search");
        if (searchInput) { searchInput.value = ""; searchInput.focus(); }
        renderDropdown("");
      });
    });
  }

  function addSupplement(id) {
    if (selectedSupplements.length >= MAX_SUPPLEMENTS) return;
    const supp = SUPPLEMENT_DB.find(s => s.id === id);
    if (!supp || selectedSupplements.some(s => s.id === id)) return;
    selectedSupplements.push(supp);
    renderChips();
    updateValidation();
  }

  function removeSupplementAt(index) {
    selectedSupplements.splice(index, 1);
    renderChips();
    renderDropdown($("#sa-supp-search")?.value || "");
    updateValidation();
  }

  function renderChips() {
    const chipsEl = $("#sa-supp-chips");
    const countEl = $("#sa-supp-count");
    if (!chipsEl) return;

    chipsEl.innerHTML = selectedSupplements.map((s, i) => `
      <span class="sa-chip" data-index="${i}">
        <span class="sa-chip-name">${escapeHtml(s.name)}</span>
        <button class="sa-chip-remove" data-index="${i}" type="button" aria-label="Remove ${escapeHtml(s.name)}">
          <i class="fas fa-xmark"></i>
        </button>
      </span>
    `).join("");

    if (countEl) {
      countEl.textContent = `${selectedSupplements.length} / ${MAX_SUPPLEMENTS}`;
      countEl.classList.toggle("sa-field-count--max", selectedSupplements.length >= MAX_SUPPLEMENTS);
      countEl.classList.toggle("sa-field-count--valid", selectedSupplements.length >= MIN_SUPPLEMENTS);
    }

    // Chip remove handlers
    chipsEl.querySelectorAll(".sa-chip-remove").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeSupplementAt(parseInt(btn.dataset.index, 10));
      });
    });
  }

  // ── Goal Select ────────────────────────────────────────────────
  function initGoalSelect() {
    const goalSelect = $("#sa-goal-select");
    if (!goalSelect) return;

    goalSelect.addEventListener("change", () => {
      const val = goalSelect.value;
      const primaryGoal = val ? HEALTH_GOALS.find(g => g.id === val) : null;
      if (primaryGoal) {
        // Replace the first element (primary goal); preserve second goal if set
        selectedGoals = [primaryGoal, ...selectedGoals.slice(1)];
      } else {
        selectedGoals = [];
      }
      populateSecondGoalDropdown();
      renderGoalChips();
      renderDropdown($("#sa-supp-search")?.value || "");
      showSecondGoalDisclosure();
      updateValidation();
    });

    // "Add second goal" button toggles second dropdown visibility
    const addGoalBtn = $("#sa-add-goal-btn");
    if (addGoalBtn) {
      addGoalBtn.addEventListener("click", () => {
        const secondSelect = $("#sa-second-goal-select");
        if (!secondSelect) return;
        const isHidden = secondSelect.style.display === "none" || secondSelect.style.display === "";
        secondSelect.style.display = isHidden ? "block" : "none";
        const disclosure = $("#sa-second-goal-disclosure");
        if (disclosure) disclosure.setAttribute("aria-expanded", String(isHidden));
        if (isHidden) {
          populateSecondGoalDropdown();
          const goalSelect2 = $("#sa-goal-select-2");
          if (goalSelect2) goalSelect2.focus();
        }
      });
    }

    // Second goal dropdown change
    const goalSelect2El = $("#sa-goal-select-2");
    if (goalSelect2El) {
      goalSelect2El.addEventListener("change", () => {
        const val2 = goalSelect2El.value;
        const secondGoal = val2 ? HEALTH_GOALS.find(g => g.id === val2) : null;
        if (secondGoal) {
          selectedGoals = [selectedGoals[0], secondGoal].filter(Boolean);
        } else {
          selectedGoals = selectedGoals.slice(0, 1);
        }
        renderGoalChips();
        renderDropdown($("#sa-supp-search")?.value || "");
        showSecondGoalDisclosure();
        updateValidation();
      });
    }
  }

  // ── Populate Second Goal Dropdown ─────────────────────────────
  function populateSecondGoalDropdown() {
    const goalSelect2 = $("#sa-goal-select-2");
    if (!goalSelect2 || selectedGoals.length === 0) return;
    const excludeId = selectedGoals[0].id;
    goalSelect2.innerHTML = '<option value="">Choose second goal...</option>' +
      HEALTH_GOALS
        .filter(g => g.id !== excludeId)
        .map(g => '<option value="' + g.id + '">' + g.name + '</option>')
        .join("");
  }

  // ── Show/Hide Second Goal Disclosure ──────────────────────────
  function showSecondGoalDisclosure() {
    const disclosure = $("#sa-second-goal-disclosure");
    if (disclosure) {
      disclosure.style.display = selectedGoals.length >= 1 ? "block" : "none";
    }
  }

  // ── Goal Chips ─────────────────────────────────────────────────
  function renderGoalChips() {
    const chipsEl = $("#sa-goal-chips");
    if (!chipsEl) return;

    chipsEl.innerHTML = selectedGoals.map((g, i) =>
      '<span class="sa-goal-chip ' + (i === 1 ? 'sa-goal-chip--secondary' : '') + '" data-index="' + i + '">' +
        '<i class="fas fa-bullseye"></i>' +
        '<span>' + escapeHtml(g.name) + '</span>' +
        '<button class="sa-chip-remove" data-goal-index="' + i + '" type="button" aria-label="Remove ' + escapeHtml(g.name) + '">' +
          '<i class="fas fa-xmark"></i>' +
        '</button>' +
      '</span>'
    ).join("");

    // Remove handlers with goal promotion logic
    chipsEl.querySelectorAll(".sa-chip-remove").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(btn.dataset.goalIndex, 10);
        selectedGoals.splice(idx, 1);
        // If we removed first goal and second exists, it auto-promotes (array shifts)
        // Also sync the primary dropdown to reflect the new state
        const goalSelect = $("#sa-goal-select");
        if (goalSelect) {
          goalSelect.value = selectedGoals[0]?.id || "";
        }
        // Hide second goal select if back to <=1 goals
        if (selectedGoals.length < 2) {
          const secondSelect = $("#sa-second-goal-select");
          if (secondSelect) secondSelect.style.display = "none";
          const goalSelect2 = $("#sa-goal-select-2");
          if (goalSelect2) goalSelect2.value = "";
        }
        renderGoalChips();
        showSecondGoalDisclosure();
        renderDropdown($("#sa-supp-search")?.value || "");
        updateValidation();
      });
    });
  }

  // ── Smart Sort Toggle ──────────────────────────────────────────
  function initSmartSortToggle() {
    const toggle = $("#sa-smart-sort-toggle");
    if (!toggle) return;

    async function handleToggle() {
      smartSortEnabled = !smartSortEnabled;
      toggle.setAttribute("aria-checked", String(smartSortEnabled));
      const switchEl = $("#sa-toggle-switch");
      if (switchEl) switchEl.classList.toggle("on", smartSortEnabled);

      if (smartSortEnabled) {
        await loadRelevanceData();
      }
      // Re-render dropdown with new sorting mode
      renderDropdown($("#sa-supp-search")?.value || "");
      updateValidation();
    }

    toggle.addEventListener("click", handleToggle);
    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    });
  }

  // ── Depth Selector ─────────────────────────────────────────────
  function initDepthSelector() {
    const radios = $$('input[name="sa-depth"]');
    radios.forEach(radio => {
      radio.addEventListener("change", () => {
        selectedDepth = radio.value;
      });
    });
  }

  // ── Validation ─────────────────────────────────────────────────
  function updateValidation() {
    const btn = $("#sa-analyze-btn");
    const hint = $("#sa-analyze-hint");
    const suppHint = $("#sa-supp-hint");
    if (!btn) return;

    const issues = [];
    if (selectedSupplements.length < MIN_SUPPLEMENTS) {
      issues.push(`Select at least ${MIN_SUPPLEMENTS} supplements`);
    }
    if (selectedGoals.length === 0) {
      issues.push("Choose a health goal");
    }

    if (currentCredits && currentCredits.remaining <= 0) {
      issues.push("No credits remaining this month");
    }

    // Compute credit cost: 1 base + 1 surcharge for second goal
    const goalCount = selectedGoals.length;
    const totalCreditCost = 1 + (goalCount > 1 ? 1 : 0);

    // Check if enough credits for the selected configuration
    if (currentCredits && currentCredits.remaining > 0 && currentCredits.remaining < totalCreditCost) {
      issues.push(`Need ${totalCreditCost} credits (only ${currentCredits.remaining} remaining)`);
    }

    btn.disabled = issues.length > 0 || isAnalyzing;

    if (hint) {
      if (issues.length > 0 && selectedSupplements.length > 0) {
        hint.textContent = issues.join(" · ");
        hint.classList.remove("sa-analyze-hint--cost");
        hint.style.display = "block";
      } else if (issues.length === 0 && selectedGoals.length > 0) {
        // Show credit cost when form is valid
        const costText = totalCreditCost === 1
          ? "1 credit"
          : `${totalCreditCost} credits (includes +1 for second goal)`;
        hint.textContent = `Costs ${costText}`;
        hint.classList.add("sa-analyze-hint--cost");
        hint.style.display = "block";
      } else {
        hint.classList.remove("sa-analyze-hint--cost");
        hint.style.display = "none";
      }
    }

    if (suppHint) {
      if (selectedSupplements.length >= MIN_SUPPLEMENTS) {
        suppHint.textContent = selectedSupplements.length >= MAX_SUPPLEMENTS
          ? `Maximum ${MAX_SUPPLEMENTS} supplements reached`
          : `${selectedSupplements.length} supplements selected`;
        suppHint.classList.add("sa-field-hint--valid");
      } else {
        suppHint.textContent = `Select at least ${MIN_SUPPLEMENTS} supplements to analyze`;
        suppHint.classList.remove("sa-field-hint--valid");
      }
    }
  }

  // ── Analyze Button ─────────────────────────────────────────────
  function initAnalyzeButton() {
    const btn = $("#sa-analyze-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      if (btn.disabled || isAnalyzing) return;
      runAnalysis();
    });
  }

  async function runAnalysis() {
    if (isAnalyzing) return;
    isAnalyzing = true;

    const btn = $("#sa-analyze-btn");
    const btnText = btn?.querySelector(".sa-analyze-btn-text");
    const btnLoading = btn?.querySelector(".sa-analyze-btn-loading");
    const resultsPanel = $("#sa-results-panel");
    const resultsContent = $("#sa-results-content");

    // Show loading state
    if (btn) btn.disabled = true;
    if (btnText) btnText.style.display = "none";
    if (btnLoading) btnLoading.style.display = "inline-flex";
    if (resultsPanel) {
      resultsPanel.style.display = "block";
      resultsContent.innerHTML = `
        <div class="sa-analyzing-state">
          <div class="sa-analyzing-animation">
            <div class="sa-spinner"></div>
          </div>
          <p class="sa-analyzing-text">Analyzing your stack with AI...</p>
          <p class="sa-analyzing-subtext">Evaluating synergies, mechanisms, and safety across ${selectedSupplements.length} supplements</p>
        </div>
      `;
      resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Track in PostHog
    trackEvent("stack_analyzer_run", {
      supplement_count: selectedSupplements.length,
      health_goals: selectedGoals.map(g => g.id),
      goal_count: selectedGoals.length,
      depth: selectedDepth,
    });

    try {
      // Build args matching Convex action schema
      const args = {
        supplements: selectedSupplements.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          evidenceTier: s.evidenceTier,
          dosageRange: s.dosageRange,
          mechanisms: s.mechanisms || [],
        })),
        healthGoals: selectedGoals.map(g => ({ id: g.id, name: g.name })),
        depth: selectedDepth,
      };

      const result = await window.SupplementDB.action("stackAnalyzer:analyzeStack", args);

      // Render results
      renderResults(result);

      // Refresh credits and history
      loadCredits();
      loadHistory();

      trackEvent("stack_analyzer_success", {
        score: result.analysis?.goals?.[0]?.overallScore ?? result.analysis?.overallScore,
        evidence_strength: result.analysis?.goals?.[0]?.evidenceStrength ?? result.analysis?.evidenceStrength,
        goal_count: selectedGoals.length,
        tokens_input: result.tokensUsed?.input,
        tokens_output: result.tokensUsed?.output,
      });

      // Fire dedicated dual-goal event
      if (selectedGoals.length > 1) {
        trackEvent("stack_analyzer_dual_goal", {
          goal1_id: selectedGoals[0].id,
          goal2_id: selectedGoals[1].id,
          depth: selectedDepth,
        });
      }
    } catch (err) {
      const msg = err?.message || "Analysis failed. Please try again.";
      if (resultsContent) {
        resultsContent.innerHTML = `
          <div class="sa-error-state">
            <div class="sa-error-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <h3 class="sa-error-title">Analysis Error</h3>
            <p class="sa-error-message">${escapeHtml(msg)}</p>
            <button class="sa-btn-secondary" id="sa-retry-btn">
              <i class="fas fa-rotate-right"></i> Try Again
            </button>
          </div>
        `;
        $("#sa-retry-btn")?.addEventListener("click", () => {
          isAnalyzing = false;
          runAnalysis();
        });
      }

      trackEvent("stack_analyzer_error", { error: msg });
    } finally {
      isAnalyzing = false;
      if (btnText) btnText.style.display = "inline-flex";
      if (btnLoading) btnLoading.style.display = "none";
      updateValidation();
    }
  }

  // ── Results Rendering ──────────────────────────────────────────
  function normalizeAnalysisResult(analysis, goalsMeta) {
    if (analysis.goals && Array.isArray(analysis.goals)) {
      return analysis; // Already in new format
    }
    // Legacy single-goal format — wrap into goals[0]
    const meta = goalsMeta?.[0] || {};
    return {
      ...analysis,
      goals: [{
        goalId: meta.id || "unknown",
        goalName: meta.name || "Unknown Goal",
        overallScore: analysis.overallScore,
        evidenceStrength: analysis.evidenceStrength,
        stackSummary: analysis.stackSummary,
        mechanismCoverage: analysis.mechanismCoverage || [],
      }],
    };
  }

  function renderResults(result) {
    const content = $("#sa-results-content");
    const panel = $("#sa-results-panel");
    if (!content || !panel) return;

    const raw = result.analysis;
    if (!raw) {
      content.innerHTML = '<p class="sa-text-muted">No analysis data returned.</p>';
      return;
    }

    panel.style.display = "block";
    const goalsMeta = selectedGoals.map(g => ({ id: g.id, name: g.name }));
    const a = normalizeAnalysisResult(raw, goalsMeta);
    const isDualGoal = a.goals.length > 1;

    if (isDualGoal) {
      renderDualGoalResults(content, a, result);
    } else {
      renderSingleGoalResults(content, a.goals[0], a, result);
    }

    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderSingleGoalResults(content, goal, shared, result) {
    const scoreColor = getScoreColor(goal.overallScore);
    const evidenceBadge = getEvidenceBadge(goal.evidenceStrength);

    content.innerHTML = `
      <!-- Export Buttons -->
      <div class="sa-export-bar">
        <div class="sa-export-btn-group">
          <button class="sa-export-btn" id="sa-copy-btn" title="Copy results">
            <i class="fas fa-copy"></i> Copy
            <div class="sa-copy-dropdown" id="sa-copy-dropdown" style="display:none">
              <button class="sa-copy-option" data-format="markdown">Copy as Markdown</button>
              <button class="sa-copy-option" data-format="text">Copy as Text</button>
            </div>
          </button>
          <button class="sa-export-btn" id="sa-email-btn" title="Email results">
            <i class="fas fa-envelope"></i> Email
          </button>
        </div>
      </div>

      <!-- Score Header -->
      <div class="sa-result-header">
        <div class="sa-score-ring" style="--score-color: ${scoreColor}; --score-pct: ${goal.overallScore}">
          <svg viewBox="0 0 120 120" class="sa-score-svg">
            <circle cx="60" cy="60" r="52" class="sa-score-track" />
            <circle cx="60" cy="60" r="52" class="sa-score-fill"
              style="stroke-dasharray: ${(goal.overallScore / 100) * 326.73} 326.73; stroke: ${scoreColor}" />
          </svg>
          <div class="sa-score-value">${goal.overallScore}</div>
          <div class="sa-score-label">Overall</div>
        </div>
        <div class="sa-result-summary">
          <div class="sa-result-badges">
            ${evidenceBadge}
            <span class="sa-badge sa-badge--depth">${capitalize(selectedDepth)} Analysis</span>
            <span class="sa-badge sa-badge--goal">${escapeHtml(goal.goalName || selectedGoals.map(g => g.name).join(" + ") || "")}</span>
          </div>
          <p class="sa-result-text">${escapeHtml(goal.stackSummary || "")}</p>
        </div>
      </div>

      <!-- Shared Sections -->
      ${shared.synergyAnalysis?.length ? renderSynergySection(shared.synergyAnalysis) : ""}
      ${goal.mechanismCoverage?.length ? renderMechanismSection(goal.mechanismCoverage) : ""}
      ${shared.safetyFlags?.length ? renderSafetySection(shared.safetyFlags) : ""}
      ${shared.dosageProtocol?.length ? renderDosageSection(shared.dosageProtocol) : ""}
      ${shared.suggestedAdditions?.length || shared.suggestedRemovals?.length ? renderSuggestionsSection(shared.suggestedAdditions, shared.suggestedRemovals) : ""}

      <!-- Meta Footer -->
      <div class="sa-result-meta">
        <span><i class="fas fa-microchip"></i> ${escapeHtml(result.model || "claude-haiku-4-5")}</span>
        <span><i class="fas fa-coins"></i> ${result.creditsRemaining ?? "—"} credits remaining</span>
        <span><i class="fas fa-arrow-right-arrow-left"></i> ${(result.tokensUsed?.input || 0) + (result.tokensUsed?.output || 0)} tokens</span>
      </div>
    `;
  }

  function renderDualGoalResults(content, analysis, result) {
    const g1 = analysis.goals[0];
    const g2 = analysis.goals[1];
    const compat = analysis.multiGoalCompatibility;

    content.innerHTML = `
      <!-- Export Buttons -->
      <div class="sa-export-bar">
        <div class="sa-export-btn-group">
          <button class="sa-export-btn" id="sa-copy-btn" title="Copy results">
            <i class="fas fa-copy"></i> Copy
            <div class="sa-copy-dropdown" id="sa-copy-dropdown" style="display:none">
              <button class="sa-copy-option" data-format="markdown">Copy as Markdown</button>
              <button class="sa-copy-option" data-format="text">Copy as Text</button>
            </div>
          </button>
          <button class="sa-export-btn" id="sa-email-btn" title="Email results">
            <i class="fas fa-envelope"></i> Email
          </button>
        </div>
      </div>

      <!-- Dual Score Header -->
      <div class="sa-dual-scores">
        ${renderScoreDonut(g1)}
        <div class="sa-vs-divider">vs</div>
        ${renderScoreDonut(g2)}
      </div>

      <!-- Tab Bar -->
      <div class="sa-tab-bar" role="tablist">
        <button class="sa-tab active" role="tab" aria-selected="true" aria-controls="sa-tab-combined" data-tab="combined">Combined</button>
        <button class="sa-tab" role="tab" aria-selected="false" aria-controls="sa-tab-goal-0" data-tab="goal-0">${escapeHtml(g1.goalName)}</button>
        <button class="sa-tab" role="tab" aria-selected="false" aria-controls="sa-tab-goal-1" data-tab="goal-1">${escapeHtml(g2.goalName)}</button>
      </div>

      <!-- Combined Tab -->
      <div class="sa-tab-panel active" id="sa-tab-combined" role="tabpanel">
        ${compat ? renderCompatibilityCard(compat) : ""}
        ${analysis.synergyAnalysis?.length ? renderSynergySection(analysis.synergyAnalysis) : ""}
        ${analysis.safetyFlags?.length ? renderSafetySection(analysis.safetyFlags) : ""}
        ${analysis.dosageProtocol?.length ? renderDosageSection(analysis.dosageProtocol) : ""}
        ${analysis.suggestedAdditions?.length || analysis.suggestedRemovals?.length ? renderSuggestionsSection(analysis.suggestedAdditions, analysis.suggestedRemovals) : ""}
      </div>

      <!-- Goal 1 Tab -->
      <div class="sa-tab-panel" id="sa-tab-goal-0" role="tabpanel" style="display:none">
        ${renderGoalTabContent(g1)}
      </div>

      <!-- Goal 2 Tab -->
      <div class="sa-tab-panel" id="sa-tab-goal-1" role="tabpanel" style="display:none">
        ${renderGoalTabContent(g2)}
      </div>

      <!-- Meta Footer -->
      <div class="sa-result-meta">
        <span><i class="fas fa-microchip"></i> ${escapeHtml(result.model || "claude-haiku-4-5")}</span>
        <span><i class="fas fa-coins"></i> ${result.creditsRemaining ?? "—"} credits remaining</span>
        <span><i class="fas fa-arrow-right-arrow-left"></i> ${(result.tokensUsed?.input || 0) + (result.tokensUsed?.output || 0)} tokens</span>
      </div>
    `;

    initTabSwitching();
  }

  function renderScoreDonut(goal) {
    const scoreColor = getScoreColor(goal.overallScore);
    return `
      <div class="sa-goal-score">
        <div class="sa-score-ring sa-score-ring--small" style="--score-color: ${scoreColor}; --score-pct: ${goal.overallScore}">
          <svg viewBox="0 0 80 80" class="sa-score-svg">
            <circle cx="40" cy="40" r="34" class="sa-score-track" />
            <circle cx="40" cy="40" r="34" class="sa-score-fill" style="stroke-dasharray: ${(goal.overallScore / 100) * 213.63} 213.63; stroke: ${scoreColor}" />
          </svg>
          <div class="sa-score-value">${goal.overallScore}</div>
        </div>
        <div class="sa-goal-score-label">${escapeHtml(goal.goalName)}</div>
      </div>
    `;
  }

  function renderCompatibilityCard(compat) {
    return `
      <div class="sa-compat-card">
        <h3 class="sa-result-section-title"><i class="fas fa-link"></i> Multi-Goal Compatibility</h3>
        <p class="sa-compat-note">${escapeHtml(compat.compatibilityNote || "")}</p>
        ${compat.sharedMechanisms?.length ? `
          <div class="sa-compat-section">
            <h4><i class="fas fa-check-double"></i> Shared Mechanisms</h4>
            <div class="sa-compat-tags">${compat.sharedMechanisms.map(m => '<span class="sa-compat-tag sa-compat-tag--shared">' + escapeHtml(m) + '</span>').join("")}</div>
          </div>
        ` : ""}
        ${compat.conflicts?.length ? `
          <div class="sa-compat-section">
            <h4><i class="fas fa-exclamation-triangle"></i> Conflicts</h4>
            <div class="sa-compat-tags">${compat.conflicts.map(c => '<span class="sa-compat-tag sa-compat-tag--conflict">' + escapeHtml(c) + '</span>').join("")}</div>
          </div>
        ` : ""}
      </div>
    `;
  }

  function renderGoalTabContent(goal) {
    const evidenceBadge = getEvidenceBadge(goal.evidenceStrength);
    return `
      <div class="sa-goal-tab-content">
        <div class="sa-result-summary">
          ${evidenceBadge}
          <p class="sa-result-text">${escapeHtml(goal.stackSummary || "")}</p>
        </div>
        ${goal.mechanismCoverage?.length ? renderMechanismSection(goal.mechanismCoverage) : ""}
      </div>
    `;
  }

  function initTabSwitching() {
    const tabs = $$(".sa-tab");
    const panels = $$(".sa-tab-panel");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
        panels.forEach(p => { p.classList.remove("active"); p.style.display = "none"; });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        const targetId = "sa-tab-" + tab.dataset.tab;
        const panel = document.getElementById(targetId);
        if (panel) { panel.classList.add("active"); panel.style.display = "block"; }
      });

      // Keyboard: arrow keys between tabs
      tab.addEventListener("keydown", (e) => {
        const tabList = Array.from(tabs);
        const idx = tabList.indexOf(tab);
        if (e.key === "ArrowRight" && idx < tabList.length - 1) {
          e.preventDefault(); tabList[idx + 1].focus(); tabList[idx + 1].click();
        }
        if (e.key === "ArrowLeft" && idx > 0) {
          e.preventDefault(); tabList[idx - 1].focus(); tabList[idx - 1].click();
        }
      });
    });
  }

  function renderSynergySection(synergies) {
    const rows = synergies.map(s => {
      const typeClass = `sa-synergy-${s.type}`;
      const typeIcon = {
        synergistic: "fa-arrow-up-right-dots",
        redundant: "fa-clone",
        antagonistic: "fa-triangle-exclamation",
        neutral: "fa-minus",
      }[s.type] || "fa-minus";

      return `
        <div class="sa-synergy-row ${typeClass}">
          <div class="sa-synergy-pair">
            <span class="sa-synergy-name">${escapeHtml(s.pair?.[0] || "")}</span>
            <i class="fas fa-arrows-left-right sa-synergy-arrow"></i>
            <span class="sa-synergy-name">${escapeHtml(s.pair?.[1] || "")}</span>
          </div>
          <div class="sa-synergy-info">
            <span class="sa-synergy-badge"><i class="fas ${typeIcon}"></i> ${capitalize(s.type)}</span>
            <p class="sa-synergy-explain">${escapeHtml(s.explanation || "")}</p>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="sa-result-section">
        <h3 class="sa-result-section-title">
          <i class="fas fa-link"></i> Synergy Analysis
        </h3>
        <div class="sa-synergy-list">${rows}</div>
      </div>
    `;
  }

  function renderMechanismSection(mechanisms) {
    const rows = mechanisms.map(m => {
      const strengthClass = `sa-mech-${m.strength}`;
      const strengthLabel = {
        "well-covered": "Well Covered",
        "partially-covered": "Partial",
        "gap": "Gap",
      }[m.strength] || m.strength;

      const pct = m.strength === "well-covered" ? 100 : m.strength === "partially-covered" ? 60 : 20;

      return `
        <div class="sa-mech-row ${strengthClass}">
          <div class="sa-mech-info">
            <span class="sa-mech-name">${escapeHtml(m.mechanism)}</span>
            <span class="sa-mech-covered">
              ${(m.coveredBy || []).map(n => `<span class="sa-mech-pill">${escapeHtml(n)}</span>`).join("")}
            </span>
          </div>
          <div class="sa-mech-bar-wrap">
            <div class="sa-mech-bar">
              <div class="sa-mech-bar-fill" style="width: ${pct}%"></div>
            </div>
            <span class="sa-mech-strength">${strengthLabel}</span>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="sa-result-section">
        <h3 class="sa-result-section-title">
          <i class="fas fa-sitemap"></i> Mechanism Coverage
        </h3>
        <div class="sa-mech-list">${rows}</div>
      </div>
    `;
  }

  function renderSafetySection(flags) {
    const rows = flags.map(f => {
      const sevIcon = {
        critical: "fa-circle-xmark",
        warning: "fa-triangle-exclamation",
        caution: "fa-circle-info",
      }[f.severity] || "fa-circle-info";

      return `
        <div class="sa-safety-flag sa-safety-${f.severity}">
          <div class="sa-safety-icon"><i class="fas ${sevIcon}"></i></div>
          <div class="sa-safety-content">
            <div class="sa-safety-header">
              <span class="sa-safety-severity">${capitalize(f.severity)}</span>
              <span class="sa-safety-supps">${(f.supplements || []).map(n => escapeHtml(n)).join(", ")}</span>
            </div>
            <p class="sa-safety-desc">${escapeHtml(f.description || "")}</p>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="sa-result-section">
        <h3 class="sa-result-section-title">
          <i class="fas fa-shield-halved"></i> Safety Flags
        </h3>
        <div class="sa-safety-list">${rows}</div>
      </div>
    `;
  }

  function renderDosageSection(protocol) {
    const rows = protocol.map(p => `
      <tr>
        <td class="sa-dose-name">${escapeHtml(p.supplement)}</td>
        <td>${escapeHtml(p.recommendedDose)}</td>
        <td>${escapeHtml(p.timing)}</td>
        <td>${p.withFood ? '<i class="fas fa-utensils" title="Take with food"></i> Yes' : '<i class="fas fa-glass-water" title="Take on empty stomach"></i> No'}</td>
        <td class="sa-dose-notes">${escapeHtml(p.notes || "")}</td>
      </tr>
    `).join("");

    return `
      <div class="sa-result-section">
        <h3 class="sa-result-section-title">
          <i class="fas fa-prescription-bottle-medical"></i> Dosage Protocol
        </h3>
        <div class="sa-dosage-table-wrap">
          <table class="sa-dosage-table">
            <thead>
              <tr>
                <th>Supplement</th>
                <th>Dose</th>
                <th>Timing</th>
                <th>With Food</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSuggestionsSection(additions, removals) {
    let html = `<div class="sa-result-section">
      <h3 class="sa-result-section-title">
        <i class="fas fa-lightbulb"></i> Optimization Suggestions
      </h3>
      <div class="sa-suggestions-grid">`;

    if (additions?.length) {
      html += `
        <div class="sa-suggestion-group sa-suggestion-add">
          <h4><i class="fas fa-plus-circle"></i> Consider Adding</h4>
          ${additions.map(a => `
            <div class="sa-suggestion-card">
              <div class="sa-suggestion-header">
                <span class="sa-suggestion-name">${escapeHtml(a.name)}</span>
                <span class="sa-suggestion-tier">Tier ${a.evidenceTier}</span>
              </div>
              <p class="sa-suggestion-reason">${escapeHtml(a.reason)}</p>
            </div>
          `).join("")}
        </div>
      `;
    }

    if (removals?.length) {
      html += `
        <div class="sa-suggestion-group sa-suggestion-remove">
          <h4><i class="fas fa-minus-circle"></i> Consider Removing</h4>
          ${removals.map(r => `
            <div class="sa-suggestion-card">
              <div class="sa-suggestion-header">
                <span class="sa-suggestion-name">${escapeHtml(r.name)}</span>
              </div>
              <p class="sa-suggestion-reason">${escapeHtml(r.reason)}</p>
            </div>
          `).join("")}
        </div>
      `;
    }

    html += `</div></div>`;
    return html;
  }

  // ── Credits ────────────────────────────────────────────────────
  async function loadCredits() {
    try {
      const credits = await window.SupplementDB.query("analysisCredits:getMyCredits");
      currentCredits = credits;
      renderCredits(credits);
      updateValidation();
    } catch (err) {
      console.warn("[StackAnalyzer] Failed to load credits:", err);
    }
  }

  function renderCredits(credits) {
    if (!credits) return;

    const countEl = $("#sa-credit-count");
    const fillEl = $("#sa-credit-fill");
    const tierEl = $("#sa-credit-tier");
    const barEl = $("#sa-credit-bar");

    if (countEl) {
      countEl.textContent = `${credits.remaining} / ${credits.monthlyLimit}`;
    }

    if (fillEl) {
      const pct = credits.monthlyLimit > 0
        ? Math.round((credits.remaining / credits.monthlyLimit) * 100)
        : 0;
      fillEl.style.width = pct + "%";

      // Color states
      fillEl.classList.toggle("sa-credit-fill--low", pct <= 20);
      fillEl.classList.toggle("sa-credit-fill--medium", pct > 20 && pct <= 50);
    }

    if (tierEl) {
      const isSubscriber = credits.tier === "subscriber";
      tierEl.innerHTML = isSubscriber
        ? '<i class="fas fa-crown"></i> Pro'
        : '<a href="/pricing.html" class="sa-upgrade-link">Upgrade</a>';
    }

    if (barEl) {
      barEl.style.display = "block";
    }
  }

  // ── History ────────────────────────────────────────────────────
  async function loadHistory() {
    try {
      const analyses = await window.SupplementDB.query("analysisCredits:getMyAnalyses", { limit: 5 });
      renderHistory(analyses || []);
    } catch (err) {
      console.warn("[StackAnalyzer] Failed to load history:", err);
    }
  }

  function renderHistory(analyses) {
    const panel = $("#sa-history-panel");
    const content = $("#sa-history-content");
    if (!panel || !content) return;

    if (analyses.length === 0) {
      panel.style.display = "none";
      return;
    }

    panel.style.display = "block";

    const rows = analyses.map(a => {
      const score = a.result?.goals?.[0]?.overallScore ?? a.result?.overallScore ?? "—";
      const scoreColor = typeof score === "number" ? getScoreColor(score) : "var(--text-muted)";
      const goalIds = a.healthGoals || (a.healthGoal ? [a.healthGoal] : []);
      const goalNames = goalIds.map(id => HEALTH_GOALS.find(g => g.id === id)?.name || id).join(" + ");
      const suppNames = (a.supplements || []).map(s => s.name).join(", ");
      const date = a.timestamp ? new Date(a.timestamp).toLocaleDateString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
      }) : "";

      return `
        <div class="sa-history-row">
          <div class="sa-history-score" style="color: ${scoreColor}">${score}</div>
          <div class="sa-history-info">
            <div class="sa-history-supps">${escapeHtml(suppNames)}</div>
            <div class="sa-history-meta">
              <span>${escapeHtml(goalNames)}</span>
              <span>${capitalize(a.analysisDepth || "standard")}</span>
              <span>${date}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    content.innerHTML = `<div class="sa-history-list">${rows}</div>`;
  }

  // ── Helpers ────────────────────────────────────────────────────
  function getScoreColor(score) {
    if (score >= 85) return "#22c55e";
    if (score >= 70) return "#84cc16";
    if (score >= 50) return "#eab308";
    if (score >= 30) return "#f97316";
    return "#ef4444";
  }

  function getEvidenceBadge(strength) {
    const map = {
      strong: { class: "sa-badge--strong", icon: "fa-circle-check", label: "Strong Evidence" },
      moderate: { class: "sa-badge--moderate", icon: "fa-circle-half-stroke", label: "Moderate Evidence" },
      limited: { class: "sa-badge--limited", icon: "fa-circle-question", label: "Limited Evidence" },
      insufficient: { class: "sa-badge--insufficient", icon: "fa-circle-exclamation", label: "Insufficient Evidence" },
    };
    const b = map[strength] || map.moderate;
    return `<span class="sa-badge ${b.class}"><i class="fas ${b.icon}"></i> ${b.label}</span>`;
  }

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function trackEvent(event, props) {
    try {
      if (typeof posthog !== "undefined") {
        posthog.capture(event, props);
      }
    } catch {
      // Analytics should never break the page
    }
  }

  // ── Initialize ─────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
