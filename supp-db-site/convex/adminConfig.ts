import { query } from "./_generated/server";

/**
 * adminConfig.ts — Admin configuration health check.
 *
 * Returns status for every Convex environment variable required by the system,
 * WITHOUT exposing the actual secret values (masked only).
 * Also returns live Stack Analyzer usage stats for monitoring.
 *
 * All queries are admin-only — enforced server-side via role check.
 */

// ── Helpers ────────────────────────────────────────────────────

/** Returns true if caller is an admin, throws otherwise */
async function requireAdmin(ctx: any): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }
}

/** Mask a secret value — shows first 4 + last 4 chars, rest as dots */
function maskValue(value: string | undefined): string {
  if (!value) return "";
  if (value.length <= 8) return "•".repeat(value.length);
  return value.slice(0, 4) + "•".repeat(Math.min(value.length - 8, 20)) + value.slice(-4);
}

// ── Env Var Config Catalogue ────────────────────────────────────

const CONFIG_CATALOGUE = [
  {
    serviceId: "anthropic",
    serviceName: "Stack Analyzer",
    serviceIcon: "fa-robot",
    serviceDescription: "Claude AI for supplement stack analysis",
    convexDashboardLink: "https://dashboard.convex.dev",
    vars: [
      {
        key: "ANTHROPIC_API_KEY",
        label: "Anthropic API Key",
        required: true,
        description: "Required for Stack Analyzer. Get from console.anthropic.com",
        docsUrl: "https://console.anthropic.com/settings/keys",
      },
    ],
  },
  {
    serviceId: "stripe",
    serviceName: "Payments",
    serviceIcon: "fa-credit-card",
    serviceDescription: "Stripe for subscriptions and guide purchases",
    vars: [
      {
        key: "STRIPE_SECRET_KEY",
        label: "Stripe Secret Key",
        required: true,
        description: "Stripe secret key (sk_live_... or sk_test_...)",
        docsUrl: "https://dashboard.stripe.com/apikeys",
      },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        label: "Webhook Signing Secret",
        required: true,
        description: "Stripe webhook endpoint signing secret (whsec_...)",
        docsUrl: "https://dashboard.stripe.com/webhooks",
      },
      {
        key: "STRIPE_MONTHLY_PRICE_ID",
        label: "Monthly Plan Price ID",
        required: true,
        description: "Stripe Price ID for the Pro Monthly plan (price_...)",
        docsUrl: "https://dashboard.stripe.com/products",
      },
      {
        key: "STRIPE_ANNUAL_PRICE_ID",
        label: "Annual Plan Price ID",
        required: true,
        description: "Stripe Price ID for the Pro Annual plan (price_...)",
        docsUrl: "https://dashboard.stripe.com/products",
      },
      {
        key: "STRIPE_GUIDE_PRICE_ID",
        label: "Guide Purchase Price ID",
        required: false,
        description: "Stripe Price ID for one-time guide purchases (optional)",
        docsUrl: "https://dashboard.stripe.com/products",
      },
    ],
  },
  {
    serviceId: "clerk",
    serviceName: "Authentication",
    serviceIcon: "fa-shield-alt",
    serviceDescription: "Clerk for user auth and subscription management",
    vars: [
      {
        key: "CLERK_SECRET_KEY",
        label: "Clerk Secret Key",
        required: true,
        description: "Clerk backend secret key (sk_live_... or sk_test_...)",
        docsUrl: "https://dashboard.clerk.com/last-active?path=api-keys",
      },
    ],
  },
  {
    serviceId: "resend",
    serviceName: "Email",
    serviceIcon: "fa-envelope",
    serviceDescription: "Resend for transactional emails and newsletter",
    vars: [
      {
        key: "RESEND_API_KEY",
        label: "Resend API Key",
        required: true,
        description: "Resend API key for sending emails (re_...)",
        docsUrl: "https://resend.com/api-keys",
      },
      {
        key: "RESEND_FROM_ADDRESS",
        label: "From Email Address",
        required: false,
        description: 'Sender address (default: "SupplementDB <onboarding@resend.dev>")',
        defaultValue: "SupplementDB <onboarding@resend.dev>",
        docsUrl: "https://resend.com/domains",
      },
    ],
  },
  {
    serviceId: "posthog",
    serviceName: "Analytics",
    serviceIcon: "fa-chart-bar",
    serviceDescription: "PostHog for server-side event tracking",
    vars: [
      {
        key: "POSTHOG_API_KEY",
        label: "PostHog API Key",
        required: false,
        description: "PostHog project API key (phc_...)",
        docsUrl: "https://app.posthog.com/settings/project",
      },
      {
        key: "POSTHOG_PROJECT_ID",
        label: "PostHog Project ID",
        required: false,
        description: "Numeric PostHog project ID (for server-side queries)",
        docsUrl: "https://app.posthog.com/settings/project",
      },
      {
        key: "POSTHOG_HOST",
        label: "PostHog Host",
        required: false,
        description: "PostHog ingest host URL",
        defaultValue: "https://us.i.posthog.com",
        docsUrl: "https://posthog.com/docs/self-host",
      },
    ],
  },
  {
    serviceId: "pdf",
    serviceName: "PDF Generator",
    serviceIcon: "fa-file-pdf",
    serviceDescription: "External PDF rendering service for guide downloads",
    vars: [
      {
        key: "PDF_GENERATOR_URL",
        label: "PDF Service URL",
        required: false,
        description: "Base URL of the PDF generation microservice",
        docsUrl: "",
      },
      {
        key: "PDF_GENERATOR_SECRET",
        label: "PDF Service Secret",
        required: false,
        description: "Shared secret for authenticating with the PDF service",
        docsUrl: "",
      },
      {
        key: "SITE_URL",
        label: "Site URL",
        required: false,
        description: "Public base URL of this deployment",
        defaultValue: "http://localhost:8080",
        docsUrl: "",
      },
    ],
  },
] as const;

// ── Query: Service Configuration Health ─────────────────────────

export const getConfigHealth = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const services = CONFIG_CATALOGUE.map((service) => {
      const vars = service.vars.map((v) => {
        const rawValue = process.env[v.key];
        const isSet = typeof rawValue === "string" && rawValue.length > 0;
        return {
          key: v.key,
          label: v.label,
          required: v.required,
          description: v.description,
          defaultValue: "defaultValue" in v ? v.defaultValue : undefined,
          docsUrl: v.docsUrl,
          isSet,
          masked: maskValue(rawValue),
        };
      });

      const requiredMissing = vars.filter((v) => v.required && !v.isSet).length;
      const optionalMissing = vars.filter((v) => !v.required && !v.isSet).length;

      let status: "ok" | "degraded" | "error";
      if (requiredMissing > 0) {
        status = "error";
      } else if (optionalMissing > 0) {
        status = "degraded";
      } else {
        status = "ok";
      }

      return {
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        serviceIcon: service.serviceIcon,
        serviceDescription: service.serviceDescription,
        vars,
        requiredMissing,
        optionalMissing,
        status,
      };
    });

    const totalRequired = services.reduce((sum, s) => sum + s.vars.filter((v) => v.required).length, 0);
    const totalRequiredMissing = services.reduce((sum, s) => sum + s.requiredMissing, 0);
    const totalOptional = services.reduce((sum, s) => sum + s.vars.filter((v) => !v.required).length, 0);
    const totalOptionalMissing = services.reduce((sum, s) => sum + s.optionalMissing, 0);

    const overallStatus: "ok" | "degraded" | "error" =
      totalRequiredMissing > 0 ? "error" : totalOptionalMissing > 0 ? "degraded" : "ok";

    return {
      services,
      summary: {
        totalRequired,
        totalRequiredMissing,
        totalOptional,
        totalOptionalMissing,
        overallStatus,
      },
    };
  },
});

// ── Query: Stack Analyzer Usage Stats ───────────────────────────

export const getStackAnalyzerStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Check DB setting first, then env var
    const dbApiKey = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q: any) => q.eq("key", "ANTHROPIC_API_KEY"))
      .unique();
    const apiKeyConfigured = (dbApiKey && dbApiKey.value.length > 0) ||
      (typeof process.env.ANTHROPIC_API_KEY === "string" && process.env.ANTHROPIC_API_KEY.length > 0);

    // All analyses
    const allAnalyses = await ctx.db.query("stackAnalyses").collect();

    // Current billing period (calendar month UTC)
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).getTime();

    const thisMonthAnalyses = allAnalyses.filter((a) => a.timestamp >= monthStart);

    const totalCostAllTime = allAnalyses.reduce((sum, a) => sum + (a.costUsd ?? 0), 0);
    const totalCostThisMonth = thisMonthAnalyses.reduce((sum, a) => sum + (a.costUsd ?? 0), 0);
    const totalInputTokens = allAnalyses.reduce((sum, a) => sum + (a.inputTokens ?? 0), 0);
    const totalOutputTokens = allAnalyses.reduce((sum, a) => sum + (a.outputTokens ?? 0), 0);
    const thisMonthInputTokens = thisMonthAnalyses.reduce((sum, a) => sum + (a.inputTokens ?? 0), 0);
    const thisMonthOutputTokens = thisMonthAnalyses.reduce((sum, a) => sum + (a.outputTokens ?? 0), 0);

    // Weighted API Tokens (WAT) — input × 1 + output × 5 (matches Haiku relative pricing)
    // 1M WAT = $1.00 API cost (input-parity basis). This is the single profitability metric.
    const thisMonthWAT = thisMonthInputTokens + (thisMonthOutputTokens * 5);
    const allTimeWAT = totalInputTokens + (totalOutputTokens * 5);
    const avgWatThisMonth = thisMonthAnalyses.length > 0
      ? Math.round(thisMonthWAT / thisMonthAnalyses.length)
      : 0;
    const avgWatAllTime = allAnalyses.length > 0
      ? Math.round(allTimeWAT / allAnalyses.length)
      : 0;

    const uniqueUsersAllTime = new Set(allAnalyses.map((a) => a.userId)).size;
    const uniqueUsersThisMonth = new Set(thisMonthAnalyses.map((a) => a.userId)).size;

    // Depth breakdown (this month)
    const depthCountsThisMonth: Record<string, number> = { quick: 0, standard: 0, deep: 0 };
    thisMonthAnalyses.forEach((a) => {
      const d = a.analysisDepth as string;
      depthCountsThisMonth[d] = (depthCountsThisMonth[d] ?? 0) + 1;
    });

    // Model being used (most recent)
    const recentModel = allAnalyses.length > 0
      ? allAnalyses.sort((a, b) => b.timestamp - a.timestamp)[0].model
      : "claude-haiku-4-5-20251001";

    // Credit records: users who have used the feature
    const allCredits = await ctx.db.query("analysisCredits").collect();
    const freeUsers = allCredits.filter((c) => c.tier === "free").length;
    const subscriberUsers = allCredits.filter((c) => c.tier === "subscriber").length;

    return {
      apiKeyConfigured,
      allTime: {
        analyses: allAnalyses.length,
        costUsd: totalCostAllTime,
        weightedTokens: allTimeWAT,
        avgWatPerAnalysis: avgWatAllTime,
        uniqueUsers: uniqueUsersAllTime,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      },
      thisMonth: {
        analyses: thisMonthAnalyses.length,
        costUsd: totalCostThisMonth,
        weightedTokens: thisMonthWAT,
        avgWatPerAnalysis: avgWatThisMonth,
        uniqueUsers: uniqueUsersThisMonth,
        inputTokens: thisMonthInputTokens,
        outputTokens: thisMonthOutputTokens,
      },
      depthBreakdown: depthCountsThisMonth,
      model: recentModel,
      creditUsers: { free: freeUsers, subscriber: subscriberUsers },
    };
  },
});
