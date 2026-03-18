import { internalMutation } from "./_generated/server";

/**
 * One-time seed: creates the 3-email Welcome Sequence from the design spec.
 * Run via: npx convex run seedWelcomeSequence:seed
 *
 * IMPORTANT: Only run once. Check if "Welcome to SupplementDB" sequence exists first.
 */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("emailSequences").collect();
    const alreadyExists = existing.find((s) => s.name === "Welcome to SupplementDB");
    if (alreadyExists) {
      console.log("Welcome sequence already exists, skipping seed.");
      return;
    }

    const now = Date.now();

    // Create the sequence
    const sequenceId = await ctx.db.insert("emailSequences", {
      name: "Welcome to SupplementDB",
      description: "3-email welcome sequence for new newsletter subscribers. Builds trust through evidence, then offers the Sleep Optimization Guide.",
      trigger: { type: "both", event: "email_opt_in" },
      status: "draft", // Start as draft so admin can review before activating
      sendTime: { hour: 9, minute: 0, timezone: "America/New_York" },
      excludeDays: ["saturday", "sunday"],
      maxDeferHours: 48,
      createdAt: now,
      updatedAt: now,
    });

    // Email 1 — Welcome (send immediately)
    await ctx.db.insert("emailSteps", {
      sequenceId,
      stepIndex: 0,
      subject: "The {{supplement_count}} supplements. The {{paper_count}} papers. Here's what it means for you.",
      preheader: "Not all of them are worth taking. Most people are surprised which ones are.",
      bodyBlocks: [
        {
          type: "text",
          content: "You just joined a database that does something unusual: it tells you what <em>not</em> to take.",
        },
        {
          type: "text",
          content: "SupplementDB tracks {{supplement_count}} supplements across {{paper_count}} research papers. Each one is rated on a {{evidence_tier_count}}-tier evidence system — from \"strong clinical evidence\" down to \"mostly marketing.\"",
        },
        {
          type: "text",
          content: "Over the next few emails, I'll show you how the evidence system works, why most \"clinically proven\" claims fall apart under scrutiny, and how to use the database to make decisions you can actually trust.",
        },
        {
          type: "text",
          content: "For now, here's the full database. Browse by category, sort by evidence tier, and see what surprises you.",
        },
        {
          type: "cta",
          label: "Browse the Database",
          url: "{{site_url}}/index.html",
        },
        {
          type: "text",
          content: "<em>P.S. — The supplements with the weakest evidence are often the most popular. That's not a coincidence.</em>",
        },
      ],
      delayDays: 0,
      status: "active",
    });

    // Email 2 — Evidence Gap (+2 days)
    await ctx.db.insert("emailSteps", {
      sequenceId,
      stepIndex: 1,
      subject: '"Clinically proven" can mean 12 people for 3 weeks. Here\'s what it actually means.',
      preheader: "The label says evidence-based. The evidence says otherwise.",
      bodyBlocks: [
        {
          type: "text",
          content: "\"Clinically proven\" is the most abused phrase in the supplement industry.",
        },
        {
          type: "text",
          content: "It can mean a single study, with 12 participants, over 3 weeks, funded by the company selling the product. Technically clinical. Technically proven. Practically meaningless.",
        },
        {
          type: "text",
          content: "That's why SupplementDB uses a {{evidence_tier_count}}-tier evidence rating instead of a simple thumbs up/down:",
        },
        {
          type: "text",
          content: "<strong>Tier 1:</strong> Multiple large RCTs, consistent results, independent replication.<br><strong>Tier 2:</strong> Some RCTs with positive results, but limited in size or scope.<br><strong>Tier 3:</strong> Preliminary evidence — animal studies, small trials, mechanistic plausibility.<br><strong>Tier 4:</strong> Mostly traditional use or marketing claims. Little to no clinical evidence.",
        },
        {
          type: "text",
          content: "Most supplements people take daily? Tier 3 or 4. The ones that actually have Tier 1 evidence are a much shorter — and more interesting — list.",
        },
        {
          type: "cta",
          label: "View the Evidence Tier Guide",
          url: "{{site_url}}/index.html#guides",
        },
      ],
      delayDays: 2,
      status: "active",
    });

    // Email 3 — $9 Guide Offer (+5 days)
    await ctx.db.insert("emailSteps", {
      sequenceId,
      stepIndex: 2,
      subject: "{{supplement_count}} supplements reviewed for sleep. Here are the ones with actual evidence.",
      preheader: "You've seen the gap. Here's the complete protocol.",
      bodyBlocks: [
        {
          type: "text",
          content: "You've seen how the evidence system works. You've seen the gap between marketing and research. Now here's where it gets practical.",
        },
        {
          type: "text",
          content: "The Sleep Optimization Guide pulls together every sleep-related supplement in the database — dosages, timing, interactions, and evidence tier — into a single protocol you can actually follow.",
        },
        {
          type: "text",
          content: "It's not a list of \"top 10 sleep supplements.\" It's a decision framework built on the same evidence tiers you've been exploring. What to take, what to skip, what to combine, and what the research actually says about each one.",
        },
        {
          type: "text",
          content: "{{supplement_count}} supplements. {{paper_count}} papers. One clear protocol. $9.",
        },
        {
          type: "cta",
          label: "Get the Sleep Evidence Guide — $9",
          url: "{{site_url}}/index.html#guides",
        },
        {
          type: "text",
          content: "<em>Every purchase directly funds the database. More reviews, more papers, more tiers updated.</em>",
        },
      ],
      delayDays: 5,
      status: "active",
    });

    console.log("Welcome sequence seeded successfully (ID:", sequenceId, ")");
  },
});
