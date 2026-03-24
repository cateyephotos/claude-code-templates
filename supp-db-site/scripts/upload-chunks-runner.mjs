#!/usr/bin/env node
/**
 * Upload premium guide content chunks to Convex using the ConvexHttpClient.
 * ESM module — uses .mjs extension to avoid CJS/ESM conflicts.
 *
 * Usage: node scripts/upload-chunks-runner.mjs [--prod]
 *   --prod  Upload to production deployment (requires CONVEX_PROD_URL env var)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHUNKS_DIR = path.join(__dirname, '..', 'data', 'premium-chunks');

const isProd = process.argv.includes('--prod');
const CONVEX_URL = isProd
  ? (process.env.CONVEX_PROD_URL || 'https://acoustic-chinchilla-759.convex.cloud')
  : (process.env.CONVEX_URL || 'https://robust-frog-754.convex.cloud');

async function main() {
  console.log(`Target: ${isProd ? 'PRODUCTION' : 'DEV'} — ${CONVEX_URL}`);

  const client = new ConvexHttpClient(CONVEX_URL);
  const files = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} premium content chunks to upload.\n`);

  let ok = 0, fail = 0;

  for (const file of files) {
    const chunk = JSON.parse(fs.readFileSync(path.join(CHUNKS_DIR, file), 'utf8'));
    const sizeKb = (Buffer.byteLength(chunk.htmlContent, 'utf8') / 1024).toFixed(1);

    try {
      const adminUpsert = makeFunctionReference("premiumGuideContent:adminUpsertContent");
      await client.mutation(adminUpsert, {
        guideSlug: chunk.slug,
        htmlContent: chunk.htmlContent,
        version: chunk.version || new Date().toISOString().slice(0, 10),
        generatedAt: chunk.generatedAt || new Date().toISOString(),
      });
      console.log(`✓ ${chunk.slug} (${sizeKb}KB)`);
      ok++;
    } catch (e) {
      console.error(`✗ ${chunk.slug}: ${e.message?.slice(0, 300)}`);
      fail++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Uploaded: ${ok}`);
  if (fail) console.log(`Failed:   ${fail}`);
  console.log(`Total:    ${files.length}`);
  if (fail) process.exit(1);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
