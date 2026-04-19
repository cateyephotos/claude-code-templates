#!/usr/bin/env node
/**
 * convex-deploy-prod.js — Deploy Convex to production with the correct Clerk domain.
 *
 * Background
 * ──────────
 * Convex `auth.config.js` does not support `process.env` references, so the
 * Clerk issuer domain has to be hardcoded in the file at deploy time.
 * Committed default is the PRODUCTION domain (https://clerk.supplementdb.info)
 * so that a plain `npx convex deploy` lands correctly and the admin
 * dashboard's authenticated queries keep working even if someone forgets
 * this script.
 *
 * Local dev against the Clerk dev instance requires an ad-hoc swap of
 * `CLERK_DOMAIN` to `https://usable-tarpon-30.clerk.accounts.dev` — a
 * personal/branch-local change, not committed.
 *
 * Why the committed default flipped (2026-04-18)
 * ──────────────────────────────────────────────
 * Before: file defaulted to DEV, this script swapped DEV→PROD, deployed,
 * reverted to DEV. If ANY deploy failed to swap (e.g. race between the
 * child-process file-read and our revert in `finally`, an unrelated deploy
 * path like `npx convex deploy` run directly, or a crash between swap and
 * deploy) the PROD deployment would silently ship with the DEV domain in
 * auth.config.js — breaking every authenticated query with
 * "Authentication required. Please sign in."
 *
 * That failure mode is invisible: client Clerk says signed-in, server logs
 * show Auth-required errors, dashboard shows skeleton loading. Caught in
 * prod 2026-04-18 after an apparent swap-deploy-revert cycle still left
 * prod on the dev domain.
 *
 * Post-flip behavior: default-PROD means `npx convex deploy` is safe by
 * default; this wrapper script still exists so `npm run deploy:convex:prod`
 * keeps working and documents the prod URL.
 *
 * Usage:
 *   npm run deploy:convex:prod
 *   # or directly:
 *   node scripts/convex-deploy-prod.js
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const AUTH_CONFIG = path.join(__dirname, "..", "convex", "auth.config.js");
const DEV_DOMAIN = "https://usable-tarpon-30.clerk.accounts.dev";
const PROD_DOMAIN = "https://clerk.supplementdb.info";
const PROD_URL = "https://acoustic-chinchilla-759.convex.cloud";

function main() {
  console.log("[convex-deploy-prod] Reading auth.config.js...");
  const original = fs.readFileSync(AUTH_CONFIG, "utf8");

  const hasProd = original.includes(PROD_DOMAIN);
  const hasDev = original.includes(DEV_DOMAIN);

  let needsSwap = false;
  if (hasProd && !hasDev) {
    console.log(`[convex-deploy-prod] auth.config.js already set to production — no swap needed`);
  } else if (hasDev) {
    console.log(`[convex-deploy-prod] auth.config.js currently on dev domain — swapping to production for this deploy`);
    fs.writeFileSync(AUTH_CONFIG, original.replace(DEV_DOMAIN, PROD_DOMAIN), "utf8");
    needsSwap = true;
  } else {
    console.error(
      `[convex-deploy-prod] ERROR: auth.config.js has neither the dev nor the prod Clerk domain.\n` +
      `  Expected one of:\n    ${DEV_DOMAIN}\n    ${PROD_DOMAIN}\n` +
      `  Aborting to avoid deploying an unknown issuer to production.`
    );
    process.exit(1);
  }

  let deployFailed = false;
  try {
    console.log(`[convex-deploy-prod] Deploying to production: ${PROD_URL}`);
    const result = spawnSync(
      "npx",
      ["convex", "deploy", "--url", PROD_URL, "--typecheck=disable", "-y"],
      { stdio: "inherit", cwd: path.join(__dirname, ".."), shell: true }
    );
    if (result.status !== 0) {
      throw new Error(`npx convex deploy exited with code ${result.status}`);
    }
    console.log("[convex-deploy-prod] Deploy succeeded.");
  } catch (err) {
    console.error("[convex-deploy-prod] Deploy FAILED:", err.message);
    deployFailed = true;
  } finally {
    if (needsSwap) {
      // Only revert when we actually swapped — avoid accidentally clobbering
      // a clean prod-default file back to the dev domain.
      console.log("[convex-deploy-prod] Reverting in-flight swap (local file only)");
      fs.writeFileSync(AUTH_CONFIG, original, "utf8");
      console.log("[convex-deploy-prod] auth.config.js restored.");
    }
  }

  if (deployFailed) {
    process.exit(1);
  }

  console.log("[convex-deploy-prod] Done. Production is live.");
}

main();
