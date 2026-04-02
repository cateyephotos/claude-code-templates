# Lever 15: Your Revenue — Complete Revenue Optimization Map

**Positioning:** Mass Appeal (low barrier, high volume)
**Tone:** Calm / authoritative, dry humor, no superfluous adjectives
**Constraint:** Pre-revenue, 1 hour/week, email-only channel, solo founder
**Revenue Priority:** PDF guide sales ($9 each), then Pro subscriptions

---

## STEP 1: REVENUE MAP SUMMARY

### Where Money Enters

Currently: nowhere. Infrastructure is built (Stripe, Clerk, Convex) but no public-facing payment flow is live.

**Designed entry points:**
1. Free Database Access → SEO traffic lands on supplement monograph pages
2. Free AI Stack Analysis → discovered in-app, 3 uses/month
3. PDF Evidence Guide → $9 one-time, surfaced on thank-you page + email
4. Pro Monthly → $9.99/month, in-app upgrade prompt + email

### Where Money Stops

- After a single guide purchase. No cross-sell to related guides. No prompt to try the AI analyzer. The buyer hits a dead end.
- After Pro signup. No onboarding sequence guiding users to discover all features. Users who don't find value in month 1 churn silently.
- After 2-3 months of Pro. Power users exhaust available features and have no advanced tier, practitioner tools, or API access to graduate into.

### Where Momentum Is Being Wasted

1. **Post-analysis silence.** User gets AI Stack Analyzer results, feels clarity and excitement, and then... nothing. No prompt to go deeper. No guide offer. No Pro teaser. The highest-emotion moment in the product has zero monetization attached.
2. **Post-guide isolation.** User reads an evidence guide, gains confidence, and the experience ends. No "you might also want" for related supplements. No bridge to the AI analyzer. No invitation to Pro.
3. **Pro plateau.** Users who've explored everything sit idle. No annual conversion prompt. No advanced tier. No community. They either stay at $9.99/month out of inertia or cancel quietly.

### Visual Revenue Flow

```
                    ┌─────────────────────────────────────────┐
                    │           SEO / ORGANIC TRAFFIC          │
                    └──────────────────┬──────────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────────────┐
                    │     FREE DATABASE (Monograph Pages)       │
                    │     93 supplements, 471+ papers           │
                    └──────────┬───────────────┬───────────────┘
                               │               │
                    ┌──────────▼──────┐  ┌─────▼──────────────┐
                    │  Evidence Quiz   │  │  AI Stack Analyzer  │
                    │  (Scorecard)     │  │  (3/mo free)        │
                    └──────┬──────────┘  └──────┬─────────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐    ┌────────────────────┐
                    │  Top 20 PDF  │    │  Analysis Results   │
                    │  (free, lead │    │  Page               │
                    │   magnet)    │    │                     │
                    └──────┬──────┘    └───┬────────────┬────┘
                           │               │            │
                           ▼               ▼            ▼
                    ┌──────────────────────────┐  ┌──────────┐
                    │  PDF Evidence Guide ($9)  │  │ Pro Upsell│
                    │  Thank-you + email offer  │  │ $9.99/mo │
                    └──────────┬───────────────┘  └────┬─────┘
                               │                       │
                    ┌──────────▼───────────────────────▼─────┐
                    │              PRO MONTHLY ($9.99)         │
                    │  Unlimited analyses, interaction checker, │
                    │  full monograph access, priority features │
                    └──────────┬──────────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────────┐
                    │           PRO ANNUAL ($79.99)            │
                    │  Same features, 33% savings              │
                    └──────────┬──────────────────────────────┘
                               │
                    ┌──────────▼──────────────────────────────┐
                    │           B2B API ($39-299/mo)           │
                    │  (Future — not built)                    │
                    └─────────────────────────────────────────┘
```

---

## STEP 2: MOMENTUM HOTSPOT ANALYSIS

### Momentum Moment #1: After First AI Analysis

**Emotional state:** Clarity + Excitement + Mild Alarm

The user just received a personalized evidence breakdown of their supplement stack. Some supplements scored well. Others didn't. They now see a gap between what they believed and what the evidence says.

**Why this is a high-probability spending moment:** The analysis created a knowledge asymmetry — they now know enough to realize they don't know enough. They can see the shape of the answer but not the full detail. The desire for completeness is acute and immediate.

**What the buyer is primed to want next:** Depth. Specific dosage guidance, mechanism explanations, interaction warnings, and timing protocols for the supplements that scored well. They don't want another overview — they want the deep evidence for their specific supplements.

---

### Momentum Moment #2: After Reading a Guide

**Emotional state:** Confidence + Progress + Curiosity

The user just finished a detailed evidence guide on one supplement. They now understand dosage, timing, forms, and mechanisms at a level they've never had before. They feel competent. And that competence creates appetite.

**Why this is a high-probability spending moment:** Competence is addictive. The user just experienced what it feels like to know — really know — the evidence behind one supplement. They now want that same feeling for the rest of their stack.

**What the buyer is primed to want next:** Breadth. Either another guide for a different supplement, or a tool that lets them apply this level of rigor across their entire stack (the AI analyzer, or Pro access for unlimited analyses).

---

### Momentum Moment #3: After 2 Months of Pro

**Emotional state:** Confidence + Limitation + Readiness

The user has explored the Pro features thoroughly. They've run multiple analyses, checked interactions, read monographs. They trust the system. They may have started recommending it to others.

**Why this is a high-probability spending moment:** Trust is established. The user has internalized the product's value and no longer needs convincing — they need a reason to deepen their commitment. The shift from monthly to annual is not about features; it's about identity. They're ready to commit because leaving would now feel like a loss.

**What the buyer is primed to want next:** Savings (annual lock-in) or advancement (practitioner tools, API access, Stack Trial Tracker). The value driver here is Ease (simplify billing, remove the monthly decision) or Access (unlock capabilities reserved for serious users).

---

## STEP 3: ESCALATION DESIGN

### Escalation #1: Post-Analysis → Guide Purchase

**A. Escalation Snapshot**
- Type: Cross-sell
- Direction: Horizontal (different product at similar price point)
- Source: Own

**B. Offer Concept**

After the AI Stack Analyzer returns results, the results page includes a contextual prompt for each supplement that has a corresponding evidence guide.

This is not a generic "buy our guides" banner. It is specific to the supplements in the user's analysis, appearing inline with the results.

**Who it's for:** Anyone who just ran an analysis and saw a supplement they want to understand more deeply.

**Why it fits this moment:** The analysis gave them the verdict. The guide gives them the reasoning. The gap between "this scored Tier 1" and "here's exactly why, with dosing and timing" is precisely what the guide fills.

**Escalation Copy (appears on analysis results page, inline with each supplement result):**

> **Your analysis flagged [Supplement Name] as Tier [X] evidence for [Goal].**
> The full evidence guide covers dosage ranges from 23 clinical trials, optimal timing, form comparisons, and interaction warnings.
> [$9 — See what the studies actually say →]

**Escalation Copy (email variant, sent 24 hours post-analysis):**

Subject: The evidence behind your [Goal] stack

> You ran an analysis for [Goal] yesterday. Here's what I'd look at next.
>
> Your top-scoring supplement was [Supplement Name] — Tier [X] evidence across [N] studies. The analysis tells you it's well-supported. The evidence guide tells you exactly how to take it: which form absorbs best, what dose the studies actually used (not what the label says), and what to avoid taking it with.
>
> It's $9 and it covers everything the analysis can't fit on one page.
>
> [Get the [Supplement Name] Evidence Guide →]
>
> No subscription. No upsell inside. Just the evidence.

---

### Escalation #2: Post-Guide → Cross-sell (Related Guide or AI Analysis)

**A. Escalation Snapshot**
- Type: Cross-sell
- Direction: Horizontal
- Source: Own

**B. Offer Concept**

After a guide purchase, the thank-you page and a follow-up email (day 3) present two paths: a related guide for a complementary supplement, or an AI Stack Analysis to evaluate their full stack.

**Who it's for:** Guide buyers who now have deep knowledge on one supplement and want to extend that confidence.

**Why it fits this moment:** They just proved they value depth. The next question is whether they want depth on another supplement or breadth across their whole stack.

**Thank-you page copy (immediately after purchase):**

> **Your [Supplement Name] Evidence Guide is ready.** Check your email.
>
> While you're here — two things worth knowing:
>
> **Go deeper on a related supplement.**
> People who take [Supplement Name] often pair it with [Related Supplement]. The evidence for that combination is [strong/mixed/worth understanding].
> [See the [Related Supplement] Evidence Guide — $9 →]
>
> **Or zoom out.**
> Want to see how your entire stack scores against clinical evidence? The AI Stack Analyzer evaluates your full supplement routine in under 2 minutes.
> [Run a free Stack Analysis →]

**Follow-up email (day 3 post-purchase):**

Subject: One thing most [Supplement Name] users miss

> Most people who research [Supplement Name] don't realize that [Related Supplement] affects the same pathway — and the interaction between them matters.
>
> The [Related Supplement] Evidence Guide covers:
> - Whether combining them improves or reduces efficacy
> - Optimal timing to avoid competition for absorption
> - The 3 forms of [Related Supplement] ranked by bioavailability
>
> [$9 — Get the companion guide →]
>
> Or if you'd rather see your whole stack evaluated at once: [Run a free AI Stack Analysis →]

---

### Escalation #3: Post-AI Analysis (3/mo limit hit) → Pro Monthly

**A. Escalation Snapshot**
- Type: Upsell
- Direction: Vertical (same product, more access)
- Source: Own

**B. Offer Concept**

When a free user hits their 3rd analysis in a month, the results page displays normally but includes a contextual upgrade prompt. The prompt does not gate the results — it frames Pro as removing the constraint they just hit.

**Who it's for:** Users who found the analyzer valuable enough to use 3 times in one month. This is behavioral proof of product-market fit for that individual.

**Why it fits this moment:** They just demonstrated that 3/month is not enough. The friction is real and self-generated. The upgrade removes friction they're already feeling.

**In-app copy (after 3rd analysis results load):**

> You've used all 3 free analyses this month. Your results are above — nothing's locked.
>
> If you want unlimited analyses, interaction checks, and full monograph access, Pro is $9.99/month. That's less than a single bottle of most supplements you're researching.
>
> [Upgrade to Pro →]  |  [Not now — your next 3 free analyses reset on [date]]

**Email (sent 24 hours after 3rd analysis):**

Subject: You used all 3 this month

> You've run 3 stack analyses this month — which tells me the evidence data is actually useful to you. (That's not always the case. Most people run 1 and never come back.)
>
> Pro gives you unlimited analyses, plus interaction checking and full monograph access. It's $9.99/month — roughly the cost of one supplement you might decide not to buy after checking the evidence.
>
> [See what Pro includes →]
>
> No annual commitment. Cancel anytime. Your analysis history stays either way.

---

### Escalation #4: Pro Monthly (Month 2+) → Pro Annual

**A. Escalation Snapshot**
- Type: Continuity upgrade
- Direction: Vertical (same product, better terms)
- Source: Own

**B. Offer Concept**

After 2 months of active Pro usage (defined as: ran at least 2 analyses and viewed at least 3 monographs), prompt the switch to annual billing.

**Who it's for:** Proven engaged Pro users who have demonstrated sustained value extraction.

**Why it fits this moment:** They've paid $20 over 2 months. They're staying. The annual option saves them $40/year and removes the monthly billing friction. This is not a hard sell — it's a favor.

**In-app banner (appears in Pro dashboard at month 2):**

> You've been on Pro for 2 months. If you're planning to stick around (and your usage says you are), annual billing saves you $40/year.
>
> **Monthly: $9.99/mo ($119.88/yr)** → **Annual: $79.99/yr (33% less)**
>
> Same features. Just less money leaving your account.
>
> [Switch to Annual →]  |  [Keep Monthly]

**Email (sent at day 60 of Pro subscription):**

Subject: Quick math on your Pro subscription

> You've been on Pro Monthly for 2 months. You've run [N] analyses and checked [N] monographs. At this rate, you'll spend $119.88 this year.
>
> Annual billing is $79.99. That's $40 back in your pocket for doing exactly what you're already doing.
>
> [Switch to Annual — save $40/yr →]
>
> No change in features. No catch. Your billing just gets simpler and cheaper.

---

### Escalation #5: Power Pro Users → B2B API (Future)

**A. Escalation Snapshot**
- Type: Upsell
- Direction: Vertical (advanced access tier)
- Source: Own (future build)

**B. Offer Concept**

For Pro users who exhibit practitioner or builder behavior (10+ analyses/month, exported results, or who self-identify as coaches/practitioners in their profile), introduce the B2B API waitlist.

**Who it's for:** Health coaches, supplement brands, wellness app builders, content creators who need programmatic access to evidence data.

**Why it fits this moment:** These users have outgrown the consumer interface. They want to integrate the data, not just browse it.

**In-app prompt (conditional, for power users only):**

> You've run [N] analyses this month. If you're using SupplementDB for your practice, brand, or product — the API gives you direct access to our evidence database: 93 supplements, 471+ papers, 4-tier classification, all via REST.
>
> It's not built yet. But you can shape what it becomes.
>
> [Join the API waitlist →]

**Email (manual, to identified power users):**

Subject: You're using this differently than most people

> Most Pro users run 3-5 analyses a month. You've run [N]. That tells me you're either extremely thorough or you're using this for more than personal research.
>
> I'm building an API tier for coaches, brands, and developers who want programmatic access to the evidence database. Pricing will range from $39-299/month depending on usage.
>
> If that's interesting, I'd like to know what you'd build with it.
>
> [Reply to this email — no form, no waitlist page, just tell me]

---

## STEP 4: VALUE LOGIC ENFORCEMENT

| Escalation | Dominant Value Type | Secondary | Do NOT Add |
|-----------|-------------------|-----------|-----------|
| Post-analysis → Guide | **Depth** (evidence detail the analysis summarized) | Certainty | Bundle discounts, urgency timers, bonuses |
| Post-guide → Related guide/AI | **Certainty** (extend confidence to more supplements) | Depth | "Complete your collection" framing, FOMO |
| Free → Pro | **Access** (remove usage limit) | Depth | Feature comparisons longer than 3 items |
| Monthly → Annual | **Ease** (simpler billing, less money) | — | New features, bonuses, limited-time pricing |
| Pro → API | **Access** (programmatic, professional-grade) | Depth | Dashboards, analytics, anything the user didn't ask for |

---

## STEP 5: PRICING & FRAMING STRATEGY

### PDF Evidence Guide — $9

**Anchor comparison:** A nutritionist consult costs $100-300 and gives you general advice. This guide gives you the specific clinical evidence — dosage, timing, form, interactions — for one supplement. That's less than the cost of a single bottle of the supplement you're researching.

**Framing:** "The cost of one fewer wrong supplement purchase."

**Internal logic:** $9 is an impulse threshold. It's low enough that the decision is "do I want this?" not "can I afford this?" The margin is high (digital product), the perceived value is anchored to the alternative (hours of research or a nutritionist visit), and the specificity of the content (one supplement, deeply) makes it feel complete rather than cheap.

### Pro Monthly — $9.99/month

**Anchor comparison:** "Less than one supplement bottle per month. And it might tell you which bottles to stop buying."

**Framing:** Cost recovery. Most users take 3-6 supplements. If Pro helps them drop even one unsupported supplement, it pays for itself in month 1.

**Internal logic:** $9.99 is a standard SaaS micro-subscription. It sits below the "do I really need this?" threshold for anyone already spending $50+/month on supplements. The unlimited analyses + interaction checker make it feel like a tool, not a subscription.

### Pro Annual — $79.99/year

**Anchor comparison:** "$6.67/month instead of $9.99. You save $40/year."

**Framing:** Pure math. No emotional manipulation. The user already trusts the product — they just need the numbers.

**Internal logic:** The 33% discount is meaningful enough to motivate but not so steep that it devalues the monthly price. The annual commitment also reduces churn by locking in users who might otherwise cancel during a low-usage month.

### B2B API — $39-299/month (Future)

**Anchor comparison:** "Building your own supplement evidence database would take 6-12 months and $50,000+. Or you can query ours."

**Framing:** Build vs. buy. The API is the "buy" option for anyone who needs evidence data at scale.

---

## STEP 6: INSTALLATION BLUEPRINT

### Escalation #1: Post-Analysis → Guide

| Where | How Introduced | Action Asked |
|-------|---------------|-------------|
| **Analysis results page (inline)** | Contextual — appears below each supplement that has a corresponding guide | "See what the studies actually say →" links to guide sales page |
| **Post-analysis email (24hr)** | Personal, evidence-focused, references their specific goal and top supplement | "Get the [Supplement] Evidence Guide →" button |
| **In-app notification (if they return)** | Subtle banner: "You analyzed [Supplement] last week. The full evidence guide is available." | Links to guide page |

### Escalation #2: Post-Guide → Cross-sell

| Where | How Introduced | Action Asked |
|-------|---------------|-------------|
| **Thank-you page** | Split path: related guide OR AI analysis | Two CTAs side by side |
| **Email (day 3)** | "One thing most [Supplement] users miss" — focuses on interaction/synergy with related supplement | Single CTA to related guide, secondary CTA to analyzer |

### Escalation #3: Free → Pro

| Where | How Introduced | Action Asked |
|-------|---------------|-------------|
| **Analysis results page (after 3rd use)** | Non-gating: results show, upgrade prompt appears below | "Upgrade to Pro →" |
| **In-app usage counter** | Passive: "2 of 3 free analyses used this month" shown in header | Awareness, no CTA until 3rd use |
| **Email (24hr after 3rd analysis)** | Personal, acknowledges their engagement level | "See what Pro includes →" |

### Escalation #4: Monthly → Annual

| Where | How Introduced | Action Asked |
|-------|---------------|-------------|
| **Pro dashboard banner (month 2)** | Math-based: shows their projected annual spend vs annual price | "Switch to Annual →" |
| **Email (day 60)** | Same math, references their actual usage stats | "Switch to Annual — save $40/yr →" |
| **Settings/billing page** | Persistent: annual option always visible with savings calculated from their start date | Passive availability |

### Escalation #5: Pro → API

| Where | How Introduced | Action Asked |
|-------|---------------|-------------|
| **Manual email** | Sent individually to users with 10+ analyses/month | "Reply to this email" |
| **In-app (conditional)** | Only appears for users matching power-user criteria | "Join the API waitlist →" |

---

## STEP 7: COMPOUNDING OPTIMIZATION PLAN

### Escalation #1: Post-Analysis → Guide

**Metric to optimize:** Click-through rate from analysis results page to guide sales page.

**First lever to pull:** **Visibility.** The guide prompt currently doesn't exist. Step one is placing it inline on the results page, directly below the supplement score. No copy optimization needed yet — first, it just needs to be there.

**How this compounds:** Every analysis that shows a guide-eligible supplement becomes a passive sales prompt. As SEO traffic grows and more people run analyses, the guide prompt fires more often without any additional work. At 100 analyses/month with a 5% click-through and 20% conversion, that's 1 guide sale/month from a single placement. At 1,000 analyses/month, it's 10.

---

### Escalation #2: Post-Guide → Cross-sell

**Metric to optimize:** Second guide purchase rate within 30 days of first.

**First lever to pull:** **Framing.** The related guide needs to feel like a natural extension, not a sales pitch. The copy must reference the specific interaction or synergy between the two supplements. "People who take magnesium often pair it with vitamin D — and the dosing interaction matters" is better than "You might also like."

**How this compounds:** Each guide purchase becomes a funnel to the next. A buyer who purchases 2 guides has demonstrated a pattern — they're a guide collector. The third ask converts at a higher rate than the second. Over time, the average revenue per guide buyer rises from $9 to $18-27 without acquiring a single new user.

---

### Escalation #3: Free → Pro

**Metric to optimize:** Conversion rate from 3rd-analysis users to Pro signup.

**First lever to pull:** **Timing.** The upgrade prompt must appear at the moment of friction (hitting the limit), not before. Premature upgrade prompts train users to ignore them. The email follow-up at 24 hours catches users who felt the friction but didn't act immediately.

**How this compounds:** Every month, 3-analysis users accumulate. The conversion prompt fires automatically. A 3% conversion rate on 100 users hitting the limit means 3 new Pro subscribers/month. At $9.99/month, that's $360/year in recurring revenue from a single automated touchpoint.

---

### Escalation #4: Monthly → Annual

**Metric to optimize:** Monthly-to-annual conversion rate at month 2.

**First lever to pull:** **Language.** The prompt must use the user's actual numbers ("You've spent $19.98 so far. Annual would have been $6.67/month.") rather than generic savings claims. Personalized math converts better than abstract percentages.

**How this compounds:** Each annual conversion locks in 10 more months of revenue that would otherwise be at risk of monthly churn. A 15% conversion rate at month 2 means 15 of every 100 monthly subscribers become annual, reducing churn exposure and increasing predictable revenue.

---

### Escalation #5: Pro → API

**Metric to optimize:** Waitlist signups from power users.

**First lever to pull:** **Identification.** Before optimizing the ask, identify the power users. Flag any Pro user with 10+ analyses/month in your Convex dashboard. This is a query, not a feature build.

**How this compounds:** The waitlist itself is a validation tool. If 20 users join, you build the API. If 2 join, you don't. The compounding effect is strategic — it prevents building something nobody wants while simultaneously pre-selling to the people who do.

---

## 90-DAY REVENUE ACTIVATION PLAN

**Constraint:** 1 hour/week. Every task below is scoped to fit within that limit.

### PHASE 1: WEEKS 1-4 (Foundation)

**Objective:** Get the first $9 in the door.

| Week | Task (1 hour) | Outcome |
|------|---------------|---------|
| 1 | Build guide purchase flow: Stripe checkout for 1 PDF guide (pick the supplement with highest traffic). Connect to email delivery. | One guide is purchasable |
| 2 | Add guide prompt to AI Stack Analyzer results page — inline, contextual, for the one guide that exists. Write the copy from Escalation #1. | First passive sales prompt is live |
| 3 | Write post-analysis email (Escalation #1 email variant). Set up automated send at 24 hours post-analysis via Convex + email provider. | Automated email sales prompt is live |
| 4 | Write thank-you page with cross-sell (Escalation #2 thank-you page copy). Add AI Analyzer CTA as the second path. | Post-purchase revenue path exists |

**Phase 1 revenue potential:** 1-3 guide sales/month ($9-27/month)

### PHASE 2: WEEKS 5-8 (Expand Guides + Pro Prompt)

**Objective:** Create the Pro conversion prompt and a second guide.

| Week | Task (1 hour) | Outcome |
|------|---------------|---------|
| 5 | Build second PDF guide (next highest-traffic supplement). Add to Stripe. | Two guides purchasable |
| 6 | Add usage counter to analyzer ("2 of 3 free analyses used this month"). Add upgrade prompt copy from Escalation #3 on 3rd-analysis results page. | Pro conversion prompt is live |
| 7 | Write Pro upgrade email (Escalation #3 email variant). Set up automated send at 24hr after 3rd analysis. | Automated Pro upsell is live |
| 8 | Write day-3 post-guide cross-sell email (Escalation #2 email variant) linking Guide 1 → Guide 2 and vice versa. | Cross-sell loop between guides is live |

**Phase 2 revenue potential:** 3-8 guide sales/month ($27-72) + 1-2 Pro signups ($10-20/month recurring)

### PHASE 3: WEEKS 9-12 (Annual + Optimize)

**Objective:** Install annual conversion and optimize the highest-impact touchpoint.

| Week | Task (1 hour) | Outcome |
|------|---------------|---------|
| 9 | Build annual billing option in Stripe. Add settings/billing page with annual toggle. | Annual plan purchasable |
| 10 | Write monthly-to-annual email (Escalation #4 email variant). Set up automated send at day 60 of Pro subscription. Add Pro dashboard banner from Escalation #4. | Annual conversion prompt is live |
| 11 | Review analytics: which escalation point has the highest traffic and lowest conversion? Write one copy variation for that point. A/B test. | First optimization cycle |
| 12 | Build third PDF guide. Add cross-sell links to all three guide thank-you pages and post-purchase emails. | Three guides in cross-sell loop |

**Phase 3 revenue potential:** 5-15 guide sales/month ($45-135) + 2-5 Pro subscribers ($20-50/month recurring) + 1-2 annual conversions ($80-160 one-time)

### PROJECTED 90-DAY CUMULATIVE

| Revenue Stream | Conservative | Moderate |
|---------------|-------------|---------|
| Guide sales (one-time) | $135 | $400 |
| Pro Monthly (recurring) | $60 | $200 |
| Pro Annual (recurring) | $80 | $160 |
| **Total (90 days)** | **$275** | **$760** |

These numbers are small. That's correct. At 1 hour/week with zero existing audience, the first 90 days are about building the machine, not the revenue. The compounding happens in months 4-12 as SEO traffic grows and every new visitor enters a system that already has prompts, emails, and cross-sells running automatically.

---

## OPTIMIZATION PRIORITY ORDER

After the 90-day activation, optimize in this sequence:

1. **Post-analysis → Guide prompt** (highest traffic touchpoint, easiest to improve with copy changes)
2. **Post-guide cross-sell email** (cheapest revenue: no new product needed, just better framing)
3. **Free → Pro conversion prompt** (recurring revenue, highest long-term value)
4. **Monthly → Annual conversion** (reduces churn, increases predictability)
5. **Guide catalog expansion** (each new guide multiplies the cross-sell network)
6. **API waitlist** (only after 50+ Pro subscribers — validates demand before building)

---

## SUMMARY

The revenue system for SupplementDB is not a funnel. It is a set of contextual prompts installed at moments of high emotional readiness. Every prompt feels like a continuation of the experience, not an interruption.

The core principle: the user's own behavior (running analyses, buying guides, hitting limits) generates the sales prompts. You do not chase. You do not discount. You place the right offer in the right moment, and the product sells itself after the initial work is done.

Build the machine in 12 weeks. Spend months 4-12 feeding it traffic and optimizing the weakest link.
