#!/usr/bin/env node
/**
 * Upload premium guide content chunks to Convex.
 * Reads JSON files from data/premium-chunks/ and upserts each into the
 * premiumGuideContent table via the Convex HTTP API.
 *
 * Uses the Convex HTTP API at {CONVEX_URL}/api/mutation with deploy key auth,
 * which allows calling internal mutations directly without re-deploying.
 *
 * Required env vars:
 *   CONVEX_URL        — Convex deployment URL (e.g., https://robust-frog-754.convex.cloud)
 *   CONVEX_DEPLOY_KEY — Convex deploy key for admin/internal function access
 *
 * Usage: node scripts/upload-premium-content.js
 */

const fs = require('fs');
const path = require('path');
const { ConvexHttpClient } = require('convex/browser');

const CHUNKS_DIR = path.join(__dirname, '..', 'data', 'premium-chunks');
const SIZE_WARN_KB = 900;
const SIZE_ERROR_KB = 1024;

// Retry on transient gateway errors only. Convex sits behind Cloudflare and
// can return 502/503/504 during brief origin hiccups. Do NOT retry 404 —
// it means the endpoint or function name is wrong (deterministic). Do NOT
// retry 401/403 — auth problems are deterministic too.
const RETRY_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 4;
const INITIAL_BACKOFF_MS = 750;
const INTER_REQUEST_DELAY_MS = 300;

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function uploadChunk(client, chunk, sizeKb) {
    const args = {
        guideSlug: chunk.slug,
        htmlContent: chunk.htmlContent,
        version: chunk.version || new Date().toISOString().slice(0, 10),
        generatedAt: chunk.generatedAt || new Date().toISOString(),
    };

    let lastErr = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Calls Convex `/api/mutation` with header
            // `Authorization: Convex <token>` (the same format the Convex CLI
            // uses for admin-authenticated calls — verified against the SDK
            // source at convex/dist/esm/browser/http_client.js line 212).
            //
            // The token MUST match /^(dev|prod):NAME\|BASE64.../ to be
            // accepted as an admin key. If you get `MalformedAccessToken`,
            // the token in CONVEX_DEPLOY_KEY is the wrong type — regenerate
            // a "Production Deploy Key" from the Convex dashboard.
            return await client.mutation('premiumGuideContent:adminUpsertContent', args);
        } catch (err) {
            const msg = String(err && err.message || err);
            const isTransient = /\b(408|425|429|500|502|503|504)\b/.test(msg)
                || /network|timeout|fetch failed|ECONN/i.test(msg);
            lastErr = err;
            if (isTransient && attempt < MAX_RETRIES) {
                const wait = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
                console.warn(`  ⟳ ${chunk.slug}: ${msg.split('\n')[0].slice(0, 120)} — retrying in ${wait}ms (${attempt + 1}/${MAX_RETRIES})`);
                await sleep(wait);
                continue;
            }
            throw err;
        }
    }
    throw lastErr;
}

async function main() {
    const convexUrl = process.env.CONVEX_URL;
    const deployKey = process.env.CONVEX_DEPLOY_KEY;

    if (!convexUrl) {
        console.error('ERROR: CONVEX_URL environment variable is required.');
        console.error('  Example: export CONVEX_URL=https://robust-frog-754.convex.cloud');
        process.exit(1);
    }
    if (!deployKey) {
        console.error('ERROR: CONVEX_DEPLOY_KEY environment variable is required.');
        console.error('  Obtain from: https://dashboard.convex.dev → Settings → Deploy Keys');
        process.exit(1);
    }

    if (!fs.existsSync(CHUNKS_DIR)) {
        console.error(`ERROR: Premium chunks directory not found: ${CHUNKS_DIR}`);
        console.error('Run "node scripts/generate-guide-pages.js" first to generate content chunks.');
        process.exit(1);
    }

    const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.error('ERROR: No JSON files found in premium chunks directory.');
        console.error(`Directory checked: ${CHUNKS_DIR}`);
        process.exit(1);
    }

    // Validate the token shape upfront — saves 18 round-trips if the user
    // pasted a project token, an OAuth token, or a CLI access token instead
    // of a deployment admin key.
    if (!/^(dev|prod):.*\|/.test(deployKey)) {
        const prefix = deployKey.split(/[:|\s]/)[0] + (deployKey.includes(':') ? ':' : '');
        console.error('ERROR: CONVEX_DEPLOY_KEY does not look like a deployment admin key.');
        console.error(`  Got prefix: "${prefix}..." (length ${deployKey.length})`);
        console.error('  Expected format: "prod:DEPLOYMENT-NAME|BASE64..." or "dev:..."');
        console.error('  Generate one at: https://dashboard.convex.dev → your deployment → Settings → Deploy Keys → Generate Production Deploy Key');
        process.exit(1);
    }

    console.log(`Convex URL: ${convexUrl}`);
    console.log(`Found ${files.length} premium content chunks to upload.\n`);

    const client = new ConvexHttpClient(convexUrl);
    client.setAdminAuth(deployKey);

    let uploaded = 0;
    let warned = 0;
    let skipped = 0;

    for (const file of files) {
        const filePath = path.join(CHUNKS_DIR, file);
        const raw = fs.readFileSync(filePath, 'utf8');

        let chunk;
        try {
            chunk = JSON.parse(raw);
        } catch (e) {
            console.error(`✗ ${file}: Invalid JSON — skipping (${e.message})`);
            skipped++;
            continue;
        }

        if (!chunk.slug || !chunk.htmlContent) {
            const missing = [!chunk.slug && 'slug', !chunk.htmlContent && 'htmlContent'].filter(Boolean).join(', ');
            console.error(`✗ ${file}: Missing required fields (${missing}) — skipping`);
            skipped++;
            continue;
        }

        const sizeKb = Buffer.byteLength(chunk.htmlContent, 'utf8') / 1024;

        if (sizeKb > SIZE_ERROR_KB) {
            console.error(`✗ ${file}: ${sizeKb.toFixed(1)}KB exceeds 1MB Convex document limit — skipping`);
            skipped++;
            continue;
        }

        if (sizeKb > SIZE_WARN_KB) {
            console.warn(`⚠ ${file}: ${sizeKb.toFixed(1)}KB approaching 1MB Convex document limit`);
            warned++;
        }

        try {
            await uploadChunk(client, chunk, sizeKb);
            console.log(`✓ ${chunk.slug} (${sizeKb.toFixed(1)}KB)`);
            uploaded++;
        } catch (e) {
            console.error(`✗ ${chunk.slug}: Upload failed — ${e.message}`);
            skipped++;
        }
        // Pace successive uploads so we never fire 18+ mutations into the
        // same Convex edge second; that pattern triggered a 502 storm in
        // a previous run.
        await sleep(INTER_REQUEST_DELAY_MS);
    }

    console.log(`\n--- Summary ---`);
    console.log(`Uploaded:      ${uploaded}`);
    if (warned > 0) console.log(`Warned (>900KB): ${warned}`);
    if (skipped > 0) console.log(`Skipped/Failed: ${skipped}`);
    console.log(`Total:         ${files.length}`);

    if (skipped > 0) {
        console.error('\nOne or more chunks failed to upload. Review errors above.');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
