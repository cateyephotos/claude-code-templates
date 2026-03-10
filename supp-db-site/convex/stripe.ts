import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import Stripe from "stripe";

/**
 * Stripe server-side actions for SupplementDB.
 *
 * Actions can call external APIs (Stripe, Clerk) and use npm packages.
 * All Stripe secrets are stored in Convex environment variables.
 *
 * Required Convex env vars:
 *   STRIPE_SECRET_KEY — Stripe API secret key
 *   STRIPE_MONTHLY_PRICE_ID — Price ID for monthly plan
 *   STRIPE_ANNUAL_PRICE_ID — Price ID for annual plan
 *   CLERK_SECRET_KEY — Clerk secret key for Backend API calls
 *   SITE_URL — Base URL for success/cancel redirects (default: http://localhost:8080)
 */

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set. Configure it in the Convex dashboard.");
  }
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" });
}

function getSiteUrl(): string {
  return process.env.SITE_URL || "http://localhost:8080";
}

/**
 * Create a Stripe Checkout Session for a subscription plan.
 * Redirects the user to Stripe's hosted checkout page.
 */
export const createCheckoutSession = action({
  args: {
    plan: v.union(v.literal("monthly"), v.literal("annual")),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required. Please sign in first.");
    }

    const clerkId = identity.subject;

    // Get user from Convex DB
    const user = await ctx.runQuery(api.users.getByClerkId, { clerkId });
    if (!user) {
      throw new Error("User not found. Please try signing in again.");
    }

    // Check if user already has an active subscription
    const existingSub = await ctx.runQuery(api.subscriptions.getMySubscription);
    if (existingSub && existingSub.status === "active") {
      throw new Error("You already have an active subscription. Use the customer portal to manage it.");
    }

    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    // Select price ID based on plan
    const priceId = args.plan === "annual"
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      throw new Error(`STRIPE_${args.plan.toUpperCase()}_PRICE_ID environment variable is not set.`);
    }

    // Look up or create Stripe customer
    let customerId: string | undefined;
    if (existingSub?.stripeCustomerId) {
      customerId = existingSub.stripeCustomerId;
    } else {
      // Search for existing Stripe customer by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Build checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing.html?cancelled=true`,
      client_reference_id: clerkId,
      metadata: {
        userId: clerkId,
        plan: args.plan,
      },
      subscription_data: {
        metadata: {
          userId: clerkId,
          plan: args.plan,
        },
      },
      allow_promotion_codes: true,
    };

    // Use existing customer or provide email for new customer creation
    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      throw new Error("Failed to create checkout session. Please try again.");
    }

    return { url: session.url };
  },
});

/**
 * Create a Stripe Customer Portal session for subscription management.
 * Allows subscribers to update payment method, change plan, or cancel.
 */
export const createPortalSession = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required.");
    }

    const clerkId = identity.subject;

    // Get subscription to find Stripe customer ID
    const sub = await ctx.runQuery(api.subscriptions.getMySubscription);
    if (!sub?.stripeCustomerId) {
      throw new Error("No subscription found. Please subscribe first.");
    }

    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${siteUrl}/pricing.html`,
    });

    return { url: session.url };
  },
});

/**
 * Sync a user's role to Clerk's publicMetadata.
 * Called internally after Stripe webhook processes a subscription change.
 *
 * This solves the race condition where:
 *   1. Stripe webhook updates Convex DB (subscription status)
 *   2. But the client reads role from Clerk publicMetadata
 *   3. Without this sync, the client won't know the role changed
 */
export const syncRoleToClerk = internalAction({
  args: {
    clerkId: v.string(),
    role: v.union(v.literal("admin"), v.literal("subscriber"), v.literal("free")),
  },
  handler: async (_ctx, args): Promise<void> => {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      console.error("CLERK_SECRET_KEY not set — cannot sync role to Clerk");
      return;
    }

    try {
      const response = await fetch(
        `https://api.clerk.com/v1/users/${args.clerkId}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${clerkSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_metadata: { role: args.role },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Failed to sync role to Clerk for user ${args.clerkId}: ${response.status} ${errorText}`
        );
        return;
      }

      console.log(
        `Successfully synced role "${args.role}" to Clerk for user ${args.clerkId}`
      );
    } catch (error) {
      console.error(`Error syncing role to Clerk for user ${args.clerkId}:`, error);
    }
  },
});
