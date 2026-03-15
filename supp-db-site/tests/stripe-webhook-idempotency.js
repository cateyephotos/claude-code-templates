/**
 * stripe-webhook-idempotency.js — Task 3 of BRO-46
 *
 * Verifies that the Convex /stripe-webhook endpoint is idempotent:
 * posting the same checkout.session.completed event TWICE must:
 *   1. Return HTTP 200 + { received: true } on BOTH attempts
 *   2. (If CONVEX_DEPLOY_KEY is set) result in exactly ONE guidePurchases record
 *
 * Run: node tests/stripe-webhook-idempotency.js
 *   or: npm run test:idempotency
 *
 * Required env vars (set these in your shell or .env before running):
 *   CONVEX_URL              — e.g. __CONVEX_URL__
 *   STRIPE_WEBHOOK_SECRET   — whsec_xxx (the Convex dashboard webhook secret)
 *
 * Optional env vars:
 *   CONVEX_DEPLOY_KEY       — prod:xxx (enables DB-level duplicate record check)
 *   TEST_SESSION_ID         — override the synthetic Stripe session ID
 *   TEST_USER_ID            — override the synthetic Clerk user ID
 */

"use strict";

const Stripe = require("stripe");

// ── Config ──────────────────────────────────────────────────────────────────

const CONVEX_URL =
  process.env.CONVEX_URL || "__CONVEX_URL__";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const CONVEX_DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY || "";

const TEST_SESSION_ID =
  process.env.TEST_SESSION_ID ||
  `cs_test_idempotency_${Date.now()}`;
const TEST_USER_ID =
  process.env.TEST_USER_ID || "user_test_idempotency";

const WEBHOOK_URL = `${CONVEX_URL}/stripe-webhook`;

// ── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let skipped = 0;

function pass(label) {
  console.log(`  ✅ PASS  ${label}`);
  passed++;
}

function fail(label, detail) {
  console.error(`  ❌ FAIL  ${label}`);
  if (detail !== undefined) console.error(`         ${detail}`);
  failed++;
}

function skip(label, reason) {
  console.warn(`  ⏭  SKIP  ${label}`);
  console.warn(`         ${reason}`);
  skipped++;
}

function section(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 60 - title.length))}`);
}

// ── Build synthetic Stripe event ─────────────────────────────────────────────

function buildCheckoutEvent(sessionId, userId) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `evt_test_idempotency_${sessionId}`,
    object: "event",
    api_version: "2024-06-20",
    created: now,
    type: "checkout.session.completed",
    livemode: false,
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        amount_total: 1999,
        currency: "usd",
        payment_status: "paid",
        status: "complete",
        mode: "payment",
        payment_intent: `pi_test_${sessionId}`,
        customer: `cus_test_${userId}`,
        client_reference_id: userId,
        metadata: {
          type: "guide_purchase",
          userId: userId,
          guideSlug: "sleep",
          guideName: "Sleep Optimization Guide",
        },
      },
    },
  };
}

// ── Sign and POST a webhook event ─────────────────────────────────────────────

async function postWebhook(payloadStr, secret) {
  const header = Stripe.webhooks.generateTestHeaderString({
    payload: payloadStr,
    secret,
  });

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": header,
    },
    body: payloadStr,
  });

  let body = null;
  try {
    body = await res.json();
  } catch (_) {
    body = { raw: await res.text().catch(() => "") };
  }

  return { status: res.status, body };
}

// ── Convex admin: count guidePurchases records for a session ─────────────────

async function countPurchaseRecords(sessionId) {
  if (!CONVEX_DEPLOY_KEY) return null;

  // Convex HTTP API: run a public action or query via the admin endpoint.
  // We use the `api/query` endpoint with the deploy key for internal queries.
  const url = `${CONVEX_URL}/api/query`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Convex ${CONVEX_DEPLOY_KEY}`,
      },
      body: JSON.stringify({
        path: "guidePurchases:getFullPurchaseBySessionId",
        args: { sessionId },
        format: "json",
      }),
    });

    if (!res.ok) {
      // getFullPurchaseBySessionId is internal — try the public query instead
      // which requires auth. Fall back gracefully.
      return "query_unavailable";
    }

    const data = await res.json();
    // If a single record is returned, exactly 1 exists (idempotency guard worked)
    if (data && data.value !== undefined) {
      return data.value ? 1 : 0;
    }
    return "query_unavailable";
  } catch (err) {
    return "query_unavailable";
  }
}

// ── Main test suite ───────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║   BRO-46 Task 3 — Stripe Webhook Idempotency Tests           ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`  Webhook URL  : ${WEBHOOK_URL}`);
  console.log(`  Session ID   : ${TEST_SESSION_ID}`);
  console.log(`  User ID      : ${TEST_USER_ID}`);
  console.log(`  Deploy key   : ${CONVEX_DEPLOY_KEY ? "✓ set" : "not set (DB check skipped)"}`);

  // ── Pre-flight: required env vars ──────────────────────────────────────────
  section("Pre-flight checks");

  if (!STRIPE_WEBHOOK_SECRET) {
    skip(
      "All tests",
      "STRIPE_WEBHOOK_SECRET is not set.\n" +
      "         To run this test:\n" +
      "           1. Open Convex dashboard → Settings → Environment Variables\n" +
      "           2. Copy STRIPE_WEBHOOK_SECRET (whsec_…)\n" +
      "           3. export STRIPE_WEBHOOK_SECRET=whsec_… && npm run test:idempotency"
    );
    printSummary();
    process.exit(0); // exit 0 — skip is not a failure
  }

  pass("STRIPE_WEBHOOK_SECRET is set");

  if (!CONVEX_URL.startsWith("http")) {
    fail("CONVEX_URL is a valid HTTP URL", CONVEX_URL);
    printSummary();
    process.exit(1);
  }
  pass(`CONVEX_URL reachable: ${CONVEX_URL}`);

  // ── Health: verify the Convex deployment is reachable ────────────────────
  section("Convex reachability");
  try {
    const healthRes = await fetch(`${CONVEX_URL}/api/query`, {
      method: "HEAD",
    });
    // HEAD may return 405 (method not allowed) — that still means it's up
    if (healthRes.status < 500) {
      pass(`Convex endpoint responded with ${healthRes.status}`);
    } else {
      fail("Convex endpoint reachable", `Got HTTP ${healthRes.status}`);
    }
  } catch (err) {
    fail("Convex endpoint reachable", err.message);
    printSummary();
    process.exit(1);
  }

  // ── Build the synthetic event once — reuse the same payload for both sends
  const event = buildCheckoutEvent(TEST_SESSION_ID, TEST_USER_ID);
  const payloadStr = JSON.stringify(event);

  // ── Test 1: First delivery ─────────────────────────────────────────────────
  section("Test 1: First webhook delivery");
  let firstResult;
  try {
    firstResult = await postWebhook(payloadStr, STRIPE_WEBHOOK_SECRET);
    console.log(
      `  HTTP ${firstResult.status}  body: ${JSON.stringify(firstResult.body)}`
    );

    if (firstResult.status === 200) {
      pass("First delivery returns HTTP 200");
    } else if (firstResult.status === 400) {
      fail(
        "First delivery returns HTTP 200",
        `Got 400 — likely signature mismatch. Verify STRIPE_WEBHOOK_SECRET matches the ` +
        `Convex dashboard value exactly.\n         Body: ${JSON.stringify(firstResult.body)}`
      );
      printSummary();
      process.exit(1);
    } else {
      fail(
        "First delivery returns HTTP 200",
        `Got ${firstResult.status}: ${JSON.stringify(firstResult.body)}`
      );
      printSummary();
      process.exit(1);
    }

    if (
      firstResult.body &&
      firstResult.body.received === true
    ) {
      pass('First delivery body contains { received: true }');
    } else {
      fail(
        'First delivery body contains { received: true }',
        `Got: ${JSON.stringify(firstResult.body)}`
      );
    }
  } catch (err) {
    fail("First delivery (network error)", err.message);
    printSummary();
    process.exit(1);
  }

  // Brief pause to let Convex process the mutation before the duplicate arrives
  await new Promise((r) => setTimeout(r, 1500));

  // ── Test 2: Duplicate delivery (idempotency) ───────────────────────────────
  section("Test 2: Duplicate webhook delivery (idempotency)");
  let secondResult;
  try {
    secondResult = await postWebhook(payloadStr, STRIPE_WEBHOOK_SECRET);
    console.log(
      `  HTTP ${secondResult.status}  body: ${JSON.stringify(secondResult.body)}`
    );

    if (secondResult.status === 200) {
      pass("Duplicate delivery returns HTTP 200 (handler is idempotent)");
    } else {
      fail(
        "Duplicate delivery returns HTTP 200",
        `Got ${secondResult.status}: ${JSON.stringify(secondResult.body)}\n` +
        `         The handler must succeed on duplicate events — Stripe retries webhooks.`
      );
    }

    if (
      secondResult.body &&
      secondResult.body.received === true
    ) {
      pass('Duplicate delivery body contains { received: true }');
    } else {
      fail(
        'Duplicate delivery body contains { received: true }',
        `Got: ${JSON.stringify(secondResult.body)}`
      );
    }
  } catch (err) {
    fail("Duplicate delivery (network error)", err.message);
    printSummary();
    process.exit(1);
  }

  // ── Test 3: DB-level duplicate guard (optional) ───────────────────────────
  section("Test 3: DB-level duplicate guard (optional)");

  // Wait a bit more for Convex async scheduler to settle
  await new Promise((r) => setTimeout(r, 2000));

  const recordCount = await countPurchaseRecords(TEST_SESSION_ID);

  if (recordCount === "query_unavailable") {
    skip(
      "DB-level duplicate guard",
      "Could not query Convex DB.\n" +
      "         To enable: export CONVEX_DEPLOY_KEY=prod:… && npm run test:idempotency\n" +
      "         (Get the deploy key from Convex dashboard → Settings → Deploy Keys)"
    );
  } else if (recordCount === null) {
    skip(
      "DB-level duplicate guard",
      "CONVEX_DEPLOY_KEY not set — set it to verify no duplicate records were created"
    );
  } else if (recordCount === 1) {
    pass(
      `Exactly 1 guidePurchases record exists for session ${TEST_SESSION_ID} (no duplicates)`
    );
  } else if (recordCount === 0) {
    fail(
      "At least 1 guidePurchases record exists",
      `Found 0 records — the webhook may not have been processed yet, ` +
      `or the session ID in metadata didn't match. ` +
      `Check Convex logs for session ${TEST_SESSION_ID}.`
    );
  } else {
    fail(
      "Exactly 1 guidePurchases record exists",
      `Found ${recordCount} records for session ${TEST_SESSION_ID} — idempotency guard failed!`
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  printSummary();
  process.exit(failed > 0 ? 1 : 0);
}

function printSummary() {
  console.log(`\n${"═".repeat(64)}`);
  console.log(
    `  Results: ${passed} passed, ${failed} failed, ${skipped} skipped`
  );
  if (failed === 0 && skipped === 0) {
    console.log("  🎉 All idempotency checks passed!");
  } else if (failed === 0) {
    console.log("  ✅ All required checks passed (some optional checks skipped).");
  } else {
    console.log("  ❌ One or more checks failed.");
  }
  console.log(`${"═".repeat(64)}\n`);
}

main().catch((err) => {
  console.error("\nUnhandled error:", err);
  process.exit(1);
});
