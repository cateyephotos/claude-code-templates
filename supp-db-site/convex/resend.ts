import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

/**
 * Email sending actions for SupplementDB newsletter.
 * Uses Resend API — following the same external-API pattern as stripe.ts.
 *
 * Required Convex env vars:
 *   RESEND_API_KEY — Resend API key (re_...)
 *   SITE_URL — Base URL for confirmation/unsubscribe links
 *
 * Both actions are internalActions — only callable via ctx.scheduler
 * or internal references, never directly from the client.
 */

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY environment variable is not set. Configure it in the Convex dashboard."
    );
  }
  return new Resend(key);
}

function getSiteUrl(): string {
  return process.env.SITE_URL || "http://localhost:8080";
}

function getFromAddress(): string {
  // Use verified domain in production, Resend test sender in development
  return process.env.RESEND_FROM_ADDRESS || "SupplementDB <onboarding@resend.dev>";
}

// ── Confirmation Email ───────────────────────────────────────

export const sendConfirmationEmail = internalAction({
  args: {
    email: v.string(),
    confirmToken: v.string(),
    source: v.string(),
  },
  handler: async (_ctx, args) => {
    const resend = getResend();
    const siteUrl = getSiteUrl();
    const confirmUrl = `${siteUrl}/confirm.html?token=${args.confirmToken}`;

    const sourceLabel = args.source === "homepage"
      ? "our homepage"
      : args.source.replace("guide-", "our ").replace(/-/g, " ") + " guide";

    try {
      const { data, error } = await resend.emails.send({
        from: getFromAddress(),
        to: [args.email],
        subject: "Confirm your SupplementDB subscription",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#161b22;border-radius:12px;border:1px solid rgba(99,102,241,0.15);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid rgba(99,102,241,0.1);">
              <span style="font-size:24px;margin-right:8px;">&#128138;</span>
              <span style="color:#f0f6fc;font-size:20px;font-weight:700;letter-spacing:-0.3px;">SupplementDB</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="color:#f0f6fc;font-size:22px;font-weight:600;margin:0 0 16px;line-height:1.3;">
                Confirm your subscription
              </h1>
              <p style="color:#8b949e;font-size:15px;line-height:1.6;margin:0 0 24px;">
                You signed up for SupplementDB updates from ${sourceLabel}. Click below to confirm your email and start receiving evidence-based supplement research.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${confirmUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      Confirm Subscription
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#484f58;font-size:13px;line-height:1.5;margin:0;">
                This link expires in 24 hours. If you didn't sign up, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(99,102,241,0.1);text-align:center;">
              <p style="color:#484f58;font-size:12px;margin:0;">
                SupplementDB &middot; Evidence-based supplement research
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });

      if (error) {
        console.error(`Failed to send confirmation email to ${args.email}:`, error);
      } else {
        console.log(`Confirmation email sent to ${args.email} (id: ${data?.id})`);
      }
    } catch (error) {
      console.error(`Error sending confirmation email to ${args.email}:`, error);
    }
  },
});

// ── Welcome Email ────────────────────────────────────────────

export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    unsubscribeToken: v.string(),
  },
  handler: async (_ctx, args) => {
    const resend = getResend();
    const siteUrl = getSiteUrl();
    const unsubscribeUrl = `${siteUrl}/unsubscribe.html?token=${args.unsubscribeToken}`;
    const guidesUrl = `${siteUrl}/index.html#guides`;

    try {
      const { data, error } = await resend.emails.send({
        from: getFromAddress(),
        to: [args.email],
        subject: "Welcome to SupplementDB!",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#161b22;border-radius:12px;border:1px solid rgba(99,102,241,0.15);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid rgba(99,102,241,0.1);">
              <span style="font-size:24px;margin-right:8px;">&#128138;</span>
              <span style="color:#f0f6fc;font-size:20px;font-weight:700;letter-spacing:-0.3px;">SupplementDB</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="color:#f0f6fc;font-size:22px;font-weight:600;margin:0 0 16px;line-height:1.3;">
                Welcome aboard! &#127881;
              </h1>
              <p style="color:#8b949e;font-size:15px;line-height:1.6;margin:0 0 20px;">
                Your subscription is confirmed. Here's what you'll get from SupplementDB:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:8px 0;color:#c9d1d9;font-size:14px;line-height:1.5;">
                    <span style="color:#4ade80;margin-right:8px;">&#10003;</span>
                    New supplement research summaries
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#c9d1d9;font-size:14px;line-height:1.5;">
                    <span style="color:#4ade80;margin-right:8px;">&#10003;</span>
                    Evidence guide updates and additions
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#c9d1d9;font-size:14px;line-height:1.5;">
                    <span style="color:#4ade80;margin-right:8px;">&#10003;</span>
                    Dosage protocol refinements
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#c9d1d9;font-size:14px;line-height:1.5;">
                    <span style="color:#4ade80;margin-right:8px;">&#10003;</span>
                    Safety alerts and interaction warnings
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 8px;">
                    <a href="${guidesUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                      Browse Evidence Guides
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(99,102,241,0.1);text-align:center;">
              <p style="color:#484f58;font-size:12px;margin:0 0 8px;">
                SupplementDB &middot; Evidence-based supplement research
              </p>
              <p style="color:#484f58;font-size:11px;margin:0;">
                <a href="${unsubscribeUrl}" style="color:#484f58;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });

      if (error) {
        console.error(`Failed to send welcome email to ${args.email}:`, error);
      } else {
        console.log(`Welcome email sent to ${args.email} (id: ${data?.id})`);
      }
    } catch (error) {
      console.error(`Error sending welcome email to ${args.email}:`, error);
    }
  },
});
