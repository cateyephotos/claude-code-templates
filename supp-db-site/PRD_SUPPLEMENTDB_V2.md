# Product Requirements Document: Evidence-Based Supplement Database

**Document Version:** 2.0
**Date:** 2026-03-10
**Status:** Live Product — SaaS Infrastructure Shipped
**Supersedes:** PRD_SUPPLEMENT_DATABASE.md (v1.0, 2026-03-04), PRD_UNIFIED_PROBLEM_CENTERED_EVIDENCE.md (v1.0, 2026-03-04), SuppDB_Site_PRD.md (consultant review), PRD Problem-Centered Evidence Guide.md (consultant extension)
**Branch:** `feat/clinical-journal-design-migration`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Strategic Direction](#3-strategic-direction)
4. [Current Product State — Complete Feature Inventory](#4-current-product-state--complete-feature-inventory)
5. [Technical Architecture](#5-technical-architecture)
6. [Data Asset Inventory](#6-data-asset-inventory)
7. [Authentication & Identity](#7-authentication--identity)
8. [Role-Based Access Control](#8-role-based-access-control)
9. [Content Gating System](#9-content-gating-system)
10. [Admin SaaS Metrics Dashboard](#10-admin-saas-metrics-dashboard)
11. [Backend Infrastructure — Convex Cloud](#11-backend-infrastructure--convex-cloud)
12. [Analytics Pipeline — Dual Layer](#12-analytics-pipeline--dual-layer)
13. [Problem-Centered Architecture](#13-problem-centered-architecture)
14. [Evidence Guide System](#14-evidence-guide-system)
15. [SEO Strategy](#15-seo-strategy)
16. [Monetization Model](#16-monetization-model)
17. [Docker Deployment & Infrastructure](#17-docker-deployment--infrastructure)
18. [Testing Infrastructure](#18-testing-infrastructure)
19. [Market Context & Competitive Landscape](#19-market-context--competitive-landscape)
20. [Target Users & Personas](#20-target-users--personas)
21. [Regulatory & Legal Framework](#21-regulatory--legal-framework)
22. [Engineering Roadmap — Completed & Remaining](#22-engineering-roadmap--completed--remaining)
23. [Success Metrics & KPIs](#23-success-metrics--kpis)
24. [Risk Assessment](#24-risk-assessment)
25. [Directory Structure Reference](#25-directory-structure-reference)

---

## 1. Executive Summary

The Evidence-Based Supplement Database is a live web application cataloging **93 supplements** with structured evidence profiles sourced from **471+ peer-reviewed research papers** spanning 20 years (2005-2025). The product serves **148 HTML pages** from a containerized Nginx deployment and has progressed from a static encyclopedia to a **SaaS-ready evidence navigation platform**.

### What Changed Since v1.0 (2026-03-04)

The v1.0 PRDs documented a product with zero backend, zero authentication, zero analytics, and zero monetization infrastructure. In the 6 days since, the following has been shipped:

| Capability | v1.0 State (Mar 4) | v2.0 State (Mar 10) |
|-----------|-------------------|---------------------|
| Authentication | None | Clerk CDN on 127+ pages |
| Backend/Database | None | Convex Cloud (6 tables, 9 server modules) |
| User Roles | None | Admin / Subscriber / Free (RBAC) |
| Content Gating | None | SEO-preserving soft gate on 8 guide pages |
| Admin Dashboard | None | 5-section dashboard with 7 Chart.js charts |
| Analytics (Client) | None | PostHog autocapture + 10 custom events |
| Analytics (Server) | None | 9 PostHog API actions via Convex |
| Docker Deployment | Basic nginx | Env-injected entrypoint with 3 service keys |
| Automated Tests | 0 | 72 Playwright tests across 4 spec files |
| User Management | None | Clerk webhook sync + Convex user store |
| Subscription Model | None | Schema + CRUD ready (Stripe integration prepped) |
| Favorites Sync | localStorage only | localStorage + cloud sync on sign-in |

### Core Thesis

The product sits at the intersection of a $177B global supplements market and an underserved niche for evidence-quality transparency. The SaaS infrastructure now enables three monetization vectors:

1. **Guide purchases** (one-time $29-49, bundle $99) via content gating
2. **B2B API access** ($39-299/mo) via Convex backend
3. **Consumer subscriptions** (full guide access) via RBAC + Stripe

---

## 2. Product Overview

### 2.1 Product Name
Evidence-Based Supplement Database (SupplementDB)

### 2.2 One-Line Description
A searchable, citation-backed database of 93 supplements with evidence-tier scoring, mechanism breakdowns, dosage guidance, safety profiles, and problem-centered evidence guides.

### 2.3 Core Value Proposition
Provides consumers, practitioners, and researchers a single source of structured, tiered, citation-linked supplement evidence — replacing the fragmented landscape of blog posts, affiliate content, and unstructured PubMed searches.

### 2.4 Deployment
- **Container:** Docker (nginx:alpine) on port 8080
- **Orchestration:** Docker Compose alongside NextJS course platform
- **Backend:** Convex Cloud at `https://robust-frog-754.convex.cloud`
- **Auth:** Clerk (CDN-loaded, no build step required)
- **Analytics:** PostHog (client + server-side)

---

## 3. Strategic Direction

### 3.1 Core Positioning

The platform is an **evidence-guided supplement research tool**.

It is NOT:
- A supplement store (no e-commerce, no affiliate links)
- A health blog (no opinion content)
- A medical advice platform (no prescriptions, no treatment recommendations)
- A social platform (no community, no user reviews)

It IS:
- A structured evidence database with decision-support tools
- A reference system that helps users interpret the scientific literature
- A generator of evidence guides organized by health problem

### 3.2 Voice & Tone

| Principle | Example |
|-----------|---------|
| Guidance, not prescriptions | "Magnesium appears consistently studied for sleep onset" |
| Evidence summaries, not promises | "Tier 1 evidence from multiple RCTs" |
| Decision support, not advice | "The evidence suggests..." |
| Transparency about limits | "Limited to 3 small RCTs" |

### 3.3 Architectural Pivot

The product has evolved through three architectural stages:

**Stage 1 (Pre-2026):** Supplement-first encyclopedia
```
Supplement → Evidence → Citations
```

**Stage 2 (Mar 2026):** Problem-centered evidence navigation
```
Health Problem → Relevant Supplements → Evidence Synthesis
```

**Stage 3 (Current):** SaaS-ready evidence platform
```
User → Auth → Role → Problem/Supplement → Evidence → Gate/Guide → Conversion
```

---

## 4. Current Product State — Complete Feature Inventory

### 4.1 Page Inventory (148 HTML files)

| Page Type | Count | Directory | Description |
|-----------|-------|-----------|-------------|
| Supplement Monographs | 93 | `/supplements/` | Individual evidence profiles |
| Evidence Guides | 8 | `/guides/` | Problem-centered guides (gated) |
| Comparison Pages | 10 | `/compare/` | Head-to-head evidence comparisons |
| Category Pages | 6 | `/categories/` | Supplement category indexes |
| Legal Pages | 6 | `/legal/` | Privacy, terms, disclaimer, etc. |
| Admin Dashboard | 1 | `/admin/` | SaaS metrics (admin-only) |
| Core Pages | 4 | `/` | Homepage, About, FAQ, Methodology |
| Test/Debug Pages | 3 | `/` | Dev utilities |
| Archive Backups | 8 | `/archive/` | Pre-cleanup snapshots |
| Report Pages | 4 | `/reports/` | Validation reports |
| Mockup Pages | 3 | `/mockups/` | Design mockups |
| Misc | 2 | Various | Verification, playwright report |

**Production pages:** 128 (excluding test, archive, report, mockup)

### 4.2 Core Features — Shipped

| Feature | Status | Implementation |
|---------|--------|---------------|
| Supplement Database | Shipped | 93 entries, 30+ fields each |
| Evidence Tier Scoring | Shipped | 4-tier classification system |
| Citation System | Shipped | 471+ papers, 93 enhanced citation files |
| Mechanism Breakdowns | Shipped | Molecular pathways per supplement |
| Dosage Calculator | Shipped | Weight-based, population-specific |
| Comparison Engine | Shipped | Radar charts, head-to-head |
| Advanced Search/Filter | Shipped | Multi-criteria with sort |
| Favorites System | Shipped | localStorage + cloud sync |
| Problem-Centered Guides | Shipped | 8 guides with evidence tiers |
| Category Indexes | Shipped | 6 supplement categories |
| FDA Compliance Audit | Shipped | Automated claim verification |
| Clinical Journal Design | Shipped | Source Serif 4 + DM Sans system |
| Responsive Layout | Shipped | Mobile-first, 2 nav patterns |
| SEO Metadata | Shipped | OG tags, structured data |
| User Authentication | Shipped | Clerk CDN on all pages |
| Role-Based Access | Shipped | Admin/Subscriber/Free |
| Content Gating | Shipped | SEO-preserving soft gate |
| Admin Dashboard | Shipped | 5 sections, 7 charts |
| Backend Database | Shipped | Convex Cloud, 6 tables |
| Analytics Pipeline | Shipped | PostHog client + server |
| Automated Tests | Shipped | 72 Playwright tests |
| Docker Deployment | Shipped | Env-injected entrypoint |

### 4.3 Features — Not Yet Built

| Feature | Priority | Dependency | Est. Effort |
|---------|----------|------------|-------------|
| Stripe Payment Integration | P1 | Stripe account setup | 2-3 weeks |
| PDF Guide Generation | P1 | Content finalization | 2 weeks |
| Guide Purchase Flow | P1 | Stripe + PDF generation | 1-2 weeks |
| Interactive Decision Tools | P2 | Problem data enrichment | 3-4 weeks |
| B2B API Layer | P2 | Convex HTTP endpoints | 2-3 weeks |
| Email Capture / Newsletter | P2 | Email provider selection | 1 week |
| Custom Domain + SSL | P1 | Domain purchase + DNS | 1 day |
| Stack Analysis Tools | P3 | Interaction data model | 4 weeks |
| Practitioner Accounts | P3 | Role expansion | 2 weeks |
| Consumer Subscription Billing | P2 | Stripe integration | 1-2 weeks |

---

## 5. Technical Architecture

### 5.1 Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Frontend | Vanilla JS (ES6+) | — | No framework dependency |
| CSS Framework | Tailwind CSS | 2.2.19 | CDN-loaded |
| Typography | Source Serif 4 + DM Sans | — | Google Fonts CDN |
| Visualization | Chart.js | Latest | CDN, radar + bar + line + pie + area |
| Icons | Font Awesome | 6.4.0 | CDN-loaded |
| Auth | Clerk | Latest | `@clerk/clerk-js` via unpkg CDN |
| Backend | Convex | 1.17.0 | Cloud-hosted, real-time |
| Analytics | PostHog | — | Client SDK + server API |
| Server | Nginx Alpine | Latest | Docker, gzip, static caching |
| Container | Docker + Docker Compose | — | Multi-service orchestration |
| Testing | Playwright | 1.55.0 | 72 automated tests |
| Build Tools | cheerio, sharp | 1.0.0, 0.34.5 | HTML injection, image processing |
| Package Manager | npm | — | Minimal dependencies |

### 5.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ auth.js  │ rbac.js  │ content- │ admin-   │ analytics-  │
│ auth-ui  │          │ gate.js  │ dashboard│ enhanced.js │
│ convex-  │          │          │ admin-   │             │
│ client   │          │          │ metrics  │             │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│                   Clerk CDN (Auth)                        │
│              JWT token ↔ Convex identity                  │
├──────────────────────────────────────────────────────────┤
│                  Convex Cloud Backend                     │
│  ┌─────────┬──────────┬─────────┬──────────┬──────────┐ │
│  │ users   │ analytics│ metrics │ favorites│ subscrip-│ │
│  │ auth    │ posthog  │         │          │ tions    │ │
│  ├─────────┴──────────┴─────────┴──────────┴──────────┤ │
│  │          6 Tables · 13 Indexes · 60+ Functions      │ │
│  └────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│               PostHog (Analytics Cloud)                   │
│         Client SDK (autocapture + 10 custom events)      │
│         Server API (9 actions, 15-min cache)             │
├──────────────────────────────────────────────────────────┤
│                Docker (nginx:alpine)                      │
│  docker-entrypoint.sh → sed env substitution → nginx     │
│  Env: CLERK_KEY, CONVEX_URL, POSTHOG_KEY                 │
└──────────────────────────────────────────────────────────┘
```

### 5.3 Data Flow

```
Page Load → auth.js initializes Clerk
          → convex-client.js connects to Convex Cloud
          → rbac.js reads user.publicMetadata.role
          → content-gate.js applies guide gating (if applicable)
          → analytics-enhanced.js fires PostHog events
          → Convex mutations record pageView/searchEvent
```

---

## 6. Data Asset Inventory

### 6.1 Supplement Database (`data/supplements.js`)

- **93 supplements** with 30+ structured fields each
- **6,143 lines** of structured JavaScript data
- **Fields per supplement:** id, name, slug, category, description, benefits[], mechanisms[], evidence tier, dosage (standard/range/timing), safety (sideEffects, contraindications, interactions), healthDomains[], keyFindings[], citations[]

### 6.2 Enhanced Citations (`data/enhanced_citations/`)

- **93 enhanced citation files** (one per supplement)
- Each file contains full bibliographic metadata: PMID, title, authors, journal, year, study type, sample size, key findings
- PubMed-validated with automated audit tools

### 6.3 Problem Database (`data/problems.js`)

- **7 health problem domains** with supplement mappings:
  1. Sleep Quality & Insomnia
  2. Anxiety & Stress Management
  3. Cognitive Performance & Memory
  4. Longevity & Anti-Aging
  5. Metabolic Health & Blood Sugar
  6. Exercise Performance & Recovery
  7. Inflammation & Joint Health

- **Per-problem data:** id, name, slug, description, category, physiologyOverview (systems, keyNeurotransmitters, summary), relatedHealthDomains[], supplements[] (with evidenceTier, relevanceScore, mechanismMatch, population-specific effects, keyStudyCitations)

### 6.4 Supporting Data

| Asset | Location | Description |
|-------|----------|-------------|
| FDA Audit Findings | `scripts/fda-audit-findings.json` | Automated compliance scan results |
| Citation Audit Reports | `tools/citation_audit.json` | 984KB validation report |
| PubMed Cache | `tools/pubmed_cache.json` | 776KB cached PubMed metadata |
| Content Strategy | `content/content-strategy.md` | SEO and content planning |
| Keyword Targets | `content/keyword-targets.md` | Search term targeting |
| Style Guide | `content/style-guide.md` | Writing standards |
| Provenance Trails | `content/provenance/` | Data lineage documentation |

---

## 7. Authentication & Identity

### 7.1 Provider: Clerk (CDN)

Clerk is loaded from unpkg CDN (`@clerk/clerk-js`) on all 127+ application pages. No build step required.

### 7.2 Implementation Files

| File | Lines | Purpose |
|------|-------|---------|
| `js/auth.js` | ~150 | Clerk initialization, auth state, custom events |
| `js/auth-ui.js` | ~200 | Sign-in/sign-up UI, UserButton rendering |
| `css/auth.css` | ~150 | Auth component styles (matches design system) |
| `scripts/inject-auth.js` | ~180 | Node.js cheerio script for batch HTML injection |

### 7.3 Auth Flow

1. Page loads → `auth.js` initializes Clerk with `__CLERK_PUBLISHABLE_KEY__` (replaced by Docker entrypoint)
2. Clerk fires `auth:loaded` custom event
3. `auth-ui.js` renders appropriate nav state:
   - **Signed out:** "Sign In" text link + "Start Free" accent button
   - **Signed in:** Circular avatar via Clerk UserButton
4. On sign-in → `auth:signed-in` event → Convex client authenticates with Clerk JWT
5. Role read from `user.publicMetadata.role` (default: `free`)

### 7.4 Mock Guard Pattern

A `window.__CLERK_MOCK__` flag prevents real Clerk CDN scripts from overwriting test mocks during Playwright testing. This enables headless auth testing without a live Clerk instance.

### 7.5 Two Nav Patterns

| Pattern | Used On | Auth Buttons Location |
|---------|---------|----------------------|
| `sticky-header` (light bg) | Homepage | After Export button |
| `legal-nav` (dark bg `#1a1a1a`) | All subpages | After Database back link |

Both patterns render `<div id="auth-buttons"></div>` in the nav, populated by `auth-ui.js`.

---

## 8. Role-Based Access Control

### 8.1 Role Definitions

| Role | Guide Access | Admin Dashboard | Monographs | Comparisons | Default |
|------|-------------|----------------|------------|-------------|---------|
| **admin** | Full | Yes | Full | Full | No |
| **subscriber** | Full | No | Full | Full | No |
| **free** | 30% + gate CTA | No | Full | Full | Yes |

### 8.2 Client-Side RBAC (`js/rbac.js`)

Exported functions:
- `getRole()` — returns current user role
- `hasRole(role)` — boolean check
- `canAccessGuide()` — admin or subscriber
- `canAccessAdmin()` — admin only
- `isAuthenticated()` — any signed-in user

### 8.3 Server-Side RBAC (`convex/auth.ts`)

Exported guards:
- `getAuthUser(ctx)` — returns user or null
- `requireAuth(ctx)` — throws if not authenticated
- `requireRole(ctx, role)` — throws if wrong role
- `requireAdmin(ctx)` — shorthand for admin check
- `requireSubscriber(ctx)` — shorthand for subscriber+ check

### 8.4 Admin Route Protection

`/admin/index.html` checks `canAccessAdmin()` on page load. Non-admin users are redirected to the homepage. This is enforced client-side with the server-side guard as a secondary layer for API calls.

---

## 9. Content Gating System

### 9.1 Strategy: SEO-Preserving Soft Gate

Guide content **stays in the DOM** (CSS `overflow: hidden` + `max-height`) so search engines can crawl the full text. Free users see the first ~30% with a gradient fade overlay.

### 9.2 Implementation

| File | Lines | Purpose |
|------|-------|---------|
| `js/content-gate.js` | ~120 | Gating logic, role check, CTA rendering |
| `css/content-gate.css` | ~80 | Gradient overlay, gate CTA styles |

### 9.3 Gate CTA Design

- **Heading:** "Unlock Full Evidence Guide" (Source Serif 4)
- **Primary CTA:** "Create Free Account" (accent bg `#2d5a3d`)
- **Secondary:** "Already have an account? Sign in"
- **Trust signal:** "Join researchers and practitioners using evidence-based data"

### 9.4 Gated Pages (8)

| Page | Path |
|------|------|
| Sleep | `/guides/sleep.html` |
| Anxiety & Stress | `/guides/anxiety-stress.html` |
| Cardiovascular | `/guides/cardiovascular.html` |
| Cognitive Performance | `/guides/cognitive-performance.html` |
| Energy & Vitality | `/guides/energy-vitality.html` |
| Immune Function | `/guides/immune-function.html` |
| Joint Health | `/guides/joint-health.html` |
| Metabolic Health | `/guides/metabolic-health.html` |

### 9.5 Gate Analytics

Gate events tracked to both PostHog (client) and Convex (`gateEvents` table):
- `gate_impression` — gate overlay displayed
- `gate_cta_click` — user clicked CTA
- `sign_up_started` — sign-up modal opened from gate
- `sign_up_completed` — user completed registration from gate

---

## 10. Admin SaaS Metrics Dashboard

### 10.1 Access

- **URL:** `/admin/index.html`
- **Protection:** RBAC admin-only (redirects non-admins to homepage)
- **Design:** Legal-nav header + collapsible sidebar + Chart.js charts

### 10.2 Implementation

| File | Lines | Purpose |
|------|-------|---------|
| `admin/index.html` | ~400 | Dashboard page with 5 sections |
| `admin/admin.css` | ~300 | Dashboard styles (design system tokens) |
| `js/admin-dashboard.js` | ~500 | Chart.js rendering + sidebar nav + date range |
| `js/admin-metrics.js` | ~250 | Metrics data fetching from Convex |

### 10.3 Dashboard Sections

**Section 1: Overview**
- Cards: Total Users, Active Today, Page Views (period), Avg Session Duration
- Quick stats with trend indicators

**Section 2: Engagement Metrics**
- Chart: DAU/WAU/MAU line chart (7D/30D/90D/1Y toggles)
- Chart: Page views by type (bar)
- Chart: Traffic sources (pie)

**Section 3: Content Quality**
- Chart: Top 20 supplements by views (horizontal bar)
- Chart: Guide engagement and completion rates
- Search volume trends

**Section 4: Business & Revenue**
- Chart: Subscribers by plan (stacked area)
- Chart: Subscription growth over time (line)
- Cards: MRR, conversion rate, churn rate

**Section 5: Activity Log**
- Real-time feed via Convex subscriptions (auto-updating)
- Filterable by event type
- Paginated

### 10.4 Date Range Controls

4 toggle buttons: **7D** | **30D** | **90D** | **1Y** — all charts update on selection.

### 10.5 Chart.js Configuration

- Colors derived from `--accent` (#2d5a3d) with opacity variants
- Font: `--font-sans` (DM Sans)
- Responsive with aspect ratio preservation
- 7 canvas elements total

---

## 11. Backend Infrastructure — Convex Cloud

### 11.1 Deployment

- **URL:** `https://robust-frog-754.convex.cloud`
- **Auth:** Native Clerk JWT integration (JWT template: "convex")
- **Client:** `js/convex-client.js` loaded via unpkg CDN

### 11.2 Database Schema (6 Tables)

| Table | Key Fields | Indexes |
|-------|-----------|---------|
| **users** | clerkId, email, name, role, avatarUrl, createdAt, lastLoginAt | by_clerkId, by_email, by_role |
| **pageViews** | userId?, sessionId, pageType, pagePath, supplementId?, timestamp, duration? | by_userId, by_timestamp, by_supplementId, by_pageType, by_sessionId |
| **searchEvents** | userId?, sessionId, query, resultCount, clickedResult?, timestamp | by_timestamp, by_userId, by_query |
| **favorites** | userId, supplementId, supplementName?, timestamp | by_userId, by_supplement, by_user_supplement |
| **subscriptions** | userId, plan, status, stripeCustomerId?, currentPeriodEnd?, createdAt | by_userId, by_status, by_stripeCustomerId, by_stripeSubscriptionId |
| **gateEvents** | userId?, sessionId, guideSlug, eventType, scrollPercent?, timestamp | by_timestamp, by_guideSlug, by_eventType |

### 11.3 Server Modules (9 files, 60+ functions)

| Module | File | Functions | Purpose |
|--------|------|-----------|---------|
| Schema | `convex/schema.ts` | — | 6 table definitions, 13 indexes |
| Auth Guards | `convex/auth.ts` | 6 | getAuthUser, requireAuth, requireRole, requireAdmin, requireSubscriber, getIdentity |
| Users | `convex/users.ts` | 7 | upsertUser, updateRole, getByClerkId, getCurrentUser, listUsers, getUserCount, getUserCountByRole |
| Analytics | `convex/analytics.ts` | 10 | recordPageView, updateDuration, recordSearch, recordSearchClick, recordGateEvent, getRecentPageViews, getPageViewsByType, getTopSupplements, getTopSearches, getGateStats |
| Metrics | `convex/metrics.ts` | 8 | getActiveUsers, getPageViewTrends, getAvgSessionDuration, getTrafficSources, getConversionFunnel, getGuideEngagement, getOverviewStats, getActivityHeatmap |
| Favorites | `convex/favorites.ts` | 7 | addFavorite, removeFavorite, toggleFavorite, getUserFavorites, isFavorited, syncFavorites, getFavoriteCount |
| Subscriptions | `convex/subscriptions.ts` | 8 | upsertSubscription, getMySubscription, cancelSubscription, reactivateSubscription, getSubscriptionMetrics, getSubscriptionsByPlan, getSubscriptionGrowth, listSubscriptions |
| PostHog | `convex/posthog.ts` | 9 | fetchEventCounts, fetchUniqueUsers, fetchTopPages, fetchRetention, fetchFunnel, fetchBrowserDistribution, fetchDeviceTypes, fetchReferrerSources, clearPostHogCache |
| HTTP | `convex/http.ts` | — | Clerk webhook handler (svix signature verification), Stripe webhook endpoint (prepped) |

---

## 12. Analytics Pipeline — Dual Layer

### 12.1 Layer 1: PostHog (Client-Side)

PostHog SDK loaded on all pages with autocapture enabled.

**10 Custom Events** (`js/analytics-enhanced.js`):

| Event | Trigger | Properties |
|-------|---------|------------|
| `supplement_viewed` | Monograph page load | supplementId, supplementName, tier |
| `guide_opened` | Guide page load | guideSlug, guideName |
| `guide_gate_shown` | Gate overlay displayed | guideSlug, scrollPercent |
| `guide_gate_cta_clicked` | Gate CTA clicked | guideSlug, ctaType |
| `search_performed` | Search executed | query, resultCount, filters |
| `search_result_clicked` | Result selected | query, resultId, resultIndex |
| `comparison_viewed` | Comparison page load | supplements, comparisonId |
| `favorite_toggled` | Favorite added/removed | supplementId, action (add/remove) |
| `auth_modal_opened` | Sign-in/up modal shown | source (nav/gate/cta) |
| `auth_completed` | Sign-in/up finished | method, isNewUser |

### 12.2 Layer 2: PostHog (Server-Side via Convex)

9 Convex actions query the PostHog API with a read-only key:

| Action | Purpose | Cache TTL |
|--------|---------|-----------|
| `fetchEventCounts` | Aggregate event counts by type | 15 min |
| `fetchUniqueUsers` | DAU/WAU/MAU calculations | 15 min |
| `fetchTopPages` | Most visited pages ranked | 15 min |
| `fetchRetention` | User retention curves | 15 min |
| `fetchFunnel` | Conversion funnel analysis | 15 min |
| `fetchBrowserDistribution` | Browser usage breakdown | 15 min |
| `fetchDeviceTypes` | Mobile/desktop/tablet split | 15 min |
| `fetchReferrerSources` | Traffic source attribution | 15 min |
| `clearPostHogCache` | Manual cache invalidation | — |

### 12.3 Layer 3: Convex Native Analytics

Direct event recording to Convex tables (pageViews, searchEvents, gateEvents) for real-time dashboard queries without PostHog API latency.

### 12.4 PostHog Environment Variables

| Variable | Purpose |
|----------|---------|
| `POSTHOG_KEY` | Client SDK key (injected via Docker entrypoint) |
| `POSTHOG_PROJECT_ID` | Server API project identifier |
| `POSTHOG_HOST` | API endpoint (default: `https://us.i.posthog.com`) |

---

## 13. Problem-Centered Architecture

### 13.1 Data Model

The `data/problems.js` file maps 7 health problems to relevant supplements with evidence tiering:

```
Health Problem
├── physiologyOverview (systems, neurotransmitters, summary)
├── relatedHealthDomains[]
└── supplements[]
    ├── supplementId
    ├── evidenceTier (1-4)
    ├── relevanceScore (0-100)
    ├── mechanismMatch[]
    ├── population-specific effects
    └── keyStudyCitations[] (PMID-linked)
```

### 13.2 Problem Domains

| Problem | Slug | Key Supplements | Guide Page |
|---------|------|----------------|------------|
| Sleep Quality & Insomnia | sleep | Melatonin, Magnesium, L-Theanine, Passionflower, 5-HTP, GABA, Ashwagandha | `/guides/sleep.html` |
| Anxiety & Stress | anxiety | Ashwagandha, Magnesium, Rhodiola, L-Theanine, Omega-3 | `/guides/anxiety-stress.html` |
| Cognitive Performance | cognitive-performance | Bacopa, Lion's Mane, Citicoline, Alpha-GPC, Caffeine | `/guides/cognitive-performance.html` |
| Longevity & Anti-Aging | longevity | Resveratrol, CoQ10, NAC, NMN | `/guides/metabolic-health.html` |
| Metabolic Health | metabolic-health | Berberine, Chromium, Alpha-Lipoic Acid, Inositol | `/guides/metabolic-health.html` |
| Exercise Performance | exercise-performance | Creatine, Beta-Alanine, Carnitine, Caffeine | `/guides/energy-vitality.html` |
| Inflammation & Joint Health | inflammation | Curcumin, Boswellia, Ginger, Omega-3 | `/guides/joint-health.html` |

### 13.3 Evidence Tier Classification

| Tier | Label | Criteria |
|------|-------|---------|
| **Tier 1** | Strong Evidence | Multiple RCTs + systematic review/meta-analysis |
| **Tier 2** | Moderate Evidence | 2+ RCTs with consistent results |
| **Tier 3** | Preliminary Evidence | Single RCT or multiple observational studies |
| **Tier 4** | Emerging Evidence | In vitro, animal, or mechanistic studies only |

---

## 14. Evidence Guide System

### 14.1 Guide Template Structure

Each guide follows a standardized 8-section format:

1. **Problem Overview** — Prevalence, physiology, conventional approaches
2. **Evidence Evaluation Methodology** — Tier system explanation, study quality criteria
3. **Supplements With Strong Evidence (Tier 1)** — Deep-dive per supplement
4. **Supplements With Moderate Evidence (Tier 2)** — Summary profiles
5. **Supplements With Preliminary Evidence (Tier 3-4)** — Brief mentions
6. **Safety and Interactions** — Drug interactions, contraindications, stacking risks
7. **Interpreting the Evidence** — How to read study results, limitation awareness
8. **Citation Index** — Full bibliography with PMIDs and DOIs

### 14.2 Pricing Model (Planned)

| Product | Price | Availability |
|---------|-------|-------------|
| Single guide (PDF + web) | $29-49 | After Stripe integration |
| All-guides bundle | $99 | After Stripe integration |
| Subscriber access (all guides) | Monthly/Annual | After subscription billing |

### 14.3 Guide Generation Pipeline

Guides are generated by `scripts/generate-guide-pages.js` (101,872 lines) which:
1. Reads `data/problems.js` for problem-supplement mappings
2. Reads `data/supplements.js` for detailed evidence data
3. Reads `data/enhanced_citations/` for bibliographic metadata
4. Produces templated HTML with the 8-section structure
5. Injects auth scripts, content-gate, and analytics

---

## 15. SEO Strategy

### 15.1 URL Structure

| Pattern | Example | Pages |
|---------|---------|-------|
| `/supplements/:slug` | `/supplements/magnesium.html` | 93 |
| `/guides/:slug` | `/guides/sleep.html` | 8 |
| `/compare/:pair` | `/compare/magnesium-vs-melatonin.html` | 10 |
| `/categories/:name` | `/categories/nootropics.html` | 6 |
| `/legal/:page` | `/legal/privacy.html` | 6 |

### 15.2 SEO-Preserving Content Gate

The soft gate keeps full guide content in the DOM with CSS-only hiding. Crawlers see the complete text, users see the gated version. No `noindex`, no JavaScript-only content.

### 15.3 Metadata

All pages include:
- `<title>` with keyword-optimized format
- `<meta name="description">` with evidence-focused copy
- Open Graph tags (og:title, og:description, og:type)
- Canonical URLs

### 15.4 Internal Linking

- Supplement pages link to relevant guides and comparisons
- Guide pages link to individual supplement monographs
- Comparison pages link to both compared supplements
- Category pages serve as hub pages for supplement groups

---

## 16. Monetization Model

### 16.1 Revenue Vectors (Prioritized)

**Vector 1: Evidence Guide Purchases (P1)**
- One-time PDF + web access: $29-49 per guide
- Bundle pricing: $99 for all guides
- Gate → Sign-up → Purchase flow
- **Status:** Content gating shipped; Stripe integration pending

**Vector 2: Consumer Subscriptions (P2)**
- Monthly/annual plans for full guide access
- Subscriber role removes all content gates
- **Status:** RBAC shipped; Stripe billing pending

**Vector 3: B2B API Access (P2)**
- Programmatic access to evidence data
- Tier pricing: $39-299/mo based on usage
- **Status:** Convex backend ready; HTTP endpoints needed

**Vector 4: Evidence Badges (P3)**
- Supplement brands license evidence ratings for marketing
- $29-79/mo per ingredient
- **Status:** Concept only

### 16.2 Unit Economics

| Metric | Current | Target (Month 6) |
|--------|---------|------------------|
| Monthly hosting cost | ~$6-21 | ~$50-100 |
| Convex Cloud | Free tier | Free tier |
| Clerk | Free tier (10K MAU) | Free tier |
| PostHog | Free tier (1M events) | Free tier |
| Revenue | $0 | $2,000-5,000 MRR |
| Gross margin | — | 85-95% |

---

## 17. Docker Deployment & Infrastructure

### 17.1 Container Configuration

| File | Purpose |
|------|---------|
| `Dockerfile.supp-db` | nginx:alpine base, COPY site files, ENTRYPOINT script |
| `docker-compose.yml` | supp-db (8080) + nextjs (3000) on `app-network` bridge |
| `docker-entrypoint.sh` | `sed` replaces 3 env placeholders before nginx starts |
| `nginx-supp-db.conf` | Gzip, static caching, `/admin/` location, CSP headers |
| `.env.example` | Template for 8 environment variables |

### 17.2 Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk dashboard |
| `CLERK_SECRET_KEY` | Yes | Clerk dashboard (webhook verification) |
| `CONVEX_URL` | Yes | Convex dashboard (defaults to production URL) |
| `CONVEX_DEPLOY_KEY` | For deploys | Convex dashboard |
| `POSTHOG_KEY` | Yes | PostHog project settings |
| `POSTHOG_PROJECT_ID` | For server API | PostHog project settings |
| `POSTHOG_HOST` | Optional | Defaults to `https://us.i.posthog.com` |
| `STRIPE_SECRET_KEY` | Future | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Future | Stripe dashboard |

### 17.3 Entrypoint Flow

```
docker-entrypoint.sh
├── Replace __CLERK_PUBLISHABLE_KEY__ in all .html/.js files
├── Replace __CONVEX_URL__ in all .html/.js files
├── Replace __POSTHOG_KEY__ in all .html/.js files
└── exec nginx -g "daemon off;"
```

---

## 18. Testing Infrastructure

### 18.1 Test Framework

- **Runner:** Playwright 1.55.0
- **Config:** `playwright.config.js` (testDir: `./tests`, testMatch: `**/*.spec.js`)
- **Base URL:** `http://localhost:8080`

### 18.2 Test Suites

| Suite | File | Tests | Scope |
|-------|------|-------|-------|
| Auth Flow | `tests/auth-flow.spec.js` | ~18 | Sign-in/out, nav rendering, both nav patterns |
| RBAC | `tests/rbac.spec.js` | ~16 | Role enforcement, admin redirect, guide access |
| Content Gate | `tests/content-gate.spec.js` | ~14 | Gate overlay, CTA click, DOM preservation (SEO) |
| Admin Dashboard | `tests/admin-dashboard.spec.js` | ~24 | Dashboard load, Chart.js init, sections, date range |

**Total: 72 Playwright tests** + legacy test suites (database-utility, performance-monitoring, phase-2a-validation, ui-functionality)

### 18.3 Test Helpers

`tests/helpers/auth-helpers.js` — Mock auth utilities that inject `window.__CLERK_MOCK__`, `SupplementDBAuth`, and `SupplementDBRBAC` objects via `page.addInitScript()`.

### 18.4 npm Scripts

```json
"test": "npx playwright test"
"test:auth": "npx playwright test tests/auth-flow.spec.js"
"test:rbac": "npx playwright test tests/rbac.spec.js"
"test:gate": "npx playwright test tests/content-gate.spec.js"
"test:dashboard": "npx playwright test tests/admin-dashboard.spec.js"
```

---

## 19. Market Context & Competitive Landscape

### 19.1 Market Size

- **Global dietary supplements market:** ~$177B (2023), projected $300B+ by 2030
- **Nootropics/cognitive health segment:** ~$6B, fastest-growing sub-segment
- **"Evidence-based" search demand:** Consistent growth reflecting consumer skepticism

### 19.2 Competitive Comparison

| Feature | SupplementDB | Examine.com | ConsumerLab | Labdoor |
|---------|-------------|-------------|-------------|---------|
| Evidence tier scoring | 4-tier system | Proprietary scale | Pass/fail | Letter grade |
| Citation transparency | Full PMID links | Partial | Behind paywall | No citations |
| Problem-centered guides | 7 domains + 8 guides | Topic-based articles | Product reviews | Category rankings |
| Mechanism breakdowns | Molecular pathways | High-level | Minimal | None |
| Comparison tools | Radar charts, head-to-head | Basic | Side-by-side products | Rankings |
| Pricing model | Guides ($29-49) + sub | $29-49/mo subscription | $54/yr subscription | Free (affiliate) |
| User auth | Clerk (shipped) | Custom | Custom | OAuth |
| Backend/API | Convex (real-time) | Proprietary | Proprietary | Proprietary |
| Supplements covered | 93 | 400+ | 700+ products | ~1,000+ |
| Primary revenue | Guide purchases (planned) | Subscriptions | Subscriptions | Affiliate |

### 19.3 Competitive Advantages

1. **Full citation provenance** — every claim linked to specific PMIDs
2. **4-tier evidence scoring** — transparent quality classification
3. **Problem-centered architecture** — user-intent-aligned navigation
4. **SEO-preserving content gate** — full indexability with monetization
5. **Real-time admin analytics** — Convex-powered live dashboard
6. **Low operational cost** — static site + serverless backend

---

## 20. Target Users & Personas

### 20.1 Primary Personas

**1. Evidence-Conscious Consumer (40%)**
- Age 28-55, college-educated
- Researches supplements before purchasing
- Frustrated by affiliate-driven content
- Willing to pay for structured, trustworthy evidence
- Typical search: "best supplements for sleep evidence"

**2. Health & Fitness Enthusiast (30%)**
- Age 22-45, active lifestyle
- Uses supplements regularly (3+ products)
- Wants to optimize stack based on science
- Comparison and dosage tools are high-value
- Typical search: "creatine vs beta-alanine research"

**3. Healthcare Practitioner (20%)**
- Naturopaths, nutritionists, integrative MDs
- Needs citation-backed references for patient discussions
- Values FDA compliance and regulatory awareness
- Willing to pay premium for professional tools
- Typical search: "magnesium glycinate evidence tier"

**4. Academic Researcher (10%)**
- Graduate students, postdocs
- Uses platform as literature navigation tool
- Values citation completeness and PMID links
- Potential B2B API customer
- Typical search: "ashwagandha cortisol RCTs"

---

## 21. Regulatory & Legal Framework

### 21.1 Legal Pages (6)

| Page | Path | Purpose |
|------|------|---------|
| Disclaimer | `/legal/disclaimer.html` | Medical/health information disclaimer |
| Privacy Policy | `/legal/privacy.html` | Data collection and usage |
| Terms of Service | `/legal/terms.html` | Platform usage terms |
| Cookie Policy | `/legal/cookies.html` | Cookie usage disclosure |
| Copyright | `/legal/copyright.html` | Content ownership |
| Accessibility | `/legal/accessibility.html` | WCAG compliance statement |

### 21.2 FDA Compliance

- Automated FDA claim audit via `scripts/audit-fda-claims.js`
- Audit findings stored in `scripts/fda-audit-findings.json`
- All supplement descriptions use DSHEA-compliant language
- No disease treatment claims; structure/function claims only

### 21.3 Content Disclaimers

Every supplement monograph and evidence guide includes:
- "This information is for educational purposes only"
- "Not intended to diagnose, treat, cure, or prevent any disease"
- "Consult a healthcare professional before starting any supplement"

---

## 22. Engineering Roadmap — Completed & Remaining

### 22.1 Completed Phases

| Phase | Description | Commit | Date |
|-------|------------|--------|------|
| P1 | FDA Compliance Audit + Research Methodology | `3cc992c` | Pre-Mar 8 |
| P2 | Brand & Strategic Positioning | `e49e33e` | Pre-Mar 8 |
| P3 | Content Expansion (103 new pages) | `b7c2761` | Pre-Mar 8 |
| P4 | Clinical Journal Design System | `4dbda78` | Mar 9 |
| P5 | Clerk Auth + Convex Backend + RBAC + Dashboard | `600c016` | Mar 10 |

### 22.2 P5 Sub-Phases (All Complete)

| Sub-Phase | Scope | Status |
|-----------|-------|--------|
| Convex Schema | 6 tables, 13 indexes | Shipped |
| Clerk CDN Integration | auth.js, convex-client.js | Shipped |
| Auth UI + Batch Injection | 127+ HTML files modified | Shipped |
| RBAC Module | Client + server guards | Shipped |
| Content Gating | 8 guide pages gated | Shipped |
| Admin Dashboard | 5 sections, 7 charts | Shipped |
| Convex Server Functions | 9 modules, 60+ functions | Shipped |
| PostHog Integration | 10 client events, 9 server actions | Shipped |
| Docker Configuration | Entrypoint, env vars, CSP | Shipped |
| Testing | 72 Playwright tests | Shipped |

### 22.3 Remaining Phases

**P6: Payment Integration (P1 priority, ~3 weeks)**
- Stripe integration via Convex HTTP endpoints
- Guide purchase flow (single + bundle)
- Subscription billing (monthly/annual)
- Webhook handling (payment events → Convex)

**P7: PDF Guide Generation (P1 priority, ~2 weeks)**
- Puppeteer/Playwright-based PDF renderer
- Branded template with evidence tables
- Automated generation from guide data
- Download delivery after purchase

**P8: Interactive Decision Tools (P2, ~4 weeks)**
- Sleep Evidence Navigator (first tool)
- User inputs symptoms/goals → system outputs ranked supplements
- Builds on problem data model

**P9: B2B API Layer (P2, ~3 weeks)**
- Convex HTTP endpoints for programmatic access
- API key management
- Rate limiting and usage tracking
- Documentation (OpenAPI spec)

**P10: Email & Growth (P2, ~2 weeks)**
- Email capture integration
- Newsletter system
- Drip campaigns for guide promotion

---

## 23. Success Metrics & KPIs

### 23.1 Traffic Metrics

| Metric | Target (Month 3) | Target (Month 12) |
|--------|------------------|--------------------|
| Monthly unique visitors | 5,000 | 50,000 |
| Organic search traffic share | 40% | 70% |
| Pages per session | 2.5 | 3.5 |
| Avg session duration | 2:30 | 3:30 |
| Bounce rate | < 55% | < 40% |

### 23.2 Conversion Metrics

| Metric | Target (Month 3) | Target (Month 12) |
|--------|------------------|--------------------|
| Free sign-up rate | 3% of visitors | 5% |
| Gate CTA click rate | 8% of gate impressions | 15% |
| Guide purchase conversion | 1% of visitors | 3% |
| Free → Subscriber conversion | 2% of free users | 5% |

### 23.3 Revenue Metrics

| Metric | Target (Month 3) | Target (Month 12) |
|--------|------------------|--------------------|
| MRR | $1,600 | $15,000-31,000 |
| Guide purchases (monthly) | 40 | 300 |
| Active subscribers | 50 | 500 |
| Revenue per visitor | $0.10 | $0.40 |

### 23.4 Content Quality Metrics

| Metric | Target |
|--------|--------|
| Evidence accuracy rate | > 99% |
| Citation validity rate | > 98% |
| FDA compliance score | 100% |
| Guide completion rate | > 60% |

---

## 24. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low initial traffic | High | High | SEO optimization, content marketing, guide promotion |
| Stripe integration complexity | Medium | Medium | Convex webhook architecture prepped; well-documented |
| Clerk free tier limits (10K MAU) | Low (short-term) | Medium | Monitor; upgrade path is $25/mo |
| Convex free tier limits | Low (short-term) | Medium | Monitor; usage-based pricing scales predictably |
| Citation accuracy degradation | Low | High | Automated PubMed validation, provenance trails |
| Competitor response (Examine.com) | Medium | Medium | Differentiate on transparency, pricing model |
| Regulatory scrutiny | Low | High | FDA audit automation, DSHEA-compliant language |
| Content gate SEO impact | Low | High | Tested: content stays in DOM, fully crawlable |
| User churn on subscriptions | High | Medium | Focus on one-time guide purchases first |
| Technical debt from static architecture | Medium | Medium | Convex backend enables gradual migration |

---

## 25. Directory Structure Reference

```
supp-db-site/
├── admin/                          # Admin dashboard (RBAC-protected)
│   ├── index.html                  # Dashboard page (5 sections, 7 charts)
│   └── admin.css                   # Dashboard styles
├── assets/                         # Static assets (images, favicons)
├── categories/                     # 6 category index pages
│   ├── amino-acids.html
│   ├── antioxidants.html
│   ├── essential-nutrients.html
│   ├── herbal-extracts.html
│   ├── nootropics.html
│   └── performance-enhancers.html
├── compare/                        # 10 head-to-head comparison pages
├── content/                        # Content strategy, keywords, provenance
│   ├── audits/
│   ├── provenance/
│   ├── research-updates/
│   ├── content-strategy.md
│   ├── keyword-targets.md
│   └── style-guide.md
├── convex/                         # Convex Cloud backend functions
│   ├── schema.ts                   # 6 tables, 13 indexes
│   ├── auth.ts                     # Server-side RBAC guards
│   ├── users.ts                    # User CRUD (7 functions)
│   ├── analytics.ts                # Event recording (10 functions)
│   ├── metrics.ts                  # Dashboard aggregation (8 functions)
│   ├── favorites.ts                # Favorites sync (7 functions)
│   ├── subscriptions.ts            # Subscription management (8 functions)
│   ├── posthog.ts                  # PostHog API actions (9 functions)
│   └── http.ts                     # Clerk/Stripe webhook handlers
├── css/                            # Stylesheets
│   ├── auth.css                    # Auth component styles
│   ├── content-gate.css            # Gate overlay styles
│   └── content-shared.css          # Shared content styles
├── data/                           # Core data assets
│   ├── supplements.js              # 93 supplements (6,143 lines)
│   ├── problems.js                 # 7 health problems with mappings
│   ├── citations.js                # Legacy citation data
│   └── enhanced_citations/         # 93 enhanced citation files
├── docs/                           # Developer documentation (28 files)
├── guides/                         # 8 evidence guide pages (gated)
│   ├── sleep.html
│   ├── anxiety-stress.html
│   ├── cardiovascular.html
│   ├── cognitive-performance.html
│   ├── energy-vitality.html
│   ├── immune-function.html
│   ├── joint-health.html
│   └── metabolic-health.html
├── js/                             # Client-side JavaScript (19 files)
│   ├── auth.js                     # Clerk initialization
│   ├── auth-ui.js                  # Auth UI components
│   ├── convex-client.js            # Convex browser client
│   ├── rbac.js                     # Client-side role checking
│   ├── content-gate.js             # Guide content gating
│   ├── admin-dashboard.js          # Dashboard UI + Chart.js
│   ├── admin-metrics.js            # Metrics data fetching
│   ├── analytics-enhanced.js       # PostHog custom events
│   ├── app.js                      # Core application logic
│   ├── app.modernized.js           # Modernized app patterns
│   ├── share-bar.js                # Social sharing
│   ├── CitationLoader.js           # Citation loading system
│   ├── CitationRenderer.js         # Citation display
│   ├── EnhancedCitationLoader.js   # Enhanced citation system
│   ├── EnhancedCitationAttacher.js # Citation attachment
│   ├── DataStructureOptimizer.js   # Data optimization
│   ├── ErrorBoundary.js            # Error handling
│   ├── PerformanceOptimizer.js     # Performance utilities
│   └── TemplateSystem.js           # HTML template engine
├── legal/                          # 6 legal/compliance pages
├── scripts/                        # Build and generation scripts (15 files)
│   ├── inject-auth.js              # Batch auth injection (cheerio)
│   ├── generate-supplement-pages.js
│   ├── generate-guide-pages.js
│   ├── generate-compare-pages.js
│   ├── generate-category-pages.js
│   ├── audit-fda-claims.js
│   └── ...
├── supplements/                    # 93 individual supplement pages
├── tests/                          # Playwright test suites
│   ├── auth-flow.spec.js           # ~18 tests
│   ├── rbac.spec.js                # ~16 tests
│   ├── content-gate.spec.js        # ~14 tests
│   ├── admin-dashboard.spec.js     # ~24 tests
│   └── helpers/auth-helpers.js     # Mock auth utilities
├── tools/                          # Citation audit and data tools (40+ files)
├── index.html                      # Homepage
├── about.html                      # About page
├── faq.html                        # FAQ page
├── methodology.html                # Research methodology
├── package.json                    # npm config (convex, cheerio, sharp, playwright)
├── playwright.config.js            # Test configuration
├── docker-entrypoint.sh            # Env var substitution script
├── Dockerfile.supp-db              # Container build
├── docker-compose.yml              # Multi-service orchestration
├── nginx-supp-db.conf              # Nginx configuration
└── .env.example                    # Environment variable template
```

---

## Appendix A: External Service Dependencies

| Service | Purpose | Free Tier Limits | Upgrade Cost |
|---------|---------|-----------------|--------------|
| **Clerk** | Authentication | 10,000 MAU | $25/mo (10K+) |
| **Convex** | Backend/Database | 512MB storage, unlimited reads | Usage-based |
| **PostHog** | Analytics | 1M events/mo | $0.00031/event |
| **Stripe** | Payments (future) | No monthly fee | 2.9% + $0.30/txn |
| **Docker Hub** | Container registry | Unlimited public | $5/mo (private) |

## Appendix B: Git History

| Commit | Message | Date |
|--------|---------|------|
| `600c016` | feat: Clerk auth + Convex backend + RBAC + admin SaaS metrics dashboard | Mar 10 |
| `4dbda78` | feat: clinical journal design system for supplement monograph pages | Mar 9 |
| `b7c2761` | feat: P3 content expansion + P4 supplement monograph pages (103 new pages) | Pre-Mar 8 |
| `3cc992c` | feat: FDA compliance audit + Research Methodology page (P1+P2) | Pre-Mar 8 |
| `e49e33e` | feat: Phase 3 — Brand & Strategic Positioning | Pre-Mar 8 |

## Appendix C: npm Scripts Reference

```json
{
  "test": "npx playwright test",
  "test:auth": "npx playwright test tests/auth-flow.spec.js",
  "test:rbac": "npx playwright test tests/rbac.spec.js",
  "test:gate": "npx playwright test tests/content-gate.spec.js",
  "test:dashboard": "npx playwright test tests/admin-dashboard.spec.js",
  "convex:dev": "npx convex dev",
  "convex:deploy": "npx convex deploy",
  "inject-auth": "node scripts/inject-auth.js",
  "generate:supplements": "node scripts/generate-supplement-pages.js",
  "generate:guides": "node scripts/generate-guide-pages.js",
  "generate:compare": "node scripts/generate-compare-pages.js",
  "audit:fda": "node scripts/audit-fda-claims.js"
}
```
