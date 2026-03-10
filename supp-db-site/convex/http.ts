import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

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
 * Stripe webhook endpoint (placeholder for future implementation).
 * Will handle subscription lifecycle events from Stripe.
 *
 * Events to handle:
 *   checkout.session.completed — new subscription
 *   customer.subscription.updated — plan change, renewal
 *   customer.subscription.deleted — cancellation
 *   invoice.payment_succeeded — successful payment
 *   invoice.payment_failed — failed payment
 */
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripeSignature = request.headers.get("stripe-signature");
    if (!stripeSignature) {
      return new Response("Missing Stripe signature", { status: 400 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    const eventType = body.type as string;
    const data = body.data?.object;

    if (!eventType || !data) {
      return new Response("Missing event type or data", { status: 400 });
    }

    try {
      switch (eventType) {
        case "checkout.session.completed": {
          const userId = data.client_reference_id || data.metadata?.userId;
          if (!userId) break;

          await ctx.runMutation(api.subscriptions.upsertSubscription, {
            userId,
            plan: data.metadata?.plan === "annual" ? "annual" : "monthly",
            status: "active",
            stripeCustomerId: data.customer,
            stripeSubscriptionId: data.subscription,
          });
          break;
        }

        case "customer.subscription.updated": {
          const sub = data;
          const customerId = sub.customer;

          // Find the user by Stripe customer ID
          const existingSub = await ctx.runQuery(
            api.subscriptions.listSubscriptions,
            { limit: 1 }
          );

          // Map Stripe status to our status
          let status: "active" | "cancelled" | "expired" | "trialing" | "past_due" = "active";
          if (sub.status === "canceled") status = "cancelled";
          else if (sub.status === "past_due") status = "past_due";
          else if (sub.status === "trialing") status = "trialing";

          // Determine plan from price interval
          const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
          const plan: "monthly" | "annual" = interval === "year" ? "annual" : "monthly";

          if (sub.metadata?.userId) {
            await ctx.runMutation(api.subscriptions.upsertSubscription, {
              userId: sub.metadata.userId,
              plan,
              status,
              stripeCustomerId: customerId,
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
          }
          break;
        }

        case "customer.subscription.deleted": {
          if (data.metadata?.userId) {
            await ctx.runMutation(api.subscriptions.upsertSubscription, {
              userId: data.metadata.userId,
              plan: "free",
              status: "cancelled",
              stripeCustomerId: data.customer,
              stripeSubscriptionId: data.id,
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          if (data.subscription_details?.metadata?.userId) {
            await ctx.runMutation(api.subscriptions.upsertSubscription, {
              userId: data.subscription_details.metadata.userId,
              plan: "monthly",
              status: "past_due",
              stripeCustomerId: data.customer,
            });
          }
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
