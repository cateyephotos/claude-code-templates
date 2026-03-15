import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Stack Analyzer — AI-powered supplement stack evaluation via Claude API.
 *
 * Architecture:
 *   - Fixed inputs only (no free text) → predictable token usage
 *   - Constrained to pulldown selections: supplements (from DB), health goal, depth
 *   - Model: claude-haiku-4-5 for cost efficiency (~$0.006/analysis)
 *   - Structured JSON output via output_config schema
 *   - Credit-gated: free = 3/month, subscriber = 25/month
 *
 * Required Convex env vars:
 *   ANTHROPIC_API_KEY — Claude API key
 *
 * Token budget (fixed per depth):
 *   Quick:    ~1,200 input + ~400 output = ~$0.003
 *   Standard: ~2,000 input + ~800 output = ~$0.006
 *   Deep:     ~2,500 input + ~1,200 output = ~$0.009
 */

// ── Claude Client ──────────────────────────────────────────────

function getClaude(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}

// ── Analysis JSON Schema ───────────────────────────────────────

const STACK_ANALYSIS_SCHEMA = {
  type: "object" as const,
  properties: {
    overallScore: {
      type: "number" as const,
      description: "Overall stack quality score from 1-100",
    },
    evidenceStrength: {
      type: "string" as const,
      enum: ["strong", "moderate", "limited", "insufficient"],
      description: "Overall evidence quality for this combination",
    },
    stackSummary: {
      type: "string" as const,
      description: "2-3 sentence summary of the stack analysis for the specified health goal",
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
    mechanismCoverage: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          mechanism: { type: "string" as const },
          coveredBy: {
            type: "array" as const,
            items: { type: "string" as const },
          },
          strength: {
            type: "string" as const,
            enum: ["well-covered", "partially-covered", "gap"],
          },
        },
        required: ["mechanism", "coveredBy", "strength"],
      },
      description: "How well the stack covers key biological mechanisms for the health goal",
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
    "overallScore",
    "evidenceStrength",
    "stackSummary",
    "synergyAnalysis",
    "mechanismCoverage",
    "safetyFlags",
    "dosageProtocol",
    "suggestedAdditions",
    "suggestedRemovals",
  ],
};

// ── System Prompt Builder ──────────────────────────────────────

function buildSystemPrompt(depth: string): string {
  const depthInstructions = {
    quick: "Provide a concise analysis focusing on overall score, top interactions, and critical safety flags. Keep explanations brief (1 sentence each).",
    standard: "Provide a thorough analysis covering all sections. Include mechanism coverage analysis and dosage protocol. Explanations should be 1-2 sentences each.",
    deep: "Provide a comprehensive analysis with detailed mechanism coverage, full synergy mapping, complete dosage protocol with timing windows, and thorough safety review. Explanations should be detailed (2-3 sentences each).",
  };

  return `You are SupplementDB's Stack Analyzer, an evidence-based supplement interaction and synergy analysis engine.

ROLE: Evaluate supplement stacks for a specific health goal. Assess synergies, redundancies, safety, and mechanism coverage using clinical evidence.

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

IMPORTANT RULES:
1. Never recommend exceeding evidence-supported dosages
2. Always flag known drug interactions
3. Be conservative with safety assessments — when uncertain, flag as caution
4. Suggest additions only from well-studied supplements (Tier 1-2)
5. Do not invent or hallucinate clinical evidence
6. Base all mechanism analysis on established pharmacology
7. Consider bioavailability and absorption interactions

OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object — no markdown, no code fences, no explanatory text before or after. The JSON must contain these required fields:
- overallScore (number 1-100)
- evidenceStrength ("strong"|"moderate"|"limited"|"insufficient")
- stackSummary (string, 2-3 sentences)
- synergyAnalysis (array of {pair: [string,string], type: "synergistic"|"redundant"|"antagonistic"|"neutral", explanation: string})
- mechanismCoverage (array of {mechanism: string, coveredBy: string[], strength: "well-covered"|"partially-covered"|"gap"})
- safetyFlags (array of {severity: "caution"|"warning"|"critical", supplements: string[], description: string})
- dosageProtocol (array of {supplement: string, recommendedDose: string, timing: string, withFood: boolean, notes: string})
- suggestedAdditions (array of {name: string, reason: string, evidenceTier: number}, max 3)
- suggestedRemovals (array of {name: string, reason: string}, max 2)`;
}

// ── Supplement Context Builder ──────────────────────────────────

function buildUserMessage(
  supplements: Array<{ id: number; name: string; category: string; evidenceTier: number; dosageRange: string; mechanisms: string[] }>,
  healthGoal: { id: string; name: string },
  depth: string
): string {
  const supplementList = supplements.map((s, i) => {
    const mechStr = s.mechanisms.length > 0 ? `Mechanisms: ${s.mechanisms.join(", ")}` : "";
    return `${i + 1}. ${s.name} (Tier ${s.evidenceTier}, ${s.category})
   Typical dose: ${s.dosageRange}${mechStr ? `\n   ${mechStr}` : ""}`;
  }).join("\n");

  return `ANALYZE THIS SUPPLEMENT STACK:

Health Goal: ${healthGoal.name} (${healthGoal.id})

Supplements in stack:
${supplementList}

Analysis depth: ${depth}

Evaluate this stack for the specified health goal. Assess synergies, redundancies, mechanism coverage, safety, and provide an optimized dosage protocol.`;
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

// ── Main Action ────────────────────────────────────────────────

/**
 * Analyze a supplement stack using Claude API.
 *
 * All inputs are constrained (no free text):
 *   - supplements: Array of {id, name} from the supplement database
 *   - healthGoal: Domain ID from problems.js
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
    healthGoal: v.object({
      id: v.string(),
      name: v.string(),
    }),
    depth: v.union(v.literal("quick"), v.literal("standard"), v.literal("deep")),
  },
  handler: async (ctx, args) => {
    // ── Auth Check ──────────────────────────────────────────
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Authentication required. Please sign in to use the Stack Analyzer.");
    }

    const clerkId = identity.subject;

    // ── Input Validation ────────────────────────────────────
    if (args.supplements.length < 2) {
      throw new ConvexError("Please select at least 2 supplements to analyze.");
    }
    if (args.supplements.length > 15) {
      throw new ConvexError("Maximum 15 supplements per analysis. Please reduce your selection.");
    }

    // ── Credit Check + Consume ──────────────────────────────
    // We consume the credit BEFORE calling Claude to prevent races.
    // If Claude fails, we don't refund — this prevents abuse.
    const creditResult = await ctx.runMutation(api.analysisCredits.consumeCredit, {
      userId: clerkId,
      depth: args.depth,
    });

    // ── Build Claude Request ────────────────────────────────
    // Resolve API key: admin UI DB setting takes priority over env var
    const dbKey = await ctx.runQuery(internal.adminSettings.getRawSetting, { key: "ANTHROPIC_API_KEY" });
    const anthropicKey = dbKey || process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new ConvexError(
        "ANTHROPIC_API_KEY is not configured. Set it in Admin → Configuration → API Keys."
      );
    }
    const claude = getClaude(anthropicKey);

    // Resolve model: admin UI DB setting → default
    const dbModel = await ctx.runQuery(internal.adminSettings.getRawSetting, { key: "ANTHROPIC_MODEL" });
    const model = dbModel || "claude-haiku-4-5-20251001";

    const systemPrompt = buildSystemPrompt(args.depth);
    const userMessage = buildUserMessage(
      args.supplements,
      args.healthGoal,
      args.depth
    );

    const maxTokens = MAX_TOKENS_BY_DEPTH[args.depth] || MAX_TOKENS_BY_DEPTH.standard;

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
          // Prefill assistant response with '{' to force JSON output
          {
            role: "assistant",
            content: "{",
          },
        ],
      });
    } catch (error: any) {
      // Handle specific Anthropic API errors
      if (error?.status === 429) {
        throw new ConvexError("The analysis service is temporarily busy. Please try again in a moment.");
      }
      if (error?.status === 401) {
        throw new ConvexError("Analysis service configuration error. Please contact support.");
      }
      if (error?.status === 400) {
        throw new ConvexError("Invalid analysis request. Please try different supplement selections.");
      }
      throw new ConvexError("Analysis failed. Please try again. If this persists, contact support.");
    }

    // ── Parse Response ──────────────────────────────────────
    const textBlock = response.content.find((block: any) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new ConvexError("Analysis produced no results. Please try again.");
    }

    let analysis;
    const rawText = textBlock.text;

    // Strategy: try multiple extraction approaches in order of reliability
    const parseAttempts: Array<{ name: string; fn: () => any }> = [
      {
        // 1. Direct parse — response is raw JSON (most common with prefill)
        //    Prepend '{' since we used assistant prefill
        name: "prefill_json",
        fn: () => JSON.parse("{" + rawText),
      },
      {
        // 2. Direct parse — response is complete JSON on its own
        name: "direct_json",
        fn: () => JSON.parse(rawText),
      },
      {
        // 3. Trim whitespace / BOM and try again
        name: "trimmed_json",
        fn: () => JSON.parse(rawText.trim().replace(/^\uFEFF/, "")),
      },
      {
        // 4. Extract from markdown code fences: ```json ... ``` or ``` ... ```
        name: "code_fence",
        fn: () => {
          const m = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
          if (!m) throw new Error("no code fence");
          return JSON.parse(m[1].trim());
        },
      },
      {
        // 5. Find outermost { ... } braces (greedy)
        name: "brace_extract",
        fn: () => {
          const start = rawText.indexOf("{");
          if (start === -1) throw new Error("no opening brace");
          // Find matching closing brace by counting depth
          let depth = 0;
          let end = -1;
          for (let i = start; i < rawText.length; i++) {
            if (rawText[i] === "{") depth++;
            else if (rawText[i] === "}") {
              depth--;
              if (depth === 0) { end = i; break; }
            }
          }
          if (end === -1) throw new Error("no matching closing brace");
          return JSON.parse(rawText.substring(start, end + 1));
        },
      },
      {
        // 6. Strip trailing commas (common LLM mistake) and retry brace extract
        name: "trailing_comma_fix",
        fn: () => {
          const start = rawText.indexOf("{");
          if (start === -1) throw new Error("no opening brace");
          let depth = 0;
          let end = -1;
          for (let i = start; i < rawText.length; i++) {
            if (rawText[i] === "{") depth++;
            else if (rawText[i] === "}") {
              depth--;
              if (depth === 0) { end = i; break; }
            }
          }
          if (end === -1) throw new Error("no matching closing brace");
          let jsonStr = rawText.substring(start, end + 1);
          // Remove trailing commas before } or ]
          jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");
          return JSON.parse(jsonStr);
        },
      },
    ];

    let lastError: any = null;
    for (const attempt of parseAttempts) {
      try {
        analysis = attempt.fn();
        // Validate it has at least the required top-level field
        if (analysis && typeof analysis === "object" && "overallScore" in analysis) {
          break; // Success — valid analysis object
        }
        // Parsed but missing key fields — keep trying
        if (analysis && typeof analysis === "object") {
          break; // Accept any valid object with data
        }
        lastError = new Error(`Parsed but got ${typeof analysis}`);
        analysis = undefined;
      } catch (e) {
        lastError = e;
        analysis = undefined;
      }
    }

    if (!analysis) {
      // Log the raw response for debugging (truncated to avoid huge logs)
      console.error(
        "[StackAnalyzer] All parse attempts failed. Raw response (first 500 chars):",
        rawText.substring(0, 500)
      );
      throw new ConvexError(
        "Analysis result could not be interpreted. The AI returned an unexpected format. Please try again."
      );
    }

    // ── Token Usage ─────────────────────────────────────────
    const inputTokens = response.usage?.input_tokens ?? 0;
    const outputTokens = response.usage?.output_tokens ?? 0;
    const costUsd = estimateCost(inputTokens, outputTokens);

    // ── Save Analysis to History ────────────────────────────
    await ctx.runMutation(api.stackAnalyzer.saveAnalysis, {
      userId: clerkId,
      supplements: args.supplements.map((s) => ({ id: s.id, name: s.name })),
      healthGoal: args.healthGoal.id,
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
      creditsRemaining: creditResult.totalAvailable,
      creditsUsed: creditResult.usedThisMonth,
      creditsLimit: creditResult.monthlyLimit,
      purchasedCredits: creditResult.purchasedCredits,
      creditCost: creditResult.creditCost,
    };
  },
});

/**
 * Internal mutation to save analysis results.
 * Called from the analyzeStack action after successful Claude API call.
 */
export const saveAnalysis = mutation({
  args: {
    userId: v.string(),
    supplements: v.array(v.object({ id: v.number(), name: v.string() })),
    healthGoal: v.string(),
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
      healthGoal: args.healthGoal,
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
