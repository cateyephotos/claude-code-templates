#!/usr/bin/env node
/**
 * vercel-build.js — Vercel Build-Time Environment Variable Injection
 *
 * Replaces placeholder tokens in all HTML files with actual environment
 * variable values, mirroring what docker-entrypoint.sh does at runtime.
 *
 * Placeholders replaced:
 *   __CLERK_PUBLISHABLE_KEY__  → process.env.CLERK_PUBLISHABLE_KEY
 *   __CONVEX_URL__             → process.env.CONVEX_URL
 *   __POSTHOG_KEY__            → process.env.POSTHOG_KEY
 *   __POSTHOG_HOST__           → process.env.POSTHOG_HOST
 *   __SITE_URL__               → process.env.SITE_URL
 *
 * Usage: node scripts/vercel-build.js
 * Set environment variables in Vercel Dashboard → Settings → Environment Variables
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

// Map of placeholder → environment variable name
const REPLACEMENTS = {
  "__CLERK_PUBLISHABLE_KEY__": (process.env.CLERK_PUBLISHABLE_KEY || "").trim(),
  "__CONVEX_URL__": (process.env.CONVEX_URL || "").trim(),
  "__POSTHOG_KEY__": (process.env.POSTHOG_KEY || "").trim(),
  "__POSTHOG_HOST__": (process.env.POSTHOG_HOST || "").trim(),
  "__SITE_URL__": (process.env.SITE_URL || "").trim(),
};

// Directories to skip
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".vercel",
  "tests",
  "scripts",
  "healing-engine",
  "sprint-journal",
]);

function findHtmlFiles(dir) {
  const files = [];
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".html") && !entry.name.startsWith("google")) {
        files.push(fullPath);
      }
    }
  }
  walk(dir);
  return files;
}

function main() {
  console.log("🔧 Vercel Build — Environment Variable Injection");
  console.log("   Root:", ROOT_DIR);

  // Log which variables are set (redacted)
  for (const [placeholder, value] of Object.entries(REPLACEMENTS)) {
    const status = value ? `set (${value.substring(0, 8)}...)` : "NOT SET";
    console.log(`   ${placeholder} → ${status}`);
  }

  const htmlFiles = findHtmlFiles(ROOT_DIR);
  console.log(`\n   Found ${htmlFiles.length} HTML files to process.\n`);

  let modified = 0;
  let skipped = 0;

  for (const filePath of htmlFiles) {
    let html = fs.readFileSync(filePath, "utf-8");
    let changed = false;

    for (const [placeholder, value] of Object.entries(REPLACEMENTS)) {
      if (html.includes(placeholder)) {
        html = html.split(placeholder).join(value);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, html, "utf-8");
      modified++;
      console.log(`   ✅ ${path.relative(ROOT_DIR, filePath)}`);
    } else {
      skipped++;
    }
  }

  console.log(`\n   Modified: ${modified} | Skipped: ${skipped}`);
  console.log("   Done.\n");
}

main();

// Anti-scraping build pipeline
console.log("\n🛡️  Anti-Scraping Pipeline");
try {
  require("./obfuscate-data.js");
  require("./inject-honeypots.js");
  console.log("   Anti-scraping pipeline complete.\n");
} catch (err) {
  console.error("   Anti-scraping pipeline error:", err.message);
  // Non-fatal — site still works with unobfuscated data
}
