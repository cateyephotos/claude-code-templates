import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Email queue processor — internal mutations and queries.
 * Actions that need Node.js (Resend) live in emailCronAction.ts.
 */

// ── Helper Queries ──────────────────────────────────────────

export const getStepById = internalQuery({
  args: { stepId: v.id("emailSteps") },
  handler: async (ctx, args) => ctx.db.get(args.stepId),
});
