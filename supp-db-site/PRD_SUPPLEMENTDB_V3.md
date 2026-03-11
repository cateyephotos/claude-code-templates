# Product Requirements Document: SupplementDB

**Version:** 3.0
**Date:** 2026-03-11
**Status:** Live Product — SaaS Revenue-Ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Strategic Positioning](#3-strategic-positioning)
4. [Content Architecture](#4-content-architecture)
5. [Data Model](#5-data-model)
6. [Citation & Evidence System](#6-citation--evidence-system)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Content Gating](#8-content-gating)
9. [Subscription & Payments](#9-subscription--payments)
10. [Newsletter & Email](#10-newsletter--email)
11. [Analytics](#11-analytics)
12. [Admin Dashboard](#12-admin-dashboard)
13. [Backend Infrastructure](#13-backend-infrastructure)
14. [Frontend Architecture](#14-frontend-architecture)
15. [SEO & Compliance](#15-seo--compliance)
16. [Deployment](#16-deployment)
17. [Testing](#17-testing)
18. [Market Context](#18-market-context)
19. [Target Users](#19-target-users)
20. [Success Metrics](#20-success-metrics)

---

## 1. Executive Summary

SupplementDB is a SaaS-ready evidence navigation platform cataloging **93 supplements** with structured evidence profiles sourced from **500+ peer-reviewed research papers**. The platform serves **188 HTML pages** from a containerized Nginx deployment, backed by Clerk authentication, Convex serverless database, Stripe payments, and PostHog analytics.

The product sits at the intersection of the $177B global supplements market and an underserved niche for evidence-quality transparency. It replaces the fragmented landscape of blog posts, affiliate content, and unstructured PubMed searches with a structured, citation-verified, tiered evidence system.

### Revenue Model

| Channel | Price | Mechanism |
|---------|-------|-----------|
| Monthly subscription | $9.99/mo | Full guide + evidence page access |
| Annual subscription | $79.99/yr | Same access, 33% savings |
| PDF guide bundles | $29-99 one-time | Downloadable evidence guides |
| B2B API access | $39-299/mo | Programmatic supplement data |

---

## 2. Product Overview

### 2.1 Product Name
Evidence-Based Supplement Database (SupplementDB)

### 2.2 One-Line Description
A searchable, citation-verified database of 93 supplements with evidence-tier scoring, mechanism breakdowns, dosage guidance, safety profiles, and problem-centered evidence guides.

### 2.3 Core Value Proposition
Provides consumers, practitioners, and researchers a single source of structured, tiered, citation-linked supplement evidence — organized by health problem and backed by verified PubMed/DOI references.

### 2.4 Tech Stack

| Layer | Technology |
|-------|-----------|
| Hosting | Docker (nginx:alpine) on port 8080 |
| Backend | Convex Cloud (serverless) |
| Auth | Clerk (CDN-loaded) |
| Payments | Stripe (Checkout + Customer Portal) |
| Analytics | PostHog (client + server-side) |
| Email | Resend (transactional) |
| Tests | Playwright (383 tests) |

---

## 3. Strategic Positioning

### 3.1 What SupplementDB Is

- A structured evidence database with decision-support tools
- A reference system that helps users interpret the scientific literature
- A generator of evidence guides organized by health problem
- A verified citation platform with PubMed/DOI-linked references

### 3.2 What SupplementDB Is Not

- A supplement store (no e-commerce, no affiliate links)
- A health blog (no opinion content)
- A medical advice platform (no prescriptions or treatment recommendations)
- A social platform (no community or user reviews)

### 3.3 Voice & Tone

| Principle | Example |
|-----------|---------|
| Guidance, not prescriptions | "Magnesium appears consistently studied for sleep onset" |
| Evidence summaries, not promises | "Tier 1 evidence from multiple RCTs" |
| Decision support, not advice | "The evidence suggests..." |
| Transparency about limits | "Limited to 3 small RCTs" |

### 3.4 Content Architecture Flow

```
User → Auth → Role → Problem or Supplement → Evidence → Gate/Guide → Conversion
```

---

## 4. Content Architecture

### 4.1 Page Inventory (188 HTML pages)

| Page Type | Count | Path | Gated |
|-----------|-------|------|-------|
| Homepage | 1 | `/` | No |
| Supplement monographs | 93 | `/supplements/{slug}.html` | No |
| Evidence guides | 20 | `/guides/{slug}.html` | Yes |
| Evidence pages | 25 | `/evidence/{domain}/{supplement}.html` | Yes |
| Comparison pages | 10 | `/compare/{pair}.html` | No |
| Category pages | 6 | `/categories/{category}.html` | No |
| Legal pages | 7 | `/legal/{page}.html` | No |
| Informational | 4 | `/about.html`, `/faq.html`, `/methodology.html`, `/pricing.html` | No |
| Payment flow | 2 | `/success.html`, `/confirm.html` | No |
| Newsletter | 1 | `/unsubscribe.html` | No |
| Admin dashboard | 1 | `/admin/` | Admin-only |

### 4.2 Evidence Guides (20)

Long-form, data-driven guides (10,000+ words each) organized by health domain. Each guide ranks supplements by evidence tier, breaks down mechanisms, provides dosage protocols, and cites primary literature.

| Guide | Supplements Covered |
|-------|-------------------|
| Anxiety & Stress | 21 |
| Cognitive Performance | 41 |
| Cardiovascular | 20 |
| Immune Function | 23 |
| Joint Health | 13 |
| Metabolic Health | 19 |
| Energy & Vitality | 13 |
| Mood Support | 17 |
| Memory & Aging | 21 |
| Longevity | 19 |
| Brain Fog | 18 |
| Stress Resilience | 20 |
| Safety & Interactions | 93 (full database) |
| Muscle & Strength | 11 |
| Recovery | 26 |
| Women's Health | 14 |
| Men's Health | 12 |
| Gut-Brain Axis | 16 |
| Nootropic Stacks | 32 |
| Sleep | (in guides/) |

### 4.3 Problem × Supplement Evidence Pages (25)

Focused pages examining a specific supplement's evidence for a specific health problem. Generated from the intersection of 13 problem domains and the supplement database.

**Wave 1 — 5 domains × 5 supplements:**

| Domain | Supplements |
|--------|-----------|
| Sleep | Melatonin, Magnesium, L-Theanine, Passionflower, Ashwagandha |
| Anxiety | Ashwagandha, L-Theanine, Magnesium, Passionflower, GABA |
| Cognitive Performance | Bacopa Monnieri, Lion's Mane, Caffeine, Alpha-GPC, Citicoline |
| Metabolic Health | Berberine, Alpha-Lipoic Acid, Chromium, Inositol, Fenugreek |
| Inflammation | Turmeric/Curcumin, Omega-3, Boswellia, Glucosamine, Ginger |

### 4.4 Comparison Pages (10)

Head-to-head evidence comparisons with radar charts, mechanism overlays, safety side-by-sides, and cost analysis:

Ashwagandha vs Rhodiola, Bacopa vs Ginkgo, CoQ10 vs PQQ, Creatine vs Beta-Alanine, L-Theanine vs 5-HTP, Lion's Mane vs Bacopa, Magnesium vs Melatonin, Omega-3 vs CoQ10, Turmeric vs Boswellia, Vitamin D vs Magnesium

### 4.5 Category Pages (6)

Amino Acids, Antioxidants, Essential Nutrients, Herbal Extracts, Nootropics, Performance Enhancers

---

## 5. Data Model

### 5.1 Supplement Schema

Each of the 93 supplements contains the following structured fields:

```
id, name, scientificName, category, commonNames
evidenceTier (1-4), evidenceTierRationale
primaryBenefits: { cognitive[], nonCognitive[] }
dosageRange, standardization, optimalDuration
studyPopulations[]
mechanismsOfAction[]: { mechanism, details }
safetyProfile: { rating, sideEffects[], contraindications[], drugInteractions[] }
effectSizes: { memoryEffect, fatigueEffect, ... }
commercialAvailability: { forms[], costRange, qualityMarkers[] }
keyCitations[]: { title, authors, year, doi, pmid, journal }
enhancedCitations: { isEnhanced, evidenceProfile, mechanisms, ... }
```

### 5.2 Evidence Tier System

| Tier | Label | Criteria | Count |
|------|-------|----------|-------|
| 1 | Strong Evidence | Multiple RCTs, meta-analyses, consistent results | 15 |
| 2 | Moderate Evidence | Some RCTs, emerging consensus | 58 |
| 3 | Preliminary Evidence | Limited studies, animal data, pilot trials | 20 |
| 4 | Insufficient Evidence | Theoretical, case reports only | 0 |

### 5.3 Problem Domains (13)

Sleep, Anxiety & Stress, Cognitive Performance, Longevity, Metabolic Health, Exercise Performance, Inflammation & Joint Health, Mood & Depression, Memory & Cognitive Aging, Muscle Strength, Exercise Recovery, Gut-Brain Axis, Stress Resilience

### 5.4 Data Files

| File | Purpose | Records |
|------|---------|---------|
| `data/supplements.js` | Primary supplement database | 93 supplements, 182 citations |
| `data/problems.js` | Health domain definitions | 13 domains |
| `data/citations.js` | Legacy citation registry | 471+ papers |
| `data/enhanced_citations/` | Academic-grade citation files | 93 files (46 enhanced) |
| `data/verified-citations.json` | Citation verification source of truth | 182 verified entries |

---

## 6. Citation & Evidence System

### 6.1 Citation Verification

All 182 unique citations across the database have been audited against PubMed and CrossRef. The `data/verified-citations.json` file serves as the single source of truth for citation integrity.

| Status | Count | Description |
|--------|-------|-------------|
| Verified PMID | 98 | Confirmed PubMed ID linking to correct paper |
| DOI verified | 82 | Valid DOI confirmed via CrossRef (no PMID available) |
| DOI unverified | 27 | Valid DOI format, not resolvable in PubMed |
| Removed | 2 | Unverifiable citations deleted from database |
| **Total usable** | **180** | |

### 6.2 Citation Rendering

Three rendering modules handle citation display:

| Module | Purpose |
|--------|---------|
| `CitationRenderer.js` | Format normalization and link generation |
| `CitationLoader.js` | Lazy loading of citation data |
| `EnhancedCitationLoader.js` | Academic-grade citation attachment |

Each citation links to its PubMed entry (via PMID) or DOI resolver, providing one-click access to the source paper.

### 6.3 Enhanced Citations

46 of 93 supplements have enhanced citation profiles containing:
- Detailed evidence profiles with confidence intervals
- Effect size quantification
- Study quality assessments
- Population-specific findings
- Mechanism-specific citations

---

## 7. Authentication & Authorization

### 7.1 Authentication (Clerk)

Clerk CDN is loaded on all pages. Authentication supports:
- Email/password sign-up
- Social logins (Google, GitHub)
- Session management with automatic refresh
- User metadata storage in Clerk + Convex sync

### 7.2 Events

| Event | Payload |
|-------|---------|
| `auth:loaded` | Clerk initialization complete |
| `auth:signed-in` | `{ user, role }` |
| `auth:signed-out` | User logged out |
| `auth:error` | Authentication failure |

### 7.3 Role-Based Access Control

Three-tier role hierarchy enforced by `js/rbac.js`:

| Role | Access Level |
|------|-------------|
| **Admin** | Full platform access + admin dashboard |
| **Subscriber** | Full guide and evidence page access (45 gated pages) |
| **Free / Anonymous** | Limited guide preview (~15% visible), ungated pages only |

Role is stored in both Clerk user metadata and Convex `users` table. Stripe webhook automatically promotes users to subscriber on payment.

---

## 8. Content Gating

### 8.1 Strategy

CSS-only soft gate preserving SEO value. Content remains in the DOM (crawlable) but is visually hidden behind a gradient overlay with CTA.

### 8.2 Gated Pages

- 20 evidence guides (`/guides/*.html`)
- 25 evidence pages (`/evidence/**/*.html`)

### 8.3 Behavior by Role

| Role | Behavior |
|------|----------|
| Anonymous | ~15% content visible, sign-up CTA |
| Free (signed in) | ~15% content visible, upgrade CTA |
| Subscriber | Full content, no gate |
| Admin | Full content, no gate |

### 8.4 Gate Placement

The generator injects a `[data-gate-cutoff]` marker after the third content row. The gate script detects this marker or falls back to a percentage-based cutoff.

### 8.5 Event Tracking

Gate impressions, CTA clicks, and conversion events are tracked via `window.SupplementDB.gateEvent()` and stored in Convex.

---

## 9. Subscription & Payments

### 9.1 Stripe Integration

| Flow | Implementation |
|------|---------------|
| Checkout | `convex/stripe.ts` → `createCheckoutSession(plan)` → Stripe hosted checkout |
| Webhook | `convex/http.ts` handles `customer.subscription.created/updated/deleted` |
| Customer Portal | Stripe-hosted billing management |
| Role Sync | Webhook updates Convex DB + Clerk user metadata |

### 9.2 Plans

| Plan | Price | Stripe Price ID | Access |
|------|-------|----------------|--------|
| Free | $0 | — | Limited guide preview |
| Monthly | $9.99/mo | env `STRIPE_MONTHLY_PRICE_ID` | Full guide + evidence access |
| Annual | $79.99/yr | env `STRIPE_ANNUAL_PRICE_ID` | Full guide + evidence access |

### 9.3 Subscription Lifecycle

States: `active`, `cancelled`, `expired`, `trialing`, `past_due`

The pricing page (`pricing.html`) is auth-aware: anonymous users see sign-up CTAs, free users see upgrade CTAs, subscribers see their current plan status and portal link.

### 9.4 Success Flow

`success.html` implements a 4-state polling flow:
1. Loading — polls Convex for subscription confirmation
2. Success — subscription confirmed, role upgraded
3. Timeout — polling exceeded, manual refresh CTA
4. Error — payment issue, support CTA

---

## 10. Newsletter & Email

### 10.1 Double Opt-In Flow

1. **Subscribe** — User enters email → Convex creates pending subscriber with 32-char confirm token
2. **Confirmation Email** — Resend delivers email with `confirm.html?token=...` link
3. **Confirm** — User clicks link → status set to confirmed → welcome email sent
4. **Unsubscribe** — `unsubscribe.html?token=...` marks subscriber as unsubscribed

### 10.2 Implementation

| Component | File |
|-----------|------|
| Shared form handler | `js/newsletter.js` (172 lines, used on 9 pages) |
| Backend logic | `convex/newsletter.ts` (342 lines) |
| Email delivery | `convex/resend.ts` (236 lines) |
| Confirmation page | `confirm.html` (6 states) |
| Unsubscribe page | `unsubscribe.html` (4 states) |

### 10.3 Database

`newsletterSubscribers` table with indexes on email, confirmToken, unsubscribeToken, status, and source.

---

## 11. Analytics

### 11.1 Dual-Layer Pipeline

| Layer | Technology | Scope |
|-------|-----------|-------|
| Client-side | PostHog JS SDK | Autocapture, custom events, session replay |
| Server-side | PostHog API via `convex/posthog.ts` | Subscription events, webhook confirmations |

### 11.2 Custom Events Tracked

| Event | Source | Data |
|-------|--------|------|
| Page views | Client | pageType, pagePath, supplementId |
| Search queries | Client | query, filters, resultCount, clickedResult |
| Gate impressions | Client | guideSlug, scrollPercent |
| CTA clicks | Client | guideSlug, userRole |
| Subscription lifecycle | Server | plan, status, stripeCustomerId |
| Newsletter signups | Server | source, status |
| Favorites sync | Client | supplementId, action |
| Auth events | Client | role, signInMethod |

---

## 12. Admin Dashboard

### 12.1 Access

Admin-only page at `/admin/index.html`. Protected by RBAC — requires `admin` role.

### 12.2 Sections

| Section | Visualizations |
|---------|---------------|
| Guide Engagement | Chart.js line chart, page view table |
| Content Gate Analytics | Impression/conversion funnel chart |
| Search Analytics | Top queries bar chart, click-through rates |
| Supplement Views | Trending supplements chart, category breakdown |
| Newsletter Stats | 6 stat cards, subscriber growth line chart |

### 12.3 Date Range Controls

7-day, 30-day, 90-day, and custom range filters. All charts and tables respond to the selected range.

### 12.4 Implementation

| Module | Lines | Purpose |
|--------|-------|---------|
| `js/admin-dashboard.js` | 600+ | Dashboard rendering, section navigation |
| `js/admin-metrics.js` | 300+ | Convex query aggregation |

---

## 13. Backend Infrastructure

### 13.1 Convex Cloud

Serverless backend at `https://robust-frog-754.convex.cloud`

### 13.2 Server Modules (12)

| Module | Purpose |
|--------|---------|
| `auth.ts` | Clerk sync, `requireAuth` / `requireAdmin` guards |
| `users.ts` | User CRUD, role assignment, Clerk ID lookup |
| `subscriptions.ts` | Subscription lifecycle management |
| `stripe.ts` | Checkout session creation, customer portal |
| `newsletter.ts` | Subscriber management, double opt-in |
| `resend.ts` | Transactional email delivery |
| `posthog.ts` | Server-side analytics events |
| `analytics.ts` | Custom analytics queries |
| `favorites.ts` | User favorites cloud sync |
| `metrics.ts` | Platform metrics aggregation |
| `http.ts` | Stripe webhook handler (POST `/stripe`) |
| `schema.ts` | Database schema definition |

### 13.3 Database Schema (7 tables)

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `users` | Clerk-synced user profiles | clerkId, email, role |
| `subscriptions` | Stripe subscription state | userId, status, stripeCustomerId |
| `pageViews` | Page view analytics | timestamp, pageType, supplementId |
| `searchEvents` | Search query tracking | timestamp, query |
| `favorites` | User supplement favorites | userId, supplementId |
| `gateEvents` | Content gate interactions | guideSlug, eventType |
| `newsletterSubscribers` | Email subscriber management | email, confirmToken, status |

---

## 14. Frontend Architecture

### 14.1 Design System

| Element | Specification |
|---------|--------------|
| Primary accent | `#2d5a3d` (forest green) |
| Header font | Source Serif 4 (serif) |
| Body font | DM Sans (sans-serif) |
| Icons | Font Awesome |
| Layout | Mobile-first responsive, Tailwind CSS utilities |

### 14.2 Evidence Tier Colors

| Tier | Color | Hex |
|------|-------|-----|
| Tier 1 — Strong | Green | `#1a6b3c` |
| Tier 2 — Moderate | Gold | `#b8860b` |
| Tier 3 — Preliminary | Brown | `#8b4513` |
| Tier 4 — Insufficient | Gray | `#64748b` |

### 14.3 JavaScript Modules (21)

| Module | Purpose |
|--------|---------|
| `app.js` | Main application (search, filters, grid rendering) |
| `auth.js` | Clerk authentication manager |
| `auth-ui.js` | Sign-in/up button components |
| `rbac.js` | Role-based access control |
| `content-gate.js` | Soft content gating system |
| `pricing.js` | Pricing page logic, Stripe checkout |
| `newsletter.js` | Newsletter form handler |
| `convex-client.js` | Convex client initialization |
| `CitationRenderer.js` | Citation format normalization |
| `CitationLoader.js` | Citation data loading |
| `EnhancedCitationLoader.js` | Academic citation loading |
| `EnhancedCitationAttacher.js` | Enhanced citation DOM attachment |
| `TemplateSystem.js` | Dynamic template rendering |
| `PerformanceOptimizer.js` | Performance utilities |
| `DataStructureOptimizer.js` | Data structure optimization |
| `ErrorBoundary.js` | Error handling and recovery |
| `admin-dashboard.js` | Admin dashboard rendering |
| `admin-metrics.js` | Admin metrics aggregation |
| `share-bar.js` | Social sharing bar |
| `analytics-enhanced.js` | Enhanced analytics tracking |

### 14.4 CSS Files (4)

| File | Size | Purpose |
|------|------|---------|
| `content-shared.css` | 37 KB | Main styles for guides, evidence, monographs |
| `pricing.css` | 10 KB | Pricing page layout |
| `content-gate.css` | 8 KB | Gate overlay and CTA styling |
| `auth.css` | 4 KB | Authentication UI styles |

---

## 15. SEO & Compliance

### 15.1 SEO

- XML sitemap (`sitemap.xml`) covering all public pages
- Open Graph meta tags on all pages
- Structured data (JSON-LD) for supplement monographs
- Canonical URLs to prevent duplicate content
- Content gate preserves SEO — gated content stays in DOM

### 15.2 Legal Compliance Pages (7)

Privacy Policy, Terms of Service, FDA Disclaimer, Cookie Policy, Copyright/DMCA Policy, Accessibility Statement

### 15.3 FDA Compliance

- Automated FDA claim audit script (`scripts/audit-fda-claims.js`)
- No therapeutic claims — evidence summaries only
- Standard FDA disclaimer on all supplement pages

---

## 16. Deployment

### 16.1 Docker Configuration

| Component | Detail |
|-----------|--------|
| Base image | `nginx:alpine` |
| Port | 8080 |
| Entrypoint | `docker-entrypoint.sh` — injects env vars at runtime |

### 16.2 Environment Variables

| Variable | Purpose |
|----------|---------|
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend authentication key |
| `CONVEX_URL` | Convex Cloud backend URL |
| `STRIPE_SECRET_KEY` | Stripe API secret |
| `STRIPE_MONTHLY_PRICE_ID` | Monthly plan Stripe price ID |
| `STRIPE_ANNUAL_PRICE_ID` | Annual plan Stripe price ID |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `SITE_URL` | Base URL for email links |
| `RESEND_API_KEY` | Resend email delivery |
| `POSTHOG_API_KEY` | PostHog analytics |

### 16.3 Page Generation Scripts

| Script | Output | Count |
|--------|--------|-------|
| `generate-supplement-pages.js` | Supplement monographs | 93 |
| `generate-guide-pages.js` | Evidence guides | 20 |
| `generate-evidence-pages.js` | Evidence pages | 25 |
| `generate-compare-pages.js` | Comparison pages | 10 |
| `generate-category-pages.js` | Category indexes | 6 |

---

## 17. Testing

### 17.1 Test Infrastructure

**Framework:** Playwright
**Total tests:** 383
**Workers:** 6 parallel
**Status:** All passing

### 17.2 Test Suites (12)

| Suite | Coverage |
|-------|----------|
| `admin-dashboard.spec.js` | Dashboard rendering, sections, charts, navigation |
| `auth-flow.spec.js` | Sign-in/up, session persistence, role assignment |
| `rbac.spec.js` | Role hierarchy, permission enforcement |
| `content-gate.spec.js` | Gate placement, visibility by role, events |
| `evidence-pages.spec.js` | Wave 1 evidence page rendering and structure |
| `guides-expansion.spec.js` | All 20 guides render correctly |
| `newsletter.spec.js` | Subscribe, confirm, unsubscribe flows |
| `stripe-checkout.spec.js` | Checkout session, success page, polling |
| `ui-functionality.test.js` | Search, filters, favorites, comparisons |
| `performance-monitoring.test.js` | Page load times, metric tracking |
| `database-utility.test.js` | Data integrity, schema validation |
| `phase-2a-validation.test.js` | Data structure validation |

---

## 18. Market Context

### 18.1 Market Size

The global dietary supplements market is valued at **$177B** (2023) with projected growth to **$327B by 2030** (CAGR 9.1%).

### 18.2 Competitive Gap

| Competitor Type | Limitation |
|----------------|-----------|
| Health blogs | Unstructured, opinion-driven, affiliate-biased |
| PubMed | Raw research — no synthesis or tier scoring |
| Examine.com | Comprehensive but dense; no problem-centered navigation |
| WebMD / Healthline | Shallow coverage, ad-driven |
| Supplement brands | Marketing-first, cherry-picked evidence |

SupplementDB differentiates through: structured evidence tiers, citation-verified data, problem-centered navigation, and transparent methodology.

---

## 19. Target Users

### 19.1 Primary Personas

| Persona | Description | Key Need |
|---------|-------------|----------|
| **Evidence-Curious Consumer** | Health-conscious individual researching supplements | Trustworthy, structured evidence summaries |
| **Integrative Practitioner** | Naturopath, functional medicine doctor, dietitian | Quick evidence lookup by health problem |
| **Biohacker / Optimizer** | Performance-focused individual stacking supplements | Mechanism details, interaction data, dosing |
| **Academic Researcher** | Graduate student or professor in nutrition/pharmacology | Citation-linked data, effect sizes |

### 19.2 Use Cases

1. "I'm considering taking ashwagandha for anxiety — what does the evidence say?"
2. "My patient asks about supplements for metabolic health — which have Tier 1 evidence?"
3. "I want to compare Lion's Mane vs Bacopa for cognitive support"
4. "I need citations for a systematic review on omega-3 cardiovascular effects"

---

## 20. Success Metrics

### 20.1 Content Metrics

| Metric | Current |
|--------|---------|
| Total supplements | 93 |
| Total citations (verified) | 180 |
| Enhanced citation profiles | 46 |
| Evidence guides | 20 |
| Evidence pages | 25 |
| Total HTML pages | 188 |
| Playwright tests passing | 383 |

### 20.2 Business KPIs (Target)

| KPI | Target |
|-----|--------|
| Monthly recurring revenue | $5,000 within 6 months |
| Subscriber conversion rate | 3-5% of registered users |
| Content gate click-through | >15% of impressions |
| Newsletter signup rate | >5% of unique visitors |
| Guide completion rate | >40% for subscribers |
| Search-to-click rate | >25% of searches |

### 20.3 Technical KPIs

| KPI | Target |
|-----|--------|
| Page load time (LCP) | < 2.5s |
| Test pass rate | 100% |
| Citation verification rate | > 98% |
| Uptime | > 99.5% |
