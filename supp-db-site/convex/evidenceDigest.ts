/**
 * evidenceDigest.ts — Weekly Evidence Digest Newsletter (SUPP-255)
 *
 * Receives the JSON output of `scripts/pubmed-evidence-monitor.js` (typically
 * POSTed from the GitHub Actions weekly workflow), curates it into a small
 * set of highlight entries, and schedules a personalized `sendEvidenceDigestEmail`
 * send to every confirmed newsletter subscriber.
 *
 * Adjacent pieces:
 *   - `resend.ts::sendEvidenceDigestEmail` — per-recipient HTML template + send
 *   - `http.ts::/evidence-digest-webhook` — secured inbound POST endpoint
 *   - `.github/workflows/evidence-monitor.yml` — posts to the webhook each Monday
 *
 * Admin control:
 *   Stored under `adminSettings.EVIDENCE_DIGEST_ENABLED` ("true" / "false").
 *   Defaults to disabled — an operator must explicitly opt in before the
 *   weekly cron starts sending mail.
 *
 * Rate control:
 *   Sends are scheduled via `ctx.scheduler.runAfter(offsetMs, …)` in a
 *   staggered fan-out so Resend's rate limits stay comfortable even at
 *   ten-thousand-subscriber scale.
 */

import {
  internalAction,
  internalQuery,
  mutation,
  query,
  action,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

const DIGEST_ENABLED_KEY = "EVIDENCE_DIGEST_ENABLED";

// Stagger between scheduled sends (25ms ≈ 40 req/s which is well under
// Resend's 10 req/s per-account default; the scheduler also naturally
// spreads these across workers). For a 1000-subscriber list this bounds
// completion to ~25 seconds.
const SEND_STAGGER_MS = 250;

// Top-N supplements by # of new candidate papers to surface in the email.
const HIGHLIGHTS_LIMIT = 5;

// Per-supplement: top-N papers to keep in each highlight entry.
const PAPERS_PER_HIGHLIGHT = 3;

// ─── Shared validators ────────────────────────────────────────────────────

// NOTE: Convex validators reject any undeclared field on v.object — strict
// by design. The PubMed monitor script is the source of truth for this
// shape and may grow new optional fields (pubmedHitCount, skipped, error,
// category, evidenceTier, etc.) over time. Tolerating those unknown fields
// at the validator layer is a hard requirement: otherwise every harmless
// schema addition on the script side would 400 the webhook until the
// backend redeploys.
//
// Trade-off: we use v.any() for entries and reach in with hand-rolled
// guards in the orchestrator rather than modeling every field twice.
const digestPayloadValidator = v.object({
  meta: v.any(),
  entries: v.array(v.any()),
});

// ─── Admin toggle ─────────────────────────────────────────────────────────

export const getDigestEnabled = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const row = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", DIGEST_ENABLED_KEY))
      .first();
    return row?.value === "true";
  },
});

/**
 * Admin-facing setter for the digest-enabled flag. Requires admin auth.
 * The digest orchestrator respects this toggle — webhook deliveries will
 * short-circuit when it's false.
 */
export const setDigestEnabled = mutation({
  args: {
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("adminSettings")
      .withIndex("by_key", (q) => q.eq("key", DIGEST_ENABLED_KEY))
      .first();
    const value = args.enabled ? "true" : "false";
    if (existing) {
      await ctx.db.patch(existing._id, {
        value,
        updatedAt: Date.now(),
        updatedBy: user.clerkId,
      });
    } else {
      await ctx.db.insert("adminSettings", {
        key: DIGEST_ENABLED_KEY,
        value,
        updatedAt: Date.now(),
        updatedBy: user.clerkId,
      });
    }
    return { enabled: args.enabled };
  },
});

/**
 * Internal helper — returns true when the digest is enabled via admin flag
 * OR when it's not set at all (first-run default). Scheduled cron respects
 * the stored value; webhook callers see the same gate.
 */
async function digestEnabledInternal(ctx: any): Promise<boolean> {
  const row = await ctx.db
    .query("adminSettings")
    .withIndex("by_key", (q: any) => q.eq("key", DIGEST_ENABLED_KEY))
    .first();
  // Default-off posture: require an explicit opt-in before sending mail.
  return row?.value === "true";
}

// ─── Confirmed subscriber enumeration ─────────────────────────────────────

/** Returns [{ email, unsubscribeToken }] for every confirmed subscriber. */
export const listConfirmedForDigest = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_status", (q) => q.eq("status", "confirmed"))
      .collect();
    return rows.map((r) => ({
      email: r.email,
      unsubscribeToken: r.unsubscribeToken,
    }));
  },
});

// ─── Curation ─────────────────────────────────────────────────────────────

/**
 * Pick the top N supplements by delta size and normalize each to the shape
 * the email template expects.
 */
function curateHighlights(
  entries: Array<any>
): Array<{
  name: string;
  slug: string;
  newPapers: Array<{
    pmid: string;
    title: string;
    year: number | null;
    journal: string;
    studyType: string;
    url: string;
  }>;
}> {
  return entries
    .filter((e) => Array.isArray(e.newPapers) && e.newPapers.length > 0)
    .sort((a, b) => (b.newPapers?.length || 0) - (a.newPapers?.length || 0))
    .slice(0, HIGHLIGHTS_LIMIT)
    .map((e) => ({
      name: e.name,
      slug: e.slug,
      newPapers: e.newPapers.slice(0, PAPERS_PER_HIGHLIGHT).map((p: any) => ({
        pmid: p.pmid,
        title: p.title,
        year: p.year ?? null,
        journal: p.journal || "",
        studyType: p.studyType || "other",
        url: p.url || `https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/`,
      })),
    }));
}

// ─── Main orchestrator ────────────────────────────────────────────────────

/**
 * Called by the webhook (or manually by an admin). Fans out personalized
 * sends to every confirmed newsletter subscriber.
 *
 * Returns a summary `{ recipients, scheduled, skipped, reason? }`.
 */
export const sendDigestToSubscribers = internalAction({
  args: {
    payload: digestPayloadValidator,
    reportDate: v.string(),
    force: v.optional(v.boolean()), // Bypass the admin toggle (admin UI only)
  },
  handler: async (ctx, args): Promise<{
    recipients: number;
    scheduled: number;
    skipped: number;
    reason?: string;
  }> => {
    const entries = Array.isArray(args.payload.entries) ? args.payload.entries : [];
    const topEntries = curateHighlights(entries);
    const withNew = entries.filter(
      (e: any) => Array.isArray(e.newPapers) && e.newPapers.length > 0
    );
    const totalCandidates = withNew.reduce(
      (sum: number, e: any) => sum + e.newPapers.length,
      0
    );

    // Admin toggle — default off, must explicitly opt in.
    if (!args.force) {
      const enabled = await ctx.runQuery(
        internal.evidenceDigest._digestEnabledQuery,
        {}
      );
      if (!enabled) {
        return {
          recipients: 0,
          scheduled: 0,
          skipped: 0,
          reason: "EVIDENCE_DIGEST_ENABLED adminSetting is not 'true'",
        };
      }
    }

    // Nothing-to-say short-circuit. Operators can still force a "quiet week"
    // send by passing the empty report through with force:true — the
    // template handles that gracefully — but by default we save inbox
    // fatigue.
    if (topEntries.length === 0 && !args.force) {
      return {
        recipients: 0,
        scheduled: 0,
        skipped: 0,
        reason: "No supplements with new papers this week",
      };
    }

    const recipients: Array<{ email: string; unsubscribeToken: string }> =
      await ctx.runQuery(internal.evidenceDigest.listConfirmedForDigest, {});

    let scheduled = 0;
    let skipped = 0;
    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i];
      if (!r.email || !r.unsubscribeToken) {
        skipped++;
        continue;
      }
      await ctx.scheduler.runAfter(
        i * SEND_STAGGER_MS,
        internal.resend.sendEvidenceDigestEmail,
        {
          email: r.email,
          unsubscribeToken: r.unsubscribeToken,
          reportDate: args.reportDate,
          totalCandidates,
          supplementsWithNew: withNew.length,
          topEntries,
        }
      );
      scheduled++;
    }

    console.log(
      `[evidenceDigest] ${args.reportDate}: scheduled ${scheduled}/${recipients.length} digest sends (${topEntries.length} highlights, ${totalCandidates} total candidates)`
    );

    return {
      recipients: recipients.length,
      scheduled,
      skipped,
    };
  },
});

/** Internal query used by the orchestrator to check the admin toggle. */
export const _digestEnabledQuery = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await digestEnabledInternal(ctx);
  },
});

// ─── Admin-facing actions ─────────────────────────────────────────────────

/**
 * Admin-triggered send. Lets a staff member test the digest against the
 * subscriber list using the latest monitor output. `force: true` bypasses
 * the enabled-flag check so an admin can always send manually.
 */
export const sendDigestNow = action({
  args: {
    payload: digestPayloadValidator,
    reportDate: v.string(),
  },
  handler: async (ctx, args): Promise<{
    recipients: number;
    scheduled: number;
    skipped: number;
    reason?: string;
  }> => {
    // Admin gate (requireAdmin lives on query/mutation ctx — we need a
    // lightweight check via the auth table; reusing the existing admin-settings
    // query which already checks auth.)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Must be signed in");
    // Reuse existing getDigestEnabled (requireAdmin-gated) to confirm
    // the caller has admin rights; we discard the returned value.
    await ctx.runQuery(internal.evidenceDigest._requireAdminPing, {});

    return (await ctx.runAction(internal.evidenceDigest.sendDigestToSubscribers, {
      payload: args.payload,
      reportDate: args.reportDate,
      force: true,
    })) as any;
  },
});

/** Minimal admin-only ping so actions can gate on admin auth. */
export const _requireAdminPing = internalQuery({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return true;
  },
});
