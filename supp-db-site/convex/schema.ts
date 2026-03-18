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

  // Stack Analyzer — credit tracking and analysis history
  analysisCredits: defineTable({
    userId: v.string(),
    tier: v.union(v.literal("free"), v.literal("subscriber")),
    monthlyLimit: v.number(),
    usedThisMonth: v.number(),
    periodStart: v.number(), // Start of current billing month (epoch ms)
    periodEnd: v.number(), // End of current billing month (epoch ms)
    lastAnalysisAt: v.optional(v.number()),
    totalAnalyses: v.number(), // Lifetime count
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_tier", ["tier"]),

  // Stack Analyzer — analysis results history
  stackAnalyses: defineTable({
    userId: v.string(),
    supplements: v.array(v.object({
      id: v.number(),
      name: v.string(),
    })),
    healthGoal: v.optional(v.string()),           // legacy — kept for existing docs
    healthGoals: v.optional(v.array(v.string())), // new — [goalId] or [goalId1, goalId2]
    analysisDepth: v.union(v.literal("quick"), v.literal("standard"), v.literal("deep")),
    result: v.any(), // Full Claude response (structured JSON)
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costUsd: v.number(), // Estimated cost in USD
    timestamp: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_healthGoal", ["healthGoal"]),

  // One-time guide PDF purchases
  guidePurchases: defineTable({
    userId: v.string(),                // Clerk user ID
    guideSlug: v.string(),             // e.g. "sleep", "creatine"
    guideName: v.string(),             // Display name, e.g. "Sleep Optimization Guide"
    stripeSessionId: v.string(),       // Stripe Checkout Session ID (cs_...)
    stripePaymentIntentId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    amountTotal: v.number(),           // Amount paid in cents
    currency: v.string(),              // e.g. "usd"
    status: v.union(
      v.literal("pending"),            // Awaiting Stripe confirmation
      v.literal("paid"),               // Payment confirmed, PDF not yet generated
      v.literal("pdf_generating"),     // PDF being generated
      v.literal("pdf_ready"),          // PDF stored and ready for download
      v.literal("failed")             // PDF generation failed
    ),
    pdfStorageId: v.optional(v.string()),  // Convex storage ID for the generated PDF
    emailSentAt: v.optional(v.number()),   // When download email was sent
    errorMessage: v.optional(v.string()),  // If status is "failed"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_stripeSessionId", ["stripeSessionId"])
    .index("by_guideSlug", ["guideSlug"])
    .index("by_status", ["status"])
    .index("by_user_guide", ["userId", "guideSlug"]),

  // Newsletter subscribers with double opt-in
  newsletterSubscribers: defineTable({
    email: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("unsubscribed")
    ),
    source: v.string(),
    confirmToken: v.string(),
    tokenExpiresAt: v.number(),
    confirmedAt: v.optional(v.number()),
    unsubscribedAt: v.optional(v.number()),
    unsubscribeToken: v.string(),
    clerkUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_confirmToken", ["confirmToken"])
    .index("by_unsubscribeToken", ["unsubscribeToken"])
    .index("by_status", ["status"])
    .index("by_source", ["source"]),

  // Admin-configurable settings (API keys etc.) — encrypted at rest in Convex DB
  // Raw values never returned to browser; admin UI shows masked values only.
  adminSettings: defineTable({
    key: v.string(),       // e.g. "ANTHROPIC_API_KEY"
    value: v.string(),     // raw secret value (encrypted at rest)
    updatedAt: v.number(),
    updatedBy: v.string(), // Clerk user ID of admin who set it
  }).index("by_key", ["key"]),

  // Stack Analyzer — email send log for rate limiting
  emailLog: defineTable({
    userId: v.string(),
    recipientEmail: v.string(),
    sentAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  // ── Email Sequence System ──────────────────────────────────

  // Email sequences (campaigns)
  emailSequences: defineTable({
    name: v.string(),
    description: v.string(),
    trigger: v.object({
      type: v.union(v.literal("event"), v.literal("manual"), v.literal("both")),
      event: v.optional(v.string()),
    }),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused")),
    sendTime: v.object({
      hour: v.number(),
      minute: v.number(),
      timezone: v.string(),
    }),
    excludeDays: v.array(v.string()),
    maxDeferHours: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Email steps within a sequence
  emailSteps: defineTable({
    sequenceId: v.id("emailSequences"),
    stepIndex: v.number(),
    subject: v.string(),
    preheader: v.string(),
    bodyBlocks: v.array(v.object({
      type: v.union(v.literal("text"), v.literal("cta"), v.literal("divider")),
      content: v.optional(v.string()),
      label: v.optional(v.string()),
      url: v.optional(v.string()),
    })),
    delayDays: v.number(),
    status: v.union(v.literal("active"), v.literal("disabled")),
  })
    .index("by_sequence", ["sequenceId", "stepIndex"]),

  // Subscribers enrolled in email sequences
  emailSubscribers: defineTable({
    email: v.string(),
    newsletterSubscriberId: v.optional(v.id("newsletterSubscribers")),
    sequenceId: v.id("emailSequences"),
    currentStepIndex: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("unsubscribed"),
      v.literal("paused")
    ),
    enrolledAt: v.number(),
    nextSendAt: v.number(),
    deferredSince: v.optional(v.number()),
    source: v.string(),
  })
    .index("by_sequence", ["sequenceId"])
    .index("by_status_next_send", ["status", "nextSendAt"])
    .index("by_email_sequence", ["email", "sequenceId"])
    .index("by_email", ["email"]),

  // Email delivery/engagement events from Resend webhooks
  emailEvents: defineTable({
    subscriberId: v.id("emailSubscribers"),
    stepId: v.id("emailSteps"),
    sequenceId: v.id("emailSequences"),
    resendMessageId: v.string(),
    type: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("opened"),
      v.literal("clicked"),
      v.literal("bounced"),
      v.literal("unsubscribed")
    ),
    metadata: v.optional(v.object({
      link: v.optional(v.string()),
    })),
    timestamp: v.number(),
  })
    .index("by_subscriber", ["subscriberId"])
    .index("by_step", ["stepId"])
    .index("by_sequence_type", ["sequenceId", "type"])
    .index("by_sequence_timestamp", ["sequenceId", "timestamp"])
    .index("by_resend_message_id", ["resendMessageId"]),

  // Site-wide configuration for dynamic email variables
  siteConfig: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
    updatedBy: v.string(),
  })
    .index("by_key", ["key"]),
});
