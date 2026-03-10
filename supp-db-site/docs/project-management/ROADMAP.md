# SupplementDB — Development Roadmap

## Project Overview

**Mission**: Build the most comprehensive, evidence-based supplement database for cognitive and mental health optimization — delivered as a MicroSaaS with subscription revenue.

**Current Status**: Phase 7 COMPLETE — 127+ static pages, Clerk auth, Convex backend, Stripe payments, Resend email, 135 Playwright tests passing.

**Branch**: `feat/clinical-journal-design-migration`

---

## Phase Summary

| Phase | Name | Status | Commit | Tests |
|-------|------|--------|--------|-------|
| P1 | Foundation & Discoverability | ✅ Complete | `afe8e75` | — |
| P2 | Content Authority & Growth | ✅ Complete | `19f48e7` | — |
| P3 | Brand & Strategic Positioning | ✅ Complete | `e49e33e` | — |
| P4 | Supplement Monograph Pages | ✅ Complete | `b7c2761` | — |
| P5 | Auth + Backend + Admin Dashboard | ✅ Complete | `600c016` | 72 |
| P6 | Stripe Checkout Integration | ✅ Complete | `251e0a5` | 113 |
| P7 | Email Service + Newsletter Backend | ✅ Complete | (pending) | 135 |
| P8 | Guide Library Expansion (8→20) | 🔄 Next | — | — |
| P9 | Problem × Supplement Evidence Pages | Planned | — | — |
| P10 | Comparison Page Expansion | Planned | — | — |
| P11 | Stack Analyzer Tool | Planned | — | — |
| P12 | Bundle Pricing Optimization | Planned | — | — |

---

## ✅ Phase 1: Foundation & Discoverability (COMPLETE)

**Commit**: `afe8e75`

SEO infrastructure, E-E-A-T compliance, structured data, and core site architecture.

- Schema.org structured data on all supplement pages
- Canonical URLs, Open Graph metadata, XML sitemap
- FDA compliance audit + Research Methodology page
- Legal compliance suite (6 pages: privacy, terms, disclaimer, cookies, DMCA, accessibility)
- Internal linking architecture across all page types

---

## ✅ Phase 2: Content Authority & Growth (COMPLETE)

**Commit**: `19f48e7`

Content expansion creating 6 category pages, 8 evidence guides, and 10 comparison pages.

- 6 category pages: Cognitive, Sleep, Stress, Energy, Immunity, Cardiovascular
- 8 evidence-based guides with deep-dive content (10,000+ words each)
- 10 supplement comparison pages (head-to-head analysis)
- Content gates with CSS `max-height` + `overflow: hidden` (SEO-preserving)
- PostHog dual analytics (client-side + server-side event tracking)

---

## ✅ Phase 3: Brand & Strategic Positioning (COMPLETE)

**Commit**: `e49e33e`

Clinical journal design system, trust infrastructure, and brand identity.

- Clinical journal design system with dark nav, evidence-tier badges
- Trust signals: expert review indicators, methodology transparency
- Brand positioning as "evidence-first" supplement resource
- Content expansion and strategic internal linking

---

## ✅ Phase 4: Supplement Monograph Pages (COMPLETE)

**Commit**: `b7c2761`

103 new individual supplement monograph pages with detailed evidence profiles.

- Template-driven page generation via `scripts/generate-supplement-pages.js`
- Each monograph: hero section, evidence summary, mechanism of action, dosage, safety, citations
- Enhanced citation rendering with Smart Citation Renderer
- Evidence-tier badge system (Meta-Analysis, RCT, Clinical Review, Preliminary)
- Total site pages: 127+

---

## ✅ Phase 5: Auth + Backend + Admin Dashboard (COMPLETE)

**Commit**: `600c016` | **Tests**: 72 passing

Full authentication, serverless backend, role-based access control, and admin analytics.

- **Clerk Authentication**: Social logins, session management, user metadata
- **Convex Backend**: 9 server modules, 60+ functions, 6 database tables
- **RBAC**: 3 roles (anonymous, free, subscriber) with `requireAdmin` / `requireSubscriber` guards
- **Admin Dashboard**: 5 sections, 7 Chart.js charts, 4 date ranges
  - Guide engagement, gate impressions, search analytics, supplement views, user activity
- **PostHog Integration**: Server-side event recording via Convex actions
- **72 Playwright Tests**: Auth flows, RBAC enforcement, content gating, dashboard rendering

**Stack**: Static HTML + Vanilla JS → Convex Cloud (`robust-frog-754.convex.cloud`) → Clerk → PostHog

---

## ✅ Phase 6: Stripe Checkout Integration (COMPLETE)

**Commit**: `251e0a5` | **Tests**: 113 passing (+41 new)

Subscription revenue collection with pricing page, checkout flow, and role sync.

- **Stripe Products**: Monthly ($9.99/mo), Annual ($79.99/yr) via env vars
- **Convex Actions**: `createCheckoutSession`, `createPortalSession`, `syncRoleToClerk`
- **Pricing Page** (`pricing.html`): 3 plan comparison cards with auth-aware CTAs
- **Success Page** (`success.html`): 4-state polling (verifying, success, timeout, error)
- **Dual-Path Role Sync**: Convex DB `users.role` + Clerk Backend API `publicMetadata.role`
- **Webhook Handler**: `convex/http.ts` with `stripe.webhooks.constructEvent()` — 4 event types
- **Content Gate**: Wired to `hasActiveSubscription` Convex query
- **Customer Portal**: Subscription management via Stripe hosted portal

---

## ✅ Phase 7: Email Service + Newsletter Backend (COMPLETE)

**Tests**: 135 passing (+22 new)

Double opt-in newsletter system with Resend email delivery, replacing localStorage-only capture.

- **Convex Schema**: `newsletterSubscribers` table with 5 indexes
- **`convex/newsletter.ts`** (342 lines): 6 exports — `subscribe`, `confirm`, `unsubscribe`, `getNewsletterStats`, `listSubscribers`, `getSubscriberGrowth`
- **`convex/resend.ts`** (236 lines): `sendConfirmationEmail` + `sendWelcomeEmail` internalActions
- **`js/newsletter.js`** (172 lines): Shared handler replacing 8+ duplicated inline scripts across 9 HTML files
- **Double Opt-In Flow**: subscribe → pending + 32-char confirmToken → Resend email → `confirm.html` → confirmed → welcome email
- **`confirm.html`** (480 lines): 6 states (loading, success, already confirmed, expired, invalid, error)
- **`unsubscribe.html`** (416 lines): 4 states (loading, success, invalid, error)
- **Sleep Guide**: Newsletter form added (was missing from all other guides)
- **Admin Dashboard**: 6 newsletter stat cards + subscriber growth chart (Chart.js)
- **Docker**: `SITE_URL` env injection in `docker-entrypoint.sh` + `docker-compose.yml`
- **Graceful Fallback**: localStorage still works when Convex is unavailable

---

## 🔄 Phase 8: Guide Library Expansion — 8 → 20 (NEXT)

**Estimated Duration**: 3-4 days

Expand the evidence guide library from 8 to 20 guides, tripling the content-gated conversion surface.

### New Guides Planned (12)

| Guide | Category | Data Readiness |
|-------|----------|---------------|
| Mood Support | Mental Health | Ready — ashwagandha, omega-3, magnesium, B vitamins |
| Memory & Cognitive Aging | Cognitive | Ready — bacopa, citicoline, phosphatidylserine, omega-3, lion's mane |
| Longevity & Healthy Aging | Aging | Partial — CoQ10, NAC, resveratrol, quercetin |
| Brain Fog & Mental Clarity | Cognitive | Ready — citicoline, alpha-GPC, creatine, lion's mane, bacopa |
| Stress Resilience & Cortisol | Stress | Ready — ashwagandha, rhodiola, phosphatidylserine, magnesium |
| Supplement Safety & Interactions | Trust | Needs new template (non-problem-centered) |
| Muscle Strength & Lean Mass | Fitness | Ready — creatine, beta-alanine, HMB, carnitine |
| Recovery & Soreness | Fitness | Ready — creatine, omega-3, curcumin, taurine |
| Healthy Aging (Women) | Aging | Partial — omega-3, magnesium, vitamin D, CoQ10, iron |
| Healthy Aging (Men) | Aging | Partial — creatine, omega-3, CoQ10, magnesium, zinc, vitamin D |
| Gut-Brain Axis Deep Dive | Digestive | Partial — probiotics, glutamine, fiber |
| Nootropic Stacks | Cognitive | Ready — racetam stacks, caffeine+theanine, choline combos |

### Deliverables
- [ ] Expand `data/problems.js` from 7 → 13 health domains
- [ ] Add 12 guide definitions to `scripts/generate-guide-pages.js` config
- [ ] Generate all 20 guides with content gates
- [ ] Newsletter forms on all new guides (using `js/newsletter.js`)
- [ ] Internal linking updated across all page types
- [ ] Sitemap regenerated
- [ ] 20+ smoke tests for new guide pages

---

## 📋 Phase 9: Problem × Supplement Evidence Pages (PLANNED)

**Estimated Duration**: 4-5 days

New page family creating 25-200 pages from existing data: `/evidence/{problem}/{supplement}.html`

- New template with problem-specific evidence excerpts
- Generator: `scripts/generate-evidence-pages.js`
- Wave 1: 25 pages across Sleep, Anxiety, Cognitive, Metabolic, Inflammation
- Internal linking: monographs ↔ evidence ↔ guides

---

## 📋 Phase 10: Comparison Page Expansion (PLANNED)

**Estimated Duration**: 3-4 days

Scale comparison pages from 10 to 50+ with auto-generation logic.

- Comparison selection algorithm (shared domains, mechanisms, categories)
- Simplified template for auto-generated pages
- Wave 1: 40 high-value comparisons

---

## 📋 Phase 11: Stack Analyzer Tool (PLANNED)

**Estimated Duration**: 5-7 days

Interactive supplement stack analysis tool at `/tools/stack-analyzer.html`.

- Multi-select supplement picker + health goal selector
- Analysis engine: overlap detection, redundancy flagging, interaction warnings
- Gated results (free = basic, subscriber = full report)
- Analytics tracking for tool usage and conversion

---

## 📋 Phase 12: Bundle Pricing Optimization (PLANNED)

**Estimated Duration**: 2-3 days

Guide bundles and pricing page optimization.

- 4 bundle landing pages (Sleep & Stress, Brain, Fitness, Longevity)
- Master bundle page
- Bundle checkout via Stripe
- Access control for bundle purchases

---

## Technical Architecture

### Current Stack (Post-Phase 7)

| Layer | Technology |
|-------|-----------|
| Frontend | Static HTML + Vanilla JS + Tailwind CSS |
| Backend | Convex Cloud (serverless DB + functions) |
| Auth | Clerk (social logins, session management) |
| Payments | Stripe Checkout (hosted) + webhooks |
| Email | Resend (transactional email delivery) |
| Analytics | PostHog (client + server-side events) |
| Hosting | Docker (nginx:alpine) — DigitalOcean/AWS ready |
| Testing | Playwright (135 tests across 5 suites) |

### Database Tables (Convex)

| Table | Purpose |
|-------|---------|
| `users` | User profiles with Clerk integration + RBAC roles |
| `pageViews` | Page view analytics |
| `searchEvents` | Search query tracking |
| `favorites` | User supplement favorites |
| `subscriptions` | Stripe subscription state |
| `gateEvents` | Content gate impressions/conversions |
| `newsletterSubscribers` | Email subscriptions with double opt-in tokens |

---

## Page Count Projection

| Page Family | Current | After P8 | After P9 | After P10 | Target |
|-------------|---------|----------|----------|-----------|--------|
| Supplement monographs | 93 | 93 | 93 | 93 | 93 |
| Evidence guides | 8 | 20 | 20 | 20 | 20 |
| Problem × Supplement | 0 | 0 | 25 | 25 | 200 |
| Comparison pages | 10 | 10 | 10 | 50 | 175 |
| Category pages | 6 | 6 | 6 | 6 | 6 |
| Trust/legal/tools | 6 | 6 | 6 | 6 | 10+ |
| **Total** | **127** | **139** | **164** | **204** | **~500** |

---

## Quality Assurance

### Evidence Standards
- **Tier 1**: Meta-analyses, systematic reviews (Cochrane preferred)
- **Tier 2**: Large RCTs (>100 participants), well-designed studies
- **Tier 3**: Smaller RCTs (30-100 participants), clinical reviews
- **Tier 4**: Preclinical studies, case reports, traditional use

### Testing Strategy
- **Playwright E2E Tests**: 135 tests across 5 suites (auth, RBAC, gating, dashboard, newsletter)
- **Mock Guard Pattern**: `window.__CLERK_MOCK__` prevents CDN script conflicts
- **Convex Mutation Mocks**: `addInitScript` pattern for serverless function mocking
- **Error Filtering**: PostHog/CORS/CDN noise excluded from test assertions

---

*This roadmap is a living document, updated after each phase completion.*

**Last Updated**: March 10, 2026
**Document Owner**: Claude Code Development Team
