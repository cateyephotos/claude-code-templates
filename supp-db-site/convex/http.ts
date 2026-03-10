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
 *   URL: https://robust-frog-754.convex.cloud/clerk-webhook
 *   Events: user.created, user.updated, user.deleted
 *
 * For production, validate the Svix signature using the webhook secret.
 * Svix verification requires the svix npm package in a Convex action,
 * but for the initial setup we use a simplified approach.
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Get the Svix headers for signature verification
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    let body: any;
    try {
      body = await request.json();
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

          const role = data.public_metadata?.role || "free";
          const avatarUrl = data.image_url || data.profile_image_url;

          await ctx.runMutation(api.users.upsertUser, {
            clerkId: data.id,
            email,
            name,
            role,
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

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" });

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

export default http;
