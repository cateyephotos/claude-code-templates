/**
 * auth.config.js — Convex authentication provider configuration.
 *
 * This file tells Convex which JWT issuers to trust for authentication.
 * Without this file, ctx.auth.getUserIdentity() always returns null,
 * causing every authenticated query/mutation to fail silently
 * ("Authentication required" in server logs, skeleton loading in the
 * admin dashboard — no client-side error).
 *
 * IMPORTANT: Convex does NOT support process.env in this file, so the
 * Clerk issuer domain has to be hardcoded. **The committed default is
 * the PRODUCTION domain (`clerk.supplementdb.info`)** so that any
 * deploy — via `npm run deploy:convex:prod` or a plain `npx convex
 * deploy` — lands correctly.
 *
 * Why the committed default is PROD (2026-04-18):
 *   The previous setup defaulted to DEV and relied on a swap-deploy-revert
 *   script to push the prod domain. That race-prone flow silently shipped
 *   the dev domain to prod at least once, breaking every authenticated
 *   query. Defaulting to PROD is fail-safe; local dev against the Clerk
 *   dev instance is now an ad-hoc personal edit (not committed).
 *
 * Local development against the Clerk dev instance:
 *   Swap CLERK_DOMAIN to "https://usable-tarpon-30.clerk.accounts.dev" in
 *   your working copy, run `npx convex dev`, DO NOT commit the change.
 *
 * One-time Clerk dashboard setup (already configured on prod):
 *   1. JWT Templates → New template → name it exactly "convex"
 *      (Clerk has a built-in Convex template — select it)
 *   2. Webhooks → Add Endpoint → https://<your-convex-url>/clerk-webhook
 *      Events: user.created, user.updated, user.deleted
 */

const CLERK_DOMAIN = "https://clerk.supplementdb.info";

export default {
  providers: [
    {
      domain: CLERK_DOMAIN,
      applicationID: "convex",
    },
  ],
};
