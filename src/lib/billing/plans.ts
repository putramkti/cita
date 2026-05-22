/**
 * Cita Billing — Plan & Feature catalog.
 *
 * Single source of truth for plan tiers and what each tier can do.
 * Add new features here, then call `entitlements.can(plan, "featureKey")`
 * from the gate site (API route, page guard, UI conditional).
 *
 * Adding a new plan or feature:
 *   1. Update `Plan` enum in schema.prisma + migrate.
 *   2. Add the new tier object to `PLANS` here.
 *   3. Add feature key to `FeatureKey` and set its value per plan.
 *   4. (UI) Update /pricing page card matrix.
 *   5. (Server) Use `entitlements.can(plan, "newFeature")` at the gate site.
 */

import type { Plan } from "@prisma/client";

/** All gateable features. Add new keys here as Premium expands. */
export type FeatureKey =
  | "tutorAccess" // can use Cita Tutor at all (anon=false)
  | "aiInsightPersonalized" // result page AI insight uses real LLM
  | "premiumBadge" // shown next to display name in UI
  // future flags (declared, not enforced yet)
  | "targetedDrill"
  | "spacedRepetition"
  | "unlimitedHistory"
  | "noAds";

export interface PlanFeatureMatrix {
  /** Is the user allowed to use the tutor at all? */
  tutorAccess: boolean;
  /** Daily tutor message quota (per Cita-internal user id). */
  tutorDailyQuota: number;
  /** AI Insight personalization (vs template) at result page. */
  aiInsightPersonalized: boolean;
  /** Show "Premium" badge in headers / leaderboard / profile. */
  premiumBadge: boolean;
  /** Phase 7.5+ (declared, off for now). */
  targetedDrill: boolean;
  spacedRepetition: boolean;
  unlimitedHistory: boolean; // history is unlimited for everyone today
  noAds: boolean;
}

export interface PlanCatalog {
  /** Unique plan id, matches Prisma `Plan` enum. */
  id: Plan | "ANON";
  /** Marketing name (Indonesian by default; localize at view layer). */
  labelId: string;
  labelEn: string;
  /** Tagline shown on pricing card. */
  taglineId: string;
  taglineEn: string;
  /** Monthly price in IDR. 0 for FREE / ANON. */
  priceIdr: number;
  /** Whether this plan is purchasable via Midtrans. */
  purchasable: boolean;
  features: PlanFeatureMatrix;
}

const ANON_FEATURES: PlanFeatureMatrix = {
  tutorAccess: false,
  tutorDailyQuota: 0,
  aiInsightPersonalized: false,
  premiumBadge: false,
  targetedDrill: false,
  spacedRepetition: false,
  unlimitedHistory: true,
  noAds: false,
};

const FREE_FEATURES: PlanFeatureMatrix = {
  tutorAccess: true,
  tutorDailyQuota: 5,
  aiInsightPersonalized: false,
  premiumBadge: false,
  targetedDrill: false,
  spacedRepetition: false,
  unlimitedHistory: true,
  noAds: false,
};

const PREMIUM_FEATURES: PlanFeatureMatrix = {
  tutorAccess: true,
  tutorDailyQuota: 50,
  aiInsightPersonalized: true,
  premiumBadge: true,
  // declared off, ship later:
  targetedDrill: false,
  spacedRepetition: false,
  unlimitedHistory: true,
  noAds: false,
};

export const PLANS: Record<"ANON" | Plan, PlanCatalog> = {
  ANON: {
    id: "ANON",
    labelId: "Tamu",
    labelEn: "Guest",
    taglineId: "Coba tryout tanpa daftar",
    taglineEn: "Try a tryout without signing up",
    priceIdr: 0,
    purchasable: false,
    features: ANON_FEATURES,
  },
  FREE: {
    id: "FREE",
    labelId: "Gratis",
    labelEn: "Free",
    taglineId: "Untuk yang baru mulai persiapan",
    taglineEn: "For learners getting started",
    priceIdr: 0,
    purchasable: false,
    features: FREE_FEATURES,
  },
  PREMIUM: {
    id: "PREMIUM",
    labelId: "Premium",
    labelEn: "Premium",
    taglineId: "Untuk yang serius lulus SKD",
    taglineEn: "For serious SKD candidates",
    priceIdr: 50_000,
    purchasable: true,
    features: PREMIUM_FEATURES,
  },
};

/**
 * Default duration when an Order grants Premium access.
 * Source of truth for both pricing UI and Midtrans Order creation.
 */
export const PREMIUM_DURATION_DAYS = 30;

/** All plans displayed on /pricing in display order. */
export const PRICING_TIERS: PlanCatalog[] = [PLANS.FREE, PLANS.PREMIUM];
