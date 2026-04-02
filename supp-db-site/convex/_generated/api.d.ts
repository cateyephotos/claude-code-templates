/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminConfig from "../adminConfig.js";
import type * as adminSettings from "../adminSettings.js";
import type * as analysisCredits from "../analysisCredits.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as emailCron from "../emailCron.js";
import type * as emailCronAction from "../emailCronAction.js";
import type * as emailSequences from "../emailSequences.js";
import type * as emailSubscribers from "../emailSubscribers.js";
import type * as favorites from "../favorites.js";
import type * as gsc from "../gsc.js";
import type * as guidePurchases from "../guidePurchases.js";
import type * as http from "../http.js";
import type * as journeys from "../journeys.js";
import type * as metrics from "../metrics.js";
import type * as newsletter from "../newsletter.js";
import type * as pdfGenerator from "../pdfGenerator.js";
import type * as posthog from "../posthog.js";
import type * as premiumGuideContent from "../premiumGuideContent.js";
import type * as resend from "../resend.js";
import type * as seedWelcomeSequence from "../seedWelcomeSequence.js";
import type * as siteConfig from "../siteConfig.js";
import type * as stackAnalyzer from "../stackAnalyzer.js";
import type * as stripe from "../stripe.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminConfig: typeof adminConfig;
  adminSettings: typeof adminSettings;
  analysisCredits: typeof analysisCredits;
  analytics: typeof analytics;
  auth: typeof auth;
  crons: typeof crons;
  emailCron: typeof emailCron;
  emailCronAction: typeof emailCronAction;
  emailSequences: typeof emailSequences;
  emailSubscribers: typeof emailSubscribers;
  favorites: typeof favorites;
  gsc: typeof gsc;
  guidePurchases: typeof guidePurchases;
  http: typeof http;
  journeys: typeof journeys;
  metrics: typeof metrics;
  newsletter: typeof newsletter;
  pdfGenerator: typeof pdfGenerator;
  posthog: typeof posthog;
  premiumGuideContent: typeof premiumGuideContent;
  resend: typeof resend;
  seedWelcomeSequence: typeof seedWelcomeSequence;
  siteConfig: typeof siteConfig;
  stackAnalyzer: typeof stackAnalyzer;
  stripe: typeof stripe;
  subscriptions: typeof subscriptions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
