"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Resend } from "resend";

/**
 * Email cron actions — Node.js environment (Resend API).
 * Split from emailCron.ts because Convex bundles mutations
 * separately and they can't reference Node.js packages.
 */

// ── Variable Resolution ─────────────────────────────────────

function resolveVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
}

// ── Email HTML Renderer ─────────────────────────────────────

function renderEmailHtml(
  bodyBlocks: Array<{ type: string; content?: string; label?: string; url?: string }>,
  variables: Record<string, string>,
  unsubscribeUrl: string
): string {
  const blocks = bodyBlocks.map((block) => {
    if (block.type === "text" && block.content) {
      const resolved = resolveVariables(block.content, variables);
      return `<p style="color:#c9d1d9;font-size:15px;line-height:1.6;margin:0 0 16px;">${resolved}</p>`;
    }
    if (block.type === "cta" && block.label && block.url) {
      const resolvedUrl = resolveVariables(block.url, variables);
      return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:16px 0;"><a href="${resolvedUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">${block.label}</a></td></tr></table>`;
    }
    if (block.type === "divider") {
      return `<hr style="border:none;border-top:1px solid rgba(99,102,241,0.15);margin:24px 0;">`;
    }
    return "";
  }).join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#161b22;border-radius:12px;border:1px solid rgba(99,102,241,0.15);overflow:hidden;">
        <tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid rgba(99,102,241,0.1);">
          <span style="font-size:24px;margin-right:8px;">&#128138;</span>
          <span style="color:#f0f6fc;font-size:20px;font-weight:700;letter-spacing:-0.3px;">SupplementDB</span>
        </td></tr>
        <tr><td style="padding:32px;">
          ${blocks}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(99,102,241,0.1);text-align:center;">
          <p style="color:#484f58;font-size:12px;margin:0 0 8px;">SupplementDB &middot; Evidence-based supplement research</p>
          <p style="color:#484f58;font-size:11px;margin:0;"><a href="${unsubscribeUrl}" style="color:#484f58;text-decoration:underline;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Test Email Action ───────────────────────────────────────

export const sendTestEmailAction = internalAction({
  args: {
    recipientEmail: v.string(),
    stepId: v.id("emailSteps"),
    sequenceId: v.id("emailSequences"),
  },
  handler: async (ctx, args) => {
    const step = await ctx.runQuery(internal.emailCron.getStepById, { stepId: args.stepId });
    if (!step) return;

    const siteConfig = await ctx.runQuery(internal.siteConfig.getAll, {});
    const siteUrl = process.env.SITE_URL || "http://localhost:8080";

    const variables: Record<string, string> = {
      supplement_count: siteConfig.supplementCount || "90+",
      paper_count: siteConfig.paperCount || "400+",
      evidence_tier_count: siteConfig.evidenceTierCount || "4",
      current_year: new Date().getFullYear().toString(),
      user_name: args.recipientEmail.split("@")[0],
      unsubscribe_url: "#test-unsubscribe",
      site_url: siteUrl,
    };

    const subject = `[TEST] ${resolveVariables(step.subject, variables)}`;
    const html = renderEmailHtml(step.bodyBlocks, variables, "#test-unsubscribe");

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not set");
      return;
    }

    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_ADDRESS || "SupplementDB <onboarding@resend.dev>";

    try {
      await resend.emails.send({ from: fromAddress, to: [args.recipientEmail], subject, html });
      console.log(`Test email sent to ${args.recipientEmail}`);
    } catch (err) {
      console.error("Test email error:", err);
    }
  },
});
