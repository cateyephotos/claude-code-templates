#!/usr/bin/env node
/**
 * SupplementDB — Category Pillar Page Generator
 * Reads data/supplements.js and generates HTML category pages
 * Usage: node scripts/generate-category-pages.js
 */

const fs = require('fs');
const path = require('path');
const {
    loadSupplementData,
    normalizeCategory,
    slugify,
    getTierLabel,
    getTierColor,
    groupByCategory
} = require('./parse-data');

const ENHANCED_DIR = path.join(__dirname, '..', 'data', 'enhanced_citations');

// ── Enhanced Citation Loader (Server-Side) ───────────────────────────────

function loadEnhancedCitation(supplement) {
    const id = supplement.id;
    try {
        if (!fs.existsSync(ENHANCED_DIR)) return null;
        const files = fs.readdirSync(ENHANCED_DIR);
        const matchFile = files.find(f => f.startsWith(`${id}_`) && f.endsWith('_enhanced.js'));
        if (!matchFile) return null;

        const src = fs.readFileSync(path.join(ENHANCED_DIR, matchFile), 'utf8');
        const window = { enhancedCitations: {} };
        eval(src);

        if (window.enhancedCitations[id] && (window.enhancedCitations[id].citations || window.enhancedCitations[id].enhancedCitations)) {
            return window.enhancedCitations[id];
        }
        for (const key of Object.keys(window)) {
            if (key === 'enhancedCitations') continue;
            const val = window[key];
            if (val && typeof val === 'object' && val.citations && val.supplementId === id) return val;
        }
        for (const key of Object.keys(window)) {
            if (key === 'enhancedCitations') continue;
            const val = window[key];
            if (val && typeof val === 'object' && val.citations) return val;
        }
        return null;
    } catch (e) {
        return null;
    }
}

function countSupplementCitations(s) {
    let count = (s.keyCitations || []).length;
    const enhanced = loadEnhancedCitation(s);
    if (enhanced && enhanced.citations) {
        const cits = enhanced.citations;
        count += (cits.mechanisms || []).length + (cits.benefits || []).length +
                 (cits.safety || []).length + (cits.dosage || []).length;
    }
    return count;
}

// ---- Configuration ----

// All normalized categories that should have pillar pages (min 2 supplements)
const TARGET_CATEGORIES = [
    'Adaptogens',
    'Amino Acids',
    'Anti-inflammatory',
    'Antioxidants',
    'Essential Nutrients',
    'Herbal Extracts',
    'Joint Support',
    'Metabolic Support',
    'Nootropics',
    'Performance Enhancers',
    'Polyphenols',
    'Sleep Support'
];

const CATEGORY_DESCRIPTIONS = {
    'Adaptogens': {
        short: 'Stress-modulating botanicals that help the body maintain physiological equilibrium',
        intro: 'Adaptogens are a pharmacological class of herbal preparations studied for their ability to non-specifically increase resistance to biological, chemical, and physical stressors. This category includes Ashwagandha (Withania somnifera), Rhodiola rosea, Panax Ginseng, Holy Basil (Tulsi), and Schisandra Berry — compounds with centuries of use in Ayurvedic and traditional Chinese medicine now supported by modern randomized controlled trials. Ashwagandha holds the strongest evidence base in this category (Tier 1) with consistent meta-analytic support for cortisol reduction and stress resilience.',
        safety: 'Adaptogens in this category are generally well-tolerated with favorable safety profiles. Key considerations: Ashwagandha should be avoided during pregnancy (uterine stimulant effects); Panax Ginseng may interact with anticoagulants, diabetes medications, and stimulants — cycle use to avoid tolerance buildup; Rhodiola rosea is contraindicated in bipolar disorder; and all adaptogens may have additive effects with psychiatric or hormonal medications. Quality control is important — standardized extracts verified by third-party testing are strongly preferred.',
        useCases: 'Stress resilience, cortisol regulation, fatigue reduction, cognitive performance under stress, athletic recovery, immune modulation, and hormonal balance.'
    },
    'Anti-inflammatory': {
        short: 'Compounds with clinically validated anti-inflammatory activity across multiple pathways',
        intro: 'This category encompasses supplements studied for their effects on inflammatory pathways, including NF-κB signaling, COX enzyme inhibition, and cytokine modulation. The two primary compounds — Turmeric/Curcumin (Tier 1) and Boswellia (Tier 2) — have substantial clinical evidence across conditions including osteoarthritis, inflammatory bowel disease, and metabolic syndrome. Curcumin is notable for its multi-target anti-inflammatory profile, simultaneously inhibiting multiple pro-inflammatory mediators at physiological doses.',
        safety: 'Both compounds in this category have excellent safety profiles at standard doses. Key considerations: Curcumin enhances absorption significantly when combined with piperine (black pepper extract) — standard extracts without piperine have very low bioavailability; Boswellia formulations vary widely in AKBA (active constituent) content — standardized to ≥30% AKBA is recommended; and both compounds may potentiate anticoagulant effects when combined with blood thinners. High-dose curcumin supplements should be used cautiously alongside antiplatelet medications.',
        useCases: 'Musculoskeletal pain, inflammatory bowel conditions, arthritis management, post-exercise recovery, metabolic inflammation, and chronic pain support.'
    },
    'Joint Support': {
        short: 'Compounds studied for cartilage health, joint lubrication, and connective tissue integrity',
        intro: 'Joint support supplements target the structural and biochemical components of cartilage, synovial fluid, and connective tissue. This category includes Glucosamine (Tier 2), Chondroitin Sulfate (Tier 2), and MSM (Tier 3). Glucosamine and Chondroitin are among the most widely studied joint supplements, with the large GAIT trial and multiple systematic reviews providing nuanced data — they show modest but consistent benefits for moderate-to-severe osteoarthritis pain, with less benefit in mild cases. MSM provides additional sulfur compounds thought to support connective tissue integrity.',
        safety: 'Joint support supplements are among the safest in the database. Glucosamine is derived from shellfish — avoid if allergic; synthetic glucosamine HCl is available as an alternative. Chondroitin may have mild anticoagulant effects. These supplements are often taken long-term (6+ months) to assess efficacy — short-term trials are poor predictors of benefit. Blood glucose monitoring is recommended for diabetics using glucosamine, as mild effects on insulin sensitivity have been reported in some studies.',
        useCases: 'Osteoarthritis management, cartilage support, joint pain reduction, mobility improvement, post-injury recovery, and preventive joint health in active individuals.'
    },
    'Metabolic Support': {
        short: 'Compounds targeting energy metabolism, NAD+ biology, and metabolic pathway optimization',
        intro: 'Metabolic support supplements target fundamental biochemical pathways governing cellular energy production, mitochondrial function, and glucose metabolism. This category includes NAD+ Precursors (NMN and NR — Tier 2) and Red Yeast Rice (Tier 2). NAD+ precursors have attracted substantial research interest for their roles in sirtuins, DNA repair, and mitochondrial biogenesis — compounds that decline with age and may be restored through supplementation. Red Yeast Rice contains naturally occurring monacolins (including monacolin K, chemically identical to lovastatin) and has clinical evidence for LDL reduction.',
        safety: 'Safety profiles differ significantly within this category. NAD+ precursors (NMN, NR) have favorable short-term safety data, though long-term human studies are still emerging; flushing reactions are occasionally reported with high doses. Red Yeast Rice carries the same safety considerations as statin medications — myopathy and rhabdomyolysis are rare but documented; contraindicated with liver disease, during pregnancy, and with certain drugs that inhibit CYP3A4. Do not combine Red Yeast Rice with prescription statins. Consult a physician before use.',
        useCases: 'Cellular energy production, NAD+ restoration, cholesterol management, mitochondrial health, metabolic aging support, and sirtuin pathway activation.'
    },
    'Polyphenols': {
        short: 'Bioactive plant compounds with antioxidant, anti-inflammatory, and signaling pathway activity',
        intro: 'Polyphenols are a large class of plant-derived compounds characterized by multiple phenol rings, encompassing flavonoids, stilbenes, lignans, and phenolic acids. This category captures polyphenol supplements that do not fit cleanly into other categories, including Resveratrol and Green Tea Extract (EGCG). These compounds have attracted intense research interest for their roles in activating longevity-associated pathways (SIRT1, AMPK, NF-κB), modulating inflammatory signaling, and providing cardiovascular protection. The challenge with many polyphenols is bioavailability — most have poor oral absorption that limits translation of in vitro findings to clinical outcomes.',
        safety: 'Polyphenol supplements are generally well-tolerated. Key considerations: high-dose EGCG supplements have been associated with hepatotoxicity in rare cases — doses above 800mg/day of EGCG carry elevated risk and should be avoided; Resveratrol may interact with anticoagulants and has estrogen-like activity at high doses; and polyphenol supplements taken in isolation (as concentrated extracts) may behave differently than food-matrix polyphenols in terms of both efficacy and safety.',
        useCases: 'Cardiovascular protection, longevity pathway activation, antioxidant defense, metabolic health, neuroprotection, and cellular aging support.'
    },
    'Sleep Support': {
        short: 'Compounds studied for sleep onset, sleep quality, and circadian rhythm regulation',
        intro: 'Sleep support supplements target the neurochemical and physiological mechanisms governing sleep architecture, including melatonin signaling, GABAergic activity, adenosine metabolism, and hypothalamic-pituitary-adrenal (HPA) axis regulation. Melatonin (the primary compound in this category) holds Tier 1 evidence for circadian rhythm disorders and jet lag, with robust evidence from multiple meta-analyses. Related compounds including Magnesium (covered in Essential Nutrients), Ashwagandha (covered in Adaptogens), and L-Theanine (covered in Amino Acids) also have sleep-relevant evidence but are categorized under their primary mechanism.',
        safety: 'Sleep support supplements require careful dosing and timing considerations. Melatonin is most effective at low doses (0.5–3mg) taken 30–60 minutes before target bedtime — higher doses do not necessarily improve efficacy and may disrupt circadian phase. Short-term use for jet lag and shift work has the strongest evidence base; long-term daily use should involve periodic reassessment. Melatonin may interact with anticoagulants, immunosuppressants, and sedative medications. Avoid use during pregnancy without medical supervision. Do not combine with alcohol.',
        useCases: 'Sleep onset latency reduction, jet lag mitigation, circadian rhythm adjustment for shift workers, sleep quality improvement, and age-related sleep architecture changes.'
    },
    'Herbal Extracts': {
        short: 'Plant-derived supplements with traditional and modern clinical evidence',
        intro: 'Herbal extracts represent one of the oldest forms of supplementation, with many compounds having centuries of traditional use now validated by modern clinical research. This category encompasses a diverse range of plant-derived compounds, from adaptogens such as Ginkgo Biloba to metabolic regulators such as Berberine, each studied for distinct health domains including cognitive function, cardiovascular health, immune support, and metabolic regulation.',
        safety: 'Most herbal extracts in this category carry favorable safety profiles when used at studied dosages. However, several key considerations apply: drug interactions are common with herbs that affect cytochrome P450 enzymes (notably Ginkgo Biloba, Milk Thistle, and Berberine); standardization varies significantly between products — always verify extract standardization matches the form used in clinical studies; and pregnant or breastfeeding individuals should consult healthcare providers before using any herbal supplement.',
        useCases: 'Cognitive support, cardiovascular health, immune modulation, blood sugar regulation, liver support, anti-inflammatory effects, and adaptogenic stress resilience.'
    },
    'Essential Nutrients': {
        short: 'Vitamins, minerals, and essential compounds required for optimal physiological function',
        intro: 'Essential nutrients are compounds the human body requires for normal physiological function but cannot synthesize in sufficient quantities. This category includes vitamins (D3, C, B-complex, E), minerals (Magnesium, Zinc, Iron, Selenium), essential fatty acids (Omega-3), and related compounds (Choline, Inositol). These supplements have the strongest overall evidence base in our database, with multiple Tier 1 (Strong Evidence) ratings supported by large-scale randomized controlled trials and meta-analyses.',
        safety: 'Essential nutrients generally have well-established safety profiles with defined upper intake levels (ULs). Key considerations include: fat-soluble vitamins (D3, E) can accumulate and should not exceed recommended doses without medical supervision; mineral supplements (Iron, Zinc) can interact with medications and other minerals — timing and dosing matter; and individual requirements vary significantly based on age, sex, health status, and dietary intake. Blood testing can help identify true deficiencies before supplementing.',
        useCases: 'Addressing nutrient deficiencies, immune support, bone health, cardiovascular protection, energy metabolism, cognitive function, prenatal health, and antioxidant defense.'
    },
    'Antioxidants': {
        short: 'Compounds that neutralize oxidative stress and support cellular health',
        intro: 'Antioxidant supplements target oxidative stress — a key driver of cellular damage, aging, and chronic disease. This category includes both endogenous antioxidants the body naturally produces (such as CoQ10 and Alpha-Lipoic Acid) and exogenous compounds obtained from diet or supplementation (such as Quercetin, Astaxanthin, and Grape Seed Extract). Research in this category spans cardiovascular protection, neuroprotection, eye health, skin aging, and exercise recovery.',
        safety: 'Antioxidant supplements are generally well-tolerated at standard dosages. Important considerations include: high-dose antioxidant supplementation has shown mixed results in clinical trials — more is not always better; some antioxidants (notably Quercetin and Grape Seed Extract) can interact with blood thinners and certain medications; and the bioavailability of many antioxidant compounds varies significantly by formulation — liposomal, micronized, and lipid-based delivery systems may improve absorption.',
        useCases: 'Cardiovascular protection, neuroprotection, eye health (Lutein, Zeaxanthin, Astaxanthin), skin health, exercise recovery, mitochondrial support, and immune modulation.'
    },
    'Nootropics': {
        short: 'Cognitive enhancers targeting memory, focus, and neuroprotection',
        intro: 'Nootropics are compounds studied for their effects on cognitive function, including memory, attention, executive function, and neuroprotection. This category includes traditional botanicals (Bacopa monnieri), fungal extracts (Lion\'s Mane Mushroom), choline donors (Alpha-GPC, Citicoline), phospholipids (Phosphatidylserine), and synthetic racetams (Piracetam, Aniracetam). The evidence base ranges from Tier 1 (Citicoline, with strong meta-analytic support) to Tier 3 (emerging compounds with limited human trials).',
        safety: 'Most nootropics in this category have favorable safety profiles in studied populations. Key considerations include: cholinergic compounds (Alpha-GPC, Huperzine A, Citicoline) may have additive effects with cholinesterase inhibitors — medical supervision is recommended for individuals on such medications; racetam-class compounds (Piracetam, Aniracetam) are prescription medications in some jurisdictions; and cognitive effects typically require consistent use over weeks to months — acute effects are generally modest.',
        useCases: 'Memory enhancement, attention and focus, learning facilitation, neuroprotection, age-related cognitive support, and executive function improvement.'
    },
    'Amino Acids': {
        short: 'Protein building blocks and their derivatives with targeted neurological and metabolic effects',
        intro: 'Amino acid supplements include both essential amino acids and their bioactive derivatives, targeting neurotransmitter synthesis, stress modulation, and metabolic function. This category features L-Theanine (found naturally in tea and studied for its calming effects), 5-HTP (a serotonin precursor), Acetyl-L-Carnitine (supporting mitochondrial function and neuroprotection), and neurotransmitter precursors such as L-Tyrosine, Taurine, and GABA. These supplements offer targeted support for specific neurochemical pathways.',
        safety: 'Amino acid supplements generally have good safety profiles but warrant specific caution: 5-HTP should not be combined with SSRIs, MAOIs, or other serotonergic medications due to serotonin syndrome risk; L-Tyrosine may interact with thyroid medications and MAOIs; GABA supplementation has limited evidence for blood-brain barrier penetration in oral form; and individual amino acid supplementation at high doses can affect the absorption of other amino acids. Consulting a healthcare provider is particularly important for individuals on psychiatric medications.',
        useCases: 'Anxiety and stress management, mood support, cognitive enhancement under stress, neuroprotection, energy metabolism, and sleep quality improvement.'
    },
    'Performance Enhancers': {
        short: 'Compounds studied for physical performance, exercise capacity, and body composition',
        intro: 'Performance enhancers are supplements studied primarily for their effects on exercise capacity, strength, endurance, recovery, and body composition. This category includes some of the most well-researched supplements in the database — Creatine and Caffeine both hold Tier 1 (Strong Evidence) ratings with extensive meta-analytic support. The category also includes protein supplementation (Whey Protein), energy substrates (MCT Oil), and ergogenic aids (Beta-Alanine, Citrulline Malate, HMB, Betaine) with varying levels of evidence.',
        safety: 'Performance enhancers in this category generally have well-established safety profiles when used within studied dosage ranges. Key considerations include: Caffeine tolerance and sensitivity vary significantly between individuals — genetic polymorphisms in CYP1A2 affect metabolism; Creatine is one of the most extensively studied supplements with an excellent safety record, though adequate hydration is recommended; Beta-Alanine may cause harmless paresthesia (skin tingling) at standard doses; and protein supplementation above requirements does not provide additional benefit and may stress renal function in susceptible individuals.',
        useCases: 'Strength and power output, endurance performance, exercise recovery, lean body mass support, energy and alertness, and high-intensity exercise capacity.'
    }
};

// ---- HTML Template ----

function generateCategoryPage(categoryName, supplements) {
    const slug = slugify(categoryName);
    const desc = CATEGORY_DESCRIPTIONS[categoryName];
    const count = supplements.length;

    // Sort supplements: Tier 1 first, then Tier 2, etc.; within tier, alphabetical
    const sorted = [...supplements].sort((a, b) => {
        if (a.evidenceTier !== b.evidenceTier) return a.evidenceTier - b.evidenceTier;
        return a.name.localeCompare(b.name);
    });

    // Tier distribution
    const tierDist = {};
    sorted.forEach(s => { tierDist[s.evidenceTier] = (tierDist[s.evidenceTier] || 0) + 1; });

    // Average tier
    const avgTier = (sorted.reduce((sum, s) => sum + s.evidenceTier, 0) / count).toFixed(1);

    // Total citations — include both keyCitations and enhanced citations
    const totalCitations = sorted.reduce((sum, s) => sum + countSupplementCitations(s), 0);

    // Build supplement table rows
    const tableRows = sorted.map(s => {
        const benefits = [
            ...(s.primaryBenefits?.cognitive || []).slice(0, 2),
            ...(s.primaryBenefits?.nonCognitive || []).slice(0, 2)
        ].slice(0, 3);
        return `                            <tr>
                                <td><strong><a href="../supplements/${slugify(s.name)}.html" style="color:inherit;text-decoration:none;">${escHtml(s.name)}</a></strong>${s.scientificName && s.scientificName !== s.name ? `<br><span style="font-size:0.8em;color:var(--text-muted);font-style:italic">${escHtml(s.scientificName)}</span>` : ''}</td>
                                <td><span class="tier-badge tier-badge-${s.evidenceTier}">${getTierLabel(s.evidenceTier)}</span></td>
                                <td>${benefits.map(b => escHtml(b)).join(', ') || '—'}</td>
                                <td>${escHtml(s.dosageRange || 'See research')}</td>
                                <td>${countSupplementCitations(s)}</td>
                            </tr>`;
    }).join('\n');

    // Build supplement cards
    const suppCards = sorted.map(s => {
        const allBenefits = [
            ...(s.primaryBenefits?.cognitive || []),
            ...(s.primaryBenefits?.nonCognitive || [])
        ].slice(0, 5);
        const mechanisms = (s.mechanismsOfAction || []).slice(0, 2);
        const sideEffects = (s.safetyProfile?.commonSideEffects || []).slice(0, 3);
        return `                    <div class="supplement-card">
                        <div class="supplement-card-header">
                            <h3 class="supplement-card-name"><a href="../supplements/${slugify(s.name)}.html" style="color:inherit;text-decoration:none;">${escHtml(s.name)}</a></h3>
                            <span class="tier-badge tier-badge-${s.evidenceTier}">${getTierLabel(s.evidenceTier)}</span>
                        </div>
                        ${s.scientificName && s.scientificName !== s.name ? `<p style="font-style:italic;color:var(--text-muted);font-size:0.85rem;margin:0 0 0.75rem">${escHtml(s.scientificName)}</p>` : ''}
                        <div class="supplement-card-meta">
                            <span><i class="fas fa-flask"></i> ${countSupplementCitations(s)} citations</span>
                            <span><i class="fas fa-capsules"></i> ${escHtml(s.dosageRange || 'Varies')}</span>
                            ${s.safetyProfile?.rating ? `<span><i class="fas fa-shield-alt"></i> Safety: ${escHtml(s.safetyProfile.rating)}</span>` : ''}
                        </div>
                        <p style="margin:0.75rem 0 0.5rem;font-size:0.9rem;color:var(--text-secondary)"><strong>Key Benefits:</strong></p>
                        <ul style="margin:0 0 0.75rem;padding-left:1.25rem;font-size:0.875rem;color:var(--text-secondary)">
                            ${allBenefits.map(b => `<li>${escHtml(b)}</li>`).join('\n                            ')}
                        </ul>
                        ${mechanisms.length ? `<p style="margin:0 0 0.25rem;font-size:0.85rem;color:var(--text-muted)"><strong>Mechanisms:</strong> ${mechanisms.map(m => escHtml(m)).join('; ')}</p>` : ''}
                        ${sideEffects.length ? `<p style="margin:0;font-size:0.85rem;color:var(--text-muted)"><strong>Common side effects:</strong> ${sideEffects.map(e => escHtml(e)).join(', ')}</p>` : ''}
                    </div>`;
    }).join('\n');

    // Tier distribution summary for hero
    const tierSummaryParts = Object.entries(tierDist)
        .sort(([a], [b]) => a - b)
        .map(([tier, ct]) => `<span class="tier-badge tier-badge-${tier}" style="font-size:0.8rem">${ct} ${getTierLabel(tier)}</span>`);

    // Related categories (exclude self, pick up to 3)
    const allCats = TARGET_CATEGORIES.filter(c => c !== categoryName);
    const relatedCats = allCats.slice(0, 4);

    // JSON-LD ItemList
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `${categoryName} Supplements — Evidence-Based Database`,
        "description": desc.short,
        "url": `https://supplementdb.co/categories/${slug}.html`,
        "numberOfItems": count,
        "itemListElement": sorted.map((s, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": s.name,
            "description": [
                ...(s.primaryBenefits?.cognitive || []).slice(0, 2),
                ...(s.primaryBenefits?.nonCognitive || []).slice(0, 2)
            ].slice(0, 3).join(', ') || s.name,
            "url": `https://supplementdb.co/categories/${slug}.html#${slugify(s.name)}`
        }))
    };

    const title = `${categoryName} — Evidence-Based Supplement Database | SupplementDB`;
    const metaDesc = `Explore ${count} evidence-based ${categoryName.toLowerCase()} supplements with clinical research data, dosage guidelines, and safety profiles. Backed by ${totalCitations}+ peer-reviewed citations.`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escHtml(title)}</title>
    <meta name="description" content="${escHtml(metaDesc)}">
    <link rel="canonical" href="https://supplementdb.co/categories/${slug}.html">
    <meta property="og:title" content="${escHtml(title)}">
    <meta property="og:description" content="${escHtml(metaDesc)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://supplementdb.co/categories/${slug}.html">
    <meta property="og:image" content="https://supplementdb.co/assets/og-cat-${slug}.svg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="SupplementDB">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escHtml(title)}">
    <meta name="twitter:description" content="${escHtml(metaDesc)}">
    <meta name="twitter:image" content="https://supplementdb.co/assets/og-cat-${slug}.svg">

    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">

    <!-- PostHog Analytics -->
    <script>
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageviewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('phc_esUgVXZLrnPplrCmbAQ8RlYbHuXS38hewwGHnLqtMF7', {
            api_host: 'https://us.i.posthog.com',
            person_profiles: 'identified_only',
            capture_pageview: true,
            capture_pageleave: true,
            autocapture: true
        });
    </script>

    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../legal/legal-shared.css">
    <link rel="stylesheet" href="../css/content-shared.css">

    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 4)}
    </script>
</head>
<body class="legal-page">
    <!-- Navigation -->
    <nav class="legal-nav">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <a href="../index.html" class="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity">
                <i class="fas fa-pills text-xl"></i>
                <span class="font-bold text-lg">SupplementDB</span>
            </a>
            <div class="flex items-center space-x-4">
                <a href="../index.html" class="text-gray-300 hover:text-white text-sm transition-colors">
                    <i class="fas fa-arrow-left mr-1"></i> Back to Database
                </a>
            </div>
        </div>
    </nav>

    <!-- Breadcrumbs -->
    <div class="content-breadcrumb">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <a href="../index.html">Home</a>
            <span class="content-breadcrumb-sep">/</span>
            <span>Categories</span>
            <span class="content-breadcrumb-sep">/</span>
            <span>${escHtml(categoryName)}</span>
        </div>
    </div>

    <!-- Main Content -->
    <main class="legal-content">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            <!-- Hero Section -->
            <div class="content-hero">
                <h1>${escHtml(categoryName)}</h1>
                <p class="content-hero-subtitle">${escHtml(desc.short)}</p>
                <div class="content-hero-stats">
                    <div class="content-hero-stat">
                        <span class="content-hero-stat-number">${count}</span>
                        <span class="content-hero-stat-label">Supplements</span>
                    </div>
                    <div class="content-hero-stat">
                        <span class="content-hero-stat-number">${totalCitations}</span>
                        <span class="content-hero-stat-label">Citations</span>
                    </div>
                    <div class="content-hero-stat">
                        <span class="content-hero-stat-number">${avgTier}</span>
                        <span class="content-hero-stat-label">Avg. Evidence Tier</span>
                    </div>
                </div>
            </div>

            <!-- Share Bar -->
            <div class="share-bar">
                <span class="share-bar-label">Share</span>
                <div class="share-bar-buttons">
                    <button class="share-btn" data-share="twitter"><i class="fa-brands fa-x-twitter"></i> Twitter</button>
                    <button class="share-btn" data-share="linkedin"><i class="fa-brands fa-linkedin"></i> LinkedIn</button>
                    <button class="share-btn" data-share="facebook"><i class="fa-brands fa-facebook"></i> Facebook</button>
                    <button class="share-btn share-btn-copy" data-share="copy"><i class="fas fa-link"></i> Copy Link</button>
                </div>
            </div>

            <!-- Trust Signal Bar -->
            <div class="trust-bar">
                <span class="trust-bar-item"><i class="fas fa-check-circle"></i> ${totalCitations}+ Verified Citations</span>
                <span class="trust-bar-divider"></span>
                <span class="trust-bar-item"><i class="fas fa-shield-alt"></i> FDA-Compliant Language</span>
                <span class="trust-bar-divider"></span>
                <span class="trust-bar-item"><i class="fas fa-ban"></i> No Industry Funding</span>
                <span class="trust-bar-divider"></span>
                <span class="trust-bar-item"><i class="fas fa-flask"></i> <a href="../methodology.html">Our Methodology</a></span>
            </div>

            <!-- Overview Section -->
            <section class="content-section" id="overview">
                <h2>Overview</h2>
                <p>${desc.intro}</p>
                <p><strong>Common use cases:</strong> ${escHtml(desc.useCases)}</p>
            </section>

            <!-- Evidence Summary -->
            <section class="content-section" id="evidence-summary">
                <h2>Evidence Summary</h2>
                <p>The ${count} supplements in this category span all four evidence tiers. Here is the distribution:</p>
                <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin:1rem 0 1.5rem">
                    ${tierSummaryParts.join('\n                    ')}
                </div>

                <!-- Featured Snippet: List -->
                <div class="snippet-list">
                    <h3>Top Evidence-Based ${escHtml(categoryName)} Supplements</h3>
                    <ol>
${sorted.slice(0, 8).map(s => {
    const topBenefit = [...(s.primaryBenefits?.cognitive || []), ...(s.primaryBenefits?.nonCognitive || [])][0] || '';
    return `                        <li><strong><a href="../supplements/${slugify(s.name)}.html" style="color:var(--accent);text-decoration:none;">${escHtml(s.name)}</a></strong> (${getTierLabel(s.evidenceTier)}) — ${escHtml(topBenefit)}</li>`;
}).join('\n')}
                    </ol>
                </div>
            </section>

            <!-- Supplements Table -->
            <section class="content-section" id="supplements-table">
                <h2>All ${escHtml(categoryName)} Supplements</h2>
                <p>The table below lists all ${count} supplements in this category, sorted by evidence tier (strongest evidence first).</p>

                <!-- Featured Snippet: Table -->
                <div class="snippet-table">
                    <div class="content-data-table-wrap">
                        <table class="content-data-table">
                            <thead>
                                <tr>
                                    <th>Supplement</th>
                                    <th>Evidence Tier</th>
                                    <th>Key Benefits</th>
                                    <th>Dosage Range</th>
                                    <th>Citations</th>
                                </tr>
                            </thead>
                            <tbody>
${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- Supplement Cards -->
            <section class="content-section" id="supplement-profiles">
                <h2>Supplement Profiles</h2>
                <p>Detailed profiles for each supplement in this category, including benefits, mechanisms, and safety data.</p>
                <div class="supplement-card-grid">
${suppCards}
                </div>
            </section>

            <!-- Safety Considerations -->
            <section class="content-section" id="safety">
                <h2>Safety Considerations</h2>
                <p>${desc.safety}</p>
                <div class="content-callout content-callout-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Medical Disclaimer:</strong> The information on this page is for educational purposes only and should not replace professional medical advice. Always consult a qualified healthcare provider before starting any supplement regimen. See our <a href="../legal/disclaimer.html">full medical disclaimer</a>.
                    </div>
                </div>
            </section>

            <!-- Related Categories -->
            <section class="content-section" id="related-categories">
                <h2>Explore Other Categories</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
${relatedCats.map(cat => {
    const catSlug = slugify(cat);
    const catDesc = CATEGORY_DESCRIPTIONS[cat];
    return `                    <a href="${catSlug}.html" style="display:block;padding:1.25rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);text-decoration:none;transition:box-shadow 0.15s,border-color 0.15s">
                        <strong style="color:var(--accent);font-size:1rem">${escHtml(cat)}</strong>
                        <p style="color:var(--text-muted);font-size:0.85rem;margin:0.5rem 0 0;line-height:1.5">${escHtml(catDesc?.short || '')}</p>
                    </a>`;
}).join('\n')}
                </div>
            </section>

            <!-- Back to Database -->
            <div class="legal-links-box" style="margin-top:2.5rem">
                <h3>Related Resources</h3>
                <ul>
                    <li><a href="../index.html"><i class="fas fa-database mr-2"></i>Full Supplement Database</a></li>
                    <li><a href="../guides/anxiety-stress.html"><i class="fas fa-brain mr-2"></i>Anxiety &amp; Stress Guide</a></li>
                    <li><a href="../guides/cognitive-performance.html"><i class="fas fa-lightbulb mr-2"></i>Cognitive Performance Guide</a></li>
                    <li><a href="../guides/cardiovascular.html"><i class="fas fa-heartbeat mr-2"></i>Cardiovascular Health Guide</a></li>
                    <li><a href="../methodology.html"><i class="fas fa-flask mr-2"></i>Research Methodology</a></li>
                    <li><a href="../about.html"><i class="fas fa-info-circle mr-2"></i>About SupplementDB</a></li>
                    <li><a href="../faq.html"><i class="fas fa-question-circle mr-2"></i>Frequently Asked Questions</a></li>
                </ul>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="legal-footer">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025&ndash;2026 SupplementDB. All rights reserved.</p>
            <p class="mt-2 text-sm text-gray-400">
                <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice.
            </p>
        </div>
    </footer>
    <script src="../js/share-bar.js"></script>
</body>
</html>`;
}

// ---- Utilities ----

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ---- Main ----

function main() {
    console.log('SupplementDB — Category Page Generator');
    console.log('======================================\n');

    const db = loadSupplementData();
    if (!db) {
        console.error('ERROR: Failed to load supplement data');
        process.exit(1);
    }
    console.log(`Loaded ${db.supplements.length} supplements\n`);

    const groups = groupByCategory(db.supplements);
    const outDir = path.join(__dirname, '..', 'categories');

    // Ensure output directory exists
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    let generated = 0;
    for (const catName of TARGET_CATEGORIES) {
        const supps = groups[catName];
        if (!supps || supps.length === 0) {
            console.warn(`WARNING: No supplements found for category "${catName}"`);
            continue;
        }

        const slug = slugify(catName);
        const filePath = path.join(outDir, `${slug}.html`);
        const html = generateCategoryPage(catName, supps);

        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`✓ Generated ${slug}.html (${supps.length} supplements, ${(html.length / 1024).toFixed(1)}KB)`);
        generated++;
    }

    console.log(`\nDone! Generated ${generated} category pages in /categories/`);
}

main();
