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
 * and clinical citations. Uses the dark journal theme matching guide pages.
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
  inflammation: "immune-function",
};

// Dark journal accent themes per evidence domain (matches guide page palette)
const EVIDENCE_THEMES = {
  sleep: {
    accent: "#6366f1",
    accentLight: "#818cf6",
    glow: "#a5b4fc",
    glowRgb: "165,180,252",
    accentRgb: "99,102,241",
    faIcon: "fa-moon",
  },
  anxiety: {
    accent: "#7c3aed",
    accentLight: "#8b5cf6",
    glow: "#c4b5fd",
    glowRgb: "196,181,253",
    accentRgb: "124,58,237",
    faIcon: "fa-spa",
  },
  "cognitive-performance": {
    accent: "#0891b2",
    accentLight: "#06b6d4",
    glow: "#67e8f9",
    glowRgb: "103,232,249",
    accentRgb: "8,145,178",
    faIcon: "fa-brain",
  },
  "metabolic-health": {
    accent: "#ea580c",
    accentLight: "#f97316",
    glow: "#fdba74",
    glowRgb: "253,186,116",
    accentRgb: "234,88,12",
    faIcon: "fa-fire",
  },
  inflammation: {
    accent: "#059669",
    accentLight: "#10b981",
    glow: "#6ee7b7",
    glowRgb: "110,231,183",
    accentRgb: "5,150,105",
    faIcon: "fa-shield-virus",
  },
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

function tierBadgeClass(tier) {
  if (tier === 1) return "tier-1-badge";
  if (tier === 2) return "tier-2-badge";
  return "tier-3-badge";
}

function tierBadgeHtml(tier) {
  const label = getTierLabel(tier);
  return `<span class="${tierBadgeClass(tier)}" style="display:inline-block;padding:2px 10px;border-radius:100px;font-size:0.7rem;font-weight:700;letter-spacing:0.03em;">${esc(label)}</span>`;
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

// ── CSS Generator (dark journal theme) ──────────────────────────────────────────

function generateEvidenceCSS(t) {
  return `
    <style>
        :root {
            --navy-deep: #0d1117;
            --navy: #161b22;
            --navy-light: #1c2333;
            --accent: ${t.accent};
            --accent-light: ${t.accentLight};
            --accent-glow: rgba(${t.accentRgb}, 0.15);
            --glow: ${t.glow};
            --blue-muted: #7c8db5;
            --slate: #8b949e;
            --text-primary: #c9d1d9;
            --text-bright: #f0f6fc;
            --text-muted: #8b949e;
            --border: rgba(${t.accentRgb}, 0.12);
            --card-bg: rgba(22, 27, 34, 0.7);
            --tier1-from: #4ade80;
            --tier1-to: #22c55e;
            --tier2-from: #fbbf24;
            --tier2-to: #f59e0b;
            --tier3-from: #fb7185;
            --tier3-to: #e11d48;
        }

        * { box-sizing: border-box; }

        body {
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--navy-deep);
            color: var(--text-primary);
            -webkit-font-smoothing: antialiased;
            line-height: 1.7;
            margin: 0;
        }

        h1, h2, h3, h4 { font-family: 'DM Serif Display', Georgia, serif; }

        .guide-nav {
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(13, 17, 23, 0.85);
            backdrop-filter: blur(20px) saturate(1.2);
            border-bottom: 1px solid var(--border);
        }

        .hero-section {
            background:
                radial-gradient(ellipse 80% 60% at 50% 0%, rgba(${t.accentRgb}, 0.18) 0%, transparent 60%),
                radial-gradient(ellipse 60% 50% at 80% 20%, rgba(118, 75, 162, 0.12) 0%, transparent 50%),
                var(--navy-deep);
            position: relative;
            overflow: hidden;
        }

        .hero-section::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
            pointer-events: none;
        }

        .tier-1-badge {
            background: linear-gradient(135deg, var(--tier1-from), var(--tier1-to));
            color: #052e16;
        }
        .tier-2-badge {
            background: linear-gradient(135deg, var(--tier2-from), var(--tier2-to));
            color: #451a03;
        }
        .tier-3-badge {
            background: linear-gradient(135deg, var(--tier3-from), var(--tier3-to));
            color: #fff;
        }

        .evidence-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            backdrop-filter: blur(8px);
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .evidence-card:hover {
            border-color: rgba(${t.accentRgb}, 0.3);
            box-shadow: 0 0 30px rgba(${t.accentRgb}, 0.06);
        }

        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
            flex-wrap: wrap;
        }
        .breadcrumb a {
            color: var(--blue-muted);
            text-decoration: none;
            transition: color 0.2s;
        }
        .breadcrumb a:hover { color: var(--glow); }
        .breadcrumb .sep {
            color: rgba(139, 148, 158, 0.4);
            font-size: 0.6rem;
        }
        .breadcrumb .current { color: var(--text-muted); }

        .hero-stats {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .hero-stat {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        .hero-stat i { color: var(--accent-light); font-size: 0.7rem; }

        .section-heading {
            color: var(--text-bright);
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }

        .summary-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
        }
        .summary-table thead th {
            background: var(--navy-light);
            color: var(--text-muted);
            font-family: 'DM Sans', sans-serif;
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            text-align: left;
        }
        .summary-table thead th:first-child { border-radius: 8px 0 0 0; }
        .summary-table thead th:last-child { border-radius: 0 8px 0 0; }
        .summary-table tbody td {
            padding: 14px 16px;
            border-bottom: 1px solid rgba(${t.accentRgb}, 0.06);
            font-size: 0.88rem;
            vertical-align: top;
        }
        .summary-table tbody tr { transition: background 0.2s; }
        .summary-table tbody tr:hover { background: rgba(${t.accentRgb}, 0.04); }
        .summary-table tbody tr:last-child td { border-bottom: none; }

        .finding-highlight {
            border-left: 3px solid var(--accent-light);
            background: rgba(${t.accentRgb}, 0.05);
            padding: 12px 16px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 12px;
        }

        .mech-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 0.78rem;
            font-weight: 500;
            background: rgba(${t.accentRgb}, 0.08);
            border: 1px solid rgba(${t.accentRgb}, 0.15);
            color: var(--glow);
        }

        .key-study-card {
            background: rgba(${t.accentRgb}, 0.06);
            border-left: 3px solid var(--accent);
            padding: 16px 20px;
            border-radius: 0 10px 10px 0;
        }
        .key-study-card .study-title {
            color: var(--text-bright);
            font-weight: 600;
            margin-bottom: 6px;
        }
        .key-study-card .study-meta {
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .pmid-link {
            color: var(--blue-muted);
            font-size: 0.8rem;
            font-family: 'DM Sans', monospace;
            opacity: 0.8;
            transition: opacity 0.2s, color 0.2s;
            text-decoration: none;
        }
        .pmid-link:hover {
            opacity: 1;
            color: var(--glow);
            text-decoration: underline;
        }

        .citation-entry {
            font-size: 0.84rem;
            line-height: 1.6;
            padding: 8px 0;
            border-bottom: 1px solid rgba(${t.accentRgb}, 0.05);
            color: var(--text-muted);
            display: flex;
            align-items: flex-start;
        }
        .citation-entry:last-child { border-bottom: none; }
        .cite-num {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            border-radius: 4px;
            background: rgba(${t.accentRgb}, 0.1);
            color: var(--accent-light);
            font-size: 0.7rem;
            font-weight: 700;
            margin-right: 10px;
            flex-shrink: 0;
        }

        .capture-section {
            background:
                radial-gradient(ellipse 70% 80% at 30% 50%, rgba(${t.accentRgb}, 0.15) 0%, transparent 60%),
                radial-gradient(ellipse 50% 70% at 80% 40%, rgba(118, 75, 162, 0.12) 0%, transparent 50%),
                linear-gradient(135deg, #1a1040 0%, #0d1117 100%);
            border: 1px solid rgba(${t.accentRgb}, 0.2);
        }

        .disclaimer-box {
            background: rgba(245, 158, 11, 0.06);
            border: 1px solid rgba(245, 158, 11, 0.15);
            border-radius: 10px;
            padding: 14px 18px;
            font-size: 0.85rem;
            color: var(--text-muted);
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        .disclaimer-box i { color: #f59e0b; margin-top: 2px; flex-shrink: 0; }
        .disclaimer-box a { color: #f59e0b; text-decoration: underline; opacity: 0.8; }

        .related-link {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 0.88rem;
            color: var(--glow);
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            text-decoration: none;
            transition: background 0.2s, border-color 0.2s;
        }
        .related-link:hover {
            background: rgba(${t.accentRgb}, 0.06);
            border-color: rgba(${t.accentRgb}, 0.2);
        }
        .related-link i { color: var(--accent-light); width: 16px; text-align: center; }

        html { scroll-behavior: smooth; }

        .reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.visible {
            opacity: 1;
            transform: translateY(0);
        }

        a:focus-visible, button:focus-visible, input:focus-visible {
            outline: 2px solid var(--accent-light);
            outline-offset: 2px;
        }

        @media (max-width: 768px) {
            .summary-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .summary-table { min-width: 500px; }
            .hero-stats { justify-content: center; }
        }

        @media print {
            .guide-nav, .capture-section, .no-print { display: none !important; }
            body { background: #fff; color: #111; }
            .evidence-card { border: 1px solid #ddd; background: #fff; }
        }
    </style>`;
}

// ── Page Generator ──────────────────────────────────────────────────────────────

function generateEvidencePage(domain, merged, allDomains) {
  const theme = EVIDENCE_THEMES[domain.slug] || EVIDENCE_THEMES.sleep;
  const pageTitle = `${merged.name} for ${domain.name}`;
  const metaTitle = `${merged.name} for ${domain.name} — Evidence & Dosage | SupplementDB`;
  const metaDescription = `Clinical evidence review of ${merged.name} for ${domain.name.toLowerCase()}. Includes dosage protocols, mechanism analysis, safety profile, and peer-reviewed citations.`;
  const canonicalUrl = `${BASE_URL}/evidence/${domain.slug}/${merged.slug}.html`;
  const guideSlug = DOMAIN_TO_GUIDE[domain.slug] || domain.slug;

  // Count citations
  const citationCount = (merged.keyCitations || []).length;

  // Nav links for section navigation
  const navLinks = [
    { id: "evidence-overview", label: "Overview" },
    { id: "context", label: "Context" },
    { id: "evidence-detail", label: "Evidence" },
    { id: "mechanisms", label: "Mechanisms" },
    { id: "dosage", label: "Dosage" },
    { id: "safety", label: "Safety" },
    { id: "citations", label: "Citations" },
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
    <link rel="stylesheet" href="../../css/content-gate.css?v=${Date.now()}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Auth config — Docker entrypoint substitutes placeholders at runtime -->
    <meta name="clerk-key" content="__CLERK_PUBLISHABLE_KEY__">
    <meta name="convex-url" content="__CONVEX_URL__">

    <!-- Auth CDN -->
    <script src="https://unpkg.com/@clerk/clerk-js@latest/dist/clerk.browser.js" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/convex@latest/dist/browser/index.global.js" crossorigin="anonymous"></script>

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

    ${generateEvidenceCSS(theme)}
</head>
<body data-theme="dark">

<!-- Sticky Navigation -->
<nav class="guide-nav">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <a href="../../index.html" class="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <i class="fas fa-arrow-left text-xs"></i>
            <span class="hidden sm:inline">Back to Database</span>
            <span class="sm:hidden">Back</span>
        </a>
        <div class="flex items-center gap-1">
            <i class="fas fa-pills text-sm" style="color: ${theme.accentLight};"></i>
            <span class="text-sm font-semibold text-gray-300">SupplementDB</span>
        </div>
        <button id="mobile-nav-toggle" class="md:hidden text-gray-400 hover:text-white transition-colors p-1">
            <i class="fas fa-bars text-sm"></i>
        </button>
        <div class="hidden md:flex items-center gap-5 text-xs font-medium text-gray-500">
            ${navLinks.map((l) => `<a href="#${l.id}" class="hover:text-gray-300 transition-colors">${l.label}</a>`).join("\n            ")}
            <div id="auth-buttons"></div>
        </div>
    </div>
</nav>

<!-- Mobile navigation dropdown -->
<div id="mobile-nav-menu" class="hidden" style="position: fixed; top: 56px; left: 0; right: 0; z-index: 40; background: #0d1117; border-bottom: 1px solid rgba(255,255,255,0.05);">
    <div class="flex flex-col px-4 py-3 gap-1">
        ${navLinks.map((l) => `<a href="#${l.id}" class="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2 border-b border-white/5">${l.label}</a>`).join("\n        ")}
    </div>
</div>

<!-- Hero Section -->
<header class="hero-section pt-16 pb-12 sm:pt-20 sm:pb-16 px-4 text-center relative">
    <div class="max-w-3xl mx-auto relative z-10">
        <!-- Breadcrumb -->
        <nav class="breadcrumb justify-center mb-6" aria-label="Breadcrumb">
            <a href="../../index.html">Home</a>
            <span class="sep"><i class="fas fa-chevron-right"></i></span>
            <span class="current">Evidence</span>
            <span class="sep"><i class="fas fa-chevron-right"></i></span>
            <a href="../../guides/${guideSlug}.html">${esc(domain.name)}</a>
            <span class="sep"><i class="fas fa-chevron-right"></i></span>
            <span class="current">${esc(merged.name)}</span>
        </nav>

        <!-- Review badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5" style="background: rgba(${theme.accentRgb}, 0.12); color: ${theme.glow}; border: 1px solid rgba(${theme.accentRgb}, 0.2);">
            <i class="fas ${theme.faIcon} text-xs" style="color: ${theme.accentLight}; font-size: 0.65rem;"></i>
            Evidence Review
        </div>

        <h1 class="text-3xl sm:text-4xl font-normal mb-4 leading-tight" style="color: var(--text-bright);">
            ${esc(pageTitle)}
        </h1>

        <p class="text-base sm:text-lg mb-6" style="color: var(--blue-muted); max-width: 520px; margin: 0 auto;">
            Clinical evidence review — dosage, mechanisms, safety, and citations
        </p>

        <div class="hero-stats mb-4">
            <span class="hero-stat">${tierBadgeHtml(merged.evidenceTier)}</span>
            <span class="hero-stat"><i class="fas fa-star"></i> Relevance: ${merged.relevanceScore}/100</span>
            <span class="hero-stat"><i class="fas fa-file-lines"></i> ${citationCount}+ Citations</span>
            <span class="hero-stat"><i class="fas fa-calendar"></i> Updated ${TODAY}</span>
        </div>

        <p class="text-xs px-4 py-2 rounded-lg inline-block" style="color: var(--text-muted); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
            <i class="fas fa-info-circle mr-1 opacity-60"></i>
            This review summarizes published research. It does not constitute medical advice.
            <a href="../../legal/disclaimer.html" style="color: ${theme.glow}; text-decoration: underline; opacity: 0.7;">Full disclaimer</a>.
        </p>
    </div>
</header>

<main>
`;

  // ── Section 1: Evidence Overview ────────────────────────────────────────
  html += `
<section id="evidence-overview" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="section-heading">Evidence Overview</h2>
    <div class="evidence-card p-6">
        <div class="summary-table-wrap">
            <table class="summary-table">
                <tbody>
                    <tr>
                        <td style="color: var(--text-muted); width: 200px;"><strong>Supplement</strong></td>
                        <td style="color: var(--text-bright);">${esc(merged.name)}${merged.scientificName ? ` <em style="color: var(--slate);">(${esc(merged.scientificName)})</em>` : ""}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-muted);"><strong>Health Domain</strong></td>
                        <td style="color: var(--text-bright);">${esc(domain.name)}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-muted);"><strong>Evidence Tier</strong></td>
                        <td>${tierBadgeHtml(merged.evidenceTier)} <span style="color: var(--text-primary); margin-left: 8px;">${esc(getTierLabel(merged.evidenceTier))}</span></td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-muted);"><strong>Relevance Score</strong></td>
                        <td style="color: var(--text-bright);">${merged.relevanceScore}/100</td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-muted);"><strong>Category</strong></td>
                        <td style="color: var(--text-bright);">${esc(normalizeCategory(merged.category))}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-muted);"><strong>Recommended Dosage</strong></td>
                        <td style="color: var(--text-bright);">${esc(merged.dosageRange)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</section>
`;

  // ── Section 2: Problem Context ──────────────────────────────────────────
  const physiology = domain.physiologyOverview;
  html += `
<section id="context" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="section-heading">Understanding ${esc(domain.name)}</h2>
    <div class="evidence-card p-6">
        <p class="mb-4" style="color: var(--text-primary);">${esc(physiology.summary)}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
                <h3 class="text-sm font-semibold uppercase tracking-wider mb-3" style="color: var(--accent-light); font-family: 'DM Sans', sans-serif; letter-spacing: 0.08em;">Key Physiological Systems</h3>
                <ul class="space-y-2">
`;
  (physiology.systems || []).forEach((sys) => {
    html += `                    <li class="flex items-start gap-2 text-sm" style="color: var(--text-primary);"><i class="fas fa-circle mt-2" style="font-size: 4px; color: var(--accent-light);"></i> ${esc(sys)}</li>\n`;
  });
  html += `                </ul>
            </div>
            <div>
                <h3 class="text-sm font-semibold uppercase tracking-wider mb-3" style="color: var(--accent-light); font-family: 'DM Sans', sans-serif; letter-spacing: 0.08em;">Key Signaling Molecules</h3>
                <ul class="space-y-2">
`;
  (physiology.keyNeurotransmitters || []).forEach((nt) => {
    html += `                    <li class="flex items-start gap-2 text-sm" style="color: var(--text-primary);"><i class="fas fa-circle mt-2" style="font-size: 4px; color: var(--accent-light);"></i> ${esc(nt)}</li>\n`;
  });
  html += `                </ul>
            </div>
        </div>
    </div>
</section>
`;

  // ── Section 3: Evidence Detail ──────────────────────────────────────────
  html += `
<section id="evidence-detail" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="section-heading">Evidence for ${esc(merged.name)} in ${esc(domain.name)}</h2>
`;

  // Problem-specific effects (rich domains like sleep)
  if (merged.specificEffects) {
    html += `    <div class="evidence-card p-6 mb-6">
        <h3 class="text-lg mb-4" style="color: var(--text-bright);">Problem-Specific Effects</h3>
        <div class="summary-table-wrap">
            <table class="summary-table">
                <tbody>
`;
    for (const [key, value] of Object.entries(merged.specificEffects)) {
      const label =
        key === "populations"
          ? "Studied Populations"
          : key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s) => s.toUpperCase());
      const val = Array.isArray(value) ? value.join(", ") : String(value);
      html += `                    <tr>
                        <td style="color: var(--text-muted); width: 200px;"><strong>${esc(label)}</strong></td>
                        <td style="color: var(--text-bright);">${esc(val)}</td>
                    </tr>\n`;
    }
    html += `                </tbody>
            </table>
        </div>
    </div>\n`;
  }

  // Key evidence study
  if (merged.keyEvidence) {
    const ke = merged.keyEvidence;
    html += `    <div class="key-study-card mb-6">
        <p class="text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--accent-light); font-family: 'DM Sans', sans-serif; letter-spacing: 0.06em;">Key Study</p>
        <p class="study-title" style="color: var(--text-bright);">${esc(ke.title || "")}</p>
        <p class="study-meta">${esc(ke.authors || "")} (${esc(String(ke.year || ""))}). <em>${esc(ke.journal || "")}</em>.</p>
        <p class="study-meta mt-1">
            ${ke.studyType ? `Study type: ${esc(ke.studyType)}` : ""}
            ${ke.sampleSize ? ` &middot; Sample: ${esc(ke.sampleSize)}` : ""}
            ${ke.pmid ? ` &middot; <a class="pmid-link" href="https://pubmed.ncbi.nlm.nih.gov/${esc(ke.pmid)}/" target="_blank" rel="noopener">PMID: ${esc(ke.pmid)}</a>` : ""}
        </p>
    </div>\n`;
  }

  // Guide notes
  if (merged.guideNotes) {
    html += `    <div class="finding-highlight mb-6">
        <p class="text-xs font-semibold uppercase tracking-wider mb-1" style="color: var(--accent-light);">Clinical Notes</p>
        <p class="text-sm" style="color: var(--text-primary);">${esc(merged.guideNotes)}</p>
    </div>\n`;
  }

  // Effect sizes relevant to this domain
  const relevantEffects = getRelevantEffectSizes(
    merged.effectSizes,
    domain.slug
  );
  if (relevantEffects.length > 0) {
    html += `    <div class="evidence-card p-6 mb-6">
        <h3 class="text-lg mb-4" style="color: var(--text-bright);">Measured Effect Sizes</h3>
        <div class="summary-table-wrap">
            <table class="summary-table">
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
      html += `                    <tr>
                        <td style="color: var(--text-primary);">${esc(ef.label)}</td>
                        <td style="color: var(--text-bright); font-weight: 600;">${esc(ef.value)}</td>
                        <td style="color: var(--text-muted);">${esc(ef.studyType || "—")}</td>
                        <td style="color: var(--text-muted);">${esc(ef.sample || "—")}</td>
                    </tr>\n`;
    });
    html += `                </tbody>
            </table>
        </div>
    </div>\n`;
  }

  html += `</section>
`;

  // ── Section 4: Mechanisms ───────────────────────────────────────────────
  html += `
<section id="mechanisms" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="section-heading">Mechanisms of Action</h2>
    <div class="evidence-card p-6">
        <p class="mb-4" style="color: var(--text-primary);">How ${esc(merged.name)} affects ${esc(domain.name.toLowerCase())} through biological pathways:</p>
        <div class="flex flex-wrap gap-2 mb-6">
`;
  const mechanisms = merged.mechanisms || [];
  if (mechanisms.length > 0) {
    mechanisms.forEach((m) => {
      html += `            <span class="mech-pill"><i class="fas fa-circle" style="font-size:4px; color: var(--accent-light);"></i> ${esc(String(m))}</span>\n`;
    });
  } else {
    (merged.mechanismsOfAction || []).forEach((m) => {
      const name = m.mechanism || m.name || String(m);
      html += `            <span class="mech-pill"><i class="fas fa-circle" style="font-size:4px; color: var(--accent-light);"></i> ${esc(name)}</span>\n`;
    });
  }
  html += `        </div>
`;

  // Show detailed mechanisms if available from full supplement data
  if (
    merged.mechanismsOfAction.length > 0 &&
    merged.mechanismsOfAction[0].description
  ) {
    html += `        <div class="space-y-3">
`;
    merged.mechanismsOfAction.slice(0, 5).forEach((m) => {
      const name = m.mechanism || m.name || String(m);
      const desc = m.description || "";
      if (desc) {
        html += `            <div class="finding-highlight">
                <p class="text-xs font-semibold uppercase tracking-wider mb-1" style="color: var(--accent-light);">${esc(name)}</p>
                <p class="text-sm" style="color: var(--text-primary);">${esc(desc)}</p>
            </div>\n`;
      }
    });
    html += `        </div>
`;
  }

  html += `    </div>
</section>
`;

  // ── Section 5: Dosage ──────────────────────────────────────────────────
  html += `
<section id="dosage" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="section-heading">Dosage &amp; Protocol</h2>
    <div class="evidence-card p-6">
        <div class="summary-table-wrap">
            <table class="summary-table">
                <tbody>
                    <tr>
                        <td style="color: var(--text-muted); width: 200px;"><strong>Recommended Dosage</strong></td>
                        <td style="color: var(--text-bright);">${esc(merged.dosageRange)}</td>
                    </tr>
                    <tr>
                        <td style="color: var(--text-muted);"><strong>Optimal Duration</strong></td>
                        <td style="color: var(--text-bright);">${esc(merged.optimalDuration || "Consult healthcare provider for duration guidance")}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="text-xs mt-4" style="color: var(--text-muted);"><i class="fas fa-info-circle mr-1" style="color: var(--accent-light);"></i> Dosage ranges are based on clinical trial protocols. Individual needs may vary. Always start with the lower end and consult a healthcare provider.</p>
    </div>
</section>
`;

  // ── Section 6: Safety ──────────────────────────────────────────────────
  html += `
<section id="safety" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="section-heading">Safety Profile</h2>
    <div class="evidence-card p-6">
`;
  if (typeof merged.safetyProfile === "string") {
    html += `        <p style="color: var(--text-primary);">${esc(merged.safetyProfile)}</p>\n`;
  } else if (merged.safetyProfile && typeof merged.safetyProfile === "object") {
    const sp = merged.safetyProfile;
    html += `        <div class="summary-table-wrap">
            <table class="summary-table">
                <tbody>
`;
    if (sp.rating) {
      const riskClass = sp.rating.toLowerCase().includes("high")
        ? "color: #f87171; font-weight: 600;"
        : sp.rating.toLowerCase().includes("moderate")
          ? "color: #fbbf24; font-weight: 600;"
          : "color: #4ade80; font-weight: 600;";
      html += `                    <tr><td style="color: var(--text-muted); width: 200px;"><strong>Safety Rating</strong></td><td style="${riskClass}">${esc(sp.rating)}</td></tr>\n`;
    }
    if (sp.sideEffects && sp.sideEffects.length)
      html += `                    <tr><td style="color: var(--text-muted);"><strong>Common Side Effects</strong></td><td style="color: var(--text-primary);">${esc(sp.sideEffects.join(", "))}</td></tr>\n`;
    if (sp.contraindications && sp.contraindications.length)
      html += `                    <tr><td style="color: var(--text-muted);"><strong>Contraindications</strong></td><td style="color: var(--text-primary);">${esc(sp.contraindications.join(", "))}</td></tr>\n`;
    if (sp.drugInteractions && sp.drugInteractions.length)
      html += `                    <tr><td style="color: var(--text-muted);"><strong>Drug Interactions</strong></td><td style="color: var(--text-primary);">${esc(sp.drugInteractions.join(", "))}</td></tr>\n`;
    if (sp.maxDosage)
      html += `                    <tr><td style="color: var(--text-muted);"><strong>Maximum Dosage</strong></td><td style="color: var(--text-primary);">${esc(sp.maxDosage)}</td></tr>\n`;
    html += `                </tbody>
            </table>
        </div>\n`;
  } else {
    html += `        <p style="color: var(--text-primary);">Safety data for this specific application is being compiled. Refer to the general supplement safety profile and consult a healthcare professional.</p>\n`;
  }
  html += `        <div class="disclaimer-box mt-4">
            <i class="fas fa-exclamation-triangle"></i>
            <div>Always inform your healthcare provider about all supplements you are taking, especially if you use prescription medications.</div>
        </div>
    </div>
</section>
`;

  // ── Section 7: Citations ───────────────────────────────────────────────
  html += `
<section id="citations" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="section-heading">Clinical Citations</h2>
    <p class="mb-6" style="color: var(--text-primary);">Peer-reviewed research referenced in this evidence review:</p>
    <div class="evidence-card p-6">
        <div class="space-y-1">
`;
  let citNum = 0;

  // Key evidence citation first
  if (merged.keyEvidence) {
    const ke = merged.keyEvidence;
    citNum++;
    const pmidLink = ke.pmid
      ? ` <a class="pmid-link" href="https://pubmed.ncbi.nlm.nih.gov/${esc(ke.pmid)}/" target="_blank" rel="noopener">PMID: ${esc(ke.pmid)}</a>`
      : "";
    html += `            <div class="citation-entry">
                <span class="cite-num">${citNum}</span>
                <span>${esc(ke.authors || "Unknown authors")} (${esc(String(ke.year || ""))}). ${esc(ke.title || "")}. <em>${esc(ke.journal || "")}</em>.${pmidLink}</span>
            </div>\n`;
  }

  // keyCitations from supplement data
  (merged.keyCitations || []).forEach((c) => {
    if (
      merged.keyEvidence &&
      c.pmid &&
      c.pmid === merged.keyEvidence.pmid
    )
      return;
    citNum++;
    const doi = c.doi
      ? ` <a class="pmid-link" href="https://doi.org/${esc(c.doi)}" target="_blank" rel="noopener">${esc(c.doi)}</a>`
      : "";
    const pmid = c.pmid
      ? ` <a class="pmid-link" href="https://pubmed.ncbi.nlm.nih.gov/${esc(String(c.pmid))}" target="_blank" rel="noopener">PMID: ${esc(String(c.pmid))}</a>`
      : "";
    html += `            <div class="citation-entry">
                <span class="cite-num">${citNum}</span>
                <span>${esc(c.authors || "")} (${esc(String(c.year || ""))}). ${esc(c.title || "")}. <em>${esc(c.journal || "")}</em>.${doi}${pmid}</span>
            </div>\n`;
  });

  if (citNum === 0) {
    html += `            <div class="citation-entry">
                <span class="cite-num">—</span>
                <span>Citations for this evidence review are being compiled from the SupplementDB database.</span>
            </div>\n`;
  }

  html += `        </div>
    </div>
</section>
`;

  // ── Section 8: Related Evidence ─────────────────────────────────────────
  html += buildRelatedSection(domain, merged, allDomains, guideSlug, theme);

  // ── Email Capture ──────────────────────────────────────────────────────
  html += `
<section class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <div class="capture-section rounded-xl p-8 sm:p-12 text-center">
        <h3 class="text-2xl mb-3" style="color: var(--text-bright);">
            <i class="fas fa-envelope-open-text mr-2" style="color: ${theme.accentLight};"></i>
            Get ${esc(merged.name)} Research Updates
        </h3>
        <p class="mb-6 text-sm" style="color: var(--text-muted); max-width: 440px; margin: 0 auto 1.5rem;">
            Stay informed when new studies on ${esc(merged.name)} for ${esc(domain.name.toLowerCase())} are published or evidence tiers are updated.
        </p>
        <div id="guide-newsletter-container">
            <form id="guide-newsletter-form" class="newsletter-form flex gap-3 max-w-md mx-auto flex-wrap justify-center">
                <input type="email" id="guide-newsletter-email" placeholder="your@email.com" required
                    class="flex-1 min-w-0 px-4 py-2.5 rounded-lg text-sm"
                    style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: var(--text-bright); outline: none;">
                <button type="submit" class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style="background: ${theme.accent};"><i class="fas fa-paper-plane mr-1"></i> Subscribe</button>
            </form>
            <p id="guide-newsletter-message" class="newsletter-message" style="display:none; color: var(--text-bright);"></p>
        </div>
        <p class="text-xs mt-4" style="color: var(--text-muted); opacity: 0.6;"><i class="fas fa-lock mr-1"></i> No spam. <a href="../../legal/privacy.html" style="color: var(--glow); opacity: 0.7;">Privacy Policy</a></p>
    </div>
</section>

</main>

<!-- Footer -->
<footer class="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t" style="border-color: var(--border);">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4 flex-wrap">
            <a href="../../index.html" class="flex items-center gap-2 text-sm font-medium transition-colors" style="color: var(--blue-muted);">
                <i class="fas fa-pills" style="color: ${theme.accentLight};"></i>
                <span>Return to Supplement Database</span>
            </a>
            <a href="../../guides/${guideSlug}.html" class="flex items-center gap-2 text-sm font-medium transition-colors" style="color: var(--blue-muted);">
                <i class="fas fa-book-open"></i>
                <span>${esc(domain.name)} Guide</span>
            </a>
        </div>
        <p class="text-xs text-center sm:text-right" style="color: var(--text-muted); max-width: 400px;">
            This review is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional.
        </p>
    </div>
    <div class="text-center mt-8">
        <p class="text-xs" style="color: rgba(139, 148, 158, 0.5);">
            &copy; 2025&ndash;2026 SupplementDB. Evidence-Based Supplement Database.
        </p>
    </div>
</footer>

<!-- Scripts -->
<script>
// Scroll reveal animation
document.addEventListener('DOMContentLoaded', function() {
    var reveals = document.querySelectorAll('.reveal');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
});

// Smooth scroll for anchor links with nav offset
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            var navHeight = document.querySelector('.guide-nav').offsetHeight;
            var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// PostHog custom event tracking
(function() {
    if (typeof posthog === 'undefined') return;

    posthog.capture('evidence_viewed', {
        domain_slug: '${domain.slug}',
        supplement_slug: '${merged.slug}',
        supplement_name: '${esc(merged.name).replace(/'/g, "\\'")}',
        domain_name: '${esc(domain.name).replace(/'/g, "\\'")}',
        evidence_tier: ${merged.evidenceTier},
        relevance_score: ${merged.relevanceScore},
        citation_count: ${citationCount}
    });

    var sectionsMeta = {
        'evidence-overview': { name: 'Evidence Overview', depth: 'top' },
        'context': { name: 'Problem Context', depth: 'upper' },
        'evidence-detail': { name: 'Evidence Detail', depth: 'middle' },
        'mechanisms': { name: 'Mechanisms', depth: 'middle' },
        'dosage': { name: 'Dosage & Protocol', depth: 'lower' },
        'safety': { name: 'Safety Profile', depth: 'lower' },
        'citations': { name: 'Citations', depth: 'deep' },
        'related': { name: 'Related Evidence', depth: 'bottom' }
    };

    var trackedSections = {};
    var sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !trackedSections[entry.target.id]) {
                trackedSections[entry.target.id] = true;
                var meta = sectionsMeta[entry.target.id];
                if (meta) {
                    posthog.capture('evidence_section_viewed', {
                        domain_slug: '${domain.slug}',
                        supplement_slug: '${merged.slug}',
                        section_id: entry.target.id,
                        section_name: meta.name,
                        scroll_depth: meta.depth
                    });
                }
            }
        });
    }, { threshold: 0.2 });

    Object.keys(sectionsMeta).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) sectionObserver.observe(el);
    });

    document.querySelectorAll('.pmid-link').forEach(function(link) {
        link.addEventListener('click', function() {
            var href = this.getAttribute('href') || '';
            posthog.capture('evidence_citation_clicked', {
                domain_slug: '${domain.slug}',
                supplement_slug: '${merged.slug}',
                citation_type: href.includes('pubmed') ? 'pmid' : (href.includes('doi.org') ? 'doi' : 'other'),
                citation_url: href,
                citation_text: this.textContent.trim()
            });
        });
    });

    var elapsed = 0;
    var timeThresholds = [30, 60, 120, 300];
    var timeIndex = 0;
    var timerCheck = setInterval(function() {
        elapsed++;
        if (timeIndex < timeThresholds.length && elapsed >= timeThresholds[timeIndex]) {
            posthog.capture('evidence_time_on_page', {
                domain_slug: '${domain.slug}',
                supplement_slug: '${merged.slug}',
                seconds: timeThresholds[timeIndex]
            });
            timeIndex++;
        }
        if (timeIndex >= timeThresholds.length) clearInterval(timerCheck);
    }, 1000);
})();

// Mobile nav toggle
document.getElementById('mobile-nav-toggle').addEventListener('click', function() {
    var menu = document.getElementById('mobile-nav-menu');
    menu.classList.toggle('hidden');
    this.querySelector('i').classList.toggle('fa-bars');
    this.querySelector('i').classList.toggle('fa-times');
});
document.querySelectorAll('#mobile-nav-menu a').forEach(function(link) {
    link.addEventListener('click', function() {
        document.getElementById('mobile-nav-menu').classList.add('hidden');
        var btn = document.getElementById('mobile-nav-toggle');
        btn.querySelector('i').classList.add('fa-bars');
        btn.querySelector('i').classList.remove('fa-times');
    });
});
</script>

<script src="../../js/newsletter.js"></script>
<script>SupplementDBNewsletter.init("guide-newsletter-form", "guide-newsletter-email", "guide-newsletter-message", "evidence-${domain.slug}-${merged.slug}");</script>

<!-- Auth & Content Gate -->
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

function buildRelatedSection(domain, merged, allDomains, guideSlug, theme) {
  let html = `
<section id="related" class="max-w-5xl mx-auto px-4 sm:px-6 py-8 reveal">
    <h2 class="section-heading">Related Evidence</h2>

    <div class="evidence-card p-6 mb-6">
        <h3 class="text-lg mb-4" style="color: var(--text-bright);">Other Supplements for ${esc(domain.name)}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
`;

  // Sibling supplements in same domain (use relative paths)
  const siblings = domain.supplements
    .filter((s) => s.supplementId !== merged.id)
    .slice(0, 5);
  siblings.forEach((s) => {
    const siblingSlug = slugify(s.name);
    html += `            <a href="./${siblingSlug}.html" class="related-link"><i class="fas fa-flask"></i> ${esc(s.name)} for ${esc(domain.name)}</a>\n`;
  });

  html += `        </div>
    </div>

    <div class="evidence-card p-6">
        <h3 class="text-lg mb-4" style="color: var(--text-bright);">Related Resources</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="../../guides/${guideSlug}.html" class="related-link"><i class="fas fa-book-open"></i> ${esc(domain.name)} Complete Guide</a>
            <a href="../../index.html#supplements" class="related-link"><i class="fas fa-pills"></i> ${esc(merged.name)} Full Profile</a>
            <a href="../../guides/safety-interactions.html" class="related-link"><i class="fas fa-shield-alt"></i> Safety &amp; Interactions Guide</a>
            <a href="../../methodology.html" class="related-link"><i class="fas fa-microscope"></i> Our Methodology</a>
`;

  // Cross-domain evidence pages for same supplement
  const otherDomains = allDomains.filter(
    (d) =>
      d.slug !== domain.slug &&
      WAVE_1_DOMAINS.includes(d.slug) &&
      d.supplements.some((s) => s.supplementId === merged.id)
  );
  otherDomains.slice(0, 3).forEach((d) => {
    html += `            <a href="../${d.slug}/${merged.slug}.html" class="related-link"><i class="fas fa-arrow-right"></i> ${esc(merged.name)} for ${esc(d.name)}</a>\n`;
  });

  html += `        </div>
    </div>
</section>
`;
  return html;
}

// ── Effect Size Extraction ──────────────────────────────────────────────────────

/** Extract effect sizes relevant to a given health domain */
function getRelevantEffectSizes(effectSizes, domainSlug) {
  if (!effectSizes || typeof effectSizes !== "object") return [];

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
        value:
          value.value ||
          value.effectSize ||
          value.mean ||
          JSON.stringify(value),
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

  return results.slice(0, 8);
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

  // Filter to Wave 1 domains by slug
  const wave1Domains = problems.filter((d) =>
    WAVE_1_DOMAINS.includes(d.slug)
  );
  console.log(
    `Wave 1 domains: ${wave1Domains.map((d) => d.slug).join(", ")}\n`
  );

  if (wave1Domains.length === 0) {
    console.error(
      "No Wave 1 domains found. Available slugs:",
      problems.map((d) => d.slug).join(", ")
    );
    process.exit(1);
  }

  const outBase = path.join(__dirname, "..", "evidence");
  let totalPages = 0;
  let totalBytes = 0;

  // Generate pages for each domain
  wave1Domains.forEach((domain) => {
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

      const merged = mergeSupplementData(problemSupp, fullSupplement);
      const html = generateEvidencePage(domain, merged, problems);
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
