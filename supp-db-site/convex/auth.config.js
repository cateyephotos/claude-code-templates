/**
 * auth.config.js — Convex authentication provider configuration.
 *
 * This file tells Convex which JWT issuers to trust for authentication.
 * Without this file, ctx.auth.getUserIdentity() always returns null,
 * causing every authenticated query/mutation to fail silently.
 *
 * IMPORTANT: Convex does NOT support process.env in this file.
 * The domain must be hardcoded. This file defaults to DEV so local
 * development works out of the box. For production deploys, use:
 *
 *   npm run deploy:convex:prod
 *
 * That script swaps in the production domain, deploys, then reverts.
 *
 * Domains:
 *   Dev:  https://usable-tarpon-30.clerk.accounts.dev
 *   Prod: https://clerk.supplementdb.info
 *
 * Also required (one-time Clerk Dashboard setup):
 *   1. JWT Templates → New template → name it exactly "convex"
 *      (Clerk has a built-in Convex template — select it)
 *   2. Webhooks → Add Endpoint → https://<your-convex-url>/clerk-webhook
 *      Events: user.created, user.updated, user.deleted
 */

// __CLERK_DOMAIN__ is replaced by deploy:convex:prod script
const CLERK_DOMAIN = "https://usable-tarpon-30.clerk.accounts.dev";

export default {
  providers: [
    {
      domain: CLERK_DOMAIN,
      applicationID: "convex",
    },
  ],
};
