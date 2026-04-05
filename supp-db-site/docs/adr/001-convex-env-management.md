# ADR 001: Convex Environment Variable Management

**Status:** Accepted
**Date:** 2026-04-05
**Decision makers:** Carlos Thomas
**Context issue:** SUPP-120

---

## Context

SupplementDB uses two Convex deployments:

| Environment | Deployment | URL |
|---|---|---|
| Local dev | `robust-frog-754` | `https://robust-frog-754.convex.cloud` |
| Production | `acoustic-chinchilla-759` | `https://acoustic-chinchilla-759.convex.cloud` |

Each deployment has its own independent set of environment variables (server-side secrets read by Convex actions and queries via `process.env`).

Separately, a Doppler project (`carlosthomasphotos/suppdb`, config `prd`) stores secrets for the broader SupplementDB infrastructure (Vercel env injection, local CLI tooling, etc.).

The question: which system is the source of truth for Convex prod env vars?

## Decision

**Option B: Convex dashboard is the source of truth for Convex-backed secrets. Doppler manages app-layer secrets only.**

This matches the reality that has been working correctly for months. The Convex dashboard at https://dashboard.convex.dev for `acoustic-chinchilla-759` holds the canonical production values for all server-side action secrets.

## Rationale

1. **Convex actions read `process.env` at runtime, not from Doppler at deploy time.** Doppler would need a sync script to push values into the Convex dashboard — an extra layer of indirection with no operational benefit since Convex already provides its own env management UI.

2. **Simplicity.** One tool per domain:
   - Convex dashboard = server-side action secrets (GSC, PostHog, Stripe, Resend, Clerk JWT, etc.)
   - Doppler = everything else (Vercel env vars, Docker build args, local CLI config)

3. **Risk.** Attempting to synchronize two systems (Option A) introduces a category of bugs where secrets drift out of sync during manual edits, and the sync script itself becomes a single point of failure.

## Consequences

### What changes

1. **Remove misleading Convex entries from Doppler.** `CONVEX_URL` and `CONVEX_DEPLOYMENT` in Doppler `prd` config will be updated to point to the dev deployment only, with a clear comment that they are NOT production values. Alternatively, a `dev` config can hold them separately.

2. **Clearly document the split.** `.env.example` will note:
   - "These are LOCAL DEV defaults, not production values."
   - "Production Convex env vars are managed in the Convex Dashboard."

3. **Create a rotation runbook.** `docs/CONVEX_ENV.md` lists every required prod Convex env var with:
   - Where to generate a new value (PostHog settings, Google Cloud Console, Stripe dashboard, etc.)
   - How to set it: `npx convex env set KEY=VALUE --deployment prod:acoustic-chinchilla-759`
   - How to verify: `npx convex env get KEY --deployment prod:acoustic-chinchilla-759`

### What does NOT change

- The two Convex deployments remain as-is (no migration, no merge).
- `.env.local` continues to use `robust-frog-754` for local `npx convex dev`.
- No secrets are rotated as part of this ADR.

## Rejected alternative

**Option A: Doppler as single source of truth with sync script.** Rejected because:
- Requires importing ~12 existing prod secrets from Convex dashboard into Doppler.
- Requires writing and maintaining a `sync-convex-env.sh` script.
- Doubles the surface area for secret management with no clear upside since Convex already has a managed env UI.
- If the sync script breaks, prod stops getting env updates with no error.

## Required env vars on prod Convex deployment

| Variable | Source | Used by |
|---|---|---|
| `CLERK_SECRET_KEY` | Clerk dashboard | `convex/auth.ts` |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk dashboard | `convex/auth.ts` |
| `CLERK_WEBHOOK_SECRET` | Clerk dashboard | `convex/auth.ts` |
| `STRIPE_SECRET_KEY` | Stripe dashboard | `convex/stripe.ts` |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard | `convex/stripe.ts` |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe dashboard | `convex/stripe.ts` |
| `STRIPE_ANNUAL_PRICE_ID` | Stripe dashboard | `convex/stripe.ts` |
| `STRIPE_GUIDE_PRICE_ID` | Stripe dashboard | `convex/stripe.ts` |
| `STRIPE_GUIDE_WEB_PRICE_ID` | Stripe dashboard | `convex/stripe.ts` |
| `RESEND_API_KEY` | Resend dashboard | `convex/email.ts` |
| `RESEND_FROM_ADDRESS` | Static | `convex/email.ts` |
| `RESEND_WEBHOOK_SECRET` | Resend dashboard | `convex/email.ts` |
| `POSTHOG_API_KEY` | PostHog personal key (`phx_...`) | `convex/posthog.ts` |
| `POSTHOG_HOST` | Static | `convex/posthog.ts` |
| `POSTHOG_PROJECT_ID` | PostHog project settings | `convex/posthog.ts` |
| `GSC_SERVICE_ACCOUNT_JSON` | Google Cloud Console | `convex/gsc.ts` |
| `GSC_SITE_URL` | Static (`https://supplementdb.info`) | `convex/gsc.ts` |
| `ANTHROPIC_API_KEY` | Anthropic dashboard | `convex/ai.ts` |
| `ANTHROPIC_MODEL` | Static | `convex/ai.ts` |
| `SITE_URL` | Static (`https://supplementdb.info`) | Various |
| `ADMIN_BOOTSTRAP_SECRET` | Self-generated | `convex/auth.ts` |
| `PDF_GENERATOR_SECRET` | Self-generated | `convex/pdf.ts` |

## Rotation procedure

For any secret in the table above:

```bash
# 1. Generate a new value in the provider's dashboard.
# 2. Set it on the prod deployment:
npx convex env set KEY="new-value" --deployment prod:acoustic-chinchilla-759

# 3. Verify:
npx convex env get KEY --deployment prod:acoustic-chinchilla-759

# 4. If the old key was also in Doppler, update Doppler too:
doppler secrets set KEY="new-value" --config prd
```

No restart or redeploy is required — Convex actions pick up new env vars on their next cold start (typically within 1-2 minutes).
