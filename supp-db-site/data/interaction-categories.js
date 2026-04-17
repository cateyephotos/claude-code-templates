/**
 * Supplement-Drug Interaction Category Taxonomy
 *
 * Normalizes the free-text `drugInteractions` strings in supplements.js into a
 * fixed set of drug categories with:
 *  - canonical slug (for URLs)
 *  - display name (for UI)
 *  - aliases (lower-cased substrings to match raw drugInteractions entries)
 *  - defaultSeverity (overridden per supplement if keyword-flagged)
 *  - description (plain-English summary of the interaction pattern)
 *  - examples (well-known drugs in this class)
 *  - mechanism (short clinical rationale)
 *  - clinicalAdvice (what a user should actually do)
 *
 * Severity levels:
 *  - avoid     — known contraindication; do not combine
 *  - caution   — potential additive/enhanced effect; medical supervision advised
 *  - monitor   — theoretical or mild; watch for unexpected effects
 *  - safe      — no clinically meaningful interaction expected
 *
 * "Avoid" is never assigned by default — it is escalated from text keywords
 * inside `build-interactions.js` (e.g. "chemotherapy", "contraindicated",
 * "Do not combine"). Keeping defaults conservative (caution) avoids false
 * alarms and respects the limits of the underlying data.
 */

const INTERACTION_CATEGORIES = [
    {
        slug: 'blood-thinners',
        name: 'Blood Thinners & Anticoagulants',
        shortName: 'Blood Thinners',
        aliases: [
            'blood thinner', 'blood thinners',
            'anticoagulant', 'anticoagulants',
            'antiplatelet', 'warfarin', 'heparin', 'apixaban', 'rivaroxaban',
            'dabigatran', 'clopidogrel', 'aspirin (antiplatelet)'
        ],
        defaultSeverity: 'caution',
        description: 'Supplements with antiplatelet or blood-thinning activity can add to the effect of prescription anticoagulants, increasing the risk of bleeding, bruising, and prolonged clotting times.',
        examples: ['Warfarin (Coumadin)', 'Apixaban (Eliquis)', 'Rivaroxaban (Xarelto)', 'Clopidogrel (Plavix)', 'Heparin', 'Aspirin (antiplatelet dose)'],
        mechanism: 'Additive antiplatelet/anticoagulant effect — many botanicals inhibit platelet aggregation via COX, thromboxane, or vitamin K pathways.',
        clinicalAdvice: 'If you take a prescription blood thinner, consult your prescriber before starting any supplement in this category. Surgery: stop 1–2 weeks before. Monitor INR more frequently if on warfarin.'
    },
    {
        slug: 'diabetes-medications',
        name: 'Diabetes Medications',
        shortName: 'Diabetes Meds',
        aliases: [
            'diabetes medication', 'diabetes medications', 'diabetes drug', 'diabetes drugs',
            'insulin', 'metformin', 'sulfonylurea', 'sulfonylureas',
            'hypoglycemic', 'antidiabetic', 'glp-1', 'dpp-4'
        ],
        defaultSeverity: 'caution',
        description: 'Many supplements modestly lower blood glucose. Combined with insulin, sulfonylureas, or other hypoglycemic drugs, they can push blood sugar too low — increasing the risk of hypoglycemia (shakiness, sweating, confusion, or in severe cases, loss of consciousness).',
        examples: ['Insulin', 'Metformin', 'Glipizide', 'Glyburide', 'Semaglutide (Ozempic)', 'Sitagliptin (Januvia)'],
        mechanism: 'Additive glucose-lowering effect — supplements may improve insulin sensitivity, slow carbohydrate absorption, or increase insulin secretion.',
        clinicalAdvice: 'If you take diabetes medication, discuss any new supplement with your prescriber. Increase blood glucose monitoring frequency when starting, changing the dose, or stopping these supplements. Watch for signs of hypoglycemia.'
    },
    {
        slug: 'immunosuppressants',
        name: 'Immunosuppressants',
        shortName: 'Immunosuppressants',
        aliases: [
            'immunosuppressant', 'immunosuppressants',
            'immunosuppressive', 'immunosuppressive drug', 'immunosuppressive drugs',
            'cyclosporine', 'tacrolimus', 'methotrexate', 'azathioprine'
        ],
        defaultSeverity: 'caution',
        description: 'Some supplements boost immune activity (cytokine production, T-cell or NK-cell function), which can counteract the intended action of immunosuppressant medications used for organ transplants, autoimmune disease, or certain cancers.',
        examples: ['Cyclosporine', 'Tacrolimus', 'Methotrexate', 'Azathioprine', 'Mycophenolate', 'Biologics (e.g. adalimumab, infliximab)'],
        mechanism: 'Opposing pharmacodynamic effect — immune-stimulating botanicals may reduce the therapeutic effect of immunosuppression.',
        clinicalAdvice: 'If you are on immunosuppressants for transplant, autoimmune disease, or active cancer treatment, avoid immune-modulating supplements unless explicitly approved by your specialist.'
    },
    {
        slug: 'mao-inhibitors',
        name: 'MAO Inhibitors & Serotonergic Drugs',
        shortName: 'MAO Inhibitors / SSRIs',
        aliases: [
            'mao inhibitor', 'mao inhibitors', 'maoi', 'maois',
            'ssri', 'ssris', 'snri', 'snris',
            'antidepressant', 'antidepressants',
            'serotonergic', 'tricyclic'
        ],
        defaultSeverity: 'caution',
        description: 'Supplements that raise serotonin, dopamine, or norepinephrine levels can combine dangerously with MAO inhibitors, SSRIs, SNRIs, tricyclics, and other serotonergic drugs — raising the risk of serotonin syndrome (agitation, tachycardia, hyperthermia, muscle rigidity).',
        examples: ['Phenelzine (Nardil)', 'Tranylcypromine (Parnate)', 'Fluoxetine (Prozac)', 'Sertraline (Zoloft)', 'Venlafaxine (Effexor)', 'Amitriptyline'],
        mechanism: 'Additive monoamine stimulation — especially relevant for serotonin precursors (5-HTP, L-Tryptophan) and botanicals with MAO-inhibiting activity.',
        clinicalAdvice: 'Do not combine serotonin-precursor supplements (5-HTP, St. John\'s Wort) with prescription antidepressants. Any other serotonergic supplement should be cleared by your prescriber. Stop at first sign of serotonin syndrome symptoms and seek medical care.'
    },
    {
        slug: 'blood-pressure-medications',
        name: 'Blood Pressure Medications',
        shortName: 'BP Meds',
        aliases: [
            'blood pressure medication', 'blood pressure medications', 'blood pressure drug',
            'antihypertensive', 'antihypertensives',
            'ace inhibitor', 'ace inhibitors',
            'arb', 'arbs',
            'beta blocker', 'beta blockers',
            'calcium channel blocker', 'calcium channel blockers'
        ],
        defaultSeverity: 'caution',
        description: 'Several supplements lower blood pressure. Combined with antihypertensive medications, they can cause blood pressure to drop too far — producing dizziness, lightheadedness, or fainting, especially on standing up.',
        examples: ['Lisinopril (ACE inhibitor)', 'Losartan (ARB)', 'Amlodipine (CCB)', 'Metoprolol (beta blocker)', 'Hydrochlorothiazide'],
        mechanism: 'Additive hypotensive effect — supplements may cause vasodilation, natriuresis, or modulate renin-angiotensin signaling.',
        clinicalAdvice: 'Monitor blood pressure at home when starting or stopping these supplements. Dose adjustments to antihypertensive medication may be needed. Rise slowly from sitting/lying positions.'
    },
    {
        slug: 'thyroid-medications',
        name: 'Thyroid Medications',
        shortName: 'Thyroid Meds',
        aliases: [
            'thyroid medication', 'thyroid medications', 'thyroid drug', 'thyroid drugs',
            'levothyroxine', 'liothyronine', 'synthroid', 'armour thyroid'
        ],
        defaultSeverity: 'caution',
        description: 'Minerals such as iron and calcium, along with some botanicals, can interfere with the absorption or effect of thyroid hormone replacement. Timing and monitoring matter.',
        examples: ['Levothyroxine (Synthroid, Levoxyl)', 'Liothyronine (Cytomel)', 'Armour Thyroid', 'Methimazole', 'Propylthiouracil'],
        mechanism: 'Reduced thyroid hormone absorption (minerals chelate levothyroxine) or direct effects on thyroid hormone synthesis.',
        clinicalAdvice: 'Take thyroid medication 4 hours apart from mineral supplements (iron, calcium, magnesium). Retest TSH 6–8 weeks after starting any supplement that could interact. Do not adjust thyroid dose without medical supervision.'
    },
    {
        slug: 'sedatives',
        name: 'Sedatives & CNS Depressants',
        shortName: 'Sedatives',
        aliases: [
            'sedative', 'sedatives',
            'benzodiazepine', 'benzodiazepines',
            'may enhance sedative', 'cns depressant', 'cns depressants'
        ],
        defaultSeverity: 'caution',
        description: 'Supplements with GABAergic or sedating activity can compound the effects of benzodiazepines, sleep medications, alcohol, and opioids — producing excessive drowsiness, impaired coordination, or respiratory depression.',
        examples: ['Alprazolam (Xanax)', 'Lorazepam (Ativan)', 'Zolpidem (Ambien)', 'Eszopiclone (Lunesta)', 'Opioid analgesics'],
        mechanism: 'Additive CNS depression — GABA-A potentiation, glycine receptor activation, or adenosine signaling.',
        clinicalAdvice: 'Do not drive or operate machinery when combining sedating supplements with prescription sedatives or alcohol. Watch for excessive drowsiness. Consult your prescriber before combining.'
    },
    {
        slug: 'stimulant-medications',
        name: 'Stimulant Medications',
        shortName: 'Stimulants',
        aliases: [
            'stimulant', 'stimulants',
            'stimulant medication', 'stimulant medications',
            'adhd medication', 'amphetamine', 'methylphenidate'
        ],
        defaultSeverity: 'caution',
        description: 'Caffeine and other stimulant supplements can compound the effects of ADHD medications and other prescription stimulants — raising heart rate, blood pressure, anxiety, and insomnia risk.',
        examples: ['Methylphenidate (Ritalin, Concerta)', 'Amphetamine/Dextroamphetamine (Adderall)', 'Lisdexamfetamine (Vyvanse)', 'Modafinil (Provigil)'],
        mechanism: 'Additive sympathomimetic activity — increased catecholamine release and receptor sensitivity.',
        clinicalAdvice: 'Limit caffeine and other stimulant supplements when starting ADHD medication. Monitor heart rate and blood pressure. Watch for anxiety, insomnia, or jitteriness.'
    },
    {
        slug: 'cholinesterase-inhibitors',
        name: 'Cholinesterase Inhibitors',
        shortName: 'Cholinesterase Inhibitors',
        aliases: [
            'cholinesterase inhibitor', 'cholinesterase inhibitors',
            'may enhance effects of cholinesterase inhibitors',
            'donepezil', 'rivastigmine', 'galantamine'
        ],
        defaultSeverity: 'caution',
        description: 'Acetylcholine-boosting supplements (such as Huperzine A, Alpha-GPC, Citicoline) can have additive effects with cholinesterase inhibitor drugs used for Alzheimer\'s disease, increasing the risk of cholinergic side effects such as nausea, diarrhea, bradycardia, or muscle cramps.',
        examples: ['Donepezil (Aricept)', 'Rivastigmine (Exelon)', 'Galantamine (Razadyne)'],
        mechanism: 'Additive cholinergic activity — elevated synaptic acetylcholine.',
        clinicalAdvice: 'If you or a family member takes a cholinesterase inhibitor for dementia, do not add cholinergic supplements without physician approval.'
    },
    {
        slug: 'diuretics',
        name: 'Diuretics',
        shortName: 'Diuretics',
        aliases: ['diuretic', 'diuretics', 'thiazide', 'loop diuretic'],
        defaultSeverity: 'caution',
        description: 'Diuretic supplements and botanicals can compound the fluid and electrolyte effects of prescription diuretics — increasing the risk of dehydration, low potassium, low sodium, or kidney strain.',
        examples: ['Hydrochlorothiazide', 'Furosemide (Lasix)', 'Spironolactone', 'Chlorthalidone'],
        mechanism: 'Additive natriuretic or diuretic effect; some supplements affect aldosterone or renal tubular transport.',
        clinicalAdvice: 'Monitor electrolytes if combining. Increase water intake. Report muscle cramps, weakness, or irregular heartbeat to your prescriber.'
    },
    {
        slug: 'antibiotics',
        name: 'Antibiotics',
        shortName: 'Antibiotics',
        aliases: [
            'antibiotic', 'antibiotics',
            'tetracycline', 'quinolone', 'fluoroquinolone'
        ],
        defaultSeverity: 'caution',
        description: 'Minerals such as iron, calcium, magnesium, and zinc can bind to certain antibiotics in the gut and reduce their absorption. Probiotics may reduce antibiotic efficacy or be partially neutralized by the antibiotic course.',
        examples: ['Ciprofloxacin', 'Doxycycline', 'Tetracycline', 'Azithromycin'],
        mechanism: 'Chelation in the GI tract (minerals) or gut microbiome disruption (probiotics).',
        clinicalAdvice: 'Separate mineral supplements from tetracycline/quinolone antibiotics by at least 2 hours. Probiotics should be taken 2+ hours apart from antibiotics. Complete the full antibiotic course as prescribed.'
    }
];

// Severity-escalation keywords — if raw interaction text contains any of these,
// severity is upgraded to "avoid" regardless of the category default.
const AVOID_KEYWORDS = [
    'contraindicated',
    'do not combine',
    'do not use with',
    'chemotherapy',
    'methotrexate (antagonist)',
    'sulfasalazine',
    'levodopa'
];

// Safe-downgrade keywords — raw text matching these is treated as "no interaction".
const SAFE_KEYWORDS = [
    'none significant',
    'none known',
    'no major',
    'no major drug interactions',
    'minimal known interactions',
    'minimal known'
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { INTERACTION_CATEGORIES, AVOID_KEYWORDS, SAFE_KEYWORDS };
}
if (typeof window !== 'undefined') {
    window.INTERACTION_CATEGORIES = INTERACTION_CATEGORIES;
}
