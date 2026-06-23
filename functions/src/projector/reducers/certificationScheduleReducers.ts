import type { UserEvent } from "../eventProjector";
import type { CardScheduleView } from "./cardReducers";
import {
  CERTIFICATION_SCHEDULE_DEFAULTS,
  type CertificationResult,
  type CertificationScheduleAction,
} from "../../core/certification/certificationSchedulePolicy";

export interface CertificationScheduleContext {
  certificationResult: CertificationResult;
  action: CertificationScheduleAction;
}

function farFutureDueDate(days: number): string {
  const due = new Date();
  due.setDate(due.getDate() + days);
  return due.toISOString();
}

function acceleratedDueDate(stability: number): string {
  const due = new Date();
  due.setDate(due.getDate() + Math.max(1, Math.floor(stability)));
  return due.toISOString();
}

/**
 * Apply certification scheduling policy to a card schedule view.
 * Returns null when no write is needed.
 */
export function reduceCertificationScheduleEffect(
  prev: CardScheduleView | undefined,
  cardId: string,
  event: UserEvent,
  context: CertificationScheduleContext
): CardScheduleView | null {
  if (prev?.certification_event_id === event.event_id) {
    return null;
  }

  const { action, certificationResult } = context;

  if (action === "unchanged") {
    return null;
  }

  if (action === "clear") {
    if (!prev?.suppressed && !prev?.certification_applied) {
      return null;
    }

    const cleared: CardScheduleView = {
      ...(prev ?? createBaseSchedule(cardId, event)),
      suppressed: false,
      suppression_reason: undefined,
      certification_applied: false,
      certification_result: undefined,
      certification_event_id: event.event_id,
      last_applied: {
        received_at: event.received_at,
        event_id: event.event_id,
      },
      updated_at: new Date().toISOString(),
    };

    if (!prev) {
      return null;
    }

    return cleared;
  }

  if (action === "suppress") {
    const stability = CERTIFICATION_SCHEDULE_DEFAULTS.suppressedStability;
    const intervalDays = CERTIFICATION_SCHEDULE_DEFAULTS.suppressedIntervalDays;

    return {
      ...(prev ?? createBaseSchedule(cardId, event)),
      type: "card_schedule_view",
      card_id: cardId,
      library_id: event.library_id,
      user_id: event.user_id,
      state: 3,
      due_at: farFutureDueDate(intervalDays),
      stability,
      difficulty: prev?.difficulty ?? 5,
      interval_days: intervalDays,
      last_reviewed_at: prev?.last_reviewed_at ?? event.occurred_at,
      last_grade: prev?.last_grade ?? "good",
      suppressed: true,
      suppression_reason:
        certificationResult === "full"
          ? "certification_full"
          : "certification_partial",
      certification_applied: true,
      certification_result: certificationResult,
      certification_event_id: event.event_id,
      last_applied: {
        received_at: event.received_at,
        event_id: event.event_id,
      },
      updated_at: new Date().toISOString(),
    };
  }

  // accelerate
  const baseStability =
    prev?.stability ??
    (certificationResult === "full"
      ? CERTIFICATION_SCHEDULE_DEFAULTS.fullAcceleratedStability
      : CERTIFICATION_SCHEDULE_DEFAULTS.partialAcceleratedStability);

  const factor =
    certificationResult === "full"
      ? CERTIFICATION_SCHEDULE_DEFAULTS.fullAccelerationFactor
      : CERTIFICATION_SCHEDULE_DEFAULTS.partialAccelerationFactor;

  const newStability = Math.max(baseStability, baseStability * factor);
  const intervalDays = Math.max(1, Math.floor(newStability));

  return {
    ...(prev ?? createBaseSchedule(cardId, event)),
    type: "card_schedule_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: Math.max(prev?.state ?? 2, 2),
    due_at: acceleratedDueDate(newStability),
    stability: newStability,
    difficulty: prev?.difficulty ?? 5,
    interval_days: intervalDays,
    last_reviewed_at: prev?.last_reviewed_at ?? event.occurred_at,
    last_grade: prev?.last_grade ?? "good",
    suppressed: false,
    suppression_reason: undefined,
    certification_applied: true,
    certification_result: certificationResult,
    certification_event_id: event.event_id,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

function createBaseSchedule(cardId: string, event: UserEvent): CardScheduleView {
  return {
    type: "card_schedule_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: 0,
    due_at: new Date().toISOString(),
    stability: 1,
    difficulty: 5,
    interval_days: 1,
    last_reviewed_at: event.occurred_at,
    last_grade: "good",
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

/**
 * Revoke certification suppression when a related card fails review (§13.8).
 * Returns null when no write is needed.
 */
export function reduceCertificationSuppressionRevocation(
  prev: CardScheduleView | undefined,
  event: UserEvent
): CardScheduleView | null {
  if (!prev?.suppressed) {
    return null;
  }

  if (prev.last_applied.event_id === event.event_id) {
    return null;
  }

  const due = new Date();
  due.setDate(due.getDate() + 1);

  return {
    ...prev,
    state: 1,
    due_at: due.toISOString(),
    stability: 1,
    interval_days: 1,
    suppressed: false,
    suppression_reason: undefined,
    certification_applied: false,
    certification_result: undefined,
    certification_event_id: undefined,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}
