import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Stripe from "stripe";

const http = httpRouter();

/**
 * Clerk webhook endpoint.
 * Receives user.created, user.updated, user.deleted events from Clerk.
 *
 * Setup: In Clerk Dashboard → Webhooks → Add Endpoint:
 *   URL: <your-convex-site-url>/clerk-webhook
 *   Events: user.created, user.updated, user.deleted
 *
 * Requires CLERK_WEBHOOK_SECRET environment variable (the Svix signing secret
 * from the Clerk Dashboard webhook endpoint settings).
 * Verifies HMAC-SHA256 signature to prevent unauthorized requests.
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Require webhook secret
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    // 2. Get the Svix headers for signature verification
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    // 3. Read raw body for signature verification
    const rawBody = await request.text();

    // 4. Verify timestamp is within tolerance (5 minutes)
    const timestampSec = parseInt(svixTimestamp, 10);
    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - timestampSec) > 300) {
      return new Response("Webhook timestamp too old", { status: 400 });
    }

    // 5. Verify HMAC signature (Svix uses base64-encoded HMAC-SHA256)
    // The signing content is: "{svix-id}.{svix-timestamp}.{body}"
    const signContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    // Svix secret is base64-encoded with "whsec_" prefix
    const secretBytes = atob(webhookSecret.replace("whsec_", ""));
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretBytes),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signContent));
    const expectedSig = btoa(String.fromCharCode(...Array.from(new Uint8Array(signatureBytes))));

    // Svix sends multiple signatures separated by spaces in "v1,{sig}" format
    const providedSigs = svixSignature.split(" ").map((s: string) => s.replace("v1,", ""));
    const isValid = providedSigs.some((sig: string) => sig === expectedSig);

    if (!isValid) {
      console.error("Clerk webhook signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }

    // 6. Parse the verified body
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const eventType = body.type as string;
    const data = body.data;

    if (!eventType || !data) {
      return new Response("Missing event type or data", { status: 400 });
    }

    try {
      switch (eventType) {
        case "user.created":
        case "user.updated": {
          const email =
            data.email_addresses?.find(
              (e: any) => e.id === data.primary_email_address_id
            )?.email_address || data.email_addresses?.[0]?.email_address || "";

          const name = [data.first_name, data.last_name]
            .filter(Boolean)
            .join(" ") || email.split("@")[0] || "User";

          const avatarUrl = data.image_url || data.profile_image_url;

          await ctx.runMutation(api.users.upsertUser, {
            clerkId: data.id,
            email,
            name,
            avatarUrl,
          });

          break;
        }

        case "user.deleted": {
          // Soft delete — we don't remove user data, just mark the event.
          // The user record stays for analytics integrity.
          // In production, you might want to anonymize PII here.
          console.log(`User deleted: ${data.id}`);
          break;
        }

        default:
          console.log(`Unhandled Clerk webhook event: ${eventType}`);
      }
    } catch (error) {
      console.error(`Error processing Clerk webhook: ${eventType}`, error);
      return new Response("Internal error processing webhook", {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

/**
 * Stripe webhook endpoint.
 * Handles subscription lifecycle events from Stripe with signature verification.
 *
 * Setup: In Stripe Dashboard → Webhooks → Add Endpoint:
 *   URL: https://robust-frog-754.convex.cloud/stripe-webhook
 *   Events: checkout.session.completed, customer.subscription.updated,
 *           customer.subscription.deleted, invoice.payment_failed
 *
 * Required Convex env vars:
 *   STRIPE_SECRET_KEY — Stripe API secret key
 *   STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret (whsec_...)
 *
 * After subscription changes, this handler performs dual-path role sync:
 *   1. Updates Convex DB (subscription record + user role)
 *   2. Syncs role to Clerk publicMetadata via Backend API
 */
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSignature = request.headers.get("stripe-signature");
    if (!stripeSignature) {
      return new Response("Missing Stripe signature", { status: 400 });
    }

    // Read body as text for signature verification (NOT json)
    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return new Response("Failed to read request body", { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not set — cannot verify webhook signature");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not set");
      return new Response("Stripe not configured", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-02-24.acacia" });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
    } catch (err: any) {
      console.error(`Stripe signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, {
        status: 400,
      });
    }

    const eventType = event.type;
    const data = event.data.object as any;

    try {
      switch (eventType) {
        case "checkout.session.completed": {
          const clerkId = data.client_reference_id || data.metadata?.userId;
          if (!clerkId) {
            console.warn("checkout.session.completed: No userId found in client_reference_id or metadata");
            break;
          }

          // ── Guide purchase (one-time payment) ─────────────────
          if (data.metadata?.type === "guide_purchase") {
            const guideSlug = data.metadata?.guideSlug;
            const guideName = data.metadata?.guideName || guideSlug;
            const accessType = (data.metadata?.accessType === "web" ? "web" : "pdf") as "web" | "pdf";

            if (!guideSlug) {
              console.error("checkout.session.completed: guide_purchase missing guideSlug in metadata");
              break;
            }

            // 1. Record the purchase in Convex DB (idempotent)
            const purchaseId = await ctx.runMutation(
              internal.guidePurchases.recordGuidePurchase,
              {
                userId: clerkId,
                guideSlug,
                guideName,
                stripeSessionId: data.id,
                stripePaymentIntentId: data.payment_intent ?? undefined,
                stripeCustomerId: data.customer ?? undefined,
                amountTotal: data.amount_total ?? 0,
                currency: data.currency ?? "usd",
                accessType,
              }
            );

            // 2. Only generate PDF for PDF purchases (web purchases skip this)
            if (accessType !== "web") {
              await ctx.scheduler.runAfter(
                0,
                internal.pdfGenerator.generateAndStorePdf,
                {
                  purchaseId,
                  guideSlug,
                  guideName,
                  userId: clerkId,
                  sessionId: data.id,
                }
              );
            }

            console.log(
              `✅ checkout.session.completed (guide/${accessType}): ${clerkId} → ${guideSlug} (purchase: ${purchaseId})`
            );
            break;
          }

          // ── Subscription purchase (recurring) ─────────────────────
          const plan = data.metadata?.plan === "annual" ? "annual" : "monthly";

          // 1. Upsert subscription in Convex DB
          await ctx.runMutation(api.subscriptions.upsertSubscription, {
            userId: clerkId,
            plan: plan as "monthly" | "annual",
            status: "active",
            stripeCustomerId: data.customer,
            stripeSubscriptionId: data.subscription,
          });

          // 2. Update user role in Convex DB
          await ctx.runMutation(internal.users.updateRoleInternal, {
            clerkId,
            newRole: "subscriber",
          });

          // 3. Sync role to Clerk publicMetadata (async, non-blocking)
          await ctx.scheduler.runAfter(0, internal.stripe.syncRoleToClerk, {
            clerkId,
            role: "subscriber",
          });

          console.log(`✅ checkout.session.completed: ${clerkId} → subscriber (${plan})`);
          break;
        }

        case "customer.subscription.updated": {
          const sub = data;
          const clerkId = sub.metadata?.userId;
          if (!clerkId) {
            console.warn("customer.subscription.updated: No userId in subscription metadata");
            break;
          }

          // Map Stripe status to our status
          let status: "active" | "cancelled" | "expired" | "trialing" | "past_due" = "active";
          if (sub.status === "canceled") status = "cancelled";
          else if (sub.status === "past_due") status = "past_due";
          else if (sub.status === "trialing") status = "trialing";
          else if (sub.status === "active") status = "active";

          // Determine plan from price interval
          const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
          const plan: "monthly" | "annual" = interval === "year" ? "annual" : "monthly";

          // 1. Upsert subscription in Convex DB
          await ctx.runMutation(api.subscriptions.upsertSubscription, {
            userId: clerkId,
            plan,
            status,
            stripeCustomerId: sub.customer,
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items?.data?.[0]?.price?.id,
            currentPeriodStart: sub.current_period_start
              ? sub.current_period_start * 1000
              : undefined,
            currentPeriodEnd: sub.current_period_end
              ? sub.current_period_end * 1000
              : undefined,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          });

          // 2. Update user role based on subscription status
          const newRole = (status === "active" || status === "trialing") ? "subscriber" : "free";
          await ctx.runMutation(internal.users.updateRoleInternal, {
            clerkId,
            newRole,
          });

          // 3. Sync role to Clerk
          await ctx.scheduler.runAfter(0, internal.stripe.syncRoleToClerk, {
            clerkId,
            role: newRole,
          });

          console.log(`✅ customer.subscription.updated: ${clerkId} → ${newRole} (${status})`);
          break;
        }

        case "customer.subscription.deleted": {
          const clerkId = data.metadata?.userId;
          if (!clerkId) {
            console.warn("customer.subscription.deleted: No userId in subscription metadata");
            break;
          }

          // 1. Mark subscription as cancelled
          await ctx.runMutation(api.subscriptions.upsertSubscription, {
            userId: clerkId,
            plan: "free",
            status: "cancelled",
            stripeCustomerId: data.customer,
            stripeSubscriptionId: data.id,
          });

          // 2. Downgrade user role
          await ctx.runMutation(internal.users.updateRoleInternal, {
            clerkId,
            newRole: "free",
          });

          // 3. Sync downgrade to Clerk
          await ctx.scheduler.runAfter(0, internal.stripe.syncRoleToClerk, {
            clerkId,
            role: "free",
          });

          console.log(`✅ customer.subscription.deleted: ${clerkId} → free`);
          break;
        }

        case "invoice.payment_failed": {
          const clerkId =
            data.subscription_details?.metadata?.userId ||
            data.metadata?.userId;
          if (!clerkId) {
            console.warn("invoice.payment_failed: No userId in metadata");
            break;
          }

          // Mark subscription as past_due
          await ctx.runMutation(api.subscriptions.upsertSubscription, {
            userId: clerkId,
            plan: "monthly",
            status: "past_due",
            stripeCustomerId: data.customer,
          });

          console.log(`⚠️ invoice.payment_failed: ${clerkId} → past_due`);
          break;
        }

        default:
          console.log(`Unhandled Stripe webhook event: ${eventType}`);
      }
    } catch (error) {
      console.error(`Error processing Stripe webhook: ${eventType}`, error);
      return new Response("Internal error processing webhook", {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

/**
 * Health check endpoint.
 */
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "ok", timestamp: Date.now() }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

/**
 * Bootstrap admin endpoint — one-time use to promote a user to admin.
 *
 * This endpoint bypasses Clerk auth intentionally: it's the escape hatch
 * for initial setup before the Clerk JWT template is configured.
 *
 * Required Convex env var: ADMIN_BOOTSTRAP_SECRET (any strong random string)
 * Set it in: Convex Dashboard → Settings → Environment Variables
 *
 * Usage (after setting the env var):
 *   curl -X POST https://<your-convex-url>/admin-bootstrap \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"you@example.com","secret":"your-bootstrap-secret"}'
 *
 * Or from the browser console on any page:
 *   fetch('https://robust-frog-754.convex.site/admin-bootstrap', {
 *     method: 'POST',
 *     headers: {'Content-Type':'application/json'},
 *     body: JSON.stringify({email:'you@example.com', secret:'your-secret'})
 *   }).then(r=>r.json()).then(console.log)
 *
 * NOTE: Use .convex.site (not .convex.cloud) — HTTP actions are served at the .site domain.
 *
 * Security: Disable by removing ADMIN_BOOTSTRAP_SECRET env var after use.
 */
http.route({
  path: "/admin-bootstrap",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    // Read and validate body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { email, secret, clerkId } = body;

    if (!secret) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing 'secret' field" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!email && !clerkId) {
      return new Response(
        JSON.stringify({ success: false, error: "Provide 'email' or 'clerkId'" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate bootstrap secret
    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if (!bootstrapSecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ADMIN_BOOTSTRAP_SECRET env var not set. Add it in Convex Dashboard → Settings → Environment Variables.",
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    if (secret !== bootstrapSecret) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid bootstrap secret" }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Promote user to admin
    try {
      const result = await ctx.runMutation(internal.users.bootstrapAdminRole, {
        email: email || null,
        clerkId: clerkId || null,
      });

      return new Response(JSON.stringify({ success: true, ...result }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  }),
});

// ── Resend Webhook ───────────────────────────────────────────

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Validate webhook signature using Svix
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RESEND_WEBHOOK_SECRET not configured");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing webhook signature headers", { status: 400 });
    }

    // Read raw body for signature verification
    const rawBody = await request.text();

    // Verify timestamp is within tolerance (5 minutes)
    const timestampSec = parseInt(svixTimestamp, 10);
    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - timestampSec) > 300) {
      return new Response("Webhook timestamp too old", { status: 400 });
    }

    // Verify HMAC signature (Svix uses base64-encoded HMAC-SHA256)
    // The signing content is: "{svix-id}.{svix-timestamp}.{body}"
    const signContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    // Svix secret is base64-encoded with "whsec_" prefix
    const secretBytes = atob(webhookSecret.replace("whsec_", ""));
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretBytes),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signContent));
    const expectedSig = btoa(String.fromCharCode(...Array.from(new Uint8Array(signatureBytes))));

    // Svix sends multiple signatures separated by spaces; check if any match
    const providedSigs = svixSignature.split(" ").map((s: string) => s.replace("v1,", ""));
    const isValid = providedSigs.some((sig: string) => sig === expectedSig);

    if (!isValid) {
      console.error("Resend webhook signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // 2. Parse event
    const eventType = body.type as string;
    const messageId = body.data?.email_id as string;

    if (!eventType || !messageId) {
      return new Response("Missing event type or message ID", { status: 400 });
    }

    // Map Resend event types to our event types
    const typeMap: Record<string, string> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.opened": "opened",
      "email.clicked": "clicked",
      "email.bounced": "bounced",
      "email.unsubscribed": "unsubscribed",
      "email.complained": "unsubscribed",  // complaints also treated as unsubscribe
    };

    const mappedType = typeMap[eventType];
    if (!mappedType) {
      // Unknown event type — acknowledge but ignore
      return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 });
    }

    // 3. Look up the original "sent" event by resendMessageId
    await ctx.runMutation(internal.emailCron.processWebhookEvent, {
      resendMessageId: messageId,
      eventType: mappedType,
      link: body.data?.click?.link || undefined,
      timestamp: Date.now(),
    });

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

/**
 * Evidence digest webhook.
 *
 * Receives the weekly PubMed evidence monitor output (produced by
 * `scripts/pubmed-evidence-monitor.js`, shipped to `data/evidence-updates-latest.json`)
 * and triggers a fan-out send to every confirmed newsletter subscriber.
 *
 * Intended caller: the `.github/workflows/evidence-monitor.yml` cron, which
 * POSTs the JSON snapshot after its main scan step.
 *
 * Security:
 *   - Requires `EVIDENCE_DIGEST_WEBHOOK_SECRET` env var in Convex.
 *   - Caller must send `Authorization: Bearer <secret>`.
 *   - Requests without a valid secret are rejected with 401 before any
 *     database access or scheduler work.
 *
 * Gate:
 *   - Even with a valid secret, the orchestrator checks the
 *     `EVIDENCE_DIGEST_ENABLED` adminSetting row. If not explicitly set to
 *     "true", the endpoint accepts the POST and responds with
 *     `{ scheduled: 0, reason: "…" }` so CI logs show the skip clearly.
 *
 * Request body (application/json):
 *   {
 *     "reportDate": "YYYY-MM-DD",
 *     "payload": { meta, entries }   // shape of evidence-updates-latest.json
 *   }
 */
http.route({
  path: "/evidence-digest-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const expectedSecret = process.env.EVIDENCE_DIGEST_WEBHOOK_SECRET;
    if (!expectedSecret) {
      console.error("EVIDENCE_DIGEST_WEBHOOK_SECRET not configured");
      return new Response("Webhook not configured", { status: 500 });
    }

    const authHeader = request.headers.get("authorization") || "";
    const prefix = "Bearer ";
    const presented = authHeader.startsWith(prefix) ? authHeader.slice(prefix.length) : "";

    // Length-aware equality (not fully constant-time in JS, but avoids
    // length-based leaks and short-circuit comparison on the common path).
    if (presented.length !== expectedSecret.length || presented !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return new Response("Invalid JSON", { status: 400 });
    }
    if (!body || typeof body !== "object" || !body.payload || !body.reportDate) {
      return new Response(
        JSON.stringify({ error: "Expected { reportDate, payload }" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const result = await ctx.runAction(
        internal.evidenceDigest.sendDigestToSubscribers,
        { payload: body.payload, reportDate: body.reportDate }
      );
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("[evidence-digest-webhook] send failed:", err);
      return new Response(
        JSON.stringify({ error: String(err && err.message ? err.message : err) }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
