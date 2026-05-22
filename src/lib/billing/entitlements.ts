/**
 * Cita Billing — Entitlement checks.
 *
 * Resolve "what can this user do" given an authenticated user (or anon).
 *
 *   const plan = await getCurrentPlan(userId);
 *   if (!entitlements.can(plan, "tutorAccess")) return 403;
 *
 * Server-only. Don't import from client components.
 */

import "server-only";
import type { Plan } from "@prisma/client";
import { PLANS, type FeatureKey, type PlanFeatureMatrix } from "./plans";

export type ResolvedPlan = "ANON" | Plan;

/**
 * Extracts the boolean value of a feature flag for a plan.
 * For numeric quotas (tutorDailyQuota), use {@link quota} instead.
 */
export function can(plan: ResolvedPlan, feature: FeatureKey): boolean {
  const matrix = PLANS[plan].features;
  const value = matrix[feature as keyof PlanFeatureMatrix];
  // Treat truthy non-zero number as enabled (rare — use quota() for numbers).
  if (typeof value === "number") return value > 0;
  return Boolean(value);
}

/** Numeric feature lookups (quotas). */
export function quota(
  plan: ResolvedPlan,
  feature: "tutorDailyQuota",
): number {
  return PLANS[plan].features[feature];
}
