import type { CardScheduleView } from "../../projector/reducers/cardReducers";
import type { LibraryCardMeta } from "../../content/libraryCatalog";

export type CertificationResult = "full" | "partial" | "none";
export type CertificationScheduleAction = "suppress" | "accelerate" | "unchanged" | "clear";

/** Organizer §13.6 — suppression requires prior exposure or CLKT seed. */
export function hasSuppressionEvidence(
  schedule: CardScheduleView | undefined
): boolean {
  if (!schedule) {
    return false;
  }

  if (schedule.state !== 0) {
    return true;
  }

  const seededStability = schedule.transfer_state?.seeded_stability;
  return typeof seededStability === "number" && seededStability > 0;
}

/**
 * Downgrade suppress → accelerate when the evidence floor is not met (§13.6).
 */
export function resolveCertificationScheduleAction(
  result: CertificationResult,
  meta: LibraryCardMeta,
  schedule: CardScheduleView | undefined
): CertificationScheduleAction {
  const action = classifyCertificationScheduleAction(result, meta);
  if (action !== "suppress" || hasSuppressionEvidence(schedule)) {
    return action;
  }

  // Never-seen cards may only be accelerated, not suppressed.
  if (
    meta.cardTier === "extension" ||
    meta.pedagogicalRole === "integration" ||
    meta.pedagogicalRole === "synthesis" ||
    meta.pedagogicalRole === "application"
  ) {
    return "accelerate";
  }

  return "unchanged";
}

const INTRODUCTORY_ROLES = new Set(["recall", "recognition", "establishment"]);

/**
 * Classify how certification should affect a card's schedule.
 * Aligns with organizer §13.7:
 * - full: suppress core/certification/remedial; accelerate extension/integration nuance
 * - partial: suppress introductory core; accelerate relationship/nuance cards
 * - none: clear prior certification scheduling marks
 */
export function classifyCertificationScheduleAction(
  result: CertificationResult,
  meta: LibraryCardMeta
): CertificationScheduleAction {
  if (result === "none") {
    return "clear";
  }

  if (result === "full") {
    if (
      meta.cardTier === "core" ||
      meta.cardTier === "certification" ||
      meta.cardTier === "remedial"
    ) {
      return "suppress";
    }
    if (meta.cardTier === "extension") {
      return "accelerate";
    }
    return INTRODUCTORY_ROLES.has(meta.pedagogicalRole) ? "suppress" : "accelerate";
  }

  // partial — most common
  if (meta.cardTier === "certification" || meta.cardTier === "remedial") {
    return "suppress";
  }

  if (
    meta.cardTier === "core" &&
    INTRODUCTORY_ROLES.has(meta.pedagogicalRole)
  ) {
    return "suppress";
  }

  if (
    meta.cardTier === "extension" ||
    meta.pedagogicalRole === "integration" ||
    meta.pedagogicalRole === "synthesis" ||
    meta.pedagogicalRole === "application"
  ) {
    return "accelerate";
  }

  return "unchanged";
}

export const CERTIFICATION_SCHEDULE_DEFAULTS = {
  suppressedStability: 90,
  suppressedIntervalDays: 365,
  partialAcceleratedStability: 21,
  fullAcceleratedStability: 45,
  partialAccelerationFactor: 1.5,
  fullAccelerationFactor: 2,
} as const;
