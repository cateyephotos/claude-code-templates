import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * PDF Generation module for SupplementDB guide purchases.
 *
 * Flow:
 *   1. Called from http.ts webhook handler after guide purchase confirmed
 *   2. Marks purchase as "pdf_generating"
 *   3. POSTs to the pdf-generator Express service (Puppeteer)
 *   4. Stores the returned PDF binary in Convex file storage
 *   5. Updates purchase record with storageId and status "pdf_ready"
 *   6. Schedules guide download email via resend.ts
 *
 * Required Convex env vars:
 *   PDF_GENERATOR_URL    — Base URL of the pdf-generator service
 *                          e.g. https://yourdomain.com/pdf-api
 *                          or http://host.docker.internal:3001 for local dev
 *   PDF_GENERATOR_SECRET — Shared secret for authenticating requests
 *   SITE_URL             — Base URL used to build the guide page URL for rendering
 */

function getPdfGeneratorUrl(): string {
  const url = process.env.PDF_GENERATOR_URL;
  if (!url) {
    throw new Error(
      "PDF_GENERATOR_URL environment variable is not set. " +
        "Configure it in the Convex dashboard (e.g. https://yourdomain.com/pdf-api)."
    );
  }
  return url.replace(/\/$/, "");
}

function getPdfGeneratorSecret(): string {
  const secret = process.env.PDF_GENERATOR_SECRET;
  if (!secret) {
    throw new Error(
      "PDF_GENERATOR_SECRET environment variable is not set. " +
        "Set a shared secret in the Convex dashboard and the pdf-generator service."
    );
  }
  return secret;
}

function getSiteUrl(): string {
  return process.env.SITE_URL || "http://localhost:8080";
}

/**
 * Generate a PDF for a purchased guide and store it in Convex file storage.
 * Scheduled by the Stripe webhook handler after payment confirmation.
 */
export const generateAndStorePdf = internalAction({
  args: {
    purchaseId: v.id("guidePurchases"),
    guideSlug: v.string(),
    guideName: v.string(),
    userId: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    // 1. Mark as generating
    await ctx.runMutation(internal.guidePurchases.markPdfGenerating, {
      purchaseId: args.purchaseId,
    });

    const pdfGeneratorUrl = getPdfGeneratorUrl();
    const secret = getPdfGeneratorSecret();
    const siteUrl = getSiteUrl();

    // The guide page URL that Puppeteer will render
    const guidePageUrl = `${siteUrl}/guides/${args.guideSlug}.html`;

    let pdfBuffer: ArrayBuffer;

    try {
      // 2. Request PDF generation from the Express/Puppeteer service
      const response = await fetch(`${pdfGeneratorUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PDF-Secret": secret,
        },
        body: JSON.stringify({
          url: guidePageUrl,
          guideSlug: args.guideSlug,
          guideName: args.guideName,
        }),
      });

      if (!response.ok) {
        let errorDetails = `HTTP ${response.status}`;
        try {
          const errorBody = await response.text();
          errorDetails += `: ${errorBody}`;
        } catch {
          // ignore read error
        }
        throw new Error(`PDF generator service returned error: ${errorDetails}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/pdf")) {
        throw new Error(
          `PDF generator returned unexpected content-type: ${contentType}`
        );
      }

      pdfBuffer = await response.arrayBuffer();

      if (pdfBuffer.byteLength < 1024) {
        throw new Error(
          `PDF generator returned suspiciously small file: ${pdfBuffer.byteLength} bytes`
        );
      }
    } catch (error: any) {
      console.error(
        `pdfGenerator.generateAndStorePdf: PDF generation failed for purchase ${args.purchaseId}`,
        error
      );

      await ctx.runMutation(internal.guidePurchases.markPdfFailed, {
        purchaseId: args.purchaseId,
        errorMessage: error?.message ?? "Unknown PDF generation error",
      });

      return;
    }

    // 3. Store the PDF in Convex file storage
    let storageId: string;
    try {
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const id = await ctx.storage.store(blob);
      storageId = id as string;
    } catch (error: any) {
      console.error(
        `pdfGenerator.generateAndStorePdf: Convex storage failed for purchase ${args.purchaseId}`,
        error
      );

      await ctx.runMutation(internal.guidePurchases.markPdfFailed, {
        purchaseId: args.purchaseId,
        errorMessage: `Storage error: ${error?.message ?? "Unknown storage error"}`,
      });

      return;
    }

    // 4. Update purchase record with storageId and mark as pdf_ready
    await ctx.runMutation(internal.guidePurchases.updateGuidePurchasePdf, {
      purchaseId: args.purchaseId,
      pdfStorageId: storageId,
    });

    console.log(
      `✅ pdfGenerator.generateAndStorePdf: PDF stored for purchase ${args.purchaseId} (${pdfBuffer.byteLength} bytes)`
    );

    // 5. Look up user email to send download notification
    // We need the user's email — fetch from users table via clerkId
    const user = await ctx.runQuery(internal.users.getByClerkIdInternal, {
      clerkId: args.userId,
    });

    if (!user?.email) {
      console.warn(
        `pdfGenerator.generateAndStorePdf: No email found for user ${args.userId}, skipping download email`
      );
      return;
    }

    // 6. Fetch purchase details for email metadata
    const purchase = await ctx.runQuery(internal.guidePurchases.getPurchaseById, {
      purchaseId: args.purchaseId,
    });

    // 7. Schedule download notification email
    await ctx.scheduler.runAfter(0, internal.resend.sendGuideDownloadEmail, {
      email: user.email,
      guideName: args.guideName,
      guideSlug: args.guideSlug,
      sessionId: args.sessionId,
      amountTotal: purchase?.amountTotal ?? 0,
      currency: purchase?.currency ?? "usd",
    });

    // 8. Mark email as scheduled/sent
    await ctx.runMutation(internal.guidePurchases.markEmailSent, {
      purchaseId: args.purchaseId,
    });
  },
});
