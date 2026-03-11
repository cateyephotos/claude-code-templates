#!/usr/bin/env node
/**
 * generate-evidence-pages.js — Problem × Supplement Evidence Page Generator
 *
 * Creates /evidence/{problem-slug}/{supplement-slug}.html pages by joining
 * data/problems.js (health domains) with data/supplements.js (supplement data).
 *
 * Wave 1: 5 domains × top 5 supplements = 25 pages
 *   - sleep, anxiety, cognitive-performance, metabolic-health, inflammation
 *
 * Each page shows evidence for a specific supplement applied to a specific
 * health problem, with mechanism analysis, dosage protocols, safety info,
 * and clinical citations.
 *
 * Usage: node scripts/generate-evidence-pages.js
 */

"use strict";

const fs = require("fs");
const path = require("path");
const {
  loadSupplementData,
  loadProblemData,
  slugify,
  getTierLabel,
  getTierColor,
  normalizeCategory,
} = require("./parse-data");

// ── Configuration ──────────────────────────────────────────────────────────────

const WAVE_1_DOMAINS = [
  "sleep",
  "anxiety",
  "cognitive-performance",
  "metabolic-health",
  "inflammation",
];

const SUPPS_PER_DOMAIN = 5;
const BASE_URL = "https://supplementdb.co";
const TODAY = new Date().toISOString().split("T")[0];

// Map domain slugs to guide page slugs (for cross-linking evidence → guide)
const DOMAIN_TO_GUIDE = {
  sleep: "sleep",
  anxiety: "anxiety-stress",
  "cognitive-performance": "cognitive-performance",
  "metabolic-health": "metabolic-health",
  inflammation: "joint-pain",
};

// ── HTML Helpers ────────────────────────────────────────────────────────────────

function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tierBadgeHtml(tier) {
  const label = getTierLabel(tier);
  const color = getTierColor(tier);
  return `<span class="tier-badge" style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;">${esc(label)}</span>`;
}

// ── Data Merging ────────────────────────────────────────────────────────────────

/**
 * Merge problem-specific supplement data with full supplement record.
 * Problem data (from problems.js) may have rich fields (mechanismMatch, keyEvidence, etc.)
 * or abbreviated fields (just supplementId, name, evidenceTier, relevanceScore).
 * Falls back to supplement-wide data from supplements.js when problem-specific fields are absent.
 */
function mergeSupplementData(problemSupp, fullSupplement) {
  return {
    // Identity
    id: fullSupplement.id,
    name: problemSupp.name || fullSupplement.name,
    scientificName: fullSupplement.scientificName || "",
    category: fullSupplement.category || "",
    slug: slugify(problemSupp.name || fullSupplement.name),

    // Evidence ranking (from problem context)
    evidenceTier: problemSupp.evidenceTier || fullSupplement.evidenceTier,
    relevanceScore: problemSupp.relevanceScore || 0,

    // Mechanisms — prefer problem-specific, fall back to supplement-wide
    mechanisms:
      problemSupp.mechanismMatch ||
      (fullSupplement.mechanismsOfAction || []).map(
        (m) => m.mechanism || m.name || m
      ),

    // Problem-specific effects (only for rich domains like sleep)
    specificEffects: problemSupp.sleepSpecificEffects || null,

    // Dosage — prefer problem-specific
    dosageRange:
      problemSupp.dosageRange ||
      fullSupplement.dosageRange ||
      "Consult product label",

    // Key evidence — prefer problem-specific study
    keyEvidence: problemSupp.keyEvidence || null,

    // Safety — prefer problem-specific
    safetyProfile:
      problemSupp.safetyProfile || fullSupplement.safetyProfile || null,

    // Guide notes (problem-specific)
    guideNotes: problemSupp.guideNotes || "",

    // Full supplement data for citations and benefits
    effectSizes: fullSupplement.effectSizes || {},
    enhancedCitations: fullSupplement.enhancedCitations || {},
    keyCitations: fullSupplement.keyCitations || [],
    primaryBenefits: fullSupplement.primaryBenefits || {},
    mechanismsOfAction: fullSupplement.mechanismsOfAction || [],
    optimalDuration: fullSupplement.optimalDuration || "",
  };
}

// ── Page Generator ──────────────────────────────────────────────────────────────

function generateEvidencePage(domain, merged, allDomains) {
  const pageTitle = `${merged.name} for ${domain.name}`;
  const metaTitle = `${merged.name} for ${domain.name} — Evidence & Dosage | SupplementDB`;
  const metaDescription = `Clinical evidence review of ${merged.name} for ${domain.name.toLowerCase()}. Includes dosage protocols, mechanism analysis, safety profile, and peer-reviewed citations.`;
  const canonicalUrl = `${BASE_URL}/evidence/${domain.slug}/${merged.slug}.html`;
  const guideSlug = DOMAIN_TO_GUIDE[domain.slug] || domain.slug;

  // Count citations
  const citationCount = (merged.keyCitations || []).length;
  const enhancedBenefits = merged.enhancedCitations?.benefits || [];

  // TOC items
  const tocItems = [
    { id: "evidence-overview", label: "Evidence Overview" },
    { id: "problem-context", label: "Problem Context" },
    { id: "evidence-detail", label: "Evidence Detail" },
    { id: "mechanisms", label: "Mechanisms" },
    { id: "dosage", label: "Dosage & Protocol" },
    { id: "safety", label: "Safety Profile" },
    { id: "citations", label: "Clinical Citations" },
    { id: "related", label: "Related Evidence" },
  ];

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pageTitle,
    description: metaDescription,
    datePublished: TODAY,
    dateModified: TODAY,
    publisher: {
      "@type": "Organization",
      name: "SupplementDB",
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    about: {
      "@type": "Drug",
      name: merged.name,
      description: `Evidence-based supplement for ${domain.name.toLowerCase()}`,
    },
  };

  // ── Build HTML ──────────────────────────────────────────────────────────────
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(metaTitle)}</title>
    <meta name="description" content="${esc(metaDescription)}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:title" content="${esc(metaTitle)}">
    <meta property="og:description" content="${esc(metaDescription)}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="SupplementDB">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(metaTitle)}">
    <meta name="twitter:description" content="${esc(metaDescription)}">

    <link rel="icon" type="image/svg+xml" href="../../assets/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="../../assets/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../../assets/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../../assets/apple-touch-icon.png">

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
    <link rel="stylesheet" href="../../legal/legal-shared.css">
    <link rel="stylesheet" href="../../css/content-shared.css">

    <!-- Clerk Auth + Convex CDN -->
    <script src="https://unpkg.com/@clerk/clerk-js@latest/dist/clerk.browser.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/convex@latest/dist/browser/index.global.js" crossorigin="anonymous"></script>

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body class="content-page">
    <!-- Navigation -->
    <nav class="legal-nav">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <a href="../../index.html" class="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity">
                <i class="fas fa-pills text-xl"></i>
                <span class="font-bold text-lg">SupplementDB</span>
            </a>
            <div class="flex items-center space-x-4">
                <a href="../../guides/${guideSlug}.html" class="text-gray-300 hover:text-white text-sm transition-colors hidden sm:inline">${esc(domain.name)} Guide</a>
                <a href="../../index.html" class="text-gray-300 hover:text-white text-sm transition-colors">
                    <i class="fas fa-arrow-left mr-1"></i> Database
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="content-hero">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav class="content-breadcrumb" aria-label="Breadcrumb">
                <a href="../../index.html">Home</a>
                <span class="separator"><i class="fas fa-chevron-right" style="font-size:0.65rem"></i></span>
                <span>Evidence</span>
                <span class="separator"><i class="fas fa-chevron-right" style="font-size:0.65rem"></i></span>
                <a href="../../guides/${guideSlug}.html">${esc(domain.name)}</a>
                <span class="separator"><i class="fas fa-chevron-right" style="font-size:0.65rem"></i></span>
                <span>${esc(merged.name)}</span>
            </nav>
            <h1>${esc(pageTitle)}</h1>
            <p class="hero-subtitle">Clinical evidence review — dosage, mechanisms, safety, and citations</p>
            <div class="hero-meta">
                <span class="hero-stat">${tierBadgeHtml(merged.evidenceTier)}</span>
                <span class="hero-stat"><i class="fas fa-star"></i> Relevance: ${merged.relevanceScore}/100</span>
                <span class="hero-stat"><i class="fas fa-file-lines"></i> ${citationCount}+ Citations</span>
                <span class="hero-stat"><i class="fas fa-calendar"></i> Updated ${TODAY}</span>
            </div>
        </div>
    </section>

    <!-- Trust Signal Bar -->
    <div class="trust-bar" style="max-width:64rem;margin:1rem auto;">
        <span class="trust-bar-item"><i class="fas fa-check-circle"></i> Peer-Reviewed Sources</span>
        <span class="trust-bar-divider"></span>
        <span class="trust-bar-item"><i class="fas fa-shield-alt"></i> FDA-Compliant Language</span>
        <span class="trust-bar-divider"></span>
        <span class="trust-bar-item"><i class="fas fa-ban"></i> No Industry Funding</span>
        <span class="trust-bar-divider"></span>
        <span class="trust-bar-item"><i class="fas fa-flask"></i> <a href="../../methodology.html">Our Methodology</a></span>
    </div>

    <!-- Main Content with TOC -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div style="display:grid; grid-template-columns: 1fr 220px; gap: 3rem; align-items: start;">
            <article>

                <!-- Medical Disclaimer -->
                <div class="content-disclaimer">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div><strong>Medical Disclaimer:</strong> This evidence review is for informational purposes only. It does not constitute medical advice. Always consult a qualified healthcare professional before starting any supplement. <a href="../../legal/disclaimer.html" style="color:#92400e; text-decoration:underline;">Read full disclaimer</a>.</div>
                </div>
`;

  // ── Section 1: Evidence Overview ────────────────────────────────────────
  html += `
                <section class="content-section" id="evidence-overview">
                    <h2>Evidence Overview</h2>
                    <div class="content-table-wrap" style="margin-bottom:1.5rem;">
                        <table class="content-table">
                            <tbody>
                                <tr>
                                    <td><strong>Supplement</strong></td>
                                    <td>${esc(merged.name)}${merged.scientificName ? ` <em>(${esc(merged.scientificName)})</em>` : ""}</td>
                                </tr>
                                <tr>
                                    <td><strong>Health Domain</strong></td>
                                    <td>${esc(domain.name)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Evidence Tier</strong></td>
                                    <td>${tierBadgeHtml(merged.evidenceTier)} (${esc(getTierLabel(merged.evidenceTier))})</td>
                                </tr>
                                <tr>
                                    <td><strong>Relevance Score</strong></td>
                                    <td>${merged.relevanceScore}/100</td>
                                </tr>
                                <tr>
                                    <td><strong>Category</strong></td>
                                    <td>${esc(normalizeCategory(merged.category))}</td>
                                </tr>
                                <tr>
                                    <td><strong>Recommended Dosage</strong></td>
                                    <td>${esc(merged.dosageRange)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
`;

  // ── Section 2: Problem Context ──────────────────────────────────────────
  const physiology = domain.physiologyOverview;
  html += `
                <section class="content-section" id="problem-context">
                    <h2>Understanding ${esc(domain.name)}</h2>
                    <p>${esc(physiology.summary)}</p>
                    <h3>Key Physiological Systems</h3>
                    <ul>
`;
  (physiology.systems || []).forEach((sys) => {
    html += `                        <li><strong>${esc(sys)}</strong></li>\n`;
  });
  html += `                    </ul>
                    <h3>Key Signaling Molecules</h3>
                    <ul>
`;
  (physiology.keyNeurotransmitters || []).forEach((nt) => {
    html += `                        <li>${esc(nt)}</li>\n`;
  });
  html += `                    </ul>
                </section>
`;

  // ── Section 3: Evidence Detail ──────────────────────────────────────────
  html += `
                <section class="content-section" id="evidence-detail">
                    <h2>Evidence for ${esc(merged.name)} in ${esc(domain.name)}</h2>
`;

  // Problem-specific effects (rich domains like sleep, mood-depression)
  if (merged.specificEffects) {
    html += `                    <h3>Problem-Specific Effects</h3>
                    <div class="content-table-wrap">
                        <table class="content-table">
                            <tbody>
`;
    for (const [key, value] of Object.entries(merged.specificEffects)) {
      if (key === "populations") {
        html += `                                <tr>
                                    <td><strong>Studied Populations</strong></td>
                                    <td>${esc(Array.isArray(value) ? value.join(", ") : String(value))}</td>
                                </tr>\n`;
      } else {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase());
        html += `                                <tr>
                                    <td><strong>${esc(label)}</strong></td>
                                    <td>${esc(String(value))}</td>
                                </tr>\n`;
      }
    }
    html += `                            </tbody>
                        </table>
                    </div>\n`;
  }

  // Key evidence study
  if (merged.keyEvidence) {
    const ke = merged.keyEvidence;
    html += `                    <h3>Key Study</h3>
                    <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:1rem 1.25rem;border-radius:0 0.5rem 0.5rem 0;margin-bottom:1.5rem;">
                        <p style="margin:0 0 0.5rem 0;font-weight:600;">${esc(ke.title || "")}</p>
                        <p style="margin:0 0 0.25rem 0;font-size:0.9rem;color:#475569;">${esc(ke.authors || "")} (${esc(String(ke.year || ""))}). <em>${esc(ke.journal || "")}</em>.</p>
                        <p style="margin:0;font-size:0.85rem;color:#64748b;">
                            ${ke.studyType ? `Study type: ${esc(ke.studyType)}` : ""}
                            ${ke.sampleSize ? ` &middot; Sample: ${esc(ke.sampleSize)}` : ""}
                            ${ke.pmid ? ` &middot; PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/${esc(ke.pmid)}/" target="_blank" rel="noopener" style="color:#2563eb;">${esc(ke.pmid)}</a>` : ""}
                        </p>
                    </div>\n`;
  }

  // Guide notes
  if (merged.guideNotes) {
    html += `                    <p><strong>Clinical Notes:</strong> ${esc(merged.guideNotes)}</p>\n`;
  }

  // effectSizes relevant to this domain
  const relevantEffects = getRelevantEffectSizes(
    merged.effectSizes,
    domain.slug
  );
  if (relevantEffects.length > 0) {
    html += `                    <h3>Measured Effect Sizes</h3>
                    <div class="content-table-wrap">
                        <table class="content-table">
                            <thead>
                                <tr>
                                    <th>Outcome</th>
                                    <th>Effect Size</th>
                                    <th>Study Type</th>
                                    <th>Sample</th>
                                </tr>
                            </thead>
                            <tbody>
`;
    relevantEffects.forEach((ef) => {
      html += `                                <tr>
                                    <td>${esc(ef.label)}</td>
                                    <td><strong>${esc(ef.value)}</strong></td>
                                    <td>${esc(ef.studyType || "—")}</td>
                                    <td>${esc(ef.sample || "—")}</td>
                                </tr>\n`;
    });
    html += `                            </tbody>
                        </table>
                    </div>\n`;
  }

  html += `                </section>
`;

  // ── Section 4: Mechanisms ───────────────────────────────────────────────
  html += `
                <section class="content-section" id="mechanisms">
                    <h2>Mechanisms of Action</h2>
                    <p>How ${esc(merged.name)} affects ${esc(domain.name.toLowerCase())} through biological pathways:</p>
                    <ul>
`;
  const mechanisms = merged.mechanisms || [];
  if (mechanisms.length > 0) {
    mechanisms.forEach((m) => {
      html += `                        <li><strong>${esc(String(m))}</strong></li>\n`;
    });
  } else {
    // Fallback to full mechanismsOfAction array
    (merged.mechanismsOfAction || []).forEach((m) => {
      const name = m.mechanism || m.name || String(m);
      const desc = m.description ? ` — ${m.description}` : "";
      html += `                        <li><strong>${esc(name)}</strong>${esc(desc)}</li>\n`;
    });
  }
  html += `                    </ul>
                </section>
`;

  // ── Section 5: Dosage ──────────────────────────────────────────────────
  html += `
                <section class="content-section" id="dosage">
                    <h2>Dosage &amp; Protocol</h2>
                    <div class="content-table-wrap">
                        <table class="content-table">
                            <tbody>
                                <tr>
                                    <td><strong>Recommended Dosage</strong></td>
                                    <td>${esc(merged.dosageRange)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Optimal Duration</strong></td>
                                    <td>${esc(merged.optimalDuration || "Consult healthcare provider for duration guidance")}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p style="margin-top:1rem;font-size:0.9rem;color:#64748b;"><i class="fas fa-info-circle"></i> Dosage ranges are based on clinical trial protocols. Individual needs may vary. Always start with the lower end and consult a healthcare provider.</p>
                </section>
`;

  // ── Section 6: Safety ──────────────────────────────────────────────────
  html += `
                <section class="content-section" id="safety">
                    <h2>Safety Profile</h2>
`;
  if (typeof merged.safetyProfile === "string") {
    html += `                    <p>${esc(merged.safetyProfile)}</p>\n`;
  } else if (merged.safetyProfile && typeof merged.safetyProfile === "object") {
    const sp = merged.safetyProfile;
    html += `                    <div class="content-table-wrap">
                        <table class="content-table">
                            <tbody>
`;
    if (sp.rating)
      html += `                                <tr><td><strong>Safety Rating</strong></td><td>${esc(sp.rating)}</td></tr>\n`;
    if (sp.sideEffects && sp.sideEffects.length)
      html += `                                <tr><td><strong>Common Side Effects</strong></td><td>${esc(sp.sideEffects.join(", "))}</td></tr>\n`;
    if (sp.contraindications && sp.contraindications.length)
      html += `                                <tr><td><strong>Contraindications</strong></td><td>${esc(sp.contraindications.join(", "))}</td></tr>\n`;
    if (sp.drugInteractions && sp.drugInteractions.length)
      html += `                                <tr><td><strong>Drug Interactions</strong></td><td>${esc(sp.drugInteractions.join(", "))}</td></tr>\n`;
    if (sp.maxDosage)
      html += `                                <tr><td><strong>Maximum Dosage</strong></td><td>${esc(sp.maxDosage)}</td></tr>\n`;
    html += `                            </tbody>
                        </table>
                    </div>\n`;
  } else {
    html += `                    <p>Safety data for this specific application is being compiled. Refer to the general supplement safety profile and consult a healthcare professional.</p>\n`;
  }
  html += `                    <p style="margin-top:1rem;font-size:0.9rem;color:#92400e;"><i class="fas fa-exclamation-triangle"></i> Always inform your healthcare provider about all supplements you are taking, especially if you use prescription medications.</p>
                </section>
`;

  // ── Section 7: Citations ───────────────────────────────────────────────
  html += `
                <section class="content-section" id="citations">
                    <h2>Clinical Citations</h2>
                    <p>Peer-reviewed research referenced in this evidence review:</p>
                    <ol class="citation-list">
`;
  let citNum = 0;

  // Key evidence citation first
  if (merged.keyEvidence) {
    const ke = merged.keyEvidence;
    citNum++;
    const pmidLink = ke.pmid
      ? ` <a href="https://pubmed.ncbi.nlm.nih.gov/${esc(ke.pmid)}/" target="_blank" rel="noopener" style="color:#2563eb;">PMID: ${esc(ke.pmid)}</a>`
      : "";
    html += `                        <li>${esc(ke.authors || "Unknown authors")} (${esc(String(ke.year || ""))}). ${esc(ke.title || "")}. <em>${esc(ke.journal || "")}</em>.${pmidLink}</li>\n`;
  }

  // keyCitations from supplement data
  (merged.keyCitations || []).forEach((c) => {
    // Skip if same as keyEvidence
    if (
      merged.keyEvidence &&
      c.pmid &&
      c.pmid === merged.keyEvidence.pmid
    )
      return;
    citNum++;
    const doi = c.doi
      ? ` <a class="citation-doi" href="https://doi.org/${esc(c.doi)}" target="_blank" rel="noopener">${esc(c.doi)}</a>`
      : "";
    const pmid = c.pmid ? ` PMID: ${esc(String(c.pmid))}` : "";
    html += `                        <li>${esc(c.authors || "")} (${esc(String(c.year || ""))}). ${esc(c.title || "")}. <em>${esc(c.journal || "")}</em>.${doi}${pmid}</li>\n`;
  });

  if (citNum === 0) {
    html += `                        <li>Citations for this evidence review are being compiled from the SupplementDB database.</li>\n`;
  }

  html += `                    </ol>
                </section>
`;

  // ── Section 8: Related Evidence ─────────────────────────────────────────
  html += buildRelatedSection(domain, merged, allDomains, guideSlug);

  // ── Newsletter CTA ──────────────────────────────────────────────────────
  html += `
                <!-- Email Capture -->
                <section class="newsletter-section" id="subscribe">
                    <div class="newsletter-inner">
                        <h3><i class="fas fa-envelope-open-text"></i> Get ${esc(merged.name)} Research Updates</h3>
                        <p>Stay informed when new studies on ${esc(merged.name)} for ${esc(domain.name.toLowerCase())} are published or evidence tiers are updated.</p>
                        <div id="guide-newsletter-container">
                            <form id="guide-newsletter-form" class="newsletter-form" onsubmit="return handleGuideNewsletter(event)">
                                <input type="email" id="guide-newsletter-email" placeholder="your@email.com" required>
                                <button type="submit"><i class="fas fa-paper-plane"></i> Subscribe</button>
                            </form>
                            <p id="guide-newsletter-success" class="newsletter-success hidden">
                                <i class="fas fa-check-circle"></i> Subscribed! We'll notify you of relevant research updates.
                            </p>
                            <p id="guide-newsletter-already" class="newsletter-already hidden">
                                <i class="fas fa-info-circle"></i> You're already subscribed. Thank you!
                            </p>
                        </div>
                        <p class="newsletter-privacy"><i class="fas fa-lock"></i> No spam. <a href="../../legal/privacy.html">Privacy Policy</a></p>
                    </div>
                </section>
`;

  // ── Close main column, add TOC sidebar ──────────────────────────────────
  html += `
            </article><!-- end main column -->

            <!-- Sidebar TOC (desktop only) -->
            <aside class="content-toc" aria-label="Table of Contents">
                <h4>Contents</h4>
                <ul>
`;
  tocItems.forEach((item) => {
    html += `                    <li><a href="#${item.id}">${esc(item.label)}</a></li>\n`;
  });
  html += `                </ul>
            </aside>
        </div>
    </main>

    <!-- Footer -->
    <footer class="legal-footer">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2025&ndash;2026 SupplementDB. All rights reserved.</p>
            <p class="mt-2 text-sm text-gray-400">
                <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice.
                <a href="../../legal/disclaimer.html" style="color:#9ca3af; text-decoration:underline;">Full disclaimer</a>
            </p>
            <p class="mt-2 text-sm text-gray-500">
                <a href="../../about.html" style="color:#9ca3af;">About</a> &middot;
                <a href="../../methodology.html" style="color:#9ca3af;">Methodology</a> &middot;
                <a href="../../faq.html" style="color:#9ca3af;">FAQ</a> &middot;
                <a href="../../legal/privacy.html" style="color:#9ca3af;">Privacy</a> &middot;
                <a href="../../legal/terms.html" style="color:#9ca3af;">Terms</a>
            </p>
        </div>
    </footer>

    <!-- Smooth scroll for TOC -->
    <script>
        document.querySelectorAll('.content-toc a').forEach(function(a) {
            a.addEventListener('click', function(e) {
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    history.replaceState(null, '', this.getAttribute('href'));
                }
            });
        });
        var tocLinks = document.querySelectorAll('.content-toc a');
        var sections = Array.from(tocLinks).map(function(a) {
            return document.querySelector(a.getAttribute('href'));
        }).filter(Boolean);
        window.addEventListener('scroll', function() {
            var scrollY = window.scrollY + 120;
            var active = sections[0];
            sections.forEach(function(sec) { if (sec.offsetTop <= scrollY) active = sec; });
            tocLinks.forEach(function(a) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + (active ? active.id : ''));
            });
        });

        // Newsletter handler
        window.handleGuideNewsletter = function(e) {
            e.preventDefault();
            var email = document.getElementById('guide-newsletter-email').value.trim();
            if (!email) return false;
            var subscribed = JSON.parse(localStorage.getItem('sdb_newsletter') || '[]');
            if (subscribed.indexOf(email) !== -1) {
                document.getElementById('guide-newsletter-form').classList.add('hidden');
                document.getElementById('guide-newsletter-already').classList.remove('hidden');
                return false;
            }
            if (typeof posthog !== 'undefined') {
                posthog.identify(email);
                posthog.people.set({
                    email: email,
                    newsletter_subscribed: true,
                    subscribed_evidence: '${domain.slug}/${merged.slug}',
                    signup_source: 'evidence_${domain.slug}_${merged.slug}',
                    signup_date: new Date().toISOString()
                });
                posthog.capture('evidence_email_captured', {
                    source: 'evidence',
                    domain_slug: '${domain.slug}',
                    supplement_slug: '${merged.slug}',
                    email: email
                });
            }
            subscribed.push(email);
            localStorage.setItem('sdb_newsletter', JSON.stringify(subscribed));
            document.getElementById('guide-newsletter-form').classList.add('hidden');
            document.getElementById('guide-newsletter-success').classList.remove('hidden');
            return false;
        };
    </script>

    <!-- Auth, RBAC & Content Gate -->
    <script src="../../js/auth.js"></script>
    <script src="../../js/convex-client.js"></script>
    <script src="../../js/rbac.js"></script>
    <script src="../../js/auth-ui.js"></script>

    <script src="../../js/content-gate.js"></script>
</body>
</html>`;

  return html;
}

// ── Related Section Builder ─────────────────────────────────────────────────────

function buildRelatedSection(domain, merged, allDomains, guideSlug) {
  let html = `
                <section class="content-section" id="related">
                    <h2>Related Evidence</h2>
                    <div class="related-content">
                        <h3>Other Supplements for ${esc(domain.name)}</h3>
                        <div class="related-content-grid">
`;

  // Sibling supplements in same domain
  const siblings = domain.supplements
    .filter((s) => s.supplementId !== merged.id)
    .slice(0, 5);
  siblings.forEach((s) => {
    const siblingSlug = slugify(s.name);
    html += `                            <a href="/evidence/${domain.slug}/${siblingSlug}.html"><i class="fas fa-flask"></i> ${esc(s.name)} for ${esc(domain.name)}</a>\n`;
  });

  html += `                        </div>
                    </div>
                    <div class="related-content" style="margin-top:1.5rem;">
                        <h3>Related Resources</h3>
                        <div class="related-content-grid">
                            <a href="/guides/${guideSlug}.html"><i class="fas fa-book-open"></i> ${esc(domain.name)} Complete Guide</a>
                            <a href="/index.html#supplements"><i class="fas fa-pills"></i> ${esc(merged.name)} Full Profile</a>
                            <a href="/guides/safety-interactions.html"><i class="fas fa-shield-alt"></i> Safety &amp; Interactions Guide</a>
                            <a href="/methodology.html"><i class="fas fa-microscope"></i> Our Methodology</a>
`;

  // Cross-domain evidence pages for same supplement
  const otherDomains = allDomains.filter(
    (d) =>
      d.id !== domain.id &&
      d.supplements.some((s) => s.supplementId === merged.id)
  );
  otherDomains.slice(0, 3).forEach((d) => {
    html += `                            <a href="/evidence/${d.slug}/${merged.slug}.html"><i class="fas fa-arrow-right"></i> ${esc(merged.name)} for ${esc(d.name)}</a>\n`;
  });

  html += `                        </div>
                    </div>
                </section>
`;
  return html;
}

// ── Effect Size Extraction ──────────────────────────────────────────────────────

/** Extract effect sizes relevant to a given health domain */
function getRelevantEffectSizes(effectSizes, domainSlug) {
  if (!effectSizes || typeof effectSizes !== "object") return [];

  // Map domain slugs to relevant effect size key patterns
  const domainKeyPatterns = {
    sleep: [
      "sleep",
      "insomnia",
      "circadian",
      "melatonin",
      "PSQI",
      "sleep_onset",
      "sleep_quality",
    ],
    anxiety: [
      "anxiety",
      "stress",
      "cortisol",
      "GAD",
      "STAI",
      "anxiolytic",
      "calm",
    ],
    "cognitive-performance": [
      "memory",
      "cognitive",
      "attention",
      "focus",
      "learning",
      "mental",
      "brain",
      "BDNF",
      "reaction_time",
    ],
    "metabolic-health": [
      "glucose",
      "insulin",
      "HbA1c",
      "metabolic",
      "blood_sugar",
      "lipid",
      "cholesterol",
      "triglyceride",
      "weight",
    ],
    inflammation: [
      "inflam",
      "CRP",
      "joint",
      "pain",
      "IL-6",
      "TNF",
      "NF-kB",
      "prostaglandin",
      "COX",
    ],
  };

  const patterns = domainKeyPatterns[domainSlug] || [];
  const results = [];

  for (const [key, value] of Object.entries(effectSizes)) {
    const keyLower = key.toLowerCase();
    const isRelevant = patterns.some((p) => keyLower.includes(p.toLowerCase()));
    if (!isRelevant) continue;

    if (typeof value === "object" && value !== null) {
      results.push({
        label: formatEffectSizeKey(key),
        value: value.value || value.effectSize || value.mean || JSON.stringify(value),
        studyType: value.studyType || value.study_type || "—",
        sample: value.sampleSize || value.sample || value.n || "—",
      });
    } else {
      results.push({
        label: formatEffectSizeKey(key),
        value: String(value),
        studyType: "—",
        sample: "—",
      });
    }
  }

  return results.slice(0, 8); // Limit to 8 most relevant
}

function formatEffectSizeKey(key) {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ── Main ────────────────────────────────────────────────────────────────────────

function main() {
  console.log("=== Evidence Page Generator (Wave 1) ===\n");

  // Load data
  const suppDb = loadSupplementData();
  if (!suppDb) {
    console.error("Failed to load supplement data");
    process.exit(1);
  }
  const problems = loadProblemData();
  if (!problems || !Array.isArray(problems)) {
    console.error("Failed to load problem data");
    process.exit(1);
  }

  console.log(
    `Loaded: ${suppDb.supplements.length} supplements, ${problems.length} problem domains`
  );

  // Build supplement lookup by ID
  const suppById = {};
  suppDb.supplements.forEach((s) => {
    suppById[s.id] = s;
  });

  // Filter to Wave 1 domains
  const wave1Domains = problems.filter((d) => WAVE_1_DOMAINS.includes(d.id));
  console.log(
    `Wave 1 domains: ${wave1Domains.map((d) => d.id).join(", ")}\n`
  );

  const outBase = path.join(__dirname, "..", "evidence");
  let totalPages = 0;
  let totalBytes = 0;

  // Generate pages for each domain
  wave1Domains.forEach((domain) => {
    // Create domain directory
    const domainDir = path.join(outBase, domain.slug);
    if (!fs.existsSync(domainDir)) {
      fs.mkdirSync(domainDir, { recursive: true });
    }

    // Get top N supplements by relevanceScore
    const topSupps = [...domain.supplements]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, SUPPS_PER_DOMAIN);

    console.log(
      `${domain.name} (${domain.slug}): ${topSupps.length} supplements`
    );

    topSupps.forEach((problemSupp) => {
      const fullSupplement = suppById[problemSupp.supplementId];
      if (!fullSupplement) {
        console.warn(
          `  ⚠ Supplement ID ${problemSupp.supplementId} (${problemSupp.name}) not found in supplements.js — skipping`
        );
        return;
      }

      // Merge data from both sources
      const merged = mergeSupplementData(problemSupp, fullSupplement);

      // Generate HTML
      const html = generateEvidencePage(domain, merged, problems);

      // Write file
      const filePath = path.join(domainDir, `${merged.slug}.html`);
      fs.writeFileSync(filePath, html, "utf8");

      const size = Buffer.byteLength(html, "utf8");
      totalBytes += size;
      totalPages++;

      console.log(
        `  ✓ ${domain.slug}/${merged.slug}.html (${(size / 1024).toFixed(1)} KB)`
      );
    });
  });

  console.log(`\n=== Complete: ${totalPages} evidence pages generated ===`);
  console.log(
    `Total output: ${(totalBytes / 1024).toFixed(1)} KB across ${wave1Domains.length} domains`
  );
}

main();
