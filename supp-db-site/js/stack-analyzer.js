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
  let selectedGoal = null;       // Health goal object
  let selectedDepth = "standard"; // "quick" | "standard" | "deep"
  let isAnalyzing = false;
  let currentCredits = null;

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
    checkCreditPurchaseParams();
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
          <div class="sa-credit-actions">
            <span class="sa-credit-tier" id="sa-credit-tier"></span>
            <button class="sa-buy-credits-btn" id="sa-buy-credits-btn" title="Buy more analysis credits">
              <i class="fas fa-coins"></i> Buy Credits
            </button>
          </div>
        </div>
        <div class="sa-credit-breakdown" id="sa-credit-breakdown"></div>
      </div>

      <!-- Buy Credits Modal -->
      <div class="sa-modal-overlay" id="sa-credits-modal" style="display:none">
        <div class="sa-modal">
          <div class="sa-modal-header">
            <h3><i class="fas fa-coins"></i> Buy Analysis Credits</h3>
            <button class="sa-modal-close" id="sa-modal-close"><i class="fas fa-times"></i></button>
          </div>
          <p class="sa-modal-desc">Credits never expire. Use them for any analysis depth.</p>
          <div class="sa-credit-cost-info">
            <span class="sa-cost-item"><i class="fas fa-bolt"></i> Quick = 1 credit</span>
            <span class="sa-cost-item"><i class="fas fa-flask"></i> Standard = 2 credits</span>
            <span class="sa-cost-item"><i class="fas fa-microscope"></i> Deep = 3 credits</span>
          </div>
          <div class="sa-packs-grid" id="sa-packs-grid">
            <!-- Pack cards rendered by JS -->
          </div>
          <p class="sa-modal-footer-text">
            <i class="fas fa-lock"></i> Secure checkout via Stripe. Credits are added instantly after payment.
          </p>
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

        <!-- Health Goal Select -->
        <div class="sa-field">
          <label class="sa-field-label" for="sa-goal-select">Health Goal</label>
          <select class="sa-goal-select" id="sa-goal-select">
            <option value="">Choose a health goal...</option>
            ${HEALTH_GOALS.map(g => `<option value="${g.id}">${g.name}</option>`).join("")}
          </select>
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

  function renderDropdown(filter) {
    const dropdown = $("#sa-supp-dropdown");
    if (!dropdown) return;

    const query = filter.toLowerCase().trim();
    const selectedIds = new Set(selectedSupplements.map(s => s.id));
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
        html += `
          <div class="sa-dropdown-item" data-supp-id="${s.id}" role="button" tabindex="0">
            <span class="tier-dot tier-${s.evidenceTier}"></span>
            <span class="sa-dropdown-item-name">${escapeHtml(s.name)}</span>
            <span class="sa-dropdown-item-tier">T${s.evidenceTier}</span>
          </div>
        `;
      }
    }

    if (!html) {
      html = `<div class="sa-dropdown-empty">No supplements match your search</div>`;
    }

    dropdown.innerHTML = html;

    // Attach click handlers
    dropdown.querySelectorAll(".sa-dropdown-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(btn.dataset.suppId, 10);
        addSupplement(id);
        const searchInput = $("#sa-supp-search");
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
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
      selectedGoal = val ? HEALTH_GOALS.find(g => g.id === val) : null;
      updateValidation();
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
    if (!selectedGoal) {
      issues.push("Choose a health goal");
    }

    const hasCredits = currentCredits === null || (currentCredits && currentCredits.remaining > 0);
    if (currentCredits && currentCredits.remaining <= 0) {
      issues.push("No credits remaining this month");
    }

    btn.disabled = issues.length > 0 || isAnalyzing;

    if (hint) {
      if (issues.length > 0 && selectedSupplements.length > 0) {
        hint.textContent = issues.join(" · ");
        hint.style.display = "block";
      } else {
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
      health_goal: selectedGoal?.id,
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
        healthGoal: {
          id: selectedGoal.id,
          name: selectedGoal.name,
        },
        depth: selectedDepth,
      };

      const result = await window.SupplementDB.action("stackAnalyzer:analyzeStack", args);

      // Render results
      renderResults(result);

      // Refresh credits and history
      loadCredits();
      loadHistory();

      trackEvent("stack_analyzer_success", {
        score: result.analysis?.overallScore,
        evidence_strength: result.analysis?.evidenceStrength,
        tokens_input: result.tokensUsed?.input,
        tokens_output: result.tokensUsed?.output,
      });
    } catch (err) {
      // ConvexError sends data in err.data; regular Error sends err.message
      const msg = err?.data || err?.message || "Analysis failed. Please try again.";
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

  // ── Score Interpretation Helpers ────────────────────────────────
  function getScoreVerdict(score) {
    if (score >= 85) return { label: "Excellent", desc: "This is a well-optimized stack with strong evidence-backed synergies and minimal safety concerns.", emoji: "🏆" };
    if (score >= 70) return { label: "Good", desc: "A solid foundation with meaningful synergies. Some optimizations could improve efficacy or reduce redundancy.", emoji: "✅" };
    if (score >= 50) return { label: "Adequate", desc: "This stack covers some bases, but has notable gaps in mechanism coverage or includes redundant supplements.", emoji: "⚠️" };
    if (score >= 30) return { label: "Needs Work", desc: "Significant gaps, safety concerns, or weak evidence. Consider the optimization suggestions below.", emoji: "🔧" };
    return { label: "Poor", desc: "Major issues detected — conflicting supplements, critical safety flags, or insufficient evidence for this combination.", emoji: "⛔" };
  }

  function getEvidenceExplanation(strength) {
    const map = {
      strong: "Backed by multiple large RCTs, systematic reviews, or meta-analyses. High confidence in the findings.",
      moderate: "Supported by several randomized trials with moderate sample sizes and generally consistent results.",
      limited: "Based on few small trials, preliminary studies, or mostly animal/in-vitro data. Use with appropriate caution.",
      insufficient: "Minimal controlled evidence available. Largely anecdotal or theoretical at this stage.",
    };
    return map[strength] || map.moderate;
  }

  function countSynergyTypes(synergies) {
    const counts = { synergistic: 0, redundant: 0, antagonistic: 0, neutral: 0 };
    (synergies || []).forEach(s => { if (counts[s.type] !== undefined) counts[s.type]++; });
    return counts;
  }

  function categorizeTiming(timing) {
    const t = (timing || "").toLowerCase();
    if (t.includes("morning") || t.includes("breakfast") || t.includes("am") || t.includes("wake")) return "morning";
    if (t.includes("afternoon") || t.includes("lunch") || t.includes("midday") || t.includes("noon")) return "afternoon";
    if (t.includes("evening") || t.includes("dinner") || t.includes("night") || t.includes("bed") || t.includes("pm") || t.includes("sleep")) return "evening";
    if (t.includes("pre-workout") || t.includes("pre workout") || t.includes("before exercise")) return "pre-workout";
    if (t.includes("post-workout") || t.includes("post workout") || t.includes("after exercise")) return "post-workout";
    return "anytime";
  }

  // ── Results Rendering ──────────────────────────────────────────
  function renderResults(result) {
    const content = $("#sa-results-content");
    const panel = $("#sa-results-panel");
    if (!content || !panel) return;

    const a = result.analysis;
    if (!a) {
      content.innerHTML = `<p class="sa-text-muted">No analysis data returned.</p>`;
      return;
    }

    panel.style.display = "block";

    const scoreColor = getScoreColor(a.overallScore);
    const evidenceBadge = getEvidenceBadge(a.evidenceStrength);
    const verdict = getScoreVerdict(a.overallScore);
    const evidenceExplanation = getEvidenceExplanation(a.evidenceStrength);
    const synCounts = countSynergyTypes(a.synergyAnalysis);
    const mechWell = (a.mechanismCoverage || []).filter(m => m.strength === "well-covered").length;
    const mechTotal = (a.mechanismCoverage || []).length;
    const safetyCount = (a.safetyFlags || []).length;
    const criticalCount = (a.safetyFlags || []).filter(f => f.severity === "critical").length;

    content.innerHTML = `
      <!-- ═══ SCORE HERO ═══ -->
      <div class="sa-result-header sa-reveal" style="--reveal-delay: 0">
        <div class="sa-score-hero">
          <div class="sa-score-ring" style="--score-color: ${scoreColor}; --score-pct: ${a.overallScore}">
            <svg viewBox="0 0 120 120" class="sa-score-svg">
              <circle cx="60" cy="60" r="52" class="sa-score-track" />
              <circle cx="60" cy="60" r="52" class="sa-score-fill"
                style="stroke-dasharray: ${(a.overallScore / 100) * 326.73} 326.73; stroke: ${scoreColor}" />
            </svg>
            <div class="sa-score-value">
              <span class="sa-score-number" data-target="${a.overallScore}">0</span>
              <span class="sa-score-max">/100</span>
            </div>
          </div>
          <div class="sa-score-verdict" style="--verdict-color: ${scoreColor}">
            <span class="sa-verdict-emoji">${verdict.emoji}</span>
            <span class="sa-verdict-label">${verdict.label}</span>
          </div>
        </div>

        <div class="sa-result-summary">
          <div class="sa-result-badges">
            ${evidenceBadge}
            <span class="sa-badge sa-badge--depth"><i class="fas fa-layer-group"></i> ${capitalize(selectedDepth)}</span>
            <span class="sa-badge sa-badge--goal"><i class="fas fa-bullseye"></i> ${escapeHtml(selectedGoal?.name || "")}</span>
          </div>
          <p class="sa-result-text">${escapeHtml(a.stackSummary || "")}</p>
          <div class="sa-verdict-explanation">
            <p>${verdict.desc}</p>
          </div>
        </div>
      </div>

      <!-- ═══ QUICK STATS BAR ═══ -->
      <div class="sa-quick-stats sa-reveal" style="--reveal-delay: 1">
        <div class="sa-stat-card">
          <div class="sa-stat-icon sa-stat-synergy"><i class="fas fa-arrow-up-right-dots"></i></div>
          <div class="sa-stat-data">
            <span class="sa-stat-value">${synCounts.synergistic}</span>
            <span class="sa-stat-label">Synergies</span>
          </div>
        </div>
        <div class="sa-stat-card">
          <div class="sa-stat-icon sa-stat-redundant"><i class="fas fa-clone"></i></div>
          <div class="sa-stat-data">
            <span class="sa-stat-value">${synCounts.redundant}</span>
            <span class="sa-stat-label">Redundant</span>
          </div>
        </div>
        <div class="sa-stat-card">
          <div class="sa-stat-icon sa-stat-coverage"><i class="fas fa-dna"></i></div>
          <div class="sa-stat-data">
            <span class="sa-stat-value">${mechWell}/${mechTotal}</span>
            <span class="sa-stat-label">Covered</span>
          </div>
        </div>
        <div class="sa-stat-card">
          <div class="sa-stat-icon sa-stat-safety ${criticalCount > 0 ? 'sa-stat-critical' : ''}"><i class="fas fa-shield-halved"></i></div>
          <div class="sa-stat-data">
            <span class="sa-stat-value">${safetyCount}</span>
            <span class="sa-stat-label">Safety ${safetyCount === 1 ? 'Flag' : 'Flags'}</span>
          </div>
        </div>
      </div>

      <!-- ═══ SCORE CONTEXT BAND ═══ -->
      <div class="sa-score-context sa-reveal" style="--reveal-delay: 2">
        <div class="sa-context-title"><i class="fas fa-chart-bar"></i> Score Breakdown</div>
        <div class="sa-score-band">
          <div class="sa-band-segment sa-band-poor" style="width:29%"><span>Poor</span></div>
          <div class="sa-band-segment sa-band-needs" style="width:20%"><span>Needs Work</span></div>
          <div class="sa-band-segment sa-band-adequate" style="width:20%"><span>Adequate</span></div>
          <div class="sa-band-segment sa-band-good" style="width:15%"><span>Good</span></div>
          <div class="sa-band-segment sa-band-excellent" style="width:16%"><span>Excellent</span></div>
          <div class="sa-band-marker" style="left: ${a.overallScore}%">
            <div class="sa-band-marker-pip"></div>
            <div class="sa-band-marker-label">${a.overallScore}</div>
          </div>
        </div>
        <details class="sa-interpret-details">
          <summary><i class="fas fa-circle-question"></i> How is this score calculated?</summary>
          <div class="sa-interpret-content">
            <p>The score weighs four dimensions:</p>
            <ul>
              <li><strong>Evidence Quality (30%)</strong> — Are your supplements backed by RCTs, meta-analyses, or only preliminary data?</li>
              <li><strong>Synergy & Interactions (25%)</strong> — Do your supplements amplify each other's effects, or are some redundant or antagonistic?</li>
              <li><strong>Mechanism Coverage (25%)</strong> — Does your stack address the key biological pathways for your health goal?</li>
              <li><strong>Safety Profile (20%)</strong> — Are there known interactions, contraindications, or dosage concerns?</li>
            </ul>
          </div>
        </details>
      </div>

      <!-- ═══ EVIDENCE EXPLANATION ═══ -->
      <div class="sa-evidence-panel sa-reveal" style="--reveal-delay: 3">
        <div class="sa-evidence-header">
          <div class="sa-evidence-visual">
            ${renderEvidenceMeter(a.evidenceStrength)}
          </div>
          <div class="sa-evidence-text">
            <h4>Evidence: ${capitalize(a.evidenceStrength)}</h4>
            <p>${evidenceExplanation}</p>
          </div>
        </div>
      </div>

      <!-- ═══ SYNERGY NETWORK ═══ -->
      ${a.synergyAnalysis?.length ? renderSynergySection(a.synergyAnalysis) : ""}

      <!-- ═══ MECHANISM COVERAGE ═══ -->
      ${a.mechanismCoverage?.length ? renderMechanismSection(a.mechanismCoverage) : ""}

      <!-- ═══ SAFETY FLAGS ═══ -->
      ${a.safetyFlags?.length ? renderSafetySection(a.safetyFlags) : ""}

      <!-- ═══ DOSAGE TIMELINE ═══ -->
      ${a.dosageProtocol?.length ? renderDosageSection(a.dosageProtocol) : ""}

      <!-- ═══ OPTIMIZATION SUGGESTIONS ═══ -->
      ${a.suggestedAdditions?.length || a.suggestedRemovals?.length ? renderSuggestionsSection(a.suggestedAdditions, a.suggestedRemovals) : ""}

      <!-- ═══ META FOOTER ═══ -->
      <div class="sa-result-meta sa-reveal" style="--reveal-delay: 9">
        <span><i class="fas fa-microchip"></i> ${escapeHtml(result.model || "claude-haiku-4-5")}</span>
        <span><i class="fas fa-coins"></i> ${result.creditsRemaining ?? "—"} credits left</span>
        <span><i class="fas fa-arrow-right-arrow-left"></i> ${(result.tokensUsed?.input || 0) + (result.tokensUsed?.output || 0)} tokens</span>
        <span class="sa-meta-disclaimer"><i class="fas fa-info-circle"></i> For informational purposes only — not medical advice</span>
      </div>
    `;

    // Animate score counter
    animateScoreCounter(content);

    // Staggered reveal with IntersectionObserver
    initRevealAnimations(content);

    // Initialize synergy network if present
    initSynergyNetwork(content, a.synergyAnalysis || []);

    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Evidence Meter SVG ──────────────────────────────────────────
  function renderEvidenceMeter(strength) {
    const levels = ["insufficient", "limited", "moderate", "strong"];
    const activeIdx = levels.indexOf(strength);
    const bars = levels.map((lvl, i) => {
      const active = i <= activeIdx;
      const height = 8 + i * 6;
      const colors = ["#8b949e", "#fb7185", "#fbbf24", "#4ade80"];
      return `<div class="sa-ev-bar ${active ? 'active' : ''}" style="height: ${height}px; background: ${active ? colors[i] : 'rgba(99,102,241,0.1)'}"></div>`;
    }).join("");
    return `<div class="sa-evidence-meter">${bars}</div>`;
  }

  // ── Animated Score Counter ──────────────────────────────────────
  function animateScoreCounter(container) {
    const el = container.querySelector(".sa-score-number[data-target]");
    if (!el) return;
    const target = parseInt(el.dataset.target, 10);
    let current = 0;
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ── Staggered Reveal Animations ─────────────────────────────────
  function initRevealAnimations(container) {
    const sections = container.querySelectorAll(".sa-reveal");
    if (!("IntersectionObserver" in window)) {
      sections.forEach(s => s.classList.add("sa-revealed"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("sa-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    sections.forEach(s => observer.observe(s));
  }

  // ── Interactive Synergy Network ─────────────────────────────────
  function initSynergyNetwork(container, synergies) {
    const canvas = container.querySelector("#sa-synergy-canvas");
    if (!canvas || !synergies.length) return;

    // Extract unique supplement names
    const nameSet = new Set();
    synergies.forEach(s => { (s.pair || []).forEach(n => nameSet.add(n)); });
    const names = Array.from(nameSet);
    if (names.length < 2) return;

    const width = canvas.offsetWidth || 400;
    const height = Math.max(250, names.length * 30);
    canvas.style.height = height + "px";

    // Position nodes in a circle
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 50;
    const nodes = names.map((name, i) => {
      const angle = (i / names.length) * 2 * Math.PI - Math.PI / 2;
      return {
        name,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });

    // Build SVG
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", height);
    svg.classList.add("sa-network-svg");

    // Draw edges
    const edgeColors = {
      synergistic: "#4ade80",
      redundant: "#fbbf24",
      antagonistic: "#ef4444",
      neutral: "#8b949e",
    };
    const edgeDashes = {
      synergistic: "",
      redundant: "6,3",
      antagonistic: "2,2",
      neutral: "8,4",
    };

    synergies.forEach((syn, idx) => {
      const n1 = nodes.find(n => n.name === syn.pair?.[0]);
      const n2 = nodes.find(n => n.name === syn.pair?.[1]);
      if (!n1 || !n2) return;

      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", n1.x);
      line.setAttribute("y1", n1.y);
      line.setAttribute("x2", n2.x);
      line.setAttribute("y2", n2.y);
      line.setAttribute("stroke", edgeColors[syn.type] || "#8b949e");
      line.setAttribute("stroke-width", syn.type === "synergistic" ? "2.5" : "1.5");
      line.setAttribute("stroke-opacity", "0.7");
      if (edgeDashes[syn.type]) line.setAttribute("stroke-dasharray", edgeDashes[syn.type]);
      line.classList.add("sa-net-edge");
      line.dataset.idx = idx;
      svg.appendChild(line);
    });

    // Draw nodes
    nodes.forEach((node, i) => {
      const g = document.createElementNS(svgNS, "g");
      g.classList.add("sa-net-node");

      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", "16");
      circle.setAttribute("fill", "rgba(99,102,241,0.2)");
      circle.setAttribute("stroke", "rgba(99,102,241,0.5)");
      circle.setAttribute("stroke-width", "2");
      g.appendChild(circle);

      // Label with text wrapping for long names
      const shortName = node.name.length > 12 ? node.name.substring(0, 11) + "…" : node.name;
      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", node.x);
      text.setAttribute("y", node.y + 28);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "var(--text-primary, #c9d1d9)");
      text.setAttribute("font-size", "10");
      text.setAttribute("font-weight", "500");
      text.textContent = shortName;
      g.appendChild(text);

      // Hover: show full name in tooltip
      const title = document.createElementNS(svgNS, "title");
      title.textContent = node.name;
      g.appendChild(title);

      svg.appendChild(g);
    });

    canvas.innerHTML = "";
    canvas.appendChild(svg);

    // Add hover interaction — highlight connected edges
    const edgeEls = svg.querySelectorAll(".sa-net-edge");
    const nodeEls = svg.querySelectorAll(".sa-net-node");
    nodeEls.forEach((nodeEl, i) => {
      nodeEl.addEventListener("mouseenter", () => {
        const nodeName = nodes[i].name;
        edgeEls.forEach((edge, eIdx) => {
          const syn = synergies[eIdx];
          const connected = syn.pair?.includes(nodeName);
          edge.setAttribute("stroke-opacity", connected ? "1" : "0.15");
          edge.setAttribute("stroke-width", connected ? "3" : "1");
        });
        nodeEls.forEach((ne, ni) => {
          if (ni === i) return;
          const isLinked = synergies.some(s => s.pair?.includes(nodeName) && s.pair?.includes(nodes[ni].name));
          ne.querySelector("circle").setAttribute("fill-opacity", isLinked ? "1" : "0.3");
        });
      });
      nodeEl.addEventListener("mouseleave", () => {
        edgeEls.forEach((edge, eIdx) => {
          const syn = synergies[eIdx];
          edge.setAttribute("stroke-opacity", "0.7");
          edge.setAttribute("stroke-width", syn.type === "synergistic" ? "2.5" : "1.5");
        });
        nodeEls.forEach(ne => {
          ne.querySelector("circle").setAttribute("fill-opacity", "1");
        });
      });
    });

    // Network legend
    const legendEl = container.querySelector(".sa-network-legend");
    if (legendEl) {
      legendEl.innerHTML = `
        <span class="sa-net-legend-item"><span class="sa-net-legend-line" style="background:#4ade80"></span> Synergistic</span>
        <span class="sa-net-legend-item"><span class="sa-net-legend-line sa-dashed" style="background:#fbbf24"></span> Redundant</span>
        <span class="sa-net-legend-item"><span class="sa-net-legend-line sa-dotted" style="background:#ef4444"></span> Antagonistic</span>
        <span class="sa-net-legend-item"><span class="sa-net-legend-line sa-long-dash" style="background:#8b949e"></span> Neutral</span>
      `;
    }
  }

  // ── Synergy Section ─────────────────────────────────────────────
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
      <div class="sa-result-section sa-reveal" style="--reveal-delay: 4">
        <h3 class="sa-result-section-title">
          <i class="fas fa-project-diagram"></i> Synergy Network
          <button class="sa-view-toggle" data-view="network" title="Toggle view">
            <i class="fas fa-diagram-project"></i>
          </button>
        </h3>
        <details class="sa-interpret-details">
          <summary><i class="fas fa-circle-question"></i> Understanding synergies</summary>
          <div class="sa-interpret-content">
            <p><strong>Synergistic</strong> pairs amplify each other — e.g., Vitamin C enhances iron absorption. <strong>Redundant</strong> pairs target the same pathway, so you may be over-investing. <strong>Antagonistic</strong> pairs can cancel or reduce each other's effects. Hover over nodes in the network to see connections.</p>
          </div>
        </details>
        <div class="sa-network-legend"></div>
        <div id="sa-synergy-canvas" class="sa-synergy-canvas"></div>
        <div class="sa-synergy-list">${rows}</div>
      </div>
    `;
  }

  // ── Mechanism Section with Ring Indicators ──────────────────────
  function renderMechanismSection(mechanisms) {
    const rows = mechanisms.map(m => {
      const strengthClass = `sa-mech-${m.strength}`;
      const strengthLabel = {
        "well-covered": "Well Covered",
        "partially-covered": "Partial",
        "gap": "Gap",
      }[m.strength] || m.strength;
      const strengthIcon = {
        "well-covered": "fa-circle-check",
        "partially-covered": "fa-circle-half-stroke",
        "gap": "fa-circle-xmark",
      }[m.strength] || "fa-circle";

      const pct = m.strength === "well-covered" ? 100 : m.strength === "partially-covered" ? 60 : 15;
      // Mini ring: circumference for r=14 = 87.96
      const circ = 87.96;
      const dashArr = `${(pct / 100) * circ} ${circ}`;
      const ringColor = m.strength === "well-covered" ? "#4ade80" : m.strength === "partially-covered" ? "#fbbf24" : "#fb7185";

      return `
        <div class="sa-mech-row ${strengthClass}">
          <div class="sa-mech-ring">
            <svg viewBox="0 0 36 36" class="sa-mech-ring-svg">
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(99,102,241,0.1)" stroke-width="3" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="${ringColor}" stroke-width="3"
                stroke-linecap="round" stroke-dasharray="${dashArr}" transform="rotate(-90 18 18)" />
            </svg>
            <i class="fas ${strengthIcon} sa-mech-ring-icon" style="color: ${ringColor}"></i>
          </div>
          <div class="sa-mech-info">
            <div class="sa-mech-top">
              <span class="sa-mech-name">${escapeHtml(m.mechanism)}</span>
              <span class="sa-mech-strength-label ${strengthClass}">${strengthLabel}</span>
            </div>
            <div class="sa-mech-covered">
              ${(m.coveredBy || []).map(n => `<span class="sa-mech-pill">${escapeHtml(n)}</span>`).join("")}
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Summary stats
    const wellCount = mechanisms.filter(m => m.strength === "well-covered").length;
    const partialCount = mechanisms.filter(m => m.strength === "partially-covered").length;
    const gapCount = mechanisms.filter(m => m.strength === "gap").length;

    return `
      <div class="sa-result-section sa-reveal" style="--reveal-delay: 5">
        <h3 class="sa-result-section-title">
          <i class="fas fa-dna"></i> Mechanism Coverage
        </h3>
        <details class="sa-interpret-details">
          <summary><i class="fas fa-circle-question"></i> What is mechanism coverage?</summary>
          <div class="sa-interpret-content">
            <p>Each health goal involves key biological pathways. <strong>Well Covered</strong> means multiple supplements in your stack target this pathway with good evidence. <strong>Partial</strong> means some support, but not robust. <strong>Gap</strong> means this critical pathway is unaddressed — consider the suggestions section below.</p>
          </div>
        </details>
        <div class="sa-mech-summary">
          <span class="sa-mech-stat sa-mech-stat-well"><i class="fas fa-circle-check"></i> ${wellCount} well covered</span>
          <span class="sa-mech-stat sa-mech-stat-partial"><i class="fas fa-circle-half-stroke"></i> ${partialCount} partial</span>
          <span class="sa-mech-stat sa-mech-stat-gap"><i class="fas fa-circle-xmark"></i> ${gapCount} ${gapCount === 1 ? 'gap' : 'gaps'}</span>
        </div>
        <div class="sa-mech-list">${rows}</div>
      </div>
    `;
  }

  // ── Safety Section ──────────────────────────────────────────────
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
              <span class="sa-safety-supps">${(f.supplements || []).map(n => escapeHtml(n)).join(" · ")}</span>
            </div>
            <p class="sa-safety-desc">${escapeHtml(f.description || "")}</p>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="sa-result-section sa-reveal" style="--reveal-delay: 6">
        <h3 class="sa-result-section-title">
          <i class="fas fa-shield-halved"></i> Safety Flags
        </h3>
        <details class="sa-interpret-details">
          <summary><i class="fas fa-circle-question"></i> How to read safety flags</summary>
          <div class="sa-interpret-content">
            <p><strong>Caution</strong> — minor considerations, generally safe at recommended doses. <strong>Warning</strong> — meaningful interaction risk; monitor or adjust dosing. <strong>Critical</strong> — potentially dangerous interaction; consult a healthcare professional before combining.</p>
          </div>
        </details>
        <div class="sa-safety-list">${rows}</div>
      </div>
    `;
  }

  // ── Dosage Timeline ─────────────────────────────────────────────
  function renderDosageSection(protocol) {
    // Group by time of day
    const groups = { morning: [], afternoon: [], "pre-workout": [], "post-workout": [], evening: [], anytime: [] };
    const groupMeta = {
      morning: { icon: "fa-sun", label: "Morning", color: "#fbbf24" },
      afternoon: { icon: "fa-cloud-sun", label: "Afternoon", color: "#f97316" },
      "pre-workout": { icon: "fa-dumbbell", label: "Pre-Workout", color: "#818cf8" },
      "post-workout": { icon: "fa-heart-pulse", label: "Post-Workout", color: "#4ade80" },
      evening: { icon: "fa-moon", label: "Evening", color: "#818cf8" },
      anytime: { icon: "fa-clock", label: "Any Time", color: "#8b949e" },
    };

    protocol.forEach(p => {
      const slot = categorizeTiming(p.timing);
      groups[slot].push(p);
    });

    let timelineHtml = '<div class="sa-timeline">';

    Object.entries(groups).forEach(([slot, items]) => {
      if (!items.length) return;
      const meta = groupMeta[slot];
      timelineHtml += `
        <div class="sa-timeline-slot">
          <div class="sa-timeline-marker">
            <div class="sa-timeline-dot" style="--dot-color: ${meta.color}">
              <i class="fas ${meta.icon}"></i>
            </div>
            <span class="sa-timeline-label">${meta.label}</span>
          </div>
          <div class="sa-timeline-items">
            ${items.map(p => `
              <div class="sa-timeline-card">
                <div class="sa-timeline-card-header">
                  <span class="sa-timeline-supp">${escapeHtml(p.supplement)}</span>
                  <span class="sa-timeline-dose">${escapeHtml(p.recommendedDose)}</span>
                </div>
                <div class="sa-timeline-card-meta">
                  <span class="sa-timeline-food ${p.withFood ? 'with-food' : 'empty-stomach'}">
                    <i class="fas ${p.withFood ? 'fa-utensils' : 'fa-glass-water'}"></i>
                    ${p.withFood ? 'With food' : 'Empty stomach'}
                  </span>
                </div>
                ${p.notes ? `<p class="sa-timeline-notes">${escapeHtml(p.notes)}</p>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      `;
    });

    timelineHtml += '</div>';

    // Also keep a collapsible table for detailed reference
    const tableRows = protocol.map(p => `
      <tr>
        <td class="sa-dose-name">${escapeHtml(p.supplement)}</td>
        <td>${escapeHtml(p.recommendedDose)}</td>
        <td>${escapeHtml(p.timing)}</td>
        <td>${p.withFood ? '<i class="fas fa-utensils"></i> Yes' : '<i class="fas fa-glass-water"></i> No'}</td>
        <td class="sa-dose-notes">${escapeHtml(p.notes || "")}</td>
      </tr>
    `).join("");

    return `
      <div class="sa-result-section sa-reveal" style="--reveal-delay: 7">
        <h3 class="sa-result-section-title">
          <i class="fas fa-prescription-bottle-medical"></i> Daily Protocol
        </h3>
        <details class="sa-interpret-details">
          <summary><i class="fas fa-circle-question"></i> Timing tips</summary>
          <div class="sa-interpret-content">
            <p>Timing matters for absorption. Fat-soluble supplements (D3, CoQ10, curcumin) absorb better with food. Minerals like magnesium and zinc can compete for absorption if taken together. Stimulants should be avoided late in the day.</p>
          </div>
        </details>
        ${timelineHtml}
        <details class="sa-table-details">
          <summary><i class="fas fa-table"></i> View detailed table</summary>
          <div class="sa-dosage-table-wrap">
            <table class="sa-dosage-table">
              <thead>
                <tr><th>Supplement</th><th>Dose</th><th>Timing</th><th>With Food</th><th>Notes</th></tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
        </details>
      </div>
    `;
  }

  // ── Suggestions Section ─────────────────────────────────────────
  function renderSuggestionsSection(additions, removals) {
    let html = `<div class="sa-result-section sa-reveal" style="--reveal-delay: 8">
      <h3 class="sa-result-section-title">
        <i class="fas fa-lightbulb"></i> Stack Optimization
      </h3>
      <details class="sa-interpret-details">
        <summary><i class="fas fa-circle-question"></i> How to use these suggestions</summary>
        <div class="sa-interpret-content">
          <p>Additions are supplements that could fill gaps in your stack's mechanism coverage or add synergistic value. Removals are supplements that are redundant or counterproductive for your specific goal. Evidence tiers indicate research confidence (Tier 1 = strongest).</p>
        </div>
      </details>
      <div class="sa-suggestions-grid">`;

    if (additions?.length) {
      html += `
        <div class="sa-suggestion-group sa-suggestion-add">
          <h4><i class="fas fa-plus-circle"></i> Consider Adding</h4>
          ${additions.map(a => {
            const tierColor = a.evidenceTier === 1 ? "#4ade80" : a.evidenceTier === 2 ? "#fbbf24" : "#fb7185";
            return `
              <div class="sa-suggestion-card">
                <div class="sa-suggestion-header">
                  <span class="sa-suggestion-name">${escapeHtml(a.name)}</span>
                  <span class="sa-suggestion-tier" style="--tier-color: ${tierColor}">
                    <i class="fas fa-flask"></i> Tier ${a.evidenceTier}
                  </span>
                </div>
                <p class="sa-suggestion-reason">${escapeHtml(a.reason)}</p>
              </div>
            `;
          }).join("")}
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
    const breakdownEl = $("#sa-credit-breakdown");

    const purchased = credits.purchasedCredits || 0;
    const totalAvail = credits.totalAvailable ?? (credits.remaining + purchased);

    if (countEl) {
      countEl.textContent = `${totalAvail} credit${totalAvail !== 1 ? 's' : ''} available`;
    }

    if (fillEl) {
      const total = credits.monthlyLimit + purchased;
      const pct = total > 0 ? Math.round((totalAvail / total) * 100) : 0;
      fillEl.style.width = Math.min(pct, 100) + "%";
      fillEl.classList.toggle("sa-credit-fill--low", pct <= 20);
      fillEl.classList.toggle("sa-credit-fill--medium", pct > 20 && pct <= 50);
    }

    if (tierEl) {
      const isSubscriber = credits.tier === "subscriber";
      tierEl.innerHTML = isSubscriber
        ? '<i class="fas fa-crown"></i> Pro'
        : '<a href="/pricing.html" class="sa-upgrade-link">Upgrade</a>';
    }

    // Breakdown: monthly vs purchased
    if (breakdownEl) {
      const parts = [];
      parts.push(`<span class="sa-breakdown-item"><i class="fas fa-calendar"></i> ${credits.remaining}/${credits.monthlyLimit} monthly</span>`);
      if (purchased > 0) {
        parts.push(`<span class="sa-breakdown-item sa-breakdown-purchased"><i class="fas fa-coins"></i> ${purchased} purchased</span>`);
      }
      // Show credit costs per depth
      const costs = credits.creditCosts || { quick: 1, standard: 2, deep: 3 };
      parts.push(`<span class="sa-breakdown-costs"><i class="fas fa-bolt"></i> Quick=${costs.quick} · Standard=${costs.standard} · Deep=${costs.deep}</span>`);
      breakdownEl.innerHTML = parts.join("");
    }

    if (barEl) {
      barEl.style.display = "block";
    }

    // Wire up Buy Credits button
    const buyBtn = $("#sa-buy-credits-btn");
    if (buyBtn && !buyBtn._wired) {
      buyBtn._wired = true;
      buyBtn.addEventListener("click", () => openCreditsModal());
    }
  }

  // ── Buy Credits Modal ───────────────────────────────────────────
  async function openCreditsModal() {
    const modal = $("#sa-credits-modal");
    const grid = $("#sa-packs-grid");
    if (!modal || !grid) return;

    // Move modal to <body> to escape any parent transforms/stacking contexts
    // (the #analyzer section has a CSS transform from sa-reveal that breaks position:fixed)
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    modal.style.display = "flex";

    // Load packs from server
    try {
      const data = await window.SupplementDB.query("analysisCredits:getCreditPacks");
      renderPackCards(grid, data.packs);
    } catch (err) {
      // Fallback to hardcoded packs
      renderPackCards(grid, [
        { id: "starter", name: "Starter Pack", credits: 10, priceUsd: 5.00, analyses: { quick: 10, standard: 5, deep: 3 }, badge: null, perCreditCents: 50 },
        { id: "pro", name: "Pro Pack", credits: 25, priceUsd: 10.00, analyses: { quick: 25, standard: 12, deep: 8 }, badge: "Best Value", perCreditCents: 40 },
        { id: "bulk", name: "Bulk Pack", credits: 75, priceUsd: 25.00, analyses: { quick: 75, standard: 37, deep: 25 }, badge: "Most Credits", perCreditCents: 33 },
      ]);
    }

    // Close handlers
    const closeBtn = $("#sa-modal-close");
    if (closeBtn) {
      closeBtn.onclick = () => { modal.style.display = "none"; };
    }
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }

  function renderPackCards(grid, packs) {
    grid.innerHTML = packs.map(pack => `
      <div class="sa-pack-card ${pack.badge ? 'sa-pack-featured' : ''}">
        ${pack.badge ? `<div class="sa-pack-badge">${pack.badge}</div>` : ""}
        <h4 class="sa-pack-name">${pack.name}</h4>
        <div class="sa-pack-price">
          <span class="sa-pack-dollar">$${pack.priceUsd.toFixed(2)}</span>
          <span class="sa-pack-per">${pack.perCreditCents}\u00a2/credit</span>
        </div>
        <div class="sa-pack-credits">
          <span class="sa-pack-credit-count">${pack.credits}</span>
          <span class="sa-pack-credit-label">credits</span>
        </div>
        <div class="sa-pack-analyses">
          <div class="sa-pack-analysis-row">
            <i class="fas fa-bolt"></i>
            <span>${pack.analyses.quick} Quick analyses</span>
          </div>
          <div class="sa-pack-analysis-row">
            <i class="fas fa-flask"></i>
            <span>${pack.analyses.standard} Standard analyses</span>
          </div>
          <div class="sa-pack-analysis-row">
            <i class="fas fa-microscope"></i>
            <span>${pack.analyses.deep} Deep analyses</span>
          </div>
        </div>
        <button class="sa-pack-buy-btn" data-pack="${pack.id}">
          <i class="fas fa-shopping-cart"></i> Buy for $${pack.priceUsd.toFixed(2)}
        </button>
      </div>
    `).join("");

    // Wire buy buttons
    grid.querySelectorAll(".sa-pack-buy-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const packId = btn.dataset.pack;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
        try {
          const result = await window.SupplementDB.action("stripe:createCreditCheckoutSession", { packId });
          if (result?.url) {
            window.location.href = result.url;
          }
        } catch (err) {
          const msg = err?.data || err?.message || "Failed to start checkout";
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
          setTimeout(() => {
            btn.innerHTML = `<i class="fas fa-shopping-cart"></i> Buy for $${btn.closest('.sa-pack-card').querySelector('.sa-pack-dollar').textContent.slice(1)}`;
          }, 3000);
        }
      });
    });
  }

  // Check for post-purchase URL params
  function checkCreditPurchaseParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("credits_purchased")) {
      const pack = params.get("credits_purchased");
      // Clean URL
      const url = new URL(window.location);
      url.searchParams.delete("credits_purchased");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());

      // Show success toast
      showCreditPurchaseSuccess(pack);
      // Refresh credits
      setTimeout(() => loadCredits(), 1000);
    }
  }

  function showCreditPurchaseSuccess(packId) {
    const packNames = { starter: "Starter Pack", pro: "Pro Pack", bulk: "Bulk Pack" };
    const name = packNames[packId] || "Credit Pack";
    const toast = document.createElement("div");
    toast.className = "sa-toast sa-toast-success";
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${name} purchased! Credits added to your account.`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add("sa-toast-show"); }, 50);
    setTimeout(() => {
      toast.classList.remove("sa-toast-show");
      setTimeout(() => toast.remove(), 300);
    }, 5000);
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
      const score = a.result?.overallScore ?? "—";
      const scoreColor = typeof score === "number" ? getScoreColor(score) : "var(--text-muted)";
      const goal = HEALTH_GOALS.find(g => g.id === a.healthGoal);
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
              <span>${escapeHtml(goal?.name || a.healthGoal)}</span>
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
