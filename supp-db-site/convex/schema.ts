import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users synced from Clerk via webhook
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("subscriber"), v.literal("free")),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Page view analytics
  pageViews: defineTable({
    userId: v.optional(v.string()),
    sessionId: v.string(),
    pageType: v.union(
      v.literal("homepage"),
      v.literal("supplement"),
      v.literal("guide"),
      v.literal("comparison"),
      v.literal("category"),
      v.literal("legal"),
      v.literal("admin"),
      v.literal("other")
    ),
    pagePath: v.string(),
    pageTitle: v.optional(v.string()),
    supplementId: v.optional(v.string()),
    timestamp: v.number(),
    duration: v.optional(v.number()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_supplementId", ["supplementId"])
    .index("by_pageType", ["pageType"])
    .index("by_sessionId", ["sessionId"]),

  // Search event tracking
  searchEvents: defineTable({
    userId: v.optional(v.string()),
    sessionId: v.string(),
    query: v.string(),
    filters: v.optional(v.any()),
    resultCount: v.number(),
    clickedResult: v.optional(v.string()),
    clickedResultIndex: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_userId", ["userId"])
    .index("by_query", ["query"]),

  // User favorites (synced from localStorage on sign-in)
  favorites: defineTable({
    userId: v.string(),
    supplementId: v.string(),
    supplementName: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_supplement", ["supplementId"])
    .index("by_user_supplement", ["userId", "supplementId"]),

  // Subscription management
  subscriptions: defineTable({
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("monthly"), v.literal("annual")),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired"),
      v.literal("trialing"),
      v.literal("past_due")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),

  // Content gate impressions and interactions
  gateEvents: defineTable({
    userId: v.optional(v.string()),
    sessionId: v.string(),
    guideSlug: v.string(),
    eventType: v.union(
      v.literal("impression"),
      v.literal("cta_click"),
      v.literal("sign_up_started"),
      v.literal("sign_up_completed")
    ),
    scrollPercent: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_guideSlug", ["guideSlug"])
    .index("by_eventType", ["eventType"]),
});
