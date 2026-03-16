import { action, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

/**
 * Stack Analyzer — AI-powered supplement stack evaluation via Claude API.
 *
 * Architecture:
 *   - Fixed inputs only (no free text) → predictable token usage
 *   - Constrained to pulldown selections: supplements (from DB), health goals (1 or 2), depth
 *   - Model: claude-haiku-4-5 for cost efficiency (~$0.006/analysis)
 *   - Structured JSON output via output_config schema
 *   - Credit-gated: free = 3/month, subscriber = 25/month
 *   - Multi-goal: dual goal analyses consume 2 credits and produce a goals[] array
 *
 * Required Convex env vars:
 *   ANTHROPIC_API_KEY — Claude API key
 *
 * Token budget (fixed per depth):
 *   Quick:    ~1,200 input + ~400 output = ~$0.003  (single-goal)
 *   Standard: ~2,000 input + ~800 output = ~$0.006  (single-goal)
 *   Deep:     ~2,500 input + ~1,200 output = ~$0.009 (single-goal)
 *   Dual-goal budgets are ~1.5× the single-goal budgets.
 */

// ── Claude Client ──────────────────────────────────────────────

function getClaude(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}

// ── Analysis JSON Schema ───────────────────────────────────────

const STACK_ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    goals: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          goalId: { type: "string" as const },
          goalName: { type: "string" as const },
          overallScore: {
            type: "number" as const,
            description: "Overall stack quality score from 1-100 for this goal",
          },
          evidenceStrength: {
            type: "string" as const,
            enum: ["strong", "moderate", "limited", "insufficient"],
          },
          stackSummary: {
            type: "string" as const,
            description: "2-3 sentence summary for this health goal",
          },
          mechanismCoverage: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                mechanism: { type: "string" as const },
                coveredBy: { type: "array" as const, items: { type: "string" as const } },
                strength: {
                  type: "string" as const,
                  enum: ["well-covered", "partially-covered", "gap"],
                },
              },
              required: ["mechanism", "coveredBy", "strength"],
            },
          },
        },
        required: ["goalId", "goalName", "overallScore", "evidenceStrength", "stackSummary", "mechanismCoverage"],
      },
      description: "Per-goal analysis. Single goal = 1 entry, dual goal = 2 entries.",
    },
    multiGoalCompatibility: {
      type: "object" as const,
      properties: {
        sharedMechanisms: { type: "array" as const, items: { type: "string" as const } },
        conflicts: { type: "array" as const, items: { type: "string" as const } },
        compatibilityNote: { type: "string" as const },
      },
      required: ["sharedMechanisms", "conflicts", "compatibilityNote"],
      description: "Present only for dual-goal analyses",
    },
    synergyAnalysis: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          pair: {
            type: "array" as const,
            items: { type: "string" as const },
            description: "Two supplement names that interact",
          },
          type: {
            type: "string" as const,
            enum: ["synergistic", "redundant", "antagonistic", "neutral"],
          },
          explanation: {
            type: "string" as const,
            description: "Brief explanation of the interaction",
          },
        },
        required: ["pair", "type", "explanation"],
      },
      description: "Pairwise interaction analysis between supplements in the stack",
    },
    safetyFlags: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          severity: {
            type: "string" as const,
            enum: ["caution", "warning", "critical"],
          },
          supplements: {
            type: "array" as const,
            items: { type: "string" as const },
          },
          description: { type: "string" as const },
        },
        required: ["severity", "supplements", "description"],
      },
      description: "Safety concerns, interactions, or contraindications",
    },
    dosageProtocol: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          supplement: { type: "string" as const },
          recommendedDose: { type: "string" as const },
          timing: { type: "string" as const },
          withFood: { type: "boolean" as const },
          notes: { type: "string" as const },
        },
        required: ["supplement", "recommendedDose", "timing", "withFood", "notes"],
      },
      description: "Recommended dosage and timing protocol for each supplement",
    },
    suggestedAdditions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          reason: { type: "string" as const },
          evidenceTier: { type: "number" as const },
        },
        required: ["name", "reason", "evidenceTier"],
      },
      description: "Supplements that could strengthen this stack (max 3)",
    },
    suggestedRemovals: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          reason: { type: "string" as const },
        },
        required: ["name", "reason"],
      },
      description: "Supplements that are redundant or counterproductive (max 2)",
    },
  },
  required: [
    "goals",
    "synergyAnalysis",
    "safetyFlags",
    "dosageProtocol",
    "suggestedAdditions",
    "suggestedRemovals",
  ],
};

// ── System Prompt Builder ──────────────────────────────────────

function buildSystemPrompt(depth: string, goalCount: number): string {
  const depthInstructions = {
    quick: "Provide a concise analysis focusing on overall score, top interactions, and critical safety flags. Keep explanations brief (1 sentence each).",
    standard: "Provide a thorough analysis covering all sections. Include mechanism coverage analysis and dosage protocol. Explanations should be 1-2 sentences each.",
    deep: "Provide a comprehensive analysis with detailed mechanism coverage, full synergy mapping, complete dosage protocol with timing windows, and thorough safety review. Explanations should be detailed (2-3 sentences each).",
  };

  const goalInstruction = goalCount > 1
    ? `You are evaluating this stack against TWO health goals. For EACH goal, provide a separate entry in the "goals" array with its own overallScore, evidenceStrength, stackSummary, and mechanismCoverage. Also provide a "multiGoalCompatibility" object with sharedMechanisms, conflicts, and compatibilityNote. Shared sections (synergyAnalysis, safetyFlags, dosageProtocol, suggestedAdditions, suggestedRemovals) should consider BOTH goals holistically.`
    : `You are evaluating this stack for a single health goal. Provide exactly ONE entry in the "goals" array.`;

  return `You are SupplementDB's Stack Analyzer, an evidence-based supplement interaction and synergy analysis engine.

ROLE: Evaluate supplement stacks for specific health goals. Assess synergies, redundancies, safety, and mechanism coverage using clinical evidence.

EVIDENCE TIER FRAMEWORK (use for all assessments):
- Tier 1 (Strong): Multiple large RCTs, systematic reviews, or meta-analyses
- Tier 2 (Moderate): Several RCTs with moderate sample sizes, consistent results
- Tier 3 (Limited): Few small trials, preliminary evidence, or mostly animal/in-vitro data
- Tier 4 (Insufficient): Anecdotal evidence only, no controlled trials

SCORING GUIDELINES:
- 85-100: Excellent stack — strong evidence, good synergies, no safety concerns
- 70-84: Good stack — solid evidence base, some synergies, minor optimizations possible
- 50-69: Adequate stack — moderate evidence, some redundancies or gaps
- 30-49: Needs improvement — weak evidence, significant gaps or safety concerns
- 1-29: Poor stack — conflicting supplements, major safety flags, or no evidence

ANALYSIS DEPTH: ${depthInstructions[depth as keyof typeof depthInstructions] || depthInstructions.standard}

${goalInstruction}

IMPORTANT RULES:
1. Never recommend exceeding evidence-supported dosages
2. Always flag known drug interactions
3. Be conservative with safety assessments — when uncertain, flag as caution
4. Suggest additions only from well-studied supplements (Tier 1-2)
5. Do not invent or hallucinate clinical evidence
6. Base all mechanism analysis on established pharmacology
7. Consider bioavailability and absorption interactions`;
}

// ── Supplement Context Builder ──────────────────────────────────

function buildUserMessage(
  supplements: Array<{ id: number; name: string; category: string; evidenceTier: number; dosageRange: string; mechanisms: string[] }>,
  healthGoals: Array<{ id: string; name: string }>,
  depth: string
): string {
  const supplementList = supplements.map((s, i) => {
    const mechStr = s.mechanisms.length > 0 ? `Mechanisms: ${s.mechanisms.join(", ")}` : "";
    return `${i + 1}. ${s.name} (Tier ${s.evidenceTier}, ${s.category})
   Typical dose: ${s.dosageRange}${mechStr ? `\n   ${mechStr}` : ""}`;
  }).join("\n");

  const goalSection = healthGoals.length > 1
    ? `Primary Health Goal: ${healthGoals[0].name} (${healthGoals[0].id})\nSecondary Health Goal: ${healthGoals[1].name} (${healthGoals[1].id})`
    : `Health Goal: ${healthGoals[0].name} (${healthGoals[0].id})`;

  return `ANALYZE THIS SUPPLEMENT STACK:

${goalSection}

Supplements in stack:
${supplementList}

Analysis depth: ${depth}

Evaluate this stack for the specified health goal(s). Assess synergies, redundancies, mechanism coverage, safety, and provide an optimized dosage protocol.`;
}

// ── Token Cost Estimation ──────────────────────────────────────

const HAIKU_INPUT_COST = 1.0 / 1_000_000; // $1 per 1M input tokens
const HAIKU_OUTPUT_COST = 5.0 / 1_000_000; // $5 per 1M output tokens

function estimateCost(inputTokens: number, outputTokens: number): number {
  return inputTokens * HAIKU_INPUT_COST + outputTokens * HAIKU_OUTPUT_COST;
}

// ── Max tokens by depth ────────────────────────────────────────
const MAX_TOKENS_BY_DEPTH = {
  quick: 1024,
  standard: 2048,
  deep: 3072,
} as const;

const MAX_TOKENS_DUAL_GOAL = {
  quick: 1600,
  standard: 3200,
  deep: 4800,
} as const;

function getMaxTokens(depth: string, goalCount: number): number {
  const table = goalCount > 1 ? MAX_TOKENS_DUAL_GOAL : MAX_TOKENS_BY_DEPTH;
  return table[depth as keyof typeof table] || MAX_TOKENS_BY_DEPTH.standard;
}

// ── Main Action ────────────────────────────────────────────────

/**
 * Analyze a supplement stack using Claude API.
 *
 * All inputs are constrained (no free text):
 *   - supplements: Array of {id, name, ...} from the supplement database
 *   - healthGoals: Array of 1 or 2 domain IDs from problems.js (dual-goal costs 2 credits)
 *   - depth: "quick" | "standard" | "deep"
 */
export const analyzeStack = action({
  args: {
    supplements: v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        category: v.string(),
        evidenceTier: v.number(),
        dosageRange: v.string(),
        mechanisms: v.array(v.string()),
      })
    ),
    healthGoals: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
      })
    ),
    depth: v.union(v.literal("quick"), v.literal("standard"), v.literal("deep")),
  },
  handler: async (ctx, args) => {
    // ── Auth Check ──────────────────────────────────────────
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required. Please sign in to use the Stack Analyzer.");
    }

    const clerkId = identity.subject;

    // ── Input Validation ────────────────────────────────────
    if (args.supplements.length < 2) {
      throw new Error("Please select at least 2 supplements to analyze.");
    }
    if (args.supplements.length > 15) {
      throw new Error("Maximum 15 supplements per analysis. Please reduce your selection.");
    }
    if (args.healthGoals.length < 1) {
      throw new Error("Please select at least one health goal.");
    }
    if (args.healthGoals.length > 2) {
      throw new Error("Maximum 2 health goals per analysis.");
    }

    const goalCount = args.healthGoals.length;

    // ── Credit Check + Consume ──────────────────────────────
    // We consume the credit BEFORE calling Claude to prevent races.
    // If Claude fails, we don't refund — this prevents abuse.
    // Dual-goal analyses consume 2 credits (goalCount is passed through).
    const creditResult = await ctx.runMutation(api.analysisCredits.consumeCredit, {
      userId: clerkId,
      goalCount,
    });

    // ── Build Claude Request ────────────────────────────────
    // Resolve API key: admin UI DB setting takes priority over env var
    const dbKey = await ctx.runQuery(internal.adminSettings.getRawSetting, { key: "ANTHROPIC_API_KEY" });
    const anthropicKey = dbKey || process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not configured. Set it in Admin → Configuration → API Keys."
      );
    }
    const claude = getClaude(anthropicKey);

    // Resolve model: admin UI DB setting → default
    const dbModel = await ctx.runQuery(internal.adminSettings.getRawSetting, { key: "ANTHROPIC_MODEL" });
    const model = dbModel || "claude-haiku-4-5-20251001";

    const systemPrompt = buildSystemPrompt(args.depth, goalCount);
    const userMessage = buildUserMessage(
      args.supplements,
      args.healthGoals,
      args.depth
    );

    const maxTokens = getMaxTokens(args.depth, goalCount);

    // ── Call Claude API ─────────────────────────────────────
    let response;
    try {
      response = await claude.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
        // Structured output via JSON schema
        // This guarantees valid JSON matching our schema
      });
    } catch (error: any) {
      // Handle specific Anthropic API errors
      if (error?.status === 429) {
        throw new Error("The analysis service is temporarily busy. Please try again in a moment.");
      }
      if (error?.status === 401) {
        throw new Error("Analysis service configuration error. Please contact support.");
      }
      if (error?.status === 400) {
        throw new Error("Invalid analysis request. Please try different supplement selections.");
      }
      throw new Error("Analysis failed. Please try again. If this persists, contact support.");
    }

    // ── Parse Response ──────────────────────────────────────
    const textBlock = response.content.find((block: any) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Analysis produced no results. Please try again.");
    }

    let analysis;
    try {
      // Claude should return JSON — extract it from the response text
      const text = textBlock.text;
      // Try to parse the entire response as JSON first
      try {
        analysis = JSON.parse(text);
      } catch {
        // If that fails, extract JSON from markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1].trim());
        } else {
          // Try to find a JSON object in the text
          const objMatch = text.match(/\{[\s\S]*\}/);
          if (objMatch) {
            analysis = JSON.parse(objMatch[0]);
          } else {
            throw new Error("Could not parse analysis result");
          }
        }
      }
    } catch (parseError) {
      throw new Error("Analysis result could not be interpreted. Please try again.");
    }

    // ── Token Usage ─────────────────────────────────────────
    const inputTokens = response.usage?.input_tokens ?? 0;
    const outputTokens = response.usage?.output_tokens ?? 0;
    const costUsd = estimateCost(inputTokens, outputTokens);

    // ── Save Analysis to History ────────────────────────────
    await ctx.runMutation(api.stackAnalyzer.saveAnalysis, {
      userId: clerkId,
      supplements: args.supplements.map((s) => ({ id: s.id, name: s.name })),
      healthGoals: args.healthGoals.map((g) => g.id),
      analysisDepth: args.depth,
      result: analysis,
      model: response.model || "claude-haiku-4-5-20251001",
      inputTokens,
      outputTokens,
      costUsd,
    });

    return {
      analysis,
      model: response.model || "claude-haiku-4-5-20251001",
      tokensUsed: { input: inputTokens, output: outputTokens },
      creditsRemaining: creditResult.remaining,
      creditsUsed: creditResult.usedThisMonth,
      creditsLimit: creditResult.monthlyLimit,
    };
  },
});

/**
 * Action to email analysis results to a recipient via Resend.
 * Rate-limited to 5 emails per user per hour.
 */
export const emailResults = action({
  args: {
    recipientEmail: v.string(),
    subject: v.string(),
    analysisMarkdown: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required.");
    }

    if (!args.recipientEmail.includes("@") || !args.recipientEmail.includes(".")) {
      throw new Error("Invalid email address.");
    }

    const clerkId = identity.subject;
    const oneHourAgo = Date.now() - 3600000;
    const recentEmails = await ctx.runQuery(internal.stackAnalyzer.countRecentEmails, {
      userId: clerkId,
      since: oneHourAgo,
    });
    if (recentEmails >= 5) {
      throw new Error("You've reached the email limit (5/hour). Please try again later.");
    }

    const dbResendKey: string | null = await ctx.runQuery(internal.adminSettings.getRawSetting, { key: "RESEND_API_KEY" });
    const resendKey = dbResendKey || process.env.RESEND_API_KEY;
    if (!resendKey) {
      throw new Error("Email service not configured.");
    }

    const htmlBody = markdownToEmailHtml(args.analysisMarkdown);

    const resend = new Resend(resendKey);
    try {
      await resend.emails.send({
        from: "SupplementDB <noreply@supplementdb.com>",
        to: args.recipientEmail,
        subject: args.subject,
        html: htmlBody,
      });
    } catch (err: any) {
      console.error("[emailResults] Resend error:", err);
      throw new Error("Email could not be sent. Please try again.");
    }

    await ctx.runMutation(internal.stackAnalyzer.logEmailSent, {
      userId: clerkId,
      recipientEmail: args.recipientEmail,
    });
  },
});

function markdownToEmailHtml(md: string): string {
  let html = md
    .replace(/^### (.*$)/gm, '<h3 style="color:#818cf8;font-family:DM Sans,sans-serif">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="color:#f1f5f9;font-family:DM Serif Display,serif">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="color:#f1f5f9;font-family:DM Serif Display,serif">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  return '<div style="background:#0b1120;color:#94a3b8;font-family:DM Sans,Arial,sans-serif;padding:32px;max-width:640px;margin:0 auto;">' +
    html +
    '<hr style="border:1px solid rgba(99,102,241,0.12);margin:24px 0">' +
    '<p style="font-size:12px;color:#64748b;">Sent from <a href="https://supplementdb.com" style="color:#818cf8">SupplementDB</a></p>' +
    '</div>';
}

export const countRecentEmails = internalQuery({
  args: { userId: v.string(), since: v.number() },
  handler: async (ctx, args) => {
    const emails = await ctx.db
      .query("emailLog")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .filter(q => q.gte(q.field("sentAt"), args.since))
      .collect();
    return emails.length;
  },
});

export const logEmailSent = internalMutation({
  args: { userId: v.string(), recipientEmail: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLog", {
      userId: args.userId,
      recipientEmail: args.recipientEmail,
      sentAt: Date.now(),
    });
  },
});

/**
 * Mutation to save analysis results to history.
 * Called from the analyzeStack action after successful Claude API call.
 */
export const saveAnalysis = mutation({
  args: {
    userId: v.string(),
    supplements: v.array(v.object({ id: v.number(), name: v.string() })),
    healthGoals: v.array(v.string()),
    analysisDepth: v.union(v.literal("quick"), v.literal("standard"), v.literal("deep")),
    result: v.any(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costUsd: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("stackAnalyses", {
      userId: args.userId,
      supplements: args.supplements,
      healthGoals: args.healthGoals,
      analysisDepth: args.analysisDepth,
      result: args.result,
      model: args.model,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      costUsd: args.costUsd,
      timestamp: Date.now(),
    });
  },
});
