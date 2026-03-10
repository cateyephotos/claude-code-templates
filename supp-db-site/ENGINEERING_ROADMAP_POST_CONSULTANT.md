# Engineering Roadmap — Post-Consultant Review Analysis

**Date:** 2026-03-10
**Branch:** `feat/clinical-journal-design-migration`
**Baseline:** PRD v2.0 (commit `5d0f96a`)

---

## 1. Consultant Assessment: What They Got Right

The consultant's review is unusually well-calibrated for someone evaluating a static-site-based MicroSaaS. Here's what holds up against the actual codebase:

### ✅ Correctly Identified Strengths

| Observation | Verdict | Why It's Accurate |
|---|---|---|
| "You shipped the SaaS spine" | **Correct** | Clerk auth, Convex backend (6 tables, 60+ functions), RBAC (3 roles), PostHog dual analytics — all verified with 72/72 Playwright tests |
| "Problem-centered architecture is the correct core" | **Correct** | `data/problems.js` maps 7 health domains → supplements with `evidenceTier`, `relevanceScore`, `mechanismMatch`, and population-specific effects. This is a genuine knowledge graph, not a flat list |
| "SEO structure is now viable" | **Correct** | 93 supplement pages, 8 guides, 10 comparisons, 6 categories — all static HTML with canonical tags, OG metadata, and internal linking. Crawlable by design |
| "Content gate design is smart" | **Correct** | CSS `max-height` + `overflow: hidden` preserves DOM content for search engines while visually gating. This is the standard pattern used by major publishers |
| "Admin dashboard + analytics is underrated" | **Correct** | 5 dashboard sections, 7 Chart.js charts, 4 date ranges. Tracks guide engagement, gate impressions, search queries, supplement views — all feeding back into product decisions |
| "Convex is a good fit" | **Correct** | Zero-config serverless, real-time queries, event recording — all running. 9 server modules handle auth, analytics, favorites, subscriptions, metrics, and PostHog integration |
| "72 Playwright tests is excellent" | **Correct** | 4 test suites (auth, RBAC, gating, dashboard) with mock guard pattern (`window.__CLERK_MOCK__`) preventing CDN script conflicts |

### ✅ Correctly Identified Gaps

| Gap | Verified Against Codebase |
|---|---|
| Guide catalog is too small (8) | **True** — 8 guides exist. The consultant's 20-guide target is reasonable. Our generators already support adding more via the `GUIDES` array in `scripts/generate-guide-pages.js` |
| Comparison pages underdeveloped (10) | **True** — 10 comparisons vs 4,278 possible. The `COMPARISONS` array in `scripts/generate-compare-pages.js` is hardcoded with 10 entries. Needs expansion logic |
| No interactive tools | **True** — Zero tool/calculator pages exist. The data model (`problems.js` + `supplements.js`) has enough structure for a Stack Analyzer but no UI or API exists |
| Email capture is client-side only | **True** — Newsletter forms exist on homepage + all 8 guides, but they write to `localStorage` only. No email service integration (no Resend, SendGrid, or Mailchimp) |
| No Stripe checkout flow | **Partially true** — The Convex backend has full subscription mutations (`upsertSubscription`, `cancelSubscription`, etc.) and a Stripe webhook handler in `convex/http.ts`. But there's no client-side checkout, no Stripe products/prices configured, and no pricing page |

### ⚠️ Where the Consultant Slightly Misses

| Claim | Reality |
|---|---|
| "No email capture yet" | Email capture UI exists everywhere — it just doesn't connect to an email service. The fix is a backend integration, not a UI rebuild |
| "Stripe + Guide Purchases" as step 1 | The webhook handler and subscription mutations already exist in Convex. The real missing piece is: (a) Stripe product/price setup, (b) a checkout session creator, (c) a pricing/purchase page, and (d) wiring the content gate to check subscription status |
| "Build 500 pages" as the SEO strategy | The page count is right, but the consultant underestimates the engineering needed for the `Problem × Supplement` page family. This is a new template type + new generator script + new data mapping, not just "more comparisons" |
| Rating moved from 6→8 | Fair. The honest gap to 10 is: Stripe revenue, email service, and at least one interactive tool |

---

## 2. What's Worth Building (Priority-Ordered)

Based on the consultant's review cross-referenced with our actual codebase state, here's what I'd recommend — **ordered by revenue impact per engineering hour**.

### Priority 1: Stripe Checkout + Guide Purchases (Revenue Unlock)

**Why first:** Everything else generates traffic to a product that can't collect money. The backend scaffolding already exists — this is a wiring job, not a rebuild.

**What already exists:**
- `convex/subscriptions.ts` — 8 functions (upsert, cancel, get, list, metrics)
- `convex/http.ts` — Stripe webhook handler processing 4 event types
- `convex/schema.ts` — subscriptions table with `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `currentPeriodStart`, `currentPeriodEnd`
- Content gate CSS + JS on all 8 guides
- RBAC system (`requireSubscriber` guard)

**What needs to be built:**
1. Stripe product/price setup (products: Monthly, Annual, Lifetime)
2. Checkout session creation endpoint (Convex action calling Stripe API)
3. Pricing page (`/pricing.html`) with plan cards + Stripe Checkout redirect
4. Post-purchase success page
5. Wire content gate to check `subscriptions.getMySubscription()` instead of just auth state
6. Customer portal link for subscription management
7. Stripe webhook signature verification (currently placeholder)

**Estimated scope:** ~2-3 days of focused engineering

---

### Priority 2: Email Service Integration (Growth Engine)

**Why second:** Newsletter UI already exists on 9 pages. We need it to actually send somewhere.

**What already exists:**
- Newsletter form on homepage + all 8 guides
- PostHog event tracking (`guide_email_captured`)
- localStorage dedup logic

**What needs to be built:**
1. Email service integration (Resend recommended — simple API, good deliverability, free tier)
2. Convex action: `storeNewsletterSubscription` — saves email to Convex + sends to Resend
3. Welcome email template
4. Weekly/monthly research digest template
5. Unsubscribe handling
6. Wire existing frontend forms to call Convex mutation instead of localStorage-only

**Estimated scope:** ~1-2 days

---

### Priority 3: Guide Library Expansion to 20 (Content Multiplier)

**Why third:** Generator infrastructure exists. Adding guides is a data + config job.

**What already exists:**
- `scripts/generate-guide-pages.js` — template-driven generator with rich config per guide
- `data/problems.js` — 7 problem domains with supplement mappings
- 8 guides already live with full evidence citations, mechanism sections, and content gates

**What needs to be built:**
1. Expand `data/problems.js` from 7 → 13 domains (add: Mood, Memory/Cognitive Aging, Brain Fog, Stress Resilience, Muscle Strength, Recovery/Soreness)
2. Add 12 guide definitions to `GUIDES` array in generator:

| New Guide | Class | Data Ready? |
|---|---|---|
| Mood Support | B | Yes — maps to existing ashwagandha, omega-3, magnesium, B vitamins |
| Memory & Cognitive Aging | B | Yes — bacopa, citicoline, phosphatidylserine, omega-3, lion's mane |
| Longevity & Healthy Aging | A | Partial — CoQ10, NAC, resveratrol, quercetin in DB; NMN missing |
| Brain Fog & Mental Clarity | C | Yes — citicoline, alpha-GPC, creatine, lion's mane, bacopa |
| Stress Resilience & Cortisol | C | Yes — ashwagandha, rhodiola, phosphatidylserine, magnesium |
| Supplement Safety & Interactions | Trust | Needs new template (not problem-centered) |
| Muscle Strength & Lean Mass | B | Yes — creatine, beta-alanine, HMB, carnitine |
| Recovery & Soreness | C | Yes — creatine, omega-3, curcumin, taurine |
| Healthy Aging (Women) | C | Partial — omega-3, magnesium, vitamin D, CoQ10, iron |
| Healthy Aging (Men) | C | Partial — creatine, omega-3, CoQ10, magnesium, zinc, vitamin D |
| Cardiovascular (already exists) | — | Already shipped |
| Immune Function (already exists) | — | Already shipped |

3. Generate all pages, verify with Playwright
4. Update internal linking across existing pages

**Estimated scope:** ~3-4 days (data mapping + generation + QA)

---

### Priority 4: Problem × Supplement Pages (New Page Family — SEO Multiplier)

**Why fourth:** This is the consultant's strongest recommendation. It creates 200+ pages from existing data. But it requires a new template and generator.

**What needs to be built:**
1. New template: `Template B: Problem × Supplement`
   - URL pattern: `/evidence/{problem}/{supplement-slug}.html`
   - Sections: overview, why studied for this problem, evidence summary, dose ranges, mechanisms, safety, limitations, links to guide + monograph
2. New generator: `scripts/generate-evidence-pages.js`
   - Input: `problems.js` × `supplements.js` where `evidenceTier <= 2 OR relevanceScore >= 70`
   - Config: `minEvidenceTier`, `minRelevanceScore`, `maxPagesPerProblem`
3. New data mapping: Each problem → relevant supplements with problem-specific evidence excerpts
4. Internal linking: supplement pages → evidence pages, guide pages → evidence pages
5. Sitemap updates

**First 25 pages (Wave 1):**
- Sleep: magnesium, melatonin, glycine, theanine, ashwagandha (5)
- Anxiety: ashwagandha, magnesium, rhodiola, theanine, omega-3 (5)
- Cognitive: bacopa, lion's mane, citicoline, alpha-GPC, creatine (5)
- Metabolic: berberine, chromium, alpha-lipoic acid, inositol, magnesium (5)
- Inflammation: curcumin, boswellia, ginger, omega-3, CoQ10 (5)

**Estimated scope:** ~4-5 days (template + generator + 25 pages + linking)

---

### Priority 5: Comparison Page Expansion (SEO Volume)

**Why fifth:** Generator exists but is hardcoded. Needs expansion logic.

**What already exists:**
- `scripts/generate-compare-pages.js` with rich template (verdict, who-should-choose, stacking advice, related guides)
- 10 hand-crafted comparisons already live

**What needs to be built:**
1. Comparison selection algorithm:
   - Same-problem substitutes (highest value)
   - Same-mechanism alternatives
   - Same-category alternatives
   - Same-goal comparisons
2. Auto-generation config: `{ minSharedDomains: 2, minDataOverlap: 3 }`
3. Template simplification for auto-generated pages (less hand-written verdict, more data-driven)
4. Generate 40 high-value comparisons (Wave 1), then 80 more (Wave 2)

**First 20 new comparisons:** (consultant's list is spot-on)
- magnesium vs glycine, melatonin vs glycine, ashwagandha vs theanine
- citicoline vs alpha-GPC, citicoline vs bacopa, creatine vs caffeine
- berberine vs chromium, berberine vs inositol, alpha-lipoic acid vs berberine
- curcumin vs ginger, omega-3 vs curcumin, magnesium vs theanine
- rhodiola vs caffeine, CoQ10 vs carnitine, glycine vs GABA

**Estimated scope:** ~3-4 days (algorithm + template + 40 pages)

---

### Priority 6: Stack Analyzer Tool (Interactive Moat)

**Why sixth (not earlier):** This is the highest-value differentiator long-term, but it requires revenue and traffic first. Build it once guides are converting.

**What needs to be built:**
1. New page: `/tools/stack-analyzer.html`
2. UI: Multi-select supplement picker + health goal selector
3. Analysis engine (client-side JS using `supplements.js` + `problems.js`):
   - Evidence rating per goal
   - Mechanism overlap detection (shared pathways)
   - Redundancy flagging (similar mechanisms, e.g., citicoline + alpha-GPC)
   - Dosage conflict detection
   - Known interaction warnings
4. Results display: ranked supplements, warnings, optimization suggestions
5. Gate: Free tier gets basic analysis, subscribers get full report
6. Analytics: track tool usage, supplement combos, conversion from tool → guide purchase

**Estimated scope:** ~5-7 days (complex UI + analysis logic + gating)

---

### Priority 7: Guide Bundle & Pricing Pages (Revenue Optimization)

**What needs to be built:**
1. Bundle configuration in data layer
2. Bundle landing pages: Sleep & Stress, Brain & Productivity, Fitness, Longevity
3. Master bundle page (all guides for $99-149)
4. Stripe Checkout integration for bundle purchases
5. Access control: bundle purchase unlocks multiple guides

**Estimated scope:** ~2-3 days (after Stripe is wired)

---

## 3. Engineering Phases (Execution Order)

### Phase 6 (P6): Revenue — Stripe Checkout + Pricing Page ✅ COMPLETE
**Duration:** 2-3 days → **Completed 2026-03-10** (commit `251e0a5`)
**Deliverables:**
- [x] Stripe products/prices config (Monthly $9.99, Annual $79.99) — env vars in `.env.example`
- [x] Convex action: `createCheckoutSession` + `createPortalSession` + `syncRoleToClerk` — `convex/stripe.ts` (214 lines)
- [x] `/pricing.html` with 3 plan comparison cards — Free/$0, Monthly/$9.99, Annual/$79.99 (337 lines)
- [x] Post-purchase success page — `success.html` with 4-state polling (488 lines)
- [x] Content gate wired to subscription status — Convex `hasActiveSubscription` fallback in `content-gate.js`
- [x] Stripe webhook signature verification — `convex/http.ts` with `stripe.webhooks.constructEvent()` handling 4 events
- [x] Customer portal link — `openPortal()` in `pricing.js` via `stripe:createPortalSession`
- [x] 41 Playwright tests (checkout flow, gate unlocking, subscription state, success page states, FAQ accordion)
- [x] Dual-path role sync: Convex DB + Clerk Backend API PATCH for `publicMetadata.role`
- [x] Auth-aware pricing CTAs: Anonymous→signup, Free→checkout, Subscriber→manage
- [x] **113 total tests passing** (72 existing + 41 Stripe)

### Phase 7 (P7): Email Service + Newsletter Backend ✅ COMPLETE
**Duration:** 1-2 days → **Completed 2026-03-10** (branch `feat/clinical-journal-design-migration`)
**Deliverables:**
- [x] Resend integration — `convex/resend.ts` (236 lines) with `sendConfirmationEmail` + `sendWelcomeEmail` internalActions
- [x] `convex/newsletter.ts` (342 lines) — 6 exports: `subscribe`, `confirm`, `unsubscribe`, `getNewsletterStats`, `listSubscribers`, `getSubscriberGrowth`
- [x] `newsletterSubscribers` table in Convex schema with 5 indexes (`by_email`, `by_confirmToken`, `by_unsubscribeToken`, `by_status`, `by_source`)
- [x] Branded HTML email templates — confirmation (24h expiry notice) + welcome email with guide links
- [x] Shared `js/newsletter.js` (172 lines) replacing 8+ duplicated inline handlers across 9 HTML files
- [x] Double opt-in flow: subscribe → pending + confirmToken → Resend email → `confirm.html` → confirmed → welcome email
- [x] `confirm.html` (480 lines) with 6 states: loading, success, already confirmed, expired, invalid, error
- [x] `unsubscribe.html` (416 lines) with 4 states: loading, success, invalid, error
- [x] Sleep guide newsletter form added (was missing from all other guides)
- [x] Admin dashboard newsletter metrics — 6 stat cards + subscriber growth chart (Chart.js)
- [x] Docker env injection for `SITE_URL` in `docker-entrypoint.sh` + `docker-compose.yml`
- [x] 22 Playwright tests (newsletter forms, confirm/unsubscribe flows, admin metrics, edge cases)
- [x] **135 total tests passing** (113 existing + 22 newsletter)

### Phase 8 (P8): Guide Library Expansion (8 → 20)
**Duration:** 3-4 days
**Deliverables:**
- [ ] `data/problems.js` expanded to 13 domains
- [ ] 12 new guide definitions in generator config
- [ ] All 20 guides generated and verified
- [ ] Internal linking updated across all pages
- [ ] Sitemap regenerated
- [ ] Content gate applied to new guides
- [ ] 20+ smoke tests for new guide pages

### Phase 9 (P9): Problem × Supplement Evidence Pages
**Duration:** 4-5 days
**Deliverables:**
- [ ] New template: evidence page
- [ ] New generator: `scripts/generate-evidence-pages.js`
- [ ] New data mapping: problem → supplement evidence excerpts
- [ ] 25 Wave 1 pages generated
- [ ] Internal linking: supplements ↔ evidence ↔ guides
- [ ] Sitemap updated
- [ ] 15+ tests

### Phase 10 (P10): Comparison Expansion
**Duration:** 3-4 days
**Deliverables:**
- [ ] Comparison selection algorithm
- [ ] Auto-generation config
- [ ] Simplified template for auto-generated pages
- [ ] 40 Wave 1 comparisons generated
- [ ] Internal linking updated
- [ ] 10+ tests

### Phase 11 (P11): Stack Analyzer Tool
**Duration:** 5-7 days
**Deliverables:**
- [ ] `/tools/stack-analyzer.html`
- [ ] Supplement multi-select UI
- [ ] Analysis engine (overlap, redundancy, interactions)
- [ ] Gated results (free vs subscriber)
- [ ] Analytics tracking
- [ ] 15+ tests

### Phase 12 (P12): Bundles + Pricing Optimization
**Duration:** 2-3 days
**Deliverables:**
- [ ] 4 bundle landing pages
- [ ] Master bundle page
- [ ] Bundle checkout via Stripe
- [ ] Access control for bundle purchases
- [ ] 8+ tests

---

## 4. Page Count Projection

| Page Family | Current | After P8 | After P9 | After P10 | Total |
|---|---|---|---|---|---|
| Supplement monographs | 93 | 93 | 93 | 93 | 93 |
| Evidence guides | 8 | 20 | 20 | 20 | 20 |
| Problem × Supplement | 0 | 0 | 25 (Wave 1) | 25 | 25→200 |
| Comparison pages | 10 | 10 | 10 | 50 | 50→175 |
| Category pages | 6 | 6 | 6 | 6 | 6 |
| Trust/legal/about | 6 | 6 | 6 | 6 | 6 |
| Tool pages | 0 | 0 | 0 | 0 | 1+ |
| **Total** | **123** | **135** | **160** | **200** | **~500** |

---

## 5. Revenue Model Projection

| Lever | Price | Est. Monthly Volume (Month 6) | MRR |
|---|---|---|---|
| Monthly subscription | $9.99/mo | 80 subscribers | $799 |
| Annual subscription | $79.99/yr | 40 subscribers | $267 |
| Lifetime access | $199 one-time | 10/month | $1,990 (one-time) |
| Guide bundles | $49-99 | 20/month | $1,400 |
| **Projected Month 6 MRR** | | | **~$2,500-4,500** |

Consultant's $5k-15k MRR at 12-18 months is achievable if guide library + comparisons + tools drive 50k+ monthly traffic.

---

## 6. Risk Mitigation

| Risk | Mitigation |
|---|---|
| Over-engineering before traffic | P6 (Stripe) ships in ≤3 days. Revenue validation before building 500 pages |
| Guide quality dilution at scale | Three-class system: 4 Flagship (deep), 6 Supporting (moderate), 10 Derivative (lighter). Don't over-build all equally |
| Auto-generated page quality | Problem × Supplement and Comparison pages use structured data, not LLM-generated prose. Template quality controls output quality |
| Stripe complexity | Use Stripe Checkout (hosted) not Stripe Elements (embedded). Minimal frontend, maximum reliability |
| Email deliverability | Start with Resend (good defaults, DKIM/SPF included). Don't build custom email infrastructure |

---

## 7. Decision: What NOT to Build (Consultant Items We Defer)

| Item | Why Defer |
|---|---|
| PubMed monitoring / evidence update pipeline | Premature. Dataset is rich enough for 12+ months of content. Automate updates after revenue is established |
| Interaction Checker (separate tool) | Fold into Stack Analyzer. Two tools with overlapping logic is waste |
| Evidence API (public) | No demand signal yet. Build internal API first, expose later if B2B interest emerges |
| Personalized Guide Generator | Requires user data (health profile, goals). Build after Stack Analyzer proves tool engagement |
| 300+ comparison pages immediately | Start with 40-50 high-intent comparisons. Expand based on search console data showing which pairs get impressions |

---

## 8. Immediate Next Action

~~**Start Phase 6 (Stripe Checkout)**~~ → **✅ P6 COMPLETE (2026-03-10)**

~~**Start Phase 7 (Email Service + Newsletter Backend)**~~ → **✅ P7 COMPLETE (2026-03-10)**

**Start Phase 8 (Guide Library Expansion: 8 → 20)** — Revenue collection (P6) and email capture (P7) are both live. The growth engine is operational. Now expand the content library that drives traffic and conversions:
1. Expand `data/problems.js` from 7 → 13 health domains
2. Add 12 new guide definitions + generate pages via `scripts/generate-guide-pages.js`
3. Apply content gates + internal linking to all new guides
4. Each new guide is a new email capture + conversion opportunity
