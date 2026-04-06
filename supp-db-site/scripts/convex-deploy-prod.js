#!/usr/bin/env node
/**
 * convex-deploy-prod.js — Deploy Convex to production with the correct Clerk domain.
 *
 * Convex auth.config.js does NOT support process.env references, so we:
 *   1. Swap the dev Clerk domain → production domain
 *   2. Run `npx convex deploy` targeting the prod deployment
 *   3. Revert auth.config.js back to the dev domain
 *
 * Usage:
 *   node scripts/convex-deploy-prod.js
 *   # or via npm:
 *   npm run deploy:convex:prod
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const AUTH_CONFIG = path.join(__dirname, "..", "convex", "auth.config.js");
const DEV_DOMAIN = "https://usable-tarpon-30.clerk.accounts.dev";
const PROD_DOMAIN = "https://clerk.supplementdb.info";
const PROD_URL = "https://acoustic-chinchilla-759.convex.cloud";

function main() {
  console.log("[convex-deploy-prod] Reading auth.config.js...");
  const original = fs.readFileSync(AUTH_CONFIG, "utf8");

  if (!original.includes(DEV_DOMAIN)) {
    console.error(
      `[convex-deploy-prod] ERROR: Expected dev domain "${DEV_DOMAIN}" in auth.config.js.\n` +
      `File may already be set to production, or the domain has changed.\n` +
      `Aborting to avoid double-swap.`
    );
    process.exit(1);
  }

  const patched = original.replace(DEV_DOMAIN, PROD_DOMAIN);

  console.log(`[convex-deploy-prod] Swapping domain to production`);
  fs.writeFileSync(AUTH_CONFIG, patched, "utf8");

  let deployFailed = false;
  try {
    console.log(`[convex-deploy-prod] Deploying to production...`);
    // Use process.platform-aware command: Windows needs npx.cmd
    const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
    execFileSync(
      npxCmd,
      ["convex", "deploy", "--url", PROD_URL, "--typecheck=disable", "-y"],
      { stdio: "inherit", cwd: path.join(__dirname, "..") }
    );
    console.log("[convex-deploy-prod] Deploy succeeded.");
  } catch (err) {
    console.error("[convex-deploy-prod] Deploy FAILED:", err.message);
    deployFailed = true;
  } finally {
    console.log("[convex-deploy-prod] Reverting auth.config.js to dev domain");
    fs.writeFileSync(AUTH_CONFIG, original, "utf8");
    console.log("[convex-deploy-prod] auth.config.js restored.");
  }

  if (deployFailed) {
    process.exit(1);
  }

  console.log("[convex-deploy-prod] Done. Production is live, local dev is unaffected.");
}

main();
